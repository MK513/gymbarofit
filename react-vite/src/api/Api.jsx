import { API_BASE_URL } from "../api-config";

/* 공통 fetch */
export function call(api, method, request) {
  const headers = new Headers({
    "Content-Type": "application/json",
  });

  const accessToken = localStorage.getItem("ACCESS_TOKEN");
  if (accessToken) {
    headers.append("Authorization", "Bearer " + accessToken);
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
export async function getMembershipInfo() {
  const res = await call("/memberships/info", "GET", null);
  return res;
}

export async function searchGym(dto) {
  const res = await call("/gyms/search", "GET", dto);
  return res;
}

export async function registerMembership(dto) {
  const res = await call("/memberships/register", "POST", dto);
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