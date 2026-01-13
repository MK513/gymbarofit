import React from "react";
import { Paper, Box, Avatar, Typography, Chip, Stack, Button } from "@mui/material";
import LockIcon from "@mui/icons-material/Lock";
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import { Link } from "react-router-dom";

export default function LockerCard({ lockerStatus, onRefundClick, onNewReservation }) {
  return (
    <Paper elevation={0} sx={{ p: 3, borderRadius: 4, border: '1px solid #eef2f6' }}>
      <Box display="flex" alignItems="center" mb={2} justifyContent="space-between">
        <Box display="flex" alignItems="center">
          <Avatar sx={{ bgcolor: "secondary.light", color: "secondary.main", mr: 2 }}>
            <LockIcon />
          </Avatar>
          <Typography variant="h6" fontWeight="bold">개인 보관함</Typography>
        </Box>
        {lockerStatus.use && (
          <Chip label="이용중" color="secondary" size="small" sx={{ fontWeight: 'bold' }} />
        )}
      </Box>
      
      <Box sx={{ bgcolor: "#f3e5f5", p: 3, borderRadius: 3, mb: 3, textAlign: 'center', border: '1px dashed #ce93d8' }}>
        {lockerStatus.use ? (
          <>
            <Typography variant="body2" color="text.secondary" gutterBottom>{lockerStatus.zoneName}</Typography>
            <Typography variant="h4" fontWeight="800" color="secondary.main" sx={{ mb: 1 }}>
              No. {lockerStatus.number}
            </Typography>
            <Typography variant="subtitle2" color="text.secondary" sx={{ fontWeight: 'bold' }}>
              ~ {lockerStatus.expiry} 까지
            </Typography>
          </>
        ) : (
          <Box py={1}>
            <Typography variant="body1" color="text.secondary" fontWeight="500">이용 중인 보관함이 없습니다.</Typography>
            <Typography variant="caption" color="text.disabled">무거운 짐은 보관함에 맡기세요!</Typography>
          </Box>
        )}
      </Box>

      <Stack direction="row" spacing={1.5}>
        {lockerStatus.use ? (
          <>
            <Button 
              fullWidth 
              variant="outlined" 
              color="error" 
              onClick={onRefundClick}
              sx={{ py: 1.5, borderRadius: 2, fontWeight: 'bold', borderWidth: '2px', '&:hover': { borderWidth: '2px', bgcolor: '#ffebee' }}}
            >
              환불 신청
            </Button>
            <Button 
              fullWidth 
              variant="contained" 
              color="secondary" 
              component={Link} 
              to={`/lockers/extend/${lockerStatus.id}`} 
              disableElevation
              sx={{ py: 1.5, borderRadius: 2, fontWeight: 'bold' }}
            >
              기간 연장
            </Button>
          </>
        ) : (
          <Button 
            fullWidth 
            variant="contained" 
            color="secondary" 
            onClick={onNewReservation} 
            disableElevation 
            startIcon={<AddCircleOutlineIcon />}
            sx={{ py: 1.5, borderRadius: 2, fontWeight: 'bold' }}
          >
            보관함 신규 대여
          </Button>
        )}
      </Stack>
    </Paper>
  );
}