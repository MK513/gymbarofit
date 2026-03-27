import { check, sleep } from 'k6';
import { memberLogin } from '../utils/auth.js';
import { authedGet, authedPost } from '../utils/http.js';
import { MEMBER_USERS, TEST_GYM_IDS, TEST_EQUIPMENT_IDS } from '../data/users.js';
import exec from 'k6/execution';

// VU당 세션 캐시 — 매 이터레이션 로그인 방지
let _session = null;

/**
 * 기구 사용 전체 라이프사이클 플로우
 * login → checkin → createUsage → (workout) → endUsage → checkout
 */
export function equipmentUsageFlow(userPool = MEMBER_USERS, equipPool) {
  const index = exec.scenario.iterationInInstance;
  if (!_session) {
    const user = userPool[index % userPool.length];
    _session = memberLogin(user.email, user.password);
  }
  const session = _session;
  if (!session) return;

  const gymId       = TEST_GYM_IDS[0];
  const equipmentId = equipPool[index % equipPool.length];

  // ── 이전 이터레이션 잔여 상태 정리 ──────────────────────────────────────────
  const activeRes = authedGet(`/equipments/usages/active`, session.accessToken);
  if (activeRes.status === 200) {
    const prevUsageId = activeRes.json('usageId');
    authedPost(`/equipments/usages/${prevUsageId}/end`, session.accessToken, null);
    sleep(1);
  }

  const statusRes = authedGet(`/gyms/${gymId}/checkin/status`, session.accessToken);
  if (statusRes.status === 200 && statusRes.json('checkedIn')) {
    authedPost(`/gyms/${gymId}/checkout`, session.accessToken, null);
    sleep(1);
  }
  // ──────────────────────────────────────────────────────────────────────────

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
  if (!usageId) {
    authedPost(`/gyms/${gymId}/checkout`, session.accessToken, null);
    return;
  }

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
