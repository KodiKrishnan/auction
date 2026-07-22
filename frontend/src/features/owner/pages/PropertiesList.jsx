import React, { useState, useEffect } from 'react';
import {
    Box, Typography, Button, Stack, Switch, Tooltip, Divider, TextField, InputAdornment, Skeleton, Pagination, Paper, IconButton
} from '@mui/material';
// 1. UPDATED IMPORT: Added useSearchParams
import { useNavigate, useSearchParams } from 'react-router-dom';

// Icons
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import MapsHomeWorkOutlinedIcon from '@mui/icons-material/MapsHomeWorkOutlined';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

import { useLoader } from "../../../context/LoaderContext";
import { useAuth } from "../../../context/AuthContext";
import { fetchOwnerProperties, updatePropertyStatus } from '../ownerAPI';

// ─── IMAGE HELPER LOGIC ───
const BACKEND_URL = import.meta.env.VITE_API_BASE_URL || "http://auction-api.theshortlistd.org";

const getImageUrl = (path) => {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    const cleanPath = path.replace(/^\/+/, '').replace(/\\/g, '/');
    return `${BACKEND_URL}/${cleanPath}`;
};

const STATUS_MAP = {
    1: { label: 'Active', bg: 'rgba(240, 253, 244, 0.95)', color: '#166534', border: '#BBF7D0' },
    2: { label: 'Draft', bg: 'rgba(255, 251, 235, 0.95)', color: '#92400E', border: '#FDE68A' },
    0: { label: 'Inactive', bg: 'rgba(249, 250, 251, 0.95)', color: '#4B5563', border: '#E5E7EB' },
};

function PropertyCardSkeleton() {
    return (
        <Paper elevation={0} sx={{ border: '1px solid #E5E7EB', borderRadius: 4, overflow: 'hidden' }}>
            <Skeleton variant="rectangular" height={200} />
            <Box sx={{ p: 3 }}>
                <Skeleton width="70%" height={28} sx={{ mb: 1 }} />
                <Skeleton width="40%" height={20} sx={{ mb: 2.5 }} />
                <Divider sx={{ mb: 2 }} />
                <Stack direction="row" spacing={1.5}>
                    <Skeleton variant="rounded" height={36} sx={{ flex: 1, borderRadius: 2 }} />
                    <Skeleton variant="rounded" height={36} sx={{ flex: 1, borderRadius: 2 }} />
                </Stack>
            </Box>
        </Paper>
    );
}

