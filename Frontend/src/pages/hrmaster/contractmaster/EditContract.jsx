// import React, { useState, useEffect } from 'react';
// import {
//   Dialog,
//   DialogTitle,
//   DialogContent,
//   DialogActions,
//   Button,
//   Stack,
//   Typography,
//   TextField,
//   FormControl,
//   InputLabel,
//   Select,
//   MenuItem,
//   Alert,
//   CircularProgress,
//   InputAdornment,
//   IconButton
// } from '@mui/material';
// import { Close as CloseIcon, Edit as EditIcon } from '@mui/icons-material';
// import axios from 'axios';
// import BASE_URL from '../../../config/Config';

// const COLORS = {
//   primary: '#063C3F',
//   text: { primary: '#151C26', secondary: '#4B5568', tertiary: '#94A3B8' },
//   background: { white: '#FFFFFF', light: '#F8FFFC' },
//   border: '#E3E8EF'
// };

// const EditContract = ({ open, onClose, contract, onUpdate }) => {
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState('');
//   const [formData, setFormData] = useState({
//     AgencyCode: '',
//     AgencyName: '',
//     ContactPerson: '',
//     ContactPhone: '',
//     ContactEmail: '',
//     Address: '',
//     Notes: '',
//     IsActive: true
//   });
//   const [fieldErrors, setFieldErrors] = useState({});

//   useEffect(() => {
//     if (open && contract) {
//       setFormData({
//         AgencyCode: contract.AgencyCode || '',
//         AgencyName: contract.AgencyName || '',
//         ContactPerson: contract.ContactPerson || '',
//         ContactPhone: contract.ContactPhone || '',
//         ContactEmail: contract.ContactEmail || '',
//         Address: contract.Address || '',
//         Notes: contract.Notes || '',
//         IsActive: contract.IsActive ?? true
//       });
//       setFieldErrors({});
//       setError('');
//     }
//   }, [open, contract]);

//   const validate = () => {
//     const errors = {};
//     if (!formData.AgencyCode) errors.AgencyCode = 'Agency code is required';
//     if (!formData.AgencyName) errors.AgencyName = 'Agency name is required';
//     if (!formData.ContactPerson) errors.ContactPerson = 'Contact person is required';
//     if (!formData.ContactPhone) errors.ContactPhone = 'Contact phone is required';
//     if (!formData.ContactEmail) errors.ContactEmail = 'Contact email is required';
//     setFieldErrors(errors);
//     return Object.keys(errors).length === 0;
//   };

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData((prev) => ({ ...prev, [name]: value }));
//     if (fieldErrors[name]) {
//       setFieldErrors((prev) => ({ ...prev, [name]: value ? '' : prev[name] }));
//     }
//   };

