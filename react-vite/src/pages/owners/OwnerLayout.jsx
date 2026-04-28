import { useState, useEffect } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import {
  AppBar,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  IconButton,
  MenuItem,
  Select,
  Toolbar,
  Tooltip,
  Typography,
} from "@mui/material";
import { useAuth } from "../../context/AuthContext";
import { useNotification } from "../../context/NotificationContext";
import { getOwnerGyms, getOwnerGym, getDraftOwnerGym, cancelOwnerGymDraft } from "../../api/owner";

import AddIcon from "@mui/icons-material/Add";
import LogoutIcon from "@mui/icons-material/Logout";
import DashboardOutlinedIcon from "@mui/icons-material/DashboardOutlined";
import FitnessCenterOutlinedIcon from "@mui/icons-material/FitnessCenterOutlined";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import StorefrontIcon from "@mui/icons-material/Storefront";
import EditNoteIcon from "@mui/icons-material/EditNote";
<<<<<<< HEAD
import PeopleOutlineIcon from "@mui/icons-material/PeopleOutline";
=======
>>>>>>> origin/main

const SIDEBAR_W = 220;

function NavItem({ icon, label, active, disabled, onClick }) {
  return (
    <Box
      onClick={disabled ? undefined : onClick}
      sx={{
        display: "flex", alignItems: "center", gap: 1.5,
        px: 2, py: 1.2,
        borderRadius: 2, mx: 1, mb: 0.5,
        cursor: disabled ? "default" : "pointer",
        opacity: disabled ? 0.38 : 1,
        bgcolor: active ? "primary.main" : "transparent",
        color: active ? "#fff" : "text.primary",
        transition: "background-color 0.15s",
        "&:hover": !disabled && !active ? { bgcolor: "#f0f4ff" } : {},
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", color: active ? "#fff" : "primary.main", flexShrink: 0 }}>
        {icon}
      </Box>
      <Typography variant="body2" fontWeight={active ? "bold" : "normal"} color="inherit">
        {label}
      </Typography>
    </Box>
  );
}

export default function OwnerLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const { showNotification } = useNotification();

  const [gyms, setGyms] = useState([]);
  const [gymsLoading, setGymsLoading] = useState(true);
  const [selectedGymId, setSelectedGymId] = useState(null);

  const [draftCheckLoading, setDraftCheckLoading] = useState(false);
  const [draftGym, setDraftGym] = useState(null);
  const [draftDialogOpen, setDraftDialogOpen] = useState(false);

  /* URL에서 gymId 추출 */
  const urlMatch = location.pathname.match(/\/gyms\/(\d+)/);
  const urlGymId = urlMatch ? Number(urlMatch[1]) : null;

  useEffect(() => {
    getOwnerGyms()
      .then((list) => {
        setGyms(list ?? []);
        /* URL에 gymId 없을 때만 첫 번째 gym으로 초기화 */
        if (!urlGymId && list?.length) setSelectedGymId(list[0].id);
      })
      .catch(() => showNotification("헬스장 목록을 불러오지 못했습니다.", "error"))
      .finally(() => setGymsLoading(false));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  /* URL gymId 변경 시 드롭다운 동기화 */
  useEffect(() => {
    if (urlGymId) setSelectedGymId(urlGymId);
  }, [urlGymId]);

  const effectiveGymId = urlGymId ?? selectedGymId;

  /* 단일 gym 데이터 갱신 (occupancy 등 실시간 반영용) */
  const refreshGym = async (gymId) => {
    try {
      const updated = await getOwnerGym({ gymId });
      setGyms((prev) => prev.map((g) => (g.id === gymId ? updated : g)));
    } catch {}
  };

  /* 드롭다운 체육관 변경 */
  const handleGymChange = (newId) => {
    setSelectedGymId(newId);
    const p = location.pathname;
    if (p.includes("/equipments") || p.includes("/map")) navigate(`/gyms/${newId}/equipments`);
    else if (p.includes("/lockers")) navigate(`/gyms/${newId}/lockers`);
    else if (p.match(/\/gyms\/\d+$/)) navigate(`/gyms/${newId}`);
    /* 대시보드(/)면 selectedGymId만 업데이트하면 됨 */
  };

  /* 헬스장 등록 (draft 체크) */
  const handleGymRegister = async () => {
    setDraftCheckLoading(true);
    try {
      const draft = await getDraftOwnerGym();
      if (draft?.id) { setDraftGym(draft); setDraftDialogOpen(true); }
      else navigate("/gyms/register");
    } catch {
      navigate("/gyms/register");
    } finally {
      setDraftCheckLoading(false);
    }
  };

  const handleLoadDraft = () => {
    setDraftDialogOpen(false);
    navigate("/gyms/register", { state: { draftGym } });
  };

  const handleDiscardDraft = async () => {
    setDraftDialogOpen(false);
    try { await cancelOwnerGymDraft({ gymId: draftGym.id }); } catch {}
    navigate("/gyms/register");
  };

  /* 활성 메뉴 판별 */
  const p = location.pathname;
  const isDashboard  = p === "/dashboard";
  const isGymDetail  = /\/gyms\/\d+$/.test(p);
  const isEquipments = p.includes("/equipments") || p.includes("/map");
  const isLockers    = p.includes("/lockers");
<<<<<<< HEAD
  const isMembers    = p.includes("/members");
=======
>>>>>>> origin/main

  return (
    <Box sx={{ position: "fixed", inset: 0, display: "flex", flexDirection: "column", bgcolor: "#f5f7fa" }}>

      {/* ── 상단 AppBar ── */}
      <AppBar position="static" color="inherit" elevation={0}
        sx={{ borderBottom: "1px solid #e0e0e0", flexShrink: 0, zIndex: 10 }}>
        <Toolbar sx={{ gap: 1.5 }}>
          {/* 브랜드 */}
          <Box display="flex" alignItems="center" gap={0.8} sx={{ minWidth: 140 }}>
            <StorefrontIcon sx={{ color: "primary.main", fontSize: 22 }} />
            <Typography variant="subtitle1" fontWeight="bold" color="primary.main" noWrap>
              GymBaroFit
            </Typography>
          </Box>

          {/* 체육관 드롭다운 */}
          <FormControl size="small" sx={{ flex: 1, maxWidth: 360 }}>
            <Select
              value={effectiveGymId ?? ""}
              onChange={(e) => handleGymChange(e.target.value)}
              displayEmpty
              disabled={gymsLoading || gyms.length === 0}
              sx={{ borderRadius: 2, fontSize: "0.875rem", bgcolor: "#fff" }}
              renderValue={(val) => {
                if (!val) return <Typography color="text.disabled" variant="body2">체육관 없음</Typography>;
                const g = gyms.find((x) => x.id === val);
                return (
                  <Box display="flex" alignItems="center" gap={0.8}>
                    <StorefrontIcon sx={{ fontSize: 16, color: "primary.main" }} />
                    <Typography variant="body2" fontWeight="bold" noWrap>{g?.name ?? val}</Typography>
                  </Box>
                );
              }}
            >
              {gyms.length === 0 ? (
                <MenuItem disabled value="">등록된 헬스장 없음</MenuItem>
              ) : (
                gyms.map((g) => (
                  <MenuItem key={g.id} value={g.id}>
                    <Box display="flex" alignItems="center" gap={0.8}>
                      <StorefrontIcon sx={{ fontSize: 16, color: "text.secondary" }} />
                      <Typography variant="body2">{g.name}</Typography>
                    </Box>
                  </MenuItem>
                ))
              )}
            </Select>
          </FormControl>

          <Box flex={1} />

          {/* 헬스장 등록 */}
          <Button
            variant="contained" size="small"
            startIcon={draftCheckLoading ? <CircularProgress size={14} color="inherit" /> : <AddIcon />}
            onClick={handleGymRegister} disabled={draftCheckLoading}
            sx={{ borderRadius: 2, fontWeight: "bold", whiteSpace: "nowrap", flexShrink: 0 }}
          >
            헬스장 등록
          </Button>

          {/* 로그아웃 */}
          <Tooltip title="로그아웃">
            <IconButton size="small" onClick={() => { logout(); navigate("/login"); }}>
              <LogoutIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Toolbar>
      </AppBar>

      {/* ── 바디 ── */}
      <Box sx={{ flex: 1, minHeight: 0, display: "flex", overflow: "hidden" }}>

        {/* 좌측 사이드바 */}
        <Box
          sx={{
            width: SIDEBAR_W, flexShrink: 0,
            bgcolor: "#fff", borderRight: "1px solid #e0e0e0",
            pt: 2, pb: 2,
            display: "flex", flexDirection: "column",
            overflowY: "auto",
          }}
        >
          <Typography
            variant="caption" color="text.disabled" fontWeight="bold"
            sx={{ px: 3, mb: 1, letterSpacing: 0.5, textTransform: "uppercase" }}
          >
            관리 메뉴
          </Typography>

          <NavItem
            icon={<DashboardOutlinedIcon fontSize="small" />}
            label="대시보드"
            active={isDashboard}
            onClick={() => navigate("/dashboard")}
          />
          <NavItem
            icon={<EditNoteIcon fontSize="small" />}
            label="정보 수정"
            active={isGymDetail}
            disabled={!effectiveGymId}
            onClick={() => navigate(`/gyms/${effectiveGymId}`)}
          />
          <NavItem
            icon={<FitnessCenterOutlinedIcon fontSize="small" />}
            label="기구·맵 관리"
            active={isEquipments}
            disabled={!effectiveGymId}
            onClick={() => navigate(`/gyms/${effectiveGymId}/equipments`)}
          />
          <NavItem
            icon={<LockOutlinedIcon fontSize="small" />}
            label="락커 관리"
            active={isLockers}
            disabled={!effectiveGymId}
            onClick={() => navigate(`/gyms/${effectiveGymId}/lockers`)}
          />
<<<<<<< HEAD
          <NavItem
            icon={<PeopleOutlineIcon fontSize="small" />}
            label="회원 관리"
            active={isMembers}
            disabled={!effectiveGymId}
            onClick={() => navigate(`/gyms/${effectiveGymId}/members`)}
          />
=======
>>>>>>> origin/main

          <Box flex={1} />

          {user?.name && (
            <Box sx={{ px: 2, pt: 1 }}>
              <Divider sx={{ mb: 1.5 }} />
              <Typography variant="caption" color="text.disabled" display="block" noWrap>
                {user.name} 님
              </Typography>
            </Box>
          )}
        </Box>

        {/* 콘텐츠 (Outlet) */}
        <Box sx={{ flex: 1, minWidth: 0, overflowY: "auto" }}>
          <Outlet context={{ gyms, selectedGymId: effectiveGymId, gymsLoading, handleGymRegister, refreshGym }} />
        </Box>
      </Box>

      {/* Draft 복구 다이얼로그 */}
      <Dialog open={draftDialogOpen} onClose={() => setDraftDialogOpen(false)}>
        <DialogTitle sx={{ fontWeight: "bold" }}>이전 등록 내역 발견</DialogTitle>
        <DialogContent>
          <Typography>이전 등록 상황을 불러올까요?</Typography>
          {draftGym?.name && (
            <Typography variant="body2" color="text.secondary" mt={1}>
              헬스장명: {draftGym.name}
            </Typography>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleDiscardDraft} variant="outlined">아니오</Button>
          <Button onClick={handleLoadDraft} variant="contained">예</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
