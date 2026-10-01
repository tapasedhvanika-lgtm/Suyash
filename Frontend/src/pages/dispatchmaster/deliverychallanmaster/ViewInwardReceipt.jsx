// ViewInwardReceipt.js
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  Button,
  IconButton,
  Stack,
  Chip,
  Paper,
  Grid,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Alert,
  Collapse
} from '@mui/material';
import {
  Close as CloseIcon,
  LocalShipping as LocalShippingIcon,
  Receipt as ReceiptIcon,
  Inventory as InventoryIcon,
  Business as BusinessIcon,
  CalendarToday as CalendarIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  FilePresent as FilePresentIcon
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
    light: '#F8FFFC',
    hover: '#F0FDF9'
  },
  border: '#E3E8EF'
};

const ViewInwardReceipt = ({ open, onClose, receiptId }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [receiptData, setReceiptData] = useState(null);

  useEffect(() => {
    if (open && receiptId) {
      fetchReceiptDetails();
    }
  }, [open, receiptId]);

  const fetchReceiptDetails = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${BASE_URL}/api/inward-receipts/${receiptId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.data.success) {
        setReceiptData(response.data.data);
      } else {
        setError('Failed to load receipt details');
      }
    } catch (err) {
      console.error('Error fetching receipt details:', err);
      setError(err.response?.data?.message || 'Failed to load receipt details');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-IN', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusChip = (status) => {
    const statusColors = {
      'Draft': { bg: '#F1F5F9', color: '#475569' },
      'Received': { bg: '#D1FAE5', color: '#065F46' },
      'Partially Received': { bg: '#FEF3C7', color: '#B45309' },
      'Completed': { bg: '#D1FAE5', color: '#065F46' },
      'Cancelled': { bg: '#FEE2E2', color: '#991B1B' }
    };
    const colors = statusColors[status] || { bg: '#F1F5F9', color: '#475569' };
    return (
      <Chip 
        label={status} 
        size="small" 
        sx={{
          fontSize: '0.7rem',
          fontWeight: 500,
          height: 26,
          bgcolor: colors.bg,
          color: colors.color
        }}
      />
    );
  };

  const getConditionChip = (condition) => {
    const conditionColors = {
      'Good': { bg: '#D1FAE5', color: '#065F46' },
      'Damaged': { bg: '#FEE2E2', color: '#991B1B' },
      'Defective': { bg: '#FEF3C7', color: '#B45309' },
      'Partial': { bg: '#E0F2FE', color: '#0369A1' }
    };
    const colors = conditionColors[condition] || { bg: '#F1F5F9', color: '#475569' };
    return (
      <Chip 
        label={condition} 
        size="small" 
        sx={{
          fontSize: '0.65rem',
          fontWeight: 500,
          height: 22,
          bgcolor: colors.bg,
          color: colors.color
        }}
      />
    );
  };

  const getQualityStatusChip = (status) => {
    const qualityColors = {
      'Pending': { bg: '#FEF3C7', color: '#B45309' },
      'Passed': { bg: '#D1FAE5', color: '#065F46' },
      'Failed': { bg: '#FEE2E2', color: '#991B1B' },
      'Quarantine': { bg: '#FEF3C7', color: '#B45309' }
    };
    const colors = qualityColors[status] || { bg: '#F1F5F9', color: '#475569' };
    return (
      <Chip 
        label={status} 
        size="small" 
        sx={{
          fontSize: '0.65rem',
          fontWeight: 500,
          height: 22,
          bgcolor: colors.bg,
          color: colors.color
        }}
      />
    );
  };

  if (!open) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          boxShadow: '0 1px 3px 0 rgba(0,0,0,0.05)',
          border: `1px solid ${COLORS.border}`,
          overflow: 'hidden',
          maxHeight: '90vh'
        }
      }}
    >
      <DialogTitle sx={{
        borderBottom: `1px solid ${COLORS.border}`,
        py: 2,
        px: 3,
        bgcolor: COLORS.background.white,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <Stack spacing={0.5}>
          <Typography sx={{ fontSize: '1.1rem', fontWeight: 700, color: COLORS.text.primary }}>
            Inward Receipt Details
          </Typography>
          {receiptData && (
            <Typography sx={{ fontSize: '0.75rem', color: COLORS.text.secondary }}>
              {receiptData.receipt_id} • {formatDate(receiptData.receipt_date)}
            </Typography>
          )}
        </Stack>
        <IconButton onClick={onClose} sx={{ color: COLORS.text.secondary }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 0, bgcolor: COLORS.background.white }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
            <CircularProgress size={40} sx={{ color: COLORS.primary }} />
          </Box>
        ) : error ? (
          <Box sx={{ p: 3 }}>
            <Alert severity="error" sx={{ borderRadius: 1.5 }}>
              {error}
            </Alert>
          </Box>
        ) : receiptData ? (
          <Box>
            {/* Summary Cards */}
            <Box sx={{ p: 3, bgcolor: COLORS.background.light, borderBottom: `1px solid ${COLORS.border}` }}>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                  <Paper sx={{ p: 2, bgcolor: COLORS.background.white, borderRadius: 2 }}>
                    <Stack spacing={0.5}>
                      <Typography sx={{ fontSize: '0.65rem', fontWeight: 600, color: COLORS.text.tertiary, textTransform: 'uppercase' }}>
                        Total Items Received
                      </Typography>
                      <Typography sx={{ fontSize: '1.25rem', fontWeight: 700, color: COLORS.primary }}>
                        {receiptData.total_items_received || 0}
                      </Typography>
                    </Stack>
                  </Paper>
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                  <Paper sx={{ p: 2, bgcolor: COLORS.background.white, borderRadius: 2 }}>
                    <Stack spacing={0.5}>
                      <Typography sx={{ fontSize: '0.65rem', fontWeight: 600, color: COLORS.text.tertiary, textTransform: 'uppercase' }}>
                        Total Quantity Received
                      </Typography>
                      <Typography sx={{ fontSize: '1.25rem', fontWeight: 700, color: COLORS.primary }}>
                        {receiptData.total_received_qty || 0}
                      </Typography>
                    </Stack>
                  </Paper>
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                  <Paper sx={{ p: 2, bgcolor: COLORS.background.white, borderRadius: 2 }}>
                    <Stack spacing={0.5}>
                      <Typography sx={{ fontSize: '0.65rem', fontWeight: 600, color: COLORS.text.tertiary, textTransform: 'uppercase' }}>
                        Total Taxable Value
                      </Typography>
                      <Typography sx={{ fontSize: '1.25rem', fontWeight: 700, color: COLORS.primary }}>
                        ₹{receiptData.total_taxable_value?.toLocaleString() || 0}
                      </Typography>
                    </Stack>
                  </Paper>
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                  <Paper sx={{ p: 2, bgcolor: COLORS.background.white, borderRadius: 2 }}>
                    <Stack spacing={0.5}>
                      <Typography sx={{ fontSize: '0.65rem', fontWeight: 600, color: COLORS.text.tertiary, textTransform: 'uppercase' }}>
                        Status
                      </Typography>
                      {getStatusChip(receiptData.status)}
                    </Stack>
                  </Paper>
                </Grid>
              </Grid>
            </Box>

            {/* Receipt Information */}
            <Box sx={{ p: 3 }}>
              <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color: COLORS.primary, mb: 2 }}>
                <ReceiptIcon sx={{ fontSize: '1rem', mr: 0.5, verticalAlign: 'middle' }} />
                Receipt Information
              </Typography>
              
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Paper sx={{ p: 2, bgcolor: COLORS.background.light, borderRadius: 1.5 }}>
                    <Typography sx={{ fontSize: '0.65rem', fontWeight: 600, color: COLORS.text.tertiary, textTransform: 'uppercase' }}>
                      Receipt ID
                    </Typography>
                    <Typography sx={{ fontSize: '0.85rem', fontWeight: 600, color: COLORS.text.primary, mt: 0.5 }}>
                      {receiptData.receipt_id}
                    </Typography>
                  </Paper>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Paper sx={{ p: 2, bgcolor: COLORS.background.light, borderRadius: 1.5 }}>
                    <Typography sx={{ fontSize: '0.65rem', fontWeight: 600, color: COLORS.text.tertiary, textTransform: 'uppercase' }}>
                      Receipt Type
                    </Typography>
                    <Typography sx={{ fontSize: '0.85rem', fontWeight: 500, color: COLORS.text.primary, mt: 0.5 }}>
                      {receiptData.receipt_type}
                    </Typography>
                  </Paper>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Paper sx={{ p: 2, bgcolor: COLORS.background.light, borderRadius: 1.5 }}>
                    <Typography sx={{ fontSize: '0.65rem', fontWeight: 600, color: COLORS.text.tertiary, textTransform: 'uppercase' }}>
                      Receipt Date
                    </Typography>
                    <Typography sx={{ fontSize: '0.85rem', fontWeight: 500, color: COLORS.text.primary, mt: 0.5 }}>
                      {formatDate(receiptData.receipt_date)}
                    </Typography>
                  </Paper>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Paper sx={{ p: 2, bgcolor: COLORS.background.light, borderRadius: 1.5 }}>
                    <Typography sx={{ fontSize: '0.65rem', fontWeight: 600, color: COLORS.text.tertiary, textTransform: 'uppercase' }}>
                      Fully Received
                    </Typography>
                    <Typography sx={{ fontSize: '0.85rem', fontWeight: 500, color: COLORS.text.primary, mt: 0.5 }}>
                      {receiptData.is_fully_received ? 'Yes' : 'No'}
                    </Typography>
                  </Paper>
                </Grid>
                {receiptData.receipt_note && (
                  <Grid size={{ xs: 12 }}>
                    <Paper sx={{ p: 2, bgcolor: COLORS.background.light, borderRadius: 1.5 }}>
                      <Typography sx={{ fontSize: '0.65rem', fontWeight: 600, color: COLORS.text.tertiary, textTransform: 'uppercase' }}>
                        Receipt Note
                      </Typography>
                      <Typography sx={{ fontSize: '0.85rem', color: COLORS.text.primary, mt: 0.5 }}>
                        {receiptData.receipt_note}
                      </Typography>
                    </Paper>
                  </Grid>
                )}
              </Grid>
            </Box>

            <Divider />

            {/* DC Information */}
            <Box sx={{ p: 3 }}>
              <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color: COLORS.primary, mb: 2 }}>
                <LocalShippingIcon sx={{ fontSize: '1rem', mr: 0.5, verticalAlign: 'middle' }} />
                Delivery Challan Information
              </Typography>
              
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Paper sx={{ p: 2, bgcolor: COLORS.background.light, borderRadius: 1.5 }}>
                    <Typography sx={{ fontSize: '0.65rem', fontWeight: 600, color: COLORS.text.tertiary, textTransform: 'uppercase' }}>
                      DC Number
                    </Typography>
                    <Typography sx={{ fontSize: '0.85rem', fontWeight: 600, color: COLORS.primary, mt: 0.5 }}>
                      {receiptData.dc_number}
                    </Typography>
                  </Paper>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Paper sx={{ p: 2, bgcolor: COLORS.background.light, borderRadius: 1.5 }}>
                    <Typography sx={{ fontSize: '0.65rem', fontWeight: 600, color: COLORS.text.tertiary, textTransform: 'uppercase' }}>
                      SO Number
                    </Typography>
                    <Typography sx={{ fontSize: '0.85rem', fontWeight: 500, color: COLORS.text.primary, mt: 0.5 }}>
                      {receiptData.so_number}
                    </Typography>
                  </Paper>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Paper sx={{ p: 2, bgcolor: COLORS.background.light, borderRadius: 1.5 }}>
                    <Typography sx={{ fontSize: '0.65rem', fontWeight: 600, color: COLORS.text.tertiary, textTransform: 'uppercase' }}>
                      Customer
                    </Typography>
                    <Typography sx={{ fontSize: '0.85rem', fontWeight: 500, color: COLORS.text.primary, mt: 0.5 }}>
                      {receiptData.customer_name}
                    </Typography>
                  </Paper>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Paper sx={{ p: 2, bgcolor: COLORS.background.light, borderRadius: 1.5 }}>
                    <Typography sx={{ fontSize: '0.65rem', fontWeight: 600, color: COLORS.text.tertiary, textTransform: 'uppercase' }}>
                      Customer ID
                    </Typography>
                    <Typography sx={{ fontSize: '0.85rem', fontWeight: 500, color: COLORS.text.primary, mt: 0.5 }}>
                      {receiptData.customer_id}
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>
            </Box>

            <Divider />

            {/* Items Table */}
            <Box sx={{ p: 3 }}>
              <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color: COLORS.primary, mb: 2 }}>
                <InventoryIcon sx={{ fontSize: '1rem', mr: 0.5, verticalAlign: 'middle' }} />
                Items Received ({receiptData.items?.length || 0})
              </Typography>

              <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 1.5 }}>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ bgcolor: '#F8FFFC' }}>
                      <TableCell sx={{ fontWeight: 600, fontSize: '0.7rem' }}>#</TableCell>
                      <TableCell sx={{ fontWeight: 600, fontSize: '0.7rem' }}>Part No</TableCell>
                      <TableCell sx={{ fontWeight: 600, fontSize: '0.7rem' }}>Part Name</TableCell>
                      <TableCell sx={{ fontWeight: 600, fontSize: '0.7rem' }} align="center">Original Qty</TableCell>
                      <TableCell sx={{ fontWeight: 600, fontSize: '0.7rem' }} align="center">Received</TableCell>
                      <TableCell sx={{ fontWeight: 600, fontSize: '0.7rem' }} align="center">Remaining</TableCell>
                      <TableCell sx={{ fontWeight: 600, fontSize: '0.7rem' }}>Condition</TableCell>
                      <TableCell sx={{ fontWeight: 600, fontSize: '0.7rem' }}>Quality</TableCell>
                      <TableCell sx={{ fontWeight: 600, fontSize: '0.7rem' }}>Unit</TableCell>
                      <TableCell sx={{ fontWeight: 600, fontSize: '0.7rem' }}>Location</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {receiptData.items?.map((item, index) => (
                      <TableRow key={item._id || index} hover>
                        <TableCell>
                          <Typography sx={{ fontSize: '0.7rem', color: COLORS.text.secondary }}>
                            {index + 1}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography sx={{ fontSize: '0.75rem', fontWeight: 500, color: COLORS.text.primary }}>
                            {item.part_no}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography sx={{ fontSize: '0.75rem', color: COLORS.text.primary }}>
                            {item.part_name}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Typography sx={{ fontSize: '0.75rem', color: COLORS.text.secondary }}>
                            {item.original_qty}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: COLORS.primary }}>
                            {item.receiving_qty}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Typography sx={{ fontSize: '0.75rem', color: COLORS.text.secondary }}>
                            {item.remaining_qty}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          {getConditionChip(item.condition)}
                        </TableCell>
                        <TableCell>
                          {getQualityStatusChip(item.quality_status)}
                        </TableCell>
                        <TableCell>
                          <Typography sx={{ fontSize: '0.75rem', color: COLORS.text.secondary }}>
                            {item.unit}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography sx={{ fontSize: '0.75rem', color: COLORS.text.secondary }}>
                            {item.location || '-'}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>

            {/* Documents Section */}
            {receiptData.documents && receiptData.documents.length > 0 && (
              <>
                <Divider />
                <Box sx={{ p: 3 }}>
                  <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color: COLORS.primary, mb: 2 }}>
                    <FilePresentIcon sx={{ fontSize: '1rem', mr: 0.5, verticalAlign: 'middle' }} />
                    Documents ({receiptData.documents.length})
                  </Typography>
                  <Stack spacing={1}>
                    {receiptData.documents.map((doc, index) => (
                      <Paper key={index} sx={{ p: 1.5, bgcolor: COLORS.background.light, borderRadius: 1.5 }}>
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <FilePresentIcon sx={{ color: COLORS.primary }} />
                          <Typography sx={{ fontSize: '0.75rem', fontWeight: 500, color: COLORS.text.primary }}>
                            {doc.file_name}
                          </Typography>
                          <Chip 
                            label={doc.document_type} 
                            size="small" 
                            sx={{ fontSize: '0.6rem', height: 20 }} 
                          />
                        </Stack>
                      </Paper>
                    ))}
                  </Stack>
                </Box>
              </>
            )}
          </Box>
        ) : null}
      </DialogContent>

      <DialogActions sx={{
        px: 3,
        py: 2,
        borderTop: `1px solid ${COLORS.border}`,
        bgcolor: COLORS.background.white
      }}>
        <Button
          onClick={onClose}
          sx={{
            height: 36,
            px: 3,
            borderRadius: 1.5,
            border: `1px solid ${COLORS.border}`,
            color: COLORS.text.secondary,
            fontSize: '0.75rem',
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
      </DialogActions>
    </Dialog>
  );
};

export default ViewInwardReceipt;