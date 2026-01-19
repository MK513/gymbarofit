import React from "react";
import { Paper, Box, Avatar, Typography, Button, Chip, Stack } from "@mui/material";
import FitnessCenterIcon from "@mui/icons-material/FitnessCenter";
import EventAvailableIcon from "@mui/icons-material/EventAvailable";
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import { BUCKET_BASE_URL } from "../../../api-config";

export default function EquipmentCard({ 
  usageData, 
  reservationData, 
  onReservationClick,
  onEndUsageClick, 
  onStartUsageClick, // [추가] 사용 시작 핸들러
  onCancelReservationClick 
}) {

  const isEmpty = !usageData && !reservationData;
  const isFullState = usageData && reservationData;

  // 기구 정보 섹션 컴포넌트
  const EquipmentSection = ({ 
    data, 
    titleIcon, 
    titleText, 
    statusLabel, 
    isPrimary,      
    isCalled,
    actionLabel,
    onAction,
    onStartAction // [추가] 시작 액션 핸들러
  }) => {
    
    let bgColor, borderColor, textColor, chipColor;
    
    if (isCalled) {
        bgColor = "#ffebee";
        borderColor = "#ffcdd2";
        textColor = "error.main";
        chipColor = "error";
    } else if (isPrimary) {
        bgColor = "#fff8e1"; 
        borderColor = "#ffe0b2";
        textColor = "warning.dark";
        chipColor = "warning";
    } else {
        bgColor = "#fafafa"; 
        borderColor = "#eeeeee";
        textColor = "text.secondary";
        chipColor = "default";
    }

    return (
      <Paper
        elevation={0}
        sx={{
          p: 2,
          borderRadius: 3,
          bgcolor: bgColor, 
          border: '1px solid',
          borderColor: borderColor,
          transition: isCalled ? "transform 0.2s ease-in-out" : "none",
          boxShadow: isCalled ? "0 4px 12px rgba(211, 47, 47, 0.15)" : "none",
        }}
      >
        <Box display="flex" alignItems="center" mb={1.5}>
          <Box sx={{ color: textColor, mr: 1, display: 'flex' }}>
            {titleIcon}
          </Box>
          <Typography variant="subtitle2" fontWeight="bold" color={textColor}>
            {titleText}
          </Typography>
        </Box>
        
        <Stack direction="row" spacing={2} alignItems="flex-start">
          {data.imageUrl && (
            <Box 
              component="img"
              src={`${BUCKET_BASE_URL}${data.imageUrl}`}
              alt={data.name}
              sx={{ 
                width: 60,
                height: 60, 
                objectFit: 'contain', 
                bgcolor: 'white',
                borderRadius: 2,
                p: 0.5,
                border: '1px solid',
                borderColor: 'rgba(0,0,0,0.05)'
              }}
            />
          )}
          
          <Box flexGrow={1}>
            <Box display="flex" alignItems="center" justifyContent="space-between" mb={0.5}>
              <Typography variant="subtitle1" fontWeight="700" color="text.primary">
                {data.name}
              </Typography>
              {statusLabel && (
                <Chip 
                  label={statusLabel} 
                  color={chipColor}
                  size="small" 
                  sx={{ 
                    fontWeight: 'bold', 
                    height: 20,
                    fontSize: '0.7rem',
                  }} 
                />
              )}
            </Box>

            <Typography variant="caption" color={isCalled ? "error.main" : "text.secondary"} sx={{ display: 'flex', alignItems: 'center', mb: 1.5, fontWeight: isCalled ? 700 : 500 }}>
              <AccessTimeIcon sx={{ fontSize: 14, mr: 0.5 }} /> {data.time}
            </Typography>

            {/* [변경점] isCalled 상태일 때 2개 버튼, 아닐 때 1개 버튼 */}
            {isCalled ? (
              <Stack direction="row" spacing={1}>
                <Button
                  size="small"
                  onClick={onStartAction}
                  fullWidth
                  variant="contained"
                  color="error"
                  disableElevation
                  sx={{
                    borderRadius: 2.5,
                    fontSize: "0.8rem",
                    fontWeight: "bold",
                    bgcolor: "error.main",
                    '&:hover': { bgcolor: "error.dark" }
                  }}
                >
                  사용 시작
                </Button>
                <Button
                  size="small"
                  onClick={onAction}
                  fullWidth
                  variant="outlined"
                  color="error"
                  sx={{
                    borderRadius: 2.5,
                    fontSize: "0.8rem",
                    fontWeight: "bold",
                    bgcolor: "white",
                    borderColor: "error.light",
                    '&:hover': { bgcolor: "#ffebee", borderColor: "error.main" }
                  }}
                >
                  취소
                </Button>
              </Stack>
            ) : (
              <Button
                size="small"
                onClick={onAction}
                fullWidth
                disableElevation
                sx={{
                  bgcolor: "white", 
                  color: isPrimary ? "warning.dark" : "text.primary",
                  border: '1px solid',
                  borderColor: isPrimary ? "warning.light" : "grey.300",
                  borderRadius: 2.5,
                  py: 0.5,
                  fontSize: "0.8rem",
                  fontWeight: "bold",
                  boxShadow: "0px 2px 4px rgba(0,0,0,0.02)",
                  '&:hover': {
                     bgcolor: isPrimary ? "#fff3e0" : "#f5f5f5",
                  }
                }}
              >
                {actionLabel}
              </Button>
            )}
          </Box>
        </Stack>
      </Paper>
    );
  };

  return (
    <Paper elevation={0} sx={{ p: 3, borderRadius: 4, border: '1px solid #eef2f6' }}>
      <Box display="flex" alignItems="center" mb={3}>
        <Avatar sx={{ bgcolor: "warning.light", color: "warning.main", mr: 2 }}>
          <FitnessCenterIcon />
        </Avatar>
        <Typography variant="h6" fontWeight="bold">운동 기구</Typography>
      </Box>

      <Stack spacing={2} mb={3}>
        
        {usageData && (
          <EquipmentSection
            data={usageData}
            titleIcon={<FitnessCenterIcon sx={{ fontSize: 18 }} />}
            titleText="현재 이용중"
            statusLabel="이용중"
            isPrimary={true}
            actionLabel="사용 종료"
            onAction={onEndUsageClick}
          />
        )}

        {reservationData && (
          <EquipmentSection
            data={reservationData}
            titleIcon={reservationData.status === 'CALLED' ? <NotificationsActiveIcon sx={{ fontSize: 18 }} /> : <EventAvailableIcon sx={{ fontSize: 18 }} />}
            titleText={reservationData.status === 'CALLED' ? "입장 안내" : "예약 대기"}
            statusLabel={reservationData.status === 'CALLED' ? "입장대기" : "예약중"}
            isPrimary={false}
            isCalled={reservationData.status === 'CALLED'} 
            
            // [변경점] actionLabel은 대기중일 때만 쓰이고, 호출시엔 무시됨(별도 버튼 렌더링)
            actionLabel="대기 취소" 
            onAction={onCancelReservationClick} // 취소 핸들러
            onStartAction={onStartUsageClick}   // 시작 핸들러
          />
        )}

        {isEmpty && (
          <Box 
            sx={{ 
              p: 4, 
              borderRadius: 3, 
              bgcolor: 'grey.50', 
              border: '1px dashed',
              borderColor: 'grey.300',
              textAlign: 'center' 
            }}
          >
            <FitnessCenterIcon sx={{ fontSize: 40, color: 'text.disabled', mb: 1 }} />
            <Typography variant="body1" color="text.secondary" fontWeight="500" gutterBottom>
              이용 내역이 없습니다.
            </Typography>
            <Typography variant="caption" color="text.disabled">
              운동기구를 예약하고 바로 이용해보세요!
            </Typography>
          </Box>
        )}
      </Stack>

      {!isFullState && (
        <Button 
          fullWidth 
          variant="contained" 
          color="warning" 
          size="large" 
          onClick={onReservationClick}
          disableElevation
          sx={{ 
            py: 1.5, 
            borderRadius: 3, 
            fontWeight: 'bold', 
            color: 'white',
            boxShadow: '0 4px 12px rgba(237, 108, 2, 0.2)'
          }}
        >
          기구 예약하러 가기
        </Button>
      )}
    </Paper>
  );
}