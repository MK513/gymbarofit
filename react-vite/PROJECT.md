# GymBaroFit 프론트엔드 프로젝트 문서

## 기술 스택

| 항목 | 기술 |
|---|---|
| 프레임워크 | React 19 + Vite 7 |
| 라우팅 | React Router DOM v7 |
| UI 라이브러리 | Material UI (MUI) v7 + Emotion |
| HTTP 통신 | 네이티브 `fetch` API |
| 실시간 통신 | Server-Sent Events (SSE) |
| 상태 관리 | React Context API |
| 인증 저장소 | `localStorage` |

---

## 라우트 구조

| 경로 | 컴포넌트 | 인증 필요 |
|---|---|---|
| `/login` | `Login` | X |
| `/signup` | `Signup` | X |
| `/` | `MemberDashboard` | O |
| `/members` | `MemberDashboard` | O |
| `/members/history` | `WorkoutHistory` | O |
| `/gyms/register` | `MembershipRegister` | O |
| `/gyms/:gymId/equipments` | `EquipmentReservation` | O |
| `/lockers/rent` | `LockerRent` | O |
| `/lockers/extend/:usageId` | `LockerExtend` | O |

---

## 기능 단위 구현 목록

### 1. 인증 — 로그인 (`/login`)

- 개인 회원 / 기업 회원 탭 전환 (`ToggleButtonGroup`)
- 이메일 + 비밀번호 입력 폼
- 로그인 성공 시 JWT 및 유저 정보를 `localStorage`에 저장
- 로그인 성공 후 `/members`로 이동

---

### 2. 인증 — 회원가입 (`/signup`)

- 개인 회원 / 기업 회원 역할 선택 탭
- 역할에 따른 입력 필드 분기
  - 개인 회원: 이메일, 비밀번호, 이름, 전화번호, 주소, 성별 (MALE / FEMALE)
  - 기업 회원: 이메일, 비밀번호, 이름, 사업자 번호, 전화번호, 주소
- 클라이언트 측 정규식 유효성 검사
  - 이메일: RFC 형식 검증
  - 비밀번호: 영문 + 숫자 조합, 8~25자
- 회원가입 성공 시 `/login`으로 이동

---

### 3. 대시보드 (`/members`)

- 등록된 헬스장 목록 드롭다운으로 전환
- 현재 헬스장 혼잡도 표시 (매우 여유 ~ 매우 혼잡, 색상 칩)
- **금일 운동 요약 카드**: 총 운동 시간(분), 소모 칼로리, 최근 운동 기구 내역 최대 2건
- **기구 이용 카드**:
  - 현재 사용 중인 기구 정보 표시 및 `사용 종료` 버튼
  - 대기 중인 예약 정보 표시 및 `대기 취소` 버튼
  - SSE `WAITING_AVAILABLE` 이벤트 수신 시 `사용 시작` 버튼 노출 및 스낵바 알림
- **보관함 카드**:
  - 현재 이용 중인 보관함 구역, 번호, 만료일 표시
  - 환불 신청 다이얼로그 (확인 후 API 호출)
  - 기간 연장 페이지 이동
  - 보관함 신규 대여 페이지 이동
- SSE 연결 유지 및 실시간 이벤트 처리

---

### 4. 운동 기록 (`/members/history`) — UI 전용

- 월별 요약 카드 (총 운동 횟수, 누적 시간, 칼로리)
- 달력 형식의 7열 그리드 (1~31일)
- 운동 기록이 있는 날짜에 점 인디케이터 표시
- 날짜 클릭 시 상세 기록 목록 표시 (기구명, 운동 시간, 칼로리, 유형 칩)
- **현재 API 미연동 — 목업 데이터 사용**

---

### 5. 헬스장 등록 (`/gyms/register`)

- 키워드 기반 헬스장 검색 (이름 또는 지역)
- 검색 결과 목록 표시 및 선택 (체크 아이콘)
- 선택된 헬스장 이름·주소 미리보기 (카카오 맵 연동 예정 — TODO)
- 등록 확인 후 `AuthContext`에 새 헬스장 정보 반영

