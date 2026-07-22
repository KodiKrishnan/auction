import React, { useState, useEffect } from "react";
import {
  Box, Typography, Button, Stack, Paper, Chip,
  IconButton, Tooltip, TextField, MenuItem,
  Dialog, DialogContent, DialogActions,
  Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Switch, Skeleton,
  Divider, Grid, CircularProgress
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useNavigate } from "react-router-dom";

// Contexts & Hooks
import { useLoader } from "../../../context/LoaderContext";
import { useError } from "../../../context/ErrorContext";
import useSuccessAlert from "../../../shared/hooks/useSuccessAlert";
import SuccessAlert from "../../../components/SuccessAlert";
import { validate } from "../../../utils/validators/validate";
import { ruleSchema } from "../../../utils/validators/schemas";

import {
  fetchAllRules, createRule, updateRule, enableRule, disableRule,
  fetchPackageTypes, createPackageType, deletePackageType, // ← added deletePackageType
  fetchDays, fetchRuleCounts
} from "../ownerAPI";

// Icons
import AddIcon from "@mui/icons-material/Add";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CloseIcon from "@mui/icons-material/Close";
import GavelOutlinedIcon from "@mui/icons-material/GavelOutlined";
import AddCircleOutlinedIcon from '@mui/icons-material/AddCircleOutlined';
import DeleteOutlinedIcon from "@mui/icons-material/DeleteOutlined";

const EMPTY_FORM = {
  ruleName: "",
  packageType: "",
  validFrom: "",
  validTo: "",
  checkinDay: "",
  checkoutDay: "",
  baseCost: "",
  bidIncrement: "",
  bidStartBefore: "",
  bidCloseBefore: "",
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
  "& input::-webkit-outer-spin-button, & input::-webkit-inner-spin-button": {
    WebkitAppearance: "none",
    margin: 0,
  },
  "& input[type=number]": {
    MozAppearance: "textfield",
  },
};

const getBidIncrementOptions = (baseCost) => {
  const base = parseFloat(baseCost);
  if (!base || base <= 0) return [];

  const percentages = [0.01, 0.02, 0.03, 0.05];
  const roundTo = base < 25000 ? 25 : 100;
  const options = percentages.map(p => {
    const rawValue = base * p;
    return Math.ceil(rawValue / roundTo) * roundTo;
  });

  return [...new Set(options)];
};

function RuleRowSkeleton() {
  return (
    <TableRow>
      {[180, 100, 120, 120, 90, 90, 80, 80, 80].map((w, i) => (
        <TableCell key={i}><Skeleton width={w} height={20} /></TableCell>
      ))}
    </TableRow>
  );
}

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

