// // AddGRN.js
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
//   IconButton,
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
//   Save as SaveIcon,
//   Delete as DeleteIcon,
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

// const steps = ['Select PO', 'Receipt Details', 'Items Received'];

// const AddGRN = ({ open, onClose, onAdd }) => {
//   const [activeStep, setActiveStep] = useState(0);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState('');
//   const [pos, setPos] = useState([]);
//   const [loadingPos, setLoadingPos] = useState(false);
//   const [selectedPO, setSelectedPO] = useState(null);
//   const [poItems, setPoItems] = useState([]);
//   const [warehouses, setWarehouses] = useState([]);
//   const [loadingWarehouses, setLoadingWarehouses] = useState(false);
//   const [selectedWarehouse, setSelectedWarehouse] = useState(null);
//   const [formData, setFormData] = useState({
//     po_id: '',
//     vehicle_no: '',
//     lr_number: '',
//     lr_date: '',
//     transporter_name: '',
//     vendor_invoice_no: '',
//     vendor_invoice_date: '',
//     receiving_store: '',
//     items: [],
//     remarks: ''
//   });
//   const [fieldErrors, setFieldErrors] = useState({});

//   // Fetch POs that are sent or acknowledged (eligible for GRN)
//   useEffect(() => {
//     if (open) {
//       fetchEligiblePOs();
//       fetchWarehouses();
//     }
//   }, [open]);

//   const fetchEligiblePOs = async () => {
//     try {
//       setLoadingPos(true);
//       const token = localStorage.getItem('token');
//       const response = await axios.get(`${BASE_URL}/api/purchase-orders`, {
//         headers: { 'Authorization': `Bearer ${token}` }
//       });
//       if (response.data.success) {
//         const eligiblePos = response.data.data.filter(po => 
//           po.status === 'Sent' || po.status === 'Acknowledged' || po.status === 'Partially Received'
//         );
//         setPos(eligiblePos);
//       }
//     } catch (err) {
//       console.error('Error fetching POs:', err);
//     } finally {
//       setLoadingPos(false);
//     }
//   };

//   const fetchWarehouses = async () => {
//     try {
//       setLoadingWarehouses(true);
//       const token = localStorage.getItem('token');
//       const response = await axios.get(`${BASE_URL}/api/warehouses`, {
//         headers: { 'Authorization': `Bearer ${token}` }
//       });
//       if (response.data.success) {
//         // Filter only active warehouses that can receive material
//         const eligibleWarehouses = response.data.data.filter(wh => 
//           wh.is_active === true && 
//           ['Raw Material', 'Consumable', 'Tool', 'Subcontract', 'Quarantine'].includes(wh.warehouse_type)
//         );
//         setWarehouses(eligibleWarehouses);
//       }
//     } catch (err) {
//       console.error('Error fetching warehouses:', err);
//     } finally {
//       setLoadingWarehouses(false);
//     }
//   };

//   const handlePOChange = (event, value) => {
//     setSelectedPO(value);
//     setFormData(prev => ({ ...prev, po_id: value?._id || '' }));
//     setFieldErrors(prev => ({ ...prev, po_id: '' }));
    
//     if (value && value.items) {
//       const initialItems = value.items.map(item => ({
//         po_item_id: item._id,
//         item_id: item.item_id,
//         part_no: item.part_no,
//         description: item.description,
//         unit: item.unit,
//         ordered_qty: item.ordered_qty,
//         received_qty: '',
//         batch_no: '',
//         heat_no: '',
//         storage_location: ''
//       }));
//       setPoItems(initialItems);
//       setFormData(prev => ({ ...prev, items: initialItems }));
//     } else {
//       setPoItems([]);
//       setFormData(prev => ({ ...prev, items: [] }));
//     }
//   };

//   const handleWarehouseChange = (event, value) => {
//     setSelectedWarehouse(value);
//     setFormData(prev => ({ ...prev, receiving_store: value?._id || '' }));
//     setFieldErrors(prev => ({ ...prev, receiving_store: '' }));
//   };

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFieldErrors(prev => ({ ...prev, [name]: '' }));
//     setFormData(prev => ({ ...prev, [name]: value }));
//   };

//   const handleItemChange = (index, field, value) => {
//     const updatedItems = [...poItems];
//     updatedItems[index][field] = value;
//     setPoItems(updatedItems);
//     setFormData(prev => ({ ...prev, items: updatedItems }));
//     setFieldErrors(prev => ({ ...prev, [`item_${index}_${field}`]: '' }));
//   };

//   const validateStep = (step) => {
//     const errors = {};
//     let isValid = true;

//     switch (step) {
//       case 0: // Select PO
//         if (!formData.po_id) {
//           errors.po_id = 'Purchase Order is required';
//           isValid = false;
//         }
//         break;
//       case 1: // Receipt Details
//         if (!formData.vehicle_no) {
//           errors.vehicle_no = 'Vehicle number is required';
//           isValid = false;
//         }
//         if (!formData.lr_number) {
//           errors.lr_number = 'LR number is required';
//           isValid = false;
//         }
//         if (!formData.lr_date) {
//           errors.lr_date = 'LR date is required';
//           isValid = false;
//         }
//         if (!formData.transporter_name) {
//           errors.transporter_name = 'Transporter name is required';
//           isValid = false;
//         }
//         if (!formData.vendor_invoice_no) {
//           errors.vendor_invoice_no = 'Vendor invoice number is required';
//           isValid = false;
//         }
//         if (!formData.vendor_invoice_date) {
//           errors.vendor_invoice_date = 'Vendor invoice date is required';
//           isValid = false;
//         }
//         if (!formData.receiving_store) {
//           errors.receiving_store = 'Receiving store is required';
//           isValid = false;
//         }
//         break;
//       case 2: // Items Received
//         poItems.forEach((item, index) => {
//           if (!item.received_qty) {
//             errors[`item_${index}_received_qty`] = 'Received quantity is required';
//             isValid = false;
//           } else if (item.received_qty <= 0) {
//             errors[`item_${index}_received_qty`] = 'Received quantity must be greater than 0';
//             isValid = false;
//           } else if (item.received_qty > item.ordered_qty) {
//             errors[`item_${index}_received_qty`] = 'Cannot exceed ordered quantity';
//             isValid = false;
//           }
//         });
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
//     if (!validateStep(2)) return;

//     setLoading(true);
//     setError('');

//     try {
//       const token = localStorage.getItem('token');
//       const user = JSON.parse(localStorage.getItem('user') || '{}');
      
//       const submissionData = {
//         po_id: formData.po_id,
//         vehicle_no: formData.vehicle_no,
//         lr_number: formData.lr_number,
//         lr_date: formData.lr_date,
//         transporter_name: formData.transporter_name,
//         vendor_invoice_no: formData.vendor_invoice_no,
//         vendor_invoice_date: formData.vendor_invoice_date,
//         receiving_store: formData.receiving_store, // This is the Warehouse ObjectId
//         items: formData.items.map(item => ({
//           po_item_id: item.po_item_id,
//           received_qty: parseFloat(item.received_qty),
//           batch_no: item.batch_no || '',
//           heat_no: item.heat_no || '',
//           storage_location: item.storage_location || ''
//         })),
//         remarks: formData.remarks || '',
//         received_by: user._id
//       };

//       const response = await axios.post(`${BASE_URL}/api/grns`, submissionData, {
//         headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
//       });

