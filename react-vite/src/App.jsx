import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import MemberDashboard from "./pages/members/Dashboard"
import LockerReservation from "./pages/locker/reservation"
import LockerExtension from "./pages/locker/extension"

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/members/dashboard" element={<MemberDashboard />} />
        <Route path="/locker/reservation" element={<LockerReservation />} />
        <Route path="/locker/extension" element={<LockerExtension />} />
      </Routes>
    </BrowserRouter>
  );
}
