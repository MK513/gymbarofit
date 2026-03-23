import { gymSearchFlow }      from '../flows/gymSearch.js';
import { equipmentUsageFlow } from '../flows/equipmentUsage.js';
import { equipmentQueueFlow } from '../flows/equipmentQueue.js';

export const options = {
  scenarios: {
    stress_ramp: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '2m', target: 50  }, // 워밍업
        { duration: '3m', target: 100 }, // 중간 부하
        { duration: '3m', target: 200 }, // 피크
        { duration: '2m', target: 200 }, // 피크 유지
        { duration: '2m', target: 0   }, // 쿨다운
      ],
      exec: 'runMixed',
    },
  },
  thresholds: {
    http_req_duration: ['p(95)<1000'],
    http_req_failed:   ['rate<0.05'],
  },
};

export function runMixed() {
  const r = Math.random();
  if      (r < 0.5)  gymSearchFlow();
  else if (r < 0.8)  equipmentUsageFlow();
  else               equipmentQueueFlow();
}
