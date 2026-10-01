// // AddPurchaseOrder.js
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
//   Divider,
//   Stepper,
//   Step,
//   StepLabel,
//   StepConnector,
//   stepConnectorClasses,
//   styled
// } from '@mui/material';
// import { 
//   Add as AddIcon,
//   Close as CloseIcon,
//   Send as SendIcon,
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

// const steps = ['Select RFQ', 'Order Details'];

// const AddPurchaseOrder = ({ open, onClose, onAdd }) => {
//   const [activeStep, setActiveStep] = useState(0);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState('');
//   const [rfqs, setRfqs] = useState([]);
//   const [loadingRfqs, setLoadingRfqs] = useState(false);
//   const [selectedRfq, setSelectedRfq] = useState(null);
//   const [formData, setFormData] = useState({
//     rfq_id: '',
//     po_type: 'Regular',
//     delivery_date: '',
//     delivery_mode: '',
//     freight_terms: '',
//     payment_terms: '',
//     internal_remarks: ''
//   });
//   const [fieldErrors, setFieldErrors] = useState({});

//   // Enums from schema
//   const poTypes = [
//     { value: 'Regular', label: 'Regular' },
//     { value: 'Subcontract', label: 'Subcontract' },
//     { value: 'Import', label: 'Import' },
//     { value: 'Capital', label: 'Capital' },
//     { value: 'Service', label: 'Service' },
//     { value: 'Blanket', label: 'Blanket' }
//   ];

//   const deliveryModes = [
//     { value: 'Road', label: 'Road' },
//     { value: 'Air', label: 'Air' },
//     { value: 'Sea', label: 'Sea' },
//     { value: 'Rail', label: 'Rail' },
//     { value: 'Courier', label: 'Courier' },
//     { value: 'Hand Delivery', label: 'Hand Delivery' }
//   ];

//   const freightTermsOptions = [
//     { value: 'FOR Destination', label: 'FOR Destination' },
//     { value: 'Ex-Works', label: 'Ex-Works' },
//     { value: 'CIF', label: 'CIF' },
//     { value: 'FOB', label: 'FOB' },
//     { value: 'Freight Paid', label: 'Freight Paid' },
//     { value: 'Freight To Pay', label: 'Freight To Pay' }
//   ];

//   const paymentTermsOptions = [
//     'Advance', 'On Delivery', 'Net 15', 'Net 30', 'Net 45', 'Net 60', 'Net 90', 'LC', 'Custom'
//   ];

//   useEffect(() => {
//     if (open) {
//       fetchClosedRfqs();
//     }
//   }, [open]);

//   const fetchClosedRfqs = async () => {
//     try {
//       setLoadingRfqs(true);
//       const token = localStorage.getItem('token');
//       const response = await axios.get(`${BASE_URL}/api/rfqs`, {
//         headers: { 'Authorization': `Bearer ${token}` }
//       });
//       if (response.data.success) {
//         const eligibleRfqs = response.data.data.filter(rfq => 
//           rfq.status === 'Compared' || rfq.status === 'Closed'
//         );
//         setRfqs(eligibleRfqs);
//       }
//     } catch (err) {
//       console.error('Error fetching RFQs:', err);
//     } finally {
//       setLoadingRfqs(false);
//     }
//   };

//   const handleRfqChange = (event, value) => {
//     setSelectedRfq(value);
//     setFormData(prev => ({ ...prev, rfq_id: value?._id || '' }));
//     setFieldErrors(prev => ({ ...prev, rfq_id: '' }));
//   };

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFieldErrors(prev => ({ ...prev, [name]: '' }));
//     setFormData(prev => ({ ...prev, [name]: value }));
//   };

//   const handleSelectChange = (e) => {
//     const { name, value } = e.target;
//     setFieldErrors(prev => ({ ...prev, [name]: '' }));
//     setFormData(prev => ({ ...prev, [name]: value }));
//   };

//   const validateStep = (step) => {
//     const errors = {};
//     let isValid = true;

//     switch (step) {
//       case 0: // Select RFQ
//         if (!formData.rfq_id) {
//           errors.rfq_id = 'RFQ is required';
//           isValid = false;
//         }
//         break;
//       case 1: // Order Details
//         if (!formData.po_type) {
//           errors.po_type = 'PO type is required';
//           isValid = false;
//         }
//         if (!formData.delivery_date) {
//           errors.delivery_date = 'Delivery date is required';
//           isValid = false;
//         }
//         if (!formData.payment_terms) {
//           errors.payment_terms = 'Payment terms are required';
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
//     if (!validateStep(1)) return;

//     setLoading(true);
//     setError('');

//     try {
//       const token = localStorage.getItem('token');
//       const user = JSON.parse(localStorage.getItem('user') || '{}');
      
//       const submissionData = {
//         rfq_id: formData.rfq_id,
//         po_type: formData.po_type,
//         delivery_date: formData.delivery_date,
//         delivery_mode: formData.delivery_mode || null,
//         freight_terms: formData.freight_terms || null,
//         payment_terms: formData.payment_terms,
//         internal_remarks: formData.internal_remarks || '',
//         created_by: user._id
//       };

