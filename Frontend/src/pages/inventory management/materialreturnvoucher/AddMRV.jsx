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
//   Table,
//   TableBody,
//   TableCell,
//   TableContainer,
//   TableHead,
//   TableRow
// } from '@mui/material';
// import {
//   Add as AddIcon,
//   Close as CloseIcon,
//   Search as SearchIcon,
//   Warning as WarningIcon,
//   Error as ErrorIcon,
//   Delete as DeleteIcon,
//   NavigateNext as NavigateNextIcon,
//   NavigateBefore as NavigateBeforeIcon,
//   Warehouse as WarehouseIcon,
//   Inventory as InventoryIcon,
//   Person as PersonIcon
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

// // Unit options based on schema enum
// const UNIT_OPTIONS = ['Nos', 'Kg', 'Meter', 'Sheet', 'Roll'];

// // Return condition options based on schema
// const CONDITION_OPTIONS = ['Good', 'Partially Damaged', 'Scrap'];

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

// const steps = ['Basic Information', 'Return Items'];

// const AddMRV = ({ open, onClose, onAdd }) => {
//   const [activeStep, setActiveStep] = useState(0);
//   const [loading, setLoading] = useState(false);
//   const [fetching, setFetching] = useState(false);
//   const [errors, setErrors] = useState({});
//   const [mivError, setMivError] = useState('');
//   const [stockError, setStockError] = useState('');
  
//   // Modal states for Add functionality
//   const [addEmployeeOpen, setAddEmployeeOpen] = useState(false);
//   const [employeeTypeForAdd, setEmployeeTypeForAdd] = useState(''); // 'returned_by' or 'received_by'
  
//   // Data states
//   const [mivList, setMivList] = useState([]);
//   const [employees, setEmployees] = useState([]);
//   const [warehouses, setWarehouses] = useState([]);
//   const [items, setItems] = useState([]);
  
//   // Selected MIV details
//   const [selectedMIV, setSelectedMIV] = useState(null);
//   const [mivItems, setMivItems] = useState([]);
  
//   const [formData, setFormData] = useState({
//     miv_id: '',
//     returned_by: '',
//     received_by: '',
//     condition: 'Good',
//     remarks: '',
//     items: [{
//       item_id: '',
//       part_no: '',
//       returned_qty: '',
//       warehouse_id: '',
//       bin_id: '',
//       unit: '',
//       unit_cost: 0,
//       max_returnable_qty: 0
//     }]
//   });

//   useEffect(() => {
//     if (open) {
//       fetchMIVList();
//       fetchEmployees();
//       fetchWarehouses();
//       fetchItems();
//       resetForm();
//     }
//   }, [open]);

//   // Fetch all posted MIVs that can have returns
//   const fetchMIVList = async () => {
//     try {
//       setFetching(true);
//       const token = localStorage.getItem('token');
//       const res = await axios.get(`${BASE_URL}/api/miv?status=Issued&limit=1000`, {
//         headers: { Authorization: `Bearer ${token}` }
//       });
//       if (res.data.success) {
//         setMivList(res.data.data || []);
//       }
//     } catch (err) {
//       console.error('Error fetching MIVs:', err);
//     } finally {
//       setFetching(false);
//     }
//   };

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
//       const token = localStorage.getItem('token');
//       const res = await axios.get(`${BASE_URL}/api/warehouses?limit=1000`, {
//         headers: { Authorization: `Bearer ${token}` }
//       });
//       if (res.data.success) {
//         setWarehouses(res.data.data || []);
//       }
//     } catch (err) {
//       console.error('Error fetching warehouses:', err);
//     }
//   };

//   const fetchItems = async () => {
//     try {
//       setFetching(true);
//       const token = localStorage.getItem('token');
//       const res = await axios.get(`${BASE_URL}/api/items?limit=1000`, {
//         headers: { Authorization: `Bearer ${token}` }
//       });
//       if (res.data.success) {
//         setItems(res.data.data || []);
//       }
//     } catch (err) {
//       console.error('Error fetching items:', err);
//     } finally {
//       setFetching(false);
//     }
//   };

//   // Fetch MIV details when selected
//   const fetchMIVDetails = async (mivId) => {
//     try {
//       setFetching(true);
//       const token = localStorage.getItem('token');
//       const res = await axios.get(`${BASE_URL}/api/miv/${mivId}`, {
//         headers: { Authorization: `Bearer ${token}` }
//       });
//       if (res.data.success) {
//         const mivData = res.data.data;
//         setSelectedMIV(mivData);
        
//         // Transform MIV items to return items
//         const returnItems = (mivData.items || []).map(item => ({
//           item_id: item.item_id?._id || item.item_id,
//           part_no: item.part_no,
//           item_description: item.item_description || item.description,
//           issued_qty: item.issued_qty,
//           returned_qty: '',
//           warehouse_id: item.warehouse_id?._id || item.warehouse_id,
//           bin_id: item.bin_id?._id || item.bin_id,
//           unit: item.unit,
//           unit_cost: item.unit_cost,
//           max_returnable_qty: item.issued_qty - (item.returned_qty || 0)
//         }));
        
//         setMivItems(returnItems);
//         setFormData(prev => ({
//           ...prev,
//           items: returnItems.map(item => ({
//             item_id: item.item_id,
//             part_no: item.part_no,
//             returned_qty: '',
//             warehouse_id: item.warehouse_id,
//             bin_id: item.bin_id,
//             unit: item.unit,
//             unit_cost: item.unit_cost,
//             max_returnable_qty: item.max_returnable_qty
//           }))
//         }));
//       }
//     } catch (err) {
//       console.error('Error fetching MIV details:', err);
//       setMivError('Failed to load MIV details');
//     } finally {
//       setFetching(false);
//     }
//   };

//   const resetForm = () => {
//     setFormData({
//       miv_id: '',
//       returned_by: '',
//       received_by: '',
//       condition: 'Good',
//       remarks: '',
//       items: [{
//         item_id: '',
//         part_no: '',
//         returned_qty: '',
//         warehouse_id: '',
//         bin_id: '',
//         unit: '',
//         unit_cost: 0,
//         max_returnable_qty: 0
//       }]
//     });
//     setSelectedMIV(null);
//     setMivItems([]);
//     setErrors({});
//     setMivError('');
//     setStockError('');
//     setActiveStep(0);
//   };

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData(prev => ({ ...prev, [name]: value }));
//     if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
//   };

//   const handleAutocompleteChange = (name, value) => {
//     if (name === 'miv_id' && value) {
//       setFormData(prev => ({ ...prev, miv_id: value._id }));
//       fetchMIVDetails(value._id);
//       setMivError('');
//     } else {
//       setFormData(prev => ({ ...prev, [name]: value?._id || '' }));
//     }
//     if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
//   };

//   // Handler for Add Employee modal
//   const handleEmployeeAdded = (newEmployee) => {
//     setEmployees(prev => [...prev, newEmployee]);
//     if (employeeTypeForAdd === 'returned_by') {
//       setFormData(prev => ({ ...prev, returned_by: newEmployee._id }));
//     } else if (employeeTypeForAdd === 'received_by') {
//       setFormData(prev => ({ ...prev, received_by: newEmployee._id }));
//     }
//     setEmployeeTypeForAdd('');
//   };

//   const handleItemChange = (index, field, value) => {
//     const updated = [...formData.items];
//     const maxQty = updated[index].max_returnable_qty;
    
//     if (field === 'returned_qty') {
//       const qty = Number(value);
//       if (qty < 0) return;
//       if (qty > maxQty) {
//         setStockError(`Return quantity cannot exceed ${maxQty}`);
//         return;
//       }
//       setStockError('');
//     }
    
//     updated[index][field] = value;
//     setFormData(prev => ({ ...prev, items: updated }));
//     if (errors[`item_${index}_${field}`]) {
//       setErrors(prev => ({ ...prev, [`item_${index}_${field}`]: '' }));
//     }
//   };

//   const removeItem = (index) => {
//     const updated = formData.items.filter((_, i) => i !== index);
//     setFormData(prev => ({ ...prev, items: updated }));
//   };

//   const validateStep = (step) => {
//     const newErrors = {};
//     let isValid = true;

//     switch (step) {
//       case 0: // Basic Information
//         if (!formData.miv_id) {
//           newErrors.miv_id = 'MIV is required';
//           isValid = false;
//         }
//         if (!formData.returned_by) {
//           newErrors.returned_by = 'Returned By is required';
//           isValid = false;
//         }
//         if (!formData.received_by) {
//           newErrors.received_by = 'Received By is required';
//           isValid = false;
//         }
//         if (!formData.condition) {
//           newErrors.condition = 'Condition is required';
//           isValid = false;
//         }
//         break;
      
//       case 1: // Return Items
//         formData.items.forEach((item, idx) => {
//           if (!item.returned_qty) {
//             newErrors[`item_${idx}_returned_qty`] = 'Return quantity is required';
//             isValid = false;
//           } else if (Number(item.returned_qty) <= 0) {
//             newErrors[`item_${idx}_returned_qty`] = 'Quantity must be greater than 0';
//             isValid = false;
//           }
//         });
//         break;
      
//       default:
//         return true;
//     }

//     setErrors(newErrors);
//     if (!isValid) {
//       setMivError('Please fix the errors in this section');
//     }
//     return isValid;
//   };

//   const handleNext = () => {
//     if (validateStep(activeStep)) {
//       setMivError('');
//       setActiveStep((prevStep) => prevStep + 1);
//     }
//   };

//   const handleBack = () => {
//     setMivError('');
//     setActiveStep((prevStep) => prevStep - 1);
//   };

//   const handleSubmit = async () => {
//     if (!validateStep(1)) return;
    
//     // Filter out items with zero return quantity
//     const itemsToReturn = formData.items.filter(item => 
//       item.returned_qty && Number(item.returned_qty) > 0
//     );
    
//     if (itemsToReturn.length === 0) {
//       setStockError('At least one item with return quantity is required');
//       return;
//     }
    
//     setLoading(true);
//     setStockError('');
    
//     try {
//       const token = localStorage.getItem('token');
      
//       const itemsPayload = itemsToReturn.map(item => ({
//         item_id: item.item_id,
//         part_no: item.part_no,
//         returned_qty: Number(item.returned_qty),
//         warehouse_id: item.warehouse_id,
//         bin_id: item.bin_id || ''
//       }));
      
//       const payload = {
//         miv_id: formData.miv_id,
//         returned_by: formData.returned_by,
//         received_by: formData.received_by,
//         condition: formData.condition,
//         items: itemsPayload,
//         remarks: formData.remarks || ''
//       };
      
//       const response = await axios.post(`${BASE_URL}/api/mrv`, payload, {
//         headers: { 
//           Authorization: `Bearer ${token}`, 
//           'Content-Type': 'application/json' 
//         }
//       });
      
//       if (response.data.success) {
//         if (onAdd) onAdd(response.data.data);
//         onClose();
//       } else {
//         setErrors(prev => ({ ...prev, submit: response.data.message || 'Failed to create MRV' }));
//       }
//     } catch (err) {
//       console.error('API Error:', err);
      
//       if (err.response) {
//         const errorMsg = err.response.data?.message || err.response.data?.error || 'Failed to create MRV';
        
//         if (errorMsg.toLowerCase().includes('insufficient') || 
//             errorMsg.toLowerCase().includes('exceeds')) {
//           setStockError(errorMsg);
//         } else {
//           setErrors(prev => ({ ...prev, submit: errorMsg }));
//         }
//       } else if (err.request) {
//         setErrors(prev => ({ ...prev, submit: 'No response from server. Please check your connection.' }));
//       } else {
//         setErrors(prev => ({ ...prev, submit: err.message || 'An error occurred while creating MRV' }));
//       }
//     } finally { 
//       setLoading(false); 
//     }
//   };

//   // Display helper functions
//   const getMIVDisplay = (miv) => {
//     if (!miv) return '';
//     return `${miv.miv_number} - ${miv.wo_number || ''}`;
//   };

//   const getPersonName = (person) => {
//     if (!person) return '';
//     if (person.FirstName && person.LastName) return `${person.FirstName} ${person.LastName}`;
//     if (person.FirstName) return person.FirstName;
//     if (person.Username) return person.Username;
//     if (person.Email) return person.Email;
//     if (person.name) return person.name;
//     return person._id || '';
//   };

//   const getItemDisplay = (item) => {
//     if (!item) return '';
//     const partNo = item.part_no || item.PartNo || item.item_code || '';
//     const description = item.description || item.Description || item.item_description || item.name || '';
//     if (partNo && description) {
//       return `${partNo} - ${description.substring(0, 50)}`;
//     }
//     if (partNo) return partNo;
//     if (description) return description.substring(0, 50);
//     return item._id?.slice(-6) || 'Unknown Item';
//   };

//   const getWarehouseDisplay = (wh) => {
//     if (!wh) return '';
//     return wh.warehouse_name || wh.name || wh.warehouse_code || wh._id || '';
//   };

//   const getWarehouseBins = (warehouseId) => {
//     const warehouse = warehouses.find(w => w._id === warehouseId);
//     return (warehouse && warehouse.bins && Array.isArray(warehouse.bins)) ? warehouse.bins : [];
//   };

//   const getBinDisplay = (bin) => {
//     if (!bin) return '';
//     const binCode = bin.bin_code || bin.bin_id || '';
//     const rack = bin.rack || '';
//     return rack ? `${binCode} - ${rack}` : binCode;
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
//                 {/* MIV Selection */}
//                 <Grid size={{ xs: 12 }}>
//                   <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//                     <Typography sx={labelStyle}>
//                       MATERIAL ISSUE VOUCHER (MIV) <span style={{ color: '#EF4444' }}>*</span>
//                     </Typography>
//                     <Autocomplete
//                       fullWidth
//                       options={mivList}
//                       getOptionLabel={getMIVDisplay}
//                       onChange={(e, val) => handleAutocompleteChange('miv_id', val)}
//                       loading={fetching}
//                       isOptionEqualToValue={(option, value) => option._id === value?._id}
//                       renderInput={(params) => (
//                         <TextField
//                           {...params}
//                           size="small"
//                           error={!!errors.miv_id}
//                           helperText={errors.miv_id}
//                           placeholder="Select MIV to return materials from"
//                           sx={inputStyle}
//                           InputProps={{
//                             ...params.InputProps,
//                             startAdornment: (
//                               <InputAdornment position="start">
//                                 <SearchIcon sx={{ fontSize: '0.9rem', color: COLORS.text.tertiary }} />
//                               </InputAdornment>
//                             ),
//                           }}
//                         />
//                       )}
//                     />
//                     <Typography sx={{ fontSize: '0.6rem', color: COLORS.text.tertiary }}>
//                       Only posted/issued MIVs are shown
//                     </Typography>
//                   </Box>
//                 </Grid>
                
//                 {/* Returned By with Add button */}
//                 <Grid size={{ xs: 12, md: 6 }}>
//                   <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//                     <Typography sx={labelStyle}>
//                       RETURNED BY <span style={{ color: '#EF4444' }}>*</span>
//                     </Typography>
//                     <Box sx={{ display: 'flex', gap: 1 }}>
//                       <Box sx={{ flex: 1 }}>
//                         <Autocomplete
//                           fullWidth
//                           options={employees}
//                           getOptionLabel={getPersonName}
//                           onChange={(e, val) => handleAutocompleteChange('returned_by', val)}
//                           isOptionEqualToValue={(option, value) => option._id === value?._id}
//                           renderInput={(params) => (
//                             <TextField
//                               {...params}
//                               size="small"
//                               error={!!errors.returned_by}
//                               helperText={errors.returned_by}
//                               placeholder="Select employee returning materials"
//                               sx={inputStyle}
//                             />
//                           )}
//                         />
//                       </Box>
//                       <Button
//                         variant="outlined"
//                         size="small"
//                         onClick={() => {
//                           setEmployeeTypeForAdd('returned_by');
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
                
//                 {/* Received By with Add button */}
//                 <Grid size={{ xs: 12, md: 6 }}>
//                   <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//                     <Typography sx={labelStyle}>
//                       RECEIVED BY (STORE) <span style={{ color: '#EF4444' }}>*</span>
//                     </Typography>
//                     <Box sx={{ display: 'flex', gap: 1 }}>
//                       <Box sx={{ flex: 1 }}>
//                         <Autocomplete
//                           fullWidth
//                           options={employees}
//                           getOptionLabel={getPersonName}
//                           onChange={(e, val) => handleAutocompleteChange('received_by', val)}
//                           isOptionEqualToValue={(option, value) => option._id === value?._id}
//                           renderInput={(params) => (
//                             <TextField
//                               {...params}
//                               size="small"
//                               error={!!errors.received_by}
//                               helperText={errors.received_by}
//                               placeholder="Select store employee receiving materials"
//                               sx={inputStyle}
//                             />
//                           )}
//                         />
//                       </Box>
//                       <Button
//                         variant="outlined"
//                         size="small"
//                         onClick={() => {
//                           setEmployeeTypeForAdd('received_by');
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
                
//                 {/* Condition */}
//                 <Grid size={{ xs: 12, md: 6 }}>
//                   <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//                     <Typography sx={labelStyle}>
//                       RETURN CONDITION <span style={{ color: '#EF4444' }}>*</span>
//                     </Typography>
//                     <TextField
//                       select
//                       fullWidth
//                       size="small"
//                       name="condition"
//                       value={formData.condition}
//                       onChange={handleChange}
//                       error={!!errors.condition}
//                       helperText={errors.condition}
//                       sx={inputStyle}
//                     >
//                       {CONDITION_OPTIONS.map((option) => (
//                         <MenuItem key={option} value={option} sx={{ fontSize: '0.75rem' }}>
//                           {option}
//                         </MenuItem>
//                       ))}
//                     </TextField>
//                   </Box>
//                 </Grid>
                
