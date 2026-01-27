import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from "./context/NotificationContext";

import ProtectedRoute from "./route/ProtectedRoute";

import Login from "./pages/Login";
import Signup from "./pages/Signup";
import MemberDashboard from "./pages/members/Dashboard"
import WorkoutHistory from "./pages/members/WorkoutHistory"

import EquipmentReservation from "./pages/gyms/EquipmentReservation"
import MembershipRegister from "./pages/gyms/Register"
import LockerRent from "./pages/lockers/rent"
import LockerExtend from "./pages/lockers/extend"

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
      <NotificationProvider>

        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          
          {/* Member */}
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<MemberDashboard />} />
            <Route path="/members/dashboard" element={<MemberDashboard />} />
            <Route path="/members/history" element={<WorkoutHistory />} />

            <Route path="/gyms/register" element={<MembershipRegister />} />
            <Route path="/gyms/:gymId/equipments" element={<EquipmentReservation />} />

            <Route path="/lockers/rent" element={<LockerRent />} />
            <Route path="/lockers/extend/:usageId" element={<LockerExtend />} />
          </Route>
        </Routes>

      </NotificationProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
