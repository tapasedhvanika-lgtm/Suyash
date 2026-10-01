// // AddSaleOrder.jsx
// import React, { useState, useEffect, useCallback } from 'react';
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
//   Alert,
//   IconButton,
//   FormControl,
//   Select,
//   MenuItem,
//   Autocomplete,
//   styled,
//   Divider,
//   Table,
//   TableBody,
//   TableCell,
//   TableContainer,
//   TableHead,
//   TableRow,
//   Tooltip
// } from '@mui/material';
// import {
//   Add as AddIcon,
//   Delete as DeleteIcon,
//   NavigateNext as NavigateNextIcon,
//   NavigateBefore as NavigateBeforeIcon,
//   Business as BusinessIcon,
//   Inventory as InventoryIcon,
//   LocalShipping as ShippingIcon,
//   AttachMoney as MoneyIcon,
//   Info as InfoIcon,
//   Close as CloseIcon
// } from '@mui/icons-material';
// import axios from 'axios';
// import BASE_URL from '../../config/Config';
// import AddItem from '../master/itemmaster/AddItem';
// import AddCustomer from '../master/customermaster/AddCustomer';


// // Color constants matching other components
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

// // Modern Stepper Connector with Primary Color
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

// // Options
// const CURRENCY_OPTIONS = ['INR', 'USD', 'EUR', 'GBP', 'AED'];
// const DELIVERY_TERMS_OPTIONS = ['Ex-Works', 'FOR Destination', 'CIF', 'FOB', ''];
// const DELIVERY_MODE_OPTIONS = ['Road', 'Rail', 'Air', 'Sea', 'Hand Delivery', ''];
// const UNIT_OPTIONS = ['Nos', 'Kg', 'Meter', 'Set', 'Piece'];

// const steps = ['Basic Information', 'Delivery & Financial', 'Items', 'Review & Submit'];

// const AddSaleOrder = ({ open, onClose, onAdd }) => {
//   const [activeStep, setActiveStep] = useState(0);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState('');
//   const [fieldErrors, setFieldErrors] = useState({});
  
//   // Quotation conflict dialog
//   const [quotationConflict, setQuotationConflict] = useState(false);
//   const [pendingQuotation, setPendingQuotation] = useState(null);
  
//   // Data from APIs
//   const [customers, setCustomers] = useState([]);
//   const [quotations, setQuotations] = useState([]);
//   const [items, setItems] = useState([]);
//   const [loadingData, setLoadingData] = useState(false);
  
//   // Dialog states for Add Customer and Add Item
//   const [addCustomerOpen, setAddCustomerOpen] = useState(false);
//   const [addItemOpen, setAddItemOpen] = useState(false);
//   const [currentItemIndex, setCurrentItemIndex] = useState(null);
  
//   // Form data
//   const [formData, setFormData] = useState({
//     customer_id: '',
//     quotation_id: '',
//     quotation_no: '',
//     customer_po_number: '',
//     customer_po_date: new Date().toISOString().split('T')[0],
//     payment_terms: '',
//     delivery_terms: '',
//     delivery_mode: '',
//     expected_delivery_date: new Date().toISOString().split('T')[0],
//     internal_remarks: '',
//     currency: 'INR'
//   });
  
//   const [soItems, setSoItems] = useState([
//     {
//       item_id: '',
//       part_no: '',
//       part_name: '',
//       hsn_code: '',
//       unit: 'Nos',
//       ordered_qty: 1,
//       unit_price: 0,
//       discount_percent: 0,
//       required_date: new Date().toISOString().split('T')[0],
//       committed_date: new Date().toISOString().split('T')[0],
//       remarks: ''
//     }
//   ]);
  
//   const [calculatedTotals, setCalculatedTotals] = useState({
//     sub_total: 0,
//     discount_total: 0,
//     taxable_total: 0,
//     gst_total: 0,
//     grand_total: 0
//   });
  
//   // Fetch customers
//   const fetchCustomers = useCallback(async () => {
//     try {
//       setLoadingData(true);
//       const token = localStorage.getItem('token');
//       const response = await axios.get(`${BASE_URL}/api/customers?limit=100`, {
//         headers: { 'Authorization': `Bearer ${token}` }
//       });
      
//       if (response.data.success) {
//         setCustomers(response.data.data || []);
//       }
//     } catch (err) {
//       console.error('Error fetching customers:', err);
//     } finally {
//       setLoadingData(false);
//     }
//   }, []);
  
//   // Fetch quotations
//   const fetchQuotations = useCallback(async () => {
//     try {
//       const token = localStorage.getItem('token');
//       const response = await axios.get(`${BASE_URL}/api/quotations?limit=100&status=Approved`, {
//         headers: { 'Authorization': `Bearer ${token}` }
//       });
      
//       if (response.data.success) {
//         setQuotations(response.data.data || []);
//       }
//     } catch (err) {
//       console.error('Error fetching quotations:', err);
//     }
//   }, []);
  
//   // Fetch items
//   const fetchItems = useCallback(async () => {
//     try {
//       const token = localStorage.getItem('token');
//       const response = await axios.get(`${BASE_URL}/api/items?limit=100`, {
//         headers: { 'Authorization': `Bearer ${token}` }
//       });
      
//       if (response.data.success) {
//         setItems(response.data.data || []);
//       }
//     } catch (err) {
//       console.error('Error fetching items:', err);
//     }
//   }, []);
  
//   useEffect(() => {
//     if (open) {
//       fetchCustomers();
//       fetchQuotations();
//       fetchItems();
//     }
//   }, [open, fetchCustomers, fetchQuotations, fetchItems]);
  
//   // Handle customer added from AddCustomer dialog
//   const handleCustomerAdded = (newCustomer) => {
//     setCustomers(prev => [...prev, newCustomer]);
//     // Auto-select the newly added customer
//     setFormData(prev => ({ ...prev, customer_id: newCustomer._id }));
//   };
  
//   // Handle item added from AddItem dialog
//   const handleItemAdded = (newItem) => {
//     setItems(prev => [...prev, newItem]);
    
//     // If we were adding from a specific item row, auto-select it
//     if (currentItemIndex !== null) {
//       handleItemChange(currentItemIndex, 'item_id', newItem._id);
//     }
//     setCurrentItemIndex(null);
//   };
  
//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData(prev => ({ ...prev, [name]: value }));
//     setFieldErrors(prev => ({ ...prev, [name]: '' }));
//   };
  
//   const applyQuotation = (quotation, keepCustomer = false) => {
//     if (!quotation) return;
    
//     const quotationCustomerId = quotation.CustomerId?._id || quotation.CustomerId;
//     const currentCustomerId = formData.customer_id;
    
//     setFormData(prev => ({
//       ...prev,
//       quotation_id: quotation._id,
//       quotation_no: quotation.QuotationNo,
//       customer_id: keepCustomer ? currentCustomerId : quotationCustomerId,
//       payment_terms: quotation.PaymentTerms || '',
//       currency: quotation.Currency || 'INR'
//     }));
    
//     // Populate items from quotation
//     if (quotation.Items && quotation.Items.length > 0) {
//       const newItems = quotation.Items.map((item) => ({
//         item_id: item.ItemId?._id || item.ItemId || '',
//         part_no: item.PartNo || '',
//         part_name: item.PartName || '',
//         hsn_code: item.HSNCode || '',
//         unit: item.Unit || 'Nos',
//         ordered_qty: item.Quantity || 1,
//         unit_price: item.UnitPrice || 0,
//         discount_percent: item.DiscountPercent || 0,
//         required_date: formData.expected_delivery_date || new Date().toISOString().split('T')[0],
//         committed_date: formData.expected_delivery_date || new Date().toISOString().split('T')[0],
//         remarks: item.Remarks || ''
//       }));
//       setSoItems(newItems);
//       calculateTotals(newItems);
//     }
    
//     setQuotationConflict(false);
//     setPendingQuotation(null);
//   };
  
//   const handleQuotationSelect = (quotation) => {
//     if (!quotation) return;
    
//     const quotationCustomerId = quotation.CustomerId?._id || quotation.CustomerId;
    
//     // If a customer is already selected and it's different from quotation's customer
//     if (formData.customer_id && formData.customer_id !== quotationCustomerId) {
//       // Show conflict dialog
//       setPendingQuotation(quotation);
//       setQuotationConflict(true);
//       return;
//     }
    
//     // Proceed with updating customer
//     applyQuotation(quotation, false);
//   };
  
//   const handleItemChange = (index, field, value) => {
//     const updatedItems = [...soItems];
//     updatedItems[index][field] = value;
    
//     // Auto-fill item details when item_id is selected
//     if (field === 'item_id' && value) {
//       const selectedItem = items.find(item => item._id === value);
//       if (selectedItem) {
//         updatedItems[index].part_no = selectedItem.part_no || '';
//         updatedItems[index].part_name = selectedItem.part_description || '';
//         updatedItems[index].hsn_code = selectedItem.hsn_code || '';
//         updatedItems[index].unit = selectedItem.unit || 'Nos';
//       }
//     }
    
//     setSoItems(updatedItems);
//     setFieldErrors(prev => ({ ...prev, [`item_${index}_${field}`]: '' }));
//     calculateTotals(updatedItems);
//   };
  
//   const calculateTotals = (items) => {
//     let sub_total = 0;
//     let discount_total = 0;
    
//     items.forEach(item => {
//       const qty = Number(item.ordered_qty) || 0;
//       const price = Number(item.unit_price) || 0;
//       const discount = Number(item.discount_percent) || 0;
      
//       const item_total = qty * price;
//       const item_discount = (item_total * discount) / 100;
      
//       sub_total += item_total;
//       discount_total += item_discount;
//     });
    
//     const taxable_total = sub_total - discount_total;
//     const gst_total = (taxable_total * 18) / 100; // Assuming 18% GST
//     const grand_total = taxable_total + gst_total;
    
//     setCalculatedTotals({
//       sub_total,
//       discount_total,
//       taxable_total,
//       gst_total,
//       grand_total
//     });
//   };
  
//   const addItem = () => {
//     setSoItems([
//       ...soItems,
//       {
//         item_id: '',
//         part_no: '',
//         part_name: '',
//         hsn_code: '',
//         unit: 'Nos',
//         ordered_qty: 1,
//         unit_price: 0,
//         discount_percent: 0,
//         required_date: new Date().toISOString().split('T')[0],
//         committed_date: new Date().toISOString().split('T')[0],
//         remarks: ''
//       }
//     ]);
//   };
  
//   const removeItem = (index) => {
//     if (soItems.length > 1) {
//       const updatedItems = soItems.filter((_, i) => i !== index);
//       setSoItems(updatedItems);
//       calculateTotals(updatedItems);
//     }
//   };
  
//   const openAddItemDialog = (index) => {
//     setCurrentItemIndex(index);
//     setAddItemOpen(true);
//   };
  
//   const validateStep = (step) => {
//     const errors = {};
//     let isValid = true;
    
//     switch (step) {
//       case 0: // Basic Information
//         if (!formData.customer_id) {
//           errors.customer_id = 'Customer is required';
//           isValid = false;
//         }
//         if (!formData.expected_delivery_date) {
//           errors.expected_delivery_date = 'Expected delivery date is required';
//           isValid = false;
//         }
//         break;
        
//       case 2: // Items
//         soItems.forEach((item, index) => {
//           if (!item.item_id) {
//             errors[`item_${index}_item_id`] = `Item ${index + 1}: Item is required`;
//             isValid = false;
//           }
//           if (!item.ordered_qty || item.ordered_qty <= 0) {
//             errors[`item_${index}_ordered_qty`] = `Item ${index + 1}: Valid quantity is required`;
//             isValid = false;
//           }
//           if (!item.unit_price || item.unit_price <= 0) {
//             errors[`item_${index}_unit_price`] = `Item ${index + 1}: Valid unit price is required`;
//             isValid = false;
//           }
//         });
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
    
//     if (!formData.customer_id) {
//       errors.customer_id = 'Customer is required';
//       isValid = false;
//     }
    
//     if (!formData.expected_delivery_date) {
//       errors.expected_delivery_date = 'Expected delivery date is required';
//       isValid = false;
//     }
    
//     soItems.forEach((item, index) => {
//       if (!item.item_id) {
//         errors[`item_${index}_item_id`] = `Item ${index + 1}: Item is required`;
//         isValid = false;
//       }
//       if (!item.ordered_qty || item.ordered_qty <= 0) {
//         errors[`item_${index}_ordered_qty`] = `Item ${index + 1}: Valid quantity is required`;
//         isValid = false;
//       }
//       if (!item.unit_price || item.unit_price <= 0) {
//         errors[`item_${index}_unit_price`] = `Item ${index + 1}: Valid unit price is required`;
//         isValid = false;
//       }
//     });
    
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
  
//  const handleSubmit = async () => {
//   if (!validateAllFields()) {
//     return;
//   }
  
//   setLoading(true);
//   setError('');
  
//   try {
//     const token = localStorage.getItem('token');
    
//     const submitData = {
//       ...formData,
//       items: soItems.map(item => ({
//         item_id: item.item_id,
//         part_no: item.part_no,        // Add this
//         part_name: item.part_name,    // Add this (optional)
//         hsn_code: item.hsn_code,      // Add this
//         unit: item.unit,              // Add this
//         ordered_qty: Number(item.ordered_qty),
//         unit_price: Number(item.unit_price),
//         discount_percent: Number(item.discount_percent),
//         required_date: item.required_date,
//         committed_date: item.committed_date,
//         remarks: item.remarks
//       }))
//     };
    
//     const response = await axios.post(`${BASE_URL}/api/sales-orders`, submitData, {
//       headers: {
//         'Authorization': `Bearer ${token}`,
//         'Content-Type': 'application/json'
//       }
//     });
    
//     if (response.data.success) {
//       onAdd(response.data.data);
//       resetForm();
//       onClose();
//     } else {
//       setError(response.data.message || 'Failed to add Sales Order');
//     }
//   } catch (err) {
//     console.error('Error adding Sales Order:', err);
//     setError(err.response?.data?.message || 'Failed to add Sales Order. Please try again.');
//   } finally {
//     setLoading(false);
//   }
// };
  
//   const resetForm = () => {
//     setActiveStep(0);
//     setFormData({
//       customer_id: '',
//       quotation_id: '',
//       quotation_no: '',
//       customer_po_number: '',
//       customer_po_date: new Date().toISOString().split('T')[0],
//       payment_terms: '',
//       delivery_terms: '',
//       delivery_mode: '',
//       expected_delivery_date: new Date().toISOString().split('T')[0],
//       internal_remarks: '',
//       currency: 'INR'
//     });
//     setSoItems([
//       {
//         item_id: '',
//         part_no: '',
//         part_name: '',
//         hsn_code: '',
//         unit: 'Nos',
//         ordered_qty: 1,
//         unit_price: 0,
//         discount_percent: 0,
//         required_date: new Date().toISOString().split('T')[0],
//         committed_date: new Date().toISOString().split('T')[0],
//         remarks: ''
//       }
//     ]);
//     setCalculatedTotals({
//       sub_total: 0,
//       discount_total: 0,
//       taxable_total: 0,
//       gst_total: 0,
//       grand_total: 0
//     });
//     setFieldErrors({});
//     setError('');
//     setQuotationConflict(false);
//     setPendingQuotation(null);
//     setCurrentItemIndex(null);
//   };
  
//   const handleClose = () => {
//     resetForm();
//     onClose();
//   };
  
//   const formatCurrency = (amount) => {
//     if (!amount && amount !== 0) return '-';
//     return new Intl.NumberFormat('en-IN', {
//       style: 'currency',
//       currency: formData.currency || 'INR',
//       minimumFractionDigits: 2
//     }).format(amount);
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
//       case 0:
//         return (
//           <Stack spacing={2}>
//             {/* Basic Information Section */}
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
//                 <BusinessIcon sx={{ fontSize: '1rem', mr: 0.5, verticalAlign: 'middle' }} />
//                 Order Details
//               </Typography>
              
//               <Grid container spacing={1.5}>
//                 <Grid size={{ xs: 12, sm: 6 }}>
//                   <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//                     <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
//                       <Label required>CUSTOMER</Label>
//                       <Tooltip title="Add New Customer">
//                         <IconButton
//                           size="small"
//                           onClick={() => setAddCustomerOpen(true)}
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
//                       options={customers}
//                       getOptionLabel={(option) => `${option.customer_name} - ${option.customer_code}`}
//                       value={customers.find(c => c._id === formData.customer_id) || null}
//                       onChange={(event, newValue) => {
//                         setFormData(prev => ({ ...prev, customer_id: newValue?._id || '' }));
//                         setFieldErrors(prev => ({ ...prev, customer_id: '' }));
//                       }}
//                       loading={loadingData}
//                       renderInput={(params) => (
//                         <TextField
//                           {...params}
//                           size="small"
//                           error={!!fieldErrors.customer_id}
//                           helperText={fieldErrors.customer_id}
//                           sx={{
//                             '& .MuiOutlinedInput-root': {
//                               borderRadius: 1.5,
//                               fontSize: '0.75rem',
//                               '&:hover fieldset': { borderColor: COLORS.primary },
//                               '&.Mui-focused fieldset': { borderColor: COLORS.primary, borderWidth: 1 },
//                               '&.Mui-error fieldset': { borderColor: '#EF4444' }
//                             },
//                             '& .MuiInputBase-input': {
//                               py: 1,
//                               px: 1.5,
//                               fontSize: '0.75rem',
//                               color: COLORS.text.primary
//                             }
//                           }}
//                         />
//                       )}
//                     />
//                   </Box>
//                 </Grid>
                
