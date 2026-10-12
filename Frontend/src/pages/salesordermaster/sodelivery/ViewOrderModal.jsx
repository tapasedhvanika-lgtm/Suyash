import React, { useState } from 'react';
import {
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Paper,
  Stack,
  Typography,
  Chip,
  IconButton,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Divider,
  Stepper,
  Step,
  StepLabel,
  StepConnector,
  stepConnectorClasses,
  styled,
  TextField,
  Alert,
  Snackbar
} from '@mui/material';
import {
  Close as CloseIcon,
  NavigateNext as NavigateNextIcon,
  NavigateBefore as NavigateBeforeIcon,
  Receipt as ReceiptIcon,
  Description as DescriptionIcon,
  Inventory as InventoryIcon,
  Business as BusinessIcon,
  MonetizationOn as MoneyIcon,
  AccessTime as AccessTimeIcon,
  LocalShipping as ShippingIcon
} from '@mui/icons-material';
import axios from 'axios';
import BASE_URL from '../../../config/Config';
import { hasPermission, ACTIONS, MODULES, PAGES } from '../../../utils/modulePermissions';

// Professional Color Scheme (consistent with other components)
const COLORS = {
  primary: '#063C3F',
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
    hover: '#F0FDF9',
    tableHeader: '#063C3F'
  },
  border: '#E3E8EF'
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

