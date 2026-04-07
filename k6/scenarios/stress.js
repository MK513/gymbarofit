import { ACTIVE_STRESS_THRESHOLDS } from '../config/thresholds.js';
import { gymSearchFlowStress }      from '../flows/gymSearch.js';
import { equipmentUsageFlowStress } from '../flows/equipmentUsage.js';
import { equipmentQueueFlow }       from '../flows/equipmentQueue.js';

export const options = {
  scenarios: {
    // 1. 단순 검색 흐름
    search_flow: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '2m', target: 25 },
        { duration: '5m', target: 100 },
        { duration: '3m', target: 0 },
      ],
      exec: 'runSearch',
      gracefulStop: '30s',
    },
    // 2. 기구 사용 흐름
    usage_flow: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '2m', target: 15 },
        { duration: '5m', target: 60 },
        { duration: '3m', target: 0 },
      ],
      exec: 'runUsageFlow',
      // startTime: '0s',
      gracefulStop: '30s',
    },
    // 3. 대기열 흐름
    queue_flow: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '2m', target: 10 },
        { duration: '5m', target: 40 },
        { duration: '3m', target: 0 },
      ],
      exec: 'runQueueFlow',
      // startTime: '1m',
      gracefulStop: '60s',
    },
  },
  thresholds: ACTIVE_STRESS_THRESHOLDS,
};

export function runSearch()    { gymSearchFlowStress(); }
export function runUsageFlow() { equipmentUsageFlowStress(); }
export function runQueueFlow() { equipmentQueueFlow(); }
