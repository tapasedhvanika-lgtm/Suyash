// import React, { useState, useEffect } from 'react';
// import {
//     Box,
//     Dialog,
//     DialogTitle,
//     DialogContent,
//     DialogActions,
//     TextField,
//     Typography,
//     Button,
//     Stack,
//     Grid,
//     Paper,
//     IconButton,
//     FormControl,
//     InputLabel,
//     Select,
//     MenuItem,
//     Alert,
//     Stepper,
//     Step,
//     StepLabel,
//     StepConnector,
//     stepConnectorClasses,
//     styled,
//     Divider,
//     Chip,
//     Table,
//     TableBody,
//     TableCell,
//     TableContainer,
//     TableHead,
//     TableRow,
//     Tooltip,
//     Autocomplete,
//     InputAdornment,
//     FormControlLabel,
//     Checkbox,
//     Switch
// } from '@mui/material';
// import {
//     Add as AddIcon,
//     Close as CloseIcon,
//     Route as RouteIcon,
//     Build as BuildIcon,
//     Info as InfoIcon,
//     NavigateNext as NavigateNextIcon,
//     NavigateBefore as NavigateBeforeIcon,
//     Delete as DeleteIcon,
//     Search as SearchIcon,
//     Science as ScienceIcon,
//     CheckCircle as CheckCircleIcon,
//     Bolt as BoltIcon
// } from '@mui/icons-material';
// import axios from 'axios';
// import BASE_URL from '../../../config/Config';

// import AddItem from '../../master/itemmaster/AddItem';
// import AddVendor from '../../master/vendormaster/AddVendor';
// import AddProcess from '../../master/processmaster/AddProcess';
// import AddMachine from '../machinemaster/AddMachine';

// const COLORS = {
//     primary: '#063C3F',
//     primaryDark: '#05292B',
//     success: '#2E7D32',
//     warning: '#ED6C02',
//     error: '#D32F2F',
//     border: '#E3E8EF',
//     text: {
//         primary: '#151C26',
//         secondary: '#4B5568',
//         tertiary: '#94A3B8'
//     },
//     background: {
//         light: '#F8FFFC',
//         white: '#FFFFFF'
//     }
// };

// const steps = ['Basic Information', 'Operations', 'Review & Submit'];

// const ColorConnector = styled(StepConnector)(({ theme }) => ({
//     [`&.${stepConnectorClasses.active}`]: {
//         [`& .${stepConnectorClasses.line}`]: {
//             backgroundColor: COLORS.primary,
//         },
//     },
//     [`&.${stepConnectorClasses.completed}`]: {
//         [`& .${stepConnectorClasses.line}`]: {
//             backgroundColor: COLORS.primary,
//         },
//     },
//     [`& .${stepConnectorClasses.line}`]: {
//         height: 2,
//         border: 0,
//         backgroundColor: '#eaeaf0',
//         borderRadius: 1,
//     },
// }));

// const CustomPaper = styled(Paper)({
//     maxHeight: 200,
//     overflow: 'auto',
//     '&::-webkit-scrollbar': {
//         display: 'none'
//     },
//     scrollbarWidth: 'none',
//     msOverflowStyle: 'none',
// });

// const AddRouting = ({ open, onClose, onAdd }) => {
//     const [activeStep, setActiveStep] = useState(0);
//     const [loading, setLoading] = useState(false);
//     const [error, setError] = useState('');
//     const [fieldErrors, setFieldErrors] = useState({});
//     const [processes, setProcesses] = useState([]);
//     const [machines, setMachines] = useState([]);
//     const [items, setItems] = useState([]);
//     const [fetchingData, setFetchingData] = useState(false);

//     // Add state for modals
//     const [openAddItemModal, setOpenAddItemModal] = useState(false);
//     const [openAddMachineModal, setOpenAddMachineModal] = useState(false);
//     const [openAddVendorModal, setOpenAddVendorModal] = useState(false);
//     const [openAddProcessModal, setOpenAddProcessModal] = useState(false);

//     // Add state for vendors
//     const [vendors, setVendors] = useState([]);

//     const [currentJoint, setCurrentJoint] = useState('');
//     const [jointError, setJointError] = useState('');

//     // Fetch vendors when dialog opens
//     const fetchVendors = async () => {
//         try {
//             const token = localStorage.getItem('token');
//             const response = await axios.get(`${BASE_URL}/api/vendors`, {
//                 headers: { 'Authorization': `Bearer ${token}` }
//             });
//             if (response.data.success) {
//                 setVendors(response.data.data || []);
//             }
//         } catch (err) {
//             console.error('Error fetching vendors:', err);
//         }
//     };

//     useEffect(() => {
//         if (open) {
//             fetchProcesses();
//             fetchMachines();
//             fetchItems();
//             fetchVendors();
//         }
//     }, [open]);

//     const [formData, setFormData] = useState({
//         routing_name: '',
//         routing_type: '',
//         applicable_items: [],
//         version: '',
//         operations: []
//     });

//     const [currentOperation, setCurrentOperation] = useState({
//         op_sequence: '',
//         operation_id: '',
//         operation_name: '',
//         work_centre: '',
//         machine_id: '',
//         is_subcontract: false,
//         subcontract_vendor: '',
//         planned_setup_min: '',
//         planned_run_min: '',
//         scrap_pct: '',
//         description: '',
//         requires_torque_recording: false,
//         requires_functional_test: false,
//         expected_joints: []
//     });

//     const [selectedItems, setSelectedItems] = useState([]);

//     const ROUTING_TYPE_OPTIONS = [
//         'Stamping',
//         'Busbar',
//         'Gasket',
//         'Assembly',
//         'Toolroom',
//         'General'
//     ];

//     const fetchProcesses = async () => {
//         setFetchingData(true);
//         try {
//             const token = localStorage.getItem('token');
//             const response = await axios.get(`${BASE_URL}/api/processes`, {
//                 headers: { 'Authorization': `Bearer ${token}` }
//             });

//             if (response.data.success) {
//                 setProcesses(response.data.data || []);
//             }
//         } catch (err) {
//             console.error('Error fetching processes:', err);
//         } finally {
//             setFetchingData(false);
//         }
//     };

//     const fetchMachines = async () => {
//         try {
//             const token = localStorage.getItem('token');
//             const response = await axios.get(`${BASE_URL}/api/machines`, {
//                 headers: { 'Authorization': `Bearer ${token}` },
//                 params: { 'status': ['Active', 'Idle'] },
//             });

//             if (response.data.success) {
//                 setMachines(response.data.data || []);
//             }
//         } catch (err) {
//             console.error('Error fetching machines:', err);
//         }
//     };

//     const fetchItems = async () => {
//         try {
//             const token = localStorage.getItem('token');
//             const response = await axios.get(`${BASE_URL}/api/items/dropdown`, {
//                 headers: { 'Authorization': `Bearer ${token}` }
//             });

//             if (response.data.success) {
//                 setItems(response.data.data || []);
//             }
//         } catch (err) {
//             console.error('Error fetching items:', err);
//         }
//     };

//     const handleChange = (e) => {
//         const { name, value } = e.target;
//         setFormData(prev => ({ ...prev, [name]: value }));
//         setFieldErrors(prev => ({ ...prev, [name]: '' }));
//     };

//     const handleOperationChange = (e) => {
//         const { name, value, type, checked } = e.target;
//         setCurrentOperation(prev => ({
//             ...prev,
//             [name]: type === 'checkbox' ? checked : value
//         }));
//     };

//     const handleProcessSelect = (processId) => {
//         const selectedProcess = processes.find(p => p._id === processId);
//         if (selectedProcess) {
//             setCurrentOperation(prev => ({
//                 ...prev,
//                 operation_id: selectedProcess._id,
//                 operation_name: selectedProcess.process_name,
//                 work_centre: selectedProcess.work_centre || ''
//             }));
//         }
//     };

//     const handleProcessAdded = (newProcess) => {
//         setProcesses(prev => [...prev, newProcess]);
//         setCurrentOperation(prev => ({
//             ...prev,
//             operation_id: newProcess._id,
//             operation_name: newProcess.process_name,
//             work_centre: newProcess.work_centre || ''
//         }));
//     };

//     const handleItemAdded = (newItem) => {
//         setItems(prev => [...prev, newItem]);
//         addApplicableItem(newItem);
//     };

//     const handleMachineAdded = (newMachine) => {
//         setMachines(prev => [...prev, newMachine]);
//         setCurrentOperation(prev => ({
//             ...prev,
//             machine_id: newMachine._id
//         }));
//     };

//     const handleMachineSelect = (machineId) => {
//         const selectedMachine = machines.find(m => m._id === machineId);
//         if (selectedMachine) {
//             setCurrentOperation(prev => ({
//                 ...prev,
//                 machine_id: selectedMachine._id,
//                 work_centre: selectedMachine.work_centre || prev.work_centre
//             }));
//         }
//     };

//     const handleVendorAdded = (newVendor) => {
//         setVendors(prev => [...prev, newVendor]);
//         setCurrentOperation(prev => ({
//             ...prev,
//             subcontract_vendor: newVendor._id
//         }));
//     };

//     const addJoint = () => {
//         if (!currentJoint.trim()) {
//             setJointError('Joint name is required');
//             return;
//         }
//         if (currentOperation.expected_joints.includes(currentJoint.trim())) {
//             setJointError('Joint name already exists');
//             return;
//         }
//         setCurrentOperation(prev => ({
//             ...prev,
//             expected_joints: [...prev.expected_joints, currentJoint.trim()]
//         }));
//         setCurrentJoint('');
//         setJointError('');
//     };

//     const removeJoint = (jointToRemove) => {
//         setCurrentOperation(prev => ({
//             ...prev,
//             expected_joints: prev.expected_joints.filter(joint => joint !== jointToRemove)
//         }));
//     };

//     const addOperation = () => {
//         if (!currentOperation.operation_id) {
//             setError('Please select a process');
//             return;
//         }
//         if (!currentOperation.op_sequence) {
//             setError('Operation sequence is required');
//             return;
//         }
//         if (Number(currentOperation.op_sequence) < 10) {
//             setError('Operation sequence must be at least 10');
//             return;
//         }
//         if (!currentOperation.work_centre) {
//             setError('Work centre is required');
//             return;
//         }
//         if (!currentOperation.planned_setup_min) {
//             setError('Planned setup time is required');
//             return;
//         }
//         if (!currentOperation.planned_run_min) {
//             setError('Planned run time is required');
//             return;
//         }

//         // Validate torque recording requirements
//         if (currentOperation.requires_torque_recording && currentOperation.expected_joints.length === 0) {
//             setError('Please add at least one expected joint for torque recording');
//             return;
//         }

//         const newOperation = {
//             op_sequence: Number(currentOperation.op_sequence),
//             operation_id: currentOperation.operation_id,
//             operation_name: currentOperation.operation_name,
//             work_centre: currentOperation.work_centre || '',
//             machine_id: currentOperation.machine_id || undefined,
//             is_subcontract: currentOperation.is_subcontract || false,
//             subcontract_vendor: currentOperation.subcontract_vendor || '',
//             planned_setup_min: Number(currentOperation.planned_setup_min),
//             planned_run_min: Number(currentOperation.planned_run_min),
//             scrap_pct: Number(currentOperation.scrap_pct) || 0,
//             description: currentOperation.description || undefined,
//             requires_torque_recording: currentOperation.requires_torque_recording,
//             requires_functional_test: currentOperation.requires_functional_test,
//             expected_joints: currentOperation.expected_joints
//         };

//         if (currentOperation.is_subcontract && currentOperation.subcontract_vendor) {
//             newOperation.subcontract_vendor = currentOperation.subcontract_vendor;
//         }

//         if (formData.operations.some(op => op.op_sequence === newOperation.op_sequence)) {
//             setError(`Operation sequence ${newOperation.op_sequence} already exists`);
//             return;
//         }

//         setFormData(prev => ({
//             ...prev,
//             operations: [...prev.operations, newOperation].sort((a, b) => a.op_sequence - b.op_sequence)
//         }));

//         setCurrentOperation({
//             op_sequence: '',
//             operation_id: '',
//             operation_name: '',
//             work_centre: '',
//             machine_id: '',
//             is_subcontract: false,
//             subcontract_vendor: '',
//             planned_setup_min: '',
//             planned_run_min: '',
//             scrap_pct: '',
//             description: '',
//             requires_torque_recording: false,
//             requires_functional_test: false,
//             expected_joints: []
//         });
//         setCurrentJoint('');
//         setError('');
//     };

//     const removeOperation = (index) => {
//         setFormData(prev => ({
//             ...prev,
//             operations: prev.operations.filter((_, i) => i !== index)
//         }));
//     };

//     const addApplicableItem = (item) => {
//         if (item && !formData.applicable_items.includes(item._id)) {
//             setFormData(prev => ({
//                 ...prev,
//                 applicable_items: [...prev.applicable_items, item._id]
//             }));
//             setSelectedItems(prev => [...prev, item]);
//         }
//     };

//     const removeApplicableItem = (itemId) => {
//         setFormData(prev => ({
//             ...prev,
//             applicable_items: prev.applicable_items.filter(id => id !== itemId)
//         }));
//         setSelectedItems(prev => prev.filter(item => item._id !== itemId));
//     };

//     const validateStep = (step) => {
//         const errors = {};
//         let isValid = true;

//         switch (step) {
//             case 0:
//                 if (!formData.routing_name.trim()) {
//                     errors.routing_name = 'Routing name is required';
//                     isValid = false;
//                 }
//                 if (!formData.routing_type.trim()) {
//                     errors.routing_type = 'Routing type is required';
//                     isValid = false;
//                 }
//                 break;

//             case 1:
//                 if (formData.operations.length === 0) {
//                     errors.operations = 'At least one operation is required';
//                     isValid = false;
//                 }
//                 const invalidOps = formData.operations.filter(op => !op.work_centre);
//                 if (invalidOps.length > 0) {
//                     errors.operations = `Operations ${invalidOps.map(op => op.op_sequence).join(', ')} missing work centre`;
//                     isValid = false;
//                 }
//                 const invalidSequenceOps = formData.operations.filter(op => op.op_sequence < 10);
//                 if (invalidSequenceOps.length > 0) {
//                     errors.operations = `Operation sequences ${invalidSequenceOps.map(op => op.op_sequence).join(', ')} must be at least 10`;
//                     isValid = false;
//                 }
//                 // Validate torque recording for operations that require it
//                 const invalidTorqueOps = formData.operations.filter(op => op.requires_torque_recording && (!op.expected_joints || op.expected_joints.length === 0));
//                 if (invalidTorqueOps.length > 0) {
//                     errors.operations = `Operations ${invalidTorqueOps.map(op => op.op_sequence).join(', ')} require torque recording but have no expected joints`;
//                     isValid = false;
//                 }
//                 break;

//             default:
//                 return true;
//         }

//         setFieldErrors(errors);
//         if (!isValid) {
//             setError('Please fix the errors in this section');
//         }
//         return isValid;
//     };

//     const handleNext = () => {
//         if (validateStep(activeStep)) {
//             setError('');
//             setActiveStep((prevStep) => prevStep + 1);
//         }
//     };

//     const handleBack = () => {
//         setError('');
//         setActiveStep((prevStep) => prevStep - 1);
//     };

//     const handleSubmit = async () => {
//         if (!validateStep(1)) {
//             return;
//         }

//         setLoading(true);
//         setError('');

//         try {
//             const token = localStorage.getItem('token');

//             if (!token) {
//                 setError('Authentication token not found. Please login again.');
//                 setLoading(false);
//                 return;
//             }

//             const cleanedOperations = formData.operations.map(op => {
//                 const cleanedOp = { ...op };
//                 if (!cleanedOp.machine_id) delete cleanedOp.machine_id;
//                 if (!cleanedOp.is_subcontract || !cleanedOp.subcontract_vendor) {
//                     delete cleanedOp.subcontract_vendor;
//                 }
//                 if (!cleanedOp.description) delete cleanedOp.description;
//                 return cleanedOp;
//             });

//             const submitData = {
//                 routing_name: formData.routing_name,
//                 routing_type: formData.routing_type,
//                 applicable_items: formData.applicable_items,
//                 operations: cleanedOperations,
//                 version: formData.version
//             };

//             const response = await axios.post(`${BASE_URL}/api/routings`, submitData, {
//                 headers: {
//                     'Authorization': `Bearer ${token}`,
//                     'Content-Type': 'application/json'
//                 }
//             });

//             if (response.data.success) {
//                 if (onAdd) {
//                     onAdd(response.data.data);
//                 }
//                 handleClose();
//             } else {
//                 setError(response.data.message || 'Failed to create routing');
//             }
//         } catch (err) {
//             console.error('Error creating routing:', err);
//             setError(err.response?.data?.message || 'Failed to create routing. Please try again.');
//         } finally {
//             setLoading(false);
//         }
//     };

