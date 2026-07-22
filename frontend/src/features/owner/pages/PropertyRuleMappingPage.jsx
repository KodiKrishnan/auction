import React, { useState, useEffect } from "react";
import {
    Box, Typography, Button, Stack, Paper, Chip,
    IconButton, Tooltip, TextField, MenuItem,
    Dialog, DialogContent, DialogActions,
    Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, Switch, Skeleton,
    Divider, Grid, InputAdornment
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useNavigate } from "react-router-dom";

import { useLoader } from "../../../context/LoaderContext";
import { useError } from "../../../context/ErrorContext";
import useSuccessAlert from "../../../shared/hooks/useSuccessAlert";
import SuccessAlert from "../../../components/SuccessAlert";

import { validate } from "../../../utils/validators/validate";
import { mappingSchema } from "../../../utils/validators/schemas";

import {
    fetchOwnerProperties, fetchAllRules,
    fetchAllPropertyRuleMappings, createPropertyRuleMapping,
    enablePropertyRuleMapping, disablePropertyRuleMapping, fetchMappingCounts
} from "../ownerAPI";

import AddIcon from "@mui/icons-material/Add";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CloseIcon from "@mui/icons-material/Close";
import AutoAwesomeMotionOutlinedIcon from '@mui/icons-material/AutoAwesomeMotionOutlined';
import SearchIcon from '@mui/icons-material/Search';

