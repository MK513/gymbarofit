import { check, sleep } from 'k6';
import { memberLogin } from '../utils/auth.js';
import { authedGet } from '../utils/http.js';
import { STRESS_SEARCH_USERS, LOAD_SEARCH_USERS, TEST_GYM_IDS, SEARCH_KEYWORDS } from '../data/users.js';

// VU당 세션 캐시 — 매 이터레이션 로그인 방지
let _session = null;

/**
 * 헬스장 검색 + 기구 목록 조회 플로우 (가장 빈번한 읽기 플로우)
 * GET /gyms/search → GET /gyms/{id}/equipments
 */
function gymSearchInternal(userPool) {
  if (!_session) {
    const user = userPool[(__VU - 1) % userPool.length];
    _session = memberLogin(user.email, user.password);
  }
  const session = _session;
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

export function gymSearchFlowStress() { gymSearchInternal(STRESS_SEARCH_USERS); }
export function gymSearchFlowLoad()   { gymSearchInternal(LOAD_SEARCH_USERS); }
