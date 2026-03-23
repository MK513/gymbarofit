import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { tokenService } from "../utils/tokenService";
import { getCorrectDomainForRole } from "../utils/domainUtils";

export default function ProtectedRoute({ requiredRole }) {
  const { initialized, isAuthed, user } = useAuth();
  const location = useLocation();

  // localStorage 복원 끝날 때까지는 리다이렉트 금지
  if (!initialized) return null;

  if (!isAuthed) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (requiredRole && user?.role !== requiredRole) {
    // 인증됐지만 잘못된 도메인 → 올바른 도메인으로 cross-domain redirect
    const token = tokenService.getToken();
    const userEncoded = encodeURIComponent(JSON.stringify(user));
    const correctBase = getCorrectDomainForRole(user.role);
    window.location.href = `${correctBase}/dashboard?token=${token}&user=${userEncoded}`;
    return null;
  }

  return <Outlet />;
}
