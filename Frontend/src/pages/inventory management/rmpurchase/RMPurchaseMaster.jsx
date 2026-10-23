// pages/inventory management/rmpurchase/RMPurchaseMaster.jsx
// Purchase Raw Material - list page (Warehouse Master jaisa look)
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import {
  Menu, MenuItem, ListItemIcon, ListItemText, Divider, Typography, Tooltip, IconButton,
  Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button, Snackbar, Alert,
  TablePagination, CircularProgress
} from '@mui/material';
import {
  MoreVert as MoreVertIcon, Visibility as ViewIcon, Edit as EditIcon, Delete as DeleteIcon,
  Close as CloseIcon, Inventory2 as EmptyIcon
} from '@mui/icons-material';
import { Plus, Search, RefreshCw } from 'lucide-react';
import BASE_URL from '../../../config/Config';

// Warehouse Master wale same colors
const COLORS = {
  primary: '#063C3F', primaryDark: '#05292B', primaryLight: '#E8F0F1',
  text: '#151C26', secondary: '#4B5568', tertiary: '#94A3B8',
  border: '#E3E8EF', hover: '#F0FDF9', inputBg: '#F8FFFC'
};

// Warehouse Master (MUI) wala same font
const PAGE_FONT = '"Roboto","Helvetica","Arial",sans-serif';

const authHeaders = () => ({ Authorization: `Bearer ${localStorage.getItem('token')}` });
const fmtDate = (d) => (d ? new Date(d).toLocaleDateString('en-GB') : '-');
const initials = (name = '') =>
  name.trim().split(/\s+/).slice(0, 2).map((w) => w[0]).join('').toUpperCase() || 'RM';

// Existing / New ke chip colors (Warehouse ke type chips jaise)
const TYPE_CHIP = {
  Existing: { bg: '#D1FAE5', color: '#059669' },
  New: { bg: '#FEF3C7', color: '#D97706' }
};

