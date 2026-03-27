import { STRESS_THRESHOLDS }   from '../config/thresholds.js';
import { gymSearchFlow }      from '../flows/gymSearch.js';
import { equipmentUsageFlow } from '../flows/equipmentUsage.js';
import { equipmentQueueFlow } from '../flows/equipmentQueue.js';
import { 
  STRESS_SEARCH_USERS,
  STRESS_USAGE_USERS,
  STRESS_QUEUE_USERS,
  STRESS_USAGE_EQUIPMENTS,
  STRESS_QUEUE_EQUIPMENTS
} from '../data/users.js';

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
      startTime: '0s',
      gracefulStop: '30s',
    },
    // 3. 대기열 흐름 — 1회 이터레이션 최대 ~16s이므로 gracefulStop을 넉넉히 설정
    queue_flow: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '2m', target: 10 },
        { duration: '5m', target: 40 },
        { duration: '3m', target: 0 },
      ],
      exec: 'runQueueFlow',
      startTime: '1m',
      gracefulStop: '60s',
    },
  },
  thresholds: STRESS_THRESHOLDS,
};

export function runSearch()    { gymSearchFlow(STRESS_SEARCH_USERS); }
export function runUsageFlow() { equipmentUsageFlow(STRESS_USAGE_USERS, STRESS_USAGE_EQUIPMENTS); }
export function runQueueFlow() { equipmentQueueFlow(STRESS_QUEUE_USERS, STRESS_QUEUE_EQUIPMENTS); }
