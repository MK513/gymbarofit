import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Container,
  TextField,
  Button,
  Typography,
  Box,
  Paper,
  InputAdornment,
  Avatar,
  ToggleButton,
  ToggleButtonGroup,
  Divider,
} from "@mui/material";

// 아이콘 import (없다면 npm install @mui/icons-material 필요)
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import EmailIcon from "@mui/icons-material/Email";
import KeyIcon from "@mui/icons-material/Key";
import PersonIcon from "@mui/icons-material/Person";
import StoreIcon from "@mui/icons-material/Store";

import { loginMember, loginOwner } from "../api/Api";

export default function Login() {
  const navigate = useNavigate();
  const [role, setRole] = useState("member"); // member | owner

  const handleRoleChange = (event, newRole) => {
    if (newRole !== null) {
      setRole(newRole);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    const data = new FormData(e.target);
    const email = data.get("email");
    const pw = data.get("pw");

    try {
      const dto = { email, password: pw };
      if (role === "member") await loginMember(dto);
      else await loginOwner(dto);

      navigate("/");
    } catch {
      alert("로그인 실패: 이메일과 비밀번호를 확인해주세요.");
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          // 모바일(xs)에선 위쪽 여백 4, 태블릿 이상(sm)에선 8
          marginTop: { xs: 4, sm: 8 }, 
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          // 화면 높이가 작을 때도 중앙 정렬이 잘 되도록 설정
          minHeight: "80vh",
          justifyContent: "center", 
        }}
      >
        <Paper
          sx={{
            boxShadow: { xs: "none", sm: 6 }, // 모바일: 그림자 없음 / PC: 그림자 레벨 6
            borderRadius: { xs: 0, sm: 3 },   // 모바일: 네모 반듯하게 / PC: 둥글게
            p: { xs: 3, sm: 4 },
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            width: "100%",
            background: "#ffffff",
          }}
        >
          <Avatar sx={{ m: 1, bgcolor: "primary.main", width: 56, height: 56 }}>
            <LockOutlinedIcon fontSize="large" />
          </Avatar>
          
          <Typography component="h1" variant="h5" sx={{ mb: 3, fontWeight: 'bold' }}>
            로그인
          </Typography>

          <ToggleButtonGroup
            value={role}
            exclusive
            onChange={handleRoleChange}
            fullWidth
            sx={{ mb: 3 }}
          >
            <ToggleButton value="member" sx={{ py: 1.5 }}>
              <PersonIcon sx={{ mr: 1 }} />
              개인 회원
            </ToggleButton>
            <ToggleButton value="owner" sx={{ py: 1.5 }}>
              <StoreIcon sx={{ mr: 1 }} />
              기업 회원
            </ToggleButton>
          </ToggleButtonGroup>

          {/* ▼▼▼ 여기 수정됨: width: "100%" 추가 ▼▼▼ */}
          <Box component="form" onSubmit={handleLogin} noValidate sx={{ width: "100%", mt: 1 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="이메일 주소"
              name="email"
              autoComplete="email"
              autoFocus
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailIcon color="action" />
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="pw"
              label="비밀번호"
              type="password"
              id="password"
              autoComplete="current-password"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <KeyIcon color="action" />
                  </InputAdornment>
                ),
              }}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              sx={{ mt: 3, mb: 2, py: 1.5, fontSize: "1.1rem", fontWeight: "bold" }}
            >
              로그인
            </Button>

            <Divider sx={{ my: 2, color: "text.secondary", fontSize: "0.875rem" }}>
              또는
            </Divider>

            <Button
              fullWidth
              variant="outlined"
              component={Link}
              to="/signup"
              size="large"
              sx={{ py: 1.2 }}
            >
              회원가입 하러가기
            </Button>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
}