// import React, { useState, useEffect } from 'react';
// import {
//   Box,
//   Paper,
//   Grid,
//   Stepper,
//   Step,
//   StepLabel,
//   StepConnector,
//   stepConnectorClasses,
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
//   Autocomplete,
//   InputAdornment,
//   styled,
//   Chip,
//   CircularProgress
// } from '@mui/material';
// import {
//   Add as AddIcon,
//   Close as CloseIcon,
//   NavigateNext as NavigateNextIcon,
//   NavigateBefore as NavigateBeforeIcon,
//   Search as SearchIcon,
//   Refresh as RefreshIcon,
//   Factory as FactoryIcon
// } from '@mui/icons-material';
// import axios from 'axios';
// import BASE_URL from '../../../config/Config';
// import AddDepartments from '../../hrmaster/departmentmaster/AddDepartments';
// import MrpRun from '../../bommaster/MRP/MrpRun'; // Import the MrpRun component

// const COLORS = {
//   primary: '#063C3F',
//   primaryLight: '#E8F0F1',
//   primaryDark: '#05292B',
//   text: { primary: '#151C26', secondary: '#4B5568', tertiary: '#94A3B8' },
//   background: { white: '#FFFFFF', light: '#F8FFFC', hover: '#F0FDF9' },
//   border: '#E3E8EF'
// };

// // Modern Stepper Connector
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

// // Custom styled Paper for dropdowns
// const CustomPaper = styled(Paper)({
//   maxHeight: 200,
//   overflow: 'auto',
//   '&::-webkit-scrollbar': {
//     display: 'none'
//   },
//   scrollbarWidth: 'none',
//   '-ms-overflow-style': 'none'
// });

// const steps = ['Basic Information', 'Item Details'];

// const AddPurchaseRequisition = ({ open, onClose, onAdd }) => {
//   const [activeStep, setActiveStep] = useState(0);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState('');
//   const [items, setItems] = useState([]);
//   const [loadingItems, setLoadingItems] = useState(false);
//   const [departments, setDepartments] = useState([]);
//   const [loadingDepartments, setLoadingDepartments] = useState(false);
//   const [addDepartmentOpen, setAddDepartmentOpen] = useState(false);
  
//   // MRP Run states
//   const [mrpRuns, setMrpRuns] = useState([]);
//   const [loadingMrpRuns, setLoadingMrpRuns] = useState(false);
//   const [mrpRunOpen, setMrpRunOpen] = useState(false);

//   const [formData, setFormData] = useState({
//     pr_type: 'Material',
//     source: 'Manual',
//     mrp_run_id: '',
//     department: '',
//     required_date: '',
//     item: {
//       item_id: '',
//       required_qty: '',
//       estimated_price: '',
//       remarks: ''
//     }
//   });

//   const [fieldErrors, setFieldErrors] = useState({});

//   const prTypes = [
//     { value: 'Material', label: 'Material' },
//     { value: 'Service', label: 'Service' },
//     { value: 'Capital', label: 'Capital' },
//     { value: 'Subcontract', label: 'Subcontract' }
//   ];

//   const sources = [
//     { value: 'MRP Auto', label: 'MRP Auto' },
//     { value: 'Manual', label: 'Manual' },
//     { value: 'Reorder Alert', label: 'Reorder Alert' },
//     { value: 'Indent', label: 'Indent' }
//   ];

//   useEffect(() => {
//     if (open) {
//       fetchItems();
//       fetchDepartments();
//       fetchMrpRuns();
//     }
//   }, [open]);

//   const fetchItems = async () => {
//     try {
//       setLoadingItems(true);
//       const token = localStorage.getItem('token');
//       const response = await axios.get(`${BASE_URL}/api/items`, {
//         headers: { 'Authorization': `Bearer ${token}` }
//       });
//       if (response.data.success) {
//         setItems(response.data.data || []);
//       }
//     } catch (err) {
//       console.error('Error fetching items:', err);
//     } finally {
//       setLoadingItems(false);
//     }
//   };

//   const fetchDepartments = async () => {
//     try {
//       setLoadingDepartments(true);
//       const token = localStorage.getItem('token');
//       const response = await axios.get(`${BASE_URL}/api/departments`, {
//         headers: { 'Authorization': `Bearer ${token}` }
//       });
//       if (response.data.success) {
//         setDepartments(response.data.data || []);
//       }
//     } catch (err) {
//       console.error('Error fetching departments:', err);
//     } finally {
//       setLoadingDepartments(false);
//     }
//   };

//   // Fetch MRP runs from backend
//   const fetchMrpRuns = async () => {
//     try {
//       setLoadingMrpRuns(true);
//       const token = localStorage.getItem('token');
//       const response = await axios.get(`${BASE_URL}/api/mrp/runs`, {
//         headers: { 'Authorization': `Bearer ${token}` }
//       });
      
//       if (response.data.success) {
//         // Filter only completed MRP runs
//         const completedRuns = response.data.data.filter(run => run.status === 'Completed');
//         setMrpRuns(completedRuns);
//       }
//     } catch (err) {
//       console.error('Error fetching MRP runs:', err);
//     } finally {
//       setLoadingMrpRuns(false);
//     }
//   };

//   // Handle MRP run added from modal
//   const handleMrpRunAdded = (newMrpRun) => {
//     // Refresh MRP runs list
//     fetchMrpRuns();
//     // Auto-select the newly created MRP run
//     if (newMrpRun && newMrpRun._id) {
//       setFormData(prev => ({
//         ...prev,
//         mrp_run_id: newMrpRun._id,
//         source: 'MRP Auto' // Auto-set source to MRP Auto when coming from MRP
//       }));
//     }
//   };

//   // Handle department added from modal
//   const handleDepartmentAdded = (newDepartment) => {
//     setDepartments(prev => [...prev, newDepartment]);
//     setFormData(prev => ({
//       ...prev,
//       department: newDepartment._id
//     }));
//     if (fieldErrors.department) {
//       setFieldErrors(prev => ({
//         ...prev,
//         department: ''
//       }));
//     }
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

//   const handleItemChange = (field, value) => {
//     setFieldErrors(prev => ({ ...prev, [field]: '' }));
//     setFormData(prev => ({
//       ...prev,
//       item: { ...prev.item, [field]: value }
//     }));
//   };

//   const validateStep = (step) => {
//     const errors = {};
//     let isValid = true;

//     switch (step) {
//       case 0: // Basic Information
//         if (!formData.pr_type) {
//           errors.pr_type = 'PR type is required';
//           isValid = false;
//         }
//         if (!formData.source) {
//           errors.source = 'Source is required';
//           isValid = false;
//         }
//         if (!formData.department) {
//           errors.department = 'Department is required';
//           isValid = false;
//         }
//         if (!formData.required_date) {
//           errors.required_date = 'Required date is required';
//           isValid = false;
//         }
//         break;
//       case 1: // Item Details
//         if (!formData.item.item_id) {
//           errors.item_id = 'Item is required';
//           isValid = false;
//         }
//         if (!formData.item.required_qty) {
//           errors.required_qty = 'Quantity is required';
//           isValid = false;
//         } else if (formData.item.required_qty <= 0) {
//           errors.required_qty = 'Quantity must be greater than 0';
//           isValid = false;
//         }
//         if (!formData.item.estimated_price) {
//           errors.estimated_price = 'Estimated price is required';
//           isValid = false;
//         } else if (formData.item.estimated_price <= 0) {
//           errors.estimated_price = 'Price must be greater than 0';
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
//     if (!formData.item.item_id || !formData.item.required_qty || !formData.item.estimated_price) {
//       setError('Please fill all item details');
//       return;
//     }

//     setLoading(true);
//     setError('');

//     try {
//       const token = localStorage.getItem('token');
//       const user = JSON.parse(localStorage.getItem('user') || '{}');

//       const submissionData = {
//         pr_type: formData.pr_type,
//         source: formData.source,
//         mrp_run_id: formData.mrp_run_id || null,
//         department: formData.department,
//         required_by: formData.required_date,
//         items: [{
//           item_id: formData.item.item_id,
//           required_qty: parseFloat(formData.item.required_qty),
//           estimated_price: parseFloat(formData.item.estimated_price),
//           remarks: formData.item.remarks
//         }],
//         requested_by: user._id,
//         created_by: user._id,
//         status: 'Submitted'
//       };

//       const response = await axios.post(`${BASE_URL}/api/purchase-requisitions`, submissionData,
//         {
//           headers: {
//             'Authorization': `Bearer ${token}`,
//             'Content-Type': 'application/json'
//           }
//         });

//       if (response.data.success) {
//         onAdd(response.data.data);
//         resetForm();
//         onClose();
//       } else {
//         setError(response.data.message || 'Failed to create purchase requisition');
//       }
//     } catch (err) {
//       console.error('Error creating PR:', err);
//       setError(err.response?.data?.message || 'Failed to create purchase requisition');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const resetForm = () => {
//     setFormData({
//       pr_type: 'Material',
//       source: 'Manual',
//       mrp_run_id: '',
//       department: '',
//       required_date: '',
//       item: {
//         item_id: '',
//         required_qty: '',
//         estimated_price: '',
//         remarks: ''
//       }
//     });
//     setFieldErrors({});
//     setError('');
//     setActiveStep(0);
//   };

//   const handleClose = () => {
//     resetForm();
//     onClose();
//   };

//   const selectedItem = items.find(i => i._id === formData.item.item_id);
//   const selectedDepartment = departments.find(dept => dept._id === formData.department);
//   const selectedMrpRun = mrpRuns.find(run => run._id === formData.mrp_run_id);
//   const totalValue = selectedItem && formData.item.required_qty && formData.item.estimated_price
//     ? parseFloat(formData.item.required_qty) * parseFloat(formData.item.estimated_price)
//     : 0;
//   const today = new Date().toISOString().split('T')[0];

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
//                 {/* Row 1: PR Type, Source, Department */}
//                 <Grid size={{ xs: 12, md: 4 }}>
//                   <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//                     <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary }}>
//                       PR TYPE <span style={{ color: '#EF4444' }}>*</span>
//                     </Typography>
//                     <FormControl fullWidth size="small" error={!!fieldErrors.pr_type}>
//                       <Select
//                         name="pr_type"
//                         value={formData.pr_type}
//                         onChange={handleSelectChange}
//                         sx={{
//                           borderRadius: 1.5,
//                           fontSize: '0.75rem',
//                           '& .MuiSelect-select': { py: 1, px: 1.5, fontSize: '0.75rem' },
//                           '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: COLORS.primary },
//                           '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: COLORS.primary, borderWidth: 1 }
//                         }}
//                       >
//                         {prTypes.map((type) => (
//                           <MenuItem key={type.value} value={type.value} sx={{ fontSize: '0.75rem' }}>
//                             {type.label}
//                           </MenuItem>
//                         ))}
//                       </Select>
//                     </FormControl>
//                   </Box>
//                 </Grid>

//                 <Grid size={{ xs: 12, md: 4 }}>
//                   <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//                     <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary }}>
//                       SOURCE <span style={{ color: '#EF4444' }}>*</span>
//                     </Typography>
//                     <FormControl fullWidth size="small" error={!!fieldErrors.source}>
//                       <Select
//                         name="source"
//                         value={formData.source}
//                         onChange={handleSelectChange}
//                         sx={{
//                           borderRadius: 1.5,
//                           fontSize: '0.75rem',
//                           '& .MuiSelect-select': { py: 1, px: 1.5, fontSize: '0.75rem' },
//                           '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: COLORS.primary },
//                           '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: COLORS.primary, borderWidth: 1 }
//                         }}
//                       >
//                         {sources.map((src) => (
//                           <MenuItem key={src.value} value={src.value} sx={{ fontSize: '0.75rem' }}>
//                             {src.label}
//                           </MenuItem>
//                         ))}
//                       </Select>
//                     </FormControl>
//                   </Box>
//                 </Grid>

//                 <Grid size={{ xs: 12, md: 4 }}>
//                   <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//                     <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary }}>
//                       DEPARTMENT <span style={{ color: '#EF4444' }}>*</span>
//                     </Typography>

//                     <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
//                       <Box sx={{ flex: 1 }}>
//                         <Autocomplete
//                           options={departments}
//                           loading={loadingDepartments}
//                           getOptionLabel={(option) => {
//                             if (!option || !option.DepartmentName) return '';
//                             return option.DepartmentName;
//                           }}
//                           isOptionEqualToValue={(option, value) => {
//                             if (!option || !value) return false;
//                             return option._id === value._id;
//                           }}
//                           value={selectedDepartment || null}
//                           onChange={(event, newValue) => {
//                             setFormData(prev => ({
//                               ...prev,
//                               department: newValue?._id || ''
//                             }));
//                             if (fieldErrors.department) {
//                               setFieldErrors(prev => ({ ...prev, department: '' }));
//                             }
//                           }}
//                           renderInput={(params) => (
//                             <TextField
//                               {...params}
//                               size="small"
//                               placeholder="Select department"
//                               error={!!fieldErrors.department}
//                               helperText={fieldErrors.department}
//                               sx={{
//                                 '& .MuiOutlinedInput-root': {
//                                   borderRadius: 1.5,
//                                   fontSize: '0.75rem',
//                                   '&:hover fieldset': { borderColor: COLORS.primary },
//                                   '&.Mui-focused fieldset': { borderColor: COLORS.primary, borderWidth: 1 }
//                                 },
//                                 '& .MuiInputBase-input': { py: 1, px: 1.5, fontSize: '0.75rem' },
//                                 '& .MuiFormHelperText-root': { fontSize: '0.65rem', marginLeft: 0 }
//                               }}
//                               InputProps={{
//                                 ...params.InputProps,
//                                 startAdornment: (
//                                   <InputAdornment position="start">
//                                     <SearchIcon sx={{ fontSize: '1rem', color: COLORS.text.tertiary }} />
//                                   </InputAdornment>
//                                 ),
//                               }}
//                             />
//                           )}
//                           PaperComponent={CustomPaper}
//                           noOptionsText="No departments found"
//                         />
//                       </Box>

//                       <Button
//                         variant="outlined"
//                         size="small"
//                         onClick={() => setAddDepartmentOpen(true)}
//                         startIcon={<AddIcon sx={{ fontSize: '0.875rem' }} />}
//                         sx={{
//                           height: 32,
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

//                 {/* Row 2: Required Date, MRP RUN ID */}
//                 <Grid size={{ xs: 12, md: 6 }}>
//                   <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//                     <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary }}>
//                       REQUIRED DATE <span style={{ color: '#EF4444' }}>*</span>
//                     </Typography>
//                     <TextField
//                       fullWidth
//                       size="small"
//                       type="date"
//                       name="required_date"
//                       value={formData.required_date}
//                       onChange={handleChange}
//                       error={!!fieldErrors.required_date}
//                       helperText={fieldErrors.required_date}
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
//                       MRP RUN ID
//                     </Typography>
//                     <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
//                       <Box sx={{ flex: 1 }}>
//                         <Autocomplete
//                           options={mrpRuns}
//                           loading={loadingMrpRuns}
//                           getOptionLabel={(option) => {
//                             if (!option) return '';
//                             return option.mrp_run_id || `MRP-${option._id?.slice(-8)}`;
//                           }}
//                           isOptionEqualToValue={(option, value) => {
//                             if (!option || !value) return false;
//                             return option._id === value._id;
//                           }}
//                           value={selectedMrpRun || null}
//                           onChange={(event, newValue) => {
//                             setFormData(prev => ({
//                               ...prev,
//                               mrp_run_id: newValue?._id || '',
//                               // If MRP run is selected, auto-set source
//                               source: newValue ? 'MRP Auto' : prev.source
//                             }));
//                           }}
//                           renderInput={(params) => (
//                             <TextField
//                               {...params}
//                               size="small"
//                               placeholder="Select MRP run"
//                               sx={{
//                                 '& .MuiOutlinedInput-root': {
//                                   borderRadius: 1.5,
//                                   fontSize: '0.75rem',
//                                   '&:hover fieldset': { borderColor: COLORS.primary },
//                                   '&.Mui-focused fieldset': { borderColor: COLORS.primary, borderWidth: 1 }
//                                 },
//                                 '& .MuiInputBase-input': { py: 1, px: 1.5, fontSize: '0.75rem' }
//                               }}
//                               InputProps={{
//                                 ...params.InputProps,
//                                 startAdornment: (
//                                   <InputAdornment position="start">
//                                     <FactoryIcon sx={{ fontSize: '1rem', color: COLORS.text.tertiary }} />
//                                   </InputAdornment>
//                                 ),
//                                 endAdornment: (
//                                   <>
//                                     {loadingMrpRuns && <CircularProgress size={16} />}
//                                     {params.InputProps.endAdornment}
//                                   </>
//                                 ),
//                               }}
//                             />
//                           )}
//                           PaperComponent={CustomPaper}
//                           noOptionsText={
//                             <Box sx={{ p: 2, textAlign: 'center' }}>
//                               <Typography sx={{ fontSize: '0.75rem', color: COLORS.text.secondary, mb: 1 }}>
//                                 No MRP runs found
//                               </Typography>
//                               <Button
//                                 size="small"
//                                 variant="outlined"
//                                 startIcon={<AddIcon />}
//                                 onClick={() => setMrpRunOpen(true)}
//                                 sx={{ fontSize: '0.7rem' }}
//                               >
//                                 Run New MRP
//                               </Button>
//                             </Box>
//                           }
//                         />
//                       </Box>

//                       <Button
//                         variant="outlined"
//                         size="small"
//                         onClick={() => setMrpRunOpen(true)}
//                         startIcon={<FactoryIcon sx={{ fontSize: '0.875rem' }} />}
//                         sx={{
//                           height: 32,
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
//                         Run MRP
//                       </Button>
                      
//                       <Button
//                         variant="outlined"
//                         size="small"
//                         onClick={fetchMrpRuns}
//                         startIcon={<RefreshIcon sx={{ fontSize: '0.875rem' }} />}
//                         sx={{
//                           height: 32,
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
//                         Refresh
//                       </Button>
//                     </Box>
                    
//                     {/* Show selected MRP run details */}
//                     {selectedMrpRun && (
//                       <Box sx={{ mt: 1, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
//                         <Chip
//                           size="small"
//                           label={`ID: ${selectedMrpRun.mrp_run_id}`}
//                           sx={{ fontSize: '0.65rem', height: 22 }}
//                         />
//                         <Chip
//                           size="small"
//                           label={`Type: ${selectedMrpRun.run_type}`}
//                           sx={{ fontSize: '0.65rem', height: 22 }}
//                         />
//                         <Chip
//                           size="small"
//                           label={`Date: ${new Date(selectedMrpRun.created_at).toLocaleDateString()}`}
//                           sx={{ fontSize: '0.65rem', height: 22 }}
//                         />
//                       </Box>
//                     )}
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
//               <Typography variant="subtitle2" sx={{ color: COLORS.primary, mb: 1.5, fontWeight: 600, fontSize: '0.9rem' }}>
//                 Item Details
//               </Typography>

//               <Grid container spacing={2}>
//                 <Grid size={{ xs: 12 }}>
//                   <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//                     <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary }}>
//                       SELECT ITEM <span style={{ color: '#EF4444' }}>*</span>
//                     </Typography>
//                     <Autocomplete
//                       options={items}
//                       loading={loadingItems}
//                       getOptionLabel={(option) => {
//                         if (!option) return '';
//                         const partNo = option.part_no || option.PartNo || '';
//                         const desc = option.part_description || option.Description || '';
//                         return `${partNo} - ${desc}`;
//                       }}
//                       isOptionEqualToValue={(option, value) => {
//                         if (!option || !value) return false;
//                         return option._id === value._id;
//                       }}
//                       value={selectedItem || null}
//                       onChange={(e, val) => handleItemChange('item_id', val?._id || '')}
//                       renderInput={(params) => (
//                         <TextField
//                           {...params}
//                           size="small"
//                           placeholder="Search and select an item..."
//                           error={!!fieldErrors.item_id}
//                           helperText={fieldErrors.item_id}
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
//                       PaperComponent={CustomPaper}
//                       noOptionsText="No items found"
//                     />
//                   </Box>
//                 </Grid>

//                 {selectedItem && (
//                   <>
//                     <Grid size={{ xs: 12, md: 6 }}>
//                       <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//                         <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary }}>
//                           PART NUMBER
//                         </Typography>
//                         <TextField
//                           fullWidth
//                           size="small"
//                           value={selectedItem.part_no || selectedItem.PartNo || ''}
//                           disabled
//                           sx={{
//                             '& .MuiOutlinedInput-root': {
//                               borderRadius: 1.5,
//                               fontSize: '0.75rem',
//                               backgroundColor: COLORS.background.light,
//                               '& .MuiOutlinedInput-notchedOutline': {
//                                 borderColor: COLORS.border,
//                               },
//                             },
//                             '& .MuiInputBase-input': {
//                               py: 1,
//                               px: 1.5,
//                               fontSize: '0.75rem',
//                               color: COLORS.text.primary,
//                               WebkitTextFillColor: COLORS.text.primary,
//                             },
//                             '& .MuiInputBase-input.Mui-disabled': {
//                               WebkitTextFillColor: COLORS.text.primary,
//                               color: COLORS.text.primary,
//                               opacity: 1,
//                             }
//                           }}
//                         />
//                       </Box>
//                     </Grid>

