import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const AUTH_BYPASS = import.meta.env.VITE_AUTH_BYPASS === "true";

export default function ProtectedRoute({ requiredRole }) {
  const { initialized, isAuthed, user } = useAuth();
  const location = useLocation();

  // bypass 모드: 인증/역할 체크 없이 통과
  if (AUTH_BYPASS) return <Outlet />;

  // localStorage 복원 끝날 때까지는 리다이렉트 금지
  if (!initialized) return null;

  if (!isAuthed) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (requiredRole && user?.role !== requiredRole) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}