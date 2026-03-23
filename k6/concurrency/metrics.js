import { Counter } from 'k6/metrics';

// 각 경쟁에서 성공(2xx) 횟수 — 모든 race에서 1 이하여야 함
export const raceSuccesses = new Counter('race_successes');

// 예상치 못한 5xx 횟수 — 0이어야 함
export const serverErrors = new Counter('server_errors');
