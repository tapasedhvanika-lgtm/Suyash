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
//   Typography,
//   Box,
//   FormControl,
//   InputLabel,
//   Select,
//   MenuItem,
//   Grid,
//   Autocomplete,
//   CircularProgress,
//   Tooltip,
//   IconButton
// } from '@mui/material';
// import { Add as AddIcon } from '@mui/icons-material';
// import axios from 'axios';
// import BASE_URL from '../../../config/Config';
// import AddItem from '../itemmaster/AddItem';


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

// const AddDimensions = ({ open, onClose, onAdd }) => {
//   const [formData, setFormData] = useState({
//     PartNo: '',
//     Thickness: '',
//     Width: '',
//     Length: '',
//     Density: ''
//   });
//   const [items, setItems] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [fetchingItems, setFetchingItems] = useState(false);
//   const [error, setError] = useState('');
//   const [selectedPart, setSelectedPart] = useState(null);
  
//   // State for Add Item dialog
//   const [addItemOpen, setAddItemOpen] = useState(false);

//   // Fetch items for Part No dropdown
//   useEffect(() => {
//     const fetchItems = async () => {
//       if (!open) return;
      
//       setFetchingItems(true);
//       try {
//         const token = localStorage.getItem('token');
//         const response = await axios.get(`${BASE_URL}/api/items`, {
//           headers: {
//             'Authorization': `Bearer ${token}`
//           }
//         });

//         if (response.data.success) {
//           setItems(response.data.data || []);
//         }
//       } catch (err) {
//         console.error('Error fetching items:', err);
//         setError('Failed to load items. Please try again.');
//       } finally {
//         setFetchingItems(false);
//       }
//     };

//     fetchItems();
//   }, [open]);

//   // Handle item added from AddItem dialog
//   const handleItemAdded = (newItem) => {
//     // Add the new item to the items list
//     setItems(prev => [...prev, newItem]);
    
