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
//   FormControl,
//   InputLabel,
//   Select,
//   MenuItem,
//   styled,
//   Autocomplete,
//   CircularProgress,
//   Tooltip,
//   IconButton,
//   Divider,
//   Collapse,
//   Alert,
//   InputAdornment
// } from '@mui/material';
// import {
//   Add as AddIcon,
//   NavigateNext as NavigateNextIcon,
//   NavigateBefore as NavigateBeforeIcon,
//   Error as ErrorIcon,
//   Close as CloseIcon
// } from '@mui/icons-material';
// import axios from 'axios';
// import BASE_URL from '../../../config/Config';
// import AddTax from '../taxmaster/AddTax';

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

// // Modern Stepper Connector with Gradient
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

// const steps = ['Basic Info', 'Material & Drawing', 'Process Details', 'Rate & Tax'];

// // RM Type enum options matching backend schema
// const rmTypeOptions = ['Strip', 'Profile', 'Sheet', 'Wire', 'Tube', 'Compound', 'Bar', 'Rod', 'Coil'];

// // Replace the existing unitOptions with:
// const unitOptions = ['Nos', 'Kg', 'Meter', 'Set', 'Piece', 'Sheet', 'Roll'];

// // Sale unit options
// const saleUnitOptions = ['Nos', 'Kg', 'Meter', 'Set', 'Piece', 'Sheet', 'Roll'];

// // Item category options
// const itemCategoryOptions = ['Raw Material', 'Semi-Finished', 'Finished Good', 'Consumable', 'Tool', 'Bought-Out', 'Subcontract'];

// // Item type options
// const itemTypeOptions = ['Busbar', 'Stamping', 'Gasket', 'Tooling', 'Copper Strip', 'Aluminium Profile', 'Rubber Sheet', 'Cork', 'Other'];

// // Procurement type options
// const procurementTypeOptions = ['Manufacture', 'Purchase', 'Subcontract', 'Free Issue'];

// // GST percentage options
// const gstPercentageOptions = [0, 5, 12, 18, 28];

// // Material form options
// const materialUnitOptions = ['Kg', 'Gram', 'Ton'];

// // =============================================================================
// // VALIDATION FUNCTIONS
// // =============================================================================

// const validatePartNo = (partNo) => {
//   if (!partNo?.trim()) return 'Part number is required';
//   if (partNo.length > 50) return 'Part number should not exceed 50 characters';
//   return '';
// };

// const validatePartName = (partName) => {
//   if (!partName?.trim()) return 'Part name is required';
//   if (partName.length > 100) return 'Part name should not exceed 100 characters';
//   return '';
// };

// const validatePartDescription = (desc) => {
//   if (!desc?.trim()) return 'Part description is required';
//   if (desc.length > 200) return 'Part description should not exceed 200 characters';
//   return '';
// };

// const validateItemCategory = (category) => {
//   if (!category) return 'Item category is required';
//   return '';
// };

// const validateMaterialName = (name) => {
//   if (!name?.trim()) return 'Material name is required';
//   if (name.length > 100) return 'Material name should not exceed 100 characters';
//   return '';
// };

// const validateMaterialGrade = (grade) => {
//   if (!grade?.trim()) return 'Material grade is required';
//   return '';
// };

// const validateDensity = (density) => {
//   if (!density) return 'Density is required';
//   if (isNaN(density) || density <= 0) return 'Density must be a positive number';
//   if (density > 25) return 'Density cannot exceed 25 g/cm³';
//   return '';
// };

// const validateUnit = (unit) => {
//   if (!unit) return 'Unit is required';
//   return '';
// };

// const validateSaleUnit = (unit) => {
//   if (!unit) return 'Sale unit is required';
//   return '';
// };

// const validateHsnCode = (code) => {
//   if (!code?.trim()) return 'HSN code is required';
//   return '';
// };

// const validateGstPercentage = (gst) => {
//   if (gst && (isNaN(gst) || gst < 0 || gst > 100)) return 'GST percentage must be between 0 and 100';
//   return '';
// };

// const validateThickness = (thickness) => {
//   if (thickness && (isNaN(thickness) || thickness < 0)) return 'Thickness must be a positive number';
//   return '';
// };

// const validateWidth = (width) => {
//   if (width && (isNaN(width) || width < 0)) return 'Width must be a positive number';
//   return '';
// };

// const validateLength = (length) => {
//   if (length && (isNaN(length) || length < 0)) return 'Length must be a positive number';
//   return '';
// };

// const validateReorderLevel = (level) => {
//   if (level && (isNaN(level) || level < 0)) return 'Reorder level must be a positive number';
//   return '';
// };

// const validateLeadTimeDays = (days) => {
//   if (days && (isNaN(days) || days < 0)) return 'Lead time must be a positive number';
//   return '';
// };

// const validateStripSize = (size) => {
//   if (size && (isNaN(size) || size < 0)) return 'Strip size must be a positive number';
//   return '';
// };

// const validatePitch = (pitch) => {
//   if (pitch && (isNaN(pitch) || pitch < 0)) return 'Pitch must be a positive number';
//   return '';
// };

// const validateNoOfCavity = (cavity) => {
//   if (cavity && (isNaN(cavity) || cavity < 1)) return 'Number of cavities must be at least 1';
//   return '';
// };

// const validatePercentage = (value, fieldName) => {
//   if (value && (isNaN(value) || value < 0 || value > 100)) {
//     return `${fieldName} must be between 0 and 100`;
//   }
//   return '';
// };

// const validateWeightPerUnit = (weight) => {
//   if (!weight) return 'Weight per unit is required';
//   if (isNaN(weight) || weight <= 0) return 'Weight per unit must be a positive number';
//   if (weight > 1000) return 'Weight per unit cannot exceed 1000 kg';
//   return '';
// };

// // Material validation functions
// const validateMaterialCode = (value) => {
//   if (!value?.trim()) return 'Material code is required';
//   if (value.length > 50) return 'Material code should not exceed 50 characters';
//   return '';
// };

// const validateMaterialDensity = (value) => {
//   if (value && (isNaN(value) || parseFloat(value) <= 0)) return 'Density must be a positive number';
//   return '';
// };

// const validateMaterialEffectiveRate = (value) => {
//   if (value && (isNaN(value) || parseFloat(value) <= 0)) return 'Effective rate must be a positive number';
//   return '';
// };

// // =============================================================================
// // MAIN COMPONENT
// // =============================================================================

// const AddItem = ({ open, onClose, onAdd }) => {
//   const [activeStep, setActiveStep] = useState(0);
//   const [formData, setFormData] = useState({
//     // Identity
//     part_no: '',
//     part_name: '',
//     part_description: '',
   
//     // Material specs
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
   
//     // Classification
//     item_category: '',
//     item_type: '',
//     procurement_type: '',
   
//     // Dimensions
//     thickness: '',
//     width: '',
//     length: '',
//     strip_size: '',
//     pitch: '',
//     no_of_cavity: 1,
//     weight_per_unit_kg: '', // This is for ITEM, not material
   
//     // Rejection
//     rm_rejection_percent: '',
//     scrap_realisation_percent: '',
   
//     // Tax
//     sale_unit: '',
//     hsn_code: '',
//     gst_percentage: '',
   
//     // Rate (optional)
//     rate_per_kg: '',
//     profile_conversion_rate: '',
//     scrap_percentage: '',
//     transport_loss_percentage: '',
//     date_effective: '',
//     rate_note: '',
   
//     // Drawing
//     drawing_no: '',
//     revision_no: '',
//     drawing_file_path: '',
   
//     // Inventory
//     reorder_level: '',
//     reorder_qty: '',
//     safety_stock: '',
//     min_stock: '',
//     max_stock: '',
//     lead_time_days: '',
//     shelf_life_days: ''
//   });
 
//   const [fieldErrors, setFieldErrors] = useState({});
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState('');
//   const [hsnCodes, setHsnCodes] = useState([]);
//   const [loadingHsn, setLoadingHsn] = useState(false);
//   const [selectedHSN, setSelectedHSN] = useState(null);
 
//   // State for materials
//   const [materials, setMaterials] = useState([]);
//   const [loadingMaterials, setLoadingMaterials] = useState(false);
//   const [selectedMaterial, setSelectedMaterial] = useState(null);
 
//   // State for Add Tax dialog
//   const [addTaxOpen, setAddTaxOpen] = useState(false);

//   // State for inline Add Material form
//   const [showAddMaterialForm, setShowAddMaterialForm] = useState(false);
//   const [materialFormData, setMaterialFormData] = useState({
//     MaterialCode: '',
//     MaterialName: '',
//     Density: '',
//     Unit: 'Kg',
//     Grade: '',
//     EffectiveRate: ''
//   });
//   const [materialFieldErrors, setMaterialFieldErrors] = useState({});
//   const [materialTouched, setMaterialTouched] = useState({});
//   const [addMaterialLoading, setAddMaterialLoading] = useState(false);
//   const [addMaterialError, setAddMaterialError] = useState('');

//   // Category-based visibility flags
//   const isRawMaterial = formData.item_category === 'Raw Material';
//   const isSemiFinished = formData.item_category === 'Semi-Finished';
//   const isFinishedGood = formData.item_category === 'Finished Good';
//   const isConsumable = formData.item_category === 'Consumable';
//   const isTool = formData.item_category === 'Tool';
//   const isBoughtOut = formData.item_category === 'Bought-Out';
//   const isSubcontract = formData.item_category === 'Subcontract';
 
//   // Field visibility groups
//   const showRmDetails = isRawMaterial;  // Only Raw Material has supplier details
//   const showProcessParams = isSemiFinished || isFinishedGood;  // Only manufacturing items have process params
//   const showDimensions = isRawMaterial || isSemiFinished || isFinishedGood || isBoughtOut;
//   const showInventory = !isConsumable && !isTool && !isSubcontract;
//   const showRateEntry = isRawMaterial || isSemiFinished || isFinishedGood;  // Only physical products have rates
//   const showDrawing = isFinishedGood || isSemiFinished;  // Only manufactured items have drawings
 
//   // Check if weight per unit should be shown (not shown when unit is 'Kg')
//   const showWeightPerUnit = formData.unit !== 'Kg';

//   const showError = (message) => {
//     setError(message);
//     // Auto-hide after 5 seconds
//     setTimeout(() => {
//       setError('');
//     }, 5000);
//   };

//   // Fetch HSN codes
//   useEffect(() => {
//     if (open) {
//       fetchHsnCodes();
//       fetchMaterials();
//     }
//   }, [open]);

//   const fetchHsnCodes = async () => {
//     try {
//       setLoadingHsn(true);
//       const token = localStorage.getItem('token');
//       const response = await axios.get(`${BASE_URL}/api/taxes`, {
//         headers: { 'Authorization': `Bearer ${token}` }
//       });

//       if (response.data.success) {
//         const activeHsnCodes = (response.data.data || [])
//           .filter(tax => tax.IsActive === true)
//           .map(tax => ({
//             _id: tax._id,
//             HSNCode: tax.HSNCode,
//             Description: tax.Description,
//             GSTPercentage: tax.GSTPercentage || 0
//           }));
//         setHsnCodes(activeHsnCodes);
//       }
//     } catch (err) {
//       console.error('Error fetching HSN codes:', err);
//     } finally {
//       setLoadingHsn(false);
//     }
//   };

//   // Fetch Materials
//   const fetchMaterials = async () => {
//     try {
//       setLoadingMaterials(true);
//       const token = localStorage.getItem('token');
//       const response = await axios.get(`${BASE_URL}/api/materials`, {
//         headers: { 'Authorization': `Bearer ${token}` }
//       });

//       if (response.data.success) {
//         // Filter active materials and map to required format
//         const activeMaterials = (response.data.data || [])
//           .filter(material => material.IsActive === true)
//           .map(material => ({
//             _id: material._id,
//             material_id: material.material_id,
//             MaterialCode: material.MaterialCode || '',
//             MaterialName: material.MaterialName || '',
//             MaterialNameWithCode: `${material.MaterialName || ''}${material.MaterialCode ? ` (${material.MaterialCode})` : ''}`,
//             Density: material.Density || '',
//             Unit: material.Unit || '',
//             Grade: material.Grade || '',
//             Standard: material.Standard || '',
//             Color: material.Color || '',
//             EffectiveRate: material.EffectiveRate || ''
//           }));
//         setMaterials(activeMaterials);
//       }
//     } catch (err) {
//       console.error('Error fetching materials:', err);
//     } finally {
//       setLoadingMaterials(false);
//     }
//   };

//   const handleTaxAdded = (newTax) => {
//     const newHsnCode = {
//       _id: newTax._id,
//       HSNCode: newTax.HSNCode,
//       Description: newTax.Description,
//       GSTPercentage: newTax.GSTPercentage || 0
//     };
//     setHsnCodes(prev => [...prev, newHsnCode]);
//     setSelectedHSN(newHsnCode);
//     setFormData(prev => ({
//       ...prev,
//       hsn_code: newTax.HSNCode,
//       gst_percentage: newTax.GSTPercentage || ''
//     }));
//   };

//   // Handle material selection
//   const handleMaterialChange = (event, newValue) => {
//     setSelectedMaterial(newValue);
//     if (newValue) {
//       // Auto-fill material fields from selected material
//       setFormData(prev => ({
//         ...prev,
//         material_name: newValue.MaterialName || '',
//         material_code: newValue.MaterialCode || '',
//         material_grade: newValue.Grade || '',
//         material_standard: newValue.Standard || '',
//         material_color: newValue.Color || '',
//         density: newValue.Density || '',
//         unit: newValue.Unit || '',
//         rate_per_kg: newValue.EffectiveRate || ''
//       }));
//       // Clear errors for auto-filled fields
//       setFieldErrors(prev => ({
//         ...prev,
//         material_name: '',
//         material_code: '',
//         material_grade: '',
//         material_standard: '',
//         material_color: '',
//         density: '',
//         unit: '',
//         rate_per_kg: ''
//       }));
//     } else {
//       // Clear material fields when selection is cleared
//       setFormData(prev => ({
//         ...prev,
//         material_name: '',
//         material_code: '',
//         material_grade: '',
//         material_standard: '',
//         material_color: '',
//         density: '',
//         unit: '',
//         rate_per_kg: ''
//       }));
//     }
//   };

//   // Material form handlers
//   const handleMaterialFormChange = (e) => {
//     const { name, value } = e.target;
    
//     // Clear field error when user starts typing
//     setMaterialFieldErrors(prev => ({
//       ...prev,
//       [name]: ''
//     }));
    
//     // Handle numeric fields
//     const numericFields = ['Density', 'EffectiveRate'];
    
//     if (numericFields.includes(name)) {
//       if (value === '' || /^\d*\.?\d*$/.test(value)) {
//         setMaterialFormData(prev => ({
//           ...prev,
//           [name]: value
//         }));
//       }
//     } else {
//       setMaterialFormData(prev => ({
//         ...prev,
//         [name]: value
//       }));
//     }

//     if (materialTouched[name] || value) {
//       const errorMessage = validateMaterialField(name, value);
//       setMaterialFieldErrors(prev => ({
//         ...prev,
//         [name]: errorMessage
//       }));
//     }
//   };

//   const handleMaterialBlur = (e) => {
//     const { name, value } = e.target;
//     setMaterialTouched(prev => ({
//       ...prev,
//       [name]: true
//     }));
//     const errorMessage = validateMaterialField(name, value);
//     setMaterialFieldErrors(prev => ({
//       ...prev,
//       [name]: errorMessage
//     }));
//   };

//   const validateMaterialField = (name, value) => {
//     switch (name) {
//       case 'MaterialCode':
//         return validateMaterialCode(value);
//       case 'MaterialName':
//         return validateMaterialName(value);
//       case 'Density':
//         return validateMaterialDensity(value);
//       case 'EffectiveRate':
//         return validateMaterialEffectiveRate(value);
//       default:
//         return '';
//     }
//   };

//   const validateMaterialForm = () => {
//     const errors = {};
//     let isValid = true;

//     if (!materialFormData.MaterialCode?.trim()) {
//       errors.MaterialCode = 'Material code is required';
//       isValid = false;
//     } else {
//       const error = validateMaterialField('MaterialCode', materialFormData.MaterialCode);
//       if (error) { errors.MaterialCode = error; isValid = false; }
//     }

//     if (!materialFormData.MaterialName?.trim()) {
//       errors.MaterialName = 'Material name is required';
//       isValid = false;
//     } else {
//       const error = validateMaterialField('MaterialName', materialFormData.MaterialName);
//       if (error) { errors.MaterialName = error; isValid = false; }
//     }

//     if (materialFormData.Density) {
//       const error = validateMaterialField('Density', materialFormData.Density);
//       if (error) { errors.Density = error; isValid = false; }
//     }

//     if (materialFormData.EffectiveRate) {
//       const error = validateMaterialField('EffectiveRate', materialFormData.EffectiveRate);
//       if (error) { errors.EffectiveRate = error; isValid = false; }
//     }

//     setMaterialFieldErrors(errors);
//     if (!isValid) {
//       setAddMaterialError('Please fix the errors above');
//     }
//     return isValid;
//   };

//   const handleAddMaterialSubmit = async () => {
//     if (!validateMaterialForm()) return;

//     setAddMaterialLoading(true);
//     setAddMaterialError('');

//     try {
//       const token = localStorage.getItem('token');
      
//       const requestBody = {
//         MaterialCode: materialFormData.MaterialCode,
//         MaterialName: materialFormData.MaterialName,
//         Density: materialFormData.Density ? parseFloat(materialFormData.Density) : null,
//         Unit: materialFormData.Unit,
//         Grade: materialFormData.Grade || undefined,
//         EffectiveRate: materialFormData.EffectiveRate ? parseFloat(materialFormData.EffectiveRate) : null
//       };

//       // Remove null/empty values
//       Object.keys(requestBody).forEach(key => {
//         if (requestBody[key] === null || requestBody[key] === '' || requestBody[key] === undefined) {
//           delete requestBody[key];
//         }
//       });

//       const response = await axios.post(`${BASE_URL}/api/materials`, requestBody, {
//         headers: {
//           'Authorization': `Bearer ${token}`,
//           'Content-Type': 'application/json'
//         }
//       });

//       if (response.data.success) {
//         const newMaterial = response.data.data;
        
//         // Format the new material
//         const formattedMaterial = {
//           _id: newMaterial._id,
//           material_id: newMaterial.material_id,
//           MaterialCode: newMaterial.MaterialCode || '',
//           MaterialName: newMaterial.MaterialName || '',
//           MaterialNameWithCode: `${newMaterial.MaterialName || ''}${newMaterial.MaterialCode ? ` (${newMaterial.MaterialCode})` : ''}`,
//           Density: newMaterial.Density || '',
//           Unit: newMaterial.Unit || '',
//           Grade: newMaterial.Grade || '',
//           Standard: newMaterial.Standard || '',
//           Color: newMaterial.Color || '',
//           EffectiveRate: newMaterial.EffectiveRate || ''
//         };

//         // Add to materials list
//         setMaterials(prev => [...prev, formattedMaterial]);
//         setSelectedMaterial(formattedMaterial);

//         // Auto-fill material fields
//         setFormData(prev => ({
//           ...prev,
//           material_name: formattedMaterial.MaterialName || '',
//           material_code: formattedMaterial.MaterialCode || '',
//           material_grade: formattedMaterial.Grade || '',
//           material_standard: formattedMaterial.Standard || '',
//           material_color: formattedMaterial.Color || '',
//           density: formattedMaterial.Density || '',
//           unit: formattedMaterial.Unit || '',
//           rate_per_kg: formattedMaterial.EffectiveRate || ''
//         }));

//         // Clear errors
//         setFieldErrors(prev => ({
//           ...prev,
//           material_name: '',
//           material_code: '',
//           material_grade: '',
//           material_standard: '',
//           material_color: '',
//           density: '',
//           unit: '',
//           rate_per_kg: ''
//         }));

//         // Hide add material form
//         setShowAddMaterialForm(false);
        
//         // Reset material form
//         setMaterialFormData({
//           MaterialCode: '',
//           MaterialName: '',
//           Density: '',
//           Unit: 'Kg',
//           Grade: '',
//           EffectiveRate: ''
//         });
//         setMaterialFieldErrors({});
//         setMaterialTouched({});
//         setAddMaterialError('');
//       } else {
//         setAddMaterialError(response.data.message || 'Failed to add material');
//       }
//     } catch (err) {
//       console.error('Error adding material:', err);
//       setAddMaterialError(err.response?.data?.message || 'Failed to add material. Please try again.');
//     } finally {
//       setAddMaterialLoading(false);
//     }
//   };

//   const handleChange = (e) => {
//     const { name, value } = e.target;
   
//     setFieldErrors(prev => ({ ...prev, [name]: '' }));
   
