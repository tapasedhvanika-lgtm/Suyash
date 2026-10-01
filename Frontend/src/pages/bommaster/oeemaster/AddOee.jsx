// // AddOee.jsx
// import React, { useState, useEffect } from 'react';
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
//   FormControl,
//   InputLabel,
//   Select,
//   MenuItem,
//   Alert,
//   Stepper,
//   Step,
//   StepLabel,
//   StepConnector,
//   stepConnectorClasses,
//   styled,
//   CircularProgress,
//   Chip,
//   Divider
// } from '@mui/material';
// import {
//   Add as AddIcon,
//   Close as CloseIcon,
//   Speed as SpeedIcon,
//   Assessment as AssessmentIcon,
//   Info as InfoIcon,
//   NavigateNext as NavigateNextIcon,
//   NavigateBefore as NavigateBeforeIcon,
//   CheckCircle as CheckCircleIcon,
//   Warning as WarningIcon
// } from '@mui/icons-material';
// import axios from 'axios';
// import BASE_URL from '../../../config/Config';
// import AddMachine from '../machinemaster/AddMachine';

// const steps = ['Select Machine', 'Production Data', 'OEE Calculation', 'Review & Submit'];

// const ColorConnector = styled(StepConnector)(({ theme }) => ({
//   [`&.${stepConnectorClasses.active}`]: {
//     [`& .${stepConnectorClasses.line}`]: {
//       backgroundColor: '#1976D2',
//     },
//   },
//   [`&.${stepConnectorClasses.completed}`]: {
//     [`& .${stepConnectorClasses.line}`]: {
//       backgroundColor: '#1976D2',
//     },
//   },
//   [`& .${stepConnectorClasses.line}`]: {
//     height: 2,
//     border: 0,
//     backgroundColor: '#eaeaf0',
//     borderRadius: 1,
//   },
// }));

// const COLORS = {
//   primary: '#1976D2',
//   primaryDark: '#1565C0',
//   success: '#2E7D32',
//   warning: '#ED6C02',
//   error: '#D32F2F',
//   border: '#E5E7EB',
//   text: {
//     primary: '#111827',
//     secondary: '#6B7280',
//     disabled: '#9CA3AF'
//   },
//   background: {
//     light: '#F9FAFB',
//     white: '#FFFFFF'
//   }
// };

// const SHIFT_OPTIONS = ['General', 'Morning', 'Afternoon', 'Night'];

// const AddOee = ({ open, onClose, onAdd }) => {
//   const [activeStep, setActiveStep] = useState(0);
//   const [loading, setLoading] = useState(false);
//   const [machinesLoading, setMachinesLoading] = useState(false);
//   const [error, setError] = useState('');
//   const [fieldErrors, setFieldErrors] = useState({});
//   const [machines, setMachines] = useState([]);
//   const [calculatedOEE, setCalculatedOEE] = useState(null);
//   const [addMachineOpen, setAddMachineOpen] = useState(false);

//   const [formData, setFormData] = useState({
//     machine_id: '',
//     date: new Date().toISOString().split('T')[0],
//     shift: 'General',
//     planned_production_time: 480,
//     actual_run_time: 440,
//     theoretical_capacity: 500,
//     good_qty: 460,
//     total_qty: 480,
//     notes: ''
//   });

//   // Handle machine added from modal
//   const handleMachineAdded = (newMachine) => {
//     // Add the new machine to the machines list
//     setMachines(prev => [...prev, newMachine]);
//     // Automatically select the newly added machine
//     setFormData(prev => ({
//       ...prev,
//       machine_id: newMachine._id
//     }));
//     // Clear any machine-related error
//     if (fieldErrors.machine_id) {
//       setFieldErrors(prev => ({
//         ...prev,
//         machine_id: ''
//       }));
//     }
//   };

//   // Fetch machines on component mount
//   useEffect(() => {
//     if (open) {
//       fetchMachines();
//     }
//   }, [open]);

//   const fetchMachines = async () => {
//     setMachinesLoading(true);
//     try {
//       const token = localStorage.getItem('token');
//       const response = await axios.get(`${BASE_URL}/api/machines`, {
//         headers: {
//           'Authorization': `Bearer ${token}`
//         }
//       });

//       if (response.data.success) {
//         setMachines(response.data.data);
//       } else {
//         setError('Failed to fetch machines');
//       }
//     } catch (err) {
//       console.error('Error fetching machines:', err);
//       setError('Failed to load machines. Please try again.');
//     } finally {
//       setMachinesLoading(false);
//     }
//   };

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData(prev => ({ ...prev, [name]: value }));
//     setFieldErrors(prev => ({ ...prev, [name]: '' }));
    
//     // Reset calculated OEE when form data changes
//     if (calculatedOEE) {
//       setCalculatedOEE(null);
//     }
//   };

//   const calculateOEEValues = () => {
//     const { planned_production_time, actual_run_time, theoretical_capacity, good_qty, total_qty } = formData;
    
//     // Calculate Availability
//     const availability = (actual_run_time / planned_production_time) * 100;
    
//     // Calculate Performance
//     const ideal_run_rate = theoretical_capacity / planned_production_time;
//     const actual_output_rate = total_qty / actual_run_time;
//     const performance = (actual_output_rate / ideal_run_rate) * 100;
    
//     // Calculate Quality
//     const quality = (good_qty / total_qty) * 100;
    
//     // Calculate Overall OEE
//     const oee = (availability / 100) * (performance / 100) * (quality / 100) * 100;
    
//     // Calculate total downtime
//     const total_downtime_min = planned_production_time - actual_run_time;
    
//     return {
//       availability: Math.round(availability * 10) / 10,
//       performance: Math.round(performance * 10) / 10,
//       quality: Math.round(quality * 10) / 10,
//       oee: Math.round(oee * 10) / 10,
//       total_downtime_min
//     };
//   };

//   const getOEEStatus = (oee) => {
//     if (oee >= 85) return { label: 'Excellent', color: COLORS.success, icon: CheckCircleIcon };
//     if (oee >= 60) return { label: 'Good', color: COLORS.primary, icon: SpeedIcon };
//     if (oee >= 40) return { label: 'Fair', color: COLORS.warning, icon: WarningIcon };
//     return { label: 'Poor', color: COLORS.error, icon: WarningIcon };
//   };

//   const validateStep = (step) => {
//     const errors = {};
//     let isValid = true;

//     switch (step) {
//       case 0:
//         if (!formData.machine_id) {
//           errors.machine_id = 'Please select a machine';
//           isValid = false;
//         }
//         if (!formData.date) {
//           errors.date = 'Date is required';
//           isValid = false;
//         }
//         if (!formData.shift) {
//           errors.shift = 'Shift is required';
//           isValid = false;
//         }
//         break;

//       case 1:
//         if (!formData.planned_production_time || formData.planned_production_time <= 0) {
//           errors.planned_production_time = 'Valid planned production time is required';
//           isValid = false;
//         }
//         if (!formData.actual_run_time || formData.actual_run_time <= 0) {
//           errors.actual_run_time = 'Valid actual run time is required';
//           isValid = false;
//         }
//         if (formData.actual_run_time > formData.planned_production_time) {
//           errors.actual_run_time = 'Actual run time cannot exceed planned production time';
//           isValid = false;
//         }
//         if (!formData.theoretical_capacity || formData.theoretical_capacity <= 0) {
//           errors.theoretical_capacity = 'Valid theoretical capacity is required';
//           isValid = false;
//         }
//         if (!formData.total_qty || formData.total_qty <= 0) {
//           errors.total_qty = 'Valid total quantity is required';
//           isValid = false;
//         }
//         if (!formData.good_qty || formData.good_qty <= 0) {
//           errors.good_qty = 'Valid good quantity is required';
//           isValid = false;
//         }
//         if (formData.good_qty > formData.total_qty) {
//           errors.good_qty = 'Good quantity cannot exceed total quantity';
//           isValid = false;
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
//       if (activeStep === 1 && !calculatedOEE) {
//         const oeeValues = calculateOEEValues();
//         setCalculatedOEE(oeeValues);
//       }
//       setError('');
//       setActiveStep((prevStep) => prevStep + 1);
//     }
//   };

//   const handleBack = () => {
//     setError('');
//     setActiveStep((prevStep) => prevStep - 1);
//   };

//   const handleSubmit = async () => {
//     if (!validateStep(1)) {
//       return;
//     }

//     setLoading(true);
//     setError('');

//     try {
//       const token = localStorage.getItem('token');

//       const submitData = {
//         machine_id: formData.machine_id,
//         date: formData.date,
//         shift: formData.shift,
//         planned_production_time: Number(formData.planned_production_time),
//         actual_run_time: Number(formData.actual_run_time),
//         theoretical_capacity: Number(formData.theoretical_capacity),
//         good_qty: Number(formData.good_qty),
//         total_qty: Number(formData.total_qty),
//         notes: formData.notes || ''
//       };

//       const response = await axios.post(`${BASE_URL}/api/oee-records`, submitData, {
//         headers: {
//           'Authorization': `Bearer ${token}`,
//           'Content-Type': 'application/json'
//         }
//       });

//       if (response.data.success) {
//         // Call onAdd without parameters as expected by OeeMaster
//         onAdd();
//         onClose();
//         resetForm();
//       } else {
//         setError(response.data.message || 'Failed to add OEE record');
//       }
//     } catch (err) {
//       console.error('Error adding OEE record:', err);
//       setError(err.response?.data?.message || 'Failed to add OEE record. Please try again.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const resetForm = () => {
//     setActiveStep(0);
//     setFormData({
//       machine_id: '',
//       date: new Date().toISOString().split('T')[0],
//       shift: 'General',
//       planned_production_time: 480,
//       actual_run_time: 440,
//       theoretical_capacity: 500,
//       good_qty: 460,
//       total_qty: 480,
//       notes: ''
//     });
//     setCalculatedOEE(null);
//     setFieldErrors({});
//     setError('');
//   };

//   const handleClose = () => {
//     resetForm();
//     onClose();
//   };

//   const getSelectedMachine = () => {
//     return machines.find(m => m._id === formData.machine_id);
//   };

//   const renderStepContent = (step) => {
//     switch (step) {
//       case 0:
//         return (
//           <Stack spacing={2}>
//             <Paper sx={{ p: 2, borderRadius: 1.5, border: `1px solid ${COLORS.border}` }}>
//               <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color: COLORS.primary, mb: 1.5 }}>
//                 <AssessmentIcon sx={{ fontSize: '1rem', mr: 0.5, verticalAlign: 'middle' }} />
//                 Machine & Shift Details
//               </Typography>

//               <Grid container spacing={1.5}>
//                 <Grid size={{ xs: 12 }}>
//                   <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//                     <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary }}>
//                       SELECT MACHINE <span style={{ color: '#EF4444' }}>*</span>
//                     </Typography>
//                     <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
//                       <Box sx={{ flex: 1 }}>
//                         <FormControl fullWidth size="small" error={!!fieldErrors.machine_id}>
//                           <Select
//                             name="machine_id"
//                             value={formData.machine_id}
//                             onChange={handleChange}
//                             disabled={machinesLoading}
//                             sx={{ borderRadius: 1.5, fontSize: '0.75rem' }}
//                             displayEmpty
//                           >
//                             <MenuItem value="" disabled sx={{ fontSize: '0.75rem' }}>
//                               {machinesLoading ? 'Loading machines...' : 'Select a machine'}
//                             </MenuItem>
//                             {machines.map(machine => (
//                               <MenuItem key={machine._id} value={machine._id} sx={{ fontSize: '0.75rem' }}>
//                                 {machine.machine_name} ({machine.machine_code})
//                               </MenuItem>
//                             ))}
//                           </Select>
//                           {fieldErrors.machine_id && (
//                             <Typography sx={{ fontSize: '0.7rem', color: '#EF4444', mt: 0.5 }}>
//                               {fieldErrors.machine_id}
//                             </Typography>
//                           )}
//                         </FormControl>
//                       </Box>
                      
//                       <Button
//                         variant="outlined"
//                         size="small"
//                         onClick={() => setAddMachineOpen(true)}
//                         disabled={loading || machinesLoading}
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
//                         Add New
//                       </Button>
//                     </Box>
//                   </Box>
//                 </Grid>

//                 <Grid size={{ xs: 12, sm: 6 }}>
//                   <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//                     <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary }}>
//                       DATE <span style={{ color: '#EF4444' }}>*</span>
//                     </Typography>
//                     <TextField
//                       fullWidth
//                       type="date"
//                       size="small"
//                       name="date"
//                       value={formData.date}
//                       onChange={handleChange}
//                       error={!!fieldErrors.date}
//                       helperText={fieldErrors.date}
//                       sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5, fontSize: '0.75rem' } }}
//                       InputLabelProps={{ shrink: true }}
//                     />
//                   </Box>
//                 </Grid>

//                 <Grid size={{ xs: 12, sm: 6 }}>
//                   <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//                     <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary }}>
//                       SHIFT <span style={{ color: '#EF4444' }}>*</span>
//                     </Typography>
//                     <FormControl fullWidth size="small" error={!!fieldErrors.shift}>
//                       <Select
//                         name="shift"
//                         value={formData.shift}
//                         onChange={handleChange}
//                         sx={{ borderRadius: 1.5, fontSize: '0.75rem' }}
//                       >
//                         {SHIFT_OPTIONS.map(option => (
//                           <MenuItem key={option} value={option} sx={{ fontSize: '0.75rem' }}>
//                             {option}
//                           </MenuItem>
//                         ))}
//                       </Select>
//                     </FormControl>
//                   </Box>
//                 </Grid>
//               </Grid>
//             </Paper>

//             {getSelectedMachine() && (
//               <Paper sx={{ p: 2, borderRadius: 1.5, bgcolor: COLORS.background.light, border: `1px solid ${COLORS.border}` }}>
//                 <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: COLORS.primary, mb: 1 }}>
//                   Selected Machine Details
//                 </Typography>
//                 <Grid container spacing={1}>
//                   <Grid size={{ xs: 4 }}>
//                     <Typography sx={{ fontSize: '0.7rem', color: COLORS.text.secondary }}>Machine Code:</Typography>
//                   </Grid>
//                   <Grid size={{ xs: 8 }}>
//                     <Typography sx={{ fontSize: '0.7rem', fontWeight: 500 }}>{getSelectedMachine().machine_code}</Typography>
//                   </Grid>
//                   <Grid size={{ xs: 4 }}>
//                     <Typography sx={{ fontSize: '0.7rem', color: COLORS.text.secondary }}>Machine Type:</Typography>
//                   </Grid>
//                   <Grid size={{ xs: 8 }}>
//                     <Typography sx={{ fontSize: '0.7rem', fontWeight: 500 }}>{getSelectedMachine().machine_type}</Typography>
//                   </Grid>
//                   <Grid size={{ xs: 4 }}>
//                     <Typography sx={{ fontSize: '0.7rem', color: COLORS.text.secondary }}>Work Centre:</Typography>
//                   </Grid>
//                   <Grid size={{ xs: 8 }}>
//                     <Typography sx={{ fontSize: '0.7rem', fontWeight: 500 }}>{getSelectedMachine().work_centre}</Typography>
//                   </Grid>
//                   <Grid size={{ xs: 4 }}>
//                     <Typography sx={{ fontSize: '0.7rem', color: COLORS.text.secondary }}>OEE Target:</Typography>
//                   </Grid>
//                   <Grid size={{ xs: 8 }}>
//                     <Typography sx={{ fontSize: '0.7rem', fontWeight: 500, color: COLORS.primary }}>
//                       {getSelectedMachine().oee_target_percent}%
//                     </Typography>
//                   </Grid>
//                 </Grid>
//               </Paper>
//             )}
//           </Stack>
//         );

//       case 1:
//         return (
//           <Stack spacing={2}>
//             <Paper sx={{ p: 2, borderRadius: 1.5, border: `1px solid ${COLORS.border}` }}>
//               <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color: COLORS.primary, mb: 1.5 }}>
//                 <SpeedIcon sx={{ fontSize: '1rem', mr: 0.5, verticalAlign: 'middle' }} />
//                 Production Data
//               </Typography>

