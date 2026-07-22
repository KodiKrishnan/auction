import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Box, Typography, Button, Stack, Paper, Chip, IconButton, Skeleton, Divider, Fade, Grid, Pagination
} from '@mui/material';

import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import FavoriteIcon from '@mui/icons-material/Favorite';
import KingBedOutlinedIcon from '@mui/icons-material/KingBedOutlined';
import GroupsOutlinedIcon from '@mui/icons-material/GroupsOutlined';
import AccessTimeOutlinedIcon from '@mui/icons-material/AccessTimeOutlined';
import GavelOutlinedIcon from '@mui/icons-material/GavelOutlined';
import HomeWorkOutlinedIcon from '@mui/icons-material/HomeWorkOutlined';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';

import { useError } from '../../../context/ErrorContext';
import useSuccessAlert from '../../../shared/hooks/useSuccessAlert';
import SuccessAlert from '../../../components/SuccessAlert';

import { fetchSearchProperties, fetchAllPropertiesList, fetchWishlist, toggleWishlist } from '../travellerAPI';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

const getImageUrl = (imgSrc) => {
  if (!imgSrc) return '/default_property.jpg'; 
  if (imgSrc.startsWith('http') || imgSrc.startsWith('data:')) return imgSrc;
  return `${API_BASE_URL}${imgSrc}`;
};

const fmtCurrency = (val) => `₹${Number(val || 0).toLocaleString('en-IN')}`;

const formatDateTime = (dateStr) => {
  if (!dateStr) return '—';
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short'
  }) + ', ' + date.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
};

function getUrgency(auctionStatus, bidCloseDate, now) {
  const status = (auctionStatus || 'OPEN').toUpperCase();

  if (status === 'UPCOMING') {
    return { key: 'upcoming', label: 'Upcoming', bg: '#FFFBEB', color: '#92400E', border: '#FDE68A', pulse: false };
  }

  const diffMs = new Date(bidCloseDate).getTime() - now;
  const hoursLeft = diffMs / (60 * 60 * 1000);

  if (hoursLeft <= 0) {
    return { key: 'closed', label: 'Closed', bg: '#F9FAFB', color: '#6B7280', border: '#E5E7EB', pulse: false };
  }
  if (hoursLeft <= 2) {
    return { key: 'urgent', label: 'Closing soon', bg: '#FEF2F2', color: '#991B1B', border: '#FECACA', pulse: true };
  }
  if (hoursLeft <= 24) {
    return { key: 'soon', label: 'Closes today', bg: '#FFFBEB', color: '#92400E', border: '#FDE68A', pulse: false };
  }
  return { key: 'live', label: 'Open', bg: '#F5F3FF', color: '#5E35B1', border: '#EDE7F6', pulse: false };
}


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

