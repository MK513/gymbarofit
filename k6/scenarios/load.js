import { THRESHOLDS }             from '../config/thresholds.js';
import { gymSearchFlowLoad }      from '../flows/gymSearch.js';
import { equipmentUsageFlowLoad } from '../flows/equipmentUsage.js';
import { lockerRentFlow }         from '../flows/lockerRent.js';

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

export function runSearch()    { gymSearchFlowLoad(); }
export function runEquipment() { equipmentUsageFlowLoad(); }
export function runLocker()    { lockerRentFlow(); }
