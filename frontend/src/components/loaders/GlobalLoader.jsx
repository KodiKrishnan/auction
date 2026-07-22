import React from "react";
import { Backdrop, LinearProgress, Box } from "@mui/material";
import { useLoader } from "../../context/LoaderContext";

export default function GlobalLoader() {

  const { loading } = useLoader();

  return (
    <Backdrop
      open={loading}
      sx={{
        zIndex: (theme) => theme.zIndex.drawer + 9999,
        backgroundColor: "rgba(0,0,0,0.4)",
      }}
    >
      <Box sx={{ width: 300 }}>
        <LinearProgress />
      </Box>
    </Backdrop>
  );
}