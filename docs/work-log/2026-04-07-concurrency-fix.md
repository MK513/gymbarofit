# 동시성 테스트 버그 수정 작업 로그 (2026-04-07)

## 브랜치: `feature/k6`

---

## 작업 배경

Redis 분산 락 도입 이후 k6 동시성 테스트(`concurrency.js`)를 실행했을 때 두 가지 버그가 발생했고, 세션 정리 로직도 누락되어 있었음.

---

## Bug 1 — `locker_race` 시나리오가 아예 실행되지 않는 문제

### 원인

k6의 `__VU`는 **모든 시나리오에 걸쳐 전역으로 유일**한 번호임.
`equipment_race`가 VU 1~40을 점유하므로, `locker_race`의 VU는 41~60이 됨.
`lockerRaceFlow`에서 `sessions[__VU - 1]` = `sessions[40..59]`를 참조했는데
sessions 배열 크기가 20이라 모두 `undefined` → `if (!session) return` 즉시 종료.
`equipmentRaceFlow`도 동일한 잠재 버그 내포.

### 수정

```js
// Before
const vuIndex = __VU - 1;

// After
const vuIndex = (__VU - 1) % sessions.length;  // 전역 VU → 세션 배열 내 인덱스로 정규화
```

**수정 파일**
- `k6/concurrency/lockerRace.js`
- `k6/concurrency/equipmentRace.js`

---

## Bug 2 — 분산 락이 걸려 있어도 라커 성공이 5회 발생하는 문제

### 원인

두 요인이 결합:

1. **`refund()`에 분산 락 없음** — k6 winner VU가 cleanup(DELETE)을 호출하면 `refund()`가 락 없이 실행되어 locker를 `CANCELLED` 상태로 변경.
2. **기본 `waitTime = 5s`** — 나머지 VU들이 최대 5초간 큐에서 대기 중, cleanup이 완료되면 락을 획득한 후속 VU가 locker를 "빈 상태"로 인식 → 재성공.

```
t=0s  VU1 락 획득 → reserve → pay → confirm → 200 성공 → 락 해제
t=0.5 VU1 k6 DELETE → refund() → locker CANCELLED (락 없이 실행)
t=0.6 VU2 락 획득 → existsActiveOrPendingByLockerId → CANCELLED 미포함 → false → 200 재성공 ← 버그
...
```

### 수정

**`LockerFacade.java`**: `waitTime = 0`으로 설정하여 경합 즉시 실패(LockAcquisitionException → 409)

```java
// Before
@DistributedLock(key = "'locker:' + #request.lockerId")

// After
@DistributedLock(key = "'locker:' + #request.lockerId", waitTime = 0)
```

→ 첫 번째 VU 외 모두 즉시 실패, cleanup 타이밍 경합 자체가 사라짐.

**`LockerService.java`**: `reserve()`에 중복 체크 로직 추가 (이중 방어)

```java
if (locker.getItemInfo().getStatus() != ItemStatus.OK) { ... }
if (lockerUsageInternalService.existsActiveOrPendingByLockerId(request.lockerId())) { ... }
```

**`LockerUsageInternalService.java`**: `existsActiveOrPendingByLockerId()` 메서드 추가

```java
public boolean existsActiveOrPendingByLockerId(Long lockerId) {
    return lockerUsageRepository.existsByLocker_IdAndStatusIn(
            lockerId, List.of(LockerUsageStatus.PENDING, LockerUsageStatus.ACTIVE)
    );
}
```

**`LockerUsageRepository.java`**: 위 메서드에서 사용하는 쿼리 메서드 추가

```java
boolean existsByLocker_IdAndStatusIn(Long lockerId, Collection<LockerUsageStatus> statuses);
```

---

## 추가 — `teardown()`에서 세션 로그아웃 처리

테스트 종료 후 setup에서 생성한 로그인 세션을 서버에서 정리하는 로직 누락.

**`k6/utils/auth.js`**: `memberLogout()` 함수 추가

```js
export function memberLogout(refreshToken) {
  if (!refreshToken) return;
  http.post(`${BASE_URL}/auth/logout`, JSON.stringify({ refreshToken }), { ... });
}
```

**`k6/scenarios/concurrency.js`**: `teardown()` 함수 추가

```js
export function teardown(data) {
  [...data.equipSessions, ...data.lockerSessions].forEach((session) => {
    if (session) memberLogout(session.refreshToken);
  });
}
```

---

## 기타 수정

- `locker_race.startTime`: `70s` → `10s` (equipment_race와 겹치는 타이밍 조정)
- `http_req_failed` threshold: `rate<0.05` → `rate<0.40` (동시성 테스트 특성 반영, 4xx는 정상 응답)
- `lockerRace.js` 로그 레이블: `[WINNER-EQUIP]` → `[WINNER-LOCKER]` (오기 수정)

---

## 변경 파일 요약

| 파일 | 변경 내용 |
|------|-----------|
| `k6/concurrency/equipmentRace.js` | `__VU` 모듈로 정규화 |
| `k6/concurrency/lockerRace.js` | `__VU` 모듈로 정규화, 로그 레이블 수정, cleanup 주석 추가 |
| `k6/scenarios/concurrency.js` | `startTime` 조정, threshold 조정, `teardown()` 추가 |
| `k6/utils/auth.js` | `memberLogout()` 추가 |
| `springboot/.../LockerFacade.java` | `waitTime = 0` 추가 |
| `springboot/.../LockerService.java` | `reserve()` 중복 체크 추가 |
| `springboot/.../LockerUsageInternalService.java` | `existsActiveOrPendingByLockerId()` 추가 |
| `springboot/.../LockerUsageRepository.java` | `existsByLocker_IdAndStatusIn()` 추가 |