//                 {/* Remarks */}
//                 <Grid size={{ xs: 12 }}>
//                   <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//                     <Typography sx={labelStyle}>REMARKS</Typography>
//                     <TextField
//                       fullWidth
//                       multiline
//                       rows={2}
//                       name="remarks"
//                       value={formData.remarks}
//                       onChange={handleChange}
//                       size="small"
//                       placeholder="Enter reason for return or any additional remarks..."
//                       sx={inputStyle}
//                     />
//                   </Box>
//                 </Grid>
//               </Grid>
//             </Paper>
            
//             {/* MIV Items Summary */}
//             {selectedMIV && mivItems.length > 0 && (
//               <Paper sx={{ p: 2.5, bgcolor: COLORS.background.light, borderRadius: 2, border: `1px solid ${COLORS.border}` }}>
//                 <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color: COLORS.primary, mb: 2 }}>
//                   MIV Items Summary
//                 </Typography>
//                 <TableContainer>
//                   <Table size="small">
//                     <TableHead>
//                       <TableRow>
//                         <TableCell sx={{ fontSize: '0.7rem', fontWeight: 600 }}>Item</TableCell>
//                         <TableCell sx={{ fontSize: '0.7rem', fontWeight: 600 }}>Part No</TableCell>
//                         <TableCell sx={{ fontSize: '0.7rem', fontWeight: 600 }} align="right">Issued Qty</TableCell>
//                         <TableCell sx={{ fontSize: '0.7rem', fontWeight: 600 }} align="right">Returned Qty</TableCell>
//                         <TableCell sx={{ fontSize: '0.7rem', fontWeight: 600 }} align="right">Available to Return</TableCell>
//                         <TableCell sx={{ fontSize: '0.7rem', fontWeight: 600 }}>Unit</TableCell>
//                       </TableRow>
//                     </TableHead>
//                     <TableBody>
//                       {mivItems.map((item, idx) => (
//                         <TableRow key={idx}>
//                           <TableCell sx={{ fontSize: '0.7rem' }}>{item.item_description || '-'}</TableCell>
//                           <TableCell sx={{ fontSize: '0.7rem' }}>{item.part_no || '-'}</TableCell>
//                           <TableCell sx={{ fontSize: '0.7rem' }} align="right">{item.issued_qty || 0}</TableCell>
//                           <TableCell sx={{ fontSize: '0.7rem' }} align="right">{item.returned_qty || 0}</TableCell>
//                           <TableCell sx={{ fontSize: '0.7rem' }} align="right">
//                             <Typography sx={{ fontWeight: 600, color: COLORS.primary }}>
//                               {item.max_returnable_qty || 0}
//                             </Typography>
//                           </TableCell>
//                           <TableCell sx={{ fontSize: '0.7rem' }}>{item.unit || '-'}</TableCell>
//                         </TableRow>
//                       ))}
//                     </TableBody>
//                   </Table>
//                 </TableContainer>
//               </Paper>
//             )}
//           </Stack>
//         );
      
//       case 1:
//         return (
//           <Stack spacing={2}>
//             <Paper sx={{ p: 2.5, bgcolor: COLORS.background.white, borderRadius: 2, border: `1px solid ${COLORS.border}` }}>
//               <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color: COLORS.primary, mb: 2 }}>
//                 Return Items
//               </Typography>
              
//               <TableContainer component={Paper} sx={{ boxShadow: 'none', border: `1px solid ${COLORS.border}`, borderRadius: 2 }}>
//                 <Table stickyHeader size="small">
//                   <TableHead>
//                     <TableRow sx={{ bgcolor: COLORS.background.light }}>
//                       <TableCell sx={{ fontSize: '0.7rem', fontWeight: 600, minWidth: 180 }}>Item</TableCell>
//                       <TableCell sx={{ fontSize: '0.7rem', fontWeight: 600, minWidth: 100 }}>Part No</TableCell>
//                       <TableCell sx={{ fontSize: '0.7rem', fontWeight: 600, minWidth: 100 }} align="right">Unit</TableCell>
//                       <TableCell sx={{ fontSize: '0.7rem', fontWeight: 600, minWidth: 100 }} align="right">Max Returnable</TableCell>
//                       <TableCell sx={{ fontSize: '0.7rem', fontWeight: 600, minWidth: 120 }} align="right">Return Qty*</TableCell>
//                       <TableCell sx={{ fontSize: '0.7rem', fontWeight: 600, minWidth: 150 }}>Warehouse</TableCell>
//                       <TableCell sx={{ fontSize: '0.7rem', fontWeight: 600, minWidth: 120 }}>Bin</TableCell>
//                       <TableCell sx={{ width: 50 }}></TableCell>
//                     </TableRow>
//                   </TableHead>
//                   <TableBody>
//                     {formData.items.map((item, idx) => {
//                       const warehouseBins = getWarehouseBins(item.warehouse_id);
//                       const mivItem = mivItems.find(m => m.item_id === item.item_id);
                      
//                       return (
//                         <TableRow key={idx}>
//                           <TableCell>
//                             <Typography sx={{ fontSize: '0.75rem', fontWeight: 500 }}>
//                               {mivItem?.item_description || '-'}
//                             </Typography>
//                           </TableCell>
//                           <TableCell>
//                             <Typography sx={{ fontSize: '0.75rem' }}>
//                               {item.part_no || mivItem?.part_no || '-'}
//                             </Typography>
//                           </TableCell>
//                           <TableCell align="right">
//                             <Typography sx={{ fontSize: '0.75rem' }}>
//                               {item.unit || mivItem?.unit || '-'}
//                             </Typography>
//                           </TableCell>
//                           <TableCell align="right">
//                             <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: COLORS.primary }}>
//                               {item.max_returnable_qty || 0}
//                             </Typography>
//                           </TableCell>
//                           <TableCell>
//                             <TextField
//                               type="number"
//                               size="small"
//                               value={item.returned_qty}
//                               onChange={(e) => handleItemChange(idx, 'returned_qty', e.target.value)}
//                               error={!!errors[`item_${idx}_returned_qty`]}
//                               helperText={errors[`item_${idx}_returned_qty`]}
//                               placeholder="Qty"
//                               fullWidth
//                               InputProps={{ inputProps: { min: 0, max: item.max_returnable_qty, step: 0.01 } }}
//                               sx={inputStyle}
//                             />
//                           </TableCell>
//                           <TableCell>
//                             <Autocomplete
//                               fullWidth
//                               options={warehouses}
//                               getOptionLabel={getWarehouseDisplay}
//                               value={warehouses.find(w => w._id === item.warehouse_id) || null}
//                               onChange={(e, val) => handleItemChange(idx, 'warehouse_id', val?._id || '')}
//                               disabled
//                               isOptionEqualToValue={(option, value) => option._id === value?._id}
//                               renderInput={(params) => (
//                                 <TextField
//                                   {...params}
//                                   size="small"
//                                   placeholder="Warehouse"
//                                   sx={inputStyle}
//                                 />
//                               )}
//                             />
//                           </TableCell>
//                           <TableCell>
//                             <Autocomplete
//                               fullWidth
//                               options={warehouseBins}
//                               getOptionLabel={getBinDisplay}
//                               value={warehouseBins.find(b => b._id === item.bin_id) || null}
//                               onChange={(e, val) => handleItemChange(idx, 'bin_id', val?._id || '')}
//                               disabled={!item.warehouse_id}
//                               isOptionEqualToValue={(option, value) => option._id === value?._id}
//                               renderInput={(params) => (
//                                 <TextField
//                                   {...params}
//                                   size="small"
//                                   placeholder={!item.warehouse_id ? "Select warehouse first" : "Select bin"}
//                                   sx={inputStyle}
//                                 />
//                               )}
//                             />
//                           </TableCell>
//                           <TableCell>
//                             {formData.items.length > 1 && (
//                               <Tooltip title="Remove Item">
//                                 <IconButton size="small" onClick={() => removeItem(idx)} sx={{ color: '#EF4444' }}>
//                                   <DeleteIcon fontSize="small" />
//                                 </IconButton>
//                               </Tooltip>
//                             )}
//                           </TableCell>
//                         </TableRow>
//                       );
//                     })}
//                   </TableBody>
//                 </Table>
//               </TableContainer>
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
//             Create Material Return Voucher (Draft)
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
//           {mivError && (
//             <Alert severity="warning" icon={<WarningIcon />} sx={{ mb: 2, borderRadius: 1.5 }} onClose={() => setMivError('')}>
//               {mivError}
//             </Alert>
//           )}
          
//           {stockError && (
//             <Alert severity="error" icon={<ErrorIcon />} sx={{ mb: 2, borderRadius: 1.5 }} onClose={() => setStockError('')}>
//               <strong>Invalid Return Quantity!</strong><br />
//               {stockError}
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
//                 {loading ? <CircularProgress size={16} sx={{ color: COLORS.text.light }} /> : 'Create MRV (Draft)'}
//               </Button>
//             ) : (
//               <Button
//                 variant="contained"
//                 onClick={handleNext}
//                 disabled={loading || !formData.miv_id}
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

// export default AddMRV;


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
//   Table,
//   TableBody,
//   TableCell,
//   TableContainer,
//   TableHead,
//   TableRow,
//   FormControl,
//   Select,
//   InputLabel
// } from '@mui/material';
// import {
//   Add as AddIcon,
//   Close as CloseIcon,
//   Search as SearchIcon,
//   Warning as WarningIcon,
//   Error as ErrorIcon,
//   Delete as DeleteIcon,
//   NavigateNext as NavigateNextIcon,
//   NavigateBefore as NavigateBeforeIcon,
//   Edit as EditIcon
// } from '@mui/icons-material';
// import axios from 'axios';
// import BASE_URL from '../../../config/Config';

// // Color constants (same as before)
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

// const UNIT_OPTIONS = ['Nos', 'Kg', 'Meter', 'Sheet', 'Roll'];
// const CONDITION_OPTIONS = ['Good', 'Partially Damaged', 'Scrap'];

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

// const steps = ['Basic Information', 'Return Items'];
// const employeeSteps = ['Personal Info', 'Employment', 'Pay & Work', 'Bank & Emergency'];

// // ==================== Inline Employee Form (Full‑width, with Edit support) ====================
// const InlineEmployeeForm = ({ 
//   onClose, 
//   onSave, 
//   onUpdate, 
//   initialData = null, 
//   isEdit = false,
//   departments = [],
//   designations = [],
//   loadingData = false
// }) => {
//   const [activeStep, setActiveStep] = useState(0);
//   const [loading, setLoading] = useState(false);
//   const [submitError, setSubmitError] = useState('');
//   const [localDepartments, setLocalDepartments] = useState(departments);
//   const [localDesignations, setLocalDesignations] = useState(designations);

//   const [formData, setFormData] = useState({
//     FirstName: '',
//     LastName: '',
//     Gender: 'M',
//     DateOfBirth: '',
//     Email: '',
//     Phone: '',
//     Address: '',
//     DepartmentID: '',
//     DesignationID: '',
//     DateOfJoining: '',
//     EmploymentType: 'Monthly',
//     ContractCompany: '',
//     PayStructureType: 'Fixed',
//     BasicSalary: '',
//     HourlyRate: '',
//     OvertimeRateMultiplier: '1.5',
//     SkillLevel: '',
//     WorkStation: '',
//     LineNumber: '',
//     PAN: '',
//     AadharNumber: '',
//     PFNumber: '',
//     UAN: '',
//     ESINumber: '',
//     BankAccountNumber: '',
//     BankAccountHolderName: '',
//     BankName: '',
//     BankBranch: '',
//     BankIfscCode: '',
//     BankAccountType: 'Savings',
//     EmergencyContactName: '',
//     EmergencyContactRelationship: '',
//     EmergencyContactPhone: '',
//     EmergencyContactAddress: '',
//     EmergencyContactPIN: ''
//   });

//   const [fieldErrors, setFieldErrors] = useState({});
//   const [touched, setTouched] = useState({});

//   // Pre‑fill form when initialData changes
//   useEffect(() => {
//     if (initialData) {
//       setFormData({
//         FirstName: initialData.FirstName || '',
//         LastName: initialData.LastName || '',
//         Gender: initialData.Gender || 'M',
//         DateOfBirth: initialData.DateOfBirth || '',
//         Email: initialData.Email || '',
//         Phone: initialData.Phone || '',
//         Address: initialData.Address || '',
//         DepartmentID: initialData.DepartmentID?._id || initialData.DepartmentID || '',
//         DesignationID: initialData.DesignationID?._id || initialData.DesignationID || '',
//         DateOfJoining: initialData.DateOfJoining || '',
//         EmploymentType: initialData.EmploymentType || 'Monthly',
//         ContractCompany: initialData.ContractCompany || '',
//         PayStructureType: initialData.PayStructureType || 'Fixed',
//         BasicSalary: initialData.BasicSalary || '',
//         HourlyRate: initialData.HourlyRate || '',
//         OvertimeRateMultiplier: initialData.OvertimeRateMultiplier || '1.5',
//         SkillLevel: initialData.SkillLevel || '',
//         WorkStation: initialData.WorkStation || '',
//         LineNumber: initialData.LineNumber || '',
//         PAN: initialData.PAN || '',
//         AadharNumber: initialData.AadharNumber || '',
//         PFNumber: initialData.PFNumber || '',
//         UAN: initialData.UAN || '',
//         ESINumber: initialData.ESINumber || '',
//         BankAccountNumber: initialData.BankDetails?.accountNumber || '',
//         BankAccountHolderName: initialData.BankDetails?.accountHolderName || '',
//         BankName: initialData.BankDetails?.bankName || '',
//         BankBranch: initialData.BankDetails?.branch || '',
//         BankIfscCode: initialData.BankDetails?.ifscCode || '',
//         BankAccountType: initialData.BankDetails?.accountType || 'Savings',
//         EmergencyContactName: initialData.EmergencyContact?.name || '',
//         EmergencyContactRelationship: initialData.EmergencyContact?.relationship || '',
//         EmergencyContactPhone: initialData.EmergencyContact?.phone || '',
//         EmergencyContactAddress: initialData.EmergencyContact?.address || '',
//         EmergencyContactPIN: initialData.EmergencyContact?.pinCode || ''
//       });
//       // Reset errors and touched
//       setFieldErrors({});
//       setTouched({});
//       setActiveStep(0);
//       setSubmitError('');
//     }
//   }, [initialData]);

//   // Options (same as AddEmployees)
//   const genderOptions = [
//     { value: 'M', label: 'Male' },
//     { value: 'F', label: 'Female' },
//     { value: 'O', label: 'Other' }
//   ];
//   const employmentTypeOptions = [
//     { value: 'Monthly', label: 'Monthly' },
//     { value: 'Hourly', label: 'Hourly' },
//     { value: 'PieceRate', label: 'Piece Rate' },
//     { value: 'contract-based', label: 'Contract-Based' }
//   ];
//   const contractCompanyOptions = [
//     { value: 'DISTIL', label: 'DISTIL' },
//     { value: 'AARADHYA', label: 'AARADHYA' },
//     { value: 'MAHI', label: 'MAHI' }
//   ];
//   const payStructureOptions = [
//     { value: 'Fixed', label: 'Fixed' },
//     { value: 'Variable', label: 'Variable' },
//     { value: 'Commission', label: 'Commission' },
//     { value: 'PieceRate', label: 'Piece Rate' }
//   ];
//   const skillLevelOptions = [
//     { value: 'Unskilled', label: 'Unskilled' },
//     { value: 'Semi-Skilled', label: 'Semi-Skilled' },
//     { value: 'Skilled', label: 'Skilled' },
//     { value: 'Highly Skilled', label: 'Highly Skilled' }
//   ];
//   const accountTypeOptions = [
//     { value: 'Savings', label: 'Savings' },
//     { value: 'Current', label: 'Current' },
//     { value: 'Salary', label: 'Salary' }
//   ];

//   // Validation functions (same as AddEmployees)
//   const validateEmail = (email) => /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email);
//   const validatePhone = (phone) => {
//     const clean = phone.replace(/\D/g, '');
//     return clean === '' || /^[6-9]\d{9}$/.test(clean);
//   };
//   const validateName = (name) => /^[A-Za-z\s.'-]+$/.test(name);
//   const validateAddress = (address) => /^[A-Za-z0-9\s,.#\-/]+$/.test(address);
//   const validatePAN = (pan) => /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(pan);
//   const validateAadhar = (aadhar) => /^\d{12}$/.test(aadhar);
//   const validatePF = (pf) => /^[A-Z]{2}\/\d{5}\/\d{7}$/.test(pf);
//   const validateUAN = (uan) => /^\d{12}$/.test(uan);
//   const validateESI = (esi) => /^\d{17}$/.test(esi);
//   const validateAccount = (acc) => /^\d{9,18}$/.test(acc);
//   const validateIFSC = (ifsc) => /^[A-Z]{4}0[A-Z0-9]{6}$/.test(ifsc);
//   const validatePIN = (pin) => /^\d{6}$/.test(pin);
//   const validateBankName = (bank) => /^[A-Za-z\s.'&-]+$/.test(bank);
//   const validateBranch = (branch) => /^[A-Za-z0-9\s.-]+$/.test(branch);
//   const validateRelation = (rel) => /^[A-Za-z\s]+$/.test(rel);
//   const validateWorkStation = (ws) => /^[A-Za-z0-9\s-]+$/.test(ws);

