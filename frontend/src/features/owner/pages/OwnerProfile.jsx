import React, { useState, useEffect } from "react";
import {
  Box, Typography, Button, TextField, Stack, Paper,
  Avatar, IconButton, Tooltip, Skeleton,
  Chip, Grid, Divider
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useNavigate } from "react-router-dom";

import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";
import CloseOutlinedIcon from "@mui/icons-material/CloseOutlined";
import PersonOutlinedIcon from "@mui/icons-material/PersonOutlined";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import PhoneOutlinedIcon from "@mui/icons-material/PhoneOutlined";
import CakeOutlinedIcon from "@mui/icons-material/CakeOutlined";
import VerifiedOutlinedIcon from "@mui/icons-material/VerifiedOutlined";
import BadgeOutlinedIcon from "@mui/icons-material/BadgeOutlined";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";

import { useLoader } from "../../../context/LoaderContext";
import { useError } from "../../../context/ErrorContext";
import { useAuth } from "../../../context/AuthContext";
import useSuccessAlert from "../../../shared/hooks/useSuccessAlert";
import SuccessAlert from "../../../components/SuccessAlert";

import { fetchOwnerProfile, updateOwnerProfile } from "../ownerAPI";

const premiumTextField = {
  "& .MuiOutlinedInput-root": {
    borderRadius: 2.5,
    bgcolor: "#F9FAFB",
    fontSize: 14,
    transition: "all 0.2s ease-in-out",
    "& fieldset": { borderColor: "#E5E7EB" },
    "&:hover fieldset": { borderColor: "#D1D5DB" },
    "&.Mui-focused fieldset": { borderColor: "#5E35B1", borderWidth: "2px" },
    "&.Mui-focused": { bgcolor: "white" },
  },
  "& .MuiInputLabel-root.Mui-focused": { color: "#5E35B1", fontWeight: 600 },
};


const formatDate = (dob) => {
  if (!dob) return "—";
  return new Date(dob).toLocaleDateString("en-IN", {
    day: "2-digit", month: "long", year: "numeric"
  });
};

const calculateAge = (dob) => {
  if (!dob) return null;
  const diff = Date.now() - new Date(dob).getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
};

const getInitials = (first, last, name) => {
  const displayName = name || `${first || ""} ${last || ""}`.trim();
  if (!displayName) return "?";

  const parts = displayName.split(/\s+/);
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
  }
  return parts[0][0]?.toUpperCase() || "?";
};


function InfoRow({ icon, label, value, chip }) {
  return (
    <Box
      sx={{
        p: 2,
        borderRadius: 2.5,
        bgcolor: "#F9FAFB",
        border: "1px solid #F3F4F6",
        transition: "all 0.2s",
        "&:hover": { bgcolor: "#F3F4F6", borderColor: "#E5E7EB" }
      }}
    >
      <Stack direction="row" spacing={2} sx={{ alignItems: "center" }}>
        <Box sx={{
          width: 36, height: 36, borderRadius: 2,
          bgcolor: "white",
          border: "1px solid #E5E7EB",
          display: "flex", alignItems: "center", justifyContent: "center",
          flexShrink: 0, color: "#5E35B1"
        }}>
          {icon}
        </Box>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography sx={{ fontSize: 10, fontWeight: 700, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: 0.8, mb: 0.2 }}>
            {label}
          </Typography>
          <Stack direction="row" spacing={1.5} sx={{ alignItems: "center", flexWrap: "wrap" }}>
            <Typography sx={{ fontSize: 14, fontWeight: 600, color: "#1E1154", wordBreak: "break-word" }}>
              {value || "—"}
            </Typography>
            {chip}
          </Stack>
        </Box>
      </Stack>
    </Box>
  );
}

