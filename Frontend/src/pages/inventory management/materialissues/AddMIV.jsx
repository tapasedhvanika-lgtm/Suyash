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
//   NavigateBefore as NavigateBeforeIcon
// } from '@mui/icons-material';
// import axios from 'axios';
// import BASE_URL from '../../../config/Config';
// import AddEmployees from '../../hrmaster/employeemaster/AddEmployees';
// import AddUser from '../../users/AddUser';
// import AddDepartment from '../../hrmaster/departmentmaster/AddDepartments';

// // Color constants matching other components
// const COLORS = {
//   primary: '#063C3F',
//   primaryLight: '#E8F0F1',
//   primaryDark: '#05292B',
//   text: {
//     primary: '#151C26',
//     secondary: '#4B5568',
//     tertiary: '#94A3B8',
//     light: '#FFFFFF',
//     lightMuted: 'rgba(255, 255, 255, 0.9)'
//   },
//   background: {
//     white: '#FFFFFF',
//     light: '#F8FFFC',
//     hover: '#F0FDF9',
//     tableHeader: '#063C3F'
//   },
//   border: '#E3E8EF',
//   status: {
//     success: '#9FE2BF',
//     warning: '#FEF3C7',
//     error: '#FEE2E2',
//     info: '#E0F2FE'
//   }
// };

// // Unit options based on schema enum
// const UNIT_OPTIONS = ['Nos', 'Kg', 'Meter', 'Sheet', 'Roll'];
// const ALLOWED_WO_STATUSES = ['Released', 'In Progress', 'In-Progress'];

// // 🔥 Modern Stepper Connector with Gradient
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

// const steps = ['Basic Information', 'Material Items'];

// const AddMIV = ({ open, onClose, onAdd }) => {
//   const [activeStep, setActiveStep] = useState(0);
//   const [loading, setLoading] = useState(false);
//   const [fetching, setFetching] = useState(false);
//   const [errors, setErrors] = useState({});
//   const [workOrderError, setWorkOrderError] = useState('');
//   const [stockError, setStockError] = useState('');

//   // Data states
//   const [workOrders, setWorkOrders] = useState([]);
//   const [departments, setDepartments] = useState([]);
//   const [employees, setEmployees] = useState([]);
//   const [users, setUsers] = useState([]);
//   const [items, setItems] = useState([]);
//   const [warehouses, setWarehouses] = useState([]);
//   const [grns, setGrns] = useState([]);

//   // Modal states for Add functionality
//   const [addDepartmentOpen, setAddDepartmentOpen] = useState(false);
//   const [addEmployeeOpen, setAddEmployeeOpen] = useState(false);
//   const [addUserOpen, setAddUserOpen] = useState(false);
//   const [employeeTypeForAdd, setEmployeeTypeForAdd] = useState(''); // 'issued_by' or 'received_by'
//   const [userTypeForAdd, setUserTypeForAdd] = useState(''); // 'authorised_by'

//   const [formData, setFormData] = useState({
//     wo_id: '',
//     department: '',
//     issued_by: '',
//     received_by: '',
//     authorised_by: '',
//     remarks: '',
//     items: [{
//       item_id: '',
//       part_no: '',
//       item_description: '',
//       issued_qty: '',
//       unit: '',
//       warehouse_id: '',
//       bin_id: '',
//       batch_no: '',
//       heat_no: '',
//       unit_cost: ''
//     }]
//   });

//   useEffect(() => {
//     if (open) {
//       fetchWorkOrders();
//       fetchDepartments();
//       fetchEmployees();
//       fetchUsers();
//       fetchItems();
//       fetchWarehouses();
//       fetchGrns();
//       resetForm();
//     }
//   }, [open]);

//   const fetchWorkOrders = async () => {
//     try {
//       setFetching(true);
//       const token = localStorage.getItem('token');
//       const res = await axios.get(`${BASE_URL}/api/work-orders?limit=1000`, {
//         headers: { Authorization: `Bearer ${token}` }
//       });
//       if (res.data.success) {
//         const filteredWOs = (res.data.data || []).filter(wo =>
//           ALLOWED_WO_STATUSES.includes(wo.status)
//         );
//         setWorkOrders(filteredWOs);
//       }
//     } catch (err) {
//       console.error('Error fetching work orders:', err);
//     } finally {
//       setFetching(false);
//     }
//   };

//   const fetchDepartments = async () => {
//     try {
//       const token = localStorage.getItem('token');
//       const res = await axios.get(`${BASE_URL}/api/departments?limit=1000`, {
//         headers: { Authorization: `Bearer ${token}` }
//       });
//       if (res.data.success) {
//         setDepartments(res.data.data || []);
//       }
//     } catch (err) {
//       console.error('Error fetching departments:', err);
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

//   const fetchUsers = async () => {
//     try {
//       const token = localStorage.getItem('token');
//       const res = await axios.get(`${BASE_URL}/api/users?limit=1000`, {
//         headers: { Authorization: `Bearer ${token}` }
//       });
//       if (res.data.success) {
//         setUsers(res.data.data || []);
//       }
//     } catch (err) {
//       console.error('Error fetching users:', err);
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

//   const fetchGrns = async () => {
//     try {
//       const token = localStorage.getItem('token');
//       const res = await axios.get(`${BASE_URL}/api/grns?limit=1000&sort_by=createdAt&sort_order=desc`, {
//         headers: { Authorization: `Bearer ${token}` }
//       });
//       if (res.data.success) {
//         setGrns(res.data.data || []);
//       }
//     } catch (err) {
//       console.error('Error fetching GRNs:', err);
//     }
//   };

//   const resetForm = () => {
//     setFormData({
//       wo_id: '',
//       department: '',
//       issued_by: '',
//       received_by: '',
//       authorised_by: '',
//       remarks: '',
//       items: [{
//         item_id: '', part_no: '', item_description: '', issued_qty: '', unit: '',
//         warehouse_id: '', bin_id: '', batch_no: '', heat_no: '', unit_cost: ''
//       }]
//     });
//     setErrors({});
//     setWorkOrderError('');
//     setStockError('');
//     setActiveStep(0);
//   };

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData(prev => ({ ...prev, [name]: value }));
//     if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
//   };

//   const handleAutocompleteChange = (name, value) => {
//     if (name === 'wo_id' && value) {
//       if (!ALLOWED_WO_STATUSES.includes(value.status)) {
//         setWorkOrderError(`Cannot issue material for WO in ${value.status} status. Only Released/In Progress allowed.`);
//         setFormData(prev => ({ ...prev, wo_id: '', department: '' }));
//         return;
//       }
//       setWorkOrderError('');

//       const departmentId = value.department_id?._id || value.department_id || '';
//       setFormData(prev => ({
//         ...prev,
//         wo_id: value._id,
//         department: departmentId
//       }));
//     } else {
//       setFormData(prev => ({ ...prev, [name]: value?._id || '' }));
//     }
//     if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
//     setStockError('');
//   };

//   // Handlers for Add modals
//   const handleDepartmentAdded = (newDepartment) => {
//     setDepartments(prev => [...prev, newDepartment]);
//     setFormData(prev => ({ ...prev, department: newDepartment._id }));
//   };

//   const handleEmployeeAdded = (newEmployee) => {
//     setEmployees(prev => [...prev, newEmployee]);
//     if (employeeTypeForAdd === 'issued_by') {
//       setFormData(prev => ({ ...prev, issued_by: newEmployee._id }));
//     } else if (employeeTypeForAdd === 'received_by') {
//       setFormData(prev => ({ ...prev, received_by: newEmployee._id }));
//     }
//     setEmployeeTypeForAdd('');
//   };

//   const handleUserAdded = (newUser) => {
//     setUsers(prev => [...prev, newUser]);
//     if (userTypeForAdd === 'authorised_by') {
//       setFormData(prev => ({ ...prev, authorised_by: newUser._id }));
//     }
//     setUserTypeForAdd('');
//   };

//   const getAvailableBatches = (itemId) => {
//     const batches = [];
//     grns.forEach(grn => {
//       grn.items.forEach(item => {
//         if (item.item_id === itemId && item.batch_no) {
//           batches.push({
//             batch_no: item.batch_no,
//             heat_no: item.heat_no,
//             storage_location: item.storage_location,
//             available_qty: item.accepted_qty || item.received_qty,
//             grn_id: grn._id,
//             grn_number: grn.grn_number
//           });
//         }
//       });
//     });
//     return batches;
//   };

//   const handleItemChange = (index, field, value) => {
//     const updated = [...formData.items];
//     updated[index][field] = value;

