import React from 'react';
import ReactDOM from 'react-dom/client';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { BrowserRouter as Router } from 'react-router-dom';

import App from './App.jsx';
import theme from './app/theme';

import "@fontsource/jost";
import "@fontsource/jost/500.css";
import "@fontsource/jost/600.css";

import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";

import { AuthProvider } from './context/AuthContext';
import { LoaderProvider } from './context/LoaderContext';
import { ErrorProvider } from './context/ErrorContext';

import GlobalLoader from './components/loaders/GlobalLoader';

const GOOGLE_CLIENT_ID = "273613048255-i0q3bnhqm57ptct1cd2sipu8f4p35qs8.apps.googleusercontent.com";

ReactDOM.createRoot(document.getElementById('root')).render(
  <ThemeProvider theme={theme}>
    <CssBaseline />

    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <Router>
        <LoaderProvider>
          <ErrorProvider>
            <AuthProvider>

              <GlobalLoader />
              <App />

            </AuthProvider>
          </ErrorProvider>
        </LoaderProvider>
      </Router>
    </GoogleOAuthProvider>

  </ThemeProvider>
);