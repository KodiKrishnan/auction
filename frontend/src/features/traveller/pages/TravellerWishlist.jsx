import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box, Typography, Button, Grid, Paper, Stack, IconButton, Skeleton, Divider, Fade, Pagination, Chip
} from '@mui/material';

// Icons
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import FavoriteIcon from '@mui/icons-material/Favorite';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import KingBedOutlinedIcon from '@mui/icons-material/KingBedOutlined';
import GroupsOutlinedIcon from '@mui/icons-material/GroupsOutlined';
import GavelOutlinedIcon from '@mui/icons-material/GavelOutlined';
import HomeWorkOutlinedIcon from '@mui/icons-material/HomeWorkOutlined';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import EventOutlinedIcon from '@mui/icons-material/EventOutlined';

// Contexts & Hooks
import { useError } from '../../../context/ErrorContext';
import useSuccessAlert from '../../../shared/hooks/useSuccessAlert';
import SuccessAlert from '../../../components/SuccessAlert';

// API Endpoints
import { fetchWishlist, toggleWishlist } from '../travellerAPI';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

const getImageUrl = (imgSrc) => {
    if (!imgSrc) return '/default_property.jpg';
    if (imgSrc.startsWith('http') || imgSrc.startsWith('data:')) return imgSrc;
    return `${API_BASE_URL}${imgSrc}`;
};

const fmtCurrency = (val) => `₹${Number(val || 0).toLocaleString('en-IN')}`;

const fmtDate = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
};

// --- Badge is purely presentational, derived from auctionStatus only ---
function getStatusBadge(auctionStatus) {
    const status = (auctionStatus || '').toUpperCase();
    switch (status) {
        case 'UPCOMING':
            return { label: 'Upcoming', bg: '#FFFBEB', color: '#92400E', border: '#FDE68A' };
        case 'OPEN':
            return { label: 'Open', bg: '#F5F3FF', color: '#5E35B1', border: '#EDE7F6' };
        case 'CLOSED':
            return { label: 'Closed', bg: '#F9FAFB', color: '#6B7280', border: '#E5E7EB' };
        case 'CANCELLED':
            return { label: 'Cancelled', bg: '#FEF2F2', color: '#DC2626', border: '#FCA5A5' };
        default:
            return { label: status || 'Unknown', bg: '#F9FAFB', color: '#6B7280', border: '#E5E7EB' };
    }
}

// --- Button state is driven strictly by canView / canBid per spec table ---
function getActionButton(auctionStatus, canView, canBid) {
    if (canView && canBid) {
        return { label: 'View & Bid', disabled: false, icon: true };
    }
    if (canView && !canBid) {
        return { label: 'View Details', disabled: false, icon: false };
    }
    // Both canView and canBid are false -> check auctionStatus
    const status = (auctionStatus || '').toUpperCase();
    if (status === 'CANCELLED') {
        return { label: 'Cancelled', disabled: true, icon: false };
    }
    return { label: 'Bidding Closed', disabled: true, icon: false };
}

