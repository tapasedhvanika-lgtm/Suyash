// import React, { useState, useEffect } from 'react';
// import {
//   Dialog,
//   DialogTitle,
//   DialogContent,
//   DialogActions,
//   Button,
//   TextField,
//   Stack,
//   Alert,
//   MenuItem,
//   Grid,
//   CircularProgress,
//   Stepper,
//   Step,
//   StepLabel,
//   Box,
//   Typography,
//   styled,
//   StepConnector,
//   stepConnectorClasses,
//   Paper,
//   IconButton,
//   Tooltip,
//   InputAdornment,
//   Autocomplete,
//   Chip
// } from '@mui/material';
// import {
//   Add as AddIcon,
//   Search as SearchIcon,
//   Warning as WarningIcon,
//   Error as ErrorIcon,
//   NavigateNext as NavigateNextIcon,
//   NavigateBefore as NavigateBeforeIcon,
//   Warehouse as WarehouseIcon,
//   Person as PersonIcon,
//   CheckCircle as CheckCircleIcon,
//   Percent as PercentIcon,
//   AttachMoney as MoneyIcon
// } from '@mui/icons-material';
// import axios from 'axios';
// import BASE_URL from '../../../config/Config';
// import AddEmployees from '../../hrmaster/employeemaster/AddEmployees';

// // Color constants
// const COLORS = {
//   primary: '#063C3F',
//   primaryLight: '#E8F0F1',
//   primaryDark: '#05292B',
//   text: {
//     primary: '#151C26',
//     secondary: '#4B5568',
//     tertiary: '#94A3B8',
//     light: '#FFFFFF'
//   },
//   background: {
//     white: '#FFFFFF',
//     light: '#F8FFFC'
//   },
//   border: '#E3E8EF'
// };

// // Verification types based on schema enum
// const VERIFICATION_TYPES = ['Full Count', 'Cycle Count', 'Spot Check', 'Pre-Audit Count'];

// // Action types based on schema enum
// const ACTION_TYPES = ['Adjust Up', 'Adjust Down', 'No Action', 'Write Off', 'Investigate Further'];

// // 🔥 Modern Stepper Connector
// const ColorConnector = styled(StepConnector)(({ theme }) => ({
//   [`&.${stepConnectorClasses.active}`]: {
//     [`& .${stepConnectorClasses.line}`]: {
//       backgroundImage: 'linear-gradient(135deg, #063C3F 0%, #00B4D8 50%, #05292B 100%)',
//     },
//   },
//   [`&.${stepConnectorClasses.completed}`]: {
//     [`& .${stepConnectorClasses.line}`]: {
//       backgroundImage: 'linear-gradient(135deg, #063C3F 0%, #00B4D8 50%, #05292B 100%)',
//     },
//   },
//   [`& .${stepConnectorClasses.line}`]: {
//     height: 3,
//     border: 0,
//     backgroundColor: '#eaeaf0',
//     borderRadius: 1,
//   },
// }));

// const steps = ['Basic Information', 'Verification Settings'];

// const AddPSV = ({ open, onClose, onAdd }) => {
//   const [activeStep, setActiveStep] = useState(0);
//   const [loading, setLoading] = useState(false);
//   const [fetching, setFetching] = useState(false);
//   const [errors, setErrors] = useState({});
//   const [apiError, setApiError] = useState('');
  
//   // Modal states for Add functionality
//   const [addEmployeeOpen, setAddEmployeeOpen] = useState(false);
//   const [employeeTypeForAdd, setEmployeeTypeForAdd] = useState(''); // 'conducted_by' or 'witness'
  
//   // Data states
//   const [employees, setEmployees] = useState([]);
//   const [warehouses, setWarehouses] = useState([]);
  
//   const [formData, setFormData] = useState({
//     warehouse_id: '',
//     verification_type: 'Cycle Count',
//     conducted_by: '',
//     witness: '',
//     variance_threshold_percent: 5,
//     variance_threshold_amount: 1000,
//     action: 'No Action',
//     remarks: ''
//   });

//   useEffect(() => {
//     if (open) {
//       fetchEmployees();
//       fetchWarehouses();
//       resetForm();
//     }
//   }, [open]);

//   const fetchEmployees = async () => {
//     try {
//       const token = localStorage.getItem('token');
//       const res = await axios.get(`${BASE_URL}/api/employees?limit=1000`, {
//         headers: { Authorization: `Bearer ${token}` }
//       });
//       if (res.data.success) {
//         setEmployees(res.data.data || []);
//       }
//     } catch (err) {
//       console.error('Error fetching employees:', err);
//     }
//   };

//   const fetchWarehouses = async () => {
//     try {
//       setFetching(true);
//       const token = localStorage.getItem('token');
//       const res = await axios.get(`${BASE_URL}/api/warehouses?limit=1000`, {
//         headers: { Authorization: `Bearer ${token}` }
//       });
//       if (res.data.success) {
//         setWarehouses(res.data.data || []);
//       }
//     } catch (err) {
//       console.error('Error fetching warehouses:', err);
//     } finally {
//       setFetching(false);
//     }
//   };

//   const resetForm = () => {
//     setFormData({
//       warehouse_id: '',
//       verification_type: 'Cycle Count',
//       conducted_by: '',
//       witness: '',
//       variance_threshold_percent: 5,
//       variance_threshold_amount: 1000,
//       action: 'No Action',
//       remarks: ''
//     });
//     setErrors({});
//     setApiError('');
//     setActiveStep(0);
//   };

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData(prev => ({ ...prev, [name]: value }));
//     if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
//   };

//   const handleAutocompleteChange = (name, value) => {
//     setFormData(prev => ({ ...prev, [name]: value?._id || '' }));
//     if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
//   };

//   // Handler for Add Employee modal
//   const handleEmployeeAdded = (newEmployee) => {
//     setEmployees(prev => [...prev, newEmployee]);
//     if (employeeTypeForAdd === 'conducted_by') {
//       setFormData(prev => ({ ...prev, conducted_by: newEmployee._id }));
//     } else if (employeeTypeForAdd === 'witness') {
//       setFormData(prev => ({ ...prev, witness: newEmployee._id }));
//     }
//     setEmployeeTypeForAdd('');
//   };

//   const validateStep = (step) => {
//     const newErrors = {};
//     let isValid = true;

//     switch (step) {
//       case 0: // Basic Information
//         if (!formData.warehouse_id) {
//           newErrors.warehouse_id = 'Warehouse is required';
//           isValid = false;
//         }
//         if (!formData.verification_type) {
//           newErrors.verification_type = 'Verification type is required';
//           isValid = false;
//         }
//         if (!formData.conducted_by) {
//           newErrors.conducted_by = 'Conducted By is required';
//           isValid = false;
//         }
//         break;
      
//       case 1: // Verification Settings
//         if (!formData.variance_threshold_percent && formData.variance_threshold_percent !== 0) {
//           newErrors.variance_threshold_percent = 'Variance threshold percent is required';
//           isValid = false;
//         } else if (formData.variance_threshold_percent < 0) {
//           newErrors.variance_threshold_percent = 'Variance threshold percent must be >= 0';
//           isValid = false;
//         } else if (formData.variance_threshold_percent > 100) {
//           newErrors.variance_threshold_percent = 'Variance threshold percent must be <= 100';
//           isValid = false;
//         }
//         if (!formData.variance_threshold_amount && formData.variance_threshold_amount !== 0) {
//           newErrors.variance_threshold_amount = 'Variance threshold amount is required';
//           isValid = false;
//         } else if (formData.variance_threshold_amount < 0) {
//           newErrors.variance_threshold_amount = 'Variance threshold amount must be >= 0';
//           isValid = false;
//         }
//         break;
      
//       default:
//         return true;
//     }

//     setErrors(newErrors);
//     if (!isValid) {
//       setApiError('Please fix the errors in this section');
//     }
//     return isValid;
//   };

//   const handleNext = () => {
//     if (validateStep(activeStep)) {
//       setApiError('');
//       setActiveStep((prevStep) => prevStep + 1);
//     }
//   };

//   const handleBack = () => {
//     setApiError('');
//     setActiveStep((prevStep) => prevStep - 1);
//   };

//   const handleSubmit = async () => {
//     if (!validateStep(1)) return;
    
//     setLoading(true);
//     setApiError('');
    
//     try {
//       const token = localStorage.getItem('token');
      
//       const payload = {
//         warehouse_id: formData.warehouse_id,
//         verification_type: formData.verification_type,
//         conducted_by: formData.conducted_by,
//         witness: formData.witness || '',
//         variance_threshold_percent: Number(formData.variance_threshold_percent),
//         variance_threshold_amount: Number(formData.variance_threshold_amount),
//         action: formData.action,
//         remarks: formData.remarks || ''
//       };
      
//       const response = await axios.post(`${BASE_URL}/api/physical-verifications`, payload, {
//         headers: { 
//           Authorization: `Bearer ${token}`, 
//           'Content-Type': 'application/json' 
//         }
//       });
      
//       if (response.data.success) {
//         if (onAdd) onAdd(response.data.data);
//         onClose();
//       } else {
//         setErrors(prev => ({ ...prev, submit: response.data.message || 'Failed to create Physical Stock Verification' }));
//       }
//     } catch (err) {
//       console.error('API Error:', err);
      
//       if (err.response) {
//         const errorMsg = err.response.data?.message || err.response.data?.error || 'Failed to create Physical Stock Verification';
//         setApiError(errorMsg);
//         setErrors(prev => ({ ...prev, submit: errorMsg }));
//       } else if (err.request) {
//         setApiError('No response from server. Please check your connection.');
//       } else {
//         setApiError(err.message || 'An error occurred while creating Physical Stock Verification');
//       }
//     } finally { 
//       setLoading(false); 
//     }
//   };

//   // Display helper functions
//   const getPersonName = (person) => {
//     if (!person) return '';
//     if (person.FirstName && person.LastName) return `${person.FirstName} ${person.LastName}`;
//     if (person.FirstName) return person.FirstName;
//     if (person.Username) return person.Username;
//     if (person.Email) return person.Email;
//     if (person.name) return person.name;
//     return person._id || '';
//   };

//   const getWarehouseDisplay = (wh) => {
//     if (!wh) return '';
//     return wh.warehouse_name || wh.name || wh.warehouse_code || wh._id || '';
//   };

//   const inputStyle = {
//     '& .MuiOutlinedInput-root': {
//       borderRadius: 1.5,
//       fontSize: '0.75rem',
//       '&:hover fieldset': { borderColor: COLORS.primary },
//       '&.Mui-focused fieldset': { borderColor: COLORS.primary, borderWidth: 1 }
//     },
//     '& .MuiInputBase-input': {
//       py: 1,
//       px: 1.5,
//       fontSize: '0.75rem',
//       color: COLORS.text.primary,
//       '&::placeholder': {
//         color: COLORS.text.tertiary,
//         fontSize: '0.75rem'
//       }
//     }
//   };

//   const labelStyle = {
//     fontSize: '0.7rem',
//     fontWeight: 600,
//     color: COLORS.text.secondary,
//     letterSpacing: '0.5px',
//     mb: 0.5
//   };

//   const renderStepContent = (step) => {
//     switch (step) {
//       case 0:
//         return (
//           <Stack spacing={2}>
//             <Paper sx={{ p: 2.5, bgcolor: COLORS.background.white, borderRadius: 2, border: `1px solid ${COLORS.border}` }}>
//               <Typography variant="subtitle2" sx={{ color: COLORS.primary, mb: 2, fontWeight: 600, fontSize: '0.9rem' }}>
//                 Basic Information
//               </Typography>
              
