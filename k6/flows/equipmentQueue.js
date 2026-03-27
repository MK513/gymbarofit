import { check, sleep } from 'k6';
import { memberLogin } from '../utils/auth.js';
import { authedGet, authedPost } from '../utils/http.js';
import { MEMBER_USERS, TEST_GYM_IDS, TEST_EQUIPMENT_IDS } from '../data/users.js';
import exec from 'k6/execution';

/**
 * 기구 대기 큐 플로우 (2-유저 시뮬레이션)
 *
 * A유저 (앞사람): login → checkin → startUsage (사용 중 상태 진입)
 * B유저 (대기자): login → checkin → joinQueue (대기 상태)
 * A유저 (앞사람): endUsage  ← 이 시점에 B의 상태가 CALLED로 전환
 * B유저 (대기자): sleep → startUsage → endUsage → checkout
 * A유저 (앞사람): checkout
 *
 * NOTE: 한 VU가 A/B 두 역할을 순차 수행. A와 B는 동일 기구를 사용.
 */

// VU당 세션 캐시 — 매 이터레이션 로그인 방지
let _sessions = null;

export function equipmentQueueFlow(userPool = MEMBER_USERS, equipPool) {
  const index = exec.scenario.iterationInInstance;
  if (!_sessions) {
    const baseIdx = (index * 2) % userPool.length;
    
    const userA = userPool[baseIdx];
    const userB = userPool[(baseIdx + 1) % userPool.length];

    const sessionA = memberLogin(userA.email, userA.password);
    if (!sessionA) return;
    const sessionB = memberLogin(userB.email, userB.password);
    if (!sessionB) return;
    _sessions = { sessionA, sessionB };
  }
  const { sessionA, sessionB } = _sessions;

  const gymId       = TEST_GYM_IDS[0];
  const equipmentId = equipPool[index % equipPool.length];

  // ── 이전 이터레이션 잔여 상태 정리 ──────────────────────
  for (const session of [sessionA, sessionB]) {
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
  }
  // ──────────────────────────────────────────────────────

  // ── 체크인 ──────────────────────────────────────────────
  authedPost(`/gyms/${gymId}/checkin`, sessionA.accessToken, null,
    { tags: { endpoint: 'checkin' } });
  authedPost(`/gyms/${gymId}/checkin`, sessionB.accessToken, null,
    { tags: { endpoint: 'checkin' } });

  sleep(1);

  // ── A: 기구 직접 사용 시작 (IN_USE 상태 진입) ────────────
  const startResA = authedPost(
    `/equipments/${equipmentId}/usages`,
    sessionA.accessToken,
    null,
    { tags: { endpoint: 'startUsage_A' } }
  );
  const startedA = check(startResA, { 'A startUsage 2xx': (r) => r.status >= 200 && r.status < 300 });

  if (!startedA) {
    authedPost(`/gyms/${gymId}/checkout`, sessionA.accessToken, null);
    authedPost(`/gyms/${gymId}/checkout`, sessionB.accessToken, null);
    return;
  }

  const usageIdA = startResA.json('usageId');
  if (!usageIdA) {
    authedPost(`/gyms/${gymId}/checkout`, sessionA.accessToken, null);
    authedPost(`/gyms/${gymId}/checkout`, sessionB.accessToken, null);
    return;
  }

  sleep(1);

  // ── B: 대기 큐 등록 (WAITING 상태) ──────────────────────
  const queueRes = authedPost(
    `/equipments/${equipmentId}/usages/wait`,
    sessionB.accessToken,
    null,
    { tags: { endpoint: 'joinQueue' } }
  );
  const joined = check(queueRes, { 'B joinQueue 201': (r) => r.status === 201 });

  if (!joined) {
    authedPost(`/equipments/usages/${usageIdA}/end`, sessionA.accessToken, null,
      { tags: { endpoint: 'equipEnd_A' } });
    authedPost(`/gyms/${gymId}/checkout`, sessionA.accessToken, null);
    authedPost(`/gyms/${gymId}/checkout`, sessionB.accessToken, null);
    return;
  }

  const usageIdB = queueRes.json('usageId');
  if (!usageIdB) {
    authedPost(`/equipments/usages/${usageIdA}/end`, sessionA.accessToken, null,
      { tags: { endpoint: 'equipEnd_A' } });
    authedPost(`/gyms/${gymId}/checkout`, sessionA.accessToken, null);
    authedPost(`/gyms/${gymId}/checkout`, sessionB.accessToken, null);
    return;
  }

  sleep(3); // A의 운동 시간 시뮬레이션

  // ── A: 사용 종료 → 이 시점에 B의 상태가 CALLED로 전환 ───
  authedPost(`/equipments/usages/${usageIdA}/end`, sessionA.accessToken, null,
    { tags: { endpoint: 'equipEnd_A' } });

  sleep(5); // 서버의 CALLED 상태 전환 처리 대기 (스트레스 부하 고려해 2s→5s)

  // ── B: CALLED 상태에서 사용 시작 ────────────────────────
  const startResB = authedPost(
    `/equipments/usages/${usageIdB}/start`,
    sessionB.accessToken,
    null,
    { tags: { endpoint: 'startUsage_B' } }
  );
  const startedB = check(startResB, { 'B startUsage 2xx': (r) => r.status >= 200 && r.status < 300 });

  if (startedB) {
    sleep(5); // B의 운동 시간

    authedPost(`/equipments/usages/${usageIdB}/end`, sessionB.accessToken, null,
      { tags: { endpoint: 'equipEnd_B' } });
  } else {
    authedPost(`/equipments/usages/${usageIdB}/cancel`, sessionB.accessToken, null);
  }

  // ── 체크아웃 ─────────────────────────────────────────────
  authedPost(`/gyms/${gymId}/checkout`, sessionA.accessToken, null,
    { tags: { endpoint: 'checkout' } });
  authedPost(`/gyms/${gymId}/checkout`, sessionB.accessToken, null,
    { tags: { endpoint: 'checkout' } });

  sleep(2);
}