//   const handleSubmit = async () => {
//     if (!validate()) return;
//     setLoading(true);
//     setError('');
//     try {
//       const token = localStorage.getItem('token');
//       const response = await axios.put(
//         `${BASE_URL}/api/contract-agencies/${contract?._id}`,
//         formData,
//         {
//           headers: {
//             Authorization: `Bearer ${token}`,
//             'Content-Type': 'application/json'
//           }
//         }
//       );
//       if (response.data.success) {
//         if (onUpdate) onUpdate(response.data.data);
//         onClose();
//       } else {
//         setError(response.data.message || 'Failed to update agency');
//       }
//     } catch (err) {
//       setError(err.response?.data?.message || 'Failed to update agency. Please try again.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
//       <DialogTitle sx={{ bgcolor: COLORS.background.light, borderBottom: `1px solid ${COLORS.border}` }}>
//         <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1}>
//           <Stack direction="row" spacing={1} alignItems="center">
//             <EditIcon sx={{ color: COLORS.primary }} />
//             <Typography variant="h6" sx={{ fontSize: '1rem', fontWeight: 700 }}>
//               Edit Contract Agency
//             </Typography>
//           </Stack>
//           <IconButton onClick={onClose} size="small">
//             <CloseIcon />
//           </IconButton>
//         </Stack>
//       </DialogTitle>
//       <DialogContent sx={{ p: 3, bgcolor: COLORS.background.white }}>
//         <Stack spacing={2}>
//           {error && <Alert severity="error">{error}</Alert>}
//           <TextField
//             label="Agency Code"
//             name="AgencyCode"
//             value={formData.AgencyCode}
//             onChange={handleChange}
//             error={!!fieldErrors.AgencyCode}
//             helperText={fieldErrors.AgencyCode}
//             fullWidth
//             size="small"
//             sx={{ bgcolor: COLORS.background.light }}
//           />
//           <TextField
//             label="Agency Name"
//             name="AgencyName"
//             value={formData.AgencyName}
//             onChange={handleChange}
//             error={!!fieldErrors.AgencyName}
//             helperText={fieldErrors.AgencyName}
//             fullWidth
//             size="small"
//             sx={{ bgcolor: COLORS.background.light }}
//           />
//           <TextField
//             label="Contact Person"
//             name="ContactPerson"
//             value={formData.ContactPerson}
//             onChange={handleChange}
//             error={!!fieldErrors.ContactPerson}
//             helperText={fieldErrors.ContactPerson}
//             fullWidth
//             size="small"
//             sx={{ bgcolor: COLORS.background.light }}
//           />
//           <TextField
//             label="Contact Phone"
//             name="ContactPhone"
//             value={formData.ContactPhone}
//             onChange={handleChange}
//             error={!!fieldErrors.ContactPhone}
//             helperText={fieldErrors.ContactPhone}
//             fullWidth
//             size="small"
//             sx={{ bgcolor: COLORS.background.light }}
//             InputProps={{ startAdornment: <InputAdornment position="start">+91</InputAdornment> }}
//           />
//           <TextField
//             label="Contact Email"
//             name="ContactEmail"
//             value={formData.ContactEmail}
//             onChange={handleChange}
//             error={!!fieldErrors.ContactEmail}
//             helperText={fieldErrors.ContactEmail}
//             fullWidth
//             size="small"
//             sx={{ bgcolor: COLORS.background.light }}
//           />
//           <TextField
//             label="Address"
//             name="Address"
//             value={formData.Address}
//             onChange={handleChange}
//             fullWidth
//             multiline
//             minRows={2}
//             size="small"
//             sx={{ bgcolor: COLORS.background.light }}
//           />
//           <TextField
//             label="Notes"
//             name="Notes"
//             value={formData.Notes}
//             onChange={handleChange}
//             fullWidth
//             multiline
//             minRows={2}
//             size="small"
//             sx={{ bgcolor: COLORS.background.light }}
//           />
//           <FormControl fullWidth size="small">
//             <InputLabel id="isActive-label">Status</InputLabel>
//             <Select
//               labelId="isActive-label"
//               label="Status"
//               name="IsActive"
//               value={formData.IsActive}
//               onChange={(e) => setFormData((prev) => ({ ...prev, IsActive: e.target.value }))}
//               sx={{ bgcolor: COLORS.background.light }}
//             >
//               <MenuItem value={true}>Active</MenuItem>
//               <MenuItem value={false}>Inactive</MenuItem>
//             </Select>
//           </FormControl>
//         </Stack>
//       </DialogContent>
//       <DialogActions sx={{ p: 2.5, bgcolor: COLORS.background.white }}>
//         <Button onClick={onClose} disabled={loading} sx={{ textTransform: 'none' }}>
//           Cancel
//         </Button>
//         <Button onClick={handleSubmit} variant="contained" disabled={loading} sx={{ textTransform: 'none' }}>
//           {loading ? <CircularProgress size={20} color="inherit" /> : 'Update Agency'}
//         </Button>
//       </DialogActions>
//     </Dialog>
//   );
// };

// export default EditContract;

// import React, { useState, useEffect } from 'react';
// import {
//   Dialog,
//   DialogTitle,
//   DialogContent,
//   DialogActions,
//   Button,
//   Stack,
//   Typography,
//   TextField,
//   FormControl,
//   InputLabel,
//   Select,
//   MenuItem,
//   Alert,
//   CircularProgress,
//   InputAdornment,
//   IconButton
// } from '@mui/material';
// import { Close as CloseIcon, Edit as EditIcon } from '@mui/icons-material';
// import axios from 'axios';
// import BASE_URL from '../../../config/Config';

// const COLORS = {
//   primary: '#063C3F',
//   primaryDark: '#05292B',
//   text: { primary: '#151C26', secondary: '#4B5568', tertiary: '#94A3B8' },
//   background: { white: '#FFFFFF', light: '#F8FFFC' },
//   border: '#E3E8EF'
// };

// const EditContract = ({ open, onClose, contract, onUpdate }) => {
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState('');
//   const [formData, setFormData] = useState({
//     AgencyCode: '',
//     AgencyName: '',
//     ContactPerson: '',
//     ContactPhone: '',
//     ContactEmail: '',
//     Address: '',
//     Notes: '',
//     IsActive: true
//   });
//   const [fieldErrors, setFieldErrors] = useState({});

