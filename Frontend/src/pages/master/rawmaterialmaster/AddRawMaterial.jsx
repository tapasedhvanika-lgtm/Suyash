// import React, { useState, useEffect } from 'react';
// import {
//   Box,
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
//   Autocomplete,
//   CircularProgress,
//   InputAdornment,
//   styled,
//   Tooltip,
//   IconButton
// } from '@mui/material';
// import { 
//   Add as AddIcon,
//   NavigateNext as NavigateNextIcon,
//   NavigateBefore as NavigateBeforeIcon
// } from '@mui/icons-material';
// import axios from 'axios';
// import BASE_URL from '../../../config/Config';
// import AddMaterial from '../materialmaster/AddMaterial';

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
//   },
//   chips: {
//     active: '#9FE2BF',
//     inactive: '#F1F5F9',
//     suspended: '#FEF3C7',
//     locked: '#FEE2E2'
//   }
// };

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

// const steps = ['Basic Information', 'Rate & Cost Details'];

// // Validation helper functions
// const validateMaterialID = (value) => {
//   if (!value) {
//     return 'Material is required';
//   }
//   return '';
// };

// const validateRatePerKG = (value) => {
//   if (!value && value !== 0) {
//     return 'Rate per KG is required';
//   }
//   if (isNaN(value) || value <= 0) {
//     return 'Rate per KG must be greater than 0';
//   }
//   return '';
// };

// const validateScrapPercentage = (value) => {
//   if (!value && value !== 0) {
//     return 'Scrap percentage is required';
//   }
//   if (isNaN(value) || value < 0 || value > 100) {
//     return 'Scrap percentage must be between 0 and 100';
//   }
//   return '';
// };

// const validateTransportLossPercentage = (value) => {
//   if (!value && value !== 0) {
//     return 'Transport loss percentage is required';
//   }
//   if (isNaN(value) || value < 0 || value > 100) {
//     return 'Transport loss percentage must be between 0 and 100';
//   }
//   return '';
// };

// const validateProfileConversionRate = (value) => {
//   if (!value && value !== 0) {
//     return 'Profile conversion rate is required';
//   }
//   if (isNaN(value) || value < 0) {
//     return 'Profile conversion rate must be a positive number';
//   }
//   return '';
// };

// const validateDateEffective = (value) => {
//   if (!value) {
//     return 'Date effective is required';
//   }
//   return '';
// };

// const AddRawMaterial = ({ open, onClose, onAdd }) => {
//   const [activeStep, setActiveStep] = useState(0);
//   const [formData, setFormData] = useState({
//     MaterialID: '',
//     RatePerKG: '',
//     profile_conversion_rate: '',
//     ScrapPercentage: '',
//     TransportLossPercentage: '',
//     DateEffective: new Date().toISOString().split('T')[0],
//     Description: ''
//   });
//   const [fieldErrors, setFieldErrors] = useState({});
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState('');

//   // State for materials dropdown
//   const [materials, setMaterials] = useState([]);
//   const [loadingMaterials, setLoadingMaterials] = useState(false);
//   const [selectedMaterial, setSelectedMaterial] = useState(null);

//   // State for Add Material dialog
//   const [addMaterialOpen, setAddMaterialOpen] = useState(false);

//   // Fetch materials for dropdown using new API endpoint
//   useEffect(() => {
//     if (open) {
//       fetchMaterials();
//     }
//   }, [open]);

//   const fetchMaterials = async () => {
//     try {
//       setLoadingMaterials(true);
//       const token = localStorage.getItem('token');
//       // Updated API endpoint for materials dropdown
//       const response = await axios.get(`https://codiantsolutions.com/api/suyashtest/api/materials/dropdown`, {
//         headers: {
//           'Authorization': `Bearer ${token}`
//         }
//       });

//       if (response.data.success) {
//         setMaterials(response.data.data || []);
//       }
//     } catch (err) {
//       console.error('Error fetching materials:', err);
//     } finally {
//       setLoadingMaterials(false);
//     }
//   };

//   // Handle material added from AddMaterial dialog
//   const handleMaterialAdded = (newMaterial) => {
//     // Add the new material to the materials list
//     const formattedMaterial = {
//       _id: newMaterial._id,
//       material_id: newMaterial.material_id,
//       MaterialCode: newMaterial.MaterialCode,
//       MaterialName: newMaterial.MaterialName,
//       Density: newMaterial.Density,
//       Unit: newMaterial.Unit,
//       Grade: newMaterial.Grade,
//       EffectiveRate: newMaterial.EffectiveRate
//     };
//     setMaterials(prev => [...prev, formattedMaterial]);

//     // Auto-select the newly added material
//     setSelectedMaterial(formattedMaterial);
//     setFormData(prev => ({
//       ...prev,
//       MaterialID: formattedMaterial._id
//     }));
//   };

//   const handleChange = (e) => {
//     const { name, value } = e.target;

//     // Clear field error when user starts typing
//     setFieldErrors(prev => ({
//       ...prev,
//       [name]: ''
//     }));

//     // Handle numeric fields
//     const numericFields = ['RatePerKG', 'ScrapPercentage', 'TransportLossPercentage', 'profile_conversion_rate'];

//     if (numericFields.includes(name)) {
//       // Allow only numbers and decimal point
//       if (value === '' || /^\d*\.?\d*$/.test(value)) {
//         setFormData(prev => ({
//           ...prev,
//           [name]: value
//         }));
//       }
//     } else {
//       setFormData(prev => ({
//         ...prev,
//         [name]: value
//       }));
//     }
//   };

//   const handleMaterialChange = (event, newValue) => {
//     setSelectedMaterial(newValue);
//     setFieldErrors(prev => ({
//       ...prev,
//       MaterialID: ''
//     }));

//     if (newValue) {
//       setFormData(prev => ({
//         ...prev,
//         MaterialID: newValue._id
//       }));
//     } else {
//       setFormData(prev => ({
//         ...prev,
//         MaterialID: ''
//       }));
//     }
//   };

//   const validateField = (name, value) => {
//     switch (name) {
//       case 'MaterialID':
//         return validateMaterialID(value);
//       case 'RatePerKG':
//         return validateRatePerKG(value);
//       case 'ScrapPercentage':
//         return validateScrapPercentage(value);
//       case 'TransportLossPercentage':
//         return validateTransportLossPercentage(value);
//       case 'profile_conversion_rate':
//         return validateProfileConversionRate(value);
//       case 'DateEffective':
//         return validateDateEffective(value);
//       default:
//         return '';
//     }
//   };

//   const validateStep = (step) => {
//     const errors = {};
//     let isValid = true;

//     switch (step) {
//       case 0: // Basic Information
//         // Material ID
//         const materialIdError = validateField('MaterialID', formData.MaterialID);
//         if (materialIdError) {
//           errors.MaterialID = materialIdError;
//           isValid = false;
//         }
//         break;

//       case 1: // Rate & Cost Details
//         // Rate Per KG
//         const rateError = validateField('RatePerKG', formData.RatePerKG);
//         if (rateError) {
//           errors.RatePerKG = rateError;
//           isValid = false;
//         }

//         // Scrap Percentage
//         const scrapError = validateField('ScrapPercentage', formData.ScrapPercentage);
//         if (scrapError) {
//           errors.ScrapPercentage = scrapError;
//           isValid = false;
//         }

//         // Transport Loss Percentage
//         const transportError = validateField('TransportLossPercentage', formData.TransportLossPercentage);
//         if (transportError) {
//           errors.TransportLossPercentage = transportError;
//           isValid = false;
//         }

//         // Profile Conversion Rate
//         const profileError = validateField('profile_conversion_rate', formData.profile_conversion_rate);
//         if (profileError) {
//           errors.profile_conversion_rate = profileError;
//           isValid = false;
//         }