//   const validateField = (name, value) => {
//     switch (name) {
//       case 'FirstName':
//       case 'LastName':
//       case 'BankAccountHolderName':
//       case 'EmergencyContactName':
//         if (value && !validateName(value)) return 'Only letters, spaces, dots, hyphens';
//         break;
//       case 'Email':
//         if (value && !validateEmail(value)) return 'Invalid email';
//         break;
//       case 'Phone':
//       case 'EmergencyContactPhone':
//         if (value && !validatePhone(value)) return '10-digit number starting with 6-9';
//         break;
//       case 'Address':
//       case 'EmergencyContactAddress':
//         if (value && !validateAddress(value)) return 'Invalid characters';
//         break;
//       case 'PAN':
//         if (value && !validatePAN(value)) return 'Format: ABCDE1234F';
//         break;
//       case 'AadharNumber':
//         if (value && !validateAadhar(value)) return '12 digits';
//         break;
//       case 'PFNumber':
//         if (value && !validatePF(value)) return 'Format: XX/12345/1234567';
//         break;
//       case 'UAN':
//         if (value && !validateUAN(value)) return '12 digits';
//         break;
//       case 'ESINumber':
//         if (value && !validateESI(value)) return '17 digits';
//         break;
//       case 'BankAccountNumber':
//         if (value && !validateAccount(value)) return '9-18 digits';
//         break;
//       case 'BankName':
//         if (value && !validateBankName(value)) return 'Letters, spaces, dots, hyphens';
//         break;
//       case 'BankBranch':
//         if (value && !validateBranch(value)) return 'Letters, numbers, spaces, dots, hyphens';
//         break;
//       case 'BankIfscCode':
//         if (value && !validateIFSC(value)) return 'Format: ABCD0123456';
//         break;
//       case 'EmergencyContactRelationship':
//         if (value && !validateRelation(value)) return 'Letters and spaces only';
//         break;
//       case 'EmergencyContactPIN':
//         if (value && !validatePIN(value)) return '6 digits';
//         break;
//       case 'WorkStation':
//       case 'LineNumber':
//         if (value && !validateWorkStation(value)) return 'Letters, numbers, spaces, hyphens';
//         break;
//       case 'ContractCompany':
//         if (formData.EmploymentType === 'contract-based' && !value) return 'Required';
//         break;
//       default:
//         return '';
//     }
//     return '';
//   };

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData(prev => ({ ...prev, [name]: value }));
//     if (touched[name] || value) {
//       const error = validateField(name, value);
//       setFieldErrors(prev => ({ ...prev, [name]: error }));
//     }
//   };

//   const handleBlur = (e) => {
//     const { name, value } = e.target;
//     setTouched(prev => ({ ...prev, [name]: true }));
//     const error = validateField(name, value);
//     setFieldErrors(prev => ({ ...prev, [name]: error }));
//   };

//   const handleAutocompleteChange = (name, value) => {
//     setFormData(prev => ({ ...prev, [name]: value?._id || '' }));
//     setFieldErrors(prev => ({ ...prev, [name]: '' }));
//   };

//   const handleEmploymentTypeChange = (e) => {
//     const employmentType = e.target.value;
//     let payStructure = 'Fixed';
//     if (employmentType === 'PieceRate') payStructure = 'PieceRate';
//     setFormData(prev => ({
//       ...prev,
//       EmploymentType: employmentType,
//       PayStructureType: payStructure
//     }));
//   };

//   // Step‑wise validation
//   const validateStep = (step) => {
//     const errors = {};
//     let isValid = true;

//     switch (step) {
//       case 0: // Personal Info
//         if (!formData.FirstName.trim()) { errors.FirstName = 'Required'; isValid = false; }
//         else { const err = validateField('FirstName', formData.FirstName); if (err) { errors.FirstName = err; isValid = false; } }
//         if (!formData.LastName.trim()) { errors.LastName = 'Required'; isValid = false; }
//         else { const err = validateField('LastName', formData.LastName); if (err) { errors.LastName = err; isValid = false; } }
//         if (!formData.Email.trim()) { errors.Email = 'Required'; isValid = false; }
//         else { const err = validateField('Email', formData.Email); if (err) { errors.Email = err; isValid = false; } }
//         if (formData.Phone) { const err = validateField('Phone', formData.Phone); if (err) { errors.Phone = err; isValid = false; } }
//         if (formData.Address) { const err = validateField('Address', formData.Address); if (err) { errors.Address = err; isValid = false; } }
//         break;

//       case 1: // Employment
//         if (!formData.DepartmentID) { errors.DepartmentID = 'Required'; isValid = false; }
//         if (!formData.DesignationID) { errors.DesignationID = 'Required'; isValid = false; }
//         if (!formData.DateOfJoining) { errors.DateOfJoining = 'Required'; isValid = false; }
//         if (formData.EmploymentType === 'contract-based' && !formData.ContractCompany) {
//           errors.ContractCompany = 'Required';
//           isValid = false;
//         }
//         break;

//       case 2: // Pay & Work
//         if ((formData.EmploymentType === 'Monthly' || formData.EmploymentType === 'contract-based') && !formData.BasicSalary) {
//           errors.BasicSalary = 'Required';
//           isValid = false;
//         }
//         if (formData.EmploymentType === 'Hourly' && !formData.HourlyRate) {
//           errors.HourlyRate = 'Required';
//           isValid = false;
//         }
//         const taxFields = ['PAN', 'AadharNumber', 'PFNumber', 'UAN', 'ESINumber', 'WorkStation', 'LineNumber'];
//         taxFields.forEach(field => {
//           if (formData[field]) {
//             const err = validateField(field, formData[field]);
//             if (err) { errors[field] = err; isValid = false; }
//           }
//         });
//         break;

//       case 3: // Bank & Emergency
//         const bankFields = ['BankAccountNumber', 'BankAccountHolderName', 'BankName', 'BankBranch', 'BankIfscCode'];
//         const hasAnyBank = bankFields.some(f => formData[f]);
//         if (hasAnyBank) {
//           bankFields.forEach(field => {
//             if (!formData[field]) {
//               errors[field] = 'Required when providing bank details';
//               isValid = false;
//             } else {
//               const err = validateField(field, formData[field]);
//               if (err) { errors[field] = err; isValid = false; }
//             }
//           });
//         }
//         const emergencyFields = ['EmergencyContactName', 'EmergencyContactRelationship', 'EmergencyContactPhone', 'EmergencyContactAddress', 'EmergencyContactPIN'];
//         const hasAnyEmergency = emergencyFields.some(f => formData[f]);
//         if (hasAnyEmergency) {
//           emergencyFields.forEach(field => {
//             if (!formData[field]) {
//               errors[field] = 'Required when providing emergency contact';
//               isValid = false;
//             } else {
//               const err = validateField(field, formData[field]);
//               if (err) { errors[field] = err; isValid = false; }
//             }
//           });
//         }
//         break;

//       default:
//         return true;
//     }

//     setFieldErrors(errors);
//     if (!isValid) setSubmitError('Please fix the errors in this section');
//     return isValid;
//   };

//   const handleNext = () => {
//     if (validateStep(activeStep)) {
//       setSubmitError('');
//       setActiveStep(prev => prev + 1);
//     }
//   };

//   const handleBack = () => {
//     setSubmitError('');
//     setActiveStep(prev => prev - 1);
//   };

//   // Submit (Create or Update)
//   const handleSubmit = async () => {
//     if (!validateStep(3)) return;
//     setLoading(true);
//     setSubmitError('');
//     try {
//       const token = localStorage.getItem('token');
//       const payload = {
//         FirstName: formData.FirstName,
//         LastName: formData.LastName,
//         Gender: formData.Gender,
//         DateOfBirth: formData.DateOfBirth || undefined,
//         Email: formData.Email,
//         Phone: formData.Phone || undefined,
//         Address: formData.Address || undefined,
//         DepartmentID: formData.DepartmentID,
//         DesignationID: formData.DesignationID,
//         DateOfJoining: formData.DateOfJoining,
//         EmploymentType: formData.EmploymentType,
//         PayStructureType: formData.PayStructureType,
//         ContractCompany: formData.ContractCompany || undefined,
//         BasicSalary: (formData.EmploymentType === 'Monthly' || formData.EmploymentType === 'contract-based') ? Number(formData.BasicSalary || 0) : 0,
//         HourlyRate: formData.EmploymentType === 'Hourly' ? Number(formData.HourlyRate || 0) : 0,
//         OvertimeRateMultiplier: Number(formData.OvertimeRateMultiplier || 1.5),
//         SkillLevel: formData.SkillLevel || undefined,
//         WorkStation: formData.WorkStation || undefined,
//         LineNumber: formData.LineNumber || undefined,
//         PAN: formData.PAN || undefined,
//         AadharNumber: formData.AadharNumber || undefined,
//         PFNumber: formData.PFNumber || undefined,
//         UAN: formData.UAN || undefined,
//         ESINumber: formData.ESINumber || undefined,
//         EmploymentStatus: 'active'
//       };
//       const bankFields = ['BankAccountNumber', 'BankAccountHolderName', 'BankName', 'BankBranch', 'BankIfscCode'];
//       const hasAnyBank = bankFields.some(f => formData[f]);
//       if (hasAnyBank) {
//         payload.BankDetails = {
//           accountNumber: formData.BankAccountNumber,
//           accountHolderName: formData.BankAccountHolderName,
//           bankName: formData.BankName,
//           branch: formData.BankBranch,
//           ifscCode: formData.BankIfscCode,
//           accountType: formData.BankAccountType
//         };
//       }
//       const emergencyFields = ['EmergencyContactName', 'EmergencyContactRelationship', 'EmergencyContactPhone', 'EmergencyContactAddress', 'EmergencyContactPIN'];
//       const hasAnyEmergency = emergencyFields.some(f => formData[f]);
//       if (hasAnyEmergency) {
//         payload.EmergencyContact = {
//           name: formData.EmergencyContactName,
//           relationship: formData.EmergencyContactRelationship,
//           phone: formData.EmergencyContactPhone,
//           address: formData.EmergencyContactAddress,
//           pinCode: formData.EmergencyContactPIN
//         };
//       }
//       Object.keys(payload).forEach(key => payload[key] === undefined && delete payload[key]);

//       let response;
//       if (isEdit && initialData?._id) {
//         // Update existing employee
//         response = await axios.put(`${BASE_URL}/api/employees/${initialData._id}`, payload, {
//           headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
//         });
//       } else {
//         // Create new employee
//         response = await axios.post(`${BASE_URL}/api/employees`, payload, {
//           headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
//         });
//       }
//       if (response.data.success) {
//         if (isEdit && initialData?._id) {
//           if (onUpdate) onUpdate(response.data.data);
//         } else {
//           if (onSave) onSave(response.data.data);
//         }
//       } else {
//         setSubmitError(response.data.message || 'Operation failed');
//       }
//     } catch (err) {
//       console.error('Error saving employee:', err);
//       setSubmitError(err.response?.data?.message || 'An error occurred');
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Styles
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
//             <Paper sx={{ p: 2, bgcolor: '#f9fafb', borderRadius: 2, border: `1px solid ${COLORS.border}` }}>
//               <Typography sx={{ fontSize: '0.9rem', fontWeight: 600, color: COLORS.primary, mb: 1.5 }}>
//                 Personal Information
//               </Typography>
//               <Grid container spacing={1.5}>
//                 <Grid item xs={12} sm={6}>
//                   <Box><Typography sx={labelStyle}>FIRST NAME <span style={{ color: '#EF4444' }}>*</span></Typography>
//                     <TextField fullWidth size="small" name="FirstName" placeholder="e.g., John" value={formData.FirstName} onChange={handleChange} onBlur={handleBlur} error={!!fieldErrors.FirstName} helperText={fieldErrors.FirstName} sx={inputStyle} /></Box>
//                 </Grid>
//                 <Grid item xs={12} sm={6}>
//                   <Box><Typography sx={labelStyle}>LAST NAME <span style={{ color: '#EF4444' }}>*</span></Typography>
//                     <TextField fullWidth size="small" name="LastName" placeholder="e.g., Doe" value={formData.LastName} onChange={handleChange} onBlur={handleBlur} error={!!fieldErrors.LastName} helperText={fieldErrors.LastName} sx={inputStyle} /></Box>
//                 </Grid>
//                 <Grid item xs={12} sm={6}>
//                   <Box><Typography sx={labelStyle}>GENDER</Typography>
//                     <TextField select fullWidth size="small" name="Gender" value={formData.Gender} onChange={handleChange} sx={inputStyle}>
//                       {genderOptions.map(o => <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>)}
//                     </TextField></Box>
//                 </Grid>
//                 <Grid item xs={12} sm={6}>
//                   <Box><Typography sx={labelStyle}>DATE OF BIRTH</Typography>
//                     <TextField fullWidth size="small" name="DateOfBirth" type="date" value={formData.DateOfBirth} onChange={handleChange} InputLabelProps={{ shrink: true }} sx={inputStyle} /></Box>
//                 </Grid>
//                 <Grid item xs={12} sm={6}>
//                   <Box><Typography sx={labelStyle}>EMAIL <span style={{ color: '#EF4444' }}>*</span></Typography>
//                     <TextField fullWidth size="small" name="Email" placeholder="john.doe@company.com" value={formData.Email} onChange={handleChange} onBlur={handleBlur} error={!!fieldErrors.Email} helperText={fieldErrors.Email} sx={inputStyle} />
//                     <Typography sx={{ fontSize: '0.65rem', color: COLORS.text.tertiary }}>e.g., john.doe@company.com</Typography></Box>
//                 </Grid>
//                 <Grid item xs={12} sm={6}>
//                   <Box><Typography sx={labelStyle}>PHONE</Typography>
//                     <TextField fullWidth size="small" name="Phone" placeholder="9876543210" value={formData.Phone} onChange={handleChange} onBlur={handleBlur} error={!!fieldErrors.Phone} helperText={fieldErrors.Phone} inputProps={{ maxLength: 10 }} sx={inputStyle} />
//                     <Typography sx={{ fontSize: '0.65rem', color: COLORS.text.tertiary }}>10-digit number starting with 6-9</Typography></Box>
//                 </Grid>
//                 <Grid item xs={12}>
//                   <Box><Typography sx={labelStyle}>ADDRESS</Typography>
//                     <TextField fullWidth size="small" name="Address" multiline rows={2} placeholder="Enter complete address" value={formData.Address} onChange={handleChange} onBlur={handleBlur} error={!!fieldErrors.Address} helperText={fieldErrors.Address} sx={inputStyle} /></Box>
//                 </Grid>
//               </Grid>
//             </Paper>
//           </Stack>
//         );

//       case 1:
//         return (
//           <Stack spacing={2}>
//             <Paper sx={{ p: 2, bgcolor: '#f9fafb', borderRadius: 2, border: `1px solid ${COLORS.border}` }}>
//               <Typography sx={{ fontSize: '0.9rem', fontWeight: 600, color: COLORS.primary, mb: 1.5 }}>
//                 Employment Details
//               </Typography>
//               <Grid container spacing={1.5}>
//                 <Grid item xs={12} sm={6}>
//                   <Box><Typography sx={labelStyle}>DEPARTMENT <span style={{ color: '#EF4444' }}>*</span></Typography>
//                     <Autocomplete
//                       options={localDepartments}
//                       getOptionLabel={(opt) => opt?.DepartmentName || ''}
//                       value={localDepartments.find(d => d._id === formData.DepartmentID) || null}
//                       onChange={(e, v) => handleAutocompleteChange('DepartmentID', v)}
//                       loading={loadingData}
//                       renderInput={(params) => <TextField {...params} size="small" placeholder="Select department" error={!!fieldErrors.DepartmentID} helperText={fieldErrors.DepartmentID} sx={inputStyle} />}
//                     /></Box>
//                 </Grid>
//                 <Grid item xs={12} sm={6}>
//                   <Box><Typography sx={labelStyle}>DESIGNATION <span style={{ color: '#EF4444' }}>*</span></Typography>
//                     <Autocomplete
//                       options={localDesignations}
//                       getOptionLabel={(opt) => opt?.DesignationName || ''}
//                       value={localDesignations.find(d => d._id === formData.DesignationID) || null}
//                       onChange={(e, v) => handleAutocompleteChange('DesignationID', v)}
//                       loading={loadingData}
//                       renderInput={(params) => <TextField {...params} size="small" placeholder="Select designation" error={!!fieldErrors.DesignationID} helperText={fieldErrors.DesignationID} sx={inputStyle} />}
//                     /></Box>
//                 </Grid>
//                 <Grid item xs={12} sm={6}>
//                   <Box><Typography sx={labelStyle}>DATE OF JOINING <span style={{ color: '#EF4444' }}>*</span></Typography>
//                     <TextField fullWidth size="small" name="DateOfJoining" type="date" value={formData.DateOfJoining} onChange={handleChange} error={!!fieldErrors.DateOfJoining} helperText={fieldErrors.DateOfJoining} InputLabelProps={{ shrink: true }} sx={inputStyle} /></Box>
//                 </Grid>
//                 <Grid item xs={12} sm={6}>
//                   <Box><Typography sx={labelStyle}>EMPLOYMENT TYPE <span style={{ color: '#EF4444' }}>*</span></Typography>
//                     <TextField select fullWidth size="small" name="EmploymentType" value={formData.EmploymentType} onChange={handleEmploymentTypeChange} sx={inputStyle}>
//                       {employmentTypeOptions.map(o => <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>)}
//                     </TextField></Box>
//                 </Grid>
//                 {formData.EmploymentType === 'contract-based' && (
//                   <Grid item xs={12} sm={6}>
//                     <Box><Typography sx={labelStyle}>CONTRACT COMPANY <span style={{ color: '#EF4444' }}>*</span></Typography>
//                       <TextField select fullWidth size="small" name="ContractCompany" value={formData.ContractCompany} onChange={handleChange} error={!!fieldErrors.ContractCompany} helperText={fieldErrors.ContractCompany} sx={inputStyle}>
//                         <MenuItem value="">Select</MenuItem>
//                         {contractCompanyOptions.map(o => <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>)}
//                       </TextField></Box>
//                   </Grid>
//                 )}
//               </Grid>
//             </Paper>
//           </Stack>
//         );

