import React from "react";
import { Paper, Box, Avatar, Typography, Button } from "@mui/material";
import EventAvailableIcon from "@mui/icons-material/EventAvailable";

export default function MachineReservationCard({ equipStatus, onReservationClick }) {
  return (
    <Paper elevation={0} sx={{ p: 3, borderRadius: 4, border: '1px solid #eef2f6' }}>
      <Box display="flex" alignItems="center" mb={2}>
        <Avatar sx={{ bgcolor: "warning.light", color: "warning.main", mr: 2 }}>
          <EventAvailableIcon />
        </Avatar>
        <Typography variant="h6" fontWeight="bold">
          운동기구 예약
        </Typography>
      </Box>

      <Box sx={{ bgcolor: "#fff8e1", p: 3, borderRadius: 3, mb: 3, textAlign: 'center', border: '1px dashed #ffb74d' }}>
        {equipStatus.use ? (
          <>
            <Typography variant="h5" fontWeight="bold" color="warning.main">
              {equipStatus.name}
            </Typography>
            <Typography variant="body2">{equipStatus.time}</Typography>
          </>
        ) : (
          <Box py={1}>
            <Typography variant="body1" color="text.secondary" fontWeight="500">
              예약된 기구가 없습니다.
            </Typography>
            <Typography variant="caption" color="text.disabled">
              붐비는 시간대라면 미리 예약해보세요!
            </Typography>
          </Box>
        )}
      </Box>

      <Button 
        fullWidth 
        variant="contained" 
        color="warning" 
        size="large"
        onClick={onReservationClick}
        sx={{ color: 'white', fontWeight: 'bold', borderRadius: 2, py: 1.5, boxShadow: 'none' }}
      >
        기구 예약하기
      </Button>
    </Paper>
  );
}