//         // Date Effective
//         const dateError = validateField('DateEffective', formData.DateEffective);
//         if (dateError) {
//           errors.DateEffective = dateError;
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

//   const validateAllFields = () => {
//     const errors = {};
//     let isValid = true;

//     // Required fields
//     const requiredFields = [
//       { name: 'MaterialID', label: 'Material' },
//       { name: 'RatePerKG', label: 'Rate per KG' },
//       { name: 'ScrapPercentage', label: 'Scrap percentage' },
//       { name: 'TransportLossPercentage', label: 'Transport loss percentage' },
//       { name: 'profile_conversion_rate', label: 'Profile conversion rate' },
//       { name: 'DateEffective', label: 'Date effective' }
//     ];

//     requiredFields.forEach(field => {
//       if (!formData[field.name] && formData[field.name] !== 0) {
//         errors[field.name] = `${field.label} is required`;
//         isValid = false;
//       }
//     });

//     // Validate each field with custom validations
//     if (formData.MaterialID) {
//       const error = validateField('MaterialID', formData.MaterialID);
//       if (error) errors.MaterialID = error;
//     }

//     if (formData.RatePerKG) {
//       const error = validateField('RatePerKG', formData.RatePerKG);
//       if (error) errors.RatePerKG = error;
//     }

//     if (formData.ScrapPercentage !== '') {
//       const error = validateField('ScrapPercentage', formData.ScrapPercentage);
//       if (error) errors.ScrapPercentage = error;
//     }

//     if (formData.TransportLossPercentage !== '') {
//       const error = validateField('TransportLossPercentage', formData.TransportLossPercentage);
//       if (error) errors.TransportLossPercentage = error;
//     }

//     if (formData.profile_conversion_rate !== '') {
//       const error = validateField('profile_conversion_rate', formData.profile_conversion_rate);
//       if (error) errors.profile_conversion_rate = error;
//     }

//     if (formData.DateEffective) {
//       const error = validateField('DateEffective', formData.DateEffective);
//       if (error) errors.DateEffective = error;
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
//     if (!validateAllFields()) {
//       return;
//     }

//     setLoading(true);
//     setError('');

//     try {
//       const token = localStorage.getItem('token');

//       // 🔥 Updated body with new structure
//       const requestBody = {
//         MaterialID: formData.MaterialID,
//         RatePerKG: parseFloat(formData.RatePerKG),
//         profile_conversion_rate: parseFloat(formData.profile_conversion_rate),
//         ScrapPercentage: parseFloat(formData.ScrapPercentage),
//         TransportLossPercentage: parseFloat(formData.TransportLossPercentage),
//         DateEffective: formData.DateEffective,
//         Description: formData.Description || ''
//       };

//       // Remove empty Description if not provided
//       if (!requestBody.Description) {
//         delete requestBody.Description;
//       }

//       const response = await axios.post(`${BASE_URL}/api/raw-materials`, requestBody, {
//         headers: {
//           'Authorization': `Bearer ${token}`,
//           'Content-Type': 'application/json'
//         }
//       });

//       if (response.data.success) {
//         onAdd(response.data.data);
//         resetForm();
//         onClose();
//       } else {
//         setError(response.data.message || 'Failed to add raw material');
//       }
//     } catch (err) {
//       console.error('Error adding raw material:', err);
//       setError(err.response?.data?.message || 'Failed to add raw material. Please try again.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const resetForm = () => {
//     setFormData({
//       MaterialID: '',
//       RatePerKG: '',
//       profile_conversion_rate: '',
//       ScrapPercentage: '',
//       TransportLossPercentage: '',
//       DateEffective: new Date().toISOString().split('T')[0],
//       Description: ''
//     });
//     setFieldErrors({});
//     setSelectedMaterial(null);
//     setActiveStep(0);
//     setError('');
//   };

//   const handleClose = () => {
//     resetForm();
//     onClose();
//   };

//   // Label component for consistency
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

//   const renderStepContent = (step) => {
//     switch (step) {
//       case 0: // Basic Information
//         return (
//           <Stack spacing={2}>
//             <Box>
//               <Typography variant="subtitle2" sx={{ color: COLORS.primary, mb: 1.5, fontWeight: 600, fontSize: '0.9rem' }}>
//                 Material Selection
//               </Typography>

//               <Grid container spacing={1.5}>
//                 <Grid size={{ xs: 12 }}>
//                   <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//                     <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
//                       <Label required>SELECT MATERIAL</Label>
//                       <Tooltip title="Add New Material">
//                         <IconButton
//                           size="small"
//                           onClick={() => setAddMaterialOpen(true)}
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
//                       options={materials}
//                       loading={loadingMaterials}
//                       value={selectedMaterial}
//                       onChange={handleMaterialChange}
//                       getOptionLabel={(option) => 
//                         `${option.MaterialName}${option.Grade ? ` - ${option.Grade}` : ''}${option.MaterialCode ? ` (${option.MaterialCode})` : ''}`
//                       }
//                       isOptionEqualToValue={(option, value) => option._id === value._id}
//                       renderInput={(params) => (
//                         <TextField
//                           {...params}
//                           size="small"
//                           placeholder="Select material"
//                           required
//                           error={!!fieldErrors.MaterialID}
//                           helperText={fieldErrors.MaterialID}
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
//                               fontSize: '0.75rem',
//                               color: COLORS.text.primary,
//                               '&::placeholder': {
//                                 color: COLORS.text.tertiary,
//                                 fontSize: '0.75rem'
//                               }
//                             },
//                             '& .MuiFormHelperText-root': {
//                               fontSize: '0.65rem', marginLeft: 0, marginTop: 0.25
//                             }
//                           }}
//                           InputProps={{
//                             ...params.InputProps,
//                             endAdornment: (
//                               <>
//                                 {loadingMaterials ? <CircularProgress color="inherit" size={16} /> : null}
//                                 {params.InputProps.endAdornment}
//                               </>
//                             ),
//                           }}
//                         />
//                       )}
//                       renderOption={(props, option) => (
//                         <li {...props}>
//                           <Box>
//                             <Typography variant="body2" fontWeight={500} sx={{ fontSize: '0.75rem' }}>
//                               {option.MaterialName}
//                             </Typography>
//                             <Typography variant="caption" sx={{ fontSize: '0.7rem', color: COLORS.text.tertiary }}>
//                               {option.MaterialCode} {option.Grade && `| Grade: ${option.Grade}`}
//                               {option.Density && ` | Density: ${option.Density} ${option.Unit || ''}`}
//                             </Typography>
//                           </Box>
//                         </li>
//                       )}
//                       ListboxProps={{
//                         sx: {
//                           '& .MuiAutocomplete-option': {
//                             fontSize: '0.75rem', py: 1, px: 1.5
//                           }
//                         }
//                       }}
//                     />
//                     {!loadingMaterials && materials.length === 0 && (
//                       <Typography sx={{ fontSize: '0.65rem', color: '#EF4444', mt: 0.5 }}>
//                         No materials available. Please click the + button to add a material first.
//                       </Typography>
//                     )}
//                   </Box>
//                 </Grid>

//                 <Grid size={{ xs: 12 }}>
//                   <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//                     <Label>DESCRIPTION</Label>
//                     <TextField
//                       fullWidth
//                       size="small"
//                       name="Description"
//                       value={formData.Description}
//                       onChange={handleChange}
//                       multiline
//                       rows={2}
//                       disabled={loading}
//                       placeholder="e.g., Q2 2025 rate"
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
//                           fontSize: '0.75rem',
//                           color: COLORS.text.primary,
//                           '&::placeholder': {
//                             color: COLORS.text.tertiary,
//                             fontSize: '0.75rem'
//                           }
//                         }
//                       }}
//                     />
//                     <Typography sx={{ fontSize: '0.65rem', color: COLORS.text.tertiary }}>
//                       Optional - Add any notes about this rate
//                     </Typography>
//                   </Box>
//                 </Grid>
//               </Grid>
//             </Box>

