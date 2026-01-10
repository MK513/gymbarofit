import React, { useState } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Container,
  Box,
  TextField,
  InputAdornment,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemButton,
  ListItemIcon,
  Paper,
  Button,
  Stack,
  Divider,
  Chip,
  Avatar,
  CircularProgress
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { searchGym, registerMembership } from "../../api/Api";
import { useNotification } from "../../context/NotificationContext";

// 아이콘
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SearchIcon from "@mui/icons-material/Search";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import PlaceIcon from "@mui/icons-material/Place";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import MapIcon from "@mui/icons-material/Map";
import InfoIcon from "@mui/icons-material/Info";

// TODO: 카카오 지도 API 넣기

export default function Register() {
  const navigate = useNavigate();
  const { showNotification } = useNotification();

  // 상태 관리
  const [keyword, setKeyword] = useState("");
  const [loading, setLoading] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [selectedGym, setSelectedGym] = useState(null); // 선택된 헬스장 객체

  // 검색 핸들러
  const handleSearch = async () => {
    try {
      if (!keyword.trim()) return;

      setLoading(true);
      setSelectedGym(null); // 재검색 시 선택 초기화

      const dto = { keyword: keyword};
      const res = await searchGym(dto);
      setSearchResults(res.content);
      setLoading(false);
        
    } catch (error) {
      console.error("헬스장 목록 로딩 실패", error);
      showNotification("목록을 불러오지 못했습니다.", "error");
    }
  };

  // 엔터키 처리
  const handleKeyPress = (e) => {
    if (e.key === "Enter") handleSearch();
  };

  // 헬스장 선택 핸들러
  const handleSelectGym = (gym) => {
    setSelectedGym(gym);
  };

  // 등록 완료 핸들러
  const handleRegisterConfirm = async () => {
    try {
      if (!selectedGym) return;
      
      const dto = { gymId: selectedGym.id };
      const res = await registerMembership(dto);
      
      showNotification("등록이 완료되었습니다!", "success");
      navigate("/"); // 대시보드로 복귀

    } catch (error) {
      console.error("헬스장 등록 실패", error);
      showNotification(error.message, "error");
    }
  };

  return (
    <Box sx={{ bgcolor: "#f5f7fa", minHeight: "100vh", pb: 10 }}>
      {/* 1. 상단 헤더 */}
      <AppBar position="sticky" color="inherit" elevation={0} sx={{ borderBottom: "1px solid #e0e0e0" }}>
        <Toolbar>
          <IconButton edge="start" color="inherit" onClick={() => navigate(-1)} sx={{ mr: 1 }}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: "bold" }}>
            새 헬스장 등록
          </Typography>
        </Toolbar>
      </AppBar>

      <Container maxWidth="sm" sx={{ mt: 2 }}>
        <Stack spacing={2}>
          
          {/* 2. 검색창 영역 */}
          <Paper elevation={0} sx={{ p: 2, borderRadius: 3, border: "1px solid #eef2f6" }}>
            <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1 }}>
              다니시는 헬스장을 검색해주세요
            </Typography>
            <Box display="flex" gap={1}>
              <TextField
                fullWidth
                placeholder="헬스장 이름 또는 지역명 (예: 강남)"
                variant="outlined"
                size="small"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                onKeyPress={handleKeyPress}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon color="action" />
                    </InputAdornment>
                  ),
                }}
                sx={{ bgcolor: "#f9f9f9" }}
              />
              <Button 
                variant="contained" 
                disableElevation 
                onClick={handleSearch}
                sx={{ fontWeight: "bold", minWidth: 80 }}
              >
                검색
              </Button>
            </Box>
          </Paper>


          {/* 3. 검색 결과 목록 */}
          <Paper elevation={0} sx={{ borderRadius: 3, border: "1px solid #eef2f6" }}>
            {loading ? (
              <Box display="flex" justifyContent="center" alignItems="center" height={200}>
                <CircularProgress size={30} />
              </Box>
            ) : searchResults.length > 0 ? (
              <List disablePadding>
                 <Box px={2} py={1.5} bgcolor="#f8f9fa" borderBottom="1px solid #eee">
                   <Typography variant="caption" color="text.secondary" fontWeight="bold">
                     검색 결과 {searchResults.length}건
                   </Typography>
                 </Box>
                {searchResults.map((gym, index) => (
                  <React.Fragment key={gym.id}>
                    <ListItem disablePadding>
                      <ListItemButton 
                        onClick={() => handleSelectGym(gym)}
                        selected={selectedGym?.id === gym.id}
                        sx={{ 
                          py: 2,
                          '&.Mui-selected': { bgcolor: '#e3f2fd' },
                          '&.Mui-selected:hover': { bgcolor: '#bbdefb' }
                        }}
                      >
                        <ListItemIcon sx={{ minWidth: 40 }}>
                          <Avatar sx={{ bgcolor: selectedGym?.id === gym.id ? "primary.main" : "#eee", width: 36, height: 36 }}>
                            <PlaceIcon sx={{ color: selectedGym?.id === gym.id ? "#fff" : "#999", fontSize: 20 }} />
                          </Avatar>
                        </ListItemIcon>
                        <ListItemText
                          primary={
                            <Typography variant="subtitle2" fontWeight="bold" color={selectedGym?.id === gym.id ? "primary.main" : "text.primary"}>
                              {gym.name}
                            </Typography>
                          }
                          secondary={
                            <Typography variant="caption" color="text.secondary" display="block">
                              {gym.address} · {gym.distance}
                            </Typography>
                          }
                        />
                        {selectedGym?.id === gym.id && (
                          <CheckCircleIcon color="primary" fontSize="small" />
                        )}
                      </ListItemButton>
                    </ListItem>
                    {index < searchResults.length - 1 && <Divider component="li" />}
                  </React.Fragment>
                ))}
              </List>
            ) : (
              <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" height={200} color="text.secondary">
                <InfoIcon sx={{ fontSize: 40, mb: 1, opacity: 0.3 }} />
                <Typography variant="body2">검색 결과가 없습니다.</Typography>
              </Box>
            )}
          </Paper>

          {/* 4. 지도 영역 (Placeholder) */}
          {/* 실제 구현 시: Kakao Map 또는 Naver Map API 컴포넌트 위치 */}
          <Paper 
            elevation={0} 
            sx={{ 
              height: 200, 
              borderRadius: 3, 
              border: "1px solid #eef2f6", 
              overflow: "hidden",
              position: "relative",
              bgcolor: "#e0e0e0"
            }}
          >
            {/* 가짜 지도 배경 이미지 또는 색상 */}
            <Box 
              sx={{ 
                width: "100%", 
                height: "100%", 
                display: "flex", 
                flexDirection: "column",
                alignItems: "center", 
                justifyContent: "center",
                color: "text.secondary",
                backgroundImage: 'radial-gradient(#cfd8dc 1px, transparent 1px)',
                backgroundSize: '20px 20px'
              }}
            >
              {selectedGym ? (
                <>
                  <LocationOnIcon color="error" sx={{ fontSize: 40, mb: 1 }} />
                  <Typography variant="body2" fontWeight="bold" color="text.primary">
                    {selectedGym.name}
                  </Typography>
                  <Typography variant="caption">{selectedGym.address}</Typography>
                </>
              ) : (
                <>
                  <MapIcon sx={{ fontSize: 40, mb: 1, opacity: 0.5 }} />
                  <Typography variant="body2">검색 후 목록에서 선택하면</Typography>
                  <Typography variant="caption">이곳에 위치가 표시됩니다.</Typography>
                </>
              )}
            </Box>
            
            {/* 지도 위 플로팅 라벨 */}
            <Box sx={{ position: 'absolute', top: 10, right: 10 }}>
              <Chip label="지도 View" size="small" sx={{ bgcolor: 'rgba(255,255,255,0.9)', fontWeight: 'bold' }} />
            </Box>
          </Paper>

        </Stack>
      </Container>

      {/* 5. 하단 고정 등록 버튼 */}
      <Paper 
        elevation={10} 
        sx={{ 
          position: "fixed", 
          bottom: 0, 
          left: 0, 
          right: 0, 
          p: 2, 
          bgcolor: "white", 
          borderTopLeftRadius: 20, 
          borderTopRightRadius: 20,
          zIndex: 1000
        }}
      >
        <Container maxWidth="sm" sx={{ px: 0 }}>
          <Button
            fullWidth
            variant="contained"
            size="large"
            disabled={!selectedGym} // 선택 안하면 비활성화
            onClick={handleRegisterConfirm}
            sx={{ 
              py: 1.8, 
              fontSize: "1.1rem", 
              fontWeight: "bold", 
              borderRadius: 3,
              boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
            }}
          >
            {selectedGym ? `"${selectedGym.name}" 등록하기` : "헬스장을 선택해주세요"}
          </Button>
        </Container>
      </Paper>
    </Box>
  );
}