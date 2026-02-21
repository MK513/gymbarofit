import React, { useEffect, useState } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Paper,
  Button,
  IconButton,
  Chip,
  CircularProgress,
  Divider,
  Stack,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useNotification } from "../../context/NotificationContext";
import { getOwnerGyms } from "../../api/owner";

import AddIcon from "@mui/icons-material/Add";
import LogoutIcon from "@mui/icons-material/Logout";
import FitnessCenterIcon from "@mui/icons-material/FitnessCenter";
import LockIcon from "@mui/icons-material/Lock";
import PeopleIcon from "@mui/icons-material/People";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import StorefrontIcon from "@mui/icons-material/Storefront";
import AccessTimeIcon from "@mui/icons-material/AccessTime";

/* 혼잡도 → 색상 / 레이블 */
const crowdMeta = {
  VERY_COMFORTABLE: { label: "여유", color: "#2e7d32", bg: "#e8f5e9" },
  COMFORTABLE:      { label: "쾌적", color: "#388e3c", bg: "#f1f8e9" },
  NORMAL:           { label: "보통", color: "#f57c00", bg: "#fff3e0" },
  CROWDED:          { label: "혼잡", color: "#d32f2f", bg: "#ffebee" },
  VERY_CROWDED:     { label: "매우 혼잡", color: "#b71c1c", bg: "#ffcdd2" },
};

function GymCard({ gym, onDetail }) {
  const crowd = crowdMeta[gym.crowdLevel] ?? crowdMeta.NORMAL;
  const lockerPct = gym.totalLockers > 0
    ? Math.round((gym.rentedLockers / gym.totalLockers) * 100)
    : 0;
  const equipPct = gym.totalEquipments > 0
    ? Math.round((gym.activeEquipments / gym.totalEquipments) * 100)
    : 0;

  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: 3,
        border: "1px solid #eef2f6",
        overflow: "hidden",
      }}
    >
      {/* 헤더 */}
      <Box
        sx={{
          background: "linear-gradient(135deg, #1565c0 0%, #42a5f5 100%)",
          px: 2,
          py: 1.5,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Box display="flex" alignItems="center" gap={1}>
          <StorefrontIcon sx={{ color: "#fff", fontSize: 18 }} />
          <Typography variant="body2" fontWeight="bold" color="#fff">
            {gym.name}
          </Typography>
        </Box>
        <Chip
          label={crowd.label}
          size="small"
          sx={{
            bgcolor: crowd.bg,
            color: crowd.color,
            fontWeight: "bold",
            fontSize: "0.7rem",
            height: 22,
          }}
        />
      </Box>

      {/* 본문 */}
      <Box px={2} py={1.5}>
        {/* 주소 + 운영시간 */}
        <Typography variant="caption" color="text.secondary" display="block" mb={0.5}>
          {gym.address}
        </Typography>
        <Box display="flex" alignItems="center" gap={0.5} mb={1.5}>
          <AccessTimeIcon sx={{ fontSize: 13, color: "text.disabled" }} />
          <Typography variant="caption" color="text.disabled">
            {(() => {
              const days = ["SUNDAY","MONDAY","TUESDAY","WEDNESDAY","THURSDAY","FRIDAY","SATURDAY"];
              const today = days[new Date().getDay()];
              const h = gym.operatingHours?.find((x) => x.dayOfWeek === today);
              if (!h) return "운영시간 미등록";
              if (h.closed) return "오늘 휴무";
              return `${h.openAt} ~ ${h.closeAt}`;
            })()}
          </Typography>
        </Box>

        {/* 통계 3열 */}
        <Box
          display="grid"
          gridTemplateColumns="1fr 1fr 1fr"
          gap={1}
          mb={1.5}
        >
          {/* 현재 인원 */}
          <StatBox
            icon={<PeopleIcon sx={{ fontSize: 16, color: "#1565c0" }} />}
            label="현재 인원"
            value={`${gym.currentOccupancy} / ${gym.maxCapacity}`}
            sub={`정원의 ${gym.maxCapacity > 0 ? Math.round((gym.currentOccupancy / gym.maxCapacity) * 100) : 0}%`}
          />
          {/* 기구 */}
          <StatBox
            icon={<FitnessCenterIcon sx={{ fontSize: 16, color: "#f57c00" }} />}
            label="기구 사용"
            value={`${gym.activeEquipments} / ${gym.totalEquipments}`}
            sub={`${equipPct}% 사용 중`}
          />
          {/* 보관함 */}
          <StatBox
            icon={<LockIcon sx={{ fontSize: 16, color: "#8e24aa" }} />}
            label="보관함"
            value={`${gym.rentedLockers} / ${gym.totalLockers}`}
            sub={`${lockerPct}% 임대 중`}
          />
        </Box>

        <Divider sx={{ mb: 1.5 }} />

        <Button
          fullWidth
          variant="outlined"
          size="small"
          endIcon={<ChevronRightIcon />}
          onClick={() => onDetail(gym.id)}
          sx={{ borderRadius: 2, fontWeight: "bold", fontSize: "0.8rem" }}
        >
          상세 관리
        </Button>
      </Box>
    </Paper>
  );
}

