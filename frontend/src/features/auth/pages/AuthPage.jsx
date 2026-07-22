import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, TextField, Button, Checkbox, FormControlLabel,
  Divider, Link, Stack, Grid, Chip, Avatar, AvatarGroup
} from '@mui/material';
import { HomeOutlined, GavelOutlined, SecurityOutlined } from '@mui/icons-material';
import { GoogleLogin } from '@react-oauth/google';
import { fetchGoogleAuth } from "../authAPI";
import { useAuth } from "../../../context/AuthContext";
import { useError } from "../../../context/ErrorContext";
import useSuccessAlert from "../../../shared/hooks/useSuccessAlert";
import SuccessAlert from "../../../components/SuccessAlert";
import { validate } from '../../../utils/validators/validate';
import { registrationSchema } from '../../../utils/validators/schemas';

import { useLoader } from "../../../context/LoaderContext";


const AUTH_CONFIG = {
  OWNER: {
    chip: "India's #1 Property Bidding Platform",
    title: "Where Your Property Attracts Premium Bids.",
    sub: "List your exclusive villas, rooms, and properties. Transparent. Fast. Effortless.",
    stats: [
      { value: "12,000+", label: "Properties" },
      { value: "₹4.2Cr+", label: "Bids placed" },
      { value: "98%", label: "Satisfaction" }
    ],
    trustText: "8,000+ property owners",
    formTitle: "Become a Host",
    formSub: "Sign up in a few simple steps and start earning today.",
    buttonText: "SIGN UP",
    otpRedirect: '/owner/otp-verification'
  },
  TRAVELLER: {
    chip: "Find your Dream Stay",
    title: "Bid for Exclusive Vacation Stays.",
    sub: "Bid on exclusive villas, rooms, and properties for your dream vacation. Transparent. Fast. Effortless.",
    stats: [
      { value: "8,000+", label: "Active Users" },
      { value: "500+", label: "Daily Deals" },
      { value: "99%", label: "Satisfaction" }
    ],
    trustText: "10,000+ happy travellers",
    formTitle: "Join as Traveller",
    formSub: "Sign up in a few simple steps and start bidding today.",
    buttonText: "SIGN UP",
    otpRedirect: '/traveller/otp-verification'
  }
};

