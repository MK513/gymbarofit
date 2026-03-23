// 테스트 비밀번호: 환경변수로 오버라이드 가능
// seed.sql의 해시와 일치해야 함 (data-dev.sql과 동일한 해시 사용)
// 실행 예: TEST_PASSWORD=mypassword k6 run ...
export const TEST_PASSWORD = __ENV.TEST_PASSWORD || 'loadtest';

// 100명 멤버 풀: loadtest_member_{1~100}@gymbarofit.test
// USER_ID: 5001~5100 (seed.sql과 일치)
export const MEMBER_USERS = Array.from({ length: 100 }, (_, i) => ({
  email: `loadtest_member_${i + 1}@gymbarofit.test`,
  password: TEST_PASSWORD,
}));

// 부하 테스트용 고정 데이터 (seed.sql과 일치해야 함)
export const TEST_GYM_IDS       = [5001];
export const TEST_EQUIPMENT_IDS = [5001, 5002, 5003, 5004, 5005];
export const TEST_ZONE_ID       = 5001;
export const SEARCH_KEYWORDS    = ['헬스', '스쿼트', '서울', '강남', '피트니스'];

// 동시성 테스트용 단일 타겟 ID (경쟁 유발)
export const RACE_GYM_ID       = 5001;
export const RACE_EQUIPMENT_ID = 5001;
export const RACE_LOCKER_ID    = 5001;
export const RACE_ZONE_ID      = 5001;
