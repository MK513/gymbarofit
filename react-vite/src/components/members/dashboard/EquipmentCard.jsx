import React from "react";
import { Paper, Box, Avatar, Typography, Button, Chip, Stack } from "@mui/material";
import FitnessCenterIcon from "@mui/icons-material/FitnessCenter";
import EventAvailableIcon from "@mui/icons-material/EventAvailable";
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { BUCKET_BASE_URL } from "../../../api-config";

export default function EquipmentCard({ usageData, reservationData, onReservationClick }) {

  const isEmpty = !usageData && !reservationData;

  // 기구 정보 섹션 컴포넌트 (내부에서 재사용)
  const EquipmentSection = ({ data, titleIcon, titleText, statusLabel, statusVariant, isPrimary }) => (
    <Paper
      elevation={0}
      sx={{
        p: 2,
        borderRadius: 3,
        bgcolor: isPrimary ? "#fff3e0" : "#fafafa", // 연한 주황색 / 연한 회색
        border: '1px solid',
        borderColor: isPrimary ? "#ffb74d" : "#e0e0e0", // 주황색 / 회색 테두리
      }}
    >
      {/* 섹션 타이틀 (아이콘 + 텍스트) */}
      <Box display="flex" alignItems="center" mb={1.5}>
        <Box sx={{ color: isPrimary ? "warning.main" : "text.secondary", mr: 1, display: 'flex' }}>
          {titleIcon}
        </Box>
        <Typography variant="subtitle2" fontWeight="bold" color={isPrimary ? "warning.main" : "text.secondary"}>
          {titleText}
        </Typography>
      </Box>
      
      {/* 기구 정보 (이미지 + 텍스트 + 상태 칩) */}
      <Stack direction="row" spacing={2} alignItems="center">
        {data.imageUrl && (
          <Box 
            component="img"
            src={`${BUCKET_BASE_URL}${data.imageUrl}`}
            alt={data.name}
            sx={{ 
              width: isPrimary ? 72 : 64, // 이용중일 때 이미지를 약간 더 크게
              height: isPrimary ? 72 : 64, 
              objectFit: 'contain', 
              bgcolor: 'white',
              borderRadius: 2,
              p: 0.5,
              border: '1px solid',
              borderColor: 'grey.200'
            }}
          />
        )}
        <Box flexGrow={1}>
          <Box display="flex" alignItems="center" justifyContent="space-between" mb={0.5}>
            <Typography variant="h6" fontWeight="700" color="text.primary" sx={{ fontSize: isPrimary ? '1.125rem' : '1rem' }}>
              {data.name}
            </Typography>
            {statusLabel && (
              <Chip 
                label={statusLabel} 
                color="warning"
                size="small" 
                sx={{ 
                  fontWeight: 'bold', 
                  color: statusVariant === 'filled' ? 'white' : undefined,
                  height: 24
                }} 
                variant={statusVariant}
              />
            )}
          </Box>
          <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center' }}>
            <AccessTimeIcon sx={{ fontSize: 16, mr: 0.5 }} /> {data.time}
          </Typography>
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

      {/* 3. 하단 버튼 영역 */}
      <Button 
        fullWidth 
        variant="contained" 
        color="warning" 
        size="large" 
        onClick={onReservationClick}
        disableElevation
        sx={{ 
          py: 1.5, 
          borderRadius: 2, 
          fontWeight: 'bold', 
          color: 'white' 
        }}
      >
        기구 예약하러 가기
      </Button>
    </Paper>
  );
}