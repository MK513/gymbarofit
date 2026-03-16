import React, { useEffect } from "react";
import { Box, Container, Stack } from "@mui/material";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../../context/AuthContext";
import { refundLocker } from "../../api/locker";
import { startUsage, endUsage, leaveQueue } from "../../api/equipment";
import { checkIn, checkOut } from "../../api/gym";
import { useNotification } from "../../context/NotificationContext";
import { useSseNotifications } from "../../context/SseNotification";
import { useDashboard } from "../../hooks/useDashboard";

// 하위 컴포넌트
import DashboardHeader from "../../components/members/dashboard/DashboardHeader";
import GymInfoSection from "../../components/members/dashboard/GymInfoSection";
import AttendanceCard from "../../components/members/dashboard/AttendanceCard";
import StatsCard from "../../components/members/dashboard/StatsCard";
import EquipmentCard from "../../components/members/dashboard/EquipmentCard";
import LockerCard from "../../components/members/dashboard/LockerCard";
import RefundDialog from "../../components/members/dashboard/RefundDialog";

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, logout, updateGym } = useAuth();
  const { showNotification } = useNotification();
  const { notifications } = useSseNotifications(user?.id);

  const {
    lockerStatus, setLockerStatus,
    equipmentInfo, setEquipmentInfo,
    historyInfo,
    openRefundDialog, setOpenRefundDialog,
    myGyms, currentGym,
    crowdStatus,
    checkInStatus, setCheckInStatus,
    loadGymData,
  } = useDashboard(user?.gym ?? null);

  // SSE 알림 수신 처리
  useEffect(() => {
    if (notifications.length > 0) {
      const latest = notifications[0];
      if (latest.type === "WAITING_AVAILABLE") {
        showNotification(`${latest.title} ${latest.body}`, "info");
        setEquipmentInfo((prev) => {
          if (!prev.reservation) return prev;
          return {
            ...prev,
            reservation: { ...prev.reservation, status: "CALLED", time: "지금 바로 사용 가능합니다!" },
          };
        });
      }
    }
  }, [notifications, showNotification]);

  // 이벤트 핸들러
  const handleLogout = () => {
    logout();
    showNotification("로그아웃 되었습니다.", "info");
    navigate("/login");
  };

  const handleGymSelect = async (gym) => {
    updateGym(gym);
    await loadGymData(gym);
  };

  const handleRefundConfirm = async () => {
    try {
      await refundLocker({ usageId: lockerStatus.id });
      showNotification("환불 처리가 완료되었습니다.", "success");
      setLockerStatus({ use: false, number: 0, expiry: "", id: null, zoneName: "" });
      setOpenRefundDialog(false);
    } catch (error) {
      showNotification("환불에 실패했습니다.", "error");
      setOpenRefundDialog(false);
    }
  };

  const handleEquipmentReservationClick = () => {
    navigate(`/gyms/${user.gym.id}/equipments`, {
      state: { usage: equipmentInfo.usage },
    });
  };

  const handleStartUsage = async () => {
    try {
      await startUsage({ usageId: equipmentInfo.reservation.uid });
      showNotification("기구 사용을 시작합니다.", "success");
      await loadGymData(user.gym);
    } catch (e) {
      showNotification("운동 시작 처리에 실패했습니다.", "error");
    }
  };

  const handleEndUsage = async () => {
    try {
      await endUsage({ usageId: equipmentInfo.usage.uid });
      showNotification("기구 사용이 종료되었습니다.", "success");
      await loadGymData(user.gym);
    } catch (e) {
      showNotification("기구 사용 종료에 실패했습니다.", "error");
    }
  };

  const handleLeftQueue = async () => {
    try {
      await leaveQueue({ usageId: equipmentInfo.reservation.uid });
      showNotification("기구 예약이 취소되었습니다.", "success");
      await loadGymData(user.gym);
    } catch (e) {
      showNotification("기구 예약 취소에 실패했습니다.", "error");
    }
  };

  const handleCheckIn = async () => {
    try {
      const res = await checkIn({ gymId: currentGym.id });
      setCheckInStatus({
        isCheckedIn: res.checkedIn,
        checkedToday: res.checkedToday,
        streak: res.streak,
        checkedInAt: res.checkedInAt,
      });
      showNotification("체크인 완료! 즐거운 운동 되세요.", "success");
    } catch (e) {
      showNotification("체크인에 실패했습니다.", "error");
    }
  };

  const handleCheckOut = async () => {
    try {
      const res = await checkOut({ gymId: currentGym.id });
      setCheckInStatus({
        isCheckedIn: res.checkedIn,
        checkedToday: res.checkedToday,
        streak: res.streak,
        checkedInAt: res.checkedInAt,
      });
      showNotification("체크아웃 완료! 수고하셨습니다.", "success");
    } catch (e) {
      showNotification("체크아웃에 실패했습니다.", "error");
    }
  };

  return (
    <Box sx={{ flexGrow: 1, bgcolor: "#f5f7fa", minHeight: "100vh" }}>
      <DashboardHeader onLogout={handleLogout} />

      <Container maxWidth="sm" sx={{ mt: 3, mb: 4, px: 3 }}>
        <Stack spacing={3} sx={{ width: "100%" }}>

          <GymInfoSection
            userName={user?.name ?? "회원"}
            currentGym={currentGym}
            myGyms={myGyms}
            crowdStatus={crowdStatus}
            onGymSelect={handleGymSelect}
            onRegister={() => navigate("/gyms/register")}
          />

          {currentGym && (
            <AttendanceCard
              attendance={checkInStatus}
              onCheckIn={handleCheckIn}
              onCheckOut={handleCheckOut}
            />
          )}

          <StatsCard
            totalMinutes={historyInfo.totalMinutes}
            totalCalories={historyInfo.totalCalories}
            activities={historyInfo.activities}
            onMoreClick={() => navigate("/members/history")}
          />

          <EquipmentCard
            usageData={equipmentInfo.usage}
            reservationData={equipmentInfo.reservation}
            onStartUsageClick={handleStartUsage}
            onEndUsageClick={handleEndUsage}
            onCancelReservationClick={handleLeftQueue}
            onReservationClick={handleEquipmentReservationClick}
          />

          <LockerCard
            lockerStatus={lockerStatus}
            onRefundClick={() => setOpenRefundDialog(true)}
            onNewReservation={() => navigate("/lockers/rent")}
          />

        </Stack>
      </Container>

      <RefundDialog
        open={openRefundDialog}
        onClose={() => setOpenRefundDialog(false)}
        onConfirm={handleRefundConfirm}
        lockerNumber={lockerStatus.number}
      />
    </Box>
  );
}