//                 <Grid size={{ xs: 12, sm: 6 }}>
//                   <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//                     <Label>REFERENCE QUOTATION</Label>
//                     <Autocomplete
//                       fullWidth
//                       options={quotations}
//                       getOptionLabel={(option) => `${option.QuotationNo} - ${option.CustomerName}`}
//                       value={quotations.find(q => q._id === formData.quotation_id) || null}
//                       onChange={(event, newValue) => handleQuotationSelect(newValue)}
//                       loading={loadingData}
//                       renderInput={(params) => (
//                         <TextField
//                           {...params}
//                           size="small"
//                           placeholder="Optional"
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
//                               color: COLORS.text.primary
//                             }
//                           }}
//                         />
//                       )}
//                     />
//                   </Box>
//                 </Grid>
                
//                 <Grid size={{ xs: 12, sm: 6 }}>
//                   <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//                     <Label>CUSTOMER PO NUMBER</Label>
//                     <TextField
//                       fullWidth
//                       size="small"
//                       name="customer_po_number"
//                       value={formData.customer_po_number}
//                       onChange={handleChange}
//                       placeholder="e.g., PO-2025-001"
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
//                   </Box>
//                 </Grid>
                
//                 <Grid size={{ xs: 12, sm: 6 }}>
//                   <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//                     <Label>CUSTOMER PO DATE</Label>
//                     <TextField
//                       fullWidth
//                       type="date"
//                       size="small"
//                       name="customer_po_date"
//                       value={formData.customer_po_date}
//                       onChange={handleChange}
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
//                         }
//                       }}
//                       InputLabelProps={{ shrink: true }}
//                     />
//                   </Box>
//                 </Grid>
//               </Grid>
//             </Paper>
            
//             {/* Additional Information Section */}
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
//                 Additional Information
//               </Typography>
              
//               <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//                 <Label>INTERNAL REMARKS</Label>
//                 <TextField
//                   fullWidth
//                   multiline
//                   rows={3}
//                   size="small"
//                   name="internal_remarks"
//                   value={formData.internal_remarks}
//                   onChange={handleChange}
//                   placeholder="Any internal notes or special instructions..."
//                   sx={{
//                     '& .MuiOutlinedInput-root': {
//                       borderRadius: 1.5,
//                       fontSize: '0.75rem',
//                       '&:hover fieldset': { borderColor: COLORS.primary },
//                       '&.Mui-focused fieldset': { borderColor: COLORS.primary, borderWidth: 1 }
//                     },
//                     '& .MuiInputBase-input': {
//                       py: 1,
//                       px: 1.5,
//                       fontSize: '0.75rem',
//                       color: COLORS.text.primary,
//                       '&::placeholder': {
//                         color: COLORS.text.tertiary,
//                         fontSize: '0.75rem'
//                       }
//                     }
//                   }}
//                 />
//               </Box>
//             </Paper>
//           </Stack>
//         );
        
//       case 1:
//         return (
//           <Stack spacing={2}>
//             {/* Delivery Information Section */}
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
//                 <ShippingIcon sx={{ fontSize: '1rem', mr: 0.5, verticalAlign: 'middle' }} />
//                 Delivery Information
//               </Typography>
              
//               <Grid container spacing={1.5}>
//                 <Grid size={{ xs: 12, sm: 6 }}>
//                   <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//                     <Label required>EXPECTED DELIVERY DATE</Label>
//                     <TextField
//                       fullWidth
//                       type="date"
//                       size="small"
//                       name="expected_delivery_date"
//                       value={formData.expected_delivery_date}
//                       onChange={handleChange}
//                       error={!!fieldErrors.expected_delivery_date}
//                       helperText={fieldErrors.expected_delivery_date}
//                       sx={{
//                         '& .MuiOutlinedInput-root': {
//                           borderRadius: 1.5,
//                           fontSize: '0.75rem',
//                           '&:hover fieldset': { borderColor: COLORS.primary },
//                           '&.Mui-focused fieldset': { borderColor: COLORS.primary, borderWidth: 1 },
//                           '&.Mui-error fieldset': { borderColor: '#EF4444' }
//                         },
//                         '& .MuiInputBase-input': {
//                           py: 1,
//                           px: 1.5,
//                           fontSize: '0.75rem',
//                           color: COLORS.text.primary
//                         }
//                       }}
//                       InputLabelProps={{ shrink: true }}
//                     />
//                   </Box>
//                 </Grid>
                
//                 <Grid size={{ xs: 12, sm: 6 }}>
//                   <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//                     <Label>PAYMENT TERMS</Label>
//                     <TextField
//                       fullWidth
//                       size="small"
//                       name="payment_terms"
//                       value={formData.payment_terms}
//                       onChange={handleChange}
//                       placeholder="e.g., Net 30, 50% Advance"
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
//                   </Box>
//                 </Grid>
                
//                 <Grid size={{ xs: 12, sm: 6 }}>
//                   <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//                     <Label>DELIVERY TERMS</Label>
//                     <FormControl fullWidth size="small">
//                       <Select
//                         name="delivery_terms"
//                         value={formData.delivery_terms}
//                         onChange={handleChange}
//                         sx={{
//                           borderRadius: 1.5,
//                           fontSize: '0.75rem',
//                           '& .MuiSelect-select': {
//                             py: 1,
//                             px: 1.5
//                           }
//                         }}
//                       >
//                         {DELIVERY_TERMS_OPTIONS.map(option => (
//                           <MenuItem key={option} value={option} sx={{ fontSize: '0.75rem' }}>
//                             {option || 'None'}
//                           </MenuItem>
//                         ))}
//                       </Select>
//                     </FormControl>
//                   </Box>
//                 </Grid>
                
//                 <Grid size={{ xs: 12, sm: 6 }}>
//                   <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//                     <Label>DELIVERY MODE</Label>
//                     <FormControl fullWidth size="small">
//                       <Select
//                         name="delivery_mode"
//                         value={formData.delivery_mode}
//                         onChange={handleChange}
//                         sx={{
//                           borderRadius: 1.5,
//                           fontSize: '0.75rem',
//                           '& .MuiSelect-select': {
//                             py: 1,
//                             px: 1.5
//                           }
//                         }}
//                       >
//                         {DELIVERY_MODE_OPTIONS.map(option => (
//                           <MenuItem key={option} value={option} sx={{ fontSize: '0.75rem' }}>
//                             {option || 'None'}
//                           </MenuItem>
//                         ))}
//                       </Select>
//                     </FormControl>
//                   </Box>
//                 </Grid>
//               </Grid>
//             </Paper>
            
//             {/* Financial Information Section */}
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
//                 <MoneyIcon sx={{ fontSize: '1rem', mr: 0.5, verticalAlign: 'middle' }} />
//                 Financial Information
//               </Typography>
              
//               <Grid container spacing={1.5}>
//                 <Grid size={{ xs: 12, sm: 6 }}>
//                   <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//                     <Label>CURRENCY</Label>
//                     <FormControl fullWidth size="small">
//                       <Select
//                         name="currency"
//                         value={formData.currency}
//                         onChange={handleChange}
//                         sx={{
//                           borderRadius: 1.5,
//                           fontSize: '0.75rem',
//                           '& .MuiSelect-select': {
//                             py: 1,
//                             px: 1.5
//                           }
//                         }}
//                       >
//                         {CURRENCY_OPTIONS.map(option => (
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
//           </Stack>
//         );
        
//       case 2:
//         return (
//           <Stack spacing={2}>
//             {/* Order Items Section */}
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
//                 Order Items <span style={{ color: '#EF4444' }}>*</span>
//               </Typography>
              
//               {soItems.map((item, index) => (
//                 <Paper
//                   key={index}
//                   sx={{
//                     p: 2,
//                     mb: 2,
//                     bgcolor: COLORS.background.light,
//                     borderRadius: 1.5,
//                     border: `1px solid ${COLORS.border}`
//                   }}
//                 >
//                   <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.5 }}>
//                     <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary }}>
//                       Item {index + 1}
//                     </Typography>
//                     {soItems.length > 1 && (
//                       <IconButton
//                         size="small"
//                         onClick={() => removeItem(index)}
//                         sx={{ color: '#EF4444' }}
//                       >
//                         <DeleteIcon fontSize="small" />
//                       </IconButton>
//                     )}
//                   </Stack>
                  
//                   <Grid container spacing={1.5}>
//                     <Grid size={{ xs: 12 }}>
//                       <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//                         <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
//                           <Label required>ITEM</Label>
//                           <Tooltip title="Add New Item">
//                             <IconButton
//                               size="small"
//                               onClick={() => openAddItemDialog(index)}
//                               sx={{
//                                 color: COLORS.primary,
//                                 p: 0.25,
//                                 '&:hover': { bgcolor: COLORS.primaryLight }
//                               }}
//                             >
//                               <AddIcon sx={{ fontSize: '0.8rem' }} />
//                             </IconButton>
//                           </Tooltip>
//                         </Box>
//                         <Autocomplete
//                           fullWidth
//                           options={items}
//                           getOptionLabel={(option) => `${option.part_no} - ${option.part_description}`}
//                           value={items.find(i => i._id === item.item_id) || null}
//                           onChange={(event, newValue) => handleItemChange(index, 'item_id', newValue?._id || '')}
//                           loading={loadingData}
//                           renderInput={(params) => (
//                             <TextField
//                               {...params}
//                               size="small"
//                               error={!!fieldErrors[`item_${index}_item_id`]}
//                               helperText={fieldErrors[`item_${index}_item_id`]}
//                               sx={{
//                                 '& .MuiOutlinedInput-root': {
//                                   borderRadius: 1.5,
//                                   fontSize: '0.75rem',
//                                   '&:hover fieldset': { borderColor: COLORS.primary },
//                                   '&.Mui-focused fieldset': { borderColor: COLORS.primary, borderWidth: 1 },
//                                   '&.Mui-error fieldset': { borderColor: '#EF4444' }
//                                 },
//                                 '& .MuiInputBase-input': {
//                                   py: 1,
//                                   px: 1.5,
//                                   fontSize: '0.75rem',
//                                   color: COLORS.text.primary
//                                 }
//                               }}
//                             />
//                           )}
//                         />
//                       </Box>
//                     </Grid>
                    
//                     <Grid size={{ xs: 6, sm: 3 }}>
//                       <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//                         <Label>PART NO</Label>
//                         <TextField
//                           fullWidth
//                           size="small"
//                           value={item.part_no}
//                           disabled
//                           sx={{
//                             '& .MuiOutlinedInput-root': {
//                               borderRadius: 1.5,
//                               fontSize: '0.75rem',
//                               backgroundColor: COLORS.background.light
//                             },
//                             '& .MuiInputBase-input': {
//                               py: 1,
//                               px: 1.5,
//                               fontSize: '0.75rem',
//                               color: COLORS.text.secondary
//                             }
//                           }}
//                         />
//                       </Box>
//                     </Grid>
                    
//                     <Grid size={{ xs: 6, sm: 3 }}>
//                       <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//                         <Label>HSN CODE</Label>
//                         <TextField
//                           fullWidth
//                           size="small"
//                           value={item.hsn_code}
//                           disabled
//                           sx={{
//                             '& .MuiOutlinedInput-root': {
//                               borderRadius: 1.5,
//                               fontSize: '0.75rem',
//                               backgroundColor: COLORS.background.light
//                             },
//                             '& .MuiInputBase-input': {
//                               py: 1,
//                               px: 1.5,
//                               fontSize: '0.75rem',
//                               color: COLORS.text.secondary
//                             }
//                           }}
//                         />
//                       </Box>
//                     </Grid>
                    
//                     <Grid size={{ xs: 6, sm: 2 }}>
//                       <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//                         <Label>UNIT</Label>
//                         <FormControl fullWidth size="small">
//                           <Select
//                             value={item.unit}
//                             onChange={(e) => handleItemChange(index, 'unit', e.target.value)}
//                             sx={{
//                               borderRadius: 1.5,
//                               fontSize: '0.75rem',
//                               '& .MuiSelect-select': {
//                                 py: 1,
//                                 px: 1.5
//                               }
//                             }}
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
//                         <Label required>QUANTITY</Label>
//                         <TextField
//                           fullWidth
//                           type="number"
//                           size="small"
//                           value={item.ordered_qty}
//                           onChange={(e) => handleItemChange(index, 'ordered_qty', e.target.value)}
//                           error={!!fieldErrors[`item_${index}_ordered_qty`]}
//                           helperText={fieldErrors[`item_${index}_ordered_qty`]}
//                           sx={{
//                             '& .MuiOutlinedInput-root': {
//                               borderRadius: 1.5,
//                               fontSize: '0.75rem',
//                               '&:hover fieldset': { borderColor: COLORS.primary },
//                               '&.Mui-focused fieldset': { borderColor: COLORS.primary, borderWidth: 1 },
//                               '&.Mui-error fieldset': { borderColor: '#EF4444' }
//                             },
//                             '& .MuiInputBase-input': {
//                               py: 1,
//                               px: 1.5,
//                               fontSize: '0.75rem',
//                               color: COLORS.text.primary
//                             }
//                           }}
//                         />
//                       </Box>
//                     </Grid>
                    
//                     <Grid size={{ xs: 6, sm: 2 }}>
//                       <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//                         <Label required>UNIT PRICE</Label>
//                         <TextField
//                           fullWidth
//                           type="number"
//                           size="small"
//                           value={item.unit_price}
//                           onChange={(e) => handleItemChange(index, 'unit_price', e.target.value)}
//                           error={!!fieldErrors[`item_${index}_unit_price`]}
//                           helperText={fieldErrors[`item_${index}_unit_price`]}
//                           sx={{
//                             '& .MuiOutlinedInput-root': {
//                               borderRadius: 1.5,
//                               fontSize: '0.75rem',
//                               '&:hover fieldset': { borderColor: COLORS.primary },
//                               '&.Mui-focused fieldset': { borderColor: COLORS.primary, borderWidth: 1 },
//                               '&.Mui-error fieldset': { borderColor: '#EF4444' }
//                             },
//                             '& .MuiInputBase-input': {
//                               py: 1,
//                               px: 1.5,
//                               fontSize: '0.75rem',
//                               color: COLORS.text.primary
//                             }
//                           }}
//                         />
//                       </Box>
//                     </Grid>
                    
//                     <Grid size={{ xs: 6, sm: 2 }}>
//                       <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//                         <Label>DISCOUNT %</Label>
//                         <TextField
//                           fullWidth
//                           type="number"
//                           size="small"
//                           value={item.discount_percent}
//                           onChange={(e) => handleItemChange(index, 'discount_percent', e.target.value)}
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
//                               color: COLORS.text.primary
//                             }
//                           }}
//                         />
//                       </Box>
//                     </Grid>
                    
//                     <Grid size={{ xs: 12, sm: 6 }}>
//                       <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//                         <Label>REQUIRED DATE</Label>
//                         <TextField
//                           fullWidth
//                           type="date"
//                           size="small"
//                           value={item.required_date}
//                           onChange={(e) => handleItemChange(index, 'required_date', e.target.value)}
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
//                               color: COLORS.text.primary
//                             }
//                           }}
//                           InputLabelProps={{ shrink: true }}
//                         />
//                       </Box>
//                     </Grid>
                    
//                     <Grid size={{ xs: 12, sm: 6 }}>
//                       <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//                         <Label>COMMITTED DATE</Label>
//                         <TextField
//                           fullWidth
//                           type="date"
//                           size="small"
//                           value={item.committed_date}
//                           onChange={(e) => handleItemChange(index, 'committed_date', e.target.value)}
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
//                               color: COLORS.text.primary
//                             }
//                           }}
//                           InputLabelProps={{ shrink: true }}
//                         />
//                       </Box>
//                     </Grid>
                    
//                     <Grid size={{ xs: 12 }}>
//                       <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//                         <Label>REMARKS</Label>
//                         <TextField
//                           fullWidth
//                           size="small"
//                           value={item.remarks}
//                           onChange={(e) => handleItemChange(index, 'remarks', e.target.value)}
//                           placeholder="Additional notes..."
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
//                             }
//                           }}
//                         />
//                       </Box>
//                     </Grid>
//                   </Grid>
//                 </Paper>
//               ))}
              
