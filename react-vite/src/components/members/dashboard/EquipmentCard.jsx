<<<<<<< HEAD
import { useState, useEffect } from "react";
import { Paper, Box, Typography, Button, Chip, Stack, IconButton, LinearProgress } from "@mui/material";
=======
import { Paper, Box, Typography, Button, Chip, Stack, IconButton } from "@mui/material";
>>>>>>> origin/main
import FitnessCenterIcon from "@mui/icons-material/FitnessCenter";
import EventAvailableIcon from "@mui/icons-material/EventAvailable";
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import MapIcon from "@mui/icons-material/Map";
<<<<<<< HEAD
import TimerIcon from "@mui/icons-material/Timer";

const USAGE_LIMIT_MS = 20 * 60 * 1000;

function UsageTimer({ startAtMs }) {
  const [remaining, setRemaining] = useState(() => {
    if (!startAtMs) return USAGE_LIMIT_MS;
    return Math.max(0, USAGE_LIMIT_MS - (Date.now() - startAtMs));
  });

  useEffect(() => {
    if (!startAtMs) return;
    const tick = () => {
      setRemaining(Math.max(0, USAGE_LIMIT_MS - (Date.now() - startAtMs)));
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [startAtMs]);

  const totalSec = Math.ceil(remaining / 1000);
  const minutes = Math.floor(totalSec / 60);
  const seconds = totalSec % 60;
  const timeStr = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  const progress = (remaining / USAGE_LIMIT_MS) * 100;
  const isUrgent = remaining <= 5 * 60 * 1000;

  return (
    <Box sx={{ mt: 0.5, mb: 1.2 }}>
      <Box display="flex" alignItems="center" gap={0.5} mb={0.6}>
        <TimerIcon sx={{ fontSize: 13, color: isUrgent ? "error.main" : "warning.main" }} />
        <Typography
          variant="h6"
          fontWeight="900"
          lineHeight={1}
          color={isUrgent ? "error.main" : "warning.dark"}
          sx={{ fontVariantNumeric: "tabular-nums", letterSpacing: 1 }}
        >
          {timeStr}
        </Typography>
        <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ ml: 0.3 }}>
          남음
        </Typography>
      </Box>
      <LinearProgress
        variant="determinate"
        value={progress}
        sx={{
          height: 5,
          borderRadius: 3,
          bgcolor: "#f5f5f5",
          "& .MuiLinearProgress-bar": {
            bgcolor: isUrgent ? "error.main" : "warning.main",
            borderRadius: 3,
          },
        }}
      />
    </Box>
  );
}
=======
>>>>>>> origin/main

const SECTION_STYLES = {
  usage:   { bg: '#fff8e1', border: '#ffe0b2', textColor: 'warning.dark',   chip: 'warning' },
  waiting: { bg: '#f5f5f5', border: '#e8e8e8', textColor: 'text.secondary', chip: 'default' },
  called:  { bg: '#ffebee', border: '#ffcdd2', textColor: 'error.main',     chip: 'error'   },
};

function EquipmentSection({ data, titleIcon, titleText, statusLabel, variant, actionLabel, onAction, onStartAction, onMapView }) {
  const s = SECTION_STYLES[variant];

  return (
    <Paper elevation={0} sx={{ p: 2, borderRadius: 3, bgcolor: s.bg, border: '1px solid', borderColor: s.border }}>
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={1.5}>
        <Box display="flex" alignItems="center" gap={0.8} sx={{ color: s.textColor }}>
          {titleIcon}
          <Typography variant="caption" fontWeight="800" color={s.textColor}>{titleText}</Typography>
        </Box>
        <Box display="flex" alignItems="center" gap={0.5}>
          <Chip label={statusLabel} color={s.chip} size="small" sx={{ fontWeight: 'bold', height: 20, fontSize: '0.7rem' }} />
          {onMapView && (
            <IconButton
              size="small"
              onClick={onMapView}
              sx={{ p: 0.5, color: 'text.disabled', '&:hover': { color: 'primary.main' } }}
              title="헬스장 맵에서 위치 확인"
            >
              <MapIcon sx={{ fontSize: 16 }} />
            </IconButton>
          )}
        </Box>
      </Box>

      <Stack direction="row" spacing={2} alignItems="center">
        {data.imageUrl && (
          <Box
            component="img"
            src={data.imageUrl}
            alt={data.name}
            sx={{
              width: 56, height: 56, objectFit: 'contain',
              bgcolor: 'white', borderRadius: 2, p: 0.5,
              border: '1px solid rgba(0,0,0,0.05)', flexShrink: 0,
            }}
          />
        )}
        <Box flexGrow={1}>
          <Typography variant="subtitle2" fontWeight="800" color="text.primary" mb={0.3}>
            {data.name}
          </Typography>
<<<<<<< HEAD
          {variant === 'usage' && data.startAtMs ? (
            <UsageTimer startAtMs={data.startAtMs} />
          ) : (
            <Box display="flex" alignItems="center" mb={1.2}>
              <AccessTimeIcon sx={{ fontSize: 13, mr: 0.4, color: variant === 'called' ? 'error.main' : 'text.disabled' }} />
              <Typography variant="caption" fontWeight="700" color={variant === 'called' ? 'error.main' : 'text.secondary'}>
                {data.time}
              </Typography>
            </Box>
          )}
=======
          <Box display="flex" alignItems="center" mb={1.2}>
            <AccessTimeIcon sx={{ fontSize: 13, mr: 0.4, color: variant === 'called' ? 'error.main' : 'text.disabled' }} />
            <Typography variant="caption" fontWeight="700" color={variant === 'called' ? 'error.main' : 'text.secondary'}>
              {data.time}
            </Typography>
          </Box>
>>>>>>> origin/main

          {variant === 'called' ? (
            <Stack direction="row" spacing={1}>
              <Button
                size="small" fullWidth variant="contained" color="error" disableElevation
                onClick={onStartAction}
                sx={{ borderRadius: 2, fontSize: '0.78rem', fontWeight: 'bold', py: 0.7 }}
              >
                사용 시작
              </Button>
              <Button
                size="small" fullWidth variant="outlined" color="error"
                onClick={onAction}
                sx={{ borderRadius: 2, fontSize: '0.78rem', fontWeight: 'bold', py: 0.7, bgcolor: 'white', '&:hover': { bgcolor: '#ffebee' } }}
              >
                취소
              </Button>
            </Stack>
          ) : (
            <Button
              size="small" fullWidth disableElevation
              onClick={onAction}
              sx={{
                bgcolor: 'white',
                color: variant === 'usage' ? 'warning.dark' : 'text.primary',
                border: '1px solid',
                borderColor: variant === 'usage' ? 'warning.light' : 'grey.300',
                borderRadius: 2, py: 0.7, fontSize: '0.78rem', fontWeight: 'bold',
                '&:hover': { bgcolor: variant === 'usage' ? '#fff3e0' : '#f5f5f5' },
              }}
            >
              {actionLabel}
            </Button>
          )}
        </Box>
      </Stack>
    </Paper>
  );
}

