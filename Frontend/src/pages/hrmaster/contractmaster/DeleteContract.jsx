// import React, { useState } from 'react';
// import {
//   Dialog,
//   DialogTitle,
//   DialogContent,
//   DialogActions,
//   Button,
//   Typography,
//   Stack,
//   Alert,
//   CircularProgress
// } from '@mui/material';
// import { Delete as DeleteIcon } from '@mui/icons-material';
// import axios from 'axios';
// import BASE_URL from '../../../config/Config';

// const DeleteContract = ({ open, onClose, contract, onDelete }) => {
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState('');
//   if (!contract) return null;

//   const handleDelete = async () => {
//     setLoading(true);
//     setError('');
//     try {
//       const token = localStorage.getItem('token');
//       const response = await axios.delete(`${BASE_URL}/api/contract-agencies/${contract._id}`, {
//         headers: { Authorization: `Bearer ${token}` }
//       });
//       if (response.data.success) {
//         if (onDelete) onDelete(contract._id);
//         onClose();
//       } else {
//         setError(response.data.message || 'Failed to delete agency');
//       }
//     } catch (err) {
//       setError(err.response?.data?.message || 'Failed to delete agency. Please try again.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
//       <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
//         <DeleteIcon color="error" />
//         Confirm Delete
//       </DialogTitle>
//       <DialogContent>
//         <Stack spacing={2}>
//           <Typography>
//             Are you sure you want to delete the agency <strong>{contract.AgencyName || 'this item'}</strong>?
//           </Typography>
//           {error && <Alert severity="error">{error}</Alert>}
//         </Stack>
//       </DialogContent>
//       <DialogActions>
//         <Button onClick={onClose} disabled={loading} sx={{ textTransform: 'none' }}>
//           Cancel
//         </Button>
//         <Button onClick={handleDelete} variant="contained" color="error" disabled={loading} sx={{ textTransform: 'none' }}>
//           {loading ? <CircularProgress size={20} color="inherit" /> : 'Delete'}
//         </Button>
//       </DialogActions>
//     </Dialog>
//   );
// };

// export default DeleteContract;


// import React, { useState } from 'react';
// import {
//   Dialog,
//   DialogTitle,
//   DialogContent,
//   DialogActions,
//   Button,
//   Typography,
//   Stack,
//   Alert,
//   CircularProgress,
//   Box
// } from '@mui/material';
// import { Delete as DeleteIcon, Warning as WarningIcon } from '@mui/icons-material';
// import axios from 'axios';
// import BASE_URL from '../../../config/Config';

// const COLORS = {
//   primary: '#063C3F',
//   error: '#EF4444',
//   text: { primary: '#151C26', secondary: '#4B5568' },
//   background: { white: '#FFFFFF', light: '#F8FFFC' },
//   border: '#E3E8EF'
// };

// const DeleteContract = ({ open, onClose, contract, onDelete }) => {
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState('');
  
//   if (!contract) return null;

//   const handleDelete = async () => {
//     setLoading(true);
//     setError('');
//     try {
//       const token = localStorage.getItem('token');
//       const response = await axios.delete(`${BASE_URL}/api/contract-agencies/${contract._id}`, {
//         headers: { Authorization: `Bearer ${token}` }
//       });
//       if (response.data.success) {
//         if (onDelete) onDelete(contract._id);
//         onClose();
//       } else {
//         setError(response.data.message || 'Failed to delete agency');
//       }
//     } catch (err) {
//       console.error('Delete agency error:', err);
//       setError(err.response?.data?.message || 'Failed to delete agency. Please try again.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
//       <DialogTitle sx={{ borderBottom: `1px solid ${COLORS.border}`, pb: 2 }}>
//         <Stack direction="row" alignItems="center" spacing={1}>
//           <DeleteIcon sx={{ color: COLORS.error }} />
//           <Typography variant="h6" sx={{ fontSize: '1rem', fontWeight: 700 }}>
//             Confirm Delete
//           </Typography>
//         </Stack>
//       </DialogTitle>
//       <DialogContent sx={{ p: 3 }}>
//         <Stack spacing={2}>
//           <Stack direction="row" spacing={1} alignItems="flex-start">
//             <WarningIcon sx={{ color: COLORS.error, fontSize: '1.25rem', mt: 0.25 }} />
//             <Typography variant="body2" color={COLORS.text.primary}>
//               Are you sure you want to delete the agency <strong>"{contract.AgencyName}"</strong>?
//               <br />
//               <Box component="span" sx={{ color: COLORS.text.secondary, fontSize: '0.7rem' }}>
//                 This action cannot be undone.
//               </Box>
//             </Typography>
//           </Stack>
//           {error && <Alert severity="error" onClose={() => setError('')}>{error}</Alert>}
//         </Stack>
//       </DialogContent>
//       <DialogActions sx={{ p: 2.5, borderTop: `1px solid ${COLORS.border}` }}>
//         <Button 
//           onClick={onClose} 
//           disabled={loading} 
//           sx={{ textTransform: 'none', color: COLORS.text.secondary }}
//         >
//           Cancel
//         </Button>
//         <Button 
//           onClick={handleDelete} 
//           variant="contained" 
//           color="error" 
//           disabled={loading} 
//           sx={{ textTransform: 'none' }}
//         >
//           {loading ? <CircularProgress size={20} color="inherit" /> : 'Delete Agency'}
//         </Button>
//       </DialogActions>
//     </Dialog>
//   );
// };

