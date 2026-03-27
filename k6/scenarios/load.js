import { THRESHOLDS }           from '../config/thresholds.js';
import { gymSearchFlow }        from '../flows/gymSearch.js';
import { equipmentUsageFlow }   from '../flows/equipmentUsage.js';
import { lockerRentFlow }       from '../flows/lockerRent.js';
import {
  LOAD_SEARCH_USERS,
  LOAD_EQUIPMENT_USERS,
  LOAD_LOCKER_USERS,
} from '../data/users.js';

export const options = {
  scenarios: {
    // 60% — 읽기 (검색·기구 목록)
    load_search: {
      executor: 'constant-vus',
      vus: 30,
      duration: '10m',
      exec: 'runSearch',
    },
    // 25% — 기구 사용
    load_equipment: {
      executor: 'constant-vus',
      vus: 12,
      duration: '10m',
      exec: 'runEquipment',
    },
    // 15% — 라커 대여
    load_locker: {
      executor: 'constant-vus',
      vus: 8,
      duration: '10m',
      exec: 'runLocker',
    },
  },
  thresholds: THRESHOLDS,
};

export function runSearch()    { gymSearchFlow(LOAD_SEARCH_USERS); }
export function runEquipment() { equipmentUsageFlow(LOAD_EQUIPMENT_USERS); }
export function runLocker()    { lockerRentFlow(LOAD_LOCKER_USERS); }
