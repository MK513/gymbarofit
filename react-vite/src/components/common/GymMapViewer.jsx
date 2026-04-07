import { useState, useEffect, useRef } from "react";
import { Stage, Layer, Rect, Line, Group, Text, Image as KonvaImage } from "react-konva";
import { Box, CircularProgress, Typography } from "@mui/material";
import { getEquipments } from "../../api/gym";
import { BUCKET_BASE_URL } from "../../api-config";
import { GRID_SIZE, EQUIP_COLORS, EQUIP_ICONS } from "../owners/gymMap/constants";

// 내부 읽기전용 장비 렌더 컴포넌트
function EquipmentRect({ item, isHighlighted, imageMap }) {
  const color = EQUIP_COLORS[item.category] ?? "#9e9e9e";
  const x = item.gridX * GRID_SIZE;
  const y = item.gridY * GRID_SIZE;
  const w = item.spanW * GRID_SIZE;
  const h = item.spanH * GRID_SIZE;

  const fill = isHighlighted ? color + "cc" : color + "33";
  const stroke = isHighlighted ? "#f57c00" : color;
  const strokeWidth = isHighlighted ? 3 : 1;
  const shadowProps = isHighlighted
    ? { shadowColor: "#f57c00", shadowBlur: 14, shadowOpacity: 0.7 }
    : {};

  const opacity = item.status === "unavailable" ? 0.4 : 1;
  const rectFill = item.status === "maintenance" ? "#ff980033" : fill;

  const img = imageMap[item.iconUrl];
  const iconSize = Math.min(w, h) * 0.45;
  const iconX = (w - iconSize) / 2;
  const iconY = (h - iconSize) / 2 - 6;

  return (
    <Group x={x} y={y} opacity={opacity}>
      <Rect
        width={w}
        height={h}
        fill={rectFill}
        stroke={stroke}
        strokeWidth={strokeWidth}
        cornerRadius={4}
        {...shadowProps}
      />
      {img ? (
        <KonvaImage
          image={img}
          x={iconX}
          y={iconY}
          width={iconSize}
          height={iconSize}
        />
      ) : (
        <Text
          text={EQUIP_ICONS[item.category] ?? "🏋️"}
          x={0}
          y={iconY}
          width={w}
          align="center"
          fontSize={iconSize}
        />
      )}
      <Text
        text={item.name}
        x={2}
        y={h - 16}
        width={w - 4}
        align="center"
        fontSize={10}
        fill={isHighlighted ? "#b54500" : "#555"}
        fontStyle={isHighlighted ? "bold" : "normal"}
        ellipsis
        wrap="none"
      />
    </Group>
  );
}

const normalize = (item) => ({
  id: item.id,
  name: item.name,
  category: item.type,
  iconUrl: item.imageUrl ? `${BUCKET_BASE_URL}${item.imageUrl}` : "",
  gridX: item.gridX ?? 0,
  gridY: item.gridY ?? 0,
  spanW: item.spanW ?? 2,
  spanH: item.spanH ?? 2,
  status:
    item.itemStatus === "OK"
      ? "normal"
      : item.itemStatus === "MAINTENANCE"
      ? "maintenance"
      : "unavailable",
});

