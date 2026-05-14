import React, { useState, useEffect } from "react";
import axios from "axios";
import defaultMale from "../asset/default-male.jpg";
import defaultFemale from "../asset/default-femme.jpg";
import { Link, useNavigate } from "react-router-dom";
import CongesEmploye from "./CongesEmploye.js";
import PresenceEmploye from "./PresenceEmploye.js";
import TachesEmploye from "./TachesEmploye.js";
import NotesEmploye from "./NotesEmploye.js";
import PaiementEmploye from "./PaiementEmploye.js";
import ChangePassword from "./ChangePassword.js";
import NavEmploye from "./NavEmploye.js";
import {
  Box,
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Avatar,
  Grid,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  InputAdornment,
  IconButton,
  CircularProgress,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Person,
  Email,
  Lock,
  Phone,
  Home,
  Cake,
  Female,
  Male,
  Favorite,
  ChildCare,
  Badge,
  Work,
  Warning,
  Logout,
  Security
} from '@mui/icons-material';

const UserProfileEmploye = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [motdepasse, setMotdepasse] = useState("");
  const [employe, setEmploye] = useState(null);
  const [page, setPage] = useState("profil");
  const [showPassword, setShowPassword] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // 🔹 Restaurer l'employé depuis localStorage au démarrage
  useEffect(() => {
    const storedEmploye = localStorage.getItem("employe");
    if (storedEmploye) {
      setEmploye(JSON.parse(storedEmploye));
    }
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post("http://localhost:5050/employees/login", {
        email,
        motdepasse,
      });

      setEmploye(res.data.employe);
      localStorage.setItem("employe", JSON.stringify(res.data.employe));
    } catch (err) {
      console.error(err);
      setErrorMessage("Email ou mot de passe incorrect");
      setShowErrorModal(true);
    } finally {
      setLoading(false);
    }
  };

  // Fonction pour ouvrir le modal de déconnexion
  const openLogoutModal = () => {
    setShowLogoutModal(true);
  };

  // Fonction pour confirmer la déconnexion
  const confirmLogout = () => {
    setEmploye(null);
    localStorage.removeItem("employe");
    setPage("profil");
    setShowLogoutModal(false);
    
    // 🔥 EFFACER LES CHAMPS EMAIL ET MOT DE PASSE
    setEmail("");
    setMotdepasse("");
    setShowPassword(false);
  };

  // Fonction pour annuler la déconnexion
  const cancelLogout = () => {
    setShowLogoutModal(false);
  };

  const closeErrorModal = () => {
    setShowErrorModal(false);
    setErrorMessage("");
  };

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') handleLogin(e);
  };

  if (employe) {
    const parseDecimal = (val) => {
      if (!val) return "-";
      if (val.$numberDecimal) return parseFloat(val.$numberDecimal);
      return val;
    };

    const formatDate = (dateString) => {
      if (!dateString) return "-";
      return new Date(dateString).toLocaleDateString('fr-FR');
    };

    const defaultPhoto =
      employe.sexe?.toLowerCase() === "femme" ? defaultFemale : defaultMale;

    const getStatusColor = (status) => {
      switch (status?.toLowerCase()) {
        case 'actif': return 'success';
        case 'inactif': return 'error';
        case 'congé': return 'warning';
        default: return 'default';
      }
    };

    return (
      <Box sx={{ display: 'flex', minHeight: '100vh' }}>
        {/* Navigation à gauche */}
        <NavEmploye 
          page={page} 
          setPage={setPage} 
          onLogout={openLogoutModal}
        />

        {/* Contenu principal avec margin-left */}
        <Box 
          component="main" 
          sx={{ 
            flexGrow: 1, 
            p: 3,
            marginLeft: '0px', // ⬅️ VOTRE MARGIN LEFT
            width: `calc(100% - 230px)`,
            backgroundColor: '#f8f9fa',
            minHeight: '100vh'
          }}
        >
          {page === "profil" && (
            <Paper elevation={3} sx={{ p: 4, borderRadius: 3 }}>
              {/* Header du profil */}
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
                <Avatar
                  src={employe.photo ? `http://localhost:5050/${employe.photo}` : defaultPhoto}
                  sx={{ 
                    width: 120, 
                    height: 120,
                    mr: 3,
                    border: '4px solid',
                    borderColor: 'primary.main'
                  }}
                />
                <Box>
                  <Typography variant="h4" fontWeight="bold" gutterBottom>
                    {employe.nom} {employe.prenom}
                  </Typography>
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    <Badge sx={{ mr: 1 }} />
                    Matricule: {employe.matricule}
                  </Typography>
                  <Typography variant="h6" color="primary" gutterBottom>
                    <Work sx={{ mr: 1 }} />
                    {employe.poste}
                  </Typography>
                  <Chip 
                    label={employe.statut} 
                    color={getStatusColor(employe.statut)}
                    variant="filled"
                    sx={{ fontWeight: 'bold' }}
                  />
                </Box>
              </Box>

              <Divider sx={{ mb: 4 }} />

              {/* Informations Personnelles */}
              <Typography variant="h5" gutterBottom sx={{ mb: 3, color: 'primary.main' }}>
                Informations Personnelles
              </Typography>

              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Card variant="outlined" sx={{ mb: 2 }}>
                    <CardContent sx={{ display: 'flex', alignItems: 'center' }}>
                      <Badge color="primary" sx={{ mr: 2 }} />
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          CIN
                        </Typography>
                        <Typography variant="body1" fontWeight="medium">
                          {employe.cin}
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>

                  <Card variant="outlined" sx={{ mb: 2 }}>
                    <CardContent sx={{ display: 'flex', alignItems: 'center' }}>
                      <Email color="primary" sx={{ mr: 2 }} />
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          Email
                        </Typography>
                        <Typography variant="body1" fontWeight="medium">
                          {employe.email}
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>

                  <Card variant="outlined" sx={{ mb: 2 }}>
                    <CardContent sx={{ display: 'flex', alignItems: 'center' }}>
                      <Phone color="primary" sx={{ mr: 2 }} />
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          Téléphone
                        </Typography>
                        <Typography variant="body1" fontWeight="medium">
                          {employe.telephone || "-"}
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>

                  <Card variant="outlined" sx={{ mb: 2 }}>
                    <CardContent sx={{ display: 'flex', alignItems: 'center' }}>
                      <Home color="primary" sx={{ mr: 2 }} />
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          Adresse
                        </Typography>
                        <Typography variant="body1" fontWeight="medium">
                          {employe.adresse || "-"}
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Card variant="outlined" sx={{ mb: 2 }}>
                    <CardContent sx={{ display: 'flex', alignItems: 'center' }}>
                      <Cake color="primary" sx={{ mr: 2 }} />
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          Date de naissance
                        </Typography>
                        <Typography variant="body1" fontWeight="medium">
                          {formatDate(employe.datenaissance)}
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>

                  <Card variant="outlined" sx={{ mb: 2 }}>
                    <CardContent sx={{ display: 'flex', alignItems: 'center' }}>
                      {employe.sexe?.toLowerCase() === "femme" ? 
                        <Female color="primary" sx={{ mr: 2 }} /> : 
                        <Male color="primary" sx={{ mr: 2 }} />
                      }
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          Sexe
                        </Typography>
                        <Typography variant="body1" fontWeight="medium">
                          {employe.sexe}
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>

                  <Card variant="outlined" sx={{ mb: 2 }}>
                    <CardContent sx={{ display: 'flex', alignItems: 'center' }}>
                      <Favorite color="primary" sx={{ mr: 2 }} />
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          État civil
                        </Typography>
                        <Typography variant="body1" fontWeight="medium">
                          {employe.etat}
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>

                  <Card variant="outlined" sx={{ mb: 2 }}>
                    <CardContent sx={{ display: 'flex', alignItems: 'center' }}>
                      <ChildCare color="primary" sx={{ mr: 2 }} />
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          Nombre d'enfants
                        </Typography>
                        <Typography variant="body1" fontWeight="medium">
                          {employe.nombreEnfants || 0}
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Paper>
          )}

          {page === "conge" && <CongesEmploye employeId={employe._id} />}
          {page === "presence" && <PresenceEmploye employeId={employe._id} />}
          {page === "paiement" && <PaiementEmploye employeId={employe._id} />}
          {page === "notes" && <NotesEmploye employeId={employe._id} />}
          {page === "taches" && <TachesEmploye employeId={employe._id} />}
          {page === "password" && <ChangePassword employe={employe} />}
        </Box>

        {/* Modal de confirmation de déconnexion */}
        <Dialog
          open={showLogoutModal}
          onClose={cancelLogout}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle sx={{ 
            color:"primary" ,
backgroundColor: 'primary.main',
            display: 'flex',
            alignItems: 'center'
          }}>
            <Logout sx={{ mr: 1 }} />
            Déconnexion
          </DialogTitle>
          <DialogContent sx={{ pt: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Security color="warning" sx={{ fontSize: 40, mr: 2 }} />
              <Box>
                <Typography variant="h6" gutterBottom>
                  Êtes-vous sûr de vouloir vous déconnecter ?
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Vous devrez vous reconnecter pour accéder à votre espace employé.
                </Typography>
              </Box>
            </Box>
            <Alert severity="warning" sx={{ mt: 2 }}>
              ⚠️ Pour votre sécurité, les champs de connexion seront effacés.
            </Alert>
          </DialogContent>
          <DialogActions>
            <Button onClick={cancelLogout} color="primary">
              Annuler
            </Button>
            <Button 
              onClick={confirmLogout} 
                color="primary" 
backgroundColor= 'primary.main'
              variant="contained"
              startIcon={<Logout />}
            >
              Se déconnecter
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    );
  }

  // Page de login
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
          maxWidth: 450
        }}
      >
        <Avatar
          sx={{
            width: 80,
            height: 80,
            background: 'linear-gradient(135deg,#1289f8c4 0%, #12051fff 100%)',
            mb: 3
          }}
        >
          <Person sx={{ fontSize: 40 }} />
        </Avatar>

        <Typography component="h1" variant="h4" fontWeight="bold" gutterBottom>
          Connexion Employé
        </Typography>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
          Accédez à votre espace personnel
        </Typography>

        <Box component="form" onSubmit={handleLogin} sx={{ width: '100%' }}>
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

          <TextField
            fullWidth
            label="Mot de passe"
            type={showPassword ? 'text' : 'password'}
            variant="outlined"
            value={motdepasse}
            onChange={(e) => setMotdepasse(e.target.value)}
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

          <Button
            fullWidth
            type="submit"
            variant="contained"
            disabled={loading}
            sx={{
              py: 1.5,
              mb: 3,
              background: 'linear-gradient(135deg, #1289f8c4 0%, #12051fff 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #224565c4 0%, #12051fff 100%)',
              },
              fontSize: '1rem',
              fontWeight: 600
            }}
          >
            {loading ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              'Se connecter'
            )}
          </Button>

          <Divider sx={{ mb: 3 }} />

          <Typography variant="body2" textAlign="center">
            Vous êtes un admin ?{" "}
            <Link 
              to="/admin/login" 
              style={{ 
                color: "#667eea", 
                textDecoration: "none",
                fontWeight: 600
              }}
            >
              Connexion admin
            </Link>
          </Typography>
        </Box>
      </Paper>

      {/* Modal d'erreur pour la page de login */}
      <Dialog
        open={showErrorModal}
        onClose={closeErrorModal}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ 
          backgroundColor: 'error.main', 
          color: 'error.contrastText',
          display: 'flex',
          alignItems: 'center'
        }}>
          <Warning sx={{ mr: 1 }} />
          Erreur de connexion
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <Alert severity="error" sx={{ mb: 2 }}>
            {errorMessage}
          </Alert>
          <Typography variant="h6" gutterBottom>
            Vérifiez :
          </Typography>
          <List dense>
            <ListItem>
              <ListItemIcon>
                <Email color="error" />
              </ListItemIcon>
              <ListItemText primary="Votre adresse email" />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <Lock color="error" />
              </ListItemIcon>
              <ListItemText primary="Votre mot de passe" />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <Warning color="error" />
              </ListItemIcon>
              <ListItemText primary="Votre connexion internet" />
            </ListItem>
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeErrorModal} variant="contained" color="primary">
            Réessayer
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default UserProfileEmploye;