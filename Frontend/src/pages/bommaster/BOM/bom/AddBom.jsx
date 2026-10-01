// // // AddBom.jsx
// // import React, { useState, useEffect, useCallback } from 'react';
// // import {
// //   Box,
// //   Dialog,
// //   DialogTitle,
// //   DialogContent,
// //   DialogActions,
// //   TextField,
// //   Typography,
// //   Button,
// //   Stack,
// //   Grid,
// //   Paper,
// //   IconButton,
// //   Autocomplete,
// //   Chip,
// //   FormControl,
// //   InputLabel,
// //   Select,
// //   MenuItem,
// //   Alert,
// //   CircularProgress,
// //   Stepper,
// //   Step,
// //   StepLabel,
// //   StepConnector,
// //   stepConnectorClasses,
// //   styled
// // } from '@mui/material';
// // import {
// //   Add as AddIcon,
// //   Delete as DeleteIcon,
// //   Close as CloseIcon,
// //   Inventory as InventoryIcon,
// //   ProductionQuantityLimits as ProductionIcon,
// //   DateRange as DateRangeIcon,
// //   Info as InfoIcon,
// //   NavigateNext as NavigateNextIcon,
// //   NavigateBefore as NavigateBeforeIcon
// // } from '@mui/icons-material';
// // import axios from 'axios';
// // import BASE_URL from '../../../../config/Config';
// // import AddItem from '../../../master/itemmaster/AddItem';

// // const COLORS = {
// //   primary: '#063C3F',
// //   primaryLight: '#E8F0F1',
// //   primaryDark: '#05292B',
// //   text: {
// //     primary: '#151C26',
// //     secondary: '#4B5568',
// //     tertiary: '#94A3B8',
// //     light: '#FFFFFF'
// //   },
// //   background: {
// //     white: '#FFFFFF',
// //     light: '#F8FFFC',
// //     hover: '#F0FDF9'
// //   },
// //   border: '#E3E8EF'
// // };

// // // Enums
// // const BOM_TYPE_OPTIONS = ['Manufacturing', 'Subcontract', 'Phantom', 'Variant'];
// // const STATUS_OPTIONS = ['Pending', 'Active', 'Approved', 'Cancelled', 'Archived'];
// // const UNIT_OPTIONS = ['Nos', 'Kg', 'Meter', 'Set', 'Piece', 'Sheet', 'Roll'];

// // const steps = ['Basic Information', 'Production Parameters', 'Components', 'Review & Submit'];

// // // Modern Stepper Connector
// // const ColorConnector = styled(StepConnector)(({ theme }) => ({
// //   [`&.${stepConnectorClasses.active}`]: {
// //     [`& .${stepConnectorClasses.line}`]: {
// //       backgroundColor: COLORS.primary,
// //     },
// //   },
// //   [`&.${stepConnectorClasses.completed}`]: {
// //     [`& .${stepConnectorClasses.line}`]: {
// //       backgroundColor: COLORS.primary,
// //     },
// //   },
// //   [`& .${stepConnectorClasses.line}`]: {
// //     height: 2,
// //     border: 0,
// //     backgroundColor: '#eaeaf0',
// //     borderRadius: 1,
// //   },
// // }));

// // const AddBom = ({ open, onClose, onAdd }) => {
// //   const [activeStep, setActiveStep] = useState(0);
// //   const [loading, setLoading] = useState(false);
// //   const [error, setError] = useState('');
// //   const [fieldErrors, setFieldErrors] = useState({});
  
// //   // Data from APIs
// //   const [parentItems, setParentItems] = useState([]);
// //   const [componentItems, setComponentItems] = useState([]);
// //   const [loadingItems, setLoadingItems] = useState(false);
// //   const [openAddItemModal, setOpenAddItemModal] = useState(false);
  
// //   // Form data
// //   const [formData, setFormData] = useState({
// //     parent_item_id: '',
// //     bom_version: 'v1.0',
// //     bom_type: 'Manufacturing',
// //     status: 'Pending',
// //     batch_size: 1,
// //     yield_percent: 100,
// //     setup_time_min: 30,
// //     cycle_time_min: 5.5,
// //     effective_from: new Date().toISOString().split('T')[0],
// //     effective_to: '',
// //     created_by: localStorage.getItem('userId') || ''
// //   });
  
// //   const [components, setComponents] = useState([
// //     {
// //       level: 1,
// //       component_item_id: '',
// //       component_part_no: '',
// //       component_desc: '',
// //       quantity_per: 1,
// //       unit: 'Nos',
// //       scrap_percent: 0,
// //       is_phantom: false,
// //       is_subcontract: false,
// //       subcontract_vendor: null,
// //       reference_designator: '',
// //       remarks: ''
// //     }
// //   ]);
  
// //   // Fetch parent items (item_role = 'parent')
// //   const fetchParentItems = useCallback(async () => {
// //     try {
// //       setLoadingItems(true);
// //       const token = localStorage.getItem('token');
// //       const response = await axios.get(`${BASE_URL}/api/items`, {
// //         headers: { 'Authorization': `Bearer ${token}` }
// //       });
      
// //       if (response.data.success) {
// //         const parents = response.data.data.filter(item => item.item_role === 'parent');
// //         setParentItems(parents);
// //       }
// //     } catch (err) {
// //       console.error('Error fetching parent items:', err);
// //     } finally {
// //       setLoadingItems(false);
// //     }
// //   }, []);
  
// //   // Fetch component items (item_role = 'component')
// //   const fetchComponentItems = useCallback(async () => {
// //     try {
// //       const token = localStorage.getItem('token');
// //       const response = await axios.get(`${BASE_URL}/api/items`, {
// //         headers: { 'Authorization': `Bearer ${token}` }
// //       });
      
// //       if (response.data.success) {
// //         const components = response.data.data.filter(item => item.item_role === 'component');
// //         setComponentItems(components);
// //       }
// //     } catch (err) {
// //       console.error('Error fetching component items:', err);
// //     }
// //   }, []);
  
// //   useEffect(() => {
// //     if (open) {
// //       fetchParentItems();
// //       fetchComponentItems();
// //     }
// //   }, [open, fetchParentItems, fetchComponentItems]);

// //   const handleItemAdded = (newItem) => {
// //   // Add the new item to parentItems list
// //   setParentItems(prev => [...prev, newItem]);
// //   // Auto-select the newly added item
// //   setFormData(prev => ({ ...prev, parent_item_id: newItem._id }));
// //   // Clear any error for parent_item_id
// //   setFieldErrors(prev => ({ ...prev, parent_item_id: '' }));
// // };
  
// //   const handleChange = (e) => {
// //     const { name, value } = e.target;
// //     setFormData(prev => ({
// //       ...prev,
// //       [name]: value
// //     }));
// //     setFieldErrors(prev => ({ ...prev, [name]: '' }));
// //   };
  
// // const handleComponentChange = (index, field, value) => {
// //   const updatedComponents = [...components];
// //   updatedComponents[index][field] = value;
  
// //   // Auto-fill part_no and description when component_item_id is selected
// //   if (field === 'component_item_id' && value) {
// //     const selectedItem = componentItems.find(item => item._id === value);
// //     if (selectedItem) {
// //       updatedComponents[index].component_part_no = selectedItem.part_no || '';
// //       updatedComponents[index].component_desc = selectedItem.part_description || '';
// //       updatedComponents[index].unit = selectedItem.unit || 'Nos';
      
// //       // Check for unit mismatch warning
// //       if (selectedItem.unit && updatedComponents[index].unit !== selectedItem.unit) {
// //         setError(`Warning: Component "${selectedItem.part_no}" unit mismatch. Item unit is ${selectedItem.unit}, selected ${updatedComponents[index].unit}`);
// //         // Clear error after 5 seconds
// //         setTimeout(() => setError(''), 5000);
// //       }
// //     }
// //   }
  
// //   setComponents(updatedComponents);
// //   setFieldErrors(prev => ({ ...prev, [`comp_${index}_${field}`]: '' }));
// // };
  
// //   const addComponent = () => {
// //     setComponents([
// //       ...components,
// //       {
// //         level: components.length + 1,
// //         component_item_id: '',
// //         component_part_no: '',
// //         component_desc: '',
// //         quantity_per: 1,
// //         unit: 'Nos',
// //         scrap_percent: 0,
// //         is_phantom: false,
// //         is_subcontract: false,
// //         subcontract_vendor: null,
// //         reference_designator: '',
// //         remarks: ''
// //       }
// //     ]);
// //   };
  
// //   const removeComponent = (index) => {
// //     if (components.length > 1) {
// //       const updatedComponents = components.filter((_, i) => i !== index);
// //       updatedComponents.forEach((comp, idx) => {
// //         comp.level = idx + 1;
// //       });
// //       setComponents(updatedComponents);
// //     }
// //   };
  
// //   const validateStep = (step) => {
// //     const errors = {};
// //     let isValid = true;
    
// //     switch (step) {
// //       case 0: // Basic Information
// //         if (!formData.parent_item_id) {
// //           errors.parent_item_id = 'Parent item is required';
// //           isValid = false;
// //         }
// //         if (!formData.bom_version.trim()) {
// //           errors.bom_version = 'BOM version is required';
// //           isValid = false;
// //         }
// //         if (!formData.bom_type) {
// //           errors.bom_type = 'BOM type is required';
// //           isValid = false;
// //         }
// //         if (!formData.effective_from) {
// //           errors.effective_from = 'Effective from date is required';
// //           isValid = false;
// //         }
// //         break;
        
// //       case 2: // Components
// //         components.forEach((comp, index) => {
// //           if (!comp.component_item_id) {
// //             errors[`comp_${index}_component_item_id`] = `Component ${index + 1}: Item is required`;
// //             isValid = false;
// //           }
// //           if (!comp.quantity_per || comp.quantity_per <= 0) {
// //             errors[`comp_${index}_quantity_per`] = `Component ${index + 1}: Valid quantity is required`;
// //             isValid = false;
// //           }
// //         });
// //         break;
        
// //       default:
// //         return true;
// //     }
    
// //     setFieldErrors(errors);
// //     if (!isValid) {
// //       setError('Please fix the errors in this section');
// //     }
// //     return isValid;
// //   };
  
// //   const handleNext = () => {
// //     if (validateStep(activeStep)) {
// //       setError('');
// //       setActiveStep((prevStep) => prevStep + 1);
// //     }
// //   };
  
// //   const handleBack = () => {
// //     setError('');
// //     setActiveStep((prevStep) => prevStep - 1);
// //   };
  
// // const handleSubmit = async () => {
// //   // Validate final step (components)
// //   if (!validateStep(2)) {
// //     return;
// //   }
  
// //   // Additional validation for unit consistency
// //   const unitMismatches = [];
// //   for (let i = 0; i < components.length; i++) {
// //     const comp = components[i];
// //     const selectedItem = componentItems.find(item => item._id === comp.component_item_id);
// //     if (selectedItem && selectedItem.unit && comp.unit !== selectedItem.unit) {
// //       unitMismatches.push(`Component "${comp.component_part_no || selectedItem.part_no}": Unit mismatch. Item unit is ${selectedItem.unit}, provided ${comp.unit}`);
// //     }
// //   }
  
// //   if (unitMismatches.length > 0) {
// //     setError(unitMismatches.join('\n'));
// //     setActiveStep(2);
// //     return;
// //   }
  
// //   setLoading(true);
// //   setError('');
  
// //   try {
// //     const token = localStorage.getItem('token');
    
// //     const submitData = {
// //       ...formData,
// //       batch_size: Number(formData.batch_size),
// //       yield_percent: Number(formData.yield_percent),
// //       setup_time_min: Number(formData.setup_time_min),
// //       cycle_time_min: Number(formData.cycle_time_min),
// //       components: components.map(comp => ({
// //         ...comp,
// //         level: Number(comp.level),
// //         quantity_per: Number(comp.quantity_per),
// //         scrap_percent: Number(comp.scrap_percent)
// //       }))
// //     };
    
// //     const response = await axios.post(`${BASE_URL}/api/boms`, submitData, {
// //       headers: {
// //         'Authorization': `Bearer ${token}`,
// //         'Content-Type': 'application/json'
// //       }
// //     });
    
// //     if (response.data.success) {
// //       onAdd(response.data.data);
// //       onClose();
// //       resetForm();
// //     } else {
// //       setError(response.data.message || 'Failed to add BOM');
// //     }
// //   } catch (err) {
// //     console.error('Error adding BOM:', err);
    
// //     // Extract error message from the response
// //     let errorMessage = 'Failed to add BOM. Please try again.';
    
// //     if (err.response?.data) {
// //       const data = err.response.data;
      
// //       // Check if there's an errors array (your backend response)
// //       if (data.errors && Array.isArray(data.errors) && data.errors.length > 0) {
// //         errorMessage = data.errors.join('\n');
// //       }
// //       // Check for message field
// //       else if (data.message) {
// //         errorMessage = data.message;
// //       }
// //       // Check for error field
// //       else if (data.error) {
// //         errorMessage = data.error;
// //       }
// //     } else if (err.message) {
// //       errorMessage = err.message;
// //     }
    
// //     setError(errorMessage);
// //   } finally {
// //     setLoading(false);
// //   }
// // };
  
// //   const resetForm = () => {
// //     setActiveStep(0);
// //     setFormData({
// //       parent_item_id: '',
// //       bom_version: 'v1.0',
// //       bom_type: 'Manufacturing',
// //       status: 'Pending',
// //       batch_size: 1,
// //       yield_percent: 100,
// //       setup_time_min: 30,
// //       cycle_time_min: 5.5,
// //       effective_from: new Date().toISOString().split('T')[0],
// //       effective_to: '',
// //       created_by: localStorage.getItem('userId') || ''
// //     });
// //     setComponents([
// //       {
// //         level: 1,
// //         component_item_id: '',
// //         component_part_no: '',
// //         component_desc: '',
// //         quantity_per: 1,
// //         unit: 'Nos',
// //         scrap_percent: 0,
// //         is_phantom: false,
// //         is_subcontract: false,
// //         subcontract_vendor: null,
// //         reference_designator: '',
// //         remarks: ''
// //       }
// //     ]);
// //     setFieldErrors({});
// //     setError('');
// //   };
  
// //   const handleClose = () => {
// //     resetForm();
// //     onClose();
// //   };
  
// //   const renderStepContent = (step) => {
// //     switch (step) {
// //       case 0:
// //         return (
// //           <Stack spacing={2}>
// //             <Paper sx={{ 
// //               p: 2, 
// //               bgcolor: COLORS.background.white, 
// //               borderRadius: 1.5, 
// //               border: `1px solid ${COLORS.border}`,
// //               boxShadow: 'none'
// //             }}>
// //               <Typography sx={{ 
// //                 fontSize: '0.8rem', 
// //                 fontWeight: 600, 
// //                 color: COLORS.primary, 
// //                 mb: 1.5 
// //               }}>
// //                 <InventoryIcon sx={{ fontSize: '1rem', mr: 0.5, verticalAlign: 'middle' }} />
// //                 Basic Information
// //               </Typography>
              
// //               <Grid container spacing={1.5}>
// //               <Grid size={{ xs: 12 }}>
// //   <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
// //     <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary }}>
// //       PARENT ITEM <span style={{ color: '#EF4444' }}>*</span>
// //     </Typography>
// //     <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
// //       <Box sx={{ flex: 1 }}>
// //         <Autocomplete
// //           fullWidth
// //           options={parentItems}
// //           getOptionLabel={(option) => `${option.part_no} - ${option.part_description}`}
// //           value={parentItems.find(item => item._id === formData.parent_item_id) || null}
// //           onChange={(event, newValue) => {
// //             setFormData(prev => ({ ...prev, parent_item_id: newValue?._id || '' }));
// //             setFieldErrors(prev => ({ ...prev, parent_item_id: '' }));
// //           }}
// //           loading={loadingItems}
// //           renderInput={(params) => (
// //             <TextField
// //               {...params}
// //               size="small"
// //               error={!!fieldErrors.parent_item_id}
// //               helperText={fieldErrors.parent_item_id}
// //               sx={{
// //                 '& .MuiOutlinedInput-root': {
// //                   borderRadius: 1.5,
// //                   fontSize: '0.75rem'
// //                 }
// //               }}
// //             />
// //           )}
// //         />
// //       </Box>
// //       <Button
// //         variant="outlined"
// //         size="small"
// //         onClick={() => setOpenAddItemModal(true)}
// //         startIcon={<AddIcon sx={{ fontSize: '0.875rem' }} />}
// //         sx={{
// //           height: 35,
// //           minWidth: 'auto',
// //           px: 1.5,
// //           borderRadius: 1.5,
// //           border: `1px solid ${COLORS.border}`,
// //           color: COLORS.text.secondary,
// //           fontSize: '0.7rem',
// //           fontWeight: 500,
// //           textTransform: 'none',
// //           whiteSpace: 'nowrap',
// //           '&:hover': {
// //             borderColor: COLORS.primary,
// //             bgcolor: `${COLORS.primary}10`,
// //             color: COLORS.primary
// //           }
// //         }}
// //       >
// //         Add New
// //       </Button>
// //     </Box>
// //   </Box>
// // </Grid>
                
// //                 <Grid size={{ xs: 12, sm: 6 }}>
// //                   <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
// //                     <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary }}>
// //                       BOM VERSION <span style={{ color: '#EF4444' }}>*</span>
// //                     </Typography>
// //                     <TextField
// //                       fullWidth
// //                       size="small"
// //                       name="bom_version"
// //                       value={formData.bom_version}
// //                       onChange={handleChange}
// //                       placeholder="v1.0"
// //                       error={!!fieldErrors.bom_version}
// //                       helperText={fieldErrors.bom_version}
// //                       sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5, fontSize: '0.75rem' } }}
// //                     />
// //                   </Box>
// //                 </Grid>
                
// //                 <Grid size={{ xs: 12, sm: 6 }}>
// //                   <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
// //                     <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary }}>
// //                       BOM TYPE <span style={{ color: '#EF4444' }}>*</span>
// //                     </Typography>
// //                     <FormControl fullWidth size="small" error={!!fieldErrors.bom_type}>
// //                       <Select
// //                         name="bom_type"
// //                         value={formData.bom_type}
// //                         onChange={handleChange}
// //                         sx={{ borderRadius: 1.5, fontSize: '0.75rem' }}
// //                       >
// //                         {BOM_TYPE_OPTIONS.map(option => (
// //                           <MenuItem key={option} value={option} sx={{ fontSize: '0.75rem' }}>
// //                             {option}
// //                           </MenuItem>
// //                         ))}
// //                       </Select>
// //                     </FormControl>
// //                   </Box>
// //                 </Grid>
                
// //                 {/* <Grid size={{ xs: 12, sm: 6 }}>
// //                   <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
// //                     <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary }}>
// //                       STATUS
// //                     </Typography>
// //                     <FormControl fullWidth size="small">
// //                       <Select
// //                         name="status"
// //                         value={formData.status}
// //                         onChange={handleChange}
// //                         sx={{ borderRadius: 1.5, fontSize: '0.75rem' }}
// //                       >
// //                         {STATUS_OPTIONS.map(option => (
// //                           <MenuItem key={option} value={option} sx={{ fontSize: '0.75rem' }}>
// //                             {option}
// //                           </MenuItem>
// //                         ))}
// //                       </Select>
// //                     </FormControl>
// //                   </Box>
// //                 </Grid> */}
                
// //                 <Grid size={{ xs: 12, sm: 6 }}>
// //                   <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
// //                     <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary }}>
// //                       EFFECTIVE FROM <span style={{ color: '#EF4444' }}>*</span>
// //                     </Typography>
// //                     <TextField
// //                       fullWidth
// //                       type="date"
// //                       size="small"
// //                       name="effective_from"
// //                       value={formData.effective_from}
// //                       onChange={handleChange}
// //                       error={!!fieldErrors.effective_from}
// //                       helperText={fieldErrors.effective_from}
// //                       sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5, fontSize: '0.75rem' } }}
// //                       InputLabelProps={{ shrink: true }}
// //                     />
// //                   </Box>
// //                 </Grid>
                
// //                 <Grid size={{ xs: 12, sm: 6 }}>
// //                   <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
// //                     <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary }}>
// //                       EFFECTIVE TO
// //                     </Typography>
// //                     <TextField
// //                       fullWidth
// //                       type="date"
// //                       size="small"
// //                       name="effective_to"
// //                       value={formData.effective_to}
// //                       onChange={handleChange}
// //                       sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5, fontSize: '0.75rem' } }}
// //                       InputLabelProps={{ shrink: true }}
// //                     />
// //                   </Box>
// //                 </Grid>
// //               </Grid>
// //             </Paper>
// //           </Stack>
// //         );
        
// //       case 1:
// //         return (
// //           <Stack spacing={2}>
// //             <Paper sx={{ 
// //               p: 2, 
// //               bgcolor: COLORS.background.white, 
// //               borderRadius: 1.5, 
// //               border: `1px solid ${COLORS.border}`,
// //               boxShadow: 'none'
// //             }}>
// //               <Typography sx={{ 
// //                 fontSize: '0.8rem', 
// //                 fontWeight: 600, 
// //                 color: COLORS.primary, 
// //                 mb: 1.5 
// //               }}>
// //                 <ProductionIcon sx={{ fontSize: '1rem', mr: 0.5, verticalAlign: 'middle' }} />
// //                 Production Parameters
// //               </Typography>
              
// //               <Grid container spacing={1.5}>
// //                 <Grid size={{ xs: 12, sm: 6 }}>
// //                   <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
// //                     <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary }}>
// //                       Batch Size
// //                     </Typography>
// //                     <TextField
// //                       fullWidth
// //                       type="number"
// //                       size="small"
// //                       name="batch_size"
// //                       value={formData.batch_size}
// //                       onChange={handleChange}
// //                       sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5, fontSize: '0.75rem' } }}
// //                     />
// //                   </Box>
// //                 </Grid>
                
// //                 <Grid size={{ xs: 12, sm: 6 }}>
// //                   <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
// //                     <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary }}>
// //                       Yield (%)
// //                     </Typography>
// //                     <TextField
// //                       fullWidth
// //                       type="number"
// //                       size="small"
// //                       name="yield_percent"
// //                       value={formData.yield_percent}
// //                       onChange={handleChange}
// //                       sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5, fontSize: '0.75rem' } }}
// //                     />
// //                   </Box>
// //                 </Grid>
                
// //                 <Grid size={{ xs: 12, sm: 6 }}>
// //                   <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
// //                     <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary }}>
// //                       Setup Time (min)
// //                     </Typography>
// //                     <TextField
// //                       fullWidth
// //                       type="number"
// //                       size="small"
// //                       name="setup_time_min"
// //                       value={formData.setup_time_min}
// //                       onChange={handleChange}
// //                       sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5, fontSize: '0.75rem' } }}
// //                     />
// //                   </Box>
// //                 </Grid>
                
// //                 <Grid size={{ xs: 12, sm: 6 }}>
// //                   <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
// //                     <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary }}>
// //                       Cycle Time (min)
// //                     </Typography>
// //                     <TextField
// //                       fullWidth
// //                       type="number"
// //                       size="small"
// //                       name="cycle_time_min"
// //                       value={formData.cycle_time_min}
// //                       onChange={handleChange}
// //                       sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5, fontSize: '0.75rem' } }}
// //                     />
// //                   </Box>
// //                 </Grid>
// //               </Grid>
// //             </Paper>
// //           </Stack>
// //         );
        
// //       case 2:
// //         return (
// //           <Stack spacing={2}>
// //             <Paper sx={{ 
// //               p: 2, 
// //               bgcolor: COLORS.background.white, 
// //               borderRadius: 1.5, 
// //               border: `1px solid ${COLORS.border}`,
// //               boxShadow: 'none'
// //             }}>
// //               <Typography sx={{ 
// //                 fontSize: '0.8rem', 
// //                 fontWeight: 600, 
// //                 color: COLORS.primary, 
// //                 mb: 1.5 
// //               }}>
// //                 <InventoryIcon sx={{ fontSize: '1rem', mr: 0.5, verticalAlign: 'middle' }} />
// //                 Components <span style={{ color: '#EF4444' }}>*</span>
// //               </Typography>
              
// //               {components.map((component, index) => (
// //                 <Paper
// //                   key={index}
// //                   sx={{
// //                     p: 2,
// //                     mb: 2,
// //                     bgcolor: COLORS.background.light,
// //                     borderRadius: 1.5,
// //                     border: `1px solid ${COLORS.border}`
// //                   }}
// //                 >
// //                   <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.5 }}>
// //                     <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary }}>
// //                       Component {index + 1}
// //                     </Typography>
// //                     {components.length > 1 && (
// //                       <IconButton
// //                         size="small"
// //                         onClick={() => removeComponent(index)}
// //                         sx={{ color: '#EF4444' }}
// //                       >
// //                         <DeleteIcon fontSize="small" />
// //                       </IconButton>
// //                     )}
// //                   </Stack>
                  
// //                   <Grid container spacing={1.5}>
// //                     <Grid size={{ xs: 12 }}>
// //                       <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
// //                         <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary }}>
// //                           COMPONENT ITEM <span style={{ color: '#EF4444' }}>*</span>
// //                         </Typography>
// //                         <Autocomplete
// //                           fullWidth
// //                           options={componentItems}
// //                           getOptionLabel={(option) => `${option.part_no} - ${option.part_description}`}
// //                           value={componentItems.find(item => item._id === component.component_item_id) || null}
// //                           onChange={(event, newValue) => handleComponentChange(index, 'component_item_id', newValue?._id || '')}
// //                           loading={loadingItems}
// //                           renderInput={(params) => (
// //                             <TextField
// //                               {...params}
// //                               size="small"
// //                               error={!!fieldErrors[`comp_${index}_component_item_id`]}
// //                               helperText={fieldErrors[`comp_${index}_component_item_id`]}
// //                               sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5, fontSize: '0.75rem' } }}
// //                             />
// //                           )}
// //                         />
// //                       </Box>
// //                     </Grid>
                    
// //                     <Grid size={{ xs: 6, sm: 3 }}>
// //                       <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
// //                         <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary }}>
// //                           QUANTITY PER <span style={{ color: '#EF4444' }}>*</span>
// //                         </Typography>
// //                         <TextField
// //                           fullWidth
// //                           type="number"
// //                           size="small"
// //                           value={component.quantity_per}
// //                           onChange={(e) => handleComponentChange(index, 'quantity_per', e.target.value)}
// //                           error={!!fieldErrors[`comp_${index}_quantity_per`]}
// //                           helperText={fieldErrors[`comp_${index}_quantity_per`]}
// //                           sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5, fontSize: '0.75rem' } }}
// //                         />
// //                       </Box>
// //                     </Grid>
                    
// //                     <Grid size={{ xs: 6, sm: 2 }}>
// //                       <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
// //                         <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary }}>
// //                           UNIT
// //                         </Typography>
// //                         <FormControl fullWidth size="small">
// //                           <Select
// //                             value={component.unit}
// //                             onChange={(e) => handleComponentChange(index, 'unit', e.target.value)}
// //                             sx={{ borderRadius: 1.5, fontSize: '0.75rem' }}
// //                           >
// //                             {UNIT_OPTIONS.map(option => (
// //                               <MenuItem key={option} value={option} sx={{ fontSize: '0.75rem' }}>
// //                                 {option}
// //                               </MenuItem>
// //                             ))}
// //                           </Select>
// //                         </FormControl>
// //                       </Box>
// //                     </Grid>
                    
// //                     <Grid size={{ xs: 6, sm: 2 }}>
// //                       <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
// //                         <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary }}>
// //                           SCRAP %
// //                         </Typography>
// //                         <TextField
// //                           fullWidth
// //                           type="number"
// //                           size="small"
// //                           value={component.scrap_percent}
// //                           onChange={(e) => handleComponentChange(index, 'scrap_percent', e.target.value)}
// //                           sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5, fontSize: '0.75rem' } }}
// //                         />
// //                       </Box>
// //                     </Grid>
                    
// //                     <Grid size={{ xs: 12, sm: 5 }}>
// //                       <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
// //                         <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary }}>
// //                           REFERENCE DESIGNATOR
// //                         </Typography>
// //                         <TextField
// //                           fullWidth
// //                           size="small"
// //                           value={component.reference_designator}
// //                           onChange={(e) => handleComponentChange(index, 'reference_designator', e.target.value)}
// //                           placeholder="e.g., R1, C2, U3"
// //                           sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5, fontSize: '0.75rem' } }}
// //                         />
// //                       </Box>
// //                     </Grid>
                    
// //                     <Grid size={{ xs: 12, sm: 7 }}>
// //                       <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
// //                         <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary }}>
// //                           REMARKS
// //                         </Typography>
// //                         <TextField
// //                           fullWidth
// //                           size="small"
// //                           value={component.remarks}
// //                           onChange={(e) => handleComponentChange(index, 'remarks', e.target.value)}
// //                           placeholder="Additional notes..."
// //                           sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5, fontSize: '0.75rem' } }}
// //                         />
// //                       </Box>
// //                     </Grid>
// //                   </Grid>
// //                 </Paper>
// //               ))}
              
// //               <Button
// //                 variant="outlined"
// //                 startIcon={<AddIcon sx={{ fontSize: '1rem' }} />}
// //                 onClick={addComponent}
// //                 sx={{
// //                   height: 32,
// //                   px: 2,
// //                   borderRadius: 1.5,
// //                   border: `1px solid ${COLORS.border}`,
// //                   color: COLORS.text.secondary,
// //                   fontSize: '0.7rem',
// //                   fontWeight: 500,
// //                   textTransform: 'none',
// //                   '&:hover': {
// //                     borderColor: COLORS.primary,
// //                     bgcolor: `${COLORS.primary}10`
// //                   }
// //                 }}
// //               >
// //                 Add Component
// //               </Button>
// //             </Paper>
// //           </Stack>
// //         );
        
// //       case 3:
// //         return (
// //           <Stack spacing={2}>
// //             <Paper sx={{ 
// //               p: 2, 
// //               bgcolor: COLORS.background.white, 
// //               borderRadius: 1.5, 
// //               border: `1px solid ${COLORS.border}`,
// //               boxShadow: 'none'
// //             }}>
// //               <Typography sx={{ 
// //                 fontSize: '0.8rem', 
// //                 fontWeight: 600, 
// //                 color: COLORS.primary, 
// //                 mb: 1.5 
// //               }}>
// //                 <InfoIcon sx={{ fontSize: '1rem', mr: 0.5, verticalAlign: 'middle' }} />
// //                 Review & Submit
// //               </Typography>
              
// //               <Stack spacing={2}>
// //                 {/* Basic Info Summary */}
// //                 <Paper sx={{ p: 2, bgcolor: COLORS.background.light, borderRadius: 1.5 }}>
// //                   <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: COLORS.primary, mb: 1 }}>
// //                     Basic Information
// //                   </Typography>
// //                   <Grid container spacing={1}>
// //                     <Grid size={{ xs: 6 }}>
// //                       <Typography sx={{ fontSize: '0.7rem', color: COLORS.text.secondary }}>Parent Item:</Typography>
// //                     </Grid>
// //                     <Grid size={{ xs: 6 }}>
// //                       <Typography sx={{ fontSize: '0.7rem', fontWeight: 500 }}>
// //                         {parentItems.find(item => item._id === formData.parent_item_id)?.part_no || '-'}
// //                       </Typography>
// //                     </Grid>
// //                     <Grid size={{ xs: 6 }}>
// //                       <Typography sx={{ fontSize: '0.7rem', color: COLORS.text.secondary }}>BOM Version:</Typography>
// //                     </Grid>
// //                     <Grid size={{ xs: 6 }}>
// //                       <Typography sx={{ fontSize: '0.7rem', fontWeight: 500 }}>{formData.bom_version}</Typography>
// //                     </Grid>
// //                     <Grid size={{ xs: 6 }}>
// //                       <Typography sx={{ fontSize: '0.7rem', color: COLORS.text.secondary }}>BOM Type:</Typography>
// //                     </Grid>
// //                     <Grid size={{ xs: 6 }}>
// //                       <Typography sx={{ fontSize: '0.7rem', fontWeight: 500 }}>{formData.bom_type}</Typography>
// //                     </Grid>
// //                     <Grid size={{ xs: 6 }}>
// //                       <Typography sx={{ fontSize: '0.7rem', color: COLORS.text.secondary }}>Status:</Typography>
// //                     </Grid>
// //                     <Grid size={{ xs: 6 }}>
// //                       <Typography sx={{ fontSize: '0.7rem', fontWeight: 500 }}>{formData.status}</Typography>
// //                     </Grid>
// //                     <Grid size={{ xs: 6 }}>
// //                       <Typography sx={{ fontSize: '0.7rem', color: COLORS.text.secondary }}>Effective From:</Typography>
// //                     </Grid>
// //                     <Grid size={{ xs: 6 }}>
// //                       <Typography sx={{ fontSize: '0.7rem', fontWeight: 500 }}>{formData.effective_from}</Typography>
// //                     </Grid>
// //                     {formData.effective_to && (
// //                       <>
// //                         <Grid size={{ xs: 6 }}>
// //                           <Typography sx={{ fontSize: '0.7rem', color: COLORS.text.secondary }}>Effective To:</Typography>
// //                         </Grid>
// //                         <Grid size={{ xs: 6 }}>
// //                           <Typography sx={{ fontSize: '0.7rem', fontWeight: 500 }}>{formData.effective_to}</Typography>
// //                         </Grid>
// //                       </>
// //                     )}
// //                   </Grid>
// //                 </Paper>
                
// //                 {/* Production Parameters Summary */}
// //                 <Paper sx={{ p: 2, bgcolor: COLORS.background.light, borderRadius: 1.5 }}>
// //                   <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: COLORS.primary, mb: 1 }}>
// //                     Production Parameters
// //                   </Typography>
// //                   <Grid container spacing={1}>
// //                     <Grid size={{ xs: 6 }}>
// //                       <Typography sx={{ fontSize: '0.7rem', color: COLORS.text.secondary }}>Batch Size:</Typography>
// //                     </Grid>
// //                     <Grid size={{ xs: 6 }}>
// //                       <Typography sx={{ fontSize: '0.7rem', fontWeight: 500 }}>{formData.batch_size}</Typography>
// //                     </Grid>
// //                     <Grid size={{ xs: 6 }}>
// //                       <Typography sx={{ fontSize: '0.7rem', color: COLORS.text.secondary }}>Yield:</Typography>
// //                     </Grid>
// //                     <Grid size={{ xs: 6 }}>
// //                       <Typography sx={{ fontSize: '0.7rem', fontWeight: 500 }}>{formData.yield_percent}%</Typography>
// //                     </Grid>
// //                     <Grid size={{ xs: 6 }}>
// //                       <Typography sx={{ fontSize: '0.7rem', color: COLORS.text.secondary }}>Setup Time:</Typography>
// //                     </Grid>
// //                     <Grid size={{ xs: 6 }}>
// //                       <Typography sx={{ fontSize: '0.7rem', fontWeight: 500 }}>{formData.setup_time_min} min</Typography>
// //                     </Grid>
// //                     <Grid size={{ xs: 6 }}>
// //                       <Typography sx={{ fontSize: '0.7rem', color: COLORS.text.secondary }}>Cycle Time:</Typography>
// //                     </Grid>
// //                     <Grid size={{ xs: 6 }}>
// //                       <Typography sx={{ fontSize: '0.7rem', fontWeight: 500 }}>{formData.cycle_time_min} min</Typography>
// //                     </Grid>
// //                   </Grid>
// //                 </Paper>
                
// //                 {/* Components Summary */}
// //                 <Paper sx={{ p: 2, bgcolor: COLORS.background.light, borderRadius: 1.5 }}>
// //                   <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: COLORS.primary, mb: 1 }}>
// //                     Components ({components.length})
// //                   </Typography>
// //                   {components.map((comp, idx) => (
// //                     <Box key={idx} sx={{ mb: 1, pb: 1, borderBottom: idx < components.length - 1 ? `1px solid ${COLORS.border}` : 'none' }}>
// //                       <Typography sx={{ fontSize: '0.7rem', fontWeight: 500 }}>
// //                         {comp.component_part_no || 'Not selected'}
// //                       </Typography>
// //                       <Typography sx={{ fontSize: '0.65rem', color: COLORS.text.secondary }}>
// //                         Qty: {comp.quantity_per} {comp.unit} | Scrap: {comp.scrap_percent}%
// //                       </Typography>
// //                     </Box>
// //                   ))}
// //                 </Paper>
// //               </Stack>
// //             </Paper>
// //           </Stack>
// //         );
        
// //       default:
// //         return null;
// //     }
// //   };
  
// //   return (
// //     <Dialog
// //       open={open}
// //       onClose={handleClose}
// //       maxWidth="md"
// //       fullWidth
// //       PaperProps={{
// //         sx: {
// //           borderRadius: 2,
// //           boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05)',
// //           border: `1px solid ${COLORS.border}`,
// //           overflow: 'hidden'
// //         }
// //       }}
// //     >
// //       <DialogTitle sx={{
// //         borderBottom: `1px solid ${COLORS.border}`,
// //         py: 1.5,
// //         px: 2.5,
// //         bgcolor: COLORS.background.white,
// //         display: 'flex',
// //         justifyContent: 'space-between',
// //         alignItems: 'center'
// //       }}>
// //         <Typography sx={{ fontSize: '1.2rem', fontWeight: 700, color: COLORS.text.primary }}>
// //           Add New BOM
// //         </Typography>
// //         <IconButton onClick={handleClose} size="small">
// //           <CloseIcon fontSize="small" />
// //         </IconButton>
// //       </DialogTitle>
      
// //       {/* Stepper */}
// //       <Box sx={{ px: 2.5, pt: 2, bgcolor: COLORS.background.white }}>
// //         <Stepper
// //           activeStep={activeStep}
// //           alternativeLabel
// //           connector={<ColorConnector />}
// //         >
// //           {steps.map((label) => (
// //             <Step key={label}>
// //               <StepLabel>
// //                 <Typography sx={{ fontSize: '0.75rem', fontWeight: 500, color: COLORS.text.secondary }}>
// //                   {label}
// //                 </Typography>
// //               </StepLabel>
// //             </Step>
// //           ))}
// //         </Stepper>
// //       </Box>
      
// //       <DialogContent sx={{ p: 2.5, bgcolor: COLORS.background.white }}>
// //         {renderStepContent(activeStep)}
        
// //         {error && (
// //           <Alert 
// //             severity="error" 
// //             sx={{ 
// //               mt: 2, 
// //               borderRadius: 1.5,
// //               fontSize: '0.75rem',
// //               py: 0.5
// //             }}
// //           >
// //                <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.75rem' }}>
// //       Validation Error
// //     </Typography>
// //     <Typography variant="body2" sx={{ fontSize: '0.7rem', whiteSpace: 'pre-wrap' }}>
// //       {error}
// //     </Typography>
// //           </Alert>
// //         )}
// //       </DialogContent>
      