//               <Grid container spacing={2}>
//                 {/* Warehouse Selection */}
//                 <Grid size={{ xs: 12 }}>
//                   <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//                     <Typography sx={labelStyle}>
//                       WAREHOUSE <span style={{ color: '#EF4444' }}>*</span>
//                     </Typography>
//                     <Autocomplete
//                       fullWidth
//                       options={warehouses}
//                       getOptionLabel={getWarehouseDisplay}
//                       onChange={(e, val) => handleAutocompleteChange('warehouse_id', val)}
//                       loading={fetching}
//                       isOptionEqualToValue={(option, value) => option._id === value?._id}
//                       renderInput={(params) => (
//                         <TextField
//                           {...params}
//                           size="small"
//                           error={!!errors.warehouse_id}
//                           helperText={errors.warehouse_id}
//                           placeholder="Select warehouse for verification"
//                           sx={inputStyle}
//                           InputProps={{
//                             ...params.InputProps,
//                             startAdornment: (
//                               <InputAdornment position="start">
//                                 <WarehouseIcon sx={{ fontSize: '0.9rem', color: COLORS.text.tertiary }} />
//                               </InputAdornment>
//                             ),
//                           }}
//                         />
//                       )}
//                     />
//                   </Box>
//                 </Grid>
                
//                 {/* Verification Type */}
//                 <Grid size={{ xs: 12, md: 6 }}>
//                   <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//                     <Typography sx={labelStyle}>
//                       VERIFICATION TYPE <span style={{ color: '#EF4444' }}>*</span>
//                     </Typography>
//                     <TextField
//                       select
//                       fullWidth
//                       size="small"
//                       name="verification_type"
//                       value={formData.verification_type}
//                       onChange={handleChange}
//                       error={!!errors.verification_type}
//                       helperText={errors.verification_type}
//                       sx={inputStyle}
//                     >
//                       {VERIFICATION_TYPES.map((option) => (
//                         <MenuItem key={option} value={option} sx={{ fontSize: '0.75rem' }}>
//                           {option}
//                         </MenuItem>
//                       ))}
//                     </TextField>
//                   </Box>
//                 </Grid>
                
//                 {/* Conducted By with Add button */}
//                 <Grid size={{ xs: 12, md: 6 }}>
//                   <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//                     <Typography sx={labelStyle}>
//                       CONDUCTED BY <span style={{ color: '#EF4444' }}>*</span>
//                     </Typography>
//                     <Box sx={{ display: 'flex', gap: 1 }}>
//                       <Box sx={{ flex: 1 }}>
//                         <Autocomplete
//                           fullWidth
//                           options={employees}
//                           getOptionLabel={getPersonName}
//                           onChange={(e, val) => handleAutocompleteChange('conducted_by', val)}
//                           isOptionEqualToValue={(option, value) => option._id === value?._id}
//                           renderInput={(params) => (
//                             <TextField
//                               {...params}
//                               size="small"
//                               error={!!errors.conducted_by}
//                               helperText={errors.conducted_by}
//                               placeholder="Select person conducting verification"
//                               sx={inputStyle}
//                               InputProps={{
//                                 ...params.InputProps,
//                                 startAdornment: (
//                                   <InputAdornment position="start">
//                                     <PersonIcon sx={{ fontSize: '0.9rem', color: COLORS.text.tertiary }} />
//                                   </InputAdornment>
//                                 ),
//                               }}
//                             />
//                           )}
//                         />
//                       </Box>
//                       <Button
//                         variant="outlined"
//                         size="small"
//                         onClick={() => {
//                           setEmployeeTypeForAdd('conducted_by');
//                           setAddEmployeeOpen(true);
//                         }}
//                         startIcon={<AddIcon sx={{ fontSize: '0.875rem' }} />}
//                         sx={{
//                           height: 36,
//                           minWidth: 'auto',
//                           px: 1.5,
//                           borderRadius: 1.5,
//                           border: `1px solid ${COLORS.border}`,
//                           color: COLORS.text.secondary,
//                           fontSize: '0.7rem',
//                           fontWeight: 500,
//                           textTransform: 'none',
//                           whiteSpace: 'nowrap',
//                           '&:hover': {
//                             borderColor: COLORS.primary,
//                             bgcolor: `${COLORS.primary}10`,
//                             color: COLORS.primary
//                           }
//                         }}
//                       >
//                         Add New
//                       </Button>
//                     </Box>
//                   </Box>
//                 </Grid>
                
//                 {/* Witness with Add button */}
//                 <Grid size={{ xs: 12, md: 6 }}>
//                   <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//                     <Typography sx={labelStyle}>
//                       WITNESS <span style={{ color: '#94A3B8', fontSize: '0.65rem' }}>(Optional)</span>
//                     </Typography>
//                     <Box sx={{ display: 'flex', gap: 1 }}>
//                       <Box sx={{ flex: 1 }}>
//                         <Autocomplete
//                           fullWidth
//                           options={employees}
//                           getOptionLabel={getPersonName}
//                           onChange={(e, val) => handleAutocompleteChange('witness', val)}
//                           isOptionEqualToValue={(option, value) => option._id === value?._id}
//                           renderInput={(params) => (
//                             <TextField
//                               {...params}
//                               size="small"
//                               error={!!errors.witness}
//                               helperText={errors.witness}
//                               placeholder="Select witness (optional)"
//                               sx={inputStyle}
//                               InputProps={{
//                                 ...params.InputProps,
//                                 startAdornment: (
//                                   <InputAdornment position="start">
//                                     <PersonIcon sx={{ fontSize: '0.9rem', color: COLORS.text.tertiary }} />
//                                   </InputAdornment>
//                                 ),
//                               }}
//                             />
//                           )}
//                         />
//                       </Box>
//                       <Button
//                         variant="outlined"
//                         size="small"
//                         onClick={() => {
//                           setEmployeeTypeForAdd('witness');
//                           setAddEmployeeOpen(true);
//                         }}
//                         startIcon={<AddIcon sx={{ fontSize: '0.875rem' }} />}
//                         sx={{
//                           height: 36,
//                           minWidth: 'auto',
//                           px: 1.5,
//                           borderRadius: 1.5,
//                           border: `1px solid ${COLORS.border}`,
//                           color: COLORS.text.secondary,
//                           fontSize: '0.7rem',
//                           fontWeight: 500,
//                           textTransform: 'none',
//                           whiteSpace: 'nowrap',
//                           '&:hover': {
//                             borderColor: COLORS.primary,
//                             bgcolor: `${COLORS.primary}10`,
//                             color: COLORS.primary
//                           }
//                         }}
//                       >
//                         Add New
//                       </Button>
//                     </Box>
//                   </Box>
//                 </Grid>
//               </Grid>
//             </Paper>
//           </Stack>
//         );
      
//       case 1:
//         return (
//           <Stack spacing={2}>
//             <Paper sx={{ p: 2.5, bgcolor: COLORS.background.white, borderRadius: 2, border: `1px solid ${COLORS.border}` }}>
//               <Typography variant="subtitle2" sx={{ color: COLORS.primary, mb: 2, fontWeight: 600, fontSize: '0.9rem' }}>
//                 Verification Settings
//               </Typography>
              
//               <Grid container spacing={2}>
//                 {/* Action Type */}
//                 <Grid size={{ xs: 12, md: 6 }}>
//                   <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//                     <Typography sx={labelStyle}>
//                       DEFAULT ACTION <span style={{ color: '#94A3B8', fontSize: '0.65rem' }}>(Optional)</span>
//                     </Typography>
//                     <TextField
//                       select
//                       fullWidth
//                       size="small"
//                       name="action"
//                       value={formData.action}
//                       onChange={handleChange}
//                       sx={inputStyle}
//                     >
//                       {ACTION_TYPES.map((option) => (
//                         <MenuItem key={option} value={option} sx={{ fontSize: '0.75rem' }}>
//                           {option}
//                         </MenuItem>
//                       ))}
//                     </TextField>
//                     <Typography sx={{ fontSize: '0.6rem', color: COLORS.text.tertiary }}>
//                       Default action to take when variance is detected
//                     </Typography>
//                   </Box>
//                 </Grid>

//                 {/* Variance Threshold Percent */}
//                 <Grid size={{ xs: 12, md: 6 }}>
//                   <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//                     <Typography sx={labelStyle}>
//                       VARIANCE THRESHOLD (%) <span style={{ color: '#EF4444' }}>*</span>
//                     </Typography>
//                     <TextField
//                       fullWidth
//                       type="number"
//                       size="small"
//                       name="variance_threshold_percent"
//                       value={formData.variance_threshold_percent}
//                       onChange={handleChange}
//                       error={!!errors.variance_threshold_percent}
//                       helperText={errors.variance_threshold_percent}
//                       placeholder="Enter percentage threshold"
//                       sx={inputStyle}
//                       InputProps={{
//                         inputProps: { min: 0, max: 100, step: 0.1 },
//                         endAdornment: (
//                           <InputAdornment position="end">
//                             <Typography sx={{ fontSize: '0.7rem', color: COLORS.text.tertiary }}>%</Typography>
//                           </InputAdornment>
//                         ),
//                       }}
//                     />
//                     <Typography sx={{ fontSize: '0.6rem', color: COLORS.text.tertiary }}>
//                       Variance exceeding this percentage will trigger alerts
//                     </Typography>
//                   </Box>
//                 </Grid>
                
//                 {/* Variance Threshold Amount */}
//                 <Grid size={{ xs: 12, md: 6 }}>
//                   <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//                     <Typography sx={labelStyle}>
//                       VARIANCE THRESHOLD (AMOUNT) <span style={{ color: '#EF4444' }}>*</span>
//                     </Typography>
//                     <TextField
//                       fullWidth
//                       type="number"
//                       size="small"
//                       name="variance_threshold_amount"
//                       value={formData.variance_threshold_amount}
//                       onChange={handleChange}
//                       error={!!errors.variance_threshold_amount}
//                       helperText={errors.variance_threshold_amount}
//                       placeholder="Enter amount threshold"
//                       sx={inputStyle}
//                       InputProps={{
//                         inputProps: { min: 0, step: 0.01 },
//                         startAdornment: (
//                           <InputAdornment position="start">
//                             <Typography sx={{ fontSize: '0.7rem', color: COLORS.text.tertiary }}>₹</Typography>
//                           </InputAdornment>
//                         ),
//                       }}
//                     />
//                     <Typography sx={{ fontSize: '0.6rem', color: COLORS.text.tertiary }}>
//                       Variance exceeding this amount will trigger alerts
//                     </Typography>
//                   </Box>
//                 </Grid>
                
//                 {/* Remarks */}
//                 <Grid size={{ xs: 12 }}>
//                   <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//                     <Typography sx={labelStyle}>REMARKS</Typography>
//                     <TextField
//                       fullWidth
//                       multiline
//                       rows={3}
//                       name="remarks"
//                       value={formData.remarks}
//                       onChange={handleChange}
//                       size="small"
//                       placeholder="Enter any additional remarks about the verification process..."
//                       sx={inputStyle}
//                     />
//                   </Box>
//                 </Grid>
//               </Grid>
//             </Paper>