//               <Grid container spacing={1.5}>
//                 <Grid size={{ xs: 12, sm: 6 }}>
//                   <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//                     <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary }}>
//                       PLANNED PRODUCTION TIME (minutes) <span style={{ color: '#EF4444' }}>*</span>
//                     </Typography>
//                     <TextField
//                       fullWidth
//                       type="number"
//                       size="small"
//                       name="planned_production_time"
//                       value={formData.planned_production_time}
//                       onChange={handleChange}
//                       placeholder="e.g., 480"
//                       error={!!fieldErrors.planned_production_time}
//                       helperText={fieldErrors.planned_production_time}
//                       sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5, fontSize: '0.75rem' } }}
//                     />
//                   </Box>
//                 </Grid>

//                 <Grid size={{ xs: 12, sm: 6 }}>
//                   <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//                     <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary }}>
//                       ACTUAL RUN TIME (minutes) <span style={{ color: '#EF4444' }}>*</span>
//                     </Typography>
//                     <TextField
//                       fullWidth
//                       type="number"
//                       size="small"
//                       name="actual_run_time"
//                       value={formData.actual_run_time}
//                       onChange={handleChange}
//                       placeholder="e.g., 440"
//                       error={!!fieldErrors.actual_run_time}
//                       helperText={fieldErrors.actual_run_time}
//                       sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5, fontSize: '0.75rem' } }}
//                     />
//                   </Box>
//                 </Grid>

//                 <Grid size={{ xs: 12, sm: 6 }}>
//                   <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//                     <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary }}>
//                       THEORETICAL CAPACITY (units) <span style={{ color: '#EF4444' }}>*</span>
//                     </Typography>
//                     <TextField
//                       fullWidth
//                       type="number"
//                       size="small"
//                       name="theoretical_capacity"
//                       value={formData.theoretical_capacity}
//                       onChange={handleChange}
//                       placeholder="e.g., 500"
//                       error={!!fieldErrors.theoretical_capacity}
//                       helperText={fieldErrors.theoretical_capacity}
//                       sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5, fontSize: '0.75rem' } }}
//                     />
//                   </Box>
//                 </Grid>

//                 <Grid size={{ xs: 12, sm: 6 }}>
//                   <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//                     <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary }}>
//                       TOTAL QUANTITY PRODUCED <span style={{ color: '#EF4444' }}>*</span>
//                     </Typography>
//                     <TextField
//                       fullWidth
//                       type="number"
//                       size="small"
//                       name="total_qty"
//                       value={formData.total_qty}
//                       onChange={handleChange}
//                       placeholder="e.g., 480"
//                       error={!!fieldErrors.total_qty}
//                       helperText={fieldErrors.total_qty}
//                       sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5, fontSize: '0.75rem' } }}
//                     />
//                   </Box>
//                 </Grid>

//                 <Grid size={{ xs: 12, sm: 6 }}>
//                   <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//                     <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary }}>
//                       GOOD QUANTITY <span style={{ color: '#EF4444' }}>*</span>
//                     </Typography>
//                     <TextField
//                       fullWidth
//                       type="number"
//                       size="small"
//                       name="good_qty"
//                       value={formData.good_qty}
//                       onChange={handleChange}
//                       placeholder="e.g., 460"
//                       error={!!fieldErrors.good_qty}
//                       helperText={fieldErrors.good_qty}
//                       sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5, fontSize: '0.75rem' } }}
//                     />
//                   </Box>
//                 </Grid>

//                 <Grid size={{ xs: 12 }}>
//                   <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//                     <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary }}>
//                       NOTES
//                     </Typography>
//                     <TextField
//                       fullWidth
//                       multiline
//                       rows={3}
//                       size="small"
//                       name="notes"
//                       value={formData.notes}
//                       onChange={handleChange}
//                       placeholder="Any additional notes about this OEE record..."
//                       sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5, fontSize: '0.75rem' } }}
//                     />
//                   </Box>
//                 </Grid>
//               </Grid>
//             </Paper>
//           </Stack>
//         );

//       case 2:
//         if (!calculatedOEE) {
//           const oeeValues = calculateOEEValues();
//           if (oeeValues !== calculatedOEE) {
//             setCalculatedOEE(oeeValues);
//           }
//         }

//         const status = calculatedOEE ? getOEEStatus(calculatedOEE.oee) : null;
//         const StatusIcon = status?.icon;

//         return (
//           <Stack spacing={2}>
//             <Paper sx={{ p: 2, borderRadius: 1.5, border: `1px solid ${COLORS.border}` }}>
//               <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color: COLORS.primary, mb: 1.5 }}>
//                 <SpeedIcon sx={{ fontSize: '1rem', mr: 0.5, verticalAlign: 'middle' }} />
//                 OEE Calculation Results
//               </Typography>

//               {calculatedOEE && (
//                 <>
//                   <Grid container spacing={2} sx={{ mb: 2 }}>
//                     <Grid size={{ xs: 12, sm: 6 }}>
//                       <Paper sx={{ p: 2, textAlign: 'center', bgcolor: COLORS.background.light, borderRadius: 1.5 }}>
//                         <Typography sx={{ fontSize: '0.7rem', color: COLORS.text.secondary, mb: 0.5 }}>
//                           Availability
//                         </Typography>
//                         <Typography sx={{ fontSize: '1.5rem', fontWeight: 700, color: COLORS.primary }}>
//                           {calculatedOEE.availability}%
//                         </Typography>
//                         <Typography sx={{ fontSize: '0.65rem', color: COLORS.text.secondary }}>
//                           (Actual Run / Planned Time)
//                         </Typography>
//                       </Paper>
//                     </Grid>
//                     <Grid size={{ xs: 12, sm: 6 }}>
//                       <Paper sx={{ p: 2, textAlign: 'center', bgcolor: COLORS.background.light, borderRadius: 1.5 }}>
//                         <Typography sx={{ fontSize: '0.7rem', color: COLORS.text.secondary, mb: 0.5 }}>
//                           Performance
//                         </Typography>
//                         <Typography sx={{ fontSize: '1.5rem', fontWeight: 700, color: COLORS.primary }}>
//                           {calculatedOEE.performance}%
//                         </Typography>
//                         <Typography sx={{ fontSize: '0.65rem', color: COLORS.text.secondary }}>
//                           (Actual Output / Ideal Output)
//                         </Typography>
//                       </Paper>
//                     </Grid>
//                     <Grid size={{ xs: 12, sm: 6 }}>
//                       <Paper sx={{ p: 2, textAlign: 'center', bgcolor: COLORS.background.light, borderRadius: 1.5 }}>
//                         <Typography sx={{ fontSize: '0.7rem', color: COLORS.text.secondary, mb: 0.5 }}>
//                           Quality
//                         </Typography>
//                         <Typography sx={{ fontSize: '1.5rem', fontWeight: 700, color: COLORS.primary }}>
//                           {calculatedOEE.quality}%
//                         </Typography>
//                         <Typography sx={{ fontSize: '0.65rem', color: COLORS.text.secondary }}>
//                           (Good Qty / Total Qty)
//                         </Typography>
//                       </Paper>
//                     </Grid>
//                     <Grid size={{ xs: 12, sm: 6 }}>
//                       <Paper sx={{ p: 2, textAlign: 'center', bgcolor: COLORS.background.light, borderRadius: 1.5 }}>
//                         <Typography sx={{ fontSize: '0.7rem', color: COLORS.text.secondary, mb: 0.5 }}>
//                           Total Downtime
//                         </Typography>
//                         <Typography sx={{ fontSize: '1.5rem', fontWeight: 700, color: COLORS.warning }}>
//                           {calculatedOEE.total_downtime_min} min
//                         </Typography>
//                         <Typography sx={{ fontSize: '0.65rem', color: COLORS.text.secondary }}>
//                           (Planned - Actual)
//                         </Typography>
//                       </Paper>
//                     </Grid>
//                   </Grid>

//                   <Paper sx={{ p: 2, textAlign: 'center', bgcolor: status.color + '10', borderRadius: 1.5, border: `1px solid ${status.color}30` }}>
//                     <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, mb: 1 }}>
//                       {StatusIcon && <StatusIcon sx={{ color: status.color, fontSize: '1.5rem' }} />}
//                       <Typography sx={{ fontSize: '1rem', fontWeight: 600, color: status.color }}>
//                         Overall OEE: {calculatedOEE.oee}%
//                       </Typography>
//                     </Box>
//                     <Chip 
//                       label={status.label} 
//                       size="small"
//                       sx={{ 
//                         bgcolor: status.color,
//                         color: 'white',
//                         fontSize: '0.7rem',
//                         fontWeight: 500
//                       }}
//                     />
//                     <Typography sx={{ fontSize: '0.7rem', color: COLORS.text.secondary, mt: 1 }}>
//                       OEE = Availability × Performance × Quality
//                     </Typography>
//                   </Paper>
//                 </>
//               )}
//             </Paper>
//           </Stack>
//         );

//       case 3:
//         const selectedMachine = getSelectedMachine();
//         const finalStatus = calculatedOEE ? getOEEStatus(calculatedOEE.oee) : null;
//         const FinalStatusIcon = finalStatus?.icon;

//         return (
//           <Stack spacing={2}>
//             <Paper sx={{ p: 2, borderRadius: 1.5, border: `1px solid ${COLORS.border}` }}>
//               <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color: COLORS.primary, mb: 1.5 }}>
//                 <InfoIcon sx={{ fontSize: '1rem', mr: 0.5, verticalAlign: 'middle' }} />
//                 Review & Submit
//               </Typography>

//               <Stack spacing={2}>
//                 <Paper sx={{ p: 2, bgcolor: COLORS.background.light, borderRadius: 1.5 }}>
//                   <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: COLORS.primary, mb: 1 }}>
//                     Machine Details
//                   </Typography>
//                   <Grid container spacing={1}>
//                     <Grid size={{ xs: 4 }}>
//                       <Typography sx={{ fontSize: '0.7rem', color: COLORS.text.secondary }}>Machine:</Typography>
//                     </Grid>
//                     <Grid size={{ xs: 8 }}>
//                       <Typography sx={{ fontSize: '0.7rem', fontWeight: 500 }}>
//                         {selectedMachine?.machine_name} ({selectedMachine?.machine_code})
//                       </Typography>
//                     </Grid>
//                     <Grid size={{ xs: 4 }}>
//                       <Typography sx={{ fontSize: '0.7rem', color: COLORS.text.secondary }}>Date:</Typography>
//                     </Grid>
//                     <Grid size={{ xs: 8 }}>
//                       <Typography sx={{ fontSize: '0.7rem', fontWeight: 500 }}>{formData.date}</Typography>
//                     </Grid>
//                     <Grid size={{ xs: 4 }}>
//                       <Typography sx={{ fontSize: '0.7rem', color: COLORS.text.secondary }}>Shift:</Typography>
//                     </Grid>
//                     <Grid size={{ xs: 8 }}>
//                       <Typography sx={{ fontSize: '0.7rem', fontWeight: 500 }}>{formData.shift}</Typography>
//                     </Grid>
//                   </Grid>
//                 </Paper>

//                 <Paper sx={{ p: 2, bgcolor: COLORS.background.light, borderRadius: 1.5 }}>
//                   <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: COLORS.primary, mb: 1 }}>
//                     Production Data
//                   </Typography>
//                   <Grid container spacing={1}>
//                     <Grid size={{ xs: 6 }}>
//                       <Typography sx={{ fontSize: '0.7rem', color: COLORS.text.secondary }}>Planned Time:</Typography>
//                     </Grid>
//                     <Grid size={{ xs: 6 }}>
//                       <Typography sx={{ fontSize: '0.7rem', fontWeight: 500 }}>{formData.planned_production_time} min</Typography>
//                     </Grid>
//                     <Grid size={{ xs: 6 }}>
//                       <Typography sx={{ fontSize: '0.7rem', color: COLORS.text.secondary }}>Actual Run Time:</Typography>
//                     </Grid>
//                     <Grid size={{ xs: 6 }}>
//                       <Typography sx={{ fontSize: '0.7rem', fontWeight: 500 }}>{formData.actual_run_time} min</Typography>
//                     </Grid>
//                     <Grid size={{ xs: 6 }}>
//                       <Typography sx={{ fontSize: '0.7rem', color: COLORS.text.secondary }}>Theoretical Capacity:</Typography>
//                     </Grid>
//                     <Grid size={{ xs: 6 }}>
//                       <Typography sx={{ fontSize: '0.7rem', fontWeight: 500 }}>{formData.theoretical_capacity} units</Typography>
//                     </Grid>
//                     <Grid size={{ xs: 6 }}>
//                       <Typography sx={{ fontSize: '0.7rem', color: COLORS.text.secondary }}>Total Quantity:</Typography>
//                     </Grid>
//                     <Grid size={{ xs: 6 }}>
//                       <Typography sx={{ fontSize: '0.7rem', fontWeight: 500 }}>{formData.total_qty} units</Typography>
//                     </Grid>
//                     <Grid size={{ xs: 6 }}>
//                       <Typography sx={{ fontSize: '0.7rem', color: COLORS.text.secondary }}>Good Quantity:</Typography>
//                     </Grid>
//                     <Grid size={{ xs: 6 }}>
//                       <Typography sx={{ fontSize: '0.7rem', fontWeight: 500 }}>{formData.good_qty} units</Typography>
//                     </Grid>
//                     {formData.notes && (
//                       <>
//                         <Grid size={{ xs: 12 }}>
//                           <Divider sx={{ my: 1 }} />
//                         </Grid>
//                         <Grid size={{ xs: 4 }}>
//                           <Typography sx={{ fontSize: '0.7rem', color: COLORS.text.secondary }}>Notes:</Typography>
//                         </Grid>
//                         <Grid size={{ xs: 8 }}>
//                           <Typography sx={{ fontSize: '0.7rem', fontWeight: 500 }}>{formData.notes}</Typography>
//                         </Grid>
//                       </>
//                     )}
//                   </Grid>
//                 </Paper>

//                 {calculatedOEE && (
//                   <Paper sx={{ p: 2, bgcolor: finalStatus?.color + '10', borderRadius: 1.5, border: `1px solid ${finalStatus?.color}30` }}>
//                     <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: COLORS.primary, mb: 1 }}>
//                       OEE Results
//                     </Typography>
//                     <Grid container spacing={1}>
//                       <Grid size={{ xs: 6 }}>
//                         <Typography sx={{ fontSize: '0.7rem', color: COLORS.text.secondary }}>Availability:</Typography>
//                       </Grid>
//                       <Grid size={{ xs: 6 }}>
//                         <Typography sx={{ fontSize: '0.7rem', fontWeight: 500 }}>{calculatedOEE.availability}%</Typography>
//                       </Grid>
//                       <Grid size={{ xs: 6 }}>
//                         <Typography sx={{ fontSize: '0.7rem', color: COLORS.text.secondary }}>Performance:</Typography>
//                       </Grid>
//                       <Grid size={{ xs: 6 }}>
//                         <Typography sx={{ fontSize: '0.7rem', fontWeight: 500 }}>{calculatedOEE.performance}%</Typography>
//                       </Grid>
//                       <Grid size={{ xs: 6 }}>
//                         <Typography sx={{ fontSize: '0.7rem', color: COLORS.text.secondary }}>Quality:</Typography>
//                       </Grid>
//                       <Grid size={{ xs: 6 }}>
//                         <Typography sx={{ fontSize: '0.7rem', fontWeight: 500 }}>{calculatedOEE.quality}%</Typography>
//                       </Grid>
//                       <Grid size={{ xs: 6 }}>
//                         <Typography sx={{ fontSize: '0.7rem', color: COLORS.text.secondary }}>Overall OEE:</Typography>
//                       </Grid>
//                       <Grid size={{ xs: 6 }}>
//                         <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
//                           <Typography sx={{ fontSize: '0.7rem', fontWeight: 700, color: finalStatus?.color }}>
//                             {calculatedOEE.oee}%
//                           </Typography>
//                           {FinalStatusIcon && <FinalStatusIcon sx={{ color: finalStatus?.color, fontSize: '0.8rem' }} />}
//                         </Box>
//                       </Grid>
//                       <Grid size={{ xs: 12 }}>
//                         <Chip 
//                           label={finalStatus?.label}
//                           size="small"
//                           sx={{ 
//                             mt: 0.5,
//                             bgcolor: finalStatus?.color,
//                             color: 'white',
//                             fontSize: '0.65rem',
//                             fontWeight: 500
//                           }}
//                         />
//                       </Grid>
//                     </Grid>
//                   </Paper>
//                 )}
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
//           overflow: 'hidden'
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
//         alignItems: 'center'
//       }}>
//         <Typography sx={{ fontSize: '1.2rem', fontWeight: 700, color: COLORS.text.primary }}>
//           Add OEE Record
//         </Typography>
//         <IconButton onClick={handleClose} size="small">
//           <CloseIcon fontSize="small" />
//         </IconButton>
//       </DialogTitle>

