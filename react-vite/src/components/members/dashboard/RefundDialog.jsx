import React from "react";
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogContentText, 
  DialogActions, 
  Button, 
  Typography, 
  Box 
} from "@mui/material";

export default function RefundDialog({ open, onClose, onConfirm, lockerNumber }) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      PaperProps={{ sx: { borderRadius: 3, p: 1, minWidth: "320px" } }} // minWidth를 주어 안정감 확보
    >
      <DialogTitle sx={{ fontWeight: "bold" }}>환불 하시겠습니까?</DialogTitle>
      <DialogContent>
        <DialogContentText sx={{ color: "#333", mb: 2 }}>
          보관함(No.<strong>{lockerNumber}</strong>) 이용이 즉시 종료됩니다.<br />
          정말 환불하시겠습니까?
        </DialogContentText>

        {/* 환불 정책 안내 영역 추가 */}
        <Box sx={{ backgroundColor: "#f5f5f5", p: 2, borderRadius: 2 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: "bold", mb: 1, color: "#444" }}>
            [환불 규정 안내]
          </Typography>
          <Typography variant="caption" sx={{ color: "#666", lineHeight: 1.6, display: "block" }}>
            • 잔여 기간에 비례하여 결제 금액의 50%만 환불됩니다.<br />
            • 이용 시작 여부와 관계없이 동일한 기준이 적용됩니다.<br />
            • 환불 금액은 일 단위 기준으로 계산됩니다.<br />
            • 환불 완료 후에는 복구가 불가능합니다.
          </Typography>
        </Box>

      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} color="inherit" sx={{ fontWeight: "bold", color: "#666" }}>취소</Button>
        <Button onClick={onConfirm} color="error" variant="contained" autoFocus sx={{ fontWeight: "bold", borderRadius: 2, boxShadow: "none" }}>환불하기</Button>
      </DialogActions>
    </Dialog>
  );
}