import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Button, Stack, Divider, IconButton, Skeleton, Paper, Grid, Tooltip
} from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import DOMPurify from 'dompurify';

// General UI Icons
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import BedOutlinedIcon from '@mui/icons-material/BedOutlined';
import PeopleOutlinedIcon from '@mui/icons-material/PeopleOutlined';
import MapsHomeWorkOutlinedIcon from '@mui/icons-material/MapsHomeWorkOutlined';
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import PlayCircleOutlinedIcon from '@mui/icons-material/PlayCircleOutlined'; // Fixed Import!

import { useAuth } from "../../../context/AuthContext";
import { fetchPropertyById } from '../ownerAPI';
import { useLoader } from "../../../context/LoaderContext";

// ─── IMAGE HELPER LOGIC ───
const BACKEND_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

const getImageUrl = (path) => {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  const formattedPath = path.startsWith('/') ? path : `/${path}`;
  const cleanPath = formattedPath.replace(/\\/g, '/');
  return `${BACKEND_URL}${cleanPath}`;
};

const STATUS_MAP = {
  1: { label: 'Active', color: '#166534', bg: '#F0FDF4', border: '#BBF7D0' },
  2: { label: 'Draft', color: '#92400E', bg: '#FFFBEB', border: '#FDE68A' },
  0: { label: 'Inactive', color: '#6B7280', bg: '#F9FAFB', border: '#E5E7EB' },
};

// ─── DYNAMIC ICON HELPER ───
const DynamicIcon = ({ iconUrl, isAmenity = true, color = "#5E35B1" }) => {
  if (iconUrl) {
    return <img src={iconUrl} alt="icon" style={{ width: 20, height: 20, objectFit: "contain" }} />;
  }
  return isAmenity ? 
    <CheckCircleOutlinedIcon sx={{ fontSize: 20, color: color }} /> : 
    <MapsHomeWorkOutlinedIcon sx={{ fontSize: 20, color: color }} />;
};

