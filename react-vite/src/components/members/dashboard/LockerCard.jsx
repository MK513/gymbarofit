import { Paper, Box, Typography, Stack, Button } from "@mui/material";
import LockIcon from "@mui/icons-material/Lock";
import LockOpenIcon from "@mui/icons-material/LockOpen";
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import { Link } from "react-router-dom";

export default function LockerCard({ lockerStatus, onRefundClick, onNewReservation }) {
  return (
    <Paper elevation={0} sx={{ borderRadius: 4, border: '1px solid #f0e6ff', overflow: 'hidden' }}>
      {/* 헤더 */}
      <Box
        sx={{
          px: 3, py: 1.5,
          background: 'linear-gradient(135deg, #8e24aa 0%, #ce93d8 100%)',
          display: 'flex', alignItems: 'center',
        }}
      >
        {lockerStatus.use
          ? <LockIcon sx={{ color: 'white', fontSize: 18, mr: 1 }} />
          : <LockOpenIcon sx={{ color: 'white', fontSize: 18, mr: 1 }} />
        }
        <Typography variant="body2" fontWeight="800" color="white">개인 보관함</Typography>
      </Box>

      {/* 콘텐츠 */}
      <Box sx={{ p: 3 }}>
        {lockerStatus.use ? (
          <>
            <Box sx={{ textAlign: 'center', py: 2, mb: 2.5, bgcolor: '#faf5ff', borderRadius: 3, border: '1px solid #ede7f6' }}>
              <Typography variant="caption" color="text.secondary" fontWeight="600">
                {lockerStatus.zoneName}
              </Typography>
              <Typography variant="h3" fontWeight="900" color="secondary.main" sx={{ lineHeight: 1.2, my: 0.5 }}>
                No. {lockerStatus.number}
              </Typography>
              <Box display="flex" alignItems="center" justifyContent="center" gap={0.5} mt={0.5}>
                <CalendarTodayIcon sx={{ fontSize: 13, color: 'text.disabled' }} />
                <Typography variant="caption" color="text.secondary" fontWeight="700">
                  {lockerStatus.expiry} 까지
                </Typography>
              </Box>
            </Box>
            <Stack direction="row" spacing={1.5}>
              <Button
                fullWidth variant="outlined" color="error"
                onClick={onRefundClick}
                sx={{ py: 1.4, borderRadius: 2.5, fontWeight: 'bold', '&:hover': { bgcolor: '#ffebee' } }}
              >
                환불 신청
              </Button>
              <Button
                fullWidth variant="contained" color="secondary"
                component={Link} to={`/lockers/extend/${lockerStatus.id}`}
                disableElevation
                sx={{ py: 1.4, borderRadius: 2.5, fontWeight: 'bold' }}
              >
                기간 연장
              </Button>
            </Stack>
          </>
        ) : (
          <>
            <Box sx={{ py: 3, textAlign: 'center' }}>
              <LockOpenIcon sx={{ fontSize: 44, color: 'text.disabled', mb: 1 }} />
              <Typography variant="body2" color="text.secondary" fontWeight="600" gutterBottom>
                이용 중인 보관함이 없습니다.
              </Typography>
              <Typography variant="caption" color="text.disabled">
                무거운 짐은 보관함에 맡기세요!
              </Typography>
            </Box>
            <Button
              fullWidth variant="contained" color="secondary"
              onClick={onNewReservation} disableElevation
              startIcon={<AddCircleOutlineIcon />}
              sx={{ py: 1.4, borderRadius: 2.5, fontWeight: 'bold' }}
            >
              보관함 신규 대여
            </Button>
          </>
        )}
      </Box>
    </Paper>
  );
}
