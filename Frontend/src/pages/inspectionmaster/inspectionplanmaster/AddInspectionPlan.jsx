// import React, { useState, useEffect, useCallback } from 'react';
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
//   InputLabel,
//   Select,
//   MenuItem,
//   Divider,
//   Stepper,
//   Step,
//   StepLabel,
//   StepConnector,
//   stepConnectorClasses,
//   styled,
//   CircularProgress,
//   Chip,
//   InputAdornment,
//   IconButton,
//   Table,
//   TableBody,
//   TableCell,
//   TableContainer,
//   TableHead,
//   TableRow,
//   Autocomplete,
//   Tooltip
// } from '@mui/material';
// import {
//   Add as AddIcon,
//   Delete as DeleteIcon,
//   NavigateNext as NavigateNextIcon,
//   NavigateBefore as NavigateBeforeIcon,
//   Assignment as PlanIcon,
//   Inventory as InventoryIcon,
//   Settings as SettingsIcon,
//   Description as DescriptionIcon,
//   QrCode as QrCodeIcon
// } from '@mui/icons-material';
// import axios from 'axios';
// import BASE_URL from '../../../config/Config';
// import AddItem from '../../master/itemmaster/AddItem';

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

// // Modern Stepper Connector
// const ColorConnector = styled(StepConnector)(({ theme }) => ({
//   [`&.${stepConnectorClasses.active}`]: {
//     [`& .${stepConnectorClasses.line}`]: {
//       backgroundColor: COLORS.primary,
//     },
//   },
//   [`&.${stepConnectorClasses.completed}`]: {
//     [`& .${stepConnectorClasses.line}`]: {
//       backgroundColor: COLORS.primary,
//     },
//   },
//   [`& .${stepConnectorClasses.line}`]: {
//     height: 2,
//     border: 0,
//     backgroundColor: '#eaeaf0',
//     borderRadius: 1,
//   },
// }));

// // Enums
// const PLAN_TYPE_OPTIONS = [
//   'Incoming', 'In-Process', 'Final', 'Pre-Dispatch', 'Customer-Specific', 'Combined'
// ];

// const CHARACTERISTIC_TYPE_OPTIONS = [
//   'Dimensional', 'Visual', 'Functional', 'Material', 'Surface', 'Mechanical', 'Electrical', 'Chemical'
// ];

// const FREQUENCY_OPTIONS = [
//   '100%', 'AQL', 'First Article Only', 'Per Lot', 'Per Shift', 'Per Batch'
// ];

// const steps = ['Plan Details', 'Checkpoints'];

// const AddInspectionPlan = ({ open, onClose, onSuccess, initialData, isEditMode = false }) => {
//   const [activeStep, setActiveStep] = useState(0);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState('');
//   const [fieldErrors, setFieldErrors] = useState({});
  
//   // Data fetching states
//   const [items, setItems] = useState([]);
//   const [gauges, setGauges] = useState([]);
//   const [loadingItems, setLoadingItems] = useState(false);
//   const [loadingGauges, setLoadingGauges] = useState(false);
  
//   // Dialog state for Add Item
//   const [addItemOpen, setAddItemOpen] = useState(false);
//   const [currentItemIndex, setCurrentItemIndex] = useState(null);

//   // Form data
//   const [formData, setFormData] = useState({
//     plan_name: '',
//     plan_code: '',
//     plan_type: '',
//     item_id: '',
//     revision_no: 1,
//     revision_date: '',
//     aql_level: '',
//     sampling_plan: '',
//     instructions: '',
//     checkpoints: []
//   });

//   // Fetch Items (for item_id dropdown)
//   const fetchItems = useCallback(async () => {
//     try {
//       setLoadingItems(true);
//       const token = localStorage.getItem('token');
//       const response = await axios.get(`${BASE_URL}/api/items?limit=100`, {
//         headers: {
//           'Authorization': `Bearer ${token}`
//         }
//       });

//       if (response.data.success) {
//         setItems(response.data.data || []);
//       }
//     } catch (err) {
//       console.error('Error fetching items:', err);
//     } finally {
//       setLoadingItems(false);
//     }
//   }, []);

//   // Fetch Gauges (for gauge_id dropdown)
//   const fetchGauges = useCallback(async () => {
//     try {
//       setLoadingGauges(true);
//       const token = localStorage.getItem('token');
//       const response = await axios.get(`${BASE_URL}/api/gauges?limit=100`, {
//         headers: {
//           'Authorization': `Bearer ${token}`
//         }
//       });

//       if (response.data.success) {
//         setGauges(response.data.data || []);
//       }
//     } catch (err) {
//       console.error('Error fetching gauges:', err);
//     } finally {
//       setLoadingGauges(false);
//     }
//   }, []);

//   // Fetch data when dialog opens
//   useEffect(() => {
//     if (open) {
//       fetchItems();
//       fetchGauges();
//     }
//   }, [open, fetchItems, fetchGauges]);

//   // Handle edit mode - populate form with initial data
//   useEffect(() => {
//     if (isEditMode && initialData && open) {
//       setFormData({
//         plan_name: initialData.plan_name || '',
//         plan_code: initialData.plan_code || '',
//         plan_type: initialData.plan_type || '',
//         item_id: initialData.item_id?._id || initialData.item_id || '',
//         revision_no: initialData.revision_no || 1,
//         revision_date: initialData.revision_date ? initialData.revision_date.split('T')[0] : '',
//         aql_level: initialData.aql_level || '',
//         sampling_plan: initialData.sampling_plan || '',
//         instructions: initialData.instructions || '',
//         checkpoints: (initialData.checkpoints || []).map((cp, index) => ({
//           step_no: cp.sequence || cp.step_no || index + 1,
//           characteristic: cp.characteristic_name || cp.characteristic || '',
//           characteristic_type: cp.characteristic_type || '',
//           specification: cp.specification || '',
//           method: cp.method || '',
//           sample_size: cp.sample_size || '',
//           frequency: cp.frequency || '',
//           gauge_id: cp.gauge_id?._id || cp.gauge_id || '',
//           acceptance_criteria: cp.acceptance_criteria || '',
//           is_critical: cp.is_critical || false,
//           is_significant: cp.is_significant || false,
//           is_spc: cp.is_spc || false,
//           nominal_value: cp.nominal_value || '',
//           upper_tolerance: cp.upper_tolerance || '',
//           lower_tolerance: cp.lower_tolerance || '',
//           unit: cp.unit || '',
//           photo_required: cp.photo_required || false
//         }))
//       });
//     }
//   }, [isEditMode, initialData, open]);

//   // Reset form when dialog closes
//   useEffect(() => {
//     if (!open) {
//       resetForm();
//     }
//   }, [open]);

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData(prev => ({ ...prev, [name]: value }));
//     setFieldErrors(prev => ({ ...prev, [name]: '' }));
//   };

//   const handleCheckpointChange = (index, field, value) => {
//     const updatedCheckpoints = [...formData.checkpoints];
//     updatedCheckpoints[index][field] = value;
//     setFormData(prev => ({ ...prev, checkpoints: updatedCheckpoints }));
//     setFieldErrors(prev => ({ ...prev, [`checkpoint_${index}_${field}`]: '' }));
//   };

//   const addCheckpoint = () => {
//     setFormData(prev => ({
//       ...prev,
//       checkpoints: [
//         ...prev.checkpoints,
//         {
//           step_no: prev.checkpoints.length + 1,
//           characteristic: '',
//           characteristic_type: '',
//           specification: '',
//           method: '',
//           sample_size: '',
//           frequency: '',
//           gauge_id: '',
//           acceptance_criteria: '',
//           is_critical: false,
//           is_significant: false,
//           is_spc: false,
//           nominal_value: '',
//           upper_tolerance: '',
//           lower_tolerance: '',
//           unit: '',
//           photo_required: false
//         }
//       ]
//     }));
//   };

//   const removeCheckpoint = (index) => {
//     if (formData.checkpoints.length > 1) {
//       const updatedCheckpoints = formData.checkpoints.filter((_, i) => i !== index);
//       // Re-sequence step numbers
//       updatedCheckpoints.forEach((cp, idx) => {
//         cp.step_no = idx + 1;
//       });
//       setFormData(prev => ({ ...prev, checkpoints: updatedCheckpoints }));
//     }
//   };

//   // Handle item added from AddItem dialog
//   const handleItemAdded = (newItem) => {
//     setItems(prev => [...prev, newItem]);
    
//     // If we were adding from the item selection, auto-select it
//     if (currentItemIndex !== null) {
//       setFormData(prev => ({ ...prev, item_id: newItem._id }));
//     }
//     setCurrentItemIndex(null);
//   };

//   const openAddItemDialog = () => {
//     setAddItemOpen(true);
//   };

//   const validateStep = (step) => {
//     const errors = {};
//     let isValid = true;

//     switch (step) {
//       case 0: // Plan Details
//         if (!formData.plan_name.trim()) {
//           errors.plan_name = 'Plan name is required';
//           isValid = false;
//         }
//         if (!formData.plan_code) {
//           errors.plan_code = 'Plan code is required';
//           isValid = false;
//         }
//         if (!formData.plan_type) {
//           errors.plan_type = 'Plan type is required';
//           isValid = false;
//         }
//         if (!formData.item_id) {
//           errors.item_id = 'Item is required';
//           isValid = false;
//         }
//         if (!formData.revision_date) {
//           errors.revision_date = 'Revision date is required';
//           isValid = false;
//         }
//         break;
      
//       case 1: // Checkpoints
//         for (let i = 0; i < formData.checkpoints.length; i++) {
//           const cp = formData.checkpoints[i];
//           if (!cp.characteristic) {
//             errors[`checkpoint_${i}_characteristic`] = `Checkpoint ${i + 1}: Characteristic is required`;
//             isValid = false;
//           }
//           if (!cp.characteristic_type) {
//             errors[`checkpoint_${i}_characteristic_type`] = `Checkpoint ${i + 1}: Characteristic type is required`;
//             isValid = false;
//           }
//           if (!cp.specification) {
//             errors[`checkpoint_${i}_specification`] = `Checkpoint ${i + 1}: Specification is required`;
//             isValid = false;
//           }
//           if (!cp.method) {
//             errors[`checkpoint_${i}_method`] = `Checkpoint ${i + 1}: Method is required`;
//             isValid = false;
//           }
//           if (!cp.sample_size) {
//             errors[`checkpoint_${i}_sample_size`] = `Checkpoint ${i + 1}: Sample size is required`;
//             isValid = false;
//           }
//           if (cp.sample_size && cp.sample_size <= 0) {
//             errors[`checkpoint_${i}_sample_size`] = `Checkpoint ${i + 1}: Sample size must be greater than 0`;
//             isValid = false;
//           }
//           if (!cp.frequency) {
//             errors[`checkpoint_${i}_frequency`] = `Checkpoint ${i + 1}: Frequency is required`;
//             isValid = false;
//           }
//           if (!cp.gauge_id) {
//             errors[`checkpoint_${i}_gauge_id`] = `Checkpoint ${i + 1}: Gauge is required`;
//             isValid = false;
//           }
//         }
//         break;
//     }

//     setFieldErrors(errors);
//     if (!isValid) {
//       setError('Please fix the errors in this section');
//     }
//     return isValid;
//   };

//   const validateForm = () => {
//     const errors = {};
//     let isValid = true;

//     if (!formData.plan_name.trim()) {
//       errors.plan_name = 'Plan name is required';
//       isValid = false;
//     }
//     if (!formData.plan_code) {
//       errors.plan_code = 'Plan code is required';
//       isValid = false;
//     }
//     if (!formData.plan_type) {
//       errors.plan_type = 'Plan type is required';
//       isValid = false;
//     }
//     if (!formData.item_id) {
//       errors.item_id = 'Item is required';
//       isValid = false;
//     }
//     if (!formData.revision_date) {
//       errors.revision_date = 'Revision date is required';
//       isValid = false;
//     }

//     for (let i = 0; i < formData.checkpoints.length; i++) {
//       const cp = formData.checkpoints[i];
//       if (!cp.characteristic) {
//         errors[`checkpoint_${i}_characteristic`] = `Checkpoint ${i + 1}: Characteristic is required`;
//         isValid = false;
//       }
//       if (!cp.characteristic_type) {
//         errors[`checkpoint_${i}_characteristic_type`] = `Checkpoint ${i + 1}: Characteristic type is required`;
//         isValid = false;
//       }
//       if (!cp.specification) {
//         errors[`checkpoint_${i}_specification`] = `Checkpoint ${i + 1}: Specification is required`;
//         isValid = false;
//       }
//       if (!cp.method) {
//         errors[`checkpoint_${i}_method`] = `Checkpoint ${i + 1}: Method is required`;
//         isValid = false;
//       }
//       if (!cp.sample_size) {
//         errors[`checkpoint_${i}_sample_size`] = `Checkpoint ${i + 1}: Sample size is required`;
//         isValid = false;
//       }
//       if (!cp.frequency) {
//         errors[`checkpoint_${i}_frequency`] = `Checkpoint ${i + 1}: Frequency is required`;
//         isValid = false;
//       }
//       if (!cp.gauge_id) {
//         errors[`checkpoint_${i}_gauge_id`] = `Checkpoint ${i + 1}: Gauge is required`;
//         isValid = false;
//       }
//     }

//     setFieldErrors(errors);
//     if (!isValid) {
//       setError('Please fix all validation errors');
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
//     if (!validateForm()) {
//       return;
//     }

//     setLoading(true);
//     setError('');

//     try {
//       const token = localStorage.getItem('token');
      
//       const requestData = {
//         plan_name: formData.plan_name,
//         plan_code: formData.plan_code,
//         plan_type: formData.plan_type,
//         item_id: formData.item_id,
//         revision_no: Number(formData.revision_no),
//         revision_date: formData.revision_date,
//         aql_level: formData.aql_level || undefined,
//         sampling_plan: formData.sampling_plan || undefined,
//         instructions: formData.instructions || '',
//         checkpoints: formData.checkpoints.map(cp => ({
//           step_no: cp.step_no,
//           characteristic: cp.characteristic,
//           characteristic_type: cp.characteristic_type,
//           specification: cp.specification,
//           method: cp.method,
//           sample_size: Number(cp.sample_size),
//           frequency: cp.frequency,
//           gauge_id: cp.gauge_id,
//           acceptance_criteria: cp.acceptance_criteria || '',
//           is_critical: cp.is_critical || false,
//           is_significant: cp.is_significant || false,
//           is_spc: cp.is_spc || false,
//           nominal_value: cp.nominal_value ? Number(cp.nominal_value) : undefined,
//           upper_tolerance: cp.upper_tolerance ? Number(cp.upper_tolerance) : undefined,
//           lower_tolerance: cp.lower_tolerance ? Number(cp.lower_tolerance) : undefined,
//           unit: cp.unit || '',
//           photo_required: cp.photo_required || false
//         }))
//       };

//       let response;
//       if (isEditMode) {
//         response = await axios.put(`${BASE_URL}/api/inspection-plans/${initialData._id}`, requestData, {
//           headers: {
//             'Authorization': `Bearer ${token}`,
//             'Content-Type': 'application/json'
//           }
//         });
//       } else {
//         response = await axios.post(`${BASE_URL}/api/inspection-plans`, requestData, {
//           headers: {
//             'Authorization': `Bearer ${token}`,
//             'Content-Type': 'application/json'
//           }
//         });
//       }

//       if (response.data.success) {
//         onSuccess();
//         resetForm();
//         onClose();
//       } else {
//         setError(response.data.message || `Failed to ${isEditMode ? 'update' : 'create'} inspection plan`);
//       }
//     } catch (err) {
//       console.error('Error saving inspection plan:', err);
//       setError(err.response?.data?.message || `Failed to ${isEditMode ? 'update' : 'create'} inspection plan. Please try again.`);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const resetForm = () => {
//     setActiveStep(0);
//     setFormData({
//       plan_name: '',
//       plan_code: '',
//       plan_type: '',
//       item_id: '',
//       revision_no: 1,
//       revision_date: '',
//       aql_level: '',
//       sampling_plan: '',
//       instructions: '',
//       checkpoints: []
//     });
//     setFieldErrors({});
//     setError('');
//   };

//   const handleClose = () => {
//     resetForm();
//     onClose();
//   };

//   // Get gauge display name
//   const getGaugeDisplay = (gauge) => {
//     if (!gauge) return '';
//     return `${gauge.gauge_code || gauge.gauge_id} - ${gauge.gauge_name}`;
//   };

//   // Render Step Content
//   const renderStepContent = (step) => {
//     switch (step) {
//       case 0:
//         return (
//           <Stack spacing={2}>
//             <Paper sx={{ p: 2, bgcolor: COLORS.background.white, borderRadius: 1.5, border: `1px solid ${COLORS.border}` }}>
//               <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color: COLORS.primary, mb: 1.5 }}>
//                 <PlanIcon sx={{ fontSize: '1rem', mr: 0.5, verticalAlign: 'middle' }} />
//                 Plan Details
//               </Typography>
              
//               <Grid container spacing={1.5}>
//                 <Grid size={{ xs: 12, sm: 6 }}>
//                   <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//                     <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary }}>
//                       Plan Name <span style={{ color: '#EF4444' }}>*</span>
//                     </Typography>
//                     <TextField
//                       fullWidth
//                       size="small"
//                       name="plan_name"
//                       value={formData.plan_name}
//                       onChange={handleChange}
//                       placeholder="e.g., Incoming QC Plan for Steel Rods"
//                       error={!!fieldErrors.plan_name}
//                       sx={{
//                         '& .MuiOutlinedInput-root': {
//                           borderRadius: 1.5,
//                           fontSize: '0.75rem',
//                           '&:hover fieldset': { borderColor: COLORS.primary },
//                           '&.Mui-focused fieldset': { borderColor: COLORS.primary, borderWidth: 1 }
//                         },
//                         '& .MuiInputBase-input': {
//                           py: 1,
//                           px: 1.5,
//                           fontSize: '0.75rem'
//                         }
//                       }}
//                     />
//                     {fieldErrors.plan_name && (
//                       <Typography sx={{ fontSize: '0.65rem', color: '#EF4444' }}>
//                         {fieldErrors.plan_name}
//                       </Typography>
//                     )}
//                   </Box>
//                 </Grid>

//                 <Grid size={{ xs: 12, sm: 6 }}>
//                   <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//                     <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary }}>
//                       Plan Code <span style={{ color: '#EF4444' }}>*</span>
//                     </Typography>
//                     <TextField
//                       fullWidth
//                       size="small"
//                       name="plan_code"
//                       value={formData.plan_code}
//                       onChange={handleChange}
//                       placeholder="e.g., IP-2026-001"
//                       error={!!fieldErrors.plan_code}
//                       sx={{
//                         '& .MuiOutlinedInput-root': {
//                           borderRadius: 1.5,
//                           fontSize: '0.75rem',
//                           '&:hover fieldset': { borderColor: COLORS.primary },
//                           '&.Mui-focused fieldset': { borderColor: COLORS.primary, borderWidth: 1 }
//                         },
//                         '& .MuiInputBase-input': {
//                           py: 1,
//                           px: 1.5,
//                           fontSize: '0.75rem'
//                         }
//                       }}
//                     />
//                     {fieldErrors.plan_code && (
//                       <Typography sx={{ fontSize: '0.65rem', color: '#EF4444' }}>
//                         {fieldErrors.plan_code}
//                       </Typography>
//                     )}
//                   </Box>
//                 </Grid>

//                 <Grid size={{ xs: 12, sm: 6 }}>
//                   <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//                     <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary }}>
//                       Plan Type <span style={{ color: '#EF4444' }}>*</span>
//                     </Typography>
//                     <FormControl fullWidth size="small" error={!!fieldErrors.plan_type}>
//                       <Select
//                         name="plan_type"
//                         value={formData.plan_type}
//                         onChange={handleChange}
//                         displayEmpty
//                         sx={{
//                           borderRadius: 1.5,
//                           fontSize: '0.75rem',
//                           '& .MuiSelect-select': { py: 1, px: 1.5 }
//                         }}
//                       >
//                         <MenuItem value="" disabled>Select plan type</MenuItem>
//                         {PLAN_TYPE_OPTIONS.map(option => (
//                           <MenuItem key={option} value={option} sx={{ fontSize: '0.75rem' }}>
//                             {option}
//                           </MenuItem>
//                         ))}
//                       </Select>
//                     </FormControl>
//                     {fieldErrors.plan_type && (
//                       <Typography sx={{ fontSize: '0.65rem', color: '#EF4444' }}>
//                         {fieldErrors.plan_type}
//                       </Typography>
//                     )}
//                   </Box>
//                 </Grid>

//                 <Grid size={{ xs: 12, sm: 6 }}>
//                   <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//                     <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
//                       <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary }}>
//                         Item / Part <span style={{ color: '#EF4444' }}>*</span>
//                       </Typography>
//                       <Tooltip title="Add New Item">
//                         <IconButton
//                           size="small"
//                           onClick={openAddItemDialog}
//                           sx={{
//                             color: COLORS.primary,
//                             p: 0.25,
//                             '&:hover': { bgcolor: COLORS.primaryLight }
//                           }}
//                         >
//                           <AddIcon sx={{ fontSize: '0.8rem' }} />
//                         </IconButton>
//                       </Tooltip>
//                     </Box>
//                     <Autocomplete
//                       fullWidth
//                       options={items}
//                       getOptionLabel={(option) => `${option.part_no} - ${option.part_description || ''}`}
//                       value={items.find(i => i._id === formData.item_id) || null}
//                       onChange={(event, newValue) => {
//                         setFormData(prev => ({ ...prev, item_id: newValue?._id || '' }));
//                         setFieldErrors(prev => ({ ...prev, item_id: '' }));
//                       }}
//                       loading={loadingItems}
//                       renderInput={(params) => (
//                         <TextField
//                           {...params}
//                           size="small"
//                           error={!!fieldErrors.item_id}
//                           helperText={fieldErrors.item_id}
//                           sx={{
//                             '& .MuiOutlinedInput-root': {
//                               borderRadius: 1.5,
//                               fontSize: '0.75rem',
//                               '&:hover fieldset': { borderColor: COLORS.primary },
//                               '&.Mui-focused fieldset': { borderColor: COLORS.primary, borderWidth: 1 }
//                             },
//                             '& .MuiInputBase-input': {
//                               py: 1,
//                               px: 1.5,
//                               fontSize: '0.75rem'
//                             }
//                           }}
//                         />
//                       )}
//                     />
//                   </Box>
//                 </Grid>

