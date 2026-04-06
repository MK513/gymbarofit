import { check } from 'k6';
import { memberLogin } from '../utils/auth.js';
import { authedPost, authedDelete } from '../utils/http.js';
import { MEMBER_USERS, RACE_GYM_ID, RACE_LOCKER_IDS } from '../data/users.js';
import {
  lockerRaceSuccesses,
  serverErrors,
  lockerWinnerDuration,
  lockerLoserDuration,
} from './metrics.js';

/**
 * [동시성 테스트] 라커 동시 대여 충돌 — 다중 타겟
 *
 * 20 VU를 두 그룹으로 분할:
 *   VU  1-10 (vuIndex  0-9)  → lockerId=5001
 *   VU 11-20 (vuIndex 10-19) → lockerId=5002
 *
 * 각 그룹 내 10 VU가 동일 라커를 동시 대여 시도.
 * 검증:
 *  - 200은 그룹당 최대 1회 (locker_race_successes ≤ 2)
 *  - 나머지는 409 Conflict
 *  - 500은 0
 *  - 승자 이중 진입 시도: 409 차단 검증
 *  - cleanup: DELETE 응답 코드 검증
 */
export function lockerRaceFlow(sessions) {
  const vuIndex  = (__VU - 1) % sessions.length;  // 0-based, 범위: 0..19
  const lockerId = RACE_LOCKER_IDS[vuIndex < 10 ? 0 : 1];
  const session  = sessions[vuIndex];
  if (!session) return;

  const res = authedPost(
    '/lockers/usages',
    session.accessToken,
    {
      gymId:         RACE_GYM_ID,
      lockerId:      lockerId,
      plan:          'MONTH_1',
      paymentMethod: 'CARD',
    },
    { tags: { endpoint: 'lockerRent', scenario: 'locker_race' } }
  );

  check(res, {
    'no 5xx': (r) => r.status < 500,
    'winner(200) or loser(4xx)': (r) => r.status === 200 || (r.status >= 400 && r.status < 500),
  });

  if (res.status >= 500) {
    serverErrors.add(1);
    return;
  }

  if (res.status === 200) {
    lockerRaceSuccesses.add(1);
    lockerWinnerDuration.add(res.timings.duration);

    const usageId = res.json('usageId');

    console.info(`[WINNER-LOCKER] VU:${__VU} -> Target:${lockerId} (UsageID:${usageId})`);

    // 이중 진입 차단 검증: 이미 대여 중인 라커 재대여 시도 → 409여야 함
    const doubleRes = authedPost(
      '/lockers/usages',
      session.accessToken,
      {
        gymId:         RACE_GYM_ID,
        lockerId:      lockerId,
        plan:          'MONTH_1',
        paymentMethod: 'CARD',
      },
      { tags: { endpoint: 'lockerDoubleEntry', scenario: 'locker_race' } }
    );
    check(doubleRes, {
      'double-entry blocked(409)': (r) => r.status === 409,
    });

    // cleanup: 라커 반납 (환불)
    // waitTime=0 덕분에 다른 VU들은 이미 즉시 실패 → cleanup 타이밍 경합 없음
    const deleteRes = authedDelete(`/lockers/usages/${usageId}`, session.accessToken);
    check(deleteRes, { 'locker cleanup ok': (r) => r.status === 200 || r.status === 204 });

  } else {
    lockerLoserDuration.add(res.timings.duration);
  }
}

/**
 * setup()에서 호출: 20개의 멤버 세션을 준비.
 * MEMBER_USERS[40..59] 사용 (기구 경쟁 [0..39]와 겹치지 않음).
 * 로그인 실패 시 null push → 인덱스 정렬 유지.
 */
export function prepareLockerRaceSessions(count) {
  const OFFSET   = 40;
  const sessions = [];
  for (let i = 0; i < count; i++) {
    const user    = MEMBER_USERS[OFFSET + i];
    const session = memberLogin(user.email, user.password);
    sessions.push(session || null);
  }
  return sessions;
}