// //       <DialogActions sx={{
// //         px: 2.5,
// //         py: 1.5,
// //         borderTop: `1px solid ${COLORS.border}`,
// //         bgcolor: COLORS.background.white,
// //         justifyContent: 'space-between'
// //       }}>
// //         <Button
// //           onClick={handleBack}
// //           disabled={activeStep === 0 || loading}
// //           size="small"
// //           startIcon={<NavigateBeforeIcon sx={{ fontSize: '1rem' }} />}
// //           sx={{
// //             height: 32,
// //             px: 2,
// //             borderRadius: 1.5,
// //             border: `1px solid ${COLORS.border}`,
// //             color: COLORS.text.secondary,
// //             fontSize: '0.7rem',
// //             fontWeight: 500,
// //             textTransform: 'none',
// //             '&:hover': {
// //               borderColor: COLORS.primary,
// //               bgcolor: `${COLORS.primary}10`
// //             }
// //           }}
// //         >
// //           Back
// //         </Button>
// //         <Box>
// //           <Button
// //             onClick={handleClose}
// //             disabled={loading}
// //             size="small"
// //             sx={{
// //               height: 32,
// //               px: 2,
// //               mr: 1,
// //               borderRadius: 1.5,
// //               border: `1px solid ${COLORS.border}`,
// //               color: COLORS.text.secondary,
// //               fontSize: '0.7rem',
// //               fontWeight: 500,
// //               textTransform: 'none',
// //               '&:hover': {
// //                 borderColor: COLORS.primary,
// //                 bgcolor: `${COLORS.primary}10`
// //               }
// //             }}
// //           >
// //             Cancel
// //           </Button>
// //           {activeStep === steps.length - 1 ? (
// //             <Button
// //               variant="contained"
// //               onClick={handleSubmit}
// //               disabled={loading}
// //               size="small"
// //               startIcon={<AddIcon sx={{ fontSize: '1rem' }} />}
// //               sx={{
// //                 height: 32,
// //                 px: 2,
// //                 borderRadius: 1.5,
// //                 bgcolor: COLORS.primary,
// //                 fontSize: '0.7rem',
// //                 fontWeight: 500,
// //                 textTransform: 'none',
// //                 '&:hover': { bgcolor: COLORS.primaryDark }
// //               }}
// //             >
// //               {loading ? 'Adding...' : 'Add BOM'}
// //             </Button>
// //           ) : (
// //             <Button
// //               variant="contained"
// //               onClick={handleNext}
// //               disabled={loading}
// //               size="small"
// //               endIcon={<NavigateNextIcon sx={{ fontSize: '1rem' }} />}
// //               sx={{
// //                 height: 32,
// //                 px: 2,
// //                 borderRadius: 1.5,
// //                 bgcolor: COLORS.primary,
// //                 fontSize: '0.7rem',
// //                 fontWeight: 500,
// //                 textTransform: 'none',
// //                 '&:hover': { bgcolor: COLORS.primaryDark }
// //               }}
// //             >
// //               Next
// //             </Button>
// //           )}
// //         </Box>
// //       </DialogActions>
// //       {/* Add Item Modal */}
// // <AddItem
// //   open={openAddItemModal}
// //   onClose={() => setOpenAddItemModal(false)}
// //   onAdd={handleItemAdded}
// // />
// //     </Dialog>
// //   );
// // };

// // export default AddBom;




// // // AddBom.jsx
// // import React, { useState, useEffect, useCallback } from 'react';
// // import {
// //   Box,
// //   Dialog,
// //   DialogTitle,
// //   DialogContent,
// //   DialogActions,
// //   TextField,
// //   Typography,
// //   Button,
// //   Stack,
// //   Grid,
// //   Paper,
// //   IconButton,
// //   Autocomplete,
// //   Chip,
// //   FormControl,
// //   InputLabel,
// //   Select,
// //   MenuItem,
// //   Alert,
// //   CircularProgress,
// //   Stepper,
// //   Step,
// //   StepLabel,
// //   StepConnector,
// //   stepConnectorClasses,
// //   styled
// // } from '@mui/material';
// // import {
// //   Add as AddIcon,
// //   Delete as DeleteIcon,
// //   Close as CloseIcon,
// //   Inventory as InventoryIcon,
// //   ProductionQuantityLimits as ProductionIcon,
// //   DateRange as DateRangeIcon,
// //   Info as InfoIcon,
// //   NavigateNext as NavigateNextIcon,
// //   NavigateBefore as NavigateBeforeIcon
// // } from '@mui/icons-material';
// // import axios from 'axios';
// // import BASE_URL from '../../../../config/Config';
// // import AddItem from '../../../master/itemmaster/AddItem';

// // const COLORS = {
// //   primary: '#063C3F',
// //   primaryLight: '#E8F0F1',
// //   primaryDark: '#05292B',
// //   text: {
// //     primary: '#151C26',
// //     secondary: '#4B5568',
// //     tertiary: '#94A3B8',
// //     light: '#FFFFFF'
// //   },
// //   background: {
// //     white: '#FFFFFF',
// //     light: '#F8FFFC',
// //     hover: '#F0FDF9'
// //   },
// //   border: '#E3E8EF'
// // };

// // // Enums
// // const BOM_TYPE_OPTIONS = ['Manufacturing', 'Subcontract', 'Phantom', 'Variant'];
// // const STATUS_OPTIONS = ['Pending', 'Active', 'Approved', 'Cancelled', 'Archived'];
// // const UNIT_OPTIONS = ['Nos', 'Kg', 'Meter', 'Set', 'Piece', 'Sheet', 'Roll'];

// // const steps = ['Basic Information', 'Production Parameters', 'Components', 'Review & Submit'];

// // // Modern Stepper Connector
// // const ColorConnector = styled(StepConnector)(({ theme }) => ({
// //   [`&.${stepConnectorClasses.active}`]: {
// //     [`& .${stepConnectorClasses.line}`]: {
// //       backgroundColor: COLORS.primary,
// //     },
// //   },
// //   [`&.${stepConnectorClasses.completed}`]: {
// //     [`& .${stepConnectorClasses.line}`]: {
// //       backgroundColor: COLORS.primary,
// //     },
// //   },
// //   [`& .${stepConnectorClasses.line}`]: {
// //     height: 2,
// //     border: 0,
// //     backgroundColor: '#eaeaf0',
// //     borderRadius: 1,
// //   },
// // }));

// // const AddBom = ({ open, onClose, onAdd }) => {
// //   const [activeStep, setActiveStep] = useState(0);
// //   const [loading, setLoading] = useState(false);
// //   const [error, setError] = useState('');
// //   const [fieldErrors, setFieldErrors] = useState({});
  
// //   // Data from APIs
// //   const [parentItems, setParentItems] = useState([]);
// //   const [componentItems, setComponentItems] = useState([]);
// //   const [loadingItems, setLoadingItems] = useState(false);
// //   const [openAddItemModal, setOpenAddItemModal] = useState(false);
  
// //   // Form data
// //   const [formData, setFormData] = useState({
// //     parent_item_id: '',
// //     bom_version: 'v1.0',
// //     bom_type: 'Manufacturing',
// //     status: 'Pending',
// //     batch_size: 1,
// //     yield_percent: 100,
// //     setup_time_min: 30,
// //     cycle_time_min: 5.5,
// //     effective_from: new Date().toISOString().split('T')[0],
// //     effective_to: '',
// //     created_by: localStorage.getItem('userId') || ''
// //   });
  
// //   const [components, setComponents] = useState([
// //     {
// //       level: 1,
// //       component_item_id: '',
// //       component_part_no: '',
// //       component_desc: '',
// //       quantity_per: 1,
// //       unit: 'Nos',
// //       scrap_percent: 0,
// //       is_phantom: false,
// //       is_subcontract: false,
// //       subcontract_vendor: null,
// //       reference_designator: '',
// //       remarks: ''
// //     }
// //   ]);
  
// //   // Fetch parent items (item_role = 'parent')
// //   const fetchParentItems = useCallback(async () => {
// //     try {
// //       setLoadingItems(true);
// //       const token = localStorage.getItem('token');
// //       const response = await axios.get(`${BASE_URL}/api/items`, {
// //         headers: { 'Authorization': `Bearer ${token}` }
// //       });
      
// //       if (response.data.success) {
// //         const parents = response.data.data.filter(item => item.item_role === 'parent');
// //         setParentItems(parents);
// //       }
// //     } catch (err) {
// //       console.error('Error fetching parent items:', err);
// //     } finally {
// //       setLoadingItems(false);
// //     }
// //   }, []);
  
// //   // Fetch component items (item_role = 'component')
// //   const fetchComponentItems = useCallback(async () => {
// //     try {
// //       const token = localStorage.getItem('token');
// //       const response = await axios.get(`${BASE_URL}/api/items`, {
// //         headers: { 'Authorization': `Bearer ${token}` }
// //       });
      
// //       if (response.data.success) {
// //         const components = response.data.data.filter(item => item.item_role === 'component');
// //         setComponentItems(components);
// //       }
// //     } catch (err) {
// //       console.error('Error fetching component items:', err);
// //     }
// //   }, []);
  
// //   useEffect(() => {
// //     if (open) {
// //       fetchParentItems();
// //       fetchComponentItems();
// //     }
// //   }, [open, fetchParentItems, fetchComponentItems]);

// //   const handleItemAdded = (newItem) => {
// //   // Add the new item to parentItems list
// //   setParentItems(prev => [...prev, newItem]);
// //   // Auto-select the newly added item
// //   setFormData(prev => ({ ...prev, parent_item_id: newItem._id }));
// //   // Clear any error for parent_item_id
// //   setFieldErrors(prev => ({ ...prev, parent_item_id: '' }));
// // };
  
// //   const handleChange = (e) => {
// //     const { name, value } = e.target;
// //     setFormData(prev => ({
// //       ...prev,
// //       [name]: value
// //     }));
// //     setFieldErrors(prev => ({ ...prev, [name]: '' }));
// //   };
  
// // const handleComponentChange = (index, field, value) => {
// //   const updatedComponents = [...components];
// //   updatedComponents[index][field] = value;
  
// //   // Auto-fill part_no and description when component_item_id is selected
// //   if (field === 'component_item_id' && value) {
// //     const selectedItem = componentItems.find(item => item._id === value);
// //     if (selectedItem) {
// //       updatedComponents[index].component_part_no = selectedItem.part_no || '';
// //       updatedComponents[index].component_desc = selectedItem.part_description || '';
// //       updatedComponents[index].unit = selectedItem.unit || 'Nos';
      
// //       // Check for unit mismatch warning
// //       if (selectedItem.unit && updatedComponents[index].unit !== selectedItem.unit) {
// //         setError(`Warning: Component "${selectedItem.part_no}" unit mismatch. Item unit is ${selectedItem.unit}, selected ${updatedComponents[index].unit}`);
// //         // Clear error after 5 seconds
// //         setTimeout(() => setError(''), 5000);
// //       }
// //     }
// //   }
  
// //   setComponents(updatedComponents);
// //   setFieldErrors(prev => ({ ...prev, [`comp_${index}_${field}`]: '' }));
// // };
  
// //   const addComponent = () => {
// //     setComponents([
// //       ...components,
// //       {
// //         level: components.length + 1,
// //         component_item_id: '',
// //         component_part_no: '',
// //         component_desc: '',
// //         quantity_per: 1,
// //         unit: 'Nos',
// //         scrap_percent: 0,
// //         is_phantom: false,
// //         is_subcontract: false,
// //         subcontract_vendor: null,
// //         reference_designator: '',
// //         remarks: ''
// //       }
// //     ]);
// //   };
  
// //   const removeComponent = (index) => {
// //     if (components.length > 1) {
// //       const updatedComponents = components.filter((_, i) => i !== index);
// //       updatedComponents.forEach((comp, idx) => {
// //         comp.level = idx + 1;
// //       });
// //       setComponents(updatedComponents);
// //     }
// //   };
  
// //   const validateStep = (step) => {
// //     const errors = {};
// //     let isValid = true;
    
// //     switch (step) {
// //       case 0: // Basic Information
// //         if (!formData.parent_item_id) {
// //           errors.parent_item_id = 'Parent item is required';
// //           isValid = false;
// //         }
// //         if (!formData.bom_version.trim()) {
// //           errors.bom_version = 'BOM version is required';
// //           isValid = false;
// //         }
// //         if (!formData.bom_type) {
// //           errors.bom_type = 'BOM type is required';
// //           isValid = false;
// //         }
// //         if (!formData.effective_from) {
// //           errors.effective_from = 'Effective from date is required';
// //           isValid = false;
// //         }
// //         break;
        
// //       case 2: // Components
// //         components.forEach((comp, index) => {
// //           if (!comp.component_item_id) {
// //             errors[`comp_${index}_component_item_id`] = `Component ${index + 1}: Item is required`;
// //             isValid = false;
// //           }
// //           if (!comp.quantity_per || comp.quantity_per <= 0) {
// //             errors[`comp_${index}_quantity_per`] = `Component ${index + 1}: Valid quantity is required`;
// //             isValid = false;
// //           }
// //         });
// //         break;
        
// //       default:
// //         return true;
// //     }
    
// //     setFieldErrors(errors);
// //     if (!isValid) {
// //       setError('Please fix the errors in this section');
// //     }
// //     return isValid;
// //   };
  
// //   const handleNext = () => {
// //     if (validateStep(activeStep)) {
// //       setError('');
// //       setActiveStep((prevStep) => prevStep + 1);
// //     }
// //   };
  
// //   const handleBack = () => {
// //     setError('');
// //     setActiveStep((prevStep) => prevStep - 1);
// //   };
  
// // const handleSubmit = async () => {
// //   // Validate final step (components)
// //   if (!validateStep(2)) {
// //     return;
// //   }
  
// //   // Additional validation for unit consistency
// //   const unitMismatches = [];
// //   for (let i = 0; i < components.length; i++) {
// //     const comp = components[i];
// //     const selectedItem = componentItems.find(item => item._id === comp.component_item_id);
// //     if (selectedItem && selectedItem.unit && comp.unit !== selectedItem.unit) {
// //       unitMismatches.push(`Component "${comp.component_part_no || selectedItem.part_no}": Unit mismatch. Item unit is ${selectedItem.unit}, provided ${comp.unit}`);
// //     }
// //   }
  
// //   if (unitMismatches.length > 0) {
// //     setError(unitMismatches.join('\n'));
// //     setActiveStep(2);
// //     return;
// //   }
  
// //   setLoading(true);
// //   setError('');
  
// //   try {
// //     const token = localStorage.getItem('token');
    
// //     const submitData = {
// //       ...formData,
// //       batch_size: Number(formData.batch_size),
// //       yield_percent: Number(formData.yield_percent),
// //       setup_time_min: Number(formData.setup_time_min),
// //       cycle_time_min: Number(formData.cycle_time_min),
// //       components: components.map(comp => ({
// //         ...comp,
// //         level: Number(comp.level),
// //         quantity_per: Number(comp.quantity_per),
// //         scrap_percent: Number(comp.scrap_percent)
// //       }))
// //     };
    
// //     const response = await axios.post(`${BASE_URL}/api/boms`, submitData, {
// //       headers: {
// //         'Authorization': `Bearer ${token}`,
// //         'Content-Type': 'application/json'
// //       }
// //     });
    
// //     if (response.data.success) {
// //       onAdd(response.data.data);
// //       onClose();
// //       resetForm();
// //     } else {
// //       setError(response.data.message || 'Failed to add BOM');
// //     }
// //   } catch (err) {
// //     console.error('Error adding BOM:', err);
    
// //     // Extract error message from the response
// //     let errorMessage = 'Failed to add BOM. Please try again.';
    
// //     if (err.response?.data) {
// //       const data = err.response.data;
      
// //       // Check if there's an errors array (your backend response)
// //       if (data.errors && Array.isArray(data.errors) && data.errors.length > 0) {
// //         errorMessage = data.errors.join('\n');
// //       }
// //       // Check for message field
// //       else if (data.message) {
// //         errorMessage = data.message;
// //       }
// //       // Check for error field
// //       else if (data.error) {
// //         errorMessage = data.error;
// //       }
// //     } else if (err.message) {
// //       errorMessage = err.message;
// //     }
    
// //     setError(errorMessage);
// //   } finally {
// //     setLoading(false);
// //   }
// // };
  
// //   const resetForm = () => {
// //     setActiveStep(0);
// //     setFormData({
// //       parent_item_id: '',
// //       bom_version: 'v1.0',
// //       bom_type: 'Manufacturing',
// //       status: 'Pending',
// //       batch_size: 1,
// //       yield_percent: 100,
// //       setup_time_min: 30,
// //       cycle_time_min: 5.5,
// //       effective_from: new Date().toISOString().split('T')[0],
// //       effective_to: '',
// //       created_by: localStorage.getItem('userId') || ''
// //     });
// //     setComponents([
// //       {
// //         level: 1,
// //         component_item_id: '',
// //         component_part_no: '',
// //         component_desc: '',
// //         quantity_per: 1,
// //         unit: 'Nos',
// //         scrap_percent: 0,
// //         is_phantom: false,
// //         is_subcontract: false,
// //         subcontract_vendor: null,
// //         reference_designator: '',
// //         remarks: ''
// //       }
// //     ]);
// //     setFieldErrors({});
// //     setError('');
// //   };
  
// //   const handleClose = () => {
// //     resetForm();
// //     onClose();
// //   };
  
// //   const renderStepContent = (step) => {
// //     switch (step) {
// //       case 0:
// //         return (
// //           <Stack spacing={2}>
// //             <Paper sx={{ 
// //               p: 2, 
// //               bgcolor: COLORS.background.white, 
// //               borderRadius: 1.5, 
// //               border: `1px solid ${COLORS.border}`,
// //               boxShadow: 'none'
// //             }}>
// //               <Typography sx={{ 
// //                 fontSize: '0.8rem', 
// //                 fontWeight: 600, 
// //                 color: COLORS.primary, 
// //                 mb: 1.5 
// //               }}>
// //                 <InventoryIcon sx={{ fontSize: '1rem', mr: 0.5, verticalAlign: 'middle' }} />
// //                 Basic Information
// //               </Typography>
              
// //               <Grid container spacing={1.5}>
// //               <Grid size={{ xs: 12 }}>
// //   <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
// //     <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary }}>
// //       PARENT ITEM <span style={{ color: '#EF4444' }}>*</span>
// //     </Typography>
// //     <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
// //       <Box sx={{ flex: 1 }}>
// //         <Autocomplete
// //           fullWidth
// //           options={parentItems}
// //           getOptionLabel={(option) => `${option.part_no} - ${option.part_description}`}
// //           value={parentItems.find(item => item._id === formData.parent_item_id) || null}
// //           onChange={(event, newValue) => {
// //             setFormData(prev => ({ ...prev, parent_item_id: newValue?._id || '' }));
// //             setFieldErrors(prev => ({ ...prev, parent_item_id: '' }));
// //           }}
// //           loading={loadingItems}
// //           renderInput={(params) => (
// //             <TextField
// //               {...params}
// //               size="small"
// //               error={!!fieldErrors.parent_item_id}
// //               helperText={fieldErrors.parent_item_id}
// //               sx={{
// //                 '& .MuiOutlinedInput-root': {
// //                   borderRadius: 1.5,
// //                   fontSize: '0.75rem'
// //                 }
// //               }}
// //             />
// //           )}
// //         />
// //       </Box>
// //       <Button
// //         variant="outlined"
// //         size="small"
// //         onClick={() => setOpenAddItemModal(true)}
// //         startIcon={<AddIcon sx={{ fontSize: '0.875rem' }} />}
// //         sx={{
// //           height: 35,
// //           minWidth: 'auto',
// //           px: 1.5,
// //           borderRadius: 1.5,
// //           border: `1px solid ${COLORS.border}`,
// //           color: COLORS.text.secondary,
// //           fontSize: '0.7rem',
// //           fontWeight: 500,
// //           textTransform: 'none',
// //           whiteSpace: 'nowrap',
// //           '&:hover': {
// //             borderColor: COLORS.primary,
// //             bgcolor: `${COLORS.primary}10`,
// //             color: COLORS.primary
// //           }
// //         }}
// //       >
// //         Add New
// //       </Button>
// //     </Box>
// //   </Box>
// // </Grid>
                
// //                 <Grid size={{ xs: 12, sm: 6 }}>
// //                   <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
// //                     <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary }}>
// //                       BOM VERSION <span style={{ color: '#EF4444' }}>*</span>
// //                     </Typography>
// //                     <TextField
// //                       fullWidth
// //                       size="small"
// //                       name="bom_version"
// //                       value={formData.bom_version}
// //                       onChange={handleChange}
// //                       placeholder="v1.0"
// //                       error={!!fieldErrors.bom_version}
// //                       helperText={fieldErrors.bom_version}
// //                       sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5, fontSize: '0.75rem' } }}
// //                     />
// //                   </Box>
// //                 </Grid>
                
// //                 <Grid size={{ xs: 12, sm: 6 }}>
// //                   <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
// //                     <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary }}>
// //                       BOM TYPE <span style={{ color: '#EF4444' }}>*</span>
// //                     </Typography>
// //                     <FormControl fullWidth size="small" error={!!fieldErrors.bom_type}>
// //                       <Select
// //                         name="bom_type"
// //                         value={formData.bom_type}
// //                         onChange={handleChange}
// //                         sx={{ borderRadius: 1.5, fontSize: '0.75rem' }}
// //                       >
// //                         {BOM_TYPE_OPTIONS.map(option => (
// //                           <MenuItem key={option} value={option} sx={{ fontSize: '0.75rem' }}>
// //                             {option}
// //                           </MenuItem>
// //                         ))}
// //                       </Select>
// //                     </FormControl>
// //                   </Box>
// //                 </Grid>
                
// //                 {/* <Grid size={{ xs: 12, sm: 6 }}>
// //                   <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
// //                     <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary }}>
// //                       STATUS
// //                     </Typography>
// //                     <FormControl fullWidth size="small">
// //                       <Select
// //                         name="status"
// //                         value={formData.status}
// //                         onChange={handleChange}
// //                         sx={{ borderRadius: 1.5, fontSize: '0.75rem' }}
// //                       >
// //                         {STATUS_OPTIONS.map(option => (
// //                           <MenuItem key={option} value={option} sx={{ fontSize: '0.75rem' }}>
// //                             {option}
// //                           </MenuItem>
// //                         ))}
// //                       </Select>
// //                     </FormControl>
// //                   </Box>
// //                 </Grid> */}
                
// //                 <Grid size={{ xs: 12, sm: 6 }}>
// //                   <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
// //                     <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary }}>
// //                       EFFECTIVE FROM <span style={{ color: '#EF4444' }}>*</span>
// //                     </Typography>
// //                     <TextField
// //                       fullWidth
// //                       type="date"
// //                       size="small"
// //                       name="effective_from"
// //                       value={formData.effective_from}
// //                       onChange={handleChange}
// //                       error={!!fieldErrors.effective_from}
// //                       helperText={fieldErrors.effective_from}
// //                       sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5, fontSize: '0.75rem' } }}
// //                       InputLabelProps={{ shrink: true }}
// //                     />
// //                   </Box>
// //                 </Grid>
                
// //                 <Grid size={{ xs: 12, sm: 6 }}>
// //                   <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
// //                     <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary }}>
// //                       EFFECTIVE TO
// //                     </Typography>
// //                     <TextField
// //                       fullWidth
// //                       type="date"
// //                       size="small"
// //                       name="effective_to"
// //                       value={formData.effective_to}
// //                       onChange={handleChange}
// //                       sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5, fontSize: '0.75rem' } }}
// //                       InputLabelProps={{ shrink: true }}
// //                     />
// //                   </Box>
// //                 </Grid>
// //               </Grid>
// //             </Paper>
// //           </Stack>
// //         );
        
// //       case 1:
// //         return (
// //           <Stack spacing={2}>
// //             <Paper sx={{ 
// //               p: 2, 
// //               bgcolor: COLORS.background.white, 
// //               borderRadius: 1.5, 
// //               border: `1px solid ${COLORS.border}`,
// //               boxShadow: 'none'
// //             }}>
// //               <Typography sx={{ 
// //                 fontSize: '0.8rem', 
// //                 fontWeight: 600, 
// //                 color: COLORS.primary, 
// //                 mb: 1.5 
// //               }}>
// //                 <ProductionIcon sx={{ fontSize: '1rem', mr: 0.5, verticalAlign: 'middle' }} />
// //                 Production Parameters
// //               </Typography>
              
// //               <Grid container spacing={1.5}>
// //                 <Grid size={{ xs: 12, sm: 6 }}>
// //                   <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
// //                     <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary }}>
// //                       Batch Size
// //                     </Typography>
// //                     <TextField
// //                       fullWidth
// //                       type="number"
// //                       size="small"
// //                       name="batch_size"
// //                       value={formData.batch_size}
// //                       onChange={handleChange}
// //                       sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5, fontSize: '0.75rem' } }}
// //                     />
// //                   </Box>
// //                 </Grid>
                
// //                 <Grid size={{ xs: 12, sm: 6 }}>
// //                   <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
// //                     <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary }}>
// //                       Yield (%)
// //                     </Typography>
// //                     <TextField
// //                       fullWidth
// //                       type="number"
// //                       size="small"
// //                       name="yield_percent"
// //                       value={formData.yield_percent}
// //                       onChange={handleChange}
// //                       sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5, fontSize: '0.75rem' } }}
// //                     />
// //                   </Box>
// //                 </Grid>
                
// //                 <Grid size={{ xs: 12, sm: 6 }}>
// //                   <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
// //                     <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary }}>
// //                       Setup Time (min)
// //                     </Typography>
// //                     <TextField
// //                       fullWidth
// //                       type="number"
// //                       size="small"
// //                       name="setup_time_min"
// //                       value={formData.setup_time_min}
// //                       onChange={handleChange}
// //                       sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5, fontSize: '0.75rem' } }}
// //                     />
// //                   </Box>
// //                 </Grid>
                
// //                 <Grid size={{ xs: 12, sm: 6 }}>
// //                   <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
// //                     <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary }}>
// //                       Cycle Time (min)
// //                     </Typography>
// //                     <TextField
// //                       fullWidth
// //                       type="number"
// //                       size="small"
// //                       name="cycle_time_min"
// //                       value={formData.cycle_time_min}
// //                       onChange={handleChange}
// //                       sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5, fontSize: '0.75rem' } }}
// //                     />
// //                   </Box>
// //                 </Grid>
// //               </Grid>
// //             </Paper>
// //           </Stack>
// //         );
        
// //       case 2:
// //         return (
// //           <Stack spacing={2}>
// //             <Paper sx={{ 
// //               p: 2, 
// //               bgcolor: COLORS.background.white, 
// //               borderRadius: 1.5, 
// //               border: `1px solid ${COLORS.border}`,
// //               boxShadow: 'none'
// //             }}>
// //               <Typography sx={{ 
// //                 fontSize: '0.8rem', 
// //                 fontWeight: 600, 
// //                 color: COLORS.primary, 
// //                 mb: 1.5 
// //               }}>
// //                 <InventoryIcon sx={{ fontSize: '1rem', mr: 0.5, verticalAlign: 'middle' }} />
// //                 Components <span style={{ color: '#EF4444' }}>*</span>
// //               </Typography>
              
// //               {components.map((component, index) => (
// //                 <Paper
// //                   key={index}
// //                   sx={{
// //                     p: 2,
// //                     mb: 2,
// //                     bgcolor: COLORS.background.light,
// //                     borderRadius: 1.5,
// //                     border: `1px solid ${COLORS.border}`
// //                   }}
// //                 >
// //                   <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.5 }}>
// //                     <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary }}>
// //                       Component {index + 1}
// //                     </Typography>
// //                     {components.length > 1 && (
// //                       <IconButton
// //                         size="small"
// //                         onClick={() => removeComponent(index)}
// //                         sx={{ color: '#EF4444' }}
// //                       >
// //                         <DeleteIcon fontSize="small" />
// //                       </IconButton>
// //                     )}
// //                   </Stack>
                  
// //                   <Grid container spacing={1.5}>
// //                     <Grid size={{ xs: 12 }}>
// //                       <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
// //                         <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary }}>
// //                           COMPONENT ITEM <span style={{ color: '#EF4444' }}>*</span>
// //                         </Typography>
// //                         <Autocomplete
// //                           fullWidth
// //                           options={componentItems}
// //                           getOptionLabel={(option) => `${option.part_no} - ${option.part_description}`}
// //                           value={componentItems.find(item => item._id === component.component_item_id) || null}
// //                           onChange={(event, newValue) => handleComponentChange(index, 'component_item_id', newValue?._id || '')}
// //                           loading={loadingItems}
// //                           renderInput={(params) => (
// //                             <TextField
// //                               {...params}
// //                               size="small"
// //                               error={!!fieldErrors[`comp_${index}_component_item_id`]}
// //                               helperText={fieldErrors[`comp_${index}_component_item_id`]}
// //                               sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5, fontSize: '0.75rem' } }}
// //                             />
// //                           )}
// //                         />
// //                       </Box>
// //                     </Grid>
                    
// //                     <Grid size={{ xs: 6, sm: 3 }}>
// //                       <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
// //                         <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary }}>
// //                           QUANTITY PER <span style={{ color: '#EF4444' }}>*</span>
// //                         </Typography>
// //                         <TextField
// //                           fullWidth
// //                           type="number"
// //                           size="small"
// //                           value={component.quantity_per}
// //                           onChange={(e) => handleComponentChange(index, 'quantity_per', e.target.value)}
// //                           error={!!fieldErrors[`comp_${index}_quantity_per`]}
// //                           helperText={fieldErrors[`comp_${index}_quantity_per`]}
// //                           sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5, fontSize: '0.75rem' } }}
// //                         />
// //                       </Box>
// //                     </Grid>
                    
// //                     <Grid size={{ xs: 6, sm: 2 }}>
// //                       <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
// //                         <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary }}>
// //                           UNIT
// //                         </Typography>
// //                         <FormControl fullWidth size="small">
// //                           <Select
// //                             value={component.unit}
// //                             onChange={(e) => handleComponentChange(index, 'unit', e.target.value)}
// //                             sx={{ borderRadius: 1.5, fontSize: '0.75rem' }}
// //                           >
// //                             {UNIT_OPTIONS.map(option => (
// //                               <MenuItem key={option} value={option} sx={{ fontSize: '0.75rem' }}>
// //                                 {option}
// //                               </MenuItem>
// //                             ))}
// //                           </Select>
// //                         </FormControl>
// //                       </Box>
// //                     </Grid>
                    
// //                     <Grid size={{ xs: 6, sm: 2 }}>
// //                       <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
// //                         <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary }}>
// //                           SCRAP %
// //                         </Typography>
// //                         <TextField
// //                           fullWidth
// //                           type="number"
// //                           size="small"
// //                           value={component.scrap_percent}
// //                           onChange={(e) => handleComponentChange(index, 'scrap_percent', e.target.value)}
// //                           sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5, fontSize: '0.75rem' } }}
// //                         />
// //                       </Box>
// //                     </Grid>
                    
// //                     <Grid size={{ xs: 12, sm: 5 }}>
// //                       <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
// //                         <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary }}>
// //                           REFERENCE DESIGNATOR
// //                         </Typography>
// //                         <TextField
// //                           fullWidth
// //                           size="small"
// //                           value={component.reference_designator}
// //                           onChange={(e) => handleComponentChange(index, 'reference_designator', e.target.value)}
// //                           placeholder="e.g., R1, C2, U3"
// //                           sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5, fontSize: '0.75rem' } }}
// //                         />
// //                       </Box>
// //                     </Grid>
                    
// //                     <Grid size={{ xs: 12, sm: 7 }}>
// //                       <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
// //                         <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary }}>
// //                           REMARKS
// //                         </Typography>
// //                         <TextField
// //                           fullWidth
// //                           size="small"
// //                           value={component.remarks}
// //                           onChange={(e) => handleComponentChange(index, 'remarks', e.target.value)}
// //                           placeholder="Additional notes..."
// //                           sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5, fontSize: '0.75rem' } }}
// //                         />
// //                       </Box>
// //                     </Grid>
// //                   </Grid>
// //                 </Paper>
// //               ))}
              
// //               <Button
// //                 variant="outlined"
// //                 startIcon={<AddIcon sx={{ fontSize: '1rem' }} />}
// //                 onClick={addComponent}
// //                 sx={{
// //                   height: 32,
// //                   px: 2,
// //                   borderRadius: 1.5,
// //                   border: `1px solid ${COLORS.border}`,
// //                   color: COLORS.text.secondary,
// //                   fontSize: '0.7rem',
// //                   fontWeight: 500,
// //                   textTransform: 'none',
// //                   '&:hover': {
// //                     borderColor: COLORS.primary,
// //                     bgcolor: `${COLORS.primary}10`
// //                   }
// //                 }}
// //               >
// //                 Add Component
// //               </Button>
// //             </Paper>
// //           </Stack>
// //         );
        
// //       case 3:
// //         return (
// //           <Stack spacing={2}>
// //             <Paper sx={{ 
// //               p: 2, 
// //               bgcolor: COLORS.background.white, 
// //               borderRadius: 1.5, 
// //               border: `1px solid ${COLORS.border}`,
// //               boxShadow: 'none'
// //             }}>
// //               <Typography sx={{ 
// //                 fontSize: '0.8rem', 
// //                 fontWeight: 600, 
// //                 color: COLORS.primary, 
// //                 mb: 1.5 
// //               }}>
// //                 <InfoIcon sx={{ fontSize: '1rem', mr: 0.5, verticalAlign: 'middle' }} />
// //                 Review & Submit
// //               </Typography>
              
// //               <Stack spacing={2}>
// //                 {/* Basic Info Summary */}
// //                 <Paper sx={{ p: 2, bgcolor: COLORS.background.light, borderRadius: 1.5 }}>
// //                   <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: COLORS.primary, mb: 1 }}>
// //                     Basic Information
// //                   </Typography>
// //                   <Grid container spacing={1}>
// //                     <Grid size={{ xs: 6 }}>
// //                       <Typography sx={{ fontSize: '0.7rem', color: COLORS.text.secondary }}>Parent Item:</Typography>
// //                     </Grid>
// //                     <Grid size={{ xs: 6 }}>
// //                       <Typography sx={{ fontSize: '0.7rem', fontWeight: 500 }}>
// //                         {parentItems.find(item => item._id === formData.parent_item_id)?.part_no || '-'}
// //                       </Typography>
// //                     </Grid>
// //                     <Grid size={{ xs: 6 }}>
// //                       <Typography sx={{ fontSize: '0.7rem', color: COLORS.text.secondary }}>BOM Version:</Typography>
// //                     </Grid>
// //                     <Grid size={{ xs: 6 }}>
// //                       <Typography sx={{ fontSize: '0.7rem', fontWeight: 500 }}>{formData.bom_version}</Typography>
// //                     </Grid>
// //                     <Grid size={{ xs: 6 }}>
// //                       <Typography sx={{ fontSize: '0.7rem', color: COLORS.text.secondary }}>BOM Type:</Typography>
// //                     </Grid>
// //                     <Grid size={{ xs: 6 }}>
// //                       <Typography sx={{ fontSize: '0.7rem', fontWeight: 500 }}>{formData.bom_type}</Typography>
// //                     </Grid>
// //                     <Grid size={{ xs: 6 }}>
// //                       <Typography sx={{ fontSize: '0.7rem', color: COLORS.text.secondary }}>Status:</Typography>
// //                     </Grid>
// //                     <Grid size={{ xs: 6 }}>
// //                       <Typography sx={{ fontSize: '0.7rem', fontWeight: 500 }}>{formData.status}</Typography>
// //                     </Grid>
// //                     <Grid size={{ xs: 6 }}>
// //                       <Typography sx={{ fontSize: '0.7rem', color: COLORS.text.secondary }}>Effective From:</Typography>
// //                     </Grid>
// //                     <Grid size={{ xs: 6 }}>
// //                       <Typography sx={{ fontSize: '0.7rem', fontWeight: 500 }}>{formData.effective_from}</Typography>
// //                     </Grid>
// //                     {formData.effective_to && (
// //                       <>
// //                         <Grid size={{ xs: 6 }}>
// //                           <Typography sx={{ fontSize: '0.7rem', color: COLORS.text.secondary }}>Effective To:</Typography>
// //                         </Grid>
// //                         <Grid size={{ xs: 6 }}>
// //                           <Typography sx={{ fontSize: '0.7rem', fontWeight: 500 }}>{formData.effective_to}</Typography>
// //                         </Grid>
// //                       </>
// //                     )}
// //                   </Grid>
// //                 </Paper>
                
// //                 {/* Production Parameters Summary */}
// //                 <Paper sx={{ p: 2, bgcolor: COLORS.background.light, borderRadius: 1.5 }}>
// //                   <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: COLORS.primary, mb: 1 }}>
// //                     Production Parameters
// //                   </Typography>
// //                   <Grid container spacing={1}>
// //                     <Grid size={{ xs: 6 }}>
// //                       <Typography sx={{ fontSize: '0.7rem', color: COLORS.text.secondary }}>Batch Size:</Typography>
// //                     </Grid>
// //                     <Grid size={{ xs: 6 }}>
// //                       <Typography sx={{ fontSize: '0.7rem', fontWeight: 500 }}>{formData.batch_size}</Typography>
// //                     </Grid>
// //                     <Grid size={{ xs: 6 }}>
// //                       <Typography sx={{ fontSize: '0.7rem', color: COLORS.text.secondary }}>Yield:</Typography>
// //                     </Grid>
// //                     <Grid size={{ xs: 6 }}>
// //                       <Typography sx={{ fontSize: '0.7rem', fontWeight: 500 }}>{formData.yield_percent}%</Typography>
// //                     </Grid>
// //                     <Grid size={{ xs: 6 }}>
// //                       <Typography sx={{ fontSize: '0.7rem', color: COLORS.text.secondary }}>Setup Time:</Typography>
// //                     </Grid>
// //                     <Grid size={{ xs: 6 }}>
// //                       <Typography sx={{ fontSize: '0.7rem', fontWeight: 500 }}>{formData.setup_time_min} min</Typography>
// //                     </Grid>
// //                     <Grid size={{ xs: 6 }}>
// //                       <Typography sx={{ fontSize: '0.7rem', color: COLORS.text.secondary }}>Cycle Time:</Typography>
// //                     </Grid>
// //                     <Grid size={{ xs: 6 }}>
// //                       <Typography sx={{ fontSize: '0.7rem', fontWeight: 500 }}>{formData.cycle_time_min} min</Typography>
// //                     </Grid>
// //                   </Grid>
// //                 </Paper>
                
