import React, { useState } from "react";
import { 
  Box, Container, Typography, IconButton, Grid, Card, CardContent, 
  Chip, Stack, Button, Drawer, Divider, Avatar, LinearProgress 
} from "@mui/material";
import { 
  ArrowBackIosNew, CheckCircleOutline, CancelOutlined, 
  QrCodeScanner, NotificationsActive, AccessTime 
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useNotification } from "../../context/NotificationContext";

// --- Mock Data ---
const MOCK_MACHINES = [
  { id: 1, name: "천국의 계단 1", type: "CARDIO", status: "AVAILABLE", image: "🏃‍♂️", queue: 0 },
  { id: 2, name: "천국의 계단 2", type: "CARDIO", status: "IN_USE", duration: 40, elapsed: 35, queue: 2, image: "🏃‍♂️" }, 
  { id: 3, name: "런닝머신 A", type: "CARDIO", status: "AVAILABLE", image: "🏃‍♀️", queue: 0 },
  { id: 4, name: "스미스 머신", type: "WEIGHT", status: "RESERVED", duration: 50, elapsed: 10, queue: 1, image: "🏋️" }, 
  { id: 5, name: "파워 랙", type: "WEIGHT", status: "AVAILABLE", image: "🏋️‍♂️", queue: 0 },
  { id: 6, name: "벤치 프레스", type: "WEIGHT", status: "AVAILABLE", image: "💪", queue: 0 },
  { id: 7, name: "레그 익스텐션", type: "WEIGHT", status: "IN_USE", duration: 20, elapsed: 5, queue: 0, image: "🦵" }, 
];