//   useEffect(() => {
//     if (open && contract) {
//       setFormData({
//         AgencyCode: contract.AgencyCode || '',
//         AgencyName: contract.AgencyName || '',
//         ContactPerson: contract.ContactPerson || '',
//         ContactPhone: contract.ContactPhone || '',
//         ContactEmail: contract.ContactEmail || '',
//         Address: contract.Address || '',
//         Notes: contract.Notes || '',
//         IsActive: contract.IsActive ?? true
//       });
//       setFieldErrors({});
//       setError('');
//     }
//   }, [open, contract]);

//   const validate = () => {
//     const errors = {};
//     if (!formData.AgencyCode?.trim()) errors.AgencyCode = 'Agency code is required';
//     if (!formData.AgencyName?.trim()) errors.AgencyName = 'Agency name is required';
//     if (!formData.ContactPerson?.trim()) errors.ContactPerson = 'Contact person is required';
//     if (!formData.ContactPhone?.trim()) errors.ContactPhone = 'Contact phone is required';
//     if (!formData.ContactEmail?.trim()) errors.ContactEmail = 'Contact email is required';
//     else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.ContactEmail)) {
//       errors.ContactEmail = 'Invalid email format';
//     }
//     setFieldErrors(errors);
//     return Object.keys(errors).length === 0;
//   };

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData((prev) => ({ ...prev, [name]: value }));
//     if (fieldErrors[name]) {
//       setFieldErrors((prev) => ({ ...prev, [name]: '' }));
//     }
//   };

//   const handleSubmit = async () => {
//     if (!validate()) return;
//     setLoading(true);
//     setError('');
//     try {
//       const token = localStorage.getItem('token');
//       const response = await axios.put(
//         `${BASE_URL}/api/contract-agencies/${contract?._id}`,
//         {
//           AgencyCode: formData.AgencyCode.trim(),
//           AgencyName: formData.AgencyName.trim(),
//           ContactPerson: formData.ContactPerson.trim(),
//           ContactPhone: formData.ContactPhone.trim(),
//           ContactEmail: formData.ContactEmail.trim(),
//           Address: formData.Address?.trim() || '',
//           Notes: formData.Notes?.trim() || '',
//           IsActive: formData.IsActive
//         },
//         {
//           headers: {
//             Authorization: `Bearer ${token}`,
//             'Content-Type': 'application/json'
//           }
//         }
//       );
//       if (response.data.success) {
//         if (onUpdate) onUpdate(response.data.data);
//         onClose();
//       } else {
//         setError(response.data.message || 'Failed to update agency');
//       }
//     } catch (err) {
//       console.error('Update agency error:', err);
//       setError(err.response?.data?.message || 'Failed to update agency. Please try again.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   if (!open) return null;

