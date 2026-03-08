import { useState, useRef, useEffect } from "react";
import { Layer, Group, Rect, Text, Circle, Image as KonvaImage } from "react-konva";
import { GRID_SIZE, TOOLS, EQUIP_COLORS, EQUIP_ICONS } from "./constants";

const HANDLE = 8; // 리사이즈 핸들 픽셀 크기

function snap(v) {
  return Math.round(v / GRID_SIZE) * GRID_SIZE;
}

function checkCollision(id, gridX, gridY, equipment) {
  return equipment.some((e) => e.id !== id && e.gridX === gridX && e.gridY === gridY);
}

export default function EquipmentLayer({
  equipment,
  tool,
  selectedIds,
  highlightEquipId,
  onSelect,
  onMove,
  onUpdate,
  onRemove,
  onContextMenu,
}) {
  const [dragPreview, setDragPreview] = useState(null);
  const dragStartPos = useRef(null);

  // 기구별 아이콘 이미지 프리로딩
  const loadedUrls = useRef(new Set());
  const [imageMap, setImageMap] = useState({});

  useEffect(() => {
    equipment.forEach((item) => {
      if (!item.iconUrl || loadedUrls.current.has(item.iconUrl)) return;
      loadedUrls.current.add(item.iconUrl);
      const img = new window.Image();
      img.src = item.iconUrl;
      img.onload = () => setImageMap((prev) => ({ ...prev, [item.iconUrl]: img }));
    });
  }, [equipment]);

  // ─── 크기 조절 상태 ────────────────────────────────
  const [resizing, setResizing] = useState(null);
  // { id, stageContainer, stageNode, itemGridX, itemGridY }
  const [resizeSpan, setResizeSpan] = useState({});
  // { [id]: { spanW, spanH } }  — 드래그 중 프리뷰
  const resizeSpanRef = useRef({});

  useEffect(() => {
    if (!resizing) return;
    const { id, stageContainer, stageNode, itemGridX, itemGridY } = resizing;

    const onMove = (e) => {
      const rect = stageContainer.getBoundingClientRect();
      const wx = (e.clientX - rect.left - stageNode.x()) / stageNode.scaleX();
      const wy = (e.clientY - rect.top  - stageNode.y()) / stageNode.scaleY();
      const sw = Math.max(1, Math.round((wx - itemGridX * GRID_SIZE) / GRID_SIZE));
      const sh = Math.max(1, Math.round((wy - itemGridY * GRID_SIZE) / GRID_SIZE));
      const span = { spanW: sw, spanH: sh };
      resizeSpanRef.current[id] = span;
      setResizeSpan((p) => ({ ...p, [id]: span }));
    };

    const onUp = () => {
      const span = resizeSpanRef.current[id];
      if (span) onUpdate?.(id, span);
      delete resizeSpanRef.current[id];
      setResizing(null);
      setResizeSpan((p) => { const n = { ...p }; delete n[id]; return n; });
      document.body.style.cursor = "";
    };

    document.body.style.cursor = "nwse-resize";
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, [resizing, onUpdate]);

  // ─── 이동 드래그 핸들러 ───────────────────────────
  const handleDragStart = (e, item) => {
    dragStartPos.current = { gridX: item.gridX, gridY: item.gridY };
    setDragPreview({ id: item.id, collision: false });
  };

  const handleDragMove = (e, item) => {
    const gx = snap(e.target.x()) / GRID_SIZE;
    const gy = snap(e.target.y()) / GRID_SIZE;
    const collision = checkCollision(item.id, gx, gy, equipment);
    setDragPreview({ id: item.id, collision });
  };

  const handleDragEnd = (e, item) => {
    const worldX = snap(e.target.x());
    const worldY = snap(e.target.y());
    const gx = worldX / GRID_SIZE;
    const gy = worldY / GRID_SIZE;

    if (checkCollision(item.id, gx, gy, equipment)) {
      e.target.x(item.gridX * GRID_SIZE);
      e.target.y(item.gridY * GRID_SIZE);
      setDragPreview(null);
      return;
    }
    setDragPreview(null);
    onMove(item.id, gx, gy);
  };

  const handleContextMenu = (e, item) => {
    e.evt.preventDefault();
    if (!onContextMenu) return;
    const stage = e.target.getStage();
    const stageBox = stage.container().getBoundingClientRect();
    const pointer = stage.getPointerPosition();
    onContextMenu(item, stageBox.left + pointer.x, stageBox.top + pointer.y);
  };

  const isSelectMode = tool === TOOLS.SELECT || tool === "select";

  return (
    <Layer>
      {equipment.map((item) => {
        const color = EQUIP_COLORS[item.category ?? item.type] ?? "#6b7280";
        const icon  = EQUIP_ICONS[item.category  ?? item.type] ?? "🏋️";
        const isSelected   = selectedIds.includes(item.id);
        const isPreview    = dragPreview?.id === item.id;
        const hasCollision = isPreview && dragPreview.collision;
        const isResizingThis = resizing?.id === item.id;

        const status = item.status ?? "normal";
        const isHighlighted = highlightEquipId != null && item.equipmentId === highlightEquipId;
        let borderColor = isSelected ? "#2563eb" : color;
        let borderWidth = isSelected ? 3 : 1.5;
        let opacity = 1;
        let shadowColor = null;
        if (status === "maintenance") { borderColor = "#f59e0b"; borderWidth = 3; }
        if (status === "unavailable") { borderColor = "#ef4444"; opacity = 0.5; }
        if (hasCollision) { borderColor = "#ef4444"; borderWidth = 3; }
        if (isHighlighted) { borderColor = "#f57c00"; borderWidth = 4; shadowColor = "#f57c00"; }

        // spanW/spanH: 리사이즈 프리뷰 → item 값 → 레거시 1.5배
        const sw = resizeSpan[item.id]?.spanW ?? item.spanW;
        const sh = resizeSpan[item.id]?.spanH ?? item.spanH;
        const sizeW = sw ? sw * GRID_SIZE : GRID_SIZE * 1.5;
        const sizeH = sh ? sh * GRID_SIZE : GRID_SIZE * 1.5;

        const x = item.gridX * GRID_SIZE;
        const y = item.gridY * GRID_SIZE;

        // 아이콘 영역 — 이미지는 원본 비율 유지하여 중앙 배치
        const imgPad = 4;
        const iconFontSize = Math.min(22, Math.max(10, Math.floor(sizeH * 0.38)));
        const iconY = Math.max(2, (sizeH - 14 - iconFontSize) / 2);
        // 이미지 비율 유지: 가용 영역 안에서 contain
        const availW = Math.max(1, sizeW - imgPad * 2);
        const availH = Math.max(1, sizeH - imgPad * 2 - 14);
        const nativeImg = imageMap[item.iconUrl];
        const nativeW = nativeImg?.width  || availW;
        const nativeH = nativeImg?.height || availH;
        const ratio = Math.min(availW / nativeW, availH / nativeH);
        const imgW = nativeW * ratio;
        const imgH = nativeH * ratio;
        const imgX = imgPad + (availW - imgW) / 2;
        const imgY = imgPad + (availH - imgH) / 2;

        return (
          <Group
            key={item.id}
            x={x} y={y}
            draggable={!isResizingThis && isSelectMode}
            opacity={opacity}
            onDragStart={(e) => handleDragStart(e, item)}
            onDragMove={(e) => handleDragMove(e, item)}
            onDragEnd={(e) => handleDragEnd(e, item)}
            onClick={(e) => {
              if (!isSelectMode) return;
              e.cancelBubble = true;
              onSelect(e.evt.shiftKey ? [...selectedIds, item.id] : [item.id]);
            }}
            onContextMenu={(e) => handleContextMenu(e, item)}
          >
            {/* 배경 */}
            <Rect
              x={0} y={0}
              width={sizeW} height={sizeH}
              fill={color + "22"}
              stroke={borderColor}
              strokeWidth={borderWidth}
              cornerRadius={4}
              shadowColor={shadowColor ?? undefined}
              shadowBlur={shadowColor ? 12 : 0}
              shadowOpacity={shadowColor ? 0.6 : 0}
            />
            {/* 아이콘 */}
            {imageMap[item.iconUrl] ? (
              <KonvaImage
                image={imageMap[item.iconUrl]}
                x={imgX} y={imgY}
                width={imgW} height={imgH}
                listening={false}
              />
            ) : (
              <Text
                x={0} y={iconY}
                width={sizeW} align="center"
                text={icon}
                fontSize={iconFontSize}
                listening={false}
              />
            )}
            {/* 이름 */}
            <Text
              x={2} y={sizeH - 13}
              width={sizeW - 4}
              text={(item.name ?? "").substring(0, Math.max(6, Math.floor(sizeW / 8)))}
              fontSize={9} fill="#374151"
              align="center" ellipsis
              listening={false}
            />
            {/* 번호 배지 */}
            {item.serialNo != null && (
              <>
                <Circle x={sizeW - 8} y={8} radius={8} fill={color} />
                <Text
                  x={sizeW - 16} y={2}
                  width={16} height={12}
                  text={String(item.serialNo)}
                  fontSize={8} fill="#fff" align="center"
                  listening={false}
                />
              </>
            )}
            {/* 점검중 오버레이 */}
            {status === "maintenance" && (
              <Text x={sizeW - 16} y={sizeH - 18} text="🔧" fontSize={12} listening={false} />
            )}
            {/* ─── 크기 조절 핸들 (select 모드에서만) ─── */}
            {isSelectMode && (
              <Rect
                x={sizeW - HANDLE} y={sizeH - HANDLE}
                width={HANDLE} height={HANDLE}
                fill="#2563eb" opacity={0.8}
                cornerRadius={2}
                onMouseEnter={() => { document.body.style.cursor = "nwse-resize"; }}
                onMouseLeave={() => { if (!resizing) document.body.style.cursor = ""; }}
                onMouseDown={(e) => {
                  e.cancelBubble = true; // Group drag 방지
                  const sn = e.target.getStage();
                  setResizing({
                    id:             item.id,
                    stageContainer: sn.container(),
                    stageNode:      sn,
                    itemGridX:      item.gridX,
                    itemGridY:      item.gridY,
                  });
                }}
              />
            )}
          </Group>
        );
      })}
    </Layer>
  );
}
