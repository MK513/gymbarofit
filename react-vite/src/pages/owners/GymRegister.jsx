import { useState } from "react";
import {
  AppBar,
  Box,
  Button,
  CircularProgress,
  IconButton,
  Step,
  StepLabel,
  Stepper,
  Toolbar,
  Typography,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useNotification } from "../../context/NotificationContext";
import {
  createOwnerGym,
  createOwnerGymEquipments,
  createOwnerGymLockerZones,
  saveOwnerGymMap,
  finalizeOwnerGym,
} from "../../api/owner";

import ArrowBackIcon from "@mui/icons-material/ArrowBack";

import BasicInfoStep from "../../components/owners/gymRegister/BasicInfoStep";
import EquipmentStep from "../../components/owners/gymRegister/EquipmentStep";
import LockerStep from "../../components/owners/gymRegister/LockerStep";
import MapStep from "../../components/owners/gymRegister/MapStep";
import { DEFAULT_OPERATING_HOURS, LOCKER_SIZES, STEPS } from "../../components/owners/gymRegister/constants";

export default function GymRegister() {
  const navigate = useNavigate();
  const { showNotification } = useNotification();

  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [gymId, setGymId] = useState(null);

  /* Step 1 */
  const [gymForm, setGymForm] = useState({
    name: "",
    postalCode: "",
    address: "",
    maxCapacity: "",
  });
  const [operatingHours, setOperatingHours] = useState(DEFAULT_OPERATING_HOURS);

  /* Step 2 */
  const [equipList, setEquipList] = useState([]);
  const [equipForm, setEquipForm] = useState({
    name: "",
    type: "CARDIO",
    count: 1,
    imageUrl: "",
  });

  /* Step 3 - 맵 배치 */
  const [registeredEquipments, setRegisteredEquipments] = useState([]);
  const [placedEquipments, setPlacedEquipments] = useState([]);

  /* Step 4 */
  const [lockerZones, setLockerZones] = useState(
    LOCKER_SIZES.map((s) => ({ size: s.value, rowCount: "", columnCount: "" }))
  );

  /* ─── 핸들러 ────────────────────────────────────── */
  const handleGymChange = (e) =>
    setGymForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleEquipChange = (e) =>
    setEquipForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleAddEquip = () => {
    if (!equipForm.imageUrl) return;
    setEquipList((p) => [
      ...p,
      { ...equipForm, count: Number(equipForm.count), id: Date.now() },
    ]);
    setEquipForm((p) => ({ ...p, name: "", imageUrl: "", count: 1 }));
  };

  const handleRemoveEquip = (id) =>
    setEquipList((p) => p.filter((e) => e.id !== id));

  const handleLockerChange = (size, field, value) =>
    setLockerZones((p) =>
      p.map((z) => (z.size === size ? { ...z, [field]: value } : z))
    );

  const buildGymDto = () => ({
    name: gymForm.name,
    postalCode: gymForm.postalCode,
    address: gymForm.address,
    maxCapacity: Number(gymForm.maxCapacity),
    operatingHours: operatingHours.map((h) => ({
      dayOfWeek: h.day,
      openAt: h.closed ? null : h.openAt,
      closeAt: h.closed ? null : h.closeAt,
      closed: h.closed,
    })),
  });

  const buildMapData = (placed) => ({
    version: "1.0",
    gymId,
    mapMeta: { width: 20, height: 15, gridSize: 40 },
    zones: [], walls: [], pillars: [],
    equipment: placed.map((p) => ({
      equipmentId: p.equipmentId,
      gridX:       p.gridX,
      gridY:       p.gridY,
      rotation:    0,
    })),
  });

  /* Step 1 → Step 2: 헬스장 draft 생성 */
  const handleStep1Next = async () => {
    setLoading(true);
    try {
      const newGym = await createOwnerGym({ ...buildGymDto(), status: "DRAFT" });
      setGymId(newGym.id);
      setActiveStep(1);
    } catch {
      showNotification("헬스장 정보 저장에 실패했습니다.", "error");
    } finally {
      setLoading(false);
    }
  };

  /* Step 2 건너뛰기: 기구 없이 맵 단계로 */
  const handleStep2Skip = () => {
    setRegisteredEquipments([]);
    setActiveStep(2);
  };

  /* Step 2 다음: 기구 번호별 개별 등록 후 Step 3(맵)으로 */
  const handleStep2Next = async () => {
    setLoading(true);
    try {
      const registeredEquips = [];
      for (const equip of equipList) {
        const count = Number(equip.count);
        const baseName = equip.imageUrl
          ? equip.imageUrl.replace(/(_\d+)?\.[^.]+$/, "")
          : equip.name;
        for (let i = 1; i <= count; i++) {
          const name = count === 1 ? baseName : `${baseName} ${i}`;
          const result = await createOwnerGymEquipments(
            {
              name,
              type: equip.type,
              count: 1,
              imageUrl: equip.imageUrl
                ? `${import.meta.env.VITE_API_BASE_URL}/images/${equip.imageUrl}`
                : "",
            },
            { gymId }
          );
          registeredEquips.push({
            id: result?.id ?? `local-${Date.now()}-${i}`,
            name,
            type: equip.type,
            imageUrl: equip.imageUrl,
          });
        }
      }
      setRegisteredEquipments(registeredEquips);
      setActiveStep(2);
    } catch {
      showNotification("기구 등록에 실패했습니다.", "error");
    } finally {
      setLoading(false);
    }
  };

  /* Step 3 건너뛰기: 맵 저장 없이 락커 단계로 */
  const handleStep3Skip = () => setActiveStep(3);

  /* Step 3 다음: 맵 draft 저장 후 락커 단계로 */
  const handleStep3Next = async () => {
    if (gymId && placedEquipments.length > 0) {
      setLoading(true);
      const mapData = buildMapData(placedEquipments);
      try {
        await saveOwnerGymMap(mapData, { gymId });
        localStorage.setItem(`gym-map-${gymId}`, JSON.stringify(mapData));
      } catch {
        localStorage.setItem(`gym-map-${gymId}`, JSON.stringify(mapData));
      } finally {
        setLoading(false);
      }
    }
    setActiveStep(3);
  };

  /* Step 4 건너뛰기: 락커 없이 등록 완료 */
  const handleStep4Skip = async () => {
    setLoading(true);
    try {
      await finalizeOwnerGym({ gymId });
      showNotification("헬스장이 등록되었습니다!", "success");
      navigate("/owners");
    } catch {
      showNotification("등록에 실패했습니다.", "error");
    } finally {
      setLoading(false);
    }
  };

  /* Step 4: 락커 등록 후 등록 완료 */
  const handleFinish = async () => {
    const zones = lockerZones.filter(
      (z) => Number(z.rowCount) > 0 && Number(z.columnCount) > 0
    );

    setLoading(true);
    try {
      for (const zone of zones) {
        await createOwnerGymLockerZones(
          {
            size:        zone.size,
            rowCount:    Number(zone.rowCount),
            columnCount: Number(zone.columnCount),
          },
          { gymId }
        );
      }
      await finalizeOwnerGym({ gymId });
      showNotification("헬스장이 등록되었습니다!", "success");
      navigate("/owners");
    } catch {
      showNotification("등록에 실패했습니다.", "error");
    } finally {
      setLoading(false);
    }
  };

  const step1Valid = gymForm.name.trim() && gymForm.address.trim() && gymForm.maxCapacity;

  const stepDescriptions = [
    "헬스장 기본 정보를 입력해주세요.",
    "운동 기구를 등록하세요. 동종 기구는 수량을 입력하면 번호가 붙어 개별 등록됩니다.",
    "등록된 기구를 맵에 배치하세요. 건너뛰기하면 나중에 맵 편집에서 배치할 수 있습니다.",
    "보관함을 사이즈별로 등록하세요. 행·열을 입력하지 않으면 해당 사이즈는 건너뜁니다.",
  ];

  return (
    <Box
      sx={{
        position: "fixed",
        inset: 0,
        display: "flex",
        flexDirection: "column",
        bgcolor: "#f5f7fa",
      }}
    >
      {/* 헤더 */}
      <AppBar
        position="static"
        color="inherit"
        elevation={0}
        sx={{ borderBottom: "1px solid #e0e0e0", flexShrink: 0 }}
      >
        <Toolbar>
          <IconButton
            edge="start"
            size="small"
            onClick={() => navigate("/owners")}
            sx={{ mr: 1 }}
          >
            <ArrowBackIcon fontSize="small" />
          </IconButton>
          <Typography variant="h6" fontWeight="bold">
            헬스장 등록
          </Typography>
        </Toolbar>
      </AppBar>

      {/* Stepper */}
      <Box
        sx={{
          bgcolor: "#fff",
          borderBottom: "1px solid #eef2f6",
          px: 2,
          py: 1.5,
          flexShrink: 0,
        }}
      >
        <Stepper activeStep={activeStep} alternativeLabel>
          {STEPS.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
      </Box>

      {/* 본문 */}
      <Box
        sx={{
          flex: 1,
          minHeight: 0,
          overflowY: "auto",
          px: 2,
          py: 2.5,
          maxWidth: activeStep === 2 ? 900 : 640,
          width: "100%",
          mx: "auto",
        }}
      >
        <Typography variant="subtitle2" fontWeight="bold" color="text.secondary" mb={2.5}>
          {stepDescriptions[activeStep]}
        </Typography>

        {activeStep === 0 && (
          <BasicInfoStep
            form={gymForm}
            onChange={handleGymChange}
            operatingHours={operatingHours}
            onHoursChange={setOperatingHours}
          />
        )}
        {activeStep === 1 && (
          <EquipmentStep
            list={equipList}
            form={equipForm}
            onFormChange={handleEquipChange}
            onAdd={handleAddEquip}
            onRemove={handleRemoveEquip}
          />
        )}
        {activeStep === 2 && (
          <MapStep
            equipment={registeredEquipments}
            onPlacedChange={setPlacedEquipments}
          />
        )}
        {activeStep === 3 && (
          <LockerStep zones={lockerZones} onChange={handleLockerChange} />
        )}
      </Box>

      {/* 하단 버튼 */}
      <Box sx={{ borderTop: "1px solid #eef2f6", bgcolor: "#fff", flexShrink: 0 }}>
        <Box sx={{ px: 2, py: 1.5, maxWidth: activeStep === 2 ? 900 : 640, mx: "auto" }}>

          {/* Step 1: 기본 정보 */}
          {activeStep === 0 && (
            <Button
              fullWidth
              variant="contained"
              onClick={handleStep1Next}
              disabled={!step1Valid || loading}
              sx={{ borderRadius: 2, fontWeight: "bold", py: 1 }}
            >
              {loading ? <CircularProgress size={20} color="inherit" /> : "다음"}
            </Button>
          )}

          {/* Step 2: 운동 기구 */}
          {activeStep === 1 && (
            <Box display="flex" gap={1}>
              <Button
                variant="outlined"
                onClick={handleStep2Skip}
                disabled={loading}
                sx={{ borderRadius: 2, fontWeight: "bold", minWidth: 90 }}
              >
                건너뛰기
              </Button>
              <Button
                fullWidth
                variant="contained"
                onClick={handleStep2Next}
                disabled={loading || equipList.length === 0}
                sx={{ borderRadius: 2, fontWeight: "bold", py: 1 }}
              >
                {loading ? (
                  <CircularProgress size={20} color="inherit" />
                ) : (
                  `다음 (${equipList.length}개 등록)`
                )}
              </Button>
            </Box>
          )}

          {/* Step 3: 맵 배치 */}
          {activeStep === 2 && (
            <Box display="flex" gap={1}>
              <Button
                variant="outlined"
                onClick={handleStep3Skip}
                disabled={loading}
                sx={{ borderRadius: 2, fontWeight: "bold", minWidth: 90 }}
              >
                건너뛰기
              </Button>
              <Button
                fullWidth
                variant="contained"
                onClick={handleStep3Next}
                disabled={loading}
                sx={{ borderRadius: 2, fontWeight: "bold", py: 1 }}
              >
                {loading ? (
                  <CircularProgress size={20} color="inherit" />
                ) : (
                  `다음 (${placedEquipments.length}개 배치)`
                )}
              </Button>
            </Box>
          )}

          {/* Step 4: 락커 */}
          {activeStep === 3 && (
            <Box display="flex" gap={1}>
              <Button
                variant="outlined"
                onClick={handleStep4Skip}
                disabled={loading}
                sx={{ borderRadius: 2, fontWeight: "bold", minWidth: 90 }}
              >
                {loading ? <CircularProgress size={18} color="inherit" /> : "건너뛰기"}
              </Button>
              <Button
                fullWidth
                variant="contained"
                onClick={handleFinish}
                disabled={loading}
                sx={{ borderRadius: 2, fontWeight: "bold", py: 1 }}
              >
                {loading ? (
                  <CircularProgress size={20} color="inherit" />
                ) : (
                  "등록 완료"
                )}
              </Button>
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
}
