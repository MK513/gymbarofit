# GymBaroFit K6 부하·동시성 테스트

## 개요

| 항목 | 내용 |
|---|---|
| 대상 서버 | Spring Boot (기본 포트 8080) |
| 테스트 도구 | Grafana K6 |
| 테스트 유형 | 부하(Load) / 스트레스(Stress) / 소크(Soak) / 동시성(Concurrency) |

---

## 사전 조건

1. **백엔드 실행**: `spring.profiles.active=dev` 또는 `docker`
2. **시드 데이터**: `seed/seed.sql` 을 H2 콘솔(http://localhost:8090)에서 실행
   - 멤버 100명, gym 1, equipment 5개, locker zone 1 + locker 10개, 멤버십 99개 등록됨
   - USER_ID 5001~5100, GYM_ID 5001, EQUIPMENT_ID 5001~5005, LOCKER_ID 5001~5010
3. **환경변수**: `BASE_URL=http://localhost:8080` (미설정 시 기본값 동일)
4. **K6 설치**: https://grafana.com/docs/k6/latest/set-up/install-k6/

---

## 테스트 계정

| 구분 | 이메일 패턴 | 비밀번호 |
|---|---|---|
| 멤버 (100명) | `loadtest_member_{1~100}@gymbarofit.test` | `loadtest` (기본값) |

비밀번호는 환경변수로 오버라이드 가능:
```bash
TEST_PASSWORD=mypassword k6 run k6/scenarios/smoke.js
```

---

## 파일 구조

```
k6/
├── README.md                      # 이 파일
├── config/
│   └── thresholds.js              # 공통 임계값 설정
├── utils/
│   ├── auth.js                    # 로그인/토큰 유틸
│   └── http.js                    # authedGet/Post/Patch/Delete 래퍼
├── data/
│   └── users.js                   # 테스트 사용자 데이터 (seed.sql과 일치)
├── flows/                         # 일반 부하 플로우
│   ├── memberLogin.js             # 로그인 → 히스토리 조회
│   ├── gymSearch.js               # 헬스장 검색 → 기구 목록
│   ├── equipmentUsage.js          # 체크인 → 기구 사용 → 종료 → 체크아웃
│   ├── equipmentQueue.js          # 체크인 → 대기 큐 → 사용 시작 → 종료
│   └── lockerRent.js              # 라커 존 조회 → 대여 → 환불
├── concurrency/                   # 동시성 테스트 전용
│   ├── metrics.js                 # 커스텀 메트릭 (race_successes, server_errors)
│   ├── equipmentRace.js           # 기구 동시 사용 충돌 테스트
│   ├── lockerRace.js              # 라커 동시 대여 충돌 테스트
│   ├── queueRace.js               # 대기 큐 동시 startUsage 경쟁 테스트
│   └── membershipRace.js          # 멤버십 중복 등록 방지 테스트
├── scenarios/
│   ├── smoke.js                   # 기본 동작 검증 (2 VU, 1분)
│   ├── load.js                    # 일반 운영 부하 (50 VU, 10분)
│   ├── stress.js                  # 최대 부하 탐색 (0→200→0 ramping, 12분)
│   ├── soak.js                    # 장시간 안정성 (30 VU, 30분)
│   └── concurrency.js             # 동시성 제어 검증 (4 Phase)
├── seed/
│   └── seed.sql                   # H2 테스트 데이터 (5000-range IDs)
├── results/                       # 테스트 결과 JSON (gitignore 대상)
└── docker-compose.k6.yml          # Docker로 k6 실행
```

---

## 시나리오 명세

### 1. Smoke Test (`scenarios/smoke.js`)

| 항목 | 값 |
|---|---|
| 목적 | 기본 동작 검증, CI/CD에서 항상 실행 |
| VU | 2 |
| 시간 | 1분 |
| p95 기준 | 500ms |
| 에러율 기준 | < 1% |

**포함 플로우**
- `memberLoginFlow` — POST /members/login → GET /members/history
- `gymSearchFlow` — GET /gyms/search → GET /gyms/{id}/equipments

---

### 2. Load Test (`scenarios/load.js`)

| 항목 | 값 |
|---|---|
| 목적 | 일반 운영 부하 시뮬레이션 |
| VU | 50 (search 30 / equipment 12 / locker 8) |
| 시간 | 10분 |
| p95 기준 | 500ms |
| 에러율 기준 | < 1% |

**포함 플로우**

| 플로우 | 비율 | 엔드포인트 |
|---|---|---|
| gymSearchFlow | 60% | GET /gyms/search, GET /gyms/{id}/equipments |
| equipmentUsageFlow | 25% | checkin → createUsage → endUsage → checkout |
| lockerRentFlow | 15% | getZones → rent → getInfo → refund |

---

### 3. Stress Test (`scenarios/stress.js`)

| 항목 | 값 |
|---|---|
| 목적 | 최대 부하 임계점 탐색 |
| VU | 0 → 50 → 100 → 200 → 0 (ramping) |
| 시간 | 12분 |
| p95 기준 | 1000ms (완화) |
| 에러율 기준 | < 5% |

**램프업 단계**

| 단계 | 시간 | 목표 VU |
|---|---|---|
| 워밍업 | 2분 | 50 |
| 중간 | 3분 | 100 |
| 피크 | 3분 | 200 |
| 지속 | 2분 | 200 |
| 쿨다운 | 2분 | 0 |

---

### 4. Soak Test (`scenarios/soak.js`)

| 항목 | 값 |
|---|---|
| 목적 | 메모리 누수 / 커넥션 고갈 등 장시간 안정성 검증 |
| VU | 30 |
| 시간 | 30분 |
| p95 기준 | 500ms |
| p99 기준 | 2000ms |
| 에러율 기준 | < 1% |

---

### 5. Concurrency Test (`scenarios/concurrency.js`)

> 동시성 제어 회귀 방지 — CI/CD(push to main)에서 자동 실행

| Phase | 대상 | VU | 목적 |
|---|---|---|---|
| 1 | 기구 ID=5001 동시 사용 | 20 | 한 명만 사용 시작, 나머지 409 |
| 2 | 라커 ID=5001 동시 대여 | 10 | 한 명만 대여 성공, 나머지 409 |
| 3 | 대기 큐 동시 startUsage | 10 | 한 명만 ACTIVE 전환, 나머지 4xx |
| 4 | 멤버십 중복 등록 | 5 (동일 토큰) | 한 번만 성공, 나머지 409 |

**성공 기준 (모든 Phase 공통)**
- `race_successes` (Custom Counter) ≤ 4 (4개 Phase × 최대 1회)
- HTTP 5xx = 0
- 4xx 응답은 허용 (정상 거부 동작)

---

## 실행 명령

### 로컬 실행

```bash
# 백엔드 실행 후 seed 데이터 삽입 (H2 콘솔: http://localhost:8090)

# Smoke (빠른 검증, ~1분)
k6 run k6/scenarios/smoke.js

# Load (일반 부하, ~10분)
BASE_URL=http://localhost:8080 k6 run k6/scenarios/load.js

# Stress (한계 탐색, ~12분)
BASE_URL=http://localhost:8080 k6 run k6/scenarios/stress.js

# Soak (장시간 안정성, ~30분)
BASE_URL=http://localhost:8080 k6 run k6/scenarios/soak.js

# Concurrency (동시성 제어, ~4분)
BASE_URL=http://localhost:8080 k6 run k6/scenarios/concurrency.js

# JSON 결과 저장
k6 run --out json=k6/results/load-$(date +%Y%m%d-%H%M).json k6/scenarios/load.js
```

### Docker 실행 (모니터링 포함)

```bash
# 1. 모니터링 스택 기동 (InfluxDB + Prometheus + Grafana)
docker compose -f docker-compose.monitor.yml up -d

# 2. K6 시나리오 실행 (메트릭 자동으로 InfluxDB 전송)
docker compose -f docker-compose.monitor.yml run --rm k6-smoke
docker compose -f docker-compose.monitor.yml run --rm k6-load
docker compose -f docker-compose.monitor.yml run --rm k6-stress
docker compose -f docker-compose.monitor.yml run --rm k6-soak
docker compose -f docker-compose.monitor.yml run --rm k6-concurrency

# 3. 종료
docker compose -f docker-compose.monitor.yml down
```

---

## 임계값 기준표

| 메트릭 | 기준 | 적용 시나리오 |
|---|---|---|
| `http_req_duration` p95 | < 500ms | smoke, load, soak |
| `http_req_duration` p95 | < 1000ms | stress |
| `http_req_duration` p99 | < 2000ms | soak |
| `http_req_failed` | < 1% | smoke, load, soak |
| `http_req_failed` | < 5% | stress |
| `race_successes` | ≤ 4 | concurrency |
| `server_errors` (5xx) | = 0 | concurrency |

---

## 실시간 모니터링 (Grafana 대시보드)

K6 메트릭과 Spring Boot 메트릭을 Grafana에서 실시간으로 확인할 수 있다.

```
K6 --out influxdb ──► InfluxDB 1.8 ──► Grafana (K6 대시보드 #2587)
Spring Boot /actuator/prometheus ──► Prometheus ──► Grafana (JVM 대시보드 #4701)
```

### 1. 모니터링 스택 기동

```bash
# 프로젝트 루트에서 실행
docker compose -f docker-compose.monitor.yml up -d
```

| 서비스 | URL | 용도 |
|---|---|---|
| Grafana | http://localhost:3000 | 대시보드 (admin / admin) |
| Prometheus | http://localhost:9090 | Spring Boot 메트릭 |
| InfluxDB | http://localhost:8086 | K6 메트릭 |

### 2. Grafana 대시보드 import

Grafana 접속 후 **Dashboards → Import**:

| 대상 | Dashboard ID | Datasource |
|---|---|---|
| K6 부하 테스트 메트릭 | **2587** | InfluxDB-K6 |
| Spring Boot JVM | **4701** | Prometheus-SpringBoot |

### 3. K6 실행 (InfluxDB 출력 포함)

```bash
# 백엔드 먼저 실행
cd springboot && ./gradlew bootRun --args='--spring.profiles.active=dev'

# K6 실행 — --out influxdb 추가
k6 run --out influxdb=http://localhost:8086/k6 k6/scenarios/load.js
k6 run --out influxdb=http://localhost:8086/k6 k6/scenarios/stress.js
k6 run --out influxdb=http://localhost:8086/k6 k6/scenarios/concurrency.js

# JSON 결과도 함께 저장하려면
k6 run \
  --out influxdb=http://localhost:8086/k6 \
  --out json=k6/results/load-$(date +%Y%m%d-%H%M).json \
  k6/scenarios/load.js
```

### 4. 모니터링 스택 종료

```bash
docker compose -f docker-compose.monitor.yml down
# 데이터 볼륨까지 삭제하려면
docker compose -f docker-compose.monitor.yml down -v
```

### Actuator 직접 확인

```bash
# 헬스체크
curl http://localhost:8080/actuator/health

# Prometheus 메트릭 (raw)
curl http://localhost:8080/actuator/prometheus

# HTTP 요청 메트릭
curl http://localhost:8080/actuator/metrics/http.server.requests
```

### JPA/트랜잭션 로그 (docker 프로파일)

`application-docker.yml`에서 활성화:
- `org.hibernate.SQL: DEBUG` — 실행 SQL
- `org.hibernate.orm.jdbc.bind: TRACE` — 바인딩 파라미터
- `org.hibernate.engine.transaction.internal: DEBUG` — 트랜잭션 시작/커밋/롤백
- `org.springframework.transaction: DEBUG` — Spring 트랜잭션 경계
- `org.hibernate.engine.jdbc.spi.SqlExceptionHelper: WARN` — DB 예외(락 타임아웃 등)

---

## CI/CD

GitHub Actions (`.github/workflows/k6-load-test.yml`):

| 트리거 | 실행 시나리오 | 목적 |
|---|---|---|
| PR → main | smoke only | 기본 API 동작 검증 (빠름) |
| push → main | smoke + concurrency | 동시성 제어 회귀 방지 |
| workflow_dispatch | smoke + concurrency | 수동 실행 |

필요한 GitHub Secret:
- `JWT_SECRET_TEST` — 테스트 환경용 JWT 시크릿 키

---

## 시드 데이터 (`seed/seed.sql`)

H2 호환 SQL로 작성. dev 데이터(1000-range IDs)와 충돌 방지를 위해 5000-range 사용.

| 데이터 | 범위 |
|---|---|
| 멤버 | USER_ID 5001~5100 / `loadtest_member_{1~100}@gymbarofit.test` |
| 오너 | USER_ID 5200 |
| 헬스장 | GYM_ID 5001 |
| 기구 | EQUIPMENT_ID 5001~5005 |
| 라커존 | LOCKER_ZONE_ID 5001 |
| 라커 | LOCKER_ID 5001~5010 (전체 AVAILABLE) |
| 멤버십 | 5001~5099 ACTIVE (5100 제외 — membershipRace 테스트용) |

> **주의**: `loadtest_member_100` (USER_ID 5100)은 멤버십이 없는 상태로 시작.
> membershipRace 테스트에서 동시 등록 시도 대상으로 사용됨.
