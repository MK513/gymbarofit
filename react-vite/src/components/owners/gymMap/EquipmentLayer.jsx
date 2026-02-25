import { useState, useRef } from "react";
import { Layer, Group, Rect, Text, Circle } from "react-konva";
import { GRID_SIZE, TOOLS, EQUIP_COLORS, EQUIP_ICONS } from "./constants";

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
  onSelect,
  onMove,
  onUpdate,
  onRemove,
  onContextMenu,  // (item, clientX, clientY) => void
}) {
  const [dragPreview, setDragPreview] = useState(null);
  const dragStartPos = useRef(null);

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

  return (
    <Layer>
      {equipment.map((item) => {
        const color = EQUIP_COLORS[item.type] ?? "#6b7280";
        const icon  = EQUIP_ICONS[item.type]  ?? "🏋️";
        const isSelected = selectedIds.includes(item.id);
        const isPreview  = dragPreview?.id === item.id;
        const hasCollision = isPreview && dragPreview.collision;

        const status = item.status ?? "normal";
        let borderColor = isSelected ? "#2563eb" : color;
        let borderWidth = isSelected ? 3 : 1.5;
        let opacity = 1;
        if (status === "maintenance") { borderColor = "#f59e0b"; borderWidth = 3; }
        if (status === "unavailable") { borderColor = "#ef4444"; opacity = 0.5; }
        if (hasCollision) { borderColor = "#ef4444"; borderWidth = 3; }

        const x = item.gridX * GRID_SIZE;
        const y = item.gridY * GRID_SIZE;
        const size = GRID_SIZE * 1.5;

        return (
          <Group
            key={item.id}
            x={x} y={y}
            draggable={tool === TOOLS.SELECT || tool === "select"}
            opacity={opacity}
            onDragStart={(e) => handleDragStart(e, item)}
            onDragMove={(e) => handleDragMove(e, item)}
            onDragEnd={(e) => handleDragEnd(e, item)}
            onClick={(e) => {
              if (tool !== TOOLS.SELECT && tool !== "select") return;
              e.cancelBubble = true;
              onSelect(e.evt.shiftKey ? [...selectedIds, item.id] : [item.id]);
            }}
            onContextMenu={(e) => handleContextMenu(e, item)}
          >
            {/* 배경 */}
            <Rect
              x={0} y={0}
              width={size} height={size}
              fill={color + "22"}
              stroke={borderColor}
              strokeWidth={borderWidth}
              cornerRadius={4}
            />
            {/* 아이콘 */}
            <Text
              x={0} y={6}
              width={size} align="center"
              text={icon}
              fontSize={20}
              listening={false}
            />
            {/* 이름 */}
            <Text
              x={2} y={size - 14}
              width={size - 4}
              text={(item.name ?? "").substring(0, 6)}
              fontSize={9} fill="#374151"
              align="center" ellipsis
              listening={false}
            />
            {/* 번호 배지 */}
            {item.serialNo != null && (
              <>
                <Circle x={size - 8} y={8} radius={8} fill={color} />
                <Text
                  x={size - 16} y={2}
                  width={16} height={12}
                  text={String(item.serialNo)}
                  fontSize={8} fill="#fff" align="center"
                  listening={false}
                />
              </>
            )}
            {/* 점검중 오버레이 */}
            {status === "maintenance" && (
              <Text x={size - 16} y={size - 18} text="🔧" fontSize={12} listening={false} />
            )}
          </Group>
        );
      })}
    </Layer>
  );
}
