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

  const options = {
    headers,
    method,
    body: request ? JSON.stringify(request) : null,
  };

  return fetch(API_BASE_URL + api, options).then(async (response) => {
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