//       <Box sx={{ px: 2.5, pt: 2, bgcolor: COLORS.background.white }}>
//         <Stepper activeStep={activeStep} alternativeLabel connector={<ColorConnector />}>
//           {steps.map((label) => (
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

//       <DialogContent sx={{ p: 2.5, bgcolor: COLORS.background.white }}>
//         {renderStepContent(activeStep)}
//         {error && (
//           <Alert severity="error" sx={{ mt: 2, borderRadius: 1.5, fontSize: '0.75rem' }}>
//             {error}
//           </Alert>
//         )}
//       </DialogContent>

//       <DialogActions sx={{
//         px: 2.5,
//         py: 1.5,
//         borderTop: `1px solid ${COLORS.border}`,
//         bgcolor: COLORS.background.white,
//         justifyContent: 'space-between'
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
//             textTransform: 'none'
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
//               textTransform: 'none'
//             }}
//           >
//             Cancel
//           </Button>
//           {activeStep === steps.length - 1 ? (
//             <Button
//               variant="contained"
//               onClick={handleSubmit}
//               disabled={loading}
//               size="small"
//               startIcon={loading ? <CircularProgress size={16} /> : <AddIcon sx={{ fontSize: '1rem' }} />}
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
//               {loading ? 'Adding...' : 'Add OEE Record'}
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

//       {/* Add Machine Modal */}
//       <AddMachine
//         open={addMachineOpen}
//         onClose={() => setAddMachineOpen(false)}
//         onAdd={handleMachineAdded}
//       />
//     </Dialog>
//   );
// };

// export default AddOee;

// import React, { useState, useEffect } from 'react';
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
//   FormControl,
//   InputLabel,
//   Select,
//   MenuItem,
//   Alert,
//   Stepper,
//   Step,
//   StepLabel,
//   StepConnector,
//   stepConnectorClasses,
//   styled,
//   CircularProgress,
//   Chip,
//   Divider
// } from '@mui/material';
// import {
//   Add as AddIcon,
//   Close as CloseIcon,
//   Speed as SpeedIcon,
//   Assessment as AssessmentIcon,
//   Info as InfoIcon,
//   NavigateNext as NavigateNextIcon,
//   NavigateBefore as NavigateBeforeIcon,
//   CheckCircle as CheckCircleIcon,
//   Warning as WarningIcon,
//   Edit as EditIcon
// } from '@mui/icons-material';
// import axios from 'axios';
// import BASE_URL from '../../../config/Config';

// const steps = ['Select Machine', 'Production Data', 'OEE Calculation', 'Review & Submit'];
// const machineSteps = ['Basic Information', 'Capacity & Schedule', 'Technical Details', 'Review & Submit'];

// const ColorConnector = styled(StepConnector)(({ theme }) => ({
//   [`&.${stepConnectorClasses.active}`]: {
//     [`& .${stepConnectorClasses.line}`]: {
//       backgroundColor: '#1976D2',
//     },
//   },
//   [`&.${stepConnectorClasses.completed}`]: {
//     [`& .${stepConnectorClasses.line}`]: {
//       backgroundColor: '#1976D2',
//     },
//   },
//   [`& .${stepConnectorClasses.line}`]: {
//     height: 2,
//     border: 0,
//     backgroundColor: '#eaeaf0',
//     borderRadius: 1,
//   },
// }));

// const COLORS = {
//   primary: '#1976D2',
//   primaryDark: '#1565C0',
//   success: '#2E7D32',
//   warning: '#ED6C02',
//   error: '#D32F2F',
//   border: '#E5E7EB',
//   text: {
//     primary: '#111827',
//     secondary: '#6B7280',
//     disabled: '#9CA3AF'
//   },
//   background: {
//     light: '#F9FAFB',
//     white: '#FFFFFF'
//   }
// };

// const SHIFT_OPTIONS = ['General', 'Morning', 'Afternoon', 'Night'];

// // ==================== Inline Machine Form (Full‑width, with Stepper) ====================
// const MachineInlineForm = ({ onClose, onSave }) => {
//   const [activeStep, setActiveStep] = useState(0);
//   const [loading, setLoading] = useState(false);
//   const [submitError, setSubmitError] = useState('');
//   const [formData, setFormData] = useState({
//     machine_name: '',
//     machine_code: '',
//     machine_type: '',
//     work_centre: '',
//     location: '',
//     max_capacity: '',
//     operating_speed: '',
//     oee_target_percent: '85',
//     power_consumption: '',
//     maintenance_interval: '',
//     notes: ''
//   });
//   const [fieldErrors, setFieldErrors] = useState({});
//   const [touched, setTouched] = useState({});

//   // Machine Type options (example)
//   const machineTypeOptions = ['Press', 'Lathe', 'CNC', 'Grinder', 'Milling', 'Drilling', 'Welding', 'Other'];

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData(prev => ({ ...prev, [name]: value }));
//     if (touched[name] || value) {
//       setFieldErrors(prev => ({ ...prev, [name]: '' }));
//     }
//   };

//   const handleBlur = (e) => {
//     const { name } = e.target;
//     setTouched(prev => ({ ...prev, [name]: true }));
//   };

//   const validateStep = (step) => {
//     const errors = {};
//     let isValid = true;

//     switch (step) {
//       case 0:
//         if (!formData.machine_name.trim()) {
//           errors.machine_name = 'Machine name is required';
//           isValid = false;
//         }
//         if (!formData.machine_code.trim()) {
//           errors.machine_code = 'Machine code is required';
//           isValid = false;
//         }
//         if (!formData.machine_type) {
//           errors.machine_type = 'Machine type is required';
//           isValid = false;
//         }
//         if (!formData.work_centre.trim()) {
//           errors.work_centre = 'Work centre is required';
//           isValid = false;
//         }
//         break;

//       case 1:
//         if (formData.max_capacity && Number(formData.max_capacity) <= 0) {
//           errors.max_capacity = 'Must be a positive number';
//           isValid = false;
//         }
//         if (formData.operating_speed && Number(formData.operating_speed) <= 0) {
//           errors.operating_speed = 'Must be a positive number';
//           isValid = false;
//         }
//         if (formData.oee_target_percent && (Number(formData.oee_target_percent) < 0 || Number(formData.oee_target_percent) > 100)) {
//           errors.oee_target_percent = 'Must be between 0 and 100';
//           isValid = false;
//         }
//         break;

//       case 2:
//         if (formData.power_consumption && Number(formData.power_consumption) < 0) {
//           errors.power_consumption = 'Must be a positive number';
//           isValid = false;
//         }
//         if (formData.maintenance_interval && Number(formData.maintenance_interval) < 0) {
//           errors.maintenance_interval = 'Must be a positive number';
//           isValid = false;
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

//   const handleSubmit = async () => {
//     // Validate all steps before submit (re‑run validation for all steps)
//     for (let i = 0; i < machineSteps.length - 1; i++) {
//       if (!validateStep(i)) {
//         setActiveStep(i);
//         return;
//       }
//     }
//     setLoading(true);
//     setSubmitError('');
//     try {
//       const token = localStorage.getItem('token');
//       const payload = {
//         machine_name: formData.machine_name,
//         machine_code: formData.machine_code,
//         machine_type: formData.machine_type,
//         work_centre: formData.work_centre,
//         location: formData.location || undefined,
//         max_capacity: formData.max_capacity ? Number(formData.max_capacity) : undefined,
//         operating_speed: formData.operating_speed ? Number(formData.operating_speed) : undefined,
//         oee_target_percent: formData.oee_target_percent ? Number(formData.oee_target_percent) : 85,
//         power_consumption: formData.power_consumption ? Number(formData.power_consumption) : undefined,
//         maintenance_interval: formData.maintenance_interval ? Number(formData.maintenance_interval) : undefined,
//         notes: formData.notes || undefined
//       };
//       // Remove undefined fields
//       Object.keys(payload).forEach(key => payload[key] === undefined && delete payload[key]);

//       const response = await axios.post(`${BASE_URL}/api/machines`, payload, {
//         headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
//       });
//       if (response.data.success) {
//         onSave(response.data.data);
//       } else {
//         setSubmitError(response.data.message || 'Failed to add machine');
//       }
//     } catch (err) {
//       console.error('Error adding machine:', err);
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
//         color: COLORS.text.secondary,
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
//           <Paper sx={{ p: 2, bgcolor: '#f9fafb', borderRadius: 2, border: `1px solid ${COLORS.border}` }}>
//             <Typography sx={{ fontSize: '0.9rem', fontWeight: 600, color: COLORS.primary, mb: 1.5 }}>
//               Basic Information
//             </Typography>
//             <Grid container spacing={1.5}>
//               <Grid item xs={12} sm={6}>
//                 <Box><Typography sx={labelStyle}>MACHINE NAME <span style={{ color: '#EF4444' }}>*</span></Typography>
//                   <TextField fullWidth size="small" name="machine_name" placeholder="e.g., Hydraulic Press 100T" value={formData.machine_name} onChange={handleChange} onBlur={handleBlur} error={!!fieldErrors.machine_name} helperText={fieldErrors.machine_name} sx={inputStyle} /></Box>
//               </Grid>
//               <Grid item xs={12} sm={6}>
//                 <Box><Typography sx={labelStyle}>MACHINE CODE <span style={{ color: '#EF4444' }}>*</span></Typography>
//                   <TextField fullWidth size="small" name="machine_code" placeholder="e.g., PR-001" value={formData.machine_code} onChange={handleChange} onBlur={handleBlur} error={!!fieldErrors.machine_code} helperText={fieldErrors.machine_code} sx={inputStyle} /></Box>
//               </Grid>
//               <Grid item xs={12} sm={6}>
//                 <Box><Typography sx={labelStyle}>MACHINE TYPE <span style={{ color: '#EF4444' }}>*</span></Typography>
//                   <TextField select fullWidth size="small" name="machine_type" value={formData.machine_type} onChange={handleChange} onBlur={handleBlur} error={!!fieldErrors.machine_type} helperText={fieldErrors.machine_type} sx={inputStyle}>
//                     <MenuItem value="" disabled>Select Type</MenuItem>
//                     {machineTypeOptions.map(opt => <MenuItem key={opt} value={opt}>{opt}</MenuItem>)}
//                   </TextField>
//                 </Box>
//               </Grid>
//               <Grid item xs={12} sm={6}>
//                 <Box><Typography sx={labelStyle}>WORK CENTRE <span style={{ color: '#EF4444' }}>*</span></Typography>
//                   <TextField fullWidth size="small" name="work_centre" placeholder="e.g., Press Shop, CNC Section" value={formData.work_centre} onChange={handleChange} onBlur={handleBlur} error={!!fieldErrors.work_centre} helperText={fieldErrors.work_centre} sx={inputStyle} /></Box>
//               </Grid>
//               <Grid item xs={12}>
//                 <Box><Typography sx={labelStyle}>LOCATION</Typography>
//                   <TextField fullWidth size="small" name="location" placeholder="e.g., Building A, Floor 1" value={formData.location} onChange={handleChange} sx={inputStyle} /></Box>
//               </Grid>
//             </Grid>
//           </Paper>
//         );

//       case 1:
//         return (
//           <Paper sx={{ p: 2, bgcolor: '#f9fafb', borderRadius: 2, border: `1px solid ${COLORS.border}` }}>
//             <Typography sx={{ fontSize: '0.9rem', fontWeight: 600, color: COLORS.primary, mb: 1.5 }}>
//               Capacity & Schedule
//             </Typography>
//             <Grid container spacing={1.5}>
//               <Grid item xs={12} sm={6}>
//                 <Box><Typography sx={labelStyle}>MAX CAPACITY (units)</Typography>
//                   <TextField fullWidth size="small" name="max_capacity" type="number" placeholder="e.g., 5000" value={formData.max_capacity} onChange={handleChange} onBlur={handleBlur} error={!!fieldErrors.max_capacity} helperText={fieldErrors.max_capacity} inputProps={{ min: 0 }} sx={inputStyle} /></Box>
//               </Grid>
//               <Grid item xs={12} sm={6}>
//                 <Box><Typography sx={labelStyle}>OPERATING SPEED (units/hour)</Typography>
//                   <TextField fullWidth size="small" name="operating_speed" type="number" placeholder="e.g., 120" value={formData.operating_speed} onChange={handleChange} onBlur={handleBlur} error={!!fieldErrors.operating_speed} helperText={fieldErrors.operating_speed} inputProps={{ min: 0 }} sx={inputStyle} /></Box>
//               </Grid>
//               <Grid item xs={12} sm={6}>
//                 <Box><Typography sx={labelStyle}>OEE TARGET (%)</Typography>
//                   <TextField fullWidth size="small" name="oee_target_percent" type="number" placeholder="e.g., 85" value={formData.oee_target_percent} onChange={handleChange} onBlur={handleBlur} error={!!fieldErrors.oee_target_percent} helperText={fieldErrors.oee_target_percent} inputProps={{ min: 0, max: 100 }} sx={inputStyle} /></Box>
//               </Grid>
//             </Grid>
//           </Paper>
//         );

//       case 2:
//         return (
//           <Paper sx={{ p: 2, bgcolor: '#f9fafb', borderRadius: 2, border: `1px solid ${COLORS.border}` }}>
//             <Typography sx={{ fontSize: '0.9rem', fontWeight: 600, color: COLORS.primary, mb: 1.5 }}>
//               Technical Details
//             </Typography>
//             <Grid container spacing={1.5}>
//               <Grid item xs={12} sm={6}>
//                 <Box><Typography sx={labelStyle}>POWER CONSUMPTION (kW)</Typography>
//                   <TextField fullWidth size="small" name="power_consumption" type="number" placeholder="e.g., 50" value={formData.power_consumption} onChange={handleChange} onBlur={handleBlur} error={!!fieldErrors.power_consumption} helperText={fieldErrors.power_consumption} inputProps={{ min: 0 }} sx={inputStyle} /></Box>
//               </Grid>
//               <Grid item xs={12} sm={6}>
//                 <Box><Typography sx={labelStyle}>MAINTENANCE INTERVAL (days)</Typography>
//                   <TextField fullWidth size="small" name="maintenance_interval" type="number" placeholder="e.g., 30" value={formData.maintenance_interval} onChange={handleChange} onBlur={handleBlur} error={!!fieldErrors.maintenance_interval} helperText={fieldErrors.maintenance_interval} inputProps={{ min: 0 }} sx={inputStyle} /></Box>
//               </Grid>
//               <Grid item xs={12}>
//                 <Box><Typography sx={labelStyle}>NOTES</Typography>
//                   <TextField fullWidth size="small" name="notes" multiline rows={2} placeholder="Additional notes about the machine..." value={formData.notes} onChange={handleChange} sx={inputStyle} /></Box>
//               </Grid>
//             </Grid>
//           </Paper>
//         );