export default function EquipmentCard({
  usageData,
  reservationData,
  onReservationClick,
  onEndUsageClick,
  onStartUsageClick,
  onCancelReservationClick,
  onMapViewClick,
}) {
  const isEmpty = !usageData && !reservationData;
  const isFullState = usageData && reservationData;

  return (
    <Paper elevation={0} sx={{ borderRadius: 4, border: '1px solid #fff3e0', overflow: 'hidden' }}>
      {/* 헤더 */}
      <Box
        sx={{
          px: 3, py: 1.5,
          background: 'linear-gradient(135deg, #f57c00 0%, #ffb74d 100%)',
          display: 'flex', alignItems: 'center',
        }}
      >
        <FitnessCenterIcon sx={{ color: 'white', fontSize: 18, mr: 1 }} />
        <Typography variant="body2" fontWeight="800" color="white">운동 기구</Typography>
      </Box>

      {/* 콘텐츠 */}
      <Box sx={{ p: 3 }}>
        <Stack spacing={2} mb={!isFullState ? 2.5 : 0}>
          {usageData && (
            <EquipmentSection
              data={usageData}
              titleIcon={<FitnessCenterIcon sx={{ fontSize: 16 }} />}
              titleText="현재 이용중"
              statusLabel="이용중"
              variant="usage"
              actionLabel="사용 종료"
              onAction={onEndUsageClick}
              onMapView={onMapViewClick ? () => onMapViewClick(usageData.eid) : undefined}
            />
          )}
          {reservationData && (
            <EquipmentSection
              data={reservationData}
              titleIcon={
                reservationData.status === 'CALLED'
                  ? <NotificationsActiveIcon sx={{ fontSize: 16 }} />
                  : <EventAvailableIcon sx={{ fontSize: 16 }} />
              }
              titleText={reservationData.status === 'CALLED' ? "입장 안내" : "예약 대기"}
              statusLabel={reservationData.status === 'CALLED' ? "입장대기" : "예약중"}
              variant={reservationData.status === 'CALLED' ? 'called' : 'waiting'}
              actionLabel="대기 취소"
              onAction={onCancelReservationClick}
              onStartAction={onStartUsageClick}
              onMapView={onMapViewClick ? () => onMapViewClick(reservationData.eid) : undefined}
            />
          )}
          {isEmpty && (
            <Box sx={{ py: 3, textAlign: 'center' }}>
              <FitnessCenterIcon sx={{ fontSize: 44, color: 'text.disabled', mb: 1 }} />
              <Typography variant="body2" color="text.secondary" fontWeight="600" gutterBottom>
                이용 내역이 없습니다.
              </Typography>
              <Typography variant="caption" color="text.disabled">
                운동기구를 예약하고 바로 이용해보세요!
              </Typography>
            </Box>
          )}
        </Stack>

        {!isFullState && (
          <Button
            fullWidth variant="contained" color="warning" size="large"
            onClick={onReservationClick} disableElevation
            sx={{ py: 1.4, borderRadius: 2.5, fontWeight: 'bold', color: 'white' }}
          >
            기구 예약하러 가기
          </Button>
        )}
      </Box>
    </Paper>
  );
}
