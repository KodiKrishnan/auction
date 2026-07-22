import React from 'react';
import { Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Toolbar, Box, Typography, Stack, Divider, Chip } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';

import DashboardIcon from '@mui/icons-material/Dashboard';
import ApartmentIcon from '@mui/icons-material/Apartment';
import GavelIcon from '@mui/icons-material/Gavel';
import RuleIcon from '@mui/icons-material/Rule';
import AddLinkIcon from '@mui/icons-material/AddLink'; 
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';

import navbarLogoIcon from '../../../assets/logos/nivasabid-logo.png';


const menuItems = [
  { text: 'Dashboard', icon: <DashboardIcon />, path: '/owner/dashboard', disabled: false },
  { text: 'My Properties', icon: <ApartmentIcon />, path: '/owner/properties', disabled: false },
  { text: 'Pricing Rules', icon: <RuleIcon />, path: '/owner/rules', disabled: false }, 
  { text: 'Rule Mapping', icon: <AddLinkIcon />, path: '/owner/rules-mapping', disabled: false }, 
  { text: 'Live Auctions', icon: <GavelIcon />, path: '/owner/auctions', disabled: false },
  { text: 'Payments', icon: <AccountBalanceWalletIcon />, path: '/owner/payments', disabled: true },
  { text: 'KYC', icon: <VerifiedUserIcon />, path: '/owner/kyc', disabled: true },
];

export default function Sidebar({ drawerWidth, mobileOpen, handleDrawerToggle }) {
  const navigate = useNavigate();
  const location = useLocation();

  const drawerContent = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', bgcolor: '#FFFFFF' }}>
      <Toolbar disableGutters sx={{ px: 3, height: 64, borderBottom: '1px solid #E5E7EB' }}>
        <Stack direction="row" sx={{ alignItems: 'center', gap: 1 }}>
          <Box component="img" src={navbarLogoIcon} sx={{ height: 32, width: 'auto', display: 'block' }} />
          <Typography 
            variant="h6" 
            sx={{ 
              fontWeight: 900, 
              color: '#5E35B1', 
              letterSpacing: '-0.5px',
              lineHeight: 1,
              transform: 'translateY(4px)' 
            }}
          >
            NivasaBid
          </Typography>
        </Stack>
      </Toolbar>
      
      <List sx={{ px: 2, pt: 3, flexGrow: 1 }}>
        {menuItems.map((item) => {
          const isActive = location.pathname.includes(item.path);
          return (
            <ListItem key={item.text} disablePadding sx={{ mb: 1 }}>
              <ListItemButton 
                disabled={item.disabled}
                onClick={() => {
                  if (item.disabled) return;
                  navigate(item.path);
                  if (mobileOpen) handleDrawerToggle(); 
                }}
                sx={{ 
                  borderRadius: 2, 
                  bgcolor: isActive && !item.disabled ? '#F5F3FF' : 'transparent', 
                  color: item.disabled ? '#9CA3AF' : (isActive ? '#5E35B1' : '#4B5563'), 
                  opacity: item.disabled ? 0.6 : 1, 
                  cursor: item.disabled ? 'not-allowed' : 'pointer', 
                  '&:hover': { 
                    bgcolor: item.disabled ? 'transparent' : '#F5F3FF', 
                    color: item.disabled ? '#9CA3AF' : '#5E35B1' 
                  } 
                }}
              >
                <ListItemIcon sx={{ color: 'inherit', minWidth: 40 }}>{item.icon}</ListItemIcon>
                <ListItemText 
                  primary={item.text} 
                  slotProps={{ primary: { fontWeight: isActive && !item.disabled ? 700 : 500, fontSize: '0.95rem' } }} 
                />
                {item.disabled && (
                  <Chip label="Soon" size="small" sx={{ height: 18, fontSize: '0.65rem', fontWeight: 600, bgcolor: '#F3F4F6', color: '#6B7280' }} />
                )}
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
      <Divider />
    </Box>
  );

  return (
    <Box component="nav" sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}>
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{ keepMounted: true }}
        sx={{ display: { xs: 'block', sm: 'none' }, '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth } }}
      >
        {drawerContent}
      </Drawer>
      <Drawer
        variant="permanent"
        sx={{ display: { xs: 'none', sm: 'block' }, '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth, borderRight: '1px solid #E5E7EB' } }}
        open
      >
        {drawerContent}
      </Drawer>
    </Box>
  );
}