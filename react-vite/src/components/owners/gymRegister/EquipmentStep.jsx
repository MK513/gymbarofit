import React from "react";
import {
  Box,
  Button,
  Chip,
  Divider,
  FormControl,
  IconButton,
  InputLabel,
  List,
  ListItem,
  ListItemText,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import FitnessCenterIcon from "@mui/icons-material/FitnessCenter";
import { EQUIP_TYPES } from "./constants";

export default function EquipmentStep({ list, form, onFormChange, onAdd, onRemove }) {
  const getTypeMeta = (v) => EQUIP_TYPES.find((t) => t.value === v) ?? EQUIP_TYPES[0];

  return (
    <Stack spacing={2}>
      <Paper elevation={0} sx={{ border: "1px solid #eef2f6", borderRadius: 2, p: 2 }}>
        <Typography variant="caption" color="text.secondary" fontWeight="bold" mb={1.5} display="block">
          기구 추가
        </Typography>
        <Stack spacing={1.5}>
          <Box display="flex" gap={1}>
            <TextField
              label="기구 이름"
              name="name"
              value={form.name}
              onChange={onFormChange}
              size="small"
              sx={{ flex: 1 }}
            />
            <FormControl size="small" sx={{ minWidth: 110 }}>
              <InputLabel>유형</InputLabel>
              <Select name="type" value={form.type} label="유형" onChange={onFormChange}>
                {EQUIP_TYPES.map((t) => (
                  <MenuItem key={t.value} value={t.value}>
                    {t.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
          <Box display="flex" gap={1}>
            <TextField
              label="위치 (선택)"
              name="location"
              value={form.location}
              onChange={onFormChange}
              size="small"
              sx={{ flex: 1 }}
            />
            <TextField
              label="수량"
              name="count"
              type="number"
              value={form.count}
              onChange={onFormChange}
              size="small"
              sx={{ width: 80 }}
              inputProps={{ min: 1 }}
            />
          </Box>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={onAdd}
            disabled={!form.name}
            size="small"
            sx={{ alignSelf: "flex-end", borderRadius: 2, fontWeight: "bold" }}
          >
            추가
          </Button>
        </Stack>
      </Paper>

      {list.length > 0 ? (
        <Paper elevation={0} sx={{ border: "1px solid #eef2f6", borderRadius: 2, overflow: "hidden" }}>
          <List dense disablePadding>
            {list.map((item, idx) => {
              const meta = getTypeMeta(item.type);
              return (
                <React.Fragment key={item.id}>
                  {idx > 0 && <Divider />}
                  <ListItem
                    secondaryAction={
                      <IconButton edge="end" size="small" onClick={() => onRemove(item.id)}>
                        <DeleteIcon fontSize="small" sx={{ color: "#d32f2f" }} />
                      </IconButton>
                    }
                  >
                    <ListItemText
                      primary={
                        <Box display="flex" alignItems="center" gap={0.5}>
                          <Typography variant="body2" fontWeight="bold">
                            {item.name}
                          </Typography>
                          {item.count > 1 && (
                            <Typography variant="caption" color="text.disabled">
                              ×{item.count}
                            </Typography>
                          )}
                        </Box>
                      }
                      secondary={
                        <Box display="flex" alignItems="center" gap={0.5} mt={0.3}>
                          <Chip
                            label={meta.label}
                            size="small"
                            sx={{
                              height: 18,
                              fontSize: "0.65rem",
                              bgcolor: meta.color + "22",
                              color: meta.color,
                              fontWeight: "bold",
                            }}
                          />
                          {item.location && (
                            <Typography variant="caption" color="text.disabled">
                              {item.location}
                            </Typography>
                          )}
                        </Box>
                      }
                    />
                  </ListItem>
                </React.Fragment>
              );
            })}
          </List>
        </Paper>
      ) : (
        <Box sx={{ textAlign: "center", py: 5, color: "text.disabled" }}>
          <FitnessCenterIcon sx={{ fontSize: 40, opacity: 0.25, mb: 1 }} />
          <Typography variant="caption" display="block">
            추가된 기구가 없습니다.
            <br />
            기구를 추가하거나 건너뛰기를 눌러 다음 단계로 이동하세요.
          </Typography>
        </Box>
      )}
    </Stack>
  );
}
