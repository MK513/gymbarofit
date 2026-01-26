import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute() {
  const { initialized, isAuthed } = useAuth();
  const location = useLocation();

  // localStorage 복원 끝날 때까지는 리다이렉트 금지
  if (!initialized) return null; // 또는 로딩 UI

  if (!isAuthed) {
    console.log("NOT AUTED");
    return <Navigate to="/login" replace state={{ from: location }} />;
  }
  console.log("AUTED");

  return <Outlet />;
}