// //                 {/* Components Summary */}
// //                 <Paper sx={{ p: 2, bgcolor: COLORS.background.light, borderRadius: 1.5 }}>
// //                   <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: COLORS.primary, mb: 1 }}>
// //                     Components ({components.length})
// //                   </Typography>
// //                   {components.map((comp, idx) => (
// //                     <Box key={idx} sx={{ mb: 1, pb: 1, borderBottom: idx < components.length - 1 ? `1px solid ${COLORS.border}` : 'none' }}>
// //                       <Typography sx={{ fontSize: '0.7rem', fontWeight: 500 }}>
// //                         {comp.component_part_no || 'Not selected'}
// //                       </Typography>
// //                       <Typography sx={{ fontSize: '0.65rem', color: COLORS.text.secondary }}>
// //                         Qty: {comp.quantity_per} {comp.unit} | Scrap: {comp.scrap_percent}%
// //                       </Typography>
// //                     </Box>
// //                   ))}
// //                 </Paper>
// //               </Stack>
// //             </Paper>
// //           </Stack>
// //         );
        
// //       default:
// //         return null;
// //     }
// //   };
  
// //   return (
// //     <Dialog
// //       open={open}
// //       onClose={handleClose}
// //       maxWidth="md"
// //       fullWidth
// //       PaperProps={{
// //         sx: {
// //           borderRadius: 2,
// //           boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05)',
// //           border: `1px solid ${COLORS.border}`,
// //           overflow: 'hidden'
// //         }
// //       }}
// //     >
// //       <DialogTitle sx={{
// //         borderBottom: `1px solid ${COLORS.border}`,
// //         py: 1.5,
// //         px: 2.5,
// //         bgcolor: COLORS.background.white,
// //         display: 'flex',
// //         justifyContent: 'space-between',
// //         alignItems: 'center'
// //       }}>
// //         <Typography sx={{ fontSize: '1.2rem', fontWeight: 700, color: COLORS.text.primary }}>
// //           Add New BOM
// //         </Typography>
// //         <IconButton onClick={handleClose} size="small">
// //           <CloseIcon fontSize="small" />
// //         </IconButton>
// //       </DialogTitle>
      
// //       {/* Stepper */}
// //       <Box sx={{ px: 2.5, pt: 2, bgcolor: COLORS.background.white }}>
// //         <Stepper
// //           activeStep={activeStep}
// //           alternativeLabel
// //           connector={<ColorConnector />}
// //         >
// //           {steps.map((label) => (
// //             <Step key={label}>
// //               <StepLabel>
// //                 <Typography sx={{ fontSize: '0.75rem', fontWeight: 500, color: COLORS.text.secondary }}>
// //                   {label}
// //                 </Typography>
// //               </StepLabel>
// //             </Step>
// //           ))}
// //         </Stepper>
// //       </Box>
      
// //       <DialogContent sx={{ p: 2.5, bgcolor: COLORS.background.white }}>
// //         {renderStepContent(activeStep)}
        
// //         {error && (
// //           <Alert 
// //             severity="error" 
// //             sx={{ 
// //               mt: 2, 
// //               borderRadius: 1.5,
// //               fontSize: '0.75rem',
// //               py: 0.5
// //             }}
// //           >
// //                <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.75rem' }}>
// //       Validation Error
// //     </Typography>
// //     <Typography variant="body2" sx={{ fontSize: '0.7rem', whiteSpace: 'pre-wrap' }}>
// //       {error}
// //     </Typography>
// //           </Alert>
// //         )}
// //       </DialogContent>
      
// //       <DialogActions sx={{
// //         px: 2.5,
// //         py: 1.5,
// //         borderTop: `1px solid ${COLORS.border}`,
// //         bgcolor: COLORS.background.white,
// //         justifyContent: 'space-between'
// //       }}>
// //         <Button
// //           onClick={handleBack}
// //           disabled={activeStep === 0 || loading}
// //           size="small"
// //           startIcon={<NavigateBeforeIcon sx={{ fontSize: '1rem' }} />}
// //           sx={{
// //             height: 32,
// //             px: 2,
// //             borderRadius: 1.5,
// //             border: `1px solid ${COLORS.border}`,
// //             color: COLORS.text.secondary,
// //             fontSize: '0.7rem',
// //             fontWeight: 500,
// //             textTransform: 'none',
// //             '&:hover': {
// //               borderColor: COLORS.primary,
// //               bgcolor: `${COLORS.primary}10`
// //             }
// //           }}
// //         >
// //           Back
// //         </Button>
// //         <Box>
// //           <Button
// //             onClick={handleClose}
// //             disabled={loading}
// //             size="small"
// //             sx={{
// //               height: 32,
// //               px: 2,
// //               mr: 1,
// //               borderRadius: 1.5,
// //               border: `1px solid ${COLORS.border}`,
// //               color: COLORS.text.secondary,
// //               fontSize: '0.7rem',
// //               fontWeight: 500,
// //               textTransform: 'none',
// //               '&:hover': {
// //                 borderColor: COLORS.primary,
// //                 bgcolor: `${COLORS.primary}10`
// //               }
// //             }}
// //           >
// //             Cancel
// //           </Button>
// //           {activeStep === steps.length - 1 ? (
// //             <Button
// //               variant="contained"
// //               onClick={handleSubmit}
// //               disabled={loading}
// //               size="small"
// //               startIcon={<AddIcon sx={{ fontSize: '1rem' }} />}
// //               sx={{
// //                 height: 32,
// //                 px: 2,
// //                 borderRadius: 1.5,
// //                 bgcolor: COLORS.primary,
// //                 fontSize: '0.7rem',
// //                 fontWeight: 500,
// //                 textTransform: 'none',
// //                 '&:hover': { bgcolor: COLORS.primaryDark }
// //               }}
// //             >
// //               {loading ? 'Adding...' : 'Add BOM'}
// //             </Button>
// //           ) : (
// //             <Button
// //               variant="contained"
// //               onClick={handleNext}
// //               disabled={loading}
// //               size="small"
// //               endIcon={<NavigateNextIcon sx={{ fontSize: '1rem' }} />}
// //               sx={{
// //                 height: 32,
// //                 px: 2,
// //                 borderRadius: 1.5,
// //                 bgcolor: COLORS.primary,
// //                 fontSize: '0.7rem',
// //                 fontWeight: 500,
// //                 textTransform: 'none',
// //                 '&:hover': { bgcolor: COLORS.primaryDark }
// //               }}
// //             >
// //               Next
// //             </Button>
// //           )}
// //         </Box>
// //       </DialogActions>
// //       {/* Add Item Modal */}
// // <AddItem
// //   open={openAddItemModal}
// //   onClose={() => setOpenAddItemModal(false)}
// //   onAdd={handleItemAdded}
// // />
// //     </Dialog>
// //   );
// // };

// // export default AddBom;



// // AddBom.jsx
// // AddBom.jsx
// // AddBom.jsx
// // AddBom.jsx
// // AddBom.jsx
// import React, { useState, useEffect, useCallback } from 'react';
// import {
//   Box,
//   Dialog,
//   DialogTitle,
//   DialogContent,
//   DialogActions,
//   TextField,
//   Typography,
//   Button,
//   Stack,
//   Grid,
//   Paper,
//   IconButton,
//   Autocomplete,
//   FormControl,
//   Select,
//   MenuItem,
//   Alert,
//   Stepper,
//   Step,
//   StepLabel,
//   StepConnector,
//   stepConnectorClasses,
//   styled,
//   Divider,
//   InputAdornment,
//   Chip
// } from '@mui/material';
// import {
//   Add as AddIcon,
//   Delete as DeleteIcon,
//   Close as CloseIcon,
//   Inventory as InventoryIcon,
//   ProductionQuantityLimits as ProductionIcon,
//   Info as InfoIcon,
//   NavigateNext as NavigateNextIcon,
//   NavigateBefore as NavigateBeforeIcon,
//   Search as SearchIcon
// } from '@mui/icons-material';
// import axios from 'axios';
// import BASE_URL from '../../../../config/Config';

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
//     light: '#F8FFFC',
//     hover: '#F0FDF9'
//   },
//   border: '#E3E8EF'
// };

// // Enums
// const BOM_TYPE_OPTIONS = ['Manufacturing', 'Subcontract', 'Phantom', 'Variant'];
// const STATUS_OPTIONS = ['Pending', 'Active', 'Approved', 'Cancelled', 'Archived'];
// const UNIT_OPTIONS = ['Nos', 'Kg', 'Meter', 'Set', 'Piece', 'Sheet', 'Roll'];
// const BOM_CATEGORY_OPTIONS = ['Standard', 'Assembly'];

// // Parent Item Stepper Steps
// const PARENT_ITEM_STEPS = ['Basic Info', 'Material & Drawing', 'Process Details', 'Rate & Tax'];

// const MAIN_STEPS = ['Basic Information', 'Production Parameters', 'Components', 'Review & Submit'];

// // Custom Stepper Connector
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

// // Custom Paper for dropdowns
// const CustomPaper = styled(Paper)({
//   maxHeight: 200,
//   overflow: 'auto',
//   '&::-webkit-scrollbar': {
//     display: 'none'
//   },
//   scrollbarWidth: 'none',
//   '-ms-overflow-style': 'none'
// });

// const AddBom = ({ open, onClose, onAdd }) => {
//   const [activeStep, setActiveStep] = useState(0);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState('');
//   const [fieldErrors, setFieldErrors] = useState({});
  
//   // Data from APIs
//   const [parentItems, setParentItems] = useState([]);
//   const [componentItems, setComponentItems] = useState([]);
//   const [loadingItems, setLoadingItems] = useState(false);
  
//   // Add Parent Item form state (inline within dialog)
//   const [showAddParentForm, setShowAddParentForm] = useState(false);
//   const [parentActiveStep, setParentActiveStep] = useState(0);
//   const [addParentLoading, setAddParentLoading] = useState(false);
//   const [addParentError, setAddParentError] = useState('');
//   const [parentFieldErrors, setParentFieldErrors] = useState({});
//   const [parentTouched, setParentTouched] = useState({});
  
//   const [newParentData, setNewParentData] = useState({
//     // Basic Info
//     part_no: '',
//     part_name: '',
//     item_category: '',
//     item_type: '',
//     sale_unit: 'Nos',
//     part_description: '',
    
//     // Material & Drawing
//     material: '',
//     material_specification: '',
//     drawing_no: '',
//     drawing_revision: '',
//     weight: '',
//     dimensions: '',
    
//     // Process Details
//     process_type: '',
//     process_description: '',
//     machine_type: '',
//     cycle_time: '',
//     setup_time: '',
    
//     // Rate & Tax
//     unit_price: '',
//     tax_rate: '',
//     hsn_code: '',
//     min_order_quantity: '',
//     lead_time: ''
//   });
  
//   // Form data
//   const [formData, setFormData] = useState({
//     parent_item_id: '',
//     bom_version: 'v1.0',
//     bom_type: 'Manufacturing',
//     status: 'Pending',
//     batch_size: 1,
//     yield_percent: 100,
//     setup_time_min: 30,
//     cycle_time_min: 5.5,
//     effective_from: new Date().toISOString().split('T')[0],
//     effective_to: '',
//     created_by: localStorage.getItem('userId') || '',
//     bom_category: 'Standard'
//   });
  
//   const [components, setComponents] = useState([
//     {
//       level: 1,
//       component_item_id: '',
//       component_part_no: '',
//       component_desc: '',
//       quantity_per: 1,
//       unit: 'Nos',
//       scrap_percent: 0,
//       is_phantom: false,
//       is_subcontract: false,
//       subcontract_vendor: null,
//       reference_designator: '',
//       remarks: ''
//     }
//   ]);

//   // Options for parent item
//   const itemCategoryOptions = ['Raw Material', 'Semi-Finished', 'Finished', 'Spare Part'];
//   const itemTypeOptions = ['Standard', 'Custom', 'Make-to-Order', 'Buy-to-Order'];
//   const materialOptions = ['Steel', 'Copper', 'Aluminium', 'Brass', 'Stainless Steel', 'Plastic', 'Other'];
//   const processTypeOptions = ['Machining', 'Fabrication', 'Assembly', 'Heat Treatment', 'Plating', 'Welding', 'Other'];
//   const machineTypeOptions = ['CNC', 'VMC', 'Lathe', 'Milling', 'Drilling', 'Grinding', 'Welding Machine', 'Other'];
  
//   // Fetch parent items (item_role = 'parent')
//   const fetchParentItems = useCallback(async () => {
//     try {
//       setLoadingItems(true);
//       const token = localStorage.getItem('token');
//       const response = await axios.get(`${BASE_URL}/api/items`, {
//         headers: { 'Authorization': `Bearer ${token}` }
//       });
      
//       if (response.data.success) {
//         const parents = response.data.data.filter(item => item.item_role === 'parent');
//         setParentItems(parents);
//       }
//     } catch (err) {
//       console.error('Error fetching parent items:', err);
//     } finally {
//       setLoadingItems(false);
//     }
//   }, []);
  
//   // Fetch component items (item_role = 'component')
//   const fetchComponentItems = useCallback(async () => {
//     try {
//       const token = localStorage.getItem('token');
//       const response = await axios.get(`${BASE_URL}/api/items`, {
//         headers: { 'Authorization': `Bearer ${token}` }
//       });
      
//       if (response.data.success) {
//         const components = response.data.data.filter(item => item.item_role === 'component');
//         setComponentItems(components);
//       }
//     } catch (err) {
//       console.error('Error fetching component items:', err);
//     }
//   }, []);
  
//   useEffect(() => {
//     if (open) {
//       fetchParentItems();
//       fetchComponentItems();
//     }
//   }, [open, fetchParentItems, fetchComponentItems]);

//   // Handle parent item form changes
//   const handleParentFormChange = (e) => {
//     const { name, value } = e.target;
//     setNewParentData(prev => ({
//       ...prev,
//       [name]: value
//     }));
//     setAddParentError('');
//     if (parentTouched[name]) {
//       setParentFieldErrors(prev => ({ ...prev, [name]: '' }));
//     }
//   };

//   const handleParentBlur = (e) => {
//     const { name } = e.target;
//     setParentTouched(prev => ({ ...prev, [name]: true }));
//   };

//   const validateParentStep = (step) => {
//     const errors = {};
//     let isValid = true;

//     switch (step) {
//       case 0: // Basic Info
//         if (!newParentData.part_no.trim()) {
//           errors.part_no = 'Part Number is required';
//           isValid = false;
//         }
//         if (!newParentData.part_name.trim()) {
//           errors.part_name = 'Part Name is required';
//           isValid = false;
//         }
//         if (!newParentData.item_category) {
//           errors.item_category = 'Item Category is required';
//           isValid = false;
//         }
//         if (!newParentData.item_type) {
//           errors.item_type = 'Item Type is required';
//           isValid = false;
//         }
//         if (!newParentData.sale_unit) {
//           errors.sale_unit = 'Sale Unit is required';
//           isValid = false;
//         }
//         break;

//       case 1: // Material & Drawing
//         if (!newParentData.material) {
//           errors.material = 'Material is required';
//           isValid = false;
//         }
//         if (!newParentData.drawing_no) {
//           errors.drawing_no = 'Drawing No is required';
//           isValid = false;
//         }
//         break;

//       case 2: // Process Details
//         if (!newParentData.process_type) {
//           errors.process_type = 'Process Type is required';
//           isValid = false;
//         }
//         if (!newParentData.cycle_time) {
//           errors.cycle_time = 'Cycle Time is required';
//           isValid = false;
//         }
//         break;

//       case 3: // Rate & Tax
//         if (!newParentData.unit_price) {
//           errors.unit_price = 'Unit Price is required';
//           isValid = false;
//         }
//         if (!newParentData.hsn_code) {
//           errors.hsn_code = 'HSN Code is required';
//           isValid = false;
//         }
//         break;

//       default:
//         return true;
//     }

//     setParentFieldErrors(errors);
//     if (!isValid) {
//       setAddParentError('Please fix the errors in this section');
//     }
//     return isValid;
//   };

//   const handleParentNext = () => {
//     if (validateParentStep(parentActiveStep)) {
//       setAddParentError('');
//       setParentActiveStep(prev => prev + 1);
//     }
//   };

//   const handleParentBack = () => {
//     setAddParentError('');
//     setParentActiveStep(prev => prev - 1);
//   };

//   // Handle add parent item submit
//   const handleAddParentSubmit = async () => {
//     // Validate all steps
//     let allValid = true;
//     for (let i = 0; i < 4; i++) {
//       if (!validateParentStep(i)) {
//         allValid = false;
//         setParentActiveStep(i);
//         break;
//       }
//     }

//     if (!allValid) {
//       setAddParentError('Please fix all validation errors');
//       return;
//     }

//     setAddParentLoading(true);
//     setAddParentError('');

//     try {
//       const token = localStorage.getItem('token');
      
//       const payload = {
//         part_no: newParentData.part_no,
//         part_description: newParentData.part_description || newParentData.part_name,
//         part_name: newParentData.part_name,
//         item_role: 'parent',
//         item_category: newParentData.item_category,
//         item_type: newParentData.item_type,
//         sale_unit: newParentData.sale_unit,
//         material: newParentData.material,
//         material_specification: newParentData.material_specification || '',
//         drawing_no: newParentData.drawing_no || '',
//         drawing_revision: newParentData.drawing_revision || '',
//         weight: newParentData.weight ? Number(newParentData.weight) : 0,
//         dimensions: newParentData.dimensions || '',
//         process_type: newParentData.process_type || '',
//         process_description: newParentData.process_description || '',
//         machine_type: newParentData.machine_type || '',
//         cycle_time: newParentData.cycle_time ? Number(newParentData.cycle_time) : 0,
//         setup_time: newParentData.setup_time ? Number(newParentData.setup_time) : 0,
//         unit_price: newParentData.unit_price ? Number(newParentData.unit_price) : 0,
//         tax_rate: newParentData.tax_rate ? Number(newParentData.tax_rate) : 0,
//         hsn_code: newParentData.hsn_code || '',
//         min_order_quantity: newParentData.min_order_quantity ? Number(newParentData.min_order_quantity) : 1,
//         lead_time: newParentData.lead_time ? Number(newParentData.lead_time) : 0
//       };

//       const response = await axios.post(`${BASE_URL}/api/items`, payload, {
//         headers: {
//           'Authorization': `Bearer ${token}`,
//           'Content-Type': 'application/json'
//         }
//       });

//       if (response.data.success) {
//         const newItem = response.data.data;
//         // Add to parent items list
//         setParentItems(prev => [...prev, newItem]);
//         // Auto-select the new item
//         setFormData(prev => ({ ...prev, parent_item_id: newItem._id }));
//         // Close the add form
//         setShowAddParentForm(false);
//         // Reset form
//         setNewParentData({
//           part_no: '',
//           part_name: '',
//           item_category: '',
//           item_type: '',
//           sale_unit: 'Nos',
//           part_description: '',
//           material: '',
//           material_specification: '',
//           drawing_no: '',
//           drawing_revision: '',
//           weight: '',
//           dimensions: '',
//           process_type: '',
//           process_description: '',
//           machine_type: '',
//           cycle_time: '',
//           setup_time: '',
//           unit_price: '',
//           tax_rate: '',
//           hsn_code: '',
//           min_order_quantity: '',
//           lead_time: ''
//         });
//         setParentActiveStep(0);
//         setParentFieldErrors({});
//         setParentTouched({});
//         // Clear error
//         setFieldErrors(prev => ({ ...prev, parent_item_id: '' }));
//       } else {
//         setAddParentError(response.data.message || 'Failed to add item');
//       }
//     } catch (err) {
//       console.error('Error adding item:', err);
//       setAddParentError(err.response?.data?.message || 'Failed to add item. Please try again.');
//     } finally {
//       setAddParentLoading(false);
//     }
//   };

//   // Render parent item step content
//   const renderParentStepContent = (step) => {
//     switch (step) {
//       case 0: // Basic Info
//         return (
//           <Grid container spacing={1.5}>
//             <Grid size={{ xs: 12, sm: 6 }}>
//               <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//                 <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary }}>
//                   PART NUMBER <span style={{ color: '#EF4444' }}>*</span>
//                 </Typography>
//                 <TextField
//                   fullWidth
//                   size="small"
//                   name="part_no"
//                   value={newParentData.part_no}
//                   onChange={handleParentFormChange}
//                   onBlur={handleParentBlur}
//                   placeholder="e.g., BR-001"
//                   disabled={addParentLoading}
//                   error={!!parentFieldErrors.part_no}
//                   helperText={parentFieldErrors.part_no}
//                   sx={{
//                     '& .MuiOutlinedInput-root': {
//                       borderRadius: 1.5,
//                       fontSize: '0.75rem'
//                     }
//                   }}
//                 />
//               </Box>
//             </Grid>

//             <Grid size={{ xs: 12, sm: 6 }}>
//               <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//                 <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary }}>
//                   PART NAME <span style={{ color: '#EF4444' }}>*</span>
//                 </Typography>
//                 <TextField
//                   fullWidth
//                   size="small"
//                   name="part_name"
//                   value={newParentData.part_name}
//                   onChange={handleParentFormChange}
//                   onBlur={handleParentBlur}
//                   placeholder="e.g., Copper Busbar 100x10mm"
//                   disabled={addParentLoading}
//                   error={!!parentFieldErrors.part_name}
//                   helperText={parentFieldErrors.part_name}
//                   sx={{
//                     '& .MuiOutlinedInput-root': {
//                       borderRadius: 1.5,
//                       fontSize: '0.75rem'
//                     }
//                   }}
//                 />
//               </Box>
//             </Grid>

//             <Grid size={{ xs: 12, sm: 6 }}>
//               <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//                 <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary }}>
//                   ITEM CATEGORY <span style={{ color: '#EF4444' }}>*</span>
//                 </Typography>
//                 <FormControl fullWidth size="small" error={!!parentFieldErrors.item_category}>
//                   <Select
//                     name="item_category"
//                     value={newParentData.item_category}
//                     onChange={handleParentFormChange}
//                     onBlur={handleParentBlur}
//                     disabled={addParentLoading}
//                     displayEmpty
//                     sx={{ borderRadius: 1.5, fontSize: '0.75rem' }}
//                   >
//                     <MenuItem value="" sx={{ fontSize: '0.75rem', color: COLORS.text.tertiary }}>
//                       Select category
//                     </MenuItem>
//                     {itemCategoryOptions.map(option => (
//                       <MenuItem key={option} value={option} sx={{ fontSize: '0.75rem' }}>
//                         {option}
//                       </MenuItem>
//                     ))}
//                   </Select>
//                   {parentFieldErrors.item_category && (
//                     <Typography sx={{ fontSize: '0.65rem', color: '#EF4444' }}>{parentFieldErrors.item_category}</Typography>
//                   )}
//                 </FormControl>
//               </Box>
//             </Grid>

//             <Grid size={{ xs: 12, sm: 6 }}>
//               <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//                 <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary }}>
//                   ITEM TYPE <span style={{ color: '#EF4444' }}>*</span>
//                 </Typography>
//                 <FormControl fullWidth size="small" error={!!parentFieldErrors.item_type}>
//                   <Select
//                     name="item_type"
//                     value={newParentData.item_type}
//                     onChange={handleParentFormChange}
//                     onBlur={handleParentBlur}
//                     disabled={addParentLoading}
//                     displayEmpty
//                     sx={{ borderRadius: 1.5, fontSize: '0.75rem' }}
//                   >
//                     <MenuItem value="" sx={{ fontSize: '0.75rem', color: COLORS.text.tertiary }}>
//                       Select type
//                     </MenuItem>
//                     {itemTypeOptions.map(option => (
//                       <MenuItem key={option} value={option} sx={{ fontSize: '0.75rem' }}>
//                         {option}
//                       </MenuItem>
//                     ))}
//                   </Select>
//                   {parentFieldErrors.item_type && (
//                     <Typography sx={{ fontSize: '0.65rem', color: '#EF4444' }}>{parentFieldErrors.item_type}</Typography>
//                   )}
//                 </FormControl>
//               </Box>
//             </Grid>

//             <Grid size={{ xs: 12, sm: 6 }}>
//               <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//                 <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary }}>
//                   SALE UNIT <span style={{ color: '#EF4444' }}>*</span>
//                 </Typography>
//                 <FormControl fullWidth size="small" error={!!parentFieldErrors.sale_unit}>
//                   <Select
//                     name="sale_unit"
//                     value={newParentData.sale_unit}
//                     onChange={handleParentFormChange}
//                     onBlur={handleParentBlur}
//                     disabled={addParentLoading}
//                     sx={{ borderRadius: 1.5, fontSize: '0.75rem' }}
//                   >
//                     {UNIT_OPTIONS.map(option => (
//                       <MenuItem key={option} value={option} sx={{ fontSize: '0.75rem' }}>
//                         {option}
//                       </MenuItem>
//                     ))}
//                   </Select>
//                   {parentFieldErrors.sale_unit && (
//                     <Typography sx={{ fontSize: '0.65rem', color: '#EF4444' }}>{parentFieldErrors.sale_unit}</Typography>
//                   )}
//                 </FormControl>
//                 <Typography sx={{ fontSize: '0.65rem', color: COLORS.text.tertiary }}>
//                   Optional, defaults to "Nos"
//                 </Typography>
//               </Box>
//             </Grid>

//             <Grid size={{ xs: 12, sm: 6 }}>
//               <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//                 <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary }}>
//                   PART DESCRIPTION
//                 </Typography>
//                 <TextField
//                   fullWidth
//                   size="small"
//                   name="part_description"
//                   value={newParentData.part_description}
//                   onChange={handleParentFormChange}
//                   placeholder="Enter detailed part description"
//                   multiline
//                   rows={2}
//                   disabled={addParentLoading}
//                   sx={{
//                     '& .MuiOutlinedInput-root': {
//                       borderRadius: 1.5,
//                       fontSize: '0.75rem'
//                     }
//                   }}
//                 />
//               </Box>
//             </Grid>
//           </Grid>
//         );

//       case 1: // Material & Drawing
//         return (
//           <Grid container spacing={1.5}>
//             <Grid size={{ xs: 12, sm: 6 }}>
//               <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//                 <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary }}>
//                   MATERIAL <span style={{ color: '#EF4444' }}>*</span>
//                 </Typography>
//                 <FormControl fullWidth size="small" error={!!parentFieldErrors.material}>
//                   <Select
//                     name="material"
//                     value={newParentData.material}
//                     onChange={handleParentFormChange}
//                     onBlur={handleParentBlur}
//                     disabled={addParentLoading}
//                     displayEmpty
//                     sx={{ borderRadius: 1.5, fontSize: '0.75rem' }}
//                   >
//                     <MenuItem value="" sx={{ fontSize: '0.75rem', color: COLORS.text.tertiary }}>
//                       Select material
//                     </MenuItem>
//                     {materialOptions.map(option => (
//                       <MenuItem key={option} value={option} sx={{ fontSize: '0.75rem' }}>
//                         {option}
//                       </MenuItem>
//                     ))}
//                   </Select>
//                   {parentFieldErrors.material && (
//                     <Typography sx={{ fontSize: '0.65rem', color: '#EF4444' }}>{parentFieldErrors.material}</Typography>
//                   )}
//                 </FormControl>
//               </Box>
//             </Grid>

//             <Grid size={{ xs: 12, sm: 6 }}>
//               <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//                 <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary }}>
//                   MATERIAL SPECIFICATION
//                 </Typography>
//                 <TextField
//                   fullWidth
//                   size="small"
//                   name="material_specification"
//                   value={newParentData.material_specification}
//                   onChange={handleParentFormChange}
//                   placeholder="e.g., ASTM A36, C11000"
//                   disabled={addParentLoading}
//                   sx={{
//                     '& .MuiOutlinedInput-root': {
//                       borderRadius: 1.5,
//                       fontSize: '0.75rem'
//                     }
//                   }}
//                 />
//               </Box>
//             </Grid>

//             <Grid size={{ xs: 12, sm: 6 }}>
//               <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//                 <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary }}>
//                   DRAWING NO <span style={{ color: '#EF4444' }}>*</span>
//                 </Typography>
//                 <TextField
//                   fullWidth
//                   size="small"
//                   name="drawing_no"
//                   value={newParentData.drawing_no}
//                   onChange={handleParentFormChange}
//                   onBlur={handleParentBlur}
//                   placeholder="e.g., DRG-001"
//                   disabled={addParentLoading}
//                   error={!!parentFieldErrors.drawing_no}
//                   helperText={parentFieldErrors.drawing_no}
//                   sx={{
//                     '& .MuiOutlinedInput-root': {
//                       borderRadius: 1.5,
//                       fontSize: '0.75rem'
//                     }
//                   }}
//                 />
//               </Box>
//             </Grid>

//             <Grid size={{ xs: 12, sm: 6 }}>
//               <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//                 <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary }}>
//                   DRAWING REVISION
//                 </Typography>
//                 <TextField
//                   fullWidth
//                   size="small"
//                   name="drawing_revision"
//                   value={newParentData.drawing_revision}
//                   onChange={handleParentFormChange}
//                   placeholder="e.g., Rev A, 01"
//                   disabled={addParentLoading}
//                   sx={{
//                     '& .MuiOutlinedInput-root': {
//                       borderRadius: 1.5,
//                       fontSize: '0.75rem'
//                     }
//                   }}
//                 />
//               </Box>
//             </Grid>

//             <Grid size={{ xs: 12, sm: 6 }}>
//               <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//                 <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary }}>
//                   WEIGHT (kg)
//                 </Typography>
//                 <TextField
//                   fullWidth
//                   size="small"
//                   name="weight"
//                   type="number"
//                   value={newParentData.weight}
//                   onChange={handleParentFormChange}
//                   placeholder="e.g., 2.5"
//                   disabled={addParentLoading}
//                   sx={{
//                     '& .MuiOutlinedInput-root': {
//                       borderRadius: 1.5,
//                       fontSize: '0.75rem'
//                     }
//                   }}
//                 />
//               </Box>
//             </Grid>

//             <Grid size={{ xs: 12, sm: 6 }}>
//               <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//                 <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary }}>
//                   DIMENSIONS
//                 </Typography>
//                 <TextField
//                   fullWidth
//                   size="small"
//                   name="dimensions"
//                   value={newParentData.dimensions}
//                   onChange={handleParentFormChange}
//                   placeholder="e.g., 100x10x1000mm"
//                   disabled={addParentLoading}
//                   sx={{
//                     '& .MuiOutlinedInput-root': {
//                       borderRadius: 1.5,
//                       fontSize: '0.75rem'
//                     }
//                   }}
//                 />
//               </Box>
//             </Grid>
//           </Grid>
//         );

//       case 2: // Process Details
//         return (
//           <Grid container spacing={1.5}>
//             <Grid size={{ xs: 12, sm: 6 }}>
//               <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//                 <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary }}>
//                   PROCESS TYPE <span style={{ color: '#EF4444' }}>*</span>
//                 </Typography>
//                 <FormControl fullWidth size="small" error={!!parentFieldErrors.process_type}>
//                   <Select
//                     name="process_type"
//                     value={newParentData.process_type}
//                     onChange={handleParentFormChange}
//                     onBlur={handleParentBlur}
//                     disabled={addParentLoading}
//                     displayEmpty
//                     sx={{ borderRadius: 1.5, fontSize: '0.75rem' }}
//                   >
//                     <MenuItem value="" sx={{ fontSize: '0.75rem', color: COLORS.text.tertiary }}>
//                       Select process type
//                     </MenuItem>
//                     {processTypeOptions.map(option => (
//                       <MenuItem key={option} value={option} sx={{ fontSize: '0.75rem' }}>
//                         {option}
//                       </MenuItem>
//                     ))}
//                   </Select>
//                   {parentFieldErrors.process_type && (
//                     <Typography sx={{ fontSize: '0.65rem', color: '#EF4444' }}>{parentFieldErrors.process_type}</Typography>
//                   )}
//                 </FormControl>
//               </Box>
//             </Grid>

//             <Grid size={{ xs: 12, sm: 6 }}>
//               <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//                 <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary }}>
//                   MACHINE TYPE
//                 </Typography>
//                 <FormControl fullWidth size="small">
//                   <Select
//                     name="machine_type"
//                     value={newParentData.machine_type}
//                     onChange={handleParentFormChange}
//                     disabled={addParentLoading}
//                     displayEmpty
//                     sx={{ borderRadius: 1.5, fontSize: '0.75rem' }}
//                   >
//                     <MenuItem value="" sx={{ fontSize: '0.75rem', color: COLORS.text.tertiary }}>
//                       Select machine type
//                     </MenuItem>
//                     {machineTypeOptions.map(option => (
//                       <MenuItem key={option} value={option} sx={{ fontSize: '0.75rem' }}>
//                         {option}
//                       </MenuItem>
//                     ))}
//                   </Select>
//                 </FormControl>
//               </Box>
//             </Grid>

//             <Grid size={{ xs: 12, sm: 6 }}>
//               <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//                 <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary }}>
//                   CYCLE TIME (min) <span style={{ color: '#EF4444' }}>*</span>
//                 </Typography>
//                 <TextField
//                   fullWidth
//                   size="small"
//                   name="cycle_time"
//                   type="number"
//                   value={newParentData.cycle_time}
//                   onChange={handleParentFormChange}
//                   onBlur={handleParentBlur}
//                   placeholder="e.g., 5.5"
//                   disabled={addParentLoading}
//                   error={!!parentFieldErrors.cycle_time}
//                   helperText={parentFieldErrors.cycle_time}
//                   sx={{
//                     '& .MuiOutlinedInput-root': {
//                       borderRadius: 1.5,
//                       fontSize: '0.75rem'
//                     }
//                   }}
//                 />
//               </Box>
//             </Grid>

//             <Grid size={{ xs: 12, sm: 6 }}>
//               <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//                 <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary }}>
//                   SETUP TIME (min)
//                 </Typography>
//                 <TextField
//                   fullWidth
//                   size="small"
//                   name="setup_time"
//                   type="number"
//                   value={newParentData.setup_time}
//                   onChange={handleParentFormChange}
//                   placeholder="e.g., 30"
//                   disabled={addParentLoading}
//                   sx={{
//                     '& .MuiOutlinedInput-root': {
//                       borderRadius: 1.5,
//                       fontSize: '0.75rem'
//                     }
//                   }}
//                 />
//               </Box>
//             </Grid>

//             <Grid size={{ xs: 12 }}>
//               <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//                 <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary }}>
//                   PROCESS DESCRIPTION
//                 </Typography>
//                 <TextField
//                   fullWidth
//                   size="small"
//                   name="process_description"
//                   value={newParentData.process_description}
//                   onChange={handleParentFormChange}
//                   placeholder="Describe the process in detail"
//                   multiline
//                   rows={2}
//                   disabled={addParentLoading}
//                   sx={{
//                     '& .MuiOutlinedInput-root': {
//                       borderRadius: 1.5,
//                       fontSize: '0.75rem'
//                     }
//                   }}
//                 />
//               </Box>
//             </Grid>
//           </Grid>
//         );

//       case 3: // Rate & Tax
//         return (
//           <Grid container spacing={1.5}>
//             <Grid size={{ xs: 12, sm: 6 }}>
//               <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//                 <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary }}>
//                   UNIT PRICE (₹) <span style={{ color: '#EF4444' }}>*</span>
//                 </Typography>
//                 <TextField
//                   fullWidth
//                   size="small"
//                   name="unit_price"
//                   type="number"
//                   value={newParentData.unit_price}
//                   onChange={handleParentFormChange}
//                   onBlur={handleParentBlur}
//                   placeholder="e.g., 1500"
//                   disabled={addParentLoading}
//                   error={!!parentFieldErrors.unit_price}
//                   helperText={parentFieldErrors.unit_price}
//                   sx={{
//                     '& .MuiOutlinedInput-root': {
//                       borderRadius: 1.5,
//                       fontSize: '0.75rem'
//                     }
//                   }}
//                   InputProps={{
//                     startAdornment: <InputAdornment position="start">₹</InputAdornment>,
//                   }}
//                 />
//               </Box>
//             </Grid>

//             <Grid size={{ xs: 12, sm: 6 }}>
//               <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//                 <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary }}>
//                   TAX RATE (%)
//                 </Typography>
//                 <TextField
//                   fullWidth
//                   size="small"
//                   name="tax_rate"
//                   type="number"
//                   value={newParentData.tax_rate}
//                   onChange={handleParentFormChange}
//                   placeholder="e.g., 18"
//                   disabled={addParentLoading}
//                   sx={{
//                     '& .MuiOutlinedInput-root': {
//                       borderRadius: 1.5,
//                       fontSize: '0.75rem'
//                     }
//                   }}
//                   InputProps={{
//                     endAdornment: <InputAdornment position="end">%</InputAdornment>,
//                   }}
//                 />
//               </Box>
//             </Grid>

//             <Grid size={{ xs: 12, sm: 6 }}>
//               <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//                 <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary }}>
//                   HSN CODE <span style={{ color: '#EF4444' }}>*</span>
//                 </Typography>
//                 <TextField
//                   fullWidth
//                   size="small"
//                   name="hsn_code"
//                   value={newParentData.hsn_code}
//                   onChange={handleParentFormChange}
//                   onBlur={handleParentBlur}
//                   placeholder="e.g., 74071010"
//                   disabled={addParentLoading}
//                   error={!!parentFieldErrors.hsn_code}
//                   helperText={parentFieldErrors.hsn_code}
//                   sx={{
//                     '& .MuiOutlinedInput-root': {
//                       borderRadius: 1.5,
//                       fontSize: '0.75rem'
//                     }
//                   }}
//                 />
//               </Box>
//             </Grid>

//             <Grid size={{ xs: 12, sm: 6 }}>
//               <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//                 <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary }}>
//                   MIN ORDER QUANTITY
//                 </Typography>
//                 <TextField
//                   fullWidth
//                   size="small"
//                   name="min_order_quantity"
//                   type="number"
//                   value={newParentData.min_order_quantity}
//                   onChange={handleParentFormChange}
//                   placeholder="e.g., 100"
//                   disabled={addParentLoading}
//                   sx={{
//                     '& .MuiOutlinedInput-root': {
//                       borderRadius: 1.5,
//                       fontSize: '0.75rem'
//                     }
//                   }}
//                 />
//               </Box>
//             </Grid>

//             <Grid size={{ xs: 12, sm: 6 }}>
//               <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//                 <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary }}>
//                   LEAD TIME (days)
//                 </Typography>
//                 <TextField
//                   fullWidth
//                   size="small"
//                   name="lead_time"
//                   type="number"
//                   value={newParentData.lead_time}
//                   onChange={handleParentFormChange}
//                   placeholder="e.g., 7"
//                   disabled={addParentLoading}
//                   sx={{
//                     '& .MuiOutlinedInput-root': {
//                       borderRadius: 1.5,
//                       fontSize: '0.75rem'
//                     }
//                   }}
//                 />
//               </Box>
//             </Grid>
//           </Grid>
//         );

//       default:
//         return null;
//     }
//   };

//   const handleItemAdded = (newItem) => {
//     setParentItems(prev => [...prev, newItem]);
//     setFormData(prev => ({ ...prev, parent_item_id: newItem._id }));
//     setFieldErrors(prev => ({ ...prev, parent_item_id: '' }));
//     setShowAddParentForm(false);
//   };
  
