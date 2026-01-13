import React from "react";
import { AppBar, Toolbar, Typography, IconButton } from "@mui/material";
import FitnessCenterIcon from "@mui/icons-material/FitnessCenter";
import LogoutIcon from "@mui/icons-material/Logout";

export default function DashboardHeader({ onLogout }) {
  return (
    <AppBar position="static" color="inherit" elevation={0} sx={{ borderBottom: '1px solid #e0e0e0', bgcolor: "white" }}>
      <Toolbar>
        <FitnessCenterIcon sx={{ mr: 2, color: "primary.main" }} />
        <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: "800", color: "#333", letterSpacing: '-0.5px' }}>
          GYMBAROFIT
        </Typography>
        <IconButton color="primary" onClick={onLogout}>
          <LogoutIcon />
        </IconButton>
      </Toolbar>
    </AppBar>
  );
}