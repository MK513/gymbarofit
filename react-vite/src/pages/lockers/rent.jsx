import React, { useState, useEffect, useMemo } from "react";
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
  ToggleButton,
  ToggleButtonGroup,
  Pagination,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
  CircularProgress
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { getLockerZone, getLockerList, rentLocker } from "../../api/Api";
import { useNotification } from "../../context/NotificationContext";

// 아이콘
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import LockIcon from "@mui/icons-material/Lock";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import SettingsIcon from "@mui/icons-material/Settings";
import BoltIcon from "@mui/icons-material/Bolt";
import BuildIcon from "@mui/icons-material/Build";

const PRICES = { 1: 10000, 3: 27000, 6: 50000 };

const mapLockerSizeToGridType = (serverSize) => {
  switch (serverSize) {
    case "MEDIUM": return "1x2";
    case "LARGE": return "2x1";
    case "SMALL":
    default: return "1x1";
  }
};

export default function LockerRent() {
  const navigate = useNavigate();
  // Global Notification Hook 사용
  const { showNotification } = useNotification();
  const { user } = useAuth();

  const [zones, setZones] = useState([]);
  const [lockers, setLockers] = useState([]);
  const [loading, setLoading] = useState(false);

  const [currentTab, setCurrentTab] = useState(0);
  const [page, setPage] = useState(1);
  const [selectedLocker, setSelectedLocker] = useState(null);
  
  // 상태 추가: 기간, 결제수단
  const [duration, setDuration] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState('CARD'); // 기본값 카드
  
  // [삭제됨] 로컬 toast 상태 제거
  // const [toast, setToast] = useState({ open: false, message: "" });
  
  const [gridConfig, setGridConfig] = useState({ rows: 4, cols: 4, lockerType: "1x1" });
  
  // 1. 초기 구역 정보 가져오기
  useEffect(() => {
    const fetchZones = async () => {
      try {
        const dto = { gymId: user.gym.id };
        const res = await getLockerZone(dto);
        if (res && res.zones) {
          setZones(res.zones);
        }
      } catch (error) {
        console.error("구역 정보를 불러오는데 실패했습니다:", error);
        showNotification("구역 정보를 불러오지 못했습니다.", "error");
      }
    };
    fetchZones();
  }, []);

  // 2. 탭(구역) 변경 시 -> 해당 구역 설정 및 리스트 조회
  useEffect(() => {
    if (zones.length === 0) return;
    
    const currentZone = zones[currentTab];
    if (!currentZone) return;

    setGridConfig({
      rows: currentZone.rowCount,
      cols: currentZone.columnCount,
      lockerType: mapLockerSizeToGridType(currentZone.lockerSize)
    });

    const fetchLockers = async () => {
      setLoading(true);
      try {
        const pathVariable = { zoneId: currentZone.id }
        const res = await getLockerList(pathVariable);
        
        const rawLockers = res.lockers || [];
        
        const mappedLockers = rawLockers.map(locker => {
            const isConditionBad = locker.condition !== 'OK';
            const isUsed = locker.status === 'ACTIVE' || locker.status !== null;

            return {
                id: locker.id,
                number: locker.name, 
                isOccupied: isConditionBad || isUsed,
                isBroken: isConditionBad
            };
        });
        
        if (mappedLockers.length === 0) {
            const totalCount = currentZone.rowCount * currentZone.columnCount;
            const dummyLockers = Array.from({ length: totalCount }, (_, i) => ({
                id: `${currentZone.id}-${i + 1}`,
                number: `${i + 1}`,
                isOccupied: false,
                isBroken: false
            }));
            setLockers(dummyLockers);
        } else {
            setLockers(mappedLockers);
        }

      } catch (error) {
        console.error("보관함 정보를 불러오는데 실패했습니다:", error);
        showNotification("보관함 정보를 불러오지 못했습니다.", "error");
        setLockers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchLockers();
    setPage(1);
    setSelectedLocker(null);

  }, [currentTab, zones]);

  // --- 그리드 계산 ---
  const slotsPerLocker = gridConfig.lockerType === "1x1" ? 1 : 2;
  const totalSlotsPerPage = gridConfig.rows * gridConfig.cols;
  const itemsPerPage = Math.floor(totalSlotsPerPage / slotsPerLocker);

  const totalPages = Math.ceil(lockers.length / itemsPerPage) || 1;
  const currentLockers = useMemo(() => {
    const startIndex = (page - 1) * itemsPerPage;
    return lockers.slice(startIndex, startIndex + itemsPerPage);
  }, [page, itemsPerPage, lockers]);

  // 빠른 선택
  const handleQuickSelect = () => {
    const firstEmptyLocker = lockers.find(locker => !locker.isOccupied);
    if (firstEmptyLocker) {
      const index = lockers.indexOf(firstEmptyLocker);
      const targetPage = Math.floor(index / itemsPerPage) + 1;
      setPage(targetPage);
      setSelectedLocker(firstEmptyLocker.id);
      
      // [수정됨] 로컬 toast -> 전역 showNotification 사용
      showNotification(`${firstEmptyLocker.number}번 빈 보관함을 찾았습니다! ⚡`, "success");
    } else {
      // alert 대신 통일감을 위해 notification 사용 (선택 사항)
      showNotification("현재 구역에 이용 가능한 보관함이 없습니다.", "warning");
    }
  };

  const handleLockerClick = (locker) => {
    if (locker.isOccupied) return;
    setSelectedLocker(locker.id === selectedLocker ? null : locker.id);
  };

  // --- 대여 핸들러 ---
  const handleRent = async () => {
    if (!selectedLocker) return;
    
    // 1. 기간 매핑 (숫자 -> API Enum 포맷)
    const planMap = {
      1: 'MONTH_1',
      3: 'MONTH_3',
      6: 'MONTH_6'
    };
    
    // 2. DTO 구성
    const dto = {
      gymId: user.gym.id,
      lockerId: selectedLocker,
      plan: planMap[duration] || 'MONTH_1', 
      paymentMethod: paymentMethod // UI에서 선택된 값
    };

    try {
      // 3. API 호출
      await rentLocker(dto);
      
      const currentZoneName = zones[currentTab]?.name || "";
      const target = lockers.find(l => l.id === selectedLocker);
      const lockerNum = target ? target.number : "";
  
      // [수정됨] alert -> showNotification 사용
      showNotification(`[${currentZoneName}] ${lockerNum}번 보관함 대여 완료!`, "success");
      
      navigate("/"); // 메인 또는 목록으로 이동

    } catch (error) {
      console.error("보관함 대여 실패:", error);
      showNotification(error.response?.data?.message || "보관함 대여 중 오류가 발생했습니다.", "error");
    }
  };

  return (
    <Box sx={{ bgcolor: "#f5f7fa", minHeight: "100vh", pb: 24 }}>
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
          onChange={(e, v) => setCurrentTab(v)} 
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

      <Container maxWidth="sm" sx={{ mt: 3 }}>
        
        {/* 구역 정보 패널 */}
        <Paper elevation={0} sx={{ p: 2, mb: 3, bgcolor: '#e3f2fd', border: '1px dashed #2196f3', borderRadius: 2 }}>
           <Stack direction="row" spacing={1} alignItems="center" mb={2}>
            <SettingsIcon fontSize="small" color="primary" />
            <Typography variant="subtitle2" fontWeight="bold" color="primary">구역 정보</Typography>
          </Stack>
          <Stack spacing={2}>
            <Stack direction="row" spacing={2} alignItems="center">
              <TextField 
                label="가로(열)" type="number" size="small" fullWidth sx={{ bgcolor: 'white' }} 
                value={gridConfig.cols} disabled 
              />
              <Typography variant="body2">X</Typography>
              <TextField 
                label="세로(행)" type="number" size="small" fullWidth sx={{ bgcolor: 'white' }} 
                value={gridConfig.rows} disabled
              />
            </Stack>
            <FormControl fullWidth size="small" sx={{ bgcolor: 'white' }}>
              <InputLabel>보관함 사이즈</InputLabel>
              <Select value={gridConfig.lockerType} label="보관함 사이즈" disabled>
                <MenuItem value="1x1">SMALL (1칸)</MenuItem>
                <MenuItem value="1x2">MEDIUM (2칸 높이)</MenuItem>
                <MenuItem value="2x1">LARGE (2칸 너비)</MenuItem>
              </Select>
            </FormControl>
          </Stack>
        </Paper>

        <Button 
          fullWidth 
          variant="contained" 
          color="secondary"
          startIcon={<BoltIcon />}
          onClick={handleQuickSelect}
          disabled={loading || lockers.length === 0}
          sx={{ 
            mb: 3, py: 1.5, borderRadius: 3, fontWeight: 'bold', fontSize: '1rem',
            background: 'linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%)',
            boxShadow: '0 3px 5px 2px rgba(255, 105, 135, .3)',
            color: 'white'
          }}
        >
          가장 빠른 빈자리 자동 선택
        </Button>

        {/* 범례 */}
        <Box display="flex" justifyContent="center" gap={3} mb={3}>
           <Box display="flex" alignItems="center" gap={0.5}>
            <Box sx={{ width: 14, height: 14, borderRadius: '3px', border: '2px solid #e0e0e0', bgcolor: 'white' }} />
            <Typography variant="caption">가능</Typography>
          </Box>
          <Box display="flex" alignItems="center" gap={0.5}>
            <Box sx={{ width: 14, height: 14, borderRadius: '3px', bgcolor: '#cfd8dc' }} />
            <Typography variant="caption">사용중/점검</Typography>
          </Box>
          <Box display="flex" alignItems="center" gap={0.5}>
            <Box sx={{ width: 14, height: 14, borderRadius: '3px', bgcolor: 'primary.main' }} />
            <Typography variant="caption">선택</Typography>
          </Box>
        </Box>

        {/* 보관함 그리드 */}
        {loading ? (
           <Box display="flex" justifyContent="center" p={5}>
             <CircularProgress />
           </Box>
        ) : (
          <Box sx={{ display: 'grid', gridTemplateColumns: `repeat(${gridConfig.cols}, 1fr)`, gridAutoRows: '70px', gap: 1.5, p: 2, bgcolor: 'white', borderRadius: 4, boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
            {currentLockers.map((locker) => {
              const isSelected = selectedLocker === locker.id;
              const sizeStyle = { 
                "1x1": { gridColumn: "span 1", gridRow: "span 1" }, 
                "1x2": { gridColumn: "span 1", gridRow: "span 2" }, 
                "2x1": { gridColumn: "span 2", gridRow: "span 1" } 
              }[gridConfig.lockerType];

              return (
                <Paper
                  key={locker.id}
                  elevation={isSelected ? 4 : 0}
                  onClick={() => handleLockerClick(locker)}
                  sx={{
                    ...sizeStyle, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', borderRadius: 2,
                    cursor: locker.isOccupied ? 'not-allowed' : 'pointer',
                    bgcolor: locker.isOccupied ? '#cfd8dc' : isSelected ? 'primary.main' : 'white',
                    color: isSelected ? 'white' : (locker.isOccupied ? '#90a4ae' : '#333'),
                    border: isSelected ? 'none' : '1px solid #e0e0e0',
                    transition: '0.2s', position: 'relative',
                    '&:hover': { transform: !locker.isOccupied && 'translateY(-2px)', borderColor: 'primary.main', zIndex: 1 }
                  }}
                >
                  {isSelected && <CheckCircleIcon fontSize="small" sx={{ mb: 0.5 }} />}
                  {!isSelected && locker.isBroken && <BuildIcon fontSize="small" sx={{ mb: 0.5, opacity: 0.5 }} />}
                  {!isSelected && !locker.isBroken && gridConfig.lockerType === "1x2" && (
                     <LockIcon fontSize="small" sx={{ mb: 1, opacity: 0.5 }} />
                  )}
                  <Typography variant="subtitle2" fontWeight="bold">{locker.number}</Typography>
                </Paper>
              );
            })}
          </Box>
        )}

        {/* 페이지네이션 */}
        {!loading && (
          <Box display="flex" justifyContent="center" mt={3} mb={4}>
            <Pagination count={totalPages} page={page} onChange={(e, v) => setPage(v)} color="primary" showFirstButton showLastButton siblingCount={0} boundaryCount={1} />
          </Box>
        )}
      </Container>

      {/* 하단 결제 바 */}
      <Paper elevation={10} sx={{ position: 'fixed', bottom: 0, left: 0, right: 0, p: 3, borderTopLeftRadius: 24, borderTopRightRadius: 24, bgcolor: 'white', zIndex: 1000 }}>
        <Container maxWidth="sm">
          
          {/* 1. 결제 수단 선택 */}
          <FormControl fullWidth size="small" sx={{ mb: 2 }}>
            <InputLabel id="payment-method-label">결제 수단</InputLabel>
            <Select
              labelId="payment-method-label"
              value={paymentMethod}
              label="결제 수단"
              onChange={(e) => setPaymentMethod(e.target.value)}
            >
              <MenuItem value="CARD">신용/체크카드</MenuItem>
              <MenuItem value="CASH">현금</MenuItem>
              <MenuItem value="KAKAO_PAY">카카오페이</MenuItem>
              <MenuItem value="NAVER_PAY">네이버페이</MenuItem>
            </Select>
          </FormControl>

          {/* 2. 기간 선택 */}
          <ToggleButtonGroup value={duration} exclusive onChange={(e, v) => v && setDuration(v)} fullWidth color="primary" sx={{ mb: 2 }}>
            {[1, 3, 6].map((m) => (<ToggleButton key={m} value={m} size="small">{m}개월 / {PRICES[m].toLocaleString()}원</ToggleButton>))}
          </ToggleButtonGroup>
          
          {/* 3. 대여 버튼 */}
          <Button fullWidth variant="contained" size="large" disabled={!selectedLocker} onClick={handleRent} sx={{ py: 1.5, borderRadius: 3, fontWeight: 'bold', fontSize: '1.1rem' }}>
            {selectedLocker ? "대여하기" : "보관함을 선택해주세요"}
          </Button>
        </Container>
      </Paper>
      
    </Box>
  );
}