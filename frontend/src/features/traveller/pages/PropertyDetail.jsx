import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Box,
    Typography,
    Button,
    Grid,
    Paper,
    Stack,
    Divider,
    Chip,
    Skeleton,
    Avatar,
    IconButton
} from '@mui/material';
import DOMPurify from 'dompurify';

// Icons
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import KingBedOutlinedIcon from '@mui/icons-material/KingBedOutlined';
import GroupsOutlinedIcon from '@mui/icons-material/GroupsOutlined';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AccessTimeOutlinedIcon from '@mui/icons-material/AccessTimeOutlined';
import HomeWorkOutlinedIcon from '@mui/icons-material/HomeWorkOutlined';
import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined';

// Loaders & Contexts
import { useError } from '../../../context/ErrorContext';
import useSuccessAlert from '../../../shared/hooks/useSuccessAlert';
import SuccessAlert from '../../../components/SuccessAlert';

// API Client
import { fetchPropertyById } from '../travellerAPI';

// Config: Dynamic API Base URL
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

const getImageUrl = (imgSrc) => {
    if (!imgSrc) return '/default_property.jpg';
    if (imgSrc.startsWith('http') || imgSrc.startsWith('data:')) return imgSrc;
    return `${API_BASE_URL}${imgSrc}`;
};
// Aliasing getMediaUrl to getImageUrl for support of both images & video URLs
const getMediaUrl = getImageUrl;

const fmtCurrency = (val) => `₹${Number(val || 0).toLocaleString('en-IN')}`;

// Format Dates: e.g. "2026-07-12" -> "12 Jul 2026"
const fmtDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
};

// Format Date & Time: e.g. "2026-07-05T00:00:00" -> "05 Jul, 12:00 AM"
const fmtDateTime = (dateTimeStr) => {
    if (!dateTimeStr) return '';
    const date = new Date(dateTimeStr);
    return date.toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit', hour12: true });
};

// Calculate stay nights between two date strings
const getNightCount = (start, end) => {
    if (!start || !end) return 0;
    const diffMs = new Date(end).getTime() - new Date(start).getTime();
    return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
};

function DetailPageSkeleton() {
    return (
        <Box sx={{ bgcolor: '#FAFBFC', minHeight: '100vh', py: 4 }}>
            <Box sx={{ maxWidth: 1200, mx: 'auto', px: 2 }}>
                <Skeleton variant="text" width={100} height={20} sx={{ mb: 3 }} />
                <Grid container spacing={4}>
                    <Grid size={{ xs: 12, md: 7, lg: 8 }}>
                        <Stack spacing={3}>
                            <Paper elevation={0} sx={{ border: '1px solid #E5E7EB', borderRadius: 4, overflow: 'hidden', p: 1.5, bgcolor: 'white' }}>
                                <Skeleton variant="rectangular" width="100%" sx={{ pt: '56.25%', borderRadius: 3 }} />
                            </Paper>
                            <Box>
                                <Skeleton variant="text" width="60%" height={38} sx={{ mb: 1 }} />
                                <Skeleton variant="text" width="30%" height={20} />
                            </Box>
                        </Stack>
                    </Grid>
                    <Grid size={{ xs: 12, md: 5, lg: 4 }}>
                        <Paper elevation={0} sx={{ p: 3, border: '1px solid #E5E7EB', borderRadius: 4, bgcolor: 'white' }}>
                            <Skeleton variant="rectangular" width="100%" height={28} sx={{ mb: 3 }} />
                        </Paper>
                    </Grid>
                </Grid>
            </Box>
        </Box>
    );
}

