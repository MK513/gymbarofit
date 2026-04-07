import { ACTIVE_SOAK_THRESHOLDS }   from '../config/thresholds.js';
import { gymSearchFlowStress }      from '../flows/gymSearch.js';
import { equipmentUsageFlowStress } from '../flows/equipmentUsage.js';
import { equipmentQueueFlow }       from '../flows/equipmentQueue.js';

export const options = {
  scenarios: {
    // 1. 단순 검색 흐름
    soak_search: {
      executor: 'constant-vus',
      vus: 15,
      duration: '30m',
      exec: 'runSearch',
      gracefulStop: '30s',
    },
    // 2. 기구 사용 흐름
    soak_usage: {
      executor: 'constant-vus',
      vus: 10,
      duration: '30m',
      exec: 'runUsageFlow',
      gracefulStop: '30s',
    },
    // 3. 대기열 흐름
    soak_queue: {
      executor: 'constant-vus',
      vus: 5,
      duration: '30m',
      exec: 'runQueueFlow',
      gracefulStop: '60s',
    },
  },
  thresholds: ACTIVE_SOAK_THRESHOLDS,
};

export function runSearch()    { gymSearchFlowStress(); }
export function runUsageFlow() { equipmentUsageFlowStress(); }
export function runQueueFlow() { equipmentQueueFlow(); }
