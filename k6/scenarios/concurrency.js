import { ACTIVE_CONCURRENCY_THRESHOLDS } from '../config/thresholds.js';
import { prepareEquipmentRaceSessions, equipmentRaceFlow } from '../concurrency/equipmentRace.js';
import { prepareLockerRaceSessions, lockerRaceFlow }       from '../concurrency/lockerRace.js';
import { memberLogout } from '../utils/auth.js';

export const options = {
  scenarios: {
    // Phase 1 — 기구 동시 사용 충돌
    // VU  1-20 → equipmentId=5001 / VU 21-40 → equipmentId=5002
    equipment_race: {
      executor:    'per-vu-iterations',
      vus:         40,
      iterations:  1,
      maxDuration: '60s',
      exec:        'raceEquipment',
    },
    // Phase 2 — 라커 동시 대여 충돌
    // VU  1-10 → lockerId=5001   / VU 11-20 → lockerId=5002
    locker_race: {
      executor:    'per-vu-iterations',
      vus:         20,
      iterations:  1,
      maxDuration: '30s',
      exec:        'raceLocker',
      startTime:   '10s',
    },
  },
  thresholds: ACTIVE_CONCURRENCY_THRESHOLDS,
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
