import { API_BASE_URL } from "../api-config";

/* 공통 fetch */
// pathVariables 파라미터 추가 (기본값 null)
export function call(api, method, request, pathVariables) {
  const headers = new Headers({
    "Content-Type": "application/json",
  });

  const accessToken = localStorage.getItem("ACCESS_TOKEN");
  if (accessToken) {
    headers.append("Authorization", "Bearer " + accessToken);
  }

  // Path Variable 처리 (URL 치환)
  // 예: api가 "/gyms/{gymId}"이고 pathVariables가 { gymId: 1 } 이면 -> "/gyms/1"로 변환
  if (pathVariables) {
    for (const key in pathVariables) {
      // 정규식으로 {key} 형태를 찾아 값으로 치환 (모든 발생 부분 치환)
      const regex = new RegExp(`{${key}}`, "g");
      api = api.replace(regex, pathVariables[key]);
    }
  }

  // URL 설정
  let url = API_BASE_URL + api;
  let body = null;

  // GET 방식이면 request를 Query Parameter로 변환
  if (method.toUpperCase() === "GET") {
    if (request) {
      const queryParams = new URLSearchParams(request).toString();
      url += `?${queryParams}`;
    }
  } 
  // GET이 아니면(POST, PUT 등) Body에 JSON 담기
  else {
    if (request) {
      body = JSON.stringify(request);
    }
  }

  const options = {
    headers,
    method,
    body: body,
  };

  return fetch(url, options).then(async (response) => {
    const isJson = response.headers
      .get("content-type")
      ?.includes("application/json");

    if (response.ok) {
      return isJson ? response.json() : {};
    }

    const error = isJson ? await response.json() : {};
    throw error;
  });
}

/* ===== 대시보드 ===== */
export async function getMembershipInfo(pathVarable) {
  const res = await call("/memberships/{gymId}/info", "GET", null, pathVarable);
  return res;
}

/* ===== 보관함 ===== */
export async function getLockerZone(dto) {
  const res = await call("/lockers/zones", "GET", dto);
  return res;
}

export async function getLockerList(pathVarable) {
  const res = await call("/lockers/zones/{zoneId}", "GET", null, pathVarable);
  return res;
}

export async function getLockerInfo(pathVarable) {
  const res = await call("/lockers/usages/{usageId}/extend", "GET", null, pathVarable);
  return res;
}

export async function rentLocker(dto) {
  const res = await call("/lockers/usages", "POST", dto);
  return res;
}

export async function refundLocker(pathVarable) {
  const res = await call("/lockers/usages/{usageId}", "DELETE", null, pathVarable);
  return res;
}

export async function extendLocker(dto, pathVarable) {
  const res = await call("/lockers/usages/{usageId}/extend", "POST", dto, pathVarable);
  return res;
}


/* ===== 헬스장 ===== */
export async function searchGym(dto) {
  const res = await call("/gyms/search", "GET", dto);
  return res;
}

export async function registerGym(pathVarable) {
  const res = await call("/gyms/{gymId}/memberships", "POST", null, pathVarable);
  return res;
}

/* ===== 로그인 ===== */
export async function loginMember(dto) {
  return login("/members/login", dto);
}

export async function loginOwner(dto) {
  return login("/owners/login", dto);
}

async function login(url, dto) {
  const res = await call(url, "POST", dto);
  localStorage.setItem("ACCESS_TOKEN", res.token.accessToken);
  return res.userInfo;
}

/* ===== 회원가입 ===== */
export const signupMember = (dto) =>
  call("/members/register", "POST", dto);

export const signupOwner = (dto) =>
  call("/owners/register", "POST", dto);