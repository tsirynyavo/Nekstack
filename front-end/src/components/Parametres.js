import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  Divider
} from '@mui/material';
import {
  Business as DepartementIcon,
  TrendingUp as TauxIcon,
  Event as JourFerieIcon,
  Settings as SettingsIcon
} from '@mui/icons-material';

const Parametres = () => {
  const navigate = useNavigate();

  const parametresOptions = [
    {
      title: 'Quartier',
      description: 'Gérer les quartiers de Fianarantsoa',
      icon: <DepartementIcon sx={{ fontSize: 40, color: '#1976d2' }} />,
      path: '/admin/quartiers',
      color: '#1976d2',
      stats: 'Liste des quartiers'
    },
    {
      title: 'Taux',
      description: 'Configurer les taux de cotisations et impôts',
      icon: <TauxIcon sx={{ fontSize: 40, color: '#2e7d32' }} />,
      path: '/admin/taux',
      color: '#2e7d32',
      stats: 'Paramètres financiers'
    },
  
  ];

  const handleNavigation = (path) => {
    navigate(path);
  };

  return (
    <Box 
  sx={{ 
    p: 3,
    marginLeft: '210px', // ⬅️ AJOUTEZ CETTE LIGNE
    width: 'calc(100% - 200px)', // ⬅️ ET CELLE-CI
    minHeight: '100vh',
    backgroundColor: '#f8f9fa'
  }}
>
      {/* En-tête */}
      <Paper elevation={1} sx={{ p: 3, mb: 3, backgroundColor: '#f8f9fa' }}>
        <Box display="flex" alignItems="center" mb={2}>
          <SettingsIcon sx={{ fontSize: 40, color: '#666', mr: 2 }} />
          <Box>
            <Typography variant="h4" fontWeight="bold" color="primary">
              Paramètres
            </Typography>
            <Typography variant="body1" color="textSecondary">
              Configuration générale du système de gestion RH
            </Typography>
          </Box>
        </Box>
      </Paper>

      {/* Cartes des paramètres */}
      <Grid container spacing={3}>
        {parametresOptions.map((option, index) => (
          <Grid item xs={12} md={6} lg={4} key={index}>
            <Card 
              sx={{ 
                height: '100%',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 4,
                  borderLeft: `4px solid ${option.color}`
                }
              }}
              onClick={() => handleNavigation(option.path)}
            >
              <CardContent sx={{ p: 3, textAlign: 'center' }}>
                <Box sx={{ mb: 2 }}>
                  {option.icon}
                </Box>
                
                <Typography 
                  variant="h5" 
                  component="h2" 
                  gutterBottom
                  fontWeight="bold"
                  color={option.color}
                >
                  {option.title}
                </Typography>
                
                <Typography 
                  variant="body1" 
                  color="textSecondary"
                  sx={{ mb: 2, minHeight: '40px' }}
                >
                  {option.description}
                </Typography>
                
                <Paper 
                  elevation={0}
                  sx={{ 
                    backgroundColor: `${option.color}15`,
                    p: 1,
                    borderRadius: 1
                  }}
                >
                  <Typography variant="body2" color={option.color}>
                    {option.stats}
                  </Typography>
                </Paper>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

    

      {/* Section informations */}
      <Box sx={{ mt: 6, mb: 4 }}>
      <Grid container spacing={3} sx={{ mt: 1 }}>
        <Grid item xs={12} md={6}>
          <Paper elevation={1} sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom color="primary">
              💡 Conseils
            </Typography>
            <Typography variant="body2" color="textSecondary">
              • Configurez d'abord les départements avant les taux<br/>
              • Mettez à jour les jours fériés chaque année<br/>
              • Sauvegardez les modifications importantes
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper elevation={1} sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom color="primary">
              📋 Dernières modifications
            </Typography>
            <Typography variant="body2" color="textSecondary">
              • Aucune modification récente<br/>
              • Tous les paramètres sont à jour
            </Typography>
          </Paper>
        </Grid>
      </Grid>
      </Box>
    </Box>
  );
};

export default Parametres;