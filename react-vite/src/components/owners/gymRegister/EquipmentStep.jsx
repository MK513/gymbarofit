import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Paper,
  Popover,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import FitnessCenterIcon from "@mui/icons-material/FitnessCenter";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import { EQUIP_TYPES } from "./constants";
import { getEquipmentIcons } from "../../../api/owner";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

function deriveLabel(filename) {
  return filename
    .replace(/\.\w+$/, "")  // 확장자 제거
    .replace(/_\d+$/, "")   // _100, _50 등 크기 접미사 제거
    .replace(/_/g, " ");    // 언더스코어 → 공백
}

export default function EquipmentStep({ list, form, onFormChange, onAdd, onRemove }) {
  const [icons, setIcons] = useState([]);
  const [iconsLoading, setIconsLoading] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);

  const open = Boolean(anchorEl);

  useEffect(() => {
    setIconsLoading(true);
    getEquipmentIcons()
      .then((data) =>
        setIcons(
          (data ?? []).map((item) => ({
            filename: item.filename,
            url: item.url,
            label: deriveLabel(item.filename),
            type: item.type ?? "MACHINE",
          }))
        )
      )
      .catch(() => {})
      .finally(() => setIconsLoading(false));
  }, []);

  const getTypeMeta = (v) => EQUIP_TYPES.find((t) => t.value === v) ?? EQUIP_TYPES[0];

  const selectedIcon = icons.find((i) => i.filename === form.imageUrl);

  const handleIconChange = (filename) => {
    const icon = icons.find((i) => i.filename === filename);
    onFormChange({ target: { name: "imageUrl", value: filename } });
    onFormChange({ target: { name: "name",     value: icon?.label ?? "" } });
    onFormChange({ target: { name: "type",     value: icon?.type ?? "MACHINE" } });
    setAnchorEl(null);
  };

  return (
    <Stack spacing={2}>
      <Paper elevation={0} sx={{ border: "1px solid #eef2f6", borderRadius: 2, p: 2 }}>
        <Typography variant="caption" color="text.secondary" fontWeight="bold" mb={1.5} display="block">
          기구 추가
        </Typography>

        {/* 1행: 기구 선택 + 수량 + 추가 버튼 */}
        <Box display="flex" gap={1} alignItems="center">

          {/* 기구 선택 trigger */}
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Box
              onClick={(e) => setAnchorEl(e.currentTarget)}
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                border: "1px solid",
                borderColor: open ? "primary.main" : "#c4c4c4",
                borderRadius: 1,
                px: 1.5,
                py: 0.85,
                cursor: "pointer",
                bgcolor: "#fff",
                transition: "border-color 0.15s",
                "&:hover": { borderColor: "text.primary" },
              }}
            >
              {selectedIcon ? (
                <Box display="flex" alignItems="center" gap={1} minWidth={0}>
                  <img
                    src={`${BASE_URL}${selectedIcon.url}`}
                    alt={selectedIcon.label}
                    style={{ width: 22, height: 22, objectFit: "contain", flexShrink: 0 }}
                  />
                  <Typography variant="body2" noWrap>{selectedIcon.label}</Typography>
                </Box>
              ) : (
                <Typography variant="body2" color="text.disabled">
                  {iconsLoading ? "불러오는 중…" : "기구를 선택하세요"}
                </Typography>
              )}
              <KeyboardArrowDownIcon
                fontSize="small"
                sx={{
                  color: "text.secondary",
                  transition: "transform 0.2s",
                  transform: open ? "rotate(180deg)" : "none",
                  flexShrink: 0,
                  ml: 0.5,
                }}
              />
            </Box>

            {/* 아이콘 그리드 Popover */}
            <Popover
              open={open}
              anchorEl={anchorEl}
              onClose={() => setAnchorEl(null)}
              anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
              transformOrigin={{ vertical: "top", horizontal: "left" }}
              slotProps={{
                paper: {
                  sx: {
                    mt: 0.5,
                    borderRadius: 2,
                    p: 1.5,
                    width: anchorEl?.offsetWidth,
                    minWidth: 260,
                    boxShadow: "0 4px 20px rgba(0,0,0,0.12)",
                  },
                },
              }}
            >
              {iconsLoading ? (
                <Box display="flex" justifyContent="center" py={2}>
                  <CircularProgress size={24} />
                </Box>
              ) : (
                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill, minmax(76px, 1fr))",
                    gap: 1,
                    maxHeight: 260,
                    overflowY: "auto",
                    pr: 0.5,
                  }}
                >
                  {icons.map((icon) => {
                    const selected = form.imageUrl === icon.filename;
                    return (
                      <Box
                        key={icon.filename}
                        onClick={() => handleIconChange(icon.filename)}
                        sx={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          justifyContent: "center",
                          p: 1,
                          border: "2px solid",
                          borderColor: selected ? "primary.main" : "#eef2f6",
                          bgcolor: selected ? "#e3f2fd" : "#fff",
                          borderRadius: 2,
                          cursor: "pointer",
                          transition: "border-color 0.15s, background-color 0.15s",
                          "&:hover": {
                            borderColor: "primary.light",
                            bgcolor: selected ? "#e3f2fd" : "#f5f9ff",
                          },
                        }}
                      >
                        <img
                          src={`${BASE_URL}${icon.url}`}
                          alt={icon.label}
                          style={{ width: 40, height: 40, objectFit: "contain" }}
                        />
                        <Typography
                          variant="caption"
                          textAlign="center"
                          lineHeight={1.2}
                          mt={0.5}
                          sx={{ wordBreak: "break-word" }}
                        >
                          {icon.label}
                        </Typography>
                      </Box>
                    );
                  })}
                </Box>
              )}
            </Popover>
          </Box>

          <TextField
            label="수량"
            name="count"
            type="number"
            value={form.count}
            onChange={onFormChange}
            size="small"
            sx={{ width: 80, flexShrink: 0 }}
            slotProps={{ htmlInput: { min: 1 } }}
          />
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={onAdd}
            disabled={!form.imageUrl}
            size="small"
            sx={{ borderRadius: 2, fontWeight: "bold", whiteSpace: "nowrap", flexShrink: 0 }}
          >
            추가
          </Button>
        </Box>
      </Paper>

      {list.length > 0 ? (
        <Paper elevation={0} sx={{ border: "1px solid #eef2f6", borderRadius: 2, overflow: "hidden" }}>
          <List dense disablePadding>
            {list.map((item, idx) => {
              const meta = getTypeMeta(item.type);
              const itemIcon = icons.find((i) => i.filename === item.imageUrl);
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
                    {itemIcon && (
                      <img
                        src={`${BASE_URL}${itemIcon.url}`}
                        alt=""
                        style={{ width: 32, height: 32, objectFit: "contain", marginRight: 10, flexShrink: 0 }}
                      />
                    )}
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
