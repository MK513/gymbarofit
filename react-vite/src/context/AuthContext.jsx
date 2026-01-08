// src/context/AuthContext.jsx
import React, { createContext, useState, useContext, useEffect } from 'react';

// Context 생성
const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); // 사용자 정보 객체

  // 앱 실행 시 localStorage에 저장된 정보가 있다면 불러오기 (로그인 유지)
  useEffect(() => {
    const storedUser = localStorage.getItem('USER');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  // 로그인 함수: API 응답으로 받은 데이터를 state와 localStorage에 저장
  const login = (userData) => {
    setUser(userData);
    localStorage.setItem('USER', JSON.stringify(userData));
  };

  // 로그아웃 함수: state 초기화 및 localStorage 삭제
  const logout = () => {
    setUser(null);
    localStorage.removeItem('USER');
    localStorage.removeItem('ACCESS_TOKEN');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// 커스텀 훅: 컴포넌트에서 쉽게 Context를 쓰기 위함
export const useAuth = () => useContext(AuthContext);