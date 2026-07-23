import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Avatar,
  Stack,
  Menu,
  MenuItem,
  ListItemIcon,
  Divider
} from '@mui/material';
import { useNavigate } from 'react-router-dom';

import NotificationsIcon from '@mui/icons-material/Notifications';
import MenuIcon from '@mui/icons-material/Menu';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import SettingsIcon from '@mui/icons-material/Settings';
import LogoutIcon from '@mui/icons-material/Logout';

import { useAuth } from '../../../context/AuthContext';

export default function Topbar({ drawerWidth, handleDrawerToggle }) {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [anchorEl, setAnchorEl] = useState(null);

  // Dynamically determine the name from updated profile fields
  const currentName = user?.firstName || user?.lastName
    ? `${user.firstName || ''} ${user.lastName || ''}`.trim()
    : (user?.name || '');

  const nameParts = currentName.split(' ').filter(Boolean);

  const initials =
    nameParts.length > 1
      ? `${nameParts[0][0]}${nameParts[nameParts.length - 1][0]}`.toUpperCase()
      : nameParts.length === 1
        ? nameParts[0][0].toUpperCase()
        : '';

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

   const handleLogout = async () => {
    setAnchorEl(null);

    try {
      await logout();
      window.location.href = '/traveller/properties';
    } catch (error) {
      console.error('Logout Failed:', error);
    }
  };

  return (
    <AppBar
      position="fixed"
      elevation={0}
      sx={{
        ml: { sm: `${drawerWidth}px` },
        width: { sm: `calc(100% - ${drawerWidth}px)` },
        bgcolor: '#FFFFFF',
        borderBottom: '1px solid #E5E7EB',
        height: 64,
        justifyContent: 'center'
      }}
    >
      <Toolbar sx={{ px: 3 }}>
        {/* Mobile Drawer Toggle */}
        <IconButton
          color="inherit"
          edge="start"
          onClick={handleDrawerToggle}
          sx={{
            mr: 2,
            display: { sm: 'none' },
            color: '#4B5563'
          }}
        >
          <MenuIcon />
        </IconButton>

        {/* Page Title */}
        <Typography
          variant="h6"
          sx={{
            flexGrow: 1,
            fontWeight: 800,
            fontSize: '1.25rem',
            color: '#1E1154'
          }}
        >
          Overview
        </Typography>

        <Stack
          direction="row"
          spacing={2.5}
          sx={{ alignItems: 'center' }}
        >
          {/* Notifications */}
          <IconButton sx={{ color: '#4B5563' }}>
            <NotificationsIcon />
          </IconButton>

          {/* User Avatar — Picture URL removed, now rendering strictly text character initials */}
          <Avatar
            sx={{
              bgcolor: '#5E35B1',
              width: 40,
              height: 40,
              fontSize: '1rem',
              fontWeight: 700
            }}
          >
            {initials || <AccountCircleIcon />}
          </Avatar>

          {/* Profile Menu Trigger */}
          <IconButton
            id="profile-menu-button"
            onClick={handleMenuOpen}
            aria-controls={anchorEl ? 'profile-menu' : undefined}
            aria-haspopup="true"
            aria-expanded={anchorEl ? 'true' : undefined}
            sx={{
              width: 40,
              height: 40,
              bgcolor: '#F3F4F6',
              borderRadius: '50%',
              color: '#4B5563',
              '&:hover': {
                bgcolor: '#E5E7EB'
              }
            }}
          >
            <MenuIcon fontSize="small" />
          </IconButton>

          {/* Profile Menu */}
          <Menu
            id="profile-menu"
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            disableAutoFocusItem
            slotProps={{
              list: {
                autoFocus: false,
                'aria-labelledby': 'profile-menu-button'
              },
              paper: {
                elevation: 0,
                sx: {
                  mt: 1.5,
                  minWidth: 200,
                  overflow: 'visible',
                  borderRadius: 2,
                  border: '1px solid #E5E7EB',
                  filter: 'drop-shadow(0px 4px 20px rgba(0,0,0,0.08))'
                }
              }
            }}
            anchorOrigin={{
              horizontal: 'right',
              vertical: 'bottom'
            }}
            transformOrigin={{
              horizontal: 'right',
              vertical: 'top'
            }}
          >
            <MenuItem
              onClick={() => {
                handleMenuClose();
                navigate('/owner/profile');
              }}
              sx={{ py: 1.5 }}
            >
              <ListItemIcon>
                <AccountCircleIcon fontSize="small" />
              </ListItemIcon>
              My Profile
            </MenuItem>

            <MenuItem
              onClick={handleMenuClose}
              sx={{ py: 1.5 }}
            >
              <ListItemIcon>
                <SettingsIcon fontSize="small" />
              </ListItemIcon>
              Account Settings
            </MenuItem>

            <Divider />

            <MenuItem
              onClick={handleLogout}
              sx={{
                py: 1.5,
                color: '#DC2626'
              }}
            >
              <ListItemIcon>
                <LogoutIcon
                  fontSize="small"
                  sx={{ color: '#DC2626' }}
                />
              </ListItemIcon>
              Logout
            </MenuItem>
          </Menu>
        </Stack>
      </Toolbar>
    </AppBar>
  );
}