//       const response = await axios.post(`${BASE_URL}/api/purchase-orders`, submissionData, {
//         headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
//       });

//       if (response.data.success) {
//         onAdd(response.data.data);
//         resetForm();
//         onClose();
//       } else {
//         setError(response.data.message || 'Failed to create Purchase Order');
//       }
//     } catch (err) {
//       console.error('Error creating PO:', err);
//       setError(err.response?.data?.message || 'Failed to create Purchase Order');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const resetForm = () => {
//     setFormData({ 
//       rfq_id: '', 
//       po_type: 'Regular',
//       delivery_date: '', 
//       delivery_mode: '',
//       freight_terms: '',
//       payment_terms: '', 
//       internal_remarks: '' 
//     });
//     setSelectedRfq(null);
//     setFieldErrors({});
//     setError('');
//     setActiveStep(0);
//   };

//   const handleClose = () => {
//     resetForm();
//     onClose();
//   };

//   const today = new Date().toISOString().split('T')[0];

//   const renderStepContent = (step) => {
//     switch (step) {
//       case 0: // Select RFQ
//         return (
//           <Stack spacing={2}>
//             <Paper sx={{ p: 2, bgcolor: COLORS.background.white, borderRadius: 1.5, border: `1px solid ${COLORS.border}` }}>
//               <Typography variant="subtitle2" sx={{ color: COLORS.primary, mb: 1.5, fontWeight: 600, fontSize: '0.9rem' }}>
//                 Select RFQ
//               </Typography>
              
//               <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//                 <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary }}>
//                   RFQ <span style={{ color: '#EF4444' }}>*</span>
//                 </Typography>
//                 <Autocomplete
//                   options={rfqs}
//                   loading={loadingRfqs}
//                   value={selectedRfq}
//                   onChange={handleRfqChange}
//                   getOptionLabel={(opt) => `${opt.rfq_number} - ${opt.pr_id?.pr_number || 'N/A'} (${opt.status})`}
//                   renderInput={(params) => (
//                     <TextField
//                       {...params}
//                       size="small"
//                       placeholder={loadingRfqs ? 'Loading RFQs...' : 'Select RFQ...'}
//                       error={!!fieldErrors.rfq_id}
//                       helperText={fieldErrors.rfq_id}
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
//                   )}
//                   renderOption={(props, opt) => (
//                     <li {...props}>
//                       <Box>
//                         <Typography variant="body2" fontWeight={500} sx={{ fontSize: '0.75rem' }}>{opt.rfq_number}</Typography>
//                         <Typography variant="caption" sx={{ fontSize: '0.65rem', color: COLORS.text.tertiary }}>
//                           PR: {opt.pr_id?.pr_number} | Status: {opt.status} | Vendors: {opt.vendors?.length || 0}
//                         </Typography>
//                       </Box>
//                     </li>
//                   )}
//                 />
//               </Box>

//               {selectedRfq && selectedRfq.items && selectedRfq.items.length > 0 && (
//                 <>
//                   <Divider sx={{ my: 2 }} />
//                   <Typography variant="subtitle2" sx={{ color: COLORS.primary, mb: 1.5, fontWeight: 600, fontSize: '0.8rem' }}>
//                     Items from RFQ
//                   </Typography>
//                   <TableContainer>
//                     <Table size="small">
//                       <TableHead>
//                         <TableRow sx={{ bgcolor: COLORS.background.light }}>
//                           <TableCell sx={{ fontSize: '0.7rem', fontWeight: 600 }}>Part No</TableCell>
//                           <TableCell sx={{ fontSize: '0.7rem', fontWeight: 600 }}>Description</TableCell>
//                           <TableCell sx={{ fontSize: '0.7rem', fontWeight: 600 }} align="center">Qty</TableCell>
//                           <TableCell sx={{ fontSize: '0.7rem', fontWeight: 600 }} align="right">Unit</TableCell>
//                         </TableRow>
//                       </TableHead>
//                       <TableBody>
//                         {selectedRfq.items.map((item, idx) => (
//                           <TableRow key={idx}>
//                             <TableCell sx={{ fontSize: '0.75rem' }}>{item.part_no}</TableCell>
//                             <TableCell sx={{ fontSize: '0.75rem' }}>{item.description}</TableCell>
//                             <TableCell sx={{ fontSize: '0.75rem' }} align="center">{item.required_qty}</TableCell>
//                             <TableCell sx={{ fontSize: '0.75rem' }} align="right">{item.unit}</TableCell>
//                           </TableRow>
//                         ))}
//                       </TableBody>
//                     </Table>
//                   </TableContainer>
//                 </>
//               )}
//             </Paper>
//           </Stack>
//         );
      
//       case 1: // Order Details
//         return (
//           <Stack spacing={2}>
//             <Paper sx={{ p: 2, bgcolor: COLORS.background.white, borderRadius: 1.5, border: `1px solid ${COLORS.border}` }}>
//               <Typography variant="subtitle2" sx={{ color: COLORS.primary, mb: 1.5, fontWeight: 600, fontSize: '0.9rem' }}>
//                 Order Details
//               </Typography>
              
