import React, { useState, useMemo } from "react";
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Container,
  Paper,
  Button,
  ToggleButton,
  ToggleButtonGroup,
  Divider,
  Chip,
  Avatar,
  Card,
  CardContent,
} from "@mui/material";
import { useNavigate } from "react-router-dom";

// 아이콘
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import EventRepeatIcon from "@mui/icons-material/EventRepeat"; // 연장 아이콘
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";

// 가격 정보 (예약 페이지와 동일)
const PRICES = { 1: 10000, 3: 27000, 6: 50000 };

export default function Extension() {
  const navigate = useNavigate();

  // 1. 가상 데이터 (현재 사용 중인 사물함 정보)
  // 실제 앱에서는 API나 Route State로 받아와야 합니다.
  const currentLocker = {
    section: "A 구역 (남자)",
    number: 103,
    expiryDate: "2024-02-20", // 현재 만료일
    remainingDays: 14, // 남은 일수
  };

  // 2. 상태 관리
  const [duration, setDuration] = useState(1); // 기본 1개월 선택

  // 3. 날짜 계산 로직 (Memoization)
  const newExpiryDate = useMemo(() => {
    const date = new Date(currentLocker.expiryDate);
    date.setMonth(date.getMonth() + duration);
    
    // 날짜 포맷팅 (YYYY-MM-DD)
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    
    return `${year}-${month}-${day}`;
  }, [currentLocker.expiryDate, duration]);

  // 기간 선택 핸들러
  const handleDurationChange = (event, newDuration) => {
    if (newDuration !== null) {
      setDuration(newDuration);
    }
  };

  // 연장 결제 핸들러
  const handleExtend = () => {
    alert(
      `[기간 연장 완료] 🎉\n\n` +
      `사물함: No.${currentLocker.number}\n` +
      `기간: ${currentLocker.expiryDate} ➔ ${newExpiryDate}\n` +
      `결제금액: ${PRICES[duration].toLocaleString()}원`
    );
    navigate("/"); // 대시보드로 복귀
  };

  return (
    <Box sx={{ bgcolor: "#f5f7fa", minHeight: "100vh", pb: 15 }}>
      
      {/* 상단 헤더 */}
      <AppBar position="sticky" color="inherit" elevation={0} sx={{ borderBottom: '1px solid #e0e0e0', bgcolor: "white" }}>
        <Toolbar>
          <IconButton edge="start" color="inherit" onClick={() => navigate(-1)} sx={{ mr: 1 }}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: "bold" }}>
            기간 연장
          </Typography>
        </Toolbar>
      </AppBar>

      <Container maxWidth="sm" sx={{ mt: 3 }}>

        {/* 1. 현재 사물함 정보 카드 */}
        <Typography variant="subtitle2" fontWeight="bold" color="text.secondary" sx={{ mb: 1, ml: 1 }}>
          이용 중인 사물함
        </Typography>
        <Card elevation={0} sx={{ borderRadius: 4, mb: 4, border: '1px solid #eef2f6', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
          <CardContent sx={{ p: 3 }}>
            <Box display="flex" justifyContent="space-between" alignItems="start" mb={2}>
              <Box display="flex" alignItems="center">
                <Avatar sx={{ bgcolor: 'secondary.light', color: 'secondary.main', mr: 2 }}>
                  <EventRepeatIcon />
                </Avatar>
                <Box>
                  <Typography variant="caption" color="text.secondary">{currentLocker.section}</Typography>
                  <Typography variant="h5" fontWeight="800" color="secondary.main">
                    No. {currentLocker.number}
                  </Typography>
                </Box>
              </Box>
              <Chip 
                label={`D-${currentLocker.remainingDays}`} 
                color="error" 
                size="small" 
                sx={{ fontWeight: 'bold', borderRadius: 2 }} 
              />
            </Box>

            <Divider sx={{ my: 2, borderStyle: 'dashed' }} />

            <Box display="flex" alignItems="center" justifyContent="space-between" bgcolor="#f8f9fa" p={2} borderRadius={2}>
              <Box>
                <Typography variant="caption" color="text.secondary">현재 만료일</Typography>
                <Typography variant="subtitle1" fontWeight="bold">{currentLocker.expiryDate}</Typography>
              </Box>
              <AccessTimeIcon color="action" fontSize="small" />
            </Box>
          </CardContent>
        </Card>


        {/* 2. 연장 기간 선택 */}
        <Typography variant="subtitle2" fontWeight="bold" color="text.secondary" sx={{ mb: 1, ml: 1 }}>
          연장할 기간 선택
        </Typography>
        <Paper elevation={0} sx={{ p: 3, borderRadius: 4, mb: 4, border: '1px solid #eef2f6' }}>
          <ToggleButtonGroup
            value={duration}
            exclusive
            onChange={handleDurationChange}
            fullWidth
            color="primary"
            sx={{ mb: 3 }}
          >
            {[1, 3, 6].map((month) => (
              <ToggleButton key={month} value={month} sx={{ py: 1.5, display: 'block' }}>
                <Typography variant="h6" fontWeight="bold">{month}개월</Typography>
                <Typography variant="caption" display="block">{PRICES[month].toLocaleString()}원</Typography>
              </ToggleButton>
            ))}
          </ToggleButtonGroup>

          {/* 기간 변화 시각화 (Before -> After) */}
          <Box 
            sx={{ 
              bgcolor: '#e3f2fd', 
              p: 2, 
              borderRadius: 3, 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between',
              border: '1px solid #bbdefb'
            }}
          >
            <Box textAlign="center">
              <Typography variant="caption" color="text.secondary">기존 종료</Typography>
              <Typography variant="body2" fontWeight="bold" sx={{textDecoration: 'line-through', color: '#999'}}>
                {currentLocker.expiryDate}
              </Typography>
            </Box>

            <ArrowForwardIcon color="primary" fontSize="small" />

            <Box textAlign="center">
              <Typography variant="caption" color="primary" fontWeight="bold">연장 후 종료일</Typography>
              <Typography variant="h6" fontWeight="800" color="primary">
                {newExpiryDate}
              </Typography>
            </Box>
          </Box>
        </Paper>

        {/* 3. 안내사항 */}
        <Box sx={{ px: 1 }}>
          <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
            💡 안내사항
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph sx={{ fontSize: '0.85rem' }}>
            • 기간 연장은 현재 이용 중인 만료일 기준으로 추가됩니다.
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph sx={{ fontSize: '0.85rem' }}>
            • 만료일이 지난 경우, 오늘 날짜를 기준으로 기간이 산정됩니다.
          </Typography>
        </Box>

      </Container>

      {/* 4. 하단 고정 결제 바 */}
      <Paper 
        elevation={10} 
        sx={{ 
          position: 'fixed', 
          bottom: 0, 
          left: 0, 
          right: 0, 
          p: 3, 
          borderTopLeftRadius: 24, 
          borderTopRightRadius: 24,
          bgcolor: 'white',
          zIndex: 1000
        }}
      >
        <Container maxWidth="sm">
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
             <Box>
               <Typography variant="caption" color="text.secondary">총 결제 금액</Typography>
               <Typography variant="h5" fontWeight="800" color="secondary.main">
                 {PRICES[duration].toLocaleString()}원
               </Typography>
             </Box>
             <Chip 
                icon={<CheckCircleOutlineIcon fontSize="small" />} 
                label={`${duration}개월 추가`} 
                color="secondary" 
                variant="outlined" 
                sx={{ fontWeight: 'bold', border: '2px solid' }}
             />
          </Box>

          <Button 
            fullWidth 
            variant="contained" 
            color="secondary"
            size="large" 
            onClick={handleExtend}
            sx={{ 
              py: 2, 
              borderRadius: 3, 
              fontWeight: 'bold', 
              fontSize: '1.1rem',
              boxShadow: '0 8px 16px rgba(156, 39, 176, 0.24)'
            }}
          >
            연장 결제하기
          </Button>
        </Container>
      </Paper>
    </Box>
  );
}