import {
  prepareEquipmentRaceSessions,
  equipmentRaceFlow,
} from '../concurrency/equipmentRace.js';
import {
  prepareLockerRaceSessions,
  lockerRaceFlow,
} from '../concurrency/lockerRace.js';
import { memberLogout } from '../utils/auth.js';

// TODO: Phase2 수정 필요

export const options = {
  scenarios: {
    // Phase 1 — 기구 동시 사용 충돌
    // VU  1-20 → equipmentId=5001 / VU 21-40 → equipmentId=5002
    equipment_race: {
      executor:    'shared-iterations',
      vus:         40,
      iterations:  40,
      maxDuration: '60s',
      exec:        'raceEquipment',
    },
    // Phase 2 — 라커 동시 대여 충돌
    // VU  1-10 → lockerId=5001   / VU 11-20 → lockerId=5002
    locker_race: {
      executor:    'shared-iterations',
      vus:         20,
      iterations:  20,
      maxDuration: '30s',
      exec:        'raceLocker',
      startTime:   '10s',
    },
  },
  thresholds: {
    http_req_failed:      ['rate<0.40'],   // 5xx 비율 5% 미만
    equip_race_successes:  ['count<=2'],   // 타겟 2개 × 최대 1회 = 2
    locker_race_successes: ['count<=2'],   // 타겟 2개 × 최대 1회 = 2
    server_errors:        ['count<1'],     // 5xx 횟수 0
    'http_req_duration{scenario:equipment_race}': ['p(95)<500'],
    'http_req_duration{scenario:locker_race}':    ['p(95)<500'],
  },
};

// ── setup: 각 Phase에 필요한 세션 미리 준비 ─────────────────────────────────
export function setup() {
  return {
    equipSessions:  prepareEquipmentRaceSessions(40),
    lockerSessions: prepareLockerRaceSessions(20),
  };
}

// ── teardown: 모든 세션 로그아웃 ──────────────────────────────────────────────
export function teardown(data) {
  [...data.equipSessions, ...data.lockerSessions].forEach((session) => {
    if (session) memberLogout(session.refreshToken);
  });
}

// ── VU 진입점 ─────────────────────────────────────────────────────────────────
export function raceEquipment(data) { equipmentRaceFlow(data.equipSessions); }
export function raceLocker(data)    { lockerRaceFlow(data.lockerSessions); }