//       case 3:
//         return (
//           <Paper sx={{ p: 2, bgcolor: '#f9fafb', borderRadius: 2, border: `1px solid ${COLORS.border}` }}>
//             <Typography sx={{ fontSize: '0.9rem', fontWeight: 600, color: COLORS.primary, mb: 1.5 }}>
//               Review & Submit
//             </Typography>
//             <Grid container spacing={1}>
//               <Grid item xs={6}><Typography sx={{ fontSize: '0.75rem', color: COLORS.text.secondary }}>Machine Name:</Typography></Grid>
//               <Grid item xs={6}><Typography sx={{ fontSize: '0.75rem', fontWeight: 500 }}>{formData.machine_name}</Typography></Grid>
//               <Grid item xs={6}><Typography sx={{ fontSize: '0.75rem', color: COLORS.text.secondary }}>Machine Code:</Typography></Grid>
//               <Grid item xs={6}><Typography sx={{ fontSize: '0.75rem', fontWeight: 500 }}>{formData.machine_code}</Typography></Grid>
//               <Grid item xs={6}><Typography sx={{ fontSize: '0.75rem', color: COLORS.text.secondary }}>Machine Type:</Typography></Grid>
//               <Grid item xs={6}><Typography sx={{ fontSize: '0.75rem', fontWeight: 500 }}>{formData.machine_type}</Typography></Grid>
//               <Grid item xs={6}><Typography sx={{ fontSize: '0.75rem', color: COLORS.text.secondary }}>Work Centre:</Typography></Grid>
//               <Grid item xs={6}><Typography sx={{ fontSize: '0.75rem', fontWeight: 500 }}>{formData.work_centre}</Typography></Grid>
//               <Grid item xs={6}><Typography sx={{ fontSize: '0.75rem', color: COLORS.text.secondary }}>Location:</Typography></Grid>
//               <Grid item xs={6}><Typography sx={{ fontSize: '0.75rem', fontWeight: 500 }}>{formData.location || '—'}</Typography></Grid>
//               <Grid item xs={6}><Typography sx={{ fontSize: '0.75rem', color: COLORS.text.secondary }}>Max Capacity:</Typography></Grid>
//               <Grid item xs={6}><Typography sx={{ fontSize: '0.75rem', fontWeight: 500 }}>{formData.max_capacity || '—'}</Typography></Grid>
//               <Grid item xs={6}><Typography sx={{ fontSize: '0.75rem', color: COLORS.text.secondary }}>Operating Speed:</Typography></Grid>
//               <Grid item xs={6}><Typography sx={{ fontSize: '0.75rem', fontWeight: 500 }}>{formData.operating_speed || '—'}</Typography></Grid>
//               <Grid item xs={6}><Typography sx={{ fontSize: '0.75rem', color: COLORS.text.secondary }}>OEE Target:</Typography></Grid>
//               <Grid item xs={6}><Typography sx={{ fontSize: '0.75rem', fontWeight: 500 }}>{formData.oee_target_percent}%</Typography></Grid>
//               <Grid item xs={6}><Typography sx={{ fontSize: '0.75rem', color: COLORS.text.secondary }}>Power Consumption:</Typography></Grid>
//               <Grid item xs={6}><Typography sx={{ fontSize: '0.75rem', fontWeight: 500 }}>{formData.power_consumption || '—'} kW</Typography></Grid>
//               <Grid item xs={6}><Typography sx={{ fontSize: '0.75rem', color: COLORS.text.secondary }}>Maintenance Interval:</Typography></Grid>
//               <Grid item xs={6}><Typography sx={{ fontSize: '0.75rem', fontWeight: 500 }}>{formData.maintenance_interval || '—'} days</Typography></Grid>
//               {formData.notes && (
//                 <>
//                   <Grid item xs={12}><Divider sx={{ my: 1 }} /></Grid>
//                   <Grid item xs={4}><Typography sx={{ fontSize: '0.75rem', color: COLORS.text.secondary }}>Notes:</Typography></Grid>
//                   <Grid item xs={8}><Typography sx={{ fontSize: '0.75rem', fontWeight: 500 }}>{formData.notes}</Typography></Grid>
//                 </>
//               )}
//             </Grid>
//           </Paper>
//         );

//       default:
//         return null;
//     }
//   };

//   return (
//     <Paper sx={{ mt: 2, p: 2, bgcolor: '#ffffff', border: `1px solid ${COLORS.border}`, borderRadius: 2, width: '100%', boxSizing: 'border-box' }}>
//       <Typography sx={{ fontSize: '1rem', fontWeight: 700, color: COLORS.text.primary, mb: 2 }}>
//         Add New Machine
//       </Typography>

//       <Stepper activeStep={activeStep} alternativeLabel connector={<ColorConnector />} sx={{ mb: 2 }}>
//         {machineSteps.map((label) => (
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
//           {activeStep === machineSteps.length - 1 ? (
//             <Button
//               variant="contained"
//               size="small"
//               onClick={handleSubmit}
//               disabled={loading}
//               startIcon={loading ? null : <AddIcon sx={{ fontSize: '1rem' }} />}
//               sx={{
//                 fontSize: '0.7rem',
//                 textTransform: 'none',
//                 bgcolor: COLORS.primary,
//                 '&:hover': { bgcolor: COLORS.primaryDark }
//               }}
//             >
//               {loading ? <CircularProgress size={16} sx={{ color: '#fff' }} /> : 'Add Machine'}
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

// // ==================== Main AddOee Component ====================
// const AddOee = ({ open, onClose, onAdd }) => {
//   const [activeStep, setActiveStep] = useState(0);
//   const [loading, setLoading] = useState(false);
//   const [machinesLoading, setMachinesLoading] = useState(false);
//   const [error, setError] = useState('');
//   const [fieldErrors, setFieldErrors] = useState({});
//   const [machines, setMachines] = useState([]);
//   const [calculatedOEE, setCalculatedOEE] = useState(null);

//   // Inline machine form state
//   const [showInlineMachineForm, setShowInlineMachineForm] = useState(false);

//   const [formData, setFormData] = useState({
//     machine_id: '',
//     date: new Date().toISOString().split('T')[0],
//     shift: 'General',
//     planned_production_time: 480,
//     actual_run_time: 440,
//     theoretical_capacity: 500,
//     good_qty: 460,
//     total_qty: 480,
//     notes: ''
//   });

//   // Fetch machines on component mount
//   useEffect(() => {
//     if (open) {
//       fetchMachines();
//       // Reset OEE form when opened
//       resetForm();
//     }
//   }, [open]);

//   const fetchMachines = async () => {
//     setMachinesLoading(true);
//     try {
//       const token = localStorage.getItem('token');
//       const response = await axios.get(`${BASE_URL}/api/machines`, {
//         headers: {
//           'Authorization': `Bearer ${token}`
//         }
//       });

//       if (response.data.success) {
//         setMachines(response.data.data);
//       } else {
//         setError('Failed to fetch machines');
//       }
//     } catch (err) {
//       console.error('Error fetching machines:', err);
//       setError('Failed to load machines. Please try again.');
//     } finally {
//       setMachinesLoading(false);
//     }
//   };

//   const handleMachineAdded = (newMachine) => {
//     setMachines(prev => [...prev, newMachine]);
//     // Auto-select the newly added machine
//     setFormData(prev => ({
//       ...prev,
//       machine_id: newMachine._id
//     }));
//     // Clear any machine-related error
//     if (fieldErrors.machine_id) {
//       setFieldErrors(prev => ({
//         ...prev,
//         machine_id: ''
//       }));
//     }
//     // Close the inline form
//     setShowInlineMachineForm(false);
//   };

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData(prev => ({ ...prev, [name]: value }));
//     setFieldErrors(prev => ({ ...prev, [name]: '' }));
    
//     // Reset calculated OEE when form data changes
//     if (calculatedOEE) {
//       setCalculatedOEE(null);
//     }
//   };

//   const calculateOEEValues = () => {
//     const { planned_production_time, actual_run_time, theoretical_capacity, good_qty, total_qty } = formData;
    
//     // Calculate Availability
//     const availability = (actual_run_time / planned_production_time) * 100;
    
//     // Calculate Performance
//     const ideal_run_rate = theoretical_capacity / planned_production_time;
//     const actual_output_rate = total_qty / actual_run_time;
//     const performance = (actual_output_rate / ideal_run_rate) * 100;
    
//     // Calculate Quality
//     const quality = (good_qty / total_qty) * 100;
    
//     // Calculate Overall OEE
//     const oee = (availability / 100) * (performance / 100) * (quality / 100) * 100;
    
//     // Calculate total downtime
//     const total_downtime_min = planned_production_time - actual_run_time;
    
//     return {
//       availability: Math.round(availability * 10) / 10,
//       performance: Math.round(performance * 10) / 10,
//       quality: Math.round(quality * 10) / 10,
//       oee: Math.round(oee * 10) / 10,
//       total_downtime_min
//     };
//   };

//   const getOEEStatus = (oee) => {
//     if (oee >= 85) return { label: 'Excellent', color: COLORS.success, icon: CheckCircleIcon };
//     if (oee >= 60) return { label: 'Good', color: COLORS.primary, icon: SpeedIcon };
//     if (oee >= 40) return { label: 'Fair', color: COLORS.warning, icon: WarningIcon };
//     return { label: 'Poor', color: COLORS.error, icon: WarningIcon };
//   };

//   const validateStep = (step) => {
//     const errors = {};
//     let isValid = true;

//     switch (step) {
//       case 0:
//         if (!formData.machine_id) {
//           errors.machine_id = 'Please select a machine';
//           isValid = false;
//         }
//         if (!formData.date) {
//           errors.date = 'Date is required';
//           isValid = false;
//         }
//         if (!formData.shift) {
//           errors.shift = 'Shift is required';
//           isValid = false;
//         }
//         break;

//       case 1:
//         if (!formData.planned_production_time || formData.planned_production_time <= 0) {
//           errors.planned_production_time = 'Valid planned production time is required';
//           isValid = false;
//         }
//         if (!formData.actual_run_time || formData.actual_run_time <= 0) {
//           errors.actual_run_time = 'Valid actual run time is required';
//           isValid = false;
//         }
//         if (formData.actual_run_time > formData.planned_production_time) {
//           errors.actual_run_time = 'Actual run time cannot exceed planned production time';
//           isValid = false;
//         }
//         if (!formData.theoretical_capacity || formData.theoretical_capacity <= 0) {
//           errors.theoretical_capacity = 'Valid theoretical capacity is required';
//           isValid = false;
//         }
//         if (!formData.total_qty || formData.total_qty <= 0) {
//           errors.total_qty = 'Valid total quantity is required';
//           isValid = false;
//         }
//         if (!formData.good_qty || formData.good_qty <= 0) {
//           errors.good_qty = 'Valid good quantity is required';
//           isValid = false;
//         }
//         if (formData.good_qty > formData.total_qty) {
//           errors.good_qty = 'Good quantity cannot exceed total quantity';
//           isValid = false;
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
//       if (activeStep === 1 && !calculatedOEE) {
//         const oeeValues = calculateOEEValues();
//         setCalculatedOEE(oeeValues);
//       }
//       setError('');
//       setActiveStep((prevStep) => prevStep + 1);
//     }
//   };

//   const handleBack = () => {
//     setError('');
//     setActiveStep((prevStep) => prevStep - 1);
//   };

//   const handleSubmit = async () => {
//     if (!validateStep(1)) {
//       return;
//     }

//     setLoading(true);
//     setError('');

//     try {
//       const token = localStorage.getItem('token');

//       const submitData = {
//         machine_id: formData.machine_id,
//         date: formData.date,
//         shift: formData.shift,
//         planned_production_time: Number(formData.planned_production_time),
//         actual_run_time: Number(formData.actual_run_time),
//         theoretical_capacity: Number(formData.theoretical_capacity),
//         good_qty: Number(formData.good_qty),
//         total_qty: Number(formData.total_qty),
//         notes: formData.notes || ''
//       };

//       const response = await axios.post(`${BASE_URL}/api/oee-records`, submitData, {
//         headers: {
//           'Authorization': `Bearer ${token}`,
//           'Content-Type': 'application/json'
//         }
//       });

//       if (response.data.success) {
//         onAdd();
//         onClose();
//         resetForm();
//       } else {
//         setError(response.data.message || 'Failed to add OEE record');
//       }
//     } catch (err) {
//       console.error('Error adding OEE record:', err);
//       setError(err.response?.data?.message || 'Failed to add OEE record. Please try again.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const resetForm = () => {
//     setActiveStep(0);
//     setFormData({
//       machine_id: '',
//       date: new Date().toISOString().split('T')[0],
//       shift: 'General',
//       planned_production_time: 480,
//       actual_run_time: 440,
//       theoretical_capacity: 500,
//       good_qty: 460,
//       total_qty: 480,
//       notes: ''
//     });
//     setCalculatedOEE(null);
//     setFieldErrors({});
//     setError('');
//     setShowInlineMachineForm(false);
//   };

//   const handleClose = () => {
//     resetForm();
//     onClose();
//   };

//   const getSelectedMachine = () => {
//     return machines.find(m => m._id === formData.machine_id);
//   };

//   const renderStepContent = (step) => {
//     switch (step) {
//       case 0:
//         return (
//           <Stack spacing={2}>
//             <Paper sx={{ p: 2, borderRadius: 1.5, border: `1px solid ${COLORS.border}` }}>
//               <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color: COLORS.primary, mb: 1.5 }}>
//                 <AssessmentIcon sx={{ fontSize: '1rem', mr: 0.5, verticalAlign: 'middle' }} />
//                 Machine & Shift Details
//               </Typography>

//               <Grid container spacing={1.5}>
//                 <Grid size={{ xs: 12 }}>
//                   <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//                     <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary }}>
//                       SELECT MACHINE <span style={{ color: '#EF4444' }}>*</span>
//                     </Typography>
//                     <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
//                       <Box sx={{ flex: 1 }}>
//                         <FormControl fullWidth size="small" error={!!fieldErrors.machine_id}>
//                           <Select
//                             name="machine_id"
//                             value={formData.machine_id}
//                             onChange={handleChange}
//                             disabled={machinesLoading || (showInlineMachineForm)}
//                             sx={{ borderRadius: 1.5, fontSize: '0.75rem' }}
//                             displayEmpty
//                           >
//                             <MenuItem value="" disabled sx={{ fontSize: '0.75rem' }}>
//                               {machinesLoading ? 'Loading machines...' : 'Select a machine'}
//                             </MenuItem>
//                             {machines.map(machine => (
//                               <MenuItem key={machine._id} value={machine._id} sx={{ fontSize: '0.75rem' }}>
//                                 {machine.machine_name} ({machine.machine_code})
//                               </MenuItem>
//                             ))}
//                           </Select>
//                           {fieldErrors.machine_id && (
//                             <Typography sx={{ fontSize: '0.7rem', color: '#EF4444', mt: 0.5 }}>
//                               {fieldErrors.machine_id}
//                             </Typography>
//                           )}
//                         </FormControl>
//                       </Box>
                      
//                       <Button
//                         variant="outlined"
//                         size="small"
//                         onClick={() => setShowInlineMachineForm(!showInlineMachineForm)}
//                         disabled={loading || machinesLoading}
//                         startIcon={showInlineMachineForm ? <CloseIcon sx={{ fontSize: '0.875rem' }} /> : <AddIcon sx={{ fontSize: '0.875rem' }} />}
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
//                         {showInlineMachineForm ? 'Cancel' : 'Add New'}
//                       </Button>
//                     </Box>
//                   </Box>
//                 </Grid>

//                 <Grid size={{ xs: 12, sm: 6 }}>
//                   <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//                     <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary }}>
//                       DATE <span style={{ color: '#EF4444' }}>*</span>
//                     </Typography>
//                     <TextField
//                       fullWidth
//                       type="date"
//                       size="small"
//                       name="date"
//                       value={formData.date}
//                       onChange={handleChange}
//                       error={!!fieldErrors.date}
//                       helperText={fieldErrors.date}
//                       sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5, fontSize: '0.75rem' } }}
//                       InputLabelProps={{ shrink: true }}
//                     />
//                   </Box>
//                 </Grid>