//     // Handle numeric fields
//     const numericFields = [
//       'density', 'thickness', 'width', 'length', 'gst_percentage',
//       'reorder_level', 'reorder_qty', 'lead_time_days', 'strip_size',
//       'pitch', 'no_of_cavity', 'rm_rejection_percent', 'scrap_realisation_percent',
//       'rate_per_kg', 'profile_conversion_rate', 'scrap_percentage',
//       'transport_loss_percentage', 'safety_stock', 'min_stock', 'max_stock',
//       'shelf_life_days', 'weight_per_unit_kg'
//     ];
   
//     if (numericFields.includes(name)) {
//       if (value === '' || /^\d*\.?\d*$/.test(value)) {
//         setFormData(prev => ({ ...prev, [name]: value }));
//       }
//     } else {
//       setFormData(prev => ({ ...prev, [name]: value }));
//     }
//   };

//   const handleSelectChange = (event) => {
//     const { name, value } = event.target;
//     setFieldErrors(prev => ({ ...prev, [name]: '' }));
//     setFormData(prev => ({ ...prev, [name]: value }));
//   };

//   const handleHSNChange = (event, newValue) => {
//     setSelectedHSN(newValue);
//     if (newValue) {
//       setFormData(prev => ({
//         ...prev,
//         hsn_code: newValue.HSNCode,
//         gst_percentage: newValue.GSTPercentage || ''
//       }));
//     } else {
//       setFormData(prev => ({
//         ...prev,
//         hsn_code: '',
//         gst_percentage: ''
//       }));
//     }
//   };

//   const validateField = (name, value) => {
//     switch (name) {
//       case 'part_no': return validatePartNo(value);
//       case 'part_name': return validatePartName(value);
//       case 'part_description': return validatePartDescription(value);
//       case 'item_category': return validateItemCategory(value);
//       case 'material_name': return validateMaterialName(value);
//       case 'material_grade': return validateMaterialGrade(value);
//       case 'density': return validateDensity(value);
//       case 'unit': return validateUnit(value);
//       case 'sale_unit': return validateSaleUnit(value);
//       case 'hsn_code': return validateHsnCode(value);
//       case 'gst_percentage': return validateGstPercentage(value);
//       case 'thickness': return validateThickness(value);
//       case 'width': return validateWidth(value);
//       case 'length': return validateLength(value);
//       case 'reorder_level': return validateReorderLevel(value);
//       case 'lead_time_days': return validateLeadTimeDays(value);
//       case 'strip_size': return validateStripSize(value);
//       case 'pitch': return validatePitch(value);
//       case 'no_of_cavity': return validateNoOfCavity(value);
//       case 'rm_rejection_percent': return validatePercentage(value, 'RM rejection percentage');
//       case 'scrap_realisation_percent': return validatePercentage(value, 'Scrap realisation percentage');
//       case 'weight_per_unit_kg': return validateWeightPerUnit(value);
//       default: return '';
//     }
//   };

//   const validateStep = (step) => {
//     const errors = {};
//     let isValid = true;
//     let errorMessages = [];

//     switch (step) {
//     case 0: // Basic Info
//       const partNoError = validateField('part_no', formData.part_no);
//       if (partNoError) { errors.part_no = partNoError; errorMessages.push(partNoError); isValid = false; }

//       const partNameError = validateField('part_name', formData.part_name);
//       if (partNameError) { errors.part_name = partNameError; errorMessages.push(partNameError); isValid = false; }

//       const partDescError = validateField('part_description', formData.part_description);
//       if (partDescError) { errors.part_description = partDescError; errorMessages.push(partDescError); isValid = false; }

//       const itemCategoryError = validateField('item_category', formData.item_category);
//       if (itemCategoryError) { errors.item_category = itemCategoryError; errorMessages.push(itemCategoryError); isValid = false; }

//       const saleUnitError = validateField('sale_unit', formData.sale_unit);
//       if (saleUnitError) { errors.sale_unit = saleUnitError; errorMessages.push(saleUnitError); isValid = false; }

//       if (showWeightPerUnit) {
//         const weightError = validateField('weight_per_unit_kg', formData.weight_per_unit_kg);
//         if (weightError) { errors.weight_per_unit_kg = weightError; errorMessages.push(weightError); isValid = false; }
//       }
//       break;
     
//       case 1: // Material & Drawing
//         const materialNameError = validateField('material_name', formData.material_name);
//         if (materialNameError) { errors.material_name = materialNameError; errorMessages.push(materialNameError); isValid = false; }

//         const materialGradeError = validateField('material_grade', formData.material_grade);
//         if (materialGradeError) { errors.material_grade = materialGradeError; errorMessages.push(materialGradeError); isValid = false; }

//         const densityError = validateField('density', formData.density);
//         if (densityError) { errors.density = densityError; errorMessages.push(densityError); isValid = false; }

//         const unitError = validateField('unit', formData.unit);
//         if (unitError) { errors.unit = unitError; errorMessages.push(unitError); isValid = false; }

//         const hsnCodeError = validateField('hsn_code', formData.hsn_code);
//         if (hsnCodeError) { errors.hsn_code = hsnCodeError; errorMessages.push(hsnCodeError); isValid = false; }

//         if (!formData.procurement_type) {
//           errors.procurement_type = 'Procurement type is required';
//           errorMessages.push('Procurement type is required');
//           isValid = false;
//         }
//         break;
     
//       case 2: // Process Details
//         if (showProcessParams) {
//           if (formData.pitch) {
//             const pitchError = validateField('pitch', formData.pitch);
//             if (pitchError) { errors.pitch = pitchError; errorMessages.push(pitchError); isValid = false; }
//           }

//           const cavityError = validateField('no_of_cavity', formData.no_of_cavity);
//           if (cavityError) { errors.no_of_cavity = cavityError; errorMessages.push(cavityError); isValid = false; }
//         }

//         if (formData.reorder_level) {
//           const reorderError = validateField('reorder_level', formData.reorder_level);
//           if (reorderError) { errors.reorder_level = reorderError; errorMessages.push(reorderError); isValid = false; }
//         }

//         if (formData.lead_time_days) {
//           const leadTimeError = validateField('lead_time_days', formData.lead_time_days);
//           if (leadTimeError) { errors.lead_time_days = leadTimeError; errorMessages.push(leadTimeError); isValid = false; }
//         }
//         break;
     
//       case 3: // Rate & Tax
//         if (formData.gst_percentage) {
//           const gstError = validateField('gst_percentage', formData.gst_percentage);
//           if (gstError) { errors.gst_percentage = gstError; errorMessages.push(gstError); isValid = false; }
//         }

//         if (formData.rm_rejection_percent) {
//           const rejectionError = validateField('rm_rejection_percent', formData.rm_rejection_percent);
//           if (rejectionError) { errors.rm_rejection_percent = rejectionError; errorMessages.push(rejectionError); isValid = false; }
//         }

//         if (formData.scrap_realisation_percent) {
//           const scrapError = validateField('scrap_realisation_percent', formData.scrap_realisation_percent);
//           if (scrapError) { errors.scrap_realisation_percent = scrapError; errorMessages.push(scrapError); isValid = false; }
//         }
//         break;
     
//       default:
//         return true;
//     }

//     setFieldErrors(errors);
//     if (!isValid) {
//       showError(errorMessages[0]);
//     }
//     return isValid;
//   };

//   const validateAllFields = () => {
//   const errors = {};
//   let isValid = true;
//   let errorMessages = [];

//   // Required fields (matching backend required fields)
//   const requiredFields = [
//     { name: 'part_no', label: 'Part number' },
//     { name: 'part_name', label: 'Part name' },
//     { name: 'part_description', label: 'Part description' },
//     { name: 'item_category', label: 'Item category' },
//     { name: 'material_name', label: 'Material name' },
//     { name: 'material_grade', label: 'Material grade' },
//     { name: 'density', label: 'Density' },
//     { name: 'unit', label: 'Unit' },
//     { name: 'sale_unit', label: 'Sale unit' },
//     { name: 'hsn_code', label: 'HSN code' }
//   ];

//   // Add weight_per_unit_kg to required fields only if unit is not 'Kg'
//   if (showWeightPerUnit) {
//     requiredFields.push({ name: 'weight_per_unit_kg', label: 'Weight per unit' });
//   }

//   requiredFields.forEach(field => {
//     const value = formData[field.name];
//     const isEmpty = value === undefined || value === null ||
//                     (typeof value === 'string' && value.trim() === '') ||
//                     (typeof value !== 'string' && value === '');
   
//     if (isEmpty) {
//       errors[field.name] = `${field.label} is required`;
//       errorMessages.push(`${field.label} is required`);
//       isValid = false;
//     }
//   });

//   // Optional validations for visible fields only
//   if (showDimensions && formData.thickness) {
//     const err = validateField('thickness', formData.thickness);
//     if (err) errors.thickness = err;
//   }
//   if (showDimensions && formData.width) {
//     const err = validateField('width', formData.width);
//     if (err) errors.width = err;
//   }
//   if (showDimensions && formData.length) {
//     const err = validateField('length', formData.length);
//     if (err) errors.length = err;
//   }
//   if (formData.gst_percentage) {
//     const err = validateField('gst_percentage', formData.gst_percentage);
//     if (err) errors.gst_percentage = err;
//   }
//   if (formData.reorder_level) {
//     const err = validateField('reorder_level', formData.reorder_level);
//     if (err) errors.reorder_level = err;
//   }
//   if (formData.lead_time_days) {
//     const err = validateField('lead_time_days', formData.lead_time_days);
//     if (err) errors.lead_time_days = err;
//   }
//   if (showProcessParams && formData.pitch) {
//     const err = validateField('pitch', formData.pitch);
//     if (err) errors.pitch = err;
//   }
//   if (showProcessParams && formData.no_of_cavity) {
//     const err = validateField('no_of_cavity', formData.no_of_cavity);
//     if (err) errors.no_of_cavity = err;
//   }
//   if (formData.rm_rejection_percent) {
//     const err = validateField('rm_rejection_percent', formData.rm_rejection_percent);
//     if (err) errors.rm_rejection_percent = err;
//   }
//   if (formData.scrap_realisation_percent) {
//     const err = validateField('scrap_realisation_percent', formData.scrap_realisation_percent);
//     if (err) errors.scrap_realisation_percent = err;
//   }
//   if (showRmDetails && formData.strip_size) {
//     const err = validateField('strip_size', formData.strip_size);
//     if (err) errors.strip_size = err;
//   }

//   setFieldErrors(errors);
//   if (!isValid) {
//     showError(errorMessages[0]);
//   }
//   return isValid;
// };

//   const handleNext = () => {
//     if (validateStep(activeStep)) {
//       setActiveStep((prevStep) => prevStep + 1);
//     }
//   };

//   const handleBack = () => {
//     setActiveStep((prevStep) => prevStep - 1);
//   };

//   const handleSubmit = async () => {
//     if (!validateAllFields()) return;

//     setLoading(true);

//     try {
//       const token = localStorage.getItem('token');
     
//       const submissionData = {
//         part_no: formData.part_no,
//         part_name: formData.part_name,
//         part_description: formData.part_description,
       
//         material_code: formData.material_code || undefined,
//         material_name: formData.material_name,
//         material_grade: formData.material_grade,
//         material_standard: formData.material_standard || undefined,
//         material_color: formData.material_color || undefined,
//         density: parseFloat(formData.density),
//         unit: formData.unit,
//         rm_source: showRmDetails ? (formData.rm_source || undefined) : undefined,
//         rm_type: showRmDetails ? (formData.rm_type || undefined) : undefined,
//         rm_spec: showRmDetails ? (formData.rm_spec || undefined) : undefined,
       
//         item_category: formData.item_category,
//         item_type: formData.item_type || 'Other',
//         procurement_type: formData.procurement_type || 'Manufacture',
       
//         thickness: showDimensions && formData.thickness ? parseFloat(formData.thickness) : undefined,
//         width: showDimensions && formData.width ? parseFloat(formData.width) : undefined,
//         length: showDimensions && formData.length ? parseFloat(formData.length) : undefined,
//         strip_size: showRmDetails && formData.strip_size ? parseFloat(formData.strip_size) : undefined,
//         pitch: showProcessParams && formData.pitch ? parseFloat(formData.pitch) : undefined,
//         no_of_cavity: showProcessParams && formData.no_of_cavity ? parseInt(formData.no_of_cavity) : 1,
//         weight_per_unit_kg: formData.weight_per_unit_kg ? parseFloat(formData.weight_per_unit_kg) : undefined,
       
//         rm_rejection_percent: formData.rm_rejection_percent ? parseFloat(formData.rm_rejection_percent) : 2.0,
//         scrap_realisation_percent: formData.scrap_realisation_percent ? parseFloat(formData.scrap_realisation_percent) : 85,
       
//         sale_unit: formData.sale_unit,
//         hsn_code: formData.hsn_code,
//         gst_percentage: formData.gst_percentage ? parseFloat(formData.gst_percentage) : 18,
       
//         rate_per_kg: showRateEntry && formData.rate_per_kg ? parseFloat(formData.rate_per_kg) : undefined,
//         profile_conversion_rate: showRateEntry && formData.profile_conversion_rate ? parseFloat(formData.profile_conversion_rate) : undefined,
//         scrap_percentage: showRateEntry && formData.scrap_percentage ? parseFloat(formData.scrap_percentage) : undefined,
//         transport_loss_percentage: showRateEntry && formData.transport_loss_percentage ? parseFloat(formData.transport_loss_percentage) : undefined,
//         date_effective: formData.date_effective || undefined,
//         rate_note: formData.rate_note || undefined,
       
//         drawing_no: showDrawing ? (formData.drawing_no || undefined) : undefined,
//         revision_no: showDrawing ? (formData.revision_no || '0') : undefined,
//         drawing_file_path: showDrawing ? (formData.drawing_file_path || undefined) : undefined,
       
//         reorder_level: showInventory && formData.reorder_level ? parseInt(formData.reorder_level) : undefined,
//         reorder_qty: showInventory && formData.reorder_qty ? parseInt(formData.reorder_qty) : undefined,
//         safety_stock: showInventory && formData.safety_stock ? parseInt(formData.safety_stock) : undefined,
//         min_stock: showInventory && formData.min_stock ? parseInt(formData.min_stock) : undefined,
//         max_stock: showInventory && formData.max_stock ? parseInt(formData.max_stock) : undefined,
//         lead_time_days: showInventory && formData.lead_time_days ? parseInt(formData.lead_time_days) : undefined,
//         shelf_life_days: showInventory && formData.shelf_life_days ? parseInt(formData.shelf_life_days) : undefined
//       };

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
//         onAdd(response.data.data);
//         resetForm();
//         onClose();
//       } else {
//         showError(response.data.message || 'Failed to add item');
//       }
//     } catch (err) {
//       console.error('Error adding item:', err);
//       const errorMessage = err.response?.data?.message || 'Failed to add item. Please try again.';
//       showError(errorMessage);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const resetForm = () => {
//     setFormData({
//       part_no: '',
//       part_name: '',
//       part_description: '',
//       material_code: '',
//       material_name: '',
//       material_grade: '',
//       material_standard: '',
//       material_color: '',
//       density: '',
//       unit: '',
//       rm_source: '',
//       rm_type: '',
//       rm_spec: '',
//       item_category: '',
//       item_type: '',
//       procurement_type: '',
//       thickness: '',
//       width: '',
//       length: '',
//       strip_size: '',
//       pitch: '',
//       no_of_cavity: 1,
//       weight_per_unit_kg: '',
//       rm_rejection_percent: '',
//       scrap_realisation_percent: '',
//       sale_unit: '',
//       hsn_code: '',
//       gst_percentage: '',
//       rate_per_kg: '',
//       profile_conversion_rate: '',
//       scrap_percentage: '',
//       transport_loss_percentage: '',
//       date_effective: '',
//       rate_note: '',
//       drawing_no: '',
//       revision_no: '',
//       drawing_file_path: '',
//       reorder_level: '',
//       reorder_qty: '',
//       safety_stock: '',
//       min_stock: '',
//       max_stock: '',
//       lead_time_days: '',
//       shelf_life_days: ''
//     });
//     setSelectedHSN(null);
//     setSelectedMaterial(null);
//     setFieldErrors({});
//     setError('');
//     setActiveStep(0);
//     setShowAddMaterialForm(false);
//     setMaterialFormData({
//       MaterialCode: '',
//       MaterialName: '',
//       Density: '',
//       Unit: 'Kg',
//       Grade: '',
//       EffectiveRate: ''
//     });
//     setMaterialFieldErrors({});
//     setMaterialTouched({});
//     setAddMaterialError('');
//   };

//   const handleClose = () => {
//     resetForm();
//     onClose();
//   };

//   // Shared TextField sx styles
//   const textFieldSx = {
//     '& .MuiOutlinedInput-root': {
//       borderRadius: 1.5,
//       fontSize: '0.75rem',
//       '&:hover fieldset': { borderColor: COLORS.primary },
//       '&.Mui-focused fieldset': { borderColor: COLORS.primary, borderWidth: 1 }
//     },
//     '& .MuiInputBase-input': {
//       py: 1, px: 1.5, fontSize: '0.75rem', color: COLORS.text.primary
//     },
//     '& .MuiFormHelperText-root': {
//       fontSize: '0.65rem', marginLeft: 0, marginTop: 0.25
//     }
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

//   const renderStepContent = (step) => {
//     switch (step) {
//       case 0: // Basic Info
//         return (
//           <Stack spacing={2}>
//             <Paper sx={{ p: 2, bgcolor: COLORS.background.white, borderRadius: 1.5, border: `1px solid ${COLORS.border}` }}>
//               <Typography variant="subtitle2" sx={{ color: COLORS.primary, mb: 1.5, fontWeight: 600, fontSize: '0.9rem' }}>
//                 Basic Information
//               </Typography>
             
//               <Grid container spacing={1.5}>
//                 <Grid size={{ xs: 12, md: 6 }}>
//                   <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//                     <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary, letterSpacing: '0.5px' }}>
//                       PART NUMBER <span style={{ color: '#EF4444' }}>*</span>
//                     </Typography>
//                     <TextField
//                       fullWidth size="small" name="part_no" value={formData.part_no}
//                       onChange={handleChange} required disabled={loading}
//                       placeholder="e.g., BR-001" error={!!fieldErrors.part_no}
//                       helperText={fieldErrors.part_no} inputProps={{ maxLength: 50 }}
//                       sx={textFieldSx}
//                     />
//                   </Box>
//                 </Grid>
//                 <Grid size={{ xs: 12, md: 6 }}>
//                   <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//                     <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary, letterSpacing: '0.5px' }}>
//                       PART NAME <span style={{ color: '#EF4444' }}>*</span>
//                     </Typography>
//                     <TextField
//                       fullWidth size="small" name="part_name" value={formData.part_name}
//                       onChange={handleChange} required disabled={loading}
//                       placeholder="e.g., Copper Busbar 100x10mm" error={!!fieldErrors.part_name}
//                       helperText={fieldErrors.part_name} inputProps={{ maxLength: 100 }}
//                       sx={textFieldSx}
//                     />
//                   </Box>
//                 </Grid>
//                 <Grid size={{ xs: 12, md: 4 }}>
//                   <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//                     <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary, letterSpacing: '0.5px' }}>
//                       ITEM CATEGORY <span style={{ color: '#EF4444' }}>*</span>
//                     </Typography>
//                     <FormControl fullWidth size="small" error={!!fieldErrors.item_category}>
//                       <Select name="item_category" value={formData.item_category}
//                         onChange={handleSelectChange} disabled={loading} displayEmpty sx={selectSx}>
//                         <MenuItem value="" disabled sx={{ fontSize: '0.75rem' }}>Select category</MenuItem>
//                         {itemCategoryOptions.map((option) => (
//                           <MenuItem key={option} value={option} sx={{ fontSize: '0.75rem' }}>
//                             {option}
//                             {option === 'Raw Material' && ' (What you BUY from suppliers)'}
//                             {option === 'Finished Good' && ' (What you SELL to customers)'}
//                             {option === 'Consumable' && ' (Oils, lubricants, indirect materials)'}
//                             {option === 'Tool' && ' (Molds, dies, fixtures)'}
//                             {option === 'Bought-Out' && ' (Purchase for resale)'}
//                             {option === 'Subcontract' && ' (Send outside for processing)'}
//                             {option === 'Semi-Finished' && ' (Work in Progress)'}
//                           </MenuItem>
//                         ))}
//                       </Select>
//                       {fieldErrors.item_category && (
//                         <Typography sx={{ fontSize: '0.65rem', color: '#EF4444', mt: 0.25 }}>
//                           {fieldErrors.item_category}
//                         </Typography>
//                       )}
//                     </FormControl>
//                   </Box>
//                 </Grid>
//                 <Grid size={{ xs: 12, md: 4 }}>
//                   <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//                     <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary, letterSpacing: '0.5px' }}>
//                       ITEM TYPE
//                     </Typography>
//                     <FormControl fullWidth size="small">
//                       <Select name="item_type" value={formData.item_type}
//                         onChange={handleSelectChange} disabled={loading} displayEmpty sx={selectSx}>
//                         <MenuItem value="" disabled sx={{ fontSize: '0.75rem' }}>Select type</MenuItem>
//                         {itemTypeOptions.map((option) => (
//                           <MenuItem key={option} value={option} sx={{ fontSize: '0.75rem' }}>{option}</MenuItem>
//                         ))}
//                       </Select>
//                     </FormControl>
//                     <Typography sx={{ fontSize: '0.65rem', color: COLORS.text.tertiary }}>Optional, defaults to "Other"</Typography>
//                   </Box>
//                 </Grid>
//                 <Grid size={{ xs: 12, md: 4 }}>
//                   <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//                     <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary, letterSpacing: '0.5px' }}>
//                       SALE UNIT <span style={{ color: '#EF4444' }}>*</span>
//                     </Typography>
//                     <FormControl fullWidth size="small" error={!!fieldErrors.sale_unit}>
//                       <Select name="sale_unit" value={formData.sale_unit}
//                         onChange={handleSelectChange} disabled={loading} displayEmpty sx={selectSx}>
//                         <MenuItem value="" disabled sx={{ fontSize: '0.75rem' }}>Select sale unit</MenuItem>
//                         {saleUnitOptions.map((option) => (
//                           <MenuItem key={option} value={option} sx={{ fontSize: '0.75rem' }}>{option}</MenuItem>
//                         ))}
//                       </Select>
//                       {fieldErrors.sale_unit && (
//                         <Typography sx={{ fontSize: '0.65rem', color: '#EF4444', mt: 0.25 }}>
//                           {fieldErrors.sale_unit}
//                         </Typography>
//                       )}
//                     </FormControl>
//                   </Box>
//                 </Grid>
               
