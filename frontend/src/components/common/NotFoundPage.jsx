import React from 'react';
import { Box, Typography, Button, Stack } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';

const COMING_SOON_ROUTES = [
  '/owner/rules',
  '/owner/auctions',
  '/owner/bids',
  '/owner/payments',
  '/owner/reports',
  '/owner/profile',
  '/owner/settings',
  '/traveller/explore',
  '/owner/kyc',
];

const ROUTE_LABELS = {
  '/owner/rules':       'Rule Management',
  '/owner/auctions':    'Auction Management',
  '/owner/bids':        'Bids',
  '/owner/payments':    'Payments',
  '/owner/reports':     'Reports',
  '/owner/profile':     'Profile',
  '/owner/settings':    'Settings',
  '/traveller/explore': 'Explore',
  '/owner/kyc':         'KYC',
};

export default function NotFoundPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const isComingSoon = COMING_SOON_ROUTES.includes(location.pathname);
  const pageLabel = ROUTE_LABELS[location.pathname] || 'This page';

  return (
    <Box sx={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      bgcolor: 'background.default',
      px: 3,
    }}>
      <Box sx={{ textAlign: 'center', maxWidth: 420 }}>

        {/* Illustration */}
        <Box sx={{ mb: 4, display: 'flex', justifyContent: 'center' }}>
          <svg width="180" height="160" viewBox="0 0 180 160" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Document stack */}
            <rect x="30" y="40" width="90" height="110" rx="8" fill="#EDE7F6" />
            <rect x="40" y="30" width="90" height="110" rx="8" fill="#D1C4E9" />
            <rect x="50" y="20" width="90" height="110" rx="8" fill="#5E35B1" opacity="0.15" />
            <rect x="50" y="20" width="90" height="110" rx="8" fill="white" stroke="#EDE7F6" strokeWidth="1.5" />
            {/* Lines on document */}
            <rect x="66" y="45" width="58" height="6" rx="3" fill="#EDE7F6" />
            <rect x="66" y="59" width="42" height="6" rx="3" fill="#EDE7F6" />
            <rect x="66" y="73" width="50" height="6" rx="3" fill="#EDE7F6" />
            {/* Magnifier */}
            <circle cx="130" cy="105" r="26" fill="white" stroke="#5E35B1" strokeWidth="3" />
            <circle cx="130" cy="105" r="18" fill="#F5F3FF" />
            <line x1="149" y1="124" x2="163" y2="140" stroke="#5E35B1" strokeWidth="4" strokeLinecap="round" />
            {/* Question mark inside magnifier */}
            <text x="123" y="113" fontSize="18" fontWeight="bold" fill="#5E35B1">?</text>
          </svg>
        </Box>

        {isComingSoon ? (
          <>
            {/* Coming Soon State */}
            <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 1, bgcolor: '#FFF7ED', border: '1px solid #FED7AA', borderRadius: 10, px: 2, py: 0.6, mb: 2 }}>
              <Box sx={{ width: 7, height: 7, borderRadius: '50%', bgcolor: '#EA580C' }} />
              <Typography sx={{ fontSize: 12, fontWeight: 600, color: '#EA580C' }}>
                Coming Soon
              </Typography>
            </Box>

            <Typography sx={{ fontSize: 22, fontWeight: 800, color: 'text.primary', mb: 1.5 }}>
              {pageLabel} is on its way
            </Typography>
            <Typography sx={{ fontSize: 14, color: 'text.secondary', mb: 4, lineHeight: 1.8 }}>
              We're currently building this feature. It will be available in the next update. Stay tuned!
            </Typography>

            {/* Progress bar decoration */}
            <Box sx={{ bgcolor: '#F3F4F6', borderRadius: 10, height: 6, mb: 4, overflow: 'hidden', mx: 'auto', maxWidth: 280 }}>
              <Box sx={{ bgcolor: '#5E35B1', height: '100%', width: '60%', borderRadius: 10 }} />
            </Box>
          </>
        ) : (
          <>
            {/* 404 State — No Data Style */}
            <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 1, bgcolor: '#F5F3FF', border: '1px solid #DDD6FE', borderRadius: 10, px: 2, py: 0.6, mb: 2 }}>
              <Box sx={{ width: 7, height: 7, borderRadius: '50%', bgcolor: '#5E35B1' }} />
              <Typography sx={{ fontSize: 12, fontWeight: 600, color: '#5E35B1' }}>
                Nothing here
              </Typography>
            </Box>

            <Typography sx={{ fontSize: 22, fontWeight: 800, color: 'text.primary', mb: 1.5 }}>
              No data found
            </Typography>
            <Typography sx={{ fontSize: 14, color: 'text.secondary', mb: 4, lineHeight: 1.8 }}>
              The page you're looking for doesn't exist or may have been moved. Double-check the URL or head back to safety.
            </Typography>
          </>
        )}

        {/* Actions */}
        <Stack direction="row" spacing={1.5} sx={{ justifyContent: 'center' }}>
          <Button
            onClick={() => navigate(-1)}
            sx={{
              textTransform: 'none', fontWeight: 600, fontSize: 13,
              color: 'text.secondary',
              border: '1px solid', borderColor: 'divider',
              borderRadius: 2, px: 2.5, py: 1,
              '&:hover': { bgcolor: 'action.hover' }
            }}
          >
            ← Go back
          </Button>
          <Button
            onClick={() => navigate('/owner/dashboard')}
            sx={{
              textTransform: 'none', fontWeight: 600, fontSize: 13,
              bgcolor: '#5E35B1', color: 'white',
              borderRadius: 2, px: 2.5, py: 1,
              '&:hover': { bgcolor: '#4527A0' }
            }}
          >
            Go to Dashboard
          </Button>
        </Stack>

      </Box>
    </Box>
  );
}