//               <Button
//                 variant="outlined"
//                 startIcon={<AddIcon sx={{ fontSize: '1rem' }} />}
//                 onClick={addItem}
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
//                 Add Item
//               </Button>
//             </Paper>
//           </Stack>
//         );
        
//       case 3:
//         return (
//           <Stack spacing={2}>
//             {/* Review Section */}
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
//                 {/* Customer Info Summary */}
//                 <Paper sx={{ p: 2, bgcolor: COLORS.background.light, borderRadius: 1.5 }}>
//                   <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: COLORS.primary, mb: 1 }}>
//                     Customer Information
//                   </Typography>
//                   <Grid container spacing={1}>
//                     <Grid size={{ xs: 6 }}>
//                       <Typography sx={{ fontSize: '0.7rem', color: COLORS.text.secondary }}>Customer:</Typography>
//                     </Grid>
//                     <Grid size={{ xs: 6 }}>
//                       <Typography sx={{ fontSize: '0.7rem', fontWeight: 500 }}>
//                         {customers.find(c => c._id === formData.customer_id)?.customer_name || '-'}
//                       </Typography>
//                     </Grid>
//                     <Grid size={{ xs: 6 }}>
//                       <Typography sx={{ fontSize: '0.7rem', color: COLORS.text.secondary }}>PO Number:</Typography>
//                     </Grid>
//                     <Grid size={{ xs: 6 }}>
//                       <Typography sx={{ fontSize: '0.7rem', fontWeight: 500 }}>{formData.customer_po_number || '-'}</Typography>
//                     </Grid>
//                     <Grid size={{ xs: 6 }}>
//                       <Typography sx={{ fontSize: '0.7rem', color: COLORS.text.secondary }}>Expected Delivery:</Typography>
//                     </Grid>
//                     <Grid size={{ xs: 6 }}>
//                       <Typography sx={{ fontSize: '0.7rem', fontWeight: 500 }}>{formData.expected_delivery_date}</Typography>
//                     </Grid>
//                     <Grid size={{ xs: 6 }}>
//                       <Typography sx={{ fontSize: '0.7rem', color: COLORS.text.secondary }}>Currency:</Typography>
//                     </Grid>
//                     <Grid size={{ xs: 6 }}>
//                       <Typography sx={{ fontSize: '0.7rem', fontWeight: 500 }}>{formData.currency}</Typography>
//                     </Grid>
//                   </Grid>
//                 </Paper>
                
//                 {/* Items Summary */}
//                 <Paper sx={{ p: 2, bgcolor: COLORS.background.light, borderRadius: 1.5 }}>
//                   <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: COLORS.primary, mb: 1 }}>
//                     Order Summary
//                   </Typography>
//                   <TableContainer>
//                     <Table size="small">
//                       <TableHead>
//                         <TableRow>
//                           <TableCell sx={{ fontSize: '0.65rem', fontWeight: 600, color: COLORS.text.secondary }}>Item</TableCell>
//                           <TableCell sx={{ fontSize: '0.65rem', fontWeight: 600, color: COLORS.text.secondary }}>Qty</TableCell>
//                           <TableCell sx={{ fontSize: '0.65rem', fontWeight: 600, color: COLORS.text.secondary }}>Unit</TableCell>
//                           <TableCell sx={{ fontSize: '0.65rem', fontWeight: 600, color: COLORS.text.secondary }} align="right">Price</TableCell>
//                           <TableCell sx={{ fontSize: '0.65rem', fontWeight: 600, color: COLORS.text.secondary }} align="right">Total</TableCell>
//                         </TableRow>
//                       </TableHead>
//                       <TableBody>
//                         {soItems.map((item, idx) => {
//                           const total = (item.ordered_qty * item.unit_price) * (1 - (item.discount_percent / 100));
//                           return (
//                             <TableRow key={idx}>
//                               <TableCell sx={{ fontSize: '0.7rem' }}>{item.part_no || '-'}</TableCell>
//                               <TableCell sx={{ fontSize: '0.7rem' }}>{item.ordered_qty}</TableCell>
//                               <TableCell sx={{ fontSize: '0.7rem' }}>{item.unit}</TableCell>
//                               <TableCell sx={{ fontSize: '0.7rem' }} align="right">{formatCurrency(item.unit_price)}</TableCell>
//                               <TableCell sx={{ fontSize: '0.7rem' }} align="right">{formatCurrency(total)}</TableCell>
//                             </TableRow>
//                           );
//                         })}
//                       </TableBody>
//                     </Table>
//                   </TableContainer>
                  
//                   <Divider sx={{ my: 2 }} />
                  
//                   <Stack spacing={1}>
//                     <Stack direction="row" justifyContent="space-between">
//                       <Typography sx={{ fontSize: '0.7rem', color: COLORS.text.secondary }}>Sub Total:</Typography>
//                       <Typography sx={{ fontSize: '0.7rem', fontWeight: 500 }}>{formatCurrency(calculatedTotals.sub_total)}</Typography>
//                     </Stack>
//                     <Stack direction="row" justifyContent="space-between">
//                       <Typography sx={{ fontSize: '0.7rem', color: COLORS.text.secondary }}>Discount:</Typography>
//                       <Typography sx={{ fontSize: '0.7rem', fontWeight: 500 }}>{formatCurrency(calculatedTotals.discount_total)}</Typography>
//                     </Stack>
//                     <Stack direction="row" justifyContent="space-between">
//                       <Typography sx={{ fontSize: '0.7rem', color: COLORS.text.secondary }}>Taxable Amount:</Typography>
//                       <Typography sx={{ fontSize: '0.7rem', fontWeight: 500 }}>{formatCurrency(calculatedTotals.taxable_total)}</Typography>
//                     </Stack>
//                     <Stack direction="row" justifyContent="space-between">
//                       <Typography sx={{ fontSize: '0.7rem', color: COLORS.text.secondary }}>GST (18%):</Typography>
//                       <Typography sx={{ fontSize: '0.7rem', fontWeight: 500 }}>{formatCurrency(calculatedTotals.gst_total)}</Typography>
//                     </Stack>
//                     <Divider />
//                     <Stack direction="row" justifyContent="space-between">
//                       <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: COLORS.primary }}>Grand Total:</Typography>
//                       <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: '#059669' }}>{formatCurrency(calculatedTotals.grand_total)}</Typography>
//                     </Stack>
//                   </Stack>
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
//     <>
//       <Dialog
//         open={open}
//         onClose={handleClose}
//         maxWidth="md"
//         fullWidth
//         PaperProps={{
//           sx: {
//             borderRadius: 2,
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
//           bgcolor: COLORS.background.white,
//           display: 'flex',
//           justifyContent: 'space-between',
//           alignItems: 'center'
//         }}>
//           <Typography sx={{ fontSize: '1.2rem', fontWeight: 700, color: COLORS.text.primary }}>
//             Add New Sales Order
//           </Typography>
//           <IconButton onClick={handleClose} size="small">
//             <CloseIcon fontSize="small" />
//           </IconButton>
//         </DialogTitle>
        
//         {/* Modern Stepper with Primary Color */}
//         <Box sx={{ px: 2.5, pt: 2, bgcolor: COLORS.background.white }}>
//           <Stepper
//             activeStep={activeStep}
//             alternativeLabel
//             connector={<ColorConnector />}
//           >
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
        
//         <DialogContent sx={{ p: 2.5, bgcolor: COLORS.background.white }}>
//           {renderStepContent(activeStep)}
          
//           {error && (
//             <Alert 
//               severity="error" 
//               sx={{ 
//                 mt: 2, 
//                 borderRadius: 1.5,
//                 fontSize: '0.75rem',
//                 py: 0.5,
//                 '& .MuiAlert-icon': { fontSize: '1.25rem' }
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
//           justifyContent: 'space-between'
//         }}>
//           <Button
//             onClick={handleBack}
//             disabled={activeStep === 0 || loading}
//             size="small"
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
//               size="small"
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
//                 size="small"
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
//                 {loading ? 'Creating...' : 'Create Sales Order'}
//               </Button>
//             ) : (
//               <Button
//                 variant="contained"
//                 onClick={handleNext}
//                 disabled={loading}
//                 size="small"
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
      
//       {/* Quotation Conflict Dialog */}
//       <Dialog
//         open={quotationConflict}
//         onClose={() => setQuotationConflict(false)}
//         maxWidth="sm"
//         fullWidth
//         PaperProps={{
//           sx: {
//             borderRadius: 2,
//             border: `1px solid ${COLORS.border}`,
//           }
//         }}
//       >
//         <DialogTitle sx={{ 
//           py: 1.5, 
//           px: 2.5, 
//           mb: 2,
//           borderBottom: `1px solid ${COLORS.border}`,
//           display: 'flex',
//           justifyContent: 'space-between',
//           alignItems: 'center'
//         }}>
//           <Typography sx={{ fontSize: '1rem', fontWeight: 600, color: COLORS.text.primary }}>
//             Customer Conflict
//           </Typography>
//           <IconButton onClick={() => setQuotationConflict(false)} size="small">
//             <CloseIcon fontSize="small" />
//           </IconButton>
//         </DialogTitle>
//         <DialogContent sx={{ p: 2.5 }}>
//           <Typography sx={{ fontSize: '0.8rem', color: COLORS.text.secondary, mb: 1 }}>
//             This quotation belongs to a different customer:
//           </Typography>
//           <Paper sx={{ p: 1.5, bgcolor: COLORS.background.light, borderRadius: 1.5, mb: 2 }}>
//             <Typography sx={{ fontSize: '0.75rem', fontWeight: 500, color: COLORS.primary }}>
//               {pendingQuotation?.CustomerName || 'Unknown Customer'}
//             </Typography>
//           </Paper>
//           <Typography sx={{ fontSize: '0.8rem', color: COLORS.text.secondary }}>
//             What would you like to do?
//           </Typography>
//         </DialogContent>
//         <DialogActions sx={{ 
//           px: 2.5, 
//           py: 1.5, 
//           borderTop: `1px solid ${COLORS.border}`, 
//           gap: 1 
//         }}>
//           <Button
//             onClick={() => applyQuotation(pendingQuotation, true)}
//             size="small"
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
//             Keep Current Customer
//           </Button>
//           <Button
//             variant="contained"
//             onClick={() => applyQuotation(pendingQuotation, false)}
//             size="small"
//             sx={{
//               height: 32,
//               px: 2,
//               borderRadius: 1.5,
//               bgcolor: COLORS.primary,
//               fontSize: '0.7rem',
//               fontWeight: 500,
//               textTransform: 'none',
//               '&:hover': { bgcolor: COLORS.primaryDark }
//             }}
//           >
//             Switch to Quotation's Customer
//           </Button>
//         </DialogActions>
//       </Dialog>
      
//       {/* Add Customer Dialog */}
//       <AddCustomer
//         open={addCustomerOpen}
//         onClose={() => setAddCustomerOpen(false)}
//         onAdd={handleCustomerAdded}
//       />
      
//       {/* Add Item Dialog */}
//       <AddItem
//         open={addItemOpen}
//         onClose={() => {
//           setAddItemOpen(false);
//           setCurrentItemIndex(null);
//         }}
//         onAdd={handleItemAdded}
//       />
//     </>
//   );
// };

// export default AddSaleOrder;




// import React, { useState, useEffect, useCallback } from 'react';
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
//   Alert,
//   IconButton,
//   FormControl,
//   Select,
//   MenuItem,
//   Autocomplete,
//   styled,
//   Divider,
//   Table,
//   TableBody,
//   TableCell,
//   TableContainer,
//   TableHead,
//   TableRow,
//   Tooltip,
//   Collapse
// } from '@mui/material';
// import {
//   Add as AddIcon,
//   Delete as DeleteIcon,
//   NavigateNext as NavigateNextIcon,
//   NavigateBefore as NavigateBeforeIcon,
//   Business as BusinessIcon,
//   Inventory as InventoryIcon,
//   LocalShipping as ShippingIcon,
//   AttachMoney as MoneyIcon,
//   Info as InfoIcon,
//   Close as CloseIcon,
//   Error as ErrorIcon
// } from '@mui/icons-material';
// import axios from 'axios';
// import BASE_URL from '../../config/Config';
// import AddItem from '../master/itemmaster/AddItem';
// import AddCustomer from '../master/customermaster/AddCustomer';

// // Color constants matching other components
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

// // Modern Stepper Connector with Primary Color
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

// // Options
// const CURRENCY_OPTIONS = ['INR', 'USD', 'EUR', 'GBP', 'AED'];
// const DELIVERY_TERMS_OPTIONS = ['Ex-Works', 'FOR Destination', 'CIF', 'FOB', ''];
// const DELIVERY_MODE_OPTIONS = ['Road', 'Rail', 'Air', 'Sea', 'Hand Delivery', ''];
// const UNIT_OPTIONS = ['Nos', 'Kg', 'Meter', 'Set', 'Piece'];

// const steps = ['Basic Information', 'Delivery & Financial', 'Items', 'Review & Submit'];

// const AddSaleOrder = ({ open, onClose, onAdd }) => {
//   const [activeStep, setActiveStep] = useState(0);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState('');
//   const [fieldErrors, setFieldErrors] = useState({});
  
//   // Quotation conflict dialog
//   const [quotationConflict, setQuotationConflict] = useState(false);
//   const [pendingQuotation, setPendingQuotation] = useState(null);
  
//   // Data from APIs
//   const [customers, setCustomers] = useState([]);
//   const [quotations, setQuotations] = useState([]);
//   const [items, setItems] = useState([]);
//   const [loadingData, setLoadingData] = useState(false);
  
//   // Dialog states for Add Customer and Add Item
//   const [addCustomerOpen, setAddCustomerOpen] = useState(false);
//   const [addItemOpen, setAddItemOpen] = useState(false);
//   const [currentItemIndex, setCurrentItemIndex] = useState(null);
  
//   // Form data
//   const [formData, setFormData] = useState({
//     customer_id: '',
//     quotation_id: '',
//     quotation_no: '',
//     customer_po_number: '',
//     customer_po_date: new Date().toISOString().split('T')[0],
//     payment_terms: '',
//     delivery_terms: '',
//     delivery_mode: '',
//     expected_delivery_date: new Date().toISOString().split('T')[0],
//     internal_remarks: '',
//     currency: 'INR'
//   });
  
//   const [soItems, setSoItems] = useState([
//     {
//       item_id: '',
//       part_no: '',
//       part_name: '',
//       hsn_code: '',
//       unit: 'Nos',
//       ordered_qty: 1,
//       unit_price: 0,
//       discount_percent: 0,
//       required_date: new Date().toISOString().split('T')[0],
//       committed_date: new Date().toISOString().split('T')[0],
//       remarks: ''
//     }
//   ]);
  
//   const [calculatedTotals, setCalculatedTotals] = useState({
//     sub_total: 0,
//     discount_total: 0,
//     taxable_total: 0,
//     gst_total: 0,
//     grand_total: 0
//   });

//   const showError = (message) => {
//     setError(message);
//     setTimeout(() => {
//       setError('');
//     }, 5000);
//   };
  
//   // Fetch customers
//   const fetchCustomers = useCallback(async () => {
//     try {
//       setLoadingData(true);
//       const token = localStorage.getItem('token');
//       const response = await axios.get(`${BASE_URL}/api/customers?limit=100`, {
//         headers: { 'Authorization': `Bearer ${token}` }
//       });
      
//       if (response.data.success) {
//         setCustomers(response.data.data || []);
//       }
//     } catch (err) {
//       console.error('Error fetching customers:', err);
//     } finally {
//       setLoadingData(false);
//     }
//   }, []);
  
//   // Fetch quotations
//   const fetchQuotations = useCallback(async () => {
//     try {
//       const token = localStorage.getItem('token');
//       const response = await axios.get(`${BASE_URL}/api/quotations?limit=100&status=Approved`, {
//         headers: { 'Authorization': `Bearer ${token}` }
//       });
      
//       if (response.data.success) {
//         setQuotations(response.data.data || []);
//       }
//     } catch (err) {
//       console.error('Error fetching quotations:', err);
//     }
//   }, []);
  
//   // Fetch items
//   const fetchItems = useCallback(async () => {
//     try {
//       const token = localStorage.getItem('token');
//       const response = await axios.get(`${BASE_URL}/api/items?limit=100`, {
//         headers: { 'Authorization': `Bearer ${token}` }
//       });
      
//       if (response.data.success) {
//         setItems(response.data.data || []);
//       }
//     } catch (err) {
//       console.error('Error fetching items:', err);
//     }
//   }, []);
  
//   useEffect(() => {
//     if (open) {
//       fetchCustomers();
//       fetchQuotations();
//       fetchItems();
//     }
//   }, [open, fetchCustomers, fetchQuotations, fetchItems]);
  
//   // Handle customer added from AddCustomer dialog
//   const handleCustomerAdded = (newCustomer) => {
//     setCustomers(prev => [...prev, newCustomer]);
//     setFormData(prev => ({ ...prev, customer_id: newCustomer._id }));
//   };
  