//       case 2:
//         return (
//           <Stack spacing={2}>
//             <Paper sx={{ p: 2, bgcolor: '#f9fafb', borderRadius: 2, border: `1px solid ${COLORS.border}` }}>
//               <Typography sx={{ fontSize: '0.9rem', fontWeight: 600, color: COLORS.primary, mb: 1.5 }}>
//                 Pay & Work Details
//               </Typography>
//               <Grid container spacing={1.5}>
//                 <Grid item xs={12} sm={6}>
//                   <Box><Typography sx={labelStyle}>PAY STRUCTURE TYPE</Typography>
//                     <TextField select fullWidth size="small" name="PayStructureType" value={formData.PayStructureType} onChange={handleChange} sx={inputStyle}>
//                       {payStructureOptions.map(o => <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>)}
//                     </TextField></Box>
//                 </Grid>
//                 {(formData.EmploymentType === 'Monthly' || formData.EmploymentType === 'contract-based') && (
//                   <Grid item xs={12} sm={6}>
//                     <Box><Typography sx={labelStyle}>BASIC SALARY <span style={{ color: '#EF4444' }}>*</span></Typography>
//                       <TextField fullWidth size="small" name="BasicSalary" type="number" placeholder="e.g., 25000" value={formData.BasicSalary} onChange={handleChange} error={!!fieldErrors.BasicSalary} helperText={fieldErrors.BasicSalary} inputProps={{ min: 0 }} sx={inputStyle} /></Box>
//                   </Grid>
//                 )}
//                 {formData.EmploymentType === 'Hourly' && (
//                   <Grid item xs={12} sm={6}>
//                     <Box><Typography sx={labelStyle}>HOURLY RATE <span style={{ color: '#EF4444' }}>*</span></Typography>
//                       <TextField fullWidth size="small" name="HourlyRate" type="number" placeholder="e.g., 150" value={formData.HourlyRate} onChange={handleChange} error={!!fieldErrors.HourlyRate} helperText={fieldErrors.HourlyRate} inputProps={{ min: 0, step: 0.01 }} sx={inputStyle} /></Box>
//                   </Grid>
//                 )}
//                 {formData.EmploymentType !== 'PieceRate' && (
//                   <>
//                     <Grid item xs={12} sm={6}>
//                       <Box><Typography sx={labelStyle}>OVERTIME MULTIPLIER</Typography>
//                         <TextField fullWidth size="small" name="OvertimeRateMultiplier" type="number" value={formData.OvertimeRateMultiplier} onChange={handleChange} inputProps={{ step: 0.25, min: 1, max: 3 }} sx={inputStyle} /></Box>
//                     </Grid>
//                     <Grid item xs={12} sm={6}>
//                       <Box><Typography sx={labelStyle}>SKILL LEVEL</Typography>
//                         <TextField select fullWidth size="small" name="SkillLevel" value={formData.SkillLevel} onChange={handleChange} sx={inputStyle}>
//                           <MenuItem value="">None</MenuItem>
//                           {skillLevelOptions.map(o => <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>)}
//                         </TextField></Box>
//                     </Grid>
//                   </>
//                 )}
//                 <Grid item xs={12} sm={6}>
//                   <Box><Typography sx={labelStyle}>WORK STATION</Typography>
//                     <TextField fullWidth size="small" name="WorkStation" placeholder="e.g., Station A" value={formData.WorkStation} onChange={handleChange} onBlur={handleBlur} error={!!fieldErrors.WorkStation} helperText={fieldErrors.WorkStation} sx={inputStyle} />
//                     <Typography sx={{ fontSize: '0.65rem', color: COLORS.text.tertiary }}>Letters, numbers, spaces, hyphens</Typography></Box>
//                 </Grid>
//                 <Grid item xs={12} sm={6}>
//                   <Box><Typography sx={labelStyle}>LINE NUMBER</Typography>
//                     <TextField fullWidth size="small" name="LineNumber" placeholder="e.g., Line 1" value={formData.LineNumber} onChange={handleChange} onBlur={handleBlur} error={!!fieldErrors.LineNumber} helperText={fieldErrors.LineNumber} sx={inputStyle} />
//                     <Typography sx={{ fontSize: '0.65rem', color: COLORS.text.tertiary }}>Letters, numbers, spaces, hyphens</Typography></Box>
//                 </Grid>
//                 <Grid item xs={12}><Typography sx={{ fontWeight: 600, color: COLORS.primary, fontSize: '0.8rem', mt: 1 }}>Tax & Identification (Optional)</Typography></Grid>
//                 <Grid item xs={12} sm={6}>
//                   <Box><Typography sx={labelStyle}>PAN</Typography>
//                     <TextField fullWidth size="small" name="PAN" placeholder="ABCDE1234F" value={formData.PAN} onChange={handleChange} onBlur={handleBlur} error={!!fieldErrors.PAN} helperText={fieldErrors.PAN} inputProps={{ maxLength: 10 }} sx={inputStyle} />
//                     <Typography sx={{ fontSize: '0.65rem', color: COLORS.text.tertiary }}>5 letters + 4 numbers + 1 letter</Typography></Box>
//                 </Grid>
//                 <Grid item xs={12} sm={6}>
//                   <Box><Typography sx={labelStyle}>AADHAR NUMBER</Typography>
//                     <TextField fullWidth size="small" name="AadharNumber" placeholder="123456789012" value={formData.AadharNumber} onChange={handleChange} onBlur={handleBlur} error={!!fieldErrors.AadharNumber} helperText={fieldErrors.AadharNumber} inputProps={{ maxLength: 12 }} sx={inputStyle} />
//                     <Typography sx={{ fontSize: '0.65rem', color: COLORS.text.tertiary }}>12 digits</Typography></Box>
//                 </Grid>
//                 <Grid item xs={12} sm={6}>
//                   <Box><Typography sx={labelStyle}>PF NUMBER</Typography>
//                     <TextField fullWidth size="small" name="PFNumber" placeholder="AB/12345/1234567" value={formData.PFNumber} onChange={handleChange} onBlur={handleBlur} error={!!fieldErrors.PFNumber} helperText={fieldErrors.PFNumber} sx={inputStyle} />
//                     <Typography sx={{ fontSize: '0.65rem', color: COLORS.text.tertiary }}>Format: XX/12345/1234567</Typography></Box>
//                 </Grid>
//                 <Grid item xs={12} sm={6}>
//                   <Box><Typography sx={labelStyle}>UAN</Typography>
//                     <TextField fullWidth size="small" name="UAN" placeholder="123456789012" value={formData.UAN} onChange={handleChange} onBlur={handleBlur} error={!!fieldErrors.UAN} helperText={fieldErrors.UAN} inputProps={{ maxLength: 12 }} sx={inputStyle} />
//                     <Typography sx={{ fontSize: '0.65rem', color: COLORS.text.tertiary }}>12 digits</Typography></Box>
//                 </Grid>
//                 <Grid item xs={12} sm={6}>
//                   <Box><Typography sx={labelStyle}>ESI NUMBER</Typography>
//                     <TextField fullWidth size="small" name="ESINumber" placeholder="12345678901234567" value={formData.ESINumber} onChange={handleChange} onBlur={handleBlur} error={!!fieldErrors.ESINumber} helperText={fieldErrors.ESINumber} inputProps={{ maxLength: 17 }} sx={inputStyle} />
//                     <Typography sx={{ fontSize: '0.65rem', color: COLORS.text.tertiary }}>17 digits</Typography></Box>
//                 </Grid>
//               </Grid>
//             </Paper>
//           </Stack>
//         );

//       case 3:
//         return (
//           <Stack spacing={2}>
//             <Paper sx={{ p: 2, bgcolor: '#f9fafb', borderRadius: 2, border: `1px solid ${COLORS.border}` }}>
//               <Typography sx={{ fontSize: '0.9rem', fontWeight: 600, color: COLORS.primary, mb: 1.5 }}>
//                 Bank Details <span style={{ fontSize: '0.7rem', fontWeight: 'normal', color: COLORS.text.tertiary }}>(All or None)</span>
//               </Typography>
//               <Grid container spacing={1.5}>
//                 <Grid item xs={12} sm={6}>
//                   <Box><Typography sx={labelStyle}>ACCOUNT NUMBER</Typography>
//                     <TextField fullWidth size="small" name="BankAccountNumber" placeholder="123456789" value={formData.BankAccountNumber} onChange={handleChange} onBlur={handleBlur} error={!!fieldErrors.BankAccountNumber} helperText={fieldErrors.BankAccountNumber} inputProps={{ maxLength: 18 }} sx={inputStyle} />
//                     <Typography sx={{ fontSize: '0.65rem', color: COLORS.text.tertiary }}>9-18 digits</Typography></Box>
//                 </Grid>
//                 <Grid item xs={12} sm={6}>
//                   <Box><Typography sx={labelStyle}>ACCOUNT HOLDER NAME</Typography>
//                     <TextField fullWidth size="small" name="BankAccountHolderName" placeholder="John Doe" value={formData.BankAccountHolderName} onChange={handleChange} onBlur={handleBlur} error={!!fieldErrors.BankAccountHolderName} helperText={fieldErrors.BankAccountHolderName} sx={inputStyle} /></Box>
//                 </Grid>
//                 <Grid item xs={12} sm={6}>
//                   <Box><Typography sx={labelStyle}>BANK NAME</Typography>
//                     <TextField fullWidth size="small" name="BankName" placeholder="State Bank of India" value={formData.BankName} onChange={handleChange} onBlur={handleBlur} error={!!fieldErrors.BankName} helperText={fieldErrors.BankName} sx={inputStyle} /></Box>
//                 </Grid>
//                 <Grid item xs={12} sm={6}>
//                   <Box><Typography sx={labelStyle}>BRANCH</Typography>
//                     <TextField fullWidth size="small" name="BankBranch" placeholder="Main Branch" value={formData.BankBranch} onChange={handleChange} onBlur={handleBlur} error={!!fieldErrors.BankBranch} helperText={fieldErrors.BankBranch} sx={inputStyle} /></Box>
//                 </Grid>
//                 <Grid item xs={12} sm={6}>
//                   <Box><Typography sx={labelStyle}>IFSC CODE</Typography>
//                     <TextField fullWidth size="small" name="BankIfscCode" placeholder="SBIN0123456" value={formData.BankIfscCode} onChange={handleChange} onBlur={handleBlur} error={!!fieldErrors.BankIfscCode} helperText={fieldErrors.BankIfscCode} inputProps={{ maxLength: 11 }} sx={inputStyle} />
//                     <Typography sx={{ fontSize: '0.65rem', color: COLORS.text.tertiary }}>4 letters + 0 + 6 alphanumeric</Typography></Box>
//                 </Grid>
//                 <Grid item xs={12} sm={6}>
//                   <Box><Typography sx={labelStyle}>ACCOUNT TYPE</Typography>
//                     <TextField select fullWidth size="small" name="BankAccountType" value={formData.BankAccountType} onChange={handleChange} sx={inputStyle}>
//                       {accountTypeOptions.map(o => <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>)}
//                     </TextField></Box>
//                 </Grid>
//               </Grid>
//             </Paper>

//             <Paper sx={{ p: 2, bgcolor: '#f9fafb', borderRadius: 2, border: `1px solid ${COLORS.border}` }}>
//               <Typography sx={{ fontSize: '0.9rem', fontWeight: 600, color: COLORS.primary, mb: 1.5 }}>
//                 Emergency Contact <span style={{ fontSize: '0.7rem', fontWeight: 'normal', color: COLORS.text.tertiary }}>(All or None)</span>
//               </Typography>
//               <Grid container spacing={1.5}>
//                 <Grid item xs={12} sm={6}>
//                   <Box><Typography sx={labelStyle}>CONTACT NAME</Typography>
//                     <TextField fullWidth size="small" name="EmergencyContactName" placeholder="Jane Doe" value={formData.EmergencyContactName} onChange={handleChange} onBlur={handleBlur} error={!!fieldErrors.EmergencyContactName} helperText={fieldErrors.EmergencyContactName} sx={inputStyle} /></Box>
//                 </Grid>
//                 <Grid item xs={12} sm={6}>
//                   <Box><Typography sx={labelStyle}>RELATIONSHIP</Typography>
//                     <TextField fullWidth size="small" name="EmergencyContactRelationship" placeholder="Spouse" value={formData.EmergencyContactRelationship} onChange={handleChange} onBlur={handleBlur} error={!!fieldErrors.EmergencyContactRelationship} helperText={fieldErrors.EmergencyContactRelationship} sx={inputStyle} /></Box>
//                 </Grid>
//                 <Grid item xs={12} sm={6}>
//                   <Box><Typography sx={labelStyle}>PHONE</Typography>
//                     <TextField fullWidth size="small" name="EmergencyContactPhone" placeholder="9876543210" value={formData.EmergencyContactPhone} onChange={handleChange} onBlur={handleBlur} error={!!fieldErrors.EmergencyContactPhone} helperText={fieldErrors.EmergencyContactPhone} inputProps={{ maxLength: 10 }} sx={inputStyle} /></Box>
//                 </Grid>
//                 <Grid item xs={12} sm={6}>
//                   <Box><Typography sx={labelStyle}>PIN CODE</Typography>
//                     <TextField fullWidth size="small" name="EmergencyContactPIN" placeholder="400001" value={formData.EmergencyContactPIN} onChange={handleChange} onBlur={handleBlur} error={!!fieldErrors.EmergencyContactPIN} helperText={fieldErrors.EmergencyContactPIN} inputProps={{ maxLength: 6 }} sx={inputStyle} /></Box>
//                 </Grid>
//                 <Grid item xs={12}>
//                   <Box><Typography sx={labelStyle}>ADDRESS</Typography>
//                     <TextField fullWidth size="small" name="EmergencyContactAddress" multiline rows={2} placeholder="Enter complete address" value={formData.EmergencyContactAddress} onChange={handleChange} onBlur={handleBlur} error={!!fieldErrors.EmergencyContactAddress} helperText={fieldErrors.EmergencyContactAddress} sx={inputStyle} /></Box>
//                 </Grid>
//               </Grid>
//             </Paper>
//           </Stack>
//         );

//       default:
//         return null;
//     }
//   };

//   return (
//     <Paper sx={{ mt: 2, p: 2, bgcolor: '#ffffff', border: `1px solid ${COLORS.border}`, borderRadius: 2, width: '100%', boxSizing: 'border-box' }}>
//       <Typography sx={{ fontSize: '1rem', fontWeight: 700, color: COLORS.text.primary, mb: 2 }}>
//         {isEdit ? 'Edit Employee' : 'Add New Employee'}
//       </Typography>

//       <Stepper activeStep={activeStep} alternativeLabel connector={<ColorConnector />} sx={{ mb: 2 }}>
//         {employeeSteps.map((label) => (
//           <Step key={label}>
//             <StepLabel><Typography fontSize="0.75rem">{label}</Typography></StepLabel>
//           </Step>
//         ))}
//       </Stepper>

//       {submitError && (
//         <Alert severity="error" sx={{ mb: 2, borderRadius: 1.5 }} onClose={() => setSubmitError('')}>
//           {submitError}
//         </Alert>
//       )}

//       {renderStepContent(activeStep)}

//       <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
//         <Button
//           size="small"
//           onClick={onClose}
//           disabled={loading}
//           sx={{ fontSize: '0.7rem', textTransform: 'none' }}
//         >
//           Cancel
//         </Button>
//         <Box sx={{ display: 'flex', gap: 1 }}>
//           {activeStep > 0 && (
//             <Button
//               size="small"
//               onClick={handleBack}
//               disabled={loading}
//               startIcon={<NavigateBeforeIcon sx={{ fontSize: '1rem' }} />}
//               sx={{ fontSize: '0.7rem', textTransform: 'none' }}
//             >
//               Back
//             </Button>
//           )}
//           {activeStep === employeeSteps.length - 1 ? (
//             <Button
//               variant="contained"
//               size="small"
//               onClick={handleSubmit}
//               disabled={loading}
//               startIcon={loading ? null : (isEdit ? <EditIcon sx={{ fontSize: '1rem' }} /> : <AddIcon sx={{ fontSize: '1rem' }} />)}
//               sx={{
//                 fontSize: '0.7rem',
//                 textTransform: 'none',
//                 bgcolor: COLORS.primary,
//                 '&:hover': { bgcolor: COLORS.primaryDark }
//               }}
//             >
//               {loading ? <CircularProgress size={16} sx={{ color: COLORS.text.light }} /> : (isEdit ? 'Update Employee' : 'Add Employee')}
//             </Button>
//           ) : (
//             <Button
//               variant="contained"
//               size="small"
//               onClick={handleNext}
//               disabled={loading}
//               endIcon={<NavigateNextIcon sx={{ fontSize: '1rem' }} />}
//               sx={{
//                 fontSize: '0.7rem',
//                 textTransform: 'none',
//                 bgcolor: COLORS.primary,
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

