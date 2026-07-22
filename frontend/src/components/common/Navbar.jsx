import React from 'react';
import { AppBar, Toolbar, Typography, Button, Stack, Box, Link } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import navbarLogoIcon from '../../assets/logos/nivasabid-logo.png';

// ─── NAV CONFIG ───────────────────────────────────────────────────────────────
const NAV_CONFIG = {
  OWNER: {
    links: [
      { label: 'Properties', href: '#' },
      { label: 'How it works', href: '#' },
      { label: 'About', href: '#' },
    ],
    loginLabel: 'Host Login',
    loginPath: '/owner/register',
  },
  TRAVELLER: {
    links: [
      { label: 'Explore', href: '#' },
      { label: 'How Bidding Works', href: '#' },
      { label: 'About', href: '#' },
    ],
    loginLabel: 'Traveller Login',
    loginPath: '/traveller/register',
  },
};

// ─── COMPONENT ────────────────────────────────────────────────────────────────
export default function Navbar({ variant = "full", role = "OWNER" }) {
  const navigate = useNavigate();
  const config = NAV_CONFIG[role] || NAV_CONFIG.OWNER;

  return (
    <AppBar
      position="fixed"
      elevation={0}
      sx={{
        backgroundColor: 'background.default',
        borderBottom: '1px solid #E5E7EB',
        height: 64,
        justifyContent: 'center',
        zIndex: 1300,
      }}
    >
      <Toolbar disableGutters sx={{ px: 3, justifyContent: 'space-between' }}>

        {/* Logo — always shown, clicking goes to home */}
        <Stack
          direction="row"
          sx={{ alignItems: 'center', gap: 1, cursor: 'pointer' }}
          onClick={() => navigate('/')}
        >
          <Box component="img" src={navbarLogoIcon} sx={{ height: 32, display: 'block' }} />
          <Typography 
            variant="h6" 
            sx={{ 
              fontWeight: 900, 
              color: '#5E35B1',
              lineHeight: 1,
              transform: 'translateY(4px)' 
            }}
          >
            NivasaBid
          </Typography>
        </Stack>

        {/* Nav links + Login button — only when variant="full" */}
        {variant === "full" && (
          <Stack direction="row" spacing={4} sx={{ alignItems: 'center' }}>

            {config.links.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                underline="none"
                sx={{
                  color: 'text.primary',
                  fontWeight: 500,
                  fontSize: '0.95rem',
                  display: 'flex',
                  alignItems: 'center',
                  transition: 'color 0.2s',
                  '&:hover': { color: '#5E35B1' },
                }}
              >
                {link.label}
              </Link>
            ))}

            <Button
              variant="contained"
              onClick={() => navigate(config.loginPath)}
              sx={{
                bgcolor: '#5E35B1',
                textTransform: 'none',
                fontWeight: 600,
                borderRadius: 2,
                px: 3,
                height: 40,
                '&:hover': { bgcolor: '#4527A0' },
              }}
            >
              {config.loginLabel}
            </Button>

          </Stack>
        )}
      </Toolbar>
    </AppBar>
  );
}