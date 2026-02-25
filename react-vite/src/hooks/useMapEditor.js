import { useReducer, useEffect, useCallback, useRef } from "react";
import { TOOLS, DEFAULT_MAP_META, MAX_HISTORY } from "../components/owners/gymMap/constants";

const INITIAL_SNAPSHOT = {
  zones: [],
  walls: [],
  pillars: [],
  equipment: [],
};

const INITIAL_STATE = {
  tool: TOOLS.SELECT,
  ...INITIAL_SNAPSHOT,
  selectedIds: [],
  history: [INITIAL_SNAPSHOT],
  historyIndex: 0,
  mapMeta: { ...DEFAULT_MAP_META },
  saveStatus: "saved",
  lastSavedAt: null,
};

function snapshot(state) {
  return {
    zones: state.zones,
    walls: state.walls,
    pillars: state.pillars,
    equipment: state.equipment,
  };
}

function pushHistory(state, newSnap) {
  const trimmed = state.history.slice(0, state.historyIndex + 1);
  const next = [...trimmed, newSnap].slice(-MAX_HISTORY);
  return { ...state, ...newSnap, history: next, historyIndex: next.length - 1, saveStatus: "unsaved" };
}

function reducer(state, action) {
  switch (action.type) {
    case "SET_TOOL":
      return { ...state, tool: action.tool, selectedIds: [] };

    case "SELECT":
      return { ...state, selectedIds: action.ids };

    case "ADD_ZONE": {
      const zones = [...state.zones, action.zone];
      return pushHistory(state, { ...snapshot(state), zones });
    }
    case "UPDATE_ZONE": {
      const zones = state.zones.map((z) => (z.id === action.zone.id ? action.zone : z));
      return pushHistory(state, { ...snapshot(state), zones });
    }
    case "DELETE_ZONES": {
      const zones = state.zones.filter((z) => !action.ids.includes(z.id));
      return pushHistory(state, { ...snapshot(state), zones });
    }

    case "ADD_WALL": {
      const walls = [...state.walls, action.wall];
      return pushHistory(state, { ...snapshot(state), walls });
    }
    case "DELETE_WALLS": {
      const walls = state.walls.filter((w) => !action.ids.includes(w.id));
      return pushHistory(state, { ...snapshot(state), walls });
    }

    case "ADD_PILLAR": {
      const pillars = [...state.pillars, action.pillar];
      return pushHistory(state, { ...snapshot(state), pillars });
    }
    case "DELETE_PILLARS": {
      const pillars = state.pillars.filter((p) => !action.ids.includes(p.id));
      return pushHistory(state, { ...snapshot(state), pillars });
    }

    case "PLACE_EQUIPMENT": {
      const equipment = [...state.equipment, action.item];
      return pushHistory(state, { ...snapshot(state), equipment });
    }
    case "MOVE_EQUIPMENT": {
      const equipment = state.equipment.map((e) =>
        e.id === action.id ? { ...e, gridX: action.gridX, gridY: action.gridY } : e
      );
      return pushHistory(state, { ...snapshot(state), equipment });
    }
    case "UPDATE_EQUIPMENT": {
      const equipment = state.equipment.map((e) =>
        e.id === action.id ? { ...e, ...action.patch } : e
      );
      return pushHistory(state, { ...snapshot(state), equipment });
    }
    case "REMOVE_EQUIPMENT": {
      const equipment = state.equipment.filter((e) => e.id !== action.id);
      return pushHistory(state, { ...snapshot(state), equipment });
    }

    case "UNDO": {
      if (state.historyIndex <= 0) return state;
      const idx = state.historyIndex - 1;
      return { ...state, ...state.history[idx], historyIndex: idx, selectedIds: [], saveStatus: "unsaved" };
    }
    case "REDO": {
      if (state.historyIndex >= state.history.length - 1) return state;
      const idx = state.historyIndex + 1;
      return { ...state, ...state.history[idx], historyIndex: idx, selectedIds: [], saveStatus: "unsaved" };
    }

    case "LOAD_MAP":
      return {
        ...INITIAL_STATE,
        zones:     action.data.zones     ?? [],
        walls:     action.data.walls     ?? [],
        pillars:   action.data.pillars   ?? [],
        equipment: action.data.equipment ?? [],
        mapMeta:   action.data.mapMeta   ?? { ...DEFAULT_MAP_META },
        history:   [snapshot({ zones: action.data.zones ?? [], walls: action.data.walls ?? [], pillars: action.data.pillars ?? [], equipment: action.data.equipment ?? [] })],
        historyIndex: 0,
        saveStatus: "saved",
        lastSavedAt: Date.now(),
      };

    case "SET_SAVE_STATUS":
      return { ...state, saveStatus: action.status, lastSavedAt: action.at ?? state.lastSavedAt };

    default:
      return state;
  }
}