// // ==================== Main AddMRV Component ====================
// const AddMRV = ({ open, onClose, onAdd }) => {
//   const [activeStep, setActiveStep] = useState(0);
//   const [loading, setLoading] = useState(false);
//   const [fetching, setFetching] = useState(false);
//   const [errors, setErrors] = useState({});
//   const [mivError, setMivError] = useState('');
//   const [stockError, setStockError] = useState('');

//   // Inline employee form state
//   const [showInlineEmployeeForm, setShowInlineEmployeeForm] = useState(false);
//   const [inlineEmployeeType, setInlineEmployeeType] = useState(''); // 'returned_by' or 'received_by'
//   const [editingEmployeeData, setEditingEmployeeData] = useState(null); // for pre-fill
//   const [isEditing, setIsEditing] = useState(false);

//   const [mivList, setMivList] = useState([]);
//   const [employees, setEmployees] = useState([]);
//   const [warehouses, setWarehouses] = useState([]);
//   const [items, setItems] = useState([]);
//   const [departments, setDepartments] = useState([]);
//   const [designations, setDesignations] = useState([]);

//   const [selectedMIV, setSelectedMIV] = useState(null);
//   const [mivItems, setMivItems] = useState([]);

//   const [formData, setFormData] = useState({
//     miv_id: '',
//     returned_by: '',
//     received_by: '',
//     condition: 'Good',
//     remarks: '',
//     items: [{
//       item_id: '',
//       part_no: '',
//       returned_qty: '',
//       warehouse_id: '',
//       bin_id: '',
//       unit: '',
//       unit_cost: 0,
//       max_returnable_qty: 0
//     }]
//   });

//   useEffect(() => {
//     if (open) {
//       fetchMIVList();
//       fetchEmployees();
//       fetchWarehouses();
//       fetchItems();
//       fetchDepartmentsAndDesignations();
//       resetForm();
//     }
//   }, [open]);

//   // Fetch all MIVs (no status filter to ensure data)
//   const fetchMIVList = async () => {
//     try {
//       setFetching(true);
//       const token = localStorage.getItem('token');
//       const res = await axios.get(`${BASE_URL}/api/miv?limit=1000`, {
//         headers: { Authorization: `Bearer ${token}` }
//       });
//       if (res.data.success) {
//         setMivList(res.data.data || []);
//         console.log('MIVs loaded:', res.data.data);
//       } else {
//         console.warn('MIV API returned success: false', res.data);
//       }
//     } catch (err) {
//       console.error('Error fetching MIVs:', err);
//       setMivError('Failed to load MIVs – check console');
//     } finally {
//       setFetching(false);
//     }
//   };

//   const fetchEmployees = async () => {
//     try {
//       const token = localStorage.getItem('token');
//       const res = await axios.get(`${BASE_URL}/api/employees?limit=1000`, {
//         headers: { Authorization: `Bearer ${token}` }
//       });
//       if (res.data.success) setEmployees(res.data.data || []);
//     } catch (err) {
//       console.error('Error fetching employees:', err);
//     }
//   };

//   const fetchDepartmentsAndDesignations = async () => {
//     try {
//       const token = localStorage.getItem('token');
//       const deptRes = await axios.get(`${BASE_URL}/api/departments`, {
//         headers: { Authorization: `Bearer ${token}` }
//       });
//       const desigRes = await axios.get(`${BASE_URL}/api/designations`, {
//         headers: { Authorization: `Bearer ${token}` }
//       });
//       if (deptRes.data.success) setDepartments(deptRes.data.data || []);
//       if (desigRes.data.success) setDesignations(desigRes.data.data || []);
//     } catch (err) {
//       console.error('Error fetching depts/desigs:', err);
//     }
//   };

//   const fetchWarehouses = async () => {
//     try {
//       const token = localStorage.getItem('token');
//       const res = await axios.get(`${BASE_URL}/api/warehouses?limit=1000`, {
//         headers: { Authorization: `Bearer ${token}` }
//       });
//       if (res.data.success) setWarehouses(res.data.data || []);
//     } catch (err) {
//       console.error('Error fetching warehouses:', err);
//     }
//   };

//   const fetchItems = async () => {
//     try {
//       setFetching(true);
//       const token = localStorage.getItem('token');
//       const res = await axios.get(`${BASE_URL}/api/items?limit=1000`, {
//         headers: { Authorization: `Bearer ${token}` }
//       });
//       if (res.data.success) setItems(res.data.data || []);
//     } catch (err) {
//       console.error('Error fetching items:', err);
//     } finally {
//       setFetching(false);
//     }
//   };

//   const fetchMIVDetails = async (mivId) => {
//     try {
//       setFetching(true);
//       const token = localStorage.getItem('token');
//       const res = await axios.get(`${BASE_URL}/api/miv/${mivId}`, {
//         headers: { Authorization: `Bearer ${token}` }
//       });
//       if (res.data.success) {
//         const mivData = res.data.data;
//         setSelectedMIV(mivData);
//         const returnItems = (mivData.items || []).map(item => ({
//           item_id: item.item_id?._id || item.item_id,
//           part_no: item.part_no,
//           item_description: item.item_description || item.description,
//           issued_qty: item.issued_qty,
//           returned_qty: '',
//           warehouse_id: item.warehouse_id?._id || item.warehouse_id,
//           bin_id: item.bin_id?._id || item.bin_id,
//           unit: item.unit,
//           unit_cost: item.unit_cost,
//           max_returnable_qty: item.issued_qty - (item.returned_qty || 0)
//         }));
//         setMivItems(returnItems);
//         setFormData(prev => ({
//           ...prev,
//           items: returnItems.map(item => ({
//             item_id: item.item_id,
//             part_no: item.part_no,
//             returned_qty: '',
//             warehouse_id: item.warehouse_id,
//             bin_id: item.bin_id,
//             unit: item.unit,
//             unit_cost: item.unit_cost,
//             max_returnable_qty: item.max_returnable_qty
//           }))
//         }));
//       }
//     } catch (err) {
//       console.error('Error fetching MIV details:', err);
//       setMivError('Failed to load MIV details');
//     } finally {
//       setFetching(false);
//     }
//   };

//   const resetForm = () => {
//     setFormData({
//       miv_id: '',
//       returned_by: '',
//       received_by: '',
//       condition: 'Good',
//       remarks: '',
//       items: [{
//         item_id: '',
//         part_no: '',
//         returned_qty: '',
//         warehouse_id: '',
//         bin_id: '',
//         unit: '',
//         unit_cost: 0,
//         max_returnable_qty: 0
//       }]
//     });
//     setSelectedMIV(null);
//     setMivItems([]);
//     setErrors({});
//     setMivError('');
//     setStockError('');
//     setActiveStep(0);
//     setShowInlineEmployeeForm(false);
//     setInlineEmployeeType('');
//     setEditingEmployeeData(null);
//     setIsEditing(false);
//   };

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData(prev => ({ ...prev, [name]: value }));
//     if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
//   };

//   const handleAutocompleteChange = (name, value) => {
//     if (name === 'miv_id' && value) {
//       setFormData(prev => ({ ...prev, miv_id: value._id }));
//       fetchMIVDetails(value._id);
//       setMivError('');
//     } else {
//       setFormData(prev => ({ ...prev, [name]: value?._id || '' }));
//       // If an employee is selected and the inline form is open, pre‑fill it for editing
//       if ((name === 'returned_by' || name === 'received_by') && value && showInlineEmployeeForm) {
//         // Find the full employee data from the list
//         const selectedEmployee = employees.find(emp => emp._id === value._id);
//         if (selectedEmployee) {
//           setEditingEmployeeData(selectedEmployee);
//           setIsEditing(true);
//         }
//       } else {
//         // If no employee selected or form closed, reset edit state
//         if (!value) {
//           setEditingEmployeeData(null);
//           setIsEditing(false);
//         }
//       }
//     }
//     if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
//   };

//   // Handler for inline employee save (create)
//   const handleInlineEmployeeSave = (newEmployee) => {
//     setEmployees(prev => [...prev, newEmployee]);
//     if (inlineEmployeeType === 'returned_by') {
//       setFormData(prev => ({ ...prev, returned_by: newEmployee._id }));
//     } else if (inlineEmployeeType === 'received_by') {
//       setFormData(prev => ({ ...prev, received_by: newEmployee._id }));
//     }
//     setShowInlineEmployeeForm(false);
//     setInlineEmployeeType('');
//     setEditingEmployeeData(null);
//     setIsEditing(false);
//   };

//   // Handler for inline employee update
//   const handleInlineEmployeeUpdate = (updatedEmployee) => {
//     setEmployees(prev => prev.map(emp => emp._id === updatedEmployee._id ? updatedEmployee : emp));
//     // If the updated employee is currently selected, update the selected ID
//     if (inlineEmployeeType === 'returned_by' && formData.returned_by === updatedEmployee._id) {
//       setFormData(prev => ({ ...prev, returned_by: updatedEmployee._id }));
//     } else if (inlineEmployeeType === 'received_by' && formData.received_by === updatedEmployee._id) {
//       setFormData(prev => ({ ...prev, received_by: updatedEmployee._id }));
//     }
//     setShowInlineEmployeeForm(false);
//     setInlineEmployeeType('');
//     setEditingEmployeeData(null);
//     setIsEditing(false);
//   };

//   const handleItemChange = (index, field, value) => {
//     const updated = [...formData.items];
//     const maxQty = updated[index].max_returnable_qty;
//     if (field === 'returned_qty') {
//       const qty = Number(value);
//       if (qty < 0) return;
//       if (qty > maxQty) {
//         setStockError(`Return quantity cannot exceed ${maxQty}`);
//         return;
//       }
//       setStockError('');
//     }
//     updated[index][field] = value;
//     setFormData(prev => ({ ...prev, items: updated }));
//     if (errors[`item_${index}_${field}`]) {
//       setErrors(prev => ({ ...prev, [`item_${index}_${field}`]: '' }));
//     }
//   };

//   const removeItem = (index) => {
//     const updated = formData.items.filter((_, i) => i !== index);
//     setFormData(prev => ({ ...prev, items: updated }));
//   };

//   const validateStep = (step) => {
//     const newErrors = {};
//     let isValid = true;
//     switch (step) {
//       case 0:
//         if (!formData.miv_id) { newErrors.miv_id = 'MIV is required'; isValid = false; }
//         if (!formData.returned_by) { newErrors.returned_by = 'Returned By is required'; isValid = false; }
//         if (!formData.received_by) { newErrors.received_by = 'Received By is required'; isValid = false; }
//         if (!formData.condition) { newErrors.condition = 'Condition is required'; isValid = false; }
//         break;
//       case 1:
//         formData.items.forEach((item, idx) => {
//           if (!item.returned_qty) {
//             newErrors[`item_${idx}_returned_qty`] = 'Return quantity is required';
//             isValid = false;
//           } else if (Number(item.returned_qty) <= 0) {
//             newErrors[`item_${idx}_returned_qty`] = 'Quantity must be greater than 0';
//             isValid = false;
//           }
//         });
//         break;
//       default:
//         return true;
//     }
//     setErrors(newErrors);
//     if (!isValid) setMivError('Please fix the errors in this section');
//     return isValid;
//   };

//   const handleNext = () => {
//     if (validateStep(activeStep)) {
//       setMivError('');
//       setActiveStep(prev => prev + 1);
//     }
//   };

//   const handleBack = () => {
//     setMivError('');
//     setActiveStep(prev => prev - 1);
//   };

//   const handleSubmit = async () => {
//     if (!validateStep(1)) return;
//     const itemsToReturn = formData.items.filter(item =>
//       item.returned_qty && Number(item.returned_qty) > 0
//     );
//     if (itemsToReturn.length === 0) {
//       setStockError('At least one item with return quantity is required');
//       return;
//     }
//     setLoading(true);
//     setStockError('');
//     try {
//       const token = localStorage.getItem('token');
//       const itemsPayload = itemsToReturn.map(item => ({
//         item_id: item.item_id,
//         part_no: item.part_no,
//         returned_qty: Number(item.returned_qty),
//         warehouse_id: item.warehouse_id,
//         bin_id: item.bin_id || ''
//       }));
//       const payload = {
//         miv_id: formData.miv_id,
//         returned_by: formData.returned_by,
//         received_by: formData.received_by,
//         condition: formData.condition,
//         items: itemsPayload,
//         remarks: formData.remarks || ''
//       };
//       const response = await axios.post(`${BASE_URL}/api/mrv`, payload, {
//         headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
//       });
//       if (response.data.success) {
//         if (onAdd) onAdd(response.data.data);
//         onClose();
//       } else {
//         setErrors(prev => ({ ...prev, submit: response.data.message || 'Failed to create MRV' }));
//       }
//     } catch (err) {
//       console.error('API Error:', err);
//       if (err.response) {
//         const errorMsg = err.response.data?.message || err.response.data?.error || 'Failed to create MRV';
//         if (errorMsg.toLowerCase().includes('insufficient') || errorMsg.toLowerCase().includes('exceeds')) {
//           setStockError(errorMsg);
//         } else {
//           setErrors(prev => ({ ...prev, submit: errorMsg }));
//         }
//       } else if (err.request) {
//         setErrors(prev => ({ ...prev, submit: 'No response from server.' }));
//       } else {
//         setErrors(prev => ({ ...prev, submit: err.message }));
//       }
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Display helpers
//   const getMIVDisplay = (miv) => {
//     if (!miv) return '';
//     return `${miv.miv_number} - ${miv.wo_number || ''}`;
//   };
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
//   const getWarehouseBins = (warehouseId) => {
//     const warehouse = warehouses.find(w => w._id === warehouseId);
//     return (warehouse && warehouse.bins && Array.isArray(warehouse.bins)) ? warehouse.bins : [];
//   };
//   const getBinDisplay = (bin) => {
//     if (!bin) return '';
//     const binCode = bin.bin_code || bin.bin_id || '';
//     const rack = bin.rack || '';
//     return rack ? `${binCode} - ${rack}` : binCode;
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
//                 <Grid size={{ xs: 12 }}>
//                   <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//                     <Typography sx={labelStyle}>MATERIAL ISSUE VOUCHER (MIV) <span style={{ color: '#EF4444' }}>*</span></Typography>
//                     <Autocomplete
//                       fullWidth
//                       options={mivList}
//                       getOptionLabel={getMIVDisplay}
//                       onChange={(e, val) => handleAutocompleteChange('miv_id', val)}
//                       loading={fetching}
//                       isOptionEqualToValue={(option, value) => option._id === value?._id}
//                       noOptionsText={fetching ? 'Loading...' : 'No MIVs found'}
//                       renderInput={(params) => (
//                         <TextField
//                           {...params}
//                           size="small"
//                           error={!!errors.miv_id}
//                           helperText={errors.miv_id}
//                           placeholder="Select MIV to return materials from"
//                           sx={inputStyle}
//                           InputProps={{
//                             ...params.InputProps,
//                             startAdornment: (
//                               <InputAdornment position="start">
//                                 <SearchIcon sx={{ fontSize: '0.9rem', color: COLORS.text.tertiary }} />
//                               </InputAdornment>
//                             ),
//                           }}
//                         />
//                       )}
//                     />
//                     <Typography sx={{ fontSize: '0.6rem', color: COLORS.text.tertiary }}>
//                       {mivList.length === 0 && !fetching ? 'No MIVs available – check API' : 'Select a posted/issued MIV'}
//                     </Typography>
//                   </Box>
//                 </Grid>

//                 {/* Returned By – full width */}
//                 <Grid size={{ xs: 12 }}>
//                   <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//                     <Typography sx={labelStyle}>RETURNED BY <span style={{ color: '#EF4444' }}>*</span></Typography>
//                     <Box sx={{ display: 'flex', gap: 1 }}>
//                       <Box sx={{ flex: 1 }}>
//                         <Autocomplete
//                           fullWidth
//                           options={employees}
//                           getOptionLabel={getPersonName}
//                           value={employees.find(emp => emp._id === formData.returned_by) || null}
//                           onChange={(e, val) => {
//                             handleAutocompleteChange('returned_by', val);
//                           }}
//                           isOptionEqualToValue={(option, value) => option._id === value?._id}
//                           disabled={showInlineEmployeeForm && inlineEmployeeType === 'returned_by' && !isEditing}
//                           renderInput={(params) => (
//                             <TextField
//                               {...params}
//                               size="small"
//                               error={!!errors.returned_by}
//                               helperText={errors.returned_by}
//                               placeholder="Select employee returning materials"
//                               sx={inputStyle}
//                             />
//                           )}
//                         />
//                       </Box>
//                       <Button
//                         variant="outlined"
//                         size="small"
//                         onClick={() => {
//                           if (showInlineEmployeeForm && inlineEmployeeType === 'returned_by') {
//                             // Close the form and reset edit state
//                             setShowInlineEmployeeForm(false);
//                             setInlineEmployeeType('');
//                             setEditingEmployeeData(null);
//                             setIsEditing(false);
//                           } else {
//                             setShowInlineEmployeeForm(true);
//                             setInlineEmployeeType('returned_by');
//                             // If there's already a selected employee, pre-fill for editing
//                             const selected = employees.find(emp => emp._id === formData.returned_by);
//                             if (selected) {
//                               setEditingEmployeeData(selected);
//                               setIsEditing(true);
//                             } else {
//                               setEditingEmployeeData(null);
//                               setIsEditing(false);
//                             }
//                           }
//                         }}
//                         startIcon={showInlineEmployeeForm && inlineEmployeeType === 'returned_by' ? <CloseIcon sx={{ fontSize: '0.875rem' }} /> : (isEditing && formData.returned_by ? <EditIcon sx={{ fontSize: '0.875rem' }} /> : <AddIcon sx={{ fontSize: '0.875rem' }} />)}
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
//                         {showInlineEmployeeForm && inlineEmployeeType === 'returned_by' ? 'Cancel' : (isEditing && formData.returned_by ? 'Edit' : 'Add New')}
//                       </Button>
//                     </Box>
//                     {showInlineEmployeeForm && inlineEmployeeType === 'returned_by' && (
//                       <InlineEmployeeForm
//                         onClose={() => { setShowInlineEmployeeForm(false); setInlineEmployeeType(''); setEditingEmployeeData(null); setIsEditing(false); }}
//                         onSave={handleInlineEmployeeSave}
//                         onUpdate={handleInlineEmployeeUpdate}
//                         initialData={editingEmployeeData}
//                         isEdit={isEditing}
//                         departments={departments}
//                         designations={designations}
//                         loadingData={fetching}
//                       />
//                     )}
//                   </Box>
//                 </Grid>