//                     <Grid size={{ xs: 12, md: 6 }}>
//                       <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//                         <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary }}>
//                           DESCRIPTION
//                         </Typography>
//                         <TextField
//                           fullWidth
//                           size="small"
//                           value={selectedItem.part_description || selectedItem.Description || ''}
//                           disabled
//                           sx={{
//                             '& .MuiOutlinedInput-root': {
//                               borderRadius: 1.5,
//                               fontSize: '0.75rem',
//                               backgroundColor: COLORS.background.light,
//                               '& .MuiOutlinedInput-notchedOutline': {
//                                 borderColor: COLORS.border,
//                               },
//                             },
//                             '& .MuiInputBase-input': {
//                               py: 1,
//                               px: 1.5,
//                               fontSize: '0.75rem',
//                               color: COLORS.text.primary,
//                               WebkitTextFillColor: COLORS.text.primary,
//                             },
//                             '& .MuiInputBase-input.Mui-disabled': {
//                               WebkitTextFillColor: COLORS.text.primary,
//                               color: COLORS.text.primary,
//                               opacity: 1,
//                             }
//                           }}
//                         />
//                       </Box>
//                     </Grid>
//                     <Grid size={{ xs: 12, md: 4 }}>
//                       <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//                         <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary }}>
//                           UNIT
//                         </Typography>
//                         <TextField
//                           fullWidth
//                           size="small"
//                           value={selectedItem.unit || selectedItem.Unit || 'Nos'}
//                           disabled
//                           sx={{
//                             '& .MuiOutlinedInput-root': {
//                               borderRadius: 1.5,
//                               fontSize: '0.75rem',
//                               backgroundColor: COLORS.background.light,
//                               '& .MuiOutlinedInput-notchedOutline': {
//                                 borderColor: COLORS.border,
//                               },
//                             },
//                             '& .MuiInputBase-input': {
//                               py: 1,
//                               px: 1.5,
//                               fontSize: '0.75rem',
//                               color: COLORS.text.primary,
//                               WebkitTextFillColor: COLORS.text.primary,
//                             },
//                             '& .MuiInputBase-input.Mui-disabled': {
//                               WebkitTextFillColor: COLORS.text.primary,
//                               color: COLORS.text.primary,
//                               opacity: 1,
//                             }
//                           }}
//                         />
//                       </Box>
//                     </Grid>

//                     <Grid size={{ xs: 12, md: 4 }}>
//                       <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//                         <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary }}>
//                           QUANTITY <span style={{ color: '#EF4444' }}>*</span>
//                         </Typography>
//                         <TextField
//                           fullWidth
//                           size="small"
//                           type="number"
//                           placeholder="Enter quantity"
//                           value={formData.item.required_qty}
//                           onChange={(e) => handleItemChange('required_qty', e.target.value)}
//                           error={!!fieldErrors.required_qty}
//                           helperText={fieldErrors.required_qty}
//                           inputProps={{ step: 1, min: 1 }}
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
//                       </Box>
//                     </Grid>

//                     <Grid size={{ xs: 12, md: 4 }}>
//                       <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//                         <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary }}>
//                           ESTIMATED PRICE <span style={{ color: '#EF4444' }}>*</span>
//                         </Typography>
//                         <TextField
//                           fullWidth
//                           size="small"
//                           type="number"
//                           placeholder="Enter price"
//                           value={formData.item.estimated_price}
//                           onChange={(e) => handleItemChange('estimated_price', e.target.value)}
//                           error={!!fieldErrors.estimated_price}
//                           helperText={fieldErrors.estimated_price}
//                           InputProps={{ startAdornment: <InputAdornment position="start">₹</InputAdornment> }}
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
//                       </Box>
//                     </Grid>

//                     <Grid size={{ xs: 12 }}>
//                       <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//                         <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary }}>
//                           REMARKS
//                         </Typography>
//                         <TextField
//                           fullWidth
//                           size="small"
//                           multiline
//                           rows={2}
//                           placeholder="Enter any remarks"
//                           value={formData.item.remarks}
//                           onChange={(e) => handleItemChange('remarks', e.target.value)}
//                           sx={{
//                             '& .MuiOutlinedInput-root': {
//                               borderRadius: 1.5,
//                               fontSize: '0.75rem',
//                               '&:hover fieldset': { borderColor: COLORS.primary },
//                               '&.Mui-focused fieldset': { borderColor: COLORS.primary, borderWidth: 1 }
//                             },
//                             '& .MuiInputBase-input': { py: 1, px: 1.5, fontSize: '0.75rem' }
//                           }}
//                         />
//                       </Box>
//                     </Grid>

//                     {formData.item.required_qty && formData.item.estimated_price && (
//                       <Grid size={{ xs: 12 }}>
//                         <Box sx={{
//                           p: 2,
//                           bgcolor: COLORS.background.light,
//                           borderRadius: 1.5,
//                           display: 'flex',
//                           justifyContent: 'space-between',
//                           alignItems: 'center'
//                         }}>
//                           <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color: COLORS.text.secondary }}>
//                             Total Value:
//                           </Typography>
//                           <Typography sx={{ fontSize: '1rem', fontWeight: 700, color: COLORS.primary }}>
//                             ₹{totalValue.toLocaleString()}
//                           </Typography>
//                         </Box>
//                       </Grid>
//                     )}
//                   </>
//                 )}
//               </Grid>
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
//             Create Purchase Requisition
//           </Typography>

//           <Stepper
//             activeStep={activeStep}
//             alternativeLabel
//             connector={<ColorConnector />}
//             sx={{ mb: 0.5, mt: 0.5 }}
//           >
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
//                 disabled={loading || !formData.item.item_id || !formData.item.required_qty || !formData.item.estimated_price || !formData.required_date}
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
//                 {loading ? 'Creating...' : 'Create Requisition'}
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

//       {/* Add Department Modal */}
//       <AddDepartments
//         open={addDepartmentOpen}
//         onClose={() => setAddDepartmentOpen(false)}
//         onAdd={handleDepartmentAdded}
//       />

//       {/* MRP Run Modal */}
//       <MrpRun
//         open={mrpRunOpen}
//         onClose={() => setMrpRunOpen(false)}
//         onRunComplete={handleMrpRunAdded}
//       />
//     </>
//   );
// };

// export default AddPurchaseRequisition;


// import React, { useState, useEffect } from 'react';
// import {
//   Box,
//   Paper,
//   Grid,
//   Stepper,
//   Step,
//   StepLabel,
//   StepConnector,
//   stepConnectorClasses,
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
//   Autocomplete,
//   InputAdornment,
//   styled,
//   Chip,
//   CircularProgress
// } from '@mui/material';
// import {
//   Add as AddIcon,
//   Close as CloseIcon,
//   NavigateNext as NavigateNextIcon,
//   NavigateBefore as NavigateBeforeIcon,
//   Search as SearchIcon,
//   Refresh as RefreshIcon,
//   Factory as FactoryIcon
// } from '@mui/icons-material';
// import axios from 'axios';
// import BASE_URL from '../../../config/Config';
// import Collapse from "@mui/material/Collapse";
// import Divider from "@mui/material/Divider";
// //import AddDepartments from '../../hrmaster/departmentmaster/AddDepartments';
// import MrpRun from '../../bommaster/MRP/MrpRun'; // Import the MrpRun component

// const COLORS = {
//   primary: '#063C3F',
//   primaryLight: '#E8F0F1',
//   primaryDark: '#05292B',
//   text: { primary: '#151C26', secondary: '#4B5568', tertiary: '#94A3B8' },
//   background: { white: '#FFFFFF', light: '#F8FFFC', hover: '#F0FDF9' },
//   border: '#E3E8EF'
// };

// // Modern Stepper Connector
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

// // Custom styled Paper for dropdowns
// const CustomPaper = styled(Paper)({
//   maxHeight: 200,
//   overflow: 'auto',
//   '&::-webkit-scrollbar': {
//     display: 'none'
//   },
//   scrollbarWidth: 'none',
//   '-ms-overflow-style': 'none'
// });

// const steps = ['Basic Information', 'Item Details'];

// const AddPurchaseRequisition = ({ open, onClose, onAdd }) => {
//   const [activeStep, setActiveStep] = useState(0);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState('');
//   const [items, setItems] = useState([]);
//   const [loadingItems, setLoadingItems] = useState(false);
//   const [departments, setDepartments] = useState([]);
//   const [loadingDepartments, setLoadingDepartments] = useState(false);
//   //const [addDepartmentOpen, setAddDepartmentOpen] = useState(false);
//   const [showDepartmentForm, setShowDepartmentForm] = useState(false);

// const [departmentForm, setDepartmentForm] = useState({
//   DepartmentName: "",
//   Description: "",
// });

// const [departmentLoading, setDepartmentLoading] = useState(false);
  
//   // MRP Run states
//   const [mrpRuns, setMrpRuns] = useState([]);
//   const [loadingMrpRuns, setLoadingMrpRuns] = useState(false);
//   const [mrpRunOpen, setMrpRunOpen] = useState(false);

//   const [formData, setFormData] = useState({
//     pr_type: 'Material',
//     source: 'Manual',
//     mrp_run_id: '',
//     department: '',
//     required_date: '',
//     item: {
//       item_id: '',
//       required_qty: '',
//       estimated_price: '',
//       remarks: ''
//     }
//   });

//   const [fieldErrors, setFieldErrors] = useState({});

//   const prTypes = [
//     { value: 'Material', label: 'Material' },
//     { value: 'Service', label: 'Service' },
//     { value: 'Capital', label: 'Capital' },
//     { value: 'Subcontract', label: 'Subcontract' }
//   ];

//   const sources = [
//     { value: 'MRP Auto', label: 'MRP Auto' },
//     { value: 'Manual', label: 'Manual' },
//     { value: 'Reorder Alert', label: 'Reorder Alert' },
//     { value: 'Indent', label: 'Indent' }
//   ];

//   useEffect(() => {
//     if (open) {
//       fetchItems();
//       fetchDepartments();
//       fetchMrpRuns();
//     }
//   }, [open]);

//   const fetchItems = async () => {
//     try {
//       setLoadingItems(true);
//       const token = localStorage.getItem('token');
//       const response = await axios.get(`${BASE_URL}/api/items`, {
//         headers: { 'Authorization': `Bearer ${token}` }
//       });
//       if (response.data.success) {
//         setItems(response.data.data || []);
//       }
//     } catch (err) {
//       console.error('Error fetching items:', err);
//     } finally {
//       setLoadingItems(false);
//     }
//   };

//   const fetchDepartments = async () => {
//     try {
//       setLoadingDepartments(true);
//       const token = localStorage.getItem('token');
//       const response = await axios.get(`${BASE_URL}/api/departments`, {
//         headers: { 'Authorization': `Bearer ${token}` }
//       });
//       if (response.data.success) {
//         setDepartments(response.data.data || []);
//       }
//     } catch (err) {
//       console.error('Error fetching departments:', err);
//     } finally {
//       setLoadingDepartments(false);
//     }
//   };

//   // Fetch MRP runs from backend
//   const fetchMrpRuns = async () => {
//     try {
//       setLoadingMrpRuns(true);
//       const token = localStorage.getItem('token');
//       const response = await axios.get(`${BASE_URL}/api/mrp/runs`, {
//         headers: { 'Authorization': `Bearer ${token}` }
//       });
      
//       if (response.data.success) {
//         // Filter only completed MRP runs
//         const completedRuns = response.data.data.filter(run => run.status === 'Completed');
//         setMrpRuns(completedRuns);
//       }
//     } catch (err) {
//       console.error('Error fetching MRP runs:', err);
//     } finally {
//       setLoadingMrpRuns(false);
//     }
//   };

//   // Handle MRP run added from modal
//   const handleMrpRunAdded = (newMrpRun) => {
//     // Refresh MRP runs list
//     fetchMrpRuns();
//     // Auto-select the newly created MRP run
//     if (newMrpRun && newMrpRun._id) {
//       setFormData(prev => ({
//         ...prev,
//         mrp_run_id: newMrpRun._id,
//         source: 'MRP Auto' // Auto-set source to MRP Auto when coming from MRP
//       }));
//     }
//   };

//   // Handle department added from modal
//   const handleDepartmentAdded = (newDepartment) => {
//     setDepartments(prev => [...prev, newDepartment]);
//     setFormData(prev => ({
//       ...prev,
//       department: newDepartment._id
//     }));
//     if (fieldErrors.department) {
//       setFieldErrors(prev => ({
//         ...prev,
//         department: ''
//       }));
//     }
//   };

//   const handleDepartmentFormChange = (e) => {
//   const { name, value } = e.target;

//   setDepartmentForm((prev) => ({
//     ...prev,
//     [name]: value,
//   }));
// };

//   const saveDepartment = async () => {
//   if (!departmentForm.DepartmentName.trim()) {
//     setError("Department Name is required");
//     return;
//   }

//   try {
//     setDepartmentLoading(true);

//     const token = localStorage.getItem("token");

//     const response = await axios.post(
//       `${BASE_URL}/api/departments`,
//       departmentForm,
//       {
//         headers: {
//           Authorization: `Bearer ${token}`,
//         },
//       }
//     );

//     if (response.data.success) {
//       const newDepartment = response.data.data;

//       setDepartments((prev) => [...prev, newDepartment]);

//       setFormData((prev) => ({
//         ...prev,
//         department: newDepartment._id,
//       }));

//       setDepartmentForm({
//         DepartmentName: "",
//         Description: "",
//       });

//       setShowDepartmentForm(false);
//     }
//   } catch (err) {
//     setError(
//       err.response?.data?.message || "Unable to add Department"
//     );
//   } finally {
//     setDepartmentLoading(false);
//   }
// };

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

//   const handleItemChange = (field, value) => {
//     setFieldErrors(prev => ({ ...prev, [field]: '' }));
//     setFormData(prev => ({
//       ...prev,
//       item: { ...prev.item, [field]: value }
//     }));
//   };

//   const validateStep = (step) => {
//     const errors = {};
//     let isValid = true;

//     switch (step) {
//       case 0: // Basic Information
//         if (!formData.pr_type) {
//           errors.pr_type = 'PR type is required';
//           isValid = false;
//         }
//         if (!formData.source) {
//           errors.source = 'Source is required';
//           isValid = false;
//         }
//         if (!formData.department) {
//           errors.department = 'Department is required';
//           isValid = false;
//         }
//         if (!formData.required_date) {
//           errors.required_date = 'Required date is required';
//           isValid = false;
//         }
//         break;
//       case 1: // Item Details
//         if (!formData.item.item_id) {
//           errors.item_id = 'Item is required';
//           isValid = false;
//         }
//         if (!formData.item.required_qty) {
//           errors.required_qty = 'Quantity is required';
//           isValid = false;
//         } else if (formData.item.required_qty <= 0) {
//           errors.required_qty = 'Quantity must be greater than 0';
//           isValid = false;
//         }
//         if (!formData.item.estimated_price) {
//           errors.estimated_price = 'Estimated price is required';
//           isValid = false;
//         } else if (formData.item.estimated_price <= 0) {
//           errors.estimated_price = 'Price must be greater than 0';
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
//     if (!formData.item.item_id || !formData.item.required_qty || !formData.item.estimated_price) {
//       setError('Please fill all item details');
//       return;
//     }

//     setLoading(true);
//     setError('');

//     try {
//       const token = localStorage.getItem('token');
//       const user = JSON.parse(localStorage.getItem('user') || '{}');

//       const submissionData = {
//         pr_type: formData.pr_type,
//         source: formData.source,
//         mrp_run_id: formData.mrp_run_id || null,
//         department: formData.department,
//         required_by: formData.required_date,
//         items: [{
//           item_id: formData.item.item_id,
//           required_qty: parseFloat(formData.item.required_qty),
//           estimated_price: parseFloat(formData.item.estimated_price),
//           remarks: formData.item.remarks
//         }],
//         requested_by: user._id,
//         created_by: user._id,
//         status: 'Submitted'
//       };

//       const response = await axios.post(`${BASE_URL}/api/purchase-requisitions`, submissionData,
//         {
//           headers: {
//             'Authorization': `Bearer ${token}`,
//             'Content-Type': 'application/json'
//           }
//         });

//       if (response.data.success) {
//         onAdd(response.data.data);
//         resetForm();
//         onClose();
//       } else {
//         setError(response.data.message || 'Failed to create purchase requisition');
//       }
//     } catch (err) {
//       console.error('Error creating PR:', err);
//       setError(err.response?.data?.message || 'Failed to create purchase requisition');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const resetForm = () => {
//     setFormData({
//       pr_type: 'Material',
//       source: 'Manual',
//       mrp_run_id: '',
//       department: '',
//       required_date: '',
//       item: {
//         item_id: '',
//         required_qty: '',
//         estimated_price: '',
//         remarks: ''
//       }
//     });
//     setFieldErrors({});
//     setError('');
//     setActiveStep(0);
//   };

//   const handleClose = () => {
//     resetForm();
//     onClose();
//   };

//   const selectedItem = items.find(i => i._id === formData.item.item_id);
//   const selectedDepartment = departments.find(dept => dept._id === formData.department);
//   const selectedMrpRun = mrpRuns.find(run => run._id === formData.mrp_run_id);
//   const totalValue = selectedItem && formData.item.required_qty && formData.item.estimated_price
//     ? parseFloat(formData.item.required_qty) * parseFloat(formData.item.estimated_price)
//     : 0;
//   const today = new Date().toISOString().split('T')[0];

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
//                 {/* Row 1: PR Type, Source, Department */}
//                 <Grid size={{ xs: 12, md: 4 }}>
//                   <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//                     <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary }}>
//                       PR TYPE <span style={{ color: '#EF4444' }}>*</span>
//                     </Typography>
//                     <FormControl fullWidth size="small" error={!!fieldErrors.pr_type}>
//                       <Select
//                         name="pr_type"
//                         value={formData.pr_type}
//                         onChange={handleSelectChange}
//                         sx={{
//                           borderRadius: 1.5,
//                           fontSize: '0.75rem',
//                           '& .MuiSelect-select': { py: 1, px: 1.5, fontSize: '0.75rem' },
//                           '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: COLORS.primary },
//                           '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: COLORS.primary, borderWidth: 1 }
//                         }}
//                       >
//                         {prTypes.map((type) => (
//                           <MenuItem key={type.value} value={type.value} sx={{ fontSize: '0.75rem' }}>
//                             {type.label}
//                           </MenuItem>
//                         ))}
//                       </Select>
//                     </FormControl>
//                   </Box>
//                 </Grid>

//                 <Grid size={{ xs: 12, md: 4 }}>
//                   <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//                     <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary }}>
//                       SOURCE <span style={{ color: '#EF4444' }}>*</span>
//                     </Typography>
//                     <FormControl fullWidth size="small" error={!!fieldErrors.source}>
//                       <Select
//                         name="source"
//                         value={formData.source}
//                         onChange={handleSelectChange}
//                         sx={{
//                           borderRadius: 1.5,
//                           fontSize: '0.75rem',
//                           '& .MuiSelect-select': { py: 1, px: 1.5, fontSize: '0.75rem' },
//                           '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: COLORS.primary },
//                           '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: COLORS.primary, borderWidth: 1 }
//                         }}
//                       >
//                         {sources.map((src) => (
//                           <MenuItem key={src.value} value={src.value} sx={{ fontSize: '0.75rem' }}>
//                             {src.label}
//                           </MenuItem>
//                         ))}
//                       </Select>
//                     </FormControl>
//                   </Box>
//                 </Grid>

//                 <Grid size={{ xs: 12, md: 4 }}>
//                   <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//                     <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary }}>
//                       DEPARTMENT <span style={{ color: '#EF4444' }}>*</span>
//                     </Typography>

//                     <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
//                       <Box sx={{ flex: 1 }}>
//                         <Autocomplete
//                           options={departments}
//                           loading={loadingDepartments}
//                           getOptionLabel={(option) => {
//                             if (!option || !option.DepartmentName) return '';
//                             return option.DepartmentName;
//                           }}
//                           isOptionEqualToValue={(option, value) => {
//                             if (!option || !value) return false;
//                             return option._id === value._id;
//                           }}
//                           value={selectedDepartment || null}
//                           onChange={(event, newValue) => {
//                             setFormData(prev => ({
//                               ...prev,
//                               department: newValue?._id || ''
//                             }));
//                             if (fieldErrors.department) {
//                               setFieldErrors(prev => ({ ...prev, department: '' }));
//                             }
//                           }}
//                           renderInput={(params) => (
//                             <TextField
//                               {...params}
//                               size="small"
//                               placeholder="Select department"
//                               error={!!fieldErrors.department}
//                               helperText={fieldErrors.department}
//                               sx={{
//                                 '& .MuiOutlinedInput-root': {
//                                   borderRadius: 1.5,
//                                   fontSize: '0.75rem',
//                                   '&:hover fieldset': { borderColor: COLORS.primary },
//                                   '&.Mui-focused fieldset': { borderColor: COLORS.primary, borderWidth: 1 }
//                                 },
//                                 '& .MuiInputBase-input': { py: 1, px: 1.5, fontSize: '0.75rem' },
//                                 '& .MuiFormHelperText-root': { fontSize: '0.65rem', marginLeft: 0 }
//                               }}
//                               InputProps={{
//                                 ...params.InputProps,
//                                 startAdornment: (
//                                   <InputAdornment position="start">
//                                     <SearchIcon sx={{ fontSize: '1rem', color: COLORS.text.tertiary }} />
//                                   </InputAdornment>
//                                 ),
//                               }}
//                             />
//                           )}
//                           PaperComponent={CustomPaper}
//                           noOptionsText="No departments found"
//                         />
//                       </Box>

//                       <Button
//                         variant="outlined"
//                         size="small"
//                         //onClick={() => setAddDepartmentOpen(true)}
//                         onClick={() =>
//   setShowDepartmentForm((prev) => !prev)
// }
//                         startIcon={<AddIcon sx={{ fontSize: '0.875rem' }} />}
//                         sx={{
//                           height: 32,
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


//                 <Grid size={{ xs: 12 }}>
//   <Collapse in={showDepartmentForm}>
//     <Paper
//       sx={{
//         p: 2,
//         mb: 2,
//         border: `1px solid ${COLORS.border}`,
//         borderRadius: 2,
//       }}
//     >
//       <Typography
//         sx={{
//           fontWeight: 700,
//           mb: 2,
//           color: COLORS.primary,
//         }}
//       >
//         Add New Department
//       </Typography>

//       <Grid container spacing={2}>

//         <Grid size={{ xs:12, md:6 }}>
//           <TextField
//             fullWidth
//             size="small"
//             label="Department Name"
//             name="DepartmentName"
//             value={departmentForm.DepartmentName}
//             onChange={handleDepartmentFormChange}
//           />
//         </Grid>

//         <Grid size={{ xs:12, md:6 }}>
//           <TextField
//             fullWidth
//             size="small"
//             label="Description"
//             name="Description"
//             value={departmentForm.Description}
//             onChange={handleDepartmentFormChange}
//           />
//         </Grid>

