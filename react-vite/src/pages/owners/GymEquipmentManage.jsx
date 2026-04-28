import React, { useState, useEffect, useCallback } from "react";
import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  List,
  Paper,
  Typography,
} from "@mui/material";
import { useParams } from "react-router-dom";
import FitnessCenterOutlinedIcon from "@mui/icons-material/FitnessCenterOutlined";
import FitnessCenterIcon from "@mui/icons-material/FitnessCenter";
import { useNotification } from "../../context/NotificationContext";
import {
  getOwnerGymEquipments,
  getEquipmentIcons,
  getOwnerGymMap,
  saveOwnerGymMap,
  updateOwnerGymEquipmentStatus,
} from "../../api/owner";
import {
  createOwnerGymEquipments,
  updateOwnerGymEquipment,
  deleteOwnerGymEquipment,
} from "../../api/equipment";
import { GRID_SIZE } from "../../components/owners/gymMap/constants";
import AddEquipmentForm from "../../components/owners/gymEquipmentManage/AddEquipmentForm";
import EquipmentListItem from "../../components/owners/gymEquipmentManage/EquipmentListItem";
import MapPanel from "../../components/owners/gymEquipmentManage/MapPanel";
import MapContextMenu from "../../components/owners/gymEquipmentManage/MapContextMenu";

import { API_BASE_URL } from "../../api-config";

const toMapStatus = (s) =>
  s === "MAINTENANCE" ? "maintenance" : s === "OK" || !s ? "normal" : "unavailable";