//       if (response.data.success) {
//         onAdd(response.data.data);
//         resetForm();
//         onClose();
//       } else {
//         setError(response.data.message || 'Failed to create GRN');
//       }
//     } catch (err) {
//       console.error('Error creating GRN:', err);
//       setError(err.response?.data?.message || 'Failed to create GRN');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const resetForm = () => {
//     setFormData({
//       po_id: '',
//       vehicle_no: '',
//       lr_number: '',
//       lr_date: '',
//       transporter_name: '',
//       vendor_invoice_no: '',
//       vendor_invoice_date: '',
//       receiving_store: '',
//       items: [],
//       remarks: ''
//     });
//     setSelectedPO(null);
//     setSelectedWarehouse(null);
//     setPoItems([]);
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
//       case 0: // Select PO
//         return (
//           <Stack spacing={2}>
//             <Paper sx={{ p: 2, bgcolor: COLORS.background.white, borderRadius: 1.5, border: `1px solid ${COLORS.border}` }}>
//               <Typography variant="subtitle2" sx={{ color: COLORS.primary, mb: 1.5, fontWeight: 600, fontSize: '0.9rem' }}>
//                 Select Purchase Order
//               </Typography>
              
//               <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//                 <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary }}>
//                   PO <span style={{ color: '#EF4444' }}>*</span>
//                 </Typography>
//                 <Autocomplete
//                   options={pos}
//                   loading={loadingPos}
//                   value={selectedPO}
//                   onChange={handlePOChange}
//                   getOptionLabel={(opt) => `${opt.po_number} - ${opt.vendor_name} (${opt.status})`}
//                   renderInput={(params) => (
//                     <TextField
//                       {...params}
//                       size="small"
//                       placeholder={loadingPos ? 'Loading POs...' : 'Select Purchase Order...'}
//                       error={!!fieldErrors.po_id}
//                       helperText={fieldErrors.po_id}
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
//                         <Typography variant="body2" fontWeight={500} sx={{ fontSize: '0.75rem' }}>{opt.po_number}</Typography>
//                         <Typography variant="caption" sx={{ fontSize: '0.65rem', color: COLORS.text.tertiary }}>
//                           Vendor: {opt.vendor_name} | Status: {opt.status} | Items: {opt.items?.length || 0}
//                         </Typography>
//                       </Box>
//                     </li>
//                   )}
//                 />
//               </Box>

//               {selectedPO && selectedPO.items && selectedPO.items.length > 0 && (
//                 <>
//                   <Divider sx={{ my: 2 }} />
//                   <Typography variant="subtitle2" sx={{ color: COLORS.primary, mb: 1.5, fontWeight: 600, fontSize: '0.8rem' }}>
//                     Items from PO
//                   </Typography>
//                   <TableContainer>
//                     <Table size="small">
//                       <TableHead>
//                         <TableRow sx={{ bgcolor: COLORS.background.light }}>
//                           <TableCell sx={{ fontSize: '0.7rem', fontWeight: 600 }}>Part No</TableCell>
//                           <TableCell sx={{ fontSize: '0.7rem', fontWeight: 600 }}>Description</TableCell>
//                           <TableCell sx={{ fontSize: '0.7rem', fontWeight: 600 }} align="center">Ordered Qty</TableCell>
//                           <TableCell sx={{ fontSize: '0.7rem', fontWeight: 600 }} align="right">Unit</TableCell>
//                         </TableRow>
//                       </TableHead>
//                       <TableBody>
//                         {selectedPO.items.map((item, idx) => (
//                           <TableRow key={idx}>
//                             <TableCell sx={{ fontSize: '0.75rem' }}>{item.part_no}</TableCell>
//                             <TableCell sx={{ fontSize: '0.75rem' }}>{item.description}</TableCell>
//                             <TableCell sx={{ fontSize: '0.75rem' }} align="center">{item.ordered_qty}</TableCell>
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
      
//       case 1: // Receipt Details
//         return (
//           <Stack spacing={2}>
//             <Paper sx={{ p: 2, bgcolor: COLORS.background.white, borderRadius: 1.5, border: `1px solid ${COLORS.border}` }}>
//               <Typography variant="subtitle2" sx={{ color: COLORS.primary, mb: 1.5, fontWeight: 600, fontSize: '0.9rem' }}>
//                 Receipt Details
//               </Typography>
              
//               <Grid container spacing={1.5}>
//                 <Grid size={{ xs: 12, md: 6 }}>
//                   <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//                     <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary }}>
//                       VEHICLE NUMBER <span style={{ color: '#EF4444' }}>*</span>
//                     </Typography>
//                     <TextField
//                       fullWidth
//                       size="small"
//                       name="vehicle_no"
//                       value={formData.vehicle_no}
//                       onChange={handleChange}
//                       error={!!fieldErrors.vehicle_no}
//                       helperText={fieldErrors.vehicle_no}
//                       placeholder="e.g., MH-01-AB-1234"
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
//                       LR NUMBER <span style={{ color: '#EF4444' }}>*</span>
//                     </Typography>
//                     <TextField
//                       fullWidth
//                       size="small"
//                       name="lr_number"
//                       value={formData.lr_number}
//                       onChange={handleChange}
//                       error={!!fieldErrors.lr_number}
//                       helperText={fieldErrors.lr_number}
//                       placeholder="e.g., LR-7890-2026"
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
//                       LR DATE <span style={{ color: '#EF4444' }}>*</span>
//                     </Typography>
//                     <TextField
//                       fullWidth
//                       size="small"
//                       type="date"
//                       name="lr_date"
//                       value={formData.lr_date}
//                       onChange={handleChange}
//                       error={!!fieldErrors.lr_date}
//                       helperText={fieldErrors.lr_date}
//                       InputLabelProps={{ shrink: true }}
//                       inputProps={{ max: today }}
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
//                       TRANSPORTER NAME <span style={{ color: '#EF4444' }}>*</span>
//                     </Typography>
//                     <TextField
//                       fullWidth
//                       size="small"
//                       name="transporter_name"
//                       value={formData.transporter_name}
//                       onChange={handleChange}
//                       error={!!fieldErrors.transporter_name}
//                       helperText={fieldErrors.transporter_name}
//                       placeholder="e.g., ABC Transport Services"
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
//                       VENDOR INVOICE NO <span style={{ color: '#EF4444' }}>*</span>
//                     </Typography>
//                     <TextField
//                       fullWidth
//                       size="small"
//                       name="vendor_invoice_no"
//                       value={formData.vendor_invoice_no}
//                       onChange={handleChange}
//                       error={!!fieldErrors.vendor_invoice_no}
//                       helperText={fieldErrors.vendor_invoice_no}
//                       placeholder="e.g., INV-VED-2026-001"
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
//                       VENDOR INVOICE DATE <span style={{ color: '#EF4444' }}>*</span>
//                     </Typography>
//                     <TextField
//                       fullWidth
//                       size="small"
//                       type="date"
//                       name="vendor_invoice_date"
//                       value={formData.vendor_invoice_date}
//                       onChange={handleChange}
//                       error={!!fieldErrors.vendor_invoice_date}
//                       helperText={fieldErrors.vendor_invoice_date}
//                       InputLabelProps={{ shrink: true }}
//                       inputProps={{ max: today }}
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
//                 <Grid size={{ xs: 12 }}>
//                   <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//                     <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary }}>
//                       RECEIVING STORE / WAREHOUSE <span style={{ color: '#EF4444' }}>*</span>
//                     </Typography>
//                     <Autocomplete
//                       options={warehouses}
//                       loading={loadingWarehouses}
//                       value={selectedWarehouse}
//                       onChange={handleWarehouseChange}
//                       getOptionLabel={(opt) => `${opt.warehouse_id} - ${opt.warehouse_name} (${opt.warehouse_type})`}
//                       renderInput={(params) => (
//                         <TextField
//                           {...params}
//                           size="small"
//                           placeholder={loadingWarehouses ? 'Loading warehouses...' : 'Select receiving warehouse...'}
//                           error={!!fieldErrors.receiving_store}
//                           helperText={fieldErrors.receiving_store}
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
//                           <Box sx={{ width: '100%' }}>
//                             <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
//                               <Typography variant="body2" fontWeight={500} sx={{ fontSize: '0.75rem' }}>
//                                 {opt.warehouse_id} - {opt.warehouse_name}
//                               </Typography>
//                               <Chip 
//                                 label={opt.warehouse_type} 
//                                 size="small"
//                                 sx={{ 
//                                   fontSize: '0.6rem', 
//                                   height: 20,
//                                   bgcolor: opt.warehouse_type === 'Raw Material' ? '#E8F0F1' : '#F0FDF9',
//                                   color: COLORS.primary
//                                 }}
//                               />
//                             </Box>
//                             <Typography variant="caption" sx={{ fontSize: '0.65rem', color: COLORS.text.tertiary }}>
//                               Location: {opt.location || 'Not specified'} | Bins: {opt.active_bins || opt.bins?.length || 0}
//                             </Typography>
//                           </Box>
//                         </li>
//                       )}
//                       renderTags={() => null}
//                     />
//                     {selectedWarehouse && selectedWarehouse.bins && selectedWarehouse.bins.length > 0 && (
//                       <Box sx={{ mt: 1, p: 1, bgcolor: COLORS.background.light, borderRadius: 1 }}>
//                         <Typography variant="caption" sx={{ fontSize: '0.65rem', color: COLORS.text.secondary }}>
//                           Available Bins: {selectedWarehouse.bins.filter(b => b.is_active).map(b => b.bin_code).join(', ')}
//                         </Typography>
//                       </Box>
//                     )}
//                   </Box>
//                 </Grid>
//               </Grid>
//             </Paper>
//           </Stack>
//         );
      