//   // Handle item added from AddItem dialog
//   const handleItemAdded = (newItem) => {
//     setItems(prev => [...prev, newItem]);
    
//     if (currentItemIndex !== null) {
//       handleItemChange(currentItemIndex, 'item_id', newItem._id);
//     }
//     setCurrentItemIndex(null);
//   };
  
//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData(prev => ({ ...prev, [name]: value }));
//     setFieldErrors(prev => ({ ...prev, [name]: '' }));
//   };
  
//   const applyQuotation = (quotation, keepCustomer = false) => {
//     if (!quotation) return;
    
//     const quotationCustomerId = quotation.CustomerId?._id || quotation.CustomerId;
//     const currentCustomerId = formData.customer_id;
    
//     setFormData(prev => ({
//       ...prev,
//       quotation_id: quotation._id,
//       quotation_no: quotation.QuotationNo,
//       customer_id: keepCustomer ? currentCustomerId : quotationCustomerId,
//       payment_terms: quotation.PaymentTerms || '',
//       currency: quotation.Currency || 'INR'
//     }));
    
//     if (quotation.Items && quotation.Items.length > 0) {
//       const newItems = quotation.Items.map((item) => ({
//         item_id: item.ItemId?._id || item.ItemId || '',
//         part_no: item.PartNo || '',
//         part_name: item.PartName || '',
//         hsn_code: item.HSNCode || '',
//         unit: item.Unit || 'Nos',
//         ordered_qty: item.Quantity || 1,
//         unit_price: item.UnitPrice || 0,
//         discount_percent: item.DiscountPercent || 0,
//         required_date: formData.expected_delivery_date || new Date().toISOString().split('T')[0],
//         committed_date: formData.expected_delivery_date || new Date().toISOString().split('T')[0],
//         remarks: item.Remarks || ''
//       }));
//       setSoItems(newItems);
//       calculateTotals(newItems);
//     }
    
//     setQuotationConflict(false);
//     setPendingQuotation(null);
//   };
  
//   const handleQuotationSelect = (quotation) => {
//     if (!quotation) return;
    
//     const quotationCustomerId = quotation.CustomerId?._id || quotation.CustomerId;
    
//     if (formData.customer_id && formData.customer_id !== quotationCustomerId) {
//       setPendingQuotation(quotation);
//       setQuotationConflict(true);
//       return;
//     }
    
//     applyQuotation(quotation, false);
//   };
  
//   const handleItemChange = (index, field, value) => {
//     const updatedItems = [...soItems];
//     updatedItems[index][field] = value;
    
//     if (field === 'item_id' && value) {
//       const selectedItem = items.find(item => item._id === value);
//       if (selectedItem) {
//         updatedItems[index].part_no = selectedItem.part_no || '';
//         updatedItems[index].part_name = selectedItem.part_description || '';
//         updatedItems[index].hsn_code = selectedItem.hsn_code || '';
//         updatedItems[index].unit = selectedItem.unit || 'Nos';
//       }
//     }
    
//     setSoItems(updatedItems);
//     setFieldErrors(prev => ({ ...prev, [`item_${index}_${field}`]: '' }));
//     calculateTotals(updatedItems);
//   };
  
//   const calculateTotals = (items) => {
//     let sub_total = 0;
//     let discount_total = 0;
    
//     items.forEach(item => {
//       const qty = Number(item.ordered_qty) || 0;
//       const price = Number(item.unit_price) || 0;
//       const discount = Number(item.discount_percent) || 0;
      
//       const item_total = qty * price;
//       const item_discount = (item_total * discount) / 100;
      
//       sub_total += item_total;
//       discount_total += item_discount;
//     });
    
//     const taxable_total = sub_total - discount_total;
//     const gst_total = (taxable_total * 18) / 100;
//     const grand_total = taxable_total + gst_total;
    
//     setCalculatedTotals({
//       sub_total,
//       discount_total,
//       taxable_total,
//       gst_total,
//       grand_total
//     });
//   };
  
//   const addItem = () => {
//     setSoItems([
//       ...soItems,
//       {
//         item_id: '',
//         part_no: '',
//         part_name: '',
//         hsn_code: '',
//         unit: 'Nos',
//         ordered_qty: 1,
//         unit_price: 0,
//         discount_percent: 0,
//         required_date: new Date().toISOString().split('T')[0],
//         committed_date: new Date().toISOString().split('T')[0],
//         remarks: ''
//       }
//     ]);
//   };
  
//   const removeItem = (index) => {
//     if (soItems.length > 1) {
//       const updatedItems = soItems.filter((_, i) => i !== index);
//       setSoItems(updatedItems);
//       calculateTotals(updatedItems);
//     }
//   };
  
//   const openAddItemDialog = (index) => {
//     setCurrentItemIndex(index);
//     setAddItemOpen(true);
//   };

//   const validateItemFields = (items) => {
//     let isValid = true;
//     let errorMessages = [];

//     items.forEach((item, index) => {
//       if (!item.item_id) {
//         errorMessages.push(`Item ${index + 1}: Please select an item`);
//         isValid = false;
//       }
//       if (!item.ordered_qty || item.ordered_qty <= 0) {
//         errorMessages.push(`Item ${index + 1}: Please enter a valid quantity`);
//         isValid = false;
//       }
//       if (!item.unit_price || item.unit_price <= 0) {
//         errorMessages.push(`Item ${index + 1}: Please enter a valid unit price`);
//         isValid = false;
//       }
//     });

//     if (!isValid) {
//       showError(errorMessages[0]);
//     }
//     return isValid;
//   };
  
//   const validateStep = (step) => {
//     const errors = {};
//     let isValid = true;
//     let errorMessages = [];

//     switch (step) {
//       case 0: // Basic Information
//         if (!formData.customer_id) {
//           errors.customer_id = 'Customer is required';
//           errorMessages.push('Customer is required');
//           isValid = false;
//         }
//         if (!formData.expected_delivery_date) {
//           errors.expected_delivery_date = 'Expected delivery date is required';
//           errorMessages.push('Expected delivery date is required');
//           isValid = false;
//         }
//         break;
        
//       case 2: // Items
//         soItems.forEach((item, index) => {
//           if (!item.item_id) {
//             errors[`item_${index}_item_id`] = `Item ${index + 1}: Item is required`;
//             errorMessages.push(`Item ${index + 1}: Please select an item`);
//             isValid = false;
//           }
//           if (!item.ordered_qty || item.ordered_qty <= 0) {
//             errors[`item_${index}_ordered_qty`] = `Item ${index + 1}: Valid quantity is required`;
//             errorMessages.push(`Item ${index + 1}: Please enter a valid quantity`);
//             isValid = false;
//           }
//           if (!item.unit_price || item.unit_price <= 0) {
//             errors[`item_${index}_unit_price`] = `Item ${index + 1}: Valid unit price is required`;
//             errorMessages.push(`Item ${index + 1}: Please enter a valid unit price`);
//             isValid = false;
//           }
//         });
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
//     const errors = {};
//     let isValid = true;
//     let errorMessages = [];

//     if (!formData.customer_id) {
//       errors.customer_id = 'Customer is required';
//       errorMessages.push('Customer is required');
//       isValid = false;
//     }
    
//     if (!formData.expected_delivery_date) {
//       errors.expected_delivery_date = 'Expected delivery date is required';
//       errorMessages.push('Expected delivery date is required');
//       isValid = false;
//     }
    
//     soItems.forEach((item, index) => {
//       if (!item.item_id) {
//         errors[`item_${index}_item_id`] = `Item ${index + 1}: Item is required`;
//         errorMessages.push(`Item ${index + 1}: Please select an item`);
//         isValid = false;
//       }
//       if (!item.ordered_qty || item.ordered_qty <= 0) {
//         errors[`item_${index}_ordered_qty`] = `Item ${index + 1}: Valid quantity is required`;
//         errorMessages.push(`Item ${index + 1}: Please enter a valid quantity`);
//         isValid = false;
//       }
//       if (!item.unit_price || item.unit_price <= 0) {
//         errors[`item_${index}_unit_price`] = `Item ${index + 1}: Valid unit price is required`;
//         errorMessages.push(`Item ${index + 1}: Please enter a valid unit price`);
//         isValid = false;
//       }
//     });
    
//     setFieldErrors(errors);
//     if (!isValid) {
//       showError(errorMessages[0]);
//     }
//     return isValid;
//   };
  
//   const handleNext = () => {
//     if (validateStep(activeStep)) {
//       setActiveStep((prevStep) => prevStep + 1);
//     }
//   };
  
//   const handleBack = () => {
//     setActiveStep((prevStep) => prevStep - 1);
//   };
  
//   const handleSubmit = async () => {
//     if (!validateAllFields()) {
//       return;
//     }
    
//     setLoading(true);
    
//     try {
//       const token = localStorage.getItem('token');
      
//       const submitData = {
//         ...formData,
//         items: soItems.map(item => ({
//           item_id: item.item_id,
//           part_no: item.part_no,
//           part_name: item.part_name,
//           hsn_code: item.hsn_code,
//           unit: item.unit,
//           ordered_qty: Number(item.ordered_qty),
//           unit_price: Number(item.unit_price),
//           discount_percent: Number(item.discount_percent),
//           required_date: item.required_date,
//           committed_date: item.committed_date,
//           remarks: item.remarks
//         }))
//       };
      
//       const response = await axios.post(`${BASE_URL}/api/sales-orders`, submitData, {
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
//         showError(response.data.message || 'Failed to add Sales Order');
//       }
//     } catch (err) {
//       console.error('Error adding Sales Order:', err);
//       showError(err.response?.data?.message || 'Failed to add Sales Order. Please try again.');
//     } finally {
//       setLoading(false);
//     }
//   };
  
//   const resetForm = () => {
//     setActiveStep(0);
//     setFormData({
//       customer_id: '',
//       quotation_id: '',
//       quotation_no: '',
//       customer_po_number: '',
//       customer_po_date: new Date().toISOString().split('T')[0],
//       payment_terms: '',
//       delivery_terms: '',
//       delivery_mode: '',
//       expected_delivery_date: new Date().toISOString().split('T')[0],
//       internal_remarks: '',
//       currency: 'INR'
//     });
//     setSoItems([
//       {
//         item_id: '',
//         part_no: '',
//         part_name: '',
//         hsn_code: '',
//         unit: 'Nos',
//         ordered_qty: 1,
//         unit_price: 0,
//         discount_percent: 0,
//         required_date: new Date().toISOString().split('T')[0],
//         committed_date: new Date().toISOString().split('T')[0],
//         remarks: ''
//       }
//     ]);
//     setCalculatedTotals({
//       sub_total: 0,
//       discount_total: 0,
//       taxable_total: 0,
//       gst_total: 0,
//       grand_total: 0
//     });
//     setFieldErrors({});
//     setError('');
//     setQuotationConflict(false);
//     setPendingQuotation(null);
//     setCurrentItemIndex(null);
//   };
  
//   const handleClose = () => {
//     resetForm();
//     onClose();
//   };
  
//   const formatCurrency = (amount) => {
//     if (!amount && amount !== 0) return '-';
//     return new Intl.NumberFormat('en-IN', {
//       style: 'currency',
//       currency: formData.currency || 'INR',
//       minimumFractionDigits: 2
//     }).format(amount);
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
//       case 0:
//         return (
//           <Stack spacing={2}>
//             {/* Basic Information Section */}
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
//                 <BusinessIcon sx={{ fontSize: '1rem', mr: 0.5, verticalAlign: 'middle' }} />
//                 Order Details
//               </Typography>
              
//               <Grid container spacing={1.5}>
//                 <Grid size={{ xs: 12, sm: 6 }}>
//                   <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//                     <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
//                       <Label required>CUSTOMER</Label>
//                       <Tooltip title="Add New Customer">
//                         <IconButton
//                           size="small"
//                           onClick={() => setAddCustomerOpen(true)}
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
//                       options={customers}
//                       getOptionLabel={(option) => `${option.customer_name} - ${option.customer_code}`}
//                       value={customers.find(c => c._id === formData.customer_id) || null}
//                       onChange={(event, newValue) => {
//                         setFormData(prev => ({ ...prev, customer_id: newValue?._id || '' }));
//                         setFieldErrors(prev => ({ ...prev, customer_id: '' }));
//                       }}
//                       loading={loadingData}
//                       renderInput={(params) => (
//                         <TextField
//                           {...params}
//                           size="small"
//                           error={!!fieldErrors.customer_id}
//                           helperText={fieldErrors.customer_id}
//                           sx={{
//                             '& .MuiOutlinedInput-root': {
//                               borderRadius: 1.5,
//                               fontSize: '0.75rem',
//                               '&:hover fieldset': { borderColor: COLORS.primary },
//                               '&.Mui-focused fieldset': { borderColor: COLORS.primary, borderWidth: 1 },
//                               '&.Mui-error fieldset': { borderColor: '#EF4444' }
//                             },
//                             '& .MuiInputBase-input': {
//                               py: 1,
//                               px: 1.5,
//                               fontSize: '0.75rem',
//                               color: COLORS.text.primary
//                             }
//                           }}
//                         />
//                       )}
//                     />
//                   </Box>
//                 </Grid>
                
//                 <Grid size={{ xs: 12, sm: 6 }}>
//                   <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//                     <Label>REFERENCE QUOTATION</Label>
//                     <Autocomplete
//                       fullWidth
//                       options={quotations}
//                       getOptionLabel={(option) => `${option.QuotationNo} - ${option.CustomerName}`}
//                       value={quotations.find(q => q._id === formData.quotation_id) || null}
//                       onChange={(event, newValue) => handleQuotationSelect(newValue)}
//                       loading={loadingData}
//                       renderInput={(params) => (
//                         <TextField
//                           {...params}
//                           size="small"
//                           placeholder="Optional"
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
//                               color: COLORS.text.primary
//                             }
//                           }}
//                         />
//                       )}
//                     />
//                   </Box>
//                 </Grid>
                
//                 <Grid size={{ xs: 12, sm: 6 }}>
//                   <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//                     <Label>CUSTOMER PO NUMBER</Label>
//                     <TextField
//                       fullWidth
//                       size="small"
//                       name="customer_po_number"
//                       value={formData.customer_po_number}
//                       onChange={handleChange}
//                       placeholder="e.g., PO-2025-001"
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
//                   </Box>
//                 </Grid>
                
//                 <Grid size={{ xs: 12, sm: 6 }}>
//                   <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//                     <Label>CUSTOMER PO DATE</Label>
//                     <TextField
//                       fullWidth
//                       type="date"
//                       size="small"
//                       name="customer_po_date"
//                       value={formData.customer_po_date}
//                       onChange={handleChange}
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
//                         }
//                       }}
//                       InputLabelProps={{ shrink: true }}
//                     />
//                   </Box>
//                 </Grid>
//               </Grid>
//             </Paper>
            
//             {/* Additional Information Section */}
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
//                 Additional Information
//               </Typography>
              
//               <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//                 <Label>INTERNAL REMARKS</Label>
//                 <TextField
//                   fullWidth
//                   multiline
//                   rows={3}
//                   size="small"
//                   name="internal_remarks"
//                   value={formData.internal_remarks}
//                   onChange={handleChange}
//                   placeholder="Any internal notes or special instructions..."
//                   sx={{
//                     '& .MuiOutlinedInput-root': {
//                       borderRadius: 1.5,
//                       fontSize: '0.75rem',
//                       '&:hover fieldset': { borderColor: COLORS.primary },
//                       '&.Mui-focused fieldset': { borderColor: COLORS.primary, borderWidth: 1 }
//                     },
//                     '& .MuiInputBase-input': {
//                       py: 1,
//                       px: 1.5,
//                       fontSize: '0.75rem',
//                       color: COLORS.text.primary,
//                       '&::placeholder': {
//                         color: COLORS.text.tertiary,
//                         fontSize: '0.75rem'
//                       }
//                     }
//                   }}
//                 />
//               </Box>
//             </Paper>
//           </Stack>
//         );
        
//       case 1:
//         return (
//           <Stack spacing={2}>
//             {/* Delivery Information Section */}
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
//                 <ShippingIcon sx={{ fontSize: '1rem', mr: 0.5, verticalAlign: 'middle' }} />
//                 Delivery Information
//               </Typography>
              
