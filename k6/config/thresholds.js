export const THRESHOLDS = {
  http_req_duration: ['p(95)<500'],
  http_req_failed:   ['rate<0.01'],
  'http_req_duration{endpoint:login}':      ['p(95)<300'],
  'http_req_duration{endpoint:gymSearch}':  ['p(95)<400'],
  'http_req_duration{endpoint:equipUsage}': ['p(95)<500'],
  'http_req_duration{endpoint:lockerRent}': ['p(95)<600'],
  'http_req_duration{endpoint:checkin}':    ['p(95)<400'],
};
