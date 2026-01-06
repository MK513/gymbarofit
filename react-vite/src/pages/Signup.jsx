import React, { useEffect, useState } from "react";
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  Container,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  InputAdornment,
  Avatar,
  ToggleButton,
  ToggleButtonGroup,
  Grid,
} from "@mui/material";
import { useNavigate, Link } from "react-router-dom";

// 아이콘 Import
import PersonAddOutlinedIcon from "@mui/icons-material/PersonAddOutlined";
import EmailIcon from "@mui/icons-material/Email";
import KeyIcon from "@mui/icons-material/Key";
import PersonIcon from "@mui/icons-material/Person";
import PhoneIcon from "@mui/icons-material/Phone";
import HomeIcon from "@mui/icons-material/Home";
import StoreIcon from "@mui/icons-material/Store";
import BadgeIcon from "@mui/icons-material/Badge";
import WcIcon from "@mui/icons-material/Wc"; // 성별 아이콘

import { signupMember, signupOwner } from "../api/Api";

export default function Signup() {
  const navigate = useNavigate();

  const [role, setRole] = useState("member"); // member | owner
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");

  const [emailValid, setEmailValid] = useState(false);
  const [pwValid, setPwValid] = useState(false);

  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  const pwRegex = /^(?=.*[a-zA-Z])(?=.*[0-9]).{8,25}$/;

  useEffect(() => {
    setEmailValid(emailRegex.test(email));
    setPwValid(pwRegex.test(pw));
  }, [email, pw]);

  const handleRoleChange = (event, newRole) => {
    if (newRole !== null) {
      setRole(newRole);
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    const data = new FormData(e.target);

    try {
      if (role === "member") {
        const dto = {
          email,
          password: pw,
          username: data.get("name"),
          phoneNumber: data.get("phoneNumber"),
          address: data.get("address"),
          gender: data.get("gender"),
        };
        await signupMember(dto);
      } else {
        const dto = {
          email,
          password: pw,
          name: data.get("ownerName"),
          phoneNumber: data.get("phoneNumber"),
          address: data.get("address"),
          businessNumber: data.get("businessNumber"),
        };
        await signupOwner(dto);
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
    <Container component="main" maxWidth="sm">
      <Box
        sx={{
          // 모바일(xs)에선 위아래 여백 2, 태블릿 이상(sm)에선 4
          marginTop: { xs: 2, sm: 4 },
          marginBottom: { xs: 2, sm: 4 },
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "90vh",
        }}
      >
        <Paper
          sx={{
            boxShadow: { xs: "none", sm: 6 },
            borderRadius: { xs: 0, sm: 3 },
            p: { xs: 2, sm: 4 },

            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            width: "100%",
            background: "#ffffff",
          }}
        >
          {/* 헤더 아이콘 */}
          <Avatar sx={{ m: 1, bgcolor: "secondary.main", width: 56, height: 56 }}>
            <PersonAddOutlinedIcon fontSize="large" />
          </Avatar>
          
          <Typography component="h1" variant="h5" sx={{ mb: 3, fontWeight: "bold" }}>
            회원가입
          </Typography>

          {/* 역할 선택 (토글 버튼) */}
          <ToggleButtonGroup
            value={role}
            exclusive
            onChange={handleRoleChange}
            fullWidth
            sx={{ mb: 3 }}
            aria-label="가입 유형 선택"
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

          <Box component="form" onSubmit={handleSignup} noValidate sx={{ width: "100%" }}>
            <Grid container spacing={2} direction="column">
              {/* 공통 필드: 이메일 & 비밀번호 */}
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  label="이메일"
                  name="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  error={!emailValid && email.length > 0}
                  helperText={
                    !emailValid && email.length > 0
                      ? "올바른 이메일 형식이 아닙니다."
                      : ""
                  }
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <EmailIcon color="action" />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  label="비밀번호"
                  name="password"
                  type="password"
                  value={pw}
                  onChange={(e) => setPw(e.target.value)}
                  error={!pwValid && pw.length > 0}
                  helperText={
                    !pwValid && pw.length > 0
                      ? "영문+숫자 조합 8~25자"
                      : ""
                  }
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <KeyIcon color="action" />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              {/* 역할별 분기 */}
              {isMember ? (
                <>
                  <Grid item xs={12}>
                    <TextField
                      required
                      fullWidth
                      label="이름"
                      name="name"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <PersonIcon color="action" />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="전화번호"
                      name="phoneNumber"
                      placeholder="01012345678"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <PhoneIcon color="action" />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="주소"
                      name="address"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <HomeIcon color="action" />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <FormControl component="fieldset" sx={{ width: '100%', pb: 1.5, pt: 1.5 }}>
                      <Box display="flex" alignItems="center">
                        <WcIcon color="action" sx={{ ml: 1,mr: 2 }} />
                        <FormLabel component="legend" sx={{ mr: 3 }}>성별</FormLabel>
                        <RadioGroup row name="gender" defaultValue="MALE">
                          <FormControlLabel value="MALE" control={<Radio size="small" sx={{ p: 0.5, }}/>} label="남성" />
                          <FormControlLabel value="FEMALE" control={<Radio size="small" sx={{ p: 0.5, }}/>} label="여성" />
                        </RadioGroup>
                      </Box>
                    </FormControl>
                  </Grid>
                </>
              ) : (
                <>
                  <Grid item xs={12}>
                    <TextField
                      required
                      fullWidth
                      label="이름"
                      name="ownerName"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <PersonIcon color="action" />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="사업자 번호"
                      name="businessNumber"
                      placeholder="123-45-67890"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <BadgeIcon color="action" />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="전화번호"
                      name="phoneNumber"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <PhoneIcon color="action" />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="가게 주소"
                      name="address"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <HomeIcon color="action" />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>
                </>
              )}
            </Grid>

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              sx={{ mt: 4, mb: 2, py: 1.5, fontSize: "1.1rem", fontWeight: "bold" }}
            >
              가입하기
            </Button>

            <Grid container justifyContent="flex-end">
              <Grid item>
                <Button component={Link} to="/login" variant="text">
                  이미 계정이 있으신가요? 로그인
                </Button>
              </Grid>
            </Grid>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
}