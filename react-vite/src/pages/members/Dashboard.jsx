import React, { useState, useEffect } from "react";
import { Box, Container, Stack } from "@mui/material";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../../context/AuthContext";
import { getMembershipInfo, refundLocker, startUsage, endUsage, leaveQueue } from "../../api/Api";
import { useNotification } from "../../context/NotificationContext";
import { useSseNotifications } from "../../context/SseNotification";

// 하위 컴포넌트
import DashboardHeader from "../../components/members/dashboard/DashboardHeader";
import GymInfoSection from "../../components/members/dashboard/GymInfoSection";
import StatsCard from "../../components/members/dashboard/StatsCard";
import EquipmentCard from "../../components/members/dashboard/EquipmentCard";
import LockerCard from "../../components/members/dashboard/LockerCard";
import QrCodeDialog from "../../components/members/dashboard/QrCodeDialog";
import RefundDialog from "../../components/members/dashboard/RefundDialog";

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { showNotification } = useNotification();
  const { notifications } = useSseNotifications(user?.id);

  // --- 상태 관리 ---
  const [lockerStatus, setLockerStatus] = useState({ use: false, number: 0, expiry: "", id: null, zoneName: "" });
  const [equipmentInfo, setEquipmentInfo] = useState({ usage: null, reservation: null });
  const [historyInfo, setHistoryInfo] = useState({ totalMinutes: 0, totalCalories: 0, activities: [] });
  const [openQr, setOpenQr] = useState(false);
  const [openRefundDialog, setOpenRefundDialog] = useState(false);
  const [myGyms, setMyGyms] = useState([]);
  const [currentGym, setCurrentGym] = useState(null);
  const [crowdStatus, setCrowdStatus] = useState({ label: "정보 없음", bgColor: "#f5f5f5", color: "#9e9e9e", borderColor: "#e0e0e0" });

  // --- 헬퍼 함수들 ---
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
        return;
      }

      const pathVariable = { gymId: gymToLoad.id };
      const res = await getMembershipInfo(pathVariable);

      // 1. Gym 정보 (res.gym 내부로 이동)
      if (res.gym) {
        setMyGyms(res.gym.gymList || []);
        setCurrentGym(gymToLoad);
        setCrowdStatus(getCrowdLevelInfo(res.gym.crowdLevel));
      }

      // 2. 라커 정보 (res.lockerUsage)
      if (res.lockerUsage) {
        setLockerStatus({
          use: true,
          number: res.lockerUsage.lockerNumber,
          expiry: res.lockerUsage.endDate 
                  ? `${res.lockerUsage.endDate[0]}-${String(res.lockerUsage.endDate[1]).padStart(2, '0')}-${String(res.lockerUsage.endDate[2]).padStart(2, '0')}`
                  : "",
          id: res.lockerUsage.usageId,
          zoneName: res.lockerUsage.zoneName,
        });
      } else {
        setLockerStatus({ use: false, number: 0, expiry: "", id: null, zoneName: "" });
      }

      // 3. 운동 기구 정보 (res.equipmentUsage 내부로 이동)
      const newEquipInfo = { usage: null, reservation: null };
      const eq = res.equipmentUsage;

      if (eq?.inUseDto) {
        newEquipInfo.usage = {
          uid: eq.inUseDto.usageId,
          eid: eq.inUseDto.equipmentId,
          name: eq.inUseDto.name,
          imageUrl: eq.inUseDto.imageUrl,
          time: "현재 이용 중",
        };
      }

      if (eq?.waitingDto) {
        newEquipInfo.reservation = {
          uid: eq.waitingDto.usageId,
          eid: eq.waitingDto.equipmentId,
          name: eq.waitingDto.name,
          imageUrl: eq.waitingDto.imageUrl,
          time: `내 앞 대기 인원 ${eq.waitingDto.waitingCount}명`,
        };
      }
      setEquipmentInfo(newEquipInfo);

      // 4. 히스토리 정보 (res.history)
      if (res.history) {
        setHistoryInfo({
          totalMinutes: res.history.todayTotalUsageMinutes,
          totalCalories: res.history.todayTotalCalories,
          activities: res.history.recentThreeUsages || [],
        });
      }

    } catch (error) {
      console.error("정보 로딩 실패", error);
      showNotification("정보를 불러오지 못했습니다.", "error");
    }
  };

  useEffect(() => {
    if (user?.gym) loadGymData(user.gym);
    else loadGymData(null);
  }, []);

  // --- [SSE] 새 알림 수신 시 처리 ---
  useEffect(() => {
    if (notifications.length > 0) {
      const latest = notifications[0];
      if (latest.type === "WAITING_AVAILABLE") {
        showNotification(`${latest.title} ${latest.body}`, "info");
        setEquipmentInfo(prev => {
          if (!prev.reservation) return prev;
          return {
            ...prev,
            reservation: {
              ...prev.reservation,
              status: "CALLED",
              time: "지금 바로 사용 가능합니다!"
            }
          };
        });
      }
    }
  }, [notifications, showNotification]);

  // --- 이벤트 핸들러 ---
  const handleLogout = () => {
    logout();
    showNotification("로그아웃 되었습니다.", "info");
    navigate("/login");
  };

  const handleGymSelect = async (gym) => {
    // 주의: user 객체 직접 변경보다 Context의 업데이트 함수 사용 권장
    user.gym = gym; 
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
  }

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
  }

  const handleLeftQueue = async () => {
    try {
      await leaveQueue({ usageId: equipmentInfo.reservation.uid });
      showNotification("기구 예약이 취소되었습니다.", "success");
      await loadGymData(user.gym);
    } catch (e) {
      showNotification("기구 예약 취소에 실패했습니다.", "error");
    }
  }

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
            onRegister={() => navigate('/gyms/register')}
          />

          <StatsCard 
            totalMinutes={historyInfo.totalMinutes} 
            totalCalories={historyInfo.totalCalories} 
            activities={historyInfo.activities}
            onMoreClick={() => navigate('/members/history')}
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
            onNewReservation={() => navigate('/lockers/rent')}
          />

        </Stack>
      </Container>

      <QrCodeDialog open={openQr} onClose={() => setOpenQr(false)} />
      
      <RefundDialog 
        open={openRefundDialog} 
        onClose={() => setOpenRefundDialog(false)} 
        onConfirm={handleRefundConfirm}
        lockerNumber={lockerStatus.number}
      />
    </Box>
  );
}