//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData(prev => ({
//       ...prev,
//       [name]: value
//     }));
//     setFieldErrors(prev => ({ ...prev, [name]: '' }));
//     setError('');
//   };
  
//   const handleBomCategoryChange = (e) => {
//     const value = e.target.value;
//     setFormData(prev => ({
//       ...prev,
//       bom_category: value
//     }));
//     setFieldErrors(prev => ({ ...prev, bom_category: '' }));
//     setError('');
    
//     if (value === 'Standard') {
//       const hasComponents = components.some(comp => comp.component_item_id);
//       if (hasComponents) {
//         setComponents([
//           {
//             level: 1,
//             component_item_id: '',
//             component_part_no: '',
//             component_desc: '',
//             quantity_per: 1,
//             unit: 'Nos',
//             scrap_percent: 0,
//             is_phantom: false,
//             is_subcontract: false,
//             subcontract_vendor: null,
//             reference_designator: '',
//             remarks: ''
//           }
//         ]);
//         setError('Components cleared. Standard BOM cannot have components.');
//         setTimeout(() => setError(''), 3000);
//       }
//     }
//   };
  
//   const handleComponentChange = (index, field, value) => {
//     if (formData.bom_category === 'Standard') {
//       setError('Standard BOM cannot have components. Please change BOM Category to "Assembly".');
//       return;
//     }
    
//     const updatedComponents = [...components];
//     updatedComponents[index][field] = value;
    
//     if (field === 'component_item_id' && value) {
//       const selectedItem = componentItems.find(item => item._id === value);
//       if (selectedItem) {
//         updatedComponents[index].component_part_no = selectedItem.part_no || '';
//         updatedComponents[index].component_desc = selectedItem.part_description || '';
//         updatedComponents[index].unit = selectedItem.unit || 'Nos';
//       }
//     }
    
//     setComponents(updatedComponents);
//     setFieldErrors(prev => ({ ...prev, [`comp_${index}_${field}`]: '' }));
//   };
  
//   const addComponent = () => {
//     if (formData.bom_category === 'Standard') {
//       setError('Standard BOM cannot have components. Please change BOM Category to "Assembly" to add components.');
//       return;
//     }
    
//     setComponents([
//       ...components,
//       {
//         level: components.length + 1,
//         component_item_id: '',
//         component_part_no: '',
//         component_desc: '',
//         quantity_per: 1,
//         unit: 'Nos',
//         scrap_percent: 0,
//         is_phantom: false,
//         is_subcontract: false,
//         subcontract_vendor: null,
//         reference_designator: '',
//         remarks: ''
//       }
//     ]);
//   };
  
//   const removeComponent = (index) => {
//     if (components.length > 1) {
//       const updatedComponents = components.filter((_, i) => i !== index);
//       updatedComponents.forEach((comp, idx) => {
//         comp.level = idx + 1;
//       });
//       setComponents(updatedComponents);
//     }
//   };
  
//   const validateStep = (step) => {
//     const errors = {};
//     let isValid = true;
    
//     switch (step) {
//       case 0:
//         if (!formData.parent_item_id) {
//           errors.parent_item_id = 'Parent item is required';
//           isValid = false;
//         }
//         if (!formData.bom_version.trim()) {
//           errors.bom_version = 'BOM version is required';
//           isValid = false;
//         }
//         if (!formData.bom_type) {
//           errors.bom_type = 'BOM type is required';
//           isValid = false;
//         }
//         if (!formData.bom_category) {
//           errors.bom_category = 'BOM category is required';
//           isValid = false;
//         }
//         if (!formData.effective_from) {
//           errors.effective_from = 'Effective from date is required';
//           isValid = false;
//         }
//         break;
        
//       case 2:
//         if (formData.bom_category === 'Assembly') {
//           let hasValidComponent = false;
//           components.forEach((comp, index) => {
//             if (comp.component_item_id) {
//               hasValidComponent = true;
//             }
//             if (!comp.component_item_id) {
//               errors[`comp_${index}_component_item_id`] = `Component ${index + 1}: Item is required for Assembly BOM`;
//               isValid = false;
//             }
//             if (!comp.quantity_per || comp.quantity_per <= 0) {
//               errors[`comp_${index}_quantity_per`] = `Component ${index + 1}: Valid quantity is required`;
//               isValid = false;
//             }
//           });
//           if (!hasValidComponent) {
//             errors.components = 'At least one component is required for Assembly BOM';
//             isValid = false;
//           }
//         } else if (formData.bom_category === 'Standard') {
//           const hasComponents = components.some(comp => comp.component_item_id);
//           if (hasComponents) {
//             errors.components = 'Standard BOM cannot have components. Use BOM Category: "Assembly" for BOMs with components.';
//             isValid = false;
//             setComponents([
//               {
//                 level: 1,
//                 component_item_id: '',
//                 component_part_no: '',
//                 component_desc: '',
//                 quantity_per: 1,
//                 unit: 'Nos',
//                 scrap_percent: 0,
//                 is_phantom: false,
//                 is_subcontract: false,
//                 subcontract_vendor: null,
//                 reference_designator: '',
//                 remarks: ''
//               }
//             ]);
//           }
//         }
//         break;
        
//       default:
//         return true;
//     }
    
//     setFieldErrors(errors);
//     if (!isValid) {
//       setError('Please fix the errors in this section');
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
//     if (!validateStep(2)) {
//       return;
//     }
    
//     if (formData.bom_category === 'Assembly') {
//       const hasComponents = components.some(comp => comp.component_item_id);
//       if (!hasComponents) {
//         setError('Assembly BOM must have at least one component.');
//         setActiveStep(2);
//         return;
//       }
//     } else if (formData.bom_category === 'Standard') {
//       const hasComponents = components.some(comp => comp.component_item_id);
//       if (hasComponents) {
//         setError('Standard BOM cannot have components. Use "Assembly" category for BOMs with components.');
//         setActiveStep(2);
//         setComponents([
//           {
//             level: 1,
//             component_item_id: '',
//             component_part_no: '',
//             component_desc: '',
//             quantity_per: 1,
//             unit: 'Nos',
//             scrap_percent: 0,
//             is_phantom: false,
//             is_subcontract: false,
//             subcontract_vendor: null,
//             reference_designator: '',
//             remarks: ''
//           }
//         ]);
//         return;
//       }
//     }
    
//     const unitMismatches = [];
//     for (let i = 0; i < components.length; i++) {
//       const comp = components[i];
//       if (comp.component_item_id) {
//         const selectedItem = componentItems.find(item => item._id === comp.component_item_id);
//         if (selectedItem && selectedItem.unit && comp.unit !== selectedItem.unit) {
//           unitMismatches.push(`Component "${comp.component_part_no || selectedItem.part_no}": Unit mismatch. Item unit is ${selectedItem.unit}, provided ${comp.unit}`);
//         }
//       }
//     }
    
//     if (unitMismatches.length > 0) {
//       setError(unitMismatches.join('\n'));
//       setActiveStep(2);
//       return;
//     }
    
//     setLoading(true);
//     setError('');
    
//     try {
//       const token = localStorage.getItem('token');
      
//       const submitData = {
//         ...formData,
//         batch_size: Number(formData.batch_size),
//         yield_percent: Number(formData.yield_percent),
//         setup_time_min: Number(formData.setup_time_min),
//         cycle_time_min: Number(formData.cycle_time_min),
//         components: formData.bom_category === 'Assembly' 
//           ? components.map(comp => ({
//               ...comp,
//               level: Number(comp.level),
//               quantity_per: Number(comp.quantity_per),
//               scrap_percent: Number(comp.scrap_percent)
//             }))
//           : []
//       };
      
//       const response = await axios.post(`${BASE_URL}/api/boms`, submitData, {
//         headers: {
//           'Authorization': `Bearer ${token}`,
//           'Content-Type': 'application/json'
//         }
//       });
      
//       if (response.data.success) {
//         onAdd(response.data.data);
//         onClose();
//         resetForm();
//       } else {
//         setError(response.data.message || 'Failed to add BOM');
//       }
//     } catch (err) {
//       console.error('Error adding BOM:', err);
      
//       let errorMessage = 'Failed to add BOM. Please try again.';
      
//       if (err.response?.data) {
//         const data = err.response.data;
//         if (data.errors && Array.isArray(data.errors) && data.errors.length > 0) {
//           errorMessage = data.errors.join('\n');
//         } else if (data.message) {
//           errorMessage = data.message;
//         } else if (data.error) {
//           errorMessage = data.error;
//         }
//       } else if (err.message) {
//         errorMessage = err.message;
//       }
      
//       setError(errorMessage);
//     } finally {
//       setLoading(false);
//     }
//   };
  
//   const resetForm = () => {
//     setActiveStep(0);
//     setFormData({
//       parent_item_id: '',
//       bom_version: 'v1.0',
//       bom_type: 'Manufacturing',
//       status: 'Pending',
//       batch_size: 1,
//       yield_percent: 100,
//       setup_time_min: 30,
//       cycle_time_min: 5.5,
//       effective_from: new Date().toISOString().split('T')[0],
//       effective_to: '',
//       created_by: localStorage.getItem('userId') || '',
//       bom_category: 'Standard'
//     });
//     setComponents([
//       {
//         level: 1,
//         component_item_id: '',
//         component_part_no: '',
//         component_desc: '',
//         quantity_per: 1,
//         unit: 'Nos',
//         scrap_percent: 0,
//         is_phantom: false,
//         is_subcontract: false,
//         subcontract_vendor: null,
//         reference_designator: '',
//         remarks: ''
//       }
//     ]);
//     setFieldErrors({});
//     setError('');
//     setShowAddParentForm(false);
//     setParentActiveStep(0);
//     setNewParentData({
//       part_no: '',
//       part_name: '',
//       item_category: '',
//       item_type: '',
//       sale_unit: 'Nos',
//       part_description: '',
//       material: '',
//       material_specification: '',
//       drawing_no: '',
//       drawing_revision: '',
//       weight: '',
//       dimensions: '',
//       process_type: '',
//       process_description: '',
//       machine_type: '',
//       cycle_time: '',
//       setup_time: '',
//       unit_price: '',
//       tax_rate: '',
//       hsn_code: '',
//       min_order_quantity: '',
//       lead_time: ''
//     });
//     setParentFieldErrors({});
//     setParentTouched({});
//     setAddParentError('');
//   };
  
//   const handleClose = () => {
//     resetForm();
//     onClose();
//   };
  
//   const renderStepContent = (step) => {
//     switch (step) {
//       case 0:
//         return (
//           <Stack spacing={2}>
//             <Paper sx={{ 
//               p: 2, 
//               bgcolor: COLORS.background.white, 
//               borderRadius: 1.5, 
//               border: `1px solid ${COLORS.border}`,
//               boxShadow: 'none'
//             }}>
//               <Typography sx={{ 
//                 fontSize: '0.8rem', 
//                 fontWeight: 600, 
//                 color: COLORS.primary, 
//                 mb: 1.5 
//               }}>
//                 <InventoryIcon sx={{ fontSize: '1rem', mr: 0.5, verticalAlign: 'middle' }} />
//                 Basic Information
//               </Typography>
              
//               <Grid container spacing={1.5}>
//                 <Grid size={{ xs: 12 }}>
//                   <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//                     <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary }}>
//                       PARENT ITEM <span style={{ color: '#EF4444' }}>*</span>
//                     </Typography>
                    
//                     <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
//                       <Box sx={{ flex: 1 }}>
//                         <Autocomplete
//                           fullWidth
//                           options={parentItems}
//                           getOptionLabel={(option) => `${option.part_no} - ${option.part_description}`}
//                           value={parentItems.find(item => item._id === formData.parent_item_id) || null}
//                           onChange={(event, newValue) => {
//                             setFormData(prev => ({ ...prev, parent_item_id: newValue?._id || '' }));
//                             setFieldErrors(prev => ({ ...prev, parent_item_id: '' }));
//                           }}
//                           loading={loadingItems}
//                           renderInput={(params) => (
//                             <TextField
//                               {...params}
//                               size="small"
//                               error={!!fieldErrors.parent_item_id}
//                               helperText={fieldErrors.parent_item_id}
//                               sx={{
//                                 '& .MuiOutlinedInput-root': {
//                                   borderRadius: 1.5,
//                                   fontSize: '0.75rem'
//                                 }
//                               }}
//                             />
//                           )}
//                         />
//                       </Box>
//                       <Button
//                         variant="outlined"
//                         size="small"
//                         onClick={() => {
//                           setShowAddParentForm(!showAddParentForm);
//                           if (!showAddParentForm) {
//                             setParentActiveStep(0);
//                             setParentFieldErrors({});
//                             setAddParentError('');
//                           }
//                         }}
//                         startIcon={<AddIcon sx={{ fontSize: '0.875rem' }} />}
//                         sx={{
//                           height: 35,
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
//                         {showAddParentForm ? 'Cancel' : 'Add New'}
//                       </Button>
//                     </Box>
//                   </Box>
//                 </Grid>

//                 {/* Add Parent Item Form - Inline with 4-step stepper */}
//                 {showAddParentForm && (
//                   <Grid size={{ xs: 12 }}>
//                     <Box sx={{ 
//                       mt: 1, 
//                       p: 2, 
//                       bgcolor: COLORS.background.light, 
//                       borderRadius: 2, 
//                       border: `1px solid ${COLORS.primary}` 
//                     }}>
//                       <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
//                         <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color: COLORS.primary }}>
//                           Add New Item
//                         </Typography>
//                         <IconButton
//                           size="small"
//                           onClick={() => {
//                             setShowAddParentForm(false);
//                             setAddParentError("");
//                             setParentActiveStep(0);
//                             setNewParentData({
//                               part_no: '',
//                               part_name: '',
//                               item_category: '',
//                               item_type: '',
//                               sale_unit: 'Nos',
//                               part_description: '',
//                               material: '',
//                               material_specification: '',
//                               drawing_no: '',
//                               drawing_revision: '',
//                               weight: '',
//                               dimensions: '',
//                               process_type: '',
//                               process_description: '',
//                               machine_type: '',
//                               cycle_time: '',
//                               setup_time: '',
//                               unit_price: '',
//                               tax_rate: '',
//                               hsn_code: '',
//                               min_order_quantity: '',
//                               lead_time: ''
//                             });
//                             setParentFieldErrors({});
//                             setParentTouched({});
//                           }}
//                           sx={{
//                             color: COLORS.text.tertiary,
//                             '&:hover': { color: COLORS.primary }
//                           }}
//                         >
//                           <CloseIcon sx={{ fontSize: '1rem' }} />
//                         </IconButton>
//                       </Box>

//                       {/* Parent Item Stepper */}
//                       <Stepper
//                         activeStep={parentActiveStep}
//                         sx={{ mb: 3 }}
//                         connector={<ColorConnector />}
//                       >
//                         {PARENT_ITEM_STEPS.map((label) => (
//                           <Step key={label}>
//                             <StepLabel>
//                               <Typography sx={{ fontSize: '0.65rem', fontWeight: 500 }}>
//                                 {label}
//                               </Typography>
//                             </StepLabel>
//                           </Step>
//                         ))}
//                       </Stepper>

//                       {renderParentStepContent(parentActiveStep)}

//                       {addParentError && (
//                         <Alert
//                           severity="error"
//                           sx={{
//                             mt: 2,
//                             borderRadius: 1.5,
//                             fontSize: '0.75rem',
//                             py: 0.5
//                           }}
//                         >
//                           {addParentError}
//                         </Alert>
//                       )}

//                       <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
//                         <Button
//                           onClick={handleParentBack}
//                           disabled={parentActiveStep === 0 || addParentLoading}
//                           size="small"
//                           startIcon={<NavigateBeforeIcon sx={{ fontSize: '1rem' }} />}
//                           sx={{
//                             height: 32,
//                             px: 2,
//                             borderRadius: 1.5,
//                             border: `1px solid ${COLORS.border}`,
//                             color: COLORS.text.secondary,
//                             fontSize: '0.7rem',
//                             fontWeight: 500,
//                             textTransform: 'none',
//                             '&:hover': {
//                               borderColor: COLORS.primary,
//                               bgcolor: `${COLORS.primary}10`
//                             }
//                           }}
//                         >
//                           Back
//                         </Button>
//                         <Box sx={{ display: 'flex', gap: 1 }}>
//                           <Button
//                             onClick={() => {
//                               setShowAddParentForm(false);
//                               setAddParentError("");
//                               setParentActiveStep(0);
//                               setNewParentData({
//                                 part_no: '',
//                                 part_name: '',
//                                 item_category: '',
//                                 item_type: '',
//                                 sale_unit: 'Nos',
//                                 part_description: '',
//                                 material: '',
//                                 material_specification: '',
//                                 drawing_no: '',
//                                 drawing_revision: '',
//                                 weight: '',
//                                 dimensions: '',
//                                 process_type: '',
//                                 process_description: '',
//                                 machine_type: '',
//                                 cycle_time: '',
//                                 setup_time: '',
//                                 unit_price: '',
//                                 tax_rate: '',
//                                 hsn_code: '',
//                                 min_order_quantity: '',
//                                 lead_time: ''
//                               });
//                               setParentFieldErrors({});
//                               setParentTouched({});
//                             }}
//                             disabled={addParentLoading}
//                             size="small"
//                             sx={{
//                               height: 32,
//                               px: 2,
//                               borderRadius: 1.5,
//                               border: `1px solid ${COLORS.border}`,
//                               color: COLORS.text.secondary,
//                               fontSize: '0.7rem',
//                               fontWeight: 500,
//                               textTransform: 'none',
//                               '&:hover': {
//                                 borderColor: COLORS.primary,
//                                 bgcolor: `${COLORS.primary}10`
//                               }
//                             }}
//                           >
//                             Cancel
//                           </Button>
//                           {parentActiveStep === PARENT_ITEM_STEPS.length - 1 ? (
//                             <Button
//                               variant="contained"
//                               onClick={handleAddParentSubmit}
//                               disabled={addParentLoading}
//                               size="small"
//                               startIcon={<AddIcon sx={{ fontSize: '1rem' }} />}
//                               sx={{
//                                 height: 32,
//                                 px: 2,
//                                 borderRadius: 1.5,
//                                 bgcolor: COLORS.primary,
//                                 fontSize: '0.7rem',
//                                 fontWeight: 500,
//                                 textTransform: 'none',
//                                 '&:hover': { bgcolor: COLORS.primaryDark }
//                               }}
//                             >
//                               {addParentLoading ? 'Adding...' : 'Add Item'}
//                             </Button>
//                           ) : (
//                             <Button
//                               variant="contained"
//                               onClick={handleParentNext}
//                               disabled={addParentLoading}
//                               size="small"
//                               endIcon={<NavigateNextIcon sx={{ fontSize: '1rem' }} />}
//                               sx={{
//                                 height: 32,
//                                 px: 2,
//                                 borderRadius: 1.5,
//                                 bgcolor: COLORS.primary,
//                                 fontSize: '0.7rem',
//                                 fontWeight: 500,
//                                 textTransform: 'none',
//                                 '&:hover': { bgcolor: COLORS.primaryDark }
//                               }}
//                             >
//                               Next
//                             </Button>
//                           )}
//                         </Box>
//                       </Box>
//                     </Box>
//                   </Grid>
//                 )}
                
//                 <Grid size={{ xs: 12, sm: 6 }}>
//                   <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//                     <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary }}>
//                       BOM VERSION <span style={{ color: '#EF4444' }}>*</span>
//                     </Typography>
//                     <TextField
//                       fullWidth
//                       size="small"
//                       name="bom_version"
//                       value={formData.bom_version}
//                       onChange={handleChange}
//                       placeholder="v1.0"
//                       error={!!fieldErrors.bom_version}
//                       helperText={fieldErrors.bom_version}
//                       sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5, fontSize: '0.75rem' } }}
//                     />
//                   </Box>
//                 </Grid>
                
//                 <Grid size={{ xs: 12, sm: 6 }}>
//                   <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//                     <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary }}>
//                       BOM TYPE <span style={{ color: '#EF4444' }}>*</span>
//                     </Typography>
//                     <FormControl fullWidth size="small" error={!!fieldErrors.bom_type}>
//                       <Select
//                         name="bom_type"
//                         value={formData.bom_type}
//                         onChange={handleChange}
//                         sx={{ borderRadius: 1.5, fontSize: '0.75rem' }}
//                       >
//                         {BOM_TYPE_OPTIONS.map(option => (
//                           <MenuItem key={option} value={option} sx={{ fontSize: '0.75rem' }}>
//                             {option}
//                           </MenuItem>
//                         ))}
//                       </Select>
//                     </FormControl>
//                   </Box>
//                 </Grid>

//                 <Grid size={{ xs: 12, sm: 6 }}>
//                   <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//                     <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary }}>
//                       BOM CATEGORY <span style={{ color: '#EF4444' }}>*</span>
//                     </Typography>
//                     <FormControl fullWidth size="small" error={!!fieldErrors.bom_category}>
//                       <Select
//                         name="bom_category"
//                         value={formData.bom_category}
//                         onChange={handleBomCategoryChange}
//                         sx={{ borderRadius: 1.5, fontSize: '0.75rem' }}
//                       >
//                         {BOM_CATEGORY_OPTIONS.map(option => (
//                           <MenuItem key={option} value={option} sx={{ fontSize: '0.75rem' }}>
//                             {option}
//                           </MenuItem>
//                         ))}
//                       </Select>
//                     </FormControl>
//                     <Typography sx={{ fontSize: '0.65rem', color: COLORS.text.tertiary, mt: 0.5 }}>
//                       {formData.bom_category === 'Standard' 
//                         ? '✓ Standard BOM cannot have components' 
//                         : '✓ Assembly BOM requires at least one component'}
//                     </Typography>
//                   </Box>
//                 </Grid>
                
//                 <Grid size={{ xs: 12, sm: 6 }}>
//                   <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//                     <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary }}>
//                       EFFECTIVE FROM <span style={{ color: '#EF4444' }}>*</span>
//                     </Typography>
//                     <TextField
//                       fullWidth
//                       type="date"
//                       size="small"
//                       name="effective_from"
//                       value={formData.effective_from}
//                       onChange={handleChange}
//                       error={!!fieldErrors.effective_from}
//                       helperText={fieldErrors.effective_from}
//                       sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5, fontSize: '0.75rem' } }}
//                       InputLabelProps={{ shrink: true }}
//                     />
//                   </Box>
//                 </Grid>
                
//                 <Grid size={{ xs: 12, sm: 6 }}>
//                   <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//                     <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary }}>
//                       EFFECTIVE TO
//                     </Typography>
//                     <TextField
//                       fullWidth
//                       type="date"
//                       size="small"
//                       name="effective_to"
//                       value={formData.effective_to}
//                       onChange={handleChange}
//                       sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5, fontSize: '0.75rem' } }}
//                       InputLabelProps={{ shrink: true }}
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
//             <Paper sx={{ 
//               p: 2, 
//               bgcolor: COLORS.background.white, 
//               borderRadius: 1.5, 
//               border: `1px solid ${COLORS.border}`,
//               boxShadow: 'none'
//             }}>
//               <Typography sx={{ 
//                 fontSize: '0.8rem', 
//                 fontWeight: 600, 
//                 color: COLORS.primary, 
//                 mb: 1.5 
//               }}>
//                 <ProductionIcon sx={{ fontSize: '1rem', mr: 0.5, verticalAlign: 'middle' }} />
//                 Production Parameters
//               </Typography>
              
//               <Grid container spacing={1.5}>
//                 <Grid size={{ xs: 12, sm: 6 }}>
//                   <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//                     <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary }}>
//                       Batch Size
//                     </Typography>
//                     <TextField
//                       fullWidth
//                       type="number"
//                       size="small"
//                       name="batch_size"
//                       value={formData.batch_size}
//                       onChange={handleChange}
//                       sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5, fontSize: '0.75rem' } }}
//                     />
//                   </Box>
//                 </Grid>
                
//                 <Grid size={{ xs: 12, sm: 6 }}>
//                   <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//                     <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary }}>
//                       Yield (%)
//                     </Typography>
//                     <TextField
//                       fullWidth
//                       type="number"
//                       size="small"
//                       name="yield_percent"
//                       value={formData.yield_percent}
//                       onChange={handleChange}
//                       sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5, fontSize: '0.75rem' } }}
//                     />
//                   </Box>
//                 </Grid>
                
//                 <Grid size={{ xs: 12, sm: 6 }}>
//                   <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//                     <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary }}>
//                       Setup Time (min)
//                     </Typography>
//                     <TextField
//                       fullWidth
//                       type="number"
//                       size="small"
//                       name="setup_time_min"
//                       value={formData.setup_time_min}
//                       onChange={handleChange}
//                       sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5, fontSize: '0.75rem' } }}
//                     />
//                   </Box>
//                 </Grid>
                
//                 <Grid size={{ xs: 12, sm: 6 }}>
//                   <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//                     <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary }}>
//                       Cycle Time (min)
//                     </Typography>
//                     <TextField
//                       fullWidth
//                       type="number"
//                       size="small"
//                       name="cycle_time_min"
//                       value={formData.cycle_time_min}
//                       onChange={handleChange}
//                       sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5, fontSize: '0.75rem' } }}
//                     />
//                   </Box>
//                 </Grid>
//               </Grid>
//             </Paper>
//           </Stack>
//         );
        
//       case 2:
//         return (
//           <Stack spacing={2}>
//             <Paper sx={{ 
//               p: 2, 
//               bgcolor: COLORS.background.white, 
//               borderRadius: 1.5, 
//               border: `1px solid ${COLORS.border}`,
//               boxShadow: 'none'
//             }}>
//               <Typography sx={{ 
//                 fontSize: '0.8rem', 
//                 fontWeight: 600, 
//                 color: COLORS.primary, 
//                 mb: 1.5 
//               }}>
//                 <InventoryIcon sx={{ fontSize: '1rem', mr: 0.5, verticalAlign: 'middle' }} />
//                 Components <span style={{ color: '#EF4444' }}>*</span>
//               </Typography>
              
//               {formData.bom_category === 'Standard' && (
//                 <Alert severity="info" sx={{ mb: 2, borderRadius: 1.5, fontSize: '0.75rem' }}>
//                   Standard BOM cannot have components. Components are disabled. Change BOM Category to "Assembly" to add components.
//                 </Alert>
//               )}
              
//               {components.map((component, index) => (
//                 <Paper
//                   key={index}
//                   sx={{
//                     p: 2,
//                     mb: 2,
//                     bgcolor: formData.bom_category === 'Standard' ? '#f5f5f5' : COLORS.background.light,
//                     borderRadius: 1.5,
//                     border: `1px solid ${COLORS.border}`,
//                     opacity: formData.bom_category === 'Standard' ? 0.7 : 1,
//                     pointerEvents: formData.bom_category === 'Standard' ? 'none' : 'auto'
//                   }}
//                 >
//                   <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.5 }}>
//                     <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary }}>
//                       Component {index + 1}
//                     </Typography>
//                     {components.length > 1 && formData.bom_category === 'Assembly' && (
//                       <IconButton
//                         size="small"
//                         onClick={() => removeComponent(index)}
//                         sx={{ color: '#EF4444' }}
//                       >
//                         <DeleteIcon fontSize="small" />
//                       </IconButton>
//                     )}
//                   </Stack>
                  
//                   <Grid container spacing={1.5}>
//                     <Grid size={{ xs: 12 }}>
//                       <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//                         <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary }}>
//                           COMPONENT ITEM <span style={{ color: '#EF4444' }}>*</span>
//                         </Typography>
//                         <Autocomplete
//                           fullWidth
//                           options={componentItems}
//                           getOptionLabel={(option) => `${option.part_no} - ${option.part_description}`}
//                           value={componentItems.find(item => item._id === component.component_item_id) || null}
//                           onChange={(event, newValue) => handleComponentChange(index, 'component_item_id', newValue?._id || '')}
//                           loading={loadingItems}
//                           disabled={formData.bom_category === 'Standard'}
//                           renderInput={(params) => (
//                             <TextField
//                               {...params}
//                               size="small"
//                               error={!!fieldErrors[`comp_${index}_component_item_id`]}
//                               helperText={fieldErrors[`comp_${index}_component_item_id`]}
//                               sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5, fontSize: '0.75rem' } }}
//                             />
//                           )}
//                         />
//                       </Box>
//                     </Grid>
                    
//                     <Grid size={{ xs: 6, sm: 3 }}>
//                       <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//                         <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary }}>
//                           QUANTITY PER <span style={{ color: '#EF4444' }}>*</span>
//                         </Typography>
//                         <TextField
//                           fullWidth
//                           type="number"
//                           size="small"
//                           value={component.quantity_per}
//                           onChange={(e) => handleComponentChange(index, 'quantity_per', e.target.value)}
//                           error={!!fieldErrors[`comp_${index}_quantity_per`]}
//                           helperText={fieldErrors[`comp_${index}_quantity_per`]}
//                           disabled={formData.bom_category === 'Standard'}
//                           sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5, fontSize: '0.75rem' } }}
//                         />
//                       </Box>
//                     </Grid>
                    
//                     <Grid size={{ xs: 6, sm: 2 }}>
//                       <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//                         <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary }}>
//                           UNIT
//                         </Typography>
//                         <FormControl fullWidth size="small">
//                           <Select
//                             value={component.unit}
//                             onChange={(e) => handleComponentChange(index, 'unit', e.target.value)}
//                             disabled={formData.bom_category === 'Standard'}
//                             sx={{ borderRadius: 1.5, fontSize: '0.75rem' }}
//                           >
//                             {UNIT_OPTIONS.map(option => (
//                               <MenuItem key={option} value={option} sx={{ fontSize: '0.75rem' }}>
//                                 {option}
//                               </MenuItem>
//                             ))}
//                           </Select>
//                         </FormControl>
//                       </Box>
//                     </Grid>
                    
//                     <Grid size={{ xs: 6, sm: 2 }}>
//                       <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//                         <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary }}>
//                           SCRAP %
//                         </Typography>
//                         <TextField
//                           fullWidth
//                           type="number"
//                           size="small"
//                           value={component.scrap_percent}
//                           onChange={(e) => handleComponentChange(index, 'scrap_percent', e.target.value)}
//                           disabled={formData.bom_category === 'Standard'}
//                           sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5, fontSize: '0.75rem' } }}
//                         />
//                       </Box>
//                     </Grid>
                    
//                     <Grid size={{ xs: 12, sm: 5 }}>
//                       <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//                         <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary }}>
//                           REFERENCE DESIGNATOR
//                         </Typography>
//                         <TextField
//                           fullWidth
//                           size="small"
//                           value={component.reference_designator}
//                           onChange={(e) => handleComponentChange(index, 'reference_designator', e.target.value)}
//                           placeholder="e.g., R1, C2, U3"
//                           disabled={formData.bom_category === 'Standard'}
//                           sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5, fontSize: '0.75rem' } }}
//                         />
//                       </Box>
//                     </Grid>
                    
//                     <Grid size={{ xs: 12, sm: 7 }}>
//                       <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//                         <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary }}>
//                           REMARKS
//                         </Typography>
//                         <TextField
//                           fullWidth
//                           size="small"
//                           value={component.remarks}
//                           onChange={(e) => handleComponentChange(index, 'remarks', e.target.value)}
//                           placeholder="Additional notes..."
//                           disabled={formData.bom_category === 'Standard'}
//                           sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5, fontSize: '0.75rem' } }}
//                         />
//                       </Box>
//                     </Grid>
//                   </Grid>
//                 </Paper>
//               ))}
              
//               <Button
//                 variant="outlined"
//                 startIcon={<AddIcon sx={{ fontSize: '1rem' }} />}
//                 onClick={addComponent}
//                 disabled={formData.bom_category === 'Standard'}
//                 sx={{
//                   height: 32,
//                   px: 2,
//                   borderRadius: 1.5,
//                   border: `1px solid ${COLORS.border}`,
//                   color: formData.bom_category === 'Standard' ? COLORS.text.tertiary : COLORS.text.secondary,
//                   fontSize: '0.7rem',
//                   fontWeight: 500,
//                   textTransform: 'none',
//                   '&:hover': {
//                     borderColor: formData.bom_category === 'Standard' ? COLORS.border : COLORS.primary,
//                     bgcolor: formData.bom_category === 'Standard' ? 'transparent' : `${COLORS.primary}10`
//                   }
//                 }}
//               >
//                 Add Component
//               </Button>
//             </Paper>
//           </Stack>
//         );
        
//       case 3:
//         return (
//           <Stack spacing={2}>
//             <Paper sx={{ 
//               p: 2, 
//               bgcolor: COLORS.background.white, 
//               borderRadius: 1.5, 
//               border: `1px solid ${COLORS.border}`,
//               boxShadow: 'none'
//             }}>
//               <Typography sx={{ 
//                 fontSize: '0.8rem', 
//                 fontWeight: 600, 
//                 color: COLORS.primary, 
//                 mb: 1.5 
//               }}>
//                 <InfoIcon sx={{ fontSize: '1rem', mr: 0.5, verticalAlign: 'middle' }} />
//                 Review & Submit
//               </Typography>
              
//               <Stack spacing={2}>
//                 <Paper sx={{ p: 2, bgcolor: COLORS.background.light, borderRadius: 1.5 }}>
//                   <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: COLORS.primary, mb: 1 }}>
//                     Basic Information
//                   </Typography>
//                   <Grid container spacing={1}>
//                     <Grid size={{ xs: 6 }}>
//                       <Typography sx={{ fontSize: '0.7rem', color: COLORS.text.secondary }}>Parent Item:</Typography>
//                     </Grid>
//                     <Grid size={{ xs: 6 }}>
//                       <Typography sx={{ fontSize: '0.7rem', fontWeight: 500 }}>
//                         {parentItems.find(item => item._id === formData.parent_item_id)?.part_no || '-'}
//                       </Typography>
//                     </Grid>
//                     <Grid size={{ xs: 6 }}>
//                       <Typography sx={{ fontSize: '0.7rem', color: COLORS.text.secondary }}>BOM Version:</Typography>
//                     </Grid>
//                     <Grid size={{ xs: 6 }}>
//                       <Typography sx={{ fontSize: '0.7rem', fontWeight: 500 }}>{formData.bom_version}</Typography>
//                     </Grid>
//                     <Grid size={{ xs: 6 }}>
//                       <Typography sx={{ fontSize: '0.7rem', color: COLORS.text.secondary }}>BOM Type:</Typography>
//                     </Grid>
//                     <Grid size={{ xs: 6 }}>
//                       <Typography sx={{ fontSize: '0.7rem', fontWeight: 500 }}>{formData.bom_type}</Typography>
//                     </Grid>
//                     <Grid size={{ xs: 6 }}>
//                       <Typography sx={{ fontSize: '0.7rem', color: COLORS.text.secondary }}>BOM Category:</Typography>
//                     </Grid>
//                     <Grid size={{ xs: 6 }}>
//                       <Typography sx={{ fontSize: '0.7rem', fontWeight: 500 }}>{formData.bom_category}</Typography>
//                     </Grid>
//                     <Grid size={{ xs: 6 }}>
//                       <Typography sx={{ fontSize: '0.7rem', color: COLORS.text.secondary }}>Status:</Typography>
//                     </Grid>
//                     <Grid size={{ xs: 6 }}>
//                       <Typography sx={{ fontSize: '0.7rem', fontWeight: 500 }}>{formData.status}</Typography>
//                     </Grid>
//                     <Grid size={{ xs: 6 }}>
//                       <Typography sx={{ fontSize: '0.7rem', color: COLORS.text.secondary }}>Effective From:</Typography>
//                     </Grid>
//                     <Grid size={{ xs: 6 }}>
//                       <Typography sx={{ fontSize: '0.7rem', fontWeight: 500 }}>{formData.effective_from}</Typography>
//                     </Grid>
//                     {formData.effective_to && (
//                       <>
//                         <Grid size={{ xs: 6 }}>
//                           <Typography sx={{ fontSize: '0.7rem', color: COLORS.text.secondary }}>Effective To:</Typography>
//                         </Grid>
//                         <Grid size={{ xs: 6 }}>
//                           <Typography sx={{ fontSize: '0.7rem', fontWeight: 500 }}>{formData.effective_to}</Typography>
//                         </Grid>
//                       </>
//                     )}
//                   </Grid>
//                 </Paper>
                
//                 <Paper sx={{ p: 2, bgcolor: COLORS.background.light, borderRadius: 1.5 }}>
//                   <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: COLORS.primary, mb: 1 }}>
//                     Production Parameters
//                   </Typography>
//                   <Grid container spacing={1}>
//                     <Grid size={{ xs: 6 }}>
//                       <Typography sx={{ fontSize: '0.7rem', color: COLORS.text.secondary }}>Batch Size:</Typography>
//                     </Grid>
//                     <Grid size={{ xs: 6 }}>
//                       <Typography sx={{ fontSize: '0.7rem', fontWeight: 500 }}>{formData.batch_size}</Typography>
//                     </Grid>
//                     <Grid size={{ xs: 6 }}>
//                       <Typography sx={{ fontSize: '0.7rem', color: COLORS.text.secondary }}>Yield:</Typography>
//                     </Grid>
//                     <Grid size={{ xs: 6 }}>
//                       <Typography sx={{ fontSize: '0.7rem', fontWeight: 500 }}>{formData.yield_percent}%</Typography>
//                     </Grid>
//                     <Grid size={{ xs: 6 }}>
//                       <Typography sx={{ fontSize: '0.7rem', color: COLORS.text.secondary }}>Setup Time:</Typography>
//                     </Grid>
//                     <Grid size={{ xs: 6 }}>
//                       <Typography sx={{ fontSize: '0.7rem', fontWeight: 500 }}>{formData.setup_time_min} min</Typography>
//                     </Grid>
//                     <Grid size={{ xs: 6 }}>
//                       <Typography sx={{ fontSize: '0.7rem', color: COLORS.text.secondary }}>Cycle Time:</Typography>
//                     </Grid>
//                     <Grid size={{ xs: 6 }}>
//                       <Typography sx={{ fontSize: '0.7rem', fontWeight: 500 }}>{formData.cycle_time_min} min</Typography>
//                     </Grid>
//                   </Grid>
//                 </Paper>
                