//             {/* Summary Section */}
//             {formData.warehouse_id && (
//               <Paper sx={{ p: 2.5, bgcolor: COLORS.background.light, borderRadius: 2, border: `1px solid ${COLORS.border}` }}>
//                 <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color: COLORS.primary, mb: 2 }}>
//                   Summary
//                 </Typography>
//                 <Grid container spacing={2}>
//                   <Grid size={{ xs: 12, md: 6 }}>
//                     <Stack spacing={1}>
//                       <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
//                         <Typography sx={{ fontSize: '0.7rem', color: COLORS.text.secondary }}>Warehouse:</Typography>
//                         <Typography sx={{ fontSize: '0.7rem', fontWeight: 500 }}>
//                           {warehouses.find(w => w._id === formData.warehouse_id)?.warehouse_name || '-'}
//                         </Typography>
//                       </Box>
//                       <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
//                         <Typography sx={{ fontSize: '0.7rem', color: COLORS.text.secondary }}>Verification Type:</Typography>
//                         <Chip 
//                           label={formData.verification_type} 
//                           size="small"
//                           sx={{ 
//                             fontSize: '0.65rem', 
//                             bgcolor: COLORS.primaryLight, 
//                             color: COLORS.primary,
//                             height: 20
//                           }} 
//                         />
//                       </Box>
//                       <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
//                         <Typography sx={{ fontSize: '0.7rem', color: COLORS.text.secondary }}>Default Action:</Typography>
//                         <Chip 
//                           label={formData.action} 
//                           size="small"
//                           sx={{ 
//                             fontSize: '0.65rem', 
//                             bgcolor: COLORS.primaryLight, 
//                             color: COLORS.primary,
//                             height: 20
//                           }} 
//                         />
//                       </Box>
//                     </Stack>
//                   </Grid>
//                   <Grid size={{ xs: 12, md: 6 }}>
//                     <Stack spacing={1}>
//                       <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
//                         <Typography sx={{ fontSize: '0.7rem', color: COLORS.text.secondary }}>Conducted By:</Typography>
//                         <Typography sx={{ fontSize: '0.7rem', fontWeight: 500 }}>
//                           {employees.find(e => e._id === formData.conducted_by)?.FirstName || '-'}
//                         </Typography>
//                       </Box>
//                       <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
//                         <Typography sx={{ fontSize: '0.7rem', color: COLORS.text.secondary }}>Witness:</Typography>
//                         <Typography sx={{ fontSize: '0.7rem', fontWeight: 500 }}>
//                           {employees.find(e => e._id === formData.witness)?.FirstName || 'Not specified'}
//                         </Typography>
//                       </Box>
//                       <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
//                         <Typography sx={{ fontSize: '0.7rem', color: COLORS.text.secondary }}>Variance Threshold:</Typography>
//                         <Typography sx={{ fontSize: '0.7rem', fontWeight: 500 }}>
//                           {formData.variance_threshold_percent}% / ₹{formData.variance_threshold_amount.toLocaleString()}
//                         </Typography>
//                       </Box>
//                     </Stack>
//                   </Grid>
//                 </Grid>
//               </Paper>
//             )}
//           </Stack>
//         );
      
//       default:
//         return null;
//     }
//   };

//   return (
//     <>
//       <Dialog
//         open={open}
//         onClose={onClose}
//         maxWidth="md"
//         fullWidth
//         PaperProps={{
//           sx: {
//             borderRadius: 5,
//             boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05)',
//             border: `1px solid ${COLORS.border}`,
//             overflow: 'hidden',
//             maxHeight: '95vh'
//           }
//         }}
//       >
//         <DialogTitle sx={{
//           borderBottom: `1px solid ${COLORS.border}`,
//           py: 1.5,
//           px: 2.5,
//           mb: 2,
//           bgcolor: COLORS.background.white,
//           display: 'flex',
//           flexDirection: 'column',
//           gap: 1
//         }}>
//           <Typography sx={{ fontSize: '1.2rem', fontWeight: 700, color: COLORS.text.primary }}>
//             Create Physical Stock Verification
//           </Typography>

//           <Stepper activeStep={activeStep} alternativeLabel connector={<ColorConnector />} sx={{ mb: 0.5, mt: 0.5 }}>
//             {steps.map((label) => (
//               <Step key={label}>
//                 <StepLabel>
//                   <Typography fontWeight={500} fontSize="0.8rem" color={COLORS.text.secondary}>
//                     {label}
//                   </Typography>
//                 </StepLabel>
//               </Step>
//             ))}
//           </Stepper>
//         </DialogTitle>

//         <DialogContent sx={{ p: 2.5, overflow: 'auto' }}>
//           {apiError && (
//             <Alert severity="error" icon={<ErrorIcon />} sx={{ mb: 2, borderRadius: 1.5 }} onClose={() => setApiError('')}>
//               <strong>Error!</strong><br />
//               {apiError}
//             </Alert>
//           )}
          
//           {errors.submit && (
//             <Alert severity="error" sx={{ mb: 2, borderRadius: 1.5 }} onClose={() => setErrors(prev => ({ ...prev, submit: '' }))}>
//               {errors.submit}
//             </Alert>
//           )}

//           {renderStepContent(activeStep)}
//         </DialogContent>

//         <DialogActions sx={{
//           px: 2.5,
//           py: 1.5,
//           borderTop: `1px solid ${COLORS.border}`,
//           bgcolor: COLORS.background.white,
//           display: 'flex',
//           justifyContent: 'space-between',
//           gap: 1
//         }}>
//           <Button
//             onClick={onClose}
//             disabled={loading}
//             sx={{
//               height: 32,
//               px: 2,
//               borderRadius: 1.5,
//               border: `1px solid ${COLORS.border}`,
//               color: COLORS.text.secondary,
//               fontSize: '0.7rem',
//               fontWeight: 500,
//               textTransform: 'none',
//               '&:hover': {
//                 borderColor: COLORS.primary,
//                 bgcolor: `${COLORS.primary}10`
//               }
//             }}
//           >
//             Cancel
//           </Button>
          
//           <Box sx={{ display: 'flex', gap: 1 }}>
//             {activeStep > 0 && (
//               <Button
//                 onClick={handleBack}
//                 disabled={loading}
//                 startIcon={<NavigateBeforeIcon sx={{ fontSize: '1rem' }} />}
//                 sx={{
//                   height: 32,
//                   px: 2,
//                   borderRadius: 1.5,
//                   border: `1px solid ${COLORS.border}`,
//                   color: COLORS.text.secondary,
//                   fontSize: '0.7rem',
//                   fontWeight: 500,
//                   textTransform: 'none',
//                   '&:hover': {
//                     borderColor: COLORS.primary,
//                     bgcolor: `${COLORS.primary}10`
//                   }
//                 }}
//               >
//                 Back
//               </Button>
//             )}
            
//             {activeStep === steps.length - 1 ? (
//               <Button
//                 variant="contained"
//                 onClick={handleSubmit}
//                 disabled={loading}
//                 startIcon={loading ? null : <CheckCircleIcon sx={{ fontSize: '1rem' }} />}
//                 sx={{
//                   height: 32,
//                   px: 2,
//                   borderRadius: 1.5,
//                   bgcolor: COLORS.primary,
//                   fontSize: '0.7rem',
//                   fontWeight: 500,
//                   textTransform: 'none',
//                   boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
//                   '&:hover': { bgcolor: COLORS.primaryDark }
//                 }}
//               >
//                 {loading ? <CircularProgress size={16} sx={{ color: COLORS.text.light }} /> : 'Create Verification'}
//               </Button>
//             ) : (
//               <Button
//                 variant="contained"
//                 onClick={handleNext}
//                 disabled={loading || !formData.warehouse_id}
//                 endIcon={<NavigateNextIcon sx={{ fontSize: '1rem' }} />}
//                 sx={{
//                   height: 32,
//                   px: 2,
//                   borderRadius: 1.5,
//                   bgcolor: COLORS.primary,
//                   fontSize: '0.7rem',
//                   fontWeight: 500,
//                   textTransform: 'none',
//                   boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
//                   '&:hover': { bgcolor: COLORS.primaryDark }
//                 }}
//               >
//                 Next
//               </Button>
//             )}
//           </Box>
//         </DialogActions>
//       </Dialog>

//       {/* Add Employee Modal */}
//       <AddEmployees
//         open={addEmployeeOpen}
//         onClose={() => {
//           setAddEmployeeOpen(false);
//           setEmployeeTypeForAdd('');
//         }}
//         onAdd={handleEmployeeAdded}
//       />
//     </>
//   );
// };

// export default AddPSV;


import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Stack,
  Alert,
  MenuItem,
  Grid,
  CircularProgress,
  Stepper,
  Step,
  StepLabel,
  Box,
  Typography,
  styled,
  StepConnector,
  stepConnectorClasses,
  Paper,
  IconButton,
  Tooltip,
  InputAdornment,
  Autocomplete,
  Chip
} from '@mui/material';
import {
  Add as AddIcon,
  Close as CloseIcon,
  Search as SearchIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  NavigateNext as NavigateNextIcon,
  NavigateBefore as NavigateBeforeIcon,
  Warehouse as WarehouseIcon,
  Person as PersonIcon,
  CheckCircle as CheckCircleIcon,
  Percent as PercentIcon,
  AttachMoney as MoneyIcon
} from '@mui/icons-material';
import axios from 'axios';
import BASE_URL from '../../../config/Config';

// Color constants
const COLORS = {
  primary: '#063C3F',
  primaryLight: '#E8F0F1',
  primaryDark: '#05292B',
  text: {
    primary: '#151C26',
    secondary: '#4B5568',
    tertiary: '#94A3B8',
    light: '#FFFFFF'
  },
  background: {
    white: '#FFFFFF',
    light: '#F8FFFC'
  },
  border: '#E3E8EF'
};

// Verification types based on schema enum
const VERIFICATION_TYPES = ['Full Count', 'Cycle Count', 'Spot Check', 'Pre-Audit Count'];

// Action types based on schema enum
const ACTION_TYPES = ['Adjust Up', 'Adjust Down', 'No Action', 'Write Off', 'Investigate Further'];

// 🔥 Modern Stepper Connector
const ColorConnector = styled(StepConnector)(({ theme }) => ({
  [`&.${stepConnectorClasses.active}`]: {
    [`& .${stepConnectorClasses.line}`]: {
      backgroundImage: 'linear-gradient(135deg, #063C3F 0%, #00B4D8 50%, #05292B 100%)',
    },
  },
  [`&.${stepConnectorClasses.completed}`]: {
    [`& .${stepConnectorClasses.line}`]: {
      backgroundImage: 'linear-gradient(135deg, #063C3F 0%, #00B4D8 50%, #05292B 100%)',
    },
  },
  [`& .${stepConnectorClasses.line}`]: {
    height: 3,
    border: 0,
    backgroundColor: '#eaeaf0',
    borderRadius: 1,
  },
}));

const steps = ['Basic Information', 'Verification Settings'];
const employeeSteps = ['Personal Info', 'Employment', 'Pay & Work', 'Bank & Emergency'];

