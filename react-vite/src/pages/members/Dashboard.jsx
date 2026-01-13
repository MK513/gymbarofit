import React, { useState, useEffect } from "react";
import { Box, Container, Stack } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { getMembershipInfo, refundLocker } from "../../api/Api";
import { useNotification } from "../../context/NotificationContext";

// 분리된 하위 컴포넌트 임포트
import DashboardHeader from "../../components/members/dashboard/DashboardHeader";
import GymInfoSection from "../../components/members/dashboard/GymInfoSection";
import AttendanceCard from "../../components/members/dashboard/AttendanceCard";
import StatsCard from "../../components/members/dashboard/StatsCard";
import MachineReservationCard from "../../components/members/dashboard/MachineReservationCard";
import LockerCard from "../../components/members/dashboard/LockerCard";
import QrCodeDialog from "../../components/members/dashboard/QrCodeDialog";
import RefundDialog from "../../components/members/dashboard/RefundDialog";

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { showNotification } = useNotification();

  // --- 상태 관리 ---
  const [lockerStatus, setLockerStatus] = useState({ use: false, number: 0, expiry: "", id: null, zoneName: "" });
  const [equipStatus] = useState({ use: false, name: "", time: "" });
  const [attendance, setAttendance] = useState({ streak: 3, checkedToday: false });
  const [openQr, setOpenQr] = useState(false);
  const [openRefundDialog, setOpenRefundDialog] = useState(false);
  const [myGyms, setMyGyms] = useState([]);
  const [currentGym, setCurrentGym] = useState(null);
  const [crowdStatus, setCrowdStatus] = useState({ label: "정보 없음", bgColor: "#f5f5f5", color: "#9e9e9e", borderColor: "#e0e0e0" });

  // --- 헬퍼 함수들 (포맷, 혼잡도 계산) ---
  const formatDateFromArray = (dateArr) => {
    if (!dateArr || dateArr.length < 3) return "";
    return `${dateArr[0]}-${String(dateArr[1]).padStart(2, "0")}-${String(dateArr[2]).padStart(2, "0")}`;
  };

  const getCrowdLevelInfo = (level) => {
    switch (level) {
      case "VERY_COMFORTABLE": return { label: "매우 쾌적 🔵", bgColor: "#e3f2fd", color: "#1565c0", borderColor: "#90caf9" };
      case "COMFORTABLE": return { label: "쾌적 🟢", bgColor: "#e8f5e9", color: "#2e7d32", borderColor: "#c8e6c9" };
      case "NORMAL": return { label: "보통 🟡", bgColor: "#fff3e0", color: "#ef6c00", borderColor: "#ffe0b2" };
      case "CROWDED": return { label: "혼잡 🟠", bgColor: "#fbe9e7", color: "#d84315", borderColor: "#ffccbc" };
      case "VERY_CROWDED": return { label: "매우 혼잡 🔴", bgColor: "#ffebee", color: "#c62828", borderColor: "#ffcdd2" };
      default: return { label: "정보 없음 ⚪", bgColor: "#f5f5f5", color: "#9e9e9e", borderColor: "#e0e0e0" };
    }
  };

  // --- API 호출 및 Effects ---
  const loadGymData = async (gymToLoad) => {
     try {
        if (!gymToLoad) {
          setMyGyms([]);
          setCurrentGym(null);
          setLockerStatus({ use: false, number: 0, expiry: "" });
          return;
        }

        const pathVariable = { gymId: gymToLoad.id };
        const res = await getMembershipInfo(pathVariable);

        setMyGyms(res.gymList);
        setCurrentGym(gymToLoad);

        if (res?.crowdLevel) {
          setCrowdStatus(getCrowdLevelInfo(res.crowdLevel));
        }

        if (res.lockerUsage) {
          setLockerStatus({
            use: true,
            number: res.lockerUsage.lockerNumber,
            expiry: formatDateFromArray(res.lockerUsage.endDate),
            id: res.lockerUsage.usageId,
            zoneName: res.lockerUsage.zoneName,
          });
        } else {
          setLockerStatus({ use: false, number: 0, expiry: "", id: null, zoneName: "" });
        }
      } catch (error) {
        console.error("정보 로딩 실패", error);
        showNotification("정보를 불러오지 못했습니다.", "error");
      }
  };

  useEffect(() => {
    if (user?.gym) loadGymData(user.gym);
    else loadGymData(null);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!user) navigate("/login");
  }, [user, navigate]);

  if (!user) return null;

  // --- 이벤트 핸들러 ---
  const handleLogout = () => {
    logout();
    showNotification("로그아웃 되었습니다.", "info");
    navigate("/login");
  };

  const handleCheckIn = () => {
    if (attendance.checkedToday) return;
    setAttendance(prev => ({ streak: prev.streak + 1, checkedToday: true }));
    alert(`출석체크 완료! 🔥\n${attendance.streak + 1}일 연속 운동 중입니다.`);
  };

  const handleGymSelect = async (gym) => {
    user.gym = gym; // AuthContext의 user 객체 업데이트 (필요시 context setter 사용 권장)
    await loadGymData(gym);
  };

  const handleRefundClick = () => {
    if (!lockerStatus.id) {
      showNotification("보관함 정보를 찾을 수 없습니다.", "error");
      return;
    }
    setOpenRefundDialog(true);
  };

  const handleRefundConfirm = async () => {
    try {
      await refundLocker({ usageId: lockerStatus.id });
      showNotification("환불 처리가 완료되었습니다.", "success");
      setLockerStatus({ use: false, number: 0, expiry: "", id: null, zoneName: "" });
      setOpenRefundDialog(false);
    } catch (error) {
      console.error("환불 실패", error);
      showNotification(error.response?.data?.message || "환불 실패", "error");
      setOpenRefundDialog(false);
    }
  };

  return (
    <Box sx={{ flexGrow: 1, bgcolor: "#f5f7fa", minHeight: "100vh" }}>
      <DashboardHeader onLogout={handleLogout} />

      <Container maxWidth="sm" sx={{ mt: 3, mb: 4, px: 3 }}>
        <Stack spacing={3} sx={{ width: "100%" }}>
          
          <GymInfoSection 
            userName={user.name || "회원"}
            currentGym={currentGym}
            myGyms={myGyms}
            crowdStatus={crowdStatus}
            onGymSelect={handleGymSelect}
            onRegister={() => navigate('/gyms/register')}
          />

          <AttendanceCard 
            attendance={attendance} 
            onCheckIn={handleCheckIn} 
            onOpenQr={() => setOpenQr(true)} 
          />

          <StatsCard weeklyProgress={70} />

          <MachineReservationCard equipStatus={equipStatus} />

          <LockerCard 
            lockerStatus={lockerStatus} 
            onRefundClick={handleRefundClick}
            onNewReservation={() => navigate('/lockers/rent')}
          />

        </Stack>
      </Container>

      {/* Dialogs */}
      <QrCodeDialog 
        open={openQr} 
        onClose={() => setOpenQr(false)} 
      />
      
      <RefundDialog 
        open={openRefundDialog} 
        onClose={() => setOpenRefundDialog(false)} 
        onConfirm={handleRefundConfirm}
        lockerNumber={lockerStatus.number}
      />
    </Box>
  );
}