//   return (
//     <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
//       <DialogTitle sx={{ bgcolor: COLORS.background.light, borderBottom: `1px solid ${COLORS.border}`, p: 2 }}>
//         <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1}>
//           <Stack direction="row" spacing={1} alignItems="center">
//             <EditIcon sx={{ color: COLORS.primary }} />
//             <Typography variant="h6" sx={{ fontSize: '1rem', fontWeight: 700 }}>
//               Edit Contract Agency
//             </Typography>
//           </Stack>
//           <IconButton onClick={onClose} size="small">
//             <CloseIcon />
//           </IconButton>
//         </Stack>
//       </DialogTitle>
//       <DialogContent sx={{ p: 3, bgcolor: COLORS.background.white }}>
//         <Stack spacing={2.5}>
//           {error && <Alert severity="error" onClose={() => setError('')}>{error}</Alert>}
//           <TextField
//             label="Agency Code"
//             name="AgencyCode"
//             value={formData.AgencyCode}
//             onChange={handleChange}
//             error={!!fieldErrors.AgencyCode}
//             helperText={fieldErrors.AgencyCode}
//             fullWidth
//             size="small"
//             required
//             sx={{ bgcolor: COLORS.background.light }}
//           />
//           <TextField
//             label="Agency Name"
//             name="AgencyName"
//             value={formData.AgencyName}
//             onChange={handleChange}
//             error={!!fieldErrors.AgencyName}
//             helperText={fieldErrors.AgencyName}
//             fullWidth
//             size="small"
//             required
//             sx={{ bgcolor: COLORS.background.light }}
//           />
//           <TextField
//             label="Contact Person"
//             name="ContactPerson"
//             value={formData.ContactPerson}
//             onChange={handleChange}
//             error={!!fieldErrors.ContactPerson}
//             helperText={fieldErrors.ContactPerson}
//             fullWidth
//             size="small"
//             required
//             sx={{ bgcolor: COLORS.background.light }}
//           />
//           <TextField
//             label="Contact Phone"
//             name="ContactPhone"
//             value={formData.ContactPhone}
//             onChange={handleChange}
//             error={!!fieldErrors.ContactPhone}
//             helperText={fieldErrors.ContactPhone}
//             fullWidth
//             size="small"
//             required
//             sx={{ bgcolor: COLORS.background.light }}
//             InputProps={{ startAdornment: <InputAdornment position="start">+91</InputAdornment> }}
//           />
//           <TextField
//             label="Contact Email"
//             name="ContactEmail"
//             value={formData.ContactEmail}
//             onChange={handleChange}
//             error={!!fieldErrors.ContactEmail}
//             helperText={fieldErrors.ContactEmail}
//             fullWidth
//             size="small"
//             required
//             type="email"
//             sx={{ bgcolor: COLORS.background.light }}
//           />
//           <TextField
//             label="Address"
//             name="Address"
//             value={formData.Address}
//             onChange={handleChange}
//             fullWidth
//             multiline
//             rows={2}
//             size="small"
//             sx={{ bgcolor: COLORS.background.light }}
//           />
//           <TextField
//             label="Notes"
//             name="Notes"
//             value={formData.Notes}
//             onChange={handleChange}
//             fullWidth
//             multiline
//             rows={2}
//             size="small"
//             sx={{ bgcolor: COLORS.background.light }}
//           />
//           <FormControl fullWidth size="small">
//             <InputLabel id="isActive-label">Status</InputLabel>
//             <Select
//               labelId="isActive-label"
//               label="Status"
//               name="IsActive"
//               value={formData.IsActive}
//               onChange={(e) => setFormData((prev) => ({ ...prev, IsActive: e.target.value }))}
//               sx={{ bgcolor: COLORS.background.light }}
//             >
//               <MenuItem value={true}>Active</MenuItem>
//               <MenuItem value={false}>Inactive</MenuItem>
//             </Select>
//           </FormControl>
//         </Stack>
//       </DialogContent>
//       <DialogActions sx={{ p: 2.5, bgcolor: COLORS.background.white, borderTop: `1px solid ${COLORS.border}` }}>
//         <Button onClick={onClose} disabled={loading} sx={{ textTransform: 'none', color: COLORS.text.secondary }}>
//           Cancel
//         </Button>
//         <Button 
//           onClick={handleSubmit} 
//           variant="contained" 
//           disabled={loading} 
//           sx={{ 
//             textTransform: 'none', 
//             bgcolor: COLORS.primary,
//             '&:hover': { bgcolor: COLORS.primaryDark }
//           }}
//         >
//           {loading ? <CircularProgress size={20} color="inherit" /> : 'Update Agency'}
//         </Button>
//       </DialogActions>
//     </Dialog>
//   );
// };

// export default EditContract;


import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Stack,
  Typography,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  InputAdornment,
  Box,
  Grid,
  Paper,
  Chip
} from '@mui/material';
import { Close as CloseIcon, Edit as EditIcon, Business as BusinessIcon } from '@mui/icons-material';
import axios from 'axios';
import BASE_URL from '../../../config/Config';

// Color constants matching EditEmployees
const COLORS = {
  primary: '#063C3F',
  primaryLight: '#E8F0F1',
  primaryDark: '#05292B',
  text: {
    primary: '#151C26',
    secondary: '#4B5568',
    tertiary: '#94A3B8',
    light: '#FFFFFF',
    lightMuted: 'rgba(255, 255, 255, 0.9)'
  },
  background: {
    white: '#FFFFFF',
    light: '#F8FFFC',
    hover: '#F0FDF9',
    tableHeader: '#063C3F'
  },
  border: '#E3E8EF',
  status: {
    success: '#9FE2BF',
    warning: '#FEF3C7',
    error: '#FEE2E2',
    info: '#E0F2FE'
  },
  chips: {
    active: '#9FE2BF',
    inactive: '#F1F5F9',
    suspended: '#FEF3C7',
    locked: '#FEE2E2'
  }
};

