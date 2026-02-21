import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  TextField,
  Button,
  Typography,
  Box,
  InputAdornment,
  IconButton,
} from "@mui/material";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import StorefrontOutlinedIcon from "@mui/icons-material/StorefrontOutlined";
import FitnessCenterIcon from "@mui/icons-material/FitnessCenter";

import { loginMember, loginOwner } from "../api/Api";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [role, setRole] = useState("member");
  const [showPw, setShowPw] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    const data = new FormData(e.target);
    const email = data.get("email");
    const pw = data.get("pw");
    try {
      const dto = { email, password: pw };
      if (role === "member") {
        const res = await loginMember(dto);
        login(res.userInfo, res.token.accessToken);
        navigate("/members");
      } else {
        const res = await loginOwner(dto);
        login(res.userInfo, res.token.accessToken);
        navigate("/owners");
      }
    } catch (e) {
      console.log("error", e);
      alert("로그인에 실패했습니다.");
    }
  };

  return (
    <Box
      sx={{
        height: "100vh",
        overflow: "hidden",
        maxWidth: "100vw",
        display: "flex",
        flexDirection: { xs: "column", md: "row" },
      }}
    >
      {/* ━━━━━ LEFT : 히어로 패널 ━━━━━ */}
      <Box
        sx={{
          width: { xs: "100%", md: "50%" },
          height: { xs: "64px", sm: "35vh", md: "100vh" },
          flexShrink: 0,
          background: "linear-gradient(150deg, #0d1117 0%, #151f2e 100%)",
          position: "relative",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          justifyContent: { xs: "center", md: "flex-end" },
          p: { xs: "0 24px", sm: "28px 44px", md: "0 60px 72px 60px" },
        }}
      >
        {/* 장식: 상단 우측 링 */}
        <Box
          sx={{
            position: "absolute",
            top: { xs: -100, md: -140 },
            right: { xs: -100, md: -120 },
            width: { xs: 300, md: 500 },
            height: { xs: 300, md: 500 },
            borderRadius: "50%",
            border: "60px solid #1976D2",
            opacity: 0.1,
          }}
        />
        {/* 장식: 하단 좌측 링 */}
        <Box
          sx={{
            position: "absolute",
            bottom: { xs: -70, md: -90 },
            left: { xs: -70, md: -90 },
            width: { xs: 220, md: 320 },
            height: { xs: 220, md: 320 },
            borderRadius: "50%",
            border: "40px solid #1976D2",
            opacity: 0.07,
          }}
        />
        {/* 장식: 사선 스트라이프 */}
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "repeating-linear-gradient(55deg, transparent, transparent 38px, rgba(255,255,255,0.018) 38px, rgba(255,255,255,0.018) 40px)",
            pointerEvents: "none",
          }}
        />
        {/* 장식: 우측 하단 워터마크 */}
        <Typography
          sx={{
            position: "absolute",
            bottom: { xs: -16, md: -28 },
            right: { xs: -8, md: -16 },
            fontSize: { xs: "7rem", md: "13rem" },
            fontWeight: 900,
            color: "rgba(255,255,255,0.025)",
            letterSpacing: -6,
            lineHeight: 1,
            userSelect: "none",
            pointerEvents: "none",
          }}
        >
          GYM
        </Typography>
        {/* 액센트 라인: 모바일 → 히어로 하단(폼 바로 위), 데스크톱 → 우측 세로 */}
        <Box
          sx={{
            position: "absolute",
            bottom: { xs: 0, md: "auto" },
            top: { xs: "auto", md: 0 },
            left: { xs: 0, md: "auto" },
            right: { xs: "auto", md: 0 },
            width: { xs: "100%", md: 3 },
            height: { xs: 3, md: "100%" },
            background: "linear-gradient(90deg, #1976D2, #42a5f5)",
          }}
        />

        {/* 컨텐츠 */}
        <Box sx={{ position: "relative", zIndex: 1 }}>
          {/* 로고 */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: { xs: 1.5, md: 5 } }}>
            <Box
              sx={{
                width: { xs: 28, md: 36 },
                height: { xs: 28, md: 36 },
                borderRadius: 1.5,
                bgcolor: "#1976D2",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <FitnessCenterIcon sx={{ color: "white", fontSize: { xs: 16, md: 20 } }} />
            </Box>
            <Typography
              sx={{
                fontWeight: 900,
                color: "white",
                fontSize: { xs: "0.95rem", md: "1rem" },
                letterSpacing: 3,
              }}
            >
              GYMBAROFIT
            </Typography>
          </Box>

          {/* 슬로건 — sm 이상부터 표시 */}
          <Box sx={{ display: { xs: "none", sm: "block" } }}>
            <Typography
              sx={{
                fontWeight: 900,
                color: "white",
                fontSize: { sm: "2rem", md: "2.8rem" },
                lineHeight: 1.2,
                letterSpacing: -1,
              }}
            >
              매일의 땀이<br />결과를 만든다
            </Typography>
            <Box
              sx={{
                mt: 2,
                width: 48,
                height: 4,
                borderRadius: 2,
                bgcolor: "#1976D2",
              }}
            />
            <Typography
              sx={{
                mt: 2,
                color: "rgba(255,255,255,0.4)",
                fontSize: "0.875rem",
                display: { sm: "none", md: "block" },
              }}
            >
              당신의 피트니스 여정을 함께합니다
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* ━━━━━ RIGHT : 폼 패널 ━━━━━ */}
      <Box
        sx={{
          flex: 1,
          overflow: "hidden",
          display: "flex",
          alignItems: { xs: "flex-start", md: "center" },
          justifyContent: "center",
          bgcolor: "#f5f7fa",
          p: { xs: "40px 28px 0", sm: "32px 36px 0", md: "0 60px" },
        }}
      >
        <Box sx={{ width: "100%", maxWidth: 400 }}>
          {/* 타이틀 */}
          <Typography
            sx={{
              fontWeight: 800,
              color: "#111",
              fontSize: { xs: "1.5rem", md: "1.75rem" },
              letterSpacing: -0.5,
              mb: { xs: 1, md: 0.5 },
            }}
          >
            로그인
          </Typography>
          <Typography sx={{ color: "#999", fontSize: "0.875rem", mb: { xs: 4, md: 3.5 } }}>
            계정 유형을 선택하고 계속하세요
          </Typography>

          {/* 역할 탭 */}
          <Box
            sx={{
              display: "flex",
              bgcolor: "white",
              border: "1px solid #e4e8ee",
              borderRadius: 2.5,
              p: 0.5,
              gap: 0.5,
              mb: { xs: 4, md: 3 },
            }}
          >
            {[
              { value: "member", label: "개인 회원", Icon: PersonOutlineIcon },
              { value: "owner", label: "기업 회원", Icon: StorefrontOutlinedIcon },
            ].map(({ value, label, Icon }) => (
              <Box
                key={value}
                onClick={() => setRole(value)}
                sx={{
                  flex: 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 0.7,
                  py: { xs: 1.5, md: 1.1 },
                  borderRadius: 2,
                  cursor: "pointer",
                  transition: "all 0.18s ease",
                  bgcolor: role === value ? "#1976D2" : "transparent",
                  color: role === value ? "white" : "#aaa",
                  fontWeight: role === value ? 700 : 500,
                  fontSize: "0.875rem",
                  userSelect: "none",
                  "&:hover": {
                    bgcolor: role === value ? "#1565C0" : "#f0f0f0",
                  },
                }}
              >
                <Icon sx={{ fontSize: 16 }} />
                {label}
              </Box>
            ))}
          </Box>

          {/* 입력 폼 */}
          <Box
            component="form"
            onSubmit={handleLogin}
            noValidate
            sx={{ display: "flex", flexDirection: "column", gap: { xs: 2.5, md: 1.5 } }}
          >
            <TextField
              fullWidth
              name="email"
              label="이메일 주소"
              autoComplete="email"
              autoFocus
              sx={fieldSx}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailOutlinedIcon sx={{ fontSize: 17, color: "#c0c8d4" }} />
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              fullWidth
              name="pw"
              label="비밀번호"
              type={showPw ? "text" : "password"}
              autoComplete="current-password"
              sx={fieldSx}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockOutlinedIcon sx={{ fontSize: 17, color: "#c0c8d4" }} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      size="small"
                      edge="end"
                      tabIndex={-1}
                      onClick={() => setShowPw((v) => !v)}
                    >
                      {showPw ? (
                        <VisibilityOff sx={{ fontSize: 17, color: "#c0c8d4" }} />
                      ) : (
                        <Visibility sx={{ fontSize: 17, color: "#c0c8d4" }} />
                      )}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              disableElevation
              size="large"
              sx={{
                mt: 0.5,
                py: 1.4,
                borderRadius: 2.5,
                fontWeight: 800,
                fontSize: "0.95rem",
                letterSpacing: 0.5,
                background: "linear-gradient(90deg, #1565C0 0%, #1976D2 100%)",
                "&:hover": {
                  background: "linear-gradient(90deg, #0d47a1 0%, #1565C0 100%)",
                },
              }}
            >
              로그인
            </Button>
          </Box>

          {/* 회원가입 링크 */}
          <Typography
            sx={{ textAlign: "center", mt: 3.5, fontSize: "0.875rem", color: "#aaa" }}
          >
            아직 계정이 없으신가요?{" "}
            <Link to="/signup" style={{ textDecoration: "none" }}>
              <Box
                component="span"
                sx={{ color: "#1976D2", fontWeight: 700, cursor: "pointer" }}
              >
                회원가입
              </Box>
            </Link>
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}

const fieldSx = {
  "& .MuiOutlinedInput-root": {
    bgcolor: "white",
    borderRadius: 2.5,
    "& fieldset": { borderColor: "#e4e8ee" },
    "&:hover fieldset": { borderColor: "#b0bec5" },
    "&.Mui-focused fieldset": { borderColor: "#1976D2" },
  },
};
