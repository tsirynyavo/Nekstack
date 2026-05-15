import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Paper,
  Breadcrumbs,
  Link
} from '@mui/material';
import {
  Home as HomeIcon,
  Assessment as ReportIcon,
  ListAlt as PresenceIcon,
  BeachAccess as CongesIcon,
  AccountBalance as SoldeIcon,
  Receipt as PaieIcon
} from '@mui/icons-material';

const Rapports = () => {
  const navigate = useNavigate();

  const reportCards = [
           
    {
      title: 'Planification des aides',
      description: 'Consulter les rapports des aides ',
      icon: <PresenceIcon sx={{ fontSize: 32, color: '#1976d2' }} />,
      path: '/admin/rapports/aides',
      color: '#1976d2',
      stats: 'Suivi quotidien'
    },
    {
      title: 'Nos ressources actuels',
      description: 'Voir nos ressources disponibles',
      icon: <CongesIcon sx={{ fontSize: 32, color: '#2e7d32' }} />,
      path: '/admin/rapports/ressource',
      color: '#2e7d32',
      stats: 'Suivi de nos restes de ressources'
    },
    {
      title: 'Nombres effectifs quartier ',
      description: 'Comparaison des effectifs   par quartier ',
      icon: <SoldeIcon sx={{ fontSize: 32, color: '#ed6c02' }} />,
      path: '/admin/rapports/quartiers',
      color: '#ed6c02',
      stats: 'Comparaison entre quartier'
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
      <Paper 
        elevation={1} 
        sx={{ 
          p: 3, 
          mb: 3, 
          backgroundColor: '#f8f9fa' 
        }}
      >
        <Box display="flex" alignItems="center" mb={2}>
          <ReportIcon sx={{ fontSize: 32, color: '#666', mr: 2 }} />
          <Box>
            <Typography variant="h4" fontWeight="bold" color="primary">
              Rapports RH
            </Typography>
            <Typography variant="body1" color="textSecondary">
              Consultez et générez les différents rapports des ressources humaines
            </Typography>
          </Box>
        </Box>
      </Paper>

      {/* Fil d'Ariane */}
      <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 3 }}>
        <Link
          underline="hover"
          color="inherit"
          onClick={() => navigate('/admin/dashboard')}
          sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            cursor: 'pointer' 
          }}
        >
          <HomeIcon sx={{ mr: 0.5 }} fontSize="inherit" />
          Accueil
        </Link>
        <Typography 
          color="text.primary" 
          sx={{ display: 'flex', alignItems: 'center' }}
        >
          <ReportIcon sx={{ mr: 0.5 }} fontSize="inherit" />
          Rapports RH
        </Typography>
      </Breadcrumbs>

      {/* Cartes des rapports */}
      <Grid container spacing={3}>
        {reportCards.map((card, index) => (
          <Grid item xs={12} md={6} lg={3} key={index}>
            <Card 
              sx={{ 
                height: '100%',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                borderLeft: '4px solid transparent',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 4,
                  borderLeft: `4px solid ${card.color}`
                }
              }}
              onClick={() => handleNavigation(card.path)}
            >
              <CardContent sx={{ p: 2, textAlign: 'center' }}>
                <Box sx={{ mb: 1.5 }}>
                  {card.icon}
                </Box>
                
                <Typography 
                  variant="h6" 
                  fontWeight="bold"
                  sx={{ mb: 1, color: card.color }}
                >
                  {card.title}
                </Typography>
                
                <Typography 
                  variant="body2" 
                  color="textSecondary"
                  sx={{ mb: 2, minHeight: '40px' }}
                >
                  {card.description}
                </Typography>
                
                <Paper 
                  elevation={0}
                  sx={{ 
                    backgroundColor: `${card.color}15`,
                    p: 1,
                    borderRadius: 1
                  }}
                >
                  <Typography 
                    variant="caption" 
                    fontWeight="medium"
                    sx={{ color: card.color }}
                  >
                    {card.stats}
                  </Typography>
                </Paper>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
{/* Section informations */}
<Box sx={{ mt: 6, mb: 4 }}>  {/* ← Espacement personnalisé */}
  <Grid container spacing={3}>
    <Grid item xs={12} md={6}>
      <Paper elevation={1} sx={{ p: 2 }}>
        <Typography variant="h6" gutterBottom color="primary">
          💡 Conseils d'utilisation
        </Typography>
        <Typography variant="body2" color="textSecondary">
          • Exportez les rapports pour archivage<br/>
          • Vérifiez régulièrement les soldes de congés<br/>
          • Consultez l'historique pour les analyses tendancielles
        </Typography>
      </Paper>
    </Grid>
    <Grid item xs={12} md={6}>
      <Paper elevation={1} sx={{ p: 2 }}>
        <Typography variant="h6" gutterBottom color="primary">
          📊 Données disponibles
        </Typography>
        <Typography variant="body2" color="textSecondary">
          • Données en temps réel<br/>
          • Historique complet<br/>
          • Export PDF/Excel disponible
        </Typography>
      </Paper>
    </Grid>
  </Grid>
</Box>
    </Box>
  );
};

export default Rapports;