import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Box,
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  InputAdornment,
  IconButton,
  Alert,
  CircularProgress,
  Divider
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  AdminPanelSettings,
  Person,
  HowToReg
} from '@mui/icons-material';

const AdminLogin = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(false);
    const [emailError, setEmailError] = useState(false);
    const [loginError, setLoginError] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const auth = localStorage.getItem('admin');
        if (auth) {
            navigate("/admin/dashboard");
        }
    }, [navigate]);

    const handleLogin = async () => {
        setError(false);
        setEmailError(false);
        setLoginError('');
        setLoading(true);

        if (!email || !password) {
            setError(true);
            setLoading(false);
            return;
        }

        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!emailRegex.test(email)) {
            setEmailError(true);
            setLoading(false);
            return;
        }

        try {
            let response = await fetch("http://localhost:5050/admin-login", {
                method: 'POST',
                body: JSON.stringify({ email, password }),
                headers: { 'Content-Type': 'application/json' }
            });

            let result = await response.json();
            
            if (response.ok) {
                localStorage.setItem('admin', JSON.stringify(result));
                navigate("/admin/dashboard");
            } else {
                setLoginError(result.result || "Accès admin refusé");
            }
        } catch (err) {
            setLoginError("Erreur de connexion au serveur");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') handleLogin();
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
                    position: 'relative',
                    overflow: 'hidden'
                }}
            >
                {/* Logo RH */}
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
                    <AdminPanelSettings sx={{ fontSize: 40, color: 'white' }} />
                </Box>

                <Typography 
                    component="h1" 
                    variant="h4"
                    sx={{
                        mb: 1,
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        backgroundClip: 'text',
                        WebkitBackgroundClip: 'text',
                        color: 'transparent',
                        fontWeight: 600
                    }}
                >
                    Connexion Admin
                </Typography>

                <Typography 
                    variant="body2" 
                    color="text.secondary"
                    sx={{ mb: 4 }}
                >
                    Accédez à votre espace d'administration
                </Typography>

                <Box component="form" sx={{ width: '100%' }}>
                    {/* Champ Email */}
                    <TextField
                        fullWidth
                        label="Email admin"
                        variant="outlined"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        onKeyDown={handleKeyPress}
                        error={(error && !email) || emailError}
                        helperText={
                            (error && !email) ? "Veuillez entrer un email" :
                            emailError ? "Email invalide" : ""
                        }
                        sx={{ mb: 3 }}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <Person color="action" />
                                </InputAdornment>
                            ),
                        }}
                    />

                    {/* Champ Mot de passe */}
                    <TextField
                        fullWidth
                        label="Mot de passe admin"
                        type={showPassword ? 'text' : 'password'}
                        variant="outlined"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        onKeyDown={handleKeyPress}
                        error={error && !password}
                        helperText={error && !password ? "Veuillez entrer un mot de passe" : ""}
                        sx={{ mb: 3 }}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <HowToReg color="action" />
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

                    {/* Message d'erreur de connexion */}
                    {loginError && (
                        <Alert 
                            severity="error" 
                            sx={{ mb: 3 }}
                        >
                            {loginError}
                        </Alert>
                    )}

                    {/* Bouton de connexion */}
                    <Button
                        fullWidth
                        variant="contained"
                        onClick={handleLogin}
                        disabled={loading}
                        sx={{
                            py: 1.5,
                            mb: 3,
                            background: 'linear-gradient(135deg, #1289f8c4 0%, #12051fff 100%)',
                            '&:hover': {
                                background: 'linear-gradient(135deg, rgba(44, 58, 126, 1)c4 0%, #12051fff 100%)',
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
                            'Se connecter'
                        )}
                    </Button>

                    <Divider sx={{ mb: 3 }}>
                        <Typography variant="body2" color="text.secondary">
                            Options
                        </Typography>
                    </Divider>

                    {/* Liens de navigation */}
                    <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="body2" sx={{ mb: 2 }}>
                            Pas encore de compte ?{" "}
                            <Link 
                                to="/admin/register" 
                                style={{ 
                                    color: "#667eea", 
                                    textDecoration: "none",
                                    fontWeight: 600
                                }}
                            >
                                S'inscrire
                            </Link>
                        </Typography>

                        <Typography variant="body2">
                            Vous êtes un employé ?{" "}
                            <Link 
                                to="/employee/login" 
                                style={{ 
                                    color: "#28a745", 
                                    textDecoration: "none",
                                    fontWeight: 600
                                }}
                            >
                                Connexion employé
                            </Link>
                        </Typography>
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
        </Container>
    );
};

export default AdminLogin;