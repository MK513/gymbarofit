import React, { useState } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
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
  Divider,
  Avatar,
  CircularProgress
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { searchGym, registerGym } from "../../api/Api";
import { useNotification } from "../../context/NotificationContext";
import { useAuth } from "../../context/AuthContext";

// 아이콘
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SearchIcon from "@mui/icons-material/Search";
import PlaceIcon from "@mui/icons-material/Place";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import InfoIcon from "@mui/icons-material/Info";
import KakaoMap from "../../components/common/KakaoMap";

export default function Register() {
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  const { updateGym } = useAuth();

  const [keyword, setKeyword] = useState("");
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [selectedGym, setSelectedGym] = useState(null);

  const handleSearch = async () => {
    if (!keyword.trim()) return;
    setLoading(true);
    setSelectedGym(null);
    setHasSearched(true);
    try {
      const res = await searchGym({ keyword });
      setSearchResults(res.content);
    } catch (error) {
      console.error("헬스장 목록 로딩 실패", error);
      showNotification("목록을 불러오지 못했습니다.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") handleSearch();
  };

  const handleRegisterConfirm = async () => {
    if (!selectedGym) return;
    try {
      const res = await registerGym({ gymId: selectedGym.id });
      updateGym(res);
      showNotification("등록이 완료되었습니다!", "success");
      navigate("/");
    } catch (error) {
      console.error("헬스장 등록 실패", error);
      showNotification(error.message, "error");
    }
  };

  const showMap = hasSearched && searchResults.length > 0;

  return (
    <Box sx={{ position: "fixed", inset: 0, display: "flex", flexDirection: "column", bgcolor: "#f5f7fa", overflow: "hidden" }}>

      {/* 1. 헤더 */}
      <AppBar position="static" color="inherit" elevation={0} sx={{ borderBottom: "1px solid #e0e0e0", flexShrink: 0 }}>
        <Toolbar>
          <IconButton edge="start" color="inherit" onClick={() => navigate(-1)} sx={{ mr: 1 }}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h6" fontWeight="bold" sx={{ flexGrow: 1 }}>
            새 헬스장 등록
          </Typography>
        </Toolbar>
      </AppBar>

      {/* 2. 스크롤 영역 (검색창 + 결과 목록) */}
      <Box
        sx={{
          flex: 1,
          minHeight: 0,
          display: "flex",
          flexDirection: "column",
          maxWidth: 600,
          width: "100%",
          mx: "auto",
          pt: 2,
          gap: 2,
          overflow: "hidden",
        }}
      >
        {/* 2-1. 검색창 */}
        <Paper elevation={0} sx={{ p: 2, borderRadius: 3, border: "1px solid #eef2f6", flexShrink: 0 }}>
          <Typography variant="subtitle2" fontWeight="bold" mb={1}>
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
              onKeyDown={handleKeyPress}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon color="action" />
                    </InputAdornment>
                  ),
                },
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

        {/* 2-2. 검색 결과 (내부 스크롤) */}
        <Paper
          elevation={0}
          sx={{
            flex: 1,
            minHeight: 0,
            borderRadius: 3,
            border: "1px solid #eef2f6",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          }}
        >
          {loading ? (
            <Box display="flex" justifyContent="center" alignItems="center" flex={1}>
              <CircularProgress size={30} />
            </Box>
          ) : hasSearched && searchResults.length > 0 ? (
            <>
              <Box px={2} py={1.5} bgcolor="#f8f9fa" borderBottom="1px solid #eee" flexShrink={0}>
                <Typography variant="caption" color="text.secondary" fontWeight="bold">
                  검색 결과 {searchResults.length}건
                </Typography>
              </Box>
              <List disablePadding sx={{ overflowY: "auto", flex: 1 }}>
                {searchResults.map((gym, index) => (
                  <React.Fragment key={gym.id}>
                    <ListItem disablePadding>
                      <ListItemButton
                        onClick={() => setSelectedGym(gym)}
                        selected={selectedGym?.id === gym.id}
                        sx={{
                          py: 2,
                          "&.Mui-selected": { bgcolor: "#e3f2fd" },
                          "&.Mui-selected:hover": { bgcolor: "#bbdefb" },
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
                              {gym.address}{gym.distance ? ` · ${gym.distance}` : ""}
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
            </>
          ) : hasSearched ? (
            <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" flex={1} color="text.secondary">
              <InfoIcon sx={{ fontSize: 40, mb: 1, opacity: 0.3 }} />
              <Typography variant="body2">검색 결과가 없습니다.</Typography>
            </Box>
          ) : (
            <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" flex={1} color="text.secondary">
              <SearchIcon sx={{ fontSize: 48, mb: 1, opacity: 0.2 }} />
              <Typography variant="body2">헬스장 이름으로 검색해보세요</Typography>
            </Box>
          )}
        </Paper>

        {/* 2-3. 카카오 지도 (검색 결과 있을 때만) */}
        {showMap && (
          <Paper
            elevation={0}
            sx={{ height: 220, borderRadius: 3, border: "1px solid #eef2f6", overflow: "hidden", flexShrink: 0 }}
          >
            <KakaoMap address={selectedGym?.address} name={selectedGym?.name} />
          </Paper>
        )}
      </Box>

      {/* 3. 하단 등록 버튼 */}
      <Paper
        elevation={0}
        sx={{
          flexShrink: 0,
          p: 2,
          bgcolor: "white",
          borderTop: "1px solid #eee",
        }}
      >
        <Box maxWidth={600} mx="auto">
          <Button
            fullWidth
            variant="contained"
            size="large"
            disabled={!selectedGym}
            onClick={handleRegisterConfirm}
            sx={{ py: 1.8, fontSize: "1.1rem", fontWeight: "bold", borderRadius: 3 }}
          >
            {selectedGym ? `"${selectedGym.name}" 등록하기` : "헬스장을 선택해주세요"}
          </Button>
        </Box>
      </Paper>

    </Box>
  );
}