export function useMapEditor(gymId) {
  const [state, dispatch] = useReducer(reducer, INITIAL_STATE);
  const autoSaveTimer = useRef(null);

  // Ctrl+Z / Ctrl+Y
  useEffect(() => {
    const onKey = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "z") {
        e.preventDefault();
        dispatch({ type: "UNDO" });
      }
      if ((e.ctrlKey || e.metaKey) && (e.key === "y" || (e.shiftKey && e.key === "z"))) {
        e.preventDefault();
        dispatch({ type: "REDO" });
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // 변경 시 localStorage 자동저장 (3초 디바운스)
  useEffect(() => {
    if (state.saveStatus !== "unsaved" || !gymId) return;
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    autoSaveTimer.current = setTimeout(() => {
      const mapData = buildMapData(state, gymId);
      localStorage.setItem(`gym-map-${gymId}`, JSON.stringify(mapData));
    }, 3000);
    return () => clearTimeout(autoSaveTimer.current);
  }, [state.zones, state.walls, state.pillars, state.equipment, gymId]);

  const setTool       = useCallback((tool)   => dispatch({ type: "SET_TOOL",   tool }),   []);
  const select        = useCallback((ids)    => dispatch({ type: "SELECT",     ids }),    []);
  const addZone       = useCallback((zone)   => dispatch({ type: "ADD_ZONE",   zone }),   []);
  const updateZone    = useCallback((zone)   => dispatch({ type: "UPDATE_ZONE", zone }),  []);
  const deleteZones   = useCallback((ids)    => dispatch({ type: "DELETE_ZONES", ids }), []);
  const addWall       = useCallback((wall)   => dispatch({ type: "ADD_WALL",   wall }),   []);
  const deleteWalls   = useCallback((ids)    => dispatch({ type: "DELETE_WALLS", ids }), []);
  const addPillar     = useCallback((pillar) => dispatch({ type: "ADD_PILLAR", pillar }), []);
  const deletePillars = useCallback((ids)    => dispatch({ type: "DELETE_PILLARS", ids }), []);
  const placeEquipment  = useCallback((item) => dispatch({ type: "PLACE_EQUIPMENT", item }), []);
  const moveEquipment   = useCallback((id, gridX, gridY) => dispatch({ type: "MOVE_EQUIPMENT", id, gridX, gridY }), []);
  const updateEquipment = useCallback((id, patch) => dispatch({ type: "UPDATE_EQUIPMENT", id, patch }), []);
  const removeEquipment = useCallback((id) => dispatch({ type: "REMOVE_EQUIPMENT", id }), []);
  const undo          = useCallback(() => dispatch({ type: "UNDO" }), []);
  const redo          = useCallback(() => dispatch({ type: "REDO" }), []);
  const loadMap       = useCallback((data)   => dispatch({ type: "LOAD_MAP",   data }),   []);
  const setSaveStatus = useCallback((status, at) => dispatch({ type: "SET_SAVE_STATUS", status, at }), []);

  const canUndo = state.historyIndex > 0;
  const canRedo = state.historyIndex < state.history.length - 1;

  return {
    state,
    setTool, select,
    addZone, updateZone, deleteZones,
    addWall, deleteWalls,
    addPillar, deletePillars,
    placeEquipment, moveEquipment, updateEquipment, removeEquipment,
    undo, redo, canUndo, canRedo,
    loadMap, setSaveStatus,
  };
}

export function buildMapData(state, gymId) {
  return {
    version: "1.0",
    gymId,
    mapMeta:   state.mapMeta,
    zones:     state.zones,
    walls:     state.walls,
    pillars:   state.pillars,
    equipment: state.equipment,
  };
}