//                 <Grid size={{ xs: 12, sm: 6 }}>
//                   <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//                     <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary }}>
//                       Revision No
//                     </Typography>
//                     <TextField
//                       fullWidth
//                       type="number"
//                       size="small"
//                       name="revision_no"
//                       value={formData.revision_no}
//                       onChange={handleChange}
//                       placeholder="1"
//                       sx={{
//                         '& .MuiOutlinedInput-root': {
//                           borderRadius: 1.5,
//                           fontSize: '0.75rem',
//                           '&:hover fieldset': { borderColor: COLORS.primary },
//                           '&.Mui-focused fieldset': { borderColor: COLORS.primary, borderWidth: 1 }
//                         },
//                         '& .MuiInputBase-input': {
//                           py: 1,
//                           px: 1.5,
//                           fontSize: '0.75rem'
//                         }
//                       }}
//                     />
//                   </Box>
//                 </Grid>

//                 <Grid size={{ xs: 12, sm: 6 }}>
//                   <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//                     <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary }}>
//                       Revision Date <span style={{ color: '#EF4444' }}>*</span>
//                     </Typography>
//                     <TextField
//                       fullWidth
//                       type="date"
//                       size="small"
//                       name="revision_date"
//                       value={formData.revision_date}
//                       onChange={handleChange}
//                       error={!!fieldErrors.revision_date}
//                       InputLabelProps={{ shrink: true }}
//                       sx={{
//                         '& .MuiOutlinedInput-root': {
//                           borderRadius: 1.5,
//                           fontSize: '0.75rem',
//                           '&:hover fieldset': { borderColor: COLORS.primary },
//                           '&.Mui-focused fieldset': { borderColor: COLORS.primary, borderWidth: 1 }
//                         },
//                         '& .MuiInputBase-input': {
//                           py: 1,
//                           px: 1.5,
//                           fontSize: '0.75rem'
//                         }
//                       }}
//                     />
//                     {fieldErrors.revision_date && (
//                       <Typography sx={{ fontSize: '0.65rem', color: '#EF4444' }}>
//                         {fieldErrors.revision_date}
//                       </Typography>
//                     )}
//                   </Box>
//                 </Grid>

//                 <Grid size={{ xs: 12, sm: 6 }}>
//                   <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//                     <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary }}>
//                       AQL Level
//                     </Typography>
//                     <TextField
//                       fullWidth
//                       size="small"
//                       name="aql_level"
//                       value={formData.aql_level}
//                       onChange={handleChange}
//                       placeholder="e.g., S-4, I, II"
//                       sx={{
//                         '& .MuiOutlinedInput-root': {
//                           borderRadius: 1.5,
//                           fontSize: '0.75rem',
//                           '&:hover fieldset': { borderColor: COLORS.primary },
//                           '&.Mui-focused fieldset': { borderColor: COLORS.primary, borderWidth: 1 }
//                         },
//                         '& .MuiInputBase-input': {
//                           py: 1,
//                           px: 1.5,
//                           fontSize: '0.75rem'
//                         }
//                       }}
//                     />
//                   </Box>
//                 </Grid>

//                 <Grid size={{ xs: 12, sm: 6 }}>
//                   <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//                     <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary }}>
//                       Sampling Plan
//                     </Typography>
//                     <TextField
//                       fullWidth
//                       size="small"
//                       name="sampling_plan"
//                       value={formData.sampling_plan}
//                       onChange={handleChange}
//                       placeholder="e.g., Normal, Tightened, Reduced"
//                       sx={{
//                         '& .MuiOutlinedInput-root': {
//                           borderRadius: 1.5,
//                           fontSize: '0.75rem',
//                           '&:hover fieldset': { borderColor: COLORS.primary },
//                           '&.Mui-focused fieldset': { borderColor: COLORS.primary, borderWidth: 1 }
//                         },
//                         '& .MuiInputBase-input': {
//                           py: 1,
//                           px: 1.5,
//                           fontSize: '0.75rem'
//                         }
//                       }}
//                     />
//                   </Box>
//                 </Grid>

//                 <Grid size={{ xs: 12 }}>
//                   <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//                     <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary }}>
//                       Instructions
//                     </Typography>
//                     <TextField
//                       fullWidth
//                       multiline
//                       rows={3}
//                       size="small"
//                       name="instructions"
//                       value={formData.instructions}
//                       onChange={handleChange}
//                       placeholder="Follow standard operating procedure QP-007..."
//                       sx={{
//                         '& .MuiOutlinedInput-root': {
//                           borderRadius: 1.5,
//                           fontSize: '0.75rem',
//                           '&:hover fieldset': { borderColor: COLORS.primary },
//                           '&.Mui-focused fieldset': { borderColor: COLORS.primary, borderWidth: 1 }
//                         },
//                         '& .MuiInputBase-input': {
//                           py: 1,
//                           px: 1.5,
//                           fontSize: '0.75rem'
//                         }
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
//             <Paper sx={{ p: 2, bgcolor: COLORS.background.white, borderRadius: 1.5, border: `1px solid ${COLORS.border}` }}>
//               <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color: COLORS.primary, mb: 1.5 }}>
//                 <QrCodeIcon sx={{ fontSize: '1rem', mr: 0.5, verticalAlign: 'middle' }} />
//                 Inspection Checkpoints
//               </Typography>

//               {formData.checkpoints.length === 0 ? (
//                 <Box sx={{ textAlign: 'center', py: 4 }}>
//                   <Typography sx={{ fontSize: '0.75rem', color: COLORS.text.secondary, mb: 2 }}>
//                     No checkpoints added yet. Click "Add Checkpoint" to create one.
//                   </Typography>
//                   <Button
//                     variant="outlined"
//                     startIcon={<AddIcon sx={{ fontSize: '1rem' }} />}
//                     onClick={addCheckpoint}
//                     sx={{
//                       height: 32,
//                       px: 2,
//                       borderRadius: 1.5,
//                       borderColor: COLORS.primary,
//                       color: COLORS.primary,
//                       fontSize: '0.7rem',
//                       fontWeight: 500,
//                       textTransform: 'none'
//                     }}
//                   >
//                     Add Checkpoint
//                   </Button>
//                 </Box>
//               ) : (
//                 <>
//                   {formData.checkpoints.map((checkpoint, index) => (
//                     <Paper
//                       key={index}
//                       sx={{
//                         p: 1.5,
//                         mb: 2,
//                         bgcolor: COLORS.background.light,
//                         borderRadius: 1.5,
//                         border: `1px solid ${COLORS.border}`
//                       }}
//                     >
//                       <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.5 }}>
//                         <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: COLORS.primary }}>
//                           Checkpoint {checkpoint.step_no || index + 1}
//                         </Typography>
//                         {formData.checkpoints.length > 1 && (
//                           <IconButton
//                             size="small"
//                             onClick={() => removeCheckpoint(index)}
//                             sx={{ color: '#EF4444' }}
//                           >
//                             <DeleteIcon fontSize="small" />
//                           </IconButton>
//                         )}
//                       </Stack>

//                       <Grid container spacing={1.5}>
//                         <Grid size={{ xs: 12, sm: 6 }}>
//                           <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//                             <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary }}>
//                               Characteristic <span style={{ color: '#EF4444' }}>*</span>
//                             </Typography>
//                             <TextField
//                               fullWidth
//                               size="small"
//                               value={checkpoint.characteristic}
//                               onChange={(e) => handleCheckpointChange(index, 'characteristic', e.target.value)}
//                               placeholder="e.g., Length, Diameter, Hardness"
//                               error={!!fieldErrors[`checkpoint_${index}_characteristic`]}
//                               sx={{
//                                 '& .MuiOutlinedInput-root': {
//                                   borderRadius: 1.5,
//                                   fontSize: '0.75rem',
//                                   '&:hover fieldset': { borderColor: COLORS.primary },
//                                   '&.Mui-focused fieldset': { borderColor: COLORS.primary, borderWidth: 1 }
//                                 },
//                                 '& .MuiInputBase-input': {
//                                   py: 1,
//                                   px: 1.5,
//                                   fontSize: '0.75rem'
//                                 }
//                               }}
//                             />
//                           </Box>
//                         </Grid>

//                         <Grid size={{ xs: 12, sm: 6 }}>
//                           <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//                             <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary }}>
//                               Characteristic Type <span style={{ color: '#EF4444' }}>*</span>
//                             </Typography>
//                             <FormControl fullWidth size="small" error={!!fieldErrors[`checkpoint_${index}_characteristic_type`]}>
//                               <Select
//                                 value={checkpoint.characteristic_type}
//                                 onChange={(e) => handleCheckpointChange(index, 'characteristic_type', e.target.value)}
//                                 displayEmpty
//                                 sx={{
//                                   borderRadius: 1.5,
//                                   fontSize: '0.75rem',
//                                   '& .MuiSelect-select': { py: 1, px: 1.5 }
//                                 }}
//                               >
//                                 <MenuItem value="" disabled>Select type</MenuItem>
//                                 {CHARACTERISTIC_TYPE_OPTIONS.map(option => (
//                                   <MenuItem key={option} value={option} sx={{ fontSize: '0.75rem' }}>
//                                     {option}
//                                   </MenuItem>
//                                 ))}
//                               </Select>
//                             </FormControl>
//                           </Box>
//                         </Grid>

//                         <Grid size={{ xs: 12, sm: 6 }}>
//                           <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//                             <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary }}>
//                               Specification <span style={{ color: '#EF4444' }}>*</span>
//                             </Typography>
//                             <TextField
//                               fullWidth
//                               size="small"
//                               value={checkpoint.specification}
//                               onChange={(e) => handleCheckpointChange(index, 'specification', e.target.value)}
//                               placeholder="e.g., 100mm ± 0.5mm"
//                               error={!!fieldErrors[`checkpoint_${index}_specification`]}
//                               sx={{
//                                 '& .MuiOutlinedInput-root': {
//                                   borderRadius: 1.5,
//                                   fontSize: '0.75rem',
//                                   '&:hover fieldset': { borderColor: COLORS.primary },
//                                   '&.Mui-focused fieldset': { borderColor: COLORS.primary, borderWidth: 1 }
//                                 },
//                                 '& .MuiInputBase-input': {
//                                   py: 1,
//                                   px: 1.5,
//                                   fontSize: '0.75rem'
//                                 }
//                               }}
//                             />
//                           </Box>
//                         </Grid>

//                         <Grid size={{ xs: 12, sm: 6 }}>
//                           <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//                             <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary }}>
//                               Method <span style={{ color: '#EF4444' }}>*</span>
//                             </Typography>
//                             <TextField
//                               fullWidth
//                               size="small"
//                               value={checkpoint.method}
//                               onChange={(e) => handleCheckpointChange(index, 'method', e.target.value)}
//                               placeholder="e.g., Vernier Caliper, Micrometer"
//                               error={!!fieldErrors[`checkpoint_${index}_method`]}
//                               sx={{
//                                 '& .MuiOutlinedInput-root': {
//                                   borderRadius: 1.5,
//                                   fontSize: '0.75rem',
//                                   '&:hover fieldset': { borderColor: COLORS.primary },
//                                   '&.Mui-focused fieldset': { borderColor: COLORS.primary, borderWidth: 1 }
//                                 },
//                                 '& .MuiInputBase-input': {
//                                   py: 1,
//                                   px: 1.5,
//                                   fontSize: '0.75rem'
//                                 }
//                               }}
//                             />
//                           </Box>
//                         </Grid>

//                         <Grid size={{ xs: 12, sm: 4 }}>
//                           <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//                             <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary }}>
//                               Sample Size <span style={{ color: '#EF4444' }}>*</span>
//                             </Typography>
//                             <TextField
//                               fullWidth
//                               type="number"
//                               size="small"
//                               value={checkpoint.sample_size}
//                               onChange={(e) => handleCheckpointChange(index, 'sample_size', e.target.value)}
//                               placeholder="5"
//                               error={!!fieldErrors[`checkpoint_${index}_sample_size`]}
//                               sx={{
//                                 '& .MuiOutlinedInput-root': {
//                                   borderRadius: 1.5,
//                                   fontSize: '0.75rem',
//                                   '&:hover fieldset': { borderColor: COLORS.primary },
//                                   '&.Mui-focused fieldset': { borderColor: COLORS.primary, borderWidth: 1 }
//                                 },
//                                 '& .MuiInputBase-input': {
//                                   py: 1,
//                                   px: 1.5,
//                                   fontSize: '0.75rem'
//                                 }
//                               }}
//                             />
//                           </Box>
//                         </Grid>

//                         <Grid size={{ xs: 12, sm: 4 }}>
//                           <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//                             <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary }}>
//                               Frequency <span style={{ color: '#EF4444' }}>*</span>
//                             </Typography>
//                             <FormControl fullWidth size="small" error={!!fieldErrors[`checkpoint_${index}_frequency`]}>
//                               <Select
//                                 value={checkpoint.frequency}
//                                 onChange={(e) => handleCheckpointChange(index, 'frequency', e.target.value)}
//                                 displayEmpty
//                                 sx={{
//                                   borderRadius: 1.5,
//                                   fontSize: '0.75rem',
//                                   '& .MuiSelect-select': { py: 1, px: 1.5 }
//                                 }}
//                               >
//                                 <MenuItem value="" disabled>Select frequency</MenuItem>
//                                 {FREQUENCY_OPTIONS.map(option => (
//                                   <MenuItem key={option} value={option} sx={{ fontSize: '0.75rem' }}>
//                                     {option}
//                                   </MenuItem>
//                                 ))}
//                               </Select>
//                             </FormControl>
//                           </Box>
//                         </Grid>

//                         <Grid size={{ xs: 12, sm: 4 }}>
//                           <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//                             <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary }}>
//                               Gauge <span style={{ color: '#EF4444' }}>*</span>
//                             </Typography>
//                             <FormControl fullWidth size="small" error={!!fieldErrors[`checkpoint_${index}_gauge_id`]}>
//                               <Select
//                                 value={checkpoint.gauge_id}
//                                 onChange={(e) => handleCheckpointChange(index, 'gauge_id', e.target.value)}
//                                 displayEmpty
//                                 disabled={loadingGauges}
//                                 sx={{
//                                   borderRadius: 1.5,
//                                   fontSize: '0.75rem',
//                                   '& .MuiSelect-select': { py: 1, px: 1.5 }
//                                 }}
//                               >
//                                 <MenuItem value="" disabled>Select gauge</MenuItem>
//                                 {gauges.map(gauge => (
//                                   <MenuItem key={gauge._id} value={gauge._id} sx={{ fontSize: '0.75rem' }}>
//                                     {getGaugeDisplay(gauge)}
//                                   </MenuItem>
//                                 ))}
//                               </Select>
//                             </FormControl>
//                           </Box>
//                         </Grid>

//                         <Grid size={{ xs: 12 }}>
//                           <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//                             <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary }}>
//                               Acceptance Criteria
//                             </Typography>
//                             <TextField
//                               fullWidth
//                               multiline
//                               rows={2}
//                               size="small"
//                               value={checkpoint.acceptance_criteria}
//                               onChange={(e) => handleCheckpointChange(index, 'acceptance_criteria', e.target.value)}
//                               placeholder="e.g., All samples within tolerance"
//                               sx={{
//                                 '& .MuiOutlinedInput-root': {
//                                   borderRadius: 1.5,
//                                   fontSize: '0.75rem',
//                                   '&:hover fieldset': { borderColor: COLORS.primary },
//                                   '&.Mui-focused fieldset': { borderColor: COLORS.primary, borderWidth: 1 }
//                                 },
//                                 '& .MuiInputBase-input': {
//                                   py: 1,
//                                   px: 1.5,
//                                   fontSize: '0.75rem'
//                                 }
//                               }}
//                             />
//                           </Box>
//                         </Grid>
//                       </Grid>
//                     </Paper>
//                   ))}

//                   <Button
//                     variant="outlined"
//                     startIcon={<AddIcon sx={{ fontSize: '1rem' }} />}
//                     onClick={addCheckpoint}
//                     sx={{
//                       height: 32,
//                       px: 2,
//                       borderRadius: 1.5,
//                       border: `1px solid ${COLORS.border}`,
//                       color: COLORS.text.secondary,
//                       fontSize: '0.7rem',
//                       fontWeight: 500,
//                       textTransform: 'none',
//                       '&:hover': {
//                         borderColor: COLORS.primary,
//                         bgcolor: `${COLORS.primary}10`
//                       }
//                     }}
//                   >
//                     Add Checkpoint
//                   </Button>
//                 </>
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
//         maxWidth="lg"
//         fullWidth
//         PaperProps={{
//           sx: {
//             borderRadius: 5,
//             boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05)',
//             border: `1px solid ${COLORS.border}`,
//             overflow: 'hidden'
//           }
//         }}
//       >
//         <DialogTitle sx={{
//           borderBottom: `1px solid ${COLORS.border}`,
//           py: 1.5,
//           px: 2.5,
//           bgcolor: COLORS.background.white,
//           display: 'flex',
//           justifyContent: 'space-between',
//           alignItems: 'center'
//         }}>
//           <Typography sx={{ fontSize: '1.2rem', fontWeight: 700, color: COLORS.text.primary }}>
//             {isEditMode ? 'Edit Inspection Plan' : 'Add Inspection Plan'}
//           </Typography>
          
//         </DialogTitle>

//         {/* Stepper */}
//         <Box sx={{ px: 2.5, pt: 2, bgcolor: COLORS.background.white }}>
//           <Stepper activeStep={activeStep} alternativeLabel connector={<ColorConnector />}>
//             {steps.map((label) => (
//               <Step key={label}>
//                 <StepLabel>
//                   <Typography sx={{ fontSize: '0.75rem', fontWeight: 500, color: COLORS.text.secondary }}>
//                     {label}
//                   </Typography>
//                 </StepLabel>
//               </Step>
//             ))}
//           </Stepper>
//         </Box>

//         <DialogContent sx={{ p: 2.5, bgcolor: COLORS.background.white }}>
//           {renderStepContent(activeStep)}
          
//           {error && (
//             <Alert severity="error" sx={{ mt: 2, borderRadius: 1.5, fontSize: '0.75rem', py: 0.5 }}>
//               {error}
//             </Alert>
//           )}
//         </DialogContent>

//         <DialogActions sx={{
//           px: 2.5,
//           py: 1.5,
//           borderTop: `1px solid ${COLORS.border}`,
//           bgcolor: COLORS.background.white,
//           justifyContent: 'space-between'
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
//           <Box>
//             <Button
//               onClick={handleClose}
//               disabled={loading}
//               sx={{
//                 height: 32,
//                 px: 2,
//                 mr: 1,
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
//                 disabled={loading}
//                 startIcon={<AddIcon sx={{ fontSize: '1rem' }} />}
//                 sx={{
//                   height: 32,
//                   px: 2,
//                   borderRadius: 1.5,
//                   bgcolor: COLORS.primary,
//                   fontSize: '0.7rem',
//                   fontWeight: 500,
//                   textTransform: 'none',
//                   boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
//                   '&:hover': {
//                     bgcolor: COLORS.primaryDark,
//                   }
//                 }}
//               >
//                 {loading ? (isEditMode ? 'Updating...' : 'Creating...') : (isEditMode ? 'Update Plan' : 'Create Plan')}
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
//                   '&:hover': {
//                     bgcolor: COLORS.primaryDark,
//                   }
//                 }}
//               >
//                 Next
//               </Button>
//             )}
//           </Box>
//         </DialogActions>
//       </Dialog>

//       {/* Add Item Dialog */}
//       <AddItem
//         open={addItemOpen}
//         onClose={() => {
//           setAddItemOpen(false);
//           setCurrentItemIndex(null);
//         }}
//         onAdd={handleItemAdded}
//       />
//     </>
//   );
// };

// export default AddInspectionPlan;




// import React, { useState, useEffect, useCallback } from 'react';
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
//   InputLabel,
//   Select,
//   MenuItem,
//   Divider,
//   Stepper,
//   Step,
//   StepLabel,
//   StepConnector,
//   stepConnectorClasses,
//   styled,
//   CircularProgress,
//   Chip,
//   InputAdornment,
//   IconButton,
//   Table,
//   TableBody,
//   TableCell,
//   TableContainer,
//   TableHead,
//   TableRow,
//   Autocomplete,
//   Tooltip,
//   Collapse
// } from '@mui/material';
// import {
//   Add as AddIcon,
//   Delete as DeleteIcon,
//   NavigateNext as NavigateNextIcon,
//   NavigateBefore as NavigateBeforeIcon,
//   Assignment as PlanIcon,
//   Inventory as InventoryIcon,
//   Settings as SettingsIcon,
//   Description as DescriptionIcon,
//   QrCode as QrCodeIcon,
//   Error as ErrorIcon,
//   Close as CloseIcon
// } from '@mui/icons-material';
// import axios from 'axios';
// import BASE_URL from '../../../config/Config';
// import AddItem from '../../master/itemmaster/AddItem';

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

// // Floating Error Alert Component
// const FloatingErrorAlert = ({ error, onClose }) => {
//   if (!error) return null;
  
//   return (
//     <Collapse in={!!error}>
//       <Alert
//         severity="error"
//         variant="filled"
//         onClose={onClose}
//         icon={<ErrorIcon sx={{ fontSize: '1rem' }} />}
//         sx={{
//           mb: 2,
//           borderRadius: 1.5,
//           fontSize: '0.75rem',
//           fontWeight: 500,
//           boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
//           '& .MuiAlert-icon': {
//             fontSize: '1rem',
//             alignItems: 'center'
//           },
//           '& .MuiAlert-message': {
//             py: 0.5,
//             fontSize: '0.75rem'
//           },
//           '& .MuiAlert-action': {
//             py: 0,
//             alignItems: 'center'
//           }
//         }}
//       >
//         {error}
//       </Alert>
//     </Collapse>
//   );
// };

// // Modern Stepper Connector
// const ColorConnector = styled(StepConnector)(({ theme }) => ({
//   [`&.${stepConnectorClasses.active}`]: {
//     [`& .${stepConnectorClasses.line}`]: {
//       backgroundColor: COLORS.primary,
//     },
//   },
//   [`&.${stepConnectorClasses.completed}`]: {
//     [`& .${stepConnectorClasses.line}`]: {
//       backgroundColor: COLORS.primary,
//     },
//   },
//   [`& .${stepConnectorClasses.line}`]: {
//     height: 2,
//     border: 0,
//     backgroundColor: '#eaeaf0',
//     borderRadius: 1,
//   },
// }));

// // Enums
// const PLAN_TYPE_OPTIONS = [
//   'Incoming', 'In-Process', 'Final', 'Pre-Dispatch', 'Customer-Specific', 'Combined'
// ];

// const CHARACTERISTIC_TYPE_OPTIONS = [
//   'Dimensional', 'Visual', 'Functional', 'Material', 'Surface', 'Mechanical', 'Electrical', 'Chemical'
// ];

// const FREQUENCY_OPTIONS = [
//   '100%', 'AQL', 'First Article Only', 'Per Lot', 'Per Shift', 'Per Batch'
// ];

// const steps = ['Plan Details', 'Checkpoints'];

// const AddInspectionPlan = ({ open, onClose, onSuccess, initialData, isEditMode = false }) => {
//   const [activeStep, setActiveStep] = useState(0);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState('');
//   const [fieldErrors, setFieldErrors] = useState({});
  
