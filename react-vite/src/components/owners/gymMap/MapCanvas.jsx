import { useRef, useEffect, useState, useCallback } from "react";
import { Stage, Layer, Line, Rect } from "react-konva";
import { Box, Typography } from "@mui/material";
import { GRID_SIZE, TOOLS } from "./constants";
import RoomLayer from "./RoomLayer";
import EquipmentLayer from "./EquipmentLayer";

const MIN_SCALE = 0.5;
const MAX_SCALE = 3;

export default function MapCanvas({
  mapMeta,
  tool,
  zones, walls, pillars, equipment,
  selectedIds,
  onAddZone, onUpdateZone, onDeleteSelected,
  onAddWall, onDeleteWalls,
  onAddPillar, onDeletePillars,
  onPlaceEquipment, onMoveEquipment, onUpdateEquipment, onRemoveEquipment,
  onSelect,
  stageRef,
  droppingEquipment,
  onDropEquipment,
  onEquipmentContextMenu,
}) {
  const containerRef = useRef(null);
  const [stageSize, setStageSize] = useState({ width: 800, height: 600 });
  const [scale, setScale] = useState(1);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [spaceDown, setSpaceDown] = useState(false);
  const lastPos = useRef(null);

  const totalW = mapMeta.width  * GRID_SIZE;
  const totalH = mapMeta.height * GRID_SIZE;

  // 컨테이너 크기 감지
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      setStageSize({ width: el.clientWidth, height: el.clientHeight });
    });
    ro.observe(el);
    setStageSize({ width: el.clientWidth, height: el.clientHeight });
    return () => ro.disconnect();
  }, []);

  // 스페이스바 감지
  useEffect(() => {
    const down = (e) => { if (e.code === "Space") { e.preventDefault(); setSpaceDown(true); } };
    const up   = (e) => { if (e.code === "Space") setSpaceDown(false); };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => { window.removeEventListener("keydown", down); window.removeEventListener("keyup", up); };
  }, []);

  // Delete 키
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Delete" || e.key === "Backspace") {
        if (selectedIds.length > 0) onDeleteSelected(selectedIds);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selectedIds, onDeleteSelected]);

  // 마우스 휠 줌
  const handleWheel = useCallback((e) => {
    e.evt.preventDefault();
    const stage = stageRef.current;
    const oldScale = scale;
    const pointer = stage.getPointerPosition();
    const mousePointTo = {
      x: (pointer.x - pos.x) / oldScale,
      y: (pointer.y - pos.y) / oldScale,
    };
    const direction = e.evt.deltaY > 0 ? -1 : 1;
    const factor = 1.1;
    const newScale = Math.min(MAX_SCALE, Math.max(MIN_SCALE, direction > 0 ? oldScale * factor : oldScale / factor));
    setScale(newScale);
    setPos({
      x: pointer.x - mousePointTo.x * newScale,
      y: pointer.y - mousePointTo.y * newScale,
    });
  }, [scale, pos, stageRef]);

  // 패닝
  const handleMouseDown = useCallback((e) => {
    const isMiddle = e.evt.button === 1;
    if (spaceDown || isMiddle) {
      setIsPanning(true);
      lastPos.current = { x: e.evt.clientX, y: e.evt.clientY };
      e.evt.preventDefault();
    }
  }, [spaceDown]);

  const handleMouseMove = useCallback((e) => {
    const stage = stageRef.current;
    const pointer = stage.getPointerPosition();
    const mx = (pointer.x - pos.x) / scale;
    const my = (pointer.y - pos.y) / scale;
    setMousePos({ x: Math.round(mx / GRID_SIZE * 10) / 10, y: Math.round(my / GRID_SIZE * 10) / 10 });

    if (isPanning && lastPos.current) {
      const dx = e.evt.clientX - lastPos.current.x;
      const dy = e.evt.clientY - lastPos.current.y;
      setPos((p) => ({ x: p.x + dx, y: p.y + dy }));
      lastPos.current = { x: e.evt.clientX, y: e.evt.clientY };
    }
  }, [isPanning, pos, scale, stageRef]);

  const handleMouseUp = useCallback(() => {
    setIsPanning(false);
    lastPos.current = null;
  }, []);

  // HTML5 드래그앤드롭 수신 (사이드패널 → 캔버스)
  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
  };

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    if (!droppingEquipment) return;
    const stage = stageRef.current;
    if (!stage) return;
    const containerRect = containerRef.current.getBoundingClientRect();
    const stageX = e.clientX - containerRect.left;
    const stageY = e.clientY - containerRect.top;
    const worldX = (stageX - pos.x) / scale;
    const worldY = (stageY - pos.y) / scale;
    const gridX = Math.round(worldX / GRID_SIZE);
    const gridY = Math.round(worldY / GRID_SIZE);
    onDropEquipment(droppingEquipment, gridX, gridY);
  }, [droppingEquipment, pos, scale, stageRef, onDropEquipment]);

  // 격자 그리기
  const gridLines = [];
  const cols = Math.floor(stageSize.width / scale / GRID_SIZE) + 2;
  const rows = Math.floor(stageSize.height / scale / GRID_SIZE) + 2;
  const startCol = Math.floor(-pos.x / scale / GRID_SIZE) - 1;
  const startRow = Math.floor(-pos.y / scale / GRID_SIZE) - 1;

  for (let c = startCol; c < startCol + cols; c++) {
    const x = c * GRID_SIZE;
    if (x < 0 || x > totalW) continue;
    const isMajor = c % 5 === 0;
    gridLines.push(
      <Line key={`v${c}`} points={[x, 0, x, totalH]}
        stroke={isMajor ? "#d1d5db" : "#e5e7eb"} strokeWidth={isMajor ? 1 : 0.5} />
    );
  }
  for (let r = startRow; r < startRow + rows; r++) {
    const y = r * GRID_SIZE;
    if (y < 0 || y > totalH) continue;
    const isMajor = r % 5 === 0;
    gridLines.push(
      <Line key={`h${r}`} points={[0, y, totalW, y]}
        stroke={isMajor ? "#d1d5db" : "#e5e7eb"} strokeWidth={isMajor ? 1 : 0.5} />
    );
  }

  const cursor = (spaceDown || isPanning) ? "grabbing" : (tool === TOOLS.SELECT ? "default" : "crosshair");

  return (
    <Box ref={containerRef} sx={{ flex: 1, position: "relative", overflow: "hidden", bgcolor: "#f9fafb" }}
      onDragOver={handleDragOver} onDrop={handleDrop}>
      <Stage
        ref={stageRef}
        width={stageSize.width}
        height={stageSize.height}
        scaleX={scale} scaleY={scale}
        x={pos.x} y={pos.y}
        style={{ cursor }}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      >
        {/* 배경 */}
        <Layer>
          <Rect x={0} y={0} width={totalW} height={totalH} fill="#ffffff"
            shadowColor="#000" shadowBlur={8} shadowOpacity={0.06} shadowOffsetX={2} shadowOffsetY={2} />
          {gridLines}
        </Layer>

        {/* 구획 레이어 */}
        <RoomLayer
          tool={tool}
          zones={zones} walls={walls} pillars={pillars}
          selectedIds={selectedIds}
          onAddZone={onAddZone} onUpdateZone={onUpdateZone}
          onAddWall={onAddWall}
          onAddPillar={onAddPillar}
          onSelect={onSelect}
          stageRef={stageRef}
          scale={scale} stagePos={pos}
          containerRef={containerRef}
        />

        {/* 기구 레이어 */}
        <EquipmentLayer
          equipment={equipment}
          tool={tool}
          selectedIds={selectedIds}
          onSelect={onSelect}
          onMove={onMoveEquipment}
          onUpdate={onUpdateEquipment}
          onRemove={onRemoveEquipment}
          onContextMenu={onEquipmentContextMenu}
        />
      </Stage>

      {/* 상태바 */}
      <Box sx={{
        position: "absolute", bottom: 8, right: 8,
        bgcolor: "rgba(0,0,0,0.55)", color: "#fff",
        px: 1.5, py: 0.5, borderRadius: 1,
        display: "flex", gap: 2, alignItems: "center",
        fontSize: 12, pointerEvents: "none",
      }}>
        <Typography variant="caption" sx={{ color: "inherit" }}>
          줌 {Math.round(scale * 100)}%
        </Typography>
        <Typography variant="caption" sx={{ color: "inherit" }}>
          {mousePos.x}m, {mousePos.y}m
        </Typography>
      </Box>
    </Box>
  );
}
