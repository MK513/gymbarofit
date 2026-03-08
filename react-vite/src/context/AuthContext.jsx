import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import { tokenService } from "../utils/tokenService";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [initialized, setInitialized] = useState(false);
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(null);

  // 앱 시작 시 localStorage에서 복원
  useEffect(() => {
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