//   // Data fetching states
//   const [items, setItems] = useState([]);
//   const [gauges, setGauges] = useState([]);
//   const [loadingItems, setLoadingItems] = useState(false);
//   const [loadingGauges, setLoadingGauges] = useState(false);
  
//   // Dialog state for Add Item
//   const [addItemOpen, setAddItemOpen] = useState(false);
//   const [currentItemIndex, setCurrentItemIndex] = useState(null);

//   // Form data
//   const [formData, setFormData] = useState({
//     plan_name: '',
//     plan_code: '',
//     plan_type: '',
//     item_id: '',
//     revision_no: 1,
//     revision_date: '',
//     aql_level: '',
//     sampling_plan: '',
//     instructions: '',
//     checkpoints: []
//   });

//   const showError = (message) => {
//     setError(message);
//     setTimeout(() => {
//       setError('');
//     }, 5000);
//   };

//   // Fetch Items (for item_id dropdown)
//   const fetchItems = useCallback(async () => {
//     try {
//       setLoadingItems(true);
//       const token = localStorage.getItem('token');
//       const response = await axios.get(`${BASE_URL}/api/items?limit=100`, {
//         headers: {
//           'Authorization': `Bearer ${token}`
//         }
//       });

//       if (response.data.success) {
//         setItems(response.data.data || []);
//       }
//     } catch (err) {
//       console.error('Error fetching items:', err);
//     } finally {
//       setLoadingItems(false);
//     }
//   }, []);

//   // Fetch Gauges (for gauge_id dropdown)
//   const fetchGauges = useCallback(async () => {
//     try {
//       setLoadingGauges(true);
//       const token = localStorage.getItem('token');
//       const response = await axios.get(`${BASE_URL}/api/gauges?limit=100`, {
//         headers: {
//           'Authorization': `Bearer ${token}`
//         }
//       });

//       if (response.data.success) {
//         const filteredGauges = (response.data.data || []).filter(g => g.status === 'Calibrated');
//         setGauges(filteredGauges);
//       }
//     } catch (err) {
//       console.error('Error fetching gauges:', err);
//     } finally {
//       setLoadingGauges(false);
//     }
//   }, []);

//   // Fetch data when dialog opens
//   useEffect(() => {
//     if (open) {
//       fetchItems();
//       fetchGauges();
//     }
//   }, [open, fetchItems, fetchGauges]);

//   // Handle edit mode - populate form with initial data
//   useEffect(() => {
//     if (isEditMode && initialData && open) {
//       // Get the item ID from the populated item object or direct string
//       const itemId = initialData.item_id?._id || initialData.item_id || '';
      
//       setFormData({
//         plan_name: initialData.plan_name || '',
//         plan_code: initialData.plan_id || initialData.plan_code || '', // Use plan_id as plan_code if available
//         plan_type: initialData.plan_type || '',
//         item_id: itemId,
//         revision_no: initialData.revision_no || 1,
//         revision_date: initialData.revision_date ? initialData.revision_date.split('T')[0] : new Date().toISOString().split('T')[0],
//         aql_level: initialData.aql_level || '',
//         sampling_plan: initialData.sampling_plan || '',
//         instructions: initialData.instructions || '',
//         checkpoints: (initialData.checkpoints || []).map((cp, index) => ({
//           step_no: cp.step_no || index + 1,
//           characteristic: cp.characteristic || '',
//           characteristic_type: cp.characteristic_type || '',
//           specification: cp.specification || '',
//           method: cp.method || '',
//           sample_size: cp.sample_size || '',
//           frequency: cp.frequency || '',
//           gauge_id: cp.gauge_id?._id || cp.gauge_id || '',
//           acceptance_criteria: cp.acceptance_criteria || '',
//           is_critical: cp.is_critical || false,
//           is_significant: cp.is_significant || false,
//           is_spc: cp.is_spc || false,
//           nominal_value: cp.nominal_value || '',
//           upper_tolerance: cp.upper_tolerance || '',
//           lower_tolerance: cp.lower_tolerance || '',
//           unit: cp.unit || '',
//           photo_required: cp.photo_required || false
//         }))
//       });
//     }
//   }, [isEditMode, initialData, open]);

//   // Reset form when dialog closes
//   useEffect(() => {
//     if (!open) {
//       resetForm();
//     }
//   }, [open]);

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData(prev => ({ ...prev, [name]: value }));
//     setFieldErrors(prev => ({ ...prev, [name]: '' }));
//   };

//   const handleCheckpointChange = (index, field, value) => {
//     const updatedCheckpoints = [...formData.checkpoints];
//     updatedCheckpoints[index][field] = value;
//     setFormData(prev => ({ ...prev, checkpoints: updatedCheckpoints }));
//     setFieldErrors(prev => ({ ...prev, [`checkpoint_${index}_${field}`]: '' }));
//   };

//   const addCheckpoint = () => {
//     setFormData(prev => ({
//       ...prev,
//       checkpoints: [
//         ...prev.checkpoints,
//         {
//           step_no: prev.checkpoints.length + 1,
//           characteristic: '',
//           characteristic_type: '',
//           specification: '',
//           method: '',
//           sample_size: '',
//           frequency: '',
//           gauge_id: '',
//           acceptance_criteria: '',
//           is_critical: false,
//           is_significant: false,
//           is_spc: false,
//           nominal_value: '',
//           upper_tolerance: '',
//           lower_tolerance: '',
//           unit: '',
//           photo_required: false
//         }
//       ]
//     }));
//   };

//   const removeCheckpoint = (index) => {
//     if (formData.checkpoints.length > 1) {
//       const updatedCheckpoints = formData.checkpoints.filter((_, i) => i !== index);
//       updatedCheckpoints.forEach((cp, idx) => {
//         cp.step_no = idx + 1;
//       });
//       setFormData(prev => ({ ...prev, checkpoints: updatedCheckpoints }));
//     }
//   };

//   // Handle item added from AddItem dialog
//   const handleItemAdded = (newItem) => {
//     setItems(prev => [...prev, newItem]);
    
//     if (currentItemIndex !== null) {
//       setFormData(prev => ({ ...prev, item_id: newItem._id }));
//     }
//     setCurrentItemIndex(null);
//   };

//   const openAddItemDialog = () => {
//     setAddItemOpen(true);
//   };

//   const validateStep = (step) => {
//     const errors = {};
//     let isValid = true;
//     let errorMessages = [];

//     switch (step) {
//       case 0: // Plan Details
//         if (!formData.plan_name.trim()) {
//           errors.plan_name = 'Plan name is required';
//           errorMessages.push('Plan name is required');
//           isValid = false;
//         }
//         if (!formData.plan_code) {
//           errors.plan_code = 'Plan code is required';
//           errorMessages.push('Plan code is required');
//           isValid = false;
//         }
//         if (!formData.plan_type) {
//           errors.plan_type = 'Plan type is required';
//           errorMessages.push('Plan type is required');
//           isValid = false;
//         }
//         if (!formData.item_id) {
//           errors.item_id = 'Item is required';
//           errorMessages.push('Item is required');
//           isValid = false;
//         }
//         if (!formData.revision_date) {
//           errors.revision_date = 'Revision date is required';
//           errorMessages.push('Revision date is required');
//           isValid = false;
//         }
//         break;
      
//       case 1: // Checkpoints
//         for (let i = 0; i < formData.checkpoints.length; i++) {
//           const cp = formData.checkpoints[i];
//           if (!cp.characteristic) {
//             errors[`checkpoint_${i}_characteristic`] = `Checkpoint ${i + 1}: Characteristic is required`;
//             errorMessages.push(`Checkpoint ${i + 1}: Characteristic is required`);
//             isValid = false;
//           }
//           if (!cp.characteristic_type) {
//             errors[`checkpoint_${i}_characteristic_type`] = `Checkpoint ${i + 1}: Characteristic type is required`;
//             errorMessages.push(`Checkpoint ${i + 1}: Characteristic type is required`);
//             isValid = false;
//           }
//           if (!cp.specification) {
//             errors[`checkpoint_${i}_specification`] = `Checkpoint ${i + 1}: Specification is required`;
//             errorMessages.push(`Checkpoint ${i + 1}: Specification is required`);
//             isValid = false;
//           }
//           if (!cp.method) {
//             errors[`checkpoint_${i}_method`] = `Checkpoint ${i + 1}: Method is required`;
//             errorMessages.push(`Checkpoint ${i + 1}: Method is required`);
//             isValid = false;
//           }
//           if (!cp.sample_size) {
//             errors[`checkpoint_${i}_sample_size`] = `Checkpoint ${i + 1}: Sample size is required`;
//             errorMessages.push(`Checkpoint ${i + 1}: Sample size is required`);
//             isValid = false;
//           }
//           if (cp.sample_size && cp.sample_size <= 0) {
//             errors[`checkpoint_${i}_sample_size`] = `Checkpoint ${i + 1}: Sample size must be greater than 0`;
//             errorMessages.push(`Checkpoint ${i + 1}: Sample size must be greater than 0`);
//             isValid = false;
//           }
//           if (!cp.frequency) {
//             errors[`checkpoint_${i}_frequency`] = `Checkpoint ${i + 1}: Frequency is required`;
//             errorMessages.push(`Checkpoint ${i + 1}: Frequency is required`);
//             isValid = false;
//           }
//           if (!cp.gauge_id) {
//             errors[`checkpoint_${i}_gauge_id`] = `Checkpoint ${i + 1}: Gauge is required`;
//             errorMessages.push(`Checkpoint ${i + 1}: Gauge is required`);
//             isValid = false;
//           }
//         }
//         break;
//     }

//     setFieldErrors(errors);
//     if (!isValid) {
//       showError(errorMessages[0]);
//     }
//     return isValid;
//   };

//   const validateForm = () => {
//     const errors = {};
//     let isValid = true;
//     let errorMessages = [];

//     if (!formData.plan_name.trim()) {
//       errors.plan_name = 'Plan name is required';
//       errorMessages.push('Plan name is required');
//       isValid = false;
//     }
//     if (!formData.plan_code) {
//       errors.plan_code = 'Plan code is required';
//       errorMessages.push('Plan code is required');
//       isValid = false;
//     }
//     if (!formData.plan_type) {
//       errors.plan_type = 'Plan type is required';
//       errorMessages.push('Plan type is required');
//       isValid = false;
//     }
//     if (!formData.item_id) {
//       errors.item_id = 'Item is required';
//       errorMessages.push('Item is required');
//       isValid = false;
//     }
//     if (!formData.revision_date) {
//       errors.revision_date = 'Revision date is required';
//       errorMessages.push('Revision date is required');
//       isValid = false;
//     }

//     for (let i = 0; i < formData.checkpoints.length; i++) {
//       const cp = formData.checkpoints[i];
//       if (!cp.characteristic) {
//         errors[`checkpoint_${i}_characteristic`] = `Checkpoint ${i + 1}: Characteristic is required`;
//         errorMessages.push(`Checkpoint ${i + 1}: Characteristic is required`);
//         isValid = false;
//       }
//       if (!cp.characteristic_type) {
//         errors[`checkpoint_${i}_characteristic_type`] = `Checkpoint ${i + 1}: Characteristic type is required`;
//         errorMessages.push(`Checkpoint ${i + 1}: Characteristic type is required`);
//         isValid = false;
//       }
//       if (!cp.specification) {
//         errors[`checkpoint_${i}_specification`] = `Checkpoint ${i + 1}: Specification is required`;
//         errorMessages.push(`Checkpoint ${i + 1}: Specification is required`);
//         isValid = false;
//       }
//       if (!cp.method) {
//         errors[`checkpoint_${i}_method`] = `Checkpoint ${i + 1}: Method is required`;
//         errorMessages.push(`Checkpoint ${i + 1}: Method is required`);
//         isValid = false;
//       }
//       if (!cp.sample_size) {
//         errors[`checkpoint_${i}_sample_size`] = `Checkpoint ${i + 1}: Sample size is required`;
//         errorMessages.push(`Checkpoint ${i + 1}: Sample size is required`);
//         isValid = false;
//       }
//       if (!cp.frequency) {
//         errors[`checkpoint_${i}_frequency`] = `Checkpoint ${i + 1}: Frequency is required`;
//         errorMessages.push(`Checkpoint ${i + 1}: Frequency is required`);
//         isValid = false;
//       }
//       if (!cp.gauge_id) {
//         errors[`checkpoint_${i}_gauge_id`] = `Checkpoint ${i + 1}: Gauge is required`;
//         errorMessages.push(`Checkpoint ${i + 1}: Gauge is required`);
//         isValid = false;
//       }
//     }

//     setFieldErrors(errors);
//     if (!isValid) {
//       showError(errorMessages[0]);
//     }
//     return isValid;
//   };

//   const handleNext = () => {
//     if (validateStep(activeStep)) {
//       setActiveStep((prevStep) => prevStep + 1);
//     }
//   };

//   const handleBack = () => {
//     setActiveStep((prevStep) => prevStep - 1);
//   };

//   const handleSubmit = async () => {
//     if (!validateForm()) {
//       return;
//     }

//     setLoading(true);

//     try {
//       const token = localStorage.getItem('token');
      
//       const requestData = {
//         plan_name: formData.plan_name,
//         plan_code: formData.plan_code,
//         plan_type: formData.plan_type,
//         item_id: formData.item_id,
//         revision_no: Number(formData.revision_no),
//         revision_date: formData.revision_date,
//         aql_level: formData.aql_level || undefined,
//         sampling_plan: formData.sampling_plan || undefined,
//         instructions: formData.instructions || '',
//         checkpoints: formData.checkpoints.map(cp => ({
//           step_no: cp.step_no,
//           characteristic: cp.characteristic,
//           characteristic_type: cp.characteristic_type,
//           specification: cp.specification,
//           method: cp.method,
//           sample_size: Number(cp.sample_size),
//           frequency: cp.frequency,
//           gauge_id: cp.gauge_id,
//           acceptance_criteria: cp.acceptance_criteria || '',
//           is_critical: cp.is_critical || false,
//           is_significant: cp.is_significant || false,
//           is_spc: cp.is_spc || false,
//           nominal_value: cp.nominal_value ? Number(cp.nominal_value) : undefined,
//           upper_tolerance: cp.upper_tolerance ? Number(cp.upper_tolerance) : undefined,
//           lower_tolerance: cp.lower_tolerance ? Number(cp.lower_tolerance) : undefined,
//           unit: cp.unit || '',
//           photo_required: cp.photo_required || false
//         }))
//       };

//       let response;
//       if (isEditMode) {
//         response = await axios.put(`${BASE_URL}/api/inspection-plans/${initialData._id}`, requestData, {
//           headers: {
//             'Authorization': `Bearer ${token}`,
//             'Content-Type': 'application/json'
//           }
//         });
//       } else {
//         response = await axios.post(`${BASE_URL}/api/inspection-plans`, requestData, {
//           headers: {
//             'Authorization': `Bearer ${token}`,
//             'Content-Type': 'application/json'
//           }
//         });
//       }

//       if (response.data.success) {
//         onSuccess();
//         resetForm();
//         onClose();
//       } else {
//         showError(response.data.message || `Failed to ${isEditMode ? 'update' : 'create'} inspection plan`);
//       }
//     } catch (err) {
//       console.error('Error saving inspection plan:', err);
//       showError(err.response?.data?.message || `Failed to ${isEditMode ? 'update' : 'create'} inspection plan. Please try again.`);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const resetForm = () => {
//     setActiveStep(0);
//     setFormData({
//       plan_name: '',
//       plan_code: '',
//       plan_type: '',
//       item_id: '',
//       revision_no: 1,
//       revision_date: new Date().toISOString().split('T')[0],
//       aql_level: '',
//       sampling_plan: '',
//       instructions: '',
//       checkpoints: []
//     });
//     setFieldErrors({});
//     setError('');
//   };

//   const handleClose = () => {
//     resetForm();
//     onClose();
//   };

//   // Get gauge display name
//   const getGaugeDisplay = (gauge) => {
//     if (!gauge) return '';
//     return `${gauge.gauge_code || gauge.gauge_id} - ${gauge.gauge_name}`;
//   };

//   // Render Step Content
//   const renderStepContent = (step) => {
//     switch (step) {
//       case 0:
//         return (
//           <Stack spacing={2}>
//             <Paper sx={{ p: 2, bgcolor: COLORS.background.white, borderRadius: 1.5, border: `1px solid ${COLORS.border}` }}>
//               <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color: COLORS.primary, mb: 1.5 }}>
//                 <PlanIcon sx={{ fontSize: '1rem', mr: 0.5, verticalAlign: 'middle' }} />
//                 Plan Details
//               </Typography>
              
//               <Grid container spacing={1.5}>
//                 <Grid size={{ xs: 12, sm: 6 }}>
//                   <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//                     <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary }}>
//                       Plan Name <span style={{ color: '#EF4444' }}>*</span>
//                     </Typography>
//                     <TextField
//                       fullWidth
//                       size="small"
//                       name="plan_name"
//                       value={formData.plan_name}
//                       onChange={handleChange}
//                       placeholder="e.g., Incoming QC Plan for Steel Rods"
//                       error={!!fieldErrors.plan_name}
//                       helperText={fieldErrors.plan_name}
//                       sx={{
//                         '& .MuiOutlinedInput-root': {
//                           borderRadius: 1.5,
//                           fontSize: '0.75rem',
//                           '&:hover fieldset': { borderColor: COLORS.primary },
//                           '&.Mui-focused fieldset': { borderColor: COLORS.primary, borderWidth: 1 },
//                           '&.Mui-error fieldset': { borderColor: '#EF4444' }
//                         },
//                         '& .MuiInputBase-input': {
//                           py: 1,
//                           px: 1.5,
//                           fontSize: '0.75rem'
//                         }
//                       }}
//                     />
//                   </Box>
//                 </Grid>

//                 <Grid size={{ xs: 12, sm: 6 }}>
//                   <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//                     <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary }}>
//                       Plan Code <span style={{ color: '#EF4444' }}>*</span>
//                     </Typography>
//                     <TextField
//                       fullWidth
//                       size="small"
//                       name="plan_code"
//                       value={formData.plan_code}
//                       onChange={handleChange}
//                       placeholder="e.g., IP-2026-001"
//                       error={!!fieldErrors.plan_code}
//                       helperText={fieldErrors.plan_code}
//                       sx={{
//                         '& .MuiOutlinedInput-root': {
//                           borderRadius: 1.5,
//                           fontSize: '0.75rem',
//                           '&:hover fieldset': { borderColor: COLORS.primary },
//                           '&.Mui-focused fieldset': { borderColor: COLORS.primary, borderWidth: 1 },
//                           '&.Mui-error fieldset': { borderColor: '#EF4444' }
//                         },
//                         '& .MuiInputBase-input': {
//                           py: 1,
//                           px: 1.5,
//                           fontSize: '0.75rem'
//                         }
//                       }}
//                     />
//                   </Box>
//                 </Grid>

//                 <Grid size={{ xs: 12, sm: 6 }}>
//                   <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//                     <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary }}>
//                       Plan Type <span style={{ color: '#EF4444' }}>*</span>
//                     </Typography>
//                     <FormControl fullWidth size="small" error={!!fieldErrors.plan_type}>
//                       <Select
//                         name="plan_type"
//                         value={formData.plan_type}
//                         onChange={handleChange}
//                         displayEmpty
//                         sx={{
//                           borderRadius: 1.5,
//                           fontSize: '0.75rem',
//                           '& .MuiSelect-select': { py: 1, px: 1.5 },
//                           '&.Mui-error': { borderColor: '#EF4444' }
//                         }}
//                       >
//                         <MenuItem value="" disabled>Select plan type</MenuItem>
//                         {PLAN_TYPE_OPTIONS.map(option => (
//                           <MenuItem key={option} value={option} sx={{ fontSize: '0.75rem' }}>
//                             {option}
//                           </MenuItem>
//                         ))}
//                       </Select>
//                       {fieldErrors.plan_type && (
//                         <Typography sx={{ fontSize: '0.65rem', color: '#EF4444' }}>
//                           {fieldErrors.plan_type}
//                         </Typography>
//                       )}
//                     </FormControl>
//                   </Box>
//                 </Grid>

//                 <Grid size={{ xs: 12, sm: 6 }}>
//                   <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//                     <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
//                       <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary }}>
//                         Item / Part <span style={{ color: '#EF4444' }}>*</span>
//                       </Typography>
//                       <Tooltip title="Add New Item">
//                         <IconButton
//                           size="small"
//                           onClick={openAddItemDialog}
//                           sx={{
//                             color: COLORS.primary,
//                             p: 0.25,
//                             '&:hover': { bgcolor: COLORS.primaryLight }
//                           }}
//                         >
//                           <AddIcon sx={{ fontSize: '0.8rem' }} />
//                         </IconButton>
//                       </Tooltip>
//                     </Box>
//                     <Autocomplete
//                       fullWidth
//                       options={items}
//                       getOptionLabel={(option) => `${option.part_no} - ${option.part_description || ''}`}
//                       value={items.find(i => i._id === formData.item_id) || null}
//                       onChange={(event, newValue) => {
//                         setFormData(prev => ({ ...prev, item_id: newValue?._id || '' }));
//                         setFieldErrors(prev => ({ ...prev, item_id: '' }));
//                       }}
//                       loading={loadingItems}
//                       renderInput={(params) => (
//                         <TextField
//                           {...params}
//                           size="small"
//                           error={!!fieldErrors.item_id}
//                           helperText={fieldErrors.item_id}
//                           sx={{
//                             '& .MuiOutlinedInput-root': {
//                               borderRadius: 1.5,
//                               fontSize: '0.75rem',
//                               '&:hover fieldset': { borderColor: COLORS.primary },
//                               '&.Mui-focused fieldset': { borderColor: COLORS.primary, borderWidth: 1 },
//                               '&.Mui-error fieldset': { borderColor: '#EF4444' }
//                             },
//                             '& .MuiInputBase-input': {
//                               py: 1,
//                               px: 1.5,
//                               fontSize: '0.75rem'
//                             }
//                           }}
//                         />
//                       )}
//                     />
//                   </Box>
//                 </Grid>

//                 <Grid size={{ xs: 12, sm: 6 }}>
//                   <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//                     <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary }}>
//                       Revision No
//                     </Typography>
//                     <TextField
//                       fullWidth
//                       type="number"
//                       size="small"
//                       name="revision_no"
//                       value={formData.revision_no}
//                       onChange={handleChange}
//                       placeholder="1"
//                       sx={{
//                         '& .MuiOutlinedInput-root': {
//                           borderRadius: 1.5,
//                           fontSize: '0.75rem',
//                           '&:hover fieldset': { borderColor: COLORS.primary },
//                           '&.Mui-focused fieldset': { borderColor: COLORS.primary, borderWidth: 1 }
//                         },
//                         '& .MuiInputBase-input': {
//                           py: 1,
//                           px: 1.5,
//                           fontSize: '0.75rem'
//                         }
//                       }}
//                     />
//                   </Box>
//                 </Grid>

