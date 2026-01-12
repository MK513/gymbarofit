import React, { useState, useEffect } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Container,
  Stack,
  Paper,
  Box,
  Button,
  Avatar,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  LinearProgress,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Menu,
  MenuItem,
  Divider,
  DialogContentText,
} from "@mui/material";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { getMembershipInfo, refundLocker } from "../../api/Api";
import { useNotification } from "../../context/NotificationContext";

// ▼▼▼ 아이콘 Import ▼▼▼
import LogoutIcon from "@mui/icons-material/Logout";
import FitnessCenterIcon from "@mui/icons-material/FitnessCenter";
import LockIcon from "@mui/icons-material/Lock";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import EventAvailableIcon from "@mui/icons-material/EventAvailable";
import QrCodeIcon from '@mui/icons-material/QrCode'; 
import PeopleAltIcon from '@mui/icons-material/PeopleAlt'; 
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { showNotification } = useNotification();

  const [lockerStatus, setLockerStatus] = useState({ use: false, number: 0, expiry: "", id: null });
  const [equipStatus] = useState({ use: false, name: "", time: "" });
  const [attendance, setAttendance] = useState({ streak: 3, checkedToday: false }); 
  const [openQr, setOpenQr] = useState(false);
  const [openRefundDialog, setOpenRefundDialog] = useState(false);

  // 지점 관리 상태
  const [myGyms, setMyGyms] = useState([]); // 서버에서 가져온 헬스장 목록
  const [currentGym, setCurrentGym] = useState(null); // 현재 선택된 헬스장 객체
  const [anchorEl, setAnchorEl] = useState(null);
  const openMenu = Boolean(anchorEl);

  // 혼잡도 상태
  const [crowdStatus, setCrowdStatus] = useState({
    label: "정보 없음",
    bgColor: "#f5f5f5",
    color: "#9e9e9e",
    borderColor: "#e0e0e0"
  });

  // 날짜 배열 변환 헬퍼 함수
  const formatDateFromArray = (dateArr) => {
    if (!dateArr || dateArr.length < 3) return "";
    const year = dateArr[0];
    const month = String(dateArr[1]).padStart(2, "0");
    const day = String(dateArr[2]).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  // 혼잡도 매핑 헬퍼 함수
  const getCrowdLevelInfo = (level) => {
    switch (level) {
      case "VERY_COMFORTABLE":
        // 파란색 계열: 아주 널널함
        return { label: "매우 쾌적 🔵", bgColor: "#e3f2fd", color: "#1565c0", borderColor: "#90caf9" };
      
      case "COMFORTABLE":
        // 초록색 계열: 적당히 여유로움
        return { label: "쾌적 🟢", bgColor: "#e8f5e9", color: "#2e7d32", borderColor: "#c8e6c9" };
      
      case "NORMAL":
        // 노란색 계열: 보통
        return { label: "보통 🟡", bgColor: "#fff3e0", color: "#ef6c00", borderColor: "#ffe0b2" };
      
      case "CROWDED":
        // 주황색 계열: 붐비기 시작함
        return { label: "혼잡 🟠", bgColor: "#fbe9e7", color: "#d84315", borderColor: "#ffccbc" };
      
      case "VERY_CROWDED":
        // 빨간색 계열: 꽉 참
        return { label: "매우 혼잡 🔴", bgColor: "#ffebee", color: "#c62828", borderColor: "#ffcdd2" };
      
      default:
        return { label: "정보 없음 ⚪", bgColor: "#f5f5f5", color: "#9e9e9e", borderColor: "#e0e0e0" };
    }
  };

  useEffect(() => {
    const fetchMembershipInfo = async () => {
      try {
        if (user?.gym != null) {
          const pathVariable = { gymId: user.gym.id };
          const res = await getMembershipInfo(pathVariable);

          setMyGyms(res.gymList);
          setCurrentGym(user.gym);

          // 혼잡도 정보 처리
          if (res?.crowdLevel) {
            const status = getCrowdLevelInfo(res.crowdLevel);
            setCrowdStatus(status);
          }

          // 개인 보관함(lockerUsage) 정보 처리 로직 추가
          if (res.lockerUsage) {
            setLockerStatus({
              use: true,
              number: res.lockerUsage.lockerNumber,
              expiry: formatDateFromArray(res.lockerUsage.endDate),
              id: res.lockerUsage.usageId,
            });
          } else {
            setLockerStatus({
              use: false,
              number: 0,
              expiry: "",
              id: null,
            });
          }

        } else {
          setMyGyms([]);
          setCurrentGym(null);
          // 헬스장이 없으면 보관함 정보도 초기화
          setLockerStatus({ use: false, number: 0, expiry: "" });
        }

      } catch (error) {
        console.error("개인 정보 로딩 실패", error);
        showNotification("정보를 불러오지 못했습니다.", "error");
      }
    };

    fetchMembershipInfo();
  }, []);

  useEffect(() => {
    if (!user) navigate("/login");
  }, [user, navigate]);

  if (!user) return null;

  const weeklyProgress = 70;
  const userName = user.name || "회원";

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

  const handleNewReservation = () => navigate('/lockers/rent');
  const handleOpenQr = () => setOpenQr(true);
  const handleCloseQr = () => setOpenQr(false);

  // 지점 선택 핸들러
  const handleGymMenuOpen = (event) => setAnchorEl(event.currentTarget);
  
  // TODO: 선택된 지점에 따라 대시보드 데이터(출석, 예약 등) 다시 불러오기
  const handleGymSelect = async (gym) => {
    try {
      if (user?.gym != null) {
          setAnchorEl(null);
          user.gym = gym;

          const pathVariable = { gymId: user.gym.id };
          const res = await getMembershipInfo(pathVariable);

          // 혼잡도 정보 처리
          if (res?.crowdLevel) {
            const status = getCrowdLevelInfo(res.crowdLevel);
            setCrowdStatus(status);
          }
        }
        else {
          setMyGyms([]);
          setCurrentGym(null);
        }

      } catch (error) {
        console.error("개인 정보 로딩 실패", error);
        showNotification("정보를 불러오지 못했습니다.", "error");
      }
  };

  const handleGymMenuClose = () => setAnchorEl(null);

  // 헬스장 등록 페이지 이동
  const handleGoToRegister = () => {
    setAnchorEl(null);
    navigate('/gyms/register');
  };

  // "환불 신청" 버튼 클릭 시 실행 (모달 열기)
  const handleRefundClick = () => {
    if (!lockerStatus.id) {
      showNotification("보관함 정보를 찾을 수 없습니다.", "error");
      return;
    }
    setOpenRefundDialog(true); // 모달 오픈
  };

  // 모달 안에서 "환불하기" 클릭 시 실행 
  const handleRefundConfirm = async () => {
    try {
      // 실제 API 호출
        const pathVarable = {usageId: lockerStatus.id}
        await refundLocker(pathVarable);
      
      // 성공 처리
      showNotification("환불 처리가 완료되었습니다.", "success");
      setLockerStatus({ use: false, number: 0, expiry: "", id: null });
      setOpenRefundDialog(false); // 모달 닫기
      
    } catch (error) {
      console.error("환불 실패", error);
      const msg = error.response?.data?.message || "환불 처리에 실패했습니다. 다시 시도해주세요.";
      showNotification(msg, "error");
      setOpenRefundDialog(false); // 에러 나도 모달은 닫기
    }
  };

  // 모달 닫기 핸들러
  const handleRefundCancel = () => {
    setOpenRefundDialog(false);
  };

  return (
    <Box sx={{ flexGrow: 1, bgcolor: "#f5f7fa", minHeight: "100vh" }}>
      {/* 상단바 */}
      <AppBar position="static" color="inherit" elevation={0} sx={{ borderBottom: '1px solid #e0e0e0', bgcolor: "white" }}>
        <Toolbar>
          <FitnessCenterIcon sx={{ mr: 2, color: "primary.main" }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: "800", color: "#333", letterSpacing: '-0.5px' }}>
            GYMBAROFIT
          </Typography>
          <IconButton color="primary" onClick={handleLogout}>
            <LogoutIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      <Container maxWidth="sm" sx={{ mt: 3, mb: 4, px: 3 }}>
        <Stack spacing={3} sx={{ width: "100%" }}>
          
          {/* 0. 환영 인사 & 지점 선택 */}
          <Paper 
            elevation={0} 
            sx={{ 
              p: 2, 
              borderRadius: 3, 
              border: '1px solid #eef2f6', 
              bgcolor: 'white',
              display: 'flex',
              flexDirection: 'column',
              gap: 2
            }}
          >
            <Typography variant="subtitle1" sx={{ color: "#333", fontWeight: '500' }}>
              오늘도 득근하세요, <Box component="span" sx={{ fontWeight: '800', color: 'primary.main' }}>{userName}</Box>님 💪
            </Typography>

            <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={1}>
              
              {/* [수정] 지점 선택 버튼 (조건부 렌더링) */}
              <Button
                onClick={handleGymMenuOpen}
                startIcon={<LocationOnIcon />}
                endIcon={<KeyboardArrowDownIcon />}
                size="small"
                color={currentGym ? "primary" : "error"} // 지점 없으면 빨간색 경고 느낌
                sx={{ 
                  fontWeight: 'bold', 
                  bgcolor: currentGym ? '#f5f5f5' : '#ffebee', 
                  borderRadius: 2,
                  px: 1.5,
                  '&:hover': { bgcolor: currentGym ? '#e0e0e0' : '#ffcdd2' }
                }}
              >
                {/* 데이터 유무에 따른 텍스트 표시 */}
                {currentGym ? currentGym.name : "헬스장 등록 필요 ⚠️"}
              </Button>
              
              {/* [수정] 드롭다운 메뉴 */}
              <Menu
                anchorEl={anchorEl}
                open={openMenu}
                onClose={handleGymMenuClose}
                PaperProps={{
                  elevation: 3,
                  sx: { borderRadius: 2, mt: 1, minWidth: 160 }
                }}
              >
                {/* 1. 등록된 헬스장 목록 렌더링 */}
                {myGyms.length > 0 ? (
                  myGyms.map((gym) => (
                    <MenuItem 
                      key={gym.id} 
                      onClick={() => handleGymSelect(gym)}
                      selected={currentGym?.id === gym.id}
                      sx={{ fontSize: '0.95rem' }}
                    >
                      {gym.name}
                    </MenuItem>
                  ))
                ) : (
                  <MenuItem disabled sx={{ fontSize: '0.9rem', color: 'text.secondary' }}>
                    등록된 정보가 없습니다.
                  </MenuItem>
                )}

                <Divider sx={{ my: 1 }} />

                {/* 2. 헬스장 추가 버튼 (항상 표시) */}
                <MenuItem onClick={handleGoToRegister} sx={{ color: 'primary.main', fontWeight: 'bold', fontSize: '0.9rem' }}>
                  <ListItemIcon>
                    <AddCircleOutlineIcon fontSize="small" color="primary" />
                  </ListItemIcon>
                  새 헬스장 등록
                </MenuItem>
              </Menu>

              {/* 혼잡도 Chip */}
              <Chip 
                icon={<PeopleAltIcon fontSize="small" style={{ color: crowdStatus.color }} />} 
                label={`현재 헬스장: ${crowdStatus.label}`} 
                size="small"
                sx={{ 
                  bgcolor: crowdStatus.bgColor, 
                  color: crowdStatus.color, 
                  fontWeight: "bold",
                  border: `1px solid ${crowdStatus.borderColor}`,
                  height: 32,
                  // 아이콘 색상 강제 오버라이드 방지
                  '& .MuiChip-icon': { color: 'inherit' }
                }} 
              />
            </Box>
          </Paper>

          {/* ... (이하 나머지 컴포넌트는 기존과 동일) ... */}
          {/* 편의상 나머지 코드는 생략하지만, 실제 파일엔 그대로 두시면 됩니다. */}
           <Paper 
            elevation={0} 
            sx={{ 
              p: 3, 
              borderRadius: 4, 
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
              color: 'white',
              boxShadow: '0 8px 32px rgba(118, 75, 162, 0.2)'
            }}
          >
            {/* 내부 정렬을 위한 Stack (반응형 대응: 모바일은 세로, 공간 남으면 가로 느낌이나 여기선 1열 유지 위해 flex wrap 등 활용 가능하지만, 항상 1열 요청에 맞춰 Stack 사용) */}
            <Stack spacing={2}>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box display="flex" alignItems="center">
                  <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 56, height: 56, mr: 2 }}>
                    <LocalFireDepartmentIcon sx={{ color: '#fff', fontSize: 32 }} />
                  </Avatar>
                  <Box>
                    <Typography variant="h5" fontWeight="800" sx={{ mb: 0.5 }}>
                      {attendance.checkedToday ? "오늘 출석 완료!" : `${attendance.streak}일 연속 🔥`}
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      {attendance.checkedToday ? "내일도 화이팅!" : "오늘도 출석 갱신!"}
                    </Typography>
                  </Box>
                </Box>
              </Box>

              {/* 버튼 그룹 */}
              <Stack direction="row" spacing={1.5} sx={{ width: '100%' }}>
                <Button 
                  fullWidth
                  variant="contained" 
                  onClick={handleCheckIn}
                  disabled={attendance.checkedToday}
                  startIcon={attendance.checkedToday ? <CheckCircleIcon /> : <LocalFireDepartmentIcon />}
                  sx={{ 
                    bgcolor: attendance.checkedToday ? 'rgba(0,0,0,0.2)' : 'white', 
                    color: attendance.checkedToday ? '#ddd' : '#764ba2', 
                    fontWeight: 'bold', 
                    py: 1.2,
                    '&:hover': { bgcolor: '#f5f5f5' } 
                  }}
                >
                  {attendance.checkedToday ? "완료됨" : "출석하기"}
                </Button>
                <Button 
                  fullWidth
                  variant="outlined" 
                  onClick={handleOpenQr}
                  startIcon={<QrCodeIcon />}
                  sx={{ 
                    borderColor: 'rgba(255,255,255,0.6)', 
                    color: 'white', 
                    fontWeight: 'bold',
                    py: 1.2,
                    '&:hover': { borderColor: 'white', bgcolor: 'rgba(255,255,255,0.1)' } 
                  }}
                >
                  입장 QR
                </Button>
              </Stack>
            </Stack>
          </Paper>

          {/* 2. 운동 목표 및 통계 */}
          <Paper elevation={0} sx={{ p: 4, borderRadius: 4, border: '1px solid #eef2f6', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
            <Box display="flex" alignItems="center" mb={3}>
              <Avatar sx={{ bgcolor: "primary.main", mr: 2, boxShadow: 2 }}>
                <EmojiEventsIcon />
              </Avatar>
              <Box>
                <Typography variant="h6" fontWeight="bold">
                  이번 주 운동 목표
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  목표 달성까지 30% 남았습니다.
                </Typography>
              </Box>
            </Box>

            {/* 내부 컨텐츠도 Stack으로 수직 배치 */}
            <Stack spacing={4}>
              {/* 위쪽: 그래프 및 상세 스탯 */}
              <Box>
                <Box sx={{ mb: 4, p: 2, bgcolor: '#f8f9fa', borderRadius: 3}}>
                  <Box display="flex" justifyContent="space-between" mb={1} alignItems="flex-end">
                    <Typography variant="subtitle2" fontWeight="bold" color="text.secondary">
                      주간 달성률
                    </Typography>
                    <Typography variant="h5" color="primary" fontWeight="800">
                      {weeklyProgress}%
                    </Typography>
                  </Box>
                  <LinearProgress 
                    variant="determinate" 
                    value={weeklyProgress} 
                    sx={{ height: 10, borderRadius: 5, bgcolor: "#e0e0e0", '& .MuiLinearProgress-bar': { borderRadius: 5 } }} 
                  />
                </Box>
                
                {/* 3개의 작은 박스는 가로로 나열하되 flex로 꽉 채움 */}
                <Stack direction="row" spacing={2}>
                  <Box sx={{ flex: 1, p: 2, borderRadius: 3, bgcolor: '#e3f2fd', textAlign: 'center' }}>
                    <CalendarTodayIcon color="primary" sx={{ mb: 1, fontSize: 28 }} />
                    <Typography variant="h5" fontWeight="800" color="text.primary">3일</Typography>
                    <Typography variant="caption" color="text.secondary" fontWeight="bold">출석</Typography>
                  </Box>
                  <Box sx={{ flex: 1, p: 2, borderRadius: 3, bgcolor: '#fff3e0', textAlign: 'center' }}>
                    <AccessTimeIcon color="warning" sx={{ mb: 1, fontSize: 28 }} />
                    <Typography variant="h5" fontWeight="800" color="text.primary">240</Typography>
                    <Typography variant="caption" color="text.secondary" fontWeight="bold">분</Typography>
                  </Box>
                  <Box sx={{ flex: 1, p: 2, borderRadius: 3, bgcolor: '#fbe9e7', textAlign: 'center' }}>
                    <LocalFireDepartmentIcon color="error" sx={{ mb: 1, fontSize: 28 }} />
                    <Typography variant="h5" fontWeight="800" color="text.primary">1.2k</Typography>
                    <Typography variant="caption" color="text.secondary" fontWeight="bold">kcal</Typography>
                  </Box>
                </Stack>
              </Box>

              {/* 아래쪽: 최근 기록 */}
              <Box>
                 <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                   <Typography variant="subtitle1" fontWeight="bold">
                    최근 운동 기록
                  </Typography>
                  <Button size="small" sx={{ fontWeight: 'bold' }}>더보기</Button>
                 </Box>
                
                <List disablePadding>
                  <ListItem sx={{ mb: 1.5, bgcolor: 'white', borderRadius: 2, border: '1px solid #f0f0f0', boxShadow: '0 2px 4px rgba(0,0,0,0.03)' }}>
                    <ListItemIcon>
                      <Avatar sx={{ bgcolor: '#e8eaf6', color: '#3f51b5', width: 36, height: 36 }}>
                        <FitnessCenterIcon fontSize="small" />
                      </Avatar>
                    </ListItemIcon>
                    <ListItemText 
                      primary={<Typography variant="subtitle2" fontWeight="bold">상체 근력 운동</Typography>}
                      secondary="2024-01-05 · 60분" 
                    />
                    <Chip label="완료" color="primary" size="small" sx={{ fontWeight: 'bold', borderRadius: 1 }} />
                  </ListItem>

                  <ListItem sx={{ mb: 1.5, bgcolor: 'white', borderRadius: 2, border: '1px solid #f0f0f0', boxShadow: '0 2px 4px rgba(0,0,0,0.03)' }}>
                    <ListItemIcon>
                       <Avatar sx={{ bgcolor: '#e0f2f1', color: '#009688', width: 36, height: 36 }}>
                        <TrendingUpIcon fontSize="small" />
                      </Avatar>
                    </ListItemIcon>
                    <ListItemText 
                      primary={<Typography variant="subtitle2" fontWeight="bold">유산소 러닝</Typography>}
                      secondary="2024-01-03 · 40분" 
                    />
                    <Chip label="완료" color="success" size="small" sx={{ fontWeight: 'bold', borderRadius: 1 }} />
                  </ListItem>
                </List>
              </Box>
            </Stack>
          </Paper>

          {/* 3. 운동기구 예약 (Stack Item) */}
          <Paper elevation={0} sx={{ p: 3, borderRadius: 4, border: '1px solid #eef2f6' }}>
            <Box display="flex" alignItems="center" mb={2}>
              <Avatar sx={{ bgcolor: "warning.light", color: "warning.main", mr: 2 }}>
                <EventAvailableIcon />
              </Avatar>
              <Typography variant="h6" fontWeight="bold">
                운동기구 예약
              </Typography>
            </Box>
            <Box sx={{ bgcolor: "#fff8e1", p: 3, borderRadius: 3, mb: 3, textAlign: 'center', border: '1px dashed #ffb74d' }}>
              {equipStatus.use ? (
                <>
                  <Typography variant="h5" fontWeight="bold" color="warning.main">
                    {equipStatus.name}
                  </Typography>
                  <Typography variant="body2">{equipStatus.time}</Typography>
                </>
              ) : (
                <Box py={1}>
                  <Typography variant="body1" color="text.secondary" fontWeight="500">
                    예약된 기구가 없습니다.
                  </Typography>
                  <Typography variant="caption" color="text.disabled">
                    붐비는 시간대라면 미리 예약해보세요!
                  </Typography>
                </Box>
              )}
            </Box>
            <Button 
              fullWidth 
              variant="contained" 
              color="warning" 
              size="large"
              sx={{ color: 'white', fontWeight: 'bold', borderRadius: 2, py: 1.5, boxShadow: 'none' }}
            >
              기구 예약하기
            </Button>
          </Paper>

          {/* 4. 개인 보관함 (Stack Item) */}
          <Paper elevation={0} sx={{ p: 3, borderRadius: 4, border: '1px solid #eef2f6' }}>
            <Box display="flex" alignItems="center" mb={2} justifyContent="space-between">
              <Box display="flex" alignItems="center">
                <Avatar sx={{ bgcolor: "secondary.light", color: "secondary.main", mr: 2 }}>
                  <LockIcon />
                </Avatar>
                <Typography variant="h6" fontWeight="bold">
                  개인 보관함
                </Typography>
              </Box>
              {/* 이용 중일 때만 상태 칩 표시 */}
              {lockerStatus.use && (
                <Chip label="이용중" color="secondary" size="small" sx={{ fontWeight: 'bold' }} />
              )}
            </Box>
            
            <Box sx={{ bgcolor: "#f3e5f5", p: 3, borderRadius: 3, mb: 3, textAlign: 'center', border: '1px dashed #ce93d8' }}>
              {lockerStatus.use ? (
                <>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    나의 보관함
                  </Typography>
                  <Typography variant="h4" fontWeight="800" color="secondary.main" sx={{ mb: 1 }}>
                    No. {lockerStatus.number}
                  </Typography>
                  <Typography variant="subtitle2" color="text.secondary" sx={{ fontWeight: 'bold' }}>
                    ~ {lockerStatus.expiry} 까지
                  </Typography>
                </>
              ) : (
                <Box py={1}>
                  <Typography variant="body1" color="text.secondary" fontWeight="500">
                    이용 중인 보관함이 없습니다.
                  </Typography>
                  <Typography variant="caption" color="text.disabled">
                    무거운 짐은 보관함에 맡기세요!
                  </Typography>
                </Box>
              )}
            </Box>

            {/* 버튼 그룹: 상태에 따라 조건부 렌더링 */}
            <Stack direction="row" spacing={1.5}>
              {lockerStatus.use ? (
                <>
                  {/* Case 1: 이용 중일 때 -> [환불] [연장] */}
                  <Button 
                    fullWidth 
                    variant="outlined" 
                    color="error" 
                    onClick={handleRefundClick}
                    sx={{ 
                      py: 1.5, 
                      borderRadius: 2, 
                      fontWeight: 'bold',
                      borderWidth: '2px',
                      '&:hover': { borderWidth: '2px', bgcolor: '#ffebee' }
                    }}
                  >
                    환불 신청
                  </Button>
                  <Button 
                    fullWidth 
                    variant="contained" 
                    color="secondary" 
                    component={Link} 
                    to="/lockers/extension" 
                    disableElevation
                    sx={{ 
                      py: 1.5, 
                      borderRadius: 2, 
                      fontWeight: 'bold' 
                    }}
                  >
                    기간 연장
                  </Button>
                </>
              ) : (
                /* Case 2: 미이용 중일 때 -> [신규 대여] 하나만 꽉 차게 */
                <Button 
                  fullWidth 
                  variant="contained" 
                  color="secondary" 
                  onClick={handleNewReservation} 
                  disableElevation 
                  startIcon={<AddCircleOutlineIcon />}
                  sx={{ py: 1.5, borderRadius: 2, fontWeight: 'bold' }}
                >
                  보관함 신규 대여
                </Button>
              )}
            </Stack>
          </Paper>

        </Stack>
      </Container>

      {/* 입장 QR 모달 */}
      <Dialog open={openQr} onClose={handleCloseQr} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ textAlign: 'center', fontWeight: 'bold' }}>입장 QR 코드</DialogTitle>
        <DialogContent>
          <Box display="flex" flexDirection="column" alignItems="center" py={2}>
            <QrCodeIcon sx={{ fontSize: 150, color: '#333' }} />
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              리더기에 QR코드를 스캔해주세요.
            </Typography>
            <Typography variant="caption" color="text.disabled">
              유효시간: 02:59
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', pb: 3 }}>
          <Button onClick={handleCloseQr} variant="outlined" sx={{ borderRadius: 4 }}>
            닫기
          </Button>
        </DialogActions>
      </Dialog>

      {/* 환불 확인 커스텀 모달 */}
      <Dialog
        open={openRefundDialog}
        onClose={handleRefundCancel}
        aria-labelledby="refund-dialog-title"
        aria-describedby="refund-dialog-description"
        PaperProps={{ sx: { borderRadius: 3, p: 1 } }} // 둥근 모서리 디자인
      >
        <DialogTitle id="refund-dialog-title" sx={{ fontWeight: "bold" }}>
          환불 하시겠습니까?
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="refund-dialog-description" sx={{ color: "#333" }}>
            보관함(No.<strong>{lockerStatus.number}</strong>) 이용이 즉시 종료됩니다.<br />
            정말 환불하시겠습니까?
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button 
            onClick={handleRefundCancel} 
            color="inherit" 
            sx={{ fontWeight: "bold", color: "#666" }}
          >
            취소
          </Button>
          <Button 
            onClick={handleRefundConfirm} 
            color="error" 
            variant="contained" 
            autoFocus
            sx={{ fontWeight: "bold", borderRadius: 2, boxShadow: "none" }}
          >
            환불하기
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}