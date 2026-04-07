import { useState, useEffect, useRef, useCallback } from "react";
import { Stage, Layer, Rect, Line } from "react-konva";
import { Box, Button, CircularProgress, TextField, Typography } from "@mui/material";
import SaveIcon from "@mui/icons-material/Save";
import EquipmentLayer from "../gymMap/EquipmentLayer";
import { GRID_SIZE } from "../gymMap/constants";

export default function MapPanel({
  placedItems,
  mapCols,
  mapRows,
  equipments,
  loading,
  saving,
  dropping,
  highlightEquipId,
  onMapColsChange,
  onMapRowsChange,
  onDrop,
  onMove,
  onUpdate,
  onContextMenu,
  onSaveMap,
}) {
  const containerRef = useRef(null);
  const stageRef = useRef(null);
  const [stageSize, setStageSize] = useState({ width: 600, height: 400 });
  const [scale, setScale] = useState(0.75);
  const [pos, setPos] = useState({ x: 16, y: 16 });
  const isPanningRef = useRef(false);
  const panLastPos = useRef(null);
  const hasInitializedView = useRef(false);

  // Canvas resize observer
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() =>
      setStageSize({ width: el.clientWidth, height: el.clientHeight })
    );
    ro.observe(el);
    setStageSize({ width: el.clientWidth, height: el.clientHeight });
    return () => ro.disconnect();
  }, [loading]);

  // 초기 뷰: 로딩 완료 + 컨테이너 크기 측정 후 맵을 캔버스 중앙에 배치
  useEffect(() => {
    if (loading || hasInitializedView.current || stageSize.width < 100) return;
    const initScale = 1.0;
    const mapW = mapCols * GRID_SIZE;
    const mapH = mapRows * GRID_SIZE;
    setScale(initScale);
    // setPos({
    //   x: (stageSize.width  - mapW * initScale) / 2,
    //   y: (stageSize.height - mapH * initScale) / 2,
    // });
    hasInitializedView.current = true;
  }, [loading, stageSize]); // eslint-disable-line react-hooks/exhaustive-deps

  // Pan handlers
  const handleStagePanStart = useCallback((e) => {
    if (e.target === e.currentTarget || e.target.name() === "bg") {
      isPanningRef.current = true;
      panLastPos.current = { x: e.evt.clientX, y: e.evt.clientY };
      document.body.style.cursor = "grabbing";
    }
  }, []);

  const handleStagePanMove = useCallback((e) => {
    if (!isPanningRef.current || !panLastPos.current) return;
    const dx = e.evt.clientX - panLastPos.current.x;
    const dy = e.evt.clientY - panLastPos.current.y;
    panLastPos.current = { x: e.evt.clientX, y: e.evt.clientY };
    setPos((p) => ({ x: p.x + dx, y: p.y + dy }));
  }, []);

  const handleStagePanEnd = useCallback(() => {
    isPanningRef.current = false;
    panLastPos.current = null;
    document.body.style.cursor = "";
  }, []);

  const handleWheel = useCallback((e) => {
    e.evt.preventDefault();
    const stage = stageRef.current;
    if (!stage) return;
    const oldScale = scale;
    const pointer = stage.getPointerPosition();
    const mousePointTo = {
      x: (pointer.x - pos.x) / oldScale,
      y: (pointer.y - pos.y) / oldScale,
    };
    const dir = e.evt.deltaY > 0 ? -1 : 1;
    const newScale = Math.min(3, Math.max(0.3, dir > 0 ? oldScale * 1.1 : oldScale / 1.1));
    setScale(newScale);
    setPos({
      x: pointer.x - mousePointTo.x * newScale,
      y: pointer.y - mousePointTo.y * newScale,
    });
  }, [scale, pos]);

  const handleDragOver = (e) => e.preventDefault();

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    if (!dropping) return;
    const containerRect = containerRef.current.getBoundingClientRect();
    const stageX = e.clientX - containerRect.left;
    const stageY = e.clientY - containerRect.top;
    const worldX = (stageX - pos.x) / scale;
    const worldY = (stageY - pos.y) / scale;
    onDrop({ worldX, worldY, dropping });
  }, [dropping, pos, scale, onDrop]);

  // Grid lines
  const MAP_W = mapCols * GRID_SIZE;
  const MAP_H = mapRows * GRID_SIZE;
  const gridLines = [];
  for (let c = 0; c <= mapCols; c++) {
    const x = c * GRID_SIZE;
    const isMajor = c % 5 === 0;
    gridLines.push(
      <Line key={`v${c}`} points={[x, 0, x, MAP_H]}
        stroke={isMajor ? "#d1d5db" : "#e5e7eb"} strokeWidth={isMajor ? 1 : 0.5} listening={false} />
    );
  }
  for (let r = 0; r <= mapRows; r++) {
    const y = r * GRID_SIZE;
    const isMajor = r % 5 === 0;
    gridLines.push(
      <Line key={`h${r}`} points={[0, y, MAP_W, y]}
        stroke={isMajor ? "#d1d5db" : "#e5e7eb"} strokeWidth={isMajor ? 1 : 0.5} listening={false} />
    );
  }

  return (
    <Box sx={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", overflow: "hidden", bgcolor: "#f5f7fa" }}>
      {/* Map controls header */}
      <Box sx={{
        px: 2, py: 1.2,
        borderBottom: "1px solid #eef2f6",
        bgcolor: "#fff",
        display: "flex", alignItems: "center", gap: 1.5,
        flexShrink: 0,
      }}>
        <Typography variant="caption" color="text.secondary" fontWeight="bold" sx={{ whiteSpace: "nowrap" }}>
          맵 크기
        </Typography>
        <TextField
          size="small" type="number" label="가로(칸)"
          value={mapCols}
          onChange={(e) => onMapColsChange(e.target.value)}
          slotProps={{ htmlInput: { min: 10, max: 50 } }}
          sx={{ width: 82 }}
        />
        <Typography variant="caption" color="text.secondary">×</Typography>
        <TextField
          size="small" type="number" label="세로(칸)"
          value={mapRows}
          onChange={(e) => onMapRowsChange(e.target.value)}
          slotProps={{ htmlInput: { min: 10, max: 40 } }}
          sx={{ width: 82 }}
        />
        <Typography variant="caption" color="text.disabled" sx={{ whiteSpace: "nowrap" }}>
          {(mapCols * GRID_SIZE / 100).toFixed(1)}m × {(mapRows * GRID_SIZE / 100).toFixed(1)}m
        </Typography>
        <Box flex={1} />
        <Typography variant="caption" color="text.disabled" sx={{ whiteSpace: "nowrap", mr: 1 }}>
          {placedItems.length} / {equipments.length} 배치
        </Typography>
        <Button
          variant="contained" size="small"
          startIcon={saving ? <CircularProgress size={14} color="inherit" /> : <SaveIcon />}
          onClick={onSaveMap} disabled={saving || loading}
          sx={{ borderRadius: 2, fontWeight: "bold", whiteSpace: "nowrap", flexShrink: 0 }}
        >
          맵 저장
        </Button>
      </Box>

      {/* Canvas area */}
      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" flex={1}>
          <CircularProgress />
        </Box>
      ) : (
        <Box
          ref={containerRef}
          sx={{ flex: 1, cursor: "grab", position: "relative", overflow: "hidden" }}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onContextMenu={(e) => e.preventDefault()}
        >
          {/* Hint overlay */}
          <Box sx={{
            position: "absolute", top: 10, left: 10, zIndex: 10,
            bgcolor: "rgba(255,255,255,0.88)", px: 1.5, py: 0.5,
            borderRadius: 1.5, border: "1px solid #eef2f6",
            pointerEvents: "none",
          }}>
            <Typography variant="caption" color="text.secondary">
              배경 드래그로 이동 · 휠로 줌 · 우클릭으로 제거
            </Typography>
          </Box>

          <Stage
            ref={stageRef}
            width={stageSize.width}
            height={stageSize.height}
            scaleX={scale} scaleY={scale}
            x={pos.x} y={pos.y}
            onWheel={handleWheel}
            onMouseDown={handleStagePanStart}
            onMouseMove={handleStagePanMove}
            onMouseUp={handleStagePanEnd}
          >
            <Layer>
              <Rect
                x={0} y={0} width={MAP_W} height={MAP_H}
                fill="#fff" name="bg"
                shadowColor="#000" shadowBlur={8} shadowOpacity={0.06}
                shadowOffsetX={2} shadowOffsetY={2}
              />
              {gridLines}
            </Layer>
            <EquipmentLayer
              equipment={placedItems}
              tool="select"
              selectedIds={[]}
              highlightEquipId={highlightEquipId}
              onSelect={() => {}}
              onMove={onMove}
              onUpdate={onUpdate}
              onRemove={() => {}}
              onContextMenu={onContextMenu}
            />
          </Stage>

          {/* Empty state hint */}
          {placedItems.length === 0 && (
            <Box sx={{
              position: "absolute", inset: 0,
              display: "flex", alignItems: "center", justifyContent: "center",
              pointerEvents: "none",
            }}>
              <Typography variant="caption" color="text.disabled" sx={{
                bgcolor: "rgba(255,255,255,0.85)", px: 2, py: 1, borderRadius: 2,
              }}>
                왼쪽 기구를 드래그하여 맵에 배치하세요
              </Typography>
            </Box>
          )}
        </Box>
      )}
    </Box>
  );
}
