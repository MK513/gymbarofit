import { useEffect, useState } from "react";
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import { useParams } from "react-router-dom";
import EditIcon from "@mui/icons-material/Edit";
import PlaceIcon from "@mui/icons-material/Place";
import PeopleIcon from "@mui/icons-material/People";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import { useNotification } from "../../context/NotificationContext";
import { getOwnerGym, updateOwnerGym } from "../../api/owner";
import BasicInfoStep from "../../components/owners/gymRegister/BasicInfoStep";
import { DAY_LABELS } from "../../components/owners/gymRegister/constants";

const statusMeta = {
  ACTIVE: { label: "운영 중", color: "success" },
  DRAFT:  { label: "초안",   color: "warning" },
  CANCEL: { label: "취소됨", color: "error" },
};

/* API {dayOfWeek} ↔ BasicInfoStep {day} 변환 */
const apiToFormHour = (h) => ({
  day: h.dayOfWeek,
  openAt: h.openAt ?? "09:00",
  closeAt: h.closeAt ?? "22:00",
  closed: h.closed,
});
const formToApiHour = (h) => ({
  dayOfWeek: h.day,
  openAt: h.closed ? null : h.openAt,
  closeAt: h.closed ? null : h.closeAt,
  closed: h.closed,
});

export default function GymDetail() {
  const { gymId } = useParams();
  const { showNotification } = useNotification();

  const [gym, setGym] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editMode, setEditMode] = useState(false);

  const [form, setForm] = useState({ name: "", postalCode: "", address: "", maxCapacity: "" });
  const [operatingHours, setOperatingHours] = useState([]);

  useEffect(() => {
    getOwnerGym({ gymId })
      .then((data) => {
        setGym(data);
        setForm({
          name: data.name ?? "",
          postalCode: data.postalCode ?? "",
          address: data.address ?? "",
          maxCapacity: String(data.maxCapacity ?? ""),
        });
        setOperatingHours((data.operatingHours ?? []).map(apiToFormHour));
      })
      .catch(() => showNotification("헬스장 정보를 불러오지 못했습니다.", "error"))
      .finally(() => setLoading(false));
  }, [gymId]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleEnterEdit = () => {
    setForm({
      name: gym.name ?? "",
      postalCode: gym.postalCode ?? "",
      address: gym.address ?? "",
      maxCapacity: String(gym.maxCapacity ?? ""),
    });
    setOperatingHours((gym.operatingHours ?? []).map(apiToFormHour));
    setEditMode(true);
  };

  const handleCancelEdit = () => setEditMode(false);

  const handleFormChange = (e) =>
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSave = async () => {
    setSaving(true);
    try {
      const updated = await updateOwnerGym(
        {
          name: form.name,
          postalCode: form.postalCode,
          address: form.address,
          maxCapacity: Number(form.maxCapacity),
          operatingHours: operatingHours.map(formToApiHour),
        },
        { gymId }
      );
      setGym(updated);
      setEditMode(false);
      showNotification("헬스장 정보가 수정되었습니다.", "success");
    } catch {
      showNotification("저장에 실패했습니다.", "error");
    } finally {
      setSaving(false);
    }
  };

  const formValid = form.name.trim() && form.address.trim() && Number(form.maxCapacity) > 0;

  return (
    <Box sx={{ px: 2, py: 2.5, maxWidth: 640, width: "100%", mx: "auto" }}>
      {/* 페이지 헤더 */}
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={2.5}>
        <Typography variant="h6" fontWeight="bold">
          {gym?.name ?? "헬스장 상세"}
        </Typography>
        <Box>
          {!loading && gym && !editMode && (
            <Button
              size="small"
              startIcon={<EditIcon fontSize="small" />}
              onClick={handleEnterEdit}
              sx={{ fontWeight: "bold" }}
            >
              편집
            </Button>
          )}
          {editMode && (
            <Button size="small" onClick={handleCancelEdit} sx={{ fontWeight: "bold" }}>
              취소
            </Button>
          )}
        </Box>
      </Box>

      {loading ? (
        <Box display="flex" justifyContent="center" mt={8}>
          <CircularProgress />
        </Box>
      ) : editMode ? (
        <>
          <Typography variant="subtitle2" fontWeight="bold" color="text.secondary" mb={2.5}>
            기본 정보를 수정하세요.
          </Typography>
          <BasicInfoStep
            form={form}
            onChange={handleFormChange}
            operatingHours={operatingHours}
            onHoursChange={setOperatingHours}
          />
          {/* 편집 저장 버튼 */}
          <Box sx={{ mt: 2, position: "sticky", bottom: 0, bgcolor: "#f5f7fa", py: 1.5 }}>
            <Button
              fullWidth
              variant="contained"
              onClick={handleSave}
              disabled={!formValid || saving}
              sx={{ borderRadius: 2, fontWeight: "bold", py: 1 }}
            >
              {saving ? <CircularProgress size={20} color="inherit" /> : "저장"}
            </Button>
          </Box>
        </>
      ) : (
        <GymInfoCard gym={gym} />
      )}
    </Box>
  );
}