// ─── RuleFormDialog ───────────────────────────────────────────────────────────
function RuleFormDialog({
  open, onClose, onSave, editData, formErrors, setFormErrors,
  packageTypes, days, loadPackageTypes, showSuccess, showError,
  onDeleteCustomPackage // ← new prop
}) {
  const [form, setForm] = useState(EMPTY_FORM);
  const today = new Date().toISOString().split('T')[0];

  const [isCreatingPackage, setIsCreatingPackage] = useState(false);
  const [newPackageName, setNewPackageName] = useState("");
  const [isSavingPackage, setIsSavingPackage] = useState(false);

  useEffect(() => {
    if (open) {
      if (editData) {
        setForm({
          ruleName: editData.ruleName || editData.rule_name || "",
          packageType: editData.packageTypeId || "",
          validFrom: editData.validFrom || editData.valid_from || "",
          validTo: editData.validTo || editData.valid_to || "",
          checkinDay: editData.checkinDay || editData.checkin_day || "",
          checkoutDay: editData.checkoutDay || editData.checkout_day || "",
          baseCost: editData.baseCost || editData.base_cost || "",
          bidIncrement: editData.bidIncrement || editData.bid_increment || "",
          bidStartBefore: editData.bidStartBefore || editData.bid_start_before || "",
          bidCloseBefore: editData.bidCloseBefore || editData.bid_close_before || "",
        });
      } else {
        setForm(EMPTY_FORM);
      }
      setFormErrors({});
      setIsCreatingPackage(false);
      setNewPackageName("");
    }
  }, [editData, open]);

  // Clear selected package if it gets deleted
  useEffect(() => {
    if (form.packageType) {
      const stillExists = packageTypes.find(p => p.id === form.packageType);
      if (!stillExists) {
        setForm(f => ({ ...f, packageType: "" }));
      }
    }
  }, [packageTypes]);


  useEffect(() => {
    const validOptions = getBidIncrementOptions(form.baseCost);
    const currentIncrement = parseFloat(form.bidIncrement);

    if (form.bidIncrement && !validOptions.includes(currentIncrement)) {
      setForm((prev) => ({ ...prev, bidIncrement: "" }));
    }
  }, [form.baseCost]);


  const setFormField = (key) => (e) => {
    setForm(f => ({ ...f, [key]: e.target.value }));
    if (formErrors[key]) setFormErrors(errs => ({ ...errs, [key]: "" }));
  };

  const handleSaveNewPackage = async () => {
    const rawName = newPackageName.trim();
    if (!rawName) {
      showError("Please enter a package name.");
      return;
    }

    const capitalizedPkgName = rawName.charAt(0).toUpperCase() + rawName.slice(1);

    setIsSavingPackage(true);
    try {
      const res = await createPackageType({ name: capitalizedPkgName });
      await loadPackageTypes();

      setForm(prev => ({ ...prev, packageType: res.id }));
      if (formErrors.packageType) setFormErrors(errs => ({ ...errs, packageType: "" }));

      showSuccess("Custom package added successfully!");
      setIsCreatingPackage(false);
      setNewPackageName("");
    } catch (err) {
      showError(err || "Failed to create custom package.");
    } finally {
      setIsSavingPackage(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth
      slotProps={{ paper: { sx: { borderRadius: 3, overflow: "hidden" } } }}>
      <Box sx={{ px: 3, py: 2.5, bgcolor: "#5E35B1", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
          <GavelOutlinedIcon sx={{ color: "white", fontSize: 22 }} />
          <Typography sx={{ fontWeight: 800, fontSize: 17, color: "white" }}>
            {editData ? "Edit Rule" : "Create New Rule"}
          </Typography>
        </Stack>
        <IconButton onClick={onClose} sx={{ color: "white", "&:hover": { bgcolor: "rgba(255,255,255,0.15)" } }}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </Box>

      <DialogContent sx={{ p: 3 }}>
        <Stack spacing={3}>
          <Box>
            <Typography sx={{ fontSize: 12, fontWeight: 700, color: "#5E35B1", textTransform: "uppercase", letterSpacing: 1, mb: 2 }}>Basic Information</Typography>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 7 }}>
                <TextField label="Rule Name" fullWidth size="small" value={form.ruleName}
                  onChange={setFormField("ruleName")}
                  error={!!formErrors.ruleName}
                  helperText={formErrors.ruleName}
                  sx={premiumTextField} />
              </Grid>

              <Grid size={{ xs: 12, sm: 5 }}>
                {!isCreatingPackage ? (
                  <Box>
                    <TextField
                      select
                      label="Package Type"
                      fullWidth
                      size="small"
                      value={form.packageType}
                      onChange={setFormField("packageType")}
                      error={!!formErrors.packageType}
                      helperText={formErrors.packageType}
                      sx={premiumTextField}
                    >
                      {packageTypes.map((pkg) => (
                        <MenuItem
                          key={pkg.id}
                          value={pkg.id}
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            pr: 0.5,
                          }}
                        >
                          <span style={{ flex: 1 }}>{pkg.name}</span>

                          {/* ✕ delete icon — only for custom packages (ownerId not null) */}
                          {pkg.ownerId !== null && pkg.ownerId !== undefined && (
                            <IconButton
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                e.preventDefault();
                                onDeleteCustomPackage(pkg.id, pkg.name);
                              }}
                              sx={{
                                ml: 1,
                                p: 0.3,
                                color: "#EF4444",
                                "&:hover": { bgcolor: "#FEE2E2", borderRadius: 1 },
                              }}
                            >
                              <DeleteOutlinedIcon sx={{ fontSize: 16 }} />
                            </IconButton>
                          )}
                        </MenuItem>
                      ))}
                    </TextField>

                    {/* + Add Custom Package link */}
                    <Button
                      size="small"
                      startIcon={<AddCircleOutlinedIcon fontSize="small" />}
                      onClick={() => setIsCreatingPackage(true)}
                      sx={{
                        mt: 0.5, textTransform: "none", fontWeight: 600,
                        color: "#5E35B1", p: 0,
                        "&:hover": { bgcolor: "transparent", textDecoration: "underline" }
                      }}
                    >
                      Add Custom Package
                    </Button>
                  </Box>
                ) : (
                  <Paper elevation={0} sx={{ p: 1.5, border: "1px dashed #5E35B1", bgcolor: "#F5F3FF", borderRadius: 2 }}>
                    <Typography sx={{ fontSize: 12, fontWeight: 700, color: "#5E35B1", mb: 1 }}>Create Custom Package</Typography>
                    <Stack spacing={1}>
                      <TextField
                        autoFocus
                        placeholder="e.g. Special Holiday"
                        size="small"
                        fullWidth
                        value={newPackageName}
                        onChange={(e) => setNewPackageName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleSaveNewPackage();
                          if (e.key === "Escape") setIsCreatingPackage(false);
                        }}
                        sx={{ bgcolor: "white", "& .MuiOutlinedInput-root": { borderRadius: 1.5 } }}
                      />
                      <Stack direction="row" spacing={1} sx={{ justifyContent: "flex-end" }}>
                        <Button
                          size="small"
                          onClick={() => { setIsCreatingPackage(false); setNewPackageName(""); }}
                          sx={{ color: "#6B7280" }}
                        >
                          Cancel
                        </Button>
                        <Button
                          size="small"
                          variant="contained"
                          onClick={handleSaveNewPackage}
                          disabled={isSavingPackage || !newPackageName.trim()}
                          sx={{ bgcolor: "#5E35B1", "&:hover": { bgcolor: "#4527A0" } }}
                        >
                          {isSavingPackage ? <CircularProgress size={16} sx={{ color: "white" }} /> : "Save"}
                        </Button>
                      </Stack>
                    </Stack>
                  </Paper>
                )}
              </Grid>
            </Grid>
          </Box>
          <Divider />

          <Box>
            <Typography sx={{ fontSize: 12, fontWeight: 700, color: "#5E35B1", textTransform: "uppercase", letterSpacing: 1, mb: 2 }}>Validity Period & Schedule</Typography>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  label="Valid From" type="date" fullWidth size="small"
                  value={form.validFrom} onChange={setFormField("validFrom")}
                  error={!!formErrors.validFrom} helperText={formErrors.validFrom}
                  slotProps={{ inputLabel: { shrink: true }, htmlInput: { min: today } }}
                  sx={premiumTextField}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  label="Valid To" type="date" fullWidth size="small"
                  value={form.validTo} onChange={setFormField("validTo")}
                  error={!!formErrors.validTo} helperText={formErrors.validTo}
                  slotProps={{ inputLabel: { shrink: true }, htmlInput: { min: form.validFrom || today } }}
                  sx={premiumTextField}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField label="Check-in Day" select fullWidth size="small" value={form.checkinDay} onChange={setFormField("checkinDay")} error={!!formErrors.checkinDay} helperText={formErrors.checkinDay} sx={premiumTextField}>
                  {days.map((d, i) => (
                    <MenuItem key={i} value={d}>
                      {d.charAt(0).toUpperCase() + d.slice(1).toLowerCase()}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField label="Check-out Day" select fullWidth size="small" value={form.checkoutDay} onChange={setFormField("checkoutDay")} error={!!formErrors.checkoutDay} helperText={formErrors.checkoutDay} sx={premiumTextField}>
                  {days.map((d, i) => (
                    <MenuItem key={i} value={d}>
                      {d.charAt(0).toUpperCase() + d.slice(1).toLowerCase()}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
            </Grid>
          </Box>
          <Divider />

          <Box>
            <Typography sx={{ fontSize: 12, fontWeight: 700, color: "#5E35B1", textTransform: "uppercase", letterSpacing: 1, mb: 2 }}>Pricing & Bidding</Typography>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField label="Base Cost (₹)" type="number" fullWidth size="small" value={form.baseCost} onChange={setFormField("baseCost")} error={!!formErrors.baseCost} helperText={formErrors.baseCost || "Starting price"} slotProps={{ htmlInput: { min: 0 } }} sx={premiumTextField} />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  select
                  label="Bid Increment (₹)"
                  fullWidth
                  size="small"
                  value={form.bidIncrement}
                  onChange={setFormField("bidIncrement")}
                  error={!!formErrors.bidIncrement}
                  helperText={
                    formErrors.bidIncrement ||
                    (form.baseCost ? "Allowed increments based on Base Cost" : "Enter Base Cost first")
                  }
                  disabled={!form.baseCost}
                  sx={premiumTextField}
                >
                  {getBidIncrementOptions(form.baseCost).map((val) => (
                    <MenuItem key={val} value={val}>
                      ₹{val}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField label="Bid Starts Before (days)" type="number" fullWidth size="small" value={form.bidStartBefore} onChange={setFormField("bidStartBefore")} error={!!formErrors.bidStartBefore} helperText={formErrors.bidStartBefore || "Days before check-in"} slotProps={{ htmlInput: { min: 0 } }} sx={premiumTextField} />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField label="Bid Closes Before (days)" type="number" fullWidth size="small" value={form.bidCloseBefore} onChange={setFormField("bidCloseBefore")} error={!!formErrors.bidCloseBefore} helperText={formErrors.bidCloseBefore || "Days before check-in"} slotProps={{ htmlInput: { min: 0 } }} sx={premiumTextField} />
              </Grid>
            </Grid>
          </Box>
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2.5, borderTop: "1px solid #F3F4F6", gap: 1.5 }}>
        <Button onClick={onClose} sx={{ color: "#6B7280", border: "1px solid #E5E7EB", "&:hover": { bgcolor: "#F9FAFB" } }}>
          Cancel
        </Button>
        <Button variant="contained" onClick={() => onSave(form)} disabled={isCreatingPackage} sx={{ bgcolor: "#5E35B1", "&:hover": { bgcolor: "#4527A0" }, minWidth: 120 }}>
          {editData ? "Save Changes" : "Create Rule"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// ─── Main Page Component ──────────────────────────────────────────────────────
export default function RulesPage() {
  const theme = useTheme();
  const navigate = useNavigate();
  const { showLoader, hideLoader } = useLoader();
  const { showError } = useError();
  const { open: alertOpen, message: alertMsg, showSuccess, closeSuccess } = useSuccessAlert();

  const [rules, setRules] = useState([]);
  const [packageTypes, setPackageTypes] = useState([]);
  const [days, setDays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editData, setEditData] = useState(null);
  const [formErrors, setFormErrors] = useState({});
  const [ruleCounts, setRuleCounts] = useState({ total: 0, active: 0, disabled: 0 });

  const getPackageName = React.useCallback((id) => {
    if (!id) return "";
    const pkg = packageTypes.find(p => p.id === id);
    return pkg ? pkg.name : "Unknown Package";
  }, [packageTypes]);

  const loadRules = async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    try {
      const res = await fetchAllRules();
      const rulesData = res?.data?.data || [];
      setRules(rulesData);
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to load rules.";
      showError(msg);
    } finally {
      if (!isSilent) setLoading(false);
    }
  };

  const loadPackageTypes = async () => {
    try {
      const res = await fetchPackageTypes();
      setPackageTypes(Array.isArray(res) ? res : (res?.data || []));
    } catch (err) {
      console.error("Failed to load package types", err);
    }
  };

  const loadDays = async () => {
    try {
      const res = await fetchDays();
      setDays(Array.isArray(res) ? res : (res?.data || []));
    } catch (err) {
      console.error("Failed to load days", err);
    }
  };

  const loadCounts = async () => {
    try {
      const res = await fetchRuleCounts();
      setRuleCounts({
        total: res?.data?.total || res?.total || res?.data?.totalRules || 0,
        active: res?.data?.active || res?.active || res?.data?.activeRules || 0,
        disabled: res?.data?.disabled || res?.disabled || res?.data?.disabledRules || 0
      });
    } catch (err) {
      console.error("Failed to load rule counts", err);
    }
  };

  useEffect(() => {
    loadRules();
    loadPackageTypes();
    loadDays();
    loadCounts();
  }, []);

  // ── Delete custom package handler ─────────────────────────────────────────
  const handleDeleteCustomPackage = async (pkgId, pkgName) => {
    try {
      showLoader();
      await deletePackageType(pkgId);
      await loadPackageTypes(); // refresh dropdown
      showSuccess(`"${pkgName}" deleted successfully.`);
    } catch (err) {
      showError(err?.response?.data?.message || "Failed to delete package type.");
    } finally {
      hideLoader();
    }
  };

  const safeRules = Array.isArray(rules) ? rules : [];

  const filtered = safeRules.filter(r => {
    const currentStatus = r.status !== undefined ? String(r.status) : "0";
    return statusFilter === "ALL" || currentStatus === statusFilter;
  });

  const handleOpenCreate = () => {
    setEditData(null);
    setFormErrors({});
    setDialogOpen(true);
  };

  const handleOpenEdit = (rule) => {
    setEditData(rule);
    setFormErrors({});
    setDialogOpen(true);
  };

  const handleClose = () => {
    setDialogOpen(false);
    setEditData(null);
  };

  const handleSave = async (form) => {
    const validationResult = validate(form, ruleSchema());
    let finalErrors = { ...validationResult.errors };

    if (form.validFrom && form.validTo && new Date(form.validFrom) >= new Date(form.validTo)) {
      finalErrors.validTo = "End date must be strictly after the start date.";
    }

    const startBefore = parseInt(form.bidStartBefore, 10);
    const closeBefore = parseInt(form.bidCloseBefore, 10);
    if (!isNaN(startBefore) && !isNaN(closeBefore) && startBefore <= closeBefore) {
      finalErrors.bidStartBefore = "Must be greater than Bid Closes Before.";
    }

    const baseCost = parseFloat(form.baseCost);
    const increment = parseFloat(form.bidIncrement);
    if (!isNaN(baseCost) && !isNaN(increment) && increment >= baseCost) {
      finalErrors.bidIncrement = "Bid increment must be less than the Base Cost.";
    }

    const rawRuleName = form.ruleName.trim();
    const capitalizedRuleName = rawRuleName.charAt(0).toUpperCase() + rawRuleName.slice(1);
    const lowercaseCompareName = capitalizedRuleName.toLowerCase();

    const isDuplicate = rules.some((existingRule) => {
      const existingName = (existingRule.ruleName || existingRule.rule_name || "").toLowerCase();
      const isSameRule = editData && (existingRule.ruleId === editData.ruleId);
      return existingName === lowercaseCompareName && !isSameRule;
    });

    if (isDuplicate) {
      finalErrors.ruleName = "A rule with this exact name already exists.";
    }

    if (Object.keys(finalErrors).some(k => finalErrors[k])) {
      setFormErrors(finalErrors);
      return;
    }

    showLoader();
    try {
      const payload = {
        ruleName: capitalizedRuleName,
        packageTypeId: form.packageType,
        validFrom: form.validFrom,
        validTo: form.validTo,
        checkinDay: form.checkinDay ? form.checkinDay.toUpperCase() : "",
        checkoutDay: form.checkoutDay ? form.checkoutDay.toUpperCase() : "",
        baseCost: parseFloat(form.baseCost),
        bidIncrement: parseFloat(form.bidIncrement),
        bidStartBefore: parseInt(form.bidStartBefore, 10),
        bidCloseBefore: parseInt(form.bidCloseBefore, 10),
      };

      if (editData) {
        await updateRule(editData.ruleId, payload);
        showSuccess("Rule updated successfully!");
      } else {
        await createRule(payload);
        showSuccess("Rule created successfully!");
      }

      handleClose();
      await loadRules(true);
      await loadCounts();
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.errors || err.message || "Failed to save rule.";
      showError(msg);
    } finally {
      hideLoader();
    }
  };

  const handleToggleStatus = async (rule) => {
    const newStatus = rule.status === 1 ? 0 : 1;
    setRules(prevRules => prevRules.map(r => r.ruleId === rule.ruleId ? { ...r, status: newStatus } : r));

    showLoader();
    try {
      if (rule.status === 1) {
        await disableRule(rule.ruleId);
        showSuccess(`"${rule.ruleName || rule.rule_name}" disabled.`);
      } else {
        await enableRule(rule.ruleId);
        showSuccess(`"${rule.ruleName || rule.rule_name}" enabled.`);
      }
      await loadRules(true);
      await loadCounts();
    } catch (err) {
      setRules(prevRules => prevRules.map(r => r.ruleId === rule.ruleId ? { ...r, status: rule.status } : r));
      const msg = err.response?.data?.message || "Failed to update rule status.";
      showError(msg);
    } finally {
      hideLoader();
    }
  };

  const fmt = (val) => `₹${Number(val || 0).toLocaleString("en-IN")}`;

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, bgcolor: "#FAFBFC", minHeight: "100vh", position: "relative" }}>
      <Box sx={{
        position: 'fixed', top: 24, left: '50%', transform: 'translateX(-50%)',
        zIndex: 9999, width: 'max-content', maxWidth: '90vw', whiteSpace: 'nowrap'
      }}>
        <SuccessAlert open={alertOpen} message={alertMsg} onClose={closeSuccess} />
      </Box>

      <Box sx={{ maxWidth: 1400, mx: "auto" }}>
        {/* Header */}
        <Stack direction="row" sx={{ alignItems: "flex-start", justifyContent: "space-between", mb: 4, flexWrap: "wrap", gap: 2 }}>
          <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
            <Tooltip title="Back to Dashboard">
              <IconButton onClick={() => navigate("/owner/dashboard")} sx={{ bgcolor: "white", border: "1px solid #E5E7EB", "&:hover": { bgcolor: "#F3F4F6" } }}>
                <ArrowBackIcon sx={{ fontSize: 20, color: "#4B5563" }} />
              </IconButton>
            </Tooltip>
            <Box>
              <Typography variant="h4" sx={{ fontSize: { xs: 22, md: 28 }, letterSpacing: "-0.02em", lineHeight: 1.1 }}>
                Rule Management
              </Typography>
              <Typography sx={{ fontSize: 14, color: "text.secondary", mt: 0.5, fontWeight: 500 }}>
                Define auction rules — pricing, bidding windows, and validity periods.
              </Typography>
            </Box>
          </Stack>
          <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpenCreate}
            sx={{ bgcolor: "#5E35B1", "&:hover": { bgcolor: "#4527A0" }, boxShadow: "0 4px 12px rgba(94,53,177,0.25)", fontWeight: 700 }}>
            Create Rule
          </Button>
        </Stack>

        <Paper elevation={0} sx={{ p: 1.5, mb: 4, borderRadius: 3, border: '1px solid #E5E7EB', bgcolor: 'white', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
          <Stack direction="row" spacing={1} sx={{ overflowX: 'auto', pb: { xs: 1, md: 0 }, flex: 1 }}>
            {[
              { key: "ALL", label: "All Rules", count: ruleCounts.total },
              { key: "1", label: "Active", count: ruleCounts.active },
              { key: "0", label: "Disabled", count: ruleCounts.disabled }
            ].map(({ key, label, count }) => (
              <Box key={key} onClick={() => setStatusFilter(key)}
                sx={{
                  px: 2.5, py: 1, borderRadius: 2, fontSize: 13, fontWeight: 600, cursor: "pointer", transition: "all 0.2s",
                  border: "1px solid", borderColor: statusFilter === key ? "#5E35B1" : "transparent",
                  bgcolor: statusFilter === key ? "#F5F3FF" : "#F3F4F6", color: statusFilter === key ? "#5E35B1" : "#4B5563",
                  whiteSpace: 'nowrap', "&:hover": { bgcolor: statusFilter === key ? "#EDE7F6" : "#E5E7EB" }
                }}>
                {label} <Box component="span" sx={{ ml: 0.5, opacity: 0.7 }}>({count})</Box>
              </Box>
            ))}
          </Stack>
        </Paper>

        {/* Data Table */}
        <Paper elevation={0} sx={{ border: "1px solid #E5E7EB", borderRadius: 3, overflow: "hidden" }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: "#F9FAFB" }}>
                  {["Rule Name", "Package", "Validity", "Check-in / Out", "Base Cost", "Bid Increment", "Opens", "Closes", "Status", "Actions"].map((h) => (
                    <TableCell key={h} sx={{ fontWeight: 700, fontSize: 12, color: "#374151", textTransform: "uppercase", letterSpacing: 0.5, py: 1.5, whiteSpace: "nowrap" }}>
                      {h}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => <RuleRowSkeleton key={i} />)
                ) : filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={10} sx={{ textAlign: "center", py: 8 }}>
                      <GavelOutlinedIcon sx={{ fontSize: 52, color: "#D1D5DB", mb: 1.5, display: "block", mx: "auto" }} />
                      <Typography sx={{ fontSize: 16, fontWeight: 700, color: "#111827" }}>
                        {statusFilter !== "ALL" ? "No rules match your filters" : "No rules yet"}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((rule, idx) => (
                    <TableRow key={rule.ruleId} sx={{ bgcolor: idx % 2 === 0 ? "white" : "#FAFAFA", "&:hover": { bgcolor: "#F5F3FF" }, transition: "background-color 0.15s", opacity: rule.status === 0 ? 0.65 : 1 }}>
                      <TableCell sx={{ py: 2, width: '25%' }}>
                        <Typography sx={{ fontSize: 14, fontWeight: 500, color: "#111827", maxWidth: 250, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {rule.ruleName}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography sx={{ fontSize: 13, fontWeight: 500, color: "#111827" }}>
                          {getPackageName(rule.packageTypeId)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography sx={{ fontSize: 13, fontWeight: 500, color: "#111827", whiteSpace: "nowrap" }}>{rule.validFrom || rule.valid_from}</Typography>
                        <Typography sx={{ fontSize: 13, fontWeight: 500, color: "#111827" }}>{rule.validTo || rule.valid_to}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography sx={{ fontSize: 13, fontWeight: 500, color: "#111827" }}>{(rule.checkinDay || rule.checkin_day)?.slice(0, 3)} - {(rule.checkoutDay || rule.checkout_day)?.slice(0, 3)}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography sx={{ fontSize: 13, fontWeight: 500, color: "#111827" }}>{fmt(rule.baseCost || rule.base_cost)}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography sx={{ fontSize: 13, fontWeight: 500, color: "#111827" }}>{fmt(rule.bidIncrement || rule.bid_increment)}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography sx={{ fontSize: 13, fontWeight: 500, color: "#111827" }}>
                          {rule.bidStartBefore || rule.bid_start_before} {(rule.bidStartBefore || rule.bid_start_before) == 1 ? 'day' : 'days'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography sx={{ fontSize: 13, fontWeight: 500, color: "#111827" }}>
                          {rule.bidCloseBefore || rule.bid_close_before} {(rule.bidCloseBefore || rule.bid_close_before) == 1 ? 'day' : 'days'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <StatusChip status={rule.status} />
                      </TableCell>
                      <TableCell>
                        <Stack direction="row" spacing={0.5} sx={{ alignItems: "center" }}>
                          <Tooltip title="Edit Rule">
                            <IconButton size="small" onClick={() => handleOpenEdit(rule)} sx={{ color: "#5E35B1", bgcolor: "#F5F3FF", "&:hover": { bgcolor: "#EDE7F6" }, borderRadius: 1.5, p: 0.8 }}>
                              <EditOutlinedIcon sx={{ fontSize: 16 }} />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title={rule.status === 1 ? "Disable Rule" : "Enable Rule"}>
                            <Switch size="small" checked={rule.status === 1} onChange={() => handleToggleStatus(rule)}
                              sx={{ "& .MuiSwitch-switchBase.Mui-checked": { color: "#5E35B1" }, "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": { bgcolor: "#5E35B1" } }} />
                          </Tooltip>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </Box>

      {/* Form Dialog */}
      <RuleFormDialog
        open={dialogOpen}
        onClose={handleClose}
        onSave={handleSave}
        editData={editData}
        formErrors={formErrors}
        setFormErrors={setFormErrors}
        packageTypes={packageTypes}
        days={days}
        loadPackageTypes={loadPackageTypes}
        showSuccess={showSuccess}
        showError={showError}
        onDeleteCustomPackage={handleDeleteCustomPackage}
      />
    </Box>
  );
}