//       case 2: // Items Received
//         return (
//           <Stack spacing={2}>
//             <Paper sx={{ p: 2, bgcolor: COLORS.background.white, borderRadius: 1.5, border: `1px solid ${COLORS.border}` }}>
//               <Typography variant="subtitle2" sx={{ color: COLORS.primary, mb: 1.5, fontWeight: 600, fontSize: '0.9rem' }}>
//                 Items Received
//               </Typography>
              
//               <TableContainer sx={{ maxHeight: 400 }}>
//                 <Table size="small" stickyHeader>
//                   <TableHead>
//                     <TableRow sx={{ bgcolor: COLORS.background.light }}>
//                       <TableCell sx={{ fontSize: '0.7rem', fontWeight: 600, bgcolor: COLORS.background.light }}>Part No</TableCell>
//                       <TableCell sx={{ fontSize: '0.7rem', fontWeight: 600, bgcolor: COLORS.background.light }}>Description</TableCell>
//                       <TableCell sx={{ fontSize: '0.7rem', fontWeight: 600, bgcolor: COLORS.background.light }} align="center">Ordered</TableCell>
//                       <TableCell sx={{ fontSize: '0.7rem', fontWeight: 600, bgcolor: COLORS.background.light }} align="center">Unit</TableCell>
//                       <TableCell sx={{ fontSize: '0.7rem', fontWeight: 600, bgcolor: COLORS.background.light }} align="center">Received <span style={{ color: '#EF4444' }}>*</span></TableCell>
//                       <TableCell sx={{ fontSize: '0.7rem', fontWeight: 600, bgcolor: COLORS.background.light }}>Batch No</TableCell>
//                       <TableCell sx={{ fontSize: '0.7rem', fontWeight: 600, bgcolor: COLORS.background.light }}>Heat No</TableCell>
//                       <TableCell sx={{ fontSize: '0.7rem', fontWeight: 600, bgcolor: COLORS.background.light }}>Storage Location</TableCell>
//                     </TableRow>
//                   </TableHead>
//                   <TableBody>
//                     {poItems.map((item, index) => (
//                       <TableRow key={index}>
//                         <TableCell sx={{ fontSize: '0.75rem' }}>{item.part_no}</TableCell>
//                         <TableCell sx={{ fontSize: '0.75rem' }}>{item.description}</TableCell>
//                         <TableCell sx={{ fontSize: '0.75rem' }} align="center">{item.ordered_qty}</TableCell>
//                         <TableCell sx={{ fontSize: '0.75rem' }} align="center">{item.unit}</TableCell>
//                         <TableCell align="center">
//                           <TextField
//                             size="small"
//                             type="number"
//                             placeholder="Qty"
//                             value={item.received_qty}
//                             onChange={(e) => handleItemChange(index, 'received_qty', e.target.value)}
//                             error={!!fieldErrors[`item_${index}_received_qty`]}
//                             helperText={fieldErrors[`item_${index}_received_qty`]}
//                             inputProps={{ min: 0, max: item.ordered_qty, step: 1 }}
//                             sx={{ width: 80, '& .MuiInputBase-input': { fontSize: '0.75rem', py: 0.75 } }}
//                           />
//                         </TableCell>
//                         <TableCell>
//                           <TextField
//                             size="small"
//                             placeholder="Batch No"
//                             value={item.batch_no}
//                             onChange={(e) => handleItemChange(index, 'batch_no', e.target.value)}
//                             sx={{ width: 100, '& .MuiInputBase-input': { fontSize: '0.75rem', py: 0.75 } }}
//                           />
//                         </TableCell>
//                         <TableCell>
//                           <TextField
//                             size="small"
//                             placeholder="Heat No"
//                             value={item.heat_no}
//                             onChange={(e) => handleItemChange(index, 'heat_no', e.target.value)}
//                             sx={{ width: 100, '& .MuiInputBase-input': { fontSize: '0.75rem', py: 0.75 } }}
//                           />
//                         </TableCell>
//                         <TableCell>
//                           {selectedWarehouse && selectedWarehouse.bins && selectedWarehouse.bins.length > 0 ? (
//                             <Autocomplete
//                               options={selectedWarehouse.bins.filter(b => b.is_active)}
//                               value={selectedWarehouse.bins.find(b => b.bin_id === item.storage_location) || null}
//                               onChange={(e, newValue) => {
//                                 handleItemChange(index, 'storage_location', newValue?.bin_id || '');
//                               }}
//                               getOptionLabel={(opt) => `${opt.bin_code} (${opt.bin_id})`}
//                               size="small"
//                               renderInput={(params) => (
//                                 <TextField
//                                   {...params}
//                                   placeholder="Select bin"
//                                   size="small"
//                                   sx={{ width: 120, '& .MuiInputBase-input': { fontSize: '0.75rem', py: 0.75 } }}
//                                 />
//                               )}
//                               renderOption={(props, opt) => (
//                                 <li {...props}>
//                                   <Box>
//                                     <Typography variant="body2" sx={{ fontSize: '0.7rem' }}>{opt.bin_code}</Typography>
//                                     <Typography variant="caption" sx={{ fontSize: '0.6rem', color: COLORS.text.tertiary }}>
//                                       Capacity: {opt.capacity || 'Unlimited'} | Rack: {opt.rack || '-'}
//                                     </Typography>
//                                   </Box>
//                                 </li>
//                               )}
//                             />
//                           ) : (
//                             <TextField
//                               size="small"
//                               placeholder="Location"
//                               value={item.storage_location}
//                               onChange={(e) => handleItemChange(index, 'storage_location', e.target.value)}
//                               sx={{ width: 120, '& .MuiInputBase-input': { fontSize: '0.75rem', py: 0.75 } }}
//                             />
//                           )}
//                         </TableCell>
//                       </TableRow>
//                     ))}
//                   </TableBody>
//                 </Table>
//               </TableContainer>

