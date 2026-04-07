import { check, sleep } from 'k6';
import { memberLogin } from '../utils/auth.js';
import { authedGet, authedPost } from '../utils/http.js';
import { STRESS_QUEUE_USERS, STRESS_QUEUE_EQUIPMENTS, TEST_GYM_IDS } from '../data/users.js';

// VU당 세션 캐시 — 매 이터레이션 로그인 방지
let _sessions = null;
// B의 이전 이터레이션 usageId 추적 (비정상 종료 시 cancel 보장용)
let _prevUsageIdB = null;

// ── 헬퍼 ────────────────────────────────────────────────────

function checkoutBoth(sessionA, sessionB, gymId) {
  authedPost(`/gyms/${gymId}/checkout`, sessionA.accessToken, null);
  authedPost(`/gyms/${gymId}/checkout`, sessionB.accessToken, null);
}

function cleanupPrev(sessionA, sessionB, gymId) {
  // B의 CALLED/WAITING 잔류 cancel (getActiveUsage는 IN_USE만 반환하므로 별도 처리)
  if (_prevUsageIdB !== null) {
    const res = authedPost(`/equipments/usages/${_prevUsageIdB}/cancel`, sessionB.accessToken, null);
    // 5xx가 아니면 처리됨으로 간주 (204: 정상, 4xx: 이미 완료)
    if (res.status < 500) _prevUsageIdB = null;
    sleep(1);
  }

  // A/B active usage 종료 및 체크아웃
  for (const session of [sessionA, sessionB]) {
    const activeRes = authedGet(`/equipments/usages/active`, session.accessToken);
    if (activeRes.status === 200) {
      authedPost(`/equipments/usages/${activeRes.json('usageId')}/end`, session.accessToken, null);
      sleep(1);
    }
    const statusRes = authedGet(`/gyms/${gymId}/checkin/status`, session.accessToken);
    if (statusRes.status === 200 && statusRes.json('checkedIn')) {
      authedPost(`/gyms/${gymId}/checkout`, session.accessToken, null);
      sleep(1);
    }
  }
}

// ── 메인 플로우 ──────────────────────────────────────────────

/**
 * 기구 대기 큐 플로우 (2-유저 시뮬레이션)
 *
 * A (앞사람): checkin → startUsage (IN_USE)
 * B (대기자): checkin → joinQueue  (WAITING)
 * A: endUsage  → B 상태가 CALLED로 전환
 * B: startUsage → endUsage → checkout
 * A: checkout
 *
 * 한 VU가 A/B 두 역할을 순차 수행. A와 B는 동일 기구를 사용.
 */
export function equipmentQueueFlow() {
  const userPool  = STRESS_QUEUE_USERS;
  const equipPool = STRESS_QUEUE_EQUIPMENTS;
  const gymId     = TEST_GYM_IDS[0];

  // 세션 초기화 (이터레이션 최초 1회)
  if (!_sessions) {
    const baseIdx = ((__VU - 1) * 2) % userPool.length;
    const userA = userPool[baseIdx];
    const userB = userPool[(baseIdx + 1) % userPool.length];

    const sessionA = memberLogin(userA.email, userA.password);
    if (!sessionA) return;
    const sessionB = memberLogin(userB.email, userB.password);
    if (!sessionB) return;

    _sessions = { sessionA, sessionB };
  }
  const { sessionA, sessionB } = _sessions;
  const equipmentId = equipPool[(__VU - 1) % equipPool.length];

  // 이전 이터레이션 잔여 상태 정리
  cleanupPrev(sessionA, sessionB, gymId);

  // 체크인
  authedPost(`/gyms/${gymId}/checkin`, sessionA.accessToken, null, { tags: { endpoint: 'checkin' } });
  authedPost(`/gyms/${gymId}/checkin`, sessionB.accessToken, null, { tags: { endpoint: 'checkin' } });
  sleep(1);

  // A: 기구 직접 사용 시작 (IN_USE)
  const startResA = authedPost(
    `/equipments/${equipmentId}/usages`,
    sessionA.accessToken, null,
    { tags: { endpoint: 'startUsage_A' } }
  );
  const usageIdA = startResA.json('usageId');
  if (!check(startResA, { 'A startUsage 2xx': (r) => r.status >= 200 && r.status < 300 }) || !usageIdA) {
    checkoutBoth(sessionA, sessionB, gymId);
    return;
  }
  sleep(1);

  // B: 대기 큐 등록 (WAITING)
  const queueRes = authedPost(
    `/equipments/${equipmentId}/usages/wait`,
    sessionB.accessToken, null,
    { tags: { endpoint: 'joinQueue' } }
  );
  const usageIdB = queueRes.json('usageId');
  if (!check(queueRes, { 'B joinQueue 201': (r) => r.status === 201 }) || !usageIdB) {
    authedPost(`/equipments/usages/${usageIdA}/end`, sessionA.accessToken, null, { tags: { endpoint: 'equipEnd_A' } });
    checkoutBoth(sessionA, sessionB, gymId);
    return;
  }
  // 비정상 종료 대비 추적 시작 — 다음 이터레이션에서 cancel 보장
  _prevUsageIdB = usageIdB;

  sleep(3); // A 운동 시뮬레이션

  // A: 사용 종료 → B 상태 CALLED 전환
  authedPost(`/equipments/usages/${usageIdA}/end`, sessionA.accessToken, null, { tags: { endpoint: 'equipEnd_A' } });
  sleep(5); // CALLED 상태 전환 대기 (스트레스 부하 고려)

  // B: CALLED 상태에서 사용 시작
  const startResB = authedPost(
    `/equipments/usages/${usageIdB}/start`,
    sessionB.accessToken, null,
    { tags: { endpoint: 'startUsage_B' } }
  );
  if (check(startResB, { 'B startUsage 2xx': (r) => r.status >= 200 && r.status < 300 })) {
    sleep(5); // B 운동 시뮬레이션
    authedPost(`/equipments/usages/${usageIdB}/end`, sessionB.accessToken, null, { tags: { endpoint: 'equipEnd_B' } });
    _prevUsageIdB = null;
  } else {
    const cancelRes = authedPost(`/equipments/usages/${usageIdB}/cancel`, sessionB.accessToken, null);
    if (cancelRes.status < 500) _prevUsageIdB = null;
    // 5xx면 _prevUsageIdB 유지 → 다음 이터레이션 시작 시 재시도
  }

  // 체크아웃
  checkoutBoth(sessionA, sessionB, gymId);
  sleep(2);
}
