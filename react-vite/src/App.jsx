import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from "./context/NotificationContext";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import MemberDashboard from "./pages/members/Dashboard"
import MembershipRegister from "./pages/gyms/Register"
import LockerRent from "./pages/lockers/rent"
import LockerExtend from "./pages/lockers/extend"

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

          <Route path="/lockers/rent" element={<LockerRent />} />
          <Route path="/lockers/extend/:usageId" element={<LockerExtend />} />
        </Routes>

      </NotificationProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
