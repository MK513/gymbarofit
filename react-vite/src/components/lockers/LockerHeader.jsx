import React from "react";
import { AppBar, Toolbar, IconButton, Typography, Tabs, Tab } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

export default function LockerHeader({ onBack, currentTab, onTabChange, zones }) {
  return (
    <AppBar position="sticky" color="inherit" elevation={0} sx={{ borderBottom: '1px solid #e0e0e0', bgcolor: "white" }}>
      <Toolbar>
        <IconButton edge="start" color="inherit" onClick={onBack} sx={{ mr: 1 }}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: "bold" }}>
          보관함 배정
        </Typography>
      </Toolbar>
      <Tabs 
        value={currentTab} 
        onChange={onTabChange} 
        variant="scrollable" 
        scrollButtons="auto" 
        indicatorColor="primary" 
        textColor="primary" 
        sx={{ borderTop: '1px solid #f0f0f0' }}
      >
        {zones.map((zone) => (
          <Tab key={zone.id} label={zone.name} sx={{ fontWeight: 'bold' }} />
        ))}
      </Tabs>
    </AppBar>
  );
}