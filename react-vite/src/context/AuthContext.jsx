import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import { tokenService } from "../utils/tokenService";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [initialized, setInitialized] = useState(false);
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(null);

  // 앱 시작 시 localStorage에서 복원 (cross-domain handshake 포함)
  useEffect(() => {
    try {
      // Cross-domain handshake: URL에 token/user 파라미터가 있으면 먼저 소비
      const params = new URLSearchParams(window.location.search);
      const urlToken = params.get('token');
      const urlUser  = params.get('user');
      if (urlToken && urlUser) {
        try {
          const parsedUser = JSON.parse(decodeURIComponent(urlUser));
          tokenService.setToken(urlToken);
          tokenService.setUser(parsedUser);
        } catch (_) { /* malformed → 무시 */ }
        // 주소창에서 민감 파라미터 즉시 제거 (첫 렌더 전)
        window.history.replaceState({}, '', window.location.pathname);
      }

      const storedUser = tokenService.getUser();
      const storedToken = tokenService.getToken();

      if (storedUser) setUser(storedUser);
      if (storedToken) setAccessToken(storedToken);
    } finally {
      setInitialized(true);
    }
  }, []);

  const logout = () => {
    setUser(null);
    setAccessToken(null);
    tokenService.clear();
  };

  // 401 토큰 만료 시 자동 로그아웃
  const logoutRef = useRef(logout);
  logoutRef.current = logout;
  useEffect(() => {
    const handler = () => logoutRef.current();
    window.addEventListener("auth:unauthorized", handler);
    return () => window.removeEventListener("auth:unauthorized", handler);
  }, []);

  const login = (userData, token) => {
    setUser(userData);
    setAccessToken(token);
    tokenService.setUser(userData);
    tokenService.setToken(token);
  };

  const isAuthed = !!user && !!accessToken;

  const updateGym = (newGym) => {
    setUser((prevUser) => {
      if (!prevUser) return prevUser;
      const updatedUser = { ...prevUser, gym: newGym };
      tokenService.setUser(updatedUser);
      return updatedUser;
    });
  };

  const value = useMemo(
    () => ({
      initialized,
      user,
      accessToken,
      isAuthed,
      login,
      logout,
      updateGym,
    }),
    [initialized, user, accessToken, isAuthed]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
