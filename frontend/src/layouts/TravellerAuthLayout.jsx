import React from 'react';
import { Outlet } from 'react-router-dom';
import { Box } from '@mui/material';
import Navbar from '../components/common/Navbar';

export default function TravellerAuthLayout() {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar variant="full" role="TRAVELLER" />
      <Box sx={{ height: 64, flexShrink: 0 }} />
      <Box component="main" sx={{ flexGrow: 1, position: 'relative' }}>
        <Outlet />
      </Box>
    </Box>
  );
}
