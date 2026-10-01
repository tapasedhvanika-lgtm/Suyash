// import React, { useState, useEffect, useCallback } from 'react';
// import {
//   Dialog, DialogTitle, DialogContent, DialogActions,
//   Button, TextField, Alert, Typography, Box, Stack, Grid,
//   Autocomplete, FormControl, Select, MenuItem, Paper, IconButton, Tooltip,
//   Stepper, Step, StepLabel, StepConnector, stepConnectorClasses, styled
// } from '@mui/material';
// import { 
//   Add as AddIcon, Inventory as InventoryIcon, 
//   NavigateNext as NavigateNextIcon, NavigateBefore as NavigateBeforeIcon,
//   ProductionQuantityLimits as ProductionIcon, CalendarMonth as CalendarIcon,
//   Settings as SettingsIcon
// } from '@mui/icons-material';
// import axios from 'axios';
// import BASE_URL from '../../../config/Config';
// import AddSaleOrder from '../../salesordermaster/AddSaleOrder';
// import AddItem from '../../master/itemmaster/AddItem';
// import AddBom from '../../bommaster/BOM/bom/AddBom';
// import AddRouting from '../../bommaster/routing/AddRouting';
// import MrpRun from '../../bommaster/MRP/MrpRun';
// import AddAssembly from '../assemblylines/AddAssembly';

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

// const PRIORITY_OPTIONS = ['Critical', 'High', 'Medium', 'Low'];
// const WO_TYPE_OPTIONS = ['Machining', 'Assembly', 'SubAssembly', 'Kit'];

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

// const steps = ['Production Details', 'Planning & Settings'];

// const AddWorkOrder = ({ open, onClose, onAdd }) => {
//   const [activeStep, setActiveStep] = useState(0);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState('');
//   const [fieldErrors, setFieldErrors] = useState({});

//   // Dialog states
//   const [addSaleOrderOpen, setAddSaleOrderOpen] = useState(false);
//   const [addItemOpen, setAddItemOpen] = useState(false);
//   const [addBomOpen, setAddBomOpen] = useState(false);
//   const [addRoutingOpen, setAddRoutingOpen] = useState(false);
//   const [addMrpRunOpen, setAddMrpRunOpen] = useState(false);
//   const [addAssemblyOpen, setAddAssemblyOpen] = useState(false);

//   // Data fetching states
//   const [salesOrders, setSalesOrders] = useState([]);
//   const [selectedSO, setSelectedSO] = useState(null);
//   const [selectedSOItem, setSelectedSOItem] = useState(null);
//   const [selectedItem, setSelectedItem] = useState(null);
//   const [boms, setBoms] = useState([]);
//   const [routings, setRoutings] = useState([]);
//   const [mrpRuns, setMrpRuns] = useState([]);
//   const [items, setItems] = useState([]);
//   const [assemblyLines, setAssemblyLines] = useState([]);
  
//   const [loadingSO, setLoadingSO] = useState(false);
//   const [loadingBOM, setLoadingBOM] = useState(false);
//   const [loadingRouting, setLoadingRouting] = useState(false);
//   const [loadingMRP, setLoadingMRP] = useState(false);
//   const [loadingItems, setLoadingItems] = useState(false);
//   const [loadingAssemblyLines, setLoadingAssemblyLines] = useState(false);

//   // Form data
//   const [formData, setFormData] = useState({
//     so_id: '',
//     so_item_id: '',
//     item_id: '',
//     bom_id: '',
//     routing_id: '',
//     planned_qty: '',
//     planned_start: '',
//     planned_end: '',
//     required_by: '',
//     priority: 'Medium',
//     wo_type: 'Machining',
//     assembly_line: '',
//     serial_tracking: false,
//     mrp_run_id: ''
//   });

//   // Check if assembly line should be shown
//   const showAssemblyLine = ['Assembly', 'SubAssembly'].includes(formData.wo_type);

//   // Fetch Sales Orders
//   const fetchSalesOrders = useCallback(async () => {
//     try {
//       setLoadingSO(true);
//       const token = localStorage.getItem('token');
//       const response = await axios.get(`${BASE_URL}/api/sales-orders`, {
//         headers: { Authorization: `Bearer ${token}` }
//       });
//       if (response.data.success) {
//         setSalesOrders(response.data.data || []);
//       }
//     } catch (err) {
//       console.error('Error fetching sales orders:', err);
//     } finally {
//       setLoadingSO(false);
//     }
//   }, []);

//   // Fetch BOMs
//   const fetchBOMs = useCallback(async () => {
//     try {
//       setLoadingBOM(true);
//       const token = localStorage.getItem('token');
//       const response = await axios.get(`${BASE_URL}/api/boms`, {
//         headers: { Authorization: `Bearer ${token}` }
//       });
//       if (response.data.success) {
//         setBoms(response.data.data || []);
//       }
//     } catch (err) {
//       console.error('Error fetching BOMs:', err);
//     } finally {
//       setLoadingBOM(false);
//     }
//   }, []);

//   // Fetch Routings
//   const fetchRoutings = useCallback(async () => {
//     try {
//       setLoadingRouting(true);
//       const token = localStorage.getItem('token');
//       const response = await axios.get(`${BASE_URL}/api/routings`, {
//         headers: { Authorization: `Bearer ${token}` }
//       });
//       if (response.data.success) {
//         setRoutings(response.data.data || []);
//       }
//     } catch (err) {
//       console.error('Error fetching routings:', err);
//     } finally {
//       setLoadingRouting(false);
//     }
//   }, []);

//   // Fetch MRP Runs
//   const fetchMrpRuns = useCallback(async () => {
//     try {
//       setLoadingMRP(true);
//       const token = localStorage.getItem('token');
//       const response = await axios.get(`${BASE_URL}/api/mrp/runs`, {
//         headers: { Authorization: `Bearer ${token}` }
//       });
//       if (response.data.success) {
//         setMrpRuns(response.data.data || []);
//       }
//     } catch (err) {
//       console.error('Error fetching MRP runs:', err);
//     } finally {
//       setLoadingMRP(false);
//     }
//   }, []);

//   // Fetch Items
//   const fetchItems = useCallback(async () => {
//     try {
//       setLoadingItems(true);
//       const token = localStorage.getItem('token');
//       const response = await axios.get(`${BASE_URL}/api/items`, {
//         headers: { Authorization: `Bearer ${token}` }
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

//   // Fetch Assembly Lines
//   const fetchAssemblyLines = useCallback(async () => {
//     try {
//       setLoadingAssemblyLines(true);
//       const token = localStorage.getItem('token');
//       const response = await axios.get(`${BASE_URL}/api/assembly-lines/dropdown`, {
//         headers: { Authorization: `Bearer ${token}` }
//       });
//       if (response.data.success) {
//         setAssemblyLines(response.data.data || []);
//       }
//     } catch (err) {
//       console.error('Error fetching assembly lines:', err);
//       try {
//         const fallbackResponse = await axios.get(`${BASE_URL}/api/assembly-lines`, {
//           headers: { Authorization: `Bearer ${token}` }
//         });
//         if (fallbackResponse.data.success) {
//           const activeLines = (fallbackResponse.data.data || []).filter(line => line.is_active === true);
//           setAssemblyLines(activeLines);
//         }
//       } catch (fallbackErr) {
//         console.error('Error fetching assembly lines (fallback):', fallbackErr);
//       }
//     } finally {
//       setLoadingAssemblyLines(false);
//     }
//   }, []);

//   // Fetch data when dialog opens
//   useEffect(() => {
//     if (open) {
//       fetchSalesOrders();
//       fetchBOMs();
//       fetchRoutings();
//       fetchMrpRuns();
//       fetchItems();
//       fetchAssemblyLines();
//     }
//   }, [open, fetchSalesOrders, fetchBOMs, fetchRoutings, fetchMrpRuns, fetchItems, fetchAssemblyLines]);

//   // Reset active step when dialog opens/closes
//   useEffect(() => {
//     if (!open) {
//       setActiveStep(0);
//     }
//   }, [open]);

//   // Handle Sales Order added
//   const handleSaleOrderAdded = (newSaleOrder) => {
//     setSalesOrders(prev => [newSaleOrder, ...prev]);
//     setSelectedSO(newSaleOrder);
//     setFormData(prev => ({
//       ...prev,
//       so_id: newSaleOrder._id,
//       so_item_id: ''
//     }));
//     setSelectedSOItem(null);
//   };

//   // Handle Item added
//   const handleItemAdded = (newItem) => {
//     setItems(prev => [newItem, ...prev]);
//     setSelectedItem(newItem);
//     setFormData(prev => ({
//       ...prev,
//       item_id: newItem._id
//     }));
//   };

//   // Handle BOM added
//   const handleBomAdded = (newBom) => {
//     setBoms(prev => [newBom, ...prev]);
//     setFormData(prev => ({
//       ...prev,
//       bom_id: newBom._id
//     }));
//   };

//   // Handle Routing added
//   const handleRoutingAdded = (newRouting) => {
//     setRoutings(prev => [newRouting, ...prev]);
//     setFormData(prev => ({
//       ...prev,
//       routing_id: newRouting._id
//     }));
//   };

//   // Handle MRP Run added
//   const handleMrpRunAdded = (newMrpRun) => {
//     setMrpRuns(prev => [newMrpRun, ...prev]);
//     setFormData(prev => ({
//       ...prev,
//       mrp_run_id: newMrpRun._id
//     }));
//   };

//   // Handle Assembly Line added
//   const handleAssemblyAdded = (newAssembly) => {
//     setAssemblyLines(prev => [newAssembly, ...prev]);
//     setFormData(prev => ({
//       ...prev,
//       assembly_line: newAssembly._id
//     }));
//   };

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData(prev => ({ ...prev, [name]: value }));
//     setFieldErrors(prev => ({ ...prev, [name]: '' }));
    
//     // Reset assembly line if wo_type changes to non-assembly type
//     if (name === 'wo_type' && !['Assembly', 'SubAssembly'].includes(value)) {
//       setFormData(prev => ({ ...prev, assembly_line: '' }));
//     }
//   };

//   const handleSOChange = (event, newValue) => {
//     setSelectedSO(newValue);
//     setFormData(prev => ({
//       ...prev,
//       so_id: newValue?._id || '',
//       so_item_id: ''
//     }));
//     setSelectedSOItem(null);
//     setFieldErrors(prev => ({ ...prev, so_id: '' }));
//   };

//   const handleSOItemChange = (event, newValue) => {
//     setSelectedSOItem(newValue);
//     setFormData(prev => ({
//       ...prev,
//       so_item_id: newValue?._id || ''
//     }));
//     setFieldErrors(prev => ({ ...prev, so_item_id: '' }));
//   };

//   const handleItemChange = (event, newValue) => {
//     setSelectedItem(newValue);
//     setFormData(prev => ({
//       ...prev,
//       item_id: newValue?._id || ''
//     }));
//     setFieldErrors(prev => ({ ...prev, item_id: '' }));
//   };

//   const handleAssemblyLineChange = (event, newValue) => {
//     setFormData(prev => ({
//       ...prev,
//       assembly_line: newValue?._id || ''
//     }));
//   };

//   // Validate Step 1 (Production Details)
//   const validateStep1 = () => {
//     const errors = {};
//     let isValid = true;

//     if (!formData.so_id) {
//       errors.so_id = 'Sales Order is required';
//       isValid = false;
//     }
    
//     const hasMultipleItems = selectedSO && selectedSO.items && selectedSO.items.length > 1;
//     if (hasMultipleItems && !formData.so_item_id) {
//       errors.so_item_id = 'Please select an SO item';
//       isValid = false;
//     }
    
//     if (!formData.item_id) {
//       errors.item_id = 'Item is required';
//       isValid = false;
//     }
//     if (!formData.bom_id) {
//       errors.bom_id = 'BOM is required';
//       isValid = false;
//     }
//     if (!formData.routing_id) {
//       errors.routing_id = 'Routing is required';
//       isValid = false;
//     }

//     setFieldErrors(errors);
//     if (!isValid) {
//       setError('Please fix the errors in Production Details');
//     }
//     return isValid;
//   };

//   // Validate Step 2 (Planning & Settings)
//   const validateStep2 = () => {
//     const errors = {};
//     let isValid = true;

//     if (!formData.planned_qty || formData.planned_qty <= 0) {
//       errors.planned_qty = 'Valid planned quantity is required';
//       isValid = false;
//     }
//     if (!formData.planned_start) {
//       errors.planned_start = 'Planned start date is required';
//       isValid = false;
//     }
//     if (!formData.planned_end) {
//       errors.planned_end = 'Planned end date is required';
//       isValid = false;
//     }

//     setFieldErrors(errors);
//     if (!isValid) {
//       setError('Please fix the errors in Planning & Settings');
//     }
//     return isValid;
//   };

//   const handleNext = () => {
//     if (validateStep1()) {
//       setError('');
//       setActiveStep(1);
//     }
//   };

//   const handleBack = () => {
//     setError('');
//     setActiveStep(0);
//   };

//   const validateForm = () => {
//     const step1Valid = validateStep1();
//     const step2Valid = validateStep2();
//     return step1Valid && step2Valid;
//   };

//   const handleSubmit = async () => {
//     if (!validateForm()) return;

//     setLoading(true);
//     setError('');

//     try {
//       const token = localStorage.getItem('token');
//       const submitData = {
//         so_id: formData.so_id,
//         so_item_id: formData.so_item_id || undefined,
//         item_id: formData.item_id,
//         bom_id: formData.bom_id,
//         routing_id: formData.routing_id,
//         planned_qty: Number(formData.planned_qty),
//         planned_start: formData.planned_start,
//         planned_end: formData.planned_end,
//         required_by: formData.required_by || formData.planned_end,
//         priority: formData.priority,
//         wo_type: formData.wo_type,
//         assembly_line: showAssemblyLine ? (formData.assembly_line || undefined) : undefined,
//         serial_tracking: formData.serial_tracking,
//         mrp_run_id: formData.mrp_run_id || undefined
//       };

//       const response = await axios.post(`${BASE_URL}/api/work-orders`, submitData, {
//         headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
//       });

//       if (response.data.success) {
//         onAdd(response.data.data);
//         resetForm();
//         onClose();
//       } else {
//         setError(response.data.message || 'Failed to create work order');
//       }
//     } catch (err) {
//       console.error('Error creating work order:', err);
//       setError(err.response?.data?.message || 'Failed to create work order');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const resetForm = () => {
//     setFormData({
//       so_id: '',
//       so_item_id: '',
//       item_id: '',
//       bom_id: '',
//       routing_id: '',
//       planned_qty: '',
//       planned_start: '',
//       planned_end: '',
//       required_by: '',
//       priority: 'Medium',
//       wo_type: 'Machining',
//       assembly_line: '',
//       serial_tracking: false,
//       mrp_run_id: ''
//     });
//     setSelectedSO(null);
//     setSelectedSOItem(null);
//     setSelectedItem(null);
//     setFieldErrors({});
//     setError('');
//     setActiveStep(0);
//   };

//   const handleClose = () => {
//     resetForm();
//     onClose();
//   };

//   const availableSOItems = selectedSO?.items || [];
//   const hasMultipleSOItems = availableSOItems.length > 1;

//   const getSelectedAssemblyLine = () => {
//     return assemblyLines.find(al => al._id === formData.assembly_line) || null;
//   };

//   const getAssemblyLineLabel = (option) => {
//     return `${option.line_code} - ${option.line_name} (${option.line_type})`;
//   };

//   // Render Step 1 Content
//   const renderStep1Content = () => (
//     <Stack spacing={2}>
//       {/* Sales Order Selection */}
//       <Paper sx={{ p: 2, borderRadius: 1.5, border: `1px solid ${COLORS.border}`, boxShadow: 'none' }}>
//         <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color: COLORS.primary, mb: 1.5 }}>
//           <InventoryIcon sx={{ fontSize: '1rem', mr: 0.5, verticalAlign: 'middle' }} />
//           Sales Order Details
//         </Typography>

//         <Grid container spacing={1.5}>
//           <Grid size={{ xs: 12 }}>
//             <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//               <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
//                 <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary }}>
//                   SALES ORDER <span style={{ color: '#EF4444' }}>*</span>
//                 </Typography>
//                 <Tooltip title="Add New Sales Order">
//                   <IconButton
//                     size="small"
//                     onClick={() => setAddSaleOrderOpen(true)}
//                     sx={{
//                       color: COLORS.primary,
//                       p: 0.25,
//                       '&:hover': { bgcolor: COLORS.primaryLight }
//                     }}
//                   >
//                     <AddIcon sx={{ fontSize: '0.8rem' }} />
//                   </IconButton>
//                 </Tooltip>
//               </Box>
//               <Autocomplete
//                 fullWidth
//                 options={salesOrders}
//                 getOptionLabel={(option) => `${option.so_number} - ${option.customer_name}`}
//                 value={selectedSO}
//                 onChange={handleSOChange}
//                 loading={loadingSO}
//                 renderInput={(params) => (
//                   <TextField
//                     {...params}
//                     size="small"
//                     placeholder="Select sales order"
//                     error={!!fieldErrors.so_id}
//                     sx={{
//                       '& .MuiOutlinedInput-root': {
//                         borderRadius: 1.5,
//                         fontSize: '0.75rem',
//                         '&:hover fieldset': { borderColor: COLORS.primary }
//                       }
//                     }}
//                   />
//                 )}
//               />
//               {fieldErrors.so_id && (
//                 <Typography sx={{ fontSize: '0.65rem', color: '#EF4444' }}>
//                   {fieldErrors.so_id}
//                 </Typography>
//               )}
//             </Box>
//           </Grid>

//           {hasMultipleSOItems && (
//             <Grid size={{ xs: 12 }}>
//               <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//                 <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary }}>
//                   SO ITEM <span style={{ color: '#EF4444' }}>*</span>
//                 </Typography>
//                 <Autocomplete
//                   fullWidth
//                   options={availableSOItems}
//                   getOptionLabel={(option) => `${option.part_no} - ${option.part_name} (Qty: ${option.ordered_qty})`}
//                   value={selectedSOItem}
//                   onChange={handleSOItemChange}
//                   disabled={!selectedSO}
//                   loading={loadingSO}
//                   renderInput={(params) => (
//                     <TextField
//                       {...params}
//                       size="small"
//                       placeholder={selectedSO ? "Select SO item" : "Select sales order first"}
//                       error={!!fieldErrors.so_item_id}
//                       sx={{
//                         '& .MuiOutlinedInput-root': {
//                           borderRadius: 1.5,
//                           fontSize: '0.75rem',
//                           '&:hover fieldset': { borderColor: COLORS.primary }
//                         }
//                       }}
//                     />
//                   )}
//                 />
//                 {fieldErrors.so_item_id && (
//                   <Typography sx={{ fontSize: '0.65rem', color: '#EF4444' }}>
//                     {fieldErrors.so_item_id}
//                   </Typography>
//                 )}
//               </Box>
//             </Grid>
//           )}

//           {selectedSO && !hasMultipleSOItems && availableSOItems.length === 1 && (
//             <Grid size={{ xs: 12 }}>
//               <Box sx={{ 
//                 p: 1, 
//                 bgcolor: COLORS.primaryLight, 
//                 borderRadius: 1.5,
//                 border: `1px solid ${COLORS.primary}20`
//               }}>
//                 <Typography sx={{ fontSize: '0.7rem', color: COLORS.text.secondary }}>
//                   SO Item (Auto-selected):
//                 </Typography>
//                 <Typography sx={{ fontSize: '0.75rem', fontWeight: 500, color: COLORS.text.primary }}>
//                   {availableSOItems[0]?.part_no} - {availableSOItems[0]?.part_name}
//                 </Typography>
//               </Box>
//             </Grid>
//           )}
//         </Grid>
//       </Paper>

//       {/* Item Master Selection */}
//       <Paper sx={{ p: 2, borderRadius: 1.5, border: `1px solid ${COLORS.border}`, boxShadow: 'none' }}>
//         <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color: COLORS.primary, mb: 1.5 }}>
//           <ProductionIcon sx={{ fontSize: '1rem', mr: 0.5, verticalAlign: 'middle' }} />
//           Item Details
//         </Typography>

//         <Grid container spacing={1.5}>
//           <Grid size={{ xs: 12 }}>
//             <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//               <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
//                 <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary }}>
//                   ITEM <span style={{ color: '#EF4444' }}>*</span>
//                 </Typography>
//                 <Tooltip title="Add New Item">
//                   <IconButton
//                     size="small"
//                     onClick={() => setAddItemOpen(true)}
//                     sx={{
//                       color: COLORS.primary,
//                       p: 0.25,
//                       '&:hover': { bgcolor: COLORS.primaryLight }
//                     }}
//                   >
//                     <AddIcon sx={{ fontSize: '0.8rem' }} />
//                   </IconButton>
//                 </Tooltip>
//               </Box>
//               <Autocomplete
//                 fullWidth
//                 options={items}
//                 getOptionLabel={(option) => `${option.part_no} - ${option.part_description || option.part_name} (${option.item_category || 'N/A'})`}
//                 value={selectedItem}
//                 onChange={handleItemChange}
//                 loading={loadingItems}
//                 renderInput={(params) => (
//                   <TextField
//                     {...params}
//                     size="small"
//                     placeholder="Select item"
//                     error={!!fieldErrors.item_id}
//                     sx={{
//                       '& .MuiOutlinedInput-root': {
//                         borderRadius: 1.5,
//                         fontSize: '0.75rem',
//                         '&:hover fieldset': { borderColor: COLORS.primary }
//                       }
//                     }}
//                   />
//                 )}
//               />
//               {fieldErrors.item_id && (
//                 <Typography sx={{ fontSize: '0.65rem', color: '#EF4444' }}>
//                   {fieldErrors.item_id}
//                 </Typography>
//               )}
//             </Box>
//           </Grid>
//         </Grid>
//       </Paper>

//       {/* BOM & Routing */}
//       <Paper sx={{ p: 2, borderRadius: 1.5, border: `1px solid ${COLORS.border}`, boxShadow: 'none' }}>
//         <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color: COLORS.primary, mb: 1.5 }}>
//           Production Specifications
//         </Typography>

//         <Grid container spacing={1.5}>
//           <Grid size={{ xs: 12, sm: 6 }}>
//             <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//               <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
//                 <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary }}>
//                   BOM <span style={{ color: '#EF4444' }}>*</span>
//                 </Typography>
//                 <Tooltip title="Add New BOM">
//                   <IconButton
//                     size="small"
//                     onClick={() => setAddBomOpen(true)}
//                     sx={{
//                       color: COLORS.primary,
//                       p: 0.25,
//                       '&:hover': { bgcolor: COLORS.primaryLight }
//                     }}
//                   >
//                     <AddIcon sx={{ fontSize: '0.8rem' }} />
//                   </IconButton>
//                 </Tooltip>
//               </Box>
//               <Autocomplete
//                 fullWidth
//                 options={boms}
//                 getOptionLabel={(option) => `${option.bom_id} - ${option.parent_part_no} (v${option.bom_version})`}
//                 value={boms.find(b => b._id === formData.bom_id) || null}
//                 onChange={(event, newValue) => {
//                   setFormData(prev => ({ ...prev, bom_id: newValue?._id || '' }));
//                   setFieldErrors(prev => ({ ...prev, bom_id: '' }));
//                 }}
//                 loading={loadingBOM}
//                 renderInput={(params) => (
//                   <TextField
//                     {...params}
//                     size="small"
//                     placeholder="Select BOM"
//                     error={!!fieldErrors.bom_id}
//                     sx={{
//                       '& .MuiOutlinedInput-root': {
//                         borderRadius: 1.5,
//                         fontSize: '0.75rem',
//                         '&:hover fieldset': { borderColor: COLORS.primary }
//                       }
//                     }}
//                   />
//                 )}
//               />
//               {fieldErrors.bom_id && (
//                 <Typography sx={{ fontSize: '0.65rem', color: '#EF4444' }}>
//                   {fieldErrors.bom_id}
//                 </Typography>
//               )}
//             </Box>
//           </Grid>

//           <Grid size={{ xs: 12, sm: 6 }}>
//             <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//               <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
//                 <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary }}>
//                   ROUTING <span style={{ color: '#EF4444' }}>*</span>
//                 </Typography>
//                 <Tooltip title="Add New Routing">
//                   <IconButton
//                     size="small"
//                     onClick={() => setAddRoutingOpen(true)}
//                     sx={{
//                       color: COLORS.primary,
//                       p: 0.25,
//                       '&:hover': { bgcolor: COLORS.primaryLight }
//                     }}
//                   >
//                     <AddIcon sx={{ fontSize: '0.8rem' }} />
//                   </IconButton>
//                 </Tooltip>
//               </Box>
//               <Autocomplete
//                 fullWidth
//                 options={routings}
//                 getOptionLabel={(option) => `${option.routing_id} - ${option.routing_name}`}
//                 value={routings.find(r => r._id === formData.routing_id) || null}
//                 onChange={(event, newValue) => {
//                   setFormData(prev => ({ ...prev, routing_id: newValue?._id || '' }));
//                   setFieldErrors(prev => ({ ...prev, routing_id: '' }));
//                 }}
//                 loading={loadingRouting}
//                 renderInput={(params) => (
//                   <TextField
//                     {...params}
//                     size="small"
//                     placeholder="Select routing"
//                     error={!!fieldErrors.routing_id}
//                     sx={{
//                       '& .MuiOutlinedInput-root': {
//                         borderRadius: 1.5,
//                         fontSize: '0.75rem',
//                         '&:hover fieldset': { borderColor: COLORS.primary }
//                       }
//                     }}
//                   />
//                 )}
//               />
//               {fieldErrors.routing_id && (
//                 <Typography sx={{ fontSize: '0.65rem', color: '#EF4444' }}>
//                   {fieldErrors.routing_id}
//                 </Typography>
//               )}
//             </Box>
//           </Grid>
//         </Grid>
//       </Paper>
//     </Stack>
//   );

//   // Render Step 2 Content
//   const renderStep2Content = () => (
//     <Stack spacing={2}>
//       {/* Quantity & Dates */}
//       <Paper sx={{ p: 2, borderRadius: 1.5, border: `1px solid ${COLORS.border}`, boxShadow: 'none' }}>
//         <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color: COLORS.primary, mb: 1.5 }}>
//           <CalendarIcon sx={{ fontSize: '1rem', mr: 0.5, verticalAlign: 'middle' }} />
//           Planning Details
//         </Typography>

//         <Grid container spacing={1.5}>
//           <Grid size={{ xs: 12, sm: 6 }}>
//             <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//               <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary }}>
//                 PLANNED QUANTITY <span style={{ color: '#EF4444' }}>*</span>
//               </Typography>
//               <TextField
//                 fullWidth
//                 type="number"
//                 size="small"
//                 name="planned_qty"
//                 value={formData.planned_qty}
//                 onChange={handleChange}
//                 placeholder="e.g., 500"
//                 error={!!fieldErrors.planned_qty}
//                 sx={{
//                   '& .MuiOutlinedInput-root': {
//                     borderRadius: 1.5,
//                     fontSize: '0.75rem',
//                     '&:hover fieldset': { borderColor: COLORS.primary }
//                   }
//                 }}
//               />
//               {fieldErrors.planned_qty && (
//                 <Typography sx={{ fontSize: '0.65rem', color: '#EF4444' }}>
//                   {fieldErrors.planned_qty}
//                 </Typography>
//               )}
//             </Box>
//           </Grid>

//           <Grid size={{ xs: 12, sm: 6 }}>
//             <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//               <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary }}>
//                 WORK ORDER TYPE
//               </Typography>
//               <FormControl fullWidth size="small">
//                 <Select
//                   name="wo_type"
//                   value={formData.wo_type}
//                   onChange={handleChange}
//                   sx={{
//                     borderRadius: 1.5,
//                     fontSize: '0.75rem',
//                     '& .MuiSelect-select': { py: 1, px: 1.5 }
//                   }}
//                 >
//                   {WO_TYPE_OPTIONS.map(option => (
//                     <MenuItem key={option} value={option} sx={{ fontSize: '0.75rem' }}>
//                       {option}
//                     </MenuItem>
//                   ))}
//                 </Select>
//               </FormControl>
//             </Box>
//           </Grid>

//           <Grid size={{ xs: 12, sm: 4 }}>
//             <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//               <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary }}>
//                 PLANNED START <span style={{ color: '#EF4444' }}>*</span>
//               </Typography>
//               <TextField
//                 fullWidth
//                 type="date"
//                 size="small"
//                 name="planned_start"
//                 value={formData.planned_start}
//                 onChange={handleChange}
//                 error={!!fieldErrors.planned_start}
//                 InputLabelProps={{ shrink: true }}
//                 sx={{
//                   '& .MuiOutlinedInput-root': {
//                     borderRadius: 1.5,
//                     fontSize: '0.75rem',
//                     '&:hover fieldset': { borderColor: COLORS.primary }
//                   },
//                   '& .MuiInputBase-input': { py: 1, px: 1.5, fontSize: '0.75rem' }
//                 }}
//               />
//               {fieldErrors.planned_start && (
//                 <Typography sx={{ fontSize: '0.65rem', color: '#EF4444' }}>
//                   {fieldErrors.planned_start}
//                 </Typography>
//               )}
//             </Box>
//           </Grid>

//           <Grid size={{ xs: 12, sm: 4 }}>
//             <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//               <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary }}>
//                 PLANNED END <span style={{ color: '#EF4444' }}>*</span>
//               </Typography>
//               <TextField
//                 fullWidth
//                 type="date"
//                 size="small"
//                 name="planned_end"
//                 value={formData.planned_end}
//                 onChange={handleChange}
//                 error={!!fieldErrors.planned_end}
//                 InputLabelProps={{ shrink: true }}
//                 sx={{
//                   '& .MuiOutlinedInput-root': {
//                     borderRadius: 1.5,
//                     fontSize: '0.75rem',
//                     '&:hover fieldset': { borderColor: COLORS.primary }
//                   },
//                   '& .MuiInputBase-input': { py: 1, px: 1.5, fontSize: '0.75rem' }
//                 }}
//               />
//               {fieldErrors.planned_end && (
//                 <Typography sx={{ fontSize: '0.65rem', color: '#EF4444' }}>
//                   {fieldErrors.planned_end}
//                 </Typography>
//               )}
//             </Box>
//           </Grid>

//           <Grid size={{ xs: 12, sm: 4 }}>
//             <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//               <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary }}>
//                 REQUIRED BY
//               </Typography>
//               <TextField
//                 fullWidth
//                 type="date"
//                 size="small"
//                 name="required_by"
//                 value={formData.required_by}
//                 onChange={handleChange}
//                 InputLabelProps={{ shrink: true }}
//                 sx={{
//                   '& .MuiOutlinedInput-root': {
//                     borderRadius: 1.5,
//                     fontSize: '0.75rem',
//                     '&:hover fieldset': { borderColor: COLORS.primary }
//                   },
//                   '& .MuiInputBase-input': { py: 1, px: 1.5, fontSize: '0.75rem' }
//                 }}
//               />
//             </Box>
//           </Grid>
//         </Grid>
//       </Paper>

//       {/* Additional Settings */}
//       <Paper sx={{ p: 2, borderRadius: 1.5, border: `1px solid ${COLORS.border}`, boxShadow: 'none' }}>
//         <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color: COLORS.primary, mb: 1.5 }}>
//           <SettingsIcon sx={{ fontSize: '1rem', mr: 0.5, verticalAlign: 'middle' }} />
//           Additional Settings
//         </Typography>

//         <Grid container spacing={1.5}>
//           <Grid size={{ xs: 12, sm: showAssemblyLine ? 6 : 12 }}>
//             <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//               <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary }}>
//                 PRIORITY
//               </Typography>
//               <FormControl fullWidth size="small">
//                 <Select
//                   name="priority"
//                   value={formData.priority}
//                   onChange={handleChange}
//                   sx={{
//                     borderRadius: 1.5,
//                     fontSize: '0.75rem',
//                     '& .MuiSelect-select': { py: 1, px: 1.5 }
//                   }}
//                 >
//                   {PRIORITY_OPTIONS.map(option => (
//                     <MenuItem key={option} value={option} sx={{ fontSize: '0.75rem' }}>
//                       {option}
//                     </MenuItem>
//                   ))}
//                 </Select>
//               </FormControl>
//             </Box>
//           </Grid>

//           {showAssemblyLine && (
//             <Grid size={{ xs: 12, sm: 6 }}>
//               <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//                 <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
//                   <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary }}>
//                     ASSEMBLY LINE
//                   </Typography>
//                   <Tooltip title="Add New Assembly Line">
//                     <IconButton
//                       size="small"
//                       onClick={() => setAddAssemblyOpen(true)}
//                       sx={{
//                         color: COLORS.primary,
//                         p: 0.25,
//                         '&:hover': { bgcolor: COLORS.primaryLight }
//                       }}
//                     >
//                       <AddIcon sx={{ fontSize: '0.8rem' }} />
//                     </IconButton>
//                   </Tooltip>
//                 </Box>
//                 <Autocomplete
//                   fullWidth
//                   options={assemblyLines}
//                   getOptionLabel={getAssemblyLineLabel}
//                   value={getSelectedAssemblyLine()}
//                   onChange={handleAssemblyLineChange}
//                   loading={loadingAssemblyLines}
//                   renderInput={(params) => (
//                     <TextField
//                       {...params}
//                       size="small"
//                       placeholder={loadingAssemblyLines ? "Loading assembly lines..." : "Select assembly line (optional)"}
//                       sx={{
//                         '& .MuiOutlinedInput-root': {
//                           borderRadius: 1.5,
//                           fontSize: '0.75rem',
//                           '&:hover fieldset': { borderColor: COLORS.primary }
//                         },
//                         '& .MuiInputBase-input': { py: 1, px: 1.5, fontSize: '0.75rem' }
//                       }}
//                     />
//                   )}
//                   noOptionsText="No assembly lines found"
//                   loadingText="Loading assembly lines..."
//                 />
//                 <Typography sx={{ fontSize: '0.6rem', color: COLORS.text.tertiary }}>
//                   Select the assembly line where this work order will be processed
//                 </Typography>
//               </Box>
//             </Grid>
//           )}

//           <Grid size={{ xs: 12 }}>
//             <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//               <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
//                 <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary }}>
//                   MRP RUN ID
//                 </Typography>
//                 <Tooltip title="Add New MRP Run">
//                   <IconButton
//                     size="small"
//                     onClick={() => setAddMrpRunOpen(true)}
//                     sx={{
//                       color: COLORS.primary,
//                       p: 0.25,
//                       '&:hover': { bgcolor: COLORS.primaryLight }
//                     }}
//                   >
//                     <AddIcon sx={{ fontSize: '0.8rem' }} />
//                   </IconButton>
//                 </Tooltip>
//               </Box>
//               <Autocomplete
//                 fullWidth
//                 options={mrpRuns}
//                 getOptionLabel={(option) => `${option.mrp_run_id} - ${option.run_type} (${new Date(option.run_date).toLocaleDateString()})`}
//                 value={mrpRuns.find(m => m._id === formData.mrp_run_id) || null}
//                 onChange={(event, newValue) => {
//                   setFormData(prev => ({ ...prev, mrp_run_id: newValue?._id || '' }));
//                 }}
//                 loading={loadingMRP}
//                 renderInput={(params) => (
//                   <TextField
//                     {...params}
//                     size="small"
//                     placeholder="Select MRP run (optional)"
//                     sx={{
//                       '& .MuiOutlinedInput-root': {
//                         borderRadius: 1.5,
//                         fontSize: '0.75rem',
//                         '&:hover fieldset': { borderColor: COLORS.primary }
//                       }
//                     }}
//                   />
//                 )}
//               />
//             </Box>
//           </Grid>
//         </Grid>
//       </Paper>
//     </Stack>
//   );

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
//             overflow: 'hidden'
//           }
//         }}
//       >
//         <DialogTitle sx={{
//           borderBottom: `1px solid ${COLORS.border}`,
//           py: 1.5,
//           px: 2.5,
//           mb: 0,
//           bgcolor: COLORS.background.white
//         }}>
//           <Typography sx={{ fontSize: '1.2rem', fontWeight: 700, color: COLORS.text.primary }}>
//             Add New Work Order
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

//         <DialogContent sx={{ p: 2.5 }}>
//           {activeStep === 0 ? renderStep1Content() : renderStep2Content()}
          
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
//                 {loading ? 'Creating...' : 'Create Work Order'}
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

//       {/* Add Sale Order Dialog */}
//       <AddSaleOrder
//         open={addSaleOrderOpen}
//         onClose={() => setAddSaleOrderOpen(false)}
//         onAdd={handleSaleOrderAdded}
//       />

//       {/* Add Item Dialog */}
//       <AddItem
//         open={addItemOpen}
//         onClose={() => setAddItemOpen(false)}
//         onAdd={handleItemAdded}
//       />

//       {/* Add BOM Dialog */}
//       <AddBom
//         open={addBomOpen}
//         onClose={() => setAddBomOpen(false)}
//         onAdd={handleBomAdded}
//       />

//       {/* Add Routing Dialog */}
//       <AddRouting
//         open={addRoutingOpen}
//         onClose={() => setAddRoutingOpen(false)}
//         onAdd={handleRoutingAdded}
//       />

//       {/* Add MRP Run Dialog */}
//       <MrpRun
//         open={addMrpRunOpen}
//         onClose={() => setAddMrpRunOpen(false)}
//         onAdd={handleMrpRunAdded}
//       />

//       {/* Add Assembly Line Dialog */}
//       <AddAssembly
//         open={addAssemblyOpen}
//         onClose={() => setAddAssemblyOpen(false)}
//         onAdd={handleAssemblyAdded}
//       />
//     </>
//   );
// };

// export default AddWorkOrder;







// import React, { useState, useEffect, useCallback } from 'react';
// import {
//   Dialog, DialogTitle, DialogContent, DialogActions,
//   Button, TextField, Alert, Typography, Box, Stack, Grid,
//   Autocomplete, FormControl, Select, MenuItem, Paper, IconButton, Tooltip,
//   Stepper, Step, StepLabel, StepConnector, stepConnectorClasses, styled,
//   Collapse
// } from '@mui/material';
// import { 
//   Add as AddIcon, 
//   Inventory as InventoryIcon, 
//   NavigateNext as NavigateNextIcon, 
//   NavigateBefore as NavigateBeforeIcon,
//   ProductionQuantityLimits as ProductionIcon,
//   Event as EventIcon,  // Changed from CalendarIcon
//   Settings as SettingsIcon, 
//   Error as ErrorIcon, 
//   Close as CloseIcon
// } from '@mui/icons-material';
// import axios from 'axios';
// import BASE_URL from '../../../config/Config';
// import AddSaleOrder from '../../salesordermaster/AddSaleOrder';
// import AddItem from '../../master/itemmaster/AddItem';
// import AddBom from '../../bommaster/BOM/bom/AddBom';
// import AddRouting from '../../bommaster/routing/AddRouting';
// import MrpRun from '../../bommaster/MRP/MrpRun';
// import AddAssembly from '../assemblylines/AddAssembly';

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

// const PRIORITY_OPTIONS = ['Critical', 'High', 'Medium', 'Low'];
// const WO_TYPE_OPTIONS = ['Machining', 'Assembly', 'SubAssembly', 'Kit'];

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

// const steps = ['Production Details', 'Planning & Settings'];

// const AddWorkOrder = ({ open, onClose, onAdd }) => {
//   const [activeStep, setActiveStep] = useState(0);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState('');
//   const [fieldErrors, setFieldErrors] = useState({});

//   // Dialog states
//   const [addSaleOrderOpen, setAddSaleOrderOpen] = useState(false);
//   const [addItemOpen, setAddItemOpen] = useState(false);
//   const [addBomOpen, setAddBomOpen] = useState(false);
//   const [addRoutingOpen, setAddRoutingOpen] = useState(false);
//   const [addMrpRunOpen, setAddMrpRunOpen] = useState(false);
//   const [addAssemblyOpen, setAddAssemblyOpen] = useState(false);

//   // Data fetching states
//   const [salesOrders, setSalesOrders] = useState([]);
//   const [selectedSO, setSelectedSO] = useState(null);
//   const [selectedSOItem, setSelectedSOItem] = useState(null);
//   const [selectedItem, setSelectedItem] = useState(null);
//   const [boms, setBoms] = useState([]);
//   const [routings, setRoutings] = useState([]);
//   const [mrpRuns, setMrpRuns] = useState([]);
//   const [items, setItems] = useState([]);
//   const [assemblyLines, setAssemblyLines] = useState([]);
  
//   const [loadingSO, setLoadingSO] = useState(false);
//   const [loadingBOM, setLoadingBOM] = useState(false);
//   const [loadingRouting, setLoadingRouting] = useState(false);
//   const [loadingMRP, setLoadingMRP] = useState(false);
//   const [loadingItems, setLoadingItems] = useState(false);
//   const [loadingAssemblyLines, setLoadingAssemblyLines] = useState(false);

//   // Form data
//   const [formData, setFormData] = useState({
//     so_id: '',
//     so_item_id: '',
//     item_id: '',
//     bom_id: '',
//     routing_id: '',
//     planned_qty: '',
//     planned_start: '',
//     planned_end: '',
//     required_by: '',
//     priority: 'Medium',
//     wo_type: 'Machining',
//     assembly_line: '',
//     serial_tracking: false,
//     mrp_run_id: ''
//   });

//   const showError = (message) => {
//     setError(message);
//     setTimeout(() => {
//       setError('');
//     }, 5000);
//   };

//   // Check if assembly line should be shown
//   const showAssemblyLine = ['Assembly', 'SubAssembly'].includes(formData.wo_type);

//   // Fetch Sales Orders
//   const fetchSalesOrders = useCallback(async () => {
//     try {
//       setLoadingSO(true);
//       const token = localStorage.getItem('token');
//       const response = await axios.get(`${BASE_URL}/api/sales-orders`, {
//         headers: { Authorization: `Bearer ${token}` }
//       });
//       if (response.data.success) {
//         setSalesOrders(response.data.data || []);
//       }
//     } catch (err) {
//       console.error('Error fetching sales orders:', err);
//     } finally {
//       setLoadingSO(false);
//     }
//   }, []);

//   // Fetch BOMs
//   const fetchBOMs = useCallback(async () => {
//     try {
//       setLoadingBOM(true);
//       const token = localStorage.getItem('token');
//       const response = await axios.get(`${BASE_URL}/api/boms`, {
//         headers: { Authorization: `Bearer ${token}` }
//       });
//       if (response.data.success) {
//         setBoms(response.data.data || []);
//       }
//     } catch (err) {
//       console.error('Error fetching BOMs:', err);
//     } finally {
//       setLoadingBOM(false);
//     }
//   }, []);

//   // Fetch Routings
//   const fetchRoutings = useCallback(async () => {
//     try {
//       setLoadingRouting(true);
//       const token = localStorage.getItem('token');
//       const response = await axios.get(`${BASE_URL}/api/routings`, {
//         headers: { Authorization: `Bearer ${token}` }
//       });
//       if (response.data.success) {
//         setRoutings(response.data.data || []);
//       }
//     } catch (err) {
//       console.error('Error fetching routings:', err);
//     } finally {
//       setLoadingRouting(false);
//     }
//   }, []);

//   // Fetch MRP Runs
//   const fetchMrpRuns = useCallback(async () => {
//     try {
//       setLoadingMRP(true);
//       const token = localStorage.getItem('token');
//       const response = await axios.get(`${BASE_URL}/api/mrp/runs`, {
//         headers: { Authorization: `Bearer ${token}` }
//       });
//       if (response.data.success) {
//         setMrpRuns(response.data.data || []);
//       }
//     } catch (err) {
//       console.error('Error fetching MRP runs:', err);
//     } finally {
//       setLoadingMRP(false);
//     }
//   }, []);

//   // Fetch Items
//   const fetchItems = useCallback(async () => {
//     try {
//       setLoadingItems(true);
//       const token = localStorage.getItem('token');
//       const response = await axios.get(`${BASE_URL}/api/items`, {
//         headers: { Authorization: `Bearer ${token}` }
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

//   // Fetch Assembly Lines
//   const fetchAssemblyLines = useCallback(async () => {
//     try {
//       setLoadingAssemblyLines(true);
//       const token = localStorage.getItem('token');
//       const response = await axios.get(`${BASE_URL}/api/assembly-lines/dropdown`, {
//         headers: { Authorization: `Bearer ${token}` }
//       });
//       if (response.data.success) {
//         setAssemblyLines(response.data.data || []);
//       }
//     } catch (err) {
//       console.error('Error fetching assembly lines:', err);
//       try {
//         const fallbackResponse = await axios.get(`${BASE_URL}/api/assembly-lines`, {
//           headers: { Authorization: `Bearer ${token}` }
//         });
//         if (fallbackResponse.data.success) {
//           const activeLines = (fallbackResponse.data.data || []).filter(line => line.is_active === true);
//           setAssemblyLines(activeLines);
//         }
//       } catch (fallbackErr) {
//         console.error('Error fetching assembly lines (fallback):', fallbackErr);
//       }
//     } finally {
//       setLoadingAssemblyLines(false);
//     }
//   }, []);

//   // Fetch data when dialog opens
//   useEffect(() => {
//     if (open) {
//       fetchSalesOrders();
//       fetchBOMs();
//       fetchRoutings();
//       fetchMrpRuns();
//       fetchItems();
//       fetchAssemblyLines();
//     }
//   }, [open, fetchSalesOrders, fetchBOMs, fetchRoutings, fetchMrpRuns, fetchItems, fetchAssemblyLines]);

//   // Reset active step when dialog opens/closes
//   useEffect(() => {
//     if (!open) {
//       setActiveStep(0);
//     }
//   }, [open]);

//   // Handle Sales Order added
//   const handleSaleOrderAdded = (newSaleOrder) => {
//     setSalesOrders(prev => [newSaleOrder, ...prev]);
//     setSelectedSO(newSaleOrder);
//     setFormData(prev => ({
//       ...prev,
//       so_id: newSaleOrder._id,
//       so_item_id: ''
//     }));
//     setSelectedSOItem(null);
//   };

//   // Handle Item added
//   const handleItemAdded = (newItem) => {
//     setItems(prev => [newItem, ...prev]);
//     setSelectedItem(newItem);
//     setFormData(prev => ({
//       ...prev,
//       item_id: newItem._id
//     }));
//   };

//   // Handle BOM added
//   const handleBomAdded = (newBom) => {
//     setBoms(prev => [newBom, ...prev]);
//     setFormData(prev => ({
//       ...prev,
//       bom_id: newBom._id
//     }));
//   };

//   // Handle Routing added
//   const handleRoutingAdded = (newRouting) => {
//     setRoutings(prev => [newRouting, ...prev]);
//     setFormData(prev => ({
//       ...prev,
//       routing_id: newRouting._id
//     }));
//   };

//   // Handle MRP Run added
//   const handleMrpRunAdded = (newMrpRun) => {
//     setMrpRuns(prev => [newMrpRun, ...prev]);
//     setFormData(prev => ({
//       ...prev,
//       mrp_run_id: newMrpRun._id
//     }));
//   };

//   // Handle Assembly Line added
//   const handleAssemblyAdded = (newAssembly) => {
//     setAssemblyLines(prev => [newAssembly, ...prev]);
//     setFormData(prev => ({
//       ...prev,
//       assembly_line: newAssembly._id
//     }));
//   };

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData(prev => ({ ...prev, [name]: value }));
//     setFieldErrors(prev => ({ ...prev, [name]: '' }));
    
//     // Reset assembly line if wo_type changes to non-assembly type
//     if (name === 'wo_type' && !['Assembly', 'SubAssembly'].includes(value)) {
//       setFormData(prev => ({ ...prev, assembly_line: '' }));
//     }
//   };

//   const handleSOChange = (event, newValue) => {
//     setSelectedSO(newValue);
//     setFormData(prev => ({
//       ...prev,
//       so_id: newValue?._id || '',
//       so_item_id: ''
//     }));
//     setSelectedSOItem(null);
//     setFieldErrors(prev => ({ ...prev, so_id: '' }));
//   };

//   const handleSOItemChange = (event, newValue) => {
//     setSelectedSOItem(newValue);
//     setFormData(prev => ({
//       ...prev,
//       so_item_id: newValue?._id || ''
//     }));
//     setFieldErrors(prev => ({ ...prev, so_item_id: '' }));
//   };

//   const handleItemChange = (event, newValue) => {
//     setSelectedItem(newValue);
//     setFormData(prev => ({
//       ...prev,
//       item_id: newValue?._id || ''
//     }));
//     setFieldErrors(prev => ({ ...prev, item_id: '' }));
//   };

//   const handleAssemblyLineChange = (event, newValue) => {
//     setFormData(prev => ({
//       ...prev,
//       assembly_line: newValue?._id || ''
//     }));
//   };

//   // Validate Step 1 (Production Details)
//   const validateStep1 = () => {
//     const errors = {};
//     let isValid = true;
//     let errorMessages = [];

//     if (!formData.so_id) {
//       errors.so_id = 'Sales Order is required';
//       errorMessages.push('Sales Order is required');
//       isValid = false;
//     }
    
//     const hasMultipleItems = selectedSO && selectedSO.items && selectedSO.items.length > 1;
//     if (hasMultipleItems && !formData.so_item_id) {
//       errors.so_item_id = 'Please select an SO item';
//       errorMessages.push('Please select an SO item');
//       isValid = false;
//     }
    
//     if (!formData.item_id) {
//       errors.item_id = 'Item is required';
//       errorMessages.push('Item is required');
//       isValid = false;
//     }
//     if (!formData.bom_id) {
//       errors.bom_id = 'BOM is required';
//       errorMessages.push('BOM is required');
//       isValid = false;
//     }
//     if (!formData.routing_id) {
//       errors.routing_id = 'Routing is required';
//       errorMessages.push('Routing is required');
//       isValid = false;
//     }

//     setFieldErrors(errors);
//     if (!isValid) {
//       showError(errorMessages[0]);
//     }
//     return isValid;
//   };

//   // Validate Step 2 (Planning & Settings)
//   const validateStep2 = () => {
//     const errors = {};
//     let isValid = true;
//     let errorMessages = [];

//     if (!formData.planned_qty || formData.planned_qty <= 0) {
//       errors.planned_qty = 'Valid planned quantity is required';
//       errorMessages.push('Valid planned quantity is required');
//       isValid = false;
//     }
//     if (!formData.planned_start) {
//       errors.planned_start = 'Planned start date is required';
//       errorMessages.push('Planned start date is required');
//       isValid = false;
//     }
//     if (!formData.planned_end) {
//       errors.planned_end = 'Planned end date is required';
//       errorMessages.push('Planned end date is required');
//       isValid = false;
//     }

//     setFieldErrors(errors);
//     if (!isValid) {
//       showError(errorMessages[0]);
//     }
//     return isValid;
//   };

//   const handleNext = () => {
//     if (validateStep1()) {
//       setActiveStep(1);
//     }
//   };

//   const handleBack = () => {
//     setActiveStep(0);
//   };

//   const validateForm = () => {
//     const step1Valid = validateStep1();
//     const step2Valid = validateStep2();
//     return step1Valid && step2Valid;
//   };

//   const handleSubmit = async () => {
//     if (!validateForm()) return;

//     setLoading(true);
//     setError('');

//     try {
//       const token = localStorage.getItem('token');
//       const submitData = {
//         so_id: formData.so_id,
//         so_item_id: formData.so_item_id || undefined,
//         item_id: formData.item_id,
//         bom_id: formData.bom_id,
//         routing_id: formData.routing_id,
//         planned_qty: Number(formData.planned_qty),
//         planned_start: formData.planned_start,
//         planned_end: formData.planned_end,
//         required_by: formData.required_by || formData.planned_end,
//         priority: formData.priority,
//         wo_type: formData.wo_type,
//         assembly_line: showAssemblyLine ? (formData.assembly_line || undefined) : undefined,
//         serial_tracking: formData.serial_tracking,
//         mrp_run_id: formData.mrp_run_id || undefined
//       };

//       const response = await axios.post(`${BASE_URL}/api/work-orders`, submitData, {
//         headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
//       });

//       if (response.data.success) {
//         onAdd(response.data.data);
//         resetForm();
//         onClose();
//       } else {
//         showError(response.data.message || 'Failed to create work order');
//       }
//     } catch (err) {
//       console.error('Error creating work order:', err);
//       showError(err.response?.data?.message || 'Failed to create work order');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const resetForm = () => {
//     setFormData({
//       so_id: '',
//       so_item_id: '',
//       item_id: '',
//       bom_id: '',
//       routing_id: '',
//       planned_qty: '',
//       planned_start: '',
//       planned_end: '',
//       required_by: '',
//       priority: 'Medium',
//       wo_type: 'Machining',
//       assembly_line: '',
//       serial_tracking: false,
//       mrp_run_id: ''
//     });
//     setSelectedSO(null);
//     setSelectedSOItem(null);
//     setSelectedItem(null);
//     setFieldErrors({});
//     setError('');
//     setActiveStep(0);
//   };

//   const handleClose = () => {
//     resetForm();
//     onClose();
//   };

//   const availableSOItems = selectedSO?.items || [];
//   const hasMultipleSOItems = availableSOItems.length > 1;

//   const getSelectedAssemblyLine = () => {
//     return assemblyLines.find(al => al._id === formData.assembly_line) || null;
//   };

//   const getAssemblyLineLabel = (option) => {
//     return `${option.line_code} - ${option.line_name} (${option.line_type})`;
//   };

//   // Render Step 1 Content
//   const renderStep1Content = () => (
//     <Stack spacing={2}>
//       {/* Sales Order Selection */}
//       <Paper sx={{ p: 2, borderRadius: 1.5, border: `1px solid ${COLORS.border}`, boxShadow: 'none' }}>
//         <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color: COLORS.primary, mb: 1.5 }}>
//           <InventoryIcon sx={{ fontSize: '1rem', mr: 0.5, verticalAlign: 'middle' }} />
//           Sales Order Details
//         </Typography>

//         <Grid container spacing={1.5}>
//           <Grid size={{ xs: 12 }}>
//             <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//               <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
//                 <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary }}>
//                   SALES ORDER <span style={{ color: '#EF4444' }}>*</span>
//                 </Typography>
//                 <Tooltip title="Add New Sales Order">
//                   <IconButton
//                     size="small"
//                     onClick={() => setAddSaleOrderOpen(true)}
//                     sx={{
//                       color: COLORS.primary,
//                       p: 0.25,
//                       '&:hover': { bgcolor: COLORS.primaryLight }
//                     }}
//                   >
//                     <AddIcon sx={{ fontSize: '0.8rem' }} />
//                   </IconButton>
//                 </Tooltip>
//               </Box>
//               <Autocomplete
//                 fullWidth
//                 options={salesOrders}
//                 getOptionLabel={(option) => `${option.so_number} - ${option.customer_name}`}
//                 value={selectedSO}
//                 onChange={handleSOChange}
//                 loading={loadingSO}
//                 renderInput={(params) => (
//                   <TextField
//                     {...params}
//                     size="small"
//                     placeholder="Select sales order"
//                     error={!!fieldErrors.so_id}
//                     helperText={fieldErrors.so_id}
//                     sx={{
//                       '& .MuiOutlinedInput-root': {
//                         borderRadius: 1.5,
//                         fontSize: '0.75rem',
//                         '&:hover fieldset': { borderColor: COLORS.primary },
//                         '&.Mui-error fieldset': { borderColor: '#EF4444' }
//                       }
//                     }}
//                   />
//                 )}
//               />
//             </Box>
//           </Grid>

//           {hasMultipleSOItems && (
//             <Grid size={{ xs: 12 }}>
//               <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//                 <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary }}>
//                   SO ITEM <span style={{ color: '#EF4444' }}>*</span>
//                 </Typography>
//                 <Autocomplete
//                   fullWidth
//                   options={availableSOItems}
//                   getOptionLabel={(option) => `${option.part_no} - ${option.part_name} (Qty: ${option.ordered_qty})`}
//                   value={selectedSOItem}
//                   onChange={handleSOItemChange}
//                   disabled={!selectedSO}
//                   loading={loadingSO}
//                   renderInput={(params) => (
//                     <TextField
//                       {...params}
//                       size="small"
//                       placeholder={selectedSO ? "Select SO item" : "Select sales order first"}
//                       error={!!fieldErrors.so_item_id}
//                       helperText={fieldErrors.so_item_id}
//                       sx={{
//                         '& .MuiOutlinedInput-root': {
//                           borderRadius: 1.5,
//                           fontSize: '0.75rem',
//                           '&:hover fieldset': { borderColor: COLORS.primary },
//                           '&.Mui-error fieldset': { borderColor: '#EF4444' }
//                         }
//                       }}
//                     />
//                   )}
//                 />
//               </Box>
//             </Grid>
//           )}

//           {selectedSO && !hasMultipleSOItems && availableSOItems.length === 1 && (
//             <Grid size={{ xs: 12 }}>
//               <Box sx={{ 
//                 p: 1, 
//                 bgcolor: COLORS.primaryLight, 
//                 borderRadius: 1.5,
//                 border: `1px solid ${COLORS.primary}20`
//               }}>
//                 <Typography sx={{ fontSize: '0.7rem', color: COLORS.text.secondary }}>
//                   SO Item (Auto-selected):
//                 </Typography>
//                 <Typography sx={{ fontSize: '0.75rem', fontWeight: 500, color: COLORS.text.primary }}>
//                   {availableSOItems[0]?.part_no} - {availableSOItems[0]?.part_name}
//                 </Typography>
//               </Box>
//             </Grid>
//           )}
//         </Grid>
//       </Paper>

//       {/* Item Master Selection */}
//       <Paper sx={{ p: 2, borderRadius: 1.5, border: `1px solid ${COLORS.border}`, boxShadow: 'none' }}>
//         <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color: COLORS.primary, mb: 1.5 }}>
//           <ProductionIcon sx={{ fontSize: '1rem', mr: 0.5, verticalAlign: 'middle' }} />
//           Item Details
//         </Typography>

//         <Grid container spacing={1.5}>
//           <Grid size={{ xs: 12 }}>
//             <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//               <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
//                 <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary }}>
//                   ITEM <span style={{ color: '#EF4444' }}>*</span>
//                 </Typography>
//                 <Tooltip title="Add New Item">
//                   <IconButton
//                     size="small"
//                     onClick={() => setAddItemOpen(true)}
//                     sx={{
//                       color: COLORS.primary,
//                       p: 0.25,
//                       '&:hover': { bgcolor: COLORS.primaryLight }
//                     }}
//                   >
//                     <AddIcon sx={{ fontSize: '0.8rem' }} />
//                   </IconButton>
//                 </Tooltip>
//               </Box>
//               <Autocomplete
//                 fullWidth
//                 options={items}
//                 getOptionLabel={(option) => `${option.part_no} - ${option.part_description || option.part_name} (${option.item_category || 'N/A'})`}
//                 value={selectedItem}
//                 onChange={handleItemChange}
//                 loading={loadingItems}
//                 renderInput={(params) => (
//                   <TextField
//                     {...params}
//                     size="small"
//                     placeholder="Select item"
//                     error={!!fieldErrors.item_id}
//                     helperText={fieldErrors.item_id}
//                     sx={{
//                       '& .MuiOutlinedInput-root': {
//                         borderRadius: 1.5,
//                         fontSize: '0.75rem',
//                         '&:hover fieldset': { borderColor: COLORS.primary },
//                         '&.Mui-error fieldset': { borderColor: '#EF4444' }
//                       }
//                     }}
//                   />
//                 )}
//               />
//             </Box>
//           </Grid>
//         </Grid>
//       </Paper>

//       {/* BOM & Routing */}
//       <Paper sx={{ p: 2, borderRadius: 1.5, border: `1px solid ${COLORS.border}`, boxShadow: 'none' }}>
//         <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color: COLORS.primary, mb: 1.5 }}>
//           Production Specifications
//         </Typography>

//         <Grid container spacing={1.5}>
//           <Grid size={{ xs: 12, sm: 6 }}>
//             <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//               <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
//                 <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary }}>
//                   BOM <span style={{ color: '#EF4444' }}>*</span>
//                 </Typography>
//                 <Tooltip title="Add New BOM">
//                   <IconButton
//                     size="small"
//                     onClick={() => setAddBomOpen(true)}
//                     sx={{
//                       color: COLORS.primary,
//                       p: 0.25,
//                       '&:hover': { bgcolor: COLORS.primaryLight }
//                     }}
//                   >
//                     <AddIcon sx={{ fontSize: '0.8rem' }} />
//                   </IconButton>
//                 </Tooltip>
//               </Box>
//               <Autocomplete
//                 fullWidth
//                 options={boms}
//                 getOptionLabel={(option) => `${option.bom_id} - ${option.parent_part_no} (v${option.bom_version})`}
//                 value={boms.find(b => b._id === formData.bom_id) || null}
//                 onChange={(event, newValue) => {
//                   setFormData(prev => ({ ...prev, bom_id: newValue?._id || '' }));
//                   setFieldErrors(prev => ({ ...prev, bom_id: '' }));
//                 }}
//                 loading={loadingBOM}
//                 renderInput={(params) => (
//                   <TextField
//                     {...params}
//                     size="small"
//                     placeholder="Select BOM"
//                     error={!!fieldErrors.bom_id}
//                     helperText={fieldErrors.bom_id}
//                     sx={{
//                       '& .MuiOutlinedInput-root': {
//                         borderRadius: 1.5,
//                         fontSize: '0.75rem',
//                         '&:hover fieldset': { borderColor: COLORS.primary },
//                         '&.Mui-error fieldset': { borderColor: '#EF4444' }
//                       }
//                     }}
//                   />
//                 )}
//               />
//             </Box>
//           </Grid>

//           <Grid size={{ xs: 12, sm: 6 }}>
//             <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//               <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
//                 <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary }}>
//                   ROUTING <span style={{ color: '#EF4444' }}>*</span>
//                 </Typography>
//                 <Tooltip title="Add New Routing">
//                   <IconButton
//                     size="small"
//                     onClick={() => setAddRoutingOpen(true)}
//                     sx={{
//                       color: COLORS.primary,
//                       p: 0.25,
//                       '&:hover': { bgcolor: COLORS.primaryLight }
//                     }}
//                   >
//                     <AddIcon sx={{ fontSize: '0.8rem' }} />
//                   </IconButton>
//                 </Tooltip>
//               </Box>
//               <Autocomplete
//                 fullWidth
//                 options={routings}
//                 getOptionLabel={(option) => `${option.routing_id} - ${option.routing_name}`}
//                 value={routings.find(r => r._id === formData.routing_id) || null}
//                 onChange={(event, newValue) => {
//                   setFormData(prev => ({ ...prev, routing_id: newValue?._id || '' }));
//                   setFieldErrors(prev => ({ ...prev, routing_id: '' }));
//                 }}
//                 loading={loadingRouting}
//                 renderInput={(params) => (
//                   <TextField
//                     {...params}
//                     size="small"
//                     placeholder="Select routing"
//                     error={!!fieldErrors.routing_id}
//                     helperText={fieldErrors.routing_id}
//                     sx={{
//                       '& .MuiOutlinedInput-root': {
//                         borderRadius: 1.5,
//                         fontSize: '0.75rem',
//                         '&:hover fieldset': { borderColor: COLORS.primary },
//                         '&.Mui-error fieldset': { borderColor: '#EF4444' }
//                       }
//                     }}
//                   />
//                 )}
//               />
//             </Box>
//           </Grid>
//         </Grid>
//       </Paper>
//     </Stack>
//   );

//   // Render Step 2 Content
//   const renderStep2Content = () => (
//     <Stack spacing={2}>
//       {/* Quantity & Dates */}
//       <Paper sx={{ p: 2, borderRadius: 1.5, border: `1px solid ${COLORS.border}`, boxShadow: 'none' }}>
//         <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color: COLORS.primary, mb: 1.5 }}>
//           <EventIcon sx={{ fontSize: '1rem', mr: 0.5, verticalAlign: 'middle' }} />
//           Planning Details
//         </Typography>

//         <Grid container spacing={1.5}>
//           <Grid size={{ xs: 12, sm: 6 }}>
//             <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//               <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary }}>
//                 PLANNED QUANTITY <span style={{ color: '#EF4444' }}>*</span>
//               </Typography>
//               <TextField
//                 fullWidth
//                 type="number"
//                 size="small"
//                 name="planned_qty"
//                 value={formData.planned_qty}
//                 onChange={handleChange}
//                 placeholder="e.g., 500"
//                 error={!!fieldErrors.planned_qty}
//                 helperText={fieldErrors.planned_qty}
//                 sx={{
//                   '& .MuiOutlinedInput-root': {
//                     borderRadius: 1.5,
//                     fontSize: '0.75rem',
//                     '&:hover fieldset': { borderColor: COLORS.primary },
//                     '&.Mui-error fieldset': { borderColor: '#EF4444' }
//                   }
//                 }}
//               />
//             </Box>
//           </Grid>

//           <Grid size={{ xs: 12, sm: 6 }}>
//             <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//               <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary }}>
//                 WORK ORDER TYPE
//               </Typography>
//               <FormControl fullWidth size="small">
//                 <Select
//                   name="wo_type"
//                   value={formData.wo_type}
//                   onChange={handleChange}
//                   sx={{
//                     borderRadius: 1.5,
//                     fontSize: '0.75rem',
//                     '& .MuiSelect-select': { py: 1, px: 1.5 }
//                   }}
//                 >
//                   {WO_TYPE_OPTIONS.map(option => (
//                     <MenuItem key={option} value={option} sx={{ fontSize: '0.75rem' }}>
//                       {option}
//                     </MenuItem>
//                   ))}
//                 </Select>
//               </FormControl>
//             </Box>
//           </Grid>

//           <Grid size={{ xs: 12, sm: 4 }}>
//             <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//               <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary }}>
//                 PLANNED START <span style={{ color: '#EF4444' }}>*</span>
//               </Typography>
//               <TextField
//                 fullWidth
//                 type="date"
//                 size="small"
//                 name="planned_start"
//                 value={formData.planned_start}
//                 onChange={handleChange}
//                 error={!!fieldErrors.planned_start}
//                 helperText={fieldErrors.planned_start}
//                 InputLabelProps={{ shrink: true }}
//                 sx={{
//                   '& .MuiOutlinedInput-root': {
//                     borderRadius: 1.5,
//                     fontSize: '0.75rem',
//                     '&:hover fieldset': { borderColor: COLORS.primary },
//                     '&.Mui-error fieldset': { borderColor: '#EF4444' }
//                   },
//                   '& .MuiInputBase-input': { py: 1, px: 1.5, fontSize: '0.75rem' }
//                 }}
//               />
//             </Box>
//           </Grid>

//           <Grid size={{ xs: 12, sm: 4 }}>
//             <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//               <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary }}>
//                 PLANNED END <span style={{ color: '#EF4444' }}>*</span>
//               </Typography>
//               <TextField
//                 fullWidth
//                 type="date"
//                 size="small"
//                 name="planned_end"
//                 value={formData.planned_end}
//                 onChange={handleChange}
//                 error={!!fieldErrors.planned_end}
//                 helperText={fieldErrors.planned_end}
//                 InputLabelProps={{ shrink: true }}
//                 sx={{
//                   '& .MuiOutlinedInput-root': {
//                     borderRadius: 1.5,
//                     fontSize: '0.75rem',
//                     '&:hover fieldset': { borderColor: COLORS.primary },
//                     '&.Mui-error fieldset': { borderColor: '#EF4444' }
//                   },
//                   '& .MuiInputBase-input': { py: 1, px: 1.5, fontSize: '0.75rem' }
//                 }}
//               />
//             </Box>
//           </Grid>

//           <Grid size={{ xs: 12, sm: 4 }}>
//             <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//               <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary }}>
//                 REQUIRED BY
//               </Typography>
//               <TextField
//                 fullWidth
//                 type="date"
//                 size="small"
//                 name="required_by"
//                 value={formData.required_by}
//                 onChange={handleChange}
//                 InputLabelProps={{ shrink: true }}
//                 sx={{
//                   '& .MuiOutlinedInput-root': {
//                     borderRadius: 1.5,
//                     fontSize: '0.75rem',
//                     '&:hover fieldset': { borderColor: COLORS.primary }
//                   },
//                   '& .MuiInputBase-input': { py: 1, px: 1.5, fontSize: '0.75rem' }
//                 }}
//               />
//             </Box>
//           </Grid>
//         </Grid>
//       </Paper>

//       {/* Additional Settings */}
//       <Paper sx={{ p: 2, borderRadius: 1.5, border: `1px solid ${COLORS.border}`, boxShadow: 'none' }}>
//         <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color: COLORS.primary, mb: 1.5 }}>
//           <SettingsIcon sx={{ fontSize: '1rem', mr: 0.5, verticalAlign: 'middle' }} />
//           Additional Settings
//         </Typography>

//         <Grid container spacing={1.5}>
//           <Grid size={{ xs: 12, sm: showAssemblyLine ? 6 : 12 }}>
//             <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//               <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary }}>
//                 PRIORITY
//               </Typography>
//               <FormControl fullWidth size="small">
//                 <Select
//                   name="priority"
//                   value={formData.priority}
//                   onChange={handleChange}
//                   sx={{
//                     borderRadius: 1.5,
//                     fontSize: '0.75rem',
//                     '& .MuiSelect-select': { py: 1, px: 1.5 }
//                   }}
//                 >
//                   {PRIORITY_OPTIONS.map(option => (
//                     <MenuItem key={option} value={option} sx={{ fontSize: '0.75rem' }}>
//                       {option}
//                     </MenuItem>
//                   ))}
//                 </Select>
//               </FormControl>
//             </Box>
//           </Grid>

//           {showAssemblyLine && (
//             <Grid size={{ xs: 12, sm: 6 }}>
//               <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//                 <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
//                   <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary }}>
//                     ASSEMBLY LINE
//                   </Typography>
//                   <Tooltip title="Add New Assembly Line">
//                     <IconButton
//                       size="small"
//                       onClick={() => setAddAssemblyOpen(true)}
//                       sx={{
//                         color: COLORS.primary,
//                         p: 0.25,
//                         '&:hover': { bgcolor: COLORS.primaryLight }
//                       }}
//                     >
//                       <AddIcon sx={{ fontSize: '0.8rem' }} />
//                     </IconButton>
//                   </Tooltip>
//                 </Box>
//                 <Autocomplete
//                   fullWidth
//                   options={assemblyLines}
//                   getOptionLabel={getAssemblyLineLabel}
//                   value={getSelectedAssemblyLine()}
//                   onChange={handleAssemblyLineChange}
//                   loading={loadingAssemblyLines}
//                   renderInput={(params) => (
//                     <TextField
//                       {...params}
//                       size="small"
//                       placeholder={loadingAssemblyLines ? "Loading assembly lines..." : "Select assembly line (optional)"}
//                       sx={{
//                         '& .MuiOutlinedInput-root': {
//                           borderRadius: 1.5,
//                           fontSize: '0.75rem',
//                           '&:hover fieldset': { borderColor: COLORS.primary }
//                         },
//                         '& .MuiInputBase-input': { py: 1, px: 1.5, fontSize: '0.75rem' }
//                       }}
//                     />
//                   )}
//                   noOptionsText="No assembly lines found"
//                   loadingText="Loading assembly lines..."
//                 />
//                 <Typography sx={{ fontSize: '0.6rem', color: COLORS.text.tertiary }}>
//                   Select the assembly line where this work order will be processed
//                 </Typography>
//               </Box>
//             </Grid>
//           )}

//           <Grid size={{ xs: 12 }}>
//             <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//               <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
//                 <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary }}>
//                   MRP RUN ID
//                 </Typography>
//                 <Tooltip title="Add New MRP Run">
//                   <IconButton
//                     size="small"
//                     onClick={() => setAddMrpRunOpen(true)}
//                     sx={{
//                       color: COLORS.primary,
//                       p: 0.25,
//                       '&:hover': { bgcolor: COLORS.primaryLight }
//                     }}
//                   >
//                     <AddIcon sx={{ fontSize: '0.8rem' }} />
//                   </IconButton>
//                 </Tooltip>
//               </Box>
//               <Autocomplete
//                 fullWidth
//                 options={mrpRuns}
//                 getOptionLabel={(option) => `${option.mrp_run_id} - ${option.run_type} (${new Date(option.run_date).toLocaleDateString()})`}
//                 value={mrpRuns.find(m => m._id === formData.mrp_run_id) || null}
//                 onChange={(event, newValue) => {
//                   setFormData(prev => ({ ...prev, mrp_run_id: newValue?._id || '' }));
//                 }}
//                 loading={loadingMRP}
//                 renderInput={(params) => (
//                   <TextField
//                     {...params}
//                     size="small"
//                     placeholder="Select MRP run (optional)"
//                     sx={{
//                       '& .MuiOutlinedInput-root': {
//                         borderRadius: 1.5,
//                         fontSize: '0.75rem',
//                         '&:hover fieldset': { borderColor: COLORS.primary }
//                       }
//                     }}
//                   />
//                 )}
//               />
//             </Box>
//           </Grid>
//         </Grid>
//       </Paper>
//     </Stack>
//   );

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
//             overflow: 'hidden'
//           }
//         }}
//       >
//         <DialogTitle sx={{
//           borderBottom: `1px solid ${COLORS.border}`,
//           py: 1.5,
//           px: 2.5,
//           mb: 0,
//           bgcolor: COLORS.background.white
//         }}>
//           <Typography sx={{ fontSize: '1.2rem', fontWeight: 700, color: COLORS.text.primary }}>
//             Add New Work Order
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

//         <DialogContent sx={{ p: 2.5, pt: error ? 1 : 2 }}>
//           {activeStep === 0 ? renderStep1Content() : renderStep2Content()}
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
//                 {loading ? 'Creating...' : 'Create Work Order'}
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

//       {/* Add Sale Order Dialog */}
//       <AddSaleOrder
//         open={addSaleOrderOpen}
//         onClose={() => setAddSaleOrderOpen(false)}
//         onAdd={handleSaleOrderAdded}
//       />

//       {/* Add Item Dialog */}
//       <AddItem
//         open={addItemOpen}
//         onClose={() => setAddItemOpen(false)}
//         onAdd={handleItemAdded}
//       />

//       {/* Add BOM Dialog */}
//       <AddBom
//         open={addBomOpen}
//         onClose={() => setAddBomOpen(false)}
//         onAdd={handleBomAdded}
//       />

//       {/* Add Routing Dialog */}
//       <AddRouting
//         open={addRoutingOpen}
//         onClose={() => setAddRoutingOpen(false)}
//         onAdd={handleRoutingAdded}
//       />

//       {/* Add MRP Run Dialog */}
//       <MrpRun
//         open={addMrpRunOpen}
//         onClose={() => setAddMrpRunOpen(false)}
//         onAdd={handleMrpRunAdded}
//       />

//       {/* Add Assembly Line Dialog */}
//       <AddAssembly
//         open={addAssemblyOpen}
//         onClose={() => setAddAssemblyOpen(false)}
//         onAdd={handleAssemblyAdded}
//       />
//     </>
//   );
// };

// export default AddWorkOrder;

// import React, { useState, useEffect, useCallback } from 'react';
// import {
//   Dialog, DialogTitle, DialogContent, DialogActions,
//   Button, TextField, Alert, Typography, Box, Stack, Grid,
//   Autocomplete, FormControl, Select, MenuItem, Paper, IconButton, Tooltip,
//   Stepper, Step, StepLabel, StepConnector, stepConnectorClasses, styled,
//   Collapse, InputAdornment, Divider, CircularProgress
// } from '@mui/material';
// import { 
//   Add as AddIcon, 
//   Inventory as InventoryIcon, 
//   NavigateNext as NavigateNextIcon, 
//   NavigateBefore as NavigateBeforeIcon,
//   ProductionQuantityLimits as ProductionIcon,
//   Event as EventIcon,
//   Settings as SettingsIcon, 
//   Error as ErrorIcon, 
//   Close as CloseIcon,
//   Business as BusinessIcon,
//   PersonAdd as PersonAddIcon,
//   Save as SaveIcon,
//   Cancel as CancelIcon,
//   Assignment as AssignmentIcon,
//   Route as RouteIcon
// } from '@mui/icons-material';
// import axios from 'axios';
// import BASE_URL from '../../../config/Config';

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
//     gray: '#F7F8FA'
//   },
//   border: '#E3E8EF'
// };

// const PRIORITY_OPTIONS = ['Critical', 'High', 'Medium', 'Low'];
// const WO_TYPE_OPTIONS = ['Machining', 'Assembly', 'SubAssembly', 'Kit'];
// const CUSTOMER_TYPE_OPTIONS = ['OEM', 'Distributor', 'Retailer', 'Corporate', 'Individual'];
// const PRIORITY_OPTIONS_CUSTOMER = ['Regular', 'High', 'Low', 'Critical'];
// const INDUSTRY_SEGMENT_OPTIONS = ['Automotive', 'Electronics', 'Pharmaceutical', 'Manufacturing', 'IT', 'FMCG', 'Other'];

// // Item Options
// const itemCategoryOptions = ['Raw Material', 'Semi-Finished', 'Finished Good', 'Consumable', 'Tool', 'Bought-Out', 'Subcontract'];
// const itemTypeOptions = ['Busbar', 'Stamping', 'Gasket', 'Tooling', 'Copper Strip', 'Aluminium Profile', 'Rubber Sheet', 'Cork', 'Other'];
// const unitOptions = ['Nos', 'Kg', 'Meter', 'Set', 'Piece', 'Sheet', 'Roll'];
// const procurementTypeOptions = ['Manufacture', 'Purchase', 'Subcontract', 'Free Issue'];
// const rmTypeOptions = ['Strip', 'Profile', 'Sheet', 'Wire', 'Tube', 'Compound', 'Bar', 'Rod', 'Coil'];

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

// const steps = ['Production Details', 'Planning & Settings'];
// const CUSTOMER_STEPS = ['Basic Information', 'Address & Contacts', 'Financial & Bank', 'Actions'];
// const ITEM_STEPS = ['Basic Info', 'Material & Drawing', 'Process Details', 'Rate & Tax'];
// const BOM_STEPS = ['Basic Info', 'Components', 'Review'];
// const ROUTING_STEPS = ['Basic Info', 'Operations', 'Review'];

// // ============================================
// // INLINE CUSTOMER FORM (Full Stepper)
// // ============================================
// const InlineCustomerForm = ({ onSave, onCancel }) => {
//   const [customerActiveStep, setCustomerActiveStep] = useState(0);
//   const [customerFormLoading, setCustomerFormLoading] = useState(false);
//   const [customerFormError, setCustomerFormError] = useState('');
//   const [customerFormData, setCustomerFormData] = useState({
//     customer_code: '',
//     customer_name: '',
//     customer_type: 'OEM',
//     priority: 'Regular',
//     industry_segment: '',
//     gstin: '',
//     pan: '',
//     address_line1: '',
//     address_line2: '',
//     city: '',
//     state: '',
//     pincode: '',
//     country: 'India',
//     contact_person: '',
//     email: '',
//     phone: '',
//     mobile: '',
//     credit_limit: 0,
//     credit_days: 30,
//     payment_terms: '',
//     bank_name: '',
//     account_number: '',
//     ifsc_code: '',
//     branch_name: '',
//     upi_id: ''
//   });
//   const [customerFormErrors, setCustomerFormErrors] = useState({});

//   const handleCustomerFormChange = (e) => {
//     const { name, value } = e.target;
//     setCustomerFormData(prev => ({ ...prev, [name]: value }));
//     setCustomerFormErrors(prev => ({ ...prev, [name]: '' }));
//   };

//   const validateCustomerStep = (step) => {
//     const errors = {};
//     let isValid = true;

//     switch (step) {
//       case 0:
//         if (!customerFormData.customer_code.trim()) {
//           errors.customer_code = 'Customer code is required';
//           isValid = false;
//         }
//         if (!customerFormData.customer_name.trim()) {
//           errors.customer_name = 'Customer name is required';
//           isValid = false;
//         }
//         if (!customerFormData.customer_type) {
//           errors.customer_type = 'Customer type is required';
//           isValid = false;
//         }
//         if (!customerFormData.priority) {
//           errors.priority = 'Priority is required';
//           isValid = false;
//         }
//         if (!customerFormData.gstin.trim()) {
//           errors.gstin = 'GSTIN is required';
//           isValid = false;
//         } else if (!/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(customerFormData.gstin)) {
//           errors.gstin = 'Invalid GSTIN format';
//           isValid = false;
//         }
//         if (!customerFormData.pan.trim()) {
//           errors.pan = 'PAN is required';
//           isValid = false;
//         } else if (!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(customerFormData.pan)) {
//           errors.pan = 'Invalid PAN format';
//           isValid = false;
//         }
//         break;
//       case 1:
//         if (!customerFormData.address_line1.trim()) {
//           errors.address_line1 = 'Address is required';
//           isValid = false;
//         }
//         if (!customerFormData.city.trim()) {
//           errors.city = 'City is required';
//           isValid = false;
//         }
//         if (!customerFormData.state.trim()) {
//           errors.state = 'State is required';
//           isValid = false;
//         }
//         if (!customerFormData.pincode.trim()) {
//           errors.pincode = 'Pincode is required';
//           isValid = false;
//         }
//         if (!customerFormData.contact_person.trim()) {
//           errors.contact_person = 'Contact person is required';
//           isValid = false;
//         }
//         if (!customerFormData.email.trim()) {
//           errors.email = 'Email is required';
//           isValid = false;
//         } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerFormData.email)) {
//           errors.email = 'Invalid email format';
//           isValid = false;
//         }
//         if (!customerFormData.phone.trim()) {
//           errors.phone = 'Phone is required';
//           isValid = false;
//         }
//         break;
//       case 2:
//         if (customerFormData.credit_limit < 0) {
//           errors.credit_limit = 'Credit limit must be greater than 0';
//           isValid = false;
//         }
//         if (customerFormData.credit_days < 0) {
//           errors.credit_days = 'Credit days must be greater than 0';
//           isValid = false;
//         }
//         break;
//       default:
//         break;
//     }

//     setCustomerFormErrors(errors);
//     return isValid;
//   };

//   const handleCustomerNext = () => {
//     if (validateCustomerStep(customerActiveStep)) {
//       setCustomerActiveStep(prev => prev + 1);
//     }
//   };

//   const handleCustomerBack = () => {
//     setCustomerActiveStep(prev => prev - 1);
//   };

//   const handleCustomerFormSubmit = async () => {
//     if (!validateCustomerStep(customerActiveStep)) return;

//     setCustomerFormLoading(true);
//     setCustomerFormError('');

//     try {
//       const token = localStorage.getItem('token');
//       const response = await axios.post(`${BASE_URL}/api/customers`, customerFormData, {
//         headers: {
//           'Authorization': `Bearer ${token}`,
//           'Content-Type': 'application/json'
//         }
//       });

//       if (response.data.success) {
//         onSave(response.data.data);
//       } else {
//         setCustomerFormError(response.data.message || 'Failed to add customer');
//       }
//     } catch (err) {
//       console.error('Error adding customer:', err);
//       setCustomerFormError(err.response?.data?.message || 'Failed to add customer. Please try again.');
//     } finally {
//       setCustomerFormLoading(false);
//     }
//   };

//   const resetCustomerForm = () => {
//     setCustomerFormData({
//       customer_code: '',
//       customer_name: '',
//       customer_type: 'OEM',
//       priority: 'Regular',
//       industry_segment: '',
//       gstin: '',
//       pan: '',
//       address_line1: '',
//       address_line2: '',
//       city: '',
//       state: '',
//       pincode: '',
//       country: 'India',
//       contact_person: '',
//       email: '',
//       phone: '',
//       mobile: '',
//       credit_limit: 0,
//       credit_days: 30,
//       payment_terms: '',
//       bank_name: '',
//       account_number: '',
//       ifsc_code: '',
//       branch_name: '',
//       upi_id: ''
//     });
//     setCustomerFormErrors({});
//     setCustomerActiveStep(0);
//     setCustomerFormError('');
//   };

//   const handleCancel = () => {
//     resetCustomerForm();
//     onCancel();
//   };

//   const Label = ({ children, required }) => (
//     <Typography sx={{
//       fontSize: '0.7rem',
//       fontWeight: 600,
//       color: COLORS.text.secondary,
//       letterSpacing: '0.5px'
//     }}>
//       {children} {required && <span style={{ color: '#EF4444' }}>*</span>}
//     </Typography>
//   );

//   const textFieldSx = {
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
//     },
//     '& .MuiFormHelperText-root': {
//       fontSize: '0.65rem',
//       marginLeft: 0,
//       marginTop: 0.25
//     }
//   };

//   const selectSx = {
//     borderRadius: 1.5,
//     fontSize: '0.75rem',
//     '& .MuiSelect-select': { py: 1, px: 1.5, fontSize: '0.75rem' }
//   };

//   const renderCustomerStepContent = (step) => {
//     switch (step) {
//       case 0:
//         return (
//           <Grid container spacing={2}>
//             <Grid size={{ xs: 12, sm: 6 }}>
//               <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//                 <Label required>CUSTOMER CODE</Label>
//                 <TextField
//                   fullWidth size="small" name="customer_code"
//                   value={customerFormData.customer_code}
//                   onChange={handleCustomerFormChange}
//                   placeholder="e.g., SIEMENS001"
//                   error={!!customerFormErrors.customer_code}
//                   helperText={customerFormErrors.customer_code}
//                   sx={textFieldSx}
//                   disabled={customerFormLoading}
//                 />
//               </Box>
//             </Grid>
//             <Grid size={{ xs: 12, sm: 6 }}>
//               <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//                 <Label required>CUSTOMER NAME</Label>
//                 <TextField
//                   fullWidth size="small" name="customer_name"
//                   value={customerFormData.customer_name}
//                   onChange={handleCustomerFormChange}
//                   placeholder="e.g., Siemens India Ltd"
//                   error={!!customerFormErrors.customer_name}
//                   helperText={customerFormErrors.customer_name}
//                   sx={textFieldSx}
//                   disabled={customerFormLoading}
//                 />
//               </Box>
//             </Grid>
//             <Grid size={{ xs: 12, sm: 6 }}>
//               <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//                 <Label required>CUSTOMER TYPE</Label>
//                 <FormControl fullWidth size="small" error={!!customerFormErrors.customer_type}>
//                   <Select
//                     name="customer_type"
//                     value={customerFormData.customer_type}
//                     onChange={handleCustomerFormChange}
//                     disabled={customerFormLoading}
//                     sx={selectSx}
//                   >
//                     {CUSTOMER_TYPE_OPTIONS.map(option => (
//                       <MenuItem key={option} value={option} sx={{ fontSize: '0.75rem' }}>{option}</MenuItem>
//                     ))}
//                   </Select>
//                 </FormControl>
//               </Box>
//             </Grid>
//             <Grid size={{ xs: 12, sm: 6 }}>
//               <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//                 <Label required>PRIORITY</Label>
//                 <FormControl fullWidth size="small" error={!!customerFormErrors.priority}>
//                   <Select
//                     name="priority"
//                     value={customerFormData.priority}
//                     onChange={handleCustomerFormChange}
//                     disabled={customerFormLoading}
//                     sx={selectSx}
//                   >
//                     {PRIORITY_OPTIONS_CUSTOMER.map(option => (
//                       <MenuItem key={option} value={option} sx={{ fontSize: '0.75rem' }}>{option}</MenuItem>
//                     ))}
//                   </Select>
//                 </FormControl>
//               </Box>
//             </Grid>
//             <Grid size={{ xs: 12, sm: 6 }}>
//               <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//                 <Label>INDUSTRY SEGMENT</Label>
//                 <FormControl fullWidth size="small">
//                   <Select
//                     name="industry_segment"
//                     value={customerFormData.industry_segment}
//                     onChange={handleCustomerFormChange}
//                     disabled={customerFormLoading}
//                     sx={selectSx}
//                   >
//                     <MenuItem value="" sx={{ fontSize: '0.75rem' }}>Select industry</MenuItem>
//                     {INDUSTRY_SEGMENT_OPTIONS.map(option => (
//                       <MenuItem key={option} value={option} sx={{ fontSize: '0.75rem' }}>{option}</MenuItem>
//                     ))}
//                   </Select>
//                 </FormControl>
//               </Box>
//             </Grid>
//             <Grid size={{ xs: 12, sm: 6 }}>
//               <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//                 <Label required>GSTIN</Label>
//                 <TextField
//                   fullWidth size="small" name="gstin"
//                   value={customerFormData.gstin}
//                   onChange={handleCustomerFormChange}
//                   placeholder="e.g., 27AAECS7112G1Z5"
//                   error={!!customerFormErrors.gstin}
//                   helperText={customerFormErrors.gstin}
//                   sx={textFieldSx}
//                   disabled={customerFormLoading}
//                   inputProps={{ style: { textTransform: 'uppercase' } }}
//                 />
//               </Box>
//             </Grid>
//             <Grid size={{ xs: 12, sm: 6 }}>
//               <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//                 <Label required>PAN</Label>
//                 <TextField
//                   fullWidth size="small" name="pan"
//                   value={customerFormData.pan}
//                   onChange={handleCustomerFormChange}
//                   placeholder="e.g., AAECS7112G"
//                   error={!!customerFormErrors.pan}
//                   helperText={customerFormErrors.pan}
//                   sx={textFieldSx}
//                   disabled={customerFormLoading}
//                   inputProps={{ style: { textTransform: 'uppercase' } }}
//                 />
//               </Box>
//             </Grid>
//           </Grid>
//         );
//       case 1:
//         return (
//           <Grid container spacing={2}>
//             <Grid size={{ xs: 12 }}>
//               <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//                 <Label required>ADDRESS LINE 1</Label>
//                 <TextField
//                   fullWidth size="small" name="address_line1"
//                   value={customerFormData.address_line1}
//                   onChange={handleCustomerFormChange}
//                   placeholder="e.g., 123, Main Street"
//                   error={!!customerFormErrors.address_line1}
//                   helperText={customerFormErrors.address_line1}
//                   sx={textFieldSx}
//                   disabled={customerFormLoading}
//                 />
//               </Box>
//             </Grid>
//             <Grid size={{ xs: 12 }}>
//               <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//                 <Label>ADDRESS LINE 2</Label>
//                 <TextField
//                   fullWidth size="small" name="address_line2"
//                   value={customerFormData.address_line2}
//                   onChange={handleCustomerFormChange}
//                   placeholder="e.g., Near City Center"
//                   sx={textFieldSx}
//                   disabled={customerFormLoading}
//                 />
//               </Box>
//             </Grid>
//             <Grid size={{ xs: 12, sm: 4 }}>
//               <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//                 <Label required>CITY</Label>
//                 <TextField
//                   fullWidth size="small" name="city"
//                   value={customerFormData.city}
//                   onChange={handleCustomerFormChange}
//                   error={!!customerFormErrors.city}
//                   helperText={customerFormErrors.city}
//                   sx={textFieldSx}
//                   disabled={customerFormLoading}
//                 />
//               </Box>
//             </Grid>
//             <Grid size={{ xs: 12, sm: 4 }}>
//               <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//                 <Label required>STATE</Label>
//                 <TextField
//                   fullWidth size="small" name="state"
//                   value={customerFormData.state}
//                   onChange={handleCustomerFormChange}
//                   error={!!customerFormErrors.state}
//                   helperText={customerFormErrors.state}
//                   sx={textFieldSx}
//                   disabled={customerFormLoading}
//                 />
//               </Box>
//             </Grid>
//             <Grid size={{ xs: 12, sm: 4 }}>
//               <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//                 <Label required>PINCODE</Label>
//                 <TextField
//                   fullWidth size="small" name="pincode"
//                   value={customerFormData.pincode}
//                   onChange={handleCustomerFormChange}
//                   error={!!customerFormErrors.pincode}
//                   helperText={customerFormErrors.pincode}
//                   sx={textFieldSx}
//                   disabled={customerFormLoading}
//                 />
//               </Box>
//             </Grid>
//             <Grid size={{ xs: 12, sm: 6 }}>
//               <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//                 <Label required>CONTACT PERSON</Label>
//                 <TextField
//                   fullWidth size="small" name="contact_person"
//                   value={customerFormData.contact_person}
//                   onChange={handleCustomerFormChange}
//                   error={!!customerFormErrors.contact_person}
//                   helperText={customerFormErrors.contact_person}
//                   sx={textFieldSx}
//                   disabled={customerFormLoading}
//                 />
//               </Box>
//             </Grid>
//             <Grid size={{ xs: 12, sm: 6 }}>
//               <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//                 <Label required>EMAIL</Label>
//                 <TextField
//                   fullWidth size="small" name="email" type="email"
//                   value={customerFormData.email}
//                   onChange={handleCustomerFormChange}
//                   error={!!customerFormErrors.email}
//                   helperText={customerFormErrors.email}
//                   sx={textFieldSx}
//                   disabled={customerFormLoading}
//                 />
//               </Box>
//             </Grid>
//             <Grid size={{ xs: 12, sm: 6 }}>
//               <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//                 <Label required>PHONE</Label>
//                 <TextField
//                   fullWidth size="small" name="phone"
//                   value={customerFormData.phone}
//                   onChange={handleCustomerFormChange}
//                   error={!!customerFormErrors.phone}
//                   helperText={customerFormErrors.phone}
//                   sx={textFieldSx}
//                   disabled={customerFormLoading}
//                 />
//               </Box>
//             </Grid>
//             <Grid size={{ xs: 12, sm: 6 }}>
//               <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//                 <Label>MOBILE</Label>
//                 <TextField
//                   fullWidth size="small" name="mobile"
//                   value={customerFormData.mobile}
//                   onChange={handleCustomerFormChange}
//                   sx={textFieldSx}
//                   disabled={customerFormLoading}
//                 />
//               </Box>
//             </Grid>
//           </Grid>
//         );
//       case 2:
//         return (
//           <Grid container spacing={2}>
//             <Grid size={{ xs: 12, sm: 6 }}>
//               <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//                 <Label>CREDIT LIMIT</Label>
//                 <TextField
//                   fullWidth type="number" size="small" name="credit_limit"
//                   value={customerFormData.credit_limit}
//                   onChange={handleCustomerFormChange}
//                   error={!!customerFormErrors.credit_limit}
//                   helperText={customerFormErrors.credit_limit}
//                   InputProps={{
//                     startAdornment: (
//                       <InputAdornment position="start" sx={{ fontSize: '0.75rem' }}>₹</InputAdornment>
//                     ),
//                   }}
//                   sx={textFieldSx}
//                   disabled={customerFormLoading}
//                   inputProps={{ step: '0.01', min: 0 }}
//                 />
//               </Box>
//             </Grid>
//             <Grid size={{ xs: 12, sm: 6 }}>
//               <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//                 <Label>CREDIT DAYS</Label>
//                 <TextField
//                   fullWidth type="number" size="small" name="credit_days"
//                   value={customerFormData.credit_days}
//                   onChange={handleCustomerFormChange}
//                   error={!!customerFormErrors.credit_days}
//                   helperText={customerFormErrors.credit_days}
//                   InputProps={{
//                     endAdornment: (
//                       <InputAdornment position="end" sx={{ fontSize: '0.75rem' }}>Days</InputAdornment>
//                     ),
//                   }}
//                   sx={textFieldSx}
//                   disabled={customerFormLoading}
//                   inputProps={{ step: '1', min: 0 }}
//                 />
//               </Box>
//             </Grid>
//             <Grid size={{ xs: 12 }}>
//               <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//                 <Label>PAYMENT TERMS</Label>
//                 <TextField
//                   fullWidth size="small" name="payment_terms"
//                   value={customerFormData.payment_terms}
//                   onChange={handleCustomerFormChange}
//                   placeholder="e.g., Net 30, 50% Advance"
//                   sx={textFieldSx}
//                   disabled={customerFormLoading}
//                 />
//               </Box>
//             </Grid>
//             <Grid size={{ xs: 12, sm: 6 }}>
//               <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//                 <Label>BANK NAME</Label>
//                 <TextField
//                   fullWidth size="small" name="bank_name"
//                   value={customerFormData.bank_name}
//                   onChange={handleCustomerFormChange}
//                   sx={textFieldSx}
//                   disabled={customerFormLoading}
//                 />
//               </Box>
//             </Grid>
//             <Grid size={{ xs: 12, sm: 6 }}>
//               <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//                 <Label>ACCOUNT NUMBER</Label>
//                 <TextField
//                   fullWidth size="small" name="account_number"
//                   value={customerFormData.account_number}
//                   onChange={handleCustomerFormChange}
//                   sx={textFieldSx}
//                   disabled={customerFormLoading}
//                 />
//               </Box>
//             </Grid>
//             <Grid size={{ xs: 12, sm: 6 }}>
//               <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//                 <Label>IFSC CODE</Label>
//                 <TextField
//                   fullWidth size="small" name="ifsc_code"
//                   value={customerFormData.ifsc_code}
//                   onChange={handleCustomerFormChange}
//                   placeholder="e.g., SBIN0001234"
//                   sx={textFieldSx}
//                   disabled={customerFormLoading}
//                   inputProps={{ style: { textTransform: 'uppercase' } }}
//                 />
//               </Box>
//             </Grid>
//             <Grid size={{ xs: 12, sm: 6 }}>
//               <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//                 <Label>BRANCH NAME</Label>
//                 <TextField
//                   fullWidth size="small" name="branch_name"
//                   value={customerFormData.branch_name}
//                   onChange={handleCustomerFormChange}
//                   sx={textFieldSx}
//                   disabled={customerFormLoading}
//                 />
//               </Box>
//             </Grid>
//             <Grid size={{ xs: 12, sm: 6 }}>
//               <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//                 <Label>UPI ID</Label>
//                 <TextField
//                   fullWidth size="small" name="upi_id"
//                   value={customerFormData.upi_id}
//                   onChange={handleCustomerFormChange}
//                   placeholder="e.g., customer@bank"
//                   sx={textFieldSx}
//                   disabled={customerFormLoading}
//                 />
//               </Box>
//             </Grid>
//           </Grid>
//         );
//       case 3:
//         return (
//           <Box sx={{ py: 2, textAlign: 'center' }}>
//             <Typography variant="h6" sx={{ fontWeight: 600, color: COLORS.text.primary }}>
//               Ready to Save!
//             </Typography>
//             <Typography sx={{ fontSize: '0.8rem', color: COLORS.text.secondary, mt: 1 }}>
//               Please review the customer information before saving.
//             </Typography>
//           </Box>
//         );
//       default:
//         return null;
//     }
//   };

//   return (
//     <Paper sx={{ mt: 2, p: 2, bgcolor: COLORS.background.light, borderRadius: 2, border: `2px solid ${COLORS.primary}` }}>
//       <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
//         <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color: COLORS.primary }}>
//           <PersonAddIcon sx={{ fontSize: '1rem', mr: 1, verticalAlign: 'middle' }} />
//           Add New Customer
//         </Typography>
//         <IconButton size="small" onClick={handleCancel} sx={{ color: COLORS.text.tertiary, '&:hover': { color: COLORS.primary } }} disabled={customerFormLoading}>
//           <CloseIcon sx={{ fontSize: '1rem' }} />
//         </IconButton>
//       </Box>

//       <Stepper activeStep={customerActiveStep} sx={{ mb: 3 }} connector={<ColorConnector />}>
//         {CUSTOMER_STEPS.map((label, index) => (
//           <Step key={label}>
//             <StepLabel>
//               <Typography sx={{ fontSize: '0.65rem', fontWeight: 500 }}>{index + 1}. {label}</Typography>
//             </StepLabel>
//           </Step>
//         ))}
//       </Stepper>

//       {renderCustomerStepContent(customerActiveStep)}

//       {customerFormError && (
//         <Alert severity="error" sx={{ mt: 2, borderRadius: 1.5, fontSize: '0.75rem', py: 0.5 }}>
//           {customerFormError}
//         </Alert>
//       )}

//       <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
//         <Button
//           onClick={handleCustomerBack}
//           disabled={customerActiveStep === 0 || customerFormLoading}
//           size="small"
//           startIcon={<NavigateBeforeIcon sx={{ fontSize: '1rem' }} />}
//           sx={{
//             height: 32, px: 2, borderRadius: 1.5,
//             border: `1px solid ${COLORS.border}`,
//             color: COLORS.text.secondary,
//             fontSize: '0.7rem', fontWeight: 500, textTransform: 'none',
//             '&:hover': { borderColor: COLORS.primary, bgcolor: `${COLORS.primary}10` }
//           }}
//         >
//           Back
//         </Button>
//         <Box sx={{ display: 'flex', gap: 1 }}>
//           <Button
//             onClick={handleCancel}
//             disabled={customerFormLoading}
//             size="small"
//             sx={{
//               height: 32, px: 2, borderRadius: 1.5,
//               border: `1px solid ${COLORS.border}`,
//               color: COLORS.text.secondary,
//               fontSize: '0.7rem', fontWeight: 500, textTransform: 'none',
//               '&:hover': { borderColor: COLORS.primary, bgcolor: `${COLORS.primary}10` }
//             }}
//           >
//             Cancel
//           </Button>
//           {customerActiveStep === CUSTOMER_STEPS.length - 1 ? (
//             <Button
//               variant="contained"
//               onClick={handleCustomerFormSubmit}
//               disabled={customerFormLoading}
//               size="small"
//               startIcon={customerFormLoading ? <CircularProgress size={16} color="inherit" /> : <SaveIcon sx={{ fontSize: '1rem' }} />}
//               sx={{
//                 height: 32, px: 2, borderRadius: 1.5,
//                 bgcolor: COLORS.primary,
//                 fontSize: '0.7rem', fontWeight: 500, textTransform: 'none',
//                 '&:hover': { bgcolor: COLORS.primaryDark }
//               }}
//             >
//               {customerFormLoading ? 'Saving...' : 'Save Customer'}
//             </Button>
//           ) : (
//             <Button
//               variant="contained"
//               onClick={handleCustomerNext}
//               disabled={customerFormLoading}
//               size="small"
//               endIcon={<NavigateNextIcon sx={{ fontSize: '1rem' }} />}
//               sx={{
//                 height: 32, px: 2, borderRadius: 1.5,
//                 bgcolor: COLORS.primary,
//                 fontSize: '0.7rem', fontWeight: 500, textTransform: 'none',
//                 '&:hover': { bgcolor: COLORS.primaryDark }
//               }}
//             >
//               Next
//             </Button>
//           )}
//         </Box>
//       </Box>
//     </Paper>
//   );
// };

// // ============================================
// // INLINE ITEM FORM (Full 4-Step Stepper - matching AddDimensions)
// // ============================================
// const InlineItemForm = ({ onSave, onCancel }) => {
//   const [itemStepper, setItemStepper] = useState(0);
//   const [itemFormLoading, setItemFormLoading] = useState(false);
//   const [itemFormError, setItemFormError] = useState('');
//   const [itemFormData, setItemFormData] = useState({
//     part_no: '',
//     part_name: '',
//     part_description: '',
//     item_category: '',
//     item_type: '',
//     sale_unit: '',
//     weight_per_unit_kg: '',
//     material_code: '',
//     material_name: '',
//     material_grade: '',
//     material_standard: '',
//     material_color: '',
//     density: '',
//     unit: '',
//     rm_source: '',
//     rm_type: '',
//     rm_spec: '',
//     drawing_no: '',
//     revision_no: '',
//     thickness: '',
//     width: '',
//     length: '',
//     strip_size: '',
//     pitch: '',
//     no_of_cavity: 1,
//     rm_rejection_percent: '',
//     scrap_realisation_percent: '',
//     hsn_code: '',
//     gst_percentage: '',
//     procurement_type: '',
//     reorder_level: '',
//     reorder_qty: '',
//     lead_time_days: '',
//     safety_stock: '',
//     min_stock: '',
//     max_stock: '',
//     shelf_life_days: ''
//   });
//   const [itemFieldErrors, setItemFieldErrors] = useState({});
//   const [itemTouched, setItemTouched] = useState({});

//   const handleItemFormChange = (e) => {
//     const { name, value } = e.target;
//     setItemFieldErrors(prev => ({ ...prev, [name]: '' }));

//     const numericFields = [
//       'density', 'weight_per_unit_kg', 'thickness', 'width', 'length',
//       'strip_size', 'pitch', 'no_of_cavity', 'rm_rejection_percent',
//       'scrap_realisation_percent', 'gst_percentage', 'reorder_level',
//       'reorder_qty', 'lead_time_days', 'safety_stock', 'min_stock',
//       'max_stock', 'shelf_life_days'
//     ];
//     if (numericFields.includes(name)) {
//       if (value === '' || /^\d*\.?\d*$/.test(value)) {
//         setItemFormData(prev => ({ ...prev, [name]: value }));
//       }
//     } else {
//       setItemFormData(prev => ({ ...prev, [name]: value }));
//     }

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

//   const handleSelectChange = (e) => {
//     const { name, value } = e.target;
//     setItemFieldErrors(prev => ({ ...prev, [name]: '' }));
//     setItemFormData(prev => ({ ...prev, [name]: value }));
//     if (itemTouched[name] || value) {
//       const errorMessage = validateItemField(name, value);
//       setItemFieldErrors(prev => ({ ...prev, [name]: errorMessage }));
//     }
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
//       case 'material_name':
//         if (!value?.trim()) return 'Material name is required';
//         if (value.length > 100) return 'Material name should not exceed 100 characters';
//         return '';
//       case 'material_grade':
//         if (!value?.trim()) return 'Material grade is required';
//         return '';
//       case 'density':
//         if (!value) return 'Density is required';
//         if (isNaN(value) || value <= 0) return 'Density must be a positive number';
//         if (value > 25) return 'Density cannot exceed 25 g/cm³';
//         return '';
//       case 'unit':
//         if (!value) return 'Unit is required';
//         return '';
//       case 'sale_unit':
//         if (!value) return 'Sale unit is required';
//         return '';
//       case 'hsn_code':
//         if (!value?.trim()) return 'HSN code is required';
//         return '';
//       case 'gst_percentage':
//         if (value && (isNaN(value) || value < 0 || value > 100)) return 'GST percentage must be between 0 and 100';
//         return '';
//       case 'thickness':
//         if (value && (isNaN(value) || value < 0)) return 'Thickness must be a positive number';
//         return '';
//       case 'width':
//         if (value && (isNaN(value) || value < 0)) return 'Width must be a positive number';
//         return '';
//       case 'length':
//         if (value && (isNaN(value) || value < 0)) return 'Length must be a positive number';
//         return '';
//       case 'weight_per_unit_kg':
//         if (value && (isNaN(value) || value <= 0)) return 'Weight per unit must be a positive number';
//         return '';
//       case 'procurement_type':
//         if (!value) return 'Procurement type is required';
//         return '';
//       default:
//         return '';
//     }
//   };

//   const validateItemStep = (step) => {
//     const errors = {};
//     let isValid = true;
//     const data = itemFormData;

//     switch (step) {
//       case 0:
//         if (!data.part_no?.trim()) { errors.part_no = 'Part number is required'; isValid = false; }
//         if (!data.part_name?.trim()) { errors.part_name = 'Part name is required'; isValid = false; }
//         if (!data.part_description?.trim()) { errors.part_description = 'Part description is required'; isValid = false; }
//         if (!data.item_category) { errors.item_category = 'Item category is required'; isValid = false; }
//         if (!data.sale_unit) { errors.sale_unit = 'Sale unit is required'; isValid = false; }
//         if (data.sale_unit !== 'Kg' && !data.weight_per_unit_kg) {
//           errors.weight_per_unit_kg = 'Weight per unit is required when sale unit is not Kg';
//           isValid = false;
//         }
//         break;
//       case 1:
//         if (!data.material_name?.trim()) { errors.material_name = 'Material name is required'; isValid = false; }
//         if (!data.material_grade?.trim()) { errors.material_grade = 'Material grade is required'; isValid = false; }
//         if (!data.density) { errors.density = 'Density is required'; isValid = false; }
//         if (!data.unit) { errors.unit = 'Unit is required'; isValid = false; }
//         if (!data.hsn_code?.trim()) { errors.hsn_code = 'HSN code is required'; isValid = false; }
//         if (!data.procurement_type) { errors.procurement_type = 'Procurement type is required'; isValid = false; }
//         break;
//       case 2:
//         if (data.thickness && isNaN(data.thickness)) { errors.thickness = 'Thickness must be a number'; isValid = false; }
//         if (data.width && isNaN(data.width)) { errors.width = 'Width must be a number'; isValid = false; }
//         if (data.length && isNaN(data.length)) { errors.length = 'Length must be a number'; isValid = false; }
//         if (data.rm_rejection_percent && (isNaN(data.rm_rejection_percent) || data.rm_rejection_percent < 0 || data.rm_rejection_percent > 100)) {
//           errors.rm_rejection_percent = 'RM rejection must be between 0 and 100';
//           isValid = false;
//         }
//         if (data.scrap_realisation_percent && (isNaN(data.scrap_realisation_percent) || data.scrap_realisation_percent < 0 || data.scrap_realisation_percent > 100)) {
//           errors.scrap_realisation_percent = 'Scrap realisation must be between 0 and 100';
//           isValid = false;
//         }
//         break;
//       case 3:
//         if (data.gst_percentage && (isNaN(data.gst_percentage) || data.gst_percentage < 0 || data.gst_percentage > 100)) {
//           errors.gst_percentage = 'GST percentage must be between 0 and 100';
//           isValid = false;
//         }
//         break;
//       default:
//         return true;
//     }

//     setItemFieldErrors(errors);
//     if (!isValid) {
//       setItemFormError('Please fix the errors in this section');
//     }
//     return isValid;
//   };

//   const validateAllItemFields = () => {
//     let valid = true;
//     for (let i = 0; i < 4; i++) {
//       if (!validateItemStep(i)) {
//         valid = false;
//         setItemStepper(i);
//         break;
//       }
//     }
//     return valid;
//   };

//   const handleItemNext = () => {
//     if (validateItemStep(itemStepper)) {
//       setItemFormError('');
//       setItemStepper(prev => prev + 1);
//     }
//   };

//   const handleItemBack = () => {
//     setItemFormError('');
//     setItemStepper(prev => prev - 1);
//   };

//   const handleItemSubmit = async () => {
//     if (!validateAllItemFields()) return;

//     setItemFormLoading(true);
//     setItemFormError('');

//     try {
//       const token = localStorage.getItem('token');

//       const payload = {
//         part_no: itemFormData.part_no,
//         part_name: itemFormData.part_name,
//         part_description: itemFormData.part_description,
//         item_category: itemFormData.item_category,
//         item_type: itemFormData.item_type || 'Other',
//         sale_unit: itemFormData.sale_unit,
//         weight_per_unit_kg: itemFormData.weight_per_unit_kg ? parseFloat(itemFormData.weight_per_unit_kg) : undefined,
//         material_code: itemFormData.material_code || undefined,
//         material_name: itemFormData.material_name,
//         material_grade: itemFormData.material_grade,
//         material_standard: itemFormData.material_standard || undefined,
//         material_color: itemFormData.material_color || undefined,
//         density: parseFloat(itemFormData.density),
//         unit: itemFormData.unit,
//         rm_source: itemFormData.rm_source || undefined,
//         rm_type: itemFormData.rm_type || undefined,
//         rm_spec: itemFormData.rm_spec || undefined,
//         drawing_no: itemFormData.drawing_no || undefined,
//         revision_no: itemFormData.revision_no || '0',
//         thickness: itemFormData.thickness ? parseFloat(itemFormData.thickness) : undefined,
//         width: itemFormData.width ? parseFloat(itemFormData.width) : undefined,
//         length: itemFormData.length ? parseFloat(itemFormData.length) : undefined,
//         strip_size: itemFormData.strip_size ? parseFloat(itemFormData.strip_size) : undefined,
//         pitch: itemFormData.pitch ? parseFloat(itemFormData.pitch) : undefined,
//         no_of_cavity: itemFormData.no_of_cavity ? parseInt(itemFormData.no_of_cavity) : 1,
//         rm_rejection_percent: itemFormData.rm_rejection_percent ? parseFloat(itemFormData.rm_rejection_percent) : 2.0,
//         scrap_realisation_percent: itemFormData.scrap_realisation_percent ? parseFloat(itemFormData.scrap_realisation_percent) : 85,
//         hsn_code: itemFormData.hsn_code,
//         gst_percentage: itemFormData.gst_percentage ? parseFloat(itemFormData.gst_percentage) : 18,
//         procurement_type: itemFormData.procurement_type || 'Manufacture',
//         reorder_level: itemFormData.reorder_level ? parseInt(itemFormData.reorder_level) : undefined,
//         reorder_qty: itemFormData.reorder_qty ? parseInt(itemFormData.reorder_qty) : undefined,
//         lead_time_days: itemFormData.lead_time_days ? parseInt(itemFormData.lead_time_days) : undefined,
//         safety_stock: itemFormData.safety_stock ? parseInt(itemFormData.safety_stock) : undefined,
//         min_stock: itemFormData.min_stock ? parseInt(itemFormData.min_stock) : undefined,
//         max_stock: itemFormData.max_stock ? parseInt(itemFormData.max_stock) : undefined,
//         shelf_life_days: itemFormData.shelf_life_days ? parseInt(itemFormData.shelf_life_days) : undefined,
//         item_role: 'component'
//       };

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
//         onSave(response.data.data);
//       } else {
//         setItemFormError(response.data.message || 'Failed to add item');
//       }
//     } catch (err) {
//       console.error('Error adding item:', err);
//       setItemFormError(err.response?.data?.message || 'Failed to add item. Please try again.');
//     } finally {
//       setItemFormLoading(false);
//     }
//   };

//   const resetItemForm = () => {
//     setItemFormData({
//       part_no: '', part_name: '', part_description: '', item_category: '', item_type: '',
//       sale_unit: '', weight_per_unit_kg: '', material_code: '', material_name: '',
//       material_grade: '', material_standard: '', material_color: '', density: '', unit: '',
//       rm_source: '', rm_type: '', rm_spec: '', drawing_no: '', revision_no: '',
//       thickness: '', width: '', length: '', strip_size: '', pitch: '',
//       no_of_cavity: 1, rm_rejection_percent: '', scrap_realisation_percent: '',
//       hsn_code: '', gst_percentage: '', procurement_type: '',
//       reorder_level: '', reorder_qty: '', lead_time_days: '',
//       safety_stock: '', min_stock: '', max_stock: '', shelf_life_days: ''
//     });
//     setItemFieldErrors({});
//     setItemTouched({});
//     setItemFormError('');
//     setItemStepper(0);
//   };

//   const handleCancel = () => {
//     resetItemForm();
//     onCancel();
//   };

//   const Label = ({ children, required }) => (
//     <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary, letterSpacing: '0.5px' }}>
//       {children} {required && <span style={{ color: '#EF4444' }}>*</span>}
//     </Typography>
//   );

//   const textFieldSx = {
//     '& .MuiOutlinedInput-root': {
//       borderRadius: 1.5, fontSize: '0.75rem',
//       '&:hover fieldset': { borderColor: COLORS.primary },
//       '&.Mui-focused fieldset': { borderColor: COLORS.primary, borderWidth: 1 }
//     },
//     '& .MuiInputBase-input': {
//       py: 1, px: 1.5, fontSize: '0.75rem', color: COLORS.text.primary,
//       '&::placeholder': { color: COLORS.text.tertiary, fontSize: '0.75rem' }
//     },
//     '& .MuiFormHelperText-root': { fontSize: '0.65rem', marginLeft: 0, marginTop: 0.25 }
//   };

//   const numberFieldSx = {
//     ...textFieldSx,
//     '& input[type=number]': { MozAppearance: 'textfield' },
//     '& input[type=number]::-webkit-outer-spin-button, & input[type=number]::-webkit-inner-spin-button': {
//       WebkitAppearance: 'none', margin: 0
//     }
//   };

//   const selectSx = {
//     borderRadius: 1.5, fontSize: '0.75rem',
//     '& .MuiSelect-select': { py: 1, px: 1.5, fontSize: '0.75rem' }
//   };

//   const renderItemStepContent = (step) => {
//     const data = itemFormData;
//     const errors = itemFieldErrors;
//     const handleChange = handleItemFormChange;
//     const handleBlur = handleItemBlur;
//     const handleSelect = handleSelectChange;

//     switch (step) {
//       case 0:
//         return (
//           <Grid container spacing={1.5}>
//             <Grid size={{ xs: 12, sm: 6 }}>
//               <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//                 <Label required>PART NUMBER</Label>
//                 <TextField fullWidth size="small" name="part_no"
//                   value={data.part_no} onChange={handleChange} onBlur={handleBlur}
//                   placeholder="e.g., BR-001" error={!!errors.part_no} helperText={errors.part_no}
//                   sx={textFieldSx} disabled={itemFormLoading} inputProps={{ maxLength: 50 }}
//                 />
//               </Box>
//             </Grid>
//             <Grid size={{ xs: 12, sm: 6 }}>
//               <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//                 <Label required>PART NAME</Label>
//                 <TextField fullWidth size="small" name="part_name"
//                   value={data.part_name} onChange={handleChange} onBlur={handleBlur}
//                   placeholder="e.g., Copper Busbar 100x10mm" error={!!errors.part_name} helperText={errors.part_name}
//                   sx={textFieldSx} disabled={itemFormLoading} inputProps={{ maxLength: 100 }}
//                 />
//               </Box>
//             </Grid>
//             <Grid size={{ xs: 12, sm: 4 }}>
//               <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//                 <Label required>ITEM CATEGORY</Label>
//                 <FormControl fullWidth size="small" error={!!errors.item_category}>
//                   <Select name="item_category" value={data.item_category} onChange={handleSelect} onBlur={handleBlur}
//                     displayEmpty disabled={itemFormLoading} sx={selectSx}>
//                     <MenuItem value="" disabled sx={{ fontSize: '0.75rem', color: COLORS.text.tertiary }}>Select category</MenuItem>
//                     {itemCategoryOptions.map(opt => (
//                       <MenuItem key={opt} value={opt} sx={{ fontSize: '0.75rem' }}>{opt}</MenuItem>
//                     ))}
//                   </Select>
//                   {errors.item_category && <Typography sx={{ fontSize: '0.65rem', color: '#EF4444', mt: 0.25 }}>{errors.item_category}</Typography>}
//                 </FormControl>
//               </Box>
//             </Grid>
//             <Grid size={{ xs: 12, sm: 4 }}>
//               <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//                 <Label>ITEM TYPE</Label>
//                 <FormControl fullWidth size="small">
//                   <Select name="item_type" value={data.item_type} onChange={handleSelect} onBlur={handleBlur}
//                     displayEmpty disabled={itemFormLoading} sx={selectSx}>
//                     <MenuItem value="" disabled sx={{ fontSize: '0.75rem' }}>Select type</MenuItem>
//                     {itemTypeOptions.map(opt => (
//                       <MenuItem key={opt} value={opt} sx={{ fontSize: '0.75rem' }}>{opt}</MenuItem>
//                     ))}
//                   </Select>
//                 </FormControl>
//               </Box>
//             </Grid>
//             <Grid size={{ xs: 12, sm: 4 }}>
//               <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//                 <Label required>SALE UNIT</Label>
//                 <FormControl fullWidth size="small" error={!!errors.sale_unit}>
//                   <Select name="sale_unit" value={data.sale_unit} onChange={handleSelect} onBlur={handleBlur}
//                     displayEmpty disabled={itemFormLoading} sx={selectSx}>
//                     <MenuItem value="" disabled sx={{ fontSize: '0.75rem' }}>Select sale unit</MenuItem>
//                     {unitOptions.map(opt => (
//                       <MenuItem key={opt} value={opt} sx={{ fontSize: '0.75rem' }}>{opt}</MenuItem>
//                     ))}
//                   </Select>
//                   {errors.sale_unit && <Typography sx={{ fontSize: '0.65rem', color: '#EF4444', mt: 0.25 }}>{errors.sale_unit}</Typography>}
//                 </FormControl>
//               </Box>
//             </Grid>
//             <Grid size={{ xs: 12, sm: 4 }}>
//               <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//                 <Label>WEIGHT PER UNIT (kg)</Label>
//                 <TextField fullWidth size="small" name="weight_per_unit_kg" type="number"
//                   value={data.weight_per_unit_kg} onChange={handleChange} onBlur={handleBlur}
//                   placeholder="e.g., 0.85" error={!!errors.weight_per_unit_kg} helperText={errors.weight_per_unit_kg}
//                   sx={numberFieldSx} disabled={itemFormLoading} inputProps={{ step: '0.001', min: 0 }}
//                 />
//               </Box>
//             </Grid>
//             <Grid size={{ xs: 12 }}>
//               <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//                 <Label required>PART DESCRIPTION</Label>
//                 <TextField fullWidth size="small" name="part_description" multiline rows={2}
//                   value={data.part_description} onChange={handleChange} onBlur={handleBlur}
//                   placeholder="Enter detailed part description" error={!!errors.part_description} helperText={errors.part_description}
//                   sx={textFieldSx} disabled={itemFormLoading} inputProps={{ maxLength: 200 }}
//                 />
//               </Box>
//             </Grid>
//           </Grid>
//         );
//       case 1:
//         return (
//           <Grid container spacing={1.5}>
//             <Grid size={{ xs: 12, sm: 4 }}>
//               <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//                 <Label required>MATERIAL NAME</Label>
//                 <TextField fullWidth size="small" name="material_name"
//                   value={data.material_name} onChange={handleChange} onBlur={handleBlur}
//                   placeholder="e.g., Copper" error={!!errors.material_name} helperText={errors.material_name}
//                   sx={textFieldSx} disabled={itemFormLoading} inputProps={{ maxLength: 100 }}
//                 />
//               </Box>
//             </Grid>
//             <Grid size={{ xs: 12, sm: 4 }}>
//               <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//                 <Label>MATERIAL CODE</Label>
//                 <TextField fullWidth size="small" name="material_code"
//                   value={data.material_code} onChange={handleChange} onBlur={handleBlur}
//                   placeholder="e.g., CU-001" sx={textFieldSx} disabled={itemFormLoading} inputProps={{ maxLength: 50 }}
//                 />
//               </Box>
//             </Grid>
//             <Grid size={{ xs: 12, sm: 4 }}>
//               <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//                 <Label required>MATERIAL GRADE</Label>
//                 <TextField fullWidth size="small" name="material_grade"
//                   value={data.material_grade} onChange={handleChange} onBlur={handleBlur}
//                   placeholder="e.g., C11000" error={!!errors.material_grade} helperText={errors.material_grade}
//                   sx={textFieldSx} disabled={itemFormLoading}
//                 />
//               </Box>
//             </Grid>
//             <Grid size={{ xs: 12, sm: 4 }}>
//               <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//                 <Label required>DENSITY (g/cm³)</Label>
//                 <TextField fullWidth size="small" name="density" type="number"
//                   value={data.density} onChange={handleChange} onBlur={handleBlur}
//                   placeholder="e.g., 8.96" error={!!errors.density} helperText={errors.density}
//                   sx={numberFieldSx} disabled={itemFormLoading} inputProps={{ step: '0.01', min: 0 }}
//                 />
//               </Box>
//             </Grid>
//             <Grid size={{ xs: 12, sm: 4 }}>
//               <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//                 <Label required>UNIT</Label>
//                 <FormControl fullWidth size="small" error={!!errors.unit}>
//                   <Select name="unit" value={data.unit} onChange={handleSelect} onBlur={handleBlur}
//                     displayEmpty disabled={itemFormLoading} sx={selectSx}>
//                     <MenuItem value="" disabled sx={{ fontSize: '0.75rem' }}>Select unit</MenuItem>
//                     {unitOptions.map(opt => (
//                       <MenuItem key={opt} value={opt} sx={{ fontSize: '0.75rem' }}>{opt}</MenuItem>
//                     ))}
//                   </Select>
//                   {errors.unit && <Typography sx={{ fontSize: '0.65rem', color: '#EF4444', mt: 0.25 }}>{errors.unit}</Typography>}
//                 </FormControl>
//               </Box>
//             </Grid>
//             <Grid size={{ xs: 12, sm: 4 }}>
//               <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//                 <Label>MATERIAL STANDARD</Label>
//                 <TextField fullWidth size="small" name="material_standard"
//                   value={data.material_standard} onChange={handleChange} onBlur={handleBlur}
//                   placeholder="e.g., ASTM B152" sx={textFieldSx} disabled={itemFormLoading}
//                 />
//               </Box>
//             </Grid>
//             <Grid size={{ xs: 12, sm: 4 }}>
//               <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//                 <Label>MATERIAL COLOR</Label>
//                 <TextField fullWidth size="small" name="material_color"
//                   value={data.material_color} onChange={handleChange} onBlur={handleBlur}
//                   placeholder="e.g., Reddish" sx={textFieldSx} disabled={itemFormLoading}
//                 />
//               </Box>
//             </Grid>
//             <Grid size={{ xs: 12, sm: 4 }}>
//               <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//                 <Label required>HSN CODE</Label>
//                 <TextField fullWidth size="small" name="hsn_code"
//                   value={data.hsn_code} onChange={handleChange} onBlur={handleBlur}
//                   placeholder="e.g., 74071010" error={!!errors.hsn_code} helperText={errors.hsn_code}
//                   sx={textFieldSx} disabled={itemFormLoading}
//                 />
//               </Box>
//             </Grid>
//             <Grid size={{ xs: 12, sm: 4 }}>
//               <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//                 <Label>GST PERCENTAGE (%)</Label>
//                 <TextField fullWidth size="small" name="gst_percentage" type="number"
//                   value={data.gst_percentage} onChange={handleChange} onBlur={handleBlur}
//                   placeholder="e.g., 18" error={!!errors.gst_percentage} helperText={errors.gst_percentage}
//                   sx={numberFieldSx} disabled={itemFormLoading} inputProps={{ step: '0.1', min: 0, max: 100 }}
//                 />
//               </Box>
//             </Grid>
//             <Grid size={{ xs: 12, sm: 4 }}>
//               <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//                 <Label>PROCUREMENT TYPE</Label>
//                 <FormControl fullWidth size="small" error={!!errors.procurement_type}>
//                   <Select name="procurement_type" value={data.procurement_type} onChange={handleSelect} onBlur={handleBlur}
//                     displayEmpty disabled={itemFormLoading} sx={selectSx}>
//                     <MenuItem value="" disabled sx={{ fontSize: '0.75rem' }}>Select procurement type</MenuItem>
//                     {procurementTypeOptions.map(opt => (
//                       <MenuItem key={opt} value={opt} sx={{ fontSize: '0.75rem' }}>{opt}</MenuItem>
//                     ))}
//                   </Select>
//                   {errors.procurement_type && <Typography sx={{ fontSize: '0.65rem', color: '#EF4444', mt: 0.25 }}>{errors.procurement_type}</Typography>}
//                 </FormControl>
//               </Box>
//             </Grid>
//             <Grid size={{ xs: 12, sm: 6 }}>
//               <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//                 <Label>DRAWING NUMBER</Label>
//                 <TextField fullWidth size="small" name="drawing_no"
//                   value={data.drawing_no} onChange={handleChange} onBlur={handleBlur}
//                   placeholder="e.g., DRG001" sx={textFieldSx} disabled={itemFormLoading}
//                 />
//               </Box>
//             </Grid>
//             <Grid size={{ xs: 12, sm: 6 }}>
//               <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//                 <Label>REVISION NUMBER</Label>
//                 <TextField fullWidth size="small" name="revision_no"
//                   value={data.revision_no} onChange={handleChange} onBlur={handleBlur}
//                   placeholder="e.g., 0" sx={textFieldSx} disabled={itemFormLoading}
//                 />
//               </Box>
//             </Grid>
//             <Grid size={{ xs: 12, sm: 4 }}>
//               <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//                 <Label>THICKNESS (mm)</Label>
//                 <TextField fullWidth size="small" name="thickness" type="number"
//                   value={data.thickness} onChange={handleChange} onBlur={handleBlur}
//                   placeholder="e.g., 10" error={!!errors.thickness} helperText={errors.thickness}
//                   sx={numberFieldSx} disabled={itemFormLoading} inputProps={{ step: '0.01', min: 0 }}
//                 />
//               </Box>
//             </Grid>
//             <Grid size={{ xs: 12, sm: 4 }}>
//               <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//                 <Label>WIDTH (mm)</Label>
//                 <TextField fullWidth size="small" name="width" type="number"
//                   value={data.width} onChange={handleChange} onBlur={handleBlur}
//                   placeholder="e.g., 100" error={!!errors.width} helperText={errors.width}
//                   sx={numberFieldSx} disabled={itemFormLoading} inputProps={{ step: '0.01', min: 0 }}
//                 />
//               </Box>
//             </Grid>
//             <Grid size={{ xs: 12, sm: 4 }}>
//               <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//                 <Label>LENGTH (mm)</Label>
//                 <TextField fullWidth size="small" name="length" type="number"
//                   value={data.length} onChange={handleChange} onBlur={handleBlur}
//                   placeholder="e.g., 1000" error={!!errors.length} helperText={errors.length}
//                   sx={numberFieldSx} disabled={itemFormLoading} inputProps={{ step: '0.01', min: 0 }}
//                 />
//               </Box>
//             </Grid>
//             <Grid size={{ xs: 12, sm: 4 }}>
//               <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//                 <Label>RM SOURCE (Supplier)</Label>
//                 <TextField fullWidth size="small" name="rm_source"
//                   value={data.rm_source} onChange={handleChange} onBlur={handleBlur}
//                   placeholder="e.g., Hindalco" sx={textFieldSx} disabled={itemFormLoading}
//                 />
//               </Box>
//             </Grid>
//             <Grid size={{ xs: 12, sm: 4 }}>
//               <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//                 <Label>RM TYPE</Label>
//                 <FormControl fullWidth size="small">
//                   <Select name="rm_type" value={data.rm_type} onChange={handleSelect} onBlur={handleBlur}
//                     displayEmpty disabled={itemFormLoading} sx={selectSx}>
//                     <MenuItem value="" sx={{ fontSize: '0.75rem' }}>Select RM type</MenuItem>
//                     {rmTypeOptions.map(opt => (
//                       <MenuItem key={opt} value={opt} sx={{ fontSize: '0.75rem' }}>{opt}</MenuItem>
//                     ))}
//                   </Select>
//                 </FormControl>
//               </Box>
//             </Grid>
//             <Grid size={{ xs: 12, sm: 4 }}>
//               <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//                 <Label>RM SPECIFICATION</Label>
//                 <TextField fullWidth size="small" name="rm_spec"
//                   value={data.rm_spec} onChange={handleChange} onBlur={handleBlur}
//                   placeholder="e.g., IS 191" sx={textFieldSx} disabled={itemFormLoading}
//                 />
//               </Box>
//             </Grid>
//             <Grid size={{ xs: 12, sm: 4 }}>
//               <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//                 <Label>STRIP SIZE (mm)</Label>
//                 <TextField fullWidth size="small" name="strip_size" type="number"
//                   value={data.strip_size} onChange={handleChange} onBlur={handleBlur}
//                   placeholder="e.g., 3660" error={!!errors.strip_size} helperText={errors.strip_size}
//                   sx={numberFieldSx} disabled={itemFormLoading} inputProps={{ step: '0.01', min: 0 }}
//                 />
//               </Box>
//             </Grid>
//           </Grid>
//         );
//       case 2:
//         return (
//           <Grid container spacing={1.5}>
//             <Grid size={{ xs: 12, sm: 4 }}>
//               <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//                 <Label>PITCH (mm)</Label>
//                 <TextField fullWidth size="small" name="pitch" type="number"
//                   value={data.pitch} onChange={handleChange} onBlur={handleBlur}
//                   placeholder="e.g., 42" error={!!errors.pitch} helperText={errors.pitch}
//                   sx={numberFieldSx} disabled={itemFormLoading} inputProps={{ step: '0.01', min: 0 }}
//                 />
//               </Box>
//             </Grid>
//             <Grid size={{ xs: 12, sm: 4 }}>
//               <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//                 <Label>NUMBER OF CAVITIES</Label>
//                 <TextField fullWidth size="small" name="no_of_cavity" type="number"
//                   value={data.no_of_cavity} onChange={handleChange} onBlur={handleBlur}
//                   placeholder="e.g., 1" error={!!errors.no_of_cavity} helperText={errors.no_of_cavity}
//                   sx={numberFieldSx} disabled={itemFormLoading} inputProps={{ step: '1', min: 1 }}
//                 />
//               </Box>
//             </Grid>
//             <Grid size={{ xs: 12, sm: 4 }}>
//               <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//                 <Label>RM REJECTION PERCENTAGE (%)</Label>
//                 <TextField fullWidth size="small" name="rm_rejection_percent" type="number"
//                   value={data.rm_rejection_percent} onChange={handleChange} onBlur={handleBlur}
//                   placeholder="e.g., 2" error={!!errors.rm_rejection_percent} helperText={errors.rm_rejection_percent}
//                   sx={numberFieldSx} disabled={itemFormLoading} inputProps={{ step: '0.1', min: 0, max: 100 }}
//                 />
//               </Box>
//             </Grid>
//             <Grid size={{ xs: 12, sm: 4 }}>
//               <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//                 <Label>SCRAP REALISATION PERCENTAGE (%)</Label>
//                 <TextField fullWidth size="small" name="scrap_realisation_percent" type="number"
//                   value={data.scrap_realisation_percent} onChange={handleChange} onBlur={handleBlur}
//                   placeholder="e.g., 85" error={!!errors.scrap_realisation_percent} helperText={errors.scrap_realisation_percent}
//                   sx={numberFieldSx} disabled={itemFormLoading} inputProps={{ step: '0.1', min: 0, max: 100 }}
//                 />
//               </Box>
//             </Grid>
//           </Grid>
//         );
//       case 3:
//         return (
//           <Grid container spacing={1.5}>
//             <Grid size={{ xs: 12, sm: 4 }}>
//               <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//                 <Label>REORDER LEVEL</Label>
//                 <TextField fullWidth size="small" name="reorder_level" type="number"
//                   value={data.reorder_level} onChange={handleChange} onBlur={handleBlur}
//                   placeholder="e.g., 100" error={!!errors.reorder_level} helperText={errors.reorder_level}
//                   sx={numberFieldSx} disabled={itemFormLoading} inputProps={{ step: '1', min: 0 }}
//                 />
//               </Box>
//             </Grid>
//             <Grid size={{ xs: 12, sm: 4 }}>
//               <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//                 <Label>REORDER QUANTITY</Label>
//                 <TextField fullWidth size="small" name="reorder_qty" type="number"
//                   value={data.reorder_qty} onChange={handleChange} onBlur={handleBlur}
//                   placeholder="e.g., 500" error={!!errors.reorder_qty} helperText={errors.reorder_qty}
//                   sx={numberFieldSx} disabled={itemFormLoading} inputProps={{ step: '1', min: 0 }}
//                 />
//               </Box>
//             </Grid>
//             <Grid size={{ xs: 12, sm: 4 }}>
//               <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//                 <Label>LEAD TIME (Days)</Label>
//                 <TextField fullWidth size="small" name="lead_time_days" type="number"
//                   value={data.lead_time_days} onChange={handleChange} onBlur={handleBlur}
//                   placeholder="e.g., 7" error={!!errors.lead_time_days} helperText={errors.lead_time_days}
//                   sx={numberFieldSx} disabled={itemFormLoading} inputProps={{ step: '1', min: 0 }}
//                 />
//               </Box>
//             </Grid>
//             <Grid size={{ xs: 12, sm: 4 }}>
//               <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//                 <Label>SAFETY STOCK</Label>
//                 <TextField fullWidth size="small" name="safety_stock" type="number"
//                   value={data.safety_stock} onChange={handleChange} onBlur={handleBlur}
//                   placeholder="e.g., 50" error={!!errors.safety_stock} helperText={errors.safety_stock}
//                   sx={numberFieldSx} disabled={itemFormLoading} inputProps={{ step: '1', min: 0 }}
//                 />
//               </Box>
//             </Grid>
//             <Grid size={{ xs: 12, sm: 4 }}>
//               <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//                 <Label>MIN STOCK</Label>
//                 <TextField fullWidth size="small" name="min_stock" type="number"
//                   value={data.min_stock} onChange={handleChange} onBlur={handleBlur}
//                   placeholder="e.g., 50" error={!!errors.min_stock} helperText={errors.min_stock}
//                   sx={numberFieldSx} disabled={itemFormLoading} inputProps={{ step: '1', min: 0 }}
//                 />
//               </Box>
//             </Grid>
//             <Grid size={{ xs: 12, sm: 4 }}>
//               <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//                 <Label>MAX STOCK</Label>
//                 <TextField fullWidth size="small" name="max_stock" type="number"
//                   value={data.max_stock} onChange={handleChange} onBlur={handleBlur}
//                   placeholder="e.g., 2000" error={!!errors.max_stock} helperText={errors.max_stock}
//                   sx={numberFieldSx} disabled={itemFormLoading} inputProps={{ step: '1', min: 0 }}
//                 />
//               </Box>
//             </Grid>
//             <Grid size={{ xs: 12, sm: 4 }}>
//               <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//                 <Label>SHELF LIFE (Days)</Label>
//                 <TextField fullWidth size="small" name="shelf_life_days" type="number"
//                   value={data.shelf_life_days} onChange={handleChange} onBlur={handleBlur}
//                   placeholder="e.g., 365" error={!!errors.shelf_life_days} helperText={errors.shelf_life_days}
//                   sx={numberFieldSx} disabled={itemFormLoading} inputProps={{ step: '1', min: 0 }}
//                 />
//               </Box>
//             </Grid>
//           </Grid>
//         );
//       default:
//         return null;
//     }
//   };

//   return (
//     <Paper sx={{ mt: 2, p: 2, bgcolor: COLORS.background.light, borderRadius: 2, border: `2px solid ${COLORS.primary}` }}>
//       <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
//         <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color: COLORS.primary }}>
//           <ProductionIcon sx={{ fontSize: '1rem', mr: 1, verticalAlign: 'middle' }} />
//           Add New Item
//         </Typography>
//         <IconButton size="small" onClick={handleCancel} sx={{ color: COLORS.text.tertiary, '&:hover': { color: COLORS.primary } }} disabled={itemFormLoading}>
//           <CloseIcon sx={{ fontSize: '1rem' }} />
//         </IconButton>
//       </Box>

//       <Stepper activeStep={itemStepper} sx={{ mb: 3 }} connector={<ColorConnector />}>
//         {ITEM_STEPS.map((label, index) => (
//           <Step key={label}>
//             <StepLabel>
//               <Typography sx={{ fontSize: '0.65rem', fontWeight: 500 }}>{index + 1}. {label}</Typography>
//             </StepLabel>
//           </Step>
//         ))}
//       </Stepper>

//       {renderItemStepContent(itemStepper)}

//       {itemFormError && (
//         <Alert severity="error" sx={{ mt: 2, borderRadius: 1.5, fontSize: '0.75rem', py: 0.5 }}>
//           {itemFormError}
//         </Alert>
//       )}

//       <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
//         <Button
//           onClick={handleItemBack}
//           disabled={itemStepper === 0 || itemFormLoading}
//           size="small"
//           startIcon={<NavigateBeforeIcon sx={{ fontSize: '1rem' }} />}
//           sx={{
//             height: 32, px: 2, borderRadius: 1.5,
//             border: `1px solid ${COLORS.border}`,
//             color: COLORS.text.secondary,
//             fontSize: '0.7rem', fontWeight: 500, textTransform: 'none',
//             '&:hover': { borderColor: COLORS.primary, bgcolor: `${COLORS.primary}10` }
//           }}
//         >
//           Back
//         </Button>
//         <Box sx={{ display: 'flex', gap: 1 }}>
//           <Button
//             onClick={handleCancel}
//             disabled={itemFormLoading}
//             size="small"
//             sx={{
//               height: 32, px: 2, borderRadius: 1.5,
//               border: `1px solid ${COLORS.border}`,
//               color: COLORS.text.secondary,
//               fontSize: '0.7rem', fontWeight: 500, textTransform: 'none',
//               '&:hover': { borderColor: COLORS.primary, bgcolor: `${COLORS.primary}10` }
//             }}
//           >
//             Cancel
//           </Button>
//           {itemStepper === ITEM_STEPS.length - 1 ? (
//             <Button
//               variant="contained"
//               onClick={handleItemSubmit}
//               disabled={itemFormLoading}
//               size="small"
//               startIcon={itemFormLoading ? <CircularProgress size={16} color="inherit" /> : <SaveIcon sx={{ fontSize: '1rem' }} />}
//               sx={{
//                 height: 32, px: 2, borderRadius: 1.5,
//                 bgcolor: COLORS.primary,
//                 fontSize: '0.7rem', fontWeight: 500, textTransform: 'none',
//                 '&:hover': { bgcolor: COLORS.primaryDark }
//               }}
//             >
//               {itemFormLoading ? 'Saving...' : 'Save Item'}
//             </Button>
//           ) : (
//             <Button
//               variant="contained"
//               onClick={handleItemNext}
//               disabled={itemFormLoading}
//               size="small"
//               endIcon={<NavigateNextIcon sx={{ fontSize: '1rem' }} />}
//               sx={{
//                 height: 32, px: 2, borderRadius: 1.5,
//                 bgcolor: COLORS.primary,
//                 fontSize: '0.7rem', fontWeight: 500, textTransform: 'none',
//                 '&:hover': { bgcolor: COLORS.primaryDark }
//               }}
//             >
//               Next
//             </Button>
//           )}
//         </Box>
//       </Box>
//     </Paper>
//   );
// };

// // ============================================
// // INLINE BOM FORM (Simplified)
// // ============================================
// const InlineBomForm = ({ onSave, onCancel }) => {
//   const [bomStepper, setBomStepper] = useState(0);
//   const [bomFormLoading, setBomFormLoading] = useState(false);
//   const [bomFormError, setBomFormError] = useState('');
//   const [bomFormData, setBomFormData] = useState({
//     parent_part_no: '',
//     parent_part_name: '',
//     bom_version: '1.0',
//     quantity: 1,
//     unit: 'Nos',
//     description: ''
//   });
//   const [bomFormErrors, setBomFormErrors] = useState({});

//   const handleBomFormChange = (e) => {
//     const { name, value } = e.target;
//     setBomFormData(prev => ({ ...prev, [name]: value }));
//     setBomFormErrors(prev => ({ ...prev, [name]: '' }));
//   };

//   const validateBomStep = (step) => {
//     const errors = {};
//     let isValid = true;

//     switch (step) {
//       case 0:
//         if (!bomFormData.parent_part_no.trim()) {
//           errors.parent_part_no = 'Parent part number is required';
//           isValid = false;
//         }
//         if (!bomFormData.parent_part_name.trim()) {
//           errors.parent_part_name = 'Parent part name is required';
//           isValid = false;
//         }
//         if (!bomFormData.quantity || bomFormData.quantity <= 0) {
//           errors.quantity = 'Quantity must be greater than 0';
//           isValid = false;
//         }
//         if (!bomFormData.unit) {
//           errors.unit = 'Unit is required';
//           isValid = false;
//         }
//         break;
//       default:
//         break;
//     }

//     setBomFormErrors(errors);
//     return isValid;
//   };

//   const handleBomNext = () => {
//     if (validateBomStep(bomStepper)) {
//       setBomStepper(prev => prev + 1);
//     }
//   };

//   const handleBomBack = () => {
//     setBomStepper(prev => prev - 1);
//   };

//   const handleBomSubmit = async () => {
//     if (!validateBomStep(bomStepper)) return;

//     setBomFormLoading(true);
//     setBomFormError('');

//     try {
//       const token = localStorage.getItem('token');
//       const response = await axios.post(`${BASE_URL}/api/boms`, bomFormData, {
//         headers: { 'Authorization': `Bearer ${token}` }
//       });

//       if (response.data.success) {
//         onSave(response.data.data);
//       } else {
//         setBomFormError(response.data.message || 'Failed to add BOM');
//       }
//     } catch (err) {
//       console.error('Error adding BOM:', err);
//       setBomFormError(err.response?.data?.message || 'Failed to add BOM. Please try again.');
//     } finally {
//       setBomFormLoading(false);
//     }
//   };

//   const resetBomForm = () => {
//     setBomFormData({
//       parent_part_no: '',
//       parent_part_name: '',
//       bom_version: '1.0',
//       quantity: 1,
//       unit: 'Nos',
//       description: ''
//     });
//     setBomFormErrors({});
//     setBomFormError('');
//     setBomStepper(0);
//   };

//   const handleCancel = () => {
//     resetBomForm();
//     onCancel();
//   };

//   const Label = ({ children, required }) => (
//     <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary, letterSpacing: '0.5px' }}>
//       {children} {required && <span style={{ color: '#EF4444' }}>*</span>}
//     </Typography>
//   );

//   const textFieldSx = {
//     '& .MuiOutlinedInput-root': {
//       borderRadius: 1.5, fontSize: '0.75rem',
//       '&:hover fieldset': { borderColor: COLORS.primary },
//       '&.Mui-focused fieldset': { borderColor: COLORS.primary, borderWidth: 1 }
//     },
//     '& .MuiInputBase-input': {
//       py: 1, px: 1.5, fontSize: '0.75rem', color: COLORS.text.primary,
//       '&::placeholder': { color: COLORS.text.tertiary, fontSize: '0.75rem' }
//     },
//     '& .MuiFormHelperText-root': { fontSize: '0.65rem', marginLeft: 0, marginTop: 0.25 }
//   };

//   const selectSx = {
//     borderRadius: 1.5, fontSize: '0.75rem',
//     '& .MuiSelect-select': { py: 1, px: 1.5, fontSize: '0.75rem' }
//   };

//   const renderBomStepContent = (step) => {
//     switch (step) {
//       case 0:
//         return (
//           <Grid container spacing={2}>
//             <Grid size={{ xs: 12, sm: 6 }}>
//               <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//                 <Label required>PARENT PART NO</Label>
//                 <TextField fullWidth size="small" name="parent_part_no"
//                   value={bomFormData.parent_part_no} onChange={handleBomFormChange}
//                   placeholder="e.g., BR-001" error={!!bomFormErrors.parent_part_no}
//                   helperText={bomFormErrors.parent_part_no} sx={textFieldSx} disabled={bomFormLoading}
//                 />
//               </Box>
//             </Grid>
//             <Grid size={{ xs: 12, sm: 6 }}>
//               <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//                 <Label required>PARENT PART NAME</Label>
//                 <TextField fullWidth size="small" name="parent_part_name"
//                   value={bomFormData.parent_part_name} onChange={handleBomFormChange}
//                   placeholder="e.g., Copper Busbar" error={!!bomFormErrors.parent_part_name}
//                   helperText={bomFormErrors.parent_part_name} sx={textFieldSx} disabled={bomFormLoading}
//                 />
//               </Box>
//             </Grid>
//             <Grid size={{ xs: 12, sm: 4 }}>
//               <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//                 <Label required>QUANTITY</Label>
//                 <TextField fullWidth size="small" name="quantity" type="number"
//                   value={bomFormData.quantity} onChange={handleBomFormChange}
//                   placeholder="e.g., 1" error={!!bomFormErrors.quantity}
//                   helperText={bomFormErrors.quantity} sx={textFieldSx} disabled={bomFormLoading}
//                   inputProps={{ step: '0.01', min: 0.01 }}
//                 />
//               </Box>
//             </Grid>
//             <Grid size={{ xs: 12, sm: 4 }}>
//               <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//                 <Label required>UNIT</Label>
//                 <FormControl fullWidth size="small" error={!!bomFormErrors.unit}>
//                   <Select name="unit" value={bomFormData.unit} onChange={handleBomFormChange}
//                     disabled={bomFormLoading} sx={selectSx}>
//                     {unitOptions.map(opt => (
//                       <MenuItem key={opt} value={opt} sx={{ fontSize: '0.75rem' }}>{opt}</MenuItem>
//                     ))}
//                   </Select>
//                   {bomFormErrors.unit && (
//                     <Typography sx={{ fontSize: '0.65rem', color: '#EF4444', mt: 0.25 }}>{bomFormErrors.unit}</Typography>
//                   )}
//                 </FormControl>
//               </Box>
//             </Grid>
//             <Grid size={{ xs: 12, sm: 4 }}>
//               <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//                 <Label>BOM VERSION</Label>
//                 <TextField fullWidth size="small" name="bom_version"
//                   value={bomFormData.bom_version} onChange={handleBomFormChange}
//                   placeholder="e.g., 1.0" sx={textFieldSx} disabled={bomFormLoading}
//                 />
//               </Box>
//             </Grid>
//             <Grid size={{ xs: 12 }}>
//               <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//                 <Label>DESCRIPTION</Label>
//                 <TextField fullWidth size="small" name="description" multiline rows={2}
//                   value={bomFormData.description} onChange={handleBomFormChange}
//                   placeholder="Enter BOM description" sx={textFieldSx} disabled={bomFormLoading}
//                 />
//               </Box>
//             </Grid>
//           </Grid>
//         );
//       case 1:
//         return (
//           <Box sx={{ py: 2, textAlign: 'center' }}>
//             <Typography variant="h6" sx={{ fontWeight: 600, color: COLORS.text.primary }}>
//               Components
//             </Typography>
//             <Typography sx={{ fontSize: '0.8rem', color: COLORS.text.secondary, mt: 1 }}>
//               Component management coming soon...
//             </Typography>
//           </Box>
//         );
//       case 2:
//         return (
//           <Box sx={{ py: 2, textAlign: 'center' }}>
//             <Typography variant="h6" sx={{ fontWeight: 600, color: COLORS.text.primary }}>
//               Ready to Save!
//             </Typography>
//             <Typography sx={{ fontSize: '0.8rem', color: COLORS.text.secondary, mt: 1 }}>
//               Please review the BOM information before saving.
//             </Typography>
//           </Box>
//         );
//       default:
//         return null;
//     }
//   };

//   return (
//     <Paper sx={{ mt: 2, p: 2, bgcolor: COLORS.background.light, borderRadius: 2, border: `2px solid ${COLORS.primary}` }}>
//       <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
//         <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color: COLORS.primary }}>
//           <AssignmentIcon sx={{ fontSize: '1rem', mr: 1, verticalAlign: 'middle' }} />
//           Add New BOM
//         </Typography>
//         <IconButton size="small" onClick={handleCancel} sx={{ color: COLORS.text.tertiary, '&:hover': { color: COLORS.primary } }} disabled={bomFormLoading}>
//           <CloseIcon sx={{ fontSize: '1rem' }} />
//         </IconButton>
//       </Box>

//       <Stepper activeStep={bomStepper} sx={{ mb: 3 }} connector={<ColorConnector />}>
//         {BOM_STEPS.map((label, index) => (
//           <Step key={label}>
//             <StepLabel>
//               <Typography sx={{ fontSize: '0.65rem', fontWeight: 500 }}>{index + 1}. {label}</Typography>
//             </StepLabel>
//           </Step>
//         ))}
//       </Stepper>

//       {renderBomStepContent(bomStepper)}

//       {bomFormError && (
//         <Alert severity="error" sx={{ mt: 2, borderRadius: 1.5, fontSize: '0.75rem', py: 0.5 }}>
//           {bomFormError}
//         </Alert>
//       )}

//       <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
//         <Button
//           onClick={handleBomBack}
//           disabled={bomStepper === 0 || bomFormLoading}
//           size="small"
//           startIcon={<NavigateBeforeIcon sx={{ fontSize: '1rem' }} />}
//           sx={{
//             height: 32, px: 2, borderRadius: 1.5,
//             border: `1px solid ${COLORS.border}`,
//             color: COLORS.text.secondary,
//             fontSize: '0.7rem', fontWeight: 500, textTransform: 'none',
//             '&:hover': { borderColor: COLORS.primary, bgcolor: `${COLORS.primary}10` }
//           }}
//         >
//           Back
//         </Button>
//         <Box sx={{ display: 'flex', gap: 1 }}>
//           <Button
//             onClick={handleCancel}
//             disabled={bomFormLoading}
//             size="small"
//             sx={{
//               height: 32, px: 2, borderRadius: 1.5,
//               border: `1px solid ${COLORS.border}`,
//               color: COLORS.text.secondary,
//               fontSize: '0.7rem', fontWeight: 500, textTransform: 'none',
//               '&:hover': { borderColor: COLORS.primary, bgcolor: `${COLORS.primary}10` }
//             }}
//           >
//             Cancel
//           </Button>
//           {bomStepper === BOM_STEPS.length - 1 ? (
//             <Button
//               variant="contained"
//               onClick={handleBomSubmit}
//               disabled={bomFormLoading}
//               size="small"
//               startIcon={bomFormLoading ? <CircularProgress size={16} color="inherit" /> : <SaveIcon sx={{ fontSize: '1rem' }} />}
//               sx={{
//                 height: 32, px: 2, borderRadius: 1.5,
//                 bgcolor: COLORS.primary,
//                 fontSize: '0.7rem', fontWeight: 500, textTransform: 'none',
//                 '&:hover': { bgcolor: COLORS.primaryDark }
//               }}
//             >
//               {bomFormLoading ? 'Saving...' : 'Save BOM'}
//             </Button>
//           ) : (
//             <Button
//               variant="contained"
//               onClick={handleBomNext}
//               disabled={bomFormLoading}
//               size="small"
//               endIcon={<NavigateNextIcon sx={{ fontSize: '1rem' }} />}
//               sx={{
//                 height: 32, px: 2, borderRadius: 1.5,
//                 bgcolor: COLORS.primary,
//                 fontSize: '0.7rem', fontWeight: 500, textTransform: 'none',
//                 '&:hover': { bgcolor: COLORS.primaryDark }
//               }}
//             >
//               Next
//             </Button>
//           )}
//         </Box>
//       </Box>
//     </Paper>
//   );
// };

// // ============================================
// // INLINE ROUTING FORM (Simplified)
// // ============================================
// const InlineRoutingForm = ({ onSave, onCancel }) => {
//   const [routingStepper, setRoutingStepper] = useState(0);
//   const [routingFormLoading, setRoutingFormLoading] = useState(false);
//   const [routingFormError, setRoutingFormError] = useState('');
//   const [routingFormData, setRoutingFormData] = useState({
//     routing_id: '',
//     routing_name: '',
//     description: ''
//   });
//   const [routingFormErrors, setRoutingFormErrors] = useState({});

//   const handleRoutingFormChange = (e) => {
//     const { name, value } = e.target;
//     setRoutingFormData(prev => ({ ...prev, [name]: value }));
//     setRoutingFormErrors(prev => ({ ...prev, [name]: '' }));
//   };

//   const validateRoutingStep = (step) => {
//     const errors = {};
//     let isValid = true;

//     switch (step) {
//       case 0:
//         if (!routingFormData.routing_id.trim()) {
//           errors.routing_id = 'Routing ID is required';
//           isValid = false;
//         }
//         if (!routingFormData.routing_name.trim()) {
//           errors.routing_name = 'Routing name is required';
//           isValid = false;
//         }
//         break;
//       default:
//         break;
//     }

//     setRoutingFormErrors(errors);
//     return isValid;
//   };

//   const handleRoutingNext = () => {
//     if (validateRoutingStep(routingStepper)) {
//       setRoutingStepper(prev => prev + 1);
//     }
//   };

//   const handleRoutingBack = () => {
//     setRoutingStepper(prev => prev - 1);
//   };

//   const handleRoutingSubmit = async () => {
//     if (!validateRoutingStep(routingStepper)) return;

//     setRoutingFormLoading(true);
//     setRoutingFormError('');

//     try {
//       const token = localStorage.getItem('token');
//       const response = await axios.post(`${BASE_URL}/api/routings`, routingFormData, {
//         headers: { 'Authorization': `Bearer ${token}` }
//       });

//       if (response.data.success) {
//         onSave(response.data.data);
//       } else {
//         setRoutingFormError(response.data.message || 'Failed to add routing');
//       }
//     } catch (err) {
//       console.error('Error adding routing:', err);
//       setRoutingFormError(err.response?.data?.message || 'Failed to add routing. Please try again.');
//     } finally {
//       setRoutingFormLoading(false);
//     }
//   };

//   const resetRoutingForm = () => {
//     setRoutingFormData({
//       routing_id: '',
//       routing_name: '',
//       description: ''
//     });
//     setRoutingFormErrors({});
//     setRoutingFormError('');
//     setRoutingStepper(0);
//   };

//   const handleCancel = () => {
//     resetRoutingForm();
//     onCancel();
//   };

//   const Label = ({ children, required }) => (
//     <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary, letterSpacing: '0.5px' }}>
//       {children} {required && <span style={{ color: '#EF4444' }}>*</span>}
//     </Typography>
//   );

//   const textFieldSx = {
//     '& .MuiOutlinedInput-root': {
//       borderRadius: 1.5, fontSize: '0.75rem',
//       '&:hover fieldset': { borderColor: COLORS.primary },
//       '&.Mui-focused fieldset': { borderColor: COLORS.primary, borderWidth: 1 }
//     },
//     '& .MuiInputBase-input': {
//       py: 1, px: 1.5, fontSize: '0.75rem', color: COLORS.text.primary,
//       '&::placeholder': { color: COLORS.text.tertiary, fontSize: '0.75rem' }
//     },
//     '& .MuiFormHelperText-root': { fontSize: '0.65rem', marginLeft: 0, marginTop: 0.25 }
//   };

//   const renderRoutingStepContent = (step) => {
//     switch (step) {
//       case 0:
//         return (
//           <Grid container spacing={2}>
//             <Grid size={{ xs: 12, sm: 6 }}>
//               <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//                 <Label required>ROUTING ID</Label>
//                 <TextField fullWidth size="small" name="routing_id"
//                   value={routingFormData.routing_id} onChange={handleRoutingFormChange}
//                   placeholder="e.g., ROUT-001" error={!!routingFormErrors.routing_id}
//                   helperText={routingFormErrors.routing_id} sx={textFieldSx} disabled={routingFormLoading}
//                 />
//               </Box>
//             </Grid>
//             <Grid size={{ xs: 12, sm: 6 }}>
//               <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//                 <Label required>ROUTING NAME</Label>
//                 <TextField fullWidth size="small" name="routing_name"
//                   value={routingFormData.routing_name} onChange={handleRoutingFormChange}
//                   placeholder="e.g., Copper Busbar Routing" error={!!routingFormErrors.routing_name}
//                   helperText={routingFormErrors.routing_name} sx={textFieldSx} disabled={routingFormLoading}
//                 />
//               </Box>
//             </Grid>
//             <Grid size={{ xs: 12 }}>
//               <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//                 <Label>DESCRIPTION</Label>
//                 <TextField fullWidth size="small" name="description" multiline rows={2}
//                   value={routingFormData.description} onChange={handleRoutingFormChange}
//                   placeholder="Enter routing description" sx={textFieldSx} disabled={routingFormLoading}
//                 />
//               </Box>
//             </Grid>
//           </Grid>
//         );
//       case 1:
//         return (
//           <Box sx={{ py: 2, textAlign: 'center' }}>
//             <Typography variant="h6" sx={{ fontWeight: 600, color: COLORS.text.primary }}>
//               Operations
//             </Typography>
//             <Typography sx={{ fontSize: '0.8rem', color: COLORS.text.secondary, mt: 1 }}>
//               Operation management coming soon...
//             </Typography>
//           </Box>
//         );
//       case 2:
//         return (
//           <Box sx={{ py: 2, textAlign: 'center' }}>
//             <Typography variant="h6" sx={{ fontWeight: 600, color: COLORS.text.primary }}>
//               Ready to Save!
//             </Typography>
//             <Typography sx={{ fontSize: '0.8rem', color: COLORS.text.secondary, mt: 1 }}>
//               Please review the routing information before saving.
//             </Typography>
//           </Box>
//         );
//       default:
//         return null;
//     }
//   };

//   return (
//     <Paper sx={{ mt: 2, p: 2, bgcolor: COLORS.background.light, borderRadius: 2, border: `2px solid ${COLORS.primary}` }}>
//       <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
//         <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color: COLORS.primary }}>
//           <RouteIcon sx={{ fontSize: '1rem', mr: 1, verticalAlign: 'middle' }} />
//           Add New Routing
//         </Typography>
//         <IconButton size="small" onClick={handleCancel} sx={{ color: COLORS.text.tertiary, '&:hover': { color: COLORS.primary } }} disabled={routingFormLoading}>
//           <CloseIcon sx={{ fontSize: '1rem' }} />
//         </IconButton>
//       </Box>

//       <Stepper activeStep={routingStepper} sx={{ mb: 3 }} connector={<ColorConnector />}>
//         {ROUTING_STEPS.map((label, index) => (
//           <Step key={label}>
//             <StepLabel>
//               <Typography sx={{ fontSize: '0.65rem', fontWeight: 500 }}>{index + 1}. {label}</Typography>
//             </StepLabel>
//           </Step>
//         ))}
//       </Stepper>

//       {renderRoutingStepContent(routingStepper)}

//       {routingFormError && (
//         <Alert severity="error" sx={{ mt: 2, borderRadius: 1.5, fontSize: '0.75rem', py: 0.5 }}>
//           {routingFormError}
//         </Alert>
//       )}

//       <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
//         <Button
//           onClick={handleRoutingBack}
//           disabled={routingStepper === 0 || routingFormLoading}
//           size="small"
//           startIcon={<NavigateBeforeIcon sx={{ fontSize: '1rem' }} />}
//           sx={{
//             height: 32, px: 2, borderRadius: 1.5,
//             border: `1px solid ${COLORS.border}`,
//             color: COLORS.text.secondary,
//             fontSize: '0.7rem', fontWeight: 500, textTransform: 'none',
//             '&:hover': { borderColor: COLORS.primary, bgcolor: `${COLORS.primary}10` }
//           }}
//         >
//           Back
//         </Button>
//         <Box sx={{ display: 'flex', gap: 1 }}>
//           <Button
//             onClick={handleCancel}
//             disabled={routingFormLoading}
//             size="small"
//             sx={{
//               height: 32, px: 2, borderRadius: 1.5,
//               border: `1px solid ${COLORS.border}`,
//               color: COLORS.text.secondary,
//               fontSize: '0.7rem', fontWeight: 500, textTransform: 'none',
//               '&:hover': { borderColor: COLORS.primary, bgcolor: `${COLORS.primary}10` }
//             }}
//           >
//             Cancel
//           </Button>
//           {routingStepper === ROUTING_STEPS.length - 1 ? (
//             <Button
//               variant="contained"
//               onClick={handleRoutingSubmit}
//               disabled={routingFormLoading}
//               size="small"
//               startIcon={routingFormLoading ? <CircularProgress size={16} color="inherit" /> : <SaveIcon sx={{ fontSize: '1rem' }} />}
//               sx={{
//                 height: 32, px: 2, borderRadius: 1.5,
//                 bgcolor: COLORS.primary,
//                 fontSize: '0.7rem', fontWeight: 500, textTransform: 'none',
//                 '&:hover': { bgcolor: COLORS.primaryDark }
//               }}
//             >
//               {routingFormLoading ? 'Saving...' : 'Save Routing'}
//             </Button>
//           ) : (
//             <Button
//               variant="contained"
//               onClick={handleRoutingNext}
//               disabled={routingFormLoading}
//               size="small"
//               endIcon={<NavigateNextIcon sx={{ fontSize: '1rem' }} />}
//               sx={{
//                 height: 32, px: 2, borderRadius: 1.5,
//                 bgcolor: COLORS.primary,
//                 fontSize: '0.7rem', fontWeight: 500, textTransform: 'none',
//                 '&:hover': { bgcolor: COLORS.primaryDark }
//               }}
//             >
//               Next
//             </Button>
//           )}
//         </Box>
//       </Box>
//     </Paper>
//   );
// };

// // ============================================
// // MAIN AddWorkOrder COMPONENT
// // ============================================
// const AddWorkOrder = ({ open, onClose, onAdd }) => {
//   const [activeStep, setActiveStep] = useState(0);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState('');
//   const [fieldErrors, setFieldErrors] = useState({});

//   // Inline form visibility states
//   const [showCustomerForm, setShowCustomerForm] = useState(false);
//   const [showItemForm, setShowItemForm] = useState(false);
//   const [showBomForm, setShowBomForm] = useState(false);
//   const [showRoutingForm, setShowRoutingForm] = useState(false);

//   // Data fetching states
//   const [customers, setCustomers] = useState([]);
//   const [salesOrders, setSalesOrders] = useState([]);
//   const [selectedSO, setSelectedSO] = useState(null);
//   const [selectedSOItem, setSelectedSOItem] = useState(null);
//   const [selectedItem, setSelectedItem] = useState(null);
//   const [boms, setBoms] = useState([]);
//   const [routings, setRoutings] = useState([]);
//   const [mrpRuns, setMrpRuns] = useState([]);
//   const [items, setItems] = useState([]);
//   const [assemblyLines, setAssemblyLines] = useState([]);
  
//   const [loadingCustomers, setLoadingCustomers] = useState(false);
//   const [loadingSO, setLoadingSO] = useState(false);
//   const [loadingBOM, setLoadingBOM] = useState(false);
//   const [loadingRouting, setLoadingRouting] = useState(false);
//   const [loadingMRP, setLoadingMRP] = useState(false);
//   const [loadingItems, setLoadingItems] = useState(false);
//   const [loadingAssemblyLines, setLoadingAssemblyLines] = useState(false);

//   // Form data
//   const [formData, setFormData] = useState({
//     so_id: '',
//     so_item_id: '',
//     item_id: '',
//     bom_id: '',
//     routing_id: '',
//     planned_qty: '',
//     planned_start: '',
//     planned_end: '',
//     required_by: '',
//     priority: 'Medium',
//     wo_type: 'Machining',
//     assembly_line: '',
//     serial_tracking: false,
//     mrp_run_id: ''
//   });

//   const showError = (message) => {
//     setError(message);
//     setTimeout(() => {
//       setError('');
//     }, 5000);
//   };

//   const showAssemblyLine = ['Assembly', 'SubAssembly'].includes(formData.wo_type);

//   // Fetch Customers
//   const fetchCustomers = useCallback(async () => {
//     try {
//       setLoadingCustomers(true);
//       const token = localStorage.getItem('token');
//       const response = await axios.get(`${BASE_URL}/api/customers?limit=100`, {
//         headers: { Authorization: `Bearer ${token}` }
//       });
//       if (response.data.success) {
//         setCustomers(response.data.data || []);
//       }
//     } catch (err) {
//       console.error('Error fetching customers:', err);
//     } finally {
//       setLoadingCustomers(false);
//     }
//   }, []);

//   // Fetch Sales Orders
//   const fetchSalesOrders = useCallback(async () => {
//     try {
//       setLoadingSO(true);
//       const token = localStorage.getItem('token');
//       const response = await axios.get(`${BASE_URL}/api/sales-orders`, {
//         headers: { Authorization: `Bearer ${token}` }
//       });
//       if (response.data.success) {
//         setSalesOrders(response.data.data || []);
//       }
//     } catch (err) {
//       console.error('Error fetching sales orders:', err);
//     } finally {
//       setLoadingSO(false);
//     }
//   }, []);

//   // Fetch BOMs
//   const fetchBOMs = useCallback(async () => {
//     try {
//       setLoadingBOM(true);
//       const token = localStorage.getItem('token');
//       const response = await axios.get(`${BASE_URL}/api/boms`, {
//         headers: { Authorization: `Bearer ${token}` }
//       });
//       if (response.data.success) {
//         setBoms(response.data.data || []);
//       }
//     } catch (err) {
//       console.error('Error fetching BOMs:', err);
//     } finally {
//       setLoadingBOM(false);
//     }
//   }, []);

//   // Fetch Routings
//   const fetchRoutings = useCallback(async () => {
//     try {
//       setLoadingRouting(true);
//       const token = localStorage.getItem('token');
//       const response = await axios.get(`${BASE_URL}/api/routings`, {
//         headers: { Authorization: `Bearer ${token}` }
//       });
//       if (response.data.success) {
//         setRoutings(response.data.data || []);
//       }
//     } catch (err) {
//       console.error('Error fetching routings:', err);
//     } finally {
//       setLoadingRouting(false);
//     }
//   }, []);

//   // Fetch MRP Runs
//   const fetchMrpRuns = useCallback(async () => {
//     try {
//       setLoadingMRP(true);
//       const token = localStorage.getItem('token');
//       const response = await axios.get(`${BASE_URL}/api/mrp/runs`, {
//         headers: { Authorization: `Bearer ${token}` }
//       });
//       if (response.data.success) {
//         setMrpRuns(response.data.data || []);
//       }
//     } catch (err) {
//       console.error('Error fetching MRP runs:', err);
//     } finally {
//       setLoadingMRP(false);
//     }
//   }, []);

//   // Fetch Items
//   const fetchItems = useCallback(async () => {
//     try {
//       setLoadingItems(true);
//       const token = localStorage.getItem('token');
//       const response = await axios.get(`${BASE_URL}/api/items`, {
//         headers: { Authorization: `Bearer ${token}` }
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

//   // Fetch Assembly Lines
//   const fetchAssemblyLines = useCallback(async () => {
//     try {
//       setLoadingAssemblyLines(true);
//       const token = localStorage.getItem('token');
//       const response = await axios.get(`${BASE_URL}/api/assembly-lines/dropdown`, {
//         headers: { Authorization: `Bearer ${token}` }
//       });
//       if (response.data.success) {
//         setAssemblyLines(response.data.data || []);
//       }
//     } catch (err) {
//       console.error('Error fetching assembly lines:', err);
//       try {
//         const fallbackResponse = await axios.get(`${BASE_URL}/api/assembly-lines`, {
//           headers: { Authorization: `Bearer ${token}` }
//         });
//         if (fallbackResponse.data.success) {
//           const activeLines = (fallbackResponse.data.data || []).filter(line => line.is_active === true);
//           setAssemblyLines(activeLines);
//         }
//       } catch (fallbackErr) {
//         console.error('Error fetching assembly lines (fallback):', fallbackErr);
//       }
//     } finally {
//       setLoadingAssemblyLines(false);
//     }
//   }, []);

//   // Fetch data when dialog opens
//   useEffect(() => {
//     if (open) {
//       fetchCustomers();
//       fetchSalesOrders();
//       fetchBOMs();
//       fetchRoutings();
//       fetchMrpRuns();
//       fetchItems();
//       fetchAssemblyLines();
//     }
//   }, [open, fetchCustomers, fetchSalesOrders, fetchBOMs, fetchRoutings, fetchMrpRuns, fetchItems, fetchAssemblyLines]);

//   // Reset active step when dialog opens/closes
//   useEffect(() => {
//     if (!open) {
//       setActiveStep(0);
//     }
//   }, [open]);

//   // Handlers for inline forms
//   const handleCustomerAdded = (newCustomer) => {
//     setCustomers(prev => [newCustomer, ...prev]);
//     setSelectedSO(newCustomer);
//     setFormData(prev => ({ ...prev, so_id: newCustomer._id }));
//     setShowCustomerForm(false);
//   };

//   const handleItemAdded = (newItem) => {
//     setItems(prev => [newItem, ...prev]);
//     setSelectedItem(newItem);
//     setFormData(prev => ({ ...prev, item_id: newItem._id }));
//     setShowItemForm(false);
//   };

//   const handleBomAdded = (newBom) => {
//     setBoms(prev => [newBom, ...prev]);
//     setFormData(prev => ({ ...prev, bom_id: newBom._id }));
//     setShowBomForm(false);
//   };

//   const handleRoutingAdded = (newRouting) => {
//     setRoutings(prev => [newRouting, ...prev]);
//     setFormData(prev => ({ ...prev, routing_id: newRouting._id }));
//     setShowRoutingForm(false);
//   };

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData(prev => ({ ...prev, [name]: value }));
//     setFieldErrors(prev => ({ ...prev, [name]: '' }));
    
//     if (name === 'wo_type' && !['Assembly', 'SubAssembly'].includes(value)) {
//       setFormData(prev => ({ ...prev, assembly_line: '' }));
//     }
//   };

//   const handleSOChange = (event, newValue) => {
//     setSelectedSO(newValue);
//     setFormData(prev => ({
//       ...prev,
//       so_id: newValue?._id || '',
//       so_item_id: ''
//     }));
//     setSelectedSOItem(null);
//     setFieldErrors(prev => ({ ...prev, so_id: '' }));
//   };

//   const handleSOItemChange = (event, newValue) => {
//     setSelectedSOItem(newValue);
//     setFormData(prev => ({
//       ...prev,
//       so_item_id: newValue?._id || ''
//     }));
//     setFieldErrors(prev => ({ ...prev, so_item_id: '' }));
//   };

//   const handleItemChange = (event, newValue) => {
//     setSelectedItem(newValue);
//     setFormData(prev => ({
//       ...prev,
//       item_id: newValue?._id || ''
//     }));
//     setFieldErrors(prev => ({ ...prev, item_id: '' }));
//   };

//   const handleAssemblyLineChange = (event, newValue) => {
//     setFormData(prev => ({
//       ...prev,
//       assembly_line: newValue?._id || ''
//     }));
//   };

//   // Validate Step 1 (Production Details)
//   const validateStep1 = () => {
//     const errors = {};
//     let isValid = true;
//     let errorMessages = [];

//     if (!formData.so_id) {
//       errors.so_id = 'Sales Order is required';
//       errorMessages.push('Sales Order is required');
//       isValid = false;
//     }
    
//     const hasMultipleItems = selectedSO && selectedSO.items && selectedSO.items.length > 1;
//     if (hasMultipleItems && !formData.so_item_id) {
//       errors.so_item_id = 'Please select an SO item';
//       errorMessages.push('Please select an SO item');
//       isValid = false;
//     }
    
//     if (!formData.item_id) {
//       errors.item_id = 'Item is required';
//       errorMessages.push('Item is required');
//       isValid = false;
//     }
//     if (!formData.bom_id) {
//       errors.bom_id = 'BOM is required';
//       errorMessages.push('BOM is required');
//       isValid = false;
//     }
//     if (!formData.routing_id) {
//       errors.routing_id = 'Routing is required';
//       errorMessages.push('Routing is required');
//       isValid = false;
//     }

//     setFieldErrors(errors);
//     if (!isValid) {
//       showError(errorMessages[0]);
//     }
//     return isValid;
//   };

//   // Validate Step 2 (Planning & Settings)
//   const validateStep2 = () => {
//     const errors = {};
//     let isValid = true;
//     let errorMessages = [];

//     if (!formData.planned_qty || formData.planned_qty <= 0) {
//       errors.planned_qty = 'Valid planned quantity is required';
//       errorMessages.push('Valid planned quantity is required');
//       isValid = false;
//     }
//     if (!formData.planned_start) {
//       errors.planned_start = 'Planned start date is required';
//       errorMessages.push('Planned start date is required');
//       isValid = false;
//     }
//     if (!formData.planned_end) {
//       errors.planned_end = 'Planned end date is required';
//       errorMessages.push('Planned end date is required');
//       isValid = false;
//     }

//     setFieldErrors(errors);
//     if (!isValid) {
//       showError(errorMessages[0]);
//     }
//     return isValid;
//   };

//   const handleNext = () => {
//     if (validateStep1()) {
//       setActiveStep(1);
//     }
//   };

//   const handleBack = () => {
//     setActiveStep(0);
//   };

//   const validateForm = () => {
//     const step1Valid = validateStep1();
//     const step2Valid = validateStep2();
//     return step1Valid && step2Valid;
//   };

//   const handleSubmit = async () => {
//     if (!validateForm()) return;

//     setLoading(true);
//     setError('');

//     try {
//       const token = localStorage.getItem('token');
//       const submitData = {
//         so_id: formData.so_id,
//         so_item_id: formData.so_item_id || undefined,
//         item_id: formData.item_id,
//         bom_id: formData.bom_id,
//         routing_id: formData.routing_id,
//         planned_qty: Number(formData.planned_qty),
//         planned_start: formData.planned_start,
//         planned_end: formData.planned_end,
//         required_by: formData.required_by || formData.planned_end,
//         priority: formData.priority,
//         wo_type: formData.wo_type,
//         assembly_line: showAssemblyLine ? (formData.assembly_line || undefined) : undefined,
//         serial_tracking: formData.serial_tracking,
//         mrp_run_id: formData.mrp_run_id || undefined
//       };

//       const response = await axios.post(`${BASE_URL}/api/work-orders`, submitData, {
//         headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
//       });

//       if (response.data.success) {
//         onAdd(response.data.data);
//         resetForm();
//         onClose();
//       } else {
//         showError(response.data.message || 'Failed to create work order');
//       }
//     } catch (err) {
//       console.error('Error creating work order:', err);
//       showError(err.response?.data?.message || 'Failed to create work order');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const resetForm = () => {
//     setFormData({
//       so_id: '',
//       so_item_id: '',
//       item_id: '',
//       bom_id: '',
//       routing_id: '',
//       planned_qty: '',
//       planned_start: '',
//       planned_end: '',
//       required_by: '',
//       priority: 'Medium',
//       wo_type: 'Machining',
//       assembly_line: '',
//       serial_tracking: false,
//       mrp_run_id: ''
//     });
//     setSelectedSO(null);
//     setSelectedSOItem(null);
//     setSelectedItem(null);
//     setFieldErrors({});
//     setError('');
//     setActiveStep(0);
//     setShowCustomerForm(false);
//     setShowItemForm(false);
//     setShowBomForm(false);
//     setShowRoutingForm(false);
//   };

//   const handleClose = () => {
//     resetForm();
//     onClose();
//   };

//   const availableSOItems = selectedSO?.items || [];
//   const hasMultipleSOItems = availableSOItems.length > 1;

//   const getSelectedAssemblyLine = () => {
//     return assemblyLines.find(al => al._id === formData.assembly_line) || null;
//   };

//   const getAssemblyLineLabel = (option) => {
//     return `${option.line_code} - ${option.line_name} (${option.line_type})`;
//   };

//   // Label component
//   const Label = ({ children, required }) => (
//     <Typography sx={{ 
//       fontSize: '0.7rem', 
//       fontWeight: 600, 
//       color: COLORS.text.secondary, 
//       letterSpacing: '0.5px' 
//     }}>
//       {children} {required && <span style={{ color: '#EF4444' }}>*</span>}
//     </Typography>
//   );

//   // Render Step 1 Content
//   const renderStep1Content = () => (
//     <Stack spacing={2}>
//       {/* Sales Order Selection */}
//       <Paper sx={{ p: 2, borderRadius: 1.5, border: `1px solid ${COLORS.border}`, boxShadow: 'none' }}>
//         <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color: COLORS.primary, mb: 1.5 }}>
//           <InventoryIcon sx={{ fontSize: '1rem', mr: 0.5, verticalAlign: 'middle' }} />
//           Sales Order Details
//         </Typography>

//         <Grid container spacing={1.5}>
//           <Grid size={{ xs: 12 }}>
//             <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//               <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
//                 <Label required>CUSTOMER / SALES ORDER</Label>
//                 <Button
//                   size="small"
//                   onClick={() => setShowCustomerForm(true)}
//                   startIcon={<PersonAddIcon sx={{ fontSize: '0.8rem' }} />}
//                   sx={{
//                     height: 24,
//                     px: 1.5,
//                     borderRadius: 1,
//                     color: COLORS.primary,
//                     fontSize: '0.6rem',
//                     fontWeight: 500,
//                     textTransform: 'none',
//                     '&:hover': { bgcolor: COLORS.primaryLight }
//                   }}
//                 >
//                   Add Customer
//                 </Button>
//               </Box>
//               <Autocomplete
//                 fullWidth
//                 options={salesOrders}
//                 getOptionLabel={(option) => `${option.so_number} - ${option.customer_name}`}
//                 value={selectedSO}
//                 onChange={handleSOChange}
//                 loading={loadingSO}
//                 renderInput={(params) => (
//                   <TextField
//                     {...params}
//                     size="small"
//                     placeholder="Select sales order"
//                     error={!!fieldErrors.so_id}
//                     helperText={fieldErrors.so_id}
//                     sx={{
//                       '& .MuiOutlinedInput-root': {
//                         borderRadius: 1.5,
//                         fontSize: '0.75rem',
//                         '&:hover fieldset': { borderColor: COLORS.primary },
//                         '&.Mui-error fieldset': { borderColor: '#EF4444' }
//                       }
//                     }}
//                   />
//                 )}
//               />
//             </Box>
//           </Grid>

//           {hasMultipleSOItems && (
//             <Grid size={{ xs: 12 }}>
//               <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//                 <Label required>SO ITEM</Label>
//                 <Autocomplete
//                   fullWidth
//                   options={availableSOItems}
//                   getOptionLabel={(option) => `${option.part_no} - ${option.part_name} (Qty: ${option.ordered_qty})`}
//                   value={selectedSOItem}
//                   onChange={handleSOItemChange}
//                   disabled={!selectedSO}
//                   loading={loadingSO}
//                   renderInput={(params) => (
//                     <TextField
//                       {...params}
//                       size="small"
//                       placeholder={selectedSO ? "Select SO item" : "Select sales order first"}
//                       error={!!fieldErrors.so_item_id}
//                       helperText={fieldErrors.so_item_id}
//                       sx={{
//                         '& .MuiOutlinedInput-root': {
//                           borderRadius: 1.5,
//                           fontSize: '0.75rem',
//                           '&:hover fieldset': { borderColor: COLORS.primary },
//                           '&.Mui-error fieldset': { borderColor: '#EF4444' }
//                         }
//                       }}
//                     />
//                   )}
//                 />
//               </Box>
//             </Grid>
//           )}

//           {selectedSO && !hasMultipleSOItems && availableSOItems.length === 1 && (
//             <Grid size={{ xs: 12 }}>
//               <Box sx={{ 
//                 p: 1, 
//                 bgcolor: COLORS.primaryLight, 
//                 borderRadius: 1.5,
//                 border: `1px solid ${COLORS.primary}20`
//               }}>
//                 <Typography sx={{ fontSize: '0.7rem', color: COLORS.text.secondary }}>
//                   SO Item (Auto-selected):
//                 </Typography>
//                 <Typography sx={{ fontSize: '0.75rem', fontWeight: 500, color: COLORS.text.primary }}>
//                   {availableSOItems[0]?.part_no} - {availableSOItems[0]?.part_name}
//                 </Typography>
//               </Box>
//             </Grid>
//           )}
//         </Grid>
//       </Paper>

//       {/* Inline Customer Form */}
//       {showCustomerForm && (
//         <InlineCustomerForm
//           onSave={handleCustomerAdded}
//           onCancel={() => setShowCustomerForm(false)}
//         />
//       )}

//       {/* Item Master Selection */}
//       <Paper sx={{ p: 2, borderRadius: 1.5, border: `1px solid ${COLORS.border}`, boxShadow: 'none' }}>
//         <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color: COLORS.primary, mb: 1.5 }}>
//           <ProductionIcon sx={{ fontSize: '1rem', mr: 0.5, verticalAlign: 'middle' }} />
//           Item Details
//         </Typography>

//         <Grid container spacing={1.5}>
//           <Grid size={{ xs: 12 }}>
//             <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//               <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
//                 <Label required>ITEM</Label>
//                 <Button
//                   size="small"
//                   onClick={() => setShowItemForm(true)}
//                   startIcon={<AddIcon sx={{ fontSize: '0.8rem' }} />}
//                   sx={{
//                     height: 24,
//                     px: 1.5,
//                     borderRadius: 1,
//                     color: COLORS.primary,
//                     fontSize: '0.6rem',
//                     fontWeight: 500,
//                     textTransform: 'none',
//                     '&:hover': { bgcolor: COLORS.primaryLight }
//                   }}
//                 >
//                   Add New
//                 </Button>
//               </Box>
//               <Autocomplete
//                 fullWidth
//                 options={items}
//                 getOptionLabel={(option) => `${option.part_no} - ${option.part_description || option.part_name} (${option.item_category || 'N/A'})`}
//                 value={selectedItem}
//                 onChange={handleItemChange}
//                 loading={loadingItems}
//                 renderInput={(params) => (
//                   <TextField
//                     {...params}
//                     size="small"
//                     placeholder="Select item"
//                     error={!!fieldErrors.item_id}
//                     helperText={fieldErrors.item_id}
//                     sx={{
//                       '& .MuiOutlinedInput-root': {
//                         borderRadius: 1.5,
//                         fontSize: '0.75rem',
//                         '&:hover fieldset': { borderColor: COLORS.primary },
//                         '&.Mui-error fieldset': { borderColor: '#EF4444' }
//                       }
//                     }}
//                   />
//                 )}
//               />
//             </Box>
//           </Grid>
//         </Grid>
//       </Paper>

//       {/* Inline Item Form */}
//       {showItemForm && (
//         <InlineItemForm
//           onSave={handleItemAdded}
//           onCancel={() => setShowItemForm(false)}
//         />
//       )}

//       {/* BOM & Routing */}
//       <Paper sx={{ p: 2, borderRadius: 1.5, border: `1px solid ${COLORS.border}`, boxShadow: 'none' }}>
//         <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color: COLORS.primary, mb: 1.5 }}>
//           Production Specifications
//         </Typography>

//         <Grid container spacing={1.5}>
//           <Grid size={{ xs: 12, sm: 6 }}>
//             <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//               <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
//                 <Label required>BOM</Label>
//                 <Button
//                   size="small"
//                   onClick={() => setShowBomForm(true)}
//                   startIcon={<AddIcon sx={{ fontSize: '0.8rem' }} />}
//                   sx={{
//                     height: 24,
//                     px: 1.5,
//                     borderRadius: 1,
//                     color: COLORS.primary,
//                     fontSize: '0.6rem',
//                     fontWeight: 500,
//                     textTransform: 'none',
//                     '&:hover': { bgcolor: COLORS.primaryLight }
//                   }}
//                 >
//                   Add New
//                 </Button>
//               </Box>
//               <Autocomplete
//                 fullWidth
//                 options={boms}
//                 getOptionLabel={(option) => `${option.bom_id} - ${option.parent_part_no} (v${option.bom_version})`}
//                 value={boms.find(b => b._id === formData.bom_id) || null}
//                 onChange={(event, newValue) => {
//                   setFormData(prev => ({ ...prev, bom_id: newValue?._id || '' }));
//                   setFieldErrors(prev => ({ ...prev, bom_id: '' }));
//                 }}
//                 loading={loadingBOM}
//                 renderInput={(params) => (
//                   <TextField
//                     {...params}
//                     size="small"
//                     placeholder="Select BOM"
//                     error={!!fieldErrors.bom_id}
//                     helperText={fieldErrors.bom_id}
//                     sx={{
//                       '& .MuiOutlinedInput-root': {
//                         borderRadius: 1.5,
//                         fontSize: '0.75rem',
//                         '&:hover fieldset': { borderColor: COLORS.primary },
//                         '&.Mui-error fieldset': { borderColor: '#EF4444' }
//                       }
//                     }}
//                   />
//                 )}
//               />
//             </Box>
//           </Grid>

//           <Grid size={{ xs: 12, sm: 6 }}>
//             <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//               <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
//                 <Label required>ROUTING</Label>
//                 <Button
//                   size="small"
//                   onClick={() => setShowRoutingForm(true)}
//                   startIcon={<AddIcon sx={{ fontSize: '0.8rem' }} />}
//                   sx={{
//                     height: 24,
//                     px: 1.5,
//                     borderRadius: 1,
//                     color: COLORS.primary,
//                     fontSize: '0.6rem',
//                     fontWeight: 500,
//                     textTransform: 'none',
//                     '&:hover': { bgcolor: COLORS.primaryLight }
//                   }}
//                 >
//                   Add New
//                 </Button>
//               </Box>
//               <Autocomplete
//                 fullWidth
//                 options={routings}
//                 getOptionLabel={(option) => `${option.routing_id} - ${option.routing_name}`}
//                 value={routings.find(r => r._id === formData.routing_id) || null}
//                 onChange={(event, newValue) => {
//                   setFormData(prev => ({ ...prev, routing_id: newValue?._id || '' }));
//                   setFieldErrors(prev => ({ ...prev, routing_id: '' }));
//                 }}
//                 loading={loadingRouting}
//                 renderInput={(params) => (
//                   <TextField
//                     {...params}
//                     size="small"
//                     placeholder="Select routing"
//                     error={!!fieldErrors.routing_id}
//                     helperText={fieldErrors.routing_id}
//                     sx={{
//                       '& .MuiOutlinedInput-root': {
//                         borderRadius: 1.5,
//                         fontSize: '0.75rem',
//                         '&:hover fieldset': { borderColor: COLORS.primary },
//                         '&.Mui-error fieldset': { borderColor: '#EF4444' }
//                       }
//                     }}
//                   />
//                 )}
//               />
//             </Box>
//           </Grid>
//         </Grid>
//       </Paper>

//       {/* Inline BOM Form */}
//       {showBomForm && (
//         <InlineBomForm
//           onSave={handleBomAdded}
//           onCancel={() => setShowBomForm(false)}
//         />
//       )}

//       {/* Inline Routing Form */}
//       {showRoutingForm && (
//         <InlineRoutingForm
//           onSave={handleRoutingAdded}
//           onCancel={() => setShowRoutingForm(false)}
//         />
//       )}
//     </Stack>
//   );

//   // Render Step 2 Content
//   const renderStep2Content = () => (
//     <Stack spacing={2}>
//       <Paper sx={{ p: 2, borderRadius: 1.5, border: `1px solid ${COLORS.border}`, boxShadow: 'none' }}>
//         <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color: COLORS.primary, mb: 1.5 }}>
//           <EventIcon sx={{ fontSize: '1rem', mr: 0.5, verticalAlign: 'middle' }} />
//           Planning Details
//         </Typography>

//         <Grid container spacing={1.5}>
//           <Grid size={{ xs: 12, sm: 6 }}>
//             <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//               <Label required>PLANNED QUANTITY</Label>
//               <TextField
//                 fullWidth
//                 type="number"
//                 size="small"
//                 name="planned_qty"
//                 value={formData.planned_qty}
//                 onChange={handleChange}
//                 placeholder="e.g., 500"
//                 error={!!fieldErrors.planned_qty}
//                 helperText={fieldErrors.planned_qty}
//                 sx={{
//                   '& .MuiOutlinedInput-root': {
//                     borderRadius: 1.5,
//                     fontSize: '0.75rem',
//                     '&:hover fieldset': { borderColor: COLORS.primary },
//                     '&.Mui-error fieldset': { borderColor: '#EF4444' }
//                   }
//                 }}
//               />
//             </Box>
//           </Grid>

//           <Grid size={{ xs: 12, sm: 6 }}>
//             <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//               <Label>WORK ORDER TYPE</Label>
//               <FormControl fullWidth size="small">
//                 <Select
//                   name="wo_type"
//                   value={formData.wo_type}
//                   onChange={handleChange}
//                   sx={{
//                     borderRadius: 1.5,
//                     fontSize: '0.75rem',
//                     '& .MuiSelect-select': { py: 1, px: 1.5 }
//                   }}
//                 >
//                   {WO_TYPE_OPTIONS.map(option => (
//                     <MenuItem key={option} value={option} sx={{ fontSize: '0.75rem' }}>
//                       {option}
//                     </MenuItem>
//                   ))}
//                 </Select>
//               </FormControl>
//             </Box>
//           </Grid>

//           <Grid size={{ xs: 12, sm: 4 }}>
//             <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//               <Label required>PLANNED START</Label>
//               <TextField
//                 fullWidth
//                 type="date"
//                 size="small"
//                 name="planned_start"
//                 value={formData.planned_start}
//                 onChange={handleChange}
//                 error={!!fieldErrors.planned_start}
//                 helperText={fieldErrors.planned_start}
//                 InputLabelProps={{ shrink: true }}
//                 sx={{
//                   '& .MuiOutlinedInput-root': {
//                     borderRadius: 1.5,
//                     fontSize: '0.75rem',
//                     '&:hover fieldset': { borderColor: COLORS.primary },
//                     '&.Mui-error fieldset': { borderColor: '#EF4444' }
//                   },
//                   '& .MuiInputBase-input': { py: 1, px: 1.5, fontSize: '0.75rem' }
//                 }}
//               />
//             </Box>
//           </Grid>

//           <Grid size={{ xs: 12, sm: 4 }}>
//             <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//               <Label required>PLANNED END</Label>
//               <TextField
//                 fullWidth
//                 type="date"
//                 size="small"
//                 name="planned_end"
//                 value={formData.planned_end}
//                 onChange={handleChange}
//                 error={!!fieldErrors.planned_end}
//                 helperText={fieldErrors.planned_end}
//                 InputLabelProps={{ shrink: true }}
//                 sx={{
//                   '& .MuiOutlinedInput-root': {
//                     borderRadius: 1.5,
//                     fontSize: '0.75rem',
//                     '&:hover fieldset': { borderColor: COLORS.primary },
//                     '&.Mui-error fieldset': { borderColor: '#EF4444' }
//                   },
//                   '& .MuiInputBase-input': { py: 1, px: 1.5, fontSize: '0.75rem' }
//                 }}
//               />
//             </Box>
//           </Grid>

//           <Grid size={{ xs: 12, sm: 4 }}>
//             <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//               <Label>REQUIRED BY</Label>
//               <TextField
//                 fullWidth
//                 type="date"
//                 size="small"
//                 name="required_by"
//                 value={formData.required_by}
//                 onChange={handleChange}
//                 InputLabelProps={{ shrink: true }}
//                 sx={{
//                   '& .MuiOutlinedInput-root': {
//                     borderRadius: 1.5,
//                     fontSize: '0.75rem',
//                     '&:hover fieldset': { borderColor: COLORS.primary }
//                   },
//                   '& .MuiInputBase-input': { py: 1, px: 1.5, fontSize: '0.75rem' }
//                 }}
//               />
//             </Box>
//           </Grid>
//         </Grid>
//       </Paper>

//       <Paper sx={{ p: 2, borderRadius: 1.5, border: `1px solid ${COLORS.border}`, boxShadow: 'none' }}>
//         <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color: COLORS.primary, mb: 1.5 }}>
//           <SettingsIcon sx={{ fontSize: '1rem', mr: 0.5, verticalAlign: 'middle' }} />
//           Additional Settings
//         </Typography>

//         <Grid container spacing={1.5}>
//           <Grid size={{ xs: 12, sm: showAssemblyLine ? 6 : 12 }}>
//             <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//               <Label>PRIORITY</Label>
//               <FormControl fullWidth size="small">
//                 <Select
//                   name="priority"
//                   value={formData.priority}
//                   onChange={handleChange}
//                   sx={{
//                     borderRadius: 1.5,
//                     fontSize: '0.75rem',
//                     '& .MuiSelect-select': { py: 1, px: 1.5 }
//                   }}
//                 >
//                   {PRIORITY_OPTIONS.map(option => (
//                     <MenuItem key={option} value={option} sx={{ fontSize: '0.75rem' }}>
//                       {option}
//                     </MenuItem>
//                   ))}
//                 </Select>
//               </FormControl>
//             </Box>
//           </Grid>

//           {showAssemblyLine && (
//             <Grid size={{ xs: 12, sm: 6 }}>
//               <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//                 <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
//                   <Label>ASSEMBLY LINE</Label>
//                   <Tooltip title="Add New Assembly Line">
//                     <IconButton
//                       size="small"
//                       onClick={() => setAddAssemblyOpen(true)}
//                       sx={{
//                         color: COLORS.primary,
//                         p: 0.25,
//                         '&:hover': { bgcolor: COLORS.primaryLight }
//                       }}
//                     >
//                       <AddIcon sx={{ fontSize: '0.8rem' }} />
//                     </IconButton>
//                   </Tooltip>
//                 </Box>
//                 <Autocomplete
//                   fullWidth
//                   options={assemblyLines}
//                   getOptionLabel={getAssemblyLineLabel}
//                   value={getSelectedAssemblyLine()}
//                   onChange={handleAssemblyLineChange}
//                   loading={loadingAssemblyLines}
//                   renderInput={(params) => (
//                     <TextField
//                       {...params}
//                       size="small"
//                       placeholder={loadingAssemblyLines ? "Loading assembly lines..." : "Select assembly line (optional)"}
//                       sx={{
//                         '& .MuiOutlinedInput-root': {
//                           borderRadius: 1.5,
//                           fontSize: '0.75rem',
//                           '&:hover fieldset': { borderColor: COLORS.primary }
//                         },
//                         '& .MuiInputBase-input': { py: 1, px: 1.5, fontSize: '0.75rem' }
//                       }}
//                     />
//                   )}
//                   noOptionsText="No assembly lines found"
//                   loadingText="Loading assembly lines..."
//                 />
//                 <Typography sx={{ fontSize: '0.6rem', color: COLORS.text.tertiary }}>
//                   Select the assembly line where this work order will be processed
//                 </Typography>
//               </Box>
//             </Grid>
//           )}

//           <Grid size={{ xs: 12 }}>
//             <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//               <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
//                 <Label>MRP RUN ID</Label>
//                 <Tooltip title="Add New MRP Run">
//                   <IconButton
//                     size="small"
//                     onClick={() => setAddMrpRunOpen(true)}
//                     sx={{
//                       color: COLORS.primary,
//                       p: 0.25,
//                       '&:hover': { bgcolor: COLORS.primaryLight }
//                     }}
//                   >
//                     <AddIcon sx={{ fontSize: '0.8rem' }} />
//                   </IconButton>
//                 </Tooltip>
//               </Box>
//               <Autocomplete
//                 fullWidth
//                 options={mrpRuns}
//                 getOptionLabel={(option) => `${option.mrp_run_id} - ${option.run_type} (${new Date(option.run_date).toLocaleDateString()})`}
//                 value={mrpRuns.find(m => m._id === formData.mrp_run_id) || null}
//                 onChange={(event, newValue) => {
//                   setFormData(prev => ({ ...prev, mrp_run_id: newValue?._id || '' }));
//                 }}
//                 loading={loadingMRP}
//                 renderInput={(params) => (
//                   <TextField
//                     {...params}
//                     size="small"
//                     placeholder="Select MRP run (optional)"
//                     sx={{
//                       '& .MuiOutlinedInput-root': {
//                         borderRadius: 1.5,
//                         fontSize: '0.75rem',
//                         '&:hover fieldset': { borderColor: COLORS.primary }
//                       }
//                     }}
//                   />
//                 )}
//               />
//             </Box>
//           </Grid>
//         </Grid>
//       </Paper>
//     </Stack>
//   );

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
//             overflow: 'hidden'
//           }
//         }}
//       >
//         <DialogTitle sx={{
//           borderBottom: `1px solid ${COLORS.border}`,
//           py: 1.5,
//           px: 2.5,
//           mb: 0,
//           bgcolor: COLORS.background.white        }}>
//           <Typography sx={{ fontSize: '1.2rem', fontWeight: 700, color: COLORS.text.primary }}>
//             Add New Work Order
//           </Typography>
//         </DialogTitle>

//         <Box sx={{ px: 2.5, pt: 1 }}>
//           <FloatingErrorAlert error={error} onClose={() => setError('')} />
//         </Box>

//         <Box sx={{ px: 2.5, pt: error ? 1 : 2, bgcolor: COLORS.background.white }}>
//           <Stepper activeStep={activeStep} alternativeLabel connector={<ColorConnector />}>
//             {steps.map((label, index) => (
//               <Step key={label}>
//                 <StepLabel>
//                   <Typography sx={{ fontSize: '0.75rem', fontWeight: 500, color: COLORS.text.secondary }}>
//                     {index + 1}. {label}
//                   </Typography>
//                 </StepLabel>
//               </Step>
//             ))}
//           </Stepper>
//         </Box>

//         <DialogContent sx={{ p: 2.5, pt: error ? 1 : 2 }}>
//           {activeStep === 0 ? renderStep1Content() : renderStep2Content()}
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
//                 {loading ? 'Creating...' : 'Create Work Order'}
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
//     </>
//   );
// };

// export default AddWorkOrder;




import React, { useState, useEffect, useCallback } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, TextField, Alert, Typography, Box, Stack, Grid,
  Autocomplete, FormControl, Select, MenuItem, Paper, IconButton, Tooltip,
  Stepper, Step, StepLabel, StepConnector, stepConnectorClasses, styled,
  Collapse, InputAdornment, Divider, CircularProgress, Chip,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  FormControlLabel, Checkbox, Switch
} from '@mui/material';
import { 
  Add as AddIcon, 
  Inventory as InventoryIcon, 
  NavigateNext as NavigateNextIcon, 
  NavigateBefore as NavigateBeforeIcon,
  ProductionQuantityLimits as ProductionIcon,
  Event as EventIcon,
  Settings as SettingsIcon, 
  Error as ErrorIcon, 
  Close as CloseIcon,
 
  PersonAdd as PersonAddIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Assignment as AssignmentIcon,
  Route as RouteIcon,
  Build as BuildIcon,
  Info as InfoIcon,
  Search as SearchIcon,
  Delete as DeleteIcon,
  Science as ScienceIcon,
  Bolt as BoltIcon,
  CheckCircle as CheckCircleIcon,
  Business as BusinessIcon,
  LocalShipping as ShippingIcon,
  AttachMoney as MoneyIcon
} from '@mui/icons-material';
import axios from 'axios';
import BASE_URL from '../../../config/Config';

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
    gray: '#F7F8FA'
  },
  border: '#E3E8EF'
};


const CURRENCY_OPTIONS = ['INR', 'USD', 'EUR', 'GBP', 'AED'];
const DELIVERY_TERMS_OPTIONS = ['Ex-Works', 'FOR Destination', 'CIF', 'FOB', ''];
const DELIVERY_MODE_OPTIONS = ['Road', 'Rail', 'Air', 'Sea', 'Hand Delivery', ''];
const UNIT_OPTIONS = ['Nos', 'Kg', 'Meter', 'Set', 'Piece'];


const PRIORITY_OPTIONS = ['Critical', 'High', 'Medium', 'Low'];
const WO_TYPE_OPTIONS = ['Machining', 'Assembly', 'SubAssembly', 'Kit'];
const CUSTOMER_TYPE_OPTIONS = ['OEM', 'Distributor', 'Retailer', 'Corporate', 'Individual'];
const PRIORITY_OPTIONS_CUSTOMER = ['Regular', 'High', 'Low', 'Critical'];
const INDUSTRY_SEGMENT_OPTIONS = ['Automotive', 'Electronics', 'Pharmaceutical', 'Manufacturing', 'IT', 'FMCG', 'Other'];

// BOM Options
const BOM_TYPE_OPTIONS = ['Manufacturing', 'Subcontract', 'Phantom', 'Variant'];
const STATUS_OPTIONS = ['Pending', 'Active', 'Approved', 'Cancelled', 'Archived'];
//const UNIT_OPTIONS = ['Nos', 'Kg', 'Meter', 'Set', 'Piece', 'Sheet', 'Roll'];
const UNIT_OPTIONS_BOM = ['Nos', 'Kg', 'Meter', 'Set', 'Piece', 'Sheet', 'Roll'];
const BOM_CATEGORY_OPTIONS = ['Standard', 'Assembly'];
const ITEM_CATEGORY_OPTIONS = ['Raw Material', 'Semi-Finished', 'Finished', 'Spare Part'];
const ITEM_TYPE_OPTIONS = ['Busbar', 'Stamping', 'Gasket', 'Tooling', 'Copper Strip', 'Aluminium Profile', 'Rubber Sheet', 'Cork', 'Other'];
const PROCUREMENT_TYPE_OPTIONS = ['Purchase', 'Manufacture', 'Subcontract', 'Free Issue'];

// Routing Options
const ROUTING_TYPE_OPTIONS = ['Stamping', 'Busbar', 'Gasket', 'Assembly', 'Toolroom', 'General'];

// Item Options for InlineItemForm
const itemCategoryOptions = ['Raw Material', 'Semi-Finished', 'Finished Good', 'Consumable', 'Tool', 'Bought-Out', 'Subcontract'];
const itemTypeOptions = ['Busbar', 'Stamping', 'Gasket', 'Tooling', 'Copper Strip', 'Aluminium Profile', 'Rubber Sheet', 'Cork', 'Other'];
const unitOptions = ['Nos', 'Kg', 'Meter', 'Set', 'Piece', 'Sheet', 'Roll'];
const procurementTypeOptions = ['Manufacture', 'Purchase', 'Subcontract', 'Free Issue'];
const rmTypeOptions = ['Strip', 'Profile', 'Sheet', 'Wire', 'Tube', 'Compound', 'Bar', 'Rod', 'Coil'];
const materialOptions = ['Steel', 'Copper', 'Aluminium', 'Brass', 'Stainless Steel', 'Plastic', 'Other'];

// Floating Error Alert Component
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
          '& .MuiAlert-icon': {
            fontSize: '1rem',
            alignItems: 'center'
          },
          '& .MuiAlert-message': {
            py: 0.5,
            fontSize: '0.75rem'
          },
          '& .MuiAlert-action': {
            py: 0,
            alignItems: 'center'
          }
        }}
      >
        {error}
      </Alert>
    </Collapse>
  );
};

// Modern Stepper Connector
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

const steps = ['Production Details', 'Planning & Settings'];
const CUSTOMER_STEPS = ['Basic Information', 'Address & Contacts', 'Financial & Bank', 'Actions'];
const ITEM_STEPS = ['Basic Info', 'Material & Drawing', 'Process Details', 'Rate & Tax'];
const BOM_MAIN_STEPS = ['Basic Information', 'Production Parameters', 'Components', 'Review & Submit'];
const PARENT_ITEM_STEPS = ['Basic Info', 'Material & Drawing', 'Dimensions & Parameters', 'Rates & Inventory'];
const ROUTING_STEPS = ['Basic Information', 'Operations', 'Review & Submit'];

// ============================================
// INLINE CUSTOMER FORM (Full Stepper)
// ============================================
// const InlineCustomerForm = ({ onSave, onCancel }) => {
//   const [customerActiveStep, setCustomerActiveStep] = useState(0);
//   const [customerFormLoading, setCustomerFormLoading] = useState(false);
//   const [customerFormError, setCustomerFormError] = useState('');
//   const [customerFormData, setCustomerFormData] = useState({
//     customer_code: '',
//     customer_name: '',
//     customer_type: 'OEM',
//     priority: 'Regular',
//     industry_segment: '',
//     gstin: '',
//     pan: '',
//     address_line1: '',
//     address_line2: '',
//     city: '',
//     state: '',
//     pincode: '',
//     country: 'India',
//     contact_person: '',
//     email: '',
//     phone: '',
//     mobile: '',
//     credit_limit: 0,
//     credit_days: 30,
//     payment_terms: '',
//     bank_name: '',
//     account_number: '',
//     ifsc_code: '',
//     branch_name: '',
//     upi_id: ''
//   });
//   const [customerFormErrors, setCustomerFormErrors] = useState({});

//   const handleCustomerFormChange = (e) => {
//     const { name, value } = e.target;
//     setCustomerFormData(prev => ({ ...prev, [name]: value }));
//     setCustomerFormErrors(prev => ({ ...prev, [name]: '' }));
//   };

//   const validateCustomerStep = (step) => {
//     const errors = {};
//     let isValid = true;

//     switch (step) {
//       case 0:
//         if (!customerFormData.customer_code.trim()) {
//           errors.customer_code = 'Customer code is required';
//           isValid = false;
//         }
//         if (!customerFormData.customer_name.trim()) {
//           errors.customer_name = 'Customer name is required';
//           isValid = false;
//         }
//         if (!customerFormData.customer_type) {
//           errors.customer_type = 'Customer type is required';
//           isValid = false;
//         }
//         if (!customerFormData.priority) {
//           errors.priority = 'Priority is required';
//           isValid = false;
//         }
//         if (!customerFormData.gstin.trim()) {
//           errors.gstin = 'GSTIN is required';
//           isValid = false;
//         } else if (!/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(customerFormData.gstin)) {
//           errors.gstin = 'Invalid GSTIN format';
//           isValid = false;
//         }
//         if (!customerFormData.pan.trim()) {
//           errors.pan = 'PAN is required';
//           isValid = false;
//         } else if (!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(customerFormData.pan)) {
//           errors.pan = 'Invalid PAN format';
//           isValid = false;
//         }
//         break;
//       case 1:
//         if (!customerFormData.address_line1.trim()) {
//           errors.address_line1 = 'Address is required';
//           isValid = false;
//         }
//         if (!customerFormData.city.trim()) {
//           errors.city = 'City is required';
//           isValid = false;
//         }
//         if (!customerFormData.state.trim()) {
//           errors.state = 'State is required';
//           isValid = false;
//         }
//         if (!customerFormData.pincode.trim()) {
//           errors.pincode = 'Pincode is required';
//           isValid = false;
//         }
//         if (!customerFormData.contact_person.trim()) {
//           errors.contact_person = 'Contact person is required';
//           isValid = false;
//         }
//         if (!customerFormData.email.trim()) {
//           errors.email = 'Email is required';
//           isValid = false;
//         } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerFormData.email)) {
//           errors.email = 'Invalid email format';
//           isValid = false;
//         }
//         if (!customerFormData.phone.trim()) {
//           errors.phone = 'Phone is required';
//           isValid = false;
//         }
//         break;
//       case 2:
//         if (customerFormData.credit_limit < 0) {
//           errors.credit_limit = 'Credit limit must be greater than 0';
//           isValid = false;
//         }
//         if (customerFormData.credit_days < 0) {
//           errors.credit_days = 'Credit days must be greater than 0';
//           isValid = false;
//         }
//         break;
//       default:
//         break;
//     }

//     setCustomerFormErrors(errors);
//     return isValid;
//   };

//   const handleCustomerNext = () => {
//     if (validateCustomerStep(customerActiveStep)) {
//       setCustomerActiveStep(prev => prev + 1);
//     }
//   };

//   const handleCustomerBack = () => {
//     setCustomerActiveStep(prev => prev - 1);
//   };

//   const handleCustomerFormSubmit = async () => {
//     if (!validateCustomerStep(customerActiveStep)) return;

//     setCustomerFormLoading(true);
//     setCustomerFormError('');

//     try {
//       const token = localStorage.getItem('token');
//       const response = await axios.post(`${BASE_URL}/api/customers`, customerFormData, {
//         headers: {
//           'Authorization': `Bearer ${token}`,
//           'Content-Type': 'application/json'
//         }
//       });

//       if (response.data.success) {
//         onSave(response.data.data);
//       } else {
//         setCustomerFormError(response.data.message || 'Failed to add customer');
//       }
//     } catch (err) {
//       console.error('Error adding customer:', err);
//       setCustomerFormError(err.response?.data?.message || 'Failed to add customer. Please try again.');
//     } finally {
//       setCustomerFormLoading(false);
//     }
//   };

//   const resetCustomerForm = () => {
//     setCustomerFormData({
//       customer_code: '',
//       customer_name: '',
//       customer_type: 'OEM',
//       priority: 'Regular',
//       industry_segment: '',
//       gstin: '',
//       pan: '',
//       address_line1: '',
//       address_line2: '',
//       city: '',
//       state: '',
//       pincode: '',
//       country: 'India',
//       contact_person: '',
//       email: '',
//       phone: '',
//       mobile: '',
//       credit_limit: 0,
//       credit_days: 30,
//       payment_terms: '',
//       bank_name: '',
//       account_number: '',
//       ifsc_code: '',
//       branch_name: '',
//       upi_id: ''
//     });
//     setCustomerFormErrors({});
//     setCustomerActiveStep(0);
//     setCustomerFormError('');
//   };

//   const handleCancel = () => {
//     resetCustomerForm();
//     onCancel();
//   };

//   const Label = ({ children, required }) => (
//     <Typography sx={{
//       fontSize: '0.7rem',
//       fontWeight: 600,
//       color: COLORS.text.secondary,
//       letterSpacing: '0.5px'
//     }}>
//       {children} {required && <span style={{ color: '#EF4444' }}>*</span>}
//     </Typography>
//   );

//   const textFieldSx = {
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
//     },
//     '& .MuiFormHelperText-root': {
//       fontSize: '0.65rem',
//       marginLeft: 0,
//       marginTop: 0.25
//     }
//   };

//   const selectSx = {
//     borderRadius: 1.5,
//     fontSize: '0.75rem',
//     '& .MuiSelect-select': { py: 1, px: 1.5, fontSize: '0.75rem' }
//   };

//   const renderCustomerStepContent = (step) => {
//     switch (step) {
//       case 0:
//         return (
//           <Grid container spacing={2}>
//             <Grid size={{ xs: 12, sm: 6 }}>
//               <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//                 <Label required>CUSTOMER CODE</Label>
//                 <TextField
//                   fullWidth size="small" name="customer_code"
//                   value={customerFormData.customer_code}
//                   onChange={handleCustomerFormChange}
//                   placeholder="e.g., SIEMENS001"
//                   error={!!customerFormErrors.customer_code}
//                   helperText={customerFormErrors.customer_code}
//                   sx={textFieldSx}
//                   disabled={customerFormLoading}
//                 />
//               </Box>
//             </Grid>
//             <Grid size={{ xs: 12, sm: 6 }}>
//               <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//                 <Label required>CUSTOMER NAME</Label>
//                 <TextField
//                   fullWidth size="small" name="customer_name"
//                   value={customerFormData.customer_name}
//                   onChange={handleCustomerFormChange}
//                   placeholder="e.g., Siemens India Ltd"
//                   error={!!customerFormErrors.customer_name}
//                   helperText={customerFormErrors.customer_name}
//                   sx={textFieldSx}
//                   disabled={customerFormLoading}
//                 />
//               </Box>
//             </Grid>
//             <Grid size={{ xs: 12, sm: 6 }}>
//               <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//                 <Label required>CUSTOMER TYPE</Label>
//                 <FormControl fullWidth size="small" error={!!customerFormErrors.customer_type}>
//                   <Select
//                     name="customer_type"
//                     value={customerFormData.customer_type}
//                     onChange={handleCustomerFormChange}
//                     disabled={customerFormLoading}
//                     sx={selectSx}
//                   >
//                     {CUSTOMER_TYPE_OPTIONS.map(option => (
//                       <MenuItem key={option} value={option} sx={{ fontSize: '0.75rem' }}>{option}</MenuItem>
//                     ))}
//                   </Select>
//                 </FormControl>
//               </Box>
//             </Grid>
//             <Grid size={{ xs: 12, sm: 6 }}>
//               <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//                 <Label required>PRIORITY</Label>
//                 <FormControl fullWidth size="small" error={!!customerFormErrors.priority}>
//                   <Select
//                     name="priority"
//                     value={customerFormData.priority}
//                     onChange={handleCustomerFormChange}
//                     disabled={customerFormLoading}
//                     sx={selectSx}
//                   >
//                     {PRIORITY_OPTIONS_CUSTOMER.map(option => (
//                       <MenuItem key={option} value={option} sx={{ fontSize: '0.75rem' }}>{option}</MenuItem>
//                     ))}
//                   </Select>
//                 </FormControl>
//               </Box>
//             </Grid>
//             <Grid size={{ xs: 12, sm: 6 }}>
//               <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//                 <Label>INDUSTRY SEGMENT</Label>
//                 <FormControl fullWidth size="small">
//                   <Select
//                     name="industry_segment"
//                     value={customerFormData.industry_segment}
//                     onChange={handleCustomerFormChange}
//                     disabled={customerFormLoading}
//                     sx={selectSx}
//                   >
//                     <MenuItem value="" sx={{ fontSize: '0.75rem' }}>Select industry</MenuItem>
//                     {INDUSTRY_SEGMENT_OPTIONS.map(option => (
//                       <MenuItem key={option} value={option} sx={{ fontSize: '0.75rem' }}>{option}</MenuItem>
//                     ))}
//                   </Select>
//                 </FormControl>
//               </Box>
//             </Grid>
//             <Grid size={{ xs: 12, sm: 6 }}>
//               <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//                 <Label required>GSTIN</Label>
//                 <TextField
//                   fullWidth size="small" name="gstin"
//                   value={customerFormData.gstin}
//                   onChange={handleCustomerFormChange}
//                   placeholder="e.g., 27AAECS7112G1Z5"
//                   error={!!customerFormErrors.gstin}
//                   helperText={customerFormErrors.gstin}
//                   sx={textFieldSx}
//                   disabled={customerFormLoading}
//                   inputProps={{ style: { textTransform: 'uppercase' } }}
//                 />
//               </Box>
//             </Grid>
//             <Grid size={{ xs: 12, sm: 6 }}>
//               <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//                 <Label required>PAN</Label>
//                 <TextField
//                   fullWidth size="small" name="pan"
//                   value={customerFormData.pan}
//                   onChange={handleCustomerFormChange}
//                   placeholder="e.g., AAECS7112G"
//                   error={!!customerFormErrors.pan}
//                   helperText={customerFormErrors.pan}
//                   sx={textFieldSx}
//                   disabled={customerFormLoading}
//                   inputProps={{ style: { textTransform: 'uppercase' } }}
//                 />
//               </Box>
//             </Grid>
//           </Grid>
//         );
//       case 1:
//         return (
//           <Grid container spacing={2}>
//             <Grid size={{ xs: 12 }}>
//               <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//                 <Label required>ADDRESS LINE 1</Label>
//                 <TextField
//                   fullWidth size="small" name="address_line1"
//                   value={customerFormData.address_line1}
//                   onChange={handleCustomerFormChange}
//                   placeholder="e.g., 123, Main Street"
//                   error={!!customerFormErrors.address_line1}
//                   helperText={customerFormErrors.address_line1}
//                   sx={textFieldSx}
//                   disabled={customerFormLoading}
//                 />
//               </Box>
//             </Grid>
//             <Grid size={{ xs: 12 }}>
//               <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//                 <Label>ADDRESS LINE 2</Label>
//                 <TextField
//                   fullWidth size="small" name="address_line2"
//                   value={customerFormData.address_line2}
//                   onChange={handleCustomerFormChange}
//                   placeholder="e.g., Near City Center"
//                   sx={textFieldSx}
//                   disabled={customerFormLoading}
//                 />
//               </Box>
//             </Grid>
//             <Grid size={{ xs: 12, sm: 4 }}>
//               <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//                 <Label required>CITY</Label>
//                 <TextField
//                   fullWidth size="small" name="city"
//                   value={customerFormData.city}
//                   onChange={handleCustomerFormChange}
//                   error={!!customerFormErrors.city}
//                   helperText={customerFormErrors.city}
//                   sx={textFieldSx}
//                   disabled={customerFormLoading}
//                 />
//               </Box>
//             </Grid>
//             <Grid size={{ xs: 12, sm: 4 }}>
//               <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//                 <Label required>STATE</Label>
//                 <TextField
//                   fullWidth size="small" name="state"
//                   value={customerFormData.state}
//                   onChange={handleCustomerFormChange}
//                   error={!!customerFormErrors.state}
//                   helperText={customerFormErrors.state}
//                   sx={textFieldSx}
//                   disabled={customerFormLoading}
//                 />
//               </Box>
//             </Grid>
//             <Grid size={{ xs: 12, sm: 4 }}>
//               <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//                 <Label required>PINCODE</Label>
//                 <TextField
//                   fullWidth size="small" name="pincode"
//                   value={customerFormData.pincode}
//                   onChange={handleCustomerFormChange}
//                   error={!!customerFormErrors.pincode}
//                   helperText={customerFormErrors.pincode}
//                   sx={textFieldSx}
//                   disabled={customerFormLoading}
//                 />
//               </Box>
//             </Grid>
//             <Grid size={{ xs: 12, sm: 6 }}>
//               <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//                 <Label required>CONTACT PERSON</Label>
//                 <TextField
//                   fullWidth size="small" name="contact_person"
//                   value={customerFormData.contact_person}
//                   onChange={handleCustomerFormChange}
//                   error={!!customerFormErrors.contact_person}
//                   helperText={customerFormErrors.contact_person}
//                   sx={textFieldSx}
//                   disabled={customerFormLoading}
//                 />
//               </Box>
//             </Grid>
//             <Grid size={{ xs: 12, sm: 6 }}>
//               <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//                 <Label required>EMAIL</Label>
//                 <TextField
//                   fullWidth size="small" name="email" type="email"
//                   value={customerFormData.email}
//                   onChange={handleCustomerFormChange}
//                   error={!!customerFormErrors.email}
//                   helperText={customerFormErrors.email}
//                   sx={textFieldSx}
//                   disabled={customerFormLoading}
//                 />
//               </Box>
//             </Grid>
//             <Grid size={{ xs: 12, sm: 6 }}>
//               <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//                 <Label required>PHONE</Label>
//                 <TextField
//                   fullWidth size="small" name="phone"
//                   value={customerFormData.phone}
//                   onChange={handleCustomerFormChange}
//                   error={!!customerFormErrors.phone}
//                   helperText={customerFormErrors.phone}
//                   sx={textFieldSx}
//                   disabled={customerFormLoading}
//                 />
//               </Box>
//             </Grid>
//             <Grid size={{ xs: 12, sm: 6 }}>
//               <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//                 <Label>MOBILE</Label>
//                 <TextField
//                   fullWidth size="small" name="mobile"
//                   value={customerFormData.mobile}
//                   onChange={handleCustomerFormChange}
//                   sx={textFieldSx}
//                   disabled={customerFormLoading}
//                 />
//               </Box>
//             </Grid>
//           </Grid>
//         );
//       case 2:
//         return (
//           <Grid container spacing={2}>
//             <Grid size={{ xs: 12, sm: 6 }}>
//               <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//                 <Label>CREDIT LIMIT</Label>
//                 <TextField
//                   fullWidth type="number" size="small" name="credit_limit"
//                   value={customerFormData.credit_limit}
//                   onChange={handleCustomerFormChange}
//                   error={!!customerFormErrors.credit_limit}
//                   helperText={customerFormErrors.credit_limit}
//                   InputProps={{
//                     startAdornment: (
//                       <InputAdornment position="start" sx={{ fontSize: '0.75rem' }}>₹</InputAdornment>
//                     ),
//                   }}
//                   sx={textFieldSx}
//                   disabled={customerFormLoading}
//                   inputProps={{ step: '0.01', min: 0 }}
//                 />
//               </Box>
//             </Grid>
//             <Grid size={{ xs: 12, sm: 6 }}>
//               <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//                 <Label>CREDIT DAYS</Label>
//                 <TextField
//                   fullWidth type="number" size="small" name="credit_days"
//                   value={customerFormData.credit_days}
//                   onChange={handleCustomerFormChange}
//                   error={!!customerFormErrors.credit_days}
//                   helperText={customerFormErrors.credit_days}
//                   InputProps={{
//                     endAdornment: (
//                       <InputAdornment position="end" sx={{ fontSize: '0.75rem' }}>Days</InputAdornment>
//                     ),
//                   }}
//                   sx={textFieldSx}
//                   disabled={customerFormLoading}
//                   inputProps={{ step: '1', min: 0 }}
//                 />
//               </Box>
//             </Grid>
//             <Grid size={{ xs: 12 }}>
//               <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//                 <Label>PAYMENT TERMS</Label>
//                 <TextField
//                   fullWidth size="small" name="payment_terms"
//                   value={customerFormData.payment_terms}
//                   onChange={handleCustomerFormChange}
//                   placeholder="e.g., Net 30, 50% Advance"
//                   sx={textFieldSx}
//                   disabled={customerFormLoading}
//                 />
//               </Box>
//             </Grid>
//             <Grid size={{ xs: 12, sm: 6 }}>
//               <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//                 <Label>BANK NAME</Label>
//                 <TextField
//                   fullWidth size="small" name="bank_name"
//                   value={customerFormData.bank_name}
//                   onChange={handleCustomerFormChange}
//                   sx={textFieldSx}
//                   disabled={customerFormLoading}
//                 />
//               </Box>
//             </Grid>
//             <Grid size={{ xs: 12, sm: 6 }}>
//               <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//                 <Label>ACCOUNT NUMBER</Label>
//                 <TextField
//                   fullWidth size="small" name="account_number"
//                   value={customerFormData.account_number}
//                   onChange={handleCustomerFormChange}
//                   sx={textFieldSx}
//                   disabled={customerFormLoading}
//                 />
//               </Box>
//             </Grid>
//             <Grid size={{ xs: 12, sm: 6 }}>
//               <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//                 <Label>IFSC CODE</Label>
//                 <TextField
//                   fullWidth size="small" name="ifsc_code"
//                   value={customerFormData.ifsc_code}
//                   onChange={handleCustomerFormChange}
//                   placeholder="e.g., SBIN0001234"
//                   sx={textFieldSx}
//                   disabled={customerFormLoading}
//                   inputProps={{ style: { textTransform: 'uppercase' } }}
//                 />
//               </Box>
//             </Grid>
//             <Grid size={{ xs: 12, sm: 6 }}>
//               <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//                 <Label>BRANCH NAME</Label>
//                 <TextField
//                   fullWidth size="small" name="branch_name"
//                   value={customerFormData.branch_name}
//                   onChange={handleCustomerFormChange}
//                   sx={textFieldSx}
//                   disabled={customerFormLoading}
//                 />
//               </Box>
//             </Grid>
//             <Grid size={{ xs: 12, sm: 6 }}>
//               <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//                 <Label>UPI ID</Label>
//                 <TextField
//                   fullWidth size="small" name="upi_id"
//                   value={customerFormData.upi_id}
//                   onChange={handleCustomerFormChange}
//                   placeholder="e.g., customer@bank"
//                   sx={textFieldSx}
//                   disabled={customerFormLoading}
//                 />
//               </Box>
//             </Grid>
//           </Grid>
//         );
//       case 3:
//         return (
//           <Box sx={{ py: 2, textAlign: 'center' }}>
//             <Typography variant="h6" sx={{ fontWeight: 600, color: COLORS.text.primary }}>
//               Ready to Save!
//             </Typography>
//             <Typography sx={{ fontSize: '0.8rem', color: COLORS.text.secondary, mt: 1 }}>
//               Please review the customer information before saving.
//             </Typography>
//           </Box>
//         );
//       default:
//         return null;
//     }
//   };

//   return (
//     <Paper sx={{ mt: 2, p: 2, bgcolor: COLORS.background.light, borderRadius: 2, border: `2px solid ${COLORS.primary}` }}>
//       <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
//         <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color: COLORS.primary }}>
//           <PersonAddIcon sx={{ fontSize: '1rem', mr: 1, verticalAlign: 'middle' }} />
//           Add New Customer
//         </Typography>
//         <IconButton size="small" onClick={handleCancel} sx={{ color: COLORS.text.tertiary, '&:hover': { color: COLORS.primary } }} disabled={customerFormLoading}>
//           <CloseIcon sx={{ fontSize: '1rem' }} />
//         </IconButton>
//       </Box>

//       <Stepper activeStep={customerActiveStep} sx={{ mb: 3 }} connector={<ColorConnector />}>
//         {CUSTOMER_STEPS.map((label, index) => (
//           <Step key={label}>
//             <StepLabel>
//               <Typography sx={{ fontSize: '0.65rem', fontWeight: 500 }}>{index + 1}. {label}</Typography>
//             </StepLabel>
//           </Step>
//         ))}
//       </Stepper>

//       {renderCustomerStepContent(customerActiveStep)}

//       {customerFormError && (
//         <Alert severity="error" sx={{ mt: 2, borderRadius: 1.5, fontSize: '0.75rem', py: 0.5 }}>
//           {customerFormError}
//         </Alert>
//       )}

//       <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
//         <Button
//           onClick={handleCustomerBack}
//           disabled={customerActiveStep === 0 || customerFormLoading}
//           size="small"
//           startIcon={<NavigateBeforeIcon sx={{ fontSize: '1rem' }} />}
//           sx={{
//             height: 32, px: 2, borderRadius: 1.5,
//             border: `1px solid ${COLORS.border}`,
//             color: COLORS.text.secondary,
//             fontSize: '0.7rem', fontWeight: 500, textTransform: 'none',
//             '&:hover': { borderColor: COLORS.primary, bgcolor: `${COLORS.primary}10` }
//           }}
//         >
//           Back
//         </Button>
//         <Box sx={{ display: 'flex', gap: 1 }}>
//           <Button
//             onClick={handleCancel}
//             disabled={customerFormLoading}
//             size="small"
//             sx={{
//               height: 32, px: 2, borderRadius: 1.5,
//               border: `1px solid ${COLORS.border}`,
//               color: COLORS.text.secondary,
//               fontSize: '0.7rem', fontWeight: 500, textTransform: 'none',
//               '&:hover': { borderColor: COLORS.primary, bgcolor: `${COLORS.primary}10` }
//             }}
//           >
//             Cancel
//           </Button>
//           {customerActiveStep === CUSTOMER_STEPS.length - 1 ? (
//             <Button
//               variant="contained"
//               onClick={handleCustomerFormSubmit}
//               disabled={customerFormLoading}
//               size="small"
//               startIcon={customerFormLoading ? <CircularProgress size={16} color="inherit" /> : <SaveIcon sx={{ fontSize: '1rem' }} />}
//               sx={{
//                 height: 32, px: 2, borderRadius: 1.5,
//                 bgcolor: COLORS.primary,
//                 fontSize: '0.7rem', fontWeight: 500, textTransform: 'none',
//                 '&:hover': { bgcolor: COLORS.primaryDark }
//               }}
//             >
//               {customerFormLoading ? 'Saving...' : 'Save Customer'}
//             </Button>
//           ) : (
//             <Button
//               variant="contained"
//               onClick={handleCustomerNext}
//               disabled={customerFormLoading}
//               size="small"
//               endIcon={<NavigateNextIcon sx={{ fontSize: '1rem' }} />}
//               sx={{
//                 height: 32, px: 2, borderRadius: 1.5,
//                 bgcolor: COLORS.primary,
//                 fontSize: '0.7rem', fontWeight: 500, textTransform: 'none',
//                 '&:hover': { bgcolor: COLORS.primaryDark }
//               }}
//             >
//               Next
//             </Button>
//           )}
//         </Box>
//       </Box>
//     </Paper>
//   );
// };

// ============================================
// INLINE SALES ORDER FORM (Full - Matching AddSaleOrder)
// ============================================
const InlineSalesOrderForm = ({ onSave, onCancel }) => {
  const [soActiveStep, setSoActiveStep] = useState(0);
  const [soFormLoading, setSoFormLoading] = useState(false);
  const [soFormError, setSoFormError] = useState('');
  const [soFieldErrors, setSoFieldErrors] = useState({});
  const [soItems, setSoItems] = useState([
    {
      item_id: '',
      part_no: '',
      part_name: '',
      hsn_code: '',
      unit: 'Nos',
      ordered_qty: 1,
      unit_price: 0,
      discount_percent: 0,
      required_date: new Date().toISOString().split('T')[0],
      committed_date: new Date().toISOString().split('T')[0],
      remarks: ''
    }
  ]);
  const [calculatedTotals, setCalculatedTotals] = useState({
    sub_total: 0,
    discount_total: 0,
    taxable_total: 0,
    gst_total: 0,
    grand_total: 0
  });

  // Data from APIs
  const [customers, setCustomers] = useState([]);
  const [items, setItems] = useState([]);
  const [loadingData, setLoadingData] = useState(false);

  // Form data
  const [soFormData, setSoFormData] = useState({
    customer_id: '',
    quotation_id: '',
    quotation_no: '',
    customer_po_number: '',
    customer_po_date: new Date().toISOString().split('T')[0],
    payment_terms: '',
    delivery_terms: '',
    delivery_mode: '',
    expected_delivery_date: new Date().toISOString().split('T')[0],
    internal_remarks: '',
    currency: 'INR'
  });

  // Fetch customers
  const fetchCustomers = useCallback(async () => {
    try {
      setLoadingData(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(`${BASE_URL}/api/customers?limit=100`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.data.success) {
        setCustomers(response.data.data || []);
      }
    } catch (err) {
      console.error('Error fetching customers:', err);
    } finally {
      setLoadingData(false);
    }
  }, []);

  // Fetch items
  const fetchItems = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${BASE_URL}/api/items?limit=100`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.data.success) {
        setItems(response.data.data || []);
      }
    } catch (err) {
      console.error('Error fetching items:', err);
    }
  }, []);

  useEffect(() => {
    fetchCustomers();
    fetchItems();
  }, [fetchCustomers, fetchItems]);

  const handleSOChange = (e) => {
    const { name, value } = e.target;
    setSoFormData(prev => ({ ...prev, [name]: value }));
    setSoFieldErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleItemChange = (index, field, value) => {
    const updatedItems = [...soItems];
    updatedItems[index][field] = value;
    if (field === 'item_id' && value) {
      const selectedItem = items.find(item => item._id === value);
      if (selectedItem) {
        updatedItems[index].part_no = selectedItem.part_no || '';
        updatedItems[index].part_name = selectedItem.part_description || '';
        updatedItems[index].hsn_code = selectedItem.hsn_code || '';
        updatedItems[index].unit = selectedItem.unit || 'Nos';
      }
    }
    setSoItems(updatedItems);
    setSoFieldErrors(prev => ({ ...prev, [`item_${index}_${field}`]: '' }));
    calculateTotals(updatedItems);
  };

  const calculateTotals = (items) => {
    let sub_total = 0, discount_total = 0;
    items.forEach(item => {
      const qty = Number(item.ordered_qty) || 0;
      const price = Number(item.unit_price) || 0;
      const discount = Number(item.discount_percent) || 0;
      const item_total = qty * price;
      const item_discount = (item_total * discount) / 100;
      sub_total += item_total;
      discount_total += item_discount;
    });
    const taxable_total = sub_total - discount_total;
    const gst_total = (taxable_total * 18) / 100;
    const grand_total = taxable_total + gst_total;
    setCalculatedTotals({ sub_total, discount_total, taxable_total, gst_total, grand_total });
  };

  const addItem = () => {
    setSoItems([...soItems, {
      item_id: '',
      part_no: '',
      part_name: '',
      hsn_code: '',
      unit: 'Nos',
      ordered_qty: 1,
      unit_price: 0,
      discount_percent: 0,
      required_date: new Date().toISOString().split('T')[0],
      committed_date: new Date().toISOString().split('T')[0],
      remarks: ''
    }]);
  };

  const removeItem = (index) => {
    if (soItems.length > 1) {
      const updatedItems = soItems.filter((_, i) => i !== index);
      setSoItems(updatedItems);
      calculateTotals(updatedItems);
    }
  };

  const validateSOForm = () => {
    const errors = {};
    let isValid = true;

    if (!soFormData.customer_id) {
      errors.customer_id = 'Customer is required';
      isValid = false;
    }
    if (!soFormData.expected_delivery_date) {
      errors.expected_delivery_date = 'Expected delivery date is required';
      isValid = false;
    }
    soItems.forEach((item, index) => {
      if (!item.item_id) {
        errors[`item_${index}_item_id`] = `Item ${index + 1}: Item is required`;
        isValid = false;
      }
      if (!item.ordered_qty || item.ordered_qty <= 0) {
        errors[`item_${index}_ordered_qty`] = `Item ${index + 1}: Valid quantity is required`;
        isValid = false;
      }
      if (!item.unit_price || item.unit_price <= 0) {
        errors[`item_${index}_unit_price`] = `Item ${index + 1}: Valid unit price is required`;
        isValid = false;
      }
    });

    setSoFieldErrors(errors);
    if (!isValid) {
      setSoFormError('Please fix the errors above');
    }
    return isValid;
  };

  const handleSOSubmit = async () => {
    if (!validateSOForm()) return;

    setSoFormLoading(true);
    setSoFormError('');

    try {
      const token = localStorage.getItem('token');
      const submitData = {
        ...soFormData,
        items: soItems.map(item => ({
          item_id: item.item_id,
          part_no: item.part_no,
          part_name: item.part_name,
          hsn_code: item.hsn_code,
          unit: item.unit,
          ordered_qty: Number(item.ordered_qty),
          unit_price: Number(item.unit_price),
          discount_percent: Number(item.discount_percent),
          required_date: item.required_date,
          committed_date: item.committed_date,
          remarks: item.remarks
        }))
      };
      const response = await axios.post(`${BASE_URL}/api/sales-orders`, submitData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.data.success) {
        onSave(response.data.data);
      } else {
        setSoFormError(response.data.message || 'Failed to add Sales Order');
      }
    } catch (err) {
      console.error('Error adding Sales Order:', err);
      setSoFormError(err.response?.data?.message || 'Failed to add Sales Order. Please try again.');
    } finally {
      setSoFormLoading(false);
    }
  };

  const resetSOForm = () => {
    setSoFormData({
      customer_id: '',
      quotation_id: '',
      quotation_no: '',
      customer_po_number: '',
      customer_po_date: new Date().toISOString().split('T')[0],
      payment_terms: '',
      delivery_terms: '',
      delivery_mode: '',
      expected_delivery_date: new Date().toISOString().split('T')[0],
      internal_remarks: '',
      currency: 'INR'
    });
    setSoItems([{
      item_id: '',
      part_no: '',
      part_name: '',
      hsn_code: '',
      unit: 'Nos',
      ordered_qty: 1,
      unit_price: 0,
      discount_percent: 0,
      required_date: new Date().toISOString().split('T')[0],
      committed_date: new Date().toISOString().split('T')[0],
      remarks: ''
    }]);
    setCalculatedTotals({ sub_total: 0, discount_total: 0, taxable_total: 0, gst_total: 0, grand_total: 0 });
    setSoFieldErrors({});
    setSoFormError('');
    setSoActiveStep(0);
  };

  const handleCancel = () => {
    resetSOForm();
    onCancel();
  };

  const Label = ({ children, required }) => (
    <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary, letterSpacing: '0.5px' }}>
      {children} {required && <span style={{ color: '#EF4444' }}>*</span>}
    </Typography>
  );

  const textFieldSx = {
    '& .MuiOutlinedInput-root': {
      borderRadius: 1.5, fontSize: '0.75rem',
      '&:hover fieldset': { borderColor: COLORS.primary },
      '&.Mui-focused fieldset': { borderColor: COLORS.primary, borderWidth: 1 }
    },
    '& .MuiInputBase-input': {
      py: 1, px: 1.5, fontSize: '0.75rem', color: COLORS.text.primary,
      '&::placeholder': { color: COLORS.text.tertiary, fontSize: '0.75rem' }
    },
    '& .MuiFormHelperText-root': { fontSize: '0.65rem', marginLeft: 0, marginTop: 0.25 }
  };

  const selectSx = {
    borderRadius: 1.5, fontSize: '0.75rem',
    '& .MuiSelect-select': { py: 1, px: 1.5, fontSize: '0.75rem' }
  };

  const formatCurrency = (amount) => {
    if (!amount && amount !== 0) return '-';
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: soFormData.currency || 'INR',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const soSteps = ['Basic Information', 'Delivery & Financial', 'Items', 'Review & Submit'];

  const renderSOStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Grid container spacing={2}>
            <Grid size={{ xs: 12 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                <Label required>CUSTOMER</Label>
                <Autocomplete
                  fullWidth
                  options={customers}
                  getOptionLabel={(option) => `${option.customer_name} - ${option.customer_code}`}
                  value={customers.find(c => c._id === soFormData.customer_id) || null}
                  onChange={(event, newValue) => {
                    setSoFormData(prev => ({ ...prev, customer_id: newValue?._id || '' }));
                    setSoFieldErrors(prev => ({ ...prev, customer_id: '' }));
                  }}
                  loading={loadingData}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      size="small"
                      error={!!soFieldErrors.customer_id}
                      helperText={soFieldErrors.customer_id}
                      sx={textFieldSx}
                    />
                  )}
                />
              </Box>
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                <Label>REFERENCE QUOTATION</Label>
                <TextField
                  fullWidth size="small"
                  value={soFormData.quotation_no}
                  placeholder="Optional"
                  disabled
                  sx={textFieldSx}
                />
              </Box>
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                <Label>CUSTOMER PO NUMBER</Label>
                <TextField
                  fullWidth size="small" name="customer_po_number"
                  value={soFormData.customer_po_number}
                  onChange={handleSOChange}
                  placeholder="e.g., PO-2025-001"
                  sx={textFieldSx}
                  disabled={soFormLoading}
                />
              </Box>
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                <Label>CUSTOMER PO DATE</Label>
                <TextField
                  fullWidth type="date" size="small" name="customer_po_date"
                  value={soFormData.customer_po_date}
                  onChange={handleSOChange}
                  sx={textFieldSx}
                  disabled={soFormLoading}
                  InputLabelProps={{ shrink: true }}
                />
              </Box>
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                <Label required>EXPECTED DELIVERY DATE</Label>
                <TextField
                  fullWidth type="date" size="small" name="expected_delivery_date"
                  value={soFormData.expected_delivery_date}
                  onChange={handleSOChange}
                  error={!!soFieldErrors.expected_delivery_date}
                  helperText={soFieldErrors.expected_delivery_date}
                  sx={textFieldSx}
                  disabled={soFormLoading}
                  InputLabelProps={{ shrink: true }}
                />
              </Box>
            </Grid>

            <Grid size={{ xs: 12 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                <Label>INTERNAL REMARKS</Label>
                <TextField
                  fullWidth multiline rows={2} size="small" name="internal_remarks"
                  value={soFormData.internal_remarks}
                  onChange={handleSOChange}
                  placeholder="Any internal notes or special instructions..."
                  sx={textFieldSx}
                  disabled={soFormLoading}
                />
              </Box>
            </Grid>
          </Grid>
        );

      case 1:
        return (
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                <Label>PAYMENT TERMS</Label>
                <TextField
                  fullWidth size="small" name="payment_terms"
                  value={soFormData.payment_terms}
                  onChange={handleSOChange}
                  placeholder="e.g., Net 30, 50% Advance"
                  sx={textFieldSx}
                  disabled={soFormLoading}
                />
              </Box>
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                <Label>DELIVERY TERMS</Label>
                <FormControl fullWidth size="small">
                  <Select
                    name="delivery_terms"
                    value={soFormData.delivery_terms}
                    onChange={handleSOChange}
                    disabled={soFormLoading}
                    sx={selectSx}
                  >
                    {DELIVERY_TERMS_OPTIONS.map(opt => (
                      <MenuItem key={opt} value={opt} sx={{ fontSize: '0.75rem' }}>{opt || 'None'}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                <Label>DELIVERY MODE</Label>
                <FormControl fullWidth size="small">
                  <Select
                    name="delivery_mode"
                    value={soFormData.delivery_mode}
                    onChange={handleSOChange}
                    disabled={soFormLoading}
                    sx={selectSx}
                  >
                    {DELIVERY_MODE_OPTIONS.map(opt => (
                      <MenuItem key={opt} value={opt} sx={{ fontSize: '0.75rem' }}>{opt || 'None'}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                <Label>CURRENCY</Label>
                <FormControl fullWidth size="small">
                  <Select
                    name="currency"
                    value={soFormData.currency}
                    onChange={handleSOChange}
                    disabled={soFormLoading}
                    sx={selectSx}
                  >
                    {CURRENCY_OPTIONS.map(opt => (
                      <MenuItem key={opt} value={opt} sx={{ fontSize: '0.75rem' }}>{opt}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
            </Grid>
          </Grid>
        );

      case 2:
        return (
          <Box>
            {soItems.map((item, index) => (
              <Paper key={index} sx={{ p: 2, mb: 2, bgcolor: COLORS.background.light, borderRadius: 1.5, border: `1px solid ${COLORS.border}` }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.5 }}>
                  <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary }}>Item {index + 1}</Typography>
                  {soItems.length > 1 && (
                    <IconButton size="small" onClick={() => removeItem(index)} sx={{ color: '#EF4444' }}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  )}
                </Stack>

                <Grid container spacing={1.5}>
                  <Grid size={{ xs: 12 }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                      <Label required>ITEM</Label>
                      <Autocomplete
                        fullWidth
                        options={items}
                        getOptionLabel={(option) => `${option.part_no} - ${option.part_description}`}
                        value={items.find(i => i._id === item.item_id) || null}
                        onChange={(event, newValue) => handleItemChange(index, 'item_id', newValue?._id || '')}
                        loading={loadingData}
                        disabled={soFormLoading}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            size="small"
                            error={!!soFieldErrors[`item_${index}_item_id`]}
                            helperText={soFieldErrors[`item_${index}_item_id`]}
                            sx={textFieldSx}
                          />
                        )}
                      />
                    </Box>
                  </Grid>

                  <Grid size={{ xs: 6, sm: 3 }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                      <Label>PART NO</Label>
                      <TextField fullWidth size="small" value={item.part_no} disabled sx={textFieldSx} />
                    </Box>
                  </Grid>
                  <Grid size={{ xs: 6, sm: 3 }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                      <Label>HSN CODE</Label>
                      <TextField fullWidth size="small" value={item.hsn_code} disabled sx={textFieldSx} />
                    </Box>
                  </Grid>
                  <Grid size={{ xs: 6, sm: 2 }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                      <Label>UNIT</Label>
                      <FormControl fullWidth size="small">
                        <Select
                          value={item.unit}
                          onChange={(e) => handleItemChange(index, 'unit', e.target.value)}
                          disabled={soFormLoading}
                          sx={selectSx}
                        >
                          {UNIT_OPTIONS.map(opt => (
                            <MenuItem key={opt} value={opt} sx={{ fontSize: '0.75rem' }}>{opt}</MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Box>
                  </Grid>
                  <Grid size={{ xs: 6, sm: 2 }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                      <Label required>QUANTITY</Label>
                      <TextField
                        fullWidth type="number" size="small"
                        value={item.ordered_qty}
                        onChange={(e) => handleItemChange(index, 'ordered_qty', e.target.value)}
                        error={!!soFieldErrors[`item_${index}_ordered_qty`]}
                        helperText={soFieldErrors[`item_${index}_ordered_qty`]}
                        sx={textFieldSx}
                        disabled={soFormLoading}
                      />
                    </Box>
                  </Grid>
                  <Grid size={{ xs: 6, sm: 2 }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                      <Label required>UNIT PRICE</Label>
                      <TextField
                        fullWidth type="number" size="small"
                        value={item.unit_price}
                        onChange={(e) => handleItemChange(index, 'unit_price', e.target.value)}
                        error={!!soFieldErrors[`item_${index}_unit_price`]}
                        helperText={soFieldErrors[`item_${index}_unit_price`]}
                        sx={textFieldSx}
                        disabled={soFormLoading}
                      />
                    </Box>
                  </Grid>
                  <Grid size={{ xs: 6, sm: 2 }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                      <Label>DISCOUNT %</Label>
                      <TextField
                        fullWidth type="number" size="small"
                        value={item.discount_percent}
                        onChange={(e) => handleItemChange(index, 'discount_percent', e.target.value)}
                        sx={textFieldSx}
                        disabled={soFormLoading}
                      />
                    </Box>
                  </Grid>

                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                      <Label>REQUIRED DATE</Label>
                      <TextField
                        fullWidth type="date" size="small"
                        value={item.required_date}
                        onChange={(e) => handleItemChange(index, 'required_date', e.target.value)}
                        sx={textFieldSx}
                        disabled={soFormLoading}
                        InputLabelProps={{ shrink: true }}
                      />
                    </Box>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                      <Label>COMMITTED DATE</Label>
                      <TextField
                        fullWidth type="date" size="small"
                        value={item.committed_date}
                        onChange={(e) => handleItemChange(index, 'committed_date', e.target.value)}
                        sx={textFieldSx}
                        disabled={soFormLoading}
                        InputLabelProps={{ shrink: true }}
                      />
                    </Box>
                  </Grid>
                  <Grid size={{ xs: 12 }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                      <Label>REMARKS</Label>
                      <TextField
                        fullWidth size="small"
                        value={item.remarks}
                        onChange={(e) => handleItemChange(index, 'remarks', e.target.value)}
                        placeholder="Additional notes..."
                        sx={textFieldSx}
                        disabled={soFormLoading}
                      />
                    </Box>
                  </Grid>
                </Grid>
              </Paper>
            ))}

            <Button
              variant="outlined"
              startIcon={<AddIcon sx={{ fontSize: '1rem' }} />}
              onClick={addItem}
              disabled={soFormLoading}
              sx={{
                height: 32, px: 2, borderRadius: 1.5,
                border: `1px solid ${COLORS.border}`,
                color: COLORS.text.secondary,
                fontSize: '0.7rem', fontWeight: 500, textTransform: 'none',
                '&:hover': { borderColor: COLORS.primary, bgcolor: `${COLORS.primary}10` }
              }}
            >
              Add Item
            </Button>
          </Box>
        );

      case 3:
        return (
          <Box>
            <Paper sx={{ p: 2, bgcolor: COLORS.background.light, borderRadius: 1.5, mb: 2 }}>
              <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: COLORS.primary, mb: 1 }}>
                Customer Information
              </Typography>
              <Grid container spacing={1}>
                <Grid size={{ xs: 6 }}>
                  <Typography sx={{ fontSize: '0.7rem', color: COLORS.text.secondary }}>Customer:</Typography>
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <Typography sx={{ fontSize: '0.7rem', fontWeight: 500 }}>
                    {customers.find(c => c._id === soFormData.customer_id)?.customer_name || '-'}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <Typography sx={{ fontSize: '0.7rem', color: COLORS.text.secondary }}>PO Number:</Typography>
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <Typography sx={{ fontSize: '0.7rem', fontWeight: 500 }}>{soFormData.customer_po_number || '-'}</Typography>
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <Typography sx={{ fontSize: '0.7rem', color: COLORS.text.secondary }}>Expected Delivery:</Typography>
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <Typography sx={{ fontSize: '0.7rem', fontWeight: 500 }}>{soFormData.expected_delivery_date}</Typography>
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <Typography sx={{ fontSize: '0.7rem', color: COLORS.text.secondary }}>Currency:</Typography>
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <Typography sx={{ fontSize: '0.7rem', fontWeight: 500 }}>{soFormData.currency}</Typography>
                </Grid>
              </Grid>
            </Paper>

            <Paper sx={{ p: 2, bgcolor: COLORS.background.light, borderRadius: 1.5 }}>
              <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: COLORS.primary, mb: 1 }}>
                Order Summary
              </Typography>
              <Stack spacing={1}>
                <Stack direction="row" justifyContent="space-between">
                  <Typography sx={{ fontSize: '0.7rem', color: COLORS.text.secondary }}>Sub Total:</Typography>
                  <Typography sx={{ fontSize: '0.7rem', fontWeight: 500 }}>{formatCurrency(calculatedTotals.sub_total)}</Typography>
                </Stack>
                <Stack direction="row" justifyContent="space-between">
                  <Typography sx={{ fontSize: '0.7rem', color: COLORS.text.secondary }}>Discount:</Typography>
                  <Typography sx={{ fontSize: '0.7rem', fontWeight: 500 }}>{formatCurrency(calculatedTotals.discount_total)}</Typography>
                </Stack>
                <Stack direction="row" justifyContent="space-between">
                  <Typography sx={{ fontSize: '0.7rem', color: COLORS.text.secondary }}>Taxable Amount:</Typography>
                  <Typography sx={{ fontSize: '0.7rem', fontWeight: 500 }}>{formatCurrency(calculatedTotals.taxable_total)}</Typography>
                </Stack>
                <Stack direction="row" justifyContent="space-between">
                  <Typography sx={{ fontSize: '0.7rem', color: COLORS.text.secondary }}>GST (18%):</Typography>
                  <Typography sx={{ fontSize: '0.7rem', fontWeight: 500 }}>{formatCurrency(calculatedTotals.gst_total)}</Typography>
                </Stack>
                <Divider />
                <Stack direction="row" justifyContent="space-between">
                  <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: COLORS.primary }}>Grand Total:</Typography>
                  <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: '#059669' }}>{formatCurrency(calculatedTotals.grand_total)}</Typography>
                </Stack>
              </Stack>
            </Paper>
          </Box>
        );

      default:
        return null;
    }
  };

  return (
    <Paper sx={{ mt: 2, p: 2, bgcolor: COLORS.background.light, borderRadius: 2, border: `2px solid ${COLORS.primary}` }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color: COLORS.primary }}>
          <BusinessIcon sx={{ fontSize: '1rem', mr: 1, verticalAlign: 'middle' }} />
          Add New Sales Order
        </Typography>
        <IconButton size="small" onClick={handleCancel} sx={{ color: COLORS.text.tertiary, '&:hover': { color: COLORS.primary } }} disabled={soFormLoading}>
          <CloseIcon sx={{ fontSize: '1rem' }} />
        </IconButton>
      </Box>

      <Stepper activeStep={soActiveStep} sx={{ mb: 3 }} connector={<ColorConnector />}>
        {soSteps.map((label, index) => (
          <Step key={label}>
            <StepLabel>
              <Typography sx={{ fontSize: '0.65rem', fontWeight: 500 }}>{index + 1}. {label}</Typography>
            </StepLabel>
          </Step>
        ))}
      </Stepper>

      {renderSOStepContent(soActiveStep)}

      {soFormError && (
        <Alert severity="error" sx={{ mt: 2, borderRadius: 1.5, fontSize: '0.75rem', py: 0.5 }}>
          {soFormError}
        </Alert>
      )}

      <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Button
          onClick={() => setSoActiveStep(prev => prev - 1)}
          disabled={soActiveStep === 0 || soFormLoading}
          size="small"
          startIcon={<NavigateBeforeIcon sx={{ fontSize: '1rem' }} />}
          sx={{
            height: 32, px: 2, borderRadius: 1.5,
            border: `1px solid ${COLORS.border}`,
            color: COLORS.text.secondary,
            fontSize: '0.7rem', fontWeight: 500, textTransform: 'none',
            '&:hover': { borderColor: COLORS.primary, bgcolor: `${COLORS.primary}10` }
          }}
        >
          Back
        </Button>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            onClick={handleCancel}
            disabled={soFormLoading}
            size="small"
            sx={{
              height: 32, px: 2, borderRadius: 1.5,
              border: `1px solid ${COLORS.border}`,
              color: COLORS.text.secondary,
              fontSize: '0.7rem', fontWeight: 500, textTransform: 'none',
              '&:hover': { borderColor: COLORS.primary, bgcolor: `${COLORS.primary}10` }
            }}
          >
            Cancel
          </Button>
          {soActiveStep === soSteps.length - 1 ? (
            <Button
              variant="contained"
              onClick={handleSOSubmit}
              disabled={soFormLoading}
              size="small"
              startIcon={soFormLoading ? <CircularProgress size={16} color="inherit" /> : <SaveIcon sx={{ fontSize: '1rem' }} />}
              sx={{
                height: 32, px: 2, borderRadius: 1.5,
                bgcolor: COLORS.primary,
                fontSize: '0.7rem', fontWeight: 500, textTransform: 'none',
                '&:hover': { bgcolor: COLORS.primaryDark }
              }}
            >
              {soFormLoading ? 'Saving...' : 'Save Sales Order'}
            </Button>
          ) : (
            <Button
              variant="contained"
              onClick={() => setSoActiveStep(prev => prev + 1)}
              disabled={soFormLoading}
              size="small"
              endIcon={<NavigateNextIcon sx={{ fontSize: '1rem' }} />}
              sx={{
                height: 32, px: 2, borderRadius: 1.5,
                bgcolor: COLORS.primary,
                fontSize: '0.7rem', fontWeight: 500, textTransform: 'none',
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

// ============================================
// INLINE ITEM FORM (Full 4-Step Stepper - matching AddDimensions)
// ============================================
const InlineItemForm = ({ onSave, onCancel }) => {
  const [itemStepper, setItemStepper] = useState(0);
  const [itemFormLoading, setItemFormLoading] = useState(false);
  const [itemFormError, setItemFormError] = useState('');
  const [itemFormData, setItemFormData] = useState({
    part_no: '',
    part_name: '',
    part_description: '',
    item_category: '',
    item_type: '',
    sale_unit: '',
    weight_per_unit_kg: '',
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
    drawing_no: '',
    revision_no: '',
    thickness: '',
    width: '',
    length: '',
    strip_size: '',
    pitch: '',
    no_of_cavity: 1,
    rm_rejection_percent: '',
    scrap_realisation_percent: '',
    hsn_code: '',
    gst_percentage: '',
    procurement_type: '',
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

  const handleItemFormChange = (e) => {
    const { name, value } = e.target;
    setItemFieldErrors(prev => ({ ...prev, [name]: '' }));

    const numericFields = [
      'density', 'weight_per_unit_kg', 'thickness', 'width', 'length',
      'strip_size', 'pitch', 'no_of_cavity', 'rm_rejection_percent',
      'scrap_realisation_percent', 'gst_percentage', 'reorder_level',
      'reorder_qty', 'lead_time_days', 'safety_stock', 'min_stock',
      'max_stock', 'shelf_life_days'
    ];
    if (numericFields.includes(name)) {
      if (value === '' || /^\d*\.?\d*$/.test(value)) {
        setItemFormData(prev => ({ ...prev, [name]: value }));
      }
    } else {
      setItemFormData(prev => ({ ...prev, [name]: value }));
    }

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

  const handleSelectChange = (e) => {
    const { name, value } = e.target;
    setItemFieldErrors(prev => ({ ...prev, [name]: '' }));
    setItemFormData(prev => ({ ...prev, [name]: value }));
    if (itemTouched[name] || value) {
      const errorMessage = validateItemField(name, value);
      setItemFieldErrors(prev => ({ ...prev, [name]: errorMessage }));
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
      case 'material_name':
        if (!value?.trim()) return 'Material name is required';
        if (value.length > 100) return 'Material name should not exceed 100 characters';
        return '';
      case 'material_grade':
        if (!value?.trim()) return 'Material grade is required';
        return '';
      case 'density':
        if (!value) return 'Density is required';
        if (isNaN(value) || value <= 0) return 'Density must be a positive number';
        if (value > 25) return 'Density cannot exceed 25 g/cm³';
        return '';
      case 'unit':
        if (!value) return 'Unit is required';
        return '';
      case 'sale_unit':
        if (!value) return 'Sale unit is required';
        return '';
      case 'hsn_code':
        if (!value?.trim()) return 'HSN code is required';
        return '';
      case 'gst_percentage':
        if (value && (isNaN(value) || value < 0 || value > 100)) return 'GST percentage must be between 0 and 100';
        return '';
      case 'thickness':
        if (value && (isNaN(value) || value < 0)) return 'Thickness must be a positive number';
        return '';
      case 'width':
        if (value && (isNaN(value) || value < 0)) return 'Width must be a positive number';
        return '';
      case 'length':
        if (value && (isNaN(value) || value < 0)) return 'Length must be a positive number';
        return '';
      case 'weight_per_unit_kg':
        if (value && (isNaN(value) || value <= 0)) return 'Weight per unit must be a positive number';
        return '';
      case 'procurement_type':
        if (!value) return 'Procurement type is required';
        return '';
      default:
        return '';
    }
  };

  const validateItemStep = (step) => {
    const errors = {};
    let isValid = true;
    const data = itemFormData;

    switch (step) {
      case 0:
        if (!data.part_no?.trim()) { errors.part_no = 'Part number is required'; isValid = false; }
        if (!data.part_name?.trim()) { errors.part_name = 'Part name is required'; isValid = false; }
        if (!data.part_description?.trim()) { errors.part_description = 'Part description is required'; isValid = false; }
        if (!data.item_category) { errors.item_category = 'Item category is required'; isValid = false; }
        if (!data.sale_unit) { errors.sale_unit = 'Sale unit is required'; isValid = false; }
        if (data.sale_unit !== 'Kg' && !data.weight_per_unit_kg) {
          errors.weight_per_unit_kg = 'Weight per unit is required when sale unit is not Kg';
          isValid = false;
        }
        break;
      case 1:
        if (!data.material_name?.trim()) { errors.material_name = 'Material name is required'; isValid = false; }
        if (!data.material_grade?.trim()) { errors.material_grade = 'Material grade is required'; isValid = false; }
        if (!data.density) { errors.density = 'Density is required'; isValid = false; }
        if (!data.unit) { errors.unit = 'Unit is required'; isValid = false; }
        if (!data.hsn_code?.trim()) { errors.hsn_code = 'HSN code is required'; isValid = false; }
        if (!data.procurement_type) { errors.procurement_type = 'Procurement type is required'; isValid = false; }
        break;
      case 2:
        if (data.thickness && isNaN(data.thickness)) { errors.thickness = 'Thickness must be a number'; isValid = false; }
        if (data.width && isNaN(data.width)) { errors.width = 'Width must be a number'; isValid = false; }
        if (data.length && isNaN(data.length)) { errors.length = 'Length must be a number'; isValid = false; }
        if (data.rm_rejection_percent && (isNaN(data.rm_rejection_percent) || data.rm_rejection_percent < 0 || data.rm_rejection_percent > 100)) {
          errors.rm_rejection_percent = 'RM rejection must be between 0 and 100';
          isValid = false;
        }
        if (data.scrap_realisation_percent && (isNaN(data.scrap_realisation_percent) || data.scrap_realisation_percent < 0 || data.scrap_realisation_percent > 100)) {
          errors.scrap_realisation_percent = 'Scrap realisation must be between 0 and 100';
          isValid = false;
        }
        break;
      case 3:
        if (data.gst_percentage && (isNaN(data.gst_percentage) || data.gst_percentage < 0 || data.gst_percentage > 100)) {
          errors.gst_percentage = 'GST percentage must be between 0 and 100';
          isValid = false;
        }
        break;
      default:
        return true;
    }

    setItemFieldErrors(errors);
    if (!isValid) {
      setItemFormError('Please fix the errors in this section');
    }
    return isValid;
  };

  const validateAllItemFields = () => {
    let valid = true;
    for (let i = 0; i < 4; i++) {
      if (!validateItemStep(i)) {
        valid = false;
        setItemStepper(i);
        break;
      }
    }
    return valid;
  };

  const handleItemNext = () => {
    if (validateItemStep(itemStepper)) {
      setItemFormError('');
      setItemStepper(prev => prev + 1);
    }
  };

  const handleItemBack = () => {
    setItemFormError('');
    setItemStepper(prev => prev - 1);
  };

  const handleItemSubmit = async () => {
    if (!validateAllItemFields()) return;

    setItemFormLoading(true);
    setItemFormError('');

    try {
      const token = localStorage.getItem('token');

      const payload = {
        part_no: itemFormData.part_no,
        part_name: itemFormData.part_name,
        part_description: itemFormData.part_description,
        item_category: itemFormData.item_category,
        item_type: itemFormData.item_type || 'Other',
        sale_unit: itemFormData.sale_unit,
        weight_per_unit_kg: itemFormData.weight_per_unit_kg ? parseFloat(itemFormData.weight_per_unit_kg) : undefined,
        material_code: itemFormData.material_code || undefined,
        material_name: itemFormData.material_name,
        material_grade: itemFormData.material_grade,
        material_standard: itemFormData.material_standard || undefined,
        material_color: itemFormData.material_color || undefined,
        density: parseFloat(itemFormData.density),
        unit: itemFormData.unit,
        rm_source: itemFormData.rm_source || undefined,
        rm_type: itemFormData.rm_type || undefined,
        rm_spec: itemFormData.rm_spec || undefined,
        drawing_no: itemFormData.drawing_no || undefined,
        revision_no: itemFormData.revision_no || '0',
        thickness: itemFormData.thickness ? parseFloat(itemFormData.thickness) : undefined,
        width: itemFormData.width ? parseFloat(itemFormData.width) : undefined,
        length: itemFormData.length ? parseFloat(itemFormData.length) : undefined,
        strip_size: itemFormData.strip_size ? parseFloat(itemFormData.strip_size) : undefined,
        pitch: itemFormData.pitch ? parseFloat(itemFormData.pitch) : undefined,
        no_of_cavity: itemFormData.no_of_cavity ? parseInt(itemFormData.no_of_cavity) : 1,
        rm_rejection_percent: itemFormData.rm_rejection_percent ? parseFloat(itemFormData.rm_rejection_percent) : 2.0,
        scrap_realisation_percent: itemFormData.scrap_realisation_percent ? parseFloat(itemFormData.scrap_realisation_percent) : 85,
        hsn_code: itemFormData.hsn_code,
        gst_percentage: itemFormData.gst_percentage ? parseFloat(itemFormData.gst_percentage) : 18,
        procurement_type: itemFormData.procurement_type || 'Manufacture',
        reorder_level: itemFormData.reorder_level ? parseInt(itemFormData.reorder_level) : undefined,
        reorder_qty: itemFormData.reorder_qty ? parseInt(itemFormData.reorder_qty) : undefined,
        lead_time_days: itemFormData.lead_time_days ? parseInt(itemFormData.lead_time_days) : undefined,
        safety_stock: itemFormData.safety_stock ? parseInt(itemFormData.safety_stock) : undefined,
        min_stock: itemFormData.min_stock ? parseInt(itemFormData.min_stock) : undefined,
        max_stock: itemFormData.max_stock ? parseInt(itemFormData.max_stock) : undefined,
        shelf_life_days: itemFormData.shelf_life_days ? parseInt(itemFormData.shelf_life_days) : undefined,
        item_role: 'component'
      };

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
        onSave(response.data.data);
      } else {
        setItemFormError(response.data.message || 'Failed to add item');
      }
    } catch (err) {
      console.error('Error adding item:', err);
      setItemFormError(err.response?.data?.message || 'Failed to add item. Please try again.');
    } finally {
      setItemFormLoading(false);
    }
  };

  const resetItemForm = () => {
    setItemFormData({
      part_no: '', part_name: '', part_description: '', item_category: '', item_type: '',
      sale_unit: '', weight_per_unit_kg: '', material_code: '', material_name: '',
      material_grade: '', material_standard: '', material_color: '', density: '', unit: '',
      rm_source: '', rm_type: '', rm_spec: '', drawing_no: '', revision_no: '',
      thickness: '', width: '', length: '', strip_size: '', pitch: '',
      no_of_cavity: 1, rm_rejection_percent: '', scrap_realisation_percent: '',
      hsn_code: '', gst_percentage: '', procurement_type: '',
      reorder_level: '', reorder_qty: '', lead_time_days: '',
      safety_stock: '', min_stock: '', max_stock: '', shelf_life_days: ''
    });
    setItemFieldErrors({});
    setItemTouched({});
    setItemFormError('');
    setItemStepper(0);
  };

  const handleCancel = () => {
    resetItemForm();
    onCancel();
  };

  const Label = ({ children, required }) => (
    <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary, letterSpacing: '0.5px' }}>
      {children} {required && <span style={{ color: '#EF4444' }}>*</span>}
    </Typography>
  );

  const textFieldSx = {
    '& .MuiOutlinedInput-root': {
      borderRadius: 1.5, fontSize: '0.75rem',
      '&:hover fieldset': { borderColor: COLORS.primary },
      '&.Mui-focused fieldset': { borderColor: COLORS.primary, borderWidth: 1 }
    },
    '& .MuiInputBase-input': {
      py: 1, px: 1.5, fontSize: '0.75rem', color: COLORS.text.primary,
      '&::placeholder': { color: COLORS.text.tertiary, fontSize: '0.75rem' }
    },
    '& .MuiFormHelperText-root': { fontSize: '0.65rem', marginLeft: 0, marginTop: 0.25 }
  };

  const numberFieldSx = {
    ...textFieldSx,
    '& input[type=number]': { MozAppearance: 'textfield' },
    '& input[type=number]::-webkit-outer-spin-button, & input[type=number]::-webkit-inner-spin-button': {
      WebkitAppearance: 'none', margin: 0
    }
  };

  const selectSx = {
    borderRadius: 1.5, fontSize: '0.75rem',
    '& .MuiSelect-select': { py: 1, px: 1.5, fontSize: '0.75rem' }
  };

  const renderItemStepContent = (step) => {
    const data = itemFormData;
    const errors = itemFieldErrors;
    const handleChange = handleItemFormChange;
    const handleBlur = handleItemBlur;
    const handleSelect = handleSelectChange;

    switch (step) {
      case 0:
        return (
          <Grid container spacing={1.5}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                <Label required>PART NUMBER</Label>
                <TextField fullWidth size="small" name="part_no"
                  value={data.part_no} onChange={handleChange} onBlur={handleBlur}
                  placeholder="e.g., BR-001" error={!!errors.part_no} helperText={errors.part_no}
                  sx={textFieldSx} disabled={itemFormLoading} inputProps={{ maxLength: 50 }}
                />
              </Box>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                <Label required>PART NAME</Label>
                <TextField fullWidth size="small" name="part_name"
                  value={data.part_name} onChange={handleChange} onBlur={handleBlur}
                  placeholder="e.g., Copper Busbar 100x10mm" error={!!errors.part_name} helperText={errors.part_name}
                  sx={textFieldSx} disabled={itemFormLoading} inputProps={{ maxLength: 100 }}
                />
              </Box>
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                <Label required>ITEM CATEGORY</Label>
                <FormControl fullWidth size="small" error={!!errors.item_category}>
                  <Select name="item_category" value={data.item_category} onChange={handleSelect} onBlur={handleBlur}
                    displayEmpty disabled={itemFormLoading} sx={selectSx}>
                    <MenuItem value="" disabled sx={{ fontSize: '0.75rem', color: COLORS.text.tertiary }}>Select category</MenuItem>
                    {itemCategoryOptions.map(opt => (
                      <MenuItem key={opt} value={opt} sx={{ fontSize: '0.75rem' }}>{opt}</MenuItem>
                    ))}
                  </Select>
                  {errors.item_category && <Typography sx={{ fontSize: '0.65rem', color: '#EF4444', mt: 0.25 }}>{errors.item_category}</Typography>}
                </FormControl>
              </Box>
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                <Label>ITEM TYPE</Label>
                <FormControl fullWidth size="small">
                  <Select name="item_type" value={data.item_type} onChange={handleSelect} onBlur={handleBlur}
                    displayEmpty disabled={itemFormLoading} sx={selectSx}>
                    <MenuItem value="" disabled sx={{ fontSize: '0.75rem' }}>Select type</MenuItem>
                    {itemTypeOptions.map(opt => (
                      <MenuItem key={opt} value={opt} sx={{ fontSize: '0.75rem' }}>{opt}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                <Label required>SALE UNIT</Label>
                <FormControl fullWidth size="small" error={!!errors.sale_unit}>
                  <Select name="sale_unit" value={data.sale_unit} onChange={handleSelect} onBlur={handleBlur}
                    displayEmpty disabled={itemFormLoading} sx={selectSx}>
                    <MenuItem value="" disabled sx={{ fontSize: '0.75rem' }}>Select sale unit</MenuItem>
                    {unitOptions.map(opt => (
                      <MenuItem key={opt} value={opt} sx={{ fontSize: '0.75rem' }}>{opt}</MenuItem>
                    ))}
                  </Select>
                  {errors.sale_unit && <Typography sx={{ fontSize: '0.65rem', color: '#EF4444', mt: 0.25 }}>{errors.sale_unit}</Typography>}
                </FormControl>
              </Box>
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                <Label>WEIGHT PER UNIT (kg)</Label>
                <TextField fullWidth size="small" name="weight_per_unit_kg" type="number"
                  value={data.weight_per_unit_kg} onChange={handleChange} onBlur={handleBlur}
                  placeholder="e.g., 0.85" error={!!errors.weight_per_unit_kg} helperText={errors.weight_per_unit_kg}
                  sx={numberFieldSx} disabled={itemFormLoading} inputProps={{ step: '0.001', min: 0 }}
                />
              </Box>
            </Grid>
            <Grid size={{ xs: 12 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                <Label required>PART DESCRIPTION</Label>
                <TextField fullWidth size="small" name="part_description" multiline rows={2}
                  value={data.part_description} onChange={handleChange} onBlur={handleBlur}
                  placeholder="Enter detailed part description" error={!!errors.part_description} helperText={errors.part_description}
                  sx={textFieldSx} disabled={itemFormLoading} inputProps={{ maxLength: 200 }}
                />
              </Box>
            </Grid>
          </Grid>
        );
      case 1:
        return (
          <Grid container spacing={1.5}>
            <Grid size={{ xs: 12, sm: 4 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                <Label required>MATERIAL NAME</Label>
                <TextField fullWidth size="small" name="material_name"
                  value={data.material_name} onChange={handleChange} onBlur={handleBlur}
                  placeholder="e.g., Copper" error={!!errors.material_name} helperText={errors.material_name}
                  sx={textFieldSx} disabled={itemFormLoading} inputProps={{ maxLength: 100 }}
                />
              </Box>
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                <Label>MATERIAL CODE</Label>
                <TextField fullWidth size="small" name="material_code"
                  value={data.material_code} onChange={handleChange} onBlur={handleBlur}
                  placeholder="e.g., CU-001" sx={textFieldSx} disabled={itemFormLoading} inputProps={{ maxLength: 50 }}
                />
              </Box>
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                <Label required>MATERIAL GRADE</Label>
                <TextField fullWidth size="small" name="material_grade"
                  value={data.material_grade} onChange={handleChange} onBlur={handleBlur}
                  placeholder="e.g., C11000" error={!!errors.material_grade} helperText={errors.material_grade}
                  sx={textFieldSx} disabled={itemFormLoading}
                />
              </Box>
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                <Label required>DENSITY (g/cm³)</Label>
                <TextField fullWidth size="small" name="density" type="number"
                  value={data.density} onChange={handleChange} onBlur={handleBlur}
                  placeholder="e.g., 8.96" error={!!errors.density} helperText={errors.density}
                  sx={numberFieldSx} disabled={itemFormLoading} inputProps={{ step: '0.01', min: 0 }}
                />
              </Box>
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                <Label required>UNIT</Label>
                <FormControl fullWidth size="small" error={!!errors.unit}>
                  <Select name="unit" value={data.unit} onChange={handleSelect} onBlur={handleBlur}
                    displayEmpty disabled={itemFormLoading} sx={selectSx}>
                    <MenuItem value="" disabled sx={{ fontSize: '0.75rem' }}>Select unit</MenuItem>
                    {unitOptions.map(opt => (
                      <MenuItem key={opt} value={opt} sx={{ fontSize: '0.75rem' }}>{opt}</MenuItem>
                    ))}
                  </Select>
                  {errors.unit && <Typography sx={{ fontSize: '0.65rem', color: '#EF4444', mt: 0.25 }}>{errors.unit}</Typography>}
                </FormControl>
              </Box>
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                <Label>MATERIAL STANDARD</Label>
                <TextField fullWidth size="small" name="material_standard"
                  value={data.material_standard} onChange={handleChange} onBlur={handleBlur}
                  placeholder="e.g., ASTM B152" sx={textFieldSx} disabled={itemFormLoading}
                />
              </Box>
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                <Label>MATERIAL COLOR</Label>
                <TextField fullWidth size="small" name="material_color"
                  value={data.material_color} onChange={handleChange} onBlur={handleBlur}
                  placeholder="e.g., Reddish" sx={textFieldSx} disabled={itemFormLoading}
                />
              </Box>
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                <Label required>HSN CODE</Label>
                <TextField fullWidth size="small" name="hsn_code"
                  value={data.hsn_code} onChange={handleChange} onBlur={handleBlur}
                  placeholder="e.g., 74071010" error={!!errors.hsn_code} helperText={errors.hsn_code}
                  sx={textFieldSx} disabled={itemFormLoading}
                />
              </Box>
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                <Label>GST PERCENTAGE (%)</Label>
                <TextField fullWidth size="small" name="gst_percentage" type="number"
                  value={data.gst_percentage} onChange={handleChange} onBlur={handleBlur}
                  placeholder="e.g., 18" error={!!errors.gst_percentage} helperText={errors.gst_percentage}
                  sx={numberFieldSx} disabled={itemFormLoading} inputProps={{ step: '0.1', min: 0, max: 100 }}
                />
              </Box>
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                <Label>PROCUREMENT TYPE</Label>
                <FormControl fullWidth size="small" error={!!errors.procurement_type}>
                  <Select name="procurement_type" value={data.procurement_type} onChange={handleSelect} onBlur={handleBlur}
                    displayEmpty disabled={itemFormLoading} sx={selectSx}>
                    <MenuItem value="" disabled sx={{ fontSize: '0.75rem' }}>Select procurement type</MenuItem>
                    {procurementTypeOptions.map(opt => (
                      <MenuItem key={opt} value={opt} sx={{ fontSize: '0.75rem' }}>{opt}</MenuItem>
                    ))}
                  </Select>
                  {errors.procurement_type && <Typography sx={{ fontSize: '0.65rem', color: '#EF4444', mt: 0.25 }}>{errors.procurement_type}</Typography>}
                </FormControl>
              </Box>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                <Label>DRAWING NUMBER</Label>
                <TextField fullWidth size="small" name="drawing_no"
                  value={data.drawing_no} onChange={handleChange} onBlur={handleBlur}
                  placeholder="e.g., DRG001" sx={textFieldSx} disabled={itemFormLoading}
                />
              </Box>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                <Label>REVISION NUMBER</Label>
                <TextField fullWidth size="small" name="revision_no"
                  value={data.revision_no} onChange={handleChange} onBlur={handleBlur}
                  placeholder="e.g., 0" sx={textFieldSx} disabled={itemFormLoading}
                />
              </Box>
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                <Label>THICKNESS (mm)</Label>
                <TextField fullWidth size="small" name="thickness" type="number"
                  value={data.thickness} onChange={handleChange} onBlur={handleBlur}
                  placeholder="e.g., 10" error={!!errors.thickness} helperText={errors.thickness}
                  sx={numberFieldSx} disabled={itemFormLoading} inputProps={{ step: '0.01', min: 0 }}
                />
              </Box>
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                <Label>WIDTH (mm)</Label>
                <TextField fullWidth size="small" name="width" type="number"
                  value={data.width} onChange={handleChange} onBlur={handleBlur}
                  placeholder="e.g., 100" error={!!errors.width} helperText={errors.width}
                  sx={numberFieldSx} disabled={itemFormLoading} inputProps={{ step: '0.01', min: 0 }}
                />
              </Box>
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                <Label>LENGTH (mm)</Label>
                <TextField fullWidth size="small" name="length" type="number"
                  value={data.length} onChange={handleChange} onBlur={handleBlur}
                  placeholder="e.g., 1000" error={!!errors.length} helperText={errors.length}
                  sx={numberFieldSx} disabled={itemFormLoading} inputProps={{ step: '0.01', min: 0 }}
                />
              </Box>
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                <Label>RM SOURCE (Supplier)</Label>
                <TextField fullWidth size="small" name="rm_source"
                  value={data.rm_source} onChange={handleChange} onBlur={handleBlur}
                  placeholder="e.g., Hindalco" sx={textFieldSx} disabled={itemFormLoading}
                />
              </Box>
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                <Label>RM TYPE</Label>
                <FormControl fullWidth size="small">
                  <Select name="rm_type" value={data.rm_type} onChange={handleSelect} onBlur={handleBlur}
                    displayEmpty disabled={itemFormLoading} sx={selectSx}>
                    <MenuItem value="" sx={{ fontSize: '0.75rem' }}>Select RM type</MenuItem>
                    {rmTypeOptions.map(opt => (
                      <MenuItem key={opt} value={opt} sx={{ fontSize: '0.75rem' }}>{opt}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                <Label>RM SPECIFICATION</Label>
                <TextField fullWidth size="small" name="rm_spec"
                  value={data.rm_spec} onChange={handleChange} onBlur={handleBlur}
                  placeholder="e.g., IS 191" sx={textFieldSx} disabled={itemFormLoading}
                />
              </Box>
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                <Label>STRIP SIZE (mm)</Label>
                <TextField fullWidth size="small" name="strip_size" type="number"
                  value={data.strip_size} onChange={handleChange} onBlur={handleBlur}
                  placeholder="e.g., 3660" error={!!errors.strip_size} helperText={errors.strip_size}
                  sx={numberFieldSx} disabled={itemFormLoading} inputProps={{ step: '0.01', min: 0 }}
                />
              </Box>
            </Grid>
          </Grid>
        );
      case 2:
        return (
          <Grid container spacing={1.5}>
            <Grid size={{ xs: 12, sm: 4 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                <Label>PITCH (mm)</Label>
                <TextField fullWidth size="small" name="pitch" type="number"
                  value={data.pitch} onChange={handleChange} onBlur={handleBlur}
                  placeholder="e.g., 42" error={!!errors.pitch} helperText={errors.pitch}
                  sx={numberFieldSx} disabled={itemFormLoading} inputProps={{ step: '0.01', min: 0 }}
                />
              </Box>
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                <Label>NUMBER OF CAVITIES</Label>
                <TextField fullWidth size="small" name="no_of_cavity" type="number"
                  value={data.no_of_cavity} onChange={handleChange} onBlur={handleBlur}
                  placeholder="e.g., 1" error={!!errors.no_of_cavity} helperText={errors.no_of_cavity}
                  sx={numberFieldSx} disabled={itemFormLoading} inputProps={{ step: '1', min: 1 }}
                />
              </Box>
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                <Label>RM REJECTION PERCENTAGE (%)</Label>
                <TextField fullWidth size="small" name="rm_rejection_percent" type="number"
                  value={data.rm_rejection_percent} onChange={handleChange} onBlur={handleBlur}
                  placeholder="e.g., 2" error={!!errors.rm_rejection_percent} helperText={errors.rm_rejection_percent}
                  sx={numberFieldSx} disabled={itemFormLoading} inputProps={{ step: '0.1', min: 0, max: 100 }}
                />
              </Box>
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                <Label>SCRAP REALISATION PERCENTAGE (%)</Label>
                <TextField fullWidth size="small" name="scrap_realisation_percent" type="number"
                  value={data.scrap_realisation_percent} onChange={handleChange} onBlur={handleBlur}
                  placeholder="e.g., 85" error={!!errors.scrap_realisation_percent} helperText={errors.scrap_realisation_percent}
                  sx={numberFieldSx} disabled={itemFormLoading} inputProps={{ step: '0.1', min: 0, max: 100 }}
                />
              </Box>
            </Grid>
          </Grid>
        );
      case 3:
        return (
          <Grid container spacing={1.5}>
            <Grid size={{ xs: 12, sm: 4 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                <Label>REORDER LEVEL</Label>
                <TextField fullWidth size="small" name="reorder_level" type="number"
                  value={data.reorder_level} onChange={handleChange} onBlur={handleBlur}
                  placeholder="e.g., 100" error={!!errors.reorder_level} helperText={errors.reorder_level}
                  sx={numberFieldSx} disabled={itemFormLoading} inputProps={{ step: '1', min: 0 }}
                />
              </Box>
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                <Label>REORDER QUANTITY</Label>
                <TextField fullWidth size="small" name="reorder_qty" type="number"
                  value={data.reorder_qty} onChange={handleChange} onBlur={handleBlur}
                  placeholder="e.g., 500" error={!!errors.reorder_qty} helperText={errors.reorder_qty}
                  sx={numberFieldSx} disabled={itemFormLoading} inputProps={{ step: '1', min: 0 }}
                />
              </Box>
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                <Label>LEAD TIME (Days)</Label>
                <TextField fullWidth size="small" name="lead_time_days" type="number"
                  value={data.lead_time_days} onChange={handleChange} onBlur={handleBlur}
                  placeholder="e.g., 7" error={!!errors.lead_time_days} helperText={errors.lead_time_days}
                  sx={numberFieldSx} disabled={itemFormLoading} inputProps={{ step: '1', min: 0 }}
                />
              </Box>
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                <Label>SAFETY STOCK</Label>
                <TextField fullWidth size="small" name="safety_stock" type="number"
                  value={data.safety_stock} onChange={handleChange} onBlur={handleBlur}
                  placeholder="e.g., 50" error={!!errors.safety_stock} helperText={errors.safety_stock}
                  sx={numberFieldSx} disabled={itemFormLoading} inputProps={{ step: '1', min: 0 }}
                />
              </Box>
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                <Label>MIN STOCK</Label>
                <TextField fullWidth size="small" name="min_stock" type="number"
                  value={data.min_stock} onChange={handleChange} onBlur={handleBlur}
                  placeholder="e.g., 50" error={!!errors.min_stock} helperText={errors.min_stock}
                  sx={numberFieldSx} disabled={itemFormLoading} inputProps={{ step: '1', min: 0 }}
                />
              </Box>
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                <Label>MAX STOCK</Label>
                <TextField fullWidth size="small" name="max_stock" type="number"
                  value={data.max_stock} onChange={handleChange} onBlur={handleBlur}
                  placeholder="e.g., 2000" error={!!errors.max_stock} helperText={errors.max_stock}
                  sx={numberFieldSx} disabled={itemFormLoading} inputProps={{ step: '1', min: 0 }}
                />
              </Box>
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                <Label>SHELF LIFE (Days)</Label>
                <TextField fullWidth size="small" name="shelf_life_days" type="number"
                  value={data.shelf_life_days} onChange={handleChange} onBlur={handleBlur}
                  placeholder="e.g., 365" error={!!errors.shelf_life_days} helperText={errors.shelf_life_days}
                  sx={numberFieldSx} disabled={itemFormLoading} inputProps={{ step: '1', min: 0 }}
                />
              </Box>
            </Grid>
          </Grid>
        );
      default:
        return null;
    }
  };

  return (
    <Paper sx={{ mt: 2, p: 2, bgcolor: COLORS.background.light, borderRadius: 2, border: `2px solid ${COLORS.primary}` }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color: COLORS.primary }}>
          <ProductionIcon sx={{ fontSize: '1rem', mr: 1, verticalAlign: 'middle' }} />
          Add New Item
        </Typography>
        <IconButton size="small" onClick={handleCancel} sx={{ color: COLORS.text.tertiary, '&:hover': { color: COLORS.primary } }} disabled={itemFormLoading}>
          <CloseIcon sx={{ fontSize: '1rem' }} />
        </IconButton>
      </Box>

      <Stepper activeStep={itemStepper} sx={{ mb: 3 }} connector={<ColorConnector />}>
        {ITEM_STEPS.map((label, index) => (
          <Step key={label}>
            <StepLabel>
              <Typography sx={{ fontSize: '0.65rem', fontWeight: 500 }}>{index + 1}. {label}</Typography>
            </StepLabel>
          </Step>
        ))}
      </Stepper>

      {renderItemStepContent(itemStepper)}

      {itemFormError && (
        <Alert severity="error" sx={{ mt: 2, borderRadius: 1.5, fontSize: '0.75rem', py: 0.5 }}>
          {itemFormError}
        </Alert>
      )}

      <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Button
          onClick={handleItemBack}
          disabled={itemStepper === 0 || itemFormLoading}
          size="small"
          startIcon={<NavigateBeforeIcon sx={{ fontSize: '1rem' }} />}
          sx={{
            height: 32, px: 2, borderRadius: 1.5,
            border: `1px solid ${COLORS.border}`,
            color: COLORS.text.secondary,
            fontSize: '0.7rem', fontWeight: 500, textTransform: 'none',
            '&:hover': { borderColor: COLORS.primary, bgcolor: `${COLORS.primary}10` }
          }}
        >
          Back
        </Button>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            onClick={handleCancel}
            disabled={itemFormLoading}
            size="small"
            sx={{
              height: 32, px: 2, borderRadius: 1.5,
              border: `1px solid ${COLORS.border}`,
              color: COLORS.text.secondary,
              fontSize: '0.7rem', fontWeight: 500, textTransform: 'none',
              '&:hover': { borderColor: COLORS.primary, bgcolor: `${COLORS.primary}10` }
            }}
          >
            Cancel
          </Button>
          {itemStepper === ITEM_STEPS.length - 1 ? (
            <Button
              variant="contained"
              onClick={handleItemSubmit}
              disabled={itemFormLoading}
              size="small"
              startIcon={itemFormLoading ? <CircularProgress size={16} color="inherit" /> : <SaveIcon sx={{ fontSize: '1rem' }} />}
              sx={{
                height: 32, px: 2, borderRadius: 1.5,
                bgcolor: COLORS.primary,
                fontSize: '0.7rem', fontWeight: 500, textTransform: 'none',
                '&:hover': { bgcolor: COLORS.primaryDark }
              }}
            >
              {itemFormLoading ? 'Saving...' : 'Save Item'}
            </Button>
          ) : (
            <Button
              variant="contained"
              onClick={handleItemNext}
              disabled={itemFormLoading}
              size="small"
              endIcon={<NavigateNextIcon sx={{ fontSize: '1rem' }} />}
              sx={{
                height: 32, px: 2, borderRadius: 1.5,
                bgcolor: COLORS.primary,
                fontSize: '0.7rem', fontWeight: 500, textTransform: 'none',
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

// ============================================
// INLINE BOM FORM (Full 4-Step - Matching AddBom)
// ============================================
const InlineBomForm = ({ onSave, onCancel }) => {
  const [bomActiveStep, setBomActiveStep] = useState(0);
  const [bomFormLoading, setBomFormLoading] = useState(false);
  const [bomFormError, setBomFormError] = useState('');
  const [bomFieldErrors, setBomFieldErrors] = useState({});
  
  // BOM Form Data
  const [bomFormData, setBomFormData] = useState({
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
    bom_category: 'Standard'
  });
  
  // BOM Components
  const [bomComponents, setBomComponents] = useState([
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
  
  // Parent Item Form State (inline within BOM)
  const [showAddParentForm, setShowAddParentForm] = useState(false);
  const [parentActiveStep, setParentActiveStep] = useState(0);
  const [addParentLoading, setAddParentLoading] = useState(false);
  const [addParentError, setAddParentError] = useState('');
  const [parentFieldErrors, setParentFieldErrors] = useState({});
  const [parentTouched, setParentTouched] = useState({});
  
  // Parent item data
  const [newParentData, setNewParentData] = useState({
    part_no: '', part_name: '', item_category: '', item_type: '', unit: 'Kg',
    part_description: '', weight_per_unit_kg: '', material: '', material_grade: '',
    material_standard: '', material_color: '', density: '', drawing_no: '',
    revision_no: '', thickness: '', width: '', strip_size: '', pitch: '',
    no_of_cavity: 1, hsn_code: '', gst_percentage: 18, procurement_type: 'Purchase',
    rm_rejection_percent: 2, scrap_realisation_percent: 85, lead_time_days: '',
    reorder_level: '', reorder_qty: '', safety_stock: '', min_stock: '',
    max_stock: '', shelf_life_days: ''
  });

  // Data from APIs
  const [parentItems, setParentItems] = useState([]);
  const [componentItems, setComponentItems] = useState([]);
  const [loadingItems, setLoadingItems] = useState(false);

  // Fetch items
  useEffect(() => {
    const fetchItems = async () => {
      try {
        setLoadingItems(true);
        const token = localStorage.getItem('token');
        const response = await axios.get(`${BASE_URL}/api/items`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.data.success) {
          const parents = response.data.data.filter(item => item.item_role === 'parent');
          const components = response.data.data.filter(item => item.item_role === 'component');
          setParentItems(parents);
          setComponentItems(components);
        }
      } catch (err) {
        console.error('Error fetching items:', err);
      } finally {
        setLoadingItems(false);
      }
    };
    fetchItems();
  }, []);

  const handleParentFormChange = (e) => {
    const { name, value } = e.target;
    setNewParentData(prev => ({ ...prev, [name]: value }));
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
      case 0:
        if (!newParentData.part_no.trim()) { errors.part_no = 'Part Number is required'; isValid = false; }
        if (!newParentData.part_name.trim()) { errors.part_name = 'Part Name is required'; isValid = false; }
        if (!newParentData.item_category) { errors.item_category = 'Item Category is required'; isValid = false; }
        if (!newParentData.item_type) { errors.item_type = 'Item Type is required'; isValid = false; }
        if (!newParentData.unit) { errors.unit = 'Unit is required'; isValid = false; }
        if (newParentData.unit !== 'Kg' && !newParentData.weight_per_unit_kg) {
          errors.weight_per_unit_kg = 'Weight per unit is required when unit is not Kg';
          isValid = false;
        }
        break;
      case 1:
        if (!newParentData.density) { errors.density = 'Density is required'; isValid = false; }
        if (!newParentData.drawing_no) { errors.drawing_no = 'Drawing No is required'; isValid = false; }
        break;
      case 2:
        if (newParentData.thickness && isNaN(newParentData.thickness)) { errors.thickness = 'Thickness must be a number'; isValid = false; }
        if (newParentData.width && isNaN(newParentData.width)) { errors.width = 'Width must be a number'; isValid = false; }
        if (newParentData.strip_size && isNaN(newParentData.strip_size)) { errors.strip_size = 'Strip size must be a number'; isValid = false; }
        break;
      case 3:
        if (!newParentData.hsn_code) { errors.hsn_code = 'HSN Code is required'; isValid = false; }
        if (!newParentData.procurement_type) { errors.procurement_type = 'Procurement type is required'; isValid = false; }
        break;
      default: return true;
    }

    setParentFieldErrors(errors);
    if (!isValid) { setAddParentError('Please fix the errors in this section'); }
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

  const handleAddParentSubmit = async () => {
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
      const payload = {
        part_no: newParentData.part_no, part_name: newParentData.part_name,
        part_description: newParentData.part_description || '',
        item_category: newParentData.item_category, item_type: newParentData.item_type,
        unit: newParentData.unit,
        weight_per_unit_kg: newParentData.weight_per_unit_kg ? Number(newParentData.weight_per_unit_kg) : undefined,
        material: newParentData.material || '', material_grade: newParentData.material_grade || '',
        material_standard: newParentData.material_standard || '', material_color: newParentData.material_color || '',
        density: newParentData.density ? Number(newParentData.density) : 0,
        drawing_no: newParentData.drawing_no || '', revision_no: newParentData.revision_no || '0',
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
      Object.keys(payload).forEach(key => {
        if (payload[key] === undefined || payload[key] === null || payload[key] === '') { delete payload[key]; }
      });

      const response = await axios.post(`${BASE_URL}/api/items`, payload, {
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
      });

      if (response.data.success) {
        const newItem = response.data.data;
        setParentItems(prev => [...prev, newItem]);
        setBomFormData(prev => ({ ...prev, parent_item_id: newItem._id }));
        setShowAddParentForm(false);
        resetParentFormData();
        setBomFieldErrors(prev => ({ ...prev, parent_item_id: '' }));
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

  const resetParentFormData = () => {
    setNewParentData({
      part_no: '', part_name: '', item_category: '', item_type: '', unit: 'Kg',
      part_description: '', weight_per_unit_kg: '', material: '', material_grade: '',
      material_standard: '', material_color: '', density: '', drawing_no: '',
      revision_no: '', thickness: '', width: '', strip_size: '', pitch: '',
      no_of_cavity: 1, hsn_code: '', gst_percentage: 18, procurement_type: 'Purchase',
      rm_rejection_percent: 2, scrap_realisation_percent: 85, lead_time_days: '',
      reorder_level: '', reorder_qty: '', safety_stock: '', min_stock: '',
      max_stock: '', shelf_life_days: ''
    });
    setParentActiveStep(0);
    setParentFieldErrors({});
    setParentTouched({});
    setAddParentError('');
  };

  const renderParentStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Grid container spacing={1.5}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary }}>
                  PART NUMBER <span style={{ color: '#EF4444' }}>*</span>
                </Typography>
                <TextField fullWidth size="small" name="part_no" value={newParentData.part_no}
                  onChange={handleParentFormChange} onBlur={handleParentBlur}
                  placeholder="e.g., BR-001" disabled={addParentLoading}
                  error={!!parentFieldErrors.part_no} helperText={parentFieldErrors.part_no}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5, fontSize: '0.75rem' } }} />
              </Box>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary }}>
                  PART NAME <span style={{ color: '#EF4444' }}>*</span>
                </Typography>
                <TextField fullWidth size="small" name="part_name" value={newParentData.part_name}
                  onChange={handleParentFormChange} onBlur={handleParentBlur}
                  placeholder="e.g., Copper Busbar 100x10mm" disabled={addParentLoading}
                  error={!!parentFieldErrors.part_name} helperText={parentFieldErrors.part_name}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5, fontSize: '0.75rem' } }} />
              </Box>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary }}>
                  ITEM CATEGORY <span style={{ color: '#EF4444' }}>*</span>
                </Typography>
                <FormControl fullWidth size="small" error={!!parentFieldErrors.item_category}>
                  <Select name="item_category" value={newParentData.item_category}
                    onChange={handleParentFormChange} onBlur={handleParentBlur}
                    disabled={addParentLoading} displayEmpty
                    sx={{ borderRadius: 1.5, fontSize: '0.75rem' }}>
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
                  <Select name="item_type" value={newParentData.item_type}
                    onChange={handleParentFormChange} onBlur={handleParentBlur}
                    disabled={addParentLoading} displayEmpty
                    sx={{ borderRadius: 1.5, fontSize: '0.75rem' }}>
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
                  <Select name="unit" value={newParentData.unit}
                    onChange={handleParentFormChange} onBlur={handleParentBlur}
                    disabled={addParentLoading} sx={{ borderRadius: 1.5, fontSize: '0.75rem' }}>
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
                <TextField fullWidth size="small" name="weight_per_unit_kg" type="number"
                  value={newParentData.weight_per_unit_kg} onChange={handleParentFormChange} onBlur={handleParentBlur}
                  placeholder="e.g., 0.85" error={!!parentFieldErrors.weight_per_unit_kg}
                  helperText={parentFieldErrors.weight_per_unit_kg} disabled={addParentLoading}
                  inputProps={{ step: '0.001', min: 0 }}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5, fontSize: '0.75rem' } }} />
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
                <TextField fullWidth size="small" name="part_description" multiline rows={2}
                  value={newParentData.part_description} onChange={handleParentFormChange} onBlur={handleParentBlur}
                  placeholder="Enter detailed part description" disabled={addParentLoading}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5, fontSize: '0.75rem' } }} />
              </Box>
            </Grid>
          </Grid>
        );
      case 1:
        return (
          <Grid container spacing={1.5}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary }}>MATERIAL</Typography>
                <FormControl fullWidth size="small">
                  <Select name="material" value={newParentData.material}
                    onChange={handleParentFormChange} onBlur={handleParentBlur}
                    disabled={addParentLoading} displayEmpty
                    sx={{ borderRadius: 1.5, fontSize: '0.75rem' }}>
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
                <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary }}>MATERIAL GRADE</Typography>
                <TextField fullWidth size="small" name="material_grade" value={newParentData.material_grade}
                  onChange={handleParentFormChange} onBlur={handleParentBlur}
                  placeholder="e.g., C11000" disabled={addParentLoading}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5, fontSize: '0.75rem' } }} />
              </Box>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary }}>MATERIAL STANDARD</Typography>
                <TextField fullWidth size="small" name="material_standard" value={newParentData.material_standard}
                  onChange={handleParentFormChange} onBlur={handleParentBlur}
                  placeholder="e.g., ASTM B152" disabled={addParentLoading}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5, fontSize: '0.75rem' } }} />
              </Box>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary }}>MATERIAL COLOR</Typography>
                <TextField fullWidth size="small" name="material_color" value={newParentData.material_color}
                  onChange={handleParentFormChange} onBlur={handleParentBlur}
                  placeholder="e.g., Reddish" disabled={addParentLoading}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5, fontSize: '0.75rem' } }} />
              </Box>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary }}>
                  DENSITY (g/cm³) <span style={{ color: '#EF4444' }}>*</span>
                </Typography>
                <TextField fullWidth size="small" name="density" type="number"
                  value={newParentData.density} onChange={handleParentFormChange} onBlur={handleParentBlur}
                  placeholder="e.g., 8.96" error={!!parentFieldErrors.density} helperText={parentFieldErrors.density}
                  disabled={addParentLoading} inputProps={{ step: '0.01', min: 0 }}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5, fontSize: '0.75rem' } }} />
              </Box>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary }}>
                  DRAWING NO <span style={{ color: '#EF4444' }}>*</span>
                </Typography>
                <TextField fullWidth size="small" name="drawing_no" value={newParentData.drawing_no}
                  onChange={handleParentFormChange} onBlur={handleParentBlur}
                  placeholder="e.g., DRG-001" error={!!parentFieldErrors.drawing_no}
                  helperText={parentFieldErrors.drawing_no} disabled={addParentLoading}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5, fontSize: '0.75rem' } }} />
              </Box>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary }}>REVISION NO</Typography>
                <TextField fullWidth size="small" name="revision_no" value={newParentData.revision_no}
                  onChange={handleParentFormChange} onBlur={handleParentBlur}
                  placeholder="e.g., 0, A" disabled={addParentLoading}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5, fontSize: '0.75rem' } }} />
              </Box>
            </Grid>
          </Grid>
        );
      case 2:
        return (
          <Grid container spacing={1.5}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary }}>THICKNESS (mm)</Typography>
                <TextField fullWidth size="small" name="thickness" type="number"
                  value={newParentData.thickness} onChange={handleParentFormChange} onBlur={handleParentBlur}
                  placeholder="e.g., 10" error={!!parentFieldErrors.thickness} helperText={parentFieldErrors.thickness}
                  disabled={addParentLoading} inputProps={{ step: '0.01', min: 0 }}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5, fontSize: '0.75rem' } }} />
              </Box>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary }}>WIDTH (mm)</Typography>
                <TextField fullWidth size="small" name="width" type="number"
                  value={newParentData.width} onChange={handleParentFormChange} onBlur={handleParentBlur}
                  placeholder="e.g., 100" error={!!parentFieldErrors.width} helperText={parentFieldErrors.width}
                  disabled={addParentLoading} inputProps={{ step: '0.01', min: 0 }}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5, fontSize: '0.75rem' } }} />
              </Box>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary }}>STRIP SIZE (mm)</Typography>
                <TextField fullWidth size="small" name="strip_size" type="number"
                  value={newParentData.strip_size} onChange={handleParentFormChange} onBlur={handleParentBlur}
                  placeholder="e.g., 3660" error={!!parentFieldErrors.strip_size} helperText={parentFieldErrors.strip_size}
                  disabled={addParentLoading} inputProps={{ step: '0.01', min: 0 }}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5, fontSize: '0.75rem' } }} />
              </Box>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary }}>PITCH (mm)</Typography>
                <TextField fullWidth size="small" name="pitch" type="number"
                  value={newParentData.pitch} onChange={handleParentFormChange} onBlur={handleParentBlur}
                  placeholder="e.g., 42" disabled={addParentLoading} inputProps={{ step: '0.01', min: 0 }}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5, fontSize: '0.75rem' } }} />
              </Box>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary }}>NO. OF CAVITIES</Typography>
                <TextField fullWidth size="small" name="no_of_cavity" type="number"
                  value={newParentData.no_of_cavity} onChange={handleParentFormChange} onBlur={handleParentBlur}
                  placeholder="e.g., 1" disabled={addParentLoading} inputProps={{ step: '1', min: 1 }}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5, fontSize: '0.75rem' } }} />
              </Box>
            </Grid>
          </Grid>
        );
      case 3:
        return (
          <Grid container spacing={1.5}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary }}>
                  HSN CODE <span style={{ color: '#EF4444' }}>*</span>
                </Typography>
                <TextField fullWidth size="small" name="hsn_code" value={newParentData.hsn_code}
                  onChange={handleParentFormChange} onBlur={handleParentBlur}
                  placeholder="e.g., 74071010" error={!!parentFieldErrors.hsn_code}
                  helperText={parentFieldErrors.hsn_code} disabled={addParentLoading}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5, fontSize: '0.75rem' } }} />
              </Box>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary }}>GST PERCENTAGE (%)</Typography>
                <TextField fullWidth size="small" name="gst_percentage" type="number"
                  value={newParentData.gst_percentage} onChange={handleParentFormChange} onBlur={handleParentBlur}
                  placeholder="e.g., 18" disabled={addParentLoading} inputProps={{ step: '0.1', min: 0 }}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5, fontSize: '0.75rem' } }} />
              </Box>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary }}>
                  PROCUREMENT TYPE <span style={{ color: '#EF4444' }}>*</span>
                </Typography>
                <FormControl fullWidth size="small" error={!!parentFieldErrors.procurement_type}>
                  <Select name="procurement_type" value={newParentData.procurement_type}
                    onChange={handleParentFormChange} onBlur={handleParentBlur}
                    disabled={addParentLoading} sx={{ borderRadius: 1.5, fontSize: '0.75rem' }}>
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
                <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary }}>RM REJECTION (%)</Typography>
                <TextField fullWidth size="small" name="rm_rejection_percent" type="number"
                  value={newParentData.rm_rejection_percent} onChange={handleParentFormChange} onBlur={handleParentBlur}
                  placeholder="e.g., 2" disabled={addParentLoading} inputProps={{ step: '0.1', min: 0, max: 100 }}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5, fontSize: '0.75rem' } }} />
              </Box>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary }}>SCRAP REALISATION (%)</Typography>
                <TextField fullWidth size="small" name="scrap_realisation_percent" type="number"
                  value={newParentData.scrap_realisation_percent} onChange={handleParentFormChange} onBlur={handleParentBlur}
                  placeholder="e.g., 85" disabled={addParentLoading} inputProps={{ step: '0.1', min: 0, max: 100 }}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5, fontSize: '0.75rem' } }} />
              </Box>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary }}>LEAD TIME (days)</Typography>
                <TextField fullWidth size="small" name="lead_time_days" type="number"
                  value={newParentData.lead_time_days} onChange={handleParentFormChange} onBlur={handleParentBlur}
                  placeholder="e.g., 7" disabled={addParentLoading} inputProps={{ step: '1', min: 0 }}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5, fontSize: '0.75rem' } }} />
              </Box>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary }}>REORDER LEVEL</Typography>
                <TextField fullWidth size="small" name="reorder_level" type="number"
                  value={newParentData.reorder_level} onChange={handleParentFormChange} onBlur={handleParentBlur}
                  placeholder="e.g., 100" disabled={addParentLoading} inputProps={{ step: '1', min: 0 }}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5, fontSize: '0.75rem' } }} />
              </Box>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary }}>REORDER QTY</Typography>
                <TextField fullWidth size="small" name="reorder_qty" type="number"
                  value={newParentData.reorder_qty} onChange={handleParentFormChange} onBlur={handleParentBlur}
                  placeholder="e.g., 200" disabled={addParentLoading} inputProps={{ step: '1', min: 0 }}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5, fontSize: '0.75rem' } }} />
              </Box>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary }}>SAFETY STOCK</Typography>
                <TextField fullWidth size="small" name="safety_stock" type="number"
                  value={newParentData.safety_stock} onChange={handleParentFormChange} onBlur={handleParentBlur}
                  placeholder="e.g., 40" disabled={addParentLoading} inputProps={{ step: '1', min: 0 }}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5, fontSize: '0.75rem' } }} />
              </Box>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary }}>MIN STOCK</Typography>
                <TextField fullWidth size="small" name="min_stock" type="number"
                  value={newParentData.min_stock} onChange={handleParentFormChange} onBlur={handleParentBlur}
                  placeholder="e.g., 40" disabled={addParentLoading} inputProps={{ step: '1', min: 0 }}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5, fontSize: '0.75rem' } }} />
              </Box>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary }}>MAX STOCK</Typography>
                <TextField fullWidth size="small" name="max_stock" type="number"
                  value={newParentData.max_stock} onChange={handleParentFormChange} onBlur={handleParentBlur}
                  placeholder="e.g., 200" disabled={addParentLoading} inputProps={{ step: '1', min: 0 }}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5, fontSize: '0.75rem' } }} />
              </Box>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary }}>SHELF LIFE (days)</Typography>
                <TextField fullWidth size="small" name="shelf_life_days" type="number"
                  value={newParentData.shelf_life_days} onChange={handleParentFormChange} onBlur={handleParentBlur}
                  placeholder="e.g., 365" disabled={addParentLoading} inputProps={{ step: '1', min: 0 }}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5, fontSize: '0.75rem' } }} />
              </Box>
            </Grid>
          </Grid>
        );
      default: return null;
    }
  };

  // BOM Form Handlers
  const handleBomChange = (e) => {
    const { name, value } = e.target;
    setBomFormData(prev => ({ ...prev, [name]: value }));
    setBomFieldErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleBomCategoryChange = (e) => {
    const value = e.target.value;
    setBomFormData(prev => ({ ...prev, bom_category: value }));
    setBomFieldErrors(prev => ({ ...prev, bom_category: '' }));
    if (value === 'Standard') {
      setBomComponents([
        { level: 1, component_item_id: '', component_part_no: '', component_desc: '',
          quantity_per: 1, unit: 'Nos', scrap_percent: 0, is_phantom: false,
          is_subcontract: false, subcontract_vendor: null, reference_designator: '', remarks: '' }
      ]);
    }
  };

  const handleComponentChange = (index, field, value) => {
    if (bomFormData.bom_category === 'Standard') {
      setBomFormError('Standard BOM cannot have components. Please change BOM Category to "Assembly".');
      return;
    }
    const updatedComponents = [...bomComponents];
    updatedComponents[index][field] = value;
    if (field === 'component_item_id' && value) {
      const selectedItem = componentItems.find(item => item._id === value);
      if (selectedItem) {
        updatedComponents[index].component_part_no = selectedItem.part_no || '';
        updatedComponents[index].component_desc = selectedItem.part_description || '';
        updatedComponents[index].unit = selectedItem.unit || 'Nos';
      }
    }
    setBomComponents(updatedComponents);
    setBomFieldErrors(prev => ({ ...prev, [`comp_${index}_${field}`]: '' }));
  };

  const addComponent = () => {
    if (bomFormData.bom_category === 'Standard') {
      setBomFormError('Standard BOM cannot have components. Please change BOM Category to "Assembly".');
      return;
    }
    setBomComponents([
      ...bomComponents,
      { level: bomComponents.length + 1, component_item_id: '', component_part_no: '',
        component_desc: '', quantity_per: 1, unit: 'Nos', scrap_percent: 0,
        is_phantom: false, is_subcontract: false, subcontract_vendor: null,
        reference_designator: '', remarks: '' }
    ]);
  };

  const removeComponent = (index) => {
    if (bomComponents.length > 1) {
      const updatedComponents = bomComponents.filter((_, i) => i !== index);
      updatedComponents.forEach((comp, idx) => { comp.level = idx + 1; });
      setBomComponents(updatedComponents);
    }
  };

  const validateBomStep = (step) => {
    const errors = {};
    let isValid = true;

    switch (step) {
      case 0:
        if (!bomFormData.parent_item_id) { errors.parent_item_id = 'Parent item is required'; isValid = false; }
        if (!bomFormData.bom_version.trim()) { errors.bom_version = 'BOM version is required'; isValid = false; }
        if (!bomFormData.bom_type) { errors.bom_type = 'BOM type is required'; isValid = false; }
        if (!bomFormData.bom_category) { errors.bom_category = 'BOM category is required'; isValid = false; }
        if (!bomFormData.effective_from) { errors.effective_from = 'Effective from date is required'; isValid = false; }
        break;
      case 2:
        if (bomFormData.bom_category === 'Assembly') {
          let hasValidComponent = false;
          bomComponents.forEach((comp, index) => {
            if (comp.component_item_id) { hasValidComponent = true; }
            if (!comp.component_item_id) {
              errors[`comp_${index}_component_item_id`] = `Component ${index + 1}: Item is required for Assembly BOM`;
              isValid = false;
            }
            if (!comp.quantity_per || comp.quantity_per <= 0) {
              errors[`comp_${index}_quantity_per`] = `Component ${index + 1}: Valid quantity is required`;
              isValid = false;
            }
          });
          if (!hasValidComponent) { errors.components = 'At least one component is required for Assembly BOM'; isValid = false; }
        }
        break;
      default: return true;
    }

    setBomFieldErrors(errors);
    if (!isValid) { setBomFormError('Please fix the errors in this section'); }
    return isValid;
  };

  const handleBomNext = () => {
    if (validateBomStep(bomActiveStep)) {
      setBomFormError('');
      setBomActiveStep(prev => prev + 1);
    }
  };

  const handleBomBack = () => {
    setBomFormError('');
    setBomActiveStep(prev => prev - 1);
  };

  const handleBomSubmit = async () => {
    if (!validateBomStep(bomActiveStep)) return;
    if (bomFormData.bom_category === 'Assembly') {
      const hasComponents = bomComponents.some(comp => comp.component_item_id);
      if (!hasComponents) { setBomFormError('Assembly BOM must have at least one component.'); return; }
    }

    setBomFormLoading(true);
    setBomFormError('');

    try {
      const token = localStorage.getItem('token');
      const submitData = {
        ...bomFormData,
        batch_size: Number(bomFormData.batch_size),
        yield_percent: Number(bomFormData.yield_percent),
        setup_time_min: Number(bomFormData.setup_time_min),
        cycle_time_min: Number(bomFormData.cycle_time_min),
        components: bomFormData.bom_category === 'Assembly'
          ? bomComponents.map(comp => ({ ...comp, level: Number(comp.level), quantity_per: Number(comp.quantity_per), scrap_percent: Number(comp.scrap_percent) }))
          : []
      };

      const response = await axios.post(`${BASE_URL}/api/boms`, submitData, {
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
      });

      if (response.data.success) { onSave(response.data.data); }
      else { setBomFormError(response.data.message || 'Failed to add BOM'); }
    } catch (err) {
      console.error('Error adding BOM:', err);
      setBomFormError(err.response?.data?.message || 'Failed to add BOM. Please try again.');
    } finally { setBomFormLoading(false); }
  };

  const resetBomForm = () => {
    setBomFormData({
      parent_item_id: '', bom_version: 'v1.0', bom_type: 'Manufacturing',
      status: 'Pending', batch_size: 1, yield_percent: 100,
      setup_time_min: 30, cycle_time_min: 5.5,
      effective_from: new Date().toISOString().split('T')[0],
      effective_to: '', bom_category: 'Standard'
    });
    setBomComponents([
      { level: 1, component_item_id: '', component_part_no: '', component_desc: '',
        quantity_per: 1, unit: 'Nos', scrap_percent: 0, is_phantom: false,
        is_subcontract: false, subcontract_vendor: null, reference_designator: '', remarks: '' }
    ]);
    setBomFieldErrors({});
    setBomFormError('');
    setBomActiveStep(0);
  };

  const handleCancel = () => {
    resetBomForm();
    onCancel();
  };

  const Label = ({ children, required }) => (
    <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary, letterSpacing: '0.5px' }}>
      {children} {required && <span style={{ color: '#EF4444' }}>*</span>}
    </Typography>
  );

  const textFieldSx = {
    '& .MuiOutlinedInput-root': { borderRadius: 1.5, fontSize: '0.75rem',
      '&:hover fieldset': { borderColor: COLORS.primary }, '&.Mui-focused fieldset': { borderColor: COLORS.primary, borderWidth: 1 } },
    '& .MuiInputBase-input': { py: 1, px: 1.5, fontSize: '0.75rem', color: COLORS.text.primary,
      '&::placeholder': { color: COLORS.text.tertiary, fontSize: '0.75rem' } },
    '& .MuiFormHelperText-root': { fontSize: '0.65rem', marginLeft: 0, marginTop: 0.25 }
  };

  const selectSx = { borderRadius: 1.5, fontSize: '0.75rem', '& .MuiSelect-select': { py: 1, px: 1.5, fontSize: '0.75rem' } };

  const renderBomStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Grid container spacing={2}>
            <Grid size={{ xs: 12 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Label required>PARENT ITEM</Label>
                  <Button size="small" onClick={() => {
                    if (!showAddParentForm) {
                      setShowAddParentForm(true);
                      resetParentFormData();
                      setBomFormData(prev => ({ ...prev, parent_item_id: '' }));
                    } else {
                      setShowAddParentForm(false);
                      resetParentFormData();
                    }
                  }} startIcon={showAddParentForm ? <CloseIcon sx={{ fontSize: '0.875rem' }} /> : <AddIcon sx={{ fontSize: '0.875rem' }} />}
                    sx={{ height: 24, px: 1.5, borderRadius: 1, color: COLORS.primary, fontSize: '0.6rem', fontWeight: 500,
                      textTransform: 'none', '&:hover': { bgcolor: COLORS.primaryLight } }}>
                    {showAddParentForm ? 'Cancel' : 'Add New'}
                  </Button>
                </Box>
                <Autocomplete fullWidth options={parentItems} loading={loadingItems}
                  getOptionLabel={(option) => `${option.part_no} - ${option.part_description}`}
                  value={parentItems.find(item => item._id === bomFormData.parent_item_id) || null}
                  onChange={(event, newValue) => {
                    if (newValue) {
                      setBomFormData(prev => ({ ...prev, parent_item_id: newValue._id }));
                      setBomFieldErrors(prev => ({ ...prev, parent_item_id: '' }));
                      setNewParentData({
                        part_no: newValue.part_no || '', part_name: newValue.part_name || '',
                        item_category: newValue.item_category || '', item_type: newValue.item_type || '',
                        unit: newValue.unit || 'Kg', part_description: newValue.part_description || '',
                        weight_per_unit_kg: newValue.weight_per_unit_kg || '', material: newValue.material || '',
                        material_grade: newValue.material_grade || '', material_standard: newValue.material_standard || '',
                        material_color: newValue.material_color || '', density: newValue.density || '',
                        drawing_no: newValue.drawing_no || '', revision_no: newValue.revision_no || '',
                        thickness: newValue.thickness || '', width: newValue.width || '',
                        strip_size: newValue.strip_size || '', pitch: newValue.pitch || '',
                        no_of_cavity: newValue.no_of_cavity || 1, hsn_code: newValue.hsn_code || '',
                        gst_percentage: newValue.gst_percentage || 18, procurement_type: newValue.procurement_type || 'Purchase',
                        rm_rejection_percent: newValue.rm_rejection_percent || 2, scrap_realisation_percent: newValue.scrap_realisation_percent || 85,
                        lead_time_days: newValue.lead_time_days || '', reorder_level: newValue.reorder_level || '',
                        reorder_qty: newValue.reorder_qty || '', safety_stock: newValue.safety_stock || '',
                        min_stock: newValue.min_stock || '', max_stock: newValue.max_stock || '',
                        shelf_life_days: newValue.shelf_life_days || ''
                      });
                      setShowAddParentForm(true);
                      setParentActiveStep(0);
                    } else {
                      setBomFormData(prev => ({ ...prev, parent_item_id: '' }));
                      setShowAddParentForm(false);
                      resetParentFormData();
                    }
                  }} renderInput={(params) => (
                    <TextField {...params} size="small" error={!!bomFieldErrors.parent_item_id}
                      helperText={bomFieldErrors.parent_item_id} sx={textFieldSx} />
                  )} />
              </Box>
            </Grid>

            {showAddParentForm && (
              <Grid size={{ xs: 12 }}>
                <Box sx={{ mt: 1, p: 2, bgcolor: COLORS.background.light, borderRadius: 2, border: `1px solid ${COLORS.primary}` }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color: COLORS.primary }}>
                      {bomFormData.parent_item_id ? 'Edit Parent Item Details' : 'Add New Item'}
                    </Typography>
                    <IconButton size="small" onClick={() => { setShowAddParentForm(false); resetParentFormData(); }}
                      sx={{ color: COLORS.text.tertiary, '&:hover': { color: COLORS.primary } }}>
                      <CloseIcon sx={{ fontSize: '1rem' }} />
                    </IconButton>
                  </Box>
                  <Stepper activeStep={parentActiveStep} sx={{ mb: 3 }} connector={<ColorConnector />}>
                    {PARENT_ITEM_STEPS.map((label) => (
                      <Step key={label}>
                        <StepLabel>
                          <Typography sx={{ fontSize: '0.65rem', fontWeight: 500 }}>{label}</Typography>
                        </StepLabel>
                      </Step>
                    ))}
                  </Stepper>
                  {renderParentStepContent(parentActiveStep)}
                  {addParentError && (
                    <Alert severity="error" sx={{ mt: 2, borderRadius: 1.5, fontSize: '0.75rem', py: 0.5 }}>
                      {addParentError}
                    </Alert>
                  )}
                  <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Button onClick={handleParentBack} disabled={parentActiveStep === 0 || addParentLoading} size="small"
                      startIcon={<NavigateBeforeIcon sx={{ fontSize: '1rem' }} />}
                      sx={{ height: 32, px: 2, borderRadius: 1.5, border: `1px solid ${COLORS.border}`, color: COLORS.text.secondary,
                        fontSize: '0.7rem', fontWeight: 500, textTransform: 'none', '&:hover': { borderColor: COLORS.primary, bgcolor: `${COLORS.primary}10` } }}>
                      Back
                    </Button>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button onClick={() => { setShowAddParentForm(false); resetParentFormData(); }} disabled={addParentLoading} size="small"
                        sx={{ height: 32, px: 2, borderRadius: 1.5, border: `1px solid ${COLORS.border}`, color: COLORS.text.secondary,
                          fontSize: '0.7rem', fontWeight: 500, textTransform: 'none', '&:hover': { borderColor: COLORS.primary, bgcolor: `${COLORS.primary}10` } }}>
                        Cancel
                      </Button>
                      {parentActiveStep === PARENT_ITEM_STEPS.length - 1 ? (
                        <Button variant="contained" onClick={handleAddParentSubmit} disabled={addParentLoading} size="small"
                          startIcon={<AddIcon sx={{ fontSize: '1rem' }} />}
                          sx={{ height: 32, px: 2, borderRadius: 1.5, bgcolor: COLORS.primary, fontSize: '0.7rem', fontWeight: 500, textTransform: 'none',
                            '&:hover': { bgcolor: COLORS.primaryDark } }}>
                          {addParentLoading ? 'Adding...' : 'Add Item'}
                        </Button>
                      ) : (
                        <Button variant="contained" onClick={handleParentNext} disabled={addParentLoading} size="small"
                          endIcon={<NavigateNextIcon sx={{ fontSize: '1rem' }} />}
                          sx={{ height: 32, px: 2, borderRadius: 1.5, bgcolor: COLORS.primary, fontSize: '0.7rem', fontWeight: 500, textTransform: 'none',
                            '&:hover': { bgcolor: COLORS.primaryDark } }}>
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
                <Label required>BOM VERSION</Label>
                <TextField fullWidth size="small" name="bom_version" value={bomFormData.bom_version}
                  onChange={handleBomChange} placeholder="v1.0" error={!!bomFieldErrors.bom_version}
                  helperText={bomFieldErrors.bom_version} sx={textFieldSx} disabled={bomFormLoading} />
              </Box>
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                <Label required>BOM TYPE</Label>
                <FormControl fullWidth size="small" error={!!bomFieldErrors.bom_type}>
                  <Select name="bom_type" value={bomFormData.bom_type} onChange={handleBomChange}
                    disabled={bomFormLoading} sx={selectSx}>
                    {BOM_TYPE_OPTIONS.map(option => (
                      <MenuItem key={option} value={option} sx={{ fontSize: '0.75rem' }}>{option}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                <Label required>BOM CATEGORY</Label>
                <FormControl fullWidth size="small" error={!!bomFieldErrors.bom_category}>
                  <Select name="bom_category" value={bomFormData.bom_category} onChange={handleBomCategoryChange}
                    disabled={bomFormLoading} sx={selectSx}>
                    {BOM_CATEGORY_OPTIONS.map(option => (
                      <MenuItem key={option} value={option} sx={{ fontSize: '0.75rem' }}>
                        {option} {option === 'Standard' ? '(No components)' : '(Requires components)'}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                <Label required>EFFECTIVE FROM</Label>
                <TextField fullWidth type="date" size="small" name="effective_from"
                  value={bomFormData.effective_from} onChange={handleBomChange}
                  error={!!bomFieldErrors.effective_from} helperText={bomFieldErrors.effective_from}
                  sx={textFieldSx} disabled={bomFormLoading} InputLabelProps={{ shrink: true }} />
              </Box>
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                <Label>EFFECTIVE TO</Label>
                <TextField fullWidth type="date" size="small" name="effective_to"
                  value={bomFormData.effective_to} onChange={handleBomChange}
                  sx={textFieldSx} disabled={bomFormLoading} InputLabelProps={{ shrink: true }} />
              </Box>
            </Grid>

            <Grid size={{ xs: 12, sm: 4 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                <Label>BATCH SIZE</Label>
                <TextField fullWidth type="number" size="small" name="batch_size"
                  value={bomFormData.batch_size} onChange={handleBomChange}
                  sx={textFieldSx} disabled={bomFormLoading} />
              </Box>
            </Grid>

            <Grid size={{ xs: 12, sm: 4 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                <Label>YIELD (%)</Label>
                <TextField fullWidth type="number" size="small" name="yield_percent"
                  value={bomFormData.yield_percent} onChange={handleBomChange}
                  sx={textFieldSx} disabled={bomFormLoading} />
              </Box>
            </Grid>

            <Grid size={{ xs: 12, sm: 4 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                <Label>STATUS</Label>
                <FormControl fullWidth size="small">
                  <Select name="status" value={bomFormData.status} onChange={handleBomChange}
                    disabled={bomFormLoading} sx={selectSx}>
                    {STATUS_OPTIONS.map(option => (
                      <MenuItem key={option} value={option} sx={{ fontSize: '0.75rem' }}>{option}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                <Label>SETUP TIME (min)</Label>
                <TextField fullWidth type="number" size="small" name="setup_time_min"
                  value={bomFormData.setup_time_min} onChange={handleBomChange}
                  sx={textFieldSx} disabled={bomFormLoading} />
              </Box>
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                <Label>CYCLE TIME (min)</Label>
                <TextField fullWidth type="number" size="small" name="cycle_time_min"
                  value={bomFormData.cycle_time_min} onChange={handleBomChange}
                  sx={textFieldSx} disabled={bomFormLoading} />
              </Box>
            </Grid>
          </Grid>
        );

      case 1:
        return (
          <Grid container spacing={2}>
            <Grid size={{ xs: 12 }}>
              {bomFormData.bom_category === 'Standard' && (
                <Alert severity="info" sx={{ mb: 2, borderRadius: 1.5, fontSize: '0.75rem' }}>
                  Standard BOM cannot have components. Change BOM Category to "Assembly" to add components.
                </Alert>
              )}
              {bomComponents.map((component, index) => (
                <Paper key={index} sx={{ p: 2, mb: 2,
                  bgcolor: bomFormData.bom_category === 'Standard' ? '#f5f5f5' : COLORS.background.light,
                  borderRadius: 1.5, border: `1px solid ${COLORS.border}`,
                  opacity: bomFormData.bom_category === 'Standard' ? 0.7 : 1,
                  pointerEvents: bomFormData.bom_category === 'Standard' ? 'none' : 'auto' }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.5 }}>
                    <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary }}>
                      Component {index + 1}
                    </Typography>
                    {bomComponents.length > 1 && bomFormData.bom_category === 'Assembly' && (
                      <IconButton size="small" onClick={() => removeComponent(index)} sx={{ color: '#EF4444' }}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    )}
                  </Stack>
                  <Grid container spacing={1.5}>
                    <Grid size={{ xs: 12 }}>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                        <Label required>COMPONENT ITEM</Label>
                        <Autocomplete fullWidth options={componentItems} loading={loadingItems}
                          getOptionLabel={(option) => `${option.part_no} - ${option.part_description}`}
                          value={componentItems.find(item => item._id === component.component_item_id) || null}
                          onChange={(event, newValue) => handleComponentChange(index, 'component_item_id', newValue?._id || '')}
                          disabled={bomFormData.bom_category === 'Standard' || bomFormLoading}
                          renderInput={(params) => (
                            <TextField {...params} size="small"
                              error={!!bomFieldErrors[`comp_${index}_component_item_id`]}
                              helperText={bomFieldErrors[`comp_${index}_component_item_id`]}
                              sx={textFieldSx} />
                          )} />
                      </Box>
                    </Grid>
                    <Grid size={{ xs: 6, sm: 3 }}>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                        <Label required>QUANTITY PER</Label>
                        <TextField fullWidth type="number" size="small"
                          value={component.quantity_per}
                          onChange={(e) => handleComponentChange(index, 'quantity_per', e.target.value)}
                          error={!!bomFieldErrors[`comp_${index}_quantity_per`]}
                          helperText={bomFieldErrors[`comp_${index}_quantity_per`]}
                          disabled={bomFormData.bom_category === 'Standard' || bomFormLoading}
                          sx={textFieldSx} />
                      </Box>
                    </Grid>
                    <Grid size={{ xs: 6, sm: 2 }}>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                        <Label>UNIT</Label>
                        <FormControl fullWidth size="small">
                          <Select value={component.unit}
                            onChange={(e) => handleComponentChange(index, 'unit', e.target.value)}
                            disabled={bomFormData.bom_category === 'Standard' || bomFormLoading}
                            sx={selectSx}>
                            {UNIT_OPTIONS.map(option => (
                              <MenuItem key={option} value={option} sx={{ fontSize: '0.75rem' }}>{option}</MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </Box>
                    </Grid>
                    <Grid size={{ xs: 6, sm: 2 }}>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                        <Label>SCRAP %</Label>
                        <TextField fullWidth type="number" size="small"
                          value={component.scrap_percent}
                          onChange={(e) => handleComponentChange(index, 'scrap_percent', e.target.value)}
                          disabled={bomFormData.bom_category === 'Standard' || bomFormLoading}
                          sx={textFieldSx} />
                      </Box>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 5 }}>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                        <Label>REFERENCE DESIGNATOR</Label>
                        <TextField fullWidth size="small"
                          value={component.reference_designator}
                          onChange={(e) => handleComponentChange(index, 'reference_designator', e.target.value)}
                          placeholder="e.g., R1, C2, U3"
                          disabled={bomFormData.bom_category === 'Standard' || bomFormLoading}
                          sx={textFieldSx} />
                      </Box>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 7 }}>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                        <Label>REMARKS</Label>
                        <TextField fullWidth size="small"
                          value={component.remarks}
                          onChange={(e) => handleComponentChange(index, 'remarks', e.target.value)}
                          placeholder="Additional notes..."
                          disabled={bomFormData.bom_category === 'Standard' || bomFormLoading}
                          sx={textFieldSx} />
                      </Box>
                    </Grid>
                  </Grid>
                </Paper>
              ))}
              <Button variant="outlined" startIcon={<AddIcon sx={{ fontSize: '1rem' }} />}
                onClick={addComponent} disabled={bomFormData.bom_category === 'Standard' || bomFormLoading}
                sx={{ height: 32, px: 2, borderRadius: 1.5, border: `1px solid ${COLORS.border}`,
                  color: bomFormData.bom_category === 'Standard' ? COLORS.text.tertiary : COLORS.text.secondary,
                  fontSize: '0.7rem', fontWeight: 500, textTransform: 'none',
                  '&:hover': { borderColor: bomFormData.bom_category === 'Standard' ? COLORS.border : COLORS.primary,
                    bgcolor: bomFormData.bom_category === 'Standard' ? 'transparent' : `${COLORS.primary}10` } }}>
                Add Component
              </Button>
            </Grid>
          </Grid>
        );

      case 2:
        return (
          <Box sx={{ py: 2, textAlign: 'center' }}>
            <Typography variant="h6" sx={{ fontWeight: 600, color: COLORS.text.primary }}>
              Production Parameters
            </Typography>
            <Grid container spacing={2} sx={{ mt: 2, textAlign: 'left' }}>
              <Grid size={{ xs: 6 }}><Typography sx={{ fontSize: '0.7rem', color: COLORS.text.secondary }}>Batch Size:</Typography></Grid>
              <Grid size={{ xs: 6 }}><Typography sx={{ fontSize: '0.7rem', fontWeight: 500 }}>{bomFormData.batch_size}</Typography></Grid>
              <Grid size={{ xs: 6 }}><Typography sx={{ fontSize: '0.7rem', color: COLORS.text.secondary }}>Yield:</Typography></Grid>
              <Grid size={{ xs: 6 }}><Typography sx={{ fontSize: '0.7rem', fontWeight: 500 }}>{bomFormData.yield_percent}%</Typography></Grid>
              <Grid size={{ xs: 6 }}><Typography sx={{ fontSize: '0.7rem', color: COLORS.text.secondary }}>Setup Time:</Typography></Grid>
              <Grid size={{ xs: 6 }}><Typography sx={{ fontSize: '0.7rem', fontWeight: 500 }}>{bomFormData.setup_time_min} min</Typography></Grid>
              <Grid size={{ xs: 6 }}><Typography sx={{ fontSize: '0.7rem', color: COLORS.text.secondary }}>Cycle Time:</Typography></Grid>
              <Grid size={{ xs: 6 }}><Typography sx={{ fontSize: '0.7rem', fontWeight: 500 }}>{bomFormData.cycle_time_min} min</Typography></Grid>
              <Grid size={{ xs: 12 }}><Divider sx={{ my: 1 }} /></Grid>
              <Grid size={{ xs: 12 }}>
                <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: COLORS.primary, mb: 1 }}>Components</Typography>
                {bomComponents.filter(c => c.component_item_id).length > 0 ? (
                  bomComponents.map((comp, idx) => comp.component_item_id && (
                    <Box key={idx} sx={{ mb: 1, pb: 1, borderBottom: idx < bomComponents.length - 1 ? `1px solid ${COLORS.border}` : 'none' }}>
                      <Typography sx={{ fontSize: '0.7rem', fontWeight: 500 }}>{comp.component_part_no || 'Not selected'}</Typography>
                      <Typography sx={{ fontSize: '0.65rem', color: COLORS.text.secondary }}>
                        Qty: {comp.quantity_per} {comp.unit} | Scrap: {comp.scrap_percent}%
                      </Typography>
                    </Box>
                  ))
                ) : (
                  <Typography sx={{ fontSize: '0.7rem', color: COLORS.text.tertiary }}>
                    No components added {bomFormData.bom_category === 'Standard' ? '(Standard BOM)' : ''}
                  </Typography>
                )}
              </Grid>
            </Grid>
          </Box>
        );

      case 3:
        return (
          <Box sx={{ py: 2, textAlign: 'center' }}>
            <CheckCircleIcon sx={{ fontSize: 48, color: COLORS.success, mb: 2 }} />
            <Typography variant="h6" sx={{ fontWeight: 600, color: COLORS.text.primary }}>Ready to Save!</Typography>
            <Typography sx={{ fontSize: '0.8rem', color: COLORS.text.secondary, mt: 1 }}>
              Please review the BOM information before saving.
            </Typography>
          </Box>
        );

      default: return null;
    }
  };

  return (
    <Paper sx={{ mt: 2, p: 2, bgcolor: COLORS.background.light, borderRadius: 2, border: `2px solid ${COLORS.primary}` }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color: COLORS.primary }}>
          <AssignmentIcon sx={{ fontSize: '1rem', mr: 1, verticalAlign: 'middle' }} />
          Add New BOM
        </Typography>
        <IconButton size="small" onClick={handleCancel} sx={{ color: COLORS.text.tertiary, '&:hover': { color: COLORS.primary } }} disabled={bomFormLoading}>
          <CloseIcon sx={{ fontSize: '1rem' }} />
        </IconButton>
      </Box>

      <Stepper activeStep={bomActiveStep} sx={{ mb: 3 }} connector={<ColorConnector />}>
        {BOM_MAIN_STEPS.map((label, index) => (
          <Step key={label}>
            <StepLabel>
              <Typography sx={{ fontSize: '0.65rem', fontWeight: 500 }}>{index + 1}. {label}</Typography>
            </StepLabel>
          </Step>
        ))}
      </Stepper>

      {renderBomStepContent(bomActiveStep)}

      {bomFormError && (
        <Alert severity="error" sx={{ mt: 2, borderRadius: 1.5, fontSize: '0.75rem', py: 0.5 }}>
          {bomFormError}
        </Alert>
      )}

      <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Button onClick={handleBomBack} disabled={bomActiveStep === 0 || bomFormLoading} size="small"
          startIcon={<NavigateBeforeIcon sx={{ fontSize: '1rem' }} />}
          sx={{ height: 32, px: 2, borderRadius: 1.5, border: `1px solid ${COLORS.border}`, color: COLORS.text.secondary,
            fontSize: '0.7rem', fontWeight: 500, textTransform: 'none', '&:hover': { borderColor: COLORS.primary, bgcolor: `${COLORS.primary}10` } }}>
          Back
        </Button>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button onClick={handleCancel} disabled={bomFormLoading} size="small"
            sx={{ height: 32, px: 2, borderRadius: 1.5, border: `1px solid ${COLORS.border}`, color: COLORS.text.secondary,
              fontSize: '0.7rem', fontWeight: 500, textTransform: 'none', '&:hover': { borderColor: COLORS.primary, bgcolor: `${COLORS.primary}10` } }}>
            Cancel
          </Button>
          {bomActiveStep === BOM_MAIN_STEPS.length - 1 ? (
            <Button variant="contained" onClick={handleBomSubmit} disabled={bomFormLoading} size="small"
              startIcon={bomFormLoading ? <CircularProgress size={16} color="inherit" /> : <SaveIcon sx={{ fontSize: '1rem' }} />}
              sx={{ height: 32, px: 2, borderRadius: 1.5, bgcolor: COLORS.primary, fontSize: '0.7rem', fontWeight: 500, textTransform: 'none',
                '&:hover': { bgcolor: COLORS.primaryDark } }}>
              {bomFormLoading ? 'Saving...' : 'Save BOM'}
            </Button>
          ) : (
            <Button variant="contained" onClick={handleBomNext} disabled={bomFormLoading} size="small"
              endIcon={<NavigateNextIcon sx={{ fontSize: '1rem' }} />}
              sx={{ height: 32, px: 2, borderRadius: 1.5, bgcolor: COLORS.primary, fontSize: '0.7rem', fontWeight: 500, textTransform: 'none',
                '&:hover': { bgcolor: COLORS.primaryDark } }}>
              Next
            </Button>
          )}
        </Box>
      </Box>
    </Paper>
  );
};

// ============================================
// INLINE ROUTING FORM (Full - Matching AddRouting)
// ============================================
const InlineRoutingForm = ({ onSave, onCancel }) => {
  const [routingActiveStep, setRoutingActiveStep] = useState(0);
  const [routingFormLoading, setRoutingFormLoading] = useState(false);
  const [routingFormError, setRoutingFormError] = useState('');
  const [routingFieldErrors, setRoutingFieldErrors] = useState({});
  
  // Routing Form Data
  const [routingFormData, setRoutingFormData] = useState({
    routing_name: '',
    routing_type: '',
    applicable_items: [],
    version: '',
    operations: []
  });
  
  const [currentOperation, setCurrentOperation] = useState({
    op_sequence: '',
    operation_id: '',
    operation_name: '',
    work_centre: '',
    machine_id: '',
    is_subcontract: false,
    subcontract_vendor: '',
    planned_setup_min: '',
    planned_run_min: '',
    scrap_pct: '',
    description: '',
    requires_torque_recording: false,
    requires_functional_test: false,
    expected_joints: []
  });
  
  const [processes, setProcesses] = useState([]);
  const [machines, setMachines] = useState([]);
  const [items, setItems] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [currentJoint, setCurrentJoint] = useState('');
  const [jointError, setJointError] = useState('');
  const [fetchingData, setFetchingData] = useState(false);

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      setFetchingData(true);
      try {
        const token = localStorage.getItem('token');
        
        const [processesRes, machinesRes, itemsRes] = await Promise.all([
          axios.get(`${BASE_URL}/api/processes`, { headers: { 'Authorization': `Bearer ${token}` } }),
          axios.get(`${BASE_URL}/api/machines`, { 
            headers: { 'Authorization': `Bearer ${token}` },
            params: { 'status': ['Active', 'Idle'] }
          }),
          axios.get(`${BASE_URL}/api/items`, { headers: { 'Authorization': `Bearer ${token}` } })
        ]);
        
        if (processesRes.data.success) setProcesses(processesRes.data.data || []);
        if (machinesRes.data.success) setMachines(machinesRes.data.data || []);
        if (itemsRes.data.success) setItems(itemsRes.data.data || []);
      } catch (err) {
        console.error('Error fetching data:', err);
      } finally {
        setFetchingData(false);
      }
    };
    fetchData();
  }, []);

  const handleRoutingChange = (e) => {
    const { name, value } = e.target;
    setRoutingFormData(prev => ({ ...prev, [name]: value }));
    setRoutingFieldErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleOperationChange = (e) => {
    const { name, value, type, checked } = e.target;
    setCurrentOperation(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const addApplicableItem = (item) => {
    if (item && !routingFormData.applicable_items.includes(item._id)) {
      setRoutingFormData(prev => ({
        ...prev,
        applicable_items: [...prev.applicable_items, item._id]
      }));
      setSelectedItems(prev => [...prev, item]);
    }
  };

  const removeApplicableItem = (itemId) => {
    setRoutingFormData(prev => ({
      ...prev,
      applicable_items: prev.applicable_items.filter(id => id !== itemId)
    }));
    setSelectedItems(prev => prev.filter(item => item._id !== itemId));
  };

  const addJoint = () => {
    if (!currentJoint.trim()) {
      setJointError('Joint name is required');
      return;
    }
    if (currentOperation.expected_joints.includes(currentJoint.trim())) {
      setJointError('Joint name already exists');
      return;
    }
    setCurrentOperation(prev => ({
      ...prev,
      expected_joints: [...prev.expected_joints, currentJoint.trim()]
    }));
    setCurrentJoint('');
    setJointError('');
  };

  const removeJoint = (jointToRemove) => {
    setCurrentOperation(prev => ({
      ...prev,
      expected_joints: prev.expected_joints.filter(joint => joint !== jointToRemove)
    }));
  };

  const addOperation = () => {
    if (!currentOperation.operation_id) {
      setRoutingFormError('Please select a process');
      return;
    }
    if (!currentOperation.op_sequence) {
      setRoutingFormError('Operation sequence is required');
      return;
    }
    if (Number(currentOperation.op_sequence) < 10) {
      setRoutingFormError('Operation sequence must be at least 10');
      return;
    }
    if (!currentOperation.work_centre) {
      setRoutingFormError('Work centre is required');
      return;
    }
    if (!currentOperation.planned_setup_min) {
      setRoutingFormError('Planned setup time is required');
      return;
    }
    if (!currentOperation.planned_run_min) {
      setRoutingFormError('Planned run time is required');
      return;
    }

    if (currentOperation.requires_torque_recording && currentOperation.expected_joints.length === 0) {
      setRoutingFormError('Please add at least one expected joint for torque recording');
      return;
    }

    const newOperation = {
      op_sequence: Number(currentOperation.op_sequence),
      operation_id: currentOperation.operation_id,
      operation_name: currentOperation.operation_name,
      work_centre: currentOperation.work_centre || '',
      machine_id: currentOperation.machine_id || undefined,
      is_subcontract: currentOperation.is_subcontract || false,
      subcontract_vendor: currentOperation.subcontract_vendor || '',
      planned_setup_min: Number(currentOperation.planned_setup_min),
      planned_run_min: Number(currentOperation.planned_run_min),
      scrap_pct: Number(currentOperation.scrap_pct) || 0,
      description: currentOperation.description || undefined,
      requires_torque_recording: currentOperation.requires_torque_recording,
      requires_functional_test: currentOperation.requires_functional_test,
      expected_joints: currentOperation.expected_joints
    };

    if (currentOperation.is_subcontract && currentOperation.subcontract_vendor) {
      newOperation.subcontract_vendor = currentOperation.subcontract_vendor;
    }

    if (routingFormData.operations.some(op => op.op_sequence === newOperation.op_sequence)) {
      setRoutingFormError(`Operation sequence ${newOperation.op_sequence} already exists`);
      return;
    }

    setRoutingFormData(prev => ({
      ...prev,
      operations: [...prev.operations, newOperation].sort((a, b) => a.op_sequence - b.op_sequence)
    }));

    setCurrentOperation({
      op_sequence: '',
      operation_id: '',
      operation_name: '',
      work_centre: '',
      machine_id: '',
      is_subcontract: false,
      subcontract_vendor: '',
      planned_setup_min: '',
      planned_run_min: '',
      scrap_pct: '',
      description: '',
      requires_torque_recording: false,
      requires_functional_test: false,
      expected_joints: []
    });
    setCurrentJoint('');
    setRoutingFormError('');
  };

  const removeOperation = (index) => {
    setRoutingFormData(prev => ({
      ...prev,
      operations: prev.operations.filter((_, i) => i !== index)
    }));
  };

  const validateRoutingStep = (step) => {
    const errors = {};
    let isValid = true;

    switch (step) {
      case 0:
        if (!routingFormData.routing_name.trim()) {
          errors.routing_name = 'Routing name is required';
          isValid = false;
        }
        if (!routingFormData.routing_type.trim()) {
          errors.routing_type = 'Routing type is required';
          isValid = false;
        }
        break;

      case 1:
        if (routingFormData.operations.length === 0) {
          errors.operations = 'At least one operation is required';
          isValid = false;
        }
        const invalidOps = routingFormData.operations.filter(op => !op.work_centre);
        if (invalidOps.length > 0) {
          errors.operations = `Operations ${invalidOps.map(op => op.op_sequence).join(', ')} missing work centre`;
          isValid = false;
        }
        const invalidSequenceOps = routingFormData.operations.filter(op => op.op_sequence < 10);
        if (invalidSequenceOps.length > 0) {
          errors.operations = `Operation sequences ${invalidSequenceOps.map(op => op.op_sequence).join(', ')} must be at least 10`;
          isValid = false;
        }
        const invalidTorqueOps = routingFormData.operations.filter(op => op.requires_torque_recording && (!op.expected_joints || op.expected_joints.length === 0));
        if (invalidTorqueOps.length > 0) {
          errors.operations = `Operations ${invalidTorqueOps.map(op => op.op_sequence).join(', ')} require torque recording but have no expected joints`;
          isValid = false;
        }
        break;

      default:
        return true;
    }

    setRoutingFieldErrors(errors);
    if (!isValid) {
      setRoutingFormError('Please fix the errors in this section');
    }
    return isValid;
  };

  const handleRoutingNext = () => {
    if (validateRoutingStep(routingActiveStep)) {
      setRoutingFormError('');
      setRoutingActiveStep(prev => prev + 1);
    }
  };

  const handleRoutingBack = () => {
    setRoutingFormError('');
    setRoutingActiveStep(prev => prev - 1);
  };

  const handleRoutingSubmit = async () => {
    if (!validateRoutingStep(routingActiveStep)) return;

    setRoutingFormLoading(true);
    setRoutingFormError('');

    try {
      const token = localStorage.getItem('token');
      
      const cleanedOperations = routingFormData.operations.map(op => {
        const cleanedOp = { ...op };
        if (!cleanedOp.machine_id) delete cleanedOp.machine_id;
        if (!cleanedOp.is_subcontract || !cleanedOp.subcontract_vendor) {
          delete cleanedOp.subcontract_vendor;
        }
        if (!cleanedOp.description) delete cleanedOp.description;
        return cleanedOp;
      });

      const submitData = {
        routing_name: routingFormData.routing_name,
        routing_type: routingFormData.routing_type,
        applicable_items: routingFormData.applicable_items,
        operations: cleanedOperations,
        version: routingFormData.version
      };

      const response = await axios.post(`${BASE_URL}/api/routings`, submitData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.data.success) {
        onSave(response.data.data);
      } else {
        setRoutingFormError(response.data.message || 'Failed to add routing');
      }
    } catch (err) {
      console.error('Error adding routing:', err);
      setRoutingFormError(err.response?.data?.message || 'Failed to add routing. Please try again.');
    } finally {
      setRoutingFormLoading(false);
    }
  };

  const resetRoutingForm = () => {
    setRoutingFormData({
      routing_name: '',
      routing_type: '',
      applicable_items: [],
      version: '',
      operations: []
    });
    setSelectedItems([]);
    setCurrentOperation({
      op_sequence: '',
      operation_id: '',
      operation_name: '',
      work_centre: '',
      machine_id: '',
      is_subcontract: false,
      subcontract_vendor: '',
      planned_setup_min: '',
      planned_run_min: '',
      scrap_pct: '',
      description: '',
      requires_torque_recording: false,
      requires_functional_test: false,
      expected_joints: []
    });
    setCurrentJoint('');
    setRoutingFieldErrors({});
    setRoutingFormError('');
    setRoutingActiveStep(0);
  };

  const handleCancel = () => {
    resetRoutingForm();
    onCancel();
  };

  const Label = ({ children, required }) => (
    <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary, letterSpacing: '0.5px' }}>
      {children} {required && <span style={{ color: '#EF4444' }}>*</span>}
    </Typography>
  );

  const textFieldSx = {
    '& .MuiOutlinedInput-root': {
      borderRadius: 1.5, fontSize: '0.75rem',
      '&:hover fieldset': { borderColor: COLORS.primary },
      '&.Mui-focused fieldset': { borderColor: COLORS.primary, borderWidth: 1 }
    },
    '& .MuiInputBase-input': {
      py: 1, px: 1.5, fontSize: '0.75rem', color: COLORS.text.primary,
      '&::placeholder': { color: COLORS.text.tertiary, fontSize: '0.75rem' }
    },
    '& .MuiFormHelperText-root': { fontSize: '0.65rem', marginLeft: 0, marginTop: 0.25 }
  };

  const selectSx = {
    borderRadius: 1.5, fontSize: '0.75rem',
    '& .MuiSelect-select': { py: 1, px: 1.5, fontSize: '0.75rem' }
  };

  const renderRoutingStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                <Label required>ROUTING NAME</Label>
                <TextField
                  fullWidth size="small" name="routing_name"
                  value={routingFormData.routing_name} onChange={handleRoutingChange}
                  placeholder="e.g., Copper Busbar Standard Route"
                  error={!!routingFieldErrors.routing_name}
                  helperText={routingFieldErrors.routing_name}
                  sx={textFieldSx} disabled={routingFormLoading}
                />
              </Box>
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                <Label required>ROUTING TYPE</Label>
                <FormControl fullWidth size="small" error={!!routingFieldErrors.routing_type}>
                  <Select
                    name="routing_type"
                    value={routingFormData.routing_type}
                    onChange={handleRoutingChange}
                    disabled={routingFormLoading}
                    displayEmpty
                    sx={selectSx}
                  >
                    <MenuItem value="" disabled sx={{ fontSize: '0.75rem' }}>Select routing type</MenuItem>
                    {ROUTING_TYPE_OPTIONS.map(type => (
                      <MenuItem key={type} value={type} sx={{ fontSize: '0.75rem' }}>{type}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                <Label>VERSION</Label>
                <TextField
                  fullWidth size="small" name="version"
                  value={routingFormData.version} onChange={handleRoutingChange}
                  placeholder="1.0" sx={textFieldSx} disabled={routingFormLoading}
                />
              </Box>
            </Grid>

            <Grid size={{ xs: 12 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                <Label>APPLICABLE ITEMS</Label>
                <Autocomplete
                  options={items}
                  loading={fetchingData}
                  getOptionLabel={(option) => {
                    const partNo = option.part_no || '';
                    const partName = option.part_name || option.part_description || '';
                    return `${partNo} - ${partName}`.trim();
                  }}
                  onChange={(event, newValue) => {
                    if (newValue) {
                      addApplicableItem(newValue);
                    }
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      size="small"
                      placeholder="Search and select items..."
                      sx={textFieldSx}
                      InputProps={{
                        ...params.InputProps,
                        startAdornment: (
                          <InputAdornment position="start">
                            <SearchIcon sx={{ fontSize: '0.9rem', color: COLORS.text.tertiary }} />
                          </InputAdornment>
                        ),
                      }}
                    />
                  )}
                  disabled={routingFormLoading}
                />
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 1 }}>
                  {selectedItems.map((item) => (
                    <Chip
                      key={item._id}
                      label={`${item.part_no || item.item_id} - ${item.part_name || item.part_description}`}
                      onDelete={() => removeApplicableItem(item._id)}
                      size="small"
                      sx={{ bgcolor: COLORS.background.light, fontSize: '0.65rem', height: 28 }}
                    />
                  ))}
                  {selectedItems.length === 0 && (
                    <Typography sx={{ fontSize: '0.7rem', color: COLORS.text.tertiary, fontStyle: 'italic', mt: 1 }}>
                      No items selected
                    </Typography>
                  )}
                </Box>
              </Box>
            </Grid>
          </Grid>
        );

      case 1:
        return (
          <Grid container spacing={2}>
            <Grid size={{ xs: 12 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 2 }}>
                <Grid container spacing={1.5}>
                  <Grid size={{ xs: 12, sm: 3 }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                      <Label required>SEQUENCE</Label>
                      <TextField
                        fullWidth type="number" size="small" name="op_sequence"
                        value={currentOperation.op_sequence} onChange={handleOperationChange}
                        placeholder="10, 20, 30..." sx={textFieldSx}
                        disabled={routingFormLoading}
                      />
                    </Box>
                  </Grid>

                  <Grid size={{ xs: 12, sm: 9 }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                      <Label required>PROCESS</Label>
                      <Autocomplete
                        options={processes}
                        loading={fetchingData}
                        getOptionLabel={(option) => `${option.process_name} (${option.process_id})`}
                        value={processes.find(p => p._id === currentOperation.operation_id) || null}
                        onChange={(event, newValue) => {
                          if (newValue) {
                            setCurrentOperation(prev => ({
                              ...prev,
                              operation_id: newValue._id,
                              operation_name: newValue.process_name,
                              work_centre: newValue.work_centre || ''
                            }));
                          } else {
                            setCurrentOperation(prev => ({
                              ...prev,
                              operation_id: '',
                              operation_name: '',
                              work_centre: ''
                            }));
                          }
                        }}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            size="small"
                            placeholder="Search or select process..."
                            sx={textFieldSx}
                            InputProps={{
                              ...params.InputProps,
                              startAdornment: (
                                <InputAdornment position="start">
                                  <SearchIcon sx={{ fontSize: '0.9rem', color: COLORS.text.tertiary }} />
                                </InputAdornment>
                              ),
                            }}
                          />
                        )}
                        disabled={routingFormLoading}
                      />
                    </Box>
                  </Grid>
                </Grid>

                <Grid container spacing={1.5}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                      <Label>MACHINE</Label>
                      <FormControl fullWidth size="small">
                        <Select
                          value={currentOperation.machine_id}
                          onChange={(e) => {
                            const machineId = e.target.value;
                            const selectedMachine = machines.find(m => m._id === machineId);
                            setCurrentOperation(prev => ({
                              ...prev,
                              machine_id: machineId,
                              work_centre: selectedMachine?.work_centre || prev.work_centre
                            }));
                          }}
                          name="machine_id"
                          displayEmpty
                          disabled={routingFormLoading}
                          sx={selectSx}
                        >
                          <MenuItem value="" disabled>Select machine (optional)</MenuItem>
                          {machines.map((machine) => (
                            <MenuItem key={machine._id} value={machine._id} sx={{ fontSize: '0.75rem' }}>
                              {machine.machine_name} ({machine.machine_code})
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Box>
                  </Grid>

                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                      <Label required>WORK CENTRE</Label>
                      <TextField
                        fullWidth size="small" name="work_centre"
                        value={currentOperation.work_centre}
                        onChange={handleOperationChange}
                        placeholder="Enter work centre"
                        sx={textFieldSx}
                        disabled
                      />
                    </Box>
                  </Grid>
                </Grid>

                <Grid container spacing={1.5}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                      <Label required>SETUP TIME (min)</Label>
                      <TextField
                        fullWidth type="number" size="small" name="planned_setup_min"
                        value={currentOperation.planned_setup_min}
                        onChange={handleOperationChange}
                        placeholder="e.g., 15"
                        sx={textFieldSx}
                        disabled={routingFormLoading}
                      />
                    </Box>
                  </Grid>

                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                      <Label required>RUN TIME (min/unit)</Label>
                      <TextField
                        fullWidth type="number" size="small" name="planned_run_min"
                        value={currentOperation.planned_run_min}
                        onChange={handleOperationChange}
                        placeholder="e.g., 2.5"
                        sx={textFieldSx}
                        disabled={routingFormLoading}
                      />
                    </Box>
                  </Grid>
                </Grid>

                <Grid container spacing={1.5}>
                  <Grid size={{ xs: 12, sm: 3 }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                      <Label>SCRAP %</Label>
                      <TextField
                        fullWidth type="number" size="small" name="scrap_pct"
                        value={currentOperation.scrap_pct}
                        onChange={handleOperationChange}
                        placeholder="0"
                        sx={textFieldSx}
                        disabled={routingFormLoading}
                      />
                    </Box>
                  </Grid>

                  <Grid size={{ xs: 12, sm: 9 }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                      <Label>DESCRIPTION</Label>
                      <TextField
                        fullWidth size="small" name="description"
                        value={currentOperation.description}
                        onChange={handleOperationChange}
                        placeholder="Operation description"
                        sx={textFieldSx}
                        disabled={routingFormLoading}
                      />
                    </Box>
                  </Grid>
                </Grid>

                <Grid container spacing={1.5}>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Paper sx={{ p: 1.5, bgcolor: COLORS.background.light, borderRadius: 1.5 }}>
                      <Stack spacing={1.5}>
                        <FormControlLabel
                          control={
                            <Switch
                              checked={currentOperation.requires_torque_recording}
                              onChange={handleOperationChange}
                              name="requires_torque_recording"
                              size="small"
                              disabled={routingFormLoading}
                              sx={{
                                '& .MuiSwitch-switchBase.Mui-checked': {
                                  color: COLORS.primary,
                                },
                                '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                                  backgroundColor: COLORS.primary,
                                },
                              }}
                            />
                          }
                          label={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              <BoltIcon sx={{ fontSize: '0.9rem', color: COLORS.primary }} />
                              <Typography sx={{ fontSize: '0.75rem', fontWeight: 500 }}>
                                Requires Torque Recording
                              </Typography>
                            </Box>
                          }
                        />

                        {currentOperation.requires_torque_recording && (
                          <Box>
                            <Typography sx={{ ...Label, mb: 1 }}>
                              EXPECTED JOINTS <span style={{ color: '#EF4444' }}>*</span>
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mb: 1 }}>
                              <TextField
                                size="small"
                                value={currentJoint}
                                onChange={(e) => {
                                  setCurrentJoint(e.target.value);
                                  setJointError('');
                                }}
                                placeholder="e.g., Phase A, Phase B, Earth"
                                error={!!jointError}
                                helperText={jointError}
                                sx={{ flex: 1, ...textFieldSx }}
                                disabled={routingFormLoading}
                              />
                              <Button
                                variant="outlined"
                                size="small"
                                onClick={addJoint}
                                disabled={routingFormLoading}
                                startIcon={<AddIcon sx={{ fontSize: '0.8rem' }} />}
                                sx={{ height: 35, px: 1.5, borderRadius: 1.5, fontSize: '0.7rem', textTransform: 'none' }}
                              >
                                Add
                              </Button>
                            </Box>
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                              {currentOperation.expected_joints.map((joint, idx) => (
                                <Chip
                                  key={idx}
                                  label={joint}
                                  onDelete={() => removeJoint(joint)}
                                  size="small"
                                  sx={{ bgcolor: COLORS.background.white, fontSize: '0.65rem', height: 26 }}
                                />
                              ))}
                              {currentOperation.expected_joints.length === 0 && (
                                <Typography sx={{ fontSize: '0.65rem', color: COLORS.text.tertiary, fontStyle: 'italic' }}>
                                  No joints added. Add at least one joint for torque recording.
                                </Typography>
                              )}
                            </Box>
                          </Box>
                        )}
                      </Stack>
                    </Paper>
                  </Grid>

                  <Grid size={{ xs: 12, md: 6 }}>
                    <Paper sx={{ p: 1.5, bgcolor: COLORS.background.light, borderRadius: 1.5 }}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={currentOperation.requires_functional_test}
                            onChange={handleOperationChange}
                            name="requires_functional_test"
                            size="small"
                            disabled={routingFormLoading}
                            sx={{
                              '& .MuiSwitch-switchBase.Mui-checked': {
                                color: COLORS.primary,
                              },
                              '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                                backgroundColor: COLORS.primary,
                              },
                            }}
                          />
                        }
                        label={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <ScienceIcon sx={{ fontSize: '0.9rem', color: COLORS.primary }} />
                            <Typography sx={{ fontSize: '0.75rem', fontWeight: 500 }}>
                              Requires Functional Test
                            </Typography>
                          </Box>
                        }
                      />
                    </Paper>
                  </Grid>
                </Grid>

                <Grid container spacing={1.5}>
                  <Grid size={{ xs: 12 }}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={currentOperation.is_subcontract}
                          onChange={handleOperationChange}
                          name="is_subcontract"
                          size="small"
                          disabled={routingFormLoading}
                        />
                      }
                      label={<Typography sx={{ fontSize: '0.7rem' }}>Is Subcontract</Typography>}
                    />
                    {currentOperation.is_subcontract && (
                      <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mt: 1 }}>
                        <TextField
                          fullWidth
                          size="small"
                          name="subcontract_vendor"
                          value={currentOperation.subcontract_vendor}
                          onChange={handleOperationChange}
                          placeholder="Enter vendor name"
                          sx={textFieldSx}
                          disabled={routingFormLoading}
                        />
                      </Box>
                    )}
                  </Grid>
                </Grid>

                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
                  <Button
                    variant="contained"
                    onClick={addOperation}
                    disabled={routingFormLoading}
                    startIcon={<AddIcon sx={{ fontSize: '1rem' }} />}
                    sx={{ height: 36, px: 3, borderRadius: 1.5, fontSize: '0.75rem', textTransform: 'none' }}
                  >
                    Add Operation
                  </Button>
                </Box>

                {routingFormData.operations.length > 0 && (
                  <TableContainer component={Paper} sx={{ mt: 3, borderRadius: 1.5, border: `1px solid ${COLORS.border}` }}>
                    <Table size="small">
                      <TableHead>
                        <TableRow sx={{ bgcolor: COLORS.background.light }}>
                          <TableCell sx={{ fontWeight: 600, fontSize: '0.7rem' }}>Seq</TableCell>
                          <TableCell sx={{ fontWeight: 600, fontSize: '0.7rem' }}>Operation</TableCell>
                          <TableCell sx={{ fontWeight: 600, fontSize: '0.7rem' }}>Work Centre</TableCell>
                          <TableCell sx={{ fontWeight: 600, fontSize: '0.7rem' }}>Setup</TableCell>
                          <TableCell sx={{ fontWeight: 600, fontSize: '0.7rem' }}>Run</TableCell>
                          <TableCell sx={{ fontWeight: 600, fontSize: '0.7rem' }}>Torque</TableCell>
                          <TableCell sx={{ fontWeight: 600, fontSize: '0.7rem' }}>Test</TableCell>
                          <TableCell sx={{ fontWeight: 600, fontSize: '0.7rem', width: 50 }}>Actions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {routingFormData.operations.map((op, index) => (
                          <TableRow key={index}>
                            <TableCell sx={{ fontSize: '0.7rem' }}>{op.op_sequence}</TableCell>
                            <TableCell sx={{ fontSize: '0.7rem' }}>{op.operation_name}</TableCell>
                            <TableCell sx={{ fontSize: '0.7rem' }}>{op.work_centre || '-'}</TableCell>
                            <TableCell sx={{ fontSize: '0.7rem' }}>{op.planned_setup_min}</TableCell>
                            <TableCell sx={{ fontSize: '0.7rem' }}>{op.planned_run_min}</TableCell>
                            <TableCell sx={{ fontSize: '0.7rem' }}>
                              {op.requires_torque_recording ? 'Yes' : '-'}
                            </TableCell>
                            <TableCell sx={{ fontSize: '0.7rem' }}>
                              {op.requires_functional_test ? 'Yes' : '-'}
                            </TableCell>
                            <TableCell>
                              <IconButton size="small" onClick={() => removeOperation(index)} sx={{ color: COLORS.error }}>
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}

                {routingFieldErrors.operations && (
                  <Typography sx={{ fontSize: '0.65rem', color: '#EF4444', mt: 1 }}>
                    {routingFieldErrors.operations}
                  </Typography>
                )}
              </Box>
            </Grid>
          </Grid>
        );

      case 2:
        const totalOps = routingFormData.operations.length;
        const totalSetup = routingFormData.operations.reduce((sum, op) => sum + (op.planned_setup_min || 0), 0);
        const totalRun = routingFormData.operations.reduce((sum, op) => sum + (op.planned_run_min || 0), 0);
        const torqueCount = routingFormData.operations.filter(op => op.requires_torque_recording).length;
        const testCount = routingFormData.operations.filter(op => op.requires_functional_test).length;

        return (
          <Box sx={{ py: 2 }}>
            <Box sx={{ textAlign: 'center', mb: 3 }}>
              <CheckCircleIcon sx={{ fontSize: 48, color: COLORS.success }} />
              <Typography variant="h6" sx={{ fontWeight: 600, color: COLORS.text.primary, mt: 1 }}>
                Ready to Save!
              </Typography>
              <Typography sx={{ fontSize: '0.8rem', color: COLORS.text.secondary }}>
                Please review the routing information before saving.
              </Typography>
            </Box>

            <Paper sx={{ p: 2, bgcolor: COLORS.background.light, borderRadius: 1.5, mb: 2 }}>
              <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: COLORS.primary, mb: 1 }}>
                Basic Information
              </Typography>
              <Grid container spacing={1}>
                <Grid size={{ xs: 6 }}>
                  <Typography sx={{ fontSize: '0.7rem', color: COLORS.text.secondary }}>Routing Name:</Typography>
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <Typography sx={{ fontSize: '0.7rem', fontWeight: 500 }}>{routingFormData.routing_name}</Typography>
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <Typography sx={{ fontSize: '0.7rem', color: COLORS.text.secondary }}>Routing Type:</Typography>
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <Typography sx={{ fontSize: '0.7rem', fontWeight: 500 }}>{routingFormData.routing_type}</Typography>
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <Typography sx={{ fontSize: '0.7rem', color: COLORS.text.secondary }}>Version:</Typography>
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <Typography sx={{ fontSize: '0.7rem', fontWeight: 500 }}>{routingFormData.version || '-'}</Typography>
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <Typography sx={{ fontSize: '0.7rem', color: COLORS.text.secondary }}>Applicable Items:</Typography>
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <Typography sx={{ fontSize: '0.7rem', fontWeight: 500 }}>
                    {selectedItems.map(item => item.part_no || item.item_id).join(', ') || '-'}
                  </Typography>
                </Grid>
              </Grid>
            </Paper>

            <Paper sx={{ p: 2, bgcolor: COLORS.background.light, borderRadius: 1.5 }}>
              <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: COLORS.primary, mb: 1 }}>
                Operations Summary
              </Typography>
              <Grid container spacing={1}>
                <Grid size={{ xs: 6 }}>
                  <Typography sx={{ fontSize: '0.7rem', color: COLORS.text.secondary }}>Total Operations:</Typography>
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <Typography sx={{ fontSize: '0.7rem', fontWeight: 500, color: '#059669' }}>{totalOps}</Typography>
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <Typography sx={{ fontSize: '0.7rem', color: COLORS.text.secondary }}>Total Setup Time:</Typography>
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <Typography sx={{ fontSize: '0.7rem', fontWeight: 500 }}>{totalSetup} min</Typography>
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <Typography sx={{ fontSize: '0.7rem', color: COLORS.text.secondary }}>Total Run Time:</Typography>
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <Typography sx={{ fontSize: '0.7rem', fontWeight: 500 }}>{totalRun} min/unit</Typography>
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <Typography sx={{ fontSize: '0.7rem', color: COLORS.text.secondary }}>Torque Recording Ops:</Typography>
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <Typography sx={{ fontSize: '0.7rem', fontWeight: 500 }}>{torqueCount}</Typography>
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <Typography sx={{ fontSize: '0.7rem', color: COLORS.text.secondary }}>Functional Test Ops:</Typography>
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <Typography sx={{ fontSize: '0.7rem', fontWeight: 500 }}>{testCount}</Typography>
                </Grid>
              </Grid>
            </Paper>
          </Box>
        );

      default:
        return null;
    }
  };

  return (
    <Paper sx={{ mt: 2, p: 2, bgcolor: COLORS.background.light, borderRadius: 2, border: `2px solid ${COLORS.primary}` }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color: COLORS.primary }}>
          <RouteIcon sx={{ fontSize: '1rem', mr: 1, verticalAlign: 'middle' }} />
          Add New Routing
        </Typography>
        <IconButton size="small" onClick={handleCancel} sx={{ color: COLORS.text.tertiary, '&:hover': { color: COLORS.primary } }} disabled={routingFormLoading}>
          <CloseIcon sx={{ fontSize: '1rem' }} />
        </IconButton>
      </Box>

      <Stepper activeStep={routingActiveStep} sx={{ mb: 3 }} connector={<ColorConnector />}>
        {ROUTING_STEPS.map((label, index) => (
          <Step key={label}>
            <StepLabel>
              <Typography sx={{ fontSize: '0.65rem', fontWeight: 500 }}>{index + 1}. {label}</Typography>
            </StepLabel>
          </Step>
        ))}
      </Stepper>

      {renderRoutingStepContent(routingActiveStep)}

      {routingFormError && (
        <Alert severity="error" sx={{ mt: 2, borderRadius: 1.5, fontSize: '0.75rem', py: 0.5 }}>
          {routingFormError}
        </Alert>
      )}

      <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Button
          onClick={handleRoutingBack}
          disabled={routingActiveStep === 0 || routingFormLoading}
          size="small"
          startIcon={<NavigateBeforeIcon sx={{ fontSize: '1rem' }} />}
          sx={{
            height: 32, px: 2, borderRadius: 1.5,
            border: `1px solid ${COLORS.border}`,
            color: COLORS.text.secondary,
            fontSize: '0.7rem', fontWeight: 500, textTransform: 'none',
            '&:hover': { borderColor: COLORS.primary, bgcolor: `${COLORS.primary}10` }
          }}
        >
          Back
        </Button>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            onClick={handleCancel}
            disabled={routingFormLoading}
            size="small"
            sx={{
              height: 32, px: 2, borderRadius: 1.5,
              border: `1px solid ${COLORS.border}`,
              color: COLORS.text.secondary,
              fontSize: '0.7rem', fontWeight: 500, textTransform: 'none',
              '&:hover': { borderColor: COLORS.primary, bgcolor: `${COLORS.primary}10` }
            }}
          >
            Cancel
          </Button>
          {routingActiveStep === ROUTING_STEPS.length - 1 ? (
            <Button
              variant="contained"
              onClick={handleRoutingSubmit}
              disabled={routingFormLoading}
              size="small"
              startIcon={routingFormLoading ? <CircularProgress size={16} color="inherit" /> : <SaveIcon sx={{ fontSize: '1rem' }} />}
              sx={{
                height: 32, px: 2, borderRadius: 1.5,
                bgcolor: COLORS.primary,
                fontSize: '0.7rem', fontWeight: 500, textTransform: 'none',
                '&:hover': { bgcolor: COLORS.primaryDark }
              }}
            >
              {routingFormLoading ? 'Saving...' : 'Save Routing'}
            </Button>
          ) : (
            <Button
              variant="contained"
              onClick={handleRoutingNext}
              disabled={routingFormLoading}
              size="small"
              endIcon={<NavigateNextIcon sx={{ fontSize: '1rem' }} />}
              sx={{
                height: 32, px: 2, borderRadius: 1.5,
                bgcolor: COLORS.primary,
                fontSize: '0.7rem', fontWeight: 500, textTransform: 'none',
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

// ============================================
// MAIN AddWorkOrder COMPONENT
// ============================================
const AddWorkOrder = ({ open, onClose, onAdd }) => {
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  // Inline form visibility states
  //const [showCustomerForm, setShowCustomerForm] = useState(false);
  const [showSalesOrderForm, setShowSalesOrderForm] = useState(false);
  const [showItemForm, setShowItemForm] = useState(false);
  const [showBomForm, setShowBomForm] = useState(false);
  const [showRoutingForm, setShowRoutingForm] = useState(false);

  // Data fetching states
  const [customers, setCustomers] = useState([]);
  const [salesOrders, setSalesOrders] = useState([]);
  const [selectedSO, setSelectedSO] = useState(null);
  const [selectedSOItem, setSelectedSOItem] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [boms, setBoms] = useState([]);
  const [routings, setRoutings] = useState([]);
  const [mrpRuns, setMrpRuns] = useState([]);
  const [items, setItems] = useState([]);
  const [assemblyLines, setAssemblyLines] = useState([]);
  
  const [loadingCustomers, setLoadingCustomers] = useState(false);
  const [loadingSO, setLoadingSO] = useState(false);
  const [loadingBOM, setLoadingBOM] = useState(false);
  const [loadingRouting, setLoadingRouting] = useState(false);
  const [loadingMRP, setLoadingMRP] = useState(false);
  const [loadingItems, setLoadingItems] = useState(false);
  const [loadingAssemblyLines, setLoadingAssemblyLines] = useState(false);

  // Form data
  const [formData, setFormData] = useState({
    so_id: '',
    so_item_id: '',
    item_id: '',
    bom_id: '',
    routing_id: '',
    planned_qty: '',
    planned_start: '',
    planned_end: '',
    required_by: '',
    priority: 'Medium',
    wo_type: 'Machining',
    assembly_line: '',
    serial_tracking: false,
    mrp_run_id: ''
  });

  const showError = (message) => {
    setError(message);
    setTimeout(() => {
      setError('');
    }, 5000);
  };

  const showAssemblyLine = ['Assembly', 'SubAssembly'].includes(formData.wo_type);

  // Fetch Customers
  const fetchCustomers = useCallback(async () => {
    try {
      setLoadingCustomers(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(`${BASE_URL}/api/customers?limit=100`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success) {
        setCustomers(response.data.data || []);
      }
    } catch (err) {
      console.error('Error fetching customers:', err);
    } finally {
      setLoadingCustomers(false);
    }
  }, []);

  // Fetch Sales Orders
  const fetchSalesOrders = useCallback(async () => {
    try {
      setLoadingSO(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(`${BASE_URL}/api/sales-orders`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success) {
        setSalesOrders(response.data.data || []);
      }
    } catch (err) {
      console.error('Error fetching sales orders:', err);
    } finally {
      setLoadingSO(false);
    }
  }, []);

  // Fetch BOMs
  const fetchBOMs = useCallback(async () => {
    try {
      setLoadingBOM(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(`${BASE_URL}/api/boms`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success) {
        setBoms(response.data.data || []);
      }
    } catch (err) {
      console.error('Error fetching BOMs:', err);
    } finally {
      setLoadingBOM(false);
    }
  }, []);

  // Fetch Routings
  const fetchRoutings = useCallback(async () => {
    try {
      setLoadingRouting(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(`${BASE_URL}/api/routings`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success) {
        setRoutings(response.data.data || []);
      }
    } catch (err) {
      console.error('Error fetching routings:', err);
    } finally {
      setLoadingRouting(false);
    }
  }, []);

  // Fetch MRP Runs
  const fetchMrpRuns = useCallback(async () => {
    try {
      setLoadingMRP(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(`${BASE_URL}/api/mrp/runs`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success) {
        setMrpRuns(response.data.data || []);
      }
    } catch (err) {
      console.error('Error fetching MRP runs:', err);
    } finally {
      setLoadingMRP(false);
    }
  }, []);

  // Fetch Items
  const fetchItems = useCallback(async () => {
    try {
      setLoadingItems(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(`${BASE_URL}/api/items`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success) {
        setItems(response.data.data || []);
      }
    } catch (err) {
      console.error('Error fetching items:', err);
    } finally {
      setLoadingItems(false);
    }
  }, []);

  // Fetch Assembly Lines
  const fetchAssemblyLines = useCallback(async () => {
    try {
      setLoadingAssemblyLines(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(`${BASE_URL}/api/assembly-lines/dropdown`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success) {
        setAssemblyLines(response.data.data || []);
      }
    } catch (err) {
      console.error('Error fetching assembly lines:', err);
      try {
        const fallbackResponse = await axios.get(`${BASE_URL}/api/assembly-lines`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (fallbackResponse.data.success) {
          const activeLines = (fallbackResponse.data.data || []).filter(line => line.is_active === true);
          setAssemblyLines(activeLines);
        }
      } catch (fallbackErr) {
        console.error('Error fetching assembly lines (fallback):', fallbackErr);
      }
    } finally {
      setLoadingAssemblyLines(false);
    }
  }, []);

  // Fetch data when dialog opens
  useEffect(() => {
    if (open) {
      fetchCustomers();
      fetchSalesOrders();
      fetchBOMs();
      fetchRoutings();
      fetchMrpRuns();
      fetchItems();
      fetchAssemblyLines();
    }
  }, [open, fetchCustomers, fetchSalesOrders, fetchBOMs, fetchRoutings, fetchMrpRuns, fetchItems, fetchAssemblyLines]);

  // Reset active step when dialog opens/closes
  useEffect(() => {
    if (!open) {
      setActiveStep(0);
    }
  }, [open]);

  // Handlers for inline forms
  // const handleCustomerAdded = (newCustomer) => {
  //   setCustomers(prev => [newCustomer, ...prev]);
  //   setSelectedSO(newCustomer);
  //   setFormData(prev => ({ ...prev, so_id: newCustomer._id }));
  //   setShowCustomerForm(false);
  // };

  const handleSalesOrderAdded = (newSalesOrder) => {
  setSalesOrders(prev => [newSalesOrder, ...prev]);
  setSelectedSO(newSalesOrder);
  setFormData(prev => ({
    ...prev,
    so_id: newSalesOrder._id,
    so_item_id: ''
  }));
  setSelectedSOItem(null);
  setShowSalesOrderForm(false);
};

  const handleItemAdded = (newItem) => {
    setItems(prev => [newItem, ...prev]);
    setSelectedItem(newItem);
    setFormData(prev => ({ ...prev, item_id: newItem._id }));
    setShowItemForm(false);
  };

  const handleBomAdded = (newBom) => {
    setBoms(prev => [newBom, ...prev]);
    setFormData(prev => ({ ...prev, bom_id: newBom._id }));
    setShowBomForm(false);
  };

  const handleRoutingAdded = (newRouting) => {
    setRoutings(prev => [newRouting, ...prev]);
    setFormData(prev => ({ ...prev, routing_id: newRouting._id }));
    setShowRoutingForm(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setFieldErrors(prev => ({ ...prev, [name]: '' }));
    
    if (name === 'wo_type' && !['Assembly', 'SubAssembly'].includes(value)) {
      setFormData(prev => ({ ...prev, assembly_line: '' }));
    }
  };

  const handleSOChange = (event, newValue) => {
    setSelectedSO(newValue);
    setFormData(prev => ({
      ...prev,
      so_id: newValue?._id || '',
      so_item_id: ''
    }));
    setSelectedSOItem(null);
    setFieldErrors(prev => ({ ...prev, so_id: '' }));
  };

  const handleSOItemChange = (event, newValue) => {
    setSelectedSOItem(newValue);
    setFormData(prev => ({
      ...prev,
      so_item_id: newValue?._id || ''
    }));
    setFieldErrors(prev => ({ ...prev, so_item_id: '' }));
  };

  const handleItemChange = (event, newValue) => {
    setSelectedItem(newValue);
    setFormData(prev => ({
      ...prev,
      item_id: newValue?._id || ''
    }));
    setFieldErrors(prev => ({ ...prev, item_id: '' }));
  };

  const handleAssemblyLineChange = (event, newValue) => {
    setFormData(prev => ({
      ...prev,
      assembly_line: newValue?._id || ''
    }));
  };

  // Validate Step 1 (Production Details)
  const validateStep1 = () => {
    const errors = {};
    let isValid = true;
    let errorMessages = [];

    if (!formData.so_id) {
      errors.so_id = 'Sales Order is required';
      errorMessages.push('Sales Order is required');
      isValid = false;
    }
    
    const hasMultipleItems = selectedSO && selectedSO.items && selectedSO.items.length > 1;
    if (hasMultipleItems && !formData.so_item_id) {
      errors.so_item_id = 'Please select an SO item';
      errorMessages.push('Please select an SO item');
      isValid = false;
    }
    
    if (!formData.item_id) {
      errors.item_id = 'Item is required';
      errorMessages.push('Item is required');
      isValid = false;
    }
    if (!formData.bom_id) {
      errors.bom_id = 'BOM is required';
      errorMessages.push('BOM is required');
      isValid = false;
    }
    if (!formData.routing_id) {
      errors.routing_id = 'Routing is required';
      errorMessages.push('Routing is required');
      isValid = false;
    }

    setFieldErrors(errors);
    if (!isValid) {
      showError(errorMessages[0]);
    }
    return isValid;
  };

  // Validate Step 2 (Planning & Settings)
  const validateStep2 = () => {
    const errors = {};
    let isValid = true;
    let errorMessages = [];

    if (!formData.planned_qty || formData.planned_qty <= 0) {
      errors.planned_qty = 'Valid planned quantity is required';
      errorMessages.push('Valid planned quantity is required');
      isValid = false;
    }
    if (!formData.planned_start) {
      errors.planned_start = 'Planned start date is required';
      errorMessages.push('Planned start date is required');
      isValid = false;
    }
    if (!formData.planned_end) {
      errors.planned_end = 'Planned end date is required';
      errorMessages.push('Planned end date is required');
      isValid = false;
    }

    setFieldErrors(errors);
    if (!isValid) {
      showError(errorMessages[0]);
    }
    return isValid;
  };

  const handleNext = () => {
    if (validateStep1()) {
      setActiveStep(1);
    }
  };

  const handleBack = () => {
    setActiveStep(0);
  };

  const validateForm = () => {
    const step1Valid = validateStep1();
    const step2Valid = validateStep2();
    return step1Valid && step2Valid;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const submitData = {
        so_id: formData.so_id,
        so_item_id: formData.so_item_id || undefined,
        item_id: formData.item_id,
        bom_id: formData.bom_id,
        routing_id: formData.routing_id,
        planned_qty: Number(formData.planned_qty),
        planned_start: formData.planned_start,
        planned_end: formData.planned_end,
        required_by: formData.required_by || formData.planned_end,
        priority: formData.priority,
        wo_type: formData.wo_type,
        assembly_line: showAssemblyLine ? (formData.assembly_line || undefined) : undefined,
        serial_tracking: formData.serial_tracking,
        mrp_run_id: formData.mrp_run_id || undefined
      };

      const response = await axios.post(`${BASE_URL}/api/work-orders`, submitData, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
      });

      if (response.data.success) {
        onAdd(response.data.data);
        resetForm();
        onClose();
      } else {
        showError(response.data.message || 'Failed to create work order');
      }
    } catch (err) {
      console.error('Error creating work order:', err);
      showError(err.response?.data?.message || 'Failed to create work order');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      so_id: '',
      so_item_id: '',
      item_id: '',
      bom_id: '',
      routing_id: '',
      planned_qty: '',
      planned_start: '',
      planned_end: '',
      required_by: '',
      priority: 'Medium',
      wo_type: 'Machining',
      assembly_line: '',
      serial_tracking: false,
      mrp_run_id: ''
    });
    setSelectedSO(null);
    setSelectedSOItem(null);
    setSelectedItem(null);
    setFieldErrors({});
    setError('');
    setActiveStep(0);
    setShowCustomerForm(false);
    setShowItemForm(false);
    setShowBomForm(false);
    setShowRoutingForm(false);
    setShowSalesOrderForm(false);
  };

  const handleClose = () => {
    
    onClose();
    setTimeout(resetForm, 100)
  };

  const availableSOItems = selectedSO?.items || [];
  const hasMultipleSOItems = availableSOItems.length > 1;

  const getSelectedAssemblyLine = () => {
    return assemblyLines.find(al => al._id === formData.assembly_line) || null;
  };

  const getAssemblyLineLabel = (option) => {
    return `${option.line_code} - ${option.line_name} (${option.line_type})`;
  };

  // Label component
  const Label = ({ children, required }) => (
    <Typography sx={{ 
      fontSize: '0.7rem', 
      fontWeight: 600, 
      color: COLORS.text.secondary, 
      letterSpacing: '0.5px' 
    }}>
      {children} {required && <span style={{ color: '#EF4444' }}>*</span>}
    </Typography>
  );

  // Render Step 1 Content
  // const renderStep1Content = () => (
  //   <Stack spacing={2}>
  //     {/* Sales Order Selection */}
  //     <Paper sx={{ p: 2, borderRadius: 1.5, border: `1px solid ${COLORS.border}`, boxShadow: 'none' }}>
  //       <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color: COLORS.primary, mb: 1.5 }}>
  //         <InventoryIcon sx={{ fontSize: '1rem', mr: 0.5, verticalAlign: 'middle' }} />
  //         Sales Order Details
  //       </Typography>

  //       <Grid container spacing={1.5}>
  //         <Grid size={{ xs: 12 }}>
  //           <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
  //             <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
  //               <Label required>CUSTOMER / SALES ORDER</Label>
  //               <Button
  //                 size="small"
  //                 onClick={() => setShowCustomerForm(true)}
  //                 startIcon={<PersonAddIcon sx={{ fontSize: '0.8rem' }} />}
  //                 sx={{
  //                   height: 24,
  //                   px: 1.5,
  //                   borderRadius: 1,
  //                   color: COLORS.primary,
  //                   fontSize: '0.6rem',
  //                   fontWeight: 500,
  //                   textTransform: 'none',
  //                   '&:hover': { bgcolor: COLORS.primaryLight }
  //                 }}
  //               >
  //                 Add Customer
  //               </Button>
  //             </Box>
  //             <Autocomplete
  //               fullWidth
  //               options={salesOrders}
  //               getOptionLabel={(option) => `${option.so_number} - ${option.customer_name}`}
  //               value={selectedSO}
  //               onChange={handleSOChange}
  //               loading={loadingSO}
  //               renderInput={(params) => (
  //                 <TextField
  //                   {...params}
  //                   size="small"
  //                   placeholder="Select sales order"
  //                   error={!!fieldErrors.so_id}
  //                   helperText={fieldErrors.so_id}
  //                   sx={{
  //                     '& .MuiOutlinedInput-root': {
  //                       borderRadius: 1.5,
  //                       fontSize: '0.75rem',
  //                       '&:hover fieldset': { borderColor: COLORS.primary },
  //                       '&.Mui-error fieldset': { borderColor: '#EF4444' }
  //                     }
  //                   }}
  //                 />
  //               )}
  //             />
  //           </Box>
  //         </Grid>

  //         {hasMultipleSOItems && (
  //           <Grid size={{ xs: 12 }}>
  //             <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
  //               <Label required>SO ITEM</Label>
  //               <Autocomplete
  //                 fullWidth
  //                 options={availableSOItems}
  //                 getOptionLabel={(option) => `${option.part_no} - ${option.part_name} (Qty: ${option.ordered_qty})`}
  //                 value={selectedSOItem}
  //                 onChange={handleSOItemChange}
  //                 disabled={!selectedSO}
  //                 loading={loadingSO}
  //                 renderInput={(params) => (
  //                   <TextField
  //                     {...params}
  //                     size="small"
  //                     placeholder={selectedSO ? "Select SO item" : "Select sales order first"}
  //                     error={!!fieldErrors.so_item_id}
  //                     helperText={fieldErrors.so_item_id}
  //                     sx={{
  //                       '& .MuiOutlinedInput-root': {
  //                         borderRadius: 1.5,
  //                         fontSize: '0.75rem',
  //                         '&:hover fieldset': { borderColor: COLORS.primary },
  //                         '&.Mui-error fieldset': { borderColor: '#EF4444' }
  //                       }
  //                     }}
  //                   />
  //                 )}
  //               />
  //             </Box>
  //           </Grid>
  //         )}

  //         {selectedSO && !hasMultipleSOItems && availableSOItems.length === 1 && (
  //           <Grid size={{ xs: 12 }}>
  //             <Box sx={{ 
  //               p: 1, 
  //               bgcolor: COLORS.primaryLight, 
  //               borderRadius: 1.5,
  //               border: `1px solid ${COLORS.primary}20`
  //             }}>
  //               <Typography sx={{ fontSize: '0.7rem', color: COLORS.text.secondary }}>
  //                 SO Item (Auto-selected):
  //               </Typography>
  //               <Typography sx={{ fontSize: '0.75rem', fontWeight: 500, color: COLORS.text.primary }}>
  //                 {availableSOItems[0]?.part_no} - {availableSOItems[0]?.part_name}
  //               </Typography>
  //             </Box>
  //           </Grid>
  //         )}
  //       </Grid>
  //     </Paper>

  //     {/* Inline Customer Form */}
  //     {showCustomerForm && (
  //       <InlineCustomerForm
  //         onSave={handleCustomerAdded}
  //         onCancel={() => setShowCustomerForm(false)}
  //       />
  //     )}

  //     {/* Item Master Selection */}
  //     <Paper sx={{ p: 2, borderRadius: 1.5, border: `1px solid ${COLORS.border}`, boxShadow: 'none' }}>
  //       <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color: COLORS.primary, mb: 1.5 }}>
  //         <ProductionIcon sx={{ fontSize: '1rem', mr: 0.5, verticalAlign: 'middle' }} />
  //         Item Details
  //       </Typography>

  //       <Grid container spacing={1.5}>
  //         <Grid size={{ xs: 12 }}>
  //           <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
  //             <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
  //               <Label required>ITEM</Label>
  //               <Button
  //                 size="small"
  //                 onClick={() => setShowItemForm(true)}
  //                 startIcon={<AddIcon sx={{ fontSize: '0.8rem' }} />}
  //                 sx={{
  //                   height: 24,
  //                   px: 1.5,
  //                   borderRadius: 1,
  //                   color: COLORS.primary,
  //                   fontSize: '0.6rem',
  //                   fontWeight: 500,
  //                   textTransform: 'none',
  //                   '&:hover': { bgcolor: COLORS.primaryLight }
  //                 }}
  //               >
  //                 Add New
  //               </Button>
  //             </Box>
  //             <Autocomplete
  //               fullWidth
  //               options={items}
  //               getOptionLabel={(option) => `${option.part_no} - ${option.part_description || option.part_name} (${option.item_category || 'N/A'})`}
  //               value={selectedItem}
  //               onChange={handleItemChange}
  //               loading={loadingItems}
  //               renderInput={(params) => (
  //                 <TextField
  //                   {...params}
  //                   size="small"
  //                   placeholder="Select item"
  //                   error={!!fieldErrors.item_id}
  //                   helperText={fieldErrors.item_id}
  //                   sx={{
  //                     '& .MuiOutlinedInput-root': {
  //                       borderRadius: 1.5,
  //                       fontSize: '0.75rem',
  //                       '&:hover fieldset': { borderColor: COLORS.primary },
  //                       '&.Mui-error fieldset': { borderColor: '#EF4444' }
  //                     }
  //                   }}
  //                 />
  //               )}
  //             />
  //           </Box>
  //         </Grid>
  //       </Grid>
  //     </Paper>

  //     {/* Inline Item Form */}
  //     {showItemForm && (
  //       <InlineItemForm
  //         onSave={handleItemAdded}
  //         onCancel={() => setShowItemForm(false)}
  //       />
  //     )}

  //     {/* BOM & Routing */}
  //     <Paper sx={{ p: 2, borderRadius: 1.5, border: `1px solid ${COLORS.border}`, boxShadow: 'none' }}>
  //       <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color: COLORS.primary, mb: 1.5 }}>
  //         Production Specifications
  //       </Typography>

  //       <Grid container spacing={1.5}>
  //         <Grid size={{ xs: 12, sm: 6 }}>
  //           <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
  //             <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
  //               <Label required>BOM</Label>
  //               <Button
  //                 size="small"
  //                 onClick={() => setShowBomForm(true)}
  //                 startIcon={<AddIcon sx={{ fontSize: '0.8rem' }} />}
  //                 sx={{
  //                   height: 24,
  //                   px: 1.5,
  //                   borderRadius: 1,
  //                   color: COLORS.primary,
  //                   fontSize: '0.6rem',
  //                   fontWeight: 500,
  //                   textTransform: 'none',
  //                   '&:hover': { bgcolor: COLORS.primaryLight }
  //                 }}
  //               >
  //                 Add New
  //               </Button>
  //             </Box>
  //             <Autocomplete
  //               fullWidth
  //               options={boms}
  //               getOptionLabel={(option) => `${option.bom_id} - ${option.parent_part_no} (v${option.bom_version})`}
  //               value={boms.find(b => b._id === formData.bom_id) || null}
  //               onChange={(event, newValue) => {
  //                 setFormData(prev => ({ ...prev, bom_id: newValue?._id || '' }));
  //                 setFieldErrors(prev => ({ ...prev, bom_id: '' }));
  //               }}
  //               loading={loadingBOM}
  //               renderInput={(params) => (
  //                 <TextField
  //                   {...params}
  //                   size="small"
  //                   placeholder="Select BOM"
  //                   error={!!fieldErrors.bom_id}
  //                   helperText={fieldErrors.bom_id}
  //                   sx={{
  //                     '& .MuiOutlinedInput-root': {
  //                       borderRadius: 1.5,
  //                       fontSize: '0.75rem',
  //                       '&:hover fieldset': { borderColor: COLORS.primary },
  //                       '&.Mui-error fieldset': { borderColor: '#EF4444' }
  //                     }
  //                   }}
  //                 />
  //               )}
  //             />
  //           </Box>
  //         </Grid>

  //         <Grid size={{ xs: 12, sm: 6 }}>
  //           <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
  //             <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
  //               <Label required>ROUTING</Label>
  //               <Button
  //                 size="small"
  //                 onClick={() => setShowRoutingForm(true)}
  //                 startIcon={<AddIcon sx={{ fontSize: '0.8rem' }} />}
  //                 sx={{
  //                   height: 24,
  //                   px: 1.5,
  //                   borderRadius: 1,
  //                   color: COLORS.primary,
  //                   fontSize: '0.6rem',
  //                   fontWeight: 500,
  //                   textTransform: 'none',
  //                   '&:hover': { bgcolor: COLORS.primaryLight }
  //                 }}
  //               >
  //                 Add New
  //               </Button>
  //             </Box>
  //             <Autocomplete
  //               fullWidth
  //               options={routings}
  //               getOptionLabel={(option) => `${option.routing_id} - ${option.routing_name}`}
  //               value={routings.find(r => r._id === formData.routing_id) || null}
  //               onChange={(event, newValue) => {
  //                 setFormData(prev => ({ ...prev, routing_id: newValue?._id || '' }));
  //                 setFieldErrors(prev => ({ ...prev, routing_id: '' }));
  //               }}
  //               loading={loadingRouting}
  //               renderInput={(params) => (
  //                 <TextField
  //                   {...params}
  //                   size="small"
  //                   placeholder="Select routing"
  //                   error={!!fieldErrors.routing_id}
  //                   helperText={fieldErrors.routing_id}
  //                   sx={{
  //                     '& .MuiOutlinedInput-root': {
  //                       borderRadius: 1.5,
  //                       fontSize: '0.75rem',
  //                       '&:hover fieldset': { borderColor: COLORS.primary },
  //                       '&.Mui-error fieldset': { borderColor: '#EF4444' }
  //                     }
  //                   }}
  //                 />
  //               )}
  //             />
  //           </Box>
  //         </Grid>
  //       </Grid>
  //     </Paper>

  //     {/* Inline BOM Form */}
  //     {showBomForm && (
  //       <InlineBomForm
  //         onSave={handleBomAdded}
  //         onCancel={() => setShowBomForm(false)}
  //       />
  //     )}

  //     {/* Inline Routing Form */}
  //     {showRoutingForm && (
  //       <InlineRoutingForm
  //         onSave={handleRoutingAdded}
  //         onCancel={() => setShowRoutingForm(false)}
  //       />
  //     )}
  //   </Stack>
  // );

  const renderStep1Content = () => (
  <Stack spacing={2}>
    {/* Sales Order Selection */}
    <Paper sx={{ p: 2, borderRadius: 1.5, border: `1px solid ${COLORS.border}`, boxShadow: 'none' }}>
      <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color: COLORS.primary, mb: 1.5 }}>
        <InventoryIcon sx={{ fontSize: '1rem', mr: 0.5, verticalAlign: 'middle' }} />
        Sales Order Details
      </Typography>

      <Grid container spacing={1.5}>
        <Grid size={{ xs: 12 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Label required>SALES ORDER</Label>
              <Button
                size="small"
                onClick={() => setShowSalesOrderForm(true)}
                startIcon={<AddIcon sx={{ fontSize: '0.8rem' }} />}
                sx={{
                  height: 24,
                  px: 1.5,
                  borderRadius: 1,
                  color: COLORS.primary,
                  fontSize: '0.6rem',
                  fontWeight: 500,
                  textTransform: 'none',
                  '&:hover': { bgcolor: COLORS.primaryLight }
                }}
              >
                Add New
              </Button>
            </Box>
            <Autocomplete
              fullWidth
              options={salesOrders}
              getOptionLabel={(option) => `${option.so_number} - ${option.customer_name}`}
              value={selectedSO}
              onChange={handleSOChange}
              loading={loadingSO}
              renderInput={(params) => (
                <TextField
                  {...params}
                  size="small"
                  placeholder="Select sales order"
                  error={!!fieldErrors.so_id}
                  helperText={fieldErrors.so_id}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 1.5,
                      fontSize: '0.75rem',
                      '&:hover fieldset': { borderColor: COLORS.primary },
                      '&.Mui-error fieldset': { borderColor: '#EF4444' }
                    }
                  }}
                />
              )}
            />
          </Box>
        </Grid>

        {hasMultipleSOItems && (
          <Grid size={{ xs: 12 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
              <Label required>SO ITEM</Label>
              <Autocomplete
                fullWidth
                options={availableSOItems}
                getOptionLabel={(option) => `${option.part_no} - ${option.part_name} (Qty: ${option.ordered_qty})`}
                value={selectedSOItem}
                onChange={handleSOItemChange}
                disabled={!selectedSO}
                loading={loadingSO}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    size="small"
                    placeholder={selectedSO ? "Select SO item" : "Select sales order first"}
                    error={!!fieldErrors.so_item_id}
                    helperText={fieldErrors.so_item_id}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 1.5,
                        fontSize: '0.75rem',
                        '&:hover fieldset': { borderColor: COLORS.primary },
                        '&.Mui-error fieldset': { borderColor: '#EF4444' }
                      }
                    }}
                  />
                )}
              />
            </Box>
          </Grid>
        )}

        {selectedSO && !hasMultipleSOItems && availableSOItems.length === 1 && (
          <Grid size={{ xs: 12 }}>
            <Box sx={{ 
              p: 1, 
              bgcolor: COLORS.primaryLight, 
              borderRadius: 1.5,
              border: `1px solid ${COLORS.primary}20`
            }}>
              <Typography sx={{ fontSize: '0.7rem', color: COLORS.text.secondary }}>
                SO Item (Auto-selected):
              </Typography>
              <Typography sx={{ fontSize: '0.75rem', fontWeight: 500, color: COLORS.text.primary }}>
                {availableSOItems[0]?.part_no} - {availableSOItems[0]?.part_name}
              </Typography>
            </Box>
          </Grid>
        )}
      </Grid>
    </Paper>

    {/* Inline Sales Order Form */}
    {showSalesOrderForm && (
      <InlineSalesOrderForm
        onSave={handleSalesOrderAdded}
        onCancel={() => setShowSalesOrderForm(false)}
      />
    )}

    {/* Item Master Selection */}
    <Paper sx={{ p: 2, borderRadius: 1.5, border: `1px solid ${COLORS.border}`, boxShadow: 'none' }}>
      <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color: COLORS.primary, mb: 1.5 }}>
        <ProductionIcon sx={{ fontSize: '1rem', mr: 0.5, verticalAlign: 'middle' }} />
        Item Details
      </Typography>

      <Grid container spacing={1.5}>
        <Grid size={{ xs: 12 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Label required>ITEM</Label>
              <Button
                size="small"
                onClick={() => setShowItemForm(true)}
                startIcon={<AddIcon sx={{ fontSize: '0.8rem' }} />}
                sx={{
                  height: 24,
                  px: 1.5,
                  borderRadius: 1,
                  color: COLORS.primary,
                  fontSize: '0.6rem',
                  fontWeight: 500,
                  textTransform: 'none',
                  '&:hover': { bgcolor: COLORS.primaryLight }
                }}
              >
                Add New
              </Button>
            </Box>
            <Autocomplete
              fullWidth
              options={items}
              getOptionLabel={(option) => `${option.part_no} - ${option.part_description || option.part_name} (${option.item_category || 'N/A'})`}
              value={selectedItem}
              onChange={handleItemChange}
              loading={loadingItems}
              renderInput={(params) => (
                <TextField
                  {...params}
                  size="small"
                  placeholder="Select item"
                  error={!!fieldErrors.item_id}
                  helperText={fieldErrors.item_id}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 1.5,
                      fontSize: '0.75rem',
                      '&:hover fieldset': { borderColor: COLORS.primary },
                      '&.Mui-error fieldset': { borderColor: '#EF4444' }
                    }
                  }}
                />
              )}
            />
          </Box>
        </Grid>
      </Grid>
    </Paper>

    {/* Inline Item Form */}
    {showItemForm && (
      <InlineItemForm
        onSave={handleItemAdded}
        onCancel={() => setShowItemForm(false)}
      />
    )}

    {/* BOM & Routing */}
    <Paper sx={{ p: 2, borderRadius: 1.5, border: `1px solid ${COLORS.border}`, boxShadow: 'none' }}>
      <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color: COLORS.primary, mb: 1.5 }}>
        Production Specifications
      </Typography>

      <Grid container spacing={1.5}>
        <Grid size={{ xs: 12, sm: 6 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Label required>BOM</Label>
              <Button
                size="small"
                onClick={() => setShowBomForm(true)}
                startIcon={<AddIcon sx={{ fontSize: '0.8rem' }} />}
                sx={{
                  height: 24,
                  px: 1.5,
                  borderRadius: 1,
                  color: COLORS.primary,
                  fontSize: '0.6rem',
                  fontWeight: 500,
                  textTransform: 'none',
                  '&:hover': { bgcolor: COLORS.primaryLight }
                }}
              >
                Add New
              </Button>
            </Box>
            <Autocomplete
              fullWidth
              options={boms}
              getOptionLabel={(option) => `${option.bom_id} - ${option.parent_part_no} (v${option.bom_version})`}
              value={boms.find(b => b._id === formData.bom_id) || null}
              onChange={(event, newValue) => {
                setFormData(prev => ({ ...prev, bom_id: newValue?._id || '' }));
                setFieldErrors(prev => ({ ...prev, bom_id: '' }));
              }}
              loading={loadingBOM}
              renderInput={(params) => (
                <TextField
                  {...params}
                  size="small"
                  placeholder="Select BOM"
                  error={!!fieldErrors.bom_id}
                  helperText={fieldErrors.bom_id}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 1.5,
                      fontSize: '0.75rem',
                      '&:hover fieldset': { borderColor: COLORS.primary },
                      '&.Mui-error fieldset': { borderColor: '#EF4444' }
                    }
                  }}
                />
              )}
            />
          </Box>
        </Grid>

        <Grid size={{ xs: 12, sm: 6 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Label required>ROUTING</Label>
              <Button
                size="small"
                onClick={() => setShowRoutingForm(true)}
                startIcon={<AddIcon sx={{ fontSize: '0.8rem' }} />}
                sx={{
                  height: 24,
                  px: 1.5,
                  borderRadius: 1,
                  color: COLORS.primary,
                  fontSize: '0.6rem',
                  fontWeight: 500,
                  textTransform: 'none',
                  '&:hover': { bgcolor: COLORS.primaryLight }
                }}
              >
                Add New
              </Button>
            </Box>
            <Autocomplete
              fullWidth
              options={routings}
              getOptionLabel={(option) => `${option.routing_id} - ${option.routing_name}`}
              value={routings.find(r => r._id === formData.routing_id) || null}
              onChange={(event, newValue) => {
                setFormData(prev => ({ ...prev, routing_id: newValue?._id || '' }));
                setFieldErrors(prev => ({ ...prev, routing_id: '' }));
              }}
              loading={loadingRouting}
              renderInput={(params) => (
                <TextField
                  {...params}
                  size="small"
                  placeholder="Select routing"
                  error={!!fieldErrors.routing_id}
                  helperText={fieldErrors.routing_id}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 1.5,
                      fontSize: '0.75rem',
                      '&:hover fieldset': { borderColor: COLORS.primary },
                      '&.Mui-error fieldset': { borderColor: '#EF4444' }
                    }
                  }}
                />
              )}
            />
          </Box>
        </Grid>
      </Grid>
    </Paper>

    {/* Inline BOM Form */}
    {showBomForm && (
      <InlineBomForm
        onSave={handleBomAdded}
        onCancel={() => setShowBomForm(false)}
      />
    )}

    {/* Inline Routing Form */}
    {showRoutingForm && (
      <InlineRoutingForm
        onSave={handleRoutingAdded}
        onCancel={() => setShowRoutingForm(false)}
      />
    )}
  </Stack>
);

  // Render Step 2 Content
  const renderStep2Content = () => (
    <Stack spacing={2}>
      <Paper sx={{ p: 2, borderRadius: 1.5, border: `1px solid ${COLORS.border}`, boxShadow: 'none' }}>
        <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color: COLORS.primary, mb: 1.5 }}>
          <EventIcon sx={{ fontSize: '1rem', mr: 0.5, verticalAlign: 'middle' }} />
          Planning Details
        </Typography>

        <Grid container spacing={1.5}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
              <Label required>PLANNED QUANTITY</Label>
              <TextField
                fullWidth
                type="number"
                size="small"
                name="planned_qty"
                value={formData.planned_qty}
                onChange={handleChange}
                placeholder="e.g., 500"
                error={!!fieldErrors.planned_qty}
                helperText={fieldErrors.planned_qty}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 1.5,
                    fontSize: '0.75rem',
                    '&:hover fieldset': { borderColor: COLORS.primary },
                    '&.Mui-error fieldset': { borderColor: '#EF4444' }
                  }
                }}
              />
            </Box>
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
              <Label>WORK ORDER TYPE</Label>
              <FormControl fullWidth size="small">
                <Select
                  name="wo_type"
                  value={formData.wo_type}
                  onChange={handleChange}
                  sx={{
                    borderRadius: 1.5,
                    fontSize: '0.75rem',
                    '& .MuiSelect-select': { py: 1, px: 1.5 }
                  }}
                >
                  {WO_TYPE_OPTIONS.map(option => (
                    <MenuItem key={option} value={option} sx={{ fontSize: '0.75rem' }}>
                      {option}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          </Grid>

          <Grid size={{ xs: 12, sm: 4 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
              <Label required>PLANNED START</Label>
              <TextField
                fullWidth
                type="date"
                size="small"
                name="planned_start"
                value={formData.planned_start}
                onChange={handleChange}
                error={!!fieldErrors.planned_start}
                helperText={fieldErrors.planned_start}
                InputLabelProps={{ shrink: true }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 1.5,
                    fontSize: '0.75rem',
                    '&:hover fieldset': { borderColor: COLORS.primary },
                    '&.Mui-error fieldset': { borderColor: '#EF4444' }
                  },
                  '& .MuiInputBase-input': { py: 1, px: 1.5, fontSize: '0.75rem' }
                }}
              />
            </Box>
          </Grid>

          <Grid size={{ xs: 12, sm: 4 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
              <Label required>PLANNED END</Label>
              <TextField
                fullWidth
                type="date"
                size="small"
                name="planned_end"
                value={formData.planned_end}
                onChange={handleChange}
                error={!!fieldErrors.planned_end}
                helperText={fieldErrors.planned_end}
                InputLabelProps={{ shrink: true }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 1.5,
                    fontSize: '0.75rem',
                    '&:hover fieldset': { borderColor: COLORS.primary },
                    '&.Mui-error fieldset': { borderColor: '#EF4444' }
                  },
                  '& .MuiInputBase-input': { py: 1, px: 1.5, fontSize: '0.75rem' }
                }}
              />
            </Box>
          </Grid>

          <Grid size={{ xs: 12, sm: 4 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
              <Label>REQUIRED BY</Label>
              <TextField
                fullWidth
                type="date"
                size="small"
                name="required_by"
                value={formData.required_by}
                onChange={handleChange}
                InputLabelProps={{ shrink: true }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 1.5,
                    fontSize: '0.75rem',
                    '&:hover fieldset': { borderColor: COLORS.primary }
                  },
                  '& .MuiInputBase-input': { py: 1, px: 1.5, fontSize: '0.75rem' }
                }}
              />
            </Box>
          </Grid>
        </Grid>
      </Paper>

      <Paper sx={{ p: 2, borderRadius: 1.5, border: `1px solid ${COLORS.border}`, boxShadow: 'none' }}>
        <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color: COLORS.primary, mb: 1.5 }}>
          <SettingsIcon sx={{ fontSize: '1rem', mr: 0.5, verticalAlign: 'middle' }} />
          Additional Settings
        </Typography>

        <Grid container spacing={1.5}>
          <Grid size={{ xs: 12, sm: showAssemblyLine ? 6 : 12 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
              <Label>PRIORITY</Label>
              <FormControl fullWidth size="small">
                <Select
                  name="priority"
                  value={formData.priority}
                  onChange={handleChange}
                  sx={{
                    borderRadius: 1.5,
                    fontSize: '0.75rem',
                    '& .MuiSelect-select': { py: 1, px: 1.5 }
                  }}
                >
                  {PRIORITY_OPTIONS.map(option => (
                    <MenuItem key={option} value={option} sx={{ fontSize: '0.75rem' }}>
                      {option}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          </Grid>

          {showAssemblyLine && (
            <Grid size={{ xs: 12, sm: 6 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Label>ASSEMBLY LINE</Label>
                  <Tooltip title="Add New Assembly Line">
                    <IconButton
                      size="small"
                      onClick={() => {}}
                      sx={{
                        color: COLORS.primary,
                        p: 0.25,
                        '&:hover': { bgcolor: COLORS.primaryLight }
                      }}
                    >
                      <AddIcon sx={{ fontSize: '0.8rem' }} />
                    </IconButton>
                  </Tooltip>
                </Box>
                <Autocomplete
                  fullWidth
                  options={assemblyLines}
                  getOptionLabel={getAssemblyLineLabel}
                  value={getSelectedAssemblyLine()}
                  onChange={handleAssemblyLineChange}
                  loading={loadingAssemblyLines}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      size="small"
                      placeholder={loadingAssemblyLines ? "Loading assembly lines..." : "Select assembly line (optional)"}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 1.5,
                          fontSize: '0.75rem',
                          '&:hover fieldset': { borderColor: COLORS.primary }
                        },
                        '& .MuiInputBase-input': { py: 1, px: 1.5, fontSize: '0.75rem' }
                      }}
                    />
                  )}
                  noOptionsText="No assembly lines found"
                  loadingText="Loading assembly lines..."
                />
                <Typography sx={{ fontSize: '0.6rem', color: COLORS.text.tertiary }}>
                  Select the assembly line where this work order will be processed
                </Typography>
              </Box>
            </Grid>
          )}

          <Grid size={{ xs: 12 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Label>MRP RUN ID</Label>
                <Tooltip title="Add New MRP Run">
                  <IconButton
                    size="small"
                    onClick={() => {}}
                    sx={{
                      color: COLORS.primary,
                      p: 0.25,
                      '&:hover': { bgcolor: COLORS.primaryLight }
                    }}
                  >
                    <AddIcon sx={{ fontSize: '0.8rem' }} />
                  </IconButton>
                </Tooltip>
              </Box>
              <Autocomplete
                fullWidth
                options={mrpRuns}
                getOptionLabel={(option) => `${option.mrp_run_id} - ${option.run_type} (${new Date(option.run_date).toLocaleDateString()})`}
                value={mrpRuns.find(m => m._id === formData.mrp_run_id) || null}
                onChange={(event, newValue) => {
                  setFormData(prev => ({ ...prev, mrp_run_id: newValue?._id || '' }));
                }}
                loading={loadingMRP}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    size="small"
                    placeholder="Select MRP run (optional)"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 1.5,
                        fontSize: '0.75rem',
                        '&:hover fieldset': { borderColor: COLORS.primary }
                      }
                    }}
                  />
                )}
              />
            </Box>
          </Grid>
        </Grid>
      </Paper>
    </Stack>
  );

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
            overflow: 'hidden'
          }
        }}
      >
        <DialogTitle sx={{
          borderBottom: `1px solid ${COLORS.border}`,
          py: 1.5,
          px: 2.5,
          mb: 0,
          bgcolor: COLORS.background.white
        }}>
          <Typography sx={{ fontSize: '1.2rem', fontWeight: 700, color: COLORS.text.primary }}>
            Add New Work Order
          </Typography>
        </DialogTitle>

        <Box sx={{ px: 2.5, pt: 1 }}>
          <FloatingErrorAlert error={error} onClose={() => setError('')} />
        </Box>

        <Box sx={{ px: 2.5, pt: error ? 1 : 2, bgcolor: COLORS.background.white }}>
          <Stepper activeStep={activeStep} alternativeLabel connector={<ColorConnector />}>
            {steps.map((label, index) => (
              <Step key={label}>
                <StepLabel>
                  <Typography sx={{ fontSize: '0.75rem', fontWeight: 500, color: COLORS.text.secondary }}>
                    {index + 1}. {label}
                  </Typography>
                </StepLabel>
              </Step>
            ))}
          </Stepper>
        </Box>

        <DialogContent sx={{ p: 2.5, pt: error ? 1 : 2 }}>
          {activeStep === 0 ? renderStep1Content() : renderStep2Content()}
        </DialogContent>

        <DialogActions sx={{
          px: 2.5,
          py: 1.5,
          borderTop: `1px solid ${COLORS.border}`,
          bgcolor: COLORS.background.white,
          justifyContent: 'space-between'
        }}>
          <Button
            onClick={handleBack}
            disabled={activeStep === 0 || loading}
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
            {activeStep === steps.length - 1 ? (
              <Button
                variant="contained"
                onClick={handleSubmit}
                disabled={loading}
                startIcon={<AddIcon sx={{ fontSize: '1rem' }} />}
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
                {loading ? 'Creating...' : 'Create Work Order'}
              </Button>
            ) : (
              <Button
                variant="contained"
                onClick={handleNext}
                disabled={loading}
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
                  '&:hover': {
                    bgcolor: COLORS.primaryDark,
                  }
                }}
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

export default AddWorkOrder;