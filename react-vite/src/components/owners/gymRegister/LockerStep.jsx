import {
  Box,
  Button,
  IconButton,
  Paper,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import LockIcon from "@mui/icons-material/Lock";
import { LOCKER_SIZES } from "./constants";

export default function LockerStep({ zones, onChange, onAdd, onRemove }) {
  return (
    <Stack spacing={1.5}>
      {zones.map((zone) => {
        const meta = LOCKER_SIZES.find((s) => s.value === zone.size) ?? LOCKER_SIZES[0];
        const total = (Number(zone.rowCount) || 0) * (Number(zone.columnCount) || 0);
        return (
          <Paper
            key={zone.id}
            elevation={0}
            sx={{ border: "1px solid #eef2f6", borderRadius: 2, p: 2 }}
          >
            {/* 구역 이름 + 삭제 */}
            <Box display="flex" alignItems="center" gap={1.5} mb={1.5}>
              <Box
                sx={{
                  width: 38,
                  height: 38,
                  borderRadius: 1.5,
                  bgcolor: meta.color + "18",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <LockIcon sx={{ fontSize: 20, color: meta.color }} />
              </Box>
              <TextField
                value={zone.name}
                onChange={(e) => onChange(zone.id, "name", e.target.value)}
                size="small"
                placeholder="구역 이름 (예: A구역)"
                label="구역 이름"
                sx={{ flex: 1 }}
              />
              <IconButton
                size="small"
                onClick={() => onRemove(zone.id)}
                sx={{ color: "text.disabled", flexShrink: 0 }}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Box>

            {/* 사이즈 토글 */}
            <Box mb={1.5}>
              <Typography variant="caption" color="text.secondary" mb={0.5} display="block">
                사이즈
              </Typography>
              <ToggleButtonGroup
                value={zone.size}
                exclusive
                onChange={(_, val) => { if (val) onChange(zone.id, "size", val); }}
                size="small"
                fullWidth
              >
                {LOCKER_SIZES.map((s) => (
                  <ToggleButton
                    key={s.value}
                    value={s.value}
                    sx={{
                      fontWeight: "bold",
                      "&.Mui-selected": {
                        bgcolor: s.color + "18",
                        color: s.color,
                        borderColor: s.color,
                      },
                    }}
                  >
                    {s.label}
                  </ToggleButton>
                ))}
              </ToggleButtonGroup>
            </Box>

            {/* 행 × 열 */}
            <Box display="flex" alignItems="center" gap={1}>
              <TextField
                type="number"
                value={zone.rowCount}
                onChange={(e) => onChange(zone.id, "rowCount", e.target.value)}
                size="small"
                placeholder="0"
                label="행"
                sx={{ flex: 1 }}
                inputProps={{ min: 0 }}
              />
              <Typography variant="body1" color="text.disabled" sx={{ flexShrink: 0 }}>
                ×
              </Typography>
              <TextField
                type="number"
                value={zone.columnCount}
                onChange={(e) => onChange(zone.id, "columnCount", e.target.value)}
                size="small"
                placeholder="0"
                label="열"
                sx={{ flex: 1 }}
                inputProps={{ min: 0 }}
              />
              <Box sx={{ flexShrink: 0, minWidth: 70, textAlign: "right" }}>
                <Typography variant="caption" color="text.secondary">총</Typography>
                <Typography
                  variant="body2"
                  fontWeight="bold"
                  color={total > 0 ? meta.color : "text.disabled"}
                >
                  {total}개
                </Typography>
              </Box>
            </Box>
          </Paper>
        );
      })}

      <Button
        variant="outlined"
        startIcon={<AddIcon />}
        onClick={onAdd}
        sx={{ borderRadius: 2, borderStyle: "dashed" }}
      >
        구역 추가
      </Button>

      {zones.length === 0 && (
        <Typography variant="caption" color="text.disabled" textAlign="center" display="block">
          구역을 추가하지 않으면 보관함이 등록되지 않습니다.
        </Typography>
      )}
    </Stack>
  );
}