//                 <Grid size={{ xs: 12, sm: 6 }}>
//                   <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//                     <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary }}>
//                       SHIFT <span style={{ color: '#EF4444' }}>*</span>
//                     </Typography>
//                     <FormControl fullWidth size="small" error={!!fieldErrors.shift}>
//                       <Select
//                         name="shift"
//                         value={formData.shift}
//                         onChange={handleChange}
//                         sx={{ borderRadius: 1.5, fontSize: '0.75rem' }}
//                       >
//                         {SHIFT_OPTIONS.map(option => (
//                           <MenuItem key={option} value={option} sx={{ fontSize: '0.75rem' }}>
//                             {option}
//                           </MenuItem>
//                         ))}
//                       </Select>
//                     </FormControl>
//                   </Box>
//                 </Grid>
//               </Grid>

//               {/* Inline Machine Form appears here */}
//               {showInlineMachineForm && (
//                 <MachineInlineForm
//                   onClose={() => setShowInlineMachineForm(false)}
//                   onSave={handleMachineAdded}
//                 />
//               )}
//             </Paper>

//             {getSelectedMachine() && (
//               <Paper sx={{ p: 2, borderRadius: 1.5, bgcolor: COLORS.background.light, border: `1px solid ${COLORS.border}` }}>
//                 <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: COLORS.primary, mb: 1 }}>
//                   Selected Machine Details
//                 </Typography>
//                 <Grid container spacing={1}>
//                   <Grid size={{ xs: 4 }}>
//                     <Typography sx={{ fontSize: '0.7rem', color: COLORS.text.secondary }}>Machine Code:</Typography>
//                   </Grid>
//                   <Grid size={{ xs: 8 }}>
//                     <Typography sx={{ fontSize: '0.7rem', fontWeight: 500 }}>{getSelectedMachine().machine_code}</Typography>
//                   </Grid>
//                   <Grid size={{ xs: 4 }}>
//                     <Typography sx={{ fontSize: '0.7rem', color: COLORS.text.secondary }}>Machine Type:</Typography>
//                   </Grid>
//                   <Grid size={{ xs: 8 }}>
//                     <Typography sx={{ fontSize: '0.7rem', fontWeight: 500 }}>{getSelectedMachine().machine_type}</Typography>
//                   </Grid>
//                   <Grid size={{ xs: 4 }}>
//                     <Typography sx={{ fontSize: '0.7rem', color: COLORS.text.secondary }}>Work Centre:</Typography>
//                   </Grid>
//                   <Grid size={{ xs: 8 }}>
//                     <Typography sx={{ fontSize: '0.7rem', fontWeight: 500 }}>{getSelectedMachine().work_centre}</Typography>
//                   </Grid>
//                   <Grid size={{ xs: 4 }}>
//                     <Typography sx={{ fontSize: '0.7rem', color: COLORS.text.secondary }}>OEE Target:</Typography>
//                   </Grid>
//                   <Grid size={{ xs: 8 }}>
//                     <Typography sx={{ fontSize: '0.7rem', fontWeight: 500, color: COLORS.primary }}>
//                       {getSelectedMachine().oee_target_percent || 85}%
//                     </Typography>
//                   </Grid>
//                 </Grid>
//               </Paper>
//             )}
//           </Stack>
//         );

//       case 1:
//         return (
//           <Stack spacing={2}>
//             <Paper sx={{ p: 2, borderRadius: 1.5, border: `1px solid ${COLORS.border}` }}>
//               <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color: COLORS.primary, mb: 1.5 }}>
//                 <SpeedIcon sx={{ fontSize: '1rem', mr: 0.5, verticalAlign: 'middle' }} />
//                 Production Data
//               </Typography>

//               <Grid container spacing={1.5}>
//                 <Grid size={{ xs: 12, sm: 6 }}>
//                   <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//                     <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary }}>
//                       PLANNED PRODUCTION TIME (minutes) <span style={{ color: '#EF4444' }}>*</span>
//                     </Typography>
//                     <TextField
//                       fullWidth
//                       type="number"
//                       size="small"
//                       name="planned_production_time"
//                       value={formData.planned_production_time}
//                       onChange={handleChange}
//                       placeholder="e.g., 480"
//                       error={!!fieldErrors.planned_production_time}
//                       helperText={fieldErrors.planned_production_time}
//                       sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5, fontSize: '0.75rem' } }}
//                     />
//                   </Box>
//                 </Grid>

//                 <Grid size={{ xs: 12, sm: 6 }}>
//                   <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//                     <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary }}>
//                       ACTUAL RUN TIME (minutes) <span style={{ color: '#EF4444' }}>*</span>
//                     </Typography>
//                     <TextField
//                       fullWidth
//                       type="number"
//                       size="small"
//                       name="actual_run_time"
//                       value={formData.actual_run_time}
//                       onChange={handleChange}
//                       placeholder="e.g., 440"
//                       error={!!fieldErrors.actual_run_time}
//                       helperText={fieldErrors.actual_run_time}
//                       sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5, fontSize: '0.75rem' } }}
//                     />
//                   </Box>
//                 </Grid>

//                 <Grid size={{ xs: 12, sm: 6 }}>
//                   <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//                     <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary }}>
//                       THEORETICAL CAPACITY (units) <span style={{ color: '#EF4444' }}>*</span>
//                     </Typography>
//                     <TextField
//                       fullWidth
//                       type="number"
//                       size="small"
//                       name="theoretical_capacity"
//                       value={formData.theoretical_capacity}
//                       onChange={handleChange}
//                       placeholder="e.g., 500"
//                       error={!!fieldErrors.theoretical_capacity}
//                       helperText={fieldErrors.theoretical_capacity}
//                       sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5, fontSize: '0.75rem' } }}
//                     />
//                   </Box>
//                 </Grid>

//                 <Grid size={{ xs: 12, sm: 6 }}>
//                   <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//                     <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary }}>
//                       TOTAL QUANTITY PRODUCED <span style={{ color: '#EF4444' }}>*</span>
//                     </Typography>
//                     <TextField
//                       fullWidth
//                       type="number"
//                       size="small"
//                       name="total_qty"
//                       value={formData.total_qty}
//                       onChange={handleChange}
//                       placeholder="e.g., 480"
//                       error={!!fieldErrors.total_qty}
//                       helperText={fieldErrors.total_qty}
//                       sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5, fontSize: '0.75rem' } }}
//                     />
//                   </Box>
//                 </Grid>

//                 <Grid size={{ xs: 12, sm: 6 }}>
//                   <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//                     <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary }}>
//                       GOOD QUANTITY <span style={{ color: '#EF4444' }}>*</span>
//                     </Typography>
//                     <TextField
//                       fullWidth
//                       type="number"
//                       size="small"
//                       name="good_qty"
//                       value={formData.good_qty}
//                       onChange={handleChange}
//                       placeholder="e.g., 460"
//                       error={!!fieldErrors.good_qty}
//                       helperText={fieldErrors.good_qty}
//                       sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5, fontSize: '0.75rem' } }}
//                     />
//                   </Box>
//                 </Grid>

//                 <Grid size={{ xs: 12 }}>
//                   <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//                     <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary }}>
//                       NOTES
//                     </Typography>
//                     <TextField
//                       fullWidth
//                       multiline
//                       rows={3}
//                       size="small"
//                       name="notes"
//                       value={formData.notes}
//                       onChange={handleChange}
//                       placeholder="Any additional notes about this OEE record..."
//                       sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5, fontSize: '0.75rem' } }}
//                     />
//                   </Box>
//                 </Grid>
//               </Grid>
//             </Paper>
//           </Stack>
//         );

//       case 2:
//         if (!calculatedOEE) {
//           const oeeValues = calculateOEEValues();
//           if (oeeValues !== calculatedOEE) {
//             setCalculatedOEE(oeeValues);
//           }
//         }

//         const status = calculatedOEE ? getOEEStatus(calculatedOEE.oee) : null;
//         const StatusIcon = status?.icon;

//         return (
//           <Stack spacing={2}>
//             <Paper sx={{ p: 2, borderRadius: 1.5, border: `1px solid ${COLORS.border}` }}>
//               <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color: COLORS.primary, mb: 1.5 }}>
//                 <SpeedIcon sx={{ fontSize: '1rem', mr: 0.5, verticalAlign: 'middle' }} />
//                 OEE Calculation Results
//               </Typography>

//               {calculatedOEE && (
//                 <>
//                   <Grid container spacing={2} sx={{ mb: 2 }}>
//                     <Grid size={{ xs: 12, sm: 6 }}>
//                       <Paper sx={{ p: 2, textAlign: 'center', bgcolor: COLORS.background.light, borderRadius: 1.5 }}>
//                         <Typography sx={{ fontSize: '0.7rem', color: COLORS.text.secondary, mb: 0.5 }}>
//                           Availability
//                         </Typography>
//                         <Typography sx={{ fontSize: '1.5rem', fontWeight: 700, color: COLORS.primary }}>
//                           {calculatedOEE.availability}%
//                         </Typography>
//                         <Typography sx={{ fontSize: '0.65rem', color: COLORS.text.secondary }}>
//                           (Actual Run / Planned Time)
//                         </Typography>
//                       </Paper>
//                     </Grid>
//                     <Grid size={{ xs: 12, sm: 6 }}>
//                       <Paper sx={{ p: 2, textAlign: 'center', bgcolor: COLORS.background.light, borderRadius: 1.5 }}>
//                         <Typography sx={{ fontSize: '0.7rem', color: COLORS.text.secondary, mb: 0.5 }}>
//                           Performance
//                         </Typography>
//                         <Typography sx={{ fontSize: '1.5rem', fontWeight: 700, color: COLORS.primary }}>
//                           {calculatedOEE.performance}%
//                         </Typography>
//                         <Typography sx={{ fontSize: '0.65rem', color: COLORS.text.secondary }}>
//                           (Actual Output / Ideal Output)
//                         </Typography>
//                       </Paper>
//                     </Grid>
//                     <Grid size={{ xs: 12, sm: 6 }}>
//                       <Paper sx={{ p: 2, textAlign: 'center', bgcolor: COLORS.background.light, borderRadius: 1.5 }}>
//                         <Typography sx={{ fontSize: '0.7rem', color: COLORS.text.secondary, mb: 0.5 }}>
//                           Quality
//                         </Typography>
//                         <Typography sx={{ fontSize: '1.5rem', fontWeight: 700, color: COLORS.primary }}>
//                           {calculatedOEE.quality}%
//                         </Typography>
//                         <Typography sx={{ fontSize: '0.65rem', color: COLORS.text.secondary }}>
//                           (Good Qty / Total Qty)
//                         </Typography>
//                       </Paper>
//                     </Grid>
//                     <Grid size={{ xs: 12, sm: 6 }}>
//                       <Paper sx={{ p: 2, textAlign: 'center', bgcolor: COLORS.background.light, borderRadius: 1.5 }}>
//                         <Typography sx={{ fontSize: '0.7rem', color: COLORS.text.secondary, mb: 0.5 }}>
//                           Total Downtime
//                         </Typography>
//                         <Typography sx={{ fontSize: '1.5rem', fontWeight: 700, color: COLORS.warning }}>
//                           {calculatedOEE.total_downtime_min} min
//                         </Typography>
//                         <Typography sx={{ fontSize: '0.65rem', color: COLORS.text.secondary }}>
//                           (Planned - Actual)
//                         </Typography>
//                       </Paper>
//                     </Grid>
//                   </Grid>

//                   <Paper sx={{ p: 2, textAlign: 'center', bgcolor: status.color + '10', borderRadius: 1.5, border: `1px solid ${status.color}30` }}>
//                     <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, mb: 1 }}>
//                       {StatusIcon && <StatusIcon sx={{ color: status.color, fontSize: '1.5rem' }} />}
//                       <Typography sx={{ fontSize: '1rem', fontWeight: 600, color: status.color }}>
//                         Overall OEE: {calculatedOEE.oee}%
//                       </Typography>
//                     </Box>
//                     <Chip 
//                       label={status.label} 
//                       size="small"
//                       sx={{ 
//                         bgcolor: status.color,
//                         color: 'white',
//                         fontSize: '0.7rem',
//                         fontWeight: 500
//                       }}
//                     />
//                     <Typography sx={{ fontSize: '0.7rem', color: COLORS.text.secondary, mt: 1 }}>
//                       OEE = Availability × Performance × Quality
//                     </Typography>
//                   </Paper>
//                 </>
//               )}
//             </Paper>
//           </Stack>
//         );

//       case 3:
//         const selectedMachine = getSelectedMachine();
//         const finalStatus = calculatedOEE ? getOEEStatus(calculatedOEE.oee) : null;
//         const FinalStatusIcon = finalStatus?.icon;

//         return (
//           <Stack spacing={2}>
//             <Paper sx={{ p: 2, borderRadius: 1.5, border: `1px solid ${COLORS.border}` }}>
//               <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color: COLORS.primary, mb: 1.5 }}>
//                 <InfoIcon sx={{ fontSize: '1rem', mr: 0.5, verticalAlign: 'middle' }} />
//                 Review & Submit
//               </Typography>

//               <Stack spacing={2}>
//                 <Paper sx={{ p: 2, bgcolor: COLORS.background.light, borderRadius: 1.5 }}>
//                   <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: COLORS.primary, mb: 1 }}>
//                     Machine Details
//                   </Typography>
//                   <Grid container spacing={1}>
//                     <Grid size={{ xs: 4 }}>
//                       <Typography sx={{ fontSize: '0.7rem', color: COLORS.text.secondary }}>Machine:</Typography>
//                     </Grid>
//                     <Grid size={{ xs: 8 }}>
//                       <Typography sx={{ fontSize: '0.7rem', fontWeight: 500 }}>
//                         {selectedMachine?.machine_name} ({selectedMachine?.machine_code})
//                       </Typography>
//                     </Grid>
//                     <Grid size={{ xs: 4 }}>
//                       <Typography sx={{ fontSize: '0.7rem', color: COLORS.text.secondary }}>Date:</Typography>
//                     </Grid>
//                     <Grid size={{ xs: 8 }}>
//                       <Typography sx={{ fontSize: '0.7rem', fontWeight: 500 }}>{formData.date}</Typography>
//                     </Grid>
//                     <Grid size={{ xs: 4 }}>
//                       <Typography sx={{ fontSize: '0.7rem', color: COLORS.text.secondary }}>Shift:</Typography>
//                     </Grid>
//                     <Grid size={{ xs: 8 }}>
//                       <Typography sx={{ fontSize: '0.7rem', fontWeight: 500 }}>{formData.shift}</Typography>
//                     </Grid>
//                   </Grid>
//                 </Paper>

//                 <Paper sx={{ p: 2, bgcolor: COLORS.background.light, borderRadius: 1.5 }}>
//                   <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: COLORS.primary, mb: 1 }}>
//                     Production Data
//                   </Typography>
//                   <Grid container spacing={1}>
//                     <Grid size={{ xs: 6 }}>
//                       <Typography sx={{ fontSize: '0.7rem', color: COLORS.text.secondary }}>Planned Time:</Typography>
//                     </Grid>
//                     <Grid size={{ xs: 6 }}>
//                       <Typography sx={{ fontSize: '0.7rem', fontWeight: 500 }}>{formData.planned_production_time} min</Typography>
//                     </Grid>
//                     <Grid size={{ xs: 6 }}>
//                       <Typography sx={{ fontSize: '0.7rem', color: COLORS.text.secondary }}>Actual Run Time:</Typography>
//                     </Grid>
//                     <Grid size={{ xs: 6 }}>
//                       <Typography sx={{ fontSize: '0.7rem', fontWeight: 500 }}>{formData.actual_run_time} min</Typography>
//                     </Grid>
//                     <Grid size={{ xs: 6 }}>
//                       <Typography sx={{ fontSize: '0.7rem', color: COLORS.text.secondary }}>Theoretical Capacity:</Typography>
//                     </Grid>
//                     <Grid size={{ xs: 6 }}>
//                       <Typography sx={{ fontSize: '0.7rem', fontWeight: 500 }}>{formData.theoretical_capacity} units</Typography>
//                     </Grid>
//                     <Grid size={{ xs: 6 }}>
//                       <Typography sx={{ fontSize: '0.7rem', color: COLORS.text.secondary }}>Total Quantity:</Typography>
//                     </Grid>
//                     <Grid size={{ xs: 6 }}>
//                       <Typography sx={{ fontSize: '0.7rem', fontWeight: 500 }}>{formData.total_qty} units</Typography>
//                     </Grid>
//                     <Grid size={{ xs: 6 }}>
//                       <Typography sx={{ fontSize: '0.7rem', color: COLORS.text.secondary }}>Good Quantity:</Typography>
//                     </Grid>
//                     <Grid size={{ xs: 6 }}>
//                       <Typography sx={{ fontSize: '0.7rem', fontWeight: 500 }}>{formData.good_qty} units</Typography>
//                     </Grid>
//                     {formData.notes && (
//                       <>
//                         <Grid size={{ xs: 12 }}>
//                           <Divider sx={{ my: 1 }} />
//                         </Grid>
//                         <Grid size={{ xs: 4 }}>
//                           <Typography sx={{ fontSize: '0.7rem', color: COLORS.text.secondary }}>Notes:</Typography>
//                         </Grid>
//                         <Grid size={{ xs: 8 }}>
//                           <Typography sx={{ fontSize: '0.7rem', fontWeight: 500 }}>{formData.notes}</Typography>
//                         </Grid>
//                       </>
//                     )}
//                   </Grid>
//                 </Paper>