// Custom Step Icon styling
const CustomStepIconRoot = styled('div')(({ theme, ownerState }) => ({
  backgroundColor: ownerState.active || ownerState.completed ? COLORS.primary : '#ccc',
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
    backgroundColor: COLORS.primary,
    boxShadow: '0 4px 10px 0 rgba(6,60,63,0.3)',
  }),
  ...(ownerState.completed && {
    backgroundColor: COLORS.primary,
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

const steps = ['Overview', 'Items', 'History'];

const ViewOrderModal = ({ open, onClose, order, permissions = [], isSuperAdmin = false, onDispatchSuccess }) => {
  const [activeStep, setActiveStep] = useState(0);
  const [dispatchQuantities, setDispatchQuantities] = useState({}); // { lineItemId: qty }
  const [dispatchLoading, setDispatchLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  if (!order) return null;

  // Check permission for dispatching
  const canDispatch = isSuperAdmin || hasPermission(permissions, MODULES.ORDER_BOOK, PAGES.ORDER_BOOK, ACTIONS.UPDATE);

  const formatCurrency = (amount, currency = 'INR') => {
    if (!amount && amount !== 0) return '-';
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2
    }).format(amount || 0);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const statusColors = {
    'confirmed': { bg: '#D1FAE5', color: '#059669' },
    'draft': { bg: '#F1F5F9', color: '#475569' },
    'cancelled': { bg: '#FEE2E2', color: '#DC2626' },
    'pending': { bg: '#FEF3C7', color: '#D97706' },
    'completed': { bg: '#DBEAFE', color: '#1E40AF' }
  }[order.status?.toLowerCase()] || { bg: '#F1F5F9', color: '#475569' };

  const handleNext = () => {
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handleDispatchQtyChange = (lineItemId, value) => {
    setDispatchQuantities(prev => ({
      ...prev,
      [lineItemId]: value
    }));
  };

  const handleDispatch = async () => {
    // Build payload
    const itemsToDispatch = [];
    let hasError = false;

    order.items.forEach(item => {
      const qty = Number(dispatchQuantities[item._id] || 0);
      if (qty > 0) {
        if (qty > (item.ordered_qty - item.delivered_qty)) {
          showNotification(`Dispatch quantity for ${item.part_no} cannot exceed pending quantity (${item.ordered_qty - item.delivered_qty})`, 'error');
          hasError = true;
          return;
        }
        itemsToDispatch.push({
          lineItemId: item._id,
          dispatchedQty: qty,
          dispatchDate: new Date().toISOString()
        });
      }
    });

    if (hasError) return;

    if (itemsToDispatch.length === 0) {
      showNotification('Please enter a dispatch quantity for at least one item.', 'warning');
      return;
    }

    setDispatchLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${BASE_URL}/api/sales-orders/${order._id}/dispatch`,
        { items: itemsToDispatch },
        { headers: { 'Authorization': `Bearer ${token}` } }
      );

      if (response.data.success) {
        showNotification('Items dispatched successfully! Order status updated.', 'success');
        setDispatchQuantities({});
        if (onDispatchSuccess) onDispatchSuccess();
        setTimeout(() => onClose(), 1500); // Close modal after showing success
      } else {
        showNotification(response.data.message || 'Failed to dispatch items', 'error');
      }
    } catch (err) {
      console.error('Dispatch error:', err);
      showNotification(err.response?.data?.message || 'Failed to dispatch items', 'error');
    } finally {
      setDispatchLoading(false);
    }
  };

  const showNotification = (message, severity) => {
    setSnackbar({ open: true, message, severity });
  };

  // Helper function to render field
  const renderField = (label, value, monospace = false, highlight = false) => (
    <Box>
      <Typography sx={{ fontSize: '0.7rem', color: COLORS.text.secondary, mb: 0.5 }}>
        {label}
      </Typography>
      <Typography sx={{ 
        fontSize: '0.8rem', 
        fontWeight: highlight ? 700 : 500, 
        color: highlight ? COLORS.primary : COLORS.text.primary,
        fontFamily: monospace ? 'monospace' : 'inherit',
        wordBreak: 'break-word'
      }}>
        {value || '-'}
      </Typography>
    </Box>
  );

  const renderStepContent = (step) => {
    switch (step) {
      case 0: // Overview
        return (
          <Stack spacing={2}>
            {/* Header Section - Order Overview */}
            <Paper sx={{ 
              p: 2, 
              bgcolor: COLORS.background.light, 
              borderRadius: 1.5, 
              border: `1px solid ${COLORS.border}` 
            }}>
              <Typography sx={{ 
                fontSize: '0.8rem', 
                fontWeight: 600, 
                color: COLORS.primary, 
                mb: 1.5 
              }}>
                <ReceiptIcon sx={{ fontSize: '1rem', mr: 0.5, verticalAlign: 'middle' }} />
                Order Overview
              </Typography>
              
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.5 }}>
                <Box>
                  <Typography sx={{ fontSize: '1rem', fontWeight: 700, color: COLORS.text.primary }}>
                    {order.so_number}
                  </Typography>
                  <Typography sx={{ fontSize: '0.7rem', color: COLORS.text.secondary, mt: 0.5 }}>
                    {order.customer_name}
                  </Typography>
                </Box>
                <Chip
                  label={order.status}
                  size="small"
                  sx={{ 
                    fontSize: '0.7rem', 
                    fontWeight: 500,
                    bgcolor: statusColors.bg, 
                    color: statusColors.color
                  }}
                />
              </Stack>
              
              <Divider sx={{ my: 1.5 }} />
              
              <Grid container spacing={1.5}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  {renderField('SO Date', formatDate(order.so_date))}
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  {renderField('Currency', order.currency)}
                </Grid>
              </Grid>
            </Paper>

            {/* Customer Information */}
            <Paper sx={{ 
              p: 2, 
              borderRadius: 1.5, 
              border: `1px solid ${COLORS.border}`,
              bgcolor: COLORS.background.white
            }}>
              <Typography sx={{ 
                fontSize: '0.8rem', 
                fontWeight: 600, 
                color: COLORS.primary, 
                mb: 1.5 
              }}>
                <BusinessIcon sx={{ fontSize: '1rem', mr: 0.5, verticalAlign: 'middle' }} />
                Customer Information
              </Typography>
              
              <Grid container spacing={1.5}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  {renderField('Customer Name', order.customer_name, false, true)}
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  {renderField('GSTIN', order.customer_gstin, true)}
                </Grid>
                <Grid size={{ xs: 12 }}>
                  {renderField('Billing Address', 
                    `${order.billing_address?.line1 || ''} ${order.billing_address?.line2 || ''}, ${order.billing_address?.city || ''}, ${order.billing_address?.state || ''} - ${order.billing_address?.pincode || ''}`
                  )}
                </Grid>
              </Grid>
            </Paper>

            {/* Order Information */}
            <Paper sx={{ 
              p: 2, 
              borderRadius: 1.5, 
              border: `1px solid ${COLORS.border}`,
              bgcolor: COLORS.background.white
            }}>
              <Typography sx={{ 
                fontSize: '0.8rem', 
                fontWeight: 600, 
                color: COLORS.primary, 
                mb: 1.5 
              }}>
                <DescriptionIcon sx={{ fontSize: '1rem', mr: 0.5, verticalAlign: 'middle' }} />
                Order Information
              </Typography>
              
              <Grid container spacing={1.5}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  {renderField('Quotation Number', order.quotation_no)}
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  {renderField('PO Number', order.customer_po_number)}
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  {renderField('PO Date', formatDate(order.customer_po_date))}
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  {renderField('GST Type', order.gst_type)}
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  {renderField('Delivery Terms', order.delivery_terms)}
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  {renderField('Delivery Mode', order.delivery_mode)}
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  {renderField('Expected Delivery', formatDate(order.expected_delivery_date))}
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  {renderField('Payment Terms', order.payment_terms)}
                </Grid>
              </Grid>
            </Paper>

            {/* Financial Summary */}
            <Paper sx={{ 
              p: 2, 
              borderRadius: 1.5, 
              border: `1px solid ${COLORS.border}`,
              bgcolor: COLORS.background.white
            }}>
              <Typography sx={{ 
                fontSize: '0.8rem', 
                fontWeight: 600, 
                color: COLORS.primary, 
                mb: 1.5 
              }}>
                <MoneyIcon sx={{ fontSize: '1rem', mr: 0.5, verticalAlign: 'middle' }} />
                Financial Summary
              </Typography>
              
              <Grid container spacing={1.5}>
                <Grid size={{ xs: 6, sm: 3 }}>
                  {renderField('Sub Total', formatCurrency(order.sub_total, order.currency))}
                </Grid>
                <Grid size={{ xs: 6, sm: 3 }}>
                  {renderField('Discount', formatCurrency(order.discount_total, order.currency))}
                </Grid>
                <Grid size={{ xs: 6, sm: 3 }}>
                  {renderField('GST Total', formatCurrency(order.gst_total, order.currency))}
                </Grid>
                <Grid size={{ xs: 6, sm: 3 }}>
                  {renderField('Grand Total', formatCurrency(order.grand_total, order.currency), false, true)}
                </Grid>
              </Grid>
            </Paper>
          </Stack>
        );

      case 1: // Items
        return (
          <Stack spacing={2}>
            <Paper sx={{ 
              p: 2, 
              borderRadius: 1.5, 
              border: `1px solid ${COLORS.border}`,
              bgcolor: COLORS.background.white
            }}>
              <Typography sx={{ 
                fontSize: '0.8rem', 
                fontWeight: 600, 
                color: COLORS.primary, 
                mb: 1.5 
              }}>
                <InventoryIcon sx={{ fontSize: '1rem', mr: 0.5, verticalAlign: 'middle' }} />
                Order Items ({order.items?.length || 0})
              </Typography>
              
              <TableContainer component={Paper} sx={{ borderRadius: 1.5, border: `1px solid ${COLORS.border}` }}>
                <Table size="small">
                  <TableHead sx={{ bgcolor: COLORS.background.tableHeader }}>
                    <TableRow>
                      <TableCell sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.light }}>Part No.</TableCell>
                      <TableCell sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.light }}>Part Name</TableCell>
                      <TableCell sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.light }} align="right">Ordered</TableCell>
                      <TableCell sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.light }} align="right">Delivered</TableCell>
                      <TableCell sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.light }} align="right">Pending</TableCell>
                      <TableCell sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.light }} align="right">Unit Price</TableCell>
                      <TableCell sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.light }} align="right">Total</TableCell>
                      {canDispatch && (
                        <TableCell sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.light, width: 120 }} align="center">
                          Dispatch Qty
                        </TableCell>
                      )}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {order.items?.map((item, idx) => {
                      const pending = item.ordered_qty - (item.delivered_qty || 0);
                      return (
                        <TableRow key={idx} hover>
                          <TableCell sx={{ fontSize: '0.75rem', fontWeight: 600 }}>{item.part_no}</TableCell>
                          <TableCell sx={{ fontSize: '0.75rem' }}>{item.part_name}</TableCell>
                          <TableCell sx={{ fontSize: '0.75rem', textAlign: 'right' }}>{item.ordered_qty}</TableCell>
                          <TableCell sx={{ fontSize: '0.75rem', textAlign: 'right', color: COLORS.text.secondary }}>{item.delivered_qty || 0}</TableCell>
                          <TableCell sx={{ fontSize: '0.75rem', textAlign: 'right', fontWeight: 600, color: pending > 0 ? '#D97706' : '#059669' }}>
                            {pending}
                          </TableCell>
                          <TableCell sx={{ fontSize: '0.75rem', textAlign: 'right' }}>{formatCurrency(item.unit_price, order.currency)}</TableCell>
                          <TableCell sx={{ fontSize: '0.75rem', textAlign: 'right', fontWeight: 600 }}>{formatCurrency(item.total_amount, order.currency)}</TableCell>
                          
                          {canDispatch && (
                            <TableCell align="center" sx={{ py: 1 }}>
                              {pending > 0 ? (
                                <TextField
                                  type="number"
                                  size="small"
                                  placeholder="0"
                                  value={dispatchQuantities[item._id] || ''}
                                  onChange={(e) => handleDispatchQtyChange(item._id, e.target.value)}
                                  inputProps={{ min: 0, max: pending, style: { fontSize: '0.75rem', textAlign: 'center', padding: '4px 8px' } }}
                                  sx={{ width: 80 }}
                                  disabled={dispatchLoading}
                                />
                              ) : (
                                <Chip label="Delivered" size="small" sx={{ fontSize: '0.6rem', bgcolor: '#D1FAE5', color: '#059669' }} />
                              )}
                            </TableCell>
                          )}
                        </TableRow>
                      );
                    })}
                    {(!order.items || order.items.length === 0) && (
                      <TableRow>
                        <TableCell colSpan={canDispatch ? 8 : 7} align="center" sx={{ fontSize: '0.75rem', color: COLORS.text.tertiary }}>
                          No items found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Stack>
        );

      case 2: // History
        return (
          <Stack spacing={2}>
            <Paper sx={{ 
              p: 2, 
              borderRadius: 1.5, 
              border: `1px solid ${COLORS.border}`,
              bgcolor: COLORS.background.white
            }}>
              <Typography sx={{ 
                fontSize: '0.8rem', 
                fontWeight: 600, 
                color: COLORS.primary, 
                mb: 1.5 
              }}>
                <AccessTimeIcon sx={{ fontSize: '1rem', mr: 0.5, verticalAlign: 'middle' }} />
                Activity Log
              </Typography>
              
              <TableContainer component={Paper} sx={{ borderRadius: 1.5, border: `1px solid ${COLORS.border}` }}>
                <Table size="small">
                  <TableHead sx={{ bgcolor: COLORS.background.tableHeader }}>
                    <TableRow>
                      <TableCell sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.light }}>Date & Time</TableCell>
                      <TableCell sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.light }}>Action</TableCell>
                      <TableCell sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.light }}>Notes</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {order.audit_log?.map((log, idx) => (
                      <TableRow key={idx} hover>
                        <TableCell sx={{ fontSize: '0.7rem' }}>{formatDateTime(log.changed_at)}</TableCell>
                        <TableCell>
                          <Chip 
                            label={log.action} 
                            size="small" 
                            sx={{ 
                              fontSize: '0.6rem', 
                              height: 22,
                              bgcolor: COLORS.background.light,
                              color: COLORS.primary
                            }} 
                          />
                        </TableCell>
                        <TableCell sx={{ fontSize: '0.7rem' }}>{log.notes || '-'}</TableCell>
                      </TableRow>
                    ))}
                    {(!order.audit_log || order.audit_log.length === 0) && (
                      <TableRow>
                        <TableCell colSpan={3} align="center" sx={{ fontSize: '0.75rem', color: COLORS.text.tertiary }}>
                          No activity logs found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>

            {/* System Information */}
            <Paper sx={{ 
              p: 2, 
              borderRadius: 1.5, 
              border: `1px solid ${COLORS.border}`,
              bgcolor: COLORS.background.white
            }}>
              <Typography sx={{ 
                fontSize: '0.8rem', 
                fontWeight: 600, 
                color: COLORS.primary, 
                mb: 1.5 
              }}>
                <AccessTimeIcon sx={{ fontSize: '1rem', mr: 0.5, verticalAlign: 'middle' }} />
                System Information
              </Typography>
              
              <Grid container spacing={1.5}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  {renderField('Created At', formatDateTime(order.createdAt))}
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  {renderField('Last Updated', formatDateTime(order.updatedAt))}
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
    <>
      <Dialog
        open={open}
        onClose={onClose}
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
          bgcolor: COLORS.background.tableHeader,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <Typography sx={{ fontSize: '1.2rem', fontWeight: 700, color: COLORS.text.light }}>
            Order Details
          </Typography>
          <IconButton onClick={onClose} size="small" sx={{ color: COLORS.text.light }}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </DialogTitle>
        
        {/* Stepper */}
        <Box sx={{ px: 2.5, pt: 2, bgcolor: COLORS.background.white }}>
          <Stepper
            activeStep={activeStep}
            alternativeLabel
            connector={<ColorConnector />}
          >
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel StepIconComponent={CustomStepIcon}>
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
            disabled={activeStep === 0 || dispatchLoading}
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
              onClick={onClose}
              size="small"
              disabled={dispatchLoading}
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
              Close
            </Button>
            
            {/* Show Dispatch button only on Items step, if user has permission, and order is dispatchable */}
            {activeStep === 1 && canDispatch && (
              <Button
                variant="contained"
                onClick={handleDispatch}
                disabled={dispatchLoading || Object.keys(dispatchQuantities).length === 0}
                startIcon={<ShippingIcon sx={{ fontSize: '1rem' }} />}
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
                {dispatchLoading ? 'Dispatching...' : 'Dispatch Items'}
              </Button>
            )}

            {activeStep === steps.length - 1 ? (
              <Button
                variant="contained"
                onClick={onClose}
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
                Done
              </Button>
            ) : (
              activeStep !== 1 && (
                <Button
                  variant="contained"
                  onClick={handleNext}
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
              )
            )}
          </Box>
        </DialogActions>
      </Dialog>

      {/* Snackbar Notification */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={() => setSnackbar({ ...snackbar, open: false })} 
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: '100%', borderRadius: 1.5, fontSize: '0.75rem' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default ViewOrderModal;