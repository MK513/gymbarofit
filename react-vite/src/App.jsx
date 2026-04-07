import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from "./context/NotificationContext";
import { isAdminDomain, redirectIfLocalhost } from "./utils/domainUtils";

// localhost 접속 시 즉시 lvh.me로 리다이렉트
redirectIfLocalhost();

import ProtectedRoute from "./route/ProtectedRoute";

import Login from "./pages/Login";
import Signup from "./pages/Signup";
import MemberDashboard from "./pages/members/Dashboard"
import WorkoutHistory from "./pages/members/WorkoutHistory"

import EquipmentReservation from "./pages/gyms/EquipmentReservation"
import MembershipRegister from "./pages/gyms/MembershipRegister"
import LockerRent from "./pages/lockers/Rent"
import LockerExtend from "./pages/lockers/Extend"
import OwnerLayout from "./pages/owners/OwnerLayout"
import OwnerDashboard from "./pages/owners/Dashboard"
import GymRegister from "./pages/owners/GymRegister"
import GymDetail from "./pages/owners/GymDetail"
import GymLockerManage from "./pages/owners/GymLockerManage"
import GymEquipmentManage from "./pages/owners/GymEquipmentManage"

const adminDomain = isAdminDomain();

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
      <NotificationProvider>

        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {adminDomain ? (
            /* ── 운영자 영역 (admin.lvh.me) ── */
            <Route element={<ProtectedRoute requiredRole="owner" />}>
              <Route element={<OwnerLayout />}>
                <Route path="/dashboard" element={<OwnerDashboard />} />
                <Route path="/gyms/:gymId" element={<GymDetail />} />
                <Route path="/gyms/:gymId/lockers" element={<GymLockerManage />} />
                <Route path="/gyms/:gymId/equipments" element={<GymEquipmentManage />} />
              </Route>
              <Route path="/gyms/register" element={<GymRegister />} />
            </Route>
          ) : (
            /* ── 회원 영역 (lvh.me / localhost) ── */
            <Route element={<ProtectedRoute requiredRole="member" />}>
              <Route path="/dashboard" element={<MemberDashboard />} />
              <Route path="/history" element={<WorkoutHistory />} />
              <Route path="/gyms/register" element={<MembershipRegister />} />
              <Route path="/gyms/:gymId/equipments" element={<EquipmentReservation />} />
              <Route path="/lockers/rent" element={<LockerRent />} />
              <Route path="/lockers/extend/:usageId" element={<LockerExtend />} />
            </Route>
          )}
        </Routes>

      </NotificationProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
