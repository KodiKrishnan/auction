import React from 'react';
import { Box } from '@mui/material';
import { Outlet } from 'react-router-dom';
import AppHeader from '../features/traveller/components/AppHeader';

export default function TravellerSimpleLayout() {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
     
      <AppHeader />
      
    
      <Box sx={{ height: 75, flexShrink: 0 }} /> 
      
      <Box component="main" sx={{ flexGrow: 1, position: 'relative' }}>
        <Outlet />
      </Box>
    </Box>
  );
}