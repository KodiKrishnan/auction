import React, { useState, useEffect, useRef } from 'react';
import { Box, Typography, Button, Stack, Paper, Link, Alert } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';

export default function OtpVerification({ role }) {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || 'your email';

  // State
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(300); // 5 minutes
  const [attempts, setAttempts] = useState(0); 
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [expired, setExpired] = useState(false);

  const inputRefs = useRef([]);

  // Timer Logic
  useEffect(() => {
    if (timer <= 0) {
      setExpired(true);
      return;
    }
    const interval = setInterval(() => setTimer((t) => t - 1), 1000);
    return () => clearInterval(interval);
  }, [timer]);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  // Input Handling
  const handleChange = (index, value) => {
    if (!/^\d?$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < 5) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handlePaste = (e) => {
    const pasted = e.clipboardData.getData('text').slice(0, 6).split('');
    if (pasted.every((c) => /\d/.test(c))) {
      setOtp([...pasted, ...Array(6 - pasted.length).fill('')]);
      inputRefs.current[Math.min(pasted.length, 5)].focus();
    }
  };

  // Reusable Verify Logic
  const handleVerify = async () => {
    const otpValue = otp.join('');
    if (otpValue.length < 6) return setError('Please enter the complete 6-digit OTP.');
    if (attempts >= 3) return;

    setLoading(true);
    setError('');

    try {
     // await verifyOtp(email, otpValue);// Insert your actual verifyOtp(email, otpValue) call here
      
      // REUSABLE REDIRECT:
      // Owners go to owner profile, Travellers go to traveller profile
      const nextPath = role === 'OWNER' 
        ? '/owner/profile-completion' 
        : '/traveller/profile-completion';
        
      navigate(nextPath, { state: { email } });
    } catch (err) {
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);
      setError(newAttempts >= 3 
        ? 'Maximum attempts reached. Please request a new OTP.' 
        : `Invalid OTP. ${3 - newAttempts} attempt(s) remaining.`
      );
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0].focus();
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    try {
      // await resendOtp(email);
      setTimer(300);
      setExpired(false);
      setAttempts(0);
      setError('');
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0].focus();
    } catch (err) {
      setError('Failed to resend OTP. Please try again.');
    }
  };

  const isBlocked = attempts >= 3;

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'background.default', px: 2 }}>
      <Paper elevation={0} sx={{ width: '100%', maxWidth: 440, borderRadius: 4, border: '1px solid #E5E7EB', boxShadow: '0px 10px 25px rgba(0,0,0,0.04)', p: { xs: 4, md: 6 } }}>
        
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Typography variant="h5" sx={{ fontWeight: 800, color: '#1E1154', mb: 1 }}>
            Enter Verification Code
          </Typography>
          <Typography variant="body2" sx={{ color: '#6B7280' }}>
            We sent a 6-digit OTP to <Box component="span" sx={{ fontWeight: 700, color: '#111827' }}>{email}</Box>
          </Typography>
        </Box>

        <Stack direction="row" sx={{ justifyContent: 'center', gap: 1.5, mb: 3 }}>
          {otp.map((digit, index) => (
            <Box
              key={index}
              component="input"
              ref={(el) => (inputRefs.current[index] = el)}
              value={digit}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              onPaste={handlePaste}
              maxLength={1}
              disabled={isBlocked || expired}
              sx={{
                width: 48, height: 56, textAlign: 'center', fontSize: '1.4rem', fontWeight: 700,
                border: '1.5px solid', borderRadius: 2, outline: 'none', transition: '0.2s',
                borderColor: error ? '#EF4444' : digit ? '#5E35B1' : '#D1D5DB',
                bgcolor: isBlocked || expired ? '#F9FAFB' : 'white',
                '&:focus': { borderColor: '#5E35B1', boxShadow: '0 0 0 3px rgba(94,53,177,0.1)' }
              }}
            />
          ))}
        </Stack>

        <Box sx={{ textAlign: 'center', mb: 3 }}>
          {!expired ? (
            <Typography variant="body2" sx={{ color: timer <= 60 ? '#EF4444' : '#6B7280' }}>
              OTP expires in <Box component="span" sx={{ fontWeight: 700 }}>{formatTime(timer)}</Box>
            </Typography>
          ) : (
            <Typography variant="body2" sx={{ color: '#EF4444', fontWeight: 600 }}>OTP has expired.</Typography>
          )}
        </Box>

        {error && <Alert severity="error" sx={{ mb: 3, borderRadius: 2, fontSize: '0.8rem' }}>{error}</Alert>}

        <Button
          fullWidth variant="contained" size="large"
          onClick={handleVerify}
          disabled={loading || isBlocked || expired}
          sx={{ py: 1.8, mb: 3, borderRadius: 2.5, fontWeight: 700, bgcolor: '#5E35B1', textTransform: 'none', '&:hover': { bgcolor: '#4527A0' } }}
        >
          {loading ? 'Verifying...' : 'Verify OTP'}
        </Button>

        <Typography variant="body2" color="text.secondary" align="center">
          Didn't receive the code?{' '}
          {expired || isBlocked ? (
            <Link onClick={handleResend} sx={{ fontWeight: 700, color: '#5E35B1', cursor: 'pointer' }} underline="hover">Resend OTP</Link>
          ) : (
            <Box component="span" sx={{ color: '#9CA3AF', fontWeight: 600 }}>Resend in {formatTime(timer)}</Box>
          )}
        </Typography>
      </Paper>
    </Box>
  );
}