//                 <Paper sx={{ p: 2, bgcolor: COLORS.background.light, borderRadius: 1.5 }}>
//                   <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: COLORS.primary, mb: 1 }}>
//                     Components ({components.filter(c => c.component_item_id).length})
//                   </Typography>
//                   {components.filter(c => c.component_item_id).length > 0 ? (
//                     components.map((comp, idx) => (
//                       comp.component_item_id && (
//                         <Box key={idx} sx={{ mb: 1, pb: 1, borderBottom: idx < components.length - 1 ? `1px solid ${COLORS.border}` : 'none' }}>
//                           <Typography sx={{ fontSize: '0.7rem', fontWeight: 500 }}>
//                             {comp.component_part_no || 'Not selected'}
//                           </Typography>
//                           <Typography sx={{ fontSize: '0.65rem', color: COLORS.text.secondary }}>
//                             Qty: {comp.quantity_per} {comp.unit} | Scrap: {comp.scrap_percent}%
//                           </Typography>
//                         </Box>
//                       )
//                     ))
//                   ) : (
//                     <Typography sx={{ fontSize: '0.7rem', color: COLORS.text.tertiary }}>
//                       No components added {formData.bom_category === 'Standard' ? '(Standard BOM)' : ''}
//                     </Typography>
//                   )}
//                 </Paper>
//               </Stack>
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
//           borderRadius: 2,
//           boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05)',
//           border: `1px solid ${COLORS.border}`,
//           overflow: 'hidden',
//           maxHeight: '90vh',
//           display: 'flex',
//           flexDirection: 'column'
//         }
//       }}
//       BackdropProps={{
//         sx: {
//           backgroundColor: 'rgba(0, 0, 0, 0.5)',
//         }
//       }}
//     >
//       <DialogTitle sx={{
//         borderBottom: `1px solid ${COLORS.border}`,
//         py: 1.5,
//         px: 2.5,
//         bgcolor: COLORS.background.white,
//         display: 'flex',
//         justifyContent: 'space-between',
//         alignItems: 'center',
//         flexShrink: 0
//       }}>
//         <Typography sx={{ fontSize: '1.2rem', fontWeight: 700, color: COLORS.text.primary }}>
//           Add New BOM
//         </Typography>
//         <IconButton onClick={handleClose} size="small">
//           <CloseIcon fontSize="small" />
//         </IconButton>
//       </DialogTitle>
      
//       <Box sx={{ px: 2.5, pt: 2, bgcolor: COLORS.background.white, flexShrink: 0 }}>
//         <Stepper
//           activeStep={activeStep}
//           alternativeLabel
//           connector={<ColorConnector />}
//         >
//           {MAIN_STEPS.map((label) => (
//             <Step key={label}>
//               <StepLabel>
//                 <Typography sx={{ fontSize: '0.75rem', fontWeight: 500, color: COLORS.text.secondary }}>
//                   {label}
//                 </Typography>
//               </StepLabel>
//             </Step>
//           ))}
//         </Stepper>
//       </Box>
      
//       <DialogContent sx={{ 
//         p: 2.5, 
//         bgcolor: COLORS.background.white,
//         flex: 1,
//         overflowY: 'auto',
//         '&::-webkit-scrollbar': {
//           width: '6px',
//         },
//         '&::-webkit-scrollbar-track': {
//           background: '#f1f1f1',
//           borderRadius: '3px',
//         },
//         '&::-webkit-scrollbar-thumb': {
//           background: '#c1c1c1',
//           borderRadius: '3px',
//         },
//         '&::-webkit-scrollbar-thumb:hover': {
//           background: '#a8a8a8',
//         }
//       }}>
//         {renderStepContent(activeStep)}
        
//         {error && (
//           <Alert 
//             severity={error.includes('Warning') || error.includes('Components cleared') ? 'warning' : 'error'} 
//             sx={{ 
//               mt: 2, 
//               borderRadius: 1.5,
//               fontSize: '0.75rem',
//               py: 0.5
//             }}
//           >
//             <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.75rem' }}>
//               {error.includes('Warning') || error.includes('Components cleared') ? 'Warning' : 'Validation Error'}
//             </Typography>
//             <Typography variant="body2" sx={{ fontSize: '0.7rem', whiteSpace: 'pre-wrap' }}>
//               {error}
//             </Typography>
//           </Alert>
//         )}
//       </DialogContent>
      
//       <DialogActions sx={{
//         px: 2.5,
//         py: 1.5,
//         borderTop: `1px solid ${COLORS.border}`,
//         bgcolor: COLORS.background.white,
//         justifyContent: 'space-between',
//         flexShrink: 0
//       }}>
//         <Button
//           onClick={handleBack}
//           disabled={activeStep === 0 || loading}
//           size="small"
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
//         <Box>
//           <Button
//             onClick={handleClose}
//             disabled={loading}
//             size="small"
//             sx={{
//               height: 32,
//               px: 2,
//               mr: 1,
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
//           {activeStep === MAIN_STEPS.length - 1 ? (
//             <Button
//               variant="contained"
//               onClick={handleSubmit}
//               disabled={loading}
//               size="small"
//               startIcon={<AddIcon sx={{ fontSize: '1rem' }} />}
//               sx={{
//                 height: 32,
//                 px: 2,
//                 borderRadius: 1.5,
//                 bgcolor: COLORS.primary,
//                 fontSize: '0.7rem',
//                 fontWeight: 500,
//                 textTransform: 'none',
//                 '&:hover': { bgcolor: COLORS.primaryDark }
//               }}
//             >
//               {loading ? 'Adding...' : 'Add BOM'}
//             </Button>
//           ) : (
//             <Button
//               variant="contained"
//               onClick={handleNext}
//               disabled={loading}
//               size="small"
//               endIcon={<NavigateNextIcon sx={{ fontSize: '1rem' }} />}
//               sx={{
//                 height: 32,
//                 px: 2,
//                 borderRadius: 1.5,
//                 bgcolor: COLORS.primary,
//                 fontSize: '0.7rem',
//                 fontWeight: 500,
//                 textTransform: 'none',
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

// export default AddBom;


// import React, { useState, useEffect, useCallback } from 'react';
// import {
//   Box,
//   Dialog,
//   DialogTitle,
//   DialogContent,
//   DialogActions,
//   TextField,
//   Typography,
//   Button,
//   Stack,
//   Grid,
//   Paper,
//   IconButton,
//   Autocomplete,
//   FormControl,
//   Select,
//   MenuItem,
//   Alert,
//   Stepper,
//   Step,
//   StepLabel,
//   StepConnector,
//   stepConnectorClasses,
//   styled,
//   Divider,
//   InputAdornment,
//   Chip
// } from '@mui/material';
// import {
//   Add as AddIcon,
//   Delete as DeleteIcon,
//   Close as CloseIcon,
//   Inventory as InventoryIcon,
//   ProductionQuantityLimits as ProductionIcon,
//   Info as InfoIcon,
//   NavigateNext as NavigateNextIcon,
//   NavigateBefore as NavigateBeforeIcon,
//   Search as SearchIcon
// } from '@mui/icons-material';
// import axios from 'axios';
// import BASE_URL from '../../../../config/Config';

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
//     light: '#F8FFFC',
//     hover: '#F0FDF9'
//   },
//   border: '#E3E8EF'
// };

// // Enums
// const BOM_TYPE_OPTIONS = ['Manufacturing', 'Subcontract', 'Phantom', 'Variant'];
// const STATUS_OPTIONS = ['Pending', 'Active', 'Approved', 'Cancelled', 'Archived'];
// const UNIT_OPTIONS = ['Nos', 'Kg', 'Meter', 'Set', 'Piece', 'Sheet', 'Roll'];
// const BOM_CATEGORY_OPTIONS = ['Standard', 'Assembly'];
// const ITEM_CATEGORY_OPTIONS = ['Raw Material', 'Semi-Finished', 'Finished', 'Spare Part'];
// const ITEM_TYPE_OPTIONS = ['Busbar', 'Stamping', 'Gasket', 'Tooling', 'Copper Strip', 'Aluminium Profile', 'Rubber Sheet', 'Cork', 'Other'];
// const PROCUREMENT_TYPE_OPTIONS = ['Purchase', 'Manufacture', 'Subcontract', 'Free Issue'];

// // Parent Item Stepper Steps
// const PARENT_ITEM_STEPS = ['Basic Info', 'Material & Drawing', 'Dimensions & Parameters', 'Rates & Inventory'];

// const MAIN_STEPS = ['Basic Information', 'Production Parameters', 'Components', 'Review & Submit'];

// // Custom Stepper Connector
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

// // Custom Paper for dropdowns
// const CustomPaper = styled(Paper)({
//   maxHeight: 200,
//   overflow: 'auto',
//   '&::-webkit-scrollbar': {
//     display: 'none'
//   },
//   scrollbarWidth: 'none',
//   '-ms-overflow-style': 'none'
// });

// const AddBom = ({ open, onClose, onAdd }) => {
//   const [activeStep, setActiveStep] = useState(0);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState('');
//   const [fieldErrors, setFieldErrors] = useState({});
  
//   // Data from APIs
//   const [parentItems, setParentItems] = useState([]);
//   const [componentItems, setComponentItems] = useState([]);
//   const [loadingItems, setLoadingItems] = useState(false);
  
//   // Add Parent Item form state (inline within dialog)
//   const [showAddParentForm, setShowAddParentForm] = useState(false);
//   const [parentActiveStep, setParentActiveStep] = useState(0);
//   const [addParentLoading, setAddParentLoading] = useState(false);
//   const [addParentError, setAddParentError] = useState('');
//   const [parentFieldErrors, setParentFieldErrors] = useState({});
//   const [parentTouched, setParentTouched] = useState({});
  
//   // Parent item fields – aligned with API response
//   const [newParentData, setNewParentData] = useState({
//     // Basic Info
//     part_no: '',
//     part_name: '',
//     item_category: '',
//     item_type: '',
//     unit: 'Kg',
//     part_description: '',
//     weight_per_unit_kg: '',
    
//     // Material & Drawing
//     material: '',
//     material_grade: '',
//     material_standard: '',
//     material_color: '',
//     density: '',
//     drawing_no: '',
//     revision_no: '',
    
//     // Dimensions & Parameters
//     thickness: '',
//     width: '',
//     strip_size: '',
//     pitch: '',
//     no_of_cavity: 1,
    
//     // Rates & Inventory
//     hsn_code: '',
//     gst_percentage: 18,
//     procurement_type: 'Purchase',
//     rm_rejection_percent: 2,
//     scrap_realisation_percent: 85,
//     lead_time_days: '',
//     reorder_level: '',
//     reorder_qty: '',
//     safety_stock: '',
//     min_stock: '',
//     max_stock: '',
//     shelf_life_days: ''
//   });
  
//   // Form data
//   const [formData, setFormData] = useState({
//     parent_item_id: '',
//     bom_version: 'v1.0',
//     bom_type: 'Manufacturing',
//     status: 'Pending',
//     batch_size: 1,
//     yield_percent: 100,
//     setup_time_min: 30,
//     cycle_time_min: 5.5,
//     effective_from: new Date().toISOString().split('T')[0],
//     effective_to: '',
//     created_by: localStorage.getItem('userId') || '',
//     bom_category: 'Standard'
//   });
  
//   const [components, setComponents] = useState([
//     {
//       level: 1,
//       component_item_id: '',
//       component_part_no: '',
//       component_desc: '',
//       quantity_per: 1,
//       unit: 'Nos',
//       scrap_percent: 0,
//       is_phantom: false,
//       is_subcontract: false,
//       subcontract_vendor: null,
//       reference_designator: '',
//       remarks: ''
//     }
//   ]);

//   // Options for dropdowns
//   const materialOptions = ['Steel', 'Copper', 'Aluminium', 'Brass', 'Stainless Steel', 'Plastic', 'Other'];

//   // Fetch parent items (item_role = 'parent')
//   const fetchParentItems = useCallback(async () => {
//     try {
//       setLoadingItems(true);
//       const token = localStorage.getItem('token');
//       const response = await axios.get(`${BASE_URL}/api/items`, {
//         headers: { 'Authorization': `Bearer ${token}` }
//       });
      
//       if (response.data.success) {
//         const parents = response.data.data.filter(item => item.item_role === 'parent');
//         setParentItems(parents);
//       }
//     } catch (err) {
//       console.error('Error fetching parent items:', err);
//     } finally {
//       setLoadingItems(false);
//     }
//   }, []);
  
//   // Fetch component items (item_role = 'component')
//   const fetchComponentItems = useCallback(async () => {
//     try {
//       const token = localStorage.getItem('token');
//       const response = await axios.get(`${BASE_URL}/api/items`, {
//         headers: { 'Authorization': `Bearer ${token}` }
//       });
      
//       if (response.data.success) {
//         const components = response.data.data.filter(item => item.item_role === 'component');
//         setComponentItems(components);
//       }
//     } catch (err) {
//       console.error('Error fetching component items:', err);
//     }
//   }, []);
  
//   useEffect(() => {
//     if (open) {
//       fetchParentItems();
//       fetchComponentItems();
//     }
//   }, [open, fetchParentItems, fetchComponentItems]);

//   // Handle parent item form changes
//   const handleParentFormChange = (e) => {
//     const { name, value } = e.target;
//     setNewParentData(prev => ({
//       ...prev,
//       [name]: value
//     }));
//     setAddParentError('');
//     if (parentTouched[name]) {
//       setParentFieldErrors(prev => ({ ...prev, [name]: '' }));
//     }
//   };

//   const handleParentBlur = (e) => {
//     const { name } = e.target;
//     setParentTouched(prev => ({ ...prev, [name]: true }));
//   };

//   const validateParentStep = (step) => {
//     const errors = {};
//     let isValid = true;

//     switch (step) {
//       case 0: // Basic Info
//         if (!newParentData.part_no.trim()) {
//           errors.part_no = 'Part Number is required';
//           isValid = false;
//         }
//         if (!newParentData.part_name.trim()) {
//           errors.part_name = 'Part Name is required';
//           isValid = false;
//         }
//         if (!newParentData.item_category) {
//           errors.item_category = 'Item Category is required';
//           isValid = false;
//         }
//         if (!newParentData.item_type) {
//           errors.item_type = 'Item Type is required';
//           isValid = false;
//         }
//         if (!newParentData.unit) {
//           errors.unit = 'Unit is required';
//           isValid = false;
//         }
//         if (newParentData.unit !== 'Kg' && !newParentData.weight_per_unit_kg) {
//           errors.weight_per_unit_kg = 'Weight per unit is required when unit is not Kg';
//           isValid = false;
//         }
//         break;

//       case 1: // Material & Drawing
//         if (!newParentData.density) {
//           errors.density = 'Density is required';
//           isValid = false;
//         }
//         if (!newParentData.drawing_no) {
//           errors.drawing_no = 'Drawing No is required';
//           isValid = false;
//         }
//         break;

//       case 2: // Dimensions & Parameters
//         // All optional, but we can validate numeric fields
//         if (newParentData.thickness && isNaN(newParentData.thickness)) {
//           errors.thickness = 'Thickness must be a number';
//           isValid = false;
//         }
//         if (newParentData.width && isNaN(newParentData.width)) {
//           errors.width = 'Width must be a number';
//           isValid = false;
//         }
//         if (newParentData.strip_size && isNaN(newParentData.strip_size)) {
//           errors.strip_size = 'Strip size must be a number';
//           isValid = false;
//         }
//         break;

//       case 3: // Rates & Inventory
//         if (!newParentData.hsn_code) {
//           errors.hsn_code = 'HSN Code is required';
//           isValid = false;
//         }
//         if (!newParentData.procurement_type) {
//           errors.procurement_type = 'Procurement type is required';
//           isValid = false;
//         }
//         break;

//       default:
//         return true;
//     }

//     setParentFieldErrors(errors);
//     if (!isValid) {
//       setAddParentError('Please fix the errors in this section');
//     }
//     return isValid;
//   };

//   const handleParentNext = () => {
//     if (validateParentStep(parentActiveStep)) {
//       setAddParentError('');
//       setParentActiveStep(prev => prev + 1);
//     }
//   };

//   const handleParentBack = () => {
//     setAddParentError('');
//     setParentActiveStep(prev => prev - 1);
//   };

//   // Handle add parent item submit (called when user clicks "Add Item" in the last step)
//   const handleAddParentSubmit = async () => {
//     // Validate all steps
//     let allValid = true;
//     for (let i = 0; i < 4; i++) {
//       if (!validateParentStep(i)) {
//         allValid = false;
//         setParentActiveStep(i);
//         break;
//       }
//     }

//     if (!allValid) {
//       setAddParentError('Please fix all validation errors');
//       return;
//     }

//     setAddParentLoading(true);
//     setAddParentError('');

//     try {
//       const token = localStorage.getItem('token');
      
//       // Build payload matching API fields
//       const payload = {
//         part_no: newParentData.part_no,
//         part_name: newParentData.part_name,
//         part_description: newParentData.part_description || '',
//         item_category: newParentData.item_category,
//         item_type: newParentData.item_type,
//         unit: newParentData.unit,
//         weight_per_unit_kg: newParentData.weight_per_unit_kg ? Number(newParentData.weight_per_unit_kg) : undefined,
//         material: newParentData.material || '',
//         material_grade: newParentData.material_grade || '',
//         material_standard: newParentData.material_standard || '',
//         material_color: newParentData.material_color || '',
//         density: newParentData.density ? Number(newParentData.density) : 0,
//         drawing_no: newParentData.drawing_no || '',
//         revision_no: newParentData.revision_no || '0',
//         thickness: newParentData.thickness ? Number(newParentData.thickness) : undefined,
//         width: newParentData.width ? Number(newParentData.width) : undefined,
//         strip_size: newParentData.strip_size ? Number(newParentData.strip_size) : undefined,
//         pitch: newParentData.pitch ? Number(newParentData.pitch) : undefined,
//         no_of_cavity: newParentData.no_of_cavity ? Number(newParentData.no_of_cavity) : 1,
//         hsn_code: newParentData.hsn_code || '',
//         gst_percentage: newParentData.gst_percentage ? Number(newParentData.gst_percentage) : 18,
//         procurement_type: newParentData.procurement_type || 'Purchase',
//         rm_rejection_percent: newParentData.rm_rejection_percent ? Number(newParentData.rm_rejection_percent) : 2,
//         scrap_realisation_percent: newParentData.scrap_realisation_percent ? Number(newParentData.scrap_realisation_percent) : 85,
//         lead_time_days: newParentData.lead_time_days ? Number(newParentData.lead_time_days) : undefined,
//         reorder_level: newParentData.reorder_level ? Number(newParentData.reorder_level) : undefined,
//         reorder_qty: newParentData.reorder_qty ? Number(newParentData.reorder_qty) : undefined,
//         safety_stock: newParentData.safety_stock ? Number(newParentData.safety_stock) : undefined,
//         min_stock: newParentData.min_stock ? Number(newParentData.min_stock) : undefined,
//         max_stock: newParentData.max_stock ? Number(newParentData.max_stock) : undefined,
//         shelf_life_days: newParentData.shelf_life_days ? Number(newParentData.shelf_life_days) : undefined,
//         item_role: 'parent'
//       };

//       // Remove undefined fields
//       Object.keys(payload).forEach(key => {
//         if (payload[key] === undefined || payload[key] === null || payload[key] === '') {
//           delete payload[key];
//         }
//       });

//       const response = await axios.post(`${BASE_URL}/api/items`, payload, {
//         headers: {
//           'Authorization': `Bearer ${token}`,
//           'Content-Type': 'application/json'
//         }
//       });

//       if (response.data.success) {
//         const newItem = response.data.data;
//         // Add to parent items list
//         setParentItems(prev => [...prev, newItem]);
//         // Auto-select the new item
//         setFormData(prev => ({ ...prev, parent_item_id: newItem._id }));
//         // Close the add form
//         setShowAddParentForm(false);
//         // Reset form
//         resetParentFormData();
//         // Clear error
//         setFieldErrors(prev => ({ ...prev, parent_item_id: '' }));
//       } else {
//         setAddParentError(response.data.message || 'Failed to add item');
//       }
//     } catch (err) {
//       console.error('Error adding item:', err);
//       setAddParentError(err.response?.data?.message || 'Failed to add item. Please try again.');
//     } finally {
//       setAddParentLoading(false);
//     }
//   };

//   // Helper to reset parent form data
//   const resetParentFormData = () => {
//     setNewParentData({
//       part_no: '',
//       part_name: '',
//       item_category: '',
//       item_type: '',
//       unit: 'Kg',
//       part_description: '',
//       weight_per_unit_kg: '',
//       material: '',
//       material_grade: '',
//       material_standard: '',
//       material_color: '',
//       density: '',
//       drawing_no: '',
//       revision_no: '',
//       thickness: '',
//       width: '',
//       strip_size: '',
//       pitch: '',
//       no_of_cavity: 1,
//       hsn_code: '',
//       gst_percentage: 18,
//       procurement_type: 'Purchase',
//       rm_rejection_percent: 2,
//       scrap_realisation_percent: 85,
//       lead_time_days: '',
//       reorder_level: '',
//       reorder_qty: '',
//       safety_stock: '',
//       min_stock: '',
//       max_stock: '',
//       shelf_life_days: ''
//     });
//     setParentActiveStep(0);
//     setParentFieldErrors({});
//     setParentTouched({});
//     setAddParentError('');
//   };

//   // Render parent item step content
//   const renderParentStepContent = (step) => {
//     switch (step) {
//       case 0: // Basic Info
//         return (
//           <Grid container spacing={1.5}>
//             <Grid size={{ xs: 12, sm: 6 }}>
//               <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//                 <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary }}>
//                   PART NUMBER <span style={{ color: '#EF4444' }}>*</span>
//                 </Typography>
//                 <TextField
//                   fullWidth
//                   size="small"
//                   name="part_no"
//                   value={newParentData.part_no}
//                   onChange={handleParentFormChange}
//                   onBlur={handleParentBlur}
//                   placeholder="e.g., BR-001"
//                   disabled={addParentLoading}
//                   error={!!parentFieldErrors.part_no}
//                   helperText={parentFieldErrors.part_no}
//                   sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5, fontSize: '0.75rem' } }}
//                 />
//               </Box>
//             </Grid>
//             <Grid size={{ xs: 12, sm: 6 }}>
//               <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//                 <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary }}>
//                   PART NAME <span style={{ color: '#EF4444' }}>*</span>
//                 </Typography>
//                 <TextField
//                   fullWidth
//                   size="small"
//                   name="part_name"
//                   value={newParentData.part_name}
//                   onChange={handleParentFormChange}
//                   onBlur={handleParentBlur}
//                   placeholder="e.g., Copper Busbar 100x10mm"
//                   disabled={addParentLoading}
//                   error={!!parentFieldErrors.part_name}
//                   helperText={parentFieldErrors.part_name}
//                   sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5, fontSize: '0.75rem' } }}
//                 />
//               </Box>
//             </Grid>
//             <Grid size={{ xs: 12, sm: 6 }}>
//               <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//                 <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary }}>
//                   ITEM CATEGORY <span style={{ color: '#EF4444' }}>*</span>
//                 </Typography>
//                 <FormControl fullWidth size="small" error={!!parentFieldErrors.item_category}>
//                   <Select
//                     name="item_category"
//                     value={newParentData.item_category}
//                     onChange={handleParentFormChange}
//                     onBlur={handleParentBlur}
//                     disabled={addParentLoading}
//                     displayEmpty
//                     sx={{ borderRadius: 1.5, fontSize: '0.75rem' }}
//                   >
//                     <MenuItem value="" sx={{ fontSize: '0.75rem', color: COLORS.text.tertiary }}>Select category</MenuItem>
//                     {ITEM_CATEGORY_OPTIONS.map(option => (
//                       <MenuItem key={option} value={option} sx={{ fontSize: '0.75rem' }}>{option}</MenuItem>
//                     ))}
//                   </Select>
//                   {parentFieldErrors.item_category && (
//                     <Typography sx={{ fontSize: '0.65rem', color: '#EF4444' }}>{parentFieldErrors.item_category}</Typography>
//                   )}
//                 </FormControl>
//               </Box>
//             </Grid>
//             <Grid size={{ xs: 12, sm: 6 }}>
//               <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//                 <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary }}>
//                   ITEM TYPE <span style={{ color: '#EF4444' }}>*</span>
//                 </Typography>
//                 <FormControl fullWidth size="small" error={!!parentFieldErrors.item_type}>
//                   <Select
//                     name="item_type"
//                     value={newParentData.item_type}
//                     onChange={handleParentFormChange}
//                     onBlur={handleParentBlur}
//                     disabled={addParentLoading}
//                     displayEmpty
//                     sx={{ borderRadius: 1.5, fontSize: '0.75rem' }}
//                   >
//                     <MenuItem value="" sx={{ fontSize: '0.75rem', color: COLORS.text.tertiary }}>Select type</MenuItem>
//                     {ITEM_TYPE_OPTIONS.map(option => (
//                       <MenuItem key={option} value={option} sx={{ fontSize: '0.75rem' }}>{option}</MenuItem>
//                     ))}
//                   </Select>
//                   {parentFieldErrors.item_type && (
//                     <Typography sx={{ fontSize: '0.65rem', color: '#EF4444' }}>{parentFieldErrors.item_type}</Typography>
//                   )}
//                 </FormControl>
//               </Box>
//             </Grid>
//             <Grid size={{ xs: 12, sm: 6 }}>
//               <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//                 <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary }}>
//                   UNIT <span style={{ color: '#EF4444' }}>*</span>
//                 </Typography>
//                 <FormControl fullWidth size="small" error={!!parentFieldErrors.unit}>
//                   <Select
//                     name="unit"
//                     value={newParentData.unit}
//                     onChange={handleParentFormChange}
//                     onBlur={handleParentBlur}
//                     disabled={addParentLoading}
//                     sx={{ borderRadius: 1.5, fontSize: '0.75rem' }}
//                   >
//                     {UNIT_OPTIONS.map(option => (
//                       <MenuItem key={option} value={option} sx={{ fontSize: '0.75rem' }}>{option}</MenuItem>
//                     ))}
//                   </Select>
//                   {parentFieldErrors.unit && (
//                     <Typography sx={{ fontSize: '0.65rem', color: '#EF4444' }}>{parentFieldErrors.unit}</Typography>
//                   )}
//                 </FormControl>
//               </Box>
//             </Grid>
//             <Grid size={{ xs: 12, sm: 6 }}>
//               <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//                 <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary }}>
//                   WEIGHT PER UNIT (kg)
//                 </Typography>
//                 <TextField
//                   fullWidth
//                   size="small"
//                   name="weight_per_unit_kg"
//                   type="number"
//                   value={newParentData.weight_per_unit_kg}
//                   onChange={handleParentFormChange}
//                   onBlur={handleParentBlur}
//                   placeholder="e.g., 0.85"
//                   error={!!parentFieldErrors.weight_per_unit_kg}
//                   helperText={parentFieldErrors.weight_per_unit_kg}
//                   sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5, fontSize: '0.75rem' } }}
//                   disabled={addParentLoading}
//                   inputProps={{ step: '0.001', min: 0 }}
//                 />
//                 <Typography sx={{ fontSize: '0.65rem', color: COLORS.text.tertiary }}>
//                   Required when unit is not Kg
//                 </Typography>
//               </Box>
//             </Grid>
//             <Grid size={{ xs: 12 }}>
//               <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//                 <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary }}>
//                   PART DESCRIPTION
//                 </Typography>
//                 <TextField
//                   fullWidth
//                   size="small"
//                   name="part_description"
//                   value={newParentData.part_description}
//                   onChange={handleParentFormChange}
//                   onBlur={handleParentBlur}
//                   placeholder="Enter detailed part description"
//                   multiline
//                   rows={2}
//                   disabled={addParentLoading}
//                   sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5, fontSize: '0.75rem' } }}
//                 />
//               </Box>
//             </Grid>
//           </Grid>
//         );

//       case 1: // Material & Drawing
//         return (
//           <Grid container spacing={1.5}>
//             <Grid size={{ xs: 12, sm: 6 }}>
//               <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//                 <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary }}>
//                   MATERIAL
//                 </Typography>
//                 <FormControl fullWidth size="small">
//                   <Select
//                     name="material"
//                     value={newParentData.material}
//                     onChange={handleParentFormChange}
//                     onBlur={handleParentBlur}
//                     disabled={addParentLoading}
//                     displayEmpty
//                     sx={{ borderRadius: 1.5, fontSize: '0.75rem' }}
//                   >
//                     <MenuItem value="" sx={{ fontSize: '0.75rem', color: COLORS.text.tertiary }}>Select material</MenuItem>
//                     {materialOptions.map(option => (
//                       <MenuItem key={option} value={option} sx={{ fontSize: '0.75rem' }}>{option}</MenuItem>
//                     ))}
//                   </Select>
//                 </FormControl>
//               </Box>
//             </Grid>
//             <Grid size={{ xs: 12, sm: 6 }}>
//               <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//                 <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary }}>
//                   MATERIAL GRADE
//                 </Typography>
//                 <TextField
//                   fullWidth
//                   size="small"
//                   name="material_grade"
//                   value={newParentData.material_grade}
//                   onChange={handleParentFormChange}
//                   onBlur={handleParentBlur}
//                   placeholder="e.g., C11000"
//                   disabled={addParentLoading}
//                   sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5, fontSize: '0.75rem' } }}
//                 />
//               </Box>
//             </Grid>
//             <Grid size={{ xs: 12, sm: 6 }}>
//               <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//                 <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary }}>
//                   MATERIAL STANDARD
//                 </Typography>
//                 <TextField
//                   fullWidth
//                   size="small"
//                   name="material_standard"
//                   value={newParentData.material_standard}
//                   onChange={handleParentFormChange}
//                   onBlur={handleParentBlur}
//                   placeholder="e.g., ASTM B152"
//                   disabled={addParentLoading}
//                   sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5, fontSize: '0.75rem' } }}
//                 />
//               </Box>
//             </Grid>
//             <Grid size={{ xs: 12, sm: 6 }}>
//               <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//                 <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary }}>
//                   MATERIAL COLOR
//                 </Typography>
//                 <TextField
//                   fullWidth
//                   size="small"
//                   name="material_color"
//                   value={newParentData.material_color}
//                   onChange={handleParentFormChange}
//                   onBlur={handleParentBlur}
//                   placeholder="e.g., Reddish"
//                   disabled={addParentLoading}
//                   sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5, fontSize: '0.75rem' } }}
//                 />
//               </Box>
//             </Grid>
//             <Grid size={{ xs: 12, sm: 6 }}>
//               <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//                 <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary }}>
//                   DENSITY (g/cm³) <span style={{ color: '#EF4444' }}>*</span>
//                 </Typography>
//                 <TextField
//                   fullWidth
//                   size="small"
//                   name="density"
//                   type="number"
//                   value={newParentData.density}
//                   onChange={handleParentFormChange}
//                   onBlur={handleParentBlur}
//                   placeholder="e.g., 8.96"
//                   error={!!parentFieldErrors.density}
//                   helperText={parentFieldErrors.density}
//                   sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5, fontSize: '0.75rem' } }}
//                   disabled={addParentLoading}
//                   inputProps={{ step: '0.01', min: 0 }}
//                 />
//               </Box>
//             </Grid>
//             <Grid size={{ xs: 12, sm: 6 }}>
//               <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//                 <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary }}>
//                   DRAWING NO <span style={{ color: '#EF4444' }}>*</span>
//                 </Typography>
//                 <TextField
//                   fullWidth
//                   size="small"
//                   name="drawing_no"
//                   value={newParentData.drawing_no}
//                   onChange={handleParentFormChange}
//                   onBlur={handleParentBlur}
//                   placeholder="e.g., DRG-001"
//                   error={!!parentFieldErrors.drawing_no}
//                   helperText={parentFieldErrors.drawing_no}
//                   sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5, fontSize: '0.75rem' } }}
//                   disabled={addParentLoading}
//                 />
//               </Box>
//             </Grid>
//             <Grid size={{ xs: 12, sm: 6 }}>
//               <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//                 <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary }}>
//                   REVISION NO
//                 </Typography>
//                 <TextField
//                   fullWidth
//                   size="small"
//                   name="revision_no"
//                   value={newParentData.revision_no}
//                   onChange={handleParentFormChange}
//                   onBlur={handleParentBlur}
//                   placeholder="e.g., 0, A"
//                   disabled={addParentLoading}
//                   sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5, fontSize: '0.75rem' } }}
//                 />
//               </Box>
//             </Grid>
//           </Grid>
//         );

//       case 2: // Dimensions & Parameters
//         return (
//           <Grid container spacing={1.5}>
//             <Grid size={{ xs: 12, sm: 6 }}>
//               <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//                 <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary }}>
//                   THICKNESS (mm)
//                 </Typography>
//                 <TextField
//                   fullWidth
//                   size="small"
//                   name="thickness"
//                   type="number"
//                   value={newParentData.thickness}
//                   onChange={handleParentFormChange}
//                   onBlur={handleParentBlur}
//                   placeholder="e.g., 10"
//                   error={!!parentFieldErrors.thickness}
//                   helperText={parentFieldErrors.thickness}
//                   sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5, fontSize: '0.75rem' } }}
//                   disabled={addParentLoading}
//                   inputProps={{ step: '0.01', min: 0 }}
//                 />
//               </Box>
//             </Grid>
//             <Grid size={{ xs: 12, sm: 6 }}>
//               <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//                 <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary }}>
//                   WIDTH (mm)
//                 </Typography>
//                 <TextField
//                   fullWidth
//                   size="small"
//                   name="width"
//                   type="number"
//                   value={newParentData.width}
//                   onChange={handleParentFormChange}
//                   onBlur={handleParentBlur}
//                   placeholder="e.g., 100"
//                   error={!!parentFieldErrors.width}
//                   helperText={parentFieldErrors.width}
//                   sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5, fontSize: '0.75rem' } }}
//                   disabled={addParentLoading}
//                   inputProps={{ step: '0.01', min: 0 }}
//                 />
//               </Box>
//             </Grid>
//             <Grid size={{ xs: 12, sm: 6 }}>
//               <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//                 <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary }}>
//                   STRIP SIZE (mm)
//                 </Typography>
//                 <TextField
//                   fullWidth
//                   size="small"
//                   name="strip_size"
//                   type="number"
//                   value={newParentData.strip_size}
//                   onChange={handleParentFormChange}
//                   onBlur={handleParentBlur}
//                   placeholder="e.g., 3660"
//                   error={!!parentFieldErrors.strip_size}
//                   helperText={parentFieldErrors.strip_size}
//                   sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5, fontSize: '0.75rem' } }}
//                   disabled={addParentLoading}
//                   inputProps={{ step: '0.01', min: 0 }}
//                 />
//               </Box>
//             </Grid>
//             <Grid size={{ xs: 12, sm: 6 }}>
//               <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//                 <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary }}>
//                   PITCH (mm)
//                 </Typography>
//                 <TextField
//                   fullWidth
//                   size="small"
//                   name="pitch"
//                   type="number"
//                   value={newParentData.pitch}
//                   onChange={handleParentFormChange}
//                   onBlur={handleParentBlur}
//                   placeholder="e.g., 42"
//                   sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5, fontSize: '0.75rem' } }}
//                   disabled={addParentLoading}
//                   inputProps={{ step: '0.01', min: 0 }}
//                 />
//               </Box>
//             </Grid>
//             <Grid size={{ xs: 12, sm: 6 }}>
//               <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//                 <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary }}>
//                   NO. OF CAVITIES
//                 </Typography>
//                 <TextField
//                   fullWidth
//                   size="small"
//                   name="no_of_cavity"
//                   type="number"
//                   value={newParentData.no_of_cavity}
//                   onChange={handleParentFormChange}
//                   onBlur={handleParentBlur}
//                   placeholder="e.g., 1"
//                   sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5, fontSize: '0.75rem' } }}
//                   disabled={addParentLoading}
//                   inputProps={{ step: '1', min: 1 }}
//                 />
//               </Box>
//             </Grid>
//           </Grid>
//         );

