import { useEffect, useState } from "react";
import {
  Box,
  Button,
  Chip,
  Divider,
  Paper,
  Stack,
  Switch,
  TextField,
  Typography,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { DAY_LABELS, loadDaumPostcodeScript } from "./constants";

export default function BasicInfoStep({ form, onChange, operatingHours, onHoursChange }) {
  const [postcodeReady, setPostcodeReady] = useState(false);

  useEffect(() => {
    loadDaumPostcodeScript().then(() => setPostcodeReady(true));
  }, []);

  const handleAddressSearch = () => {
    if (!postcodeReady) return;
    new window.daum.Postcode({
      oncomplete(data) {
        onChange({ target: { name: "postalCode", value: data.zonecode } });
        onChange({ target: { name: "address", value: data.roadAddress || data.jibunAddress } });
      },
    }).open();
  };

  const handleHourField = (day, field, value) => {
    onHoursChange((prev) =>
      prev.map((h) => (h.day === day ? { ...h, [field]: value } : h))
    );
  };

  const handleClosedToggle = (day) => {
    onHoursChange((prev) =>
      prev.map((h) => (h.day === day ? { ...h, closed: !h.closed } : h))
    );
  };

  return (
    <Stack spacing={2}>
      <TextField
        label="헬스장 이름"
        name="name"
        value={form.name}
        onChange={onChange}
        fullWidth
        size="small"
      />

      <Stack spacing={1}>
        <Box display="flex" gap={1} alignItems="center">
          <TextField
            label="주소"
            value={form.postalCode}
            size="small"
            fullWidth
            slotProps={{ input: { readOnly: true } }}
            placeholder="우편번호"
          />
          <Button
            variant="outlined"
            startIcon={<SearchIcon />}
            onClick={handleAddressSearch}
            disabled={!postcodeReady}
            sx={{ borderRadius: 2, fontWeight: "bold", flexShrink: 0, whiteSpace: "nowrap", height: 40 }}
          >
            {postcodeReady ? "우편번호 검색" : "로딩 중..."}
          </Button>
        </Box>
        <TextField
          value={form.address}
          size="small"
          fullWidth
          slotProps={{ input: { readOnly: true } }}
          placeholder="도로명 주소"
        />
      </Stack>

      <TextField
        label="최대 수용 인원"
        name="maxCapacity"
        type="number"
        value={form.maxCapacity}
        onChange={onChange}
        fullWidth
        size="small"
        inputProps={{ min: 1 }}
      />

      <Paper elevation={0} sx={{ border: "1px solid #eef2f6", borderRadius: 2, overflow: "hidden" }}>
        <Box sx={{ px: 2, py: 1.25, bgcolor: "#fafbfc", borderBottom: "1px solid #eef2f6" }}>
          <Typography variant="caption" color="text.secondary" fontWeight="bold">
            요일별 운영 시간
          </Typography>
        </Box>

        <Stack divider={<Divider />}>
          {operatingHours.map((h) => (
            <Box
              key={h.day}
              sx={{
                px: 2,
                py: 1.25,
                display: "flex",
                alignItems: "center",
                gap: 1,
                bgcolor: h.closed ? "#fafafa" : "#fff",
                transition: "background-color 0.15s",
              }}
            >
              <Typography
                variant="body2"
                sx={{
                  width: 52,
                  flexShrink: 0,
                  fontWeight: h.closed ? "normal" : "bold",
                  color: h.closed ? "text.disabled" : "text.primary",
                }}
              >
                {DAY_LABELS[h.day]}
              </Typography>

              {h.closed ? (
                <Box flex={1} display="flex" justifyContent="center">
                  <Chip
                    label="휴무"
                    size="small"
                    sx={{
                      bgcolor: "#f1f3f5",
                      color: "text.disabled",
                      fontWeight: "bold",
                      height: 22,
                      fontSize: "0.7rem",
                    }}
                  />
                </Box>
              ) : (
                <Box flex={1} display="flex" alignItems="center" gap={0.75}>
                  <TextField
                    type="time"
                    value={h.openAt}
                    onChange={(e) => handleHourField(h.day, "openAt", e.target.value)}
                    size="small"
                    sx={{ flex: 1, "& .MuiInputBase-input": { fontSize: "0.78rem", py: "5px" } }}
                  />
                  <Typography variant="caption" color="text.disabled" sx={{ flexShrink: 0 }}>
                    ~
                  </Typography>
                  <TextField
                    type="time"
                    value={h.closeAt}
                    onChange={(e) => handleHourField(h.day, "closeAt", e.target.value)}
                    size="small"
                    sx={{ flex: 1, "& .MuiInputBase-input": { fontSize: "0.78rem", py: "5px" } }}
                  />
                </Box>
              )}

              <Switch
                size="small"
                checked={!h.closed}
                onChange={() => handleClosedToggle(h.day)}
                sx={{ flexShrink: 0 }}
              />
            </Box>
          ))}
        </Stack>

        <Box sx={{ px: 2, py: 1, bgcolor: "#fafbfc", borderTop: "1px solid #eef2f6" }}>
          <Typography variant="caption" color="text.disabled">
            스위치를 끄면 해당 요일은 휴무로 설정됩니다.
          </Typography>
        </Box>
      </Paper>
    </Stack>
  );
}