// export default DeleteContract;


import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Alert,
  Avatar,
  Stack,
  Box,
  Chip,
  Divider,
  CircularProgress
} from '@mui/material';
import { 
  Delete as DeleteIcon,
  Warning as WarningIcon,
  Business as BusinessIcon,
  Email,
  Phone,
  Badge,
  Person,
  LocationOn
} from '@mui/icons-material';
import axios from 'axios';
import BASE_URL from '../../../config/Config';

// Header gradient matching DeleteEmployees
const HEADER_GRADIENT = "linear-gradient(135deg, #a30f0f 0%, #df2a30 100%)";

// Color constants
const COLORS = {
  primary: '#063C3F',
  primaryDark: '#05292B',
  text: {
    primary: '#151C26',
    secondary: '#4B5568',
    tertiary: '#94A3B8',
    light: '#FFFFFF'
  },
  background: {
    white: '#FFFFFF',
    light: '#F8FAFC',
    hover: '#F0FDF9'
  },
  border: '#E3E8EF'
};

const DeleteContract = ({ open, onClose, contract, onDelete }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!contract) return null;

  const getAvatarInitials = (agencyName) => {
    if (!agencyName) return 'A';
    const words = agencyName.split(' ');
    if (words.length === 1) return agencyName.charAt(0).toUpperCase();
    return (words[0].charAt(0) + words[words.length - 1].charAt(0)).toUpperCase();
  };

  // Get avatar color based on agency name
  const getAvatarColor = (agencyName) => {
    if (!agencyName) return '#063C3F';
    
    const colors = [
      '#164e63', // cyan-900
      '#0e7490', // cyan-700
      '#0891b2', // cyan-600
      '#0c4a6e', // blue-900
      '#1d4ed8', // blue-700
      '#7c3aed', // violet-600
      '#7e22ce', // purple-700
      '#be185d', // pink-700
      '#c2410c', // orange-700
      '#059669'  // emerald-600
    ];
    
    const charCode = agencyName.charCodeAt(0) || 0;
    return colors[charCode % colors.length];
  };

  const handleDelete = async () => {
    if (!contract?._id) return;

    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const response = await axios.delete(`${BASE_URL}/api/contract-agencies/${contract._id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.data.success) {
        if (onDelete) onDelete(contract._id);
        onClose();
      } else {
        setError(response.data.message || 'Failed to delete agency');
      }
    } catch (err) {
      console.error('Error deleting agency:', err);
      setError(err.response?.data?.message || 'Failed to delete agency. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const statusLabel = contract.IsActive ? 'Active' : 'Inactive';
  const statusColor = contract.IsActive ? 'success' : 'default';
  const statusBg = contract.IsActive ? '#E8F5E9' : '#F5F5F5';
  const statusTextColor = contract.IsActive ? '#2E7D32' : '#616161';

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: { 
          borderRadius: 2,
          overflow: 'hidden'
        }
      }}
    >
      {/* Header with gradient background */}
      <DialogTitle sx={{
        background: HEADER_GRADIENT,
        py: 2.5,
        px: 3
      }}>
        <div style={{
          fontSize: '20px',
          fontWeight: '600',
          color: '#FFFFFF',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <DeleteIcon sx={{ color: '#FFFFFF' }} />
          Confirm Delete
        </div>
      </DialogTitle>

      <DialogContent sx={{ pt: 3, px: 3 }}>
        <div>
          {/* Agency Info Card */}
          <Stack 
            direction="row" 
            spacing={2} 
            alignItems="center" 
            sx={{ 
              mb: 3,
              p: 2,
              bgcolor: '#F8FAFC',
              borderRadius: 2,
              border: '1px solid #E0E0E0'
            }}
          >
            <Avatar
              sx={{
                width: 70,
                height: 70,
                bgcolor: getAvatarColor(contract?.AgencyName),
                fontSize: '1.5rem',
                fontWeight: 600
              }}
            >
              {getAvatarInitials(contract?.AgencyName)}
            </Avatar>
            <Box flex={1}>
              <Typography variant="h6" fontWeight={600} color="#101010">
                {contract?.AgencyName || 'N/A'}
              </Typography>
              
              <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 0.5 }}>
                <Badge fontSize="small" sx={{ color: '#64748B' }} />
                <Typography variant="body2" color="textSecondary">
                  Code: {contract?.AgencyCode || 'N/A'}
                </Typography>
              </Stack>

              <Stack direction="row" spacing={2} sx={{ mt: 1 }}>
                <Chip
                  label="Contract Agency"
                  size="small"
                  sx={{ 
                    fontWeight: 500,
                    backgroundColor: '#dbeafe',
                    color: '#1e40af',
                    border: '1px solid #bfdbfe'
                  }}
                />
                <Chip
                  label={statusLabel}
                  size="small"
                  sx={{ 
                    fontWeight: 500,
                    bgcolor: statusBg,
                    color: statusTextColor,
                    border: `1px solid ${contract.IsActive ? '#c8e6c9' : '#e0e0e0'}`
                  }}
                />
              </Stack>
            </Box>
          </Stack>

          {/* Contact Person and Phone Info */}
          <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
            <Box sx={{ flex: 1, p: 1.5, bgcolor: '#F1F5F9', borderRadius: 1.5 }}>
              <Stack direction="row" spacing={1} alignItems="center">
                <Person sx={{ fontSize: 18, color: '#64748B' }} />
                <Typography variant="body2" color="textSecondary">Contact Person:</Typography>
              </Stack>
              <Typography variant="body2" fontWeight={600} sx={{ mt: 0.5, ml: 3.5 }}>
                {contract?.ContactPerson || 'N/A'}
              </Typography>
            </Box>
            <Box sx={{ flex: 1, p: 1.5, bgcolor: '#F1F5F9', borderRadius: 1.5 }}>
              <Stack direction="row" spacing={1} alignItems="center">
                <Phone sx={{ fontSize: 18, color: '#64748B' }} />
                <Typography variant="body2" color="textSecondary">Contact Phone:</Typography>
              </Stack>
              <Typography variant="body2" fontWeight={600} sx={{ mt: 0.5, ml: 3.5 }}>
                {contract?.ContactPhone || 'N/A'}
              </Typography>
            </Box>
          </Stack>

          {/* Contact Email and Address - Optional, only if available */}
          {(contract?.ContactEmail || contract?.Address) && (
            <Box sx={{ mb: 3, p: 1.5, bgcolor: '#F1F5F9', borderRadius: 1.5 }}>
              <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1, color: '#1976D2' }}>
                Contact Information
              </Typography>
              <Stack spacing={1.5}>
                {contract?.ContactEmail && (
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Email sx={{ fontSize: 16, color: '#64748B' }} />
                    <Typography variant="body2">{contract.ContactEmail}</Typography>
                  </Stack>
                )}
                {contract?.Address && (
                  <Stack direction="row" spacing={1} alignItems="flex-start">
                    <LocationOn sx={{ fontSize: 16, color: '#64748B' }} />
                    <Typography variant="body2" sx={{ flex: 1 }}>
                      {contract.Address}
                    </Typography>
                  </Stack>
                )}
              </Stack>
            </Box>
          )}

          <Divider sx={{ my: 2 }} />

          {/* Warning Messages */}
          <Stack spacing={2}>
            <Typography variant="body1" sx={{ fontSize: '1rem', fontWeight: 500 }}>
              Are you sure you want to delete this agency?
            </Typography>
            
            <Alert 
              severity="warning" 
              icon={<WarningIcon />}
              sx={{ 
                borderRadius: 1.5,
                backgroundColor: '#FFF3E0',
                border: '1px solid #FFE0B2'
              }}
            >
              <Typography variant="body2" fontWeight={600} color="#F57C00">
                ⚠️ This action cannot be undone!
              </Typography>
              <Typography variant="body2" color="#F57C00" sx={{ mt: 0.5 }}>
                All agency records, including agency information, contact details, 
                address, and notes will be permanently deleted from the system.
              </Typography>
            </Alert>

            <Alert 
              severity="info"
              sx={{ 
                borderRadius: 1.5,
                backgroundColor: '#E3F2FD',
                border: '1px solid #BBDEFB'
              }}
            >
              <Typography variant="body2" color="#1976D2">
                ℹ️ Consider marking the agency as 'Inactive' instead of deleting,
                to maintain historical records and references.
              </Typography>
            </Alert>
          </Stack>

          {error && (
            <Alert
              severity="error"
              sx={{
                mt: 3,
                borderRadius: 1.5,
                '& .MuiAlert-icon': {
                  alignItems: 'center'
                }
              }}
            >
              {error}
            </Alert>
          )}
        </div>
      </DialogContent>

      <DialogActions sx={{
        px: 3,
        pb: 3,
        pt: 2,
        backgroundColor: '#F8FAFC',
        borderTop: '1px solid #E0E0E0'
      }}>
        <Button
          onClick={onClose}
          disabled={loading}
          sx={{
            borderRadius: 1.5,
            px: 3,
            py: 1,
            textTransform: 'none',
            fontWeight: 500,
            border: '1px solid #E0E0E0',
            color: '#64748B',
            '&:hover': {
              backgroundColor: '#F1F5F9'
            }
          }}
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          color="error"
          onClick={handleDelete}
          disabled={loading}
          startIcon={loading ? null : <DeleteIcon />}
          sx={{
            borderRadius: 1.5,
            px: 3,
            py: 1,
            textTransform: 'none',
            fontWeight: 500,
            backgroundColor: '#D32F2F',
            '&:hover': {
              backgroundColor: '#C62828'
            },
            '&.Mui-disabled': {
              backgroundColor: '#FFCDD2'
            }
          }}
        >
          {loading ? <CircularProgress size={20} color="inherit" /> : 'Permanently Delete'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DeleteContract;