//                 {/* Received By – full width */}
//                 <Grid size={{ xs: 12 }}>
//                   <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//                     <Typography sx={labelStyle}>RECEIVED BY (STORE) <span style={{ color: '#EF4444' }}>*</span></Typography>
//                     <Box sx={{ display: 'flex', gap: 1 }}>
//                       <Box sx={{ flex: 1 }}>
//                         <Autocomplete
//                           fullWidth
//                           options={employees}
//                           getOptionLabel={getPersonName}
//                           value={employees.find(emp => emp._id === formData.received_by) || null}
//                           onChange={(e, val) => {
//                             handleAutocompleteChange('received_by', val);
//                           }}
//                           isOptionEqualToValue={(option, value) => option._id === value?._id}
//                           disabled={showInlineEmployeeForm && inlineEmployeeType === 'received_by' && !isEditing}
//                           renderInput={(params) => (
//                             <TextField
//                               {...params}
//                               size="small"
//                               error={!!errors.received_by}
//                               helperText={errors.received_by}
//                               placeholder="Select store employee receiving materials"
//                               sx={inputStyle}
//                             />
//                           )}
//                         />
//                       </Box>
//                       <Button
//                         variant="outlined"
//                         size="small"
//                         onClick={() => {
//                           if (showInlineEmployeeForm && inlineEmployeeType === 'received_by') {
//                             setShowInlineEmployeeForm(false);
//                             setInlineEmployeeType('');
//                             setEditingEmployeeData(null);
//                             setIsEditing(false);
//                           } else {
//                             setShowInlineEmployeeForm(true);
//                             setInlineEmployeeType('received_by');
//                             const selected = employees.find(emp => emp._id === formData.received_by);
//                             if (selected) {
//                               setEditingEmployeeData(selected);
//                               setIsEditing(true);
//                             } else {
//                               setEditingEmployeeData(null);
//                               setIsEditing(false);
//                             }
//                           }
//                         }}
//                         startIcon={showInlineEmployeeForm && inlineEmployeeType === 'received_by' ? <CloseIcon sx={{ fontSize: '0.875rem' }} /> : (isEditing && formData.received_by ? <EditIcon sx={{ fontSize: '0.875rem' }} /> : <AddIcon sx={{ fontSize: '0.875rem' }} />)}
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
//                         {showInlineEmployeeForm && inlineEmployeeType === 'received_by' ? 'Cancel' : (isEditing && formData.received_by ? 'Edit' : 'Add New')}
//                       </Button>
//                     </Box>
//                     {showInlineEmployeeForm && inlineEmployeeType === 'received_by' && (
//                       <InlineEmployeeForm
//                         onClose={() => { setShowInlineEmployeeForm(false); setInlineEmployeeType(''); setEditingEmployeeData(null); setIsEditing(false); }}
//                         onSave={handleInlineEmployeeSave}
//                         onUpdate={handleInlineEmployeeUpdate}
//                         initialData={editingEmployeeData}
//                         isEdit={isEditing}
//                         departments={departments}
//                         designations={designations}
//                         loadingData={fetching}
//                       />
//                     )}
//                   </Box>
//                 </Grid>

//                 <Grid size={{ xs: 12, md: 6 }}>
//                   <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//                     <Typography sx={labelStyle}>RETURN CONDITION <span style={{ color: '#EF4444' }}>*</span></Typography>
//                     <TextField
//                       select
//                       fullWidth
//                       size="small"
//                       name="condition"
//                       value={formData.condition}
//                       onChange={handleChange}
//                       error={!!errors.condition}
//                       helperText={errors.condition}
//                       sx={inputStyle}
//                     >
//                       {CONDITION_OPTIONS.map((option) => (
//                         <MenuItem key={option} value={option} sx={{ fontSize: '0.75rem' }}>
//                           {option}
//                         </MenuItem>
//                       ))}
//                     </TextField>
//                   </Box>
//                 </Grid>

//                 <Grid size={{ xs: 12 }}>
//                   <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//                     <Typography sx={labelStyle}>REMARKS</Typography>
//                     <TextField
//                       fullWidth
//                       multiline
//                       rows={2}
//                       name="remarks"
//                       value={formData.remarks}
//                       onChange={handleChange}
//                       size="small"
//                       placeholder="Enter reason for return or any additional remarks..."
//                       sx={inputStyle}
//                     />
//                   </Box>
//                 </Grid>
//               </Grid>
//             </Paper>
//             {selectedMIV && mivItems.length > 0 && (
//               <Paper sx={{ p: 2.5, bgcolor: COLORS.background.light, borderRadius: 2, border: `1px solid ${COLORS.border}` }}>
//                 <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color: COLORS.primary, mb: 2 }}>
//                   MIV Items Summary
//                 </Typography>
//                 <TableContainer>
//                   <Table size="small">
//                     <TableHead>
//                       <TableRow>
//                         <TableCell sx={{ fontSize: '0.7rem', fontWeight: 600 }}>Item</TableCell>
//                         <TableCell sx={{ fontSize: '0.7rem', fontWeight: 600 }}>Part No</TableCell>
//                         <TableCell sx={{ fontSize: '0.7rem', fontWeight: 600 }} align="right">Issued Qty</TableCell>
//                         <TableCell sx={{ fontSize: '0.7rem', fontWeight: 600 }} align="right">Returned Qty</TableCell>
//                         <TableCell sx={{ fontSize: '0.7rem', fontWeight: 600 }} align="right">Available to Return</TableCell>
//                         <TableCell sx={{ fontSize: '0.7rem', fontWeight: 600 }}>Unit</TableCell>
//                       </TableRow>
//                     </TableHead>
//                     <TableBody>
//                       {mivItems.map((item, idx) => (
//                         <TableRow key={idx}>
//                           <TableCell sx={{ fontSize: '0.7rem' }}>{item.item_description || '-'}</TableCell>
//                           <TableCell sx={{ fontSize: '0.7rem' }}>{item.part_no || '-'}</TableCell>
//                           <TableCell sx={{ fontSize: '0.7rem' }} align="right">{item.issued_qty || 0}</TableCell>
//                           <TableCell sx={{ fontSize: '0.7rem' }} align="right">{item.returned_qty || 0}</TableCell>
//                           <TableCell sx={{ fontSize: '0.7rem' }} align="right">
//                             <Typography sx={{ fontWeight: 600, color: COLORS.primary }}>
//                               {item.max_returnable_qty || 0}
//                             </Typography>
//                           </TableCell>
//                           <TableCell sx={{ fontSize: '0.7rem' }}>{item.unit || '-'}</TableCell>
//                         </TableRow>
//                       ))}
//                     </TableBody>
//                   </Table>
//                 </TableContainer>
//               </Paper>
//             )}
//           </Stack>
//         );

//       case 1:
//         return (
//           <Stack spacing={2}>
//             <Paper sx={{ p: 2.5, bgcolor: COLORS.background.white, borderRadius: 2, border: `1px solid ${COLORS.border}` }}>
//               <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color: COLORS.primary, mb: 2 }}>
//                 Return Items
//               </Typography>
//               <TableContainer component={Paper} sx={{ boxShadow: 'none', border: `1px solid ${COLORS.border}`, borderRadius: 2 }}>
//                 <Table stickyHeader size="small">
//                   <TableHead>
//                     <TableRow sx={{ bgcolor: COLORS.background.light }}>
//                       <TableCell sx={{ fontSize: '0.7rem', fontWeight: 600, minWidth: 180 }}>Item</TableCell>
//                       <TableCell sx={{ fontSize: '0.7rem', fontWeight: 600, minWidth: 100 }}>Part No</TableCell>
//                       <TableCell sx={{ fontSize: '0.7rem', fontWeight: 600, minWidth: 100 }} align="right">Unit</TableCell>
//                       <TableCell sx={{ fontSize: '0.7rem', fontWeight: 600, minWidth: 100 }} align="right">Max Returnable</TableCell>
//                       <TableCell sx={{ fontSize: '0.7rem', fontWeight: 600, minWidth: 120 }} align="right">Return Qty*</TableCell>
//                       <TableCell sx={{ fontSize: '0.7rem', fontWeight: 600, minWidth: 150 }}>Warehouse</TableCell>
//                       <TableCell sx={{ fontSize: '0.7rem', fontWeight: 600, minWidth: 120 }}>Bin</TableCell>
//                       <TableCell sx={{ width: 50 }}></TableCell>
//                     </TableRow>
//                   </TableHead>
//                   <TableBody>
//                     {formData.items.map((item, idx) => {
//                       const warehouseBins = getWarehouseBins(item.warehouse_id);
//                       const mivItem = mivItems.find(m => m.item_id === item.item_id);
//                       return (
//                         <TableRow key={idx}>
//                           <TableCell>
//                             <Typography sx={{ fontSize: '0.75rem', fontWeight: 500 }}>
//                               {mivItem?.item_description || '-'}
//                             </Typography>
//                           </TableCell>
//                           <TableCell>
//                             <Typography sx={{ fontSize: '0.75rem' }}>
//                               {item.part_no || mivItem?.part_no || '-'}
//                             </Typography>
//                           </TableCell>
//                           <TableCell align="right">
//                             <Typography sx={{ fontSize: '0.75rem' }}>
//                               {item.unit || mivItem?.unit || '-'}
//                             </Typography>
//                           </TableCell>
//                           <TableCell align="right">
//                             <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: COLORS.primary }}>
//                               {item.max_returnable_qty || 0}
//                             </Typography>
//                           </TableCell>
//                           <TableCell>
//                             <TextField
//                               type="number"
//                               size="small"
//                               value={item.returned_qty}
//                               onChange={(e) => handleItemChange(idx, 'returned_qty', e.target.value)}
//                               error={!!errors[`item_${idx}_returned_qty`]}
//                               helperText={errors[`item_${idx}_returned_qty`]}
//                               placeholder="Qty"
//                               fullWidth
//                               InputProps={{ inputProps: { min: 0, max: item.max_returnable_qty, step: 0.01 } }}
//                               sx={inputStyle}
//                             />
//                           </TableCell>
//                           <TableCell>
//                             <Autocomplete
//                               fullWidth
//                               options={warehouses}
//                               getOptionLabel={getWarehouseDisplay}
//                               value={warehouses.find(w => w._id === item.warehouse_id) || null}
//                               onChange={(e, val) => handleItemChange(idx, 'warehouse_id', val?._id || '')}
//                               disabled
//                               isOptionEqualToValue={(option, value) => option._id === value?._id}
//                               renderInput={(params) => (
//                                 <TextField
//                                   {...params}
//                                   size="small"
//                                   placeholder="Warehouse"
//                                   sx={inputStyle}
//                                 />
//                               )}
//                             />
//                           </TableCell>
//                           <TableCell>
//                             <Autocomplete
//                               fullWidth
//                               options={warehouseBins}
//                               getOptionLabel={getBinDisplay}
//                               value={warehouseBins.find(b => b._id === item.bin_id) || null}
//                               onChange={(e, val) => handleItemChange(idx, 'bin_id', val?._id || '')}
//                               disabled={!item.warehouse_id}
//                               isOptionEqualToValue={(option, value) => option._id === value?._id}
//                               renderInput={(params) => (
//                                 <TextField
//                                   {...params}
//                                   size="small"
//                                   placeholder={!item.warehouse_id ? "Select warehouse first" : "Select bin"}
//                                   sx={inputStyle}
//                                 />
//                               )}
//                             />
//                           </TableCell>
//                           <TableCell>
//                             {formData.items.length > 1 && (
//                               <Tooltip title="Remove Item">
//                                 <IconButton size="small" onClick={() => removeItem(idx)} sx={{ color: '#EF4444' }}>
//                                   <DeleteIcon fontSize="small" />
//                                 </IconButton>
//                               </Tooltip>
//                             )}
//                           </TableCell>
//                         </TableRow>
//                       );
//                     })}
//                   </TableBody>
//                 </Table>
//               </TableContainer>
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
//       onClose={onClose}
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
//         mb: 2,
//         bgcolor: COLORS.background.white,
//         display: 'flex',
//         flexDirection: 'column',
//         gap: 1
//       }}>
//         <Typography sx={{ fontSize: '1.2rem', fontWeight: 700, color: COLORS.text.primary }}>
//           Create Material Return Voucher (Draft)
//         </Typography>
//         <Stepper activeStep={activeStep} alternativeLabel connector={<ColorConnector />} sx={{ mb: 0.5, mt: 0.5 }}>
//           {steps.map((label) => (
//             <Step key={label}>
//               <StepLabel>
//                 <Typography fontWeight={500} fontSize="0.8rem" color={COLORS.text.secondary}>
//                   {label}
//                 </Typography>
//               </StepLabel>
//             </Step>
//           ))}
//         </Stepper>
//       </DialogTitle>

//       <DialogContent sx={{ p: 2.5, overflow: 'auto' }}>
//         {mivError && (
//           <Alert severity="warning" icon={<WarningIcon />} sx={{ mb: 2, borderRadius: 1.5 }} onClose={() => setMivError('')}>
//             {mivError}
//           </Alert>
//         )}
//         {stockError && (
//           <Alert severity="error" icon={<ErrorIcon />} sx={{ mb: 2, borderRadius: 1.5 }} onClose={() => setStockError('')}>
//             <strong>Invalid Return Quantity!</strong><br />
//             {stockError}
//           </Alert>
//         )}
//         {errors.submit && (
//           <Alert severity="error" sx={{ mb: 2, borderRadius: 1.5 }} onClose={() => setErrors(prev => ({ ...prev, submit: '' }))}>
//             {errors.submit}
//           </Alert>
//         )}
//         {renderStepContent(activeStep)}
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
//           onClick={onClose}
//           disabled={loading}
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
//           Cancel
//         </Button>
//         <Box sx={{ display: 'flex', gap: 1 }}>
//           {activeStep > 0 && (
//             <Button
//               onClick={handleBack}
//               disabled={loading}
//               startIcon={<NavigateBeforeIcon sx={{ fontSize: '1rem' }} />}
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
//               Back
//             </Button>
//           )}
//           {activeStep === steps.length - 1 ? (
//             <Button
//               variant="contained"
//               onClick={handleSubmit}
//               disabled={loading}
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
//               {loading ? <CircularProgress size={16} sx={{ color: COLORS.text.light }} /> : 'Create MRV (Draft)'}
//             </Button>
//           ) : (
//             <Button
//               variant="contained"
//               onClick={handleNext}
//               disabled={loading || !formData.miv_id}
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

// export default AddMRV;


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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  FormControl,
  Select,
  InputLabel
} from '@mui/material';
import {
  Add as AddIcon,
  Close as CloseIcon,
  Search as SearchIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Delete as DeleteIcon,
  NavigateNext as NavigateNextIcon,
  NavigateBefore as NavigateBeforeIcon,
  Edit as EditIcon
} from '@mui/icons-material';
import axios from 'axios';
import BASE_URL from '../../../config/Config';

// Color constants (same as before)
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

const UNIT_OPTIONS = ['Nos', 'Kg', 'Meter', 'Sheet', 'Roll'];
const CONDITION_OPTIONS = ['Good', 'Partially Damaged', 'Scrap'];

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

const steps = ['Basic Information', 'Return Items'];
const employeeSteps = ['Personal Info', 'Employment', 'Pay & Work', 'Bank & Emergency'];

