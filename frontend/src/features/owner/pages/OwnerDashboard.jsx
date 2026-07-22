import React from 'react';
import { Box, Typography, Grid, Card, CardContent, Stack, Chip, Skeleton } from '@mui/material';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import { useAuth } from '../../../context/AuthContext'; 
import { useError } from '../../../context/ErrorContext';
import useSuccessAlert from '../../../shared/hooks/useSuccessAlert';
import SuccessAlert from '../../../components/SuccessAlert';

// API Import
import { fetchOwnerProfile } from '../ownerAPI';

export default function OwnerDashboard() {
  const { user, updateUser } = useAuth(); 
  const { showError } = useError();
  const { open, message, showSuccess, closeSuccess } = useSuccessAlert();

  const [profile, setProfile] = React.useState(null);
  const [loading, setLoading] = React.useState(true);

  const isKycVerified = false;
  const stats = {
    totalProperties: 0,
    activeAuctions: 0,
    bidsReceived: 0,
    expectedPayout: 0
  };

  // ── Fetch Up-to-Date Profile from Database ──
  React.useEffect(() => {
    const loadDashboardProfile = async () => {
      try {
        setLoading(true);
        const res = await fetchOwnerProfile();
        const data = res.data || res;
        setProfile(data);

        // Optional: Sync any profile updates back to Auth session context
        if (data.firstName || data.lastName) {
          updateUser({ firstName: data.firstName, lastName: data.lastName });
        }
      } catch (err) {
        console.error("Failed to load live dashboard profile data:", err);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardProfile();
  }, []);

  // ── Welcome Session Notification ──
  React.useEffect(() => {
    if (user) {
      const hasSeenWelcome = sessionStorage.getItem("hasSeenWelcome");
      
      if (!hasSeenWelcome) {
        showSuccess("Dashboard loaded successfully!");
        sessionStorage.setItem("hasSeenWelcome", "true");
      }
    }
  }, [user, showSuccess]);

  // ── Resolution Logic for Name Greeting ──
  // 1st Priority: Live database firstName field
  // 2nd Priority: Fallback split on Google Session user name field
  // 3rd Priority: Standard System Default String
  const dashboardGreetingName = profile?.firstName || user?.name?.split(' ')[0] || user?.firstName || 'Host';

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100%', p: 3 }}>

      <SuccessAlert open={open} message={message} onClose={closeSuccess} />

      <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          {loading ? (
            <Box sx={{ py: 0.5 }}>
              <Skeleton variant="text" width={260} height={38} />
              <Skeleton variant="text" width={320} height={18} sx={{ mt: 0.5 }} />
            </Box>
          ) : (
            <>
              <Typography variant="h4" sx={{ fontWeight: 800, color: '#1E1154', mb: 0.5, textTransform: 'capitalize' }}>
                Welcome back, {dashboardGreetingName}
              </Typography>
              <Typography variant="body1" sx={{ color: '#6B7280' }}>
                Here is what's happening with your properties today.
              </Typography>
            </>
          )}
        </Box>
        {isKycVerified && (
          <Chip label="KYC Verified" color="success" variant="outlined" icon={<VerifiedUserIcon />} sx={{ fontWeight: 600 }} />
        )}
      </Stack>

      {/* Stats Cards Section */}
      {/* <Grid container spacing={3}>
        {[
          { title: "Total Properties", value: stats.totalProperties },
          { title: "Active Auctions", value: stats.activeAuctions },
          { title: "Bids Received (24h)", value: stats.bidsReceived },
          { title: "Expected Payout", value: `₹${stats.expectedPayout.toLocaleString('en-IN')}`, border: "#DDD6FE" }
        ].map((stat, i) => (
          <Grid xs={12} sm={6} md={3} key={i}>
            <Card elevation={0} sx={{ borderRadius: 4, border: `1px solid ${stat.border || '#EAECF0'}`, bgcolor: '#FFFFFF' }}>
              <CardContent>
                <Typography variant="subtitle2" sx={{ color: '#6B7280', mb: 1 }}>{stat.title}</Typography>
                <Typography variant="h3" sx={{ fontWeight: 800, color: '#111827' }}>{stat.value}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid> */}
      
    </Box>
  );
}