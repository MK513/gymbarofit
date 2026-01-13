import React, { useState, useEffect } from "react";
import { Box, Container } from "@mui/material";
import { useNavigate } from "react-router-dom";

// Hooks & Context
import { useAuth } from "../../context/AuthContext";
import { useNotification } from "../../context/NotificationContext";
import { getLockerZone, getLockerList, rentLocker } from "../../api/Api";

// Utils
import { mapLockerSizeToGridType } from "../../utils/lockerUtils";

// Components
import LockerHeader from "../../components/lockers/LockerHeader";
import LockerStatusPanel from "../../components/lockers/LockerStatusPanel";
import LockerGrid from "../../components/lockers/LockerGrid";
import LockerActionFooter from "../../components/lockers/LockerActionFooter";
import LockerEmptyState from "../../components/lockers/LockerEmptyState";
import LockerPaymentDialog from "../../components/lockers/LockerPaymentDialog";

export default function LockerRent() {
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  const { user } = useAuth();

  // 상태 관리
  const [zones, setZones] = useState([]);
  const [hasNoZones, setHasNoZones] = useState(false);
  const [lockers, setLockers] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const [lockerCounts, setLockerCounts] = useState({ available: 0, unavailable: 0 });
  const [currentTab, setCurrentTab] = useState(0);
  const [selectedLocker, setSelectedLocker] = useState(null);
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);

  // 파생 데이터 계산
  const currentZone = zones[currentTab];
  const gridConfig = {
    rows: currentZone ? currentZone.rowCount : 4,
    cols: currentZone ? currentZone.columnCount : 4,
    lockerType: currentZone ? mapLockerSizeToGridType(currentZone.lockerSize) : "1x1"
  };

  // 1. 초기 구역 정보 가져오기
  useEffect(() => {
    const fetchZones = async () => {
      try {
        const dto = { gymId: user.gym.id };
        const res = await getLockerZone(dto);

        if (res.zoneCount === 0) {
          setHasNoZones(true);
          return;
        }

        if (res && res.zones) {
          setZones(res.zones);
          setHasNoZones(false);
        }
      } catch (error) {
        console.error("구역 정보를 불러오는데 실패했습니다:", error);
        showNotification("구역 정보를 불러오지 못했습니다.", "error");
        setHasNoZones(true); 
      }
    };
    fetchZones();
  }, []);

  // 2. 탭(구역) 변경 시 보관함 목록 가져오기
  useEffect(() => {
    if (zones.length === 0) return;

    setLockers([]);

    const fetchLockers = async () => {
      setLoading(true);
      try {
        const pathVariable = { zoneId: currentZone.id }
        const res = await getLockerList(pathVariable);
        
        const { availableCount, unavailableCount, lockers: rawLockers } = res;
        setLockerCounts({ available: availableCount || 0, unavailable: unavailableCount || 0 });
        
        const mappedLockers = (rawLockers || []).map(locker => {
            const isConditionBad = locker.itemStatus !== 'AVAILABLE' && locker.itemStatus !== 'OK';
            const isUsed = locker.usageStatus !== null;
            return {
                id: locker.id,
                number: locker.name, 
                isOccupied: isConditionBad || isUsed,
                isBroken: isConditionBad,
            };
        });
        
        setLockers(mappedLockers);

      } catch (error) {
        console.error("보관함 정보를 불러오는데 실패했습니다:", error);
        showNotification("보관함 정보를 불러오지 못했습니다.", "error");
        setLockers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchLockers();
    setSelectedLocker(null);

  }, [currentTab, zones]);

  // 핸들러 함수들
  const handleQuickSelect = () => {
    const firstEmptyLocker = lockers.find(locker => !locker.isOccupied);
    if (firstEmptyLocker) {
      setSelectedLocker(firstEmptyLocker.id);
      showNotification(`${firstEmptyLocker.number}번 빈 보관함을 찾았습니다! ⚡`, "success");
    } else {
      showNotification("현재 구역에 이용 가능한 보관함이 없습니다.", "warning");
    }
  };

  const handleLockerClick = (locker) => {
    if (locker.isOccupied) return;
    setSelectedLocker(locker.id === selectedLocker ? null : locker.id);
  };

  const handleTabChange = (event, newValue) => {
    setLockers([]);
    setCurrentTab(newValue);
  };

  const handleRentProcess = async (selectedDuration, selectedPaymentMethod) => {
    if (!selectedLocker) return;
    
    const planMap = { 1: 'MONTH_1', 3: 'MONTH_3', 6: 'MONTH_6' };
    const dto = {
      gymId: user.gym.id,
      lockerId: selectedLocker,
      plan: planMap[selectedDuration] || 'MONTH_1', 
      paymentMethod: selectedPaymentMethod
    };

    try {
      await rentLocker(dto);
      const currentZoneName = zones[currentTab]?.name || "";
      const target = lockers.find(l => l.id === selectedLocker);
      const lockerNum = target ? target.number : "";
  
      showNotification(`[${currentZoneName}] ${lockerNum}번 보관함 대여 완료!`, "success");
      setIsPaymentDialogOpen(false); 
      navigate("/"); 

    } catch (error) {
      console.error("보관함 대여 실패:", error);
      showNotification(error.response?.data?.message || "보관함 대여 중 오류가 발생했습니다.", "error");
    }
  };

  const selectedLockerNumber = (selectedLocker && lockers.length > 0)
    ? lockers.find(l => l.id === selectedLocker)?.number 
    : "";

  // 렌더링
  if (hasNoZones) {
    return <LockerEmptyState onBack={() => navigate(-1)} />;
  }

  return (
    <Box sx={{ bgcolor: "#f5f7fa", height: "100vh", display: "flex", flexDirection: "column", overflow: "hidden" }}>
      
      <LockerHeader 
        onBack={() => navigate(-1)}
        currentTab={currentTab}
        onTabChange={handleTabChange}
        zones={zones}
      />

      <Container 
        maxWidth="sm" 
        sx={{ 
          flex: 1,
          display: "flex", 
          flexDirection: "column",
          overflowY: "auto",
          overflowX: "hidden",
          p: 2,
          mt: 0
        }}
      >
        {!loading && (
          <LockerStatusPanel 
            counts={lockerCounts}
            currentZoneSize={currentZone?.lockerSize}
          />
        )}

        <LockerGrid 
          loading={loading}
          lockers={lockers}
          gridConfig={gridConfig}
          selectedLockerId={selectedLocker}
          onLockerClick={handleLockerClick}
        />
      </Container>

      <LockerActionFooter 
        selectedLockerId={selectedLocker}
        selectedLockerNumber={selectedLockerNumber}
        loading={loading}
        hasLockers={lockers.length > 0}
        onQuickSelect={handleQuickSelect}
        onPaymentOpen={() => setIsPaymentDialogOpen(true)}
      />

      <LockerPaymentDialog 
        open={isPaymentDialogOpen}
        onClose={() => setIsPaymentDialogOpen(false)}
        lockerNumber={selectedLockerNumber}
        onConfirm={handleRentProcess}
      />
      
    </Box>
  );
}