//               <Grid container spacing={1.5}>
//                 <Grid size={{ xs: 12, sm: 6 }}>
//                   <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//                     <Label required>EXPECTED DELIVERY DATE</Label>
//                     <TextField
//                       fullWidth
//                       type="date"
//                       size="small"
//                       name="expected_delivery_date"
//                       value={formData.expected_delivery_date}
//                       onChange={handleChange}
//                       error={!!fieldErrors.expected_delivery_date}
//                       helperText={fieldErrors.expected_delivery_date}
//                       sx={{
//                         '& .MuiOutlinedInput-root': {
//                           borderRadius: 1.5,
//                           fontSize: '0.75rem',
//                           '&:hover fieldset': { borderColor: COLORS.primary },
//                           '&.Mui-focused fieldset': { borderColor: COLORS.primary, borderWidth: 1 },
//                           '&.Mui-error fieldset': { borderColor: '#EF4444' }
//                         },
//                         '& .MuiInputBase-input': {
//                           py: 1,
//                           px: 1.5,
//                           fontSize: '0.75rem',
//                           color: COLORS.text.primary
//                         }
//                       }}
//                       InputLabelProps={{ shrink: true }}
//                     />
//                   </Box>
//                 </Grid>
                
//                 <Grid size={{ xs: 12, sm: 6 }}>
//                   <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//                     <Label>PAYMENT TERMS</Label>
//                     <TextField
//                       fullWidth
//                       size="small"
//                       name="payment_terms"
//                       value={formData.payment_terms}
//                       onChange={handleChange}
//                       placeholder="e.g., Net 30, 50% Advance"
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
//                   </Box>
//                 </Grid>
                
//                 <Grid size={{ xs: 12, sm: 6 }}>
//                   <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//                     <Label>DELIVERY TERMS</Label>
//                     <FormControl fullWidth size="small">
//                       <Select
//                         name="delivery_terms"
//                         value={formData.delivery_terms}
//                         onChange={handleChange}
//                         sx={{
//                           borderRadius: 1.5,
//                           fontSize: '0.75rem',
//                           '& .MuiSelect-select': {
//                             py: 1,
//                             px: 1.5
//                           }
//                         }}
//                       >
//                         {DELIVERY_TERMS_OPTIONS.map(option => (
//                           <MenuItem key={option} value={option} sx={{ fontSize: '0.75rem' }}>
//                             {option || 'None'}
//                           </MenuItem>
//                         ))}
//                       </Select>
//                     </FormControl>
//                   </Box>
//                 </Grid>
                
//                 <Grid size={{ xs: 12, sm: 6 }}>
//                   <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//                     <Label>DELIVERY MODE</Label>
//                     <FormControl fullWidth size="small">
//                       <Select
//                         name="delivery_mode"
//                         value={formData.delivery_mode}
//                         onChange={handleChange}
//                         sx={{
//                           borderRadius: 1.5,
//                           fontSize: '0.75rem',
//                           '& .MuiSelect-select': {
//                             py: 1,
//                             px: 1.5
//                           }
//                         }}
//                       >
//                         {DELIVERY_MODE_OPTIONS.map(option => (
//                           <MenuItem key={option} value={option} sx={{ fontSize: '0.75rem' }}>
//                             {option || 'None'}
//                           </MenuItem>
//                         ))}
//                       </Select>
//                     </FormControl>
//                   </Box>
//                 </Grid>
//               </Grid>
//             </Paper>
            
//             {/* Financial Information Section */}
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
//                 <MoneyIcon sx={{ fontSize: '1rem', mr: 0.5, verticalAlign: 'middle' }} />
//                 Financial Information
//               </Typography>
              
//               <Grid container spacing={1.5}>
//                 <Grid size={{ xs: 12, sm: 6 }}>
//                   <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//                     <Label>CURRENCY</Label>
//                     <FormControl fullWidth size="small">
//                       <Select
//                         name="currency"
//                         value={formData.currency}
//                         onChange={handleChange}
//                         sx={{
//                           borderRadius: 1.5,
//                           fontSize: '0.75rem',
//                           '& .MuiSelect-select': {
//                             py: 1,
//                             px: 1.5
//                           }
//                         }}
//                       >
//                         {CURRENCY_OPTIONS.map(option => (
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
//           </Stack>
//         );
        
//       case 2:
//         return (
//           <Stack spacing={2}>
//             {/* Order Items Section */}
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
//                 Order Items <span style={{ color: '#EF4444' }}>*</span>
//               </Typography>
              
//               {soItems.map((item, index) => (
//                 <Paper
//                   key={index}
//                   sx={{
//                     p: 2,
//                     mb: 2,
//                     bgcolor: COLORS.background.light,
//                     borderRadius: 1.5,
//                     border: `1px solid ${COLORS.border}`
//                   }}
//                 >
//                   <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.5 }}>
//                     <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary }}>
//                       Item {index + 1}
//                     </Typography>
//                     {soItems.length > 1 && (
//                       <IconButton
//                         size="small"
//                         onClick={() => removeItem(index)}
//                         sx={{ color: '#EF4444' }}
//                       >
//                         <DeleteIcon fontSize="small" />
//                       </IconButton>
//                     )}
//                   </Stack>
                  
//                   <Grid container spacing={1.5}>
//                     <Grid size={{ xs: 12 }}>
//                       <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//                         <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
//                           <Label required>ITEM</Label>
//                           <Tooltip title="Add New Item">
//                             <IconButton
//                               size="small"
//                               onClick={() => openAddItemDialog(index)}
//                               sx={{
//                                 color: COLORS.primary,
//                                 p: 0.25,
//                                 '&:hover': { bgcolor: COLORS.primaryLight }
//                               }}
//                             >
//                               <AddIcon sx={{ fontSize: '0.8rem' }} />
//                             </IconButton>
//                           </Tooltip>
//                         </Box>
//                         <Autocomplete
//                           fullWidth
//                           options={items}
//                           getOptionLabel={(option) => `${option.part_no} - ${option.part_description}`}
//                           value={items.find(i => i._id === item.item_id) || null}
//                           onChange={(event, newValue) => handleItemChange(index, 'item_id', newValue?._id || '')}
//                           loading={loadingData}
//                           renderInput={(params) => (
//                             <TextField
//                               {...params}
//                               size="small"
//                               error={!!fieldErrors[`item_${index}_item_id`]}
//                               helperText={fieldErrors[`item_${index}_item_id`]}
//                               sx={{
//                                 '& .MuiOutlinedInput-root': {
//                                   borderRadius: 1.5,
//                                   fontSize: '0.75rem',
//                                   '&:hover fieldset': { borderColor: COLORS.primary },
//                                   '&.Mui-focused fieldset': { borderColor: COLORS.primary, borderWidth: 1 },
//                                   '&.Mui-error fieldset': { borderColor: '#EF4444' }
//                                 },
//                                 '& .MuiInputBase-input': {
//                                   py: 1,
//                                   px: 1.5,
//                                   fontSize: '0.75rem',
//                                   color: COLORS.text.primary
//                                 }
//                               }}
//                             />
//                           )}
//                         />
//                       </Box>
//                     </Grid>
                    
//                     <Grid size={{ xs: 6, sm: 3 }}>
//                       <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//                         <Label>PART NO</Label>
//                         <TextField
//                           fullWidth
//                           size="small"
//                           value={item.part_no}
//                           disabled
//                           sx={{
//                             '& .MuiOutlinedInput-root': {
//                               borderRadius: 1.5,
//                               fontSize: '0.75rem',
//                               backgroundColor: COLORS.background.light
//                             },
//                             '& .MuiInputBase-input': {
//                               py: 1,
//                               px: 1.5,
//                               fontSize: '0.75rem',
//                               color: COLORS.text.secondary
//                             }
//                           }}
//                         />
//                       </Box>
//                     </Grid>
                    
//                     <Grid size={{ xs: 6, sm: 3 }}>
//                       <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//                         <Label>HSN CODE</Label>
//                         <TextField
//                           fullWidth
//                           size="small"
//                           value={item.hsn_code}
//                           disabled
//                           sx={{
//                             '& .MuiOutlinedInput-root': {
//                               borderRadius: 1.5,
//                               fontSize: '0.75rem',
//                               backgroundColor: COLORS.background.light
//                             },
//                             '& .MuiInputBase-input': {
//                               py: 1,
//                               px: 1.5,
//                               fontSize: '0.75rem',
//                               color: COLORS.text.secondary
//                             }
//                           }}
//                         />
//                       </Box>
//                     </Grid>
                    
//                     <Grid size={{ xs: 6, sm: 2 }}>
//                       <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//                         <Label>UNIT</Label>
//                         <FormControl fullWidth size="small">
//                           <Select
//                             value={item.unit}
//                             onChange={(e) => handleItemChange(index, 'unit', e.target.value)}
//                             sx={{
//                               borderRadius: 1.5,
//                               fontSize: '0.75rem',
//                               '& .MuiSelect-select': {
//                                 py: 1,
//                                 px: 1.5
//                               }
//                             }}
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
//                         <Label required>QUANTITY</Label>
//                         <TextField
//                           fullWidth
//                           type="number"
//                           size="small"
//                           value={item.ordered_qty}
//                           onChange={(e) => handleItemChange(index, 'ordered_qty', e.target.value)}
//                           error={!!fieldErrors[`item_${index}_ordered_qty`]}
//                           helperText={fieldErrors[`item_${index}_ordered_qty`]}
//                           sx={{
//                             '& .MuiOutlinedInput-root': {
//                               borderRadius: 1.5,
//                               fontSize: '0.75rem',
//                               '&:hover fieldset': { borderColor: COLORS.primary },
//                               '&.Mui-focused fieldset': { borderColor: COLORS.primary, borderWidth: 1 },
//                               '&.Mui-error fieldset': { borderColor: '#EF4444' }
//                             },
//                             '& .MuiInputBase-input': {
//                               py: 1,
//                               px: 1.5,
//                               fontSize: '0.75rem',
//                               color: COLORS.text.primary
//                             }
//                           }}
//                         />
//                       </Box>
//                     </Grid>
                    
//                     <Grid size={{ xs: 6, sm: 2 }}>
//                       <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//                         <Label required>UNIT PRICE</Label>
//                         <TextField
//                           fullWidth
//                           type="number"
//                           size="small"
//                           value={item.unit_price}
//                           onChange={(e) => handleItemChange(index, 'unit_price', e.target.value)}
//                           error={!!fieldErrors[`item_${index}_unit_price`]}
//                           helperText={fieldErrors[`item_${index}_unit_price`]}
//                           sx={{
//                             '& .MuiOutlinedInput-root': {
//                               borderRadius: 1.5,
//                               fontSize: '0.75rem',
//                               '&:hover fieldset': { borderColor: COLORS.primary },
//                               '&.Mui-focused fieldset': { borderColor: COLORS.primary, borderWidth: 1 },
//                               '&.Mui-error fieldset': { borderColor: '#EF4444' }
//                             },
//                             '& .MuiInputBase-input': {
//                               py: 1,
//                               px: 1.5,
//                               fontSize: '0.75rem',
//                               color: COLORS.text.primary
//                             }
//                           }}
//                         />
//                       </Box>
//                     </Grid>
                    
//                     <Grid size={{ xs: 6, sm: 2 }}>
//                       <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//                         <Label>DISCOUNT %</Label>
//                         <TextField
//                           fullWidth
//                           type="number"
//                           size="small"
//                           value={item.discount_percent}
//                           onChange={(e) => handleItemChange(index, 'discount_percent', e.target.value)}
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
//                               color: COLORS.text.primary
//                             }
//                           }}
//                         />
//                       </Box>
//                     </Grid>
                    
//                     <Grid size={{ xs: 12, sm: 6 }}>
//                       <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//                         <Label>REQUIRED DATE</Label>
//                         <TextField
//                           fullWidth
//                           type="date"
//                           size="small"
//                           value={item.required_date}
//                           onChange={(e) => handleItemChange(index, 'required_date', e.target.value)}
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
//                               color: COLORS.text.primary
//                             }
//                           }}
//                           InputLabelProps={{ shrink: true }}
//                         />
//                       </Box>
//                     </Grid>
                    
//                     <Grid size={{ xs: 12, sm: 6 }}>
//                       <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//                         <Label>COMMITTED DATE</Label>
//                         <TextField
//                           fullWidth
//                           type="date"
//                           size="small"
//                           value={item.committed_date}
//                           onChange={(e) => handleItemChange(index, 'committed_date', e.target.value)}
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
//                               color: COLORS.text.primary
//                             }
//                           }}
//                           InputLabelProps={{ shrink: true }}
//                         />
//                       </Box>
//                     </Grid>
                    
//                     <Grid size={{ xs: 12 }}>
//                       <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//                         <Label>REMARKS</Label>
//                         <TextField
//                           fullWidth
//                           size="small"
//                           value={item.remarks}
//                           onChange={(e) => handleItemChange(index, 'remarks', e.target.value)}
//                           placeholder="Additional notes..."
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
//                             }
//                           }}
//                         />
//                       </Box>
//                     </Grid>
//                   </Grid>
//                 </Paper>
//               ))}
              
//               <Button
//                 variant="outlined"
//                 startIcon={<AddIcon sx={{ fontSize: '1rem' }} />}
//                 onClick={addItem}
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
//                 Add Item
//               </Button>
//             </Paper>
//           </Stack>
//         );
        
//       case 3:
//         return (
//           <Stack spacing={2}>
//             {/* Review Section */}
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
//                 {/* Customer Info Summary */}
//                 <Paper sx={{ p: 2, bgcolor: COLORS.background.light, borderRadius: 1.5 }}>
//                   <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: COLORS.primary, mb: 1 }}>
//                     Customer Information
//                   </Typography>
//                   <Grid container spacing={1}>
//                     <Grid size={{ xs: 6 }}>
//                       <Typography sx={{ fontSize: '0.7rem', color: COLORS.text.secondary }}>Customer:</Typography>
//                     </Grid>
//                     <Grid size={{ xs: 6 }}>
//                       <Typography sx={{ fontSize: '0.7rem', fontWeight: 500 }}>
//                         {customers.find(c => c._id === formData.customer_id)?.customer_name || '-'}
//                       </Typography>
//                     </Grid>
//                     <Grid size={{ xs: 6 }}>
//                       <Typography sx={{ fontSize: '0.7rem', color: COLORS.text.secondary }}>PO Number:</Typography>
//                     </Grid>
//                     <Grid size={{ xs: 6 }}>
//                       <Typography sx={{ fontSize: '0.7rem', fontWeight: 500 }}>{formData.customer_po_number || '-'}</Typography>
//                     </Grid>
//                     <Grid size={{ xs: 6 }}>
//                       <Typography sx={{ fontSize: '0.7rem', color: COLORS.text.secondary }}>Expected Delivery:</Typography>
//                     </Grid>
//                     <Grid size={{ xs: 6 }}>
//                       <Typography sx={{ fontSize: '0.7rem', fontWeight: 500 }}>{formData.expected_delivery_date}</Typography>
//                     </Grid>
//                     <Grid size={{ xs: 6 }}>
//                       <Typography sx={{ fontSize: '0.7rem', color: COLORS.text.secondary }}>Currency:</Typography>
//                     </Grid>
//                     <Grid size={{ xs: 6 }}>
//                       <Typography sx={{ fontSize: '0.7rem', fontWeight: 500 }}>{formData.currency}</Typography>
//                     </Grid>
//                   </Grid>
//                 </Paper>
                
//                 {/* Items Summary */}
//                 <Paper sx={{ p: 2, bgcolor: COLORS.background.light, borderRadius: 1.5 }}>
//                   <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: COLORS.primary, mb: 1 }}>
//                     Order Summary
//                   </Typography>
//                   <TableContainer>
//                     <Table size="small">
//                       <TableHead>
//                         <TableRow>
//                           <TableCell sx={{ fontSize: '0.65rem', fontWeight: 600, color: COLORS.text.secondary }}>Item</TableCell>
//                           <TableCell sx={{ fontSize: '0.65rem', fontWeight: 600, color: COLORS.text.secondary }}>Qty</TableCell>
//                           <TableCell sx={{ fontSize: '0.65rem', fontWeight: 600, color: COLORS.text.secondary }}>Unit</TableCell>
//                           <TableCell sx={{ fontSize: '0.65rem', fontWeight: 600, color: COLORS.text.secondary }} align="right">Price</TableCell>
//                           <TableCell sx={{ fontSize: '0.65rem', fontWeight: 600, color: COLORS.text.secondary }} align="right">Total</TableCell>
//                         </TableRow>
//                       </TableHead>
//                       <TableBody>
//                         {soItems.map((item, idx) => {
//                           const total = (item.ordered_qty * item.unit_price) * (1 - (item.discount_percent / 100));
//                           return (
//                             <TableRow key={idx}>
//                               <TableCell sx={{ fontSize: '0.7rem' }}>{item.part_no || '-'}</TableCell>
//                               <TableCell sx={{ fontSize: '0.7rem' }}>{item.ordered_qty}</TableCell>
//                               <TableCell sx={{ fontSize: '0.7rem' }}>{item.unit}</TableCell>
//                               <TableCell sx={{ fontSize: '0.7rem' }} align="right">{formatCurrency(item.unit_price)}</TableCell>
//                               <TableCell sx={{ fontSize: '0.7rem' }} align="right">{formatCurrency(total)}</TableCell>
//                             </TableRow>
//                           );
//                         })}
//                       </TableBody>
//                     </Table>
//                   </TableContainer>
                  
