import React, { useState, useEffect, useRef } from 'react';
import { 
  Box, Button, TextField, MenuItem, Typography, Paper, 
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Snackbar, Alert, CircularProgress, Grid, IconButton,
  Dialog, DialogTitle, DialogContent, DialogActions,
  Menu, ListItemIcon, ListItemText, Divider
} from '@mui/material';
import { 
  Save as SaveIcon, Receipt as ReceiptIcon, 
  Edit as EditIcon, Delete as DeleteIcon, Visibility as ViewIcon,
  Close as CloseIcon, Warning as WarningIcon, MoreVert as MoreVertIcon,
  Print as PrintIcon
} from '@mui/icons-material';
import axios from 'axios';
import BASE_URL from '../../config/Config';

const COLORS = {
  primary: '#063C3F',
  primaryDark: '#05292B',
  background: '#F8FFFC',
  border: '#E3E8EF',
  textPrimary: '#151C26',
  textSecondary: '#4B5568',
  error: '#DC2626'
};

// ==================== PRINT SLIP COMPONENT (UPDATED WITH CSS) ====================
const PrintPRMSlip = ({ open, onClose, prmData }) => {
  const [toUser, setToUser] = useState('');
  const [department, setDepartment] = useState('');
  const printRef = useRef();

  if (!prmData) return null;

  const handlePrint = () => {
    const printContent = printRef.current;
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Material Issue Slip - ${prmData.refNumber}</title>
          <style>
            body { font-family: 'Segoe UI', Arial, sans-serif; padding: 30px; color: #000; }
            .header { text-align: center; border-bottom: 3px solid #063C3F; padding-bottom: 15px; margin-bottom: 25px; }
            .header h1 { margin: 0; text-transform: uppercase; color: #063C3F; font-size: 24px; }
            .header h3 { margin: 5px 0 0 0; font-size: 16px; letter-spacing: 1px; }
            .info-grid { display: flex; justify-content: space-between; margin-bottom: 30px; }
            .info-col { width: 45%; }
            .info-col p { margin: 8px 0; font-size: 14px; }
            table { width: 100%; border-collapse: collapse; margin-top: 10px; }
            th, td { border: 1px solid #333; padding: 10px; text-align: left; font-size: 14px; }
            th { background-color: #063C3F; color: white; }
            .signatures { display: flex; justify-content: space-between; margin-top: 80px; }
            .signatures div { border-top: 1px solid #000; width: 200px; text-align: center; padding-top: 8px; font-size: 14px; font-weight: bold;}
          </style>
        </head>
        <body>
          ${printContent.innerHTML}
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => { printWindow.print(); printWindow.close(); }, 500);
  };

  // Inline CSS for the Modal Preview
  const tableStyle = { width: '100%', borderCollapse: 'collapse', marginTop: '10px' };
  const thStyle = { border: '1px solid #333', padding: '10px', textAlign: 'left', fontSize: '14px', backgroundColor: COLORS.primary, color: 'white' };
  const tdStyle = { border: '1px solid #333', padding: '10px', textAlign: 'left', fontSize: '14px' };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ bgcolor: COLORS.primary, color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6">Generate Material Issue Slip</Typography>
        <IconButton onClick={onClose} sx={{ color: 'white' }}><CloseIcon /></IconButton>
      </DialogTitle>
      
      <DialogContent sx={{ p: 3, bgcolor: '#f9f9f9' }}>
        {/* Input Fields for TO and Dept */}
        <Grid container spacing={2} sx={{ mb: 3, bgcolor: 'white', p: 2, borderRadius: 2, border: `1px solid ${COLORS.border}` }}>
          <Grid item xs={12} sm={6}>
            <TextField 
              fullWidth size="small" label="TO (Username / Person)" 
              value={toUser} onChange={(e) => setToUser(e.target.value)} 
              placeholder="Enter receiver name"
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField 
              fullWidth size="small" label="Dept (Department)" 
              value={department} onChange={(e) => setDepartment(e.target.value)} 
              placeholder="Enter department"
            />
          </Grid>
        </Grid>

        {/* Printable Area with Inline CSS */}
        <Box ref={printRef} sx={{ bgcolor: 'white', p: 4, border: `1px solid ${COLORS.border}`, borderRadius: 2 }}>
          <div className="header" style={{ textAlign: 'center', borderBottom: `3px solid ${COLORS.primary}`, paddingBottom: '15px', marginBottom: '25px' }}>
            <h1 style={{ margin: 0, textTransform: 'uppercase', color: COLORS.primary, fontSize: '24px' }}>SUYASH ENTERPRISES</h1>
            <h3 style={{ margin: '5px 0 0 0', fontSize: '16px', letterSpacing: '1px' }}>MATERIAL ISSUE SLIP</h3>
          </div>

          <div className="info-grid" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '30px' }}>
            <div className="info-col" style={{ width: '45%' }}>
              <p style={{ margin: '8px 0', fontSize: '14px' }}><strong>Date:</strong> {new Date(prmData.date).toLocaleDateString()}</p>
              <p style={{ margin: '8px 0', fontSize: '14px' }}><strong>Ref No:</strong> {prmData.refNumber || 'Auto-Generated'}</p>
              <p style={{ margin: '8px 0', fontSize: '14px' }}><strong>Invoice No:</strong> {prmData.invoiceNo}</p>
              <p style={{ margin: '8px 0', fontSize: '14px' }}><strong>Party Name:</strong> {prmData.partyName}</p>
            </div>
            <div className="info-col" style={{ width: '45%' }}>
              <p style={{ margin: '8px 0', fontSize: '14px' }}><strong>TO:</strong> {toUser ? toUser : '____________________'}</p>
              <p style={{ margin: '8px 0', fontSize: '14px' }}><strong>Dept:</strong> {department ? department : '____________________'}</p>
              <p style={{ margin: '8px 0', fontSize: '14px' }}><strong>RM Type:</strong> {prmData.rmType}</p>
            </div>
          </div>

          <table style={tableStyle}>
            <thead>
              <tr>
                <th style={thStyle}>Material Name</th>
                <th style={thStyle}>Material Code</th>
                <th style={thStyle}>Quantity</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={tdStyle}>{prmData.name}</td>
                <td style={tdStyle}>{prmData.code}</td>
                <td style={tdStyle}>{prmData.quantity}</td>
              </tr>
            </tbody>
          </table>

          <div className="signatures" style={{ display: 'flex', justifyContent: 'space-between', marginTop: '80px' }}>
            <div style={{ borderTop: '1px solid #000', width: '200px', textAlign: 'center', paddingTop: '8px', fontSize: '14px', fontWeight: 'bold' }}>Issued By</div>
            <div style={{ borderTop: '1px solid #000', width: '200px', textAlign: 'center', paddingTop: '8px', fontSize: '14px', fontWeight: 'bold' }}>Received By (TO)</div>
          </div>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 2, bgcolor: '#f9f9f9' }}>
        <Button onClick={onClose} color="inherit">Cancel</Button>
        <Button onClick={handlePrint} variant="contained" startIcon={<PrintIcon />} sx={{ bgcolor: COLORS.primary, '&:hover': { bgcolor: COLORS.primaryDark } }}>
          Print Slip
        </Button>
      </DialogActions>
    </Dialog>
  );
};
// ==================== MAIN COMPONENT ====================