export default function AuthPage({ role }) {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { showLoader, hideLoader } = useLoader();
  const { showError } = useError();
  const { open, message, showSuccess, closeSuccess } = useSuccessAlert();
  const content = AUTH_CONFIG[role];

  const [email, setEmail] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [errors, setErrors] = useState({});

  const handleSignUp = () => {
    const result = validate({ email }, registrationSchema());
    if (!result.valid) {
      setErrors(result.errors);
      return;
    }
    if (!agreed) {
      setErrors({ agreed: 'You must agree to the Terms and Privacy Policy' });
      return;
    }
    setErrors({});
    showSuccess("Validation successful! Redirecting to OTP...");
    setTimeout(() => {
      navigate(content.otpRedirect, { state: { email } });
    }, 1500);
  };

  const handleGoogleSuccess = async (credentialResponse) => {

    try {

      showLoader();

      const idToken = credentialResponse.credential;

      const response = await fetchGoogleAuth(idToken, role);

      if (response.token) {

        sessionStorage.setItem("token", response.token);
        sessionStorage.setItem("role", role);

        login(response.user);


        showSuccess("Login Successful!");

        const nextPath =
          response.status === "NEW_USER" ||
            response.user?.profileCompleted === false
            ? (
              role === "OWNER"
                ? "/owner/profile-completion"
                : "/traveller/profile-completion"
            )
            : (
              role === "OWNER"
                ? "/owner/dashboard"
                : "/traveller/properties"
            );

        setTimeout(() => navigate(nextPath), 1000);
      }

    } catch (error) {

      const msg =
        typeof error === 'string'
          ? error
          : error?.response?.data?.message ||
          "Google Authentication Failed.";

      showError(msg);

    } finally {

      hideLoader();

    }
  };
  return (
    <Grid container sx={{ flexGrow: 1, minHeight: 'calc(100vh - 64px)' }}>

      {/* ================= LEFT SIDE ================= */}
      <Grid xs={12} md={7} sx={{ bgcolor: 'background.default', p: { xs: 4, md: 8 }, display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ maxWidth: 600, ml: 'auto', mr: 'auto' }}>
          <Chip label={content.chip} sx={{ backgroundColor: '#EBE5FF', color: 'primary.main', fontWeight: 600, mb: 4 }} />
          <Typography variant="h3" sx={{ mb: 2, lineHeight: 1.2, fontSize: { xs: '28px', md: '30px' }, fontWeight: 800 }}>
            Welcome to <Box component="span" sx={{ color: '#5E35B1' }}>NivasaBid</Box> — {content.title}
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 6, fontSize: '1rem' }}>
            {content.sub}
          </Typography>
          <Grid container spacing={4} sx={{ mb: 6 }}>
            {content.stats.map((stat, i) => (
              <Grid xs={4} key={i}>
                <Typography variant="h4" sx={{ fontWeight: 700 }}>{stat.value}</Typography>
                <Typography variant="body2" color="text.secondary">{stat.label}</Typography>
              </Grid>
            ))}
          </Grid>
          <Stack direction="row" sx={{ flexWrap: 'wrap', gap: 2, mb: 8 }}>
            <Chip icon={<HomeOutlined />} label="Villas & Rooms" variant="outlined" sx={{ borderRadius: 2, py: 2.5, px: 1, borderColor: '#D1D5DB', bgcolor: 'white' }} />
            <Chip icon={<GavelOutlined />} label="Live Bidding" variant="outlined" sx={{ borderRadius: 2, py: 2.5, px: 1, borderColor: '#D1D5DB', bgcolor: 'white' }} />
            <Chip icon={<SecurityOutlined />} label="Secure Payments" variant="outlined" sx={{ borderRadius: 2, py: 2.5, px: 1, borderColor: '#D1D5DB', bgcolor: 'white' }} />
          </Stack>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <AvatarGroup max={4} sx={{ '& .MuiAvatar-root': { width: 32, height: 32, fontSize: 14, bgcolor: '#5E35B1' } }}>
              <Avatar>A</Avatar><Avatar>R</Avatar><Avatar>K</Avatar><Avatar>S</Avatar>
            </AvatarGroup>
            <Typography variant="body2" color="text.secondary">
              Trusted by <Box component="span" sx={{ fontWeight: 'bold', color: 'text.primary' }}>{content.trustText}</Box>
            </Typography>
          </Box>
        </Box>
      </Grid>

      {/* ================= RIGHT SIDE ================= */}
      <Grid xs={12} md={5} sx={{ backgroundColor: '#FFFFFF', p: { xs: 4, md: 8 }, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <Box sx={{ maxWidth: 450, width: '100%', mx: 'auto' }}>
          {/* <Typography variant="h3" sx={{ mb: 1, fontSize: '30px', fontWeight: 800 }}>{content.formTitle}</Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4, fontSize: '16px' }}>{content.formSub}</Typography>

          <Stack spacing={3} sx={{ mb: 3 }}>
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 700 }}>Email address *</Typography>
              <TextField
                placeholder="you@example.com"
                fullWidth
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setErrors((prev) => ({ ...prev, email: '' }));
                }}
                error={!!errors.email}
                helperText={errors.email || "We'll never share your email with anyone else."}
                sx={{ "& .MuiInputBase-input": { color: "#000000", fontWeight: 600 } }}
              />
            </Box>
          </Stack>

          <FormControlLabel
            control={
              <Checkbox
                checked={agreed}
                onChange={(e) => {
                  setAgreed(e.target.checked);
                  setErrors((prev) => ({ ...prev, agreed: '' }));
                }}
                sx={{ color: '#5E35B1', '&.Mui-checked': { color: '#5E35B1' } }}
              />
            }
            label={
              <Typography variant="body2" color="text.secondary">
                I agree to the <Link href="#" sx={{ color: '#5E35B1', fontWeight: 600 }}>Terms</Link> and <Link href="#" sx={{ color: '#5E35B1', fontWeight: 600 }}>Privacy Policy</Link>
              </Typography>
            }
            sx={{ mb: 0.5 }}
          />

          {errors.agreed && (
            <Typography variant="caption" sx={{ color: 'error.main', mb: 2, display: 'block', ml: 1.5 }}>
              {errors.agreed}
            </Typography>
          )}

          <Button
            fullWidth variant="contained" size="large"
            onClick={handleSignUp}
            sx={{ py: 1.2, mt: 3, mb: 4, borderRadius: 2.5, fontWeight: 700, bgcolor: '#5E35B1', textTransform: 'none' }}
          >
            {content.buttonText}
          </Button>

          <Divider sx={{ mb: 4 }}>
            <Typography variant="body2" color="text.secondary">or continue with</Typography>
          </Divider> */}

          <Box sx={{ display: "flex", justifyContent: "center", mb: 3.5, width: "100%" }}>
            <GoogleLogin
              width="400"
              theme="outline"
              shape="pill"
              size="large"
              onSuccess={handleGoogleSuccess}
              onError={() => showError("Google Login Failed to initialize.")}
            />
          </Box>


        </Box>
      </Grid>

      <SuccessAlert open={open} message={message} onClose={closeSuccess} />
    </Grid>
  );
}