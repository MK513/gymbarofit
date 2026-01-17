import React from "react";
import { Paper, Box, Avatar, Typography, Button, Chip, Stack } from "@mui/material";
import FitnessCenterIcon from "@mui/icons-material/FitnessCenter";
import EventAvailableIcon from "@mui/icons-material/EventAvailable";
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { BUCKET_BASE_URL } from "../../../api-config";

export default function EquipmentCard({ 
  usageData, 
  reservationData, 
  onReservationClick,
  onEndUsageClick, 
  onCancelReservationClick 
}) {

  const isEmpty = !usageData && !reservationData;

  // 기구 정보 섹션 컴포넌트
  const EquipmentSection = ({ 
    data, 
    titleIcon, 
    titleText, 
    statusLabel, 
    statusVariant, 
    isPrimary,
    actionLabel,
    onAction
  }) => (
    <Paper
      elevation={0}
      sx={{
        p: 2,
        borderRadius: 3,
        // 배경색: Primary(이용중)는 연한 주황, 아니면 연한 회색
        bgcolor: isPrimary ? "#fff8e1" : "#fafafa", 
        border: '1px solid',
        borderColor: isPrimary ? "#ffe0b2" : "#eeeeee",
      }}
    >
      {/* 섹션 타이틀 */}
      <Box display="flex" alignItems="center" mb={1.5}>
        <Box sx={{ color: isPrimary ? "warning.main" : "text.secondary", mr: 1, display: 'flex' }}>
          {titleIcon}
        </Box>
        <Typography variant="subtitle2" fontWeight="bold" color={isPrimary ? "warning.dark" : "text.secondary"}>
          {titleText}
        </Typography>
      </Box>
      
      {/* 기구 정보 컨텐츠 */}
      <Stack direction="row" spacing={2} alignItems="flex-start">
        {/* 기구 이미지 */}
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
        
        {/* 텍스트 정보 및 버튼 영역 */}
        <Box flexGrow={1}>
          {/* 이름과 상태 칩 */}
          <Box display="flex" alignItems="center" justifyContent="space-between" mb={0.5}>
            <Typography variant="subtitle1" fontWeight="700" color="text.primary">
              {data.name}
            </Typography>
            {statusLabel && (
              <Chip 
                label={statusLabel} 
                color={isPrimary ? "warning" : "default"}
                size="small" 
                sx={{ 
                  fontWeight: 'bold', 
                  height: 20,
                  fontSize: '0.7rem',
                  bgcolor: isPrimary ? 'warning.main' : 'rgba(0,0,0,0.08)',
                  color: isPrimary ? 'white' : 'text.secondary'
                }} 
              />
            )}
          </Box>

          {/* 시간 표시 */}
          <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', mb: 1.5, fontWeight: 500 }}>
            <AccessTimeIcon sx={{ fontSize: 14, mr: 0.5 }} /> {data.time}
          </Typography>

          {/* [디자인 수정됨] 작고 예쁜 액션 버튼 */}
          <Button
            size="small"
            onClick={onAction}
            fullWidth
            disableElevation
            sx={{
              bgcolor: "white", // 배경을 흰색으로 하여 깔끔하게
              color: isPrimary ? "warning.dark" : "text.primary", // 글자색
              border: '1px solid',
              borderColor: isPrimary ? "warning.light" : "grey.300",
              borderRadius: 2.5, // 둥근 모서리 (Pill shape 느낌)
              py: 0.5,           // 상하 패딩을 줄여 슬림하게
              fontSize: "0.8rem",
              fontWeight: "bold",
              boxShadow: "0px 2px 4px rgba(0,0,0,0.02)", // 아주 은은한 그림자
              transition: "all 0.2s",
              '&:hover': {
                 bgcolor: isPrimary ? "#fff3e0" : "#f5f5f5",
                 borderColor: isPrimary ? "warning.main" : "grey.400",
                 boxShadow: "0px 2px 8px rgba(0,0,0,0.05)",
                 transform: "translateY(-1px)" // 호버 시 살짝 떠오르는 효과
              }
            }}
          >
            {actionLabel}
          </Button>
        </Box>
      </Stack>
    </Paper>
  );

  return (
    <Paper elevation={0} sx={{ p: 3, borderRadius: 4, border: '1px solid #eef2f6' }}>
      {/* 1. 헤더 영역 */}
      <Box display="flex" alignItems="center" mb={3}>
        <Avatar sx={{ bgcolor: "warning.light", color: "warning.main", mr: 2 }}>
          <FitnessCenterIcon />
        </Avatar>
        <Typography variant="h6" fontWeight="bold">운동 기구</Typography>
      </Box>

      {/* 2. 메인 컨텐츠 영역 */}
      <Stack spacing={2} mb={3}>
        {!isEmpty ? (
          <>
            {/* 사용 중인 기구 정보 */}
            {usageData && (
              <EquipmentSection
                data={usageData}
                titleIcon={<FitnessCenterIcon sx={{ fontSize: 18 }} />}
                titleText="현재 이용중"
                statusLabel="이용중"
                statusVariant="filled"
                isPrimary={true}
                actionLabel="사용 종료"
                onAction={onEndUsageClick}
              />
            )}

            {/* 예약 중인 기구 정보 */}
            {reservationData && (
              <EquipmentSection
                data={reservationData}
                titleIcon={<EventAvailableIcon sx={{ fontSize: 18 }} />}
                titleText="예약 대기"
                statusLabel="예약중"
                statusVariant="outlined"
                isPrimary={false}
                actionLabel="대기 취소"
                onAction={onCancelReservationClick}
              />
            )}
          </>
        ) : (
          // 데이터가 없을 때 (Empty State)
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

      {/* 3. 하단 메인 버튼 영역 */}
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
          boxShadow: '0 4px 12px rgba(237, 108, 2, 0.2)' // 메인 버튼에 부드러운 그림자 추가
        }}
      >
        기구 예약하러 가기
      </Button>
    </Paper>
  );
}