const RMPurchaseMaster = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0); // MUI 0-based, API 1-based
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');

  const [menuAnchor, setMenuAnchor] = useState(null);
  const [menuItem, setMenuItem] = useState(null);
  const [viewEntry, setViewEntry] = useState(null);
  const [deleteEntry, setDeleteEntry] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [snack, setSnack] = useState({ open: false, message: '', severity: 'success' });

  const notify = (message, severity = 'success') => setSnack({ open: true, message, severity });

  // Add/Edit page se wapas aane par success message dikhao
  useEffect(() => {
    if (location.state?.toast) {
      notify(location.state.toast);
      window.history.replaceState({}, document.title); // refresh par dobara na dikhe
    }
  }, [location.state]);

  // Search: type rukne ke 400ms baad hi API call
  useEffect(() => {
    const t = setTimeout(() => { setSearch(searchInput.trim()); setPage(0); }, 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${BASE_URL}/api/rm-purchase`, {
        headers: authHeaders(),
        params: { page: page + 1, limit: rowsPerPage, search: search || undefined }
      });
      setData(res.data.data || []);
      setTotal(res.data.pagination?.total || 0);
    } catch (error) {
      console.error('Error fetching data:', error);
      notify(error.response?.data?.message || 'Failed to load purchases', 'error');
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, search]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const openMenu = (e, item) => { setMenuAnchor(e.currentTarget); setMenuItem(item); };
  const closeMenu = () => setMenuAnchor(null);

  const confirmDelete = async () => {
    try {
      setDeleting(true);
      await axios.delete(`${BASE_URL}/api/rm-purchase/${deleteEntry._id}`, { headers: authHeaders() });
      notify(`${deleteEntry.ref_no} deleted`);
      setDeleteEntry(null);
      if (data.length === 1 && page > 0) setPage(page - 1); else fetchData();
    } catch (error) {
      notify(error.response?.data?.message || 'Failed to delete', 'error');
    } finally {
      setDeleting(false);
    }
  };

  const th = 'py-3 px-4 text-left text-[0.7rem] font-semibold tracking-[0.5px] whitespace-nowrap';
  const td = 'py-2 px-4 text-[0.75rem]';

  return (
    <div className="p-5" style={{ fontFamily: PAGE_FONT }}>
      {/* Page Header */}
      <div className="mb-5">
        <h1 className="text-[1.25rem] font-bold text-[#151C26] mb-0.5">Purchase Raw Material</h1>
        <p className="text-[0.75rem] text-[#4B5568]">Manage raw material purchases, vendors, and invoices</p>
      </div>

      {/* Action Bar */}
      <div className="p-3 mb-5 rounded-lg bg-white border border-[#E3E8EF] shadow-[0_1px_3px_0_rgba(0,0,0,0.05)] flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-[450px]">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
          <input
            type="text"
            autoComplete="off"
            placeholder="Search by Ref No, Name, Code, Party or Invoice..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full h-9 pl-9 pr-8 rounded-md border border-[#C4C4C4] bg-[#F8FFFC] text-[0.75rem] text-[#151C26] placeholder:text-[#94A3B8] outline-none hover:border-[#063C3F] focus:border-[#063C3F] focus:ring-1 focus:ring-[#063C3F]"
          />
          {searchInput && (
            <button onClick={() => setSearchInput('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-[#4B5568]">
              <CloseIcon sx={{ fontSize: '1rem' }} />
            </button>
          )}
        </div>

        <div className="flex items-center gap-3">
          <Tooltip title="Refresh">
            <span>
              <IconButton size="small" onClick={fetchData} disabled={loading}
                sx={{ color: COLORS.secondary, '&:hover': { bgcolor: `${COLORS.primary}20` } }}>
                <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
              </IconButton>
            </span>
          </Tooltip>
          <button
            onClick={() => navigate('/inventorymanagement/rmpurchase/add')}
            className="h-9 px-4 rounded-md bg-[#063C3F] hover:bg-[#05292B] text-white text-[0.75rem] font-medium shadow-[0_1px_3px_0_rgba(0,0,0,0.1)] flex items-center gap-2 transition"
          >
            <Plus size={16} /> Add Purchase
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="w-full rounded-lg overflow-hidden bg-white border border-[#E3E8EF] shadow-[0_1px_3px_0_rgba(0,0,0,0.05)]">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead className="bg-[#063C3F] text-white">
              <tr>
                <th className={th}>Ref No</th>
                <th className={th}>Date</th>
                <th className={th}>RM Type</th>
                <th className={th}>Name / Code</th>
                <th className={th}>Quantity</th>
                <th className={th}>Party Name</th>
                <th className={th}>Invoice No</th>
                <th className={`${th} text-center w-[60px]`}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center">
                    <CircularProgress size={32} sx={{ color: COLORS.primary }} />
                    <div className="text-[0.75rem] mt-2">Loading purchases...</div>
                  </td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center">
                    <EmptyIcon sx={{ fontSize: 48, color: COLORS.tertiary }} />
                    <div className="text-[0.875rem] text-[#4B5568]">
                      {search ? 'No purchases found' : 'No purchases available'}
                    </div>
                  </td>
                </tr>
              ) : (
                data.map((item) => {
                  const chip = TYPE_CHIP[item.rm_type] || TYPE_CHIP.New;
                  return (
                    <tr key={item._id} className="border-b border-[#E3E8EF] hover:bg-[#F0FDF9]">
                      <td className={`${td} font-semibold text-[#063C3F]`}>{item.ref_no}</td>
                      <td className={td}>{fmtDate(item.purchase_date)}</td>
                      <td className={td}>
                        <span
                          className="inline-flex items-center h-6 px-2.5 rounded-full text-[0.65rem] font-medium"
                          style={{ backgroundColor: chip.bg, color: chip.color }}
                        >
                          {item.rm_type}
                        </span>
                      </td>
                      <td className={td}>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-[#063C3F] text-white text-[0.7rem] font-semibold flex items-center justify-center shrink-0">
                            {initials(item.name)}
                          </div>
                          <div>
                            <div className="text-[0.75rem] font-semibold">{item.name}</div>
                            <div className="text-[0.65rem] text-[#94A3B8]">Code: {item.code}</div>
                          </div>
                        </div>
                      </td>
                      <td className={`${td} font-medium`}>{item.quantity} <span className="text-[#94A3B8]">{item.unit}</span></td>
                      <td className={td}>{item.party_name}</td>
                      <td className={td}>{item.invoice_no}</td>
                      <td className={`${td} text-center`}>
                        <Tooltip title="Actions">
                          <IconButton size="small" onClick={(e) => openMenu(e, item)}
                            sx={{ color: COLORS.secondary, '&:hover': { bgcolor: `${COLORS.primary}20` } }}>
                            <MoreVertIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50]}
          component="div"
          count={total}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={(_, p) => setPage(p)}
          onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
          sx={{
            borderTop: `1px solid ${COLORS.border}`,
            '& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows': {
              fontSize: '0.7rem', color: COLORS.secondary
            }
          }}
        />
      </div>

      {/* Row Action Menu (Warehouse Master jaisa) */}
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={closeMenu}
        slotProps={{ paper: { elevation: 3, sx: { mt: 1, minWidth: 180, borderRadius: 2, border: `1px solid ${COLORS.border}` } } }}
      >
        <MenuItem onClick={() => { setViewEntry(menuItem); closeMenu(); }} sx={{ py: 1.5 }}>
          <ListItemIcon sx={{ color: COLORS.primary, minWidth: 36 }}><ViewIcon fontSize="small" /></ListItemIcon>
          <ListItemText><Typography sx={{ fontSize: '0.75rem', fontWeight: 500, color: COLORS.text }}>View Details</Typography></ListItemText>
        </MenuItem>
        <MenuItem onClick={() => { navigate(`/inventorymanagement/rmpurchase/add?id=${menuItem._id}`); closeMenu(); }} sx={{ py: 1.5 }}>
          <ListItemIcon sx={{ color: COLORS.primary, minWidth: 36 }}><EditIcon fontSize="small" /></ListItemIcon>
          <ListItemText><Typography sx={{ fontSize: '0.75rem', fontWeight: 500, color: COLORS.text }}>Edit</Typography></ListItemText>
        </MenuItem>
        <Divider sx={{ my: 0.5 }} />
        <MenuItem onClick={() => { setDeleteEntry(menuItem); closeMenu(); }} sx={{ py: 1.5 }}>
          <ListItemIcon sx={{ color: '#EF4444', minWidth: 36 }}><DeleteIcon fontSize="small" /></ListItemIcon>
          <ListItemText><Typography sx={{ fontSize: '0.75rem', fontWeight: 500, color: '#EF4444' }}>Delete</Typography></ListItemText>
        </MenuItem>
      </Menu>

      {/* View Details */}
      <Dialog open={Boolean(viewEntry)} onClose={() => setViewEntry(null)} fullWidth maxWidth="xs"
        slotProps={{ paper: { sx: { borderRadius: 2 } } }}>
        <DialogTitle sx={{ bgcolor: COLORS.primary, color: '#fff', fontSize: '1rem', fontWeight: 700, py: 1.5 }}>
          Purchase Details
        </DialogTitle>
        <DialogContent sx={{ pt: 2, fontFamily: PAGE_FONT }}>
          {viewEntry && [
            ['Ref No', viewEntry.ref_no],
            ['Date', fmtDate(viewEntry.purchase_date)],
            ['RM Type', viewEntry.rm_type],
            ['Material Name', viewEntry.name],
            ['Material Code', viewEntry.code],
            ['Quantity', `${viewEntry.quantity} ${viewEntry.unit}`],
            ['Party Name', viewEntry.party_name],
            ['Invoice No', viewEntry.invoice_no]
          ].map(([label, value]) => (
            <div key={label} className="flex justify-between py-2 border-b border-[#E3E8EF] text-[0.75rem]">
              <span className="text-[#4B5568]">{label}</span>
              <span className="font-semibold text-[#151C26]">{value}</span>
            </div>
          ))}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setViewEntry(null)} sx={{ textTransform: 'none', color: COLORS.secondary }}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Delete confirm */}
      <Dialog open={Boolean(deleteEntry)} onClose={() => !deleting && setDeleteEntry(null)}>
        <DialogTitle sx={{ fontSize: '1rem', fontWeight: 700 }}>Delete purchase entry?</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ fontSize: '0.8rem' }}>
            {deleteEntry ? `${deleteEntry.ref_no} (${deleteEntry.name}, ${deleteEntry.quantity} ${deleteEntry.unit}) will be permanently deleted.` : ''}
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDeleteEntry(null)} disabled={deleting} sx={{ textTransform: 'none', color: COLORS.secondary }}>Cancel</Button>
          <Button onClick={confirmDelete} disabled={deleting} variant="contained" color="error" sx={{ textTransform: 'none' }}>
            {deleting ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snack.open} autoHideDuration={4000}
        onClose={() => setSnack((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert severity={snack.severity} variant="filled" onClose={() => setSnack((s) => ({ ...s, open: false }))}>
          {snack.message}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default RMPurchaseMaster;