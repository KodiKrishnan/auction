import React, { useState, useEffect } from "react";
import {
  Box, Typography, Button, Stack, Paper, Chip,
  IconButton, Tooltip, TextField, InputAdornment,
  Skeleton, Dialog, Collapse, Avatar, TablePagination, CircularProgress, Divider
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { Grid } from "@mui/material"; // Add Grid to your MUI imports
import FilterListIcon from '@mui/icons-material/FilterList'; // Add this icon

// Icons
import SearchIcon from "@mui/icons-material/Search";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import BlockIcon from "@mui/icons-material/Block";
import GavelIcon from "@mui/icons-material/Gavel";
import CalendarTodayOutlinedIcon from "@mui/icons-material/CalendarTodayOutlined";
import HomeWorkOutlinedIcon from "@mui/icons-material/HomeWorkOutlined";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import WarningAmberOutlinedIcon from "@mui/icons-material/WarningAmberOutlined";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import SwapVertIcon from '@mui/icons-material/SwapVert';

// Contexts & APIs
import { useLoader } from "../../../context/LoaderContext";
import { useError } from "../../../context/ErrorContext";
import useSuccessAlert from "../../../shared/hooks/useSuccessAlert";
import SuccessAlert from "../../../components/SuccessAlert";

import { fetchPropertiesWithAuctions, fetchAuctions, fetchAuctionCounts, cancelAuction } from "../ownerAPI";

const AUCTIONS_PER_PROPERTY_PAGE = 5;

const fmtCurrency = (val) => `₹${Number(val || 0).toLocaleString("en-IN")}`;

const fmtDate = (dateString) => {
  if (!dateString) return "—";
  return new Date(dateString).toLocaleDateString("en-IN", {
    day: "2-digit", month: "short", year: "numeric"
  });
};

const fmtDateTime = (dateString) => {
  if (!dateString) return "—";
  return new Date(dateString).toLocaleString("en-IN", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit", hour12: true
  });
};