// ==================== Inline Employee Form (Full‑width, with Edit support) ====================
const InlineEmployeeForm = ({ 
  onClose, 
  onSave, 
  onUpdate, 
  initialData = null, 
  isEdit = false,
  departments = [],
  designations = [],
  loadingData = false
}) => {
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [localDepartments, setLocalDepartments] = useState(departments);
  const [localDesignations, setLocalDesignations] = useState(designations);

  const [formData, setFormData] = useState({
    FirstName: '',
    LastName: '',
    Gender: 'M',
    DateOfBirth: '',
    Email: '',
    Phone: '',
    Address: '',
    DepartmentID: '',
    DesignationID: '',
    DateOfJoining: '',
    EmploymentType: 'Monthly',
    ContractCompany: '',
    PayStructureType: 'Fixed',
    BasicSalary: '',
    HourlyRate: '',
    OvertimeRateMultiplier: '1.5',
    SkillLevel: '',
    WorkStation: '',
    LineNumber: '',
    PAN: '',
    AadharNumber: '',
    PFNumber: '',
    UAN: '',
    ESINumber: '',
    BankAccountNumber: '',
    BankAccountHolderName: '',
    BankName: '',
    BankBranch: '',
    BankIfscCode: '',
    BankAccountType: 'Savings',
    EmergencyContactName: '',
    EmergencyContactRelationship: '',
    EmergencyContactPhone: '',
    EmergencyContactAddress: '',
    EmergencyContactPIN: ''
  });

  const [fieldErrors, setFieldErrors] = useState({});
  const [touched, setTouched] = useState({});

  // Pre‑fill form when initialData changes
  useEffect(() => {
    if (initialData) {
      setFormData({
        FirstName: initialData.FirstName || '',
        LastName: initialData.LastName || '',
        Gender: initialData.Gender || 'M',
        DateOfBirth: initialData.DateOfBirth || '',
        Email: initialData.Email || '',
        Phone: initialData.Phone || '',
        Address: initialData.Address || '',
        DepartmentID: initialData.DepartmentID?._id || initialData.DepartmentID || '',
        DesignationID: initialData.DesignationID?._id || initialData.DesignationID || '',
        DateOfJoining: initialData.DateOfJoining || '',
        EmploymentType: initialData.EmploymentType || 'Monthly',
        ContractCompany: initialData.ContractCompany || '',
        PayStructureType: initialData.PayStructureType || 'Fixed',
        BasicSalary: initialData.BasicSalary || '',
        HourlyRate: initialData.HourlyRate || '',
        OvertimeRateMultiplier: initialData.OvertimeRateMultiplier || '1.5',
        SkillLevel: initialData.SkillLevel || '',
        WorkStation: initialData.WorkStation || '',
        LineNumber: initialData.LineNumber || '',
        PAN: initialData.PAN || '',
        AadharNumber: initialData.AadharNumber || '',
        PFNumber: initialData.PFNumber || '',
        UAN: initialData.UAN || '',
        ESINumber: initialData.ESINumber || '',
        BankAccountNumber: initialData.BankDetails?.accountNumber || '',
        BankAccountHolderName: initialData.BankDetails?.accountHolderName || '',
        BankName: initialData.BankDetails?.bankName || '',
        BankBranch: initialData.BankDetails?.branch || '',
        BankIfscCode: initialData.BankDetails?.ifscCode || '',
        BankAccountType: initialData.BankDetails?.accountType || 'Savings',
        EmergencyContactName: initialData.EmergencyContact?.name || '',
        EmergencyContactRelationship: initialData.EmergencyContact?.relationship || '',
        EmergencyContactPhone: initialData.EmergencyContact?.phone || '',
        EmergencyContactAddress: initialData.EmergencyContact?.address || '',
        EmergencyContactPIN: initialData.EmergencyContact?.pinCode || ''
      });
      // Reset errors and touched
      setFieldErrors({});
      setTouched({});
      setActiveStep(0);
      setSubmitError('');
    }
  }, [initialData]);

  // Options (same as AddEmployees)
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

  // Validation functions (same as AddEmployees)
  const validateEmail = (email) => /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email);
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

  // Step‑wise validation
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

  // Submit (Create or Update)
  const handleSubmit = async () => {
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

      let response;
      if (isEdit && initialData?._id) {
        // Update existing employee
        response = await axios.put(`${BASE_URL}/api/employees/${initialData._id}`, payload, {
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
        });
      } else {
        // Create new employee
        response = await axios.post(`${BASE_URL}/api/employees`, payload, {
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
        });
      }
      if (response.data.success) {
        if (isEdit && initialData?._id) {
          if (onUpdate) onUpdate(response.data.data);
        } else {
          if (onSave) onSave(response.data.data);
        }
      } else {
        setSubmitError(response.data.message || 'Operation failed');
      }
    } catch (err) {
      console.error('Error saving employee:', err);
      setSubmitError(err.response?.data?.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Styles
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
            <Paper sx={{ p: 2, bgcolor: '#f9fafb', borderRadius: 2, border: `1px solid ${COLORS.border}` }}>
              <Typography sx={{ fontSize: '0.9rem', fontWeight: 600, color: COLORS.primary, mb: 1.5 }}>
                Personal Information
              </Typography>
              <Grid container spacing={1.5}>
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
          </Stack>
        );

      case 1:
        return (
          <Stack spacing={2}>
            <Paper sx={{ p: 2, bgcolor: '#f9fafb', borderRadius: 2, border: `1px solid ${COLORS.border}` }}>
              <Typography sx={{ fontSize: '0.9rem', fontWeight: 600, color: COLORS.primary, mb: 1.5 }}>
                Employment Details
              </Typography>
              <Grid container spacing={1.5}>
                <Grid item xs={12} sm={6}>
                  <Box><Typography sx={labelStyle}>DEPARTMENT <span style={{ color: '#EF4444' }}>*</span></Typography>
                    <Autocomplete
                      options={localDepartments}
                      getOptionLabel={(opt) => opt?.DepartmentName || ''}
                      value={localDepartments.find(d => d._id === formData.DepartmentID) || null}
                      onChange={(e, v) => handleAutocompleteChange('DepartmentID', v)}
                      loading={loadingData}
                      renderInput={(params) => <TextField {...params} size="small" placeholder="Select department" error={!!fieldErrors.DepartmentID} helperText={fieldErrors.DepartmentID} sx={inputStyle} />}
                    /></Box>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Box><Typography sx={labelStyle}>DESIGNATION <span style={{ color: '#EF4444' }}>*</span></Typography>
                    <Autocomplete
                      options={localDesignations}
                      getOptionLabel={(opt) => opt?.DesignationName || ''}
                      value={localDesignations.find(d => d._id === formData.DesignationID) || null}
                      onChange={(e, v) => handleAutocompleteChange('DesignationID', v)}
                      loading={loadingData}
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
          </Stack>
        );

      case 2:
        return (
          <Stack spacing={2}>
            <Paper sx={{ p: 2, bgcolor: '#f9fafb', borderRadius: 2, border: `1px solid ${COLORS.border}` }}>
              <Typography sx={{ fontSize: '0.9rem', fontWeight: 600, color: COLORS.primary, mb: 1.5 }}>
                Pay & Work Details
              </Typography>
              <Grid container spacing={1.5}>
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
          </Stack>
        );

      case 3:
        return (
          <Stack spacing={2}>
            <Paper sx={{ p: 2, bgcolor: '#f9fafb', borderRadius: 2, border: `1px solid ${COLORS.border}` }}>
              <Typography sx={{ fontSize: '0.9rem', fontWeight: 600, color: COLORS.primary, mb: 1.5 }}>
                Bank Details <span style={{ fontSize: '0.7rem', fontWeight: 'normal', color: COLORS.text.tertiary }}>(All or None)</span>
              </Typography>
              <Grid container spacing={1.5}>
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

            <Paper sx={{ p: 2, bgcolor: '#f9fafb', borderRadius: 2, border: `1px solid ${COLORS.border}` }}>
              <Typography sx={{ fontSize: '0.9rem', fontWeight: 600, color: COLORS.primary, mb: 1.5 }}>
                Emergency Contact <span style={{ fontSize: '0.7rem', fontWeight: 'normal', color: COLORS.text.tertiary }}>(All or None)</span>
              </Typography>
              <Grid container spacing={1.5}>
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
    <Paper sx={{ mt: 2, p: 2, bgcolor: '#ffffff', border: `1px solid ${COLORS.border}`, borderRadius: 2, width: '100%', boxSizing: 'border-box' }}>
      <Typography sx={{ fontSize: '1rem', fontWeight: 700, color: COLORS.text.primary, mb: 2 }}>
        {isEdit ? 'Edit Employee' : 'Add New Employee'}
      </Typography>

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
          {activeStep === employeeSteps.length - 1 ? (
            <Button
              variant="contained"
              size="small"
              onClick={handleSubmit}
              disabled={loading}
              startIcon={loading ? null : (isEdit ? <EditIcon sx={{ fontSize: '1rem' }} /> : <AddIcon sx={{ fontSize: '1rem' }} />)}
              sx={{
                fontSize: '0.7rem',
                textTransform: 'none',
                bgcolor: COLORS.primary,
                '&:hover': { bgcolor: COLORS.primaryDark }
              }}
            >
              {loading ? <CircularProgress size={16} sx={{ color: COLORS.text.light }} /> : (isEdit ? 'Update Employee' : 'Add Employee')}
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

// ==================== Main AddMRV Component ====================
const AddMRV = ({ open, onClose, onAdd }) => {
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [errors, setErrors] = useState({});
  const [mivError, setMivError] = useState('');
  const [stockError, setStockError] = useState('');

  // Inline employee form state
  const [showInlineEmployeeForm, setShowInlineEmployeeForm] = useState(false);
  const [inlineEmployeeType, setInlineEmployeeType] = useState(''); // 'returned_by' or 'received_by'
  const [editingEmployeeData, setEditingEmployeeData] = useState(null); // for pre-fill
  const [isEditing, setIsEditing] = useState(false);

  const [mivList, setMivList] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [items, setItems] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [designations, setDesignations] = useState([]);

  const [selectedMIV, setSelectedMIV] = useState(null);
  const [mivItems, setMivItems] = useState([]);

  const [formData, setFormData] = useState({
    miv_id: '',
    returned_by: '',
    received_by: '',
    condition: 'Good',
    remarks: '',
    items: [{
      item_id: '',
      part_no: '',
      returned_qty: '',
      warehouse_id: '',
      bin_id: '',
      unit: '',
      unit_cost: 0,
      max_returnable_qty: 0
    }]
  });

  useEffect(() => {
    if (open) {
      fetchMIVList();
      fetchEmployees();
      fetchWarehouses();
      fetchItems();
      fetchDepartmentsAndDesignations();
      resetForm();
    }
  }, [open]);

  // Fetch all MIVs (no status filter to ensure data)
  const fetchMIVList = async () => {
    try {
      setFetching(true);
      const token = localStorage.getItem('token');
      const res = await axios.get(`${BASE_URL}/api/miv?limit=1000`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        setMivList(res.data.data || []);
        console.log('MIVs loaded:', res.data.data);
      } else {
        console.warn('MIV API returned success: false', res.data);
      }
    } catch (err) {
      console.error('Error fetching MIVs:', err);
      setMivError('Failed to load MIVs – check console');
    } finally {
      setFetching(false);
    }
  };

  const fetchEmployees = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${BASE_URL}/api/employees?limit=1000`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) setEmployees(res.data.data || []);
    } catch (err) {
      console.error('Error fetching employees:', err);
    }
  };

  const fetchDepartmentsAndDesignations = async () => {
    try {
      const token = localStorage.getItem('token');
      const deptRes = await axios.get(`${BASE_URL}/api/departments`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const desigRes = await axios.get(`${BASE_URL}/api/designations`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (deptRes.data.success) setDepartments(deptRes.data.data || []);
      if (desigRes.data.success) setDesignations(desigRes.data.data || []);
    } catch (err) {
      console.error('Error fetching depts/desigs:', err);
    }
  };

  const fetchWarehouses = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${BASE_URL}/api/warehouses?limit=1000`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) setWarehouses(res.data.data || []);
    } catch (err) {
      console.error('Error fetching warehouses:', err);
    }
  };

  const fetchItems = async () => {
    try {
      setFetching(true);
      const token = localStorage.getItem('token');
      const res = await axios.get(`${BASE_URL}/api/items?limit=1000`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) setItems(res.data.data || []);
    } catch (err) {
      console.error('Error fetching items:', err);
    } finally {
      setFetching(false);
    }
  };

  const fetchMIVDetails = async (mivId) => {
    try {
      setFetching(true);
      const token = localStorage.getItem('token');
      const res = await axios.get(`${BASE_URL}/api/miv/${mivId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        const mivData = res.data.data;
        setSelectedMIV(mivData);
        const returnItems = (mivData.items || []).map(item => ({
          item_id: item.item_id?._id || item.item_id,
          part_no: item.part_no,
          item_description: item.item_description || item.description,
          issued_qty: item.issued_qty,
          returned_qty: '',
          warehouse_id: item.warehouse_id?._id || item.warehouse_id,
          bin_id: item.bin_id?._id || item.bin_id,
          unit: item.unit,
          unit_cost: item.unit_cost,
          max_returnable_qty: item.issued_qty - (item.returned_qty || 0)
        }));
        setMivItems(returnItems);
        setFormData(prev => ({
          ...prev,
          items: returnItems.map(item => ({
            item_id: item.item_id,
            part_no: item.part_no,
            returned_qty: '',
            warehouse_id: item.warehouse_id,
            bin_id: item.bin_id,
            unit: item.unit,
            unit_cost: item.unit_cost,
            max_returnable_qty: item.max_returnable_qty
          }))
        }));
      }
    } catch (err) {
      console.error('Error fetching MIV details:', err);
      setMivError('Failed to load MIV details');
    } finally {
      setFetching(false);
    }
  };

  const resetForm = () => {
    setFormData({
      miv_id: '',
      returned_by: '',
      received_by: '',
      condition: 'Good',
      remarks: '',
      items: [{
        item_id: '',
        part_no: '',
        returned_qty: '',
        warehouse_id: '',
        bin_id: '',
        unit: '',
        unit_cost: 0,
        max_returnable_qty: 0
      }]
    });
    setSelectedMIV(null);
    setMivItems([]);
    setErrors({});
    setMivError('');
    setStockError('');
    setActiveStep(0);
    setShowInlineEmployeeForm(false);
    setInlineEmployeeType('');
    setEditingEmployeeData(null);
    setIsEditing(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleAutocompleteChange = (name, value) => {
    if (name === 'miv_id' && value) {
      setFormData(prev => ({ ...prev, miv_id: value._id }));
      fetchMIVDetails(value._id);
      setMivError('');
    } else {
      setFormData(prev => ({ ...prev, [name]: value?._id || '' }));
      // If an employee is selected and the inline form is open, pre‑fill it for editing
      if ((name === 'returned_by' || name === 'received_by') && value && showInlineEmployeeForm) {
        // Find the full employee data from the list
        const selectedEmployee = employees.find(emp => emp._id === value._id);
        if (selectedEmployee) {
          setEditingEmployeeData(selectedEmployee);
          setIsEditing(true);
        }
      } else {
        // If no employee selected or form closed, reset edit state
        if (!value) {
          setEditingEmployeeData(null);
          setIsEditing(false);
        }
      }
    }
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  // Handler for inline employee save (create)
  const handleInlineEmployeeSave = (newEmployee) => {
    setEmployees(prev => [...prev, newEmployee]);
    if (inlineEmployeeType === 'returned_by') {
      setFormData(prev => ({ ...prev, returned_by: newEmployee._id }));
    } else if (inlineEmployeeType === 'received_by') {
      setFormData(prev => ({ ...prev, received_by: newEmployee._id }));
    }
    setShowInlineEmployeeForm(false);
    setInlineEmployeeType('');
    setEditingEmployeeData(null);
    setIsEditing(false);
  };

  // Handler for inline employee update
  const handleInlineEmployeeUpdate = (updatedEmployee) => {
    setEmployees(prev => prev.map(emp => emp._id === updatedEmployee._id ? updatedEmployee : emp));
    // If the updated employee is currently selected, update the selected ID
    if (inlineEmployeeType === 'returned_by' && formData.returned_by === updatedEmployee._id) {
      setFormData(prev => ({ ...prev, returned_by: updatedEmployee._id }));
    } else if (inlineEmployeeType === 'received_by' && formData.received_by === updatedEmployee._id) {
      setFormData(prev => ({ ...prev, received_by: updatedEmployee._id }));
    }
    setShowInlineEmployeeForm(false);
    setInlineEmployeeType('');
    setEditingEmployeeData(null);
    setIsEditing(false);
  };

  const handleItemChange = (index, field, value) => {
    const updated = [...formData.items];
    const maxQty = updated[index].max_returnable_qty;
    if (field === 'returned_qty') {
      const qty = Number(value);
      if (qty < 0) return;
      if (qty > maxQty) {
        setStockError(`Return quantity cannot exceed ${maxQty}`);
        return;
      }
      setStockError('');
    }
    updated[index][field] = value;
    setFormData(prev => ({ ...prev, items: updated }));
    if (errors[`item_${index}_${field}`]) {
      setErrors(prev => ({ ...prev, [`item_${index}_${field}`]: '' }));
    }
  };

  const removeItem = (index) => {
    const updated = formData.items.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, items: updated }));
  };

  const validateStep = (step) => {
    const newErrors = {};
    let isValid = true;
    switch (step) {
      case 0:
        if (!formData.miv_id) { newErrors.miv_id = 'MIV is required'; isValid = false; }
        if (!formData.returned_by) { newErrors.returned_by = 'Returned By is required'; isValid = false; }
        if (!formData.received_by) { newErrors.received_by = 'Received By is required'; isValid = false; }
        if (!formData.condition) { newErrors.condition = 'Condition is required'; isValid = false; }
        break;
      case 1:
        formData.items.forEach((item, idx) => {
          if (!item.returned_qty) {
            newErrors[`item_${idx}_returned_qty`] = 'Return quantity is required';
            isValid = false;
          } else if (Number(item.returned_qty) <= 0) {
            newErrors[`item_${idx}_returned_qty`] = 'Quantity must be greater than 0';
            isValid = false;
          }
        });
        break;
      default:
        return true;
    }
    setErrors(newErrors);
    if (!isValid) setMivError('Please fix the errors in this section');
    return isValid;
  };

  const handleNext = () => {
    if (validateStep(activeStep)) {
      setMivError('');
      setActiveStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    setMivError('');
    setActiveStep(prev => prev - 1);
  };

  const handleSubmit = async () => {
    if (!validateStep(1)) return;
    const itemsToReturn = formData.items.filter(item =>
      item.returned_qty && Number(item.returned_qty) > 0
    );
    if (itemsToReturn.length === 0) {
      setStockError('At least one item with return quantity is required');
      return;
    }
    setLoading(true);
    setStockError('');
    try {
      const token = localStorage.getItem('token');
      const itemsPayload = itemsToReturn.map(item => ({
        item_id: item.item_id,
        part_no: item.part_no,
        returned_qty: Number(item.returned_qty),
        warehouse_id: item.warehouse_id,
        bin_id: item.bin_id || ''
      }));
      const payload = {
        miv_id: formData.miv_id,
        returned_by: formData.returned_by,
        received_by: formData.received_by,
        condition: formData.condition,
        items: itemsPayload,
        remarks: formData.remarks || ''
      };
      const response = await axios.post(`${BASE_URL}/api/mrv`, payload, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
      });
      if (response.data.success) {
        if (onAdd) onAdd(response.data.data);
        onClose();
      } else {
        setErrors(prev => ({ ...prev, submit: response.data.message || 'Failed to create MRV' }));
      }
    } catch (err) {
      console.error('API Error:', err);
      if (err.response) {
        const errorMsg = err.response.data?.message || err.response.data?.error || 'Failed to create MRV';
        if (errorMsg.toLowerCase().includes('insufficient') || errorMsg.toLowerCase().includes('exceeds')) {
          setStockError(errorMsg);
        } else {
          setErrors(prev => ({ ...prev, submit: errorMsg }));
        }
      } else if (err.request) {
        setErrors(prev => ({ ...prev, submit: 'No response from server.' }));
      } else {
        setErrors(prev => ({ ...prev, submit: err.message }));
      }
    } finally {
      setLoading(false);
    }
  };

  // Display helpers
  const getMIVDisplay = (miv) => {
    if (!miv) return '';
    return `${miv.miv_number} - ${miv.wo_number || ''}`;
  };
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
  const getWarehouseBins = (warehouseId) => {
    const warehouse = warehouses.find(w => w._id === warehouseId);
    return (warehouse && warehouse.bins && Array.isArray(warehouse.bins)) ? warehouse.bins : [];
  };
  const getBinDisplay = (bin) => {
    if (!bin) return '';
    const binCode = bin.bin_code || bin.bin_id || '';
    const rack = bin.rack || '';
    return rack ? `${binCode} - ${rack}` : binCode;
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
                <Grid size={{ xs: 12 }}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                    <Typography sx={labelStyle}>MATERIAL ISSUE VOUCHER (MIV) <span style={{ color: '#EF4444' }}>*</span></Typography>
                    <Autocomplete
                      fullWidth
                      options={mivList}
                      getOptionLabel={getMIVDisplay}
                      onChange={(e, val) => handleAutocompleteChange('miv_id', val)}
                      loading={fetching}
                      isOptionEqualToValue={(option, value) => option._id === value?._id}
                      noOptionsText={fetching ? 'Loading...' : 'No MIVs found'}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          size="small"
                          error={!!errors.miv_id}
                          helperText={errors.miv_id}
                          placeholder="Select MIV to return materials from"
                          sx={inputStyle}
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
                    />
                    <Typography sx={{ fontSize: '0.6rem', color: COLORS.text.tertiary }}>
                      {mivList.length === 0 && !fetching ? 'No MIVs available – check API' : 'Select a posted/issued MIV'}
                    </Typography>
                  </Box>
                </Grid>

                {/* Returned By – full width */}
                <Grid size={{ xs: 12 }}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                    <Typography sx={labelStyle}>RETURNED BY <span style={{ color: '#EF4444' }}>*</span></Typography>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Box sx={{ flex: 1 }}>
                        <Autocomplete
                          fullWidth
                          options={employees}
                          getOptionLabel={getPersonName}
                          value={employees.find(emp => emp._id === formData.returned_by) || null}
                          onChange={(e, val) => {
                            handleAutocompleteChange('returned_by', val);
                          }}
                          isOptionEqualToValue={(option, value) => option._id === value?._id}
                          disabled={showInlineEmployeeForm && inlineEmployeeType === 'returned_by' && !isEditing}
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              size="small"
                              error={!!errors.returned_by}
                              helperText={errors.returned_by}
                              placeholder="Select employee returning materials"
                              sx={inputStyle}
                            />
                          )}
                        />
                      </Box>
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => {
                          if (showInlineEmployeeForm && inlineEmployeeType === 'returned_by') {
                            // Close the form and reset edit state
                            setShowInlineEmployeeForm(false);
                            setInlineEmployeeType('');
                            setEditingEmployeeData(null);
                            setIsEditing(false);
                          } else {
                            setShowInlineEmployeeForm(true);
                            setInlineEmployeeType('returned_by');
                            // If there's already a selected employee, pre-fill for editing
                            const selected = employees.find(emp => emp._id === formData.returned_by);
                            if (selected) {
                              setEditingEmployeeData(selected);
                              setIsEditing(true);
                            } else {
                              setEditingEmployeeData(null);
                              setIsEditing(false);
                            }
                          }
                        }}
                        startIcon={showInlineEmployeeForm && inlineEmployeeType === 'returned_by' ? <CloseIcon sx={{ fontSize: '0.875rem' }} /> : (isEditing && formData.returned_by ? <EditIcon sx={{ fontSize: '0.875rem' }} /> : <AddIcon sx={{ fontSize: '0.875rem' }} />)}
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
                        {showInlineEmployeeForm && inlineEmployeeType === 'returned_by' ? 'Cancel' : (isEditing && formData.returned_by ? 'Edit' : 'Add New')}
                      </Button>
                    </Box>
                    {showInlineEmployeeForm && inlineEmployeeType === 'returned_by' && (
                      <InlineEmployeeForm
                        onClose={() => { setShowInlineEmployeeForm(false); setInlineEmployeeType(''); setEditingEmployeeData(null); setIsEditing(false); }}
                        onSave={handleInlineEmployeeSave}
                        onUpdate={handleInlineEmployeeUpdate}
                        initialData={editingEmployeeData}
                        isEdit={isEditing}
                        departments={departments}
                        designations={designations}
                        loadingData={fetching}
                      />
                    )}
                  </Box>
                </Grid>

                {/* Received By – full width */}
                <Grid size={{ xs: 12 }}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                    <Typography sx={labelStyle}>RECEIVED BY (STORE) <span style={{ color: '#EF4444' }}>*</span></Typography>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Box sx={{ flex: 1 }}>
                        <Autocomplete
                          fullWidth
                          options={employees}
                          getOptionLabel={getPersonName}
                          value={employees.find(emp => emp._id === formData.received_by) || null}
                          onChange={(e, val) => {
                            handleAutocompleteChange('received_by', val);
                          }}
                          isOptionEqualToValue={(option, value) => option._id === value?._id}
                          disabled={showInlineEmployeeForm && inlineEmployeeType === 'received_by' && !isEditing}
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              size="small"
                              error={!!errors.received_by}
                              helperText={errors.received_by}
                              placeholder="Select store employee receiving materials"
                              sx={inputStyle}
                            />
                          )}
                        />
                      </Box>
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => {
                          if (showInlineEmployeeForm && inlineEmployeeType === 'received_by') {
                            setShowInlineEmployeeForm(false);
                            setInlineEmployeeType('');
                            setEditingEmployeeData(null);
                            setIsEditing(false);
                          } else {
                            setShowInlineEmployeeForm(true);
                            setInlineEmployeeType('received_by');
                            const selected = employees.find(emp => emp._id === formData.received_by);
                            if (selected) {
                              setEditingEmployeeData(selected);
                              setIsEditing(true);
                            } else {
                              setEditingEmployeeData(null);
                              setIsEditing(false);
                            }
                          }
                        }}
                        startIcon={showInlineEmployeeForm && inlineEmployeeType === 'received_by' ? <CloseIcon sx={{ fontSize: '0.875rem' }} /> : (isEditing && formData.received_by ? <EditIcon sx={{ fontSize: '0.875rem' }} /> : <AddIcon sx={{ fontSize: '0.875rem' }} />)}
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
                        {showInlineEmployeeForm && inlineEmployeeType === 'received_by' ? 'Cancel' : (isEditing && formData.received_by ? 'Edit' : 'Add New')}
                      </Button>
                    </Box>
                    {showInlineEmployeeForm && inlineEmployeeType === 'received_by' && (
                      <InlineEmployeeForm
                        onClose={() => { setShowInlineEmployeeForm(false); setInlineEmployeeType(''); setEditingEmployeeData(null); setIsEditing(false); }}
                        onSave={handleInlineEmployeeSave}
                        onUpdate={handleInlineEmployeeUpdate}
                        initialData={editingEmployeeData}
                        isEdit={isEditing}
                        departments={departments}
                        designations={designations}
                        loadingData={fetching}
                      />
                    )}
                  </Box>
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                    <Typography sx={labelStyle}>RETURN CONDITION <span style={{ color: '#EF4444' }}>*</span></Typography>
                    <TextField
                      select
                      fullWidth
                      size="small"
                      name="condition"
                      value={formData.condition}
                      onChange={handleChange}
                      error={!!errors.condition}
                      helperText={errors.condition}
                      sx={inputStyle}
                    >
                      {CONDITION_OPTIONS.map((option) => (
                        <MenuItem key={option} value={option} sx={{ fontSize: '0.75rem' }}>
                          {option}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Box>
                </Grid>

                <Grid size={{ xs: 12 }}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                    <Typography sx={labelStyle}>REMARKS</Typography>
                    <TextField
                      fullWidth
                      multiline
                      rows={2}
                      name="remarks"
                      value={formData.remarks}
                      onChange={handleChange}
                      size="small"
                      placeholder="Enter reason for return or any additional remarks..."
                      sx={inputStyle}
                    />
                  </Box>
                </Grid>
              </Grid>
            </Paper>
            {selectedMIV && mivItems.length > 0 && (
              <Paper sx={{ p: 2.5, bgcolor: COLORS.background.light, borderRadius: 2, border: `1px solid ${COLORS.border}` }}>
                <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color: COLORS.primary, mb: 2 }}>
                  MIV Items Summary
                </Typography>
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ fontSize: '0.7rem', fontWeight: 600 }}>Item</TableCell>
                        <TableCell sx={{ fontSize: '0.7rem', fontWeight: 600 }}>Part No</TableCell>
                        <TableCell sx={{ fontSize: '0.7rem', fontWeight: 600 }} align="right">Issued Qty</TableCell>
                        <TableCell sx={{ fontSize: '0.7rem', fontWeight: 600 }} align="right">Returned Qty</TableCell>
                        <TableCell sx={{ fontSize: '0.7rem', fontWeight: 600 }} align="right">Available to Return</TableCell>
                        <TableCell sx={{ fontSize: '0.7rem', fontWeight: 600 }}>Unit</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {mivItems.map((item, idx) => (
                        <TableRow key={idx}>
                          <TableCell sx={{ fontSize: '0.7rem' }}>{item.item_description || '-'}</TableCell>
                          <TableCell sx={{ fontSize: '0.7rem' }}>{item.part_no || '-'}</TableCell>
                          <TableCell sx={{ fontSize: '0.7rem' }} align="right">{item.issued_qty || 0}</TableCell>
                          <TableCell sx={{ fontSize: '0.7rem' }} align="right">{item.returned_qty || 0}</TableCell>
                          <TableCell sx={{ fontSize: '0.7rem' }} align="right">
                            <Typography sx={{ fontWeight: 600, color: COLORS.primary }}>
                              {item.max_returnable_qty || 0}
                            </Typography>
                          </TableCell>
                          <TableCell sx={{ fontSize: '0.7rem' }}>{item.unit || '-'}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Paper>
            )}
          </Stack>
        );

      case 1:
        return (
          <Stack spacing={2}>
            <Paper sx={{ p: 2.5, bgcolor: COLORS.background.white, borderRadius: 2, border: `1px solid ${COLORS.border}` }}>
              <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color: COLORS.primary, mb: 2 }}>
                Return Items
              </Typography>
              <TableContainer component={Paper} sx={{ boxShadow: 'none', border: `1px solid ${COLORS.border}`, borderRadius: 2 }}>
                <Table stickyHeader size="small">
                  <TableHead>
                    <TableRow sx={{ bgcolor: COLORS.background.light }}>
                      <TableCell sx={{ fontSize: '0.7rem', fontWeight: 600, minWidth: 180 }}>Item</TableCell>
                      <TableCell sx={{ fontSize: '0.7rem', fontWeight: 600, minWidth: 100 }}>Part No</TableCell>
                      <TableCell sx={{ fontSize: '0.7rem', fontWeight: 600, minWidth: 100 }} align="right">Unit</TableCell>
                      <TableCell sx={{ fontSize: '0.7rem', fontWeight: 600, minWidth: 100 }} align="right">Max Returnable</TableCell>
                      <TableCell sx={{ fontSize: '0.7rem', fontWeight: 600, minWidth: 120 }} align="right">Return Qty*</TableCell>
                      <TableCell sx={{ fontSize: '0.7rem', fontWeight: 600, minWidth: 150 }}>Warehouse</TableCell>
                      <TableCell sx={{ fontSize: '0.7rem', fontWeight: 600, minWidth: 120 }}>Bin</TableCell>
                      <TableCell sx={{ width: 50 }}></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {formData.items.map((item, idx) => {
                      const warehouseBins = getWarehouseBins(item.warehouse_id);
                      const mivItem = mivItems.find(m => m.item_id === item.item_id);
                      return (
                        <TableRow key={idx}>
                          <TableCell>
                            <Typography sx={{ fontSize: '0.75rem', fontWeight: 500 }}>
                              {mivItem?.item_description || '-'}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography sx={{ fontSize: '0.75rem' }}>
                              {item.part_no || mivItem?.part_no || '-'}
                            </Typography>
                          </TableCell>
                          <TableCell align="right">
                            <Typography sx={{ fontSize: '0.75rem' }}>
                              {item.unit || mivItem?.unit || '-'}
                            </Typography>
                          </TableCell>
                          <TableCell align="right">
                            <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: COLORS.primary }}>
                              {item.max_returnable_qty || 0}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <TextField
                              type="number"
                              size="small"
                              value={item.returned_qty}
                              onChange={(e) => handleItemChange(idx, 'returned_qty', e.target.value)}
                              error={!!errors[`item_${idx}_returned_qty`]}
                              helperText={errors[`item_${idx}_returned_qty`]}
                              placeholder="Qty"
                              fullWidth
                              InputProps={{ inputProps: { min: 0, max: item.max_returnable_qty, step: 0.01 } }}
                              sx={inputStyle}
                            />
                          </TableCell>
                          <TableCell>
                            <Autocomplete
                              fullWidth
                              options={warehouses}
                              getOptionLabel={getWarehouseDisplay}
                              value={warehouses.find(w => w._id === item.warehouse_id) || null}
                              onChange={(e, val) => handleItemChange(idx, 'warehouse_id', val?._id || '')}
                              disabled
                              isOptionEqualToValue={(option, value) => option._id === value?._id}
                              renderInput={(params) => (
                                <TextField
                                  {...params}
                                  size="small"
                                  placeholder="Warehouse"
                                  sx={inputStyle}
                                />
                              )}
                            />
                          </TableCell>
                          <TableCell>
                            <Autocomplete
                              fullWidth
                              options={warehouseBins}
                              getOptionLabel={getBinDisplay}
                              value={warehouseBins.find(b => b._id === item.bin_id) || null}
                              onChange={(e, val) => handleItemChange(idx, 'bin_id', val?._id || '')}
                              disabled={!item.warehouse_id}
                              isOptionEqualToValue={(option, value) => option._id === value?._id}
                              renderInput={(params) => (
                                <TextField
                                  {...params}
                                  size="small"
                                  placeholder={!item.warehouse_id ? "Select warehouse first" : "Select bin"}
                                  sx={inputStyle}
                                />
                              )}
                            />
                          </TableCell>
                          <TableCell>
                            {formData.items.length > 1 && (
                              <Tooltip title="Remove Item">
                                <IconButton size="small" onClick={() => removeItem(idx)} sx={{ color: '#EF4444' }}>
                                  <DeleteIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
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
          Create Material Return Voucher (Draft)
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
        {mivError && (
          <Alert severity="warning" icon={<WarningIcon />} sx={{ mb: 2, borderRadius: 1.5 }} onClose={() => setMivError('')}>
            {mivError}
          </Alert>
        )}
        {stockError && (
          <Alert severity="error" icon={<ErrorIcon />} sx={{ mb: 2, borderRadius: 1.5 }} onClose={() => setStockError('')}>
            <strong>Invalid Return Quantity!</strong><br />
            {stockError}
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
              startIcon={loading ? null : <AddIcon sx={{ fontSize: '1rem' }} />}
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
              {loading ? <CircularProgress size={16} sx={{ color: COLORS.text.light }} /> : 'Create MRV (Draft)'}
            </Button>
          ) : (
            <Button
              variant="contained"
              onClick={handleNext}
              disabled={loading || !formData.miv_id}
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

export default AddMRV;