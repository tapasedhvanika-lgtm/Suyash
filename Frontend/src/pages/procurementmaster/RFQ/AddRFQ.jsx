// // AddRFQ.js
// import React, { useState, useEffect } from 'react';
// import {
//   Box,
//   Paper,
//   Grid,
//   TextField,
//   Typography,
//   Button,
//   Stack,
//   Dialog,
//   DialogTitle,
//   DialogContent,
//   DialogActions,
//   Alert,
//   FormControl,
//   Select,
//   MenuItem,
//   IconButton,
//   Table,
//   TableBody,
//   TableCell,
//   TableContainer,
//   TableHead,
//   TableRow,
//   Autocomplete,
//   Chip,
//   InputAdornment,
//   CircularProgress,
//   Stepper,
//   Step,
//   StepLabel,
//   StepConnector,
//   stepConnectorClasses,
//   styled
// } from '@mui/material';
// import { 
//   Add as AddIcon,
//   Delete as DeleteIcon,
//   Close as CloseIcon,
//   NavigateNext as NavigateNextIcon,
//   NavigateBefore as NavigateBeforeIcon
// } from '@mui/icons-material';
// import axios from 'axios';
// import BASE_URL from '../../../config/Config';

// const COLORS = {
//   primary: '#063C3F',
//   primaryLight: '#E8F0F1',
//   primaryDark: '#05292B',
//   primaryBlue: '#00B4D8',
//   text: { primary: '#151C26', secondary: '#4B5568', tertiary: '#94A3B8' },
//   background: { white: '#FFFFFF', light: '#F8FFFC', hover: '#F0FDF9' },
//   border: '#E3E8EF'
// };

// const HEADER_GRADIENT = 'linear-gradient(135deg, #063C3F 0%, #00B4D8 50%, #05292B 100%)';
// const PRIMARY_DARK = '#063C3F';
// const PRIMARY_BLUE = '#00B4D8';

// // Modern Stepper Connector with Gradient
// const ColorConnector = styled(StepConnector)(({ theme }) => ({
//   [`&.${stepConnectorClasses.active}`]: {
//     [`& .${stepConnectorClasses.line}`]: {
//       backgroundImage: HEADER_GRADIENT,
//     },
//   },
//   [`&.${stepConnectorClasses.completed}`]: {
//     [`& .${stepConnectorClasses.line}`]: {
//       backgroundImage: HEADER_GRADIENT,
//     },
//   },
//   [`& .${stepConnectorClasses.line}`]: {
//     height: 2,
//     border: 0,
//     backgroundColor: '#eaeaf0',
//     borderRadius: 1,
//   },
// }));

// // Custom Step Icon styling
// const CustomStepIconRoot = styled('div')(({ theme, ownerState }) => ({
//   backgroundColor: ownerState.active || ownerState.completed ? PRIMARY_BLUE : '#ccc',
//   zIndex: 1,
//   color: '#fff',
//   width: 24,
//   height: 24,
//   display: 'flex',
//   borderRadius: '50%',
//   justifyContent: 'center',
//   alignItems: 'center',
//   fontSize: '0.75rem',
//   fontWeight: 600,
//   ...(ownerState.active && {
//     backgroundColor: PRIMARY_BLUE,
//     boxShadow: '0 4px 10px 0 rgba(0,180,216,0.3)',
//   }),
//   ...(ownerState.completed && {
//     backgroundColor: PRIMARY_BLUE,
//   }),
// }));

// function CustomStepIcon(props) {
//   const { active, completed, className } = props;
//   return (
//     <CustomStepIconRoot ownerState={{ active, completed }} className={className}>
//       {completed ? '✓' : props.icon}
//     </CustomStepIconRoot>
//   );
// }

// const steps = ['Basic Info', 'Items & Vendors'];

// const AddRFQ = ({ open, onClose, onAdd }) => {
//   const [activeStep, setActiveStep] = useState(0);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState('');
//   const [pendingPRs, setPendingPRs] = useState([]);
//   const [loadingPRs, setLoadingPRs] = useState(false);
//   const [vendors, setVendors] = useState([]);
//   const [loadingVendors, setLoadingVendors] = useState(false);
  
//   const [formData, setFormData] = useState({
//     pr_id: '',
//     valid_till: '',
//     vendor_ids: []
//   });

//   const [selectedPR, setSelectedPR] = useState(null);
//   const [fieldErrors, setFieldErrors] = useState({});

//   useEffect(() => {
//     if (open) {
//       fetchPendingPRs();
//       fetchVendors();
//     }
//   }, [open]);

//   const fetchPendingPRs = async () => {
//     try {
//       setLoadingPRs(true);
//       const token = localStorage.getItem('token');
//       const response = await axios.get(`${BASE_URL}/api/purchase-requisitions/pending-rfq`, {
//         headers: { 'Authorization': `Bearer ${token}` }
//       });
//       if (response.data.success) {
//         setPendingPRs(response.data.data || []);
//       }
//     } catch (err) {
//       console.error('Error fetching pending PRs:', err);
//     } finally {
//       setLoadingPRs(false);
//     }
//   };

//   const fetchVendors = async () => {
//     try {
//       setLoadingVendors(true);
//       const token = localStorage.getItem('token');
//       const response = await axios.get(`${BASE_URL}/api/vendors?page=1&limit=100`, {
//         headers: { 'Authorization': `Bearer ${token}` }
//       });
//       if (response.data.success) {
//         setVendors(response.data.data || []);
//       }
//     } catch (err) {
//       console.error('Error fetching vendors:', err);
//     } finally {
//       setLoadingVendors(false);
//     }
//   };

//   const handlePRChange = (event, value) => {
//     setSelectedPR(value);
//     setFormData(prev => ({ ...prev, pr_id: value?._id || '' }));
//     setFieldErrors(prev => ({ ...prev, pr_id: '' }));
//   };

//   const handleVendorSelect = (event, newValue) => {
//     setFormData(prev => ({ ...prev, vendor_ids: newValue.map(v => v._id) }));
//     setFieldErrors(prev => ({ ...prev, vendor_ids: '' }));
//   };

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFieldErrors(prev => ({ ...prev, [name]: '' }));
//     setFormData(prev => ({ ...prev, [name]: value }));
//   };

//   const validateStep = (step) => {
//     const errors = {};
//     let isValid = true;

//     switch (step) {
//       case 0: // Basic Info
//         if (!formData.pr_id) {
//           errors.pr_id = 'Purchase requisition is required';
//           isValid = false;
//         }
//         if (!formData.valid_till) {
//           errors.valid_till = 'Valid till date is required';
//           isValid = false;
//         }
//         break;
//       case 1: // Items & Vendors
//         if (formData.vendor_ids.length === 0) {
//           errors.vendor_ids = 'At least one vendor is required';
//           isValid = false;
//         }
//         break;
//       default:
//         break;
//     }

//     setFieldErrors(errors);
//     if (!isValid) {
//       setError('Please fill all required fields');
//     }
//     return isValid;
//   };

//   const handleNext = () => {
//     if (validateStep(activeStep)) {
//       setError('');
//       setActiveStep((prevStep) => prevStep + 1);
//     }
//   };

//   const handleBack = () => {
//     setError('');
//     setActiveStep((prevStep) => prevStep - 1);
//   };

//   const handleSubmit = async () => {
//     if (formData.vendor_ids.length === 0) {
//       setError('At least one vendor is required');
//       return;
//     }

//     setLoading(true);
//     setError('');

//     try {
//       const token = localStorage.getItem('token');
//       const user = JSON.parse(localStorage.getItem('user') || '{}');
      
//       const submissionData = {
//         pr_id: formData.pr_id,
//         valid_till: formData.valid_till,
//         vendor_ids: formData.vendor_ids,
//         created_by: user._id
//       };

//       const response = await axios.post(`${BASE_URL}/api/rfqs`, submissionData, {
//         headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
//       });

//       if (response.data.success) {
//         onAdd(response.data.data);
//         resetForm();
//         onClose();
//       } else {
//         setError(response.data.message || 'Failed to create RFQ');
//       }
//     } catch (err) {
//       console.error('Error creating RFQ:', err);
//       setError(err.response?.data?.message || 'Failed to create RFQ');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const resetForm = () => {
//     setFormData({ pr_id: '', valid_till: '', vendor_ids: [] });
//     setSelectedPR(null);
//     setFieldErrors({});
//     setError('');
//     setActiveStep(0);
//   };

//   const handleClose = () => {
//     resetForm();
//     onClose();
//   };

//   const today = new Date().toISOString().split('T')[0];
//   const selectedVendorObjects = vendors.filter(v => formData.vendor_ids.includes(v._id));

//   const renderStepContent = (step) => {
//     switch (step) {
//       case 0: // Basic Info
//         return (
//           <Stack spacing={2}>
//             <Paper sx={{ p: 2, bgcolor: COLORS.background.white, borderRadius: 1.5, border: `1px solid ${COLORS.border}` }}>
//               <Typography variant="subtitle2" sx={{ color: COLORS.primary, mb: 1.5, fontWeight: 600, fontSize: '0.9rem' }}>
//                 Basic Information
//               </Typography>
              
//               <Grid container spacing={1.5}>
//                 <Grid size={{ xs: 12 }}>
//                   <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//                     <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary }}>
//                       PURCHASE REQUISITION <span style={{ color: '#EF4444' }}>*</span>
//                     </Typography>
//                     <Autocomplete
//                       options={pendingPRs}
//                       loading={loadingPRs}
//                       value={selectedPR}
//                       onChange={handlePRChange}
//                       getOptionLabel={(opt) => `${opt.pr_number} - ${opt.department} (${opt.items?.length || 0} items) - ₹${opt.total_estimated_value?.toLocaleString() || 0}`}
//                       renderInput={(params) => (
//                         <TextField 
//                           {...params} 
//                           size="small" 
//                           placeholder="Select purchase requisition..." 
//                           error={!!fieldErrors.pr_id} 
//                           helperText={fieldErrors.pr_id}
//                           sx={{
//                             '& .MuiOutlinedInput-root': {
//                               borderRadius: 1.5,
//                               fontSize: '0.75rem',
//                               '&:hover fieldset': { borderColor: COLORS.primary },
//                               '&.Mui-focused fieldset': { borderColor: COLORS.primary, borderWidth: 1 }
//                             },
//                             '& .MuiInputBase-input': { py: 1, px: 1.5, fontSize: '0.75rem' },
//                             '& .MuiFormHelperText-root': { fontSize: '0.65rem', marginLeft: 0 }
//                           }}
//                         />
//                       )}
//                       renderOption={(props, opt) => (
//                         <li {...props}>
//                           <Box>
//                             <Typography variant="body2" fontWeight={500} sx={{ fontSize: '0.75rem' }}>{opt.pr_number}</Typography>
//                             <Typography variant="caption" sx={{ fontSize: '0.65rem', color: COLORS.text.tertiary }}>
//                               {opt.department} | {opt.items?.length} items | ₹{opt.total_estimated_value?.toLocaleString()}
//                             </Typography>
//                           </Box>
//                         </li>
//                       )}
//                     />
//                   </Box>
//                 </Grid>
//                 <Grid size={{ xs: 12 }}>
//                   <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//                     <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary }}>
//                       VALID TILL <span style={{ color: '#EF4444' }}>*</span>
//                     </Typography>
//                     <TextField
//                       fullWidth
//                       size="small"
//                       type="date"
//                       name="valid_till"
//                       value={formData.valid_till}
//                       onChange={handleChange}
//                       error={!!fieldErrors.valid_till}
//                       helperText={fieldErrors.valid_till}
//                       InputLabelProps={{ shrink: true }}
//                       inputProps={{ min: today }}
//                       sx={{
//                         '& .MuiOutlinedInput-root': {
//                           borderRadius: 1.5,
//                           fontSize: '0.75rem',
//                           '&:hover fieldset': { borderColor: COLORS.primary },
//                           '&.Mui-focused fieldset': { borderColor: COLORS.primary, borderWidth: 1 }
//                         },
//                         '& .MuiInputBase-input': { py: 1, px: 1.5, fontSize: '0.75rem' },
//                         '& .MuiFormHelperText-root': { fontSize: '0.65rem', marginLeft: 0 }
//                       }}
//                     />
//                   </Box>
//                 </Grid>
//               </Grid>
//             </Paper>
//           </Stack>
//         );
      
//       case 1: // Items & Vendors
//         return (
//           <Stack spacing={2}>
//             {selectedPR && selectedPR.items && selectedPR.items.length > 0 && (
//               <Paper sx={{ p: 2, bgcolor: COLORS.background.white, borderRadius: 1.5, border: `1px solid ${COLORS.border}` }}>
//                 <Typography variant="subtitle2" sx={{ color: COLORS.primary, mb: 1.5, fontWeight: 600, fontSize: '0.9rem' }}>
//                   Items
//                 </Typography>
//                 <TableContainer>
//                   <Table size="small">
//                     <TableHead>
//                       <TableRow sx={{ bgcolor: COLORS.background.light }}>
//                         <TableCell sx={{ fontSize: '0.7rem', fontWeight: 600 }}>Part No</TableCell>
//                         <TableCell sx={{ fontSize: '0.7rem', fontWeight: 600 }}>Description</TableCell>
//                         <TableCell sx={{ fontSize: '0.7rem', fontWeight: 600 }} align="center">Qty</TableCell>
//                         <TableCell sx={{ fontSize: '0.7rem', fontWeight: 600 }} align="right">Unit</TableCell>
//                       </TableRow>
//                     </TableHead>
//                     <TableBody>
//                       {selectedPR.items.map((item, idx) => (
//                         <TableRow key={idx}>
//                           <TableCell sx={{ fontSize: '0.75rem' }}>{item.part_no}</TableCell>
//                           <TableCell sx={{ fontSize: '0.75rem' }}>{item.description}</TableCell>
//                           <TableCell sx={{ fontSize: '0.75rem' }} align="center">{item.required_qty}</TableCell>
//                           <TableCell sx={{ fontSize: '0.75rem' }} align="right">{item.unit}</TableCell>
//                         </TableRow>
//                       ))}
//                     </TableBody>
//                   </Table>
//                 </TableContainer>
//               </Paper>
//             )}