function PropertyCard({ property, now, onView, onWatchlistToggle, isWatched }) {
  const [imgIndex, setImgIndex] = useState(0);
  const [hovered, setHovered] = useState(false);


  const urgency = getUrgency(property.auctionStatus, property.bidCloseDate, now);
  const timeLeft = formatTimeLeft(property.bidCloseDate, now);

  const shownAmenities = property.amenities ? property.amenities.slice(0, 3) : [];
  const extraAmenityCount = property.amenities ? property.amenities.length - shownAmenities.length : 0;

  const nextImg = (e) => { e.stopPropagation(); setImgIndex((i) => (i + 1) % property.images.length); };
  const prevImg = (e) => { e.stopPropagation(); setImgIndex((i) => (i - 1 + property.images.length) % property.images.length); };

  const propertyTypeIcon = property.propertyTypeIcon || property.propertyTypeIconurl;

  return (
    <Paper
      elevation={0} onClick={() => onView(property)} onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
      sx={{
        width: '100%',
        border: '1px solid #E5E7EB', borderRadius: 3, overflow: 'hidden', cursor: 'pointer', transition: 'all 0.25s ease', height: '100%', display: 'flex', flexDirection: 'column', '&:hover': { borderColor: '#D1D5DB', boxShadow: '0 8px 24px rgba(94,53,177,0.12)', transform: 'translateY(-2px)' }
      }}
    >
      <Box sx={{ position: 'relative', width: '100%', pt: '68%', bgcolor: '#F3F4F6' }}>
        <Box component="img" src={property.images && property.images.length > 0 ? getImageUrl(property.images[imgIndex]) : '/default_property.jpg'} alt={property.propertyName} sx={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', transition: 'opacity 0.2s ease' }} />
        <Chip icon={urgency.pulse ? <FiberManualRecordIcon sx={{ fontSize: '10px !important', color: `${urgency.color} !important`, animation: 'nivasa-pulse 1.4s ease-in-out infinite' }} /> : undefined} label={urgency.label} size="small" sx={{ position: 'absolute', top: 10, left: 10, bgcolor: urgency.bg, color: urgency.color, border: `1px solid ${urgency.border}`, fontWeight: 700, fontSize: 11, height: 24, '& .MuiChip-icon': { ml: '6px' } }} />
        <IconButton size="small" onClick={(e) => { e.stopPropagation(); onWatchlistToggle(property.id, property.propertyName); }} sx={{ position: 'absolute', top: 8, right: 8, bgcolor: 'rgba(255,255,255,0.9)', width: 30, height: 30, '&:hover': { bgcolor: 'white' } }}>
          {isWatched ? <FavoriteIcon sx={{ fontSize: 16, color: '#DC2626' }} /> : <FavoriteBorderIcon sx={{ fontSize: 16, color: '#374151' }} />}
        </IconButton>
        {property.images && property.images.length > 1 && (
          <Fade in={hovered}>
            <Box>
              <IconButton size="small" onClick={prevImg} sx={{ position: 'absolute', top: '50%', left: 8, mt: '-15px', bgcolor: 'rgba(255,255,255,0.9)', width: 28, height: 28, display: { xs: 'none', md: 'flex' }, '&:hover': { bgcolor: 'white' } }}><ChevronLeftIcon sx={{ fontSize: 16 }} /></IconButton>
              <IconButton size="small" onClick={nextImg} sx={{ position: 'absolute', top: '50%', right: 8, mt: '-15px', bgcolor: 'rgba(255,255,255,0.9)', width: 28, height: 28, display: { xs: 'none', md: 'flex' }, '&:hover': { bgcolor: 'white' } }}><ChevronRightIcon sx={{ fontSize: 16 }} /></IconButton>
            </Box>
          </Fade>
        )}
      </Box>

      <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', flex: 1 }}>
        <Stack direction="row" sx={{ alignItems: 'flex-start', justifyContent: 'space-between', mb: 0.3 }}>
          <Typography sx={{ fontSize: 15, fontWeight: 800, color: '#1E1154', lineHeight: 1.3 }}>{property.propertyName}</Typography>
        </Stack>
        <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center', mb: 1.5 }}>
          <LocationOnOutlinedIcon sx={{ fontSize: 14, color: '#9CA3AF' }} />
          <Typography sx={{ fontSize: 12.5, color: '#6B7280', fontWeight: 500 }}>{property.city}, {property.state}</Typography>
        </Stack>

        <Stack direction="row" spacing={1.5} sx={{ mb: 1.5, alignItems: 'center' }}>
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
          <Stack direction="row" sx={{ alignItems: 'flex-end', justifyContent: 'space-between', mb: 1.2 }}>
            <Box>
              <Typography sx={{ fontSize: 11, color: '#9CA3AF', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.4 }}>Starting bid</Typography>
              <Stack direction="row" spacing={0.8} sx={{ alignItems: 'baseline' }}>
                <Typography sx={{ fontSize: 18, fontWeight: 800, color: '#111827' }}>{fmtCurrency(property.baseCost)}</Typography>

              </Stack>
            </Box>
            {urgency.key === 'upcoming' ? (
              <Stack sx={{ alignItems: 'flex-end', gap: 0.1 }}>
                <Typography sx={{ fontSize: 10, color: '#9CA3AF', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.4 }}>Bid Starts</Typography>
                <Typography sx={{ fontSize: 11, fontWeight: 700, color: '#92400E' }}>{formatDateTime(property.bidOpenDate)}</Typography>
                <Typography sx={{ fontSize: 9.5, color: '#9CA3AF', fontWeight: 500 }}>Ends {formatDateTime(property.bidCloseDate)}</Typography>
              </Stack>
            ) : (
              <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
                <AccessTimeOutlinedIcon sx={{ fontSize: 14, color: urgency.color }} />
                <Typography sx={{ fontSize: 12, fontWeight: 700, color: urgency.color }}>
                  {timeLeft}
                </Typography>
              </Stack>
            )}
          </Stack>

          <Button
            fullWidth
            variant="contained"
            startIcon={urgency.key === 'upcoming' ? undefined : <GavelOutlinedIcon sx={{ fontSize: 17 }} />}
            onClick={(e) => { e.stopPropagation(); onView(property); }}
            sx={{
              bgcolor: '#5E35B1', borderRadius: '10px', fontWeight: 700, fontSize: 13.5,
              py: 1, '&:hover': { bgcolor: '#4527A0' },
            }}
          >
            {urgency.key === 'upcoming' ? 'View Details' : 'View & Bid'}
          </Button>
        </Stack>
      </Box>
    </Paper>
  );
}

function SkeletonCard() {
  return (
    <Paper elevation={0} sx={{ width: '100%', border: '1px solid #E5E7EB', borderRadius: 3, overflow: 'hidden' }}>
      <Skeleton variant="rectangular" sx={{ width: '100%', pt: '68%' }} />
      <Box sx={{ p: 2 }}>
        <Skeleton width="70%" height={22} sx={{ mb: 0.5 }} />
        <Skeleton width="45%" height={16} sx={{ mb: 1.5 }} />
        <Skeleton width="90%" height={14} sx={{ mb: 1 }} />
        <Skeleton width="100%" height={38} sx={{ borderRadius: 2 }} />
      </Box>
    </Paper>
  );
}

export default function PropertySearch() {
  const navigate = useNavigate();
  const { showError } = useError();
  const { open, message, showSuccess, closeSuccess } = useSuccessAlert();

  const [searchParams, setSearchParams] = useSearchParams();

  // State Management
  const [properties, setProperties] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [now, setNow] = useState(Date.now());
  const [loading, setLoading] = useState(true);

  // Pagination States
  const [totalPages, setTotalPages] = useState(1);
  const [totalStays, setTotalStays] = useState(0);

  const LIMIT = 12;

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 30000);
    return () => clearInterval(t);
  }, []);

  const fetchStays = async () => {
    try {
      setLoading(true);

      const destination = searchParams.get('destination') || '';
      const checkIn = searchParams.get('checkIn') || '';
      const checkOut = searchParams.get('checkOut') || '';
      const guests = Number(searchParams.get('guests')) || 1;
      const targetPage = Number(searchParams.get('page')) || 1;

      const lat = searchParams.get('lat') || '';
      const lng = searchParams.get('lng') || '';

      const hasFilters = destination || checkIn || checkOut || guests > 1;

      let res;
      if (hasFilters) {
        const queryParams = {
          destination,
          checkIn,
          checkOut,
          guests,
          page: targetPage,
          limit: LIMIT,
        };

        if (lat && lng) {
          queryParams.lat = lat;
          queryParams.lng = lng;
        }

        res = await fetchSearchProperties(queryParams);
      } else {
        res = await fetchAllPropertiesList(targetPage, LIMIT);
      }

      if (res && res.success) {
        const list = res.data || [];
        setProperties(list);

        // Grab total element count
        const totalItems = res.total || list.length;
        setTotalStays(totalItems);

        // Calculate pages
        const calculatedPages = Math.ceil(totalItems / LIMIT);
        setTotalPages(calculatedPages);
      }
    } catch (err) {
      showError('Failed to load listings.');
    } finally {
      setLoading(false);
    }
  };

  // 2. Fetch listings whenever URL Query Parameters update
  useEffect(() => {
    fetchStays();
  }, [searchParams]);

  const filtered = properties;

  const handleView = (property) => navigate(`/traveller/properties/${property.id}`);


  useEffect(() => {
    const loadInitialWishlist = async () => {
      try {
        const res = await fetchWishlist(1, 100);
        if (res && res.success) {
          const savedIds = (res.data || []).map(item => item.id);
          setWishlist(savedIds);
        }
      } catch (err) {
        console.error("Failed to load initial wishlist:", err);
      }
    };
    loadInitialWishlist();
  }, []);

  const handleWishlistToggle = async (propertyId, propName) => {
    try {
      await toggleWishlist(propertyId);
      setWishlist((prev) => {
        const exists = prev.includes(propertyId);
        if (exists) {
          showSuccess(`Removed "${propName}" from your wishlist.`);
          return prev.filter((id) => id !== propertyId);
        } else {
          showSuccess(`Added "${propName}" to your wishlist!`);
          return [...prev, propertyId];
        }
      });
    } catch (err) {
      showError("Failed to update wishlist.");
    }
  };

  // Page selection handler - updates page query inside the URL
  const handlePageChange = (event, value) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', value);
    setSearchParams(params);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <Box sx={{ bgcolor: '#FAFBFC', minHeight: '100vh', pt: 3 }}>
      <SuccessAlert open={open} message={message} onClose={closeSuccess} />

      {/* Results area */}
      <Box sx={{ px: { xs: 2, md: 4 }, py: 3 }}>
        <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Typography sx={{ fontSize: 14, fontWeight: 700, color: '#111827' }}>
            {loading ? 'Loading stays…' : `${totalStays || filtered.length} stay${(totalStays || filtered.length) !== 1 ? 's' : ''} open for bidding`}
          </Typography>
        </Stack>

        {loading ? (
          <Grid container spacing={2.5}>
            {Array.from({ length: 8 }).map((_, i) => (
              <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={i} sx={{ display: 'flex' }}>
                <SkeletonCard />
              </Grid>
            ))}
          </Grid>
        ) : filtered.length === 0 ? (
          <Paper elevation={0} sx={{ textAlign: 'center', py: 10, border: '2px dashed #E5E7EB', borderRadius: 3, bgcolor: 'transparent' }}>
            <HomeWorkOutlinedIcon sx={{ fontSize: 52, color: '#D1D5DB', mb: 2 }} />
            <Typography sx={{ fontSize: 16, fontWeight: 700, color: '#111827', mb: 0.5 }}>No stays match your search</Typography>
            <Typography sx={{ fontSize: 13.5, color: 'text.secondary' }}>Try a different city, category or clear your filters.</Typography>
          </Paper>
        ) : (
          <Grid container spacing={2.5}>
            {filtered.map((property) => (
              <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={property.id} sx={{ display: 'flex' }}>
                <PropertyCard
                  property={property}
                  now={now}
                  onView={handleView}
                  onWatchlistToggle={handleWishlistToggle}
                  isWatched={wishlist.includes(property.id)}
                />
              </Grid>
            ))}
          </Grid>
        )}

        {/* Pagination Bar */}
        {!loading && totalPages > 1 && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5, mb: 2 }}>
            <Pagination
              count={totalPages}
              page={Number(searchParams.get('page')) || 1} // Reads page from URL
              onChange={handlePageChange}
              shape="rounded"
              sx={{
                '& .MuiPaginationItem-root': { fontWeight: 600 },
                '& .Mui-selected': { bgcolor: '#5E35B1 !important', color: 'white' }
              }}
            />
          </Box>
        )}

      </Box>

      <style>{`
        @keyframes nivasa-pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.25; }
        }
      `}</style>
    </Box>
  );
}