# 짐바로핏 (GymBaroFit)

헬스장 회원·기구·라커를 통합 관리하는 웹 애플리케이션입니다.

> 기획부터 배포까지 1인 개발 (2025.12 ~ 2026.05)
> 정원이 정해진 자원에 동시 요청이 몰릴 때 발생하는 초과 예약을 막는 것이 핵심 과제였습니다.

---

## 핵심 성과

| 항목 | 개선 전 | 개선 후 |
|---|---|---|
| 정원 2건 기구에 40명 동시 요청 | 37건 예약 성공 | 2건만 성공 |
| 데이터 정합성 | 초과 예약 발생 | 100% (서버 오류 0건) |
| 기구 이용 API p95 지연 | 9.23ms | 6ms (약 35% 단축) |

- p95 응답 기구 161.96ms, 라커 48.45ms로 임계값 500ms 이내 유지
- 200VU 부하 테스트 통과
- k6 시나리오 5종(smoke, load, stress, soak, 동시성) 구성 및 Prometheus·Grafana 연동 관제

---

## 설계 판단

### 동시성 제어 — DB 배타적 락 대신 Redis 분산 락

락 대기가 길어지면 커넥션 풀이 고갈되고, 서버를 확장해도 단일 DB가 병목이 됩니다.
데이터 계층에서 뒤늦게 막는 대신 애플리케이션 계층에서 선제적으로 제어하는 구조를 택했습니다. (Redisson)

### 초과 예약 결함과 해결

정원 2건인 기구에 가상 사용자 40명이 동시에 요청하자 **37건이 예약에 성공**했습니다.

원인은 락 해제 시점이 트랜잭션 커밋보다 빨라, 아직 반영되지 않은 상태를 다음 요청이 그대로 통과한 것이었습니다.

- AOP로 락 임대 시간을 조정해 **커밋 이후에 해제**되도록 재설계
- 처리 중인 요청을 나타내는 **Pending 상태** 추가
- 경합이 짧은 라커는 락 대기 시간을 0으로 두어 즉시 실패를 반환

처리량 감소는 감수했습니다. 예약이 정원을 넘는 것보다 낫다는 판단이었습니다.
동일 조건 재시험에서 기구와 라커 모두 정원과 같은 2건만 성공했습니다.

### 실시간 알림 — WebSocket 대신 SSE

기구·라커 상태 알림은 서버에서 클라이언트로 가는 단방향 통신이라 SSE로 충분하다고 판단했습니다.
초기에는 동기 방식 이벤트 처리로 스레드가 점유되어 지연이 발생했고, 비동기 처리로 전환해 해결했습니다.

### 멀티모듈 구성 — core / api / batch

도메인과 표현 계층, 배치 작업을 분리해 계층 간 의존성을 통제했습니다.
모바일 앱이나 별도 배치 시스템이 추가될 때 core를 재사용할 수 있는 구조입니다.

---

## 주요 기능

**회원**
- 헬스장 검색·회원권 등록
- 체크인 / 체크아웃
- 기구 실시간 예약·대기열 (분산 락으로 동시 충돌 방지)
- 라커 대여·연장·환불
- 운동 이력·통계 대시보드
- 실시간 알림 (SSE — 대기열 순번 등)
- AI 운동 분석 (실험적 기능, `--profile ai` 실행 시)

**운영자**
- 헬스장 3단계 등록 마법사 (기본 정보 → 라커 → 기구/맵)
- 인터랙티브 캔버스 맵 에디터 (Konva)
- 기구·라커 CRUD, 혼잡도 관리
- 회원 관리 (등록 회원 조회·상태 변경)
- 통계 대시보드

**공통**
- JWT (Access + Refresh Token) 기반 인증
- 회원권·대여권 만료 자동 처리 (Spring Batch)

## 기술 스택