export default function GymEquipmentManage() {
  const { gymId } = useParams();
  const { showNotification } = useNotification();

  const [equipments, setEquipments] = useState([]);
  const [icons, setIcons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [saving, setSaving] = useState(false);

  const [placedItems, setPlacedItems] = useState([]);
  const [mapCols, setMapCols] = useState(20);
  const [mapRows, setMapRows] = useState(15);
  const [dropping, setDropping] = useState(null);
  const [contextMenu, setContextMenu] = useState(null);
  const [deleteTargetId, setDeleteTargetId] = useState(null);
  const [selectedEquipId, setSelectedEquipId] = useState(null);

  useEffect(() => {
    Promise.all([
      getOwnerGymEquipments({ gymId }),
      getEquipmentIcons(),
      getOwnerGymMap({ gymId }).catch(() => null),
    ])
      .then(([equips, iconData, mapData]) => {
        const equipList = (equips ?? []).map((eq) => ({
          ...eq,
          imageUrl: eq.imageUrl
            ? (eq.imageUrl.startsWith("http") ? eq.imageUrl : `${API_BASE_URL}${eq.imageUrl}`)
            : "",
        }));
        setEquipments(equipList);
        setIcons(
          (iconData ?? []).map((item) => ({
            filename: item.filename,
            url: item.url.startsWith("http") ? item.url : `${API_BASE_URL}${item.url}`,
            label: item.type,
            category: item.category ?? "MACHINE",
          }))
        );

        if (mapData?.mapWidth) {
          setMapCols(mapData.mapWidth || 20);
          setMapRows(mapData.mapHeight || 15);
        }

        if (mapData?.equipments?.length > 0) {
          const placed = mapData.equipments
            .filter((re) => re.gridX !== undefined && re.gridY !== undefined)
            .map((re) => {
              const eq = equipList.find((e) => e.id === re.id);
              return {
                id: `p-${re.id}`,
                equipmentId: re.id,
                name: eq?.name ?? "",
                type: eq?.type ?? "",
                category: eq?.category ?? "",
                iconUrl: eq?.imageUrl ?? "",
                gridX: re.gridX,
                gridY: re.gridY,
                spanW: re.spanW ?? 2,
                spanH: re.spanH ?? 2,
                status: toMapStatus(eq?.status),
              };
            });
          setPlacedItems(placed);
        }
      })
      .catch(() => showNotification("데이터를 불러오지 못했습니다.", "error"))
      .finally(() => setLoading(false));
  }, [gymId]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleMapColsChange = (val) => {
    const newCols = Math.max(10, Math.min(50, Number(val) || 10));
    setMapCols(newCols);
    setPlacedItems((prev) => prev.filter((p) => p.gridX + (p.spanW ?? 1) <= newCols));
  };

  const handleMapRowsChange = (val) => {
    const newRows = Math.max(10, Math.min(40, Number(val) || 10));
    setMapRows(newRows);
    setPlacedItems((prev) => prev.filter((p) => p.gridY + (p.spanH ?? 1) <= newRows));
  };

  const handleDrop = useCallback(({ worldX, worldY, dropping: item }) => {
    const gridX = Math.round(worldX / GRID_SIZE);
    const gridY = Math.round(worldY / GRID_SIZE);

    if (gridX < 0 || gridX >= mapCols || gridY < 0 || gridY >= mapRows) return;
    if (placedItems.some((p) => p.gridX === gridX && p.gridY === gridY)) return;
    if (placedItems.some((p) => p.equipmentId === item.id)) return;

    setPlacedItems((prev) => [
      ...prev,
      {
        id: `p-${Date.now()}`,
        equipmentId: item.id,
        name: item.name,
        type: item.type,
        category: item.category ?? "",
        iconUrl: item.iconUrl ?? "",
        gridX,
        gridY,
        spanW: 2,
        spanH: 2,
        status: "normal",
      },
    ]);
    setDropping(null);
  }, [placedItems, mapCols, mapRows]);

  const handleMove = useCallback((id, gx, gy) => {
    setPlacedItems((prev) => prev.map((e) => e.id === id ? { ...e, gridX: gx, gridY: gy } : e));
  }, []);

  const handleUpdate = useCallback((id, updates) => {
    setPlacedItems((prev) => prev.map((e) => e.id === id ? { ...e, ...updates } : e));
  }, []);

  const handleContextMenu = useCallback((item, x, y) => {
    const eq = equipments.find((e) => e.id === item.equipmentId);
    setContextMenu({ item: { ...item, apiStatus: eq?.status ?? "OK" }, x, y });
  }, [equipments]);

  const handleRemoveFromMap = useCallback((id) => {
    setPlacedItems((prev) => prev.filter((e) => e.id !== id));
    setContextMenu(null);
  }, []);

  const handleSaveMap = async () => {
    setSaving(true);
    const mapData = {
      mapWidth: mapCols,
      mapHeight: mapRows,
      equipments: placedItems.map((p) => ({
        id: p.equipmentId,
        gridX: p.gridX,
        gridY: p.gridY,
        spanW: p.spanW ?? 2,
        spanH: p.spanH ?? 2,
      })),
    };
    try {
      await saveOwnerGymMap(mapData, { gymId });
      showNotification("맵이 저장되었습니다.", "success");
    } catch {
      showNotification("저장에 실패했습니다.", "error");
    } finally {
      setSaving(false);
    }
  };

<<<<<<< HEAD
=======
  // TODO: owner쪽 apicontroller 분리, 프론트 경로 단순화
  // TODO: 운동 기록 AI 요약기능 추가?
  // TODO: Redis, PostgreSQL으로 DB 변경
  


>>>>>>> origin/main
  /* ── Status Update ── */
  const handleStatusUpdate = async (equipId, newStatus) => {
    try {
      await updateOwnerGymEquipmentStatus({ status: newStatus }, { equipmentId: equipId });
      setEquipments((p) => p.map((e) => e.id === equipId ? { ...e, status: newStatus } : e));
      setPlacedItems((p) => p.map((e) =>
        e.equipmentId === equipId ? { ...e, status: toMapStatus(newStatus) } : e
      ));
      showNotification("기구 상태가 변경되었습니다.", "success");
    } catch {
      showNotification("상태 변경에 실패했습니다.", "error");
    }
  };

  /* ── Add ── */
  const handleAdd = async (addForm) => {
    setSubmitting(true);
    try {
      const icon = icons.find((i) => i.filename === addForm.imageUrl);
      const name = icon?.label ?? addForm.imageUrl;
      const count = Number(addForm.count);
      const fullImageUrl = `/images/${addForm.imageUrl}`;
      const newEquips = [];
      for (let i = 1; i <= count; i++) {
        const ids = await createOwnerGymEquipments(
          { name, type: addForm.type, count: 1, imageUrl: fullImageUrl, gridX: null, gridY: null },
          { gymId }
        );
        if (ids?.[0]) {
          newEquips.push({ id: ids[0], name, type: addForm.type, category: addForm.category, imageUrl: `${API_BASE_URL}${fullImageUrl}` });
        }
      }
      setEquipments((p) => [...p, ...newEquips]);
      showNotification(`기구 ${count}개가 추가되었습니다.`, "success");
      return true;
    } catch {
      showNotification("기구 추가에 실패했습니다.", "error");
      return false;
    } finally {
      setSubmitting(false);
    }
  };

  /* ── Edit ── */
  const handleEditSave = async (equipId, editForm) => {
    setSubmitting(true);
    try {
      const fullImageUrl = editForm.imageUrl
        ? `/images/${editForm.imageUrl}`
        : (equipments.find((e) => e.id === equipId)?.imageUrl ?? "");
      const updated = await updateOwnerGymEquipment(
        { name: editForm.name, type: editForm.type, imageUrl: fullImageUrl },
        { gymId, equipmentId: equipId }
      );
      setEquipments((p) => p.map((e) => (e.id === equipId ? {
        ...e, ...updated,
        imageUrl: updated.imageUrl
          ? (updated.imageUrl.startsWith("http") ? updated.imageUrl : `${API_BASE_URL}${updated.imageUrl}`)
          : e.imageUrl,
      } : e)));
      showNotification("기구가 수정되었습니다.", "success");
      return true;
    } catch {
      showNotification("기구 수정에 실패했습니다.", "error");
      return false;
    } finally {
      setSubmitting(false);
    }
  };

  /* ── Delete ── */
  const handleDeleteConfirm = async () => {
    if (!deleteTargetId) return;
    setSubmitting(true);
    try {
      await deleteOwnerGymEquipment({ gymId, equipmentId: deleteTargetId });
      setEquipments((p) => p.filter((e) => e.id !== deleteTargetId));
      setPlacedItems((p) => p.filter((e) => e.equipmentId !== deleteTargetId));
      showNotification("기구가 삭제되었습니다.", "success");
    } catch {
      showNotification("기구 삭제에 실패했습니다.", "error");
    } finally {
      setDeleteTargetId(null);
      setSubmitting(false);
    }
  };

  const isPlacedOnMap = (equipId) => placedItems.some((p) => p.equipmentId === equipId);

  return (
    <Box sx={{ display: "flex", height: "100%", overflow: "hidden" }}
      onClick={() => { setContextMenu(null); setSelectedEquipId(null); }}>

      {/* ── Left Panel: Equipment Management ── */}
      <Box sx={{
        width: 360, flexShrink: 0,
        display: "flex", flexDirection: "column",
        borderRight: "1px solid #eef2f6",
        bgcolor: "#fff", overflow: "hidden",
      }}>
        {/* Header + Add Section */}
        <Box sx={{ px: 2, pt: 2.5, pb: 2, borderBottom: "1px solid #f0f0f0", flexShrink: 0 }}>
          <Box display="flex" alignItems="center" gap={1} mb={2.5}>
            <FitnessCenterOutlinedIcon sx={{ color: "#f57c00", fontSize: 22 }} />
            <Typography variant="h6" fontWeight="bold">기구·맵 관리</Typography>
          </Box>
          <AddEquipmentForm
            icons={icons}
            submitting={submitting}
            onAdd={handleAdd}
          />
        </Box>

        {/* Equipment List (scrollable) */}
        <Box sx={{ flex: 1, overflowY: "auto" }}>
          {loading ? (
            <Box display="flex" justifyContent="center" mt={8}>
              <CircularProgress />
            </Box>
          ) : (
            <>
              <Box sx={{ px: 2, py: 1.5 }}>
                <Typography variant="caption" color="text.secondary" fontWeight="bold">
                  등록된 기구 {equipments.length}개
                </Typography>
                <Typography variant="caption" color="text.disabled" display="block" sx={{ mt: 0.25 }}>
                  항목을 드래그하여 오른쪽 맵에 배치하세요
                </Typography>
              </Box>

              {equipments.length === 0 ? (
                <Box sx={{ textAlign: "center", py: 5, color: "text.disabled" }}>
                  <FitnessCenterIcon sx={{ fontSize: 40, opacity: 0.25, mb: 1 }} />
                  <Typography variant="caption" display="block">등록된 기구가 없습니다.</Typography>
                </Box>
              ) : (
                <Paper elevation={0} sx={{ mx: 1.5, mb: 1.5, border: "1px solid #eef2f6", borderRadius: 2, overflow: "hidden" }}>
                  <List dense disablePadding>
                    {equipments.map((equip, idx) => (
                      <React.Fragment key={equip.id}>
                        <EquipmentListItem
                          equip={equip}
                          icons={icons}
                          isOnMap={isPlacedOnMap(equip.id)}
                          isSelected={selectedEquipId === equip.id}
                          submitting={submitting}
                          showDivider={idx > 0}
                          onEditSave={handleEditSave}
                          onDelete={setDeleteTargetId}
                          onSelect={(id) => setSelectedEquipId((prev) => prev === id ? null : id)}
                          onStatusChange={handleStatusUpdate}
                          onDragStart={(eq) => setDropping({
                            id: eq.id,
                            name: eq.name,
                            type: eq.type,
                            category: eq.category,
                            iconUrl: eq.imageUrl ?? "",
                          })}
                        />
                      </React.Fragment>
                    ))}
                  </List>
                </Paper>
              )}
            </>
          )}
        </Box>
      </Box>

      {/* ── Right Panel: Editable Map ── */}
      <MapPanel
        placedItems={placedItems}
        mapCols={mapCols}
        mapRows={mapRows}
        equipments={equipments}
        loading={loading}
        saving={saving}
        dropping={dropping}
        highlightEquipId={selectedEquipId}
        onMapColsChange={handleMapColsChange}
        onMapRowsChange={handleMapRowsChange}
        onDrop={handleDrop}
        onMove={handleMove}
        onUpdate={handleUpdate}
        onContextMenu={handleContextMenu}
        onSaveMap={handleSaveMap}
      />

      {/* Right-click context menu */}
      <MapContextMenu
        contextMenu={contextMenu}
        onRemove={handleRemoveFromMap}
        onStatusChange={handleStatusUpdate}
        onClose={() => setContextMenu(null)}
      />

      {/* Delete Confirm Dialog */}
      <Dialog open={Boolean(deleteTargetId)} onClose={() => setDeleteTargetId(null)}>
        <DialogTitle sx={{ fontWeight: "bold" }}>기구 삭제</DialogTitle>
        <DialogContent>
          <Typography>이 기구를 삭제하시겠습니까?</Typography>
          {deleteTargetId && isPlacedOnMap(deleteTargetId) && (
            <Typography variant="body2" color="warning.main" mt={1}>
              맵에 배치된 기구입니다. 삭제 시 맵에서도 제거됩니다.
            </Typography>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDeleteTargetId(null)} variant="outlined">취소</Button>
          <Button onClick={handleDeleteConfirm} variant="contained" color="error" disabled={submitting}>
            삭제
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