---

### 6. 기구 예약 (`/gyms/:gymId/equipments`)

- 헬스장 전체 기구 목록 조회
- 카테고리 칩 가로 스크롤 필터 (기구 유형별)
- 이용 가능 / 전체 상태 필터
- 기구 상태별 카드 표시
  - **가능** (초록): 즉시 사용 시작 가능 → `바로 사용 시작하기` 버튼
  - **사용중** (파랑): 대기 인원 수 표시 → `대기 줄서기` 버튼
  - **점검/고장/불가** (빨강/주황/회색): 예약 불가 버튼 (비활성)
- 기구 선택 시 하단 Drawer로 상세 정보 및 액션 표시
- **다음 기구 모드**: 현재 이용 중 상태에서 대기를 걸기 위해 사용중인 기구 목록만 표시
- SSE `UPDATE_EQUIPMENT` 이벤트로 기구 상태 실시간 반영
- S3 버킷 이미지 로드 + 키워드 기반 폴백 아이콘

---

### 7. 보관함 대여 (`/lockers/rent`)

- 헬스장 내 보관함 구역 탭 목록 조회
  - 구역이 없으면 빈 상태 화면(`LockerEmptyState`) 표시
- 구역 탭 선택 시 해당 구역 보관함 그리드 조회
- 보관함 시각화 그리드 (행/열 수, SMALL/MEDIUM/LARGE 크기 대응)
  - 사용 가능: 흰색, 클릭 가능
  - 사용 중/고장: 회색, 클릭 불가
- 자동 선택 버튼 (첫 번째 빈 자리 자동 선택)
- 보관함 선택 후 결제 다이얼로그
  - 기간 선택: 1개월(10,000원) / 3개월(27,000원) / 6개월(50,000원)
  - 결제 수단: 카드 / 카카오페이 / 네이버페이
  - 확인 후 대여 API 호출 → 대시보드로 이동

---

### 8. 보관함 기간 연장 (`/lockers/extend/:usageId`)

- 현재 이용 중인 보관함 정보 조회 (구역, 번호, 만료일, D-Day 칩)
- `기간 연장하기` 버튼 → 결제 다이얼로그 (대여와 동일 컴포넌트 재사용)
- 확인 후 연장 API 호출 → 대시보드로 이동

---

### 공통 기능

| 기능 | 설명 |
|---|---|
| `AuthContext` | 로그인 상태 및 JWT를 `localStorage`로 영속화. `initialized` 플래그로 복원 전 리다이렉트 방지 |
| `NotificationContext` | 전역 MUI Snackbar (상단 중앙, 3초 자동 숨김). `showNotification(message, severity)` |
| `SseNotification` Hook | `/sse/subscribe?userId={id}` SSE 연결. `equipment-update` / `notification` 이벤트 수신 및 상태 전달 |
| `ProtectedRoute` | `isAuthed` + `initialized` 확인 후 미인증 시 `/login` 리다이렉트 |

---

## API 구현 목록

기본 URL은 `src/api-config.js`에서 환경 변수로 관리됩니다.

```
VITE_API_BASE_URL=http://localhost:8080
```

모든 API 호출은 `src/api/Api.jsx`의 `call()` 함수를 통해 처리됩니다.
- `Authorization: Bearer <token>` 헤더 자동 주입
- `{key}` 형식의 경로 변수 치환
- GET: 쿼리 스트링 직렬화 / POST·PUT·DELETE: JSON 바디 직렬화

---

### 인증 API

| 함수 | 메서드 | 엔드포인트 | 설명 |
|---|---|---|---|
| `loginMember(dto)` | POST | `/members/login` | 개인 회원 로그인. 반환: `{ userInfo, token: { accessToken } }` |
| `loginOwner(dto)` | POST | `/owners/login` | 기업 회원 로그인. 반환: 동일 형식 |
| `signupMember(dto)` | POST | `/members/register` | 개인 회원 가입. Body: `{ email, password, username, phoneNumber, address, gender }` |
| `signupOwner(dto)` | POST | `/owners/register` | 기업 회원 가입. Body: `{ email, password, name, phoneNumber, address, businessNumber }` |

