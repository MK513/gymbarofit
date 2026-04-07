import { check, sleep } from 'k6';
import { memberLogin } from '../utils/auth.js';
import { authedGet, authedPost } from '../utils/http.js';
import {
  STRESS_USAGE_USERS, STRESS_USAGE_EQUIPMENTS,
  LOAD_EQUIPMENT_USERS, LOAD_EQUIPMENT_IDS,
  TEST_GYM_IDS,
} from '../data/users.js';

// VU당 세션 캐시 — 매 이터레이션 로그인 방지
let _session = null;

/**
 * 기구 사용 전체 라이프사이클 플로우
 * login → checkin → createUsage → (workout) → endUsage → checkout
 */
function equipmentUsageInternal(userPool, equipPool) {
  if (!_session) {
    const user = userPool[(__VU - 1) % userPool.length];
    _session = memberLogin(user.email, user.password);
  }
  //console.log(`[equipmentUsage] [VU:${__VU}] userPool Length: ${userPool.length}, target index: ${(__VU - 1) % userPool.length}`);
  const session = _session;
  if (!session) return;

  const gymId       = TEST_GYM_IDS[0];
  const equipmentId = equipPool[(__VU - 1) % equipPool.length];

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

  sleep(1);

  // 1. 체크인
  const checkinRes = authedPost(
    `/gyms/${gymId}/checkin`,
    session.accessToken,
    null,
    { tags: { endpoint: 'checkin' } }
  );
  const checkinOk = check(checkinRes, { 'checkin 2xx': (r) => r.status >= 200 && r.status < 300 });
  if (!checkinOk) return; // 체크인 실패 시 이후 checkout 호출로 인한 NOT_CHECKED_IN 방지

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

export function equipmentUsageFlowStress() { equipmentUsageInternal(STRESS_USAGE_USERS, STRESS_USAGE_EQUIPMENTS); }
export function equipmentUsageFlowLoad()   { equipmentUsageInternal(LOAD_EQUIPMENT_USERS, LOAD_EQUIPMENT_IDS); }
