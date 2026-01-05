import React, {useEffect, useState } from 'react';
import { Box, Card, CardContent, TextField, Button, Typography,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { call } from '../api/Api';


export default function Signup() {
    const [email, setEmail] = useState('');
    const [pw, setPw] = useState('');
    
    const [emailValid, setEmailValid] = useState(false);
    const [pwValid, setPwValid] = useState(false);
    
    const navigate = useNavigate();

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const pwRegex  = /^(?=.*[a-zA-Z])(?=.*[0-9]).{8,25}$/ // 영문 숫자 조합 8자리 이상

    const handleEmail = (e) => {
        setEmail(e.target.value);
        if (emailRegex.test(email)) {
            setEmailValid(true);
        }
        else {
            setEmailValid(false);
        }
    }

    const handlePw = (e) => {
        setPw(e.target.value);
        if (pwRegex.test(pw)) {
            setPwValid(true);
        }
        else {
            setPwValid(false);
        }
    }
    
    useEffect(()=> {
      if (emailRegex.test(email)) {
            setEmailValid(true);
        }
        else {
            setEmailValid(false);
        }
        if (pwRegex.test(pw)) {
            setPwValid(true);
        }
        else {
            setPwValid(false);
        }
    }, [email, pw]);

    const handleSignup = async (e) => {
      e.preventDefault();

      const data = new FormData(e.target);
      const username = data.get("name");
      const phoneNumber = data.get("phoneNumber");
      const address = data.get("address");
      const gender = data.get("gender");
      const role = "ROLE_MEMBER";

      const signupDto = {
        email,
        password: pw,
        username,
        phoneNumber,
        address,
        gender,
        role,
      };

      try {
        // 1번 방식: 성공/실패는 HTTP status로 판단
        // call()이 성공이면(2xx) 여기까지 옴
        await call("/members/register", "POST", signupDto);

        // 회원가입 성공 → 로그인 페이지로 이동
        navigate("/login");
      } catch (err) {
        // call()이 4xx/5xx면 throw 한다는 전제로 처리
        console.error("signup failed:", err);

        // 선택: 서버가 message를 내려주면 보여주기
        const msg =
          err?.response?.data?.message ||
          err?.message ||
          "회원가입 실패";

        alert(msg);
      }
    };

   return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: 'background.default',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 2,
      }}
    >
      <Card sx={{ width: '100%', maxWidth: 400, boxShadow: 3 }}>
        <CardContent>
          <form onSubmit={handleSignup}>
            <Typography variant="h5" align="center" fontWeight="bold" mb={3}>
              회원가입
            </Typography>

            <TextField
              label="이메일"
              type="email"
              name="email"
              placeholder="email@example.com"
              variant="outlined"
              fullWidth
              margin="normal"
              value={email}
              onChange={handleEmail}
              required
            />

            <TextField
              label="비밀번호"
              type="password"
              name="password"
              placeholder="영문 숫자 조합 8자리 이상"
              variant="outlined"
              fullWidth
              margin="normal"
              value={pw}
              onChange={handlePw}
              required
            />

            <TextField
              label="이름"
              type="name"
              name="name"
              placeholder="홍길동"
              variant="outlined"
              fullWidth
              margin="normal"
              required
            />

            <TextField
              label="전화번호"
              type="phoneNumber"
              name="phoneNumber"
              placeholder="01012345678"
              variant="outlined"
              fullWidth
              margin="normal"
            />

            <TextField
              label="주소"
              type="address"
              name="address"
              placeholder="서울시 동대문구 장한로"
              variant="outlined"
              fullWidth
              margin="normal"
            />

            <FormControl component="fieldset" margin="normal">
              <FormLabel component="legend">성별</FormLabel>
              <RadioGroup row name="gender">
                <FormControlLabel value="MALE" control={<Radio />} label="남성" />
                <FormControlLabel value="FEMALE" control={<Radio />} label="여성" />
              </RadioGroup>
            </FormControl>

            {!emailValid && email.length > 0 && (
              <Typography color="error" variant="body2" mt={1}>
                올바른 이메일을 입력해주세요.
              </Typography>
            )}

            {!pwValid && pw.length > 0 && (
              <Typography color="error" variant="body2" mt={1}>
                비밀번호를 형식에 맞게 입력해주세요.
                *영문 숫자 조합 8자리 이상
              </Typography>
            )}

            <Box mt={3}>
              <Button type="submit" variant="contained" color="primary" fullWidth>
                가입
              </Button>
            </Box>
          </form>
        </CardContent>
      </Card>
    </Box>
  );
}