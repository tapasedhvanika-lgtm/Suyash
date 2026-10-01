import React, { useState } from 'react';
import {
  Box,
  Paper,
  Grid,
  Typography,
  Button,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Stepper,
  Step,
  StepLabel,
  StepConnector,
  stepConnectorClasses,
  styled
} from '@mui/material';
import {
  Close as CloseIcon,
  NavigateNext as NavigateNextIcon,
  NavigateBefore as NavigateBeforeIcon,
  LocalShipping as LocalShippingIcon,
  Business as BusinessIcon,
  Description as DescriptionIcon,
  Inventory as InventoryIcon,
  LocationOn as LocationIcon,
  AccessTime as AccessTimeIcon,
  Info as InfoIcon
} from '@mui/icons-material';

const COLORS = {
  primary: '#063C3F',
  primaryDark: '#05292B',
  text: {
    primary: '#151C26',
    secondary: '#4B5568',
    tertiary: '#94A3B8'
  },
  background: {
    white: '#FFFFFF',
    light: '#F8FFFC'
  },
  border: '#E3E8EF',
  status: {
    Draft: { bg: '#FEF3C7', color: '#B45309' },
    Confirmed: { bg: '#D1FAE5', color: '#065F46' },
    'In Transit': { bg: '#E0F2FE', color: '#0369A1' },
    Delivered: { bg: '#D1FAE5', color: '#065F46' },
    Cancelled: { bg: '#FEE2E2', color: '#991B1B' }
  }
};

const steps = ['Overview', 'Items', 'Details'];

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