| 영역 | 기술 |
|---|---|
| Frontend | React 19, Vite 7, Material UI 7, Konva, Recharts |
| Backend | Spring Boot 3.4.4, Spring Security, JPA, Java 21 (Virtual Threads) |
| Batch | Spring Batch (회원권·대여권 만료 처리) |
| Database | PostgreSQL 16 (Docker/운영), H2 (로컬 개발) |
| Cache / Lock | Redis 7, Redisson (분산 락 + 캐시) |
| Auth | JWT (Access + Refresh Token) |
| 성능 검증 | k6, Prometheus, Grafana |
| Infra | Docker Compose, GitHub Actions |
| AI (옵션) | FastAPI + Gemma4 |

## 프로젝트 구조

```
gymbarofit/
├── react-vite/          — React 프론트엔드
├── springboot/
│   ├── core/            — 도메인 엔티티, 레포지토리, InternalService
│   ├── api/             — REST 컨트롤러, 보안, AOP, Redis
│   └── batch/           — 회원권·대여권 만료 자동 처리 스케줄러
├── gemma4/              — FastAPI AI 서버 (옵션)
├── k6/                  — 부하·동시성 테스트 시나리오
└── nginx/               — 리버스 프록시 설정
```

---

## 실행 방법

### Docker (권장)

**1. 환경 변수 파일 생성**

프로젝트 루트에 `.env` 파일을 생성합니다.

```env
POSTGRES_USERNAME=<your-db-username>
POSTGRES_PASSWORD=<your-db-password>
```

`springboot/.env` 파일을 생성합니다.

```env
SPRING_PROFILES_ACTIVE=docker
POSTGRES_USERNAME=<your-db-username>
POSTGRES_PASSWORD=<your-db-password>
JWT_SECRET=<your-jwt-secret>
FASTAPI_BASE_URL=http://gemma4-ai:8000
```

**2. 실행**

```bash
# 기본 실행 (AI 서버 제외)
docker compose up -d

# AI 서버 포함 실행 (GPU 필요)
docker compose --profile ai up -d
```

| 서비스 | 주소 |
|---|---|
| 프론트엔드 | http://localhost:5173 |
| 백엔드 API | http://localhost:8080 |
| Batch 서버 | http://localhost:8081 |
| AI 서버 | http://localhost:8000 (`--profile ai` 시) |

**3. 종료**

```bash
docker compose down
```

데이터(DB·Redis)까지 삭제하려면:

```bash
docker compose down -v
```

---

### 로컬 개발 (IntelliJ / VS Code)

백엔드는 `dev` 프로파일(H2 in-memory)로 실행합니다.

```bash
# springboot/.env 에 JWT_SECRET 설정 후
cd springboot
./gradlew :api:bootRun --args='--spring.profiles.active=dev'
```

프론트엔드:

```bash
cd react-vite
npm install
npm run dev
```

---

## 성능 테스트

`k6/` 디렉터리에 시나리오가 구성되어 있습니다.

| 시나리오 | 목적 |
|---|---|
| smoke | 로그인·검색 기본 흐름 검증 |
| load | 예상 부하 수준에서의 응답 시간 측정 |
| stress | 한계 지점 탐색 (ramp-up 구간 세분화) |
| soak | 장시간 운영 시 자원 누수 확인 |
| concurrency | 분산 락·비관적 락 동시성 검증 |

stress 시나리오는 초기 구성에서 비현실적인 부하가 발생해, ramp-up 구간을 세분화하고 요청 간 지연을 추가해 재설계했습니다.

---

## CI / CD

`main` 브랜치 push·PR 시 GitHub Actions에서 K6 성능 테스트가 자동 실행됩니다.

- **Smoke Test** — `main`·`dev` 대상 모든 PR에서 실행 (로그인·검색 기본 흐름)
- **Concurrency Test** — `main` PR 병합 시 또는 수동 실행 (분산 락·비관적 락 동시성 검증)

필요한 GitHub Secrets:

| Secret | 설명 |
|---|---|
| `JWT_SECRET_TEST` | 테스트용 JWT 서명 키 |
| `K6_TEST_PASSWORD` | K6 테스트 계정 비밀번호 |