// ==================== Inline Employee Form (Multi-step, Full width) ====================
const InlineEmployeeForm = ({ onClose, onSave, departments = [] }) => {
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [designations, setDesignations] = useState([]);
  const [designationsLoading, setDesignationsLoading] = useState(false);

  const [formData, setFormData] = useState({
    FirstName: '', LastName: '', Gender: 'M', DateOfBirth: '', Email: '', Phone: '', Address: '',
    DepartmentID: '', DesignationID: '', DateOfJoining: '', EmploymentType: 'Monthly',
    ContractCompany: '', PayStructureType: 'Fixed', BasicSalary: '', HourlyRate: '',
    OvertimeRateMultiplier: '1.5', SkillLevel: '', WorkStation: '', LineNumber: '',
    PAN: '', AadharNumber: '', PFNumber: '', UAN: '', ESINumber: '',
    BankAccountNumber: '', BankAccountHolderName: '', BankName: '', BankBranch: '',
    BankIfscCode: '', BankAccountType: 'Savings',
    EmergencyContactName: '', EmergencyContactRelationship: '', EmergencyContactPhone: '',
    EmergencyContactAddress: '', EmergencyContactPIN: ''
  });

  const [fieldErrors, setFieldErrors] = useState({});
  const [touched, setTouched] = useState({});

  const genderOptions = [
    { value: 'M', label: 'Male' },
    { value: 'F', label: 'Female' },
    { value: 'O', label: 'Other' }
  ];
  const employmentTypeOptions = [
    { value: 'Monthly', label: 'Monthly' },
    { value: 'Hourly', label: 'Hourly' },
    { value: 'PieceRate', label: 'Piece Rate' },
    { value: 'contract-based', label: 'Contract-Based' }
  ];
  const contractCompanyOptions = [
    { value: 'DISTIL', label: 'DISTIL' },
    { value: 'AARADHYA', label: 'AARADHYA' },
    { value: 'MAHI', label: 'MAHI' }
  ];
  const payStructureOptions = [
    { value: 'Fixed', label: 'Fixed' },
    { value: 'Variable', label: 'Variable' },
    { value: 'Commission', label: 'Commission' },
    { value: 'PieceRate', label: 'Piece Rate' }
  ];
  const skillLevelOptions = [
    { value: 'Unskilled', label: 'Unskilled' },
    { value: 'Semi-Skilled', label: 'Semi-Skilled' },
    { value: 'Skilled', label: 'Skilled' },
    { value: 'Highly Skilled', label: 'Highly Skilled' }
  ];
  const accountTypeOptions = [
    { value: 'Savings', label: 'Savings' },
    { value: 'Current', label: 'Current' },
    { value: 'Salary', label: 'Salary' }
  ];

  useEffect(() => {
    if (formData.DepartmentID) {
      fetchDesignations(formData.DepartmentID);
    } else {
      setDesignations([]);
    }
  }, [formData.DepartmentID]);

  const fetchDesignations = async (deptId) => {
    setDesignationsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${BASE_URL}/api/designations?department_id=${deptId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) setDesignations(res.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setDesignationsLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (touched[name] || value) {
      const error = validateField(name, value);
      setFieldErrors(prev => ({ ...prev, [name]: error }));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    const error = validateField(name, value);
    setFieldErrors(prev => ({ ...prev, [name]: error }));
  };

  const handleAutocompleteChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value?._id || '' }));
    setFieldErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleEmploymentTypeChange = (e) => {
    const employmentType = e.target.value;
    let payStructure = 'Fixed';
    if (employmentType === 'PieceRate') payStructure = 'PieceRate';
    setFormData(prev => ({
      ...prev,
      EmploymentType: employmentType,
      PayStructureType: payStructure
    }));
  };

  // Validation helpers
  const validateEmail = (email) => /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(email);
  const validatePhone = (phone) => {
    const clean = phone.replace(/\D/g, '');
    return clean === '' || /^[6-9]\d{9}$/.test(clean);
  };
  const validateName = (name) => /^[A-Za-z\s.'-]+$/.test(name);
  const validateAddress = (address) => /^[A-Za-z0-9\s,.#\-/]+$/.test(address);
  const validatePAN = (pan) => /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(pan);
  const validateAadhar = (aadhar) => /^\d{12}$/.test(aadhar);
  const validatePF = (pf) => /^[A-Z]{2}\/\d{5}\/\d{7}$/.test(pf);
  const validateUAN = (uan) => /^\d{12}$/.test(uan);
  const validateESI = (esi) => /^\d{17}$/.test(esi);
  const validateAccount = (acc) => /^\d{9,18}$/.test(acc);
  const validateIFSC = (ifsc) => /^[A-Z]{4}0[A-Z0-9]{6}$/.test(ifsc);
  const validatePIN = (pin) => /^\d{6}$/.test(pin);
  const validateBankName = (bank) => /^[A-Za-z\s.'&-]+$/.test(bank);
  const validateBranch = (branch) => /^[A-Za-z0-9\s.-]+$/.test(branch);
  const validateRelation = (rel) => /^[A-Za-z\s]+$/.test(rel);
  const validateWorkStation = (ws) => /^[A-Za-z0-9\s-]+$/.test(ws);

  const validateField = (name, value) => {
    switch (name) {
      case 'FirstName':
      case 'LastName':
      case 'BankAccountHolderName':
      case 'EmergencyContactName':
        if (value && !validateName(value)) return 'Only letters, spaces, dots, hyphens';
        break;
      case 'Email':
        if (value && !validateEmail(value)) return 'Invalid email';
        break;
      case 'Phone':
      case 'EmergencyContactPhone':
        if (value && !validatePhone(value)) return '10-digit number starting with 6-9';
        break;
      case 'Address':
      case 'EmergencyContactAddress':
        if (value && !validateAddress(value)) return 'Invalid characters';
        break;
      case 'PAN':
        if (value && !validatePAN(value)) return 'Format: ABCDE1234F';
        break;
      case 'AadharNumber':
        if (value && !validateAadhar(value)) return '12 digits';
        break;
      case 'PFNumber':
        if (value && !validatePF(value)) return 'Format: XX/12345/1234567';
        break;
      case 'UAN':
        if (value && !validateUAN(value)) return '12 digits';
        break;
      case 'ESINumber':
        if (value && !validateESI(value)) return '17 digits';
        break;
      case 'BankAccountNumber':
        if (value && !validateAccount(value)) return '9-18 digits';
        break;
      case 'BankName':
        if (value && !validateBankName(value)) return 'Letters, spaces, dots, hyphens';
        break;
      case 'BankBranch':
        if (value && !validateBranch(value)) return 'Letters, numbers, spaces, dots, hyphens';
        break;
      case 'BankIfscCode':
        if (value && !validateIFSC(value)) return 'Format: ABCD0123456';
        break;
      case 'EmergencyContactRelationship':
        if (value && !validateRelation(value)) return 'Letters and spaces only';
        break;
      case 'EmergencyContactPIN':
        if (value && !validatePIN(value)) return '6 digits';
        break;
      case 'WorkStation':
      case 'LineNumber':
        if (value && !validateWorkStation(value)) return 'Letters, numbers, spaces, hyphens';
        break;
      case 'ContractCompany':
        if (formData.EmploymentType === 'contract-based' && !value) return 'Required';
        break;
      default:
        return '';
    }
    return '';
  };

  const validateStep = (step) => {
    const errors = {};
    let isValid = true;

    switch (step) {
      case 0: // Personal Info
        if (!formData.FirstName.trim()) { errors.FirstName = 'Required'; isValid = false; }
        else { const err = validateField('FirstName', formData.FirstName); if (err) { errors.FirstName = err; isValid = false; } }
        if (!formData.LastName.trim()) { errors.LastName = 'Required'; isValid = false; }
        else { const err = validateField('LastName', formData.LastName); if (err) { errors.LastName = err; isValid = false; } }
        if (!formData.Email.trim()) { errors.Email = 'Required'; isValid = false; }
        else { const err = validateField('Email', formData.Email); if (err) { errors.Email = err; isValid = false; } }
        if (formData.Phone) { const err = validateField('Phone', formData.Phone); if (err) { errors.Phone = err; isValid = false; } }
        if (formData.Address) { const err = validateField('Address', formData.Address); if (err) { errors.Address = err; isValid = false; } }
        break;

      case 1: // Employment
        if (!formData.DepartmentID) { errors.DepartmentID = 'Required'; isValid = false; }
        if (!formData.DesignationID) { errors.DesignationID = 'Required'; isValid = false; }
        if (!formData.DateOfJoining) { errors.DateOfJoining = 'Required'; isValid = false; }
        if (formData.EmploymentType === 'contract-based' && !formData.ContractCompany) {
          errors.ContractCompany = 'Required';
          isValid = false;
        }
        break;

      case 2: // Pay & Work
        if ((formData.EmploymentType === 'Monthly' || formData.EmploymentType === 'contract-based') && !formData.BasicSalary) {
          errors.BasicSalary = 'Required';
          isValid = false;
        }
        if (formData.EmploymentType === 'Hourly' && !formData.HourlyRate) {
          errors.HourlyRate = 'Required';
          isValid = false;
        }
        const taxFields = ['PAN', 'AadharNumber', 'PFNumber', 'UAN', 'ESINumber', 'WorkStation', 'LineNumber'];
        taxFields.forEach(field => {
          if (formData[field]) {
            const err = validateField(field, formData[field]);
            if (err) { errors[field] = err; isValid = false; }
          }
        });
        break;

      case 3: // Bank & Emergency
        const bankFields = ['BankAccountNumber', 'BankAccountHolderName', 'BankName', 'BankBranch', 'BankIfscCode'];
        const hasAnyBank = bankFields.some(f => formData[f]);
        if (hasAnyBank) {
          bankFields.forEach(field => {
            if (!formData[field]) {
              errors[field] = 'Required when providing bank details';
              isValid = false;
            } else {
              const err = validateField(field, formData[field]);
              if (err) { errors[field] = err; isValid = false; }
            }
          });
        }
        const emergencyFields = ['EmergencyContactName', 'EmergencyContactRelationship', 'EmergencyContactPhone', 'EmergencyContactAddress', 'EmergencyContactPIN'];
        const hasAnyEmergency = emergencyFields.some(f => formData[f]);
        if (hasAnyEmergency) {
          emergencyFields.forEach(field => {
            if (!formData[field]) {
              errors[field] = 'Required when providing emergency contact';
              isValid = false;
            } else {
              const err = validateField(field, formData[field]);
              if (err) { errors[field] = err; isValid = false; }
            }
          });
        }
        break;

      default:
        return true;
    }

    setFieldErrors(errors);
    if (!isValid) setSubmitError('Please fix the errors in this section');
    return isValid;
  };

  const handleNext = () => {
    if (validateStep(activeStep)) {
      setSubmitError('');
      setActiveStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    setSubmitError('');
    setActiveStep(prev => prev - 1);
  };

  const handleSubmitEmployee = async () => {
    if (!validateStep(3)) return;
    setLoading(true);
    setSubmitError('');
    try {
      const token = localStorage.getItem('token');
      const payload = {
        FirstName: formData.FirstName,
        LastName: formData.LastName,
        Gender: formData.Gender,
        DateOfBirth: formData.DateOfBirth || undefined,
        Email: formData.Email,
        Phone: formData.Phone || undefined,
        Address: formData.Address || undefined,
        DepartmentID: formData.DepartmentID,
        DesignationID: formData.DesignationID,
        DateOfJoining: formData.DateOfJoining,
        EmploymentType: formData.EmploymentType,
        PayStructureType: formData.PayStructureType,
        ContractCompany: formData.ContractCompany || undefined,
        BasicSalary: (formData.EmploymentType === 'Monthly' || formData.EmploymentType === 'contract-based') ? Number(formData.BasicSalary || 0) : 0,
        HourlyRate: formData.EmploymentType === 'Hourly' ? Number(formData.HourlyRate || 0) : 0,
        OvertimeRateMultiplier: Number(formData.OvertimeRateMultiplier || 1.5),
        SkillLevel: formData.SkillLevel || undefined,
        WorkStation: formData.WorkStation || undefined,
        LineNumber: formData.LineNumber || undefined,
        PAN: formData.PAN || undefined,
        AadharNumber: formData.AadharNumber || undefined,
        PFNumber: formData.PFNumber || undefined,
        UAN: formData.UAN || undefined,
        ESINumber: formData.ESINumber || undefined,
        EmploymentStatus: 'active'
      };
      const bankFields = ['BankAccountNumber', 'BankAccountHolderName', 'BankName', 'BankBranch', 'BankIfscCode'];
      const hasAnyBank = bankFields.some(f => formData[f]);
      if (hasAnyBank) {
        payload.BankDetails = {
          accountNumber: formData.BankAccountNumber,
          accountHolderName: formData.BankAccountHolderName,
          bankName: formData.BankName,
          branch: formData.BankBranch,
          ifscCode: formData.BankIfscCode,
          accountType: formData.BankAccountType
        };
      }
      const emergencyFields = ['EmergencyContactName', 'EmergencyContactRelationship', 'EmergencyContactPhone', 'EmergencyContactAddress', 'EmergencyContactPIN'];
      const hasAnyEmergency = emergencyFields.some(f => formData[f]);
      if (hasAnyEmergency) {
        payload.EmergencyContact = {
          name: formData.EmergencyContactName,
          relationship: formData.EmergencyContactRelationship,
          phone: formData.EmergencyContactPhone,
          address: formData.EmergencyContactAddress,
          pinCode: formData.EmergencyContactPIN
        };
      }
      Object.keys(payload).forEach(key => payload[key] === undefined && delete payload[key]);

      const response = await axios.post(`${BASE_URL}/api/employees`, payload, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
      });
      if (response.data.success) {
        onSave(response.data.data);
      } else {
        setSubmitError(response.data.message || 'Failed to add employee');
      }
    } catch (err) {
      console.error(err);
      setSubmitError(err.response?.data?.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    '& .MuiOutlinedInput-root': {
      borderRadius: 1.5,
      fontSize: '0.75rem',
      '&:hover fieldset': { borderColor: COLORS.primary },
      '&.Mui-focused fieldset': { borderColor: COLORS.primary, borderWidth: 1 }
    },
    '& .MuiInputBase-input': {
      py: 1,
      px: 1.5,
      fontSize: '0.75rem'
    }
  };
  const labelStyle = {
    fontSize: '0.7rem',
    fontWeight: 600,
    color: COLORS.text.secondary,
    letterSpacing: '0.5px',
    mb: 0.5
  };

  const renderStep = (step) => {
    switch (step) {
      case 0:
        return (
          <Paper sx={{ p: 2.5, bgcolor: '#fafbfc', borderRadius: 2, border: `1px solid ${COLORS.border}` }}>
            <Typography sx={{ fontSize: '0.9rem', fontWeight: 600, color: COLORS.primary, mb: 2 }}>Personal Information</Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Box><Typography sx={labelStyle}>FIRST NAME <span style={{ color: '#EF4444' }}>*</span></Typography>
                  <TextField fullWidth size="small" name="FirstName" placeholder="e.g., John" value={formData.FirstName} onChange={handleChange} onBlur={handleBlur} error={!!fieldErrors.FirstName} helperText={fieldErrors.FirstName} sx={inputStyle} /></Box>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Box><Typography sx={labelStyle}>LAST NAME <span style={{ color: '#EF4444' }}>*</span></Typography>
                  <TextField fullWidth size="small" name="LastName" placeholder="e.g., Doe" value={formData.LastName} onChange={handleChange} onBlur={handleBlur} error={!!fieldErrors.LastName} helperText={fieldErrors.LastName} sx={inputStyle} /></Box>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Box><Typography sx={labelStyle}>GENDER</Typography>
                  <TextField select fullWidth size="small" name="Gender" value={formData.Gender} onChange={handleChange} sx={inputStyle}>
                    {genderOptions.map(o => <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>)}
                  </TextField></Box>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Box><Typography sx={labelStyle}>DATE OF BIRTH</Typography>
                  <TextField fullWidth size="small" name="DateOfBirth" type="date" value={formData.DateOfBirth} onChange={handleChange} InputLabelProps={{ shrink: true }} sx={inputStyle} /></Box>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Box><Typography sx={labelStyle}>EMAIL <span style={{ color: '#EF4444' }}>*</span></Typography>
                  <TextField fullWidth size="small" name="Email" placeholder="john.doe@company.com" value={formData.Email} onChange={handleChange} onBlur={handleBlur} error={!!fieldErrors.Email} helperText={fieldErrors.Email} sx={inputStyle} />
                  <Typography sx={{ fontSize: '0.65rem', color: COLORS.text.tertiary }}>e.g., john.doe@company.com</Typography></Box>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Box><Typography sx={labelStyle}>PHONE</Typography>
                  <TextField fullWidth size="small" name="Phone" placeholder="9876543210" value={formData.Phone} onChange={handleChange} onBlur={handleBlur} error={!!fieldErrors.Phone} helperText={fieldErrors.Phone} inputProps={{ maxLength: 10 }} sx={inputStyle} />
                  <Typography sx={{ fontSize: '0.65rem', color: COLORS.text.tertiary }}>10-digit number starting with 6-9</Typography></Box>
              </Grid>
              <Grid item xs={12}>
                <Box><Typography sx={labelStyle}>ADDRESS</Typography>
                  <TextField fullWidth size="small" name="Address" multiline rows={2} placeholder="Enter complete address" value={formData.Address} onChange={handleChange} onBlur={handleBlur} error={!!fieldErrors.Address} helperText={fieldErrors.Address} sx={inputStyle} /></Box>
              </Grid>
            </Grid>
          </Paper>
        );
      case 1:
        return (
          <Paper sx={{ p: 2.5, bgcolor: '#fafbfc', borderRadius: 2, border: `1px solid ${COLORS.border}` }}>
            <Typography sx={{ fontSize: '0.9rem', fontWeight: 600, color: COLORS.primary, mb: 2 }}>Employment Details</Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Box><Typography sx={labelStyle}>DEPARTMENT <span style={{ color: '#EF4444' }}>*</span></Typography>
                  <Autocomplete
                    options={departments}
                    getOptionLabel={(opt) => opt?.DepartmentName || ''}
                    onChange={(e, v) => handleAutocompleteChange('DepartmentID', v)}
                    isOptionEqualToValue={(option, value) => option._id === value?._id}
                    renderInput={(params) => <TextField {...params} size="small" placeholder="Select department" error={!!fieldErrors.DepartmentID} helperText={fieldErrors.DepartmentID} sx={inputStyle} />}
                  /></Box>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Box><Typography sx={labelStyle}>DESIGNATION <span style={{ color: '#EF4444' }}>*</span></Typography>
                  <Autocomplete
                    options={designations}
                    getOptionLabel={(opt) => opt?.DesignationName || ''}
                    onChange={(e, v) => handleAutocompleteChange('DesignationID', v)}
                    loading={designationsLoading}
                    disabled={!formData.DepartmentID}
                    isOptionEqualToValue={(option, value) => option._id === value?._id}
                    renderInput={(params) => <TextField {...params} size="small" placeholder="Select designation" error={!!fieldErrors.DesignationID} helperText={fieldErrors.DesignationID} sx={inputStyle} />}
                  /></Box>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Box><Typography sx={labelStyle}>DATE OF JOINING <span style={{ color: '#EF4444' }}>*</span></Typography>
                  <TextField fullWidth size="small" name="DateOfJoining" type="date" value={formData.DateOfJoining} onChange={handleChange} error={!!fieldErrors.DateOfJoining} helperText={fieldErrors.DateOfJoining} InputLabelProps={{ shrink: true }} sx={inputStyle} /></Box>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Box><Typography sx={labelStyle}>EMPLOYMENT TYPE <span style={{ color: '#EF4444' }}>*</span></Typography>
                  <TextField select fullWidth size="small" name="EmploymentType" value={formData.EmploymentType} onChange={handleEmploymentTypeChange} sx={inputStyle}>
                    {employmentTypeOptions.map(o => <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>)}
                  </TextField></Box>
              </Grid>
              {formData.EmploymentType === 'contract-based' && (
                <Grid item xs={12} sm={6}>
                  <Box><Typography sx={labelStyle}>CONTRACT COMPANY <span style={{ color: '#EF4444' }}>*</span></Typography>
                    <TextField select fullWidth size="small" name="ContractCompany" value={formData.ContractCompany} onChange={handleChange} error={!!fieldErrors.ContractCompany} helperText={fieldErrors.ContractCompany} sx={inputStyle}>
                      <MenuItem value="">Select</MenuItem>
                      {contractCompanyOptions.map(o => <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>)}
                    </TextField></Box>
                </Grid>
              )}
            </Grid>
          </Paper>
        );
      case 2:
        return (
          <Paper sx={{ p: 2.5, bgcolor: '#fafbfc', borderRadius: 2, border: `1px solid ${COLORS.border}` }}>
            <Typography sx={{ fontSize: '0.9rem', fontWeight: 600, color: COLORS.primary, mb: 2 }}>Pay & Work Details</Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Box><Typography sx={labelStyle}>PAY STRUCTURE TYPE</Typography>
                  <TextField select fullWidth size="small" name="PayStructureType" value={formData.PayStructureType} onChange={handleChange} sx={inputStyle}>
                    {payStructureOptions.map(o => <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>)}
                  </TextField></Box>
              </Grid>
              {(formData.EmploymentType === 'Monthly' || formData.EmploymentType === 'contract-based') && (
                <Grid item xs={12} sm={6}>
                  <Box><Typography sx={labelStyle}>BASIC SALARY <span style={{ color: '#EF4444' }}>*</span></Typography>
                    <TextField fullWidth size="small" name="BasicSalary" type="number" placeholder="e.g., 25000" value={formData.BasicSalary} onChange={handleChange} error={!!fieldErrors.BasicSalary} helperText={fieldErrors.BasicSalary} inputProps={{ min: 0 }} sx={inputStyle} /></Box>
                </Grid>
              )}
              {formData.EmploymentType === 'Hourly' && (
                <Grid item xs={12} sm={6}>
                  <Box><Typography sx={labelStyle}>HOURLY RATE <span style={{ color: '#EF4444' }}>*</span></Typography>
                    <TextField fullWidth size="small" name="HourlyRate" type="number" placeholder="e.g., 150" value={formData.HourlyRate} onChange={handleChange} error={!!fieldErrors.HourlyRate} helperText={fieldErrors.HourlyRate} inputProps={{ min: 0, step: 0.01 }} sx={inputStyle} /></Box>
                </Grid>
              )}
              {formData.EmploymentType !== 'PieceRate' && (
                <>
                  <Grid item xs={12} sm={6}>
                    <Box><Typography sx={labelStyle}>OVERTIME MULTIPLIER</Typography>
                      <TextField fullWidth size="small" name="OvertimeRateMultiplier" type="number" value={formData.OvertimeRateMultiplier} onChange={handleChange} inputProps={{ step: 0.25, min: 1, max: 3 }} sx={inputStyle} /></Box>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Box><Typography sx={labelStyle}>SKILL LEVEL</Typography>
                      <TextField select fullWidth size="small" name="SkillLevel" value={formData.SkillLevel} onChange={handleChange} sx={inputStyle}>
                        <MenuItem value="">None</MenuItem>
                        {skillLevelOptions.map(o => <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>)}
                      </TextField></Box>
                  </Grid>
                </>
              )}
              <Grid item xs={12} sm={6}>
                <Box><Typography sx={labelStyle}>WORK STATION</Typography>
                  <TextField fullWidth size="small" name="WorkStation" placeholder="e.g., Station A" value={formData.WorkStation} onChange={handleChange} onBlur={handleBlur} error={!!fieldErrors.WorkStation} helperText={fieldErrors.WorkStation} sx={inputStyle} />
                  <Typography sx={{ fontSize: '0.65rem', color: COLORS.text.tertiary }}>Letters, numbers, spaces, hyphens</Typography></Box>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Box><Typography sx={labelStyle}>LINE NUMBER</Typography>
                  <TextField fullWidth size="small" name="LineNumber" placeholder="e.g., Line 1" value={formData.LineNumber} onChange={handleChange} onBlur={handleBlur} error={!!fieldErrors.LineNumber} helperText={fieldErrors.LineNumber} sx={inputStyle} />
                  <Typography sx={{ fontSize: '0.65rem', color: COLORS.text.tertiary }}>Letters, numbers, spaces, hyphens</Typography></Box>
              </Grid>
              <Grid item xs={12}><Typography sx={{ fontWeight: 600, color: COLORS.primary, fontSize: '0.8rem', mt: 1 }}>Tax & Identification (Optional)</Typography></Grid>
              <Grid item xs={12} sm={6}>
                <Box><Typography sx={labelStyle}>PAN</Typography>
                  <TextField fullWidth size="small" name="PAN" placeholder="ABCDE1234F" value={formData.PAN} onChange={handleChange} onBlur={handleBlur} error={!!fieldErrors.PAN} helperText={fieldErrors.PAN} inputProps={{ maxLength: 10 }} sx={inputStyle} />
                  <Typography sx={{ fontSize: '0.65rem', color: COLORS.text.tertiary }}>5 letters + 4 numbers + 1 letter</Typography></Box>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Box><Typography sx={labelStyle}>AADHAR NUMBER</Typography>
                  <TextField fullWidth size="small" name="AadharNumber" placeholder="123456789012" value={formData.AadharNumber} onChange={handleChange} onBlur={handleBlur} error={!!fieldErrors.AadharNumber} helperText={fieldErrors.AadharNumber} inputProps={{ maxLength: 12 }} sx={inputStyle} />
                  <Typography sx={{ fontSize: '0.65rem', color: COLORS.text.tertiary }}>12 digits</Typography></Box>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Box><Typography sx={labelStyle}>PF NUMBER</Typography>
                  <TextField fullWidth size="small" name="PFNumber" placeholder="AB/12345/1234567" value={formData.PFNumber} onChange={handleChange} onBlur={handleBlur} error={!!fieldErrors.PFNumber} helperText={fieldErrors.PFNumber} sx={inputStyle} />
                  <Typography sx={{ fontSize: '0.65rem', color: COLORS.text.tertiary }}>Format: XX/12345/1234567</Typography></Box>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Box><Typography sx={labelStyle}>UAN</Typography>
                  <TextField fullWidth size="small" name="UAN" placeholder="123456789012" value={formData.UAN} onChange={handleChange} onBlur={handleBlur} error={!!fieldErrors.UAN} helperText={fieldErrors.UAN} inputProps={{ maxLength: 12 }} sx={inputStyle} />
                  <Typography sx={{ fontSize: '0.65rem', color: COLORS.text.tertiary }}>12 digits</Typography></Box>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Box><Typography sx={labelStyle}>ESI NUMBER</Typography>
                  <TextField fullWidth size="small" name="ESINumber" placeholder="12345678901234567" value={formData.ESINumber} onChange={handleChange} onBlur={handleBlur} error={!!fieldErrors.ESINumber} helperText={fieldErrors.ESINumber} inputProps={{ maxLength: 17 }} sx={inputStyle} />
                  <Typography sx={{ fontSize: '0.65rem', color: COLORS.text.tertiary }}>17 digits</Typography></Box>
              </Grid>
            </Grid>
          </Paper>
        );
      case 3:
        return (
          <Stack spacing={2}>
            <Paper sx={{ p: 2.5, bgcolor: '#fafbfc', borderRadius: 2, border: `1px solid ${COLORS.border}` }}>
              <Typography sx={{ fontSize: '0.9rem', fontWeight: 600, color: COLORS.primary, mb: 2 }}>Bank Details <span style={{ fontSize: '0.7rem', fontWeight: 'normal', color: COLORS.text.tertiary }}>(All or None)</span></Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Box><Typography sx={labelStyle}>ACCOUNT NUMBER</Typography>
                    <TextField fullWidth size="small" name="BankAccountNumber" placeholder="123456789" value={formData.BankAccountNumber} onChange={handleChange} onBlur={handleBlur} error={!!fieldErrors.BankAccountNumber} helperText={fieldErrors.BankAccountNumber} inputProps={{ maxLength: 18 }} sx={inputStyle} />
                    <Typography sx={{ fontSize: '0.65rem', color: COLORS.text.tertiary }}>9-18 digits</Typography></Box>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Box><Typography sx={labelStyle}>ACCOUNT HOLDER NAME</Typography>
                    <TextField fullWidth size="small" name="BankAccountHolderName" placeholder="John Doe" value={formData.BankAccountHolderName} onChange={handleChange} onBlur={handleBlur} error={!!fieldErrors.BankAccountHolderName} helperText={fieldErrors.BankAccountHolderName} sx={inputStyle} /></Box>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Box><Typography sx={labelStyle}>BANK NAME</Typography>
                    <TextField fullWidth size="small" name="BankName" placeholder="State Bank of India" value={formData.BankName} onChange={handleChange} onBlur={handleBlur} error={!!fieldErrors.BankName} helperText={fieldErrors.BankName} sx={inputStyle} /></Box>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Box><Typography sx={labelStyle}>BRANCH</Typography>
                    <TextField fullWidth size="small" name="BankBranch" placeholder="Main Branch" value={formData.BankBranch} onChange={handleChange} onBlur={handleBlur} error={!!fieldErrors.BankBranch} helperText={fieldErrors.BankBranch} sx={inputStyle} /></Box>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Box><Typography sx={labelStyle}>IFSC CODE</Typography>
                    <TextField fullWidth size="small" name="BankIfscCode" placeholder="SBIN0123456" value={formData.BankIfscCode} onChange={handleChange} onBlur={handleBlur} error={!!fieldErrors.BankIfscCode} helperText={fieldErrors.BankIfscCode} inputProps={{ maxLength: 11 }} sx={inputStyle} />
                    <Typography sx={{ fontSize: '0.65rem', color: COLORS.text.tertiary }}>4 letters + 0 + 6 alphanumeric</Typography></Box>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Box><Typography sx={labelStyle}>ACCOUNT TYPE</Typography>
                    <TextField select fullWidth size="small" name="BankAccountType" value={formData.BankAccountType} onChange={handleChange} sx={inputStyle}>
                      {accountTypeOptions.map(o => <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>)}
                    </TextField></Box>
                </Grid>
              </Grid>
            </Paper>
            <Paper sx={{ p: 2.5, bgcolor: '#fafbfc', borderRadius: 2, border: `1px solid ${COLORS.border}` }}>
              <Typography sx={{ fontSize: '0.9rem', fontWeight: 600, color: COLORS.primary, mb: 2 }}>Emergency Contact <span style={{ fontSize: '0.7rem', fontWeight: 'normal', color: COLORS.text.tertiary }}>(All or None)</span></Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Box><Typography sx={labelStyle}>CONTACT NAME</Typography>
                    <TextField fullWidth size="small" name="EmergencyContactName" placeholder="Jane Doe" value={formData.EmergencyContactName} onChange={handleChange} onBlur={handleBlur} error={!!fieldErrors.EmergencyContactName} helperText={fieldErrors.EmergencyContactName} sx={inputStyle} /></Box>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Box><Typography sx={labelStyle}>RELATIONSHIP</Typography>
                    <TextField fullWidth size="small" name="EmergencyContactRelationship" placeholder="Spouse" value={formData.EmergencyContactRelationship} onChange={handleChange} onBlur={handleBlur} error={!!fieldErrors.EmergencyContactRelationship} helperText={fieldErrors.EmergencyContactRelationship} sx={inputStyle} /></Box>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Box><Typography sx={labelStyle}>PHONE</Typography>
                    <TextField fullWidth size="small" name="EmergencyContactPhone" placeholder="9876543210" value={formData.EmergencyContactPhone} onChange={handleChange} onBlur={handleBlur} error={!!fieldErrors.EmergencyContactPhone} helperText={fieldErrors.EmergencyContactPhone} inputProps={{ maxLength: 10 }} sx={inputStyle} /></Box>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Box><Typography sx={labelStyle}>PIN CODE</Typography>
                    <TextField fullWidth size="small" name="EmergencyContactPIN" placeholder="400001" value={formData.EmergencyContactPIN} onChange={handleChange} onBlur={handleBlur} error={!!fieldErrors.EmergencyContactPIN} helperText={fieldErrors.EmergencyContactPIN} inputProps={{ maxLength: 6 }} sx={inputStyle} /></Box>
                </Grid>
                <Grid item xs={12}>
                  <Box><Typography sx={labelStyle}>ADDRESS</Typography>
                    <TextField fullWidth size="small" name="EmergencyContactAddress" multiline rows={2} placeholder="Enter complete address" value={formData.EmergencyContactAddress} onChange={handleChange} onBlur={handleBlur} error={!!fieldErrors.EmergencyContactAddress} helperText={fieldErrors.EmergencyContactAddress} sx={inputStyle} /></Box>
                </Grid>
              </Grid>
            </Paper>
          </Stack>
        );
      default:
        return null;
    }
  };

  return (
    <Paper sx={{ mt: 2, p: 3, bgcolor: '#ffffff', border: `1px solid ${COLORS.border}`, borderRadius: 2, width: '100%', boxSizing: 'border-box' }}>
      <Typography sx={{ fontSize: '1rem', fontWeight: 700, color: COLORS.text.primary, mb: 2 }}>Add New Employee</Typography>

      <Stepper activeStep={activeStep} alternativeLabel connector={<ColorConnector />} sx={{ mb: 2 }}>
        {employeeSteps.map((label) => (
          <Step key={label}>
            <StepLabel><Typography fontSize="0.75rem">{label}</Typography></StepLabel>
          </Step>
        ))}
      </Stepper>

      {submitError && (
        <Alert severity="error" sx={{ mb: 2, borderRadius: 1.5 }} onClose={() => setSubmitError('')}>
          {submitError}
        </Alert>
      )}

      {renderStep(activeStep)}

      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
        <Button size="small" onClick={onClose} disabled={loading} sx={{ fontSize: '0.7rem', textTransform: 'none' }}>Cancel</Button>
        <Box sx={{ display: 'flex', gap: 1 }}>
          {activeStep > 0 && (
            <Button size="small" onClick={handleBack} disabled={loading} startIcon={<NavigateBeforeIcon sx={{ fontSize: '1rem' }} />} sx={{ fontSize: '0.7rem', textTransform: 'none' }}>Back</Button>
          )}
          {activeStep === employeeSteps.length - 1 ? (
            <Button
              variant="contained" size="small" onClick={handleSubmitEmployee} disabled={loading}
              startIcon={loading ? null : <AddIcon sx={{ fontSize: '1rem' }} />}
              sx={{ fontSize: '0.7rem', textTransform: 'none', bgcolor: COLORS.primary, '&:hover': { bgcolor: COLORS.primaryDark } }}
            >
              {loading ? <CircularProgress size={16} sx={{ color: '#fff' }} /> : 'Add Employee'}
            </Button>
          ) : (
            <Button
              variant="contained" size="small" onClick={handleNext} disabled={loading}
              endIcon={<NavigateNextIcon sx={{ fontSize: '1rem' }} />}
              sx={{ fontSize: '0.7rem', textTransform: 'none', bgcolor: COLORS.primary, '&:hover': { bgcolor: COLORS.primaryDark } }}
            >
              Next
            </Button>
          )}
        </Box>
      </Box>
    </Paper>
  );
};

// ==================== Main AddPSV Component ====================
const AddPSV = ({ open, onClose, onAdd }) => {
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  
  // Inline employee form states
  const [showAddEmployee, setShowAddEmployee] = useState(false);
  const [employeeTypeForAdd, setEmployeeTypeForAdd] = useState(''); // 'conducted_by' or 'witness'
  
  // Data states
  const [employees, setEmployees] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [departments, setDepartments] = useState([]); // For employee form
  
  const [formData, setFormData] = useState({
    warehouse_id: '',
    verification_type: 'Cycle Count',
    conducted_by: '',
    witness: '',
    variance_threshold_percent: 5,
    variance_threshold_amount: 1000,
    action: 'No Action',
    remarks: ''
  });

  useEffect(() => {
    if (open) {
      fetchEmployees();
      fetchWarehouses();
      fetchDepartments();
      resetForm();
    }
  }, [open]);

  const fetchEmployees = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${BASE_URL}/api/employees?limit=1000`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        setEmployees(res.data.data || []);
      }
    } catch (err) {
      console.error('Error fetching employees:', err);
    }
  };

  const fetchDepartments = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${BASE_URL}/api/departments?limit=1000`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        setDepartments(res.data.data || []);
      }
    } catch (err) {
      console.error('Error fetching departments:', err);
    }
  };

  const fetchWarehouses = async () => {
    try {
      setFetching(true);
      const token = localStorage.getItem('token');
      const res = await axios.get(`${BASE_URL}/api/warehouses?limit=1000`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        setWarehouses(res.data.data || []);
      }
    } catch (err) {
      console.error('Error fetching warehouses:', err);
    } finally {
      setFetching(false);
    }
  };

  const resetForm = () => {
    setFormData({
      warehouse_id: '',
      verification_type: 'Cycle Count',
      conducted_by: '',
      witness: '',
      variance_threshold_percent: 5,
      variance_threshold_amount: 1000,
      action: 'No Action',
      remarks: ''
    });
    setErrors({});
    setApiError('');
    setActiveStep(0);
    setShowAddEmployee(false);
    setEmployeeTypeForAdd('');
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleAutocompleteChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value?._id || '' }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  // Handler for inline employee save
  const handleEmployeeAdded = (newEmployee) => {
    setEmployees(prev => [...prev, newEmployee]);
    if (employeeTypeForAdd === 'conducted_by') {
      setFormData(prev => ({ ...prev, conducted_by: newEmployee._id }));
    } else if (employeeTypeForAdd === 'witness') {
      setFormData(prev => ({ ...prev, witness: newEmployee._id }));
    }
    setShowAddEmployee(false);
    setEmployeeTypeForAdd('');
  };

  const validateStep = (step) => {
    const newErrors = {};
    let isValid = true;

    switch (step) {
      case 0: // Basic Information
        if (!formData.warehouse_id) {
          newErrors.warehouse_id = 'Warehouse is required';
          isValid = false;
        }
        if (!formData.verification_type) {
          newErrors.verification_type = 'Verification type is required';
          isValid = false;
        }
        if (!formData.conducted_by) {
          newErrors.conducted_by = 'Conducted By is required';
          isValid = false;
        }
        break;
      
      case 1: // Verification Settings
        if (!formData.variance_threshold_percent && formData.variance_threshold_percent !== 0) {
          newErrors.variance_threshold_percent = 'Variance threshold percent is required';
          isValid = false;
        } else if (formData.variance_threshold_percent < 0) {
          newErrors.variance_threshold_percent = 'Variance threshold percent must be >= 0';
          isValid = false;
        } else if (formData.variance_threshold_percent > 100) {
          newErrors.variance_threshold_percent = 'Variance threshold percent must be <= 100';
          isValid = false;
        }
        if (!formData.variance_threshold_amount && formData.variance_threshold_amount !== 0) {
          newErrors.variance_threshold_amount = 'Variance threshold amount is required';
          isValid = false;
        } else if (formData.variance_threshold_amount < 0) {
          newErrors.variance_threshold_amount = 'Variance threshold amount must be >= 0';
          isValid = false;
        }
        break;
      
      default:
        return true;
    }

    setErrors(newErrors);
    if (!isValid) {
      setApiError('Please fix the errors in this section');
    }
    return isValid;
  };

  const handleNext = () => {
    if (validateStep(activeStep)) {
      setApiError('');
      setActiveStep((prevStep) => prevStep + 1);
    }
  };

  const handleBack = () => {
    setApiError('');
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handleSubmit = async () => {
    if (!validateStep(1)) return;
    
    setLoading(true);
    setApiError('');
    
    try {
      const token = localStorage.getItem('token');
      
      const payload = {
        warehouse_id: formData.warehouse_id,
        verification_type: formData.verification_type,
        conducted_by: formData.conducted_by,
        witness: formData.witness || '',
        variance_threshold_percent: Number(formData.variance_threshold_percent),
        variance_threshold_amount: Number(formData.variance_threshold_amount),
        action: formData.action,
        remarks: formData.remarks || ''
      };
      
      const response = await axios.post(`${BASE_URL}/api/physical-verifications`, payload, {
        headers: { 
          Authorization: `Bearer ${token}`, 
          'Content-Type': 'application/json' 
        }
      });
      
      if (response.data.success) {
        if (onAdd) onAdd(response.data.data);
        onClose();
      } else {
        setErrors(prev => ({ ...prev, submit: response.data.message || 'Failed to create Physical Stock Verification' }));
      }
    } catch (err) {
      console.error('API Error:', err);
      
      if (err.response) {
        const errorMsg = err.response.data?.message || err.response.data?.error || 'Failed to create Physical Stock Verification';
        setApiError(errorMsg);
        setErrors(prev => ({ ...prev, submit: errorMsg }));
      } else if (err.request) {
        setApiError('No response from server. Please check your connection.');
      } else {
        setApiError(err.message || 'An error occurred while creating Physical Stock Verification');
      }
    } finally { 
      setLoading(false); 
    }
  };

  // Display helper functions
  const getPersonName = (person) => {
    if (!person) return '';
    if (person.FirstName && person.LastName) return `${person.FirstName} ${person.LastName}`;
    if (person.FirstName) return person.FirstName;
    if (person.Username) return person.Username;
    if (person.Email) return person.Email;
    if (person.name) return person.name;
    return person._id || '';
  };

  const getWarehouseDisplay = (wh) => {
    if (!wh) return '';
    return wh.warehouse_name || wh.name || wh.warehouse_code || wh._id || '';
  };

  const inputStyle = {
    '& .MuiOutlinedInput-root': {
      borderRadius: 1.5,
      fontSize: '0.75rem',
      '&:hover fieldset': { borderColor: COLORS.primary },
      '&.Mui-focused fieldset': { borderColor: COLORS.primary, borderWidth: 1 }
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

  const labelStyle = {
    fontSize: '0.7rem',
    fontWeight: 600,
    color: COLORS.text.secondary,
    letterSpacing: '0.5px',
    mb: 0.5
  };

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Stack spacing={2}>
            <Paper sx={{ p: 2.5, bgcolor: COLORS.background.white, borderRadius: 2, border: `1px solid ${COLORS.border}` }}>
              <Typography variant="subtitle2" sx={{ color: COLORS.primary, mb: 2, fontWeight: 600, fontSize: '0.9rem' }}>
                Basic Information
              </Typography>
              
              <Grid container spacing={2}>
                {/* Warehouse Selection */}
                <Grid size={{ xs: 12 }}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                    <Typography sx={labelStyle}>
                      WAREHOUSE <span style={{ color: '#EF4444' }}>*</span>
                    </Typography>
                    <Autocomplete
                      fullWidth
                      options={warehouses}
                      getOptionLabel={getWarehouseDisplay}
                      onChange={(e, val) => handleAutocompleteChange('warehouse_id', val)}
                      loading={fetching}
                      isOptionEqualToValue={(option, value) => option._id === value?._id}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          size="small"
                          error={!!errors.warehouse_id}
                          helperText={errors.warehouse_id}
                          placeholder="Select warehouse for verification"
                          sx={inputStyle}
                          InputProps={{
                            ...params.InputProps,
                            startAdornment: (
                              <InputAdornment position="start">
                                <WarehouseIcon sx={{ fontSize: '0.9rem', color: COLORS.text.tertiary }} />
                              </InputAdornment>
                            ),
                          }}
                        />
                      )}
                    />
                  </Box>
                </Grid>
                
                {/* Verification Type */}
                <Grid size={{ xs: 12, md: 6 }}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                    <Typography sx={labelStyle}>
                      VERIFICATION TYPE <span style={{ color: '#EF4444' }}>*</span>
                    </Typography>
                    <TextField
                      select
                      fullWidth
                      size="small"
                      name="verification_type"
                      value={formData.verification_type}
                      onChange={handleChange}
                      error={!!errors.verification_type}
                      helperText={errors.verification_type}
                      sx={inputStyle}
                    >
                      {VERIFICATION_TYPES.map((option) => (
                        <MenuItem key={option} value={option} sx={{ fontSize: '0.75rem' }}>
                          {option}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Box>
                </Grid>
                
                {/* Conducted By with inline add */}
                <Grid size={{ xs: 12, md: 6 }}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                    <Typography sx={labelStyle}>
                      CONDUCTED BY <span style={{ color: '#EF4444' }}>*</span>
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Box sx={{ flex: 1 }}>
                        <Autocomplete
                          fullWidth
                          options={employees}
                          getOptionLabel={getPersonName}
                          onChange={(e, val) => handleAutocompleteChange('conducted_by', val)}
                          isOptionEqualToValue={(option, value) => option._id === value?._id}
                          disabled={showAddEmployee && employeeTypeForAdd === 'conducted_by'}
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              size="small"
                              error={!!errors.conducted_by}
                              helperText={errors.conducted_by}
                              placeholder="Select person conducting verification"
                              sx={inputStyle}
                              InputProps={{
                                ...params.InputProps,
                                startAdornment: (
                                  <InputAdornment position="start">
                                    <PersonIcon sx={{ fontSize: '0.9rem', color: COLORS.text.tertiary }} />
                                  </InputAdornment>
                                ),
                              }}
                            />
                          )}
                        />
                      </Box>
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => {
                          if (showAddEmployee && employeeTypeForAdd === 'conducted_by') {
                            setShowAddEmployee(false);
                            setEmployeeTypeForAdd('');
                          } else {
                            setShowAddEmployee(true);
                            setEmployeeTypeForAdd('conducted_by');
                          }
                        }}
                        startIcon={showAddEmployee && employeeTypeForAdd === 'conducted_by' ? <CloseIcon sx={{ fontSize: '0.875rem' }} /> : <AddIcon sx={{ fontSize: '0.875rem' }} />}
                        sx={{
                          height: 36,
                          minWidth: 'auto',
                          px: 1.5,
                          borderRadius: 1.5,
                          border: `1px solid ${COLORS.border}`,
                          color: COLORS.text.secondary,
                          fontSize: '0.7rem',
                          fontWeight: 500,
                          textTransform: 'none',
                          whiteSpace: 'nowrap',
                          '&:hover': {
                            borderColor: COLORS.primary,
                            bgcolor: `${COLORS.primary}10`,
                            color: COLORS.primary
                          }
                        }}
                      >
                        {showAddEmployee && employeeTypeForAdd === 'conducted_by' ? 'Cancel' : 'Add New'}
                      </Button>
                    </Box>
                  </Box>
                </Grid>
                
                {/* Witness with inline add */}
                <Grid size={{ xs: 12, md: 6 }}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                    <Typography sx={labelStyle}>
                      WITNESS <span style={{ color: '#94A3B8', fontSize: '0.65rem' }}>(Optional)</span>
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Box sx={{ flex: 1 }}>
                        <Autocomplete
                          fullWidth
                          options={employees}
                          getOptionLabel={getPersonName}
                          onChange={(e, val) => handleAutocompleteChange('witness', val)}
                          isOptionEqualToValue={(option, value) => option._id === value?._id}
                          disabled={showAddEmployee && employeeTypeForAdd === 'witness'}
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              size="small"
                              error={!!errors.witness}
                              helperText={errors.witness}
                              placeholder="Select witness (optional)"
                              sx={inputStyle}
                              InputProps={{
                                ...params.InputProps,
                                startAdornment: (
                                  <InputAdornment position="start">
                                    <PersonIcon sx={{ fontSize: '0.9rem', color: COLORS.text.tertiary }} />
                                  </InputAdornment>
                                ),
                              }}
                            />
                          )}
                        />
                      </Box>
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => {
                          if (showAddEmployee && employeeTypeForAdd === 'witness') {
                            setShowAddEmployee(false);
                            setEmployeeTypeForAdd('');
                          } else {
                            setShowAddEmployee(true);
                            setEmployeeTypeForAdd('witness');
                          }
                        }}
                        startIcon={showAddEmployee && employeeTypeForAdd === 'witness' ? <CloseIcon sx={{ fontSize: '0.875rem' }} /> : <AddIcon sx={{ fontSize: '0.875rem' }} />}
                        sx={{
                          height: 36,
                          minWidth: 'auto',
                          px: 1.5,
                          borderRadius: 1.5,
                          border: `1px solid ${COLORS.border}`,
                          color: COLORS.text.secondary,
                          fontSize: '0.7rem',
                          fontWeight: 500,
                          textTransform: 'none',
                          whiteSpace: 'nowrap',
                          '&:hover': {
                            borderColor: COLORS.primary,
                            bgcolor: `${COLORS.primary}10`,
                            color: COLORS.primary
                          }
                        }}
                      >
                        {showAddEmployee && employeeTypeForAdd === 'witness' ? 'Cancel' : 'Add New'}
                      </Button>
                    </Box>
                  </Box>
                </Grid>
              </Grid>

              {/* ====== FULL-WIDTH INLINE EMPLOYEE FORM ====== */}
              {showAddEmployee && (
                <Box sx={{ mt: 2 }}>
                  <InlineEmployeeForm
                    onClose={() => { setShowAddEmployee(false); setEmployeeTypeForAdd(''); }}
                    onSave={handleEmployeeAdded}
                    departments={departments}
                  />
                </Box>
              )}
            </Paper>
          </Stack>
        );
      
      case 1:
        return (
          <Stack spacing={2}>
            <Paper sx={{ p: 2.5, bgcolor: COLORS.background.white, borderRadius: 2, border: `1px solid ${COLORS.border}` }}>
              <Typography variant="subtitle2" sx={{ color: COLORS.primary, mb: 2, fontWeight: 600, fontSize: '0.9rem' }}>
                Verification Settings
              </Typography>
              
              <Grid container spacing={2}>
                {/* Action Type */}
                <Grid size={{ xs: 12, md: 6 }}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                    <Typography sx={labelStyle}>
                      DEFAULT ACTION <span style={{ color: '#94A3B8', fontSize: '0.65rem' }}>(Optional)</span>
                    </Typography>
                    <TextField
                      select
                      fullWidth
                      size="small"
                      name="action"
                      value={formData.action}
                      onChange={handleChange}
                      sx={inputStyle}
                    >
                      {ACTION_TYPES.map((option) => (
                        <MenuItem key={option} value={option} sx={{ fontSize: '0.75rem' }}>
                          {option}
                        </MenuItem>
                      ))}
                    </TextField>
                    <Typography sx={{ fontSize: '0.6rem', color: COLORS.text.tertiary }}>
                      Default action to take when variance is detected
                    </Typography>
                  </Box>
                </Grid>

                {/* Variance Threshold Percent */}
                <Grid size={{ xs: 12, md: 6 }}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                    <Typography sx={labelStyle}>
                      VARIANCE THRESHOLD (%) <span style={{ color: '#EF4444' }}>*</span>
                    </Typography>
                    <TextField
                      fullWidth
                      type="number"
                      size="small"
                      name="variance_threshold_percent"
                      value={formData.variance_threshold_percent}
                      onChange={handleChange}
                      error={!!errors.variance_threshold_percent}
                      helperText={errors.variance_threshold_percent}
                      placeholder="Enter percentage threshold"
                      sx={inputStyle}
                      InputProps={{
                        inputProps: { min: 0, max: 100, step: 0.1 },
                        endAdornment: (
                          <InputAdornment position="end">
                            <Typography sx={{ fontSize: '0.7rem', color: COLORS.text.tertiary }}>%</Typography>
                          </InputAdornment>
                        ),
                      }}
                    />
                    <Typography sx={{ fontSize: '0.6rem', color: COLORS.text.tertiary }}>
                      Variance exceeding this percentage will trigger alerts
                    </Typography>
                  </Box>
                </Grid>
                
                {/* Variance Threshold Amount */}
                <Grid size={{ xs: 12, md: 6 }}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                    <Typography sx={labelStyle}>
                      VARIANCE THRESHOLD (AMOUNT) <span style={{ color: '#EF4444' }}>*</span>
                    </Typography>
                    <TextField
                      fullWidth
                      type="number"
                      size="small"
                      name="variance_threshold_amount"
                      value={formData.variance_threshold_amount}
                      onChange={handleChange}
                      error={!!errors.variance_threshold_amount}
                      helperText={errors.variance_threshold_amount}
                      placeholder="Enter amount threshold"
                      sx={inputStyle}
                      InputProps={{
                        inputProps: { min: 0, step: 0.01 },
                        startAdornment: (
                          <InputAdornment position="start">
                            <Typography sx={{ fontSize: '0.7rem', color: COLORS.text.tertiary }}>₹</Typography>
                          </InputAdornment>
                        ),
                      }}
                    />
                    <Typography sx={{ fontSize: '0.6rem', color: COLORS.text.tertiary }}>
                      Variance exceeding this amount will trigger alerts
                    </Typography>
                  </Box>
                </Grid>
                
                {/* Remarks */}
                <Grid size={{ xs: 12 }}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                    <Typography sx={labelStyle}>REMARKS</Typography>
                    <TextField
                      fullWidth
                      multiline
                      rows={3}
                      name="remarks"
                      value={formData.remarks}
                      onChange={handleChange}
                      size="small"
                      placeholder="Enter any additional remarks about the verification process..."
                      sx={inputStyle}
                    />
                  </Box>
                </Grid>
              </Grid>
            </Paper>

            {/* Summary Section */}
            {formData.warehouse_id && (
              <Paper sx={{ p: 2.5, bgcolor: COLORS.background.light, borderRadius: 2, border: `1px solid ${COLORS.border}` }}>
                <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color: COLORS.primary, mb: 2 }}>
                  Summary
                </Typography>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Stack spacing={1}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography sx={{ fontSize: '0.7rem', color: COLORS.text.secondary }}>Warehouse:</Typography>
                        <Typography sx={{ fontSize: '0.7rem', fontWeight: 500 }}>
                          {warehouses.find(w => w._id === formData.warehouse_id)?.warehouse_name || '-'}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography sx={{ fontSize: '0.7rem', color: COLORS.text.secondary }}>Verification Type:</Typography>
                        <Chip 
                          label={formData.verification_type} 
                          size="small"
                          sx={{ 
                            fontSize: '0.65rem', 
                            bgcolor: COLORS.primaryLight, 
                            color: COLORS.primary,
                            height: 20
                          }} 
                        />
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography sx={{ fontSize: '0.7rem', color: COLORS.text.secondary }}>Default Action:</Typography>
                        <Chip 
                          label={formData.action} 
                          size="small"
                          sx={{ 
                            fontSize: '0.65rem', 
                            bgcolor: COLORS.primaryLight, 
                            color: COLORS.primary,
                            height: 20
                          }} 
                        />
                      </Box>
                    </Stack>
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Stack spacing={1}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography sx={{ fontSize: '0.7rem', color: COLORS.text.secondary }}>Conducted By:</Typography>
                        <Typography sx={{ fontSize: '0.7rem', fontWeight: 500 }}>
                          {employees.find(e => e._id === formData.conducted_by)?.FirstName || '-'}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography sx={{ fontSize: '0.7rem', color: COLORS.text.secondary }}>Witness:</Typography>
                        <Typography sx={{ fontSize: '0.7rem', fontWeight: 500 }}>
                          {employees.find(e => e._id === formData.witness)?.FirstName || 'Not specified'}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography sx={{ fontSize: '0.7rem', color: COLORS.text.secondary }}>Variance Threshold:</Typography>
                        <Typography sx={{ fontSize: '0.7rem', fontWeight: 500 }}>
                          {formData.variance_threshold_percent}% / ₹{formData.variance_threshold_amount.toLocaleString()}
                        </Typography>
                      </Box>
                    </Stack>
                  </Grid>
                </Grid>
              </Paper>
            )}
          </Stack>
        );
      
      default:
        return null;
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 5,
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05)',
          border: `1px solid ${COLORS.border}`,
          overflow: 'hidden',
          maxHeight: '95vh'
        }
      }}
    >
      <DialogTitle sx={{
        borderBottom: `1px solid ${COLORS.border}`,
        py: 1.5,
        px: 2.5,
        mb: 2,
        bgcolor: COLORS.background.white,
        display: 'flex',
        flexDirection: 'column',
        gap: 1
      }}>
        <Typography sx={{ fontSize: '1.2rem', fontWeight: 700, color: COLORS.text.primary }}>
          Create Physical Stock Verification
        </Typography>

        <Stepper activeStep={activeStep} alternativeLabel connector={<ColorConnector />} sx={{ mb: 0.5, mt: 0.5 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>
                <Typography fontWeight={500} fontSize="0.8rem" color={COLORS.text.secondary}>
                  {label}
                </Typography>
              </StepLabel>
            </Step>
          ))}
        </Stepper>
      </DialogTitle>

      <DialogContent sx={{ p: 2.5, overflow: 'auto' }}>
        {apiError && (
          <Alert severity="error" icon={<ErrorIcon />} sx={{ mb: 2, borderRadius: 1.5 }} onClose={() => setApiError('')}>
            <strong>Error!</strong><br />
            {apiError}
          </Alert>
        )}
        
        {errors.submit && (
          <Alert severity="error" sx={{ mb: 2, borderRadius: 1.5 }} onClose={() => setErrors(prev => ({ ...prev, submit: '' }))}>
            {errors.submit}
          </Alert>
        )}

        {renderStepContent(activeStep)}
      </DialogContent>

      <DialogActions sx={{
        px: 2.5,
        py: 1.5,
        borderTop: `1px solid ${COLORS.border}`,
        bgcolor: COLORS.background.white,
        display: 'flex',
        justifyContent: 'space-between',
        gap: 1
      }}>
        <Button
          onClick={onClose}
          disabled={loading}
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
        
        <Box sx={{ display: 'flex', gap: 1 }}>
          {activeStep > 0 && (
            <Button
              onClick={handleBack}
              disabled={loading}
              startIcon={<NavigateBeforeIcon sx={{ fontSize: '1rem' }} />}
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
              Back
            </Button>
          )}
          
          {activeStep === steps.length - 1 ? (
            <Button
              variant="contained"
              onClick={handleSubmit}
              disabled={loading}
              startIcon={loading ? null : <CheckCircleIcon sx={{ fontSize: '1rem' }} />}
              sx={{
                height: 32,
                px: 2,
                borderRadius: 1.5,
                bgcolor: COLORS.primary,
                fontSize: '0.7rem',
                fontWeight: 500,
                textTransform: 'none',
                boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
                '&:hover': { bgcolor: COLORS.primaryDark }
              }}
            >
              {loading ? <CircularProgress size={16} sx={{ color: COLORS.text.light }} /> : 'Create Verification'}
            </Button>
          ) : (
            <Button
              variant="contained"
              onClick={handleNext}
              disabled={loading || !formData.warehouse_id}
              endIcon={<NavigateNextIcon sx={{ fontSize: '1rem' }} />}
              sx={{
                height: 32,
                px: 2,
                borderRadius: 1.5,
                bgcolor: COLORS.primary,
                fontSize: '0.7rem',
                fontWeight: 500,
                textTransform: 'none',
                boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
                '&:hover': { bgcolor: COLORS.primaryDark }
              }}
            >
              Next
            </Button>
          )}
        </Box>
      </DialogActions>
    </Dialog>
  );
};

export default AddPSV;