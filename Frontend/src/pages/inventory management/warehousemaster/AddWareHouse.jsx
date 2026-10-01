// import React, { useState, useEffect } from "react";
// import {
//   Dialog,
//   DialogContent,
//   TextField,
//   Button,
//   Typography,
//   Grid,
//   IconButton,
//   MenuItem,
//   Select,
//   FormControl,
//   InputLabel,
//   Box,
//   Paper,
//   Alert,
//   CircularProgress,
//   Chip,
//   Stack,
//   Stepper,
//   Step,
//   StepLabel,
//   StepConnector,
//   stepConnectorClasses,
//   styled
// } from "@mui/material";
// import { Add, Delete, Close, Person } from "@mui/icons-material";
// import axios from "axios";
// import BASE_URL from "../../../config/Config";
// import AddEmployees from "../../hrmaster/employeemaster/AddEmployees";

// // Color constants matching ViewWarehouseStock
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
//   border: '#E3E8EF',
//   success: '#10B981',
//   warning: '#F59E0B',
//   error: '#EF4444',
//   info: '#3B82F6'
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

// const steps = ['Warehouse Details', 'Bins Configuration'];

// const warehouseTypes = [
//   "Raw Material",
//   "Finished Goods",
//   "WIP",
//   "Consumable",
//   "Subcontract",
//   "Tool",
//   "Scrap",
//   "Quarantine"
// ];

// const AddWareHouse = ({ open, onClose, onAdd, warehouseId, warehouseName }) => {
//   const [activeStep, setActiveStep] = useState(0);
//   const [loading, setLoading] = useState(false);
//   const [employees, setEmployees] = useState([]);
//   const [errors, setErrors] = useState({});
//   const [fetchingEmployees, setFetchingEmployees] = useState(false);
//   const [addEmployeeOpen, setAddEmployeeOpen] = useState(false);

//   // State for Create Warehouse
//   const [formData, setFormData] = useState({
//     warehouse_name: "",
//     warehouse_type: "",
//     location: "",
//     manager_id: ""
//   });

//   const [bins, setBins] = useState([
//     {
//       bin_id: "",
//       bin_code: "",
//       rack: "",
//       row: "",
//       col: "",
//       capacity: ""
//     }
//   ]);

//   // Helper function to get employee display name
//   const getEmployeeDisplayName = (employee) => {
//     if (!employee) return "Unknown Employee";
//     if (employee.FirstName && employee.LastName) {
//       return `${employee.FirstName} ${employee.LastName}`;
//     }
//     if (employee.FirstName) return employee.FirstName;
//     if (employee.LastName) return employee.LastName;
//     if (employee.name) return employee.name;
//     if (employee.employee_name) return employee.employee_name;
//     if (employee.email) return employee.email.split('@')[0];
//     if (employee.EmployeeID) return `Employee ${employee.EmployeeID}`;
//     return "Unknown Employee";
//   };

//   // Fetch Employees for Manager selection
//   const fetchEmployees = async () => {
//     try {
//       setFetchingEmployees(true);
//       const token = localStorage.getItem("token");
//       const res = await axios.get(`${BASE_URL}/api/employees?page=1&limit=1000`, {
//         headers: { Authorization: `Bearer ${token}` }
//       });

//       if (res.data.success) {
//         const employeeList = res.data.data || [];
//         setEmployees(employeeList);
//       } else {
//         console.error("Failed to fetch employees:", res.data.message);
//       }
//     } catch (err) {
//       console.error("Error fetching employees:", err);
//     } finally {
//       setFetchingEmployees(false);
//     }
//   };

//   const handleEmployeeAdded = (newEmployee) => {
//     setEmployees(prev => [...prev, newEmployee]);
//     setFormData(prev => ({
//       ...prev,
//       manager_id: newEmployee._id
//     }));
//     if (errors.manager_id) {
//       setErrors(prev => ({ ...prev, manager_id: '' }));
//     }
//   };

//   useEffect(() => {
//     if (open) {
//       fetchEmployees();
//       resetForm();
//     }
//   }, [open]);

//   const resetForm = () => {
//     setActiveStep(0);
//     setFormData({
//       warehouse_name: "",
//       warehouse_type: "",
//       location: "",
//       manager_id: ""
//     });
//     setBins([
//       {
//         bin_id: "",
//         bin_code: "",
//         rack: "",
//         row: "",
//         col: "",
//         capacity: ""
//       }
//     ]);
//     setErrors({});
//   };

//   const handleChange = (e) => {
//     setFormData({ ...formData, [e.target.name]: e.target.value });
//     if (errors[e.target.name]) {
//       setErrors({ ...errors, [e.target.name]: "" });
//     }
//   };

//   const handleManagerSelect = (e) => {
//     const value = e.target.value;
//     setFormData({ ...formData, manager_id: value });
//     if (errors.manager_id) {
//       setErrors({ ...errors, manager_id: "" });
//     }
//   };

//   const handleBinChange = (index, field, value) => {
//     const updated = [...bins];
//     updated[index][field] = value;
//     setBins(updated);
    
//     if (errors[`bin_${index}_${field}`]) {
//       setErrors({ ...errors, [`bin_${index}_${field}`]: "" });
//     }
//   };

//   const addBin = () => {
//     setBins([
//       ...bins,
//       { bin_id: "", bin_code: "", rack: "", row: "", col: "", capacity: "" }
//     ]);
//   };

//   const removeBin = (index) => {
//     const updated = bins.filter((_, i) => i !== index);
//     setBins(updated);
//   };

//   const validateStep = (step) => {
//     const newErrors = {};

//     if (step === 0) {
//       if (!formData.warehouse_name.trim()) {
//         newErrors.warehouse_name = "Warehouse name is required";
//       }
//       if (!formData.warehouse_type) {
//         newErrors.warehouse_type = "Warehouse type is required";
//       }
//       if (!formData.location.trim()) {
//         newErrors.location = "Location is required";
//       }
//       if (!formData.manager_id) {
//         newErrors.manager_id = "Manager is required";
//       }
//     } else if (step === 1) {
//       bins.forEach((bin, index) => {
//         if (!bin.bin_id.trim()) {
//           newErrors[`bin_${index}_bin_id`] = "Bin ID is required";
//         }
//         if (!bin.bin_code.trim()) {
//           newErrors[`bin_${index}_bin_code`] = "Bin code is required";
//         }
//         if (!bin.rack.trim()) {
//           newErrors[`bin_${index}_rack`] = "Rack is required";
//         }
//         if (!bin.row) {
//           newErrors[`bin_${index}_row`] = "Row is required";
//         } else if (bin.row <= 0) {
//           newErrors[`bin_${index}_row`] = "Row must be greater than 0";
//         }
//         if (!bin.col) {
//           newErrors[`bin_${index}_col`] = "Column is required";
//         } else if (bin.col <= 0) {
//           newErrors[`bin_${index}_col`] = "Column must be greater than 0";
//         }
//         if (!bin.capacity) {
//           newErrors[`bin_${index}_capacity`] = "Capacity is required";
//         } else if (bin.capacity <= 0) {
//           newErrors[`bin_${index}_capacity`] = "Capacity must be greater than 0";
//         }
//       });
//     }

//     setErrors(newErrors);
//     return Object.keys(newErrors).length === 0;
//   };

//   const handleNext = () => {
//     if (validateStep(activeStep)) {
//       setActiveStep((prevStep) => prevStep + 1);
//     }
//   };

//   const handleBack = () => {
//     setActiveStep((prevStep) => prevStep - 1);
//   };

//   const handleCreateWarehouse = async () => {
//     if (!validateStep(1)) return;

//     try {
//       setLoading(true);
//       const token = localStorage.getItem("token");

//       const payload = {
//         ...formData,
//         bins: bins.map((b) => ({
//           bin_id: b.bin_id.trim(),
//           bin_code: b.bin_code.trim(),
//           rack: b.rack.trim(),
//           row: Number(b.row),
//           col: Number(b.col),
//           capacity: Number(b.capacity)
//         }))
//       };

//       const res = await axios.post(`${BASE_URL}/api/warehouses`, payload, {
//         headers: {
//           Authorization: `Bearer ${token}`,
//           "Content-Type": "application/json"
//         }
//       });

//       if (res.data.success) {
//         if (onAdd) onAdd(res.data.data);
//         onClose();
//       } else {
//         setErrors({ submit: res.data.message || "Failed to create warehouse" });
//       }
//     } catch (err) {
//       console.error("Error creating warehouse:", err);
//       if (err.response?.data?.message) {
//         setErrors({ submit: err.response.data.message });
//       } else {
//         setErrors({ submit: "Failed to create warehouse. Please try again." });
//       }
//     } finally {
//       setLoading(false);
//     }
//   };

//   const renderStepContent = (step) => {
//     switch (step) {
//       case 0:
//         return (
//           <Stack spacing={2}>
//             <Paper sx={{ p: 2, bgcolor: COLORS.background.white, borderRadius: 2, border: `1px solid ${COLORS.border}` }}>
//               <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color: COLORS.primary, mb: 1.5 }}>
//                 Warehouse Information
//               </Typography>
              
//               <Grid container spacing={2}>
//                 <Grid size={{ xs: 12, sm: 6 }}>
//                   <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//                     <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary }}>
//                       WAREHOUSE NAME <span style={{ color: '#EF4444' }}>*</span>
//                     </Typography>
//                     <TextField
//                       fullWidth
//                       name="warehouse_name"
//                       size="small"
//                       value={formData.warehouse_name}
//                       onChange={handleChange}
//                       error={!!errors.warehouse_name}
//                       helperText={errors.warehouse_name}
//                       placeholder="Enter warehouse name"
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
//                       WAREHOUSE TYPE <span style={{ color: '#EF4444' }}>*</span>
//                     </Typography>
//                     <FormControl fullWidth size="small" error={!!errors.warehouse_type}>
//                       <Select
//                         name="warehouse_type"
//                         value={formData.warehouse_type}
//                         onChange={handleChange}
//                         displayEmpty
//                         sx={{ borderRadius: 1.5, fontSize: '0.75rem' }}
//                       >
//                         <MenuItem value="" disabled sx={{ fontSize: '0.75rem' }}>Select warehouse type</MenuItem>
//                         {warehouseTypes.map((type) => (
//                           <MenuItem key={type} value={type} sx={{ fontSize: '0.75rem' }}>{type}</MenuItem>
//                         ))}
//                       </Select>
//                       {errors.warehouse_type && (
//                         <Typography sx={{ fontSize: '0.65rem', color: '#EF4444', mt: 0.5 }}>
//                           {errors.warehouse_type}
//                         </Typography>
//                       )}
//                     </FormControl>
//                   </Box>
//                 </Grid>

