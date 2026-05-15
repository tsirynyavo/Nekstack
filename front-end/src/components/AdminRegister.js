import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  InputAdornment,
  IconButton,
  CircularProgress,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Person,
  Email,
  Lock,
  ArrowBack,
  HowToReg,
  CheckCircle
} from '@mui/icons-material';

const AdminRegister = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("admin");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [modalData, setModalData] = useState({});
  const navigate = useNavigate();

  const handleRegister = async () => {
    setError("");
    setLoading(true);

    if (!name || !email || !password) {
      setError("Tous les champs sont requis");
      setLoading(false);
      return;
    }

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) {
      setError("Email invalide");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("http://localhost:5050/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, role }),
      });

      const result = await response.json();

      if (response.ok) {
        // Ouvrir le modal de confirmation au lieu de alert()
        setModalData({
          title: "Inscription réussie !",
          message: "Le compte administrateur a été créé avec succès.",
          adminName: name,
          adminEmail: email
        });
        setOpenModal(true);
      } else {
        setError(result.error || "Erreur lors de l'inscription");
      }
    } catch (err) {
      setError("Erreur serveur");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleModalClose = () => {
    setOpenModal(false);
    // Rediriger vers la page de connexion après fermeture du modal
    navigate("/admin/login");
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') handleRegister();
  };

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  return (
    <Container 
      component="main" 
      maxWidth="sm"
      sx={{
        minHeight: '70vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        py: 4
      }}
    >
      <Paper
        elevation={8}
        sx={{
          padding: 6,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          borderRadius: 3,
          background: 'white',
          width: '100%',
          maxWidth: 450,
          position: 'relative'
        }}
      >
        {/* Bouton retour */}
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate("/admin/login")}
          sx={{
            position: 'absolute',
            top: 16,
            left: 16,
            color: 'text.secondary',
            textTransform: 'none'
          }}
        >
          Retour
        </Button>

        {/* Logo */}
        <Box
          sx={{
            width: 80,
            height: 80,
            background: 'linear-gradient(135deg, #1289f8c4 0%, #12051fff 100%)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mb: 3,
            animation: 'float 3s ease-in-out infinite',
            '@keyframes float': {
              '0%, 100%': { transform: 'translateY(0px)' },
              '50%': { transform: 'translateY(-10px)' }
            }
          }}
        >
          <HowToReg sx={{ fontSize: 40, color: 'white' }} />
        </Box>

        <Typography 
          component="h1" 
          variant="h4"
          sx={{
            mb: 1,
            background: 'linear-gradient(135deg,#1289f8c4 0%, #12051fff 100%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            color: 'transparent',
            fontWeight: 600
          }}
        >
          Inscription Admin
        </Typography>

        <Typography 
          variant="body2" 
          color="text.secondary"
          sx={{ mb: 4, textAlign: 'center' }}
        >
          Créez votre compte administrateur
        </Typography>

        <Box component="form" sx={{ width: '100%' }}>
          {/* Champ Nom complet */}
          <TextField
            fullWidth
            label="Nom complet"
            variant="outlined"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={handleKeyPress}
            sx={{ mb: 3 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Person color="action" />
                </InputAdornment>
              ),
            }}
          />

          {/* Champ Email */}
          <TextField
            fullWidth
            label="Email"
            type="email"
            variant="outlined"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={handleKeyPress}
            sx={{ mb: 3 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Email color="action" />
                </InputAdornment>
              ),
            }}
          />

          {/* Champ Mot de passe */}
          <TextField
            fullWidth
            label="Mot de passe"
            type={showPassword ? 'text' : 'password'}
            variant="outlined"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={handleKeyPress}
            sx={{ mb: 3 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Lock color="action" />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle password visibility"
                    onClick={handleClickShowPassword}
                    edge="end"
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          {/* Message d'erreur */}
          {error && (
            <Alert 
              severity="error" 
              sx={{ mb: 3 }}
            >
              {error}
            </Alert>
          )}

          {/* Bouton d'inscription */}
          <Button
            fullWidth
            variant="contained"
            onClick={handleRegister}
            disabled={loading}
            sx={{
              py: 1.5,
              mb: 3,
              background: 'linear-gradient(135deg, #1289f8c4 0%, #12051fff 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg,  #145593c4 0%, #463458ff 100%)',
                transform: 'translateY(-2px)',
                boxShadow: 4
              },
              fontSize: '1rem',
              fontWeight: 600
            }}
          >
            {loading ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              "S'inscrire"
            )}
          </Button>

          <Divider sx={{ mb: 3 }}>
            <Typography variant="body2" color="text.secondary">
              Déjà un compte ?
            </Typography>
          </Divider>

          {/* Lien vers connexion */}
          <Box sx={{ textAlign: 'center' }}>
            <Button
              variant="outlined"
              fullWidth
              onClick={() => navigate("/admin/login")}
              sx={{
                py: 1.5,
                borderColor: '#667eea',
                color: '#667eea',
                '&:hover': {
                  borderColor: '#5a6fd8',
                  backgroundColor: 'rgba(102, 126, 234, 0.04)',
                  transform: 'translateY(-1px)'
                }
              }}
            >
              Se connecter
            </Button>
          </Box>
        </Box>

        {/* Badge RH en bas */}
        <Box
          sx={{
            position: 'absolute',
            bottom: 10,
            left: '50%',
            transform: 'translateX(-50%)',
            fontSize: '10px',
            color: 'text.secondary',
            letterSpacing: 2,
            fontWeight: 600,
            opacity: 0.7
          }}
        >
          RESSOURCES HUMAINES
        </Box>
      </Paper>

      {/* Modal de confirmation */}
      <Dialog
        open={openModal}
        onClose={handleModalClose}
        aria-labelledby="success-dialog-title"
        aria-describedby="success-dialog-description"
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle 
          id="success-dialog-title"
          sx={{ 
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 2
          }}
        >
          <CheckCircle 
            sx={{ 
              fontSize: 60, 
              color: 'success.main',
              animation: 'scaleIn 0.5s ease-out',
              '@keyframes scaleIn': {
                '0%': { transform: 'scale(0)', opacity: 0 },
                '100%': { transform: 'scale(1)', opacity: 1 }
              }
            }} 
          />
          <Typography variant="h5" component="div" color="success.main">
            {modalData.title}
          </Typography>
        </DialogTitle>
        
        <DialogContent>
          <DialogContentText 
            id="success-dialog-description"
            sx={{ textAlign: 'center', mb: 2 }}
          >
            {modalData.message}
          </DialogContentText>
          
          <Paper 
            variant="outlined" 
            sx={{ 
              p: 2, 
              backgroundColor: 'grey.50',
              borderColor: 'success.light'
            }}
          >
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Typography variant="body2" sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <strong>Nom :</strong> 
                <span>{modalData.adminName}</span>
              </Typography>
              <Typography variant="body2" sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <strong>Email :</strong> 
                <span>{modalData.adminEmail}</span>
              </Typography>
              <Typography variant="body2" sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <strong>Rôle :</strong> 
                <span>Administrateur</span>
              </Typography>
            </Box>
          </Paper>
          
          <Alert 
            severity="info" 
            sx={{ mt: 2 }}
          >
            Vous allez être redirigé vers la page de connexion.
          </Alert>
        </DialogContent>
        
        <DialogActions sx={{ justifyContent: 'center', pb: 3 }}>
          <Button
            variant="contained"
            onClick={handleModalClose}
            size="large"
            sx={{
              px: 4,
              background: 'linear-gradient(135deg, #1289f8c4 0%, #12051fff 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg,  #145593c4 0%, #463458ff 100%)',
              }
            }}
          >
            Se connecter
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AdminRegister;