//                 {calculatedOEE && (
//                   <Paper sx={{ p: 2, bgcolor: finalStatus?.color + '10', borderRadius: 1.5, border: `1px solid ${finalStatus?.color}30` }}>
//                     <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: COLORS.primary, mb: 1 }}>
//                       OEE Results
//                     </Typography>
//                     <Grid container spacing={1}>
//                       <Grid size={{ xs: 6 }}>
//                         <Typography sx={{ fontSize: '0.7rem', color: COLORS.text.secondary }}>Availability:</Typography>
//                       </Grid>
//                       <Grid size={{ xs: 6 }}>
//                         <Typography sx={{ fontSize: '0.7rem', fontWeight: 500 }}>{calculatedOEE.availability}%</Typography>
//                       </Grid>
//                       <Grid size={{ xs: 6 }}>
//                         <Typography sx={{ fontSize: '0.7rem', color: COLORS.text.secondary }}>Performance:</Typography>
//                       </Grid>
//                       <Grid size={{ xs: 6 }}>
//                         <Typography sx={{ fontSize: '0.7rem', fontWeight: 500 }}>{calculatedOEE.performance}%</Typography>
//                       </Grid>
//                       <Grid size={{ xs: 6 }}>
//                         <Typography sx={{ fontSize: '0.7rem', color: COLORS.text.secondary }}>Quality:</Typography>
//                       </Grid>
//                       <Grid size={{ xs: 6 }}>
//                         <Typography sx={{ fontSize: '0.7rem', fontWeight: 500 }}>{calculatedOEE.quality}%</Typography>
//                       </Grid>
//                       <Grid size={{ xs: 6 }}>
//                         <Typography sx={{ fontSize: '0.7rem', color: COLORS.text.secondary }}>Overall OEE:</Typography>
//                       </Grid>
//                       <Grid size={{ xs: 6 }}>
//                         <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
//                           <Typography sx={{ fontSize: '0.7rem', fontWeight: 700, color: finalStatus?.color }}>
//                             {calculatedOEE.oee}%
//                           </Typography>
//                           {FinalStatusIcon && <FinalStatusIcon sx={{ color: finalStatus?.color, fontSize: '0.8rem' }} />}
//                         </Box>
//                       </Grid>
//                       <Grid size={{ xs: 12 }}>
//                         <Chip 
//                           label={finalStatus?.label}
//                           size="small"
//                           sx={{ 
//                             mt: 0.5,
//                             bgcolor: finalStatus?.color,
//                             color: 'white',
//                             fontSize: '0.65rem',
//                             fontWeight: 500
//                           }}
//                         />
//                       </Grid>
//                     </Grid>
//                   </Paper>
//                 )}
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
//           overflow: 'hidden'
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
//         alignItems: 'center'
//       }}>
//         <Typography sx={{ fontSize: '1.2rem', fontWeight: 700, color: COLORS.text.primary }}>
//           Add OEE Record
//         </Typography>
//         <IconButton onClick={handleClose} size="small">
//           <CloseIcon fontSize="small" />
//         </IconButton>
//       </DialogTitle>

//       <Box sx={{ px: 2.5, pt: 2, bgcolor: COLORS.background.white }}>
//         <Stepper activeStep={activeStep} alternativeLabel connector={<ColorConnector />}>
//           {steps.map((label) => (
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

//       <DialogContent sx={{ p: 2.5, bgcolor: COLORS.background.white }}>
//         {renderStepContent(activeStep)}
//         {error && (
//           <Alert severity="error" sx={{ mt: 2, borderRadius: 1.5, fontSize: '0.75rem' }}>
//             {error}
//           </Alert>
//         )}
//       </DialogContent>

//       <DialogActions sx={{
//         px: 2.5,
//         py: 1.5,
//         borderTop: `1px solid ${COLORS.border}`,
//         bgcolor: COLORS.background.white,
//         justifyContent: 'space-between'
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
//             textTransform: 'none'
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
//               textTransform: 'none'
//             }}
//           >
//             Cancel
//           </Button>
//           {activeStep === steps.length - 1 ? (
//             <Button
//               variant="contained"
//               onClick={handleSubmit}
//               disabled={loading}
//               size="small"
//               startIcon={loading ? <CircularProgress size={16} /> : <AddIcon sx={{ fontSize: '1rem' }} />}
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
//               {loading ? 'Adding...' : 'Add OEE Record'}
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

// export default AddOee;


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
  CircularProgress,
  Chip,
  Divider
} from '@mui/material';
import {
  Add as AddIcon,
  Close as CloseIcon,
  Speed as SpeedIcon,
  Assessment as AssessmentIcon,
  Info as InfoIcon,
  NavigateNext as NavigateNextIcon,
  NavigateBefore as NavigateBeforeIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Edit as EditIcon
} from '@mui/icons-material';
import axios from 'axios';
import BASE_URL from '../../../config/Config';

const steps = ['Select Machine', 'Production Data', 'OEE Calculation', 'Review & Submit'];
const machineSteps = ['Basic Information', 'Capacity & Schedule', 'Technical Details', 'Review & Submit'];

const ColorConnector = styled(StepConnector)(({ theme }) => ({
  [`&.${stepConnectorClasses.active}`]: {
    [`& .${stepConnectorClasses.line}`]: {
      backgroundColor: '#1976D2',
    },
  },
  [`&.${stepConnectorClasses.completed}`]: {
    [`& .${stepConnectorClasses.line}`]: {
      backgroundColor: '#1976D2',
    },
  },
  [`& .${stepConnectorClasses.line}`]: {
    height: 2,
    border: 0,
    backgroundColor: '#eaeaf0',
    borderRadius: 1,
  },
}));

const COLORS = {
  primary: '#1976D2',
  primaryDark: '#1565C0',
  success: '#2E7D32',
  warning: '#ED6C02',
  error: '#D32F2F',
  border: '#E5E7EB',
  text: {
    primary: '#111827',
    secondary: '#6B7280',
    disabled: '#9CA3AF'
  },
  background: {
    light: '#F9FAFB',
    white: '#FFFFFF'
  }
};

const SHIFT_OPTIONS = ['General', 'Morning', 'Afternoon', 'Night'];