//               <Grid container spacing={1.5}>
//                 <Grid size={{ xs: 12, md: 6 }}>
//                   <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//                     <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary }}>
//                       PO TYPE <span style={{ color: '#EF4444' }}>*</span>
//                     </Typography>
//                     <FormControl fullWidth size="small" error={!!fieldErrors.po_type}>
//                       <Select 
//                         name="po_type" 
//                         value={formData.po_type} 
//                         onChange={handleSelectChange}
//                         sx={{
//                           borderRadius: 1.5,
//                           fontSize: '0.75rem',
//                           '& .MuiSelect-select': { py: 1, px: 1.5, fontSize: '0.75rem' },
//                           '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: COLORS.primary },
//                           '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: COLORS.primary, borderWidth: 1 }
//                         }}
//                       >
//                         {poTypes.map(type => (
//                           <MenuItem key={type.value} value={type.value} sx={{ fontSize: '0.75rem' }}>{type.label}</MenuItem>
//                         ))}
//                       </Select>
//                     </FormControl>
//                   </Box>
//                 </Grid>
//                 <Grid size={{ xs: 12, md: 6 }}>
//                   <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//                     <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary }}>
//                       DELIVERY DATE <span style={{ color: '#EF4444' }}>*</span>
//                     </Typography>
//                     <TextField
//                       fullWidth
//                       size="small"
//                       type="date"
//                       name="delivery_date"
//                       value={formData.delivery_date}
//                       onChange={handleChange}
//                       error={!!fieldErrors.delivery_date}
//                       helperText={fieldErrors.delivery_date}
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
//                 <Grid size={{ xs: 12, md: 6 }}>
//                   <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//                     <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary }}>
//                       DELIVERY MODE
//                     </Typography>
//                     <FormControl fullWidth size="small">
//                       <Select 
//                         name="delivery_mode" 
//                         value={formData.delivery_mode} 
//                         onChange={handleSelectChange}
//                         sx={{
//                           borderRadius: 1.5,
//                           fontSize: '0.75rem',
//                           '& .MuiSelect-select': { py: 1, px: 1.5, fontSize: '0.75rem' },
//                           '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: COLORS.primary },
//                           '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: COLORS.primary, borderWidth: 1 }
//                         }}
//                       >
//                         <MenuItem value="" sx={{ fontSize: '0.75rem' }}>None</MenuItem>
//                         {deliveryModes.map(mode => (
//                           <MenuItem key={mode.value} value={mode.value} sx={{ fontSize: '0.75rem' }}>{mode.label}</MenuItem>
//                         ))}
//                       </Select>
//                     </FormControl>
//                   </Box>
//                 </Grid>
//                 <Grid size={{ xs: 12, md: 6 }}>
//                   <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//                     <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary }}>
//                       FREIGHT TERMS
//                     </Typography>
//                     <FormControl fullWidth size="small">
//                       <Select 
//                         name="freight_terms" 
//                         value={formData.freight_terms} 
//                         onChange={handleSelectChange}
//                         sx={{
//                           borderRadius: 1.5,
//                           fontSize: '0.75rem',
//                           '& .MuiSelect-select': { py: 1, px: 1.5, fontSize: '0.75rem' },
//                           '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: COLORS.primary },
//                           '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: COLORS.primary, borderWidth: 1 }
//                         }}
//                       >
//                         <MenuItem value="" sx={{ fontSize: '0.75rem' }}>None</MenuItem>
//                         {freightTermsOptions.map(term => (
//                           <MenuItem key={term.value} value={term.value} sx={{ fontSize: '0.75rem' }}>{term.label}</MenuItem>
//                         ))}
//                       </Select>
//                     </FormControl>
//                   </Box>
//                 </Grid>
//                 <Grid size={{ xs: 12, md: 6 }}>
//                   <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//                     <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary }}>
//                       PAYMENT TERMS <span style={{ color: '#EF4444' }}>*</span>
//                     </Typography>
//                     <FormControl fullWidth size="small" error={!!fieldErrors.payment_terms}>
//                       <Select 
//                         name="payment_terms" 
//                         value={formData.payment_terms} 
//                         onChange={handleSelectChange}
//                         sx={{
//                           borderRadius: 1.5,
//                           fontSize: '0.75rem',
//                           '& .MuiSelect-select': { py: 1, px: 1.5, fontSize: '0.75rem' },
//                           '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: COLORS.primary },
//                           '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: COLORS.primary, borderWidth: 1 }
//                         }}
//                       >
//                         {paymentTermsOptions.map(term => (
//                           <MenuItem key={term} value={term} sx={{ fontSize: '0.75rem' }}>{term}</MenuItem>
//                         ))}
//                       </Select>
//                     </FormControl>
//                   </Box>
//                 </Grid>
//                 <Grid size={{ xs: 12, md: 6 }}>
//                   <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//                     <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary }}>
//                       INTERNAL REMARKS
//                     </Typography>
//                     <TextField
//                       fullWidth
//                       multiline
//                       rows={2}
//                       size="small"
//                       name="internal_remarks"
//                       value={formData.internal_remarks}
//                       onChange={handleChange}
//                       placeholder="Add any internal notes..."
//                       sx={{
//                         '& .MuiOutlinedInput-root': {
//                           borderRadius: 1.5,
//                           fontSize: '0.75rem',
//                           '&:hover fieldset': { borderColor: COLORS.primary },
//                           '&.Mui-focused fieldset': { borderColor: COLORS.primary, borderWidth: 1 }
//                         },
//                         '& .MuiInputBase-input': { py: 1, px: 1.5, fontSize: '0.75rem' }
//                       }}
//                     />
//                   </Box>
//                 </Grid>
//               </Grid>
//             </Paper>

