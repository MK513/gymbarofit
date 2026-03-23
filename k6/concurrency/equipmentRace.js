import { check } from 'k6';
import { memberLogin } from '../utils/auth.js';
import { authedPost } from '../utils/http.js';
import { MEMBER_USERS, RACE_GYM_ID, RACE_EQUIPMENT_ID } from '../data/users.js';
import { raceSuccesses, serverErrors } from './metrics.js';

/**
 * [동시성 테스트] 기구 동시 사용 충돌
 *
 * 20개 VU가 동시에 equipmentId=1 사용 시작 시도.
 * 검증:
 *  - 201은 최대 1번만 (race_successes ≤ 1)
 *  - 나머지는 409 Conflict
 *  - 500은 0
 */
export function equipmentRaceFlow(sessions) {
  const vuIndex = __VU - 1;
  const session = sessions[vuIndex % sessions.length];
  if (!session) return;

  // 모든 VU가 동일 기구에 동시 사용 시도
  const res = authedPost(
    `/equipments/${RACE_EQUIPMENT_ID}/usages`,
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
    raceSuccesses.add(1);
    const usageId = res.json('usageId');

    // 승자: 즉시 사용 종료 → 다음 테스트를 위해 리소스 반납
    authedPost(`/equipments/usages/${usageId}/end`, session.accessToken, null);
    authedPost(`/gyms/${RACE_GYM_ID}/checkout`, session.accessToken, null);
  }
}

/**
 * setup() 에서 호출: N개의 멤버 세션을 미리 준비하고 체크인까지 완료.
 */
export function prepareEquipmentRaceSessions(count) {
  const sessions = [];
  for (let i = 0; i < count; i++) {
    const user = MEMBER_USERS[i % MEMBER_USERS.length];
    const session = memberLogin(user.email, user.password);
    if (session) {
      authedPost(`/gyms/${RACE_GYM_ID}/checkin`, session.accessToken, null);
      sessions.push(session);
    }
  }
  return sessions;
}