export default function MachineReservation() {
  const navigate = useNavigate();
  const { showNotification } = useNotification();

  // --- 상태 관리 ---
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [selectedMachine, setSelectedMachine] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [machines, setMachines] = useState(MOCK_MACHINES);

  // --- 필터링 로직 ---
  const filteredMachines = machines.filter(m => {
    const categoryMatch = selectedCategory === "ALL" || m.type === selectedCategory;
    let statusMatch = true;
    if (statusFilter === "AVAILABLE") {
      statusMatch = m.status === "AVAILABLE";
    } else if (statusFilter === "UNAVAILABLE") {
      statusMatch = m.status === "IN_USE" || m.status === "RESERVED";
    }
    return categoryMatch && statusMatch;
  });

  // --- 핸들러 ---
  const handleMachineClick = (machine) => {
    setSelectedMachine(machine);
    setIsDrawerOpen(true);
  };

  const handleStartWorkout = () => {
    setIsDrawerOpen(false);
    showNotification("카메라가 켜집니다. 기구의 QR을 태그해주세요.", "info");
  };

  const handleJoinQueue = () => {
    setMachines(prev => prev.map(m => 
      m.id === selectedMachine.id ? { ...m, queue: m.queue + 1 } : m
    ));
    setIsDrawerOpen(false);
    showNotification(`${selectedMachine.name} 대기열에 등록되었습니다.`, "success");
  };

  // UI 헬퍼
  const getStatusColor = (status) => {
    switch (status) {
      case "AVAILABLE": return "#4caf50";
      case "IN_USE": return "#f44336";
      case "RESERVED": return "#ff9800";
      default: return "#9e9e9e";
    }
  };

  const getStatusLabel = (machine) => {
    if (machine.status === "AVAILABLE") return "사용 가능";
    const remaining = machine.duration ? machine.duration - machine.elapsed : 0;
    if (machine.status === "IN_USE") return `${remaining}분 남음`;
    if (machine.status === "RESERVED") return "사용 중";
    return "-";
  };

  return (
    <Box sx={{ bgcolor: "#f5f7fa", minHeight: "100vh", pb: 5 }}>
      {/* --- Sticky Header (필터 포함) --- */}
      <Box sx={{ bgcolor: "white", px: 2, py: 2, position: "sticky", top: 0, zIndex: 10, borderBottom: "1px solid #eee", boxShadow: "0 2px 4px rgba(0,0,0,0.03)" }}>
        {/* 뒤로가기 & 타이틀 */}
        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
          <IconButton onClick={() => navigate(-1)} size="small">
            <ArrowBackIosNew fontSize="small" />
          </IconButton>
          <Typography variant="h6" fontWeight="bold">기구 현황</Typography>
        </Stack>
        
        {/* Filter 1: 카테고리 */}
        <Stack direction="row" spacing={1} sx={{  }}>
          {["ALL", "CARDIO", "WEIGHT"].map((cat) => (
            <Chip 
              key={cat} 
              label={cat === "ALL" ? "전체 기구" : cat === "CARDIO" ? "유산소" : "웨이트"} 
              onClick={() => setSelectedCategory(cat)}
              size="small"
              sx={{ 
                bgcolor: selectedCategory === cat ? "#212121" : "#f5f5f5", 
                color: selectedCategory === cat ? "white" : "#757575",
                fontWeight: 600,
                border: "none"
              }}
            />
          ))}
        </Stack>


      </Box>

      {/* --- Machine Grid --- */}
      <Container maxWidth="sm" sx={{ mt: 2 }}>
        {/* Filter 2: 상태 */}
        <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
          <Chip 
            label="전체 상태" 
            onClick={() => setStatusFilter("ALL")}
            size="small"
            variant={statusFilter === "ALL" ? "filled" : "outlined"}
            sx={{ 
                fontWeight: statusFilter === "ALL" ? 700 : 400,
                border: statusFilter === "ALL" ? "none" : "1px solid #e0e0e0" 
            }}
          />
          <Chip 
            icon={<CheckCircleOutline fontSize="small" />}
            label="사용 가능" 
            onClick={() => setStatusFilter("AVAILABLE")}
            size="small"
            variant={statusFilter === "AVAILABLE" ? "filled" : "outlined"}
            color="success"
            sx={{ 
              bgcolor: statusFilter === "AVAILABLE" ? "#e8f5e9" : "transparent",
              color: "#2e7d32",
              borderColor: "#c8e6c9",
              fontWeight: 700
            }}
          />
          <Chip 
            icon={<CancelOutlined fontSize="small" />}
            label="사용 중/대기" 
            onClick={() => setStatusFilter("UNAVAILABLE")}
            size="small"
            variant={statusFilter === "UNAVAILABLE" ? "filled" : "outlined"}
            color="error"
            sx={{ 
              bgcolor: statusFilter === "UNAVAILABLE" ? "#ffebee" : "transparent",
              color: "#c62828",
              borderColor: "#ffcdd2",
              fontWeight: 700
            }}
          />
        </Stack>

        <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 2, fontSize: "0.85rem" }}>
           조건에 맞는 기구 <strong>{filteredMachines.length}</strong>개가 있습니다.
        </Typography>

        <Grid container spacing={2}>
          {filteredMachines.map((machine) => {
            const progress = (machine.status !== "AVAILABLE" && machine.duration) 
              ? (machine.elapsed / machine.duration) * 100 
              : 0;

            return (
              <Grid item xs={6} key={machine.id}>
                <Card 
                  onClick={() => handleMachineClick(machine)}
                  sx={{ 
                    borderRadius: 3, 
                    boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                    cursor: "pointer",
                    border: selectedMachine?.id === machine.id ? "2px solid #212121" : "1px solid transparent",
                    opacity: machine.status === "AVAILABLE" ? 1 : 0.9,
                    transition: "all 0.2s",
                    position: "relative",
                    overflow: "hidden"
                  }}
                >
                  <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
                    <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1.5 }}>
                      <Chip 
                        label={getStatusLabel(machine)} 
                        size="small" 
                        sx={{ 
                          height: 20, 
                          fontSize: "0.65rem", 
                          bgcolor: `${getStatusColor(machine.status)}15`, 
                          color: getStatusColor(machine.status),
                          fontWeight: "bold"
                        }} 
                      />
                      <Box sx={{ fontSize: "1.2rem" }}>{machine.image}</Box>
                    </Box>

                    <Typography variant="body1" fontWeight="bold" noWrap>{machine.name}</Typography>
                    
                    {machine.status !== "AVAILABLE" ? (
                      <Stack direction="row" spacing={0.5} alignItems="center" mt={0.5}>
                        <AccessTime sx={{ fontSize: 12, color: "text.secondary" }} />
                        <Typography variant="caption" color="text.secondary">
                          대기 {machine.queue}명
                        </Typography>
                      </Stack>
                    ) : (
                      <Typography variant="caption" color="text.secondary">
                        {machine.type === "CARDIO" ? "유산소" : "웨이트"}
                      </Typography>
                    )}
                  </CardContent>

                  {/* 하단 진행률 바 */}
                  {machine.status !== "AVAILABLE" && (
                    <LinearProgress 
                      variant="determinate" 
                      value={progress} 
                      sx={{ 
                        position: "absolute", bottom: 0, left: 0, right: 0, height: 4, 
                        bgcolor: "#ffebee", 
                        "& .MuiLinearProgress-bar": { bgcolor: "#ef5350" } 
                      }} 
                    />
                  )}
                </Card>
              </Grid>
            );
          })}
        </Grid>
      </Container>

      {/* --- Action Drawer --- */}
      <Drawer
        anchor="bottom"
        open={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        PaperProps={{
          sx: { borderTopLeftRadius: 20, borderTopRightRadius: 20, maxWidth: "600px", mx: "auto" }
        }}
      >
        <Box sx={{ p: 3, pb: 5 }}>
          <Box sx={{ width: 40, height: 4, bgcolor: "#e0e0e0", borderRadius: 2, mx: "auto", mb: 3 }} />
          
          {selectedMachine && (
            <>
              <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 3 }}>
                <Avatar sx={{ bgcolor: "#f5f5f5", fontSize: "2rem", width: 56, height: 56 }}>
                  {selectedMachine.image}
                </Avatar>
                <Box>
                  <Typography variant="h6" fontWeight="bold">{selectedMachine.name}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {selectedMachine.type === "CARDIO" ? "유산소 Zone" : "웨이트 Zone"}
                  </Typography>
                </Box>
              </Stack>
              <Divider sx={{ mb: 3 }} />

              {selectedMachine.status === "AVAILABLE" ? (
                <Box>
                  <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 1, color: "#2e7d32" }}>
                    지금 바로 이용 가능합니다!
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    기구에 부착된 QR코드를 스캔하여 사용을 시작해주세요.
                  </Typography>
                  <Button
                    variant="contained"
                    fullWidth
                    size="large"
                    onClick={handleStartWorkout}
                    startIcon={<QrCodeScanner />}
                    sx={{ 
                      bgcolor: "#2e7d32", color: "white", py: 1.8, borderRadius: 3, fontWeight: "bold"
                    }}
                  >
                    QR 스캔하고 시작하기
                  </Button>
                </Box>
              ) : (
                <Box>
                   <Grid container spacing={2} sx={{ mb: 3 }}>
                     <Grid item xs={6}>
                       <Box sx={{ bgcolor: "#fafafa", p: 2, borderRadius: 2, textAlign: "center" }}>
                         <Typography variant="caption" color="text.secondary">남은 시간(예상)</Typography>
                         <Typography variant="h6" fontWeight="bold" color="error.main">
                           {selectedMachine.duration - selectedMachine.elapsed}분
                         </Typography>
                       </Box>
                     </Grid>
                     <Grid item xs={6}>
                       <Box sx={{ bgcolor: "#fafafa", p: 2, borderRadius: 2, textAlign: "center" }}>
                         <Typography variant="caption" color="text.secondary">현재 대기</Typography>
                         <Typography variant="h6" fontWeight="bold">
                           {selectedMachine.queue}명
                         </Typography>
                       </Box>
                     </Grid>
                   </Grid>
                  <Button
                    variant="contained"
                    fullWidth
                    size="large"
                    onClick={handleJoinQueue}
                    startIcon={<NotificationsActive />}
                    sx={{ 
                      bgcolor: "#212121", color: "white", py: 1.8, borderRadius: 3, fontWeight: "bold"
                    }}
                  >
                    대기 줄서기 (알림 신청)
                  </Button>
                </Box>
              )}
            </>
          )}
        </Box>
      </Drawer>
    </Box>
  );
}