// 테스트 비밀번호: 환경변수로 오버라이드 가능 (seed.sql 해시와 일치해야 함)
// 실행 예: TEST_PASSWORD=mypassword k6 run ...
export const TEST_PASSWORD = __ENV.TEST_PASSWORD || 'loadtest';

// 399명 멤버 풀: loadtest_member_{1~399}@gymbarofit.test
// USER_ID: 5001~5399 (멤버십 보유)
// member_400 (USER_ID 5400)은 membershipRace 전용 — 아래 RACE_MEMBERSHIP_USER 참고
export const MEMBER_USERS = Array.from({ length: 399 }, (_, i) => ({
  email: `loadtest_member_${i + 1}@gymbarofit.test`,
  password: TEST_PASSWORD,
}));

// 부하 테스트용 고정 데이터 (seed.sql과 일치해야 함)
export const TEST_GYM_IDS       = [5001];
export const TEST_EQUIPMENT_IDS = Array.from({ length: 150 }, (_, i) => 5001 + i);
export const TEST_ZONE_ID       = 5001;
export const SEARCH_KEYWORDS    = ['헬스', '스쿼트', '서울', '강남', '피트니스'];

// ── 시나리오별 유저 파티션 (크로스 시나리오 충돌 방지) ──────────────────────────
//  (399명 보유, 여유 159명)
// stress.js: 100 + 60 + 140 = 300명
export const STRESS_SEARCH_USERS = MEMBER_USERS.slice(0, 100);   // VU 최대 100
export const STRESS_USAGE_USERS  = MEMBER_USERS.slice(100, 160); // VU 최대 60
export const STRESS_QUEUE_USERS  = MEMBER_USERS.slice(160, 300); 
export const STRESS_USAGE_EQUIPMENTS = TEST_EQUIPMENT_IDS.slice(0, 90);
export const STRESS_QUEUE_EQUIPMENTS = TEST_EQUIPMENT_IDS.slice(90, 150);

// load.js: 30 + 12 + 8 = 50명
export const LOAD_SEARCH_USERS    = MEMBER_USERS.slice(0, 30);  // VU 30
export const LOAD_EQUIPMENT_USERS = MEMBER_USERS.slice(30, 42); // VU 12
export const LOAD_LOCKER_USERS    = MEMBER_USERS.slice(42, 50); // VU 8

// 멤버십 중복 등록 동시성 테스트 전용 (USER_ID 5400, 멤버십 없음)
export const RACE_MEMBERSHIP_USER = {
  email: 'loadtest_member_400@gymbarofit.test',
  password: TEST_PASSWORD,
};

// 동시성 테스트용 단일 타겟 ID (경쟁 유발)
export const RACE_GYM_ID       = 5001;
export const RACE_EQUIPMENT_ID = 5001;
export const RACE_LOCKER_ID    = 5001;
export const RACE_ZONE_ID      = 5001;
