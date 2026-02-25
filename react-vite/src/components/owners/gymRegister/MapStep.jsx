import { useRef, useEffect, useState, useCallback } from "react";
import { Stage, Layer, Rect, Line } from "react-konva";
import { Box, Paper, Typography, Stack, Chip } from "@mui/material";
import { GRID_SIZE, EQUIP_COLORS, EQUIP_ICONS } from "../gymMap/constants";
import EquipmentLayer from "../gymMap/EquipmentLayer";

const MAP_COLS = 20;
const MAP_ROWS = 15;
const MAP_W = MAP_COLS * GRID_SIZE;
const MAP_H = MAP_ROWS * GRID_SIZE;

export default function MapStep({ equipment, onPlacedChange }) {
  const containerRef = useRef(null);
  const stageRef = useRef(null);
  const [stageSize, setStageSize] = useState({ width: 600, height: 420 });
  const [scale, setScale] = useState(0.75);
  const [pos, setPos] = useState({ x: 16, y: 16 });
  const [placed, setPlaced] = useState([]);
  const [dropping, setDropping] = useState(null);
  const [contextMenu, setContextMenu] = useState(null); // { item, x, y }

  // 컨테이너 크기 감지
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() =>
      setStageSize({ width: el.clientWidth, height: el.clientHeight })
    );
    ro.observe(el);
    setStageSize({ width: el.clientWidth, height: el.clientHeight });
    return () => ro.disconnect();
  }, []);

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
    const dir = e.evt.deltaY > 0 ? -1 : 1;
    const newScale = Math.min(3, Math.max(0.3, dir > 0 ? oldScale * 1.1 : oldScale / 1.1));
    setScale(newScale);
    setPos({
      x: pointer.x - mousePointTo.x * newScale,
      y: pointer.y - mousePointTo.y * newScale,
    });
  }, [scale, pos]);

  // HTML5 드롭 처리
  const handleDragOver = (e) => e.preventDefault();

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    if (!dropping) return;
    const containerRect = containerRef.current.getBoundingClientRect();
    const stageX = e.clientX - containerRect.left;
    const stageY = e.clientY - containerRect.top;
    const worldX = (stageX - pos.x) / scale;
    const worldY = (stageY - pos.y) / scale;
    const gridX = Math.round(worldX / GRID_SIZE);
    const gridY = Math.round(worldY / GRID_SIZE);

    if (gridX < 0 || gridX >= MAP_COLS || gridY < 0 || gridY >= MAP_ROWS) {
      setDropping(null);
      return;
    }
    if (placed.some((p) => p.gridX === gridX && p.gridY === gridY)) {
      setDropping(null);
      return;
    }
    if (placed.some((p) => p.equipmentId === dropping.id)) {
      setDropping(null);
      return;
    }

    const next = [
      ...placed,
      {
        id:          `p-${Date.now()}`,
        equipmentId: dropping.id,
        name:        dropping.name,
        type:        dropping.type,
        gridX, gridY,
        status:      "normal",
      },
    ];
    setPlaced(next);
    setDropping(null);
    onPlacedChange?.(next);
  }, [dropping, placed, pos, scale, onPlacedChange]);

  // 캔버스 내 이동
  const handleMove = useCallback((id, gx, gy) => {
    setPlaced((prev) => {
      const next = prev.map((e) => e.id === id ? { ...e, gridX: gx, gridY: gy } : e);
      onPlacedChange?.(next);
      return next;
    });
  }, [onPlacedChange]);

  // 컨텍스트 메뉴로 제거
  const handleContextMenu = useCallback((item, x, y) => {
    setContextMenu({ item, x, y });
  }, []);

  const handleRemove = useCallback((id) => {
    setPlaced((prev) => {
      const next = prev.filter((e) => e.id !== id);
      onPlacedChange?.(next);
      return next;
    });
    setContextMenu(null);
  }, [onPlacedChange]);

  const placedEquipIds = placed.map((p) => p.equipmentId);

  // 격자 선
  const gridLines = [];
  for (let c = 0; c <= MAP_COLS; c++) {
    const x = c * GRID_SIZE;
    const isMajor = c % 5 === 0;
    gridLines.push(
      <Line key={`v${c}`} points={[x, 0, x, MAP_H]}
        stroke={isMajor ? "#d1d5db" : "#e5e7eb"} strokeWidth={isMajor ? 1 : 0.5} listening={false} />
    );
  }
  for (let r = 0; r <= MAP_ROWS; r++) {
    const y = r * GRID_SIZE;
    const isMajor = r % 5 === 0;
    gridLines.push(
      <Line key={`h${r}`} points={[0, y, MAP_W, y]}
        stroke={isMajor ? "#d1d5db" : "#e5e7eb"} strokeWidth={isMajor ? 1 : 0.5} listening={false} />
    );
  }

  return (
    <Box display="flex" gap={1.5} sx={{ height: 460, position: "relative" }}>
      {/* ─── 기구 목록 패널 ─── */}
      <Paper elevation={0} sx={{
        width: 180, flexShrink: 0,
        border: "1px solid #eef2f6", borderRadius: 2,
        display: "flex", flexDirection: "column", overflow: "hidden",
      }}>
        <Box px={1.5} py={1} sx={{ borderBottom: "1px solid #f3f4f6" }}>
          <Typography variant="caption" fontWeight="bold" color="text.secondary">
            기구 목록
          </Typography>
          <Typography variant="caption" color="text.disabled" display="block" sx={{ fontSize: "0.65rem", mt: 0.25 }}>
            드래그하여 맵에 배치
          </Typography>
        </Box>

        <Box flex={1} overflow="auto" p={1}>
          {equipment.length === 0 ? (
            <Typography variant="caption" color="text.disabled" display="block" sx={{ textAlign: "center", mt: 3 }}>
              등록된 기구 없음
            </Typography>
          ) : (
            <Stack spacing={0.5}>
              {equipment.map((eq) => {
                const color = EQUIP_COLORS[eq.type] ?? "#6b7280";
                const icon  = EQUIP_ICONS[eq.type]  ?? "🏋️";
                const isPlaced = placedEquipIds.includes(eq.id);
                return (
                  <Box
                    key={eq.id}
                    draggable={!isPlaced}
                    onDragStart={(e) => { e.dataTransfer.effectAllowed = "copy"; setDropping(eq); }}
                    sx={{
                      border: "1px solid #e5e7eb",
                      borderLeft: `3px solid ${color}`,
                      borderRadius: 1,
                      p: "5px 8px",
                      display: "flex", alignItems: "center", gap: 0.75,
                      cursor: isPlaced ? "default" : "grab",
                      opacity: isPlaced ? 0.4 : 1,
                      bgcolor: "#fff",
                      "&:hover": { bgcolor: isPlaced ? undefined : "#f9fafb" },
                      userSelect: "none",
                      transition: "opacity 0.15s",
                    }}
                  >
                    <span style={{ fontSize: 14, lineHeight: 1 }}>{icon}</span>
                    <Typography variant="caption" noWrap sx={{
                      fontSize: "0.7rem", fontWeight: "bold", flex: 1,
                      color: isPlaced ? "text.disabled" : "text.primary",
                    }}>
                      {eq.name}
                    </Typography>
                    {isPlaced && (
                      <Chip label="배치" size="small" sx={{ height: 14, fontSize: "0.55rem", px: 0.25 }} />
                    )}
                  </Box>
                );
              })}
            </Stack>
          )}
        </Box>

        <Box px={1.5} py={0.75} sx={{ borderTop: "1px solid #f3f4f6" }}>
          <Typography variant="caption" color="text.disabled" sx={{ fontSize: "0.62rem" }}>
            {placed.length} / {equipment.length} 배치됨
          </Typography>
        </Box>
      </Paper>

      {/* ─── 캔버스 ─── */}
      <Box
        ref={containerRef}
        flex={1}
        sx={{ borderRadius: 2, overflow: "hidden", bgcolor: "#f9fafb", border: "1px solid #eef2f6", position: "relative" }}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={() => setContextMenu(null)}
      >
        <Stage
          ref={stageRef}
          width={stageSize.width}
          height={stageSize.height}
          scaleX={scale} scaleY={scale}
          x={pos.x} y={pos.y}
          onWheel={handleWheel}
        >
          <Layer>
            <Rect x={0} y={0} width={MAP_W} height={MAP_H} fill="#fff"
              shadowColor="#000" shadowBlur={8} shadowOpacity={0.06} shadowOffsetX={2} shadowOffsetY={2} />
            {gridLines}
          </Layer>
          <EquipmentLayer
            equipment={placed}
            tool="select"
            selectedIds={[]}
            onSelect={() => {}}
            onMove={handleMove}
            onUpdate={() => {}}
            onRemove={() => {}}
            onContextMenu={handleContextMenu}
          />
        </Stage>

        {/* 힌트 */}
        {placed.length === 0 && (
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

        {/* 줌 안내 */}
        <Typography variant="caption" sx={{
          position: "absolute", bottom: 8, right: 8,
          bgcolor: "rgba(0,0,0,0.45)", color: "#fff",
          px: 1, py: 0.3, borderRadius: 1, fontSize: "0.62rem",
          pointerEvents: "none",
        }}>
          마우스 휠로 줌 · 우클릭으로 제거
        </Typography>
      </Box>

      {/* ─── 우클릭 컨텍스트 메뉴 (Stage 밖 HTML) ─── */}
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
            minWidth: 130,
          }}
          onMouseLeave={() => setContextMenu(null)}
        >
          <div
            onClick={() => handleRemove(contextMenu.item.id)}
            style={{
              padding: "8px 14px", cursor: "pointer",
              fontSize: 13, color: "#ef4444",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "#fef2f2"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = ""; }}
          >
            배치 제거
          </div>
        </div>
      )}
    </Box>
  );
}