//         <Grid size={{ xs:12 }}>
//           <Divider sx={{ mb:2 }} />

//           <Stack
//             direction="row"
//             spacing={1}
//             justifyContent="flex-end"
//           >

//             <Button
//               onClick={() =>
//                 setShowDepartmentForm(false)
//               }
//             >
//               Cancel
//             </Button>

//             <Button
//               variant="contained"
//               onClick={saveDepartment}
//               disabled={departmentLoading}
//             >
//               Save Department
//             </Button>

//           </Stack>

//         </Grid>

//       </Grid>
//     </Paper>
//   </Collapse>
// </Grid>

//                 {/* Row 2: Required Date, MRP RUN ID */}
//                 <Grid size={{ xs: 12, md: 6 }}>
//                   <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//                     <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary }}>
//                       REQUIRED DATE <span style={{ color: '#EF4444' }}>*</span>
//                     </Typography>
//                     <TextField
//                       fullWidth
//                       size="small"
//                       type="date"
//                       name="required_date"
//                       value={formData.required_date}
//                       onChange={handleChange}
//                       error={!!fieldErrors.required_date}
//                       helperText={fieldErrors.required_date}
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
//                       MRP RUN ID
//                     </Typography>
//                     <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
//                       <Box sx={{ flex: 1 }}>
//                         <Autocomplete
//                           options={mrpRuns}
//                           loading={loadingMrpRuns}
//                           getOptionLabel={(option) => {
//                             if (!option) return '';
//                             return option.mrp_run_id || `MRP-${option._id?.slice(-8)}`;
//                           }}
//                           isOptionEqualToValue={(option, value) => {
//                             if (!option || !value) return false;
//                             return option._id === value._id;
//                           }}
//                           value={selectedMrpRun || null}
//                           onChange={(event, newValue) => {
//                             setFormData(prev => ({
//                               ...prev,
//                               mrp_run_id: newValue?._id || '',
//                               // If MRP run is selected, auto-set source
//                               source: newValue ? 'MRP Auto' : prev.source
//                             }));
//                           }}
//                           renderInput={(params) => (
//                             <TextField
//                               {...params}
//                               size="small"
//                               placeholder="Select MRP run"
//                               sx={{
//                                 '& .MuiOutlinedInput-root': {
//                                   borderRadius: 1.5,
//                                   fontSize: '0.75rem',
//                                   '&:hover fieldset': { borderColor: COLORS.primary },
//                                   '&.Mui-focused fieldset': { borderColor: COLORS.primary, borderWidth: 1 }
//                                 },
//                                 '& .MuiInputBase-input': { py: 1, px: 1.5, fontSize: '0.75rem' }
//                               }}
//                               InputProps={{
//                                 ...params.InputProps,
//                                 startAdornment: (
//                                   <InputAdornment position="start">
//                                     <FactoryIcon sx={{ fontSize: '1rem', color: COLORS.text.tertiary }} />
//                                   </InputAdornment>
//                                 ),
//                                 endAdornment: (
//                                   <>
//                                     {loadingMrpRuns && <CircularProgress size={16} />}
//                                     {params.InputProps.endAdornment}
//                                   </>
//                                 ),
//                               }}
//                             />
//                           )}
//                           PaperComponent={CustomPaper}
//                           noOptionsText={
//                             <Box sx={{ p: 2, textAlign: 'center' }}>
//                               <Typography sx={{ fontSize: '0.75rem', color: COLORS.text.secondary, mb: 1 }}>
//                                 No MRP runs found
//                               </Typography>
//                               <Button
//                                 size="small"
//                                 variant="outlined"
//                                 startIcon={<AddIcon />}
//                                 onClick={() => setMrpRunOpen(true)}
//                                 sx={{ fontSize: '0.7rem' }}
//                               >
//                                 Run New MRP
//                               </Button>
//                             </Box>
//                           }
//                         />
//                       </Box>

//                       <Button
//                         variant="outlined"
//                         size="small"
//                         onClick={() => setMrpRunOpen(true)}
//                         startIcon={<FactoryIcon sx={{ fontSize: '0.875rem' }} />}
//                         sx={{
//                           height: 32,
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
//                         Run MRP
//                       </Button>
                      
//                       <Button
//                         variant="outlined"
//                         size="small"
//                         onClick={fetchMrpRuns}
//                         startIcon={<RefreshIcon sx={{ fontSize: '0.875rem' }} />}
//                         sx={{
//                           height: 32,
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
//                         Refresh
//                       </Button>
//                     </Box>
                    
//                     {/* Show selected MRP run details */}
//                     {selectedMrpRun && (
//                       <Box sx={{ mt: 1, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
//                         <Chip
//                           size="small"
//                           label={`ID: ${selectedMrpRun.mrp_run_id}`}
//                           sx={{ fontSize: '0.65rem', height: 22 }}
//                         />
//                         <Chip
//                           size="small"
//                           label={`Type: ${selectedMrpRun.run_type}`}
//                           sx={{ fontSize: '0.65rem', height: 22 }}
//                         />
//                         <Chip
//                           size="small"
//                           label={`Date: ${new Date(selectedMrpRun.created_at).toLocaleDateString()}`}
//                           sx={{ fontSize: '0.65rem', height: 22 }}
//                         />
//                       </Box>
//                     )}
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
//               <Typography variant="subtitle2" sx={{ color: COLORS.primary, mb: 1.5, fontWeight: 600, fontSize: '0.9rem' }}>
//                 Item Details
//               </Typography>

//               <Grid container spacing={2}>
//                 <Grid size={{ xs: 12 }}>
//                   <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//                     <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary }}>
//                       SELECT ITEM <span style={{ color: '#EF4444' }}>*</span>
//                     </Typography>
//                     <Autocomplete
//                       options={items}
//                       loading={loadingItems}
//                       getOptionLabel={(option) => {
//                         if (!option) return '';
//                         const partNo = option.part_no || option.PartNo || '';
//                         const desc = option.part_description || option.Description || '';
//                         return `${partNo} - ${desc}`;
//                       }}
//                       isOptionEqualToValue={(option, value) => {
//                         if (!option || !value) return false;
//                         return option._id === value._id;
//                       }}
//                       value={selectedItem || null}
//                       onChange={(e, val) => handleItemChange('item_id', val?._id || '')}
//                       renderInput={(params) => (
//                         <TextField
//                           {...params}
//                           size="small"
//                           placeholder="Search and select an item..."
//                           error={!!fieldErrors.item_id}
//                           helperText={fieldErrors.item_id}
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
//                       PaperComponent={CustomPaper}
//                       noOptionsText="No items found"
//                     />
//                   </Box>
//                 </Grid>

//                 {selectedItem && (
//                   <>
//                     <Grid size={{ xs: 12, md: 6 }}>
//                       <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//                         <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary }}>
//                           PART NUMBER
//                         </Typography>
//                         <TextField
//                           fullWidth
//                           size="small"
//                           value={selectedItem.part_no || selectedItem.PartNo || ''}
//                           disabled
//                           sx={{
//                             '& .MuiOutlinedInput-root': {
//                               borderRadius: 1.5,
//                               fontSize: '0.75rem',
//                               backgroundColor: COLORS.background.light,
//                               '& .MuiOutlinedInput-notchedOutline': {
//                                 borderColor: COLORS.border,
//                               },
//                             },
//                             '& .MuiInputBase-input': {
//                               py: 1,
//                               px: 1.5,
//                               fontSize: '0.75rem',
//                               color: COLORS.text.primary,
//                               WebkitTextFillColor: COLORS.text.primary,
//                             },
//                             '& .MuiInputBase-input.Mui-disabled': {
//                               WebkitTextFillColor: COLORS.text.primary,
//                               color: COLORS.text.primary,
//                               opacity: 1,
//                             }
//                           }}
//                         />
//                       </Box>
//                     </Grid>

//                     <Grid size={{ xs: 12, md: 6 }}>
//                       <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//                         <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary }}>
//                           DESCRIPTION
//                         </Typography>
//                         <TextField
//                           fullWidth
//                           size="small"
//                           value={selectedItem.part_description || selectedItem.Description || ''}
//                           disabled
//                           sx={{
//                             '& .MuiOutlinedInput-root': {
//                               borderRadius: 1.5,
//                               fontSize: '0.75rem',
//                               backgroundColor: COLORS.background.light,
//                               '& .MuiOutlinedInput-notchedOutline': {
//                                 borderColor: COLORS.border,
//                               },
//                             },
//                             '& .MuiInputBase-input': {
//                               py: 1,
//                               px: 1.5,
//                               fontSize: '0.75rem',
//                               color: COLORS.text.primary,
//                               WebkitTextFillColor: COLORS.text.primary,
//                             },
//                             '& .MuiInputBase-input.Mui-disabled': {
//                               WebkitTextFillColor: COLORS.text.primary,
//                               color: COLORS.text.primary,
//                               opacity: 1,
//                             }
//                           }}
//                         />
//                       </Box>
//                     </Grid>
//                     <Grid size={{ xs: 12, md: 4 }}>
//                       <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//                         <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary }}>
//                           UNIT
//                         </Typography>
//                         <TextField
//                           fullWidth
//                           size="small"
//                           value={selectedItem.unit || selectedItem.Unit || 'Nos'}
//                           disabled
//                           sx={{
//                             '& .MuiOutlinedInput-root': {
//                               borderRadius: 1.5,
//                               fontSize: '0.75rem',
//                               backgroundColor: COLORS.background.light,
//                               '& .MuiOutlinedInput-notchedOutline': {
//                                 borderColor: COLORS.border,
//                               },
//                             },
//                             '& .MuiInputBase-input': {
//                               py: 1,
//                               px: 1.5,
//                               fontSize: '0.75rem',
//                               color: COLORS.text.primary,
//                               WebkitTextFillColor: COLORS.text.primary,
//                             },
//                             '& .MuiInputBase-input.Mui-disabled': {
//                               WebkitTextFillColor: COLORS.text.primary,
//                               color: COLORS.text.primary,
//                               opacity: 1,
//                             }
//                           }}
//                         />
//                       </Box>
//                     </Grid>

//                     <Grid size={{ xs: 12, md: 4 }}>
//                       <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//                         <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary }}>
//                           QUANTITY <span style={{ color: '#EF4444' }}>*</span>
//                         </Typography>
//                         <TextField
//                           fullWidth
//                           size="small"
//                           type="number"
//                           placeholder="Enter quantity"
//                           value={formData.item.required_qty}
//                           onChange={(e) => handleItemChange('required_qty', e.target.value)}
//                           error={!!fieldErrors.required_qty}
//                           helperText={fieldErrors.required_qty}
//                           inputProps={{ step: 1, min: 1 }}
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
//                       </Box>
//                     </Grid>

//                     <Grid size={{ xs: 12, md: 4 }}>
//                       <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//                         <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary }}>
//                           ESTIMATED PRICE <span style={{ color: '#EF4444' }}>*</span>
//                         </Typography>
//                         <TextField
//                           fullWidth
//                           size="small"
//                           type="number"
//                           placeholder="Enter price"
//                           value={formData.item.estimated_price}
//                           onChange={(e) => handleItemChange('estimated_price', e.target.value)}
//                           error={!!fieldErrors.estimated_price}
//                           helperText={fieldErrors.estimated_price}
//                           InputProps={{ startAdornment: <InputAdornment position="start">₹</InputAdornment> }}
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
//                       </Box>
//                     </Grid>

//                     <Grid size={{ xs: 12 }}>
//                       <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//                         <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary }}>
//                           REMARKS
//                         </Typography>
//                         <TextField
//                           fullWidth
//                           size="small"
//                           multiline
//                           rows={2}
//                           placeholder="Enter any remarks"
//                           value={formData.item.remarks}
//                           onChange={(e) => handleItemChange('remarks', e.target.value)}
//                           sx={{
//                             '& .MuiOutlinedInput-root': {
//                               borderRadius: 1.5,
//                               fontSize: '0.75rem',
//                               '&:hover fieldset': { borderColor: COLORS.primary },
//                               '&.Mui-focused fieldset': { borderColor: COLORS.primary, borderWidth: 1 }
//                             },
//                             '& .MuiInputBase-input': { py: 1, px: 1.5, fontSize: '0.75rem' }
//                           }}
//                         />
//                       </Box>
//                     </Grid>

//                     {formData.item.required_qty && formData.item.estimated_price && (
//                       <Grid size={{ xs: 12 }}>
//                         <Box sx={{
//                           p: 2,
//                           bgcolor: COLORS.background.light,
//                           borderRadius: 1.5,
//                           display: 'flex',
//                           justifyContent: 'space-between',
//                           alignItems: 'center'
//                         }}>
//                           <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color: COLORS.text.secondary }}>
//                             Total Value:
//                           </Typography>
//                           <Typography sx={{ fontSize: '1rem', fontWeight: 700, color: COLORS.primary }}>
//                             ₹{totalValue.toLocaleString()}
//                           </Typography>
//                         </Box>
//                       </Grid>
//                     )}
//                   </>
//                 )}
//               </Grid>
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
//             Create Purchase Requisition
//           </Typography>

//           <Stepper
//             activeStep={activeStep}
//             alternativeLabel
//             connector={<ColorConnector />}
//             sx={{ mb: 0.5, mt: 0.5 }}
//           >
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
//                 disabled={loading || !formData.item.item_id || !formData.item.required_qty || !formData.item.estimated_price || !formData.required_date}
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
//                 {loading ? 'Creating...' : 'Create Requisition'}
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

//       {/* Add Department Modal */}
//       {/* <AddDepartments
//         open={addDepartmentOpen}
//         onClose={() => setAddDepartmentOpen(false)}
//         onAdd={handleDepartmentAdded}
//       /> */}

//       {/* MRP Run Modal */}
//       <MrpRun
//         open={mrpRunOpen}
//         onClose={() => setMrpRunOpen(false)}
//         onRunComplete={handleMrpRunAdded}
//       />
//     </>
//   );
// };

// export default AddPurchaseRequisition;


// import React, { useState, useEffect } from 'react';
// import {
//   Box,
//   Paper,
//   Grid,
//   Stepper,
//   Step,
//   StepLabel,
//   StepConnector,
//   stepConnectorClasses,
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
//   Autocomplete,
//   InputAdornment,
//   styled,
//   Chip,
//   CircularProgress,
//   IconButton,
//   Divider,
//   Collapse
// } from '@mui/material';
// import {
//   Add as AddIcon,
//   Close as CloseIcon,
//   NavigateNext as NavigateNextIcon,
//   NavigateBefore as NavigateBeforeIcon,
//   Search as SearchIcon,
//   Refresh as RefreshIcon,
//   Factory as FactoryIcon
// } from '@mui/icons-material';
// import axios from 'axios';
// import BASE_URL from '../../../config/Config';
// import MrpRun from '../../bommaster/MRP/MrpRun';

// const COLORS = {
//   primary: '#063C3F',
//   primaryLight: '#E8F0F1',
//   primaryDark: '#05292B',
//   text: { primary: '#151C26', secondary: '#4B5568', tertiary: '#94A3B8' },
//   background: { white: '#FFFFFF', light: '#F8FFFC', hover: '#F0FDF9' },
//   border: '#E3E8EF'
// };

// // Modern Stepper Connector
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

// // Custom styled Paper for dropdowns
// const CustomPaper = styled(Paper)({
//   maxHeight: 200,
//   overflow: 'auto',
//   '&::-webkit-scrollbar': {
//     display: 'none'
//   },
//   scrollbarWidth: 'none',
//   '-ms-overflow-style': 'none'
// });

// const steps = ['Basic Information', 'Item Details'];

// const AddPurchaseRequisition = ({ open, onClose, onAdd }) => {
//   const [activeStep, setActiveStep] = useState(0);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState('');
//   const [items, setItems] = useState([]);
//   const [loadingItems, setLoadingItems] = useState(false);
//   const [departments, setDepartments] = useState([]);
//   const [loadingDepartments, setLoadingDepartments] = useState(false);
  
//   // State for inline Add Department form
//   const [showDepartmentForm, setShowDepartmentForm] = useState(false);
//   const [departmentForm, setDepartmentForm] = useState({
//     DepartmentName: "",
//     Description: "",
//   });
//   const [departmentFieldErrors, setDepartmentFieldErrors] = useState({});
//   const [departmentTouched, setDepartmentTouched] = useState({});
//   const [departmentLoading, setDepartmentLoading] = useState(false);
//   const [departmentError, setDepartmentError] = useState('');

//   // State for inline Add Item form
//   const [showItemForm, setShowItemForm] = useState(false);
//   const [itemFormData, setItemFormData] = useState({
//     part_no: '',
//     part_name: '',
//     part_description: '',
//     item_category: '',
//     item_type: '',
//     unit: '',
//     sale_unit: '',
//     hsn_code: '',
//     gst_percentage: '',
//     density: '',
//     material_name: '',
//     material_grade: '',
//     procurement_type: ''
//   });
//   const [itemFieldErrors, setItemFieldErrors] = useState({});
//   const [itemTouched, setItemTouched] = useState({});
//   const [itemLoading, setItemLoading] = useState(false);
//   const [itemError, setItemError] = useState('');
  
//   // MRP Run states
//   const [mrpRuns, setMrpRuns] = useState([]);
//   const [loadingMrpRuns, setLoadingMrpRuns] = useState(false);
//   const [mrpRunOpen, setMrpRunOpen] = useState(false);

//   const [formData, setFormData] = useState({
//     pr_type: 'Material',
//     source: 'Manual',
//     mrp_run_id: '',
//     department: '',
//     required_date: '',
//     item: {
//       item_id: '',
//       required_qty: '',
//       estimated_price: '',
//       remarks: ''
//     }
//   });

//   const [fieldErrors, setFieldErrors] = useState({});

//   const prTypes = [
//     { value: 'Material', label: 'Material' },
//     { value: 'Service', label: 'Service' },
//     { value: 'Capital', label: 'Capital' },
//     { value: 'Subcontract', label: 'Subcontract' }
//   ];

//   const sources = [
//     { value: 'MRP Auto', label: 'MRP Auto' },
//     { value: 'Manual', label: 'Manual' },
//     { value: 'Reorder Alert', label: 'Reorder Alert' },
//     { value: 'Indent', label: 'Indent' }
//   ];

//   // Item form options
//   const itemCategoryOptions = ['Raw Material', 'Semi-Finished', 'Finished Good', 'Consumable', 'Tool', 'Bought-Out', 'Subcontract'];
//   const itemTypeOptions = ['Busbar', 'Stamping', 'Gasket', 'Tooling', 'Copper Strip', 'Aluminium Profile', 'Rubber Sheet', 'Cork', 'Other'];
//   const unitOptions = ['Nos', 'Kg', 'Meter', 'Set', 'Piece', 'Sheet', 'Roll'];
//   const saleUnitOptions = ['Nos', 'Kg', 'Meter', 'Set', 'Piece', 'Sheet', 'Roll'];
//   const procurementTypeOptions = ['Manufacture', 'Purchase', 'Subcontract', 'Free Issue'];
//   const gstPercentageOptions = [0, 5, 12, 18, 28];

//   useEffect(() => {
//     if (open) {
//       fetchItems();
//       fetchDepartments();
//       fetchMrpRuns();
//     }
//   }, [open]);

//   const fetchItems = async () => {
//     try {
//       setLoadingItems(true);
//       const token = localStorage.getItem('token');
//       const response = await axios.get(`${BASE_URL}/api/items`, {
//         headers: { 'Authorization': `Bearer ${token}` }
//       });
//       if (response.data.success) {
//         setItems(response.data.data || []);
//       }
//     } catch (err) {
//       console.error('Error fetching items:', err);
//     } finally {
//       setLoadingItems(false);
//     }
//   };

//   const fetchDepartments = async () => {
//     try {
//       setLoadingDepartments(true);
//       const token = localStorage.getItem('token');
//       const response = await axios.get(`${BASE_URL}/api/departments`, {
//         headers: { 'Authorization': `Bearer ${token}` }
//       });
//       if (response.data.success) {
//         setDepartments(response.data.data || []);
//       }
//     } catch (err) {
//       console.error('Error fetching departments:', err);
//     } finally {
//       setLoadingDepartments(false);
//     }
//   };

//   const fetchMrpRuns = async () => {
//     try {
//       setLoadingMrpRuns(true);
//       const token = localStorage.getItem('token');
//       const response = await axios.get(`${BASE_URL}/api/mrp/runs`, {
//         headers: { 'Authorization': `Bearer ${token}` }
//       });
      
//       if (response.data.success) {
//         const completedRuns = response.data.data.filter(run => run.status === 'Completed');
//         setMrpRuns(completedRuns);
//       }
//     } catch (err) {
//       console.error('Error fetching MRP runs:', err);
//     } finally {
//       setLoadingMrpRuns(false);
//     }
//   };

//   const handleMrpRunAdded = (newMrpRun) => {
//     fetchMrpRuns();
//     if (newMrpRun && newMrpRun._id) {
//       setFormData(prev => ({
//         ...prev,
//         mrp_run_id: newMrpRun._id,
//         source: 'MRP Auto'
//       }));
//     }
//   };

//   // ======================== DEPARTMENT FORM HANDLERS ========================

//   const handleDepartmentFormChange = (e) => {
//     const { name, value } = e.target;
//     setDepartmentFieldErrors(prev => ({ ...prev, [name]: '' }));
//     setDepartmentForm((prev) => ({ ...prev, [name]: value }));

//     if (departmentTouched[name] || value) {
//       const errorMessage = validateDepartmentField(name, value);
//       setDepartmentFieldErrors(prev => ({ ...prev, [name]: errorMessage }));
//     }
//   };

//   const handleDepartmentBlur = (e) => {
//     const { name, value } = e.target;
//     setDepartmentTouched(prev => ({ ...prev, [name]: true }));
//     const errorMessage = validateDepartmentField(name, value);
//     setDepartmentFieldErrors(prev => ({ ...prev, [name]: errorMessage }));
//   };