//     if (field === 'item_id' && value) {
//       const selectedItem = items.find(i => i._id === value);
//       if (selectedItem) {
//         updated[index].part_no = selectedItem.part_no || selectedItem.PartNo || selectedItem.item_code || '';
//         updated[index].item_description = selectedItem.description ||
//           selectedItem.Description ||
//           selectedItem.item_description ||
//           selectedItem.item_name ||
//           selectedItem.name ||
//           '';
//         const itemUnit = selectedItem.unit || selectedItem.Unit || selectedItem.uom || '';
//         if (itemUnit && UNIT_OPTIONS.includes(itemUnit)) {
//           updated[index].unit = itemUnit;
//         }

//         if (selectedItem.current_cost) {
//           updated[index].unit_cost = selectedItem.current_cost;
//         }

//         updated[index].batch_no = '';
//         updated[index].heat_no = '';
//       }
//     }

//     if (field === 'batch_no' && value) {
//       const batches = getAvailableBatches(updated[index].item_id);
//       const selectedBatch = batches.find(b => b.batch_no === value);
//       if (selectedBatch) {
//         updated[index].heat_no = selectedBatch.heat_no || '';
//         if (selectedBatch.storage_location && !updated[index].bin_id) {
//           updated[index].bin_id = selectedBatch.storage_location;
//         }
//       }
//     }

//     if (field === 'warehouse_id') {
//       updated[index].bin_id = '';
//     }

//     setFormData(prev => ({ ...prev, items: updated }));
//     if (errors[`item_${index}_${field}`]) {
//       setErrors(prev => ({ ...prev, [`item_${index}_${field}`]: '' }));
//     }
//   };

//   const addItem = () => {
//     setFormData(prev => ({
//       ...prev,
//       items: [...prev.items, {
//         item_id: '', part_no: '', item_description: '', issued_qty: '', unit: '',
//         warehouse_id: '', bin_id: '', batch_no: '', heat_no: '', unit_cost: ''
//       }]
//     }));
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
//         if (!formData.wo_id) {
//           newErrors.wo_id = 'Work Order is required';
//           isValid = false;
//         }
//         if (!formData.department) {
//           newErrors.department = 'Department is required';
//           isValid = false;
//         }
//         if (!formData.issued_by) {
//           newErrors.issued_by = 'Issued By is required';
//           isValid = false;
//         }
//         if (!formData.received_by) {
//           newErrors.received_by = 'Received By is required';
//           isValid = false;
//         }
//         if (!formData.authorised_by) {
//           newErrors.authorised_by = 'Authorised By is required';
//           isValid = false;
//         }
//         break;

//       case 1: // Material Items
//         formData.items.forEach((item, idx) => {
//           if (!item.item_id) {
//             newErrors[`item_${idx}_item_id`] = 'Item is required';
//             isValid = false;
//           }
//           if (!item.issued_qty) {
//             newErrors[`item_${idx}_issued_qty`] = 'Quantity is required';
//             isValid = false;
//           } else if (Number(item.issued_qty) <= 0) {
//             newErrors[`item_${idx}_issued_qty`] = 'Quantity must be greater than 0';
//             isValid = false;
//           }
//           if (!item.warehouse_id) {
//             newErrors[`item_${idx}_warehouse_id`] = 'Warehouse is required';
//             isValid = false;
//           }
//           if (!item.item_description) {
//             newErrors[`item_${idx}_item_description`] = 'Item description is required';
//             isValid = false;
//           }
//           if (!item.unit) {
//             newErrors[`item_${idx}_unit`] = 'Unit is required';
//             isValid = false;
//           } else if (!UNIT_OPTIONS.includes(item.unit)) {
//             newErrors[`item_${idx}_unit`] = `Unit must be one of: ${UNIT_OPTIONS.join(', ')}`;
//             isValid = false;
//           }
//         });
//         break;

//       default:
//         return true;
//     }

//     setErrors(newErrors);
//     if (!isValid) {
//       setWorkOrderError('Please fix the errors in this section');
//     }
//     return isValid;
//   };

//   const handleNext = () => {
//     if (validateStep(activeStep)) {
//       setWorkOrderError('');
//       setActiveStep((prevStep) => prevStep + 1);
//     }
//   };

//   const handleBack = () => {
//     setWorkOrderError('');
//     setActiveStep((prevStep) => prevStep - 1);
//   };

//   const handleSubmit = async () => {
//     if (!validateStep(1)) return;
//     if (workOrderError) {
//       setErrors(prev => ({ ...prev, submit: workOrderError }));
//       return;
//     }

//     setLoading(true);
//     setStockError('');
//     try {
//       const token = localStorage.getItem('token');

//       const itemsPayload = formData.items.map(item => ({
//         item_id: item.item_id,
//         part_no: item.part_no || '',
//         item_description: item.item_description || '',
//         issued_qty: Number(item.issued_qty),
//         unit: item.unit,
//         warehouse_id: item.warehouse_id,
//         bin_id: item.bin_id || '',
//         batch_no: item.batch_no || '',
//         heat_no: item.heat_no || '',
//         unit_cost: Number(item.unit_cost) || 0
//       }));

//       const payload = {
//         wo_id: formData.wo_id,
//         department: formData.department,
//         issued_by: formData.issued_by,
//         received_by: formData.received_by,
//         authorised_by: formData.authorised_by,
//         remarks: formData.remarks || '',
//         items: itemsPayload
//       };

//       const response = await axios.post(`${BASE_URL}/api/miv`, payload, {
//         headers: {
//           Authorization: `Bearer ${token}`,
//           'Content-Type': 'application/json'
//         }
//       });

//       if (response.data.success) {
//         if (onAdd) onAdd(response.data.data);
//         onClose();
//       } else {
//         setErrors(prev => ({ ...prev, submit: response.data.message || 'Failed to create MIV' }));
//       }
//     } catch (err) {
//       console.error('API Error:', err);

//       if (err.response) {
//         const errorMsg = err.response.data?.message || err.response.data?.error || 'Failed to create MIV';

//         if (errorMsg.toLowerCase().includes('insufficient stock') ||
//           errorMsg.toLowerCase().includes('shortage') ||
//           errorMsg.toLowerCase().includes('fifo')) {
//           setStockError(errorMsg);
//         } else {
//           setErrors(prev => ({ ...prev, submit: errorMsg }));
//         }
//       } else if (err.request) {
//         setErrors(prev => ({ ...prev, submit: 'No response from server. Please check your connection.' }));
//       } else {
//         setErrors(prev => ({ ...prev, submit: err.message || 'An error occurred while creating MIV' }));
//       }
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Display helper functions
//   const getWorkOrderDisplay = (wo) => wo?.wo_number || wo?.work_order_number || wo?._id || '';
//   const getDepartmentDisplay = (dept) => dept?.DepartmentName || dept?.name || dept?._id || '';
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
//     if (partNo && description) return `${partNo} - ${description.substring(0, 50)}`;
//     if (partNo) return partNo;
//     if (description) return description.substring(0, 50);
//     return item._id?.slice(-6) || 'Unknown Item';
//   };
//   const getWarehouseDisplay = (wh) => wh?.warehouse_name || wh?.name || wh?.warehouse_code || wh?._id || '';
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
//       '&:hover fieldset': {
//         borderColor: COLORS.primary,
//       },
//       '&.Mui-focused fieldset': {
//         borderColor: COLORS.primary,
//         borderWidth: 1
//       }
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
//                 {/* Work Order */}
//                 <Grid size={{ xs: 12, md: 6 }}>
//                   <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//                     <Typography sx={labelStyle}>
//                       WORK ORDER <span style={{ color: '#EF4444' }}>*</span>
//                     </Typography>
//                     <Autocomplete
//                       fullWidth
//                       options={workOrders}
//                       getOptionLabel={getWorkOrderDisplay}
//                       onChange={(e, val) => handleAutocompleteChange('wo_id', val)}
//                       loading={fetching}
//                       isOptionEqualToValue={(option, value) => option._id === value?._id}
//                       renderInput={(params) => (
//                         <TextField
//                           {...params}
//                           size="small"
//                           error={!!errors.wo_id}
//                           helperText={errors.wo_id}
//                           placeholder="Select work order"
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
//                       Only work orders with status "Released" or "In Progress" are shown
//                     </Typography>
//                   </Box>
//                 </Grid>

