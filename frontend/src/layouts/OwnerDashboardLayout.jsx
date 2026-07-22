import React, { useState } from "react";
import { Box } from "@mui/material";
import { Outlet } from "react-router-dom";

import Sidebar from "../features/owner/components/Sidebar";
import Topbar from "../features/owner/components/Topbar";

const drawerWidth = 260;

export default function OwnerDashboardLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "default" }}>
      {/* Sidebar handles both Mobile and Desktop views */}
      <Sidebar 
        drawerWidth={drawerWidth} 
        mobileOpen={mobileOpen} 
        handleDrawerToggle={handleDrawerToggle} 
      />

      <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', width: { sm: `calc(100% - ${drawerWidth}px)` } }}>
        <Topbar 
          drawerWidth={drawerWidth} 
          handleDrawerToggle={handleDrawerToggle} 
        />

        {/* Main Content Area where OwnerDashboard will render */}
        <Box component="main" sx={{ flexGrow: 1, p: 4, mt: 8 }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}