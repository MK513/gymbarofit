import http from 'k6/http';

export const BASE_URL = __ENV.BASE_URL || 'http://localhost:8080';

const authHeaders = (token) => ({
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  },
});

export function authedGet(path, token, params = {}) {
  return http.get(`${BASE_URL}${path}`, { ...authHeaders(token), ...params });
}

export function authedPost(path, token, body = null, params = {}) {
  return http.post(
    `${BASE_URL}${path}`,
    body ? JSON.stringify(body) : null,
    { ...authHeaders(token), ...params }
  );
}

export function authedPatch(path, token, body = null, params = {}) {
  return http.patch(
    `${BASE_URL}${path}`,
    body ? JSON.stringify(body) : null,
    { ...authHeaders(token), ...params }
  );
}

export function authedDelete(path, token, params = {}) {
  return http.del(`${BASE_URL}${path}`, null, { ...authHeaders(token), ...params });
}