//                 {showWeightPerUnit && (
//                   <Grid size={{ xs: 12, md: 4 }}>
//                     <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//                       <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary, letterSpacing: '0.5px' }}>
//                         WEIGHT PER UNIT (kg) <span style={{ color: '#EF4444' }}>*</span>
//                       </Typography>
//                       <TextField
//                         fullWidth
//                         size="small"
//                         name="weight_per_unit_kg"
//                         value={formData.weight_per_unit_kg}
//                         onChange={handleChange}
//                         required
//                         disabled={loading}
//                         placeholder="e.g., 0.85"
//                         error={!!fieldErrors.weight_per_unit_kg}
//                         helperText={fieldErrors.weight_per_unit_kg}
//                         inputProps={{
//                           step: '0.001',
//                           min: 0.001,
//                           onWheel: (e) => e.target.blur()
//                         }}
//                         sx={numberFieldSx}
//                       />
//                       <Typography sx={{ fontSize: '0.65rem', color: COLORS.text.tertiary }}>
//                         Weight per unit in kgs (required when sale unit is not Kg)
//                       </Typography>
//                     </Box>
//                   </Grid>
//                 )}
               
//                 <Grid size={{ xs: 12 }}>
//                   <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//                     <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary, letterSpacing: '0.5px' }}>
//                       PART DESCRIPTION <span style={{ color: '#EF4444' }}>*</span>
//                     </Typography>
//                     <TextField
//                       fullWidth size="small" name="part_description" value={formData.part_description}
//                       onChange={handleChange} multiline rows={2} required disabled={loading}
//                       placeholder="Enter detailed part description" error={!!fieldErrors.part_description}
//                       helperText={fieldErrors.part_description} inputProps={{ maxLength: 200 }}
//                       sx={textFieldSx}
//                     />
//                   </Box>
//                 </Grid>
//               </Grid>
//             </Paper>
//           </Stack>
//         );
     
//       case 1: // Material & Drawing
//         return (
//           <Stack spacing={2}>
//             <Paper sx={{ p: 2, bgcolor: COLORS.background.white, borderRadius: 1.5, border: `1px solid ${COLORS.border}` }}>
//               <Typography variant="subtitle2" sx={{ color: COLORS.primary, mb: 1.5, fontWeight: 600, fontSize: '0.9rem' }}>
//                 Material Information <span style={{ color: '#EF4444' }}>*</span>
//               </Typography>
             
//               {/* Material Selection Dropdown with Add New Button */}
//               <Grid container spacing={1.5} sx={{ mb: 2 }}>
//                 <Grid size={{ xs: 12 }}>
//                   <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
//                     <Box sx={{ flex: 1 }}>
//                       <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary, letterSpacing: '0.5px', mb: 0.5 }}>
//                         SELECT MATERIAL
//                       </Typography>
//                       <Autocomplete
//                         fullWidth
//                         options={materials}
//                         loading={loadingMaterials}
//                         value={selectedMaterial}
//                         onChange={handleMaterialChange}
//                         getOptionLabel={(option) => option.MaterialNameWithCode || option.MaterialName || ''}
//                         isOptionEqualToValue={(option, value) => option._id === value._id}
//                         renderInput={(params) => (
//                           <TextField
//                             {...params}
//                             size="small"
//                             placeholder={loadingMaterials ? 'Loading materials...' : 'Search or select a material'}
//                             sx={textFieldSx}
//                             InputProps={{
//                               ...params.InputProps,
//                               endAdornment: (
//                                 <>
//                                   {loadingMaterials ? <CircularProgress color="inherit" size={16} /> : null}
//                                   {params.InputProps.endAdornment}
//                                 </>
//                               ),
//                             }}
//                           />
//                         )}
//                         renderOption={(props, option) => (
//                           <li {...props}>
//                             <Box>
//                               <Typography variant="body2" fontWeight={500} sx={{ fontSize: '0.75rem' }}>
//                                 {option.MaterialName}
//                                 {option.MaterialCode && ` (${option.MaterialCode})`}
//                               </Typography>
//                               <Typography variant="caption" sx={{ fontSize: '0.7rem', color: COLORS.text.tertiary }}>
//                                 Grade: {option.Grade || 'N/A'} | Density: {option.Density || 'N/A'} {option.Unit || ''}
//                                 {option.EffectiveRate && ` | Rate: ₹${option.EffectiveRate}`}
//                               </Typography>
//                             </Box>
//                           </li>
//                         )}
//                         noOptionsText="No materials found"
//                       />
//                     </Box>
//                     <Button
//                       variant="outlined"
//                       size="small"
//                       onClick={() => setShowAddMaterialForm(!showAddMaterialForm)}
//                       disabled={loading}
//                       startIcon={showAddMaterialForm ? <CloseIcon sx={{ fontSize: '0.875rem' }} /> : <AddIcon sx={{ fontSize: '0.875rem' }} />}
//                       sx={{
//                         height: 40,
//                         minWidth: 'auto',
//                         px: 1.5,
//                         borderRadius: 1.5,
//                         border: `1px solid ${COLORS.border}`,
//                         color: COLORS.text.secondary,
//                         fontSize: '0.7rem',
//                         fontWeight: 500,
//                         textTransform: 'none',
//                         whiteSpace: 'nowrap',
//                         alignSelf: 'flex-end',
//                         '&:hover': {
//                           borderColor: COLORS.primary,
//                           bgcolor: `${COLORS.primary}10`,
//                           color: COLORS.primary
//                         }
//                       }}
//                     >
//                       {showAddMaterialForm ? 'Cancel' : 'Add New'}
//                     </Button>
//                   </Box>
//                   <Typography sx={{ fontSize: '0.65rem', color: COLORS.text.tertiary, mt: 0.5 }}>
//                     Select an existing material to auto-fill details below, or click "Add New" to create one
//                   </Typography>
//                 </Grid>
//               </Grid>

//               {/* Inline Add Material Form */}
//               {showAddMaterialForm && (
//                 <Box sx={{ mt: 2, p: 2.5, bgcolor: COLORS.background.light, borderRadius: 2, border: `1px solid ${COLORS.primary}` }}>
//                   <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
//                     <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color: COLORS.primary }}>
//                       Add New Material
//                     </Typography>
//                     <IconButton
//                       size="small"
//                       onClick={() => {
//                         setShowAddMaterialForm(false);
//                         setAddMaterialError('');
//                         setMaterialFormData({
//                           MaterialCode: '',
//                           MaterialName: '',
//                           Density: '',
//                           Unit: 'Kg',
//                           Grade: '',
//                           EffectiveRate: ''
//                         });
//                         setMaterialFieldErrors({});
//                         setMaterialTouched({});
//                       }}
//                       sx={{
//                         color: COLORS.text.tertiary,
//                         '&:hover': { color: COLORS.primary }
//                       }}
//                     >
//                       <CloseIcon sx={{ fontSize: '1rem' }} />
//                     </IconButton>
//                   </Box>

//                   <Grid container spacing={1.5}>
//                     <Grid size={{ xs: 12, sm: 6 }}>
//                       <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//                         <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary, letterSpacing: '0.5px' }}>
//                           MATERIAL CODE <span style={{ color: '#EF4444' }}>*</span>
//                         </Typography>
//                         <TextField
//                           fullWidth
//                           size="small"
//                           name="MaterialCode"
//                           value={materialFormData.MaterialCode}
//                           onChange={handleMaterialFormChange}
//                           onBlur={handleMaterialBlur}
//                           required
//                           disabled={addMaterialLoading}
//                           placeholder="e.g., AL-001"
//                           error={!!materialFieldErrors.MaterialCode}
//                           helperText={materialFieldErrors.MaterialCode}
//                           inputProps={{ maxLength: 50 }}
//                           sx={textFieldSx}
//                         />
//                       </Box>
//                     </Grid>
//                     <Grid size={{ xs: 12, sm: 6 }}>
//                       <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//                         <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary, letterSpacing: '0.5px' }}>
//                           MATERIAL NAME <span style={{ color: '#EF4444' }}>*</span>
//                         </Typography>
//                         <TextField
//                           fullWidth
//                           size="small"
//                           name="MaterialName"
//                           value={materialFormData.MaterialName}
//                           onChange={handleMaterialFormChange}
//                           onBlur={handleMaterialBlur}
//                           required
//                           disabled={addMaterialLoading}
//                           placeholder="e.g., Aluminium"
//                           error={!!materialFieldErrors.MaterialName}
//                           helperText={materialFieldErrors.MaterialName}
//                           inputProps={{ maxLength: 100 }}
//                           sx={textFieldSx}
//                         />
//                       </Box>
//                     </Grid>
//                     <Grid size={{ xs: 12, sm: 6 }}>
//                       <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//                         <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary, letterSpacing: '0.5px' }}>
//                           DENSITY (g/cm³)
//                         </Typography>
//                         <TextField
//                           fullWidth
//                           size="small"
//                           name="Density"
//                           type="number"
//                           value={materialFormData.Density}
//                           onChange={handleMaterialFormChange}
//                           onBlur={handleMaterialBlur}
//                           disabled={addMaterialLoading}
//                           placeholder="e.g., 2.7"
//                           error={!!materialFieldErrors.Density}
//                           helperText={materialFieldErrors.Density}
//                           inputProps={{
//                             step: '0.01',
//                             min: 0,
//                             onWheel: (e) => e.target.blur()
//                           }}
//                           sx={numberFieldSx}
//                         />
//                         <Typography sx={{ fontSize: '0.65rem', color: COLORS.text.tertiary }}>
//                           Optional - Leave blank if not applicable
//                         </Typography>
//                       </Box>
//                     </Grid>
//                     <Grid size={{ xs: 12, sm: 6 }}>
//                       <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//                         <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary, letterSpacing: '0.5px' }}>
//                           UNIT
//                         </Typography>
//                         <FormControl fullWidth size="small">
//                           <Select
//                             name="Unit"
//                             value={materialFormData.Unit}
//                             onChange={handleMaterialFormChange}
//                             disabled={addMaterialLoading}
//                             sx={selectSx}
//                           >
//                             {materialUnitOptions.map((option) => (
//                               <MenuItem key={option} value={option} sx={{ fontSize: '0.75rem' }}>{option}</MenuItem>
//                             ))}
//                           </Select>
//                         </FormControl>
//                       </Box>
//                     </Grid>
//                     <Grid size={{ xs: 12, sm: 6 }}>
//                       <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//                         <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary, letterSpacing: '0.5px' }}>
//                           GRADE
//                         </Typography>
//                         <TextField
//                           fullWidth
//                           size="small"
//                           name="Grade"
//                           value={materialFormData.Grade}
//                           onChange={handleMaterialFormChange}
//                           disabled={addMaterialLoading}
//                           placeholder="e.g., AA6063 T5"
//                           sx={textFieldSx}
//                         />
//                       </Box>
//                     </Grid>
//                     <Grid size={{ xs: 12, sm: 6 }}>
//                       <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//                         <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary, letterSpacing: '0.5px' }}>
//                           EFFECTIVE RATE (₹)
//                         </Typography>
//                         <TextField
//                           fullWidth
//                           size="small"
//                           name="EffectiveRate"
//                           type="number"
//                           value={materialFormData.EffectiveRate}
//                           onChange={handleMaterialFormChange}
//                           onBlur={handleMaterialBlur}
//                           disabled={addMaterialLoading}
//                           placeholder="e.g., 210.00"
//                           error={!!materialFieldErrors.EffectiveRate}
//                           helperText={materialFieldErrors.EffectiveRate}
//                           InputProps={{
//                             startAdornment: (
//                               <InputAdornment position="start">
//                                 <Typography sx={{ fontSize: '0.7rem', color: COLORS.text.tertiary }}>₹</Typography>
//                               </InputAdornment>
//                             ),
//                           }}
//                           inputProps={{
//                             step: '0.01',
//                             min: 0,
//                             onWheel: (e) => e.target.blur()
//                           }}
//                           sx={numberFieldSx}
//                         />
//                         <Typography sx={{ fontSize: '0.65rem', color: COLORS.text.tertiary }}>
//                           Optional - Leave blank if not applicable
//                         </Typography>
//                       </Box>
//                     </Grid>
//                   </Grid>

//                   {addMaterialError && (
//                     <Alert
//                       severity="error"
//                       sx={{
//                         mt: 2,
//                         borderRadius: 1.5,
//                         fontSize: '0.75rem',
//                         py: 0.5
//                       }}
//                     >
//                       {addMaterialError}
//                     </Alert>
//                   )}

//                   <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
//                     <Button
//                       onClick={() => {
//                         setShowAddMaterialForm(false);
//                         setAddMaterialError('');
//                         setMaterialFormData({
//                           MaterialCode: '',
//                           MaterialName: '',
//                           Density: '',
//                           Unit: 'Kg',
//                           Grade: '',
//                           EffectiveRate: ''
//                         });
//                         setMaterialFieldErrors({});
//                         setMaterialTouched({});
//                       }}
//                       disabled={addMaterialLoading}
//                       size="small"
//                       sx={{
//                         height: 32,
//                         px: 2,
//                         borderRadius: 1.5,
//                         border: `1px solid ${COLORS.border}`,
//                         color: COLORS.text.secondary,
//                         fontSize: '0.7rem',
//                         fontWeight: 500,
//                         textTransform: 'none',
//                         '&:hover': {
//                           borderColor: COLORS.primary,
//                           bgcolor: `${COLORS.primary}10`
//                         }
//                       }}
//                     >
//                       Cancel
//                     </Button>
//                     <Button
//                       variant="contained"
//                       onClick={handleAddMaterialSubmit}
//                       disabled={addMaterialLoading}
//                       size="small"
//                       startIcon={<AddIcon sx={{ fontSize: '1rem' }} />}
//                       sx={{
//                         height: 32,
//                         px: 2,
//                         borderRadius: 1.5,
//                         bgcolor: COLORS.primary,
//                         fontSize: '0.7rem',
//                         fontWeight: 500,
//                         textTransform: 'none',
//                         boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
//                         '&:hover': {
//                           bgcolor: COLORS.primaryDark,
//                         }
//                       }}
//                     >
//                       {addMaterialLoading ? 'Adding...' : 'Add Material'}
//                     </Button>
//                   </Box>
//                 </Box>
//               )}

//               <Divider sx={{ mb: 2 }} />

//               {/* Material Details Fields */}
//               <Grid container spacing={1.5}>
//                 <Grid size={{ xs: 12, md: 4 }}>
//                   <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//                     <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary, letterSpacing: '0.5px' }}>
//                       MATERIAL NAME <span style={{ color: '#EF4444' }}>*</span>
//                     </Typography>
//                     <TextField fullWidth size="small" name="material_name" value={formData.material_name}
//                       onChange={handleChange} required disabled={loading} placeholder="e.g., Copper"
//                       error={!!fieldErrors.material_name} helperText={fieldErrors.material_name}
//                       inputProps={{ maxLength: 100 }} sx={textFieldSx} />
//                   </Box>
//                 </Grid>
//                 <Grid size={{ xs: 12, md: 4 }}>
//                   <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//                     <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary, letterSpacing: '0.5px' }}>
//                       MATERIAL CODE
//                     </Typography>
//                     <TextField fullWidth size="small" name="material_code" value={formData.material_code}
//                       onChange={handleChange} disabled={loading} placeholder="e.g., CU-001"
//                       sx={textFieldSx} />
//                     <Typography sx={{ fontSize: '0.65rem', color: COLORS.text.tertiary }}>Optional internal code</Typography>
//                   </Box>
//                 </Grid>
//                 <Grid size={{ xs: 12, md: 4 }}>
//                   <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//                     <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary, letterSpacing: '0.5px' }}>
//                       MATERIAL GRADE <span style={{ color: '#EF4444' }}>*</span>
//                     </Typography>
//                     <TextField fullWidth size="small" name="material_grade" value={formData.material_grade}
//                       onChange={handleChange} required disabled={loading} placeholder="e.g., C11000"
//                       error={!!fieldErrors.material_grade} helperText={fieldErrors.material_grade}
//                       sx={textFieldSx} />
//                   </Box>
//                 </Grid>
//                 <Grid size={{ xs: 12, md: 4 }}>
//                   <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//                     <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary, letterSpacing: '0.5px' }}>
//                       DENSITY (g/cm³) <span style={{ color: '#EF4444' }}>*</span>
//                     </Typography>
//                     <TextField fullWidth size="small" name="density" value={formData.density}
//                       onChange={handleChange} required disabled={loading} placeholder="e.g., 8.96"
//                       error={!!fieldErrors.density} helperText={fieldErrors.density}
//                       inputProps={{ step: '0.01', min: 0.1, onWheel: (e) => e.target.blur() }}
//                       sx={numberFieldSx} />
//                   </Box>
//                 </Grid>
//                 <Grid size={{ xs: 12, md: 4 }}>
//                   <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//                     <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary, letterSpacing: '0.5px' }}>
//                       UNIT <span style={{ color: '#EF4444' }}>*</span>
//                     </Typography>
//                     <FormControl fullWidth size="small" error={!!fieldErrors.unit}>
//                       <Select name="unit" value={formData.unit}
//                         onChange={handleSelectChange} disabled={loading} displayEmpty sx={selectSx}>
//                         <MenuItem value="" disabled sx={{ fontSize: '0.75rem' }}>Select unit</MenuItem>
//                         {unitOptions.map((option) => (
//                           <MenuItem key={option} value={option} sx={{ fontSize: '0.75rem' }}>{option}</MenuItem>
//                         ))}
//                       </Select>
//                       {fieldErrors.unit && (
//                         <Typography sx={{ fontSize: '0.65rem', color: '#EF4444', mt: 0.25 }}>
//                           {fieldErrors.unit}
//                         </Typography>
//                       )}
//                     </FormControl>
//                   </Box>
//                 </Grid>

