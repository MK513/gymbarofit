const isCI = __ENV.CI === 'true';

// ── 일반 시나리오 (smoke, load 등) ────────────────────────────────────────────
const THRESHOLDS = {
  http_req_duration: ['p(95)<500'],
  http_req_failed:   ['rate<0.01'],
  'http_req_duration{endpoint:login}':      ['p(95)<300'],
  'http_req_duration{endpoint:gymSearch}':  ['p(95)<400'],
  'http_req_duration{endpoint:equipUsage}': ['p(95)<500'],
  'http_req_duration{endpoint:lockerRent}': ['p(95)<600'],
  'http_req_duration{endpoint:checkin}':    ['p(95)<400'],
};

const CI_THRESHOLDS = {
  http_req_duration: ['p(95)<3000'],
  http_req_failed:   ['rate<0.05'],
  'http_req_duration{endpoint:login}':      ['p(95)<1500'],
  'http_req_duration{endpoint:gymSearch}':  ['p(95)<2000'],
  'http_req_duration{endpoint:equipUsage}': ['p(95)<2500'],
  'http_req_duration{endpoint:lockerRent}': ['p(95)<3000'],
  'http_req_duration{endpoint:checkin}':    ['p(95)<2000'],
};

// ── 스트레스 테스트 — 고부하 환경이므로 기준 완화 ────────────────────────────
const STRESS_THRESHOLDS = {
  http_req_duration: ['p(95)<1000'],
  http_req_failed:   ['rate<0.05'],
  'http_req_duration{endpoint:gymSearch}':  ['p(95)<800'],
  'http_req_duration{endpoint:equipUsage}': ['p(95)<1000'],
  'http_req_duration{endpoint:checkin}':    ['p(95)<800'],
};

// ── 동시성 테스트 ─────────────────────────────────────────────────────────────
const CONCURRENCY_THRESHOLDS = {
  http_req_failed:       ['rate<0.50'],
  equip_race_successes:  ['count<=2'],   // 타겟 2개 × 최대 1회 = 2
  locker_race_successes: ['count<=2'],   // 타겟 2개 × 최대 1회 = 2
  server_errors:         ['count<1'],    // 5xx 횟수 0
  'http_req_duration{scenario:equipment_race}': ['p(95)<500'],
  'http_req_duration{scenario:locker_race}':    ['p(95)<500'],
};

const CI_CONCURRENCY_THRESHOLDS = {
  ...CONCURRENCY_THRESHOLDS,
  'http_req_duration{scenario:equipment_race}': ['p(95)<2000'],
  'http_req_duration{scenario:locker_race}':    ['p(95)<2000'],
};

// ── Soak 테스트 — 장시간 p99도 모니터링 ─────────────────────────────────────
const SOAK_THRESHOLDS = {
  ...THRESHOLDS,
  http_req_duration: ['p(99)<2000', 'p(95)<500'],
};

const CI_SOAK_THRESHOLDS = {
  ...CI_THRESHOLDS,
  http_req_duration: ['p(99)<10000', 'p(95)<3000'],
};

// ── 환경에 따라 자동 선택된 임계값 (각 시나리오에서 이것만 import) ────────────
export const ACTIVE_THRESHOLDS             = isCI ? CI_THRESHOLDS             : THRESHOLDS;
export const ACTIVE_STRESS_THRESHOLDS      = STRESS_THRESHOLDS;
export const ACTIVE_SOAK_THRESHOLDS        = isCI ? CI_SOAK_THRESHOLDS        : SOAK_THRESHOLDS;
export const ACTIVE_CONCURRENCY_THRESHOLDS = isCI ? CI_CONCURRENCY_THRESHOLDS : CONCURRENCY_THRESHOLDS;
