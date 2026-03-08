import React, { useState } from "react";
import { Paper, Typography, Box, Button, Menu, MenuItem, Divider, ListItemIcon, Chip } from "@mui/material";
import LocationOnIcon from '@mui/icons-material/LocationOn';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';

export default function GymInfoSection({ userName, currentGym, myGyms, crowdStatus, onGymSelect, onRegister }) {
  const [anchorEl, setAnchorEl] = useState(null);
  const openMenu = Boolean(anchorEl);

  const handleOpen = (event) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);

  const handleSelect = (gym) => {
    onGymSelect(gym);
    handleClose();
  };

  const handleRegister = () => {
    onRegister();
    handleClose();
  };

  return (
    <Paper 
      elevation={0} 
      sx={{ p: 2, borderRadius: 3, border: '1px solid #eef2f6', bgcolor: 'white', display: 'flex', flexDirection: 'column', gap: 2 }}
    >
      <Typography variant="subtitle1" sx={{ color: "#333", fontWeight: '500' }}>
        오늘도 득근하세요, <Box component="span" sx={{ fontWeight: '800', color: 'primary.main' }}>{userName}</Box>님 💪
      </Typography>

      <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={1}>
        <Button
          onClick={handleOpen}
          startIcon={<LocationOnIcon />}
          endIcon={<KeyboardArrowDownIcon />}
          size="small"
          color={currentGym ? "primary" : "error"}
          sx={{ 
            fontWeight: 'bold', 
            bgcolor: currentGym ? '#f5f5f5' : '#ffebee', 
            borderRadius: 2,
            px: 1.5,
            '&:hover': { bgcolor: currentGym ? '#e0e0e0' : '#ffcdd2' }
          }}
        >
          {currentGym ? currentGym.name : "헬스장 등록 필요 ⚠️"}
        </Button>

        <Menu
          anchorEl={anchorEl}
          open={openMenu}
          onClose={handleClose}
          PaperProps={{ elevation: 3, sx: { borderRadius: 2, mt: 1, minWidth: 160 } }}
        >
          {myGyms.length > 0 ? (
            myGyms.map((gym) => (
              <MenuItem 
                key={gym.id} 
                onClick={() => handleSelect(gym)}
                selected={currentGym?.id === gym.id}
                sx={{ fontSize: '0.95rem' }}
              >
                {gym.name}
              </MenuItem>
            ))
          ) : (
            <MenuItem disabled sx={{ fontSize: '0.9rem', color: 'text.secondary' }}>
              등록된 정보가 없습니다.
            </MenuItem>
          )}
          <Divider sx={{ my: 1 }} />
          <MenuItem onClick={handleRegister} sx={{ color: 'primary.main', fontWeight: 'bold', fontSize: '0.9rem' }}>
            <ListItemIcon><AddCircleOutlineIcon fontSize="small" color="primary" /></ListItemIcon>
            새 헬스장 등록
          </MenuItem>
        </Menu>

        <Chip 
          icon={<PeopleAltIcon fontSize="small" style={{ color: crowdStatus.color }} />} 
          label={`${crowdStatus.label}`} 
          size="small"
          sx={{ 
            bgcolor: crowdStatus.bgColor, 
            color: crowdStatus.color, 
            fontWeight: "bold",
            border: `1px solid ${crowdStatus.borderColor}`,
            height: 32,
            '& .MuiChip-icon': { color: 'inherit' }
          }} 
        />
      </Box>
    </Paper>
  );
}