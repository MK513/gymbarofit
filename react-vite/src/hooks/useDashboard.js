import { useState, useEffect } from "react";
import { useNotification } from "../context/NotificationContext";
import { getMembershipInfo } from "../api/gym";
import { BUCKET_BASE_URL } from "../api-config";

function getCrowdLevelInfo(level) {
  switch (level) {
    case "VERY_COMFORTABLE": return { label: "매우 쾌적 🔵", bgColor: "#e3f2fd", color: "#1565c0", borderColor: "#90caf9" };
    case "COMFORTABLE":      return { label: "쾌적 🟢",      bgColor: "#e8f5e9", color: "#2e7d32", borderColor: "#c8e6c9" };
    case "NORMAL":           return { label: "보통 🟡",      bgColor: "#fff3e0", color: "#ef6c00", borderColor: "#ffe0b2" };
    case "CROWDED":          return { label: "혼잡 🟠",      bgColor: "#fbe9e7", color: "#d84315", borderColor: "#ffccbc" };
    case "VERY_CROWDED":     return { label: "매우 혼잡 🔴", bgColor: "#ffebee", color: "#c62828", borderColor: "#ffcdd2" };
    default:                 return { label: "정보 없음 ⚪",  bgColor: "#f5f5f5", color: "#9e9e9e", borderColor: "#e0e0e0" };
  }
}

export function useDashboard(initialGym) {
  const { showNotification } = useNotification();

  const [lockerStatus, setLockerStatus] = useState({
    use: false, number: 0, expiry: "", id: null, zoneName: "",
  });
  const [equipmentInfo, setEquipmentInfo] = useState({ usage: null, reservation: null });
  const [historyInfo, setHistoryInfo] = useState({ totalMinutes: 0, totalCalories: 0, activities: [] });
  const [openQr, setOpenQr] = useState(false);
  const [openRefundDialog, setOpenRefundDialog] = useState(false);
  const [myGyms, setMyGyms] = useState([]);
  const [currentGym, setCurrentGym] = useState(null);
  const [crowdStatus, setCrowdStatus] = useState({
    label: "정보 없음", bgColor: "#f5f5f5", color: "#9e9e9e", borderColor: "#e0e0e0",
  });
  const [checkInStatus, setCheckInStatus] = useState({
    isCheckedIn: false, checkedToday: false, streak: 0, checkedInAt: null,
  });

  const loadGymData = async (gymToLoad) => {
    try {
      if (!gymToLoad) {
        setMyGyms([]);
        setCurrentGym(null);
        return;
      }

      const res = await getMembershipInfo({ gymId: gymToLoad.id });

      if (res.gym) {
        setMyGyms(res.gym.gymList || []);
        setCurrentGym(gymToLoad);
        setCrowdStatus(getCrowdLevelInfo(res.gym.crowdLevel));
      }

      if (res.lockerUsage) {
        const lu = res.lockerUsage;
        setLockerStatus({
          use: true,
          number: lu.lockerNumber,
          expiry: lu.endDate || "",
          id: lu.usageId,
          zoneName: lu.zoneName,
        });
      } else {
        setLockerStatus({ use: false, number: 0, expiry: "", id: null, zoneName: "" });
      }

      const newEquipInfo = { usage: null, reservation: null };
      const eq = res.equipmentUsage;
      console.log("[DEBUG] inUseDto:", eq?.inUseDto);
      if (eq?.inUseDto) {
        newEquipInfo.usage = {
          uid: eq.inUseDto.usageId,
          eid: eq.inUseDto.equipmentId,
          name: eq.inUseDto.name,
          imageUrl: eq.inUseDto.imageUrl ? `${BUCKET_BASE_URL}${eq.inUseDto.imageUrl}` : "",
          time: "현재 이용 중",
          startAtMs: eq.inUseDto.startAtMs ?? null,
        };
      }
      if (eq?.waitingDto) {
        newEquipInfo.reservation = {
          uid: eq.waitingDto.usageId,
          eid: eq.waitingDto.equipmentId,
          name: eq.waitingDto.name,
          imageUrl: eq.waitingDto.imageUrl ? `${BUCKET_BASE_URL}${eq.waitingDto.imageUrl}` : "",
          time: `내 앞 대기 인원 ${eq.waitingDto.waitingCount}명`,
        };
      }
      setEquipmentInfo(newEquipInfo);

      if (res.history) {
        setHistoryInfo({
          totalMinutes: res.history.todayTotalUsageMinutes,
          totalCalories: res.history.todayTotalCalories,
          activities: res.history.recentThreeUsages || [],
        });
      }

      if (res.checkInStatus) {
        const cs = res.checkInStatus;
        setCheckInStatus({
          isCheckedIn: cs.checkedIn,
          checkedToday: cs.checkedToday,
          streak: cs.streak,
          checkedInAt: cs.checkedInAt,
        });
      } else {
        setCheckInStatus({ isCheckedIn: false, checkedToday: false, streak: 0, checkedInAt: null });
      }
    } catch (error) {
      console.error("정보 로딩 실패", error);
      showNotification("정보를 불러오지 못했습니다.", "error");
    }
  };

  useEffect(() => {
    if (initialGym) loadGymData(initialGym);
    else loadGymData(null);
  }, []);

  return {
    lockerStatus, setLockerStatus,
    equipmentInfo, setEquipmentInfo,
    historyInfo,
    openQr, setOpenQr,
    openRefundDialog, setOpenRefundDialog,
    myGyms, currentGym,
    crowdStatus,
    checkInStatus, setCheckInStatus,
    loadGymData,
  };
}
