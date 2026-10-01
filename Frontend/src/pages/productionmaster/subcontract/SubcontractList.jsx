import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Box, Paper, Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, IconButton, Button, TextField, InputAdornment, Tooltip,
  Typography, Snackbar, TablePagination, Checkbox, Stack, Chip,
  Avatar, Menu, MenuItem, ListItemIcon, ListItemText, Divider,
  Alert, CircularProgress
} from '@mui/material';
import {
  Search as SearchIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Edit as EditIcon,
  MoreVert as MoreVertIcon,
  Assignment as AssignmentIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  LocalShipping as DispatchIcon,
  Inventory as ReceivedIcon,
  QrCodeScanner as QcIcon,
  AttachFile as AttachmentIcon
} from '@mui/icons-material';
import axios from 'axios';
import BASE_URL from '../../../config/Config';
import AddSubcontract from './AddSubcontract';

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
  },
  background: {
    white: '#FFFFFF',
    light: '#F8FFFC',
    hover: '#F0FDF9',
    tableHeader: '#063C3F'
  },
  border: '#E3E8EF',
};

// Status color mapping
const STATUS_COLORS = {
  'Dispatched': { bg: '#E0F2FE', color: '#0284C7', border: '#BAE6FD' },
  'Received': { bg: '#D1FAE5', color: '#059669', border: '#A7F3D0' },
  'Inward QC Pending': { bg: '#FEF3C7', color: '#D97706', border: '#FDE68A' },
  'QC Passed': { bg: '#D1FAE5', color: '#059669', border: '#A7F3D0' },
  'QC Rejected': { bg: '#FEE2E2', color: '#DC2626', border: '#FECACA' },
  'Partially Received': { bg: '#FEF3C7', color: '#D97706', border: '#FDE68A' },
  'Completed': { bg: '#D1FAE5', color: '#059669', border: '#A7F3D0' },
  'Cancelled': { bg: '#F3F4F6', color: '#6B7280', border: '#E5E7EB' }
};

const QC_STATUS_COLORS = {
  'Pending': { bg: '#FEF3C7', color: '#D97706', border: '#FDE68A' },
  'Passed': { bg: '#D1FAE5', color: '#059669', border: '#A7F3D0' },
  'Failed': { bg: '#FEE2E2', color: '#DC2626', border: '#FECACA' },
  'Not Checked': { bg: '#F3F4F6', color: '#6B7280', border: '#E5E7EB' }
};