//             {selectedRfq && selectedRfq.items && selectedRfq.items.length > 0 && (
//               <Paper sx={{ p: 2, bgcolor: COLORS.background.white, borderRadius: 1.5, border: `1px solid ${COLORS.border}` }}>
//                 <Typography variant="subtitle2" sx={{ color: COLORS.primary, mb: 1.5, fontWeight: 600, fontSize: '0.8rem' }}>
//                   Items Summary
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
//                       {selectedRfq.items.map((item, idx) => (
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
//           Create Purchase Order
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
//               disabled={loading || !formData.rfq_id || !formData.delivery_date || !formData.payment_terms}
//               startIcon={loading ? null : <SendIcon sx={{ fontSize: '1rem' }} />}
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
//               {loading ? 'Creating...' : 'Create PO'}
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

// export default AddPurchaseOrder;


// AddPurchaseOrder.js
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
  FormControl,
  Select,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Autocomplete,
  Chip,
  InputAdornment,
  CircularProgress,
  Divider,
  Stepper,
  Step,
  StepLabel,
  StepConnector,
  stepConnectorClasses,
  styled,
  IconButton,
  Collapse
} from '@mui/material';
import { 
  Add as AddIcon,
  Close as CloseIcon,
  Send as SendIcon,
  NavigateNext as NavigateNextIcon,
  NavigateBefore as NavigateBeforeIcon,
  Search as SearchIcon
} from '@mui/icons-material';
import axios from 'axios';
import BASE_URL from '../../../config/Config';

