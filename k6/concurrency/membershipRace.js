import { check } from 'k6';
import { memberLogin } from '../utils/auth.js';
import { authedPost } from '../utils/http.js';
import { MEMBER_USERS, RACE_GYM_ID } from '../data/users.js';
import { raceSuccesses, serverErrors } from './metrics.js';

/**
 * [동시성 테스트] 멤버십 중복 등록 방지
 *
 * 동일 멤버(MEMBER_USERS[99])가 5개 VU에서 동시에 같은 헬스장 멤버십 등록 시도.
 * 검증:
 *  - 성공(201/200)은 최대 1번 (race_successes ≤ 1)
 *  - 나머지 4개는 409 Conflict
 *  - 500은 0
 *
 * NOTE: setup()에서 토큰을 1개 발급해 모든 VU가 공유.
 */
export function membershipRaceSetup() {
  // 새 멤버십 등록을 위해 멤버십이 없는 계정 사용 (MEMBER_USERS[99])
  // seed.sql에서 이 계정에는 gym 1 멤버십을 미리 부여하지 않아야 함.
  const user = MEMBER_USERS[99];
  const session = memberLogin(user.email, user.password);
  return session;
}

export function membershipRaceFlow(session) {
  if (!session) return;

  const res = authedPost(
    `/gyms/${RACE_GYM_ID}/memberships`,
    session.accessToken,
    null,
    { tags: { endpoint: 'membership', scenario: 'membership_race' } }
  );

  check(res, {
    'no 5xx': (r) => r.status < 500,
    'winner(2xx) or loser(4xx)': (r) => (r.status >= 200 && r.status < 300) || (r.status >= 400 && r.status < 500),
  });

  if (res.status >= 500) {
    serverErrors.add(1);
    return;
  }

  if (res.status >= 200 && res.status < 300) {
    raceSuccesses.add(1);
  }
}