// Action Menu Component
const ActionMenu = ({ 
  item, 
  anchorEl, 
  onOpen, 
  onClose, 
  onView, 
  onEdit, 
  onQc, 
  onReceive,
  onViewDocument,
  status,
  inwardQcStatus,
  hasAttachments
}) => {
  const open = Boolean(anchorEl);

  return (
    <>
      <IconButton 
        size="small" 
        onClick={onOpen}
        sx={{ 
          color: COLORS.text.tertiary,
          '&:hover': { color: COLORS.primary, bgcolor: COLORS.primaryLight }
        }}
      >
        <MoreVertIcon sx={{ fontSize: '1rem' }} />
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={onClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        PaperProps={{
          sx: {
            borderRadius: 1.5,
            minWidth: 180,
            boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.08)',
            border: `1px solid ${COLORS.border}`
          }
        }}
      >
        <MenuItem onClick={() => { onView(); onClose(); }} sx={{ py: 1, fontSize: '0.75rem' }}>
          <ListItemIcon sx={{ minWidth: 32 }}>
            <ViewIcon sx={{ fontSize: '1rem', color: COLORS.text.secondary }} />
          </ListItemIcon>
          <ListItemText>View Details</ListItemText>
        </MenuItem>

        {status === 'Dispatched' && (
          <MenuItem onClick={() => { onReceive(); onClose(); }} sx={{ py: 1, fontSize: '0.75rem' }}>
            <ListItemIcon sx={{ minWidth: 32 }}>
              <ReceivedIcon sx={{ fontSize: '1rem', color: '#059669' }} />
            </ListItemIcon>
            <ListItemText>Receive Material</ListItemText>
          </MenuItem>
        )}

        {status === 'Received' && inwardQcStatus === 'Pending' && (
          <MenuItem onClick={() => { onQc(); onClose(); }} sx={{ py: 1, fontSize: '0.75rem' }}>
            <ListItemIcon sx={{ minWidth: 32 }}>
              <QcIcon sx={{ fontSize: '1rem', color: '#D97706' }} />
            </ListItemIcon>
            <ListItemText>Perform QC</ListItemText>
          </MenuItem>
        )}

        {/* View Document - Show if there are attachments */}
        {hasAttachments && (
          <MenuItem onClick={() => { onViewDocument(); onClose(); }} sx={{ py: 1, fontSize: '0.75rem' }}>
            <ListItemIcon sx={{ minWidth: 32 }}>
              <AttachmentIcon sx={{ fontSize: '1rem', color: '#0284C7' }} />
            </ListItemIcon>
            <ListItemText>View Document</ListItemText>
          </MenuItem>
        )}

        <Divider sx={{ my: 0.5 }} />

        <MenuItem onClick={() => { onEdit(); onClose(); }} sx={{ py: 1, fontSize: '0.75rem' }}>
          <ListItemIcon sx={{ minWidth: 32 }}>
            <EditIcon sx={{ fontSize: '1rem', color: COLORS.text.secondary }} />
          </ListItemIcon>
          <ListItemText>Edit</ListItemText>
        </MenuItem>

        <MenuItem sx={{ py: 1, fontSize: '0.75rem', color: '#DC2626' }}>
          <ListItemIcon sx={{ minWidth: 32 }}>
            <DeleteIcon sx={{ fontSize: '1rem', color: '#DC2626' }} />
          </ListItemIcon>
          <ListItemText>Delete</ListItemText>
        </MenuItem>
      </Menu>
    </>
  );
};