//             {/* Material Info Summary */}
//             {selectedMaterial && (
//               <Box sx={{ mt: 1, p: 1.5, bgcolor: COLORS.background.light, borderRadius: 1.5 }}>
//                 <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.primary, mb: 0.5 }}>
//                   Selected Material Details
//                 </Typography>
//                 <Grid container spacing={1}>
//                   <Grid size={{ xs: 6 }}>
//                     <Typography sx={{ fontSize: '0.65rem', color: COLORS.text.secondary }}>Material Code:</Typography>
//                   </Grid>
//                   <Grid size={{ xs: 6 }}>
//                     <Typography sx={{ fontSize: '0.65rem', fontWeight: 500, color: COLORS.text.primary }}>
//                       {selectedMaterial.MaterialCode || '-'}
//                     </Typography>
//                   </Grid>
//                   <Grid size={{ xs: 6 }}>
//                     <Typography sx={{ fontSize: '0.65rem', color: COLORS.text.secondary }}>Grade:</Typography>
//                   </Grid>
//                   <Grid size={{ xs: 6 }}>
//                     <Typography sx={{ fontSize: '0.65rem', fontWeight: 500, color: COLORS.text.primary }}>
//                       {selectedMaterial.Grade || '-'}
//                     </Typography>
//                   </Grid>
//                   {selectedMaterial.Density && (
//                     <>
//                       <Grid size={{ xs: 6 }}>
//                         <Typography sx={{ fontSize: '0.65rem', color: COLORS.text.secondary }}>Density:</Typography>
//                       </Grid>
//                       <Grid size={{ xs: 6 }}>
//                         <Typography sx={{ fontSize: '0.65rem', fontWeight: 500, color: COLORS.text.primary }}>
//                           {selectedMaterial.Density} {selectedMaterial.Unit || ''}
//                         </Typography>
//                       </Grid>
//                     </>
//                   )}
//                 </Grid>
//               </Box>
//             )}
//           </Stack>
//         );

//       case 1: // Rate & Cost Details
//         return (
//           <Stack spacing={2}>
//             <Box>
//               <Typography variant="subtitle2" sx={{ color: COLORS.primary, mb: 1.5, fontWeight: 600, fontSize: '0.9rem' }}>
//                 Rate Details
//               </Typography>

//               <Grid container spacing={1.5}>
//                 <Grid size={{ xs: 12, md: 6 }}>
//                   <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//                     <Label required>RATE PER KG</Label>
//                     <TextField
//                       fullWidth
//                       size="small"
//                       name="RatePerKG"
//                       value={formData.RatePerKG}
//                       onChange={handleChange}
//                       required
//                       disabled={loading}
//                       placeholder="0.00"
//                       error={!!fieldErrors.RatePerKG}
//                       helperText={fieldErrors.RatePerKG}
//                       InputProps={{
//                         startAdornment: (
//                           <Typography sx={{ fontSize: '0.7rem', color: COLORS.text.secondary, mr: 0.5 }}>
//                             ₹
//                           </Typography>
//                         ),
//                       }}
//                       inputProps={{ 
//                         step: "0.01", 
//                         min: 0,
//                         onWheel: (e) => e.target.blur()
//                       }}
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
//                           fontSize: '0.75rem',
//                           color: COLORS.text.primary,
//                           '&::placeholder': {
//                             color: COLORS.text.tertiary,
//                             fontSize: '0.75rem'
//                           }
//                         },
//                         '& .MuiFormHelperText-root': {
//                           fontSize: '0.65rem', marginLeft: 0, marginTop: 0.25
//                         },
//                         '& input[type=number]': {
//                           MozAppearance: 'textfield'
//                         },
//                         '& input[type=number]::-webkit-outer-spin-button, & input[type=number]::-webkit-inner-spin-button': {
//                           WebkitAppearance: 'none', margin: 0
//                         }
//                       }}
//                     />
//                   </Box>
//                 </Grid>
//                 <Grid size={{ xs: 12, md: 6 }}>
//                   <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//                     <Label required>PROFILE CONVERSION RATE</Label>
//                     <TextField
//                       fullWidth
//                       size="small"
//                       name="profile_conversion_rate"
//                       value={formData.profile_conversion_rate}
//                       onChange={handleChange}
//                       required
//                       disabled={loading}
//                       placeholder="0.00"
//                       error={!!fieldErrors.profile_conversion_rate}
//                       helperText={fieldErrors.profile_conversion_rate}
//                       InputProps={{
//                         startAdornment: (
//                           <Typography sx={{ fontSize: '0.7rem', color: COLORS.text.secondary, mr: 0.5 }}>
//                             ₹
//                           </Typography>
//                         ),
//                       }}
//                       inputProps={{ 
//                         step: "0.01", 
//                         min: 0,
//                         onWheel: (e) => e.target.blur()
//                       }}
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
//                           fontSize: '0.75rem',
//                           color: COLORS.text.primary,
//                           '&::placeholder': {
//                             color: COLORS.text.tertiary,
//                             fontSize: '0.75rem'
//                           }
//                         },
//                         '& .MuiFormHelperText-root': {
//                           fontSize: '0.65rem', marginLeft: 0, marginTop: 0.25
//                         },
//                         '& input[type=number]': {
//                           MozAppearance: 'textfield'
//                         },
//                         '& input[type=number]::-webkit-outer-spin-button, & input[type=number]::-webkit-inner-spin-button': {
//                           WebkitAppearance: 'none', margin: 0
//                         }
//                       }}
//                     />
//                   </Box>
//                 </Grid>
//               </Grid>
//             </Box>

//             <Box>
//               <Typography variant="subtitle2" sx={{ color: COLORS.primary, mb: 1.5, fontWeight: 600, fontSize: '0.9rem' }}>
//                 Loss Percentages
//               </Typography>

//               <Grid container spacing={1.5}>
//                 <Grid size={{ xs: 12, md: 6 }}>
//                   <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//                     <Label required>SCRAP PERCENTAGE</Label>
//                     <TextField
//                       fullWidth
//                       size="small"
//                       name="ScrapPercentage"
//                       value={formData.ScrapPercentage}
//                       onChange={handleChange}
//                       required
//                       disabled={loading}
//                       placeholder="0"
//                       error={!!fieldErrors.ScrapPercentage}
//                       helperText={fieldErrors.ScrapPercentage}
//                       InputProps={{
//                         endAdornment: (
//                           <Typography sx={{ fontSize: '0.7rem', color: COLORS.text.secondary, ml: 0.5 }}>
//                             %
//                           </Typography>
//                         ),
//                       }}
//                       inputProps={{ 
//                         step: "0.1", 
//                         min: 0,
//                         max: 100,
//                         onWheel: (e) => e.target.blur()
//                       }}
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
//                           fontSize: '0.75rem',
//                           color: COLORS.text.primary,
//                           '&::placeholder': {
//                             color: COLORS.text.tertiary,
//                             fontSize: '0.75rem'
//                           }
//                         },
//                         '& .MuiFormHelperText-root': {
//                           fontSize: '0.65rem', marginLeft: 0, marginTop: 0.25
//                         },
//                         '& input[type=number]': {
//                           MozAppearance: 'textfield'
//                         },
//                         '& input[type=number]::-webkit-outer-spin-button, & input[type=number]::-webkit-inner-spin-button': {
//                           WebkitAppearance: 'none', margin: 0
//                         }
//                       }}
//                     />
//                   </Box>
//                 </Grid>
//                 <Grid size={{ xs: 12, md: 6 }}>
//                   <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//                     <Label required>TRANSPORT LOSS %</Label>
//                     <TextField
//                       fullWidth
//                       size="small"
//                       name="TransportLossPercentage"
//                       value={formData.TransportLossPercentage}
//                       onChange={handleChange}
//                       required
//                       disabled={loading}
//                       placeholder="0"
//                       error={!!fieldErrors.TransportLossPercentage}
//                       helperText={fieldErrors.TransportLossPercentage}
//                       InputProps={{
//                         endAdornment: (
//                           <Typography sx={{ fontSize: '0.7rem', color: COLORS.text.secondary, ml: 0.5 }}>
//                             %
//                           </Typography>
//                         ),
//                       }}
//                       inputProps={{ 
//                         step: "0.1", 
//                         min: 0,
//                         max: 100,
//                         onWheel: (e) => e.target.blur()
//                       }}
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
//                           fontSize: '0.75rem',
//                           color: COLORS.text.primary,
//                           '&::placeholder': {
//                             color: COLORS.text.tertiary,
//                             fontSize: '0.75rem'
//                           }
//                         },
//                         '& .MuiFormHelperText-root': {
//                           fontSize: '0.65rem', marginLeft: 0, marginTop: 0.25
//                         },
//                         '& input[type=number]': {
//                           MozAppearance: 'textfield'
//                         },
//                         '& input[type=number]::-webkit-outer-spin-button, & input[type=number]::-webkit-inner-spin-button': {
//                           WebkitAppearance: 'none', margin: 0
//                         }
//                       }}
//                     />
//                   </Box>
//                 </Grid>
//               </Grid>
//             </Box>

