import React, { useState, useEffect } from "react";
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Container,
  Paper,
  Button,
  Chip,
  Avatar,
  Card,
  CardContent,
  Divider,
  CircularProgress
} from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import { getLockerInfo, extendLocker } from "../../api/locker";
import { useNotification } from "../../context/NotificationContext";
import LockerPaymentDialog from "../../components/lockers/LockerPaymentDialog";; // Dialog 컴포넌트 import

// 아이콘
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import EventRepeatIcon from "@mui/icons-material/EventRepeat";

export default function Extension() {
  const navigate = useNavigate();
  const { usageId } = useParams();

  // 1. 상태 관리
  const [loading, setLoading] = useState(true);
  const [usageData, setUsageData] = useState(null);
  
  // Dialog 제어를 위한 상태 추가
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { showNotification } = useNotification();

  const loadLockerData = async () => {
    try {
      const pathVariable = { usageId: usageId };
      const res = await getLockerInfo(pathVariable);

      // 서버 날짜 배열 변환
      const formattedEndDate = `${res.endDate[0]}-${String(res.endDate[1]).padStart(2, "0")}-${String(res.endDate[2]).padStart(2, "0")}`;

      // 남은 일수 계산
      const today = new Date();
      const end = new Date(formattedEndDate);
      const diffTime = end - today;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 

      setUsageData({
        ...res,
        expiryDate: formattedEndDate,
        remainingDays: diffDays > 0 ? diffDays : 0,
      });
      setLoading(false);
    } catch(error) {
      console.error("데이터 로드 실패:", error);
      showNotification("정보를 불러오는데 실패했습니다.", "error");
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLockerData();
  }, [usageId]);

  // 2. 결제 및 연장 처리 핸들러 (Dialog의 onConfirm에서 호출됨)
  const handlePaymentConfirm = async (selectedDuration, selectedPaymentMethod) => {
    // 로딩 상태 활성화
    setLoading(true);
    setIsDialogOpen(false); // 로딩 중 Dialog 닫기

    try {
      const planMap = { 1: 'MONTH_1', 3: 'MONTH_3', 6: 'MONTH_6' };
      
      // 백엔드 명세에 맞춰 데이터 구성 (Dialog에서 받은 값 사용)
      const dto = { 
        plan: planMap[selectedDuration],       
        paymentMethod: selectedPaymentMethod 
      };

      const pathVariable = { usageId: usageId };

      // API 호출
      await extendLocker(dto, pathVariable);

      // 성공 시 처리
      showNotification(`${selectedDuration}개월 연장이 완료되었습니다.`, "success");
      navigate("/members");

    } catch (error) {
      console.error("연장 실패:", error);
      const errorMessage = error.response?.data?.message || "결제 및 연장에 실패했습니다.";
      showNotification(errorMessage, "error");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <CircularProgress />
      </Box>
    );
  }

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
                  <Typography variant="caption" color="text.secondary">{usageData.zoneName}</Typography>
                  <Typography variant="h5" fontWeight="800" color="secondary.main">
                    No. {usageData.lockerNumber}
                  </Typography>
                </Box>
              </Box>
              <Chip 
                label={`D-${usageData.remainingDays}`} 
                color="error" 
                size="small" 
                sx={{ fontWeight: 'bold', borderRadius: 2 }} 
              />
            </Box>

            <Divider sx={{ my: 2, borderStyle: 'dashed' }} />

            <Box display="flex" alignItems="center" justifyContent="space-between" bgcolor="#f8f9fa" p={2} borderRadius={2}>
              <Box>
                <Typography variant="caption" color="text.secondary">현재 만료일</Typography>
                <Typography variant="subtitle1" fontWeight="bold">{usageData.expiryDate}</Typography>
              </Box>
              <AccessTimeIcon color="action" fontSize="small" />
            </Box>
          </CardContent>
        </Card>

        {/* 안내 문구 (기존 내용 유지) */}
        <Box sx={{ px: 1 }}>
          <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
            💡 안내사항
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph sx={{ fontSize: '0.85rem' }}>
            • 기간 연장은 현재 이용 중인 만료일 기준으로 추가됩니다.
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph sx={{ fontSize: '0.85rem' }}>
            • 아래 버튼을 눌러 연장할 기간과 결제 수단을 선택해주세요.
          </Typography>
        </Box>

      </Container>

      {/* 2. 하단 고정 액션 바 */}
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
          <Button 
            fullWidth 
            variant="contained" 
            color="secondary"
            size="large" 
            onClick={() => setIsDialogOpen(true)} // Dialog 열기
            sx={{ 
              py: 2, 
              borderRadius: 3, 
              fontWeight: 'bold', 
              fontSize: '1.1rem',
              boxShadow: '0 8px 16px rgba(156, 39, 176, 0.24)'
            }}
          >
            기간 연장하기
          </Button>
        </Container>
      </Paper>

      {/* 3. 결제 Dialog 컴포넌트 연결 */}
      <LockerPaymentDialog
        open={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        lockerNumber={usageData?.lockerNumber}
        onConfirm={handlePaymentConfirm}
      />
    </Box>
  );
}