//                 {/* Department with Add button */}
//                 <Grid size={{ xs: 12, md: 6 }}>
//                   <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//                     <Typography sx={labelStyle}>
//                       DEPARTMENT <span style={{ color: '#EF4444' }}>*</span>
//                     </Typography>
//                     <Box sx={{ display: 'flex', gap: 1 }}>
//                       <Box sx={{ flex: 1 }}>
//                         <Autocomplete
//                           fullWidth
//                           options={departments}
//                           getOptionLabel={getDepartmentDisplay}
//                           onChange={(e, val) => handleAutocompleteChange('department', val)}
//                           isOptionEqualToValue={(option, value) => option._id === value?._id}
//                           renderInput={(params) => (
//                             <TextField
//                               {...params}
//                               size="small"
//                               error={!!errors.department}
//                               helperText={errors.department}
//                               placeholder="Select department"
//                               sx={inputStyle}
//                             />
//                           )}
//                         />
//                       </Box>
//                       <Button
//                         variant="outlined"
//                         size="small"
//                         onClick={() => setAddDepartmentOpen(true)}
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

//                 {/* Issued By (Employee) with Add button */}
//                 <Grid size={{ xs: 12, md: 4 }}>
//                   <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//                     <Typography sx={labelStyle}>
//                       ISSUED BY <span style={{ color: '#EF4444' }}>*</span>
//                     </Typography>
//                     <Box sx={{ display: 'flex', gap: 1 }}>
//                       <Box sx={{ flex: 1 }}>
//                         <Autocomplete
//                           fullWidth
//                           options={employees}
//                           getOptionLabel={getPersonName}
//                           onChange={(e, val) => handleAutocompleteChange('issued_by', val)}
//                           isOptionEqualToValue={(option, value) => option._id === value?._id}
//                           renderInput={(params) => (
//                             <TextField
//                               {...params}
//                               size="small"
//                               error={!!errors.issued_by}
//                               helperText={errors.issued_by}
//                               placeholder="Select employee"
//                               sx={inputStyle}
//                             />
//                           )}
//                         />
//                       </Box>
//                       <Button
//                         variant="outlined"
//                         size="small"
//                         onClick={() => {
//                           setEmployeeTypeForAdd('issued_by');
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

//                 {/* Received By (Employee) with Add button */}
//                 <Grid size={{ xs: 12, md: 4 }}>
//                   <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//                     <Typography sx={labelStyle}>
//                       RECEIVED BY <span style={{ color: '#EF4444' }}>*</span>
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
//                               placeholder="Select employee"
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

//                 {/* Authorised By (User) with Add button */}
//                 <Grid size={{ xs: 12, md: 4 }}>
//                   <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//                     <Typography sx={labelStyle}>
//                       AUTHORISED BY <span style={{ color: '#EF4444' }}>*</span>
//                     </Typography>
//                     <Box sx={{ display: 'flex', gap: 1 }}>
//                       <Box sx={{ flex: 1 }}>
//                         <Autocomplete
//                           fullWidth
//                           options={users}
//                           getOptionLabel={(opt) => opt.Username || opt.Email || getPersonName(opt)}
//                           onChange={(e, val) => handleAutocompleteChange('authorised_by', val)}
//                           isOptionEqualToValue={(option, value) => option._id === value?._id}
//                           renderInput={(params) => (
//                             <TextField
//                               {...params}
//                               size="small"
//                               error={!!errors.authorised_by}
//                               helperText={errors.authorised_by}
//                               placeholder="Select user"
//                               sx={inputStyle}
//                             />
//                           )}
//                         />
//                       </Box>
//                       {/* <Button
//                         variant="outlined"
//                         size="small"
//                         onClick={() => {
//                           setUserTypeForAdd('authorised_by');
//                           setAddUserOpen(true);
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
//                       </Button> */}
//                     </Box>
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
//                       placeholder="Enter any additional remarks..."
//                       sx={inputStyle}
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
//             <Paper sx={{ p: 2.5, bgcolor: COLORS.background.white, borderRadius: 2, border: `1px solid ${COLORS.border}` }}>
//               <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
//                 <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color: COLORS.primary }}>
//                   MATERIAL ITEMS <span style={{ color: '#EF4444' }}>*</span>
//                 </Typography>
//                 <Button
//                   startIcon={<AddIcon sx={{ fontSize: '1rem' }} />}
//                   onClick={addItem}
//                   variant="outlined"
//                   size="small"
//                   sx={{
//                     textTransform: 'none',
//                     fontSize: '0.7rem',
//                     borderRadius: 1.5,
//                     borderColor: COLORS.primary,
//                     color: COLORS.primary,
//                     height: 32,
//                     '&:hover': {
//                       borderColor: COLORS.primaryDark,
//                       bgcolor: COLORS.primaryLight
//                     }
//                   }}
//                 >
//                   Add Item
//                 </Button>
//               </Stack>

//               <TableContainer component={Paper} sx={{ boxShadow: 'none', border: `1px solid ${COLORS.border}`, borderRadius: 2 }}>
//                 <Table stickyHeader size="small">
//                   <TableHead>
//                     <TableRow sx={{ bgcolor: COLORS.background.light }}>
//                       <TableCell sx={{ fontSize: '0.7rem', fontWeight: 600, minWidth: 180 }}>Item</TableCell>
//                       <TableCell sx={{ fontSize: '0.7rem', fontWeight: 600, minWidth: 100 }}>Part No</TableCell>
//                       <TableCell sx={{ fontSize: '0.7rem', fontWeight: 600, minWidth: 200 }}>Description</TableCell>
//                       <TableCell sx={{ fontSize: '0.7rem', fontWeight: 600, minWidth: 100 }}>Qty*</TableCell>
//                       <TableCell sx={{ fontSize: '0.7rem', fontWeight: 600, minWidth: 100 }}>Unit*</TableCell>
//                       <TableCell sx={{ fontSize: '0.7rem', fontWeight: 600, minWidth: 150 }}>Warehouse*</TableCell>
//                       <TableCell sx={{ fontSize: '0.7rem', fontWeight: 600, minWidth: 120 }}>Bin</TableCell>
//                       <TableCell sx={{ fontSize: '0.7rem', fontWeight: 600, minWidth: 120 }}>Batch No</TableCell>
//                       <TableCell sx={{ fontSize: '0.7rem', fontWeight: 600, minWidth: 100 }}>Heat No</TableCell>
//                       <TableCell sx={{ fontSize: '0.7rem', fontWeight: 600, minWidth: 100 }}>Unit Cost</TableCell>
//                       <TableCell sx={{ width: 50 }}></TableCell>
//                     </TableRow>
//                   </TableHead>
//                   <TableBody>
//                     {formData.items.map((item, idx) => {
//                       const warehouseBins = getWarehouseBins(item.warehouse_id);
//                       const availableBatches = item.item_id ? getAvailableBatches(item.item_id) : [];