//             <Paper sx={{ p: 2, bgcolor: COLORS.background.white, borderRadius: 1.5, border: `1px solid ${COLORS.border}` }}>
//               <Typography variant="subtitle2" sx={{ color: COLORS.primary, mb: 1.5, fontWeight: 600, fontSize: '0.9rem' }}>
//                 Select Vendors
//               </Typography>
              
//               <Autocomplete
//                 multiple
//                 options={vendors}
//                 loading={loadingVendors}
//                 value={selectedVendorObjects}
//                 onChange={handleVendorSelect}
//                 getOptionLabel={(opt) => `${opt.vendor_code} - ${opt.vendor_name}`}
//                 renderInput={(params) => (
//                   <TextField 
//                     {...params} 
//                     size="small" 
//                     placeholder="Select vendors..." 
//                     error={!!fieldErrors.vendor_ids} 
//                     helperText={fieldErrors.vendor_ids}
//                     sx={{
//                       '& .MuiOutlinedInput-root': {
//                         borderRadius: 1.5,
//                         fontSize: '0.75rem',
//                         '&:hover fieldset': { borderColor: COLORS.primary },
//                         '&.Mui-focused fieldset': { borderColor: COLORS.primary, borderWidth: 1 }
//                       },
//                       '& .MuiInputBase-input': { py: 1, px: 1.5, fontSize: '0.75rem' },
//                       '& .MuiFormHelperText-root': { fontSize: '0.65rem', marginLeft: 0 }
//                     }}
//                   />
//                 )}
//                 renderTags={(value, getTagProps) =>
//                   value.map((option, index) => (
//                     <Chip
//                       key={option._id}
//                       label={`${option.vendor_code} - ${option.vendor_name}`}
//                       size="small"
//                       {...getTagProps({ index })}
//                       sx={{ 
//                         fontSize: '0.7rem', 
//                         height: 24, 
//                         bgcolor: COLORS.primaryLight, 
//                         color: COLORS.primary,
//                         '& .MuiChip-label': { px: 1 }
//                       }}
//                     />
//                   ))
//                 }
//                 renderOption={(props, option) => (
//                   <li {...props}>
//                     <Box>
//                       <Typography variant="body2" fontWeight={500} sx={{ fontSize: '0.75rem' }}>{option.vendor_name}</Typography>
//                       <Typography variant="caption" sx={{ fontSize: '0.65rem', color: COLORS.text.tertiary }}>
//                         Code: {option.vendor_code} | GST: {option.gstin || 'N/A'}
//                       </Typography>
//                     </Box>
//                   </li>
//                 )}
//               />
//             </Paper>
//           </Stack>
//         );
      
//       default:
//         return null;
//     }
//   };

//   return (
//     <Dialog
//       open={open}
//       onClose={handleClose}
//       maxWidth="md"
//       fullWidth
//       PaperProps={{
//         sx: {
//           borderRadius: 5,
//           boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05)',
//           border: `1px solid ${COLORS.border}`,
//           overflow: 'hidden',
//           maxHeight: '95vh'
//         }
//       }}
//     >
//       <DialogTitle sx={{
//         borderBottom: `1px solid ${COLORS.border}`,
//         py: 1.5,
//         px: 2.5,
//         bgcolor: COLORS.background.white,
//         display: 'flex',
//         flexDirection: 'column',
//         gap: 1
//       }}>
//         <Typography sx={{ fontSize: '1.2rem', fontWeight: 700, color: COLORS.text.primary }}>
//           Create Request for Quotation
//         </Typography>

//         <Stepper
//           activeStep={activeStep}
//           alternativeLabel
//           connector={<ColorConnector />}
//           sx={{ mb: 0.5, mt: 0.5 }}
//         >
//           {steps.map((label) => (
//             <Step key={label}>
//               <StepLabel StepIconComponent={CustomStepIcon}>
//                 <Typography fontWeight={500} fontSize="0.8rem" color={COLORS.text.secondary}>
//                   {label}
//                 </Typography>
//               </StepLabel>
//             </Step>
//           ))}
//         </Stepper>
//       </DialogTitle>

//       <DialogContent sx={{ p: 2.5, overflow: 'auto' }}>
//         {renderStepContent(activeStep)}

//         {error && (
//           <Alert 
//             severity="error" 
//             sx={{ 
//               mt: 2, 
//               borderRadius: 1.5,
//               '& .MuiAlert-icon': { fontSize: '1.25rem', alignItems: 'center' },
//               fontSize: '0.75rem',
//               py: 0.5
//             }}
//           >
//             {error}
//           </Alert>
//         )}
//       </DialogContent>

//       <DialogActions sx={{
//         px: 2.5,
//         py: 1.5,
//         borderTop: `1px solid ${COLORS.border}`,
//         bgcolor: COLORS.background.white,
//         display: 'flex',
//         justifyContent: 'space-between',
//         gap: 1
//       }}>
//         <Button
//           onClick={handleBack}
//           disabled={activeStep === 0 || loading}
//           startIcon={<NavigateBeforeIcon sx={{ fontSize: '1rem' }} />}
//           sx={{
//             height: 32,
//             px: 2,
//             borderRadius: 1.5,
//             border: `1px solid ${COLORS.border}`,
//             color: COLORS.text.secondary,
//             fontSize: '0.7rem',
//             fontWeight: 500,
//             textTransform: 'none',
//             '&:hover': {
//               borderColor: COLORS.primary,
//               bgcolor: `${COLORS.primary}10`
//             }
//           }}
//         >
//           Back
//         </Button>
//         <Box sx={{ display: 'flex', gap: 1 }}>
//           <Button
//             onClick={handleClose}
//             disabled={loading}
//             startIcon={<CloseIcon sx={{ fontSize: '1rem' }} />}
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
//           {activeStep === steps.length - 1 ? (
//             <Button
//               variant="contained"
//               onClick={handleSubmit}
//               disabled={loading || !formData.pr_id || !formData.valid_till || formData.vendor_ids.length === 0}
//               startIcon={loading ? null : <AddIcon sx={{ fontSize: '1rem' }} />}
//               sx={{
//                 height: 32,
//                 px: 2,
//                 borderRadius: 1.5,
//                 bgcolor: COLORS.primary,
//                 fontSize: '0.7rem',
//                 fontWeight: 500,
//                 textTransform: 'none',
//                 boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
//                 '&:hover': { bgcolor: COLORS.primaryDark }
//               }}
//             >
//               {loading ? 'Creating...' : 'Create RFQ'}
//             </Button>
//           ) : (
//             <Button
//               variant="contained"
//               onClick={handleNext}
//               disabled={loading}
//               endIcon={<NavigateNextIcon sx={{ fontSize: '1rem' }} />}
//               sx={{
//                 height: 32,
//                 px: 2,
//                 borderRadius: 1.5,
//                 bgcolor: COLORS.primary,
//                 fontSize: '0.7rem',
//                 fontWeight: 500,
//                 textTransform: 'none',
//                 boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
//                 '&:hover': { bgcolor: COLORS.primaryDark }
//               }}
//             >
//               Next
//             </Button>
//           )}
//         </Box>
//       </DialogActions>
//     </Dialog>
//   );
// };

// export default AddRFQ;

// // AddRFQ.js
// import React, { useState, useEffect } from 'react';
// import {
//   Box,
//   Paper,
//   Grid,
//   TextField,
//   Typography,
//   Button,
//   Stack,
//   Dialog,
//   DialogTitle,
//   DialogContent,
//   DialogActions,
//   Alert,
//   Table,
//   TableBody,
//   TableCell,
//   TableContainer,
//   TableHead,
//   TableRow,
//   Autocomplete,
//   Chip,
//   Stepper,
//   Step,
//   StepLabel,
//   StepConnector,
//   stepConnectorClasses,
//   styled,
//   CircularProgress,
//   Link,
//   Tooltip
// } from '@mui/material';
// import { 
//   Add as AddIcon,
//   Close as CloseIcon,
//   NavigateNext as NavigateNextIcon,
//   NavigateBefore as NavigateBeforeIcon,
//   AddCircle as AddCircleIcon,
//   Verified as VerifiedIcon,
//   Warning as WarningIcon,
//   Edit as EditIcon
// } from '@mui/icons-material';
// import axios from 'axios';
// import BASE_URL from '../../../config/Config';
// import AddVendor from '../../master/vendormaster/AddVendor';
// import ApproveVendor from '../../master/vendormaster/ApproveVendor';

// const COLORS = {
//   primary: '#063C3F',
//   primaryLight: '#E8F0F1',
//   primaryDark: '#05292B',
//   primaryBlue: '#00B4D8',
//   text: { primary: '#151C26', secondary: '#4B5568', tertiary: '#94A3B8' },
//   background: { white: '#FFFFFF', light: '#F8FFFC', hover: '#F0FDF9' },
//   border: '#E3E8EF',
//   success: '#10B981',
//   warning: '#F59E0B',
//   error: '#EF4444'
// };

// const HEADER_GRADIENT = 'linear-gradient(135deg, #063C3F 0%, #00B4D8 50%, #05292B 100%)';
// const PRIMARY_DARK = '#063C3F';
// const PRIMARY_BLUE = '#00B4D8';

// // Modern Stepper Connector with Gradient
// const ColorConnector = styled(StepConnector)(({ theme }) => ({
//   [`&.${stepConnectorClasses.active}`]: {
//     [`& .${stepConnectorClasses.line}`]: {
//       backgroundImage: HEADER_GRADIENT,
//     },
//   },
//   [`&.${stepConnectorClasses.completed}`]: {
//     [`& .${stepConnectorClasses.line}`]: {
//       backgroundImage: HEADER_GRADIENT,
//     },
//   },
//   [`& .${stepConnectorClasses.line}`]: {
//     height: 2,
//     border: 0,
//     backgroundColor: '#eaeaf0',
//     borderRadius: 1,
//   },
// }));

// // Custom Step Icon styling
// const CustomStepIconRoot = styled('div')(({ theme, ownerState }) => ({
//   backgroundColor: ownerState.active || ownerState.completed ? PRIMARY_BLUE : '#ccc',
//   zIndex: 1,
//   color: '#fff',
//   width: 24,
//   height: 24,
//   display: 'flex',
//   borderRadius: '50%',
//   justifyContent: 'center',
//   alignItems: 'center',
//   fontSize: '0.75rem',
//   fontWeight: 600,
//   ...(ownerState.active && {
//     backgroundColor: PRIMARY_BLUE,
//     boxShadow: '0 4px 10px 0 rgba(0,180,216,0.3)',
//   }),
//   ...(ownerState.completed && {
//     backgroundColor: PRIMARY_BLUE,
//   }),
// }));

// function CustomStepIcon(props) {
//   const { active, completed, className } = props;
//   return (
//     <CustomStepIconRoot ownerState={{ active, completed }} className={className}>
//       {completed ? '✓' : props.icon}
//     </CustomStepIconRoot>
//   );
// }

// const steps = ['Basic Info', 'Items & Vendors'];

// // Helper function to safely get department name
// const getDepartmentName = (department) => {
//   if (!department) return 'N/A';
//   if (typeof department === 'string') return department;
//   if (typeof department === 'object') {
//     return department.DepartmentName || department.name || 'N/A';
//   }
//   return 'N/A';
// };

// const AddRFQ = ({ open, onClose, onAdd }) => {
//   const [activeStep, setActiveStep] = useState(0);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState('');
//   const [pendingPRs, setPendingPRs] = useState([]);
//   const [loadingPRs, setLoadingPRs] = useState(false);
//   const [vendors, setVendors] = useState([]);
//   const [loadingVendors, setLoadingVendors] = useState(false);
//   const [showAddVendor, setShowAddVendor] = useState(false);
//   const [showApproveVendor, setShowApproveVendor] = useState(false);
//   const [selectedVendorForApproval, setSelectedVendorForApproval] = useState(null);
  
//   const [formData, setFormData] = useState({
//     pr_id: '',
//     valid_till: '',
//     vendor_ids: []
//   });

//   const [selectedPR, setSelectedPR] = useState(null);
//   const [fieldErrors, setFieldErrors] = useState({});

//   useEffect(() => {
//     if (open) {
//       fetchPendingPRs();
//       fetchVendors();
//     }
//   }, [open]);

//   const fetchPendingPRs = async () => {
//     try {
//       setLoadingPRs(true);
//       const token = localStorage.getItem('token');
//       const response = await axios.get(`${BASE_URL}/api/purchase-requisitions/pending-rfq`, {
//         headers: { 'Authorization': `Bearer ${token}` }
//       });
//       if (response.data.success) {
//         setPendingPRs(response.data.data || []);
//       }
//     } catch (err) {
//       console.error('Error fetching pending PRs:', err);
//       setError(err.response?.data?.message || 'Failed to fetch pending PRs');
//     } finally {
//       setLoadingPRs(false);
//     }
//   };

//   const fetchVendors = async () => {
//     try {
//       setLoadingVendors(true);
//       const token = localStorage.getItem('token');
//       const response = await axios.get(`${BASE_URL}/api/vendors`, {
//         headers: { 'Authorization': `Bearer ${token}` }
//       });
//       if (response.data.success) {
//         setVendors(response.data.data || []);
//       }
//     } catch (err) {
//       console.error('Error fetching vendors:', err);
//     } finally {
//       setLoadingVendors(false);
//     }
//   };

//   const handlePRChange = (event, value) => {
//     setSelectedPR(value);
//     setFormData(prev => ({ ...prev, pr_id: value?._id || '' }));
//     setFieldErrors(prev => ({ ...prev, pr_id: '' }));
//   };

