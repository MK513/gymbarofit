import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from "./context/NotificationContext";

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

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
      <NotificationProvider>

        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* Member 전용 */}
          <Route element={<ProtectedRoute requiredRole="member" />}>
            <Route path="/members" element={<MemberDashboard />} />
            <Route path="/members/history" element={<WorkoutHistory />} />

            <Route path="/gyms/register" element={<MembershipRegister />} />
            <Route path="/gyms/:gymId/equipments" element={<EquipmentReservation />} />

            <Route path="/lockers/rent" element={<LockerRent />} />
            <Route path="/lockers/extend/:usageId" element={<LockerExtend />} />
          </Route>

          {/* Owner 전용 */}
          <Route element={<ProtectedRoute requiredRole="owner" />}>
            {/* 공유 레이아웃 (AppBar + 사이드바) */}
            <Route element={<OwnerLayout />}>
              <Route path="/owners" element={<OwnerDashboard />} />
              <Route path="/owners/gyms/:gymId" element={<GymDetail />} />
              <Route path="/owners/gyms/:gymId/lockers" element={<GymLockerManage />} />
              <Route path="/owners/gyms/:gymId/equipments" element={<GymEquipmentManage />} />
            </Route>
            {/* 풀스크린 독립 페이지 */}
            <Route path="/owners/gyms/register" element={<GymRegister />} />
          </Route>
        </Routes>

      </NotificationProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