//             <Box>
//               <Typography variant="subtitle2" sx={{ color: COLORS.primary, mb: 1.5, fontWeight: 600, fontSize: '0.9rem' }}>
//                 Validity & Status
//               </Typography>

//               <Grid container spacing={1.5}>
//                 <Grid size={{ xs: 12, md: 6 }}>
//                   <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//                     <Label required>DATE EFFECTIVE</Label>
//                     <TextField
//                       fullWidth
//                       size="small"
//                       name="DateEffective"
//                       type="date"
//                       value={formData.DateEffective}
//                       onChange={handleChange}
//                       required
//                       disabled={loading}
//                       error={!!fieldErrors.DateEffective}
//                       helperText={fieldErrors.DateEffective}
//                       InputLabelProps={{
//                         shrink: true,
//                       }}
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
//                           fontSize: '0.75rem',
//                           color: COLORS.text.primary
//                         },
//                         '& .MuiFormHelperText-root': {
//                           fontSize: '0.65rem', marginLeft: 0, marginTop: 0.25
//                         }
//                       }}
//                     />
//                   </Box>
//                 </Grid>
//               </Grid>
//             </Box>
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
//           mb: 1,
//           bgcolor: COLORS.background.white,
//           display: 'flex',
//           flexDirection: 'column',
//           gap: 1
//         }}>
//           <Typography
//             sx={{
//               fontSize: '1.2rem',
//               fontWeight: 700,
//               color: COLORS.text.primary
//             }}
//           >
//             Add Raw Material
//           </Typography>

//           {/* 🔥 Modern Stepper with Gradient Connector */}
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
//                 '& .MuiAlert-icon': {
//                   fontSize: '1.25rem',
//                   alignItems: 'center'
//                 },
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
//               },
//               '&:disabled': {
//                 borderColor: COLORS.border,
//                 color: COLORS.text.tertiary
//               }
//             }}
//           >
//             Back
//           </Button>
//           <Box sx={{ display: 'flex', gap: 1 }}>
//             <Button
//               onClick={handleClose}
//               disabled={loading}
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
//                 disabled={loading || !formData.MaterialID || !formData.RatePerKG}
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
//                   '&:hover': {
//                     bgcolor: COLORS.primaryDark,
//                   },
//                   '&:disabled': {
//                     bgcolor: COLORS.border,
//                     color: COLORS.text.tertiary
//                   }
//                 }}
//               >
//                 {loading ? 'Adding...' : 'Add Material'}
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
//                   },
//                   '&:disabled': {
//                     bgcolor: COLORS.border,
//                     color: COLORS.text.tertiary
//                   }
//                 }}
//               >
//                 Next
//               </Button>
//             )}
//           </Box>
//         </DialogActions>
//       </Dialog>

//       {/* Add Material Dialog */}
//       <AddMaterial
//         open={addMaterialOpen}
//         onClose={() => setAddMaterialOpen(false)}
//         onAdd={handleMaterialAdded}
//       />
//     </>
//   );
// };

// export default AddRawMaterial;


import React, { useState, useEffect } from 'react';
import {
  Box,
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
  Autocomplete,
  CircularProgress,
  InputAdornment,
  styled,
  Tooltip,
  IconButton,
  Divider,
  FormControl,
  Select,
  MenuItem
} from '@mui/material';
import {
  Add as AddIcon,
  NavigateNext as NavigateNextIcon,
  NavigateBefore as NavigateBeforeIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import axios from 'axios';
import BASE_URL from '../../../config/Config';

// Color constants matching other components
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
  },
  chips: {
    active: '#9FE2BF',
    inactive: '#F1F5F9',
    suspended: '#FEF3C7',
    locked: '#FEE2E2'
  }
};

// Modern Stepper Connector with Gradient
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

const steps = ['Basic Information', 'Rate & Cost Details'];

// Material unit options for inline form
const materialUnitOptions = ['Kg', 'Gram', 'Ton'];

// ============================================
// VALIDATION FUNCTIONS FOR MATERIAL FORM
// ============================================
const validateMaterialCode = (value) => {
  if (!value?.trim()) return 'Material code is required';
  if (value.length > 50) return 'Material code should not exceed 50 characters';
  return '';
};

const validateMaterialName = (value) => {
  if (!value?.trim()) return 'Material name is required';
  if (value.length > 100) return 'Material name should not exceed 100 characters';
  return '';
};

const validateMaterialDensity = (value) => {
  if (value && (isNaN(value) || parseFloat(value) <= 0)) return 'Density must be a positive number';
  return '';
};

const validateMaterialEffectiveRate = (value) => {
  if (value && (isNaN(value) || parseFloat(value) <= 0)) return 'Effective rate must be a positive number';
  return '';
};