// Main Component
const SubcontractList = () => {
  const [subcontracts, setSubcontracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [selected, setSelected] = useState([]);
  const [actionMenuAnchor, setActionMenuAnchor] = useState(null);
  const [selectedSubcontractForMenu, setSelectedSubcontractForMenu] = useState(null);
  const [selectedSubcontract, setSelectedSubcontract] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Modal states
  const [openView, setOpenView] = useState(false);
  const [openQc, setOpenQc] = useState(false);
  const [openReceive, setOpenReceive] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [openAdd, setOpenAdd] = useState(false);

  // Ref for search timeout
  const searchTimeoutRef = useRef(null);

  // Handle search input change with debounce
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchInput(value);
    
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    searchTimeoutRef.current = setTimeout(() => {
      setSearchTerm(value);
      setPage(0);
      setSelected([]);
    }, 500);
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  const fetchSubcontracts = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const params = new URLSearchParams({ page: page + 1, limit: rowsPerPage });
      if (searchTerm) params.append('search', searchTerm);
      const res = await axios.get(`${BASE_URL}/api/subcontracts?${params}`, { 
        headers: { Authorization: `Bearer ${token}` } 
      });
      if (res.data.success) { 
        setSubcontracts(res.data.data || []); 
        setTotalItems(res.data.pagination?.total || 0); 
      } else { 
        notify('Failed to load subcontracts', 'error'); 
      }
    } catch (err) { 
      notify('Failed to load subcontracts', 'error'); 
    } finally { 
      setLoading(false); 
    }
  }, [page, rowsPerPage, searchTerm]);

  useEffect(() => { 
    fetchSubcontracts(); 
  }, [fetchSubcontracts]);

  const notify = (message, severity = 'success') => 
    setSnackbar({ open: true, message, severity });

  const openModal = (setter, subcontract = null) => { 
    if (subcontract) setSelectedSubcontract(subcontract); 
    setter(true); 
    setActionMenuAnchor(null); 
    setSelectedSubcontractForMenu(null); 
  };
  
  const closeModal = (setter) => { 
    setter(false); 
    setSelectedSubcontract(null); 
  };
  
  const afterAction = (setter, message) => () => { 
    closeModal(setter); 
    fetchSubcontracts(); 
    notify(message); 
  };

  // Handle Add Subcontract Success
  const handleAddSuccess = (newSubcontract) => {
    notify('Subcontract created successfully!');
    fetchSubcontracts();
    setOpenAdd(false);
  };

  // View Document Handler - Opens directly in new tab
  const handleViewDocument = (subcontract) => {
    if (!subcontract.attachments || subcontract.attachments.length === 0) {
      notify('No documents attached to this subcontract', 'warning');
      return;
    }

    // Get the first attachment
    const attachment = subcontract.attachments[0];
    
    // Construct the full URL - replace backslashes with forward slashes
    const filePath = attachment.path.replace(/\\/g, '/');
    const url = `${BASE_URL}/${filePath}`;
    
    // Open in new tab
    window.open(url, '_blank');
    
    setActionMenuAnchor(null);
    setSelectedSubcontractForMenu(null);
  };

  // Action handlers
  const handleView = (subcontract) => {
    setSelectedSubcontract(subcontract);
    setOpenView(true);
    setActionMenuAnchor(null);
    setSelectedSubcontractForMenu(null);
  };

  const handleEdit = (subcontract) => {
    setSelectedSubcontract(subcontract);
    setOpenEdit(true);
    setActionMenuAnchor(null);
    setSelectedSubcontractForMenu(null);
  };

  const handleQc = (subcontract) => {
    setSelectedSubcontract(subcontract);
    setOpenQc(true);
    setActionMenuAnchor(null);
    setSelectedSubcontractForMenu(null);
  };

  const handleReceive = (subcontract) => {
    setSelectedSubcontract(subcontract);
    setOpenReceive(true);
    setActionMenuAnchor(null);
    setSelectedSubcontractForMenu(null);
  };

  const handleSelectAll = (e) => 
    setSelected(e.target.checked ? subcontracts.map(sc => sc._id) : []);
  
  const handleSelect = (id) => 
    setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  
  const handleChangePage = (_, newPage) => { 
    setPage(newPage); 
    setSelected([]); 
  };
  
  const handleChangeRows = (e) => { 
    setRowsPerPage(parseInt(e.target.value, 10)); 
    setPage(0); 
    setSelected([]); 
  };

  const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  }) : '—';

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Dispatched': return <DispatchIcon sx={{ fontSize: '0.875rem' }} />;
      case 'Received': return <ReceivedIcon sx={{ fontSize: '0.875rem' }} />;
      case 'Inward QC Pending': return <QcIcon sx={{ fontSize: '0.875rem' }} />;
      case 'QC Passed': return <CheckCircleIcon sx={{ fontSize: '0.875rem' }} />;
      case 'QC Rejected': return <CancelIcon sx={{ fontSize: '0.875rem' }} />;
      default: return <AssignmentIcon sx={{ fontSize: '0.875rem' }} />;
    }
  };

  const getQcStatusIcon = (status) => {
    switch (status) {
      case 'Pending': return <QcIcon sx={{ fontSize: '0.75rem' }} />;
      case 'Passed': return <CheckCircleIcon sx={{ fontSize: '0.75rem' }} />;
      case 'Failed': return <CancelIcon sx={{ fontSize: '0.75rem' }} />;
      default: return <AssignmentIcon sx={{ fontSize: '0.75rem' }} />;
    }
  };

  const getInitials = (sc) => sc.vendor_name ? sc.vendor_name.substring(0, 2).toUpperCase() : 'SC';
  
  const getAvatarColor = (sc) => { 
    const colors = [COLORS.primary, '#074346', '#0D696C', '#128C7E', '#1A9C8F']; 
    return colors[(sc.vendor_name?.charCodeAt(0) || 0) % colors.length]; 
  };

  // Get status from subcontract data
  const getDisplayStatus = (sc) => {
    if (sc.status === 'Dispatched') return 'Dispatched';
    if (sc.status === 'Received') {
      if (sc.inward_qc_required && sc.inward_qc_status === 'Pending') {
        return 'Inward QC Pending';
      }
      if (sc.inward_qc_status === 'Passed') return 'QC Passed';
      if (sc.inward_qc_status === 'Failed') return 'QC Rejected';
      return 'Received';
    }
    return sc.status || 'Dispatched';
  };

  // Check if subcontract has attachments
  const hasAttachments = (sc) => {
    return sc.attachments && sc.attachments.length > 0;
  };

  return (
    <Box sx={{ p: 2.5 }}>
      <Box sx={{ mb: 2.5 }}>
        <Typography variant="h5" sx={{ fontSize: '1.25rem', fontWeight: 700, color: COLORS.text.primary, mb: 0.5 }}>
          Subcontract Management
        </Typography>
        <Typography variant="body2" sx={{ fontSize: '0.75rem', color: COLORS.text.secondary }}>
          Manage subcontract operations, track dispatches, receipts, and QC status
        </Typography>
      </Box>

      <Paper sx={{ p: 1.5, mb: 2.5, borderRadius: 2, bgcolor: COLORS.background.white, border: `1px solid ${COLORS.border}` }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} alignItems="center" justifyContent="space-between">
          <TextField 
            placeholder="Search by subcontract number, WO number, vendor, part..." 
            size="small" 
            value={searchInput} 
            onChange={handleSearchChange}
            autoComplete="off"
            sx={{ 
              width: { xs: '100%', sm: 450 },
              '& .MuiOutlinedInput-root': {
                borderRadius: 1.5,
                fontSize: '0.75rem',
                '&:hover fieldset': {
                  borderColor: COLORS.primary,
                },
              }
            }} 
            InputProps={{ 
              startAdornment: <InputAdornment position="start"><SearchIcon sx={{ fontSize: '1rem', color: COLORS.text.tertiary }} /></InputAdornment>, 
              sx: { 
                height: 36, 
                bgcolor: COLORS.background.light,
                '& input': {
                  padding: '6px 12px',
                  fontSize: '0.75rem',
                  color: COLORS.text.primary,
                  '&::placeholder': {
                    color: COLORS.text.tertiary,
                    fontSize: '0.75rem'
                  }
                }
              } 
            }} 
          />
          <Stack direction="row" spacing={1.5} alignItems="center">
            {selected.length > 0 && (
              <Button 
                variant="outlined" 
                color="error" 
                startIcon={<DeleteIcon sx={{ fontSize: '1rem' }} />} 
                sx={{ height: 36, borderRadius: 1.5, textTransform: 'none', fontSize: '0.75rem' }} 
                disabled={loading}
              >
                Delete ({selected.length})
              </Button>
            )}
            <Button 
              variant="contained" 
              startIcon={<AddIcon sx={{ fontSize: '1rem' }} />} 
              onClick={() => setOpenAdd(true)} 
              sx={{ height: 36, borderRadius: 1.5, bgcolor: COLORS.primary, fontSize: '0.75rem', textTransform: 'none', '&:hover': { bgcolor: COLORS.primaryDark } }} 
              disabled={loading}
            >
              Create Subcontract
            </Button>
          </Stack>
        </Stack>
      </Paper>

      <Paper sx={{ width: '100%', borderRadius: 2, overflow: 'hidden', border: `1px solid ${COLORS.border}` }}>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: COLORS.background.tableHeader, '& .MuiTableCell-root': { borderBottom: 'none', color: COLORS.text.light, py: 1.5 } }}>
                <TableCell padding="checkbox" sx={{ width: 40 }}>
                  <Checkbox 
                    indeterminate={selected.length > 0 && selected.length < subcontracts.length} 
                    checked={subcontracts.length > 0 && selected.length === subcontracts.length} 
                    onChange={handleSelectAll} 
                    disabled={loading || subcontracts.length === 0} 
                    sx={{ color: COLORS.text.light, '&.Mui-checked': { color: COLORS.text.light }, '& .MuiSvgIcon-root': { fontSize: '1.25rem' } }} 
                  />
                </TableCell>
                {['SC / Vendor', 'WO / Process', 'Qty', 'Dates', 'Vendor Details', 'QC Status', 'Status', 'Actions'].map(h => (
                  <TableCell key={h} align={h === 'Actions' ? 'center' : 'left'} sx={{ fontWeight: 600, fontSize: '0.7rem', letterSpacing: '0.5px' }}>{h}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={9} align="center" sx={{ py: 6 }}><CircularProgress size={32} sx={{ color: COLORS.primary }} /><Typography sx={{ fontSize: '0.75rem', color: COLORS.text.secondary, mt: 1 }}>Loading subcontracts...</Typography></TableCell></TableRow>
              ) : subcontracts.length === 0 ? (
                <TableRow><TableCell colSpan={9} align="center" sx={{ py: 6 }}><AssignmentIcon sx={{ fontSize: 48, color: COLORS.text.tertiary, mb: 1 }} /><Typography sx={{ fontSize: '0.875rem', color: COLORS.text.secondary, fontWeight: 500 }}>{searchTerm ? 'No subcontracts found' : 'No subcontracts available'}</Typography><Typography sx={{ fontSize: '0.75rem', color: COLORS.text.tertiary, mt: 0.5 }}>{searchTerm ? 'Try adjusting your search terms' : 'Create your first subcontract to get started'}</Typography></TableCell></TableRow>
              ) : (
                subcontracts.map((sc) => {
                  const isSelected = selected.includes(sc._id);
                  const menuOpen = Boolean(actionMenuAnchor) && selectedSubcontractForMenu?._id === sc._id;
                  const displayStatus = getDisplayStatus(sc);
                  const statusColors = STATUS_COLORS[displayStatus] || { bg: '#F1F5F9', color: '#475569', border: '#E2E8F0' };
                  const qcColors = QC_STATUS_COLORS[sc.inward_qc_status] || { bg: '#F1F5F9', color: '#475569', border: '#E2E8F0' };
                  const hasDoc = hasAttachments(sc);
                  
                  // Calculate receipt progress
                  const totalDispatched = sc.dispatched_qty || 0;
                  const totalReceived = sc.received_qty || 0;
                  const receiptPercent = totalDispatched > 0 ? (totalReceived / totalDispatched) * 100 : 0;
                  
                  return (
                    <TableRow key={sc._id} hover selected={isSelected} sx={{ bgcolor: COLORS.background.white, '&:hover': { bgcolor: COLORS.background.hover }, '&.Mui-selected': { bgcolor: `${COLORS.primary}10`, '&:hover': { bgcolor: `${COLORS.primary}20` } }, '& .MuiTableCell-root': { py: 1.5, fontSize: '0.75rem', borderColor: COLORS.border } }}>
                      <TableCell padding="checkbox">
                        <Checkbox 
                          checked={isSelected} 
                          onChange={() => handleSelect(sc._id)} 
                          sx={{ color: COLORS.primary, '&.Mui-checked': { color: COLORS.primary }, '& .MuiSvgIcon-root': { fontSize: '1.25rem' } }} 
                        />
                      </TableCell>
                      <TableCell>
                        <Stack direction="row" spacing={1.5} alignItems="center">
                          <Avatar sx={{ width: 32, height: 32, bgcolor: getAvatarColor(sc), fontSize: '0.7rem', fontWeight: 600 }}>
                            {getInitials(sc)}
                          </Avatar>
                          <Box>
                            <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: COLORS.text.primary }}>
                              {sc.subcontract_number}
                            </Typography>
                            <Typography sx={{ fontSize: '0.65rem', color: COLORS.text.tertiary }}>
                              {sc.vendor_name}
                            </Typography>
                            <Typography sx={{ fontSize: '0.65rem', color: COLORS.text.tertiary }}>
                              Type: {sc.subcontract_type}
                            </Typography>
                          </Box>
                        </Stack>
                      </TableCell>
                      <TableCell>
                        <Typography sx={{ fontSize: '0.75rem', fontWeight: 500, color: COLORS.text.primary }}>
                          {sc.wo_number}
                        </Typography>
                        <Typography sx={{ fontSize: '0.65rem', color: COLORS.text.tertiary }}>
                          Op: {sc.op_sequence} - {sc.operation_name}
                        </Typography>
                        {sc.process_name && (
                          <Chip 
                            label={sc.process_name} 
                            size="small" 
                            sx={{ mt: 0.5, height: 18, fontSize: '0.55rem', bgcolor: COLORS.primaryLight, color: COLORS.primary }} 
                          />
                        )}
                      </TableCell>
                      <TableCell>
                        <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: COLORS.text.primary }}>
                          {totalReceived.toLocaleString()} / {totalDispatched.toLocaleString()}
                        </Typography>
                        <Box sx={{ width: 100, mt: 0.5, bgcolor: '#E5E7EB', borderRadius: 1, overflow: 'hidden' }}>
                          <Box sx={{ width: `${receiptPercent}%`, bgcolor: receiptPercent === 100 ? '#059669' : COLORS.primary, height: 3, borderRadius: 1 }} />
                        </Box>
                        <Typography sx={{ fontSize: '0.65rem', color: COLORS.text.tertiary, mt: 0.25 }}>
                          {Math.round(receiptPercent)}% received
                        </Typography>
                        {sc.vendor_rejection_qty > 0 && (
                          <Typography sx={{ fontSize: '0.6rem', color: '#DC2626' }}>
                            {sc.vendor_rejection_qty} rejected
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        <Typography sx={{ fontSize: '0.7rem', color: COLORS.text.secondary }}>
                          Dispatch: {formatDate(sc.dispatch_date)}
                        </Typography>
                        {sc.expected_return_date && (
                          <Typography sx={{ fontSize: '0.65rem', color: COLORS.text.tertiary }}>
                            Expected: {formatDate(sc.expected_return_date)}
                          </Typography>
                        )}
                        {sc.actual_return_date && (
                          <Typography sx={{ fontSize: '0.65rem', color: '#059669' }}>
                            Returned: {formatDate(sc.actual_return_date)}
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        <Typography sx={{ fontSize: '0.7rem', color: COLORS.text.secondary }}>
                          {sc.vendor_gstin}
                        </Typography>
                        <Typography sx={{ fontSize: '0.65rem', color: COLORS.text.tertiary, maxWidth: 120 }}>
                          {sc.vendor_address?.substring(0, 30)}
                          {sc.vendor_address?.length > 30 ? '...' : ''}
                        </Typography>
                        {sc.dispatch_challan_no && (
                          <Chip 
                            label={`DC: ${sc.dispatch_challan_no}`} 
                            size="small" 
                            sx={{ mt: 0.5, height: 18, fontSize: '0.55rem', bgcolor: '#E0F2FE', color: '#0284C7' }} 
                          />
                        )}
                      </TableCell>
                      <TableCell>
                        <Chip 
                          icon={getQcStatusIcon(sc.inward_qc_status)}
                          label={sc.inward_qc_status || 'Not Checked'} 
                          size="small" 
                          sx={{ fontSize: '0.65rem', fontWeight: 500, height: 24, bgcolor: qcColors.bg, color: qcColors.color, border: `1px solid ${qcColors.border}` }} 
                        />
                        {sc.inward_accepted_qty > 0 && (
                          <Typography sx={{ fontSize: '0.6rem', color: '#059669', mt: 0.5 }}>
                            Accepted: {sc.inward_accepted_qty}
                          </Typography>
                        )}
                        {sc.inward_rejected_qty > 0 && (
                          <Typography sx={{ fontSize: '0.6rem', color: '#DC2626' }}>
                            Rejected: {sc.inward_rejected_qty}
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        <Chip 
                          icon={getStatusIcon(displayStatus)} 
                          label={displayStatus} 
                          size="small" 
                          sx={{ fontSize: '0.65rem', fontWeight: 500, height: 24, bgcolor: statusColors.bg, color: statusColors.color, border: `1px solid ${statusColors.border}` }} 
                        />
                        {hasDoc && (
                          <Tooltip title={`${sc.attachments.length} attachment(s)`}>
                            <AttachmentIcon sx={{ fontSize: '0.75rem', color: COLORS.text.tertiary, ml: 0.5, verticalAlign: 'middle' }} />
                          </Tooltip>
                        )}
                      </TableCell>
                      <TableCell align="center">
                        <ActionMenu 
                          item={sc} 
                          anchorEl={menuOpen ? actionMenuAnchor : null} 
                          onOpen={(e) => { setActionMenuAnchor(e.currentTarget); setSelectedSubcontractForMenu(sc); }} 
                          onClose={() => { setActionMenuAnchor(null); setSelectedSubcontractForMenu(null); }} 
                          onView={() => handleView(sc)}
                          onEdit={() => handleEdit(sc)}
                          onQc={() => handleQc(sc)}
                          onReceive={() => handleReceive(sc)}
                          onViewDocument={() => handleViewDocument(sc)}
                          status={sc.status}
                          inwardQcStatus={sc.inward_qc_status}
                          hasAttachments={hasDoc}
                        />
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination 
          rowsPerPageOptions={[5, 10, 25, 50]} 
          component="div" 
          count={totalItems} 
          rowsPerPage={rowsPerPage} 
          page={page} 
          onPageChange={handleChangePage} 
          onRowsPerPageChange={handleChangeRows} 
          sx={{ borderTop: `1px solid ${COLORS.border}`, '& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows': { fontSize: '0.7rem', color: COLORS.text.secondary }, '& .MuiTablePagination-select': { fontSize: '0.7rem' }, '& .MuiTablePagination-actions button': { color: COLORS.primary } }} 
        />
      </Paper>

      {/* Add Subcontract Modal */}
      <AddSubcontract 
        open={openAdd} 
        onClose={() => setOpenAdd(false)} 
        onAdd={handleAddSuccess} 
      />

      {/* Modals - You'll need to create these components */}
      {/* <ViewSubcontract open={openView} onClose={() => closeModal(setOpenView)} subcontract={selectedSubcontract} /> */}
      {/* <EditSubcontract open={openEdit} onClose={() => closeModal(setOpenEdit)} subcontract={selectedSubcontract} onUpdate={afterAction(setOpenEdit, 'Subcontract updated successfully!')} /> */}
      {/* <QcSubcontract open={openQc} onClose={() => closeModal(setOpenQc)} subcontract={selectedSubcontract} onQcComplete={afterAction(setOpenQc, 'QC completed successfully!')} /> */}
      {/* <ReceiveSubcontract open={openReceive} onClose={() => closeModal(setOpenReceive)} subcontract={selectedSubcontract} onReceive={afterAction(setOpenReceive, 'Materials received successfully!')} /> */}

      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={3000} 
        onClose={() => setSnackbar(s => ({ ...s, open: false }))} 
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={() => setSnackbar(s => ({ ...s, open: false }))} severity={snackbar.severity} variant="filled" sx={{ width: '100%', borderRadius: 1.5, fontSize: '0.75rem' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default SubcontractList;