import { API_BASE_URL } from "../api-config";

export function call(api, method, request) {
  let headers = new Headers({
    "Content-Type": "application/json",
  });

  const accessToken = localStorage.getItem("ACCESS_TOKEN");
  if (accessToken && accessToken !== null) {
    headers.append("Authorization", "Bearer " + accessToken);
  }

  let options = {
    headers: headers,
    method: method,
  };

  if (request) {
    options.body = JSON.stringify(request);
  }

  console.log(API_BASE_URL + api);
  console.log(request);

  return fetch(API_BASE_URL + api, options)
    .then((response) => {
      const contentType = response.headers.get("content-type");

      if (response.ok) {
        if (contentType && contentType.includes("application/json")) {
          return response.json(); // Parse JSON here
        } else {
          console.log("CH");
          return { message: response.statusText };
        }
      } else if (response.status === 403) {
        window.location.href = "/login"; // Redirect
        return Promise.reject("Unauthorized");
      } else {
        // 에러 응답도 JSON 형식일 수 있으므로 json 파싱 시도
        if (contentType && contentType.includes("application/json")) {
          return response.json().then(err => {
            return Promise.reject(err);
          });
        } else {
          return Promise.reject({ message: response.statusText });
        }
      }
    })
    .catch((error) => {
      console.error("http error", error);
      return null;
    });
}

export async function login(userDTO) {
  try {
    const response = await call("/members/login", "POST", userDTO);

    // response = { accessToken, expiresIn }
    const { accessToken, expiresIn } = response;

    if (!accessToken) {
      throw new Error("AccessToken not found in response");
    }

    // 토큰 저장
    localStorage.setItem("ACCESS_TOKEN", accessToken);

    // (선택) 만료 시각 저장
    if (expiresIn) {
      localStorage.setItem(
        "ACCESS_TOKEN_EXPIRES_AT",
        String(Date.now() + expiresIn)
      );
    }

    // 성공 시 아무 값이나 반환하거나 true 반환
    return true;
  } catch (e) {
    console.error("Login 실패:", e);
    throw e; // ⭐ 실패는 호출부에서 처리
  }
}