function GymInfoCard({ gym }) {
  const status = statusMeta[gym.status] ?? { label: gym.status, color: "default" };

  return (
    <Stack spacing={2}>
      {/* 상태 + 기본 정보 카드 */}
      <Paper elevation={0} sx={{ borderRadius: 3, border: "1px solid #eef2f6", overflow: "hidden" }}>
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
          <Typography variant="body2" fontWeight="bold" color="#fff">
            {gym.name}
          </Typography>
          <Chip
            label={status.label}
            color={status.color}
            size="small"
            sx={{ fontWeight: "bold", fontSize: "0.7rem", height: 22 }}
          />
        </Box>

        <Box px={2} py={2}>
          <Stack spacing={1.5}>
            <InfoRow
              icon={<PlaceIcon sx={{ fontSize: 16, color: "primary.main" }} />}
              label="주소"
              value={`(${gym.postalCode}) ${gym.address}`}
            />
            <Divider />
            <InfoRow
              icon={<PeopleIcon sx={{ fontSize: 16, color: "#f57c00" }} />}
              label="최대 수용 인원"
              value={`${gym.maxCapacity}명`}
            />
          </Stack>
        </Box>
      </Paper>

      {/* 운영 시간 카드 */}
      <Paper elevation={0} sx={{ borderRadius: 3, border: "1px solid #eef2f6", overflow: "hidden" }}>
        <Box sx={{ px: 2, py: 1.25, bgcolor: "#fafbfc", borderBottom: "1px solid #eef2f6" }}>
          <Box display="flex" alignItems="center" gap={0.75}>
            <AccessTimeIcon sx={{ fontSize: 14, color: "text.secondary" }} />
            <Typography variant="caption" color="text.secondary" fontWeight="bold">
              요일별 운영 시간
            </Typography>
          </Box>
        </Box>
        <Stack divider={<Divider />}>
          {(gym.operatingHours ?? []).map((h) => (
            <Box
              key={h.dayOfWeek}
              sx={{
                px: 2,
                py: 1.25,
                display: "flex",
                alignItems: "center",
                gap: 1,
                bgcolor: h.closed ? "#fafafa" : "#fff",
              }}
            >
              <Typography
                variant="body2"
                sx={{
                  width: 52,
                  flexShrink: 0,
                  fontWeight: h.closed ? "normal" : "bold",
                  color: h.closed ? "text.disabled" : "text.primary",
                }}
              >
                {DAY_LABELS[h.dayOfWeek]}
              </Typography>
              {h.closed ? (
                <Chip
                  label="휴무"
                  size="small"
                  sx={{
                    bgcolor: "#f1f3f5",
                    color: "text.disabled",
                    fontWeight: "bold",
                    height: 22,
                    fontSize: "0.7rem",
                  }}
                />
              ) : (
                <Typography variant="body2" color="text.secondary">
                  {h.openAt} ~ {h.closeAt}
                </Typography>
              )}
            </Box>
          ))}
        </Stack>
      </Paper>
    </Stack>
  );
}

function InfoRow({ icon, label, value }) {
  return (
    <Box display="flex" alignItems="flex-start" gap={1}>
      <Box mt={0.2}>{icon}</Box>
      <Box>
        <Typography variant="caption" color="text.secondary" display="block">
          {label}
        </Typography>
        <Typography variant="body2" fontWeight="bold">
          {value}
        </Typography>
      </Box>
    </Box>
  );
}
