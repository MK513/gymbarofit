import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

import { 
  Box, Typography, Container, Paper, List, ListItem, 
  Divider, IconButton, Stack, Chip, ButtonBase, Avatar 
} from "@mui/material";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import FitnessCenterIcon from "@mui/icons-material/FitnessCenter";

export default function WorkoutHistory() {
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState(new Date().getDate());

  // 이번 달 전체 요약 데이터 (이전 요청 내용 통합)
  const monthlyStats = { totalTime: "1,240분", totalCalories: "8,500kcal", totalDays: "18일" };

  // 날짜별 상세 운동 데이터
  const workoutData = {
    22: [{ id: 3, title: "전신 스트레칭", minutes: 20, calories: 110, type: "유연성" }],
    24: [{ id: 2, title: "하체 웨이트", minutes: 60, calories: 350, type: "근력" }],
    26: [
      { id: 1, title: "심폐 강화 러닝", minutes: 45, calories: 420, type: "유산소" },
      { id: 4, title: "플랭크", minutes: 10, calories: 50, type: "코어" }
    ],
  };

  const days = Array.from({ length: 31 }, (_, i) => i + 1);

  return (
    <Container maxWidth="sm" sx={{ py: 4, bgcolor: '#f8f9fa', minHeight: '100vh' }}>
      {/* 1. 상단 헤더 */}
      <Box display="flex" alignItems="center" mb={3}>
        <IconButton sx={{ mr: 1, bgcolor: 'white' }} size="small" onClick={() => navigate(-1)}>
          <ArrowBackIcon fontSize="small" />
        </IconButton>
        <Typography variant="h6" fontWeight="900">운동 히스토리</Typography>
      </Box>

      {/* 2. 이번 달 요약 카드 (이전 디자인 복구 및 강화) */}
      <Paper 
        elevation={0}
        sx={{ 
          p: 3, 
          mb: 3, 
          borderRadius: 4, 
          bgcolor: 'primary.main', 
          color: 'white',
          backgroundImage: 'linear-gradient(45deg, #1976d2 30%, #42a5f5 90%)',
          boxShadow: '0 10px 20px rgba(25, 118, 210, 0.2)'
        }}
      >
        <Typography variant="subtitle2" sx={{ opacity: 0.9, fontWeight: 'bold' }}>1월 총 활동 리포트</Typography>
        <Stack direction="row" justifyContent="space-between" mt={3}>
          <SummaryItem label="운동 횟수" value={monthlyStats.totalDays} />
          <SummaryItem label="누적 시간" value={monthlyStats.totalTime} />
          <SummaryItem label="소모 칼로리" value={monthlyStats.totalCalories} />
        </Stack>
      </Paper>

      {/* 3. 달력 섹션 */}
      <Paper sx={{ p: 3, mb: 3, borderRadius: 4, border: '1px solid #eee' }} elevation={0}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="subtitle1" fontWeight="800">2026년 1월</Typography>
          <Stack direction="row" spacing={1}>
            <IconButton size="small" sx={{ border: '1px solid #eee' }}><ChevronLeftIcon fontSize="small" /></IconButton>
            <IconButton size="small" sx={{ border: '1px solid #eee' }}><ChevronRightIcon fontSize="small" /></IconButton>
          </Stack>
        </Box>

        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 1, textAlign: 'center' }}>
          {['일', '월', '화', '수', '목', '금', '토'].map(d => (
            <Typography key={d} variant="caption" color="text.disabled" fontWeight="900" sx={{ mb: 1 }}>{d}</Typography>
          ))}
          {days.map(day => {
            const hasWorkout = workoutData[day];
            const isSelected = selectedDate === day;
            return (
              <ButtonBase 
                key={day}
                onClick={() => setSelectedDate(day)}
                sx={{ 
                  flexDirection: 'column',
                  py: 1.5, 
                  borderRadius: 3,
                  bgcolor: isSelected ? 'primary.light' : 'transparent',
                  color: isSelected ? 'primary.main' : 'text.primary',
                  transition: '0.2s',
                  '&:hover': { bgcolor: '#f0f7ff' }
                }}
              >
                <Typography variant="body2" fontWeight={isSelected ? "900" : "600"}>{day}</Typography>
                {hasWorkout && (
                  <Box sx={{ width: 5, height: 5, bgcolor: isSelected ? 'primary.main' : '#bcccdc', borderRadius: '50%', mt: 0.5 }} />
                )}
              </ButtonBase>
            );
          })}
        </Box>
      </Paper>

      {/* 4. 선택된 날짜 상세 내역 */}
      <Box px={1}>
        <Typography variant="subtitle1" fontWeight="900" mb={2}>
          {selectedDate}일의 기록
        </Typography>
        
        {workoutData[selectedDate] ? (
          <List disablePadding>
            {workoutData[selectedDate].map((log) => (
              <HistoryDetailItem key={log.id} log={log} />
            ))}
          </List>
        ) : (
          <Paper variant="outlined" sx={{ p: 4, textAlign: 'center', borderRadius: 4, borderStyle: 'dashed', bgcolor: 'transparent' }}>
            <Typography variant="body2" color="text.disabled" fontWeight="bold">
              운동 기록이 없는 날입니다.
            </Typography>
          </Paper>
        )}
      </Box>
    </Container>
  );
}

// 요약 항목 컴포넌트
function SummaryItem({ label, value }) {
  return (
    <Box>
      <Typography variant="h5" fontWeight="900">{value.replace(/[^0-9,]/g, '')}</Typography>
      <Typography variant="caption" sx={{ opacity: 0.8, fontWeight: 'bold' }}>{label.replace(/[0-9]/g, '')} ({value.replace(/[0-9,]/g, '')})</Typography>
    </Box>
  );
}

// 상세 내역 아이템 컴포넌트
function HistoryDetailItem({ log }) {
  return (
    <Paper elevation={0} sx={{ mb: 2, borderRadius: 4, border: '1px solid #f1f3f5', p: 0.5 }}>
      <ListItem>
        <Avatar sx={{ bgcolor: '#f8f9fa', mr: 2, width: 48, height: 48 }}>
          <FitnessCenterIcon sx={{ color: 'primary.main' }} />
        </Avatar>
        <ListItemText 
          primary={<Typography variant="body1" fontWeight="800">{log.title}</Typography>} 
          secondary={
            <Stack direction="row" spacing={1.5} mt={0.5}>
              <Box display="flex" alignItems="center">
                <AccessTimeIcon sx={{ fontSize: 14, mr: 0.3, color: 'text.secondary' }} />
                <Typography variant="caption" fontWeight="bold">{log.minutes}분</Typography>
              </Box>
              <Box display="flex" alignItems="center">
                <LocalFireDepartmentIcon sx={{ fontSize: 14, mr: 0.3, color: 'error.light' }} />
                <Typography variant="caption" fontWeight="bold">{log.calories}kcal</Typography>
              </Box>
            </Stack>
          } 
        />
        <Chip label={log.type} size="small" sx={{ fontWeight: 'bold', bgcolor: '#eef2f6', color: '#455a64' }} />
      </ListItem>
    </Paper>
  );
}