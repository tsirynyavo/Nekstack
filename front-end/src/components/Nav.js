
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Box,
  Typography
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  LocationCity as QuartierIcon,
  WaterDrop as RessourceIcon,
  VolunteerActivism as AideIcon,
  Assessment as ReportIcon,
  Settings as SettingsIcon,
  ExitToApp as LogoutIcon
} from '@mui/icons-material';
import '../components/nav.css';

const Nav = () => {
  const admin = localStorage.getItem('admin'); // pour sécuriser l'affichage
  const location = useLocation();

  if (!admin) return null;

  const menuItems = [
    { to: '/admin/dashboard', label: 'Tableau de bord', icon: <DashboardIcon /> },
    { to: '/admin/quartiers', label: 'Quartiers', icon: <QuartierIcon /> },
    { to: '/admin/citoyens', label: 'Citoyens', icon: <PeopleIcon /> },
    { to: '/admin/ressource', label: 'Ressources', icon: <RessourceIcon /> },
    { to: '/admin/aides', label: 'Aides', icon: <AideIcon /> },
    { to: '/admin/rapports', label: 'Rapports', icon: <ReportIcon /> },
    { to: '/admin/parametres', label: 'Paramètres', icon: <SettingsIcon /> },
    { to: '/admin/logout', label: 'Déconnexion', icon: <LogoutIcon /> },
  ];

  const getIconColor = (path) => {
    return location.pathname === path ? '#fff' : 'rgba(255, 255, 255, 0.7)';
  };

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: 280,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: 220,
          boxSizing: 'border-box',
          background: `
            linear-gradient(135deg, #030e19ff 0%, #115eb7ff 50%, #020a16ff 100%),
            repeating-linear-gradient(
              45deg,
              transparent,
              transparent 10px,
              rgba(255, 255, 255, 0.05) 10px,
              rgba(255, 255, 255, 0.05) 20px
            )
          `,
          color: 'white',
          border: 'none',
          boxShadow: '4px 0 20px rgba(0, 0, 0, 0.1)',
          overflowX: 'hidden',
          '&::-webkit-scrollbar': {
            height: 0,
          },
        },
      }}
    >
      {/* En-tête */}
      <Box sx={{ 
        p: 3, 
        textAlign: 'center', 
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        background: 'rgba(255, 255, 255, 0.05)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: `
              linear-gradient(45deg, transparent 45%, rgba(255,255,255,0.03) 45%, rgba(255,255,255,0.03) 55%, transparent 55%),
              linear-gradient(-45deg, transparent 45%, rgba(255,255,255,0.03) 45%, rgba(255,255,255,0.03) 55%, transparent 55%)
            `,
            backgroundSize: '20px 20px',
            opacity: 0.5
          }}
        />
        <Typography 
          variant="h5" 
          component="div" 
          sx={{ 
            fontWeight: 'bold',
            color: 'white',
            position: 'relative',
            zIndex: 1,
            textShadow: '0 2px 4px rgba(0,0,0,0.3)'
          }}
        >
          FIANARA SMART CITY
        </Typography>
        <Typography 
          variant="caption" 
          sx={{ 
            color: 'rgba(255, 255, 255, 0.8)',
            fontStyle: 'italic',
            position: 'relative',
            zIndex: 1
          }}
        >
          Des algorithmes pour la ville de demain
        </Typography>
      </Box>

      {/* Menu */}
      <List sx={{ pt: 2, overflow: 'hidden' }}>
        {menuItems.map((item, index) => (
          <ListItem 
            key={index}
            component={Link}
            to={item.to}
            sx={{
              margin: '2px 12px',
              borderRadius: '8px',
              borderLeft: location.pathname === item.to ? '4px solid #fff' : '4px solid transparent',
              backgroundColor: location.pathname === item.to ? 'rgba(255, 255, 255, 0.2)' : 'transparent',
              transition: 'all 0.3s ease',
              position: 'relative',
              overflow: 'hidden',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: '-100%',
                width: '100%',
                height: '100%',
                background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent)',
                transition: 'left 0.5s ease',
              },
              '&:hover::before': {
                left: '100%',
              },
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.15)',
                borderLeft: '4px solid rgba(255, 255, 255, 0.5)',
                transform: 'translateX(4px)',
              },
            }}
          >
            <ListItemIcon sx={{ minWidth: 40, color: getIconColor(item.to) }}>
              {item.icon}
            </ListItemIcon>
            <ListItemText 
              primary={item.label}
              sx={{
                '& .MuiTypography-root': {
                  fontWeight: location.pathname === item.to ? '600' : '500',
                  color: location.pathname === item.to ? '#fff' : 'rgba(255, 255, 255, 0.9)',
                }
              }}
            />
          </ListItem>
        ))}
      </List>

      {/* Pied de page */}
      <Box sx={{ 
        p: 2, 
        mt: 'auto', 
        borderTop: '1px solid rgba(255, 255, 255, 0.1)',
        background: 'rgba(0, 0, 0, 0.1)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: `
              linear-gradient(45deg, transparent 45%, rgba(255,255,255,0.02) 45%, rgba(255,255,255,0.02) 55%, transparent 55%),
              linear-gradient(-45deg, transparent 45%, rgba(255,255,255,0.02) 45%, rgba(255,255,255,0.02) 55%, transparent 55%)
            `,
            backgroundSize: '15px 15px',
          }}
        />
        <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.6)', position: 'relative', zIndex: 1 }}>
          © 2025 Fianara Smart City – Competitive Programming 1.0
        </Typography>
      </Box>
    </Drawer>
  );
};

export default Nav;