import React, {useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Container,
  TextField,
  Button,
  Typography,
  Box,
  Grid,
  Paper,
} from '@mui/material';
import { login } from '../api/Api';

const User = {
    email: 'abc@naver.com',
    pw: 'abcdefg1234!@#'
}
export default function Login() {

    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault(); // 새로고침 방지

        const data = new FormData(e.target);
        const email = data.get("email")
        const pw = data.get('pw');

        const result = await login({email: email, password: pw});

        console.log("result: " + result);
        if (result == "OK") {
            navigate('/'); // 로그인 성공 시 홈으로 이동
        } else {
            alert('로그인 실패');
        }
    };

    return (
    <Container maxWidth="sm">
      <Paper elevation={3} sx={{ padding: 4, marginTop: 8 }}>
        <Typography variant="h5" align="center" gutterBottom>
          로그인
        </Typography>
        <Box component="form" onSubmit={handleSubmit} noValidate>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                id="email"
                label="이메일"
                name="email"
                autoComplete="email"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                id="pw"
                type="pw"
                label="비밀번호"
                name="pw"
                autoComplete="current-password"
              />
            </Grid>
            <Grid item xs={12}>
              <Button
                type="submit"
                fullWidth
                variant="contained"
                color="primary"
              >
                로그인
              </Button>
            </Grid>
            <Grid item xs={12}>
              <Button
                fullWidth
                variant="outlined"
                color="secondary"
                component={Link}
                to="/signup"
              >
                회원가입
              </Button>
            </Grid>
          </Grid>
        </Box>
      </Paper>
    </Container>
  );
}