export const GRID_SIZE = 40;

export const ZONE_TYPES = [
  { value: "weight",     label: "웨이트존",   color: "#dbeafe", border: "#93c5fd" },
  { value: "cardio",     label: "카디오존",   color: "#dcfce7", border: "#86efac" },
  { value: "stretching", label: "스트레칭존", color: "#fef9c3", border: "#fde047" },
  { value: "locker",     label: "락커룸",     color: "#f3e8ff", border: "#d8b4fe" },
  { value: "shower",     label: "샤워실",     color: "#fce7f3", border: "#f9a8d4" },
  { value: "other",      label: "기타",       color: "#f3f4f6", border: "#d1d5db" },
];

export const EQUIP_COLORS = {
  CARDIO:      "#3b82f6",
  FREE_WEIGHT: "#10b981",
  MACHINE:     "#f59e0b",
  STRETCHING:  "#8b5cf6",
};

export const EQUIP_ICONS = {
  CARDIO:      "🏃",
  FREE_WEIGHT: "🏋️",
  MACHINE:     "⚙️",
  STRETCHING:  "🧘",
};

export const TOOLS = {
  SELECT:  "select",
  RECT:    "rect",
  WALL:    "wall",
  PILLAR:  "pillar",
};

export const DEFAULT_MAP_META = {
  width:    20,
  height:   15,
  gridSize: GRID_SIZE,
};

export const MAX_HISTORY = 30;