//                 <Grid size={{ xs: 12, md: 4 }}>
//                   <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//                     <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary, letterSpacing: '0.5px' }}>
//                       PROCUREMENT TYPE
//                     </Typography>
//                     <FormControl fullWidth size="small" error={!!fieldErrors.procurement_type}>
//                       <Select name="procurement_type" value={formData.procurement_type}
//                         onChange={handleSelectChange} disabled={loading} displayEmpty sx={selectSx}>
//                         <MenuItem value="" disabled sx={{ fontSize: '0.75rem' }}>Select procurement type</MenuItem>
//                         {procurementTypeOptions.map((option) => (
//                           <MenuItem key={option} value={option} sx={{ fontSize: '0.75rem' }}>{option}</MenuItem>
//                         ))}
//                       </Select>
//                       {fieldErrors.procurement_type && (
//                         <Typography sx={{ fontSize: '0.65rem', color: '#EF4444', mt: 0.25 }}>
//                           {fieldErrors.procurement_type}
//                         </Typography>
//                       )}
//                     </FormControl>
//                     <Typography sx={{ fontSize: '0.65rem', color: COLORS.text.tertiary }}>Optional, defaults to "Manufacture"</Typography>
//                   </Box>
//                 </Grid>
//                 <Grid size={{ xs: 12, md: 4 }}>
//                   <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//                     <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary, letterSpacing: '0.5px' }}>
//                       MATERIAL STANDARD
//                     </Typography>
//                     <TextField fullWidth size="small" name="material_standard" value={formData.material_standard}
//                       onChange={handleChange} disabled={loading} placeholder="e.g., ASTM B152"
//                       sx={textFieldSx} />
//                   </Box>
//                 </Grid>
//                 <Grid size={{ xs: 12, md: 4 }}>
//                   <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//                     <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary, letterSpacing: '0.5px' }}>
//                       MATERIAL COLOR
//                     </Typography>
//                     <TextField fullWidth size="small" name="material_color" value={formData.material_color}
//                       onChange={handleChange} disabled={loading} placeholder="e.g., Reddish"
//                       sx={textFieldSx} />
//                   </Box>
//                 </Grid>
//                 <Grid size={{ xs: 12, md: 4 }}>
//                   <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//                     <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary, letterSpacing: '0.5px' }}>
//                       HSN CODE <span style={{ color: '#EF4444' }}>*</span>
//                     </Typography>
//                     <Autocomplete
//                       fullWidth options={hsnCodes} loading={loadingHsn} value={selectedHSN}
//                       onChange={handleHSNChange} getOptionLabel={(option) => option.HSNCode || ''}
//                       isOptionEqualToValue={(option, value) => option._id === value._id}
//                       renderInput={(params) => (
//                         <TextField {...params} size="small" placeholder={loadingHsn ? 'Loading...' : 'Select HSN code'}
//                           error={!!fieldErrors.hsn_code} helperText={fieldErrors.hsn_code}
//                           sx={textFieldSx}
//                           InputProps={{
//                             ...params.InputProps,
//                             endAdornment: (
//                               <>
//                                 {loadingHsn ? <CircularProgress color="inherit" size={16} /> : null}
//                                 {params.InputProps.endAdornment}
//                               </>
//                             ),
//                           }}
//                         />
//                       )}
//                       renderOption={(props, option) => (
//                         <li {...props}>
//                           <Box>
//                             <Typography variant="body2" fontWeight={500} sx={{ fontSize: '0.75rem' }}>{option.HSNCode}</Typography>
//                             <Typography variant="caption" sx={{ fontSize: '0.7rem', color: COLORS.text.tertiary }}>
//                               {option.Description} (GST: {option.GSTPercentage}%)
//                             </Typography>
//                           </Box>
//                         </li>
//                       )}
//                     />
//                     <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
//                       <Typography sx={{ fontSize: '0.65rem', color: COLORS.text.tertiary }}>Select from existing or</Typography>
//                       <Button size="small" onClick={() => setAddTaxOpen(true)} sx={{ fontSize: '0.65rem', p: 0, minWidth: 'auto', color: COLORS.primary }}>
//                         Add New
//                       </Button>
//                     </Box>
//                   </Box>
//                 </Grid>
//                 <Grid size={{ xs: 12, md: 4 }}>
//                   <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//                     <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary, letterSpacing: '0.5px' }}>
//                       GST PERCENTAGE (%)
//                     </Typography>
//                     <FormControl fullWidth size="small" error={!!fieldErrors.gst_percentage}>
//                       <Select name="gst_percentage" value={formData.gst_percentage}
//                         onChange={handleSelectChange} disabled={loading} displayEmpty sx={selectSx}>
//                         <MenuItem value="" sx={{ fontSize: '0.75rem' }}>Not specified</MenuItem>
//                         {gstPercentageOptions.map((option) => (
//                           <MenuItem key={option} value={option} sx={{ fontSize: '0.75rem' }}>{option}%</MenuItem>
//                         ))}
//                       </Select>
//                       {fieldErrors.gst_percentage && (
//                         <Typography sx={{ fontSize: '0.65rem', color: '#EF4444', mt: 0.25 }}>
//                           {fieldErrors.gst_percentage}
//                         </Typography>
//                       )}
//                     </FormControl>
//                     <Typography sx={{ fontSize: '0.65rem', color: COLORS.text.tertiary }}>Auto-filled from HSN, defaults to 18%</Typography>
//                   </Box>
//                 </Grid>
//               </Grid>
//             </Paper>

//             {/* Drawing Information - Only for Finished Good & Semi-Finished */}
//             {showDrawing && (
//               <Paper sx={{ p: 2, bgcolor: COLORS.background.white, borderRadius: 1.5, border: `1px solid ${COLORS.border}` }}>
//                 <Typography variant="subtitle2" sx={{ color: COLORS.primary, mb: 1.5, fontWeight: 600, fontSize: '0.9rem' }}>
//                   Drawing Information
//                 </Typography>
//                 <Grid container spacing={1.5}>
//                   <Grid size={{ xs: 12, md: 6 }}>
//                     <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//                       <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary, letterSpacing: '0.5px' }}>
//                         DRAWING NUMBER
//                       </Typography>
//                       <TextField fullWidth size="small" name="drawing_no" value={formData.drawing_no}
//                         onChange={handleChange} disabled={loading} placeholder="e.g., DRG001" sx={textFieldSx} />
//                     </Box>
//                   </Grid>
//                   <Grid size={{ xs: 12, md: 6 }}>
//                     <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//                       <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary, letterSpacing: '0.5px' }}>
//                         REVISION NUMBER
//                       </Typography>
//                       <TextField fullWidth size="small" name="revision_no" value={formData.revision_no}
//                         onChange={handleChange} disabled={loading} placeholder="e.g., A" sx={textFieldSx} />
//                       <Typography sx={{ fontSize: '0.65rem', color: COLORS.text.tertiary }}>Defaults to "0"</Typography>
//                     </Box>
//                   </Grid>
//                 </Grid>
//               </Paper>
//             )}

//             {/* Dimensions - Show for Raw Material, Semi-Finished, Finished Good, Bought-Out */}
//             {showDimensions && (
//               <Paper sx={{ p: 2, bgcolor: COLORS.background.white, borderRadius: 1.5, border: `1px solid ${COLORS.border}` }}>
//                 <Typography variant="subtitle2" sx={{ color: COLORS.primary, mb: 1.5, fontWeight: 600, fontSize: '0.9rem' }}>
//                   {isRawMaterial ? 'Raw Material Dimensions (mm)' : isBoughtOut ? 'Product Dimensions (mm)' : 'Dimensions (mm)'}
//                 </Typography>
//                 <Grid container spacing={1.5}>
//                   <Grid size={{ xs: 12, md: 4 }}>
//                     <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//                       <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary, letterSpacing: '0.5px' }}>
//                         THICKNESS (mm)
//                       </Typography>
//                       <TextField fullWidth size="small" name="thickness" value={formData.thickness}
//                         onChange={handleChange} disabled={loading} placeholder="e.g., 10"
//                         error={!!fieldErrors.thickness} helperText={fieldErrors.thickness}
//                         inputProps={{ step: '0.01', min: 0, onWheel: (e) => e.target.blur() }}
//                         sx={numberFieldSx} />
//                     </Box>
//                   </Grid>
//                   <Grid size={{ xs: 12, md: 4 }}>
//                     <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//                       <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary, letterSpacing: '0.5px' }}>
//                         WIDTH (mm)
//                       </Typography>
//                       <TextField fullWidth size="small" name="width" value={formData.width}
//                         onChange={handleChange} disabled={loading} placeholder="e.g., 100"
//                         error={!!fieldErrors.width} helperText={fieldErrors.width}
//                         inputProps={{ step: '0.01', min: 0, onWheel: (e) => e.target.blur() }}
//                         sx={numberFieldSx} />
//                     </Box>
//                   </Grid>
//                   <Grid size={{ xs: 12, md: 4 }}>
//                     <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//                       <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary, letterSpacing: '0.5px' }}>
//                         {isRawMaterial ? 'COIL LENGTH (mm)' : 'LENGTH (mm)'}
//                       </Typography>
//                       <TextField fullWidth size="small" name="length" value={formData.length}
//                         onChange={handleChange} disabled={loading}
//                         placeholder={isRawMaterial ? "e.g., 3660" : "e.g., 1000"}
//                         error={!!fieldErrors.length} helperText={fieldErrors.length}
//                         inputProps={{ step: '0.01', min: 0, onWheel: (e) => e.target.blur() }}
//                         sx={numberFieldSx} />
//                       {!isRawMaterial && (
//                         <Typography sx={{ fontSize: '0.65rem', color: COLORS.text.tertiary }}>Defaults to 1000mm for weight calculation</Typography>
//                       )}
//                     </Box>
//                   </Grid>
//                 </Grid>
//               </Paper>
//             )}

//             {/* Raw Material Details - ONLY for Raw Material category */}
//             {showRmDetails && (
//               <Paper sx={{ p: 2, bgcolor: COLORS.background.white, borderRadius: 1.5, border: `1px solid ${COLORS.border}` }}>
//                 <Typography variant="subtitle2" sx={{ color: COLORS.primary, mb: 1.5, fontWeight: 600, fontSize: '0.9rem' }}>
//                   Raw Material Details (Supplier Information)
//                 </Typography>
//                 <Grid container spacing={1.5}>
//                   <Grid size={{ xs: 12, md: 4 }}>
//                     <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//                       <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary, letterSpacing: '0.5px' }}>
//                         RM SOURCE (Supplier)
//                       </Typography>
//                       <TextField fullWidth size="small" name="rm_source" value={formData.rm_source}
//                         onChange={handleChange} disabled={loading} placeholder="e.g., Hindalco" sx={textFieldSx} />
//                     </Box>
//                   </Grid>
//                   <Grid size={{ xs: 12, md: 4 }}>
//                     <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//                       <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary, letterSpacing: '0.5px' }}>
//                         RM TYPE
//                       </Typography>
//                       <FormControl fullWidth size="small">
//                         <Select name="rm_type" value={formData.rm_type}
//                           onChange={handleSelectChange} disabled={loading} displayEmpty sx={selectSx}>
//                           <MenuItem value="" sx={{ fontSize: '0.75rem' }}>Select RM type</MenuItem>
//                           {rmTypeOptions.map((option) => (
//                             <MenuItem key={option} value={option} sx={{ fontSize: '0.75rem' }}>{option}</MenuItem>
//                           ))}
//                         </Select>
//                       </FormControl>
//                     </Box>
//                   </Grid>
//                   <Grid size={{ xs: 12, md: 4 }}>
//                     <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//                       <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary, letterSpacing: '0.5px' }}>
//                         RM SPECIFICATION
//                       </Typography>
//                       <TextField fullWidth size="small" name="rm_spec" value={formData.rm_spec}
//                         onChange={handleChange} disabled={loading} placeholder="e.g., IS 191" sx={textFieldSx} />
//                     </Box>
//                   </Grid>
//                   <Grid size={{ xs: 12, md: 4 }}>
//                     <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//                       <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary, letterSpacing: '0.5px' }}>
//                         STRIP SIZE (mm)
//                       </Typography>
//                       <TextField fullWidth size="small" name="strip_size" value={formData.strip_size}
//                         onChange={handleChange} disabled={loading} placeholder="e.g., 3660"
//                         error={!!fieldErrors.strip_size} helperText={fieldErrors.strip_size}
//                         inputProps={{ min: 0, step: '0.01', onWheel: (e) => e.target.blur() }}
//                         sx={numberFieldSx} />
//                       <Typography sx={{ fontSize: '0.65rem', color: COLORS.text.tertiary }}>For press shop strip width</Typography>
//                     </Box>
//                   </Grid>
//                 </Grid>
//               </Paper>
//             )}
//           </Stack>
//         );
     
//       case 2: // Process Details
//         return (
//           <Stack spacing={2}>
//             {/* Process Parameters - Only for Semi-Finished & Finished Good */}
//             {showProcessParams && (
//               <Paper sx={{ p: 2, bgcolor: COLORS.background.white, borderRadius: 1.5, border: `1px solid ${COLORS.border}` }}>
//                 <Typography variant="subtitle2" sx={{ color: COLORS.primary, mb: 1.5, fontWeight: 600, fontSize: '0.9rem' }}>
//                   Manufacturing Process Parameters
//                 </Typography>
//                 <Grid container spacing={1.5}>
//                   <Grid size={{ xs: 12, md: 4 }}>
//                     <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//                       <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary, letterSpacing: '0.5px' }}>
//                         PITCH (mm)
//                       </Typography>
//                       <TextField fullWidth size="small" name="pitch" value={formData.pitch}
//                         onChange={handleChange} disabled={loading} placeholder="e.g., 42"
//                         error={!!fieldErrors.pitch} helperText={fieldErrors.pitch}
//                         inputProps={{ min: 0, step: '0.01', onWheel: (e) => e.target.blur() }}
//                         sx={numberFieldSx} />
//                       <Typography sx={{ fontSize: '0.65rem', color: COLORS.text.tertiary }}>Progressive die pitch in mm</Typography>
//                     </Box>
//                   </Grid>
//                   <Grid size={{ xs: 12, md: 4 }}>
//                     <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//                       <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary, letterSpacing: '0.5px' }}>
//                         NUMBER OF CAVITIES
//                       </Typography>
//                       <TextField fullWidth size="small" name="no_of_cavity" value={formData.no_of_cavity}
//                         onChange={handleChange} disabled={loading} type="number" placeholder="e.g., 1"
//                         error={!!fieldErrors.no_of_cavity} helperText={fieldErrors.no_of_cavity}
//                         inputProps={{ min: 1, step: 1, onWheel: (e) => e.target.blur() }}
//                         sx={numberFieldSx} />
//                     </Box>
//                   </Grid>
//                 </Grid>
//               </Paper>
//             )}

//             {/* Inventory Parameters - Show for most categories except Consumable, Tool, Subcontract */}
//             {showInventory && (
//               <Paper sx={{ p: 2, bgcolor: COLORS.background.white, borderRadius: 1.5, border: `1px solid ${COLORS.border}` }}>
//                 <Typography variant="subtitle2" sx={{ color: COLORS.primary, mb: 1.5, fontWeight: 600, fontSize: '0.9rem' }}>
//                   Inventory Control
//                 </Typography>
//                 <Grid container spacing={1.5}>
//                   <Grid size={{ xs: 12, md: 4 }}>
//                     <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//                       <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary, letterSpacing: '0.5px' }}>
//                         REORDER LEVEL
//                       </Typography>
//                       <TextField fullWidth size="small" name="reorder_level" value={formData.reorder_level}
//                         onChange={handleChange} disabled={loading} type="number" placeholder="e.g., 100"
//                         error={!!fieldErrors.reorder_level} helperText={fieldErrors.reorder_level}
//                         inputProps={{ min: 0, step: 1, onWheel: (e) => e.target.blur() }}
//                         sx={numberFieldSx} />
//                     </Box>
//                   </Grid>
//                   <Grid size={{ xs: 12, md: 4 }}>
//                     <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//                       <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary, letterSpacing: '0.5px' }}>
//                         REORDER QUANTITY
//                       </Typography>
//                       <TextField fullWidth size="small" name="reorder_qty" value={formData.reorder_qty}
//                         onChange={handleChange} disabled={loading} type="number" placeholder="e.g., 500"
//                         inputProps={{ min: 0, step: 1, onWheel: (e) => e.target.blur() }}
//                         sx={numberFieldSx} />
//                     </Box>
//                   </Grid>
//                   <Grid size={{ xs: 12, md: 4 }}>
//                     <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//                       <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary, letterSpacing: '0.5px' }}>
//                         LEAD TIME (Days)
//                       </Typography>
//                       <TextField fullWidth size="small" name="lead_time_days" value={formData.lead_time_days}
//                         onChange={handleChange} disabled={loading} type="number" placeholder="e.g., 7"
//                         error={!!fieldErrors.lead_time_days} helperText={fieldErrors.lead_time_days}
//                         inputProps={{ min: 0, step: 1, onWheel: (e) => e.target.blur() }}
//                         sx={numberFieldSx} />
//                     </Box>
//                   </Grid>
//                   <Grid size={{ xs: 12, md: 4 }}>
//                     <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//                       <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary, letterSpacing: '0.5px' }}>
//                         SAFETY STOCK
//                       </Typography>
//                       <TextField fullWidth size="small" name="safety_stock" value={formData.safety_stock}
//                         onChange={handleChange} disabled={loading} type="number" placeholder="e.g., 50"
//                         inputProps={{ min: 0, step: 1, onWheel: (e) => e.target.blur() }}
//                         sx={numberFieldSx} />
//                     </Box>
//                   </Grid>
//                   <Grid size={{ xs: 12, md: 4 }}>
//                     <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//                       <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary, letterSpacing: '0.5px' }}>
//                         MIN STOCK
//                       </Typography>
//                       <TextField fullWidth size="small" name="min_stock" value={formData.min_stock}
//                         onChange={handleChange} disabled={loading} type="number" placeholder="e.g., 50"
//                         inputProps={{ min: 0, step: 1, onWheel: (e) => e.target.blur() }}
//                         sx={numberFieldSx} />
//                     </Box>
//                   </Grid>
//                   <Grid size={{ xs: 12, md: 4 }}>
//                     <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//                       <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary, letterSpacing: '0.5px' }}>
//                         MAX STOCK
//                       </Typography>
//                       <TextField fullWidth size="small" name="max_stock" value={formData.max_stock}
//                         onChange={handleChange} disabled={loading} type="number" placeholder="e.g., 2000"
//                         inputProps={{ min: 0, step: 1, onWheel: (e) => e.target.blur() }}
//                         sx={numberFieldSx} />
//                     </Box>
//                   </Grid>
//                   <Grid size={{ xs: 12, md: 4 }}>
//                     <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//                       <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary, letterSpacing: '0.5px' }}>
//                         SHELF LIFE (Days)
//                       </Typography>
//                       <TextField fullWidth size="small" name="shelf_life_days" value={formData.shelf_life_days}
//                         onChange={handleChange} disabled={loading} type="number" placeholder="e.g., 365"
//                         inputProps={{ min: 0, step: 1, onWheel: (e) => e.target.blur() }}
//                         sx={numberFieldSx} />
//                       <Typography sx={{ fontSize: '0.65rem', color: COLORS.text.tertiary }}>0 means no expiry</Typography>
//                     </Box>
//                   </Grid>
//                 </Grid>
//               </Paper>
//             )}
//           </Stack>
//         );
     
//       case 3: // Rate & Tax
//         return (
//           <Stack spacing={2}>
//             {/* Rejection and Scrap Parameters - For all physical products */}
//             <Paper sx={{ p: 2, bgcolor: COLORS.background.white, borderRadius: 1.5, border: `1px solid ${COLORS.border}` }}>
//               <Typography variant="subtitle2" sx={{ color: COLORS.primary, mb: 1.5, fontWeight: 600, fontSize: '0.9rem' }}>
//                 Rejection & Scrap Parameters
//               </Typography>
//               <Grid container spacing={1.5}>
//                 <Grid size={{ xs: 12, md: 6 }}>
//                   <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//                     <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary, letterSpacing: '0.5px' }}>
//                       RM REJECTION PERCENTAGE (%)
//                     </Typography>
//                     <TextField fullWidth size="small" name="rm_rejection_percent" value={formData.rm_rejection_percent}
//                       onChange={handleChange} disabled={loading} placeholder="e.g., 2"
//                       error={!!fieldErrors.rm_rejection_percent} helperText={fieldErrors.rm_rejection_percent}
//                       inputProps={{ min: 0, max: 100, step: 0.1, onWheel: (e) => e.target.blur() }}
//                       sx={numberFieldSx} />
//                     <Typography sx={{ fontSize: '0.65rem', color: COLORS.text.tertiary }}>Defaults to 2.0%</Typography>
//                   </Box>
//                 </Grid>
//                 <Grid size={{ xs: 12, md: 6 }}>
//                   <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//                     <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary, letterSpacing: '0.5px' }}>
//                       SCRAP REALISATION PERCENTAGE (%)
//                     </Typography>
//                     <TextField fullWidth size="small" name="scrap_realisation_percent" value={formData.scrap_realisation_percent}
//                       onChange={handleChange} disabled={loading} placeholder="e.g., 85"
//                       error={!!fieldErrors.scrap_realisation_percent} helperText={fieldErrors.scrap_realisation_percent}
//                       inputProps={{ min: 0, max: 100, step: 0.1, onWheel: (e) => e.target.blur() }}
//                       sx={numberFieldSx} />
//                     <Typography sx={{ fontSize: '0.65rem', color: COLORS.text.tertiary }}>Defaults to 85%</Typography>
//                   </Box>
//                 </Grid>
//               </Grid>
//             </Paper>

