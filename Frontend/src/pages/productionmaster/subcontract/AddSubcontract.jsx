import React, { useState, useEffect, useCallback } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, TextField, Alert, Typography, Box, Stack, Grid,
  Autocomplete, FormControl, Select, MenuItem, Paper, IconButton, Tooltip,
  Stepper, Step, StepLabel, StepConnector, stepConnectorClasses, styled,
  Collapse, Divider, Chip
} from '@mui/material';
import { 
  Add as AddIcon, 
  NavigateNext as NavigateNextIcon, 
  NavigateBefore as NavigateBeforeIcon,
  Settings as SettingsIcon, 
  Error as ErrorIcon, 
  Close as CloseIcon,
  LocalShipping as DispatchIcon,
  Business as VendorIcon,
  Warehouse as WarehouseIcon,
  QrCodeScanner as ProcessIcon,
  Assignment as AssignmentIcon,
  CalendarToday as CalendarIcon,
  Description as DescriptionIcon
} from '@mui/icons-material';
import axios from 'axios';
import BASE_URL from '../../../config/Config';

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

const steps = ['Subcontract Details', 'Items & Transport'];

const AddSubcontract = ({ open, onClose, onAdd }) => {
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  // Data fetching states
  const [workOrders, setWorkOrders] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [deliveryChallans, setDeliveryChallans] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [operations, setOperations] = useState([]);
  const [selectedWO, setSelectedWO] = useState(null);
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [selectedWarehouse, setSelectedWarehouse] = useState(null);

  const [loadingWO, setLoadingWO] = useState(false);
  const [loadingVendors, setLoadingVendors] = useState(false);
  const [loadingDC, setLoadingDC] = useState(false);
  const [loadingWH, setLoadingWH] = useState(false);

  // Form data
  const [formData, setFormData] = useState({
    wo_id: '',
    op_sequence: '',
    vendor_id: '',
    process_name: '',
    process_description: '',
    process_specifications: [{ parameter: '', required_value: '' }],
    expected_return_date: '',
    items: [{ 
      item_id: '', 
      dispatched_qty: '', 
      unit: 'Nos', 
      batch_no: '', 
      heat_no: '', 
      dispatched_weight_kg: '' 
    }],
    dispatch_challan_no: '',
    vehicle_no: '',
    transporter_name: '',
    lr_number: '',
    eway_bill_no: '',
    from_warehouse_id: '',
    remarks: ''
  });

  const showError = (message) => {
    setError(message);
    setTimeout(() => {
      setError('');
    }, 5000);
  };

  // Fetch Work Orders
  const fetchWorkOrders = useCallback(async () => {
    try {
      setLoadingWO(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(`${BASE_URL}/api/work-orders?limit=100`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success) {
        setWorkOrders(response.data.data || []);
      }
    } catch (err) {
      console.error('Error fetching work orders:', err);
    } finally {
      setLoadingWO(false);
    }
  }, []);

  // Fetch Vendors
  const fetchVendors = useCallback(async () => {
    try {
      setLoadingVendors(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(`${BASE_URL}/api/vendors?limit=100`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success) {
        setVendors(response.data.data || []);
      }
    } catch (err) {
      console.error('Error fetching vendors:', err);
    } finally {
      setLoadingVendors(false);
    }
  }, []);

  // Fetch Delivery Challans
  const fetchDeliveryChallans = useCallback(async () => {
    try {
      setLoadingDC(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(`${BASE_URL}/api/delivery-challans?limit=100`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success) {
        setDeliveryChallans(response.data.data || []);
      }
    } catch (err) {
      console.error('Error fetching delivery challans:', err);
    } finally {
      setLoadingDC(false);
    }
  }, []);

  // Fetch Warehouses
  const fetchWarehouses = useCallback(async () => {
    try {
      setLoadingWH(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(`${BASE_URL}/api/warehouses?limit=100`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success) {
        setWarehouses(response.data.data || []);
      }
    } catch (err) {
      console.error('Error fetching warehouses:', err);
    } finally {
      setLoadingWH(false);
    }
  }, []);

  // Fetch data when dialog opens
  useEffect(() => {
    if (open) {
      fetchWorkOrders();
      fetchVendors();
      fetchDeliveryChallans();
      fetchWarehouses();
    }
  }, [open, fetchWorkOrders, fetchVendors, fetchDeliveryChallans, fetchWarehouses]);

  // Reset active step when dialog opens/closes
  useEffect(() => {
    if (!open) {
      setActiveStep(0);
    }
  }, [open]);

  // Handle WO selection
  const handleWOChange = (event, newValue) => {
    setSelectedWO(newValue);
    setFormData(prev => ({
      ...prev,
      wo_id: newValue?._id || '',
      op_sequence: '',
      items: [{ 
        item_id: '', 
        dispatched_qty: '', 
        unit: 'Nos', 
        batch_no: '', 
        heat_no: '', 
        dispatched_weight_kg: '' 
      }]
    }));
    setFieldErrors(prev => ({ ...prev, wo_id: '' }));
    
    if (newValue) {
      // Set operations
      setOperations(newValue.operations || []);
      
      // Set items from the work order
      if (newValue.item_id) {
        const itemData = {
          item_id: newValue.item_id._id || newValue.item_id,
          part_no: newValue.part_no || '',
          part_name: newValue.part_name || '',
          planned_qty: newValue.planned_qty || 0,
          unit: newValue.item_id?.unit || 'Nos'
        };
        
        setFormData(prev => ({
          ...prev,
          items: [{
            item_id: itemData.item_id,
            dispatched_qty: itemData.planned_qty,
            unit: itemData.unit,
            batch_no: '',
            heat_no: '',
            dispatched_weight_kg: ''
          }]
        }));
      }
    } else {
      setOperations([]);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setFieldErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleVendorChange = (event, newValue) => {
    setSelectedVendor(newValue);
    setFormData(prev => ({
      ...prev,
      vendor_id: newValue?._id || ''
    }));
    setFieldErrors(prev => ({ ...prev, vendor_id: '' }));
  };

  const handleWarehouseChange = (event, newValue) => {
    setSelectedWarehouse(newValue);
    setFormData(prev => ({
      ...prev,
      from_warehouse_id: newValue?._id || ''
    }));
    setFieldErrors(prev => ({ ...prev, from_warehouse_id: '' }));
  };

  const handleDCChange = (event, newValue) => {
    setFormData(prev => ({
      ...prev,
      dispatch_challan_no: newValue?.dc_number || ''
    }));
    setFieldErrors(prev => ({ ...prev, dispatch_challan_no: '' }));
  };

  const handleSpecChange = (index, field, value) => {
    const specs = [...formData.process_specifications];
    specs[index][field] = value;
    setFormData(prev => ({ ...prev, process_specifications: specs }));
  };

  const addSpecification = () => {
    setFormData(prev => ({
      ...prev,
      process_specifications: [
        ...prev.process_specifications,
        { parameter: '', required_value: '' }
      ]
    }));
  };

  const removeSpecification = (index) => {
    if (formData.process_specifications.length > 1) {
      const specs = formData.process_specifications.filter((_, i) => i !== index);
      setFormData(prev => ({ ...prev, process_specifications: specs }));
    }
  };

  const handleItemChange = (index, field, value) => {
    const items = [...formData.items];
    items[index][field] = value;
    setFormData(prev => ({ ...prev, items }));
  };

  // Validate Step 1
  const validateStep1 = () => {
    const errors = {};
    let isValid = true;
    let errorMessages = [];

    if (!formData.wo_id) {
      errors.wo_id = 'Work Order is required';
      errorMessages.push('Work Order is required');
      isValid = false;
    }
    if (!formData.op_sequence) {
      errors.op_sequence = 'Operation Sequence is required';
      errorMessages.push('Operation Sequence is required');
      isValid = false;
    }
    if (!formData.vendor_id) {
      errors.vendor_id = 'Vendor is required';
      errorMessages.push('Vendor is required');
      isValid = false;
    }
    if (!formData.process_name) {
      errors.process_name = 'Process Name is required';
      errorMessages.push('Process Name is required');
      isValid = false;
    }
    if (!formData.expected_return_date) {
      errors.expected_return_date = 'Expected Return Date is required';
      errorMessages.push('Expected Return Date is required');
      isValid = false;
    }

    // Validate specifications
    formData.process_specifications.forEach((spec, index) => {
      if (!spec.parameter) {
        errors[`spec_${index}_parameter`] = 'Parameter is required';
        errorMessages.push('All specification parameters must be filled');
        isValid = false;
      }
      if (!spec.required_value) {
        errors[`spec_${index}_required_value`] = 'Required value is required';
        errorMessages.push('All specification values must be filled');
        isValid = false;
      }
    });

    setFieldErrors(errors);
    if (!isValid) {
      showError(errorMessages[0]);
    }
    return isValid;
  };

  // Validate Step 2
  const validateStep2 = () => {
    const errors = {};
    let isValid = true;
    let errorMessages = [];

    if (!formData.dispatch_challan_no) {
      errors.dispatch_challan_no = 'Dispatch Challan No is required';
      errorMessages.push('Dispatch Challan No is required');
      isValid = false;
    }
    if (!formData.from_warehouse_id) {
      errors.from_warehouse_id = 'From Warehouse is required';
      errorMessages.push('From Warehouse is required');
      isValid = false;
    }

    // Validate items
    formData.items.forEach((item, index) => {
      if (!item.item_id) {
        errors[`item_${index}_item_id`] = 'Item is required';
        errorMessages.push('All items must be selected');
        isValid = false;
      }
      if (!item.dispatched_qty || item.dispatched_qty <= 0) {
        errors[`item_${index}_dispatched_qty`] = 'Valid quantity is required';
        errorMessages.push('Valid quantity is required for all items');
        isValid = false;
      }
    });

    setFieldErrors(errors);
    if (!isValid) {
      showError(errorMessages[0]);
    }
    return isValid;
  };

  const handleNext = () => {
    if (validateStep1()) {
      setActiveStep(1);
    }
  };

  const handleBack = () => {
    setActiveStep(0);
  };

  const validateForm = () => {
    const step1Valid = validateStep1();
    const step2Valid = validateStep2();
    return step1Valid && step2Valid;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      
      const submitData = {
        wo_id: formData.wo_id,
        op_sequence: parseInt(formData.op_sequence),
        vendor_id: formData.vendor_id,
        process_name: formData.process_name,
        process_description: formData.process_description || '',
        process_specifications: formData.process_specifications.filter(s => s.parameter && s.required_value),
        expected_return_date: new Date(formData.expected_return_date).toISOString(),
        items: formData.items.map(item => ({
          item_id: item.item_id,
          dispatched_qty: parseInt(item.dispatched_qty),
          unit: item.unit || 'Nos',
          batch_no: item.batch_no || '',
          heat_no: item.heat_no || '',
          dispatched_weight_kg: parseFloat(item.dispatched_weight_kg) || 0
        })),
        dispatch_challan_no: formData.dispatch_challan_no,
        vehicle_no: formData.vehicle_no || '',
        transporter_name: formData.transporter_name || '',
        lr_number: formData.lr_number || '',
        eway_bill_no: formData.eway_bill_no || '',
        from_warehouse_id: formData.from_warehouse_id,
        remarks: formData.remarks || ''
      };

      const response = await axios.post(`${BASE_URL}/api/subcontracts`, submitData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        onAdd(response.data.data);
        resetForm();
        onClose();
      } else {
        showError(response.data.message || 'Failed to create subcontract');
      }
    } catch (err) {
      console.error('Error creating subcontract:', err);
      showError(err.response?.data?.message || 'Failed to create subcontract');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      wo_id: '',
      op_sequence: '',
      vendor_id: '',
      process_name: '',
      process_description: '',
      process_specifications: [{ parameter: '', required_value: '' }],
      expected_return_date: '',
      items: [{ 
        item_id: '', 
        dispatched_qty: '', 
        unit: 'Nos', 
        batch_no: '', 
        heat_no: '', 
        dispatched_weight_kg: '' 
      }],
      dispatch_challan_no: '',
      vehicle_no: '',
      transporter_name: '',
      lr_number: '',
      eway_bill_no: '',
      from_warehouse_id: '',
      remarks: ''
    });
    setSelectedWO(null);
    setSelectedVendor(null);
    setSelectedWarehouse(null);
    setOperations([]);
    setFieldErrors({});
    setError('');
    setActiveStep(0);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  // Render Step 1 Content
  const renderStep1Content = () => (
    <Stack spacing={2}>
      {/* Work Order & Operation */}
      <Paper sx={{ p: 2, borderRadius: 1.5, border: `1px solid ${COLORS.border}`, boxShadow: 'none' }}>
        <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color: COLORS.primary, mb: 1.5 }}>
          <AssignmentIcon sx={{ fontSize: '1rem', mr: 0.5, verticalAlign: 'middle' }} />
          Work Order Details
        </Typography>

        <Grid container spacing={1.5}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
              <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary }}>
                WORK ORDER <span style={{ color: '#EF4444' }}>*</span>
              </Typography>
              <Autocomplete
                fullWidth
                options={workOrders}
                getOptionLabel={(option) => `${option.wo_number} - ${option.part_no} (${option.planned_qty} qty)`}
                value={selectedWO}
                onChange={handleWOChange}
                loading={loadingWO}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    size="small"
                    placeholder="Select work order"
                    error={!!fieldErrors.wo_id}
                    helperText={fieldErrors.wo_id}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 1.5,
                        fontSize: '0.75rem',
                        '&:hover fieldset': { borderColor: COLORS.primary },
                        '&.Mui-error fieldset': { borderColor: '#EF4444' }
                      }
                    }}
                  />
                )}
              />
            </Box>
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
              <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary }}>
                OPERATION SEQUENCE <span style={{ color: '#EF4444' }}>*</span>
              </Typography>
              <FormControl fullWidth size="small" error={!!fieldErrors.op_sequence}>
                <Select
                  name="op_sequence"
                  value={formData.op_sequence}
                  onChange={handleChange}
                  displayEmpty
                  disabled={!selectedWO || operations.length === 0}
                  sx={{
                    borderRadius: 1.5,
                    fontSize: '0.75rem',
                    '& .MuiSelect-select': { py: 1, px: 1.5 },
                    '&.Mui-error': { borderColor: '#EF4444' }
                  }}
                >
                  <MenuItem value="" disabled sx={{ fontSize: '0.75rem' }}>
                    {!selectedWO ? 'Select work order first' : 'Select operation'}
                  </MenuItem>
                  {operations.map((op) => (
                    <MenuItem key={op.op_sequence} value={op.op_sequence} sx={{ fontSize: '0.75rem' }}>
                      {op.op_sequence} - {op.operation_name}
                    </MenuItem>
                  ))}
                </Select>
                {fieldErrors.op_sequence && (
                  <Typography variant="caption" color="error" sx={{ mt: 0.5, fontSize: '0.7rem' }}>
                    {fieldErrors.op_sequence}
                  </Typography>
                )}
              </FormControl>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Vendor & Process */}
      <Paper sx={{ p: 2, borderRadius: 1.5, border: `1px solid ${COLORS.border}`, boxShadow: 'none' }}>
        <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color: COLORS.primary, mb: 1.5 }}>
          <ProcessIcon sx={{ fontSize: '1rem', mr: 0.5, verticalAlign: 'middle' }} />
          Process Details
        </Typography>

        <Grid container spacing={1.5}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
              <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary }}>
                VENDOR <span style={{ color: '#EF4444' }}>*</span>
              </Typography>
              <Autocomplete
                fullWidth
                options={vendors}
                getOptionLabel={(option) => `${option.vendor_name} - ${option.vendor_code}`}
                value={selectedVendor}
                onChange={handleVendorChange}
                loading={loadingVendors}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    size="small"
                    placeholder="Select vendor"
                    error={!!fieldErrors.vendor_id}
                    helperText={fieldErrors.vendor_id}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 1.5,
                        fontSize: '0.75rem',
                        '&:hover fieldset': { borderColor: COLORS.primary },
                        '&.Mui-error fieldset': { borderColor: '#EF4444' }
                      }
                    }}
                  />
                )}
              />
            </Box>
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
              <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary }}>
                PROCESS NAME <span style={{ color: '#EF4444' }}>*</span>
              </Typography>
              <TextField
                fullWidth
                size="small"
                name="process_name"
                value={formData.process_name}
                onChange={handleChange}
                placeholder="e.g., Plating – Nickel"
                error={!!fieldErrors.process_name}
                helperText={fieldErrors.process_name}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 1.5,
                    fontSize: '0.75rem',
                    '&:hover fieldset': { borderColor: COLORS.primary },
                    '&.Mui-error fieldset': { borderColor: '#EF4444' }
                  },
                  '& .MuiInputBase-input': { py: 1, px: 1.5, fontSize: '0.75rem' }
                }}
              />
            </Box>
          </Grid>

          <Grid size={{ xs: 12 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
              <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary }}>
                PROCESS DESCRIPTION
              </Typography>
              <TextField
                fullWidth
                size="small"
                multiline
                rows={2}
                name="process_description"
                value={formData.process_description}
                onChange={handleChange}
                placeholder="Describe the process..."
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 1.5,
                    fontSize: '0.75rem',
                    '&:hover fieldset': { borderColor: COLORS.primary }
                  },
                  '& .MuiInputBase-input': { py: 1, px: 1.5, fontSize: '0.75rem' }
                }}
              />
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Process Specifications */}
      <Paper sx={{ p: 2, borderRadius: 1.5, border: `1px solid ${COLORS.border}`, boxShadow: 'none' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
          <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color: COLORS.primary }}>
            <SettingsIcon sx={{ fontSize: '1rem', mr: 0.5, verticalAlign: 'middle' }} />
            Process Specifications
          </Typography>
          <Button
            size="small"
            startIcon={<AddIcon sx={{ fontSize: '0.8rem' }} />}
            onClick={addSpecification}
            sx={{
              textTransform: 'none',
              fontSize: '0.7rem',
              color: COLORS.primary,
              '&:hover': { bgcolor: COLORS.primaryLight }
            }}
          >
            Add
          </Button>
        </Box>

        {formData.process_specifications.map((spec, index) => (
          <Box key={index} sx={{ display: 'flex', gap: 1, mb: 1 }}>
            <TextField
              size="small"
              placeholder="Parameter *"
              value={spec.parameter}
              onChange={(e) => handleSpecChange(index, 'parameter', e.target.value)}
              error={!!fieldErrors[`spec_${index}_parameter`]}
              sx={{
                flex: 1,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 1.5,
                  fontSize: '0.75rem',
                  '&:hover fieldset': { borderColor: COLORS.primary },
                  '&.Mui-error fieldset': { borderColor: '#EF4444' }
                },
                '& .MuiInputBase-input': { py: 1, px: 1.5, fontSize: '0.75rem' }
              }}
            />
            <TextField
              size="small"
              placeholder="Required Value *"
              value={spec.required_value}
              onChange={(e) => handleSpecChange(index, 'required_value', e.target.value)}
              error={!!fieldErrors[`spec_${index}_required_value`]}
              sx={{
                flex: 1,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 1.5,
                  fontSize: '0.75rem',
                  '&:hover fieldset': { borderColor: COLORS.primary },
                  '&.Mui-error fieldset': { borderColor: '#EF4444' }
                },
                '& .MuiInputBase-input': { py: 1, px: 1.5, fontSize: '0.75rem' }
              }}
            />
            <IconButton 
              size="small" 
              onClick={() => removeSpecification(index)}
              disabled={formData.process_specifications.length === 1}
              sx={{ 
                color: '#DC2626',
                '&:hover': { bgcolor: '#FEE2E2' },
                '&.Mui-disabled': { opacity: 0.3 }
              }}
            >
              <CloseIcon sx={{ fontSize: '0.8rem' }} />
            </IconButton>
          </Box>
        ))}
      </Paper>

      {/* Expected Return Date */}
      <Paper sx={{ p: 2, borderRadius: 1.5, border: `1px solid ${COLORS.border}`, boxShadow: 'none' }}>
        <Grid container spacing={1.5}>
          <Grid size={{ xs: 12 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
              <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary }}>
                <CalendarIcon sx={{ fontSize: '0.8rem', mr: 0.5, verticalAlign: 'middle' }} />
                EXPECTED RETURN DATE <span style={{ color: '#EF4444' }}>*</span>
              </Typography>
              <TextField
                fullWidth
                type="date"
                size="small"
                name="expected_return_date"
                value={formData.expected_return_date}
                onChange={handleChange}
                error={!!fieldErrors.expected_return_date}
                helperText={fieldErrors.expected_return_date}
                InputLabelProps={{ shrink: true }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 1.5,
                    fontSize: '0.75rem',
                    '&:hover fieldset': { borderColor: COLORS.primary },
                    '&.Mui-error fieldset': { borderColor: '#EF4444' }
                  },
                  '& .MuiInputBase-input': { py: 1, px: 1.5, fontSize: '0.75rem' }
                }}
              />
            </Box>
          </Grid>
        </Grid>
      </Paper>
    </Stack>
  );

  // Render Step 2 Content
  const renderStep2Content = () => (
    <Stack spacing={2}>
      {/* Dispatch & Warehouse */}
      <Paper sx={{ p: 2, borderRadius: 1.5, border: `1px solid ${COLORS.border}`, boxShadow: 'none' }}>
        <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color: COLORS.primary, mb: 1.5 }}>
          <DispatchIcon sx={{ fontSize: '1rem', mr: 0.5, verticalAlign: 'middle' }} />
          Dispatch Details
        </Typography>

        <Grid container spacing={1.5}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
              <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary }}>
                DISPATCH CHALLAN NO <span style={{ color: '#EF4444' }}>*</span>
              </Typography>
              <Autocomplete
                fullWidth
                options={deliveryChallans}
                getOptionLabel={(option) => `${option.dc_number} - ${option.customer_name}`}
                value={deliveryChallans.find(dc => dc.dc_number === formData.dispatch_challan_no) || null}
                onChange={handleDCChange}
                loading={loadingDC}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    size="small"
                    placeholder="Select dispatch challan"
                    error={!!fieldErrors.dispatch_challan_no}
                    helperText={fieldErrors.dispatch_challan_no}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 1.5,
                        fontSize: '0.75rem',
                        '&:hover fieldset': { borderColor: COLORS.primary },
                        '&.Mui-error fieldset': { borderColor: '#EF4444' }
                      }
                    }}
                  />
                )}
              />
            </Box>
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
              <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary }}>
                <WarehouseIcon sx={{ fontSize: '0.8rem', mr: 0.5, verticalAlign: 'middle' }} />
                FROM WAREHOUSE <span style={{ color: '#EF4444' }}>*</span>
              </Typography>
              <Autocomplete
                fullWidth
                options={warehouses}
                getOptionLabel={(option) => `${option.warehouse_name} (${option.warehouse_id})`}
                value={selectedWarehouse}
                onChange={handleWarehouseChange}
                loading={loadingWH}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    size="small"
                    placeholder="Select warehouse"
                    error={!!fieldErrors.from_warehouse_id}
                    helperText={fieldErrors.from_warehouse_id}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 1.5,
                        fontSize: '0.75rem',
                        '&:hover fieldset': { borderColor: COLORS.primary },
                        '&.Mui-error fieldset': { borderColor: '#EF4444' }
                      }
                    }}
                  />
                )}
              />
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Transport Details */}
      <Paper sx={{ p: 2, borderRadius: 1.5, border: `1px solid ${COLORS.border}`, boxShadow: 'none' }}>
        <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color: COLORS.primary, mb: 1.5 }}>
          Transport Details
        </Typography>

        <Grid container spacing={1.5}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
              <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary }}>
                VEHICLE NO
              </Typography>
              <TextField
                fullWidth
                size="small"
                name="vehicle_no"
                value={formData.vehicle_no}
                onChange={handleChange}
                placeholder="e.g., MH-12-AB-1234"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 1.5,
                    fontSize: '0.75rem',
                    '&:hover fieldset': { borderColor: COLORS.primary }
                  },
                  '& .MuiInputBase-input': { py: 1, px: 1.5, fontSize: '0.75rem' }
                }}
              />
            </Box>
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
              <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary }}>
                TRANSPORTER NAME
              </Typography>
              <TextField
                fullWidth
                size="small"
                name="transporter_name"
                value={formData.transporter_name}
                onChange={handleChange}
                placeholder="Enter transporter name"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 1.5,
                    fontSize: '0.75rem',
                    '&:hover fieldset': { borderColor: COLORS.primary }
                  },
                  '& .MuiInputBase-input': { py: 1, px: 1.5, fontSize: '0.75rem' }
                }}
              />
            </Box>
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
              <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary }}>
                LR NUMBER
              </Typography>
              <TextField
                fullWidth
                size="small"
                name="lr_number"
                value={formData.lr_number}
                onChange={handleChange}
                placeholder="Enter LR number"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 1.5,
                    fontSize: '0.75rem',
                    '&:hover fieldset': { borderColor: COLORS.primary }
                  },
                  '& .MuiInputBase-input': { py: 1, px: 1.5, fontSize: '0.75rem' }
                }}
              />
            </Box>
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
              <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary }}>
                E-WAY BILL NO
              </Typography>
              <TextField
                fullWidth
                size="small"
                name="eway_bill_no"
                value={formData.eway_bill_no}
                onChange={handleChange}
                placeholder="Enter e-way bill number"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 1.5,
                    fontSize: '0.75rem',
                    '&:hover fieldset': { borderColor: COLORS.primary }
                  },
                  '& .MuiInputBase-input': { py: 1, px: 1.5, fontSize: '0.75rem' }
                }}
              />
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Items */}
      <Paper sx={{ p: 2, borderRadius: 1.5, border: `1px solid ${COLORS.border}`, boxShadow: 'none' }}>
        <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color: COLORS.primary, mb: 1.5 }}>
          Items
        </Typography>

        {formData.items.map((item, index) => {
          const woItem = selectedWO?.item_id;
          const itemDetails = woItem && typeof woItem === 'object' ? woItem : { part_no: '', part_description: '' };
          
          return (
            <Box key={index} sx={{ mb: 2 }}>
              <Grid container spacing={1.5}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                    <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary }}>
                      ITEM
                    </Typography>
                    <TextField
                      fullWidth
                      size="small"
                      value={itemDetails.part_no || 'Select work order first'}
                      disabled
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 1.5,
                          fontSize: '0.75rem',
                          bgcolor: COLORS.background.light
                        },
                        '& .MuiInputBase-input': { py: 1, px: 1.5, fontSize: '0.75rem' }
                      }}
                    />
                  </Box>
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                    <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary }}>
                      DESCRIPTION
                    </Typography>
                    <TextField
                      fullWidth
                      size="small"
                      value={itemDetails.part_description || '-'}
                      disabled
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 1.5,
                          fontSize: '0.75rem',
                          bgcolor: COLORS.background.light
                        },
                        '& .MuiInputBase-input': { py: 1, px: 1.5, fontSize: '0.75rem' }
                      }}
                    />
                  </Box>
                </Grid>

                <Grid size={{ xs: 12, sm: 4 }}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                    <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary }}>
                      DISPATCHED QTY <span style={{ color: '#EF4444' }}>*</span>
                    </Typography>
                    <TextField
                      fullWidth
                      type="number"
                      size="small"
                      value={item.dispatched_qty}
                      onChange={(e) => handleItemChange(index, 'dispatched_qty', e.target.value)}
                      error={!!fieldErrors[`item_${index}_dispatched_qty`]}
                      helperText={fieldErrors[`item_${index}_dispatched_qty`]}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 1.5,
                          fontSize: '0.75rem',
                          '&:hover fieldset': { borderColor: COLORS.primary },
                          '&.Mui-error fieldset': { borderColor: '#EF4444' }
                        },
                        '& .MuiInputBase-input': { py: 1, px: 1.5, fontSize: '0.75rem' }
                      }}
                    />
                  </Box>
                </Grid>

                <Grid size={{ xs: 12, sm: 4 }}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                    <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary }}>
                      UNIT
                    </Typography>
                    <TextField
                      fullWidth
                      size="small"
                      value={item.unit || 'Nos'}
                      disabled
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 1.5,
                          fontSize: '0.75rem',
                          bgcolor: COLORS.background.light
                        },
                        '& .MuiInputBase-input': { py: 1, px: 1.5, fontSize: '0.75rem' }
                      }}
                    />
                  </Box>
                </Grid>

                <Grid size={{ xs: 12, sm: 4 }}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                    <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary }}>
                      WEIGHT (KG)
                    </Typography>
                    <TextField
                      fullWidth
                      type="number"
                      size="small"
                      value={item.dispatched_weight_kg}
                      onChange={(e) => handleItemChange(index, 'dispatched_weight_kg', e.target.value)}
                      placeholder="0.00"
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 1.5,
                          fontSize: '0.75rem',
                          '&:hover fieldset': { borderColor: COLORS.primary }
                        },
                        '& .MuiInputBase-input': { py: 1, px: 1.5, fontSize: '0.75rem' }
                      }}
                    />
                  </Box>
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                    <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary }}>
                      BATCH NO
                    </Typography>
                    <TextField
                      fullWidth
                      size="small"
                      value={item.batch_no}
                      onChange={(e) => handleItemChange(index, 'batch_no', e.target.value)}
                      placeholder="Enter batch number"
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 1.5,
                          fontSize: '0.75rem',
                          '&:hover fieldset': { borderColor: COLORS.primary }
                        },
                        '& .MuiInputBase-input': { py: 1, px: 1.5, fontSize: '0.75rem' }
                      }}
                    />
                  </Box>
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                    <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary }}>
                      HEAT NO
                    </Typography>
                    <TextField
                      fullWidth
                      size="small"
                      value={item.heat_no}
                      onChange={(e) => handleItemChange(index, 'heat_no', e.target.value)}
                      placeholder="Enter heat number"
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 1.5,
                          fontSize: '0.75rem',
                          '&:hover fieldset': { borderColor: COLORS.primary }
                        },
                        '& .MuiInputBase-input': { py: 1, px: 1.5, fontSize: '0.75rem' }
                      }}
                    />
                  </Box>
                </Grid>
              </Grid>
              {index < formData.items.length - 1 && <Divider sx={{ my: 2 }} />}
            </Box>
          );
        })}
      </Paper>

      {/* Remarks */}
      <Paper sx={{ p: 2, borderRadius: 1.5, border: `1px solid ${COLORS.border}`, boxShadow: 'none' }}>
        <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color: COLORS.primary, mb: 1.5 }}>
          <DescriptionIcon sx={{ fontSize: '1rem', mr: 0.5, verticalAlign: 'middle' }} />
          Remarks
        </Typography>

        <Grid container spacing={1.5}>
          <Grid size={{ xs: 12 }}>
            <TextField
              fullWidth
              size="small"
              multiline
              rows={2}
              name="remarks"
              value={formData.remarks}
              onChange={handleChange}
              placeholder="Enter any additional remarks..."
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 1.5,
                  fontSize: '0.75rem',
                  '&:hover fieldset': { borderColor: COLORS.primary }
                },
                '& .MuiInputBase-input': { py: 1, px: 1.5, fontSize: '0.75rem' }
              }}
            />
          </Grid>
        </Grid>
      </Paper>
    </Stack>
  );

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
          overflow: 'hidden'
        }
      }}
    >
      <DialogTitle sx={{
        borderBottom: `1px solid ${COLORS.border}`,
        py: 1.5,
        px: 2.5,
        mb: 0,
        bgcolor: COLORS.background.white
      }}>
        <Typography sx={{ fontSize: '1.2rem', fontWeight: 700, color: COLORS.text.primary }}>
          Create New Subcontract
        </Typography>
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

      <DialogContent sx={{ p: 2.5, pt: error ? 1 : 2 }}>
        {activeStep === 0 ? renderStep1Content() : renderStep2Content()}
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
              {loading ? 'Creating...' : 'Create Subcontract'}
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

export default AddSubcontract;