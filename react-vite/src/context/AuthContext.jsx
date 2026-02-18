import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

const AuthContext = createContext(null);

const USER_KEY = "USER";
const TOKEN_KEY = "ACCESS_TOKEN";

export function AuthProvider({ children }) {
  const [initialized, setInitialized] = useState(false); // ✅ 복원 완료 여부
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(null);

  // ✅ 앱 시작 시 localStorage에서 복원
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem(USER_KEY);
      const storedToken = localStorage.getItem(TOKEN_KEY);

      if (storedUser) setUser(JSON.parse(storedUser));
      if (storedToken) setAccessToken(storedToken);
    } finally {
      setInitialized(true);
    }
  }, []);

  // ✅ 로그인: user/token 저장 + state 반영
  const login = (userData, token) => {
    setUser(userData);
    setAccessToken(token);

    localStorage.setItem(USER_KEY, JSON.stringify(userData));
    localStorage.setItem(TOKEN_KEY, token);
  };

  // ✅ 로그아웃: 전부 제거
  const logout = () => {
    setUser(null);
    setAccessToken(null);

    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(TOKEN_KEY);
  };

  // ✅ 인증 여부는 "user && token" 기준 추천
  const isAuthed = !!user && !!accessToken;

  const updateGym = (newGym) => {
    setUser((prevUser) => {
      if (!prevUser) return prevUser;

      const updatedUser = {
        ...prevUser,
        gym: newGym,
      };

      // localStorage도 함께 갱신
      localStorage.setItem("USER", JSON.stringify(updatedUser));

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