//     const resetForm = () => {
//         setActiveStep(0);
//         setFormData({
//             routing_name: '',
//             routing_type: '',
//             applicable_items: [],
//             version: '',
//             operations: []
//         });
//         setSelectedItems([]);
//         setCurrentOperation({
//             op_sequence: '',
//             operation_id: '',
//             operation_name: '',
//             work_centre: '',
//             machine_id: '',
//             is_subcontract: false,
//             subcontract_vendor: '',
//             planned_setup_min: '',
//             planned_run_min: '',
//             scrap_pct: '',
//             description: '',
//             requires_torque_recording: false,
//             requires_functional_test: false,
//             expected_joints: []
//         });
//         setCurrentJoint('');
//         setFieldErrors({});
//         setError('');
//     };

//     const handleClose = () => {
//         resetForm();
//         onClose();
//     };

//     const inputStyle = {
//         '& .MuiOutlinedInput-root': {
//             borderRadius: 1.5,
//             fontSize: '0.75rem',
//             '&:hover fieldset': { borderColor: COLORS.primary },
//             '&.Mui-focused fieldset': { borderColor: COLORS.primary, borderWidth: 1 }
//         },
//         '& .MuiInputBase-input': {
//             py: 1,
//             px: 1.5,
//             fontSize: '0.75rem',
//             color: COLORS.text.primary
//         }
//     };

//     const labelStyle = {
//         fontSize: '0.7rem',
//         fontWeight: 600,
//         color: COLORS.text.secondary,
//         letterSpacing: '0.5px',
//         mb: 0.5
//     };

//     const renderStepContent = (step) => {
//         switch (step) {
//             case 0:
//                 return (
//                     <Stack spacing={2}>
//                         <Paper sx={{ p: 2, borderRadius: 1.5, border: `1px solid ${COLORS.border}` }}>
//                             <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color: COLORS.primary, mb: 1.5 }}>
//                                 <RouteIcon sx={{ fontSize: '1rem', mr: 0.5, verticalAlign: 'middle' }} />
//                                 Basic Information
//                             </Typography>

//                             <Grid container spacing={1.5}>
//                                 <Grid size={{ xs: 12, sm: 6 }}>
//                                     <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//                                         <Typography sx={labelStyle}>
//                                             ROUTING NAME <span style={{ color: '#EF4444' }}>*</span>
//                                         </Typography>
//                                         <TextField
//                                             fullWidth
//                                             size="small"
//                                             name="routing_name"
//                                             value={formData.routing_name}
//                                             onChange={handleChange}
//                                             placeholder="e.g., Copper Busbar Standard Route"
//                                             error={!!fieldErrors.routing_name}
//                                             helperText={fieldErrors.routing_name}
//                                             sx={inputStyle}
//                                         />
//                                     </Box>
//                                 </Grid>

//                                 <Grid size={{ xs: 12, sm: 6 }}>
//                                     <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//                                         <Typography sx={labelStyle}>
//                                             ROUTING TYPE <span style={{ color: '#EF4444' }}>*</span>
//                                         </Typography>
//                                         <FormControl fullWidth size="small" error={!!fieldErrors.routing_type}>
//                                             <Select
//                                                 name="routing_type"
//                                                 value={formData.routing_type}
//                                                 onChange={handleChange}
//                                                 displayEmpty
//                                                 sx={{ borderRadius: 1.5, fontSize: '0.75rem' }}
//                                             >
//                                                 <MenuItem value="" disabled sx={{ fontSize: '0.75rem' }}>
//                                                     Select routing type
//                                                 </MenuItem>
//                                                 {ROUTING_TYPE_OPTIONS.map((type) => (
//                                                     <MenuItem key={type} value={type} sx={{ fontSize: '0.75rem' }}>
//                                                         {type}
//                                                     </MenuItem>
//                                                 ))}
//                                             </Select>
//                                             {fieldErrors.routing_type && (
//                                                 <Typography sx={{ fontSize: '0.65rem', color: '#EF4444', mt: 0.5 }}>
//                                                     {fieldErrors.routing_type}
//                                                 </Typography>
//                                             )}
//                                         </FormControl>
//                                     </Box>
//                                 </Grid>

//                                 <Grid size={{ xs: 12, sm: 6 }}>
//                                     <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//                                         <Typography sx={labelStyle}>VERSION</Typography>
//                                         <TextField
//                                             fullWidth
//                                             size="small"
//                                             name="version"
//                                             value={formData.version}
//                                             onChange={handleChange}
//                                             placeholder="1.0"
//                                             sx={inputStyle}
//                                         />
//                                     </Box>
//                                 </Grid>

//                                 <Grid size={{ xs: 12 }}>
//                                     <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//                                         <Typography sx={labelStyle}>APPLICABLE ITEMS</Typography>
//                                         <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
//                                             <Box sx={{ flex: 1 }}>
//                                                 <Autocomplete
//                                                     options={items}
//                                                     getOptionLabel={(option) => {
//                                                         const partNo = option.part_no || '';
//                                                         const partName = option.part_name || option.part_description || '';
//                                                         return `${partNo} - ${partName}`.trim();
//                                                     }}
//                                                     onChange={(event, newValue) => {
//                                                         if (newValue) {
//                                                             addApplicableItem(newValue);
//                                                         }
//                                                     }}
//                                                     renderInput={(params) => (
//                                                         <TextField
//                                                             {...params}
//                                                             size="small"
//                                                             placeholder="Search and select items..."
//                                                             sx={inputStyle}
//                                                             InputProps={{
//                                                                 ...params.InputProps,
//                                                                 startAdornment: (
//                                                                     <InputAdornment position="start">
//                                                                         <SearchIcon sx={{ fontSize: '0.9rem', color: COLORS.text.tertiary }} />
//                                                                     </InputAdornment>
//                                                                 ),
//                                                             }}
//                                                         />
//                                                     )}
//                                                     PaperComponent={CustomPaper}
//                                                     isOptionEqualToValue={(option, value) => option._id === value?._id}
//                                                 />
//                                             </Box>
//                                             <Button
//                                                 variant="outlined"
//                                                 size="small"
//                                                 onClick={() => setOpenAddItemModal(true)}
//                                                 startIcon={<AddIcon sx={{ fontSize: '0.875rem' }} />}
//                                                 sx={{
//                                                     height: 35,
//                                                     minWidth: 'auto',
//                                                     px: 1.5,
//                                                     borderRadius: 1.5,
//                                                     border: `1px solid ${COLORS.border}`,
//                                                     color: COLORS.text.secondary,
//                                                     fontSize: '0.7rem',
//                                                     fontWeight: 500,
//                                                     textTransform: 'none',
//                                                     whiteSpace: 'nowrap',
//                                                     '&:hover': {
//                                                         borderColor: COLORS.primary,
//                                                         bgcolor: `${COLORS.primary}10`,
//                                                         color: COLORS.primary
//                                                     }
//                                                 }}
//                                             >
//                                                 Add New
//                                             </Button>
//                                         </Box>
//                                         <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 1 }}>
//                                             {selectedItems.map((item) => (
//                                                 <Chip
//                                                     key={item._id}
//                                                     label={`${item.part_no || item.item_id} - ${item.part_name || item.part_description}`}
//                                                     onDelete={() => removeApplicableItem(item._id)}
//                                                     size="small"
//                                                     sx={{ bgcolor: COLORS.background.light, fontSize: '0.65rem', height: 28 }}
//                                                 />
//                                             ))}
//                                             {selectedItems.length === 0 && (
//                                                 <Typography sx={{ fontSize: '0.7rem', color: COLORS.text.tertiary, fontStyle: 'italic', mt: 1 }}>
//                                                     No items selected
//                                                 </Typography>
//                                             )}
//                                         </Box>
//                                     </Box>
//                                 </Grid>
//                             </Grid>
//                         </Paper>
//                     </Stack>
//                 );

//             case 1:
//                 return (
//                     <Stack spacing={2}>
//                         <Paper sx={{ p: 2, borderRadius: 1.5, border: `1px solid ${COLORS.border}` }}>
//                             <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color: COLORS.primary, mb: 1.5 }}>
//                                 <BuildIcon sx={{ fontSize: '1rem', mr: 0.5, verticalAlign: 'middle' }} />
//                                 Operations
//                             </Typography>

//                             {/* Line 1: SEQUENCE & PROCESS */}
//                             <Grid container spacing={1.5} sx={{ mb: 2 }}>
//                                 <Grid size={{ xs: 12, sm: 3 }}>
//                                     <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//                                         <Typography sx={labelStyle}>
//                                             SEQUENCE <span style={{ color: '#EF4444' }}>*</span>
//                                         </Typography>
//                                         <TextField
//                                             fullWidth
//                                             type="number"
//                                             size="small"
//                                             name="op_sequence"
//                                             value={currentOperation.op_sequence}
//                                             onChange={handleOperationChange}
//                                             placeholder="10, 20, 30..."
//                                             sx={inputStyle}
//                                         />
//                                     </Box>
//                                 </Grid>

//                                 <Grid size={{ xs: 12, sm: 9 }}>
//                                     <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//                                         <Typography sx={labelStyle}>
//                                             PROCESS <span style={{ color: '#EF4444' }}>*</span>
//                                         </Typography>
//                                         <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
//                                             <Box sx={{ flex: 1 }}>
//                                                 <FormControl fullWidth size="small">
//                                                     <Select
//                                                         value={currentOperation.operation_id}
//                                                         onChange={(e) => handleProcessSelect(e.target.value)}
//                                                         displayEmpty
//                                                         sx={{ borderRadius: 1.5, fontSize: '0.75rem' }}
//                                                     >
//                                                         <MenuItem value="" disabled>Select process</MenuItem>
//                                                         {processes.map((process) => (
//                                                             <MenuItem key={process._id} value={process._id} sx={{ fontSize: '0.75rem' }}>
//                                                                 {process.process_name} ({process.process_id})
//                                                             </MenuItem>
//                                                         ))}
//                                                     </Select>
//                                                 </FormControl>
//                                             </Box>
//                                             <Button
//                                                 variant="outlined"
//                                                 size="small"
//                                                 onClick={() => setOpenAddProcessModal(true)}
//                                                 startIcon={<AddIcon sx={{ fontSize: '0.875rem' }} />}
//                                                 sx={{
//                                                     height: 35,
//                                                     minWidth: 'auto',
//                                                     px: 1.5,
//                                                     borderRadius: 1.5,
//                                                     border: `1px solid ${COLORS.border}`,
//                                                     color: COLORS.text.secondary,
//                                                     fontSize: '0.7rem',
//                                                     fontWeight: 500,
//                                                     textTransform: 'none',
//                                                     whiteSpace: 'nowrap',
//                                                     '&:hover': {
//                                                         borderColor: COLORS.primary,
//                                                         bgcolor: `${COLORS.primary}10`,
//                                                         color: COLORS.primary
//                                                     }
//                                                 }}
//                                             >
//                                                 Add New
//                                             </Button>
//                                         </Box>
//                                     </Box>
//                                 </Grid>
//                             </Grid>

//                             {/* Line 2: WORK CENTRE & MACHINE */}
//                             <Grid container spacing={1.5} sx={{ mb: 2 }}>
//                                 <Grid size={{ xs: 12, sm: 6 }}>
//                                     <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//                                         <Typography sx={labelStyle}>MACHINE</Typography>
//                                         <FormControl fullWidth size="small">
//                                             <Select
//                                                 value={currentOperation.machine_id}
//                                                 onChange={(e) => handleMachineSelect(e.target.value)}
//                                                 name="machine_id"
//                                                 displayEmpty
//                                                 sx={{ borderRadius: 1.5, fontSize: '0.75rem' }}
//                                             >
//                                                 <MenuItem value="" disabled>Select machine (optional)</MenuItem>
//                                                 {machines.map((machine) => (
//                                                     <MenuItem key={machine._id} value={machine._id} sx={{ fontSize: '0.75rem' }}>
//                                                         {machine.machine_name} ({machine.machine_code})
//                                                     </MenuItem>
//                                                 ))}
//                                             </Select>
//                                         </FormControl>
//                                     </Box>
//                                 </Grid>

//                                 <Grid size={{ xs: 12, sm: 6 }}>
//                                     <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//                                         <Typography sx={labelStyle}>
//                                             WORK CENTRE <span style={{ color: '#EF4444' }}>*</span>
//                                         </Typography>
//                                         <TextField
//                                             fullWidth
//                                             size="small"
//                                             name="work_centre"
//                                             value={currentOperation.work_centre}
//                                             onChange={handleOperationChange}
//                                             placeholder="Enter work centre"
//                                             sx={inputStyle}
//                                             disabled
//                                         />
//                                     </Box>
//                                 </Grid>
//                             </Grid>

//                             {/* Line 3: SETUP TIME & RUN TIME */}
//                             <Grid container spacing={1.5} sx={{ mb: 2 }}>
//                                 <Grid size={{ xs: 12, sm: 6 }}>
//                                     <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//                                         <Typography sx={labelStyle}>
//                                             SETUP TIME (min) <span style={{ color: '#EF4444' }}>*</span>
//                                         </Typography>
//                                         <TextField
//                                             fullWidth
//                                             type="number"
//                                             size="small"
//                                             name="planned_setup_min"
//                                             value={currentOperation.planned_setup_min}
//                                             onChange={handleOperationChange}
//                                             placeholder="e.g., 15"
//                                             sx={inputStyle}
//                                         />
//                                     </Box>
//                                 </Grid>

//                                 <Grid size={{ xs: 12, sm: 6 }}>
//                                     <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//                                         <Typography sx={labelStyle}>
//                                             RUN TIME (min/unit) <span style={{ color: '#EF4444' }}>*</span>
//                                         </Typography>
//                                         <TextField
//                                             fullWidth
//                                             type="number"
//                                             size="small"
//                                             name="planned_run_min"
//                                             value={currentOperation.planned_run_min}
//                                             onChange={handleOperationChange}
//                                             placeholder="e.g., 2.5"
//                                             sx={inputStyle}
//                                         />
//                                     </Box>
//                                 </Grid>
//                             </Grid>

//                             {/* Line 4: SCRAP % & DESCRIPTION */}
//                             <Grid container spacing={1.5} sx={{ mb: 2 }}>
//                                 <Grid size={{ xs: 12, sm: 3 }}>
//                                     <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//                                         <Typography sx={labelStyle}>SCRAP %</Typography>
//                                         <TextField
//                                             fullWidth
//                                             type="number"
//                                             size="small"
//                                             name="scrap_pct"
//                                             value={currentOperation.scrap_pct}
//                                             onChange={handleOperationChange}
//                                             placeholder="0"
//                                             sx={inputStyle}
//                                         />
//                                     </Box>
//                                 </Grid>

//                                 <Grid size={{ xs: 12, sm: 9 }}>
//                                     <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//                                         <Typography sx={labelStyle}>DESCRIPTION</Typography>
//                                         <TextField
//                                             fullWidth
//                                             size="small"
//                                             name="description"
//                                             value={currentOperation.description}
//                                             onChange={handleOperationChange}
//                                             placeholder="Operation description"
//                                             sx={inputStyle}
//                                         />
//                                     </Box>
//                                 </Grid>
//                             </Grid>

//                             {/* Line 5: Quality Requirements - Torque Recording & Functional Test */}
//                             <Grid container spacing={1.5} sx={{ mb: 2 }}>
//                                 <Grid size={{ xs: 12, md: 6 }}>
//                                     <Paper sx={{ p: 1.5, bgcolor: COLORS.background.light, borderRadius: 1.5 }}>
//                                         <Stack spacing={1.5}>
//                                             <FormControlLabel
//                                                 control={
//                                                     <Switch
//                                                         checked={currentOperation.requires_torque_recording}
//                                                         onChange={handleOperationChange}
//                                                         name="requires_torque_recording"
//                                                         size="small"
//                                                         sx={{
//                                                             '& .MuiSwitch-switchBase.Mui-checked': {
//                                                                 color: COLORS.primary,
//                                                             },
//                                                             '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
//                                                                 backgroundColor: COLORS.primary,
//                                                             },
//                                                         }}
//                                                     />
//                                                 }
//                                                 label={
//                                                     <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
//                                                         <BoltIcon sx={{ fontSize: '0.9rem', color: COLORS.primary }} />
//                                                         <Typography sx={{ fontSize: '0.75rem', fontWeight: 500 }}>
//                                                             Requires Torque Recording
//                                                         </Typography>
//                                                     </Box>
//                                                 }
//                                             />