---

### 대시보드 API

| 함수 | 메서드 | 엔드포인트 | 설명 |
|---|---|---|---|
| `getMembershipInfo({ gymId })` | GET | `/memberships/{gymId}/info` | 대시보드 통합 정보 조회. 반환: `{ gym, lockerUsage, equipmentUsage: { inUseDto, waitingDto }, history: { todayTotalUsageMinutes, todayTotalCalories, recentThreeUsages } }` |

---

### 헬스장 API

| 함수 | 메서드 | 엔드포인트 | 설명 |
|---|---|---|---|
| `searchGym({ keyword })` | GET | `/gyms/search?keyword=...` | 키워드로 헬스장 검색. 반환: `{ content: [{ id, name, address, distance }] }` |
| `registerGym({ gymId })` | POST | `/gyms/{gymId}/memberships` | 현재 회원을 헬스장에 등록 |
| `getEquipments({ gymId })` | GET | `/gyms/{gymId}/equipments` | 헬스장 기구 목록 조회. 반환: `{ equipmentTypes, equipments: [{ id, name, type, location, imageUrl, itemStatus, usageStatus, waitingCount }] }` |

---

### 기구 이용 API

| 함수 | 메서드 | 엔드포인트 | 설명 |
|---|---|---|---|
| `createUsage({ equipmentId })` | POST | `/equipments/{equipmentId}/usages` | 기구 즉시 사용 시작 |
| `createQueue({ equipmentId })` | POST | `/equipments/{equipmentId}/usages/wait` | 기구 대기 줄 등록 |
| `startUsage({ usageId })` | POST | `/equipments/usages/{usageId}/start` | SSE 호출 알림 후 사용 시작 확인 |
| `endUsage({ usageId })` | POST | `/equipments/usages/{usageId}/end` | 기구 사용 종료 |
| `leaveQueue({ usageId })` | POST | `/equipments/usages/{usageId}/cancel` | 대기 취소 |

---

### 보관함 API

| 함수 | 메서드 | 엔드포인트 | 설명 |
|---|---|---|---|
| `getLockerZone({ gymId })` | GET | `/lockers/zones?gymId=...` | 헬스장 보관함 구역 목록 조회. 반환: `{ zoneCount, zones: [{ id, name, rowCount, columnCount, lockerSize }] }` |
| `getLockerList({ zoneId })` | GET | `/lockers/zones/{zoneId}` | 구역 내 보관함 목록 조회. 반환: `{ availableCount, unavailableCount, lockers: [{ id, name, itemStatus, usageStatus }] }` |
| `getLockerInfo({ usageId })` | GET | `/lockers/usages/{usageId}` | 현재 이용 중인 보관함 상세 조회. 반환: `{ lockerNumber, zoneName, endDate: [year, month, day] }` |
| `rentLocker(dto)` | POST | `/lockers/usages` | 보관함 신규 대여. Body: `{ gymId, lockerId, plan, paymentMethod }` |
| `extendLocker(dto, { usageId })` | POST | `/lockers/usages/{usageId}/extend` | 보관함 기간 연장. Body: `{ plan, paymentMethod }` |
| `refundLocker({ usageId })` | DELETE | `/lockers/usages/{usageId}` | 보관함 환불 / 해지 (서버에서 50% 환불 처리) |

---

### 실시간 SSE

| 연결 | 메서드 | 엔드포인트 | 설명 |
|---|---|---|---|
| `EventSource` | GET | `/sse/subscribe?userId={userId}` | SSE 영구 연결. 이벤트: `connected`, `equipment-update`, `notification` |

#### SSE 이벤트 처리