//   const handleVendorSelect = (event, newValue) => {
//     setFormData(prev => ({ ...prev, vendor_ids: newValue.map(v => v._id) }));
//     setFieldErrors(prev => ({ ...prev, vendor_ids: '' }));
//   };

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFieldErrors(prev => ({ ...prev, [name]: '' }));
//     setFormData(prev => ({ ...prev, [name]: value }));
//   };

//   const validateStep = (step) => {
//     const errors = {};
//     let isValid = true;

//     switch (step) {
//       case 0:
//         if (!formData.pr_id) {
//           errors.pr_id = 'Purchase requisition is required';
//           isValid = false;
//         }
//         if (!formData.valid_till) {
//           errors.valid_till = 'Valid till date is required';
//           isValid = false;
//         }
//         break;
//       case 1:
//         if (formData.vendor_ids.length === 0) {
//           errors.vendor_ids = 'At least one vendor is required';
//           isValid = false;
//         }
//         break;
//       default:
//         break;
//     }

//     setFieldErrors(errors);
//     if (!isValid) {
//       setError('Please fill all required fields');
//     }
//     return isValid;
//   };

//   const handleNext = () => {
//     if (validateStep(activeStep)) {
//       setError('');
//       setActiveStep((prevStep) => prevStep + 1);
//     }
//   };

//   const handleBack = () => {
//     setError('');
//     setActiveStep((prevStep) => prevStep - 1);
//   };

//   const handleSubmit = async () => {
//     if (formData.vendor_ids.length === 0) {
//       setError('At least one vendor is required');
//       return;
//     }

//     setLoading(true);
//     setError('');

//     try {
//       const token = localStorage.getItem('token');
//       const user = JSON.parse(localStorage.getItem('user') || '{}');
      
//       const submissionData = {
//         pr_id: formData.pr_id,
//         valid_till: formData.valid_till,
//         vendor_ids: formData.vendor_ids,
//         created_by: user._id
//       };

//       const response = await axios.post(`${BASE_URL}/api/rfqs`, submissionData, {
//         headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
//       });

//       if (response.data.success) {
//         onAdd(response.data.data);
//         resetForm();
//         onClose();
//       } else {
//         setError(response.data.message || 'Failed to create RFQ');
//       }
//     } catch (err) {
//       console.error('Error creating RFQ:', err);
//       setError(err.response?.data?.message || 'Failed to create RFQ');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const resetForm = () => {
//     setFormData({ pr_id: '', valid_till: '', vendor_ids: [] });
//     setSelectedPR(null);
//     setFieldErrors({});
//     setError('');
//     setActiveStep(0);
//   };

//   const handleClose = () => {
//     resetForm();
//     onClose();
//   };

//   const handleVendorAdded = (newVendor) => {
//     setVendors(prev => [...prev, newVendor]);
//     setFormData(prev => ({
//       ...prev,
//       vendor_ids: [...prev.vendor_ids, newVendor._id]
//     }));
//     setShowAddVendor(false);
//   };



//   const handleVendorApproved = (updatedVendor) => {
  
//     setVendors(prev => prev.map(v => 
//       v._id === updatedVendor._id ? updatedVendor : v
//     ));
    
//     setFormData(prev => ({
//       ...prev,
//       vendor_ids: prev.vendor_ids 
//     }));
    
//     setShowApproveVendor(false);
//     setSelectedVendorForApproval(null);
    
//     setError(''); 
//   };

//   const handleOpenApproveVendor = (vendor) => {
//     setSelectedVendorForApproval(vendor);
//     setShowApproveVendor(true);
//   };

//   const today = new Date().toISOString().split('T')[0];
//   const selectedVendorObjects = vendors.filter(v => formData.vendor_ids.includes(v._id));

//   const getVendorAvlStatus = (vendor) => {
//     if (vendor.avl_approved) {
//       return { text: 'AVL Approved', color: COLORS.success, icon: <VerifiedIcon sx={{ fontSize: 12 }} /> };
//     }
//     return { text: 'Not AVL Approved', color: COLORS.warning, icon: <WarningIcon sx={{ fontSize: 12 }} /> };
//   };

//   const renderStepContent = (step) => {
//     switch (step) {
//       case 0:
//         return (
//           <Stack spacing={2}>
//             <Paper sx={{ p: 2, bgcolor: COLORS.background.white, borderRadius: 1.5, border: `1px solid ${COLORS.border}` }}>
//               <Typography variant="subtitle2" sx={{ color: COLORS.primary, mb: 1.5, fontWeight: 600, fontSize: '0.9rem' }}>
//                 Basic Information
//               </Typography>
              
//               <Grid container spacing={1.5}>
//                 <Grid size={{ xs: 12 }}>
//                   <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//                     <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary }}>
//                       PURCHASE REQUISITION <span style={{ color: '#EF4444' }}>*</span>
//                     </Typography>
//                     <Autocomplete
//                       options={pendingPRs}
//                       loading={loadingPRs}
//                       value={selectedPR}
//                       onChange={handlePRChange}
//                       // getOptionLabel={(opt) => {
//                       //   const deptName = getDepartmentName(opt.department);
//                       //   return `${opt.pr_number} - ${deptName} (${opt.items?.length || 0} items) - ₹${opt.total_estimated_value?.toLocaleString() || 0}`;
//                       // }}
//                       getOptionLabel={(opt) => `${opt.pr_number} (${opt.items?.length || 0} items) - ₹${opt.total_estimated_value?.toLocaleString() || 0}`}
//                       renderInput={(params) => (
//                         <TextField 
//                           {...params} 
//                           size="small" 
//                           placeholder="Select purchase requisition..." 
//                           error={!!fieldErrors.pr_id} 
//                           helperText={fieldErrors.pr_id}
//                           sx={{
//                             '& .MuiOutlinedInput-root': {
//                               borderRadius: 1.5,
//                               fontSize: '0.75rem',
//                               '&:hover fieldset': { borderColor: COLORS.primary },
//                               '&.Mui-focused fieldset': { borderColor: COLORS.primary, borderWidth: 1 }
//                             },
//                             '& .MuiInputBase-input': { py: 1, px: 1.5, fontSize: '0.75rem' },
//                             '& .MuiFormHelperText-root': { fontSize: '0.65rem', marginLeft: 0 }
//                           }}
//                         />
//                       )}
//                      renderOption={(props, opt) => {
//   return (
//     <li {...props}>
//       <Box>
//         <Typography variant="body2" fontWeight={500} sx={{ fontSize: '0.75rem' }}>{opt.pr_number}</Typography>
//         <Typography variant="caption" sx={{ fontSize: '0.65rem', color: COLORS.text.tertiary }}>
//           {opt.items?.length} items | ₹{opt.total_estimated_value?.toLocaleString()}
//         </Typography>
//       </Box>
//     </li>
//   );
// }}
//                     />
//                   </Box>
//                 </Grid>
//                 <Grid size={{ xs: 12 }}>
//                   <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//                     <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary }}>
//                       VALID TILL <span style={{ color: '#EF4444' }}>*</span>
//                     </Typography>
//                     <TextField
//                       fullWidth
//                       size="small"
//                       type="date"
//                       name="valid_till"
//                       value={formData.valid_till}
//                       onChange={handleChange}
//                       error={!!fieldErrors.valid_till}
//                       helperText={fieldErrors.valid_till}
//                       InputLabelProps={{ shrink: true }}
//                       inputProps={{ min: today }}
//                       sx={{
//                         '& .MuiOutlinedInput-root': {
//                           borderRadius: 1.5,
//                           fontSize: '0.75rem',
//                           '&:hover fieldset': { borderColor: COLORS.primary },
//                           '&.Mui-focused fieldset': { borderColor: COLORS.primary, borderWidth: 1 }
//                         },
//                         '& .MuiInputBase-input': { py: 1, px: 1.5, fontSize: '0.75rem' },
//                         '& .MuiFormHelperText-root': { fontSize: '0.65rem', marginLeft: 0 }
//                       }}
//                     />
//                   </Box>
//                 </Grid>
//               </Grid>
//             </Paper>
//           </Stack>
//         );
      
//       case 1:
//         return (
//           <Stack spacing={2}>
//             {selectedPR && selectedPR.items && selectedPR.items.length > 0 && (
//               <Paper sx={{ p: 2, bgcolor: COLORS.background.white, borderRadius: 1.5, border: `1px solid ${COLORS.border}` }}>
//                 <Typography variant="subtitle2" sx={{ color: COLORS.primary, mb: 1.5, fontWeight: 600, fontSize: '0.9rem' }}>
//                   Items
//                 </Typography>
//                 <TableContainer>
//                   <Table size="small">
//                     <TableHead>
//                       <TableRow sx={{ bgcolor: COLORS.background.light }}>
//                         <TableCell sx={{ fontSize: '0.7rem', fontWeight: 600 }}>Part No</TableCell>
//                         <TableCell sx={{ fontSize: '0.7rem', fontWeight: 600 }}>Description</TableCell>
//                         <TableCell sx={{ fontSize: '0.7rem', fontWeight: 600 }} align="center">Qty</TableCell>
//                         <TableCell sx={{ fontSize: '0.7rem', fontWeight: 600 }} align="right">Unit</TableCell>
//                       </TableRow>
//                     </TableHead>
//                     <TableBody>
//                       {selectedPR.items.map((item, idx) => (
//                         <TableRow key={idx}>
//                           <TableCell sx={{ fontSize: '0.75rem' }}>{item.part_no}</TableCell>
//                           <TableCell sx={{ fontSize: '0.75rem' }}>{item.description}</TableCell>
//                           <TableCell sx={{ fontSize: '0.75rem' }} align="center">{item.required_qty}</TableCell>
//                           <TableCell sx={{ fontSize: '0.75rem' }} align="right">{item.unit}</TableCell>
//                         </TableRow>
//                       ))}
//                     </TableBody>
//                   </Table>
//                 </TableContainer>
//               </Paper>
//             )}

//             <Paper sx={{ p: 2, bgcolor: COLORS.background.white, borderRadius: 1.5, border: `1px solid ${COLORS.border}` }}>
//               <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
//                 <Typography variant="subtitle2" sx={{ color: COLORS.primary, fontWeight: 600, fontSize: '0.9rem' }}>
//                   Select Vendors
//                 </Typography>
//                 <Button
//                   size="small"
//                   startIcon={<AddCircleIcon sx={{ fontSize: '1rem' }} />}
//                   onClick={() => setShowAddVendor(true)}
//                   sx={{
//                     textTransform: 'none',
//                     fontSize: '0.7rem',
//                     color: COLORS.primary,
//                     '&:hover': { bgcolor: `${COLORS.primary}10` }
//                   }}
//                 >
//                   Add New Vendor
//                 </Button>
//               </Box>
              
//               <Autocomplete
//                 multiple
//                 options={vendors}
//                 loading={loadingVendors}
//                 value={selectedVendorObjects}
//                 onChange={handleVendorSelect}
//                 getOptionLabel={(opt) => `${opt.vendor_code} - ${opt.vendor_name}`}
//                 renderInput={(params) => (
//                   <TextField 
//                     {...params} 
//                     size="small" 
//                     placeholder="Select vendors..." 
//                     error={!!fieldErrors.vendor_ids} 
//                     helperText={fieldErrors.vendor_ids}
//                     sx={{
//                       '& .MuiOutlinedInput-root': {
//                         borderRadius: 1.5,
//                         fontSize: '0.75rem',
//                         '&:hover fieldset': { borderColor: COLORS.primary },
//                         '&.Mui-focused fieldset': { borderColor: COLORS.primary, borderWidth: 1 }
//                       },
//                       '& .MuiInputBase-input': { py: 1, px: 1.5, fontSize: '0.75rem' },
//                       '& .MuiFormHelperText-root': { fontSize: '0.65rem', marginLeft: 0 }
//                     }}
//                   />
//                 )}
//                 renderTags={(value, getTagProps) =>
//                   value.map((option, index) => {
//                     const avlStatus = getVendorAvlStatus(option);
//                     return (
//                       <Tooltip key={option._id} title={avlStatus.text}>
//                         <Chip
//                           label={`${option.vendor_code} - ${option.vendor_name}`}
//                           size="small"
//                           {...getTagProps({ index })}
//                           onClick={() => handleOpenApproveVendor(option)}
//                           sx={{ 
//                             fontSize: '0.7rem', 
//                             height: 24, 
//                             bgcolor: option.avl_approved ? COLORS.success + '20' : COLORS.warning + '20',
//                             color: option.avl_approved ? COLORS.success : COLORS.warning,
//                             border: `1px solid ${option.avl_approved ? COLORS.success : COLORS.warning}`,
//                             cursor: 'pointer',
//                             '& .MuiChip-label': { px: 1, display: 'flex', alignItems: 'center', gap: 0.5 },
//                             '&:hover': {
//                               opacity: 0.8,
//                               transform: 'scale(1.02)',
//                               transition: 'all 0.2s ease'
//                             }
//                           }}
//                           icon={avlStatus.icon}
//                         />
//                       </Tooltip>
//                     );
//                   })
//                 }
//                 renderOption={(props, option) => {
//                   const avlStatus = getVendorAvlStatus(option);
//                   return (
//                     <li {...props}>
//                       <Box sx={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
//                         <Box>
//                           <Typography variant="body2" fontWeight={500} sx={{ fontSize: '0.75rem' }}>
//                             {option.vendor_name}
//                           </Typography>
//                           <Typography variant="caption" sx={{ fontSize: '0.65rem', color: COLORS.text.tertiary }}>
//                             Code: {option.vendor_code} | GST: {option.gstin || 'N/A'}
//                           </Typography>
//                         </Box>
//                         <Chip
//                           label={avlStatus.text}
//                           size="small"
//                           icon={avlStatus.icon}
//                           onClick={() => {
//                             props.onClick?.(props);
//                             handleOpenApproveVendor(option);
//                           }}
//                           sx={{
//                             fontSize: '0.6rem',
//                             height: 20,
//                             bgcolor: avlStatus.color + '20',
//                             color: avlStatus.color,
//                             cursor: 'pointer',
//                             '& .MuiChip-label': { fontSize: '0.6rem', px: 1 },
//                             '&:hover': {
//                               opacity: 0.8
//                             }
//                           }}
//                         />
//                       </Box>
//                     </li>
//                   );
//                 }}
//                 ListboxProps={{
//                   sx: {
//                     '& .MuiAutocomplete-option': {
//                       fontSize: '0.75rem',
//                       py: 1,
//                       px: 1.5
//                     }
//                   }
//                 }}
//               />