//                 <Grid size={{ xs: 12, sm: 6 }}>
//                   <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//                     <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary }}>
//                       LOCATION <span style={{ color: '#EF4444' }}>*</span>
//                     </Typography>
//                     <TextField
//                       fullWidth
//                       name="location"
//                       size="small"
//                       value={formData.location}
//                       onChange={handleChange}
//                       error={!!errors.location}
//                       helperText={errors.location}
//                       placeholder="Enter location"
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
//                       MANAGER <span style={{ color: '#EF4444' }}>*</span>
//                     </Typography>
//                     <Box sx={{ display: 'flex', gap: 1 }}>
//                       <Box sx={{ flex: 1 }}>
//                         <FormControl fullWidth size="small" error={!!errors.manager_id}>
//                           <Select
//                             name="manager_id"
//                             value={formData.manager_id}
//                             onChange={handleManagerSelect}
//                             displayEmpty
//                             sx={{ borderRadius: 1.5, fontSize: '0.75rem' }}
//                             renderValue={(selected) => {
//                               if (!selected) return <span style={{ color: COLORS.text.tertiary }}>Select manager</span>;
//                               const employee = employees.find(emp => emp._id === selected);
//                               return getEmployeeDisplayName(employee);
//                             }}
//                           >
//                             <MenuItem value="" disabled sx={{ fontSize: '0.75rem' }}>Select manager</MenuItem>
//                             {fetchingEmployees ? (
//                               <MenuItem disabled sx={{ fontSize: '0.75rem' }}>
//                                 <CircularProgress size={16} sx={{ mr: 1 }} />
//                                 Loading employees...
//                               </MenuItem>
//                             ) : (
//                               employees.map((emp) => (
//                                 <MenuItem key={emp._id} value={emp._id} sx={{ fontSize: '0.75rem' }}>
//                                   <Stack direction="row" alignItems="center" spacing={1}>
//                                     <Person sx={{ fontSize: '0.875rem', color: COLORS.text.tertiary }} />
//                                     <Typography sx={{ fontWeight: 500, fontSize: '0.75rem' }}>
//                                       {getEmployeeDisplayName(emp)}
//                                     </Typography>
//                                   </Stack>
//                                 </MenuItem>
//                               ))
//                             )}
//                           </Select>
//                           {errors.manager_id && (
//                             <Typography sx={{ fontSize: '0.65rem', color: '#EF4444', mt: 0.5 }}>
//                               {errors.manager_id}
//                             </Typography>
//                           )}
//                         </FormControl>
//                       </Box>
//                       <Button
//                         variant="outlined"
//                         size="small"
//                         onClick={() => setAddEmployeeOpen(true)}
//                         startIcon={<Add sx={{ fontSize: '0.875rem' }} />}
//                         sx={{
//                           height: 32,
//                           px: 1.5,
//                           borderRadius: 1.5,
//                           border: `1px solid ${COLORS.border}`,
//                           color: COLORS.text.secondary,
//                           fontSize: '0.7rem',
//                           textTransform: 'none',
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
//               </Grid>
//             </Paper>
//           </Stack>
//         );

//       case 1:
//         return (
//           <Stack spacing={2}>
//             <Paper sx={{ p: 2, bgcolor: COLORS.background.white, borderRadius: 2, border: `1px solid ${COLORS.border}` }}>
//               <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1.5 }}>
//                 <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color: COLORS.primary }}>
//                   Bins Configuration
//                 </Typography>
//                 <Chip 
//                   label={`${bins.length} bin(s)`} 
//                   size="small" 
//                   sx={{ 
//                     fontSize: "0.65rem", 
//                     height: 22,
//                     bgcolor: COLORS.primaryLight,
//                     color: COLORS.primary
//                   }} 
//                 />
//               </Stack>

//               {bins.map((bin, index) => (
//                 <Paper 
//                   key={index} 
//                   sx={{ 
//                     p: 2, 
//                     mb: 2, 
//                     borderRadius: 2, 
//                     border: `1px solid ${COLORS.border}`, 
//                     bgcolor: COLORS.background.light,
//                     position: 'relative'
//                   }}
//                 >
//                   <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1.5 }}>
//                     <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary }}>
//                       Bin #{index + 1}
//                     </Typography>
//                     {index > 0 && (
//                       <IconButton size="small" onClick={() => removeBin(index)} sx={{ p: 0.5 }}>
//                         <Delete fontSize="small" sx={{ color: '#EF4444' }} />
//                       </IconButton>
//                     )}
//                   </Stack>
                  
//                   <Grid container spacing={1.5}>
//                     <Grid size={{ xs: 12, sm: 4 }}>
//                       <TextField
//                         label="Bin ID"
//                         size="small"
//                         fullWidth
//                         placeholder="e.g., BIN-001"
//                         value={bin.bin_id}
//                         onChange={(e) => handleBinChange(index, "bin_id", e.target.value)}
//                         error={!!errors[`bin_${index}_bin_id`]}
//                         helperText={errors[`bin_${index}_bin_id`]}
//                         sx={{
//                           '& .MuiOutlinedInput-root': {
//                             borderRadius: 1.5,
//                             fontSize: '0.75rem',
//                             '&:hover fieldset': { borderColor: COLORS.primary },
//                             '&.Mui-focused fieldset': { borderColor: COLORS.primary, borderWidth: 1 }
//                           },
//                           '& .MuiInputBase-input': { py: 1, px: 1.5, fontSize: '0.75rem' },
//                           '& .MuiInputLabel-root': { fontSize: '0.7rem' }
//                         }}
//                       />
//                     </Grid>

//                     <Grid size={{ xs: 12, sm: 4 }}>
//                       <TextField
//                         label="Bin Code"
//                         size="small"
//                         fullWidth
//                         placeholder="e.g., A-1-1"
//                         value={bin.bin_code}
//                         onChange={(e) => handleBinChange(index, "bin_code", e.target.value)}
//                         error={!!errors[`bin_${index}_bin_code`]}
//                         helperText={errors[`bin_${index}_bin_code`]}
//                         sx={{
//                           '& .MuiOutlinedInput-root': {
//                             borderRadius: 1.5,
//                             fontSize: '0.75rem',
//                             '&:hover fieldset': { borderColor: COLORS.primary },
//                             '&.Mui-focused fieldset': { borderColor: COLORS.primary, borderWidth: 1 }
//                           },
//                           '& .MuiInputBase-input': { py: 1, px: 1.5, fontSize: '0.75rem' },
//                           '& .MuiInputLabel-root': { fontSize: '0.7rem' }
//                         }}
//                       />
//                     </Grid>

//                     <Grid size={{ xs: 12, sm: 4 }}>
//                       <TextField
//                         label="Rack"
//                         size="small"
//                         fullWidth
//                         placeholder="e.g., A"
//                         value={bin.rack}
//                         onChange={(e) => handleBinChange(index, "rack", e.target.value)}
//                         error={!!errors[`bin_${index}_rack`]}
//                         helperText={errors[`bin_${index}_rack`]}
//                         sx={{
//                           '& .MuiOutlinedInput-root': {
//                             borderRadius: 1.5,
//                             fontSize: '0.75rem',
//                             '&:hover fieldset': { borderColor: COLORS.primary },
//                             '&.Mui-focused fieldset': { borderColor: COLORS.primary, borderWidth: 1 }
//                           },
//                           '& .MuiInputBase-input': { py: 1, px: 1.5, fontSize: '0.75rem' },
//                           '& .MuiInputLabel-root': { fontSize: '0.7rem' }
//                         }}
//                       />
//                     </Grid>

//                     <Grid size={{ xs: 12, sm: 3 }}>
//                       <TextField
//                         label="Row"
//                         size="small"
//                         fullWidth
//                         type="number"
//                         placeholder="1"
//                         value={bin.row}
//                         onChange={(e) => handleBinChange(index, "row", e.target.value)}
//                         error={!!errors[`bin_${index}_row`]}
//                         helperText={errors[`bin_${index}_row`]}
//                         sx={{
//                           '& .MuiOutlinedInput-root': {
//                             borderRadius: 1.5,
//                             fontSize: '0.75rem',
//                             '&:hover fieldset': { borderColor: COLORS.primary },
//                             '&.Mui-focused fieldset': { borderColor: COLORS.primary, borderWidth: 1 }
//                           },
//                           '& .MuiInputBase-input': { py: 1, px: 1.5, fontSize: '0.75rem' },
//                           '& .MuiInputLabel-root': { fontSize: '0.7rem' }
//                         }}
//                       />
//                     </Grid>

//                     <Grid size={{ xs: 12, sm: 3 }}>
//                       <TextField
//                         label="Column"
//                         size="small"
//                         fullWidth
//                         type="number"
//                         placeholder="1"
//                         value={bin.col}
//                         onChange={(e) => handleBinChange(index, "col", e.target.value)}
//                         error={!!errors[`bin_${index}_col`]}
//                         helperText={errors[`bin_${index}_col`]}
//                         sx={{
//                           '& .MuiOutlinedInput-root': {
//                             borderRadius: 1.5,
//                             fontSize: '0.75rem',
//                             '&:hover fieldset': { borderColor: COLORS.primary },
//                             '&.Mui-focused fieldset': { borderColor: COLORS.primary, borderWidth: 1 }
//                           },
//                           '& .MuiInputBase-input': { py: 1, px: 1.5, fontSize: '0.75rem' },
//                           '& .MuiInputLabel-root': { fontSize: '0.7rem' }
//                         }}
//                       />
//                     </Grid>

//                     <Grid size={{ xs: 12, sm: 6 }}>
//                       <TextField
//                         label="Capacity (Units)"
//                         size="small"
//                         fullWidth
//                         type="number"
//                         placeholder="5000"
//                         value={bin.capacity}
//                         onChange={(e) => handleBinChange(index, "capacity", e.target.value)}
//                         error={!!errors[`bin_${index}_capacity`]}
//                         helperText={errors[`bin_${index}_capacity`]}
//                         sx={{
//                           '& .MuiOutlinedInput-root': {
//                             borderRadius: 1.5,
//                             fontSize: '0.75rem',
//                             '&:hover fieldset': { borderColor: COLORS.primary },
//                             '&.Mui-focused fieldset': { borderColor: COLORS.primary, borderWidth: 1 }
//                           },
//                           '& .MuiInputBase-input': { py: 1, px: 1.5, fontSize: '0.75rem' },
//                           '& .MuiInputLabel-root': { fontSize: '0.7rem' }
//                         }}
//                       />
//                     </Grid>
//                   </Grid>
//                 </Paper>
//               ))}

//               <Button
//                 startIcon={<Add sx={{ fontSize: '1rem' }} />}
//                 onClick={addBin}
//                 size="small"
//                 sx={{
//                   textTransform: "none",
//                   fontSize: "0.7rem",
//                   fontWeight: 500,
//                   color: COLORS.primary,
//                   '&:hover': { bgcolor: COLORS.primaryLight }
//                 }}
//               >
//                 Add Another Bin
//               </Button>
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
//             borderRadius: 3,
//             overflow: 'hidden',
//             boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
//             height: 'auto',
//             maxHeight: '90vh'
//           }
//         }}
//       >
//         {/* Header with Gradient */}
//         <Box sx={{ background: HEADER_GRADIENT, py: 1.5, px: 2.5 }}>
//           <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
//             <Stack direction="row" alignItems="center" spacing={1}>
//               <Typography sx={{ fontWeight: 600, color: '#FFFFFF', fontSize: '1rem' }}>
//                 Add Warehouse
//               </Typography>
//             </Stack>
//           </Stack>