const COLORS = {
  primary: '#063C3F',
  primaryLight: '#E8F0F1',
  primaryDark: '#05292B',
  primaryBlue: '#00B4D8',
  text: { primary: '#151C26', secondary: '#4B5568', tertiary: '#94A3B8' },
  background: { white: '#FFFFFF', light: '#F8FFFC', hover: '#F0FDF9' },
  border: '#E3E8EF'
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

const steps = ['Select RFQ', 'Order Details'];

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

const AddPurchaseOrder = ({ open, onClose, onAdd }) => {
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [rfqs, setRfqs] = useState([]);
  const [loadingRfqs, setLoadingRfqs] = useState(false);
  const [selectedRfq, setSelectedRfq] = useState(null);
  
  // State for inline Add RFQ form
  const [showRfqForm, setShowRfqForm] = useState(false);
  const [rfqFormData, setRfqFormData] = useState({
    pr_id: '',
    valid_till: '',
    vendor_ids: []
  });
  const [rfqFieldErrors, setRfqFieldErrors] = useState({});
  const [rfqTouched, setRfqTouched] = useState({});
  const [rfqLoading, setRfqLoading] = useState(false);
  const [rfqError, setRfqError] = useState('');
  const [pendingPRs, setPendingPRs] = useState([]);
  const [loadingPRs, setLoadingPRs] = useState(false);
  const [vendors, setVendors] = useState([]);
  const [loadingVendors, setLoadingVendors] = useState(false);
  const [selectedRfqPR, setSelectedRfqPR] = useState(null);
  const [selectedRfqVendors, setSelectedRfqVendors] = useState([]);

  const [formData, setFormData] = useState({
    rfq_id: '',
    po_type: 'Regular',
    delivery_date: '',
    delivery_mode: '',
    freight_terms: '',
    payment_terms: '',
    internal_remarks: ''
  });
  const [fieldErrors, setFieldErrors] = useState({});

  // Enums from schema
  const poTypes = [
    { value: 'Regular', label: 'Regular' },
    { value: 'Subcontract', label: 'Subcontract' },
    { value: 'Import', label: 'Import' },
    { value: 'Capital', label: 'Capital' },
    { value: 'Service', label: 'Service' },
    { value: 'Blanket', label: 'Blanket' }
  ];

  const deliveryModes = [
    { value: 'Road', label: 'Road' },
    { value: 'Air', label: 'Air' },
    { value: 'Sea', label: 'Sea' },
    { value: 'Rail', label: 'Rail' },
    { value: 'Courier', label: 'Courier' },
    { value: 'Hand Delivery', label: 'Hand Delivery' }
  ];

  const freightTermsOptions = [
    { value: 'FOR Destination', label: 'FOR Destination' },
    { value: 'Ex-Works', label: 'Ex-Works' },
    { value: 'CIF', label: 'CIF' },
    { value: 'FOB', label: 'FOB' },
    { value: 'Freight Paid', label: 'Freight Paid' },
    { value: 'Freight To Pay', label: 'Freight To Pay' }
  ];

  const paymentTermsOptions = [
    'Advance', 'On Delivery', 'Net 15', 'Net 30', 'Net 45', 'Net 60', 'Net 90', 'LC', 'Custom'
  ];

  useEffect(() => {
    if (open) {
      fetchClosedRfqs();
      fetchPendingPRs();
      fetchVendors();
    }
  }, [open]);

  const fetchClosedRfqs = async () => {
    try {
      setLoadingRfqs(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(`${BASE_URL}/api/rfqs`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.data.success) {
        const eligibleRfqs = response.data.data.filter(rfq => 
          rfq.status === 'Compared' || rfq.status === 'Closed'
        );
        setRfqs(eligibleRfqs);
      }
    } catch (err) {
      console.error('Error fetching RFQs:', err);
    } finally {
      setLoadingRfqs(false);
    }
  };

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

  // ======================== RFQ FORM HANDLERS ========================

  const handleRfqFormChange = (e) => {
    const { name, value } = e.target;
    setRfqFieldErrors(prev => ({ ...prev, [name]: '' }));
    setRfqFormData(prev => ({ ...prev, [name]: value }));

    if (rfqTouched[name] || value) {
      const errorMessage = validateRfqField(name, value);
      setRfqFieldErrors(prev => ({ ...prev, [name]: errorMessage }));
    }
  };

  const handleRfqPRChange = (event, value) => {
    setSelectedRfqPR(value);
    setRfqFormData(prev => ({ ...prev, pr_id: value?._id || '' }));
    setRfqFieldErrors(prev => ({ ...prev, pr_id: '' }));
  };

  const handleRfqVendorSelect = (event, newValue) => {
    setSelectedRfqVendors(newValue);
    setRfqFormData(prev => ({ ...prev, vendor_ids: newValue.map(v => v._id) }));
    setRfqFieldErrors(prev => ({ ...prev, vendor_ids: '' }));
  };

  const handleRfqBlur = (e) => {
    const { name, value } = e.target;
    setRfqTouched(prev => ({ ...prev, [name]: true }));
    const errorMessage = validateRfqField(name, value);
    setRfqFieldErrors(prev => ({ ...prev, [name]: errorMessage }));
  };

  const validateRfqField = (name, value) => {
    switch (name) {
      case 'pr_id':
        if (!value) return 'Purchase requisition is required';
        return '';
      case 'valid_till':
        if (!value) return 'Valid till date is required';
        return '';
      case 'vendor_ids':
        if (!value || value.length === 0) return 'At least one vendor is required';
        return '';
      default:
        return '';
    }
  };

  const validateRfqForm = () => {
    const errors = {};
    let isValid = true;

    if (!rfqFormData.pr_id) {
      errors.pr_id = 'Purchase requisition is required';
      isValid = false;
    }
    if (!rfqFormData.valid_till) {
      errors.valid_till = 'Valid till date is required';
      isValid = false;
    }
    if (!rfqFormData.vendor_ids || rfqFormData.vendor_ids.length === 0) {
      errors.vendor_ids = 'At least one vendor is required';
      isValid = false;
    }

    setRfqFieldErrors(errors);
    if (!isValid) {
      setRfqError('Please fix the errors above');
    }
    return isValid;
  };

  const saveRfq = async () => {
    if (!validateRfqForm()) return;

    setRfqLoading(true);
    setRfqError('');

    try {
      const token = localStorage.getItem('token');
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      
      const submissionData = {
        pr_id: rfqFormData.pr_id,
        valid_till: rfqFormData.valid_till,
        vendor_ids: rfqFormData.vendor_ids,
        created_by: user._id
      };

      const response = await axios.post(`${BASE_URL}/api/rfqs`, submissionData, {
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
      });

      if (response.data.success) {
        const newRfq = response.data.data;
        setRfqs(prev => [...prev, newRfq]);
        setSelectedRfq(newRfq);
        setFormData(prev => ({ ...prev, rfq_id: newRfq._id }));
        
        // Reset RFQ form
        setRfqFormData({
          pr_id: '',
          valid_till: '',
          vendor_ids: []
        });
        setSelectedRfqPR(null);
        setSelectedRfqVendors([]);
        setRfqFieldErrors({});
        setRfqTouched({});
        setRfqError('');
        setShowRfqForm(false);
      }
    } catch (err) {
      setRfqError(err.response?.data?.message || 'Failed to create RFQ');
    } finally {
      setRfqLoading(false);
    }
  };

  const handleRfqChange = (event, value) => {
    setSelectedRfq(value);
    setFormData(prev => ({ ...prev, rfq_id: value?._id || '' }));
    setFieldErrors(prev => ({ ...prev, rfq_id: '' }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFieldErrors(prev => ({ ...prev, [name]: '' }));
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (e) => {
    const { name, value } = e.target;
    setFieldErrors(prev => ({ ...prev, [name]: '' }));
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const validateStep = (step) => {
    const errors = {};
    let isValid = true;

    switch (step) {
      case 0: // Select RFQ
        if (!formData.rfq_id) {
          errors.rfq_id = 'RFQ is required';
          isValid = false;
        }
        break;
      case 1: // Order Details
        if (!formData.po_type) {
          errors.po_type = 'PO type is required';
          isValid = false;
        }
        if (!formData.delivery_date) {
          errors.delivery_date = 'Delivery date is required';
          isValid = false;
        }
        if (!formData.payment_terms) {
          errors.payment_terms = 'Payment terms are required';
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
    if (!validateStep(1)) return;

    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      
      const submissionData = {
        rfq_id: formData.rfq_id,
        po_type: formData.po_type,
        delivery_date: formData.delivery_date,
        delivery_mode: formData.delivery_mode || null,
        freight_terms: formData.freight_terms || null,
        payment_terms: formData.payment_terms,
        internal_remarks: formData.internal_remarks || '',
        created_by: user._id
      };

      const response = await axios.post(`${BASE_URL}/api/purchase-orders`, submissionData, {
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
      });

      if (response.data.success) {
        onAdd(response.data.data);
        resetForm();
        onClose();
      } else {
        setError(response.data.message || 'Failed to create Purchase Order');
      }
    } catch (err) {
      console.error('Error creating PO:', err);
      setError(err.response?.data?.message || 'Failed to create Purchase Order');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({ 
      rfq_id: '', 
      po_type: 'Regular',
      delivery_date: '', 
      delivery_mode: '',
      freight_terms: '',
      payment_terms: '', 
      internal_remarks: '' 
    });
    setSelectedRfq(null);
    setFieldErrors({});
    setError('');
    setActiveStep(0);
    setShowRfqForm(false);
    setRfqFormData({
      pr_id: '',
      valid_till: '',
      vendor_ids: []
    });
    setSelectedRfqPR(null);
    setSelectedRfqVendors([]);
    setRfqFieldErrors({});
    setRfqTouched({});
    setRfqError('');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const today = new Date().toISOString().split('T')[0];
  const selectedRfqVendorObjects = vendors.filter(v => rfqFormData.vendor_ids.includes(v._id));

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
      case 0: // Select RFQ
        return (
          <Stack spacing={2}>
            <Paper sx={{ p: 2, bgcolor: COLORS.background.white, borderRadius: 1.5, border: `1px solid ${COLORS.border}` }}>
              <Typography variant="subtitle2" sx={{ color: COLORS.primary, mb: 1.5, fontWeight: 600, fontSize: '0.9rem' }}>
                Select RFQ
              </Typography>
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary }}>
                  RFQ <span style={{ color: '#EF4444' }}>*</span>
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
                  <Box sx={{ flex: 1 }}>
                    <Autocomplete
                      options={rfqs}
                      loading={loadingRfqs}
                      value={selectedRfq}
                      onChange={handleRfqChange}
                      getOptionLabel={(opt) => `${opt.rfq_number} - ${opt.pr_id?.pr_number || 'N/A'} (${opt.status})`}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          size="small"
                          placeholder={loadingRfqs ? 'Loading RFQs...' : 'Select RFQ...'}
                          error={!!fieldErrors.rfq_id}
                          helperText={fieldErrors.rfq_id}
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
                      renderOption={(props, opt) => (
                        <li {...props}>
                          <Box>
                            <Typography variant="body2" fontWeight={500} sx={{ fontSize: '0.75rem' }}>{opt.rfq_number}</Typography>
                            <Typography variant="caption" sx={{ fontSize: '0.65rem', color: COLORS.text.tertiary }}>
                              PR: {opt.pr_id?.pr_number} | Status: {opt.status} | Vendors: {opt.vendors?.length || 0}
                            </Typography>
                          </Box>
                        </li>
                      )}
                    />
                  </Box>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => setShowRfqForm(!showRfqForm)}
                    startIcon={showRfqForm ? <CloseIcon sx={{ fontSize: '0.875rem' }} /> : <AddIcon sx={{ fontSize: '0.875rem' }} />}
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
                    {showRfqForm ? 'Cancel' : 'Add New'}
                  </Button>
                </Box>
              </Box>

              {/* Inline Add RFQ Form */}
              <Collapse in={showRfqForm}>
                <Box sx={{ mt: 2, p: 2.5, bgcolor: COLORS.background.light, borderRadius: 2, border: `1px solid ${COLORS.primary}` }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color: COLORS.primary }}>
                      Add New RFQ
                    </Typography>
                    <IconButton
                      size="small"
                      onClick={() => {
                        setShowRfqForm(false);
                        setRfqError('');
                        setRfqFormData({
                          pr_id: '',
                          valid_till: '',
                          vendor_ids: []
                        });
                        setSelectedRfqPR(null);
                        setSelectedRfqVendors([]);
                        setRfqFieldErrors({});
                        setRfqTouched({});
                      }}
                      sx={{ color: COLORS.text.tertiary, '&:hover': { color: COLORS.primary } }}
                    >
                      <CloseIcon sx={{ fontSize: '1rem' }} />
                    </IconButton>
                  </Box>

                  <Grid container spacing={1.5}>
                    <Grid size={{ xs: 12 }}>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                        <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary, letterSpacing: '0.5px' }}>
                          PURCHASE REQUISITION <span style={{ color: '#EF4444' }}>*</span>
                        </Typography>
                        <Autocomplete
                          options={pendingPRs}
                          loading={loadingPRs}
                          value={selectedRfqPR}
                          onChange={handleRfqPRChange}
                          getOptionLabel={(opt) => `${opt.pr_number} (${opt.items?.length || 0} items) - ₹${opt.total_estimated_value?.toLocaleString() || 0}`}
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              size="small"
                              placeholder={loadingPRs ? 'Loading PRs...' : 'Select PR...'}
                              error={!!rfqFieldErrors.pr_id}
                              helperText={rfqFieldErrors.pr_id}
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
                          noOptionsText="No pending PRs found"
                        />
                      </Box>
                    </Grid>

                    <Grid size={{ xs: 12, md: 6 }}>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                        <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary, letterSpacing: '0.5px' }}>
                          VALID TILL <span style={{ color: '#EF4444' }}>*</span>
                        </Typography>
                        <TextField
                          fullWidth
                          size="small"
                          type="date"
                          name="valid_till"
                          value={rfqFormData.valid_till}
                          onChange={handleRfqFormChange}
                          onBlur={handleRfqBlur}
                          required
                          disabled={rfqLoading}
                          error={!!rfqFieldErrors.valid_till}
                          helperText={rfqFieldErrors.valid_till}
                          InputLabelProps={{ shrink: true }}
                          inputProps={{ min: today }}
                          sx={textFieldSx}
                        />
                      </Box>
                    </Grid>

                    <Grid size={{ xs: 12, md: 6 }}>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                        <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary, letterSpacing: '0.5px' }}>
                          SELECT VENDORS <span style={{ color: '#EF4444' }}>*</span>
                        </Typography>
                        <Autocomplete
                          multiple
                          options={vendors}
                          loading={loadingVendors}
                          value={selectedRfqVendorObjects}
                          onChange={handleRfqVendorSelect}
                          getOptionLabel={(opt) => `${opt.vendor_code} - ${opt.vendor_name}`}
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              size="small"
                              placeholder="Select vendors..."
                              error={!!rfqFieldErrors.vendor_ids}
                              helperText={rfqFieldErrors.vendor_ids}
                              sx={textFieldSx}
                            />
                          )}
                          renderTags={(value, getTagProps) =>
                            value.map((option, index) => (
                              <Chip
                                key={option._id}
                                label={`${option.vendor_code} - ${option.vendor_name}`}
                                size="small"
                                {...getTagProps({ index })}
                                sx={{ fontSize: '0.7rem', height: 24 }}
                              />
                            ))
                          }
                          PaperComponent={CustomPaper}
                          noOptionsText="No vendors found"
                        />
                      </Box>
                    </Grid>

                    {selectedRfqPR && selectedRfqPR.items && selectedRfqPR.items.length > 0 && (
                      <Grid size={{ xs: 12 }}>
                        <Divider sx={{ my: 1 }} />
                        <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.primary, mb: 1 }}>
                          Items from PR
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
                              {selectedRfqPR.items.map((item, idx) => (
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
                      </Grid>
                    )}
                  </Grid>

                  {rfqError && (
                    <Alert severity="error" sx={{ mt: 2, borderRadius: 1.5, fontSize: '0.75rem', py: 0.5 }}>
                      {rfqError}
                    </Alert>
                  )}

                  <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                    <Button
                      onClick={() => {
                        setShowRfqForm(false);
                        setRfqError('');
                        setRfqFormData({
                          pr_id: '',
                          valid_till: '',
                          vendor_ids: []
                        });
                        setSelectedRfqPR(null);
                        setSelectedRfqVendors([]);
                        setRfqFieldErrors({});
                        setRfqTouched({});
                      }}
                      disabled={rfqLoading}
                      size="small"
                      sx={cancelButtonSx}
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="contained"
                      onClick={saveRfq}
                      disabled={rfqLoading || !rfqFormData.pr_id || !rfqFormData.valid_till || rfqFormData.vendor_ids.length === 0}
                      size="small"
                      startIcon={<AddIcon sx={{ fontSize: '1rem' }} />}
                      sx={addButtonSx}
                    >
                      {rfqLoading ? 'Adding...' : 'Add RFQ'}
                    </Button>
                  </Box>
                </Box>
              </Collapse>

              {selectedRfq && selectedRfq.items && selectedRfq.items.length > 0 && (
                <>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="subtitle2" sx={{ color: COLORS.primary, mb: 1.5, fontWeight: 600, fontSize: '0.8rem' }}>
                    Items from RFQ
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
                        {selectedRfq.items.map((item, idx) => (
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

                  {/* Show vendors info */}
                  {selectedRfq.vendors && selectedRfq.vendors.length > 0 && (
                    <Box sx={{ mt: 1.5 }}>
                      <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary, mb: 0.5 }}>
                        Vendors:
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                        {selectedRfq.vendors.map((vendor, idx) => (
                          <Chip
                            key={idx}
                            label={typeof vendor === 'object' ? `${vendor.vendor_code} - ${vendor.vendor_name}` : vendor}
                            size="small"
                            sx={{ fontSize: '0.65rem', height: 22 }}
                          />
                        ))}
                      </Box>
                    </Box>
                  )}
                </>
              )}
            </Paper>
          </Stack>
        );
      
      case 1: // Order Details
        return (
          <Stack spacing={2}>
            <Paper sx={{ p: 2, bgcolor: COLORS.background.white, borderRadius: 1.5, border: `1px solid ${COLORS.border}` }}>
              <Typography variant="subtitle2" sx={{ color: COLORS.primary, mb: 1.5, fontWeight: 600, fontSize: '0.9rem' }}>
                Order Details
              </Typography>
              
              <Grid container spacing={1.5}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                    <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary }}>
                      PO TYPE <span style={{ color: '#EF4444' }}>*</span>
                    </Typography>
                    <FormControl fullWidth size="small" error={!!fieldErrors.po_type}>
                      <Select 
                        name="po_type" 
                        value={formData.po_type} 
                        onChange={handleSelectChange}
                        sx={selectSx}
                      >
                        {poTypes.map(type => (
                          <MenuItem key={type.value} value={type.value} sx={{ fontSize: '0.75rem' }}>{type.label}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Box>
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                    <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary }}>
                      DELIVERY DATE <span style={{ color: '#EF4444' }}>*</span>
                    </Typography>
                    <TextField
                      fullWidth
                      size="small"
                      type="date"
                      name="delivery_date"
                      value={formData.delivery_date}
                      onChange={handleChange}
                      error={!!fieldErrors.delivery_date}
                      helperText={fieldErrors.delivery_date}
                      InputLabelProps={{ shrink: true }}
                      inputProps={{ min: today }}
                      sx={textFieldSx}
                    />
                  </Box>
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                    <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary }}>
                      DELIVERY MODE
                    </Typography>
                    <FormControl fullWidth size="small">
                      <Select 
                        name="delivery_mode" 
                        value={formData.delivery_mode} 
                        onChange={handleSelectChange}
                        sx={selectSx}
                      >
                        <MenuItem value="" sx={{ fontSize: '0.75rem' }}>None</MenuItem>
                        {deliveryModes.map(mode => (
                          <MenuItem key={mode.value} value={mode.value} sx={{ fontSize: '0.75rem' }}>{mode.label}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Box>
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                    <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary }}>
                      FREIGHT TERMS
                    </Typography>
                    <FormControl fullWidth size="small">
                      <Select 
                        name="freight_terms" 
                        value={formData.freight_terms} 
                        onChange={handleSelectChange}
                        sx={selectSx}
                      >
                        <MenuItem value="" sx={{ fontSize: '0.75rem' }}>None</MenuItem>
                        {freightTermsOptions.map(term => (
                          <MenuItem key={term.value} value={term.value} sx={{ fontSize: '0.75rem' }}>{term.label}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Box>
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                    <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary }}>
                      PAYMENT TERMS <span style={{ color: '#EF4444' }}>*</span>
                    </Typography>
                    <FormControl fullWidth size="small" error={!!fieldErrors.payment_terms}>
                      <Select 
                        name="payment_terms" 
                        value={formData.payment_terms} 
                        onChange={handleSelectChange}
                        sx={selectSx}
                      >
                        {paymentTermsOptions.map(term => (
                          <MenuItem key={term} value={term} sx={{ fontSize: '0.75rem' }}>{term}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Box>
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                    <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary }}>
                      INTERNAL REMARKS
                    </Typography>
                    <TextField
                      fullWidth
                      multiline
                      rows={2}
                      size="small"
                      name="internal_remarks"
                      value={formData.internal_remarks}
                      onChange={handleChange}
                      placeholder="Add any internal notes..."
                      sx={textFieldSx}
                    />
                  </Box>
                </Grid>
              </Grid>
            </Paper>

            {selectedRfq && selectedRfq.items && selectedRfq.items.length > 0 && (
              <Paper sx={{ p: 2, bgcolor: COLORS.background.white, borderRadius: 1.5, border: `1px solid ${COLORS.border}` }}>
                <Typography variant="subtitle2" sx={{ color: COLORS.primary, mb: 1.5, fontWeight: 600, fontSize: '0.8rem' }}>
                  Items Summary
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
                      {selectedRfq.items.map((item, idx) => (
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

                {/* Show vendors info */}
                {selectedRfq.vendors && selectedRfq.vendors.length > 0 && (
                  <Box sx={{ mt: 1.5 }}>
                    <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary, mb: 0.5 }}>
                      Vendors:
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                      {selectedRfq.vendors.map((vendor, idx) => (
                        <Chip
                          key={idx}
                          label={typeof vendor === 'object' ? `${vendor.vendor_code} - ${vendor.vendor_name}` : vendor}
                          size="small"
                          sx={{ fontSize: '0.65rem', height: 22 }}
                        />
                      ))}
                    </Box>
                  </Box>
                )}
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
          Create Purchase Order
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
              disabled={loading || !formData.rfq_id || !formData.delivery_date || !formData.payment_terms}
              startIcon={loading ? null : <SendIcon sx={{ fontSize: '1rem' }} />}
              sx={addButtonSx}
            >
              {loading ? 'Creating...' : 'Create PO'}
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
  );
};

export default AddPurchaseOrder;