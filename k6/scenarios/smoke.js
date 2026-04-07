import { ACTIVE_THRESHOLDS } from '../config/thresholds.js';
import { memberLoginFlow } from '../flows/memberLogin.js';
import { gymSearchFlow }   from '../flows/gymSearch.js';

export const options = {
  scenarios: {
    smoke_login: {
      executor: 'constant-vus',
      vus: 1,
      duration: '1m',
      exec: 'runLogin',
    },
    smoke_search: {
      executor: 'constant-vus',
      vus: 1,
      duration: '1m',
      exec: 'runSearch',
    },
  },
  thresholds: ACTIVE_THRESHOLDS,
};

export function runLogin()  { memberLoginFlow(); }
export function runSearch() { gymSearchFlow(); }
