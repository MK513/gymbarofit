import React, { useState, useEffect } from "react";
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Container,
  Paper,
  Tab,
  Tabs,
  Button,
  CircularProgress,
  Divider,
  Chip,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { getLockerZone, getLockerList, rentLocker } from "../../api/Api";
import { useNotification } from "../../context/NotificationContext";

// 컴포넌트 import
import LockerPaymentDialog from "../../components/lockers/LockerPaymentDialog"; 

// 아이콘
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import LockIcon from "@mui/icons-material/Lock";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import BoltIcon from "@mui/icons-material/Bolt";
import BuildIcon from "@mui/icons-material/Build";
import ShoppingCartCheckoutIcon from '@mui/icons-material/ShoppingCartCheckout';

const mapLockerSizeToGridType = (serverSize) => {
  switch (serverSize) {
    case "MEDIUM": return "1x2";
    case "LARGE": return "2x1";
    case "SMALL":
    default: return "1x1";
  }
};

const getLockerSizeLabel = (size) => {
  const map = {
    SMALL: "소형",
    MEDIUM: "중형",
    LARGE: "대형"
  };
  return map[size] || size;
};

export default function LockerRent() {
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  const { user } = useAuth();

  const [zones, setZones] = useState([]);
  const [hasNoZones, setHasNoZones] = useState(false);
  const [lockers, setLockers] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const [lockerCounts, setLockerCounts] = useState({ available: 0, unavailable: 0 });
  const [currentTab, setCurrentTab] = useState(0);
  const [selectedLocker, setSelectedLocker] = useState(null);
  
  // const [gridConfig, setGridConfig] = useState({ rows: 4, cols: 4, lockerType: "1x1" });

  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);

  const currentZoneSize = zones[currentTab]?.lockerSize;
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
          setLoading(false);
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

  // 2. 탭(구역) 변경 시
  useEffect(() => {
    if (zones.length === 0) return;
    
    // const currentZone = zones[currentTab];
    // if (!currentZone) return;

    // setGridConfig({
    //   rows: currentZone.rowCount,
    //   cols: currentZone.columnCount,
    //   lockerType: mapLockerSizeToGridType(currentZone.lockerSize)
    // });

    setLockers([]);

    const fetchLockers = async () => {
      setLoading(true);
      try {
        const pathVariable = { zoneId: currentZone.id }
        const res = await getLockerList(pathVariable);
        
        const { availableCount, unavailableCount, lockers: rawLockers } = res;
        setLockerCounts({ available: availableCount || 0, unavailable: unavailableCount || 0 });
        
        const lockerList = rawLockers || [];
        
        const mappedLockers = lockerList.map(locker => {
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

  // 빠른 선택
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

  const handleTabChange = (event, newValue) => {
    setLockers([]);
    setCurrentTab(newValue);
  };

  const selectedLockerNumber = (selectedLocker && lockers.length > 0)
    ? lockers.find(l => l.id === selectedLocker)?.number 
    : "";


  if (hasNoZones) {
    return (
      <Box sx={{ bgcolor: "#f5f7fa", minHeight: "100vh" }}>
        <AppBar position="sticky" color="inherit" elevation={0} sx={{ borderBottom: '1px solid #e0e0e0', bgcolor: "white" }}>
          <Toolbar>
            <IconButton edge="start" color="inherit" onClick={() => navigate(-1)} sx={{ mr: 1 }}>
              <ArrowBackIcon />
            </IconButton>
            <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: "bold" }}>보관함 배정</Typography>
          </Toolbar>
        </AppBar>
        <Container maxWidth="sm" sx={{ mt: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', opacity: 0.7 }}>
          <LockIcon sx={{ fontSize: 80, color: '#bdbdbd', mb: 2 }} />
          <Typography variant="h6" gutterBottom color="textSecondary" fontWeight="bold">등록된 보관함 구역이 없습니다.</Typography>
          <Button variant="contained" onClick={() => navigate(-1)} sx={{ borderRadius: 2, px: 4, py: 1 }}>뒤로 가기</Button>
        </Container>
      </Box>
    );
  }

  return (
    <Box sx={{ bgcolor: "#f5f7fa", height: "100vh", display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <AppBar position="sticky" color="inherit" elevation={0} sx={{ borderBottom: '1px solid #e0e0e0', bgcolor: "white" }}>
        <Toolbar>
          <IconButton edge="start" color="inherit" onClick={() => navigate(-1)} sx={{ mr: 1 }}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: "bold" }}>
            보관함 배정
          </Typography>
        </Toolbar>
        <Tabs 
          value={currentTab} 
          onChange={handleTabChange} 
          variant="scrollable" 
          scrollButtons="auto" 
          indicatorColor="primary" 
          textColor="primary" 
          sx={{ borderTop: '1px solid #f0f0f0' }}
        >
          {zones.map((zone) => (
            <Tab key={zone.id} label={zone.name} sx={{ fontWeight: 'bold' }} />
          ))}
        </Tabs>
      </AppBar>

      {/* 가로 패딩(px)을 제거하거나 줄여서 스크롤 영역 확보 */}
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
        <Box sx={{ flexShrink: 0 }}>
          {/* 전체 현황 UI */}
          {!loading && (
            <Paper 
              elevation={0} 
              sx={{ 
                mb: 3, 
                p: 2.5, 
                borderRadius: 4, 
                bgcolor: 'white',
                display: 'flex', 
                alignItems: 'center',
                justifyContent: 'space-between',
                boxShadow: '0 2px 12px rgba(0,0,0,0.03)'
              }}
            >
              {/* 왼쪽: 제목 + 사이즈 뱃지 */}
              <Box display="flex" alignItems="center" gap={1}>
                <Typography variant="subtitle1" fontWeight="800" color="text.primary">
                  전체 현황
                </Typography>
                
                {/* 여기에 사이즈 표시 뱃지 추가 */}
                {currentZoneSize && (
                  <Chip 
                    label={getLockerSizeLabel(currentZoneSize)} 
                    size="small"
                    color="primary" 
                    variant="outlined"
                    sx={{ 
                      fontWeight: 'bold', 
                      height: 24, 
                      fontSize: '0.75rem',
                      borderWidth: '1.5px' 
                    }} 
                  />
                )}
              </Box>
              <Box display="flex" alignItems="center" gap={3}>
                  <Box textAlign="center">
                      <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 0.5, whiteSpace: 'nowrap' }}>
                          이용 가능
                      </Typography>
                      <Typography variant="h6" color="primary.main" fontWeight="800" sx={{ lineHeight: 1 }}>
                          {lockerCounts.available}개
                      </Typography>
                  </Box>
                  <Divider orientation="vertical" flexItem sx={{ height: 30, my: 'auto' }} />
                  <Box textAlign="center">
                      <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 0.5, whiteSpace: 'nowrap' }}>
                          대여 불가
                      </Typography>
                      <Typography variant="h6" color="text.disabled" fontWeight="800" sx={{ lineHeight: 1 }}>
                          {lockerCounts.unavailable}개
                      </Typography>
                  </Box>
              </Box>
            </Paper>
          )}

          {/* 범례 */}
          <Box display="flex" justifyContent="center" gap={2} mb={2}>
            <Box display="flex" alignItems="center" gap={0.5}>
              <Box sx={{ width: 12, height: 12, borderRadius: '3px', border: '1px solid #e0e0e0', bgcolor: 'white' }} />
              <Typography variant="caption" color="text.secondary">가능</Typography>
            </Box>
            <Box display="flex" alignItems="center" gap={0.5}>
              <Box sx={{ width: 12, height: 12, borderRadius: '3px', bgcolor: '#cfd8dc' }} />
              <Typography variant="caption" color="text.secondary">사용중/점검</Typography>
            </Box>
            <Box display="flex" alignItems="center" gap={0.5}>
              <Box sx={{ width: 12, height: 12, borderRadius: '3px', bgcolor: 'primary.main' }} />
              <Typography variant="caption" color="text.secondary">선택</Typography>
            </Box>
          </Box>
        </Box>


        {/* 보관함 그리드 영역 (스크롤 적용) */}
        {loading ? (
          <Box display="flex" justifyContent="center" p={5} flex={1}>
            <CircularProgress />
          </Box>
        ) : (
          <Paper
            elevation={0}
            sx={{
              p: 2,
              pr: 0,
              bgcolor: "white",
              borderRadius: 4,
              width: "100%",
              flex: 1,
              display: "flex",
              flexDirection: "column",
              justifyContent: "center", // 세로 중앙
              alignItems: "center",     // 가로 중앙
              overflowX: "auto",
            }}
          >
            <Box
              key={zones[currentTab]?.id || currentTab}
              sx={{
                display: "grid",
                alignContent: "center",  // 세로 중앙
                justifyContent: "center", // 가로 중앙
                width: "fit-content", 
                minWidth: lockers.length > 0 ? "auto" : "100%",
                gridTemplateColumns: `repeat(${gridConfig.cols}, 90px)`,
                mx: "auto",
                // gridTemplateRows: `repeat(${gridConfig.rows}, 1fr)`, 
                
                gap: 1.5,
                pr: 0,
              }}
            >
              {lockers.map((locker) => {
                const isSelected = selectedLocker === locker.id;
                
                const sizeStyle = {
                  "1x1": { gridColumn: "span 1", gridRow: "span 1" },
                  "1x2": { gridColumn: "span 1", gridRow: "span 2" },
                  "1x3": { gridColumn: "span 1", gridRow: "span 3" },
                }[gridConfig.lockerType];

                const ratioStyle = {
                  "1x1": "1/1",
                  "1x2": "1/2", // 가로 1 : 세로 2
                  "1x3": "1/3", // 가로 1 : 세로 3
                }[gridConfig.lockerType] || "1/1";

                return (
                  <Paper
                    key={locker.id}
                    elevation={isSelected ? 4 : 0}
                    onClick={() => handleLockerClick(locker)}
                    sx={{
                      ...sizeStyle,
                      aspectRatio: ratioStyle,
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      borderRadius: 1.5,
                      cursor: locker.isOccupied ? "not-allowed" : "pointer",
                      bgcolor: locker.isOccupied
                        ? "#cfd8dc"
                        : isSelected
                        ? "primary.main"
                        : "white",
                      color: isSelected
                        ? "white"
                        : locker.isOccupied
                        ? "#90a4ae"
                        : "#333",
                      border: isSelected ? "none" : "1px solid #e0e0e0",
                      transition: "0.1s",
                      position: "relative",
                      "& .MuiTypography-root": {
                        fontSize: '0.8rem',
                        fontWeight: 'bold'
                      },
                      "&:active": {
                         transform: "scale(0.95)"
                      }
                    }}
                  >
                    {isSelected && <CheckCircleIcon sx={{ fontSize: '1rem', mb: 0.2 }} />}
                    {!isSelected && locker.isBroken && (
                      <BuildIcon sx={{ fontSize: '1rem', mb: 0.2, opacity: 0.5 }} />
                    )}
                    {!isSelected && !locker.isBroken && gridConfig.lockerType === "1x2" && (
                      <LockIcon sx={{ fontSize: '1rem', mb: 0.5, opacity: 0.5 }} />
                    )}
                    <Typography variant="subtitle2">
                      {locker.number}
                    </Typography>
                  </Paper>
                );
              })}
            </Box>
          </Paper>
        )}
      </Container>

      {/* 하단 고정 액션 바 */}
      <Paper 
        elevation={10}
        sx={{ 
          flexShrink: 0,       // 크기 줄어들지 않음
          p: 2, 
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
          bgcolor: 'white',
          zIndex: 10
        }}
      >
        <Container maxWidth="sm" sx={{ px: 0 }}>
          {selectedLocker ? (
            <Button
              fullWidth
              variant="contained"
              size="large"
              onClick={() => setIsPaymentDialogOpen(true)}
              startIcon={<ShoppingCartCheckoutIcon />}
              sx={{
                py: 1.8,
                borderRadius: 3,
                fontSize: '1.1rem',
                fontWeight: 'bold',
                boxShadow: '0 8px 16px rgba(33, 150, 243, 0.3)'
              }}
            >
              {selectedLockerNumber}번 보관함 대여하기
            </Button>
          ) : (
            <Button 
              fullWidth 
              variant="contained" 
              color="secondary"
              size="large"
              startIcon={<BoltIcon />}
              onClick={handleQuickSelect}
              disabled={loading || lockers.length === 0}
              sx={{ 
                py: 1.8, 
                borderRadius: 3, 
                fontWeight: 'bold', 
                fontSize: '1.1rem',
                background: 'linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%)',
                boxShadow: '0 8px 16px rgba(255, 105, 135, .3)',
                color: 'white'
              }}
            >
              가장 빠른 빈자리 자동 선택
            </Button>
          )}
        </Container>
      </Paper>

      <LockerPaymentDialog 
        open={isPaymentDialogOpen}
        onClose={() => setIsPaymentDialogOpen(false)}
        lockerNumber={selectedLockerNumber}
        onConfirm={handleRentProcess}
      />
      
    </Box>
  );
}