//           {/* Stepper */}
//           <Stepper
//             activeStep={activeStep}
//             alternativeLabel
//             connector={<ColorConnector />}
//             sx={{ 
//               mt: 0.5,
//               '& .MuiStepLabel-label': {
//                 color: '#FFFFFF !important',
//                 opacity: 0.8,
//                 fontSize: '0.7rem !important',
//                 '&.Mui-active': {
//                   color: '#FFFFFF !important',
//                   opacity: 1,
//                   fontWeight: 600
//                 },
//                 '&.Mui-completed': {
//                   color: '#FFFFFF !important',
//                   opacity: 1
//                 }
//               }
//             }}
//           >
//             {steps.map((label, index) => (
//               <Step key={label}>
//                 <StepLabel StepIconComponent={CustomStepIcon}>
//                   <Typography fontWeight={500} fontSize="0.7rem">{label}</Typography>
//                 </StepLabel>
//               </Step>
//             ))}
//           </Stepper>
//         </Box>

//         <DialogContent sx={{ 
//           p: 2.5, 
//           overflow: 'auto', 
//           maxHeight: 'calc(90vh - 140px)',
//           backgroundColor: '#F8FFFC'
//         }}>
//           {errors.submit && (
//             <Alert 
//               severity="error" 
//               sx={{ 
//                 borderRadius: 1.5, 
//                 mb: 2,
//                 fontSize: '0.75rem',
//                 py: 0.5
//               }}
//             >
//               {errors.submit}
//             </Alert>
//           )}

//           {renderStepContent(activeStep)}
//         </DialogContent>

//         {/* Footer Actions */}
//         <Box sx={{
//           px: 2.5,
//           py: 1.5,
//           borderTop: '1px solid #E3E8EF',
//           backgroundColor: '#FFFFFF',
//           display: 'flex',
//           justifyContent: 'space-between',
//           alignItems: 'center'
//         }}>
//           <Button
//             onClick={onClose}
//             size="small"
//             sx={{ 
//               color: '#64748B', 
//               fontSize: '0.75rem',
//               textTransform: 'none',
//               '&:hover': { bgcolor: '#F1F5F9' }
//             }}
//           >
//             Cancel
//           </Button>

//           <Stack direction="row" spacing={1}>
//             {activeStep > 0 && (
//               <Button
//                 onClick={handleBack}
//                 size="small"
//                 sx={{ 
//                   color: '#64748B', 
//                   fontSize: '0.75rem',
//                   textTransform: 'none',
//                   '&:hover': { bgcolor: '#F1F5F9' }
//                 }}
//               >
//                 Back
//               </Button>
//             )}
            
//             {activeStep < steps.length - 1 && (
//               <Button
//                 variant="contained"
//                 onClick={handleNext}
//                 size="small"
//                 sx={{
//                   backgroundColor: PRIMARY_DARK,
//                   fontSize: '0.75rem',
//                   textTransform: 'none',
//                   boxShadow: 'none',
//                   '&:hover': { 
//                     backgroundColor: '#05292B',
//                     boxShadow: 'none'
//                   }
//                 }}
//               >
//                 Next
//               </Button>
//             )}
            
//             {activeStep === steps.length - 1 && (
//               <Button
//                 variant="contained"
//                 onClick={handleCreateWarehouse}
//                 disabled={loading}
//                 sx={{
//                   backgroundColor: PRIMARY_DARK,
//                   fontSize: '0.75rem',
//                   textTransform: 'none',
//                   boxShadow: 'none',
//                   '&:hover': { 
//                     backgroundColor: '#05292B',
//                     boxShadow: 'none'
//                   }
//                 }}
//               >
//                 {loading ? <CircularProgress size={16} sx={{ color: '#FFFFFF' }} /> : 'Create Warehouse'}
//               </Button>
//             )}
//           </Stack>
//         </Box>
//       </Dialog>

//       {/* Add Employee Modal */}
//       <AddEmployees
//         open={addEmployeeOpen}
//         onClose={() => setAddEmployeeOpen(false)}
//         onAdd={handleEmployeeAdded}
//       />
//     </>
//   );
// };

// export default AddWareHouse;


import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  TextField,
  Button,
  Typography,
  Grid,
  IconButton,
  MenuItem,
  Select,
  FormControl,
  Box,
  Paper,
  Alert,
  CircularProgress,
  Chip,
  Stack,
  Stepper,
  Step,
  StepLabel,
  StepConnector,
  stepConnectorClasses,
  styled,
  InputAdornment,
  Collapse,
  Autocomplete
} from "@mui/material";
import { Add, Delete, Close, Person, NavigateNext, NavigateBefore, Search } from "@mui/icons-material";
import axios from "axios";
import BASE_URL from "../../../config/Config";

// Color constants
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
  border: '#E3E8EF',
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6'
};

const HEADER_GRADIENT = 'linear-gradient(135deg, #063C3F 0%, #00B4D8 50%, #05292B 100%)';
const PRIMARY_DARK = '#063C3F';
const PRIMARY_BLUE = '#00B4D8';

// Warehouse Stepper Connector
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

// Custom Step Icon
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

const warehouseSteps = ['Warehouse Details', 'Bins Configuration'];
const employeeSteps = ['Personal Info', 'Employment', 'Pay & Work', 'Bank & Emergency'];

const warehouseTypes = [
  "Raw Material",
  "Finished Goods",
  "WIP",
  "Consumable",
  "Subcontract",
  "Tool",
  "Scrap",
  "Quarantine"
];

// Employee form options (copied from AddEmployees)
const genderOptions = [
  { value: 'M', label: 'Male' },
  { value: 'F', label: 'Female' },
  { value: 'O', label: 'Other' }
];