//       case 3: // Rates & Inventory
//         return (
//           <Grid container spacing={1.5}>
//             <Grid size={{ xs: 12, sm: 6 }}>
//               <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//                 <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary }}>
//                   HSN CODE <span style={{ color: '#EF4444' }}>*</span>
//                 </Typography>
//                 <TextField
//                   fullWidth
//                   size="small"
//                   name="hsn_code"
//                   value={newParentData.hsn_code}
//                   onChange={handleParentFormChange}
//                   onBlur={handleParentBlur}
//                   placeholder="e.g., 74071010"
//                   error={!!parentFieldErrors.hsn_code}
//                   helperText={parentFieldErrors.hsn_code}
//                   sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5, fontSize: '0.75rem' } }}
//                   disabled={addParentLoading}
//                 />
//               </Box>
//             </Grid>
//             <Grid size={{ xs: 12, sm: 6 }}>
//               <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//                 <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary }}>
//                   GST PERCENTAGE (%)
//                 </Typography>
//                 <TextField
//                   fullWidth
//                   size="small"
//                   name="gst_percentage"
//                   type="number"
//                   value={newParentData.gst_percentage}
//                   onChange={handleParentFormChange}
//                   onBlur={handleParentBlur}
//                   placeholder="e.g., 18"
//                   sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5, fontSize: '0.75rem' } }}
//                   disabled={addParentLoading}
//                   inputProps={{ step: '0.1', min: 0 }}
//                 />
//               </Box>
//             </Grid>
//             <Grid size={{ xs: 12, sm: 6 }}>
//               <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//                 <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary }}>
//                   PROCUREMENT TYPE <span style={{ color: '#EF4444' }}>*</span>
//                 </Typography>
//                 <FormControl fullWidth size="small" error={!!parentFieldErrors.procurement_type}>
//                   <Select
//                     name="procurement_type"
//                     value={newParentData.procurement_type}
//                     onChange={handleParentFormChange}
//                     onBlur={handleParentBlur}
//                     disabled={addParentLoading}
//                     sx={{ borderRadius: 1.5, fontSize: '0.75rem' }}
//                   >
//                     {PROCUREMENT_TYPE_OPTIONS.map(option => (
//                       <MenuItem key={option} value={option} sx={{ fontSize: '0.75rem' }}>{option}</MenuItem>
//                     ))}
//                   </Select>
//                   {parentFieldErrors.procurement_type && (
//                     <Typography sx={{ fontSize: '0.65rem', color: '#EF4444' }}>{parentFieldErrors.procurement_type}</Typography>
//                   )}
//                 </FormControl>
//               </Box>
//             </Grid>
//             <Grid size={{ xs: 12, sm: 6 }}>
//               <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//                 <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary }}>
//                   RM REJECTION (%)
//                 </Typography>
//                 <TextField
//                   fullWidth
//                   size="small"
//                   name="rm_rejection_percent"
//                   type="number"
//                   value={newParentData.rm_rejection_percent}
//                   onChange={handleParentFormChange}
//                   onBlur={handleParentBlur}
//                   placeholder="e.g., 2"
//                   sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5, fontSize: '0.75rem' } }}
//                   disabled={addParentLoading}
//                   inputProps={{ step: '0.1', min: 0, max: 100 }}
//                 />
//               </Box>
//             </Grid>
//             <Grid size={{ xs: 12, sm: 6 }}>
//               <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//                 <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary }}>
//                   SCRAP REALISATION (%)
//                 </Typography>
//                 <TextField
//                   fullWidth
//                   size="small"
//                   name="scrap_realisation_percent"
//                   type="number"
//                   value={newParentData.scrap_realisation_percent}
//                   onChange={handleParentFormChange}
//                   onBlur={handleParentBlur}
//                   placeholder="e.g., 85"
//                   sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5, fontSize: '0.75rem' } }}
//                   disabled={addParentLoading}
//                   inputProps={{ step: '0.1', min: 0, max: 100 }}
//                 />
//               </Box>
//             </Grid>
//             <Grid size={{ xs: 12, sm: 6 }}>
//               <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//                 <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary }}>
//                   LEAD TIME (days)
//                 </Typography>
//                 <TextField
//                   fullWidth
//                   size="small"
//                   name="lead_time_days"
//                   type="number"
//                   value={newParentData.lead_time_days}
//                   onChange={handleParentFormChange}
//                   onBlur={handleParentBlur}
//                   placeholder="e.g., 7"
//                   sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5, fontSize: '0.75rem' } }}
//                   disabled={addParentLoading}
//                   inputProps={{ step: '1', min: 0 }}
//                 />
//               </Box>
//             </Grid>
//             <Grid size={{ xs: 12, sm: 6 }}>
//               <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//                 <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary }}>
//                   REORDER LEVEL
//                 </Typography>
//                 <TextField
//                   fullWidth
//                   size="small"
//                   name="reorder_level"
//                   type="number"
//                   value={newParentData.reorder_level}
//                   onChange={handleParentFormChange}
//                   onBlur={handleParentBlur}
//                   placeholder="e.g., 100"
//                   sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5, fontSize: '0.75rem' } }}
//                   disabled={addParentLoading}
//                   inputProps={{ step: '1', min: 0 }}
//                 />
//               </Box>
//             </Grid>
//             <Grid size={{ xs: 12, sm: 6 }}>
//               <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//                 <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary }}>
//                   REORDER QTY
//                 </Typography>
//                 <TextField
//                   fullWidth
//                   size="small"
//                   name="reorder_qty"
//                   type="number"
//                   value={newParentData.reorder_qty}
//                   onChange={handleParentFormChange}
//                   onBlur={handleParentBlur}
//                   placeholder="e.g., 200"
//                   sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5, fontSize: '0.75rem' } }}
//                   disabled={addParentLoading}
//                   inputProps={{ step: '1', min: 0 }}
//                 />
//               </Box>
//             </Grid>
//             <Grid size={{ xs: 12, sm: 6 }}>
//               <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//                 <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary }}>
//                   SAFETY STOCK
//                 </Typography>
//                 <TextField
//                   fullWidth
//                   size="small"
//                   name="safety_stock"
//                   type="number"
//                   value={newParentData.safety_stock}
//                   onChange={handleParentFormChange}
//                   onBlur={handleParentBlur}
//                   placeholder="e.g., 40"
//                   sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5, fontSize: '0.75rem' } }}
//                   disabled={addParentLoading}
//                   inputProps={{ step: '1', min: 0 }}
//                 />
//               </Box>
//             </Grid>
//             <Grid size={{ xs: 12, sm: 6 }}>
//               <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//                 <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary }}>
//                   MIN STOCK
//                 </Typography>
//                 <TextField
//                   fullWidth
//                   size="small"
//                   name="min_stock"
//                   type="number"
//                   value={newParentData.min_stock}
//                   onChange={handleParentFormChange}
//                   onBlur={handleParentBlur}
//                   placeholder="e.g., 40"
//                   sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5, fontSize: '0.75rem' } }}
//                   disabled={addParentLoading}
//                   inputProps={{ step: '1', min: 0 }}
//                 />
//               </Box>
//             </Grid>
//             <Grid size={{ xs: 12, sm: 6 }}>
//               <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//                 <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary }}>
//                   MAX STOCK
//                 </Typography>
//                 <TextField
//                   fullWidth
//                   size="small"
//                   name="max_stock"
//                   type="number"
//                   value={newParentData.max_stock}
//                   onChange={handleParentFormChange}
//                   onBlur={handleParentBlur}
//                   placeholder="e.g., 200"
//                   sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5, fontSize: '0.75rem' } }}
//                   disabled={addParentLoading}
//                   inputProps={{ step: '1', min: 0 }}
//                 />
//               </Box>
//             </Grid>
//             <Grid size={{ xs: 12, sm: 6 }}>
//               <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//                 <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary }}>
//                   SHELF LIFE (days)
//                 </Typography>
//                 <TextField
//                   fullWidth
//                   size="small"
//                   name="shelf_life_days"
//                   type="number"
//                   value={newParentData.shelf_life_days}
//                   onChange={handleParentFormChange}
//                   onBlur={handleParentBlur}
//                   placeholder="e.g., 365"
//                   sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5, fontSize: '0.75rem' } }}
//                   disabled={addParentLoading}
//                   inputProps={{ step: '1', min: 0 }}
//                 />
//               </Box>
//             </Grid>
//           </Grid>
//         );

//       default:
//         return null;
//     }
//   };

//   const handleItemAdded = (newItem) => {
//     setParentItems(prev => [...prev, newItem]);
//     setFormData(prev => ({ ...prev, parent_item_id: newItem._id }));
//     setFieldErrors(prev => ({ ...prev, parent_item_id: '' }));
//     setShowAddParentForm(false);
//   };
  
//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData(prev => ({
//       ...prev,
//       [name]: value
//     }));
//     setFieldErrors(prev => ({ ...prev, [name]: '' }));
//     setError('');
//   };
  
//   const handleBomCategoryChange = (e) => {
//     const value = e.target.value;
//     setFormData(prev => ({
//       ...prev,
//       bom_category: value
//     }));
//     setFieldErrors(prev => ({ ...prev, bom_category: '' }));
//     setError('');
    
//     if (value === 'Standard') {
//       const hasComponents = components.some(comp => comp.component_item_id);
//       if (hasComponents) {
//         setComponents([
//           {
//             level: 1,
//             component_item_id: '',
//             component_part_no: '',
//             component_desc: '',
//             quantity_per: 1,
//             unit: 'Nos',
//             scrap_percent: 0,
//             is_phantom: false,
//             is_subcontract: false,
//             subcontract_vendor: null,
//             reference_designator: '',
//             remarks: ''
//           }
//         ]);
//         setError('Components cleared. Standard BOM cannot have components.');
//         setTimeout(() => setError(''), 3000);
//       }
//     }
//   };
  
//   const handleComponentChange = (index, field, value) => {
//     if (formData.bom_category === 'Standard') {
//       setError('Standard BOM cannot have components. Please change BOM Category to "Assembly".');
//       return;
//     }
    
//     const updatedComponents = [...components];
//     updatedComponents[index][field] = value;
    
//     if (field === 'component_item_id' && value) {
//       const selectedItem = componentItems.find(item => item._id === value);
//       if (selectedItem) {
//         updatedComponents[index].component_part_no = selectedItem.part_no || '';
//         updatedComponents[index].component_desc = selectedItem.part_description || '';
//         updatedComponents[index].unit = selectedItem.unit || 'Nos';
//       }
//     }
    
//     setComponents(updatedComponents);
//     setFieldErrors(prev => ({ ...prev, [`comp_${index}_${field}`]: '' }));
//   };
  
//   const addComponent = () => {
//     if (formData.bom_category === 'Standard') {
//       setError('Standard BOM cannot have components. Please change BOM Category to "Assembly" to add components.');
//       return;
//     }
    
//     setComponents([
//       ...components,
//       {
//         level: components.length + 1,
//         component_item_id: '',
//         component_part_no: '',
//         component_desc: '',
//         quantity_per: 1,
//         unit: 'Nos',
//         scrap_percent: 0,
//         is_phantom: false,
//         is_subcontract: false,
//         subcontract_vendor: null,
//         reference_designator: '',
//         remarks: ''
//       }
//     ]);
//   };
  
//   const removeComponent = (index) => {
//     if (components.length > 1) {
//       const updatedComponents = components.filter((_, i) => i !== index);
//       updatedComponents.forEach((comp, idx) => {
//         comp.level = idx + 1;
//       });
//       setComponents(updatedComponents);
//     }
//   };
  
//   const validateStep = (step) => {
//     const errors = {};
//     let isValid = true;
    
//     switch (step) {
//       case 0:
//         if (!formData.parent_item_id) {
//           errors.parent_item_id = 'Parent item is required';
//           isValid = false;
//         }
//         if (!formData.bom_version.trim()) {
//           errors.bom_version = 'BOM version is required';
//           isValid = false;
//         }
//         if (!formData.bom_type) {
//           errors.bom_type = 'BOM type is required';
//           isValid = false;
//         }
//         if (!formData.bom_category) {
//           errors.bom_category = 'BOM category is required';
//           isValid = false;
//         }
//         if (!formData.effective_from) {
//           errors.effective_from = 'Effective from date is required';
//           isValid = false;
//         }
//         break;
        
//       case 2:
//         if (formData.bom_category === 'Assembly') {
//           let hasValidComponent = false;
//           components.forEach((comp, index) => {
//             if (comp.component_item_id) {
//               hasValidComponent = true;
//             }
//             if (!comp.component_item_id) {
//               errors[`comp_${index}_component_item_id`] = `Component ${index + 1}: Item is required for Assembly BOM`;
//               isValid = false;
//             }
//             if (!comp.quantity_per || comp.quantity_per <= 0) {
//               errors[`comp_${index}_quantity_per`] = `Component ${index + 1}: Valid quantity is required`;
//               isValid = false;
//             }
//           });
//           if (!hasValidComponent) {
//             errors.components = 'At least one component is required for Assembly BOM';
//             isValid = false;
//           }
//         } else if (formData.bom_category === 'Standard') {
//           const hasComponents = components.some(comp => comp.component_item_id);
//           if (hasComponents) {
//             errors.components = 'Standard BOM cannot have components. Use BOM Category: "Assembly" for BOMs with components.';
//             isValid = false;
//             setComponents([
//               {
//                 level: 1,
//                 component_item_id: '',
//                 component_part_no: '',
//                 component_desc: '',
//                 quantity_per: 1,
//                 unit: 'Nos',
//                 scrap_percent: 0,
//                 is_phantom: false,
//                 is_subcontract: false,
//                 subcontract_vendor: null,
//                 reference_designator: '',
//                 remarks: ''
//               }
//             ]);
//           }
//         }
//         break;
        
//       default:
//         return true;
//     }
    
//     setFieldErrors(errors);
//     if (!isValid) {
//       setError('Please fix the errors in this section');
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
//     if (!validateStep(2)) {
//       return;
//     }
    
//     if (formData.bom_category === 'Assembly') {
//       const hasComponents = components.some(comp => comp.component_item_id);
//       if (!hasComponents) {
//         setError('Assembly BOM must have at least one component.');
//         setActiveStep(2);
//         return;
//       }
//     } else if (formData.bom_category === 'Standard') {
//       const hasComponents = components.some(comp => comp.component_item_id);
//       if (hasComponents) {
//         setError('Standard BOM cannot have components. Use "Assembly" category for BOMs with components.');
//         setActiveStep(2);
//         setComponents([
//           {
//             level: 1,
//             component_item_id: '',
//             component_part_no: '',
//             component_desc: '',
//             quantity_per: 1,
//             unit: 'Nos',
//             scrap_percent: 0,
//             is_phantom: false,
//             is_subcontract: false,
//             subcontract_vendor: null,
//             reference_designator: '',
//             remarks: ''
//           }
//         ]);
//         return;
//       }
//     }
    
//     const unitMismatches = [];
//     for (let i = 0; i < components.length; i++) {
//       const comp = components[i];
//       if (comp.component_item_id) {
//         const selectedItem = componentItems.find(item => item._id === comp.component_item_id);
//         if (selectedItem && selectedItem.unit && comp.unit !== selectedItem.unit) {
//           unitMismatches.push(`Component "${comp.component_part_no || selectedItem.part_no}": Unit mismatch. Item unit is ${selectedItem.unit}, provided ${comp.unit}`);
//         }
//       }
//     }
    
//     if (unitMismatches.length > 0) {
//       setError(unitMismatches.join('\n'));
//       setActiveStep(2);
//       return;
//     }
    
//     setLoading(true);
//     setError('');
    
//     try {
//       const token = localStorage.getItem('token');
      
//       const submitData = {
//         ...formData,
//         batch_size: Number(formData.batch_size),
//         yield_percent: Number(formData.yield_percent),
//         setup_time_min: Number(formData.setup_time_min),
//         cycle_time_min: Number(formData.cycle_time_min),
//         components: formData.bom_category === 'Assembly' 
//           ? components.map(comp => ({
//               ...comp,
//               level: Number(comp.level),
//               quantity_per: Number(comp.quantity_per),
//               scrap_percent: Number(comp.scrap_percent)
//             }))
//           : []
//       };
      
//       const response = await axios.post(`${BASE_URL}/api/boms`, submitData, {
//         headers: {
//           'Authorization': `Bearer ${token}`,
//           'Content-Type': 'application/json'
//         }
//       });
      
//       if (response.data.success) {
//         onAdd(response.data.data);
//         onClose();
//         resetForm();
//       } else {
//         setError(response.data.message || 'Failed to add BOM');
//       }
//     } catch (err) {
//       console.error('Error adding BOM:', err);
//       let errorMessage = 'Failed to add BOM. Please try again.';
//       if (err.response?.data) {
//         const data = err.response.data;
//         if (data.errors && Array.isArray(data.errors) && data.errors.length > 0) {
//           errorMessage = data.errors.join('\n');
//         } else if (data.message) {
//           errorMessage = data.message;
//         } else if (data.error) {
//           errorMessage = data.error;
//         }
//       } else if (err.message) {
//         errorMessage = err.message;
//       }
//       setError(errorMessage);
//     } finally {
//       setLoading(false);
//     }
//   };
  
//   const resetForm = () => {
//     setActiveStep(0);
//     setFormData({
//       parent_item_id: '',
//       bom_version: 'v1.0',
//       bom_type: 'Manufacturing',
//       status: 'Pending',
//       batch_size: 1,
//       yield_percent: 100,
//       setup_time_min: 30,
//       cycle_time_min: 5.5,
//       effective_from: new Date().toISOString().split('T')[0],
//       effective_to: '',
//       created_by: localStorage.getItem('userId') || '',
//       bom_category: 'Standard'
//     });
//     setComponents([
//       {
//         level: 1,
//         component_item_id: '',
//         component_part_no: '',
//         component_desc: '',
//         quantity_per: 1,
//         unit: 'Nos',
//         scrap_percent: 0,
//         is_phantom: false,
//         is_subcontract: false,
//         subcontract_vendor: null,
//         reference_designator: '',
//         remarks: ''
//       }
//     ]);
//     setFieldErrors({});
//     setError('');
//     setShowAddParentForm(false);
//     resetParentFormData();
//   };
  
//   const handleClose = () => {
//     resetForm();
//     onClose();
//   };
  
//   const renderStepContent = (step) => {
//     switch (step) {
//       case 0:
//         return (
//           <Stack spacing={2}>
//             <Paper sx={{ 
//               p: 2, 
//               bgcolor: COLORS.background.white, 
//               borderRadius: 1.5, 
//               border: `1px solid ${COLORS.border}`,
//               boxShadow: 'none'
//             }}>
//               <Typography sx={{ 
//                 fontSize: '0.8rem', 
//                 fontWeight: 600, 
//                 color: COLORS.primary, 
//                 mb: 1.5 
//               }}>
//                 <InventoryIcon sx={{ fontSize: '1rem', mr: 0.5, verticalAlign: 'middle' }} />
//                 Basic Information
//               </Typography>
              
//               <Grid container spacing={1.5}>
//                 <Grid size={{ xs: 12 }}>
//                   <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//                     <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary }}>
//                       PARENT ITEM <span style={{ color: '#EF4444' }}>*</span>
//                     </Typography>
                    
//                     <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
//                       <Box sx={{ flex: 1 }}>
//                         <Autocomplete
//                           fullWidth
//                           options={parentItems}
//                           getOptionLabel={(option) => `${option.part_no} - ${option.part_description}`}
//                           value={parentItems.find(item => item._id === formData.parent_item_id) || null}
//                           onChange={(event, newValue) => {
//                             if (newValue) {
//                               // Populate form with selected item's data
//                               setFormData(prev => ({ ...prev, parent_item_id: newValue._id }));
//                               setFieldErrors(prev => ({ ...prev, parent_item_id: '' }));
//                               // Populate the inline form with the selected item's details
//                               setNewParentData({
//                                 part_no: newValue.part_no || '',
//                                 part_name: newValue.part_name || '',
//                                 item_category: newValue.item_category || '',
//                                 item_type: newValue.item_type || '',
//                                 unit: newValue.unit || 'Kg',
//                                 part_description: newValue.part_description || '',
//                                 weight_per_unit_kg: newValue.weight_per_unit_kg || '',
//                                 material: newValue.material || '',
//                                 material_grade: newValue.material_grade || '',
//                                 material_standard: newValue.material_standard || '',
//                                 material_color: newValue.material_color || '',
//                                 density: newValue.density || '',
//                                 drawing_no: newValue.drawing_no || '',
//                                 revision_no: newValue.revision_no || '',
//                                 thickness: newValue.thickness || '',
//                                 width: newValue.width || '',
//                                 strip_size: newValue.strip_size || '',
//                                 pitch: newValue.pitch || '',
//                                 no_of_cavity: newValue.no_of_cavity || 1,
//                                 hsn_code: newValue.hsn_code || '',
//                                 gst_percentage: newValue.gst_percentage || 18,
//                                 procurement_type: newValue.procurement_type || 'Purchase',
//                                 rm_rejection_percent: newValue.rm_rejection_percent || 2,
//                                 scrap_realisation_percent: newValue.scrap_realisation_percent || 85,
//                                 lead_time_days: newValue.lead_time_days || '',
//                                 reorder_level: newValue.reorder_level || '',
//                                 reorder_qty: newValue.reorder_qty || '',
//                                 safety_stock: newValue.safety_stock || '',
//                                 min_stock: newValue.min_stock || '',
//                                 max_stock: newValue.max_stock || '',
//                                 shelf_life_days: newValue.shelf_life_days || ''
//                               });
//                               // Show the inline form with stepper (editable)
//                               setShowAddParentForm(true);
//                               setParentActiveStep(0);
//                             } else {
//                               // Clear selection
//                               setFormData(prev => ({ ...prev, parent_item_id: '' }));
//                               setShowAddParentForm(false);
//                               resetParentFormData();
//                             }
//                           }}
//                           loading={loadingItems}
//                           renderInput={(params) => (
//                             <TextField
//                               {...params}
//                               size="small"
//                               error={!!fieldErrors.parent_item_id}
//                               helperText={fieldErrors.parent_item_id}
//                               sx={{
//                                 '& .MuiOutlinedInput-root': {
//                                   borderRadius: 1.5,
//                                   fontSize: '0.75rem'
//                                 }
//                               }}
//                             />
//                           )}
//                         />
//                       </Box>
//                       <Button
//                         variant="outlined"
//                         size="small"
//                         onClick={() => {
//                           if (!showAddParentForm) {
//                             // Open the form with empty data for adding new
//                             setShowAddParentForm(true);
//                             resetParentFormData();
//                             // Also clear the parent_item_id in the main form
//                             setFormData(prev => ({ ...prev, parent_item_id: '' }));
//                           } else {
//                             // Close the form
//                             setShowAddParentForm(false);
//                             resetParentFormData();
//                           }
//                         }}
//                         startIcon={showAddParentForm ? <CloseIcon sx={{ fontSize: '0.875rem' }} /> : <AddIcon sx={{ fontSize: '0.875rem' }} />}
//                         sx={{
//                           height: 35,
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
//                         {showAddParentForm ? 'Cancel' : 'Add New'}
//                       </Button>
//                     </Box>
//                   </Box>
//                 </Grid>

//                 {/* Inline Parent Item Form - Always shows the 4-step stepper with fields */}
//                 {showAddParentForm && (
//                   <Grid size={{ xs: 12 }}>
//                     <Box sx={{ 
//                       mt: 1, 
//                       p: 2, 
//                       bgcolor: COLORS.background.light, 
//                       borderRadius: 2, 
//                       border: `1px solid ${COLORS.primary}` 
//                     }}>
//                       <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
//                         <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color: COLORS.primary }}>
//                           {formData.parent_item_id ? 'Edit Parent Item Details' : 'Add New Item'}
//                         </Typography>
//                         <IconButton
//                           size="small"
//                           onClick={() => {
//                             setShowAddParentForm(false);
//                             resetParentFormData();
//                           }}
//                           sx={{
//                             color: COLORS.text.tertiary,
//                             '&:hover': { color: COLORS.primary }
//                           }}
//                         >
//                           <CloseIcon sx={{ fontSize: '1rem' }} />
//                         </IconButton>
//                       </Box>

//                       {/* Parent Item Stepper */}
//                       <Stepper
//                         activeStep={parentActiveStep}
//                         sx={{ mb: 3 }}
//                         connector={<ColorConnector />}
//                       >
//                         {PARENT_ITEM_STEPS.map((label) => (
//                           <Step key={label}>
//                             <StepLabel>
//                               <Typography sx={{ fontSize: '0.65rem', fontWeight: 500 }}>
//                                 {label}
//                               </Typography>
//                             </StepLabel>
//                           </Step>
//                         ))}
//                       </Stepper>

//                       {renderParentStepContent(parentActiveStep)}

//                       {addParentError && (
//                         <Alert
//                           severity="error"
//                           sx={{
//                             mt: 2,
//                             borderRadius: 1.5,
//                             fontSize: '0.75rem',
//                             py: 0.5
//                           }}
//                         >
//                           {addParentError}
//                         </Alert>
//                       )}

//                       <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
//                         <Button
//                           onClick={handleParentBack}
//                           disabled={parentActiveStep === 0 || addParentLoading}
//                           size="small"
//                           startIcon={<NavigateBeforeIcon sx={{ fontSize: '1rem' }} />}
//                           sx={{
//                             height: 32,
//                             px: 2,
//                             borderRadius: 1.5,
//                             border: `1px solid ${COLORS.border}`,
//                             color: COLORS.text.secondary,
//                             fontSize: '0.7rem',
//                             fontWeight: 500,
//                             textTransform: 'none',
//                             '&:hover': {
//                               borderColor: COLORS.primary,
//                               bgcolor: `${COLORS.primary}10`
//                             }
//                           }}
//                         >
//                           Back
//                         </Button>
//                         <Box sx={{ display: 'flex', gap: 1 }}>
//                           <Button
//                             onClick={() => {
//                               setShowAddParentForm(false);
//                               resetParentFormData();
//                             }}
//                             disabled={addParentLoading}
//                             size="small"
//                             sx={{
//                               height: 32,
//                               px: 2,
//                               borderRadius: 1.5,
//                               border: `1px solid ${COLORS.border}`,
//                               color: COLORS.text.secondary,
//                               fontSize: '0.7rem',
//                               fontWeight: 500,
//                               textTransform: 'none',
//                               '&:hover': {
//                                 borderColor: COLORS.primary,
//                                 bgcolor: `${COLORS.primary}10`
//                               }
//                             }}
//                           >
//                             Cancel
//                           </Button>
//                           {parentActiveStep === PARENT_ITEM_STEPS.length - 1 ? (
//                             <Button
//                               variant="contained"
//                               onClick={handleAddParentSubmit}
//                               disabled={addParentLoading}
//                               size="small"
//                               startIcon={<AddIcon sx={{ fontSize: '1rem' }} />}
//                               sx={{
//                                 height: 32,
//                                 px: 2,
//                                 borderRadius: 1.5,
//                                 bgcolor: COLORS.primary,
//                                 fontSize: '0.7rem',
//                                 fontWeight: 500,
//                                 textTransform: 'none',
//                                 '&:hover': { bgcolor: COLORS.primaryDark }
//                               }}
//                             >
//                               {addParentLoading ? 'Adding...' : 'Add Item'}
//                             </Button>
//                           ) : (
//                             <Button
//                               variant="contained"
//                               onClick={handleParentNext}
//                               disabled={addParentLoading}
//                               size="small"
//                               endIcon={<NavigateNextIcon sx={{ fontSize: '1rem' }} />}
//                               sx={{
//                                 height: 32,
//                                 px: 2,
//                                 borderRadius: 1.5,
//                                 bgcolor: COLORS.primary,
//                                 fontSize: '0.7rem',
//                                 fontWeight: 500,
//                                 textTransform: 'none',
//                                 '&:hover': { bgcolor: COLORS.primaryDark }
//                               }}
//                             >
//                               Next
//                             </Button>
//                           )}
//                         </Box>
//                       </Box>
//                     </Box>
//                   </Grid>
//                 )}
                
//                 <Grid size={{ xs: 12, sm: 6 }}>
//                   <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//                     <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary }}>
//                       BOM VERSION <span style={{ color: '#EF4444' }}>*</span>
//                     </Typography>
//                     <TextField
//                       fullWidth
//                       size="small"
//                       name="bom_version"
//                       value={formData.bom_version}
//                       onChange={handleChange}
//                       placeholder="v1.0"
//                       error={!!fieldErrors.bom_version}
//                       helperText={fieldErrors.bom_version}
//                       sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5, fontSize: '0.75rem' } }}
//                     />
//                   </Box>
//                 </Grid>
                
//                 <Grid size={{ xs: 12, sm: 6 }}>
//                   <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//                     <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary }}>
//                       BOM TYPE <span style={{ color: '#EF4444' }}>*</span>
//                     </Typography>
//                     <FormControl fullWidth size="small" error={!!fieldErrors.bom_type}>
//                       <Select
//                         name="bom_type"
//                         value={formData.bom_type}
//                         onChange={handleChange}
//                         sx={{ borderRadius: 1.5, fontSize: '0.75rem' }}
//                       >
//                         {BOM_TYPE_OPTIONS.map(option => (
//                           <MenuItem key={option} value={option} sx={{ fontSize: '0.75rem' }}>
//                             {option}
//                           </MenuItem>
//                         ))}
//                       </Select>
//                     </FormControl>
//                   </Box>
//                 </Grid>

//                 <Grid size={{ xs: 12, sm: 6 }}>
//                   <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//                     <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary }}>
//                       BOM CATEGORY <span style={{ color: '#EF4444' }}>*</span>
//                     </Typography>
//                     <FormControl fullWidth size="small" error={!!fieldErrors.bom_category}>
//                       <Select
//                         name="bom_category"
//                         value={formData.bom_category}
//                         onChange={handleBomCategoryChange}
//                         sx={{ borderRadius: 1.5, fontSize: '0.75rem' }}
//                       >
//                         {BOM_CATEGORY_OPTIONS.map(option => (
//                           <MenuItem key={option} value={option} sx={{ fontSize: '0.75rem' }}>
//                             {option}
//                           </MenuItem>
//                         ))}
//                       </Select>
//                     </FormControl>
//                     <Typography sx={{ fontSize: '0.65rem', color: COLORS.text.tertiary, mt: 0.5 }}>
//                       {formData.bom_category === 'Standard' 
//                         ? '✓ Standard BOM cannot have components' 
//                         : '✓ Assembly BOM requires at least one component'}
//                     </Typography>
//                   </Box>
//                 </Grid>
                
//                 <Grid size={{ xs: 12, sm: 6 }}>
//                   <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//                     <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary }}>
//                       EFFECTIVE FROM <span style={{ color: '#EF4444' }}>*</span>
//                     </Typography>
//                     <TextField
//                       fullWidth
//                       type="date"
//                       size="small"
//                       name="effective_from"
//                       value={formData.effective_from}
//                       onChange={handleChange}
//                       error={!!fieldErrors.effective_from}
//                       helperText={fieldErrors.effective_from}
//                       sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5, fontSize: '0.75rem' } }}
//                       InputLabelProps={{ shrink: true }}
//                     />
//                   </Box>
//                 </Grid>
                
//                 <Grid size={{ xs: 12, sm: 6 }}>
//                   <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//                     <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary }}>
//                       EFFECTIVE TO
//                     </Typography>
//                     <TextField
//                       fullWidth
//                       type="date"
//                       size="small"
//                       name="effective_to"
//                       value={formData.effective_to}
//                       onChange={handleChange}
//                       sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5, fontSize: '0.75rem' } }}
//                       InputLabelProps={{ shrink: true }}
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
//             <Paper sx={{ 
//               p: 2, 
//               bgcolor: COLORS.background.white, 
//               borderRadius: 1.5, 
//               border: `1px solid ${COLORS.border}`,
//               boxShadow: 'none'
//             }}>
//               <Typography sx={{ 
//                 fontSize: '0.8rem', 
//                 fontWeight: 600, 
//                 color: COLORS.primary, 
//                 mb: 1.5 
//               }}>
//                 <ProductionIcon sx={{ fontSize: '1rem', mr: 0.5, verticalAlign: 'middle' }} />
//                 Production Parameters
//               </Typography>
              
//               <Grid container spacing={1.5}>
//                 <Grid size={{ xs: 12, sm: 6 }}>
//                   <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//                     <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary }}>
//                       Batch Size
//                     </Typography>
//                     <TextField
//                       fullWidth
//                       type="number"
//                       size="small"
//                       name="batch_size"
//                       value={formData.batch_size}
//                       onChange={handleChange}
//                       sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5, fontSize: '0.75rem' } }}
//                     />
//                   </Box>
//                 </Grid>
                
//                 <Grid size={{ xs: 12, sm: 6 }}>
//                   <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//                     <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary }}>
//                       Yield (%)
//                     </Typography>
//                     <TextField
//                       fullWidth
//                       type="number"
//                       size="small"
//                       name="yield_percent"
//                       value={formData.yield_percent}
//                       onChange={handleChange}
//                       sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5, fontSize: '0.75rem' } }}
//                     />
//                   </Box>
//                 </Grid>
                
//                 <Grid size={{ xs: 12, sm: 6 }}>
//                   <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//                     <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary }}>
//                       Setup Time (min)
//                     </Typography>
//                     <TextField
//                       fullWidth
//                       type="number"
//                       size="small"
//                       name="setup_time_min"
//                       value={formData.setup_time_min}
//                       onChange={handleChange}
//                       sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5, fontSize: '0.75rem' } }}
//                     />
//                   </Box>
//                 </Grid>
                
//                 <Grid size={{ xs: 12, sm: 6 }}>
//                   <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//                     <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary }}>
//                       Cycle Time (min)
//                     </Typography>
//                     <TextField
//                       fullWidth
//                       type="number"
//                       size="small"
//                       name="cycle_time_min"
//                       value={formData.cycle_time_min}
//                       onChange={handleChange}
//                       sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5, fontSize: '0.75rem' } }}
//                     />
//                   </Box>
//                 </Grid>
//               </Grid>
//             </Paper>
//           </Stack>
//         );
        
//       case 2:
//         return (
//           <Stack spacing={2}>
//             <Paper sx={{ 
//               p: 2, 
//               bgcolor: COLORS.background.white, 
//               borderRadius: 1.5, 
//               border: `1px solid ${COLORS.border}`,
//               boxShadow: 'none'
//             }}>
//               <Typography sx={{ 
//                 fontSize: '0.8rem', 
//                 fontWeight: 600, 
//                 color: COLORS.primary, 
//                 mb: 1.5 
//               }}>
//                 <InventoryIcon sx={{ fontSize: '1rem', mr: 0.5, verticalAlign: 'middle' }} />
//                 Components <span style={{ color: '#EF4444' }}>*</span>
//               </Typography>
              
//               {formData.bom_category === 'Standard' && (
//                 <Alert severity="info" sx={{ mb: 2, borderRadius: 1.5, fontSize: '0.75rem' }}>
//                   Standard BOM cannot have components. Components are disabled. Change BOM Category to "Assembly" to add components.
//                 </Alert>
//               )}
              
//               {components.map((component, index) => (
//                 <Paper
//                   key={index}
//                   sx={{
//                     p: 2,
//                     mb: 2,
//                     bgcolor: formData.bom_category === 'Standard' ? '#f5f5f5' : COLORS.background.light,
//                     borderRadius: 1.5,
//                     border: `1px solid ${COLORS.border}`,
//                     opacity: formData.bom_category === 'Standard' ? 0.7 : 1,
//                     pointerEvents: formData.bom_category === 'Standard' ? 'none' : 'auto'
//                   }}
//                 >
//                   <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.5 }}>
//                     <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary }}>
//                       Component {index + 1}
//                     </Typography>
//                     {components.length > 1 && formData.bom_category === 'Assembly' && (
//                       <IconButton
//                         size="small"
//                         onClick={() => removeComponent(index)}
//                         sx={{ color: '#EF4444' }}
//                       >
//                         <DeleteIcon fontSize="small" />
//                       </IconButton>
//                     )}
//                   </Stack>
                  
//                   <Grid container spacing={1.5}>
//                     <Grid size={{ xs: 12 }}>
//                       <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//                         <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary }}>
//                           COMPONENT ITEM <span style={{ color: '#EF4444' }}>*</span>
//                         </Typography>
//                         <Autocomplete
//                           fullWidth
//                           options={componentItems}
//                           getOptionLabel={(option) => `${option.part_no} - ${option.part_description}`}
//                           value={componentItems.find(item => item._id === component.component_item_id) || null}
//                           onChange={(event, newValue) => handleComponentChange(index, 'component_item_id', newValue?._id || '')}
//                           loading={loadingItems}
//                           disabled={formData.bom_category === 'Standard'}
//                           renderInput={(params) => (
//                             <TextField
//                               {...params}
//                               size="small"
//                               error={!!fieldErrors[`comp_${index}_component_item_id`]}
//                               helperText={fieldErrors[`comp_${index}_component_item_id`]}
//                               sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5, fontSize: '0.75rem' } }}
//                             />
//                           )}
//                         />
//                       </Box>
//                     </Grid>
                    
//                     <Grid size={{ xs: 6, sm: 3 }}>
//                       <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//                         <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary }}>
//                           QUANTITY PER <span style={{ color: '#EF4444' }}>*</span>
//                         </Typography>
//                         <TextField
//                           fullWidth
//                           type="number"
//                           size="small"
//                           value={component.quantity_per}
//                           onChange={(e) => handleComponentChange(index, 'quantity_per', e.target.value)}
//                           error={!!fieldErrors[`comp_${index}_quantity_per`]}
//                           helperText={fieldErrors[`comp_${index}_quantity_per`]}
//                           disabled={formData.bom_category === 'Standard'}
//                           sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5, fontSize: '0.75rem' } }}
//                         />
//                       </Box>
//                     </Grid>
                    
//                     <Grid size={{ xs: 6, sm: 2 }}>
//                       <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//                         <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary }}>
//                           UNIT
//                         </Typography>
//                         <FormControl fullWidth size="small">
//                           <Select
//                             value={component.unit}
//                             onChange={(e) => handleComponentChange(index, 'unit', e.target.value)}
//                             disabled={formData.bom_category === 'Standard'}
//                             sx={{ borderRadius: 1.5, fontSize: '0.75rem' }}
//                           >
//                             {UNIT_OPTIONS.map(option => (
//                               <MenuItem key={option} value={option} sx={{ fontSize: '0.75rem' }}>
//                                 {option}
//                               </MenuItem>
//                             ))}
//                           </Select>
//                         </FormControl>
//                       </Box>
//                     </Grid>
                    
//                     <Grid size={{ xs: 6, sm: 2 }}>
//                       <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//                         <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary }}>
//                           SCRAP %
//                         </Typography>
//                         <TextField
//                           fullWidth
//                           type="number"
//                           size="small"
//                           value={component.scrap_percent}
//                           onChange={(e) => handleComponentChange(index, 'scrap_percent', e.target.value)}
//                           disabled={formData.bom_category === 'Standard'}
//                           sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5, fontSize: '0.75rem' } }}
//                         />
//                       </Box>
//                     </Grid>
                    
//                     <Grid size={{ xs: 12, sm: 5 }}>
//                       <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//                         <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary }}>
//                           REFERENCE DESIGNATOR
//                         </Typography>
//                         <TextField
//                           fullWidth
//                           size="small"
//                           value={component.reference_designator}
//                           onChange={(e) => handleComponentChange(index, 'reference_designator', e.target.value)}
//                           placeholder="e.g., R1, C2, U3"
//                           disabled={formData.bom_category === 'Standard'}
//                           sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5, fontSize: '0.75rem' } }}
//                         />
//                       </Box>
//                     </Grid>
                    
//                     <Grid size={{ xs: 12, sm: 7 }}>
//                       <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//                         <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary }}>
//                           REMARKS
//                         </Typography>
//                         <TextField
//                           fullWidth
//                           size="small"
//                           value={component.remarks}
//                           onChange={(e) => handleComponentChange(index, 'remarks', e.target.value)}
//                           placeholder="Additional notes..."
//                           disabled={formData.bom_category === 'Standard'}
//                           sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5, fontSize: '0.75rem' } }}
//                         />
//                       </Box>
//                     </Grid>
//                   </Grid>
//                 </Paper>
//               ))}
              
//               <Button
//                 variant="outlined"
//                 startIcon={<AddIcon sx={{ fontSize: '1rem' }} />}
//                 onClick={addComponent}
//                 disabled={formData.bom_category === 'Standard'}
//                 sx={{
//                   height: 32,
//                   px: 2,
//                   borderRadius: 1.5,
//                   border: `1px solid ${COLORS.border}`,
//                   color: formData.bom_category === 'Standard' ? COLORS.text.tertiary : COLORS.text.secondary,
//                   fontSize: '0.7rem',
//                   fontWeight: 500,
//                   textTransform: 'none',
//                   '&:hover': {
//                     borderColor: formData.bom_category === 'Standard' ? COLORS.border : COLORS.primary,
//                     bgcolor: formData.bom_category === 'Standard' ? 'transparent' : `${COLORS.primary}10`
//                   }
//                 }}
//               >
//                 Add Component
//               </Button>
//             </Paper>
//           </Stack>
//         );
        
//       case 3:
//         return (
//           <Stack spacing={2}>
//             <Paper sx={{ 
//               p: 2, 
//               bgcolor: COLORS.background.white, 
//               borderRadius: 1.5, 
//               border: `1px solid ${COLORS.border}`,
//               boxShadow: 'none'
//             }}>
//               <Typography sx={{ 
//                 fontSize: '0.8rem', 
//                 fontWeight: 600, 
//                 color: COLORS.primary, 
//                 mb: 1.5 
//               }}>
//                 <InfoIcon sx={{ fontSize: '1rem', mr: 0.5, verticalAlign: 'middle' }} />
//                 Review & Submit
//               </Typography>
              