//                   <Divider sx={{ my: 2 }} />
                  
//                   <Stack spacing={1}>
//                     <Stack direction="row" justifyContent="space-between">
//                       <Typography sx={{ fontSize: '0.7rem', color: COLORS.text.secondary }}>Sub Total:</Typography>
//                       <Typography sx={{ fontSize: '0.7rem', fontWeight: 500 }}>{formatCurrency(calculatedTotals.sub_total)}</Typography>
//                     </Stack>
//                     <Stack direction="row" justifyContent="space-between">
//                       <Typography sx={{ fontSize: '0.7rem', color: COLORS.text.secondary }}>Discount:</Typography>
//                       <Typography sx={{ fontSize: '0.7rem', fontWeight: 500 }}>{formatCurrency(calculatedTotals.discount_total)}</Typography>
//                     </Stack>
//                     <Stack direction="row" justifyContent="space-between">
//                       <Typography sx={{ fontSize: '0.7rem', color: COLORS.text.secondary }}>Taxable Amount:</Typography>
//                       <Typography sx={{ fontSize: '0.7rem', fontWeight: 500 }}>{formatCurrency(calculatedTotals.taxable_total)}</Typography>
//                     </Stack>
//                     <Stack direction="row" justifyContent="space-between">
//                       <Typography sx={{ fontSize: '0.7rem', color: COLORS.text.secondary }}>GST (18%):</Typography>
//                       <Typography sx={{ fontSize: '0.7rem', fontWeight: 500 }}>{formatCurrency(calculatedTotals.gst_total)}</Typography>
//                     </Stack>
//                     <Divider />
//                     <Stack direction="row" justifyContent="space-between">
//                       <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: COLORS.primary }}>Grand Total:</Typography>
//                       <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: '#059669' }}>{formatCurrency(calculatedTotals.grand_total)}</Typography>
//                     </Stack>
//                   </Stack>
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
//     <>
//       <Dialog
//         open={open}
//         onClose={handleClose}
//         maxWidth="md"
//         fullWidth
//         PaperProps={{
//           sx: {
//             borderRadius: 2,
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
//           bgcolor: COLORS.background.white,
//           display: 'flex',
//           justifyContent: 'space-between',
//           alignItems: 'center'
//         }}>
//           <Typography sx={{ fontSize: '1.2rem', fontWeight: 700, color: COLORS.text.primary }}>
//             Add New Sales Order
//           </Typography>
//           <IconButton onClick={handleClose} size="small">
//             <CloseIcon fontSize="small" />
//           </IconButton>
//         </DialogTitle>
        
//         {/* Floating Error Alert - Positioned below title */}
//         <Box sx={{ px: 2.5, pt: 1 }}>
//           <FloatingErrorAlert error={error} onClose={() => setError('')} />
//         </Box>
        
//         {/* Modern Stepper with Primary Color */}
//         <Box sx={{ px: 2.5, pt: error ? 1 : 2, bgcolor: COLORS.background.white }}>
//           <Stepper
//             activeStep={activeStep}
//             alternativeLabel
//             connector={<ColorConnector />}
//           >
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
        
//         <DialogContent sx={{ p: 2.5, pt: error ? 1 : 2, bgcolor: COLORS.background.white }}>
//           {renderStepContent(activeStep)}
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
//             size="small"
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
//               size="small"
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
//                 size="small"
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
//                 {loading ? 'Creating...' : 'Create Sales Order'}
//               </Button>
//             ) : (
//               <Button
//                 variant="contained"
//                 onClick={handleNext}
//                 disabled={loading}
//                 size="small"
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
      
//       {/* Quotation Conflict Dialog */}
//       <Dialog
//         open={quotationConflict}
//         onClose={() => setQuotationConflict(false)}
//         maxWidth="sm"
//         fullWidth
//         PaperProps={{
//           sx: {
//             borderRadius: 2,
//             border: `1px solid ${COLORS.border}`,
//           }
//         }}
//       >
//         <DialogTitle sx={{ 
//           py: 1.5, 
//           px: 2.5, 
//           mb: 2,
//           borderBottom: `1px solid ${COLORS.border}`,
//           display: 'flex',
//           justifyContent: 'space-between',
//           alignItems: 'center'
//         }}>
//           <Typography sx={{ fontSize: '1rem', fontWeight: 600, color: COLORS.text.primary }}>
//             Customer Conflict
//           </Typography>
//           <IconButton onClick={() => setQuotationConflict(false)} size="small">
//             <CloseIcon fontSize="small" />
//           </IconButton>
//         </DialogTitle>
//         <DialogContent sx={{ p: 2.5 }}>
//           <Typography sx={{ fontSize: '0.8rem', color: COLORS.text.secondary, mb: 1 }}>
//             This quotation belongs to a different customer:
//           </Typography>
//           <Paper sx={{ p: 1.5, bgcolor: COLORS.background.light, borderRadius: 1.5, mb: 2 }}>
//             <Typography sx={{ fontSize: '0.75rem', fontWeight: 500, color: COLORS.primary }}>
//               {pendingQuotation?.CustomerName || 'Unknown Customer'}
//             </Typography>
//           </Paper>
//           <Typography sx={{ fontSize: '0.8rem', color: COLORS.text.secondary }}>
//             What would you like to do?
//           </Typography>
//         </DialogContent>
//         <DialogActions sx={{ 
//           px: 2.5, 
//           py: 1.5, 
//           borderTop: `1px solid ${COLORS.border}`, 
//           gap: 1 
//         }}>
//           <Button
//             onClick={() => applyQuotation(pendingQuotation, true)}
//             size="small"
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
//             Keep Current Customer
//           </Button>
//           <Button
//             variant="contained"
//             onClick={() => applyQuotation(pendingQuotation, false)}
//             size="small"
//             sx={{
//               height: 32,
//               px: 2,
//               borderRadius: 1.5,
//               bgcolor: COLORS.primary,
//               fontSize: '0.7rem',
//               fontWeight: 500,
//               textTransform: 'none',
//               '&:hover': { bgcolor: COLORS.primaryDark }
//             }}
//           >
//             Switch to Quotation's Customer
//           </Button>
//         </DialogActions>
//       </Dialog>
      
//       {/* Add Customer Dialog */}
//       <AddCustomer
//         open={addCustomerOpen}
//         onClose={() => setAddCustomerOpen(false)}
//         onAdd={handleCustomerAdded}
//       />
      
//       {/* Add Item Dialog */}
//       <AddItem
//         open={addItemOpen}
//         onClose={() => {
//           setAddItemOpen(false);
//           setCurrentItemIndex(null);
//         }}
//         onAdd={handleItemAdded}
//       />
//     </>
//   );
// };

// export default AddSaleOrder;




import React, { useState, useEffect, useCallback } from 'react';
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
  Alert,
  IconButton,
  FormControl,
  Select,
  MenuItem,
  Autocomplete,
  styled,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Collapse,
  FormControlLabel,
  Switch
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  NavigateNext as NavigateNextIcon,
  NavigateBefore as NavigateBeforeIcon,
  Business as BusinessIcon,
  Inventory as InventoryIcon,
  LocalShipping as ShippingIcon,
  AttachMoney as MoneyIcon,
  Info as InfoIcon,
  Close as CloseIcon,
  Error as ErrorIcon
} from '@mui/icons-material';
import axios from 'axios';
import BASE_URL from '../../config/Config';
import AddItem from '../master/itemmaster/AddItem';

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
  border: '#E3E8EF'
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

// Stepper Connector
const ColorConnector = styled(StepConnector)(({ theme }) => ({
  [`&.${stepConnectorClasses.active}`]: {
    [`& .${stepConnectorClasses.line}`]: { backgroundColor: COLORS.primary },
  },
  [`&.${stepConnectorClasses.completed}`]: {
    [`& .${stepConnectorClasses.line}`]: { backgroundColor: COLORS.primary },
  },
  [`& .${stepConnectorClasses.line}`]: {
    height: 2,
    border: 0,
    backgroundColor: '#eaeaf0',
    borderRadius: 1,
  },
}));

// Options
const CURRENCY_OPTIONS = ['INR', 'USD', 'EUR', 'GBP', 'AED'];
const DELIVERY_TERMS_OPTIONS = ['Ex-Works', 'FOR Destination', 'CIF', 'FOB', ''];
const DELIVERY_MODE_OPTIONS = ['Road', 'Rail', 'Air', 'Sea', 'Hand Delivery', ''];
const UNIT_OPTIONS = ['Nos', 'Kg', 'Meter', 'Set', 'Piece'];
const COUNTRY_OPTIONS = ['India', 'USA', 'UK', 'Germany', 'UAE', 'Singapore', 'Other'];
const CUSTOMER_TYPE_OPTIONS = ['OEM', 'Distributor', 'Retailer', 'Exporter', 'Importer', 'Other'];
const INDUSTRY_SEGMENT_OPTIONS = ['Automotive', 'Electronics', 'Pharmaceutical', 'Construction', 'Energy', 'Defense', 'Other', ''];
const PRIORITY_OPTIONS = ['Regular', 'High', 'Low', 'Critical'];
const CUSTOMER_STEPS = ['Basic Info', 'Address & Contacts', 'Financial & Bank'];

const steps = ['Basic Information', 'Delivery & Financial', 'Items', 'Review & Submit'];