//   const validateDepartmentField = (name, value) => {
//     switch (name) {
//       case 'DepartmentName':
//         if (!value?.trim()) return 'Department name is required';
//         if (value.trim().length < 2) return 'Department name must be at least 2 characters';
//         if (value.length > 100) return 'Department name should not exceed 100 characters';
//         return '';
//       case 'Description':
//         if (value && value.length > 500) return 'Description should not exceed 500 characters';
//         return '';
//       default:
//         return '';
//     }
//   };

//   const validateDepartmentForm = () => {
//     const errors = {};
//     let isValid = true;

//     if (!departmentForm.DepartmentName?.trim()) {
//       errors.DepartmentName = 'Department name is required';
//       isValid = false;
//     } else if (departmentForm.DepartmentName.trim().length < 2) {
//       errors.DepartmentName = 'Department name must be at least 2 characters';
//       isValid = false;
//     }

//     setDepartmentFieldErrors(errors);
//     if (!isValid) {
//       setDepartmentError('Please fix the errors above');
//     }
//     return isValid;
//   };

//   const saveDepartment = async () => {
//     if (!validateDepartmentForm()) return;

//     setDepartmentLoading(true);
//     setDepartmentError('');

//     try {
//       const token = localStorage.getItem("token");
//       const response = await axios.post(
//         `${BASE_URL}/api/departments`,
//         departmentForm,
//         { headers: { Authorization: `Bearer ${token}` } }
//       );

//       if (response.data.success) {
//         const newDepartment = response.data.data;
//         setDepartments((prev) => [...prev, newDepartment]);
//         setFormData((prev) => ({ ...prev, department: newDepartment._id }));
//         setDepartmentForm({ DepartmentName: "", Description: "" });
//         setDepartmentFieldErrors({});
//         setDepartmentTouched({});
//         setDepartmentError('');
//         setShowDepartmentForm(false);
//       }
//     } catch (err) {
//       setDepartmentError(err.response?.data?.message || "Unable to add Department");
//     } finally {
//       setDepartmentLoading(false);
//     }
//   };

//   // ======================== ITEM FORM HANDLERS ========================

//   const handleItemFormChange = (e) => {
//     const { name, value } = e.target;
//     setItemFieldErrors(prev => ({ ...prev, [name]: '' }));
//     setItemFormData((prev) => ({ ...prev, [name]: value }));

//     if (itemTouched[name] || value) {
//       const errorMessage = validateItemField(name, value);
//       setItemFieldErrors(prev => ({ ...prev, [name]: errorMessage }));
//     }
//   };

//   const handleItemFormSelectChange = (e) => {
//     const { name, value } = e.target;
//     setItemFieldErrors(prev => ({ ...prev, [name]: '' }));
//     setItemFormData((prev) => ({ ...prev, [name]: value }));

//     if (itemTouched[name] || value) {
//       const errorMessage = validateItemField(name, value);
//       setItemFieldErrors(prev => ({ ...prev, [name]: errorMessage }));
//     }
//   };

//   const handleItemBlur = (e) => {
//     const { name, value } = e.target;
//     setItemTouched(prev => ({ ...prev, [name]: true }));
//     const errorMessage = validateItemField(name, value);
//     setItemFieldErrors(prev => ({ ...prev, [name]: errorMessage }));
//   };

//   const validateItemField = (name, value) => {
//     switch (name) {
//       case 'part_no':
//         if (!value?.trim()) return 'Part number is required';
//         if (value.length > 50) return 'Part number should not exceed 50 characters';
//         return '';
//       case 'part_name':
//         if (!value?.trim()) return 'Part name is required';
//         if (value.length > 100) return 'Part name should not exceed 100 characters';
//         return '';
//       case 'part_description':
//         if (!value?.trim()) return 'Part description is required';
//         if (value.length > 200) return 'Part description should not exceed 200 characters';
//         return '';
//       case 'item_category':
//         if (!value) return 'Item category is required';
//         return '';
//       case 'unit':
//         if (!value) return 'Unit is required';
//         return '';
//       case 'sale_unit':
//         if (!value) return 'Sale unit is required';
//         return '';
//       case 'material_name':
//         if (!value?.trim()) return 'Material name is required';
//         if (value.length > 100) return 'Material name should not exceed 100 characters';
//         return '';
//       case 'material_grade':
//         if (!value?.trim()) return 'Material grade is required';
//         return '';
//       case 'density':
//         if (!value) return 'Density is required';
//         if (isNaN(value) || parseFloat(value) <= 0) return 'Density must be a positive number';
//         if (parseFloat(value) > 25) return 'Density cannot exceed 25 g/cm³';
//         return '';
//       default:
//         return '';
//     }
//   };

//   const validateItemForm = () => {
//     const errors = {};
//     let isValid = true;

//     const requiredFields = [
//       { name: 'part_no', label: 'Part number' },
//       { name: 'part_name', label: 'Part name' },
//       { name: 'part_description', label: 'Part description' },
//       { name: 'item_category', label: 'Item category' },
//       { name: 'unit', label: 'Unit' },
//       { name: 'sale_unit', label: 'Sale unit' },
//       { name: 'material_name', label: 'Material name' },
//       { name: 'material_grade', label: 'Material grade' },
//       { name: 'density', label: 'Density' }
//     ];

//     requiredFields.forEach(field => {
//       const value = itemFormData[field.name];
//       if (!value || (typeof value === 'string' && !value.trim())) {
//         errors[field.name] = `${field.label} is required`;
//         isValid = false;
//       }
//     });

//     // Additional validations for filled fields
//     if (itemFormData.part_no) {
//       const err = validateItemField('part_no', itemFormData.part_no);
//       if (err) { errors.part_no = err; isValid = false; }
//     }
//     if (itemFormData.part_name) {
//       const err = validateItemField('part_name', itemFormData.part_name);
//       if (err) { errors.part_name = err; isValid = false; }
//     }
//     if (itemFormData.material_name) {
//       const err = validateItemField('material_name', itemFormData.material_name);
//       if (err) { errors.material_name = err; isValid = false; }
//     }
//     if (itemFormData.density) {
//       const err = validateItemField('density', itemFormData.density);
//       if (err) { errors.density = err; isValid = false; }
//     }

//     setItemFieldErrors(errors);
//     if (!isValid) {
//       setItemError('Please fix the errors above');
//     }
//     return isValid;
//   };

//   const saveItem = async () => {
//     if (!validateItemForm()) return;

//     setItemLoading(true);
//     setItemError('');

//     try {
//       const token = localStorage.getItem('token');
      
//       const submissionData = {
//         part_no: itemFormData.part_no,
//         part_name: itemFormData.part_name,
//         part_description: itemFormData.part_description,
//         item_category: itemFormData.item_category,
//         item_type: itemFormData.item_type || 'Other',
//         unit: itemFormData.unit,
//         sale_unit: itemFormData.sale_unit,
//         material_name: itemFormData.material_name,
//         material_grade: itemFormData.material_grade,
//         density: parseFloat(itemFormData.density),
//         procurement_type: itemFormData.procurement_type || 'Manufacture',
//         hsn_code: itemFormData.hsn_code || undefined,
//         gst_percentage: itemFormData.gst_percentage ? parseFloat(itemFormData.gst_percentage) : 18
//       };

//       // Remove undefined values
//       Object.keys(submissionData).forEach(key => {
//         if (submissionData[key] === undefined) {
//           delete submissionData[key];
//         }
//       });

//       const response = await axios.post(`${BASE_URL}/api/items`, submissionData, {
//         headers: {
//           'Authorization': `Bearer ${token}`,
//           'Content-Type': 'application/json'
//         }
//       });

//       if (response.data.success) {
//         const newItem = response.data.data;
//         setItems((prev) => [...prev, newItem]);
//         setFormData(prev => ({
//           ...prev,
//           item: { ...prev.item, item_id: newItem._id }
//         }));
        
//         // Reset item form
//         setItemFormData({
//           part_no: '',
//           part_name: '',
//           part_description: '',
//           item_category: '',
//           item_type: '',
//           unit: '',
//           sale_unit: '',
//           hsn_code: '',
//           gst_percentage: '',
//           density: '',
//           material_name: '',
//           material_grade: '',
//           procurement_type: ''
//         });
//         setItemFieldErrors({});
//         setItemTouched({});
//         setItemError('');
//         setShowItemForm(false);
//       }
//     } catch (err) {
//       setItemError(err.response?.data?.message || 'Failed to add item');
//     } finally {
//       setItemLoading(false);
//     }
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

//   const handleItemChange = (field, value) => {
//     setFieldErrors(prev => ({ ...prev, [field]: '' }));
//     setFormData(prev => ({
//       ...prev,
//       item: { ...prev.item, [field]: value }
//     }));
//   };

//   const validateStep = (step) => {
//     const errors = {};
//     let isValid = true;

//     switch (step) {
//       case 0:
//         if (!formData.pr_type) {
//           errors.pr_type = 'PR type is required';
//           isValid = false;
//         }
//         if (!formData.source) {
//           errors.source = 'Source is required';
//           isValid = false;
//         }
//         if (!formData.department) {
//           errors.department = 'Department is required';
//           isValid = false;
//         }
//         if (!formData.required_date) {
//           errors.required_date = 'Required date is required';
//           isValid = false;
//         }
//         break;
//       case 1:
//         if (!formData.item.item_id) {
//           errors.item_id = 'Item is required';
//           isValid = false;
//         }
//         if (!formData.item.required_qty) {
//           errors.required_qty = 'Quantity is required';
//           isValid = false;
//         } else if (formData.item.required_qty <= 0) {
//           errors.required_qty = 'Quantity must be greater than 0';
//           isValid = false;
//         }
//         if (!formData.item.estimated_price) {
//           errors.estimated_price = 'Estimated price is required';
//           isValid = false;
//         } else if (formData.item.estimated_price <= 0) {
//           errors.estimated_price = 'Price must be greater than 0';
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
//     if (!formData.item.item_id || !formData.item.required_qty || !formData.item.estimated_price) {
//       setError('Please fill all item details');
//       return;
//     }

//     setLoading(true);
//     setError('');

//     try {
//       const token = localStorage.getItem('token');
//       const user = JSON.parse(localStorage.getItem('user') || '{}');

//       const submissionData = {
//         pr_type: formData.pr_type,
//         source: formData.source,
//         mrp_run_id: formData.mrp_run_id || null,
//         department: formData.department,
//         required_by: formData.required_date,
//         items: [{
//           item_id: formData.item.item_id,
//           required_qty: parseFloat(formData.item.required_qty),
//           estimated_price: parseFloat(formData.item.estimated_price),
//           remarks: formData.item.remarks
//         }],
//         requested_by: user._id,
//         created_by: user._id,
//         status: 'Submitted'
//       };

//       const response = await axios.post(`${BASE_URL}/api/purchase-requisitions`, submissionData,
//         {
//           headers: {
//             'Authorization': `Bearer ${token}`,
//             'Content-Type': 'application/json'
//           }
//         });

//       if (response.data.success) {
//         onAdd(response.data.data);
//         resetForm();
//         onClose();
//       } else {
//         setError(response.data.message || 'Failed to create purchase requisition');
//       }
//     } catch (err) {
//       console.error('Error creating PR:', err);
//       setError(err.response?.data?.message || 'Failed to create purchase requisition');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const resetForm = () => {
//     setFormData({
//       pr_type: 'Material',
//       source: 'Manual',
//       mrp_run_id: '',
//       department: '',
//       required_date: '',
//       item: {
//         item_id: '',
//         required_qty: '',
//         estimated_price: '',
//         remarks: ''
//       }
//     });
//     setFieldErrors({});
//     setError('');
//     setActiveStep(0);
//     setShowDepartmentForm(false);
//     setShowItemForm(false);
//     setDepartmentForm({ DepartmentName: "", Description: "" });
//     setDepartmentFieldErrors({});
//     setDepartmentTouched({});
//     setDepartmentError('');
//     setItemFormData({
//       part_no: '',
//       part_name: '',
//       part_description: '',
//       item_category: '',
//       item_type: '',
//       unit: '',
//       sale_unit: '',
//       hsn_code: '',
//       gst_percentage: '',
//       density: '',
//       material_name: '',
//       material_grade: '',
//       procurement_type: ''
//     });
//     setItemFieldErrors({});
//     setItemTouched({});
//     setItemError('');
//   };

//   const handleClose = () => {
//     resetForm();
//     onClose();
//   };

//   const selectedItem = items.find(i => i._id === formData.item.item_id);
//   const selectedDepartment = departments.find(dept => dept._id === formData.department);
//   const selectedMrpRun = mrpRuns.find(run => run._id === formData.mrp_run_id);
//   const totalValue = selectedItem && formData.item.required_qty && formData.item.estimated_price
//     ? parseFloat(formData.item.required_qty) * parseFloat(formData.item.estimated_price)
//     : 0;
//   const today = new Date().toISOString().split('T')[0];

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
//                 <Grid size={{ xs: 12, md: 4 }}>
//                   <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//                     <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary }}>
//                       PR TYPE <span style={{ color: '#EF4444' }}>*</span>
//                     </Typography>
//                     <FormControl fullWidth size="small" error={!!fieldErrors.pr_type}>
//                       <Select
//                         name="pr_type"
//                         value={formData.pr_type}
//                         onChange={handleSelectChange}
//                         sx={{
//                           borderRadius: 1.5,
//                           fontSize: '0.75rem',
//                           '& .MuiSelect-select': { py: 1, px: 1.5, fontSize: '0.75rem' },
//                           '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: COLORS.primary },
//                           '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: COLORS.primary, borderWidth: 1 }
//                         }}
//                       >
//                         {prTypes.map((type) => (
//                           <MenuItem key={type.value} value={type.value} sx={{ fontSize: '0.75rem' }}>
//                             {type.label}
//                           </MenuItem>
//                         ))}
//                       </Select>
//                     </FormControl>
//                   </Box>
//                 </Grid>

//                 <Grid size={{ xs: 12, md: 4 }}>
//                   <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//                     <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary }}>
//                       SOURCE <span style={{ color: '#EF4444' }}>*</span>
//                     </Typography>
//                     <FormControl fullWidth size="small" error={!!fieldErrors.source}>
//                       <Select
//                         name="source"
//                         value={formData.source}
//                         onChange={handleSelectChange}
//                         sx={{
//                           borderRadius: 1.5,
//                           fontSize: '0.75rem',
//                           '& .MuiSelect-select': { py: 1, px: 1.5, fontSize: '0.75rem' },
//                           '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: COLORS.primary },
//                           '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: COLORS.primary, borderWidth: 1 }
//                         }}
//                       >
//                         {sources.map((src) => (
//                           <MenuItem key={src.value} value={src.value} sx={{ fontSize: '0.75rem' }}>
//                             {src.label}
//                           </MenuItem>
//                         ))}
//                       </Select>
//                     </FormControl>
//                   </Box>
//                 </Grid>

//                 <Grid size={{ xs: 12, md: 4 }}>
//                   <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//                     <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary }}>
//                       DEPARTMENT <span style={{ color: '#EF4444' }}>*</span>
//                     </Typography>

//                     <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
//                       <Box sx={{ flex: 1 }}>
//                         <Autocomplete
//                           options={departments}
//                           loading={loadingDepartments}
//                           getOptionLabel={(option) => option?.DepartmentName || ''}
//                           isOptionEqualToValue={(option, value) => option?._id === value?._id}
//                           value={selectedDepartment || null}
//                           onChange={(event, newValue) => {
//                             setFormData(prev => ({
//                               ...prev,
//                               department: newValue?._id || ''
//                             }));
//                             if (fieldErrors.department) {
//                               setFieldErrors(prev => ({ ...prev, department: '' }));
//                             }
//                           }}
//                           renderInput={(params) => (
//                             <TextField
//                               {...params}
//                               size="small"
//                               placeholder="Select department"
//                               error={!!fieldErrors.department}
//                               helperText={fieldErrors.department}
//                               sx={{
//                                 '& .MuiOutlinedInput-root': {
//                                   borderRadius: 1.5,
//                                   fontSize: '0.75rem',
//                                   '&:hover fieldset': { borderColor: COLORS.primary },
//                                   '&.Mui-focused fieldset': { borderColor: COLORS.primary, borderWidth: 1 }
//                                 },
//                                 '& .MuiInputBase-input': { py: 1, px: 1.5, fontSize: '0.75rem' },
//                                 '& .MuiFormHelperText-root': { fontSize: '0.65rem', marginLeft: 0 }
//                               }}
//                               InputProps={{
//                                 ...params.InputProps,
//                                 startAdornment: (
//                                   <InputAdornment position="start">
//                                     <SearchIcon sx={{ fontSize: '1rem', color: COLORS.text.tertiary }} />
//                                   </InputAdornment>
//                                 ),
//                               }}
//                             />
//                           )}
//                           PaperComponent={CustomPaper}
//                           noOptionsText="No departments found"
//                         />
//                       </Box>

//                       <Button
//                         variant="outlined"
//                         size="small"
//                         onClick={() => setShowDepartmentForm((prev) => !prev)}
//                         startIcon={showDepartmentForm ? <CloseIcon sx={{ fontSize: '0.875rem' }} /> : <AddIcon sx={{ fontSize: '0.875rem' }} />}
//                         sx={{
//                           height: 40,
//                           minWidth: 'auto',
//                           px: 1.5,
//                           borderRadius: 1.5,
//                           border: `1px solid ${COLORS.border}`,
//                           color: COLORS.text.secondary,
//                           fontSize: '0.7rem',
//                           fontWeight: 500,
//                           textTransform: 'none',
//                           whiteSpace: 'nowrap',
//                           alignSelf: 'flex-end',
//                           '&:hover': {
//                             borderColor: COLORS.primary,
//                             bgcolor: `${COLORS.primary}10`,
//                             color: COLORS.primary
//                           }
//                         }}
//                       >
//                         {showDepartmentForm ? 'Cancel' : 'Add New'}
//                       </Button>
//                     </Box>
//                   </Box>
//                 </Grid>

//                 {/* Inline Add Department Form */}
//                 <Grid size={{ xs: 12 }}>
//                   <Collapse in={showDepartmentForm}>
//                     <Box sx={{ mt: 1, p: 2.5, bgcolor: COLORS.background.light, borderRadius: 2, border: `1px solid ${COLORS.primary}` }}>
//                       <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
//                         <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color: COLORS.primary }}>
//                           Add New Department
//                         </Typography>
//                         <IconButton
//                           size="small"
//                           onClick={() => {
//                             setShowDepartmentForm(false);
//                             setDepartmentError('');
//                             setDepartmentForm({ DepartmentName: '', Description: '' });
//                             setDepartmentFieldErrors({});
//                             setDepartmentTouched({});
//                           }}
//                           sx={{ color: COLORS.text.tertiary, '&:hover': { color: COLORS.primary } }}
//                         >
//                           <CloseIcon sx={{ fontSize: '1rem' }} />
//                         </IconButton>
//                       </Box>

//                       <Grid container spacing={1.5}>
//                         <Grid size={{ xs: 12, md: 6 }}>
//                           <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//                             <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary, letterSpacing: '0.5px' }}>
//                               DEPARTMENT NAME <span style={{ color: '#EF4444' }}>*</span>
//                             </Typography>
//                             <TextField
//                               fullWidth
//                               size="small"
//                               name="DepartmentName"
//                               value={departmentForm.DepartmentName}
//                               onChange={handleDepartmentFormChange}
//                               onBlur={handleDepartmentBlur}
//                               required
//                               disabled={departmentLoading}
//                               placeholder="Enter department name"
//                               error={!!departmentFieldErrors.DepartmentName}
//                               helperText={departmentFieldErrors.DepartmentName}
//                               inputProps={{ maxLength: 100 }}
//                               sx={textFieldSx}
//                             />
//                             <Typography sx={{ fontSize: '0.65rem', color: COLORS.text.tertiary }}>
//                               Minimum 2 characters required
//                             </Typography>
//                           </Box>
//                         </Grid>

//                         <Grid size={{ xs: 12, md: 6 }}>
//                           <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//                             <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary, letterSpacing: '0.5px' }}>
//                               DESCRIPTION
//                             </Typography>
//                             <TextField
//                               fullWidth
//                               size="small"
//                               name="Description"
//                               value={departmentForm.Description}
//                               onChange={handleDepartmentFormChange}
//                               onBlur={handleDepartmentBlur}
//                               disabled={departmentLoading}
//                               placeholder="Enter department description"
//                               error={!!departmentFieldErrors.Description}
//                               helperText={departmentFieldErrors.Description}
//                               multiline
//                               rows={2}
//                               inputProps={{ maxLength: 500 }}
//                               sx={textFieldSx}
//                             />
//                           </Box>
//                         </Grid>
//                       </Grid>

//                       {departmentError && (
//                         <Alert severity="error" sx={{ mt: 2, borderRadius: 1.5, fontSize: '0.75rem', py: 0.5 }}>
//                           {departmentError}
//                         </Alert>
//                       )}

//                       <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
//                         <Button
//                           onClick={() => {
//                             setShowDepartmentForm(false);
//                             setDepartmentError('');
//                             setDepartmentForm({ DepartmentName: '', Description: '' });
//                             setDepartmentFieldErrors({});
//                             setDepartmentTouched({});
//                           }}
//                           disabled={departmentLoading}
//                           size="small"
//                           sx={cancelButtonSx}
//                         >
//                           Cancel
//                         </Button>
//                         <Button
//                           variant="contained"
//                           onClick={saveDepartment}
//                           disabled={departmentLoading || !departmentForm.DepartmentName.trim()}
//                           size="small"
//                           startIcon={<AddIcon sx={{ fontSize: '1rem' }} />}
//                           sx={addButtonSx}
//                         >
//                           {departmentLoading ? 'Adding...' : 'Add Department'}
//                         </Button>
//                       </Box>
//                     </Box>
//                   </Collapse>
//                 </Grid>

//                 <Grid size={{ xs: 12, md: 6 }}>
//                   <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//                     <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary }}>
//                       REQUIRED DATE <span style={{ color: '#EF4444' }}>*</span>
//                     </Typography>
//                     <TextField
//                       fullWidth
//                       size="small"
//                       type="date"
//                       name="required_date"
//                       value={formData.required_date}
//                       onChange={handleChange}
//                       error={!!fieldErrors.required_date}
//                       helperText={fieldErrors.required_date}
//                       InputLabelProps={{ shrink: true }}
//                       inputProps={{ min: today }}
//                       sx={textFieldSx}
//                     />
//                   </Box>
//                 </Grid>