//                       return (
//                         <TableRow key={idx}>
//                           <TableCell>
//                             <Autocomplete
//                               fullWidth
//                               options={items}
//                               getOptionLabel={getItemDisplay}
//                               onChange={(e, val) => handleItemChange(idx, 'item_id', val?._id || '')}
//                               loading={fetching}
//                               isOptionEqualToValue={(option, value) => option._id === value?._id}
//                               renderInput={(params) => (
//                                 <TextField
//                                   {...params}
//                                   size="small"
//                                   error={!!errors[`item_${idx}_item_id`]}
//                                   helperText={errors[`item_${idx}_item_id`]}
//                                   placeholder="Select item"
//                                   sx={inputStyle}
//                                 />
//                               )}
//                             />
//                           </TableCell>
//                           <TableCell>
//                             <TextField
//                               size="small"
//                               value={item.part_no}
//                               disabled
//                               fullWidth
//                               sx={inputStyle}
//                             />
//                           </TableCell>
//                           <TableCell>
//                             <TextField
//                               size="small"
//                               value={item.item_description}
//                               onChange={(e) => handleItemChange(idx, 'item_description', e.target.value)}
//                               error={!!errors[`item_${idx}_item_description`]}
//                               helperText={errors[`item_${idx}_item_description`]}
//                               placeholder="Description"
//                               fullWidth
//                               multiline
//                               rows={2}
//                               sx={inputStyle}
//                             />
//                           </TableCell>
//                           <TableCell>
//                             <TextField
//                               type="number"
//                               size="small"
//                               value={item.issued_qty}
//                               onChange={(e) => handleItemChange(idx, 'issued_qty', e.target.value)}
//                               error={!!errors[`item_${idx}_issued_qty`]}
//                               helperText={errors[`item_${idx}_issued_qty`]}
//                               placeholder="Qty"
//                               fullWidth
//                               InputProps={{ inputProps: { min: 0.01, step: 0.01 } }}
//                               sx={inputStyle}
//                             />
//                           </TableCell>
//                           <TableCell>
//                             <TextField
//                               select
//                               size="small"
//                               value={item.unit}
//                               onChange={(e) => handleItemChange(idx, 'unit', e.target.value)}
//                               error={!!errors[`item_${idx}_unit`]}
//                               helperText={errors[`item_${idx}_unit`]}
//                               fullWidth
//                               sx={inputStyle}
//                             >
//                               <MenuItem value="" disabled>Select Unit</MenuItem>
//                               {UNIT_OPTIONS.map((unit) => (
//                                 <MenuItem key={unit} value={unit} sx={{ fontSize: '0.75rem' }}>{unit}</MenuItem>
//                               ))}
//                             </TextField>
//                           </TableCell>
//                           <TableCell>
//                             <Autocomplete
//                               fullWidth
//                               options={warehouses}
//                               getOptionLabel={getWarehouseDisplay}
//                               onChange={(e, val) => handleItemChange(idx, 'warehouse_id', val?._id || '')}
//                               isOptionEqualToValue={(option, value) => option._id === value?._id}
//                               renderInput={(params) => (
//                                 <TextField
//                                   {...params}
//                                   size="small"
//                                   placeholder="Select warehouse"
//                                   error={!!errors[`item_${idx}_warehouse_id`]}
//                                   helperText={errors[`item_${idx}_warehouse_id`]}
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
//                               onChange={(e, val) => handleItemChange(idx, 'bin_id', val?._id || '')}
//                               disabled={!item.warehouse_id || warehouseBins.length === 0}
//                               isOptionEqualToValue={(option, value) => option._id === value?._id}
//                               renderInput={(params) => (
//                                 <TextField
//                                   {...params}
//                                   size="small"
//                                   placeholder={!item.warehouse_id ? "Select warehouse first" : warehouseBins.length === 0 ? "No bins" : "Select bin"}
//                                   sx={inputStyle}
//                                 />
//                               )}
//                             />
//                           </TableCell>
//                           <TableCell>
//                             <Autocomplete
//                               fullWidth
//                               options={availableBatches}
//                               getOptionLabel={(opt) => `${opt.batch_no} (Avail: ${opt.available_qty})`}
//                               onChange={(e, val) => handleItemChange(idx, 'batch_no', val?.batch_no || '')}
//                               disabled={!item.item_id || availableBatches.length === 0}
//                               isOptionEqualToValue={(option, value) => option.batch_no === value}
//                               renderInput={(params) => (
//                                 <TextField
//                                   {...params}
//                                   size="small"
//                                   placeholder={!item.item_id ? "Select item first" : "Select batch"}
//                                   sx={inputStyle}
//                                 />
//                               )}
//                             />
//                           </TableCell>
//                           <TableCell>
//                             <TextField
//                               size="small"
//                               value={item.heat_no}
//                               onChange={(e) => handleItemChange(idx, 'heat_no', e.target.value)}
//                               placeholder="Heat No"
//                               fullWidth
//                               disabled={!!item.batch_no}
//                               sx={inputStyle}
//                             />
//                           </TableCell>
//                           <TableCell>
//                             <TextField
//                               type="number"
//                               size="small"
//                               value={item.unit_cost}
//                               onChange={(e) => handleItemChange(idx, 'unit_cost', e.target.value)}
//                               placeholder="Cost"
//                               fullWidth
//                               InputProps={{ startAdornment: <InputAdornment position="start">₹</InputAdornment> }}
//                               sx={inputStyle}
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
//             Create Material Issue Voucher (Draft)
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
//           {workOrderError && (
//             <Alert severity="warning" icon={<WarningIcon />} sx={{ mb: 2, borderRadius: 1.5 }} onClose={() => setWorkOrderError('')}>
//               {workOrderError}
//             </Alert>
//           )}

//           {stockError && (
//             <Alert severity="error" icon={<ErrorIcon />} sx={{ mb: 2, borderRadius: 1.5 }} onClose={() => setStockError('')}>
//               <strong>Stock Insufficient!</strong><br />
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
//                 {loading ? <CircularProgress size={16} sx={{ color: COLORS.text.light }} /> : 'Create MIV'}
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
//       <AddDepartment
//         open={addDepartmentOpen}
//         onClose={() => setAddDepartmentOpen(false)}
//         onAdd={handleDepartmentAdded}
//       />

//       {/* Add Employee Modal */}
//       <AddEmployees
//         open={addEmployeeOpen}
//         onClose={() => {
//           setAddEmployeeOpen(false);
//           setEmployeeTypeForAdd('');
//         }}
//         onAdd={handleEmployeeAdded}
//       />

//       {/* Add User Modal */}
      
//     </>
//   );
// };

// export default AddMIV;


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
  TableRow
} from '@mui/material';
import {
  Add as AddIcon,
  Close as CloseIcon,
  Search as SearchIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Delete as DeleteIcon,
  NavigateNext as NavigateNextIcon,
  NavigateBefore as NavigateBeforeIcon
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
  }
};

const UNIT_OPTIONS = ['Nos', 'Kg', 'Meter', 'Sheet', 'Roll'];
const ALLOWED_WO_STATUSES = ['Released', 'In Progress', 'In-Progress'];

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

const steps = ['Basic Information', 'Material Items'];
const employeeSteps = ['Personal Info', 'Employment', 'Pay & Work', 'Bank & Emergency'];