//               {/* Warning message if selected vendor is not AVL approved */}
//               {selectedVendorObjects.some(v => !v.avl_approved) && (
//                 <Alert 
//                   severity="warning" 
//                   sx={{ 
//                     mt: 1.5, 
//                     borderRadius: 1.5,
//                     fontSize: '0.7rem',
//                     py: 0.5
//                   }}
//                 >
//                   <Typography variant="caption" sx={{ fontSize: '0.7rem' }}>
//                     ⚠️ Some selected vendors are not AVL approved. Click on the vendor chip to approve them.
//                   </Typography>
//                 </Alert>
//               )}
//             </Paper>
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
//         onClose={handleClose}
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
//           bgcolor: COLORS.background.white,
//           display: 'flex',
//           flexDirection: 'column',
//           gap: 1
//         }}>
//           <Typography sx={{ fontSize: '1.2rem', fontWeight: 700, color: COLORS.text.primary }}>
//             Create Request for Quotation
//           </Typography>

//           <Stepper
//             activeStep={activeStep}
//             alternativeLabel
//             connector={<ColorConnector />}
//             sx={{ mb: 0.5, mt: 0.5 }}
//           >
//             {steps.map((label) => (
//               <Step key={label}>
//                 <StepLabel StepIconComponent={CustomStepIcon}>
//                   <Typography fontWeight={500} fontSize="0.8rem" color={COLORS.text.secondary}>
//                     {label}
//                   </Typography>
//                 </StepLabel>
//               </Step>
//             ))}
//           </Stepper>
//         </DialogTitle>

//         <DialogContent sx={{ p: 2.5, overflow: 'auto' }}>
//           {renderStepContent(activeStep)}

//           {error && (
//             <Alert 
//               severity="error" 
//               sx={{ 
//                 mt: 2, 
//                 borderRadius: 1.5,
//                 '& .MuiAlert-icon': { fontSize: '1.25rem', alignItems: 'center' },
//                 fontSize: '0.75rem',
//                 py: 0.5
//               }}
//             >
//               {error}
//             </Alert>
//           )}
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
//             onClick={handleBack}
//             disabled={activeStep === 0 || loading}
//             startIcon={<NavigateBeforeIcon sx={{ fontSize: '1rem' }} />}
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
//             Back
//           </Button>
//           <Box sx={{ display: 'flex', gap: 1 }}>
//             <Button
//               onClick={handleClose}
//               disabled={loading}
//               startIcon={<CloseIcon sx={{ fontSize: '1rem' }} />}
//               sx={{
//                 height: 32,
//                 px: 2,
//                 borderRadius: 1.5,
//                 border: `1px solid ${COLORS.border}`,
//                 color: COLORS.text.secondary,
//                 fontSize: '0.7rem',
//                 fontWeight: 500,
//                 textTransform: 'none',
//                 '&:hover': {
//                   borderColor: COLORS.primary,
//                   bgcolor: `${COLORS.primary}10`
//                 }
//               }}
//             >
//               Cancel
//             </Button>
//             {activeStep === steps.length - 1 ? (
//               <Button
//                 variant="contained"
//                 onClick={handleSubmit}
//                 disabled={loading || !formData.pr_id || !formData.valid_till || formData.vendor_ids.length === 0}
//                 startIcon={loading ? null : <AddIcon sx={{ fontSize: '1rem' }} />}
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
//                 {loading ? 'Creating...' : 'Create RFQ'}
//               </Button>
//             ) : (
//               <Button
//                 variant="contained"
//                 onClick={handleNext}
//                 disabled={loading}
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

//       {/* Add Vendor Dialog */}
//       <AddVendor 
//         open={showAddVendor}
//         onClose={() => setShowAddVendor(false)}
//         onAdd={handleVendorAdded}
//       />

//       {/* Approve Vendor Dialog */}
//       <ApproveVendor
//         open={showApproveVendor}
//         onClose={() => {
//           setShowApproveVendor(false);
//           setSelectedVendorForApproval(null);
//         }}
//         vendor={selectedVendorForApproval}
//         onApprove={handleVendorApproved}
//       />
//     </>
//   );
// };

// export default AddRFQ;


import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Grid,
  TextField,
  Typography,
  Button,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Autocomplete,
  Chip,
  Stepper,
  Step,
  StepLabel,
  StepConnector,
  stepConnectorClasses,
  styled,
  CircularProgress,
  Link,
  Tooltip,
  IconButton,
  Divider,
  Collapse,
  FormControl,
  Select,
  MenuItem,
  InputAdornment
} from '@mui/material';
import { 
  Add as AddIcon,
  Close as CloseIcon,
  NavigateNext as NavigateNextIcon,
  NavigateBefore as NavigateBeforeIcon,
  AddCircle as AddCircleIcon,
  Verified as VerifiedIcon,
  Warning as WarningIcon,
  Edit as EditIcon,
  Search as SearchIcon
} from '@mui/icons-material';
import axios from 'axios';
import BASE_URL from '../../../config/Config';
// Remove AddVendor and ApproveVendor imports - we'll use inline forms instead

const COLORS = {
  primary: '#063C3F',
  primaryLight: '#E8F0F1',
  primaryDark: '#05292B',
  primaryBlue: '#00B4D8',
  text: { primary: '#151C26', secondary: '#4B5568', tertiary: '#94A3B8' },
  background: { white: '#FFFFFF', light: '#F8FFFC', hover: '#F0FDF9' },
  border: '#E3E8EF',
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444'
};

const HEADER_GRADIENT = 'linear-gradient(135deg, #063C3F 0%, #00B4D8 50%, #05292B 100%)';
const PRIMARY_DARK = '#063C3F';
const PRIMARY_BLUE = '#00B4D8';

// Modern Stepper Connector with Gradient
const ColorConnector = styled(StepConnector)(({ theme }) => ({
  [`&.${stepConnectorClasses.active}`]: {
    [`& .${stepConnectorClasses.line}`]: {
      backgroundImage: HEADER_GRADIENT,
    },
  },
  [`&.${stepConnectorClasses.completed}`]: {
    [`& .${stepConnectorClasses.line}`]: {
      backgroundImage: HEADER_GRADIENT,
    },
  },
  [`& .${stepConnectorClasses.line}`]: {
    height: 2,
    border: 0,
    backgroundColor: '#eaeaf0',
    borderRadius: 1,
  },
}));

// Custom Step Icon styling
const CustomStepIconRoot = styled('div')(({ theme, ownerState }) => ({
  backgroundColor: ownerState.active || ownerState.completed ? PRIMARY_BLUE : '#ccc',
  zIndex: 1,
  color: '#fff',
  width: 24,
  height: 24,
  display: 'flex',
  borderRadius: '50%',
  justifyContent: 'center',
  alignItems: 'center',
  fontSize: '0.75rem',
  fontWeight: 600,
  ...(ownerState.active && {
    backgroundColor: PRIMARY_BLUE,
    boxShadow: '0 4px 10px 0 rgba(0,180,216,0.3)',
  }),
  ...(ownerState.completed && {
    backgroundColor: PRIMARY_BLUE,
  }),
}));

function CustomStepIcon(props) {
  const { active, completed, className } = props;
  return (
    <CustomStepIconRoot ownerState={{ active, completed }} className={className}>
      {completed ? '✓' : props.icon}
    </CustomStepIconRoot>
  );
}

const steps = ['Basic Info', 'Items & Vendors'];

// Helper function to safely get department name
const getDepartmentName = (department) => {
  if (!department) return 'N/A';
  if (typeof department === 'string') return department;
  if (typeof department === 'object') {
    return department.DepartmentName || department.name || 'N/A';
  }
  return 'N/A';
};

// Custom styled Paper for dropdowns
const CustomPaper = styled(Paper)({
  maxHeight: 200,
  overflow: 'auto',
  '&::-webkit-scrollbar': {
    display: 'none'
  },
  scrollbarWidth: 'none',
  '-ms-overflow-style': 'none'
});

