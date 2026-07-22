import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    primary: {
      main: "#5E35B1",
      light: "#F5F3FF",
      dark: "#4527A0",
      contrastText: "#FFFFFF",
    },

    text: {
      primary: "#1E1154",
      secondary: "#6B7280",
    },

    background: {
      default: "#FFFFFF",     // Premium light page background
      paper: "#FFFFFF",       // Card background
    },
  },


  shape: {
    borderRadius: 8,
  },


  typography: {
    fontFamily: "Jost, sans-serif",

    h3: {
      fontSize: "30px",
      fontWeight: 900,
      letterSpacing: "-0.02em",
      color: "#1E1154",
    },
    h4: {
      fontSize: "24px",
      fontWeight: 800,
      color: "#111827"
    },
    h6: {
      fontSize: "18px",
      fontWeight: 800,
      color: "#111827"
    },
    subtitle2: {
      fontSize: "14px",
      fontWeight: 600,
      color: "#374151"
    },
    body1: {
      fontSize: "16px",
      
    },
    button: {
      fontWeight: 600,
      textTransform: "none",
    },
  },

  custom: {
    buttonRadius: 10,
    spacingLarge: 32,
  },

  components: {
    MuiButton: {
      defaultProps: {
        disableElevation: true,
      },
      styleOverrides: {
        root: {
          padding: "10px 24px",
          borderRadius: "10px", 
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          "& fieldset": { borderColor: "#E5E7EB" },
          "&:hover fieldset": { borderColor: "#D1D5DB" },
        },
      },
    },
  },
});

export default theme;