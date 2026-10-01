// InwardReceiptDialog.js
import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Paper,
  Grid,
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
  InputLabel,
  Select,
  MenuItem,
  Divider,
  Stepper,
  Step,
  StepLabel,
  StepConnector,
  stepConnectorClasses,
  styled,
  CircularProgress,
  Collapse,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  LinearProgress
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  NavigateNext as NavigateNextIcon,
  NavigateBefore as NavigateBeforeIcon,
  Inventory as InventoryIcon,
  Description as DescriptionIcon,
  Upload as UploadIcon,
  FilePresent as FilePresentIcon,
  Close as CloseIcon,
  Error as ErrorIcon,
  CheckCircle as CheckCircleIcon,
  LocalShipping as LocalShippingIcon
} from '@mui/icons-material';
import axios from 'axios';
import BASE_URL from '../../../config/Config';

// Color constants matching AddCustomer
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
  border: '#E3E8EF'
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

// Options
const RECEIPT_TYPE_OPTIONS = ['Full Receipt', 'Partial Receipt', 'Final Receipt'];
const DOCUMENT_TYPE_OPTIONS = ['POD', 'GRN', 'Invoice', 'Challan', 'Others'];
const CONDITION_OPTIONS = ['Good', 'Damaged', 'Defective', 'Partial'];

const steps = ['Receipt Details', 'Items Receiving', 'Documents'];

