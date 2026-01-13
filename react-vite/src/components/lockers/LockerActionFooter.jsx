import React from "react";
import { Paper, Container, Button } from "@mui/material";
import BoltIcon from "@mui/icons-material/Bolt";
import ShoppingCartCheckoutIcon from '@mui/icons-material/ShoppingCartCheckout';

export default function LockerActionFooter({ 
  selectedLockerId, 
  selectedLockerNumber, 
  loading, 
  hasLockers, 
  onQuickSelect, 
  onPaymentOpen 
}) {
  return (
    <Paper 
      elevation={10}
      sx={{ 
        flexShrink: 0,
        p: 2, 
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        bgcolor: 'white',
        zIndex: 10
      }}
    >
      <Container maxWidth="sm" sx={{ px: 0 }}>
        {selectedLockerId ? (
          <Button
            fullWidth
            variant="contained"
            size="large"
            onClick={onPaymentOpen}
            startIcon={<ShoppingCartCheckoutIcon />}
            sx={{
              py: 1.8,
              borderRadius: 3,
              fontSize: '1.1rem',
              fontWeight: 'bold',
              boxShadow: '0 8px 16px rgba(33, 150, 243, 0.3)'
            }}
          >
            {selectedLockerNumber}번 보관함 대여하기
          </Button>
        ) : (
          <Button 
            fullWidth 
            variant="contained" 
            color="secondary"
            size="large"
            startIcon={<BoltIcon />}
            onClick={onQuickSelect}
            disabled={loading || !hasLockers}
            sx={{ 
              py: 1.8, 
              borderRadius: 3, 
              fontWeight: 'bold', 
              fontSize: '1.1rem',
              background: 'linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%)',
              boxShadow: '0 8px 16px rgba(255, 105, 135, .3)',
              color: 'white'
            }}
          >
            가장 빠른 빈자리 자동 선택
          </Button>
        )}
      </Container>
    </Paper>
  );
}