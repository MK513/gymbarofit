import React from "react";
import { Paper, Box, Avatar, Typography, Stack, LinearProgress, List, ListItem, ListItemIcon, ListItemText, Chip, Button } from "@mui/material";
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import FitnessCenterIcon from "@mui/icons-material/FitnessCenter";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";

export default function StatsCard({ weeklyProgress }) {
  // 실제 앱에서는 props로 데이터를 받아올 수 있습니다. 여기선 UI 데모용 정적 데이터 유지.
  return (
    <Paper elevation={0} sx={{ p: 4, borderRadius: 4, border: '1px solid #eef2f6', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
      <Box display="flex" alignItems="center" mb={3}>
        <Avatar sx={{ bgcolor: "primary.main", mr: 2, boxShadow: 2 }}>
          <EmojiEventsIcon />
        </Avatar>
        <Box>
          <Typography variant="h6" fontWeight="bold">이번 주 운동 목표</Typography>
          <Typography variant="body2" color="text.secondary">목표 달성까지 30% 남았습니다.</Typography>
        </Box>
      </Box>

      <Stack spacing={4}>
        <Box>
          <Box sx={{ mb: 4, p: 2, bgcolor: '#f8f9fa', borderRadius: 3}}>
            <Box display="flex" justifyContent="space-between" mb={1} alignItems="flex-end">
              <Typography variant="subtitle2" fontWeight="bold" color="text.secondary">주간 달성률</Typography>
              <Typography variant="h5" color="primary" fontWeight="800">{weeklyProgress}%</Typography>
            </Box>
            <LinearProgress 
              variant="determinate" 
              value={weeklyProgress} 
              sx={{ height: 10, borderRadius: 5, bgcolor: "#e0e0e0", '& .MuiLinearProgress-bar': { borderRadius: 5 } }} 
            />
          </Box>
          
          <Stack direction="row" spacing={2}>
            <StatBox icon={<CalendarTodayIcon color="primary" sx={{ mb: 1, fontSize: 28 }} />} value="3일" label="출석" bgColor="#e3f2fd" />
            <StatBox icon={<AccessTimeIcon color="warning" sx={{ mb: 1, fontSize: 28 }} />} value="240" label="분" bgColor="#fff3e0" />
            <StatBox icon={<LocalFireDepartmentIcon color="error" sx={{ mb: 1, fontSize: 28 }} />} value="1.2k" label="kcal" bgColor="#fbe9e7" />
          </Stack>
        </Box>

        <Box>
           <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
             <Typography variant="subtitle1" fontWeight="bold">최근 운동 기록</Typography>
             <Button size="small" sx={{ fontWeight: 'bold' }}>더보기</Button>
           </Box>
           <List disablePadding>
              <RecentActivityItem title="상체 근력 운동" date="2024-01-05 · 60분" icon={<FitnessCenterIcon fontSize="small" />} color="#3f51b5" bg="#e8eaf6" type="primary" />
              <RecentActivityItem title="유산소 러닝" date="2024-01-03 · 40분" icon={<TrendingUpIcon fontSize="small" />} color="#009688" bg="#e0f2f1" type="success" />
           </List>
        </Box>
      </Stack>
    </Paper>
  );
}

// 내부용 작은 컴포넌트들
function StatBox({ icon, value, label, bgColor }) {
  return (
    <Box sx={{ flex: 1, p: 2, borderRadius: 3, bgcolor: bgColor, textAlign: 'center' }}>
      {icon}
      <Typography variant="h5" fontWeight="800" color="text.primary">{value}</Typography>
      <Typography variant="caption" color="text.secondary" fontWeight="bold">{label}</Typography>
    </Box>
  );
}

function RecentActivityItem({ title, date, icon, color, bg, type }) {
  return (
    <ListItem sx={{ mb: 1.5, bgcolor: 'white', borderRadius: 2, border: '1px solid #f0f0f0', boxShadow: '0 2px 4px rgba(0,0,0,0.03)' }}>
      <ListItemIcon>
        <Avatar sx={{ bgcolor: bg, color: color, width: 36, height: 36 }}>{icon}</Avatar>
      </ListItemIcon>
      <ListItemText primary={<Typography variant="subtitle2" fontWeight="bold">{title}</Typography>} secondary={date} />
      <Chip label="완료" color={type} size="small" sx={{ fontWeight: 'bold', borderRadius: 1 }} />
    </ListItem>
  );
}