const InwardReceiptDialog = ({ open, onClose, deliveryChallan, onSuccess }) => {
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [receiptStatus, setReceiptStatus] = useState(null);

  // Form data
  const [formData, setFormData] = useState({
    receipt_type: 'Full Receipt',
    receipt_number: '',
    receipt_note: '',
    document_types: [],
    items: [],
    document: []
  });

  const showError = (message) => {
    setError(message);
    setTimeout(() => {
      setError('');
    }, 5000);
  };

  // Fetch receipt status for the DC to get already received quantities
  const fetchReceiptStatus = useCallback(async (dcId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${BASE_URL}/api/inward-receipts/receipt-status/${dcId}/`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.data.success) {
        setReceiptStatus(response.data.data);
        return response.data.data;
      }
    } catch (err) {
      console.error('Error fetching receipt status:', err);
    }
    return null;
  }, []);

  // Initialize items from delivery challan items when dialog opens
  useEffect(() => {
    if (open && deliveryChallan?.items) {
      const initializeItems = async () => {
        // Fetch receipt status to get already received quantities
        const status = await fetchReceiptStatus(deliveryChallan._id);
        
        // Create a map of item_id -> received_qty from receipt status
        const receivedQtyMap = {};
        if (status?.items) {
          status.items.forEach(item => {
            receivedQtyMap[item.part_no] = item.received_qty || 0;
          });
        }

        // The field name is dispatch_qty in the API response
        const initialItems = deliveryChallan.items.map(item => {
          const partNo = item.part_no || '';
          const alreadyReceived = receivedQtyMap[partNo] || 0;
          const totalDispatchQty = item.dispatch_qty || item.quantity || 0;
          const remainingQty = Math.max(0, totalDispatchQty - alreadyReceived);

          return {
            dc_item_id: item._id || item.id,
            part_no: partNo,
            part_name: item.part_name || item.item_name || item.name || 'Item',
            hsn_code: item.hsn_code || '',
            unit: item.unit || 'Nos',
            original_qty: totalDispatchQty, // Store original total dispatch qty
            remaining_qty: remainingQty, // Remaining quantity to receive
            receiving_qty: remainingQty, // Default to remaining quantity
            already_received: alreadyReceived,
            condition: 'Good',
            location: '',
            remarks: ''
          };
        });

        setFormData(prev => ({
          ...prev,
          items: initialItems,
          receipt_number: generateReceiptNumber()
        }));
      };

      initializeItems();
    }
  }, [open, deliveryChallan, fetchReceiptStatus]);

  const generateReceiptNumber = () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `GRN-${year}-${month}${day}-${random}`;
  };

  const handleInputChange = (field) => (event) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value
    }));
    setFieldErrors(prev => ({ ...prev, [field]: '' }));
  };

  const handleItemChange = (index, field) => (event) => {
    const newItems = [...formData.items];
    const value = field === 'receiving_qty' ? Number(event.target.value) : event.target.value;
    newItems[index] = { ...newItems[index], [field]: value };
    setFormData(prev => ({ ...prev, items: newItems }));
    // Clear error for this field
    if (fieldErrors[`items.${index}.${field}`]) {
      setFieldErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[`items.${index}.${field}`];
        return newErrors;
      });
    }
  };

  const handleDocumentTypeChange = (event) => {
    setFormData(prev => ({
      ...prev,
      document_types: event.target.value
    }));
  };

  const handleFileUpload = async (event) => {
    const files = Array.from(event.target.files);
    setIsUploading(true);
    setUploadProgress(0);

    try {
      const newDocuments = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        setUploadProgress(((i + 1) / files.length) * 100);
        
        const reader = new FileReader();
        const fileData = await new Promise((resolve) => {
          reader.onload = (e) => resolve(e.target.result);
          reader.readAsDataURL(file);
        });

        newDocuments.push({
          file_name: file.name,
          file_content: fileData,
          file: file,
          size: file.size,
          type: file.type
        });
      }

      setFormData(prev => ({
        ...prev,
        document: [...prev.document, ...newDocuments]
      }));
    } catch (err) {
      showError('Failed to upload files');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const removeDocument = (index) => {
    setFormData(prev => ({
      ...prev,
      document: prev.document.filter((_, i) => i !== index)
    }));
  };

  const validateStep = (step) => {
    const errors = {};
    let isValid = true;
    let errorMessages = [];

    switch (step) {
      case 0: // Receipt Details
        if (!formData.receipt_type) {
          errors.receipt_type = 'Receipt type is required';
          errorMessages.push('Receipt type is required');
          isValid = false;
        }
        if (!formData.receipt_number) {
          errors.receipt_number = 'Receipt number is required';
          errorMessages.push('Receipt number is required');
          isValid = false;
        }
        break;
      
      case 1: // Items Receiving
        if (formData.items.length === 0) {
          errors.items_general = 'At least one item is required';
          errorMessages.push('At least one item is required');
          isValid = false;
        } else {
          formData.items.forEach((item, index) => {
            if (!item.receiving_qty || item.receiving_qty <= 0) {
              errors[`items.${index}.receiving_qty`] = 'Receiving quantity must be greater than 0';
              errorMessages.push(`Item ${index + 1}: Receiving quantity must be greater than 0`);
              isValid = false;
            }
            if (item.receiving_qty > item.remaining_qty) {
              errors[`items.${index}.receiving_qty`] = `Receiving quantity cannot exceed remaining quantity (${item.remaining_qty})`;
              errorMessages.push(`Item ${index + 1}: Receiving quantity cannot exceed remaining quantity (${item.remaining_qty})`);
              isValid = false;
            }
          });
        }
        break;
      
      case 2: // Documents
        // No validation needed, documents are optional
        break;
    }

    setFieldErrors(errors);
    if (!isValid) {
      showError(errorMessages[0]);
    }
    return isValid;
  };

  const validateForm = () => {
    const errors = {};
    let isValid = true;
    let errorMessages = [];

    if (!formData.receipt_type) {
      errors.receipt_type = 'Receipt type is required';
      errorMessages.push('Receipt type is required');
      isValid = false;
    }
    if (!formData.receipt_number) {
      errors.receipt_number = 'Receipt number is required';
      errorMessages.push('Receipt number is required');
      isValid = false;
    }

    if (formData.items.length === 0) {
      errors.items_general = 'At least one item is required';
      errorMessages.push('At least one item is required');
      isValid = false;
    } else {
      formData.items.forEach((item, index) => {
        if (!item.receiving_qty || item.receiving_qty <= 0) {
          errors[`items.${index}.receiving_qty`] = 'Receiving quantity must be greater than 0';
          errorMessages.push(`Item ${index + 1}: Receiving quantity must be greater than 0`);
          isValid = false;
        }
        if (item.receiving_qty > item.remaining_qty) {
          errors[`items.${index}.receiving_qty`] = `Receiving quantity cannot exceed remaining quantity (${item.remaining_qty})`;
          errorMessages.push(`Item ${index + 1}: Receiving quantity cannot exceed remaining quantity (${item.remaining_qty})`);
          isValid = false;
        }
      });
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
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      
      // Prepare the payload
      const payload = {
        dc_id: deliveryChallan._id,
        receipt_type: formData.receipt_type,
        receipt_number: formData.receipt_number,
        receipt_note: formData.receipt_note
      };

      // If we have documents to upload, use FormData with JSON strings
      if (formData.document.length > 0) {
        const formDataObj = new FormData();
        
        // Add text fields as individual fields
        formDataObj.append('dc_id', payload.dc_id);
        formDataObj.append('receipt_type', payload.receipt_type);
        formDataObj.append('receipt_number', payload.receipt_number);
        formDataObj.append('receipt_note', payload.receipt_note || '');
        
        // Add items as JSON string
        const itemsData = formData.items.map(item => ({
          dc_item_id: item.dc_item_id,
          receiving_qty: item.receiving_qty,
          condition: item.condition,
          location: item.location || '',
          remarks: item.remarks || ''
        }));
        formDataObj.append('items', JSON.stringify(itemsData));
        
        // Add document_types as JSON string
        formDataObj.append('document_types', JSON.stringify(formData.document_types));
        
        // Add files - send as individual fields with same name 'documents'
        formData.document.forEach((doc) => {
          // Convert base64 to Blob
          const byteString = atob(doc.file_content.split(',')[1]);
          const mimeString = doc.file_content.split(',')[0].split(':')[1].split(';')[0];
          const ab = new ArrayBuffer(byteString.length);
          const ia = new Uint8Array(ab);
          for (let i = 0; i < byteString.length; i++) {
            ia[i] = byteString.charCodeAt(i);
          }
          const blob = new Blob([ab], { type: mimeString });
          formDataObj.append('documents', blob, doc.file_name);
        });
        
        const response = await axios.post(`${BASE_URL}/api/inward-receipts`, formDataObj, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          },
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setUploadProgress(percentCompleted);
          }
        });

        if (response.data.success) {
          onSuccess?.();
          handleClose();
        } else {
          showError(response.data.message || 'Failed to create inward receipt');
        }
      } else {
        // No documents - send as JSON
        const requestData = {
          dc_id: payload.dc_id,
          receipt_type: payload.receipt_type,
          receipt_number: payload.receipt_number,
          receipt_note: payload.receipt_note || '',
          document_types: formData.document_types,
          items: formData.items.map(item => ({
            dc_item_id: item.dc_item_id,
            receiving_qty: item.receiving_qty,
            condition: item.condition,
            location: item.location || '',
            remarks: item.remarks || ''
          }))
        };

        const response = await axios.post(`${BASE_URL}/api/inward-receipts`, requestData, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.data.success) {
          onSuccess?.();
          handleClose();
        } else {
          showError(response.data.message || 'Failed to create inward receipt');
        }
      }
    } catch (error) {
      console.error('Error creating inward receipt:', error);
      showError(error.response?.data?.message || 'Failed to create inward receipt');
    } finally {
      setLoading(false);
      setUploadProgress(0);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setActiveStep(0);
      setFormData({
        receipt_type: 'Full Receipt',
        receipt_number: '',
        receipt_note: '',
        document_types: [],
        items: [],
        document: []
      });
      setReceiptStatus(null);
      setFieldErrors({});
      setError('');
      setUploadProgress(0);
      setIsUploading(false);
      onClose();
    }
  };

  const getTotalReceivingQty = () => {
    return formData.items.reduce((sum, item) => sum + (item.receiving_qty || 0), 0);
  };

  const getTotalRemainingQty = () => {
    return formData.items.reduce((sum, item) => sum + (item.remaining_qty || 0), 0);
  };

  const getTotalAlreadyReceived = () => {
    return formData.items.reduce((sum, item) => sum + (item.already_received || 0), 0);
  };

  const getTotalOriginalQty = () => {
    return formData.items.reduce((sum, item) => sum + (item.original_qty || 0), 0);
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Render Step Content
  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Stack spacing={2}>
            <Paper sx={{ p: 2, bgcolor: COLORS.background.white, borderRadius: 1.5, border: `1px solid ${COLORS.border}` }}>
              <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color: COLORS.primary, mb: 1.5 }}>
                <DescriptionIcon sx={{ fontSize: '1rem', mr: 0.5, verticalAlign: 'middle' }} />
                Receipt Information
              </Typography>
              
              <Grid container spacing={1.5}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                    <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary }}>
                      Receipt Type <span style={{ color: '#EF4444' }}>*</span>
                    </Typography>
                    <FormControl fullWidth size="small" error={!!fieldErrors.receipt_type}>
                      <Select
                        value={formData.receipt_type}
                        onChange={handleInputChange('receipt_type')}
                        sx={{
                          borderRadius: 1.5,
                          fontSize: '0.75rem',
                          '& .MuiSelect-select': { py: 1, px: 1.5 },
                          '&.Mui-error': { borderColor: '#EF4444' }
                        }}
                      >
                        {RECEIPT_TYPE_OPTIONS.map(option => (
                          <MenuItem key={option} value={option} sx={{ fontSize: '0.75rem' }}>
                            {option}
                          </MenuItem>
                        ))}
                      </Select>
                      {fieldErrors.receipt_type && (
                        <Typography sx={{ fontSize: '0.65rem', color: '#EF4444' }}>
                          {fieldErrors.receipt_type}
                        </Typography>
                      )}
                    </FormControl>
                  </Box>
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                    <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary }}>
                      Receipt Number <span style={{ color: '#EF4444' }}>*</span>
                    </Typography>
                    <TextField
                      fullWidth
                      size="small"
                      value={formData.receipt_number}
                      onChange={handleInputChange('receipt_number')}
                      placeholder="Auto-generated"
                      error={!!fieldErrors.receipt_number}
                      helperText={fieldErrors.receipt_number}
                      sx={{
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
                          fontSize: '0.75rem'
                        }
                      }}
                    />
                  </Box>
                </Grid>

                <Grid size={{ xs: 12 }}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                    <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary }}>
                      Receipt Note
                    </Typography>
                    <TextField
                      fullWidth
                      size="small"
                      multiline
                      rows={3}
                      value={formData.receipt_note}
                      onChange={handleInputChange('receipt_note')}
                      placeholder="Additional notes about this receipt..."
                      sx={{
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
                      }}
                    />
                  </Box>
                </Grid>

                <Grid size={{ xs: 12 }}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                    <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary }}>
                      Document Types
                    </Typography>
                    <FormControl fullWidth size="small">
                      <Select
                        multiple
                        value={formData.document_types}
                        onChange={handleDocumentTypeChange}
                        renderValue={(selected) => (
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                            {selected.map((value) => (
                              <Chip key={value} label={value} size="small" />
                            ))}
                          </Box>
                        )}
                        sx={{
                          borderRadius: 1.5,
                          fontSize: '0.75rem',
                          '& .MuiSelect-select': { py: 1, px: 1.5 }
                        }}
                      >
                        {DOCUMENT_TYPE_OPTIONS.map((option) => (
                          <MenuItem key={option} value={option} sx={{ fontSize: '0.75rem' }}>
                            {option}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Box>
                </Grid>
              </Grid>
            </Paper>
          </Stack>
        );

      case 1:
        return (
          <Stack spacing={2}>
            <Paper sx={{ p: 2, bgcolor: COLORS.background.white, borderRadius: 1.5, border: `1px solid ${COLORS.border}` }}>
              <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color: COLORS.primary, mb: 1.5 }}>
                <InventoryIcon sx={{ fontSize: '1rem', mr: 0.5, verticalAlign: 'middle' }} />
                Items Receiving <span style={{ color: '#EF4444' }}>*</span>
              </Typography>
              
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                mb: 2,
                p: 1,
                bgcolor: COLORS.background.light,
                borderRadius: 1,
                border: `1px solid ${COLORS.border}`
              }}>
                <Typography sx={{ fontSize: '0.7rem', color: COLORS.text.secondary }}>
                  DC: {deliveryChallan?.dc_number}
                </Typography>
                <Typography sx={{ fontSize: '0.7rem', color: COLORS.text.secondary }}>
                  Total: <strong>{getTotalOriginalQty()}</strong> | 
                  Received: <strong style={{ color: '#059669' }}>{getTotalAlreadyReceived()}</strong> | 
                  Remaining: <strong style={{ color: COLORS.primary }}>{getTotalRemainingQty()}</strong> | 
                  Receiving: <strong style={{ color: '#D97706' }}>{getTotalReceivingQty()}</strong>
                </Typography>
              </Box>

              {fieldErrors.items_general && (
                <Alert severity="error" sx={{ mb: 2, borderRadius: 1.5, fontSize: '0.75rem', py: 0 }}>
                  {fieldErrors.items_general}
                </Alert>
              )}
              
              <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 1.5 }}>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ bgcolor: '#F8FFFC' }}>
                      <TableCell sx={{ fontWeight: 600, fontSize: '0.7rem' }}>Item</TableCell>
                      <TableCell sx={{ fontWeight: 600, fontSize: '0.7rem' }} align="center">Total</TableCell>
                      <TableCell sx={{ fontWeight: 600, fontSize: '0.7rem' }} align="center">Already Received</TableCell>
                      <TableCell sx={{ fontWeight: 600, fontSize: '0.7rem' }} align="center">Remaining</TableCell>
                      <TableCell sx={{ fontWeight: 600, fontSize: '0.7rem' }} align="center">Receiving *</TableCell>
                      <TableCell sx={{ fontWeight: 600, fontSize: '0.7rem' }}>Condition</TableCell>
                      <TableCell sx={{ fontWeight: 600, fontSize: '0.7rem' }}>Location</TableCell>
                      <TableCell sx={{ fontWeight: 600, fontSize: '0.7rem' }}>Remarks</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {formData.items.map((item, index) => (
                      <TableRow key={index} hover>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontSize: '0.75rem', fontWeight: 500 }}>
                            {item.part_name}
                          </Typography>
                          <Typography variant="caption" sx={{ color: '#94A3B8', display: 'block' }}>
                            Part No: {item.part_no || 'NA'} | HSN: {item.hsn_code || 'NA'} | Unit: {item.unit}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Typography variant="body2" sx={{ fontSize: '0.75rem', fontWeight: 600, color: COLORS.text.primary }}>
                            {item.original_qty}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Typography variant="body2" sx={{ fontSize: '0.75rem', fontWeight: 600, color: '#059669' }}>
                            {item.already_received || 0}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Typography variant="body2" sx={{ fontSize: '0.75rem', fontWeight: 600, color: COLORS.primary }}>
                            {item.remaining_qty}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <TextField
                            size="small"
                            type="number"
                            value={item.receiving_qty}
                            onChange={handleItemChange(index, 'receiving_qty')}
                            error={!!fieldErrors[`items.${index}.receiving_qty`]}
                            helperText={fieldErrors[`items.${index}.receiving_qty`]}
                            InputProps={{ 
                              inputProps: { min: 0, max: item.remaining_qty },
                              sx: { width: 80 }
                            }}
                            sx={{
                              '& .MuiOutlinedInput-root': {
                                borderRadius: 1.5,
                                fontSize: '0.75rem',
                                '&:hover fieldset': { borderColor: COLORS.primary },
                                '&.Mui-focused fieldset': { borderColor: COLORS.primary, borderWidth: 1 },
                                '&.Mui-error fieldset': { borderColor: '#EF4444' }
                              },
                              '& .MuiInputBase-input': {
                                py: 0.5,
                                px: 1,
                                fontSize: '0.75rem',
                                textAlign: 'center'
                              }
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <FormControl size="small" sx={{ minWidth: 100 }}>
                            <Select
                              value={item.condition}
                              onChange={handleItemChange(index, 'condition')}
                              sx={{
                                borderRadius: 1.5,
                                fontSize: '0.75rem',
                                '& .MuiSelect-select': { py: 0.5, px: 1 }
                              }}
                            >
                              {CONDITION_OPTIONS.map(option => (
                                <MenuItem key={option} value={option} sx={{ fontSize: '0.75rem' }}>
                                  {option}
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        </TableCell>
                        <TableCell>
                          <TextField
                            size="small"
                            value={item.location}
                            onChange={handleItemChange(index, 'location')}
                            placeholder="Location"
                            sx={{
                              '& .MuiOutlinedInput-root': {
                                borderRadius: 1.5,
                                fontSize: '0.75rem',
                                '&:hover fieldset': { borderColor: COLORS.primary },
                                '&.Mui-focused fieldset': { borderColor: COLORS.primary, borderWidth: 1 }
                              },
                              '& .MuiInputBase-input': {
                                py: 0.5,
                                px: 1,
                                fontSize: '0.75rem'
                              }
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <TextField
                            size="small"
                            value={item.remarks}
                            onChange={handleItemChange(index, 'remarks')}
                            placeholder="Notes"
                            sx={{
                              '& .MuiOutlinedInput-root': {
                                borderRadius: 1.5,
                                fontSize: '0.75rem',
                                '&:hover fieldset': { borderColor: COLORS.primary },
                                '&.Mui-focused fieldset': { borderColor: COLORS.primary, borderWidth: 1 }
                              },
                              '& .MuiInputBase-input': {
                                py: 0.5,
                                px: 1,
                                fontSize: '0.75rem'
                              }
                            }}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Stack>
        );

      case 2:
        return (
          <Stack spacing={2}>
            <Paper sx={{ p: 2, bgcolor: COLORS.background.white, borderRadius: 1.5, border: `1px solid ${COLORS.border}` }}>
              <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color: COLORS.primary, mb: 1.5 }}>
                <UploadIcon sx={{ fontSize: '1rem', mr: 0.5, verticalAlign: 'middle' }} />
                Documents
              </Typography>

              {/* Upload Area */}
              <Box
                sx={{
                  border: '2px dashed #E3E8EF',
                  borderRadius: 2,
                  p: 3,
                  textAlign: 'center',
                  bgcolor: '#FAFAFA',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    borderColor: COLORS.primary,
                    bgcolor: COLORS.background.light
                  }
                }}
              >
                <input
                  type="file"
                  multiple
                  onChange={handleFileUpload}
                  style={{ display: 'none' }}
                  id="document-upload"
                  accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                />
                <label htmlFor="document-upload" style={{ cursor: 'pointer' }}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                    <UploadIcon sx={{ fontSize: 48, color: COLORS.text.tertiary }} />
                    <Typography sx={{ fontSize: '0.85rem', fontWeight: 600, color: COLORS.text.secondary }}>
                      Click or drag to upload documents
                    </Typography>
                    <Typography sx={{ fontSize: '0.7rem', color: COLORS.text.tertiary }}>
                      Supported formats: PDF, JPG, PNG, DOC (Max 10MB each)
                    </Typography>
                    <Button
                      variant="outlined"
                      component="span"
                      startIcon={<UploadIcon />}
                      sx={{
                        mt: 1,
                        borderRadius: 1.5,
                        textTransform: 'none',
                        fontSize: '0.75rem',
                        borderColor: COLORS.border,
                        '&:hover': { borderColor: COLORS.primary }
                      }}
                    >
                      Browse Files
                    </Button>
                  </Box>
                </label>
              </Box>

              {/* Upload Progress */}
              {isUploading && (
                <Box sx={{ mt: 2 }}>
                  <LinearProgress 
                    variant="determinate" 
                    value={uploadProgress} 
                    sx={{ 
                      height: 6, 
                      borderRadius: 3,
                      bgcolor: '#E8F0F1',
                      '& .MuiLinearProgress-bar': {
                        bgcolor: COLORS.primary
                      }
                    }} 
                  />
                  <Typography sx={{ fontSize: '0.7rem', color: COLORS.text.secondary, mt: 0.5 }}>
                    Uploading... {Math.round(uploadProgress)}%
                  </Typography>
                </Box>
              )}
              
              {/* Uploaded Files */}
              {formData.document.length > 0 && (
                <Paper variant="outlined" sx={{ mt: 2, p: 1.5 }}>
                  <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary, mb: 1 }}>
                    Uploaded Files ({formData.document.length})
                  </Typography>
                  <Stack spacing={1}>
                    {formData.document.map((doc, index) => (
                      <Box
                        key={index}
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          p: 1,
                          bgcolor: COLORS.background.light,
                          borderRadius: 1,
                          border: `1px solid ${COLORS.border}`
                        }}
                      >
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <FilePresentIcon sx={{ color: COLORS.primary, fontSize: '1.2rem' }} />
                          <Box>
                            <Typography variant="body2" sx={{ fontSize: '0.75rem', fontWeight: 500 }}>
                              {doc.file_name}
                            </Typography>
                            <Typography variant="caption" sx={{ fontSize: '0.65rem', color: COLORS.text.tertiary }}>
                              {formatFileSize(doc.size)}
                            </Typography>
                          </Box>
                        </Stack>
                        <IconButton
                          size="small"
                          onClick={() => removeDocument(index)}
                          sx={{ color: '#EF4444', '&:hover': { bgcolor: '#FEE2E2' } }}
                        >
                          <CloseIcon sx={{ fontSize: '1rem' }} />
                        </IconButton>
                      </Box>
                    ))}
                  </Stack>
                </Paper>
              )}
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
      maxWidth="lg"
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
        bgcolor: COLORS.background.white
      }}>
        <Typography sx={{ fontSize: '1.2rem', fontWeight: 700, color: COLORS.text.primary }}>
          Create Inward Receipt
        </Typography>
        {deliveryChallan && (
          <Typography sx={{ fontSize: '0.75rem', color: COLORS.text.secondary, mt: 0.5 }}>
            DC: {deliveryChallan.dc_number} | Customer: {deliveryChallan.customer_name}
          </Typography>
        )}
        {receiptStatus && receiptStatus.receipt_status && (
          <Chip 
            label={`${receiptStatus.receipt_status} - ${receiptStatus.total_received_qty || 0}/${receiptStatus.total_dispatch_qty || 0} received`}
            size="small"
            sx={{ mt: 0.5, fontSize: '0.65rem', fontWeight: 500 }}
            color={receiptStatus.is_fully_received ? 'success' : 'warning'}
          />
        )}
      </DialogTitle>

      {/* Floating Error Alert */}
      <Box sx={{ px: 2.5, pt: 1 }}>
        <FloatingErrorAlert error={error} onClose={() => setError('')} />
      </Box>

      {/* Stepper */}
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
              startIcon={<CheckCircleIcon sx={{ fontSize: '1rem' }} />}
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
              {loading ? 'Creating...' : 'Create Receipt'}
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
  );
};

export default InwardReceiptDialog;