export default function OwnerProfile() {
  const theme = useTheme();
  const navigate = useNavigate();
  const { showLoader, hideLoader } = useLoader();
  const { showError } = useError();
  const { updateUser } = useAuth();
  const { open, message, showSuccess, closeSuccess } = useSuccessAlert();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ firstName: "", lastName: "", dob: "" });
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await fetchOwnerProfile();
        const data = res.data || res;
        setProfile(data);
        setForm({
          firstName: data.firstName || "",
          lastName: data.lastName || "",
          dob: data.dob || "",
        });
      } catch (err) {
        showError(typeof err === "string" ? err : "Failed to load profile.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const set = (key) => (e) => {
    setForm(f => ({ ...f, [key]: e.target.value }));
    if (formErrors[key]) setFormErrors(fe => ({ ...fe, [key]: "" }));
  };

  const validate = () => {
    const errs = {};
    if (!form.firstName.trim()) errs.firstName = "First name is required";
    else if (form.firstName.trim().length < 2) errs.firstName = "At least 2 characters";
    if (!form.lastName.trim()) errs.lastName = "Last name is required";
    if (form.dob && calculateAge(form.dob) < 18) errs.dob = "Must be at least 18 years old";
    return errs;
  };

  const handleSave = async () => {
    const errs = validate();
    if (Object.keys(errs).length > 0) { setFormErrors(errs); return; }

    setSaving(true);
    showLoader();
    try {
      await updateOwnerProfile({
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        dob: form.dob,
      });

      const res = await fetchOwnerProfile();
      const updatedData = res.data || res;

      setProfile(updatedData);
      updateUser({ firstName: updatedData.firstName, lastName: updatedData.lastName });
      setEditing(false);
      showSuccess("Profile updated successfully!");
    } catch (err) {
      showError(typeof err === "string" ? err : "Failed to update profile.");
    } finally {
      setSaving(false);
      hideLoader();
    }
  };

  const handleCancel = () => {
    setForm({
      firstName: profile?.firstName || "",
      lastName: profile?.lastName || "",
      dob: profile?.dob || "",
    });
    setFormErrors({});
    setEditing(false);
  };

  const fullName = `${profile?.firstName || ""} ${profile?.lastName || ""}`.trim();
  const age = calculateAge(profile?.dob);

  return (
    <Box sx={{ p: { xs: 2, sm: 4 }, bgcolor: "#FAFBFC", minHeight: "100vh" }}>
      <SuccessAlert open={open} message={message} onClose={closeSuccess} />
      <Box sx={{ width: "100%" }}>

        <Stack direction="row" sx={{ alignItems: "center", mb: 4, gap: 2 }}>
          <Tooltip title="Back to Dashboard">
            <IconButton
              onClick={() => navigate("/owner/dashboard")}
              sx={{ bgcolor: "white", border: "1px solid #E5E7EB", boxShadow: "0px 1px 2px rgba(16, 24, 40, 0.05)", "&:hover": { bgcolor: "#F3F4F6" } }}
            >
              <ArrowBackIcon sx={{ fontSize: 18, color: "#4B5563" }} />
            </IconButton>
          </Tooltip>
          <Box>
            <Typography sx={{ fontSize: { xs: 20, md: 24 }, fontWeight: 800, color: "#1E1154", letterSpacing: "-0.02em", lineHeight: 1.2 }}>
              My Profile
            </Typography>
            <Typography sx={{ fontSize: 13, color: "text.secondary", mt: 0.3, fontWeight: 500 }}>
              Manage your personal account information and security properties.
            </Typography>
          </Box>
        </Stack>
        <Paper
          elevation={0}
          sx={{
            maxWidth: 600,
            mx: "auto",
            border: "1px solid #E5E7EB",
            borderRadius: 4,
            overflow: "hidden",
            bgcolor: "white",
            boxShadow: "0px 1px 3px rgba(16, 24, 40, 0.1), 0px 1px 2px rgba(16, 24, 40, 0.06)"
          }}
        >

          <Box sx={{ height: 100, background: "linear-gradient(135deg, #5E35B1 0%, #7C3AED 100%)", position: "relative" }} />

          <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", px: 3, pb: 4, textAlign: "center", borderBottom: "1px solid #F3F4F6" }}>
            <Box sx={{ display: "flex", justifyContent: "center", mt: -6, mb: 2 }}>
              {loading ? (
                <Skeleton variant="circular" width={88} height={88} sx={{ border: "4px solid white" }} />
              ) : (

                <Avatar
                  sx={{
                    width: 88, height: 88,
                    border: "4px solid white",
                    boxShadow: "0px 12px 24px rgba(94, 53, 177, 0.18)",
                    bgcolor: "#5E35B1",
                    fontSize: 28, fontWeight: 800,
                  }}
                >
                  {getInitials(profile?.firstName, profile?.lastName, profile?.name)}
                </Avatar>
              )}
            </Box>

            {!loading && (
              <>
                <Typography sx={{ fontSize: 20, fontWeight: 800, color: "#1E1154", lineHeight: 1.2, mb: 0.5, textTransform: "capitalize" }}>
                  {fullName || "—"}
                </Typography>
                <Typography sx={{ fontSize: 13, color: "#6B7280", mb: 2, fontWeight: 500 }}>
                  {profile?.email}
                </Typography>

                {profile?.profileCompleted ? (
                  <Chip
                    icon={<VerifiedOutlinedIcon sx={{ fontSize: 14, "&&": { color: "#16A34A" } }} />}
                    label="Profile Complete"
                    size="small"
                    sx={{ bgcolor: "#F0FDF4", color: "#16A34A", border: "1px solid #BBF7D0", fontWeight: 700, fontSize: 11, py: 1.5, px: 0.5 }}
                  />
                ) : (
                  <Chip
                    label="Incomplete Profile"
                    size="small"
                    sx={{ bgcolor: "#FEF3C7", color: "#92400E", border: "1px solid #FDE68A", fontWeight: 700, fontSize: 11, py: 1.5, px: 0.5 }}
                  />
                )}
              </>
            )}
          </Box>

          <Box sx={{ p: { xs: 2.5, sm: 4 } }}>
            <Stack direction="row" sx={{ alignItems: "flex-start", justifyContent: "space-between", mb: 2.5 }}>
              <Box>
                <Typography sx={{ fontSize: 15, fontWeight: 800, color: "#1E1154", mb: 0.3 }}>
                  Personal Information
                </Typography>
                <Typography sx={{ fontSize: 13, color: "text.secondary", fontWeight: 500 }}>
                  Update your name and date of birth details.
                </Typography>
              </Box>

              {!editing ? (
                <Button
                  startIcon={<EditOutlinedIcon sx={{ fontSize: 14 }} />}
                  onClick={() => setEditing(true)}
                  sx={{
                    fontSize: 12, fontWeight: 700, textTransform: "none",
                    color: "#5E35B1", bgcolor: "#F5F3FF",
                    borderRadius: 2, py: 0.6, px: 2, mt: 0.5,
                    "&:hover": { bgcolor: "#EDE7F6" }
                  }}
                >
                  Edit
                </Button>
              ) : (
                <Stack direction="row" spacing={1} sx={{ mt: 0.5 }}>
                  <Button
                    size="small"
                    startIcon={<CloseOutlinedIcon sx={{ fontSize: 14 }} />}
                    onClick={handleCancel}
                    sx={{ fontSize: 12, fontWeight: 700, textTransform: "none", color: "#6B7280", border: "1px solid #E5E7EB", borderRadius: 2, py: 0.5 }}
                  >
                    Cancel
                  </Button>
                  <Button
                    size="small"
                    variant="contained"
                    startIcon={<SaveOutlinedIcon sx={{ fontSize: 14 }} />}
                    onClick={handleSave}
                    disabled={saving}
                    sx={{ fontSize: 12, fontWeight: 700, textTransform: "none", bgcolor: "#5E35B1", borderRadius: 2, py: 0.5, "&:hover": { bgcolor: "#4527A0" } }}
                  >
                    Save
                  </Button>
                </Stack>
              )}
            </Stack>

            {editing ? (
              <Grid container spacing={2} sx={{ mb: 4 }}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    label="First Name"
                    fullWidth
                    size="small"
                    value={form.firstName}
                    onChange={set("firstName")}
                    error={!!formErrors.firstName}
                    helperText={formErrors.firstName}
                    sx={premiumTextField}
                    slotProps={{ input: { startAdornment: <PersonOutlinedIcon sx={{ color: "#9CA3AF", fontSize: 18, mr: 1 }} /> } }}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    label="Last Name"
                    fullWidth
                    size="small"
                    value={form.lastName}
                    onChange={set("lastName")}
                    error={!!formErrors.lastName}
                    helperText={formErrors.lastName}
                    sx={premiumTextField}
                    slotProps={{ input: { startAdornment: <BadgeOutlinedIcon sx={{ color: "#9CA3AF", fontSize: 18, mr: 1 }} /> } }}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    label="Date of Birth" type="date" fullWidth size="small" value={form.dob} onChange={set("dob")} error={!!formErrors.dob} helperText={formErrors.dob}
                    slotProps={{
                      inputLabel: { shrink: true },
                      htmlInput: { max: new Date(Date.now() - 18 * 365.25 * 24 * 60 * 60 * 1000).toISOString().split("T")[0] },
                      input: { startAdornment: <CakeOutlinedIcon sx={{ color: "#9CA3AF", fontSize: 18, mr: 1 }} /> }
                    }}
                    sx={premiumTextField}
                  />
                </Grid>
              </Grid>
            ) : (
              <Stack spacing={1.5} sx={{ mb: 4 }}>
                {loading ? (
                  Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} height={54} sx={{ borderRadius: 2.5 }} />)
                ) : (
                  <>
                    <InfoRow icon={<PersonOutlinedIcon sx={{ fontSize: 18 }} />} label="First Name" value={profile?.firstName} />
                    <InfoRow icon={<BadgeOutlinedIcon sx={{ fontSize: 18 }} />} label="Last Name" value={profile?.lastName} />
                    <InfoRow
                      icon={<CakeOutlinedIcon sx={{ fontSize: 18 }} />} label="Date of Birth" value={formatDate(profile?.dob)}
                      chip={age && age > 0 ? (
                        <Chip
                          label={`${age} Years Old`}
                          size="small"
                          sx={{ fontSize: 10, fontWeight: 700, bgcolor: "#5E35B1", color: "white", height: 18 }}
                        />
                      ) : null}
                    />
                  </>
                )}
              </Stack>
            )}

            <Divider sx={{ my: 4 }} />

            <Stack direction="row" sx={{ alignItems: "flex-start", justifyContent: "space-between", mb: 2.5 }}>
              <Box>
                <Typography sx={{ fontSize: 15, fontWeight: 800, color: "#1E1154", mb: 0.3 }}>
                  Contact Information
                </Typography>
              </Box>
              <Chip
                icon={<LockOutlinedIcon sx={{ fontSize: "12px !important", color: "#6B7280" }} />}
                label="Read Only"
                size="small"
                sx={{ fontSize: 10, fontWeight: 700, bgcolor: "#F3F4F6", color: "#6B7280", border: "1px solid #E5E7EB", borderRadius: 1.5, mt: 0.5 }}
              />
            </Stack>

            <Stack spacing={1.5}>
              {loading ? (
                Array.from({ length: 2 }).map((_, i) => <Skeleton key={i} height={54} sx={{ borderRadius: 2.5 }} />)
              ) : (
                <>
                  <InfoRow icon={<EmailOutlinedIcon sx={{ fontSize: 18 }} />} label="Email Address" value={profile?.email} />
                  <InfoRow icon={<PhoneOutlinedIcon sx={{ fontSize: 18 }} />} label="Phone Number" value={profile?.phoneNumber ? `+91 ${profile.phoneNumber}` : "—"} />
                </>
              )}
            </Stack>

          </Box>
        </Paper>
      </Box>
    </Box>
  );
}