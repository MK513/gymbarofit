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
  createOwnerGymEquipments,
  createOwnerGymLockerZones,
  getOwnerGymMap,
  saveOwnerGymMap,
  finalizeOwnerGym,
  getEquipmentIcons,
} from "../../api/owner";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

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
            url: item.url,
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

    // 저장된 맵 데이터에서 기구 목록 및 배치 좌표 복원
    getOwnerGymMap({ gymId: draft.id })
      .then((mapData) => {
        if (mapData?.equipmentList?.length > 0) {
          setEquipList(mapData.equipmentList);
          registeredEquipSnapshotRef.current = JSON.stringify(mapData.equipmentList);
        }
        if (mapData?.registeredEquipments?.length > 0) {
          setRegisteredEquipments(mapData.registeredEquipments);
          // gridX/Y가 있는 항목은 배치 좌표로 복원
          const placed = mapData.registeredEquipments
            .filter((re) => re.gridX !== undefined)
            .map((re) => {
              const el = mapData.equipmentList?.find((e) => e.id === re.equipListId);
              return {
                id: `p-${re.id}`,
                equipmentId: re.id,
                name: re.name,
                type:     el?.type ?? "",
                category: el?.category ?? "",
                iconUrl:  el?.iconUrl ?? "",
                gridX: re.gridX,
                gridY: re.gridY,
                spanW: re.spanW ?? 1,
                spanH: re.spanH ?? 1,
                status: "normal",
              };
            });
          if (placed.length > 0) setInitialPlaced(placed);
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

  const buildMapData = (placed) => {
    const placementMap = Object.fromEntries(
      placed.map((p) => [
        p.equipmentId,
        { gridX: p.gridX, gridY: p.gridY, spanW: p.spanW ?? 1, spanH: p.spanH ?? 1 },
      ])
    );
    const equipListWithIconUrl = equipList.map((eq) => {
      const iconObj = icons.find((ic) => ic.filename === eq.imageUrl);
      return { ...eq, iconUrl: iconObj ? `${BASE_URL}${iconObj.url}` : "" };
    });
    return {
      mapMeta: { width: mapMeta.cols, height: mapMeta.rows, gridSize: 40 },
      equipmentList: equipListWithIconUrl,
      registeredEquipments: registeredEquipments.map((re) => ({
        id: re.id,
        name: re.name,
        equipListId: re.equipListId,
        ...(placementMap[re.id] ?? {}),
      })),
    };
  };

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

  /* Step 2 다음: equipment DB 저장 없이 temp ID로 로컬 생성 후 map_data 저장 */
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
      // equipment DB 저장 없이 임시 ID로 로컬에서 생성
      const registeredEquips = [];
      for (const equip of equipList) {
        const count = Number(equip.count);
        for (let i = 1; i <= count; i++) {
          const name = equip.name;
          registeredEquips.push({
            id: `temp-${equip.id}-${i}`,  // Step 4에서 실제 DB ID로 교체됨
            name,
            equipListId: equip.id,
          });
        }
      }
      registeredEquipSnapshotRef.current = currentSnapshot;
      setRegisteredEquipments(registeredEquips);

      // 기구 목록을 맵 데이터에 포함해 저장 → draft 복원 시 재사용
      const equipListWithIconUrl = equipList.map((eq) => {
        const iconObj = icons.find((ic) => ic.filename === eq.imageUrl);
        return { ...eq, iconUrl: iconObj ? `${BASE_URL}${iconObj.url}` : "" };
      });
      await saveOwnerGymMap(
        {
          mapMeta: { width: mapMeta.cols, height: mapMeta.rows, gridSize: 40 },
          equipmentList: equipListWithIconUrl,
          registeredEquipments: registeredEquips,
          completedStep: 2,
        },
        { gymId }
      ).catch(() => {});

      setActiveStep(2);
    } catch {
      showNotification("기구 목록 저장에 실패했습니다.", "error");
    } finally {
      setLoading(false);
    }
  };

  /* Step 3 다음: 맵 draft 저장 후 락커 단계로 */
  const handleStep3Next = async () => {
    if (gymId && placedEquipments.length > 0) {
      setLoading(true);
      const mapData = { ...buildMapData(placedEquipments), completedStep: 3 };
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

  /* Step 4: equipment DB 저장 → map_data ID 갱신 → 락커 등록 → 등록 완료 */
  const handleFinish = async () => {
    const zones = lockerZones.filter(
      (z) => z.name.trim() && Number(z.rowCount) > 0 && Number(z.columnCount) > 0
    );

    setLoading(true);
    try {
      // 1) equipment DB 저장: temp ID → 실제 DB ID 매핑 생성
      const tempToRealId = {};
      for (const equip of equipList) {
        const count = Number(equip.count);
        for (let i = 1; i <= count; i++) {
          const name = equip.name;
          const tempId = `temp-${equip.id}-${i}`;
          const placedItem = placedEquipments.find(p => p.equipmentId === tempId);
          const realIds = await createOwnerGymEquipments(
            {
              name,
              type: equip.type,
              count: 1,
              imageUrl: equip.imageUrl
                ? `${BASE_URL}/images/${equip.imageUrl}`
                : "",
              gridX: placedItem?.gridX ?? null,
              gridY: placedItem?.gridY ?? null,
            },
            { gymId }
          );
          if (realIds?.[0]) tempToRealId[tempId] = realIds[0];
        }
      }

      // 2) map_data의 registeredEquipments ID를 실제 DB ID로 교체 후 저장
      if (Object.keys(tempToRealId).length > 0) {
        const currentMapData = buildMapData(placedEquipments);
        const updatedRegistered = (currentMapData.registeredEquipments ?? []).map((re) => ({
          ...re,
          id: tempToRealId[re.id] ?? re.id,
        }));
        await saveOwnerGymMap(
          { ...currentMapData, registeredEquipments: updatedRegistered, completedStep: 3 },
          { gymId }
        ).catch(() => {});
      }

      // 3) 락커 등록
      for (const zone of zones) {
        await createOwnerGymLockerZones(
          {
            name:        zone.name,
            size:        zone.size,
            rowCount:    Number(zone.rowCount),
            columnCount: Number(zone.columnCount),
          },
          { gymId }
        );
      }

      // 4) 헬스장 확정
      await finalizeOwnerGym({ gymId });
      showNotification("헬스장이 등록되었습니다!", "success");
      navigate("/owners");
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
            icons={icons}
          />
        )}
        {activeStep === 2 && (
          <MapStep
            equipment={registeredEquipments.map((re) => {
              const el = equipList.find((e) => e.id === re.equipListId);
              const iconObj = icons.find((ic) => ic.filename === el?.imageUrl);
              return {
                ...re,
                type:     el?.type ?? "",
                category: el?.category ?? "",
                iconUrl:  iconObj ? `${BASE_URL}${iconObj.url}` : "",
              };
            })}
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
