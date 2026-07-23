import React from 'react';
import {
    Dialog, DialogContent, Box, Typography, IconButton, Stack
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { GoogleLogin } from '@react-oauth/google';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useError } from '../../context/ErrorContext';
import { useLoader } from '../../context/LoaderContext';
import { fetchGoogleAuth } from '../../features/auth/authAPI';
import logoIcon from '../../assets/logos/nivasabid-logo.png';

export default function AuthModal() {
    const navigate = useNavigate();
    const { authModal, closeLoginModal, login } = useAuth();
    const { showLoader, hideLoader } = useLoader();
    const { showError } = useError();

    // Read dynamic role (default to "TRAVELLER")
    const role = authModal?.role || "TRAVELLER";

    const handleGoogleSuccess = async (credentialResponse) => {
        try {
            showLoader();
            const idToken = credentialResponse.credential;

            // Pass the dynamic role to the backend API
            const response = await fetchGoogleAuth(idToken, role);

            if (response.token) {
                sessionStorage.setItem("token", response.token);

                // Save the dynamic role to session storage
                sessionStorage.setItem("role", role);

                login(response.user);
                closeLoginModal();

                // Redirect incomplete profiles to profile completion
                const isNewOrIncomplete =
                    response.status === "NEW_USER" ||
                    response.user?.profileCompleted === false;

                if (isNewOrIncomplete) {
                    // Redirect dynamically based on role type
                    const targetPath = role === "OWNER"
                        ? "/owner/profile-completion"
                        : "/traveller/profile-completion";
                    navigate(targetPath);
                } else {
                    // If complete, run the stashed action (e.g. wishlist toggle)
                    if (authModal?.onSuccess) {
                        authModal.onSuccess();
                    }
                }
            }
        } catch (error) {
            const msg = typeof error === 'string' ? error : "Google Authentication Failed.";
            showError(msg);
        } finally {
            hideLoader();
        }
    };

    return (
        <Dialog
            open={Boolean(authModal?.open)}
            onClose={closeLoginModal}
            fullWidth
            slotProps={{
                paper: {
                    sx: {
                        borderRadius: '20px',
                        p: 4,
                        boxShadow: '0 12px 40px rgba(0, 0, 0, 0.12)',
                        width: '460px',
                        maxWidth: '95%',
                        height: 'auto',
                        position: 'relative' // 🟢 Ensures the close icon positions relative to the Dialog card
                    }
                }
            }}
        >
            {/* Close Button */}
            <IconButton
                onClick={closeLoginModal}
                size="small"
                sx={{
                    position: 'absolute',
                    top: 16,
                    right: 16,
                    color: '#94A3B8',
                    '&:hover': { color: '#475569', bgcolor: '#F1F5F9' }
                }}
            >
                <CloseIcon sx={{ fontSize: 20 }} />
            </IconButton>

            <DialogContent sx={{ p: 0 }}>
                <Stack spacing={3} sx={{ alignItems: 'center', textAlign: 'center' }}>

                    {/* Header Row: Centered Brand Logo */}
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', pt: 1.5 }}>
                        <Stack direction="row" sx={{ alignItems: 'center', gap: 1 }}>
                            <Box component="img" src={logoIcon} sx={{ height: 32, display: 'block' }} />
                            <Typography variant="h6" sx={{ fontWeight: 900, color: '#5E35B1', lineHeight: 1, transform: 'translateY(4px)' }}>
                                NivasaBid
                            </Typography>
                        </Stack>
                    </Box>

                    {/* Body Section */}
                    <Box>
                        {/* Simplified Heading */}
                        <Typography sx={{ fontWeight: 900, fontSize: 22, color: '#1E1154', mb: 1 }}>
                            Sign In
                        </Typography>

                        {/* Description Text */}
                        <Typography sx={{ fontSize: 13.5, color: '#64748B', fontWeight: 500, lineHeight: 1.5, px: 1 }}>
                            {role === "OWNER"
                                ? "Sign in to your host account to manage your listings, view rules, and track active stay auctions."
                                : "Sign in to your traveller account to save stays to your wishlist, place bids, and manage your bookings."
                            }
                        </Typography>
                    </Box>

                    {/* Google Login Button (Lazy-loaded only when open) */}
                    <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center', mt: 1 }}>
                        {Boolean(authModal?.open) && (
                            <GoogleLogin
                                width="300"
                                theme="outline"
                                shape="pill"
                                size="large"
                                onSuccess={handleGoogleSuccess}
                                onError={() => showError("Google Login Failed to initialize.")}
                            />
                        )}
                    </Box>
                </Stack>
            </DialogContent>
        </Dialog>
    );
}