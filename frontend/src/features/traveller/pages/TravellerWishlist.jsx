import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box, Typography, Button, Grid, Paper, Stack, IconButton, Skeleton, Divider, Fade, Pagination
} from '@mui/material';

// Icons
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import FavoriteIcon from '@mui/icons-material/Favorite';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import KingBedOutlinedIcon from '@mui/icons-material/KingBedOutlined';
import GroupsOutlinedIcon from '@mui/icons-material/GroupsOutlined';
import AccessTimeOutlinedIcon from '@mui/icons-material/AccessTimeOutlined';
import GavelOutlinedIcon from '@mui/icons-material/GavelOutlined';
import HomeWorkOutlinedIcon from '@mui/icons-material/HomeWorkOutlined';

// Contexts & Hooks
import { useError } from '../../../context/ErrorContext';
import useSuccessAlert from '../../../shared/hooks/useSuccessAlert';
import SuccessAlert from '../../../components/SuccessAlert';

// API Endpoints
import { fetchWishlist, toggleWishlist } from '../travellerAPI';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

const getImageUrl = (imgSrc, id) => {
    if (!imgSrc) return '/default_property.jpg';
    if (imgSrc.startsWith('http') || imgSrc.startsWith('data:')) return imgSrc;
    return `${API_BASE_URL}${imgSrc}`;
};

const fmtCurrency = (val) => `₹${Number(val || 0).toLocaleString('en-IN')}`;

function formatTimeLeft(bidCloseDate, now) {
    const diffMs = new Date(bidCloseDate).getTime() - now;
    if (diffMs <= 0) return 'Closed';

    const totalMinutes = Math.floor(diffMs / 60000);
    const days = Math.floor(totalMinutes / (60 * 24));
    const hours = Math.floor((totalMinutes % (60 * 24)) / 60);
    const minutes = totalMinutes % 60;

    if (days > 0) return `${days}d ${hours}h left`;
    if (hours > 0) return `${hours}h ${minutes}m left`;
    return `${minutes}m left`;
}

