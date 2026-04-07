import React from "react";
import { Paper, Box, Avatar, Typography, Button } from "@mui/material";
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import LogoutIcon from '@mui/icons-material/Logout';

export default function AttendanceCard({ attendance, onCheckIn, onCheckOut }) {
  const { isCheckedIn, checkedToday, streak } = attendance;

  let headerText;
  if (isCheckedIn) headerText = "현재 입장 중";
  else if (checkedToday) headerText = "오늘 출석 완료!";
  else headerText = streak > 0 ? `${streak}일 연속 🔥` : "오늘 출석하세요!";

  let subText;
  if (isCheckedIn) subText = "운동 마치면 체크아웃 해주세요.";
  else if (checkedToday) subText = "내일도 화이팅!";
  else subText = "오늘도 출석 갱신!";

  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        borderRadius: 3,
        bgcolor: 'white',
        border: '1px solid #eef2f6',
      }}
    >
      <Box display="flex" alignItems="center">
        <Avatar sx={{ bgcolor: '#ede7f6', width: 56, height: 56, mr: 2 }}>
          <LocalFireDepartmentIcon sx={{ color: '#764ba2', fontSize: 32 }} />
        </Avatar>
        <Box sx={{ flexGrow: 1 }}>
          <Typography variant="h5" fontWeight="800" sx={{ mb: 0.5, color: '#333' }}>
            {headerText}
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            {subText}
          </Typography>
        </Box>
        {isCheckedIn ? (
          <Button
            variant="outlined"
            onClick={onCheckOut}
            startIcon={<LogoutIcon />}
            sx={{
              fontWeight: 'bold',
              py: 1.2,
              px: 2,
              whiteSpace: 'nowrap',
              borderColor: '#764ba2',
              color: '#764ba2',
              '&:hover': { bgcolor: '#f3e5f5', borderColor: '#764ba2' }
            }}
          >
            나가기
          </Button>
        ) : (
          <Button
            variant="contained"
            onClick={onCheckIn}
            startIcon={<LocalFireDepartmentIcon />}
            sx={{
              bgcolor: '#764ba2',
              color: 'white',
              fontWeight: 'bold',
              py: 1.2,
              px: 2,
              whiteSpace: 'nowrap',
              '&:hover': { bgcolor: '#5e3a8a' }
            }}
          >
            이용 시작
          </Button>
        )}
      </Box>
    </Paper>
  );
}