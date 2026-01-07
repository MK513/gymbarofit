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
  Divider,
  Snackbar,
  Alert
} from "@mui/material";
import { useNavigate } from "react-router-dom";

// 아이콘
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import LockIcon from "@mui/icons-material/Lock";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import SettingsIcon from "@mui/icons-material/Settings";
import ViewModuleIcon from "@mui/icons-material/ViewModule";
import ViewArrayIcon from "@mui/icons-material/ViewArray";
import ViewColumnIcon from "@mui/icons-material/ViewColumn";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import BoltIcon from "@mui/icons-material/Bolt"; // 번개 아이콘

const PRICES = { 1: 10000, 3: 27000, 6: 50000 };

// 사물함 데이터 생성
const generateLockers = (sectionName, count) => {
  return Array.from({ length: count }, (_, i) => ({
    id: `${sectionName}-${i + 1}`,
    number: i + 1,
    isOccupied: Math.random() < 0.3, 
  }));
};

export default function LockerReservation() {
  const navigate = useNavigate();

  // --- 설정 상태 ---
  const [gridConfig, setGridConfig] = useState({ rows: 4, cols: 4, lockerType: "1x1" });
  const [totalLockersCount, setTotalLockersCount] = useState(100);
  const [sections, setSections] = useState(["A 구역", "B 구역"]);
  const [newSectionName, setNewSectionName] = useState("");

  // --- 기본 상태 ---
  const [currentTab, setCurrentTab] = useState(0);
  const [page, setPage] = useState(1);
  const [lockers, setLockers] = useState([]);
  const [selectedLocker, setSelectedLocker] = useState(null);
  const [duration, setDuration] = useState(1);
  
  // 알림 스낵바 상태
  const [toast, setToast] = useState({ open: false, message: "" });

  // 구역 추가 핸들러
  const handleAddSection = () => {
    if (!newSectionName.trim()) return;
    setSections([...sections, newSectionName]); 
    setNewSectionName(""); 
    setToast({ open: true, message: `'${newSectionName}' 구역이 추가되었습니다.` });
  };

  // 데이터 재생성
  useEffect(() => {
    if (!sections[currentTab]) {
      setCurrentTab(0);
      return;
    }
    const currentSectionName = sections[currentTab];
    setLockers(generateLockers(currentSectionName, totalLockersCount));
    setPage(1);
    setSelectedLocker(null);
  }, [currentTab, totalLockersCount, gridConfig, sections]);

  // 그리드 계산
  const slotsPerLocker = gridConfig.lockerType === "1x1" ? 1 : 2;
  const totalSlotsPerPage = gridConfig.rows * gridConfig.cols;
  const itemsPerPage = Math.floor(totalSlotsPerPage / slotsPerLocker);

  // 페이지네이션
  const totalPages = Math.ceil(lockers.length / itemsPerPage);
  const currentLockers = useMemo(() => {
    const startIndex = (page - 1) * itemsPerPage;
    return lockers.slice(startIndex, startIndex + itemsPerPage);
  }, [page, itemsPerPage, lockers]);

  // ▼▼▼ [NEW] 빠른 선택 (Auto Select) 로직 ▼▼▼
  const handleQuickSelect = () => {
    // 1. 현재 구역에서 사용 중이지 않은 첫 번째 사물함 찾기
    const firstEmptyLocker = lockers.find(locker => !locker.isOccupied);

    if (firstEmptyLocker) {
      // 2. 해당 사물함이 있는 페이지 계산
      // 전체 배열에서의 인덱스 찾기
      const index = lockers.indexOf(firstEmptyLocker);
      // 페이지 번호 = (인덱스 / 페이지당 개수)의 올림값
      const targetPage = Math.floor(index / itemsPerPage) + 1;

      // 3. 상태 업데이트 (페이지 이동 -> 선택)
      setPage(targetPage);
      setSelectedLocker(firstEmptyLocker.id);
      
      setToast({ open: true, message: `${firstEmptyLocker.number}번 빈 사물함을 찾았습니다! ⚡` });
    } else {
      alert("현재 구역에 이용 가능한 사물함이 없습니다.");
    }
  };

  const handleLockerClick = (locker) => {
    if (locker.isOccupied) return;
    setSelectedLocker(locker.id === selectedLocker ? null : locker.id);
  };

  const handleReserve = () => {
    if (!selectedLocker) return;
    const currentSectionName = sections[currentTab];
    alert(`[${currentSectionName}] ${selectedLocker.split('-')[1]}번 사물함 예약 완료!`);
    navigate("/");
  };

  return (
    <Box sx={{ bgcolor: "#f5f7fa", minHeight: "100vh", pb: 18 }}>
      <AppBar position="sticky" color="inherit" elevation={0} sx={{ borderBottom: '1px solid #e0e0e0', bgcolor: "white" }}>
        <Toolbar>
          <IconButton edge="start" color="inherit" onClick={() => navigate(-1)} sx={{ mr: 1 }}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: "bold" }}>
            사물함 배정
          </Typography>
        </Toolbar>
        <Tabs value={currentTab} onChange={(e, v) => setCurrentTab(v)} variant="scrollable" scrollButtons="auto" indicatorColor="primary" textColor="primary" sx={{ borderTop: '1px solid #f0f0f0' }}>
          {sections.map((sec, idx) => <Tab key={idx} label={sec} sx={{ fontWeight: 'bold' }} />)}
        </Tabs>
      </AppBar>

      <Container maxWidth="sm" sx={{ mt: 3 }}>
        
        {/* 관리자 설정 패널 */}
        <Paper elevation={0} sx={{ p: 2, mb: 3, bgcolor: '#e3f2fd', border: '1px dashed #2196f3', borderRadius: 2 }}>
          {/* ... (이전과 동일한 설정 UI) ... */}
           <Stack direction="row" spacing={1} alignItems="center" mb={2}>
            <SettingsIcon fontSize="small" color="primary" />
            <Typography variant="subtitle2" fontWeight="bold" color="primary">관리자 설정</Typography>
          </Stack>
          <Stack spacing={2}>
            <Box display="flex" gap={1}>
              <TextField label="새 구역 이름" size="small" fullWidth value={newSectionName} onChange={(e) => setNewSectionName(e.target.value)} sx={{ bgcolor: 'white' }} />
              <Button variant="contained" onClick={handleAddSection} startIcon={<AddCircleOutlineIcon />} sx={{ whiteSpace: 'nowrap' }}>추가</Button>
            </Box>
            <Divider />
            <Stack direction="row" spacing={2} alignItems="center">
              <TextField label="가로(열)" type="number" size="small" fullWidth sx={{ bgcolor: 'white' }} value={gridConfig.cols} onChange={handleConfigChange('cols')} />
              <Typography variant="body2">X</Typography>
              <TextField label="세로(행)" type="number" size="small" fullWidth sx={{ bgcolor: 'white' }} value={gridConfig.rows} onChange={handleConfigChange('rows')} />
            </Stack>
            <FormControl fullWidth size="small" sx={{ bgcolor: 'white' }}>
              <InputLabel>사물함 사이즈</InputLabel>
              <Select value={gridConfig.lockerType} label="사물함 사이즈" onChange={handleConfigChange('lockerType')}>
                <MenuItem value="1x1">기본 (1칸)</MenuItem>
                <MenuItem value="1x2">세로형 (2칸 높이)</MenuItem>
                <MenuItem value="2x1">가로형 (2칸 너비)</MenuItem>
              </Select>
            </FormControl>
          </Stack>
        </Paper>

        {/* ▼▼▼ [NEW] 빠른 빈자리 선택 버튼 ▼▼▼ */}
        <Button 
          fullWidth 
          variant="contained" 
          color="secondary" // 눈에 띄게 다른 색상 사용 (보라색 계열 추천)
          startIcon={<BoltIcon />}
          onClick={handleQuickSelect}
          sx={{ 
            mb: 3, 
            py: 1.5, 
            borderRadius: 3, 
            fontWeight: 'bold', 
            fontSize: '1rem',
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
            <Typography variant="caption">사용중</Typography>
          </Box>
          <Box display="flex" alignItems="center" gap={0.5}>
            <Box sx={{ width: 14, height: 14, borderRadius: '3px', bgcolor: 'primary.main' }} />
            <Typography variant="caption">선택</Typography>
          </Box>
        </Box>

        {/* 사물함 그리드 */}
        <Box sx={{ display: 'grid', gridTemplateColumns: `repeat(${gridConfig.cols}, 1fr)`, gridAutoRows: '70px', gap: 1.5, p: 2, bgcolor: 'white', borderRadius: 4, boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
          {currentLockers.map((locker) => {
            const isSelected = selectedLocker === locker.id;
            const sizeStyle = { "1x1": { gridColumn: "span 1", gridRow: "span 1" }, "1x2": { gridColumn: "span 1", gridRow: "span 2" }, "2x1": { gridColumn: "span 2", gridRow: "span 1" } }[gridConfig.lockerType];

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
                {isSelected ? <CheckCircleIcon fontSize="small" sx={{ mb: 0.5 }} /> : (gridConfig.lockerType === "1x2" ? <LockIcon fontSize="small" sx={{ mb: 1, opacity: 0.5 }} /> : null)}
                <Typography variant="subtitle2" fontWeight="bold">{locker.number}</Typography>
              </Paper>
            );
          })}
        </Box>

        {/* 페이지네이션 */}
        <Box display="flex" justifyContent="center" mt={3} mb={4}>
          <Pagination count={totalPages} page={page} onChange={(e, v) => setPage(v)} color="primary" showFirstButton showLastButton siblingCount={0} boundaryCount={1} />
        </Box>
      </Container>

      {/* 하단 결제 바 */}
      <Paper elevation={10} sx={{ position: 'fixed', bottom: 0, left: 0, right: 0, p: 3, borderTopLeftRadius: 24, borderTopRightRadius: 24, bgcolor: 'white', zIndex: 1000 }}>
        <Container maxWidth="sm">
          <ToggleButtonGroup value={duration} exclusive onChange={(e, v) => v && setDuration(v)} fullWidth color="primary" sx={{ mb: 2 }}>
            {[1, 3, 6].map((m) => (<ToggleButton key={m} value={m} size="small">{m}개월 / {PRICES[m].toLocaleString()}원</ToggleButton>))}
          </ToggleButtonGroup>
          <Button fullWidth variant="contained" size="large" disabled={!selectedLocker} onClick={handleReserve} sx={{ py: 1.5, borderRadius: 3, fontWeight: 'bold', fontSize: '1.1rem' }}>
            {selectedLocker ? "예약하기" : "사물함을 선택해주세요"}
          </Button>
        </Container>
      </Paper>
      
      {/* 알림용 스낵바 */}
      <Snackbar open={toast.open} autoHideDuration={3000} onClose={() => setToast({ ...toast, open: false })} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }} sx={{ mb: 10 }}>
        <Alert onClose={() => setToast({ ...toast, open: false })} severity="success" sx={{ width: '100%', fontWeight: 'bold' }}>
          {toast.message}
        </Alert>
      </Snackbar>
    </Box>
  );

  function handleConfigChange(prop) { return (event) => setGridConfig({ ...gridConfig, [prop]: event.target.value }); }
}