import React, { useState } from 'react';
import { Box, Button, Menu, MenuItem, Avatar, Divider } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';

export default function UserMenu() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [anchorEl, setAnchorEl] = useState(null);
  const isMenuOpen = Boolean(anchorEl);

  const handleOpenMenu = (event) => setAnchorEl(event.currentTarget);
  const handleCloseMenu = () => setAnchorEl(null);

  const handleLogout = async () => {
    handleCloseMenu();
    await logout();
    window.location.href = '/traveller/properties';
  };

  const getUserInitials = () => {
    if (!user) return '';
    const first = user.firstName ? user.firstName[0] : '';
    const last = user.lastName ? user.lastName[0] : '';
    return (first + last).toUpperCase() || user.email[0].toUpperCase();
  };

  return (
    <Box>
      <Button
        onClick={handleOpenMenu}
        sx={{
          display: 'flex', alignItems: 'center', gap: 1.5, border: '1px solid #E5E7EB',
          borderRadius: '24px', padding: '5px 8px 5px 12px', backgroundColor: 'white',
          color: '#374151', textTransform: 'none', boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
          transition: 'box-shadow 0.2s ease', '&:hover': { backgroundColor: '#F9FAFB', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }
        }}
      >
        <MenuIcon sx={{ fontSize: 18, color: '#6B7280' }} />
        <Avatar sx={{ width: 30, height: 30, bgcolor: '#5E35B1', fontSize: 12, fontWeight: 700 }}>
          {user ? getUserInitials() : ''}
        </Avatar>
      </Button>

      <Menu
        anchorEl={anchorEl} open={isMenuOpen} onClose={handleCloseMenu}
        slotProps={{ paper: { sx: { mt: 1.5, width: 220, borderRadius: '12px', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)', border: '1px solid #E5E7EB', '& .MuiMenuItem-root': { fontSize: '13.5px', fontWeight: 500, py: 1.2, px: 2, color: '#374151' } } } }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        {user ? (
          <>
            <MenuItem onClick={() => { handleCloseMenu(); navigate('/traveller/wishlist'); }}>
              My Wishlist
            </MenuItem>
            <MenuItem onClick={() => { handleCloseMenu(); navigate('/traveller/profile'); }}>View Profile</MenuItem>

            <Divider sx={{ my: '4px !important' }} />
            <MenuItem onClick={handleLogout} sx={{ color: '#DC2626 !important' }}>Logout</MenuItem>
          </>
        ) : (
          <>
            <MenuItem onClick={() => { handleCloseMenu(); navigate('/traveller/register'); }}>Login as Traveller</MenuItem>
            <MenuItem onClick={() => { handleCloseMenu(); navigate('/owner/register'); }}>Login as Owner</MenuItem>
            <Divider sx={{ my: '4px !important' }} />
            <MenuItem onClick={() => { handleCloseMenu(); navigate('/traveller/register'); }}>Create an Account</MenuItem>
          </>
        )}
      </Menu>
    </Box>
  );
}