//               <Divider sx={{ my: 2 }} />
              
//               <Typography variant="subtitle2" sx={{ color: COLORS.primary, mb: 1.5, fontWeight: 600, fontSize: '0.8rem' }}>
//                 Remarks
//               </Typography>
//               <TextField
//                 fullWidth
//                 multiline
//                 rows={2}
//                 size="small"
//                 name="remarks"
//                 value={formData.remarks}
//                 onChange={handleChange}
//                 placeholder="Enter any remarks about the received goods..."
//                 sx={{
//                   '& .MuiOutlinedInput-root': {
//                     borderRadius: 1.5,
//                     fontSize: '0.75rem',
//                     '&:hover fieldset': { borderColor: COLORS.primary },
//                     '&.Mui-focused fieldset': { borderColor: COLORS.primary, borderWidth: 1 }
//                   },
//                   '& .MuiInputBase-input': { py: 1, px: 1.5, fontSize: '0.75rem' }
//                 }}
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
//           Create Goods Receipt Note
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
//               disabled={loading || !formData.po_id || !formData.receiving_store}
//               startIcon={loading ? null : <SaveIcon sx={{ fontSize: '1rem' }} />}
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
//               {loading ? 'Creating...' : 'Create GRN'}
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

// export default AddGRN;

// AddGRN.js
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
  IconButton,
  Stepper,
  Step,
  StepLabel,
  StepConnector,
  stepConnectorClasses,
  styled,
  Collapse
} from '@mui/material';
import { 
  Add as AddIcon,
  Close as CloseIcon,
  Save as SaveIcon,
  Delete as DeleteIcon,
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

const steps = ['Select PO', 'Receipt Details', 'Items Received'];

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

const AddGRN = ({ open, onClose, onAdd }) => {
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [pos, setPos] = useState([]);
  const [loadingPos, setLoadingPos] = useState(false);
  const [selectedPO, setSelectedPO] = useState(null);
  const [poItems, setPoItems] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [loadingWarehouses, setLoadingWarehouses] = useState(false);
  const [selectedWarehouse, setSelectedWarehouse] = useState(null);

  // State for inline Add PO form
  const [showPOForm, setShowPOForm] = useState(false);
  const [poFormData, setPoFormData] = useState({
    rfq_id: '',
    po_type: 'Regular',
    delivery_date: '',
    delivery_mode: '',
    freight_terms: '',
    payment_terms: '',
    internal_remarks: ''
  });
  const [poFieldErrors, setPoFieldErrors] = useState({});
  const [poTouched, setPoTouched] = useState({});
  const [poLoading, setPoLoading] = useState(false);
  const [poError, setPoError] = useState('');
  const [rfqs, setRfqs] = useState([]);
  const [loadingRfqs, setLoadingRfqs] = useState(false);
  const [selectedRfqForPO, setSelectedRfqForPO] = useState(null);
  const [vendorsForPO, setVendorsForPO] = useState([]);
  const [loadingVendorsForPO, setLoadingVendorsForPO] = useState(false);

  // PO Types
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

  // Fetch POs that are sent or acknowledged (eligible for GRN)
  useEffect(() => {
    if (open) {
      fetchEligiblePOs();
      fetchWarehouses();
      fetchEligibleRFQs();
      fetchVendorsForPO();
    }
  }, [open]);

  const fetchEligiblePOs = async () => {
    try {
      setLoadingPos(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(`${BASE_URL}/api/purchase-orders`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.data.success) {
        const eligiblePos = response.data.data.filter(po => 
          po.status === 'Sent' || po.status === 'Acknowledged' || po.status === 'Partially Received'
        );
        setPos(eligiblePos);
      }
    } catch (err) {
      console.error('Error fetching POs:', err);
    } finally {
      setLoadingPos(false);
    }
  };

  const fetchWarehouses = async () => {
    try {
      setLoadingWarehouses(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(`${BASE_URL}/api/warehouses`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.data.success) {
        const eligibleWarehouses = response.data.data.filter(wh => 
          wh.is_active === true && 
          ['Raw Material', 'Consumable', 'Tool', 'Subcontract', 'Quarantine'].includes(wh.warehouse_type)
        );
        setWarehouses(eligibleWarehouses);
      }
    } catch (err) {
      console.error('Error fetching warehouses:', err);
    } finally {
      setLoadingWarehouses(false);
    }
  };

  const fetchEligibleRFQs = async () => {
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

  const fetchVendorsForPO = async () => {
    try {
      setLoadingVendorsForPO(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(`${BASE_URL}/api/vendors`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.data.success) {
        setVendorsForPO(response.data.data || []);
      }
    } catch (err) {
      console.error('Error fetching vendors:', err);
    } finally {
      setLoadingVendorsForPO(false);
    }
  };

  // ======================== PO FORM HANDLERS ========================

  const handlePOFormChange = (e) => {
    const { name, value } = e.target;
    setPoFieldErrors(prev => ({ ...prev, [name]: '' }));
    setPoFormData(prev => ({ ...prev, [name]: value }));

    if (poTouched[name] || value) {
      const errorMessage = validatePOField(name, value);
      setPoFieldErrors(prev => ({ ...prev, [name]: errorMessage }));
    }
  };

  const handlePOFormSelectChange = (e) => {
    const { name, value } = e.target;
    setPoFieldErrors(prev => ({ ...prev, [name]: '' }));
    setPoFormData(prev => ({ ...prev, [name]: value }));

    if (poTouched[name] || value) {
      const errorMessage = validatePOField(name, value);
      setPoFieldErrors(prev => ({ ...prev, [name]: errorMessage }));
    }
  };

  const handleRfqForPOChange = (event, value) => {
    setSelectedRfqForPO(value);
    setPoFormData(prev => ({ ...prev, rfq_id: value?._id || '' }));
    setPoFieldErrors(prev => ({ ...prev, rfq_id: '' }));
  };

  const handlePOBlur = (e) => {
    const { name, value } = e.target;
    setPoTouched(prev => ({ ...prev, [name]: true }));
    const errorMessage = validatePOField(name, value);
    setPoFieldErrors(prev => ({ ...prev, [name]: errorMessage }));
  };

  const validatePOField = (name, value) => {
    switch (name) {
      case 'rfq_id':
        if (!value) return 'RFQ is required';
        return '';
      case 'po_type':
        if (!value) return 'PO type is required';
        return '';
      case 'delivery_date':
        if (!value) return 'Delivery date is required';
        return '';
      case 'payment_terms':
        if (!value) return 'Payment terms are required';
        return '';
      default:
        return '';
    }
  };

  const validatePOForm = () => {
    const errors = {};
    let isValid = true;

    if (!poFormData.rfq_id) {
      errors.rfq_id = 'RFQ is required';
      isValid = false;
    }
    if (!poFormData.po_type) {
      errors.po_type = 'PO type is required';
      isValid = false;
    }
    if (!poFormData.delivery_date) {
      errors.delivery_date = 'Delivery date is required';
      isValid = false;
    }
    if (!poFormData.payment_terms) {
      errors.payment_terms = 'Payment terms are required';
      isValid = false;
    }

    setPoFieldErrors(errors);
    if (!isValid) {
      setPoError('Please fix the errors above');
    }
    return isValid;
  };

  const savePO = async () => {
    if (!validatePOForm()) return;

    setPoLoading(true);
    setPoError('');

    try {
      const token = localStorage.getItem('token');
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      
      const submissionData = {
        rfq_id: poFormData.rfq_id,
        po_type: poFormData.po_type,
        delivery_date: poFormData.delivery_date,
        delivery_mode: poFormData.delivery_mode || null,
        freight_terms: poFormData.freight_terms || null,
        payment_terms: poFormData.payment_terms,
        internal_remarks: poFormData.internal_remarks || '',
        created_by: user._id
      };

      const response = await axios.post(`${BASE_URL}/api/purchase-orders`, submissionData, {
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
      });

      if (response.data.success) {
        const newPO = response.data.data;
        setPos(prev => [...prev, newPO]);
        setSelectedPO(newPO);
        setFormData(prev => ({ ...prev, po_id: newPO._id }));
        
        // Set PO items
        if (newPO.items) {
          const initialItems = newPO.items.map(item => ({
            po_item_id: item._id,
            item_id: item.item_id,
            part_no: item.part_no,
            description: item.description,
            unit: item.unit,
            ordered_qty: item.ordered_qty,
            received_qty: '',
            batch_no: '',
            heat_no: '',
            storage_location: ''
          }));
          setPoItems(initialItems);
          setFormData(prev => ({ ...prev, items: initialItems }));
        }

        // Reset PO form
        setPoFormData({
          rfq_id: '',
          po_type: 'Regular',
          delivery_date: '',
          delivery_mode: '',
          freight_terms: '',
          payment_terms: '',
          internal_remarks: ''
        });
        setSelectedRfqForPO(null);
        setPoFieldErrors({});
        setPoTouched({});
        setPoError('');
        setShowPOForm(false);
      }
    } catch (err) {
      setPoError(err.response?.data?.message || 'Failed to create Purchase Order');
    } finally {
      setPoLoading(false);
    }
  };

  const handlePOChange = (event, value) => {
    setSelectedPO(value);
    setFormData(prev => ({ ...prev, po_id: value?._id || '' }));
    setFieldErrors(prev => ({ ...prev, po_id: '' }));
    
    if (value && value.items) {
      const initialItems = value.items.map(item => ({
        po_item_id: item._id,
        item_id: item.item_id,
        part_no: item.part_no,
        description: item.description,
        unit: item.unit,
        ordered_qty: item.ordered_qty,
        received_qty: '',
        batch_no: '',
        heat_no: '',
        storage_location: ''
      }));
      setPoItems(initialItems);
      setFormData(prev => ({ ...prev, items: initialItems }));
    } else {
      setPoItems([]);
      setFormData(prev => ({ ...prev, items: [] }));
    }
  };

  const handleWarehouseChange = (event, value) => {
    setSelectedWarehouse(value);
    setFormData(prev => ({ ...prev, receiving_store: value?._id || '' }));
    setFieldErrors(prev => ({ ...prev, receiving_store: '' }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFieldErrors(prev => ({ ...prev, [name]: '' }));
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleItemChange = (index, field, value) => {
    const updatedItems = [...poItems];
    updatedItems[index][field] = value;
    setPoItems(updatedItems);
    setFormData(prev => ({ ...prev, items: updatedItems }));
    setFieldErrors(prev => ({ ...prev, [`item_${index}_${field}`]: '' }));
  };

  const [formData, setFormData] = useState({
    po_id: '',
    vehicle_no: '',
    lr_number: '',
    lr_date: '',
    transporter_name: '',
    vendor_invoice_no: '',
    vendor_invoice_date: '',
    receiving_store: '',
    items: [],
    remarks: ''
  });
  const [fieldErrors, setFieldErrors] = useState({});

  const validateStep = (step) => {
    const errors = {};
    let isValid = true;

    switch (step) {
      case 0: // Select PO
        if (!formData.po_id) {
          errors.po_id = 'Purchase Order is required';
          isValid = false;
        }
        break;
      case 1: // Receipt Details
        if (!formData.vehicle_no) {
          errors.vehicle_no = 'Vehicle number is required';
          isValid = false;
        }
        if (!formData.lr_number) {
          errors.lr_number = 'LR number is required';
          isValid = false;
        }
        if (!formData.lr_date) {
          errors.lr_date = 'LR date is required';
          isValid = false;
        }
        if (!formData.transporter_name) {
          errors.transporter_name = 'Transporter name is required';
          isValid = false;
        }
        if (!formData.vendor_invoice_no) {
          errors.vendor_invoice_no = 'Vendor invoice number is required';
          isValid = false;
        }
        if (!formData.vendor_invoice_date) {
          errors.vendor_invoice_date = 'Vendor invoice date is required';
          isValid = false;
        }
        if (!formData.receiving_store) {
          errors.receiving_store = 'Receiving store is required';
          isValid = false;
        }
        break;
      case 2: // Items Received
        poItems.forEach((item, index) => {
          if (!item.received_qty) {
            errors[`item_${index}_received_qty`] = 'Received quantity is required';
            isValid = false;
          } else if (item.received_qty <= 0) {
            errors[`item_${index}_received_qty`] = 'Received quantity must be greater than 0';
            isValid = false;
          } else if (item.received_qty > item.ordered_qty) {
            errors[`item_${index}_received_qty`] = 'Cannot exceed ordered quantity';
            isValid = false;
          }
        });
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
    if (!validateStep(2)) return;

    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      
      const submissionData = {
        po_id: formData.po_id,
        vehicle_no: formData.vehicle_no,
        lr_number: formData.lr_number,
        lr_date: formData.lr_date,
        transporter_name: formData.transporter_name,
        vendor_invoice_no: formData.vendor_invoice_no,
        vendor_invoice_date: formData.vendor_invoice_date,
        receiving_store: formData.receiving_store,
        items: formData.items.map(item => ({
          po_item_id: item.po_item_id,
          received_qty: parseFloat(item.received_qty),
          batch_no: item.batch_no || '',
          heat_no: item.heat_no || '',
          storage_location: item.storage_location || ''
        })),
        remarks: formData.remarks || '',
        received_by: user._id
      };

      const response = await axios.post(`${BASE_URL}/api/grns`, submissionData, {
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
      });

      if (response.data.success) {
        onAdd(response.data.data);
        resetForm();
        onClose();
      } else {
        setError(response.data.message || 'Failed to create GRN');
      }
    } catch (err) {
      console.error('Error creating GRN:', err);
      setError(err.response?.data?.message || 'Failed to create GRN');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      po_id: '',
      vehicle_no: '',
      lr_number: '',
      lr_date: '',
      transporter_name: '',
      vendor_invoice_no: '',
      vendor_invoice_date: '',
      receiving_store: '',
      items: [],
      remarks: ''
    });
    setSelectedPO(null);
    setSelectedWarehouse(null);
    setPoItems([]);
    setFieldErrors({});
    setError('');
    setActiveStep(0);
    setShowPOForm(false);
    setPoFormData({
      rfq_id: '',
      po_type: 'Regular',
      delivery_date: '',
      delivery_mode: '',
      freight_terms: '',
      payment_terms: '',
      internal_remarks: ''
    });
    setSelectedRfqForPO(null);
    setPoFieldErrors({});
    setPoTouched({});
    setPoError('');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const today = new Date().toISOString().split('T')[0];

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
      case 0: // Select PO
        return (
          <Stack spacing={2}>
            <Paper sx={{ p: 2, bgcolor: COLORS.background.white, borderRadius: 1.5, border: `1px solid ${COLORS.border}` }}>
              <Typography variant="subtitle2" sx={{ color: COLORS.primary, mb: 1.5, fontWeight: 600, fontSize: '0.9rem' }}>
                Select Purchase Order
              </Typography>
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary }}>
                  PO <span style={{ color: '#EF4444' }}>*</span>
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
                  <Box sx={{ flex: 1 }}>
                    <Autocomplete
                      options={pos}
                      loading={loadingPos}
                      value={selectedPO}
                      onChange={handlePOChange}
                      getOptionLabel={(opt) => `${opt.po_number} - ${opt.vendor_name} (${opt.status})`}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          size="small"
                          placeholder={loadingPos ? 'Loading POs...' : 'Select Purchase Order...'}
                          error={!!fieldErrors.po_id}
                          helperText={fieldErrors.po_id}
                          sx={textFieldSx}
                        />
                      )}
                      renderOption={(props, opt) => (
                        <li {...props}>
                          <Box>
                            <Typography variant="body2" fontWeight={500} sx={{ fontSize: '0.75rem' }}>{opt.po_number}</Typography>
                            <Typography variant="caption" sx={{ fontSize: '0.65rem', color: COLORS.text.tertiary }}>
                              Vendor: {opt.vendor_name} | Status: {opt.status} | Items: {opt.items?.length || 0}
                            </Typography>
                          </Box>
                        </li>
                      )}
                    />
                  </Box>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => setShowPOForm(!showPOForm)}
                    startIcon={showPOForm ? <CloseIcon sx={{ fontSize: '0.875rem' }} /> : <AddIcon sx={{ fontSize: '0.875rem' }} />}
                    sx={actionButtonSx}
                  >
                    {showPOForm ? 'Cancel' : 'Add New'}
                  </Button>
                </Box>
              </Box>

              {/* Inline Add PO Form */}
              <Collapse in={showPOForm}>
                <Box sx={{ mt: 2, p: 2.5, bgcolor: COLORS.background.light, borderRadius: 2, border: `1px solid ${COLORS.primary}` }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color: COLORS.primary }}>
                      Add New Purchase Order
                    </Typography>
                    <IconButton
                      size="small"
                      onClick={() => {
                        setShowPOForm(false);
                        setPoError('');
                        setPoFormData({
                          rfq_id: '',
                          po_type: 'Regular',
                          delivery_date: '',
                          delivery_mode: '',
                          freight_terms: '',
                          payment_terms: '',
                          internal_remarks: ''
                        });
                        setSelectedRfqForPO(null);
                        setPoFieldErrors({});
                        setPoTouched({});
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
                          SELECT RFQ <span style={{ color: '#EF4444' }}>*</span>
                        </Typography>
                        <Autocomplete
                          options={rfqs}
                          loading={loadingRfqs}
                          value={selectedRfqForPO}
                          onChange={handleRfqForPOChange}
                          getOptionLabel={(opt) => `${opt.rfq_number} - ${opt.pr_id?.pr_number || 'N/A'} (${opt.status})`}
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              size="small"
                              placeholder={loadingRfqs ? 'Loading RFQs...' : 'Select RFQ...'}
                              error={!!poFieldErrors.rfq_id}
                              helperText={poFieldErrors.rfq_id}
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
                          noOptionsText="No eligible RFQs found"
                        />
                      </Box>
                    </Grid>

                    <Grid size={{ xs: 12, md: 6 }}>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                        <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary, letterSpacing: '0.5px' }}>
                          PO TYPE <span style={{ color: '#EF4444' }}>*</span>
                        </Typography>
                        <FormControl fullWidth size="small" error={!!poFieldErrors.po_type}>
                          <Select
                            name="po_type"
                            value={poFormData.po_type}
                            onChange={handlePOFormSelectChange}
                            onBlur={handlePOBlur}
                            disabled={poLoading}
                            displayEmpty
                            sx={selectSx}
                          >
                            <MenuItem value="" disabled sx={{ fontSize: '0.75rem' }}>Select PO type</MenuItem>
                            {poTypes.map(type => (
                              <MenuItem key={type.value} value={type.value} sx={{ fontSize: '0.75rem' }}>{type.label}</MenuItem>
                            ))}
                          </Select>
                          {poFieldErrors.po_type && (
                            <Typography sx={{ fontSize: '0.65rem', color: '#EF4444', mt: 0.25 }}>
                              {poFieldErrors.po_type}
                            </Typography>
                          )}
                        </FormControl>
                      </Box>
                    </Grid>

                    <Grid size={{ xs: 12, md: 6 }}>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                        <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary, letterSpacing: '0.5px' }}>
                          DELIVERY DATE <span style={{ color: '#EF4444' }}>*</span>
                        </Typography>
                        <TextField
                          fullWidth
                          size="small"
                          type="date"
                          name="delivery_date"
                          value={poFormData.delivery_date}
                          onChange={handlePOFormChange}
                          onBlur={handlePOBlur}
                          required
                          disabled={poLoading}
                          error={!!poFieldErrors.delivery_date}
                          helperText={poFieldErrors.delivery_date}
                          InputLabelProps={{ shrink: true }}
                          inputProps={{ min: today }}
                          sx={textFieldSx}
                        />
                      </Box>
                    </Grid>

                    <Grid size={{ xs: 12, md: 6 }}>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                        <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary, letterSpacing: '0.5px' }}>
                          DELIVERY MODE
                        </Typography>
                        <FormControl fullWidth size="small">
                          <Select
                            name="delivery_mode"
                            value={poFormData.delivery_mode}
                            onChange={handlePOFormSelectChange}
                            disabled={poLoading}
                            displayEmpty
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
                        <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary, letterSpacing: '0.5px' }}>
                          FREIGHT TERMS
                        </Typography>
                        <FormControl fullWidth size="small">
                          <Select
                            name="freight_terms"
                            value={poFormData.freight_terms}
                            onChange={handlePOFormSelectChange}
                            disabled={poLoading}
                            displayEmpty
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
                        <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary, letterSpacing: '0.5px' }}>
                          PAYMENT TERMS <span style={{ color: '#EF4444' }}>*</span>
                        </Typography>
                        <FormControl fullWidth size="small" error={!!poFieldErrors.payment_terms}>
                          <Select
                            name="payment_terms"
                            value={poFormData.payment_terms}
                            onChange={handlePOFormSelectChange}
                            onBlur={handlePOBlur}
                            disabled={poLoading}
                            displayEmpty
                            sx={selectSx}
                          >
                            <MenuItem value="" disabled sx={{ fontSize: '0.75rem' }}>Select payment terms</MenuItem>
                            {paymentTermsOptions.map(term => (
                              <MenuItem key={term} value={term} sx={{ fontSize: '0.75rem' }}>{term}</MenuItem>
                            ))}
                          </Select>
                          {poFieldErrors.payment_terms && (
                            <Typography sx={{ fontSize: '0.65rem', color: '#EF4444', mt: 0.25 }}>
                              {poFieldErrors.payment_terms}
                            </Typography>
                          )}
                        </FormControl>
                      </Box>
                    </Grid>

                    <Grid size={{ xs: 12, md: 6 }}>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                        <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary, letterSpacing: '0.5px' }}>
                          INTERNAL REMARKS
                        </Typography>
                        <TextField
                          fullWidth
                          size="small"
                          name="internal_remarks"
                          value={poFormData.internal_remarks}
                          onChange={handlePOFormChange}
                          disabled={poLoading}
                          placeholder="Add any internal notes..."
                          multiline
                          rows={2}
                          sx={textFieldSx}
                        />
                      </Box>
                    </Grid>
                  </Grid>

                  {poError && (
                    <Alert severity="error" sx={{ mt: 2, borderRadius: 1.5, fontSize: '0.75rem', py: 0.5 }}>
                      {poError}
                    </Alert>
                  )}

                  <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                    <Button
                      onClick={() => {
                        setShowPOForm(false);
                        setPoError('');
                        setPoFormData({
                          rfq_id: '',
                          po_type: 'Regular',
                          delivery_date: '',
                          delivery_mode: '',
                          freight_terms: '',
                          payment_terms: '',
                          internal_remarks: ''
                        });
                        setSelectedRfqForPO(null);
                        setPoFieldErrors({});
                        setPoTouched({});
                      }}
                      disabled={poLoading}
                      size="small"
                      sx={cancelButtonSx}
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="contained"
                      onClick={savePO}
                      disabled={poLoading || !poFormData.rfq_id || !poFormData.delivery_date || !poFormData.payment_terms}
                      size="small"
                      startIcon={<AddIcon sx={{ fontSize: '1rem' }} />}
                      sx={addButtonSx}
                    >
                      {poLoading ? 'Adding...' : 'Add PO'}
                    </Button>
                  </Box>
                </Box>
              </Collapse>

              {selectedPO && selectedPO.items && selectedPO.items.length > 0 && (
                <>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="subtitle2" sx={{ color: COLORS.primary, mb: 1.5, fontWeight: 600, fontSize: '0.8rem' }}>
                    Items from PO
                  </Typography>
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow sx={{ bgcolor: COLORS.background.light }}>
                          <TableCell sx={{ fontSize: '0.7rem', fontWeight: 600 }}>Part No</TableCell>
                          <TableCell sx={{ fontSize: '0.7rem', fontWeight: 600 }}>Description</TableCell>
                          <TableCell sx={{ fontSize: '0.7rem', fontWeight: 600 }} align="center">Ordered Qty</TableCell>
                          <TableCell sx={{ fontSize: '0.7rem', fontWeight: 600 }} align="right">Unit</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {selectedPO.items.map((item, idx) => (
                          <TableRow key={idx}>
                            <TableCell sx={{ fontSize: '0.75rem' }}>{item.part_no}</TableCell>
                            <TableCell sx={{ fontSize: '0.75rem' }}>{item.description}</TableCell>
                            <TableCell sx={{ fontSize: '0.75rem' }} align="center">{item.ordered_qty}</TableCell>
                            <TableCell sx={{ fontSize: '0.75rem' }} align="right">{item.unit}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </>
              )}
            </Paper>
          </Stack>
        );
      
      case 1: // Receipt Details
        return (
          <Stack spacing={2}>
            <Paper sx={{ p: 2, bgcolor: COLORS.background.white, borderRadius: 1.5, border: `1px solid ${COLORS.border}` }}>
              <Typography variant="subtitle2" sx={{ color: COLORS.primary, mb: 1.5, fontWeight: 600, fontSize: '0.9rem' }}>
                Receipt Details
              </Typography>
              
              <Grid container spacing={1.5}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                    <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary }}>
                      VEHICLE NUMBER <span style={{ color: '#EF4444' }}>*</span>
                    </Typography>
                    <TextField
                      fullWidth
                      size="small"
                      name="vehicle_no"
                      value={formData.vehicle_no}
                      onChange={handleChange}
                      error={!!fieldErrors.vehicle_no}
                      helperText={fieldErrors.vehicle_no}
                      placeholder="e.g., MH-01-AB-1234"
                      sx={textFieldSx}
                    />
                  </Box>
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                    <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary }}>
                      LR NUMBER <span style={{ color: '#EF4444' }}>*</span>
                    </Typography>
                    <TextField
                      fullWidth
                      size="small"
                      name="lr_number"
                      value={formData.lr_number}
                      onChange={handleChange}
                      error={!!fieldErrors.lr_number}
                      helperText={fieldErrors.lr_number}
                      placeholder="e.g., LR-7890-2026"
                      sx={textFieldSx}
                    />
                  </Box>
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                    <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary }}>
                      LR DATE <span style={{ color: '#EF4444' }}>*</span>
                    </Typography>
                    <TextField
                      fullWidth
                      size="small"
                      type="date"
                      name="lr_date"
                      value={formData.lr_date}
                      onChange={handleChange}
                      error={!!fieldErrors.lr_date}
                      helperText={fieldErrors.lr_date}
                      InputLabelProps={{ shrink: true }}
                      inputProps={{ max: today }}
                      sx={textFieldSx}
                    />
                  </Box>
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                    <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary }}>
                      TRANSPORTER NAME <span style={{ color: '#EF4444' }}>*</span>
                    </Typography>
                    <TextField
                      fullWidth
                      size="small"
                      name="transporter_name"
                      value={formData.transporter_name}
                      onChange={handleChange}
                      error={!!fieldErrors.transporter_name}
                      helperText={fieldErrors.transporter_name}
                      placeholder="e.g., ABC Transport Services"
                      sx={textFieldSx}
                    />
                  </Box>
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                    <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary }}>
                      VENDOR INVOICE NO <span style={{ color: '#EF4444' }}>*</span>
                    </Typography>
                    <TextField
                      fullWidth
                      size="small"
                      name="vendor_invoice_no"
                      value={formData.vendor_invoice_no}
                      onChange={handleChange}
                      error={!!fieldErrors.vendor_invoice_no}
                      helperText={fieldErrors.vendor_invoice_no}
                      placeholder="e.g., INV-VED-2026-001"
                      sx={textFieldSx}
                    />
                  </Box>
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                    <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary }}>
                      VENDOR INVOICE DATE <span style={{ color: '#EF4444' }}>*</span>
                    </Typography>
                    <TextField
                      fullWidth
                      size="small"
                      type="date"
                      name="vendor_invoice_date"
                      value={formData.vendor_invoice_date}
                      onChange={handleChange}
                      error={!!fieldErrors.vendor_invoice_date}
                      helperText={fieldErrors.vendor_invoice_date}
                      InputLabelProps={{ shrink: true }}
                      inputProps={{ max: today }}
                      sx={textFieldSx}
                    />
                  </Box>
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                    <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary }}>
                      RECEIVING STORE / WAREHOUSE <span style={{ color: '#EF4444' }}>*</span>
                    </Typography>
                    <Autocomplete
                      options={warehouses}
                      loading={loadingWarehouses}
                      value={selectedWarehouse}
                      onChange={handleWarehouseChange}
                      getOptionLabel={(opt) => `${opt.warehouse_id} - ${opt.warehouse_name} (${opt.warehouse_type})`}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          size="small"
                          placeholder={loadingWarehouses ? 'Loading warehouses...' : 'Select receiving warehouse...'}
                          error={!!fieldErrors.receiving_store}
                          helperText={fieldErrors.receiving_store}
                          sx={textFieldSx}
                        />
                      )}
                      renderOption={(props, opt) => (
                        <li {...props}>
                          <Box sx={{ width: '100%' }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <Typography variant="body2" fontWeight={500} sx={{ fontSize: '0.75rem' }}>
                                {opt.warehouse_id} - {opt.warehouse_name}
                              </Typography>
                              <Chip 
                                label={opt.warehouse_type} 
                                size="small"
                                sx={{ 
                                  fontSize: '0.6rem', 
                                  height: 20,
                                  bgcolor: opt.warehouse_type === 'Raw Material' ? '#E8F0F1' : '#F0FDF9',
                                  color: COLORS.primary
                                }}
                              />
                            </Box>
                            <Typography variant="caption" sx={{ fontSize: '0.65rem', color: COLORS.text.tertiary }}>
                              Location: {opt.location || 'Not specified'} | Bins: {opt.active_bins || opt.bins?.length || 0}
                            </Typography>
                          </Box>
                        </li>
                      )}
                      renderTags={() => null}
                      PaperComponent={CustomPaper}
                    />
                    {selectedWarehouse && selectedWarehouse.bins && selectedWarehouse.bins.length > 0 && (
                      <Box sx={{ mt: 1, p: 1, bgcolor: COLORS.background.light, borderRadius: 1 }}>
                        <Typography variant="caption" sx={{ fontSize: '0.65rem', color: COLORS.text.secondary }}>
                          Available Bins: {selectedWarehouse.bins.filter(b => b.is_active).map(b => b.bin_code).join(', ')}
                        </Typography>
                      </Box>
                    )}
                  </Box>
                </Grid>
              </Grid>
            </Paper>
          </Stack>
        );
      
      case 2: // Items Received
        return (
          <Stack spacing={2}>
            <Paper sx={{ p: 2, bgcolor: COLORS.background.white, borderRadius: 1.5, border: `1px solid ${COLORS.border}` }}>
              <Typography variant="subtitle2" sx={{ color: COLORS.primary, mb: 1.5, fontWeight: 600, fontSize: '0.9rem' }}>
                Items Received
              </Typography>
              
              <TableContainer sx={{ maxHeight: 400 }}>
                <Table size="small" stickyHeader>
                  <TableHead>
                    <TableRow sx={{ bgcolor: COLORS.background.light }}>
                      <TableCell sx={{ fontSize: '0.7rem', fontWeight: 600, bgcolor: COLORS.background.light }}>Part No</TableCell>
                      <TableCell sx={{ fontSize: '0.7rem', fontWeight: 600, bgcolor: COLORS.background.light }}>Description</TableCell>
                      <TableCell sx={{ fontSize: '0.7rem', fontWeight: 600, bgcolor: COLORS.background.light }} align="center">Ordered</TableCell>
                      <TableCell sx={{ fontSize: '0.7rem', fontWeight: 600, bgcolor: COLORS.background.light }} align="center">Unit</TableCell>
                      <TableCell sx={{ fontSize: '0.7rem', fontWeight: 600, bgcolor: COLORS.background.light }} align="center">Received <span style={{ color: '#EF4444' }}>*</span></TableCell>
                      <TableCell sx={{ fontSize: '0.7rem', fontWeight: 600, bgcolor: COLORS.background.light }}>Batch No</TableCell>
                      <TableCell sx={{ fontSize: '0.7rem', fontWeight: 600, bgcolor: COLORS.background.light }}>Heat No</TableCell>
                      <TableCell sx={{ fontSize: '0.7rem', fontWeight: 600, bgcolor: COLORS.background.light }}>Storage Location</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {poItems.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell sx={{ fontSize: '0.75rem' }}>{item.part_no}</TableCell>
                        <TableCell sx={{ fontSize: '0.75rem' }}>{item.description}</TableCell>
                        <TableCell sx={{ fontSize: '0.75rem' }} align="center">{item.ordered_qty}</TableCell>
                        <TableCell sx={{ fontSize: '0.75rem' }} align="center">{item.unit}</TableCell>
                        <TableCell align="center">
                          <TextField
                            size="small"
                            type="number"
                            placeholder="Qty"
                            value={item.received_qty}
                            onChange={(e) => handleItemChange(index, 'received_qty', e.target.value)}
                            error={!!fieldErrors[`item_${index}_received_qty`]}
                            helperText={fieldErrors[`item_${index}_received_qty`]}
                            inputProps={{ min: 0, max: item.ordered_qty, step: 1 }}
                            sx={{ width: 80, '& .MuiInputBase-input': { fontSize: '0.75rem', py: 0.75 } }}
                          />
                        </TableCell>
                        <TableCell>
                          <TextField
                            size="small"
                            placeholder="Batch No"
                            value={item.batch_no}
                            onChange={(e) => handleItemChange(index, 'batch_no', e.target.value)}
                            sx={{ width: 100, '& .MuiInputBase-input': { fontSize: '0.75rem', py: 0.75 } }}
                          />
                        </TableCell>
                        <TableCell>
                          <TextField
                            size="small"
                            placeholder="Heat No"
                            value={item.heat_no}
                            onChange={(e) => handleItemChange(index, 'heat_no', e.target.value)}
                            sx={{ width: 100, '& .MuiInputBase-input': { fontSize: '0.75rem', py: 0.75 } }}
                          />
                        </TableCell>
                        <TableCell>
                          {selectedWarehouse && selectedWarehouse.bins && selectedWarehouse.bins.length > 0 ? (
                            <Autocomplete
                              options={selectedWarehouse.bins.filter(b => b.is_active)}
                              value={selectedWarehouse.bins.find(b => b.bin_id === item.storage_location) || null}
                              onChange={(e, newValue) => {
                                handleItemChange(index, 'storage_location', newValue?.bin_id || '');
                              }}
                              getOptionLabel={(opt) => `${opt.bin_code} (${opt.bin_id})`}
                              size="small"
                              renderInput={(params) => (
                                <TextField
                                  {...params}
                                  placeholder="Select bin"
                                  size="small"
                                  sx={{ width: 120, '& .MuiInputBase-input': { fontSize: '0.75rem', py: 0.75 } }}
                                />
                              )}
                              renderOption={(props, opt) => (
                                <li {...props}>
                                  <Box>
                                    <Typography variant="body2" sx={{ fontSize: '0.7rem' }}>{opt.bin_code}</Typography>
                                    <Typography variant="caption" sx={{ fontSize: '0.6rem', color: COLORS.text.tertiary }}>
                                      Capacity: {opt.capacity || 'Unlimited'} | Rack: {opt.rack || '-'}
                                    </Typography>
                                  </Box>
                                </li>
                              )}
                              PaperComponent={CustomPaper}
                            />
                          ) : (
                            <TextField
                              size="small"
                              placeholder="Location"
                              value={item.storage_location}
                              onChange={(e) => handleItemChange(index, 'storage_location', e.target.value)}
                              sx={{ width: 120, '& .MuiInputBase-input': { fontSize: '0.75rem', py: 0.75 } }}
                            />
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              <Divider sx={{ my: 2 }} />
              
              <Typography variant="subtitle2" sx={{ color: COLORS.primary, mb: 1.5, fontWeight: 600, fontSize: '0.8rem' }}>
                Remarks
              </Typography>
              <TextField
                fullWidth
                multiline
                rows={2}
                size="small"
                name="remarks"
                value={formData.remarks}
                onChange={handleChange}
                placeholder="Enter any remarks about the received goods..."
                sx={textFieldSx}
              />
            </Paper>
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
          Create Goods Receipt Note
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
              disabled={loading || !formData.po_id || !formData.receiving_store}
              startIcon={loading ? null : <SaveIcon sx={{ fontSize: '1rem' }} />}
              sx={addButtonSx}
            >
              {loading ? 'Creating...' : 'Create GRN'}
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

export default AddGRN;