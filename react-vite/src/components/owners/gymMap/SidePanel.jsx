import {
  Box, Typography, Paper, Divider, Chip, Stack,
  ToggleButtonGroup, ToggleButton, Tooltip,
  IconButton, Button, CircularProgress,
} from "@mui/material";
import NearMeIcon from "@mui/icons-material/NearMe";
import CropSquareIcon from "@mui/icons-material/CropSquare";
import HorizontalRuleIcon from "@mui/icons-material/HorizontalRule";
import RadioButtonUncheckedIcon from "@mui/icons-material/RadioButtonUnchecked";
import UndoIcon from "@mui/icons-material/Undo";
import RedoIcon from "@mui/icons-material/Redo";
import SaveIcon from "@mui/icons-material/Save";
import FitnessCenterIcon from "@mui/icons-material/FitnessCenter";
import { TOOLS, EQUIP_COLORS, EQUIP_ICONS } from "./constants";

const TOOL_ITEMS = [
  { value: TOOLS.SELECT, icon: <NearMeIcon fontSize="small" />,             label: "선택 (V)" },
  { value: TOOLS.RECT,   icon: <CropSquareIcon fontSize="small" />,         label: "구역 (R)" },
  { value: TOOLS.WALL,   icon: <HorizontalRuleIcon fontSize="small" />,     label: "벽 (W)" },
  { value: TOOLS.PILLAR, icon: <RadioButtonUncheckedIcon fontSize="small" />, label: "기둥 (P)" },
];

function SaveStatusChip({ saveStatus, lastSavedAt }) {
  if (saveStatus === "saving") {
    return (
      <Box display="flex" alignItems="center" gap={0.5}>
        <CircularProgress size={10} />
        <Typography variant="caption" color="text.secondary">저장 중...</Typography>
      </Box>
    );
  }
  if (saveStatus === "unsaved") {
    return <Typography variant="caption" color="warning.main">저장 안됨 (변경사항 있음)</Typography>;
  }
  if (saveStatus === "saved" && lastSavedAt) {
    const diff = Math.round((Date.now() - lastSavedAt) / 60000);
    const label = diff < 1 ? "방금" : `${diff}분 전`;
    return <Typography variant="caption" color="success.main">저장됨 · {label}</Typography>;
  }
  return null;
}

export default function SidePanel({
  tool, onToolChange,
  equipmentList, loadingEquipments,
  placedEquipmentIds,
  onDragStart,
  undo, redo, canUndo, canRedo,
  onSave, saveStatus, lastSavedAt,
}) {
  return (
    <Box sx={{
      width: 260,
      flexShrink: 0,
      display: "flex",
      flexDirection: "column",
      borderRight: "1px solid #e5e7eb",
      bgcolor: "#fff",
      overflow: "hidden",
    }}>
      {/* 도구 선택 */}
      <Box px={1.5} pt={1.5} pb={1}>
        <Typography variant="caption" color="text.secondary" fontWeight="bold" mb={0.5} display="block">
          도구
        </Typography>
        <ToggleButtonGroup
          value={tool}
          exclusive
          onChange={(_, v) => v && onToolChange(v)}
          size="small"
          fullWidth
          sx={{ "& .MuiToggleButton-root": { py: 0.5 } }}
        >
          {TOOL_ITEMS.map((t) => (
            <Tooltip key={t.value} title={t.label} placement="top">
              <ToggleButton value={t.value}>{t.icon}</ToggleButton>
            </Tooltip>
          ))}
        </ToggleButtonGroup>
      </Box>

      <Divider />

      {/* Undo / Redo */}
      <Box px={1.5} py={0.75} display="flex" alignItems="center" gap={0.5}>
        <Tooltip title="실행 취소 (Ctrl+Z)">
          <span>
            <IconButton size="small" onClick={undo} disabled={!canUndo}>
              <UndoIcon fontSize="small" />
            </IconButton>
          </span>
        </Tooltip>
        <Tooltip title="다시 실행 (Ctrl+Y)">
          <span>
            <IconButton size="small" onClick={redo} disabled={!canRedo}>
              <RedoIcon fontSize="small" />
            </IconButton>
          </span>
        </Tooltip>
        <Box flex={1} />
        <SaveStatusChip saveStatus={saveStatus} lastSavedAt={lastSavedAt} />
      </Box>

      <Divider />

      {/* 기구 목록 */}
      <Box px={1.5} pt={1} pb={0.5}>
        <Typography variant="caption" color="text.secondary" fontWeight="bold">
          기구 목록
        </Typography>
        <Typography variant="caption" color="text.disabled" display="block" sx={{ mt: 0.25 }}>
          항목을 캔버스로 드래그하여 배치하세요
        </Typography>
      </Box>

      <Box flex={1} overflow="auto" px={1.5} py={0.5}>
        {loadingEquipments ? (
          <Box display="flex" justifyContent="center" py={4}>
            <CircularProgress size={24} />
          </Box>
        ) : equipmentList.length === 0 ? (
          <Box py={4} textAlign="center" color="text.disabled">
            <FitnessCenterIcon sx={{ fontSize: 32, opacity: 0.3, mb: 0.5 }} />
            <Typography variant="caption" display="block">등록된 기구가 없습니다.</Typography>
          </Box>
        ) : (
          <Stack spacing={0.75}>
            {equipmentList.map((equip) => {
              const color = EQUIP_COLORS[equip.type] ?? "#6b7280";
              const icon  = EQUIP_ICONS[equip.type]  ?? "🏋️";
              const placed = placedEquipmentIds.includes(equip.equipmentId ?? equip.id);
              return (
                <Paper
                  key={equip.equipmentId ?? equip.id}
                  elevation={0}
                  draggable
                  onDragStart={(e) => {
                    e.dataTransfer.effectAllowed = "copy";
                    onDragStart(equip);
                  }}
                  sx={{
                    border: "1px solid #e5e7eb",
                    borderLeft: `3px solid ${color}`,
                    borderRadius: 1.5,
                    p: 0.75,
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    cursor: "grab",
                    opacity: placed ? 0.5 : 1,
                    "&:hover": { bgcolor: "#f9fafb" },
                    userSelect: "none",
                  }}
                >
                  <Typography sx={{ fontSize: 18, lineHeight: 1 }}>{icon}</Typography>
                  <Box flex={1} minWidth={0}>
                    <Typography variant="body2" fontWeight="bold" noWrap fontSize="0.78rem">
                      {equip.name}
                    </Typography>
                    <Chip
                      label={equip.type}
                      size="small"
                      sx={{
                        height: 16, fontSize: "0.6rem",
                        bgcolor: color + "22", color,
                        fontWeight: "bold", mt: 0.25,
                      }}
                    />
                  </Box>
                  {placed && (
                    <Typography variant="caption" color="text.disabled" sx={{ fontSize: "0.6rem" }}>
                      배치됨
                    </Typography>
                  )}
                </Paper>
              );
            })}
          </Stack>
        )}
      </Box>

      <Divider />

      {/* 저장 버튼 */}
      <Box px={1.5} py={1}>
        <Button
          fullWidth
          variant="contained"
          startIcon={<SaveIcon />}
          onClick={onSave}
          disabled={saveStatus === "saving"}
          size="small"
          sx={{ borderRadius: 2, fontWeight: "bold" }}
        >
          {saveStatus === "saving" ? "저장 중..." : "저장"}
        </Button>
      </Box>
    </Box>
  );
}