function WishlistCard({ property, now, onView, onRemove }) {
    const [removed, setRemoved] = useState(false);
    const timeLeft = formatTimeLeft(property.bidCloseDate, now);

    const handleHeartClick = (e) => {
        e.stopPropagation();
        setRemoved(true);
        setTimeout(() => onRemove(property.id, property.propertyName), 300);
    };

    const primaryImg = property.PrimaryImage || property.primaryImage || (property.images && property.images[0]);

    return (
        <Fade in={!removed} timeout={300}>
            <Paper
                elevation={0}
                variant="outlined"
                onClick={() => onView(property.id)}
                sx={{
                    width: '100%',
                    cursor: 'pointer',
                    transition: 'all 0.25s ease',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    '&:hover': {
                        borderColor: 'primary.main',
                        boxShadow: '0 8px 24px rgba(94,53,177,0.12)',
                        transform: 'translateY(-2px)'
                    }
                }}
            >
                <Box sx={{ position: 'relative', width: '100%', pt: '68%', bgcolor: '#F3F4F6' }}>
                    <Box
                        component="img"
                        src={primaryImg ? getImageUrl(primaryImg) : '/default_property.jpg'}
                        alt={property.propertyName}
                        sx={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                    <IconButton
                        size="small"
                        onClick={handleHeartClick}
                        sx={{ position: 'absolute', top: 8, right: 8, bgcolor: 'rgba(255,255,255,0.9)', width: 30, height: 30, '&:hover': { bgcolor: 'white' } }}
                    >
                        <FavoriteIcon sx={{ fontSize: 16, color: '#DC2626' }} />
                    </IconButton>
                </Box>

                <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', flex: 1 }}>
                    <Typography sx={{ fontSize: 15, fontWeight: 800, color: 'text.primary', lineHeight: 1.3, mb: 0.5 }}>
                        {property.propertyName}
                    </Typography>

                    <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center', mb: 1.5 }}>
                        <LocationOnOutlinedIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                        <Typography sx={{ fontSize: 12.5, color: 'text.secondary', fontWeight: 500 }}>
                            {property.city}, {property.state}
                        </Typography>
                    </Stack>

                    <Stack direction="row" spacing={1.5} sx={{ mb: 1.5, alignItems: 'center' }}>
                        <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
                            <KingBedOutlinedIcon sx={{ fontSize: 15, color: 'primary.main' }} />
                            <Typography sx={{ fontSize: 12, color: 'text.secondary', fontWeight: 600 }}>{property.bedrooms} Beds</Typography>
                        </Stack>
                        <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
                            <GroupsOutlinedIcon sx={{ fontSize: 15, color: 'primary.main' }} />
                            <Typography sx={{ fontSize: 12, color: 'text.secondary', fontWeight: 600 }}>{property.maxGuests} Guests</Typography>
                        </Stack>
                    </Stack>

                    <Divider sx={{ mb: 1.4 }} />

                    <Stack sx={{ mt: 'auto' }}>
                        <Stack direction="row" sx={{ alignItems: 'flex-end', justifyContent: 'space-between', mb: 1.2 }}>
                            <Box>
                                <Typography sx={{ fontSize: 10, color: 'text.secondary', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.4 }}>Starting bid</Typography>
                                <Typography sx={{ fontSize: 16, fontWeight: 800, color: 'text.primary' }}>{fmtCurrency(property.baseCost)}</Typography>
                            </Box>
                            <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
                                <AccessTimeOutlinedIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                                <Typography sx={{ fontSize: 12, fontWeight: 700, color: 'text.secondary' }}>{timeLeft}</Typography>
                            </Stack>
                        </Stack>
                        <Button
                            fullWidth
                            variant="contained"
                            color="primary"
                            startIcon={<GavelOutlinedIcon sx={{ fontSize: 17 }} />}
                            onClick={(e) => { e.stopPropagation(); onView(property.id); }}
                        >
                            View & Bid
                        </Button>
                    </Stack>
                </Box>
            </Paper>
        </Fade>
    );
}

function SkeletonCard() {
    return (
        <Paper variant="outlined" sx={{ width: '100%', borderRadius: 3, overflow: 'hidden' }}>
            <Skeleton variant="rectangular" sx={{ width: '100%', pt: '68%' }} />
            <Box sx={{ p: 2 }}>
                <Skeleton width="70%" height={22} sx={{ mb: 0.5 }} />
                <Skeleton width="45%" height={16} sx={{ mb: 1.5 }} />
                <Skeleton width="100%" height={38} sx={{ borderRadius: 2 }} />
            </Box>
        </Paper>
    );
}

export default function TravellerWishlist() {
    const navigate = useNavigate();
    const { showError } = useError();
    const { open, message, showSuccess, closeSuccess } = useSuccessAlert();

    const [properties, setProperties] = useState([]);
    const [loading, setLoading] = useState(true);
    const [now, setNow] = useState(Date.now());

    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const LIMIT = 10;

    useEffect(() => {
        const t = setInterval(() => setNow(Date.now()), 30000);
        return () => clearInterval(t);
    }, []);

    const loadWishlist = async () => {
        try {
            setLoading(true);
            const res = await fetchWishlist(page, LIMIT);
            if (res && res.success) {
                setProperties(res.data || []);
                setTotalItems(res.total || 0);
                setTotalPages(Math.ceil((res.total || 0) / LIMIT));
            }
        } catch (err) {
            showError('Failed to load wishlist.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadWishlist();
    }, [page]);

    const handleRemove = async (propertyId, propName) => {
        try {
            await toggleWishlist(propertyId);
            showSuccess(`Removed "${propName}" from your wishlist.`);
            setProperties(prev => prev.filter(p => p.id !== propertyId));
            setTotalItems(prev => Math.max(0, prev - 1));
        } catch (err) {
            showError("Failed to remove property from wishlist.");
        }
    };

    const handlePageChange = (e, val) => {
        setPage(val);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', pt: 3, pb: 6 }}>
            <SuccessAlert open={open} message={message} onClose={closeSuccess} />

            <Box sx={{ px: { xs: 2, md: 4 }, maxWidth: 1400, mx: 'auto' }}>

                {/* Header Row with back button aligned perfectly */}
                <Stack direction="row" spacing={1.5} sx={{ alignItems: "center", mb: 3 }}>
                    <IconButton
                        onClick={() => navigate(-1)}
                        sx={{ bgcolor: 'white', border: '1px solid #E5E7EB', '&:hover': { bgcolor: '#F3F4F6' } }}
                    >
                        <ArrowBackIcon sx={{ fontSize: 20, color: 'text.secondary' }} />
                    </IconButton>

                    <Typography variant="h4" sx={{ fontWeight: 800, color: 'text.primary' }}>
                        My Wishlist
                    </Typography>
                </Stack>

                {/* Stay Counter (placed on the left side, directly above the box/grid) */}
                {!loading && (
                    <Typography sx={{ fontSize: 14, fontWeight: 700, color: 'text.primary', mb: 2 }}>
                        {totalItems} stay{totalItems !== 1 ? 's' : ''} saved
                    </Typography>
                )}

                {loading ? (
                    <Grid container spacing={2.5}>
                        {Array.from({ length: 4 }).map((_, i) => (
                            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={i} sx={{ display: 'flex' }}>
                                <SkeletonCard />
                            </Grid>
                        ))}
                    </Grid>
                ) : properties.length === 0 ? (
                    <Paper
                        variant="outlined"
                        sx={{ textAlign: 'center', py: 10, bgcolor: 'transparent', borderStyle: 'dashed' }}
                    >
                        <HomeWorkOutlinedIcon sx={{ fontSize: 52, color: 'text.secondary', opacity: 0.4, mb: 2 }} />
                        <Typography sx={{ fontSize: 16, fontWeight: 700, color: 'text.primary', mb: 0.5 }}>
                            Your wishlist is empty
                        </Typography>
                        <Typography sx={{ fontSize: 13.5, color: 'text.secondary', mb: 3 }}>
                            Explore vacations and click the heart icon to save listings.
                        </Typography>
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={() => navigate('/traveller/properties')}
                        >
                            Explore Stays
                        </Button>
                    </Paper>
                ) : (
                    <Grid container spacing={2.5}>
                        {properties.map((property) => (
                            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={property.id} sx={{ display: 'flex' }}>
                                <WishlistCard
                                    property={property}
                                    now={now}
                                    onView={(id) => navigate(`/traveller/properties/${id}`)}
                                    onRemove={handleRemove}
                                />
                            </Grid>
                        ))}
                    </Grid>
                )}

                {!loading && totalPages > 1 && (
                    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}>
                        <Pagination
                            count={totalPages}
                            page={page}
                            onChange={handlePageChange}
                            shape="rounded"
                            color="primary"
                        />
                    </Box>
                )}
            </Box>
        </Box>
    );
}