const EMPTY_FORM = {
    propertyId: "",
    ruleId: "",
    effectiveFrom: "",
    effectiveTo: "",
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

function StatusChip({ status }) {
    return (
        <Chip
            label={status === 1 ? "Active" : "Disabled"}
            size="small"
            sx={{
                fontWeight: 700, fontSize: 11,
                bgcolor: status === 1 ? "#F0FDF4" : "#F9FAFB",
                color: status === 1 ? "#166534" : "#6B7280",
                border: `1px solid ${status === 1 ? "#BBF7D0" : "#E5E7EB"}`,
                borderRadius: 1.5,
            }}
        />
    );
}

function MappingFormDialog({ open, onClose, onSave, rules, properties, formErrors }) {
    const [form, setForm] = useState(EMPTY_FORM);
    const [localErrors, setLocalErrors] = useState({});
    const today = new Date().toISOString().split('T')[0];

    useEffect(() => {
        setLocalErrors(formErrors);
    }, [formErrors]);

    useEffect(() => {
        if (open) {
            setForm(EMPTY_FORM);
            setLocalErrors({});
        }
    }, [open]);

    const setFormField = (key) => (e) => {
        setForm(f => ({ ...f, [key]: e.target.value }));
        if (localErrors[key]) setLocalErrors(errs => ({ ...errs, [key]: "" }));
    };

    const availableRules = rules.filter(r => r.status === 1);

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth
            slotProps={{ paper: { sx: { borderRadius: 3, overflow: "hidden" } } }}>
            <Box sx={{ px: 3, py: 2.5, bgcolor: "#5E35B1", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
                    <AutoAwesomeMotionOutlinedIcon sx={{ color: "white", fontSize: 22 }} />
                    <Typography sx={{ fontWeight: 800, fontSize: 17, color: "white" }}>
                        Map Rule to Property
                    </Typography>
                </Stack>
                <IconButton onClick={onClose} sx={{ color: "white", "&:hover": { bgcolor: "rgba(255,255,255,0.15)" } }}>
                    <CloseIcon fontSize="small" />
                </IconButton>
            </Box>

            <DialogContent sx={{ p: 3 }}>
                <Stack spacing={3}>
                    <TextField
                        label="Select Property"
                        select
                        fullWidth
                        value={form.propertyId}
                        onChange={setFormField("propertyId")}
                        error={!!localErrors.propertyId}
                        helperText={localErrors.propertyId || "Choose the property for this rule."}
                        sx={premiumTextField}
                        slotProps={{ select: { MenuProps: { slotProps: { paper: { sx: { maxHeight: 250 } } } } } }}
                    >
                        {properties.map(p => {
                            const actualId = String(p.propertyId || p.property_id || p.id);
                            return (
                                <MenuItem key={actualId} value={actualId}>
                                    {p.propertyName || p.property_name || p.title}
                                </MenuItem>
                            );
                        })}
                    </TextField>

                    <TextField
                        label="Select Rule"
                        select
                        fullWidth
                        value={form.ruleId}
                        onChange={setFormField("ruleId")}
                        error={!!localErrors.ruleId}
                        helperText={localErrors.ruleId || "Choose an existing auction rule to apply."}
                        sx={premiumTextField}
                        slotProps={{ select: { MenuProps: { slotProps: { paper: { sx: { maxHeight: 250 } } } } } }}
                    >
                        {availableRules.map(r => (
                            <MenuItem key={r.ruleId} value={r.ruleId}>
                                {r.ruleName || r.rule_name}
                            </MenuItem>
                        ))}
                        {availableRules.length === 0 && <MenuItem disabled>No rules found. Create a rule first.</MenuItem>}
                    </TextField>

                    <Grid container spacing={2}>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <TextField
                                label="Effective From"
                                type="date"
                                fullWidth
                                size="small"
                                value={form.effectiveFrom}
                                onChange={setFormField("effectiveFrom")}
                                error={!!localErrors.effectiveFrom}
                                helperText={localErrors.effectiveFrom}
                                slotProps={{
                                    inputLabel: { shrink: true },
                                    htmlInput: { min: today }
                                }}
                                sx={premiumTextField}
                            />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <TextField
                                label="Effective To"
                                type="date"
                                fullWidth
                                size="small"
                                value={form.effectiveTo}
                                onChange={setFormField("effectiveTo")}
                                error={!!localErrors.effectiveTo}
                                helperText={localErrors.effectiveTo}
                                slotProps={{
                                    inputLabel: { shrink: true },
                                    htmlInput: { min: form.effectiveFrom || today }
                                }}
                                sx={premiumTextField}
                            />
                        </Grid>
                    </Grid>
                </Stack>
            </DialogContent>

            <DialogActions sx={{ px: 3, py: 2.5, borderTop: "1px solid #F3F4F6", gap: 1.5 }}>
                <Button onClick={onClose} sx={{ color: "#6B7280", border: "1px solid #E5E7EB", "&:hover": { bgcolor: "#F9FAFB" } }}>
                    Cancel
                </Button>
                <Button variant="contained" onClick={() => onSave(form)} sx={{ bgcolor: "#5E35B1", "&:hover": { bgcolor: "#4527A0" }, minWidth: 120 }}>
                    Apply Rule
                </Button>
            </DialogActions>
        </Dialog>
    );
}

export default function PropertyRuleMappingPage() {
    const navigate = useNavigate();
    const { showLoader, hideLoader } = useLoader();
    const { showError } = useError();
    const { open: alertOpen, message: alertMsg, showSuccess, closeSuccess } = useSuccessAlert();

    const [properties, setProperties] = useState([]);
    const [rules, setRules] = useState([]);
    const [mappings, setMappings] = useState([]);

    const [searchQuery, setSearchQuery] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("ALL");

    const [loading, setLoading] = useState(true);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [formErrors, setFormErrors] = useState({});

    const [mappingCounts, setMappingCounts] = useState({ total: 0, active: 0, disabled: 0 });

    const loadCounts = async () => {
        try {
            const res = await fetchMappingCounts();
            setMappingCounts({
                total: res?.total || 0,
                active: res?.active || 0,
                disabled: res?.disabled || 0
            });
        } catch (err) {
            console.error("Failed to load mapping counts", err);
        }
    };

    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                const propsRes = await fetchOwnerProperties(1, 10000);
                const propsData = propsRes?.data?.properties || propsRes?.data || [];
                setProperties(Array.isArray(propsData) ? propsData : []);

                const rulesRes = await fetchAllRules();
                const rulesData = rulesRes?.data?.data || rulesRes?.data || [];
                setRules(Array.isArray(rulesData) ? rulesData : []);

                await loadCounts();
            } catch (err) {
                const backendMsg = err.response?.data?.message || err.message || "Failed to load initial master data.";
                showError(backendMsg);
            }
        };
        fetchInitialData();
    }, []);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearch(searchQuery);
        }, 500);
        return () => clearTimeout(handler);
    }, [searchQuery]);

    useEffect(() => {
        const loadGlobalMappings = async () => {
            setLoading(true);
            try {
                const res = await fetchAllPropertyRuleMappings(debouncedSearch);
                setMappings(Array.isArray(res?.data) ? res.data : (res || []));
            } catch (err) {
                const backendMsg = err.response?.data?.message || err.message || "Failed to load global mappings.";
                showError(backendMsg);
            } finally {
                setLoading(false);
            }
        };

        loadGlobalMappings();
    }, [debouncedSearch]);

    const handleSave = async (form) => {
        const validationResult = validate(form, mappingSchema());
        let finalErrors = { ...validationResult.errors };

        if (form.effectiveFrom && form.effectiveTo && new Date(form.effectiveFrom) >= new Date(form.effectiveTo)) {
            finalErrors.effectiveTo = "End date must be after start date.";
        }

        if (Object.keys(finalErrors).some(k => finalErrors[k])) {
            setFormErrors(finalErrors);
            return;
        }

        showLoader();
        try {
            const payload = {
                propertyId: parseInt(form.propertyId, 10),
                ruleId: parseInt(form.ruleId, 10),
                effectiveFrom: form.effectiveFrom,
                effectiveTo: form.effectiveTo,
            };

            await createPropertyRuleMapping(payload);
            showSuccess("Rule mapped successfully!");
            setDialogOpen(false);

            const res = await fetchAllPropertyRuleMappings(debouncedSearch);
            setMappings(Array.isArray(res?.data) ? res.data : (res || []));
            await loadCounts();
        } catch (err) {
            const backendMsg = err.response?.data?.message || err.message || "Failed to save mapping.";
            showError(backendMsg);
        } finally {
            hideLoader();
        }
    };

    const handleToggleStatus = async (mapping) => {
        const id = mapping.mappingId || mapping.mapping_id;
        const currentStatus = mapping.status;
        const newStatus = currentStatus === 1 ? 0 : 1;

        setMappings(prev => prev.map(m => (m.mappingId || m.mapping_id) === id ? { ...m, status: newStatus } : m));

        showLoader();
        try {
            if (currentStatus === 1) await disablePropertyRuleMapping(id);
            else await enablePropertyRuleMapping(id);
            showSuccess("Status updated successfully.");

            const res = await fetchAllPropertyRuleMappings(debouncedSearch);
            setMappings(Array.isArray(res?.data) ? res.data : (res || []));
            await loadCounts();
        } catch (err) {
            const backendMsg = err.response?.data?.message || err.message || "Failed to update status.";
            setMappings(prev => prev.map(m => (m.mappingId || m.mapping_id) === id ? { ...m, status: currentStatus } : m));
            showError(backendMsg);
        } finally {
            hideLoader();
        }
    };

    const handleCloseDialog = () => {
        setDialogOpen(false);
        setFormErrors({});
    };

    const getRuleName = (mapping) => {
        if (mapping.ruleName) return mapping.ruleName;
        const rule = rules.find(r => r.ruleId === mapping.ruleId);
        return rule ? (rule.ruleName || rule.rule_name) : `Rule #${mapping.ruleId}`;
    };

    const getPropertyName = (mapping) => {
        if (mapping.propertyName) return mapping.propertyName;
        const prop = properties.find(p => (p.propertyId || p.id) === mapping.propertyId);
        return prop ? (prop.propertyName || prop.title) : `Property #${mapping.propertyId}`;
    };

    const safeMappings = Array.isArray(mappings) ? mappings : [];
    const filteredMappings = safeMappings.filter(m => {
        const currentStatus = m.status !== undefined ? String(m.status) : "0";
        return statusFilter === "ALL" || currentStatus === statusFilter;
    });

    return (
        <Box sx={{ p: { xs: 2, md: 4 }, bgcolor: "#FAFBFC", minHeight: "100vh", position: "relative" }}>
            <Box sx={{ position: 'fixed', top: 24, left: '50%', transform: 'translateX(-50%)', zIndex: 9999, width: 'max-content', maxWidth: '90vw', whiteSpace: 'nowrap' }}>
                <SuccessAlert open={alertOpen} message={alertMsg} onClose={closeSuccess} />
            </Box>

            <Box sx={{ maxWidth: 1400, mx: "auto" }}>
                <Stack direction="row" sx={{ alignItems: "flex-start", justifyContent: "space-between", mb: 4, flexWrap: "wrap", gap: 2 }}>
                    <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
                        <Tooltip title="Back to Dashboard">
                            <IconButton onClick={() => navigate("/owner/dashboard")} sx={{ bgcolor: "white", border: "1px solid #E5E7EB", "&:hover": { bgcolor: "#F3F4F6" } }}>
                                <ArrowBackIcon sx={{ fontSize: 20, color: "#4B5563" }} />
                            </IconButton>
                        </Tooltip>
                        <Box>
                            <Typography variant="h4" sx={{ fontSize: { xs: 22, md: 28 }, letterSpacing: "-0.02em", lineHeight: 1.1 }}>
                                Rule Mapping
                            </Typography>
                            <Typography sx={{ fontSize: 14, color: "text.secondary", mt: 0.5, fontWeight: 500 }}>
                                View and manage all auction schedules across your entire portfolio.
                            </Typography>
                        </Box>
                    </Stack>
                    <Button variant="contained" startIcon={<AddIcon />} onClick={() => { setDialogOpen(true); setFormErrors({}); }} sx={{ bgcolor: "#5E35B1", "&:hover": { bgcolor: "#4527A0" }, boxShadow: "0 4px 12px rgba(94,53,177,0.25)", fontWeight: 700, width: { xs: "100%", md: "auto" } }}>
                        Map New Rule
                    </Button>
                </Stack>

                <Paper elevation={0} sx={{ p: 1.5, mb: 4, borderRadius: 3, border: '1px solid #E5E7EB', bgcolor: 'white', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
                    <Stack direction="row" spacing={1} sx={{ overflowX: 'auto', pb: { xs: 1, md: 0 }, flex: 1 }}>
                        {[
                            { key: "ALL", label: "All Mappings", count: mappingCounts.total },
                            { key: "1", label: "Active", count: mappingCounts.active },
                            { key: "0", label: "Disabled", count: mappingCounts.disabled }
                        ].map(({ key, label, count }) => (
                            <Box
                                key={key}
                                onClick={() => setStatusFilter(key)}
                                sx={{
                                    px: 2.5, py: 1, borderRadius: 2, fontSize: 13, fontWeight: 600, cursor: "pointer", transition: "all 0.2s",
                                    border: "1px solid", borderColor: statusFilter === key ? "#5E35B1" : "transparent",
                                    bgcolor: statusFilter === key ? "#F5F3FF" : "#F3F4F6", color: statusFilter === key ? "#5E35B1" : "#4B5563",
                                    whiteSpace: 'nowrap', "&:hover": { bgcolor: statusFilter === key ? "#EDE7F6" : "#E5E7EB" }
                                }}
                            >
                                {label} <Box component="span" sx={{ ml: 0.5, opacity: 0.7 }}>({count})</Box>
                            </Box>
                        ))}
                    </Stack>

                    <Box sx={{ width: { xs: '100%', md: '300px' } }}>
                        <TextField
                            fullWidth
                            placeholder="Search Property or Rule..."
                            variant="outlined"
                            size="small"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            sx={{ ...premiumTextField, bgcolor: "white" }}
                            slotProps={{
                                input: {
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <SearchIcon sx={{ color: "#9CA3AF", fontSize: 20 }} />
                                        </InputAdornment>
                                    )
                                }
                            }}
                        />
                    </Box>
                </Paper>

                <Paper elevation={0} sx={{ border: "1px solid #E5E7EB", borderRadius: 3, overflow: "hidden" }}>
                    <TableContainer>
                        <Table>
                            <TableHead>
                                <TableRow sx={{ bgcolor: "#F9FAFB" }}>
                                    {["Property", "Rule Applied", "Effective From", "Effective To", "Status", "Actions"].map((h) => (
                                        <TableCell key={h} sx={{ fontWeight: 700, fontSize: 12, color: "#374151", textTransform: "uppercase", letterSpacing: 0.5, py: 1.5 }}>
                                            {h}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {loading ? (
                                    Array.from({ length: 3 }).map((_, i) => (
                                        <TableRow key={i}>
                                            {Array.from({ length: 6 }).map((_, j) => (
                                                <TableCell key={j}><Skeleton width={j === 0 ? 180 : 100} height={24} /></TableCell>
                                            ))}
                                        </TableRow>
                                    ))
                                ) : filteredMappings.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} sx={{ textAlign: "center", py: 8 }}>
                                            <AutoAwesomeMotionOutlinedIcon sx={{ fontSize: 52, color: "#D1D5DB", mb: 1.5, display: "block", mx: "auto" }} />
                                            <Typography sx={{ fontSize: 16, fontWeight: 700, color: "#111827" }}>
                                                {searchQuery || statusFilter !== "ALL" ? "No matching mappings found" : "No rules mapped yet"}
                                            </Typography>
                                            <Typography sx={{ fontSize: 14, color: "#6B7280", mt: 0.5 }}>
                                                {searchQuery || statusFilter !== "ALL" ? "Try adjusting your filters or search." : "Click 'Map New Rule' to schedule an auction layout."}
                                            </Typography>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredMappings.map((mapping, idx) => (
                                        <TableRow key={mapping.mappingId || mapping.mapping_id} sx={{ bgcolor: idx % 2 === 0 ? "white" : "#FAFAFA", "&:hover": { bgcolor: "#F5F3FF" }, transition: "background-color 0.15s", opacity: mapping.status === 0 ? 0.65 : 1 }}>

                                            <TableCell sx={{ py: 2 }}>
                                                <Typography sx={{ fontSize: 14, fontWeight: 500, color: "#111827" }}>
                                                    {getPropertyName(mapping)}
                                                </Typography>
                                            </TableCell>

                                            <TableCell>
                                                <Typography sx={{ fontSize: 14, fontWeight: 500, color: "#111827" }}>
                                                    {getRuleName(mapping)}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Typography sx={{ fontSize: 13, fontWeight: 500, color: "#111827" }}>
                                                    {new Date(mapping.effectiveFrom || mapping.effective_from).toLocaleDateString("en-IN", { dateStyle: "medium" })}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Typography sx={{ fontSize: 13, fontWeight: 500, color: "#111827" }}>
                                                    {new Date(mapping.effectiveTo || mapping.effective_to).toLocaleDateString("en-IN", { dateStyle: "medium" })}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
                                                <StatusChip status={mapping.status} />
                                            </TableCell>
                                            <TableCell>
                                                <Tooltip title={mapping.status === 1 ? "Disable Mapping" : "Enable Mapping"}>
                                                    <Switch size="small" checked={mapping.status === 1} onChange={() => handleToggleStatus(mapping)} sx={{ "& .MuiSwitch-switchBase.Mui-checked": { color: "#5E35B1" }, "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": { bgcolor: "#5E35B1" } }} />
                                                </Tooltip>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Paper>
            </Box>

            <MappingFormDialog
                open={dialogOpen}
                onClose={handleCloseDialog}
                onSave={handleSave}
                rules={rules}
                properties={properties}
                formErrors={formErrors}
            />
        </Box>
    );
}