//     // Auto-select the newly added item
//     setSelectedPart(newItem);
//     setFormData(prev => ({
//       ...prev,
//       PartNo: newItem.part_no,
//       Density: newItem.density ? newItem.density.toString() : ''
//     }));
//   };

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData(prev => ({
//       ...prev,
//       [name]: value
//     }));
//   };

//   const handlePartChange = (event, newValue) => {
//     setSelectedPart(newValue);
    
//     if (newValue) {
//       setFormData(prev => ({
//         ...prev,
//         PartNo: newValue.part_no
//       }));
      
//       // Auto-fill density from the item's material
//       if (newValue.density) {
//         setFormData(prev => ({
//           ...prev,
//           Density: newValue.density.toString() || ''
//         }));
//       }
//     } else {
//       setFormData(prev => ({
//         ...prev,
//         PartNo: '',
//         Density: ''
//       }));
//     }
//   };

//   const calculateWeight = () => {
//     const { Thickness, Width, Length, Density } = formData;
//     if (Thickness && Width && Length && Density) {
//       const thicknessMm = parseFloat(Thickness) / 1000;
//       const widthMm = parseFloat(Width) / 1000;
//       const lengthMm = parseFloat(Length) / 1000;
//       const density = parseFloat(Density);
      
//       const volume = thicknessMm * widthMm * lengthMm;
//       const weight = volume * density * 1000;
//       return weight.toFixed(6);
//     }
//     return 0;
//   };

//   const handleSubmit = async () => {
//     // Validation
//     if (!formData.PartNo) {
//       setError('Part No is required');
//       return;
//     }
//     if (!formData.Thickness || parseFloat(formData.Thickness) <= 0) {
//       setError('Thickness must be greater than 0');
//       return;
//     }
//     if (!formData.Width || parseFloat(formData.Width) <= 0) {
//       setError('Width must be greater than 0');
//       return;
//     }
//     if (!formData.Length || parseFloat(formData.Length) <= 0) {
//       setError('Length must be greater than 0');
//       return;
//     }
//     if (!formData.Density || parseFloat(formData.Density) <= 0) {
//       setError('Density must be greater than 0');
//       return;
//     }

//     setLoading(true);
//     setError('');

//     try {
//       const token = localStorage.getItem('token');
//       const response = await axios.post(`${BASE_URL}/api/dimension-weights`, {
//         PartNo: formData.PartNo,
//         Thickness: parseFloat(formData.Thickness),
//         Width: parseFloat(formData.Width),
//         Length: parseFloat(formData.Length),
//         Density: parseFloat(formData.Density),
//       }, {
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
//         setError(response.data.message || 'Failed to add dimension');
//       }
//     } catch (err) {
//       console.error('Error adding dimension:', err);
//       setError(err.response?.data?.message || 'Failed to add dimension. Please try again.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const resetForm = () => {
//     setFormData({
//       PartNo: '',
//       Thickness: '',
//       Width: '',
//       Length: '',
//       Density: ''
//     });
//     setSelectedPart(null);
//     setError('');
//   };

//   const handleClose = () => {
//     resetForm();
//     onClose();
//   };

//   const weight = calculateWeight();

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
//           mb: 2,
//           bgcolor: COLORS.background.white,
//           display: 'flex',
//           justifyContent: 'space-between',
//           alignItems: 'center'
//         }}>
//           <Typography
//             sx={{
//               fontSize: '1.2rem',
//               fontWeight: 700,
//               color: COLORS.text.primary
//             }}
//           >
//             Add Dimension Weight
//           </Typography>
//         </DialogTitle>

//         <DialogContent sx={{ p: 2.5 }}>
//           <Stack spacing={2}>
//             <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5 }}>
//               {/* Part No Field with Add Button */}
//               <Box sx={{ gridColumn: 'span 2' }}>
//                 <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//                   <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
//                     <Label required>PART NO</Label>
//                     <Tooltip title="Add New Item">
//                       <IconButton
//                         size="small"
//                         onClick={() => setAddItemOpen(true)}
//                         sx={{
//                           color: COLORS.primary,
//                           p: 0.25,
//                           '&:hover': { bgcolor: COLORS.primaryLight }
//                         }}
//                       >
//                         <AddIcon sx={{ fontSize: '0.8rem' }} />
//                       </IconButton>
//                     </Tooltip>
//                   </Box>
                  
//                   <Autocomplete
//                     fullWidth
//                     options={items}
//                     loading={fetchingItems}
//                     value={selectedPart}
//                     onChange={handlePartChange}
//                     getOptionLabel={(option) => option.part_no || ''}
//                     isOptionEqualToValue={(option, value) => option._id === value._id}
//                     disabled={loading}
//                     renderInput={(params) => (
//                       <TextField
//                         {...params}
//                         size="small"
//                         placeholder="Select a part number"
//                         required
//                         error={!!error && error.includes('Part No')}
//                         sx={{
//                           '& .MuiOutlinedInput-root': {
//                             borderRadius: 1.5,
//                             fontSize: '0.75rem',
//                             '&:hover fieldset': { borderColor: COLORS.primary },
//                             '&.Mui-focused fieldset': { borderColor: COLORS.primary, borderWidth: 1 }
//                           },
//                           '& .MuiInputBase-input': {
//                             py: 1,
//                             px: 1.5,
//                             fontSize: '0.75rem',
//                             color: COLORS.text.primary,
//                             '&::placeholder': {
//                               color: COLORS.text.tertiary,
//                               fontSize: '0.75rem'
//                             }
//                           }
//                         }}
//                         InputProps={{
//                           ...params.InputProps,
//                           endAdornment: (
//                             <>
//                               {fetchingItems ? <CircularProgress color="inherit" size={16} /> : null}
//                               {params.InputProps.endAdornment}
//                             </>
//                           ),
//                         }}
//                       />
//                     )}
//                     renderOption={(props, option) => (
//                       <li {...props}>
//                         <Box>
//                           <Typography variant="body2" fontWeight={500} sx={{ fontSize: '0.75rem' }}>
//                             {option.part_no}
//                           </Typography>
//                           {option.part_description && (
//                             <Typography variant="caption" sx={{ fontSize: '0.7rem', color: COLORS.text.tertiary }}>
//                               {option.part_description}
//                             </Typography>
//                           )}
//                         </Box>
//                       </li>
//                     )}
//                     ListboxProps={{
//                       sx: {
//                         '& .MuiAutocomplete-option': {
//                           fontSize: '0.75rem',
//                           py: 1,
//                           px: 1.5
//                         }
//                       }
//                     }}
//                   />

//                   {fetchingItems && !selectedPart && (
//                     <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
//                       <CircularProgress size={12} sx={{ color: COLORS.primary }} />
//                       <Typography sx={{ fontSize: '0.65rem', color: COLORS.text.tertiary }}>
//                         Loading parts...
//                       </Typography>
//                     </Box>
//                   )}
//                   {!fetchingItems && items.length === 0 && (
//                     <Typography sx={{ fontSize: '0.65rem', color: '#EF4444', mt: 0.5 }}>
//                       No parts available. Please click the + button to add an item first.
//                     </Typography>
//                   )}
//                 </Box>
//               </Box>

//               {/* Thickness Field */}
//               <Box sx={{ gridColumn: 'span 1' }}>
//                 <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//                   <Label required>THICKNESS (mm)</Label>
//                   <TextField
//                     fullWidth
//                     name="Thickness"
//                     type="number"
//                     value={formData.Thickness}
//                     onChange={handleChange}
//                     required
//                     disabled={loading}
//                     placeholder="Enter thickness"
//                     size="small"
//                     variant="outlined"
//                     InputProps={{
//                       endAdornment: (
//                         <Typography sx={{ fontSize: '0.7rem', color: COLORS.text.secondary, ml: 0.5 }}>
//                           mm
//                         </Typography>
//                       ),
//                       inputProps: { min: 0, step: 0.01 }
//                     }}
//                     sx={{
//                       '& .MuiOutlinedInput-root': {
//                         borderRadius: 1.5,
//                         fontSize: '0.75rem',
//                         '&:hover fieldset': { borderColor: COLORS.primary },
//                         '&.Mui-focused fieldset': { borderColor: COLORS.primary, borderWidth: 1 }
//                       },
//                       '& .MuiInputBase-input': {
//                         py: 1,
//                         px: 1.5,
//                         fontSize: '0.75rem',
//                         color: COLORS.text.primary,
//                         '&::placeholder': {
//                           color: COLORS.text.tertiary,
//                           fontSize: '0.75rem'
//                         }
//                       },
//                       '& input[type=number]': {
//                         MozAppearance: 'textfield'
//                       },
//                       '& input[type=number]::-webkit-outer-spin-button, & input[type=number]::-webkit-inner-spin-button': {
//                         WebkitAppearance: 'none', margin: 0
//                       }
//                     }}
//                   />
//                 </Box>
//               </Box>

//               {/* Width Field */}
//               <Box sx={{ gridColumn: 'span 1' }}>
//                 <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//                   <Label required>WIDTH (mm)</Label>
//                   <TextField
//                     fullWidth
//                     name="Width"
//                     type="number"
//                     value={formData.Width}
//                     onChange={handleChange}
//                     required
//                     disabled={loading}
//                     placeholder="Enter width"
//                     size="small"
//                     variant="outlined"
//                     InputProps={{
//                       endAdornment: (
//                         <Typography sx={{ fontSize: '0.7rem', color: COLORS.text.secondary, ml: 0.5 }}>
//                           mm
//                         </Typography>
//                       ),
//                       inputProps: { min: 0, step: 0.01 }
//                     }}
//                     sx={{
//                       '& .MuiOutlinedInput-root': {
//                         borderRadius: 1.5,
//                         fontSize: '0.75rem',
//                         '&:hover fieldset': { borderColor: COLORS.primary },
//                         '&.Mui-focused fieldset': { borderColor: COLORS.primary, borderWidth: 1 }
//                       },
//                       '& .MuiInputBase-input': {
//                         py: 1,
//                         px: 1.5,
//                         fontSize: '0.75rem',
//                         color: COLORS.text.primary,
//                         '&::placeholder': {
//                           color: COLORS.text.tertiary,
//                           fontSize: '0.75rem'
//                         }
//                       },
//                       '& input[type=number]': {
//                         MozAppearance: 'textfield'
//                       },
//                       '& input[type=number]::-webkit-outer-spin-button, & input[type=number]::-webkit-inner-spin-button': {
//                         WebkitAppearance: 'none', margin: 0
//                       }
//                     }}
//                   />
//                 </Box>
//               </Box>

//               {/* Length Field */}
//               <Box sx={{ gridColumn: 'span 1' }}>
//                 <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//                   <Label required>LENGTH (mm)</Label>
//                   <TextField
//                     fullWidth
//                     name="Length"
//                     type="number"
//                     value={formData.Length}
//                     onChange={handleChange}
//                     required
//                     disabled={loading}
//                     placeholder="Enter length"
//                     size="small"
//                     variant="outlined"
//                     InputProps={{
//                       endAdornment: (
//                         <Typography sx={{ fontSize: '0.7rem', color: COLORS.text.secondary, ml: 0.5 }}>
//                           mm
//                         </Typography>
//                       ),
//                       inputProps: { min: 0, step: 0.01 }
//                     }}
//                     sx={{
//                       '& .MuiOutlinedInput-root': {
//                         borderRadius: 1.5,
//                         fontSize: '0.75rem',
//                         '&:hover fieldset': { borderColor: COLORS.primary },
//                         '&.Mui-focused fieldset': { borderColor: COLORS.primary, borderWidth: 1 }
//                       },
//                       '& .MuiInputBase-input': {
//                         py: 1,
//                         px: 1.5,
//                         fontSize: '0.75rem',
//                         color: COLORS.text.primary,
//                         '&::placeholder': {
//                           color: COLORS.text.tertiary,
//                           fontSize: '0.75rem'
//                         }
//                       },
//                       '& input[type=number]': {
//                         MozAppearance: 'textfield'
//                       },
//                       '& input[type=number]::-webkit-outer-spin-button, & input[type=number]::-webkit-inner-spin-button': {
//                         WebkitAppearance: 'none', margin: 0
//                       }
//                     }}
//                   />
//                 </Box>
//               </Box>

//               {/* Density Field */}
//               <Box sx={{ gridColumn: 'span 1' }}>
//                 <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//                   <Label required>DENSITY (g/cm³)</Label>
//                   <TextField
//                     fullWidth
//                     name="Density"
//                     type="number"
//                     value={formData.Density}
//                     onChange={handleChange}
//                     required
//                     disabled={loading}
//                     placeholder="Enter density"
//                     size="small"
//                     variant="outlined"
//                     InputProps={{
//                       endAdornment: (
//                         <Typography sx={{ fontSize: '0.7rem', color: COLORS.text.secondary, ml: 0.5 }}>
//                           g/cm³
//                         </Typography>
//                       ),
//                       inputProps: { min: 0, step: 0.01 }
//                     }}
//                     sx={{
//                       '& .MuiOutlinedInput-root': {
//                         borderRadius: 1.5,
//                         fontSize: '0.75rem',
//                         '&:hover fieldset': { borderColor: COLORS.primary },
//                         '&.Mui-focused fieldset': { borderColor: COLORS.primary, borderWidth: 1 }
//                       },
//                       '& .MuiInputBase-input': {
//                         py: 1,
//                         px: 1.5,
//                         fontSize: '0.75rem',
//                         color: COLORS.text.primary,
//                         '&::placeholder': {
//                           color: COLORS.text.tertiary,
//                           fontSize: '0.75rem'
//                         }
//                       },
//                       '& input[type=number]': {
//                         MozAppearance: 'textfield'
//                       },
//                       '& input[type=number]::-webkit-outer-spin-button, & input[type=number]::-webkit-inner-spin-button': {
//                         WebkitAppearance: 'none', margin: 0
//                       }
//                     }}
//                   />
//                 </Box>
//               </Box>

//               {/* Weight Preview */}
//               {weight > 0 && (
//                 <Box sx={{ 
//                   gridColumn: 'span 2',
//                   p: 2, 
//                   bgcolor: COLORS.primaryLight, 
//                   borderRadius: 1.5,
//                   border: `1px solid ${COLORS.primary}`,
//                   mt: 1
//                 }}>
//                   <Typography 
//                     variant="subtitle2" 
//                     sx={{ 
//                       fontWeight: 600, 
//                       color: COLORS.primaryDark, 
//                       mb: 1.5,
//                       fontSize: '0.8rem'
//                     }}
//                   >
//                     Weight Calculation Preview
//                   </Typography>
//                   <Stack spacing={1}>
//                     <Stack direction="row" justifyContent="space-between">
//                       <Typography sx={{ fontSize: '0.7rem', color: COLORS.text.secondary }}>Volume:</Typography>
//                       <Typography sx={{ fontSize: '0.7rem', fontWeight: 500, color: COLORS.text.primary }}>
//                         {(parseFloat(formData.Thickness) * parseFloat(formData.Width) * parseFloat(formData.Length) / 1000000000).toFixed(6)} m³
//                       </Typography>
//                     </Stack>
                    
//                     <Stack direction="row" justifyContent="space-between">
//                       <Typography sx={{ fontSize: '0.7rem', color: COLORS.text.secondary }}>Calculated Weight:</Typography>
//                       <Typography sx={{ fontSize: '0.9rem', fontWeight: 700, color: COLORS.primaryDark }}>
//                         {weight} kg
//                       </Typography>
//                     </Stack>
//                   </Stack>
//                 </Box>
//               )}
//             </Box>
            
//             {error && (
//               <Alert 
//                 severity="error" 
//                 sx={{ 
//                   borderRadius: 1.5,
//                   mt: 1,
//                   '& .MuiAlert-icon': {
//                     fontSize: '1.25rem',
//                     alignItems: 'center'
//                   },
//                   fontSize: '0.75rem',
//                   py: 0.5
//                 }}
//               >
//                 {error}
//               </Alert>
//             )}
//           </Stack>
//         </DialogContent>

//         <DialogActions sx={{
//           px: 2.5,
//           py: 1.5,
//           borderTop: `1px solid ${COLORS.border}`,
//           bgcolor: COLORS.background.white,
//           display: 'flex',
//           justifyContent: 'flex-end',
//           gap: 1
//         }}>
//           <Button
//             onClick={handleClose}
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
//           <Button
//             variant="contained"
//             onClick={handleSubmit}
//             disabled={loading || fetchingItems || !formData.PartNo || !formData.Thickness || !formData.Width || !formData.Length || !formData.Density}
//             startIcon={loading ? null : <AddIcon sx={{ fontSize: '1rem' }} />}
//             sx={{
//               height: 32,
//               px: 2,
//               borderRadius: 1.5,
//               bgcolor: COLORS.primary,
//               fontSize: '0.7rem',
//               fontWeight: 500,
//               textTransform: 'none',
//               boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
//               '&:hover': {
//                 bgcolor: COLORS.primaryDark,
//               },
//               '&:disabled': {
//                 bgcolor: COLORS.border,
//                 color: COLORS.text.tertiary
//               }
//             }}
//           >
//             {loading ? 'Adding...' : 'Add Dimension'}
//           </Button>
//         </DialogActions>
//       </Dialog>

//       {/* Add Item Dialog */}
//       <AddItem
//         open={addItemOpen}
//         onClose={() => setAddItemOpen(false)}
//         onAdd={handleItemAdded}
//       />
//     </>
//   );
// };

// export default AddDimensions;







import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Stack,
  Typography,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Autocomplete,
  CircularProgress,
  Tooltip,
  IconButton,
  Collapse,
  Alert,
  Divider,
  InputAdornment,
  Stepper,
  Step,
  StepLabel,
  StepConnector,
  stepConnectorClasses,
  styled
} from '@mui/material';
import {
  Add as AddIcon,
  Error as ErrorIcon,
  Close as CloseIcon,
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
  },
  chips: {
    active: '#9FE2BF',
    inactive: '#F1F5F9',
    suspended: '#FEF3C7',
    locked: '#FEE2E2'
  }
};

// Floating Error Alert
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

// Stepper connector (matching AddItem)
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

const ITEM_STEPS = ['Basic Info', 'Material & Drawing', 'Process Details', 'Rate & Tax'];

// ============================================
// OPTIONS (matching AddItem)
// ============================================
const itemCategoryOptions = ['Raw Material', 'Semi-Finished', 'Finished Good', 'Consumable', 'Tool', 'Bought-Out', 'Subcontract'];
const itemTypeOptions = ['Busbar', 'Stamping', 'Gasket', 'Tooling', 'Copper Strip', 'Aluminium Profile', 'Rubber Sheet', 'Cork', 'Other'];
const unitOptions = ['Nos', 'Kg', 'Meter', 'Set', 'Piece', 'Sheet', 'Roll'];
const procurementTypeOptions = ['Manufacture', 'Purchase', 'Subcontract', 'Free Issue'];
const rmTypeOptions = ['Strip', 'Profile', 'Sheet', 'Wire', 'Tube', 'Compound', 'Bar', 'Rod', 'Coil'];
const materialOptions = ['Steel', 'Copper', 'Aluminium', 'Brass', 'Stainless Steel', 'Plastic', 'Other'];
const processTypeOptions = ['Machining', 'Fabrication', 'Assembly', 'Heat Treatment', 'Plating', 'Welding', 'Other'];
const machineTypeOptions = ['CNC', 'VMC', 'Lathe', 'Milling', 'Drilling', 'Grinding', 'Welding Machine', 'Other'];

// ============================================
// MAIN COMPONENT
// ============================================
const AddDimensions = ({ open, onClose, onAdd }) => {
  const [formData, setFormData] = useState({
    PartNo: '',
    Thickness: '',
    Width: '',
    Length: '',
    Density: ''
  });
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchingItems, setFetchingItems] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [selectedPart, setSelectedPart] = useState(null);

  // Inline Add Item form state (full 4-step)
  const [showAddItemForm, setShowAddItemForm] = useState(false);
  const [itemStepper, setItemStepper] = useState(0);
  const [itemFormData, setItemFormData] = useState({
    // === Basic Info ===
    part_no: '',
    part_name: '',
    part_description: '',
    item_category: '',
    item_type: '',
    sale_unit: '',
    weight_per_unit_kg: '',
    // === Material & Drawing ===
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
    // === Process Details ===
    thickness: '',
    width: '',
    length: '',
    strip_size: '',
    pitch: '',
    no_of_cavity: 1,
    rm_rejection_percent: '',
    scrap_realisation_percent: '',
    // === Rate & Tax ===
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
  const [addItemLoading, setAddItemLoading] = useState(false);
  const [addItemError, setAddItemError] = useState('');

  const showError = (message) => {
    setError(message);
    setTimeout(() => setError(''), 5000);
  };

  // Fetch items for Part No dropdown
  useEffect(() => {
    const fetchItems = async () => {
      if (!open) return;
      setFetchingItems(true);
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${BASE_URL}/api/items`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.data.success) {
          setItems(response.data.data || []);
        }
      } catch (err) {
        console.error('Error fetching items:', err);
        showError('Failed to load items. Please try again.');
      } finally {
        setFetchingItems(false);
      }
    };
    fetchItems();
  }, [open]);

  // ============================================
  // INLINE ITEM FORM HANDLERS
  // ============================================

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

  // ----- Validation (same as AddItem) -----
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
      case 0: // Basic Info
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
      case 1: // Material & Drawing
        if (!data.material_name?.trim()) { errors.material_name = 'Material name is required'; isValid = false; }
        if (!data.material_grade?.trim()) { errors.material_grade = 'Material grade is required'; isValid = false; }
        if (!data.density) { errors.density = 'Density is required'; isValid = false; }
        if (!data.unit) { errors.unit = 'Unit is required'; isValid = false; }
        if (!data.hsn_code?.trim()) { errors.hsn_code = 'HSN code is required'; isValid = false; }
        if (!data.procurement_type) { errors.procurement_type = 'Procurement type is required'; isValid = false; }
        break;
      case 2: // Process Details
        // Optional fields, but we can validate numeric
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
      case 3: // Rate & Tax
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
      setAddItemError('Please fix the errors in this section');
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
      setAddItemError('');
      setItemStepper(prev => prev + 1);
    }
  };

  const handleItemBack = () => {
    setAddItemError('');
    setItemStepper(prev => prev - 1);
  };

  const handleAddItemSubmit = async () => {
    if (!validateAllItemFields()) return;

    setAddItemLoading(true);
    setAddItemError('');

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

      // Remove undefined values
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
        setItems(prev => [...prev, newItem]);
        setSelectedPart(newItem);
        // Populate main dimension form
        setFormData(prev => ({
          ...prev,
          PartNo: newItem.part_no,
          Thickness: newItem.thickness || '',
          Width: newItem.width || '',
          Length: newItem.length || '',
          Density: newItem.density || ''
        }));
        setShowAddItemForm(false);
        resetItemForm();
        setFieldErrors(prev => ({ ...prev, PartNo: '' }));
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

  const resetItemForm = () => {
    setItemFormData({
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
    setItemFieldErrors({});
    setItemTouched({});
    setAddItemError('');
    setItemStepper(0);
  };

  // ============================================
  // RENDER STEP CONTENT (copy from AddItem)
  // ============================================
  const renderItemStepContent = (step) => {
    const data = itemFormData;
    const errors = itemFieldErrors;
    const handleChange = handleItemFormChange;
    const handleBlur = handleItemBlur;
    const handleSelect = handleSelectChange;

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
        WebkitAppearance: 'none', margin: 0
      }
    };

    const selectSx = {
      borderRadius: 1.5,
      fontSize: '0.75rem',
      '& .MuiSelect-select': { py: 1, px: 1.5, fontSize: '0.75rem' }
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
      case 0: // Basic Info
        return (
          <Grid container spacing={1.5}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                <Label required>PART NUMBER</Label>
                <TextField
                  fullWidth size="small" name="part_no"
                  value={data.part_no}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="e.g., BR-001"
                  error={!!errors.part_no}
                  helperText={errors.part_no}
                  sx={textFieldSx}
                  disabled={addItemLoading}
                  inputProps={{ maxLength: 50 }}
                />
              </Box>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                <Label required>PART NAME</Label>
                <TextField
                  fullWidth size="small" name="part_name"
                  value={data.part_name}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="e.g., Copper Busbar 100x10mm"
                  error={!!errors.part_name}
                  helperText={errors.part_name}
                  sx={textFieldSx}
                  disabled={addItemLoading}
                  inputProps={{ maxLength: 100 }}
                />
              </Box>
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                <Label required>ITEM CATEGORY</Label>
                <FormControl fullWidth size="small" error={!!errors.item_category}>
                  <Select
                    name="item_category"
                    value={data.item_category}
                    onChange={handleSelect}
                    onBlur={handleBlur}
                    displayEmpty
                    disabled={addItemLoading}
                    sx={selectSx}
                  >
                    <MenuItem value="" disabled sx={{ fontSize: '0.75rem', color: COLORS.text.tertiary }}>Select category</MenuItem>
                    {itemCategoryOptions.map(opt => (
                      <MenuItem key={opt} value={opt} sx={{ fontSize: '0.75rem' }}>
                        {opt}
                        {opt === 'Raw Material' && ' (What you BUY)'}
                        {opt === 'Finished Good' && ' (What you SELL)'}
                        {opt === 'Consumable' && ' (Indirect)'}
                        {opt === 'Tool' && ' (Molds, dies)'}
                        {opt === 'Bought-Out' && ' (Purchase for resale)'}
                        {opt === 'Subcontract' && ' (Send outside)'}
                        {opt === 'Semi-Finished' && ' (WIP)'}
                      </MenuItem>
                    ))}
                  </Select>
                  {errors.item_category && (
                    <Typography sx={{ fontSize: '0.65rem', color: '#EF4444', mt: 0.25 }}>
                      {errors.item_category}
                    </Typography>
                  )}
                </FormControl>
              </Box>
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                <Label>ITEM TYPE</Label>
                <FormControl fullWidth size="small">
                  <Select
                    name="item_type"
                    value={data.item_type}
                    onChange={handleSelect}
                    onBlur={handleBlur}
                    displayEmpty
                    disabled={addItemLoading}
                    sx={selectSx}
                  >
                    <MenuItem value="" disabled sx={{ fontSize: '0.75rem' }}>Select type</MenuItem>
                    {itemTypeOptions.map(opt => (
                      <MenuItem key={opt} value={opt} sx={{ fontSize: '0.75rem' }}>{opt}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <Typography sx={{ fontSize: '0.65rem', color: COLORS.text.tertiary }}>Optional, defaults to "Other"</Typography>
              </Box>
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                <Label required>SALE UNIT</Label>
                <FormControl fullWidth size="small" error={!!errors.sale_unit}>
                  <Select
                    name="sale_unit"
                    value={data.sale_unit}
                    onChange={handleSelect}
                    onBlur={handleBlur}
                    displayEmpty
                    disabled={addItemLoading}
                    sx={selectSx}
                  >
                    <MenuItem value="" disabled sx={{ fontSize: '0.75rem' }}>Select sale unit</MenuItem>
                    {unitOptions.map(opt => (
                      <MenuItem key={opt} value={opt} sx={{ fontSize: '0.75rem' }}>{opt}</MenuItem>
                    ))}
                  </Select>
                  {errors.sale_unit && (
                    <Typography sx={{ fontSize: '0.65rem', color: '#EF4444', mt: 0.25 }}>
                      {errors.sale_unit}
                    </Typography>
                  )}
                </FormControl>
              </Box>
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                <Label>WEIGHT PER UNIT (kg)</Label>
                <TextField
                  fullWidth size="small" name="weight_per_unit_kg"
                  type="number"
                  value={data.weight_per_unit_kg}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="e.g., 0.85"
                  error={!!errors.weight_per_unit_kg}
                  helperText={errors.weight_per_unit_kg}
                  sx={numberFieldSx}
                  disabled={addItemLoading}
                  inputProps={{ step: '0.001', min: 0 }}
                />
                <Typography sx={{ fontSize: '0.65rem', color: COLORS.text.tertiary }}>Required when sale unit is not Kg</Typography>
              </Box>
            </Grid>
            <Grid size={{ xs: 12 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                <Label required>PART DESCRIPTION</Label>
                <TextField
                  fullWidth size="small" name="part_description"
                  value={data.part_description}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  multiline rows={2}
                  placeholder="Enter detailed part description"
                  error={!!errors.part_description}
                  helperText={errors.part_description}
                  sx={textFieldSx}
                  disabled={addItemLoading}
                  inputProps={{ maxLength: 200 }}
                />
              </Box>
            </Grid>
          </Grid>
        );

      case 1: // Material & Drawing
        return (
          <Grid container spacing={1.5}>
            <Grid size={{ xs: 12, sm: 4 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                <Label required>MATERIAL NAME</Label>
                <TextField
                  fullWidth size="small" name="material_name"
                  value={data.material_name}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="e.g., Copper"
                  error={!!errors.material_name}
                  helperText={errors.material_name}
                  sx={textFieldSx}
                  disabled={addItemLoading}
                  inputProps={{ maxLength: 100 }}
                />
              </Box>
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                <Label>MATERIAL CODE</Label>
                <TextField
                  fullWidth size="small" name="material_code"
                  value={data.material_code}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="e.g., CU-001"
                  sx={textFieldSx}
                  disabled={addItemLoading}
                  inputProps={{ maxLength: 50 }}
                />
              </Box>
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                <Label required>MATERIAL GRADE</Label>
                <TextField
                  fullWidth size="small" name="material_grade"
                  value={data.material_grade}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="e.g., C11000"
                  error={!!errors.material_grade}
                  helperText={errors.material_grade}
                  sx={textFieldSx}
                  disabled={addItemLoading}
                />
              </Box>
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                <Label required>DENSITY (g/cm³)</Label>
                <TextField
                  fullWidth size="small" name="density"
                  type="number"
                  value={data.density}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="e.g., 8.96"
                  error={!!errors.density}
                  helperText={errors.density}
                  sx={numberFieldSx}
                  disabled={addItemLoading}
                  inputProps={{ step: '0.01', min: 0 }}
                />
              </Box>
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                <Label required>UNIT</Label>
                <FormControl fullWidth size="small" error={!!errors.unit}>
                  <Select
                    name="unit"
                    value={data.unit}
                    onChange={handleSelect}
                    onBlur={handleBlur}
                    displayEmpty
                    disabled={addItemLoading}
                    sx={selectSx}
                  >
                    <MenuItem value="" disabled sx={{ fontSize: '0.75rem' }}>Select unit</MenuItem>
                    {unitOptions.map(opt => (
                      <MenuItem key={opt} value={opt} sx={{ fontSize: '0.75rem' }}>{opt}</MenuItem>
                    ))}
                  </Select>
                  {errors.unit && (
                    <Typography sx={{ fontSize: '0.65rem', color: '#EF4444', mt: 0.25 }}>
                      {errors.unit}
                    </Typography>
                  )}
                </FormControl>
              </Box>
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                <Label>MATERIAL STANDARD</Label>
                <TextField
                  fullWidth size="small" name="material_standard"
                  value={data.material_standard}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="e.g., ASTM B152"
                  sx={textFieldSx}
                  disabled={addItemLoading}
                />
              </Box>
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                <Label>MATERIAL COLOR</Label>
                <TextField
                  fullWidth size="small" name="material_color"
                  value={data.material_color}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="e.g., Reddish"
                  sx={textFieldSx}
                  disabled={addItemLoading}
                />
              </Box>
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                <Label required>HSN CODE</Label>
                <TextField
                  fullWidth size="small" name="hsn_code"
                  value={data.hsn_code}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="e.g., 74071010"
                  error={!!errors.hsn_code}
                  helperText={errors.hsn_code}
                  sx={textFieldSx}
                  disabled={addItemLoading}
                />
              </Box>
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                <Label>GST PERCENTAGE (%)</Label>
                <TextField
                  fullWidth size="small" name="gst_percentage"
                  type="number"
                  value={data.gst_percentage}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="e.g., 18"
                  error={!!errors.gst_percentage}
                  helperText={errors.gst_percentage}
                  sx={numberFieldSx}
                  disabled={addItemLoading}
                  inputProps={{ step: '0.1', min: 0, max: 100 }}
                />
              </Box>
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                <Label>PROCUREMENT TYPE</Label>
                <FormControl fullWidth size="small" error={!!errors.procurement_type}>
                  <Select
                    name="procurement_type"
                    value={data.procurement_type}
                    onChange={handleSelect}
                    onBlur={handleBlur}
                    displayEmpty
                    disabled={addItemLoading}
                    sx={selectSx}
                  >
                    <MenuItem value="" disabled sx={{ fontSize: '0.75rem' }}>Select procurement type</MenuItem>
                    {procurementTypeOptions.map(opt => (
                      <MenuItem key={opt} value={opt} sx={{ fontSize: '0.75rem' }}>{opt}</MenuItem>
                    ))}
                  </Select>
                  {errors.procurement_type && (
                    <Typography sx={{ fontSize: '0.65rem', color: '#EF4444', mt: 0.25 }}>
                      {errors.procurement_type}
                    </Typography>
                  )}
                </FormControl>
                <Typography sx={{ fontSize: '0.65rem', color: COLORS.text.tertiary }}>Optional, defaults to "Manufacture"</Typography>
              </Box>
            </Grid>
            {/* Drawing Info */}
            <Grid size={{ xs: 12, sm: 6 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                <Label>DRAWING NUMBER</Label>
                <TextField
                  fullWidth size="small" name="drawing_no"
                  value={data.drawing_no}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="e.g., DRG001"
                  sx={textFieldSx}
                  disabled={addItemLoading}
                />
              </Box>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                <Label>REVISION NUMBER</Label>
                <TextField
                  fullWidth size="small" name="revision_no"
                  value={data.revision_no}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="e.g., 0"
                  sx={textFieldSx}
                  disabled={addItemLoading}
                />
              </Box>
            </Grid>
            {/* Dimensions */}
            <Grid size={{ xs: 12, sm: 4 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                <Label>THICKNESS (mm)</Label>
                <TextField
                  fullWidth size="small" name="thickness"
                  type="number"
                  value={data.thickness}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="e.g., 10"
                  error={!!errors.thickness}
                  helperText={errors.thickness}
                  sx={numberFieldSx}
                  disabled={addItemLoading}
                  inputProps={{ step: '0.01', min: 0 }}
                />
              </Box>
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                <Label>WIDTH (mm)</Label>
                <TextField
                  fullWidth size="small" name="width"
                  type="number"
                  value={data.width}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="e.g., 100"
                  error={!!errors.width}
                  helperText={errors.width}
                  sx={numberFieldSx}
                  disabled={addItemLoading}
                  inputProps={{ step: '0.01', min: 0 }}
                />
              </Box>
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                <Label>LENGTH (mm)</Label>
                <TextField
                  fullWidth size="small" name="length"
                  type="number"
                  value={data.length}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="e.g., 1000"
                  error={!!errors.length}
                  helperText={errors.length}
                  sx={numberFieldSx}
                  disabled={addItemLoading}
                  inputProps={{ step: '0.01', min: 0 }}
                />
              </Box>
            </Grid>
            {/* Raw Material specific */}
            <Grid size={{ xs: 12, sm: 4 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                <Label>RM SOURCE (Supplier)</Label>
                <TextField
                  fullWidth size="small" name="rm_source"
                  value={data.rm_source}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="e.g., Hindalco"
                  sx={textFieldSx}
                  disabled={addItemLoading}
                />
              </Box>
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                <Label>RM TYPE</Label>
                <FormControl fullWidth size="small">
                  <Select
                    name="rm_type"
                    value={data.rm_type}
                    onChange={handleSelect}
                    onBlur={handleBlur}
                    displayEmpty
                    disabled={addItemLoading}
                    sx={selectSx}
                  >
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
                <TextField
                  fullWidth size="small" name="rm_spec"
                  value={data.rm_spec}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="e.g., IS 191"
                  sx={textFieldSx}
                  disabled={addItemLoading}
                />
              </Box>
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                <Label>STRIP SIZE (mm)</Label>
                <TextField
                  fullWidth size="small" name="strip_size"
                  type="number"
                  value={data.strip_size}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="e.g., 3660"
                  error={!!errors.strip_size}
                  helperText={errors.strip_size}
                  sx={numberFieldSx}
                  disabled={addItemLoading}
                  inputProps={{ step: '0.01', min: 0 }}
                />
                <Typography sx={{ fontSize: '0.65rem', color: COLORS.text.tertiary }}>For press shop strip width</Typography>
              </Box>
            </Grid>
          </Grid>
        );

      case 2: // Process Details
        return (
          <Grid container spacing={1.5}>
            <Grid size={{ xs: 12, sm: 4 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                <Label>PITCH (mm)</Label>
                <TextField
                  fullWidth size="small" name="pitch"
                  type="number"
                  value={data.pitch}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="e.g., 42"
                  error={!!errors.pitch}
                  helperText={errors.pitch}
                  sx={numberFieldSx}
                  disabled={addItemLoading}
                  inputProps={{ step: '0.01', min: 0 }}
                />
                <Typography sx={{ fontSize: '0.65rem', color: COLORS.text.tertiary }}>Progressive die pitch</Typography>
              </Box>
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                <Label>NUMBER OF CAVITIES</Label>
                <TextField
                  fullWidth size="small" name="no_of_cavity"
                  type="number"
                  value={data.no_of_cavity}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="e.g., 1"
                  error={!!errors.no_of_cavity}
                  helperText={errors.no_of_cavity}
                  sx={numberFieldSx}
                  disabled={addItemLoading}
                  inputProps={{ step: '1', min: 1 }}
                />
              </Box>
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                <Label>RM REJECTION PERCENTAGE (%)</Label>
                <TextField
                  fullWidth size="small" name="rm_rejection_percent"
                  type="number"
                  value={data.rm_rejection_percent}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="e.g., 2"
                  error={!!errors.rm_rejection_percent}
                  helperText={errors.rm_rejection_percent}
                  sx={numberFieldSx}
                  disabled={addItemLoading}
                  inputProps={{ step: '0.1', min: 0, max: 100 }}
                />
                <Typography sx={{ fontSize: '0.65rem', color: COLORS.text.tertiary }}>Defaults to 2.0%</Typography>
              </Box>
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                <Label>SCRAP REALISATION PERCENTAGE (%)</Label>
                <TextField
                  fullWidth size="small" name="scrap_realisation_percent"
                  type="number"
                  value={data.scrap_realisation_percent}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="e.g., 85"
                  error={!!errors.scrap_realisation_percent}
                  helperText={errors.scrap_realisation_percent}
                  sx={numberFieldSx}
                  disabled={addItemLoading}
                  inputProps={{ step: '0.1', min: 0, max: 100 }}
                />
                <Typography sx={{ fontSize: '0.65rem', color: COLORS.text.tertiary }}>Defaults to 85%</Typography>
              </Box>
            </Grid>
          </Grid>
        );

      case 3: // Rate & Tax
        return (
          <Grid container spacing={1.5}>
            <Grid size={{ xs: 12, sm: 4 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                <Label>REORDER LEVEL</Label>
                <TextField
                  fullWidth size="small" name="reorder_level"
                  type="number"
                  value={data.reorder_level}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="e.g., 100"
                  error={!!errors.reorder_level}
                  helperText={errors.reorder_level}
                  sx={numberFieldSx}
                  disabled={addItemLoading}
                  inputProps={{ step: '1', min: 0 }}
                />
              </Box>
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                <Label>REORDER QUANTITY</Label>
                <TextField
                  fullWidth size="small" name="reorder_qty"
                  type="number"
                  value={data.reorder_qty}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="e.g., 500"
                  error={!!errors.reorder_qty}
                  helperText={errors.reorder_qty}
                  sx={numberFieldSx}
                  disabled={addItemLoading}
                  inputProps={{ step: '1', min: 0 }}
                />
              </Box>
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                <Label>LEAD TIME (Days)</Label>
                <TextField
                  fullWidth size="small" name="lead_time_days"
                  type="number"
                  value={data.lead_time_days}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="e.g., 7"
                  error={!!errors.lead_time_days}
                  helperText={errors.lead_time_days}
                  sx={numberFieldSx}
                  disabled={addItemLoading}
                  inputProps={{ step: '1', min: 0 }}
                />
              </Box>
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                <Label>SAFETY STOCK</Label>
                <TextField
                  fullWidth size="small" name="safety_stock"
                  type="number"
                  value={data.safety_stock}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="e.g., 50"
                  error={!!errors.safety_stock}
                  helperText={errors.safety_stock}
                  sx={numberFieldSx}
                  disabled={addItemLoading}
                  inputProps={{ step: '1', min: 0 }}
                />
              </Box>
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                <Label>MIN STOCK</Label>
                <TextField
                  fullWidth size="small" name="min_stock"
                  type="number"
                  value={data.min_stock}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="e.g., 50"
                  error={!!errors.min_stock}
                  helperText={errors.min_stock}
                  sx={numberFieldSx}
                  disabled={addItemLoading}
                  inputProps={{ step: '1', min: 0 }}
                />
              </Box>
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                <Label>MAX STOCK</Label>
                <TextField
                  fullWidth size="small" name="max_stock"
                  type="number"
                  value={data.max_stock}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="e.g., 2000"
                  error={!!errors.max_stock}
                  helperText={errors.max_stock}
                  sx={numberFieldSx}
                  disabled={addItemLoading}
                  inputProps={{ step: '1', min: 0 }}
                />
              </Box>
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                <Label>SHELF LIFE (Days)</Label>
                <TextField
                  fullWidth size="small" name="shelf_life_days"
                  type="number"
                  value={data.shelf_life_days}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="e.g., 365"
                  error={!!errors.shelf_life_days}
                  helperText={errors.shelf_life_days}
                  sx={numberFieldSx}
                  disabled={addItemLoading}
                  inputProps={{ step: '1', min: 0 }}
                />
                <Typography sx={{ fontSize: '0.65rem', color: COLORS.text.tertiary }}>0 means no expiry</Typography>
              </Box>
            </Grid>
          </Grid>
        );

      default:
        return null;
    }
  };

  // ============================================
  // MAIN FORM HANDLERS
  // ============================================
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFieldErrors(prev => ({ ...prev, [name]: '' }));
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePartChange = (event, newValue) => {
    setSelectedPart(newValue);
    setFieldErrors(prev => ({ ...prev, PartNo: '' }));
    if (newValue) {
      // Populate main dimension form
      setFormData(prev => ({
        ...prev,
        PartNo: newValue.part_no,
        Thickness: newValue.thickness || '',
        Width: newValue.width || '',
        Length: newValue.length || '',
        Density: newValue.density || ''
      }));
      // Populate the full item form
      setItemFormData({
        part_no: newValue.part_no || '',
        part_name: newValue.part_name || '',
        part_description: newValue.part_description || '',
        item_category: newValue.item_category || '',
        item_type: newValue.item_type || '',
        sale_unit: newValue.sale_unit || '',
        weight_per_unit_kg: newValue.weight_per_unit_kg || '',
        material_code: newValue.material_code || '',
        material_name: newValue.material_name || '',
        material_grade: newValue.material_grade || '',
        material_standard: newValue.material_standard || '',
        material_color: newValue.material_color || '',
        density: newValue.density || '',
        unit: newValue.unit || '',
        rm_source: newValue.rm_source || '',
        rm_type: newValue.rm_type || '',
        rm_spec: newValue.rm_spec || '',
        drawing_no: newValue.drawing_no || '',
        revision_no: newValue.revision_no || '',
        thickness: newValue.thickness || '',
        width: newValue.width || '',
        length: newValue.length || '',
        strip_size: newValue.strip_size || '',
        pitch: newValue.pitch || '',
        no_of_cavity: newValue.no_of_cavity || 1,
        rm_rejection_percent: newValue.rm_rejection_percent || '',
        scrap_realisation_percent: newValue.scrap_realisation_percent || '',
        hsn_code: newValue.hsn_code || '',
        gst_percentage: newValue.gst_percentage || '',
        procurement_type: newValue.procurement_type || '',
        reorder_level: newValue.reorder_level || '',
        reorder_qty: newValue.reorder_qty || '',
        lead_time_days: newValue.lead_time_days || '',
        safety_stock: newValue.safety_stock || '',
        min_stock: newValue.min_stock || '',
        max_stock: newValue.max_stock || '',
        shelf_life_days: newValue.shelf_life_days || ''
      });
      setItemStepper(0);
      setShowAddItemForm(true);
      setAddItemError('');
      setItemFieldErrors({});
      setItemTouched({});
    } else {
      setFormData(prev => ({
        ...prev,
        PartNo: '',
        Thickness: '',
        Width: '',
        Length: '',
        Density: ''
      }));
      setShowAddItemForm(false);
      resetItemForm();
    }
  };

  const validateForm = () => {
    const errors = {};
    let isValid = true;
    let errorMessages = [];

    if (!formData.PartNo) {
      errors.PartNo = 'Part No is required';
      errorMessages.push('Part No is required');
      isValid = false;
    }
    if (!formData.Thickness) {
      errors.Thickness = 'Thickness is required';
      errorMessages.push('Thickness is required');
      isValid = false;
    } else if (parseFloat(formData.Thickness) <= 0) {
      errors.Thickness = 'Thickness must be greater than 0';
      errorMessages.push('Thickness must be greater than 0');
      isValid = false;
    }
    if (!formData.Width) {
      errors.Width = 'Width is required';
      errorMessages.push('Width is required');
      isValid = false;
    } else if (parseFloat(formData.Width) <= 0) {
      errors.Width = 'Width must be greater than 0';
      errorMessages.push('Width must be greater than 0');
      isValid = false;
    }
    if (!formData.Length) {
      errors.Length = 'Length is required';
      errorMessages.push('Length is required');
      isValid = false;
    } else if (parseFloat(formData.Length) <= 0) {
      errors.Length = 'Length must be greater than 0';
      errorMessages.push('Length must be greater than 0');
      isValid = false;
    }
    if (!formData.Density) {
      errors.Density = 'Density is required';
      errorMessages.push('Density is required');
      isValid = false;
    } else if (parseFloat(formData.Density) <= 0) {
      errors.Density = 'Density must be greater than 0';
      errorMessages.push('Density must be greater than 0');
      isValid = false;
    }

    setFieldErrors(errors);
    if (!isValid) {
      showError(errorMessages[0]);
    }
    return isValid;
  };

  const calculateWeight = () => {
    const { Thickness, Width, Length, Density } = formData;
    if (Thickness && Width && Length && Density) {
      const thicknessMm = parseFloat(Thickness) / 1000;
      const widthMm = parseFloat(Width) / 1000;
      const lengthMm = parseFloat(Length) / 1000;
      const density = parseFloat(Density);
      const volume = thicknessMm * widthMm * lengthMm;
      const weight = volume * density * 1000;
      return weight.toFixed(6);
    }
    return 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`${BASE_URL}/api/dimension-weights`, {
        PartNo: formData.PartNo,
        Thickness: parseFloat(formData.Thickness),
        Width: parseFloat(formData.Width),
        Length: parseFloat(formData.Length),
        Density: parseFloat(formData.Density),
      }, {
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
        showError(response.data.message || 'Failed to add dimension');
      }
    } catch (err) {
      console.error('Error adding dimension:', err);
      const errorMessage = err.response?.data?.message || 'Failed to add dimension. Please try again.';
      showError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      PartNo: '',
      Thickness: '',
      Width: '',
      Length: '',
      Density: ''
    });
    setSelectedPart(null);
    setFieldErrors({});
    setError('');
    setShowAddItemForm(false);
    resetItemForm();
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const weight = calculateWeight();

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
      WebkitAppearance: 'none', margin: 0
    }
  };

  // ============================================
  // RENDER INLINE ITEM FORM (with full stepper)
  // ============================================
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
          onClick={handleItemBack}
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
            '&:hover': { borderColor: COLORS.primary, bgcolor: `${COLORS.primary}10` }
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
              '&:hover': { borderColor: COLORS.primary, bgcolor: `${COLORS.primary}10` }
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
              onClick={handleItemNext}
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

  // ============================================
  // MAIN RENDER
  // ============================================
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
          mb: 2,
          bgcolor: COLORS.background.white,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <Typography sx={{ fontSize: '1.2rem', fontWeight: 700, color: COLORS.text.primary }}>
            Add Dimension Weight
          </Typography>
        </DialogTitle>

        <Box sx={{ px: 2.5, pt: 1 }}>
          <FloatingErrorAlert error={error} onClose={() => setError('')} />
        </Box>

        <DialogContent sx={{ p: 2.5, pt: error ? 1 : 2 }}>
          <Stack spacing={2}>
            {/* Top section: Part No dropdown + Add New button */}
            <Box>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                <Label required>PART NO</Label>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Autocomplete
                    fullWidth
                    options={items}
                    loading={fetchingItems}
                    value={selectedPart}
                    onChange={handlePartChange}
                    getOptionLabel={(option) => option.part_no || ''}
                    isOptionEqualToValue={(option, value) => option._id === value._id}
                    disabled={loading || addItemLoading}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        size="small"
                        placeholder={fetchingItems ? 'Loading parts...' : 'Search or select a part'}
                        required
                        error={!!fieldErrors.PartNo}
                        helperText={fieldErrors.PartNo}
                        sx={textFieldSx}
                        InputProps={{
                          ...params.InputProps,
                          endAdornment: (
                            <>
                              {fetchingItems ? <CircularProgress color="inherit" size={16} /> : null}
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
                            {option.part_no}
                          </Typography>
                          {option.part_description && (
                            <Typography variant="caption" sx={{ fontSize: '0.7rem', color: COLORS.text.tertiary }}>
                              {option.part_description}
                            </Typography>
                          )}
                        </Box>
                      </li>
                    )}
                    noOptionsText={fetchingItems ? 'Loading...' : 'No parts found'}
                    sx={{ flex: 1 }}
                  />
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
                    disabled={loading || fetchingItems}
                    startIcon={showAddItemForm ? <CloseIcon sx={{ fontSize: '0.875rem' }} /> : <AddIcon sx={{ fontSize: '0.875rem' }} />}
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
                    {showAddItemForm ? 'Cancel' : 'Add New'}
                  </Button>
                </Box>
                <Typography sx={{ fontSize: '0.65rem', color: COLORS.text.tertiary }}>
                  Select an existing part or click "Add New" to create one
                </Typography>
              </Box>
            </Box>

            {/* Inline Add Item Form with full 4-step stepper */}
            {showAddItemForm && renderInlineItemForm()}

            {/* Standalone Dimension Fields (always visible) */}
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5, mt: 1 }}>
              <Box>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                  <Label required>THICKNESS (mm)</Label>
                  <TextField
                    fullWidth
                    name="Thickness"
                    type="number"
                    value={formData.Thickness}
                    onChange={handleChange}
                    required
                    disabled={loading || addItemLoading}
                    placeholder="Enter thickness"
                    size="small"
                    error={!!fieldErrors.Thickness}
                    helperText={fieldErrors.Thickness}
                    InputProps={{
                      endAdornment: (
                        <Typography sx={{ fontSize: '0.7rem', color: COLORS.text.secondary, ml: 0.5 }}>
                          mm
                        </Typography>
                      ),
                      inputProps: { min: 0, step: 0.01 }
                    }}
                    sx={numberFieldSx}
                  />
                </Box>
              </Box>

              <Box>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                  <Label required>WIDTH (mm)</Label>
                  <TextField
                    fullWidth
                    name="Width"
                    type="number"
                    value={formData.Width}
                    onChange={handleChange}
                    required
                    disabled={loading || addItemLoading}
                    placeholder="Enter width"
                    size="small"
                    error={!!fieldErrors.Width}
                    helperText={fieldErrors.Width}
                    InputProps={{
                      endAdornment: (
                        <Typography sx={{ fontSize: '0.7rem', color: COLORS.text.secondary, ml: 0.5 }}>
                          mm
                        </Typography>
                      ),
                      inputProps: { min: 0, step: 0.01 }
                    }}
                    sx={numberFieldSx}
                  />
                </Box>
              </Box>

              <Box>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                  <Label required>LENGTH (mm)</Label>
                  <TextField
                    fullWidth
                    name="Length"
                    type="number"
                    value={formData.Length}
                    onChange={handleChange}
                    required
                    disabled={loading || addItemLoading}
                    placeholder="Enter length"
                    size="small"
                    error={!!fieldErrors.Length}
                    helperText={fieldErrors.Length}
                    InputProps={{
                      endAdornment: (
                        <Typography sx={{ fontSize: '0.7rem', color: COLORS.text.secondary, ml: 0.5 }}>
                          mm
                        </Typography>
                      ),
                      inputProps: { min: 0, step: 0.01 }
                    }}
                    sx={numberFieldSx}
                  />
                </Box>
              </Box>

              <Box>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                  <Label required>DENSITY (g/cm³)</Label>
                  <TextField
                    fullWidth
                    name="Density"
                    type="number"
                    value={formData.Density}
                    onChange={handleChange}
                    required
                    disabled={loading || addItemLoading}
                    placeholder="Enter density"
                    size="small"
                    error={!!fieldErrors.Density}
                    helperText={fieldErrors.Density}
                    InputProps={{
                      endAdornment: (
                        <Typography sx={{ fontSize: '0.7rem', color: COLORS.text.secondary, ml: 0.5 }}>
                          g/cm³
                        </Typography>
                      ),
                      inputProps: { min: 0, step: 0.01 }
                    }}
                    sx={numberFieldSx}
                  />
                </Box>
              </Box>
            </Box>

            {/* Weight Preview */}
            {weight > 0 && (
              <Box sx={{
                p: 2,
                bgcolor: COLORS.primaryLight,
                borderRadius: 1.5,
                border: `1px solid ${COLORS.primary}`,
                mt: 1
              }}>
                <Typography
                  variant="subtitle2"
                  sx={{
                    fontWeight: 600,
                    color: COLORS.primaryDark,
                    mb: 1.5,
                    fontSize: '0.8rem'
                  }}
                >
                  Weight Calculation Preview
                </Typography>
                <Stack spacing={1}>
                  <Stack direction="row" justifyContent="space-between">
                    <Typography sx={{ fontSize: '0.7rem', color: COLORS.text.secondary }}>Volume:</Typography>
                    <Typography sx={{ fontSize: '0.7rem', fontWeight: 500, color: COLORS.text.primary }}>
                      {(parseFloat(formData.Thickness) * parseFloat(formData.Width) * parseFloat(formData.Length) / 1000000000).toFixed(6)} m³
                    </Typography>
                  </Stack>
                  <Stack direction="row" justifyContent="space-between">
                    <Typography sx={{ fontSize: '0.7rem', color: COLORS.text.secondary }}>Calculated Weight:</Typography>
                    <Typography sx={{ fontSize: '0.9rem', fontWeight: 700, color: COLORS.primaryDark }}>
                      {weight} kg
                    </Typography>
                  </Stack>
                </Stack>
              </Box>
            )}
          </Stack>
        </DialogContent>

        <DialogActions sx={{
          px: 2.5,
          py: 1.5,
          borderTop: `1px solid ${COLORS.border}`,
          bgcolor: COLORS.background.white,
          display: 'flex',
          justifyContent: 'flex-end',
          gap: 1
        }}>
          <Button
            onClick={handleClose}
            disabled={loading || addItemLoading}
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
            onClick={handleSubmit}
            disabled={loading || fetchingItems || addItemLoading}
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
            {loading ? 'Adding...' : 'Add Dimension'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default AddDimensions;