const AddRFQ = ({ open, onClose, onAdd }) => {
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [pendingPRs, setPendingPRs] = useState([]);
  const [loadingPRs, setLoadingPRs] = useState(false);
  const [vendors, setVendors] = useState([]);
  const [loadingVendors, setLoadingVendors] = useState(false);
  
  // State for inline Add PR form
  const [showPRForm, setShowPRForm] = useState(false);
  const [prFormData, setPrFormData] = useState({
    pr_type: 'Material',
    source: 'Manual',
    department: '',
    required_date: '',
    items: [{
      item_id: '',
      required_qty: '',
      estimated_price: '',
      remarks: ''
    }]
  });
  const [prFieldErrors, setPrFieldErrors] = useState({});
  const [prTouched, setPrTouched] = useState({});
  const [prLoading, setPrLoading] = useState(false);
  const [prError, setPrError] = useState('');
  const [departments, setDepartments] = useState([]);
  const [loadingDepartments, setLoadingDepartments] = useState(false);
  const [items, setItems] = useState([]);
  const [loadingItems, setLoadingItems] = useState(false);
  const [prItems, setPrItems] = useState([{
    item_id: '',
    required_qty: '',
    estimated_price: '',
    remarks: ''
  }]);

  // State for inline Add Vendor form
  const [showVendorForm, setShowVendorForm] = useState(false);
  const [vendorFormData, setVendorFormData] = useState({
    vendor_code: '',
    vendor_name: '',
    vendor_type: '',
    contact_person: '',
    email: '',
    phone: '',
    address: '',
    gstin: '',
    pan: '',
    website: '',
    bank_name: '',
    bank_account_number: '',
    bank_ifsc: '',
    payment_terms: 'Net 30',
    currency: 'INR',
    preferred: false,
    avl_approved: false
  });
  const [vendorFieldErrors, setVendorFieldErrors] = useState({});
  const [vendorTouched, setVendorTouched] = useState({});
  const [vendorLoading, setVendorLoading] = useState(false);
  const [vendorError, setVendorError] = useState('');

  // State for Approve Vendor inline form
  const [showApproveVendorForm, setShowApproveVendorForm] = useState(false);
  const [selectedVendorForApproval, setSelectedVendorForApproval] = useState(null);
  const [approveVendorLoading, setApproveVendorLoading] = useState(false);
  const [approveVendorError, setApproveVendorError] = useState('');

  const [formData, setFormData] = useState({
    pr_id: '',
    valid_till: '',
    vendor_ids: []
  });

  const [selectedPR, setSelectedPR] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});

  // PR Types
  const prTypes = [
    { value: 'Material', label: 'Material' },
    { value: 'Service', label: 'Service' },
    { value: 'Capital', label: 'Capital' },
    { value: 'Subcontract', label: 'Subcontract' }
  ];

  const sources = [
    { value: 'MRP Auto', label: 'MRP Auto' },
    { value: 'Manual', label: 'Manual' },
    { value: 'Reorder Alert', label: 'Reorder Alert' },
    { value: 'Indent', label: 'Indent' }
  ];

  // Vendor Types
  const vendorTypes = ['Manufacturer', 'Distributor', 'Supplier', 'Contractor', 'Service Provider', 'Consultant'];

  useEffect(() => {
    if (open) {
      fetchPendingPRs();
      fetchVendors();
      fetchDepartments();
      fetchItems();
    }
  }, [open]);

  const fetchPendingPRs = async () => {
    try {
      setLoadingPRs(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(`${BASE_URL}/api/purchase-requisitions/pending-rfq`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.data.success) {
        setPendingPRs(response.data.data || []);
      }
    } catch (err) {
      console.error('Error fetching pending PRs:', err);
      setError(err.response?.data?.message || 'Failed to fetch pending PRs');
    } finally {
      setLoadingPRs(false);
    }
  };

  const fetchVendors = async () => {
    try {
      setLoadingVendors(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(`${BASE_URL}/api/vendors`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.data.success) {
        setVendors(response.data.data || []);
      }
    } catch (err) {
      console.error('Error fetching vendors:', err);
    } finally {
      setLoadingVendors(false);
    }
  };

  const fetchDepartments = async () => {
    try {
      setLoadingDepartments(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(`${BASE_URL}/api/departments`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.data.success) {
        setDepartments(response.data.data || []);
      }
    } catch (err) {
      console.error('Error fetching departments:', err);
    } finally {
      setLoadingDepartments(false);
    }
  };

  const fetchItems = async () => {
    try {
      setLoadingItems(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(`${BASE_URL}/api/items`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.data.success) {
        setItems(response.data.data || []);
      }
    } catch (err) {
      console.error('Error fetching items:', err);
    } finally {
      setLoadingItems(false);
    }
  };

  // ======================== PR FORM HANDLERS ========================

  const handlePRFormChange = (e) => {
    const { name, value } = e.target;
    setPrFieldErrors(prev => ({ ...prev, [name]: '' }));
    setPrFormData(prev => ({ ...prev, [name]: value }));

    if (prTouched[name] || value) {
      const errorMessage = validatePRField(name, value);
      setPrFieldErrors(prev => ({ ...prev, [name]: errorMessage }));
    }
  };

  const handlePRFormSelectChange = (e) => {
    const { name, value } = e.target;
    setPrFieldErrors(prev => ({ ...prev, [name]: '' }));
    setPrFormData(prev => ({ ...prev, [name]: value }));

    if (prTouched[name] || value) {
      const errorMessage = validatePRField(name, value);
      setPrFieldErrors(prev => ({ ...prev, [name]: errorMessage }));
    }
  };

  const handlePRBlur = (e) => {
    const { name, value } = e.target;
    setPrTouched(prev => ({ ...prev, [name]: true }));
    const errorMessage = validatePRField(name, value);
    setPrFieldErrors(prev => ({ ...prev, [name]: errorMessage }));
  };

  const handlePRItemChange = (index, field, value) => {
    const updatedItems = [...prItems];
    updatedItems[index] = { ...updatedItems[index], [field]: value };
    setPrItems(updatedItems);
    
    // Also update prFormData items
    setPrFormData(prev => ({
      ...prev,
      items: updatedItems
    }));
  };

  const addPRItem = () => {
    setPrItems([...prItems, {
      item_id: '',
      required_qty: '',
      estimated_price: '',
      remarks: ''
    }]);
  };

  const removePRItem = (index) => {
    if (prItems.length > 1) {
      const updatedItems = prItems.filter((_, i) => i !== index);
      setPrItems(updatedItems);
      setPrFormData(prev => ({
        ...prev,
        items: updatedItems
      }));
    }
  };

  const validatePRField = (name, value) => {
    switch (name) {
      case 'pr_type':
        if (!value) return 'PR type is required';
        return '';
      case 'source':
        if (!value) return 'Source is required';
        return '';
      case 'department':
        if (!value) return 'Department is required';
        return '';
      case 'required_date':
        if (!value) return 'Required date is required';
        return '';
      default:
        return '';
    }
  };

  const validatePRForm = () => {
    const errors = {};
    let isValid = true;

    const requiredFields = [
      { name: 'pr_type', label: 'PR type' },
      { name: 'source', label: 'Source' },
      { name: 'department', label: 'Department' },
      { name: 'required_date', label: 'Required date' }
    ];

    requiredFields.forEach(field => {
      const value = prFormData[field.name];
      if (!value || (typeof value === 'string' && !value.trim())) {
        errors[field.name] = `${field.label} is required`;
        isValid = false;
      }
    });

    // Validate items
    prItems.forEach((item, index) => {
      if (!item.item_id) {
        errors[`item_${index}_item_id`] = 'Item is required';
        isValid = false;
      }
      if (!item.required_qty || parseFloat(item.required_qty) <= 0) {
        errors[`item_${index}_required_qty`] = 'Quantity must be greater than 0';
        isValid = false;
      }
      if (!item.estimated_price || parseFloat(item.estimated_price) <= 0) {
        errors[`item_${index}_estimated_price`] = 'Price must be greater than 0';
        isValid = false;
      }
    });

    setPrFieldErrors(errors);
    if (!isValid) {
      setPrError('Please fix the errors above');
    }
    return isValid;
  };

  const savePR = async () => {
    if (!validatePRForm()) return;

    setPrLoading(true);
    setPrError('');

    try {
      const token = localStorage.getItem('token');
      const user = JSON.parse(localStorage.getItem('user') || '{}');

      const submissionData = {
        pr_type: prFormData.pr_type,
        source: prFormData.source,
        department: prFormData.department,
        required_by: prFormData.required_date,
        items: prItems.map(item => ({
          item_id: item.item_id,
          required_qty: parseFloat(item.required_qty),
          estimated_price: parseFloat(item.estimated_price),
          remarks: item.remarks
        })),
        requested_by: user._id,
        created_by: user._id,
        status: 'Submitted'
      };

      const response = await axios.post(`${BASE_URL}/api/purchase-requisitions`, submissionData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.data.success) {
        const newPR = response.data.data;
        setPendingPRs(prev => [...prev, newPR]);
        setSelectedPR(newPR);
        setFormData(prev => ({ ...prev, pr_id: newPR._id }));
        
        // Reset PR form
        setPrFormData({
          pr_type: 'Material',
          source: 'Manual',
          department: '',
          required_date: '',
          items: []
        });
        setPrItems([{
          item_id: '',
          required_qty: '',
          estimated_price: '',
          remarks: ''
        }]);
        setPrFieldErrors({});
        setPrTouched({});
        setPrError('');
        setShowPRForm(false);
      }
    } catch (err) {
      setPrError(err.response?.data?.message || 'Failed to create purchase requisition');
    } finally {
      setPrLoading(false);
    }
  };

  // ======================== VENDOR FORM HANDLERS ========================

  const handleVendorFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    const val = type === 'checkbox' ? checked : value;
    
    setVendorFieldErrors(prev => ({ ...prev, [name]: '' }));
    setVendorFormData(prev => ({ ...prev, [name]: val }));

    if (vendorTouched[name] || value) {
      const errorMessage = validateVendorField(name, val);
      setVendorFieldErrors(prev => ({ ...prev, [name]: errorMessage }));
    }
  };

  const handleVendorBlur = (e) => {
    const { name, value, type } = e.target;
    const val = type === 'checkbox' ? e.target.checked : value;
    setVendorTouched(prev => ({ ...prev, [name]: true }));
    const errorMessage = validateVendorField(name, val);
    setVendorFieldErrors(prev => ({ ...prev, [name]: errorMessage }));
  };

  const validateVendorField = (name, value) => {
    switch (name) {
      case 'vendor_code':
        if (!value?.trim()) return 'Vendor code is required';
        if (value.length > 20) return 'Vendor code should not exceed 20 characters';
        return '';
      case 'vendor_name':
        if (!value?.trim()) return 'Vendor name is required';
        if (value.length > 100) return 'Vendor name should not exceed 100 characters';
        return '';
      case 'vendor_type':
        if (!value) return 'Vendor type is required';
        return '';
      case 'email':
        if (value && !/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(value)) {
          return 'Please enter a valid email address';
        }
        return '';
      case 'phone':
        if (value && !/^[6-9]\d{9}$/.test(value.replace(/[\s\-]/g, ''))) {
          return 'Please enter a valid 10-digit mobile number';
        }
        return '';
      case 'gstin':
        if (value && !/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}[Z]{1}[0-9A-Z]{1}$/.test(value)) {
          return 'Please enter a valid GSTIN (e.g., 22AAAAA0000A1Z5)';
        }
        return '';
      case 'pan':
        if (value && !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(value)) {
          return 'PAN must be in format: ABCDE1234F';
        }
        return '';
      default:
        return '';
    }
  };

  const validateVendorForm = () => {
    const errors = {};
    let isValid = true;

    const requiredFields = [
      { name: 'vendor_code', label: 'Vendor code' },
      { name: 'vendor_name', label: 'Vendor name' },
      { name: 'vendor_type', label: 'Vendor type' }
    ];

    requiredFields.forEach(field => {
      const value = vendorFormData[field.name];
      if (!value || (typeof value === 'string' && !value.trim())) {
        errors[field.name] = `${field.label} is required`;
        isValid = false;
      }
    });

    // Validate email if provided
    if (vendorFormData.email) {
      const err = validateVendorField('email', vendorFormData.email);
      if (err) { errors.email = err; isValid = false; }
    }

    // Validate phone if provided
    if (vendorFormData.phone) {
      const err = validateVendorField('phone', vendorFormData.phone);
      if (err) { errors.phone = err; isValid = false; }
    }

    setVendorFieldErrors(errors);
    if (!isValid) {
      setVendorError('Please fix the errors above');
    }
    return isValid;
  };

  const saveVendor = async () => {
    if (!validateVendorForm()) return;

    setVendorLoading(true);
    setVendorError('');

    try {
      const token = localStorage.getItem('token');
      
      const requestBody = {
        vendor_code: vendorFormData.vendor_code,
        vendor_name: vendorFormData.vendor_name,
        vendor_type: vendorFormData.vendor_type,
        contact_person: vendorFormData.contact_person || undefined,
        email: vendorFormData.email || undefined,
        phone: vendorFormData.phone || undefined,
        address: vendorFormData.address || undefined,
        gstin: vendorFormData.gstin || undefined,
        pan: vendorFormData.pan || undefined,
        website: vendorFormData.website || undefined,
        bank_name: vendorFormData.bank_name || undefined,
        bank_account_number: vendorFormData.bank_account_number || undefined,
        bank_ifsc: vendorFormData.bank_ifsc || undefined,
        payment_terms: vendorFormData.payment_terms || 'Net 30',
        currency: vendorFormData.currency || 'INR',
        preferred: vendorFormData.preferred || false
      };

      // Remove undefined values
      Object.keys(requestBody).forEach(key => {
        if (requestBody[key] === undefined) {
          delete requestBody[key];
        }
      });

      const response = await axios.post(`${BASE_URL}/api/vendors`, requestBody, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.data.success) {
        const newVendor = response.data.data;
        setVendors(prev => [...prev, newVendor]);
        setFormData(prev => ({
          ...prev,
          vendor_ids: [...prev.vendor_ids, newVendor._id]
        }));
        
        // Reset vendor form
        setVendorFormData({
          vendor_code: '',
          vendor_name: '',
          vendor_type: '',
          contact_person: '',
          email: '',
          phone: '',
          address: '',
          gstin: '',
          pan: '',
          website: '',
          bank_name: '',
          bank_account_number: '',
          bank_ifsc: '',
          payment_terms: 'Net 30',
          currency: 'INR',
          preferred: false,
          avl_approved: false
        });
        setVendorFieldErrors({});
        setVendorTouched({});
        setVendorError('');
        setShowVendorForm(false);
      }
    } catch (err) {
      setVendorError(err.response?.data?.message || 'Failed to add vendor');
    } finally {
      setVendorLoading(false);
    }
  };

  // ======================== APPROVE VENDOR HANDLERS ========================

  const handleOpenApproveVendor = (vendor) => {
    setSelectedVendorForApproval(vendor);
    setShowApproveVendorForm(true);
  };

  const approveVendor = async () => {
    if (!selectedVendorForApproval) return;

    setApproveVendorLoading(true);
    setApproveVendorError('');

    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(
        `${BASE_URL}/api/vendors/${selectedVendorForApproval._id}/approve-avl`,
        {},
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.success) {
        const updatedVendor = response.data.data;
        setVendors(prev => prev.map(v => 
          v._id === updatedVendor._id ? updatedVendor : v
        ));
        
        setShowApproveVendorForm(false);
        setSelectedVendorForApproval(null);
        setApproveVendorError('');
      }
    } catch (err) {
      setApproveVendorError(err.response?.data?.message || 'Failed to approve vendor');
    } finally {
      setApproveVendorLoading(false);
    }
  };

  const handlePRChange = (event, value) => {
    setSelectedPR(value);
    setFormData(prev => ({ ...prev, pr_id: value?._id || '' }));
    setFieldErrors(prev => ({ ...prev, pr_id: '' }));
  };

  const handleVendorSelect = (event, newValue) => {
    setFormData(prev => ({ ...prev, vendor_ids: newValue.map(v => v._id) }));
    setFieldErrors(prev => ({ ...prev, vendor_ids: '' }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFieldErrors(prev => ({ ...prev, [name]: '' }));
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const validateStep = (step) => {
    const errors = {};
    let isValid = true;

    switch (step) {
      case 0:
        if (!formData.pr_id) {
          errors.pr_id = 'Purchase requisition is required';
          isValid = false;
        }
        if (!formData.valid_till) {
          errors.valid_till = 'Valid till date is required';
          isValid = false;
        }
        break;
      case 1:
        if (formData.vendor_ids.length === 0) {
          errors.vendor_ids = 'At least one vendor is required';
          isValid = false;
        }
        break;
      default:
        break;
    }

    setFieldErrors(errors);
    if (!isValid) {
      setError('Please fill all required fields');
    }
    return isValid;
  };

  const handleNext = () => {
    if (validateStep(activeStep)) {
      setError('');
      setActiveStep((prevStep) => prevStep + 1);
    }
  };

  const handleBack = () => {
    setError('');
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handleSubmit = async () => {
    if (formData.vendor_ids.length === 0) {
      setError('At least one vendor is required');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      
      const submissionData = {
        pr_id: formData.pr_id,
        valid_till: formData.valid_till,
        vendor_ids: formData.vendor_ids,
        created_by: user._id
      };

      const response = await axios.post(`${BASE_URL}/api/rfqs`, submissionData, {
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
      });

      if (response.data.success) {
        onAdd(response.data.data);
        resetForm();
        onClose();
      } else {
        setError(response.data.message || 'Failed to create RFQ');
      }
    } catch (err) {
      console.error('Error creating RFQ:', err);
      setError(err.response?.data?.message || 'Failed to create RFQ');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({ pr_id: '', valid_till: '', vendor_ids: [] });
    setSelectedPR(null);
    setFieldErrors({});
    setError('');
    setActiveStep(0);
    setShowPRForm(false);
    setShowVendorForm(false);
    setShowApproveVendorForm(false);
    setSelectedVendorForApproval(null);
    setPrFormData({
      pr_type: 'Material',
      source: 'Manual',
      department: '',
      required_date: '',
      items: []
    });
    setPrItems([{
      item_id: '',
      required_qty: '',
      estimated_price: '',
      remarks: ''
    }]);
    setPrFieldErrors({});
    setPrTouched({});
    setPrError('');
    setVendorFormData({
      vendor_code: '',
      vendor_name: '',
      vendor_type: '',
      contact_person: '',
      email: '',
      phone: '',
      address: '',
      gstin: '',
      pan: '',
      website: '',
      bank_name: '',
      bank_account_number: '',
      bank_ifsc: '',
      payment_terms: 'Net 30',
      currency: 'INR',
      preferred: false,
      avl_approved: false
    });
    setVendorFieldErrors({});
    setVendorTouched({});
    setVendorError('');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const today = new Date().toISOString().split('T')[0];
  const selectedVendorObjects = vendors.filter(v => formData.vendor_ids.includes(v._id));

  const getVendorAvlStatus = (vendor) => {
    if (vendor.avl_approved) {
      return { text: 'AVL Approved', color: COLORS.success, icon: <VerifiedIcon sx={{ fontSize: 12 }} /> };
    }
    return { text: 'Not AVL Approved', color: COLORS.warning, icon: <WarningIcon sx={{ fontSize: 12 }} /> };
  };

  // Shared styles
  const textFieldSx = {
    '& .MuiOutlinedInput-root': {
      borderRadius: 1.5,
      fontSize: '0.75rem',
      '&:hover fieldset': { borderColor: COLORS.primary },
      '&.Mui-focused fieldset': { borderColor: COLORS.primary, borderWidth: 1 }
    },
    '& .MuiInputBase-input': { py: 1, px: 1.5, fontSize: '0.75rem' },
    '& .MuiFormHelperText-root': { fontSize: '0.65rem', marginLeft: 0 }
  };

  const numberFieldSx = {
    ...textFieldSx,
    '& input[type=number]': { MozAppearance: 'textfield' },
    '& input[type=number]::-webkit-outer-spin-button, & input[type=number]::-webkit-inner-spin-button': {
      WebkitAppearance: 'none', margin: 0
    }
  };

  const selectSx = {
    borderRadius: 1.5,
    fontSize: '0.75rem',
    '& .MuiSelect-select': { py: 1, px: 1.5, fontSize: '0.75rem' }
  };

  const cancelButtonSx = {
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
  };

  const addButtonSx = {
    height: 32,
    px: 2,
    borderRadius: 1.5,
    bgcolor: COLORS.primary,
    fontSize: '0.7rem',
    fontWeight: 500,
    textTransform: 'none',
    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
    '&:hover': { bgcolor: COLORS.primaryDark },
    '&:disabled': { bgcolor: COLORS.border, color: COLORS.text.tertiary }
  };

  const actionButtonSx = {
    height: 40,
    minWidth: 'auto',
    px: 1.5,
    borderRadius: 1.5,
    border: `1px solid ${COLORS.border}`,
    color: COLORS.text.secondary,
    fontSize: '0.7rem',
    fontWeight: 500,
    textTransform: 'none',
    whiteSpace: 'nowrap',
    alignSelf: 'flex-end',
    '&:hover': {
      borderColor: COLORS.primary,
      bgcolor: `${COLORS.primary}10`,
      color: COLORS.primary
    }
  };

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Stack spacing={2}>
            <Paper sx={{ p: 2, bgcolor: COLORS.background.white, borderRadius: 1.5, border: `1px solid ${COLORS.border}` }}>
              <Typography variant="subtitle2" sx={{ color: COLORS.primary, mb: 1.5, fontWeight: 600, fontSize: '0.9rem' }}>
                Basic Information
              </Typography>
              
              <Grid container spacing={1.5}>
                <Grid size={{ xs: 12 }}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                    <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary }}>
                      PURCHASE REQUISITION <span style={{ color: '#EF4444' }}>*</span>
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
                      <Box sx={{ flex: 1 }}>
                        <Autocomplete
                          options={pendingPRs}
                          loading={loadingPRs}
                          value={selectedPR}
                          onChange={handlePRChange}
                          getOptionLabel={(opt) => `${opt.pr_number} (${opt.items?.length || 0} items) - ₹${opt.total_estimated_value?.toLocaleString() || 0}`}
                          renderInput={(params) => (
                            <TextField 
                              {...params} 
                              size="small" 
                              placeholder="Select purchase requisition..." 
                              error={!!fieldErrors.pr_id} 
                              helperText={fieldErrors.pr_id}
                              sx={{
                                '& .MuiOutlinedInput-root': {
                                  borderRadius: 1.5,
                                  fontSize: '0.75rem',
                                  '&:hover fieldset': { borderColor: COLORS.primary },
                                  '&.Mui-focused fieldset': { borderColor: COLORS.primary, borderWidth: 1 }
                                },
                                '& .MuiInputBase-input': { py: 1, px: 1.5, fontSize: '0.75rem' },
                                '& .MuiFormHelperText-root': { fontSize: '0.65rem', marginLeft: 0 }
                              }}
                            />
                          )}
                          renderOption={(props, opt) => {
                            return (
                              <li {...props}>
                                <Box>
                                  <Typography variant="body2" fontWeight={500} sx={{ fontSize: '0.75rem' }}>{opt.pr_number}</Typography>
                                  <Typography variant="caption" sx={{ fontSize: '0.65rem', color: COLORS.text.tertiary }}>
                                    {opt.items?.length} items | ₹{opt.total_estimated_value?.toLocaleString()}
                                  </Typography>
                                </Box>
                              </li>
                            );
                          }}
                        />
                      </Box>
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => setShowPRForm(!showPRForm)}
                        startIcon={showPRForm ? <CloseIcon sx={{ fontSize: '0.875rem' }} /> : <AddIcon sx={{ fontSize: '0.875rem' }} />}
                        sx={{
                          height: 40,
                          minWidth: 'auto',
                          px: 1.5,
                          borderRadius: 1.5,
                          border: `1px solid ${COLORS.border}`,
                          color: COLORS.text.secondary,
                          fontSize: '0.7rem',
                          fontWeight: 500,
                          textTransform: 'none',
                          whiteSpace: 'nowrap',
                          alignSelf: 'flex-end',
                          '&:hover': {
                            borderColor: COLORS.primary,
                            bgcolor: `${COLORS.primary}10`,
                            color: COLORS.primary
                          }
                        }}
                      >
                        {showPRForm ? 'Cancel' : 'Add New'}
                      </Button>
                    </Box>
                  </Box>
                </Grid>

                {/* Inline Add PR Form */}
                <Grid size={{ xs: 12 }}>
                  <Collapse in={showPRForm}>
                    <Box sx={{ mt: 1, p: 2.5, bgcolor: COLORS.background.light, borderRadius: 2, border: `1px solid ${COLORS.primary}` }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color: COLORS.primary }}>
                          Add New Purchase Requisition
                        </Typography>
                        <IconButton
                          size="small"
                          onClick={() => {
                            setShowPRForm(false);
                            setPrError('');
                            setPrFormData({
                              pr_type: 'Material',
                              source: 'Manual',
                              department: '',
                              required_date: '',
                              items: []
                            });
                            setPrItems([{
                              item_id: '',
                              required_qty: '',
                              estimated_price: '',
                              remarks: ''
                            }]);
                            setPrFieldErrors({});
                            setPrTouched({});
                          }}
                          sx={{ color: COLORS.text.tertiary, '&:hover': { color: COLORS.primary } }}
                        >
                          <CloseIcon sx={{ fontSize: '1rem' }} />
                        </IconButton>
                      </Box>

                      <Grid container spacing={1.5}>
                        <Grid size={{ xs: 12, md: 4 }}>
                          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                            <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary, letterSpacing: '0.5px' }}>
                              PR TYPE <span style={{ color: '#EF4444' }}>*</span>
                            </Typography>
                            <FormControl fullWidth size="small" error={!!prFieldErrors.pr_type}>
                              <Select
                                name="pr_type"
                                value={prFormData.pr_type}
                                onChange={handlePRFormSelectChange}
                                onBlur={handlePRBlur}
                                disabled={prLoading}
                                displayEmpty
                                sx={selectSx}
                              >
                                <MenuItem value="" disabled sx={{ fontSize: '0.75rem' }}>Select PR type</MenuItem>
                                {prTypes.map((type) => (
                                  <MenuItem key={type.value} value={type.value} sx={{ fontSize: '0.75rem' }}>
                                    {type.label}
                                  </MenuItem>
                                ))}
                              </Select>
                              {prFieldErrors.pr_type && (
                                <Typography sx={{ fontSize: '0.65rem', color: '#EF4444', mt: 0.25 }}>
                                  {prFieldErrors.pr_type}
                                </Typography>
                              )}
                            </FormControl>
                          </Box>
                        </Grid>

                        <Grid size={{ xs: 12, md: 4 }}>
                          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                            <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary, letterSpacing: '0.5px' }}>
                              SOURCE <span style={{ color: '#EF4444' }}>*</span>
                            </Typography>
                            <FormControl fullWidth size="small" error={!!prFieldErrors.source}>
                              <Select
                                name="source"
                                value={prFormData.source}
                                onChange={handlePRFormSelectChange}
                                onBlur={handlePRBlur}
                                disabled={prLoading}
                                displayEmpty
                                sx={selectSx}
                              >
                                <MenuItem value="" disabled sx={{ fontSize: '0.75rem' }}>Select source</MenuItem>
                                {sources.map((src) => (
                                  <MenuItem key={src.value} value={src.value} sx={{ fontSize: '0.75rem' }}>
                                    {src.label}
                                  </MenuItem>
                                ))}
                              </Select>
                              {prFieldErrors.source && (
                                <Typography sx={{ fontSize: '0.65rem', color: '#EF4444', mt: 0.25 }}>
                                  {prFieldErrors.source}
                                </Typography>
                              )}
                            </FormControl>
                          </Box>
                        </Grid>

                        <Grid size={{ xs: 12, md: 4 }}>
                          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                            <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary, letterSpacing: '0.5px' }}>
                              DEPARTMENT <span style={{ color: '#EF4444' }}>*</span>
                            </Typography>
                            <Autocomplete
                              fullWidth
                              options={departments}
                              loading={loadingDepartments}
                              getOptionLabel={(option) => option?.DepartmentName || ''}
                              isOptionEqualToValue={(option, value) => option?._id === value?._id}
                              value={departments.find(d => d._id === prFormData.department) || null}
                              onChange={(event, newValue) => {
                                setPrFieldErrors(prev => ({ ...prev, department: '' }));
                                setPrFormData(prev => ({ ...prev, department: newValue?._id || '' }));
                              }}
                              renderInput={(params) => (
                                <TextField
                                  {...params}
                                  size="small"
                                  placeholder="Select department"
                                  error={!!prFieldErrors.department}
                                  helperText={prFieldErrors.department}
                                  sx={textFieldSx}
                                  InputProps={{
                                    ...params.InputProps,
                                    startAdornment: (
                                      <InputAdornment position="start">
                                        <SearchIcon sx={{ fontSize: '1rem', color: COLORS.text.tertiary }} />
                                      </InputAdornment>
                                    ),
                                  }}
                                />
                              )}
                              PaperComponent={CustomPaper}
                              noOptionsText="No departments found"
                            />
                          </Box>
                        </Grid>

                        <Grid size={{ xs: 12, md: 6 }}>
                          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                            <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary, letterSpacing: '0.5px' }}>
                              REQUIRED DATE <span style={{ color: '#EF4444' }}>*</span>
                            </Typography>
                            <TextField
                              fullWidth
                              size="small"
                              type="date"
                              name="required_date"
                              value={prFormData.required_date}
                              onChange={handlePRFormChange}
                              onBlur={handlePRBlur}
                              required
                              disabled={prLoading}
                              error={!!prFieldErrors.required_date}
                              helperText={prFieldErrors.required_date}
                              InputLabelProps={{ shrink: true }}
                              inputProps={{ min: today }}
                              sx={textFieldSx}
                            />
                          </Box>
                        </Grid>

                        <Grid size={{ xs: 12 }}>
                          <Divider sx={{ my: 1 }} />
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                            <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.primary, letterSpacing: '0.5px' }}>
                              ITEMS
                            </Typography>
                            <Button
                              size="small"
                              startIcon={<AddIcon sx={{ fontSize: '0.875rem' }} />}
                              onClick={addPRItem}
                              disabled={prLoading}
                              sx={{
                                textTransform: 'none',
                                fontSize: '0.65rem',
                                color: COLORS.primary,
                                '&:hover': { bgcolor: `${COLORS.primary}10` }
                              }}
                            >
                              Add Item
                            </Button>
                          </Box>
                          {prItems.map((item, index) => (
                            <Box key={index} sx={{ p: 1.5, mb: 1, bgcolor: COLORS.background.white, borderRadius: 1.5, border: `1px solid ${COLORS.border}` }}>
                              <Grid container spacing={1}>
                                <Grid size={{ xs: 12, md: 5 }}>
                                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                                    <Typography sx={{ fontSize: '0.6rem', fontWeight: 600, color: COLORS.text.secondary, letterSpacing: '0.5px' }}>
                                      ITEM <span style={{ color: '#EF4444' }}>*</span>
                                    </Typography>
                                    <Autocomplete
                                      fullWidth
                                      options={items}
                                      loading={loadingItems}
                                      getOptionLabel={(option) => {
                                        const partNo = option.part_no || '';
                                        const desc = option.part_description || '';
                                        return `${partNo} - ${desc}`;
                                      }}
                                      value={items.find(i => i._id === item.item_id) || null}
                                      onChange={(e, val) => handlePRItemChange(index, 'item_id', val?._id || '')}
                                      renderInput={(params) => (
                                        <TextField
                                          {...params}
                                          size="small"
                                          placeholder="Select item"
                                          error={!!prFieldErrors[`item_${index}_item_id`]}
                                          helperText={prFieldErrors[`item_${index}_item_id`]}
                                          sx={textFieldSx}
                                        />
                                      )}
                                      PaperComponent={CustomPaper}
                                      noOptionsText="No items found"
                                    />
                                  </Box>
                                </Grid>
                                <Grid size={{ xs: 12, md: 2 }}>
                                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                                    <Typography sx={{ fontSize: '0.6rem', fontWeight: 600, color: COLORS.text.secondary, letterSpacing: '0.5px' }}>
                                      QTY <span style={{ color: '#EF4444' }}>*</span>
                                    </Typography>
                                    <TextField
                                      fullWidth
                                      size="small"
                                      type="number"
                                      value={item.required_qty}
                                      onChange={(e) => handlePRItemChange(index, 'required_qty', e.target.value)}
                                      placeholder="Qty"
                                      error={!!prFieldErrors[`item_${index}_required_qty`]}
                                      helperText={prFieldErrors[`item_${index}_required_qty`]}
                                      inputProps={{ min: 1, step: 1 }}
                                      sx={numberFieldSx}
                                    />
                                  </Box>
                                </Grid>
                                <Grid size={{ xs: 12, md: 2 }}>
                                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                                    <Typography sx={{ fontSize: '0.6rem', fontWeight: 600, color: COLORS.text.secondary, letterSpacing: '0.5px' }}>
                                      PRICE <span style={{ color: '#EF4444' }}>*</span>
                                    </Typography>
                                    <TextField
                                      fullWidth
                                      size="small"
                                      type="number"
                                      value={item.estimated_price}
                                      onChange={(e) => handlePRItemChange(index, 'estimated_price', e.target.value)}
                                      placeholder="Price"
                                      error={!!prFieldErrors[`item_${index}_estimated_price`]}
                                      helperText={prFieldErrors[`item_${index}_estimated_price`]}
                                      InputProps={{ startAdornment: <InputAdornment position="start">₹</InputAdornment> }}
                                      inputProps={{ min: 0.01, step: 0.01 }}
                                      sx={numberFieldSx}
                                    />
                                  </Box>
                                </Grid>
                                <Grid size={{ xs: 12, md: 2 }}>
                                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                                    <Typography sx={{ fontSize: '0.6rem', fontWeight: 600, color: COLORS.text.secondary, letterSpacing: '0.5px' }}>
                                      REMARKS
                                    </Typography>
                                    <TextField
                                      fullWidth
                                      size="small"
                                      value={item.remarks}
                                      onChange={(e) => handlePRItemChange(index, 'remarks', e.target.value)}
                                      placeholder="Remarks"
                                      sx={textFieldSx}
                                    />
                                  </Box>
                                </Grid>
                                <Grid size={{ xs: 12, md: 1 }}>
                                  <Box sx={{ display: 'flex', alignItems: 'flex-end', height: '100%' }}>
                                    <IconButton
                                      size="small"
                                      onClick={() => removePRItem(index)}
                                      disabled={prItems.length === 1 || prLoading}
                                      sx={{ color: COLORS.error }}
                                    >
                                      <CloseIcon sx={{ fontSize: '1rem' }} />
                                    </IconButton>
                                  </Box>
                                </Grid>
                              </Grid>
                            </Box>
                          ))}
                        </Grid>
                      </Grid>

                      {prError && (
                        <Alert severity="error" sx={{ mt: 2, borderRadius: 1.5, fontSize: '0.75rem', py: 0.5 }}>
                          {prError}
                        </Alert>
                      )}

                      <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                        <Button
                          onClick={() => {
                            setShowPRForm(false);
                            setPrError('');
                            setPrFormData({
                              pr_type: 'Material',
                              source: 'Manual',
                              department: '',
                              required_date: '',
                              items: []
                            });
                            setPrItems([{
                              item_id: '',
                              required_qty: '',
                              estimated_price: '',
                              remarks: ''
                            }]);
                            setPrFieldErrors({});
                            setPrTouched({});
                          }}
                          disabled={prLoading}
                          size="small"
                          sx={cancelButtonSx}
                        >
                          Cancel
                        </Button>
                        <Button
                          variant="contained"
                          onClick={savePR}
                          disabled={prLoading}
                          size="small"
                          startIcon={<AddIcon sx={{ fontSize: '1rem' }} />}
                          sx={addButtonSx}
                        >
                          {prLoading ? 'Adding...' : 'Add PR'}
                        </Button>
                      </Box>
                    </Box>
                  </Collapse>
                </Grid>

                <Grid size={{ xs: 12 }}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                    <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary }}>
                      VALID TILL <span style={{ color: '#EF4444' }}>*</span>
                    </Typography>
                    <TextField
                      fullWidth
                      size="small"
                      type="date"
                      name="valid_till"
                      value={formData.valid_till}
                      onChange={handleChange}
                      error={!!fieldErrors.valid_till}
                      helperText={fieldErrors.valid_till}
                      InputLabelProps={{ shrink: true }}
                      inputProps={{ min: today }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 1.5,
                          fontSize: '0.75rem',
                          '&:hover fieldset': { borderColor: COLORS.primary },
                          '&.Mui-focused fieldset': { borderColor: COLORS.primary, borderWidth: 1 }
                        },
                        '& .MuiInputBase-input': { py: 1, px: 1.5, fontSize: '0.75rem' },
                        '& .MuiFormHelperText-root': { fontSize: '0.65rem', marginLeft: 0 }
                      }}
                    />
                  </Box>
                </Grid>
              </Grid>
            </Paper>
          </Stack>
        );
      
      case 1:
        return (
          <Stack spacing={2}>
            {selectedPR && selectedPR.items && selectedPR.items.length > 0 && (
              <Paper sx={{ p: 2, bgcolor: COLORS.background.white, borderRadius: 1.5, border: `1px solid ${COLORS.border}` }}>
                <Typography variant="subtitle2" sx={{ color: COLORS.primary, mb: 1.5, fontWeight: 600, fontSize: '0.9rem' }}>
                  Items
                </Typography>
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow sx={{ bgcolor: COLORS.background.light }}>
                        <TableCell sx={{ fontSize: '0.7rem', fontWeight: 600 }}>Part No</TableCell>
                        <TableCell sx={{ fontSize: '0.7rem', fontWeight: 600 }}>Description</TableCell>
                        <TableCell sx={{ fontSize: '0.7rem', fontWeight: 600 }} align="center">Qty</TableCell>
                        <TableCell sx={{ fontSize: '0.7rem', fontWeight: 600 }} align="right">Unit</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {selectedPR.items.map((item, idx) => (
                        <TableRow key={idx}>
                          <TableCell sx={{ fontSize: '0.75rem' }}>{item.part_no}</TableCell>
                          <TableCell sx={{ fontSize: '0.75rem' }}>{item.description}</TableCell>
                          <TableCell sx={{ fontSize: '0.75rem' }} align="center">{item.required_qty}</TableCell>
                          <TableCell sx={{ fontSize: '0.75rem' }} align="right">{item.unit}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Paper>
            )}

            <Paper sx={{ p: 2, bgcolor: COLORS.background.white, borderRadius: 1.5, border: `1px solid ${COLORS.border}` }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                <Typography variant="subtitle2" sx={{ color: COLORS.primary, fontWeight: 600, fontSize: '0.9rem' }}>
                  Select Vendors
                </Typography>
                <Button
                  size="small"
                  startIcon={showVendorForm ? <CloseIcon sx={{ fontSize: '1rem' }} /> : <AddCircleIcon sx={{ fontSize: '1rem' }} />}
                  onClick={() => setShowVendorForm(!showVendorForm)}
                  sx={{
                    textTransform: 'none',
                    fontSize: '0.7rem',
                    color: COLORS.primary,
                    '&:hover': { bgcolor: `${COLORS.primary}10` }
                  }}
                >
                  {showVendorForm ? 'Cancel' : 'Add New Vendor'}
                </Button>
              </Box>
              
              <Autocomplete
                multiple
                options={vendors}
                loading={loadingVendors}
                value={selectedVendorObjects}
                onChange={handleVendorSelect}
                getOptionLabel={(opt) => `${opt.vendor_code} - ${opt.vendor_name}`}
                renderInput={(params) => (
                  <TextField 
                    {...params} 
                    size="small" 
                    placeholder="Select vendors..." 
                    error={!!fieldErrors.vendor_ids} 
                    helperText={fieldErrors.vendor_ids}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 1.5,
                        fontSize: '0.75rem',
                        '&:hover fieldset': { borderColor: COLORS.primary },
                        '&.Mui-focused fieldset': { borderColor: COLORS.primary, borderWidth: 1 }
                      },
                      '& .MuiInputBase-input': { py: 1, px: 1.5, fontSize: '0.75rem' },
                      '& .MuiFormHelperText-root': { fontSize: '0.65rem', marginLeft: 0 }
                    }}
                  />
                )}
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => {
                    const avlStatus = getVendorAvlStatus(option);
                    return (
                      <Tooltip key={option._id} title={avlStatus.text}>
                        <Chip
                          label={`${option.vendor_code} - ${option.vendor_name}`}
                          size="small"
                          {...getTagProps({ index })}
                          onClick={() => handleOpenApproveVendor(option)}
                          sx={{ 
                            fontSize: '0.7rem', 
                            height: 24, 
                            bgcolor: option.avl_approved ? COLORS.success + '20' : COLORS.warning + '20',
                            color: option.avl_approved ? COLORS.success : COLORS.warning,
                            border: `1px solid ${option.avl_approved ? COLORS.success : COLORS.warning}`,
                            cursor: 'pointer',
                            '& .MuiChip-label': { px: 1, display: 'flex', alignItems: 'center', gap: 0.5 },
                            '&:hover': {
                              opacity: 0.8,
                              transform: 'scale(1.02)',
                              transition: 'all 0.2s ease'
                            }
                          }}
                          icon={avlStatus.icon}
                        />
                      </Tooltip>
                    );
                  })
                }
                renderOption={(props, option) => {
                  const avlStatus = getVendorAvlStatus(option);
                  return (
                    <li {...props}>
                      <Box sx={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Box>
                          <Typography variant="body2" fontWeight={500} sx={{ fontSize: '0.75rem' }}>
                            {option.vendor_name}
                          </Typography>
                          <Typography variant="caption" sx={{ fontSize: '0.65rem', color: COLORS.text.tertiary }}>
                            Code: {option.vendor_code} | GST: {option.gstin || 'N/A'}
                          </Typography>
                        </Box>
                        <Chip
                          label={avlStatus.text}
                          size="small"
                          icon={avlStatus.icon}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenApproveVendor(option);
                          }}
                          sx={{
                            fontSize: '0.6rem',
                            height: 20,
                            bgcolor: avlStatus.color + '20',
                            color: avlStatus.color,
                            cursor: 'pointer',
                            '& .MuiChip-label': { fontSize: '0.6rem', px: 1 },
                            '&:hover': {
                              opacity: 0.8
                            }
                          }}
                        />
                      </Box>
                    </li>
                  );
                }}
                ListboxProps={{
                  sx: {
                    '& .MuiAutocomplete-option': {
                      fontSize: '0.75rem',
                      py: 1,
                      px: 1.5
                    }
                  }
                }}
              />

              {/* Inline Add Vendor Form */}
              <Collapse in={showVendorForm}>
                <Box sx={{ mt: 2, p: 2.5, bgcolor: COLORS.background.light, borderRadius: 2, border: `1px solid ${COLORS.primary}` }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color: COLORS.primary }}>
                      Add New Vendor
                    </Typography>
                    <IconButton
                      size="small"
                      onClick={() => {
                        setShowVendorForm(false);
                        setVendorError('');
                        setVendorFormData({
                          vendor_code: '',
                          vendor_name: '',
                          vendor_type: '',
                          contact_person: '',
                          email: '',
                          phone: '',
                          address: '',
                          gstin: '',
                          pan: '',
                          website: '',
                          bank_name: '',
                          bank_account_number: '',
                          bank_ifsc: '',
                          payment_terms: 'Net 30',
                          currency: 'INR',
                          preferred: false,
                          avl_approved: false
                        });
                        setVendorFieldErrors({});
                        setVendorTouched({});
                      }}
                      sx={{ color: COLORS.text.tertiary, '&:hover': { color: COLORS.primary } }}
                    >
                      <CloseIcon sx={{ fontSize: '1rem' }} />
                    </IconButton>
                  </Box>

                  <Grid container spacing={1.5}>
                    <Grid size={{ xs: 12, md: 4 }}>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                        <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary, letterSpacing: '0.5px' }}>
                          VENDOR CODE <span style={{ color: '#EF4444' }}>*</span>
                        </Typography>
                        <TextField
                          fullWidth
                          size="small"
                          name="vendor_code"
                          value={vendorFormData.vendor_code}
                          onChange={handleVendorFormChange}
                          onBlur={handleVendorBlur}
                          required
                          disabled={vendorLoading}
                          placeholder="e.g., VEN-001"
                          error={!!vendorFieldErrors.vendor_code}
                          helperText={vendorFieldErrors.vendor_code}
                          inputProps={{ maxLength: 20 }}
                          sx={textFieldSx}
                        />
                      </Box>
                    </Grid>

                    <Grid size={{ xs: 12, md: 4 }}>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                        <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary, letterSpacing: '0.5px' }}>
                          VENDOR NAME <span style={{ color: '#EF4444' }}>*</span>
                        </Typography>
                        <TextField
                          fullWidth
                          size="small"
                          name="vendor_name"
                          value={vendorFormData.vendor_name}
                          onChange={handleVendorFormChange}
                          onBlur={handleVendorBlur}
                          required
                          disabled={vendorLoading}
                          placeholder="e.g., ABC Suppliers"
                          error={!!vendorFieldErrors.vendor_name}
                          helperText={vendorFieldErrors.vendor_name}
                          inputProps={{ maxLength: 100 }}
                          sx={textFieldSx}
                        />
                      </Box>
                    </Grid>

                    <Grid size={{ xs: 12, md: 4 }}>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                        <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary, letterSpacing: '0.5px' }}>
                          VENDOR TYPE <span style={{ color: '#EF4444' }}>*</span>
                        </Typography>
                        <FormControl fullWidth size="small" error={!!vendorFieldErrors.vendor_type}>
                          <Select
                            name="vendor_type"
                            value={vendorFormData.vendor_type}
                            onChange={handleVendorFormChange}
                            onBlur={handleVendorBlur}
                            disabled={vendorLoading}
                            displayEmpty
                            sx={selectSx}
                          >
                            <MenuItem value="" disabled sx={{ fontSize: '0.75rem' }}>Select vendor type</MenuItem>
                            {vendorTypes.map((type) => (
                              <MenuItem key={type} value={type} sx={{ fontSize: '0.75rem' }}>{type}</MenuItem>
                            ))}
                          </Select>
                          {vendorFieldErrors.vendor_type && (
                            <Typography sx={{ fontSize: '0.65rem', color: '#EF4444', mt: 0.25 }}>
                              {vendorFieldErrors.vendor_type}
                            </Typography>
                          )}
                        </FormControl>
                      </Box>
                    </Grid>

                    <Grid size={{ xs: 12, md: 4 }}>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                        <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary, letterSpacing: '0.5px' }}>
                          CONTACT PERSON
                        </Typography>
                        <TextField
                          fullWidth
                          size="small"
                          name="contact_person"
                          value={vendorFormData.contact_person}
                          onChange={handleVendorFormChange}
                          disabled={vendorLoading}
                          placeholder="e.g., John Doe"
                          sx={textFieldSx}
                        />
                      </Box>
                    </Grid>

                    <Grid size={{ xs: 12, md: 4 }}>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                        <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary, letterSpacing: '0.5px' }}>
                          EMAIL
                        </Typography>
                        <TextField
                          fullWidth
                          size="small"
                          name="email"
                          type="email"
                          value={vendorFormData.email}
                          onChange={handleVendorFormChange}
                          onBlur={handleVendorBlur}
                          disabled={vendorLoading}
                          placeholder="vendor@company.com"
                          error={!!vendorFieldErrors.email}
                          helperText={vendorFieldErrors.email}
                          sx={textFieldSx}
                        />
                      </Box>
                    </Grid>

                    <Grid size={{ xs: 12, md: 4 }}>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                        <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary, letterSpacing: '0.5px' }}>
                          PHONE
                        </Typography>
                        <TextField
                          fullWidth
                          size="small"
                          name="phone"
                          value={vendorFormData.phone}
                          onChange={handleVendorFormChange}
                          onBlur={handleVendorBlur}
                          disabled={vendorLoading}
                          placeholder="9876543210"
                          error={!!vendorFieldErrors.phone}
                          helperText={vendorFieldErrors.phone}
                          inputProps={{ maxLength: 10 }}
                          sx={textFieldSx}
                        />
                      </Box>
                    </Grid>

                    <Grid size={{ xs: 12 }}>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                        <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary, letterSpacing: '0.5px' }}>
                          ADDRESS
                        </Typography>
                        <TextField
                          fullWidth
                          size="small"
                          name="address"
                          value={vendorFormData.address}
                          onChange={handleVendorFormChange}
                          disabled={vendorLoading}
                          multiline
                          rows={2}
                          placeholder="Enter complete address"
                          sx={textFieldSx}
                        />
                      </Box>
                    </Grid>

                    <Grid size={{ xs: 12, md: 4 }}>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                        <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary, letterSpacing: '0.5px' }}>
                          GSTIN
                        </Typography>
                        <TextField
                          fullWidth
                          size="small"
                          name="gstin"
                          value={vendorFormData.gstin}
                          onChange={handleVendorFormChange}
                          onBlur={handleVendorBlur}
                          disabled={vendorLoading}
                          placeholder="22AAAAA0000A1Z5"
                          error={!!vendorFieldErrors.gstin}
                          helperText={vendorFieldErrors.gstin}
                          inputProps={{ maxLength: 15 }}
                          sx={textFieldSx}
                        />
                      </Box>
                    </Grid>

                    <Grid size={{ xs: 12, md: 4 }}>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                        <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary, letterSpacing: '0.5px' }}>
                          PAN
                        </Typography>
                        <TextField
                          fullWidth
                          size="small"
                          name="pan"
                          value={vendorFormData.pan}
                          onChange={handleVendorFormChange}
                          onBlur={handleVendorBlur}
                          disabled={vendorLoading}
                          placeholder="ABCDE1234F"
                          error={!!vendorFieldErrors.pan}
                          helperText={vendorFieldErrors.pan}
                          inputProps={{ maxLength: 10 }}
                          sx={textFieldSx}
                        />
                      </Box>
                    </Grid>

                    <Grid size={{ xs: 12, md: 4 }}>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                        <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary, letterSpacing: '0.5px' }}>
                          WEBSITE
                        </Typography>
                        <TextField
                          fullWidth
                          size="small"
                          name="website"
                          value={vendorFormData.website}
                          onChange={handleVendorFormChange}
                          disabled={vendorLoading}
                          placeholder="www.company.com"
                          sx={textFieldSx}
                        />
                      </Box>
                    </Grid>

                    <Grid size={{ xs: 12 }}>
                      <Divider sx={{ my: 1 }} />
                      <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.primary, letterSpacing: '0.5px', mb: 1 }}>
                        Bank Details (Optional)
                      </Typography>
                    </Grid>

                    <Grid size={{ xs: 12, md: 4 }}>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                        <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary, letterSpacing: '0.5px' }}>
                          BANK NAME
                        </Typography>
                        <TextField
                          fullWidth
                          size="small"
                          name="bank_name"
                          value={vendorFormData.bank_name}
                          onChange={handleVendorFormChange}
                          disabled={vendorLoading}
                          placeholder="State Bank of India"
                          sx={textFieldSx}
                        />
                      </Box>
                    </Grid>

                    <Grid size={{ xs: 12, md: 4 }}>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                        <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary, letterSpacing: '0.5px' }}>
                          ACCOUNT NUMBER
                        </Typography>
                        <TextField
                          fullWidth
                          size="small"
                          name="bank_account_number"
                          value={vendorFormData.bank_account_number}
                          onChange={handleVendorFormChange}
                          disabled={vendorLoading}
                          placeholder="1234567890"
                          sx={textFieldSx}
                        />
                      </Box>
                    </Grid>

                    <Grid size={{ xs: 12, md: 4 }}>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                        <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary, letterSpacing: '0.5px' }}>
                          IFSC CODE
                        </Typography>
                        <TextField
                          fullWidth
                          size="small"
                          name="bank_ifsc"
                          value={vendorFormData.bank_ifsc}
                          onChange={handleVendorFormChange}
                          disabled={vendorLoading}
                          placeholder="SBIN0012345"
                          sx={textFieldSx}
                        />
                      </Box>
                    </Grid>

                    <Grid size={{ xs: 12, md: 4 }}>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                        <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary, letterSpacing: '0.5px' }}>
                          PAYMENT TERMS
                        </Typography>
                        <TextField
                          fullWidth
                          size="small"
                          name="payment_terms"
                          value={vendorFormData.payment_terms}
                          onChange={handleVendorFormChange}
                          disabled={vendorLoading}
                          placeholder="Net 30"
                          sx={textFieldSx}
                        />
                      </Box>
                    </Grid>

                    <Grid size={{ xs: 12, md: 4 }}>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                        <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary, letterSpacing: '0.5px' }}>
                          CURRENCY
                        </Typography>
                        <TextField
                          fullWidth
                          size="small"
                          name="currency"
                          value={vendorFormData.currency}
                          onChange={handleVendorFormChange}
                          disabled={vendorLoading}
                          placeholder="INR"
                          sx={textFieldSx}
                        />
                      </Box>
                    </Grid>
                  </Grid>

                  {vendorError && (
                    <Alert severity="error" sx={{ mt: 2, borderRadius: 1.5, fontSize: '0.75rem', py: 0.5 }}>
                      {vendorError}
                    </Alert>
                  )}

                  <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                    <Button
                      onClick={() => {
                        setShowVendorForm(false);
                        setVendorError('');
                        setVendorFormData({
                          vendor_code: '',
                          vendor_name: '',
                          vendor_type: '',
                          contact_person: '',
                          email: '',
                          phone: '',
                          address: '',
                          gstin: '',
                          pan: '',
                          website: '',
                          bank_name: '',
                          bank_account_number: '',
                          bank_ifsc: '',
                          payment_terms: 'Net 30',
                          currency: 'INR',
                          preferred: false,
                          avl_approved: false
                        });
                        setVendorFieldErrors({});
                        setVendorTouched({});
                      }}
                      disabled={vendorLoading}
                      size="small"
                      sx={cancelButtonSx}
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="contained"
                      onClick={saveVendor}
                      disabled={vendorLoading || !vendorFormData.vendor_code || !vendorFormData.vendor_name || !vendorFormData.vendor_type}
                      size="small"
                      startIcon={<AddIcon sx={{ fontSize: '1rem' }} />}
                      sx={addButtonSx}
                    >
                      {vendorLoading ? 'Adding...' : 'Add Vendor'}
                    </Button>
                  </Box>
                </Box>
              </Collapse>

              {/* Inline Approve Vendor Form */}
              <Collapse in={showApproveVendorForm}>
                <Box sx={{ mt: 2, p: 2.5, bgcolor: COLORS.background.light, borderRadius: 2, border: `1px solid ${COLORS.warning}` }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color: COLORS.warning }}>
                      Approve Vendor - {selectedVendorForApproval?.vendor_name}
                    </Typography>
                    <IconButton
                      size="small"
                      onClick={() => {
                        setShowApproveVendorForm(false);
                        setSelectedVendorForApproval(null);
                        setApproveVendorError('');
                      }}
                      sx={{ color: COLORS.text.tertiary, '&:hover': { color: COLORS.primary } }}
                    >
                      <CloseIcon sx={{ fontSize: '1rem' }} />
                    </IconButton>
                  </Box>

                  <Alert severity="info" sx={{ mb: 2, borderRadius: 1.5, fontSize: '0.75rem', py: 0.5 }}>
                    <Typography variant="body2" sx={{ fontSize: '0.75rem' }}>
                      This vendor is currently <strong>not AVL approved</strong>. Approving will add them to the Approved Vendor List (AVL).
                    </Typography>
                  </Alert>

                  {approveVendorError && (
                    <Alert severity="error" sx={{ mt: 2, borderRadius: 1.5, fontSize: '0.75rem', py: 0.5 }}>
                      {approveVendorError}
                    </Alert>
                  )}

                  <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                    <Button
                      onClick={() => {
                        setShowApproveVendorForm(false);
                        setSelectedVendorForApproval(null);
                        setApproveVendorError('');
                      }}
                      disabled={approveVendorLoading}
                      size="small"
                      sx={cancelButtonSx}
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="contained"
                      onClick={approveVendor}
                      disabled={approveVendorLoading}
                      size="small"
                      startIcon={<VerifiedIcon sx={{ fontSize: '1rem' }} />}
                      sx={{
                        ...addButtonSx,
                        bgcolor: COLORS.success,
                        '&:hover': { bgcolor: '#059669' }
                      }}
                    >
                      {approveVendorLoading ? 'Approving...' : 'Approve Vendor'}
                    </Button>
                  </Box>
                </Box>
              </Collapse>

              {/* Warning message if selected vendor is not AVL approved */}
              {selectedVendorObjects.some(v => !v.avl_approved) && (
                <Alert 
                  severity="warning" 
                  sx={{ 
                    mt: 1.5, 
                    borderRadius: 1.5,
                    fontSize: '0.7rem',
                    py: 0.5
                  }}
                >
                  <Typography variant="caption" sx={{ fontSize: '0.7rem' }}>
                    ⚠️ Some selected vendors are not AVL approved. Click on the vendor chip to approve them.
                  </Typography>
                </Alert>
              )}
            </Paper>
          </Stack>
        );
      
      default:
        return null;
    }
  };

  return (
    <>
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
            overflow: 'hidden',
            maxHeight: '95vh'
          }
        }}
      >
        <DialogTitle sx={{
          borderBottom: `1px solid ${COLORS.border}`,
          py: 1.5,
          px: 2.5,
          bgcolor: COLORS.background.white,
          display: 'flex',
          flexDirection: 'column',
          gap: 1
        }}>
          <Typography sx={{ fontSize: '1.2rem', fontWeight: 700, color: COLORS.text.primary }}>
            Create Request for Quotation
          </Typography>

          <Stepper
            activeStep={activeStep}
            alternativeLabel
            connector={<ColorConnector />}
            sx={{ mb: 0.5, mt: 0.5 }}
          >
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel StepIconComponent={CustomStepIcon}>
                  <Typography fontWeight={500} fontSize="0.8rem" color={COLORS.text.secondary}>
                    {label}
                  </Typography>
                </StepLabel>
              </Step>
            ))}
          </Stepper>
        </DialogTitle>

        <DialogContent sx={{ p: 2.5, overflow: 'auto' }}>
          {renderStepContent(activeStep)}

          {error && (
            <Alert 
              severity="error" 
              sx={{ 
                mt: 2, 
                borderRadius: 1.5,
                '& .MuiAlert-icon': { fontSize: '1.25rem', alignItems: 'center' },
                fontSize: '0.75rem',
                py: 0.5
              }}
            >
              {error}
            </Alert>
          )}
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
            onClick={handleBack}
            disabled={activeStep === 0 || loading}
            startIcon={<NavigateBeforeIcon sx={{ fontSize: '1rem' }} />}
            sx={cancelButtonSx}
          >
            Back
          </Button>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              onClick={handleClose}
              disabled={loading}
              startIcon={<CloseIcon sx={{ fontSize: '1rem' }} />}
              sx={cancelButtonSx}
            >
              Cancel
            </Button>
            {activeStep === steps.length - 1 ? (
              <Button
                variant="contained"
                onClick={handleSubmit}
                disabled={loading || !formData.pr_id || !formData.valid_till || formData.vendor_ids.length === 0}
                startIcon={loading ? null : <AddIcon sx={{ fontSize: '1rem' }} />}
                sx={addButtonSx}
              >
                {loading ? 'Creating...' : 'Create RFQ'}
              </Button>
            ) : (
              <Button
                variant="contained"
                onClick={handleNext}
                disabled={loading}
                endIcon={<NavigateNextIcon sx={{ fontSize: '1rem' }} />}
                sx={addButtonSx}
              >
                Next
              </Button>
            )}
          </Box>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default AddRFQ;