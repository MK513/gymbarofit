import React from "react";
import { Paper, Box, Typography, Stack, List, ListItem, ListItemIcon, ListItemText, Chip, Divider, Avatar, ButtonBase } from "@mui/material";
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import FitnessCenterIcon from "@mui/icons-material/FitnessCenter";
import TimerIcon from '@mui/icons-material/Timer';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import BarChartIcon from '@mui/icons-material/BarChart'; // 요약 아이콘 추가

export default function StatsCard({ totalMinutes, totalCalories, activities = [], onMoreClick }) {
  return (
    <Paper 
      elevation={0} 
      sx={{ 
        p: 3, 
        borderRadius: 4, 
        border: '1px solid #eef2f6', 
        boxShadow: '0 8px 24px rgba(149, 157, 165, 0.1)',
        maxWidth: 400 
      }}
    >
      {/* 상단 헤더 영역: 제목 + 아이콘 + 전체보기 버튼 */}
      <Box mb={3}>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start">
          <Stack direction="row" spacing={1} alignItems="center">
            {/* 제목 왼쪽 아이콘 */}
            <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.light', color: 'primary.main' }}>
              <BarChartIcon sx={{ fontSize: 20 }} />
            </Avatar>
            <Box>
              <Typography variant="h6" fontWeight="800" lineHeight={1.2}>
                금일 운동 요약
              </Typography>
              <Typography variant="body2" color="text.secondary">
                끈기 있는 모습이 멋져요!
              </Typography>
            </Box>
          </Stack>

          {/* 위치 이동: 전체 기록 보기 버튼 */}
          <ButtonBase 
            onClick={onMoreClick}
            sx={{ 
              color: 'primary.main', 
              fontSize: '0.75rem', 
              fontWeight: 'bold',
              padding: '6px 10px',
              borderRadius: 2,
              bgcolor: 'rgba(25, 118, 210, 0.05)', // 배경색을 살짝 주어 버튼임을 강조
              '&:hover': { bgcolor: 'rgba(25, 118, 210, 0.12)' }
            }}
          >
            전체 보기 <ChevronRightIcon sx={{ fontSize: 16 }} />
          </ButtonBase>
        </Box>
      </Box>

      {/* 메인 데이터 영역: 시간 & 칼로리 */}
      <Stack direction="row" spacing={2} mb={4}>
        <MainStatBox 
          icon={<TimerIcon sx={{ fontSize: 32, color: '#448aff' }} />} 
          value={totalMinutes} 
          unit="분" 
          label="운동 시간" 
          bgColor="#f0f7ff" 
        />
        <MainStatBox 
          icon={<LocalFireDepartmentIcon sx={{ fontSize: 32, color: '#ff5252' }} />} 
          value={totalCalories} 
          unit="kcal" 
          label="소모 칼로리" 
          bgColor="#fff5f5" 
        />
      </Stack>

      <Divider sx={{ mb: 3, borderStyle: 'dashed' }} />

      {/* 하단 세부 리스트 */}
      <Box>
        <Typography variant="subtitle2" fontWeight="bold" color="text.secondary" mb={1}>
          최근 기록
        </Typography>
        
        <List disablePadding>
          {activities.length > 0 ? activities.slice(0, 2).map((item, index) => (
            <SimpleActivityItem key={index} title={item.title} subText={`${item.minutes}분 · ${item.calories}kcal`} />
          )) : (
            <Typography variant="body2" color="text.disabled" textAlign="center" py={2}>
              기록된 상세 활동이 없습니다.
            </Typography>
          )}
        </List>
      </Box>
    </Paper>
  );
}

// (MainStatBox 및 SimpleActivityItem 컴포넌트는 기존과 동일)
function MainStatBox({ icon, value, unit, label, bgColor }) {
  return (
    <Box sx={{ 
      flex: 1, 
      p: 2.5, 
      borderRadius: 4, 
      bgcolor: bgColor, 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center',
      transition: 'transform 0.2s',
      '&:hover': { transform: 'translateY(-4px)' }
    }}>
      {icon}
      <Box sx={{ mt: 1.5, display: 'flex', alignItems: 'baseline' }}>
        <Typography variant="h4" fontWeight="900" color="text.primary">{value}</Typography>
        <Typography variant="caption" fontWeight="bold" sx={{ ml: 0.5 }}>{unit}</Typography>
      </Box>
      <Typography variant="caption" color="text.secondary" fontWeight="700" sx={{ mt: 0.5 }}>
        {label}
      </Typography>
    </Box>
  );
}

function SimpleActivityItem({ title, subText }) {
  return (
    <ListItem sx={{ px: 1, py: 1 }}>
      <ListItemIcon sx={{ minWidth: 40 }}>
        <Avatar sx={{ width: 32, height: 32, bgcolor: '#f5f5f5' }}>
          <FitnessCenterIcon sx={{ fontSize: 18, color: '#757575' }} />
        </Avatar>
      </ListItemIcon>
      <ListItemText 
        primary={<Typography variant="body2" fontWeight="bold">{title}</Typography>} 
        secondary={<Typography variant="caption" color="text.secondary">{subText}</Typography>} 
      />
      <Chip label="완료" size="small" variant="outlined" sx={{ height: 20, fontSize: '0.65rem', fontWeight: 'bold' }} />
    </ListItem>
  );
}