function PropertyCard({ property, onToggleStatus, onView, onEdit }) {
    const status = STATUS_MAP[property.status] || STATUS_MAP[2];
    const canToggle = property.status === 1 || property.status === 0 || property.status === 2;
    const hasValidImage = property.primaryImage && typeof property.primaryImage === 'string' && property.primaryImage.trim() !== '';

    const fullLocation = [property.city, property.state, property.country]
        .filter(Boolean)
        .join(', ');

    return (
        <Paper elevation={0} sx={{ border: '1px solid #E5E7EB', borderRadius: 4, overflow: 'hidden', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)', '&:hover': { boxShadow: '0px 12px 24px rgba(0, 0, 0, 0.08)', transform: 'translateY(-6px)', borderColor: '#D1D5DB' }, display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ position: 'relative', height: 200, bgcolor: '#F3F4F6', overflow: 'hidden' }}>
                <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, height: '50%', background: 'linear-gradient(180deg, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0) 100%)', zIndex: 1 }} />
                {hasValidImage ? (
                    <img src={getImageUrl(property.primaryImage)} alt={property.propertyName} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', transition: 'transform 0.5s ease', '&:hover': { transform: 'scale(1.05)' } }} onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/600x400/F3F4F6/9CA3AF?text=Image+Unavailable'; }} />
                ) : (
                    <Box sx={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 1 }}>
                        <MapsHomeWorkOutlinedIcon sx={{ fontSize: 48, color: '#D1D5DB' }} />
                        <Typography sx={{ fontSize: 13, color: 'text.secondary', fontWeight: 500 }}>No Image Added</Typography>
                    </Box>
                )}
                <Box sx={{ position: 'absolute', top: 12, left: 12, zIndex: 2, bgcolor: status.bg, color: status.color, border: `1px solid ${status.border}`, fontSize: 12, fontWeight: 700, px: 1.5, py: 0.5, borderRadius: 2, backdropFilter: 'blur(4px)' }}>{status.label}</Box>
                {canToggle && (
                    <Tooltip title={property.status === 1 ? 'Deactivate Listing' : 'Activate Listing'} placement="left">
                        <Box sx={{ position: 'absolute', top: 12, right: 12, zIndex: 2, bgcolor: 'rgba(255, 255, 255, 0.95)', borderRadius: 10, px: 0.5, py: 0.2, boxShadow: '0 2px 8px rgba(0,0,0,0.15)', backdropFilter: 'blur(4px)' }}>
                            <Switch size="small" checked={property.status === 1} onChange={() => onToggleStatus(property.propertyId, property.status)} sx={{ '& .MuiSwitch-switchBase.Mui-checked': { color: '#5E35B1' }, '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { bgcolor: '#5E35B1', opacity: 0.8 } }} />
                        </Box>
                    </Tooltip>
                )}
            </Box>
            <Box sx={{ p: 2.5, display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                <Typography sx={{ fontSize: 17, fontWeight: 700, color: '#111827', mb: 0.5, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{property.propertyName}</Typography>
                <Stack direction="row" sx={{ alignItems: 'center', gap: 0.8, mb: 2.5 }}>
                    <LocationOnOutlinedIcon sx={{ fontSize: 16, color: '#6B7280', flexShrink: 0 }} />
                    <Typography
                        title={fullLocation || 'Location pending'}
                        sx={{ fontSize: 13, color: '#4B5563', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: 500 }}
                    >
                        {fullLocation || 'Location pending'}
                    </Typography>
                </Stack>
                <Box sx={{ flexGrow: 1 }} />
                <Divider sx={{ mb: 2, borderColor: '#F3F4F6' }} />
                <Stack direction="row" spacing={1.5}>
                    <Button fullWidth startIcon={<VisibilityOutlinedIcon sx={{ fontSize: 18 }} />} onClick={() => onView(property.propertyId)} sx={{ fontSize: 13, fontWeight: 700, color: '#5E35B1', bgcolor: '#F5F3FF', textTransform: 'none', borderRadius: 2, py: 1, '&:hover': { bgcolor: '#EDE7F6' } }}>View</Button>
                    <Button fullWidth startIcon={<EditOutlinedIcon sx={{ fontSize: 18 }} />} onClick={() => onEdit(property.propertyId)} sx={{ fontSize: 13, fontWeight: 700, color: '#374151', bgcolor: 'transparent', textTransform: 'none', borderRadius: 2, py: 1, border: '1px solid #E5E7EB', '&:hover': { bgcolor: '#F9FAFB', borderColor: '#D1D5DB' } }}>Edit</Button>
                </Stack>
            </Box>
        </Paper>
    );
}

export default function PropertiesList() {
    const navigate = useNavigate();
    const { showLoader, hideLoader } = useLoader();
    const { user } = useAuth();

    const [searchParams, setSearchParams] = useSearchParams();

    // Read state dynamically from the URL (with default fallbacks)
    const search = searchParams.get('search') || '';
    const filterStatus = searchParams.get('status') || 'ALL';
    const page = Number(searchParams.get('page')) || 1;

    // FIX 1: Create a local state for the input so it doesn't lose focus
    const [searchInput, setSearchInput] = useState(search);

    const [properties, setProperties] = useState([]);
    const [loading, setLoading] = useState(true);
    const [totalCount, setTotalCount] = useState(0);
    const [counts, setCounts] = useState({ ALL: 0, 1: 0, 2: 0, 0: 0 });

    const limit = 10;

    const updateURL = (newParams) => {
        const params = new URLSearchParams(searchParams);

        Object.entries(newParams).forEach(([key, value]) => {
            if (value === '' || value === 'ALL' || (key === 'page' && value === 1)) {
                params.delete(key);
            } else {
                params.set(key, value);
            }
        });

        // Use replace: true so we don't fill browser history with junk
        setSearchParams(params, { replace: true });
    };

    // FIX 2: Update ONLY the local text box state when typing (Instantly, keeps focus)
    const handleSearchChange = (e) => {
        setSearchInput(e.target.value);
    };

    // FIX 3: Wait 500ms AFTER you stop typing to update the URL
    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            if (searchInput !== search) {
                updateURL({ search: searchInput, page: 1, status: filterStatus });
            }
        }, 500);

        return () => clearTimeout(delayDebounceFn);
    }, [searchInput, search, filterStatus]);


    // FIX 4: Fetch data immediately ONLY when the URL actually changes
    useEffect(() => {
        let isMounted = true;

        const loadProperties = async () => {
            setLoading(true);
            // NOTE: We removed showLoader() here because global loaders steal cursor focus! 
            // The Skeleton cards (loading state) are enough visual feedback.
            try {
                const res = await fetchOwnerProperties(page, limit, filterStatus, search);

                if (isMounted) {
                    setProperties(res.data?.properties || []);
                    setTotalCount(res.data?.total || 0);

                    if (res.data?.counts) {
                        setCounts(res.data.counts);
                    }
                }
            } catch (err) {
                console.error('Failed to load properties:', err);
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        loadProperties();

        return () => {
            isMounted = false;
        };
    }, [page, filterStatus, search]);

    const handleToggleStatus = async (id, currentStatus) => {
        const newStatus = currentStatus === 1 ? 0 : 1;
        try {
            showLoader();
            await updatePropertyStatus(id, newStatus);

            setProperties((prev) => prev.map((p) => p.propertyId === id ? { ...p, status: newStatus } : p));

            setCounts((prevCounts) => ({
                ...prevCounts,
                [currentStatus]: Math.max(0, (prevCounts[currentStatus] || 0) - 1),
                [newStatus]: (prevCounts[newStatus] || 0) + 1
            }));

        } catch (err) {
            console.error('Failed to update status:', err);
        } finally {
            hideLoader();
        }
    };

    const handlePageChange = (event, value) => {
        updateURL({ page: value });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleFilterChange = (key) => {
        updateURL({ status: key, page: 1, search: search });
    };

    const currentTabTotal = search ? totalCount : (counts[filterStatus] || 0);
    const pageCount = Math.ceil(currentTabTotal / limit);

    return (
        <Box sx={{ p: { xs: 2, md: 4 }, bgcolor: '#FAFBFC', minHeight: '100vh' }}>
            <Box sx={{ maxWidth: 1400, mx: 'auto' }}>

                <Stack direction="row" sx={{ alignItems: 'flex-start', justifyContent: 'space-between', mb: 4, flexWrap: 'wrap', gap: 2 }}>
                    <Stack direction="row" sx={{ alignItems: 'center', gap: 1.5 }}>
                        <Tooltip title="Go Back">
                            <IconButton onClick={() => navigate('/owner/dashboard')} sx={{ bgcolor: 'white', border: '1px solid #E5E7EB', '&:hover': { bgcolor: '#F3F4F6' }, mt: { xs: 0, md: 0.5 } }}>
                                <ArrowBackIcon sx={{ fontSize: 22, color: '#4B5563' }} />
                            </IconButton>
                        </Tooltip>
                        <Box>
                            <Typography sx={{ fontSize: 28, fontWeight: 800, color: '#111827', letterSpacing: '-0.02em', lineHeight: 1.1 }}>
                                Property Portfolio
                            </Typography>
                            <Typography sx={{ fontSize: 14, color: '#6B7280', mt: 0.8, fontWeight: 500 }}>
                                Manage your listings, update details, and track statuses. You have {counts.ALL} propert{counts.ALL !== 1 ? 'ies' : 'y'} total.
                            </Typography>
                        </Box>
                    </Stack>

                    <Button startIcon={<AddIcon />} onClick={() => navigate('/owner/properties/new')} sx={{ bgcolor: '#5E35B1', color: 'white', fontWeight: 700, fontSize: 14, textTransform: 'none', px: 3, py: 1.2, borderRadius: 2.5, boxShadow: '0 4px 12px rgba(94, 53, 177, 0.2)', '&:hover': { bgcolor: '#4527A0', boxShadow: '0 6px 16px rgba(94, 53, 177, 0.3)' } }}>
                        Add New Property
                    </Button>
                </Stack>

                {/* ─── COMBINED FILTER & SEARCH BAR ─── */}
                {(counts.ALL > 0 || searchInput !== '') && (
                    <Paper
                        elevation={0}
                        sx={{
                            p: 2,
                            mb: 4,
                            borderRadius: 3,
                            border: '1px solid #E5E7EB',
                            bgcolor: '#FAFAFA',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            flexWrap: 'wrap',
                            gap: 2
                        }}
                    >
                        {/* LEFT: Filter Tabs */}
                        <Stack
                            direction="row"
                            spacing={1}
                            sx={{
                                overflowX: 'auto',
                                pb: { xs: 1, md: 0 },
                                flexGrow: 1,
                                minWidth: 0
                            }}
                        >
                            {[
                                { key: 'ALL', label: 'All Listings' },
                                { key: '1', label: 'Active' },
                                { key: '2', label: 'Drafts' },
                                { key: '0', label: 'Inactive' }
                            ].map(({ key, label }) => (
                                <Box
                                    key={key}
                                    onClick={() => handleFilterChange(key)}
                                    sx={{
                                        px: 2.5,
                                        py: 1,
                                        borderRadius: 2,
                                        fontSize: 13,
                                        fontWeight: 600,
                                        cursor: 'pointer',
                                        transition: 'all 0.2s',
                                        border: '1px solid',
                                        borderColor: filterStatus === key ? '#5E35B1' : 'transparent',
                                        bgcolor: filterStatus === key ? '#F5F3FF' : '#F3F4F6',
                                        color: filterStatus === key ? '#5E35B1' : '#4B5563',
                                        whiteSpace: 'nowrap',
                                        '&:hover': {
                                            bgcolor: filterStatus === key ? '#EDE7F6' : '#E5E7EB'
                                        }
                                    }}
                                >
                                    {label}
                                    <Box component="span" sx={{ ml: 0.5, opacity: 0.7 }}>
                                        ({counts[key] || 0})
                                    </Box>
                                </Box>
                            ))}
                        </Stack>

                        {/* RIGHT: Search Box */}
                        <TextField
                            placeholder="Search properties..."
                            size="small"
                            value={searchInput}
                            onChange={handleSearchChange}
                            slotProps={{
                                input: {
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <SearchIcon sx={{ fontSize: 20, color: '#9CA3AF' }} />
                                        </InputAdornment>
                                    )
                                }
                            }}
                            sx={{
                                width: { xs: '100%', sm: 300 },
                                flexShrink: 0,
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: 2,
                                    bgcolor: 'white',
                                    '& fieldset': {
                                        borderColor: '#E5E7EB'
                                    },
                                    '&:hover fieldset': {
                                        borderColor: '#D1D5DB'
                                    },
                                    '&.Mui-focused fieldset': {
                                        borderColor: '#5E35B1'
                                    }
                                }
                            }}
                        />
                    </Paper>
                )}
                {loading ? (
                    <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 3 }}>
                        {[1, 2, 3, 4, 5, 6].map((i) => <PropertyCardSkeleton key={i} />)}
                    </Box>
                ) : properties.length === 0 ? (
                    <Paper elevation={0} sx={{ textAlign: 'center', py: 10, px: 3, borderRadius: 4, border: '2px dashed #E5E7EB', bgcolor: 'transparent' }}>
                        <MapsHomeWorkOutlinedIcon sx={{ fontSize: 64, color: '#D1D5DB', mb: 2 }} />

                        <Typography sx={{ fontSize: 18, fontWeight: 700, color: '#111827', mb: 1 }}>
                            {filterStatus === 'ALL' && !search ? 'Build your portfolio' : 'No properties found'}
                        </Typography>

                        <Typography sx={{ fontSize: 14, color: '#6B7280', mb: 4, maxWidth: 400, mx: 'auto' }}>
                            {filterStatus === 'ALL' && !search
                                ? 'You have not listed any properties yet. Add your first listing to start hosting auctions.'
                                : 'Try adjusting your search or filters to find what you are looking for.'}
                        </Typography>
                    </Paper>
                ) : (
                    <>
                        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 3, mb: 6 }}>
                            {properties.map((property) => (
                                <PropertyCard
                                    key={property.propertyId}
                                    property={property}
                                    onToggleStatus={handleToggleStatus}
                                    onView={(id) => navigate(`/owner/properties/${id}`)}
                                    onEdit={(id) => navigate(`/owner/properties/${id}/edit`)}
                                />
                            ))}
                        </Box>

                        {pageCount > 1 && (
                            <Stack direction="row" sx={{ justifyContent: 'center', mt: 2, mb: 4 }}>
                                <Pagination
                                    count={pageCount}
                                    page={page}
                                    onChange={handlePageChange}
                                    variant="outlined"
                                    shape="rounded"
                                    size="large"
                                    sx={{
                                        '& .MuiPaginationItem-root': { fontWeight: 600, borderColor: '#E5E7EB', color: '#4B5563' },
                                        '& .MuiPaginationItem-root.Mui-selected': { bgcolor: '#F5F3FF', color: '#5E35B1', borderColor: '#5E35B1', '&:hover': { bgcolor: '#EDE7F6' } }
                                    }}
                                />
                            </Stack>
                        )}
                    </>
                )}
            </Box>
        </Box>
    );
}