// ==================== Inline Department Form ====================
const InlineDepartmentForm = ({ onClose, onSave }) => {
  const [formData, setFormData] = useState({ DepartmentName: '', Level: '', Description: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validate = () => {
    const err = {};
    if (!formData.DepartmentName.trim()) err.DepartmentName = 'Department name is required';
    const level = parseInt(formData.Level);
    if (!formData.Level) err.Level = 'Level is required';
    else if (isNaN(level) || level <= 0) err.Level = 'Must be a positive number';
    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);
    setSubmitError('');
    try {
      const token = localStorage.getItem('token');
      const payload = {
        DepartmentName: formData.DepartmentName,
        Level: parseInt(formData.Level),
        Description: formData.Description || ''
      };
      const response = await axios.post(`${BASE_URL}/api/departments`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success) {
        onSave(response.data.data);
      } else {
        setSubmitError(response.data.message || 'Failed to add department');
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

  return (
    <Paper sx={{ mt: 2, p: 3, bgcolor: '#f9fafb', border: `1px solid ${COLORS.border}`, borderRadius: 2, width: '100%' }}>
      <Typography sx={{ fontSize: '0.9rem', fontWeight: 600, color: COLORS.primary, mb: 2 }}>Add New Department</Typography>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth size="small" name="DepartmentName" label="Department Name"
            value={formData.DepartmentName} onChange={handleChange}
            error={!!errors.DepartmentName} helperText={errors.DepartmentName}
            sx={inputStyle}
          />
        </Grid>
        <Grid item xs={12} sm={3}>
          <TextField
            fullWidth size="small" name="Level" label="Level" type="number"
            value={formData.Level} onChange={handleChange}
            error={!!errors.Level} helperText={errors.Level}
            InputProps={{ inputProps: { min: 1 } }}
            sx={inputStyle}
          />
        </Grid>
        <Grid item xs={12} sm={3}>
          <TextField
            fullWidth size="small" name="Description" label="Description"
            value={formData.Description} onChange={handleChange}
            sx={inputStyle}
          />
        </Grid>
        {submitError && (
          <Grid item xs={12}>
            <Alert severity="error" sx={{ fontSize: '0.75rem' }}>{submitError}</Alert>
          </Grid>
        )}
        <Grid item xs={12} sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
          <Button size="small" onClick={onClose} disabled={loading} sx={{ fontSize: '0.7rem', textTransform: 'none' }}>Cancel</Button>
          <Button
            variant="contained" size="small" onClick={handleSubmit} disabled={loading}
            sx={{ fontSize: '0.7rem', textTransform: 'none', bgcolor: COLORS.primary, '&:hover': { bgcolor: COLORS.primaryDark } }}
          >
            {loading ? <CircularProgress size={16} sx={{ color: '#fff' }} /> : 'Add Department'}
          </Button>
        </Grid>
      </Grid>
    </Paper>
  );
};

// ==================== Inline Employee Form (Multi-step) ====================
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

// ==================== Inline User Form ====================
// The rest of the file (COLORS, constants, InlineDepartmentForm, InlineEmployeeForm) remains exactly as in your latest code.
// Only the InlineUserForm is updated below.

// ==================== Inline User Form (Full width, two‑column, fixed layout) ====================
// ==================== Inline User Form (Updated with correct endpoint & payload) ====================
const InlineUserForm = ({ onClose, onSave }) => {
  const [formData, setFormData] = useState({ 
    Username: '', 
    Email: '', 
    Password: '', 
    ConfirmPassword: '', 
    RoleID: '', 
    Status: 'active'   // changed to lowercase to match AddUser
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [roles, setRoles] = useState([]);
  const [loadingRoles, setLoadingRoles] = useState(false);

  useEffect(() => {
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    try {
      setLoadingRoles(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(`${BASE_URL}/api/roles`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success) {
        setRoles(response.data.data || []);
      }
    } catch (err) {
      console.error('Error fetching roles:', err);
    } finally {
      setLoadingRoles(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validate = () => {
    const err = {};
    if (!formData.Username.trim()) err.Username = 'Username is required';
    if (!formData.Email.trim()) err.Email = 'Email is required';
    else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(formData.Email)) err.Email = 'Invalid email';
    if (!formData.Password || formData.Password.length < 6) err.Password = 'Password must be at least 6 characters';
    if (formData.Password !== formData.ConfirmPassword) err.ConfirmPassword = 'Passwords do not match';
    if (!formData.RoleID) err.RoleID = 'Role is required';
    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);
    setSubmitError('');
    try {
      const token = localStorage.getItem('token');
      
      // Exact payload matching your AddUser component
      const payload = {
        Username: formData.Username,
        Email: formData.Email,
        Password: formData.Password,
        RoleID: formData.RoleID,
        Status: formData.Status,
        // Add Permissions if your backend expects it – adjust as needed
        Permissions: {}   // or [] if it expects an array
      };

      const response = await axios.post(`${BASE_URL}/api/auth/register`, payload, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.data.success) {
        onSave(response.data.data);
      } else {
        setSubmitError(response.data.message || 'Failed to add user');
      }
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.message || err.response?.data?.error || 'An error occurred';
      setSubmitError(msg);
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

  return (
    <Paper sx={{ mt: 2, p: 3, bgcolor: '#f9fafb', border: `1px solid ${COLORS.border}`, borderRadius: 2, width: '100%' }}>
      <Typography sx={{ fontSize: '0.9rem', fontWeight: 600, color: COLORS.primary, mb: 2 }}>Add New User</Typography>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <TextField 
            fullWidth size="small" name="Username" label="Username" 
            value={formData.Username} onChange={handleChange} 
            error={!!errors.Username} helperText={errors.Username} 
            sx={inputStyle} 
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField 
            fullWidth size="small" name="Email" label="Email" 
            value={formData.Email} onChange={handleChange} 
            error={!!errors.Email} helperText={errors.Email} 
            sx={inputStyle} 
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField 
            fullWidth size="small" name="Password" label="Password" type="password" 
            value={formData.Password} onChange={handleChange} 
            error={!!errors.Password} helperText={errors.Password} 
            sx={inputStyle} 
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField 
            fullWidth size="small" name="ConfirmPassword" label="Confirm Password" type="password" 
            value={formData.ConfirmPassword} onChange={handleChange} 
            error={!!errors.ConfirmPassword} helperText={errors.ConfirmPassword} 
            sx={inputStyle} 
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField 
            select fullWidth size="small" name="RoleID" label="Role" 
            value={formData.RoleID} onChange={handleChange} 
            error={!!errors.RoleID} helperText={errors.RoleID} 
            sx={inputStyle}
            disabled={loadingRoles}
          >
            <MenuItem value="">Select a role</MenuItem>
            {roles.map(role => (
              <MenuItem key={role._id} value={role._id}>
                {role.RoleName || role.name || role._id}
              </MenuItem>
            ))}
          </TextField>
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField 
            select fullWidth size="small" name="Status" label="Status" 
            value={formData.Status} onChange={handleChange} 
            sx={inputStyle}
          >
            <MenuItem value="active">Active</MenuItem>
            <MenuItem value="inactive">Inactive</MenuItem>
          </TextField>
        </Grid>
        {submitError && (
          <Grid item xs={12}>
            <Alert severity="error" sx={{ fontSize: '0.75rem' }}>{submitError}</Alert>
          </Grid>
        )}
        <Grid item xs={12} sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
          <Button size="small" onClick={onClose} disabled={loading} sx={{ fontSize: '0.7rem', textTransform: 'none' }}>Cancel</Button>
          <Button
            variant="contained" size="small" onClick={handleSubmit} disabled={loading}
            sx={{ fontSize: '0.7rem', textTransform: 'none', bgcolor: COLORS.primary, '&:hover': { bgcolor: COLORS.primaryDark } }}
          >
            {loading ? <CircularProgress size={16} sx={{ color: '#fff' }} /> : 'Add User'}
          </Button>
        </Grid>
      </Grid>
    </Paper>
  );
};

// The rest of the AddMIV component remains exactly the same as in your latest code.
// It uses the InlineUserForm correctly.
// ==================== Main AddMIV Component ====================
const AddMIV = ({ open, onClose, onAdd }) => {
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [errors, setErrors] = useState({});
  const [workOrderError, setWorkOrderError] = useState('');
  const [stockError, setStockError] = useState('');

  // Data states
  const [workOrders, setWorkOrders] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [users, setUsers] = useState([]);
  const [items, setItems] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [grns, setGrns] = useState([]);

  // Inline form visibility
  const [showAddDepartment, setShowAddDepartment] = useState(false);
  const [showAddEmployee, setShowAddEmployee] = useState(false);
  const [showAddUser, setShowAddUser] = useState(false);
  const [employeeTypeForAdd, setEmployeeTypeForAdd] = useState(''); // 'issued_by' or 'received_by'
  const [userTypeForAdd, setUserTypeForAdd] = useState(''); // 'authorised_by'

  const [formData, setFormData] = useState({
    wo_id: '',
    department: '',
    issued_by: '',
    received_by: '',
    authorised_by: '',
    remarks: '',
    items: [{
      item_id: '',
      part_no: '',
      item_description: '',
      issued_qty: '',
      unit: '',
      warehouse_id: '',
      bin_id: '',
      batch_no: '',
      heat_no: '',
      unit_cost: ''
    }]
  });

  useEffect(() => {
    if (open) {
      fetchWorkOrders();
      fetchDepartments();
      fetchEmployees();
      fetchUsers();
      fetchItems();
      fetchWarehouses();
      fetchGrns();
      resetForm();
    }
  }, [open]);

  const fetchWorkOrders = async () => {
    try {
      setFetching(true);
      const token = localStorage.getItem('token');
      const res = await axios.get(`${BASE_URL}/api/work-orders?limit=1000`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        const filteredWOs = (res.data.data || []).filter(wo =>
          ALLOWED_WO_STATUSES.includes(wo.status)
        );
        setWorkOrders(filteredWOs);
      }
    } catch (err) {
      console.error('Error fetching work orders:', err);
    } finally {
      setFetching(false);
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

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${BASE_URL}/api/users?limit=1000`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        setUsers(res.data.data || []);
      }
    } catch (err) {
      console.error('Error fetching users:', err);
    }
  };

  const fetchItems = async () => {
    try {
      setFetching(true);
      const token = localStorage.getItem('token');
      const res = await axios.get(`${BASE_URL}/api/items?limit=1000`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        setItems(res.data.data || []);
      }
    } catch (err) {
      console.error('Error fetching items:', err);
    } finally {
      setFetching(false);
    }
  };

  const fetchWarehouses = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${BASE_URL}/api/warehouses?limit=1000`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        setWarehouses(res.data.data || []);
      }
    } catch (err) {
      console.error('Error fetching warehouses:', err);
    }
  };

  const fetchGrns = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${BASE_URL}/api/grns?limit=1000&sort_by=createdAt&sort_order=desc`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        setGrns(res.data.data || []);
      }
    } catch (err) {
      console.error('Error fetching GRNs:', err);
    }
  };

  const resetForm = () => {
    setFormData({
      wo_id: '',
      department: '',
      issued_by: '',
      received_by: '',
      authorised_by: '',
      remarks: '',
      items: [{
        item_id: '', part_no: '', item_description: '', issued_qty: '', unit: '',
        warehouse_id: '', bin_id: '', batch_no: '', heat_no: '', unit_cost: ''
      }]
    });
    setErrors({});
    setWorkOrderError('');
    setStockError('');
    setActiveStep(0);
    setShowAddDepartment(false);
    setShowAddEmployee(false);
    setShowAddUser(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleAutocompleteChange = (name, value) => {
    if (name === 'wo_id' && value) {
      if (!ALLOWED_WO_STATUSES.includes(value.status)) {
        setWorkOrderError(`Cannot issue material for WO in ${value.status} status. Only Released/In Progress allowed.`);
        setFormData(prev => ({ ...prev, wo_id: '', department: '' }));
        return;
      }
      setWorkOrderError('');

      const departmentId = value.department_id?._id || value.department_id || '';
      setFormData(prev => ({
        ...prev,
        wo_id: value._id,
        department: departmentId
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value?._id || '' }));
    }
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
    setStockError('');
  };

  // Handlers for inline saves
  const handleDepartmentAdded = (newDepartment) => {
    setDepartments(prev => [...prev, newDepartment]);
    setFormData(prev => ({ ...prev, department: newDepartment._id }));
    setShowAddDepartment(false);
  };

  const handleEmployeeAdded = (newEmployee) => {
    setEmployees(prev => [...prev, newEmployee]);
    if (employeeTypeForAdd === 'issued_by') {
      setFormData(prev => ({ ...prev, issued_by: newEmployee._id }));
    } else if (employeeTypeForAdd === 'received_by') {
      setFormData(prev => ({ ...prev, received_by: newEmployee._id }));
    }
    setEmployeeTypeForAdd('');
    setShowAddEmployee(false);
  };

  const handleUserAdded = (newUser) => {
    setUsers(prev => [...prev, newUser]);
    if (userTypeForAdd === 'authorised_by') {
      setFormData(prev => ({ ...prev, authorised_by: newUser._id }));
    }
    setUserTypeForAdd('');
    setShowAddUser(false);
  };

  const getAvailableBatches = (itemId) => {
    const batches = [];
    grns.forEach(grn => {
      grn.items.forEach(item => {
        if (item.item_id === itemId && item.batch_no) {
          batches.push({
            batch_no: item.batch_no,
            heat_no: item.heat_no,
            storage_location: item.storage_location,
            available_qty: item.accepted_qty || item.received_qty,
            grn_id: grn._id,
            grn_number: grn.grn_number
          });
        }
      });
    });
    return batches;
  };

  const handleItemChange = (index, field, value) => {
    const updated = [...formData.items];
    updated[index][field] = value;

    if (field === 'item_id' && value) {
      const selectedItem = items.find(i => i._id === value);
      if (selectedItem) {
        updated[index].part_no = selectedItem.part_no || selectedItem.PartNo || selectedItem.item_code || '';
        updated[index].item_description = selectedItem.description ||
          selectedItem.Description ||
          selectedItem.item_description ||
          selectedItem.item_name ||
          selectedItem.name ||
          '';
        const itemUnit = selectedItem.unit || selectedItem.Unit || selectedItem.uom || '';
        if (itemUnit && UNIT_OPTIONS.includes(itemUnit)) {
          updated[index].unit = itemUnit;
        }

        if (selectedItem.current_cost) {
          updated[index].unit_cost = selectedItem.current_cost;
        }

        updated[index].batch_no = '';
        updated[index].heat_no = '';
      }
    }

    if (field === 'batch_no' && value) {
      const batches = getAvailableBatches(updated[index].item_id);
      const selectedBatch = batches.find(b => b.batch_no === value);
      if (selectedBatch) {
        updated[index].heat_no = selectedBatch.heat_no || '';
        if (selectedBatch.storage_location && !updated[index].bin_id) {
          updated[index].bin_id = selectedBatch.storage_location;
        }
      }
    }

    if (field === 'warehouse_id') {
      updated[index].bin_id = '';
    }

    setFormData(prev => ({ ...prev, items: updated }));
    if (errors[`item_${index}_${field}`]) {
      setErrors(prev => ({ ...prev, [`item_${index}_${field}`]: '' }));
    }
  };

  const addItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, {
        item_id: '', part_no: '', item_description: '', issued_qty: '', unit: '',
        warehouse_id: '', bin_id: '', batch_no: '', heat_no: '', unit_cost: ''
      }]
    }));
  };

  const removeItem = (index) => {
    const updated = formData.items.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, items: updated }));
  };

  const validateStep = (step) => {
    const newErrors = {};
    let isValid = true;

    switch (step) {
      case 0: // Basic Information
        if (!formData.wo_id) {
          newErrors.wo_id = 'Work Order is required';
          isValid = false;
        }
        if (!formData.department) {
          newErrors.department = 'Department is required';
          isValid = false;
        }
        if (!formData.issued_by) {
          newErrors.issued_by = 'Issued By is required';
          isValid = false;
        }
        if (!formData.received_by) {
          newErrors.received_by = 'Received By is required';
          isValid = false;
        }
        if (!formData.authorised_by) {
          newErrors.authorised_by = 'Authorised By is required';
          isValid = false;
        }
        break;

      case 1: // Material Items
        formData.items.forEach((item, idx) => {
          if (!item.item_id) {
            newErrors[`item_${idx}_item_id`] = 'Item is required';
            isValid = false;
          }
          if (!item.issued_qty) {
            newErrors[`item_${idx}_issued_qty`] = 'Quantity is required';
            isValid = false;
          } else if (Number(item.issued_qty) <= 0) {
            newErrors[`item_${idx}_issued_qty`] = 'Quantity must be greater than 0';
            isValid = false;
          }
          if (!item.warehouse_id) {
            newErrors[`item_${idx}_warehouse_id`] = 'Warehouse is required';
            isValid = false;
          }
          if (!item.item_description) {
            newErrors[`item_${idx}_item_description`] = 'Item description is required';
            isValid = false;
          }
          if (!item.unit) {
            newErrors[`item_${idx}_unit`] = 'Unit is required';
            isValid = false;
          } else if (!UNIT_OPTIONS.includes(item.unit)) {
            newErrors[`item_${idx}_unit`] = `Unit must be one of: ${UNIT_OPTIONS.join(', ')}`;
            isValid = false;
          }
        });
        break;

      default:
        return true;
    }

    setErrors(newErrors);
    if (!isValid) {
      setWorkOrderError('Please fix the errors in this section');
    }
    return isValid;
  };

  const handleNext = () => {
    if (validateStep(activeStep)) {
      setWorkOrderError('');
      setActiveStep((prevStep) => prevStep + 1);
    }
  };

  const handleBack = () => {
    setWorkOrderError('');
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handleSubmit = async () => {
    if (!validateStep(1)) return;
    if (workOrderError) {
      setErrors(prev => ({ ...prev, submit: workOrderError }));
      return;
    }

    setLoading(true);
    setStockError('');
    try {
      const token = localStorage.getItem('token');

      const itemsPayload = formData.items.map(item => ({
        item_id: item.item_id,
        part_no: item.part_no || '',
        item_description: item.item_description || '',
        issued_qty: Number(item.issued_qty),
        unit: item.unit,
        warehouse_id: item.warehouse_id,
        bin_id: item.bin_id || '',
        batch_no: item.batch_no || '',
        heat_no: item.heat_no || '',
        unit_cost: Number(item.unit_cost) || 0
      }));

      const payload = {
        wo_id: formData.wo_id,
        department: formData.department,
        issued_by: formData.issued_by,
        received_by: formData.received_by,
        authorised_by: formData.authorised_by,
        remarks: formData.remarks || '',
        items: itemsPayload
      };

      const response = await axios.post(`${BASE_URL}/api/miv`, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.data.success) {
        if (onAdd) onAdd(response.data.data);
        onClose();
      } else {
        setErrors(prev => ({ ...prev, submit: response.data.message || 'Failed to create MIV' }));
      }
    } catch (err) {
      console.error('API Error:', err);

      if (err.response) {
        const errorMsg = err.response.data?.message || err.response.data?.error || 'Failed to create MIV';

        if (errorMsg.toLowerCase().includes('insufficient stock') ||
          errorMsg.toLowerCase().includes('shortage') ||
          errorMsg.toLowerCase().includes('fifo')) {
          setStockError(errorMsg);
        } else {
          setErrors(prev => ({ ...prev, submit: errorMsg }));
        }
      } else if (err.request) {
        setErrors(prev => ({ ...prev, submit: 'No response from server. Please check your connection.' }));
      } else {
        setErrors(prev => ({ ...prev, submit: err.message || 'An error occurred while creating MIV' }));
      }
    } finally {
      setLoading(false);
    }
  };

  // Display helper functions
  const getWorkOrderDisplay = (wo) => wo?.wo_number || wo?.work_order_number || wo?._id || '';
  const getDepartmentDisplay = (dept) => dept?.DepartmentName || dept?.name || dept?._id || '';
  const getPersonName = (person) => {
    if (!person) return '';
    if (person.FirstName && person.LastName) return `${person.FirstName} ${person.LastName}`;
    if (person.FirstName) return person.FirstName;
    if (person.Username) return person.Username;
    if (person.Email) return person.Email;
    if (person.name) return person.name;
    return person._id || '';
  };
  const getItemDisplay = (item) => {
    if (!item) return '';
    const partNo = item.part_no || item.PartNo || item.item_code || '';
    const description = item.description || item.Description || item.item_description || item.name || '';
    if (partNo && description) return `${partNo} - ${description.substring(0, 50)}`;
    if (partNo) return partNo;
    if (description) return description.substring(0, 50);
    return item._id?.slice(-6) || 'Unknown Item';
  };
  const getWarehouseDisplay = (wh) => wh?.warehouse_name || wh?.name || wh?.warehouse_code || wh?._id || '';
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
      '&:hover fieldset': {
        borderColor: COLORS.primary,
      },
      '&.Mui-focused fieldset': {
        borderColor: COLORS.primary,
        borderWidth: 1
      }
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
                {/* Work Order */}
                <Grid size={{ xs: 12, md: 6 }}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                    <Typography sx={labelStyle}>
                      WORK ORDER <span style={{ color: '#EF4444' }}>*</span>
                    </Typography>
                    <Autocomplete
                      fullWidth
                      options={workOrders}
                      getOptionLabel={getWorkOrderDisplay}
                      onChange={(e, val) => handleAutocompleteChange('wo_id', val)}
                      loading={fetching}
                      isOptionEqualToValue={(option, value) => option._id === value?._id}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          size="small"
                          error={!!errors.wo_id}
                          helperText={errors.wo_id}
                          placeholder="Select work order"
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
                      Only work orders with status "Released" or "In Progress" are shown
                    </Typography>
                  </Box>
                </Grid>

                {/* Department with inline add */}
                <Grid size={{ xs: 12, md: 6 }}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                    <Typography sx={labelStyle}>
                      DEPARTMENT <span style={{ color: '#EF4444' }}>*</span>
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Box sx={{ flex: 1 }}>
                        <Autocomplete
                          fullWidth
                          options={departments}
                          getOptionLabel={getDepartmentDisplay}
                          onChange={(e, val) => handleAutocompleteChange('department', val)}
                          isOptionEqualToValue={(option, value) => option._id === value?._id}
                          disabled={showAddDepartment}
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              size="small"
                              error={!!errors.department}
                              helperText={errors.department}
                              placeholder="Select department"
                              sx={inputStyle}
                            />
                          )}
                        />
                      </Box>
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => setShowAddDepartment(!showAddDepartment)}
                        startIcon={showAddDepartment ? <CloseIcon sx={{ fontSize: '0.875rem' }} /> : <AddIcon sx={{ fontSize: '0.875rem' }} />}
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
                        {showAddDepartment ? 'Cancel' : 'Add New'}
                      </Button>
                    </Box>
                  </Box>
                </Grid>

                {/* Issued By (Employee) with inline add */}
                <Grid size={{ xs: 12, md: 4 }}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                    <Typography sx={labelStyle}>
                      ISSUED BY <span style={{ color: '#EF4444' }}>*</span>
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Box sx={{ flex: 1 }}>
                        <Autocomplete
                          fullWidth
                          options={employees}
                          getOptionLabel={getPersonName}
                          onChange={(e, val) => handleAutocompleteChange('issued_by', val)}
                          isOptionEqualToValue={(option, value) => option._id === value?._id}
                          disabled={showAddEmployee && employeeTypeForAdd === 'issued_by'}
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              size="small"
                              error={!!errors.issued_by}
                              helperText={errors.issued_by}
                              placeholder="Select employee"
                              sx={inputStyle}
                            />
                          )}
                        />
                      </Box>
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => {
                          if (showAddEmployee && employeeTypeForAdd === 'issued_by') {
                            setShowAddEmployee(false);
                            setEmployeeTypeForAdd('');
                          } else {
                            setShowAddEmployee(true);
                            setEmployeeTypeForAdd('issued_by');
                          }
                        }}
                        startIcon={showAddEmployee && employeeTypeForAdd === 'issued_by' ? <CloseIcon sx={{ fontSize: '0.875rem' }} /> : <AddIcon sx={{ fontSize: '0.875rem' }} />}
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
                        {showAddEmployee && employeeTypeForAdd === 'issued_by' ? 'Cancel' : 'Add New'}
                      </Button>
                    </Box>
                  </Box>
                </Grid>

                {/* Received By (Employee) with inline add */}
                <Grid size={{ xs: 12, md: 4 }}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                    <Typography sx={labelStyle}>
                      RECEIVED BY <span style={{ color: '#EF4444' }}>*</span>
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Box sx={{ flex: 1 }}>
                        <Autocomplete
                          fullWidth
                          options={employees}
                          getOptionLabel={getPersonName}
                          onChange={(e, val) => handleAutocompleteChange('received_by', val)}
                          isOptionEqualToValue={(option, value) => option._id === value?._id}
                          disabled={showAddEmployee && employeeTypeForAdd === 'received_by'}
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              size="small"
                              error={!!errors.received_by}
                              helperText={errors.received_by}
                              placeholder="Select employee"
                              sx={inputStyle}
                            />
                          )}
                        />
                      </Box>
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => {
                          if (showAddEmployee && employeeTypeForAdd === 'received_by') {
                            setShowAddEmployee(false);
                            setEmployeeTypeForAdd('');
                          } else {
                            setShowAddEmployee(true);
                            setEmployeeTypeForAdd('received_by');
                          }
                        }}
                        startIcon={showAddEmployee && employeeTypeForAdd === 'received_by' ? <CloseIcon sx={{ fontSize: '0.875rem' }} /> : <AddIcon sx={{ fontSize: '0.875rem' }} />}
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
                        {showAddEmployee && employeeTypeForAdd === 'received_by' ? 'Cancel' : 'Add New'}
                      </Button>
                    </Box>
                  </Box>
                </Grid>

                {/* Authorised By (User) with inline add */}
                <Grid size={{ xs: 12, md: 4 }}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                    <Typography sx={labelStyle}>
                      AUTHORISED BY <span style={{ color: '#EF4444' }}>*</span>
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Box sx={{ flex: 1 }}>
                        <Autocomplete
                          fullWidth
                          options={users}
                          getOptionLabel={(opt) => opt.Username || opt.Email || getPersonName(opt)}
                          onChange={(e, val) => handleAutocompleteChange('authorised_by', val)}
                          isOptionEqualToValue={(option, value) => option._id === value?._id}
                          disabled={showAddUser && userTypeForAdd === 'authorised_by'}
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              size="small"
                              error={!!errors.authorised_by}
                              helperText={errors.authorised_by}
                              placeholder="Select user"
                              sx={inputStyle}
                            />
                          )}
                        />
                      </Box>
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => {
                          if (showAddUser && userTypeForAdd === 'authorised_by') {
                            setShowAddUser(false);
                            setUserTypeForAdd('');
                          } else {
                            setShowAddUser(true);
                            setUserTypeForAdd('authorised_by');
                          }
                        }}
                        startIcon={showAddUser && userTypeForAdd === 'authorised_by' ? <CloseIcon sx={{ fontSize: '0.875rem' }} /> : <AddIcon sx={{ fontSize: '0.875rem' }} />}
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
                        {showAddUser && userTypeForAdd === 'authorised_by' ? 'Cancel' : 'Add New'}
                      </Button>
                    </Box>
                  </Box>
                </Grid>

                {/* Remarks */}
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
                      placeholder="Enter any additional remarks..."
                      sx={inputStyle}
                    />
                  </Box>
                </Grid>
              </Grid>

              {/* ========== FULL‑WIDTH INLINE FORMS ========== */}
              <Stack spacing={2} sx={{ mt: 2 }}>
                {showAddDepartment && (
                  <InlineDepartmentForm
                    onClose={() => setShowAddDepartment(false)}
                    onSave={handleDepartmentAdded}
                  />
                )}
                {showAddEmployee && employeeTypeForAdd === 'issued_by' && (
                  <InlineEmployeeForm
                    onClose={() => { setShowAddEmployee(false); setEmployeeTypeForAdd(''); }}
                    onSave={handleEmployeeAdded}
                    departments={departments}
                  />
                )}
                {showAddEmployee && employeeTypeForAdd === 'received_by' && (
                  <InlineEmployeeForm
                    onClose={() => { setShowAddEmployee(false); setEmployeeTypeForAdd(''); }}
                    onSave={handleEmployeeAdded}
                    departments={departments}
                  />
                )}
                {showAddUser && userTypeForAdd === 'authorised_by' && (
                  <InlineUserForm
                    onClose={() => { setShowAddUser(false); setUserTypeForAdd(''); }}
                    onSave={handleUserAdded}
                  />
                )}
              </Stack>
            </Paper>
          </Stack>
        );

      case 1:
        return (
          <Stack spacing={2}>
            <Paper sx={{ p: 2.5, bgcolor: COLORS.background.white, borderRadius: 2, border: `1px solid ${COLORS.border}` }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color: COLORS.primary }}>
                  MATERIAL ITEMS <span style={{ color: '#EF4444' }}>*</span>
                </Typography>
                <Button
                  startIcon={<AddIcon sx={{ fontSize: '1rem' }} />}
                  onClick={addItem}
                  variant="outlined"
                  size="small"
                  sx={{
                    textTransform: 'none',
                    fontSize: '0.7rem',
                    borderRadius: 1.5,
                    borderColor: COLORS.primary,
                    color: COLORS.primary,
                    height: 32,
                    '&:hover': {
                      borderColor: COLORS.primaryDark,
                      bgcolor: COLORS.primaryLight
                    }
                  }}
                >
                  Add Item
                </Button>
              </Stack>

              <TableContainer component={Paper} sx={{ boxShadow: 'none', border: `1px solid ${COLORS.border}`, borderRadius: 2 }}>
                <Table stickyHeader size="small">
                  <TableHead>
                    <TableRow sx={{ bgcolor: COLORS.background.light }}>
                      <TableCell sx={{ fontSize: '0.7rem', fontWeight: 600, minWidth: 180 }}>Item</TableCell>
                      <TableCell sx={{ fontSize: '0.7rem', fontWeight: 600, minWidth: 100 }}>Part No</TableCell>
                      <TableCell sx={{ fontSize: '0.7rem', fontWeight: 600, minWidth: 200 }}>Description</TableCell>
                      <TableCell sx={{ fontSize: '0.7rem', fontWeight: 600, minWidth: 100 }}>Qty*</TableCell>
                      <TableCell sx={{ fontSize: '0.7rem', fontWeight: 600, minWidth: 100 }}>Unit*</TableCell>
                      <TableCell sx={{ fontSize: '0.7rem', fontWeight: 600, minWidth: 150 }}>Warehouse*</TableCell>
                      <TableCell sx={{ fontSize: '0.7rem', fontWeight: 600, minWidth: 120 }}>Bin</TableCell>
                      <TableCell sx={{ fontSize: '0.7rem', fontWeight: 600, minWidth: 120 }}>Batch No</TableCell>
                      <TableCell sx={{ fontSize: '0.7rem', fontWeight: 600, minWidth: 100 }}>Heat No</TableCell>
                      <TableCell sx={{ fontSize: '0.7rem', fontWeight: 600, minWidth: 100 }}>Unit Cost</TableCell>
                      <TableCell sx={{ width: 50 }}></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {formData.items.map((item, idx) => {
                      const warehouseBins = getWarehouseBins(item.warehouse_id);
                      const availableBatches = item.item_id ? getAvailableBatches(item.item_id) : [];

                      return (
                        <TableRow key={idx}>
                          <TableCell>
                            <Autocomplete
                              fullWidth
                              options={items}
                              getOptionLabel={getItemDisplay}
                              onChange={(e, val) => handleItemChange(idx, 'item_id', val?._id || '')}
                              loading={fetching}
                              isOptionEqualToValue={(option, value) => option._id === value?._id}
                              renderInput={(params) => (
                                <TextField
                                  {...params}
                                  size="small"
                                  error={!!errors[`item_${idx}_item_id`]}
                                  helperText={errors[`item_${idx}_item_id`]}
                                  placeholder="Select item"
                                  sx={inputStyle}
                                />
                              )}
                            />
                          </TableCell>
                          <TableCell>
                            <TextField
                              size="small"
                              value={item.part_no}
                              disabled
                              fullWidth
                              sx={inputStyle}
                            />
                          </TableCell>
                          <TableCell>
                            <TextField
                              size="small"
                              value={item.item_description}
                              onChange={(e) => handleItemChange(idx, 'item_description', e.target.value)}
                              error={!!errors[`item_${idx}_item_description`]}
                              helperText={errors[`item_${idx}_item_description`]}
                              placeholder="Description"
                              fullWidth
                              multiline
                              rows={2}
                              sx={inputStyle}
                            />
                          </TableCell>
                          <TableCell>
                            <TextField
                              type="number"
                              size="small"
                              value={item.issued_qty}
                              onChange={(e) => handleItemChange(idx, 'issued_qty', e.target.value)}
                              error={!!errors[`item_${idx}_issued_qty`]}
                              helperText={errors[`item_${idx}_issued_qty`]}
                              placeholder="Qty"
                              fullWidth
                              InputProps={{ inputProps: { min: 0.01, step: 0.01 } }}
                              sx={inputStyle}
                            />
                          </TableCell>
                          <TableCell>
                            <TextField
                              select
                              size="small"
                              value={item.unit}
                              onChange={(e) => handleItemChange(idx, 'unit', e.target.value)}
                              error={!!errors[`item_${idx}_unit`]}
                              helperText={errors[`item_${idx}_unit`]}
                              fullWidth
                              sx={inputStyle}
                            >
                              <MenuItem value="" disabled>Select Unit</MenuItem>
                              {UNIT_OPTIONS.map((unit) => (
                                <MenuItem key={unit} value={unit} sx={{ fontSize: '0.75rem' }}>{unit}</MenuItem>
                              ))}
                            </TextField>
                          </TableCell>
                          <TableCell>
                            <Autocomplete
                              fullWidth
                              options={warehouses}
                              getOptionLabel={getWarehouseDisplay}
                              onChange={(e, val) => handleItemChange(idx, 'warehouse_id', val?._id || '')}
                              isOptionEqualToValue={(option, value) => option._id === value?._id}
                              renderInput={(params) => (
                                <TextField
                                  {...params}
                                  size="small"
                                  placeholder="Select warehouse"
                                  error={!!errors[`item_${idx}_warehouse_id`]}
                                  helperText={errors[`item_${idx}_warehouse_id`]}
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
                              onChange={(e, val) => handleItemChange(idx, 'bin_id', val?._id || '')}
                              disabled={!item.warehouse_id || warehouseBins.length === 0}
                              isOptionEqualToValue={(option, value) => option._id === value?._id}
                              renderInput={(params) => (
                                <TextField
                                  {...params}
                                  size="small"
                                  placeholder={!item.warehouse_id ? "Select warehouse first" : warehouseBins.length === 0 ? "No bins" : "Select bin"}
                                  sx={inputStyle}
                                />
                              )}
                            />
                          </TableCell>
                          <TableCell>
                            <Autocomplete
                              fullWidth
                              options={availableBatches}
                              getOptionLabel={(opt) => `${opt.batch_no} (Avail: ${opt.available_qty})`}
                              onChange={(e, val) => handleItemChange(idx, 'batch_no', val?.batch_no || '')}
                              disabled={!item.item_id || availableBatches.length === 0}
                              isOptionEqualToValue={(option, value) => option.batch_no === value}
                              renderInput={(params) => (
                                <TextField
                                  {...params}
                                  size="small"
                                  placeholder={!item.item_id ? "Select item first" : "Select batch"}
                                  sx={inputStyle}
                                />
                              )}
                            />
                          </TableCell>
                          <TableCell>
                            <TextField
                              size="small"
                              value={item.heat_no}
                              onChange={(e) => handleItemChange(idx, 'heat_no', e.target.value)}
                              placeholder="Heat No"
                              fullWidth
                              disabled={!!item.batch_no}
                              sx={inputStyle}
                            />
                          </TableCell>
                          <TableCell>
                            <TextField
                              type="number"
                              size="small"
                              value={item.unit_cost}
                              onChange={(e) => handleItemChange(idx, 'unit_cost', e.target.value)}
                              placeholder="Cost"
                              fullWidth
                              InputProps={{ startAdornment: <InputAdornment position="start">₹</InputAdornment> }}
                              sx={inputStyle}
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
          Create Material Issue Voucher (Draft)
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
        {workOrderError && (
          <Alert severity="warning" icon={<WarningIcon />} sx={{ mb: 2, borderRadius: 1.5 }} onClose={() => setWorkOrderError('')}>
            {workOrderError}
          </Alert>
        )}

        {stockError && (
          <Alert severity="error" icon={<ErrorIcon />} sx={{ mb: 2, borderRadius: 1.5 }} onClose={() => setStockError('')}>
            <strong>Stock Insufficient!</strong><br />
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
              {loading ? <CircularProgress size={16} sx={{ color: COLORS.text.light }} /> : 'Create MIV'}
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

export default AddMIV;  