//                 <Grid size={{ xs: 12, sm: 6 }}>
//                   <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//                     <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary }}>
//                       Revision Date <span style={{ color: '#EF4444' }}>*</span>
//                     </Typography>
//                     <TextField
//                       fullWidth
//                       type="date"
//                       size="small"
//                       name="revision_date"
//                       value={formData.revision_date}
//                       onChange={handleChange}
//                       error={!!fieldErrors.revision_date}
//                       helperText={fieldErrors.revision_date}
//                       InputLabelProps={{ shrink: true }}
//                       sx={{
//                         '& .MuiOutlinedInput-root': {
//                           borderRadius: 1.5,
//                           fontSize: '0.75rem',
//                           '&:hover fieldset': { borderColor: COLORS.primary },
//                           '&.Mui-focused fieldset': { borderColor: COLORS.primary, borderWidth: 1 },
//                           '&.Mui-error fieldset': { borderColor: '#EF4444' }
//                         },
//                         '& .MuiInputBase-input': {
//                           py: 1,
//                           px: 1.5,
//                           fontSize: '0.75rem'
//                         }
//                       }}
//                     />
//                   </Box>
//                 </Grid>

//                 <Grid size={{ xs: 12, sm: 6 }}>
//                   <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//                     <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary }}>
//                       AQL Level
//                     </Typography>
//                     <TextField
//                       fullWidth
//                       size="small"
//                       name="aql_level"
//                       value={formData.aql_level}
//                       onChange={handleChange}
//                       placeholder="e.g., S-4, I, II"
//                       sx={{
//                         '& .MuiOutlinedInput-root': {
//                           borderRadius: 1.5,
//                           fontSize: '0.75rem',
//                           '&:hover fieldset': { borderColor: COLORS.primary },
//                           '&.Mui-focused fieldset': { borderColor: COLORS.primary, borderWidth: 1 }
//                         },
//                         '& .MuiInputBase-input': {
//                           py: 1,
//                           px: 1.5,
//                           fontSize: '0.75rem'
//                         }
//                       }}
//                     />
//                   </Box>
//                 </Grid>

//                 <Grid size={{ xs: 12, sm: 6 }}>
//                   <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//                     <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary }}>
//                       Sampling Plan
//                     </Typography>
//                     <TextField
//                       fullWidth
//                       size="small"
//                       name="sampling_plan"
//                       value={formData.sampling_plan}
//                       onChange={handleChange}
//                       placeholder="e.g., Normal, Tightened, Reduced"
//                       sx={{
//                         '& .MuiOutlinedInput-root': {
//                           borderRadius: 1.5,
//                           fontSize: '0.75rem',
//                           '&:hover fieldset': { borderColor: COLORS.primary },
//                           '&.Mui-focused fieldset': { borderColor: COLORS.primary, borderWidth: 1 }
//                         },
//                         '& .MuiInputBase-input': {
//                           py: 1,
//                           px: 1.5,
//                           fontSize: '0.75rem'
//                         }
//                       }}
//                     />
//                   </Box>
//                 </Grid>

//                 <Grid size={{ xs: 12 }}>
//                   <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//                     <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary }}>
//                       Instructions
//                     </Typography>
//                     <TextField
//                       fullWidth
//                       multiline
//                       rows={3}
//                       size="small"
//                       name="instructions"
//                       value={formData.instructions}
//                       onChange={handleChange}
//                       placeholder="Follow standard operating procedure QP-007..."
//                       sx={{
//                         '& .MuiOutlinedInput-root': {
//                           borderRadius: 1.5,
//                           fontSize: '0.75rem',
//                           '&:hover fieldset': { borderColor: COLORS.primary },
//                           '&.Mui-focused fieldset': { borderColor: COLORS.primary, borderWidth: 1 }
//                         },
//                         '& .MuiInputBase-input': {
//                           py: 1,
//                           px: 1.5,
//                           fontSize: '0.75rem'
//                         }
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
//             <Paper sx={{ p: 2, bgcolor: COLORS.background.white, borderRadius: 1.5, border: `1px solid ${COLORS.border}` }}>
//               <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color: COLORS.primary, mb: 1.5 }}>
//                 <QrCodeIcon sx={{ fontSize: '1rem', mr: 0.5, verticalAlign: 'middle' }} />
//                 Inspection Checkpoints
//               </Typography>

//               {formData.checkpoints.length === 0 ? (
//                 <Box sx={{ textAlign: 'center', py: 4 }}>
//                   <Typography sx={{ fontSize: '0.75rem', color: COLORS.text.secondary, mb: 2 }}>
//                     No checkpoints added yet. Click "Add Checkpoint" to create one.
//                   </Typography>
//                   <Button
//                     variant="outlined"
//                     startIcon={<AddIcon sx={{ fontSize: '1rem' }} />}
//                     onClick={addCheckpoint}
//                     sx={{
//                       height: 32,
//                       px: 2,
//                       borderRadius: 1.5,
//                       borderColor: COLORS.primary,
//                       color: COLORS.primary,
//                       fontSize: '0.7rem',
//                       fontWeight: 500,
//                       textTransform: 'none'
//                     }}
//                   >
//                     Add Checkpoint
//                   </Button>
//                 </Box>
//               ) : (
//                 <>
//                   {formData.checkpoints.map((checkpoint, index) => (
//                     <Paper
//                       key={index}
//                       sx={{
//                         p: 1.5,
//                         mb: 2,
//                         bgcolor: COLORS.background.light,
//                         borderRadius: 1.5,
//                         border: `1px solid ${COLORS.border}`
//                       }}
//                     >
//                       <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.5 }}>
//                         <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: COLORS.primary }}>
//                           Checkpoint {checkpoint.step_no || index + 1}
//                         </Typography>
//                         {formData.checkpoints.length > 1 && (
//                           <IconButton
//                             size="small"
//                             onClick={() => removeCheckpoint(index)}
//                             sx={{ color: '#EF4444' }}
//                           >
//                             <DeleteIcon fontSize="small" />
//                           </IconButton>
//                         )}
//                       </Stack>

//                       <Grid container spacing={1.5}>
//                         <Grid size={{ xs: 12, sm: 6 }}>
//                           <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//                             <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary }}>
//                               Characteristic <span style={{ color: '#EF4444' }}>*</span>
//                             </Typography>
//                             <TextField
//                               fullWidth
//                               size="small"
//                               value={checkpoint.characteristic}
//                               onChange={(e) => handleCheckpointChange(index, 'characteristic', e.target.value)}
//                               placeholder="e.g., Length, Diameter, Hardness"
//                               error={!!fieldErrors[`checkpoint_${index}_characteristic`]}
//                               helperText={fieldErrors[`checkpoint_${index}_characteristic`]}
//                               sx={{
//                                 '& .MuiOutlinedInput-root': {
//                                   borderRadius: 1.5,
//                                   fontSize: '0.75rem',
//                                   '&:hover fieldset': { borderColor: COLORS.primary },
//                                   '&.Mui-focused fieldset': { borderColor: COLORS.primary, borderWidth: 1 },
//                                   '&.Mui-error fieldset': { borderColor: '#EF4444' }
//                                 },
//                                 '& .MuiInputBase-input': {
//                                   py: 1,
//                                   px: 1.5,
//                                   fontSize: '0.75rem'
//                                 }
//                               }}
//                             />
//                           </Box>
//                         </Grid>

//                         <Grid size={{ xs: 12, sm: 6 }}>
//                           <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//                             <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary }}>
//                               Characteristic Type <span style={{ color: '#EF4444' }}>*</span>
//                             </Typography>
//                             <FormControl fullWidth size="small" error={!!fieldErrors[`checkpoint_${index}_characteristic_type`]}>
//                               <Select
//                                 value={checkpoint.characteristic_type}
//                                 onChange={(e) => handleCheckpointChange(index, 'characteristic_type', e.target.value)}
//                                 displayEmpty
//                                 sx={{
//                                   borderRadius: 1.5,
//                                   fontSize: '0.75rem',
//                                   '& .MuiSelect-select': { py: 1, px: 1.5 },
//                                   '&.Mui-error': { borderColor: '#EF4444' }
//                                 }}
//                               >
//                                 <MenuItem value="" disabled>Select type</MenuItem>
//                                 {CHARACTERISTIC_TYPE_OPTIONS.map(option => (
//                                   <MenuItem key={option} value={option} sx={{ fontSize: '0.75rem' }}>
//                                     {option}
//                                   </MenuItem>
//                                 ))}
//                               </Select>
//                               {fieldErrors[`checkpoint_${index}_characteristic_type`] && (
//                                 <Typography sx={{ fontSize: '0.65rem', color: '#EF4444' }}>
//                                   {fieldErrors[`checkpoint_${index}_characteristic_type`]}
//                                 </Typography>
//                               )}
//                             </FormControl>
//                           </Box>
//                         </Grid>

//                         <Grid size={{ xs: 12, sm: 6 }}>
//                           <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//                             <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary }}>
//                               Specification <span style={{ color: '#EF4444' }}>*</span>
//                             </Typography>
//                             <TextField
//                               fullWidth
//                               size="small"
//                               value={checkpoint.specification}
//                               onChange={(e) => handleCheckpointChange(index, 'specification', e.target.value)}
//                               placeholder="e.g., 100mm ± 0.5mm"
//                               error={!!fieldErrors[`checkpoint_${index}_specification`]}
//                               helperText={fieldErrors[`checkpoint_${index}_specification`]}
//                               sx={{
//                                 '& .MuiOutlinedInput-root': {
//                                   borderRadius: 1.5,
//                                   fontSize: '0.75rem',
//                                   '&:hover fieldset': { borderColor: COLORS.primary },
//                                   '&.Mui-focused fieldset': { borderColor: COLORS.primary, borderWidth: 1 },
//                                   '&.Mui-error fieldset': { borderColor: '#EF4444' }
//                                 },
//                                 '& .MuiInputBase-input': {
//                                   py: 1,
//                                   px: 1.5,
//                                   fontSize: '0.75rem'
//                                 }
//                               }}
//                             />
//                           </Box>
//                         </Grid>

//                         <Grid size={{ xs: 12, sm: 6 }}>
//                           <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//                             <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary }}>
//                               Method <span style={{ color: '#EF4444' }}>*</span>
//                             </Typography>
//                             <TextField
//                               fullWidth
//                               size="small"
//                               value={checkpoint.method}
//                               onChange={(e) => handleCheckpointChange(index, 'method', e.target.value)}
//                               placeholder="e.g., Vernier Caliper, Micrometer"
//                               error={!!fieldErrors[`checkpoint_${index}_method`]}
//                               helperText={fieldErrors[`checkpoint_${index}_method`]}
//                               sx={{
//                                 '& .MuiOutlinedInput-root': {
//                                   borderRadius: 1.5,
//                                   fontSize: '0.75rem',
//                                   '&:hover fieldset': { borderColor: COLORS.primary },
//                                   '&.Mui-focused fieldset': { borderColor: COLORS.primary, borderWidth: 1 },
//                                   '&.Mui-error fieldset': { borderColor: '#EF4444' }
//                                 },
//                                 '& .MuiInputBase-input': {
//                                   py: 1,
//                                   px: 1.5,
//                                   fontSize: '0.75rem'
//                                 }
//                               }}
//                             />
//                           </Box>
//                         </Grid>

//                         <Grid size={{ xs: 12, sm: 4 }}>
//                           <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//                             <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary }}>
//                               Sample Size <span style={{ color: '#EF4444' }}>*</span>
//                             </Typography>
//                             <TextField
//                               fullWidth
//                               type="number"
//                               size="small"
//                               value={checkpoint.sample_size}
//                               onChange={(e) => handleCheckpointChange(index, 'sample_size', e.target.value)}
//                               placeholder="5"
//                               error={!!fieldErrors[`checkpoint_${index}_sample_size`]}
//                               helperText={fieldErrors[`checkpoint_${index}_sample_size`]}
//                               sx={{
//                                 '& .MuiOutlinedInput-root': {
//                                   borderRadius: 1.5,
//                                   fontSize: '0.75rem',
//                                   '&:hover fieldset': { borderColor: COLORS.primary },
//                                   '&.Mui-focused fieldset': { borderColor: COLORS.primary, borderWidth: 1 },
//                                   '&.Mui-error fieldset': { borderColor: '#EF4444' }
//                                 },
//                                 '& .MuiInputBase-input': {
//                                   py: 1,
//                                   px: 1.5,
//                                   fontSize: '0.75rem'
//                                 }
//                               }}
//                             />
//                           </Box>
//                         </Grid>

//                         <Grid size={{ xs: 12, sm: 4 }}>
//                           <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//                             <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary }}>
//                               Frequency <span style={{ color: '#EF4444' }}>*</span>
//                             </Typography>
//                             <FormControl fullWidth size="small" error={!!fieldErrors[`checkpoint_${index}_frequency`]}>
//                               <Select
//                                 value={checkpoint.frequency}
//                                 onChange={(e) => handleCheckpointChange(index, 'frequency', e.target.value)}
//                                 displayEmpty
//                                 sx={{
//                                   borderRadius: 1.5,
//                                   fontSize: '0.75rem',
//                                   '& .MuiSelect-select': { py: 1, px: 1.5 },
//                                   '&.Mui-error': { borderColor: '#EF4444' }
//                                 }}
//                               >
//                                 <MenuItem value="" disabled>Select frequency</MenuItem>
//                                 {FREQUENCY_OPTIONS.map(option => (
//                                   <MenuItem key={option} value={option} sx={{ fontSize: '0.75rem' }}>
//                                     {option}
//                                   </MenuItem>
//                                 ))}
//                               </Select>
//                               {fieldErrors[`checkpoint_${index}_frequency`] && (
//                                 <Typography sx={{ fontSize: '0.65rem', color: '#EF4444' }}>
//                                   {fieldErrors[`checkpoint_${index}_frequency`]}
//                                 </Typography>
//                               )}
//                             </FormControl>
//                           </Box>
//                         </Grid>

//                         <Grid size={{ xs: 12, sm: 4 }}>
//                           <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//                             <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary }}>
//                               Gauge <span style={{ color: '#EF4444' }}>*</span>
//                             </Typography>
//                             <FormControl fullWidth size="small" error={!!fieldErrors[`checkpoint_${index}_gauge_id`]}>
//                               <Select
//                                 value={checkpoint.gauge_id}
//                                 onChange={(e) => handleCheckpointChange(index, 'gauge_id', e.target.value)}
//                                 displayEmpty
//                                 disabled={loadingGauges}
//                                 sx={{
//                                   borderRadius: 1.5,
//                                   fontSize: '0.75rem',
//                                   '& .MuiSelect-select': { py: 1, px: 1.5 },
//                                   '&.Mui-error': { borderColor: '#EF4444' }
//                                 }}
//                               >
//                                 <MenuItem value="" disabled>Select gauge</MenuItem>
//                                 {gauges.map(gauge => (
//                                   <MenuItem key={gauge._id} value={gauge._id} sx={{ fontSize: '0.75rem' }}>
//                                     {getGaugeDisplay(gauge)}
//                                   </MenuItem>
//                                 ))}
//                               </Select>
//                               {fieldErrors[`checkpoint_${index}_gauge_id`] && (
//                                 <Typography sx={{ fontSize: '0.65rem', color: '#EF4444' }}>
//                                   {fieldErrors[`checkpoint_${index}_gauge_id`]}
//                                 </Typography>
//                               )}
//                             </FormControl>
//                           </Box>
//                         </Grid>

//                         <Grid size={{ xs: 12 }}>
//                           <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//                             <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary }}>
//                               Acceptance Criteria
//                             </Typography>
//                             <TextField
//                               fullWidth
//                               multiline
//                               rows={2}
//                               size="small"
//                               value={checkpoint.acceptance_criteria}
//                               onChange={(e) => handleCheckpointChange(index, 'acceptance_criteria', e.target.value)}
//                               placeholder="e.g., All samples within tolerance"
//                               sx={{
//                                 '& .MuiOutlinedInput-root': {
//                                   borderRadius: 1.5,
//                                   fontSize: '0.75rem',
//                                   '&:hover fieldset': { borderColor: COLORS.primary },
//                                   '&.Mui-focused fieldset': { borderColor: COLORS.primary, borderWidth: 1 }
//                                 },
//                                 '& .MuiInputBase-input': {
//                                   py: 1,
//                                   px: 1.5,
//                                   fontSize: '0.75rem'
//                                 }
//                               }}
//                             />
//                           </Box>
//                         </Grid>
//                       </Grid>
//                     </Paper>
//                   ))}

//                   <Button
//                     variant="outlined"
//                     startIcon={<AddIcon sx={{ fontSize: '1rem' }} />}
//                     onClick={addCheckpoint}
//                     sx={{
//                       height: 32,
//                       px: 2,
//                       borderRadius: 1.5,
//                       border: `1px solid ${COLORS.border}`,
//                       color: COLORS.text.secondary,
//                       fontSize: '0.7rem',
//                       fontWeight: 500,
//                       textTransform: 'none',
//                       '&:hover': {
//                         borderColor: COLORS.primary,
//                         bgcolor: `${COLORS.primary}10`
//                       }
//                     }}
//                   >
//                     Add Checkpoint
//                   </Button>
//                 </>
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
//         maxWidth="lg"
//         fullWidth
//         PaperProps={{
//           sx: {
//             borderRadius: 5,
//             boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05)',
//             border: `1px solid ${COLORS.border}`,
//             overflow: 'hidden'
//           }
//         }}
//       >
//         <DialogTitle sx={{
//           borderBottom: `1px solid ${COLORS.border}`,
//           py: 1.5,
//           px: 2.5,
//           bgcolor: COLORS.background.white,
//           display: 'flex',
//           justifyContent: 'space-between',
//           alignItems: 'center'
//         }}>
//           <Typography sx={{ fontSize: '1.2rem', fontWeight: 700, color: COLORS.text.primary }}>
//             {isEditMode ? 'Edit Inspection Plan' : 'Add Inspection Plan'}
//           </Typography>
//         </DialogTitle>

//         {/* Floating Error Alert */}
//         <Box sx={{ px: 2.5, pt: 1 }}>
//           <FloatingErrorAlert error={error} onClose={() => setError('')} />
//         </Box>

//         {/* Stepper */}
//         <Box sx={{ px: 2.5, pt: error ? 1 : 2, bgcolor: COLORS.background.white }}>
//           <Stepper activeStep={activeStep} alternativeLabel connector={<ColorConnector />}>
//             {steps.map((label) => (
//               <Step key={label}>
//                 <StepLabel>
//                   <Typography sx={{ fontSize: '0.75rem', fontWeight: 500, color: COLORS.text.secondary }}>
//                     {label}
//                   </Typography>
//                 </StepLabel>
//               </Step>
//             ))}
//           </Stepper>
//         </Box>

//         <DialogContent sx={{ p: 2.5, pt: error ? 1 : 2, bgcolor: COLORS.background.white }}>
//           {renderStepContent(activeStep)}
//         </DialogContent>

//         <DialogActions sx={{
//           px: 2.5,
//           py: 1.5,
//           borderTop: `1px solid ${COLORS.border}`,
//           bgcolor: COLORS.background.white,
//           justifyContent: 'space-between'
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
//           <Box>
//             <Button
//               onClick={handleClose}
//               disabled={loading}
//               sx={{
//                 height: 32,
//                 px: 2,
//                 mr: 1,
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
//                 disabled={loading}
//                 startIcon={<AddIcon sx={{ fontSize: '1rem' }} />}
//                 sx={{
//                   height: 32,
//                   px: 2,
//                   borderRadius: 1.5,
//                   bgcolor: COLORS.primary,
//                   fontSize: '0.7rem',
//                   fontWeight: 500,
//                   textTransform: 'none',
//                   boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
//                   '&:hover': {
//                     bgcolor: COLORS.primaryDark,
//                   }
//                 }}
//               >
//                 {loading ? (isEditMode ? 'Updating...' : 'Creating...') : (isEditMode ? 'Update Plan' : 'Create Plan')}
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
//                   '&:hover': {
//                     bgcolor: COLORS.primaryDark,
//                   }
//                 }}
//               >
//                 Next
//               </Button>
//             )}
//           </Box>
//         </DialogActions>
//       </Dialog>

//       {/* Add Item Dialog */}
//       <AddItem
//         open={addItemOpen}
//         onClose={() => {
//           setAddItemOpen(false);
//           setCurrentItemIndex(null);
//         }}
//         onAdd={handleItemAdded}
//       />
//     </>
//   );
// };

// export default AddInspectionPlan;



import React, { useState, useEffect, useCallback } from 'react';
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
  InputLabel,
  Select,
  MenuItem,
  Divider,
  Stepper,
  Step,
  StepLabel,
  StepConnector,
  stepConnectorClasses,
  styled,
  CircularProgress,
  Chip,
  InputAdornment,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Autocomplete,
  Tooltip,
  Collapse
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  NavigateNext as NavigateNextIcon,
  NavigateBefore as NavigateBeforeIcon,
  Assignment as PlanIcon,
  Inventory as InventoryIcon,
  Settings as SettingsIcon,
  Description as DescriptionIcon,
  QrCode as QrCodeIcon,
  Error as ErrorIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import axios from 'axios';
import BASE_URL from '../../../config/Config';

// =============================================================================
// COLOR CONSTANTS & STYLES
// =============================================================================
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

const ColorConnector = styled(StepConnector)(({ theme }) => ({
  [`&.${stepConnectorClasses.active}`]: {
    [`& .${stepConnectorClasses.line}`]: {
      backgroundColor: COLORS.primary,
    },
  },
  [`&.${stepConnectorClasses.completed}`]: {
    [`& .${stepConnectorClasses.line}`]: {
      backgroundColor: COLORS.primary,
    },
  },
  [`& .${stepConnectorClasses.line}`]: {
    height: 2,
    border: 0,
    backgroundColor: '#eaeaf0',
    borderRadius: 1,
  },
}));

// =============================================================================
// OPTIONS & ENUMS
// =============================================================================
const PLAN_TYPE_OPTIONS = [
  'Incoming', 'In-Process', 'Final', 'Pre-Dispatch', 'Customer-Specific', 'Combined'
];
const CHARACTERISTIC_TYPE_OPTIONS = [
  'Dimensional', 'Visual', 'Functional', 'Material', 'Surface', 'Mechanical', 'Electrical', 'Chemical'
];
const FREQUENCY_OPTIONS = [
  '100%', 'AQL', 'First Article Only', 'Per Lot', 'Per Shift', 'Per Batch'
];

const steps = ['Plan Details', 'Checkpoints'];

