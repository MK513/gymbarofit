import React from "react";
import { Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button } from "@mui/material";

export default function RefundDialog({ open, onClose, onConfirm, lockerNumber }) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      PaperProps={{ sx: { borderRadius: 3, p: 1 } }}
    >
      <DialogTitle sx={{ fontWeight: "bold" }}>환불 하시겠습니까?</DialogTitle>
      <DialogContent>
        <DialogContentText sx={{ color: "#333" }}>
          보관함(No.<strong>{lockerNumber}</strong>) 이용이 즉시 종료됩니다.<br />
          정말 환불하시겠습니까?
        </DialogContentText>
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} color="inherit" sx={{ fontWeight: "bold", color: "#666" }}>취소</Button>
        <Button onClick={onConfirm} color="error" variant="contained" autoFocus sx={{ fontWeight: "bold", borderRadius: 2, boxShadow: "none" }}>환불하기</Button>
      </DialogActions>
    </Dialog>
  );
}