| 이벤트명 | 처리 페이지 | 동작 |
|---|---|---|
| `equipment-update` | 기구 예약 페이지 | 기구 상태 실시간 업데이트 + 가용 전환 시 스낵바 |
| `notification` (WAITING_AVAILABLE) | 대시보드 | 스낵바 알림 + `사용 시작` 버튼 노출 |

---

### API 요청 공통 DTO

| 필드 | 값 예시 |
|---|---|
| `plan` | `"MONTH_1"` / `"MONTH_3"` / `"MONTH_6"` |
| `paymentMethod` | `"CARD"` / `"KAKAO_PAY"` / `"NAVER_PAY"` |
| `itemStatus` | `"OK"` / `"BROKEN"` / `"MAINTENANCE"` / `"RETIRED"` |
| `usageStatus` | `"AVAILABLE"` / `"IN_USE"` / `"WAITING"` |
| `crowdLevel` | `"VERY_COMFORTABLE"` / `"COMFORTABLE"` / `"NORMAL"` / `"CROWDED"` / `"VERY_CROWDED"` |

---

## 예외 처리 및 에러 전략

### 계층별 에러 처리 구조

```
[서버 응답]
    │
    ▼
call() in Api.jsx          ← response.ok 검사 → 실패 시 JSON 에러 바디를 throw
    │
    ▼
도메인 함수                 ← async/await 투과 (개별 try/catch 없음)
(loginMember, rentLocker…)
    │
    ▼
페이지 컴포넌트             ← try/catch 필수 → showNotification(err.message, "error")
    │
    ▼
NotificationContext        ← 전역 Snackbar로 사용자에게 노출
```

### `call()` 함수의 에러 처리 방식

`src/api/Api.jsx`의 `call()` 함수는 프로젝트 내 모든 HTTP 요청의 단일 진입점입니다.

```js
return fetch(url, options).then(async (response) => {
  const isJson = response.headers.get("content-type")?.includes("application/json");

  if (response.ok) {
    return isJson ? response.json() : {};  // 204 No Content 등 대응
  }

  const error = isJson ? await response.json() : {};
  throw error;  // 서버 에러 바디(JSON)를 그대로 throw
});
```

- HTTP 2xx 성공 시: JSON 파싱 후 반환. `Content-Type`이 없으면 `{}` 반환 (204 대응)
- HTTP 4xx / 5xx 실패 시: 서버에서 내려온 JSON 에러 바디를 그대로 `throw`
  - thrown 값은 JavaScript `Error` 인스턴스가 아닌 순수 객체 (ex: `{ message: "Not found", code: 404 }`)
  - 페이지 컴포넌트에서 `err.message`로 접근 가능

### 페이지 컴포넌트의 에러 처리 패턴

도메인 API 함수들은 자체 `try/catch` 없이 `call()`의 결과를 그대로 반환하므로, 에러 처리는 **호출하는 컴포넌트의 책임**입니다.

```js
// 컴포넌트에서의 일반적인 패턴
try {
  await rentLocker({ lockerId, gymId, plan, paymentMethod });
  showNotification("대여가 완료되었습니다.", "success");
  navigate("/");
} catch (err) {
  showNotification(err.message || "오류가 발생했습니다.", "error");
}
```

### SSE 이벤트 에러 처리

`src/context/SseNotification.jsx`에서 각 이벤트 리스너는 독립적인 `try/catch`로 보호됩니다.

```js
es.addEventListener("equipment-update", (e) => {
  try {
    const data = JSON.parse(e.data);
    setEquipmentUpdate(data);
  } catch (err) {
    console.error("Failed to parse equipment data:", err);
    // 파싱 실패해도 SSE 연결 유지, 다음 이벤트 계속 수신
  }
});
```

- 개별 이벤트 파싱 실패가 전체 SSE 연결을 끊지 않음
- 브라우저 `EventSource`의 자동 재연결 기능에 의존 (별도 재연결 로직 없음)

### 토큰 만료 처리

현재 토큰 갱신(refresh) 로직이 없습니다. 토큰이 만료되면 서버가 401을 반환하고, `call()`이 이를 throw합니다. 컴포넌트에서 catch된 에러가 스낵바로 표시되지만, 자동 로그아웃이나 토큰 갱신 플로우는 구현되어 있지 않습니다.