// ==================== Inline Machine Form (Full‑width, with Stepper) ====================
const MachineInlineForm = ({ onClose, onSave }) => {
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [formData, setFormData] = useState({
    machine_name: '',
    machine_code: '',
    machine_type: '',
    work_centre: '',
    location: '',
    max_capacity: '',
    operating_speed: '',
    oee_target_percent: '85',
    power_consumption: '',
    maintenance_interval: '',
    notes: ''
  });
  const [fieldErrors, setFieldErrors] = useState({});
  const [touched, setTouched] = useState({});

  // Machine Type options (example)
  const machineTypeOptions = ['Press', 'Lathe', 'CNC', 'Grinder', 'Milling', 'Drilling', 'Welding', 'Other'];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (touched[name] || value) {
      setFieldErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
  };

  const validateStep = (step) => {
    const errors = {};
    let isValid = true;

    switch (step) {
      case 0:
        if (!formData.machine_name.trim()) {
          errors.machine_name = 'Machine name is required';
          isValid = false;
        }
        if (!formData.machine_code.trim()) {
          errors.machine_code = 'Machine code is required';
          isValid = false;
        }
        if (!formData.machine_type) {
          errors.machine_type = 'Machine type is required';
          isValid = false;
        }
        if (!formData.work_centre.trim()) {
          errors.work_centre = 'Work centre is required';
          isValid = false;
        }
        break;

      case 1:
        if (formData.max_capacity && Number(formData.max_capacity) <= 0) {
          errors.max_capacity = 'Must be a positive number';
          isValid = false;
        }
        if (formData.operating_speed && Number(formData.operating_speed) <= 0) {
          errors.operating_speed = 'Must be a positive number';
          isValid = false;
        }
        if (formData.oee_target_percent && (Number(formData.oee_target_percent) < 0 || Number(formData.oee_target_percent) > 100)) {
          errors.oee_target_percent = 'Must be between 0 and 100';
          isValid = false;
        }
        break;

      case 2:
        if (formData.power_consumption && Number(formData.power_consumption) < 0) {
          errors.power_consumption = 'Must be a positive number';
          isValid = false;
        }
        if (formData.maintenance_interval && Number(formData.maintenance_interval) < 0) {
          errors.maintenance_interval = 'Must be a positive number';
          isValid = false;
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

  const handleSubmit = async () => {
    // Validate all steps before submit (re‑run validation for all steps)
    for (let i = 0; i < machineSteps.length - 1; i++) {
      if (!validateStep(i)) {
        setActiveStep(i);
        return;
      }
    }
    setLoading(true);
    setSubmitError('');
    try {
      const token = localStorage.getItem('token');
      const payload = {
        machine_name: formData.machine_name,
        machine_code: formData.machine_code,
        machine_type: formData.machine_type,
        work_centre: formData.work_centre,
        location: formData.location || undefined,
        max_capacity: formData.max_capacity ? Number(formData.max_capacity) : undefined,
        operating_speed: formData.operating_speed ? Number(formData.operating_speed) : undefined,
        oee_target_percent: formData.oee_target_percent ? Number(formData.oee_target_percent) : 85,
        power_consumption: formData.power_consumption ? Number(formData.power_consumption) : undefined,
        maintenance_interval: formData.maintenance_interval ? Number(formData.maintenance_interval) : undefined,
        notes: formData.notes || undefined
      };
      // Remove undefined fields
      Object.keys(payload).forEach(key => payload[key] === undefined && delete payload[key]);

      const response = await axios.post(`${BASE_URL}/api/machines`, payload, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
      });
      if (response.data.success) {
        onSave(response.data.data);
      } else {
        setSubmitError(response.data.message || 'Failed to add machine');
      }
    } catch (err) {
      console.error('Error adding machine:', err);
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
        color: COLORS.text.secondary,
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
          <Paper sx={{ p: 2, bgcolor: '#f9fafb', borderRadius: 2, border: `1px solid ${COLORS.border}` }}>
            <Typography sx={{ fontSize: '0.9rem', fontWeight: 600, color: COLORS.primary, mb: 1.5 }}>
              Basic Information
            </Typography>
            <Grid container spacing={1.5}>
              <Grid item xs={12} sm={6}>
                <Box><Typography sx={labelStyle}>MACHINE NAME <span style={{ color: '#EF4444' }}>*</span></Typography>
                  <TextField fullWidth size="small" name="machine_name" placeholder="e.g., Hydraulic Press 100T" value={formData.machine_name} onChange={handleChange} onBlur={handleBlur} error={!!fieldErrors.machine_name} helperText={fieldErrors.machine_name} sx={inputStyle} /></Box>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Box><Typography sx={labelStyle}>MACHINE CODE <span style={{ color: '#EF4444' }}>*</span></Typography>
                  <TextField fullWidth size="small" name="machine_code" placeholder="e.g., PR-001" value={formData.machine_code} onChange={handleChange} onBlur={handleBlur} error={!!fieldErrors.machine_code} helperText={fieldErrors.machine_code} sx={inputStyle} /></Box>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Box><Typography sx={labelStyle}>MACHINE TYPE <span style={{ color: '#EF4444' }}>*</span></Typography>
                  <TextField select fullWidth size="small" name="machine_type" value={formData.machine_type} onChange={handleChange} onBlur={handleBlur} error={!!fieldErrors.machine_type} helperText={fieldErrors.machine_type} sx={inputStyle}>
                    <MenuItem value="" disabled>Select Type</MenuItem>
                    {machineTypeOptions.map(opt => <MenuItem key={opt} value={opt}>{opt}</MenuItem>)}
                  </TextField>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Box><Typography sx={labelStyle}>WORK CENTRE <span style={{ color: '#EF4444' }}>*</span></Typography>
                  <TextField fullWidth size="small" name="work_centre" placeholder="e.g., Press Shop, CNC Section" value={formData.work_centre} onChange={handleChange} onBlur={handleBlur} error={!!fieldErrors.work_centre} helperText={fieldErrors.work_centre} sx={inputStyle} /></Box>
              </Grid>
              <Grid item xs={12}>
                <Box><Typography sx={labelStyle}>LOCATION</Typography>
                  <TextField fullWidth size="small" name="location" placeholder="e.g., Building A, Floor 1" value={formData.location} onChange={handleChange} sx={inputStyle} /></Box>
              </Grid>
            </Grid>
          </Paper>
        );

      case 1:
        return (
          <Paper sx={{ p: 2, bgcolor: '#f9fafb', borderRadius: 2, border: `1px solid ${COLORS.border}` }}>
            <Typography sx={{ fontSize: '0.9rem', fontWeight: 600, color: COLORS.primary, mb: 1.5 }}>
              Capacity & Schedule
            </Typography>
            <Grid container spacing={1.5}>
              <Grid item xs={12} sm={6}>
                <Box><Typography sx={labelStyle}>MAX CAPACITY (units)</Typography>
                  <TextField fullWidth size="small" name="max_capacity" type="number" placeholder="e.g., 5000" value={formData.max_capacity} onChange={handleChange} onBlur={handleBlur} error={!!fieldErrors.max_capacity} helperText={fieldErrors.max_capacity} inputProps={{ min: 0 }} sx={inputStyle} /></Box>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Box><Typography sx={labelStyle}>OPERATING SPEED (units/hour)</Typography>
                  <TextField fullWidth size="small" name="operating_speed" type="number" placeholder="e.g., 120" value={formData.operating_speed} onChange={handleChange} onBlur={handleBlur} error={!!fieldErrors.operating_speed} helperText={fieldErrors.operating_speed} inputProps={{ min: 0 }} sx={inputStyle} /></Box>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Box><Typography sx={labelStyle}>OEE TARGET (%)</Typography>
                  <TextField fullWidth size="small" name="oee_target_percent" type="number" placeholder="e.g., 85" value={formData.oee_target_percent} onChange={handleChange} onBlur={handleBlur} error={!!fieldErrors.oee_target_percent} helperText={fieldErrors.oee_target_percent} inputProps={{ min: 0, max: 100 }} sx={inputStyle} /></Box>
              </Grid>
            </Grid>
          </Paper>
        );

      case 2:
        return (
          <Paper sx={{ p: 2, bgcolor: '#f9fafb', borderRadius: 2, border: `1px solid ${COLORS.border}` }}>
            <Typography sx={{ fontSize: '0.9rem', fontWeight: 600, color: COLORS.primary, mb: 1.5 }}>
              Technical Details
            </Typography>
            <Grid container spacing={1.5}>
              <Grid item xs={12} sm={6}>
                <Box><Typography sx={labelStyle}>POWER CONSUMPTION (kW)</Typography>
                  <TextField fullWidth size="small" name="power_consumption" type="number" placeholder="e.g., 50" value={formData.power_consumption} onChange={handleChange} onBlur={handleBlur} error={!!fieldErrors.power_consumption} helperText={fieldErrors.power_consumption} inputProps={{ min: 0 }} sx={inputStyle} /></Box>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Box><Typography sx={labelStyle}>MAINTENANCE INTERVAL (days)</Typography>
                  <TextField fullWidth size="small" name="maintenance_interval" type="number" placeholder="e.g., 30" value={formData.maintenance_interval} onChange={handleChange} onBlur={handleBlur} error={!!fieldErrors.maintenance_interval} helperText={fieldErrors.maintenance_interval} inputProps={{ min: 0 }} sx={inputStyle} /></Box>
              </Grid>
              <Grid item xs={12}>
                <Box><Typography sx={labelStyle}>NOTES</Typography>
                  <TextField fullWidth size="small" name="notes" multiline rows={2} placeholder="Additional notes about the machine..." value={formData.notes} onChange={handleChange} sx={inputStyle} /></Box>
              </Grid>
            </Grid>
          </Paper>
        );

      case 3:
        return (
          <Paper sx={{ p: 2, bgcolor: '#f9fafb', borderRadius: 2, border: `1px solid ${COLORS.border}` }}>
            <Typography sx={{ fontSize: '0.9rem', fontWeight: 600, color: COLORS.primary, mb: 1.5 }}>
              Review & Submit
            </Typography>
            <Grid container spacing={1}>
              <Grid item xs={6}><Typography sx={{ fontSize: '0.75rem', color: COLORS.text.secondary }}>Machine Name:</Typography></Grid>
              <Grid item xs={6}><Typography sx={{ fontSize: '0.75rem', fontWeight: 500 }}>{formData.machine_name}</Typography></Grid>
              <Grid item xs={6}><Typography sx={{ fontSize: '0.75rem', color: COLORS.text.secondary }}>Machine Code:</Typography></Grid>
              <Grid item xs={6}><Typography sx={{ fontSize: '0.75rem', fontWeight: 500 }}>{formData.machine_code}</Typography></Grid>
              <Grid item xs={6}><Typography sx={{ fontSize: '0.75rem', color: COLORS.text.secondary }}>Machine Type:</Typography></Grid>
              <Grid item xs={6}><Typography sx={{ fontSize: '0.75rem', fontWeight: 500 }}>{formData.machine_type}</Typography></Grid>
              <Grid item xs={6}><Typography sx={{ fontSize: '0.75rem', color: COLORS.text.secondary }}>Work Centre:</Typography></Grid>
              <Grid item xs={6}><Typography sx={{ fontSize: '0.75rem', fontWeight: 500 }}>{formData.work_centre}</Typography></Grid>
              <Grid item xs={6}><Typography sx={{ fontSize: '0.75rem', color: COLORS.text.secondary }}>Location:</Typography></Grid>
              <Grid item xs={6}><Typography sx={{ fontSize: '0.75rem', fontWeight: 500 }}>{formData.location || '—'}</Typography></Grid>
              <Grid item xs={6}><Typography sx={{ fontSize: '0.75rem', color: COLORS.text.secondary }}>Max Capacity:</Typography></Grid>
              <Grid item xs={6}><Typography sx={{ fontSize: '0.75rem', fontWeight: 500 }}>{formData.max_capacity || '—'}</Typography></Grid>
              <Grid item xs={6}><Typography sx={{ fontSize: '0.75rem', color: COLORS.text.secondary }}>Operating Speed:</Typography></Grid>
              <Grid item xs={6}><Typography sx={{ fontSize: '0.75rem', fontWeight: 500 }}>{formData.operating_speed || '—'}</Typography></Grid>
              <Grid item xs={6}><Typography sx={{ fontSize: '0.75rem', color: COLORS.text.secondary }}>OEE Target:</Typography></Grid>
              <Grid item xs={6}><Typography sx={{ fontSize: '0.75rem', fontWeight: 500 }}>{formData.oee_target_percent}%</Typography></Grid>
              <Grid item xs={6}><Typography sx={{ fontSize: '0.75rem', color: COLORS.text.secondary }}>Power Consumption:</Typography></Grid>
              <Grid item xs={6}><Typography sx={{ fontSize: '0.75rem', fontWeight: 500 }}>{formData.power_consumption || '—'} kW</Typography></Grid>
              <Grid item xs={6}><Typography sx={{ fontSize: '0.75rem', color: COLORS.text.secondary }}>Maintenance Interval:</Typography></Grid>
              <Grid item xs={6}><Typography sx={{ fontSize: '0.75rem', fontWeight: 500 }}>{formData.maintenance_interval || '—'} days</Typography></Grid>
              {formData.notes && (
                <>
                  <Grid item xs={12}><Divider sx={{ my: 1 }} /></Grid>
                  <Grid item xs={4}><Typography sx={{ fontSize: '0.75rem', color: COLORS.text.secondary }}>Notes:</Typography></Grid>
                  <Grid item xs={8}><Typography sx={{ fontSize: '0.75rem', fontWeight: 500 }}>{formData.notes}</Typography></Grid>
                </>
              )}
            </Grid>
          </Paper>
        );

      default:
        return null;
    }
  };

  return (
    <Paper sx={{ mt: 2, p: 2, bgcolor: '#ffffff', border: `1px solid ${COLORS.border}`, borderRadius: 2, width: '100%', boxSizing: 'border-box' }}>
      <Typography sx={{ fontSize: '1rem', fontWeight: 700, color: COLORS.text.primary, mb: 2 }}>
        Add New Machine
      </Typography>

      <Stepper activeStep={activeStep} alternativeLabel connector={<ColorConnector />} sx={{ mb: 2 }}>
        {machineSteps.map((label) => (
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
          {activeStep === machineSteps.length - 1 ? (
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
              {loading ? <CircularProgress size={16} sx={{ color: '#fff' }} /> : 'Add Machine'}
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

// ==================== Main AddOee Component ====================
const AddOee = ({ open, onClose, onAdd }) => {
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [machinesLoading, setMachinesLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [machines, setMachines] = useState([]);
  const [calculatedOEE, setCalculatedOEE] = useState(null);

  // Inline machine form state
  const [showInlineMachineForm, setShowInlineMachineForm] = useState(false);

  const [formData, setFormData] = useState({
    machine_id: '',
    date: new Date().toISOString().split('T')[0],
    shift: 'General',
    planned_production_time: 480,
    actual_run_time: 440,
    theoretical_capacity: 500,
    good_qty: 460,
    total_qty: 480,
    notes: ''
  });

  // Fetch machines on component mount
  useEffect(() => {
    if (open) {
      fetchMachines();
      // Reset OEE form when opened
      resetForm();
    }
  }, [open]);

  const fetchMachines = async () => {
    setMachinesLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${BASE_URL}/api/machines`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.data.success) {
        setMachines(response.data.data);
      } else {
        setError('Failed to fetch machines');
      }
    } catch (err) {
      console.error('Error fetching machines:', err);
      setError('Failed to load machines. Please try again.');
    } finally {
      setMachinesLoading(false);
    }
  };

  const handleMachineAdded = (newMachine) => {
    setMachines(prev => [...prev, newMachine]);
    // Auto-select the newly added machine
    setFormData(prev => ({
      ...prev,
      machine_id: newMachine._id
    }));
    // Clear any machine-related error
    if (fieldErrors.machine_id) {
      setFieldErrors(prev => ({
        ...prev,
        machine_id: ''
      }));
    }
    // Close the inline form
    setShowInlineMachineForm(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setFieldErrors(prev => ({ ...prev, [name]: '' }));
    
    // Reset calculated OEE when form data changes
    if (calculatedOEE) {
      setCalculatedOEE(null);
    }
  };

  const calculateOEEValues = () => {
    const { planned_production_time, actual_run_time, theoretical_capacity, good_qty, total_qty } = formData;
    
    // Calculate Availability
    const availability = (actual_run_time / planned_production_time) * 100;
    
    // Calculate Performance
    const ideal_run_rate = theoretical_capacity / planned_production_time;
    const actual_output_rate = total_qty / actual_run_time;
    const performance = (actual_output_rate / ideal_run_rate) * 100;
    
    // Calculate Quality
    const quality = (good_qty / total_qty) * 100;
    
    // Calculate Overall OEE
    const oee = (availability / 100) * (performance / 100) * (quality / 100) * 100;
    
    // Calculate total downtime
    const total_downtime_min = planned_production_time - actual_run_time;
    
    return {
      availability: Math.round(availability * 10) / 10,
      performance: Math.round(performance * 10) / 10,
      quality: Math.round(quality * 10) / 10,
      oee: Math.round(oee * 10) / 10,
      total_downtime_min
    };
  };

  const getOEEStatus = (oee) => {
    if (oee >= 85) return { label: 'Excellent', color: COLORS.success, icon: CheckCircleIcon };
    if (oee >= 60) return { label: 'Good', color: COLORS.primary, icon: SpeedIcon };
    if (oee >= 40) return { label: 'Fair', color: COLORS.warning, icon: WarningIcon };
    return { label: 'Poor', color: COLORS.error, icon: WarningIcon };
  };

  const validateStep = (step) => {
    const errors = {};
    let isValid = true;

    switch (step) {
      case 0:
        if (!formData.machine_id) {
          errors.machine_id = 'Please select a machine';
          isValid = false;
        }
        if (!formData.date) {
          errors.date = 'Date is required';
          isValid = false;
        }
        if (!formData.shift) {
          errors.shift = 'Shift is required';
          isValid = false;
        }
        break;

      case 1:
        if (!formData.planned_production_time || formData.planned_production_time <= 0) {
          errors.planned_production_time = 'Valid planned production time is required';
          isValid = false;
        }
        if (!formData.actual_run_time || formData.actual_run_time <= 0) {
          errors.actual_run_time = 'Valid actual run time is required';
          isValid = false;
        }
        if (formData.actual_run_time > formData.planned_production_time) {
          errors.actual_run_time = 'Actual run time cannot exceed planned production time';
          isValid = false;
        }
        if (!formData.theoretical_capacity || formData.theoretical_capacity <= 0) {
          errors.theoretical_capacity = 'Valid theoretical capacity is required';
          isValid = false;
        }
        if (!formData.total_qty || formData.total_qty <= 0) {
          errors.total_qty = 'Valid total quantity is required';
          isValid = false;
        }
        if (!formData.good_qty || formData.good_qty <= 0) {
          errors.good_qty = 'Valid good quantity is required';
          isValid = false;
        }
        if (formData.good_qty > formData.total_qty) {
          errors.good_qty = 'Good quantity cannot exceed total quantity';
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
      if (activeStep === 1 && !calculatedOEE) {
        const oeeValues = calculateOEEValues();
        setCalculatedOEE(oeeValues);
      }
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

      const submitData = {
        machine_id: formData.machine_id,
        date: formData.date,
        shift: formData.shift,
        planned_production_time: Number(formData.planned_production_time),
        actual_run_time: Number(formData.actual_run_time),
        theoretical_capacity: Number(formData.theoretical_capacity),
        good_qty: Number(formData.good_qty),
        total_qty: Number(formData.total_qty),
        notes: formData.notes || ''
      };

      const response = await axios.post(`${BASE_URL}/api/oee-records`, submitData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.data.success) {
        onAdd();
        onClose();
        resetForm();
      } else {
        setError(response.data.message || 'Failed to add OEE record');
      }
    } catch (err) {
      console.error('Error adding OEE record:', err);
      setError(err.response?.data?.message || 'Failed to add OEE record. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setActiveStep(0);
    setFormData({
      machine_id: '',
      date: new Date().toISOString().split('T')[0],
      shift: 'General',
      planned_production_time: 480,
      actual_run_time: 440,
      theoretical_capacity: 500,
      good_qty: 460,
      total_qty: 480,
      notes: ''
    });
    setCalculatedOEE(null);
    setFieldErrors({});
    setError('');
    setShowInlineMachineForm(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const getSelectedMachine = () => {
    return machines.find(m => m._id === formData.machine_id);
  };

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Stack spacing={2}>
            <Paper sx={{ p: 2, borderRadius: 1.5, border: `1px solid ${COLORS.border}` }}>
              <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color: COLORS.primary, mb: 1.5 }}>
                <AssessmentIcon sx={{ fontSize: '1rem', mr: 0.5, verticalAlign: 'middle' }} />
                Machine & Shift Details
              </Typography>

              <Grid container spacing={1.5}>
                <Grid size={{ xs: 12 }}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                    <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary }}>
                      SELECT MACHINE <span style={{ color: '#EF4444' }}>*</span>
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
                      <Box sx={{ flex: 1 }}>
                        <FormControl fullWidth size="small" error={!!fieldErrors.machine_id}>
                          <Select
                            name="machine_id"
                            value={formData.machine_id}
                            onChange={handleChange}
                            disabled={machinesLoading || (showInlineMachineForm)}
                            sx={{ borderRadius: 1.5, fontSize: '0.75rem' }}
                            displayEmpty
                          >
                            <MenuItem value="" disabled sx={{ fontSize: '0.75rem' }}>
                              {machinesLoading ? 'Loading machines...' : 'Select a machine'}
                            </MenuItem>
                            {machines.map(machine => (
                              <MenuItem key={machine._id} value={machine._id} sx={{ fontSize: '0.75rem' }}>
                                {machine.machine_name} ({machine.machine_code})
                              </MenuItem>
                            ))}
                          </Select>
                          {fieldErrors.machine_id && (
                            <Typography sx={{ fontSize: '0.7rem', color: '#EF4444', mt: 0.5 }}>
                              {fieldErrors.machine_id}
                            </Typography>
                          )}
                        </FormControl>
                      </Box>
                      
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => setShowInlineMachineForm(!showInlineMachineForm)}
                        disabled={loading || machinesLoading}
                        startIcon={showInlineMachineForm ? <CloseIcon sx={{ fontSize: '0.875rem' }} /> : <AddIcon sx={{ fontSize: '0.875rem' }} />}
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
                        {showInlineMachineForm ? 'Cancel' : 'Add New'}
                      </Button>
                    </Box>
                  </Box>
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                    <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary }}>
                      DATE <span style={{ color: '#EF4444' }}>*</span>
                    </Typography>
                    <TextField
                      fullWidth
                      type="date"
                      size="small"
                      name="date"
                      value={formData.date}
                      onChange={handleChange}
                      error={!!fieldErrors.date}
                      helperText={fieldErrors.date}
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5, fontSize: '0.75rem' } }}
                      InputLabelProps={{ shrink: true }}
                    />
                  </Box>
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                    <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary }}>
                      SHIFT <span style={{ color: '#EF4444' }}>*</span>
                    </Typography>
                    <FormControl fullWidth size="small" error={!!fieldErrors.shift}>
                      <Select
                        name="shift"
                        value={formData.shift}
                        onChange={handleChange}
                        sx={{ borderRadius: 1.5, fontSize: '0.75rem' }}
                      >
                        {SHIFT_OPTIONS.map(option => (
                          <MenuItem key={option} value={option} sx={{ fontSize: '0.75rem' }}>
                            {option}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Box>
                </Grid>
              </Grid>

              {/* Inline Machine Form appears here */}
              {showInlineMachineForm && (
                <MachineInlineForm
                  onClose={() => setShowInlineMachineForm(false)}
                  onSave={handleMachineAdded}
                />
              )}
            </Paper>

            {getSelectedMachine() && (
              <Paper sx={{ p: 2, borderRadius: 1.5, bgcolor: COLORS.background.light, border: `1px solid ${COLORS.border}` }}>
                <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: COLORS.primary, mb: 1 }}>
                  Selected Machine Details
                </Typography>
                <Grid container spacing={1}>
                  <Grid size={{ xs: 4 }}>
                    <Typography sx={{ fontSize: '0.7rem', color: COLORS.text.secondary }}>Machine Code:</Typography>
                  </Grid>
                  <Grid size={{ xs: 8 }}>
                    <Typography sx={{ fontSize: '0.7rem', fontWeight: 500 }}>{getSelectedMachine().machine_code}</Typography>
                  </Grid>
                  <Grid size={{ xs: 4 }}>
                    <Typography sx={{ fontSize: '0.7rem', color: COLORS.text.secondary }}>Machine Type:</Typography>
                  </Grid>
                  <Grid size={{ xs: 8 }}>
                    <Typography sx={{ fontSize: '0.7rem', fontWeight: 500 }}>{getSelectedMachine().machine_type}</Typography>
                  </Grid>
                  <Grid size={{ xs: 4 }}>
                    <Typography sx={{ fontSize: '0.7rem', color: COLORS.text.secondary }}>Work Centre:</Typography>
                  </Grid>
                  <Grid size={{ xs: 8 }}>
                    <Typography sx={{ fontSize: '0.7rem', fontWeight: 500 }}>{getSelectedMachine().work_centre}</Typography>
                  </Grid>
                  <Grid size={{ xs: 4 }}>
                    <Typography sx={{ fontSize: '0.7rem', color: COLORS.text.secondary }}>OEE Target:</Typography>
                  </Grid>
                  <Grid size={{ xs: 8 }}>
                    <Typography sx={{ fontSize: '0.7rem', fontWeight: 500, color: COLORS.primary }}>
                      {getSelectedMachine().oee_target_percent || 85}%
                    </Typography>
                  </Grid>
                </Grid>
              </Paper>
            )}
          </Stack>
        );

      case 1:
        return (
          <Stack spacing={2}>
            <Paper sx={{ p: 2, borderRadius: 1.5, border: `1px solid ${COLORS.border}` }}>
              <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color: COLORS.primary, mb: 1.5 }}>
                <SpeedIcon sx={{ fontSize: '1rem', mr: 0.5, verticalAlign: 'middle' }} />
                Production Data
              </Typography>

              <Grid container spacing={1.5}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                    <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary }}>
                      PLANNED PRODUCTION TIME (minutes) <span style={{ color: '#EF4444' }}>*</span>
                    </Typography>
                    <TextField
                      fullWidth
                      type="number"
                      size="small"
                      name="planned_production_time"
                      value={formData.planned_production_time}
                      onChange={handleChange}
                      placeholder="e.g., 480"
                      error={!!fieldErrors.planned_production_time}
                      helperText={fieldErrors.planned_production_time}
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5, fontSize: '0.75rem' } }}
                    />
                  </Box>
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                    <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary }}>
                      ACTUAL RUN TIME (minutes) <span style={{ color: '#EF4444' }}>*</span>
                    </Typography>
                    <TextField
                      fullWidth
                      type="number"
                      size="small"
                      name="actual_run_time"
                      value={formData.actual_run_time}
                      onChange={handleChange}
                      placeholder="e.g., 440"
                      error={!!fieldErrors.actual_run_time}
                      helperText={fieldErrors.actual_run_time}
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5, fontSize: '0.75rem' } }}
                    />
                  </Box>
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                    <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary }}>
                      THEORETICAL CAPACITY (units) <span style={{ color: '#EF4444' }}>*</span>
                    </Typography>
                    <TextField
                      fullWidth
                      type="number"
                      size="small"
                      name="theoretical_capacity"
                      value={formData.theoretical_capacity}
                      onChange={handleChange}
                      placeholder="e.g., 500"
                      error={!!fieldErrors.theoretical_capacity}
                      helperText={fieldErrors.theoretical_capacity}
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5, fontSize: '0.75rem' } }}
                    />
                  </Box>
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                    <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary }}>
                      TOTAL QUANTITY PRODUCED <span style={{ color: '#EF4444' }}>*</span>
                    </Typography>
                    <TextField
                      fullWidth
                      type="number"
                      size="small"
                      name="total_qty"
                      value={formData.total_qty}
                      onChange={handleChange}
                      placeholder="e.g., 480"
                      error={!!fieldErrors.total_qty}
                      helperText={fieldErrors.total_qty}
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5, fontSize: '0.75rem' } }}
                    />
                  </Box>
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                    <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary }}>
                      GOOD QUANTITY <span style={{ color: '#EF4444' }}>*</span>
                    </Typography>
                    <TextField
                      fullWidth
                      type="number"
                      size="small"
                      name="good_qty"
                      value={formData.good_qty}
                      onChange={handleChange}
                      placeholder="e.g., 460"
                      error={!!fieldErrors.good_qty}
                      helperText={fieldErrors.good_qty}
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5, fontSize: '0.75rem' } }}
                    />
                  </Box>
                </Grid>

                <Grid size={{ xs: 12 }}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                    <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary }}>
                      NOTES
                    </Typography>
                    <TextField
                      fullWidth
                      multiline
                      rows={3}
                      size="small"
                      name="notes"
                      value={formData.notes}
                      onChange={handleChange}
                      placeholder="Any additional notes about this OEE record..."
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5, fontSize: '0.75rem' } }}
                    />
                  </Box>
                </Grid>
              </Grid>
            </Paper>
          </Stack>
        );

      case 2:
        if (!calculatedOEE) {
          const oeeValues = calculateOEEValues();
          if (oeeValues !== calculatedOEE) {
            setCalculatedOEE(oeeValues);
          }
        }

        const status = calculatedOEE ? getOEEStatus(calculatedOEE.oee) : null;
        const StatusIcon = status?.icon;

        return (
          <Stack spacing={2}>
            <Paper sx={{ p: 2, borderRadius: 1.5, border: `1px solid ${COLORS.border}` }}>
              <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color: COLORS.primary, mb: 1.5 }}>
                <SpeedIcon sx={{ fontSize: '1rem', mr: 0.5, verticalAlign: 'middle' }} />
                OEE Calculation Results
              </Typography>

              {calculatedOEE && (
                <>
                  <Grid container spacing={2} sx={{ mb: 2 }}>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Paper sx={{ p: 2, textAlign: 'center', bgcolor: COLORS.background.light, borderRadius: 1.5 }}>
                        <Typography sx={{ fontSize: '0.7rem', color: COLORS.text.secondary, mb: 0.5 }}>
                          Availability
                        </Typography>
                        <Typography sx={{ fontSize: '1.5rem', fontWeight: 700, color: COLORS.primary }}>
                          {calculatedOEE.availability}%
                        </Typography>
                        <Typography sx={{ fontSize: '0.65rem', color: COLORS.text.secondary }}>
                          (Actual Run / Planned Time)
                        </Typography>
                      </Paper>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Paper sx={{ p: 2, textAlign: 'center', bgcolor: COLORS.background.light, borderRadius: 1.5 }}>
                        <Typography sx={{ fontSize: '0.7rem', color: COLORS.text.secondary, mb: 0.5 }}>
                          Performance
                        </Typography>
                        <Typography sx={{ fontSize: '1.5rem', fontWeight: 700, color: COLORS.primary }}>
                          {calculatedOEE.performance}%
                        </Typography>
                        <Typography sx={{ fontSize: '0.65rem', color: COLORS.text.secondary }}>
                          (Actual Output / Ideal Output)
                        </Typography>
                      </Paper>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Paper sx={{ p: 2, textAlign: 'center', bgcolor: COLORS.background.light, borderRadius: 1.5 }}>
                        <Typography sx={{ fontSize: '0.7rem', color: COLORS.text.secondary, mb: 0.5 }}>
                          Quality
                        </Typography>
                        <Typography sx={{ fontSize: '1.5rem', fontWeight: 700, color: COLORS.primary }}>
                          {calculatedOEE.quality}%
                        </Typography>
                        <Typography sx={{ fontSize: '0.65rem', color: COLORS.text.secondary }}>
                          (Good Qty / Total Qty)
                        </Typography>
                      </Paper>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Paper sx={{ p: 2, textAlign: 'center', bgcolor: COLORS.background.light, borderRadius: 1.5 }}>
                        <Typography sx={{ fontSize: '0.7rem', color: COLORS.text.secondary, mb: 0.5 }}>
                          Total Downtime
                        </Typography>
                        <Typography sx={{ fontSize: '1.5rem', fontWeight: 700, color: COLORS.warning }}>
                          {calculatedOEE.total_downtime_min} min
                        </Typography>
                        <Typography sx={{ fontSize: '0.65rem', color: COLORS.text.secondary }}>
                          (Planned - Actual)
                        </Typography>
                      </Paper>
                    </Grid>
                  </Grid>

                  <Paper sx={{ p: 2, textAlign: 'center', bgcolor: status.color + '10', borderRadius: 1.5, border: `1px solid ${status.color}30` }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, mb: 1 }}>
                      {StatusIcon && <StatusIcon sx={{ color: status.color, fontSize: '1.5rem' }} />}
                      <Typography sx={{ fontSize: '1rem', fontWeight: 600, color: status.color }}>
                        Overall OEE: {calculatedOEE.oee}%
                      </Typography>
                    </Box>
                    <Chip 
                      label={status.label} 
                      size="small"
                      sx={{ 
                        bgcolor: status.color,
                        color: 'white',
                        fontSize: '0.7rem',
                        fontWeight: 500
                      }}
                    />
                    <Typography sx={{ fontSize: '0.7rem', color: COLORS.text.secondary, mt: 1 }}>
                      OEE = Availability × Performance × Quality
                    </Typography>
                  </Paper>
                </>
              )}
            </Paper>
          </Stack>
        );

      case 3:
        const selectedMachine = getSelectedMachine();
        const finalStatus = calculatedOEE ? getOEEStatus(calculatedOEE.oee) : null;
        const FinalStatusIcon = finalStatus?.icon;

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
                    Machine Details
                  </Typography>
                  <Grid container spacing={1}>
                    <Grid size={{ xs: 4 }}>
                      <Typography sx={{ fontSize: '0.7rem', color: COLORS.text.secondary }}>Machine:</Typography>
                    </Grid>
                    <Grid size={{ xs: 8 }}>
                      <Typography sx={{ fontSize: '0.7rem', fontWeight: 500 }}>
                        {selectedMachine?.machine_name} ({selectedMachine?.machine_code})
                      </Typography>
                    </Grid>
                    <Grid size={{ xs: 4 }}>
                      <Typography sx={{ fontSize: '0.7rem', color: COLORS.text.secondary }}>Date:</Typography>
                    </Grid>
                    <Grid size={{ xs: 8 }}>
                      <Typography sx={{ fontSize: '0.7rem', fontWeight: 500 }}>{formData.date}</Typography>
                    </Grid>
                    <Grid size={{ xs: 4 }}>
                      <Typography sx={{ fontSize: '0.7rem', color: COLORS.text.secondary }}>Shift:</Typography>
                    </Grid>
                    <Grid size={{ xs: 8 }}>
                      <Typography sx={{ fontSize: '0.7rem', fontWeight: 500 }}>{formData.shift}</Typography>
                    </Grid>
                  </Grid>
                </Paper>

                <Paper sx={{ p: 2, bgcolor: COLORS.background.light, borderRadius: 1.5 }}>
                  <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: COLORS.primary, mb: 1 }}>
                    Production Data
                  </Typography>
                  <Grid container spacing={1}>
                    <Grid size={{ xs: 6 }}>
                      <Typography sx={{ fontSize: '0.7rem', color: COLORS.text.secondary }}>Planned Time:</Typography>
                    </Grid>
                    <Grid size={{ xs: 6 }}>
                      <Typography sx={{ fontSize: '0.7rem', fontWeight: 500 }}>{formData.planned_production_time} min</Typography>
                    </Grid>
                    <Grid size={{ xs: 6 }}>
                      <Typography sx={{ fontSize: '0.7rem', color: COLORS.text.secondary }}>Actual Run Time:</Typography>
                    </Grid>
                    <Grid size={{ xs: 6 }}>
                      <Typography sx={{ fontSize: '0.7rem', fontWeight: 500 }}>{formData.actual_run_time} min</Typography>
                    </Grid>
                    <Grid size={{ xs: 6 }}>
                      <Typography sx={{ fontSize: '0.7rem', color: COLORS.text.secondary }}>Theoretical Capacity:</Typography>
                    </Grid>
                    <Grid size={{ xs: 6 }}>
                      <Typography sx={{ fontSize: '0.7rem', fontWeight: 500 }}>{formData.theoretical_capacity} units</Typography>
                    </Grid>
                    <Grid size={{ xs: 6 }}>
                      <Typography sx={{ fontSize: '0.7rem', color: COLORS.text.secondary }}>Total Quantity:</Typography>
                    </Grid>
                    <Grid size={{ xs: 6 }}>
                      <Typography sx={{ fontSize: '0.7rem', fontWeight: 500 }}>{formData.total_qty} units</Typography>
                    </Grid>
                    <Grid size={{ xs: 6 }}>
                      <Typography sx={{ fontSize: '0.7rem', color: COLORS.text.secondary }}>Good Quantity:</Typography>
                    </Grid>
                    <Grid size={{ xs: 6 }}>
                      <Typography sx={{ fontSize: '0.7rem', fontWeight: 500 }}>{formData.good_qty} units</Typography>
                    </Grid>
                    {formData.notes && (
                      <>
                        <Grid size={{ xs: 12 }}>
                          <Divider sx={{ my: 1 }} />
                        </Grid>
                        <Grid size={{ xs: 4 }}>
                          <Typography sx={{ fontSize: '0.7rem', color: COLORS.text.secondary }}>Notes:</Typography>
                        </Grid>
                        <Grid size={{ xs: 8 }}>
                          <Typography sx={{ fontSize: '0.7rem', fontWeight: 500 }}>{formData.notes}</Typography>
                        </Grid>
                      </>
                    )}
                  </Grid>
                </Paper>

                {calculatedOEE && (
                  <Paper sx={{ p: 2, bgcolor: finalStatus?.color + '10', borderRadius: 1.5, border: `1px solid ${finalStatus?.color}30` }}>
                    <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: COLORS.primary, mb: 1 }}>
                      OEE Results
                    </Typography>
                    <Grid container spacing={1}>
                      <Grid size={{ xs: 6 }}>
                        <Typography sx={{ fontSize: '0.7rem', color: COLORS.text.secondary }}>Availability:</Typography>
                      </Grid>
                      <Grid size={{ xs: 6 }}>
                        <Typography sx={{ fontSize: '0.7rem', fontWeight: 500 }}>{calculatedOEE.availability}%</Typography>
                      </Grid>
                      <Grid size={{ xs: 6 }}>
                        <Typography sx={{ fontSize: '0.7rem', color: COLORS.text.secondary }}>Performance:</Typography>
                      </Grid>
                      <Grid size={{ xs: 6 }}>
                        <Typography sx={{ fontSize: '0.7rem', fontWeight: 500 }}>{calculatedOEE.performance}%</Typography>
                      </Grid>
                      <Grid size={{ xs: 6 }}>
                        <Typography sx={{ fontSize: '0.7rem', color: COLORS.text.secondary }}>Quality:</Typography>
                      </Grid>
                      <Grid size={{ xs: 6 }}>
                        <Typography sx={{ fontSize: '0.7rem', fontWeight: 500 }}>{calculatedOEE.quality}%</Typography>
                      </Grid>
                      <Grid size={{ xs: 6 }}>
                        <Typography sx={{ fontSize: '0.7rem', color: COLORS.text.secondary }}>Overall OEE:</Typography>
                      </Grid>
                      <Grid size={{ xs: 6 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <Typography sx={{ fontSize: '0.7rem', fontWeight: 700, color: finalStatus?.color }}>
                            {calculatedOEE.oee}%
                          </Typography>
                          {FinalStatusIcon && <FinalStatusIcon sx={{ color: finalStatus?.color, fontSize: '0.8rem' }} />}
                        </Box>
                      </Grid>
                      <Grid size={{ xs: 12 }}>
                        <Chip 
                          label={finalStatus?.label}
                          size="small"
                          sx={{ 
                            mt: 0.5,
                            bgcolor: finalStatus?.color,
                            color: 'white',
                            fontSize: '0.65rem',
                            fontWeight: 500
                          }}
                        />
                      </Grid>
                    </Grid>
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
          Add OEE Record
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
              startIcon={loading ? <CircularProgress size={16} /> : <AddIcon sx={{ fontSize: '1rem' }} />}
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
              {loading ? 'Adding...' : 'Add OEE Record'}
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

export default AddOee;