//                                             {currentOperation.requires_torque_recording && (
//                                                 <Box>
//                                                     <Typography sx={{ ...labelStyle, mb: 1 }}>
//                                                         EXPECTED JOINTS <span style={{ color: '#EF4444' }}>*</span>
//                                                     </Typography>
//                                                     <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mb: 1 }}>
//                                                         <TextField
//                                                             size="small"
//                                                             value={currentJoint}
//                                                             onChange={(e) => {
//                                                                 setCurrentJoint(e.target.value);
//                                                                 setJointError('');
//                                                             }}
//                                                             placeholder="e.g., Phase A, Phase B, Earth"
//                                                             error={!!jointError}
//                                                             helperText={jointError}
//                                                             sx={{ flex: 1, ...inputStyle }}
//                                                         />
//                                                         <Button
//                                                             variant="outlined"
//                                                             size="small"
//                                                             onClick={addJoint}
//                                                             startIcon={<AddIcon sx={{ fontSize: '0.8rem' }} />}
//                                                             sx={{ height: 35, px: 1.5, borderRadius: 1.5, fontSize: '0.7rem', textTransform: 'none' }}
//                                                         >
//                                                             Add
//                                                         </Button>
//                                                     </Box>
//                                                     <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
//                                                         {currentOperation.expected_joints.map((joint, idx) => (
//                                                             <Chip
//                                                                 key={idx}
//                                                                 label={joint}
//                                                                 onDelete={() => removeJoint(joint)}
//                                                                 size="small"
//                                                                 sx={{ bgcolor: COLORS.background.white, fontSize: '0.65rem', height: 26 }}
//                                                             />
//                                                         ))}
//                                                         {currentOperation.expected_joints.length === 0 && (
//                                                             <Typography sx={{ fontSize: '0.65rem', color: COLORS.text.tertiary, fontStyle: 'italic' }}>
//                                                                 No joints added. Add at least one joint for torque recording.
//                                                             </Typography>
//                                                         )}
//                                                     </Box>
//                                                 </Box>
//                                             )}
//                                         </Stack>
//                                     </Paper>
//                                 </Grid>

//                                 <Grid size={{ xs: 12, md: 6 }}>
//                                     <Paper sx={{ p: 1.5, bgcolor: COLORS.background.light, borderRadius: 1.5 }}>
//                                         <FormControlLabel
//                                             control={
//                                                 <Switch
//                                                     checked={currentOperation.requires_functional_test}
//                                                     onChange={handleOperationChange}
//                                                     name="requires_functional_test"
//                                                     size="small"
//                                                     sx={{
//                                                         '& .MuiSwitch-switchBase.Mui-checked': {
//                                                             color: COLORS.primary,
//                                                         },
//                                                         '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
//                                                             backgroundColor: COLORS.primary,
//                                                         },
//                                                     }}
//                                                 />
//                                             }
//                                             label={
//                                                 <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
//                                                     <ScienceIcon sx={{ fontSize: '0.9rem', color: COLORS.primary }} />
//                                                     <Typography sx={{ fontSize: '0.75rem', fontWeight: 500 }}>
//                                                         Requires Functional Test
//                                                     </Typography>
//                                                 </Box>
//                                             }
//                                         />
//                                     </Paper>
//                                 </Grid>
//                             </Grid>

//                             {/* Line 6: Is Subcontract (if yes Vendor) */}
//                             <Grid container spacing={1.5} sx={{ mb: 2 }}>
//                                 <Grid size={{ xs: 12 }}>
//                                     <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
//                                         <FormControlLabel
//                                             control={
//                                                 <Checkbox
//                                                     checked={currentOperation.is_subcontract}
//                                                     onChange={handleOperationChange}
//                                                     name="is_subcontract"
//                                                     size="small"
//                                                 />
//                                             }
//                                             label={<Typography sx={{ fontSize: '0.7rem' }}>Is Subcontract</Typography>}
//                                         />
//                                         {currentOperation.is_subcontract && (
//                                             <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start', flex: 1 }}>
//                                                 <Box sx={{ flex: 1 }}>
//                                                     <Autocomplete
//                                                         options={vendors}
//                                                         getOptionLabel={(option) => `${option.vendor_name} (${option.vendor_code})`}
//                                                         onChange={(event, newValue) => {
//                                                             setCurrentOperation(prev => ({
//                                                                 ...prev,
//                                                                 subcontract_vendor: newValue?._id || ''
//                                                             }));
//                                                         }}
//                                                         renderInput={(params) => (
//                                                             <TextField
//                                                                 {...params}
//                                                                 size="small"
//                                                                 placeholder="Select vendor"
//                                                                 sx={inputStyle}
//                                                             />
//                                                         )}
//                                                         PaperComponent={CustomPaper}
//                                                         isOptionEqualToValue={(option, value) => option._id === value?._id}
//                                                     />
//                                                 </Box>
//                                                 <Button
//                                                     variant="outlined"
//                                                     size="small"
//                                                     onClick={() => setOpenAddVendorModal(true)}
//                                                     startIcon={<AddIcon sx={{ fontSize: '0.875rem' }} />}
//                                                     sx={{
//                                                         height: 35,
//                                                         minWidth: 'auto',
//                                                         px: 1.5,
//                                                         borderRadius: 1.5,
//                                                         border: `1px solid ${COLORS.border}`,
//                                                         color: COLORS.text.secondary,
//                                                         fontSize: '0.7rem',
//                                                         fontWeight: 500,
//                                                         textTransform: 'none',
//                                                         whiteSpace: 'nowrap',
//                                                         '&:hover': {
//                                                             borderColor: COLORS.primary,
//                                                             bgcolor: `${COLORS.primary}10`,
//                                                             color: COLORS.primary
//                                                         }
//                                                     }}
//                                                 >
//                                                     Add New
//                                                 </Button>
//                                             </Box>
//                                         )}
//                                     </Box>
//                                 </Grid>
//                             </Grid>

//                             {/* Add Operation Button */}
//                             <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
//                                 <Button
//                                     variant="contained"
//                                     onClick={addOperation}
//                                     startIcon={<AddIcon sx={{ fontSize: '1rem' }} />}
//                                     sx={{ height: 36, px: 3, borderRadius: 1.5, fontSize: '0.75rem', textTransform: 'none' }}
//                                 >
//                                     Add Operation
//                                 </Button>
//                             </Box>

//                             {/* Operations Table */}
//                             {formData.operations.length > 0 && (
//                                 <TableContainer component={Paper} sx={{ mt: 3, borderRadius: 1.5, border: `1px solid ${COLORS.border}` }}>
//                                     <Table size="small">
//                                         <TableHead>
//                                             <TableRow sx={{ bgcolor: COLORS.background.light }}>
//                                                 <TableCell sx={{ fontWeight: 600, fontSize: '0.7rem' }}>Seq</TableCell>
//                                                 <TableCell sx={{ fontWeight: 600, fontSize: '0.7rem' }}>Operation</TableCell>
//                                                 <TableCell sx={{ fontWeight: 600, fontSize: '0.7rem' }}>Work Centre</TableCell>
//                                                 <TableCell sx={{ fontWeight: 600, fontSize: '0.7rem' }}>Machine</TableCell>
//                                                 <TableCell sx={{ fontWeight: 600, fontSize: '0.7rem' }}>Setup</TableCell>
//                                                 <TableCell sx={{ fontWeight: 600, fontSize: '0.7rem' }}>Run</TableCell>
//                                                 <TableCell sx={{ fontWeight: 600, fontSize: '0.7rem' }}>Torque</TableCell>
//                                                 <TableCell sx={{ fontWeight: 600, fontSize: '0.7rem' }}>Test</TableCell>
//                                                 <TableCell sx={{ fontWeight: 600, fontSize: '0.7rem', width: 50 }}>Actions</TableCell>
//                                             </TableRow>
//                                         </TableHead>
//                                         <TableBody>
//                                             {formData.operations.map((op, index) => (
//                                                 <TableRow key={index}>
//                                                     <TableCell sx={{ fontSize: '0.7rem' }}>{op.op_sequence}</TableCell>
//                                                     <TableCell sx={{ fontSize: '0.7rem' }}>{op.operation_name}</TableCell>
//                                                     <TableCell sx={{ fontSize: '0.7rem' }}>{op.work_centre || '-'}</TableCell>
//                                                     <TableCell sx={{ fontSize: '0.7rem' }}>
//                                                         {machines.find(m => m._id === op.machine_id)?.machine_name || '-'}
//                                                     </TableCell>
//                                                     <TableCell sx={{ fontSize: '0.7rem' }}>{op.planned_setup_min}</TableCell>
//                                                     <TableCell sx={{ fontSize: '0.7rem' }}>{op.planned_run_min}</TableCell>
//                                                     <TableCell sx={{ fontSize: '0.7rem' }}>
//                                                         {op.requires_torque_recording ? (
//                                                             <Chip 
//                                                                 label="Yes" 
//                                                                 size="small" 
//                                                                 sx={{ fontSize: '0.6rem', height: 20, bgcolor: COLORS.primary, color: '#fff' }} 
//                                                             />
//                                                         ) : '-'}
//                                                     </TableCell>
//                                                     <TableCell sx={{ fontSize: '0.7rem' }}>
//                                                         {op.requires_functional_test ? (
//                                                             <Chip 
//                                                                 label="Yes" 
//                                                                 size="small" 
//                                                                 sx={{ fontSize: '0.6rem', height: 20, bgcolor: COLORS.success, color: '#fff' }} 
//                                                             />
//                                                         ) : '-'}
//                                                     </TableCell>
//                                                     <TableCell>
//                                                         <IconButton size="small" onClick={() => removeOperation(index)} sx={{ color: COLORS.error }}>
//                                                             <DeleteIcon fontSize="small" />
//                                                         </IconButton>
//                                                     </TableCell>
//                                                 </TableRow>
//                                             ))}
//                                         </TableBody>
//                                     </Table>
//                                 </TableContainer>
//                             )}

//                             {fieldErrors.operations && (
//                                 <Typography sx={{ fontSize: '0.65rem', color: '#EF4444', mt: 1 }}>
//                                     {fieldErrors.operations}
//                                 </Typography>
//                             )}
//                         </Paper>
//                     </Stack>
//                 );

//             case 2:
//                 const totalOperations = formData.operations.length;
//                 const totalSetupTime = formData.operations.reduce((sum, op) => sum + (op.planned_setup_min || 0), 0);
//                 const totalRunTime = formData.operations.reduce((sum, op) => sum + (op.planned_run_min || 0), 0);
//                 const torqueOps = formData.operations.filter(op => op.requires_torque_recording).length;
//                 const testOps = formData.operations.filter(op => op.requires_functional_test).length;

//                 return (
//                     <Stack spacing={2}>
//                         <Paper sx={{ p: 2, borderRadius: 1.5, border: `1px solid ${COLORS.border}` }}>
//                             <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color: COLORS.primary, mb: 1.5 }}>
//                                 <InfoIcon sx={{ fontSize: '1rem', mr: 0.5, verticalAlign: 'middle' }} />
//                                 Review & Submit
//                             </Typography>

//                             <Stack spacing={2}>
//                                 <Paper sx={{ p: 2, bgcolor: COLORS.background.light, borderRadius: 1.5 }}>
//                                     <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: COLORS.primary, mb: 1 }}>
//                                         Basic Information
//                                     </Typography>
//                                     <Grid container spacing={1}>
//                                         <Grid size={{ xs: 6 }}>
//                                             <Typography sx={{ fontSize: '0.7rem', color: COLORS.text.secondary }}>Routing Name:</Typography>
//                                         </Grid>
//                                         <Grid size={{ xs: 6 }}>
//                                             <Typography sx={{ fontSize: '0.7rem', fontWeight: 500 }}>{formData.routing_name}</Typography>
//                                         </Grid>
//                                         <Grid size={{ xs: 6 }}>
//                                             <Typography sx={{ fontSize: '0.7rem', color: COLORS.text.secondary }}>Routing Type:</Typography>
//                                         </Grid>
//                                         <Grid size={{ xs: 6 }}>
//                                             <Typography sx={{ fontSize: '0.7rem', fontWeight: 500 }}>{formData.routing_type}</Typography>
//                                         </Grid>
//                                         <Grid size={{ xs: 6 }}>
//                                             <Typography sx={{ fontSize: '0.7rem', color: COLORS.text.secondary }}>Version:</Typography>
//                                         </Grid>
//                                         <Grid size={{ xs: 6 }}>
//                                             <Typography sx={{ fontSize: '0.7rem', fontWeight: 500 }}>{formData.version}</Typography>
//                                         </Grid>
//                                         <Grid size={{ xs: 6 }}>
//                                             <Typography sx={{ fontSize: '0.7rem', color: COLORS.text.secondary }}>Applicable Items:</Typography>
//                                         </Grid>
//                                         <Grid size={{ xs: 6 }}>
//                                             <Typography sx={{ fontSize: '0.7rem', fontWeight: 500 }}>
//                                                 {selectedItems.map(item => item.part_no || item.item_id).join(', ') || '-'}
//                                             </Typography>
//                                         </Grid>
//                                     </Grid>
//                                 </Paper>

//                                 <Paper sx={{ p: 2, bgcolor: COLORS.background.light, borderRadius: 1.5 }}>
//                                     <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: COLORS.primary, mb: 1 }}>
//                                         Operations Summary
//                                     </Typography>
//                                     <Grid container spacing={1}>
//                                         <Grid size={{ xs: 6 }}>
//                                             <Typography sx={{ fontSize: '0.7rem', color: COLORS.text.secondary }}>Total Operations:</Typography>
//                                         </Grid>
//                                         <Grid size={{ xs: 6 }}>
//                                             <Typography sx={{ fontSize: '0.7rem', fontWeight: 500, color: '#059669' }}>{totalOperations}</Typography>
//                                         </Grid>
//                                         <Grid size={{ xs: 6 }}>
//                                             <Typography sx={{ fontSize: '0.7rem', color: COLORS.text.secondary }}>Total Setup Time:</Typography>
//                                         </Grid>
//                                         <Grid size={{ xs: 6 }}>
//                                             <Typography sx={{ fontSize: '0.7rem', fontWeight: 500 }}>{totalSetupTime} min</Typography>
//                                         </Grid>
//                                         <Grid size={{ xs: 6 }}>
//                                             <Typography sx={{ fontSize: '0.7rem', color: COLORS.text.secondary }}>Total Run Time:</Typography>
//                                         </Grid>
//                                         <Grid size={{ xs: 6 }}>
//                                             <Typography sx={{ fontSize: '0.7rem', fontWeight: 500 }}>{totalRunTime} min/unit</Typography>
//                                         </Grid>
//                                         <Grid size={{ xs: 6 }}>
//                                             <Typography sx={{ fontSize: '0.7rem', color: COLORS.text.secondary }}>Torque Recording Ops:</Typography>
//                                         </Grid>
//                                         <Grid size={{ xs: 6 }}>
//                                             <Typography sx={{ fontSize: '0.7rem', fontWeight: 500 }}>{torqueOps}</Typography>
//                                         </Grid>
//                                         <Grid size={{ xs: 6 }}>
//                                             <Typography sx={{ fontSize: '0.7rem', color: COLORS.text.secondary }}>Functional Test Ops:</Typography>
//                                         </Grid>
//                                         <Grid size={{ xs: 6 }}>
//                                             <Typography sx={{ fontSize: '0.7rem', fontWeight: 500 }}>{testOps}</Typography>
//                                         </Grid>
//                                     </Grid>
//                                 </Paper>

//                                 {formData.operations.length > 0 && (
//                                     <Paper sx={{ p: 2, bgcolor: COLORS.background.light, borderRadius: 1.5 }}>
//                                         <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: COLORS.primary, mb: 1 }}>
//                                             Operation Details
//                                         </Typography>
//                                         <TableContainer>
//                                             <Table size="small">
//                                                 <TableHead>
//                                                     <TableRow>
//                                                         <TableCell sx={{ fontSize: '0.7rem', fontWeight: 600 }}>Seq</TableCell>
//                                                         <TableCell sx={{ fontSize: '0.7rem', fontWeight: 600 }}>Operation</TableCell>
//                                                         <TableCell sx={{ fontSize: '0.7rem', fontWeight: 600 }}>Setup</TableCell>
//                                                         <TableCell sx={{ fontSize: '0.7rem', fontWeight: 600 }}>Run</TableCell>
//                                                         <TableCell sx={{ fontSize: '0.7rem', fontWeight: 600 }}>Torque</TableCell>
//                                                         <TableCell sx={{ fontSize: '0.7rem', fontWeight: 600 }}>Test</TableCell>
//                                                     </TableRow>
//                                                 </TableHead>
//                                                 <TableBody>
//                                                     {formData.operations.map((op, index) => (
//                                                         <TableRow key={index}>
//                                                             <TableCell sx={{ fontSize: '0.7rem' }}>{op.op_sequence}</TableCell>
//                                                             <TableCell sx={{ fontSize: '0.7rem' }}>{op.operation_name}</TableCell>
//                                                             <TableCell sx={{ fontSize: '0.7rem' }}>{op.planned_setup_min} min</TableCell>
//                                                             <TableCell sx={{ fontSize: '0.7rem' }}>{op.planned_run_min} min</TableCell>
//                                                             <TableCell sx={{ fontSize: '0.7rem' }}>{op.requires_torque_recording ? 'Yes' : '-'}</TableCell>
//                                                             <TableCell sx={{ fontSize: '0.7rem' }}>{op.requires_functional_test ? 'Yes' : '-'}</TableCell>
//                                                         </TableRow>
//                                                     ))}
//                                                 </TableBody>
//                                             </Table>
//                                         </TableContainer>
//                                     </Paper>
//                                 )}
//                             </Stack>
//                         </Paper>
//                     </Stack>
//                 );