const ViewDeliverySchedule = ({ open, onClose, schedule }) => {
  const [activeStep, setActiveStep] = useState(0);

  if (!schedule) return null;

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleNext = () => {
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const getStatusChip = (status) => {
    const colors = COLORS.status[status] || { bg: '#F1F5F9', color: '#475569' };
    return (
      <Chip
        label={status}
        size="small"
        sx={{
          fontSize: '0.7rem',
          fontWeight: 500,
          height: 24,
          bgcolor: colors.bg,
          color: colors.color
        }}
      />
    );
  };

  const getVehicleTypeChip = (vehicleType) => {
    const colors = {
      'Regular': { bg: '#E0F2FE', color: '#0369A1' },
      'Over Dimensional Cargo (ODC)': { bg: '#FEF3C7', color: '#B45309' },
      'Water Vessel': { bg: '#D1FAE5', color: '#065F46' },
      'Air Cargo': { bg: '#F3E8FF', color: '#7E22CE' }
    };
    const style = colors[vehicleType] || { bg: '#F1F5F9', color: '#475569' };
    return (
      <Chip
        label={vehicleType}
        size="small"
        sx={{
          fontSize: '0.65rem',
          fontWeight: 500,
          height: 24,
          bgcolor: style.bg,
          color: style.color
        }}
      />
    );
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
            {/* Header Section - Schedule Overview */}
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
                <LocalShippingIcon sx={{ fontSize: '1rem', mr: 0.5, verticalAlign: 'middle' }} />
                Delivery Schedule Overview
              </Typography>
              
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.5 }}>
                <Box>
                  <Typography sx={{ fontSize: '1rem', fontWeight: 700, color: COLORS.text.primary }}>
                    {schedule.schedule_id}
                  </Typography>
                </Box>
                {getStatusChip(schedule.status)}
              </Stack>
              
              <Divider sx={{ my: 1.5 }} />
              
              <Grid container spacing={1.5}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  {renderField('Dispatch Date', formatDate(schedule.dispatch_date), false, true)}
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  {renderField('SO Number', schedule.so_number)}
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  {renderField('Total Scheduled Qty', schedule.total_scheduled_qty?.toLocaleString() || '0')}
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
                
                 {renderField(
  'Shipping Address',
  typeof schedule.shipping_address_id === 'string'
    ? (() => {
        try {
          const address = JSON.parse(schedule.shipping_address_id);
          return [
            address.line1,
            address.line2,
            address.city,
            address.district,
            address.state,
            address.pincode,
            address.country
          ].filter(Boolean).join(', ');
        } catch {
          return schedule.shipping_address_id;
        }
      })()
    : [
        schedule.shipping_address_id?.line1,
        schedule.shipping_address_id?.line2,
        schedule.shipping_address_id?.city,
        schedule.shipping_address_id?.district,
        schedule.shipping_address_id?.state,
        schedule.shipping_address_id?.pincode,
        schedule.shipping_address_id?.country
      ].filter(Boolean).join(', ')
)}
                </Grid>
              </Grid>
            </Paper>

            {/* Transport Information */}
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
                <LocalShippingIcon sx={{ fontSize: '1rem', mr: 0.5, verticalAlign: 'middle' }} />
                Transport Information
              </Typography>
              
              <Grid container spacing={1.5}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  {renderField('Transporter', schedule.transporter_preference)}
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Box>
                    <Typography sx={{ fontSize: '0.7rem', color: COLORS.text.secondary, mb: 0.5 }}>
                      Vehicle Type
                    </Typography>
                    {getVehicleTypeChip(schedule.vehicle_type)}
                  </Box>
                </Grid>
              </Grid>
              
              {schedule.special_instructions && (
                <Box sx={{ mt: 2 }}>
                  <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary, mb: 0.5 }}>
                    Special Instructions
                  </Typography>
                  <Box sx={{ 
                    p: 1.5, 
                    bgcolor: COLORS.background.light, 
                    borderRadius: 1,
                    border: `1px solid ${COLORS.border}`
                  }}>
                    <Typography sx={{ fontSize: '0.75rem', color: COLORS.text.primary, fontStyle: 'italic' }}>
                      {schedule.special_instructions}
                    </Typography>
                  </Box>
                </Box>
              )}
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
                Items ({schedule.items?.length || 0})
              </Typography>
              
              <TableContainer component={Paper} sx={{ borderRadius: 1.5, border: `1px solid ${COLORS.border}` }}>
                <Table size="small">
                  <TableHead sx={{ bgcolor: COLORS.background.light }}>
                    <TableRow>
                      <TableCell sx={{ fontSize: '0.7rem', fontWeight: 600 }}>Part No</TableCell>
                      <TableCell sx={{ fontSize: '0.7rem', fontWeight: 600 }}>Part Name</TableCell>
                      <TableCell sx={{ fontSize: '0.7rem', fontWeight: 600, align: 'right' }}>Scheduled Qty</TableCell>
                      <TableCell sx={{ fontSize: '0.7rem', fontWeight: 600, align: 'right' }}>Available FG Qty</TableCell>
                      <TableCell sx={{ fontSize: '0.7rem', fontWeight: 600 }}>Remarks</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {schedule.items?.map((item, index) => (
                      <TableRow key={item._id || index} hover>
                        <TableCell sx={{ fontSize: '0.75rem', fontWeight: 600 }}>{item.part_no}</TableCell>
                        <TableCell sx={{ fontSize: '0.75rem' }}>{item.part_name}</TableCell>
                        <TableCell sx={{ fontSize: '0.75rem', textAlign: 'right' }}>{item.scheduled_qty || 0}</TableCell>
                        <TableCell sx={{ fontSize: '0.75rem', textAlign: 'right' }}>{item.available_fg_qty || 0}</TableCell>
                        <TableCell sx={{ fontSize: '0.75rem', color: COLORS.text.tertiary }}>{item.remarks || '-'}</TableCell>
                      </TableRow>
                    ))}
                    {(!schedule.items || schedule.items.length === 0) && (
                      <TableRow>
                        <TableCell colSpan={5} align="center" sx={{ py: 3 }}>
                          <Typography sx={{ fontSize: '0.75rem', color: COLORS.text.tertiary }}>
                            No items found
                          </Typography>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Stack>
        );

      case 2: // Details
        return (
          <Stack spacing={2}>
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
                  {renderField('Created At', formatDateTime(schedule.createdAt))}
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  {renderField('Last Updated', formatDateTime(schedule.updatedAt))}
                </Grid>
              </Grid>
            </Paper>

            {/* Additional Information */}
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
                <InfoIcon sx={{ fontSize: '1rem', mr: 0.5, verticalAlign: 'middle' }} />
                Additional Information
              </Typography>
              
              <Grid container spacing={1.5}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  {renderField('Schedule ID', schedule.schedule_id, true)}
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  {renderField('SO Number', schedule.so_number, true)}
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  {renderField('Status', schedule.status)}
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
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
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
        <Box>
          <Typography sx={{ fontSize: '1.2rem', fontWeight: 700, color: COLORS.text.primary }}>
            Delivery Schedule Details
          </Typography>
          <Typography sx={{ fontSize: '0.7rem', color: COLORS.text.secondary, mt: 0.5 }}>
            Schedule ID: {schedule.schedule_id}
          </Typography>
        </Box>
        <IconButton onClick={onClose} size="small">
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
          disabled={activeStep === 0}
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
            onClick={onClose}
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
            Close
          </Button>
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
          )}
        </Box>
      </DialogActions>
    </Dialog>
  );
};

export default ViewDeliverySchedule;