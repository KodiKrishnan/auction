import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, Button, Stack, Paper, MenuItem, 
  TextField, Alert, IconButton, Chip
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CloseIcon from '@mui/icons-material/Close'; 
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import CancelIcon from '@mui/icons-material/Cancel';
import ReplayIcon from '@mui/icons-material/Replay';
import { useNavigate } from 'react-router-dom';

// imports from your API and Context
import { uploadKycDocument, getKycStatus } from '../../owner/ownerAPI';
//import { useAuth } from '../../context/AuthContext'; // use this for user data
import { validate } from '../../../utils/validators/validate';
import { kycUploadSchema } from '../../../utils/validators/schemas';

const STATUS_CONFIG = {
  PENDING: {
    color: 'warning',
    icon: <HourglassEmptyIcon fontSize="small" />,
    label: 'Verification Pending',
    message: 'Your document has been submitted and is under review.',
  },
  VERIFIED: {
    color: 'success',
    icon: <CheckCircleIcon fontSize="small" />,
    label: 'KYC Verified',
    message: 'Your identity has been verified. You can now list properties.',
  },
  REJECTED: {
    color: 'error',
    icon: <CancelIcon fontSize="small" />,
    label: 'Verification Rejected',
    message: 'Your document was rejected. Please upload a valid document and resubmit.',
  },
  RESUBMITTED: {
    color: 'info',
    icon: <ReplayIcon fontSize="small" />,
    label: 'Resubmitted',
    message: 'Your resubmitted document is under review.',
  },
};