const employmentStatusOptions = [
  { value: 'active', label: 'Active' },
  { value: 'resigned', label: 'Resigned' },
  { value: 'terminated', label: 'Terminated' },
  { value: 'retired', label: 'Retired' }
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

const AddWareHouse = ({ open, onClose, onAdd, warehouseId, warehouseName }) => {
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [employees, setEmployees] = useState([]);
  const [errors, setErrors] = useState({});
  const [fetchingEmployees, setFetchingEmployees] = useState(false);
  const [loadingData, setLoadingData] = useState(false);

  // Warehouse form data
  const [formData, setFormData] = useState({
    warehouse_name: "",
    warehouse_type: "",
    location: "",
    manager_id: ""
  });

  const [bins, setBins] = useState([
    {
      bin_id: "",
      bin_code: "",
      rack: "",
      row: "",
      col: "",
      capacity: ""
    }
  ]);

  // --- Inline Employee form state (full, matches AddEmployees) ---
  const [showAddEmployeeForm, setShowAddEmployeeForm] = useState(false);
  const [isViewMode, setIsViewMode] = useState(false);
  const [employeeStep, setEmployeeStep] = useState(0);
  const [employeeFormData, setEmployeeFormData] = useState({
    // Personal Info
    FirstName: '',
    LastName: '',
    Gender: 'M',
    DateOfBirth: '',
    Email: '',
    Phone: '',
    Address: '',
    // Employment
    DepartmentID: '',
    DesignationID: '',
    DateOfJoining: '',
    EmploymentStatus: 'active',
    EmploymentType: 'Monthly',
    PayStructureType: 'Fixed',
    ContractCompany: '',
    // Pay & Work
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
    // Bank & Emergency
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
  const [employeeFieldErrors, setEmployeeFieldErrors] = useState({});
  const [employeeTouched, setEmployeeTouched] = useState({});
  const [addEmployeeLoading, setAddEmployeeLoading] = useState(false);
  const [addEmployeeError, setAddEmployeeError] = useState('');

  // State for departments and designations (for dropdowns)
  const [departments, setDepartments] = useState([]);
  const [designations, setDesignations] = useState([]);

  // ----- Validation helpers (copied from AddEmployees) -----
  const validateEmail = (email) => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  };

  const validatePhone = (phone) => {
    const cleanPhone = phone.replace(/[\s\-]/g, '').replace(/^\+91/, '');
    const phoneRegex = /^[6-9]\d{9}$/;
    return cleanPhone === '' || phoneRegex.test(cleanPhone);
  };

  const validatePAN = (pan) => {
    const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
    return pan === '' || panRegex.test(pan);
  };

  const validateAadhar = (aadhar) => {
    const aadharRegex = /^\d{12}$/;
    return aadhar === '' || aadharRegex.test(aadhar);
  };

  const validateIFSC = (ifsc) => {
    const ifscRegex = /^[A-Z]{4}0[A-Z0-9]{6}$/;
    return ifsc === '' || ifscRegex.test(ifsc);
  };

  const validateAccountNumber = (accNo) => {
    const accountRegex = /^\d{9,18}$/;
    return accNo === '' || accountRegex.test(accNo);
  };

  const validatePIN = (pin) => {
    const pinRegex = /^\d{6}$/;
    return pin === '' || pinRegex.test(pin);
  };

  const validatePFNumber = (pf) => {
    const pfRegex = /^[A-Z]{2}\/\d{5}\/\d{7}$/;
    return pf === '' || pfRegex.test(pf);
  };

  const validateUAN = (uan) => {
    const uanRegex = /^\d{12}$/;
    return uan === '' || uanRegex.test(uan);
  };

  const validateESINumber = (esi) => {
    const esiRegex = /^\d{17}$/;
    return esi === '' || esiRegex.test(esi);
  };

  const validateName = (name) => {
    const nameRegex = /^[A-Za-z\s.'-]+$/;
    return name === '' || nameRegex.test(name);
  };

  const validateAddress = (address) => {
    const addressRegex = /^[A-Za-z0-9\s,.#\-/]+$/;
    return address === '' || addressRegex.test(address);
  };

  const validateBankName = (bankName) => {
    const bankNameRegex = /^[A-Za-z\s.'&-]+$/;
    return bankName === '' || bankNameRegex.test(bankName);
  };

  const validateBranchName = (branch) => {
    const branchRegex = /^[A-Za-z0-9\s.-]+$/;
    return branch === '' || branchRegex.test(branch);
  };

  const validateWorkStation = (station) => {
    const stationRegex = /^[A-Za-z0-9\s-]+$/;
    return station === '' || stationRegex.test(station);
  };

  const validateRelationship = (relationship) => {
    const relationshipRegex = /^[A-Za-z\s]+$/;
    return relationship === '' || relationshipRegex.test(relationship);
  };

  const validateField = (name, value) => {
    switch (name) {
      case 'FirstName':
      case 'LastName':
      case 'BankAccountHolderName':
      case 'EmergencyContactName':
        if (value && !validateName(value)) {
          return 'Only letters, spaces, dots, and hyphens allowed';
        }
        break;
      case 'Email':
        if (value && !validateEmail(value)) {
          return 'Please enter a valid email address';
        }
        break;
      case 'Phone':
      case 'EmergencyContactPhone':
        if (value && !validatePhone(value)) {
          return 'Please enter a valid 10-digit mobile number starting with 6-9';
        }
        break;
      case 'Address':
      case 'EmergencyContactAddress':
        if (value && !validateAddress(value)) {
          return 'Address contains invalid characters';
        }
        break;
      case 'WorkStation':
      case 'LineNumber':
        if (value && !validateWorkStation(value)) {
          return 'Only letters, numbers, spaces, and hyphens allowed';
        }
        break;
      case 'PAN':
        if (value && !validatePAN(value)) {
          return 'PAN must be in format: ABCDE1234F';
        }
        break;
      case 'AadharNumber':
        if (value && !validateAadhar(value)) {
          return 'Aadhar number must be 12 digits';
        }
        break;
      case 'PFNumber':
        if (value && !validatePFNumber(value)) {
          return 'PF number must be in format: XX/12345/1234567';
        }
        break;
      case 'UAN':
        if (value && !validateUAN(value)) {
          return 'UAN must be 12 digits';
        }
        break;
      case 'ESINumber':
        if (value && !validateESINumber(value)) {
          return 'ESI number must be 17 digits';
        }
        break;
      case 'BankAccountNumber':
        if (value && !validateAccountNumber(value)) {
          return 'Account number must be 9-18 digits';
        }
        break;
      case 'BankName':
        if (value && !validateBankName(value)) {
          return 'Only letters, spaces, dots, and hyphens allowed';
        }
        break;
      case 'BankBranch':
        if (value && !validateBranchName(value)) {
          return 'Only letters, numbers, spaces, dots, and hyphens allowed';
        }
        break;
      case 'BankIfscCode':
        if (value && !validateIFSC(value)) {
          return 'IFSC code must be in format: ABCD0123456';
        }
        break;
      case 'EmergencyContactRelationship':
        if (value && !validateRelationship(value)) {
          return 'Only letters and spaces allowed';
        }
        break;
      case 'EmergencyContactPIN':
        if (value && !validatePIN(value)) {
          return 'PIN code must be 6 digits';
        }
        break;
      case 'ContractCompany':
        if (employeeFormData.EmploymentType === 'contract-based' && !value) {
          return 'Contract company is required for contract-based employees';
        }
        break;
      default:
        return '';
    }
    return '';
  };

  // Fetch departments and designations
  const fetchDropdownData = async () => {
    try {
      setLoadingData(true);
      const token = localStorage.getItem('token');

      const deptResponse = await axios.get(`${BASE_URL}/api/departments`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const desigResponse = await axios.get(`${BASE_URL}/api/designations`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (deptResponse.data.success) {
        setDepartments(deptResponse.data.data || []);
      }

      if (desigResponse.data.success) {
        setDesignations(desigResponse.data.data || []);
      }
    } catch (err) {
      console.error('Error fetching dropdown data:', err);
    } finally {
      setLoadingData(false);
    }
  };

  // Fetch employees
  const fetchEmployees = async () => {
    try {
      setFetchingEmployees(true);
      const token = localStorage.getItem("token");
      const res = await axios.get(`${BASE_URL}/api/employees?page=1&limit=1000`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        setEmployees(res.data.data || []);
      }
    } catch (err) {
      console.error("Error fetching employees:", err);
    } finally {
      setFetchingEmployees(false);
    }
  };

  useEffect(() => {
    if (open) {
      fetchEmployees();
      fetchDropdownData();
      resetForm();
    }
  }, [open]);

  const resetForm = () => {
    setActiveStep(0);
    setFormData({
      warehouse_name: "",
      warehouse_type: "",
      location: "",
      manager_id: ""
    });
    setBins([
      {
        bin_id: "",
        bin_code: "",
        rack: "",
        row: "",
        col: "",
        capacity: ""
      }
    ]);
    setErrors({});
    setShowAddEmployeeForm(false);
    setIsViewMode(false);
    resetEmployeeForm();
  };

  // --- Employee form handlers ---
  const resetEmployeeForm = () => {
    setEmployeeFormData({
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
      EmploymentStatus: 'active',
      EmploymentType: 'Monthly',
      PayStructureType: 'Fixed',
      ContractCompany: '',
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
    setEmployeeFieldErrors({});
    setEmployeeTouched({});
    setAddEmployeeError('');
    setIsViewMode(false);
    setEmployeeStep(0);
  };

  // Employee step validation (copied from AddEmployees)
  const validateEmployeeStep = (step) => {
    const errors = {};
    let isValid = true;
    const data = employeeFormData;

    switch (step) {
      case 0: // Personal Info
        if (!data.FirstName?.trim()) { errors.FirstName = 'First name is required'; isValid = false; }
        if (!data.LastName?.trim()) { errors.LastName = 'Last name is required'; isValid = false; }
        if (!data.Email?.trim()) { errors.Email = 'Email is required'; isValid = false; }
        if (data.Phone) {
          const phoneError = validateField('Phone', data.Phone);
          if (phoneError) { errors.Phone = phoneError; isValid = false; }
        }
        if (data.Address) {
          const addrError = validateField('Address', data.Address);
          if (addrError) { errors.Address = addrError; isValid = false; }
        }
        break;
      case 1: // Employment
        if (!data.DepartmentID) { errors.DepartmentID = 'Department is required'; isValid = false; }
        if (!data.DesignationID) { errors.DesignationID = 'Designation is required'; isValid = false; }
        if (!data.DateOfJoining) { errors.DateOfJoining = 'Date of joining is required'; isValid = false; }
        if (data.EmploymentType === 'contract-based' && !data.ContractCompany) {
          errors.ContractCompany = 'Contract company is required';
          isValid = false;
        }
        break;
      case 2: // Pay & Work
        if ((data.EmploymentType === 'Monthly' || data.EmploymentType === 'contract-based') && !data.BasicSalary) {
          errors.BasicSalary = 'Basic salary is required';
          isValid = false;
        }
        if (data.EmploymentType === 'Hourly' && !data.HourlyRate) {
          errors.HourlyRate = 'Hourly rate is required';
          isValid = false;
        }
        // Validate optional fields if present
        const taxFields = ['PAN', 'AadharNumber', 'PFNumber', 'UAN', 'ESINumber', 'WorkStation', 'LineNumber'];
        taxFields.forEach(field => {
          if (data[field]) {
            const error = validateField(field, data[field]);
            if (error) { errors[field] = error; isValid = false; }
          }
        });
        break;
      case 3: // Bank & Emergency
        const bankFields = ['BankAccountNumber', 'BankAccountHolderName', 'BankName', 'BankBranch', 'BankIfscCode'];
        const hasAnyBankDetail = bankFields.some(field => data[field]);
        if (hasAnyBankDetail) {
          bankFields.forEach(field => {
            if (!data[field]) {
              errors[field] = `${field.replace(/([A-Z])/g, ' $1').trim()} is required when providing bank details`;
              isValid = false;
            } else {
              const error = validateField(field, data[field]);
              if (error) { errors[field] = error; isValid = false; }
            }
          });
        }

        const emergencyFields = ['EmergencyContactName', 'EmergencyContactRelationship', 'EmergencyContactPhone', 'EmergencyContactAddress', 'EmergencyContactPIN'];
        const hasAnyEmergencyDetail = emergencyFields.some(field => data[field]);
        if (hasAnyEmergencyDetail) {
          emergencyFields.forEach(field => {
            if (!data[field]) {
              errors[field] = `${field.replace(/([A-Z])/g, ' $1').trim()} is required when providing emergency contact`;
              isValid = false;
            } else {
              const error = validateField(field, data[field]);
              if (error) { errors[field] = error; isValid = false; }
            }
          });
        }
        break;
      default:
        return true;
    }

    setEmployeeFieldErrors(errors);
    if (!isValid) {
      setAddEmployeeError('Please fix the errors in this section');
    }
    return isValid;
  };

  const handleEmployeeFormChange = (e) => {
    const { name, value } = e.target;

    // Apply field-specific formatting (from AddEmployees)
    let processedValue = value;
    switch (name) {
      case 'FirstName':
      case 'LastName':
      case 'BankAccountHolderName':
      case 'EmergencyContactName':
      case 'EmergencyContactRelationship':
        processedValue = value.replace(/[^A-Za-z\s.'-]/g, '');
        break;
      case 'BankName':
        processedValue = value.replace(/[^A-Za-z\s.'&-]/g, '');
        break;
      case 'Address':
      case 'EmergencyContactAddress':
        processedValue = value.replace(/[^A-Za-z0-9\s,.#\-/]/g, '');
        break;
      case 'WorkStation':
      case 'LineNumber':
        processedValue = value.replace(/[^A-Za-z0-9\s-]/g, '');
        break;
      case 'BankBranch':
        processedValue = value.replace(/[^A-Za-z0-9\s.-]/g, '');
        break;
      case 'Phone':
      case 'EmergencyContactPhone':
      case 'BankAccountNumber':
      case 'AadharNumber':
      case 'UAN':
      case 'ESINumber':
      case 'EmergencyContactPIN':
        processedValue = value.replace(/\D/g, '');
        break;
      case 'PAN':
      case 'BankIfscCode':
        processedValue = value.toUpperCase().replace(/[^A-Z0-9]/g, '');
        break;
      case 'PFNumber':
        processedValue = value.toUpperCase().replace(/[^A-Z0-9/]/g, '');
        break;
      default:
        processedValue = value;
    }

    setEmployeeFormData(prev => ({ ...prev, [name]: processedValue }));
    setEmployeeFieldErrors(prev => ({ ...prev, [name]: '' }));
    if (employeeTouched[name] || processedValue) {
      const error = validateField(name, processedValue);
      setEmployeeFieldErrors(prev => ({ ...prev, [name]: error }));
    }
  };

  const handleEmployeeBlur = (e) => {
    const { name, value } = e.target;
    setEmployeeTouched(prev => ({ ...prev, [name]: true }));
    const error = validateField(name, value);
    setEmployeeFieldErrors(prev => ({ ...prev, [name]: error }));
  };

  const handleEmploymentTypeChange = (e) => {
    const employmentType = e.target.value;
    let defaultPayStructure = 'Fixed';
    if (employmentType === 'PieceRate') {
      defaultPayStructure = 'PieceRate';
    }
    setEmployeeFormData(prev => ({
      ...prev,
      EmploymentType: employmentType,
      PayStructureType: defaultPayStructure
    }));
  };

  const handleEmployeeNext = () => {
    if (validateEmployeeStep(employeeStep)) {
      setAddEmployeeError('');
      setEmployeeStep(prev => prev + 1);
    }
  };

  const handleEmployeeBack = () => {
    setAddEmployeeError('');
    setEmployeeStep(prev => prev - 1);
  };

  const handleAddEmployeeSubmit = async () => {
    // Validate all steps
    let valid = true;
    for (let i = 0; i < employeeSteps.length; i++) {
      if (!validateEmployeeStep(i)) {
        valid = false;
        setEmployeeStep(i);
        break;
      }
    }
    if (!valid) {
      setAddEmployeeError('Please fix all errors');
      return;
    }

    setAddEmployeeLoading(true);
    setAddEmployeeError('');

    try {
      const token = localStorage.getItem('token');
      const payload = {
        FirstName: employeeFormData.FirstName.trim(),
        LastName: employeeFormData.LastName.trim(),
        Gender: employeeFormData.Gender,
        DateOfBirth: employeeFormData.DateOfBirth || undefined,
        Email: employeeFormData.Email.trim(),
        Phone: employeeFormData.Phone || undefined,
        Address: employeeFormData.Address || undefined,
        DepartmentID: employeeFormData.DepartmentID,
        DesignationID: employeeFormData.DesignationID,
        DateOfJoining: employeeFormData.DateOfJoining,
        EmploymentStatus: employeeFormData.EmploymentStatus,
        EmploymentType: employeeFormData.EmploymentType,
        PayStructureType: employeeFormData.PayStructureType,
        ContractCompany: employeeFormData.ContractCompany || undefined,
        BasicSalary: (employeeFormData.EmploymentType === 'Monthly' || employeeFormData.EmploymentType === 'contract-based') ? Number(employeeFormData.BasicSalary || 0) : 0,
        HourlyRate: employeeFormData.EmploymentType === 'Hourly' ? Number(employeeFormData.HourlyRate || 0) : 0,
        OvertimeRateMultiplier: Number(employeeFormData.OvertimeRateMultiplier || 1.5),
        SkillLevel: employeeFormData.SkillLevel || undefined,
        WorkStation: employeeFormData.WorkStation || undefined,
        LineNumber: employeeFormData.LineNumber || undefined,
        PAN: employeeFormData.PAN || undefined,
        AadharNumber: employeeFormData.AadharNumber || undefined,
        PFNumber: employeeFormData.PFNumber || undefined,
        UAN: employeeFormData.UAN || undefined,
        ESINumber: employeeFormData.ESINumber || undefined
      };

      // Add BankDetails if any field is provided
      if (employeeFormData.BankAccountNumber || employeeFormData.BankAccountHolderName ||
          employeeFormData.BankName || employeeFormData.BankBranch || employeeFormData.BankIfscCode) {
        payload.BankDetails = {
          accountNumber: employeeFormData.BankAccountNumber,
          accountHolderName: employeeFormData.BankAccountHolderName,
          bankName: employeeFormData.BankName,
          branch: employeeFormData.BankBranch,
          ifscCode: employeeFormData.BankIfscCode,
          accountType: employeeFormData.BankAccountType
        };
      }

      // Add EmergencyContact if any field is provided
      if (employeeFormData.EmergencyContactName || employeeFormData.EmergencyContactRelationship ||
          employeeFormData.EmergencyContactPhone || employeeFormData.EmergencyContactAddress || employeeFormData.EmergencyContactPIN) {
        payload.EmergencyContact = {
          name: employeeFormData.EmergencyContactName,
          relationship: employeeFormData.EmergencyContactRelationship,
          phone: employeeFormData.EmergencyContactPhone,
          address: employeeFormData.EmergencyContactAddress,
          pinCode: employeeFormData.EmergencyContactPIN
        };
      }

      // Remove undefined values
      Object.keys(payload).forEach(key =>
        payload[key] === undefined && delete payload[key]
      );

      const response = await axios.post(`${BASE_URL}/api/employees`, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.data.success) {
        const newEmployee = response.data.data;
        setEmployees(prev => [...prev, newEmployee]);
        setFormData(prev => ({ ...prev, manager_id: newEmployee._id }));
        if (errors.manager_id) {
          setErrors(prev => ({ ...prev, manager_id: '' }));
        }
        setShowAddEmployeeForm(false);
        resetEmployeeForm();
      } else {
        setAddEmployeeError(response.data.message || 'Failed to add employee');
      }
    } catch (err) {
      console.error('Error adding employee:', err);
      setAddEmployeeError(err.response?.data?.message || 'Failed to add employee. Please try again.');
    } finally {
      setAddEmployeeLoading(false);
    }
  };

  // --- Render employee step content (4 steps) exactly like AddEmployees ---
  const renderEmployeeStepContent = (step) => {
    const data = employeeFormData;
    const errors = employeeFieldErrors;
    const handleChange = handleEmployeeFormChange;
    const handleBlur = handleEmployeeBlur;
    const disabled = isViewMode || addEmployeeLoading || loadingData;

    const textFieldStyles = {
      '& .MuiOutlinedInput-root': {
        borderRadius: 1.5,
        fontSize: '0.75rem',
        '&:hover fieldset': { borderColor: COLORS.primary },
        '&.Mui-focused fieldset': { borderColor: COLORS.primary, borderWidth: 1 },
        '&.Mui-error fieldset': { borderColor: '#EF4444' }
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
      },
      '& input[type=number]': {
        MozAppearance: 'textfield'
      },
      '& input[type=number]::-webkit-outer-spin-button, & input[type=number]::-webkit-inner-spin-button': {
        WebkitAppearance: 'none',
        margin: 0
      }
    };

    const selectStyles = {
      borderRadius: 1.5,
      fontSize: '0.75rem',
      '& .MuiSelect-select': {
        py: 1,
        fontSize: '0.75rem'
      },
      '&:hover .MuiOutlinedInput-notchedOutline': {
        borderColor: COLORS.primary
      },
      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
        borderColor: COLORS.primary,
        borderWidth: 1
      }
    };

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

    switch (step) {
      case 0: // Personal Info
        return (
          <Grid container spacing={1.5}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                <Label required>FIRST NAME</Label>
                <TextField
                  fullWidth size="small" name="FirstName"
                  value={data.FirstName}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="e.g., John"
                  error={!!errors.FirstName}
                  helperText={errors.FirstName}
                  sx={textFieldStyles}
                  disabled={disabled}
                />
                <Typography sx={{ fontSize: '0.65rem', color: COLORS.text.tertiary }}>
                  Letters, spaces, dots, and hyphens only
                </Typography>
              </Box>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                <Label required>LAST NAME</Label>
                <TextField
                  fullWidth size="small" name="LastName"
                  value={data.LastName}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="e.g., Doe"
                  error={!!errors.LastName}
                  helperText={errors.LastName}
                  sx={textFieldStyles}
                  disabled={disabled}
                />
                <Typography sx={{ fontSize: '0.65rem', color: COLORS.text.tertiary }}>
                  Letters, spaces, dots, and hyphens only
                </Typography>
              </Box>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                <Label>GENDER</Label>
                <FormControl fullWidth size="small">
                  <Select
                    name="Gender"
                    value={data.Gender}
                    onChange={handleChange}
                    disabled={disabled}
                    sx={selectStyles}
                  >
                    {genderOptions.map(option => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                <Label>DATE OF BIRTH</Label>
                <TextField
                  fullWidth size="small" name="DateOfBirth"
                  type="date"
                  value={data.DateOfBirth}
                  onChange={handleChange}
                  disabled={disabled}
                  InputLabelProps={{ shrink: true }}
                  sx={textFieldStyles}
                />
              </Box>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                <Label required>EMAIL</Label>
                <TextField
                  fullWidth size="small" name="Email"
                  type="email"
                  value={data.Email}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="john.doe@company.com"
                  error={!!errors.Email}
                  helperText={errors.Email}
                  sx={textFieldStyles}
                  disabled={disabled}
                />
                <Typography sx={{ fontSize: '0.65rem', color: COLORS.text.tertiary }}>
                  e.g., john.doe@company.com
                </Typography>
              </Box>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                <Label>PHONE</Label>
                <TextField
                  fullWidth size="small" name="Phone"
                  value={data.Phone}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="9876543210"
                  error={!!errors.Phone}
                  helperText={errors.Phone}
                  inputProps={{ maxLength: 10 }}
                  sx={textFieldStyles}
                  disabled={disabled}
                />
                <Typography sx={{ fontSize: '0.65rem', color: COLORS.text.tertiary }}>
                  10-digit mobile number starting with 6-9
                </Typography>
              </Box>
            </Grid>
            <Grid size={{ xs: 12 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                <Label>ADDRESS</Label>
                <TextField
                  fullWidth size="small" name="Address"
                  multiline rows={2}
                  value={data.Address}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="Enter complete address"
                  error={!!errors.Address}
                  helperText={errors.Address}
                  sx={textFieldStyles}
                  disabled={disabled}
                />
              </Box>
            </Grid>
          </Grid>
        );

      case 1: // Employment
        return (
          <Grid container spacing={1.5}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                <Label required>DEPARTMENT</Label>
                <Autocomplete
                  options={departments}
                  getOptionLabel={(option) => option?.DepartmentName || ''}
                  value={departments.find(dept => dept._id === data.DepartmentID) || null}
                  onChange={(event, newValue) => {
                    setEmployeeFormData(prev => ({
                      ...prev,
                      DepartmentID: newValue?._id || ''
                    }));
                    if (errors.DepartmentID) {
                      setEmployeeFieldErrors(prev => ({ ...prev, DepartmentID: '' }));
                    }
                  }}
                  loading={loadingData}
                  disabled={disabled}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      size="small"
                      placeholder="Select department"
                      error={!!errors.DepartmentID}
                      helperText={errors.DepartmentID}
                      sx={textFieldStyles}
                      InputProps={{
                        ...params.InputProps,
                        startAdornment: (
                          <InputAdornment position="start">
                            <Search sx={{ fontSize: '1rem', color: COLORS.text.tertiary }} />
                          </InputAdornment>
                        ),
                      }}
                    />
                  )}
                />
              </Box>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                <Label required>DESIGNATION</Label>
                <Autocomplete
                  options={designations}
                  getOptionLabel={(option) => option?.DesignationName || ''}
                  value={designations.find(desig => desig._id === data.DesignationID) || null}
                  onChange={(event, newValue) => {
                    setEmployeeFormData(prev => ({
                      ...prev,
                      DesignationID: newValue?._id || ''
                    }));
                    if (errors.DesignationID) {
                      setEmployeeFieldErrors(prev => ({ ...prev, DesignationID: '' }));
                    }
                  }}
                  loading={loadingData}
                  disabled={disabled}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      size="small"
                      placeholder="Select designation"
                      error={!!errors.DesignationID}
                      helperText={errors.DesignationID}
                      sx={textFieldStyles}
                      InputProps={{
                        ...params.InputProps,
                        startAdornment: (
                          <InputAdornment position="start">
                            <Search sx={{ fontSize: '1rem', color: COLORS.text.tertiary }} />
                          </InputAdornment>
                        ),
                      }}
                    />
                  )}
                />
              </Box>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                <Label required>DATE OF JOINING</Label>
                <TextField
                  fullWidth size="small" name="DateOfJoining"
                  type="date"
                  value={data.DateOfJoining}
                  onChange={handleChange}
                  disabled={disabled}
                  InputLabelProps={{ shrink: true }}
                  error={!!errors.DateOfJoining}
                  helperText={errors.DateOfJoining}
                  sx={textFieldStyles}
                />
              </Box>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                <Label required>EMPLOYMENT TYPE</Label>
                <FormControl fullWidth size="small">
                  <Select
                    name="EmploymentType"
                    value={data.EmploymentType}
                    onChange={handleEmploymentTypeChange}
                    disabled={disabled}
                    sx={selectStyles}
                  >
                    {employmentTypeOptions.map(option => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
            </Grid>
            {data.EmploymentType === 'contract-based' && (
              <Grid size={{ xs: 12, sm: 6 }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                  <Label required>CONTRACT COMPANY</Label>
                  <FormControl fullWidth size="small">
                    <Select
                      name="ContractCompany"
                      value={data.ContractCompany}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      disabled={disabled}
                      error={!!errors.ContractCompany}
                      sx={selectStyles}
                    >
                      <MenuItem value="">Select Contract Company</MenuItem>
                      {contractCompanyOptions.map(option => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  {errors.ContractCompany && (
                    <Typography sx={{ fontSize: '0.65rem', color: '#EF4444' }}>
                      {errors.ContractCompany}
                    </Typography>
                  )}
                </Box>
              </Grid>
            )}
          </Grid>
        );

      case 2: // Pay & Work
        return (
          <Grid container spacing={1.5}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                <Label>PAY STRUCTURE TYPE</Label>
                <FormControl fullWidth size="small">
                  <Select
                    name="PayStructureType"
                    value={data.PayStructureType}
                    onChange={handleChange}
                    disabled={disabled}
                    sx={selectStyles}
                  >
                    {payStructureOptions.map(option => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
            </Grid>
            {(data.EmploymentType === 'Monthly' || data.EmploymentType === 'contract-based') && (
              <Grid size={{ xs: 12, sm: 6 }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                  <Label required>BASIC SALARY</Label>
                  <TextField
                    fullWidth size="small" name="BasicSalary"
                    type="number"
                    value={data.BasicSalary}
                    onChange={handleChange}
                    disabled={disabled}
                    placeholder="e.g., 25000"
                    error={!!errors.BasicSalary}
                    helperText={errors.BasicSalary}
                    inputProps={{ min: 0 }}
                    sx={textFieldStyles}
                  />
                </Box>
              </Grid>
            )}
            {data.EmploymentType === 'Hourly' && (
              <Grid size={{ xs: 12, sm: 6 }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                  <Label required>HOURLY RATE</Label>
                  <TextField
                    fullWidth size="small" name="HourlyRate"
                    type="number"
                    value={data.HourlyRate}
                    onChange={handleChange}
                    disabled={disabled}
                    placeholder="e.g., 150"
                    error={!!errors.HourlyRate}
                    helperText={errors.HourlyRate}
                    inputProps={{ min: 0, step: 0.01 }}
                    sx={textFieldStyles}
                  />
                </Box>
              </Grid>
            )}
            {data.EmploymentType !== 'PieceRate' && (
              <>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                    <Label>OVERTIME MULTIPLIER</Label>
                    <TextField
                      fullWidth size="small" name="OvertimeRateMultiplier"
                      type="number"
                      value={data.OvertimeRateMultiplier}
                      onChange={handleChange}
                      disabled={disabled}
                      inputProps={{ step: 0.25, min: 1, max: 3 }}
                      sx={textFieldStyles}
                    />
                  </Box>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                    <Label>SKILL LEVEL</Label>
                    <FormControl fullWidth size="small">
                      <Select
                        name="SkillLevel"
                        value={data.SkillLevel}
                        onChange={handleChange}
                        disabled={disabled}
                        sx={selectStyles}
                      >
                        <MenuItem value="">None</MenuItem>
                        {skillLevelOptions.map(option => (
                          <MenuItem key={option.value} value={option.value}>
                            {option.label}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Box>
                </Grid>
              </>
            )}
            <Grid size={{ xs: 12, sm: 6 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                <Label>WORK STATION</Label>
                <TextField
                  fullWidth size="small" name="WorkStation"
                  value={data.WorkStation}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  disabled={disabled}
                  placeholder="e.g., Station A"
                  error={!!errors.WorkStation}
                  helperText={errors.WorkStation}
                  sx={textFieldStyles}
                />
                <Typography sx={{ fontSize: '0.65rem', color: COLORS.text.tertiary }}>
                  Letters, numbers, spaces, and hyphens only
                </Typography>
              </Box>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                <Label>LINE NUMBER</Label>
                <TextField
                  fullWidth size="small" name="LineNumber"
                  value={data.LineNumber}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  disabled={disabled}
                  placeholder="e.g., Line 1"
                  error={!!errors.LineNumber}
                  helperText={errors.LineNumber}
                  sx={textFieldStyles}
                />
                <Typography sx={{ fontSize: '0.65rem', color: COLORS.text.tertiary }}>
                  Letters, numbers, spaces, and hyphens only
                </Typography>
              </Box>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                <Label>PAN</Label>
                <TextField
                  fullWidth size="small" name="PAN"
                  value={data.PAN}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  disabled={disabled}
                  placeholder="ABCDE1234F"
                  error={!!errors.PAN}
                  helperText={errors.PAN}
                  inputProps={{ maxLength: 10 }}
                  sx={textFieldStyles}
                />
                <Typography sx={{ fontSize: '0.65rem', color: COLORS.text.tertiary }}>
                  5 letters + 4 numbers + 1 letter
                </Typography>
              </Box>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                <Label>AADHAR NUMBER</Label>
                <TextField
                  fullWidth size="small" name="AadharNumber"
                  value={data.AadharNumber}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  disabled={disabled}
                  placeholder="123456789012"
                  error={!!errors.AadharNumber}
                  helperText={errors.AadharNumber}
                  inputProps={{ maxLength: 12 }}
                  sx={textFieldStyles}
                />
                <Typography sx={{ fontSize: '0.65rem', color: COLORS.text.tertiary }}>
                  12 digits
                </Typography>
              </Box>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                <Label>PF NUMBER</Label>
                <TextField
                  fullWidth size="small" name="PFNumber"
                  value={data.PFNumber}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  disabled={disabled}
                  placeholder="AB/12345/1234567"
                  error={!!errors.PFNumber}
                  helperText={errors.PFNumber}
                  sx={textFieldStyles}
                />
                <Typography sx={{ fontSize: '0.65rem', color: COLORS.text.tertiary }}>
                  Format: XX/12345/1234567
                </Typography>
              </Box>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                <Label>UAN</Label>
                <TextField
                  fullWidth size="small" name="UAN"
                  value={data.UAN}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  disabled={disabled}
                  placeholder="123456789012"
                  error={!!errors.UAN}
                  helperText={errors.UAN}
                  inputProps={{ maxLength: 12 }}
                  sx={textFieldStyles}
                />
                <Typography sx={{ fontSize: '0.65rem', color: COLORS.text.tertiary }}>
                  12 digits
                </Typography>
              </Box>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                <Label>ESI NUMBER</Label>
                <TextField
                  fullWidth size="small" name="ESINumber"
                  value={data.ESINumber}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  disabled={disabled}
                  placeholder="12345678901234567"
                  error={!!errors.ESINumber}
                  helperText={errors.ESINumber}
                  inputProps={{ maxLength: 17 }}
                  sx={textFieldStyles}
                />
                <Typography sx={{ fontSize: '0.65rem', color: COLORS.text.tertiary }}>
                  17 digits
                </Typography>
              </Box>
            </Grid>
          </Grid>
        );

      case 3: // Bank & Emergency
        return (
          <>
            <Grid container spacing={1.5}>
              <Grid size={{ xs: 12 }}>
                <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: COLORS.primary, mb: 1 }}>
                  Bank Details
                  <Typography component="span" sx={{ fontSize: '0.65rem', ml: 1, color: COLORS.text.tertiary, fontWeight: 'normal' }}>
                    (All fields optional, but if provided, all are required)
                  </Typography>
                </Typography>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                  <Label>ACCOUNT NUMBER</Label>
                  <TextField
                    fullWidth size="small" name="BankAccountNumber"
                    value={data.BankAccountNumber}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    disabled={disabled}
                    placeholder="123456789"
                    error={!!errors.BankAccountNumber}
                    helperText={errors.BankAccountNumber}
                    inputProps={{ maxLength: 18 }}
                    sx={textFieldStyles}
                  />
                  <Typography sx={{ fontSize: '0.65rem', color: COLORS.text.tertiary }}>
                    9-18 digits only
                  </Typography>
                </Box>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                  <Label>ACCOUNT HOLDER NAME</Label>
                  <TextField
                    fullWidth size="small" name="BankAccountHolderName"
                    value={data.BankAccountHolderName}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    disabled={disabled}
                    placeholder="John Doe"
                    error={!!errors.BankAccountHolderName}
                    helperText={errors.BankAccountHolderName}
                    sx={textFieldStyles}
                  />
                  <Typography sx={{ fontSize: '0.65rem', color: COLORS.text.tertiary }}>
                    Letters, spaces, dots, and hyphens only
                  </Typography>
                </Box>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                  <Label>BANK NAME</Label>
                  <TextField
                    fullWidth size="small" name="BankName"
                    value={data.BankName}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    disabled={disabled}
                    placeholder="State Bank of India"
                    error={!!errors.BankName}
                    helperText={errors.BankName}
                    sx={textFieldStyles}
                  />
                  <Typography sx={{ fontSize: '0.65rem', color: COLORS.text.tertiary }}>
                    Letters, spaces, dots, and hyphens only
                  </Typography>
                </Box>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                  <Label>BRANCH</Label>
                  <TextField
                    fullWidth size="small" name="BankBranch"
                    value={data.BankBranch}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    disabled={disabled}
                    placeholder="Main Branch"
                    error={!!errors.BankBranch}
                    helperText={errors.BankBranch}
                    sx={textFieldStyles}
                  />
                  <Typography sx={{ fontSize: '0.65rem', color: COLORS.text.tertiary }}>
                    Letters, numbers, spaces, dots, and hyphens only
                  </Typography>
                </Box>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                  <Label>IFSC CODE</Label>
                  <TextField
                    fullWidth size="small" name="BankIfscCode"
                    value={data.BankIfscCode}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    disabled={disabled}
                    placeholder="SBIN0123456"
                    error={!!errors.BankIfscCode}
                    helperText={errors.BankIfscCode}
                    inputProps={{ maxLength: 11 }}
                    sx={textFieldStyles}
                  />
                  <Typography sx={{ fontSize: '0.65rem', color: COLORS.text.tertiary }}>
                    4 letters + 0 + 6 alphanumeric
                  </Typography>
                </Box>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                  <Label>ACCOUNT TYPE</Label>
                  <FormControl fullWidth size="small">
                    <Select
                      name="BankAccountType"
                      value={data.BankAccountType}
                      onChange={handleChange}
                      disabled={disabled}
                      sx={selectStyles}
                    >
                      {accountTypeOptions.map(option => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>
              </Grid>
            </Grid>

            <Box sx={{ mt: 2 }}>
              <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: COLORS.primary, mb: 1 }}>
                Emergency Contact
                <Typography component="span" sx={{ fontSize: '0.65rem', ml: 1, color: COLORS.text.tertiary, fontWeight: 'normal' }}>
                  (All fields optional, but if provided, all are required)
                </Typography>
              </Typography>
              <Grid container spacing={1.5}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                    <Label>CONTACT NAME</Label>
                    <TextField
                      fullWidth size="small" name="EmergencyContactName"
                      value={data.EmergencyContactName}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      disabled={disabled}
                      placeholder="Jane Doe"
                      error={!!errors.EmergencyContactName}
                      helperText={errors.EmergencyContactName}
                      sx={textFieldStyles}
                    />
                    <Typography sx={{ fontSize: '0.65rem', color: COLORS.text.tertiary }}>
                      Letters, spaces, dots, and hyphens only
                    </Typography>
                  </Box>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                    <Label>RELATIONSHIP</Label>
                    <TextField
                      fullWidth size="small" name="EmergencyContactRelationship"
                      value={data.EmergencyContactRelationship}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      disabled={disabled}
                      placeholder="Spouse"
                      error={!!errors.EmergencyContactRelationship}
                      helperText={errors.EmergencyContactRelationship}
                      sx={textFieldStyles}
                    />
                    <Typography sx={{ fontSize: '0.65rem', color: COLORS.text.tertiary }}>
                      Letters and spaces only
                    </Typography>
                  </Box>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                    <Label>PHONE</Label>
                    <TextField
                      fullWidth size="small" name="EmergencyContactPhone"
                      value={data.EmergencyContactPhone}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      disabled={disabled}
                      placeholder="9876543210"
                      error={!!errors.EmergencyContactPhone}
                      helperText={errors.EmergencyContactPhone}
                      inputProps={{ maxLength: 10 }}
                      sx={textFieldStyles}
                    />
                    <Typography sx={{ fontSize: '0.65rem', color: COLORS.text.tertiary }}>
                      10-digit mobile number starting with 6-9
                    </Typography>
                  </Box>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                    <Label>PIN CODE</Label>
                    <TextField
                      fullWidth size="small" name="EmergencyContactPIN"
                      value={data.EmergencyContactPIN}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      disabled={disabled}
                      placeholder="400001"
                      error={!!errors.EmergencyContactPIN}
                      helperText={errors.EmergencyContactPIN}
                      inputProps={{ maxLength: 6 }}
                      sx={textFieldStyles}
                    />
                    <Typography sx={{ fontSize: '0.65rem', color: COLORS.text.tertiary }}>
                      6 digits
                    </Typography>
                  </Box>
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                    <Label>ADDRESS</Label>
                    <TextField
                      fullWidth size="small" name="EmergencyContactAddress"
                      multiline rows={2}
                      value={data.EmergencyContactAddress}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      disabled={disabled}
                      placeholder="Enter complete address"
                      error={!!errors.EmergencyContactAddress}
                      helperText={errors.EmergencyContactAddress}
                      sx={textFieldStyles}
                    />
                  </Box>
                </Grid>
              </Grid>
            </Box>
          </>
        );

      default:
        return null;
    }
  };

  // --- Render inline employee form with stepper ---
  const renderInlineEmployeeForm = () => (
    <Box sx={{ mt: 2, p: 2, bgcolor: COLORS.background.white, borderRadius: 1.5, border: `1px solid ${COLORS.border}` }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color: COLORS.primary }}>
          {isViewMode ? 'Employee Details' : 'Add New Employee'}
        </Typography>
        <IconButton
          size="small"
          onClick={() => {
            setShowAddEmployeeForm(false);
            resetEmployeeForm();
            if (isViewMode) {
              setFormData(prev => ({ ...prev, manager_id: '' }));
            }
          }}
          sx={{ color: COLORS.text.tertiary, '&:hover': { color: COLORS.primary } }}
        >
          <Close sx={{ fontSize: '1rem' }} />
        </IconButton>
      </Box>

      <Stepper activeStep={employeeStep} sx={{ mb: 3 }} connector={<ColorConnector />}>
        {employeeSteps.map((label) => (
          <Step key={label}>
            <StepLabel>
              <Typography sx={{ fontSize: '0.65rem', fontWeight: 500 }}>{label}</Typography>
            </StepLabel>
          </Step>
        ))}
      </Stepper>

      {renderEmployeeStepContent(employeeStep)}

      {addEmployeeError && (
        <Alert severity="error" sx={{ mt: 2, borderRadius: 1.5, fontSize: '0.75rem', py: 0.5 }}>
          {addEmployeeError}
        </Alert>
      )}

      {!isViewMode && (
        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Button
            onClick={handleEmployeeBack}
            disabled={employeeStep === 0 || addEmployeeLoading}
            size="small"
            startIcon={<NavigateBefore sx={{ fontSize: '1rem' }} />}
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
                setShowAddEmployeeForm(false);
                resetEmployeeForm();
              }}
              disabled={addEmployeeLoading}
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
            {employeeStep === employeeSteps.length - 1 ? (
              <Button
                variant="contained"
                onClick={handleAddEmployeeSubmit}
                disabled={addEmployeeLoading}
                size="small"
                startIcon={<Add sx={{ fontSize: '1rem' }} />}
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
                {addEmployeeLoading ? 'Adding...' : 'Add Employee'}
              </Button>
            ) : (
              <Button
                variant="contained"
                onClick={handleEmployeeNext}
                disabled={addEmployeeLoading}
                size="small"
                endIcon={<NavigateNext sx={{ fontSize: '1rem' }} />}
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
      )}
    </Box>
  );

  // --- Warehouse handlers ---
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: "" });
    }
  };

  // When manager is selected, load data into inline form (view mode)
  const handleManagerSelect = (e) => {
    const value = e.target.value;
    setFormData({ ...formData, manager_id: value });
    if (errors.manager_id) {
      setErrors({ ...errors, manager_id: "" });
    }
    if (value) {
      const selected = employees.find(emp => emp._id === value);
      if (selected) {
        setEmployeeFormData({
          FirstName: selected.FirstName || '',
          LastName: selected.LastName || '',
          Gender: selected.Gender || 'M',
          DateOfBirth: selected.DateOfBirth || '',
          Email: selected.Email || '',
          Phone: selected.Phone || '',
          Address: selected.Address || '',
          DepartmentID: selected.DepartmentID || '',
          DesignationID: selected.DesignationID || '',
          DateOfJoining: selected.DateOfJoining || '',
          EmploymentStatus: selected.EmploymentStatus || 'active',
          EmploymentType: selected.EmploymentType || 'Monthly',
          PayStructureType: selected.PayStructureType || 'Fixed',
          ContractCompany: selected.ContractCompany || '',
          BasicSalary: selected.BasicSalary || '',
          HourlyRate: selected.HourlyRate || '',
          OvertimeRateMultiplier: selected.OvertimeRateMultiplier || '1.5',
          SkillLevel: selected.SkillLevel || '',
          WorkStation: selected.WorkStation || '',
          LineNumber: selected.LineNumber || '',
          PAN: selected.PAN || '',
          AadharNumber: selected.AadharNumber || '',
          PFNumber: selected.PFNumber || '',
          UAN: selected.UAN || '',
          ESINumber: selected.ESINumber || '',
          BankAccountNumber: selected.BankDetails?.accountNumber || '',
          BankAccountHolderName: selected.BankDetails?.accountHolderName || '',
          BankName: selected.BankDetails?.bankName || '',
          BankBranch: selected.BankDetails?.branch || '',
          BankIfscCode: selected.BankDetails?.ifscCode || '',
          BankAccountType: selected.BankDetails?.accountType || 'Savings',
          EmergencyContactName: selected.EmergencyContact?.name || '',
          EmergencyContactRelationship: selected.EmergencyContact?.relationship || '',
          EmergencyContactPhone: selected.EmergencyContact?.phone || '',
          EmergencyContactAddress: selected.EmergencyContact?.address || '',
          EmergencyContactPIN: selected.EmergencyContact?.pinCode || ''
        });
        setIsViewMode(true);
        setShowAddEmployeeForm(true);
        setEmployeeStep(0);
        setEmployeeFieldErrors({});
        setEmployeeTouched({});
        setAddEmployeeError('');
      }
    } else {
      setShowAddEmployeeForm(false);
      resetEmployeeForm();
    }
  };

  const handleBinChange = (index, field, value) => {
    const updated = [...bins];
    updated[index][field] = value;
    setBins(updated);
    if (errors[`bin_${index}_${field}`]) {
      setErrors({ ...errors, [`bin_${index}_${field}`]: "" });
    }
  };

  const addBin = () => {
    setBins([
      ...bins,
      { bin_id: "", bin_code: "", rack: "", row: "", col: "", capacity: "" }
    ]);
  };

  const removeBin = (index) => {
    const updated = bins.filter((_, i) => i !== index);
    setBins(updated);
  };

  const validateWarehouseStep = (step) => {
    const newErrors = {};
    if (step === 0) {
      if (!formData.warehouse_name.trim()) {
        newErrors.warehouse_name = "Warehouse name is required";
      }
      if (!formData.warehouse_type) {
        newErrors.warehouse_type = "Warehouse type is required";
      }
      if (!formData.location.trim()) {
        newErrors.location = "Location is required";
      }
      if (!formData.manager_id) {
        newErrors.manager_id = "Manager is required";
      }
    } else if (step === 1) {
      bins.forEach((bin, index) => {
        if (!bin.bin_id.trim()) {
          newErrors[`bin_${index}_bin_id`] = "Bin ID is required";
        }
        if (!bin.bin_code.trim()) {
          newErrors[`bin_${index}_bin_code`] = "Bin code is required";
        }
        if (!bin.rack.trim()) {
          newErrors[`bin_${index}_rack`] = "Rack is required";
        }
        if (!bin.row) {
          newErrors[`bin_${index}_row`] = "Row is required";
        } else if (bin.row <= 0) {
          newErrors[`bin_${index}_row`] = "Row must be greater than 0";
        }
        if (!bin.col) {
          newErrors[`bin_${index}_col`] = "Column is required";
        } else if (bin.col <= 0) {
          newErrors[`bin_${index}_col`] = "Column must be greater than 0";
        }
        if (!bin.capacity) {
          newErrors[`bin_${index}_capacity`] = "Capacity is required";
        } else if (bin.capacity <= 0) {
          newErrors[`bin_${index}_capacity`] = "Capacity must be greater than 0";
        }
      });
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateWarehouseStep(activeStep)) {
      setActiveStep((prevStep) => prevStep + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handleCreateWarehouse = async () => {
    if (!validateWarehouseStep(1)) return;
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const payload = {
        ...formData,
        bins: bins.map((b) => ({
          bin_id: b.bin_id.trim(),
          bin_code: b.bin_code.trim(),
          rack: b.rack.trim(),
          row: Number(b.row),
          col: Number(b.col),
          capacity: Number(b.capacity)
        }))
      };
      const res = await axios.post(`${BASE_URL}/api/warehouses`, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });
      if (res.data.success) {
        if (onAdd) onAdd(res.data.data);
        onClose();
      } else {
        setErrors({ submit: res.data.message || "Failed to create warehouse" });
      }
    } catch (err) {
      console.error("Error creating warehouse:", err);
      setErrors({ submit: err.response?.data?.message || "Failed to create warehouse. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  // --- Warehouse step render ---
  const renderWarehouseStepContent = (step) => {
    const textFieldSx = {
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
      },
      '& .MuiFormHelperText-root': {
        fontSize: '0.65rem',
        marginLeft: 0,
        marginTop: 0.25
      }
    };

    const selectSx = {
      borderRadius: 1.5,
      fontSize: '0.75rem',
      '& .MuiSelect-select': {
        py: 1,
        px: 1.5,
        fontSize: '0.75rem'
      }
    };

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

    switch (step) {
      case 0:
        return (
          <Stack spacing={2}>
            <Paper sx={{ p: 2, bgcolor: COLORS.background.white, borderRadius: 2, border: `1px solid ${COLORS.border}` }}>
              <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color: COLORS.primary, mb: 1.5 }}>
                Warehouse Information
              </Typography>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                    <Label required>WAREHOUSE NAME</Label>
                    <TextField
                      fullWidth name="warehouse_name" size="small"
                      value={formData.warehouse_name} onChange={handleChange}
                      error={!!errors.warehouse_name} helperText={errors.warehouse_name}
                      placeholder="Enter warehouse name" sx={textFieldSx}
                    />
                  </Box>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                    <Label required>WAREHOUSE TYPE</Label>
                    <FormControl fullWidth size="small" error={!!errors.warehouse_type}>
                      <Select
                        name="warehouse_type" value={formData.warehouse_type}
                        onChange={handleChange} displayEmpty sx={selectSx}
                      >
                        <MenuItem value="" disabled sx={{ fontSize: '0.75rem' }}>Select warehouse type</MenuItem>
                        {warehouseTypes.map((type) => (
                          <MenuItem key={type} value={type} sx={{ fontSize: '0.75rem' }}>{type}</MenuItem>
                        ))}
                      </Select>
                      {errors.warehouse_type && (
                        <Typography sx={{ fontSize: '0.65rem', color: '#EF4444', mt: 0.5 }}>
                          {errors.warehouse_type}
                        </Typography>
                      )}
                    </FormControl>
                  </Box>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                    <Label required>LOCATION</Label>
                    <TextField
                      fullWidth name="location" size="small"
                      value={formData.location} onChange={handleChange}
                      error={!!errors.location} helperText={errors.location}
                      placeholder="Enter location" sx={textFieldSx}
                    />
                  </Box>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                    <Label required>MANAGER</Label>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Box sx={{ flex: 1 }}>
                        <FormControl fullWidth size="small" error={!!errors.manager_id}>
                          <Select
                            name="manager_id" value={formData.manager_id}
                            onChange={handleManagerSelect} displayEmpty sx={selectSx}
                            renderValue={(selected) => {
                              if (!selected) return <span style={{ color: COLORS.text.tertiary }}>Select manager</span>;
                              const employee = employees.find(emp => emp._id === selected);
                              return getEmployeeDisplayName(employee);
                            }}
                          >
                            <MenuItem value="" disabled sx={{ fontSize: '0.75rem' }}>Select manager</MenuItem>
                            {fetchingEmployees ? (
                              <MenuItem disabled sx={{ fontSize: '0.75rem' }}>
                                <CircularProgress size={16} sx={{ mr: 1 }} /> Loading...
                              </MenuItem>
                            ) : (
                              employees.map((emp) => (
                                <MenuItem key={emp._id} value={emp._id} sx={{ fontSize: '0.75rem' }}>
                                  <Stack direction="row" alignItems="center" spacing={1}>
                                    <Person sx={{ fontSize: '0.875rem', color: COLORS.text.tertiary }} />
                                    <Typography sx={{ fontWeight: 500, fontSize: '0.75rem' }}>
                                      {getEmployeeDisplayName(emp)}
                                    </Typography>
                                  </Stack>
                                </MenuItem>
                              ))
                            )}
                          </Select>
                          {errors.manager_id && (
                            <Typography sx={{ fontSize: '0.65rem', color: '#EF4444', mt: 0.5 }}>
                              {errors.manager_id}
                            </Typography>
                          )}
                        </FormControl>
                      </Box>
                      <Button
                        variant="outlined" size="small"
                        onClick={() => {
                          if (!showAddEmployeeForm) {
                            resetEmployeeForm();
                            setIsViewMode(false);
                            setShowAddEmployeeForm(true);
                            setAddEmployeeError('');
                          } else {
                            setShowAddEmployeeForm(false);
                            resetEmployeeForm();
                          }
                        }}
                        startIcon={showAddEmployeeForm ? <Close sx={{ fontSize: '0.875rem' }} /> : <Add sx={{ fontSize: '0.875rem' }} />}
                        sx={{
                          height: 35, minWidth: 'auto', px: 1.5, borderRadius: 1.5,
                          border: `1px solid ${COLORS.border}`, color: COLORS.text.secondary,
                          fontSize: '0.7rem', textTransform: 'none', whiteSpace: 'nowrap',
                          '&:hover': {
                            borderColor: COLORS.primary,
                            bgcolor: `${COLORS.primary}10`,
                            color: COLORS.primary
                          }
                        }}
                      >
                        {showAddEmployeeForm ? 'Cancel' : 'Add New'}
                      </Button>
                    </Box>
                  </Box>
                </Grid>
              </Grid>

              {showAddEmployeeForm && renderInlineEmployeeForm()}
            </Paper>
          </Stack>
        );

      case 1:
        return (
          <Stack spacing={2}>
            <Paper sx={{ p: 2, bgcolor: COLORS.background.white, borderRadius: 2, border: `1px solid ${COLORS.border}` }}>
              <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1.5 }}>
                <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color: COLORS.primary }}>
                  Bins Configuration
                </Typography>
                <Chip label={`${bins.length} bin(s)`} size="small" sx={{ fontSize: "0.65rem", height: 22, bgcolor: COLORS.primaryLight, color: COLORS.primary }} />
              </Stack>

              {bins.map((bin, index) => (
                <Paper key={index} sx={{ p: 2, mb: 2, borderRadius: 2, border: `1px solid ${COLORS.border}`, bgcolor: COLORS.background.light, position: 'relative' }}>
                  <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1.5 }}>
                    <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary }}>
                      Bin #{index + 1}
                    </Typography>
                    {index > 0 && (
                      <IconButton size="small" onClick={() => removeBin(index)} sx={{ p: 0.5 }}>
                        <Delete fontSize="small" sx={{ color: '#EF4444' }} />
                      </IconButton>
                    )}
                  </Stack>
                  <Grid container spacing={1.5}>
                    <Grid size={{ xs: 12, sm: 4 }}>
                      <TextField label="Bin ID" size="small" fullWidth placeholder="e.g., BIN-001"
                        value={bin.bin_id} onChange={(e) => handleBinChange(index, "bin_id", e.target.value)}
                        error={!!errors[`bin_${index}_bin_id`]} helperText={errors[`bin_${index}_bin_id`]}
                        sx={textFieldSx}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 4 }}>
                      <TextField label="Bin Code" size="small" fullWidth placeholder="e.g., A-1-1"
                        value={bin.bin_code} onChange={(e) => handleBinChange(index, "bin_code", e.target.value)}
                        error={!!errors[`bin_${index}_bin_code`]} helperText={errors[`bin_${index}_bin_code`]}
                        sx={textFieldSx}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 4 }}>
                      <TextField label="Rack" size="small" fullWidth placeholder="e.g., A"
                        value={bin.rack} onChange={(e) => handleBinChange(index, "rack", e.target.value)}
                        error={!!errors[`bin_${index}_rack`]} helperText={errors[`bin_${index}_rack`]}
                        sx={textFieldSx}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 3 }}>
                      <TextField label="Row" size="small" fullWidth type="number" placeholder="1"
                        value={bin.row} onChange={(e) => handleBinChange(index, "row", e.target.value)}
                        error={!!errors[`bin_${index}_row`]} helperText={errors[`bin_${index}_row`]}
                        sx={textFieldSx}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 3 }}>
                      <TextField label="Column" size="small" fullWidth type="number" placeholder="1"
                        value={bin.col} onChange={(e) => handleBinChange(index, "col", e.target.value)}
                        error={!!errors[`bin_${index}_col`]} helperText={errors[`bin_${index}_col`]}
                        sx={textFieldSx}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <TextField label="Capacity (Units)" size="small" fullWidth type="number" placeholder="5000"
                        value={bin.capacity} onChange={(e) => handleBinChange(index, "capacity", e.target.value)}
                        error={!!errors[`bin_${index}_capacity`]} helperText={errors[`bin_${index}_capacity`]}
                        sx={textFieldSx}
                      />
                    </Grid>
                  </Grid>
                </Paper>
              ))}

              <Button startIcon={<Add sx={{ fontSize: '1rem' }} />} onClick={addBin} size="small"
                sx={{ textTransform: "none", fontSize: "0.7rem", fontWeight: 500, color: COLORS.primary, '&:hover': { bgcolor: COLORS.primaryLight } }}
              >
                Add Another Bin
              </Button>
            </Paper>
          </Stack>
        );

      default:
        return null;
    }
  };

  // Helper: get employee display name
  const getEmployeeDisplayName = (employee) => {
    if (!employee) return "Unknown Employee";
    if (employee.FirstName && employee.LastName) {
      return `${employee.FirstName} ${employee.LastName}`;
    }
    if (employee.FirstName) return employee.FirstName;
    if (employee.LastName) return employee.LastName;
    if (employee.name) return employee.name;
    if (employee.employee_name) return employee.employee_name;
    if (employee.email) return employee.email.split('@')[0];
    if (employee.EmployeeID) return `Employee ${employee.EmployeeID}`;
    return "Unknown Employee";
  };

  // --- Main render ---
  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          overflow: 'hidden',
          boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
          height: 'auto',
          maxHeight: '90vh'
        }
      }}
    >
      <Box sx={{ background: HEADER_GRADIENT, py: 1.5, px: 2.5 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
          <Typography sx={{ fontWeight: 600, color: '#FFFFFF', fontSize: '1rem' }}>
            Add Warehouse
          </Typography>
        </Stack>
        <Stepper activeStep={activeStep} alternativeLabel connector={<ColorConnector />}
          sx={{
            mt: 0.5,
            '& .MuiStepLabel-label': {
              color: '#FFFFFF !important',
              opacity: 0.8,
              fontSize: '0.7rem !important',
              '&.Mui-active': { color: '#FFFFFF !important', opacity: 1, fontWeight: 600 },
              '&.Mui-completed': { color: '#FFFFFF !important', opacity: 1 }
            }
          }}
        >
          {warehouseSteps.map((label) => (
            <Step key={label}>
              <StepLabel StepIconComponent={CustomStepIcon}>
                <Typography fontWeight={500} fontSize="0.7rem">{label}</Typography>
              </StepLabel>
            </Step>
          ))}
        </Stepper>
      </Box>

      <DialogContent sx={{ p: 2.5, overflow: 'auto', maxHeight: 'calc(90vh - 140px)', backgroundColor: '#F8FFFC' }}>
        {errors.submit && (
          <Alert severity="error" sx={{ borderRadius: 1.5, mb: 2, fontSize: '0.75rem', py: 0.5 }}>
            {errors.submit}
          </Alert>
        )}
        {renderWarehouseStepContent(activeStep)}
      </DialogContent>

      <Box sx={{
        px: 2.5, py: 1.5,
        borderTop: '1px solid #E3E8EF',
        backgroundColor: '#FFFFFF',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <Button onClick={onClose} size="small" sx={{ color: '#64748B', fontSize: '0.75rem', textTransform: 'none', '&:hover': { bgcolor: '#F1F5F9' } }}>
          Cancel
        </Button>
        <Stack direction="row" spacing={1}>
          {activeStep > 0 && (
            <Button onClick={handleBack} size="small" sx={{ color: '#64748B', fontSize: '0.75rem', textTransform: 'none', '&:hover': { bgcolor: '#F1F5F9' } }}>
              Back
            </Button>
          )}
          {activeStep < warehouseSteps.length - 1 && (
            <Button variant="contained" onClick={handleNext} size="small"
              sx={{ backgroundColor: PRIMARY_DARK, fontSize: '0.75rem', textTransform: 'none', boxShadow: 'none', '&:hover': { backgroundColor: '#05292B' } }}
            >
              Next
            </Button>
          )}
          {activeStep === warehouseSteps.length - 1 && (
            <Button variant="contained" onClick={handleCreateWarehouse} disabled={loading || addEmployeeLoading} size="small"
              sx={{ backgroundColor: PRIMARY_DARK, fontSize: '0.75rem', textTransform: 'none', boxShadow: 'none', '&:hover': { backgroundColor: '#05292B' } }}
            >
              {loading ? <CircularProgress size={16} sx={{ color: '#FFFFFF' }} /> : 'Create Warehouse'}
            </Button>
          )}
        </Stack>
      </Box>
    </Dialog>
  );
};

export default AddWareHouse;