---

## 인증 흐름

### 최초 로그인 흐름

```
사용자 입력 (이메일 + 비밀번호)
    │
    ▼
Login.jsx
    │── loginMember(dto) 또는 loginOwner(dto) 호출
    │
    ▼
Api.jsx call()
    │── POST /members/login 또는 /owners/login
    │
    ▼
서버 응답: { userInfo, token: { accessToken } }
    │
    ▼
AuthContext.login(userInfo, accessToken)
    │── setUser(userInfo)         ← React 상태 갱신
    │── setAccessToken(token)
    │── localStorage.setItem("USER", JSON)
    │── localStorage.setItem("ACCESS_TOKEN", token)
    │
    ▼
navigate("/members")
```

### 페이지 새로고침 시 인증 복원 흐름

```
앱 마운트 (main.jsx → App.jsx)
    │
    ▼
AuthProvider useEffect 실행
    │── localStorage.getItem("USER")         → setUser()
    │── localStorage.getItem("ACCESS_TOKEN") → setAccessToken()
    │── finally: setInitialized(true)        (파싱 실패해도 반드시 실행)
    │
    ▼
ProtectedRoute 렌더링
    │
    ├── initialized === false → null 반환 (빈 화면, 리다이렉트 없음)
    │
    ├── initialized === true, isAuthed === false → <Navigate to="/login" />
    │
    └── initialized === true, isAuthed === true  → <Outlet /> (보호된 페이지 렌더링)
```

### 보호된 API 요청 흐름

```
컴포넌트에서 API 함수 호출
    │
    ▼
Api.jsx call()
    │── localStorage.getItem("ACCESS_TOKEN") 읽기
    │── headers.append("Authorization", "Bearer " + token)
    │── fetch(url, options)
    │
    ▼
서버 응답
    ├── 2xx → JSON 반환
    └── 4xx/5xx → JSON 에러 바디 throw → 컴포넌트 catch → 스낵바 표시
```

### 로그아웃 흐름

```
DashboardHeader 로그아웃 버튼 클릭
    │
    ▼
AuthContext.logout()
    │── setUser(null)
    │── setAccessToken(null)
    │── localStorage.removeItem("USER")
    │── localStorage.removeItem("ACCESS_TOKEN")
    │
    ▼
isAuthed → false
    │
    ▼
ProtectedRoute → <Navigate to="/login" replace />
```

---

## 상태 관리 설계 의도

### 전역 상태 구조

이 프로젝트는 Redux나 Zustand 같은 외부 상태 라이브러리 없이 React의 내장 **Context API + useState**만으로 전역 상태를 관리합니다.

```
App.jsx
 └─ AuthProvider           ← 인증 도메인 전용
       └─ NotificationProvider  ← UI 알림 전용
             └─ 모든 페이지 컴포넌트
```

### 각 Context의 설계 의도

#### AuthContext — 인증 상태

```js
{ initialized, user, accessToken, isAuthed, login, logout, updateGym }
```

| 설계 결정 | 이유 |
|---|---|
| `initialized` 플래그 분리 | localStorage 복원이 비동기(`useEffect`)로 실행되므로, 복원 완료 전 ProtectedRoute가 잘못된 리다이렉트를 하지 않도록 방어 |
| `isAuthed = !!user && !!accessToken` | 둘 중 하나만 있는 비정상 상태(토큰은 있지만 유저 정보 없음 등)를 인증되지 않은 상태로 처리 |
| `useMemo`로 컨텍스트 값 메모이제이션 | context value 객체가 매 렌더마다 새로 생성되어 모든 구독 컴포넌트가 불필요하게 재렌더되는 것을 방지 |
| `updateGym()`으로 부분 업데이트 | 헬스장 등록 후 전체 재로그인 없이 `user.gym`만 교체 가능, localStorage도 동기화 |

#### NotificationContext — UI 알림

```js
{ showNotification(message, severity) }
```