//             default:
//                 return null;
//         }
//     };

//     return (
//         <Dialog
//             open={open}
//             onClose={handleClose}
//             maxWidth="md"
//             fullWidth
//             PaperProps={{
//                 sx: {
//                     borderRadius: 2,
//                     boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05)',
//                     border: `1px solid ${COLORS.border}`,
//                     overflow: 'hidden'
//                 }
//             }}
//         >
//             <DialogTitle sx={{
//                 borderBottom: `1px solid ${COLORS.border}`,
//                 py: 1.5,
//                 px: 2.5,
//                 bgcolor: COLORS.background.white,
//                 display: 'flex',
//                 justifyContent: 'space-between',
//                 alignItems: 'center'
//             }}>
//                 <Typography sx={{ fontSize: '1.2rem', fontWeight: 700, color: COLORS.text.primary }}>
//                     Create New Routing
//                 </Typography>
//                 <IconButton onClick={handleClose} size="small">
//                     <CloseIcon fontSize="small" />
//                 </IconButton>
//             </DialogTitle>

//             <Box sx={{ px: 2.5, pt: 2, bgcolor: COLORS.background.white }}>
//                 <Stepper activeStep={activeStep} alternativeLabel connector={<ColorConnector />}>
//                     {steps.map((label) => (
//                         <Step key={label}>
//                             <StepLabel>
//                                 <Typography sx={{ fontSize: '0.75rem', fontWeight: 500, color: COLORS.text.secondary }}>
//                                     {label}
//                                 </Typography>
//                             </StepLabel>
//                         </Step>
//                     ))}
//                 </Stepper>
//             </Box>

//             <DialogContent sx={{ p: 2.5, bgcolor: COLORS.background.white }}>
//                 {renderStepContent(activeStep)}
//                 {error && (
//                     <Alert severity="error" sx={{ mt: 2, borderRadius: 1.5, fontSize: '0.75rem' }}>
//                         {error}
//                     </Alert>
//                 )}
//             </DialogContent>

//             <DialogActions sx={{
//                 px: 2.5,
//                 py: 1.5,
//                 borderTop: `1px solid ${COLORS.border}`,
//                 bgcolor: COLORS.background.white,
//                 justifyContent: 'space-between'
//             }}>
//                 <Button
//                     onClick={handleBack}
//                     disabled={activeStep === 0 || loading}
//                     size="small"
//                     startIcon={<NavigateBeforeIcon sx={{ fontSize: '1rem' }} />}
//                     sx={{
//                         height: 32,
//                         px: 2,
//                         borderRadius: 1.5,
//                         border: `1px solid ${COLORS.border}`,
//                         color: COLORS.text.secondary,
//                         fontSize: '0.7rem',
//                         fontWeight: 500,
//                         textTransform: 'none'
//                     }}
//                 >
//                     Back
//                 </Button>
//                 <Box>
//                     <Button
//                         onClick={handleClose}
//                         disabled={loading}
//                         size="small"
//                         sx={{
//                             height: 32,
//                             px: 2,
//                             mr: 1,
//                             borderRadius: 1.5,
//                             border: `1px solid ${COLORS.border}`,
//                             color: COLORS.text.secondary,
//                             fontSize: '0.7rem',
//                             fontWeight: 500,
//                             textTransform: 'none'
//                         }}
//                     >
//                         Cancel
//                     </Button>
//                     {activeStep === steps.length - 1 ? (
//                         <Button
//                             variant="contained"
//                             onClick={handleSubmit}
//                             disabled={loading}
//                             size="small"
//                             startIcon={<AddIcon sx={{ fontSize: '1rem' }} />}
//                             sx={{
//                                 height: 32,
//                                 px: 2,
//                                 borderRadius: 1.5,
//                                 bgcolor: COLORS.primary,
//                                 fontSize: '0.7rem',
//                                 fontWeight: 500,
//                                 textTransform: 'none',
//                                 '&:hover': { bgcolor: COLORS.primaryDark }
//                             }}
//                         >
//                             {loading ? 'Creating...' : 'Create Routing'}
//                         </Button>
//                     ) : (
//                         <Button
//                             variant="contained"
//                             onClick={handleNext}
//                             disabled={loading}
//                             size="small"
//                             endIcon={<NavigateNextIcon sx={{ fontSize: '1rem' }} />}
//                             sx={{
//                                 height: 32,
//                                 px: 2,
//                                 borderRadius: 1.5,
//                                 bgcolor: COLORS.primary,
//                                 fontSize: '0.7rem',
//                                 fontWeight: 500,
//                                 textTransform: 'none',
//                                 '&:hover': { bgcolor: COLORS.primaryDark }
//                             }}
//                         >
//                             Next
//                         </Button>
//                     )}
//                 </Box>
//             </DialogActions>

//             {/* Add Item Modal */}
//             <AddItem
//                 open={openAddItemModal}
//                 onClose={() => setOpenAddItemModal(false)}
//                 onAdd={handleItemAdded}
//             />

//             {/* Add Machine Modal */}
//             <AddMachine
//                 open={openAddMachineModal}
//                 onClose={() => setOpenAddMachineModal(false)}
//                 onAdd={handleMachineAdded}
//             />

//             {/* Add Vendor Modal */}
//             <AddVendor
//                 open={openAddVendorModal}
//                 onClose={() => setOpenAddVendorModal(false)}
//                 onAdd={handleVendorAdded}
//             />

//             {/* Add Process Modal */}
//             <AddProcess
//                 open={openAddProcessModal}
//                 onClose={() => setOpenAddProcessModal(false)}
//                 onAdd={handleProcessAdded}
//             />
//         </Dialog>
//     );
// };

// export default AddRouting;



import React, { useState, useEffect } from 'react';
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
    FormControl,
    InputLabel,
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
    Chip,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Tooltip,
    Autocomplete,
    InputAdornment,
    FormControlLabel,
    Checkbox,
    Switch
} from '@mui/material';
import {
    Add as AddIcon,
    Close as CloseIcon,
    Route as RouteIcon,
    Build as BuildIcon,
    Info as InfoIcon,
    NavigateNext as NavigateNextIcon,
    NavigateBefore as NavigateBeforeIcon,
    Delete as DeleteIcon,
    Search as SearchIcon,
    Science as ScienceIcon,
    CheckCircle as CheckCircleIcon,
    Bolt as BoltIcon
} from '@mui/icons-material';
import axios from 'axios';
import BASE_URL from '../../../config/Config';

import AddVendor from '../../master/vendormaster/AddVendor';
import AddMachine from '../machinemaster/AddMachine';

const COLORS = {
    primary: '#063C3F',
    primaryDark: '#05292B',
    success: '#2E7D32',
    warning: '#ED6C02',
    error: '#D32F2F',
    border: '#E3E8EF',
    text: {
        primary: '#151C26',
        secondary: '#4B5568',
        tertiary: '#94A3B8'
    },
    background: {
        light: '#F8FFFC',
        white: '#FFFFFF'
    }
};

const steps = ['Basic Information', 'Operations', 'Review & Submit'];
const ITEM_STEPS = ['Basic Info', 'Material & Drawing', 'Process Details', 'Rate & Tax'];

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

const CustomPaper = styled(Paper)({
    maxHeight: 200,
    overflow: 'auto',
    '&::-webkit-scrollbar': {
        display: 'none'
    },
    scrollbarWidth: 'none',
    msOverflowStyle: 'none',
});

