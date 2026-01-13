import React, { createContext, useContext, useState, useCallback } from "react";
import { Snackbar, Alert } from "@mui/material";

// Context 생성
const NotificationContext = createContext();

// Provider 컴포넌트 (앱 전체를 감쌀 녀석)
export const NotificationProvider = ({ children }) => {
  const [conf, setConf] = useState({
    isOpen: false,
    message: "",
    severity: "info", // success, error, warning, info
  });

  // 알림 띄우기 함수 (이걸 각 페이지에서 가져다 씀)
  const showNotification = useCallback((message, severity = "info") => {
    setConf({ isOpen: true, message, severity });
  }, []);

  const handleClose = (event, reason) => {
    if (reason === "clickaway") return;
    setConf((prev) => ({ ...prev, isOpen: false }));
  };

  return (
    <NotificationContext.Provider value={{ showNotification }}>
      {children}
      
      {/* 여기에 전역 Snackbar 하나만 배치 */}
      <Snackbar
        open={conf.isOpen}
        autoHideDuration={3000}
        onClose={handleClose}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
        sx={{ zIndex: 9999 }} // 모달보다 위에 뜨게 설정
      >
        <Alert
          onClose={handleClose}
          severity={conf.severity}
          variant="filled"
          sx={{ width: "100%", fontWeight: "bold", boxShadow: 3 }}
        >
          {conf.message}
        </Alert>
      </Snackbar>
    </NotificationContext.Provider>
  );
};

// 커스텀 훅 (사용 편의성을 위해)
export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotification must be used within a NotificationProvider");
  }
  return context;
};