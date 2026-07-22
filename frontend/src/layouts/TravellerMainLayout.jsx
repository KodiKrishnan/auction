import React from 'react';
import { Box } from '@mui/material';
import { Outlet } from 'react-router-dom';
import TravellerNavbar from '../features/traveller/components/TravellerNavbar';

export default function TravellerMainLayout() {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <TravellerNavbar />
      <Box sx={{ height: { xs: 320, md: 148 }, flexShrink: 0 }} /> 
      
      <Box component="main" sx={{ flexGrow: 1, position: 'relative' }}>
        <Outlet />
      </Box>
    </Box>
  );
}