// ============================================
// MAIN COMPONENT
// ============================================
const AddRawMaterial = ({ open, onClose, onAdd }) => {
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState({
    MaterialID: '',
    RatePerKG: '',
    profile_conversion_rate: '',
    ScrapPercentage: '',
    TransportLossPercentage: '',
    DateEffective: new Date().toISOString().split('T')[0],
    Description: '',
    Remark: ''
  });
  const [fieldErrors, setFieldErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // State for materials dropdown
  const [materials, setMaterials] = useState([]);
  const [loadingMaterials, setLoadingMaterials] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState(null);

  // State for inline Add Material form
  const [showAddMaterialForm, setShowAddMaterialForm] = useState(false);
  const [materialFormData, setMaterialFormData] = useState({
    MaterialCode: '',
    MaterialName: '',
    Density: '',
    Unit: 'Kg',
    Grade: '',
    EffectiveRate: ''
  });
  const [materialFieldErrors, setMaterialFieldErrors] = useState({});
  const [materialTouched, setMaterialTouched] = useState({});
  const [addMaterialLoading, setAddMaterialLoading] = useState(false);
  const [addMaterialError, setAddMaterialError] = useState('');

  // Fetch materials for dropdown
  useEffect(() => {
    if (open) {
      fetchMaterials();
    }
  }, [open]);

  const fetchMaterials = async () => {
    try {
      setLoadingMaterials(true);
      const token = localStorage.getItem('token');
      // Use the same endpoint as AddItem - /api/materials
      const response = await axios.get(`${BASE_URL}/api/materials`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.data.success) {
        // Filter active materials and format
        const activeMaterials = (response.data.data || [])
          .filter(material => material.IsActive !== false)
          .map(material => ({
            _id: material._id,
            material_id: material.material_id,
            MaterialCode: material.MaterialCode || '',
            MaterialName: material.MaterialName || '',
            MaterialNameWithCode: `${material.MaterialName || ''}${material.MaterialCode ? ` (${material.MaterialCode})` : ''}`,
            Density: material.Density || '',
            Unit: material.Unit || '',
            Grade: material.Grade || '',
            EffectiveRate: material.EffectiveRate || ''
          }));
        setMaterials(activeMaterials);
      } else {
        console.warn('Materials API returned success: false', response.data);
        setMaterials([]);
      }
    } catch (err) {
      console.error('Error fetching materials:', err);
      setMaterials([]);
    } finally {
      setLoadingMaterials(false);
    }
  };

  // ============================================
  // INLINE MATERIAL FORM HANDLERS
  // ============================================
  const handleMaterialFormChange = (e) => {
    const { name, value } = e.target;

    setMaterialFieldErrors(prev => ({
      ...prev,
      [name]: ''
    }));

    const numericFields = ['Density', 'EffectiveRate'];
    if (numericFields.includes(name)) {
      if (value === '' || /^\d*\.?\d*$/.test(value)) {
        setMaterialFormData(prev => ({
          ...prev,
          [name]: value
        }));
      }
    } else {
      setMaterialFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }

    if (materialTouched[name] || value) {
      const errorMessage = validateMaterialField(name, value);
      setMaterialFieldErrors(prev => ({
        ...prev,
        [name]: errorMessage
      }));
    }
  };

  const handleMaterialBlur = (e) => {
    const { name, value } = e.target;
    setMaterialTouched(prev => ({
      ...prev,
      [name]: true
    }));
    const errorMessage = validateMaterialField(name, value);
    setMaterialFieldErrors(prev => ({
      ...prev,
      [name]: errorMessage
    }));
  };

  const validateMaterialField = (name, value) => {
    switch (name) {
      case 'MaterialCode':
        return validateMaterialCode(value);
      case 'MaterialName':
        return validateMaterialName(value);
      case 'Density':
        return validateMaterialDensity(value);
      case 'EffectiveRate':
        return validateMaterialEffectiveRate(value);
      default:
        return '';
    }
  };

  const validateMaterialForm = () => {
    const errors = {};
    let isValid = true;

    if (!materialFormData.MaterialCode?.trim()) {
      errors.MaterialCode = 'Material code is required';
      isValid = false;
    } else {
      const error = validateMaterialField('MaterialCode', materialFormData.MaterialCode);
      if (error) { errors.MaterialCode = error; isValid = false; }
    }

    if (!materialFormData.MaterialName?.trim()) {
      errors.MaterialName = 'Material name is required';
      isValid = false;
    } else {
      const error = validateMaterialField('MaterialName', materialFormData.MaterialName);
      if (error) { errors.MaterialName = error; isValid = false; }
    }

    if (materialFormData.Density) {
      const error = validateMaterialField('Density', materialFormData.Density);
      if (error) { errors.Density = error; isValid = false; }
    }

    if (materialFormData.EffectiveRate) {
      const error = validateMaterialField('EffectiveRate', materialFormData.EffectiveRate);
      if (error) { errors.EffectiveRate = error; isValid = false; }
    }

    setMaterialFieldErrors(errors);
    if (!isValid) {
      setAddMaterialError('Please fix the errors above');
    }
    return isValid;
  };

  const handleAddMaterialSubmit = async () => {
    if (!validateMaterialForm()) return;

    setAddMaterialLoading(true);
    setAddMaterialError('');

    try {
      const token = localStorage.getItem('token');

      const requestBody = {
        MaterialCode: materialFormData.MaterialCode,
        MaterialName: materialFormData.MaterialName,
        Density: materialFormData.Density ? parseFloat(materialFormData.Density) : null,
        Unit: materialFormData.Unit,
        Grade: materialFormData.Grade || undefined,
        EffectiveRate: materialFormData.EffectiveRate ? parseFloat(materialFormData.EffectiveRate) : null
      };

      // Remove null/empty values
      Object.keys(requestBody).forEach(key => {
        if (requestBody[key] === null || requestBody[key] === '' || requestBody[key] === undefined) {
          delete requestBody[key];
        }
      });

      const response = await axios.post(`${BASE_URL}/api/materials`, requestBody, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.data.success) {
        const newMaterial = response.data.data;

        // Format the new material
        const formattedMaterial = {
          _id: newMaterial._id,
          material_id: newMaterial.material_id,
          MaterialCode: newMaterial.MaterialCode || '',
          MaterialName: newMaterial.MaterialName || '',
          MaterialNameWithCode: `${newMaterial.MaterialName || ''}${newMaterial.MaterialCode ? ` (${newMaterial.MaterialCode})` : ''}`,
          Density: newMaterial.Density || '',
          Unit: newMaterial.Unit || '',
          Grade: newMaterial.Grade || '',
          EffectiveRate: newMaterial.EffectiveRate || ''
        };

        // Add to materials list
        setMaterials(prev => [...prev, formattedMaterial]);

        // Auto-select the newly added material
        setSelectedMaterial(formattedMaterial);
        setFormData(prev => ({
          ...prev,
          MaterialID: formattedMaterial._id
        }));

        // Clear errors
        setFieldErrors(prev => ({
          ...prev,
          MaterialID: ''
        }));

        // Hide inline form
        setShowAddMaterialForm(false);

        // Reset material form
        setMaterialFormData({
          MaterialCode: '',
          MaterialName: '',
          Density: '',
          Unit: 'Kg',
          Grade: '',
          EffectiveRate: ''
        });
        setMaterialFieldErrors({});
        setMaterialTouched({});
        setAddMaterialError('');
      } else {
        setAddMaterialError(response.data.message || 'Failed to add material');
      }
    } catch (err) {
      console.error('Error adding material:', err);
      setAddMaterialError(err.response?.data?.message || 'Failed to add material. Please try again.');
    } finally {
      setAddMaterialLoading(false);
    }
  };

  // ============================================
  // MAIN FORM HANDLERS
  // ============================================
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFieldErrors(prev => ({
      ...prev,
      [name]: ''
    }));

    const numericFields = ['RatePerKG', 'ScrapPercentage', 'TransportLossPercentage', 'profile_conversion_rate'];

    if (numericFields.includes(name)) {
      if (value === '' || /^\d*\.?\d*$/.test(value)) {
        setFormData(prev => ({
          ...prev,
          [name]: value
        }));
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleMaterialChange = (event, newValue) => {
    setSelectedMaterial(newValue);
    setFieldErrors(prev => ({
      ...prev,
      MaterialID: ''
    }));

    if (newValue) {
      setFormData(prev => ({
        ...prev,
        MaterialID: newValue._id
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        MaterialID: ''
      }));
    }
  };

  // ============================================
  // VALIDATION FUNCTIONS FOR MAIN FORM
  // ============================================
  const validateField = (name, value) => {
    switch (name) {
      case 'MaterialID':
        if (!value) return 'Material is required';
        return '';
      case 'RatePerKG':
        if (!value && value !== 0) return 'Rate per KG is required';
        if (isNaN(value) || value <= 0) return 'Rate per KG must be greater than 0';
        return '';
      case 'ScrapPercentage':
        if (!value && value !== 0) return 'Scrap percentage is required';
        if (isNaN(value) || value < 0 || value > 100) return 'Scrap percentage must be between 0 and 100';
        return '';
      case 'TransportLossPercentage':
        if (!value && value !== 0) return 'Transport loss percentage is required';
        if (isNaN(value) || value < 0 || value > 100) return 'Transport loss percentage must be between 0 and 100';
        return '';
      case 'profile_conversion_rate':
        if (!value && value !== 0) return 'Profile conversion rate is required';
        if (isNaN(value) || value < 0) return 'Profile conversion rate must be a positive number';
        return '';
      case 'DateEffective':
        if (!value) return 'Date effective is required';
        return '';
      default:
        return '';
    }
  };

  const validateStep = (step) => {
    const errors = {};
    let isValid = true;

    switch (step) {
      case 0:
        const materialIdError = validateField('MaterialID', formData.MaterialID);
        if (materialIdError) {
          errors.MaterialID = materialIdError;
          isValid = false;
        }
        break;
      case 1:
        const rateError = validateField('RatePerKG', formData.RatePerKG);
        if (rateError) { errors.RatePerKG = rateError; isValid = false; }

        const scrapError = validateField('ScrapPercentage', formData.ScrapPercentage);
        if (scrapError) { errors.ScrapPercentage = scrapError; isValid = false; }

        const transportError = validateField('TransportLossPercentage', formData.TransportLossPercentage);
        if (transportError) { errors.TransportLossPercentage = transportError; isValid = false; }

        const profileError = validateField('profile_conversion_rate', formData.profile_conversion_rate);
        if (profileError) { errors.profile_conversion_rate = profileError; isValid = false; }

        const dateError = validateField('DateEffective', formData.DateEffective);
        if (dateError) { errors.DateEffective = dateError; isValid = false; }
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

  const validateAllFields = () => {
    const errors = {};
    let isValid = true;

    const requiredFields = [
      { name: 'MaterialID', label: 'Material' },
      { name: 'RatePerKG', label: 'Rate per KG' },
      { name: 'ScrapPercentage', label: 'Scrap percentage' },
      { name: 'TransportLossPercentage', label: 'Transport loss percentage' },
      { name: 'profile_conversion_rate', label: 'Profile conversion rate' },
      { name: 'DateEffective', label: 'Date effective' }
    ];

    requiredFields.forEach(field => {
      if (!formData[field.name] && formData[field.name] !== 0) {
        errors[field.name] = `${field.label} is required`;
        isValid = false;
      }
    });

    if (formData.MaterialID) {
      const error = validateField('MaterialID', formData.MaterialID);
      if (error) errors.MaterialID = error;
    }
    if (formData.RatePerKG) {
      const error = validateField('RatePerKG', formData.RatePerKG);
      if (error) errors.RatePerKG = error;
    }
    if (formData.ScrapPercentage !== '') {
      const error = validateField('ScrapPercentage', formData.ScrapPercentage);
      if (error) errors.ScrapPercentage = error;
    }
    if (formData.TransportLossPercentage !== '') {
      const error = validateField('TransportLossPercentage', formData.TransportLossPercentage);
      if (error) errors.TransportLossPercentage = error;
    }
    if (formData.profile_conversion_rate !== '') {
      const error = validateField('profile_conversion_rate', formData.profile_conversion_rate);
      if (error) errors.profile_conversion_rate = error;
    }
    if (formData.DateEffective) {
      const error = validateField('DateEffective', formData.DateEffective);
      if (error) errors.DateEffective = error;
    }

    setFieldErrors(errors);
    if (!isValid) {
      setError('Please fix all validation errors');
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
    if (!validateAllFields()) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');

      const requestBody = {
        MaterialID: formData.MaterialID,
        RatePerKG: parseFloat(formData.RatePerKG),
        profile_conversion_rate: parseFloat(formData.profile_conversion_rate),
        ScrapPercentage: parseFloat(formData.ScrapPercentage),
        TransportLossPercentage: parseFloat(formData.TransportLossPercentage),
        DateEffective: formData.DateEffective,
        Description: formData.Description || '',
        Remark: formData.Remark || ''
      };

      if (!requestBody.Description) {
        delete requestBody.Description;
      }

      if (!requestBody.Remark) {
        delete requestBody.Remark;
      }

      const response = await axios.post(`${BASE_URL}/api/raw-materials`, requestBody, {
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
        setError(response.data.message || 'Failed to add raw material');
      }
    } catch (err) {
      console.error('Error adding raw material:', err);
      setError(err.response?.data?.message || 'Failed to add raw material. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      MaterialID: '',
      RatePerKG: '',
      profile_conversion_rate: '',
      ScrapPercentage: '',
      TransportLossPercentage: '',
      DateEffective: new Date().toISOString().split('T')[0],
      Description: '',
      Remark: ''
    });
    setFieldErrors({});
    setSelectedMaterial(null);
    setActiveStep(0);
    setError('');
    setShowAddMaterialForm(false);
    setMaterialFormData({
      MaterialCode: '',
      MaterialName: '',
      Density: '',
      Unit: 'Kg',
      Grade: '',
      EffectiveRate: ''
    });
    setMaterialFieldErrors({});
    setMaterialTouched({});
    setAddMaterialError('');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  // Shared TextField styles
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

  const numberFieldSx = {
    ...textFieldSx,
    '& input[type=number]': { MozAppearance: 'textfield' },
    '& input[type=number]::-webkit-outer-spin-button, & input[type=number]::-webkit-inner-spin-button': {
      WebkitAppearance: 'none',
      margin: 0
    }
  };

  const selectSx = {
    borderRadius: 1.5,
    fontSize: '0.75rem',
    '& .MuiSelect-select': { py: 1, px: 1.5, fontSize: '0.75rem' }
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

  // ============================================
  // RENDER STEP CONTENT
  // ============================================
  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Stack spacing={2}>
            <Box>
              <Typography variant="subtitle2" sx={{ color: COLORS.primary, mb: 1.5, fontWeight: 600, fontSize: '0.9rem' }}>
                Material Selection
              </Typography>

              <Grid container spacing={1.5}>
                <Grid size={{ xs: 12 }}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                    {/* Label now stands alone */}
                    <Label required>SELECT MATERIAL</Label>

                    {/* Flex row: Autocomplete + Add New button */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Autocomplete
                        fullWidth
                        options={materials}
                        loading={loadingMaterials}
                        value={selectedMaterial}
                        onChange={handleMaterialChange}
                        getOptionLabel={(option) =>
                          option.MaterialNameWithCode || option.MaterialName || ''
                        }
                        isOptionEqualToValue={(option, value) => option._id === value._id}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            size="small"
                            placeholder={loadingMaterials ? 'Loading materials...' : 'Search or select a material'}
                            required
                            error={!!fieldErrors.MaterialID}
                            helperText={fieldErrors.MaterialID}
                            sx={textFieldSx}
                            InputProps={{
                              ...params.InputProps,
                              endAdornment: (
                                <>
                                  {loadingMaterials ? <CircularProgress color="inherit" size={16} /> : null}
                                  {params.InputProps.endAdornment}
                                </>
                              ),
                            }}
                          />
                        )}
                        renderOption={(props, option) => (
                          <li {...props}>
                            <Box>
                              <Typography variant="body2" fontWeight={500} sx={{ fontSize: '0.75rem' }}>
                                {option.MaterialName}
                                {option.MaterialCode && ` (${option.MaterialCode})`}
                              </Typography>
                              <Typography variant="caption" sx={{ fontSize: '0.7rem', color: COLORS.text.tertiary }}>
                                Grade: {option.Grade || 'N/A'} | Density: {option.Density || 'N/A'} {option.Unit || ''}
                                {option.EffectiveRate && ` | Rate: ₹${option.EffectiveRate}`}
                              </Typography>
                            </Box>
                          </li>
                        )}
                        noOptionsText={loadingMaterials ? 'Loading...' : 'No materials found'}
                        sx={{ flex: 1 }}
                      />

                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => setShowAddMaterialForm(!showAddMaterialForm)}
                        disabled={loading}
                        startIcon={showAddMaterialForm ? <CloseIcon sx={{ fontSize: '0.875rem' }} /> : <AddIcon sx={{ fontSize: '0.875rem' }} />}
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
                          '&:hover': {
                            borderColor: COLORS.primary,
                            bgcolor: `${COLORS.primary}10`,
                            color: COLORS.primary
                          }
                        }}
                      >
                        {showAddMaterialForm ? 'Cancel' : 'Add New'}
                      </Button>
                    </Box>

                    <Typography sx={{ fontSize: '0.65rem', color: COLORS.text.tertiary }}>
                      Select an existing material or click "Add New" to create one
                    </Typography>
                  </Box>
                </Grid>

                {/* Inline Add Material Form */}
                {showAddMaterialForm && (
                  <Grid size={{ xs: 12 }}>
                    <Box sx={{ mt: 1, p: 2.5, bgcolor: COLORS.background.light, borderRadius: 2, border: `1px solid ${COLORS.primary}` }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color: COLORS.primary }}>
                          Add New Material
                        </Typography>
                        <IconButton
                          size="small"
                          onClick={() => {
                            setShowAddMaterialForm(false);
                            setAddMaterialError('');
                            setMaterialFormData({
                              MaterialCode: '',
                              MaterialName: '',
                              Density: '',
                              Unit: 'Kg',
                              Grade: '',
                              EffectiveRate: ''
                            });
                            setMaterialFieldErrors({});
                            setMaterialTouched({});
                          }}
                          sx={{
                            color: COLORS.text.tertiary,
                            '&:hover': { color: COLORS.primary }
                          }}
                        >
                          <CloseIcon sx={{ fontSize: '1rem' }} />
                        </IconButton>
                      </Box>

                      <Grid container spacing={1.5}>
                        <Grid size={{ xs: 12, sm: 6 }}>
                          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                            <Label required>MATERIAL CODE</Label>
                            <TextField
                              fullWidth
                              size="small"
                              name="MaterialCode"
                              value={materialFormData.MaterialCode}
                              onChange={handleMaterialFormChange}
                              onBlur={handleMaterialBlur}
                              required
                              disabled={addMaterialLoading}
                              placeholder="e.g., AL-001"
                              error={!!materialFieldErrors.MaterialCode}
                              helperText={materialFieldErrors.MaterialCode}
                              inputProps={{ maxLength: 50 }}
                              sx={textFieldSx}
                            />
                          </Box>
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                            <Label required>MATERIAL NAME</Label>
                            <TextField
                              fullWidth
                              size="small"
                              name="MaterialName"
                              value={materialFormData.MaterialName}
                              onChange={handleMaterialFormChange}
                              onBlur={handleMaterialBlur}
                              required
                              disabled={addMaterialLoading}
                              placeholder="e.g., Aluminium"
                              error={!!materialFieldErrors.MaterialName}
                              helperText={materialFieldErrors.MaterialName}
                              inputProps={{ maxLength: 100 }}
                              sx={textFieldSx}
                            />
                          </Box>
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                            <Label>DENSITY (g/cm³)</Label>
                            <TextField
                              fullWidth
                              size="small"
                              name="Density"
                              type="number"
                              value={materialFormData.Density}
                              onChange={handleMaterialFormChange}
                              onBlur={handleMaterialBlur}
                              disabled={addMaterialLoading}
                              placeholder="e.g., 2.7"
                              error={!!materialFieldErrors.Density}
                              helperText={materialFieldErrors.Density}
                              inputProps={{
                                step: '0.01',
                                min: 0,
                                onWheel: (e) => e.target.blur()
                              }}
                              sx={numberFieldSx}
                            />
                            <Typography sx={{ fontSize: '0.65rem', color: COLORS.text.tertiary }}>
                              Optional – Leave blank if not applicable
                            </Typography>
                          </Box>
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                            <Label>UNIT</Label>
                            <FormControl fullWidth size="small">
                              <Select
                                name="Unit"
                                value={materialFormData.Unit}
                                onChange={handleMaterialFormChange}
                                disabled={addMaterialLoading}
                                sx={selectSx}
                              >
                                {materialUnitOptions.map((option) => (
                                  <MenuItem key={option} value={option} sx={{ fontSize: '0.75rem' }}>{option}</MenuItem>
                                ))}
                              </Select>
                            </FormControl>
                          </Box>
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                            <Label>GRADE</Label>
                            <TextField
                              fullWidth
                              size="small"
                              name="Grade"
                              value={materialFormData.Grade}
                              onChange={handleMaterialFormChange}
                              disabled={addMaterialLoading}
                              placeholder="e.g., AA6063 T5"
                              sx={textFieldSx}
                            />
                          </Box>
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                            <Label>EFFECTIVE RATE (₹)</Label>
                            <TextField
                              fullWidth
                              size="small"
                              name="EffectiveRate"
                              type="number"
                              value={materialFormData.EffectiveRate}
                              onChange={handleMaterialFormChange}
                              onBlur={handleMaterialBlur}
                              disabled={addMaterialLoading}
                              placeholder="e.g., 210.00"
                              error={!!materialFieldErrors.EffectiveRate}
                              helperText={materialFieldErrors.EffectiveRate}
                              InputProps={{
                                startAdornment: (
                                  <InputAdornment position="start">
                                    <Typography sx={{ fontSize: '0.7rem', color: COLORS.text.tertiary }}>₹</Typography>
                                  </InputAdornment>
                                ),
                              }}
                              inputProps={{
                                step: '0.01',
                                min: 0,
                                onWheel: (e) => e.target.blur()
                              }}
                              sx={numberFieldSx}
                            />
                            <Typography sx={{ fontSize: '0.65rem', color: COLORS.text.tertiary }}>
                              Optional – Leave blank if not applicable
                            </Typography>
                          </Box>
                        </Grid>
                      </Grid>

                      {addMaterialError && (
                        <Alert
                          severity="error"
                          sx={{
                            mt: 2,
                            borderRadius: 1.5,
                            fontSize: '0.75rem',
                            py: 0.5
                          }}
                        >
                          {addMaterialError}
                        </Alert>
                      )}

                      <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                        <Button
                          onClick={() => {
                            setShowAddMaterialForm(false);
                            setAddMaterialError('');
                            setMaterialFormData({
                              MaterialCode: '',
                              MaterialName: '',
                              Density: '',
                              Unit: 'Kg',
                              Grade: '',
                              EffectiveRate: ''
                            });
                            setMaterialFieldErrors({});
                            setMaterialTouched({});
                          }}
                          disabled={addMaterialLoading}
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
                          onClick={handleAddMaterialSubmit}
                          disabled={addMaterialLoading}
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
                            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
                            '&:hover': {
                              bgcolor: COLORS.primaryDark,
                            }
                          }}
                        >
                          {addMaterialLoading ? 'Adding...' : 'Add Material'}
                        </Button>
                      </Box>
                    </Box>
                  </Grid>
                )}

                <Grid size={{ xs: 12 }}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                    <Label>DESCRIPTION</Label>
                    <TextField
                      fullWidth
                      size="small"
                      name="Description"
                      value={formData.Description}
                      onChange={handleChange}
                      multiline
                      rows={2}
                      disabled={loading}
                      placeholder="e.g., Q2 2025 rate"
                      sx={textFieldSx}
                    />
                    <Typography sx={{ fontSize: '0.65rem', color: COLORS.text.tertiary }}>
                      Optional – Add any notes about this rate
                    </Typography>
                  </Box>
                </Grid>

                <Grid size={{ xs: 12 }}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                    <Label>REMARK</Label>
                    <TextField
                      fullWidth
                      size="small"
                      name="Remark"
                      value={formData.Remark}
                      onChange={handleChange}
                      multiline
                      rows={2}
                      disabled={loading}
                      placeholder="Enter remark"
                      sx={textFieldSx}
                    />
                    <Typography sx={{ fontSize: '0.65rem', color: COLORS.text.tertiary }}>
                      Optional – Add any remark
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </Box>

            {/* Material Info Summary */}
            {selectedMaterial && (
              <Box sx={{ mt: 1, p: 1.5, bgcolor: COLORS.background.light, borderRadius: 1.5 }}>
                <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.primary, mb: 0.5 }}>
                  Selected Material Details
                </Typography>
                <Grid container spacing={1}>
                  <Grid size={{ xs: 6 }}>
                    <Typography sx={{ fontSize: '0.65rem', color: COLORS.text.secondary }}>Material Code:</Typography>
                  </Grid>
                  <Grid size={{ xs: 6 }}>
                    <Typography sx={{ fontSize: '0.65rem', fontWeight: 500, color: COLORS.text.primary }}>
                      {selectedMaterial.MaterialCode || '-'}
                    </Typography>
                  </Grid>
                  <Grid size={{ xs: 6 }}>
                    <Typography sx={{ fontSize: '0.65rem', color: COLORS.text.secondary }}>Grade:</Typography>
                  </Grid>
                  <Grid size={{ xs: 6 }}>
                    <Typography sx={{ fontSize: '0.65rem', fontWeight: 500, color: COLORS.text.primary }}>
                      {selectedMaterial.Grade || '-'}
                    </Typography>
                  </Grid>
                  {selectedMaterial.Density && (
                    <>
                      <Grid size={{ xs: 6 }}>
                        <Typography sx={{ fontSize: '0.65rem', color: COLORS.text.secondary }}>Density:</Typography>
                      </Grid>
                      <Grid size={{ xs: 6 }}>
                        <Typography sx={{ fontSize: '0.65rem', fontWeight: 500, color: COLORS.text.primary }}>
                          {selectedMaterial.Density} {selectedMaterial.Unit || ''}
                        </Typography>
                      </Grid>
                    </>
                  )}
                </Grid>
              </Box>
            )}
          </Stack>
        );

      case 1:
        return (
          <Stack spacing={2}>
            <Box>
              <Typography variant="subtitle2" sx={{ color: COLORS.primary, mb: 1.5, fontWeight: 600, fontSize: '0.9rem' }}>
                Rate Details
              </Typography>

              <Grid container spacing={1.5}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                    <Label required>RATE PER KG</Label>
                    <TextField
                      fullWidth
                      size="small"
                      name="RatePerKG"
                      value={formData.RatePerKG}
                      onChange={handleChange}
                      required
                      disabled={loading}
                      placeholder="0.00"
                      error={!!fieldErrors.RatePerKG}
                      helperText={fieldErrors.RatePerKG}
                      InputProps={{
                        startAdornment: (
                          <Typography sx={{ fontSize: '0.7rem', color: COLORS.text.secondary, mr: 0.5 }}>
                            ₹
                          </Typography>
                        ),
                      }}
                      inputProps={{
                        step: '0.01',
                        min: 0,
                        onWheel: (e) => e.target.blur()
                      }}
                      sx={numberFieldSx}
                    />
                  </Box>
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                    <Label required>PROFILE CONVERSION RATE</Label>
                    <TextField
                      fullWidth
                      size="small"
                      name="profile_conversion_rate"
                      value={formData.profile_conversion_rate}
                      onChange={handleChange}
                      required
                      disabled={loading}
                      placeholder="0.00"
                      error={!!fieldErrors.profile_conversion_rate}
                      helperText={fieldErrors.profile_conversion_rate}
                      InputProps={{
                        startAdornment: (
                          <Typography sx={{ fontSize: '0.7rem', color: COLORS.text.secondary, mr: 0.5 }}>
                            ₹
                          </Typography>
                        ),
                      }}
                      inputProps={{
                        step: '0.01',
                        min: 0,
                        onWheel: (e) => e.target.blur()
                      }}
                      sx={numberFieldSx}
                    />
                  </Box>
                </Grid>
              </Grid>
            </Box>

            <Box>
              <Typography variant="subtitle2" sx={{ color: COLORS.primary, mb: 1.5, fontWeight: 600, fontSize: '0.9rem' }}>
                Loss Percentages
              </Typography>

              <Grid container spacing={1.5}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                    <Label required>SCRAP PERCENTAGE</Label>
                    <TextField
                      fullWidth
                      size="small"
                      name="ScrapPercentage"
                      value={formData.ScrapPercentage}
                      onChange={handleChange}
                      required
                      disabled={loading}
                      placeholder="0"
                      error={!!fieldErrors.ScrapPercentage}
                      helperText={fieldErrors.ScrapPercentage}
                      InputProps={{
                        endAdornment: (
                          <Typography sx={{ fontSize: '0.7rem', color: COLORS.text.secondary, ml: 0.5 }}>
                            %
                          </Typography>
                        ),
                      }}
                      inputProps={{
                        step: '0.1',
                        min: 0,
                        max: 100,
                        onWheel: (e) => e.target.blur()
                      }}
                      sx={numberFieldSx}
                    />
                  </Box>
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                    <Label required>TRANSPORT LOSS %</Label>
                    <TextField
                      fullWidth
                      size="small"
                      name="TransportLossPercentage"
                      value={formData.TransportLossPercentage}
                      onChange={handleChange}
                      required
                      disabled={loading}
                      placeholder="0"
                      error={!!fieldErrors.TransportLossPercentage}
                      helperText={fieldErrors.TransportLossPercentage}
                      InputProps={{
                        endAdornment: (
                          <Typography sx={{ fontSize: '0.7rem', color: COLORS.text.secondary, ml: 0.5 }}>
                            %
                          </Typography>
                        ),
                      }}
                      inputProps={{
                        step: '0.1',
                        min: 0,
                        max: 100,
                        onWheel: (e) => e.target.blur()
                      }}
                      sx={numberFieldSx}
                    />
                  </Box>
                </Grid>
              </Grid>
            </Box>

            <Box>
              <Typography variant="subtitle2" sx={{ color: COLORS.primary, mb: 1.5, fontWeight: 600, fontSize: '0.9rem' }}>
                Validity & Status
              </Typography>

              <Grid container spacing={1.5}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                    <Label required>DATE EFFECTIVE</Label>
                    <TextField
                      fullWidth
                      size="small"
                      name="DateEffective"
                      type="date"
                      value={formData.DateEffective}
                      onChange={handleChange}
                      required
                      disabled={loading}
                      error={!!fieldErrors.DateEffective}
                      helperText={fieldErrors.DateEffective}
                      InputLabelProps={{ shrink: true }}
                      sx={textFieldSx}
                    />
                  </Box>
                </Grid>
              </Grid>
            </Box>
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
        mb: 1,
        bgcolor: COLORS.background.white,
        display: 'flex',
        flexDirection: 'column',
        gap: 1
      }}>
        <Typography sx={{ fontSize: '1.2rem', fontWeight: 700, color: COLORS.text.primary }}>
          Add Raw Material
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
          sx={{
            height: 32,
            px: 2,
            borderRadius: 1.5,
            border: `1px solid ${COLORS.border}`,
            color: COLORS.text.secondary,
            fontSize: '0.7rem',
            fontWeight: 500,
            textTransform: 'none',
            '&:hover': { borderColor: COLORS.primary, bgcolor: `${COLORS.primary}10` },
            '&:disabled': { borderColor: COLORS.border, color: COLORS.text.tertiary }
          }}
        >
          Back
        </Button>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            onClick={handleClose}
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
              '&:hover': { borderColor: COLORS.primary, bgcolor: `${COLORS.primary}10` }
            }}
          >
            Cancel
          </Button>
          {activeStep === steps.length - 1 ? (
            <Button
              variant="contained"
              onClick={handleSubmit}
              disabled={loading || !formData.MaterialID || !formData.RatePerKG}
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
                '&:hover': { bgcolor: COLORS.primaryDark },
                '&:disabled': { bgcolor: COLORS.border, color: COLORS.text.tertiary }
              }}
            >
              {loading ? 'Adding...' : 'Add Material'}
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
                '&:hover': { bgcolor: COLORS.primaryDark },
                '&:disabled': { bgcolor: COLORS.border, color: COLORS.text.tertiary }
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

export default AddRawMaterial;