const premiumTextField = {
  "& .MuiOutlinedInput-root": {
    borderRadius: 2,
    bgcolor: "#F9FAFB",
    fontSize: 14,
    "&:hover fieldset": { borderColor: "#D1D5DB" },
    "&.Mui-focused fieldset": { borderColor: "#5E35B1" },
    "&.Mui-focused": { bgcolor: "white" },
  },
  "& .MuiInputLabel-root.Mui-focused": { color: "#5E35B1" },
};

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const getMonthDateRange = (monthIndex) => {
  const year = new Date().getFullYear(); // Always uses the current year

  const startDate = new Date(year, monthIndex, 1);
  const endDate = new Date(year, monthIndex + 1, 0);

  const formatYYYYMMDD = (d) => {
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${d.getFullYear()}-${mm}-${dd}`;
  };

  return {
    stayFrom: formatYYYYMMDD(startDate),
    stayTo: formatYYYYMMDD(endDate)
  };
};


// Status Chip
function StatusChip({ status }) {
  const s = status?.toUpperCase();
  const config = {
    UPCOMING: { bg: "#EFF6FF", color: "#1D4ED8", border: "#BFDBFE", label: "UPCOMING" },
    OPEN: { bg: "#F0FDF4", color: "#166534", border: "#BBF7D0", label: "OPEN" },
    CANCELLED: { bg: "#FEF2F2", color: "#991B1B", border: "#FECACA", label: "CANCELLED" },
    CLOSED: { bg: "#F9FAFB", color: "#374151", border: "#E5E7EB", label: "CLOSED" },
  }[s] || { bg: "#F9FAFB", color: "#374151", border: "#E5E7EB", label: status || "UNKNOWN" };

  return (
    <Chip label={config.label} size="small" sx={{
      fontWeight: 700, fontSize: 11, letterSpacing: 0.5,
      bgcolor: config.bg, color: config.color,
      border: `1px solid ${config.border}`,
      borderRadius: 1.5, height: 24, px: 0.5
    }} />
  );
}

// Auction Card 
function AuctionCard({ auction, onCancel }) {
  const statusUpper = auction.auctionStatus?.toUpperCase();
  const isCancellable = statusUpper === "OPEN" || statusUpper === "UPCOMING";

  return (
    <Box sx={{
      p: { xs: 2, md: 2.5 },
      border: "1px solid",
      borderColor: isCancellable ? "#E5E7EB" : "#F3F4F6",
      borderRadius: 2,
      bgcolor: "white",
      transition: "all 0.2s",
      "&:hover": isCancellable ? { borderColor: "#D1D5DB", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" } : {},
    }}>
      <Stack direction={{ xs: "column", md: "row" }} spacing={2} sx={{ alignItems: { xs: "flex-start", md: "center" } }}>

        <Box sx={{ flex: 1.5, minWidth: 0, width: "100%" }}>
          <Typography sx={{ fontSize: 14, fontWeight: 700, color: "#111827" }}>
            {auction.ruleName || "—"}
          </Typography>
        </Box>

        <Box sx={{ flex: 1.5, minWidth: 0, width: "100%" }}>
          <Typography sx={{ fontSize: 14, fontWeight: 700, color: "#111827" }}>
            Opens: {fmtDateTime(auction.bidOpenDate)}
          </Typography>
          <Typography sx={{ fontSize: 13, color: "#6B7280", mt: 0.2 }}>
            Closes: {fmtDateTime(auction.bidCloseDate)}
          </Typography>
        </Box>

        <Box sx={{ flex: 1.5, minWidth: 0, width: "100%" }}>
          <Stack direction="row" spacing={1.2} sx={{ alignItems: "flex-start" }}>
            <CalendarTodayOutlinedIcon sx={{ fontSize: 18, color: "#111827", mt: 0.2 }} />
            <Box>
              <Typography sx={{ fontSize: 14, fontWeight: 700, color: "#111827" }}>
                {fmtDate(auction.stayStartDate)}
              </Typography>
              <Typography sx={{ fontSize: 13, color: "#6B7280", mt: 0.2 }}>
                To {fmtDate(auction.stayEndDate)}
              </Typography>
            </Box>
          </Stack>
        </Box>

        <Box sx={{ flex: 1, minWidth: 0, width: "100%" }}>
          <Typography sx={{ fontSize: 15, fontWeight: 700, color: "#111827" }}>
            {fmtCurrency(auction.baseCost)}
          </Typography>
          <Typography sx={{ fontSize: 13, color: "#10B981", fontWeight: 500, mt: 0.2 }}>
            +{fmtCurrency(auction.bidIncrement)} Inc.
          </Typography>
        </Box>

        <Box sx={{ flex: 0.8, minWidth: 0, width: "100%" }}>
          <StatusChip status={auction.auctionStatus} />
        </Box>

        <Box sx={{ width: { xs: "100%", md: 100 }, display: "flex", justifyContent: { xs: "flex-start", md: "flex-end" }, flexShrink: 0 }}>
          {isCancellable ? (
            <Button
              variant="outlined"
              size="small"
              startIcon={<BlockIcon sx={{ fontSize: 16 }} />}
              onClick={() => onCancel(auction)}
              sx={{
                borderRadius: 5,
                textTransform: "none",
                fontWeight: 600, fontSize: 13,
                color: "#DC2626", borderColor: "#FCA5A5",
                py: 0.5, px: 2,
                "&:hover": { bgcolor: "#FEF2F2", borderColor: "#DC2626" }
              }}
            >
              Cancel
            </Button>

          ) : (
            <Typography sx={{ fontSize: 13, color: "#D1D5DB", fontStyle: "italic" }}>
              —
            </Typography>
          )}
        </Box>
        <Box sx={{ width: 40, display: { xs: "none", md: "block" }, flexShrink: 0 }} />

      </Stack>
    </Box>
  );
}

// Per-Property Mini Pagination
function MiniPagination({ page, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;

  return (
    <Stack direction="row" spacing={0.5} sx={{ alignItems: "center", justifyContent: "center", pt: 1 }}>
      <IconButton
        size="small"
        disabled={page === 0}
        onClick={() => onPageChange(page - 1)}
        sx={{
          width: 28, height: 28,
          border: "1px solid #E5E7EB", borderRadius: 1.5,
          color: page === 0 ? "#D1D5DB" : "#5E35B1",
          "&:hover": { bgcolor: page === 0 ? "transparent" : "#F5F3FF", borderColor: page === 0 ? "#E5E7EB" : "#5E35B1" }
        }}
      >
        <ChevronLeftIcon sx={{ fontSize: 16 }} />
      </IconButton>

      {Array.from({ length: totalPages }, (_, i) => (
        <Box
          key={i}
          onClick={() => onPageChange(i)}
          sx={{
            width: 28, height: 28,
            display: "flex", alignItems: "center", justifyContent: "center",
            borderRadius: 1.5, cursor: "pointer",
            border: "1px solid",
            borderColor: page === i ? "#5E35B1" : "#E5E7EB",
            bgcolor: page === i ? "#5E35B1" : "white",
            color: page === i ? "white" : "#374151",
            fontSize: 12, fontWeight: page === i ? 700 : 500,
            transition: "all 0.15s",
            "&:hover": {
              bgcolor: page === i ? "#4527A0" : "#F5F3FF",
              borderColor: "#5E35B1",
              color: page === i ? "white" : "#5E35B1"
            }
          }}
        >
          {i + 1}
        </Box>
      ))}

      <IconButton
        size="small"
        disabled={page >= totalPages - 1}
        onClick={() => onPageChange(page + 1)}
        sx={{
          width: 28, height: 28,
          border: "1px solid #E5E7EB", borderRadius: 1.5,
          color: page >= totalPages - 1 ? "#D1D5DB" : "#5E35B1",
          "&:hover": { bgcolor: page >= totalPages - 1 ? "transparent" : "#F5F3FF", borderColor: page >= totalPages - 1 ? "#E5E7EB" : "#5E35B1" }
        }}
      >
        <ChevronRightIcon sx={{ fontSize: 16 }} />
      </IconButton>
    </Stack>
  );
}

// DYNAMIC PROPERTY GROUP 
function DynamicPropertyGroup({ property, statusFilter, search, onCancel, cancelledAuctionId }) {
  const [expanded, setExpanded] = useState(false);
  const baseUrl = import.meta.env.VITE_API_BASE_URL;

  // Internal Data State
  const [auctions, setAuctions] = useState([]);
  const [loading, setLoading] = useState(false);

  // Internal Pagination State
  const [internalPage, setInternalPage] = useState(0);
  const [totalAuctions, setTotalAuctions] = useState(0);
  const [sortOrder, setSortOrder] = useState("DESC");

  // Inner Filters State
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({ ruleName: '', stayFrom: '', stayTo: '', minCost: '', maxCost: '' });
  const [appliedFilters, setAppliedFilters] = useState({ ruleName: '', stayFrom: '', stayTo: '', minCost: '', maxCost: '' });

  // === NEW: State for Active Month Chip ===
  const [activeMonth, setActiveMonth] = useState(null);

  // 1. Fetch data when expanded, page, status, search, or APPLIED filters change
  useEffect(() => {
    if (expanded) {
      loadAuctions();
    }
  }, [expanded, internalPage, statusFilter, search, sortOrder, appliedFilters]);

  useEffect(() => {
    if (cancelledAuctionId) {
      setAuctions(prevAuctions =>
        prevAuctions.map(auction =>
          auction.auctionId === cancelledAuctionId
            ? { ...auction, auctionStatus: "CANCELLED" }
            : auction
        )
      );
    }
  }, [cancelledAuctionId]);

  const loadAuctions = async () => {
    setLoading(true);
    try {
      const currentId = property.propertyId || property.id;
      const res = await fetchAuctions(internalPage + 1, AUCTIONS_PER_PROPERTY_PAGE, statusFilter, search, currentId, sortOrder, appliedFilters);

      const items = res?.auctions || res?.content || res?.data || [];
      const total = res?.totalElements || res?.total || items.length || 0;

      setAuctions(items);
      setTotalAuctions(total);
    } catch (err) {
      console.error("Failed to load auctions for property:", property.propertyName);
    } finally {
      setLoading(false);
    }
  };

  // Filter Handlers
  const handleApplyFilters = () => {
    setInternalPage(0); // Reset to page 1
    setAppliedFilters(filters);
    setShowFilters(false);
  };

  const handleClearFilters = () => {
    const emptyFilters = { ruleName: '', stayFrom: '', stayTo: '', minCost: '', maxCost: '' };
    setFilters(emptyFilters);
    setAppliedFilters(emptyFilters);
    setActiveMonth(null); // Clear the active month chip
    setInternalPage(0);
  };

  // === NEW: Remove a single filter ===
  const handleRemoveSingleFilter = (filterKey) => {
    const newFilters = { ...filters, [filterKey]: '' };
    setFilters(newFilters);
    setAppliedFilters(newFilters);
    setInternalPage(0);
    if (filterKey === 'stayFrom' || filterKey === 'stayTo') {
      setActiveMonth(null);
    }
  };

  const totalPages = Math.ceil(totalAuctions / AUCTIONS_PER_PROPERTY_PAGE);
  const startNum = internalPage * AUCTIONS_PER_PROPERTY_PAGE + 1;
  const endNum = Math.min((internalPage + 1) * AUCTIONS_PER_PROPERTY_PAGE, totalAuctions);

  return (
    <Paper elevation={0} sx={{ border: "1px solid #E5E7EB", borderRadius: 3, overflow: "hidden", mb: 2 }}>
      <Box
        onClick={() => setExpanded(p => !p)}
        sx={{
          px: 3, py: 2,
          bgcolor: expanded ? "#F5F3FF" : "white",
          borderBottom: expanded ? "1px solid #EDE7F6" : "none",
          cursor: "pointer",
          transition: "background 0.2s",
          "&:hover": { bgcolor: "#F5F3FF" }
        }}
      >
        <Stack direction="row" sx={{ alignItems: "center", justifyContent: "space-between" }}>
          <Stack direction="row" spacing={2} sx={{ alignItems: "center", minWidth: 0 }}>
            <Avatar
              variant="rounded"
              src={property.primaryImage ? `${baseUrl}${property.primaryImage}` : ""}
              sx={{ width: 50, height: 50, bgcolor: "#5E35B1", borderRadius: 2, flexShrink: 0, fontSize: 16, fontWeight: 800 }}
            >
              {!property.primaryImage && (property.propertyName?.[0] || <HomeWorkOutlinedIcon />)}
            </Avatar>
            <Box sx={{ minWidth: 0 }}>
              <Stack direction="row" spacing={1.5} sx={{ alignItems: "center", flexWrap: "wrap" }}>
                <Typography sx={{ fontSize: 15, fontWeight: 800, color: "#1E1154", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {property.propertyName || property.name}
                </Typography>
                {(property.city || property.state || property.country) && (
                  <Typography sx={{ fontSize: 12, color: "text.secondary", fontWeight: 500 }}>
                    • {[property.city, property.state, property.country].filter(Boolean).join(", ")}
                  </Typography>
                )}
              </Stack>
              <Typography sx={{ fontSize: 12, color: "text.secondary", mt: 0.3 }}>
                Click to view auction schedule
              </Typography>
            </Box>
          </Stack>
          <IconButton size="small" sx={{ color: "#5E35B1", bgcolor: expanded ? "white" : "#F5F3FF", border: "1px solid #EDE7F6", flexShrink: 0 }}>
            {expanded ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
          </IconButton>
        </Stack>
      </Box>

      <Collapse in={expanded}>
        <Box sx={{ p: 2.5 }}>

          {/* === ALIGNED FILTER ROW === */}
          <Stack direction="row" spacing={2} sx={{ alignItems: "center", justifyContent: "space-between", mb: 2, flexWrap: "wrap", rowGap: 1 }}>

            {/* Left Side: Active Filters */}
            <Box sx={{ flex: 1, minWidth: 0 }}>
              {Object.values(appliedFilters).some(val => val !== '') && (
                <Box sx={{ p: 1.5, bgcolor: "#F5F3FF", borderRadius: 2, border: "1px dashed #EDE7F6" }}>
                  <Stack direction="row" spacing={1} sx={{ alignItems: "center", flexWrap: "wrap", rowGap: 1 }}>
                    <Typography sx={{ fontSize: 12, fontWeight: 700, color: "#5E35B1", mr: 1, textTransform: "uppercase" }}>
                      Active Filters:
                    </Typography>
                    {appliedFilters.ruleName && <Chip label={`Rule: ${appliedFilters.ruleName}`} size="small" onDelete={() => handleRemoveSingleFilter('ruleName')} sx={{ bgcolor: "white", border: "1px solid #D1D5DB", fontSize: 12, fontWeight: 600 }} />}
                    {appliedFilters.stayFrom && <Chip label={`From: ${fmtDate(appliedFilters.stayFrom)}`} size="small" onDelete={() => handleRemoveSingleFilter('stayFrom')} sx={{ bgcolor: "white", border: "1px solid #D1D5DB", fontSize: 12, fontWeight: 600 }} />}
                    {appliedFilters.stayTo && <Chip label={`To: ${fmtDate(appliedFilters.stayTo)}`} size="small" onDelete={() => handleRemoveSingleFilter('stayTo')} sx={{ bgcolor: "white", border: "1px solid #D1D5DB", fontSize: 12, fontWeight: 600 }} />}
                    {appliedFilters.minCost && <Chip label={`Min: ₹${appliedFilters.minCost}`} size="small" onDelete={() => handleRemoveSingleFilter('minCost')} sx={{ bgcolor: "white", border: "1px solid #D1D5DB", fontSize: 12, fontWeight: 600 }} />}
                    {appliedFilters.maxCost && <Chip label={`Max: ₹${appliedFilters.maxCost}`} size="small" onDelete={() => handleRemoveSingleFilter('maxCost')} sx={{ bgcolor: "white", border: "1px solid #D1D5DB", fontSize: 12, fontWeight: 600 }} />}
                    <Button size="small" onClick={handleClearFilters} sx={{ textTransform: "none", fontSize: 12, color: "#6B7280", minWidth: "auto", p: 0.5, "&:hover": { color: "#DC2626", bgcolor: "transparent" } }}>Clear All</Button>
                  </Stack>
                </Box>
              )}
            </Box>

            {/* Right Side: Filter Button */}
            <Box sx={{ flexShrink: 0 }}>
              <Button
                size="small"
                variant={showFilters ? "contained" : "outlined"}
                startIcon={<FilterListIcon fontSize="small" />}
                onClick={() => setShowFilters(!showFilters)}
                sx={{
                  borderRadius: 1.5, textTransform: "none", fontWeight: 600,
                  bgcolor: showFilters ? "#5E35B1" : "transparent",
                  color: showFilters ? "white" : "#5E35B1",
                  borderColor: showFilters ? "#5E35B1" : "#E5E7EB",
                  "&:hover": { bgcolor: showFilters ? "#4527A0" : "#F5F3FF" }
                }}
              >
                Filter
              </Button>
            </Box>

          </Stack>
          {/* ================================ */}

          <Collapse in={showFilters}>
            <Paper elevation={0} sx={{ p: 2, mb: 3, bgcolor: "#F9FAFB", border: "1px solid #E5E7EB", borderRadius: 2 }}>

              {/* === NEW: QUICK MONTH FILTER UI === */}
              <Box sx={{ mb: 3 }}>
                <Typography sx={{ fontSize: 12, fontWeight: 700, color: "#374151", textTransform: "uppercase", mb: 1.5 }}>
                  Quick Filter by Month
                </Typography>
                <Stack direction="row" sx={{ flexWrap: "wrap", gap: 1 }}>
                  {MONTHS.map((month, index) => (
                    <Chip
                      key={month}
                      label={month}
                      onClick={() => {
                        if (activeMonth === index) {
                          setActiveMonth(null);
                          setFilters(prev => ({ ...prev, stayFrom: '', stayTo: '' }));
                        } else {
                          setActiveMonth(index);
                          const { stayFrom, stayTo } = getMonthDateRange(index);
                          setFilters(prev => ({ ...prev, stayFrom, stayTo }));
                        }
                      }}
                      sx={{
                        bgcolor: activeMonth === index ? "#5E35B1" : "white",
                        color: activeMonth === index ? "white" : "#4B5563",
                        border: "1px solid",
                        borderColor: activeMonth === index ? "#5E35B1" : "#D1D5DB",
                        fontWeight: 600,
                        cursor: "pointer",
                        transition: "all 0.2s",
                        "&:hover": {
                          bgcolor: activeMonth === index ? "#4527A0" : "#F5F3FF",
                          borderColor: "#5E35B1",
                          color: activeMonth === index ? "white" : "#5E35B1"
                        }
                      }}
                    />
                  ))}
                </Stack>
              </Box>
              <Divider sx={{ mb: 3, borderColor: "#E5E7EB" }} />
              {/* ================================== */}

              <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth size="small" label="Rule Name"
                    placeholder="e.g., Summer weekend"
                    value={filters.ruleName}
                    onChange={(e) => setFilters(prev => ({ ...prev, ruleName: e.target.value }))}
                    sx={premiumTextField}
                  />
                </Grid>

                <Grid item xs={6} md={2}>
                  <TextField
                    fullWidth size="small" label="Stay From" type="date"
                    value={filters.stayFrom}
                    onChange={(e) => {
                      setFilters(prev => ({ ...prev, stayFrom: e.target.value }));
                      setActiveMonth(null); // Clear chip if user types manually
                    }}
                    slotProps={{ inputLabel: { shrink: true } }}
                    sx={premiumTextField}
                  />
                </Grid>
                <Grid item xs={6} md={2}>
                  <TextField
                    fullWidth size="small" label="Stay To" type="date"
                    value={filters.stayTo}
                    onChange={(e) => {
                      setFilters(prev => ({ ...prev, stayTo: e.target.value }));
                      setActiveMonth(null); // Clear chip if user types manually
                    }}
                    slotProps={{ inputLabel: { shrink: true } }}
                    sx={premiumTextField}
                  />
                </Grid>

                <Grid item xs={6} md={2}>
                  <TextField
                    fullWidth size="small" label="Min Cost (₹)" type="number"
                    value={filters.minCost}
                    onChange={(e) => setFilters(prev => ({ ...prev, minCost: e.target.value }))}
                    sx={premiumTextField}
                  />
                </Grid>
                <Grid item xs={6} md={2}>
                  <TextField
                    fullWidth size="small" label="Max Cost (₹)" type="number"
                    value={filters.maxCost}
                    onChange={(e) => setFilters(prev => ({ ...prev, maxCost: e.target.value }))}
                    sx={premiumTextField}
                  />
                </Grid>
              </Grid>

              <Stack direction="row" spacing={1} sx={{ mt: 2, justifyContent: "flex-end" }}>
                <Button
                  size="small" color="inherit"
                  onClick={handleClearFilters}
                >
                  Clear
                </Button>
                <Button
                  variant="contained" size="small"
                  onClick={handleApplyFilters}
                  sx={{ bgcolor: "#5E35B1", "&:hover": { bgcolor: "#4527A0" }, borderRadius: 1.5 }}
                >
                  Apply Filters
                </Button>
              </Stack>
            </Paper>
          </Collapse>

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress size={24} sx={{ color: "#5E35B1" }} />
            </Box>
          ) : auctions.length === 0 ? (
            <Typography sx={{ p: 3, textAlign: 'center', color: 'text.secondary', fontSize: 13 }}>
              {Object.values(appliedFilters).some(v => v !== '')
                ? "No auctions match your filters for this property."
                : "No auctions scheduled for this property."}
            </Typography>
          ) : (
            <>
              <Box sx={{ display: { xs: "none", md: "block" }, px: 2.5, pb: 2 }}>
                <Stack direction="row" spacing={2} sx={{ alignItems: "center" }}>
                  <Typography sx={{ flex: 1.5, fontSize: 12, fontWeight: 800, color: "#374151", textTransform: "uppercase", letterSpacing: 0.5 }}>Applied Rule</Typography>
                  <Typography sx={{ flex: 1.5, fontSize: 12, fontWeight: 800, color: "#374151", textTransform: "uppercase", letterSpacing: 0.5 }}>Bidding Window</Typography>
                  <Typography sx={{ flex: 1.5, fontSize: 12, fontWeight: 800, color: "#374151", textTransform: "uppercase", letterSpacing: 0.5 }}>Stay Dates</Typography>
                  <Typography sx={{ flex: 1, fontSize: 12, fontWeight: 800, color: "#374151", textTransform: "uppercase", letterSpacing: 0.5 }}>Base / Bid Inc.</Typography>
                  <Typography sx={{ flex: 0.8, fontSize: 12, fontWeight: 800, color: "#374151", textTransform: "uppercase", letterSpacing: 0.5 }}>Status</Typography>
                  <Box sx={{ width: 100, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <Typography sx={{ fontSize: 12, fontWeight: 800, color: "#374151", textTransform: "uppercase", letterSpacing: 0.5 }}>Actions</Typography>
                  </Box>
                  <Box sx={{ width: 40, display: "flex", justifyContent: "flex-end" }}>
                    <Tooltip title={sortOrder === "DESC" ? "Sort: Latest First" : "Sort: Earliest First"} placement="top">
                      <IconButton
                        onClick={() => {
                          setInternalPage(0);
                          setSortOrder(prev => prev === "DESC" ? "ASC" : "DESC");
                        }}
                        size="small"
                        sx={{
                          bgcolor: "#F5F3FF",
                          color: "#5E35B1",
                          border: "1px solid #EDE7F6",
                          transition: "transform 0.3s ease",
                          transform: sortOrder === "ASC" ? "rotate(180deg)" : "none",
                          "&:hover": { bgcolor: "#EDE7F6" }
                        }}
                      >
                        <SwapVertIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>

                </Stack>
              </Box>

              <Stack spacing={1.5}>
                {auctions.map((auction) => (
                  <AuctionCard key={auction.auctionId} auction={auction} onCancel={onCancel} />
                ))}
              </Stack>

              {totalPages > 1 && (
                <Box sx={{ mt: 2.5, pt: 2, borderTop: "1px solid #F3F4F6" }}>
                  <Stack direction="row" sx={{ alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 1 }}>

                    <Typography sx={{ fontSize: 12, color: "text.secondary", fontWeight: 500 }}>
                      Showing{" "}
                      <Box component="span" sx={{ fontWeight: 700, color: "#5E35B1" }}>
                        {startNum}–{endNum}
                      </Box>
                      {" "}of{" "}
                      <Box component="span" sx={{ fontWeight: 700, color: "#5E35B1" }}>
                        {totalAuctions}
                      </Box>
                      {" "}auctions
                    </Typography>

                    <MiniPagination
                      page={internalPage}
                      totalPages={totalPages}
                      onPageChange={(newPage) => setInternalPage(newPage)}
                    />

                  </Stack>
                </Box>
              )}
            </>
          )}
        </Box>
      </Collapse>
    </Paper>
  );
}
// Skeleton Group 
function SkeletonGroup() {
  return (
    <Paper elevation={0} sx={{ border: "1px solid #E5E7EB", borderRadius: 3, overflow: "hidden", mb: 2 }}>
      <Box sx={{ px: 3, py: 2, bgcolor: "#F9FAFB" }}>
        <Stack direction="row" spacing={2} sx={{ alignItems: "center" }}>
          <Skeleton variant="rounded" width={44} height={44} sx={{ borderRadius: 2 }} />
          <Box sx={{ flex: 1 }}>
            <Skeleton width={200} height={20} sx={{ mb: 0.5 }} />
            <Skeleton width={100} height={14} />
          </Box>
        </Stack>
      </Box>
    </Paper>
  );
}

// Main Page 
export default function AuctionsPage() {
  const navigate = useNavigate();
  const { showLoader, hideLoader } = useLoader();
  const { showError } = useError();
  const { open: alertOpen, message: alertMsg, showSuccess, closeSuccess } = useSuccessAlert();

  // Outer State: Properties
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  // Global Filters
  const [counts, setCounts] = useState({ total: 0, open: 0, upcoming: 0, closed: 0, cancelled: 0 });
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  // Pagination for Properties
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalProperties, setTotalProperties] = useState(0);

  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [selectedAuction, setSelectedAuction] = useState(null);


  const [cancelledAuctionId, setCancelledAuctionId] = useState(null);

  // Fetch Properties (Outer List) using NEW API 
  const loadProperties = async () => {
    setLoading(true);
    try {
      const [res, countsData] = await Promise.all([
        // ONLY RETURNS ACTIVE PROPERTIES
        fetchPropertiesWithAuctions(page + 1, rowsPerPage, statusFilter, search),
        fetchAuctionCounts()
      ]);

      const items = res?.data?.properties || res?.properties || res?.content || res?.data || [];
      const total = res?.data?.total || res?.total || res?.totalElements || items.length || 0;

      setProperties(items);
      setTotalProperties(total);
       setCounts(countsData || { total: 0, open: 0, upcoming: 0, closed: 0, cancelled: 0 });
    } catch (err) {
      showError(err || "Failed to load properties.");
    } finally {
      setLoading(false);
    }
  };

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => setSearch(searchInput), 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  useEffect(() => {
    setPage(0);
  }, [search, statusFilter]);

  useEffect(() => {
    loadProperties();
  }, [search, statusFilter, page, rowsPerPage]);

  const handleConfirmCancel = async () => {
    if (!selectedAuction) return;
    showLoader();
    try {
      await cancelAuction(selectedAuction.auctionId);
      showSuccess("Auction cancelled successfully.");

      setCancelledAuctionId(selectedAuction.auctionId);

      setCancelDialogOpen(false);
      setSelectedAuction(null);

      // Update global stats silently
      const countsData = await fetchAuctionCounts();
      setCounts(countsData || { total: 0, open: 0, upcoming: 0, closed: 0, cancelled: 0 });
    } catch (err) {
      showError(err || "Failed to cancel.");
    } finally {
      hideLoader();
    }
  };

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, bgcolor: "#FAFBFC", minHeight: "100vh" }}>
      <SuccessAlert open={alertOpen} message={alertMsg} onClose={closeSuccess} />

      <Box sx={{ width: "100%", maxWidth: "100%", mx: "0" }}>

        <Stack direction="row" sx={{ alignItems: "flex-start", justifyContent: "space-between", mb: 4, flexWrap: "wrap", gap: 2 }}>
          <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
            <Tooltip title="Back to Dashboard">
              <IconButton onClick={() => navigate("/owner/dashboard")} sx={{ bgcolor: "white", border: "1px solid #E5E7EB", "&:hover": { bgcolor: "#F3F4F6" } }}>
                <ArrowBackIcon sx={{ fontSize: 20, color: "#4B5563" }} />
              </IconButton>
            </Tooltip>
            <Box>
              <Typography variant="h4" sx={{ fontSize: { xs: 22, md: 28 }, letterSpacing: "-0.02em", lineHeight: 1.1 }}>
                Live Auctions
              </Typography>
              <Typography sx={{ fontSize: 14, color: "text.secondary", mt: 0.5, fontWeight: 500 }}>
                Manage auctions across all active properties
              </Typography>
            </Box>
          </Stack>
        </Stack>

        <Paper elevation={0} sx={{ p: 2, mb: 3, borderRadius: 3, border: "1px solid #E5E7EB", bgcolor: "white" }}>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ alignItems: { sm: "center" }, justifyContent: "space-between" }}>
            <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap" }}>
              {[
                { key: "ALL", label: "All", count: counts.total },
                 { key: "UPCOMING", label: "Upcoming", count: counts.upcoming },
                { key: "OPEN", label: "Open", count: counts.open },
                { key: "CLOSED", label: "Closed", count: counts.closed },
                { key: "CANCELLED", label: "Cancelled", count: counts.cancelled },
              ].map(({ key, label, count }) => (
                <Box
                  key={key}
                  onClick={() => setStatusFilter(key)}
                  sx={{
                    px: 2.5, py: 1, borderRadius: 2,
                    fontSize: 13, fontWeight: 600, cursor: "pointer", transition: "all 0.2s",
                    border: "1px solid",
                    borderColor: statusFilter === key ? "#5E35B1" : "transparent",
                    bgcolor: statusFilter === key ? "#F5F3FF" : "#F3F4F6",
                    color: statusFilter === key ? "#5E35B1" : "#4B5563",
                    "&:hover": { bgcolor: statusFilter === key ? "#EDE7F6" : "#E5E7EB" }
                  }}
                >
                  {label} <Box component="span" sx={{ opacity: 0.6 }}>({count || 0})</Box>
                </Box>
              ))}
            </Stack>

            <TextField
              placeholder="Search properties..."
              size="small"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ color: "#9CA3AF", fontSize: 18 }} />
                    </InputAdornment>
                  )
                }
              }}
              sx={{
                width: { xs: "100%", sm: 280 },
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2, bgcolor: "#F9FAFB", fontSize: 14,
                  "& fieldset": { borderColor: "#E5E7EB" },
                  "&:hover fieldset": { borderColor: "#D1D5DB" },
                  "&.Mui-focused fieldset": { borderColor: "#5E35B1" },
                }
              }}
            />
          </Stack>
        </Paper>

        {/* Content */}
        {loading ? (
          Array.from({ length: rowsPerPage }).map((_, i) => <SkeletonGroup key={i} />)
        ) : properties.length === 0 ? (
          <Paper elevation={0} sx={{ textAlign: "center", py: 10, border: "2px dashed #E5E7EB", borderRadius: 3, bgcolor: "transparent" }}>
            <HomeWorkOutlinedIcon sx={{ fontSize: 56, color: "#D1D5DB", mb: 2, display: "block", mx: "auto" }} />
            <Typography sx={{ fontSize: 17, fontWeight: 700, color: "#111827", mb: 0.5 }}>
              No active auctions found
            </Typography>
            <Typography sx={{ fontSize: 14, color: "text.secondary" }}>
              {search ? "Try adjusting your search." : "Properties will appear here once their rule mappings trigger auctions."}
            </Typography>
          </Paper>
        ) : (
          <>
            <Box sx={{ mb: 2 }}>
              <Typography sx={{ fontSize: 13, color: "text.secondary", fontWeight: 600 }}>
                Viewing propert{properties.length !== 1 ? "ies" : "y"} {startNum(page, rowsPerPage)}–{endNum(page, rowsPerPage, totalProperties)} of {totalProperties}
              </Typography>
            </Box>

            {/* DYNAMIC PROPERTY GROUPS */}
            {properties.map((property) => (
              <DynamicPropertyGroup
                key={property.propertyId || property.id}
                property={property}
                statusFilter={statusFilter}
                search={search}
                onCancel={(auction) => { setSelectedAuction(auction); setCancelDialogOpen(true); }}
                cancelledAuctionId={cancelledAuctionId}
              />
            ))}

            {/* MASTER PAGINATION (For Properties) */}
            {totalProperties > rowsPerPage && (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4, mb: 6 }}>
                <TablePagination
                  component="div"
                  count={totalProperties}
                  page={page}
                  onPageChange={(e, p) => setPage(p)}
                  rowsPerPage={rowsPerPage}
                  onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
                  rowsPerPageOptions={[5, 10, 25]}
                  sx={{ borderTop: "none", ".MuiTablePagination-toolbar": { pl: 0 } }}
                />
              </Box>
            )}
          </>
        )}

      </Box>

      {/* Cancel Dialog  */}
      <Dialog
        open={cancelDialogOpen}
        onClose={() => { setCancelDialogOpen(false); setSelectedAuction(null); }}
        PaperProps={{ sx: { borderRadius: 3, maxWidth: 420 } }}
      >
        <Box sx={{ p: 3, textAlign: "center" }}>
          <Box sx={{ width: 52, height: 52, borderRadius: "50%", bgcolor: "#FEF2F2", display: "flex", alignItems: "center", justifyContent: "center", mx: "auto", mb: 2 }}>
            <WarningAmberOutlinedIcon sx={{ fontSize: 26, color: "#DC2626" }} />
          </Box>
          <Typography sx={{ fontSize: 17, fontWeight: 800, color: "#111827", mb: 1 }}>
            Cancel Auction?
          </Typography>
          <Typography sx={{ fontSize: 14, color: "text.secondary", lineHeight: 1.7, mb: 3 }}>
            Are you sure you want to cancel the auction for{" "}
            <Box component="strong" sx={{ color: "#1E1154" }}>{selectedAuction?.propertyName}</Box>?
            This cannot be undone and will stop all further bids.
          </Typography>
          <Stack direction="row" spacing={1.5} sx={{ justifyContent: "center" }}>
            <Button
              onClick={() => { setCancelDialogOpen(false); setSelectedAuction(null); }}
              sx={{ fontWeight: 700, color: "#6B7280", border: "1px solid #E5E7EB", borderRadius: 2, px: 3, "&:hover": { bgcolor: "#F9FAFB" } }}
            >
              Go Back
            </Button>
            <Button
              variant="contained"
              onClick={handleConfirmCancel}
              sx={{ bgcolor: "#DC2626", fontWeight: 700, borderRadius: 2, px: 3, "&:hover": { bgcolor: "#B91C1C" } }}
            >
              Yes, Cancel
            </Button>
          </Stack>
        </Box>
      </Dialog>
    </Box>
  );
}

// Helpers for the outer pagination string
function startNum(page, rowsPerPage) { return page * rowsPerPage + 1; }
function endNum(page, rowsPerPage, total) { return Math.min((page + 1) * rowsPerPage, total); }