import { THRESHOLDS }               from '../config/thresholds.js';
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
  thresholds: {
    ...THRESHOLDS,
    // 장시간 테스트: p99도 모니터링
    http_req_duration: ['p(99)<2000', 'p(95)<500'],
  },
};

export function runSearch()    { gymSearchFlowStress(); }
export function runUsageFlow() { equipmentUsageFlowStress(); }
export function runQueueFlow() { equipmentQueueFlow(); }
