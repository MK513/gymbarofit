import { check, sleep } from 'k6';
import { memberLogin } from '../utils/auth.js';
import { authedPost } from '../utils/http.js';
import { MEMBER_USERS, RACE_GYM_ID, RACE_EQUIPMENT_ID } from '../data/users.js';
import { raceSuccesses, serverErrors } from './metrics.js';

/**
 * [동시성 테스트] 대기 큐 경쟁 조건
 *
 * 시나리오:
 *  1. setup(): 기구 ID=1을 사용 중인 세션 1개 준비
 *  2. 10개 VU: 모두 대기 큐 진입 (joinQueue) → 모두 201 기대
 *  3. teardown 역할 세션: 기구 사용 종료 → SSE 알림 발생 (1명만 CALLED 상태로 전환)
 *  4. 10개 VU: 동시에 startUsage 시도
 *     → 단 1명만 성공(204), 나머지 9명은 4xx
 *
 * NOTE: k6는 SSE 미지원이므로 setup의 endUsage 후 바로 startUsage를 시도.
 *       실제 환경에서는 SSE 알림을 받은 1명만 startUsage를 시도하지만,
 *       여기서는 모두 시도해 서버 측 동시성 제어를 검증.
 */
export function queueRaceSetup() {
  // 기구를 먼저 사용 중인 상태로 만들기
  const user = MEMBER_USERS[0];
  const session = memberLogin(user.email, user.password);
  if (!session) return { occupierSession: null, occupierUsageId: null, queueSessions: [] };

  authedPost(`/gyms/${RACE_GYM_ID}/checkin`, session.accessToken, null);
  const usageRes = authedPost(
    `/equipments/${RACE_EQUIPMENT_ID}/usages`,
    session.accessToken,
    null
  );

  const occupierUsageId = usageRes.status === 201 ? usageRes.json('usageId') : null;

  // 대기 VU용 세션 10개 준비 + 체크인
  const queueSessions = [];
  for (let i = 1; i <= 10; i++) {
    const u = MEMBER_USERS[i % MEMBER_USERS.length];
    const s = memberLogin(u.email, u.password);
    if (s) {
      authedPost(`/gyms/${RACE_GYM_ID}/checkin`, s.accessToken, null);
      queueSessions.push(s);
    }
  }

  return { occupierSession: session, occupierUsageId, queueSessions };
}

export function queueRaceFlow(data) {
  const vuIndex = __VU - 1;
  const session = data.queueSessions[vuIndex % data.queueSessions.length];
  if (!session) return;

  // 대기 줄서기
  const queueRes = authedPost(
    `/equipments/${RACE_EQUIPMENT_ID}/usages/wait`,
    session.accessToken,
    null,
    { tags: { endpoint: 'joinQueue', scenario: 'queue_race' } }
  );
  check(queueRes, { 'joinQueue 201': (r) => r.status === 201 });
  if (queueRes.status !== 201) return;

  const usageId = queueRes.json('usageId');

  // 점유자 세션의 사용 종료를 기다린 후 startUsage 시도
  // (setup teardown 타이밍 맞추기 위해 짧은 대기)
  sleep(2);

  const startRes = authedPost(
    `/equipments/usages/${usageId}/start`,
    session.accessToken,
    null,
    { tags: { endpoint: 'startUsage', scenario: 'queue_race' } }
  );

  check(startRes, {
    'no 5xx': (r) => r.status < 500,
    'winner(204) or loser(4xx)': (r) => r.status === 204 || (r.status >= 400 && r.status < 500),
  });

  if (startRes.status >= 500) {
    serverErrors.add(1);
    return;
  }

  if (startRes.status === 204) {
    raceSuccesses.add(1);
    // 승자: 사용 종료
    authedPost(`/equipments/usages/${usageId}/end`, session.accessToken, null);
  } else {
    // 패자: 대기 취소
    authedPost(`/equipments/usages/${usageId}/cancel`, session.accessToken, null);
  }

  authedPost(`/gyms/${RACE_GYM_ID}/checkout`, session.accessToken, null);
}

export function queueRaceTeardown(data) {
  // 점유자 기구 사용 종료 (대기자들의 startUsage를 트리거)
  if (data.occupierSession && data.occupierUsageId) {
    authedPost(
      `/equipments/usages/${data.occupierUsageId}/end`,
      data.occupierSession.accessToken,
      null
    );
    authedPost(`/gyms/${RACE_GYM_ID}/checkout`, data.occupierSession.accessToken, null);
  }
}
