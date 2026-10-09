import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import {
  Box, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  IconButton, Button, TextField, InputAdornment, Tooltip, Typography, Snackbar,
  TablePagination, Checkbox, Stack, Chip, Avatar, Menu, MenuItem, ListItemIcon,
  ListItemText, Alert, CircularProgress
} from '@mui/material';
import {
  Search as SearchIcon, Refresh as RefreshIcon, Visibility as ViewIcon,
  MoreVert as MoreVertIcon, Receipt as ReceiptIcon, Delete as DeleteIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import axios from 'axios';
import BASE_URL from '../../../config/Config';
import { hasPermission, ACTIONS, MODULES, PAGES } from '../../../utils/modulePermissions';
import ViewOrderModal from './ViewOrderModal';

const COLORS = {
  primary: '#063C3F', primaryDark: '#05292B', primaryLight: '#E8F0F1',
  text: { primary: '#151C26', secondary: '#4B5568', tertiary: '#94A3B8', light: '#FFFFFF' },
  background: { white: '#FFFFFF', light: '#F8FFFC', hover: '#F0FDF9', tableHeader: '#063C3F' },
  border: '#E3E8EF'
};

const LoadingState = () => (
  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
    <CircularProgress size={40} sx={{ color: COLORS.primary }} />
  </Box>
);

const AccessDenied = () => (
  <Box sx={{ p: 4, textAlign: 'center' }}>
    <Typography variant="h6" color="error" sx={{ mb: 2 }}>Access Denied</Typography>
    <Typography variant="body2" color="text.secondary">You don't have permission to view this page.</Typography>
  </Box>
);

const StatusChip = ({ status }) => {
  const getStatusConfig = () => {
    switch (status?.toLowerCase()) {
      case 'confirmed': return { bg: '#D1FAE5', color: '#059669', label: 'Confirmed' };
      case 'pending': return { bg: '#FEF3C7', color: '#D97706', label: 'Pending' };
      case 'draft': return { bg: '#F1F5F9', color: '#475569', label: 'Draft' };
      case 'cancelled': return { bg: '#FEE2E2', color: '#DC2626', label: 'Cancelled' };
      case 'in production': return { bg: '#FEF3C7', color: '#D97706', label: 'In Production' };
      case 'ready for dispatch': return { bg: '#E0E7FF', color: '#4F46E5', label: 'Ready for Dispatch' };
      case 'partially delivered': return { bg: '#FEF3C7', color: '#D97706', label: 'Partially Delivered' };
      case 'fully delivered': return { bg: '#D1FAE5', color: '#059669', label: 'Fully Delivered' };
      case 'closed': return { bg: '#D1FAE5', color: '#059669', label: 'Closed' };
      default: return { bg: '#F1F5F9', color: '#475569', label: status || 'Unknown' };
    }
  };
  const config = getStatusConfig();
  return <Chip label={config.label} size="small" sx={{ bgcolor: config.bg, color: config.color, fontSize: '0.65rem', fontWeight: 600, height: 24, borderRadius: '6px' }} />;
};

// ✅ ActionMenu मध्ये Delete ऑप्शन जोडले
const ActionMenu = ({ order, anchorEl, onOpen, onClose, onView, onDelete, permissions, isSuperAdmin }) => {
  const canView = isSuperAdmin || hasPermission(permissions, MODULES.ORDER_BOOK, PAGES.ORDER_BOOK, ACTIONS.VIEW);
  const canDelete = isSuperAdmin || hasPermission(permissions, MODULES.ORDER_BOOK, PAGES.ORDER_BOOK, ACTIONS.DELETE);
  
  if (!canView && !canDelete) return null;

  return (
    <>
      <Tooltip title="Actions">
        <IconButton size="small" onClick={onOpen} sx={{ color: COLORS.text.secondary, '&:hover': { bgcolor: `${COLORS.primary}20` } }}>
          <MoreVertIcon fontSize="small" />
        </IconButton>
      </Tooltip>
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={onClose}
        PaperProps={{ elevation: 3, sx: { mt: 1, minWidth: 180, borderRadius: 2, border: `1px solid ${COLORS.border}` } }}>
        
        {canView && (
          <MenuItem onClick={() => { onView(order); onClose(); }} sx={{ py: 1.5 }}>
            <ListItemIcon sx={{ color: COLORS.primary, minWidth: 36 }}><ViewIcon fontSize="small" /></ListItemIcon>
            <ListItemText><Typography variant="body2" fontWeight={500} sx={{ fontSize: '0.75rem' }}>View Details</Typography></ListItemText>
          </MenuItem>
        )}
        
        {canDelete && (
          <MenuItem onClick={() => { onDelete(order); onClose(); }} sx={{ py: 1.5 }}>
            <ListItemIcon sx={{ color: '#EF4444', minWidth: 36 }}><DeleteIcon fontSize="small" /></ListItemIcon>
            <ListItemText><Typography variant="body2" fontWeight={500} color="#EF4444" sx={{ fontSize: '0.75rem' }}>Delete</Typography></ListItemText>
          </MenuItem>
        )}
      </Menu>
    </>
  );
};

const OrderBook = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selected, setSelected] = useState([]);
  const [actionMenuAnchor, setActionMenuAnchor] = useState(null);
  const [selectedOrderForMenu, setSelectedOrderForMenu] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [openViewModal, setOpenViewModal] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const [userPermissions, setUserPermissions] = useState([]);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [permissionsLoaded, setPermissionsLoaded] = useState(false);

  const isSearchingRef = useRef(false);
  const searchTimeoutRef = useRef(null);

  useEffect(() => {
    const fetchUserPermissions = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${BASE_URL}/api/auth/me`, { headers: { 'Authorization': `Bearer ${token}` } });
        if (response.data.success) {
          const userData = response.data.data;
          setIsSuperAdmin(userData.isSuperAdmin || false);
          setUserPermissions(userData.permissions || []);
        }
      } catch (err) { console.error('Error fetching user permissions:', err); }
      finally { setPermissionsLoaded(true); }
    };
    fetchUserPermissions();
  }, []);

  const checkPermission = (action) => isSuperAdmin || hasPermission(userPermissions, MODULES.ORDER_BOOK, PAGES.ORDER_BOOK, action);
  const canViewPage = checkPermission(ACTIONS.VIEW);
  const canDelete = checkPermission(ACTIONS.DELETE);

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchInput(value);
    isSearchingRef.current = true;
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    searchTimeoutRef.current = setTimeout(() => {
      setSearchTerm(value);
      setPage(0);
      setSelected([]);
      isSearchingRef.current = false;
    }, 500);
  };

  const handleClearSearch = () => {
    setSearchInput('');
    setSearchTerm('');
    setPage(0);
    setSelected([]);
    isSearchingRef.current = false;
  };

  useEffect(() => {
    return () => { if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current); };
  }, []);

  const fetchOrders = useCallback(async () => {
    if (!canViewPage && !isSuperAdmin) return;
    if (!isSearchingRef.current) setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${BASE_URL}/api/sales-orders/order-book`, { headers: { 'Authorization': `Bearer ${token}` } });
      if (response.data.success) {
        setOrders(response.data.data || []);
      } else {
        showNotification('Failed to load orders', 'error');
      }
    } catch (err) {
      console.error('Error fetching orders:', err);
      showNotification('Failed to load orders', 'error');
    } finally {
      setLoading(false);
    }
  }, [canViewPage, isSuperAdmin]);

  useEffect(() => {
    if (permissionsLoaded && (canViewPage || isSuperAdmin)) fetchOrders();
  }, [fetchOrders, permissionsLoaded, canViewPage, isSuperAdmin]);

  const filteredOrders = useMemo(() => {
    if (!searchTerm) return orders;
    const lowerSearch = searchTerm.toLowerCase();
    return orders.filter(order => 
      order.so_number?.toLowerCase().includes(lowerSearch) ||
      order.customer_name?.toLowerCase().includes(lowerSearch) ||
      order.customer_po_number?.toLowerCase().includes(lowerSearch) ||
      order.quotation_no?.toLowerCase().includes(lowerSearch)
    );
  }, [orders, searchTerm]);

  const paginatedOrders = useMemo(() => {
    const startIndex = page * rowsPerPage;
    return filteredOrders.slice(startIndex, startIndex + rowsPerPage);
  }, [filteredOrders, page, rowsPerPage]);

  const totalItems = filteredOrders.length;

  const handleSelectAll = (event) => {
    if (!canDelete) return;
    if (event.target.checked) {
      // ✅ योग्य `_id` निवडा
      setSelected(paginatedOrders.map(order => order._id));
    } else {
      setSelected([]);
    }
  };

  const handleSelect = (id) => {
    if (!canDelete) return;
    const selectedIndex = selected.indexOf(id);
    let newSelected = [];
    if (selectedIndex === -1) newSelected = newSelected.concat(selected, id);
    else newSelected = selected.filter(item => item !== id);
    setSelected(newSelected);
  };

  const handleChangePage = (event, newPage) => { setPage(newPage); setSelected([]); };
  const handleChangeRowsPerPage = (event) => { setRowsPerPage(parseInt(event.target.value, 10)); setPage(0); setSelected([]); };

  const handleBulkDelete = async () => {
    if (!canDelete || selected.length === 0) return;
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      // ✅ बॅकएंडला योग्य `ids` अॅरे पाठवा
      await axios.post(`${BASE_URL}/api/sales-orders/bulk-delete`, { ids: selected }, { headers: { 'Authorization': `Bearer ${token}` } });
      setSelected([]);
      fetchOrders();
      showNotification(`${selected.length} order(s) deleted successfully!`, 'success');
    } catch (err) {
      showNotification(err.response?.data?.message || 'Failed to delete orders', 'error');
    } finally { setLoading(false); }
  };

  // ✅ एक-एक ऑर्डर डिलीट करण्यासाठी नवीन फंक्शन
  const handleSingleDelete = async (order) => {
    if (!canDelete) return;
    if (!window.confirm(`Are you sure you want to delete Sales Order ${order.so_number}?`)) return;
    
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${BASE_URL}/api/sales-orders/${order._id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      showNotification(`Order ${order.so_number} deleted successfully!`, 'success');
      fetchOrders();
      setSelected(prev => prev.filter(id => id !== order._id));
    } catch (err) {
      console.error('Delete error:', err);
      showNotification(err.response?.data?.message || 'Failed to delete order', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleActionMenuOpen = (event, order) => { setActionMenuAnchor(event.currentTarget); setSelectedOrderForMenu(order); };
  const handleActionMenuClose = () => { setActionMenuAnchor(null); setSelectedOrderForMenu(null); };
  const openViewOrderModal = (order) => { if (!canViewPage) return; setSelectedOrder(order); setOpenViewModal(true); handleActionMenuClose(); };

  const showNotification = (message, severity) => setSnackbar({ open: true, message, severity });
  const formatDate = (dateString) => dateString ? new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : '-';
  const formatCurrency = (amount, currency = 'INR') => new Intl.NumberFormat('en-IN', { style: 'currency', currency, minimumFractionDigits: 2 }).format(amount || 0);
  const getOrderInitials = (order) => order.so_number ? order.so_number.substring(0, 2).toUpperCase() : 'SO';
  const getAvatarColor = (order) => {
    const colors = [COLORS.primary, COLORS.primaryDark, '#074346', '#0D696C', '#128C7E'];
    const charCode = order.so_number?.charCodeAt(0) || 0;
    return colors[charCode % colors.length];
  };

  if (!permissionsLoaded) return <LoadingState />;
  if (!canViewPage && !isSuperAdmin) return <AccessDenied />;

  return (
    <Box sx={{ p: 2.5 }}>
      <Box sx={{ mb: 2.5 }}>
        <Typography variant="h5" sx={{ fontSize: '1.25rem', fontWeight: 700, color: COLORS.text.primary, mb: 0.5 }}>Order Book</Typography>
        <Typography variant="body2" sx={{ fontSize: '0.75rem', color: COLORS.text.secondary }}>View and manage all sales orders</Typography>
      </Box>

      <Paper sx={{ p: 1.5, mb: 2.5, borderRadius: 2, border: `1px solid ${COLORS.border}` }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} alignItems="center" justifyContent="space-between">
          <Stack direction="row" spacing={1.5} alignItems="center" sx={{ flex: 1 }}>
            <TextField
              placeholder="Search by SO number, customer, quotation, PO number..."
              size="small" value={searchInput} onChange={handleSearchChange} autoComplete="off"
              sx={{ width: { xs: '100%', sm: 450 }, '& .MuiOutlinedInput-root': { borderRadius: 1.5, fontSize: '0.75rem' } }}
              InputProps={{
                startAdornment: (<InputAdornment position="start"><SearchIcon sx={{ fontSize: '1rem', color: COLORS.text.tertiary }} /></InputAdornment>),
                endAdornment: searchInput && (<InputAdornment position="end"><IconButton size="small" onClick={handleClearSearch}><CloseIcon fontSize="small" /></IconButton></InputAdornment>),
                sx: { height: 36, bgcolor: COLORS.background.light }
              }}
            />
          </Stack>
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Tooltip title="Refresh">
              <IconButton size="small" onClick={fetchOrders} disabled={loading} sx={{ color: COLORS.text.secondary }}><RefreshIcon fontSize="small" /></IconButton>
            </Tooltip>
            {canDelete && selected.length > 0 && (
              <Button variant="outlined" color="error" startIcon={<DeleteIcon sx={{ fontSize: '1rem' }} />}
                sx={{ height: 36, borderRadius: 1.5, textTransform: 'none', fontSize: '0.75rem', fontWeight: 500 }}
                disabled={loading} onClick={handleBulkDelete}>
                Delete ({selected.length})
              </Button>
            )}
          </Stack>
        </Stack>
      </Paper>

      <Paper sx={{ width: '100%', borderRadius: 2, overflow: 'hidden', border: `1px solid ${COLORS.border}` }}>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: COLORS.background.tableHeader, '& .MuiTableCell-root': { borderBottom: 'none', color: COLORS.text.light, py: 1.5 } }}>
                {canDelete && (
                  <TableCell padding="checkbox" sx={{ width: 40 }}>
                    <Checkbox indeterminate={selected.length > 0 && selected.length < paginatedOrders.length}
                      checked={paginatedOrders.length > 0 && selected.length === paginatedOrders.length}
                      onChange={handleSelectAll}
                      sx={{ color: COLORS.text.light, '&.Mui-checked': { color: COLORS.text.light } }}
                      disabled={loading || paginatedOrders.length === 0} />
                  </TableCell>
                )}
                <TableCell sx={{ fontWeight: 600, fontSize: '0.7rem' }}>SO No / Customer</TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: '0.7rem' }}>PO / Quotation</TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: '0.7rem' }}>Order Details</TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: '0.7rem' }}>Amount</TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: '0.7rem' }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: '0.7rem' }}>Delivery</TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: '0.7rem', width: 60 }} align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={canDelete ? 8 : 7} align="center" sx={{ py: 6 }}><CircularProgress size={32} /></TableCell></TableRow>
              ) : paginatedOrders.length === 0 ? (
                <TableRow><TableCell colSpan={canDelete ? 8 : 7} align="center" sx={{ py: 6 }}>
                  <ReceiptIcon sx={{ fontSize: 48, color: COLORS.text.tertiary, mb: 1 }} />
                  <Typography>No orders found</Typography>
                </TableCell></TableRow>
              ) : (
                paginatedOrders.map((order) => {
                  const isSelected = selected.includes(order._id);
                  const isActionMenuOpen = Boolean(actionMenuAnchor) && selectedOrderForMenu?._id === order._id;
                  const avatarColor = getAvatarColor(order);
                  return (
                    <TableRow key={order._id} hover selected={isSelected}
                      sx={{ '&.Mui-selected': { bgcolor: `${COLORS.primary}10` } }}>
                      {canDelete && (
                        <TableCell padding="checkbox" sx={{ width: 40 }}>
                          <Checkbox checked={isSelected} onChange={() => handleSelect(order._id)} sx={{ color: COLORS.primary }} />
                        </TableCell>
                      )}
                      <TableCell>
                        <Stack direction="row" spacing={1.5} alignItems="center">
                          <Avatar sx={{ width: 32, height: 32, bgcolor: avatarColor, fontSize: '0.7rem', fontWeight: 600 }}>{getOrderInitials(order)}</Avatar>
                          <Box>
                            <Typography sx={{ fontSize: '0.75rem', fontWeight: 600 }}>{order.so_number}</Typography>
                            <Typography sx={{ fontSize: '0.65rem', color: COLORS.text.tertiary }}>{order.customer_name}</Typography>
                          </Box>
                        </Stack>
                      </TableCell>
                      <TableCell>
                        <Typography sx={{ fontSize: '0.75rem' }}>PO: {order.customer_po_number || '-'}</Typography>
                        <Typography sx={{ fontSize: '0.65rem', color: COLORS.text.tertiary }}>QT: {order.quotation_no || '-'}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography sx={{ fontSize: '0.75rem' }}>{formatDate(order.so_date)}</Typography>
                        <Typography sx={{ fontSize: '0.65rem', color: COLORS.text.tertiary }}>Items: {order.items?.length || 0}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color: COLORS.primary }}>{formatCurrency(order.grand_total, order.currency)}</Typography>
                      </TableCell>
                      <TableCell><StatusChip status={order.status} /></TableCell>
                      <TableCell>
                        <Typography sx={{ fontSize: '0.7rem' }}>{order.delivery_mode || '-'}</Typography>
                        <Typography sx={{ fontSize: '0.65rem', color: COLORS.text.tertiary }}>EDD: {formatDate(order.expected_delivery_date)}</Typography>
                      </TableCell>
                      <TableCell align="center" sx={{ width: 60 }}>
                        <ActionMenu order={order} anchorEl={isActionMenuOpen ? actionMenuAnchor : null}
                          onOpen={(e) => handleActionMenuOpen(e, order)} onClose={handleActionMenuClose}
                          onView={openViewOrderModal} onDelete={handleSingleDelete}
                          permissions={userPermissions} isSuperAdmin={isSuperAdmin} />
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination rowsPerPageOptions={[5, 10, 25, 50]} component="div" count={totalItems}
          rowsPerPage={rowsPerPage} page={page} onPageChange={handleChangePage} onRowsPerPageChange={handleChangeRowsPerPage}
          sx={{ borderTop: `1px solid ${COLORS.border}` }} />
      </Paper>

      <ViewOrderModal open={openViewModal} onClose={() => { setOpenViewModal(false); setSelectedOrder(null); }}
        order={selectedOrder} permissions={userPermissions} isSuperAdmin={isSuperAdmin} onDispatchSuccess={fetchOrders} />

      <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
        <Alert severity={snackbar.severity} variant="filled" sx={{ borderRadius: 1.5, fontSize: '0.75rem' }}>{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
};

export default OrderBook;