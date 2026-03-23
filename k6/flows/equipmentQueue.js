import { check, sleep } from 'k6';
import { memberLogin } from '../utils/auth.js';
import { authedPost } from '../utils/http.js';
import { MEMBER_USERS, TEST_GYM_IDS, TEST_EQUIPMENT_IDS } from '../data/users.js';

/**
 * 기구 대기 큐 플로우
 * login → checkin → joinQueue → (대기 시뮬레이션) → startUsage → endUsage → checkout
 *
 * NOTE: k6는 SSE를 지원하지 않아 '알림 수신 대기'는 sleep으로 시뮬레이션.
 */
export function equipmentQueueFlow() {
  const user = MEMBER_USERS[Math.floor(Math.random() * MEMBER_USERS.length)];
  const session = memberLogin(user.email, user.password);
  if (!session) return;

  const gymId       = TEST_GYM_IDS[0];
  const equipmentId = TEST_EQUIPMENT_IDS[Math.floor(Math.random() * TEST_EQUIPMENT_IDS.length)];

  // 체크인
  authedPost(`/gyms/${gymId}/checkin`, session.accessToken, null,
    { tags: { endpoint: 'checkin' } });

  sleep(1);

  // 대기 줄서기
  const queueRes = authedPost(
    `/equipments/${equipmentId}/usages/wait`,
    session.accessToken,
    null,
    { tags: { endpoint: 'joinQueue' } }
  );
  const joined = check(queueRes, { 'joinQueue 201': (r) => r.status === 201 });

  if (!joined) {
    authedPost(`/gyms/${gymId}/checkout`, session.accessToken, null);
    return;
  }

  const usageId = queueRes.json('usageId');

  // SSE 알림 대신 sleep으로 대기 시뮬레이션
  sleep(Math.random() * 10 + 5);

  // startUsage 시도
  const startRes = authedPost(
    `/equipments/usages/${usageId}/start`,
    session.accessToken,
    null,
    { tags: { endpoint: 'startUsage' } }
  );
  const started = check(startRes, { 'startUsage 2xx': (r) => r.status >= 200 && r.status < 300 });

  if (started) {
    sleep(5); // 운동 시간

    authedPost(`/equipments/usages/${usageId}/end`, session.accessToken, null,
      { tags: { endpoint: 'equipEnd' } });
  } else {
    // 이미 다른 사람이 전환 → 대기 취소
    authedPost(`/equipments/usages/${usageId}/cancel`, session.accessToken, null);
  }

  authedPost(`/gyms/${gymId}/checkout`, session.accessToken, null,
    { tags: { endpoint: 'checkout' } });

  sleep(2);
}