export default function KycUpload() {
  const navigate = useNavigate();
  const { user } = useAuth(); // Get the real logged-in user
  
  const [file, setFile] = useState(null);
  const [docType, setDocType] = useState('AADHAR');
  const [loading, setLoading] = useState(false);
  const [kycStatus, setKycStatus] = useState(null);
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState('');

  // 1. Load the actual status using the REAL user ID
  useEffect(() => {
    const loadKycStatus = async () => {
      if (!user?.id) return; // Wait until user data is loaded

      try {
        const data = await getKycStatus(user.id); // Passes numeric ID
        if (data && data.status) {
          setKycStatus(data.status);
        }
      } catch (err) {
        console.error("Failed to load KYC status", err);
        setKycStatus(null);
      }
    };
    loadKycStatus();
  }, [user?.id]);

  const handleFileChange = (e) => {
    if (e.target.files[0]) {
      setFile(e.target.files[0]);
      setErrors((prev) => ({ ...prev, file: '' }));
    }
  };

  // 2. Submit using the REAL user ID
  const handleSubmit = async (e) => {
    e.preventDefault();

    const result = validate(
      { file: file ? file.name : '', docType },
      kycUploadSchema()
    );

    if (!result.valid) {
      setErrors(result.errors);
      return;
    }
    
    if (!user?.id) {
        setSubmitError("Session expired. Please log in again.");
        return;
    }

    setErrors({});
    setSubmitError('');
    setLoading(true);

    try {
      // Passes numeric ID (e.g., 1) instead of the string 'user-id'
      await uploadKycDocument(user.id, docType, file); 
      
      setKycStatus(kycStatus === 'REJECTED' ? 'RESUBMITTED' : 'PENDING');
      setFile(null);
    } catch (err) {
      setSubmitError(err.message || 'Upload failed. Please check the file size and try again.');
    } finally {
      setLoading(false);
    }
  };

  const currentStatus = kycStatus ? STATUS_CONFIG[kycStatus] : null;
  const showUploadForm = !kycStatus || kycStatus === 'REJECTED';

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#F8F9FA' }}>
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        pt: 12, 
        pb: 4,
        px: 3,
        minHeight: '100vh',
        backgroundColor: 'background.default'
      }}>
        <Paper elevation={0} sx={{ 
          width: '100%', 
          maxWidth: 480, 
          borderRadius: 4, 
          position: 'relative',
          border: '1px solid #E5E7EB',
          boxShadow: '0px 10px 25px rgba(0, 0, 0, 0.04)',
          overflow: 'hidden'
        }}>
          
          <IconButton 
            onClick={() => navigate('/owner/dashboard')}
            sx={{ position: 'absolute', top: 12, right: 12, color: '#9CA3AF' }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>

          <Box sx={{ p: { xs: 3, md: 5 } }}>
            <Box sx={{ textAlign: 'center', mb: 4 }}>
              <Typography variant="h5" sx={{ fontWeight: 800, color: '#1E1154', mb: 1 }}>
                Identity Verification
              </Typography>
              <Typography variant="body2" sx={{ color: '#6B7280', px: 2 }}>
                Upload your government-issued ID to start listing properties.
              </Typography>
            </Box>

            {currentStatus && (
              <Box sx={{ 
                mb: 3, 
                p: 2.5, 
                borderRadius: 3, 
                bgcolor: kycStatus === 'VERIFIED' ? '#F0FDF4' 
                       : kycStatus === 'REJECTED'  ? '#FEF2F2' 
                       : kycStatus === 'RESUBMITTED' ? '#EFF6FF'
                       : '#FFFBEB',
                border: '1px solid',
                borderColor: kycStatus === 'VERIFIED' ? '#BBF7D0' 
                           : kycStatus === 'REJECTED'  ? '#FECACA' 
                           : kycStatus === 'RESUBMITTED' ? '#BFDBFE'
                           : '#FDE68A',
              }}>
                <Stack direction="row" sx={{ alignItems: 'center', gap: 1, mb: 1 }}>
                  <Chip
                    icon={currentStatus.icon}
                    label={currentStatus.label}
                    color={currentStatus.color}
                    size="small"
                    sx={{ fontWeight: 700 }}
                  />
                </Stack>
                <Typography variant="body2" sx={{ color: '#374151' }}>
                  {currentStatus.message}
                </Typography>
              </Box>
            )}

            {showUploadForm && (
              <Stack spacing={3} component="form" onSubmit={handleSubmit}>
                {kycStatus === 'REJECTED' && (
                  <Alert severity="warning" sx={{ borderRadius: 2, fontSize: '0.8rem' }}>
                    Please upload a new valid document to resubmit.
                  </Alert>
                )}

                <Box>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: '#374151', mb: 1, display: 'block' }}>
                    DOCUMENT TYPE
                  </Typography>
                  <TextField
                    select
                    fullWidth
                    size="small"
                    value={docType}
                    onChange={(e) => {
                      setDocType(e.target.value);
                      setErrors((prev) => ({ ...prev, docType: '' }));
                    }}
                    error={!!errors.docType}
                    helperText={errors.docType}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                  >
                    <MenuItem value="AADHAR">Aadhar Card</MenuItem>
                    <MenuItem value="PAN">PAN Card</MenuItem>
                    <MenuItem value="PASSPORT">Passport</MenuItem>
                  </TextField>
                </Box>

                <Box>
                  <Box
                    sx={{ 
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      border: errors.file ? '2px dashed #EF4444' : '2px dashed #E5E7EB', 
                      borderRadius: 3, 
                      py: 4, 
                      px: 2,
                      textAlign: 'center',
                      bgcolor: file ? '#F5F3FF' : '#FAFBFC',
                      cursor: 'pointer',
                      transition: '0.2s',
                      '&:hover': { borderColor: '#5E35B1', bgcolor: '#F5F3FF' }
                    }}
                    component="label"
                  >
                    <input type="file" hidden onChange={handleFileChange} accept="image/*,application/pdf" />
                    {file ? (
                      <CheckCircleIcon sx={{ fontSize: 32, color: '#5E35B1', mb: 1 }} />
                    ) : (
                      <CloudUploadIcon sx={{ fontSize: 32, color: errors.file ? '#EF4444' : '#9CA3AF', mb: 1 }} />
                    )}
                    <Typography variant="body2" sx={{ fontWeight: 700, color: errors.file ? '#EF4444' : '#111827' }}>
                      {file ? file.name : 'Upload Document'}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#9CA3AF' }}>
                      PNG, JPG or PDF (Max 5MB)
                    </Typography>
                  </Box>
                  {errors.file && (
                    <Typography variant="caption" sx={{ color: 'error.main', mt: 0.5, display: 'block', ml: 1 }}>
                      {errors.file}
                    </Typography>
                  )}
                </Box>

                {submitError && (
                  <Alert severity="error" sx={{ borderRadius: 2, fontSize: '0.8rem' }}>
                    {submitError}
                  </Alert>
                )}

                <Button 
                  variant="contained" 
                  type="submit" 
                  fullWidth 
                  disabled={loading}
                  sx={{ 
                    bgcolor: '#5E35B1', 
                    py: 1.5, 
                    borderRadius: 2, 
                    fontWeight: 700,
                    textTransform: 'none',
                    boxShadow: 'none',
                    '&:hover': { bgcolor: '#4527A0', boxShadow: 'none' } 
                  }}
                >
                  {loading ? 'Submitting...' : kycStatus === 'REJECTED' ? 'Resubmit Document' : 'Submit for Verification'}
                </Button>
              </Stack>
            )}
          </Box>
        </Paper>
      </Box>
    </Box>
  );
}