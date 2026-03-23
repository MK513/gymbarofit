import {
  prepareEquipmentRaceSessions,
  equipmentRaceFlow,
} from '../concurrency/equipmentRace.js';
import {
  prepareLockerRaceSessions,
  lockerRaceFlow,
} from '../concurrency/lockerRace.js';
import {
  queueRaceSetup,
  queueRaceFlow,
  queueRaceTeardown,
} from '../concurrency/queueRace.js';
import {
  membershipRaceSetup,
  membershipRaceFlow,
} from '../concurrency/membershipRace.js';

export const options = {
  scenarios: {
    // Phase 1 — 기구 동시 사용 충돌 (20 VU → equipmentId=1)
    equipment_race: {
      executor: 'shared-iterations',
      vus: 20,
      iterations: 20,
      maxDuration: '60s',
      exec: 'raceEquipment',
    },
    // Phase 2 — 라커 동시 대여 충돌 (10 VU → lockerId=1)
    locker_race: {
      executor: 'shared-iterations',
      vus: 10,
      iterations: 10,
      maxDuration: '30s',
      exec: 'raceLocker',
      startTime: '70s',
    },
    // Phase 3 — 대기 큐 경쟁 조건 (10 VU 동시 startUsage 시도)
    queue_race: {
      executor: 'shared-iterations',
      vus: 10,
      iterations: 10,
      maxDuration: '90s',
      exec: 'raceQueue',
      startTime: '110s',
    },
    // Phase 4 — 멤버십 중복 등록 방지 (5 VU, 동일 토큰)
    membership_race: {
      executor: 'shared-iterations',
      vus: 5,
      iterations: 5,
      maxDuration: '30s',
      exec: 'raceMembership',
      startTime: '210s',
    },
  },
  thresholds: {
    http_req_failed:   ['rate<0.05'], // 5xx는 0, 4xx는 허용
    race_successes:    ['count<=4'],  // 4개 Phase × 최대 1회 = 4
    server_errors:     ['count<1'],   // 5xx 횟수 0
    'http_req_duration{scenario:equipment_race}': ['p(95)<500'],
    'http_req_duration{scenario:locker_race}':    ['p(95)<500'],
    'http_req_duration{scenario:queue_race}':     ['p(95)<500'],
    'http_req_duration{scenario:membership_race}':['p(95)<300'],
  },
};

// ── setup: 각 Phase에 필요한 세션 미리 준비 ─────────────────────────────────
export function setup() {
  return {
    equipSessions:      prepareEquipmentRaceSessions(20),
    lockerSessions:     prepareLockerRaceSessions(10),
    queueData:          queueRaceSetup(),
    membershipSession:  membershipRaceSetup(),
  };
}

// ── teardown: 점유자 세션 정리 ────────────────────────────────────────────────
export function teardown(data) {
  queueRaceTeardown(data.queueData);
}

// ── VU 진입점 ─────────────────────────────────────────────────────────────────
export function raceEquipment(data)  { equipmentRaceFlow(data.equipSessions); }
export function raceLocker(data)     { lockerRaceFlow(data.lockerSessions); }
export function raceQueue(data)      { queueRaceFlow(data.queueData); }
export function raceMembership(data) { membershipRaceFlow(data.membershipSession); }
