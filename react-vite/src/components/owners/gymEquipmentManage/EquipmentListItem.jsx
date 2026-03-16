import { useState } from "react";
import {
  Box,
  Button,
  Chip,
  Divider,
  IconButton,
  ListItem,
  ListItemText,
  Menu,
  MenuItem,
  Popover,
  TextField,
  Typography,
} from "@mui/material";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";


const STATUS_META = {
  OK:          { label: "정상",   color: "#2e7d32", bg: "#e8f5e9" },
  MAINTENANCE: { label: "점검중", color: "#e65100", bg: "#ffebee" },
  BROKEN:      { label: "고장",   color: "#c62828", bg: "#ffebee" },
  RETIRED:     { label: "폐기",   color: "#616161", bg: "#f5f5f5" },
};

const STATUS_OPTIONS = ["OK", "MAINTENANCE", "BROKEN", "RETIRED"];

export default function EquipmentListItem({
  equip, icons, isOnMap, isSelected, submitting, BASE_URL,
  onEditSave, onDelete, onDragStart, onSelect, onStatusChange,
  showDivider,
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ name: "", type: "", category: "MACHINE", imageUrl: "" });
  const [editAnchorEl, setEditAnchorEl] = useState(null);
  const [statusAnchorEl, setStatusAnchorEl] = useState(null);

  const findIconByUrl = (imageUrl) => {
    if (!imageUrl) return null;
    return icons.find((ic) => imageUrl.endsWith(ic.url));
  };

  const handleEditStart = () => {
    const icon = findIconByUrl(equip.imageUrl);
    setEditForm({
      name: equip.name,
      type: equip.type,
      category: equip.category ?? icon?.category ?? "MACHINE",
      imageUrl: icon?.filename ?? "",
    });
    setIsEditing(true);
  };

  const handleEditCancel = () => {
    setIsEditing(false);
    setEditAnchorEl(null);
  };

  const handleEditIconChange = (filename) => {
    const icon = icons.find((i) => i.filename === filename);
    setEditForm((p) => ({ ...p, imageUrl: filename, type: icon?.label ?? p.type, category: icon?.category ?? p.category }));
    setEditAnchorEl(null);
  };

  const handleEditSave = async () => {
    const success = await onEditSave(equip.id, editForm);
    if (success) setIsEditing(false);
  };

  const handleStatusClick = (e) => {
    e.stopPropagation();
    setStatusAnchorEl(e.currentTarget);
  };

  const handleStatusSelect = (newStatus) => {
    setStatusAnchorEl(null);
    if (newStatus !== equip.status) onStatusChange(equip.id, newStatus);
  };

  const iconObj = findIconByUrl(equip.imageUrl);
  const editIconObj = icons.find((i) => i.filename === editForm.imageUrl);
  const statusKey = equip.status ?? "OK";
  const statusMeta = STATUS_META[statusKey] ?? STATUS_META.OK;

  return (
    <>
      {showDivider && <Divider />}

      {isEditing ? (
        /* ── Edit mode ── */
        <ListItem sx={{ py: 1.5, flexDirection: "column", alignItems: "stretch" }}>
          <Box display="flex" gap={1} alignItems="center" mb={1}>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Box
                onClick={(e) => setEditAnchorEl(e.currentTarget)}
                sx={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  border: "1px solid", borderColor: editAnchorEl ? "primary.main" : "#c4c4c4",
                  borderRadius: 1, px: 1.5, py: 0.6, cursor: "pointer", bgcolor: "#fff",
                  "&:hover": { borderColor: "text.primary" },
                }}
              >
                {editIconObj ? (
                  <Box display="flex" alignItems="center" gap={1} minWidth={0}>
                    <img src={`${BASE_URL}${editIconObj.url}`} alt={editIconObj.label}
                      style={{ width: 20, height: 20, objectFit: "contain", flexShrink: 0 }} />
                    <Typography variant="body2" noWrap>{editIconObj.label}</Typography>
                  </Box>
                ) : (
                  <Typography variant="body2" color="text.disabled">아이콘 선택</Typography>
                )}
                <KeyboardArrowDownIcon fontSize="small"
                  sx={{ color: "text.secondary", flexShrink: 0, ml: 0.5 }} />
              </Box>

              <Popover
                open={Boolean(editAnchorEl)} anchorEl={editAnchorEl}
                onClose={() => setEditAnchorEl(null)}
                anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
                transformOrigin={{ vertical: "top", horizontal: "left" }}
                slotProps={{ paper: { sx: { mt: 0.5, borderRadius: 2, p: 1.5, width: editAnchorEl?.offsetWidth, minWidth: 260, boxShadow: "0 4px 20px rgba(0,0,0,0.12)" } } }}
              >
                <Box sx={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(76px, 1fr))", gap: 1, maxHeight: 260, overflowY: "auto", pr: 0.5 }}>
                  {icons.map((icon) => {
                    const sel = editForm.imageUrl === icon.filename;
                    return (
                      <Box key={icon.filename} onClick={() => handleEditIconChange(icon.filename)}
                        sx={{
                          display: "flex", flexDirection: "column", alignItems: "center",
                          justifyContent: "center", p: 1, border: "2px solid",
                          borderColor: sel ? "primary.main" : "#eef2f6",
                          bgcolor: sel ? "#e3f2fd" : "#fff", borderRadius: 2, cursor: "pointer",
                          "&:hover": { borderColor: "primary.light", bgcolor: sel ? "#e3f2fd" : "#f5f9ff" },
                        }}
                      >
                        <img src={`${BASE_URL}${icon.url}`} alt={icon.label}
                          style={{ width: 40, height: 40, objectFit: "contain" }} />
                        <Typography variant="caption" textAlign="center" lineHeight={1.2} mt={0.5}
                          sx={{ wordBreak: "break-word" }}>
                          {icon.label}
                        </Typography>
                      </Box>
                    );
                  })}
                </Box>
              </Popover>
            </Box>

            <TextField
              label="이름" value={editForm.name} size="small"
              onChange={(e) => setEditForm((p) => ({ ...p, name: e.target.value }))}
              sx={{ width: 120, flexShrink: 0 }}
            />
          </Box>

          <Box display="flex" gap={1} justifyContent="flex-end">
            <Button size="small" variant="outlined" startIcon={<CloseIcon />}
              onClick={handleEditCancel} sx={{ borderRadius: 2 }}>
              취소
            </Button>
            <Button size="small" variant="contained" startIcon={<CheckIcon />}
              disabled={!editForm.name.trim() || submitting}
              onClick={handleEditSave}
              sx={{ borderRadius: 2, fontWeight: "bold" }}>
              저장
            </Button>
          </Box>
        </ListItem>
      ) : (
        /* ── Normal mode ── */
        <ListItem
          draggable={!isOnMap}
          onClick={(e) => { e.stopPropagation(); onSelect?.(equip.id); }}
          onDragStart={(e) => {
            if (isOnMap) return;
            e.dataTransfer.effectAllowed = "copy";
            onDragStart(equip);
          }}
          sx={{
            cursor: isOnMap ? "pointer" : "grab",
            opacity: isOnMap ? 0.85 : 1,
            bgcolor: isSelected ? "#e3f2fd" : "transparent",
            borderLeft: isSelected ? "3px solid #1565c0" : "3px solid transparent",
            transition: "background-color 0.15s, opacity 0.15s",
            "&:hover": { bgcolor: isSelected ? "#bbdefb" : "#f5f9ff" },
          }}
          secondaryAction={
            <Box display="flex" gap={0.5}>
              <IconButton size="small"
                onClick={(e) => { e.stopPropagation(); handleEditStart(); }}>
                <EditIcon fontSize="small" sx={{ color: "primary.main" }} />
              </IconButton>
              <IconButton size="small"
                onClick={(e) => { e.stopPropagation(); onDelete(equip.id); }}>
                <DeleteIcon fontSize="small" sx={{ color: "#d32f2f" }} />
              </IconButton>
            </Box>
          }
        >
          {iconObj ? (
            <img src={`${BASE_URL}${iconObj.url}`} alt=""
              style={{ width: 32, height: 32, objectFit: "contain", marginRight: 10, flexShrink: 0 }} />
          ) : equip.imageUrl ? (
            <img src={equip.imageUrl} alt=""
              style={{ width: 32, height: 32, objectFit: "contain", marginRight: 10, flexShrink: 0 }} />
          ) : null}
          <ListItemText
            primary={
              <Typography variant="body2" fontWeight="bold">{equip.name}</Typography>
            }
            secondary={
              <Box display="flex" flexDirection="column" gap={0.5} mt={0.3} pr="72px">
                {/* 상태 변경 버튼 + 맵 배치됨 */}
                <Box display="flex" alignItems="center" gap={0.5}>
                  <Chip
                    label={statusMeta.label}
                    size="small"
                    deleteIcon={<KeyboardArrowDownIcon style={{ fontSize: 13 }} />}
                    onDelete={handleStatusClick}
                    onClick={handleStatusClick}
                    sx={{
                      height: 20, fontSize: "0.65rem",
                      bgcolor: statusMeta.bg, color: statusMeta.color,
                      fontWeight: "bold", cursor: "pointer",
                      border: `1px solid ${statusMeta.color}55`,
                      "& .MuiChip-deleteIcon": { color: statusMeta.color, opacity: 0.7 },
                      "&:hover": { filter: "brightness(0.95)" },
                    }}
                  />
                  {isOnMap && (
                    <Chip label="맵 배치됨" size="small"
                      sx={{
                        height: 18, fontSize: "0.65rem",
                        bgcolor: "#e8f5e9", color: "#2e7d32",
                        fontWeight: "bold",
                      }}
                    />
                  )}
                </Box>
              </Box>
            }
          />
        </ListItem>
      )}

      {/* Status change menu */}
      <Menu
        anchorEl={statusAnchorEl}
        open={Boolean(statusAnchorEl)}
        onClose={() => setStatusAnchorEl(null)}
        slotProps={{ paper: { sx: { borderRadius: 2, minWidth: 120 } } }}
      >
        {STATUS_OPTIONS.map((s) => {
          const sm = STATUS_META[s];
          return (
            <MenuItem key={s} selected={s === statusKey} onClick={() => handleStatusSelect(s)}
              sx={{ fontSize: "0.8rem", gap: 1 }}>
              <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: sm.color, flexShrink: 0 }} />
              {sm.label}
            </MenuItem>
          );
        })}
      </Menu>
    </>
  );
}
