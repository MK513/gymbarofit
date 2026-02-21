import { API_BASE_URL } from "../api-config";
import { tokenService } from "../utils/tokenService";

export function call(api, method, request, pathVariables) {
  const headers = new Headers({
    "Content-Type": "application/json",
  });

  const accessToken = tokenService.getToken();
  if (accessToken) {
    headers.append("Authorization", "Bearer " + accessToken);
  }

  if (pathVariables) {
    for (const key in pathVariables) {
      const regex = new RegExp(`{${key}}`, "g");
      api = api.replace(regex, pathVariables[key]);
    }
  }

  let url = API_BASE_URL + api;
  let body = null;

  if (method.toUpperCase() === "GET") {
    if (request) {
      const queryParams = new URLSearchParams(request).toString();
      url += `?${queryParams}`;
    }
  } else {
    if (request) {
      body = JSON.stringify(request);
    }
  }

  const options = { headers, method, body };

  return fetch(url, options).then(async (response) => {
    const isJson = response.headers
      .get("content-type")
      ?.includes("application/json");

    if (response.status === 401) {
      window.dispatchEvent(new CustomEvent("auth:unauthorized"));
      throw { status: 401, message: "인증이 만료되었습니다." };
    }

    if (response.ok) {
      return isJson ? response.json() : {};
    }

    const error = isJson ? await response.json() : {};
    throw error;
  });
}