export default function GymMapViewer({ gymId, equipments, highlightEquipmentId }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [imageMap, setImageMap] = useState({});
  const containerRef = useRef(null);
  const [containerWidth, setContainerWidth] = useState(400);

  // 컨테이너 크기 감지 (MapPanel.jsx 패턴)
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setContainerWidth(el.clientWidth));
    ro.observe(el);
    setContainerWidth(el.clientWidth);
    return () => ro.disconnect();
  }, []);

  // 데이터 로드
  useEffect(() => {
    if (equipments) {
      setItems(equipments.map(normalize));
      return;
    }
    if (!gymId) return;
    setLoading(true);
    getEquipments({ gymId })
      .then((res) => setItems((res?.equipments ?? []).map(normalize)))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, [gymId, equipments]);

  // 아이콘 이미지 프리로드
  useEffect(() => {
    const urls = items.map((i) => i.iconUrl).filter(Boolean);
    if (!urls.length) { setImageMap({}); return; }
    const map = {};
    let pending = urls.length;
    urls.forEach((url) => {
      const img = new Image();
      img.onload = () => { map[url] = img; if (--pending === 0) setImageMap({ ...map }); };
      img.onerror = () => { if (--pending === 0) setImageMap({ ...map }); };
      img.src = url;
    });
  }, [items]);

  const hasPosition = items.some((i) => i.gridX != null);
  const noPositionData = items.length > 0 && !hasPosition;

  // 캔버스 크기 계산 (상하좌우 2칸 여백 + 0.88 축소)
  const PAD = GRID_SIZE * 1;
  const maxCol = items.reduce((acc, i) => Math.max(acc, i.gridX + i.spanW), 10);
  const maxRow = items.reduce((acc, i) => Math.max(acc, i.gridY + i.spanH), 8);
  const MAP_W = (maxCol + 1) * GRID_SIZE + PAD * 2;
  const MAP_H = (maxRow + 1) * GRID_SIZE + PAD * 2;
  const totalCols = Math.ceil(MAP_W / GRID_SIZE);
  const totalRows = Math.ceil(MAP_H / GRID_SIZE);
  const scale = containerWidth > 0 ? (containerWidth / MAP_W) * 0.88 : 1;
  const stageWidth = MAP_W * scale;
  const stageHeight = MAP_H * scale;

  return (
    <Box ref={containerRef} sx={{ width: "100%", overflow: "hidden", borderRadius: 2 }}>
      {loading && (
        <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
          <CircularProgress size={28} />
        </Box>
      )}
      {!loading && noPositionData && (
        <Box sx={{ py: 3, textAlign: "center" }}>
          <Typography variant="caption" color="text.disabled">
            아직 기구 위치 정보가 없습니다.
          </Typography>
        </Box>
      )}
      {!loading && items.length === 0 && !loading && (
        <Box sx={{ py: 3, textAlign: "center" }}>
          <Typography variant="caption" color="text.disabled">
            기구 정보가 없습니다.
          </Typography>
        </Box>
      )}
      {!loading && items.length > 0 && hasPosition && containerWidth > 0 && (
        <Box sx={{ display: "flex", justifyContent: "center" }}>
        <Stage
          width={stageWidth}
          height={stageHeight}
          scaleX={scale}
          scaleY={scale}
        >
          {/* 배경 + 그리드 */}
          <Layer>
            <Rect x={0} y={0} width={MAP_W} height={MAP_H} fill="#fafafa" />
            {Array.from({ length: totalCols + 1 }).map((_, i) => (
              <Line
                key={`v${i}`}
                points={[i * GRID_SIZE, 0, i * GRID_SIZE, MAP_H]}
                stroke={i % 5 === 0 ? "#d1d5db" : "#f0f0f0"}
                strokeWidth={1 / scale}
              />
            ))}
            {Array.from({ length: totalRows + 1 }).map((_, i) => (
              <Line
                key={`h${i}`}
                points={[0, i * GRID_SIZE, MAP_W, i * GRID_SIZE]}
                stroke={i % 5 === 0 ? "#d1d5db" : "#f0f0f0"}
                strokeWidth={1 / scale}
              />
            ))}
          </Layer>
          {/* 장비 (읽기전용) — PAD 만큼 오프셋 */}
          <Layer>
            <Group x={PAD} y={PAD}>
              {items.map((item) => (
                <EquipmentRect
                  key={item.id}
                  item={item}
                  isHighlighted={item.id === highlightEquipmentId}
                  imageMap={imageMap}
                />
              ))}
            </Group>
          </Layer>
        </Stage>
        </Box>
      )}
    </Box>
  );
}
