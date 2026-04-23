# 짐바로핏 (GymBaroFit)

헬스장 회원·기구·라커를 통합 관리하는 웹 애플리케이션입니다.

## 주요 기능

- **헬스장 검색 및 등록** — 키워드·위치 기반 검색, 오너 헬스장 등록
- **체크인 / 체크아웃** — 회원 출입 관리
- **기구 사용 관리** — 사용 시작·종료, 대기열, 동시 사용 충돌 방지 (분산 락)
- **라커 대여·반납** — 구역별 라커 조회 및 예약
- **멤버십 관리** — 등록·조회
- **실시간 알림** — SSE 기반 알림 (대기열 순번 등)

## 기술 스택

| 영역 | 기술 |
|---|---|
| Frontend | React 18, Vite, Material UI |
| Backend | Spring Boot 3, Spring Security, JPA |
| Database | PostgreSQL 16 (운영·Docker), H2 (로컬 개발) |
| Cache / Lock | Redis 7, Redisson (분산 락) |
| Auth | JWT (Access + Refresh Token) |
| Infra | Docker Compose, GitHub Actions |

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
```

**2. 실행**

```bash
docker compose up -d
```

| 서비스 | 주소 |
|---|---|
| 프론트엔드 | http://localhost:5173 |
| 백엔드 API | http://localhost:8080 |

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

- **Smoke Test** — 모든 PR에서 실행 (로그인·검색 기본 흐름)
- **Concurrency Test** — `main` 병합 시 실행 (분산 락·비관적 락 동시성 검증)

필요한 GitHub Secrets:

| Secret | 설명 |
|---|---|
| `JWT_SECRET_TEST` | 테스트용 JWT 서명 키 |
| `K6_TEST_PASSWORD` | K6 테스트 계정 비밀번호 |


TODO: batch로 회원권 및 대여권 만료 상태 처리 구현 필요