function WishlistCard({ property, onView, onRemove }) {
    const [removed, setRemoved] = useState(false);
    const [imgIndex, setImgIndex] = useState(0);
    const [hovered, setHovered] = useState(false);

    const badge = getStatusBadge(property.auctionStatus);
    const action = getActionButton(property.auctionStatus, property.canView, property.canBid);

    const handleHeartClick = (e) => {
        e.stopPropagation();
        setRemoved(true);
        setTimeout(() => onRemove(property.id, property.propertyName), 300);
    };

    const handleCardClick = () => {
        if (property.canView) {
            onView(property.id);
        }
    };

    const nextImg = (e) => {
        e.stopPropagation();
        if (property.images && property.images.length > 0) {
            setImgIndex((i) => (i + 1) % property.images.length);
        }
    };

    const prevImg = (e) => {
        e.stopPropagation();
        if (property.images && property.images.length > 0) {
            setImgIndex((i) => (i - 1 + property.images.length) % property.images.length);
        }
    };

    const shownAmenities = property.amenities ? property.amenities.slice(0, 3) : [];
    const extraAmenityCount = property.amenities ? property.amenities.length - shownAmenities.length : 0;
    const propertyTypeIcon = property.propertyTypeIcon || property.propertyTypeIconurl;

    return (
        <Fade in={!removed} timeout={300}>
            <Paper
                elevation={0}
                variant="outlined"
                onClick={handleCardClick}
                onMouseEnter={() => setHovered(true)}
                onMouseLeave={() => setHovered(false)}
                sx={{
                    width: '100%',
                    cursor: property.canView ? 'pointer' : 'default',
                    transition: 'all 0.25s ease',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    opacity: property.canView ? 1 : 0.75,
                    bgcolor: property.canView ? 'white' : '#FCFDFD',
                    '&:hover': !property.canView ? {} : {
                        borderColor: '#D1D5DB',
                        boxShadow: '0 8px 24px rgba(94,53,177,0.12)',
                        transform: 'translateY(-2px)'
                    }
                }}
            >
                <Box sx={{ position: 'relative', width: '100%', pt: '68%', bgcolor: '#F3F4F6' }}>
                    <Box
                        component="img"
                        src={property.images && property.images.length > 0 ? getImageUrl(property.images[imgIndex]) : '/default_property.jpg'}
                        alt={property.propertyName}
                        sx={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', transition: 'opacity 0.2s ease' }}
                    />

                    {/* Status Badge Overlay */}
                    <Chip
                        label={badge.label}
                        size="small"
                        sx={{
                            position: 'absolute',
                            top: 10,
                            left: 10,
                            bgcolor: badge.bg,
                            color: badge.color,
                            border: `1px solid ${badge.border}`,
                            fontWeight: 700,
                            fontSize: 11,
                            height: 24
                        }}
                    />

                    {/* Heart is always filled on this page — every item here is already wishlisted */}
                    <IconButton
                        size="small"
                        onClick={handleHeartClick}
                        sx={{ position: 'absolute', top: 8, right: 8, bgcolor: 'rgba(255,255,255,0.9)', width: 30, height: 30, '&:hover': { bgcolor: 'white' } }}
                    >
                        <FavoriteIcon sx={{ fontSize: 16, color: '#DC2626' }} />
                    </IconButton>

                    {/* Image Slider Navigation */}
                    {property.images && property.images.length > 1 && property.canView && (
                        <Fade in={hovered}>
                            <Box>
                                <IconButton size="small" onClick={prevImg} sx={{ position: 'absolute', top: '50%', left: 8, mt: '-15px', bgcolor: 'rgba(255,255,255,0.9)', width: 28, height: 28, display: { xs: 'none', md: 'flex' }, '&:hover': { bgcolor: 'white' } }}><ChevronLeftIcon sx={{ fontSize: 16 }} /></IconButton>
                                <IconButton size="small" onClick={nextImg} sx={{ position: 'absolute', top: '50%', right: 8, mt: '-15px', bgcolor: 'rgba(255,255,255,0.9)', width: 28, height: 28, display: { xs: 'none', md: 'flex' }, '&:hover': { bgcolor: 'white' } }}><ChevronRightIcon sx={{ fontSize: 16 }} /></IconButton>
                            </Box>
                        </Fade>
                    )}
                </Box>

                <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', flex: 1 }}>
                    <Typography sx={{ fontSize: 15, fontWeight: 800, color: '#1E1154', lineHeight: 1.3, mb: 0.5 }}>
                        {property.propertyName}
                    </Typography>

                    <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center', mb: 1.2 }}>
                        <LocationOnOutlinedIcon sx={{ fontSize: 14, color: '#9CA3AF' }} />
                        <Typography sx={{ fontSize: 12.5, color: '#6B7280', fontWeight: 500 }}>
                            {property.city}, {property.state}
                        </Typography>
                    </Stack>

                    {/* Property Type Icon & Specifications Row */}
                    <Stack direction="row" spacing={1.5} sx={{ mb: 1.2, alignItems: 'center' }}>
                        {propertyTypeIcon && (
                            <Box component="img" src={propertyTypeIcon} sx={{ width: 16, height: 16, objectFit: 'contain' }} />
                        )}
                        <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
                            <KingBedOutlinedIcon sx={{ fontSize: 15, color: '#5E35B1' }} />
                            <Typography sx={{ fontSize: 12, color: '#374151', fontWeight: 600 }}>{property.bedrooms} Beds</Typography>
                        </Stack>
                        <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
                            <GroupsOutlinedIcon sx={{ fontSize: 15, color: '#5E35B1' }} />
                            <Typography sx={{ fontSize: 12, color: '#374151', fontWeight: 600 }}>{property.maxGuests} Guests</Typography>
                        </Stack>
                    </Stack>

                    {/* Stay dates */}
                    <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center', mb: 1.5 }}>
                        <EventOutlinedIcon sx={{ fontSize: 14, color: '#9CA3AF' }} />
                        <Typography sx={{ fontSize: 12, color: '#374151', fontWeight: 600 }}>
                            Stay: {fmtDate(property.stayStartDate)} – {fmtDate(property.stayEndDate)}
                        </Typography>
                    </Stack>

                    {/* Amenities Badges */}
                    <Stack direction="row" spacing={0.8} sx={{ alignItems: 'center', mb: 1.6, flexWrap: 'wrap', rowGap: 0.6 }}>
                        {shownAmenities.map((amenity) => (
                            <Stack
                                key={amenity.id}
                                direction="row"
                                spacing={0.5}
                                sx={{
                                    alignItems: 'center',
                                    bgcolor: '#F9FAFB',
                                    border: '1px solid #F3F4F6',
                                    borderRadius: 1.5,
                                    px: 0.9,
                                    py: 0.3
                                }}
                            >
                                {amenity.iconurl && (
                                    <Box
                                        component="img"
                                        src={amenity.iconurl}
                                        alt={amenity.name}
                                        sx={{ width: 13, height: 13, objectFit: 'contain' }}
                                    />
                                )}
                                <Typography sx={{ fontSize: 11, color: '#6B7280', fontWeight: 600 }}>
                                    {amenity.name}
                                </Typography>
                            </Stack>
                        ))}
                        {extraAmenityCount > 0 && <Typography sx={{ fontSize: 11, color: '#9CA3AF', fontWeight: 600, px: 0.5 }}>+{extraAmenityCount} more</Typography>}
                    </Stack>

                    <Divider sx={{ borderColor: '#F3F4F6', mb: 1.4 }} />

                    <Stack sx={{ mt: 'auto' }}>
                        <Stack direction="row" sx={{ alignItems: 'flex-start', justifyContent: 'space-between', mb: 1.2 }}>
                            <Box>
                                <Typography sx={{ fontSize: 11, color: '#9CA3AF', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.4 }}>Starting bid</Typography>
                                <Typography sx={{ fontSize: 18, fontWeight: 800, color: '#111827', mt: 0.5 }}>{fmtCurrency(property.baseCost)}</Typography>
                            </Box>
                            <Box sx={{ textAlign: 'right' }}>
                                <Typography sx={{ fontSize: 11, color: '#9CA3AF', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.4 }}>Bid window</Typography>
                                <Typography sx={{ fontSize: 12.5, fontWeight: 700, color: '#374151', mt: 0.5 }}>
                                    {fmtDate(property.bidOpenDate)} – {fmtDate(property.bidCloseDate)}
                                </Typography>
                            </Box>
                        </Stack>

                        <Button
                            fullWidth
                            variant="contained"
                            disabled={action.disabled}
                            startIcon={action.icon ? <GavelOutlinedIcon sx={{ fontSize: 17 }} /> : undefined}
                            onClick={(e) => { e.stopPropagation(); if (property.canView) onView(property.id); }}
                            sx={{
                                bgcolor: action.disabled ? '#94A3B8 !important' : '#5E35B1',
                                borderRadius: '10px',
                                fontWeight: 700,
                                fontSize: 13.5,
                                py: 1,
                                '&:hover': { bgcolor: action.disabled ? '#94A3B8 !important' : '#4527A0' },
                                color: 'white !important',
                                textTransform: 'none',
                            }}
                        >
                            {action.label}
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

    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const LIMIT = 10;

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
                        <Typography sx={{ fontSize: 16, fontWeight: 700, color: 'text.primary', mb: 3 }}>
                            You haven't saved any properties yet. Start exploring to find your perfect stay.
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