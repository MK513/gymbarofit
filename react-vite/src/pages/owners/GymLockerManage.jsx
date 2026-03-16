import { useState, useEffect } from "react";
import {
  Box,
  Button,
  CircularProgress,
  Collapse,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControlLabel,
  IconButton,
  Paper,
  Radio,
  RadioGroup,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography,
} from "@mui/material";
import { useParams } from "react-router-dom";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import LockIcon from "@mui/icons-material/Lock";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import { useNotification } from "../../context/NotificationContext";
import {
  getOwnerGymLockerZones,
  updateOwnerGymLockerZone,
  deleteOwnerGymLockerZone,
  createOwnerGymLockerZones,
} from "../../api/owner";
import { getLockerList, updateLockerStatus } from "../../api/locker";
import LockerStep from "../../components/owners/gymRegister/LockerStep";
import { LOCKER_SIZES } from "../../components/owners/gymRegister/constants";

const ITEM_STATUS_OPTIONS = [
  { value: "OK", label: "정상", color: "#43a047" },
  { value: "BROKEN", label: "고장", color: "#e53935" },
  { value: "MAINTENANCE", label: "점검 중", color: "#fb8c00" },
  { value: "RETIRED", label: "폐기", color: "#9e9e9e" },
];

function getLockerColor(itemStatus, usageStatus) {
  if (itemStatus === "BROKEN") return "#e53935";
  if (itemStatus === "MAINTENANCE") return "#fb8c00";
  if (itemStatus === "RETIRED") return "#9e9e9e";
  if (usageStatus === "ACTIVE" || usageStatus === "PENDING") return "#1565c0";
  return "#43a047";
}

