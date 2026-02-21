import React, { useEffect, useState } from "react";
import {
  TextField,
  Button,
  Typography,
  Box,
  InputAdornment,
  IconButton,
  RadioGroup,
  FormControlLabel,
  Radio,
} from "@mui/material";
import { useNavigate, Link } from "react-router-dom";

import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import StorefrontOutlinedIcon from "@mui/icons-material/StorefrontOutlined";
import FitnessCenterIcon from "@mui/icons-material/FitnessCenter";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import PhoneOutlinedIcon from "@mui/icons-material/PhoneOutlined";
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import BadgeOutlinedIcon from "@mui/icons-material/BadgeOutlined";
import ManOutlinedIcon from "@mui/icons-material/ManOutlined";

import { signupMember, signupOwner } from "../api/auth";

export default function Signup() {
  const navigate = useNavigate();

  const [role, setRole] = useState("member");
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [emailValid, setEmailValid] = useState(false);
  const [pwValid, setPwValid] = useState(false);

  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  const pwRegex = /^(?=.*[a-zA-Z])(?=.*[0-9]).{8,25}$/;

  useEffect(() => {
    setEmailValid(emailRegex.test(email));
    setPwValid(pwRegex.test(pw));
  }, [email, pw]);

  const handleSignup = async (e) => {
    e.preventDefault();
    const data = new FormData(e.target);
    try {
      if (role === "member") {
        await signupMember({
          email,
          password: pw,
          username: data.get("name"),
          phoneNumber: data.get("phoneNumber"),
          address: data.get("address"),
          gender: data.get("gender"),
        });
      } else {
        await signupOwner({
          email,
          password: pw,
          name: data.get("ownerName"),
          phoneNumber: data.get("phoneNumber"),
          address: data.get("address"),
          businessNumber: data.get("businessNumber"),
        });
      }
      alert("회원가입 성공! 로그인 해주세요.");
      navigate("/login");
    } catch (err) {
      console.error("signup failed:", err);
      alert(err?.message || "회원가입 실패");
    }
  };

  const isMember = role === "member";

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
      {/* ━━━━━ LEFT : 히어로 패널 (Login과 동일) ━━━━━ */}
      <Box
        sx={{
          width: { xs: "100%", md: "50%" },
          height: { xs: "64px", sm: "26vh", md: "100vh" },
          flexShrink: 0,
          background: "linear-gradient(150deg, #0d1117 0%, #151f2e 100%)",
          position: "relative",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          justifyContent: { xs: "center", md: "flex-end" },
          p: { xs: "0 24px", sm: "24px 44px", md: "0 60px 72px 60px" },
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
        {/* 장식: 워터마크 */}
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
        {/* 액센트 라인: 모바일 → 하단, 데스크톱 → 우측 */}
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
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: { xs: 1, md: 5 } }}>
            <Box
              sx={{
                width: { xs: 26, md: 36 },
                height: { xs: 26, md: 36 },
                borderRadius: 1.5,
                bgcolor: "#1976D2",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <FitnessCenterIcon sx={{ color: "white", fontSize: { xs: 14, md: 20 } }} />
            </Box>
            <Typography
              sx={{
                fontWeight: 900,
                color: "white",
                fontSize: { xs: "0.9rem", md: "1rem" },
                letterSpacing: 3,
              }}
            >
              GYMBAROFIT
            </Typography>
          </Box>

          {/* 슬로건 — sm 이상 */}
          <Box sx={{ display: { xs: "none", sm: "block" } }}>
            <Typography
              sx={{
                fontWeight: 900,
                color: "white",
                fontSize: { sm: "1.7rem", md: "2.8rem" },
                lineHeight: 1.2,
                letterSpacing: -1,
              }}
            >
              매일의 땀이<br />결과를 만든다
            </Typography>
            <Box sx={{ mt: 2, width: 48, height: 4, borderRadius: 2, bgcolor: "#1976D2" }} />
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
          justifyContent: "center",
          bgcolor: "#f5f7fa",
        }}
      >
        {/* 내부 스크롤 컨테이너 */}
        <Box
          sx={{
            width: "100%",
            maxWidth: 460,
            overflowY: "auto",
            px: { xs: 4, sm: 4, md: 5 },
            pt: { xs: 4, sm: 3.5, md: 6 },
            pb: { xs: 5, md: 6 },
            /* 스크롤바 숨김 */
            "&::-webkit-scrollbar": { display: "none" },
            msOverflowStyle: "none",
            scrollbarWidth: "none",
          }}
        >
          {/* 타이틀 */}
          <Typography
            sx={{
              fontWeight: 800,
              color: "#111",
              fontSize: { xs: "1.4rem", md: "1.75rem" },
              letterSpacing: -0.5,
              mb: { xs: 1, md: 0.5 },
            }}
          >
            회원가입
          </Typography>
          <Typography sx={{ color: "#999", fontSize: "0.875rem", mb: { xs: 3.5, md: 3 } }}>
            계정 유형을 선택하고 정보를 입력하세요
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
              mb: { xs: 3.5, md: 3 },
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
            onSubmit={handleSignup}
            noValidate
            sx={{ display: "flex", flexDirection: "column", gap: { xs: 2, md: 1.5 } }}
          >
            {/* 공통: 이메일 */}
            <TextField
              fullWidth
              required
              name="email"
              label="이메일"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={!emailValid && email.length > 0}
              helperText={!emailValid && email.length > 0 ? "올바른 이메일 형식이 아닙니다." : ""}
              sx={fieldSx}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailOutlinedIcon sx={{ fontSize: 17, color: "#c0c8d4" }} />
                  </InputAdornment>
                ),
              }}
            />

            {/* 공통: 비밀번호 */}
            <TextField
              fullWidth
              required
              name="password"
              label="비밀번호"
              type={showPw ? "text" : "password"}
              value={pw}
              onChange={(e) => setPw(e.target.value)}
              error={!pwValid && pw.length > 0}
              helperText={!pwValid && pw.length > 0 ? "영문+숫자 조합 8~25자" : ""}
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

            {/* 역할별 추가 필드 */}
            {isMember ? (
              <>
                <TextField
                  fullWidth
                  required
                  name="name"
                  label="이름"
                  sx={fieldSx}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PersonOutlineIcon sx={{ fontSize: 17, color: "#c0c8d4" }} />
                      </InputAdornment>
                    ),
                  }}
                />
                <TextField
                  fullWidth
                  name="phoneNumber"
                  label="전화번호"
                  placeholder="01012345678"
                  sx={fieldSx}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PhoneOutlinedIcon sx={{ fontSize: 17, color: "#c0c8d4" }} />
                      </InputAdornment>
                    ),
                  }}
                />
                <TextField
                  fullWidth
                  name="address"
                  label="주소"
                  sx={fieldSx}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <HomeOutlinedIcon sx={{ fontSize: 17, color: "#c0c8d4" }} />
                      </InputAdornment>
                    ),
                  }}
                />

                {/* 성별 */}
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1.5,
                    bgcolor: "white",
                    border: "1px solid #e4e8ee",
                    borderRadius: 2,
                    px: 1.5,
                    py: 0.5,
                  }}
                >
                  <ManOutlinedIcon sx={{ fontSize: 17, color: "#c0c8d4", flexShrink: 0 }} />
                  <Typography sx={{ fontSize: "0.8rem", color: "#999", flexShrink: 0 }}>
                    성별
                  </Typography>
                  <RadioGroup row name="gender" defaultValue="MALE" sx={{ ml: 0.5 }}>
                    <FormControlLabel
                      value="MALE"
                      control={<Radio size="small" sx={{ p: 0.5, color: "#c0c8d4", "&.Mui-checked": { color: "#1976D2" } }} />}
                      label={<Typography sx={{ fontSize: "0.875rem", color: "#555" }}>남성</Typography>}
                    />
                    <FormControlLabel
                      value="FEMALE"
                      control={<Radio size="small" sx={{ p: 0.5, color: "#c0c8d4", "&.Mui-checked": { color: "#1976D2" } }} />}
                      label={<Typography sx={{ fontSize: "0.875rem", color: "#555" }}>여성</Typography>}
                    />
                  </RadioGroup>
                </Box>
              </>
            ) : (
              <>
                <TextField
                  fullWidth
                  required
                  name="ownerName"
                  label="이름"
                  sx={fieldSx}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PersonOutlineIcon sx={{ fontSize: 17, color: "#c0c8d4" }} />
                      </InputAdornment>
                    ),
                  }}
                />
                <TextField
                  fullWidth
                  name="businessNumber"
                  label="사업자 번호"
                  placeholder="123-45-67890"
                  sx={fieldSx}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <BadgeOutlinedIcon sx={{ fontSize: 17, color: "#c0c8d4" }} />
                      </InputAdornment>
                    ),
                  }}
                />
                <TextField
                  fullWidth
                  name="phoneNumber"
                  label="전화번호"
                  sx={fieldSx}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PhoneOutlinedIcon sx={{ fontSize: 17, color: "#c0c8d4" }} />
                      </InputAdornment>
                    ),
                  }}
                />
                <TextField
                  fullWidth
                  name="address"
                  label="가게 주소"
                  sx={fieldSx}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <HomeOutlinedIcon sx={{ fontSize: 17, color: "#c0c8d4" }} />
                      </InputAdornment>
                    ),
                  }}
                />
              </>
            )}

            {/* 가입 버튼 */}
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
              가입하기
            </Button>
          </Box>

          {/* 로그인 링크 */}
          <Typography
            sx={{ textAlign: "center", mt: 3, fontSize: "0.875rem", color: "#aaa" }}
          >
            이미 계정이 있으신가요?{" "}
            <Link to="/login" style={{ textDecoration: "none" }}>
              <Box component="span" sx={{ color: "#1976D2", fontWeight: 700, cursor: "pointer" }}>
                로그인
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