export default function PropertyDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { showError } = useError();
    const { open, message, closeSuccess } = useSuccessAlert();

    // Page States
    const [property, setProperty] = useState(null);
    const [loading, setLoading] = useState(true);

    // Media States
    const [activeImage, setActiveImage] = useState(0);
    const [mediaTab, setMediaTab] = useState('photos'); // 'photos' or 'video'
    const [now, setNow] = useState(Date.now());

    // Selected Slot State
    const [selectedAuction, setSelectedAuction] = useState(null);
    const [showAllAuctions, setShowAllAuctions] = useState(false);

    // Fetch Property Details
    useEffect(() => {
        const getDetails = async () => {
            try {
                setLoading(true);
                const res = await fetchPropertyById(id);
                const propertyData = res.data || (res.id ? res : null);

                if (propertyData) {
                    setProperty(propertyData);

                    // Auto-select first stay slot if available
                    if (propertyData.auctions && propertyData.auctions.length > 0) {
                        setSelectedAuction(propertyData.auctions[0]);
                    }
                } else {
                    showError('Property not found.');
                }
            } catch (err) {
                showError('Failed to fetch property details.');
            } finally {
                setLoading(false);
            }
        };
        getDetails();
    }, [id]);

    // Live countdown updates for active slots (1s interval)
    useEffect(() => {
        const timer = setInterval(() => setNow(Date.now()), 1000);
        return () => clearInterval(timer);
    }, []);

    if (loading) {
        return <DetailPageSkeleton />;
    }

    if (!property) {
        return (
            <Box sx={{ py: 10, textAlign: 'center' }}>
                <Typography variant="h6" color="text.secondary" sx={{ mb: 3 }}>Property not found.</Typography>
                {/* Back Link Header Row */}
                <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', justifyContent: 'center' }}>
                    <IconButton
                        onClick={() => navigate('/traveller/properties')}
                        sx={{
                            bgcolor: 'white',
                            border: '1px solid #E2E8F0',
                            color: '#475569',
                            boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
                            '&:hover': { bgcolor: '#F1F5F9' },
                        }}
                    >
                        <ArrowBackIcon sx={{ fontSize: 20 }} />
                    </IconButton>
                    <Typography sx={{ color: '#475569', fontWeight: 700, fontSize: 14.5 }}>
                        Back to Listings
                    </Typography>
                </Stack>
            </Box>
        );
    }
    // Timer Calculations for selected slot
    let isClosed = true;
    let isUpcoming = false;
    let diffMs = 0;

    if (selectedAuction) {
        const openTime = new Date(selectedAuction.bidOpenDate).getTime();
        const closeTime = new Date(selectedAuction.bidCloseDate).getTime();

        isUpcoming = now < openTime || selectedAuction.auctionStatus === 'UPCOMING';
        isClosed = now >= closeTime || selectedAuction.auctionStatus === 'CLOSED' || selectedAuction.auctionStatus === 'CANCELLED';
        diffMs = isUpcoming ? openTime - now : closeTime - now;
    }

    const formatCountdown = () => {
        if (isClosed) return 'Ended';
        const totalSecs = Math.floor(diffMs / 1000);
        if (totalSecs <= 0) return 'Ended';
        const hours = Math.floor(totalSecs / 3600);
        const mins = Math.floor((totalSecs % 3600) / 60);
        const secs = totalSecs % 60;
        return `${hours}h ${mins}m ${secs}s`;
    };

    const isEndingSoon = !isClosed && !isUpcoming && diffMs < 2 * 60 * 60 * 1000;

    const typeIconUrl = property.propertyTypeIconurl || property.propertyTypeIconUrl;

    return (
        <Box sx={{ bgcolor: '#FAFBFC', minHeight: '100vh', py: 4 }}>
            <SuccessAlert open={open} message={message} onClose={closeSuccess} />

            <Box sx={{ maxWidth: 1200, mx: 'auto', px: 2 }}>

                {/* Back Link Header Row */}
                <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', mb: 3, ml: -6  }}>
                    <IconButton
                        onClick={() => navigate('/traveller/properties')}
                        sx={{
                            bgcolor: 'white',
                            border: '1px solid #E2E8F0',
                            color: '#475569',
                            boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
                            '&:hover': { bgcolor: '#F1F5F9' },
                        }}
                    >
                        <ArrowBackIcon sx={{ fontSize: 20 }} />
                    </IconButton>
                    <Typography sx={{ color: '#475569', fontWeight: 700, fontSize: 14.5 }}>
                        Back to Listings
                    </Typography>
                </Stack>

                <Grid container spacing={4}>

                    {/* LEFT PANEL: Media Gallery & Details */}
                    <Grid size={{ xs: 12, md: 7, lg: 8 }}>
                        <Stack spacing={3.5}>

                            {/* Media Gallery with Video Support */}
                            <Paper
                                elevation={0}
                                sx={{
                                    border: '1px solid #E2E8F0',
                                    borderRadius: 4,
                                    overflow: 'hidden',
                                    p: 1.5,
                                    bgcolor: 'white',
                                    boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
                                }}
                            >
                                <Box sx={{ position: 'relative', width: '100%', pt: '56.25%', borderRadius: 3, overflow: 'hidden', bgcolor: '#0F172A' }}>

                                    {mediaTab === 'video' && property.videoUrl ? (
                                        <Box
                                            component="video"
                                            src={getMediaUrl(property.videoUrl)}
                                            controls
                                            autoPlay
                                            muted
                                            playsInline
                                            sx={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'contain' }}
                                        />
                                    ) : (
                                        <Box
                                            component="img"
                                            src={property.images && property.images.length > 0 ? getMediaUrl(property.images[activeImage]) : 'https://picsum.photos/seed/nivasa/900/650'}
                                            alt={property.propertyName}
                                            sx={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
                                        />
                                    )}

                                    {/* Video/Photo Tab Switcher Overlay */}
                                    {property.videoUrl && (
                                        <Stack
                                            direction="row"
                                            spacing={0.5}
                                            sx={{
                                                position: 'absolute',
                                                bottom: 12,
                                                right: 12,
                                                bgcolor: 'rgba(15, 23, 42, 0.85)',
                                                backdropFilter: 'blur(8px)',
                                                borderRadius: 2,
                                                p: 0.5,
                                                zIndex: 2,
                                                border: '1px solid rgba(255, 255, 255, 0.1)'
                                            }}
                                        >
                                            <Button
                                                size="small"
                                                variant="text"
                                                onClick={() => setMediaTab('photos')}
                                                sx={{
                                                    color: mediaTab === 'photos' ? 'white' : 'rgba(255, 255, 255, 0.65)',
                                                    bgcolor: mediaTab === 'photos' ? 'rgba(255, 255, 255, 0.15)' : 'transparent',
                                                    textTransform: 'none',
                                                    fontWeight: 700,
                                                    px: 1.5,
                                                    py: 0.5,
                                                    fontSize: 12,
                                                    borderRadius: 1.5,
                                                    '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.25)', color: 'white' }
                                                }}
                                            >
                                                Photos
                                            </Button>
                                            <Button
                                                size="small"
                                                variant="text"
                                                onClick={() => setMediaTab('video')}
                                                sx={{
                                                    color: mediaTab === 'video' ? 'white' : 'rgba(255, 255, 255, 0.65)',
                                                    bgcolor: mediaTab === 'video' ? 'rgba(255, 255, 255, 0.15)' : 'transparent',
                                                    textTransform: 'none',
                                                    fontWeight: 700,
                                                    px: 1.5,
                                                    py: 0.5,
                                                    fontSize: 12,
                                                    borderRadius: 1.5,
                                                    '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.25)', color: 'white' }
                                                }}
                                            >
                                                Video
                                            </Button>
                                        </Stack>
                                    )}
                                </Box>

                                {/* Thumbnails Strip */}
                                <Stack direction="row" spacing={1.5} sx={{ mt: 2, px: 0.5, overflowX: 'auto', pb: 0.5, alignItems: 'center' }}>
                                    {/* Normal Images */}
                                    {property.images && property.images.map((img, idx) => (
                                        <Box
                                            key={idx}
                                            onClick={() => {
                                                setMediaTab('photos');
                                                setActiveImage(idx);
                                            }}
                                            component="img"
                                            src={getImageUrl(img)}
                                            alt=""
                                            sx={{
                                                width: 80,
                                                height: 56,
                                                borderRadius: 2,
                                                objectFit: 'cover',
                                                cursor: 'pointer',
                                                border: '2px solid',
                                                borderColor: (mediaTab === 'photos' && activeImage === idx) ? '#5E35B1' : 'transparent',
                                                opacity: (mediaTab === 'photos' && activeImage === idx) ? 1 : 0.6,
                                                transition: 'all 0.2s ease',
                                                '&:hover': { opacity: 1 },
                                            }}
                                        />
                                    ))}

                                    {/* Video Slot in Thumbnail Strip */}
                                    {property.videoUrl && (
                                        <Box
                                            onClick={() => setMediaTab('video')}
                                            sx={{
                                                width: 80,
                                                height: 56,
                                                borderRadius: 2,
                                                cursor: 'pointer',
                                                border: '2px solid',
                                                borderColor: mediaTab === 'video' ? '#5E35B1' : 'transparent',
                                                bgcolor: '#1E293B',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                position: 'relative',
                                                opacity: mediaTab === 'video' ? 1 : 0.6,
                                                transition: 'all 0.2s ease',
                                                '&:hover': { opacity: 1 },
                                            }}
                                        >
                                            <Box
                                                component="img"
                                                src={property.images && property.images.length > 0 ? getImageUrl(property.images[0]) : 'https://picsum.photos/seed/nivasa/900/650'}
                                                alt=""
                                                sx={{
                                                    position: 'absolute',
                                                    inset: 0,
                                                    width: '100%',
                                                    height: '100%',
                                                    objectFit: 'cover',
                                                    opacity: 0.35,
                                                    borderRadius: 1.5,
                                                }}
                                            />
                                            <PlayArrowIcon sx={{ color: 'white', fontSize: 24, zIndex: 1 }} />
                                        </Box>
                                    )}
                                </Stack>
                            </Paper>

                            {/* Title & Location */}
                            <Box>
                                <Stack direction="row" spacing={1.2} sx={{ alignItems: 'center', mb: 1.5 }}>
                                    {typeIconUrl && (
                                        <Box component="img" src={typeIconUrl} sx={{ width: 18, height: 18, objectFit: 'contain' }} />
                                    )}
                                    <Chip
                                        label={property.propertyType}
                                        size="small"
                                        sx={{ bgcolor: '#EDE7F6', color: '#5E35B1', fontWeight: 800, fontSize: 11 }}
                                    />
                                </Stack>
                                <Typography variant="h4" sx={{ fontWeight: 900, color: '#1E1154', letterSpacing: '-0.02em', mb: 1 }}>
                                    {property.propertyName}
                                </Typography>
                                <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
                                    <LocationOnOutlinedIcon sx={{ color: '#94A3B8', fontSize: 18 }} />
                                    <Typography sx={{ color: '#64748B', fontWeight: 600, fontSize: 14.5 }}>
                                        {property.locality ? `${property.locality}, ` : ''}{property.city}, {property.state}, {property.country}
                                    </Typography>
                                </Stack>
                            </Box>

                            {/* Specifications Chips */}
                            <Stack direction="row" spacing={2} sx={{ flexWrap: 'wrap', gap: 1.5 }}>
                                <Chip
                                    icon={<KingBedOutlinedIcon sx={{ color: '#5E35B1 !important' }} />}
                                    label={`${property.bedrooms} Bedrooms`}
                                    sx={{ bgcolor: '#F5F3FF', border: '1px solid #EDE7F6', fontWeight: 700, color: '#5E35B1', px: 0.5 }}
                                />
                                <Chip
                                    icon={<GroupsOutlinedIcon sx={{ color: '#5E35B1 !important' }} />}
                                    label={`Up to ${property.maxGuests} Guests`}
                                    sx={{ bgcolor: '#F5F3FF', border: '1px solid #EDE7F6', fontWeight: 700, color: '#5E35B1', px: 0.5 }}
                                />
                            </Stack>

                            <Divider />

                            {/* Description Section */}
                            <Stack spacing={1.5}>
                                <Typography variant="h6" sx={{ fontWeight: 800, color: '#1E1154' }}>
                                    About this stay
                                </Typography>
                                <Typography
                                    component="div"
                                    dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(property.description || '') }}
                                    sx={{
                                        color: '#334155',
                                        fontSize: 15.5,
                                        lineHeight: 1.7,
                                        fontWeight: 500,
                                        '& p': { m: 0 }
                                    }}
                                />
                            </Stack>

                            <Divider />

                            {/* Amenities Section */}
                            <Stack spacing={2}>
                                <Typography variant="h6" sx={{ fontWeight: 800, color: '#1E1154' }}>
                                    What this place offers
                                </Typography>
                                <Grid container spacing={2}>
                                    {property.amenities && property.amenities.map((amenity) => {
                                        const amenityIconUrl = amenity.iconurl || amenity.iconUrl;

                                        return (
                                            <Grid size={{ xs: 12, sm: 6 }} key={amenity.id}>
                                                <Paper
                                                    elevation={0}
                                                    sx={{
                                                        p: 2,
                                                        border: '1px solid #F1F5F9',
                                                        borderRadius: 3,
                                                        bgcolor: 'white',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: 1.5,
                                                    }}
                                                >
                                                    {amenityIconUrl ? (
                                                        <Box
                                                            component="img"
                                                            src={amenityIconUrl}
                                                            alt={amenity.name}
                                                            sx={{ width: 22, height: 22, objectFit: 'contain' }}
                                                        />
                                                    ) : (
                                                        <HomeWorkOutlinedIcon sx={{ color: '#5E35B1', fontSize: 22 }} />
                                                    )}
                                                    <Typography sx={{ color: '#1E293B', fontWeight: 600, fontSize: 14 }}>
                                                        {amenity.name}
                                                    </Typography>
                                                </Paper>
                                            </Grid>
                                        );
                                    })}
                                </Grid>
                            </Stack>

                            <Divider />

                            {/* SECTION: Available stay slots */}
                            <Stack spacing={2}>
                                <Typography variant="h6" sx={{ fontWeight: 800, color: '#1E1154' }}>
                                    Select Stay Dates
                                </Typography>
                                <Typography sx={{ fontSize: 13.5, color: '#64748B', fontWeight: 500, mt: -1 }}>
                                    Choose one of the stay slots below to view its pricing breakdown and schedule.
                                </Typography>

                                <Stack spacing={2}>
                                    {property.auctions &&
                                        (showAllAuctions ? property.auctions : property.auctions.slice(0, 3)).map((auc) => {
                                            const isSelected = selectedAuction?.auctionId === auc.auctionId;
                                            const nights = getNightCount(auc.stayStartDate, auc.stayEndDate);

                                            // Slot timing states
                                            const slotOpenTime = new Date(auc.bidOpenDate).getTime();
                                            const slotCloseTime = new Date(auc.bidCloseDate).getTime();
                                            const slotIsUpcoming = now < slotOpenTime || auc.auctionStatus === 'UPCOMING';
                                            const slotIsClosed = now >= slotCloseTime || auc.auctionStatus === 'CLOSED' || auc.auctionStatus === 'CANCELLED';

                                            return (
                                                <Paper
                                                    key={auc.auctionId}
                                                    elevation={0}
                                                    onClick={() => setSelectedAuction(auc)}
                                                    sx={{
                                                        p: 2.5,
                                                        borderRadius: 3,
                                                        cursor: 'pointer',
                                                        transition: 'all 0.2s ease',
                                                        border: '2px solid',
                                                        borderColor: isSelected ? '#5E35B1' : '#E2E8F0',
                                                        bgcolor: isSelected ? '#FDFDFF' : 'white',
                                                        boxShadow: isSelected ? '0 4px 12px rgba(94, 53, 177, 0.08)' : 'none',
                                                        '&:hover': {
                                                            borderColor: isSelected ? '#5E35B1' : '#CBD5E1',
                                                        }
                                                    }}
                                                >
                                                    <Grid container spacing={2} sx={{ alignItems: 'center' }}>
                                                        <Grid size={{ xs: 12, sm: 6 }}>
                                                            <Stack direction="row" spacing={1.2} sx={{ alignItems: 'center', mb: 0.5 }}>
                                                                <Typography sx={{ fontSize: 15, fontWeight: 800, color: '#1E1154' }}>
                                                                    {fmtDate(auc.stayStartDate)} – {fmtDate(auc.stayEndDate)}
                                                                </Typography>
                                                                {slotIsUpcoming && (
                                                                    <Chip label="Upcoming" size="small" sx={{ bgcolor: '#FFFBEB', color: '#B45309', border: '1px solid #FDE68A', fontWeight: 800, fontSize: 10, height: 18 }} />
                                                                )}
                                                                {!slotIsUpcoming && !slotIsClosed && (
                                                                    <Chip label="Live" size="small" sx={{ bgcolor: '#ECFDF5', color: '#047857', border: '1px solid #A7F3D0', fontWeight: 800, fontSize: 10, height: 18 }} />
                                                                )}
                                                                {slotIsClosed && (
                                                                    <Chip label="Ended" size="small" sx={{ bgcolor: '#F8FAFC', color: '#64748B', border: '1px solid #E2E8F0', fontWeight: 800, fontSize: 10, height: 18 }} />
                                                                )}
                                                            </Stack>
                                                            <Typography sx={{ fontSize: 12.5, color: '#64748B', fontWeight: 600 }}>
                                                                {nights} Nights • {auc.packageType} Package
                                                            </Typography>
                                                        </Grid>

                                                        <Grid size={{ xs: 12, sm: 3 }}>
                                                            <Typography sx={{ fontSize: 11, color: '#94A3B8', fontWeight: 700, textTransform: 'uppercase' }}>
                                                                {slotIsUpcoming ? 'Starting Bid' : 'Current Bid'}
                                                            </Typography>
                                                            <Typography sx={{ fontSize: 16, fontWeight: 800, color: '#0F172A', mt: 0.2 }}>
                                                                {fmtCurrency(auc.baseCost)}
                                                            </Typography>
                                                        </Grid>

                                                        <Grid size={{ xs: 12, sm: 3 }} sx={{ textAlign: { sm: 'right' } }}>
                                                            <Button
                                                                variant={isSelected ? "contained" : "outlined"}
                                                                size="small"
                                                                sx={{
                                                                    textTransform: 'none',
                                                                    fontWeight: 700,
                                                                    borderRadius: 2,
                                                                    px: 2.5,
                                                                    bgcolor: isSelected ? '#5E35B1' : 'transparent',
                                                                    color: isSelected ? 'white' : '#5E35B1',
                                                                    borderColor: '#5E35B1',
                                                                    '&:hover': {
                                                                        bgcolor: isSelected ? '#4527A0' : '#F5F3FF',
                                                                        borderColor: '#5E35B1'
                                                                    }
                                                                }}
                                                            >
                                                                {isSelected ? 'Selected' : 'Select Slot'}
                                                            </Button>
                                                        </Grid>
                                                    </Grid>
                                                </Paper>
                                            );
                                        })}
                                </Stack>
                                {property.auctions && property.auctions.length > 3 && (
                                    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 1 }}>
                                        <Button
                                            variant="outlined"
                                            onClick={() => setShowAllAuctions(!showAllAuctions)}
                                            sx={{
                                                textTransform: 'none',
                                                fontWeight: 700,
                                                borderRadius: 2.5,
                                                px: 4,
                                                py: 1,
                                                borderColor: '#E2E8F0',
                                                color: '#475569',
                                                fontSize: 13,
                                                '&:hover': {
                                                    bgcolor: '#F8FAFC',
                                                    borderColor: '#CBD5E1'
                                                }
                                            }}
                                        >
                                            {showAllAuctions ? 'Show Less' : `View More (${property.auctions.length - 3} more)`}
                                        </Button>
                                    </Box>
                                )}
                            </Stack>

                            <Divider />

                            {/* Host Info Card */}
                            <Grid container spacing={3}>

                                {/* Host Info */}
                                <Grid size={{ xs: 12 }}>
                                    <Paper elevation={0} sx={{ p: 2.5, border: '1px solid #E2E8F0', borderRadius: 4, bgcolor: 'white' }}>
                                        <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', mb: 1.5 }}>
                                            <Avatar sx={{ bgcolor: '#5E35B1', width: 40, height: 40 }}>
                                                <PersonOutlineOutlinedIcon />
                                            </Avatar>
                                            <Box>
                                                <Typography sx={{ fontSize: 11, color: '#94A3B8', fontWeight: 800, textTransform: 'uppercase' }}>Hosted By</Typography>
                                                <Typography sx={{ fontSize: 15, fontWeight: 800, color: '#1E1154' }}>{property.ownerName}</Typography>
                                            </Box>
                                        </Stack>
                                        <Typography sx={{ fontSize: 13, color: '#64748B', fontWeight: 500 }}>
                                            Email: {property.ownerEmail}
                                        </Typography>
                                    </Paper>
                                </Grid>

                            </Grid>
                        </Stack>
                    </Grid>

                    {/* RIGHT PANEL: Sticky Selected Stay Summary Card */}
                    <Grid size={{ xs: 12, md: 5, lg: 4 }}>
                        <Paper
                            elevation={0}
                            sx={{
                                p: 2.5,
                                border: '1px solid #E2E8F0',
                                borderRadius: 4,
                                bgcolor: 'white',
                                position: 'sticky',
                                top: 100,
                                boxShadow: '0 4px 20px rgba(30,17,84,0.04)',
                            }}
                        >
                            {!selectedAuction ? (
                                <Box sx={{ textAlign: 'center', py: 6 }}>
                                    <CalendarMonthOutlinedIcon sx={{ fontSize: 48, color: '#CBD5E1', mb: 1.5 }} />
                                    <Typography sx={{ fontSize: 15, fontWeight: 700, color: '#475569', mb: 0.5 }}>
                                        Select Stay Slot
                                    </Typography>
                                    <Typography sx={{ fontSize: 12.5, color: '#94A3B8', px: 2 }}>
                                        Please choose one of the available stay date options on the left to see stay breakdown details.
                                    </Typography>
                                </Box>
                            ) : (
                                <Stack spacing={2.5}>

                                    {/* Timer/Opens Banner */}
                                    <Box
                                        sx={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 1.2,
                                            bgcolor: isClosed ? '#F8FAFC' : (isUpcoming ? '#FFFBEB' : (isEndingSoon ? '#FEF2F2' : '#F5F3FF')),
                                            border: '1px solid',
                                            borderColor: isClosed ? '#E2E8F0' : (isUpcoming ? '#FDE68A' : (isEndingSoon ? '#FECACA' : '#EDE7F6')),
                                            borderRadius: 2.5,
                                            p: 1.8,
                                            color: isClosed ? '#64748B' : (isUpcoming ? '#B45309' : (isEndingSoon ? '#EF4444' : '#5E35B1')),
                                        }}
                                    >
                                        <AccessTimeOutlinedIcon sx={{ fontSize: 18 }} />
                                        <Typography sx={{ fontSize: 12.5, fontWeight: 800, textTransform: 'uppercase' }}>
                                            {isClosed ? 'Ended' : (isUpcoming ? 'Opens In' : (isEndingSoon ? 'Ends Soon' : 'Time Left'))}
                                        </Typography>
                                        <Typography sx={{ ml: 'auto', fontSize: 13.5, fontWeight: 900 }}>
                                            {isUpcoming
                                                ? fmtDateTime(selectedAuction.bidOpenDate)
                                                : formatCountdown()
                                            }
                                        </Typography>
                                    </Box>

                                    {/* Price Overview */}
                                    <Box>
                                        <Typography sx={{ fontSize: 11.5, color: '#94A3B8', fontWeight: 800, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                                            {isUpcoming ? 'Starting Bid' : 'Current Bid'}
                                        </Typography>
                                        <Typography variant="h3" sx={{ fontWeight: 900, color: '#1E1154', mt: 0.5 }}>
                                            {fmtCurrency(selectedAuction.baseCost)}
                                        </Typography>
                                        <Stack direction="row" sx={{ alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                                            <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 600 }}>
                                                Bid Increment size:
                                            </Typography>
                                            <Typography variant="caption" sx={{ color: '#10B981', fontWeight: 800 }}>
                                                +{fmtCurrency(selectedAuction.bidIncrement)}
                                            </Typography>
                                        </Stack>
                                    </Box>

                                    <Divider />

                                    {/* Stay Summary Details */}
                                    <Stack spacing={2}>
                                        <Typography sx={{ fontSize: 13, fontWeight: 800, color: '#1E1154', textTransform: 'uppercase', letterSpacing: 0.4 }}>
                                            Stay Summary
                                        </Typography>

                                        <Stack spacing={1.5}>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                                <Typography sx={{ fontSize: 13.5, color: '#64748B', fontWeight: 500 }}>Stay Dates</Typography>
                                                <Typography sx={{ fontSize: 13.5, color: '#0F172A', fontWeight: 700 }}>
                                                    {fmtDate(selectedAuction.stayStartDate)} – {fmtDate(selectedAuction.stayEndDate)}
                                                </Typography>
                                            </Box>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                                <Typography sx={{ fontSize: 13.5, color: '#64748B', fontWeight: 500 }}>Nights</Typography>
                                                <Typography sx={{ fontSize: 13.5, color: '#0F172A', fontWeight: 700 }}>
                                                    {getNightCount(selectedAuction.stayStartDate, selectedAuction.stayEndDate)} Nights
                                                </Typography>
                                            </Box>
                                        </Stack>
                                    </Stack>

                                    <Divider />

                                    <Stack spacing={1.5}>
                                        <Typography sx={{ fontSize: 13, fontWeight: 800, color: '#1E1154', textTransform: 'uppercase', letterSpacing: 0.4 }}>
                                            Bidding Timeline
                                        </Typography>

                                        <Stack spacing={1.2}>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                                <Typography sx={{ fontSize: 12.5, color: '#64748B', fontWeight: 500 }}>Bidding Starts</Typography>
                                                <Typography sx={{ fontSize: 12.5, color: '#1E293B', fontWeight: 600 }}>
                                                    {fmtDateTime(selectedAuction.bidOpenDate)}
                                                </Typography>
                                            </Box>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                                <Typography sx={{ fontSize: 12.5, color: '#64748B', fontWeight: 500 }}>Bidding Ends</Typography>
                                                <Typography sx={{ fontSize: 12.5, color: '#1E293B', fontWeight: 600 }}>
                                                    {fmtDateTime(selectedAuction.bidCloseDate)}
                                                </Typography>
                                            </Box>
                                        </Stack>
                                    </Stack>

                                    <Button
                                        fullWidth
                                        variant="contained"
                                        disabled
                                        sx={{
                                            bgcolor: '#94A3B8 !important',
                                            color: 'white !important',
                                            borderRadius: 3.5,
                                            py: 1.6,
                                            fontWeight: 800,
                                            fontSize: 14.5,
                                            textTransform: 'none',
                                            boxShadow: 'none',
                                        }}
                                    >
                                        {isClosed
                                            ? 'Bidding Ended'
                                            : (isUpcoming ? 'Bidding Opens Soon' : 'Bid Console Loading...')
                                        }
                                    </Button>
                                </Stack>
                            )}
                        </Paper>
                    </Grid>

                </Grid>
            </Box>
        </Box>
    );
}