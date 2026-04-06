import { check, sleep } from 'k6';
import { memberLogin } from '../utils/auth.js';
import { authedPost } from '../utils/http.js';
import { MEMBER_USERS, RACE_GYM_ID, RACE_EQUIPMENT_IDS } from '../data/users.js';
import {
  equipRaceSuccesses,
  serverErrors,
  equipWinnerDuration,
  equipLoserDuration,
} from './metrics.js';

/**
 * [동시성 테스트] 기구 동시 사용 충돌 — 다중 타겟
 *
 * 40 VU를 두 그룹으로 분할:
 *   VU  1-20 (vuIndex  0-19) → equipmentId=5001
 *   VU 21-40 (vuIndex 20-39) → equipmentId=5002
 *
 * 각 그룹 내 20 VU가 동일 기구를 동시 사용 시도.
 * 검증:
 *  - 201은 그룹당 최대 1회 (equip_race_successes ≤ 2)
 *  - 나머지는 409 Conflict
 *  - 500은 0
 *  - 두 그룹 간 비간섭 (5001 경쟁이 5002 경쟁에 영향 없어야 함)
 *  - 승자 이중 진입 시도: 409 차단 검증
 *  - cleanup: end + checkout 응답 코드 검증
 */
export function equipmentRaceFlow(sessions) {
  const vuIndex  = (__VU - 1) % sessions.length;  // 0-based, 범위: 0..39
  const targetId = RACE_EQUIPMENT_IDS[vuIndex < 20 ? 0 : 1];
  const session  = sessions[vuIndex];
  if (!session) return;

  const res = authedPost(
    `/equipments/${targetId}/usages`,
    session.accessToken,
    null,
    { tags: { endpoint: 'equipUsage', scenario: 'equipment_race' } }
  );

  check(res, {
    'no 5xx': (r) => r.status < 500,
    'winner(201) or loser(4xx)': (r) => r.status === 201 || (r.status >= 400 && r.status < 500),
  });

  if (res.status >= 500) {
    serverErrors.add(1);
    return;
  }

  if (res.status === 201) {
    equipRaceSuccesses.add(1);
    equipWinnerDuration.add(res.timings.duration);

    const usageId = res.json('usageId');

    console.info(`[WINNER-EQUIP] VU:${__VU} -> Target:${targetId} (UsageID:${usageId})`);

    // 이중 진입 차단 검증: 사용 중인 기구에 재진입 시도 → 409여야 함
    const doubleRes = authedPost(
      `/equipments/${targetId}/usages`,
      session.accessToken,
      null,
      { tags: { endpoint: 'equipDoubleEntry', scenario: 'equipment_race' } }
    );
    check(doubleRes, {
      'double-entry blocked(409)': (r) => r.status === 409,
    });

    // cleanup: 사용 종료 + 퇴장
    const endRes = authedPost(`/equipments/usages/${usageId}/end`, session.accessToken, null);
    check(endRes, { 'usage end ok': (r) => r.status === 200 || r.status === 204 });

    const checkoutRes = authedPost(`/gyms/${RACE_GYM_ID}/checkout`, session.accessToken, null);
    check(checkoutRes, { 'checkout ok': (r) => r.status === 200 || r.status === 204 });

  } else {
    equipLoserDuration.add(res.timings.duration);
  }
}

/**
 * setup()에서 호출: 40개의 멤버 세션을 준비하고 체크인 완료.
 * MEMBER_USERS[0..39] 사용 (라커 경쟁 [40..59]와 겹치지 않음).
 * 로그인 실패 시 null push → 인덱스 정렬 유지.
 */
export function prepareEquipmentRaceSessions(count) {
  const sessions = [];
  for (let i = 0; i < count; i++) {
    const user    = MEMBER_USERS[i];
    const session = memberLogin(user.email, user.password);
    if (session) {
      authedPost(`/gyms/${RACE_GYM_ID}/checkin`, session.accessToken, null);
      // sleep(0.1);
      sessions.push(session);
    } else {
      sessions.push(null);
    }
  }
  return sessions;
}