// Item form enums
const unitOptions = ['Nos', 'Kg', 'Meter', 'Set', 'Piece', 'Sheet', 'Roll'];
const saleUnitOptions = ['Nos', 'Kg', 'Meter', 'Set', 'Piece', 'Sheet', 'Roll'];
const itemCategoryOptions = ['Raw Material', 'Semi-Finished', 'Finished Good', 'Consumable', 'Tool', 'Bought-Out', 'Subcontract'];
const itemTypeOptions = ['Busbar', 'Stamping', 'Gasket', 'Tooling', 'Copper Strip', 'Aluminium Profile', 'Rubber Sheet', 'Cork', 'Other'];
const procurementTypeOptions = ['Manufacture', 'Purchase', 'Subcontract', 'Free Issue'];
const gstPercentageOptions = [0, 5, 12, 18, 28];
const materialUnitOptions = ['Kg', 'Gram', 'Ton'];
const rmTypeOptions = ['Strip', 'Profile', 'Sheet', 'Wire', 'Tube', 'Compound', 'Bar', 'Rod', 'Coil'];

const itemSteps = ['Basic Info', 'Material & Drawing', 'Process Details', 'Rate & Tax'];

// =============================================================================
// FLOATING ERROR ALERT
// =============================================================================
const FloatingErrorAlert = ({ error, onClose }) => {
  if (!error) return null;
  return (
    <Collapse in={!!error}>
      <Alert
        severity="error"
        variant="filled"
        onClose={onClose}
        icon={<ErrorIcon sx={{ fontSize: '1rem' }} />}
        sx={{
          mb: 2,
          borderRadius: 1.5,
          fontSize: '0.75rem',
          fontWeight: 500,
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          '& .MuiAlert-icon': { fontSize: '1rem', alignItems: 'center' },
          '& .MuiAlert-message': { py: 0.5, fontSize: '0.75rem' },
          '& .MuiAlert-action': { py: 0, alignItems: 'center' }
        }}
      >
        {error}
      </Alert>
    </Collapse>
  );
};