function StatBox({ icon, label, value, sub }) {
  return (
    <Box
      sx={{
        bgcolor: "#f8f9fa",
        borderRadius: 2,
        p: 1,
        display: "flex",
        flexDirection: "column",
        gap: 0.3,
      }}
    >
      <Box display="flex" alignItems="center" gap={0.5}>
        {icon}
        <Typography variant="caption" color="text.secondary" lineHeight={1.2}>
          {label}
        </Typography>
      </Box>
      <Typography variant="body2" fontWeight="bold" fontSize="0.8rem">
        {value}
      </Typography>
      <Typography variant="caption" color="text.disabled" fontSize="0.65rem">
        {sub}
      </Typography>
    </Box>
  );
}

/* 메인 페이지 */
export default function OwnerDashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { showNotification } = useNotification();

  const [gyms, setGyms] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getOwnerGyms()
      .then(setGyms)
      .catch(() => showNotification("헬스장 목록을 불러오지 못했습니다.", "error"))
      .finally(() => setLoading(false));
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <Box
      sx={{
        position: "fixed",
        inset: 0,
        display: "flex",
        flexDirection: "column",
        bgcolor: "#f5f7fa",
        overflow: "hidden",
      }}
    >
      {/* 헤더 */}
      <AppBar position="static" color="inherit" elevation={0} sx={{ borderBottom: "1px solid #e0e0e0", flexShrink: 0 }}>
        <Toolbar>
          <StorefrontIcon sx={{ mr: 1, color: "primary.main" }} />
          <Typography variant="h6" fontWeight="bold" sx={{ flexGrow: 1 }}>
            {user?.name ?? "기업 회원"} 대시보드
          </Typography>
          <IconButton onClick={handleLogout} size="small" title="로그아웃">
            <LogoutIcon fontSize="small" />
          </IconButton>
        </Toolbar>
      </AppBar>

      {/* 본문 스크롤 영역 */}
      <Box
        sx={{
          flex: 1,
          minHeight: 0,
          overflowY: "auto",
          px: 2,
          py: 2,
          maxWidth: 640,
          width: "100%",
          mx: "auto",
        }}
      >
        {/* 상단 요약 */}
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
          <Typography variant="subtitle1" fontWeight="bold" color="text.secondary">
            등록된 헬스장 {gyms.length}곳
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            size="small"
            onClick={() => navigate("/owners/gyms/register")}
            sx={{ borderRadius: 2, fontWeight: "bold" }}
          >
            헬스장 등록
          </Button>
        </Box>

        {/* 목록 */}
        {loading ? (
          <Box display="flex" justifyContent="center" mt={8}>
            <CircularProgress />
          </Box>
        ) : gyms.length === 0 ? (
          <Paper
            elevation={0}
            sx={{
              borderRadius: 3,
              border: "1px solid #eef2f6",
              p: 6,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              color: "text.secondary",
            }}
          >
            <StorefrontIcon sx={{ fontSize: 48, mb: 1.5, opacity: 0.25 }} />
            <Typography variant="body2">등록된 헬스장이 없습니다.</Typography>
            <Typography variant="caption" mt={0.5}>
              우측 상단 버튼으로 헬스장을 등록해보세요.
            </Typography>
          </Paper>
        ) : (
          <Stack spacing={2}>
            {gyms.map((gym) => (
              <GymCard
                key={gym.id}
                gym={gym}
                onDetail={(id) => navigate(`/owners/gyms/${id}`)}
              />
            ))}
          </Stack>
        )}
      </Box>
    </Box>
  );
}