//               <Stack spacing={2}>
//                 <Paper sx={{ p: 2, bgcolor: COLORS.background.light, borderRadius: 1.5 }}>
//                   <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: COLORS.primary, mb: 1 }}>
//                     Basic Information
//                   </Typography>
//                   <Grid container spacing={1}>
//                     <Grid size={{ xs: 6 }}>
//                       <Typography sx={{ fontSize: '0.7rem', color: COLORS.text.secondary }}>Parent Item:</Typography>
//                     </Grid>
//                     <Grid size={{ xs: 6 }}>
//                       <Typography sx={{ fontSize: '0.7rem', fontWeight: 500 }}>
//                         {parentItems.find(item => item._id === formData.parent_item_id)?.part_no || '-'}
//                       </Typography>
//                     </Grid>
//                     <Grid size={{ xs: 6 }}>
//                       <Typography sx={{ fontSize: '0.7rem', color: COLORS.text.secondary }}>BOM Version:</Typography>
//                     </Grid>
//                     <Grid size={{ xs: 6 }}>
//                       <Typography sx={{ fontSize: '0.7rem', fontWeight: 500 }}>{formData.bom_version}</Typography>
//                     </Grid>
//                     <Grid size={{ xs: 6 }}>
//                       <Typography sx={{ fontSize: '0.7rem', color: COLORS.text.secondary }}>BOM Type:</Typography>
//                     </Grid>
//                     <Grid size={{ xs: 6 }}>
//                       <Typography sx={{ fontSize: '0.7rem', fontWeight: 500 }}>{formData.bom_type}</Typography>
//                     </Grid>
//                     <Grid size={{ xs: 6 }}>
//                       <Typography sx={{ fontSize: '0.7rem', color: COLORS.text.secondary }}>BOM Category:</Typography>
//                     </Grid>
//                     <Grid size={{ xs: 6 }}>
//                       <Typography sx={{ fontSize: '0.7rem', fontWeight: 500 }}>{formData.bom_category}</Typography>
//                     </Grid>
//                     <Grid size={{ xs: 6 }}>
//                       <Typography sx={{ fontSize: '0.7rem', color: COLORS.text.secondary }}>Status:</Typography>
//                     </Grid>
//                     <Grid size={{ xs: 6 }}>
//                       <Typography sx={{ fontSize: '0.7rem', fontWeight: 500 }}>{formData.status}</Typography>
//                     </Grid>
//                     <Grid size={{ xs: 6 }}>
//                       <Typography sx={{ fontSize: '0.7rem', color: COLORS.text.secondary }}>Effective From:</Typography>
//                     </Grid>
//                     <Grid size={{ xs: 6 }}>
//                       <Typography sx={{ fontSize: '0.7rem', fontWeight: 500 }}>{formData.effective_from}</Typography>
//                     </Grid>
//                     {formData.effective_to && (
//                       <>
//                         <Grid size={{ xs: 6 }}>
//                           <Typography sx={{ fontSize: '0.7rem', color: COLORS.text.secondary }}>Effective To:</Typography>
//                         </Grid>
//                         <Grid size={{ xs: 6 }}>
//                           <Typography sx={{ fontSize: '0.7rem', fontWeight: 500 }}>{formData.effective_to}</Typography>
//                         </Grid>
//                       </>
//                     )}
//                   </Grid>
//                 </Paper>
                
//                 <Paper sx={{ p: 2, bgcolor: COLORS.background.light, borderRadius: 1.5 }}>
//                   <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: COLORS.primary, mb: 1 }}>
//                     Production Parameters
//                   </Typography>
//                   <Grid container spacing={1}>
//                     <Grid size={{ xs: 6 }}>
//                       <Typography sx={{ fontSize: '0.7rem', color: COLORS.text.secondary }}>Batch Size:</Typography>
//                     </Grid>
//                     <Grid size={{ xs: 6 }}>
//                       <Typography sx={{ fontSize: '0.7rem', fontWeight: 500 }}>{formData.batch_size}</Typography>
//                     </Grid>
//                     <Grid size={{ xs: 6 }}>
//                       <Typography sx={{ fontSize: '0.7rem', color: COLORS.text.secondary }}>Yield:</Typography>
//                     </Grid>
//                     <Grid size={{ xs: 6 }}>
//                       <Typography sx={{ fontSize: '0.7rem', fontWeight: 500 }}>{formData.yield_percent}%</Typography>
//                     </Grid>
//                     <Grid size={{ xs: 6 }}>
//                       <Typography sx={{ fontSize: '0.7rem', color: COLORS.text.secondary }}>Setup Time:</Typography>
//                     </Grid>
//                     <Grid size={{ xs: 6 }}>
//                       <Typography sx={{ fontSize: '0.7rem', fontWeight: 500 }}>{formData.setup_time_min} min</Typography>
//                     </Grid>
//                     <Grid size={{ xs: 6 }}>
//                       <Typography sx={{ fontSize: '0.7rem', color: COLORS.text.secondary }}>Cycle Time:</Typography>
//                     </Grid>
//                     <Grid size={{ xs: 6 }}>
//                       <Typography sx={{ fontSize: '0.7rem', fontWeight: 500 }}>{formData.cycle_time_min} min</Typography>
//                     </Grid>
//                   </Grid>
//                 </Paper>
                
//                 <Paper sx={{ p: 2, bgcolor: COLORS.background.light, borderRadius: 1.5 }}>
//                   <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: COLORS.primary, mb: 1 }}>
//                     Components ({components.filter(c => c.component_item_id).length})
//                   </Typography>
//                   {components.filter(c => c.component_item_id).length > 0 ? (
//                     components.map((comp, idx) => (
//                       comp.component_item_id && (
//                         <Box key={idx} sx={{ mb: 1, pb: 1, borderBottom: idx < components.length - 1 ? `1px solid ${COLORS.border}` : 'none' }}>
//                           <Typography sx={{ fontSize: '0.7rem', fontWeight: 500 }}>
//                             {comp.component_part_no || 'Not selected'}
//                           </Typography>
//                           <Typography sx={{ fontSize: '0.65rem', color: COLORS.text.secondary }}>
//                             Qty: {comp.quantity_per} {comp.unit} | Scrap: {comp.scrap_percent}%
//                           </Typography>
//                         </Box>
//                       )
//                     ))
//                   ) : (
//                     <Typography sx={{ fontSize: '0.7rem', color: COLORS.text.tertiary }}>
//                       No components added {formData.bom_category === 'Standard' ? '(Standard BOM)' : ''}
//                     </Typography>
//                   )}
//                 </Paper>
//               </Stack>
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
//           borderRadius: 2,
//           boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05)',
//           border: `1px solid ${COLORS.border}`,
//           overflow: 'hidden',
//           maxHeight: '90vh',
//           display: 'flex',
//           flexDirection: 'column'
//         }
//       }}
//       BackdropProps={{
//         sx: {
//           backgroundColor: 'rgba(0, 0, 0, 0.5)',
//         }
//       }}
//     >
//       <DialogTitle sx={{
//         borderBottom: `1px solid ${COLORS.border}`,
//         py: 1.5,
//         px: 2.5,
//         bgcolor: COLORS.background.white,
//         display: 'flex',
//         justifyContent: 'space-between',
//         alignItems: 'center',
//         flexShrink: 0
//       }}>
//         <Typography sx={{ fontSize: '1.2rem', fontWeight: 700, color: COLORS.text.primary }}>
//           Add New BOM
//         </Typography>
//         <IconButton onClick={handleClose} size="small">
//           <CloseIcon fontSize="small" />
//         </IconButton>
//       </DialogTitle>
      
//       <Box sx={{ px: 2.5, pt: 2, bgcolor: COLORS.background.white, flexShrink: 0 }}>
//         <Stepper
//           activeStep={activeStep}
//           alternativeLabel
//           connector={<ColorConnector />}
//         >
//           {MAIN_STEPS.map((label) => (
//             <Step key={label}>
//               <StepLabel>
//                 <Typography sx={{ fontSize: '0.75rem', fontWeight: 500, color: COLORS.text.secondary }}>
//                   {label}
//                 </Typography>
//               </StepLabel>
//             </Step>
//           ))}
//         </Stepper>
//       </Box>
      
//       <DialogContent sx={{ 
//         p: 2.5, 
//         bgcolor: COLORS.background.white,
//         flex: 1,
//         overflowY: 'auto',
//         '&::-webkit-scrollbar': {
//           width: '6px',
//         },
//         '&::-webkit-scrollbar-track': {
//           background: '#f1f1f1',
//           borderRadius: '3px',
//         },
//         '&::-webkit-scrollbar-thumb': {
//           background: '#c1c1c1',
//           borderRadius: '3px',
//         },
//         '&::-webkit-scrollbar-thumb:hover': {
//           background: '#a8a8a8',
//         }
//       }}>
//         {renderStepContent(activeStep)}
        
//         {error && (
//           <Alert 
//             severity={error.includes('Warning') || error.includes('Components cleared') ? 'warning' : 'error'} 
//             sx={{ 
//               mt: 2, 
//               borderRadius: 1.5,
//               fontSize: '0.75rem',
//               py: 0.5
//             }}
//           >
//             <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.75rem' }}>
//               {error.includes('Warning') || error.includes('Components cleared') ? 'Warning' : 'Validation Error'}
//             </Typography>
//             <Typography variant="body2" sx={{ fontSize: '0.7rem', whiteSpace: 'pre-wrap' }}>
//               {error}
//             </Typography>
//           </Alert>
//         )}
//       </DialogContent>
      
//       <DialogActions sx={{
//         px: 2.5,
//         py: 1.5,
//         borderTop: `1px solid ${COLORS.border}`,
//         bgcolor: COLORS.background.white,
//         justifyContent: 'space-between',
//         flexShrink: 0
//       }}>
//         <Button
//           onClick={handleBack}
//           disabled={activeStep === 0 || loading}
//           size="small"
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
//         <Box>
//           <Button
//             onClick={handleClose}
//             disabled={loading}
//             size="small"
//             sx={{
//               height: 32,
//               px: 2,
//               mr: 1,
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
//           {activeStep === MAIN_STEPS.length - 1 ? (
//             <Button
//               variant="contained"
//               onClick={handleSubmit}
//               disabled={loading}
//               size="small"
//               startIcon={<AddIcon sx={{ fontSize: '1rem' }} />}
//               sx={{
//                 height: 32,
//                 px: 2,
//                 borderRadius: 1.5,
//                 bgcolor: COLORS.primary,
//                 fontSize: '0.7rem',
//                 fontWeight: 500,
//                 textTransform: 'none',
//                 '&:hover': { bgcolor: COLORS.primaryDark }
//               }}
//             >
//               {loading ? 'Adding...' : 'Add BOM'}
//             </Button>
//           ) : (
//             <Button
//               variant="contained"
//               onClick={handleNext}
//               disabled={loading}
//               size="small"
//               endIcon={<NavigateNextIcon sx={{ fontSize: '1rem' }} />}
//               sx={{
//                 height: 32,
//                 px: 2,
//                 borderRadius: 1.5,
//                 bgcolor: COLORS.primary,
//                 fontSize: '0.7rem',
//                 fontWeight: 500,
//                 textTransform: 'none',
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

// export default AddBom;



import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Typography,
  Button,
  Stack,
  Grid,
  Paper,
  IconButton,
  Autocomplete,
  FormControl,
  Select,
  MenuItem,
  Alert,
  Stepper,
  Step,
  StepLabel,
  StepConnector,
  stepConnectorClasses,
  styled,
  Divider,
  InputAdornment,
  Chip
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Close as CloseIcon,
  Inventory as InventoryIcon,
  ProductionQuantityLimits as ProductionIcon,
  Info as InfoIcon,
  NavigateNext as NavigateNextIcon,
  NavigateBefore as NavigateBeforeIcon,
  Search as SearchIcon
} from '@mui/icons-material';
import axios from 'axios';
import BASE_URL from '../../../../config/Config';

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
    light: '#F8FFFC',
    hover: '#F0FDF9'
  },
  border: '#E3E8EF'
};

// Enums
const BOM_TYPE_OPTIONS = ['Manufacturing', 'Subcontract', 'Phantom', 'Variant'];
const STATUS_OPTIONS = ['Pending', 'Active', 'Approved', 'Cancelled', 'Archived'];
const UNIT_OPTIONS = ['Nos', 'Kg', 'Meter', 'Set', 'Piece', 'Sheet', 'Roll'];
const BOM_CATEGORY_OPTIONS = ['Standard', 'Assembly'];
const ITEM_CATEGORY_OPTIONS = ['Finished Good', 'Semi-Finished'];
const ITEM_TYPE_OPTIONS = ['Busbar', 'Stamping', 'Gasket', 'Tooling', 'Copper Strip', 'Aluminium Profile', 'Rubber Sheet', 'Cork', 'Other'];
const PROCUREMENT_TYPE_OPTIONS = ['Purchase', 'Manufacture', 'Subcontract', 'Free Issue'];

// Parent Item Stepper Steps
const PARENT_ITEM_STEPS = ['Basic Info', 'Material & Drawing', 'Dimensions & Parameters', 'Rates & Inventory'];

const MAIN_STEPS = ['Basic Information', 'Production Parameters', 'Components', 'Review & Submit'];

// Custom Stepper Connector
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

// Custom Paper for dropdowns
const CustomPaper = styled(Paper)({
  maxHeight: 200,
  overflow: 'auto',
  '&::-webkit-scrollbar': {
    display: 'none'
  },
  scrollbarWidth: 'none',
  '-ms-overflow-style': 'none'
});

