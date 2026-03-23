import { useState, useEffect, useRef } from "react";
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
import { useNavigate, useLocation } from "react-router-dom";
import { useNotification } from "../../context/NotificationContext";
import {
  createOwnerGym,
  createOwnerGymLockerZones,
  getOwnerGymEquipments,
  getOwnerGymMap,
  saveOwnerGymMap,
  finalizeOwnerGym,
  getEquipmentIcons,
} from "../../api/owner";
import {
  createOwnerGymEquipments,
  deleteOwnerGymEquipment,
} from "../../api/equipment";

import { API_BASE_URL } from "../../api-config";

import ArrowBackIcon from "@mui/icons-material/ArrowBack";

import BasicInfoStep from "../../components/owners/gymRegister/BasicInfoStep";
import EquipmentStep from "../../components/owners/gymRegister/EquipmentStep";
import LockerStep from "../../components/owners/gymRegister/LockerStep";
import MapStep from "../../components/owners/gymRegister/MapStep";
import { DEFAULT_OPERATING_HOURS, STEPS } from "../../components/owners/gymRegister/constants";

export default function GymRegister() {
  const navigate = useNavigate();
  const location = useLocation();
  const { showNotification } = useNotification();

  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [gymId, setGymId] = useState(null);
  const [mapMeta, setMapMeta] = useState({ cols: 20, rows: 15 });

  const [icons, setIcons] = useState([]);
  const registeredEquipSnapshotRef = useRef(null); // 마지막으로 등록된 equipList 스냅샷

  useEffect(() => {
    getEquipmentIcons()
      .then((data) =>
        setIcons(
          (data ?? []).map((item) => ({
            filename: item.filename,
            url: item.url.startsWith("http") ? item.url : `${API_BASE_URL}${item.url}`,
            label: item.type,                    // 기구 종류명 ("러닝머신")
            category: item.category ?? "MACHINE", // 카테고리 enum ("CARDIO")
          }))
        )
      )
      .catch(() => {});
  }, []);

  /* Draft 복원: Dashboard에서 "예" 선택 시 state로 전달된 데이터 복원 */
  useEffect(() => {
    const draft = location.state?.draftGym;
    if (!draft) return;

    setGymId(draft.id);
    setGymForm({
      name: draft.name ?? "",
      postalCode: draft.postalCode ?? "",
      address: draft.address ?? "",
      maxCapacity: String(draft.maxCapacity ?? ""),
    });

    if (draft.operatingHours?.length > 0) {
      setOperatingHours(
        draft.operatingHours.map((h) => ({
          day: h.dayOfWeek,
          openAt: h.openAt ?? "09:00",
          closeAt: h.closeAt ?? "22:00",
          closed: h.closed ?? false,
        }))
      );
    }

    // DB에서 기구 목록 및 맵 배치 좌표 복원
    getOwnerGymEquipments({ gymId: draft.id })
      .then((gymEquips) => {
        if (!gymEquips?.length) return;

        // equipList (grouped by name/type/imageUrl) 재구성
        const groupMap = {};
        for (const eq of gymEquips) {
          const key = `${eq.name}__${eq.type}__${eq.imageUrl}`;
          if (!groupMap[key]) {
            groupMap[key] = {
              id: key,
              name: eq.name,
              type: eq.type,
              category: eq.category ?? "MACHINE",
              imageUrl: eq.imageUrl?.replace("/images/", "") ?? "",
              iconUrl: eq.imageUrl ? `${API_BASE_URL}${eq.imageUrl}` : "",
              count: 0,
            };
          }
          groupMap[key].count++;
        }
        const reconstitutedEquipList = Object.values(groupMap);
        setEquipList(reconstitutedEquipList);
        registeredEquipSnapshotRef.current = JSON.stringify(reconstitutedEquipList);

        // registeredEquipments (real IDs) 복원
        const registered = gymEquips.map((eq) => ({
          id: eq.id,
          name: eq.name,
          type: eq.type,
          category: eq.category ?? "MACHINE",
          iconUrl: eq.imageUrl ? `${API_BASE_URL}${eq.imageUrl}` : "",
        }));
        setRegisteredEquipments(registered);

        // 배치 좌표가 있는 항목 복원
        const placed = gymEquips
          .filter((eq) => eq.gridX != null)
          .map((eq) => ({
            id: `p-${eq.id}`,
            equipmentId: eq.id,
            name: eq.name,
            type: eq.type,
            category: eq.category ?? "MACHINE",
            iconUrl: eq.imageUrl ? `${API_BASE_URL}${eq.imageUrl}` : "",
            gridX: eq.gridX,
            gridY: eq.gridY,
            spanW: eq.spanW ?? 2,
            spanH: eq.spanH ?? 2,
            status: "normal",
          }));
        if (placed.length > 0) setInitialPlaced(placed);
      })
      .catch(() => {});

    getOwnerGymMap({ gymId: draft.id })
      .then((mapData) => {
        if (mapData?.mapWidth) {
          setMapMeta({ cols: mapData.mapWidth, rows: mapData.mapHeight });
        }
      })
      .catch(() => {});

    setActiveStep(draft.currentStep ?? 1);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

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
    type: "",
    category: "MACHINE",
    count: 1,
    imageUrl: "",
  });

  /* Step 3 - 맵 배치 */
  const [registeredEquipments, setRegisteredEquipments] = useState([]);
  const [placedEquipments, setPlacedEquipments] = useState([]);
  const [initialPlaced, setInitialPlaced] = useState([]);

  /* Step 4 */
  const [lockerZones, setLockerZones] = useState([]);

  /* ─── 핸들러 ────────────────────────────────────── */
  const handleGymChange = (e) =>
    setGymForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleEquipChange = (e) =>
    setEquipForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleAddEquip = () => {
    if (!equipForm.imageUrl) return;
    setEquipList((p) => {
      const existing = p.find(
        (e) => e.imageUrl === equipForm.imageUrl && e.type === equipForm.type
      );
      if (existing) {
        return p.map((e) =>
          e === existing ? { ...e, count: e.count + Number(equipForm.count) } : e
        );
      }
      return [...p, { ...equipForm, count: Number(equipForm.count), id: Date.now() }];
    });
    setEquipForm((p) => ({ ...p, name: "", imageUrl: "", count: 1 }));
  };

  const handleRemoveEquip = (id) =>
    setEquipList((p) => p.filter((e) => e.id !== id));

  const handleLockerChange = (id, field, value) =>
    setLockerZones((p) =>
      p.map((z) => (z.id === id ? { ...z, [field]: value } : z))
    );

  const handleAddLockerZone = () =>
    setLockerZones((p) => [
      ...p,
      { id: Date.now(), name: "", size: "SMALL", rowCount: "", columnCount: "" },
    ]);

  const handleRemoveLockerZone = (id) =>
    setLockerZones((p) => p.filter((z) => z.id !== id));

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

  /* Step 1 → Step 2: 헬스장 draft 생성 (이미 생성된 경우 스킵) */
  const handleStep1Next = async () => {
    if (gymId) {
      setActiveStep(1);
      return;
    }
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

  /* Step 2 다음: equipment DB에 즉시 저장 */
  const handleStep2Next = async () => {
    const currentSnapshot = JSON.stringify(equipList);
    // 이전 단계 복귀 후 목록 변경 없으면 재생성 스킵
    if (
      registeredEquipments.length > 0 &&
      registeredEquipSnapshotRef.current === currentSnapshot
    ) {
      setActiveStep(2);
      return;
    }
    setLoading(true);
    try {
      // 기존 equipment 삭제 (목록이 바뀐 경우)
      for (const eq of registeredEquipments) {
        await deleteOwnerGymEquipment({ gymId, equipmentId: eq.id }).catch(() => {});
      }

      // equipment DB에 즉시 생성 → 실제 DB ID 확보
      const registered = [];
      for (const equip of equipList) {
        const count = Number(equip.count);
        for (let i = 0; i < count; i++) {
          const realIds = await createOwnerGymEquipments(
            {
              name: equip.name,
              type: equip.type,
              count: 1,
              imageUrl: equip.imageUrl ? `/images/${equip.imageUrl}` : "",
            },
            { gymId }
          );
          if (realIds?.[0]) {
            const iconObj = icons.find((ic) => ic.filename === equip.imageUrl);
            registered.push({
              id: realIds[0],
              name: equip.name,
              type: equip.type,
              category: equip.category ?? "MACHINE",
              iconUrl: iconObj?.url ?? "",
            });
          }
        }
      }
      registeredEquipSnapshotRef.current = currentSnapshot;
      setRegisteredEquipments(registered);
      setPlacedEquipments([]);
      setInitialPlaced([]);
      setActiveStep(2);
    } catch {
      showNotification("기구 목록 저장에 실패했습니다.", "error");
    } finally {
      setLoading(false);
    }
  };

  /* Step 3 다음: 맵 배치 좌표 저장 후 락커 단계로 */
  const handleStep3Next = async () => {
    if (gymId) {
      setLoading(true);
      try {
        await saveOwnerGymMap(
          {
            mapWidth: mapMeta.cols,
            mapHeight: mapMeta.rows,
            equipments: placedEquipments.map((p) => ({
              id: p.equipmentId,
              gridX: p.gridX,
              gridY: p.gridY,
              spanW: p.spanW ?? 2,
              spanH: p.spanH ?? 2,
            })),
          },
          { gymId }
        );
      } catch {
        // 저장 실패해도 다음 단계로 진행
      } finally {
        setLoading(false);
      }
    }
    setActiveStep(3);
  };

  /* Step 4: 락커 등록 → 헬스장 확정 (equipment는 step 2에서 이미 DB 저장됨) */
  const handleFinish = async () => {
    const zones = lockerZones.filter(
      (z) => z.name.trim() && Number(z.rowCount) > 0 && Number(z.columnCount) > 0
    );

    setLoading(true);
    try {
      // 락커 등록
      for (const zone of zones) {
        await createOwnerGymLockerZones({
            gymId,
            name:        zone.name,
            size:        zone.size,
            rowCount:    Number(zone.rowCount),
            columnCount: Number(zone.columnCount),
          });
      }

      // 헬스장 확정
      await finalizeOwnerGym({ gymId });
      showNotification("헬스장이 등록되었습니다!", "success");
      navigate("/dashboard");
    } catch {
      showNotification("등록에 실패했습니다.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => setActiveStep((prev) => prev - 1);

  const step1Valid = gymForm.name.trim() && gymForm.address.trim() && gymForm.maxCapacity;

  const stepDescriptions = [
    "헬스장 기본 정보를 입력해주세요.",
    "운동 기구를 등록하세요. 동종 기구는 수량을 입력하면 개별 등록됩니다.",
    "등록된 기구를 맵에 배치하세요. 건너뛰기하면 나중에 맵 편집에서 배치할 수 있습니다.",
    "보관함 구역을 추가하고 이름, 사이즈(소·중·대), 행·열을 설정하세요.",
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
            onClick={() => navigate("/dashboard")}
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
            icons={icons}
          />
        )}
        {activeStep === 2 && (
          <MapStep
            equipment={registeredEquipments}
            initialPlaced={initialPlaced}
            onPlacedChange={setPlacedEquipments}
            onMapMetaChange={setMapMeta}
          />
        )}
        {activeStep === 3 && (
          <LockerStep
              zones={lockerZones}
              onChange={handleLockerChange}
              onAdd={handleAddLockerZone}
              onRemove={handleRemoveLockerZone}
            />
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
                onClick={handleBack}
                disabled={loading}
                sx={{ borderRadius: 2, fontWeight: "bold", minWidth: 70 }}
              >
                이전
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
                onClick={handleBack}
                disabled={loading}
                sx={{ borderRadius: 2, fontWeight: "bold", minWidth: 70 }}
              >
                이전
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
                onClick={handleBack}
                disabled={loading}
                sx={{ borderRadius: 2, fontWeight: "bold", minWidth: 70 }}
              >
                이전
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
