import http from 'k6/http';
import { check } from 'k6';
import { BASE_URL } from './http.js';

/**
 * 멤버 로그인. 성공 시 { accessToken, refreshToken, userId, gymId } 반환.
 * 실패 시 null 반환.
 */
export function memberLogin(email, password) {
  const res = http.post(
    `${BASE_URL}/members/login`,
    JSON.stringify({ email, password }),
    { headers: { 'Content-Type': 'application/json' }, tags: { endpoint: 'login' } }
  );

  const ok = check(res, {
    'login 200': (r) => r.status === 200,
    'has accessToken': (r) => {
      try { return !!r.json('token.accessToken'); } catch { return false; }
    },
  });

  if (!ok) return null;

  return {
    accessToken:  res.json('token.accessToken'),
    refreshToken: res.json('refreshToken'),
    userId:       res.json('userInfo.id'),
    gymId:        res.json('userInfo.gym') ? res.json('userInfo.gym.id') : null,
  };
}

/**
 * 리프레시 토큰으로 액세스 토큰 재발급.
 * k6는 HttpOnly 쿠키를 사용하지 않으므로 body로 전송.
 */
export function refreshAccessToken(refreshToken) {
  const res = http.post(
    `${BASE_URL}/auth/refresh`,
    JSON.stringify({ refreshToken }),
    { headers: { 'Content-Type': 'application/json' } }
  );
  if (res.status !== 200) return null;
  return res.json('accessToken');
}
