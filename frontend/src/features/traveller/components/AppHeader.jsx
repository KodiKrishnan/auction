import React from 'react';
import { AppBar, Toolbar, Typography, Box, Stack } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import navbarLogoIcon from '../../../assets/logos/nivasabid-logo.png';
import UserMenu from './UserMenu';

export default function AppHeader({ children }) {
  const navigate = useNavigate();

  return (
    <AppBar
      position="fixed"
      elevation={0}
      sx={{
        backgroundColor: 'white',
        borderBottom: '1px solid #E5E7EB',
        zIndex: 1300,
        pt: 1.5,
        pb: children ? 2 : 1.5, // Shrinks padding if there is no search bar children
      }}
    >
      <Toolbar disableGutters sx={{ px: { xs: 2, md: 4 }, justifyContent: 'space-between', minHeight: 'unset !important', mb: children ? 2 : 0 }}>
        {/* Brand Logo */}
        <Stack direction="row" sx={{ alignItems: 'center', gap: 1, cursor: 'pointer' }} onClick={() => navigate('/')}>
          <Box component="img" src={navbarLogoIcon} sx={{ height: 32, display: 'block' }} />
          <Typography variant="h6" sx={{ fontWeight: 900, color: '#5E35B1', lineHeight: 1, transform: 'translateY(4px)' }}>
            NivasaBid
          </Typography>
        </Stack>

        {/* User Menu Trigger */}
        <UserMenu />
      </Toolbar>

      {/* Render optional child component (e.g. SearchBar) */}
      {children && (
        <Box sx={{ px: { xs: 2, md: 4 }, display: 'flex', justifyContent: 'center' }}>
          {children}
        </Box>
      )}
    </AppBar>
  );
}