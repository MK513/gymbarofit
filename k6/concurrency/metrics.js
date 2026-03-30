import { Counter, Trend } from 'k6/metrics';

// 시나리오별 독립 성공 카운터 (타겟 2개 × 최대 1회 = 2)
export const equipRaceSuccesses  = new Counter('equip_race_successes');
export const lockerRaceSuccesses = new Counter('locker_race_successes');

// 예상치 못한 5xx 횟수 — 0이어야 함
export const serverErrors = new Counter('server_errors');

// 응답 시간 분포: 승자/패자 각각 추적 (ms)
export const equipWinnerDuration  = new Trend('equip_winner_duration',  true);
export const equipLoserDuration   = new Trend('equip_loser_duration',   true);
export const lockerWinnerDuration = new Trend('locker_winner_duration', true);
export const lockerLoserDuration  = new Trend('locker_loser_duration',  true);
