import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Stack,
  Paper,
  InputAdornment
} from '@mui/material';

import { useNavigate } from 'react-router-dom';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

import { fetchCompleteProfile } from '../authAPI';
import { validate } from '../../../utils/validators/validate';
import { profileCompletionSchema } from '../../../utils/validators/schemas';

import logo from '../../../assets/logos/nivasabid-logo.png';

import { useError } from '../../../context/ErrorContext';
import { useAuth } from '../../../context/AuthContext';

import useSuccessAlert from '../../../shared/hooks/useSuccessAlert';
import SuccessAlert from '../../../components/SuccessAlert';

import { useLoader } from '../../../context/LoaderContext';

const CONFIG = {
  OWNER: {
    title: "Host Registration",
    sub: "Complete your profile to start listing your properties.",
    dashboard: "/owner/dashboard"
  },
  TRAVELLER: {
    title: "Traveller Registration",
    sub: "Complete your profile to start bidding on stays.",
    dashboard: "/traveller/properties"
  }
};

export default function ProfileCompletion({ role }) {

  const navigate = useNavigate();
  const content = CONFIG[role];

  // USER FROM AUTH CONTEXT
  const { user } = useAuth();

  // ERROR + SUCCESS
  const { showError } = useError();
  const { open, message, showSuccess, closeSuccess } = useSuccessAlert();
  const { showLoader, hideLoader } = useLoader();

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phoneNumber: '',
    dob: '',
    email: ''
  });

  const [errors, setErrors] = useState({});

  // AUTO FILL USER DATA
  useEffect(() => {

    if (!user) return;

    const fullName = user.name || "";
    const nameParts = fullName.split(" ");

    setFormData({
      firstName: nameParts[0] || "",
      lastName: nameParts.slice(1).join(" ") || "",
      phoneNumber: '',
      dob: '',
      email: user.email || ''
    });

  }, [user]);

  const handleChange = (field, value) => {

    if (field === "phoneNumber") {
      const digitsOnly = value.replace(/\D/g, "");

      if (digitsOnly.length > 10) return;

      value = digitsOnly;
    }

    setFormData({
      ...formData,
      [field]: value
    });

    setErrors((prev) => ({
      ...prev,
      [field]: ''
    }));
  };

  const handleFinish = async (e) => {

    e.preventDefault();

    const result = validate(formData, profileCompletionSchema());

    if (!result.valid) {
      setErrors(result.errors);
      return;
    }

    setErrors({});

    if (!user) {
      showError("User session lost. Please login again.");
      return;
    }

    try {

      showLoader();

      const res = await fetchCompleteProfile(
        user.id,
        formData,
        role
      );

      console.log("Registration Successful:", res);

      showSuccess("Profile completed successfully!");

      setTimeout(() => {
        navigate(content.dashboard);
      }, 2000);

    } catch (error) {

      showError(
        error?.response?.data?.message ||
        "Backend Error. Please try again."
      );

    } finally {

      hideLoader();

    }
  };
  return (

    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: '#FFFFFF',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        px: 2
      }}
    >

      <Paper
        component="form"
        onSubmit={handleFinish}
        elevation={0}
        sx={{
          width: '100%',
          maxWidth: 500,
          p: { xs: 4, md: 6 },
          borderRadius: 4,
          border: '1px solid #E5E7EB',
          boxShadow: '0px 10px 25px rgba(0,0,0,0.05)'
        }}
      >

        {/* LOGO */}
        <Stack
          direction="row"
          sx={{
            alignItems: 'center',
            gap: 1,
            justifyContent: 'flex-start',
            mb: 3
          }}
        >
          <Box
            component="img"
            src={logo}
            sx={{
              height: 32,
              display: 'block'
            }}
          />

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

        <Typography
          variant="h4"
          sx={{
            fontWeight: 800,
            mb: 1,
            textAlign: 'center'
          }}
        >
          {content.title}
        </Typography>

        <Typography
          variant="body1"
          sx={{
            mb: 4,
            textAlign: 'center',
            color: 'text.secondary'
          }}
        >
          {content.sub}
        </Typography>

        <Stack spacing={2.5}>

          <Stack direction="row" spacing={2}>

            <TextField
              label="First Name"
              fullWidth
              value={formData.firstName}
              onChange={(e) =>
                handleChange('firstName', e.target.value)
              }
              error={!!errors.firstName}
              helperText={errors.firstName}
            />

            <TextField
              label="Last Name"
              fullWidth
              value={formData.lastName}
              onChange={(e) =>
                handleChange('lastName', e.target.value)
              }
              error={!!errors.lastName}
              helperText={errors.lastName}
            />

          </Stack>

          <TextField
            label="Mobile Number"
            fullWidth
            value={formData.phoneNumber}
            onChange={(e) =>
              handleChange('phoneNumber', e.target.value)
            }
            error={!!errors.phoneNumber}
            helperText={errors.phoneNumber}
          />

          <TextField
            label="Date of Birth"
            type="date"
            fullWidth
            slotProps={{
              inputLabel: { shrink: true }
            }}
            value={formData.dob}
            onChange={(e) =>
              handleChange('dob', e.target.value)
            }
            error={!!errors.dob}
            helperText={errors.dob}
          />

          <TextField
            label="Email (Verified)"
            fullWidth
            value={formData.email}
            disabled
            slotProps={{
              input: {
                endAdornment: (
                  <InputAdornment position="end">
                    <CheckCircleIcon
                      sx={{ color: '#10B981' }}
                    />
                  </InputAdornment>
                )
              }
            }}
            sx={{
              bgcolor: '#F9FAFB',

              "& .MuiInputBase-input.Mui-disabled": {
                WebkitTextFillColor: "#1E1154",
              },
            }}
          />

          <Button
            type="submit"
            variant="contained"
            fullWidth
            size="large"
            sx={{
              py: 1.8,
              fontWeight: 700,
              borderRadius: 2,
              bgcolor: '#5E35B1',
              '&:hover': {
                bgcolor: '#4527A0'
              }
            }}
          >
            Complete {role === 'OWNER'
              ? 'Registration'
              : 'Profile'}
          </Button>

        </Stack>

      </Paper>

      {/* SUCCESS ALERT */}
      <SuccessAlert
        open={open}
        message={message}
        onClose={closeSuccess}
      />

    </Box>
  );
}