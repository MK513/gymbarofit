import { check } from 'k6';
import { memberLogin } from '../utils/auth.js';
import { authedPost, authedDelete } from '../utils/http.js';
import { MEMBER_USERS, RACE_GYM_ID, RACE_LOCKER_ID } from '../data/users.js';
import { raceSuccesses, serverErrors } from './metrics.js';

/**
 * [동시성 테스트] 라커 동시 대여 충돌
 *
 * 10개 VU가 동시에 lockerId=1 대여 시도.
 * 검증:
 *  - 200은 최대 1번만 (race_successes ≤ 1)
 *  - 나머지는 409 Conflict
 *  - 500은 0
 */
export function lockerRaceFlow(sessions) {
  const vuIndex = __VU - 1;
  const session = sessions[vuIndex % sessions.length];
  if (!session) return;

  const res = authedPost(
    '/lockers/usages',
    session.accessToken,
    {
      gymId:         RACE_GYM_ID,
      lockerId:      RACE_LOCKER_ID,
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
    raceSuccesses.add(1);
    const usageId = res.json('usageId');

    // 승자: 즉시 환불 → 다음 테스트를 위해 라커 반납
    authedDelete(`/lockers/usages/${usageId}`, session.accessToken);
  }
}

/**
 * setup() 에서 호출: N개의 멤버 세션을 미리 준비.
 */
export function prepareLockerRaceSessions(count) {
  const sessions = [];
  for (let i = 0; i < count; i++) {
    const user = MEMBER_USERS[i % MEMBER_USERS.length];
    const session = memberLogin(user.email, user.password);
    if (session) sessions.push(session);
  }
  return sessions;
}
