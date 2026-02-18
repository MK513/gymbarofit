import React, { useState, useEffect } from "react";
import { 
  Box, Typography, IconButton, Grid, Card, CardContent, 
  Chip, Stack, Button, Drawer, Divider, Avatar, LinearProgress 
} from "@mui/material";
import { 
  ArrowBackIosNew, CheckCircleOutline, CancelOutlined, 
  NotificationsActive, AccessTime, 
  Build, Block, ReportProblem,
  DirectionsRun, DirectionsBike, FitnessCenter, AccessibilityNew, TrendingUp,
  PlayArrow 
} from "@mui/icons-material";
import { useNavigate, useLocation } from "react-router-dom";
import { useNotification } from "../../context/NotificationContext";
import { getEquipments, createUsage, createQueue } from "../../api/Api";
import { useAuth } from "../../context/AuthContext";
import { BUCKET_BASE_URL } from "../../api-config";
import { useSseNotifications } from "../../context/SseNotification";

export default function EquipmentReservation() {
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  const { user } = useAuth();
  const { equipmentUpdate } = useSseNotifications(user?.id);

  // --- 상태 관리 ---
  const allType = "전체 기구";
  const [categoryList, setCategoryList] = useState([allType]); 
  const [selectedCategory, setSelectedCategory] = useState(allType);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [selectedMachine, setSelectedMachine] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [machines, setMachines] = useState([]); 
  const [loading, setLoading] = useState(false);

  const { state } = useLocation();
  const usage = state?.usage;

  // --- 데이터 매핑 헬퍼 ---
  const mapEquipmentData = (item) => {
    return {
      id: item.id,
      name: item.name,
      type: item.type, 
      location: item.location,
      imageUrl: item.imageUrl || null, 
      itemStatus: item.itemStatus, 
      usageStatus: item.usageStatus, 
      queue: item.waitingCount,
      fallbackIcon: getFallbackIcon(item.name, item.type)
    };
  };

  // --- 헬퍼 함수들 (아이콘, 시간계산 등) ---
  const getFallbackIcon = (name, type) => {
    if (name.includes("러닝") || name.includes("트레드밀")) return <DirectionsRun />;
    if (name.includes("사이클") || name.includes("자전거")) return <DirectionsBike />;
    if (name.includes("천국") || name.includes("스텝")) return <TrendingUp />;
    if (type === "CARDIO") return <DirectionsRun />;
    if (type === "FREE_WEIGHT") return <FitnessCenter />;
    return <AccessibilityNew />;
  };

  // --- API 데이터 로드 ---
  const loadEquipmentData = async (gymId) => {
    if (!gymId) return;
    setLoading(true);
    try {
      const pathVariable = { gymId: gymId };
      const res = await getEquipments(pathVariable);
      if (res && res.equipmentTypes) setCategoryList([allType, ...res.equipmentTypes]);
      if (res && res.equipments) {
        const mappedData = res.equipments.map(item => mapEquipmentData(item));
        setMachines(mappedData);
      }
    } catch (error) {
      showNotification("기구 정보를 불러오지 못했습니다.", "error");
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => { loadEquipmentData(user?.gym?.id); }, []); 

  // 실시간 SSE 업데이트 감지 및 반영
  useEffect(() => {
    if (equipmentUpdate && equipmentUpdate.type === "UPDATE_EQUIPMENT") {
      const { body } = equipmentUpdate;
      
      console.log(`실시간 업데이트: ${body.name} (${body.usageStatus})`);

      // 서버에서 온 body 데이터를 바로 매핑 함수에 넣습니다.
      const mappedNewData = mapEquipmentData(body);

      // 1. 목록 업데이트
      setMachines((prev) =>
        prev.map((m) => (m.id === body.id ? mappedNewData : m))
      );

      // 2. 현재 열린 상세 정보 업데이트
      setSelectedMachine((prev) => {
        if (prev && prev.id === body.id) {
          return mappedNewData;
        }
        return prev;
      });

      // 상태 변화 알림
      if (body.usageStatus === "AVAILABLE") {
        showNotification(`${body.name} 기구를 사용하실 수 있습니다!`, "success");
      }
    }
  }, [equipmentUpdate]);

  // --- 필터링 로직 ---
  const filteredMachines = machines.filter(m => {
    const categoryMatch = selectedCategory === allType || m.type === selectedCategory;
    if (usage) {
        const isNotMyMachine = m.id !== usage.eid;
        const isOccupied = m.usageStatus === "IN_USE" && m.itemStatus === "OK"; // usageStatus 체크 값 수정 필요시 확인 ("IN_USE" vs 실제 값)
        return categoryMatch && isNotMyMachine && isOccupied;
    }
    let statusMatch = true;
    const isAvailable = m.itemStatus === "OK" && m.usageStatus === "AVAILABLE";
    if (statusFilter === "AVAILABLE") statusMatch = isAvailable;
    else if (statusFilter === "UNAVAILABLE") statusMatch = !isAvailable;
    return categoryMatch && statusMatch;
  });

  // --- 핸들러 ---
  const handleMachineClick = (machine) => { setSelectedMachine(machine); setIsDrawerOpen(true); };
  const handleStartWorkout = async () => {
    setIsDrawerOpen(false);
    try {
      showNotification(`${selectedMachine.name} 사용을 시작합니다.`, "success");
      await createUsage({equipmentId: selectedMachine.id});
      navigate("/");
    } catch (e) { showNotification(`${selectedMachine.name} 사용에 실패했습니다.`, "error"); }
  };
  const handleJoinQueue = async () => {
    //setMachines(prev => prev.map(m => m.id === selectedMachine.id ? { ...m, queue: m.queue + 1 } : m));
    await createQueue({equipmentId: selectedMachine.id});
    navigate("/");
    showNotification(`${selectedMachine.name} 대기열에 등록되었습니다.`, "success");
  };
  const getStatusColor = (machine) => {
    if (machine.itemStatus === "BROKEN") return "#d32f2f"; 
    if (machine.itemStatus === "MAINTENANCE") return "#ed6c02"; 
    if (machine.itemStatus === "RETIRED") return "#9e9e9e"; 
    if (machine.usageStatus === "AVAILABLE") return "#4caf50"; 
    return "#2196f3"; 
  };
  const getStatusLabel = (machine) => {
    if (machine.itemStatus === "BROKEN") return "고장";
    if (machine.itemStatus === "MAINTENANCE") return "점검";
    if (machine.itemStatus === "RETIRED") return "불가";
    if (machine.usageStatus === "AVAILABLE") return "가능"; 
    return "사용중";
  };

  return (
    // [수정 1] Flex Column 레이아웃 적용
    <Box sx={{ bgcolor: "#f5f7fa", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      
      {/* Header */}
      <Box sx={{ bgcolor: "white", px: 2, py: 2, position: "sticky", top: 0, zIndex: 10, borderBottom: "1px solid #eee", boxShadow: "0 2px 4px rgba(0,0,0,0.03)" }}>
        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
          <IconButton onClick={() => navigate(-1)} size="small"><ArrowBackIosNew fontSize="small" /></IconButton>
          <Typography variant="h6" fontWeight="bold">{usage ? "다음 기구 예약하기" : "기구 현황"}</Typography>
        </Stack>
        <Stack direction="row" spacing={1} sx={{ overflowX: "auto", pb: 0.5, "&::-webkit-scrollbar": { display: "none" } }}>
          {categoryList.map((cat) => (
            <Chip key={cat} label={cat} onClick={() => setSelectedCategory(cat)} size="small" sx={{ bgcolor: selectedCategory === cat ? "#212121" : "#f5f5f5", color: selectedCategory === cat ? "white" : "#757575", fontWeight: 600, border: "none", flexShrink: 0 }} />
          ))}
        </Stack>
      </Box>

      {/* [수정 2] 본문 영역에 flex: 1 적용 (남은 공간 차지) */}
      <Box sx={{ mt: 2, px: 1.5, flex: 1 }}> 
        {!usage && (
            <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
            <Chip label="전체" onClick={() => setStatusFilter("ALL")} size="small" variant={statusFilter === "ALL" ? "filled" : "outlined"} sx={{ fontWeight: 700 }} />
            <Chip icon={<CheckCircleOutline fontSize="small" />} label="가능" onClick={() => setStatusFilter("AVAILABLE")} size="small" variant={statusFilter === "AVAILABLE" ? "filled" : "outlined"} color="success" />
            <Chip icon={<CancelOutlined fontSize="small" />} label="불가" onClick={() => setStatusFilter("UNAVAILABLE")} size="small" variant={statusFilter === "UNAVAILABLE" ? "filled" : "outlined"} color="error" />
            </Stack>
        )}

        <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1, fontSize: "0.85rem" }}>
           {usage ? "대기 가능한 기구" : "조건에 맞는 기구"} <strong>{filteredMachines.length}</strong>개
        </Typography>

        {filteredMachines.length === 0 ? (
          <Box sx={{ py: 8, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", opacity: 0.7 }}>
             <FitnessCenter sx={{ fontSize: 60, color: "#e0e0e0", mb: 2 }} />
             <Typography variant="subtitle1" fontWeight="bold" color="text.secondary">현재 사용 혹은 예약 가능한 기구가 없습니다.</Typography>
             <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>잠시 후 다시 확인해주시거나 다른 필터를 선택해주세요.</Typography>
          </Box>
        ) : (
          <Grid container spacing={1.5} sx={{ mb: 2 }}> 
            {filteredMachines.map((machine) => {
              const isOk = machine.itemStatus === "OK";
              const color = getStatusColor(machine);
              return (
                <Grid item size={{ xs:4}} key={machine.id}>
                  <Card onClick={() => handleMachineClick(machine)} sx={{ borderRadius: 3, boxShadow: "0 2px 8px rgba(0,0,0,0.05)", cursor: "pointer", border: selectedMachine?.id === machine.id ? "2px solid #212121" : "1px solid transparent", opacity: isOk && machine.usageStatus === "AVAILABLE" ? 1 : 0.8, bgcolor: !isOk ? "#f5f5f5" : "white", transition: "all 0.2s", position: "relative", overflow: "hidden", height: "100%", display: "flex", flexDirection: "column", minHeight: "140px" }}>
                    <CardContent sx={{ p: 1.5, flex: 1, display: "flex", flexDirection: "column", "&:last-child": { pb: 1.5 } }}>
                      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                        <Chip label={getStatusLabel(machine)} size="small" sx={{ height: 18, fontSize: "0.6rem", px: 0, bgcolor: `${color}15`, color: color, fontWeight: "bold", border: `1px solid ${color}30` }} />
                      </Box>
                      <Box sx={{ flex: 1, display: "flex", justifyContent: "center", alignItems: "center", mb: 1, minHeight: 50 }}>
                        {machine.imageUrl ? (
                          <Box component="img" src={`${BUCKET_BASE_URL}${machine.imageUrl}`} alt={machine.name} onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }} sx={{ width: "100%", height: "100%", maxHeight: 60, objectFit: "contain" }} />
                        ) : null}
                        <Box sx={{ display: machine.imageUrl ? "none" : "flex", justifyContent: "center", alignItems: "center", color: isOk && machine.usageStatus === "AVAILABLE" ? "primary.main" : "text.secondary" }}>
                           {React.cloneElement(machine.fallbackIcon, { sx: { fontSize: 40 } })}
                        </Box>
                      </Box>
                      <Typography variant="body2" fontWeight="bold" noWrap align="center" color={!isOk ? "text.secondary" : "text.primary"} sx={{ textDecoration: !isOk ? "line-through" : "none", mb: 0.5 }}>{machine.name}</Typography>
                      <Box sx={{ mt: "auto", display: "flex", justifyContent: "center" }}>
                          {!isOk ? ( <Stack direction="row" spacing={0.5} alignItems="center"><Build sx={{ fontSize: 10, color: "text.secondary" }} /><Typography variant="caption" sx={{ fontSize: "0.65rem" }} color="text.secondary">점검</Typography></Stack> ) : machine.usageStatus !== "AVAILABLE" ? ( <Stack direction="row" spacing={0.5} alignItems="center"><AccessTime sx={{ fontSize: 10, color: "text.secondary" }} /><Typography variant="caption" sx={{ fontSize: "0.65rem" }} color="text.secondary">대기 {machine.queue}</Typography></Stack> ) : ( <Typography variant="caption" sx={{ fontSize: "0.65rem" }} color="text.secondary" noWrap>{machine.type}</Typography> )}
                      </Box>
                    </CardContent>
                    {isOk && machine.usageStatus !== "AVAILABLE" && ( <LinearProgress variant="determinate" value={machine.progressPercent} sx={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 4, bgcolor: "#e3f2fd", "& .MuiLinearProgress-bar": { bgcolor: "#2196f3" } }} /> )}
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        )}
      </Box>

      {/* 맨 아래에 위치하는 안내 문구 (flex flow상 마지막) */}
      <Box sx={{ p: 2, bgcolor: "#f5f7fa", mt: 2 }}>
          <Box sx={{ bgcolor: "#f0f2f5", p: 1.5, borderRadius: 2 }}>
            <Typography variant="caption" display="block" color="text.secondary" sx={{ mb: 0.5, fontWeight: 500 }}>
                • 회원당 하나의 기구만 사용 및 예약 가능합니다.
            </Typography>
            <Typography variant="caption" display="block" color="text.secondary" sx={{ fontWeight: 500 }}>
                • 사용 중인 기구가 있을 경우 대기 예약만 가능합니다.
            </Typography>
          </Box>
      </Box>

      {/* Drawer */}
      <Drawer
        anchor="bottom" open={isDrawerOpen} onClose={() => setIsDrawerOpen(false)}
        PaperProps={{ sx: { borderTopLeftRadius: 20, borderTopRightRadius: 20, maxWidth: "600px", mx: "auto" } }}
      >
        <Box sx={{ p: 3, pb: 5 }}>
          <Box sx={{ width: 40, height: 4, bgcolor: "#e0e0e0", borderRadius: 2, mx: "auto", mb: 3 }} />
          {selectedMachine && (
            <>
              <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 3 }}>
                <Avatar sx={{ bgcolor: "#f5f5f5", width: 64, height: 64 }} variant="rounded">
                  {selectedMachine.imageUrl ? <img src={`${BUCKET_BASE_URL}${selectedMachine.imageUrl}`} alt={selectedMachine.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : React.cloneElement(selectedMachine.fallbackIcon, { sx: { fontSize: 32 } }) }
                </Avatar>
                <Box>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <Typography variant="h6" fontWeight="bold">{selectedMachine.name}</Typography>
                    {selectedMachine.itemStatus !== "OK" && <Chip label={getStatusLabel(selectedMachine)} size="small" color="error" variant="outlined" />}
                  </Stack>
                  <Typography variant="body2" color="text.secondary">{selectedMachine.type} Zone ({selectedMachine.location})</Typography>
                </Box>
              </Stack>
              <Divider sx={{ mb: 3 }} />
              
              {selectedMachine.itemStatus !== "OK" ? (
                 <Box sx={{ textAlign: "center", py: 2 }}>
                   <ReportProblem sx={{ fontSize: 40, color: "#d32f2f", mb: 1 }} />
                   <Typography variant="subtitle1" fontWeight="bold">현재 이용이 불가능한 기구입니다.</Typography>
                   <Button variant="outlined" fullWidth color="error" disabled startIcon={<Block />} sx={{ mt: 2, borderRadius: 3, py: 1.5 }}>예약 불가</Button>
                 </Box>
              ) : (
                selectedMachine.usageStatus !== "AVAILABLE" ? (
                  <Box>
                     <Grid container spacing={2} sx={{ mb: 3 }}>
                       <Grid item xs={6}><Box sx={{ bgcolor: "#fafafa", p: 2, borderRadius: 2, textAlign: "center" }}><Typography variant="caption" color="text.secondary">대기 인원</Typography><Typography variant="h6" fontWeight="bold">{selectedMachine.queue}명</Typography></Box></Grid>
                     </Grid>
                    <Button variant="contained" fullWidth size="large" onClick={handleJoinQueue} startIcon={<NotificationsActive />} sx={{ bgcolor: "#212121", color: "white", py: 1.8, borderRadius: 3, fontWeight: "bold" }}>대기 줄서기</Button>
                  </Box>
                ) : (
                  <Button variant="contained" fullWidth size="large" onClick={handleStartWorkout} startIcon={<PlayArrow />} sx={{ bgcolor: "#2e7d32", color: "white", py: 1.8, borderRadius: 3, fontWeight: "bold" }}>바로 사용 시작하기</Button>
                )
              )}
            </>
          )}
        </Box>
      </Drawer>
    </Box>
  );
}