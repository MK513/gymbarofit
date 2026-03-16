import { useState } from "react";
import {
  Box,
  Button,
  CircularProgress,
  Paper,
  Popover,
  TextField,
  Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";

export default function AddEquipmentForm({ icons, BASE_URL, submitting, onAdd }) {
  const [addForm, setAddForm] = useState({ imageUrl: "", type: "", category: "MACHINE", count: 1 });
  const [addAnchorEl, setAddAnchorEl] = useState(null);

  const selectedAddIcon = icons.find((i) => i.filename === addForm.imageUrl);

  const handleAddIconChange = (filename) => {
    const icon = icons.find((i) => i.filename === filename);
    setAddForm((p) => ({ ...p, imageUrl: filename, type: icon?.label ?? "", category: icon?.category ?? "MACHINE" }));
    setAddAnchorEl(null);
  };

  const handleAdd = async () => {
    if (!addForm.imageUrl) return;
    const success = await onAdd(addForm);
    if (success) setAddForm({ imageUrl: "", type: "", category: "MACHINE", count: 1 });
  };

  return (
    <Paper elevation={0} sx={{ border: "1px solid #eef2f6", borderRadius: 2, p: 2 }}>
      <Typography variant="caption" color="text.secondary" fontWeight="bold" mb={1.5} display="block">
        기구 추가
      </Typography>
      <Box display="flex" gap={1} alignItems="center">
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Box
            onClick={(e) => setAddAnchorEl(e.currentTarget)}
            sx={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              border: "1px solid", borderColor: addAnchorEl ? "primary.main" : "#c4c4c4",
              borderRadius: 1, px: 1.5, py: 0.85, cursor: "pointer", bgcolor: "#fff",
              "&:hover": { borderColor: "text.primary" },
            }}
          >
            {selectedAddIcon ? (
              <Box display="flex" alignItems="center" gap={1} minWidth={0}>
                <img src={`${BASE_URL}${selectedAddIcon.url}`} alt={selectedAddIcon.label}
                  style={{ width: 22, height: 22, objectFit: "contain", flexShrink: 0 }} />
                <Typography variant="body2" noWrap>{selectedAddIcon.label}</Typography>
              </Box>
            ) : (
              <Typography variant="body2" color="text.disabled">기구 선택</Typography>
            )}
            <KeyboardArrowDownIcon fontSize="small"
              sx={{ color: "text.secondary", flexShrink: 0, ml: 0.5,
                transform: addAnchorEl ? "rotate(180deg)" : "none", transition: "transform 0.2s" }} />
          </Box>

          <Popover
            open={Boolean(addAnchorEl)} anchorEl={addAnchorEl}
            onClose={() => setAddAnchorEl(null)}
            anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
            transformOrigin={{ vertical: "top", horizontal: "left" }}
            slotProps={{ paper: { sx: { mt: 0.5, borderRadius: 2, p: 1.5, width: addAnchorEl?.offsetWidth, minWidth: 260, boxShadow: "0 4px 20px rgba(0,0,0,0.12)" } } }}
          >
            <Box sx={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(76px, 1fr))", gap: 1, maxHeight: 260, overflowY: "auto", pr: 0.5 }}>
              {icons.map((icon) => {
                const sel = addForm.imageUrl === icon.filename;
                return (
                  <Box key={icon.filename} onClick={() => handleAddIconChange(icon.filename)}
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
          label="수량" type="number" value={addForm.count}
          onChange={(e) => setAddForm((p) => ({ ...p, count: e.target.value }))}
          size="small" sx={{ width: 80, flexShrink: 0 }}
          slotProps={{ htmlInput: { min: 1 } }}
        />
        <Button variant="contained"
          startIcon={submitting ? <CircularProgress size={14} color="inherit" /> : <AddIcon />}
          onClick={handleAdd} disabled={!addForm.imageUrl || submitting} size="small"
          sx={{ borderRadius: 2, fontWeight: "bold", whiteSpace: "nowrap", flexShrink: 0 }}
        >
          추가
        </Button>
      </Box>
    </Paper>
  );
}
