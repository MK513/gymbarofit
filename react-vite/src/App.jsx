import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from "./context/NotificationContext";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import MemberDashboard from "./pages/members/Dashboard"
import MembershipRegister from "./pages/gyms/Register"
import LockerReservation from "./pages/locker/reservation"
import LockerExtension from "./pages/locker/extension"

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
      <NotificationProvider>

        <Routes>
          <Route path="/" element={<MemberDashboard />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          <Route path="/members/dashboard" element={<MemberDashboard />} />

          <Route path="/gyms/register" element={<MembershipRegister />} />

          <Route path="/locker/reservation" element={<LockerReservation />} />
          <Route path="/locker/extension" element={<LockerExtension />} />
        </Routes>

      </NotificationProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
