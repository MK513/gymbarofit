import { check, sleep } from 'k6';
import { memberLogin } from '../utils/auth.js';
import { authedGet } from '../utils/http.js';
import { MEMBER_USERS } from '../data/users.js';

/**
 * 멤버 로그인 플로우
 * POST /members/login → GET /members/history
 */
export function memberLoginFlow() {
  const user = MEMBER_USERS[Math.floor(Math.random() * MEMBER_USERS.length)];
  const session = memberLogin(user.email, user.password);
  if (!session) return;

  sleep(1);

  const now = new Date();
  const res = authedGet(
    `/members/history?year=${now.getFullYear()}&month=${now.getMonth() + 1}`,
    session.accessToken,
    { tags: { endpoint: 'memberHistory' } }
  );
  check(res, { 'history 200': (r) => r.status === 200 });

  sleep(Math.random() * 2 + 1);
}