export default function PropertyDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Track which media item (image OR video) is currently selected
  const [activeIndex, setActiveIndex] = useState(0);

  const { user } = useAuth();
  const { showLoader, hideLoader } = useLoader();

  useEffect(() => {
    const load = async () => {
      try {
        showLoader();
        setLoading(true);
        const response = await fetchPropertyById(id);
        const data = response.data;

        const mappedProperty = {
          ...data,
          property_name: data.propertyName,
          property_type: data.propertyType,
          property_type_icon: data.propertyTypeIconUrl,
          max_guests: data.maxGuests,
          bedrooms: data.bedrooms,
          address: data.address,
          pincode: data.pincode,
          description: data.description,
          videoUrl: data.videoUrl, 
          images: data.images?.map(img => ({
            id: img.imageId,
            image_path: img.imagePath,
            is_primary: img.isPrimary
          })),
          amenities: data.amenities
        };

        setProperty(mappedProperty);
      } catch (err) {
        console.error('Failed to load property:', err);
      } finally {
        hideLoader();
        setLoading(false);
      }
    };
    load();
  }, [id]);

  if (loading) {
    return (
      <Box sx={{ p: { xs: 2, md: 6 }, maxWidth: 900, mx: 'auto' }}>
        <Skeleton width="30%" height={40} sx={{ mb: 3 }} />
        <Skeleton variant="rectangular" height={360} sx={{ borderRadius: 4, mb: 3 }} />
        <Skeleton width="60%" height={32} sx={{ mb: 1 }} />
        <Skeleton width="40%" height={24} sx={{ mb: 4 }} />
      </Box>
    );
  }

  if (!property) {
    return (
      <Box sx={{ textAlign: 'center', py: 15 }}>
        <Typography sx={{ fontSize: 48, mb: 2 }}>🏚</Typography>
        <Typography variant="h5" sx={{ fontWeight: 700, mb: 1, color: '#111827' }}>Property not found</Typography>
        <Typography sx={{ color: '#6B7280', mb: 3 }}>This listing may have been removed.</Typography>
        <Button onClick={() => navigate('/owner/properties')} sx={{ bgcolor: '#111827', color: 'white', px: 3, py: 1.5, borderRadius: 2, textTransform: 'none', fontWeight: 600 }}>
          Back to Properties
        </Button>
      </Box>
    );
  }

  const status = STATUS_MAP[property.status] || STATUS_MAP[2];
  const amenities = property.amenities || [];

 
  const rawImages = property.images || [];
  const mediaList = rawImages.map(img => ({
    type: 'image',
    src: getImageUrl(img.image_path),
    id: img.id
  }));

  if (property.videoUrl) {
    mediaList.push({
      type: 'video',
      src: getImageUrl(property.videoUrl),
      id: 'property-video'
    });
  }

  const activeMedia = mediaList[activeIndex] || null;

  return (
    <Box sx={{ bgcolor: '#F4F5F7', minHeight: '100vh', pb: 10 }}>

      {/* Premium Sticky Topbar */}
      <Box sx={{
        bgcolor: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(10px)',
        borderBottom: '1px solid #E5E7EB', px: { xs: 2, md: 6 }, py: 1.5,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        position: 'sticky', top: 0, zIndex: 20
      }}>
        <Stack direction="row" sx={{ alignItems: 'center', gap: 1.5 }}>
          <IconButton size="small" onClick={() => navigate(-1)} sx={{ border: '1px solid #E5E7EB', bgcolor: 'white', '&:hover': { bgcolor: '#F9FAFB' } }}>
            <ArrowBackIcon sx={{ fontSize: 20, color: '#4B5563' }} />
          </IconButton>
          <Typography sx={{ fontSize: 16, fontWeight: 700, color: '#111827' }}>Listing Details</Typography>
        </Stack>
        <Button startIcon={<EditOutlinedIcon sx={{ fontSize: 18 }} />} onClick={() => navigate(`/owner/properties/${id}/edit`)}
          sx={{ bgcolor: '#5E35B1', color: 'white', textTransform: 'none', fontWeight: 600, fontSize: 14, px: 3, py: 1, borderRadius: 2, boxShadow: '0 2px 8px rgba(94, 53, 177, 0.25)', '&:hover': { bgcolor: '#4527A0' } }}>
          Edit Property
        </Button>
      </Box>

      {/* Main Presentation Box */}
      <Box sx={{ maxWidth: 900, mx: 'auto', px: { xs: 2, md: 0 }, pt: 5 }}>
        <Paper elevation={0} sx={{ borderRadius: 4, border: '1px solid #E5E7EB', boxShadow: '0 12px 40px rgba(0,0,0,0.06)', bgcolor: 'white', overflow: 'hidden' }}>
          <Box sx={{ p: { xs: 3, md: 5 } }}>

           
            <Box sx={{ mb: 5 }}>
              
              {/* BIG DISPLAY BOX */}
              <Box sx={{ borderRadius: 3, overflow: 'hidden', height: { xs: 240, md: 450 }, bgcolor: '#000', mb: 1.5, position: 'relative' }}>
                {activeMedia ? (
                  activeMedia.type === 'image' ? (
                    <img src={activeMedia.src} alt="Property" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <video src={activeMedia.src} controls autoPlay style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                  )
                ) : (
                  <Box sx={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 1, bgcolor: '#F3F4F6' }}>
                    <Typography sx={{ fontSize: 48, color: '#D1D5DB' }}>🏡</Typography>
                    <Typography sx={{ fontSize: 14, color: '#9CA3AF', fontWeight: 500 }}>No media added yet</Typography>
                  </Box>
                )}
              </Box>

              {/* THUMBNAIL STRIP */}
              {mediaList.length > 1 && (
                <Stack direction="row" spacing={1.5} sx={{ overflowX: 'auto', pb: 0.5 }}>
                  {mediaList.map((media, i) => (
                    <Box key={media.id} onClick={() => setActiveIndex(i)} sx={{
                      width: 90, height: 65, flexShrink: 0, borderRadius: 2, overflow: 'hidden', cursor: 'pointer',
                      border: activeIndex === i ? '2px solid #5E35B1' : '2px solid transparent',
                      opacity: activeIndex === i ? 1 : 0.6, transition: '0.2s', '&:hover': { opacity: 1 },
                      bgcolor: media.type === 'video' ? '#111827' : 'transparent',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative'
                    }}>
                      {media.type === 'image' ? (
                        <img src={media.src} alt="Thumbnail" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <>
                          {/* Video Thumbnail Indicator */}
                          <PlayCircleOutlinedIcon sx={{ color: 'white', fontSize: 28, zIndex: 2 }} />
                          <Box sx={{ position: 'absolute', inset: 0, bgcolor: 'rgba(0,0,0,0.5)', zIndex: 1 }} />
                        </>
                      )}
                    </Box>
                  ))}
                </Stack>
              )}
            </Box>

            {/* Title + Status */}
            <Stack direction="row" sx={{ alignItems: 'flex-start', justifyContent: 'space-between', mb: 4, flexWrap: 'wrap', gap: 2 }}>
              <Box>
                <Stack direction="row" sx={{ alignItems: 'center', gap: 0.8, color: '#5E35B1', mb: 0.5 }}>
                  <DynamicIcon iconUrl={property.property_type_icon} isAmenity={false} />
                  <Typography sx={{ fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                    {property.property_type}
                  </Typography>
                </Stack>
                <Typography sx={{ fontSize: 32, fontWeight: 800, color: '#111827', mb: 1, lineHeight: 1.2 }}>
                  {property.property_name}
                </Typography>
                <Stack direction="row" sx={{ alignItems: 'center', gap: 0.5 }}>
                  <LocationOnOutlinedIcon sx={{ fontSize: 18, color: '#6B7280' }} />
                  <Typography sx={{ fontSize: 15, color: '#4B5563', fontWeight: 500 }}>
                    {[property.city, property.state, property.country].filter(Boolean).join(', ')}
                  </Typography>
                </Stack>
              </Box>
              <Box sx={{ bgcolor: status.bg, color: status.color, border: `1px solid ${status.border}`, fontSize: 13, fontWeight: 700, px: 2, py: 1, borderRadius: 2 }}>
                {status.label}
              </Box>
            </Stack>

            <Divider sx={{ my: 4, borderColor: '#F3F4F6' }} />

            {/* Quick Stats */}
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 4 }}>
              {[
                { icon: <BedOutlinedIcon sx={{ fontSize: 24, color: '#5E35B1' }} />, label: 'Bedrooms', value: `${property.bedrooms} Beds` },
                { icon: <PeopleOutlinedIcon sx={{ fontSize: 24, color: '#5E35B1' }} />, label: 'Capacity', value: `Max ${property.max_guests} Guests` }
              ].map((stat, idx) => (
                <Box key={idx} sx={{ flex: 1, minWidth: 160, bgcolor: '#FAFBFC', border: '1px solid #E5E7EB', borderRadius: 3, p: 2.5, display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box sx={{ bgcolor: '#FFFFFF', p: 1.5, borderRadius: 2, display: 'flex', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                    {stat.icon}
                  </Box>
                  <Box>
                    <Typography sx={{ fontSize: 12, color: '#6B7280', fontWeight: 600, textTransform: 'uppercase', mb: 0.2 }}>{stat.label}</Typography>
                    <Typography sx={{ fontSize: 16, fontWeight: 700, color: '#111827' }}>{stat.value}</Typography>
                  </Box>
                </Box>
              ))}
            </Box>

            {/* Description */}
            {property.description && (
              <Box sx={{ mb: 5 }}>
                <Typography sx={{ fontSize: 18, fontWeight: 800, color: '#111827', mb: 2 }}>About this space</Typography>
                <Box sx={{ bgcolor: '#FAFBFC', border: '1px solid #E5E7EB', borderRadius: 3, p: { xs: 2, md: 3 } }}>
                  <Typography
                    component="div"
                    sx={{
                      fontSize: 16,
                      color: '#000000',
                      lineHeight: 1.6,
                      '& p': { mt: 0, mb: 0.5 },
                      '& p:last-of-type': { mb: 0 },
                      '& p:empty': { display: 'none' }, 
                      '& ul, & ol': { mt: 0.5, mb: 1.5, pl: 3 },
                      '& ul:last-child, & ol:last-child': { mb: 0 }
                    }}
                    dangerouslySetInnerHTML={{
                      __html: DOMPurify.sanitize(property.description)
                    }}
                  />
                </Box>
              </Box>
            )}
            
            <Divider sx={{ my: 4, borderColor: '#F3F4F6' }} />

            {/* Amenities */}
            {amenities.length > 0 && (
              <Box sx={{ mb: 5 }}>
                <Typography sx={{ fontSize: 18, fontWeight: 800, color: '#111827', mb: 3 }}>What this place offers</Typography>
                <Grid container spacing={2}>
                  {amenities.map((amenity) => (
                    <Grid size={{ xs: 12, sm: 6, md: 4 }} key={amenity.id}>
                      <Stack direction="row" sx={{ alignItems: 'center', gap: 1.5, p: 2, bgcolor: '#FAFBFC', border: '1px solid #E5E7EB', borderRadius: 3 }}>
                        <Box sx={{ color: '#5E35B1', display: 'flex' }}>
                          <DynamicIcon iconUrl={amenity.iconUrl} isAmenity={true} />
                        </Box>
                        <Typography sx={{ fontSize: 14, color: '#111827', fontWeight: 600 }}>{amenity.name}</Typography>
                      </Stack>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            )}

            <Divider sx={{ my: 4, borderColor: '#F3F4F6' }} />

            {/* Location */}
            <Box>
              <Typography sx={{ fontSize: 18, fontWeight: 800, color: '#111827', mb: 2 }}>Exact Location</Typography>
              <Box sx={{ bgcolor: '#FAFBFC', border: '1px solid #E5E7EB', borderRadius: 3, p: 3 }}>
                <Typography sx={{ fontSize: 16, fontWeight: 700, color: '#111827', mb: 0.5 }}>{property.address}</Typography>
                <Typography sx={{ fontSize: 15, color: '#6B7280' }}>
                  {[property.city, property.state, property.country, property.pincode].filter(Boolean).join(', ')}
                </Typography>
              </Box>
            </Box>

          </Box>
        </Paper>

      </Box>
    </Box>
  );
}