//                 <Grid size={{ xs: 12, md: 6 }}>
//                   <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//                     <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary }}>
//                       MRP RUN ID
//                     </Typography>
//                     <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
//                       <Box sx={{ flex: 1 }}>
//                         <Autocomplete
//                           options={mrpRuns}
//                           loading={loadingMrpRuns}
//                           getOptionLabel={(option) => option?.mrp_run_id || `MRP-${option?._id?.slice(-8)}`}
//                           isOptionEqualToValue={(option, value) => option?._id === value?._id}
//                           value={selectedMrpRun || null}
//                           onChange={(event, newValue) => {
//                             setFormData(prev => ({
//                               ...prev,
//                               mrp_run_id: newValue?._id || '',
//                               source: newValue ? 'MRP Auto' : prev.source
//                             }));
//                           }}
//                           renderInput={(params) => (
//                             <TextField
//                               {...params}
//                               size="small"
//                               placeholder="Select MRP run"
//                               sx={textFieldSx}
//                               InputProps={{
//                                 ...params.InputProps,
//                                 startAdornment: (
//                                   <InputAdornment position="start">
//                                     <FactoryIcon sx={{ fontSize: '1rem', color: COLORS.text.tertiary }} />
//                                   </InputAdornment>
//                                 ),
//                                 endAdornment: (
//                                   <>
//                                     {loadingMrpRuns && <CircularProgress size={16} />}
//                                     {params.InputProps.endAdornment}
//                                   </>
//                                 ),
//                               }}
//                             />
//                           )}
//                           PaperComponent={CustomPaper}
//                           noOptionsText={
//                             <Box sx={{ p: 2, textAlign: 'center' }}>
//                               <Typography sx={{ fontSize: '0.75rem', color: COLORS.text.secondary, mb: 1 }}>
//                                 No MRP runs found
//                               </Typography>
//                               <Button
//                                 size="small"
//                                 variant="outlined"
//                                 startIcon={<AddIcon />}
//                                 onClick={() => setMrpRunOpen(true)}
//                                 sx={{ fontSize: '0.7rem' }}
//                               >
//                                 Run New MRP
//                               </Button>
//                             </Box>
//                           }
//                         />
//                       </Box>

//                       <Button
//                         variant="outlined"
//                         size="small"
//                         onClick={() => setMrpRunOpen(true)}
//                         startIcon={<FactoryIcon sx={{ fontSize: '0.875rem' }} />}
//                         sx={actionButtonSx}
//                       >
//                         Run MRP
//                       </Button>
                      
//                       <Button
//                         variant="outlined"
//                         size="small"
//                         onClick={fetchMrpRuns}
//                         startIcon={<RefreshIcon sx={{ fontSize: '0.875rem' }} />}
//                         sx={actionButtonSx}
//                       >
//                         Refresh
//                       </Button>
//                     </Box>
                    
//                     {selectedMrpRun && (
//                       <Box sx={{ mt: 1, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
//                         <Chip size="small" label={`ID: ${selectedMrpRun.mrp_run_id}`} sx={{ fontSize: '0.65rem', height: 22 }} />
//                         <Chip size="small" label={`Type: ${selectedMrpRun.run_type}`} sx={{ fontSize: '0.65rem', height: 22 }} />
//                         <Chip size="small" label={`Date: ${new Date(selectedMrpRun.created_at).toLocaleDateString()}`} sx={{ fontSize: '0.65rem', height: 22 }} />
//                       </Box>
//                     )}
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
//               <Typography variant="subtitle2" sx={{ color: COLORS.primary, mb: 1.5, fontWeight: 600, fontSize: '0.9rem' }}>
//                 Item Details
//               </Typography>

//               <Grid container spacing={2}>
//                 <Grid size={{ xs: 12 }}>
//                   <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//                     <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary }}>
//                       SELECT ITEM <span style={{ color: '#EF4444' }}>*</span>
//                     </Typography>
//                     <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
//                       <Box sx={{ flex: 1 }}>
//                         <Autocomplete
//                           options={items}
//                           loading={loadingItems}
//                           getOptionLabel={(option) => {
//                             if (!option) return '';
//                             const partNo = option.part_no || option.PartNo || '';
//                             const desc = option.part_description || option.Description || '';
//                             return `${partNo} - ${desc}`;
//                           }}
//                           isOptionEqualToValue={(option, value) => option?._id === value?._id}
//                           value={selectedItem || null}
//                           onChange={(e, val) => handleItemChange('item_id', val?._id || '')}
//                           renderInput={(params) => (
//                             <TextField
//                               {...params}
//                               size="small"
//                               placeholder="Search and select an item..."
//                               error={!!fieldErrors.item_id}
//                               helperText={fieldErrors.item_id}
//                               sx={textFieldSx}
//                             />
//                           )}
//                           PaperComponent={CustomPaper}
//                           noOptionsText={
//                             <Box sx={{ p: 2, textAlign: 'center' }}>
//                               <Typography sx={{ fontSize: '0.75rem', color: COLORS.text.secondary, mb: 1 }}>
//                                 No items found
//                               </Typography>
//                             </Box>
//                           }
//                         />
//                       </Box>
//                       <Button
//                         variant="outlined"
//                         size="small"
//                         onClick={() => setShowItemForm((prev) => !prev)}
//                         startIcon={showItemForm ? <CloseIcon sx={{ fontSize: '0.875rem' }} /> : <AddIcon sx={{ fontSize: '0.875rem' }} />}
//                         sx={{
//                           height: 40,
//                           minWidth: 'auto',
//                           px: 1.5,
//                           borderRadius: 1.5,
//                           border: `1px solid ${COLORS.border}`,
//                           color: COLORS.text.secondary,
//                           fontSize: '0.7rem',
//                           fontWeight: 500,
//                           textTransform: 'none',
//                           whiteSpace: 'nowrap',
//                           alignSelf: 'flex-end',
//                           '&:hover': {
//                             borderColor: COLORS.primary,
//                             bgcolor: `${COLORS.primary}10`,
//                             color: COLORS.primary
//                           }
//                         }}
//                       >
//                         {showItemForm ? 'Cancel' : 'Add New'}
//                       </Button>
//                     </Box>
//                   </Box>
//                 </Grid>

//                 {/* Inline Add Item Form */}
//                 <Grid size={{ xs: 12 }}>
//                   <Collapse in={showItemForm}>
//                     <Box sx={{ mt: 1, p: 2.5, bgcolor: COLORS.background.light, borderRadius: 2, border: `1px solid ${COLORS.primary}` }}>
//                       <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
//                         <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color: COLORS.primary }}>
//                           Add New Item (Quick Add)
//                         </Typography>
//                         <IconButton
//                           size="small"
//                           onClick={() => {
//                             setShowItemForm(false);
//                             setItemError('');
//                             setItemFormData({
//                               part_no: '',
//                               part_name: '',
//                               part_description: '',
//                               item_category: '',
//                               item_type: '',
//                               unit: '',
//                               sale_unit: '',
//                               hsn_code: '',
//                               gst_percentage: '',
//                               density: '',
//                               material_name: '',
//                               material_grade: '',
//                               procurement_type: ''
//                             });
//                             setItemFieldErrors({});
//                             setItemTouched({});
//                           }}
//                           sx={{ color: COLORS.text.tertiary, '&:hover': { color: COLORS.primary } }}
//                         >
//                           <CloseIcon sx={{ fontSize: '1rem' }} />
//                         </IconButton>
//                       </Box>

//                       <Grid container spacing={1.5}>
//                         {/* Part Number */}
//                         <Grid size={{ xs: 12, md: 6 }}>
//                           <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//                             <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary, letterSpacing: '0.5px' }}>
//                               PART NUMBER <span style={{ color: '#EF4444' }}>*</span>
//                             </Typography>
//                             <TextField
//                               fullWidth
//                               size="small"
//                               name="part_no"
//                               value={itemFormData.part_no}
//                               onChange={handleItemFormChange}
//                               onBlur={handleItemBlur}
//                               required
//                               disabled={itemLoading}
//                               placeholder="e.g., BR-001"
//                               error={!!itemFieldErrors.part_no}
//                               helperText={itemFieldErrors.part_no}
//                               inputProps={{ maxLength: 50 }}
//                               sx={textFieldSx}
//                             />
//                           </Box>
//                         </Grid>

//                         {/* Part Name */}
//                         <Grid size={{ xs: 12, md: 6 }}>
//                           <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//                             <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary, letterSpacing: '0.5px' }}>
//                               PART NAME <span style={{ color: '#EF4444' }}>*</span>
//                             </Typography>
//                             <TextField
//                               fullWidth
//                               size="small"
//                               name="part_name"
//                               value={itemFormData.part_name}
//                               onChange={handleItemFormChange}
//                               onBlur={handleItemBlur}
//                               required
//                               disabled={itemLoading}
//                               placeholder="e.g., Copper Busbar"
//                               error={!!itemFieldErrors.part_name}
//                               helperText={itemFieldErrors.part_name}
//                               inputProps={{ maxLength: 100 }}
//                               sx={textFieldSx}
//                             />
//                           </Box>
//                         </Grid>

//                         {/* Item Category */}
//                         <Grid size={{ xs: 12, md: 4 }}>
//                           <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//                             <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary, letterSpacing: '0.5px' }}>
//                               ITEM CATEGORY <span style={{ color: '#EF4444' }}>*</span>
//                             </Typography>
//                             <FormControl fullWidth size="small" error={!!itemFieldErrors.item_category}>
//                               <Select
//                                 name="item_category"
//                                 value={itemFormData.item_category}
//                                 onChange={handleItemFormSelectChange}
//                                 onBlur={handleItemBlur}
//                                 disabled={itemLoading}
//                                 displayEmpty
//                                 sx={selectSx}
//                               >
//                                 <MenuItem value="" disabled sx={{ fontSize: '0.75rem' }}>Select category</MenuItem>
//                                 {itemCategoryOptions.map((option) => (
//                                   <MenuItem key={option} value={option} sx={{ fontSize: '0.75rem' }}>{option}</MenuItem>
//                                 ))}
//                               </Select>
//                               {itemFieldErrors.item_category && (
//                                 <Typography sx={{ fontSize: '0.65rem', color: '#EF4444', mt: 0.25 }}>
//                                   {itemFieldErrors.item_category}
//                                 </Typography>
//                               )}
//                             </FormControl>
//                           </Box>
//                         </Grid>

//                         {/* Unit */}
//                         <Grid size={{ xs: 12, md: 4 }}>
//                           <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//                             <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary, letterSpacing: '0.5px' }}>
//                               UNIT <span style={{ color: '#EF4444' }}>*</span>
//                             </Typography>
//                             <FormControl fullWidth size="small" error={!!itemFieldErrors.unit}>
//                               <Select
//                                 name="unit"
//                                 value={itemFormData.unit}
//                                 onChange={handleItemFormSelectChange}
//                                 onBlur={handleItemBlur}
//                                 disabled={itemLoading}
//                                 displayEmpty
//                                 sx={selectSx}
//                               >
//                                 <MenuItem value="" disabled sx={{ fontSize: '0.75rem' }}>Select unit</MenuItem>
//                                 {unitOptions.map((option) => (
//                                   <MenuItem key={option} value={option} sx={{ fontSize: '0.75rem' }}>{option}</MenuItem>
//                                 ))}
//                               </Select>
//                               {itemFieldErrors.unit && (
//                                 <Typography sx={{ fontSize: '0.65rem', color: '#EF4444', mt: 0.25 }}>
//                                   {itemFieldErrors.unit}
//                                 </Typography>
//                               )}
//                             </FormControl>
//                           </Box>
//                         </Grid>

//                         {/* Sale Unit */}
//                         <Grid size={{ xs: 12, md: 4 }}>
//                           <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//                             <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary, letterSpacing: '0.5px' }}>
//                               SALE UNIT <span style={{ color: '#EF4444' }}>*</span>
//                             </Typography>
//                             <FormControl fullWidth size="small" error={!!itemFieldErrors.sale_unit}>
//                               <Select
//                                 name="sale_unit"
//                                 value={itemFormData.sale_unit}
//                                 onChange={handleItemFormSelectChange}
//                                 onBlur={handleItemBlur}
//                                 disabled={itemLoading}
//                                 displayEmpty
//                                 sx={selectSx}
//                               >
//                                 <MenuItem value="" disabled sx={{ fontSize: '0.75rem' }}>Select sale unit</MenuItem>
//                                 {saleUnitOptions.map((option) => (
//                                   <MenuItem key={option} value={option} sx={{ fontSize: '0.75rem' }}>{option}</MenuItem>
//                                 ))}
//                               </Select>
//                               {itemFieldErrors.sale_unit && (
//                                 <Typography sx={{ fontSize: '0.65rem', color: '#EF4444', mt: 0.25 }}>
//                                   {itemFieldErrors.sale_unit}
//                                 </Typography>
//                               )}
//                             </FormControl>
//                           </Box>
//                         </Grid>

//                         {/* Part Description */}
//                         <Grid size={{ xs: 12 }}>
//                           <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//                             <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary, letterSpacing: '0.5px' }}>
//                               PART DESCRIPTION <span style={{ color: '#EF4444' }}>*</span>
//                             </Typography>
//                             <TextField
//                               fullWidth
//                               size="small"
//                               name="part_description"
//                               value={itemFormData.part_description}
//                               onChange={handleItemFormChange}
//                               onBlur={handleItemBlur}
//                               required
//                               disabled={itemLoading}
//                               multiline
//                               rows={2}
//                               placeholder="Enter detailed part description"
//                               error={!!itemFieldErrors.part_description}
//                               helperText={itemFieldErrors.part_description}
//                               inputProps={{ maxLength: 200 }}
//                               sx={textFieldSx}
//                             />
//                           </Box>
//                         </Grid>

//                         {/* Material Name */}
//                         <Grid size={{ xs: 12, md: 4 }}>
//                           <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//                             <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary, letterSpacing: '0.5px' }}>
//                               MATERIAL NAME <span style={{ color: '#EF4444' }}>*</span>
//                             </Typography>
//                             <TextField
//                               fullWidth
//                               size="small"
//                               name="material_name"
//                               value={itemFormData.material_name}
//                               onChange={handleItemFormChange}
//                               onBlur={handleItemBlur}
//                               required
//                               disabled={itemLoading}
//                               placeholder="e.g., Copper"
//                               error={!!itemFieldErrors.material_name}
//                               helperText={itemFieldErrors.material_name}
//                               inputProps={{ maxLength: 100 }}
//                               sx={textFieldSx}
//                             />
//                           </Box>
//                         </Grid>

//                         {/* Material Grade */}
//                         <Grid size={{ xs: 12, md: 4 }}>
//                           <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//                             <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary, letterSpacing: '0.5px' }}>
//                               MATERIAL GRADE <span style={{ color: '#EF4444' }}>*</span>
//                             </Typography>
//                             <TextField
//                               fullWidth
//                               size="small"
//                               name="material_grade"
//                               value={itemFormData.material_grade}
//                               onChange={handleItemFormChange}
//                               onBlur={handleItemBlur}
//                               required
//                               disabled={itemLoading}
//                               placeholder="e.g., C11000"
//                               error={!!itemFieldErrors.material_grade}
//                               helperText={itemFieldErrors.material_grade}
//                               sx={textFieldSx}
//                             />
//                           </Box>
//                         </Grid>

//                         {/* Density */}
//                         <Grid size={{ xs: 12, md: 4 }}>
//                           <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//                             <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary, letterSpacing: '0.5px' }}>
//                               DENSITY (g/cm³) <span style={{ color: '#EF4444' }}>*</span>
//                             </Typography>
//                             <TextField
//                               fullWidth
//                               size="small"
//                               name="density"
//                               type="number"
//                               value={itemFormData.density}
//                               onChange={handleItemFormChange}
//                               onBlur={handleItemBlur}
//                               required
//                               disabled={itemLoading}
//                               placeholder="e.g., 8.96"
//                               error={!!itemFieldErrors.density}
//                               helperText={itemFieldErrors.density}
//                               inputProps={{ step: '0.01', min: 0.1, onWheel: (e) => e.target.blur() }}
//                               sx={numberFieldSx}
//                             />
//                           </Box>
//                         </Grid>

//                         {/* Procurement Type */}
//                         <Grid size={{ xs: 12, md: 4 }}>
//                           <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//                             <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary, letterSpacing: '0.5px' }}>
//                               PROCUREMENT TYPE
//                             </Typography>
//                             <FormControl fullWidth size="small">
//                               <Select
//                                 name="procurement_type"
//                                 value={itemFormData.procurement_type}
//                                 onChange={handleItemFormSelectChange}
//                                 disabled={itemLoading}
//                                 displayEmpty
//                                 sx={selectSx}
//                               >
//                                 <MenuItem value="" sx={{ fontSize: '0.75rem' }}>Select procurement type</MenuItem>
//                                 {procurementTypeOptions.map((option) => (
//                                   <MenuItem key={option} value={option} sx={{ fontSize: '0.75rem' }}>{option}</MenuItem>
//                                 ))}
//                               </Select>
//                             </FormControl>
//                             <Typography sx={{ fontSize: '0.65rem', color: COLORS.text.tertiary }}>Defaults to "Manufacture"</Typography>
//                           </Box>
//                         </Grid>

//                         {/* GST Percentage */}
//                         <Grid size={{ xs: 12, md: 4 }}>
//                           <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//                             <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary, letterSpacing: '0.5px' }}>
//                               GST PERCENTAGE (%)
//                             </Typography>
//                             <FormControl fullWidth size="small">
//                               <Select
//                                 name="gst_percentage"
//                                 value={itemFormData.gst_percentage}
//                                 onChange={handleItemFormSelectChange}
//                                 disabled={itemLoading}
//                                 displayEmpty
//                                 sx={selectSx}
//                               >
//                                 <MenuItem value="" sx={{ fontSize: '0.75rem' }}>Not specified</MenuItem>
//                                 {gstPercentageOptions.map((option) => (
//                                   <MenuItem key={option} value={option} sx={{ fontSize: '0.75rem' }}>{option}%</MenuItem>
//                                 ))}
//                               </Select>
//                             </FormControl>
//                             <Typography sx={{ fontSize: '0.65rem', color: COLORS.text.tertiary }}>Defaults to 18%</Typography>
//                           </Box>
//                         </Grid>
//                       </Grid>

//                       {itemError && (
//                         <Alert severity="error" sx={{ mt: 2, borderRadius: 1.5, fontSize: '0.75rem', py: 0.5 }}>
//                           {itemError}
//                         </Alert>
//                       )}

//                       <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
//                         <Button
//                           onClick={() => {
//                             setShowItemForm(false);
//                             setItemError('');
//                             setItemFormData({
//                               part_no: '',
//                               part_name: '',
//                               part_description: '',
//                               item_category: '',
//                               item_type: '',
//                               unit: '',
//                               sale_unit: '',
//                               hsn_code: '',
//                               gst_percentage: '',
//                               density: '',
//                               material_name: '',
//                               material_grade: '',
//                               procurement_type: ''
//                             });
//                             setItemFieldErrors({});
//                             setItemTouched({});
//                           }}
//                           disabled={itemLoading}
//                           size="small"
//                           sx={cancelButtonSx}
//                         >
//                           Cancel
//                         </Button>
//                         <Button
//                           variant="contained"
//                           onClick={saveItem}
//                           disabled={itemLoading}
//                           size="small"
//                           startIcon={<AddIcon sx={{ fontSize: '1rem' }} />}
//                           sx={addButtonSx}
//                         >
//                           {itemLoading ? 'Adding...' : 'Add Item'}
//                         </Button>
//                       </Box>
//                     </Box>
//                   </Collapse>
//                 </Grid>

//                 {selectedItem && (
//                   <>
//                     <Grid size={{ xs: 12, md: 6 }}>
//                       <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//                         <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary }}>
//                           PART NUMBER
//                         </Typography>
//                         <TextField
//                           fullWidth
//                           size="small"
//                           value={selectedItem.part_no || selectedItem.PartNo || ''}
//                           disabled
//                           sx={disabledFieldSx}
//                         />
//                       </Box>
//                     </Grid>

//                     <Grid size={{ xs: 12, md: 6 }}>
//                       <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//                         <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary }}>
//                           DESCRIPTION
//                         </Typography>
//                         <TextField
//                           fullWidth
//                           size="small"
//                           value={selectedItem.part_description || selectedItem.Description || ''}
//                           disabled
//                           sx={disabledFieldSx}
//                         />
//                       </Box>
//                     </Grid>

//                     <Grid size={{ xs: 12, md: 4 }}>
//                       <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//                         <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary }}>
//                           UNIT
//                         </Typography>
//                         <TextField
//                           fullWidth
//                           size="small"
//                           value={selectedItem.unit || selectedItem.Unit || 'Nos'}
//                           disabled
//                           sx={disabledFieldSx}
//                         />
//                       </Box>
//                     </Grid>

//                     <Grid size={{ xs: 12, md: 4 }}>
//                       <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//                         <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary }}>
//                           QUANTITY <span style={{ color: '#EF4444' }}>*</span>
//                         </Typography>
//                         <TextField
//                           fullWidth
//                           size="small"
//                           type="number"
//                           placeholder="Enter quantity"
//                           value={formData.item.required_qty}
//                           onChange={(e) => handleItemChange('required_qty', e.target.value)}
//                           error={!!fieldErrors.required_qty}
//                           helperText={fieldErrors.required_qty}
//                           inputProps={{ step: 1, min: 1 }}
//                           sx={textFieldSx}
//                         />
//                       </Box>
//                     </Grid>

//                     <Grid size={{ xs: 12, md: 4 }}>
//                       <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//                         <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary }}>
//                           ESTIMATED PRICE <span style={{ color: '#EF4444' }}>*</span>
//                         </Typography>
//                         <TextField
//                           fullWidth
//                           size="small"
//                           type="number"
//                           placeholder="Enter price"
//                           value={formData.item.estimated_price}
//                           onChange={(e) => handleItemChange('estimated_price', e.target.value)}
//                           error={!!fieldErrors.estimated_price}
//                           helperText={fieldErrors.estimated_price}
//                           InputProps={{ startAdornment: <InputAdornment position="start">₹</InputAdornment> }}
//                           sx={textFieldSx}
//                         />
//                       </Box>
//                     </Grid>

