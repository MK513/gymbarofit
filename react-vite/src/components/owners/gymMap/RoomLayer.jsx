import { useState, useRef, useCallback } from "react";
import { Layer, Rect, Line, Circle, Text, Group } from "react-konva";
import { GRID_SIZE, TOOLS, ZONE_TYPES } from "./constants";

function snap(v) {
  return Math.round(v / GRID_SIZE) * GRID_SIZE;
}

function getZoneMeta(type) {
  return ZONE_TYPES.find((z) => z.value === type) ?? ZONE_TYPES[ZONE_TYPES.length - 1];
}

export default function RoomLayer({
  tool, zones, walls, pillars, selectedIds,
  onAddZone, onUpdateZone, onAddWall, onAddPillar, onSelect,
  stageRef, scale, stagePos, containerRef,
}) {
  // rect 도구 상태
  const [drawing, setDrawing] = useState(null);
  // wall 도구 상태
  const [wallPoints, setWallPoints] = useState([]);
  const [wallPreview, setWallPreview] = useState(null);
  // 존 타입 선택 다이얼로그는 부모가 핸들 → 여기서는 zoneDialog로 임시 저장 후 선택
  const pendingZone = useRef(null);

  const stageToWorld = useCallback((clientX, clientY) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return { x: 0, y: 0 };
    const sx = clientX - rect.left;
    const sy = clientY - rect.top;
    return {
      x: (sx - stagePos.x) / scale,
      y: (sy - stagePos.y) / scale,
    };
  }, [stagePos, scale, containerRef]);

  // ─── rect 도구 ─────────────────────────────────────
  const handleRectMouseDown = (e) => {
    if (tool !== TOOLS.RECT) return;
    const pos = e.target.getStage().getPointerPosition();
    const wx = (pos.x - stagePos.x) / scale;
    const wy = (pos.y - stagePos.y) / scale;
    setDrawing({ x: snap(wx), y: snap(wy), width: 0, height: 0 });
  };

  const handleRectMouseMove = (e) => {
    if (tool !== TOOLS.RECT || !drawing) return;
    const pos = e.target.getStage().getPointerPosition();
    const wx = (pos.x - stagePos.x) / scale;
    const wy = (pos.y - stagePos.y) / scale;
    setDrawing((d) => ({
      ...d,
      width:  snap(wx) - d.x,
      height: snap(wy) - d.y,
    }));
  };

  const handleRectMouseUp = () => {
    if (tool !== TOOLS.RECT || !drawing) return;
    if (Math.abs(drawing.width) >= GRID_SIZE && Math.abs(drawing.height) >= GRID_SIZE) {
      // normalize negative dimensions
      const rect = {
        x: drawing.width  < 0 ? drawing.x + drawing.width  : drawing.x,
        y: drawing.height < 0 ? drawing.y + drawing.height : drawing.y,
        width:  Math.abs(drawing.width),
        height: Math.abs(drawing.height),
      };
      pendingZone.current = rect;
      // 임시로 "other" 타입으로 추가 후 나중에 변경 가능
      const id = `zone-${Date.now()}`;
      onAddZone({ id, type: "other", name: "구역", rect });
    }
    setDrawing(null);
  };

  // ─── wall 도구 ─────────────────────────────────────
  const handleWallClick = (e) => {
    if (tool !== TOOLS.WALL) return;
    const pos = e.target.getStage().getPointerPosition();
    const wx = snap((pos.x - stagePos.x) / scale);
    const wy = snap((pos.y - stagePos.y) / scale);
    setWallPoints((prev) => [...prev, wx, wy]);
  };

  const handleWallDblClick = () => {
    if (tool !== TOOLS.WALL || wallPoints.length < 4) return;
    const id = `wall-${Date.now()}`;
    onAddWall({ id, points: wallPoints });
    setWallPoints([]);
    setWallPreview(null);
  };

  const handleWallMouseMove = (e) => {
    if (tool !== TOOLS.WALL || wallPoints.length === 0) return;
    const pos = e.target.getStage().getPointerPosition();
    const wx = snap((pos.x - stagePos.x) / scale);
    const wy = snap((pos.y - stagePos.y) / scale);
    setWallPreview([wx, wy]);
  };

  // ─── pillar 도구 ───────────────────────────────────
  const handlePillarClick = (e) => {
    if (tool !== TOOLS.PILLAR) return;
    const pos = e.target.getStage().getPointerPosition();
    const wx = snap((pos.x - stagePos.x) / scale);
    const wy = snap((pos.y - stagePos.y) / scale);
    const id = `pillar-${Date.now()}`;
    onAddPillar({ id, x: wx, y: wy, shape: "rect" });
  };

  // ─── select 도구 ───────────────────────────────────
  const handleStageClick = (e) => {
    if (tool === TOOLS.WALL) {
      handleWallClick(e);
      return;
    }
    if (tool === TOOLS.PILLAR) {
      handlePillarClick(e);
      return;
    }
    if (tool === TOOLS.SELECT && e.target === e.target.getStage()) {
      onSelect([]);
    }
  };

  return (
    <Layer
      onMouseDown={handleRectMouseDown}
      onMouseMove={(e) => { handleRectMouseMove(e); handleWallMouseMove(e); }}
      onMouseUp={handleRectMouseUp}
      onClick={handleStageClick}
      onDblClick={handleWallDblClick}
    >
      {/* 존 렌더 */}
      {zones.map((z) => {
        const meta = getZoneMeta(z.type);
        const isSelected = selectedIds.includes(z.id);
        return (
          <Group key={z.id}
            draggable={tool === TOOLS.SELECT}
            onDragEnd={(e) => {
              const nx = snap(e.target.x());
              const ny = snap(e.target.y());
              e.target.x(nx); e.target.y(ny);
              onUpdateZone({ ...z, rect: { ...z.rect, x: z.rect.x + nx, y: z.rect.y + ny } });
              e.target.x(0); e.target.y(0);
            }}
            onClick={(e) => {
              if (tool !== TOOLS.SELECT) return;
              e.cancelBubble = true;
              onSelect(e.evt.shiftKey ? [...selectedIds, z.id] : [z.id]);
            }}
          >
            <Rect
              x={z.rect.x} y={z.rect.y}
              width={z.rect.width} height={z.rect.height}
              fill={meta.color} opacity={0.7}
              stroke={isSelected ? "#2563eb" : meta.border}
              strokeWidth={isSelected ? 2 : 1}
              cornerRadius={2}
            />
            <Text
              x={z.rect.x + 4} y={z.rect.y + 4}
              text={z.name || meta.label}
              fontSize={12} fill="#374151" fontStyle="bold"
              listening={false}
            />
          </Group>
        );
      })}

      {/* 벽 렌더 */}
      {walls.map((w) => {
        const isSelected = selectedIds.includes(w.id);
        return (
          <Line key={w.id}
            points={w.points}
            stroke={isSelected ? "#2563eb" : "#374151"}
            strokeWidth={8} lineCap="round" lineJoin="round"
            onClick={(e) => {
              if (tool !== TOOLS.SELECT) return;
              e.cancelBubble = true;
              onSelect(e.evt.shiftKey ? [...selectedIds, w.id] : [w.id]);
            }}
          />
        );
      })}

      {/* 기둥 렌더 */}
      {pillars.map((p) => {
        const isSelected = selectedIds.includes(p.id);
        if (p.shape === "circle") {
          return (
            <Circle key={p.id}
              x={p.x} y={p.y} radius={10}
              fill="#9ca3af" stroke={isSelected ? "#2563eb" : "#6b7280"} strokeWidth={2}
              onClick={(e) => {
                if (tool !== TOOLS.SELECT) return;
                e.cancelBubble = true;
                onSelect(e.evt.shiftKey ? [...selectedIds, p.id] : [p.id]);
              }}
            />
          );
        }
        return (
          <Rect key={p.id}
            x={p.x - 10} y={p.y - 10} width={20} height={20}
            fill="#9ca3af" stroke={isSelected ? "#2563eb" : "#6b7280"} strokeWidth={2}
            onClick={(e) => {
              if (tool !== TOOLS.SELECT) return;
              e.cancelBubble = true;
              onSelect(e.evt.shiftKey ? [...selectedIds, p.id] : [p.id]);
            }}
          />
        );
      })}

      {/* 벽 그리기 중 미리보기 */}
      {wallPoints.length >= 2 && (
        <Line
          points={[
            ...wallPoints,
            ...(wallPreview ? wallPreview : []),
          ]}
          stroke="#374151" strokeWidth={8} lineCap="round" lineJoin="round"
          dash={[10, 5]} opacity={0.5}
          listening={false}
        />
      )}
      {wallPoints.length >= 2 && wallPreview && (
        <Line
          points={[wallPoints[wallPoints.length - 2], wallPoints[wallPoints.length - 1], ...wallPreview]}
          stroke="#374151" strokeWidth={8} lineCap="round" opacity={0.4}
          listening={false}
        />
      )}

      {/* 구역 그리기 중 미리보기 */}
      {drawing && (
        <Rect
          x={drawing.width < 0 ? drawing.x + drawing.width : drawing.x}
          y={drawing.height < 0 ? drawing.y + drawing.height : drawing.y}
          width={Math.abs(drawing.width)}
          height={Math.abs(drawing.height)}
          fill="#dbeafe" opacity={0.5}
          stroke="#3b82f6" strokeWidth={1} dash={[6, 3]}
          listening={false}
        />
      )}
    </Layer>
  );
}
