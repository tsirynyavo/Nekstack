import React from "react";
import {
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Box,
  Typography,
  Button
} from '@mui/material';
import {
  Person as PersonIcon,
  BeachAccess as BeachIcon,
  CalendarToday as CalendarIcon,
  Payment as PaymentIcon,
  Assignment as TaskIcon,
  Note as NoteIcon,
  Lock as LockIcon,
  ExitToApp as LogoutIcon,
  Work as WorkIcon
} from '@mui/icons-material';

const NavEmploye = ({ page, setPage, onLogout }) => {
  const menuItems = [
    { key: "profil", label: "Profil", icon: <PersonIcon /> },
    { key: "conge", label: "Congés", icon: <BeachIcon /> },
    { key: "presence", label: "Présence", icon: <CalendarIcon /> },
    { key: "paiement", label: "Paies", icon: <PaymentIcon /> },
    { key: "notes", label: "Notes", icon: <NoteIcon /> },
    { key: "taches", label: "Tâches", icon: <TaskIcon /> },
    { key: "password", label: "Mot de passe", icon: <LockIcon /> },
  ];

  const getIconColor = (itemKey) => {
    return page === itemKey ? '#fff' : 'rgba(255, 255, 255, 0.7)';
  };

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: 230,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: 230,
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
          display: 'flex',
          flexDirection: 'column',
          '&::-webkit-scrollbar': {
            height: 0,
          },
        },
      }}
    >
      {/* En-tête du sidebar */}
      <Box sx={{ 
        p: 3, 
        textAlign: 'center', 
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        background: 'rgba(255, 255, 255, 0.05)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Effet de motif en chevron */}
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
        
        <WorkIcon 
          sx={{ 
            fontSize: 40, 
            mb: 1, 
            color: 'white',
            position: 'relative',
            zIndex: 1
          }} 
        />
        
        <Typography 
          variant="h6" 
          component="div" 
          sx={{ 
            fontWeight: 'bold',
            color: 'white',
            position: 'relative',
            zIndex: 1,
            textShadow: '0 2px 4px rgba(0,0,0,0.3)'
          }}
        >
          Espace Employé
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
          Votre espace personnel
        </Typography>
      </Box>

      {/* Menu de navigation */}
      <List sx={{ pt: 2, flexGrow: 1 }}>
        {menuItems.map((item) => (
          <ListItem 
            key={item.key}
            onClick={() => setPage(item.key)}
            sx={{
              margin: '2px 12px',
              borderRadius: '8px',
              borderLeft: page === item.key ? '4px solid #fff' : '4px solid transparent',
              backgroundColor: page === item.key ? 'rgba(255, 255, 255, 0.2)' : 'transparent',
              transition: 'all 0.3s ease',
              position: 'relative',
              overflow: 'hidden',
              cursor: 'pointer',
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
            <ListItemIcon sx={{ minWidth: 40, color: getIconColor(item.key) }}>
              {item.icon}
            </ListItemIcon>
            <ListItemText 
              primary={item.label}
              sx={{
                '& .MuiTypography-root': {
                  fontWeight: page === item.key ? '600' : '500',
                  color: page === item.key ? '#fff' : 'rgba(255, 255, 255, 0.9)',
                }
              }}
            />
          </ListItem>
        ))}
      </List>

      {/* Section déconnexion */}
      <Box sx={{ p: 2, borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
        <Button
          fullWidth
          startIcon={<LogoutIcon />}
          onClick={onLogout}
          sx={{
            color: 'rgba(255, 255, 255, 0.9)',
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '8px',
            py: 1.5,
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
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              borderColor: 'rgba(255, 255, 255, 0.3)',
              transform: 'translateY(-2px)',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
            },
          }}
        >
          Déconnexion
        </Button>
      </Box>

      {/* Section informations en bas */}
      <Box sx={{ 
        p: 2, 
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
        <Typography 
          variant="caption" 
          sx={{ 
            color: 'rgba(255, 255, 255, 0.6)', 
            position: 'relative', 
            zIndex: 1,
            fontSize: '0.7rem',
            textAlign: 'center',
            display: 'block'
          }}
        >
          © 2025 Commune Urbaine d'Ambalavao
        </Typography>
      </Box>
    </Drawer>
  );
};

export default NavEmploye;