//                     <Grid size={{ xs: 12 }}>
//                       <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//                         <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary }}>
//                           REMARKS
//                         </Typography>
//                         <TextField
//                           fullWidth
//                           size="small"
//                           multiline
//                           rows={2}
//                           placeholder="Enter any remarks"
//                           value={formData.item.remarks}
//                           onChange={(e) => handleItemChange('remarks', e.target.value)}
//                           sx={textFieldSx}
//                         />
//                       </Box>
//                     </Grid>

//                     {formData.item.required_qty && formData.item.estimated_price && (
//                       <Grid size={{ xs: 12 }}>
//                         <Box sx={{
//                           p: 2,
//                           bgcolor: COLORS.background.light,
//                           borderRadius: 1.5,
//                           display: 'flex',
//                           justifyContent: 'space-between',
//                           alignItems: 'center'
//                         }}>
//                           <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color: COLORS.text.secondary }}>
//                             Total Value:
//                           </Typography>
//                           <Typography sx={{ fontSize: '1rem', fontWeight: 700, color: COLORS.primary }}>
//                             ₹{totalValue.toLocaleString()}
//                           </Typography>
//                         </Box>
//                       </Grid>
//                     )}
//                   </>
//                 )}
//               </Grid>
//             </Paper>
//           </Stack>
//         );

//       default:
//         return null;
//     }
//   };

//   // Shared styles
//   const textFieldSx = {
//     '& .MuiOutlinedInput-root': {
//       borderRadius: 1.5,
//       fontSize: '0.75rem',
//       '&:hover fieldset': { borderColor: COLORS.primary },
//       '&.Mui-focused fieldset': { borderColor: COLORS.primary, borderWidth: 1 }
//     },
//     '& .MuiInputBase-input': { py: 1, px: 1.5, fontSize: '0.75rem' },
//     '& .MuiFormHelperText-root': { fontSize: '0.65rem', marginLeft: 0 }
//   };

//   const numberFieldSx = {
//     ...textFieldSx,
//     '& input[type=number]': { MozAppearance: 'textfield' },
//     '& input[type=number]::-webkit-outer-spin-button, & input[type=number]::-webkit-inner-spin-button': {
//       WebkitAppearance: 'none', margin: 0
//     }
//   };

//   const selectSx = {
//     borderRadius: 1.5,
//     fontSize: '0.75rem',
//     '& .MuiSelect-select': { py: 1, px: 1.5, fontSize: '0.75rem' }
//   };

//   const disabledFieldSx = {
//     '& .MuiOutlinedInput-root': {
//       borderRadius: 1.5,
//       fontSize: '0.75rem',
//       backgroundColor: COLORS.background.light,
//       '& .MuiOutlinedInput-notchedOutline': { borderColor: COLORS.border }
//     },
//     '& .MuiInputBase-input': {
//       py: 1,
//       px: 1.5,
//       fontSize: '0.75rem',
//       color: COLORS.text.primary,
//       WebkitTextFillColor: COLORS.text.primary,
//     },
//     '& .MuiInputBase-input.Mui-disabled': {
//       WebkitTextFillColor: COLORS.text.primary,
//       color: COLORS.text.primary,
//       opacity: 1
//     }
//   };

//   const actionButtonSx = {
//     height: 40,
//     minWidth: 'auto',
//     px: 1.5,
//     borderRadius: 1.5,
//     border: `1px solid ${COLORS.border}`,
//     color: COLORS.text.secondary,
//     fontSize: '0.7rem',
//     fontWeight: 500,
//     textTransform: 'none',
//     whiteSpace: 'nowrap',
//     alignSelf: 'flex-end',
//     '&:hover': {
//       borderColor: COLORS.primary,
//       bgcolor: `${COLORS.primary}10`,
//       color: COLORS.primary
//     }
//   };

//   const cancelButtonSx = {
//     height: 32,
//     px: 2,
//     borderRadius: 1.5,
//     border: `1px solid ${COLORS.border}`,
//     color: COLORS.text.secondary,
//     fontSize: '0.7rem',
//     fontWeight: 500,
//     textTransform: 'none',
//     '&:hover': {
//       borderColor: COLORS.primary,
//       bgcolor: `${COLORS.primary}10`
//     }
//   };

//   const addButtonSx = {
//     height: 32,
//     px: 2,
//     borderRadius: 1.5,
//     bgcolor: COLORS.primary,
//     fontSize: '0.7rem',
//     fontWeight: 500,
//     textTransform: 'none',
//     boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
//     '&:hover': { bgcolor: COLORS.primaryDark }
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
//             Create Purchase Requisition
//           </Typography>

//           <Stepper
//             activeStep={activeStep}
//             alternativeLabel
//             connector={<ColorConnector />}
//             sx={{ mb: 0.5, mt: 0.5 }}
//           >
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
//             sx={cancelButtonSx}
//           >
//             Back
//           </Button>
//           <Box sx={{ display: 'flex', gap: 1 }}>
//             <Button
//               onClick={handleClose}
//               disabled={loading}
//               startIcon={<CloseIcon sx={{ fontSize: '1rem' }} />}
//               sx={cancelButtonSx}
//             >
//               Cancel
//             </Button>
//             {activeStep === steps.length - 1 ? (
//               <Button
//                 variant="contained"
//                 onClick={handleSubmit}
//                 disabled={loading || !formData.item.item_id || !formData.item.required_qty || !formData.item.estimated_price || !formData.required_date}
//                 startIcon={loading ? null : <AddIcon sx={{ fontSize: '1rem' }} />}
//                 sx={addButtonSx}
//               >
//                 {loading ? 'Creating...' : 'Create Requisition'}
//               </Button>
//             ) : (
//               <Button
//                 variant="contained"
//                 onClick={handleNext}
//                 disabled={loading}
//                 endIcon={<NavigateNextIcon sx={{ fontSize: '1rem' }} />}
//                 sx={addButtonSx}
//               >
//                 Next
//               </Button>
//             )}
//           </Box>
//         </DialogActions>
//       </Dialog>

//       {/* MRP Run Modal */}
//       <MrpRun
//         open={mrpRunOpen}
//         onClose={() => setMrpRunOpen(false)}
//         onRunComplete={handleMrpRunAdded}
//       />
//     </>
//   );
// };

// export default AddPurchaseRequisition;

import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Grid,
  Stepper,
  Step,
  StepLabel,
  StepConnector,
  stepConnectorClasses,
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
  Autocomplete,
  InputAdornment,
  styled,
  Chip,
  CircularProgress,
  IconButton,
  Divider,
  Collapse
} from '@mui/material';
import {
  Add as AddIcon,
  Close as CloseIcon,
  NavigateNext as NavigateNextIcon,
  NavigateBefore as NavigateBeforeIcon,
  Search as SearchIcon,
  Refresh as RefreshIcon,
  Factory as FactoryIcon
} from '@mui/icons-material';
import axios from 'axios';
import BASE_URL from '../../../config/Config';
import MrpRun from '../../bommaster/MRP/MrpRun';

const COLORS = {
  primary: '#063C3F',
  primaryLight: '#E8F0F1',
  primaryDark: '#05292B',
  text: { primary: '#151C26', secondary: '#4B5568', tertiary: '#94A3B8' },
  background: { white: '#FFFFFF', light: '#F8FFFC', hover: '#F0FDF9' },
  border: '#E3E8EF'
};

// Modern Stepper Connector
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

const steps = ['Basic Information', 'Item Details'];