| 설계 결정 | 이유 |
|---|---|
| Provider 레벨에 단일 Snackbar 배치 | 각 페이지마다 Snackbar 컴포넌트를 중복 선언하지 않아도 됨 |
| `showNotification` 함수만 노출 | 소비자가 Snackbar의 내부 상태(`isOpen`, `conf`)를 직접 조작하지 못하도록 캡슐화 |
| `useCallback` 의존성 배열 `[]` | 함수 참조 안정성 보장 — 부모 재렌더 시에도 동일한 참조 유지 |
| `clickaway` 무시 | 토스트가 실수로 닫히지 않도록 — 3초 타이머 또는 명시적 닫기 버튼으로만 해제 |

#### SseNotification — 실시간 이벤트 (Context가 아닌 Custom Hook)

```js
useSseNotifications(userId) → { notifications, setNotifications, equipmentUpdate }
```

| 설계 결정 | 이유 |
|---|---|
| Context가 아닌 Hook으로 구현 | SSE가 필요한 페이지(대시보드, 기구예약)에서만 구독. 불필요한 컴포넌트가 구독하지 않도록 범위 한정 |
| `useRef`로 EventSource 참조 보관 | ref는 값 변경 시 재렌더를 유발하지 않으므로 연결 유지에 적합 |
| `setNotifications` 노출 | 소비자가 알림을 읽음 처리하거나 초기화할 수 있도록 setter 직접 제공 |
| 브라우저 자동 재연결에 의존 | `EventSource`는 연결 끊김 시 자동 재연결을 브라우저 레벨에서 처리 — 별도 재연결 로직 불필요 |

### 로컬 상태와 전역 상태의 경계

| 상태 종류 | 관리 방법 | 예시 |
|---|---|---|
| 인증 / 세션 | `AuthContext` (전역) | user, token |
| UI 알림 | `NotificationContext` (전역) | 스낵바 메시지 |
| 실시간 이벤트 | `useSseNotifications` Hook (페이지 범위) | equipment-update |
| 페이지 내 폼 입력 | `useState` (로컬) | 이메일, 비밀번호 |
| 페이지 내 서버 데이터 | `useState` (로컬) | 기구 목록, 보관함 목록 |
| 다이얼로그 열림/닫힘 | `useState` (로컬) | `openPaymentDialog` |

---

## 환경 분리 전략

### 환경 변수 파일 구조

Vite는 모드별로 `.env` 파일을 자동 로드합니다.

| 파일 | 로드 시점 | 용도 |
|---|---|---|
| `.env` | 항상 | 공통 기본값 |
| `.env.development` | `vite dev` (개발 서버) | 개발 환경 오버라이드 |
| `.env.production` | `vite build` | 프로덕션 빌드 |
| `.env.local` | 항상 (git 제외 권장) | 개인 로컬 설정 |

### 현재 설정된 환경 변수

```dotenv
# .env (현재 설정)
VITE_API_BASE_URL=http://localhost:8080
IMAGE_BUCKET_API_URL=http://localhost:8080
```

### Vite 환경 변수 노출 규칙

Vite는 보안상 `VITE_` 접두사가 붙은 변수만 클라이언트 번들에 포함합니다.

| 변수 | 접두사 | 클라이언트 노출 | 현재 동작 |
|---|---|---|---|
| `VITE_API_BASE_URL` | O | O | 정상 동작 |
| `IMAGE_BUCKET_API_URL` | X | X | 항상 `undefined` → fallback `localhost:8080` 사용 |

> **주의:** `IMAGE_BUCKET_API_URL`은 `VITE_` 접두사가 없어 런타임에서 항상 `undefined`입니다. S3 이미지 URL이 올바르게 동작하려면 `VITE_IMAGE_BUCKET_API_URL`로 변경이 필요합니다.

### 환경별 설정 분리 방법

프로덕션 배포 시 아래와 같이 `.env.production` 파일을 추가하면 됩니다.

