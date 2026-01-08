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
  Divider, // 구분선 추가
} from "@mui/material";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

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
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline'; // 추가 버튼 아이콘

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  // 기존 상태들
  const [lockerStatus] = useState({ use: true, number: 103, expiry: "2024-02-20" });
  const [equipStatus] = useState({ use: false, name: "", time: "" });
  const [attendance, setAttendance] = useState({ streak: 3, checkedToday: false }); 
  const [openQr, setOpenQr] = useState(false); 

  // [수정] 지점 관리 상태
  const [myGyms, setMyGyms] = useState([]); // 서버에서 가져온 헬스장 목록
  const [currentGym, setCurrentGym] = useState(null); // 현재 선택된 헬스장 객체
  const [anchorEl, setAnchorEl] = useState(null);
  const openMenu = Boolean(anchorEl);

  // [추가] 헬스장 목록 불러오기 (Mocking)
  useEffect(() => {
    // 실제 구현 시: axios.get('/api/member/gyms').then(...)
    const fetchGyms = async () => {
      try {
        // ▼▼▼ 가상 데이터 (테스트용: 빈 배열 []로 바꾸면 '등록 필요' 뜸) ▼▼▼
        // const responseData = []; // 데이터가 없을 때 테스트
        const responseData = [
          { id: 1, name: "강남 1호점" },
          { id: 2, name: "역삼 2호점" }
        ];

        setMyGyms(responseData);

        // 초기값 설정: 목록이 있으면 첫 번째 지점 선택
        if (responseData.length > 0) {
          setCurrentGym(responseData[0]);
        } else {
          setCurrentGym(null);
        }
      } catch (error) {
        console.error("헬스장 목록 로딩 실패", error);
      }
    };

    fetchGyms();
  }, []);

  useEffect(() => {
    if (!user) navigate("/login");
  }, [user, navigate]);

  if (!user) return null;

  const weeklyProgress = 70;
  const userName = user.name || "회원";

  const handleLogout = () => {
    logout();
    alert("로그아웃 되었습니다.");
    navigate("/login");
  };

  const handleCheckIn = () => {
    if (attendance.checkedToday) return;
    setAttendance(prev => ({ streak: prev.streak + 1, checkedToday: true }));
    alert(`출석체크 완료! 🔥\n${attendance.streak + 1}일 연속 운동 중입니다.`);
  };

  const handleNewReservation = () => navigate('/locker/reservation');
  const handleOpenQr = () => setOpenQr(true);
  const handleCloseQr = () => setOpenQr(false);

  // [수정] 지점 선택 핸들러
  const handleGymMenuOpen = (event) => setAnchorEl(event.currentTarget);
  
  const handleGymSelect = (gym) => {
    setCurrentGym(gym);
    setAnchorEl(null);
    // TODO: 선택된 지점에 따라 대시보드 데이터(출석, 예약 등) 다시 불러오기
    // fetchDashboardData(gym.id); 
  };

  const handleGymMenuClose = () => setAnchorEl(null);

  // [추가] 헬스장 등록 페이지 이동
  const handleGoToRegister = () => {
    setAnchorEl(null);
    navigate('/members/gym/register'); // 헬스장 등록 라우트로 이동
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

              <Chip 
                icon={<PeopleAltIcon fontSize="small" />} 
                label="현재 헬스장: 쾌적 🟢" 
                size="small"
                sx={{ 
                  bgcolor: "#e8f5e9", 
                  color: "#2e7d32", 
                  fontWeight: "bold",
                  border: '1px solid #c8e6c9',
                  height: 32
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
            <Box display="flex" alignItems="center" mb={2}>
              <Avatar sx={{ bgcolor: "secondary.light", color: "secondary.main", mr: 2 }}>
                <LockIcon />
              </Avatar>
              <Typography variant="h6" fontWeight="bold">
                개인 보관함
              </Typography>
            </Box>
            
            <Box sx={{ bgcolor: "#f3e5f5", p: 3, borderRadius: 3, mb: 3, textAlign: 'center', border: '1px dashed #ce93d8' }}>
              {lockerStatus.use ? (
                <>
                  <Typography variant="body2" color="text.secondary" gutterBottom>현재 이용 중</Typography>
                  <Typography variant="h4" fontWeight="800" color="secondary.main" sx={{ mb: 1 }}>
                    No. {lockerStatus.number}
                  </Typography>
                  <Chip label={`~ ${lockerStatus.expiry} 까지`} size="small" color="secondary" variant="filled" sx={{ borderRadius: 1 }} />
                </>
              ) : (
                <Typography variant="body1" color="text.secondary" sx={{ py: 3 }}>
                  이용 중인 보관함이 없습니다.
                </Typography>
              )}
            </Box>

            <Stack direction="row" spacing={2}>
              <Button fullWidth variant="outlined" color="secondary" component={Link} to="/locker/extension" sx={{ py: 1.5, borderRadius: 2, fontWeight: 'bold' }}>
                기간 연장
              </Button>
              <Button fullWidth variant="contained" color="secondary" onClick={handleNewReservation} disableElevation sx={{ py: 1.5, borderRadius: 2, fontWeight: 'bold' }}>
                신규 예약
              </Button>
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
    </Box>
  );
}