// Shared styles matching EditEmployees
const textFieldStyles = {
  '& .MuiOutlinedInput-root': {
    borderRadius: 1.5,
    fontSize: '0.75rem',
    '&:hover fieldset': { borderColor: COLORS.primary },
    '&.Mui-focused fieldset': { borderColor: COLORS.primary, borderWidth: 1 },
    '&.Mui-error fieldset': { borderColor: '#EF4444' }
  },
  '& .MuiInputBase-input': {
    py: 1,
    px: 1.5,
    fontSize: '0.75rem',
    color: COLORS.text.primary,
    '&::placeholder': {
      color: COLORS.text.tertiary,
      fontSize: '0.75rem'
    }
  }
};

const selectStyles = {
  borderRadius: 1.5,
  fontSize: '0.75rem',
  '& .MuiSelect-select': {
    py: 1,
    fontSize: '0.75rem'
  },
  '&:hover .MuiOutlinedInput-notchedOutline': {
    borderColor: COLORS.primary
  },
  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
    borderColor: COLORS.primary,
    borderWidth: 1
  }
};

const EditContract = ({ open, onClose, contract, onUpdate }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    AgencyCode: '',
    AgencyName: '',
    ContactPerson: '',
    ContactPhone: '',
    ContactEmail: '',
    Address: '',
    Notes: '',
    IsActive: true
  });
  const [fieldErrors, setFieldErrors] = useState({});
  const [touched, setTouched] = useState({});

  useEffect(() => {
    if (open && contract) {
      setFormData({
        AgencyCode: contract.AgencyCode || '',
        AgencyName: contract.AgencyName || '',
        ContactPerson: contract.ContactPerson || '',
        ContactPhone: contract.ContactPhone || '',
        ContactEmail: contract.ContactEmail || '',
        Address: contract.Address || '',
        Notes: contract.Notes || '',
        IsActive: contract.IsActive ?? true
      });
      setFieldErrors({});
      setTouched({});
      setError('');
    }
  }, [open, contract]);

  // Validation helpers
  const validateAgencyCode = (code) => {
    const codeRegex = /^[A-Za-z0-9\-_]+$/;
    return code === '' || codeRegex.test(code);
  };

  const validateAgencyName = (name) => {
    const nameRegex = /^[A-Za-z0-9\s.'&-]+$/;
    return name === '' || nameRegex.test(name);
  };

  const validateContactPerson = (name) => {
    const nameRegex = /^[A-Za-z\s.'-]+$/;
    return name === '' || nameRegex.test(name);
  };

  const validatePhone = (phone) => {
    const cleanPhone = phone.replace(/[\s\-]/g, '').replace(/^\+91/, '');
    const phoneRegex = /^[6-9]\d{9}$/;
    return cleanPhone === '' || phoneRegex.test(cleanPhone);
  };

  const validateEmail = (email) => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return email === '' || emailRegex.test(email);
  };

  const validateAddress = (address) => {
    const addressRegex = /^[A-Za-z0-9\s,.#\-/]+$/;
    return address === '' || addressRegex.test(address);
  };

  const validateField = (name, value) => {
    switch (name) {
      case 'AgencyCode':
        if (value && !validateAgencyCode(value)) {
          return 'Only letters, numbers, hyphens, and underscores allowed';
        }
        break;
      case 'AgencyName':
        if (value && !validateAgencyName(value)) {
          return 'Only letters, numbers, spaces, dots, and hyphens allowed';
        }
        break;
      case 'ContactPerson':
        if (value && !validateContactPerson(value)) {
          return 'Only letters, spaces, dots, and hyphens allowed';
        }
        break;
      case 'ContactPhone':
        if (value && !validatePhone(value)) {
          return 'Please enter a valid 10-digit mobile number starting with 6-9';
        }
        break;
      case 'ContactEmail':
        if (value && !validateEmail(value)) {
          return 'Please enter a valid email address';
        }
        break;
      case 'Address':
        if (value && !validateAddress(value)) {
          return 'Address contains invalid characters';
        }
        break;
      default:
        return '';
    }
    return '';
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    let processedValue = value;

    // Apply field-specific formatting
    switch (name) {
      case 'AgencyCode':
        processedValue = value.replace(/[^A-Za-z0-9\-_]/g, '');
        break;
      case 'AgencyName':
        processedValue = value.replace(/[^A-Za-z0-9\s.'&-]/g, '');
        break;
      case 'ContactPerson':
        processedValue = value.replace(/[^A-Za-z\s.'-]/g, '');
        break;
      case 'ContactPhone':
        processedValue = value.replace(/\D/g, '').slice(0, 10);
        break;
      case 'ContactEmail':
        processedValue = value.toLowerCase().replace(/\s/g, '');
        break;
      case 'Address':
        processedValue = value.replace(/[^A-Za-z0-9\s,.#\-/]/g, '');
        break;
      default:
        processedValue = value;
    }

    setFormData(prev => ({ ...prev, [name]: processedValue }));

    if (touched[name] || processedValue) {
      const errorMessage = validateField(name, processedValue);
      setFieldErrors(prev => ({ ...prev, [name]: errorMessage }));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    const errorMessage = validateField(name, value);
    setFieldErrors(prev => ({ ...prev, [name]: errorMessage }));
  };

  const validateForm = () => {
    const errors = {};
    let isValid = true;

    if (!formData.AgencyCode?.trim()) {
      errors.AgencyCode = 'Agency code is required';
      isValid = false;
    } else {
      const codeError = validateField('AgencyCode', formData.AgencyCode);
      if (codeError) {
        errors.AgencyCode = codeError;
        isValid = false;
      }
    }

    if (!formData.AgencyName?.trim()) {
      errors.AgencyName = 'Agency name is required';
      isValid = false;
    } else {
      const nameError = validateField('AgencyName', formData.AgencyName);
      if (nameError) {
        errors.AgencyName = nameError;
        isValid = false;
      }
    }

    if (!formData.ContactPerson?.trim()) {
      errors.ContactPerson = 'Contact person is required';
      isValid = false;
    } else {
      const personError = validateField('ContactPerson', formData.ContactPerson);
      if (personError) {
        errors.ContactPerson = personError;
        isValid = false;
      }
    }

    if (!formData.ContactPhone?.trim()) {
      errors.ContactPhone = 'Contact phone is required';
      isValid = false;
    } else {
      const phoneError = validateField('ContactPhone', formData.ContactPhone);
      if (phoneError) {
        errors.ContactPhone = phoneError;
        isValid = false;
      }
    }

    if (!formData.ContactEmail?.trim()) {
      errors.ContactEmail = 'Contact email is required';
      isValid = false;
    } else {
      const emailError = validateField('ContactEmail', formData.ContactEmail);
      if (emailError) {
        errors.ContactEmail = emailError;
        isValid = false;
      }
    }

    if (formData.Address) {
      const addressError = validateField('Address', formData.Address);
      if (addressError) {
        errors.Address = addressError;
        isValid = false;
      }
    }

    setFieldErrors(errors);
    if (!isValid) {
      setError('Please fix the errors above');
    }
    return isValid;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(
        `${BASE_URL}/api/contract-agencies/${contract?._id}`,
        {
          AgencyCode: formData.AgencyCode.trim(),
          AgencyName: formData.AgencyName.trim(),
          ContactPerson: formData.ContactPerson.trim(),
          ContactPhone: formData.ContactPhone.trim(),
          ContactEmail: formData.ContactEmail.trim(),
          Address: formData.Address?.trim() || '',
          Notes: formData.Notes?.trim() || '',
          IsActive: formData.IsActive
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      if (response.data.success) {
        if (onUpdate) onUpdate(response.data.data);
        onClose();
      } else {
        setError(response.data.message || 'Failed to update agency');
      }
    } catch (err) {
      console.error('Update agency error:', err);
      setError(err.response?.data?.message || 'Failed to update agency. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    onClose();
  };

  if (!open) return null;

  const statusLabel = formData.IsActive ? 'Active' : 'Inactive';
  const statusColor = formData.IsActive ? '#166534' : '#4B5563';
  const statusBg = formData.IsActive ? '#D1FAE5' : '#F3F4F6';

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 5,
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05)',
          border: `1px solid ${COLORS.border}`,
          overflow: 'hidden'
        }
      }}
    >
      <DialogTitle sx={{
        borderBottom: `1px solid ${COLORS.border}`,
        py: 1.5,
        px: 2.5,
        bgcolor: COLORS.background.white,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <Stack direction="row" spacing={1} alignItems="center">
          <EditIcon sx={{ fontSize: '1.2rem', color: COLORS.primary }} />
          <Typography sx={{ fontSize: '1.2rem', fontWeight: 700, color: COLORS.text.primary }}>
            Edit Contract Agency
          </Typography>
        </Stack>

        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          {contract?._id && (
            <Chip
              label={`ID: ${contract._id.slice(-6)}`}
              size="small"
              sx={{
                fontSize: '0.65rem',
                fontWeight: 500,
                height: 20,
                bgcolor: COLORS.background.light,
                color: COLORS.text.secondary,
                border: `1px solid ${COLORS.border}`,
              }}
            />
          )}
          <Chip
            label={statusLabel}
            size="small"
            sx={{
              fontSize: '0.65rem',
              fontWeight: 500,
              height: 20,
              bgcolor: statusBg,
              color: statusColor,
            }}
          />
        </Box>
      </DialogTitle>

      <DialogContent sx={{ p: 2.5, bgcolor: COLORS.background.white }}>
        <Stack spacing={2}>
          {/* Agency Information Section */}
          <Paper sx={{
            p: 2,
            bgcolor: COLORS.background.white,
            borderRadius: 1.5,
            border: `1px solid ${COLORS.border}`,
            boxShadow: 'none'
          }}>
            <Typography sx={{
              fontSize: '0.8rem',
              fontWeight: 600,
              color: COLORS.primary,
              mb: 1.5,
              display: 'flex',
              alignItems: 'center',
              gap: 0.5
            }}>
              <BusinessIcon sx={{ fontSize: '1rem' }} />
              Agency Information
            </Typography>

            <Grid container spacing={1.5}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                  <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary, letterSpacing: '0.5px' }}>
                    AGENCY CODE <span style={{ color: '#EF4444' }}>*</span>
                  </Typography>
                  <TextField
                    fullWidth
                    size="small"
                    name="AgencyCode"
                    value={formData.AgencyCode}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    disabled={loading}
                    placeholder="e.g., AG-001"
                    error={!!fieldErrors.AgencyCode}
                    helperText={fieldErrors.AgencyCode}
                    sx={textFieldStyles}
                  />
                  <Typography sx={{ fontSize: '0.65rem', color: COLORS.text.tertiary }}>
                    Letters, numbers, hyphens, and underscores only
                  </Typography>
                </Box>
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                  <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary, letterSpacing: '0.5px' }}>
                    AGENCY NAME <span style={{ color: '#EF4444' }}>*</span>
                  </Typography>
                  <TextField
                    fullWidth
                    size="small"
                    name="AgencyName"
                    value={formData.AgencyName}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    disabled={loading}
                    placeholder="e.g., ABC Corporation"
                    error={!!fieldErrors.AgencyName}
                    helperText={fieldErrors.AgencyName}
                    sx={textFieldStyles}
                  />
                  <Typography sx={{ fontSize: '0.65rem', color: COLORS.text.tertiary }}>
                    Letters, numbers, spaces, dots, and hyphens only
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Paper>

          {/* Contact Information Section */}
          <Paper sx={{
            p: 2,
            bgcolor: COLORS.background.white,
            borderRadius: 1.5,
            border: `1px solid ${COLORS.border}`,
            boxShadow: 'none'
          }}>
            <Typography sx={{
              fontSize: '0.8rem',
              fontWeight: 600,
              color: COLORS.primary,
              mb: 1.5
            }}>
              Contact Information
            </Typography>

            <Grid container spacing={1.5}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                  <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary, letterSpacing: '0.5px' }}>
                    CONTACT PERSON <span style={{ color: '#EF4444' }}>*</span>
                  </Typography>
                  <TextField
                    fullWidth
                    size="small"
                    name="ContactPerson"
                    value={formData.ContactPerson}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    disabled={loading}
                    placeholder="e.g., John Doe"
                    error={!!fieldErrors.ContactPerson}
                    helperText={fieldErrors.ContactPerson}
                    sx={textFieldStyles}
                  />
                  <Typography sx={{ fontSize: '0.65rem', color: COLORS.text.tertiary }}>
                    Letters, spaces, dots, and hyphens only
                  </Typography>
                </Box>
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                  <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary, letterSpacing: '0.5px' }}>
                    CONTACT PHONE <span style={{ color: '#EF4444' }}>*</span>
                  </Typography>
                  <TextField
                    fullWidth
                    size="small"
                    name="ContactPhone"
                    value={formData.ContactPhone}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    disabled={loading}
                    placeholder="9876543210"
                    error={!!fieldErrors.ContactPhone}
                    helperText={fieldErrors.ContactPhone}
                    inputProps={{ maxLength: 10 }}
                    sx={textFieldStyles}
                    InputProps={{
                      startAdornment: <InputAdornment position="start" sx={{ '& .MuiTypography-root': { fontSize: '0.75rem' } }}>+91</InputAdornment>,
                    }}
                  />
                  <Typography sx={{ fontSize: '0.65rem', color: COLORS.text.tertiary }}>
                    10-digit mobile number starting with 6-9
                  </Typography>
                </Box>
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                  <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary, letterSpacing: '0.5px' }}>
                    CONTACT EMAIL <span style={{ color: '#EF4444' }}>*</span>
                  </Typography>
                  <TextField
                    fullWidth
                    size="small"
                    name="ContactEmail"
                    type="email"
                    value={formData.ContactEmail}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    disabled={loading}
                    placeholder="contact@company.com"
                    error={!!fieldErrors.ContactEmail}
                    helperText={fieldErrors.ContactEmail}
                    sx={textFieldStyles}
                  />
                  <Typography sx={{ fontSize: '0.65rem', color: COLORS.text.tertiary }}>
                    e.g., contact@company.com
                  </Typography>
                </Box>
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                  <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary, letterSpacing: '0.5px' }}>
                    STATUS
                  </Typography>
                  <FormControl fullWidth size="small">
                    <Select
                      name="IsActive"
                      value={formData.IsActive}
                      onChange={(e) => setFormData(prev => ({ ...prev, IsActive: e.target.value }))}
                      disabled={loading}
                      sx={selectStyles}
                    >
                      <MenuItem value={true}>Active</MenuItem>
                      <MenuItem value={false}>Inactive</MenuItem>
                    </Select>
                  </FormControl>
                </Box>
              </Grid>
            </Grid>
          </Paper>

          {/* Address & Notes Section */}
          <Paper sx={{
            p: 2,
            bgcolor: COLORS.background.white,
            borderRadius: 1.5,
            border: `1px solid ${COLORS.border}`,
            boxShadow: 'none'
          }}>
            <Typography sx={{
              fontSize: '0.8rem',
              fontWeight: 600,
              color: COLORS.primary,
              mb: 1.5
            }}>
              Address & Notes
            </Typography>

            <Grid container spacing={1.5}>
              <Grid size={{ xs: 12 }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                  <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary, letterSpacing: '0.5px' }}>
                    ADDRESS
                  </Typography>
                  <TextField
                    fullWidth
                    size="small"
                    name="Address"
                    value={formData.Address}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    multiline
                    rows={2}
                    disabled={loading}
                    placeholder="Enter complete address"
                    error={!!fieldErrors.Address}
                    helperText={fieldErrors.Address}
                    sx={textFieldStyles}
                  />
                </Box>
              </Grid>

              <Grid size={{ xs: 12 }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                  <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary, letterSpacing: '0.5px' }}>
                    NOTES
                  </Typography>
                  <TextField
                    fullWidth
                    size="small"
                    name="Notes"
                    value={formData.Notes}
                    onChange={handleChange}
                    multiline
                    rows={2}
                    disabled={loading}
                    placeholder="Any additional notes about the agency"
                    sx={textFieldStyles}
                  />
                </Box>
              </Grid>
            </Grid>
          </Paper>

          {error && (
            <Alert
              severity="error"
              onClose={() => setError('')}
              sx={{
                borderRadius: 1.5,
                fontSize: '0.75rem',
                py: 0.5,
                '& .MuiAlert-icon': { fontSize: '1.25rem' }
              }}
            >
              {error}
            </Alert>
          )}
        </Stack>
      </DialogContent>

      <DialogActions sx={{
        px: 2.5,
        py: 1.5,
        borderTop: `1px solid ${COLORS.border}`,
        bgcolor: COLORS.background.white,
        justifyContent: 'flex-end',
        gap: 1
      }}>
        <Button
          onClick={handleClose}
          disabled={loading}
          size="small"
          sx={{
            height: 32,
            px: 2,
            borderRadius: 1.5,
            border: `1px solid ${COLORS.border}`,
            color: COLORS.text.secondary,
            fontSize: '0.7rem',
            fontWeight: 500,
            textTransform: 'none',
            '&:hover': {
              borderColor: COLORS.primary,
              bgcolor: `${COLORS.primary}10`
            }
          }}
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={loading}
          size="small"
          startIcon={loading ? <CircularProgress size={14} color="inherit" /> : <EditIcon sx={{ fontSize: '1rem' }} />}
          sx={{
            height: 32,
            px: 2,
            borderRadius: 1.5,
            bgcolor: COLORS.primary,
            fontSize: '0.7rem',
            fontWeight: 500,
            textTransform: 'none',
            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
            '&:hover': {
              bgcolor: COLORS.primaryDark,
            }
          }}
        >
          {loading ? 'Updating...' : 'Update Agency'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditContract;