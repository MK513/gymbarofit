import { check, sleep } from 'k6';
import { memberLogin } from '../utils/auth.js';
import { authedPost } from '../utils/http.js';
import { MEMBER_USERS, TEST_GYM_IDS, TEST_EQUIPMENT_IDS } from '../data/users.js';

/**
 * 기구 사용 전체 라이프사이클 플로우
 * login → checkin → createUsage → (workout) → endUsage → checkout
 */
export function equipmentUsageFlow() {
  const user = MEMBER_USERS[(__VU - 1) % MEMBER_USERS.length];
  const session = memberLogin(user.email, user.password);
  if (!session) return;

  const gymId       = TEST_GYM_IDS[0];
  const equipmentId = TEST_EQUIPMENT_IDS[(__VU - 1) % TEST_EQUIPMENT_IDS.length];

  sleep(1);

  // 1. 체크인
  const checkinRes = authedPost(
    `/gyms/${gymId}/checkin`,
    session.accessToken,
    null,
    { tags: { endpoint: 'checkin' } }
  );
  check(checkinRes, { 'checkin 2xx': (r) => r.status >= 200 && r.status < 300 });

  sleep(1);

  // 2. 기구 사용 시작
  const usageRes = authedPost(
    `/equipments/${equipmentId}/usages`,
    session.accessToken,
    null,
    { tags: { endpoint: 'equipUsage' } }
  );
  const created = check(usageRes, { 'createUsage 201': (r) => r.status === 201 });

  if (!created) {
    // 기구 사용 중 → gracefully 종료 후 checkout
    authedPost(`/gyms/${gymId}/checkout`, session.accessToken, null);
    return;
  }

  const usageId = usageRes.json('usageId');

  sleep(Math.random() * 5 + 2); // 운동 시간 시뮬레이션

  // 3. 기구 사용 종료
  const endRes = authedPost(
    `/equipments/usages/${usageId}/end`,
    session.accessToken,
    null,
    { tags: { endpoint: 'equipEnd' } }
  );
  check(endRes, { 'endUsage 204': (r) => r.status === 204 });

  sleep(1);

  // 4. 체크아웃
  const checkoutRes = authedPost(
    `/gyms/${gymId}/checkout`,
    session.accessToken,
    null,
    { tags: { endpoint: 'checkout' } }
  );
  check(checkoutRes, { 'checkout 2xx': (r) => r.status >= 200 && r.status < 300 });

  sleep(2);
}
