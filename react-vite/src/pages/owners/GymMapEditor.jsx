import { useEffect, useRef, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  AppBar, Toolbar, Typography, IconButton, Box, Button,
  CircularProgress,
  Dialog, DialogTitle, DialogContent, DialogActions,
  List, ListItem, ListItemButton, ListItemText,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ImageIcon from "@mui/icons-material/Image";

import { useMapEditor, buildMapData } from "../../hooks/useMapEditor";
import { getOwnerGymMap, saveOwnerGymMap } from "../../api/owner";
import { getEquipments } from "../../api/gym";
import { useNotification } from "../../context/NotificationContext";
import { TOOLS, ZONE_TYPES } from "../../components/owners/gymMap/constants";
import MapCanvas from "../../components/owners/gymMap/MapCanvas";
import SidePanel from "../../components/owners/gymMap/SidePanel";

export default function GymMapEditor() {
  const { gymId } = useParams();
  const navigate  = useNavigate();
  const { showNotification } = useNotification();
  const stageRef = useRef(null);

  const {
    state,
    setTool, select,
    addZone, updateZone, deleteZones,
    addWall, deleteWalls,
    addPillar, deletePillars,
    placeEquipment, moveEquipment, updateEquipment, removeEquipment,
    undo, redo, canUndo, canRedo,
    loadMap, setSaveStatus,
  } = useMapEditor(gymId);

  const [loading, setLoading] = useState(true);
  const [equipmentList, setEquipmentList] = useState([]);
  const [loadingEquipments, setLoadingEquipments] = useState(true);
  const [droppingEquipment, setDroppingEquipment] = useState(null);
  const [contextMenu, setContextMenu] = useState(null); // { item, x, y }

  // 존 타입 다이얼로그
  const [zoneDialog, setZoneDialog] = useState(null);

  // ─── 초기 데이터 로드 ─────────────────────────────
  useEffect(() => {
    // 맵 로드
    const localKey = `gym-map-${gymId}`;
    const localData = localStorage.getItem(localKey);

    getOwnerGymMap({ gymId })
      .then((data) => {
        if (data && (data.zones?.length || data.walls?.length || data.equipment?.length)) {
          loadMap(data);
        } else if (localData) {
          loadMap(JSON.parse(localData));
        }
      })
      .catch(() => {
        if (localData) {
          loadMap(JSON.parse(localData));
          showNotification("로컬 임시저장 데이터를 불러왔습니다.", "info");
        }
      })
      .finally(() => setLoading(false));

    // 기구 목록 로드
    getEquipments({ gymId })
      .then((list) => setEquipmentList(Array.isArray(list) ? list : []))
      .catch(() => showNotification("기구 목록을 불러오지 못했습니다.", "warning"))
      .finally(() => setLoadingEquipments(false));
  }, [gymId]);

  // ─── 키보드 단축키 (도구) ─────────────────────────
  useEffect(() => {
    const onKey = (e) => {
      if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") return;
      const map = { v: TOOLS.SELECT, r: TOOLS.RECT, w: TOOLS.WALL, p: TOOLS.PILLAR };
      if (map[e.key.toLowerCase()]) setTool(map[e.key.toLowerCase()]);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [setTool]);

  // ─── 선택 항목 삭제 핸들러 ────────────────────────
  const handleDeleteSelected = useCallback((ids) => {
    const zoneIds    = ids.filter((id) => state.zones.some((z) => z.id === id));
    const wallIds    = ids.filter((id) => state.walls.some((w) => w.id === id));
    const pillarIds  = ids.filter((id) => state.pillars.some((p) => p.id === id));
    if (zoneIds.length)   deleteZones(zoneIds);
    if (wallIds.length)   deleteWalls(wallIds);
    if (pillarIds.length) deletePillars(pillarIds);
    select([]);
  }, [state, deleteZones, deleteWalls, deletePillars, select]);

  // ─── 저장 ─────────────────────────────────────────
  const handleSave = useCallback(async () => {
    setSaveStatus("saving");
    const mapData = buildMapData(state, gymId);
    try {
      await saveOwnerGymMap(mapData, { gymId });
      localStorage.setItem(`gym-map-${gymId}`, JSON.stringify(mapData));
      setSaveStatus("saved", Date.now());
      showNotification("맵이 저장되었습니다.", "success");
    } catch {
      setSaveStatus("unsaved");
      showNotification("저장에 실패했습니다.", "error");
    }
  }, [state, gymId, setSaveStatus, showNotification]);

  // ─── PNG 내보내기 ─────────────────────────────────
  const handleExportPng = () => {
    const stage = stageRef.current;
    if (!stage) return;
    const uri = stage.toDataURL({ pixelRatio: 2 });
    const a = document.createElement("a");
    a.href = uri;
    a.download = `gym-map-${gymId}.png`;
    a.click();
  };

  // ─── 기구 드롭 ────────────────────────────────────
  const handleDropEquipment = useCallback((equip, gridX, gridY) => {
    const alreadyPlaced = state.equipment.some(
      (e) => e.gridX === gridX && e.gridY === gridY
    );
    if (alreadyPlaced) {
      showNotification("이미 기구가 배치된 위치입니다.", "warning");
      return;
    }
    placeEquipment({
      id:          `placed-${Date.now()}`,
      equipmentId: equip.equipmentId ?? equip.id,
      name:        equip.name,
      type:        equip.type,
      gridX, gridY,
      rotation:    0,
      status:      "normal",
    });
    setDroppingEquipment(null);
  }, [state.equipment, placeEquipment, showNotification]);

  // ─── 존 추가 후 타입 선택 다이얼로그 ─────────────
  const handleAddZone = useCallback((zone) => {
    addZone(zone);
    setZoneDialog(zone.id);
  }, [addZone]);

  const handleZoneTypeSelect = useCallback((type) => {
    const z = state.zones.find((z) => z.id === zoneDialog);
    if (z) {
      const meta = ZONE_TYPES.find((t) => t.value === type);
      updateZone({ ...z, type, name: meta?.label ?? type });
    }
    setZoneDialog(null);
  }, [state.zones, zoneDialog, updateZone]);

  const placedEquipmentIds = state.equipment.map((e) => e.equipmentId);

  if (loading) {
    return (
      <Box sx={{ position: "fixed", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ position: "fixed", inset: 0, display: "flex", flexDirection: "column", overflow: "hidden" }}>
      {/* 헤더 */}
      <AppBar position="static" color="inherit" elevation={0} sx={{ borderBottom: "1px solid #e5e7eb", flexShrink: 0 }}>
        <Toolbar variant="dense">
          <IconButton edge="start" size="small" onClick={() => navigate("/owners")} sx={{ mr: 1 }}>
            <ArrowBackIcon fontSize="small" />
          </IconButton>
          <Typography variant="subtitle1" fontWeight="bold" sx={{ flexGrow: 1 }}>
            헬스장 맵 편집
          </Typography>
          <Button
            size="small"
            startIcon={<ImageIcon />}
            onClick={handleExportPng}
            sx={{ mr: 1, borderRadius: 2 }}
          >
            PNG
          </Button>
        </Toolbar>
      </AppBar>

      {/* 본문 */}
      <Box sx={{ flex: 1, display: "flex", overflow: "hidden", minHeight: 0 }}>
        {/* 사이드 패널 */}
        <SidePanel
          tool={state.tool}
          onToolChange={setTool}
          equipmentList={equipmentList}
          loadingEquipments={loadingEquipments}
          placedEquipmentIds={placedEquipmentIds}
          onDragStart={setDroppingEquipment}
          undo={undo} redo={redo} canUndo={canUndo} canRedo={canRedo}
          onSave={handleSave}
          saveStatus={state.saveStatus}
          lastSavedAt={state.lastSavedAt}
        />

        {/* 캔버스 */}
        <MapCanvas
          stageRef={stageRef}
          mapMeta={state.mapMeta}
          tool={state.tool}
          zones={state.zones}
          walls={state.walls}
          pillars={state.pillars}
          equipment={state.equipment}
          selectedIds={state.selectedIds}
          onAddZone={handleAddZone}
          onUpdateZone={updateZone}
          onDeleteSelected={handleDeleteSelected}
          onAddWall={addWall}
          onDeleteWalls={deleteWalls}
          onAddPillar={addPillar}
          onDeletePillars={deletePillars}
          onPlaceEquipment={placeEquipment}
          onMoveEquipment={moveEquipment}
          onUpdateEquipment={updateEquipment}
          onRemoveEquipment={removeEquipment}
          onSelect={select}
          droppingEquipment={droppingEquipment}
          onDropEquipment={handleDropEquipment}
          onEquipmentContextMenu={(item, x, y) => setContextMenu({ item, x, y })}
        />
      </Box>

      {/* 기구 컨텍스트 메뉴 (Stage 밖 HTML) */}
      {contextMenu && (
        <div
          style={{
            position: "fixed",
            top: contextMenu.y,
            left: contextMenu.x,
            background: "#fff",
            border: "1px solid #e5e7eb",
            borderRadius: 8,
            boxShadow: "0 4px 16px rgba(0,0,0,0.12)",
            zIndex: 9999,
            minWidth: 160,
          }}
          onMouseLeave={() => setContextMenu(null)}
        >
          {[
            {
              label: "기구 정보 보기",
              action: () => {
                alert(`기구: ${contextMenu.item.name}\n위치: (${contextMenu.item.gridX}, ${contextMenu.item.gridY})`);
                setContextMenu(null);
              },
            },
            {
              label: contextMenu.item.status === "maintenance" ? "정상으로 변경" : "점검중으로 변경",
              action: () => {
                updateEquipment(contextMenu.item.id, {
                  status: contextMenu.item.status === "maintenance" ? "normal" : "maintenance",
                });
                setContextMenu(null);
              },
            },
            {
              label: contextMenu.item.status === "unavailable" ? "사용 가능으로 변경" : "사용 불가로 변경",
              action: () => {
                updateEquipment(contextMenu.item.id, {
                  status: contextMenu.item.status === "unavailable" ? "normal" : "unavailable",
                });
                setContextMenu(null);
              },
            },
            {
              label: "배치 제거",
              action: () => { removeEquipment(contextMenu.item.id); setContextMenu(null); },
              danger: true,
            },
          ].map((m) => (
            <div
              key={m.label}
              onClick={m.action}
              style={{
                padding: "8px 14px",
                cursor: "pointer",
                fontSize: 13,
                color: m.danger ? "#ef4444" : "#374151",
                borderBottom: "1px solid #f3f4f6",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = "#f9fafb"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = ""; }}
            >
              {m.label}
            </div>
          ))}
        </div>
      )}

      {/* 존 타입 선택 다이얼로그 */}
      <Dialog open={!!zoneDialog} onClose={() => setZoneDialog(null)} maxWidth="xs" fullWidth>
        <DialogTitle>구역 종류 선택</DialogTitle>
        <DialogContent dividers sx={{ p: 0 }}>
          <List disablePadding>
            {ZONE_TYPES.map((t) => (
              <ListItem key={t.value} disablePadding>
                <ListItemButton onClick={() => handleZoneTypeSelect(t.value)}>
                  <Box
                    sx={{ width: 12, height: 12, borderRadius: 0.5, bgcolor: t.color, border: `1px solid ${t.border}`, mr: 1.5, flexShrink: 0 }}
                  />
                  <ListItemText primary={t.label} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setZoneDialog(null)} size="small">취소</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
