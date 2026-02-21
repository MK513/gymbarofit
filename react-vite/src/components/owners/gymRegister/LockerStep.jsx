import {
  Box,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import LockIcon from "@mui/icons-material/Lock";
import { LOCKER_SIZES } from "./constants";

export default function LockerStep({ zones, onChange }) {
  return (
    <Stack spacing={1.5}>
      {zones.map((zone) => {
        const meta = LOCKER_SIZES.find((s) => s.value === zone.size);
        const total = (Number(zone.rowCount) || 0) * (Number(zone.columnCount) || 0);
        return (
          <Paper
            key={zone.size}
            elevation={0}
            sx={{ border: "1px solid #eef2f6", borderRadius: 2, p: 2 }}
          >
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
              <Box>
                <Typography variant="body2" fontWeight="bold">
                  {meta.label} 보관함
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {meta.desc}
                </Typography>
              </Box>
            </Box>

            <Box display="flex" alignItems="center" gap={1}>
              <TextField
                type="number"
                value={zone.rowCount}
                onChange={(e) => onChange(zone.size, "rowCount", e.target.value)}
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
                onChange={(e) => onChange(zone.size, "columnCount", e.target.value)}
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
      <Typography variant="caption" color="text.disabled" textAlign="center" display="block" mt={0.5}>
        행·열을 입력하지 않으면 해당 사이즈는 등록되지 않습니다.
      </Typography>
    </Stack>
  );
}
