import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Container,
  Fade,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import { Logout as LogoutIcon, Warning } from '@mui/icons-material';

const Logout = () => {
  const navigate = useNavigate();
  const [showConfirmation, setShowConfirmation] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleConfirmLogout = () => {
    setIsLoggingOut(true);
    // Supprimer les données admin
    localStorage.removeItem('admin');
    
    // Rediriger après un court délai
    setTimeout(() => {
      navigate('/admin/login');
    }, 1000);
  };

  const handleCancelLogout = () => {
    // Retourner à la page précédente ou à la page d'accueil admin
    navigate(-1); // Retour en arrière
    // Ou bien : navigate('/admin/dashboard');
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #9c9e9f50 0%, #12051fff 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 2
      }}
    >
      {/* Modal de confirmation */}
      <Dialog
        open={showConfirmation}
        onClose={handleCancelLogout}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ 
          background: 'linear-gradient(135deg, #818487c4 0%, #12051fff 100%)',
          color: 'warning.contrastText',
          
          display: 'flex',
          alignItems: 'center',
          gap: 1
        }}>
          <Warning />
          Confirmation de déconnexion
        </DialogTitle>
        
        <DialogContent sx={{ pt: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <LogoutIcon color="warning" sx={{ fontSize: 40, mr: 2 }} />
            <Box>
              <Typography variant="h6" gutterBottom>
                Êtes-vous sûr de vouloir vous déconnecter ?
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Vous devrez vous reconnecter pour accéder au panel d'administration.
              </Typography>
            </Box>
          </Box>
        </DialogContent>
        
        <DialogActions sx={{ p: 3, gap: 1 }}>
          <Button 
            onClick={handleCancelLogout}
            variant="outlined"
            color="primary"
            sx={{ minWidth: 100 }}
          >
            Non, annuler
          </Button>
          <Button 
            onClick={handleConfirmLogout}
            variant="contained"
          background='linear-gradient(135deg, #909090c4 0%, #12051fff 100%)'
            startIcon={<LogoutIcon />}
            sx={{ minWidth: 100 }}
            disabled={isLoggingOut}
          >
            {isLoggingOut ? 'Déconnexion...' : 'Oui, se déconnecter'}
          </Button>
        </DialogActions>
      </Dialog>

  
         
      
    </Box>
  );
};

export default Logout;