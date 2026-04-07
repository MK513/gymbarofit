import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  ToggleButtonGroup,
  ToggleButton,
  Typography,
  Box,
  Divider
} from "@mui/material";

const PRICES = { 1: 10000, 3: 27000, 6: 50000 };

export default function LockerPaymentDialog({ open, onClose, lockerNumber, onConfirm }) {
  // 결제 관련 상태를 Dialog 내부에서 관리
  const [duration, setDuration] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState('CARD');

  const handleConfirm = () => {
    // 부모 컴포넌트로 선택된 기간과 결제 수단을 전달
    onConfirm(duration, paymentMethod);
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      fullWidth 
      maxWidth="xs"
      PaperProps={{ sx: { borderRadius: 3, p: 1 } }}
    >
      <DialogTitle sx={{ fontWeight: 'bold', textAlign: 'center' }}>
        보관함 대여 결제
      </DialogTitle>
      
      <DialogContent>
        <Box mb={3} textAlign="center">
          <Typography variant="body2" color="textSecondary">선택한 보관함</Typography>
          <Typography variant="h4" color="primary" fontWeight="bold">
            {lockerNumber || "-"}번
          </Typography>
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* 1. 결제 수단 선택 */}
        <FormControl fullWidth size="small" sx={{ mb: 3, mt: 1 }}>
          <InputLabel id="payment-method-label">결제 수단</InputLabel>
          <Select
            labelId="payment-method-label"
            value={paymentMethod}
            label="결제 수단"
            onChange={(e) => setPaymentMethod(e.target.value)}
          >
            <MenuItem value="CARD">신용/체크카드</MenuItem>
            <MenuItem value="KAKAO_PAY">카카오페이</MenuItem>
            <MenuItem value="NAVER_PAY">네이버페이</MenuItem>
          </Select>
        </FormControl>

        {/* 2. 기간 선택 */}
        <Typography variant="subtitle2" gutterBottom fontWeight="bold">이용 기간 선택</Typography>
        <ToggleButtonGroup
          value={duration}
          exclusive
          onChange={(e, v) => v && setDuration(v)}
          fullWidth
          color="primary"
          orientation="vertical"
          sx={{ mb: 1 }}
        >
          {[1, 3, 6].map((m) => (
            <ToggleButton key={m} value={m} sx={{ justifyContent: 'space-between', px: 3 }}>
              <span>{m}개월</span>
              <span style={{ fontWeight: 'bold' }}>{PRICES[m].toLocaleString()}원</span>
            </ToggleButton>
          ))}
        </ToggleButtonGroup>
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} color="inherit" size="large" sx={{ borderRadius: 2 }}>
          취소
        </Button>
        <Button 
          onClick={handleConfirm} 
          variant="contained" 
          size="large" 
          fullWidth
          sx={{ borderRadius: 2, fontWeight: 'bold' }}
        >
          결제하기
        </Button>
      </DialogActions>
    </Dialog>
  );
}