export default function GymLockerManage() {
  const { gymId } = useParams();
  const { showNotification } = useNotification();

  const [zones, setZones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [saveLoading, setSaveLoading] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  /* 새 구역 추가 */
  const [showAddForm, setShowAddForm] = useState(false);
  const [newZones, setNewZones] = useState([]);
  const [addLoading, setAddLoading] = useState(false);

  /* 개별 락커 상태 관리 */
  const [expandedZones, setExpandedZones] = useState(new Set());
  const [zoneLockers, setZoneLockers] = useState({});
  const [lockerDialog, setLockerDialog] = useState({
    open: false,
    locker: null,
    status: "",
    loading: false,
  });

  const loadZones = () => {
    setLoading(true);
    getOwnerGymLockerZones({ gymId })
      .then(setZones)
      .catch(() => showNotification("락커 구역을 불러오지 못했습니다.", "error"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadZones();
  }, [gymId]); // eslint-disable-line react-hooks/exhaustive-deps

  /* ─── 수정 ─────────────────────────────── */
  const handleEditStart = (zone) => {
    setEditingId(zone.id);
    setEditForm({
      name: zone.name,
      size: zone.size,
      rowCount: String(zone.rowCount),
      columnCount: String(zone.columnCount),
    });
  };

  const handleEditCancel = () => {
    setEditingId(null);
    setEditForm({});
  };

  const handleEditSave = async (zoneId) => {
    setSaveLoading(true);
    try {
      const updated = await updateOwnerGymLockerZone(
        {
          name: editForm.name,
          size: editForm.size,
          rowCount: Number(editForm.rowCount),
          columnCount: Number(editForm.columnCount),
        },
        { gymId, zoneId }
      );
      setZones((p) => p.map((z) => (z.id === zoneId ? updated : z)));
      setEditingId(null);
      // 락커 수 변경 시 캐시 무효화
      setZoneLockers((p) => { const next = { ...p }; delete next[zoneId]; return next; });
      showNotification("구역이 수정되었습니다.", "success");
    } catch (e) {
      showNotification(e?.message || "수정에 실패했습니다.", "error");
    } finally {
      setSaveLoading(false);
    }
  };

  /* ─── 삭제 ─────────────────────────────── */
  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setSaveLoading(true);
    try {
      await deleteOwnerGymLockerZone({ gymId, zoneId: deleteTarget.id });
      setZones((p) => p.filter((z) => z.id !== deleteTarget.id));
      setZoneLockers((p) => { const next = { ...p }; delete next[deleteTarget.id]; return next; });
      showNotification("구역이 삭제되었습니다.", "success");
    } catch {
      showNotification("임대 중인 락커가 있어 삭제할 수 없습니다.", "error");
    } finally {
      setSaveLoading(false);
      setDeleteTarget(null);
    }
  };

  /* ─── 구역 추가 ─────────────────────────── */
  const handleNewZoneChange = (id, field, value) =>
    setNewZones((p) => p.map((z) => (z.id === id ? { ...z, [field]: value } : z)));

  const handleNewZoneAdd = () =>
    setNewZones((p) => [
      ...p,
      { id: Date.now(), name: "", size: "SMALL", rowCount: "", columnCount: "" },
    ]);

  const handleNewZoneRemove = (id) =>
    setNewZones((p) => p.filter((z) => z.id !== id));

  const handleAddSave = async () => {
    const valid = newZones.filter(
      (z) => z.name.trim() && Number(z.rowCount) > 0 && Number(z.columnCount) > 0
    );
    if (valid.length === 0) {
      showNotification("구역 이름과 행/열을 입력해주세요.", "error");
      return;
    }
    setAddLoading(true);
    try {
      for (const z of valid) {
        await createOwnerGymLockerZones(
          {
            name: z.name,
            size: z.size,
            rowCount: Number(z.rowCount),
            columnCount: Number(z.columnCount),
          },
          { gymId }
        );
      }
      setNewZones([]);
      setShowAddForm(false);
      loadZones();
      showNotification(`${valid.length}개 구역이 추가되었습니다.`, "success");
    } catch {
      showNotification("구역 추가에 실패했습니다.", "error");
    } finally {
      setAddLoading(false);
    }
  };

  /* ─── 락커 그리드 ────────────────────────── */
  const loadLockers = (zoneId) => {
    getLockerList({ zoneId })
      .then((data) => setZoneLockers((prev) => ({ ...prev, [zoneId]: data.lockers })))
      .catch(() => showNotification("락커 목록을 불러오지 못했습니다.", "error"));
  };

  const toggleExpand = (zoneId) => {
    setExpandedZones((prev) => {
      const next = new Set(prev);
      if (next.has(zoneId)) {
        next.delete(zoneId);
      } else {
        next.add(zoneId);
        if (!zoneLockers[zoneId]) loadLockers(zoneId);
      }
      return next;
    });
  };

  const handleLockerClick = (locker) => {
    setLockerDialog({ open: true, locker, status: locker.itemStatus, loading: false });
  };

  const handleStatusSave = async () => {
    const { locker, status } = lockerDialog;
    setLockerDialog((prev) => ({ ...prev, loading: true }));
    try {
      const updated = await updateLockerStatus({ status }, { lockerId: locker.id });
      const zoneId = Object.keys(zoneLockers).find((zid) =>
        zoneLockers[zid]?.some((l) => l.id === locker.id)
      );
      if (zoneId) {
        setZoneLockers((prev) => ({
          ...prev,
          [zoneId]: prev[zoneId].map((l) => (l.id === locker.id ? updated : l)),
        }));
      }
      setLockerDialog({ open: false, locker: null, status: "", loading: false });
      showNotification("락커 상태가 변경되었습니다.", "success");
    } catch {
      showNotification("상태 변경에 실패했습니다.", "error");
      setLockerDialog((prev) => ({ ...prev, loading: false }));
    }
  };

  return (
    <Box sx={{ px: 2, py: 2.5, maxWidth: 640, width: "100%", mx: "auto" }}>
      {/* 페이지 제목 */}
      <Box display="flex" alignItems="center" gap={1} mb={2.5}>
        <LockOutlinedIcon sx={{ color: "#8e24aa", fontSize: 22 }} />
        <Typography variant="h6" fontWeight="bold">락커 관리</Typography>
      </Box>
        {loading ? (
          <Box display="flex" justifyContent="center" mt={8}>
            <CircularProgress />
          </Box>
        ) : (
          <Stack spacing={2}>
            {/* 기존 구역 목록 */}
            {zones.length === 0 && !showAddForm && (
              <Paper
                elevation={0}
                sx={{
                  borderRadius: 3,
                  border: "1px solid #eef2f6",
                  p: 5,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  color: "text.secondary",
                }}
              >
                <LockOutlinedIcon sx={{ fontSize: 40, mb: 1, opacity: 0.25 }} />
                <Typography variant="body2">등록된 락커 구역이 없습니다.</Typography>
              </Paper>
            )}

            {zones.map((zone) => (
              <ZoneCard
                key={zone.id}
                zone={zone}
                isEditing={editingId === zone.id}
                editForm={editForm}
                saveLoading={saveLoading}
                expanded={expandedZones.has(zone.id)}
                lockers={zoneLockers[zone.id] ?? null}
                onToggleExpand={() => toggleExpand(zone.id)}
                onLockerClick={handleLockerClick}
                onEditStart={() => handleEditStart(zone)}
                onEditCancel={handleEditCancel}
                onEditFormChange={(field, value) =>
                  setEditForm((p) => ({ ...p, [field]: value }))
                }
                onEditSave={() => handleEditSave(zone.id)}
                onDeleteClick={() => setDeleteTarget(zone)}
              />
            ))}

            {/* 구역 추가 폼 */}
            {showAddForm && (
              <Paper
                elevation={0}
                sx={{ border: "1px solid #c8e6c9", borderRadius: 2, p: 2 }}
              >
                <Typography
                  variant="subtitle2"
                  fontWeight="bold"
                  color="success.main"
                  mb={1.5}
                >
                  새 구역 추가
                </Typography>
                <LockerStep
                  zones={newZones}
                  onChange={handleNewZoneChange}
                  onAdd={handleNewZoneAdd}
                  onRemove={handleNewZoneRemove}
                />
                <Box display="flex" gap={1} mt={2}>
                  <Button
                    variant="outlined"
                    onClick={() => {
                      setShowAddForm(false);
                      setNewZones([]);
                    }}
                    sx={{ borderRadius: 2, minWidth: 70 }}
                  >
                    취소
                  </Button>
                  <Button
                    fullWidth
                    variant="contained"
                    color="success"
                    onClick={handleAddSave}
                    disabled={addLoading || newZones.length === 0}
                    sx={{ borderRadius: 2, fontWeight: "bold" }}
                  >
                    {addLoading ? (
                      <CircularProgress size={20} color="inherit" />
                    ) : (
                      `저장 (${newZones.length}개)`
                    )}
                  </Button>
                </Box>
              </Paper>
            )}

            {/* 구역 추가 버튼 */}
            {!showAddForm && (
              <Button
                variant="outlined"
                startIcon={<AddIcon />}
                onClick={() => {
                  setShowAddForm(true);
                  setNewZones([
                    { id: Date.now(), name: "", size: "SMALL", rowCount: "", columnCount: "" },
                  ]);
                }}
                sx={{ borderRadius: 2, borderStyle: "dashed" }}
              >
                구역 추가
              </Button>
            )}
          </Stack>
        )}

      {/* 삭제 확인 Dialog */}
      <Dialog open={Boolean(deleteTarget)} onClose={() => setDeleteTarget(null)}>
        <DialogTitle sx={{ fontWeight: "bold" }}>구역 삭제</DialogTitle>
        <DialogContent>
          <Typography>
            <strong>{deleteTarget?.name}</strong> 구역을 삭제하시겠습니까?
          </Typography>
          <Typography variant="body2" color="text.secondary" mt={1}>
            임대 중인 락커가 있으면 삭제할 수 없습니다.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDeleteTarget(null)} variant="outlined">
            취소
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            variant="contained"
            color="error"
            disabled={saveLoading}
          >
            {saveLoading ? <CircularProgress size={18} color="inherit" /> : "삭제"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* 락커 상태 변경 Dialog */}
      <Dialog
        open={lockerDialog.open}
        onClose={() =>
          !lockerDialog.loading &&
          setLockerDialog({ open: false, locker: null, status: "", loading: false })
        }
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: "bold" }}>
          락커 상태 변경
          {lockerDialog.locker && (
            <Typography variant="body2" color="text.secondary" mt={0.5}>
              {lockerDialog.locker.name}
            </Typography>
          )}
        </DialogTitle>
        <DialogContent>
          <RadioGroup
            value={lockerDialog.status}
            onChange={(e) =>
              setLockerDialog((prev) => ({ ...prev, status: e.target.value }))
            }
          >
            {ITEM_STATUS_OPTIONS.map((opt) => (
              <FormControlLabel
                key={opt.value}
                value={opt.value}
                control={<Radio size="small" sx={{ color: opt.color, "&.Mui-checked": { color: opt.color } }} />}
                label={
                  <Box display="flex" alignItems="center" gap={1}>
                    <Box
                      sx={{
                        width: 10,
                        height: 10,
                        borderRadius: "50%",
                        bgcolor: opt.color,
                        flexShrink: 0,
                      }}
                    />
                    <Typography variant="body2">{opt.label}</Typography>
                  </Box>
                }
              />
            ))}
          </RadioGroup>
          {lockerDialog.locker?.usageStatus === "ACTIVE" && (
            <Typography variant="caption" color="warning.main" display="block" mt={1}>
              현재 대여 중인 락커입니다.
            </Typography>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={() =>
              setLockerDialog({ open: false, locker: null, status: "", loading: false })
            }
            variant="outlined"
            disabled={lockerDialog.loading}
          >
            취소
          </Button>
          <Button
            onClick={handleStatusSave}
            variant="contained"
            disabled={lockerDialog.loading || lockerDialog.status === lockerDialog.locker?.itemStatus}
          >
            {lockerDialog.loading ? <CircularProgress size={18} color="inherit" /> : "저장"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

/* ─── 구역 카드 컴포넌트 ──────────────────── */
function ZoneCard({
  zone,
  isEditing,
  editForm,
  saveLoading,
  expanded,
  lockers,
  onToggleExpand,
  onLockerClick,
  onEditStart,
  onEditCancel,
  onEditFormChange,
  onEditSave,
  onDeleteClick,
}) {
  const meta = LOCKER_SIZES.find((s) => s.value === zone.size) ?? LOCKER_SIZES[0];
  const rentPct =
    zone.totalCount > 0 ? Math.round((zone.rentedCount / zone.totalCount) * 100) : 0;

  return (
    <Paper
      elevation={0}
      sx={{ border: "1px solid #eef2f6", borderRadius: 2, overflow: "hidden" }}
    >
      {/* 카드 헤더 */}
      <Box
        sx={{
          px: 2,
          py: 1.2,
          display: "flex",
          alignItems: "center",
          gap: 1.5,
          bgcolor: meta.color + "12",
          borderBottom: "1px solid #eef2f6",
        }}
      >
        <Box
          sx={{
            width: 32,
            height: 32,
            borderRadius: 1,
            bgcolor: meta.color + "22",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <LockIcon sx={{ fontSize: 18, color: meta.color }} />
        </Box>
        <Box flex={1}>
          <Typography variant="body2" fontWeight="bold">
            {zone.name}
          </Typography>
          <Typography variant="caption" sx={{ color: meta.color, fontWeight: "bold" }}>
            {meta.label}
          </Typography>
        </Box>
        {!isEditing && (
          <Box display="flex" gap={0.5} alignItems="center">
            <Tooltip title={expanded ? "락커 접기" : "락커 보기"}>
              <IconButton size="small" onClick={onToggleExpand} sx={{ color: "text.secondary" }}>
                {expanded ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
              </IconButton>
            </Tooltip>
            <IconButton size="small" onClick={onEditStart} sx={{ color: "primary.main" }}>
              <EditIcon fontSize="small" />
            </IconButton>
            <IconButton size="small" onClick={onDeleteClick} sx={{ color: "error.main" }}>
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Box>
        )}
      </Box>

      {/* 카드 본문 */}
      <Box px={2} py={1.5}>
        {!isEditing ? (
          /* 읽기 모드 */
          <Box display="flex" gap={2}>
            <Box flex={1}>
              <Typography variant="caption" color="text.secondary">
                구성
              </Typography>
              <Typography variant="body2" fontWeight="bold">
                {zone.rowCount}행 × {zone.columnCount}열
              </Typography>
            </Box>
            <Box flex={1}>
              <Typography variant="caption" color="text.secondary">
                총 락커
              </Typography>
              <Typography variant="body2" fontWeight="bold">
                {zone.totalCount}개
              </Typography>
            </Box>
            <Box flex={1}>
              <Typography variant="caption" color="text.secondary">
                임대 현황
              </Typography>
              <Typography
                variant="body2"
                fontWeight="bold"
                color={zone.rentedCount > 0 ? "warning.main" : "text.secondary"}
              >
                {zone.rentedCount} / {zone.totalCount} ({rentPct}%)
              </Typography>
            </Box>
          </Box>
        ) : (
          /* 편집 모드 */
          <Stack spacing={1.5}>
            <TextField
              value={editForm.name ?? ""}
              onChange={(e) => onEditFormChange("name", e.target.value)}
              size="small"
              label="구역 이름"
              placeholder="예: A구역"
              fullWidth
            />
            <Box>
              <Typography variant="caption" color="text.secondary" display="block" mb={0.5}>
                사이즈
              </Typography>
              <ToggleButtonGroup
                value={editForm.size}
                exclusive
                onChange={(_, val) => { if (val) onEditFormChange("size", val); }}
                size="small"
                fullWidth
              >
                {LOCKER_SIZES.map((s) => (
                  <ToggleButton
                    key={s.value}
                    value={s.value}
                    sx={{
                      fontWeight: "bold",
                      "&.Mui-selected": {
                        bgcolor: s.color + "18",
                        color: s.color,
                        borderColor: s.color,
                      },
                    }}
                  >
                    {s.label}
                  </ToggleButton>
                ))}
              </ToggleButtonGroup>
            </Box>
            <Box display="flex" alignItems="center" gap={1}>
              <TextField
                type="number"
                value={editForm.rowCount ?? ""}
                onChange={(e) => onEditFormChange("rowCount", e.target.value)}
                size="small"
                label="행"
                sx={{ flex: 1 }}
                slotProps={{ htmlInput: { min: 0 } }}
              />
              <Typography variant="body1" color="text.disabled" sx={{ flexShrink: 0 }}>
                ×
              </Typography>
              <TextField
                type="number"
                value={editForm.columnCount ?? ""}
                onChange={(e) => onEditFormChange("columnCount", e.target.value)}
                size="small"
                label="열"
                sx={{ flex: 1 }}
                slotProps={{ htmlInput: { min: 0 } }}
              />
              <Box sx={{ flexShrink: 0, minWidth: 60, textAlign: "right" }}>
                <Typography variant="caption" color="text.secondary">
                  총
                </Typography>
                <Typography
                  variant="body2"
                  fontWeight="bold"
                  color={
                    (Number(editForm.rowCount) || 0) * (Number(editForm.columnCount) || 0) > 0
                      ? (LOCKER_SIZES.find((s) => s.value === editForm.size)?.color ?? "text.primary")
                      : "text.disabled"
                  }
                >
                  {(Number(editForm.rowCount) || 0) * (Number(editForm.columnCount) || 0)}개
                </Typography>
              </Box>
            </Box>
            <Divider />
            <Box display="flex" gap={1}>
              <Button
                variant="outlined"
                size="small"
                onClick={onEditCancel}
                disabled={saveLoading}
                sx={{ borderRadius: 2, minWidth: 60 }}
              >
                취소
              </Button>
              <Button
                fullWidth
                variant="contained"
                size="small"
                onClick={onEditSave}
                disabled={saveLoading}
                sx={{ borderRadius: 2, fontWeight: "bold" }}
              >
                {saveLoading ? <CircularProgress size={16} color="inherit" /> : "저장"}
              </Button>
            </Box>
          </Stack>
        )}
      </Box>

      {/* 락커 그리드 */}
      <Collapse in={expanded && !isEditing}>
        <Divider />
        <Box px={2} py={1.5}>
          <Typography variant="caption" color="text.secondary" display="block" mb={1}>
            락커 상태 클릭하여 변경
          </Typography>
          {lockers === null ? (
            <Box display="flex" justifyContent="center" py={2}>
              <CircularProgress size={24} />
            </Box>
          ) : (
            <>
              {/* 범례 */}
              <Box display="flex" flexWrap="wrap" gap={1.5} mb={1.5}>
                {[
                  { color: "#43a047", label: "정상" },
                  { color: "#1565c0", label: "대여중" },
                  { color: "#e53935", label: "고장" },
                  { color: "#fb8c00", label: "점검" },
                  { color: "#9e9e9e", label: "폐기" },
                ].map((item) => (
                  <Box key={item.label} display="flex" alignItems="center" gap={0.5}>
                    <Box sx={{ width: 10, height: 10, borderRadius: "2px", bgcolor: item.color }} />
                    <Typography variant="caption" color="text.secondary">{item.label}</Typography>
                  </Box>
                ))}
              </Box>
              {/* 그리드 */}
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: `repeat(${zone.columnCount}, 1fr)`,
                  gap: 0.5,
                }}
              >
                {lockers.map((locker) => {
                  const color = getLockerColor(locker.itemStatus, locker.usageStatus);
                  return (
                    <Tooltip
                      key={locker.id}
                      title={`#${locker.lockerNumber} · ${ITEM_STATUS_OPTIONS.find(o => o.value === locker.itemStatus)?.label ?? locker.itemStatus}`}
                    >
                      <Box
                        onClick={() => onLockerClick(locker)}
                        sx={{
                          bgcolor: color + "22",
                          border: `1.5px solid ${color}`,
                          borderRadius: 1,
                          height: 36,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          cursor: "pointer",
                          transition: "all 0.15s",
                          "&:hover": { bgcolor: color + "40", transform: "scale(1.05)" },
                        }}
                      >
                        <Typography
                          variant="caption"
                          sx={{ fontSize: "0.65rem", fontWeight: "bold", color }}
                        >
                          {locker.lockerNumber}
                        </Typography>
                      </Box>
                    </Tooltip>
                  );
                })}
              </Box>
            </>
          )}
        </Box>
      </Collapse>
    </Paper>
  );
}
