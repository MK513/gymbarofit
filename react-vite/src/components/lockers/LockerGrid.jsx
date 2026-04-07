import React from "react";
import { Paper, Box, CircularProgress, Typography } from "@mui/material";
import LockIcon from "@mui/icons-material/Lock";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import BuildIcon from "@mui/icons-material/Build";

export default function LockerGrid({ loading, lockers, gridConfig, selectedLockerId, onLockerClick }) {
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" p={5} flex={1}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Paper
      elevation={0}
      sx={{
        p: 2,
        pr: 0,
        bgcolor: "white",
        borderRadius: 4,
        width: "100%",
        flex: 1,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        overflowX: "auto",
      }}
    >
      <Box
        sx={{
          display: "grid",
          alignContent: "center",
          justifyContent: "center",
          width: "fit-content", 
          minWidth: lockers.length > 0 ? "auto" : "100%",
          gridTemplateColumns: `repeat(${gridConfig.cols}, 90px)`,
          mx: "auto",
          gap: 1.5,
          pr: 0,
        }}
      >
        {lockers.map((locker) => {
          const isSelected = selectedLockerId === locker.id;
          
          const sizeStyle = {
            "1x1": { gridColumn: "span 1", gridRow: "span 1" },
            "1x2": { gridColumn: "span 1", gridRow: "span 2" },
            "1x3": { gridColumn: "span 1", gridRow: "span 3" },
          }[gridConfig.lockerType];

          const ratioStyle = {
            "1x1": "1/1",
            "1x2": "1/2",
            "1x3": "1/3",
          }[gridConfig.lockerType] || "1/1";

          return (
            <Paper
              key={locker.id}
              elevation={isSelected ? 4 : 0}
              onClick={() => onLockerClick(locker)}
              sx={{
                ...sizeStyle,
                aspectRatio: ratioStyle,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: 1.5,
                cursor: locker.isOccupied ? "not-allowed" : "pointer",
                bgcolor: locker.isOccupied ? "#cfd8dc" : isSelected ? "primary.main" : "white",
                color: isSelected ? "white" : locker.isOccupied ? "#90a4ae" : "#333",
                border: isSelected ? "none" : "1px solid #e0e0e0",
                transition: "0.1s",
                position: "relative",
                "& .MuiTypography-root": { fontSize: '0.8rem', fontWeight: 'bold' },
                "&:active": { transform: "scale(0.95)" }
              }}
            >
              {isSelected && <CheckCircleIcon sx={{ fontSize: '1rem', mb: 0.2 }} />}
              {!isSelected && locker.isBroken && (
                <BuildIcon sx={{ fontSize: '1rem', mb: 0.2, opacity: 0.5 }} />
              )}
              {!isSelected && !locker.isBroken && gridConfig.lockerType === "1x2" && (
                <LockIcon sx={{ fontSize: '1rem', mb: 0.5, opacity: 0.5 }} />
              )}
              <Typography variant="subtitle2">
                {locker.number}
              </Typography>
            </Paper>
          );
        })}
      </Box>
    </Paper>
  );
}