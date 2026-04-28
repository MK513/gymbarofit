# 짐바로핏 (GymBaroFit)

헬스장 회원·기구·라커를 통합 관리하는 웹 애플리케이션입니다.

## 주요 기능

**회원**
- 헬스장 검색·회원권 등록
- 체크인 / 체크아웃
- 기구 실시간 예약·대기열 (분산 락으로 동시 충돌 방지)
- 라커 대여·연장·환불
- 운동 이력·통계 대시보드
- AI 운동 분석 (Gemma4 파인튜닝 모델 기반 스트리밍)
- 실시간 알림 (SSE — 대기열 순번 등)

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
| AI | FastAPI + Gemma4 파인튜닝 모델 (옵션) |
| Database | PostgreSQL 16 (Docker/운영), H2 (로컬 개발) |
| Cache / Lock | Redis 7, Redisson (분산 락 + 캐시) |
| Auth | JWT (Access + Refresh Token) |
| Infra | Docker Compose, GitHub Actions |

## 프로젝트 구조

```
gymbarofit/
├── react-vite/          — React 프론트엔드
├── springboot/
│   ├── core/            — 도메인 엔티티, 레포지토리, InternalService
│   ├── api/             — REST 컨트롤러, 보안, AOP, Redis
│   └── batch/           — 회원권·대여권 만료 자동 처리 스케줄러
└── gemma4/              — FastAPI AI 서버 (옵션)
```

---

## 실행 방법

### Docker (권장)

**1. 환경 변수 파일 생성**

프로젝트 루트에 `.env` 파일을 생성합니다.

```env
POSTGRES_USERNAME=gymbarofit
POSTGRES_PASSWORD=gymbarofit1234
```

`springboot/.env` 파일을 생성합니다.

```env
SPRING_PROFILES_ACTIVE=docker
POSTGRES_USERNAME=gymbarofit
POSTGRES_PASSWORD=gymbarofit1234
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

## CI / CD

`main` 브랜치 push·PR 시 GitHub Actions에서 K6 성능 테스트가 자동 실행됩니다.

- **Smoke Test** — `main`·`dev` 대상 모든 PR에서 실행 (로그인·검색 기본 흐름)
- **Concurrency Test** — `main` PR 병합 시 또는 수동 실행 (분산 락·비관적 락 동시성 검증)

필요한 GitHub Secrets:

| Secret | 설명 |
|---|---|
| `JWT_SECRET_TEST` | 테스트용 JWT 서명 키 |
| `K6_TEST_PASSWORD` | K6 테스트 계정 비밀번호 |