const AddRouting = ({ open, onClose, onAdd }) => {
    const [activeStep, setActiveStep] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [fieldErrors, setFieldErrors] = useState({});
    const [processes, setProcesses] = useState([]);
    const [machines, setMachines] = useState([]);
    const [items, setItems] = useState([]);
    const [fetchingData, setFetchingData] = useState(false);

    // Modals (only kept as popups: Machine, Vendor)
    const [openAddMachineModal, setOpenAddMachineModal] = useState(false);
    const [openAddVendorModal, setOpenAddVendorModal] = useState(false);

    const [vendors, setVendors] = useState([]);

    // --- Inline Add Item form with 4-step stepper ---
    const [showAddItemForm, setShowAddItemForm] = useState(false);
    const [itemStepper, setItemStepper] = useState(0);
    const [itemFormData, setItemFormData] = useState({
        // Basic Info
        part_no: '',
        part_name: '',
        item_category: '',
        item_type: '',
        sale_unit: 'Nos',
        part_description: '',
        weight_per_unit_kg: '',
        // Material & Drawing
        material: '',
        material_grade: '',
        material_standard: '',
        material_color: '',
        density: '',
        unit: 'Kg',
        drawing_no: '',
        drawing_revision: '',
        // Process Details
        process_type: '',
        process_description: '',
        machine_type: '',
        cycle_time: '',
        setup_time: '',
        // Rate & Tax
        unit_price: '',
        tax_rate: '',
        hsn_code: '',
        min_order_quantity: '',
        lead_time: ''
    });
    const [itemFieldErrors, setItemFieldErrors] = useState({});
    const [itemTouched, setItemTouched] = useState({});
    const [addItemLoading, setAddItemLoading] = useState(false);
    const [addItemError, setAddItemError] = useState('');

    // Options for item fields
    const itemCategoryOptions = ['Raw Material', 'Semi-Finished', 'Finished', 'Spare Part'];
    const itemTypeOptions = ['Busbar', 'Stamping', 'Gasket', 'Tooling', 'Copper Strip', 'Aluminium Profile', 'Rubber Sheet', 'Cork', 'Other'];
    const materialOptions = ['Steel', 'Copper', 'Aluminium', 'Brass', 'Stainless Steel', 'Plastic', 'Other'];
    const unitOptions = ['Nos', 'Kg', 'Meter', 'Set', 'Piece', 'Sheet', 'Roll'];
    const processTypeOptions = ['Machining', 'Fabrication', 'Assembly', 'Heat Treatment', 'Plating', 'Welding', 'Other'];
    const machineTypeOptions = ['CNC', 'VMC', 'Lathe', 'Milling', 'Drilling', 'Grinding', 'Welding Machine', 'Other'];

    // --- Validation functions for item form ---
    const validateItemField = (name, value) => {
        switch (name) {
            case 'part_no':
                if (!value?.trim()) return 'Part Number is required';
                if (value.length > 50) return 'Part Number should not exceed 50 characters';
                return '';
            case 'part_name':
                if (!value?.trim()) return 'Part Name is required';
                if (value.length > 100) return 'Part Name should not exceed 100 characters';
                return '';
            case 'item_category':
                if (!value) return 'Item Category is required';
                return '';
            case 'item_type':
                if (!value) return 'Item Type is required';
                return '';
            case 'sale_unit':
                if (!value) return 'Sale Unit is required';
                return '';
            case 'part_description':
                if (value && value.length > 200) return 'Description should not exceed 200 characters';
                return '';
            case 'material':
                if (!value) return 'Material is required';
                return '';
            case 'density':
                if (value && (isNaN(value) || parseFloat(value) <= 0)) return 'Density must be a positive number';
                return '';
            case 'unit':
                if (!value) return 'Unit is required';
                return '';
            case 'weight_per_unit_kg':
                if (value && (isNaN(value) || parseFloat(value) <= 0)) return 'Weight must be a positive number';
                return '';
            case 'material_grade':
                if (!value) return 'Material Grade is required';
                return '';
            case 'drawing_no':
                if (!value) return 'Drawing No is required';
                return '';
            case 'process_type':
                if (!value) return 'Process Type is required';
                return '';
            case 'cycle_time':
                if (value && (isNaN(value) || parseFloat(value) < 0)) return 'Cycle time must be non-negative';
                return '';
            case 'unit_price':
                if (value && (isNaN(value) || parseFloat(value) < 0)) return 'Unit price must be non-negative';
                return '';
            case 'hsn_code':
                if (!value) return 'HSN Code is required';
                return '';
            default:
                return '';
        }
    };

    const validateItemForm = () => {
        const errors = {};
        let isValid = true;
        // Required fields across all steps
        const required = ['part_no', 'part_name', 'item_category', 'item_type', 'sale_unit', 'material', 'unit', 'material_grade', 'drawing_no', 'process_type', 'hsn_code'];
        required.forEach(field => {
            const error = validateItemField(field, itemFormData[field]);
            if (error) {
                errors[field] = error;
                isValid = false;
            }
        });
        // Optional fields that need validation if provided
        ['density', 'weight_per_unit_kg', 'cycle_time', 'unit_price'].forEach(field => {
            if (itemFormData[field]) {
                const error = validateItemField(field, itemFormData[field]);
                if (error) {
                    errors[field] = error;
                    isValid = false;
                }
            }
        });
        setItemFieldErrors(errors);
        if (!isValid) {
            setAddItemError('Please fix the errors above');
        }
        return isValid;
    };

    // --- Inline item form handlers ---
    const handleItemFormChange = (e) => {
        const { name, value } = e.target;
        setItemFieldErrors(prev => ({ ...prev, [name]: '' }));
        // Numeric handling for specific fields
        const numericFields = ['density', 'weight_per_unit_kg', 'cycle_time', 'setup_time', 'unit_price', 'tax_rate', 'min_order_quantity', 'lead_time'];
        if (numericFields.includes(name)) {
            if (value === '' || /^\d*\.?\d*$/.test(value)) {
                setItemFormData(prev => ({ ...prev, [name]: value }));
            }
        } else {
            setItemFormData(prev => ({ ...prev, [name]: value }));
        }
        if (itemTouched[name] || value) {
            const error = validateItemField(name, value);
            setItemFieldErrors(prev => ({ ...prev, [name]: error }));
        }
    };

    const handleItemBlur = (e) => {
        const { name, value } = e.target;
        setItemTouched(prev => ({ ...prev, [name]: true }));
        const error = validateItemField(name, value);
        setItemFieldErrors(prev => ({ ...prev, [name]: error }));
    };

    const resetItemForm = () => {
        setItemFormData({
            part_no: '',
            part_name: '',
            item_category: '',
            item_type: '',
            sale_unit: 'Nos',
            part_description: '',
            weight_per_unit_kg: '',
            material: '',
            material_grade: '',
            material_standard: '',
            material_color: '',
            density: '',
            unit: 'Kg',
            drawing_no: '',
            drawing_revision: '',
            process_type: '',
            process_description: '',
            machine_type: '',
            cycle_time: '',
            setup_time: '',
            unit_price: '',
            tax_rate: '',
            hsn_code: '',
            min_order_quantity: '',
            lead_time: ''
        });
        setItemFieldErrors({});
        setItemTouched({});
        setAddItemError('');
        setItemStepper(0);
    };

    const handleAddItemSubmit = async () => {
        if (!validateItemForm()) return;
        setAddItemLoading(true);
        setAddItemError('');

        try {
            const token = localStorage.getItem('token');
            const payload = {
                part_no: itemFormData.part_no,
                part_name: itemFormData.part_name,
                part_description: itemFormData.part_description || '',
                item_category: itemFormData.item_category,
                item_type: itemFormData.item_type,
                sale_unit: itemFormData.sale_unit,
                material: itemFormData.material,
                material_grade: itemFormData.material_grade,
                material_standard: itemFormData.material_standard || '',
                material_color: itemFormData.material_color || '',
                density: itemFormData.density ? parseFloat(itemFormData.density) : null,
                unit: itemFormData.unit,
                weight_per_unit_kg: itemFormData.weight_per_unit_kg ? parseFloat(itemFormData.weight_per_unit_kg) : null,
                drawing_no: itemFormData.drawing_no || '',
                drawing_revision: itemFormData.drawing_revision || '',
                process_type: itemFormData.process_type || '',
                process_description: itemFormData.process_description || '',
                machine_type: itemFormData.machine_type || '',
                cycle_time: itemFormData.cycle_time ? parseFloat(itemFormData.cycle_time) : 0,
                setup_time: itemFormData.setup_time ? parseFloat(itemFormData.setup_time) : 0,
                unit_price: itemFormData.unit_price ? parseFloat(itemFormData.unit_price) : 0,
                tax_rate: itemFormData.tax_rate ? parseFloat(itemFormData.tax_rate) : 0,
                hsn_code: itemFormData.hsn_code || '',
                min_order_quantity: itemFormData.min_order_quantity ? parseFloat(itemFormData.min_order_quantity) : 0,
                lead_time: itemFormData.lead_time ? parseFloat(itemFormData.lead_time) : 0,
                item_role: 'parent'
            };
            // Remove empty values
            Object.keys(payload).forEach(key => {
                if (payload[key] === null || payload[key] === '' || payload[key] === undefined) {
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
                setItems(prev => [...prev, newItem]);
                addApplicableItem(newItem);
                setShowAddItemForm(false);
                resetItemForm();
            } else {
                setAddItemError(response.data.message || 'Failed to add item');
            }
        } catch (err) {
            console.error('Error adding item:', err);
            setAddItemError(err.response?.data?.message || 'Failed to add item. Please try again.');
        } finally {
            setAddItemLoading(false);
        }
    };

    // --- Inline process form (unchanged) ---
    const [showAddProcessForm, setShowAddProcessForm] = useState(false);
    const [processFormData, setProcessFormData] = useState({
        process_id: '',
        process_name: '',
        category: '',
        rate_type: '',
        work_centre: '',
        setup_time_min: '',
        cycle_time_min: '',
        description: '',
        is_subcontract: false,
        subcontract_process: false
    });
    const [processFieldErrors, setProcessFieldErrors] = useState({});
    const [processTouched, setProcessTouched] = useState({});
    const [addProcessLoading, setAddProcessLoading] = useState(false);
    const [addProcessError, setAddProcessError] = useState('');

    const categoryOptions = ['Core', 'Support', 'Internal', 'External'];
    const rateTypeOptions = ['Per Hour', 'Per Piece', 'Per Minute'];

    const validateProcessField = (name, value) => {
        switch (name) {
            case 'process_id':
                if (!value?.trim()) return 'Process ID is required';
                if (value.length > 50) return 'Process ID should not exceed 50 characters';
                return '';
            case 'process_name':
                if (!value?.trim()) return 'Process Name is required';
                if (value.length > 100) return 'Process Name should not exceed 100 characters';
                return '';
            case 'category':
                if (!value) return 'Category is required';
                return '';
            case 'rate_type':
                if (!value) return 'Rate Type is required';
                return '';
            case 'work_centre':
                if (!value?.trim()) return 'Work Centre is required';
                return '';
            case 'setup_time_min':
                if (value && (isNaN(value) || parseFloat(value) < 0)) return 'Setup time must be non-negative';
                return '';
            case 'cycle_time_min':
                if (value && (isNaN(value) || parseFloat(value) < 0)) return 'Cycle time must be non-negative';
                return '';
            case 'description':
                if (value && value.length > 500) return 'Description should not exceed 500 characters';
                return '';
            default:
                return '';
        }
    };

    const validateProcessForm = () => {
        const errors = {};
        let isValid = true;
        const required = ['process_id', 'process_name', 'category', 'rate_type', 'work_centre'];
        required.forEach(field => {
            const error = validateProcessField(field, processFormData[field]);
            if (error) {
                errors[field] = error;
                isValid = false;
            }
        });
        ['setup_time_min', 'cycle_time_min', 'description'].forEach(field => {
            const error = validateProcessField(field, processFormData[field]);
            if (error) {
                errors[field] = error;
                isValid = false;
            }
        });
        setProcessFieldErrors(errors);
        if (!isValid) {
            setAddProcessError('Please fix the errors above');
        }
        return isValid;
    };

    const handleProcessFormChange = (e) => {
        const { name, value } = e.target;
        setProcessFieldErrors(prev => ({ ...prev, [name]: '' }));
        if (name === 'setup_time_min' || name === 'cycle_time_min') {
            if (value === '' || /^\d*\.?\d*$/.test(value)) {
                setProcessFormData(prev => ({ ...prev, [name]: value }));
            }
        } else {
            setProcessFormData(prev => ({ ...prev, [name]: value }));
        }
        if (processTouched[name] || value) {
            const error = validateProcessField(name, value);
            setProcessFieldErrors(prev => ({ ...prev, [name]: error }));
        }
    };

    const handleProcessBlur = (e) => {
        const { name, value } = e.target;
        setProcessTouched(prev => ({ ...prev, [name]: true }));
        const error = validateProcessField(name, value);
        setProcessFieldErrors(prev => ({ ...prev, [name]: error }));
    };

    const resetProcessForm = () => {
        setProcessFormData({
            process_id: '',
            process_name: '',
            category: '',
            rate_type: '',
            work_centre: '',
            setup_time_min: '',
            cycle_time_min: '',
            description: '',
            is_subcontract: false,
            subcontract_process: false
        });
        setProcessFieldErrors({});
        setProcessTouched({});
        setAddProcessError('');
    };

    const handleAddProcessSubmit = async () => {
        if (!validateProcessForm()) return;
        setAddProcessLoading(true);
        setAddProcessError('');

        try {
            const token = localStorage.getItem('token');
            const payload = {
                process_id: processFormData.process_id,
                process_name: processFormData.process_name,
                category: processFormData.category,
                rate_type: processFormData.rate_type,
                work_centre: processFormData.work_centre,
                setup_time_min: processFormData.setup_time_min ? parseFloat(processFormData.setup_time_min) : 0,
                cycle_time_min: processFormData.cycle_time_min ? parseFloat(processFormData.cycle_time_min) : 0,
                description: processFormData.description || '',
                is_subcontract: processFormData.is_subcontract || false,
                subcontract_process: processFormData.subcontract_process || false
            };
            Object.keys(payload).forEach(key => {
                if (payload[key] === null || payload[key] === '' || payload[key] === undefined) {
                    delete payload[key];
                }
            });

            const response = await axios.post(`${BASE_URL}/api/processes`, payload, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.data.success) {
                const newProcess = response.data.data;
                setProcesses(prev => [...prev, newProcess]);
                setCurrentOperation(prev => ({
                    ...prev,
                    operation_id: newProcess._id,
                    operation_name: newProcess.process_name,
                    work_centre: newProcess.work_centre || ''
                }));
                setShowAddProcessForm(false);
                resetProcessForm();
            } else {
                setAddProcessError(response.data.message || 'Failed to add process');
            }
        } catch (err) {
            console.error('Error adding process:', err);
            setAddProcessError(err.response?.data?.message || 'Failed to add process. Please try again.');
        } finally {
            setAddProcessLoading(false);
        }
    };

    const [currentJoint, setCurrentJoint] = useState('');
    const [jointError, setJointError] = useState('');

    const fetchVendors = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${BASE_URL}/api/vendors`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.data.success) {
                setVendors(response.data.data || []);
            }
        } catch (err) {
            console.error('Error fetching vendors:', err);
        }
    };

    useEffect(() => {
        if (open) {
            fetchProcesses();
            fetchMachines();
            fetchItems();
            fetchVendors();
        }
    }, [open]);

    const [formData, setFormData] = useState({
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

    const [selectedItems, setSelectedItems] = useState([]);

    const ROUTING_TYPE_OPTIONS = [
        'Stamping',
        'Busbar',
        'Gasket',
        'Assembly',
        'Toolroom',
        'General'
    ];

    const fetchProcesses = async () => {
        setFetchingData(true);
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${BASE_URL}/api/processes`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.data.success) {
                setProcesses(response.data.data || []);
            }
        } catch (err) {
            console.error('Error fetching processes:', err);
        } finally {
            setFetchingData(false);
        }
    };

    const fetchMachines = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${BASE_URL}/api/machines`, {
                headers: { 'Authorization': `Bearer ${token}` },
                params: { 'status': ['Active', 'Idle'] },
            });

            if (response.data.success) {
                setMachines(response.data.data || []);
            }
        } catch (err) {
            console.error('Error fetching machines:', err);
        }
    };

    const fetchItems = async () => {
        try {
            const token = localStorage.getItem('token');
            // Fetch full item list to get all fields
            const response = await axios.get(`${BASE_URL}/api/items`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.data.success) {
                setItems(response.data.data || []);
            }
        } catch (err) {
            console.error('Error fetching items:', err);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        setFieldErrors(prev => ({ ...prev, [name]: '' }));
    };

    const handleOperationChange = (e) => {
        const { name, value, type, checked } = e.target;
        setCurrentOperation(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleMachineAdded = (newMachine) => {
        setMachines(prev => [...prev, newMachine]);
        setCurrentOperation(prev => ({
            ...prev,
            machine_id: newMachine._id
        }));
    };

    const handleMachineSelect = (machineId) => {
        const selectedMachine = machines.find(m => m._id === machineId);
        if (selectedMachine) {
            setCurrentOperation(prev => ({
                ...prev,
                machine_id: selectedMachine._id,
                work_centre: selectedMachine.work_centre || prev.work_centre
            }));
        }
    };

    const handleVendorAdded = (newVendor) => {
        setVendors(prev => [...prev, newVendor]);
        setCurrentOperation(prev => ({
            ...prev,
            subcontract_vendor: newVendor._id
        }));
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
            setError('Please select a process');
            return;
        }
        if (!currentOperation.op_sequence) {
            setError('Operation sequence is required');
            return;
        }
        if (Number(currentOperation.op_sequence) < 10) {
            setError('Operation sequence must be at least 10');
            return;
        }
        if (!currentOperation.work_centre) {
            setError('Work centre is required');
            return;
        }
        if (!currentOperation.planned_setup_min) {
            setError('Planned setup time is required');
            return;
        }
        if (!currentOperation.planned_run_min) {
            setError('Planned run time is required');
            return;
        }

        if (currentOperation.requires_torque_recording && currentOperation.expected_joints.length === 0) {
            setError('Please add at least one expected joint for torque recording');
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

        if (formData.operations.some(op => op.op_sequence === newOperation.op_sequence)) {
            setError(`Operation sequence ${newOperation.op_sequence} already exists`);
            return;
        }

        setFormData(prev => ({
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
        setError('');
    };

    const removeOperation = (index) => {
        setFormData(prev => ({
            ...prev,
            operations: prev.operations.filter((_, i) => i !== index)
        }));
    };

    const addApplicableItem = (item) => {
        if (item && !formData.applicable_items.includes(item._id)) {
            setFormData(prev => ({
                ...prev,
                applicable_items: [...prev.applicable_items, item._id]
            }));
            setSelectedItems(prev => [...prev, item]);
        }
    };

    const removeApplicableItem = (itemId) => {
        setFormData(prev => ({
            ...prev,
            applicable_items: prev.applicable_items.filter(id => id !== itemId)
        }));
        setSelectedItems(prev => prev.filter(item => item._id !== itemId));
    };

    const validateStep = (step) => {
        const errors = {};
        let isValid = true;

        switch (step) {
            case 0:
                if (!formData.routing_name.trim()) {
                    errors.routing_name = 'Routing name is required';
                    isValid = false;
                }
                if (!formData.routing_type.trim()) {
                    errors.routing_type = 'Routing type is required';
                    isValid = false;
                }
                break;

            case 1:
                if (formData.operations.length === 0) {
                    errors.operations = 'At least one operation is required';
                    isValid = false;
                }
                const invalidOps = formData.operations.filter(op => !op.work_centre);
                if (invalidOps.length > 0) {
                    errors.operations = `Operations ${invalidOps.map(op => op.op_sequence).join(', ')} missing work centre`;
                    isValid = false;
                }
                const invalidSequenceOps = formData.operations.filter(op => op.op_sequence < 10);
                if (invalidSequenceOps.length > 0) {
                    errors.operations = `Operation sequences ${invalidSequenceOps.map(op => op.op_sequence).join(', ')} must be at least 10`;
                    isValid = false;
                }
                const invalidTorqueOps = formData.operations.filter(op => op.requires_torque_recording && (!op.expected_joints || op.expected_joints.length === 0));
                if (invalidTorqueOps.length > 0) {
                    errors.operations = `Operations ${invalidTorqueOps.map(op => op.op_sequence).join(', ')} require torque recording but have no expected joints`;
                    isValid = false;
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
        if (!validateStep(1)) {
            return;
        }

        setLoading(true);
        setError('');

        try {
            const token = localStorage.getItem('token');

            if (!token) {
                setError('Authentication token not found. Please login again.');
                setLoading(false);
                return;
            }

            const cleanedOperations = formData.operations.map(op => {
                const cleanedOp = { ...op };
                if (!cleanedOp.machine_id) delete cleanedOp.machine_id;
                if (!cleanedOp.is_subcontract || !cleanedOp.subcontract_vendor) {
                    delete cleanedOp.subcontract_vendor;
                }
                if (!cleanedOp.description) delete cleanedOp.description;
                return cleanedOp;
            });

            const submitData = {
                routing_name: formData.routing_name,
                routing_type: formData.routing_type,
                applicable_items: formData.applicable_items,
                operations: cleanedOperations,
                version: formData.version
            };

            const response = await axios.post(`${BASE_URL}/api/routings`, submitData, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.data.success) {
                if (onAdd) {
                    onAdd(response.data.data);
                }
                handleClose();
            } else {
                setError(response.data.message || 'Failed to create routing');
            }
        } catch (err) {
            console.error('Error creating routing:', err);
            setError(err.response?.data?.message || 'Failed to create routing. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setActiveStep(0);
        setFormData({
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
        setFieldErrors({});
        setError('');
        setShowAddItemForm(false);
        resetItemForm();
        setShowAddProcessForm(false);
        resetProcessForm();
    };

    const handleClose = () => {
        resetForm();
        onClose();
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
            color: COLORS.text.primary
        }
    };

    const labelStyle = {
        fontSize: '0.7rem',
        fontWeight: 600,
        color: COLORS.text.secondary,
        letterSpacing: '0.5px',
        mb: 0.5
    };

    // --- RENDER INLINE ITEM FORM WITH STEPPER ---
    const renderItemStepContent = (step) => {
        switch (step) {
            case 0: // Basic Info
                return (
                    <Grid container spacing={1.5}>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                                <Typography sx={labelStyle}>PART NUMBER <span style={{ color: '#EF4444' }}>*</span></Typography>
                                <TextField
                                    fullWidth size="small" name="part_no"
                                    value={itemFormData.part_no}
                                    onChange={handleItemFormChange}
                                    onBlur={handleItemBlur}
                                    placeholder="e.g., BR-001"
                                    error={!!itemFieldErrors.part_no}
                                    helperText={itemFieldErrors.part_no}
                                    sx={inputStyle}
                                    disabled={addItemLoading}
                                />
                            </Box>
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                                <Typography sx={labelStyle}>PART NAME <span style={{ color: '#EF4444' }}>*</span></Typography>
                                <TextField
                                    fullWidth size="small" name="part_name"
                                    value={itemFormData.part_name}
                                    onChange={handleItemFormChange}
                                    onBlur={handleItemBlur}
                                    placeholder="e.g., Copper Busbar 100x10mm"
                                    error={!!itemFieldErrors.part_name}
                                    helperText={itemFieldErrors.part_name}
                                    sx={inputStyle}
                                    disabled={addItemLoading}
                                />
                            </Box>
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                                <Typography sx={labelStyle}>ITEM CATEGORY <span style={{ color: '#EF4444' }}>*</span></Typography>
                                <FormControl fullWidth size="small" error={!!itemFieldErrors.item_category}>
                                    <Select
                                        name="item_category"
                                        value={itemFormData.item_category}
                                        onChange={handleItemFormChange}
                                        onBlur={handleItemBlur}
                                        displayEmpty
                                        disabled={addItemLoading}
                                        sx={{ borderRadius: 1.5, fontSize: '0.75rem' }}
                                    >
                                        <MenuItem value="" disabled sx={{ fontSize: '0.75rem', color: COLORS.text.tertiary }}>Select category</MenuItem>
                                        {itemCategoryOptions.map(opt => (
                                            <MenuItem key={opt} value={opt} sx={{ fontSize: '0.75rem' }}>{opt}</MenuItem>
                                        ))}
                                    </Select>
                                    {itemFieldErrors.item_category && (
                                        <Typography sx={{ fontSize: '0.65rem', color: '#EF4444' }}>{itemFieldErrors.item_category}</Typography>
                                    )}
                                </FormControl>
                            </Box>
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                                <Typography sx={labelStyle}>ITEM TYPE <span style={{ color: '#EF4444' }}>*</span></Typography>
                                <FormControl fullWidth size="small" error={!!itemFieldErrors.item_type}>
                                    <Select
                                        name="item_type"
                                        value={itemFormData.item_type}
                                        onChange={handleItemFormChange}
                                        onBlur={handleItemBlur}
                                        displayEmpty
                                        disabled={addItemLoading}
                                        sx={{ borderRadius: 1.5, fontSize: '0.75rem' }}
                                    >
                                        <MenuItem value="" disabled sx={{ fontSize: '0.75rem', color: COLORS.text.tertiary }}>Select type</MenuItem>
                                        {itemTypeOptions.map(opt => (
                                            <MenuItem key={opt} value={opt} sx={{ fontSize: '0.75rem' }}>{opt}</MenuItem>
                                        ))}
                                    </Select>
                                    {itemFieldErrors.item_type && (
                                        <Typography sx={{ fontSize: '0.65rem', color: '#EF4444' }}>{itemFieldErrors.item_type}</Typography>
                                    )}
                                </FormControl>
                            </Box>
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                                <Typography sx={labelStyle}>SALE UNIT <span style={{ color: '#EF4444' }}>*</span></Typography>
                                <FormControl fullWidth size="small" error={!!itemFieldErrors.sale_unit}>
                                    <Select
                                        name="sale_unit"
                                        value={itemFormData.sale_unit}
                                        onChange={handleItemFormChange}
                                        onBlur={handleItemBlur}
                                        disabled={addItemLoading}
                                        sx={{ borderRadius: 1.5, fontSize: '0.75rem' }}
                                    >
                                        {unitOptions.map(opt => (
                                            <MenuItem key={opt} value={opt} sx={{ fontSize: '0.75rem' }}>{opt}</MenuItem>
                                        ))}
                                    </Select>
                                    {itemFieldErrors.sale_unit && (
                                        <Typography sx={{ fontSize: '0.65rem', color: '#EF4444' }}>{itemFieldErrors.sale_unit}</Typography>
                                    )}
                                </FormControl>
                                <Typography sx={{ fontSize: '0.65rem', color: COLORS.text.tertiary }}>Optional, defaults to "Nos"</Typography>
                            </Box>
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                                <Typography sx={labelStyle}>WEIGHT PER UNIT (kg)</Typography>
                                <TextField
                                    fullWidth size="small" name="weight_per_unit_kg"
                                    type="number"
                                    value={itemFormData.weight_per_unit_kg}
                                    onChange={handleItemFormChange}
                                    onBlur={handleItemBlur}
                                    placeholder="e.g., 0.85"
                                    error={!!itemFieldErrors.weight_per_unit_kg}
                                    helperText={itemFieldErrors.weight_per_unit_kg}
                                    sx={inputStyle}
                                    disabled={addItemLoading}
                                    inputProps={{ step: '0.001', min: 0 }}
                                />
                                <Typography sx={{ fontSize: '0.65rem', color: COLORS.text.tertiary }}>Required when sale unit is not Kg</Typography>
                            </Box>
                        </Grid>
                        <Grid size={{ xs: 12 }}>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                                <Typography sx={labelStyle}>PART DESCRIPTION <span style={{ color: '#EF4444' }}>*</span></Typography>
                                <TextField
                                    fullWidth size="small" name="part_description"
                                    multiline rows={2}
                                    value={itemFormData.part_description}
                                    onChange={handleItemFormChange}
                                    onBlur={handleItemBlur}
                                    placeholder="Enter detailed part description"
                                    error={!!itemFieldErrors.part_description}
                                    helperText={itemFieldErrors.part_description}
                                    sx={inputStyle}
                                    disabled={addItemLoading}
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
                                <Typography sx={labelStyle}>MATERIAL <span style={{ color: '#EF4444' }}>*</span></Typography>
                                <FormControl fullWidth size="small" error={!!itemFieldErrors.material}>
                                    <Select
                                        name="material"
                                        value={itemFormData.material}
                                        onChange={handleItemFormChange}
                                        onBlur={handleItemBlur}
                                        displayEmpty
                                        disabled={addItemLoading}
                                        sx={{ borderRadius: 1.5, fontSize: '0.75rem' }}
                                    >
                                        <MenuItem value="" disabled sx={{ fontSize: '0.75rem', color: COLORS.text.tertiary }}>Select material</MenuItem>
                                        {materialOptions.map(opt => (
                                            <MenuItem key={opt} value={opt} sx={{ fontSize: '0.75rem' }}>{opt}</MenuItem>
                                        ))}
                                    </Select>
                                    {itemFieldErrors.material && (
                                        <Typography sx={{ fontSize: '0.65rem', color: '#EF4444' }}>{itemFieldErrors.material}</Typography>
                                    )}
                                </FormControl>
                            </Box>
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                                <Typography sx={labelStyle}>MATERIAL GRADE <span style={{ color: '#EF4444' }}>*</span></Typography>
                                <TextField
                                    fullWidth size="small" name="material_grade"
                                    value={itemFormData.material_grade}
                                    onChange={handleItemFormChange}
                                    onBlur={handleItemBlur}
                                    placeholder="e.g., C11000"
                                    error={!!itemFieldErrors.material_grade}
                                    helperText={itemFieldErrors.material_grade}
                                    sx={inputStyle}
                                    disabled={addItemLoading}
                                />
                            </Box>
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                                <Typography sx={labelStyle}>MATERIAL STANDARD</Typography>
                                <TextField
                                    fullWidth size="small" name="material_standard"
                                    value={itemFormData.material_standard}
                                    onChange={handleItemFormChange}
                                    onBlur={handleItemBlur}
                                    placeholder="e.g., ASTM B152"
                                    sx={inputStyle}
                                    disabled={addItemLoading}
                                />
                            </Box>
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                                <Typography sx={labelStyle}>MATERIAL COLOR</Typography>
                                <TextField
                                    fullWidth size="small" name="material_color"
                                    value={itemFormData.material_color}
                                    onChange={handleItemFormChange}
                                    onBlur={handleItemBlur}
                                    placeholder="e.g., Reddish"
                                    sx={inputStyle}
                                    disabled={addItemLoading}
                                />
                            </Box>
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                                <Typography sx={labelStyle}>DENSITY (g/cm³)</Typography>
                                <TextField
                                    fullWidth size="small" name="density"
                                    type="number"
                                    value={itemFormData.density}
                                    onChange={handleItemFormChange}
                                    onBlur={handleItemBlur}
                                    placeholder="e.g., 8.96"
                                    error={!!itemFieldErrors.density}
                                    helperText={itemFieldErrors.density}
                                    sx={inputStyle}
                                    disabled={addItemLoading}
                                    inputProps={{ step: '0.01', min: 0 }}
                                />
                            </Box>
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                                <Typography sx={labelStyle}>UNIT <span style={{ color: '#EF4444' }}>*</span></Typography>
                                <FormControl fullWidth size="small" error={!!itemFieldErrors.unit}>
                                    <Select
                                        name="unit"
                                        value={itemFormData.unit}
                                        onChange={handleItemFormChange}
                                        onBlur={handleItemBlur}
                                        disabled={addItemLoading}
                                        sx={{ borderRadius: 1.5, fontSize: '0.75rem' }}
                                    >
                                        {unitOptions.map(opt => (
                                            <MenuItem key={opt} value={opt} sx={{ fontSize: '0.75rem' }}>{opt}</MenuItem>
                                        ))}
                                    </Select>
                                    {itemFieldErrors.unit && (
                                        <Typography sx={{ fontSize: '0.65rem', color: '#EF4444' }}>{itemFieldErrors.unit}</Typography>
                                    )}
                                </FormControl>
                            </Box>
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                                <Typography sx={labelStyle}>DRAWING NO <span style={{ color: '#EF4444' }}>*</span></Typography>
                                <TextField
                                    fullWidth size="small" name="drawing_no"
                                    value={itemFormData.drawing_no}
                                    onChange={handleItemFormChange}
                                    onBlur={handleItemBlur}
                                    placeholder="e.g., DRG-001"
                                    error={!!itemFieldErrors.drawing_no}
                                    helperText={itemFieldErrors.drawing_no}
                                    sx={inputStyle}
                                    disabled={addItemLoading}
                                />
                            </Box>
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                                <Typography sx={labelStyle}>DRAWING REVISION</Typography>
                                <TextField
                                    fullWidth size="small" name="drawing_revision"
                                    value={itemFormData.drawing_revision}
                                    onChange={handleItemFormChange}
                                    onBlur={handleItemBlur}
                                    placeholder="e.g., Rev A, 01"
                                    sx={inputStyle}
                                    disabled={addItemLoading}
                                />
                            </Box>
                        </Grid>
                    </Grid>
                );
            case 2: // Process Details
                return (
                    <Grid container spacing={1.5}>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                                <Typography sx={labelStyle}>PROCESS TYPE <span style={{ color: '#EF4444' }}>*</span></Typography>
                                <FormControl fullWidth size="small" error={!!itemFieldErrors.process_type}>
                                    <Select
                                        name="process_type"
                                        value={itemFormData.process_type}
                                        onChange={handleItemFormChange}
                                        onBlur={handleItemBlur}
                                        displayEmpty
                                        disabled={addItemLoading}
                                        sx={{ borderRadius: 1.5, fontSize: '0.75rem' }}
                                    >
                                        <MenuItem value="" disabled sx={{ fontSize: '0.75rem', color: COLORS.text.tertiary }}>Select process type</MenuItem>
                                        {processTypeOptions.map(opt => (
                                            <MenuItem key={opt} value={opt} sx={{ fontSize: '0.75rem' }}>{opt}</MenuItem>
                                        ))}
                                    </Select>
                                    {itemFieldErrors.process_type && (
                                        <Typography sx={{ fontSize: '0.65rem', color: '#EF4444' }}>{itemFieldErrors.process_type}</Typography>
                                    )}
                                </FormControl>
                            </Box>
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                                <Typography sx={labelStyle}>MACHINE TYPE</Typography>
                                <FormControl fullWidth size="small">
                                    <Select
                                        name="machine_type"
                                        value={itemFormData.machine_type}
                                        onChange={handleItemFormChange}
                                        onBlur={handleItemBlur}
                                        displayEmpty
                                        disabled={addItemLoading}
                                        sx={{ borderRadius: 1.5, fontSize: '0.75rem' }}
                                    >
                                        <MenuItem value="" disabled sx={{ fontSize: '0.75rem', color: COLORS.text.tertiary }}>Select machine type</MenuItem>
                                        {machineTypeOptions.map(opt => (
                                            <MenuItem key={opt} value={opt} sx={{ fontSize: '0.75rem' }}>{opt}</MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Box>
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                                <Typography sx={labelStyle}>CYCLE TIME (min)</Typography>
                                <TextField
                                    fullWidth size="small" name="cycle_time"
                                    type="number"
                                    value={itemFormData.cycle_time}
                                    onChange={handleItemFormChange}
                                    onBlur={handleItemBlur}
                                    placeholder="e.g., 5.5"
                                    error={!!itemFieldErrors.cycle_time}
                                    helperText={itemFieldErrors.cycle_time}
                                    sx={inputStyle}
                                    disabled={addItemLoading}
                                    inputProps={{ step: '0.1', min: 0 }}
                                />
                            </Box>
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                                <Typography sx={labelStyle}>SETUP TIME (min)</Typography>
                                <TextField
                                    fullWidth size="small" name="setup_time"
                                    type="number"
                                    value={itemFormData.setup_time}
                                    onChange={handleItemFormChange}
                                    onBlur={handleItemBlur}
                                    placeholder="e.g., 30"
                                    sx={inputStyle}
                                    disabled={addItemLoading}
                                    inputProps={{ step: '0.1', min: 0 }}
                                />
                            </Box>
                        </Grid>
                        <Grid size={{ xs: 12 }}>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                                <Typography sx={labelStyle}>PROCESS DESCRIPTION</Typography>
                                <TextField
                                    fullWidth size="small" name="process_description"
                                    multiline rows={2}
                                    value={itemFormData.process_description}
                                    onChange={handleItemFormChange}
                                    onBlur={handleItemBlur}
                                    placeholder="Describe the process"
                                    sx={inputStyle}
                                    disabled={addItemLoading}
                                />
                            </Box>
                        </Grid>
                    </Grid>
                );
            case 3: // Rate & Tax
                return (
                    <Grid container spacing={1.5}>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                                <Typography sx={labelStyle}>UNIT PRICE (₹)</Typography>
                                <TextField
                                    fullWidth size="small" name="unit_price"
                                    type="number"
                                    value={itemFormData.unit_price}
                                    onChange={handleItemFormChange}
                                    onBlur={handleItemBlur}
                                    placeholder="e.g., 1500"
                                    error={!!itemFieldErrors.unit_price}
                                    helperText={itemFieldErrors.unit_price}
                                    sx={inputStyle}
                                    disabled={addItemLoading}
                                    InputProps={{ startAdornment: <InputAdornment position="start">₹</InputAdornment> }}
                                    inputProps={{ step: '0.01', min: 0 }}
                                />
                            </Box>
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                                <Typography sx={labelStyle}>TAX RATE (%)</Typography>
                                <TextField
                                    fullWidth size="small" name="tax_rate"
                                    type="number"
                                    value={itemFormData.tax_rate}
                                    onChange={handleItemFormChange}
                                    onBlur={handleItemBlur}
                                    placeholder="e.g., 18"
                                    sx={inputStyle}
                                    disabled={addItemLoading}
                                    InputProps={{ endAdornment: <InputAdornment position="end">%</InputAdornment> }}
                                    inputProps={{ step: '0.1', min: 0 }}
                                />
                            </Box>
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                                <Typography sx={labelStyle}>HSN CODE <span style={{ color: '#EF4444' }}>*</span></Typography>
                                <TextField
                                    fullWidth size="small" name="hsn_code"
                                    value={itemFormData.hsn_code}
                                    onChange={handleItemFormChange}
                                    onBlur={handleItemBlur}
                                    placeholder="e.g., 74071010"
                                    error={!!itemFieldErrors.hsn_code}
                                    helperText={itemFieldErrors.hsn_code}
                                    sx={inputStyle}
                                    disabled={addItemLoading}
                                />
                            </Box>
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                                <Typography sx={labelStyle}>MIN ORDER QUANTITY</Typography>
                                <TextField
                                    fullWidth size="small" name="min_order_quantity"
                                    type="number"
                                    value={itemFormData.min_order_quantity}
                                    onChange={handleItemFormChange}
                                    onBlur={handleItemBlur}
                                    placeholder="e.g., 100"
                                    sx={inputStyle}
                                    disabled={addItemLoading}
                                    inputProps={{ step: '1', min: 0 }}
                                />
                            </Box>
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                                <Typography sx={labelStyle}>LEAD TIME (days)</Typography>
                                <TextField
                                    fullWidth size="small" name="lead_time"
                                    type="number"
                                    value={itemFormData.lead_time}
                                    onChange={handleItemFormChange}
                                    onBlur={handleItemBlur}
                                    placeholder="e.g., 7"
                                    sx={inputStyle}
                                    disabled={addItemLoading}
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

    // --- Render inline item form (with 4-step stepper) ---
    const renderInlineItemForm = () => (
        <Box sx={{ mt: 2, p: 2, bgcolor: COLORS.background.light, borderRadius: 2, border: `1px solid ${COLORS.primary}` }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color: COLORS.primary }}>
                    {itemFormData.part_no ? 'Edit Item Details' : 'Add New Item'}
                </Typography>
                <IconButton
                    size="small"
                    onClick={() => {
                        setShowAddItemForm(false);
                        resetItemForm();
                    }}
                    sx={{ color: COLORS.text.tertiary, '&:hover': { color: COLORS.primary } }}
                >
                    <CloseIcon sx={{ fontSize: '1rem' }} />
                </IconButton>
            </Box>

            {/* Item Stepper */}
            <Stepper activeStep={itemStepper} sx={{ mb: 3 }} connector={<ColorConnector />}>
                {ITEM_STEPS.map((label) => (
                    <Step key={label}>
                        <StepLabel>
                            <Typography sx={{ fontSize: '0.65rem', fontWeight: 500 }}>{label}</Typography>
                        </StepLabel>
                    </Step>
                ))}
            </Stepper>

            {renderItemStepContent(itemStepper)}

            {addItemError && (
                <Alert severity="error" sx={{ mt: 2, borderRadius: 1.5, fontSize: '0.75rem', py: 0.5 }}>
                    {addItemError}
                </Alert>
            )}

            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Button
                    onClick={() => setItemStepper(prev => prev - 1)}
                    disabled={itemStepper === 0 || addItemLoading}
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
                            setShowAddItemForm(false);
                            resetItemForm();
                        }}
                        disabled={addItemLoading}
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
                    {itemStepper === ITEM_STEPS.length - 1 ? (
                        <Button
                            variant="contained"
                            onClick={handleAddItemSubmit}
                            disabled={addItemLoading}
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
                            {addItemLoading ? 'Adding...' : 'Add Item'}
                        </Button>
                    ) : (
                        <Button
                            variant="contained"
                            onClick={() => setItemStepper(prev => prev + 1)}
                            disabled={addItemLoading}
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
    );

    // --- Render inline process form (unchanged) ---
    const renderInlineProcessForm = () => (
        <Box sx={{ mt: 2, p: 2, bgcolor: COLORS.background.light, borderRadius: 2, border: `1px solid ${COLORS.primary}` }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color: COLORS.primary }}>
                    {processFormData.process_id ? 'Edit Process Details' : 'Add New Process'}
                </Typography>
                <IconButton
                    size="small"
                    onClick={() => {
                        setShowAddProcessForm(false);
                        resetProcessForm();
                    }}
                    sx={{ color: COLORS.text.tertiary, '&:hover': { color: COLORS.primary } }}
                >
                    <CloseIcon sx={{ fontSize: '1rem' }} />
                </IconButton>
            </Box>
            <Grid container spacing={1.5}>
                <Grid size={{ xs: 12, sm: 6 }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                        <Typography sx={labelStyle}>PROCESS ID <span style={{ color: '#EF4444' }}>*</span></Typography>
                        <TextField
                            fullWidth size="small" name="process_id"
                            value={processFormData.process_id}
                            onChange={handleProcessFormChange}
                            onBlur={handleProcessBlur}
                            placeholder="e.g., PROC-CNC-001"
                            error={!!processFieldErrors.process_id}
                            helperText={processFieldErrors.process_id}
                            sx={inputStyle}
                            disabled={addProcessLoading}
                        />
                    </Box>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                        <Typography sx={labelStyle}>PROCESS NAME <span style={{ color: '#EF4444' }}>*</span></Typography>
                        <TextField
                            fullWidth size="small" name="process_name"
                            value={processFormData.process_name}
                            onChange={handleProcessFormChange}
                            onBlur={handleProcessBlur}
                            placeholder="e.g., CNC Drilling"
                            error={!!processFieldErrors.process_name}
                            helperText={processFieldErrors.process_name}
                            sx={inputStyle}
                            disabled={addProcessLoading}
                        />
                    </Box>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                        <Typography sx={labelStyle}>CATEGORY <span style={{ color: '#EF4444' }}>*</span></Typography>
                        <FormControl fullWidth size="small" error={!!processFieldErrors.category}>
                            <Select
                                name="category"
                                value={processFormData.category}
                                onChange={handleProcessFormChange}
                                onBlur={handleProcessBlur}
                                displayEmpty
                                disabled={addProcessLoading}
                                sx={{ borderRadius: 1.5, fontSize: '0.75rem' }}
                            >
                                <MenuItem value="" disabled sx={{ fontSize: '0.75rem', color: COLORS.text.tertiary }}>Select category</MenuItem>
                                {categoryOptions.map(opt => (
                                    <MenuItem key={opt} value={opt} sx={{ fontSize: '0.75rem' }}>{opt}</MenuItem>
                                ))}
                            </Select>
                            {processFieldErrors.category && (
                                <Typography sx={{ fontSize: '0.65rem', color: '#EF4444' }}>{processFieldErrors.category}</Typography>
                            )}
                        </FormControl>
                    </Box>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                        <Typography sx={labelStyle}>RATE TYPE <span style={{ color: '#EF4444' }}>*</span></Typography>
                        <FormControl fullWidth size="small" error={!!processFieldErrors.rate_type}>
                            <Select
                                name="rate_type"
                                value={processFormData.rate_type}
                                onChange={handleProcessFormChange}
                                onBlur={handleProcessBlur}
                                displayEmpty
                                disabled={addProcessLoading}
                                sx={{ borderRadius: 1.5, fontSize: '0.75rem' }}
                            >
                                <MenuItem value="" disabled sx={{ fontSize: '0.75rem', color: COLORS.text.tertiary }}>Select rate type</MenuItem>
                                {rateTypeOptions.map(opt => (
                                    <MenuItem key={opt} value={opt} sx={{ fontSize: '0.75rem' }}>{opt}</MenuItem>
                                ))}
                            </Select>
                            {processFieldErrors.rate_type && (
                                <Typography sx={{ fontSize: '0.65rem', color: '#EF4444' }}>{processFieldErrors.rate_type}</Typography>
                            )}
                        </FormControl>
                    </Box>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                        <Typography sx={labelStyle}>WORK CENTRE <span style={{ color: '#EF4444' }}>*</span></Typography>
                        <TextField
                            fullWidth size="small" name="work_centre"
                            value={processFormData.work_centre}
                            onChange={handleProcessFormChange}
                            onBlur={handleProcessBlur}
                            placeholder="Enter work centre"
                            error={!!processFieldErrors.work_centre}
                            helperText={processFieldErrors.work_centre}
                            sx={inputStyle}
                            disabled={addProcessLoading}
                        />
                    </Box>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                        <Typography sx={labelStyle}>SETUP TIME (MINUTES)</Typography>
                        <TextField
                            fullWidth type="number" size="small" name="setup_time_min"
                            value={processFormData.setup_time_min}
                            onChange={handleProcessFormChange}
                            onBlur={handleProcessBlur}
                            placeholder="0"
                            error={!!processFieldErrors.setup_time_min}
                            helperText={processFieldErrors.setup_time_min}
                            sx={inputStyle}
                            disabled={addProcessLoading}
                            inputProps={{ step: '0.1', min: 0 }}
                        />
                    </Box>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                        <Typography sx={labelStyle}>CYCLE TIME (MINUTES)</Typography>
                        <TextField
                            fullWidth type="number" size="small" name="cycle_time_min"
                            value={processFormData.cycle_time_min}
                            onChange={handleProcessFormChange}
                            onBlur={handleProcessBlur}
                            placeholder="0"
                            error={!!processFieldErrors.cycle_time_min}
                            helperText={processFieldErrors.cycle_time_min}
                            sx={inputStyle}
                            disabled={addProcessLoading}
                            inputProps={{ step: '0.1', min: 0 }}
                        />
                    </Box>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                        <Typography sx={labelStyle}>SUBCONTRACT PROCESS</Typography>
                        <Switch
                            checked={processFormData.subcontract_process}
                            onChange={(e) => setProcessFormData(prev => ({ ...prev, subcontract_process: e.target.checked }))}
                            name="subcontract_process"
                            size="small"
                            disabled={addProcessLoading}
                            sx={{
                                '& .MuiSwitch-switchBase.Mui-checked': {
                                    color: COLORS.primary,
                                },
                                '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                                    backgroundColor: COLORS.primary,
                                },
                            }}
                        />
                    </Box>
                </Grid>
                <Grid size={{ xs: 12 }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                        <Typography sx={labelStyle}>DESCRIPTION</Typography>
                        <TextField
                            fullWidth size="small" name="description"
                            multiline rows={3}
                            value={processFormData.description}
                            onChange={handleProcessFormChange}
                            onBlur={handleProcessBlur}
                            placeholder="Describe the process, equipment used, special requirements, etc."
                            error={!!processFieldErrors.description}
                            helperText={processFieldErrors.description}
                            sx={inputStyle}
                            disabled={addProcessLoading}
                        />
                    </Box>
                </Grid>
            </Grid>

            {addProcessError && (
                <Alert severity="error" sx={{ mt: 2, borderRadius: 1.5, fontSize: '0.75rem', py: 0.5 }}>
                    {addProcessError}
                </Alert>
            )}

            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                <Button
                    onClick={() => {
                        setShowAddProcessForm(false);
                        resetProcessForm();
                    }}
                    disabled={addProcessLoading}
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
                <Button
                    variant="contained"
                    onClick={handleAddProcessSubmit}
                    disabled={addProcessLoading}
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
                    {addProcessLoading ? 'Adding...' : 'Add Process'}
                </Button>
            </Box>
        </Box>
    );

    // --- Main step content ---
    const renderStepContent = (step) => {
        switch (step) {
            case 0:
                return (
                    <Stack spacing={2}>
                        <Paper sx={{ p: 2, borderRadius: 1.5, border: `1px solid ${COLORS.border}` }}>
                            <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color: COLORS.primary, mb: 1.5 }}>
                                <RouteIcon sx={{ fontSize: '1rem', mr: 0.5, verticalAlign: 'middle' }} />
                                Basic Information
                            </Typography>

                            <Grid container spacing={1.5}>
                                <Grid size={{ xs: 12, sm: 6 }}>
                                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                                        <Typography sx={labelStyle}>
                                            ROUTING NAME <span style={{ color: '#EF4444' }}>*</span>
                                        </Typography>
                                        <TextField
                                            fullWidth size="small" name="routing_name"
                                            value={formData.routing_name}
                                            onChange={handleChange}
                                            placeholder="e.g., Copper Busbar Standard Route"
                                            error={!!fieldErrors.routing_name}
                                            helperText={fieldErrors.routing_name}
                                            sx={inputStyle}
                                        />
                                    </Box>
                                </Grid>

                                <Grid size={{ xs: 12, sm: 6 }}>
                                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                                        <Typography sx={labelStyle}>
                                            ROUTING TYPE <span style={{ color: '#EF4444' }}>*</span>
                                        </Typography>
                                        <FormControl fullWidth size="small" error={!!fieldErrors.routing_type}>
                                            <Select
                                                name="routing_type"
                                                value={formData.routing_type}
                                                onChange={handleChange}
                                                displayEmpty
                                                sx={{ borderRadius: 1.5, fontSize: '0.75rem' }}
                                            >
                                                <MenuItem value="" disabled sx={{ fontSize: '0.75rem' }}>Select routing type</MenuItem>
                                                {ROUTING_TYPE_OPTIONS.map(type => (
                                                    <MenuItem key={type} value={type} sx={{ fontSize: '0.75rem' }}>{type}</MenuItem>
                                                ))}
                                            </Select>
                                            {fieldErrors.routing_type && (
                                                <Typography sx={{ fontSize: '0.65rem', color: '#EF4444', mt: 0.5 }}>
                                                    {fieldErrors.routing_type}
                                                </Typography>
                                            )}
                                        </FormControl>
                                    </Box>
                                </Grid>

                                <Grid size={{ xs: 12, sm: 6 }}>
                                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                                        <Typography sx={labelStyle}>VERSION</Typography>
                                        <TextField
                                            fullWidth size="small" name="version"
                                            value={formData.version}
                                            onChange={handleChange}
                                            placeholder="1.0"
                                            sx={inputStyle}
                                        />
                                    </Box>
                                </Grid>

                                <Grid size={{ xs: 12 }}>
                                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                                        <Typography sx={labelStyle}>APPLICABLE ITEMS</Typography>
                                        <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
                                            <Box sx={{ flex: 1 }}>
                                                <Autocomplete
                                                    options={items}
                                                    getOptionLabel={(option) => {
                                                        const partNo = option.part_no || '';
                                                        const partName = option.part_name || option.part_description || '';
                                                        return `${partNo} - ${partName}`.trim();
                                                    }}
                                                    onChange={(event, newValue) => {
                                                        if (newValue) {
                                                            // Add to routing
                                                            addApplicableItem(newValue);
                                                            // Populate all fields in the inline form
                                                            setItemFormData({
                                                                part_no: newValue.part_no || '',
                                                                part_name: newValue.part_name || '',
                                                                item_category: newValue.item_category || '',
                                                                item_type: newValue.item_type || '',
                                                                sale_unit: newValue.sale_unit || 'Nos',
                                                                part_description: newValue.part_description || '',
                                                                weight_per_unit_kg: newValue.weight_per_unit_kg || '',
                                                                material: newValue.material || '',
                                                                material_grade: newValue.material_grade || '',
                                                                material_standard: newValue.material_standard || '',
                                                                material_color: newValue.material_color || '',
                                                                density: newValue.density || '',
                                                                unit: newValue.unit || 'Kg',
                                                                drawing_no: newValue.drawing_no || '',
                                                                drawing_revision: newValue.drawing_revision || '',
                                                                process_type: newValue.process_type || '',
                                                                process_description: newValue.process_description || '',
                                                                machine_type: newValue.machine_type || '',
                                                                cycle_time: newValue.cycle_time || '',
                                                                setup_time: newValue.setup_time || '',
                                                                unit_price: newValue.unit_price || '',
                                                                tax_rate: newValue.tax_rate || '',
                                                                hsn_code: newValue.hsn_code || '',
                                                                min_order_quantity: newValue.min_order_quantity || '',
                                                                lead_time: newValue.lead_time || ''
                                                            });
                                                            setItemStepper(0);
                                                            setShowAddItemForm(true);
                                                            setAddItemError('');
                                                            setItemFieldErrors({});
                                                            setItemTouched({});
                                                        }
                                                    }}
                                                    renderInput={(params) => (
                                                        <TextField
                                                            {...params}
                                                            size="small"
                                                            placeholder="Search and select items..."
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
                                                    PaperComponent={CustomPaper}
                                                    isOptionEqualToValue={(option, value) => option._id === value?._id}
                                                />
                                            </Box>
                                            <Button
                                                variant="outlined"
                                                size="small"
                                                onClick={() => {
                                                    if (!showAddItemForm) {
                                                        resetItemForm();
                                                        setShowAddItemForm(true);
                                                        setAddItemError('');
                                                    } else {
                                                        setShowAddItemForm(false);
                                                        resetItemForm();
                                                    }
                                                }}
                                                startIcon={showAddItemForm ? <CloseIcon sx={{ fontSize: '0.875rem' }} /> : <AddIcon sx={{ fontSize: '0.875rem' }} />}
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
                                                {showAddItemForm ? 'Cancel' : 'Add New'}
                                            </Button>
                                        </Box>

                                        {showAddItemForm && renderInlineItemForm()}

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
                        </Paper>
                    </Stack>
                );

            case 1:
                return (
                    <Stack spacing={2}>
                        <Paper sx={{ p: 2, borderRadius: 1.5, border: `1px solid ${COLORS.border}` }}>
                            <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color: COLORS.primary, mb: 1.5 }}>
                                <BuildIcon sx={{ fontSize: '1rem', mr: 0.5, verticalAlign: 'middle' }} />
                                Operations
                            </Typography>

                            <Grid container spacing={1.5} sx={{ mb: 2 }}>
                                <Grid size={{ xs: 12, sm: 3 }}>
                                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                                        <Typography sx={labelStyle}>
                                            SEQUENCE <span style={{ color: '#EF4444' }}>*</span>
                                        </Typography>
                                        <TextField
                                            fullWidth type="number" size="small" name="op_sequence"
                                            value={currentOperation.op_sequence}
                                            onChange={handleOperationChange}
                                            placeholder="10, 20, 30..."
                                            sx={inputStyle}
                                        />
                                    </Box>
                                </Grid>

                                <Grid size={{ xs: 12, sm: 9 }}>
                                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                                        <Typography sx={labelStyle}>
                                            PROCESS <span style={{ color: '#EF4444' }}>*</span>
                                        </Typography>
                                        <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
                                            <Box sx={{ flex: 1 }}>
                                                <Autocomplete
                                                    fullWidth
                                                    options={processes}
                                                    getOptionLabel={(option) =>
                                                        `${option.process_name} (${option.process_id})`
                                                    }
                                                    value={
                                                        processes.find(p => p._id === currentOperation.operation_id) || null
                                                    }
                                                    onChange={(event, newValue) => {
                                                        if (newValue) {
                                                            setCurrentOperation(prev => ({
                                                                ...prev,
                                                                operation_id: newValue._id,
                                                                operation_name: newValue.process_name,
                                                                work_centre: newValue.work_centre || ''
                                                            }));
                                                            setProcessFormData({
                                                                process_id: newValue.process_id || '',
                                                                process_name: newValue.process_name || '',
                                                                category: newValue.category || '',
                                                                rate_type: newValue.rate_type || '',
                                                                work_centre: newValue.work_centre || '',
                                                                setup_time_min: newValue.setup_time_min || '',
                                                                cycle_time_min: newValue.cycle_time_min || '',
                                                                description: newValue.description || '',
                                                                is_subcontract: newValue.is_subcontract || false,
                                                                subcontract_process: newValue.subcontract_process || false
                                                            });
                                                            setShowAddProcessForm(true);
                                                            setAddProcessError('');
                                                            setProcessFieldErrors({});
                                                            setProcessTouched({});
                                                        } else {
                                                            setCurrentOperation(prev => ({
                                                                ...prev,
                                                                operation_id: '',
                                                                operation_name: '',
                                                                work_centre: ''
                                                            }));
                                                            setShowAddProcessForm(false);
                                                            resetProcessForm();
                                                        }
                                                    }}
                                                    loading={fetchingData}
                                                    renderInput={(params) => (
                                                        <TextField
                                                            {...params}
                                                            size="small"
                                                            placeholder="Search or select process..."
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
                                                    PaperComponent={CustomPaper}
                                                    isOptionEqualToValue={(option, value) => option._id === value?._id}
                                                />
                                            </Box>
                                            <Button
                                                variant="outlined"
                                                size="small"
                                                onClick={() => {
                                                    if (!showAddProcessForm) {
                                                        resetProcessForm();
                                                        setShowAddProcessForm(true);
                                                        setAddProcessError('');
                                                    } else {
                                                        setShowAddProcessForm(false);
                                                        resetProcessForm();
                                                    }
                                                }}
                                                startIcon={showAddProcessForm ? <CloseIcon sx={{ fontSize: '0.875rem' }} /> : <AddIcon sx={{ fontSize: '0.875rem' }} />}
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
                                                {showAddProcessForm ? 'Cancel' : 'Add New'}
                                            </Button>
                                        </Box>

                                        {showAddProcessForm && renderInlineProcessForm()}
                                    </Box>
                                </Grid>
                            </Grid>

                            <Grid container spacing={1.5} sx={{ mb: 2 }}>
                                <Grid size={{ xs: 12, sm: 6 }}>
                                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                                        <Typography sx={labelStyle}>MACHINE</Typography>
                                        <FormControl fullWidth size="small">
                                            <Select
                                                value={currentOperation.machine_id}
                                                onChange={(e) => handleMachineSelect(e.target.value)}
                                                name="machine_id"
                                                displayEmpty
                                                sx={{ borderRadius: 1.5, fontSize: '0.75rem' }}
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
                                        <Typography sx={labelStyle}>
                                            WORK CENTRE <span style={{ color: '#EF4444' }}>*</span>
                                        </Typography>
                                        <TextField
                                            fullWidth size="small" name="work_centre"
                                            value={currentOperation.work_centre}
                                            onChange={handleOperationChange}
                                            placeholder="Enter work centre"
                                            sx={inputStyle}
                                            disabled
                                        />
                                    </Box>
                                </Grid>
                            </Grid>

                            <Grid container spacing={1.5} sx={{ mb: 2 }}>
                                <Grid size={{ xs: 12, sm: 6 }}>
                                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                                        <Typography sx={labelStyle}>
                                            SETUP TIME (min) <span style={{ color: '#EF4444' }}>*</span>
                                        </Typography>
                                        <TextField
                                            fullWidth type="number" size="small" name="planned_setup_min"
                                            value={currentOperation.planned_setup_min}
                                            onChange={handleOperationChange}
                                            placeholder="e.g., 15"
                                            sx={inputStyle}
                                        />
                                    </Box>
                                </Grid>

                                <Grid size={{ xs: 12, sm: 6 }}>
                                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                                        <Typography sx={labelStyle}>
                                            RUN TIME (min/unit) <span style={{ color: '#EF4444' }}>*</span>
                                        </Typography>
                                        <TextField
                                            fullWidth type="number" size="small" name="planned_run_min"
                                            value={currentOperation.planned_run_min}
                                            onChange={handleOperationChange}
                                            placeholder="e.g., 2.5"
                                            sx={inputStyle}
                                        />
                                    </Box>
                                </Grid>
                            </Grid>

                            <Grid container spacing={1.5} sx={{ mb: 2 }}>
                                <Grid size={{ xs: 12, sm: 3 }}>
                                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                                        <Typography sx={labelStyle}>SCRAP %</Typography>
                                        <TextField
                                            fullWidth type="number" size="small" name="scrap_pct"
                                            value={currentOperation.scrap_pct}
                                            onChange={handleOperationChange}
                                            placeholder="0"
                                            sx={inputStyle}
                                        />
                                    </Box>
                                </Grid>

                                <Grid size={{ xs: 12, sm: 9 }}>
                                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                                        <Typography sx={labelStyle}>DESCRIPTION</Typography>
                                        <TextField
                                            fullWidth size="small" name="description"
                                            value={currentOperation.description}
                                            onChange={handleOperationChange}
                                            placeholder="Operation description"
                                            sx={inputStyle}
                                        />
                                    </Box>
                                </Grid>
                            </Grid>

                            <Grid container spacing={1.5} sx={{ mb: 2 }}>
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
                                                    <Typography sx={{ ...labelStyle, mb: 1 }}>
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
                                                            sx={{ flex: 1, ...inputStyle }}
                                                        />
                                                        <Button
                                                            variant="outlined"
                                                            size="small"
                                                            onClick={addJoint}
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

                            <Grid container spacing={1.5} sx={{ mb: 2 }}>
                                <Grid size={{ xs: 12 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                                        <FormControlLabel
                                            control={
                                                <Checkbox
                                                    checked={currentOperation.is_subcontract}
                                                    onChange={handleOperationChange}
                                                    name="is_subcontract"
                                                    size="small"
                                                />
                                            }
                                            label={<Typography sx={{ fontSize: '0.7rem' }}>Is Subcontract</Typography>}
                                        />
                                        {currentOperation.is_subcontract && (
                                            <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start', flex: 1 }}>
                                                <Box sx={{ flex: 1 }}>
                                                    <Autocomplete
                                                        options={vendors}
                                                        getOptionLabel={(option) => `${option.vendor_name} (${option.vendor_code})`}
                                                        onChange={(event, newValue) => {
                                                            setCurrentOperation(prev => ({
                                                                ...prev,
                                                                subcontract_vendor: newValue?._id || ''
                                                            }));
                                                        }}
                                                        renderInput={(params) => (
                                                            <TextField
                                                                {...params}
                                                                size="small"
                                                                placeholder="Select vendor"
                                                                sx={inputStyle}
                                                            />
                                                        )}
                                                        PaperComponent={CustomPaper}
                                                        isOptionEqualToValue={(option, value) => option._id === value?._id}
                                                    />
                                                </Box>
                                                <Button
                                                    variant="outlined"
                                                    size="small"
                                                    onClick={() => setOpenAddVendorModal(true)}
                                                    startIcon={<AddIcon sx={{ fontSize: '0.875rem' }} />}
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
                                                    Add New
                                                </Button>
                                            </Box>
                                        )}
                                    </Box>
                                </Grid>
                            </Grid>

                            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
                                <Button
                                    variant="contained"
                                    onClick={addOperation}
                                    startIcon={<AddIcon sx={{ fontSize: '1rem' }} />}
                                    sx={{ height: 36, px: 3, borderRadius: 1.5, fontSize: '0.75rem', textTransform: 'none' }}
                                >
                                    Add Operation
                                </Button>
                            </Box>

                            {formData.operations.length > 0 && (
                                <TableContainer component={Paper} sx={{ mt: 3, borderRadius: 1.5, border: `1px solid ${COLORS.border}` }}>
                                    <Table size="small">
                                        <TableHead>
                                            <TableRow sx={{ bgcolor: COLORS.background.light }}>
                                                <TableCell sx={{ fontWeight: 600, fontSize: '0.7rem' }}>Seq</TableCell>
                                                <TableCell sx={{ fontWeight: 600, fontSize: '0.7rem' }}>Operation</TableCell>
                                                <TableCell sx={{ fontWeight: 600, fontSize: '0.7rem' }}>Work Centre</TableCell>
                                                <TableCell sx={{ fontWeight: 600, fontSize: '0.7rem' }}>Machine</TableCell>
                                                <TableCell sx={{ fontWeight: 600, fontSize: '0.7rem' }}>Setup</TableCell>
                                                <TableCell sx={{ fontWeight: 600, fontSize: '0.7rem' }}>Run</TableCell>
                                                <TableCell sx={{ fontWeight: 600, fontSize: '0.7rem' }}>Torque</TableCell>
                                                <TableCell sx={{ fontWeight: 600, fontSize: '0.7rem' }}>Test</TableCell>
                                                <TableCell sx={{ fontWeight: 600, fontSize: '0.7rem', width: 50 }}>Actions</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {formData.operations.map((op, index) => (
                                                <TableRow key={index}>
                                                    <TableCell sx={{ fontSize: '0.7rem' }}>{op.op_sequence}</TableCell>
                                                    <TableCell sx={{ fontSize: '0.7rem' }}>{op.operation_name}</TableCell>
                                                    <TableCell sx={{ fontSize: '0.7rem' }}>{op.work_centre || '-'}</TableCell>
                                                    <TableCell sx={{ fontSize: '0.7rem' }}>
                                                        {machines.find(m => m._id === op.machine_id)?.machine_name || '-'}
                                                    </TableCell>
                                                    <TableCell sx={{ fontSize: '0.7rem' }}>{op.planned_setup_min}</TableCell>
                                                    <TableCell sx={{ fontSize: '0.7rem' }}>{op.planned_run_min}</TableCell>
                                                    <TableCell sx={{ fontSize: '0.7rem' }}>
                                                        {op.requires_torque_recording ? (
                                                            <Chip label="Yes" size="small" sx={{ fontSize: '0.6rem', height: 20, bgcolor: COLORS.primary, color: '#fff' }} />
                                                        ) : '-'}
                                                    </TableCell>
                                                    <TableCell sx={{ fontSize: '0.7rem' }}>
                                                        {op.requires_functional_test ? (
                                                            <Chip label="Yes" size="small" sx={{ fontSize: '0.6rem', height: 20, bgcolor: COLORS.success, color: '#fff' }} />
                                                        ) : '-'}
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

                            {fieldErrors.operations && (
                                <Typography sx={{ fontSize: '0.65rem', color: '#EF4444', mt: 1 }}>
                                    {fieldErrors.operations}
                                </Typography>
                            )}
                        </Paper>
                    </Stack>
                );

            case 2:
                const totalOperations = formData.operations.length;
                const totalSetupTime = formData.operations.reduce((sum, op) => sum + (op.planned_setup_min || 0), 0);
                const totalRunTime = formData.operations.reduce((sum, op) => sum + (op.planned_run_min || 0), 0);
                const torqueOps = formData.operations.filter(op => op.requires_torque_recording).length;
                const testOps = formData.operations.filter(op => op.requires_functional_test).length;

                return (
                    <Stack spacing={2}>
                        <Paper sx={{ p: 2, borderRadius: 1.5, border: `1px solid ${COLORS.border}` }}>
                            <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color: COLORS.primary, mb: 1.5 }}>
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
                                            <Typography sx={{ fontSize: '0.7rem', color: COLORS.text.secondary }}>Routing Name:</Typography>
                                        </Grid>
                                        <Grid size={{ xs: 6 }}>
                                            <Typography sx={{ fontSize: '0.7rem', fontWeight: 500 }}>{formData.routing_name}</Typography>
                                        </Grid>
                                        <Grid size={{ xs: 6 }}>
                                            <Typography sx={{ fontSize: '0.7rem', color: COLORS.text.secondary }}>Routing Type:</Typography>
                                        </Grid>
                                        <Grid size={{ xs: 6 }}>
                                            <Typography sx={{ fontSize: '0.7rem', fontWeight: 500 }}>{formData.routing_type}</Typography>
                                        </Grid>
                                        <Grid size={{ xs: 6 }}>
                                            <Typography sx={{ fontSize: '0.7rem', color: COLORS.text.secondary }}>Version:</Typography>
                                        </Grid>
                                        <Grid size={{ xs: 6 }}>
                                            <Typography sx={{ fontSize: '0.7rem', fontWeight: 500 }}>{formData.version}</Typography>
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
                                            <Typography sx={{ fontSize: '0.7rem', fontWeight: 500, color: '#059669' }}>{totalOperations}</Typography>
                                        </Grid>
                                        <Grid size={{ xs: 6 }}>
                                            <Typography sx={{ fontSize: '0.7rem', color: COLORS.text.secondary }}>Total Setup Time:</Typography>
                                        </Grid>
                                        <Grid size={{ xs: 6 }}>
                                            <Typography sx={{ fontSize: '0.7rem', fontWeight: 500 }}>{totalSetupTime} min</Typography>
                                        </Grid>
                                        <Grid size={{ xs: 6 }}>
                                            <Typography sx={{ fontSize: '0.7rem', color: COLORS.text.secondary }}>Total Run Time:</Typography>
                                        </Grid>
                                        <Grid size={{ xs: 6 }}>
                                            <Typography sx={{ fontSize: '0.7rem', fontWeight: 500 }}>{totalRunTime} min/unit</Typography>
                                        </Grid>
                                        <Grid size={{ xs: 6 }}>
                                            <Typography sx={{ fontSize: '0.7rem', color: COLORS.text.secondary }}>Torque Recording Ops:</Typography>
                                        </Grid>
                                        <Grid size={{ xs: 6 }}>
                                            <Typography sx={{ fontSize: '0.7rem', fontWeight: 500 }}>{torqueOps}</Typography>
                                        </Grid>
                                        <Grid size={{ xs: 6 }}>
                                            <Typography sx={{ fontSize: '0.7rem', color: COLORS.text.secondary }}>Functional Test Ops:</Typography>
                                        </Grid>
                                        <Grid size={{ xs: 6 }}>
                                            <Typography sx={{ fontSize: '0.7rem', fontWeight: 500 }}>{testOps}</Typography>
                                        </Grid>
                                    </Grid>
                                </Paper>

                                {formData.operations.length > 0 && (
                                    <Paper sx={{ p: 2, bgcolor: COLORS.background.light, borderRadius: 1.5 }}>
                                        <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: COLORS.primary, mb: 1 }}>
                                            Operation Details
                                        </Typography>
                                        <TableContainer>
                                            <Table size="small">
                                                <TableHead>
                                                    <TableRow>
                                                        <TableCell sx={{ fontSize: '0.7rem', fontWeight: 600 }}>Seq</TableCell>
                                                        <TableCell sx={{ fontSize: '0.7rem', fontWeight: 600 }}>Operation</TableCell>
                                                        <TableCell sx={{ fontSize: '0.7rem', fontWeight: 600 }}>Setup</TableCell>
                                                        <TableCell sx={{ fontSize: '0.7rem', fontWeight: 600 }}>Run</TableCell>
                                                        <TableCell sx={{ fontSize: '0.7rem', fontWeight: 600 }}>Torque</TableCell>
                                                        <TableCell sx={{ fontSize: '0.7rem', fontWeight: 600 }}>Test</TableCell>
                                                    </TableRow>
                                                </TableHead>
                                                <TableBody>
                                                    {formData.operations.map((op, index) => (
                                                        <TableRow key={index}>
                                                            <TableCell sx={{ fontSize: '0.7rem' }}>{op.op_sequence}</TableCell>
                                                            <TableCell sx={{ fontSize: '0.7rem' }}>{op.operation_name}</TableCell>
                                                            <TableCell sx={{ fontSize: '0.7rem' }}>{op.planned_setup_min} min</TableCell>
                                                            <TableCell sx={{ fontSize: '0.7rem' }}>{op.planned_run_min} min</TableCell>
                                                            <TableCell sx={{ fontSize: '0.7rem' }}>{op.requires_torque_recording ? 'Yes' : '-'}</TableCell>
                                                            <TableCell sx={{ fontSize: '0.7rem' }}>{op.requires_functional_test ? 'Yes' : '-'}</TableCell>
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        </TableContainer>
                                    </Paper>
                                )}
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
                    overflow: 'hidden'
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
                alignItems: 'center'
            }}>
                <Typography sx={{ fontSize: '1.2rem', fontWeight: 700, color: COLORS.text.primary }}>
                    Create New Routing
                </Typography>
                <IconButton onClick={handleClose} size="small">
                    <CloseIcon fontSize="small" />
                </IconButton>
            </DialogTitle>

            <Box sx={{ px: 2.5, pt: 2, bgcolor: COLORS.background.white }}>
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

            <DialogContent sx={{ p: 2.5, bgcolor: COLORS.background.white }}>
                {renderStepContent(activeStep)}
                {error && (
                    <Alert severity="error" sx={{ mt: 2, borderRadius: 1.5, fontSize: '0.75rem' }}>
                        {error}
                    </Alert>
                )}
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
                        textTransform: 'none'
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
                            textTransform: 'none'
                        }}
                    >
                        Cancel
                    </Button>
                    {activeStep === steps.length - 1 ? (
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
                            {loading ? 'Creating...' : 'Create Routing'}
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

            {/* Remaining modals: Machine, Vendor */}
            <AddMachine
                open={openAddMachineModal}
                onClose={() => setOpenAddMachineModal(false)}
                onAdd={handleMachineAdded}
            />

            <AddVendor
                open={openAddVendorModal}
                onClose={() => setOpenAddVendorModal(false)}
                onAdd={handleVendorAdded}
            />
        </Dialog>
    );
};

export default AddRouting;