// =============================================================================
// INLINE ADD ITEM COMPONENT (FULL SIZE, SPACIOUS, NO MAX HEIGHT)
// =============================================================================
const InlineAddItem = ({ onClose, onSave }) => {
  // ====== VALIDATION FUNCTIONS (unchanged) ======
  const validatePartNo = (partNo) => {
    if (!partNo?.trim()) return 'Part number is required';
    if (partNo.length > 50) return 'Part number should not exceed 50 characters';
    return '';
  };
  const validatePartName = (partName) => {
    if (!partName?.trim()) return 'Part name is required';
    if (partName.length > 100) return 'Part name should not exceed 100 characters';
    return '';
  };
  const validatePartDescription = (desc) => {
    if (!desc?.trim()) return 'Part description is required';
    if (desc.length > 200) return 'Part description should not exceed 200 characters';
    return '';
  };
  const validateItemCategory = (category) => {
    if (!category) return 'Item category is required';
    return '';
  };
  const validateMaterialName = (name) => {
    if (!name?.trim()) return 'Material name is required';
    if (name.length > 100) return 'Material name should not exceed 100 characters';
    return '';
  };
  const validateMaterialGrade = (grade) => {
    if (!grade?.trim()) return 'Material grade is required';
    return '';
  };
  const validateDensity = (density) => {
    if (!density) return 'Density is required';
    if (isNaN(density) || density <= 0) return 'Density must be a positive number';
    if (density > 25) return 'Density cannot exceed 25 g/cm³';
    return '';
  };
  const validateUnit = (unit) => {
    if (!unit) return 'Unit is required';
    return '';
  };
  const validateSaleUnit = (unit) => {
    if (!unit) return 'Sale unit is required';
    return '';
  };
  const validateHsnCode = (code) => {
    if (!code?.trim()) return 'HSN code is required';
    return '';
  };
  const validateGstPercentage = (gst) => {
    if (gst && (isNaN(gst) || gst < 0 || gst > 100)) return 'GST percentage must be between 0 and 100';
    return '';
  };
  const validateThickness = (thickness) => {
    if (thickness && (isNaN(thickness) || thickness < 0)) return 'Thickness must be a positive number';
    return '';
  };
  const validateWidth = (width) => {
    if (width && (isNaN(width) || width < 0)) return 'Width must be a positive number';
    return '';
  };
  const validateLength = (length) => {
    if (length && (isNaN(length) || length < 0)) return 'Length must be a positive number';
    return '';
  };
  const validateReorderLevel = (level) => {
    if (level && (isNaN(level) || level < 0)) return 'Reorder level must be a positive number';
    return '';
  };
  const validateLeadTimeDays = (days) => {
    if (days && (isNaN(days) || days < 0)) return 'Lead time must be a positive number';
    return '';
  };
  const validateStripSize = (size) => {
    if (size && (isNaN(size) || size < 0)) return 'Strip size must be a positive number';
    return '';
  };
  const validatePitch = (pitch) => {
    if (pitch && (isNaN(pitch) || pitch < 0)) return 'Pitch must be a positive number';
    return '';
  };
  const validateNoOfCavity = (cavity) => {
    if (cavity && (isNaN(cavity) || cavity < 1)) return 'Number of cavities must be at least 1';
    return '';
  };
  const validatePercentage = (value, fieldName) => {
    if (value && (isNaN(value) || value < 0 || value > 100)) {
      return `${fieldName} must be between 0 and 100`;
    }
    return '';
  };
  const validateWeightPerUnit = (weight) => {
    if (!weight) return 'Weight per unit is required';
    if (isNaN(weight) || weight <= 0) return 'Weight per unit must be a positive number';
    if (weight > 1000) return 'Weight per unit cannot exceed 1000 kg';
    return '';
  };

  // ====== STATE ======
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [formData, setFormData] = useState({
    part_no: '',
    part_name: '',
    part_description: '',
    material_code: '',
    material_name: '',
    material_grade: '',
    material_standard: '',
    material_color: '',
    density: '',
    unit: '',
    rm_source: '',
    rm_type: '',
    rm_spec: '',
    item_category: '',
    item_type: '',
    procurement_type: '',
    thickness: '',
    width: '',
    length: '',
    strip_size: '',
    pitch: '',
    no_of_cavity: 1,
    weight_per_unit_kg: '',
    rm_rejection_percent: '',
    scrap_realisation_percent: '',
    sale_unit: '',
    hsn_code: '',
    gst_percentage: '',
    rate_per_kg: '',
    profile_conversion_rate: '',
    scrap_percentage: '',
    transport_loss_percentage: '',
    date_effective: '',
    rate_note: '',
    drawing_no: '',
    revision_no: '',
    drawing_file_path: '',
    reorder_level: '',
    reorder_qty: '',
    safety_stock: '',
    min_stock: '',
    max_stock: '',
    lead_time_days: '',
    shelf_life_days: ''
  });

  const [hsnCodes, setHsnCodes] = useState([]);
  const [loadingHsn, setLoadingHsn] = useState(false);
  const [selectedHSN, setSelectedHSN] = useState(null);

  const [materials, setMaterials] = useState([]);
  const [loadingMaterials, setLoadingMaterials] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState(null);

  // ====== CATEGORY VISIBILITY ======
  const isRawMaterial = formData.item_category === 'Raw Material';
  const isSemiFinished = formData.item_category === 'Semi-Finished';
  const isFinishedGood = formData.item_category === 'Finished Good';
  const isBoughtOut = formData.item_category === 'Bought-Out';
  const isConsumable = formData.item_category === 'Consumable';
  const isTool = formData.item_category === 'Tool';
  const isSubcontract = formData.item_category === 'Subcontract';

  const showRmDetails = isRawMaterial;
  const showProcessParams = isSemiFinished || isFinishedGood;
  const showDimensions = isRawMaterial || isSemiFinished || isFinishedGood || isBoughtOut;
  const showInventory = !isConsumable && !isTool && !isSubcontract;
  const showRateEntry = isRawMaterial || isSemiFinished || isFinishedGood;
  const showDrawing = isFinishedGood || isSemiFinished;
  const showWeightPerUnit = formData.unit !== 'Kg';

  // ====== EFFECTS ======
  useEffect(() => {
    fetchHsnCodes();
    fetchMaterials();
  }, []);

  const fetchHsnCodes = async () => {
    try {
      setLoadingHsn(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(`${BASE_URL}/api/taxes`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success) {
        const activeHsnCodes = (response.data.data || [])
          .filter(tax => tax.IsActive === true)
          .map(tax => ({
            _id: tax._id,
            HSNCode: tax.HSNCode,
            Description: tax.Description,
            GSTPercentage: tax.GSTPercentage || 0
          }));
        setHsnCodes(activeHsnCodes);
      }
    } catch (err) {
      console.error('Error fetching HSN codes:', err);
    } finally {
      setLoadingHsn(false);
    }
  };

  const fetchMaterials = async () => {
    try {
      setLoadingMaterials(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(`${BASE_URL}/api/materials`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success) {
        const activeMaterials = (response.data.data || [])
          .filter(material => material.IsActive === true)
          .map(material => ({
            _id: material._id,
            MaterialCode: material.MaterialCode || '',
            MaterialName: material.MaterialName || '',
            MaterialNameWithCode: `${material.MaterialName || ''}${material.MaterialCode ? ` (${material.MaterialCode})` : ''}`,
            Density: material.Density || '',
            Unit: material.Unit || '',
            Grade: material.Grade || '',
            Standard: material.Standard || '',
            Color: material.Color || '',
            EffectiveRate: material.EffectiveRate || ''
          }));
        setMaterials(activeMaterials);
      }
    } catch (err) {
      console.error('Error fetching materials:', err);
    } finally {
      setLoadingMaterials(false);
    }
  };

  // ====== HANDLERS ======
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFieldErrors(prev => ({ ...prev, [name]: '' }));
    const numericFields = [
      'density', 'thickness', 'width', 'length', 'gst_percentage',
      'reorder_level', 'reorder_qty', 'lead_time_days', 'strip_size',
      'pitch', 'no_of_cavity', 'rm_rejection_percent', 'scrap_realisation_percent',
      'rate_per_kg', 'profile_conversion_rate', 'scrap_percentage',
      'transport_loss_percentage', 'safety_stock', 'min_stock', 'max_stock',
      'shelf_life_days', 'weight_per_unit_kg'
    ];
    if (numericFields.includes(name)) {
      if (value === '' || /^\d*\.?\d*$/.test(value)) {
        setFormData(prev => ({ ...prev, [name]: value }));
      }
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSelectChange = (e) => {
    const { name, value } = e.target;
    setFieldErrors(prev => ({ ...prev, [name]: '' }));
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleHSNChange = (event, newValue) => {
    setSelectedHSN(newValue);
    if (newValue) {
      setFormData(prev => ({
        ...prev,
        hsn_code: newValue.HSNCode,
        gst_percentage: newValue.GSTPercentage || ''
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        hsn_code: '',
        gst_percentage: ''
      }));
    }
  };

  const handleMaterialChange = (event, newValue) => {
    setSelectedMaterial(newValue);
    if (newValue) {
      setFormData(prev => ({
        ...prev,
        material_name: newValue.MaterialName || '',
        material_code: newValue.MaterialCode || '',
        material_grade: newValue.Grade || '',
        material_standard: newValue.Standard || '',
        material_color: newValue.Color || '',
        density: newValue.Density || '',
        unit: newValue.Unit || '',
        rate_per_kg: newValue.EffectiveRate || ''
      }));
      setFieldErrors(prev => ({
        ...prev,
        material_name: '',
        material_code: '',
        material_grade: '',
        material_standard: '',
        material_color: '',
        density: '',
        unit: '',
        rate_per_kg: ''
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        material_name: '',
        material_code: '',
        material_grade: '',
        material_standard: '',
        material_color: '',
        density: '',
        unit: '',
        rate_per_kg: ''
      }));
    }
  };

  const validateField = (name, value) => {
    switch (name) {
      case 'part_no': return validatePartNo(value);
      case 'part_name': return validatePartName(value);
      case 'part_description': return validatePartDescription(value);
      case 'item_category': return validateItemCategory(value);
      case 'material_name': return validateMaterialName(value);
      case 'material_grade': return validateMaterialGrade(value);
      case 'density': return validateDensity(value);
      case 'unit': return validateUnit(value);
      case 'sale_unit': return validateSaleUnit(value);
      case 'hsn_code': return validateHsnCode(value);
      case 'gst_percentage': return validateGstPercentage(value);
      case 'thickness': return validateThickness(value);
      case 'width': return validateWidth(value);
      case 'length': return validateLength(value);
      case 'reorder_level': return validateReorderLevel(value);
      case 'lead_time_days': return validateLeadTimeDays(value);
      case 'strip_size': return validateStripSize(value);
      case 'pitch': return validatePitch(value);
      case 'no_of_cavity': return validateNoOfCavity(value);
      case 'rm_rejection_percent': return validatePercentage(value, 'RM rejection percentage');
      case 'scrap_realisation_percent': return validatePercentage(value, 'Scrap realisation percentage');
      case 'weight_per_unit_kg': return validateWeightPerUnit(value);
      default: return '';
    }
  };

  const validateStep = (step) => {
    const errors = {};
    let isValid = true;
    let errorMessages = [];

    switch (step) {
      case 0: {
        const partNoError = validateField('part_no', formData.part_no);
        if (partNoError) { errors.part_no = partNoError; errorMessages.push(partNoError); isValid = false; }
        const partNameError = validateField('part_name', formData.part_name);
        if (partNameError) { errors.part_name = partNameError; errorMessages.push(partNameError); isValid = false; }
        const partDescError = validateField('part_description', formData.part_description);
        if (partDescError) { errors.part_description = partDescError; errorMessages.push(partDescError); isValid = false; }
        const itemCategoryError = validateField('item_category', formData.item_category);
        if (itemCategoryError) { errors.item_category = itemCategoryError; errorMessages.push(itemCategoryError); isValid = false; }
        const saleUnitError = validateField('sale_unit', formData.sale_unit);
        if (saleUnitError) { errors.sale_unit = saleUnitError; errorMessages.push(saleUnitError); isValid = false; }
        if (showWeightPerUnit) {
          const weightError = validateField('weight_per_unit_kg', formData.weight_per_unit_kg);
          if (weightError) { errors.weight_per_unit_kg = weightError; errorMessages.push(weightError); isValid = false; }
        }
        break;
      }
      case 1: {
        const materialNameError = validateField('material_name', formData.material_name);
        if (materialNameError) { errors.material_name = materialNameError; errorMessages.push(materialNameError); isValid = false; }
        const materialGradeError = validateField('material_grade', formData.material_grade);
        if (materialGradeError) { errors.material_grade = materialGradeError; errorMessages.push(materialGradeError); isValid = false; }
        const densityError = validateField('density', formData.density);
        if (densityError) { errors.density = densityError; errorMessages.push(densityError); isValid = false; }
        const unitError = validateField('unit', formData.unit);
        if (unitError) { errors.unit = unitError; errorMessages.push(unitError); isValid = false; }
        const hsnCodeError = validateField('hsn_code', formData.hsn_code);
        if (hsnCodeError) { errors.hsn_code = hsnCodeError; errorMessages.push(hsnCodeError); isValid = false; }
        if (!formData.procurement_type) {
          errors.procurement_type = 'Procurement type is required';
          errorMessages.push('Procurement type is required');
          isValid = false;
        }
        break;
      }
      case 2: {
        if (showProcessParams) {
          if (formData.pitch) {
            const pitchError = validateField('pitch', formData.pitch);
            if (pitchError) { errors.pitch = pitchError; errorMessages.push(pitchError); isValid = false; }
          }
          const cavityError = validateField('no_of_cavity', formData.no_of_cavity);
          if (cavityError) { errors.no_of_cavity = cavityError; errorMessages.push(cavityError); isValid = false; }
        }
        if (formData.reorder_level) {
          const reorderError = validateField('reorder_level', formData.reorder_level);
          if (reorderError) { errors.reorder_level = reorderError; errorMessages.push(reorderError); isValid = false; }
        }
        if (formData.lead_time_days) {
          const leadTimeError = validateField('lead_time_days', formData.lead_time_days);
          if (leadTimeError) { errors.lead_time_days = leadTimeError; errorMessages.push(leadTimeError); isValid = false; }
        }
        break;
      }
      case 3: {
        if (formData.gst_percentage) {
          const gstError = validateField('gst_percentage', formData.gst_percentage);
          if (gstError) { errors.gst_percentage = gstError; errorMessages.push(gstError); isValid = false; }
        }
        if (formData.rm_rejection_percent) {
          const rejectionError = validateField('rm_rejection_percent', formData.rm_rejection_percent);
          if (rejectionError) { errors.rm_rejection_percent = rejectionError; errorMessages.push(rejectionError); isValid = false; }
        }
        if (formData.scrap_realisation_percent) {
          const scrapError = validateField('scrap_realisation_percent', formData.scrap_realisation_percent);
          if (scrapError) { errors.scrap_realisation_percent = scrapError; errorMessages.push(scrapError); isValid = false; }
        }
        break;
      }
      default: return true;
    }

    setFieldErrors(errors);
    if (!isValid) {
      setError(errorMessages[0]);
    }
    return isValid;
  };

  const validateAllFields = () => {
    const errors = {};
    let isValid = true;
    let errorMessages = [];

    const requiredFields = [
      { name: 'part_no', label: 'Part number' },
      { name: 'part_name', label: 'Part name' },
      { name: 'part_description', label: 'Part description' },
      { name: 'item_category', label: 'Item category' },
      { name: 'material_name', label: 'Material name' },
      { name: 'material_grade', label: 'Material grade' },
      { name: 'density', label: 'Density' },
      { name: 'unit', label: 'Unit' },
      { name: 'sale_unit', label: 'Sale unit' },
      { name: 'hsn_code', label: 'HSN code' }
    ];
    if (showWeightPerUnit) {
      requiredFields.push({ name: 'weight_per_unit_kg', label: 'Weight per unit' });
    }
    requiredFields.forEach(field => {
      const value = formData[field.name];
      const isEmpty = value === undefined || value === null ||
                      (typeof value === 'string' && value.trim() === '') ||
                      (typeof value !== 'string' && value === '');
      if (isEmpty) {
        errors[field.name] = `${field.label} is required`;
        errorMessages.push(`${field.label} is required`);
        isValid = false;
      }
    });

    // Optional validations
    if (showDimensions && formData.thickness) {
      const err = validateField('thickness', formData.thickness);
      if (err) errors.thickness = err;
    }
    if (showDimensions && formData.width) {
      const err = validateField('width', formData.width);
      if (err) errors.width = err;
    }
    if (showDimensions && formData.length) {
      const err = validateField('length', formData.length);
      if (err) errors.length = err;
    }
    if (formData.gst_percentage) {
      const err = validateField('gst_percentage', formData.gst_percentage);
      if (err) errors.gst_percentage = err;
    }
    if (formData.reorder_level) {
      const err = validateField('reorder_level', formData.reorder_level);
      if (err) errors.reorder_level = err;
    }
    if (formData.lead_time_days) {
      const err = validateField('lead_time_days', formData.lead_time_days);
      if (err) errors.lead_time_days = err;
    }
    if (showProcessParams && formData.pitch) {
      const err = validateField('pitch', formData.pitch);
      if (err) errors.pitch = err;
    }
    if (showProcessParams && formData.no_of_cavity) {
      const err = validateField('no_of_cavity', formData.no_of_cavity);
      if (err) errors.no_of_cavity = err;
    }
    if (formData.rm_rejection_percent) {
      const err = validateField('rm_rejection_percent', formData.rm_rejection_percent);
      if (err) errors.rm_rejection_percent = err;
    }
    if (formData.scrap_realisation_percent) {
      const err = validateField('scrap_realisation_percent', formData.scrap_realisation_percent);
      if (err) errors.scrap_realisation_percent = err;
    }
    if (showRmDetails && formData.strip_size) {
      const err = validateField('strip_size', formData.strip_size);
      if (err) errors.strip_size = err;
    }

    setFieldErrors(errors);
    if (!isValid) {
      setError(errorMessages[0]);
    }
    return isValid;
  };

  const handleNext = () => {
    if (validateStep(activeStep)) {
      setActiveStep((prevStep) => prevStep + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handleSubmit = async () => {
    if (!validateAllFields()) return;
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const submissionData = {
        part_no: formData.part_no,
        part_name: formData.part_name,
        part_description: formData.part_description,
        material_code: formData.material_code || undefined,
        material_name: formData.material_name,
        material_grade: formData.material_grade,
        material_standard: formData.material_standard || undefined,
        material_color: formData.material_color || undefined,
        density: parseFloat(formData.density),
        unit: formData.unit,
        rm_source: showRmDetails ? (formData.rm_source || undefined) : undefined,
        rm_type: showRmDetails ? (formData.rm_type || undefined) : undefined,
        rm_spec: showRmDetails ? (formData.rm_spec || undefined) : undefined,
        item_category: formData.item_category,
        item_type: formData.item_type || 'Other',
        procurement_type: formData.procurement_type || 'Manufacture',
        thickness: showDimensions && formData.thickness ? parseFloat(formData.thickness) : undefined,
        width: showDimensions && formData.width ? parseFloat(formData.width) : undefined,
        length: showDimensions && formData.length ? parseFloat(formData.length) : undefined,
        strip_size: showRmDetails && formData.strip_size ? parseFloat(formData.strip_size) : undefined,
        pitch: showProcessParams && formData.pitch ? parseFloat(formData.pitch) : undefined,
        no_of_cavity: showProcessParams && formData.no_of_cavity ? parseInt(formData.no_of_cavity) : 1,
        weight_per_unit_kg: formData.weight_per_unit_kg ? parseFloat(formData.weight_per_unit_kg) : undefined,
        rm_rejection_percent: formData.rm_rejection_percent ? parseFloat(formData.rm_rejection_percent) : 2.0,
        scrap_realisation_percent: formData.scrap_realisation_percent ? parseFloat(formData.scrap_realisation_percent) : 85,
        sale_unit: formData.sale_unit,
        hsn_code: formData.hsn_code,
        gst_percentage: formData.gst_percentage ? parseFloat(formData.gst_percentage) : 18,
        rate_per_kg: showRateEntry && formData.rate_per_kg ? parseFloat(formData.rate_per_kg) : undefined,
        profile_conversion_rate: showRateEntry && formData.profile_conversion_rate ? parseFloat(formData.profile_conversion_rate) : undefined,
        scrap_percentage: showRateEntry && formData.scrap_percentage ? parseFloat(formData.scrap_percentage) : undefined,
        transport_loss_percentage: showRateEntry && formData.transport_loss_percentage ? parseFloat(formData.transport_loss_percentage) : undefined,
        date_effective: formData.date_effective || undefined,
        rate_note: formData.rate_note || undefined,
        drawing_no: showDrawing ? (formData.drawing_no || undefined) : undefined,
        revision_no: showDrawing ? (formData.revision_no || '0') : undefined,
        drawing_file_path: showDrawing ? (formData.drawing_file_path || undefined) : undefined,
        reorder_level: showInventory && formData.reorder_level ? parseInt(formData.reorder_level) : undefined,
        reorder_qty: showInventory && formData.reorder_qty ? parseInt(formData.reorder_qty) : undefined,
        safety_stock: showInventory && formData.safety_stock ? parseInt(formData.safety_stock) : undefined,
        min_stock: showInventory && formData.min_stock ? parseInt(formData.min_stock) : undefined,
        max_stock: showInventory && formData.max_stock ? parseInt(formData.max_stock) : undefined,
        lead_time_days: showInventory && formData.lead_time_days ? parseInt(formData.lead_time_days) : undefined,
        shelf_life_days: showInventory && formData.shelf_life_days ? parseInt(formData.shelf_life_days) : undefined
      };
      Object.keys(submissionData).forEach(key => {
        if (submissionData[key] === undefined) delete submissionData[key];
      });

      const response = await axios.post(`${BASE_URL}/api/items`, submissionData, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
      });
      if (response.data.success) {
        onSave(response.data.data);
      } else {
        setError(response.data.message || 'Failed to add item');
      }
    } catch (err) {
      console.error('Error adding item:', err);
      setError(err.response?.data?.message || 'Failed to add item. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ====== RENDER ======
  const textFieldSx = {
    '& .MuiOutlinedInput-root': {
      borderRadius: 1.5,
      fontSize: '0.75rem',
      '&:hover fieldset': { borderColor: COLORS.primary },
      '&.Mui-focused fieldset': { borderColor: COLORS.primary, borderWidth: 1 }
    },
    '& .MuiInputBase-input': {
      py: 1, px: 1.5, fontSize: '0.75rem', color: COLORS.text.primary
    },
    '& .MuiFormHelperText-root': {
      fontSize: '0.65rem', marginLeft: 0, marginTop: 0.25
    }
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
  const labelStyle = {
    fontSize: '0.7rem',
    fontWeight: 600,
    color: COLORS.text.secondary,
    letterSpacing: '0.5px',
    mb: 0.5
  };

  const renderStepContent = (step) => {
    switch (step) {
      case 0: // Basic Info
        return (
          <Paper sx={{ p: 2, bgcolor: COLORS.background.white, borderRadius: 1.5, border: `1px solid ${COLORS.border}` }}>
            <Typography variant="subtitle2" sx={{ color: COLORS.primary, mb: 1.5, fontWeight: 600, fontSize: '0.9rem' }}>
              Basic Information
            </Typography>
            <Grid container spacing={1.5}>
              <Grid size={{ xs: 12, md: 6 }}>
                <Box><Typography sx={labelStyle}>PART NUMBER <span style={{ color: '#EF4444' }}>*</span></Typography>
                  <TextField fullWidth size="small" name="part_no" value={formData.part_no} onChange={handleChange} placeholder="e.g., BR-001" error={!!fieldErrors.part_no} helperText={fieldErrors.part_no} sx={textFieldSx} /></Box>
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <Box><Typography sx={labelStyle}>PART NAME <span style={{ color: '#EF4444' }}>*</span></Typography>
                  <TextField fullWidth size="small" name="part_name" value={formData.part_name} onChange={handleChange} placeholder="e.g., Copper Busbar 100x10mm" error={!!fieldErrors.part_name} helperText={fieldErrors.part_name} sx={textFieldSx} /></Box>
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <Box><Typography sx={labelStyle}>ITEM CATEGORY <span style={{ color: '#EF4444' }}>*</span></Typography>
                  <FormControl fullWidth size="small" error={!!fieldErrors.item_category}>
                    <Select name="item_category" value={formData.item_category} onChange={handleSelectChange} displayEmpty sx={selectSx}>
                      <MenuItem value="" disabled>Select category</MenuItem>
                      {itemCategoryOptions.map((option) => (
                        <MenuItem key={option} value={option} sx={{ fontSize: '0.75rem' }}>{option}</MenuItem>
                      ))}
                    </Select>
                    {fieldErrors.item_category && <Typography sx={{ fontSize: '0.65rem', color: '#EF4444' }}>{fieldErrors.item_category}</Typography>}
                  </FormControl>
                </Box>
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <Box><Typography sx={labelStyle}>ITEM TYPE</Typography>
                  <FormControl fullWidth size="small">
                    <Select name="item_type" value={formData.item_type} onChange={handleSelectChange} displayEmpty sx={selectSx}>
                      <MenuItem value="" disabled>Select type</MenuItem>
                      {itemTypeOptions.map((option) => (
                        <MenuItem key={option} value={option} sx={{ fontSize: '0.75rem' }}>{option}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <Typography sx={{ fontSize: '0.65rem', color: COLORS.text.tertiary }}>Optional, defaults to "Other"</Typography>
                </Box>
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <Box><Typography sx={labelStyle}>SALE UNIT <span style={{ color: '#EF4444' }}>*</span></Typography>
                  <FormControl fullWidth size="small" error={!!fieldErrors.sale_unit}>
                    <Select name="sale_unit" value={formData.sale_unit} onChange={handleSelectChange} displayEmpty sx={selectSx}>
                      <MenuItem value="" disabled>Select sale unit</MenuItem>
                      {saleUnitOptions.map((option) => (
                        <MenuItem key={option} value={option} sx={{ fontSize: '0.75rem' }}>{option}</MenuItem>
                      ))}
                    </Select>
                    {fieldErrors.sale_unit && <Typography sx={{ fontSize: '0.65rem', color: '#EF4444' }}>{fieldErrors.sale_unit}</Typography>}
                  </FormControl>
                </Box>
              </Grid>
              {showWeightPerUnit && (
                <Grid size={{ xs: 12, md: 4 }}>
                  <Box><Typography sx={labelStyle}>WEIGHT PER UNIT (kg) <span style={{ color: '#EF4444' }}>*</span></Typography>
                    <TextField fullWidth size="small" name="weight_per_unit_kg" value={formData.weight_per_unit_kg} onChange={handleChange} type="number" placeholder="e.g., 0.85" error={!!fieldErrors.weight_per_unit_kg} helperText={fieldErrors.weight_per_unit_kg} inputProps={{ step: '0.001', min: 0.001 }} sx={numberFieldSx} />
                    <Typography sx={{ fontSize: '0.65rem', color: COLORS.text.tertiary }}>Weight per unit in kgs (required when sale unit is not Kg)</Typography>
                  </Box>
                </Grid>
              )}
              <Grid size={{ xs: 12 }}>
                <Box><Typography sx={labelStyle}>PART DESCRIPTION <span style={{ color: '#EF4444' }}>*</span></Typography>
                  <TextField fullWidth size="small" name="part_description" value={formData.part_description} onChange={handleChange} multiline rows={2} placeholder="Enter detailed part description" error={!!fieldErrors.part_description} helperText={fieldErrors.part_description} sx={textFieldSx} />
                </Box>
              </Grid>
            </Grid>
          </Paper>
        );

      case 1: // Material & Drawing
        return (
          <Stack spacing={2}>
            <Paper sx={{ p: 2, bgcolor: COLORS.background.white, borderRadius: 1.5, border: `1px solid ${COLORS.border}` }}>
              <Typography variant="subtitle2" sx={{ color: COLORS.primary, mb: 1.5, fontWeight: 600, fontSize: '0.9rem' }}>
                Material Information <span style={{ color: '#EF4444' }}>*</span>
              </Typography>
              <Grid container spacing={1.5}>
                <Grid size={{ xs: 12 }}>
                  <Box>
                    <Typography sx={labelStyle}>SELECT MATERIAL</Typography>
                    <Autocomplete
                      fullWidth
                      options={materials}
                      loading={loadingMaterials}
                      value={selectedMaterial}
                      onChange={handleMaterialChange}
                      getOptionLabel={(option) => option.MaterialNameWithCode || option.MaterialName || ''}
                      isOptionEqualToValue={(option, value) => option._id === value._id}
                      renderInput={(params) => (
                        <TextField {...params} size="small" placeholder="Search or select a material" sx={textFieldSx} />
                      )}
                    />
                    <Typography sx={{ fontSize: '0.65rem', color: COLORS.text.tertiary }}>Select existing to auto-fill details</Typography>
                  </Box>
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                  <Box><Typography sx={labelStyle}>MATERIAL NAME <span style={{ color: '#EF4444' }}>*</span></Typography>
                    <TextField fullWidth size="small" name="material_name" value={formData.material_name} onChange={handleChange} placeholder="e.g., Copper" error={!!fieldErrors.material_name} helperText={fieldErrors.material_name} sx={textFieldSx} /></Box>
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                  <Box><Typography sx={labelStyle}>MATERIAL CODE</Typography>
                    <TextField fullWidth size="small" name="material_code" value={formData.material_code} onChange={handleChange} placeholder="e.g., CU-001" sx={textFieldSx} />
                    <Typography sx={{ fontSize: '0.65rem', color: COLORS.text.tertiary }}>Optional internal code</Typography>
                  </Box>
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                  <Box><Typography sx={labelStyle}>MATERIAL GRADE <span style={{ color: '#EF4444' }}>*</span></Typography>
                    <TextField fullWidth size="small" name="material_grade" value={formData.material_grade} onChange={handleChange} placeholder="e.g., C11000" error={!!fieldErrors.material_grade} helperText={fieldErrors.material_grade} sx={textFieldSx} /></Box>
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                  <Box><Typography sx={labelStyle}>DENSITY (g/cm³) <span style={{ color: '#EF4444' }}>*</span></Typography>
                    <TextField fullWidth size="small" name="density" value={formData.density} onChange={handleChange} type="number" placeholder="e.g., 8.96" error={!!fieldErrors.density} helperText={fieldErrors.density} inputProps={{ step: '0.01', min: 0.1 }} sx={numberFieldSx} /></Box>
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                  <Box><Typography sx={labelStyle}>UNIT <span style={{ color: '#EF4444' }}>*</span></Typography>
                    <FormControl fullWidth size="small" error={!!fieldErrors.unit}>
                      <Select name="unit" value={formData.unit} onChange={handleSelectChange} displayEmpty sx={selectSx}>
                        <MenuItem value="" disabled>Select unit</MenuItem>
                        {unitOptions.map((option) => (
                          <MenuItem key={option} value={option} sx={{ fontSize: '0.75rem' }}>{option}</MenuItem>
                        ))}
                      </Select>
                      {fieldErrors.unit && <Typography sx={{ fontSize: '0.65rem', color: '#EF4444' }}>{fieldErrors.unit}</Typography>}
                    </FormControl>
                  </Box>
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                  <Box><Typography sx={labelStyle}>PROCUREMENT TYPE</Typography>
                    <FormControl fullWidth size="small" error={!!fieldErrors.procurement_type}>
                      <Select name="procurement_type" value={formData.procurement_type} onChange={handleSelectChange} displayEmpty sx={selectSx}>
                        <MenuItem value="" disabled>Select procurement type</MenuItem>
                        {procurementTypeOptions.map((option) => (
                          <MenuItem key={option} value={option} sx={{ fontSize: '0.75rem' }}>{option}</MenuItem>
                        ))}
                      </Select>
                      {fieldErrors.procurement_type && <Typography sx={{ fontSize: '0.65rem', color: '#EF4444' }}>{fieldErrors.procurement_type}</Typography>}
                    </FormControl>
                    <Typography sx={{ fontSize: '0.65rem', color: COLORS.text.tertiary }}>Optional, defaults to "Manufacture"</Typography>
                  </Box>
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                  <Box><Typography sx={labelStyle}>MATERIAL STANDARD</Typography>
                    <TextField fullWidth size="small" name="material_standard" value={formData.material_standard} onChange={handleChange} placeholder="e.g., ASTM B152" sx={textFieldSx} /></Box>
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                  <Box><Typography sx={labelStyle}>MATERIAL COLOR</Typography>
                    <TextField fullWidth size="small" name="material_color" value={formData.material_color} onChange={handleChange} placeholder="e.g., Reddish" sx={textFieldSx} /></Box>
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                  <Box><Typography sx={labelStyle}>HSN CODE <span style={{ color: '#EF4444' }}>*</span></Typography>
                    <Autocomplete
                      fullWidth options={hsnCodes} loading={loadingHsn} value={selectedHSN} onChange={handleHSNChange}
                      getOptionLabel={(option) => option.HSNCode || ''} isOptionEqualToValue={(option, value) => option._id === value._id}
                      renderInput={(params) => (
                        <TextField {...params} size="small" placeholder="Select HSN code" error={!!fieldErrors.hsn_code} helperText={fieldErrors.hsn_code} sx={textFieldSx} />
                      )}
                    />
                    <Typography sx={{ fontSize: '0.65rem', color: COLORS.text.tertiary }}>Select HSN code</Typography>
                  </Box>
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                  <Box><Typography sx={labelStyle}>GST PERCENTAGE (%)</Typography>
                    <FormControl fullWidth size="small" error={!!fieldErrors.gst_percentage}>
                      <Select name="gst_percentage" value={formData.gst_percentage} onChange={handleSelectChange} displayEmpty sx={selectSx}>
                        <MenuItem value="" sx={{ fontSize: '0.75rem' }}>Not specified</MenuItem>
                        {gstPercentageOptions.map((option) => (
                          <MenuItem key={option} value={option} sx={{ fontSize: '0.75rem' }}>{option}%</MenuItem>
                        ))}
                      </Select>
                      {fieldErrors.gst_percentage && <Typography sx={{ fontSize: '0.65rem', color: '#EF4444' }}>{fieldErrors.gst_percentage}</Typography>}
                    </FormControl>
                    <Typography sx={{ fontSize: '0.65rem', color: COLORS.text.tertiary }}>Auto-filled from HSN, defaults to 18%</Typography>
                  </Box>
                </Grid>
              </Grid>
            </Paper>

            {/* Drawing Information - only for Finished Good & Semi-Finished */}
            {showDrawing && (
              <Paper sx={{ p: 2, bgcolor: COLORS.background.white, borderRadius: 1.5, border: `1px solid ${COLORS.border}` }}>
                <Typography variant="subtitle2" sx={{ color: COLORS.primary, mb: 1.5, fontWeight: 600, fontSize: '0.9rem' }}>
                  Drawing Information
                </Typography>
                <Grid container spacing={1.5}>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Box><Typography sx={labelStyle}>DRAWING NUMBER</Typography>
                      <TextField fullWidth size="small" name="drawing_no" value={formData.drawing_no} onChange={handleChange} placeholder="e.g., DRG001" sx={textFieldSx} /></Box>
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Box><Typography sx={labelStyle}>REVISION NUMBER</Typography>
                      <TextField fullWidth size="small" name="revision_no" value={formData.revision_no} onChange={handleChange} placeholder="e.g., A" sx={textFieldSx} />
                      <Typography sx={{ fontSize: '0.65rem', color: COLORS.text.tertiary }}>Defaults to "0"</Typography>
                    </Box>
                  </Grid>
                </Grid>
              </Paper>
            )}

            {/* Dimensions - show for most categories */}
            {showDimensions && (
              <Paper sx={{ p: 2, bgcolor: COLORS.background.white, borderRadius: 1.5, border: `1px solid ${COLORS.border}` }}>
                <Typography variant="subtitle2" sx={{ color: COLORS.primary, mb: 1.5, fontWeight: 600, fontSize: '0.9rem' }}>
                  {isRawMaterial ? 'Raw Material Dimensions (mm)' : isBoughtOut ? 'Product Dimensions (mm)' : 'Dimensions (mm)'}
                </Typography>
                <Grid container spacing={1.5}>
                  <Grid size={{ xs: 12, md: 4 }}>
                    <Box><Typography sx={labelStyle}>THICKNESS (mm)</Typography>
                      <TextField fullWidth size="small" name="thickness" value={formData.thickness} onChange={handleChange} type="number" placeholder="e.g., 10" error={!!fieldErrors.thickness} helperText={fieldErrors.thickness} inputProps={{ step: '0.01', min: 0 }} sx={numberFieldSx} /></Box>
                  </Grid>
                  <Grid size={{ xs: 12, md: 4 }}>
                    <Box><Typography sx={labelStyle}>WIDTH (mm)</Typography>
                      <TextField fullWidth size="small" name="width" value={formData.width} onChange={handleChange} type="number" placeholder="e.g., 100" error={!!fieldErrors.width} helperText={fieldErrors.width} inputProps={{ step: '0.01', min: 0 }} sx={numberFieldSx} /></Box>
                  </Grid>
                  <Grid size={{ xs: 12, md: 4 }}>
                    <Box><Typography sx={labelStyle}>{isRawMaterial ? 'COIL LENGTH (mm)' : 'LENGTH (mm)'}</Typography>
                      <TextField fullWidth size="small" name="length" value={formData.length} onChange={handleChange} type="number" placeholder={isRawMaterial ? "e.g., 3660" : "e.g., 1000"} error={!!fieldErrors.length} helperText={fieldErrors.length} inputProps={{ step: '0.01', min: 0 }} sx={numberFieldSx} />
                      {!isRawMaterial && <Typography sx={{ fontSize: '0.65rem', color: COLORS.text.tertiary }}>Defaults to 1000mm for weight calculation</Typography>}
                    </Box>
                  </Grid>
                </Grid>
              </Paper>
            )}

            {/* Raw Material Details - only for Raw Material */}
            {showRmDetails && (
              <Paper sx={{ p: 2, bgcolor: COLORS.background.white, borderRadius: 1.5, border: `1px solid ${COLORS.border}` }}>
                <Typography variant="subtitle2" sx={{ color: COLORS.primary, mb: 1.5, fontWeight: 600, fontSize: '0.9rem' }}>
                  Raw Material Details (Supplier Information)
                </Typography>
                <Grid container spacing={1.5}>
                  <Grid size={{ xs: 12, md: 4 }}>
                    <Box><Typography sx={labelStyle}>RM SOURCE (Supplier)</Typography>
                      <TextField fullWidth size="small" name="rm_source" value={formData.rm_source} onChange={handleChange} placeholder="e.g., Hindalco" sx={textFieldSx} /></Box>
                  </Grid>
                  <Grid size={{ xs: 12, md: 4 }}>
                    <Box><Typography sx={labelStyle}>RM TYPE</Typography>
                      <FormControl fullWidth size="small">
                        <Select name="rm_type" value={formData.rm_type} onChange={handleSelectChange} displayEmpty sx={selectSx}>
                          <MenuItem value="" sx={{ fontSize: '0.75rem' }}>Select RM type</MenuItem>
                          {rmTypeOptions.map((option) => (
                            <MenuItem key={option} value={option} sx={{ fontSize: '0.75rem' }}>{option}</MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Box>
                  </Grid>
                  <Grid size={{ xs: 12, md: 4 }}>
                    <Box><Typography sx={labelStyle}>RM SPECIFICATION</Typography>
                      <TextField fullWidth size="small" name="rm_spec" value={formData.rm_spec} onChange={handleChange} placeholder="e.g., IS 191" sx={textFieldSx} /></Box>
                  </Grid>
                  <Grid size={{ xs: 12, md: 4 }}>
                    <Box><Typography sx={labelStyle}>STRIP SIZE (mm)</Typography>
                      <TextField fullWidth size="small" name="strip_size" value={formData.strip_size} onChange={handleChange} type="number" placeholder="e.g., 3660" error={!!fieldErrors.strip_size} helperText={fieldErrors.strip_size} inputProps={{ min: 0, step: '0.01' }} sx={numberFieldSx} />
                      <Typography sx={{ fontSize: '0.65rem', color: COLORS.text.tertiary }}>For press shop strip width</Typography>
                    </Box>
                  </Grid>
                </Grid>
              </Paper>
            )}
          </Stack>
        );

      case 2: // Process Details
        return (
          <Stack spacing={2}>
            {showProcessParams && (
              <Paper sx={{ p: 2, bgcolor: COLORS.background.white, borderRadius: 1.5, border: `1px solid ${COLORS.border}` }}>
                <Typography variant="subtitle2" sx={{ color: COLORS.primary, mb: 1.5, fontWeight: 600, fontSize: '0.9rem' }}>
                  Manufacturing Process Parameters
                </Typography>
                <Grid container spacing={1.5}>
                  <Grid size={{ xs: 12, md: 4 }}>
                    <Box><Typography sx={labelStyle}>PITCH (mm)</Typography>
                      <TextField fullWidth size="small" name="pitch" value={formData.pitch} onChange={handleChange} type="number" placeholder="e.g., 42" error={!!fieldErrors.pitch} helperText={fieldErrors.pitch} inputProps={{ min: 0, step: '0.01' }} sx={numberFieldSx} />
                      <Typography sx={{ fontSize: '0.65rem', color: COLORS.text.tertiary }}>Progressive die pitch in mm</Typography>
                    </Box>
                  </Grid>
                  <Grid size={{ xs: 12, md: 4 }}>
                    <Box><Typography sx={labelStyle}>NUMBER OF CAVITIES</Typography>
                      <TextField fullWidth size="small" name="no_of_cavity" value={formData.no_of_cavity} onChange={handleChange} type="number" placeholder="e.g., 1" error={!!fieldErrors.no_of_cavity} helperText={fieldErrors.no_of_cavity} inputProps={{ min: 1, step: 1 }} sx={numberFieldSx} /></Box>
                  </Grid>
                </Grid>
              </Paper>
            )}

            {showInventory && (
              <Paper sx={{ p: 2, bgcolor: COLORS.background.white, borderRadius: 1.5, border: `1px solid ${COLORS.border}` }}>
                <Typography variant="subtitle2" sx={{ color: COLORS.primary, mb: 1.5, fontWeight: 600, fontSize: '0.9rem' }}>
                  Inventory Control
                </Typography>
                <Grid container spacing={1.5}>
                  <Grid size={{ xs: 12, md: 4 }}>
                    <Box><Typography sx={labelStyle}>REORDER LEVEL</Typography>
                      <TextField fullWidth size="small" name="reorder_level" value={formData.reorder_level} onChange={handleChange} type="number" placeholder="e.g., 100" error={!!fieldErrors.reorder_level} helperText={fieldErrors.reorder_level} inputProps={{ min: 0, step: 1 }} sx={numberFieldSx} /></Box>
                  </Grid>
                  <Grid size={{ xs: 12, md: 4 }}>
                    <Box><Typography sx={labelStyle}>REORDER QUANTITY</Typography>
                      <TextField fullWidth size="small" name="reorder_qty" value={formData.reorder_qty} onChange={handleChange} type="number" placeholder="e.g., 500" inputProps={{ min: 0, step: 1 }} sx={numberFieldSx} /></Box>
                  </Grid>
                  <Grid size={{ xs: 12, md: 4 }}>
                    <Box><Typography sx={labelStyle}>LEAD TIME (Days)</Typography>
                      <TextField fullWidth size="small" name="lead_time_days" value={formData.lead_time_days} onChange={handleChange} type="number" placeholder="e.g., 7" error={!!fieldErrors.lead_time_days} helperText={fieldErrors.lead_time_days} inputProps={{ min: 0, step: 1 }} sx={numberFieldSx} /></Box>
                  </Grid>
                  <Grid size={{ xs: 12, md: 4 }}>
                    <Box><Typography sx={labelStyle}>SAFETY STOCK</Typography>
                      <TextField fullWidth size="small" name="safety_stock" value={formData.safety_stock} onChange={handleChange} type="number" placeholder="e.g., 50" inputProps={{ min: 0, step: 1 }} sx={numberFieldSx} /></Box>
                  </Grid>
                  <Grid size={{ xs: 12, md: 4 }}>
                    <Box><Typography sx={labelStyle}>MIN STOCK</Typography>
                      <TextField fullWidth size="small" name="min_stock" value={formData.min_stock} onChange={handleChange} type="number" placeholder="e.g., 50" inputProps={{ min: 0, step: 1 }} sx={numberFieldSx} /></Box>
                  </Grid>
                  <Grid size={{ xs: 12, md: 4 }}>
                    <Box><Typography sx={labelStyle}>MAX STOCK</Typography>
                      <TextField fullWidth size="small" name="max_stock" value={formData.max_stock} onChange={handleChange} type="number" placeholder="e.g., 2000" inputProps={{ min: 0, step: 1 }} sx={numberFieldSx} /></Box>
                  </Grid>
                  <Grid size={{ xs: 12, md: 4 }}>
                    <Box><Typography sx={labelStyle}>SHELF LIFE (Days)</Typography>
                      <TextField fullWidth size="small" name="shelf_life_days" value={formData.shelf_life_days} onChange={handleChange} type="number" placeholder="e.g., 365" inputProps={{ min: 0, step: 1 }} sx={numberFieldSx} />
                      <Typography sx={{ fontSize: '0.65rem', color: COLORS.text.tertiary }}>0 means no expiry</Typography>
                    </Box>
                  </Grid>
                </Grid>
              </Paper>
            )}
          </Stack>
        );

      case 3: // Rate & Tax
        return (
          <Stack spacing={2}>
            <Paper sx={{ p: 2, bgcolor: COLORS.background.white, borderRadius: 1.5, border: `1px solid ${COLORS.border}` }}>
              <Typography variant="subtitle2" sx={{ color: COLORS.primary, mb: 1.5, fontWeight: 600, fontSize: '0.9rem' }}>
                Rejection & Scrap Parameters
              </Typography>
              <Grid container spacing={1.5}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Box><Typography sx={labelStyle}>RM REJECTION PERCENTAGE (%)</Typography>
                    <TextField fullWidth size="small" name="rm_rejection_percent" value={formData.rm_rejection_percent} onChange={handleChange} type="number" placeholder="e.g., 2" error={!!fieldErrors.rm_rejection_percent} helperText={fieldErrors.rm_rejection_percent} inputProps={{ min: 0, max: 100, step: 0.1 }} sx={numberFieldSx} />
                    <Typography sx={{ fontSize: '0.65rem', color: COLORS.text.tertiary }}>Defaults to 2.0%</Typography>
                  </Box>
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Box><Typography sx={labelStyle}>SCRAP REALISATION PERCENTAGE (%)</Typography>
                    <TextField fullWidth size="small" name="scrap_realisation_percent" value={formData.scrap_realisation_percent} onChange={handleChange} type="number" placeholder="e.g., 85" error={!!fieldErrors.scrap_realisation_percent} helperText={fieldErrors.scrap_realisation_percent} inputProps={{ min: 0, max: 100, step: 0.1 }} sx={numberFieldSx} />
                    <Typography sx={{ fontSize: '0.65rem', color: COLORS.text.tertiary }}>Defaults to 85%</Typography>
                  </Box>
                </Grid>
              </Grid>
            </Paper>

            {showRateEntry && (
              <Paper sx={{ p: 2, bgcolor: COLORS.background.white, borderRadius: 1.5, border: `1px solid ${COLORS.border}` }}>
                <Typography variant="subtitle2" sx={{ color: COLORS.primary, mb: 1.5, fontWeight: 600, fontSize: '0.9rem' }}>
                  Rate Information (For Costing)
                </Typography>
                <Grid container spacing={1.5}>
                  <Grid size={{ xs: 12, md: 4 }}>
                    <Box><Typography sx={labelStyle}>RATE PER KG (₹)</Typography>
                      <TextField fullWidth size="small" name="rate_per_kg" value={formData.rate_per_kg} onChange={handleChange} type="number" placeholder="e.g., 855" inputProps={{ step: '0.01', min: 0 }} sx={numberFieldSx} />
                      <Typography sx={{ fontSize: '0.65rem', color: COLORS.text.tertiary }}>Current market rate per kg</Typography>
                    </Box>
                  </Grid>
                  <Grid size={{ xs: 12, md: 4 }}>
                    <Box><Typography sx={labelStyle}>PROFILE CONVERSION RATE</Typography>
                      <TextField fullWidth size="small" name="profile_conversion_rate" value={formData.profile_conversion_rate} onChange={handleChange} type="number" placeholder="e.g., 25" inputProps={{ step: '0.01', min: 0 }} sx={numberFieldSx} /></Box>
                  </Grid>
                  <Grid size={{ xs: 12, md: 4 }}>
                    <Box><Typography sx={labelStyle}>SCRAP PERCENTAGE (%)</Typography>
                      <TextField fullWidth size="small" name="scrap_percentage" value={formData.scrap_percentage} onChange={handleChange} type="number" placeholder="e.g., 5" inputProps={{ min: 0, max: 100, step: 0.1 }} sx={numberFieldSx} /></Box>
                  </Grid>
                  <Grid size={{ xs: 12, md: 4 }}>
                    <Box><Typography sx={labelStyle}>TRANSPORT LOSS (%)</Typography>
                      <TextField fullWidth size="small" name="transport_loss_percentage" value={formData.transport_loss_percentage} onChange={handleChange} type="number" placeholder="e.g., 2" inputProps={{ min: 0, max: 100, step: 0.1 }} sx={numberFieldSx} /></Box>
                  </Grid>
                  <Grid size={{ xs: 12, md: 4 }}>
                    <Box><Typography sx={labelStyle}>DATE EFFECTIVE</Typography>
                      <TextField fullWidth size="small" name="date_effective" value={formData.date_effective} onChange={handleChange} type="date" InputLabelProps={{ shrink: true }} sx={textFieldSx} /></Box>
                  </Grid>
                  <Grid size={{ xs: 12, md: 8 }}>
                    <Box><Typography sx={labelStyle}>RATE NOTE</Typography>
                      <TextField fullWidth size="small" name="rate_note" value={formData.rate_note} onChange={handleChange} placeholder="e.g., Q2 2025 rate" sx={textFieldSx} /></Box>
                  </Grid>
                </Grid>
                <Typography sx={{ fontSize: '0.65rem', color: COLORS.text.tertiary, mt: 1 }}>
                  If rate is provided, an initial rate history entry will be created for costing
                </Typography>
              </Paper>
            )}
          </Stack>
        );

      default: return null;
    }
  };

  // ====== MAIN RENDER ======
  return (
    <Paper
      sx={{
        mt: 2,
        p: 3,
        bgcolor: '#ffffff',
        border: `1px solid ${COLORS.border}`,
        borderRadius: 2,
        width: '100%',
        boxSizing: 'border-box',
        // No maxHeight – it will expand to fit content
      }}
    >
      <Typography sx={{ fontSize: '1rem', fontWeight: 700, color: COLORS.text.primary, mb: 2 }}>
        Add New Item
      </Typography>

      <Stepper activeStep={activeStep} alternativeLabel connector={<ColorConnector />} sx={{ mb: 2 }}>
        {itemSteps.map((label) => (
          <Step key={label}>
            <StepLabel><Typography fontSize="0.75rem">{label}</Typography></StepLabel>
          </Step>
        ))}
      </Stepper>

      {error && (
        <Alert severity="error" sx={{ mb: 2, borderRadius: 1.5 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {renderStepContent(activeStep)}

      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
        <Button
          size="small"
          onClick={onClose}
          disabled={loading}
          sx={{ fontSize: '0.7rem', textTransform: 'none' }}
        >
          Cancel
        </Button>
        <Box sx={{ display: 'flex', gap: 1 }}>
          {activeStep > 0 && (
            <Button
              size="small"
              onClick={handleBack}
              disabled={loading}
              startIcon={<NavigateBeforeIcon sx={{ fontSize: '1rem' }} />}
              sx={{ fontSize: '0.7rem', textTransform: 'none' }}
            >
              Back
            </Button>
          )}
          {activeStep === itemSteps.length - 1 ? (
            <Button
              variant="contained"
              size="small"
              onClick={handleSubmit}
              disabled={loading}
              startIcon={loading ? null : <AddIcon sx={{ fontSize: '1rem' }} />}
              sx={{
                fontSize: '0.7rem',
                textTransform: 'none',
                bgcolor: COLORS.primary,
                '&:hover': { bgcolor: COLORS.primaryDark }
              }}
            >
              {loading ? <CircularProgress size={16} sx={{ color: '#fff' }} /> : 'Add Item'}
            </Button>
          ) : (
            <Button
              variant="contained"
              size="small"
              onClick={handleNext}
              disabled={loading}
              endIcon={<NavigateNextIcon sx={{ fontSize: '1rem' }} />}
              sx={{
                fontSize: '0.7rem',
                textTransform: 'none',
                bgcolor: COLORS.primary,
                '&:hover': { bgcolor: COLORS.primaryDark }
              }}
            >
              Next
            </Button>
          )}
        </Box>
      </Box>
    </Paper>
  );
};

// =============================================================================
// MAIN ADD INSPECTION PLAN COMPONENT (unchanged)
// =============================================================================
const AddInspectionPlan = ({ open, onClose, onSuccess, initialData, isEditMode = false }) => {
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  const [items, setItems] = useState([]);
  const [gauges, setGauges] = useState([]);
  const [loadingItems, setLoadingItems] = useState(false);
  const [loadingGauges, setLoadingGauges] = useState(false);

  // Inline Item form state
  const [showInlineAddItem, setShowInlineAddItem] = useState(false);

  const [formData, setFormData] = useState({
    plan_name: '',
    plan_code: '',
    plan_type: '',
    item_id: '',
    revision_no: 1,
    revision_date: '',
    aql_level: '',
    sampling_plan: '',
    instructions: '',
    checkpoints: []
  });

  const showError = (message) => {
    setError(message);
    setTimeout(() => setError(''), 5000);
  };

  const fetchItems = useCallback(async () => {
    try {
      setLoadingItems(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(`${BASE_URL}/api/items?limit=100`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success) setItems(response.data.data || []);
    } catch (err) {
      console.error('Error fetching items:', err);
    } finally {
      setLoadingItems(false);
    }
  }, []);

  const fetchGauges = useCallback(async () => {
    try {
      setLoadingGauges(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(`${BASE_URL}/api/gauges?limit=100`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success) {
        const filteredGauges = (response.data.data || []).filter(g => g.status === 'Calibrated');
        setGauges(filteredGauges);
      }
    } catch (err) {
      console.error('Error fetching gauges:', err);
    } finally {
      setLoadingGauges(false);
    }
  }, []);

  useEffect(() => {
    if (open) {
      fetchItems();
      fetchGauges();
    }
  }, [open, fetchItems, fetchGauges]);

  useEffect(() => {
    if (isEditMode && initialData && open) {
      const itemId = initialData.item_id?._id || initialData.item_id || '';
      setFormData({
        plan_name: initialData.plan_name || '',
        plan_code: initialData.plan_id || initialData.plan_code || '',
        plan_type: initialData.plan_type || '',
        item_id: itemId,
        revision_no: initialData.revision_no || 1,
        revision_date: initialData.revision_date ? initialData.revision_date.split('T')[0] : new Date().toISOString().split('T')[0],
        aql_level: initialData.aql_level || '',
        sampling_plan: initialData.sampling_plan || '',
        instructions: initialData.instructions || '',
        checkpoints: (initialData.checkpoints || []).map((cp, index) => ({
          step_no: cp.step_no || index + 1,
          characteristic: cp.characteristic || '',
          characteristic_type: cp.characteristic_type || '',
          specification: cp.specification || '',
          method: cp.method || '',
          sample_size: cp.sample_size || '',
          frequency: cp.frequency || '',
          gauge_id: cp.gauge_id?._id || cp.gauge_id || '',
          acceptance_criteria: cp.acceptance_criteria || '',
          is_critical: cp.is_critical || false,
          is_significant: cp.is_significant || false,
          is_spc: cp.is_spc || false,
          nominal_value: cp.nominal_value || '',
          upper_tolerance: cp.upper_tolerance || '',
          lower_tolerance: cp.lower_tolerance || '',
          unit: cp.unit || '',
          photo_required: cp.photo_required || false
        }))
      });
    }
  }, [isEditMode, initialData, open]);

  useEffect(() => {
    if (!open) {
      resetForm();
      setShowInlineAddItem(false);
    }
  }, [open]);

  const resetForm = () => {
    setActiveStep(0);
    setFormData({
      plan_name: '',
      plan_code: '',
      plan_type: '',
      item_id: '',
      revision_no: 1,
      revision_date: new Date().toISOString().split('T')[0],
      aql_level: '',
      sampling_plan: '',
      instructions: '',
      checkpoints: []
    });
    setFieldErrors({});
    setError('');
    setShowInlineAddItem(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setFieldErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleCheckpointChange = (index, field, value) => {
    const updatedCheckpoints = [...formData.checkpoints];
    updatedCheckpoints[index][field] = value;
    setFormData(prev => ({ ...prev, checkpoints: updatedCheckpoints }));
    setFieldErrors(prev => ({ ...prev, [`checkpoint_${index}_${field}`]: '' }));
  };

  const addCheckpoint = () => {
    setFormData(prev => ({
      ...prev,
      checkpoints: [
        ...prev.checkpoints,
        {
          step_no: prev.checkpoints.length + 1,
          characteristic: '',
          characteristic_type: '',
          specification: '',
          method: '',
          sample_size: '',
          frequency: '',
          gauge_id: '',
          acceptance_criteria: '',
          is_critical: false,
          is_significant: false,
          is_spc: false,
          nominal_value: '',
          upper_tolerance: '',
          lower_tolerance: '',
          unit: '',
          photo_required: false
        }
      ]
    }));
  };

  const removeCheckpoint = (index) => {
    if (formData.checkpoints.length > 1) {
      const updated = formData.checkpoints.filter((_, i) => i !== index);
      updated.forEach((cp, idx) => cp.step_no = idx + 1);
      setFormData(prev => ({ ...prev, checkpoints: updated }));
    }
  };

  // Handle inline item added
  const handleInlineItemAdded = (newItem) => {
    setItems(prev => [...prev, newItem]);
    setFormData(prev => ({ ...prev, item_id: newItem._id }));
    setShowInlineAddItem(false);
  };

  const validateStep = (step) => {
    const errors = {};
    let isValid = true;
    const msgs = [];

    switch (step) {
      case 0:
        if (!formData.plan_name.trim()) { errors.plan_name = 'Plan name is required'; msgs.push('Plan name is required'); isValid = false; }
        if (!formData.plan_code) { errors.plan_code = 'Plan code is required'; msgs.push('Plan code is required'); isValid = false; }
        if (!formData.plan_type) { errors.plan_type = 'Plan type is required'; msgs.push('Plan type is required'); isValid = false; }
        if (!formData.item_id) { errors.item_id = 'Item is required'; msgs.push('Item is required'); isValid = false; }
        if (!formData.revision_date) { errors.revision_date = 'Revision date is required'; msgs.push('Revision date is required'); isValid = false; }
        break;
      case 1:
        for (let i = 0; i < formData.checkpoints.length; i++) {
          const cp = formData.checkpoints[i];
          if (!cp.characteristic) { errors[`checkpoint_${i}_characteristic`] = `Checkpoint ${i+1}: Characteristic is required`; msgs.push(`Checkpoint ${i+1}: Characteristic is required`); isValid = false; }
          if (!cp.characteristic_type) { errors[`checkpoint_${i}_characteristic_type`] = `Checkpoint ${i+1}: Characteristic type is required`; msgs.push(`Checkpoint ${i+1}: Characteristic type is required`); isValid = false; }
          if (!cp.specification) { errors[`checkpoint_${i}_specification`] = `Checkpoint ${i+1}: Specification is required`; msgs.push(`Checkpoint ${i+1}: Specification is required`); isValid = false; }
          if (!cp.method) { errors[`checkpoint_${i}_method`] = `Checkpoint ${i+1}: Method is required`; msgs.push(`Checkpoint ${i+1}: Method is required`); isValid = false; }
          if (!cp.sample_size) { errors[`checkpoint_${i}_sample_size`] = `Checkpoint ${i+1}: Sample size is required`; msgs.push(`Checkpoint ${i+1}: Sample size is required`); isValid = false; }
          if (cp.sample_size && cp.sample_size <= 0) { errors[`checkpoint_${i}_sample_size`] = `Checkpoint ${i+1}: Sample size must be > 0`; msgs.push(`Checkpoint ${i+1}: Sample size must be > 0`); isValid = false; }
          if (!cp.frequency) { errors[`checkpoint_${i}_frequency`] = `Checkpoint ${i+1}: Frequency is required`; msgs.push(`Checkpoint ${i+1}: Frequency is required`); isValid = false; }
          if (!cp.gauge_id) { errors[`checkpoint_${i}_gauge_id`] = `Checkpoint ${i+1}: Gauge is required`; msgs.push(`Checkpoint ${i+1}: Gauge is required`); isValid = false; }
        }
        break;
      default: return true;
    }
    setFieldErrors(errors);
    if (!isValid) showError(msgs[0]);
    return isValid;
  };

  const validateForm = () => {
    const errors = {};
    let isValid = true;
    const msgs = [];

    if (!formData.plan_name.trim()) { errors.plan_name = 'Plan name is required'; msgs.push('Plan name is required'); isValid = false; }
    if (!formData.plan_code) { errors.plan_code = 'Plan code is required'; msgs.push('Plan code is required'); isValid = false; }
    if (!formData.plan_type) { errors.plan_type = 'Plan type is required'; msgs.push('Plan type is required'); isValid = false; }
    if (!formData.item_id) { errors.item_id = 'Item is required'; msgs.push('Item is required'); isValid = false; }
    if (!formData.revision_date) { errors.revision_date = 'Revision date is required'; msgs.push('Revision date is required'); isValid = false; }

    for (let i = 0; i < formData.checkpoints.length; i++) {
      const cp = formData.checkpoints[i];
      if (!cp.characteristic) { errors[`checkpoint_${i}_characteristic`] = `Checkpoint ${i+1}: Characteristic is required`; msgs.push(`Checkpoint ${i+1}: Characteristic is required`); isValid = false; }
      if (!cp.characteristic_type) { errors[`checkpoint_${i}_characteristic_type`] = `Checkpoint ${i+1}: Characteristic type is required`; msgs.push(`Checkpoint ${i+1}: Characteristic type is required`); isValid = false; }
      if (!cp.specification) { errors[`checkpoint_${i}_specification`] = `Checkpoint ${i+1}: Specification is required`; msgs.push(`Checkpoint ${i+1}: Specification is required`); isValid = false; }
      if (!cp.method) { errors[`checkpoint_${i}_method`] = `Checkpoint ${i+1}: Method is required`; msgs.push(`Checkpoint ${i+1}: Method is required`); isValid = false; }
      if (!cp.sample_size) { errors[`checkpoint_${i}_sample_size`] = `Checkpoint ${i+1}: Sample size is required`; msgs.push(`Checkpoint ${i+1}: Sample size is required`); isValid = false; }
      if (!cp.frequency) { errors[`checkpoint_${i}_frequency`] = `Checkpoint ${i+1}: Frequency is required`; msgs.push(`Checkpoint ${i+1}: Frequency is required`); isValid = false; }
      if (!cp.gauge_id) { errors[`checkpoint_${i}_gauge_id`] = `Checkpoint ${i+1}: Gauge is required`; msgs.push(`Checkpoint ${i+1}: Gauge is required`); isValid = false; }
    }

    setFieldErrors(errors);
    if (!isValid) showError(msgs[0]);
    return isValid;
  };

  const handleNext = () => {
    if (validateStep(activeStep)) setActiveStep((prev) => prev + 1);
  };

  const handleBack = () => setActiveStep((prev) => prev - 1);

  const handleSubmit = async () => {
    if (!validateForm()) return;
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const requestData = {
        plan_name: formData.plan_name,
        plan_code: formData.plan_code,
        plan_type: formData.plan_type,
        item_id: formData.item_id,
        revision_no: Number(formData.revision_no),
        revision_date: formData.revision_date,
        aql_level: formData.aql_level || undefined,
        sampling_plan: formData.sampling_plan || undefined,
        instructions: formData.instructions || '',
        checkpoints: formData.checkpoints.map(cp => ({
          step_no: cp.step_no,
          characteristic: cp.characteristic,
          characteristic_type: cp.characteristic_type,
          specification: cp.specification,
          method: cp.method,
          sample_size: Number(cp.sample_size),
          frequency: cp.frequency,
          gauge_id: cp.gauge_id,
          acceptance_criteria: cp.acceptance_criteria || '',
          is_critical: cp.is_critical || false,
          is_significant: cp.is_significant || false,
          is_spc: cp.is_spc || false,
          nominal_value: cp.nominal_value ? Number(cp.nominal_value) : undefined,
          upper_tolerance: cp.upper_tolerance ? Number(cp.upper_tolerance) : undefined,
          lower_tolerance: cp.lower_tolerance ? Number(cp.lower_tolerance) : undefined,
          unit: cp.unit || '',
          photo_required: cp.photo_required || false
        }))
      };

      const response = isEditMode
        ? await axios.put(`${BASE_URL}/api/inspection-plans/${initialData._id}`, requestData, { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } })
        : await axios.post(`${BASE_URL}/api/inspection-plans`, requestData, { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } });

      if (response.data.success) {
        onSuccess();
        resetForm();
        onClose();
      } else {
        showError(response.data.message || `Failed to ${isEditMode ? 'update' : 'create'} inspection plan`);
      }
    } catch (err) {
      console.error('Error saving inspection plan:', err);
      showError(err.response?.data?.message || `Failed to ${isEditMode ? 'update' : 'create'} inspection plan. Please try again.`);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const getGaugeDisplay = (gauge) => {
    if (!gauge) return '';
    return `${gauge.gauge_code || gauge.gauge_id} - ${gauge.gauge_name}`;
  };

  const renderStepContent = (step) => {
    switch (step) {
     case 0:
        return (
          <Stack spacing={2}>
            <Paper sx={{ p: 2, bgcolor: COLORS.background.white, borderRadius: 1.5, border: `1px solid ${COLORS.border}` }}>
              <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color: COLORS.primary, mb: 1.5 }}>
                <PlanIcon sx={{ fontSize: '1rem', mr: 0.5, verticalAlign: 'middle' }} />
                Plan Details
              </Typography>

              <Grid container spacing={1.5}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                    <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary }}>
                      Plan Name <span style={{ color: '#EF4444' }}>*</span>
                    </Typography>
                    <TextField
                      fullWidth size="small" name="plan_name" value={formData.plan_name} onChange={handleChange}
                      placeholder="e.g., Incoming QC Plan for Steel Rods" error={!!fieldErrors.plan_name} helperText={fieldErrors.plan_name}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 1.5, fontSize: '0.75rem',
                          '&:hover fieldset': { borderColor: COLORS.primary },
                          '&.Mui-focused fieldset': { borderColor: COLORS.primary, borderWidth: 1 },
                          '&.Mui-error fieldset': { borderColor: '#EF4444' }
                        },
                        '& .MuiInputBase-input': { py: 1, px: 1.5, fontSize: '0.75rem' }
                      }}
                    />
                  </Box>
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                    <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary }}>
                      Plan Code <span style={{ color: '#EF4444' }}>*</span>
                    </Typography>
                    <TextField
                      fullWidth size="small" name="plan_code" value={formData.plan_code} onChange={handleChange}
                      placeholder="e.g., IP-2026-001" error={!!fieldErrors.plan_code} helperText={fieldErrors.plan_code}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 1.5, fontSize: '0.75rem',
                          '&:hover fieldset': { borderColor: COLORS.primary },
                          '&.Mui-focused fieldset': { borderColor: COLORS.primary, borderWidth: 1 },
                          '&.Mui-error fieldset': { borderColor: '#EF4444' }
                        },
                        '& .MuiInputBase-input': { py: 1, px: 1.5, fontSize: '0.75rem' }
                      }}
                    />
                  </Box>
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                    <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary }}>
                      Plan Type <span style={{ color: '#EF4444' }}>*</span>
                    </Typography>
                    <FormControl fullWidth size="small" error={!!fieldErrors.plan_type}>
                      <Select name="plan_type" value={formData.plan_type} onChange={handleChange} displayEmpty sx={{ borderRadius: 1.5, fontSize: '0.75rem', '& .MuiSelect-select': { py: 1, px: 1.5 } }}>
                        <MenuItem value="" disabled>Select plan type</MenuItem>
                        {PLAN_TYPE_OPTIONS.map(opt => <MenuItem key={opt} value={opt} sx={{ fontSize: '0.75rem' }}>{opt}</MenuItem>)}
                      </Select>
                      {fieldErrors.plan_type && <Typography sx={{ fontSize: '0.65rem', color: '#EF4444' }}>{fieldErrors.plan_type}</Typography>}
                    </FormControl>
                  </Box>
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary }}>
                        Item / Part <span style={{ color: '#EF4444' }}>*</span>
                      </Typography>
                      <Button
                        variant="text"
                        size="small"
                        onClick={() => setShowInlineAddItem(!showInlineAddItem)}
                        startIcon={showInlineAddItem ? <CloseIcon sx={{ fontSize: '0.875rem' }} /> : <AddIcon sx={{ fontSize: '0.875rem' }} />}
                        sx={{ height: 28, minWidth: 'auto', px: 1, borderRadius: 1.5, color: COLORS.primary, fontSize: '0.65rem', fontWeight: 500, textTransform: 'none', '&:hover': { bgcolor: `${COLORS.primary}10` } }}
                      >
                        {showInlineAddItem ? 'Cancel' : 'Add New'}
                      </Button>
                    </Box>
                    <Autocomplete
                      fullWidth
                      options={items}
                      getOptionLabel={(option) => `${option.part_no} - ${option.part_description || ''}`}
                      value={items.find(i => i._id === formData.item_id) || null}
                      onChange={(event, newValue) => {
                        setFormData(prev => ({ ...prev, item_id: newValue?._id || '' }));
                        setFieldErrors(prev => ({ ...prev, item_id: '' }));
                      }}
                      loading={loadingItems}
                      disabled={showInlineAddItem}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          size="small"
                          error={!!fieldErrors.item_id}
                          helperText={fieldErrors.item_id}
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              borderRadius: 1.5, fontSize: '0.75rem',
                              '&:hover fieldset': { borderColor: COLORS.primary },
                              '&.Mui-focused fieldset': { borderColor: COLORS.primary, borderWidth: 1 },
                              '&.Mui-error fieldset': { borderColor: '#EF4444' }
                            },
                            '& .MuiInputBase-input': { py: 1, px: 1.5, fontSize: '0.75rem' }
                          }}
                        />
                      )}
                    />
                  </Box>
                </Grid>

                {/* Inline Add Item Form - moved here so it spans full width */}
                {showInlineAddItem && (
                  <Grid size={{ xs: 12 }}>
                    <InlineAddItem
                      onClose={() => setShowInlineAddItem(false)}
                      onSave={handleInlineItemAdded}
                    />
                  </Grid>
                )}

                <Grid size={{ xs: 12, sm: 6 }}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                    <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary }}>
                      Revision No
                    </Typography>
                    <TextField
                      fullWidth type="number" size="small" name="revision_no"
                      value={formData.revision_no} onChange={handleChange} placeholder="1"
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 1.5, fontSize: '0.75rem',
                          '&:hover fieldset': { borderColor: COLORS.primary },
                          '&.Mui-focused fieldset': { borderColor: COLORS.primary, borderWidth: 1 }
                        },
                        '& .MuiInputBase-input': { py: 1, px: 1.5, fontSize: '0.75rem' }
                      }}
                    />
                  </Box>
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                    <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary }}>
                      Revision Date <span style={{ color: '#EF4444' }}>*</span>
                    </Typography>
                    <TextField
                      fullWidth type="date" size="small" name="revision_date"
                      value={formData.revision_date} onChange={handleChange}
                      error={!!fieldErrors.revision_date} helperText={fieldErrors.revision_date}
                      InputLabelProps={{ shrink: true }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 1.5, fontSize: '0.75rem',
                          '&:hover fieldset': { borderColor: COLORS.primary },
                          '&.Mui-focused fieldset': { borderColor: COLORS.primary, borderWidth: 1 },
                          '&.Mui-error fieldset': { borderColor: '#EF4444' }
                        },
                        '& .MuiInputBase-input': { py: 1, px: 1.5, fontSize: '0.75rem' }
                      }}
                    />
                  </Box>
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                    <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary }}>
                      AQL Level
                    </Typography>
                    <TextField
                      fullWidth size="small" name="aql_level" value={formData.aql_level} onChange={handleChange}
                      placeholder="e.g., S-4, I, II"
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 1.5, fontSize: '0.75rem',
                          '&:hover fieldset': { borderColor: COLORS.primary },
                          '&.Mui-focused fieldset': { borderColor: COLORS.primary, borderWidth: 1 }
                        },
                        '& .MuiInputBase-input': { py: 1, px: 1.5, fontSize: '0.75rem' }
                      }}
                    />
                  </Box>
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                    <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary }}>
                      Sampling Plan
                    </Typography>
                    <TextField
                      fullWidth size="small" name="sampling_plan" value={formData.sampling_plan} onChange={handleChange}
                      placeholder="e.g., Normal, Tightened, Reduced"
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 1.5, fontSize: '0.75rem',
                          '&:hover fieldset': { borderColor: COLORS.primary },
                          '&.Mui-focused fieldset': { borderColor: COLORS.primary, borderWidth: 1 }
                        },
                        '& .MuiInputBase-input': { py: 1, px: 1.5, fontSize: '0.75rem' }
                      }}
                    />
                  </Box>
                </Grid>

                <Grid size={{ xs: 12 }}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                    <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary }}>
                      Instructions
                    </Typography>
                    <TextField
                      fullWidth multiline rows={3} size="small" name="instructions"
                      value={formData.instructions} onChange={handleChange}
                      placeholder="Follow standard operating procedure QP-007..."
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 1.5, fontSize: '0.75rem',
                          '&:hover fieldset': { borderColor: COLORS.primary },
                          '&.Mui-focused fieldset': { borderColor: COLORS.primary, borderWidth: 1 }
                        },
                        '& .MuiInputBase-input': { py: 1, px: 1.5, fontSize: '0.75rem' }
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
            <Paper sx={{ p: 2, bgcolor: COLORS.background.white, borderRadius: 1.5, border: `1px solid ${COLORS.border}` }}>
              <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color: COLORS.primary, mb: 1.5 }}>
                <QrCodeIcon sx={{ fontSize: '1rem', mr: 0.5, verticalAlign: 'middle' }} />
                Inspection Checkpoints
              </Typography>

              {formData.checkpoints.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography sx={{ fontSize: '0.75rem', color: COLORS.text.secondary, mb: 2 }}>
                    No checkpoints added yet. Click "Add Checkpoint" to create one.
                  </Typography>
                  <Button
                    variant="outlined"
                    startIcon={<AddIcon sx={{ fontSize: '1rem' }} />}
                    onClick={addCheckpoint}
                    sx={{ height: 32, px: 2, borderRadius: 1.5, borderColor: COLORS.primary, color: COLORS.primary, fontSize: '0.7rem', fontWeight: 500, textTransform: 'none' }}
                  >
                    Add Checkpoint
                  </Button>
                </Box>
              ) : (
                <>
                  {formData.checkpoints.map((checkpoint, index) => (
                    <Paper key={index} sx={{ p: 1.5, mb: 2, bgcolor: COLORS.background.light, borderRadius: 1.5, border: `1px solid ${COLORS.border}` }}>
                      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.5 }}>
                        <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: COLORS.primary }}>
                          Checkpoint {checkpoint.step_no || index + 1}
                        </Typography>
                        {formData.checkpoints.length > 1 && (
                          <IconButton size="small" onClick={() => removeCheckpoint(index)} sx={{ color: '#EF4444' }}>
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        )}
                      </Stack>

                      <Grid container spacing={1.5}>
                        <Grid size={{ xs: 12, sm: 6 }}>
                          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                            <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary }}>
                              Characteristic <span style={{ color: '#EF4444' }}>*</span>
                            </Typography>
                            <TextField
                              fullWidth size="small"
                              value={checkpoint.characteristic}
                              onChange={(e) => handleCheckpointChange(index, 'characteristic', e.target.value)}
                              placeholder="e.g., Length, Diameter, Hardness"
                              error={!!fieldErrors[`checkpoint_${index}_characteristic`]}
                              helperText={fieldErrors[`checkpoint_${index}_characteristic`]}
                              sx={{
                                '& .MuiOutlinedInput-root': {
                                  borderRadius: 1.5, fontSize: '0.75rem',
                                  '&:hover fieldset': { borderColor: COLORS.primary },
                                  '&.Mui-focused fieldset': { borderColor: COLORS.primary, borderWidth: 1 },
                                  '&.Mui-error fieldset': { borderColor: '#EF4444' }
                                },
                                '& .MuiInputBase-input': { py: 1, px: 1.5, fontSize: '0.75rem' }
                              }}
                            />
                          </Box>
                        </Grid>

                        <Grid size={{ xs: 12, sm: 6 }}>
                          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                            <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary }}>
                              Characteristic Type <span style={{ color: '#EF4444' }}>*</span>
                            </Typography>
                            <FormControl fullWidth size="small" error={!!fieldErrors[`checkpoint_${index}_characteristic_type`]}>
                              <Select
                                value={checkpoint.characteristic_type}
                                onChange={(e) => handleCheckpointChange(index, 'characteristic_type', e.target.value)}
                                displayEmpty
                                sx={{ borderRadius: 1.5, fontSize: '0.75rem', '& .MuiSelect-select': { py: 1, px: 1.5 } }}
                              >
                                <MenuItem value="" disabled>Select type</MenuItem>
                                {CHARACTERISTIC_TYPE_OPTIONS.map(opt => <MenuItem key={opt} value={opt} sx={{ fontSize: '0.75rem' }}>{opt}</MenuItem>)}
                              </Select>
                              {fieldErrors[`checkpoint_${index}_characteristic_type`] && (
                                <Typography sx={{ fontSize: '0.65rem', color: '#EF4444' }}>{fieldErrors[`checkpoint_${index}_characteristic_type`]}</Typography>
                              )}
                            </FormControl>
                          </Box>
                        </Grid>

                        <Grid size={{ xs: 12, sm: 6 }}>
                          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                            <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary }}>
                              Specification <span style={{ color: '#EF4444' }}>*</span>
                            </Typography>
                            <TextField
                              fullWidth size="small"
                              value={checkpoint.specification}
                              onChange={(e) => handleCheckpointChange(index, 'specification', e.target.value)}
                              placeholder="e.g., 100mm ± 0.5mm"
                              error={!!fieldErrors[`checkpoint_${index}_specification`]}
                              helperText={fieldErrors[`checkpoint_${index}_specification`]}
                              sx={{
                                '& .MuiOutlinedInput-root': {
                                  borderRadius: 1.5, fontSize: '0.75rem',
                                  '&:hover fieldset': { borderColor: COLORS.primary },
                                  '&.Mui-focused fieldset': { borderColor: COLORS.primary, borderWidth: 1 },
                                  '&.Mui-error fieldset': { borderColor: '#EF4444' }
                                },
                                '& .MuiInputBase-input': { py: 1, px: 1.5, fontSize: '0.75rem' }
                              }}
                            />
                          </Box>
                        </Grid>

                        <Grid size={{ xs: 12, sm: 6 }}>
                          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                            <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary }}>
                              Method <span style={{ color: '#EF4444' }}>*</span>
                            </Typography>
                            <TextField
                              fullWidth size="small"
                              value={checkpoint.method}
                              onChange={(e) => handleCheckpointChange(index, 'method', e.target.value)}
                              placeholder="e.g., Vernier Caliper, Micrometer"
                              error={!!fieldErrors[`checkpoint_${index}_method`]}
                              helperText={fieldErrors[`checkpoint_${index}_method`]}
                              sx={{
                                '& .MuiOutlinedInput-root': {
                                  borderRadius: 1.5, fontSize: '0.75rem',
                                  '&:hover fieldset': { borderColor: COLORS.primary },
                                  '&.Mui-focused fieldset': { borderColor: COLORS.primary, borderWidth: 1 },
                                  '&.Mui-error fieldset': { borderColor: '#EF4444' }
                                },
                                '& .MuiInputBase-input': { py: 1, px: 1.5, fontSize: '0.75rem' }
                              }}
                            />
                          </Box>
                        </Grid>

                        <Grid size={{ xs: 12, sm: 4 }}>
                          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                            <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary }}>
                              Sample Size <span style={{ color: '#EF4444' }}>*</span>
                            </Typography>
                            <TextField
                              fullWidth type="number" size="small"
                              value={checkpoint.sample_size}
                              onChange={(e) => handleCheckpointChange(index, 'sample_size', e.target.value)}
                              placeholder="5"
                              error={!!fieldErrors[`checkpoint_${index}_sample_size`]}
                              helperText={fieldErrors[`checkpoint_${index}_sample_size`]}
                              sx={{
                                '& .MuiOutlinedInput-root': {
                                  borderRadius: 1.5, fontSize: '0.75rem',
                                  '&:hover fieldset': { borderColor: COLORS.primary },
                                  '&.Mui-focused fieldset': { borderColor: COLORS.primary, borderWidth: 1 },
                                  '&.Mui-error fieldset': { borderColor: '#EF4444' }
                                },
                                '& .MuiInputBase-input': { py: 1, px: 1.5, fontSize: '0.75rem' }
                              }}
                            />
                          </Box>
                        </Grid>

                        <Grid size={{ xs: 12, sm: 4 }}>
                          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                            <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary }}>
                              Frequency <span style={{ color: '#EF4444' }}>*</span>
                            </Typography>
                            <FormControl fullWidth size="small" error={!!fieldErrors[`checkpoint_${index}_frequency`]}>
                              <Select
                                value={checkpoint.frequency}
                                onChange={(e) => handleCheckpointChange(index, 'frequency', e.target.value)}
                                displayEmpty
                                sx={{ borderRadius: 1.5, fontSize: '0.75rem', '& .MuiSelect-select': { py: 1, px: 1.5 } }}
                              >
                                <MenuItem value="" disabled>Select frequency</MenuItem>
                                {FREQUENCY_OPTIONS.map(opt => <MenuItem key={opt} value={opt} sx={{ fontSize: '0.75rem' }}>{opt}</MenuItem>)}
                              </Select>
                              {fieldErrors[`checkpoint_${index}_frequency`] && (
                                <Typography sx={{ fontSize: '0.65rem', color: '#EF4444' }}>{fieldErrors[`checkpoint_${index}_frequency`]}</Typography>
                              )}
                            </FormControl>
                          </Box>
                        </Grid>

                        <Grid size={{ xs: 12, sm: 4 }}>
                          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                            <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary }}>
                              Gauge <span style={{ color: '#EF4444' }}>*</span>
                            </Typography>
                            <FormControl fullWidth size="small" error={!!fieldErrors[`checkpoint_${index}_gauge_id`]}>
                              <Select
                                value={checkpoint.gauge_id}
                                onChange={(e) => handleCheckpointChange(index, 'gauge_id', e.target.value)}
                                displayEmpty
                                disabled={loadingGauges}
                                sx={{ borderRadius: 1.5, fontSize: '0.75rem', '& .MuiSelect-select': { py: 1, px: 1.5 } }}
                              >
                                <MenuItem value="" disabled>Select gauge</MenuItem>
                                {gauges.map(gauge => (
                                  <MenuItem key={gauge._id} value={gauge._id} sx={{ fontSize: '0.75rem' }}>
                                    {getGaugeDisplay(gauge)}
                                  </MenuItem>
                                ))}
                              </Select>
                              {fieldErrors[`checkpoint_${index}_gauge_id`] && (
                                <Typography sx={{ fontSize: '0.65rem', color: '#EF4444' }}>{fieldErrors[`checkpoint_${index}_gauge_id`]}</Typography>
                              )}
                            </FormControl>
                          </Box>
                        </Grid>

                        <Grid size={{ xs: 12 }}>
                          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                            <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary }}>
                              Acceptance Criteria
                            </Typography>
                            <TextField
                              fullWidth multiline rows={2} size="small"
                              value={checkpoint.acceptance_criteria}
                              onChange={(e) => handleCheckpointChange(index, 'acceptance_criteria', e.target.value)}
                              placeholder="e.g., All samples within tolerance"
                              sx={{
                                '& .MuiOutlinedInput-root': {
                                  borderRadius: 1.5, fontSize: '0.75rem',
                                  '&:hover fieldset': { borderColor: COLORS.primary },
                                  '&.Mui-focused fieldset': { borderColor: COLORS.primary, borderWidth: 1 }
                                },
                                '& .MuiInputBase-input': { py: 1, px: 1.5, fontSize: '0.75rem' }
                              }}
                            />
                          </Box>
                        </Grid>
                      </Grid>
                    </Paper>
                  ))}

                  <Button
                    variant="outlined"
                    startIcon={<AddIcon sx={{ fontSize: '1rem' }} />}
                    onClick={addCheckpoint}
                    sx={{ height: 32, px: 2, borderRadius: 1.5, border: `1px solid ${COLORS.border}`, color: COLORS.text.secondary, fontSize: '0.7rem', fontWeight: 500, textTransform: 'none', '&:hover': { borderColor: COLORS.primary, bgcolor: `${COLORS.primary}10` } }}
                  >
                    Add Checkpoint
                  </Button>
                </>
              )}
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
      maxWidth="lg"
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
        py: 1.5, px: 2.5,
        bgcolor: COLORS.background.white,
        display: 'flex', justifyContent: 'space-between', alignItems: 'center'
      }}>
        <Typography sx={{ fontSize: '1.2rem', fontWeight: 700, color: COLORS.text.primary }}>
          {isEditMode ? 'Edit Inspection Plan' : 'Add Inspection Plan'}
        </Typography>
      </DialogTitle>

      <Box sx={{ px: 2.5, pt: 1 }}>
        <FloatingErrorAlert error={error} onClose={() => setError('')} />
      </Box>

      <Box sx={{ px: 2.5, pt: error ? 1 : 2, bgcolor: COLORS.background.white }}>
        <Stepper activeStep={activeStep} alternativeLabel connector={<ColorConnector />}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>
                <Typography sx={{ fontSize: '0.75rem', fontWeight: 500, color: COLORS.text.secondary }}>
                  {label}
                </Typography>
              </StepLabel>
            </Step>
          ))}
        </Stepper>
      </Box>

      <DialogContent sx={{ p: 2.5, pt: error ? 1 : 2, bgcolor: COLORS.background.white }}>
        {renderStepContent(activeStep)}
      </DialogContent>

      <DialogActions sx={{
        px: 2.5, py: 1.5,
        borderTop: `1px solid ${COLORS.border}`,
        bgcolor: COLORS.background.white,
        justifyContent: 'space-between'
      }}>
        <Button
          onClick={handleBack}
          disabled={activeStep === 0 || loading}
          startIcon={<NavigateBeforeIcon sx={{ fontSize: '1rem' }} />}
          sx={{
            height: 32, px: 2, borderRadius: 1.5, border: `1px solid ${COLORS.border}`,
            color: COLORS.text.secondary, fontSize: '0.7rem', fontWeight: 500, textTransform: 'none',
            '&:hover': { borderColor: COLORS.primary, bgcolor: `${COLORS.primary}10` }
          }}
        >
          Back
        </Button>
        <Box>
          <Button
            onClick={handleClose}
            disabled={loading}
            sx={{
              height: 32, px: 2, mr: 1, borderRadius: 1.5, border: `1px solid ${COLORS.border}`,
              color: COLORS.text.secondary, fontSize: '0.7rem', fontWeight: 500, textTransform: 'none',
              '&:hover': { borderColor: COLORS.primary, bgcolor: `${COLORS.primary}10` }
            }}
          >
            Cancel
          </Button>
          {activeStep === steps.length - 1 ? (
            <Button
              variant="contained"
              onClick={handleSubmit}
              disabled={loading}
              startIcon={<AddIcon sx={{ fontSize: '1rem' }} />}
              sx={{
                height: 32, px: 2, borderRadius: 1.5, bgcolor: COLORS.primary,
                fontSize: '0.7rem', fontWeight: 500, textTransform: 'none',
                boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
                '&:hover': { bgcolor: COLORS.primaryDark }
              }}
            >
              {loading ? (isEditMode ? 'Updating...' : 'Creating...') : (isEditMode ? 'Update Plan' : 'Create Plan')}
            </Button>
          ) : (
            <Button
              variant="contained"
              onClick={handleNext}
              disabled={loading}
              endIcon={<NavigateNextIcon sx={{ fontSize: '1rem' }} />}
              sx={{
                height: 32, px: 2, borderRadius: 1.5, bgcolor: COLORS.primary,
                fontSize: '0.7rem', fontWeight: 500, textTransform: 'none',
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

export default AddInspectionPlan;