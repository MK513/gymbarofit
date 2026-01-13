import React from "react";
import { Dialog, DialogTitle, DialogContent, Box, Typography, DialogActions, Button } from "@mui/material";
import QrCodeIcon from '@mui/icons-material/QrCode';

export default function QrCodeDialog({ open, onClose }) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ textAlign: 'center', fontWeight: 'bold' }}>입장 QR 코드</DialogTitle>
      <DialogContent>
        <Box display="flex" flexDirection="column" alignItems="center" py={2}>
          <QrCodeIcon sx={{ fontSize: 150, color: '#333' }} />
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            리더기에 QR코드를 스캔해주세요.
          </Typography>
          <Typography variant="caption" color="text.disabled">유효시간: 02:59</Typography>
        </Box>
      </DialogContent>
      <DialogActions sx={{ justifyContent: 'center', pb: 3 }}>
        <Button onClick={onClose} variant="outlined" sx={{ borderRadius: 4 }}>닫기</Button>
      </DialogActions>
    </Dialog>
  );
}