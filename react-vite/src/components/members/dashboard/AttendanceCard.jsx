import React from "react";
import { Paper, Stack, Box, Avatar, Typography, Button } from "@mui/material";
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import QrCodeIcon from '@mui/icons-material/QrCode';

export default function AttendanceCard({ attendance, onCheckIn, onOpenQr }) {
  return (
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
      <Stack spacing={2}>
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

        <Stack direction="row" spacing={1.5} sx={{ width: '100%' }}>
          <Button 
            fullWidth
            variant="contained" 
            onClick={onCheckIn}
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
            onClick={onOpenQr}
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
  );
}