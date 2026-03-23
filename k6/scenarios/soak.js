import { THRESHOLDS }           from '../config/thresholds.js';
import { memberLoginFlow }      from '../flows/memberLogin.js';
import { gymSearchFlow }        from '../flows/gymSearch.js';
import { equipmentUsageFlow }   from '../flows/equipmentUsage.js';
import { lockerRentFlow }       from '../flows/lockerRent.js';

export const options = {
  scenarios: {
    soak: {
      executor: 'constant-vus',
      vus: 30,
      duration: '30m',
      exec: 'runSoak',
    },
  },
  thresholds: {
    ...THRESHOLDS,
    // 장시간 테스트: p99도 모니터링
    http_req_duration: ['p(99)<2000', 'p(95)<500'],
  },
};

export function runSoak() {
  const r = Math.random();
  if      (r < 0.3)  memberLoginFlow();
  else if (r < 0.6)  gymSearchFlow();
  else if (r < 0.85) equipmentUsageFlow();
  else               lockerRentFlow();
}
