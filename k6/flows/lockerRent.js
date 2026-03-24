import { check, sleep } from 'k6';
import { memberLogin } from '../utils/auth.js';
import { authedGet, authedPost, authedDelete } from '../utils/http.js';
import { MEMBER_USERS, TEST_GYM_IDS, TEST_ZONE_ID } from '../data/users.js';

/**
 * 라커 대여 전체 라이프사이클 플로우
 * login → getZones → getLockers → rentLocker → getLockerInfo → refundLocker
 */
export function lockerRentFlow() {
  const user = MEMBER_USERS[(__VU - 1) % MEMBER_USERS.length];
  const session = memberLogin(user.email, user.password);
  if (!session) return;

  const gymId = TEST_GYM_IDS[0];

  sleep(1);

  // 1. 라커존 목록
  const zonesRes = authedGet(
    `/lockers/zones?gymId=${gymId}`,
    session.accessToken,
    { tags: { endpoint: 'lockerZones' } }
  );
  check(zonesRes, { 'zones 200': (r) => r.status === 200 });

  sleep(1);

  // 2. 라커존 내 라커 목록
  const lockersRes = authedGet(
    `/lockers/zones/${TEST_ZONE_ID}`,
    session.accessToken,
    { tags: { endpoint: 'lockerList' } }
  );
  check(lockersRes, { 'lockers 200': (r) => r.status === 200 });

  // 사용 가능한 라커 선택
  let lockers = [];
  try { lockers = lockersRes.json('lockers') || []; } catch (_) {}
  const available = lockers.find((l) => l.status === 'AVAILABLE');
  if (!available) {
    sleep(2);
    return;
  }

  sleep(1);

  // 3. 라커 대여
  const rentRes = authedPost(
    '/lockers/usages',
    session.accessToken,
    {
      gymId:         gymId,
      lockerId:      available.id,
      plan:          'MONTH_1',
      paymentMethod: 'CARD',
    },
    { tags: { endpoint: 'lockerRent' } }
  );
  const rented = check(rentRes, { 'rent 200': (r) => r.status === 200 });
  if (!rented) {
    sleep(2);
    return;
  }

  const usageId = rentRes.json('usageId');

  sleep(2);

  // 4. 라커 정보 조회
  const infoRes = authedGet(
    `/lockers/usages/${usageId}`,
    session.accessToken,
    { tags: { endpoint: 'lockerInfo' } }
  );
  check(infoRes, { 'lockerInfo 200': (r) => r.status === 200 });

  sleep(1);

  // 5. 환불 (다음 VU를 위해 반납)
  const refundRes = authedDelete(
    `/lockers/usages/${usageId}`,
    session.accessToken,
    { tags: { endpoint: 'lockerRefund' } }
  );
  check(refundRes, { 'refund 2xx': (r) => r.status >= 200 && r.status < 300 });

  sleep(2);
}