const AddPurchaseRequisition = ({ open, onClose, onAdd }) => {
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [items, setItems] = useState([]);
  const [loadingItems, setLoadingItems] = useState(false);
  const [departments, setDepartments] = useState([]);
  const [loadingDepartments, setLoadingDepartments] = useState(false);
  
  // State for inline Add Department form
  const [showDepartmentForm, setShowDepartmentForm] = useState(false);
  const [departmentForm, setDepartmentForm] = useState({
    DepartmentName: "",
    Description: "",
  });
  const [departmentFieldErrors, setDepartmentFieldErrors] = useState({});
  const [departmentTouched, setDepartmentTouched] = useState({});
  const [departmentLoading, setDepartmentLoading] = useState(false);
  const [departmentError, setDepartmentError] = useState('');

  // State for inline Add Item form (Full AddItem Form)
  const [showItemForm, setShowItemForm] = useState(false);
  const [itemFormData, setItemFormData] = useState({
    // Identity
    part_no: '',
    part_name: '',
    part_description: '',
   
    // Material specs
    material_code: '',
    material_name: '',
    material_grade: '',
    material_standard: '',
    material_color: '',
    density: '',
    unit: '',
   
    // Classification
    item_category: '',
    item_type: '',
    procurement_type: '',
   
    // Dimensions
    thickness: '',
    width: '',
    length: '',
    weight_per_unit_kg: '',
   
    // Tax
    sale_unit: '',
    hsn_code: '',
    gst_percentage: '',
   
    // Inventory
    reorder_level: '',
    reorder_qty: '',
    lead_time_days: '',
    safety_stock: '',
    min_stock: '',
    max_stock: '',
    shelf_life_days: ''
  });
  const [itemFieldErrors, setItemFieldErrors] = useState({});
  const [itemTouched, setItemTouched] = useState({});
  const [itemLoading, setItemLoading] = useState(false);
  const [itemError, setItemError] = useState('');
  
  // State for HSN codes in item form
  const [hsnCodes, setHsnCodes] = useState([]);
  const [loadingHsn, setLoadingHsn] = useState(false);
  const [selectedHSN, setSelectedHSN] = useState(null);
  
  // MRP Run states
  const [mrpRuns, setMrpRuns] = useState([]);
  const [loadingMrpRuns, setLoadingMrpRuns] = useState(false);
  const [mrpRunOpen, setMrpRunOpen] = useState(false);

  const [formData, setFormData] = useState({
    pr_type: 'Material',
    source: 'Manual',
    mrp_run_id: '',
    department: '',
    required_date: '',
    item: {
      item_id: '',
      required_qty: '',
      estimated_price: '',
      remarks: ''
    }
  });

  const [fieldErrors, setFieldErrors] = useState({});

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

  // Item form options
  const itemCategoryOptions = ['Raw Material', 'Semi-Finished', 'Finished Good', 'Consumable', 'Tool', 'Bought-Out', 'Subcontract'];
  const itemTypeOptions = ['Busbar', 'Stamping', 'Gasket', 'Tooling', 'Copper Strip', 'Aluminium Profile', 'Rubber Sheet', 'Cork', 'Other'];
  const unitOptions = ['Nos', 'Kg', 'Meter', 'Set', 'Piece', 'Sheet', 'Roll'];
  const saleUnitOptions = ['Nos', 'Kg', 'Meter', 'Set', 'Piece', 'Sheet', 'Roll'];
  const procurementTypeOptions = ['Manufacture', 'Purchase', 'Subcontract', 'Free Issue'];
  const gstPercentageOptions = [0, 5, 12, 18, 28];

  useEffect(() => {
    if (open) {
      fetchItems();
      fetchDepartments();
      fetchMrpRuns();
      fetchHsnCodes();
    }
  }, [open]);

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

  const fetchMrpRuns = async () => {
    try {
      setLoadingMrpRuns(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(`${BASE_URL}/api/mrp/runs`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.data.success) {
        const completedRuns = response.data.data.filter(run => run.status === 'Completed');
        setMrpRuns(completedRuns);
      }
    } catch (err) {
      console.error('Error fetching MRP runs:', err);
    } finally {
      setLoadingMrpRuns(false);
    }
  };

  const fetchHsnCodes = async () => {
    try {
      setLoadingHsn(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(`${BASE_URL}/api/taxes`, {
        headers: { 'Authorization': `Bearer ${token}` }
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

  const handleMrpRunAdded = (newMrpRun) => {
    fetchMrpRuns();
    if (newMrpRun && newMrpRun._id) {
      setFormData(prev => ({
        ...prev,
        mrp_run_id: newMrpRun._id,
        source: 'MRP Auto'
      }));
    }
  };

  // ======================== DEPARTMENT FORM HANDLERS ========================

  const handleDepartmentFormChange = (e) => {
    const { name, value } = e.target;
    setDepartmentFieldErrors(prev => ({ ...prev, [name]: '' }));
    setDepartmentForm((prev) => ({ ...prev, [name]: value }));

    if (departmentTouched[name] || value) {
      const errorMessage = validateDepartmentField(name, value);
      setDepartmentFieldErrors(prev => ({ ...prev, [name]: errorMessage }));
    }
  };

  const handleDepartmentBlur = (e) => {
    const { name, value } = e.target;
    setDepartmentTouched(prev => ({ ...prev, [name]: true }));
    const errorMessage = validateDepartmentField(name, value);
    setDepartmentFieldErrors(prev => ({ ...prev, [name]: errorMessage }));
  };

  const validateDepartmentField = (name, value) => {
    switch (name) {
      case 'DepartmentName':
        if (!value?.trim()) return 'Department name is required';
        if (value.trim().length < 2) return 'Department name must be at least 2 characters';
        if (value.length > 100) return 'Department name should not exceed 100 characters';
        return '';
      case 'Description':
        if (value && value.length > 500) return 'Description should not exceed 500 characters';
        return '';
      default:
        return '';
    }
  };

  const validateDepartmentForm = () => {
    const errors = {};
    let isValid = true;

    if (!departmentForm.DepartmentName?.trim()) {
      errors.DepartmentName = 'Department name is required';
      isValid = false;
    } else if (departmentForm.DepartmentName.trim().length < 2) {
      errors.DepartmentName = 'Department name must be at least 2 characters';
      isValid = false;
    }

    setDepartmentFieldErrors(errors);
    if (!isValid) {
      setDepartmentError('Please fix the errors above');
    }
    return isValid;
  };

  const saveDepartment = async () => {
    if (!validateDepartmentForm()) return;

    setDepartmentLoading(true);
    setDepartmentError('');

    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `${BASE_URL}/api/departments`,
        departmentForm,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        const newDepartment = response.data.data;
        setDepartments((prev) => [...prev, newDepartment]);
        setFormData((prev) => ({ ...prev, department: newDepartment._id }));
        setDepartmentForm({ DepartmentName: "", Description: "" });
        setDepartmentFieldErrors({});
        setDepartmentTouched({});
        setDepartmentError('');
        setShowDepartmentForm(false);
      }
    } catch (err) {
      setDepartmentError(err.response?.data?.message || "Unable to add Department");
    } finally {
      setDepartmentLoading(false);
    }
  };

  // ======================== ITEM FORM HANDLERS ========================

  const handleItemFormChange = (e) => {
    const { name, value } = e.target;
    setItemFieldErrors(prev => ({ ...prev, [name]: '' }));
    setItemFormData((prev) => ({ ...prev, [name]: value }));

    if (itemTouched[name] || value) {
      const errorMessage = validateItemField(name, value);
      setItemFieldErrors(prev => ({ ...prev, [name]: errorMessage }));
    }
  };

  const handleItemFormSelectChange = (e) => {
    const { name, value } = e.target;
    setItemFieldErrors(prev => ({ ...prev, [name]: '' }));
    setItemFormData((prev) => ({ ...prev, [name]: value }));

    if (itemTouched[name] || value) {
      const errorMessage = validateItemField(name, value);
      setItemFieldErrors(prev => ({ ...prev, [name]: errorMessage }));
    }
  };

  const handleItemBlur = (e) => {
    const { name, value } = e.target;
    setItemTouched(prev => ({ ...prev, [name]: true }));
    const errorMessage = validateItemField(name, value);
    setItemFieldErrors(prev => ({ ...prev, [name]: errorMessage }));
  };

  const handleHSNChange = (event, newValue) => {
    setSelectedHSN(newValue);
    if (newValue) {
      setItemFormData(prev => ({
        ...prev,
        hsn_code: newValue.HSNCode,
        gst_percentage: newValue.GSTPercentage || ''
      }));
      setItemFieldErrors(prev => ({ ...prev, hsn_code: '' }));
    } else {
      setItemFormData(prev => ({
        ...prev,
        hsn_code: '',
        gst_percentage: ''
      }));
    }
  };

  const validateItemField = (name, value) => {
    switch (name) {
      case 'part_no':
        if (!value?.trim()) return 'Part number is required';
        if (value.length > 50) return 'Part number should not exceed 50 characters';
        return '';
      case 'part_name':
        if (!value?.trim()) return 'Part name is required';
        if (value.length > 100) return 'Part name should not exceed 100 characters';
        return '';
      case 'part_description':
        if (!value?.trim()) return 'Part description is required';
        if (value.length > 200) return 'Part description should not exceed 200 characters';
        return '';
      case 'item_category':
        if (!value) return 'Item category is required';
        return '';
      case 'unit':
        if (!value) return 'Unit is required';
        return '';
      case 'sale_unit':
        if (!value) return 'Sale unit is required';
        return '';
      case 'material_name':
        if (!value?.trim()) return 'Material name is required';
        if (value.length > 100) return 'Material name should not exceed 100 characters';
        return '';
      case 'material_grade':
        if (!value?.trim()) return 'Material grade is required';
        return '';
      case 'density':
        if (!value) return 'Density is required';
        if (isNaN(value) || parseFloat(value) <= 0) return 'Density must be a positive number';
        if (parseFloat(value) > 25) return 'Density cannot exceed 25 g/cm³';
        return '';
      case 'hsn_code':
        if (!value?.trim()) return 'HSN code is required';
        return '';
      default:
        return '';
    }
  };

  const validateItemForm = () => {
    const errors = {};
    let isValid = true;

    const requiredFields = [
      { name: 'part_no', label: 'Part number' },
      { name: 'part_name', label: 'Part name' },
      { name: 'part_description', label: 'Part description' },
      { name: 'item_category', label: 'Item category' },
      { name: 'unit', label: 'Unit' },
      { name: 'sale_unit', label: 'Sale unit' },
      { name: 'material_name', label: 'Material name' },
      { name: 'material_grade', label: 'Material grade' },
      { name: 'density', label: 'Density' },
      { name: 'hsn_code', label: 'HSN code' }
    ];

    requiredFields.forEach(field => {
      const value = itemFormData[field.name];
      if (!value || (typeof value === 'string' && !value.trim())) {
        errors[field.name] = `${field.label} is required`;
        isValid = false;
      }
    });

    // Additional validations for filled fields
    if (itemFormData.part_no) {
      const err = validateItemField('part_no', itemFormData.part_no);
      if (err) { errors.part_no = err; isValid = false; }
    }
    if (itemFormData.part_name) {
      const err = validateItemField('part_name', itemFormData.part_name);
      if (err) { errors.part_name = err; isValid = false; }
    }
    if (itemFormData.material_name) {
      const err = validateItemField('material_name', itemFormData.material_name);
      if (err) { errors.material_name = err; isValid = false; }
    }
    if (itemFormData.density) {
      const err = validateItemField('density', itemFormData.density);
      if (err) { errors.density = err; isValid = false; }
    }
    if (itemFormData.hsn_code) {
      const err = validateItemField('hsn_code', itemFormData.hsn_code);
      if (err) { errors.hsn_code = err; isValid = false; }
    }

    setItemFieldErrors(errors);
    if (!isValid) {
      setItemError('Please fix the errors above');
    }
    return isValid;
  };

  const saveItem = async () => {
    if (!validateItemForm()) return;

    setItemLoading(true);
    setItemError('');

    try {
      const token = localStorage.getItem('token');
      
      const submissionData = {
        part_no: itemFormData.part_no,
        part_name: itemFormData.part_name,
        part_description: itemFormData.part_description,
        item_category: itemFormData.item_category,
        item_type: itemFormData.item_type || 'Other',
        unit: itemFormData.unit,
        sale_unit: itemFormData.sale_unit,
        material_name: itemFormData.material_name,
        material_grade: itemFormData.material_grade,
        material_code: itemFormData.material_code || undefined,
        material_standard: itemFormData.material_standard || undefined,
        material_color: itemFormData.material_color || undefined,
        density: parseFloat(itemFormData.density),
        procurement_type: itemFormData.procurement_type || 'Manufacture',
        hsn_code: itemFormData.hsn_code,
        gst_percentage: itemFormData.gst_percentage ? parseFloat(itemFormData.gst_percentage) : 18,
        thickness: itemFormData.thickness ? parseFloat(itemFormData.thickness) : undefined,
        width: itemFormData.width ? parseFloat(itemFormData.width) : undefined,
        length: itemFormData.length ? parseFloat(itemFormData.length) : undefined,
        weight_per_unit_kg: itemFormData.weight_per_unit_kg ? parseFloat(itemFormData.weight_per_unit_kg) : undefined,
        reorder_level: itemFormData.reorder_level ? parseInt(itemFormData.reorder_level) : undefined,
        reorder_qty: itemFormData.reorder_qty ? parseInt(itemFormData.reorder_qty) : undefined,
        lead_time_days: itemFormData.lead_time_days ? parseInt(itemFormData.lead_time_days) : undefined,
        safety_stock: itemFormData.safety_stock ? parseInt(itemFormData.safety_stock) : undefined,
        min_stock: itemFormData.min_stock ? parseInt(itemFormData.min_stock) : undefined,
        max_stock: itemFormData.max_stock ? parseInt(itemFormData.max_stock) : undefined,
        shelf_life_days: itemFormData.shelf_life_days ? parseInt(itemFormData.shelf_life_days) : undefined
      };

      // Remove undefined values
      Object.keys(submissionData).forEach(key => {
        if (submissionData[key] === undefined) {
          delete submissionData[key];
        }
      });

      const response = await axios.post(`${BASE_URL}/api/items`, submissionData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.data.success) {
        const newItem = response.data.data;
        setItems((prev) => [...prev, newItem]);
        setFormData(prev => ({
          ...prev,
          item: { ...prev.item, item_id: newItem._id }
        }));
        
        // Reset item form
        setItemFormData({
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
          item_category: '',
          item_type: '',
          procurement_type: '',
          thickness: '',
          width: '',
          length: '',
          weight_per_unit_kg: '',
          sale_unit: '',
          hsn_code: '',
          gst_percentage: '',
          reorder_level: '',
          reorder_qty: '',
          lead_time_days: '',
          safety_stock: '',
          min_stock: '',
          max_stock: '',
          shelf_life_days: ''
        });
        setSelectedHSN(null);
        setItemFieldErrors({});
        setItemTouched({});
        setItemError('');
        setShowItemForm(false);
      }
    } catch (err) {
      setItemError(err.response?.data?.message || 'Failed to add item');
    } finally {
      setItemLoading(false);
    }
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

  const handleItemChange = (field, value) => {
    setFieldErrors(prev => ({ ...prev, [field]: '' }));
    setFormData(prev => ({
      ...prev,
      item: { ...prev.item, [field]: value }
    }));
  };

  const validateStep = (step) => {
    const errors = {};
    let isValid = true;

    switch (step) {
      case 0:
        if (!formData.pr_type) {
          errors.pr_type = 'PR type is required';
          isValid = false;
        }
        if (!formData.source) {
          errors.source = 'Source is required';
          isValid = false;
        }
        if (!formData.department) {
          errors.department = 'Department is required';
          isValid = false;
        }
        if (!formData.required_date) {
          errors.required_date = 'Required date is required';
          isValid = false;
        }
        break;
      case 1:
        if (!formData.item.item_id) {
          errors.item_id = 'Item is required';
          isValid = false;
        }
        if (!formData.item.required_qty) {
          errors.required_qty = 'Quantity is required';
          isValid = false;
        } else if (formData.item.required_qty <= 0) {
          errors.required_qty = 'Quantity must be greater than 0';
          isValid = false;
        }
        if (!formData.item.estimated_price) {
          errors.estimated_price = 'Estimated price is required';
          isValid = false;
        } else if (formData.item.estimated_price <= 0) {
          errors.estimated_price = 'Price must be greater than 0';
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
    if (!formData.item.item_id || !formData.item.required_qty || !formData.item.estimated_price) {
      setError('Please fill all item details');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const user = JSON.parse(localStorage.getItem('user') || '{}');

      const submissionData = {
        pr_type: formData.pr_type,
        source: formData.source,
        mrp_run_id: formData.mrp_run_id || null,
        department: formData.department,
        required_by: formData.required_date,
        items: [{
          item_id: formData.item.item_id,
          required_qty: parseFloat(formData.item.required_qty),
          estimated_price: parseFloat(formData.item.estimated_price),
          remarks: formData.item.remarks
        }],
        requested_by: user._id,
        created_by: user._id,
        status: 'Submitted'
      };

      const response = await axios.post(`${BASE_URL}/api/purchase-requisitions`, submissionData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

      if (response.data.success) {
        onAdd(response.data.data);
        resetForm();
        onClose();
      } else {
        setError(response.data.message || 'Failed to create purchase requisition');
      }
    } catch (err) {
      console.error('Error creating PR:', err);
      setError(err.response?.data?.message || 'Failed to create purchase requisition');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      pr_type: 'Material',
      source: 'Manual',
      mrp_run_id: '',
      department: '',
      required_date: '',
      item: {
        item_id: '',
        required_qty: '',
        estimated_price: '',
        remarks: ''
      }
    });
    setFieldErrors({});
    setError('');
    setActiveStep(0);
    setShowDepartmentForm(false);
    setShowItemForm(false);
    setDepartmentForm({ DepartmentName: "", Description: "" });
    setDepartmentFieldErrors({});
    setDepartmentTouched({});
    setDepartmentError('');
    setItemFormData({
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
      item_category: '',
      item_type: '',
      procurement_type: '',
      thickness: '',
      width: '',
      length: '',
      weight_per_unit_kg: '',
      sale_unit: '',
      hsn_code: '',
      gst_percentage: '',
      reorder_level: '',
      reorder_qty: '',
      lead_time_days: '',
      safety_stock: '',
      min_stock: '',
      max_stock: '',
      shelf_life_days: ''
    });
    setSelectedHSN(null);
    setItemFieldErrors({});
    setItemTouched({});
    setItemError('');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const selectedItem = items.find(i => i._id === formData.item.item_id);
  const selectedDepartment = departments.find(dept => dept._id === formData.department);
  const selectedMrpRun = mrpRuns.find(run => run._id === formData.mrp_run_id);
  const totalValue = selectedItem && formData.item.required_qty && formData.item.estimated_price
    ? parseFloat(formData.item.required_qty) * parseFloat(formData.item.estimated_price)
    : 0;
  const today = new Date().toISOString().split('T')[0];

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
                <Grid size={{ xs: 12, md: 4 }}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                    <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary }}>
                      PR TYPE <span style={{ color: '#EF4444' }}>*</span>
                    </Typography>
                    <FormControl fullWidth size="small" error={!!fieldErrors.pr_type}>
                      <Select
                        name="pr_type"
                        value={formData.pr_type}
                        onChange={handleSelectChange}
                        sx={{
                          borderRadius: 1.5,
                          fontSize: '0.75rem',
                          '& .MuiSelect-select': { py: 1, px: 1.5, fontSize: '0.75rem' },
                          '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: COLORS.primary },
                          '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: COLORS.primary, borderWidth: 1 }
                        }}
                      >
                        {prTypes.map((type) => (
                          <MenuItem key={type.value} value={type.value} sx={{ fontSize: '0.75rem' }}>
                            {type.label}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Box>
                </Grid>

                <Grid size={{ xs: 12, md: 4 }}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                    <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary }}>
                      SOURCE <span style={{ color: '#EF4444' }}>*</span>
                    </Typography>
                    <FormControl fullWidth size="small" error={!!fieldErrors.source}>
                      <Select
                        name="source"
                        value={formData.source}
                        onChange={handleSelectChange}
                        sx={{
                          borderRadius: 1.5,
                          fontSize: '0.75rem',
                          '& .MuiSelect-select': { py: 1, px: 1.5, fontSize: '0.75rem' },
                          '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: COLORS.primary },
                          '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: COLORS.primary, borderWidth: 1 }
                        }}
                      >
                        {sources.map((src) => (
                          <MenuItem key={src.value} value={src.value} sx={{ fontSize: '0.75rem' }}>
                            {src.label}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Box>
                </Grid>

                <Grid size={{ xs: 12, md: 4 }}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                    <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary }}>
                      DEPARTMENT <span style={{ color: '#EF4444' }}>*</span>
                    </Typography>

                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
                      <Box sx={{ flex: 1 }}>
                        <Autocomplete
                          options={departments}
                          loading={loadingDepartments}
                          getOptionLabel={(option) => option?.DepartmentName || ''}
                          isOptionEqualToValue={(option, value) => option?._id === value?._id}
                          value={selectedDepartment || null}
                          onChange={(event, newValue) => {
                            setFormData(prev => ({
                              ...prev,
                              department: newValue?._id || ''
                            }));
                            if (fieldErrors.department) {
                              setFieldErrors(prev => ({ ...prev, department: '' }));
                            }
                          }}
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              size="small"
                              placeholder="Select department"
                              error={!!fieldErrors.department}
                              helperText={fieldErrors.department}
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

                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => setShowDepartmentForm((prev) => !prev)}
                        startIcon={showDepartmentForm ? <CloseIcon sx={{ fontSize: '0.875rem' }} /> : <AddIcon sx={{ fontSize: '0.875rem' }} />}
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
                        {showDepartmentForm ? 'Cancel' : 'Add New'}
                      </Button>
                    </Box>
                  </Box>
                </Grid>

                {/* Inline Add Department Form */}
                <Grid size={{ xs: 12 }}>
                  <Collapse in={showDepartmentForm}>
                    <Box sx={{ mt: 1, p: 2.5, bgcolor: COLORS.background.light, borderRadius: 2, border: `1px solid ${COLORS.primary}` }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color: COLORS.primary }}>
                          Add New Department
                        </Typography>
                        <IconButton
                          size="small"
                          onClick={() => {
                            setShowDepartmentForm(false);
                            setDepartmentError('');
                            setDepartmentForm({ DepartmentName: '', Description: '' });
                            setDepartmentFieldErrors({});
                            setDepartmentTouched({});
                          }}
                          sx={{ color: COLORS.text.tertiary, '&:hover': { color: COLORS.primary } }}
                        >
                          <CloseIcon sx={{ fontSize: '1rem' }} />
                        </IconButton>
                      </Box>

                      <Grid container spacing={1.5}>
                        <Grid size={{ xs: 12, md: 6 }}>
                          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                            <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary, letterSpacing: '0.5px' }}>
                              DEPARTMENT NAME <span style={{ color: '#EF4444' }}>*</span>
                            </Typography>
                            <TextField
                              fullWidth
                              size="small"
                              name="DepartmentName"
                              value={departmentForm.DepartmentName}
                              onChange={handleDepartmentFormChange}
                              onBlur={handleDepartmentBlur}
                              required
                              disabled={departmentLoading}
                              placeholder="Enter department name"
                              error={!!departmentFieldErrors.DepartmentName}
                              helperText={departmentFieldErrors.DepartmentName}
                              inputProps={{ maxLength: 100 }}
                              sx={textFieldSx}
                            />
                            <Typography sx={{ fontSize: '0.65rem', color: COLORS.text.tertiary }}>
                              Minimum 2 characters required
                            </Typography>
                          </Box>
                        </Grid>

                        <Grid size={{ xs: 12, md: 6 }}>
                          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                            <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary, letterSpacing: '0.5px' }}>
                              DESCRIPTION
                            </Typography>
                            <TextField
                              fullWidth
                              size="small"
                              name="Description"
                              value={departmentForm.Description}
                              onChange={handleDepartmentFormChange}
                              onBlur={handleDepartmentBlur}
                              disabled={departmentLoading}
                              placeholder="Enter department description"
                              error={!!departmentFieldErrors.Description}
                              helperText={departmentFieldErrors.Description}
                              multiline
                              rows={2}
                              inputProps={{ maxLength: 500 }}
                              sx={textFieldSx}
                            />
                          </Box>
                        </Grid>
                      </Grid>

                      {departmentError && (
                        <Alert severity="error" sx={{ mt: 2, borderRadius: 1.5, fontSize: '0.75rem', py: 0.5 }}>
                          {departmentError}
                        </Alert>
                      )}

                      <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                        <Button
                          onClick={() => {
                            setShowDepartmentForm(false);
                            setDepartmentError('');
                            setDepartmentForm({ DepartmentName: '', Description: '' });
                            setDepartmentFieldErrors({});
                            setDepartmentTouched({});
                          }}
                          disabled={departmentLoading}
                          size="small"
                          sx={cancelButtonSx}
                        >
                          Cancel
                        </Button>
                        <Button
                          variant="contained"
                          onClick={saveDepartment}
                          disabled={departmentLoading || !departmentForm.DepartmentName.trim()}
                          size="small"
                          startIcon={<AddIcon sx={{ fontSize: '1rem' }} />}
                          sx={addButtonSx}
                        >
                          {departmentLoading ? 'Adding...' : 'Add Department'}
                        </Button>
                      </Box>
                    </Box>
                  </Collapse>
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                    <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary }}>
                      REQUIRED DATE <span style={{ color: '#EF4444' }}>*</span>
                    </Typography>
                    <TextField
                      fullWidth
                      size="small"
                      type="date"
                      name="required_date"
                      value={formData.required_date}
                      onChange={handleChange}
                      error={!!fieldErrors.required_date}
                      helperText={fieldErrors.required_date}
                      InputLabelProps={{ shrink: true }}
                      inputProps={{ min: today }}
                      sx={textFieldSx}
                    />
                  </Box>
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                    <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary }}>
                      MRP RUN ID
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
                      <Box sx={{ flex: 1 }}>
                        <Autocomplete
                          options={mrpRuns}
                          loading={loadingMrpRuns}
                          getOptionLabel={(option) => option?.mrp_run_id || `MRP-${option?._id?.slice(-8)}`}
                          isOptionEqualToValue={(option, value) => option?._id === value?._id}
                          value={selectedMrpRun || null}
                          onChange={(event, newValue) => {
                            setFormData(prev => ({
                              ...prev,
                              mrp_run_id: newValue?._id || '',
                              source: newValue ? 'MRP Auto' : prev.source
                            }));
                          }}
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              size="small"
                              placeholder="Select MRP run"
                              sx={textFieldSx}
                              InputProps={{
                                ...params.InputProps,
                                startAdornment: (
                                  <InputAdornment position="start">
                                    <FactoryIcon sx={{ fontSize: '1rem', color: COLORS.text.tertiary }} />
                                  </InputAdornment>
                                ),
                                endAdornment: (
                                  <>
                                    {loadingMrpRuns && <CircularProgress size={16} />}
                                    {params.InputProps.endAdornment}
                                  </>
                                ),
                              }}
                            />
                          )}
                          PaperComponent={CustomPaper}
                          noOptionsText={
                            <Box sx={{ p: 2, textAlign: 'center' }}>
                              <Typography sx={{ fontSize: '0.75rem', color: COLORS.text.secondary, mb: 1 }}>
                                No MRP runs found
                              </Typography>
                              <Button
                                size="small"
                                variant="outlined"
                                startIcon={<AddIcon />}
                                onClick={() => setMrpRunOpen(true)}
                                sx={{ fontSize: '0.7rem' }}
                              >
                                Run New MRP
                              </Button>
                            </Box>
                          }
                        />
                      </Box>

                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => setMrpRunOpen(true)}
                        startIcon={<FactoryIcon sx={{ fontSize: '0.875rem' }} />}
                        sx={actionButtonSx}
                      >
                        Run MRP
                      </Button>
                      
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={fetchMrpRuns}
                        startIcon={<RefreshIcon sx={{ fontSize: '0.875rem' }} />}
                        sx={actionButtonSx}
                      >
                        Refresh
                      </Button>
                    </Box>
                    
                    {selectedMrpRun && (
                      <Box sx={{ mt: 1, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                        <Chip size="small" label={`ID: ${selectedMrpRun.mrp_run_id}`} sx={{ fontSize: '0.65rem', height: 22 }} />
                        <Chip size="small" label={`Type: ${selectedMrpRun.run_type}`} sx={{ fontSize: '0.65rem', height: 22 }} />
                        <Chip size="small" label={`Date: ${new Date(selectedMrpRun.created_at).toLocaleDateString()}`} sx={{ fontSize: '0.65rem', height: 22 }} />
                      </Box>
                    )}
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
              <Typography variant="subtitle2" sx={{ color: COLORS.primary, mb: 1.5, fontWeight: 600, fontSize: '0.9rem' }}>
                Item Details
              </Typography>

              <Grid container spacing={2}>
                <Grid size={{ xs: 12 }}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                    <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary }}>
                      SELECT ITEM <span style={{ color: '#EF4444' }}>*</span>
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
                      <Box sx={{ flex: 1 }}>
                        <Autocomplete
                          options={items}
                          loading={loadingItems}
                          getOptionLabel={(option) => {
                            if (!option) return '';
                            const partNo = option.part_no || option.PartNo || '';
                            const desc = option.part_description || option.Description || '';
                            return `${partNo} - ${desc}`;
                          }}
                          isOptionEqualToValue={(option, value) => option?._id === value?._id}
                          value={selectedItem || null}
                          onChange={(e, val) => handleItemChange('item_id', val?._id || '')}
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              size="small"
                              placeholder="Search and select an item..."
                              error={!!fieldErrors.item_id}
                              helperText={fieldErrors.item_id}
                              sx={textFieldSx}
                            />
                          )}
                          PaperComponent={CustomPaper}
                          noOptionsText="No items found"
                        />
                      </Box>
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => setShowItemForm((prev) => !prev)}
                        startIcon={showItemForm ? <CloseIcon sx={{ fontSize: '0.875rem' }} /> : <AddIcon sx={{ fontSize: '0.875rem' }} />}
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
                        {showItemForm ? 'Cancel' : 'Add New'}
                      </Button>
                    </Box>
                  </Box>
                </Grid>

                {/* Inline Add Item Form - Full AddItem Form */}
                <Grid size={{ xs: 12 }}>
                  <Collapse in={showItemForm}>
                    <Box sx={{ mt: 1, p: 2.5, bgcolor: COLORS.background.light, borderRadius: 2, border: `1px solid ${COLORS.primary}` }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color: COLORS.primary }}>
                          Add New Item
                        </Typography>
                        <IconButton
                          size="small"
                          onClick={() => {
                            setShowItemForm(false);
                            setItemError('');
                            setItemFormData({
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
                              item_category: '',
                              item_type: '',
                              procurement_type: '',
                              thickness: '',
                              width: '',
                              length: '',
                              weight_per_unit_kg: '',
                              sale_unit: '',
                              hsn_code: '',
                              gst_percentage: '',
                              reorder_level: '',
                              reorder_qty: '',
                              lead_time_days: '',
                              safety_stock: '',
                              min_stock: '',
                              max_stock: '',
                              shelf_life_days: ''
                            });
                            setSelectedHSN(null);
                            setItemFieldErrors({});
                            setItemTouched({});
                          }}
                          sx={{ color: COLORS.text.tertiary, '&:hover': { color: COLORS.primary } }}
                        >
                          <CloseIcon sx={{ fontSize: '1rem' }} />
                        </IconButton>
                      </Box>

                      <Grid container spacing={1.5}>
                        {/* Part Number */}
                        <Grid size={{ xs: 12, md: 6 }}>
                          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                            <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary, letterSpacing: '0.5px' }}>
                              PART NUMBER <span style={{ color: '#EF4444' }}>*</span>
                            </Typography>
                            <TextField
                              fullWidth
                              size="small"
                              name="part_no"
                              value={itemFormData.part_no}
                              onChange={handleItemFormChange}
                              onBlur={handleItemBlur}
                              required
                              disabled={itemLoading}
                              placeholder="e.g., BR-001"
                              error={!!itemFieldErrors.part_no}
                              helperText={itemFieldErrors.part_no}
                              inputProps={{ maxLength: 50 }}
                              sx={textFieldSx}
                            />
                          </Box>
                        </Grid>

                        {/* Part Name */}
                        <Grid size={{ xs: 12, md: 6 }}>
                          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                            <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary, letterSpacing: '0.5px' }}>
                              PART NAME <span style={{ color: '#EF4444' }}>*</span>
                            </Typography>
                            <TextField
                              fullWidth
                              size="small"
                              name="part_name"
                              value={itemFormData.part_name}
                              onChange={handleItemFormChange}
                              onBlur={handleItemBlur}
                              required
                              disabled={itemLoading}
                              placeholder="e.g., Copper Busbar"
                              error={!!itemFieldErrors.part_name}
                              helperText={itemFieldErrors.part_name}
                              inputProps={{ maxLength: 100 }}
                              sx={textFieldSx}
                            />
                          </Box>
                        </Grid>

                        {/* Item Category */}
                        <Grid size={{ xs: 12, md: 4 }}>
                          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                            <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary, letterSpacing: '0.5px' }}>
                              ITEM CATEGORY <span style={{ color: '#EF4444' }}>*</span>
                            </Typography>
                            <FormControl fullWidth size="small" error={!!itemFieldErrors.item_category}>
                              <Select
                                name="item_category"
                                value={itemFormData.item_category}
                                onChange={handleItemFormSelectChange}
                                onBlur={handleItemBlur}
                                disabled={itemLoading}
                                displayEmpty
                                sx={selectSx}
                              >
                                <MenuItem value="" disabled sx={{ fontSize: '0.75rem' }}>Select category</MenuItem>
                                {itemCategoryOptions.map((option) => (
                                  <MenuItem key={option} value={option} sx={{ fontSize: '0.75rem' }}>{option}</MenuItem>
                                ))}
                              </Select>
                              {itemFieldErrors.item_category && (
                                <Typography sx={{ fontSize: '0.65rem', color: '#EF4444', mt: 0.25 }}>
                                  {itemFieldErrors.item_category}
                                </Typography>
                              )}
                            </FormControl>
                          </Box>
                        </Grid>

                        {/* Unit */}
                        <Grid size={{ xs: 12, md: 4 }}>
                          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                            <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary, letterSpacing: '0.5px' }}>
                              UNIT <span style={{ color: '#EF4444' }}>*</span>
                            </Typography>
                            <FormControl fullWidth size="small" error={!!itemFieldErrors.unit}>
                              <Select
                                name="unit"
                                value={itemFormData.unit}
                                onChange={handleItemFormSelectChange}
                                onBlur={handleItemBlur}
                                disabled={itemLoading}
                                displayEmpty
                                sx={selectSx}
                              >
                                <MenuItem value="" disabled sx={{ fontSize: '0.75rem' }}>Select unit</MenuItem>
                                {unitOptions.map((option) => (
                                  <MenuItem key={option} value={option} sx={{ fontSize: '0.75rem' }}>{option}</MenuItem>
                                ))}
                              </Select>
                              {itemFieldErrors.unit && (
                                <Typography sx={{ fontSize: '0.65rem', color: '#EF4444', mt: 0.25 }}>
                                  {itemFieldErrors.unit}
                                </Typography>
                              )}
                            </FormControl>
                          </Box>
                        </Grid>

                        {/* Sale Unit */}
                        <Grid size={{ xs: 12, md: 4 }}>
                          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                            <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary, letterSpacing: '0.5px' }}>
                              SALE UNIT <span style={{ color: '#EF4444' }}>*</span>
                            </Typography>
                            <FormControl fullWidth size="small" error={!!itemFieldErrors.sale_unit}>
                              <Select
                                name="sale_unit"
                                value={itemFormData.sale_unit}
                                onChange={handleItemFormSelectChange}
                                onBlur={handleItemBlur}
                                disabled={itemLoading}
                                displayEmpty
                                sx={selectSx}
                              >
                                <MenuItem value="" disabled sx={{ fontSize: '0.75rem' }}>Select sale unit</MenuItem>
                                {saleUnitOptions.map((option) => (
                                  <MenuItem key={option} value={option} sx={{ fontSize: '0.75rem' }}>{option}</MenuItem>
                                ))}
                              </Select>
                              {itemFieldErrors.sale_unit && (
                                <Typography sx={{ fontSize: '0.65rem', color: '#EF4444', mt: 0.25 }}>
                                  {itemFieldErrors.sale_unit}
                                </Typography>
                              )}
                            </FormControl>
                          </Box>
                        </Grid>

                        {/* Material Name */}
                        <Grid size={{ xs: 12, md: 4 }}>
                          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                            <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary, letterSpacing: '0.5px' }}>
                              MATERIAL NAME <span style={{ color: '#EF4444' }}>*</span>
                            </Typography>
                            <TextField
                              fullWidth
                              size="small"
                              name="material_name"
                              value={itemFormData.material_name}
                              onChange={handleItemFormChange}
                              onBlur={handleItemBlur}
                              required
                              disabled={itemLoading}
                              placeholder="e.g., Copper"
                              error={!!itemFieldErrors.material_name}
                              helperText={itemFieldErrors.material_name}
                              inputProps={{ maxLength: 100 }}
                              sx={textFieldSx}
                            />
                          </Box>
                        </Grid>

                        {/* Material Grade */}
                        <Grid size={{ xs: 12, md: 4 }}>
                          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                            <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary, letterSpacing: '0.5px' }}>
                              MATERIAL GRADE <span style={{ color: '#EF4444' }}>*</span>
                            </Typography>
                            <TextField
                              fullWidth
                              size="small"
                              name="material_grade"
                              value={itemFormData.material_grade}
                              onChange={handleItemFormChange}
                              onBlur={handleItemBlur}
                              required
                              disabled={itemLoading}
                              placeholder="e.g., C11000"
                              error={!!itemFieldErrors.material_grade}
                              helperText={itemFieldErrors.material_grade}
                              sx={textFieldSx}
                            />
                          </Box>
                        </Grid>

                        {/* Density */}
                        <Grid size={{ xs: 12, md: 4 }}>
                          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                            <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary, letterSpacing: '0.5px' }}>
                              DENSITY (g/cm³) <span style={{ color: '#EF4444' }}>*</span>
                            </Typography>
                            <TextField
                              fullWidth
                              size="small"
                              name="density"
                              type="number"
                              value={itemFormData.density}
                              onChange={handleItemFormChange}
                              onBlur={handleItemBlur}
                              required
                              disabled={itemLoading}
                              placeholder="e.g., 8.96"
                              error={!!itemFieldErrors.density}
                              helperText={itemFieldErrors.density}
                              inputProps={{ step: '0.01', min: 0.1, onWheel: (e) => e.target.blur() }}
                              sx={numberFieldSx}
                            />
                          </Box>
                        </Grid>

                        {/* HSN Code */}
                        <Grid size={{ xs: 12, md: 6 }}>
                          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                            <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary, letterSpacing: '0.5px' }}>
                              HSN CODE <span style={{ color: '#EF4444' }}>*</span>
                            </Typography>
                            <Autocomplete
                              fullWidth
                              options={hsnCodes}
                              loading={loadingHsn}
                              value={selectedHSN}
                              onChange={handleHSNChange}
                              getOptionLabel={(option) => option.HSNCode || ''}
                              isOptionEqualToValue={(option, value) => option._id === value._id}
                              renderInput={(params) => (
                                <TextField
                                  {...params}
                                  size="small"
                                  placeholder={loadingHsn ? 'Loading...' : 'Select HSN code'}
                                  error={!!itemFieldErrors.hsn_code}
                                  helperText={itemFieldErrors.hsn_code}
                                  sx={textFieldSx}
                                  InputProps={{
                                    ...params.InputProps,
                                    endAdornment: (
                                      <>
                                        {loadingHsn ? <CircularProgress color="inherit" size={16} /> : null}
                                        {params.InputProps.endAdornment}
                                      </>
                                    ),
                                  }}
                                />
                              )}
                              renderOption={(props, option) => (
                                <li {...props}>
                                  <Box>
                                    <Typography variant="body2" fontWeight={500} sx={{ fontSize: '0.75rem' }}>{option.HSNCode}</Typography>
                                    <Typography variant="caption" sx={{ fontSize: '0.7rem', color: COLORS.text.tertiary }}>
                                      {option.Description} (GST: {option.GSTPercentage}%)
                                    </Typography>
                                  </Box>
                                </li>
                              )}
                            />
                          </Box>
                        </Grid>

                        {/* GST Percentage */}
                        <Grid size={{ xs: 12, md: 6 }}>
                          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                            <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary, letterSpacing: '0.5px' }}>
                              GST PERCENTAGE (%)
                            </Typography>
                            <FormControl fullWidth size="small">
                              <Select
                                name="gst_percentage"
                                value={itemFormData.gst_percentage}
                                onChange={handleItemFormSelectChange}
                                disabled={itemLoading}
                                displayEmpty
                                sx={selectSx}
                              >
                                <MenuItem value="" sx={{ fontSize: '0.75rem' }}>Not specified</MenuItem>
                                {gstPercentageOptions.map((option) => (
                                  <MenuItem key={option} value={option} sx={{ fontSize: '0.75rem' }}>{option}%</MenuItem>
                                ))}
                              </Select>
                            </FormControl>
                            <Typography sx={{ fontSize: '0.65rem', color: COLORS.text.tertiary }}>Auto-filled from HSN, defaults to 18%</Typography>
                          </Box>
                        </Grid>

                        {/* Part Description */}
                        <Grid size={{ xs: 12 }}>
                          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                            <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary, letterSpacing: '0.5px' }}>
                              PART DESCRIPTION <span style={{ color: '#EF4444' }}>*</span>
                            </Typography>
                            <TextField
                              fullWidth
                              size="small"
                              name="part_description"
                              value={itemFormData.part_description}
                              onChange={handleItemFormChange}
                              onBlur={handleItemBlur}
                              required
                              disabled={itemLoading}
                              multiline
                              rows={2}
                              placeholder="Enter detailed part description"
                              error={!!itemFieldErrors.part_description}
                              helperText={itemFieldErrors.part_description}
                              inputProps={{ maxLength: 200 }}
                              sx={textFieldSx}
                            />
                          </Box>
                        </Grid>

                        {/* Material Code (Optional) */}
                        <Grid size={{ xs: 12, md: 4 }}>
                          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                            <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary, letterSpacing: '0.5px' }}>
                              MATERIAL CODE
                            </Typography>
                            <TextField
                              fullWidth
                              size="small"
                              name="material_code"
                              value={itemFormData.material_code}
                              onChange={handleItemFormChange}
                              disabled={itemLoading}
                              placeholder="e.g., CU-001"
                              sx={textFieldSx}
                            />
                            <Typography sx={{ fontSize: '0.65rem', color: COLORS.text.tertiary }}>Optional internal code</Typography>
                          </Box>
                        </Grid>

                        {/* Procurement Type */}
                        <Grid size={{ xs: 12, md: 4 }}>
                          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                            <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary, letterSpacing: '0.5px' }}>
                              PROCUREMENT TYPE
                            </Typography>
                            <FormControl fullWidth size="small">
                              <Select
                                name="procurement_type"
                                value={itemFormData.procurement_type}
                                onChange={handleItemFormSelectChange}
                                disabled={itemLoading}
                                displayEmpty
                                sx={selectSx}
                              >
                                <MenuItem value="" sx={{ fontSize: '0.75rem' }}>Select procurement type</MenuItem>
                                {procurementTypeOptions.map((option) => (
                                  <MenuItem key={option} value={option} sx={{ fontSize: '0.75rem' }}>{option}</MenuItem>
                                ))}
                              </Select>
                            </FormControl>
                            <Typography sx={{ fontSize: '0.65rem', color: COLORS.text.tertiary }}>Defaults to "Manufacture"</Typography>
                          </Box>
                        </Grid>

                        {/* Item Type */}
                        <Grid size={{ xs: 12, md: 4 }}>
                          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                            <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary, letterSpacing: '0.5px' }}>
                              ITEM TYPE
                            </Typography>
                            <FormControl fullWidth size="small">
                              <Select
                                name="item_type"
                                value={itemFormData.item_type}
                                onChange={handleItemFormSelectChange}
                                disabled={itemLoading}
                                displayEmpty
                                sx={selectSx}
                              >
                                <MenuItem value="" sx={{ fontSize: '0.75rem' }}>Select type</MenuItem>
                                {itemTypeOptions.map((option) => (
                                  <MenuItem key={option} value={option} sx={{ fontSize: '0.75rem' }}>{option}</MenuItem>
                                ))}
                              </Select>
                            </FormControl>
                            <Typography sx={{ fontSize: '0.65rem', color: COLORS.text.tertiary }}>Optional, defaults to "Other"</Typography>
                          </Box>
                        </Grid>

                        {/* Dimensions Section */}
                        <Grid size={{ xs: 12 }}>
                          <Divider sx={{ my: 1 }} />
                          <Typography sx={{ ...labelStyle, color: COLORS.primary, mb: 1 }}>
                            Dimensions (Optional)
                          </Typography>
                        </Grid>

                        <Grid size={{ xs: 12, md: 4 }}>
                          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                            <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary, letterSpacing: '0.5px' }}>
                              THICKNESS (mm)
                            </Typography>
                            <TextField
                              fullWidth
                              size="small"
                              name="thickness"
                              type="number"
                              value={itemFormData.thickness}
                              onChange={handleItemFormChange}
                              disabled={itemLoading}
                              placeholder="e.g., 10"
                              inputProps={{ step: '0.01', min: 0 }}
                              sx={numberFieldSx}
                            />
                          </Box>
                        </Grid>

                        <Grid size={{ xs: 12, md: 4 }}>
                          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                            <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary, letterSpacing: '0.5px' }}>
                              WIDTH (mm)
                            </Typography>
                            <TextField
                              fullWidth
                              size="small"
                              name="width"
                              type="number"
                              value={itemFormData.width}
                              onChange={handleItemFormChange}
                              disabled={itemLoading}
                              placeholder="e.g., 100"
                              inputProps={{ step: '0.01', min: 0 }}
                              sx={numberFieldSx}
                            />
                          </Box>
                        </Grid>

                        <Grid size={{ xs: 12, md: 4 }}>
                          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                            <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary, letterSpacing: '0.5px' }}>
                              LENGTH (mm)
                            </Typography>
                            <TextField
                              fullWidth
                              size="small"
                              name="length"
                              type="number"
                              value={itemFormData.length}
                              onChange={handleItemFormChange}
                              disabled={itemLoading}
                              placeholder="e.g., 1000"
                              inputProps={{ step: '0.01', min: 0 }}
                              sx={numberFieldSx}
                            />
                          </Box>
                        </Grid>

                        {/* Weight Per Unit */}
                        <Grid size={{ xs: 12, md: 4 }}>
                          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                            <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary, letterSpacing: '0.5px' }}>
                              WEIGHT PER UNIT (kg)
                            </Typography>
                            <TextField
                              fullWidth
                              size="small"
                              name="weight_per_unit_kg"
                              type="number"
                              value={itemFormData.weight_per_unit_kg}
                              onChange={handleItemFormChange}
                              disabled={itemLoading}
                              placeholder="e.g., 0.85"
                              inputProps={{ step: '0.001', min: 0 }}
                              sx={numberFieldSx}
                            />
                            <Typography sx={{ fontSize: '0.65rem', color: COLORS.text.tertiary }}>Required when sale unit is not Kg</Typography>
                          </Box>
                        </Grid>

                        {/* Inventory Section */}
                        <Grid size={{ xs: 12 }}>
                          <Divider sx={{ my: 1 }} />
                          <Typography sx={{ ...labelStyle, color: COLORS.primary, mb: 1 }}>
                            Inventory Control (Optional)
                          </Typography>
                        </Grid>

                        <Grid size={{ xs: 12, md: 4 }}>
                          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                            <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary, letterSpacing: '0.5px' }}>
                              REORDER LEVEL
                            </Typography>
                            <TextField
                              fullWidth
                              size="small"
                              name="reorder_level"
                              type="number"
                              value={itemFormData.reorder_level}
                              onChange={handleItemFormChange}
                              disabled={itemLoading}
                              placeholder="e.g., 100"
                              inputProps={{ step: 1, min: 0 }}
                              sx={numberFieldSx}
                            />
                          </Box>
                        </Grid>

                        <Grid size={{ xs: 12, md: 4 }}>
                          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                            <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary, letterSpacing: '0.5px' }}>
                              REORDER QUANTITY
                            </Typography>
                            <TextField
                              fullWidth
                              size="small"
                              name="reorder_qty"
                              type="number"
                              value={itemFormData.reorder_qty}
                              onChange={handleItemFormChange}
                              disabled={itemLoading}
                              placeholder="e.g., 500"
                              inputProps={{ step: 1, min: 0 }}
                              sx={numberFieldSx}
                            />
                          </Box>
                        </Grid>

                        <Grid size={{ xs: 12, md: 4 }}>
                          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                            <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary, letterSpacing: '0.5px' }}>
                              LEAD TIME (Days)
                            </Typography>
                            <TextField
                              fullWidth
                              size="small"
                              name="lead_time_days"
                              type="number"
                              value={itemFormData.lead_time_days}
                              onChange={handleItemFormChange}
                              disabled={itemLoading}
                              placeholder="e.g., 7"
                              inputProps={{ step: 1, min: 0 }}
                              sx={numberFieldSx}
                            />
                          </Box>
                        </Grid>

                        <Grid size={{ xs: 12, md: 4 }}>
                          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                            <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary, letterSpacing: '0.5px' }}>
                              SAFETY STOCK
                            </Typography>
                            <TextField
                              fullWidth
                              size="small"
                              name="safety_stock"
                              type="number"
                              value={itemFormData.safety_stock}
                              onChange={handleItemFormChange}
                              disabled={itemLoading}
                              placeholder="e.g., 50"
                              inputProps={{ step: 1, min: 0 }}
                              sx={numberFieldSx}
                            />
                          </Box>
                        </Grid>

                        <Grid size={{ xs: 12, md: 4 }}>
                          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                            <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary, letterSpacing: '0.5px' }}>
                              MIN STOCK
                            </Typography>
                            <TextField
                              fullWidth
                              size="small"
                              name="min_stock"
                              type="number"
                              value={itemFormData.min_stock}
                              onChange={handleItemFormChange}
                              disabled={itemLoading}
                              placeholder="e.g., 50"
                              inputProps={{ step: 1, min: 0 }}
                              sx={numberFieldSx}
                            />
                          </Box>
                        </Grid>

                        <Grid size={{ xs: 12, md: 4 }}>
                          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                            <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary, letterSpacing: '0.5px' }}>
                              MAX STOCK
                            </Typography>
                            <TextField
                              fullWidth
                              size="small"
                              name="max_stock"
                              type="number"
                              value={itemFormData.max_stock}
                              onChange={handleItemFormChange}
                              disabled={itemLoading}
                              placeholder="e.g., 2000"
                              inputProps={{ step: 1, min: 0 }}
                              sx={numberFieldSx}
                            />
                          </Box>
                        </Grid>

                        <Grid size={{ xs: 12, md: 4 }}>
                          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                            <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary, letterSpacing: '0.5px' }}>
                              SHELF LIFE (Days)
                            </Typography>
                            <TextField
                              fullWidth
                              size="small"
                              name="shelf_life_days"
                              type="number"
                              value={itemFormData.shelf_life_days}
                              onChange={handleItemFormChange}
                              disabled={itemLoading}
                              placeholder="e.g., 365"
                              inputProps={{ step: 1, min: 0 }}
                              sx={numberFieldSx}
                            />
                            <Typography sx={{ fontSize: '0.65rem', color: COLORS.text.tertiary }}>0 means no expiry</Typography>
                          </Box>
                        </Grid>
                      </Grid>

                      {itemError && (
                        <Alert severity="error" sx={{ mt: 2, borderRadius: 1.5, fontSize: '0.75rem', py: 0.5 }}>
                          {itemError}
                        </Alert>
                      )}

                      <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                        <Button
                          onClick={() => {
                            setShowItemForm(false);
                            setItemError('');
                            setItemFormData({
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
                              item_category: '',
                              item_type: '',
                              procurement_type: '',
                              thickness: '',
                              width: '',
                              length: '',
                              weight_per_unit_kg: '',
                              sale_unit: '',
                              hsn_code: '',
                              gst_percentage: '',
                              reorder_level: '',
                              reorder_qty: '',
                              lead_time_days: '',
                              safety_stock: '',
                              min_stock: '',
                              max_stock: '',
                              shelf_life_days: ''
                            });
                            setSelectedHSN(null);
                            setItemFieldErrors({});
                            setItemTouched({});
                          }}
                          disabled={itemLoading}
                          size="small"
                          sx={cancelButtonSx}
                        >
                          Cancel
                        </Button>
                        <Button
                          variant="contained"
                          onClick={saveItem}
                          disabled={itemLoading}
                          size="small"
                          startIcon={<AddIcon sx={{ fontSize: '1rem' }} />}
                          sx={addButtonSx}
                        >
                          {itemLoading ? 'Adding...' : 'Add Item'}
                        </Button>
                      </Box>
                    </Box>
                  </Collapse>
                </Grid>

                {selectedItem && (
                  <>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                        <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary }}>
                          PART NUMBER
                        </Typography>
                        <TextField
                          fullWidth
                          size="small"
                          value={selectedItem.part_no || selectedItem.PartNo || ''}
                          disabled
                          sx={disabledFieldSx}
                        />
                      </Box>
                    </Grid>

                    <Grid size={{ xs: 12, md: 6 }}>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                        <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary }}>
                          DESCRIPTION
                        </Typography>
                        <TextField
                          fullWidth
                          size="small"
                          value={selectedItem.part_description || selectedItem.Description || ''}
                          disabled
                          sx={disabledFieldSx}
                        />
                      </Box>
                    </Grid>

                    <Grid size={{ xs: 12, md: 4 }}>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                        <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary }}>
                          UNIT
                        </Typography>
                        <TextField
                          fullWidth
                          size="small"
                          value={selectedItem.unit || selectedItem.Unit || 'Nos'}
                          disabled
                          sx={disabledFieldSx}
                        />
                      </Box>
                    </Grid>

                    <Grid size={{ xs: 12, md: 4 }}>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                        <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary }}>
                          QUANTITY <span style={{ color: '#EF4444' }}>*</span>
                        </Typography>
                        <TextField
                          fullWidth
                          size="small"
                          type="number"
                          placeholder="Enter quantity"
                          value={formData.item.required_qty}
                          onChange={(e) => handleItemChange('required_qty', e.target.value)}
                          error={!!fieldErrors.required_qty}
                          helperText={fieldErrors.required_qty}
                          inputProps={{ step: 1, min: 1 }}
                          sx={textFieldSx}
                        />
                      </Box>
                    </Grid>

                    <Grid size={{ xs: 12, md: 4 }}>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                        <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary }}>
                          ESTIMATED PRICE <span style={{ color: '#EF4444' }}>*</span>
                        </Typography>
                        <TextField
                          fullWidth
                          size="small"
                          type="number"
                          placeholder="Enter price"
                          value={formData.item.estimated_price}
                          onChange={(e) => handleItemChange('estimated_price', e.target.value)}
                          error={!!fieldErrors.estimated_price}
                          helperText={fieldErrors.estimated_price}
                          InputProps={{ startAdornment: <InputAdornment position="start">₹</InputAdornment> }}
                          sx={textFieldSx}
                        />
                      </Box>
                    </Grid>

                    <Grid size={{ xs: 12 }}>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                        <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary }}>
                          REMARKS
                        </Typography>
                        <TextField
                          fullWidth
                          size="small"
                          multiline
                          rows={2}
                          placeholder="Enter any remarks"
                          value={formData.item.remarks}
                          onChange={(e) => handleItemChange('remarks', e.target.value)}
                          sx={textFieldSx}
                        />
                      </Box>
                    </Grid>

                    {formData.item.required_qty && formData.item.estimated_price && (
                      <Grid size={{ xs: 12 }}>
                        <Box sx={{
                          p: 2,
                          bgcolor: COLORS.background.light,
                          borderRadius: 1.5,
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center'
                        }}>
                          <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color: COLORS.text.secondary }}>
                            Total Value:
                          </Typography>
                          <Typography sx={{ fontSize: '1rem', fontWeight: 700, color: COLORS.primary }}>
                            ₹{totalValue.toLocaleString()}
                          </Typography>
                        </Box>
                      </Grid>
                    )}
                  </>
                )}
              </Grid>
            </Paper>
          </Stack>
        );

      default:
        return null;
    }
  };

  // Shared styles
  const labelStyle = {
    fontSize: '0.7rem',
    fontWeight: 600,
    color: COLORS.text.secondary,
    letterSpacing: '0.5px',
    mb: 0.5
  };

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

  const disabledFieldSx = {
    '& .MuiOutlinedInput-root': {
      borderRadius: 1.5,
      fontSize: '0.75rem',
      backgroundColor: COLORS.background.light,
      '& .MuiOutlinedInput-notchedOutline': { borderColor: COLORS.border }
    },
    '& .MuiInputBase-input': {
      py: 1,
      px: 1.5,
      fontSize: '0.75rem',
      color: COLORS.text.primary,
      WebkitTextFillColor: COLORS.text.primary,
    },
    '& .MuiInputBase-input.Mui-disabled': {
      WebkitTextFillColor: COLORS.text.primary,
      color: COLORS.text.primary,
      opacity: 1
    }
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
            Create Purchase Requisition
          </Typography>

          <Stepper
            activeStep={activeStep}
            alternativeLabel
            connector={<ColorConnector />}
            sx={{ mb: 0.5, mt: 0.5 }}
          >
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
                disabled={loading || !formData.item.item_id || !formData.item.required_qty || !formData.item.estimated_price || !formData.required_date}
                startIcon={loading ? null : <AddIcon sx={{ fontSize: '1rem' }} />}
                sx={addButtonSx}
              >
                {loading ? 'Creating...' : 'Create Requisition'}
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

      {/* MRP Run Modal */}
      <MrpRun
        open={mrpRunOpen}
        onClose={() => setMrpRunOpen(false)}
        onRunComplete={handleMrpRunAdded}
      />
    </>
  );
};

export default AddPurchaseRequisition;