//             {/* Rate Information - For Raw Material, Semi-Finished, Finished Good only */}
//             {showRateEntry && (
//               <Paper sx={{ p: 2, bgcolor: COLORS.background.white, borderRadius: 1.5, border: `1px solid ${COLORS.border}` }}>
//                 <Typography variant="subtitle2" sx={{ color: COLORS.primary, mb: 1.5, fontWeight: 600, fontSize: '0.9rem' }}>
//                   Rate Information (For Costing)
//                 </Typography>
//                 <Grid container spacing={1.5}>
//                   <Grid size={{ xs: 12, md: 4 }}>
//                     <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//                       <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary, letterSpacing: '0.5px' }}>
//                         RATE PER KG (₹)
//                       </Typography>
//                       <TextField fullWidth size="small" name="rate_per_kg" value={formData.rate_per_kg}
//                         onChange={handleChange} disabled={loading} placeholder="e.g., 855"
//                         inputProps={{ step: '0.01', min: 0, onWheel: (e) => e.target.blur() }}
//                         sx={numberFieldSx} />
//                       <Typography sx={{ fontSize: '0.65rem', color: COLORS.text.tertiary }}>Current market rate per kg</Typography>
//                     </Box>
//                   </Grid>
//                   <Grid size={{ xs: 12, md: 4 }}>
//                     <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//                       <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary, letterSpacing: '0.5px' }}>
//                         PROFILE CONVERSION RATE
//                       </Typography>
//                       <TextField fullWidth size="small" name="profile_conversion_rate" value={formData.profile_conversion_rate}
//                         onChange={handleChange} disabled={loading} placeholder="e.g., 25"
//                         inputProps={{ step: '0.01', min: 0, onWheel: (e) => e.target.blur() }}
//                         sx={numberFieldSx} />
//                     </Box>
//                   </Grid>
//                   <Grid size={{ xs: 12, md: 4 }}>
//                     <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//                       <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary, letterSpacing: '0.5px' }}>
//                         SCRAP PERCENTAGE (%)
//                       </Typography>
//                       <TextField fullWidth size="small" name="scrap_percentage" value={formData.scrap_percentage}
//                         onChange={handleChange} disabled={loading} placeholder="e.g., 5"
//                         inputProps={{ min: 0, max: 100, step: 0.1, onWheel: (e) => e.target.blur() }}
//                         sx={numberFieldSx} />
//                     </Box>
//                   </Grid>
//                   <Grid size={{ xs: 12, md: 4 }}>
//                     <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//                       <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary, letterSpacing: '0.5px' }}>
//                         TRANSPORT LOSS (%)
//                       </Typography>
//                       <TextField fullWidth size="small" name="transport_loss_percentage" value={formData.transport_loss_percentage}
//                         onChange={handleChange} disabled={loading} placeholder="e.g., 2"
//                         inputProps={{ min: 0, max: 100, step: 0.1, onWheel: (e) => e.target.blur() }}
//                         sx={numberFieldSx} />
//                     </Box>
//                   </Grid>
//                   <Grid size={{ xs: 12, md: 4 }}>
//                     <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//                       <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary, letterSpacing: '0.5px' }}>
//                         DATE EFFECTIVE
//                       </Typography>
//                       <TextField fullWidth size="small" name="date_effective" value={formData.date_effective}
//                         onChange={handleChange} disabled={loading} type="date"
//                         InputLabelProps={{ shrink: true }}
//                         sx={textFieldSx} />
//                     </Box>
//                   </Grid>
//                   <Grid size={{ xs: 12, md: 8 }}>
//                     <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//                       <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary, letterSpacing: '0.5px' }}>
//                         RATE NOTE
//                       </Typography>
//                       <TextField fullWidth size="small" name="rate_note" value={formData.rate_note}
//                         onChange={handleChange} disabled={loading} placeholder="e.g., Q2 2025 rate"
//                         sx={textFieldSx} />
//                     </Box>
//                   </Grid>
//                 </Grid>
//                 <Typography sx={{ fontSize: '0.65rem', color: COLORS.text.tertiary, mt: 1 }}>
//                   If rate is provided, an initial rate history entry will be created for costing
//                 </Typography>
//               </Paper>
//             )}
//           </Stack>
//         );
     
//       default:
//         return null;
//     }
//   };

//   return (
//     <>
//       <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth
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
//           py: 1.5, px: 2.5,
//           bgcolor: COLORS.background.white,
//           display: 'flex', flexDirection: 'column', gap: 1
//         }}>
//           <Typography sx={{ fontSize: '1.2rem', fontWeight: 700, color: COLORS.text.primary }}>
//             Add New Item
//           </Typography>
//           <Stepper activeStep={activeStep} alternativeLabel connector={<ColorConnector />} sx={{ mb: 0.5, mt: 0.5 }}>
//             {steps.map((label) => (
//               <Step key={label}>
//                 <StepLabel>
//                   <Typography fontWeight={500} fontSize="0.8rem" color={COLORS.text.secondary}>{label}</Typography>
//                 </StepLabel>
//               </Step>
//             ))}
//           </Stepper>
//         </DialogTitle>

//         {/* Floating Error Alert - Positioned below stepper */}
//         <Box sx={{ px: 2.5, pt: 1 }}>
//           <FloatingErrorAlert error={error} onClose={() => setError('')} />
//         </Box>

//         <DialogContent sx={{ p: 2.5, pt: error ? 1 : 2, overflow: 'auto' }}>
//           {renderStepContent(activeStep)}
//         </DialogContent>

//         <DialogActions sx={{
//           px: 2.5, py: 1.5,
//           borderTop: `1px solid ${COLORS.border}`,
//           bgcolor: COLORS.background.white,
//           display: 'flex', justifyContent: 'space-between', gap: 1
//         }}>
//           <Button onClick={handleBack} disabled={activeStep === 0 || loading}
//             startIcon={<NavigateBeforeIcon sx={{ fontSize: '1rem' }} />}
//             sx={{
//               height: 32, px: 2, borderRadius: 1.5, border: `1px solid ${COLORS.border}`,
//               color: COLORS.text.secondary, fontSize: '0.7rem', fontWeight: 500, textTransform: 'none',
//               '&:hover': { borderColor: COLORS.primary, bgcolor: `${COLORS.primary}10` },
//               '&:disabled': { borderColor: COLORS.border, color: COLORS.text.tertiary }
//             }}
//           >
//             Back
//           </Button>
//           <Box sx={{ display: 'flex', gap: 1 }}>
//             <Button onClick={handleClose} disabled={loading}
//               sx={{
//                 height: 32, px: 2, borderRadius: 1.5, border: `1px solid ${COLORS.border}`,
//                 color: COLORS.text.secondary, fontSize: '0.7rem', fontWeight: 500, textTransform: 'none',
//                 '&:hover': { borderColor: COLORS.primary, bgcolor: `${COLORS.primary}10` }
//               }}
//             >
//               Cancel
//             </Button>
//             {activeStep === steps.length - 1 ? (
//               <Button variant="contained" onClick={handleSubmit} disabled={loading}
//                 startIcon={loading ? null : <AddIcon sx={{ fontSize: '1rem' }} />}
//                 sx={{
//                   height: 32, px: 2, borderRadius: 1.5, bgcolor: COLORS.primary,
//                   fontSize: '0.7rem', fontWeight: 500, textTransform: 'none',
//                   boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
//                   '&:hover': { bgcolor: COLORS.primaryDark },
//                   '&:disabled': { bgcolor: COLORS.border, color: COLORS.text.tertiary }
//                 }}
//               >
//                 {loading ? 'Adding...' : 'Add Item'}
//               </Button>
//             ) : (
//               <Button variant="contained" onClick={handleNext} disabled={loading}
//                 endIcon={<NavigateNextIcon sx={{ fontSize: '1rem' }} />}
//                 sx={{
//                   height: 32, px: 2, borderRadius: 1.5, bgcolor: COLORS.primary,
//                   fontSize: '0.7rem', fontWeight: 500, textTransform: 'none',
//                   boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
//                   '&:hover': { bgcolor: COLORS.primaryDark },
//                   '&:disabled': { bgcolor: COLORS.border, color: COLORS.text.tertiary }
//                 }}
//               >
//                 Next
//               </Button>
//             )}
//           </Box>
//         </DialogActions>
//       </Dialog>

//       <AddTax
//         open={addTaxOpen}
//         onClose={() => setAddTaxOpen(false)}
//         onAdd={handleTaxAdded}
//       />
//     </>
//   );
// };