```dotenv
# .env.production (예시)
VITE_API_BASE_URL=https://api.gymbarofit.com
VITE_IMAGE_BUCKET_API_URL=https://s3.ap-northeast-2.amazonaws.com/gymbarofit-bucket
```

빌드 명령:
```bash
vite build              # .env + .env.production 로드
vite build --mode staging  # .env + .env.staging 로드
```

### `src/api-config.js` 구조

```js
export const API_BASE_URL    = import.meta.env.VITE_API_BASE_URL    || "http://localhost:8080";
export const BUCKET_BASE_URL = import.meta.env.IMAGE_BUCKET_API_URL || "http://localhost:8080";
```

두 상수를 한 파일에서 중앙 관리하며, `Api.jsx`와 `SseNotification.jsx`에서 import하여 사용합니다.

---

## 폴더 구조

```
react-vite/
├── .env                          # 환경 변수 (API URL 등)
├── .gitignore
├── index.html                    # Vite HTML 진입점
├── vite.config.js                # Vite 설정 (React 플러그인만 등록)
├── package.json
└── src/
    ├── main.jsx                  # React 앱 진입점 (StrictMode + createRoot)
    ├── App.jsx                   # 라우터 + Provider 트리 구성
    ├── api-config.js             # 환경 변수 기반 BASE URL 상수
    ├── index.css                 # 전역 CSS
    ├── App.css
    │
    ├── api/
    │   └── Api.jsx               # 모든 API 함수 + call() 공통 fetch 래퍼
    │
    ├── context/
    │   ├── AuthContext.jsx       # 인증 상태 (user, token, localStorage 동기화)
    │   ├── NotificationContext.jsx  # 전역 Snackbar 알림
    │   └── SseNotification.jsx   # SSE 실시간 이벤트 Custom Hook
    │
    ├── route/
    │   └── ProtectedRoute.jsx    # 인증 가드 (initialized 체크 + Navigate)
    │
    ├── utils/
    │   └── lockerUtils.js        # 보관함 크기/라벨 매핑 헬퍼
    │
    ├── pages/
    │   ├── Login.jsx             # 로그인 페이지
    │   ├── Signup.jsx            # 회원가입 페이지
    │   ├── members/
    │   │   ├── Dashboard.jsx     # 대시보드 (메인 허브)
    │   │   └── WorkoutHistory.jsx   # 운동 기록 달력 (현재 목업)
    │   ├── gyms/
    │   │   ├── Register.jsx      # 헬스장 검색 + 회원권 등록
    │   │   └── EquipmentReservation.jsx  # 기구 목록 + 사용/대기
    │   └── lockers/
    │       ├── rent.jsx          # 보관함 대여
    │       └── extend.jsx        # 보관함 기간 연장
    │
    └── components/
        ├── lockers/
        │   ├── LockerHeader.jsx        # 상단 AppBar + 구역 탭
        │   ├── LockerStatusPanel.jsx   # 가용/불가 카운트 + 범례
        │   ├── LockerGrid.jsx          # 보관함 시각화 그리드
        │   ├── LockerActionFooter.jsx  # 자동선택 / 확인 하단 버튼
        │   ├── LockerPaymentDialog.jsx # 기간 + 결제수단 선택 다이얼로그
        │   └── LockerEmptyState.jsx    # 구역 없을 때 빈 상태 화면
        └── members/
            └── dashboard/
                ├── DashboardHeader.jsx   # 상단 AppBar + 로그아웃
                ├── GymInfoSection.jsx    # 헬스장 선택 + 혼잡도
                ├── StatsCard.jsx         # 금일 운동 요약 카드
                ├── EquipmentCard.jsx     # 기구 이용/예약 카드
                ├── LockerCard.jsx        # 보관함 상태 카드
                ├── AttendanceCard.jsx    # 출석/연속 카드 (빌드됨, 미연결)
                ├── QrCodeDialog.jsx      # QR 코드 다이얼로그 (빌드됨, 미연결)
                └── RefundDialog.jsx      # 보관함 환불 확인 다이얼로그
```
