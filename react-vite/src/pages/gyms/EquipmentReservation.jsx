import React, { useState, useEffect } from "react";
import { 
  Box, Container, Typography, IconButton, Grid, Card, CardContent, 
  Chip, Stack, Button, Drawer, Divider, Avatar, LinearProgress 
} from "@mui/material";
import { 
  ArrowBackIosNew, CheckCircleOutline, CancelOutlined, 
  QrCodeScanner, NotificationsActive, AccessTime, 
  Build, Block, ReportProblem,
  DirectionsRun, DirectionsBike, FitnessCenter, AccessibilityNew, TrendingUp,
  PlayArrow // [추가] 바로 시작 아이콘
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useNotification } from "../../context/NotificationContext";
import { getEquipments, startUsage } from "../../api/Api";
import { useAuth } from "../../context/AuthContext";
import { BUCKET_BASE_URL } from "../../api-config";


export default function EquipmentReservation() {
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  const { user } = useAuth();

  // --- 상태 관리 ---
  const allType = "전체 기구";
  const [categoryList, setCategoryList] = useState([allType]); 
  const [selectedCategory, setSelectedCategory] = useState(allType);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [selectedMachine, setSelectedMachine] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [machines, setMachines] = useState([]); 
  const [loading, setLoading] = useState(false);

  // --- 헬퍼: 아이콘 (DB 이미지가 없을 때 대체용) ---
  const getFallbackIcon = (name, type) => {
    if (name.includes("러닝") || name.includes("트레드밀")) return <DirectionsRun />;
    if (name.includes("사이클") || name.includes("자전거")) return <DirectionsBike />;
    if (name.includes("천국") || name.includes("스텝")) return <TrendingUp />;
    
    if (type === "CARDIO") return <DirectionsRun />;
    if (type === "FREE_WEIGHT") return <FitnessCenter />;
    return <AccessibilityNew />;
  };

  // --- 헬퍼: 남은 시간 계산 ---
  const getRemainingMinutes = (expiredAt) => {
    if (!expiredAt) return 0;
    const now = new Date();
    const end = new Date(expiredAt);
    const diffMs = end - now;
    if (diffMs <= 0) return 0;
    return Math.floor(diffMs / 60000);
  };

  // --- API 호출 및 데이터 가공 ---
  const loadEquipmentData = async (gymId) => {
      if (!gymId) return;
      
      setLoading(true);
      try {
        const pathVariable = { gymId: gymId };
        const res = await getEquipments(pathVariable); 
        
        if (res && res.equipmentTypes) {
          setCategoryList([allType, ...res.equipmentTypes]);
        }

        if (res && res.equipments) {
          const mappedData = res.equipments.map(item => {
            const remaining = getRemainingMinutes(item.expiredAt);
            
            return {
              id: item.id,
              name: item.name,
              type: item.type, 
              location: item.location,
              imageUrl: item.imageUrl || null, 
              itemStatus: item.itemStatus, 
              usageStatus: item.usageStatus, 
              queue: item.waitingCount,
              expiredAt: item.expiredAt,
              remainingMinutes: remaining,
              progressPercent: (item.itemStatus !== "OK" || item.usageStatus === "AVAILABLE") 
                ? 0 
                : Math.min(100, ((50 - remaining) / 50) * 100),
              
              // 이미지가 깨지거나 없을 때 쓸 아이콘 미리 준비
              fallbackIcon: getFallbackIcon(item.name, item.type)
            };
          });
          setMachines(mappedData);
        }
      } catch (error) {
        console.error("정보 로딩 실패", error);
        showNotification("기구 정보를 불러오지 못했습니다.", "error");
      } finally {
        setLoading(false);
      }
  };
  
  useEffect(() => {
    loadEquipmentData(user?.gym?.id);
  }, []); 

  // --- 필터링 로직 ---
  const filteredMachines = machines.filter(m => {
    const categoryMatch = selectedCategory === allType || m.type === selectedCategory;
    
    let statusMatch = true;
    const isAvailable = m.itemStatus === "OK" && m.usageStatus === "AVAILABLE";

    if (statusFilter === "AVAILABLE") {
      statusMatch = isAvailable;
    } else if (statusFilter === "UNAVAILABLE") {
      statusMatch = !isAvailable;
    }
    return categoryMatch && statusMatch;
  });

  // --- 핸들러 ---
  const handleMachineClick = (machine) => {
    setSelectedMachine(machine);
    setIsDrawerOpen(true);
  };

  const handleStartWorkout = async () => {
    setIsDrawerOpen(false);
    try {
      // TODO qr 관련 로직으로 변경
      // 바로 사용 시작 로직
      showNotification(`${selectedMachine.name} 사용을 시작합니다.`, "success");
  
      const pathVariable = {equipmentId: selectedMachine.id};
      await startUsage(pathVariable)
  
      navigate("/");
    } catch (e) {
      showNotification(`${selectedMachine.name} 사용에 실패했습니다.`, "error");
    }
  };

  const handleJoinQueue = () => {
    setMachines(prev => prev.map(m => 
      m.id === selectedMachine.id ? { ...m, queue: m.queue + 1 } : m
    ));
    setIsDrawerOpen(false);
    showNotification(`${selectedMachine.name} 대기열에 등록되었습니다.`, "success");
  };

  // 이미지 로드 에러 핸들러
  const handleImageError = (e) => {
    e.target.style.display = 'none'; // 깨진 이미지 숨김
  };

  // --- UI 헬퍼 ---
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
    if (machine.remainingMinutes > 0) return `${machine.remainingMinutes}분`; 
    return "사용중";
  };

  return (
    <Box sx={{ bgcolor: "#f5f7fa", minHeight: "100vh", pb: 5 }}>
      {/* --- Sticky Header --- */}
      <Box sx={{ bgcolor: "white", px: 2, py: 2, position: "sticky", top: 0, zIndex: 10, borderBottom: "1px solid #eee", boxShadow: "0 2px 4px rgba(0,0,0,0.03)" }}>
        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
          <IconButton onClick={() => navigate(-1)} size="small">
            <ArrowBackIosNew fontSize="small" />
          </IconButton>
          <Typography variant="h6" fontWeight="bold">기구 현황</Typography>
        </Stack>
        
        <Stack direction="row" spacing={1} sx={{ overflowX: "auto", pb: 0.5, "&::-webkit-scrollbar": { display: "none" } }}>
          {categoryList.map((cat) => (
            <Chip 
              key={cat} 
              label={cat} 
              onClick={() => setSelectedCategory(cat)}
              size="small"
              sx={{ 
                bgcolor: selectedCategory === cat ? "#212121" : "#f5f5f5", 
                color: selectedCategory === cat ? "white" : "#757575",
                fontWeight: 600, border: "none", flexShrink: 0
              }}
            />
          ))}
        </Stack>
      </Box>

      {/* --- Machine Grid --- */}
      <Box sx={{ mt: 2, px: 1.5 }}> 
        <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
          <Chip label="전체" onClick={() => setStatusFilter("ALL")} size="small" variant={statusFilter === "ALL" ? "filled" : "outlined"} sx={{ fontWeight: 700 }} />
          <Chip icon={<CheckCircleOutline fontSize="small" />} label="가능" onClick={() => setStatusFilter("AVAILABLE")} size="small" variant={statusFilter === "AVAILABLE" ? "filled" : "outlined"} color="success" />
          <Chip icon={<CancelOutlined fontSize="small" />} label="불가" onClick={() => setStatusFilter("UNAVAILABLE")} size="small" variant={statusFilter === "UNAVAILABLE" ? "filled" : "outlined"} color="error" />
        </Stack>

        <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 2, fontSize: "0.85rem" }}>
           조건에 맞는 기구 <strong>{filteredMachines.length}</strong>개
        </Typography>

        <Grid container spacing={1.5}> 
          {filteredMachines.map((machine) => {
            const isOk = machine.itemStatus === "OK";
            const color = getStatusColor(machine);
            
            return (
              <Grid item size={{ xs:4}} key={machine.id}>
                <Card 
                  onClick={() => handleMachineClick(machine)}
                  sx={{ 
                    borderRadius: 3, 
                    boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                    cursor: "pointer",
                    border: selectedMachine?.id === machine.id ? "2px solid #212121" : "1px solid transparent",
                    opacity: isOk && machine.usageStatus === "AVAILABLE" ? 1 : 0.8,
                    bgcolor: !isOk ? "#f5f5f5" : "white",
                    transition: "all 0.2s",
                    position: "relative",
                    overflow: "hidden",
                    height: "100%", 
                    display: "flex", flexDirection: "column",
                    minHeight: "140px" 
                  }}
                >
                  <CardContent sx={{ p: 1.5, flex: 1, display: "flex", flexDirection: "column", "&:last-child": { pb: 1.5 } }}>
                    <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                      <Chip 
                        label={getStatusLabel(machine)} 
                        size="small" 
                        sx={{ 
                          height: 18, fontSize: "0.6rem", px: 0,
                          bgcolor: `${color}15`, color: color,
                          fontWeight: "bold", border: `1px solid ${color}30`
                        }} 
                      />
                    </Box>

                    {/* --- 이미지 영역 --- */}
                    <Box 
                      sx={{ 
                        flex: 1, display: "flex", justifyContent: "center", alignItems: "center", mb: 1,
                        minHeight: 50 // 이미지가 로딩되기 전에도 공간 확보
                      }}
                    >
                      {machine.imageUrl ? (
                        <Box
                          component="img"
                          src={`${BUCKET_BASE_URL}${machine.imageUrl}`}
                          alt={machine.name}
                          onError={(e) => {
                            e.target.style.display = 'none'; // 이미지 숨김
                            e.target.nextSibling.style.display = 'flex'; // 뒤에 숨겨둔 아이콘 표시
                          }}
                          sx={{ 
                            width: "100%", height: "100%", 
                            maxHeight: 60, // 너무 크지 않게 제한
                            objectFit: "contain" 
                          }}
                        />
                      ) : null}
                      
                      {/* 폴백 아이콘: 이미지가 없거나(null) 에러나서 숨겨졌을 때 보여짐 */}
                      <Box 
                        sx={{ 
                          display: machine.imageUrl ? "none" : "flex", // 이미지가 있으면 일단 숨김 (onError에서 킴)
                          justifyContent: "center", alignItems: "center",
                          color: isOk && machine.usageStatus === "AVAILABLE" ? "primary.main" : "text.secondary"
                        }}
                      >
                         {React.cloneElement(machine.fallbackIcon, { sx: { fontSize: 40 } })}
                      </Box>
                    </Box>

                    <Typography 
                      variant="body2" fontWeight="bold" noWrap align="center"
                      color={!isOk ? "text.secondary" : "text.primary"}
                      sx={{ textDecoration: !isOk ? "line-through" : "none", mb: 0.5 }}
                    >
                      {machine.name}
                    </Typography>
                    
                    <Box sx={{ mt: "auto", display: "flex", justifyContent: "center" }}>
                        {!isOk ? (
                        <Stack direction="row" spacing={0.5} alignItems="center">
                            <Build sx={{ fontSize: 10, color: "text.secondary" }} />
                            <Typography variant="caption" sx={{ fontSize: "0.65rem" }} color="text.secondary">점검</Typography>
                        </Stack>
                        ) : machine.usageStatus !== "AVAILABLE" ? (
                        <Stack direction="row" spacing={0.5} alignItems="center">
                            <AccessTime sx={{ fontSize: 10, color: "text.secondary" }} />
                            <Typography variant="caption" sx={{ fontSize: "0.65rem" }} color="text.secondary">대기 {machine.queue}</Typography>
                        </Stack>
                        ) : (
                        <Typography variant="caption" sx={{ fontSize: "0.65rem" }} color="text.secondary" noWrap>{machine.type}</Typography>
                        )}
                    </Box>
                  </CardContent>

                  {isOk && machine.usageStatus !== "AVAILABLE" && (
                    <LinearProgress variant="determinate" value={machine.progressPercent} sx={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 4, bgcolor: "#e3f2fd", "& .MuiLinearProgress-bar": { bgcolor: "#2196f3" } }} />
                  )}
                </Card>
              </Grid>
            );
          })}
        </Grid>
      </Box>

      {/* --- Drawer --- */}
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
                  {/* Drawer에서도 이미지 우선, 없으면 아이콘 */}
                  {selectedMachine.imageUrl ? (
                    <img src={`${BUCKET_BASE_URL}${selectedMachine.imageUrl}`} alt={selectedMachine.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    React.cloneElement(selectedMachine.fallbackIcon, { sx: { fontSize: 32 } })
                  )}
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
                       <Grid item xs={6}><Box sx={{ bgcolor: "#fafafa", p: 2, borderRadius: 2, textAlign: "center" }}><Typography variant="caption" color="text.secondary">남은 시간</Typography><Typography variant="h6" fontWeight="bold" color="primary.main">{selectedMachine.remainingMinutes}분</Typography></Box></Grid>
                       <Grid item xs={6}><Box sx={{ bgcolor: "#fafafa", p: 2, borderRadius: 2, textAlign: "center" }}><Typography variant="caption" color="text.secondary">대기 인원</Typography><Typography variant="h6" fontWeight="bold">{selectedMachine.queue}명</Typography></Box></Grid>
                     </Grid>
                    <Button variant="contained" fullWidth size="large" onClick={handleJoinQueue} startIcon={<NotificationsActive />} sx={{ bgcolor: "#212121", color: "white", py: 1.8, borderRadius: 3, fontWeight: "bold" }}>대기 줄서기</Button>
                  </Box>
                ) : (
                  // [QR 관련 코드 보존 - 원본 버튼 주석 처리]
                  /*
                  <Button variant="contained" fullWidth size="large" onClick={handleStartWorkout} startIcon={<QrCodeScanner />} sx={{ bgcolor: "#2e7d32", color: "white", py: 1.8, borderRadius: 3, fontWeight: "bold" }}>QR 스캔하고 시작하기</Button>
                  */

                  // [임시 변경] 바로 사용 시작 버튼
                  <Button 
                    variant="contained" 
                    fullWidth 
                    size="large" 
                    onClick={handleStartWorkout} 
                    startIcon={<PlayArrow />} 
                    sx={{ bgcolor: "#2e7d32", color: "white", py: 1.8, borderRadius: 3, fontWeight: "bold" }}
                  >
                    바로 사용 시작하기
                  </Button>
                )
              )}
            </>
          )}
        </Box>
      </Drawer>
    </Box>
  );
}