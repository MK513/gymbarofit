import { check, sleep } from 'k6';
import { memberLogin } from '../utils/auth.js';
import { authedGet } from '../utils/http.js';
import { MEMBER_USERS, TEST_GYM_IDS, SEARCH_KEYWORDS } from '../data/users.js';

/**
 * 헬스장 검색 + 기구 목록 조회 플로우 (가장 빈번한 읽기 플로우)
 * GET /gyms/search → GET /gyms/{id}/equipments
 */
export function gymSearchFlow() {
  const user = MEMBER_USERS[Math.floor(Math.random() * MEMBER_USERS.length)];
  const session = memberLogin(user.email, user.password);
  if (!session) return;

  sleep(1);

  const keyword = SEARCH_KEYWORDS[Math.floor(Math.random() * SEARCH_KEYWORDS.length)];
  const searchRes = authedGet(
    `/gyms/search?keyword=${encodeURIComponent(keyword)}&size=10&sort=id,desc`,
    session.accessToken,
    { tags: { endpoint: 'gymSearch' } }
  );
  check(searchRes, { 'search 200': (r) => r.status === 200 });

  sleep(Math.random() * 2);

  const gymId = TEST_GYM_IDS[Math.floor(Math.random() * TEST_GYM_IDS.length)];
  const equipRes = authedGet(
    `/gyms/${gymId}/equipments`,
    session.accessToken,
    { tags: { endpoint: 'gymEquipments' } }
  );
  check(equipRes, { 'equipments 200': (r) => r.status === 200 });

  sleep(Math.random() * 3 + 1);
}