const AddBom = ({ open, onClose, onAdd }) => {
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  
  // Data from APIs
  const [parentItems, setParentItems] = useState([]);
  const [componentItems, setComponentItems] = useState([]);
  const [loadingItems, setLoadingItems] = useState(false);
  
  // Add Parent Item form state (inline within dialog)
  const [showAddParentForm, setShowAddParentForm] = useState(false);
  const [parentActiveStep, setParentActiveStep] = useState(0);
  const [addParentLoading, setAddParentLoading] = useState(false);
  const [addParentError, setAddParentError] = useState('');
  const [parentFieldErrors, setParentFieldErrors] = useState({});
  const [parentTouched, setParentTouched] = useState({});
  
  // Parent item fields – aligned with API response
  const [newParentData, setNewParentData] = useState({
    // Basic Info
    part_no: '',
    part_name: '',
    item_category: '',
    item_type: '',
    unit: 'Kg',
    part_description: '',
    weight_per_unit_kg: '',
    
    // Material & Drawing
    material: '',
    material_grade: '',
    material_standard: '',
    material_color: '',
    density: '',
    drawing_no: '',
    revision_no: '',
    
    // Dimensions & Parameters
    thickness: '',
    width: '',
    strip_size: '',
    pitch: '',
    no_of_cavity: 1,
    
    // Rates & Inventory
    hsn_code: '',
    gst_percentage: 18,
    procurement_type: 'Purchase',
    rm_rejection_percent: 2,
    scrap_realisation_percent: 85,
    lead_time_days: '',
    reorder_level: '',
    reorder_qty: '',
    safety_stock: '',
    min_stock: '',
    max_stock: '',
    shelf_life_days: ''
  });
  
  // Form data
  const [formData, setFormData] = useState({
    parent_item_id: '',
    bom_version: 'v1.0',
    bom_type: 'Manufacturing',
    status: 'Pending',
    batch_size: 1,
    yield_percent: 100,
    setup_time_min: 30,
    cycle_time_min: 5.5,
    effective_from: new Date().toISOString().split('T')[0],
    effective_to: '',
    created_by: localStorage.getItem('userId') || '',
    bom_category: 'Standard'
  });
  
  const [components, setComponents] = useState([
    {
      level: 1,
      component_item_id: '',
      component_part_no: '',
      component_desc: '',
      quantity_per: 1,
      unit: 'Nos',
      scrap_percent: 0,
      is_phantom: false,
      is_subcontract: false,
      subcontract_vendor: null,
      reference_designator: '',
      remarks: ''
    }
  ]);

  // Options for dropdowns
  const materialOptions = ['Steel', 'Copper', 'Aluminium', 'Brass', 'Stainless Steel', 'Plastic', 'Other'];

  // Fetch parent items (item_role = 'parent')
  const fetchParentItems = useCallback(async () => {
    try {
      setLoadingItems(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(`${BASE_URL}/api/items`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.data.success) {
        const parents = response.data.data.filter(item => item.item_role === 'parent');
        setParentItems(parents);
      }
    } catch (err) {
      console.error('Error fetching parent items:', err);
    } finally {
      setLoadingItems(false);
    }
  }, []);
  
  // Fetch component items (item_role = 'component')
  const fetchComponentItems = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${BASE_URL}/api/items`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.data.success) {
        const components = response.data.data.filter(item => item.item_role === 'component');
        setComponentItems(components);
      }
    } catch (err) {
      console.error('Error fetching component items:', err);
    }
  }, []);
  
  useEffect(() => {
    if (open) {
      fetchParentItems();
      fetchComponentItems();
    }
  }, [open, fetchParentItems, fetchComponentItems]);

  // Handle parent item form changes
  const handleParentFormChange = (e) => {
    const { name, value } = e.target;
    setNewParentData(prev => ({
      ...prev,
      [name]: value
    }));
    setAddParentError('');
    if (parentTouched[name]) {
      setParentFieldErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleParentBlur = (e) => {
    const { name } = e.target;
    setParentTouched(prev => ({ ...prev, [name]: true }));
  };

  const validateParentStep = (step) => {
    const errors = {};
    let isValid = true;

    switch (step) {
      case 0: // Basic Info
        if (!newParentData.part_no.trim()) {
          errors.part_no = 'Part Number is required';
          isValid = false;
        }
        if (!newParentData.part_name.trim()) {
          errors.part_name = 'Part Name is required';
          isValid = false;
        }
        if (!newParentData.item_category) {
          errors.item_category = 'Item Category is required';
          isValid = false;
        }
        if (!newParentData.item_type) {
          errors.item_type = 'Item Type is required';
          isValid = false;
        }
        if (!newParentData.unit) {
          errors.unit = 'Unit is required';
          isValid = false;
        }
        if (newParentData.unit !== 'Kg' && !newParentData.weight_per_unit_kg) {
          errors.weight_per_unit_kg = 'Weight per unit is required when unit is not Kg';
          isValid = false;
        }
        break;

      case 1: // Material & Drawing
        if (!newParentData.density) {
          errors.density = 'Density is required';
          isValid = false;
        }
        if (!newParentData.drawing_no) {
          errors.drawing_no = 'Drawing No is required';
          isValid = false;
        }
        break;

      case 2: // Dimensions & Parameters
        // All optional, but we can validate numeric fields
        if (newParentData.thickness && isNaN(newParentData.thickness)) {
          errors.thickness = 'Thickness must be a number';
          isValid = false;
        }
        if (newParentData.width && isNaN(newParentData.width)) {
          errors.width = 'Width must be a number';
          isValid = false;
        }
        if (newParentData.strip_size && isNaN(newParentData.strip_size)) {
          errors.strip_size = 'Strip size must be a number';
          isValid = false;
        }
        break;

      case 3: // Rates & Inventory
        if (!newParentData.hsn_code) {
          errors.hsn_code = 'HSN Code is required';
          isValid = false;
        }
        if (!newParentData.procurement_type) {
          errors.procurement_type = 'Procurement type is required';
          isValid = false;
        }
        break;

      default:
        return true;
    }

    setParentFieldErrors(errors);
    if (!isValid) {
      setAddParentError('Please fix the errors in this section');
    }
    return isValid;
  };

  const handleParentNext = () => {
    if (validateParentStep(parentActiveStep)) {
      setAddParentError('');
      setParentActiveStep(prev => prev + 1);
    }
  };

  const handleParentBack = () => {
    setAddParentError('');
    setParentActiveStep(prev => prev - 1);
  };

  // Handle add parent item submit (called when user clicks "Add Item" in the last step)
  const handleAddParentSubmit = async () => {
    // Validate all steps
    let allValid = true;
    for (let i = 0; i < 4; i++) {
      if (!validateParentStep(i)) {
        allValid = false;
        setParentActiveStep(i);
        break;
      }
    }

    if (!allValid) {
      setAddParentError('Please fix all validation errors');
      return;
    }

    setAddParentLoading(true);
    setAddParentError('');

    try {
      const token = localStorage.getItem('token');
      
      // Build payload matching API fields
      const payload = {
        part_no: newParentData.part_no,
        part_name: newParentData.part_name,
        part_description: newParentData.part_description || '',
        item_category: newParentData.item_category,
        item_type: newParentData.item_type,
        unit: newParentData.unit,
        weight_per_unit_kg: newParentData.weight_per_unit_kg ? Number(newParentData.weight_per_unit_kg) : undefined,
        material: newParentData.material || '',
        material_grade: newParentData.material_grade || '',
        material_standard: newParentData.material_standard || '',
        material_color: newParentData.material_color || '',
        density: newParentData.density ? Number(newParentData.density) : 0,
        drawing_no: newParentData.drawing_no || '',
        revision_no: newParentData.revision_no || '0',
        thickness: newParentData.thickness ? Number(newParentData.thickness) : undefined,
        width: newParentData.width ? Number(newParentData.width) : undefined,
        strip_size: newParentData.strip_size ? Number(newParentData.strip_size) : undefined,
        pitch: newParentData.pitch ? Number(newParentData.pitch) : undefined,
        no_of_cavity: newParentData.no_of_cavity ? Number(newParentData.no_of_cavity) : 1,
        hsn_code: newParentData.hsn_code || '',
        gst_percentage: newParentData.gst_percentage ? Number(newParentData.gst_percentage) : 18,
        procurement_type: newParentData.procurement_type || 'Purchase',
        rm_rejection_percent: newParentData.rm_rejection_percent ? Number(newParentData.rm_rejection_percent) : 2,
        scrap_realisation_percent: newParentData.scrap_realisation_percent ? Number(newParentData.scrap_realisation_percent) : 85,
        lead_time_days: newParentData.lead_time_days ? Number(newParentData.lead_time_days) : undefined,
        reorder_level: newParentData.reorder_level ? Number(newParentData.reorder_level) : undefined,
        reorder_qty: newParentData.reorder_qty ? Number(newParentData.reorder_qty) : undefined,
        safety_stock: newParentData.safety_stock ? Number(newParentData.safety_stock) : undefined,
        min_stock: newParentData.min_stock ? Number(newParentData.min_stock) : undefined,
        max_stock: newParentData.max_stock ? Number(newParentData.max_stock) : undefined,
        shelf_life_days: newParentData.shelf_life_days ? Number(newParentData.shelf_life_days) : undefined,
        item_role: 'parent'
      };

      // Remove undefined fields
      Object.keys(payload).forEach(key => {
        if (payload[key] === undefined || payload[key] === null || payload[key] === '') {
          delete payload[key];
        }
      });

      const response = await axios.post(`${BASE_URL}/api/items`, payload, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.data.success) {
        const newItem = response.data.data;
        // Add to parent items list
        setParentItems(prev => [...prev, newItem]);
        // Auto-select the new item
        setFormData(prev => ({ ...prev, parent_item_id: newItem._id }));
        // Close the add form
        setShowAddParentForm(false);
        // Reset form
        resetParentFormData();
        // Clear error
        setFieldErrors(prev => ({ ...prev, parent_item_id: '' }));
      } else {
        setAddParentError(response.data.message || 'Failed to add item');
      }
    } catch (err) {
      console.error('Error adding item:', err);
      setAddParentError(err.response?.data?.message || 'Failed to add item. Please try again.');
    } finally {
      setAddParentLoading(false);
    }
  };

  // Helper to reset parent form data
  const resetParentFormData = () => {
    setNewParentData({
      part_no: '',
      part_name: '',
      item_category: '',
      item_type: '',
      unit: 'Kg',
      part_description: '',
      weight_per_unit_kg: '',
      material: '',
      material_grade: '',
      material_standard: '',
      material_color: '',
      density: '',
      drawing_no: '',
      revision_no: '',
      thickness: '',
      width: '',
      strip_size: '',
      pitch: '',
      no_of_cavity: 1,
      hsn_code: '',
      gst_percentage: 18,
      procurement_type: 'Purchase',
      rm_rejection_percent: 2,
      scrap_realisation_percent: 85,
      lead_time_days: '',
      reorder_level: '',
      reorder_qty: '',
      safety_stock: '',
      min_stock: '',
      max_stock: '',
      shelf_life_days: ''
    });
    setParentActiveStep(0);
    setParentFieldErrors({});
    setParentTouched({});
    setAddParentError('');
  };

  // Render parent item step content
  const renderParentStepContent = (step) => {
    switch (step) {
      case 0: // Basic Info
        return (
          <Grid container spacing={1.5}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary }}>
                  PART NUMBER <span style={{ color: '#EF4444' }}>*</span>
                </Typography>
                <TextField
                  fullWidth
                  size="small"
                  name="part_no"
                  value={newParentData.part_no}
                  onChange={handleParentFormChange}
                  onBlur={handleParentBlur}
                  placeholder="e.g., BR-001"
                  disabled={addParentLoading}
                  error={!!parentFieldErrors.part_no}
                  helperText={parentFieldErrors.part_no}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5, fontSize: '0.75rem' } }}
                />
              </Box>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary }}>
                  PART NAME <span style={{ color: '#EF4444' }}>*</span>
                </Typography>
                <TextField
                  fullWidth
                  size="small"
                  name="part_name"
                  value={newParentData.part_name}
                  onChange={handleParentFormChange}
                  onBlur={handleParentBlur}
                  placeholder="e.g., Copper Busbar 100x10mm"
                  disabled={addParentLoading}
                  error={!!parentFieldErrors.part_name}
                  helperText={parentFieldErrors.part_name}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5, fontSize: '0.75rem' } }}
                />
              </Box>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary }}>
                  ITEM CATEGORY <span style={{ color: '#EF4444' }}>*</span>
                </Typography>
                <FormControl fullWidth size="small" error={!!parentFieldErrors.item_category}>
                  <Select
                    name="item_category"
                    value={newParentData.item_category}
                    onChange={handleParentFormChange}
                    onBlur={handleParentBlur}
                    disabled={addParentLoading}
                    displayEmpty
                    sx={{ borderRadius: 1.5, fontSize: '0.75rem' }}
                  >
                    <MenuItem value="" sx={{ fontSize: '0.75rem', color: COLORS.text.tertiary }}>Select category</MenuItem>
                    {ITEM_CATEGORY_OPTIONS.map(option => (
                      <MenuItem key={option} value={option} sx={{ fontSize: '0.75rem' }}>{option}</MenuItem>
                    ))}
                  </Select>
                  {parentFieldErrors.item_category && (
                    <Typography sx={{ fontSize: '0.65rem', color: '#EF4444' }}>{parentFieldErrors.item_category}</Typography>
                  )}
                </FormControl>
              </Box>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary }}>
                  ITEM TYPE <span style={{ color: '#EF4444' }}>*</span>
                </Typography>
                <FormControl fullWidth size="small" error={!!parentFieldErrors.item_type}>
                  <Select
                    name="item_type"
                    value={newParentData.item_type}
                    onChange={handleParentFormChange}
                    onBlur={handleParentBlur}
                    disabled={addParentLoading}
                    displayEmpty
                    sx={{ borderRadius: 1.5, fontSize: '0.75rem' }}
                  >
                    <MenuItem value="" sx={{ fontSize: '0.75rem', color: COLORS.text.tertiary }}>Select type</MenuItem>
                    {ITEM_TYPE_OPTIONS.map(option => (
                      <MenuItem key={option} value={option} sx={{ fontSize: '0.75rem' }}>{option}</MenuItem>
                    ))}
                  </Select>
                  {parentFieldErrors.item_type && (
                    <Typography sx={{ fontSize: '0.65rem', color: '#EF4444' }}>{parentFieldErrors.item_type}</Typography>
                  )}
                </FormControl>
              </Box>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary }}>
                  UNIT <span style={{ color: '#EF4444' }}>*</span>
                </Typography>
                <FormControl fullWidth size="small" error={!!parentFieldErrors.unit}>
                  <Select
                    name="unit"
                    value={newParentData.unit}
                    onChange={handleParentFormChange}
                    onBlur={handleParentBlur}
                    disabled={addParentLoading}
                    sx={{ borderRadius: 1.5, fontSize: '0.75rem' }}
                  >
                    {UNIT_OPTIONS.map(option => (
                      <MenuItem key={option} value={option} sx={{ fontSize: '0.75rem' }}>{option}</MenuItem>
                    ))}
                  </Select>
                  {parentFieldErrors.unit && (
                    <Typography sx={{ fontSize: '0.65rem', color: '#EF4444' }}>{parentFieldErrors.unit}</Typography>
                  )}
                </FormControl>
              </Box>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary }}>
                  WEIGHT PER UNIT (kg)
                </Typography>
                <TextField
                  fullWidth
                  size="small"
                  name="weight_per_unit_kg"
                  type="number"
                  value={newParentData.weight_per_unit_kg}
                  onChange={handleParentFormChange}
                  onBlur={handleParentBlur}
                  placeholder="e.g., 0.85"
                  error={!!parentFieldErrors.weight_per_unit_kg}
                  helperText={parentFieldErrors.weight_per_unit_kg}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5, fontSize: '0.75rem' } }}
                  disabled={addParentLoading}
                  inputProps={{ step: '0.001', min: 0 }}
                />
                <Typography sx={{ fontSize: '0.65rem', color: COLORS.text.tertiary }}>
                  Required when unit is not Kg
                </Typography>
              </Box>
            </Grid>
            <Grid size={{ xs: 12 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary }}>
                  PART DESCRIPTION
                </Typography>
                <TextField
                  fullWidth
                  size="small"
                  name="part_description"
                  value={newParentData.part_description}
                  onChange={handleParentFormChange}
                  onBlur={handleParentBlur}
                  placeholder="Enter detailed part description"
                  multiline
                  rows={2}
                  disabled={addParentLoading}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5, fontSize: '0.75rem' } }}
                />
              </Box>
            </Grid>
          </Grid>
        );

      case 1: // Material & Drawing
        return (
          <Grid container spacing={1.5}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary }}>
                  MATERIAL
                </Typography>
                <FormControl fullWidth size="small">
                  <Select
                    name="material"
                    value={newParentData.material}
                    onChange={handleParentFormChange}
                    onBlur={handleParentBlur}
                    disabled={addParentLoading}
                    displayEmpty
                    sx={{ borderRadius: 1.5, fontSize: '0.75rem' }}
                  >
                    <MenuItem value="" sx={{ fontSize: '0.75rem', color: COLORS.text.tertiary }}>Select material</MenuItem>
                    {materialOptions.map(option => (
                      <MenuItem key={option} value={option} sx={{ fontSize: '0.75rem' }}>{option}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary }}>
                  MATERIAL GRADE
                </Typography>
                <TextField
                  fullWidth
                  size="small"
                  name="material_grade"
                  value={newParentData.material_grade}
                  onChange={handleParentFormChange}
                  onBlur={handleParentBlur}
                  placeholder="e.g., C11000"
                  disabled={addParentLoading}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5, fontSize: '0.75rem' } }}
                />
              </Box>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary }}>
                  MATERIAL STANDARD
                </Typography>
                <TextField
                  fullWidth
                  size="small"
                  name="material_standard"
                  value={newParentData.material_standard}
                  onChange={handleParentFormChange}
                  onBlur={handleParentBlur}
                  placeholder="e.g., ASTM B152"
                  disabled={addParentLoading}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5, fontSize: '0.75rem' } }}
                />
              </Box>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary }}>
                  MATERIAL COLOR
                </Typography>
                <TextField
                  fullWidth
                  size="small"
                  name="material_color"
                  value={newParentData.material_color}
                  onChange={handleParentFormChange}
                  onBlur={handleParentBlur}
                  placeholder="e.g., Reddish"
                  disabled={addParentLoading}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5, fontSize: '0.75rem' } }}
                />
              </Box>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary }}>
                  DENSITY (g/cm³) <span style={{ color: '#EF4444' }}>*</span>
                </Typography>
                <TextField
                  fullWidth
                  size="small"
                  name="density"
                  type="number"
                  value={newParentData.density}
                  onChange={handleParentFormChange}
                  onBlur={handleParentBlur}
                  placeholder="e.g., 8.96"
                  error={!!parentFieldErrors.density}
                  helperText={parentFieldErrors.density}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5, fontSize: '0.75rem' } }}
                  disabled={addParentLoading}
                  inputProps={{ step: '0.01', min: 0 }}
                />
              </Box>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary }}>
                  DRAWING NO <span style={{ color: '#EF4444' }}>*</span>
                </Typography>
                <TextField
                  fullWidth
                  size="small"
                  name="drawing_no"
                  value={newParentData.drawing_no}
                  onChange={handleParentFormChange}
                  onBlur={handleParentBlur}
                  placeholder="e.g., DRG-001"
                  error={!!parentFieldErrors.drawing_no}
                  helperText={parentFieldErrors.drawing_no}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5, fontSize: '0.75rem' } }}
                  disabled={addParentLoading}
                />
              </Box>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary }}>
                  REVISION NO
                </Typography>
                <TextField
                  fullWidth
                  size="small"
                  name="revision_no"
                  value={newParentData.revision_no}
                  onChange={handleParentFormChange}
                  onBlur={handleParentBlur}
                  placeholder="e.g., 0, A"
                  disabled={addParentLoading}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5, fontSize: '0.75rem' } }}
                />
              </Box>
            </Grid>
          </Grid>
        );

      case 2: // Dimensions & Parameters
        return (
          <Grid container spacing={1.5}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary }}>
                  THICKNESS (mm)
                </Typography>
                <TextField
                  fullWidth
                  size="small"
                  name="thickness"
                  type="number"
                  value={newParentData.thickness}
                  onChange={handleParentFormChange}
                  onBlur={handleParentBlur}
                  placeholder="e.g., 10"
                  error={!!parentFieldErrors.thickness}
                  helperText={parentFieldErrors.thickness}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5, fontSize: '0.75rem' } }}
                  disabled={addParentLoading}
                  inputProps={{ step: '0.01', min: 0 }}
                />
              </Box>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary }}>
                  WIDTH (mm)
                </Typography>
                <TextField
                  fullWidth
                  size="small"
                  name="width"
                  type="number"
                  value={newParentData.width}
                  onChange={handleParentFormChange}
                  onBlur={handleParentBlur}
                  placeholder="e.g., 100"
                  error={!!parentFieldErrors.width}
                  helperText={parentFieldErrors.width}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5, fontSize: '0.75rem' } }}
                  disabled={addParentLoading}
                  inputProps={{ step: '0.01', min: 0 }}
                />
              </Box>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary }}>
                  STRIP SIZE (mm)
                </Typography>
                <TextField
                  fullWidth
                  size="small"
                  name="strip_size"
                  type="number"
                  value={newParentData.strip_size}
                  onChange={handleParentFormChange}
                  onBlur={handleParentBlur}
                  placeholder="e.g., 3660"
                  error={!!parentFieldErrors.strip_size}
                  helperText={parentFieldErrors.strip_size}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5, fontSize: '0.75rem' } }}
                  disabled={addParentLoading}
                  inputProps={{ step: '0.01', min: 0 }}
                />
              </Box>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary }}>
                  PITCH (mm)
                </Typography>
                <TextField
                  fullWidth
                  size="small"
                  name="pitch"
                  type="number"
                  value={newParentData.pitch}
                  onChange={handleParentFormChange}
                  onBlur={handleParentBlur}
                  placeholder="e.g., 42"
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5, fontSize: '0.75rem' } }}
                  disabled={addParentLoading}
                  inputProps={{ step: '0.01', min: 0 }}
                />
              </Box>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary }}>
                  NO. OF CAVITIES
                </Typography>
                <TextField
                  fullWidth
                  size="small"
                  name="no_of_cavity"
                  type="number"
                  value={newParentData.no_of_cavity}
                  onChange={handleParentFormChange}
                  onBlur={handleParentBlur}
                  placeholder="e.g., 1"
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5, fontSize: '0.75rem' } }}
                  disabled={addParentLoading}
                  inputProps={{ step: '1', min: 1 }}
                />
              </Box>
            </Grid>
          </Grid>
        );

      case 3: // Rates & Inventory
        return (
          <Grid container spacing={1.5}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary }}>
                  HSN CODE <span style={{ color: '#EF4444' }}>*</span>
                </Typography>
                <TextField
                  fullWidth
                  size="small"
                  name="hsn_code"
                  value={newParentData.hsn_code}
                  onChange={handleParentFormChange}
                  onBlur={handleParentBlur}
                  placeholder="e.g., 74071010"
                  error={!!parentFieldErrors.hsn_code}
                  helperText={parentFieldErrors.hsn_code}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5, fontSize: '0.75rem' } }}
                  disabled={addParentLoading}
                />
              </Box>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary }}>
                  GST PERCENTAGE (%)
                </Typography>
                <TextField
                  fullWidth
                  size="small"
                  name="gst_percentage"
                  type="number"
                  value={newParentData.gst_percentage}
                  onChange={handleParentFormChange}
                  onBlur={handleParentBlur}
                  placeholder="e.g., 18"
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5, fontSize: '0.75rem' } }}
                  disabled={addParentLoading}
                  inputProps={{ step: '0.1', min: 0 }}
                />
              </Box>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary }}>
                  PROCUREMENT TYPE <span style={{ color: '#EF4444' }}>*</span>
                </Typography>
                <FormControl fullWidth size="small" error={!!parentFieldErrors.procurement_type}>
                  <Select
                    name="procurement_type"
                    value={newParentData.procurement_type}
                    onChange={handleParentFormChange}
                    onBlur={handleParentBlur}
                    disabled={addParentLoading}
                    sx={{ borderRadius: 1.5, fontSize: '0.75rem' }}
                  >
                    {PROCUREMENT_TYPE_OPTIONS.map(option => (
                      <MenuItem key={option} value={option} sx={{ fontSize: '0.75rem' }}>{option}</MenuItem>
                    ))}
                  </Select>
                  {parentFieldErrors.procurement_type && (
                    <Typography sx={{ fontSize: '0.65rem', color: '#EF4444' }}>{parentFieldErrors.procurement_type}</Typography>
                  )}
                </FormControl>
              </Box>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary }}>
                  RM REJECTION (%)
                </Typography>
                <TextField
                  fullWidth
                  size="small"
                  name="rm_rejection_percent"
                  type="number"
                  value={newParentData.rm_rejection_percent}
                  onChange={handleParentFormChange}
                  onBlur={handleParentBlur}
                  placeholder="e.g., 2"
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5, fontSize: '0.75rem' } }}
                  disabled={addParentLoading}
                  inputProps={{ step: '0.1', min: 0, max: 100 }}
                />
              </Box>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary }}>
                  SCRAP REALISATION (%)
                </Typography>
                <TextField
                  fullWidth
                  size="small"
                  name="scrap_realisation_percent"
                  type="number"
                  value={newParentData.scrap_realisation_percent}
                  onChange={handleParentFormChange}
                  onBlur={handleParentBlur}
                  placeholder="e.g., 85"
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5, fontSize: '0.75rem' } }}
                  disabled={addParentLoading}
                  inputProps={{ step: '0.1', min: 0, max: 100 }}
                />
              </Box>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary }}>
                  LEAD TIME (days)
                </Typography>
                <TextField
                  fullWidth
                  size="small"
                  name="lead_time_days"
                  type="number"
                  value={newParentData.lead_time_days}
                  onChange={handleParentFormChange}
                  onBlur={handleParentBlur}
                  placeholder="e.g., 7"
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5, fontSize: '0.75rem' } }}
                  disabled={addParentLoading}
                  inputProps={{ step: '1', min: 0 }}
                />
              </Box>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary }}>
                  REORDER LEVEL
                </Typography>
                <TextField
                  fullWidth
                  size="small"
                  name="reorder_level"
                  type="number"
                  value={newParentData.reorder_level}
                  onChange={handleParentFormChange}
                  onBlur={handleParentBlur}
                  placeholder="e.g., 100"
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5, fontSize: '0.75rem' } }}
                  disabled={addParentLoading}
                  inputProps={{ step: '1', min: 0 }}
                />
              </Box>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary }}>
                  REORDER QTY
                </Typography>
                <TextField
                  fullWidth
                  size="small"
                  name="reorder_qty"
                  type="number"
                  value={newParentData.reorder_qty}
                  onChange={handleParentFormChange}
                  onBlur={handleParentBlur}
                  placeholder="e.g., 200"
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5, fontSize: '0.75rem' } }}
                  disabled={addParentLoading}
                  inputProps={{ step: '1', min: 0 }}
                />
              </Box>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary }}>
                  SAFETY STOCK
                </Typography>
                <TextField
                  fullWidth
                  size="small"
                  name="safety_stock"
                  type="number"
                  value={newParentData.safety_stock}
                  onChange={handleParentFormChange}
                  onBlur={handleParentBlur}
                  placeholder="e.g., 40"
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5, fontSize: '0.75rem' } }}
                  disabled={addParentLoading}
                  inputProps={{ step: '1', min: 0 }}
                />
              </Box>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary }}>
                  MIN STOCK
                </Typography>
                <TextField
                  fullWidth
                  size="small"
                  name="min_stock"
                  type="number"
                  value={newParentData.min_stock}
                  onChange={handleParentFormChange}
                  onBlur={handleParentBlur}
                  placeholder="e.g., 40"
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5, fontSize: '0.75rem' } }}
                  disabled={addParentLoading}
                  inputProps={{ step: '1', min: 0 }}
                />
              </Box>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary }}>
                  MAX STOCK
                </Typography>
                <TextField
                  fullWidth
                  size="small"
                  name="max_stock"
                  type="number"
                  value={newParentData.max_stock}
                  onChange={handleParentFormChange}
                  onBlur={handleParentBlur}
                  placeholder="e.g., 200"
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5, fontSize: '0.75rem' } }}
                  disabled={addParentLoading}
                  inputProps={{ step: '1', min: 0 }}
                />
              </Box>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary }}>
                  SHELF LIFE (days)
                </Typography>
                <TextField
                  fullWidth
                  size="small"
                  name="shelf_life_days"
                  type="number"
                  value={newParentData.shelf_life_days}
                  onChange={handleParentFormChange}
                  onBlur={handleParentBlur}
                  placeholder="e.g., 365"
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5, fontSize: '0.75rem' } }}
                  disabled={addParentLoading}
                  inputProps={{ step: '1', min: 0 }}
                />
              </Box>
            </Grid>
          </Grid>
        );

      default:
        return null;
    }
  };

  const handleItemAdded = (newItem) => {
    setParentItems(prev => [...prev, newItem]);
    setFormData(prev => ({ ...prev, parent_item_id: newItem._id }));
    setFieldErrors(prev => ({ ...prev, parent_item_id: '' }));
    setShowAddParentForm(false);
  };
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setFieldErrors(prev => ({ ...prev, [name]: '' }));
    setError('');
  };
  
  const handleBomCategoryChange = (e) => {
    const value = e.target.value;
    setFormData(prev => ({
      ...prev,
      bom_category: value
    }));
    setFieldErrors(prev => ({ ...prev, bom_category: '' }));
    setError('');
    
    if (value === 'Standard') {
      const hasComponents = components.some(comp => comp.component_item_id);
      if (hasComponents) {
        setComponents([
          {
            level: 1,
            component_item_id: '',
            component_part_no: '',
            component_desc: '',
            quantity_per: 1,
            unit: 'Nos',
            scrap_percent: 0,
            is_phantom: false,
            is_subcontract: false,
            subcontract_vendor: null,
            reference_designator: '',
            remarks: ''
          }
        ]);
        setError('Components cleared. Standard BOM cannot have components.');
        setTimeout(() => setError(''), 3000);
      }
    }
  };
  
  const handleComponentChange = (index, field, value) => {
    if (formData.bom_category === 'Standard') {
      setError('Standard BOM cannot have components. Please change BOM Category to "Assembly".');
      return;
    }
    
    const updatedComponents = [...components];
    updatedComponents[index][field] = value;
    
    if (field === 'component_item_id' && value) {
      const selectedItem = componentItems.find(item => item._id === value);
      if (selectedItem) {
        updatedComponents[index].component_part_no = selectedItem.part_no || '';
        updatedComponents[index].component_desc = selectedItem.part_description || '';
        updatedComponents[index].unit = selectedItem.unit || 'Nos';
      }
    }
    
    setComponents(updatedComponents);
    setFieldErrors(prev => ({ ...prev, [`comp_${index}_${field}`]: '' }));
  };
  
  const addComponent = () => {
    if (formData.bom_category === 'Standard') {
      setError('Standard BOM cannot have components. Please change BOM Category to "Assembly" to add components.');
      return;
    }
    
    setComponents([
      ...components,
      {
        level: components.length + 1,
        component_item_id: '',
        component_part_no: '',
        component_desc: '',
        quantity_per: 1,
        unit: 'Nos',
        scrap_percent: 0,
        is_phantom: false,
        is_subcontract: false,
        subcontract_vendor: null,
        reference_designator: '',
        remarks: ''
      }
    ]);
  };
  
  const removeComponent = (index) => {
    if (components.length > 1) {
      const updatedComponents = components.filter((_, i) => i !== index);
      updatedComponents.forEach((comp, idx) => {
        comp.level = idx + 1;
      });
      setComponents(updatedComponents);
    }
  };
  
  const validateStep = (step) => {
    const errors = {};
    let isValid = true;
    
    switch (step) {
      case 0:
        if (!formData.parent_item_id) {
          errors.parent_item_id = 'Parent item is required';
          isValid = false;
        }
        if (!formData.bom_version.trim()) {
          errors.bom_version = 'BOM version is required';
          isValid = false;
        }
        if (!formData.bom_type) {
          errors.bom_type = 'BOM type is required';
          isValid = false;
        }
        if (!formData.bom_category) {
          errors.bom_category = 'BOM category is required';
          isValid = false;
        }
        if (!formData.effective_from) {
          errors.effective_from = 'Effective from date is required';
          isValid = false;
        }
        break;
        
      case 2:
        if (formData.bom_category === 'Assembly') {
          let hasValidComponent = false;
          components.forEach((comp, index) => {
            if (comp.component_item_id) {
              hasValidComponent = true;
            }
            if (!comp.component_item_id) {
              errors[`comp_${index}_component_item_id`] = `Component ${index + 1}: Item is required for Assembly BOM`;
              isValid = false;
            }
            if (!comp.quantity_per || comp.quantity_per <= 0) {
              errors[`comp_${index}_quantity_per`] = `Component ${index + 1}: Valid quantity is required`;
              isValid = false;
            }
          });
          if (!hasValidComponent) {
            errors.components = 'At least one component is required for Assembly BOM';
            isValid = false;
          }
        } else if (formData.bom_category === 'Standard') {
          const hasComponents = components.some(comp => comp.component_item_id);
          if (hasComponents) {
            errors.components = 'Standard BOM cannot have components. Use BOM Category: "Assembly" for BOMs with components.';
            isValid = false;
            setComponents([
              {
                level: 1,
                component_item_id: '',
                component_part_no: '',
                component_desc: '',
                quantity_per: 1,
                unit: 'Nos',
                scrap_percent: 0,
                is_phantom: false,
                is_subcontract: false,
                subcontract_vendor: null,
                reference_designator: '',
                remarks: ''
              }
            ]);
          }
        }
        break;
        
      default:
        return true;
    }
    
    setFieldErrors(errors);
    if (!isValid) {
      setError('Please fix the errors in this section');
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
    if (!validateStep(2)) {
      return;
    }
    
    if (formData.bom_category === 'Assembly') {
      const hasComponents = components.some(comp => comp.component_item_id);
      if (!hasComponents) {
        setError('Assembly BOM must have at least one component.');
        setActiveStep(2);
        return;
      }
    } else if (formData.bom_category === 'Standard') {
      const hasComponents = components.some(comp => comp.component_item_id);
      if (hasComponents) {
        setError('Standard BOM cannot have components. Use "Assembly" category for BOMs with components.');
        setActiveStep(2);
        setComponents([
          {
            level: 1,
            component_item_id: '',
            component_part_no: '',
            component_desc: '',
            quantity_per: 1,
            unit: 'Nos',
            scrap_percent: 0,
            is_phantom: false,
            is_subcontract: false,
            subcontract_vendor: null,
            reference_designator: '',
            remarks: ''
          }
        ]);
        return;
      }
    }
    
    const unitMismatches = [];
    for (let i = 0; i < components.length; i++) {
      const comp = components[i];
      if (comp.component_item_id) {
        const selectedItem = componentItems.find(item => item._id === comp.component_item_id);
        if (selectedItem && selectedItem.unit && comp.unit !== selectedItem.unit) {
          unitMismatches.push(`Component "${comp.component_part_no || selectedItem.part_no}": Unit mismatch. Item unit is ${selectedItem.unit}, provided ${comp.unit}`);
        }
      }
    }
    
    if (unitMismatches.length > 0) {
      setError(unitMismatches.join('\n'));
      setActiveStep(2);
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const token = localStorage.getItem('token');
      
      const submitData = {
        ...formData,
        batch_size: Number(formData.batch_size),
        yield_percent: Number(formData.yield_percent),
        setup_time_min: Number(formData.setup_time_min),
        cycle_time_min: Number(formData.cycle_time_min),
        components: formData.bom_category === 'Assembly' 
          ? components.map(comp => ({
              ...comp,
              level: Number(comp.level),
              quantity_per: Number(comp.quantity_per),
              scrap_percent: Number(comp.scrap_percent)
            }))
          : []
      };
      
      const response = await axios.post(`${BASE_URL}/api/boms`, submitData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.data.success) {
        onAdd(response.data.data);
        onClose();
        resetForm();
      } else {
        setError(response.data.message || 'Failed to add BOM');
      }
    } catch (err) {
      console.error('Error adding BOM:', err);
      let errorMessage = 'Failed to add BOM. Please try again.';
      if (err.response?.data) {
        const data = err.response.data;
        if (data.errors && Array.isArray(data.errors) && data.errors.length > 0) {
          errorMessage = data.errors.join('\n');
        } else if (data.message) {
          errorMessage = data.message;
        } else if (data.error) {
          errorMessage = data.error;
        }
      } else if (err.message) {
        errorMessage = err.message;
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };
  
  const resetForm = () => {
    setActiveStep(0);
    setFormData({
      parent_item_id: '',
      bom_version: 'v1.0',
      bom_type: 'Manufacturing',
      status: 'Pending',
      batch_size: 1,
      yield_percent: 100,
      setup_time_min: 30,
      cycle_time_min: 5.5,
      effective_from: new Date().toISOString().split('T')[0],
      effective_to: '',
      created_by: localStorage.getItem('userId') || '',
      bom_category: 'Standard'
    });
    setComponents([
      {
        level: 1,
        component_item_id: '',
        component_part_no: '',
        component_desc: '',
        quantity_per: 1,
        unit: 'Nos',
        scrap_percent: 0,
        is_phantom: false,
        is_subcontract: false,
        subcontract_vendor: null,
        reference_designator: '',
        remarks: ''
      }
    ]);
    setFieldErrors({});
    setError('');
    setShowAddParentForm(false);
    resetParentFormData();
  };
  
  const handleClose = () => {
    resetForm();
    onClose();
  };
  
  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Stack spacing={2}>
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
                <InventoryIcon sx={{ fontSize: '1rem', mr: 0.5, verticalAlign: 'middle' }} />
                Basic Information
              </Typography>
              
              <Grid container spacing={1.5}>
                <Grid size={{ xs: 12 }}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                    <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary }}>
                      PARENT ITEM <span style={{ color: '#EF4444' }}>*</span>
                    </Typography>
                    
                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
                      <Box sx={{ flex: 1 }}>
                        <Autocomplete
                          fullWidth
                          options={parentItems}
                          getOptionLabel={(option) => `${option.part_no} - ${option.part_description}`}
                          value={parentItems.find(item => item._id === formData.parent_item_id) || null}
                          onChange={(event, newValue) => {
                            if (newValue) {
                              // Populate form with selected item's data
                              setFormData(prev => ({ ...prev, parent_item_id: newValue._id }));
                              setFieldErrors(prev => ({ ...prev, parent_item_id: '' }));
                              // Populate the inline form with the selected item's details
                              setNewParentData({
                                part_no: newValue.part_no || '',
                                part_name: newValue.part_name || '',
                                item_category: newValue.item_category || '',
                                item_type: newValue.item_type || '',
                                unit: newValue.unit || 'Kg',
                                part_description: newValue.part_description || '',
                                weight_per_unit_kg: newValue.weight_per_unit_kg || '',
                                material: newValue.material || '',
                                material_grade: newValue.material_grade || '',
                                material_standard: newValue.material_standard || '',
                                material_color: newValue.material_color || '',
                                density: newValue.density || '',
                                drawing_no: newValue.drawing_no || '',
                                revision_no: newValue.revision_no || '',
                                thickness: newValue.thickness || '',
                                width: newValue.width || '',
                                strip_size: newValue.strip_size || '',
                                pitch: newValue.pitch || '',
                                no_of_cavity: newValue.no_of_cavity || 1,
                                hsn_code: newValue.hsn_code || '',
                                gst_percentage: newValue.gst_percentage || 18,
                                procurement_type: newValue.procurement_type || 'Purchase',
                                rm_rejection_percent: newValue.rm_rejection_percent || 2,
                                scrap_realisation_percent: newValue.scrap_realisation_percent || 85,
                                lead_time_days: newValue.lead_time_days || '',
                                reorder_level: newValue.reorder_level || '',
                                reorder_qty: newValue.reorder_qty || '',
                                safety_stock: newValue.safety_stock || '',
                                min_stock: newValue.min_stock || '',
                                max_stock: newValue.max_stock || '',
                                shelf_life_days: newValue.shelf_life_days || ''
                              });
                              // Show the inline form with stepper (editable)
                              setShowAddParentForm(true);
                              setParentActiveStep(0);
                            } else {
                              // Clear selection
                              setFormData(prev => ({ ...prev, parent_item_id: '' }));
                              setShowAddParentForm(false);
                              resetParentFormData();
                            }
                          }}
                          loading={loadingItems}
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              size="small"
                              error={!!fieldErrors.parent_item_id}
                              helperText={fieldErrors.parent_item_id}
                              sx={{
                                '& .MuiOutlinedInput-root': {
                                  borderRadius: 1.5,
                                  fontSize: '0.75rem'
                                }
                              }}
                            />
                          )}
                        />
                      </Box>
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => {
                          if (!showAddParentForm) {
                            // Open the form with empty data for adding new
                            setShowAddParentForm(true);
                            resetParentFormData();
                            // Also clear the parent_item_id in the main form
                            setFormData(prev => ({ ...prev, parent_item_id: '' }));
                          } else {
                            // Close the form
                            setShowAddParentForm(false);
                            resetParentFormData();
                          }
                        }}
                        startIcon={showAddParentForm ? <CloseIcon sx={{ fontSize: '0.875rem' }} /> : <AddIcon sx={{ fontSize: '0.875rem' }} />}
                        sx={{
                          height: 35,
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
                        {showAddParentForm ? 'Cancel' : 'Add New'}
                      </Button>
                    </Box>
                  </Box>
                </Grid>

                {/* Inline Parent Item Form - Always shows the 4-step stepper with fields */}
                {showAddParentForm && (
                  <Grid size={{ xs: 12 }}>
                    <Box sx={{ 
                      mt: 1, 
                      p: 2, 
                      bgcolor: COLORS.background.light, 
                      borderRadius: 2, 
                      border: `1px solid ${COLORS.primary}` 
                    }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color: COLORS.primary }}>
                          {formData.parent_item_id ? 'Edit Parent Item Details' : 'Add New Item'}
                        </Typography>
                        <IconButton
                          size="small"
                          onClick={() => {
                            setShowAddParentForm(false);
                            resetParentFormData();
                          }}
                          sx={{
                            color: COLORS.text.tertiary,
                            '&:hover': { color: COLORS.primary }
                          }}
                        >
                          <CloseIcon sx={{ fontSize: '1rem' }} />
                        </IconButton>
                      </Box>

                      {/* Parent Item Stepper */}
                      <Stepper
                        activeStep={parentActiveStep}
                        sx={{ mb: 3 }}
                        connector={<ColorConnector />}
                      >
                        {PARENT_ITEM_STEPS.map((label) => (
                          <Step key={label}>
                            <StepLabel>
                              <Typography sx={{ fontSize: '0.65rem', fontWeight: 500 }}>
                                {label}
                              </Typography>
                            </StepLabel>
                          </Step>
                        ))}
                      </Stepper>

                      {renderParentStepContent(parentActiveStep)}

                      {addParentError && (
                        <Alert
                          severity="error"
                          sx={{
                            mt: 2,
                            borderRadius: 1.5,
                            fontSize: '0.75rem',
                            py: 0.5
                          }}
                        >
                          {addParentError}
                        </Alert>
                      )}

                      <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Button
                          onClick={handleParentBack}
                          disabled={parentActiveStep === 0 || addParentLoading}
                          size="small"
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
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Button
                            onClick={() => {
                              setShowAddParentForm(false);
                              resetParentFormData();
                            }}
                            disabled={addParentLoading}
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
                          {parentActiveStep === PARENT_ITEM_STEPS.length - 1 ? (
                            <Button
                              variant="contained"
                              onClick={handleAddParentSubmit}
                              disabled={addParentLoading}
                              size="small"
                              startIcon={<AddIcon sx={{ fontSize: '1rem' }} />}
                              sx={{
                                height: 32,
                                px: 2,
                                borderRadius: 1.5,
                                bgcolor: COLORS.primary,
                                fontSize: '0.7rem',
                                fontWeight: 500,
                                textTransform: 'none',
                                '&:hover': { bgcolor: COLORS.primaryDark }
                              }}
                            >
                              {addParentLoading ? 'Adding...' : 'Add Item'}
                            </Button>
                          ) : (
                            <Button
                              variant="contained"
                              onClick={handleParentNext}
                              disabled={addParentLoading}
                              size="small"
                              endIcon={<NavigateNextIcon sx={{ fontSize: '1rem' }} />}
                              sx={{
                                height: 32,
                                px: 2,
                                borderRadius: 1.5,
                                bgcolor: COLORS.primary,
                                fontSize: '0.7rem',
                                fontWeight: 500,
                                textTransform: 'none',
                                '&:hover': { bgcolor: COLORS.primaryDark }
                              }}
                            >
                              Next
                            </Button>
                          )}
                        </Box>
                      </Box>
                    </Box>
                  </Grid>
                )}
                
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                    <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary }}>
                      BOM VERSION <span style={{ color: '#EF4444' }}>*</span>
                    </Typography>
                    <TextField
                      fullWidth
                      size="small"
                      name="bom_version"
                      value={formData.bom_version}
                      onChange={handleChange}
                      placeholder="v1.0"
                      error={!!fieldErrors.bom_version}
                      helperText={fieldErrors.bom_version}
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5, fontSize: '0.75rem' } }}
                    />
                  </Box>
                </Grid>
                
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                    <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary }}>
                      BOM TYPE <span style={{ color: '#EF4444' }}>*</span>
                    </Typography>
                    <FormControl fullWidth size="small" error={!!fieldErrors.bom_type}>
                      <Select
                        name="bom_type"
                        value={formData.bom_type}
                        onChange={handleChange}
                        sx={{ borderRadius: 1.5, fontSize: '0.75rem' }}
                      >
                        {BOM_TYPE_OPTIONS.map(option => (
                          <MenuItem key={option} value={option} sx={{ fontSize: '0.75rem' }}>
                            {option}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Box>
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                    <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary }}>
                      BOM CATEGORY <span style={{ color: '#EF4444' }}>*</span>
                    </Typography>
                    <FormControl fullWidth size="small" error={!!fieldErrors.bom_category}>
                      <Select
                        name="bom_category"
                        value={formData.bom_category}
                        onChange={handleBomCategoryChange}
                        sx={{ borderRadius: 1.5, fontSize: '0.75rem' }}
                      >
                        {BOM_CATEGORY_OPTIONS.map(option => (
                          <MenuItem key={option} value={option} sx={{ fontSize: '0.75rem' }}>
                            {option}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                    <Typography sx={{ fontSize: '0.65rem', color: COLORS.text.tertiary, mt: 0.5 }}>
                      {formData.bom_category === 'Standard' 
                        ? '✓ Standard BOM cannot have components' 
                        : '✓ Assembly BOM requires at least one component'}
                    </Typography>
                  </Box>
                </Grid>
                
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                    <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary }}>
                      EFFECTIVE FROM <span style={{ color: '#EF4444' }}>*</span>
                    </Typography>
                    <TextField
                      fullWidth
                      type="date"
                      size="small"
                      name="effective_from"
                      value={formData.effective_from}
                      onChange={handleChange}
                      error={!!fieldErrors.effective_from}
                      helperText={fieldErrors.effective_from}
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5, fontSize: '0.75rem' } }}
                      InputLabelProps={{ shrink: true }}
                    />
                  </Box>
                </Grid>
                
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                    <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary }}>
                      EFFECTIVE TO
                    </Typography>
                    <TextField
                      fullWidth
                      type="date"
                      size="small"
                      name="effective_to"
                      value={formData.effective_to}
                      onChange={handleChange}
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5, fontSize: '0.75rem' } }}
                      InputLabelProps={{ shrink: true }}
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
                <ProductionIcon sx={{ fontSize: '1rem', mr: 0.5, verticalAlign: 'middle' }} />
                Production Parameters
              </Typography>
              
              <Grid container spacing={1.5}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                    <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary }}>
                      Batch Size
                    </Typography>
                    <TextField
                      fullWidth
                      type="number"
                      size="small"
                      name="batch_size"
                      value={formData.batch_size}
                      onChange={handleChange}
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5, fontSize: '0.75rem' } }}
                    />
                  </Box>
                </Grid>
                
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                    <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary }}>
                      Yield (%)
                    </Typography>
                    <TextField
                      fullWidth
                      type="number"
                      size="small"
                      name="yield_percent"
                      value={formData.yield_percent}
                      onChange={handleChange}
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5, fontSize: '0.75rem' } }}
                    />
                  </Box>
                </Grid>
                
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                    <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary }}>
                      Setup Time (min)
                    </Typography>
                    <TextField
                      fullWidth
                      type="number"
                      size="small"
                      name="setup_time_min"
                      value={formData.setup_time_min}
                      onChange={handleChange}
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5, fontSize: '0.75rem' } }}
                    />
                  </Box>
                </Grid>
                
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                    <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary }}>
                      Cycle Time (min)
                    </Typography>
                    <TextField
                      fullWidth
                      type="number"
                      size="small"
                      name="cycle_time_min"
                      value={formData.cycle_time_min}
                      onChange={handleChange}
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5, fontSize: '0.75rem' } }}
                    />
                  </Box>
                </Grid>
              </Grid>
            </Paper>
          </Stack>
        );
        
      case 2:
        return (
          <Stack spacing={2}>
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
                <InventoryIcon sx={{ fontSize: '1rem', mr: 0.5, verticalAlign: 'middle' }} />
                Components <span style={{ color: '#EF4444' }}>*</span>
              </Typography>
              
              {formData.bom_category === 'Standard' && (
                <Alert severity="info" sx={{ mb: 2, borderRadius: 1.5, fontSize: '0.75rem' }}>
                  Standard BOM cannot have components. Components are disabled. Change BOM Category to "Assembly" to add components.
                </Alert>
              )}
              
              {components.map((component, index) => (
                <Paper
                  key={index}
                  sx={{
                    p: 2,
                    mb: 2,
                    bgcolor: formData.bom_category === 'Standard' ? '#f5f5f5' : COLORS.background.light,
                    borderRadius: 1.5,
                    border: `1px solid ${COLORS.border}`,
                    opacity: formData.bom_category === 'Standard' ? 0.7 : 1,
                    pointerEvents: formData.bom_category === 'Standard' ? 'none' : 'auto'
                  }}
                >
                  <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.5 }}>
                    <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary }}>
                      Component {index + 1}
                    </Typography>
                    {components.length > 1 && formData.bom_category === 'Assembly' && (
                      <IconButton
                        size="small"
                        onClick={() => removeComponent(index)}
                        sx={{ color: '#EF4444' }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    )}
                  </Stack>
                  
                  <Grid container spacing={1.5}>
                    <Grid size={{ xs: 12 }}>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                        <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary }}>
                          COMPONENT ITEM <span style={{ color: '#EF4444' }}>*</span>
                        </Typography>
                        <Autocomplete
                          fullWidth
                          options={componentItems}
                          getOptionLabel={(option) => `${option.part_no} - ${option.part_description}`}
                          value={componentItems.find(item => item._id === component.component_item_id) || null}
                          onChange={(event, newValue) => handleComponentChange(index, 'component_item_id', newValue?._id || '')}
                          loading={loadingItems}
                          disabled={formData.bom_category === 'Standard'}
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              size="small"
                              error={!!fieldErrors[`comp_${index}_component_item_id`]}
                              helperText={fieldErrors[`comp_${index}_component_item_id`]}
                              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5, fontSize: '0.75rem' } }}
                            />
                          )}
                        />
                      </Box>
                    </Grid>
                    
                    <Grid size={{ xs: 6, sm: 3 }}>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                        <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary }}>
                          QUANTITY PER <span style={{ color: '#EF4444' }}>*</span>
                        </Typography>
                        <TextField
                          fullWidth
                          type="number"
                          size="small"
                          value={component.quantity_per}
                          onChange={(e) => handleComponentChange(index, 'quantity_per', e.target.value)}
                          error={!!fieldErrors[`comp_${index}_quantity_per`]}
                          helperText={fieldErrors[`comp_${index}_quantity_per`]}
                          disabled={formData.bom_category === 'Standard'}
                          sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5, fontSize: '0.75rem' } }}
                        />
                      </Box>
                    </Grid>
                    
                    <Grid size={{ xs: 6, sm: 2 }}>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                        <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary }}>
                          UNIT
                        </Typography>
                        <FormControl fullWidth size="small">
                          <Select
                            value={component.unit}
                            onChange={(e) => handleComponentChange(index, 'unit', e.target.value)}
                            disabled={formData.bom_category === 'Standard'}
                            sx={{ borderRadius: 1.5, fontSize: '0.75rem' }}
                          >
                            {UNIT_OPTIONS.map(option => (
                              <MenuItem key={option} value={option} sx={{ fontSize: '0.75rem' }}>
                                {option}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </Box>
                    </Grid>
                    
                    <Grid size={{ xs: 6, sm: 2 }}>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                        <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary }}>
                          SCRAP %
                        </Typography>
                        <TextField
                          fullWidth
                          type="number"
                          size="small"
                          value={component.scrap_percent}
                          onChange={(e) => handleComponentChange(index, 'scrap_percent', e.target.value)}
                          disabled={formData.bom_category === 'Standard'}
                          sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5, fontSize: '0.75rem' } }}
                        />
                      </Box>
                    </Grid>
                    
                    <Grid size={{ xs: 12, sm: 5 }}>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                        <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary }}>
                          REFERENCE DESIGNATOR
                        </Typography>
                        <TextField
                          fullWidth
                          size="small"
                          value={component.reference_designator}
                          onChange={(e) => handleComponentChange(index, 'reference_designator', e.target.value)}
                          placeholder="e.g., R1, C2, U3"
                          disabled={formData.bom_category === 'Standard'}
                          sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5, fontSize: '0.75rem' } }}
                        />
                      </Box>
                    </Grid>
                    
                    <Grid size={{ xs: 12, sm: 7 }}>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                        <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary }}>
                          REMARKS
                        </Typography>
                        <TextField
                          fullWidth
                          size="small"
                          value={component.remarks}
                          onChange={(e) => handleComponentChange(index, 'remarks', e.target.value)}
                          placeholder="Additional notes..."
                          disabled={formData.bom_category === 'Standard'}
                          sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5, fontSize: '0.75rem' } }}
                        />
                      </Box>
                    </Grid>
                  </Grid>
                </Paper>
              ))}
              
              <Button
                variant="outlined"
                startIcon={<AddIcon sx={{ fontSize: '1rem' }} />}
                onClick={addComponent}
                disabled={formData.bom_category === 'Standard'}
                sx={{
                  height: 32,
                  px: 2,
                  borderRadius: 1.5,
                  border: `1px solid ${COLORS.border}`,
                  color: formData.bom_category === 'Standard' ? COLORS.text.tertiary : COLORS.text.secondary,
                  fontSize: '0.7rem',
                  fontWeight: 500,
                  textTransform: 'none',
                  '&:hover': {
                    borderColor: formData.bom_category === 'Standard' ? COLORS.border : COLORS.primary,
                    bgcolor: formData.bom_category === 'Standard' ? 'transparent' : `${COLORS.primary}10`
                  }
                }}
              >
                Add Component
              </Button>
            </Paper>
          </Stack>
        );
        
      case 3:
        return (
          <Stack spacing={2}>
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
                <InfoIcon sx={{ fontSize: '1rem', mr: 0.5, verticalAlign: 'middle' }} />
                Review & Submit
              </Typography>
              
              <Stack spacing={2}>
                <Paper sx={{ p: 2, bgcolor: COLORS.background.light, borderRadius: 1.5 }}>
                  <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: COLORS.primary, mb: 1 }}>
                    Basic Information
                  </Typography>
                  <Grid container spacing={1}>
                    <Grid size={{ xs: 6 }}>
                      <Typography sx={{ fontSize: '0.7rem', color: COLORS.text.secondary }}>Parent Item:</Typography>
                    </Grid>
                    <Grid size={{ xs: 6 }}>
                      <Typography sx={{ fontSize: '0.7rem', fontWeight: 500 }}>
                        {parentItems.find(item => item._id === formData.parent_item_id)?.part_no || '-'}
                      </Typography>
                    </Grid>
                    <Grid size={{ xs: 6 }}>
                      <Typography sx={{ fontSize: '0.7rem', color: COLORS.text.secondary }}>BOM Version:</Typography>
                    </Grid>
                    <Grid size={{ xs: 6 }}>
                      <Typography sx={{ fontSize: '0.7rem', fontWeight: 500 }}>{formData.bom_version}</Typography>
                    </Grid>
                    <Grid size={{ xs: 6 }}>
                      <Typography sx={{ fontSize: '0.7rem', color: COLORS.text.secondary }}>BOM Type:</Typography>
                    </Grid>
                    <Grid size={{ xs: 6 }}>
                      <Typography sx={{ fontSize: '0.7rem', fontWeight: 500 }}>{formData.bom_type}</Typography>
                    </Grid>
                    <Grid size={{ xs: 6 }}>
                      <Typography sx={{ fontSize: '0.7rem', color: COLORS.text.secondary }}>BOM Category:</Typography>
                    </Grid>
                    <Grid size={{ xs: 6 }}>
                      <Typography sx={{ fontSize: '0.7rem', fontWeight: 500 }}>{formData.bom_category}</Typography>
                    </Grid>
                    <Grid size={{ xs: 6 }}>
                      <Typography sx={{ fontSize: '0.7rem', color: COLORS.text.secondary }}>Status:</Typography>
                    </Grid>
                    <Grid size={{ xs: 6 }}>
                      <Typography sx={{ fontSize: '0.7rem', fontWeight: 500 }}>{formData.status}</Typography>
                    </Grid>
                    <Grid size={{ xs: 6 }}>
                      <Typography sx={{ fontSize: '0.7rem', color: COLORS.text.secondary }}>Effective From:</Typography>
                    </Grid>
                    <Grid size={{ xs: 6 }}>
                      <Typography sx={{ fontSize: '0.7rem', fontWeight: 500 }}>{formData.effective_from}</Typography>
                    </Grid>
                    {formData.effective_to && (
                      <>
                        <Grid size={{ xs: 6 }}>
                          <Typography sx={{ fontSize: '0.7rem', color: COLORS.text.secondary }}>Effective To:</Typography>
                        </Grid>
                        <Grid size={{ xs: 6 }}>
                          <Typography sx={{ fontSize: '0.7rem', fontWeight: 500 }}>{formData.effective_to}</Typography>
                        </Grid>
                      </>
                    )}
                  </Grid>
                </Paper>
                
                <Paper sx={{ p: 2, bgcolor: COLORS.background.light, borderRadius: 1.5 }}>
                  <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: COLORS.primary, mb: 1 }}>
                    Production Parameters
                  </Typography>
                  <Grid container spacing={1}>
                    <Grid size={{ xs: 6 }}>
                      <Typography sx={{ fontSize: '0.7rem', color: COLORS.text.secondary }}>Batch Size:</Typography>
                    </Grid>
                    <Grid size={{ xs: 6 }}>
                      <Typography sx={{ fontSize: '0.7rem', fontWeight: 500 }}>{formData.batch_size}</Typography>
                    </Grid>
                    <Grid size={{ xs: 6 }}>
                      <Typography sx={{ fontSize: '0.7rem', color: COLORS.text.secondary }}>Yield:</Typography>
                    </Grid>
                    <Grid size={{ xs: 6 }}>
                      <Typography sx={{ fontSize: '0.7rem', fontWeight: 500 }}>{formData.yield_percent}%</Typography>
                    </Grid>
                    <Grid size={{ xs: 6 }}>
                      <Typography sx={{ fontSize: '0.7rem', color: COLORS.text.secondary }}>Setup Time:</Typography>
                    </Grid>
                    <Grid size={{ xs: 6 }}>
                      <Typography sx={{ fontSize: '0.7rem', fontWeight: 500 }}>{formData.setup_time_min} min</Typography>
                    </Grid>
                    <Grid size={{ xs: 6 }}>
                      <Typography sx={{ fontSize: '0.7rem', color: COLORS.text.secondary }}>Cycle Time:</Typography>
                    </Grid>
                    <Grid size={{ xs: 6 }}>
                      <Typography sx={{ fontSize: '0.7rem', fontWeight: 500 }}>{formData.cycle_time_min} min</Typography>
                    </Grid>
                  </Grid>
                </Paper>
                
                <Paper sx={{ p: 2, bgcolor: COLORS.background.light, borderRadius: 1.5 }}>
                  <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: COLORS.primary, mb: 1 }}>
                    Components ({components.filter(c => c.component_item_id).length})
                  </Typography>
                  {components.filter(c => c.component_item_id).length > 0 ? (
                    components.map((comp, idx) => (
                      comp.component_item_id && (
                        <Box key={idx} sx={{ mb: 1, pb: 1, borderBottom: idx < components.length - 1 ? `1px solid ${COLORS.border}` : 'none' }}>
                          <Typography sx={{ fontSize: '0.7rem', fontWeight: 500 }}>
                            {comp.component_part_no || 'Not selected'}
                          </Typography>
                          <Typography sx={{ fontSize: '0.65rem', color: COLORS.text.secondary }}>
                            Qty: {comp.quantity_per} {comp.unit} | Scrap: {comp.scrap_percent}%
                          </Typography>
                        </Box>
                      )
                    ))
                  ) : (
                    <Typography sx={{ fontSize: '0.7rem', color: COLORS.text.tertiary }}>
                      No components added {formData.bom_category === 'Standard' ? '(Standard BOM)' : ''}
                    </Typography>
                  )}
                </Paper>
              </Stack>
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
          borderRadius: 2,
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05)',
          border: `1px solid ${COLORS.border}`,
          overflow: 'hidden',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column'
        }
      }}
      BackdropProps={{
        sx: {
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
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
        alignItems: 'center',
        flexShrink: 0
      }}>
        <Typography sx={{ fontSize: '1.2rem', fontWeight: 700, color: COLORS.text.primary }}>
          Add New BOM
        </Typography>
        <IconButton onClick={handleClose} size="small">
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>
      
      <Box sx={{ px: 2.5, pt: 2, bgcolor: COLORS.background.white, flexShrink: 0 }}>
        <Stepper
          activeStep={activeStep}
          alternativeLabel
          connector={<ColorConnector />}
        >
          {MAIN_STEPS.map((label) => (
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
      
      <DialogContent sx={{ 
        p: 2.5, 
        bgcolor: COLORS.background.white,
        flex: 1,
        overflowY: 'auto',
        '&::-webkit-scrollbar': {
          width: '6px',
        },
        '&::-webkit-scrollbar-track': {
          background: '#f1f1f1',
          borderRadius: '3px',
        },
        '&::-webkit-scrollbar-thumb': {
          background: '#c1c1c1',
          borderRadius: '3px',
        },
        '&::-webkit-scrollbar-thumb:hover': {
          background: '#a8a8a8',
        }
      }}>
        {renderStepContent(activeStep)}
        
        {error && (
          <Alert 
            severity={error.includes('Warning') || error.includes('Components cleared') ? 'warning' : 'error'} 
            sx={{ 
              mt: 2, 
              borderRadius: 1.5,
              fontSize: '0.75rem',
              py: 0.5
            }}
          >
            <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.75rem' }}>
              {error.includes('Warning') || error.includes('Components cleared') ? 'Warning' : 'Validation Error'}
            </Typography>
            <Typography variant="body2" sx={{ fontSize: '0.7rem', whiteSpace: 'pre-wrap' }}>
              {error}
            </Typography>
          </Alert>
        )}
      </DialogContent>
      
      <DialogActions sx={{
        px: 2.5,
        py: 1.5,
        borderTop: `1px solid ${COLORS.border}`,
        bgcolor: COLORS.background.white,
        justifyContent: 'space-between',
        flexShrink: 0
      }}>
        <Button
          onClick={handleBack}
          disabled={activeStep === 0 || loading}
          size="small"
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
        <Box>
          <Button
            onClick={handleClose}
            disabled={loading}
            size="small"
            sx={{
              height: 32,
              px: 2,
              mr: 1,
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
          {activeStep === MAIN_STEPS.length - 1 ? (
            <Button
              variant="contained"
              onClick={handleSubmit}
              disabled={loading}
              size="small"
              startIcon={<AddIcon sx={{ fontSize: '1rem' }} />}
              sx={{
                height: 32,
                px: 2,
                borderRadius: 1.5,
                bgcolor: COLORS.primary,
                fontSize: '0.7rem',
                fontWeight: 500,
                textTransform: 'none',
                '&:hover': { bgcolor: COLORS.primaryDark }
              }}
            >
              {loading ? 'Adding...' : 'Add BOM'}
            </Button>
          ) : (
            <Button
              variant="contained"
              onClick={handleNext}
              disabled={loading}
              size="small"
              endIcon={<NavigateNextIcon sx={{ fontSize: '1rem' }} />}
              sx={{
                height: 32,
                px: 2,
                borderRadius: 1.5,
                bgcolor: COLORS.primary,
                fontSize: '0.7rem',
                fontWeight: 500,
                textTransform: 'none',
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

export default AddBom;