import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from './context/AuthContext';
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import MemberDashboard from "./pages/members/Dashboard"
import MemberGymRegister from "./pages/members/GymRegister"
import LockerReservation from "./pages/locker/reservation"
import LockerExtension from "./pages/locker/extension"

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          <Route path="/members/dashboard" element={<MemberDashboard />} />
          <Route path="/members/gym/register" element={<MemberGymRegister />} />

          <Route path="/locker/reservation" element={<LockerReservation />} />
          <Route path="/locker/extension" element={<LockerExtension />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