// export default AddItem;


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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  styled,
  Autocomplete,
  CircularProgress,
  Tooltip,
  IconButton,
  Divider,
  Collapse,
  Alert,
  InputAdornment
} from '@mui/material';
import {
  Add as AddIcon,
  NavigateNext as NavigateNextIcon,
  NavigateBefore as NavigateBeforeIcon,
  Error as ErrorIcon,
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

const steps = ['Basic Info', 'Material & Drawing', 'Process Details', 'Rate & Tax'];

// RM Type enum options matching backend schema
const rmTypeOptions = ['Strip', 'Profile', 'Sheet', 'Wire', 'Tube', 'Compound', 'Bar', 'Rod', 'Coil'];

// Replace the existing unitOptions with:
const unitOptions = ['Nos', 'Kg', 'Meter', 'Set', 'Piece', 'Sheet', 'Roll'];

// Sale unit options
const saleUnitOptions = ['Nos', 'Kg', 'Meter', 'Set', 'Piece', 'Sheet', 'Roll'];

// Item category options
const itemCategoryOptions = ['Raw Material', 'Semi-Finished', 'Finished Good', 'Consumable', 'Tool', 'Bought-Out', 'Subcontract'];

// Item type options
const itemTypeOptions = ['Busbar', 'Stamping', 'Gasket', 'Tooling', 'Copper Strip', 'Aluminium Profile', 'Rubber Sheet', 'Cork', 'Other'];

// Procurement type options
const procurementTypeOptions = ['Manufacture', 'Purchase', 'Subcontract', 'Free Issue'];

// GST percentage options
const gstPercentageOptions = [0, 5, 12, 18, 28];

// Material form options
const materialUnitOptions = ['Kg', 'Gram', 'Ton'];

// =============================================================================
// VALIDATION FUNCTIONS
// =============================================================================

const validatePartNo = (partNo) => {
  if (!partNo?.trim()) return 'Part number is required';
  if (partNo.length > 50) return 'Part number should not exceed 50 characters';
  return '';
};

const validatePartName = (partName) => {
  if (!partName?.trim()) return 'Part name is required';
  if (partName.length > 100) return 'Part name should not exceed 100 characters';
  return '';
};

const validatePartDescription = (desc) => {
  if (!desc?.trim()) return 'Part description is required';
  if (desc.length > 200) return 'Part description should not exceed 200 characters';
  return '';
};

const validateItemCategory = (category) => {
  if (!category) return 'Item category is required';
  return '';
};

const validateMaterialName = (name) => {
  if (!name?.trim()) return 'Material name is required';
  if (name.length > 100) return 'Material name should not exceed 100 characters';
  return '';
};

const validateMaterialGrade = (grade) => {
  if (!grade?.trim()) return 'Material grade is required';
  return '';
};

const validateDensity = (density) => {
  if (!density) return 'Density is required';
  if (isNaN(density) || density <= 0) return 'Density must be a positive number';
  if (density > 25) return 'Density cannot exceed 25 g/cm³';
  return '';
};

const validateUnit = (unit) => {
  if (!unit) return 'Unit is required';
  return '';
};

const validateSaleUnit = (unit) => {
  if (!unit) return 'Sale unit is required';
  return '';
};

const validateHsnCode = (code) => {
  if (!code?.trim()) return 'HSN code is required';
  return '';
};

const validateGstPercentage = (gst) => {
  if (gst && (isNaN(gst) || gst < 0 || gst > 100)) return 'GST percentage must be between 0 and 100';
  return '';
};

const validateThickness = (thickness) => {
  if (thickness && (isNaN(thickness) || thickness < 0)) return 'Thickness must be a positive number';
  return '';
};

const validateWidth = (width) => {
  if (width && (isNaN(width) || width < 0)) return 'Width must be a positive number';
  return '';
};

const validateLength = (length) => {
  if (length && (isNaN(length) || length < 0)) return 'Length must be a positive number';
  return '';
};

const validateReorderLevel = (level) => {
  if (level && (isNaN(level) || level < 0)) return 'Reorder level must be a positive number';
  return '';
};

const validateLeadTimeDays = (days) => {
  if (days && (isNaN(days) || days < 0)) return 'Lead time must be a positive number';
  return '';
};

const validateStripSize = (size) => {
  if (size && (isNaN(size) || size < 0)) return 'Strip size must be a positive number';
  return '';
};

const validatePitch = (pitch) => {
  if (pitch && (isNaN(pitch) || pitch < 0)) return 'Pitch must be a positive number';
  return '';
};

const validateNoOfCavity = (cavity) => {
  if (cavity && (isNaN(cavity) || cavity < 1)) return 'Number of cavities must be at least 1';
  return '';
};

const validatePercentage = (value, fieldName) => {
  if (value && (isNaN(value) || value < 0 || value > 100)) {
    return `${fieldName} must be between 0 and 100`;
  }
  return '';
};

const validateWeightPerUnit = (weight) => {
  if (!weight) return 'Weight per unit is required';
  if (isNaN(weight) || weight <= 0) return 'Weight per unit must be a positive number';
  if (weight > 1000) return 'Weight per unit cannot exceed 1000 kg';
  return '';
};

// Material validation functions
const validateMaterialCode = (value) => {
  if (!value?.trim()) return 'Material code is required';
  if (value.length > 50) return 'Material code should not exceed 50 characters';
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

// Tax validation functions
const validateTaxHSNCode = (value) => {
  if (!value?.trim()) return 'HSN code is required';
  if (value.length < 4) return 'HSN code must be at least 4 characters';
  if (value.length > 8) return 'HSN code should not exceed 8 characters';
  return '';
};

const validateTaxDescription = (value) => {
  if (!value?.trim()) return 'Description is required';
  if (value.length > 200) return 'Description should not exceed 200 characters';
  return '';
};

const validateTaxGST = (value) => {
  if (!value) return 'GST percentage is required';
  if (isNaN(value) || parseFloat(value) < 0 || parseFloat(value) > 100) {
    return 'GST percentage must be between 0 and 100';
  }
  return '';
};

// =============================================================================
// MAIN COMPONENT
// =============================================================================

const AddItem = ({ open, onClose, onAdd }) => {
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState({
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
    rm_source: '',
    rm_type: '',
    rm_spec: '',
   
    // Classification
    item_category: '',
    item_type: '',
    procurement_type: '',
   
    // Dimensions
    thickness: '',
    width: '',
    length: '',
    strip_size: '',
    pitch: '',
    no_of_cavity: 1,
    weight_per_unit_kg: '', // This is for ITEM, not material
   
    // Rejection
    rm_rejection_percent: '',
    scrap_realisation_percent: '',
   
    // Tax
    sale_unit: '',
    hsn_code: '',
    gst_percentage: '',
   
    // Rate (optional)
    rate_per_kg: '',
    profile_conversion_rate: '',
    scrap_percentage: '',
    transport_loss_percentage: '',
    date_effective: '',
    rate_note: '',
   
    // Drawing
    drawing_no: '',
    revision_no: '',
    drawing_file_path: '',
   
    // Inventory
    reorder_level: '',
    reorder_qty: '',
    safety_stock: '',
    min_stock: '',
    max_stock: '',
    lead_time_days: '',
    shelf_life_days: ''
  });
 
  const [fieldErrors, setFieldErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [hsnCodes, setHsnCodes] = useState([]);
  const [loadingHsn, setLoadingHsn] = useState(false);
  const [selectedHSN, setSelectedHSN] = useState(null);
 
  // State for materials
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

  // State for inline Add Tax form
  const [showAddTaxForm, setShowAddTaxForm] = useState(false);
  const [taxFormData, setTaxFormData] = useState({
    HSNCode: '',
    Description: '',
    GSTPercentage: ''
  });
  const [taxFieldErrors, setTaxFieldErrors] = useState({});
  const [taxTouched, setTaxTouched] = useState({});
  const [addTaxLoading, setAddTaxLoading] = useState(false);
  const [addTaxError, setAddTaxError] = useState('');

  // Category-based visibility flags
  const isRawMaterial = formData.item_category === 'Raw Material';
  const isSemiFinished = formData.item_category === 'Semi-Finished';
  const isFinishedGood = formData.item_category === 'Finished Good';
  const isConsumable = formData.item_category === 'Consumable';
  const isTool = formData.item_category === 'Tool';
  const isBoughtOut = formData.item_category === 'Bought-Out';
  const isSubcontract = formData.item_category === 'Subcontract';
 
  // Field visibility groups
  const showRmDetails = isRawMaterial;  // Only Raw Material has supplier details
  const showProcessParams = isSemiFinished || isFinishedGood;  // Only manufacturing items have process params
  const showDimensions = isRawMaterial || isSemiFinished || isFinishedGood || isBoughtOut;
  const showInventory = !isConsumable && !isTool && !isSubcontract;
  const showRateEntry = isRawMaterial || isSemiFinished || isFinishedGood;  // Only physical products have rates
  const showDrawing = isFinishedGood || isSemiFinished;  // Only manufactured items have drawings
 
  // Check if weight per unit should be shown (not shown when unit is 'Kg')
  const showWeightPerUnit = formData.unit !== 'Kg';

  const showError = (message) => {
    setError(message);
    // Auto-hide after 5 seconds
    setTimeout(() => {
      setError('');
    }, 5000);
  };

  // Fetch HSN codes
  useEffect(() => {
    if (open) {
      fetchHsnCodes();
      fetchMaterials();
    }
  }, [open]);

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

  // Fetch Materials
  const fetchMaterials = async () => {
    try {
      setLoadingMaterials(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(`${BASE_URL}/api/materials`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.data.success) {
        // Filter active materials and map to required format
        const activeMaterials = (response.data.data || [])
          .filter(material => material.IsActive === true)
          .map(material => ({
            _id: material._id,
            material_id: material.material_id,
            MaterialCode: material.MaterialCode || '',
            MaterialName: material.MaterialName || '',
            MaterialNameWithCode: `${material.MaterialName || ''}${material.MaterialCode ? ` (${material.MaterialCode})` : ''}`,
            Density: material.Density || '',
            Unit: material.Unit || '',
            Grade: material.Grade || '',
            Standard: material.Standard || '',
            Color: material.Color || '',
            EffectiveRate: material.EffectiveRate || ''
          }));
        setMaterials(activeMaterials);
      }
    } catch (err) {
      console.error('Error fetching materials:', err);
    } finally {
      setLoadingMaterials(false);
    }
  };

  // ======================== TAX FORM HANDLERS ========================

  const handleTaxFormChange = (e) => {
    const { name, value } = e.target;
    
    // Clear field error when user starts typing
    setTaxFieldErrors(prev => ({
      ...prev,
      [name]: ''
    }));
    
    // Handle uppercase for HSNCode
    let processedValue = value;
    if (name === 'HSNCode') {
      processedValue = value.toUpperCase();
    }
    
    setTaxFormData(prev => ({
      ...prev,
      [name]: processedValue
    }));

    if (taxTouched[name] || value) {
      const errorMessage = validateTaxField(name, processedValue);
      setTaxFieldErrors(prev => ({
        ...prev,
        [name]: errorMessage
      }));
    }
  };

  const handleTaxBlur = (e) => {
    const { name, value } = e.target;
    setTaxTouched(prev => ({
      ...prev,
      [name]: true
    }));
    const errorMessage = validateTaxField(name, value);
    setTaxFieldErrors(prev => ({
      ...prev,
      [name]: errorMessage
    }));
  };

  const validateTaxField = (name, value) => {
    switch (name) {
      case 'HSNCode':
        return validateTaxHSNCode(value);
      case 'Description':
        return validateTaxDescription(value);
      case 'GSTPercentage':
        return validateTaxGST(value);
      default:
        return '';
    }
  };

  const validateTaxForm = () => {
    const errors = {};
    let isValid = true;

    const hsnError = validateTaxField('HSNCode', taxFormData.HSNCode);
    if (hsnError) { errors.HSNCode = hsnError; isValid = false; }

    const descError = validateTaxField('Description', taxFormData.Description);
    if (descError) { errors.Description = descError; isValid = false; }

    const gstError = validateTaxField('GSTPercentage', taxFormData.GSTPercentage);
    if (gstError) { errors.GSTPercentage = gstError; isValid = false; }

    setTaxFieldErrors(errors);
    if (!isValid) {
      setAddTaxError('Please fix the errors above');
    }
    return isValid;
  };

  const handleAddTaxSubmit = async () => {
    if (!validateTaxForm()) return;

    setAddTaxLoading(true);
    setAddTaxError('');

    try {
      const token = localStorage.getItem('token');
      
      const requestBody = {
        HSNCode: taxFormData.HSNCode,
        Description: taxFormData.Description,
        GSTPercentage: parseFloat(taxFormData.GSTPercentage),
        IsActive: true
      };

      const response = await axios.post(`${BASE_URL}/api/taxes`, requestBody, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.data.success) {
        const newTax = response.data.data;
        
        // Format the new HSN code
        const newHsnCode = {
          _id: newTax._id,
          HSNCode: newTax.HSNCode,
          Description: newTax.Description,
          GSTPercentage: newTax.GSTPercentage || 0
        };

        // Add to HSN codes list
        setHsnCodes(prev => [...prev, newHsnCode]);
        setSelectedHSN(newHsnCode);
        
        // Auto-fill form fields
        setFormData(prev => ({
          ...prev,
          hsn_code: newTax.HSNCode,
          gst_percentage: newTax.GSTPercentage || ''
        }));

        // Clear field errors
        setFieldErrors(prev => ({
          ...prev,
          hsn_code: '',
          gst_percentage: ''
        }));

        // Hide add tax form
        setShowAddTaxForm(false);
        
        // Reset tax form
        setTaxFormData({
          HSNCode: '',
          Description: '',
          GSTPercentage: ''
        });
        setTaxFieldErrors({});
        setTaxTouched({});
        setAddTaxError('');
      } else {
        setAddTaxError(response.data.message || 'Failed to add HSN code');
      }
    } catch (err) {
      console.error('Error adding HSN code:', err);
      setAddTaxError(err.response?.data?.message || 'Failed to add HSN code. Please try again.');
    } finally {
      setAddTaxLoading(false);
    }
  };

  // Handle material selection
  const handleMaterialChange = (event, newValue) => {
    setSelectedMaterial(newValue);
    if (newValue) {
      // Auto-fill material fields from selected material
      setFormData(prev => ({
        ...prev,
        material_name: newValue.MaterialName || '',
        material_code: newValue.MaterialCode || '',
        material_grade: newValue.Grade || '',
        material_standard: newValue.Standard || '',
        material_color: newValue.Color || '',
        density: newValue.Density || '',
        unit: newValue.Unit || '',
        rate_per_kg: newValue.EffectiveRate || ''
      }));
      // Clear errors for auto-filled fields
      setFieldErrors(prev => ({
        ...prev,
        material_name: '',
        material_code: '',
        material_grade: '',
        material_standard: '',
        material_color: '',
        density: '',
        unit: '',
        rate_per_kg: ''
      }));
    } else {
      // Clear material fields when selection is cleared
      setFormData(prev => ({
        ...prev,
        material_name: '',
        material_code: '',
        material_grade: '',
        material_standard: '',
        material_color: '',
        density: '',
        unit: '',
        rate_per_kg: ''
      }));
    }
  };

  // Material form handlers
  const handleMaterialFormChange = (e) => {
    const { name, value } = e.target;
    
    // Clear field error when user starts typing
    setMaterialFieldErrors(prev => ({
      ...prev,
      [name]: ''
    }));
    
    // Handle numeric fields
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
          Standard: newMaterial.Standard || '',
          Color: newMaterial.Color || '',
          EffectiveRate: newMaterial.EffectiveRate || ''
        };

        // Add to materials list
        setMaterials(prev => [...prev, formattedMaterial]);
        setSelectedMaterial(formattedMaterial);

        // Auto-fill material fields
        setFormData(prev => ({
          ...prev,
          material_name: formattedMaterial.MaterialName || '',
          material_code: formattedMaterial.MaterialCode || '',
          material_grade: formattedMaterial.Grade || '',
          material_standard: formattedMaterial.Standard || '',
          material_color: formattedMaterial.Color || '',
          density: formattedMaterial.Density || '',
          unit: formattedMaterial.Unit || '',
          rate_per_kg: formattedMaterial.EffectiveRate || ''
        }));

        // Clear errors
        setFieldErrors(prev => ({
          ...prev,
          material_name: '',
          material_code: '',
          material_grade: '',
          material_standard: '',
          material_color: '',
          density: '',
          unit: '',
          rate_per_kg: ''
        }));

        // Hide add material form
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

  const handleChange = (e) => {
    const { name, value } = e.target;
   
    setFieldErrors(prev => ({ ...prev, [name]: '' }));
   
    // Handle numeric fields
    const numericFields = [
      'density', 'thickness', 'width', 'length', 'gst_percentage',
      'reorder_level', 'reorder_qty', 'lead_time_days', 'strip_size',
      'pitch', 'no_of_cavity', 'rm_rejection_percent', 'scrap_realisation_percent',
      'rate_per_kg', 'profile_conversion_rate', 'scrap_percentage',
      'transport_loss_percentage', 'safety_stock', 'min_stock', 'max_stock',
      'shelf_life_days', 'weight_per_unit_kg'
    ];
   
    if (numericFields.includes(name)) {
      if (value === '' || /^\d*\.?\d*$/.test(value)) {
        setFormData(prev => ({ ...prev, [name]: value }));
      }
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSelectChange = (event) => {
    const { name, value } = event.target;
    setFieldErrors(prev => ({ ...prev, [name]: '' }));
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleHSNChange = (event, newValue) => {
    setSelectedHSN(newValue);
    if (newValue) {
      setFormData(prev => ({
        ...prev,
        hsn_code: newValue.HSNCode,
        gst_percentage: newValue.GSTPercentage || ''
      }));
      setFieldErrors(prev => ({ ...prev, hsn_code: '' }));
    } else {
      setFormData(prev => ({
        ...prev,
        hsn_code: '',
        gst_percentage: ''
      }));
    }
  };

  const validateField = (name, value) => {
    switch (name) {
      case 'part_no': return validatePartNo(value);
      case 'part_name': return validatePartName(value);
      case 'part_description': return validatePartDescription(value);
      case 'item_category': return validateItemCategory(value);
      case 'material_name': return validateMaterialName(value);
      case 'material_grade': return validateMaterialGrade(value);
      case 'density': return validateDensity(value);
      case 'unit': return validateUnit(value);
      case 'sale_unit': return validateSaleUnit(value);
      case 'hsn_code': return validateHsnCode(value);
      case 'gst_percentage': return validateGstPercentage(value);
      case 'thickness': return validateThickness(value);
      case 'width': return validateWidth(value);
      case 'length': return validateLength(value);
      case 'reorder_level': return validateReorderLevel(value);
      case 'lead_time_days': return validateLeadTimeDays(value);
      case 'strip_size': return validateStripSize(value);
      case 'pitch': return validatePitch(value);
      case 'no_of_cavity': return validateNoOfCavity(value);
      case 'rm_rejection_percent': return validatePercentage(value, 'RM rejection percentage');
      case 'scrap_realisation_percent': return validatePercentage(value, 'Scrap realisation percentage');
      case 'weight_per_unit_kg': return validateWeightPerUnit(value);
      default: return '';
    }
  };

  const validateStep = (step) => {
    const errors = {};
    let isValid = true;
    let errorMessages = [];

    switch (step) {
    case 0: // Basic Info
      const partNoError = validateField('part_no', formData.part_no);
      if (partNoError) { errors.part_no = partNoError; errorMessages.push(partNoError); isValid = false; }

      const partNameError = validateField('part_name', formData.part_name);
      if (partNameError) { errors.part_name = partNameError; errorMessages.push(partNameError); isValid = false; }

      const partDescError = validateField('part_description', formData.part_description);
      if (partDescError) { errors.part_description = partDescError; errorMessages.push(partDescError); isValid = false; }

      const itemCategoryError = validateField('item_category', formData.item_category);
      if (itemCategoryError) { errors.item_category = itemCategoryError; errorMessages.push(itemCategoryError); isValid = false; }

      const saleUnitError = validateField('sale_unit', formData.sale_unit);
      if (saleUnitError) { errors.sale_unit = saleUnitError; errorMessages.push(saleUnitError); isValid = false; }

      if (showWeightPerUnit) {
        const weightError = validateField('weight_per_unit_kg', formData.weight_per_unit_kg);
        if (weightError) { errors.weight_per_unit_kg = weightError; errorMessages.push(weightError); isValid = false; }
      }
      break;
     
      case 1: // Material & Drawing
        const materialNameError = validateField('material_name', formData.material_name);
        if (materialNameError) { errors.material_name = materialNameError; errorMessages.push(materialNameError); isValid = false; }

        const materialGradeError = validateField('material_grade', formData.material_grade);
        if (materialGradeError) { errors.material_grade = materialGradeError; errorMessages.push(materialGradeError); isValid = false; }

        const densityError = validateField('density', formData.density);
        if (densityError) { errors.density = densityError; errorMessages.push(densityError); isValid = false; }

        const unitError = validateField('unit', formData.unit);
        if (unitError) { errors.unit = unitError; errorMessages.push(unitError); isValid = false; }

        const hsnCodeError = validateField('hsn_code', formData.hsn_code);
        if (hsnCodeError) { errors.hsn_code = hsnCodeError; errorMessages.push(hsnCodeError); isValid = false; }

        if (!formData.procurement_type) {
          errors.procurement_type = 'Procurement type is required';
          errorMessages.push('Procurement type is required');
          isValid = false;
        }
        break;
     
      case 2: // Process Details
        if (showProcessParams) {
          if (formData.pitch) {
            const pitchError = validateField('pitch', formData.pitch);
            if (pitchError) { errors.pitch = pitchError; errorMessages.push(pitchError); isValid = false; }
          }

          const cavityError = validateField('no_of_cavity', formData.no_of_cavity);
          if (cavityError) { errors.no_of_cavity = cavityError; errorMessages.push(cavityError); isValid = false; }
        }

        if (formData.reorder_level) {
          const reorderError = validateField('reorder_level', formData.reorder_level);
          if (reorderError) { errors.reorder_level = reorderError; errorMessages.push(reorderError); isValid = false; }
        }

        if (formData.lead_time_days) {
          const leadTimeError = validateField('lead_time_days', formData.lead_time_days);
          if (leadTimeError) { errors.lead_time_days = leadTimeError; errorMessages.push(leadTimeError); isValid = false; }
        }
        break;
     
      case 3: // Rate & Tax
        if (formData.gst_percentage) {
          const gstError = validateField('gst_percentage', formData.gst_percentage);
          if (gstError) { errors.gst_percentage = gstError; errorMessages.push(gstError); isValid = false; }
        }

        if (formData.rm_rejection_percent) {
          const rejectionError = validateField('rm_rejection_percent', formData.rm_rejection_percent);
          if (rejectionError) { errors.rm_rejection_percent = rejectionError; errorMessages.push(rejectionError); isValid = false; }
        }

        if (formData.scrap_realisation_percent) {
          const scrapError = validateField('scrap_realisation_percent', formData.scrap_realisation_percent);
          if (scrapError) { errors.scrap_realisation_percent = scrapError; errorMessages.push(scrapError); isValid = false; }
        }
        break;
     
      default:
        return true;
    }

    setFieldErrors(errors);
    if (!isValid) {
      showError(errorMessages[0]);
    }
    return isValid;
  };

  const validateAllFields = () => {
  const errors = {};
  let isValid = true;
  let errorMessages = [];

  // Required fields (matching backend required fields)
  const requiredFields = [
    { name: 'part_no', label: 'Part number' },
    { name: 'part_name', label: 'Part name' },
    { name: 'part_description', label: 'Part description' },
    { name: 'item_category', label: 'Item category' },
    { name: 'material_name', label: 'Material name' },
    { name: 'material_grade', label: 'Material grade' },
    { name: 'density', label: 'Density' },
    { name: 'unit', label: 'Unit' },
    { name: 'sale_unit', label: 'Sale unit' },
    { name: 'hsn_code', label: 'HSN code' }
  ];

  // Add weight_per_unit_kg to required fields only if unit is not 'Kg'
  if (showWeightPerUnit) {
    requiredFields.push({ name: 'weight_per_unit_kg', label: 'Weight per unit' });
  }

  requiredFields.forEach(field => {
    const value = formData[field.name];
    const isEmpty = value === undefined || value === null ||
                    (typeof value === 'string' && value.trim() === '') ||
                    (typeof value !== 'string' && value === '');
   
    if (isEmpty) {
      errors[field.name] = `${field.label} is required`;
      errorMessages.push(`${field.label} is required`);
      isValid = false;
    }
  });

  // Optional validations for visible fields only
  if (showDimensions && formData.thickness) {
    const err = validateField('thickness', formData.thickness);
    if (err) errors.thickness = err;
  }
  if (showDimensions && formData.width) {
    const err = validateField('width', formData.width);
    if (err) errors.width = err;
  }
  if (showDimensions && formData.length) {
    const err = validateField('length', formData.length);
    if (err) errors.length = err;
  }
  if (formData.gst_percentage) {
    const err = validateField('gst_percentage', formData.gst_percentage);
    if (err) errors.gst_percentage = err;
  }
  if (formData.reorder_level) {
    const err = validateField('reorder_level', formData.reorder_level);
    if (err) errors.reorder_level = err;
  }
  if (formData.lead_time_days) {
    const err = validateField('lead_time_days', formData.lead_time_days);
    if (err) errors.lead_time_days = err;
  }
  if (showProcessParams && formData.pitch) {
    const err = validateField('pitch', formData.pitch);
    if (err) errors.pitch = err;
  }
  if (showProcessParams && formData.no_of_cavity) {
    const err = validateField('no_of_cavity', formData.no_of_cavity);
    if (err) errors.no_of_cavity = err;
  }
  if (formData.rm_rejection_percent) {
    const err = validateField('rm_rejection_percent', formData.rm_rejection_percent);
    if (err) errors.rm_rejection_percent = err;
  }
  if (formData.scrap_realisation_percent) {
    const err = validateField('scrap_realisation_percent', formData.scrap_realisation_percent);
    if (err) errors.scrap_realisation_percent = err;
  }
  if (showRmDetails && formData.strip_size) {
    const err = validateField('strip_size', formData.strip_size);
    if (err) errors.strip_size = err;
  }

  setFieldErrors(errors);
  if (!isValid) {
    showError(errorMessages[0]);
  }
  return isValid;
};

  const handleNext = () => {
    if (validateStep(activeStep)) {
      setActiveStep((prevStep) => prevStep + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handleSubmit = async () => {
    if (!validateAllFields()) return;

    setLoading(true);

    try {
      const token = localStorage.getItem('token');
     
      const submissionData = {
        part_no: formData.part_no,
        part_name: formData.part_name,
        part_description: formData.part_description,
       
        material_code: formData.material_code || undefined,
        material_name: formData.material_name,
        material_grade: formData.material_grade,
        material_standard: formData.material_standard || undefined,
        material_color: formData.material_color || undefined,
        density: parseFloat(formData.density),
        unit: formData.unit,
        rm_source: showRmDetails ? (formData.rm_source || undefined) : undefined,
        rm_type: showRmDetails ? (formData.rm_type || undefined) : undefined,
        rm_spec: showRmDetails ? (formData.rm_spec || undefined) : undefined,
        rm_grade: formData.material_grade,
       
        item_category: formData.item_category,
        item_type: formData.item_type || 'Other',
        procurement_type: formData.procurement_type || 'Manufacture',
       
        thickness: showDimensions && formData.thickness ? parseFloat(formData.thickness) : undefined,
        width: showDimensions && formData.width ? parseFloat(formData.width) : undefined,
        length: showDimensions && formData.length ? parseFloat(formData.length) : undefined,
        strip_size: showRmDetails && formData.strip_size ? parseFloat(formData.strip_size) : undefined,
        pitch: showProcessParams && formData.pitch ? parseFloat(formData.pitch) : undefined,
        no_of_cavity: showProcessParams && formData.no_of_cavity ? parseInt(formData.no_of_cavity) : 1,
        weight_per_unit_kg: formData.weight_per_unit_kg ? parseFloat(formData.weight_per_unit_kg) : undefined,
       
        rm_rejection_percent: formData.rm_rejection_percent ? parseFloat(formData.rm_rejection_percent) : 2.0,
        scrap_realisation_percent: formData.scrap_realisation_percent ? parseFloat(formData.scrap_realisation_percent) : 85,
       
        sale_unit: formData.sale_unit,
        hsn_code: formData.hsn_code,
        gst_percentage: formData.gst_percentage ? parseFloat(formData.gst_percentage) : 18,
       
        rate_per_kg: showRateEntry && formData.rate_per_kg ? parseFloat(formData.rate_per_kg) : undefined,
        profile_conversion_rate: showRateEntry && formData.profile_conversion_rate ? parseFloat(formData.profile_conversion_rate) : undefined,
        scrap_percentage: showRateEntry && formData.scrap_percentage ? parseFloat(formData.scrap_percentage) : undefined,
        transport_loss_percentage: showRateEntry && formData.transport_loss_percentage ? parseFloat(formData.transport_loss_percentage) : undefined,
        date_effective: formData.date_effective || undefined,
        rate_note: formData.rate_note || undefined,
       
        drawing_no: showDrawing ? (formData.drawing_no || undefined) : undefined,
        revision_no: showDrawing ? (formData.revision_no || '0') : undefined,
        drawing_file_path: showDrawing ? (formData.drawing_file_path || undefined) : undefined,
       
        reorder_level: showInventory && formData.reorder_level ? parseInt(formData.reorder_level) : undefined,
        reorder_qty: showInventory && formData.reorder_qty ? parseInt(formData.reorder_qty) : undefined,
        safety_stock: showInventory && formData.safety_stock ? parseInt(formData.safety_stock) : undefined,
        min_stock: showInventory && formData.min_stock ? parseInt(formData.min_stock) : undefined,
        max_stock: showInventory && formData.max_stock ? parseInt(formData.max_stock) : undefined,
        lead_time_days: showInventory && formData.lead_time_days ? parseInt(formData.lead_time_days) : undefined,
        shelf_life_days: showInventory && formData.shelf_life_days ? parseInt(formData.shelf_life_days) : undefined
      };

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
        onAdd(response.data.data);
        resetForm();
        onClose();
      } else {
        showError(response.data.message || 'Failed to add item');
      }
    } catch (err) {
      console.error('Error adding item:', err);
      const errorMessage = err.response?.data?.message || 'Failed to add item. Please try again.';
      showError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
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
      rm_source: '',
      rm_type: '',
      rm_spec: '',
      item_category: '',
      item_type: '',
      procurement_type: '',
      thickness: '',
      width: '',
      length: '',
      strip_size: '',
      pitch: '',
      no_of_cavity: 1,
      weight_per_unit_kg: '',
      rm_rejection_percent: '',
      scrap_realisation_percent: '',
      sale_unit: '',
      hsn_code: '',
      gst_percentage: '',
      rate_per_kg: '',
      profile_conversion_rate: '',
      scrap_percentage: '',
      transport_loss_percentage: '',
      date_effective: '',
      rate_note: '',
      drawing_no: '',
      revision_no: '',
      drawing_file_path: '',
      reorder_level: '',
      reorder_qty: '',
      safety_stock: '',
      min_stock: '',
      max_stock: '',
      lead_time_days: '',
      shelf_life_days: ''
    });
    setSelectedHSN(null);
    setSelectedMaterial(null);
    setFieldErrors({});
    setError('');
    setActiveStep(0);
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
    setShowAddTaxForm(false);
    setTaxFormData({
      HSNCode: '',
      Description: '',
      GSTPercentage: ''
    });
    setTaxFieldErrors({});
    setTaxTouched({});
    setAddTaxError('');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  // Shared TextField sx styles
  const textFieldSx = {
    '& .MuiOutlinedInput-root': {
      borderRadius: 1.5,
      fontSize: '0.75rem',
      '&:hover fieldset': { borderColor: COLORS.primary },
      '&.Mui-focused fieldset': { borderColor: COLORS.primary, borderWidth: 1 }
    },
    '& .MuiInputBase-input': {
      py: 1, px: 1.5, fontSize: '0.75rem', color: COLORS.text.primary
    },
    '& .MuiFormHelperText-root': {
      fontSize: '0.65rem', marginLeft: 0, marginTop: 0.25
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

  const renderStepContent = (step) => {
    switch (step) {
      case 0: // Basic Info
        return (
          <Stack spacing={2}>
            <Paper sx={{ p: 2, bgcolor: COLORS.background.white, borderRadius: 1.5, border: `1px solid ${COLORS.border}` }}>
              <Typography variant="subtitle2" sx={{ color: COLORS.primary, mb: 1.5, fontWeight: 600, fontSize: '0.9rem' }}>
                Basic Information
              </Typography>
             
              <Grid container spacing={1.5}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                    <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary, letterSpacing: '0.5px' }}>
                      PART NUMBER <span style={{ color: '#EF4444' }}>*</span>
                    </Typography>
                    <TextField
                      fullWidth size="small" name="part_no" value={formData.part_no}
                      onChange={handleChange} required disabled={loading}
                      placeholder="e.g., BR-001" error={!!fieldErrors.part_no}
                      helperText={fieldErrors.part_no} inputProps={{ maxLength: 50 }}
                      sx={textFieldSx}
                    />
                  </Box>
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                    <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary, letterSpacing: '0.5px' }}>
                      PART NAME <span style={{ color: '#EF4444' }}>*</span>
                    </Typography>
                    <TextField
                      fullWidth size="small" name="part_name" value={formData.part_name}
                      onChange={handleChange} required disabled={loading}
                      placeholder="e.g., Copper Busbar 100x10mm" error={!!fieldErrors.part_name}
                      helperText={fieldErrors.part_name} inputProps={{ maxLength: 100 }}
                      sx={textFieldSx}
                    />
                  </Box>
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                    <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary, letterSpacing: '0.5px' }}>
                      ITEM CATEGORY <span style={{ color: '#EF4444' }}>*</span>
                    </Typography>
                    <FormControl fullWidth size="small" error={!!fieldErrors.item_category}>
                      <Select name="item_category" value={formData.item_category}
                        onChange={handleSelectChange} disabled={loading} displayEmpty sx={selectSx}>
                        <MenuItem value="" disabled sx={{ fontSize: '0.75rem' }}>Select category</MenuItem>
                        {itemCategoryOptions.map((option) => (
                          <MenuItem key={option} value={option} sx={{ fontSize: '0.75rem' }}>
                            {option}
                            {option === 'Raw Material' && ' (What you BUY from suppliers)'}
                            {option === 'Finished Good' && ' (What you SELL to customers)'}
                            {option === 'Consumable' && ' (Oils, lubricants, indirect materials)'}
                            {option === 'Tool' && ' (Molds, dies, fixtures)'}
                            {option === 'Bought-Out' && ' (Purchase for resale)'}
                            {option === 'Subcontract' && ' (Send outside for processing)'}
                            {option === 'Semi-Finished' && ' (Work in Progress)'}
                          </MenuItem>
                        ))}
                      </Select>
                      {fieldErrors.item_category && (
                        <Typography sx={{ fontSize: '0.65rem', color: '#EF4444', mt: 0.25 }}>
                          {fieldErrors.item_category}
                        </Typography>
                      )}
                    </FormControl>
                  </Box>
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                    <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary, letterSpacing: '0.5px' }}>
                      ITEM TYPE
                    </Typography>
                    <FormControl fullWidth size="small">
                      <Select name="item_type" value={formData.item_type}
                        onChange={handleSelectChange} disabled={loading} displayEmpty sx={selectSx}>
                        <MenuItem value="" disabled sx={{ fontSize: '0.75rem' }}>Select type</MenuItem>
                        {itemTypeOptions.map((option) => (
                          <MenuItem key={option} value={option} sx={{ fontSize: '0.75rem' }}>{option}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                    <Typography sx={{ fontSize: '0.65rem', color: COLORS.text.tertiary }}>Optional, defaults to "Other"</Typography>
                  </Box>
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                    <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary, letterSpacing: '0.5px' }}>
                      SALE UNIT <span style={{ color: '#EF4444' }}>*</span>
                    </Typography>
                    <FormControl fullWidth size="small" error={!!fieldErrors.sale_unit}>
                      <Select name="sale_unit" value={formData.sale_unit}
                        onChange={handleSelectChange} disabled={loading} displayEmpty sx={selectSx}>
                        <MenuItem value="" disabled sx={{ fontSize: '0.75rem' }}>Select sale unit</MenuItem>
                        {saleUnitOptions.map((option) => (
                          <MenuItem key={option} value={option} sx={{ fontSize: '0.75rem' }}>{option}</MenuItem>
                        ))}
                      </Select>
                      {fieldErrors.sale_unit && (
                        <Typography sx={{ fontSize: '0.65rem', color: '#EF4444', mt: 0.25 }}>
                          {fieldErrors.sale_unit}
                        </Typography>
                      )}
                    </FormControl>
                  </Box>
                </Grid>
               
                {showWeightPerUnit && (
                  <Grid size={{ xs: 12, md: 4 }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                      <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary, letterSpacing: '0.5px' }}>
                        WEIGHT PER UNIT (kg) <span style={{ color: '#EF4444' }}>*</span>
                      </Typography>
                      <TextField
                        fullWidth
                        size="small"
                        name="weight_per_unit_kg"
                        value={formData.weight_per_unit_kg}
                        onChange={handleChange}
                        required
                        disabled={loading}
                        placeholder="e.g., 0.85"
                        error={!!fieldErrors.weight_per_unit_kg}
                        helperText={fieldErrors.weight_per_unit_kg}
                        inputProps={{
                          step: '0.001',
                          min: 0.001,
                          onWheel: (e) => e.target.blur()
                        }}
                        sx={numberFieldSx}
                      />
                      <Typography sx={{ fontSize: '0.65rem', color: COLORS.text.tertiary }}>
                        Weight per unit in kgs (required when sale unit is not Kg)
                      </Typography>
                    </Box>
                  </Grid>
                )}
               
                <Grid size={{ xs: 12 }}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                    <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary, letterSpacing: '0.5px' }}>
                      PART DESCRIPTION <span style={{ color: '#EF4444' }}>*</span>
                    </Typography>
                    <TextField
                      fullWidth size="small" name="part_description" value={formData.part_description}
                      onChange={handleChange} multiline rows={2} required disabled={loading}
                      placeholder="Enter detailed part description" error={!!fieldErrors.part_description}
                      helperText={fieldErrors.part_description} inputProps={{ maxLength: 200 }}
                      sx={textFieldSx}
                    />
                  </Box>
                </Grid>
              </Grid>
            </Paper>
          </Stack>
        );
     
      case 1: // Material & Drawing
        return (
          <Stack spacing={2}>
            <Paper sx={{ p: 2, bgcolor: COLORS.background.white, borderRadius: 1.5, border: `1px solid ${COLORS.border}` }}>
              <Typography variant="subtitle2" sx={{ color: COLORS.primary, mb: 1.5, fontWeight: 600, fontSize: '0.9rem' }}>
                Material Information <span style={{ color: '#EF4444' }}>*</span>
              </Typography>
             
              {/* Material Selection Dropdown with Add New Button */}
              <Grid container spacing={1.5} sx={{ mb: 2 }}>
                <Grid size={{ xs: 12 }}>
                  <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
                    <Box sx={{ flex: 1 }}>
                      <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary, letterSpacing: '0.5px', mb: 0.5 }}>
                        SELECT MATERIAL
                      </Typography>
                      <Autocomplete
                        fullWidth
                        options={materials}
                        loading={loadingMaterials}
                        value={selectedMaterial}
                        onChange={handleMaterialChange}
                        getOptionLabel={(option) => option.MaterialNameWithCode || option.MaterialName || ''}
                        isOptionEqualToValue={(option, value) => option._id === value._id}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            size="small"
                            placeholder={loadingMaterials ? 'Loading materials...' : 'Search or select a material'}
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
                        noOptionsText="No materials found"
                      />
                    </Box>
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
                        alignSelf: 'flex-end',
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
                  <Typography sx={{ fontSize: '0.65rem', color: COLORS.text.tertiary, mt: 0.5 }}>
                    Select an existing material to auto-fill details below, or click "Add New" to create one
                  </Typography>
                </Grid>
              </Grid>

              {/* Inline Add Material Form */}
              {showAddMaterialForm && (
                <Box sx={{ mt: 2, p: 2.5, bgcolor: COLORS.background.light, borderRadius: 2, border: `1px solid ${COLORS.primary}` }}>
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
                        <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary, letterSpacing: '0.5px' }}>
                          MATERIAL CODE <span style={{ color: '#EF4444' }}>*</span>
                        </Typography>
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
                        <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary, letterSpacing: '0.5px' }}>
                          MATERIAL NAME <span style={{ color: '#EF4444' }}>*</span>
                        </Typography>
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
                        <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary, letterSpacing: '0.5px' }}>
                          DENSITY (g/cm³)
                        </Typography>
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
                          Optional - Leave blank if not applicable
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                        <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary, letterSpacing: '0.5px' }}>
                          UNIT
                        </Typography>
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
                        <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary, letterSpacing: '0.5px' }}>
                          GRADE
                        </Typography>
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
                        <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary, letterSpacing: '0.5px' }}>
                          EFFECTIVE RATE (₹)
                        </Typography>
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
                          Optional - Leave blank if not applicable
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
              )}

              <Divider sx={{ mb: 2 }} />

              {/* Material Details Fields */}
              <Grid container spacing={1.5}>
                <Grid size={{ xs: 12, md: 4 }}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                    <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary, letterSpacing: '0.5px' }}>
                      MATERIAL NAME <span style={{ color: '#EF4444' }}>*</span>
                    </Typography>
                    <TextField fullWidth size="small" name="material_name" value={formData.material_name}
                      onChange={handleChange} required disabled={loading} placeholder="e.g., Copper"
                      error={!!fieldErrors.material_name} helperText={fieldErrors.material_name}
                      inputProps={{ maxLength: 100 }} sx={textFieldSx} />
                  </Box>
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                    <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary, letterSpacing: '0.5px' }}>
                      MATERIAL CODE
                    </Typography>
                    <TextField fullWidth size="small" name="material_code" value={formData.material_code}
                      onChange={handleChange} disabled={loading} placeholder="e.g., CU-001"
                      sx={textFieldSx} />
                    <Typography sx={{ fontSize: '0.65rem', color: COLORS.text.tertiary }}>Optional internal code</Typography>
                  </Box>
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                    <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary, letterSpacing: '0.5px' }}>
                      MATERIAL GRADE <span style={{ color: '#EF4444' }}>*</span>
                    </Typography>
                    <TextField fullWidth size="small" name="material_grade" value={formData.material_grade}
                      onChange={handleChange} required disabled={loading} placeholder="e.g., C11000"
                      error={!!fieldErrors.material_grade} helperText={fieldErrors.material_grade}
                      sx={textFieldSx} />
                  </Box>
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                    <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary, letterSpacing: '0.5px' }}>
                      DENSITY (g/cm³) <span style={{ color: '#EF4444' }}>*</span>
                    </Typography>
                    <TextField fullWidth size="small" name="density" value={formData.density}
                      onChange={handleChange} required disabled={loading} placeholder="e.g., 8.96"
                      error={!!fieldErrors.density} helperText={fieldErrors.density}
                      inputProps={{ step: '0.01', min: 0.1, onWheel: (e) => e.target.blur() }}
                      sx={numberFieldSx} />
                  </Box>
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                    <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary, letterSpacing: '0.5px' }}>
                      UNIT <span style={{ color: '#EF4444' }}>*</span>
                    </Typography>
                    <FormControl fullWidth size="small" error={!!fieldErrors.unit}>
                      <Select name="unit" value={formData.unit}
                        onChange={handleSelectChange} disabled={loading} displayEmpty sx={selectSx}>
                        <MenuItem value="" disabled sx={{ fontSize: '0.75rem' }}>Select unit</MenuItem>
                        {unitOptions.map((option) => (
                          <MenuItem key={option} value={option} sx={{ fontSize: '0.75rem' }}>{option}</MenuItem>
                        ))}
                      </Select>
                      {fieldErrors.unit && (
                        <Typography sx={{ fontSize: '0.65rem', color: '#EF4444', mt: 0.25 }}>
                          {fieldErrors.unit}
                        </Typography>
                      )}
                    </FormControl>
                  </Box>
                </Grid>

                <Grid size={{ xs: 12, md: 4 }}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                    <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary, letterSpacing: '0.5px' }}>
                      PROCUREMENT TYPE
                    </Typography>
                    <FormControl fullWidth size="small" error={!!fieldErrors.procurement_type}>
                      <Select name="procurement_type" value={formData.procurement_type}
                        onChange={handleSelectChange} disabled={loading} displayEmpty sx={selectSx}>
                        <MenuItem value="" disabled sx={{ fontSize: '0.75rem' }}>Select procurement type</MenuItem>
                        {procurementTypeOptions.map((option) => (
                          <MenuItem key={option} value={option} sx={{ fontSize: '0.75rem' }}>{option}</MenuItem>
                        ))}
                      </Select>
                      {fieldErrors.procurement_type && (
                        <Typography sx={{ fontSize: '0.65rem', color: '#EF4444', mt: 0.25 }}>
                          {fieldErrors.procurement_type}
                        </Typography>
                      )}
                    </FormControl>
                    <Typography sx={{ fontSize: '0.65rem', color: COLORS.text.tertiary }}>Optional, defaults to "Manufacture"</Typography>
                  </Box>
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                    <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary, letterSpacing: '0.5px' }}>
                      MATERIAL STANDARD
                    </Typography>
                    <TextField fullWidth size="small" name="material_standard" value={formData.material_standard}
                      onChange={handleChange} disabled={loading} placeholder="e.g., ASTM B152"
                      sx={textFieldSx} />
                  </Box>
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                    <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary, letterSpacing: '0.5px' }}>
                      MATERIAL COLOR
                    </Typography>
                    <TextField fullWidth size="small" name="material_color" value={formData.material_color}
                      onChange={handleChange} disabled={loading} placeholder="e.g., Reddish"
                      sx={textFieldSx} />
                  </Box>
                </Grid>
                
                {/* HSN Code with Inline Add Tax Form */}
                <Grid size={{ xs: 12, md: 4 }}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                    <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary, letterSpacing: '0.5px' }}>
                      HSN CODE <span style={{ color: '#EF4444' }}>*</span>
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
                      <Box sx={{ flex: 1 }}>
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
                              error={!!fieldErrors.hsn_code}
                              helperText={fieldErrors.hsn_code}
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
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => setShowAddTaxForm(!showAddTaxForm)}
                        disabled={loading}
                        startIcon={showAddTaxForm ? <CloseIcon sx={{ fontSize: '0.875rem' }} /> : <AddIcon sx={{ fontSize: '0.875rem' }} />}
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
                        {showAddTaxForm ? 'Cancel' : 'Add New'}
                      </Button>
                    </Box>
                  </Box>
                </Grid>

                {/* Inline Add Tax Form */}
                <Grid size={{ xs: 12 }}>
                  <Collapse in={showAddTaxForm}>
                    <Box sx={{ mt: 1, p: 2.5, bgcolor: COLORS.background.light, borderRadius: 2, border: `1px solid ${COLORS.primary}` }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color: COLORS.primary }}>
                          Add New HSN Code
                        </Typography>
                        <IconButton
                          size="small"
                          onClick={() => {
                            setShowAddTaxForm(false);
                            setAddTaxError('');
                            setTaxFormData({
                              HSNCode: '',
                              Description: '',
                              GSTPercentage: ''
                            });
                            setTaxFieldErrors({});
                            setTaxTouched({});
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
                        <Grid size={{ xs: 12, sm: 4 }}>
                          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                            <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary, letterSpacing: '0.5px' }}>
                              HSN CODE <span style={{ color: '#EF4444' }}>*</span>
                            </Typography>
                            <TextField
                              fullWidth
                              size="small"
                              name="HSNCode"
                              value={taxFormData.HSNCode}
                              onChange={handleTaxFormChange}
                              onBlur={handleTaxBlur}
                              required
                              disabled={addTaxLoading}
                              placeholder="e.g., 7407"
                              error={!!taxFieldErrors.HSNCode}
                              helperText={taxFieldErrors.HSNCode}
                              inputProps={{ maxLength: 8 }}
                              sx={textFieldSx}
                            />
                            <Typography sx={{ fontSize: '0.65rem', color: COLORS.text.tertiary }}>
                              4-8 characters, alphanumeric
                            </Typography>
                          </Box>
                        </Grid>

                        <Grid size={{ xs: 12, sm: 4 }}>
                          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                            <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary, letterSpacing: '0.5px' }}>
                              DESCRIPTION <span style={{ color: '#EF4444' }}>*</span>
                            </Typography>
                            <TextField
                              fullWidth
                              size="small"
                              name="Description"
                              value={taxFormData.Description}
                              onChange={handleTaxFormChange}
                              onBlur={handleTaxBlur}
                              required
                              disabled={addTaxLoading}
                              placeholder="e.g., Copper Products"
                              error={!!taxFieldErrors.Description}
                              helperText={taxFieldErrors.Description}
                              inputProps={{ maxLength: 200 }}
                              sx={textFieldSx}
                            />
                          </Box>
                        </Grid>

                        <Grid size={{ xs: 12, sm: 4 }}>
                          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                            <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary, letterSpacing: '0.5px' }}>
                              GST PERCENTAGE (%) <span style={{ color: '#EF4444' }}>*</span>
                            </Typography>
                            <TextField
                              fullWidth
                              size="small"
                              name="GSTPercentage"
                              type="number"
                              value={taxFormData.GSTPercentage}
                              onChange={handleTaxFormChange}
                              onBlur={handleTaxBlur}
                              required
                              disabled={addTaxLoading}
                              placeholder="e.g., 18"
                              error={!!taxFieldErrors.GSTPercentage}
                              helperText={taxFieldErrors.GSTPercentage}
                              inputProps={{ step: 0.1, min: 0, max: 100 }}
                              sx={numberFieldSx}
                            />
                            <Typography sx={{ fontSize: '0.65rem', color: COLORS.text.tertiary }}>
                              Between 0 and 100
                            </Typography>
                          </Box>
                        </Grid>
                      </Grid>

                      {addTaxError && (
                        <Alert
                          severity="error"
                          sx={{
                            mt: 2,
                            borderRadius: 1.5,
                            fontSize: '0.75rem',
                            py: 0.5
                          }}
                        >
                          {addTaxError}
                        </Alert>
                      )}

                      <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                        <Button
                          onClick={() => {
                            setShowAddTaxForm(false);
                            setAddTaxError('');
                            setTaxFormData({
                              HSNCode: '',
                              Description: '',
                              GSTPercentage: ''
                            });
                            setTaxFieldErrors({});
                            setTaxTouched({});
                          }}
                          disabled={addTaxLoading}
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
                          onClick={handleAddTaxSubmit}
                          disabled={addTaxLoading}
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
                          {addTaxLoading ? 'Adding...' : 'Add HSN Code'}
                        </Button>
                      </Box>
                    </Box>
                  </Collapse>
                </Grid>

                <Grid size={{ xs: 12, md: 4 }}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                    <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary, letterSpacing: '0.5px' }}>
                      GST PERCENTAGE (%)
                    </Typography>
                    <FormControl fullWidth size="small" error={!!fieldErrors.gst_percentage}>
                      <Select name="gst_percentage" value={formData.gst_percentage}
                        onChange={handleSelectChange} disabled={loading} displayEmpty sx={selectSx}>
                        <MenuItem value="" sx={{ fontSize: '0.75rem' }}>Not specified</MenuItem>
                        {gstPercentageOptions.map((option) => (
                          <MenuItem key={option} value={option} sx={{ fontSize: '0.75rem' }}>{option}%</MenuItem>
                        ))}
                      </Select>
                      {fieldErrors.gst_percentage && (
                        <Typography sx={{ fontSize: '0.65rem', color: '#EF4444', mt: 0.25 }}>
                          {fieldErrors.gst_percentage}
                        </Typography>
                      )}
                    </FormControl>
                    <Typography sx={{ fontSize: '0.65rem', color: COLORS.text.tertiary }}>Auto-filled from HSN, defaults to 18%</Typography>
                  </Box>
                </Grid>
              </Grid>
            </Paper>

            {/* Drawing Information - Only for Finished Good & Semi-Finished */}
            {showDrawing && (
              <Paper sx={{ p: 2, bgcolor: COLORS.background.white, borderRadius: 1.5, border: `1px solid ${COLORS.border}` }}>
                <Typography variant="subtitle2" sx={{ color: COLORS.primary, mb: 1.5, fontWeight: 600, fontSize: '0.9rem' }}>
                  Drawing Information
                </Typography>
                <Grid container spacing={1.5}>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                      <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary, letterSpacing: '0.5px' }}>
                        DRAWING NUMBER
                      </Typography>
                      <TextField fullWidth size="small" name="drawing_no" value={formData.drawing_no}
                        onChange={handleChange} disabled={loading} placeholder="e.g., DRG001" sx={textFieldSx} />
                    </Box>
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                      <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary, letterSpacing: '0.5px' }}>
                        REVISION NUMBER
                      </Typography>
                      <TextField fullWidth size="small" name="revision_no" value={formData.revision_no}
                        onChange={handleChange} disabled={loading} placeholder="e.g., A" sx={textFieldSx} />
                      <Typography sx={{ fontSize: '0.65rem', color: COLORS.text.tertiary }}>Defaults to "0"</Typography>
                    </Box>
                  </Grid>
                </Grid>
              </Paper>
            )}

            {/* Dimensions - Show for Raw Material, Semi-Finished, Finished Good, Bought-Out */}
            {showDimensions && (
              <Paper sx={{ p: 2, bgcolor: COLORS.background.white, borderRadius: 1.5, border: `1px solid ${COLORS.border}` }}>
                <Typography variant="subtitle2" sx={{ color: COLORS.primary, mb: 1.5, fontWeight: 600, fontSize: '0.9rem' }}>
                  {isRawMaterial ? 'Raw Material Dimensions (mm)' : isBoughtOut ? 'Product Dimensions (mm)' : 'Dimensions (mm)'}
                </Typography>
                <Grid container spacing={1.5}>
                  <Grid size={{ xs: 12, md: 4 }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                      <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary, letterSpacing: '0.5px' }}>
                        THICKNESS (mm)
                      </Typography>
                      <TextField fullWidth size="small" name="thickness" value={formData.thickness}
                        onChange={handleChange} disabled={loading} placeholder="e.g., 10"
                        error={!!fieldErrors.thickness} helperText={fieldErrors.thickness}
                        inputProps={{ step: '0.01', min: 0, onWheel: (e) => e.target.blur() }}
                        sx={numberFieldSx} />
                    </Box>
                  </Grid>
                  <Grid size={{ xs: 12, md: 4 }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                      <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary, letterSpacing: '0.5px' }}>
                        WIDTH (mm)
                      </Typography>
                      <TextField fullWidth size="small" name="width" value={formData.width}
                        onChange={handleChange} disabled={loading} placeholder="e.g., 100"
                        error={!!fieldErrors.width} helperText={fieldErrors.width}
                        inputProps={{ step: '0.01', min: 0, onWheel: (e) => e.target.blur() }}
                        sx={numberFieldSx} />
                    </Box>
                  </Grid>
                  <Grid size={{ xs: 12, md: 4 }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                      <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary, letterSpacing: '0.5px' }}>
                        {isRawMaterial ? 'COIL LENGTH (mm)' : 'LENGTH (mm)'}
                      </Typography>
                      <TextField fullWidth size="small" name="length" value={formData.length}
                        onChange={handleChange} disabled={loading}
                        placeholder={isRawMaterial ? "e.g., 3660" : "e.g., 1000"}
                        error={!!fieldErrors.length} helperText={fieldErrors.length}
                        inputProps={{ step: '0.01', min: 0, onWheel: (e) => e.target.blur() }}
                        sx={numberFieldSx} />
                      {!isRawMaterial && (
                        <Typography sx={{ fontSize: '0.65rem', color: COLORS.text.tertiary }}>Defaults to 1000mm for weight calculation</Typography>
                      )}
                    </Box>
                  </Grid>
                </Grid>
              </Paper>
            )}

            {/* Raw Material Details - ONLY for Raw Material category */}
            {showRmDetails && (
              <Paper sx={{ p: 2, bgcolor: COLORS.background.white, borderRadius: 1.5, border: `1px solid ${COLORS.border}` }}>
                <Typography variant="subtitle2" sx={{ color: COLORS.primary, mb: 1.5, fontWeight: 600, fontSize: '0.9rem' }}>
                  Raw Material Details (Supplier Information)
                </Typography>
                <Grid container spacing={1.5}>
                  <Grid size={{ xs: 12, md: 4 }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                      <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary, letterSpacing: '0.5px' }}>
                        RM SOURCE (Supplier)
                      </Typography>
                      <TextField fullWidth size="small" name="rm_source" value={formData.rm_source}
                        onChange={handleChange} disabled={loading} placeholder="e.g., Hindalco" sx={textFieldSx} />
                    </Box>
                  </Grid>
                  <Grid size={{ xs: 12, md: 4 }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                      <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary, letterSpacing: '0.5px' }}>
                        RM TYPE
                      </Typography>
                      <FormControl fullWidth size="small">
                        <Select name="rm_type" value={formData.rm_type}
                          onChange={handleSelectChange} disabled={loading} displayEmpty sx={selectSx}>
                          <MenuItem value="" sx={{ fontSize: '0.75rem' }}>Select RM type</MenuItem>
                          {rmTypeOptions.map((option) => (
                            <MenuItem key={option} value={option} sx={{ fontSize: '0.75rem' }}>{option}</MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Box>
                  </Grid>
                  <Grid size={{ xs: 12, md: 4 }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                      <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary, letterSpacing: '0.5px' }}>
                        RM SPECIFICATION
                      </Typography>
                      <TextField fullWidth size="small" name="rm_spec" value={formData.rm_spec}
                        onChange={handleChange} disabled={loading} placeholder="e.g., IS 191" sx={textFieldSx} />
                    </Box>
                  </Grid>
                  <Grid size={{ xs: 12, md: 4 }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                      <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary, letterSpacing: '0.5px' }}>
                        STRIP SIZE (mm)
                      </Typography>
                      <TextField fullWidth size="small" name="strip_size" value={formData.strip_size}
                        onChange={handleChange} disabled={loading} placeholder="e.g., 3660"
                        error={!!fieldErrors.strip_size} helperText={fieldErrors.strip_size}
                        inputProps={{ min: 0, step: '0.01', onWheel: (e) => e.target.blur() }}
                        sx={numberFieldSx} />
                      <Typography sx={{ fontSize: '0.65rem', color: COLORS.text.tertiary }}>For press shop strip width</Typography>
                    </Box>
                  </Grid>
                </Grid>
              </Paper>
            )}
          </Stack>
        );
     
      case 2: // Process Details
        return (
          <Stack spacing={2}>
            {/* Process Parameters - Only for Semi-Finished & Finished Good */}
            {showProcessParams && (
              <Paper sx={{ p: 2, bgcolor: COLORS.background.white, borderRadius: 1.5, border: `1px solid ${COLORS.border}` }}>
                <Typography variant="subtitle2" sx={{ color: COLORS.primary, mb: 1.5, fontWeight: 600, fontSize: '0.9rem' }}>
                  Manufacturing Process Parameters
                </Typography>
                <Grid container spacing={1.5}>
                  <Grid size={{ xs: 12, md: 4 }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                      <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary, letterSpacing: '0.5px' }}>
                        PITCH (mm)
                      </Typography>
                      <TextField fullWidth size="small" name="pitch" value={formData.pitch}
                        onChange={handleChange} disabled={loading} placeholder="e.g., 42"
                        error={!!fieldErrors.pitch} helperText={fieldErrors.pitch}
                        inputProps={{ min: 0, step: '0.01', onWheel: (e) => e.target.blur() }}
                        sx={numberFieldSx} />
                      <Typography sx={{ fontSize: '0.65rem', color: COLORS.text.tertiary }}>Progressive die pitch in mm</Typography>
                    </Box>
                  </Grid>
                  <Grid size={{ xs: 12, md: 4 }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                      <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary, letterSpacing: '0.5px' }}>
                        NUMBER OF CAVITIES
                      </Typography>
                      <TextField fullWidth size="small" name="no_of_cavity" value={formData.no_of_cavity}
                        onChange={handleChange} disabled={loading} type="number" placeholder="e.g., 1"
                        error={!!fieldErrors.no_of_cavity} helperText={fieldErrors.no_of_cavity}
                        inputProps={{ min: 1, step: 1, onWheel: (e) => e.target.blur() }}
                        sx={numberFieldSx} />
                    </Box>
                  </Grid>
                </Grid>
              </Paper>
            )}

            {/* Inventory Parameters - Show for most categories except Consumable, Tool, Subcontract */}
            {showInventory && (
              <Paper sx={{ p: 2, bgcolor: COLORS.background.white, borderRadius: 1.5, border: `1px solid ${COLORS.border}` }}>
                <Typography variant="subtitle2" sx={{ color: COLORS.primary, mb: 1.5, fontWeight: 600, fontSize: '0.9rem' }}>
                  Inventory Control
                </Typography>
                <Grid container spacing={1.5}>
                  <Grid size={{ xs: 12, md: 4 }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                      <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary, letterSpacing: '0.5px' }}>
                        REORDER LEVEL
                      </Typography>
                      <TextField fullWidth size="small" name="reorder_level" value={formData.reorder_level}
                        onChange={handleChange} disabled={loading} type="number" placeholder="e.g., 100"
                        error={!!fieldErrors.reorder_level} helperText={fieldErrors.reorder_level}
                        inputProps={{ min: 0, step: 1, onWheel: (e) => e.target.blur() }}
                        sx={numberFieldSx} />
                    </Box>
                  </Grid>
                  <Grid size={{ xs: 12, md: 4 }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                      <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary, letterSpacing: '0.5px' }}>
                        REORDER QUANTITY
                      </Typography>
                      <TextField fullWidth size="small" name="reorder_qty" value={formData.reorder_qty}
                        onChange={handleChange} disabled={loading} type="number" placeholder="e.g., 500"
                        inputProps={{ min: 0, step: 1, onWheel: (e) => e.target.blur() }}
                        sx={numberFieldSx} />
                    </Box>
                  </Grid>
                  <Grid size={{ xs: 12, md: 4 }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                      <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary, letterSpacing: '0.5px' }}>
                        LEAD TIME (Days)
                      </Typography>
                      <TextField fullWidth size="small" name="lead_time_days" value={formData.lead_time_days}
                        onChange={handleChange} disabled={loading} type="number" placeholder="e.g., 7"
                        error={!!fieldErrors.lead_time_days} helperText={fieldErrors.lead_time_days}
                        inputProps={{ min: 0, step: 1, onWheel: (e) => e.target.blur() }}
                        sx={numberFieldSx} />
                    </Box>
                  </Grid>
                  <Grid size={{ xs: 12, md: 4 }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                      <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary, letterSpacing: '0.5px' }}>
                        SAFETY STOCK
                      </Typography>
                      <TextField fullWidth size="small" name="safety_stock" value={formData.safety_stock}
                        onChange={handleChange} disabled={loading} type="number" placeholder="e.g., 50"
                        inputProps={{ min: 0, step: 1, onWheel: (e) => e.target.blur() }}
                        sx={numberFieldSx} />
                    </Box>
                  </Grid>
                  <Grid size={{ xs: 12, md: 4 }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                      <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary, letterSpacing: '0.5px' }}>
                        MIN STOCK
                      </Typography>
                      <TextField fullWidth size="small" name="min_stock" value={formData.min_stock}
                        onChange={handleChange} disabled={loading} type="number" placeholder="e.g., 50"
                        inputProps={{ min: 0, step: 1, onWheel: (e) => e.target.blur() }}
                        sx={numberFieldSx} />
                    </Box>
                  </Grid>
                  <Grid size={{ xs: 12, md: 4 }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                      <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary, letterSpacing: '0.5px' }}>
                        MAX STOCK
                      </Typography>
                      <TextField fullWidth size="small" name="max_stock" value={formData.max_stock}
                        onChange={handleChange} disabled={loading} type="number" placeholder="e.g., 2000"
                        inputProps={{ min: 0, step: 1, onWheel: (e) => e.target.blur() }}
                        sx={numberFieldSx} />
                    </Box>
                  </Grid>
                  <Grid size={{ xs: 12, md: 4 }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                      <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary, letterSpacing: '0.5px' }}>
                        SHELF LIFE (Days)
                      </Typography>
                      <TextField fullWidth size="small" name="shelf_life_days" value={formData.shelf_life_days}
                        onChange={handleChange} disabled={loading} type="number" placeholder="e.g., 365"
                        inputProps={{ min: 0, step: 1, onWheel: (e) => e.target.blur() }}
                        sx={numberFieldSx} />
                      <Typography sx={{ fontSize: '0.65rem', color: COLORS.text.tertiary }}>0 means no expiry</Typography>
                    </Box>
                  </Grid>
                </Grid>
              </Paper>
            )}
          </Stack>
        );
     
      case 3: // Rate & Tax
        return (
          <Stack spacing={2}>
            {/* Rejection and Scrap Parameters - For all physical products */}
            <Paper sx={{ p: 2, bgcolor: COLORS.background.white, borderRadius: 1.5, border: `1px solid ${COLORS.border}` }}>
              <Typography variant="subtitle2" sx={{ color: COLORS.primary, mb: 1.5, fontWeight: 600, fontSize: '0.9rem' }}>
                Rejection & Scrap Parameters
              </Typography>
              <Grid container spacing={1.5}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                    <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary, letterSpacing: '0.5px' }}>
                      RM REJECTION PERCENTAGE (%)
                    </Typography>
                    <TextField fullWidth size="small" name="rm_rejection_percent" value={formData.rm_rejection_percent}
                      onChange={handleChange} disabled={loading} placeholder="e.g., 2"
                      error={!!fieldErrors.rm_rejection_percent} helperText={fieldErrors.rm_rejection_percent}
                      inputProps={{ min: 0, max: 100, step: 0.1, onWheel: (e) => e.target.blur() }}
                      sx={numberFieldSx} />
                    <Typography sx={{ fontSize: '0.65rem', color: COLORS.text.tertiary }}>Defaults to 2.0%</Typography>
                  </Box>
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                    <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary, letterSpacing: '0.5px' }}>
                      SCRAP REALISATION PERCENTAGE (%)
                    </Typography>
                    <TextField fullWidth size="small" name="scrap_realisation_percent" value={formData.scrap_realisation_percent}
                      onChange={handleChange} disabled={loading} placeholder="e.g., 85"
                      error={!!fieldErrors.scrap_realisation_percent} helperText={fieldErrors.scrap_realisation_percent}
                      inputProps={{ min: 0, max: 100, step: 0.1, onWheel: (e) => e.target.blur() }}
                      sx={numberFieldSx} />
                    <Typography sx={{ fontSize: '0.65rem', color: COLORS.text.tertiary }}>Defaults to 85%</Typography>
                  </Box>
                </Grid>
              </Grid>
            </Paper>

            {/* Rate Information - For Raw Material, Semi-Finished, Finished Good only */}
            {showRateEntry && (
              <Paper sx={{ p: 2, bgcolor: COLORS.background.white, borderRadius: 1.5, border: `1px solid ${COLORS.border}` }}>
                <Typography variant="subtitle2" sx={{ color: COLORS.primary, mb: 1.5, fontWeight: 600, fontSize: '0.9rem' }}>
                  Rate Information (For Costing)
                </Typography>
                <Grid container spacing={1.5}>
                  <Grid size={{ xs: 12, md: 4 }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                      <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary, letterSpacing: '0.5px' }}>
                        RATE PER KG (₹)
                      </Typography>
                      <TextField fullWidth size="small" name="rate_per_kg" value={formData.rate_per_kg}
                        onChange={handleChange} disabled={loading} placeholder="e.g., 855"
                        inputProps={{ step: '0.01', min: 0, onWheel: (e) => e.target.blur() }}
                        sx={numberFieldSx} />
                      <Typography sx={{ fontSize: '0.65rem', color: COLORS.text.tertiary }}>Current market rate per kg</Typography>
                    </Box>
                  </Grid>
                  <Grid size={{ xs: 12, md: 4 }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                      <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary, letterSpacing: '0.5px' }}>
                        PROFILE CONVERSION RATE
                      </Typography>
                      <TextField fullWidth size="small" name="profile_conversion_rate" value={formData.profile_conversion_rate}
                        onChange={handleChange} disabled={loading} placeholder="e.g., 25"
                        inputProps={{ step: '0.01', min: 0, onWheel: (e) => e.target.blur() }}
                        sx={numberFieldSx} />
                    </Box>
                  </Grid>
                  <Grid size={{ xs: 12, md: 4 }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                      <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary, letterSpacing: '0.5px' }}>
                        SCRAP PERCENTAGE (%)
                      </Typography>
                      <TextField fullWidth size="small" name="scrap_percentage" value={formData.scrap_percentage}
                        onChange={handleChange} disabled={loading} placeholder="e.g., 5"
                        inputProps={{ min: 0, max: 100, step: 0.1, onWheel: (e) => e.target.blur() }}
                        sx={numberFieldSx} />
                    </Box>
                  </Grid>
                  <Grid size={{ xs: 12, md: 4 }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                      <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary, letterSpacing: '0.5px' }}>
                        TRANSPORT LOSS (%)
                      </Typography>
                      <TextField fullWidth size="small" name="transport_loss_percentage" value={formData.transport_loss_percentage}
                        onChange={handleChange} disabled={loading} placeholder="e.g., 2"
                        inputProps={{ min: 0, max: 100, step: 0.1, onWheel: (e) => e.target.blur() }}
                        sx={numberFieldSx} />
                    </Box>
                  </Grid>
                  <Grid size={{ xs: 12, md: 4 }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                      <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary, letterSpacing: '0.5px' }}>
                        DATE EFFECTIVE
                      </Typography>
                      <TextField fullWidth size="small" name="date_effective" value={formData.date_effective}
                        onChange={handleChange} disabled={loading} type="date"
                        InputLabelProps={{ shrink: true }}
                        sx={textFieldSx} />
                    </Box>
                  </Grid>
                  <Grid size={{ xs: 12, md: 8 }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                      <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary, letterSpacing: '0.5px' }}>
                        RATE NOTE
                      </Typography>
                      <TextField fullWidth size="small" name="rate_note" value={formData.rate_note}
                        onChange={handleChange} disabled={loading} placeholder="e.g., Q2 2025 rate"
                        sx={textFieldSx} />
                    </Box>
                  </Grid>
                </Grid>
                <Typography sx={{ fontSize: '0.65rem', color: COLORS.text.tertiary, mt: 1 }}>
                  If rate is provided, an initial rate history entry will be created for costing
                </Typography>
              </Paper>
            )}
          </Stack>
        );
     
      default:
        return null;
    }
  };

  return (
    <>
      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth
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
          py: 1.5, px: 2.5,
          bgcolor: COLORS.background.white,
          display: 'flex', flexDirection: 'column', gap: 1
        }}>
          <Typography sx={{ fontSize: '1.2rem', fontWeight: 700, color: COLORS.text.primary }}>
            Add New Item
          </Typography>
          <Stepper activeStep={activeStep} alternativeLabel connector={<ColorConnector />} sx={{ mb: 0.5, mt: 0.5 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>
                  <Typography fontWeight={500} fontSize="0.8rem" color={COLORS.text.secondary}>{label}</Typography>
                </StepLabel>
              </Step>
            ))}
          </Stepper>
        </DialogTitle>

        {/* Floating Error Alert - Positioned below stepper */}
        <Box sx={{ px: 2.5, pt: 1 }}>
          <FloatingErrorAlert error={error} onClose={() => setError('')} />
        </Box>

        <DialogContent sx={{ p: 2.5, pt: error ? 1 : 2, overflow: 'auto' }}>
          {renderStepContent(activeStep)}
        </DialogContent>

        <DialogActions sx={{
          px: 2.5, py: 1.5,
          borderTop: `1px solid ${COLORS.border}`,
          bgcolor: COLORS.background.white,
          display: 'flex', justifyContent: 'space-between', gap: 1
        }}>
          <Button onClick={handleBack} disabled={activeStep === 0 || loading}
            startIcon={<NavigateBeforeIcon sx={{ fontSize: '1rem' }} />}
            sx={{
              height: 32, px: 2, borderRadius: 1.5, border: `1px solid ${COLORS.border}`,
              color: COLORS.text.secondary, fontSize: '0.7rem', fontWeight: 500, textTransform: 'none',
              '&:hover': { borderColor: COLORS.primary, bgcolor: `${COLORS.primary}10` },
              '&:disabled': { borderColor: COLORS.border, color: COLORS.text.tertiary }
            }}
          >
            Back
          </Button>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button onClick={handleClose} disabled={loading}
              sx={{
                height: 32, px: 2, borderRadius: 1.5, border: `1px solid ${COLORS.border}`,
                color: COLORS.text.secondary, fontSize: '0.7rem', fontWeight: 500, textTransform: 'none',
                '&:hover': { borderColor: COLORS.primary, bgcolor: `${COLORS.primary}10` }
              }}
            >
              Cancel
            </Button>
            {activeStep === steps.length - 1 ? (
              <Button variant="contained" onClick={handleSubmit} disabled={loading}
                startIcon={loading ? null : <AddIcon sx={{ fontSize: '1rem' }} />}
                sx={{
                  height: 32, px: 2, borderRadius: 1.5, bgcolor: COLORS.primary,
                  fontSize: '0.7rem', fontWeight: 500, textTransform: 'none',
                  boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
                  '&:hover': { bgcolor: COLORS.primaryDark },
                  '&:disabled': { bgcolor: COLORS.border, color: COLORS.text.tertiary }
                }}
              >
                {loading ? 'Adding...' : 'Add Item'}
              </Button>
            ) : (
              <Button variant="contained" onClick={handleNext} disabled={loading}
                endIcon={<NavigateNextIcon sx={{ fontSize: '1rem' }} />}
                sx={{
                  height: 32, px: 2, borderRadius: 1.5, bgcolor: COLORS.primary,
                  fontSize: '0.7rem', fontWeight: 500, textTransform: 'none',
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
    </>
  );
};

export default AddItem;