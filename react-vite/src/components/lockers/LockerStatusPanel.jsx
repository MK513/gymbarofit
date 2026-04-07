import React from "react";
import { Box, Paper, Typography, Chip, Divider } from "@mui/material";
import { getLockerSizeLabel } from "../../utils/lockerUtils";

export default function LockerStatusPanel({ counts, currentZoneSize }) {
  return (
    <Box sx={{ flexShrink: 0 }}>
      {/* 전체 현황 카드 */}
      <Paper 
        elevation={0} 
        sx={{ 
          mb: 3, 
          p: 2.5, 
          borderRadius: 4, 
          bgcolor: 'white',
          display: 'flex', 
          alignItems: 'center',
          justifyContent: 'space-between',
          boxShadow: '0 2px 12px rgba(0,0,0,0.03)'
        }}
      >
        <Box display="flex" alignItems="center" gap={1}>
          <Typography variant="subtitle1" fontWeight="800" color="text.primary">
            전체 현황
          </Typography>
          {currentZoneSize && (
            <Chip 
              label={getLockerSizeLabel(currentZoneSize)} 
              size="small"
              color="primary" 
              variant="outlined"
              sx={{ fontWeight: 'bold', height: 24, fontSize: '0.75rem', borderWidth: '1.5px' }} 
            />
          )}
        </Box>
        <Box display="flex" alignItems="center" gap={3}>
            <Box textAlign="center">
                <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 0.5, whiteSpace: 'nowrap' }}>
                    이용 가능
                </Typography>
                <Typography variant="h6" color="primary.main" fontWeight="800" sx={{ lineHeight: 1 }}>
                    {counts.available}개
                </Typography>
            </Box>
            <Divider orientation="vertical" flexItem sx={{ height: 30, my: 'auto' }} />
            <Box textAlign="center">
                <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 0.5, whiteSpace: 'nowrap' }}>
                    대여 불가
                </Typography>
                <Typography variant="h6" color="text.disabled" fontWeight="800" sx={{ lineHeight: 1 }}>
                    {counts.unavailable}개
                </Typography>
            </Box>
        </Box>
      </Paper>

      {/* 범례 */}
      <Box display="flex" justifyContent="center" gap={2} mb={2}>
        <Box display="flex" alignItems="center" gap={0.5}>
          <Box sx={{ width: 12, height: 12, borderRadius: '3px', border: '1px solid #e0e0e0', bgcolor: 'white' }} />
          <Typography variant="caption" color="text.secondary">가능</Typography>
        </Box>
        <Box display="flex" alignItems="center" gap={0.5}>
          <Box sx={{ width: 12, height: 12, borderRadius: '3px', bgcolor: '#cfd8dc' }} />
          <Typography variant="caption" color="text.secondary">사용중/점검</Typography>
        </Box>
        <Box display="flex" alignItems="center" gap={0.5}>
          <Box sx={{ width: 12, height: 12, borderRadius: '3px', bgcolor: 'primary.main' }} />
          <Typography variant="caption" color="text.secondary">선택</Typography>
        </Box>
      </Box>
    </Box>
  );
}