// ============================================================================
// MAIN COMPONENT
// ============================================================================
const AddSaleOrder = ({ open, onClose, onAdd }) => {
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  // Quotation conflict
  const [quotationConflict, setQuotationConflict] = useState(false);
  const [pendingQuotation, setPendingQuotation] = useState(null);

  // Data from APIs
  const [customers, setCustomers] = useState([]);
  const [quotations, setQuotations] = useState([]);
  const [items, setItems] = useState([]);
  const [loadingData, setLoadingData] = useState(false);

  // Add Item dialog (kept as popup)
  const [addItemOpen, setAddItemOpen] = useState(false);
  const [currentItemIndex, setCurrentItemIndex] = useState(null);

  // --- Inline Add Customer form with 3-step stepper ---
  const [showAddCustomerForm, setShowAddCustomerForm] = useState(false);
  const [isViewMode, setIsViewMode] = useState(false);
  const [customerStepper, setCustomerStepper] = useState(0);
  const [customerFormData, setCustomerFormData] = useState({
    // Step 1: Basic Info
    customer_code: '',
    customer_name: '',
    customer_type: 'OEM',
    industry_segment: '',
    priority: 'Regular',
    gstin: '',
    pan: '',
    // Step 2: Address & Contacts
    address: '',
    city: '',
    state: '',
    pincode: '',
    country: 'India',
    contact_person: '',
    email: '',
    phone: '',
    // Step 3: Financial & Bank
    payment_terms: '',
    credit_limit: '',
    bank_name: '',
    account_name: '',
    account_no: '',
    ifsc: '',
    branch: ''
  });
  const [customerFieldErrors, setCustomerFieldErrors] = useState({});
  const [customerTouched, setCustomerTouched] = useState({});
  const [addCustomerLoading, setAddCustomerLoading] = useState(false);
  const [addCustomerError, setAddCustomerError] = useState('');

  // TextField & Select styles
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

  // --- Customer validation ---
  const validateCustomerField = (name, value) => {
    switch (name) {
      case 'customer_code':
        if (!value?.trim()) return 'Customer code is required';
        if (value.length > 50) return 'Customer code should not exceed 50 characters';
        return '';
      case 'customer_name':
        if (!value?.trim()) return 'Customer name is required';
        if (value.length > 100) return 'Customer name should not exceed 100 characters';
        return '';
      case 'customer_type':
        if (!value) return 'Customer type is required';
        return '';
      case 'priority':
        if (!value) return 'Priority is required';
        return '';
      case 'gstin':
        if (value && !/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(value)) return 'Invalid GSTIN format';
        return '';
      case 'pan':
        if (value && !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(value)) return 'Invalid PAN format';
        return '';
      case 'contact_person':
        if (!value?.trim()) return 'Contact person is required';
        return '';
      case 'email':
        if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Invalid email address';
        return '';
      case 'phone':
        if (!value?.trim()) return 'Phone number is required';
        if (value.length < 10) return 'Phone number must be at least 10 digits';
        return '';
      case 'address':
        if (!value?.trim()) return 'Address is required';
        return '';
      case 'city':
        if (!value?.trim()) return 'City is required';
        return '';
      case 'state':
        if (!value?.trim()) return 'State is required';
        return '';
      case 'pincode':
        if (value && !/^\d{6}$/.test(value)) return 'Pincode must be 6 digits';
        return '';
      default:
        return '';
    }
  };

  const validateCustomerForm = () => {
    const errors = {};
    let isValid = true;
    const required = ['customer_code', 'customer_name', 'customer_type', 'priority', 'contact_person', 'phone', 'address', 'city', 'state'];
    required.forEach(field => {
      const error = validateCustomerField(field, customerFormData[field]);
      if (error) {
        errors[field] = error;
        isValid = false;
      }
    });
    if (customerFormData.email) {
      const emailError = validateCustomerField('email', customerFormData.email);
      if (emailError) {
        errors.email = emailError;
        isValid = false;
      }
    }
    if (customerFormData.pincode) {
      const pincodeError = validateCustomerField('pincode', customerFormData.pincode);
      if (pincodeError) {
        errors.pincode = pincodeError;
        isValid = false;
      }
    }
    if (customerFormData.gstin) {
      const gstError = validateCustomerField('gstin', customerFormData.gstin);
      if (gstError) {
        errors.gstin = gstError;
        isValid = false;
      }
    }
    if (customerFormData.pan) {
      const panError = validateCustomerField('pan', customerFormData.pan);
      if (panError) {
        errors.pan = panError;
        isValid = false;
      }
    }
    setCustomerFieldErrors(errors);
    if (!isValid) {
      setAddCustomerError('Please fix the errors above');
    }
    return isValid;
  };

  const handleCustomerFormChange = (e) => {
    const { name, value } = e.target;
    setCustomerFieldErrors(prev => ({ ...prev, [name]: '' }));
    setCustomerFormData(prev => ({ ...prev, [name]: value }));
    if (customerTouched[name] || value) {
      const error = validateCustomerField(name, value);
      setCustomerFieldErrors(prev => ({ ...prev, [name]: error }));
    }
  };

  const handleCustomerBlur = (e) => {
    const { name, value } = e.target;
    setCustomerTouched(prev => ({ ...prev, [name]: true }));
    const error = validateCustomerField(name, value);
    setCustomerFieldErrors(prev => ({ ...prev, [name]: error }));
  };

  const resetCustomerForm = () => {
    setCustomerFormData({
      customer_code: '',
      customer_name: '',
      customer_type: 'OEM',
      industry_segment: '',
      priority: 'Regular',
      gstin: '',
      pan: '',
      address: '',
      city: '',
      state: '',
      pincode: '',
      country: 'India',
      contact_person: '',
      email: '',
      phone: '',
      payment_terms: '',
      credit_limit: '',
      bank_name: '',
      account_name: '',
      account_no: '',
      ifsc: '',
      branch: ''
    });
    setCustomerFieldErrors({});
    setCustomerTouched({});
    setAddCustomerError('');
    setIsViewMode(false);
    setCustomerStepper(0);
  };

  const handleAddCustomerSubmit = async () => {
    if (!validateCustomerForm()) return;
    setAddCustomerLoading(true);
    setAddCustomerError('');

    try {
      const token = localStorage.getItem('token');
      const payload = {
        customer_code: customerFormData.customer_code,
        customer_name: customerFormData.customer_name,
        customer_type: customerFormData.customer_type,
        industry_segment: customerFormData.industry_segment || undefined,
        priority: customerFormData.priority,
        gstin: customerFormData.gstin || undefined,
        pan: customerFormData.pan || undefined,
        contact_person: customerFormData.contact_person,
        email: customerFormData.email || undefined,
        phone: customerFormData.phone,
        address: customerFormData.address,
        city: customerFormData.city,
        state: customerFormData.state,
        pincode: customerFormData.pincode || undefined,
        country: customerFormData.country || 'India',
        payment_terms: customerFormData.payment_terms || undefined,
        credit_limit: customerFormData.credit_limit ? parseFloat(customerFormData.credit_limit) : undefined,
        bank_name: customerFormData.bank_name || undefined,
        account_name: customerFormData.account_name || undefined,
        account_no: customerFormData.account_no || undefined,
        ifsc: customerFormData.ifsc || undefined,
        branch: customerFormData.branch || undefined
      };
      Object.keys(payload).forEach(key => {
        if (payload[key] === undefined || payload[key] === null || payload[key] === '') {
          delete payload[key];
        }
      });

      const response = await axios.post(`${BASE_URL}/api/customers`, payload, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.data.success) {
        const newCustomer = response.data.data;
        setCustomers(prev => [...prev, newCustomer]);
        setFormData(prev => ({ ...prev, customer_id: newCustomer._id }));
        setFieldErrors(prev => ({ ...prev, customer_id: '' }));
        setShowAddCustomerForm(false);
        resetCustomerForm();
      } else {
        setAddCustomerError(response.data.message || 'Failed to add customer');
      }
    } catch (err) {
      console.error('Error adding customer:', err);
      setAddCustomerError(err.response?.data?.message || 'Failed to add customer. Please try again.');
    } finally {
      setAddCustomerLoading(false);
    }
  };

  // --- Render customer step content (3 steps) ---
  const renderCustomerStepContent = (step) => {
    const data = customerFormData;
    const errors = customerFieldErrors;
    const handleChange = handleCustomerFormChange;
    const handleBlur = handleCustomerBlur;
    const disabled = isViewMode || addCustomerLoading;

    switch (step) {
      case 0: // Basic Info
        return (
          <Grid container spacing={1.5}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                <Label required>CUSTOMER CODE</Label>
                <TextField
                  fullWidth size="small" name="customer_code"
                  value={data.customer_code}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="e.g., SIEMENS001"
                  error={!!errors.customer_code}
                  helperText={errors.customer_code}
                  sx={textFieldSx}
                  disabled={disabled}
                />
              </Box>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                <Label required>CUSTOMER NAME</Label>
                <TextField
                  fullWidth size="small" name="customer_name"
                  value={data.customer_name}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="e.g., Siemens India Ltd"
                  error={!!errors.customer_name}
                  helperText={errors.customer_name}
                  sx={textFieldSx}
                  disabled={disabled}
                />
              </Box>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                <Label required>CUSTOMER TYPE</Label>
                <FormControl fullWidth size="small" error={!!errors.customer_type}>
                  <Select
                    name="customer_type"
                    value={data.customer_type}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    disabled={disabled}
                    sx={selectSx}
                  >
                    {CUSTOMER_TYPE_OPTIONS.map(opt => (
                      <MenuItem key={opt} value={opt} sx={{ fontSize: '0.75rem' }}>{opt}</MenuItem>
                    ))}
                  </Select>
                  {errors.customer_type && (
                    <Typography sx={{ fontSize: '0.65rem', color: '#EF4444' }}>
                      {errors.customer_type}
                    </Typography>
                  )}
                </FormControl>
              </Box>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                <Label>INDUSTRY SEGMENT</Label>
                <FormControl fullWidth size="small">
                  <Select
                    name="industry_segment"
                    value={data.industry_segment}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    disabled={disabled}
                    sx={selectSx}
                  >
                    {INDUSTRY_SEGMENT_OPTIONS.map(opt => (
                      <MenuItem key={opt} value={opt} sx={{ fontSize: '0.75rem' }}>{opt || 'None'}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                <Label required>PRIORITY</Label>
                <FormControl fullWidth size="small" error={!!errors.priority}>
                  <Select
                    name="priority"
                    value={data.priority}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    disabled={disabled}
                    sx={selectSx}
                  >
                    {PRIORITY_OPTIONS.map(opt => (
                      <MenuItem key={opt} value={opt} sx={{ fontSize: '0.75rem' }}>{opt}</MenuItem>
                    ))}
                  </Select>
                  {errors.priority && (
                    <Typography sx={{ fontSize: '0.65rem', color: '#EF4444' }}>
                      {errors.priority}
                    </Typography>
                  )}
                </FormControl>
              </Box>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                <Label>GSTIN</Label>
                <TextField
                  fullWidth size="small" name="gstin"
                  value={data.gstin}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="27AAECS7112G1Z5"
                  error={!!errors.gstin}
                  helperText={errors.gstin}
                  sx={textFieldSx}
                  disabled={disabled}
                />
              </Box>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                <Label>PAN</Label>
                <TextField
                  fullWidth size="small" name="pan"
                  value={data.pan}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="AAECS7112G"
                  error={!!errors.pan}
                  helperText={errors.pan}
                  sx={textFieldSx}
                  disabled={disabled}
                />
              </Box>
            </Grid>
          </Grid>
        );

      case 1: // Address & Contacts
        return (
          <Grid container spacing={1.5}>
            <Grid size={{ xs: 12 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                <Label required>ADDRESS</Label>
                <TextField
                  fullWidth size="small" name="address"
                  value={data.address}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="123, MG Road"
                  error={!!errors.address}
                  helperText={errors.address}
                  sx={textFieldSx}
                  disabled={disabled}
                />
              </Box>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                <Label required>CITY</Label>
                <TextField
                  fullWidth size="small" name="city"
                  value={data.city}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="Mumbai"
                  error={!!errors.city}
                  helperText={errors.city}
                  sx={textFieldSx}
                  disabled={disabled}
                />
              </Box>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                <Label required>STATE</Label>
                <TextField
                  fullWidth size="small" name="state"
                  value={data.state}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="Maharashtra"
                  error={!!errors.state}
                  helperText={errors.state}
                  sx={textFieldSx}
                  disabled={disabled}
                />
              </Box>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                <Label>PINCODE</Label>
                <TextField
                  fullWidth size="small" name="pincode"
                  value={data.pincode}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="400001"
                  error={!!errors.pincode}
                  helperText={errors.pincode}
                  sx={textFieldSx}
                  disabled={disabled}
                />
              </Box>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                <Label>COUNTRY</Label>
                <FormControl fullWidth size="small">
                  <Select
                    name="country"
                    value={data.country}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    disabled={disabled}
                    sx={selectSx}
                  >
                    {COUNTRY_OPTIONS.map(opt => (
                      <MenuItem key={opt} value={opt} sx={{ fontSize: '0.75rem' }}>{opt}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                <Label required>CONTACT PERSON</Label>
                <TextField
                  fullWidth size="small" name="contact_person"
                  value={data.contact_person}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="Rajesh Sharma"
                  error={!!errors.contact_person}
                  helperText={errors.contact_person}
                  sx={textFieldSx}
                  disabled={disabled}
                />
              </Box>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                <Label>EMAIL</Label>
                <TextField
                  fullWidth size="small" name="email"
                  value={data.email}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="rajesh@company.com"
                  error={!!errors.email}
                  helperText={errors.email}
                  sx={textFieldSx}
                  disabled={disabled}
                />
              </Box>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                <Label required>PHONE</Label>
                <TextField
                  fullWidth size="small" name="phone"
                  value={data.phone}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="9876543210"
                  error={!!errors.phone}
                  helperText={errors.phone}
                  sx={textFieldSx}
                  disabled={disabled}
                />
              </Box>
            </Grid>
          </Grid>
        );

      case 2: // Financial & Bank
        return (
          <Grid container spacing={1.5}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                <Label>PAYMENT TERMS</Label>
                <TextField
                  fullWidth size="small" name="payment_terms"
                  value={data.payment_terms}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="Net 30"
                  sx={textFieldSx}
                  disabled={disabled}
                />
              </Box>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                <Label>CREDIT LIMIT (₹)</Label>
                <TextField
                  fullWidth size="small" name="credit_limit"
                  type="number"
                  value={data.credit_limit}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="1000000"
                  sx={textFieldSx}
                  disabled={disabled}
                  inputProps={{ step: '0.01', min: 0 }}
                />
              </Box>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                <Label>BANK NAME</Label>
                <TextField
                  fullWidth size="small" name="bank_name"
                  value={data.bank_name}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="HDFC Bank"
                  sx={textFieldSx}
                  disabled={disabled}
                />
              </Box>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                <Label>ACCOUNT NAME</Label>
                <TextField
                  fullWidth size="small" name="account_name"
                  value={data.account_name}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="Siemens India Ltd"
                  sx={textFieldSx}
                  disabled={disabled}
                />
              </Box>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                <Label>ACCOUNT NUMBER</Label>
                <TextField
                  fullWidth size="small" name="account_no"
                  value={data.account_no}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="1234567890"
                  sx={textFieldSx}
                  disabled={disabled}
                />
              </Box>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                <Label>IFSC CODE</Label>
                <TextField
                  fullWidth size="small" name="ifsc"
                  value={data.ifsc}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="HDFC0001234"
                  sx={textFieldSx}
                  disabled={disabled}
                />
              </Box>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                <Label>BRANCH</Label>
                <TextField
                  fullWidth size="small" name="branch"
                  value={data.branch}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="Thane Branch"
                  sx={textFieldSx}
                  disabled={disabled}
                />
              </Box>
            </Grid>
          </Grid>
        );

      default:
        return null;
    }
  };

  // --- Render inline customer form (with 3-step stepper) ---
  const renderInlineCustomerForm = () => (
    <Box sx={{ mt: 2, p: 2, bgcolor: COLORS.background.white, borderRadius: 1.5, border: `1px solid ${COLORS.border}` }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color: COLORS.primary }}>
          {isViewMode ? 'Customer Details' : 'Add New Customer'}
        </Typography>
        <IconButton
          size="small"
          onClick={() => {
            setShowAddCustomerForm(false);
            resetCustomerForm();
          }}
          sx={{ color: COLORS.text.tertiary, '&:hover': { color: COLORS.primary } }}
        >
          <CloseIcon sx={{ fontSize: '1rem' }} />
        </IconButton>
      </Box>

      <Stepper activeStep={customerStepper} sx={{ mb: 3 }} connector={<ColorConnector />}>
        {CUSTOMER_STEPS.map((label) => (
          <Step key={label}>
            <StepLabel>
              <Typography sx={{ fontSize: '0.65rem', fontWeight: 500 }}>{label}</Typography>
            </StepLabel>
          </Step>
        ))}
      </Stepper>

      {renderCustomerStepContent(customerStepper)}

      {addCustomerError && (
        <Alert severity="error" sx={{ mt: 2, borderRadius: 1.5, fontSize: '0.75rem', py: 0.5 }}>
          {addCustomerError}
        </Alert>
      )}

      {!isViewMode && (
        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Button
            onClick={() => setCustomerStepper(prev => prev - 1)}
            disabled={customerStepper === 0 || addCustomerLoading}
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
                setShowAddCustomerForm(false);
                resetCustomerForm();
              }}
              disabled={addCustomerLoading}
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
            {customerStepper === CUSTOMER_STEPS.length - 1 ? (
              <Button
                variant="contained"
                onClick={handleAddCustomerSubmit}
                disabled={addCustomerLoading}
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
                {addCustomerLoading ? 'Adding...' : 'Add Customer'}
              </Button>
            ) : (
              <Button
                variant="contained"
                onClick={() => setCustomerStepper(prev => prev + 1)}
                disabled={addCustomerLoading}
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
      )}
    </Box>
  );

  // ==========================================================================
  // MAIN SALES ORDER FORM – HANDLERS & DATA
  // ==========================================================================
  const [formData, setFormData] = useState({
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

  const showError = (message) => {
    setError(message);
    setTimeout(() => setError(''), 5000);
  };

  // Fetch data
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

  const fetchQuotations = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${BASE_URL}/api/quotations?limit=100&status=Approved`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.data.success) {
        setQuotations(response.data.data || []);
      }
    } catch (err) {
      console.error('Error fetching quotations:', err);
    }
  }, []);

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
    if (open) {
      fetchCustomers();
      fetchQuotations();
      fetchItems();
    }
  }, [open, fetchCustomers, fetchQuotations, fetchItems]);

  // Handle item added from AddItem dialog
  const handleItemAdded = (newItem) => {
    setItems(prev => [...prev, newItem]);
    if (currentItemIndex !== null) {
      handleItemChange(currentItemIndex, 'item_id', newItem._id);
    }
    setCurrentItemIndex(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setFieldErrors(prev => ({ ...prev, [name]: '' }));
  };

  const applyQuotation = (quotation, keepCustomer = false) => {
    if (!quotation) return;
    const quotationCustomerId = quotation.CustomerId?._id || quotation.CustomerId;
    const currentCustomerId = formData.customer_id;

    setFormData(prev => ({
      ...prev,
      quotation_id: quotation._id,
      quotation_no: quotation.QuotationNo,
      customer_id: keepCustomer ? currentCustomerId : quotationCustomerId,
      payment_terms: quotation.PaymentTerms || '',
      currency: quotation.Currency || 'INR'
    }));

    if (quotation.Items && quotation.Items.length > 0) {
      const newItems = quotation.Items.map((item) => ({
        item_id: item.ItemId?._id || item.ItemId || '',
        part_no: item.PartNo || '',
        part_name: item.PartName || '',
        hsn_code: item.HSNCode || '',
        unit: item.Unit || 'Nos',
        ordered_qty: item.Quantity || 1,
        unit_price: item.UnitPrice || 0,
        discount_percent: item.DiscountPercent || 0,
        required_date: formData.expected_delivery_date || new Date().toISOString().split('T')[0],
        committed_date: formData.expected_delivery_date || new Date().toISOString().split('T')[0],
        remarks: item.Remarks || ''
      }));
      setSoItems(newItems);
      calculateTotals(newItems);
    }
    setQuotationConflict(false);
    setPendingQuotation(null);
  };

  const handleQuotationSelect = (quotation) => {
    if (!quotation) return;
    const quotationCustomerId = quotation.CustomerId?._id || quotation.CustomerId;
    if (formData.customer_id && formData.customer_id !== quotationCustomerId) {
      setPendingQuotation(quotation);
      setQuotationConflict(true);
      return;
    }
    applyQuotation(quotation, false);
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
    setFieldErrors(prev => ({ ...prev, [`item_${index}_${field}`]: '' }));
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

  const openAddItemDialog = (index) => {
    setCurrentItemIndex(index);
    setAddItemOpen(true);
  };

  const validateStep = (step) => {
    const errors = {};
    let isValid = true;
    let errorMessages = [];

    switch (step) {
      case 0:
        if (!formData.customer_id) {
          errors.customer_id = 'Customer is required';
          errorMessages.push('Customer is required');
          isValid = false;
        }
        if (!formData.expected_delivery_date) {
          errors.expected_delivery_date = 'Expected delivery date is required';
          errorMessages.push('Expected delivery date is required');
          isValid = false;
        }
        break;
      case 2:
        soItems.forEach((item, index) => {
          if (!item.item_id) {
            errors[`item_${index}_item_id`] = `Item ${index + 1}: Item is required`;
            errorMessages.push(`Item ${index + 1}: Please select an item`);
            isValid = false;
          }
          if (!item.ordered_qty || item.ordered_qty <= 0) {
            errors[`item_${index}_ordered_qty`] = `Item ${index + 1}: Valid quantity is required`;
            errorMessages.push(`Item ${index + 1}: Please enter a valid quantity`);
            isValid = false;
          }
          if (!item.unit_price || item.unit_price <= 0) {
            errors[`item_${index}_unit_price`] = `Item ${index + 1}: Valid unit price is required`;
            errorMessages.push(`Item ${index + 1}: Please enter a valid unit price`);
            isValid = false;
          }
        });
        break;
      default:
        return true;
    }
    setFieldErrors(errors);
    if (!isValid) showError(errorMessages[0]);
    return isValid;
  };

  const validateAllFields = () => {
    const errors = {};
    let isValid = true;
    let errorMessages = [];

    if (!formData.customer_id) {
      errors.customer_id = 'Customer is required';
      errorMessages.push('Customer is required');
      isValid = false;
    }
    if (!formData.expected_delivery_date) {
      errors.expected_delivery_date = 'Expected delivery date is required';
      errorMessages.push('Expected delivery date is required');
      isValid = false;
    }
    soItems.forEach((item, index) => {
      if (!item.item_id) {
        errors[`item_${index}_item_id`] = `Item ${index + 1}: Item is required`;
        errorMessages.push(`Item ${index + 1}: Please select an item`);
        isValid = false;
      }
      if (!item.ordered_qty || item.ordered_qty <= 0) {
        errors[`item_${index}_ordered_qty`] = `Item ${index + 1}: Valid quantity is required`;
        errorMessages.push(`Item ${index + 1}: Please enter a valid quantity`);
        isValid = false;
      }
      if (!item.unit_price || item.unit_price <= 0) {
        errors[`item_${index}_unit_price`] = `Item ${index + 1}: Valid unit price is required`;
        errorMessages.push(`Item ${index + 1}: Please enter a valid unit price`);
        isValid = false;
      }
    });

    setFieldErrors(errors);
    if (!isValid) showError(errorMessages[0]);
    return isValid;
  };

  const handleNext = () => {
    if (validateStep(activeStep)) setActiveStep(prev => prev + 1);
  };

  const handleBack = () => {
    setActiveStep(prev => prev - 1);
  };

  const handleSubmit = async () => {
    if (!validateAllFields()) return;
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const submitData = {
        ...formData,
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
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
      });
      if (response.data.success) {
        onAdd(response.data.data);
        resetForm();
        onClose();
      } else {
        showError(response.data.message || 'Failed to add Sales Order');
      }
    } catch (err) {
      console.error('Error adding Sales Order:', err);
      showError(err.response?.data?.message || 'Failed to add Sales Order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setActiveStep(0);
    setFormData({
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
    setFieldErrors({});
    setError('');
    setQuotationConflict(false);
    setPendingQuotation(null);
    setCurrentItemIndex(null);
    setShowAddCustomerForm(false);
    resetCustomerForm();
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const formatCurrency = (amount) => {
    if (!amount && amount !== 0) return '-';
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: formData.currency || 'INR',
      minimumFractionDigits: 2
    }).format(amount);
  };

  // ==========================================================================
  // RENDER STEP CONTENT (Sales Order)
  // ==========================================================================
  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Stack spacing={2}>
            <Paper sx={{ p: 2, bgcolor: COLORS.background.white, borderRadius: 1.5, border: `1px solid ${COLORS.border}` }}>
              <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color: COLORS.primary, mb: 1.5 }}>
                <BusinessIcon sx={{ fontSize: '1rem', mr: 0.5, verticalAlign: 'middle' }} />
                Order Details
              </Typography>

              <Grid container spacing={1.5}>
                <Grid size={{ xs: 12 }}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                    <Label required>CUSTOMER</Label>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Autocomplete
                        fullWidth
                        options={customers}
                        getOptionLabel={(option) => `${option.customer_name} - ${option.customer_code}`}
                        value={customers.find(c => c._id === formData.customer_id) || null}
                        onChange={(event, newValue) => {
                          if (newValue) {
                            setFormData(prev => ({ ...prev, customer_id: newValue._id }));
                            setFieldErrors(prev => ({ ...prev, customer_id: '' }));
                            setCustomerFormData({
                              customer_code: newValue.customer_code || '',
                              customer_name: newValue.customer_name || '',
                              customer_type: newValue.customer_type || 'OEM',
                              industry_segment: newValue.industry_segment || '',
                              priority: newValue.priority || 'Regular',
                              gstin: newValue.gstin || '',
                              pan: newValue.pan || '',
                              address: newValue.address || '',
                              city: newValue.city || '',
                              state: newValue.state || '',
                              pincode: newValue.pincode || '',
                              country: newValue.country || 'India',
                              contact_person: newValue.contact_person || '',
                              email: newValue.email || '',
                              phone: newValue.phone || '',
                              payment_terms: newValue.payment_terms || '',
                              credit_limit: newValue.credit_limit || '',
                              bank_name: newValue.bank_name || '',
                              account_name: newValue.account_name || '',
                              account_no: newValue.account_no || '',
                              ifsc: newValue.ifsc || '',
                              branch: newValue.branch || ''
                            });
                            setIsViewMode(true);
                            setShowAddCustomerForm(true);
                            setCustomerStepper(0);
                            setCustomerFieldErrors({});
                            setCustomerTouched({});
                            setAddCustomerError('');
                          } else {
                            setFormData(prev => ({ ...prev, customer_id: '' }));
                            setShowAddCustomerForm(false);
                            resetCustomerForm();
                          }
                        }}
                        loading={loadingData}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            size="small"
                            error={!!fieldErrors.customer_id}
                            helperText={fieldErrors.customer_id}
                            sx={textFieldSx}
                          />
                        )}
                        sx={{ flex: 1 }}
                      />
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => {
                          if (!showAddCustomerForm) {
                            resetCustomerForm();
                            setIsViewMode(false);
                            setShowAddCustomerForm(true);
                            setAddCustomerError('');
                          } else {
                            setShowAddCustomerForm(false);
                            resetCustomerForm();
                          }
                        }}
                        startIcon={showAddCustomerForm ? <CloseIcon sx={{ fontSize: '0.875rem' }} /> : <AddIcon sx={{ fontSize: '0.875rem' }} />}
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
                        {showAddCustomerForm ? 'Cancel' : 'Add New'}
                      </Button>
                    </Box>
                  </Box>
                </Grid>

                {showAddCustomerForm && (
                  <Grid size={{ xs: 12 }}>
                    {renderInlineCustomerForm()}
                  </Grid>
                )}

                <Grid size={{ xs: 12, sm: 6 }}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                    <Label>REFERENCE QUOTATION</Label>
                    <Autocomplete
                      fullWidth
                      options={quotations}
                      getOptionLabel={(option) => `${option.QuotationNo} - ${option.CustomerName}`}
                      value={quotations.find(q => q._id === formData.quotation_id) || null}
                      onChange={(event, newValue) => handleQuotationSelect(newValue)}
                      loading={loadingData}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          size="small"
                          placeholder="Optional"
                          sx={textFieldSx}
                        />
                      )}
                    />
                  </Box>
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                    <Label>CUSTOMER PO NUMBER</Label>
                    <TextField
                      fullWidth size="small" name="customer_po_number"
                      value={formData.customer_po_number}
                      onChange={handleChange}
                      placeholder="e.g., PO-2025-001"
                      sx={textFieldSx}
                    />
                  </Box>
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                    <Label>CUSTOMER PO DATE</Label>
                    <TextField
                      fullWidth type="date" size="small" name="customer_po_date"
                      value={formData.customer_po_date}
                      onChange={handleChange}
                      sx={textFieldSx}
                      InputLabelProps={{ shrink: true }}
                    />
                  </Box>
                </Grid>
              </Grid>
            </Paper>

            <Paper sx={{ p: 2, bgcolor: COLORS.background.white, borderRadius: 1.5, border: `1px solid ${COLORS.border}` }}>
              <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color: COLORS.primary, mb: 1.5 }}>
                <InfoIcon sx={{ fontSize: '1rem', mr: 0.5, verticalAlign: 'middle' }} />
                Additional Information
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                <Label>INTERNAL REMARKS</Label>
                <TextField
                  fullWidth multiline rows={3} size="small"
                  name="internal_remarks"
                  value={formData.internal_remarks}
                  onChange={handleChange}
                  placeholder="Any internal notes or special instructions..."
                  sx={textFieldSx}
                />
              </Box>
            </Paper>
          </Stack>
        );

      case 1:
        return (
          <Stack spacing={2}>
            <Paper sx={{ p: 2, bgcolor: COLORS.background.white, borderRadius: 1.5, border: `1px solid ${COLORS.border}` }}>
              <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color: COLORS.primary, mb: 1.5 }}>
                <ShippingIcon sx={{ fontSize: '1rem', mr: 0.5, verticalAlign: 'middle' }} />
                Delivery Information
              </Typography>
              <Grid container spacing={1.5}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                    <Label required>EXPECTED DELIVERY DATE</Label>
                    <TextField
                      fullWidth type="date" size="small" name="expected_delivery_date"
                      value={formData.expected_delivery_date}
                      onChange={handleChange}
                      error={!!fieldErrors.expected_delivery_date}
                      helperText={fieldErrors.expected_delivery_date}
                      sx={textFieldSx}
                      InputLabelProps={{ shrink: true }}
                    />
                  </Box>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                    <Label>PAYMENT TERMS</Label>
                    <TextField
                      fullWidth size="small" name="payment_terms"
                      value={formData.payment_terms}
                      onChange={handleChange}
                      placeholder="e.g., Net 30, 50% Advance"
                      sx={textFieldSx}
                    />
                  </Box>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                    <Label>DELIVERY TERMS</Label>
                    <FormControl fullWidth size="small">
                      <Select
                        name="delivery_terms"
                        value={formData.delivery_terms}
                        onChange={handleChange}
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
                        value={formData.delivery_mode}
                        onChange={handleChange}
                        sx={selectSx}
                      >
                        {DELIVERY_MODE_OPTIONS.map(opt => (
                          <MenuItem key={opt} value={opt} sx={{ fontSize: '0.75rem' }}>{opt || 'None'}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Box>
                </Grid>
              </Grid>
            </Paper>

            <Paper sx={{ p: 2, bgcolor: COLORS.background.white, borderRadius: 1.5, border: `1px solid ${COLORS.border}` }}>
              <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color: COLORS.primary, mb: 1.5 }}>
                <MoneyIcon sx={{ fontSize: '1rem', mr: 0.5, verticalAlign: 'middle' }} />
                Financial Information
              </Typography>
              <Grid container spacing={1.5}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                    <Label>CURRENCY</Label>
                    <FormControl fullWidth size="small">
                      <Select
                        name="currency"
                        value={formData.currency}
                        onChange={handleChange}
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
            </Paper>
          </Stack>
        );

      case 2:
        return (
          <Stack spacing={2}>
            <Paper sx={{ p: 2, bgcolor: COLORS.background.white, borderRadius: 1.5, border: `1px solid ${COLORS.border}` }}>
              <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color: COLORS.primary, mb: 1.5 }}>
                <InventoryIcon sx={{ fontSize: '1rem', mr: 0.5, verticalAlign: 'middle' }} />
                Order Items <span style={{ color: '#EF4444' }}>*</span>
              </Typography>

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
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Label required>ITEM</Label>
                          <Tooltip title="Add New Item">
                            <IconButton
                              size="small"
                              onClick={() => openAddItemDialog(index)}
                              sx={{ color: COLORS.primary, p: 0.25, '&:hover': { bgcolor: COLORS.primaryLight } }}
                            >
                              <AddIcon sx={{ fontSize: '0.8rem' }} />
                            </IconButton>
                          </Tooltip>
                        </Box>
                        <Autocomplete
                          fullWidth
                          options={items}
                          getOptionLabel={(option) => `${option.part_no} - ${option.part_description}`}
                          value={items.find(i => i._id === item.item_id) || null}
                          onChange={(event, newValue) => handleItemChange(index, 'item_id', newValue?._id || '')}
                          loading={loadingData}
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              size="small"
                              error={!!fieldErrors[`item_${index}_item_id`]}
                              helperText={fieldErrors[`item_${index}_item_id`]}
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
                          error={!!fieldErrors[`item_${index}_ordered_qty`]}
                          helperText={fieldErrors[`item_${index}_ordered_qty`]}
                          sx={textFieldSx}
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
                          error={!!fieldErrors[`item_${index}_unit_price`]}
                          helperText={fieldErrors[`item_${index}_unit_price`]}
                          sx={textFieldSx}
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
                Add Item
              </Button>
            </Paper>
          </Stack>
        );

      case 3:
        return (
          <Stack spacing={2}>
            <Paper sx={{ p: 2, bgcolor: COLORS.background.white, borderRadius: 1.5, border: `1px solid ${COLORS.border}` }}>
              <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color: COLORS.primary, mb: 1.5 }}>
                <InfoIcon sx={{ fontSize: '1rem', mr: 0.5, verticalAlign: 'middle' }} />
                Review & Submit
              </Typography>

              <Stack spacing={2}>
                <Paper sx={{ p: 2, bgcolor: COLORS.background.light, borderRadius: 1.5 }}>
                  <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: COLORS.primary, mb: 1 }}>
                    Customer Information
                  </Typography>
                  <Grid container spacing={1}>
                    <Grid size={{ xs: 6 }}>
                      <Typography sx={{ fontSize: '0.7rem', color: COLORS.text.secondary }}>Customer:</Typography>
                    </Grid>
                    <Grid size={{ xs: 6 }}>
                      <Typography sx={{ fontSize: '0.7rem', fontWeight: 500 }}>
                        {customers.find(c => c._id === formData.customer_id)?.customer_name || '-'}
                      </Typography>
                    </Grid>
                    <Grid size={{ xs: 6 }}>
                      <Typography sx={{ fontSize: '0.7rem', color: COLORS.text.secondary }}>PO Number:</Typography>
                    </Grid>
                    <Grid size={{ xs: 6 }}>
                      <Typography sx={{ fontSize: '0.7rem', fontWeight: 500 }}>{formData.customer_po_number || '-'}</Typography>
                    </Grid>
                    <Grid size={{ xs: 6 }}>
                      <Typography sx={{ fontSize: '0.7rem', color: COLORS.text.secondary }}>Expected Delivery:</Typography>
                    </Grid>
                    <Grid size={{ xs: 6 }}>
                      <Typography sx={{ fontSize: '0.7rem', fontWeight: 500 }}>{formData.expected_delivery_date}</Typography>
                    </Grid>
                    <Grid size={{ xs: 6 }}>
                      <Typography sx={{ fontSize: '0.7rem', color: COLORS.text.secondary }}>Currency:</Typography>
                    </Grid>
                    <Grid size={{ xs: 6 }}>
                      <Typography sx={{ fontSize: '0.7rem', fontWeight: 500 }}>{formData.currency}</Typography>
                    </Grid>
                  </Grid>
                </Paper>

                <Paper sx={{ p: 2, bgcolor: COLORS.background.light, borderRadius: 1.5 }}>
                  <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: COLORS.primary, mb: 1 }}>
                    Order Summary
                  </Typography>
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell sx={{ fontSize: '0.65rem', fontWeight: 600, color: COLORS.text.secondary }}>Item</TableCell>
                          <TableCell sx={{ fontSize: '0.65rem', fontWeight: 600, color: COLORS.text.secondary }}>Qty</TableCell>
                          <TableCell sx={{ fontSize: '0.65rem', fontWeight: 600, color: COLORS.text.secondary }}>Unit</TableCell>
                          <TableCell sx={{ fontSize: '0.65rem', fontWeight: 600, color: COLORS.text.secondary }} align="right">Price</TableCell>
                          <TableCell sx={{ fontSize: '0.65rem', fontWeight: 600, color: COLORS.text.secondary }} align="right">Total</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {soItems.map((item, idx) => {
                          const total = (item.ordered_qty * item.unit_price) * (1 - (item.discount_percent / 100));
                          return (
                            <TableRow key={idx}>
                              <TableCell sx={{ fontSize: '0.7rem' }}>{item.part_no || '-'}</TableCell>
                              <TableCell sx={{ fontSize: '0.7rem' }}>{item.ordered_qty}</TableCell>
                              <TableCell sx={{ fontSize: '0.7rem' }}>{item.unit}</TableCell>
                              <TableCell sx={{ fontSize: '0.7rem' }} align="right">{formatCurrency(item.unit_price)}</TableCell>
                              <TableCell sx={{ fontSize: '0.7rem' }} align="right">{formatCurrency(total)}</TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </TableContainer>

                  <Divider sx={{ my: 2 }} />
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
              </Stack>
            </Paper>
          </Stack>
        );

      default:
        return null;
    }
  };

  // ==========================================================================
  // RENDER
  // ==========================================================================
  return (
    <>
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
            Add New Sales Order
          </Typography>
          <IconButton onClick={handleClose} size="small">
            <CloseIcon fontSize="small" />
          </IconButton>
        </DialogTitle>

        <Box sx={{ px: 2.5, pt: 1 }}>
          <FloatingErrorAlert error={error} onClose={() => setError('')} />
        </Box>

        <Box sx={{ px: 2.5, pt: error ? 1 : 2, bgcolor: COLORS.background.white }}>
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

        <DialogContent sx={{ p: 2.5, pt: error ? 1 : 2, bgcolor: COLORS.background.white }}>
          {renderStepContent(activeStep)}
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
                  boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
                  '&:hover': { bgcolor: COLORS.primaryDark }
                }}
              >
                {loading ? 'Creating...' : 'Create Sales Order'}
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

      {/* Quotation Conflict Dialog */}
      <Dialog
        open={quotationConflict}
        onClose={() => setQuotationConflict(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: 2, border: `1px solid ${COLORS.border}` } }}
      >
        <DialogTitle sx={{ py: 1.5, px: 2.5, borderBottom: `1px solid ${COLORS.border}` }}>
          <Typography sx={{ fontSize: '1rem', fontWeight: 600, color: COLORS.text.primary }}>
            Customer Conflict
          </Typography>
          <IconButton onClick={() => setQuotationConflict(false)} size="small" sx={{ position: 'absolute', right: 8, top: 8 }}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 2.5 }}>
          <Typography sx={{ fontSize: '0.8rem', color: COLORS.text.secondary, mb: 1 }}>
            This quotation belongs to a different customer:
          </Typography>
          <Paper sx={{ p: 1.5, bgcolor: COLORS.background.light, borderRadius: 1.5, mb: 2 }}>
            <Typography sx={{ fontSize: '0.75rem', fontWeight: 500, color: COLORS.primary }}>
              {pendingQuotation?.CustomerName || 'Unknown Customer'}
            </Typography>
          </Paper>
          <Typography sx={{ fontSize: '0.8rem', color: COLORS.text.secondary }}>
            What would you like to do?
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 2.5, py: 1.5, borderTop: `1px solid ${COLORS.border}`, gap: 1 }}>
          <Button
            onClick={() => applyQuotation(pendingQuotation, true)}
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
            Keep Current Customer
          </Button>
          <Button
            variant="contained"
            onClick={() => applyQuotation(pendingQuotation, false)}
            size="small"
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
            Switch to Quotation's Customer
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add Item Dialog (kept as popup) */}
      <AddItem
        open={addItemOpen}
        onClose={() => {
          setAddItemOpen(false);
          setCurrentItemIndex(null);
        }}
        onAdd={handleItemAdded}
      />
    </>
  );
};

export default AddSaleOrder;