const PurchaseRawMaterial = () => {
  const [formData, setFormData] = useState({
    name: '', code: '', quantity: '', partyName: '', rmType: 'Existing', invoiceNo: ''
  });
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Modal States
  const [openViewModal, setOpenViewModal] = useState(false);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [openPrintModal, setOpenPrintModal] = useState(false);
  
  // 3-Dot Menu State
  const [anchorEl, setAnchorEl] = useState(null);
  const isMenuOpen = Boolean(anchorEl);

  const [selectedRow, setSelectedRow] = useState(null);
  const [editFormData, setEditFormData] = useState({});

  // Fetch data from backend
  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${BASE_URL}/api/inventory/purchase`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPurchases(res.data.data);
    } catch (err) { 
      showNotification('Failed to load data', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleEditChange = (e) => {
    setEditFormData({ ...editFormData, [e.target.name]: e.target.value });
  };

  // 1. CREATE (Save Form)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${BASE_URL}/api/inventory/purchase`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      showNotification('Purchase Saved Successfully!', 'success');
      setFormData({ name: '', code: '', quantity: '', partyName: '', rmType: 'Existing', invoiceNo: '' }); 
      fetchData();
    } catch (error) { 
      showNotification('Error saving data', 'error'); 
    } finally {
      setLoading(false);
    }
  };

  // 2. UPDATE (Edit Modal se save karna)
  const handleUpdateSubmit = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${BASE_URL}/api/inventory/purchase/${editFormData._id}`, editFormData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      showNotification('Purchase Updated Successfully!', 'success');
      setOpenEditModal(false);
      fetchData();
    } catch (error) { 
      showNotification('Error updating data', 'error'); 
    } finally {
      setLoading(false);
    }
  };

  // 3. DELETE (Delete Modal se delete karna)
  const handleDeleteSubmit = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${BASE_URL}/api/inventory/purchase/${selectedRow._id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      showNotification('Purchase Deleted Successfully!', 'success');
      setOpenDeleteModal(false);
      fetchData();
    } catch (error) { 
      showNotification('Error deleting data', 'error'); 
    } finally {
      setLoading(false);
    }
  };

  // Menu Handlers
  const handleMenuClick = (event, row) => {
    setAnchorEl(event.currentTarget);
    setSelectedRow(row);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  // Action Handlers (Menu se trigger honge)
  const handleView = () => { setOpenViewModal(true); handleMenuClose(); };
  const handleEdit = () => { setEditFormData(selectedRow); setOpenEditModal(true); handleMenuClose(); };
  const handleDelete = () => { setOpenDeleteModal(true); handleMenuClose(); };
  const handlePrint = () => { setOpenPrintModal(true); handleMenuClose(); };

  const showNotification = (message, severity) => {
    setSnackbar({ open: true, message, severity });
  };

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, bgcolor: COLORS.background, minHeight: '100vh' }}>
      <Typography variant="h5" sx={{ fontWeight: 700, color: COLORS.primary, mb: 3 }}>
        Purchase Raw Material
      </Typography>
      
      {/* FORM SECTION */}
      <Paper sx={{ p: 3, mb: 4, borderRadius: 2, border: `1px solid ${COLORS.border}` }}>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={4}>
              <TextField fullWidth size="small" label="Reference No" value="Auto-Generated" disabled InputProps={{ startAdornment: <ReceiptIcon sx={{ color: COLORS.textSecondary, mr: 1 }} /> }} sx={{ bgcolor: '#F5F5F5' }} />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <TextField fullWidth size="small" label="Material Name *" name="name" value={formData.name} onChange={handleChange} required />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <TextField fullWidth size="small" label="Material Code *" name="code" value={formData.code} onChange={handleChange} required />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <TextField fullWidth size="small" label="Quantity *" name="quantity" type="number" value={formData.quantity} onChange={handleChange} required />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <TextField fullWidth size="small" label="Party Name *" name="partyName" value={formData.partyName} onChange={handleChange} required />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <TextField fullWidth size="small" label="Invoice No. *" name="invoiceNo" value={formData.invoiceNo} onChange={handleChange} required />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <TextField select fullWidth size="small" label="RM Type" name="rmType" value={formData.rmType} onChange={handleChange}>
                <MenuItem value="Existing">Existing</MenuItem>
                <MenuItem value="New">New</MenuItem>
              </TextField>
            </Grid>
          </Grid>
          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
            <Button type="submit" variant="contained" startIcon={<SaveIcon />} disabled={loading} sx={{ bgcolor: COLORS.primary, '&:hover': { bgcolor: COLORS.primaryDark } }}>
              Save Purchase
            </Button>
          </Box>
        </form>
      </Paper>

      {/* TABLE SECTION */}
      <Paper sx={{ borderRadius: 2, overflow: 'hidden', border: `1px solid ${COLORS.border}` }}>
        <TableContainer sx={{ maxHeight: 440 }}>
          <Table stickyHeader size="small">
            <TableHead>
              <TableRow>
                {['Ref No', 'Date', 'Name', 'Code', 'Party Name', 'Qty', 'Invoice No', 'RM Type', 'Actions'].map((head) => (
                  <TableCell key={head} sx={{ bgcolor: COLORS.primary, color: 'white', fontWeight: 600, fontSize: '0.75rem', whiteSpace: 'nowrap' }}>
                    {head}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {loading && purchases.length === 0 ? (
                <TableRow><TableCell colSpan={9} align="center" sx={{ py: 3 }}><CircularProgress size={24} /></TableCell></TableRow>
              ) : purchases.length === 0 ? (
                <TableRow><TableCell colSpan={9} align="center" sx={{ py: 4 }}>No records found.</TableCell></TableRow>
              ) : (
                purchases.map((row) => (
                  <TableRow key={row._id} hover>
                    <TableCell sx={{ fontSize: '0.75rem', fontWeight: 600, color: COLORS.primary }}>{row.refNumber}</TableCell>
                    <TableCell sx={{ fontSize: '0.75rem' }}>{new Date(row.date).toLocaleDateString()}</TableCell>
                    <TableCell sx={{ fontSize: '0.75rem' }}>{row.name}</TableCell>
                    <TableCell sx={{ fontSize: '0.75rem' }}>{row.code}</TableCell>
                    <TableCell sx={{ fontSize: '0.75rem' }}>{row.partyName}</TableCell>
                    <TableCell sx={{ fontSize: '0.75rem', fontWeight: 600 }}>{row.quantity}</TableCell>
                    <TableCell sx={{ fontSize: '0.75rem' }}>{row.invoiceNo}</TableCell>
                    <TableCell sx={{ fontSize: '0.75rem' }}>
                      <span style={{ padding: '2px 8px', borderRadius: '4px', fontSize: '0.7rem', backgroundColor: row.rmType === 'New' ? '#E8F0F1' : '#F5F5F5', color: row.rmType === 'New' ? COLORS.primary : COLORS.textSecondary }}>
                        {row.rmType}
                      </span>
                    </TableCell>
                    
                    {/* 3-DOT MENU BUTTON */}
                    <TableCell align="center" sx={{ whiteSpace: 'nowrap' }}>
                      <IconButton size="small" onClick={(e) => handleMenuClick(e, row)}>
                        <MoreVertIcon fontSize="small" sx={{ color: COLORS.textSecondary }} />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* 3-DOT DROPDOWN MENU */}
      <Menu
        anchorEl={anchorEl}
        open={isMenuOpen}
        onClose={handleMenuClose}
        PaperProps={{
          elevation: 3,
          sx: {
            mt: 1,
            minWidth: 160,
            borderRadius: 1.5,
            border: `1px solid ${COLORS.border}`,
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
          }
        }}
      >
        <MenuItem onClick={handleView} sx={{ py: 1 }}>
          <ListItemIcon sx={{ color: '#3B82F6', minWidth: 32 }}>
            <ViewIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>
            <Typography variant="body2" sx={{ fontSize: '0.75rem', fontWeight: 500 }}>View Details</Typography>
          </ListItemText>
        </MenuItem>

        <MenuItem onClick={handleEdit} sx={{ py: 1 }}>
          <ListItemIcon sx={{ color: '#F59E0B', minWidth: 32 }}>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>
            <Typography variant="body2" sx={{ fontSize: '0.75rem', fontWeight: 500 }}>Edit</Typography>
          </ListItemText>
        </MenuItem>

        {/* PRINT OPTION */}
        <MenuItem onClick={handlePrint} sx={{ py: 1 }}>
          <ListItemIcon sx={{ color: COLORS.primary, minWidth: 32 }}>
            <PrintIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>
            <Typography variant="body2" sx={{ fontSize: '0.75rem', fontWeight: 500 }}>Print Slip</Typography>
          </ListItemText>
        </MenuItem>

        <Divider sx={{ my: 0.5 }} />

        <MenuItem onClick={handleDelete} sx={{ py: 1 }}>
          <ListItemIcon sx={{ color: COLORS.error, minWidth: 32 }}>
            <DeleteIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>
            <Typography variant="body2" sx={{ fontSize: '0.75rem', fontWeight: 500, color: COLORS.error }}>Delete</Typography>
          </ListItemText>
        </MenuItem>
      </Menu>

      {/* ================= MODALS ================= */}

      {/* 1. VIEW DETAILS MODAL */}
      <Dialog open={openViewModal} onClose={() => setOpenViewModal(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ bgcolor: COLORS.primary, color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          View Purchase Details
          <IconButton onClick={() => setOpenViewModal(false)} sx={{ color: 'white' }}><CloseIcon /></IconButton>
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          {selectedRow && (
            <Grid container spacing={2}>
              <Grid item xs={6}><Typography variant="caption" color="textSecondary">Ref No</Typography><Typography fontWeight="bold">{selectedRow.refNumber}</Typography></Grid>
              <Grid item xs={6}><Typography variant="caption" color="textSecondary">Date</Typography><Typography>{new Date(selectedRow.date).toLocaleDateString()}</Typography></Grid>
              <Grid item xs={6}><Typography variant="caption" color="textSecondary">Material Name</Typography><Typography>{selectedRow.name}</Typography></Grid>
              <Grid item xs={6}><Typography variant="caption" color="textSecondary">Material Code</Typography><Typography>{selectedRow.code}</Typography></Grid>
              <Grid item xs={6}><Typography variant="caption" color="textSecondary">Quantity</Typography><Typography>{selectedRow.quantity}</Typography></Grid>
              <Grid item xs={6}><Typography variant="caption" color="textSecondary">RM Type</Typography><Typography>{selectedRow.rmType}</Typography></Grid>
              <Grid item xs={6}><Typography variant="caption" color="textSecondary">Party Name</Typography><Typography>{selectedRow.partyName}</Typography></Grid>
              <Grid item xs={6}><Typography variant="caption" color="textSecondary">Invoice No</Typography><Typography>{selectedRow.invoiceNo}</Typography></Grid>
            </Grid>
          )}
        </DialogContent>
      </Dialog>

      {/* 2. EDIT MODAL */}
      <Dialog open={openEditModal} onClose={() => setOpenEditModal(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ bgcolor: '#F59E0B', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          Edit Purchase Record
          <IconButton onClick={() => setOpenEditModal(false)} sx={{ color: 'white' }}><CloseIcon /></IconButton>
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          {editFormData && (
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}><TextField fullWidth size="small" label="Material Name" name="name" value={editFormData.name || ''} onChange={handleEditChange} /></Grid>
              <Grid item xs={12} sm={6}><TextField fullWidth size="small" label="Material Code" name="code" value={editFormData.code || ''} onChange={handleEditChange} /></Grid>
              <Grid item xs={12} sm={6}><TextField fullWidth size="small" label="Quantity" name="quantity" type="number" value={editFormData.quantity || ''} onChange={handleEditChange} /></Grid>
              <Grid item xs={12} sm={6}><TextField fullWidth size="small" label="Party Name" name="partyName" value={editFormData.partyName || ''} onChange={handleEditChange} /></Grid>
              <Grid item xs={12} sm={6}><TextField fullWidth size="small" label="Invoice No" name="invoiceNo" value={editFormData.invoiceNo || ''} onChange={handleEditChange} /></Grid>
              <Grid item xs={12} sm={6}>
                <TextField select fullWidth size="small" label="RM Type" name="rmType" value={editFormData.rmType || 'Existing'} onChange={handleEditChange}>
                  <MenuItem value="Existing">Existing</MenuItem>
                  <MenuItem value="New">New</MenuItem>
                </TextField>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpenEditModal(false)} color="inherit">Cancel</Button>
          <Button onClick={handleUpdateSubmit} variant="contained" sx={{ bgcolor: '#F59E0B', '&:hover': { bgcolor: '#D97706' } }} disabled={loading}>
            {loading ? <CircularProgress size={20} color="inherit" /> : 'Update Record'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* 3. DELETE CONFIRMATION MODAL */}
      <Dialog open={openDeleteModal} onClose={() => setOpenDeleteModal(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ color: COLORS.error, display: 'flex', alignItems: 'center', gap: 1 }}>
          <WarningIcon /> Confirm Delete
        </DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete the purchase record for <b>{selectedRow?.name}</b>? This action cannot be undone.</Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpenDeleteModal(false)} color="inherit">Cancel</Button>
          <Button onClick={handleDeleteSubmit} variant="contained" color="error" disabled={loading}>
            {loading ? <CircularProgress size={20} color="inherit" /> : 'Yes, Delete'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* 4. PRINT MATERIAL ISSUE SLIP MODAL */}
      <PrintPRMSlip 
        open={openPrintModal} 
        onClose={() => setOpenPrintModal(false)} 
        prmData={selectedRow} 
      />

      {/* SNACKBAR FOR NOTIFICATIONS */}
      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar({ ...snackbar, open: false })} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
        <Alert severity={snackbar.severity} variant="filled">{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
};

export default PurchaseRawMaterial;