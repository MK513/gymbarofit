import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import { tokenService } from "../utils/tokenService";

const AuthContext = createContext(null);

const AUTH_BYPASS = import.meta.env.VITE_AUTH_BYPASS === "true";
const BYPASS_ROLE = import.meta.env.VITE_AUTH_BYPASS_ROLE || "owner";
const BYPASS_USER = { name: "개발자(bypass)", role: BYPASS_ROLE };
const BYPASS_TOKEN = "dev-bypass-token";

export function AuthProvider({ children }) {
  const [initialized, setInitialized] = useState(false);
  const [user, setUser] = useState(AUTH_BYPASS ? BYPASS_USER : null);
  const [accessToken, setAccessToken] = useState(AUTH_BYPASS ? BYPASS_TOKEN : null);

  // 앱 시작 시 localStorage에서 복원
  useEffect(() => {
    if (AUTH_BYPASS) {
      setInitialized(true);
      return;
    }
    try {
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

  // 401 토큰 만료 시 자동 로그아웃 (bypass 모드에서는 스킵)
  const logoutRef = useRef(logout);
  logoutRef.current = logout;
  useEffect(() => {
    if (AUTH_BYPASS) return;
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
