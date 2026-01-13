import React from "react";
import { Box, AppBar, Toolbar, IconButton, Typography, Container, Button } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import LockIcon from "@mui/icons-material/Lock";

export default function LockerEmptyState({ onBack }) {
  return (
    <Box sx={{ bgcolor: "#f5f7fa", minHeight: "100vh" }}>
      <AppBar position="sticky" color="inherit" elevation={0} sx={{ borderBottom: '1px solid #e0e0e0', bgcolor: "white" }}>
        <Toolbar>
          <IconButton edge="start" color="inherit" onClick={onBack} sx={{ mr: 1 }}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: "bold" }}>보관함 배정</Typography>
        </Toolbar>
      </AppBar>
      <Container maxWidth="sm" sx={{ mt: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', opacity: 0.7 }}>
        <LockIcon sx={{ fontSize: 80, color: '#bdbdbd', mb: 2 }} />
        <Typography variant="h6" gutterBottom color="textSecondary" fontWeight="bold">등록된 보관함 구역이 없습니다.</Typography>
        <Button variant="contained" onClick={onBack} sx={{ borderRadius: 2, px: 4, py: 1 }}>뒤로 가기</Button>
      </Container>
    </Box>
  );
}