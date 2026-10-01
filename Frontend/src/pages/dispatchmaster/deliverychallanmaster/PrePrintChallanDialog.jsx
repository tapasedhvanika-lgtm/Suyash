import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Typography,
  Box,
  Alert,
  CircularProgress
} from '@mui/material';
import { Print as PrintIcon, Close as CloseIcon } from '@mui/icons-material';
import axios from 'axios';
import BASE_URL from '../../../config/Config';
import PrintDeliveryChallan from './PrintDeliveryChallan';

// Nature of Processing options
const NATURE_OF_PROCESSING_OPTIONS = [
  '',
  'Chamfer',
  'Zinc blue plating',
  'Yellow plating',
  'Brazing',
  'Dimple and forming',
  'Hardening',
  'Paint',
  'Phosphating',
  'Tapping',
  'Blackodising',
  'Machining',
  'Tin plating',
  'Silver Plating'
];

const PrePrintChallanDialog = ({ open, onClose, deliveryChallan }) => {
  const [natureOfProcessing, setNatureOfProcessing] = useState('');
  const [durationOfProcess, setDurationOfProcess] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [dcData, setDcData] = useState(null);

  // Single source of truth for which print job is active.
  // null | 'ORIGINAL FOR RECIPIENT' | 'DUPLICATE FOR TRANSPORTER' | 'BOTH'
  const [printMode, setPrintMode] = useState(null);

  // Local visibility for the MUI Dialog, decoupled from the parent's `open`
  // prop. IMPORTANT: the parent unmounts this whole component (and clears
  // deliveryChallan) as soon as its onClose fires — e.g.
  // onClose={() => { setOpenPrePrintDialog(false); setSelectedDC(null); }}.
  // If we called that onClose the instant a print starts, React would batch
  // it with our own state update and this component (along with the
  // <PrintDeliveryChallan> it renders) would never actually mount — the
  // print window would never open. So while a print is in flight we only
  // hide the form dialog locally, and defer the real onClose until the
  // print job has finished (see handlePrintDone).
  const [dialogVisible, setDialogVisible] = useState(open);

  useEffect(() => {
    setDialogVisible(open);
  }, [open]);

  // Fetch latest DC data when dialog opens
  useEffect(() => {
    if (open && deliveryChallan?._id) {
      fetchDCData();
    }
  }, [open, deliveryChallan]);

  const fetchDCData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${BASE_URL}/api/delivery-challans/${deliveryChallan._id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        const data = response.data.data;
        setDcData(data);
        setNatureOfProcessing(
          data.job_work?.dispatch_through ||
          data.challan_meta?.dispatch_through ||
          ''
        );

        const durationValue = data.job_work?.duration_of_process_days || data.challan_meta?.duration_of_process || '';
        setDurationOfProcess(durationValue !== '' && durationValue !== null && durationValue !== undefined ? String(durationValue) : '');
      }
    } catch (err) {
      console.error('Error fetching DC data:', err);
      setError('Failed to load delivery challan data');
    } finally {
      setLoading(false);
    }
  };

  // Shared helper: saves nature_of_processing / duration_of_process, if changed
  const saveUpdates = async () => {
    const token = localStorage.getItem('token');
    const updateData = {};

    if (natureOfProcessing.trim()) {
      updateData.dispatch_through = natureOfProcessing.trim();
    }

    if (durationOfProcess && durationOfProcess.trim() !== '') {
      const durationNum = Number(durationOfProcess);
      if (!isNaN(durationNum) && durationNum >= 0) {
        updateData.duration_of_process = durationNum;
      } else {
        throw new Error('Please enter a valid number for duration of process');
      }
    }

    if (Object.keys(updateData).length > 0) {
      await axios.patch(
        `${BASE_URL}/api/delivery-challans/${deliveryChallan._id}/pre-print`,
        updateData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
    }
  };

  // Kicks off a single print job. mode is one of:
  // 'ORIGINAL FOR RECIPIENT' | 'DUPLICATE FOR TRANSPORTER' | 'BOTH'
  const startPrint = async (mode) => {
    setError('');
    try {
      setLoading(true);
      await saveUpdates();
      setPrintMode(mode);
      // Hide the form dialog visually, but do NOT call the parent's
      // onClose yet — that would unmount this component (and the
      // deliveryChallan reference) before the print window has a chance
      // to open. The parent is notified once printing actually finishes,
      // in handlePrintDone.
      setDialogVisible(false);
    } catch (err) {
      console.error('Error updating delivery challan:', err);
      setError(err.message || err.response?.data?.message || 'Failed to update delivery challan data');
    } finally {
      setLoading(false);
    }
  };

  const handlePrintOriginal = () => startPrint('ORIGINAL FOR RECIPIENT');
  const handlePrintDuplicate = () => startPrint('DUPLICATE FOR TRANSPORTER');
  const handlePrintBoth = () => startPrint('BOTH');

  // Called once the print window finishes (afterprint) or fails.
  // Only now is it safe to notify the parent, since the print job has
  // already been kicked off and doesn't need this component mounted
  // anymore.
  const handlePrintDone = () => {
    setPrintMode(null);
    onClose();
  };

  // Close handler for Cancel / X button — no print in flight, safe to
  // notify the parent immediately.
  const handleClose = () => {
    setError('');
    setLoading(false);
    setDialogVisible(false);
    onClose();
  };

  // Handle duration input change - only allow numbers
  const handleDurationChange = (e) => {
    const value = e.target.value;
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setDurationOfProcess(value);
    }
  };

  return (
    <>
      <Dialog
        open={dialogVisible}
        onClose={handleClose}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            boxShadow: '0 8px 24px rgba(0,0,0,0.15)'
          }
        }}
      >
        <DialogTitle sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          pb: 1,
          borderBottom: '1px solid #e0e0e0'
        }}>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1.1rem' }}>
              Print Delivery Challan
            </Typography>
            <Typography variant="body2" sx={{ color: '#666', fontSize: '0.75rem', mt: 0.5 }}>
              {deliveryChallan?.dc_number} - {deliveryChallan?.customer_name}
            </Typography>
          </Box>
          <Button
            onClick={handleClose}
            sx={{ minWidth: 'auto', p: 1, color: '#666' }}
          >
            <CloseIcon />
          </Button>
        </DialogTitle>

        <DialogContent sx={{ pt: 3 }}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress size={32} sx={{ color: '#063C3F' }} />
            </Box>
          ) : (
            <>
              {error && (
                <Alert severity="error" sx={{ mb: 2, borderRadius: 1.5 }}>
                  {error}
                </Alert>
              )}

              <Typography variant="body2" sx={{ color: '#666', fontSize: '0.8rem', mb: 2 }}>
                Please review and update the following details before printing:
              </Typography>

              <Grid container spacing={2}>
                {/* Nature of Processing - Dropdown */}
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Dispatch Through"
                    value={natureOfProcessing}
                    onChange={(e) => setNatureOfProcessing(e.target.value)}
                    placeholder="Enter Dispatch Through"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 1.5,
                        '&:hover fieldset': {
                          borderColor: '#063C3F',
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: '#063C3F',
                        },
                      },
                    }}
                    helperText="Enter Dispatch Through"
                  />
                </Grid>

                {/* Duration of Process - Number Field */}
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Duration of Process (in days)"
                    value={durationOfProcess}
                    onChange={handleDurationChange}
                    placeholder="e.g., 2, 5, 7, etc."
                    type="text"
                    inputMode="numeric"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 1.5,
                        '&:hover fieldset': {
                          borderColor: '#063C3F'
                        }
                      }
                    }}
                    helperText="Optional - Enter the duration in days (numbers only)"
                    FormHelperTextProps={{
                      sx: { fontSize: '0.7rem' }
                    }}
                  />
                </Grid>
              </Grid>
            </>
          )}
        </DialogContent>

        <DialogActions sx={{
          p: 3,
          pt: 1,
          borderTop: '1px solid #e0e0e0',
          gap: 1,
          flexWrap: 'wrap'
        }}>
          <Button
            variant="outlined"
            onClick={handleClose}
            sx={{
              borderRadius: 1.5,
              textTransform: 'none',
              fontSize: '0.8rem',
              fontWeight: 500,
              borderColor: '#ccc',
              color: '#666',
              '&:hover': {
                borderColor: '#999',
                bgcolor: '#f5f5f5'
              }
            }}
          >
            Cancel
          </Button>

          <Button
            variant="contained"
            onClick={handlePrintOriginal}
            startIcon={<PrintIcon />}
            disabled={loading}
            sx={{
              borderRadius: 1.5,
              textTransform: 'none',
              fontSize: '0.8rem',
              fontWeight: 500,
              bgcolor: '#063C3F',
              '&:hover': {
                bgcolor: '#05292B'
              }
            }}
          >
            Print Original
          </Button>

          <Button
            variant="contained"
            onClick={handlePrintDuplicate}
            startIcon={<PrintIcon />}
            disabled={loading}
            sx={{
              borderRadius: 1.5,
              textTransform: 'none',
              fontSize: '0.8rem',
              fontWeight: 500,
              bgcolor: '#0D696C',
              '&:hover': {
                bgcolor: '#0A5456'
              }
            }}
          >
            Print Duplicate
          </Button>

          <Button
            variant="contained"
            onClick={handlePrintBoth}
            startIcon={<PrintIcon />}
            disabled={loading}
            sx={{
              borderRadius: 1.5,
              textTransform: 'none',
              fontSize: '0.8rem',
              fontWeight: 500,
              bgcolor: '#1A5C8C',
              '&:hover': {
                bgcolor: '#154A72'
              }
            }}
          >
            Print Both
          </Button>
        </DialogActions>
      </Dialog>

      {/* Single print job at a time — mode determines the layout:
          a single copy, or both copies stacked with a cutline. */}
      {dcData && printMode && (
        <PrintDeliveryChallan
          open={!!printMode}
          onClose={handlePrintDone}
          deliveryChallan={deliveryChallan}
          copyType={printMode}
        />
      )}
    </>
  );
};

export default PrePrintChallanDialog;