// import React, { useState, useEffect } from 'react';
// import {
//   Box,
//   Paper,
//   Table,
//   TableBody,
//   TableCell,
//   TableContainer,
//   TableHead,
//   TableRow,
//   IconButton,
//   Button,
//   TextField,
//   InputAdornment,
//   Tooltip,
//   Typography,
//   Snackbar,
//   TablePagination,
//   Checkbox,
//   Stack,
//   Alert,
//   Chip,
//   Menu,
//   MenuItem,
//   ListItemIcon,
//   ListItemText,
//   Divider,
//   CircularProgress
// } from '@mui/material';
// import {
//   Search as SearchIcon,
//   Add as AddIcon,
//   Delete as DeleteIcon,
//   Edit as EditIcon,
//   Visibility as ViewIcon,
//   MoreVert as MoreVertIcon,
//   Refresh as RefreshIcon
// } from '@mui/icons-material';
// import axios from 'axios';
// import BASE_URL from '../../../config/Config';
// import { hasPermission, ACTIONS, MODULES, PAGES } from '../../../utils/modulePermissions';

// // Import Modal Components
// import AddContract from './AddContract';
// import EditContract from './EditContract';
// import ViewContract from './ViewContract';
// import DeleteContract from './DeleteContract';

// // Color constants
// const COLORS = {
//   primary: '#063C3F',
//   primaryLight: '#E8F0F1',
//   primaryDark: '#05292B',
//   text: {
//     primary: '#151C26',
//     secondary: '#4B5568',
//     tertiary: '#94A3B8',
//     light: '#FFFFFF',
//     lightMuted: 'rgba(255, 255, 255, 0.9)'
//   },
//   background: {
//     white: '#FFFFFF',
//     light: '#F8FFFC',
//     hover: '#F0FDF9',
//     tableHeader: '#063C3F'
//   },
//   border: '#E3E8EF',
//   chips: {
//     active: '#9FE2BF',
//     inactive: '#F1F5F9',
//     expired: '#FEF3C7',
//     terminated: '#FEE2E2'
//   }
// };

// // Loading state component
// const LoadingState = () => (
//   <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
//     <CircularProgress size={40} sx={{ color: COLORS.primary }} />
//   </Box>
// );

// // Access Denied component
// const AccessDenied = () => (
//   <Box sx={{ p: 4, textAlign: 'center' }}>
//     <Typography variant="h6" color="error" sx={{ mb: 2 }}>
//       Access Denied
//     </Typography>
//     <Typography variant="body2" color="text.secondary">
//       You don't have permission to view this page. Please contact your administrator.
//     </Typography>
//   </Box>
// );

// // Action Menu Component
// const ActionMenu = ({ contract, onView, onEdit, onDelete, anchorEl, onClose, onOpen, permissions }) => {
//   const canView = hasPermission(permissions, MODULES.CONTRACT_MASTER, PAGES.CONTRACT_MASTER, ACTIONS.VIEW);
//   const canUpdate = hasPermission(permissions, MODULES.CONTRACT_MASTER, PAGES.CONTRACT_MASTER, ACTIONS.UPDATE);
//   const canDelete = hasPermission(permissions, MODULES.CONTRACT_MASTER, PAGES.CONTRACT_MASTER, ACTIONS.DELETE);

//   if (!canView && !canUpdate && !canDelete) {
//     return null;
//   }

//   return (
//     <>
//       <Tooltip title="Actions">
//         <IconButton
//           size="small"
//           onClick={onOpen}
//           sx={{
//             color: COLORS.text.secondary,
//             '&:hover': {
//               bgcolor: `${COLORS.primary}20`
//             }
//           }}
//         >
//           <MoreVertIcon fontSize="small" />
//         </IconButton>
//       </Tooltip>
//       <Menu
//         anchorEl={anchorEl}
//         open={Boolean(anchorEl)}
//         onClose={onClose}
//         PaperProps={{
//           elevation: 3,
//           sx: {
//             mt: 1,
//             minWidth: 180,
//             borderRadius: 2,
//             border: `1px solid ${COLORS.border}`,
//             boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
//           }
//         }}
//       >
//         {canView && (
//           <MenuItem onClick={() => { onView(contract); onClose(); }} sx={{ py: 1.5 }}>
//             <ListItemIcon sx={{ color: COLORS.primary, minWidth: 36 }}>
//               <ViewIcon fontSize="small" />
//             </ListItemIcon>
//             <ListItemText>
//               <Typography variant="body2" fontWeight={500} sx={{ color: COLORS.text.primary, fontSize: '0.75rem' }}>
//                 View Details
//               </Typography>
//             </ListItemText>
//           </MenuItem>
//         )}

//         {canUpdate && (
//           <MenuItem onClick={() => { onEdit(contract); onClose(); }} sx={{ py: 1.5 }}>
//             <ListItemIcon sx={{ color: COLORS.primary, minWidth: 36 }}>
//               <EditIcon fontSize="small" />
//             </ListItemIcon>
//             <ListItemText>
//               <Typography variant="body2" fontWeight={500} sx={{ color: COLORS.text.primary, fontSize: '0.75rem' }}>
//                 Edit
//               </Typography>
//             </ListItemText>
//           </MenuItem>
//         )}

//         {(canView || canUpdate) && canDelete && <Divider sx={{ my: 0.5, borderColor: COLORS.border }} />}

//         {canDelete && (
//           <MenuItem onClick={() => { onDelete(contract); onClose(); }} sx={{ py: 1.5 }}>
//             <ListItemIcon sx={{ color: '#EF4444', minWidth: 36 }}>
//               <DeleteIcon fontSize="small" />
//             </ListItemIcon>
//             <ListItemText>
//               <Typography variant="body2" fontWeight={500} color="#EF4444" sx={{ fontSize: '0.75rem' }}>
//                 Delete
//               </Typography>
//             </ListItemText>
//           </MenuItem>
//         )}
//       </Menu>
//     </>
//   );
// };

// const ContractMaster = () => {
//   const [contracts, setContracts] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [searchTerm, setSearchTerm] = useState('');
//   const [totalCount, setTotalCount] = useState(0);
//   const [page, setPage] = useState(0);
//   const [rowsPerPage, setRowsPerPage] = useState(5);
//   const [selected, setSelected] = useState([]);
//   const [actionMenuAnchor, setActionMenuAnchor] = useState(null);
//   const [selectedContractForAction, setSelectedContractForAction] = useState(null);
//   const [openAddModal, setOpenAddModal] = useState(false);
//   const [openEditModal, setOpenEditModal] = useState(false);
//   const [openViewModal, setOpenViewModal] = useState(false);
//   const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
//   const [selectedContract, setSelectedContract] = useState(null);
//   const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
//   const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
//   const [userPermissions, setUserPermissions] = useState([]);
//   const [isSuperAdmin, setIsSuperAdmin] = useState(false);
//   const [permissionsLoaded, setPermissionsLoaded] = useState(false);

//   // Debounce search
//   useEffect(() => {
//     const timer = setTimeout(() => setDebouncedSearchTerm(searchTerm), 500);
//     return () => clearTimeout(timer);
//   }, [searchTerm]);

//   // Fetch user permissions
//   useEffect(() => {
//     const fetchUserPermissions = async () => {
//       try {
//         const token = localStorage.getItem('token');
//         const response = await axios.get(`${BASE_URL}/api/auth/me`, {
//           headers: { 'Authorization': `Bearer ${token}` }
//         });
//         if (response.data.success) {
//           const userData = response.data.data;
//           setIsSuperAdmin(userData.isSuperAdmin || false);
//           setUserPermissions(userData.permissions || []);
//         }
//       } catch (err) {
//         console.error('Error fetching user permissions:', err);
//       } finally {
//         setPermissionsLoaded(true);
//       }
//     };
//     fetchUserPermissions();
//   }, []);

//   // Check permission helper
//   const checkPermission = (action) => {
//     if (isSuperAdmin) return true;
//     return hasPermission(userPermissions, MODULES.CONTRACT_MASTER, PAGES.CONTRACT_MASTER, action);
//   };

//   const canViewPage = checkPermission(ACTIONS.VIEW);
//   const canCreate = checkPermission(ACTIONS.CREATE);
//   const canUpdate = checkPermission(ACTIONS.UPDATE);
//   const canDelete = checkPermission(ACTIONS.DELETE);

//   // Fetch agencies
//   const fetchContracts = async () => {
//     try {
//       setLoading(true);
//       const token = localStorage.getItem('token');
//       const params = new URLSearchParams();
//       params.append('page', page + 1);
//       params.append('limit', rowsPerPage);
//       if (debouncedSearchTerm) params.append('search', debouncedSearchTerm);

//       const response = await axios.get(`${BASE_URL}/api/contract-agencies?${params.toString()}`, {
//         headers: { Authorization: `Bearer ${token}` }
//       });

//       if (response.data.success) {
//         setContracts(response.data.data || []);
//         setTotalCount(response.data.pagination?.total || response.data.total || 0);
//       } else {
//         showNotification('Failed to load agencies', 'error');
//       }
//     } catch (err) {
//       console.error('Error fetching agencies:', err);
//       showNotification('Failed to load agencies', 'error');
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     if (permissionsLoaded && (canViewPage || isSuperAdmin)) {
//       fetchContracts();
//     }
//   }, [permissionsLoaded, canViewPage, isSuperAdmin, page, rowsPerPage, debouncedSearchTerm]);

//   // Handlers
//   const handleSearch = (event) => {
//     setSearchTerm(event.target.value);
//     setPage(0);
//     setSelected([]);
//   };

//   const handleRefresh = () => {
//     fetchContracts();
//     showNotification('Data refreshed', 'success');
//   };

//   const handleSelectAll = (event) => {
//     if (!canDelete) return;
//     if (event.target.checked) setSelected(contracts.map(c => c._id));
//     else setSelected([]);
//   };

//   const handleSelect = (id) => {
//     if (!canDelete) return;
//     setSelected(prev => prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]);
//   };

//   const handleChangePage = (event, newPage) => {
//     setPage(newPage);
//     setSelected([]);
//   };

//   const handleChangeRowsPerPage = (event) => {
//     setRowsPerPage(parseInt(event.target.value, 10));
//     setPage(0);
//     setSelected([]);
//   };

//   const handleActionMenuOpen = (event, contract) => {
//     setActionMenuAnchor(event.currentTarget);
//     setSelectedContractForAction(contract);
//   };

//   const handleActionMenuClose = () => {
//     setActionMenuAnchor(null);
//     setSelectedContractForAction(null);
//   };

//   const openAddContractModal = () => setOpenAddModal(true);
  
//   const openEditContractModal = (contract) => {
//     if (!canUpdate) return;
//     setSelectedContract(contract);
//     setOpenEditModal(true);
//     handleActionMenuClose();
//   };
  
//   const openViewContractModal = (contract) => {
//     if (!canViewPage) return;
//     setSelectedContract(contract);
//     setOpenViewModal(true);
//     handleActionMenuClose();
//   };
  
//   const openDeleteContractDialog = (contract) => {
//     if (!canDelete) return;
//     setSelectedContract(contract);
//     setOpenDeleteDialog(true);
//     handleActionMenuClose();
//   };

//   const handleAddContract = () => {
//     showNotification('Agency added successfully', 'success');
//     fetchContracts();
//     setOpenAddModal(false);
//   };

//   const handleUpdateContract = () => {
//     showNotification('Agency updated successfully', 'success');
//     setOpenEditModal(false);
//     setSelectedContract(null);
//     fetchContracts();
//   };

//   const handleDeleteContract = (id) => {
//     showNotification('Agency deleted successfully', 'success');
//     setOpenDeleteDialog(false);
//     setSelectedContract(null);
//     fetchContracts();
//   };

//   const handleBulkDelete = async () => {
//     try {
//       const token = localStorage.getItem('token');
//       const response = await axios.delete(`${BASE_URL}/api/contract-agencies/bulk`, {
//         headers: { Authorization: `Bearer ${token}` },
//         data: { agencyIds: selected }
//       });
//       if (response.data.success) {
//         showNotification(`${selected.length} agencies deleted successfully`, 'success');
//         setSelected([]);
//         fetchContracts();
//       }
//     } catch (err) {
//       showNotification('Failed to delete agencies', 'error');
//     }
//   };

//   const showNotification = (message, severity) => {
//     setSnackbar({ open: true, message, severity });
//   };

//   const getStatusChip = (status) => {
//     const config = {
//       Active: { bg: COLORS.chips.active, color: COLORS.primary },
//       Inactive: { bg: COLORS.chips.inactive, color: '#4B5568' },
//       Expired: { bg: COLORS.chips.expired, color: '#92400E' },
//       Terminated: { bg: COLORS.chips.terminated, color: '#991B1B' }
//     };
//     const { bg, color } = config[status] || config.Inactive;
//     return <Chip label={status} size="small" sx={{ height: 22, fontSize: '0.65rem', fontWeight: 500, bg, color }} />;
//   };

//   if (!permissionsLoaded) return <LoadingState />;
//   if (!canViewPage && !isSuperAdmin) return <AccessDenied />;

//   return (
//     <Box sx={{ p: 2.5 }}>
//       {/* Header */}
//       <Box sx={{ mb: 2.5 }}>
//         <Typography variant="h5" component="h1" sx={{ fontSize: '1.25rem', fontWeight: 700, color: COLORS.text.primary, mb: 0.5 }}>
//           Contract Agencies
//         </Typography>
//         <Typography variant="body2" sx={{ fontSize: '0.75rem', color: COLORS.text.secondary }}>
//           Manage contract agencies and their contact information.
//         </Typography>
//       </Box>

//       {/* Action Bar */}
//       <Paper sx={{ p: 1.5, mb: 2.5, borderRadius: 2, bgcolor: COLORS.background.white, boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05)', border: `1px solid ${COLORS.border}` }}>
//         <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} alignItems="center" justifyContent="space-between">
//           <TextField
//             placeholder="Search by agency code, name, contact or email..."
//             size="small"
//             value={searchTerm}
//             onChange={handleSearch}
//             sx={{ width: { xs: '100%', sm: 360 } }}
//             InputProps={{
//               startAdornment: <InputAdornment position="start"><SearchIcon sx={{ fontSize: '1rem', color: COLORS.text.tertiary }} /></InputAdornment>,
//               sx: { height: 36, bgcolor: COLORS.background.light, '& input': { fontSize: '0.75rem' } }
//             }}
//             disabled={loading}
//           />

//           <Stack direction="row" spacing={1.5} alignItems="center">
//             <Tooltip title="Refresh">
//               <IconButton onClick={handleRefresh} disabled={loading} sx={{ color: COLORS.text.secondary, '&:hover': { bgcolor: `${COLORS.primary}10`, color: COLORS.primary } }}>
//                 <RefreshIcon sx={{ fontSize: '1rem' }} />
//               </IconButton>
//             </Tooltip>

//             {canDelete && selected.length > 0 && (
//               <Button variant="outlined" color="error" startIcon={<DeleteIcon sx={{ fontSize: '1rem' }} />} onClick={handleBulkDelete} sx={{ height: 36, borderRadius: 1.5, textTransform: 'none', fontSize: '0.75rem' }} disabled={loading}>
//                 Delete ({selected.length})
//               </Button>
//             )}

//             {canCreate && (
//               <Button variant="contained" startIcon={<AddIcon sx={{ fontSize: '1rem' }} />} onClick={openAddContractModal} sx={{ height: 36, borderRadius: 1.5, bgcolor: COLORS.primary, fontSize: '0.75rem', textTransform: 'none', '&:hover': { bgcolor: COLORS.primaryDark } }} disabled={loading}>
//                 Add Agency
//               </Button>
//             )}
//           </Stack>
//         </Stack>
//       </Paper>

//       {/* Table */}
//       <Paper sx={{ borderRadius: 2, overflow: 'hidden', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05)', border: `1px solid ${COLORS.border}` }}>
//         <TableContainer>
//           <Table size="small">
//             <TableHead>
//               <TableRow sx={{ bgcolor: COLORS.background.tableHeader, '& .MuiTableCell-root': { borderBottom: 'none', color: COLORS.text.light, py: 1.5 } }}>
//                 {canDelete && <TableCell padding="checkbox" sx={{ width: 40 }}><Checkbox checked={contracts.length > 0 && selected.length === contracts.length} indeterminate={selected.length > 0 && selected.length < contracts.length} onChange={handleSelectAll} sx={{ color: COLORS.text.light, '&.Mui-checked': { color: COLORS.text.light } }} disabled={loading || contracts.length === 0} /></TableCell>}
//                 <TableCell sx={{ fontWeight: 600, fontSize: '0.7rem' }}>Agency Code</TableCell>
//                 <TableCell sx={{ fontWeight: 600, fontSize: '0.7rem' }}>Agency Name</TableCell>
//                 <TableCell sx={{ fontWeight: 600, fontSize: '0.7rem' }}>Contact Person</TableCell>
//                 <TableCell sx={{ fontWeight: 600, fontSize: '0.7rem' }}>Contact Phone</TableCell>
//                 <TableCell sx={{ fontWeight: 600, fontSize: '0.7rem' }}>Contact Email</TableCell>
//                 <TableCell sx={{ fontWeight: 600, fontSize: '0.7rem' }}>Address</TableCell>
//                 <TableCell sx={{ fontWeight: 600, fontSize: '0.7rem' }}>Status</TableCell>
//                 <TableCell sx={{ fontWeight: 600, fontSize: '0.7rem', width: 60 }} align="center">Actions</TableCell>
//               </TableRow>
//             </TableHead>
//             <TableBody>
//               {loading ? (
//                 <TableRow><TableCell colSpan={canDelete ? 9 : 8} align="center" sx={{ py: 6 }}><CircularProgress size={32} sx={{ color: COLORS.primary }} /><Typography sx={{ fontSize: '0.75rem', mt: 1 }}>Loading agencies...</Typography></TableCell></TableRow>
//               ) : contracts.length === 0 ? (
//                 <TableRow><TableCell colSpan={canDelete ? 9 : 8} align="center" sx={{ py: 6 }}><Typography variant="body1" sx={{ fontSize: '0.875rem', color: COLORS.text.secondary }}>{searchTerm ? 'No agencies found' : 'No agencies available'}</Typography></TableCell></TableRow>
//               ) : (
//                 contracts.map((contract) => {
//                   const isSelected = selected.includes(contract._id);
//                   const isActionMenuOpen = Boolean(actionMenuAnchor) && selectedContractForAction?._id === contract._id;
//                   return (
//                     <TableRow key={contract._id} hover selected={isSelected} sx={{ '&:hover': { bgcolor: COLORS.background.hover }, '& .MuiTableCell-root': { py: 1.5, fontSize: '0.75rem', borderColor: COLORS.border } }}>
//                       {canDelete && <TableCell padding="checkbox"><Checkbox checked={isSelected} onChange={() => handleSelect(contract._id)} sx={{ color: COLORS.primary, '&.Mui-checked': { color: COLORS.primary } }} /></TableCell>}
//                       <TableCell><Typography sx={{ fontWeight: 600, color: COLORS.primary }}>{contract.AgencyCode || '-'}</Typography></TableCell>
//                       <TableCell><Typography sx={{ fontWeight: 500 }}>{contract.AgencyName || '-'}</Typography></TableCell>
//                       <TableCell>{contract.ContactPerson || '-'}</TableCell>
//                       <TableCell>{contract.ContactPhone || '-'}</TableCell>
//                       <TableCell>{contract.ContactEmail || '-'}</TableCell>
//                       <TableCell sx={{ maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{contract.Address || '-'}</TableCell>
//                       <TableCell>{getStatusChip(contract.IsActive ? 'Active' : 'Inactive')}</TableCell>
//                       <TableCell align="center">
//                         <ActionMenu 
//                           contract={contract} 
//                           onView={openViewContractModal} 
//                           onEdit={openEditContractModal} 
//                           onDelete={openDeleteContractDialog} 
//                           anchorEl={isActionMenuOpen ? actionMenuAnchor : null} 
//                           onClose={handleActionMenuClose} 
//                           onOpen={(e) => handleActionMenuOpen(e, contract)} 
//                           permissions={userPermissions} 
//                         />
//                       </TableCell>
//                     </TableRow>
//                   );
//                 })
//               )}
//             </TableBody>
//           </Table>
//         </TableContainer>
//         <TablePagination 
//           rowsPerPageOptions={[5, 10, 25, 50]} 
//           component="div" 
//           count={totalCount} 
//           rowsPerPage={rowsPerPage} 
//           page={page} 
//           onPageChange={handleChangePage} 
//           onRowsPerPageChange={handleChangeRowsPerPage} 
//           sx={{ borderTop: `1px solid ${COLORS.border}`, '& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows': { fontSize: '0.7rem' } }} 
//         />
//       </Paper>

//       {/* Modals */}
//       <AddContract 
//         open={openAddModal} 
//         onClose={() => setOpenAddModal(false)} 
//         onAdd={handleAddContract} 
//       />
      
//       <EditContract 
//         open={openEditModal} 
//         onClose={() => { 
//           setOpenEditModal(false); 
//           setSelectedContract(null); 
//         }} 
//         contract={selectedContract} 
//         onUpdate={handleUpdateContract} 
//       />
      
//       <ViewContract 
//         open={openViewModal} 
//         onClose={() => { 
//           setOpenViewModal(false); 
//           setSelectedContract(null); 
//         }} 
//         contract={selectedContract} 
//         onEdit={(contract) => {
//           setOpenViewModal(false);
//           openEditContractModal(contract);
//         }}
//       />
      
//       <DeleteContract 
//         open={openDeleteDialog} 
//         onClose={() => { 
//           setOpenDeleteDialog(false); 
//           setSelectedContract(null); 
//         }} 
//         contract={selectedContract} 
//         onDelete={handleDeleteContract} 
//       />

//       {/* Snackbar */}
//       <Snackbar 
//         open={snackbar.open} 
//         autoHideDuration={3000} 
//         onClose={() => setSnackbar({ ...snackbar, open: false })} 
//         anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
//       >
//         <Alert 
//           onClose={() => setSnackbar({ ...snackbar, open: false })} 
//           severity={snackbar.severity} 
//           variant="filled" 
//           sx={{ width: '100%', borderRadius: 1.5, fontSize: '0.75rem' }}
//         >
//           {snackbar.message}
//         </Alert>
//       </Snackbar>
//     </Box>
//   );
// };

// export default ContractMaster;

import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Button,
  TextField,
  InputAdornment,
  Tooltip,
  Typography,
  Snackbar,
  TablePagination,
  Checkbox,
  Stack,
  Alert,
  Chip,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
  CircularProgress
} from '@mui/material';
import {
  Search as SearchIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Visibility as ViewIcon,
  MoreVert as MoreVertIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import axios from 'axios';
import BASE_URL from '../../../config/Config';
import { hasPermission, ACTIONS, MODULES, PAGES } from '../../../utils/modulePermissions';

// Import Modal Components
import AddContract from './AddContract';
import EditContract from './EditContract';
import ViewContract from './ViewContract';
import DeleteContract from './DeleteContract';

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
  border: '#E3E8EF',
  chips: {
    active: '#9FE2BF',
    inactive: '#F1F5F9'
  }
};

const LoadingState = () => (
  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
    <CircularProgress size={40} sx={{ color: COLORS.primary }} />
  </Box>
);

const AccessDenied = () => (
  <Box sx={{ p: 4, textAlign: 'center' }}>
    <Typography variant="h6" color="error" sx={{ mb: 2 }}>
      Access Denied
    </Typography>
    <Typography variant="body2" color="text.secondary">
      You don't have permission to view this page. Please contact your administrator.
    </Typography>
  </Box>
);

const ActionMenu = ({ contract, onView, onEdit, onDelete, anchorEl, onClose, onOpen, permissions }) => {
  const canView = hasPermission(permissions, MODULES.CONTRACT_MASTER, PAGES.CONTRACT_MASTER, ACTIONS.VIEW);
  const canUpdate = hasPermission(permissions, MODULES.CONTRACT_MASTER, PAGES.CONTRACT_MASTER, ACTIONS.UPDATE);
  const canDelete = hasPermission(permissions, MODULES.CONTRACT_MASTER, PAGES.CONTRACT_MASTER, ACTIONS.DELETE);

  if (!canView && !canUpdate && !canDelete) return null;

  return (
    <>
            <Tooltip title="Actions">
        <span> {/* <--- ADD THIS SPAN */}
          <IconButton
            size="small"
            onClick={onOpen}
            sx={{
              color: COLORS.text.secondary,
              '&:hover': { bgcolor: `${COLORS.primary}20` }
            }}
          >
            <MoreVertIcon fontSize="small" />
          </IconButton>
        </span> {/* <--- CLOSE THE SPAN */}
      </Tooltip>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={onClose}
        PaperProps={{
          elevation: 3,
          sx: {
            mt: 1,
            minWidth: 180,
            borderRadius: 2,
            border: `1px solid ${COLORS.border}`,
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
          }
        }}
      >
        {canView && (
          <MenuItem onClick={() => { onView(contract); onClose(); }} sx={{ py: 1.5 }}>
            <ListItemIcon sx={{ color: COLORS.primary, minWidth: 36 }}>
              <ViewIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>
              <Typography variant="body2" fontWeight={500} sx={{ fontSize: '0.75rem' }}>
                View Details
              </Typography>
            </ListItemText>
          </MenuItem>
        )}
        {canUpdate && (
          <MenuItem onClick={() => { onEdit(contract); onClose(); }} sx={{ py: 1.5 }}>
            <ListItemIcon sx={{ color: COLORS.primary, minWidth: 36 }}>
              <EditIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>
              <Typography variant="body2" fontWeight={500} sx={{ fontSize: '0.75rem' }}>
                Edit
              </Typography>
            </ListItemText>
          </MenuItem>
        )}
        {(canView || canUpdate) && canDelete && <Divider sx={{ my: 0.5, borderColor: COLORS.border }} />}
        {canDelete && (
          <MenuItem onClick={() => { onDelete(contract); onClose(); }} sx={{ py: 1.5 }}>
            <ListItemIcon sx={{ color: '#EF4444', minWidth: 36 }}>
              <DeleteIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>
              <Typography variant="body2" fontWeight={500} color="#EF4444" sx={{ fontSize: '0.75rem' }}>
                Delete
              </Typography>
            </ListItemText>
          </MenuItem>
        )}
      </Menu>
    </>
  );
};

const ContractMaster = () => {
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selected, setSelected] = useState([]);
  const [actionMenuAnchor, setActionMenuAnchor] = useState(null);
  const [selectedContractForAction, setSelectedContractForAction] = useState(null);
  const [openAddModal, setOpenAddModal] = useState(false);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [openViewModal, setOpenViewModal] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedContract, setSelectedContract] = useState(null);
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [userPermissions, setUserPermissions] = useState([]);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [permissionsLoaded, setPermissionsLoaded] = useState(false);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearchTerm(searchTerm), 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Fetch user permissions
  useEffect(() => {
    const fetchUserPermissions = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${BASE_URL}/api/auth/me`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (response.data.success) {
          const userData = response.data.data;
          setIsSuperAdmin(userData.isSuperAdmin || false);
          setUserPermissions(userData.permissions || []);
        }
      } catch (err) {
        console.error('Error fetching user permissions:', err);
      } finally {
        setPermissionsLoaded(true);
      }
    };
    fetchUserPermissions();
  }, []);

  const checkPermission = (action) => {
    if (isSuperAdmin) return true;
    return hasPermission(userPermissions, MODULES.CONTRACT_MASTER, PAGES.CONTRACT_MASTER, action);
  };

  const canViewPage = checkPermission(ACTIONS.VIEW);
  const canCreate = checkPermission(ACTIONS.CREATE);
  const canUpdate = checkPermission(ACTIONS.UPDATE);
  const canDelete = checkPermission(ACTIONS.DELETE);

  // Fetch agencies
  const fetchContracts = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const params = new URLSearchParams();
      params.append('page', page + 1);
      params.append('limit', rowsPerPage);
      if (debouncedSearchTerm) params.append('search', debouncedSearchTerm);

      const response = await axios.get(`${BASE_URL}/api/contract-agencies?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setContracts(response.data.data || []);
        setTotalCount(response.data.pagination?.total || response.data.total || 0);
      } else {
        showNotification('Failed to load agencies', 'error');
      }
    } catch (err) {
      console.error('Error fetching agencies:', err);
      showNotification(err.response?.data?.message || 'Failed to load agencies', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (permissionsLoaded && (canViewPage || isSuperAdmin)) {
      fetchContracts();
    }
  }, [permissionsLoaded, canViewPage, isSuperAdmin, page, rowsPerPage, debouncedSearchTerm]);

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
    setPage(0);
    setSelected([]);
  };

  const handleRefresh = () => {
    fetchContracts();
    showNotification('Data refreshed successfully', 'success');
  };

  const handleSelectAll = (event) => {
    if (!canDelete) return;
    if (event.target.checked) setSelected(contracts.map(c => c._id));
    else setSelected([]);
  };

  const handleSelect = (id) => {
    if (!canDelete) return;
    setSelected(prev => prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
    setSelected([]);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
    setSelected([]);
  };

  const handleActionMenuOpen = (event, contract) => {
    setActionMenuAnchor(event.currentTarget);
    setSelectedContractForAction(contract);
  };

  const handleActionMenuClose = () => {
    setActionMenuAnchor(null);
    setSelectedContractForAction(null);
  };

  const openAddContractModal = () => setOpenAddModal(true);
  
  const openEditContractModal = (contract) => {
    if (!canUpdate) return;
    setSelectedContract(contract);
    setOpenEditModal(true);
    handleActionMenuClose();
  };
  
  const openViewContractModal = (contract) => {
    if (!canViewPage) return;
    setSelectedContract(contract);
    setOpenViewModal(true);
    handleActionMenuClose();
  };
  
  const openDeleteContractDialog = (contract) => {
    if (!canDelete) return;
    setSelectedContract(contract);
    setOpenDeleteDialog(true);
    handleActionMenuClose();
  };

  const handleAddContract = () => {
    showNotification('Agency added successfully', 'success');
    fetchContracts();
    setOpenAddModal(false);
  };

  const handleUpdateContract = () => {
    showNotification('Agency updated successfully', 'success');
    setOpenEditModal(false);
    setSelectedContract(null);
    fetchContracts();
  };

  const handleDeleteContract = (id) => {
    showNotification('Agency deleted successfully', 'success');
    setOpenDeleteDialog(false);
    setSelectedContract(null);
    fetchContracts();
  };

  const handleBulkDelete = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.delete(`${BASE_URL}/api/contract-agencies/bulk`, {
        headers: { Authorization: `Bearer ${token}` },
        data: { agencyIds: selected }
      });
      if (response.data.success) {
        showNotification(`${selected.length} agencies deleted successfully`, 'success');
        setSelected([]);
        fetchContracts();
      } else {
        showNotification(response.data.message || 'Failed to delete agencies', 'error');
      }
    } catch (err) {
      console.error('Bulk delete error:', err);
      showNotification(err.response?.data?.message || 'Failed to delete agencies', 'error');
    }
  };

  const showNotification = (message, severity) => {
    setSnackbar({ open: true, message, severity });
  };

  const getStatusChip = (isActive) => {
    const label = isActive ? 'Active' : 'Inactive';
    const bg = isActive ? COLORS.chips.active : COLORS.chips.inactive;
    const color = isActive ? COLORS.primary : '#4B5568';
    return <Chip label={label} size="small" sx={{ height: 22, fontSize: '0.65rem', fontWeight: 500, bgcolor: bg, color }} />;
  };

  if (!permissionsLoaded) return <LoadingState />;
  if (!canViewPage && !isSuperAdmin) return <AccessDenied />;

  return (
    <Box sx={{ p: 2.5 }}>
      {/* Header */}
      <Box sx={{ mb: 2.5 }}>
        <Typography variant="h5" component="h1" sx={{ fontSize: '1.25rem', fontWeight: 700, color: COLORS.text.primary, mb: 0.5 }}>
          Contract Agencies
        </Typography>
        <Typography variant="body2" sx={{ fontSize: '0.75rem', color: COLORS.text.secondary }}>
          Manage contract agencies and their contact information.
        </Typography>
      </Box>

      {/* Action Bar */}
      <Paper sx={{ p: 1.5, mb: 2.5, borderRadius: 2, bgcolor: COLORS.background.white, boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05)', border: `1px solid ${COLORS.border}` }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} alignItems="center" justifyContent="space-between">
          <TextField
            placeholder="Search by agency code, name, contact or email..."
            size="small"
            value={searchTerm}
            onChange={handleSearch}
            sx={{ width: { xs: '100%', sm: 360 } }}
            InputProps={{
              startAdornment: <InputAdornment position="start"><SearchIcon sx={{ fontSize: '1rem', color: COLORS.text.tertiary }} /></InputAdornment>,
              sx: { height: 36, bgcolor: COLORS.background.light, '& input': { fontSize: '0.75rem' } }
            }}
            disabled={loading}
          />
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Tooltip title="Refresh">
              <IconButton onClick={handleRefresh} disabled={loading} sx={{ color: COLORS.text.secondary, '&:hover': { bgcolor: `${COLORS.primary}10`, color: COLORS.primary } }}>
                <RefreshIcon sx={{ fontSize: '1rem' }} />
              </IconButton>
            </Tooltip>
            {canDelete && selected.length > 0 && (
              <Button 
                variant="outlined" 
                color="error" 
                startIcon={<DeleteIcon sx={{ fontSize: '1rem' }} />} 
                onClick={handleBulkDelete} 
                sx={{ height: 36, borderRadius: 1.5, textTransform: 'none', fontSize: '0.75rem' }} 
                disabled={loading}
              >
                Delete ({selected.length})
              </Button>
            )}
            {canCreate && (
              <Button 
                variant="contained" 
                startIcon={<AddIcon sx={{ fontSize: '1rem' }} />} 
                onClick={openAddContractModal} 
                sx={{ height: 36, borderRadius: 1.5, bgcolor: COLORS.primary, fontSize: '0.75rem', textTransform: 'none', '&:hover': { bgcolor: COLORS.primaryDark } }} 
                disabled={loading}
              >
                Add Agency
              </Button>
            )}
          </Stack>
        </Stack>
      </Paper>

      {/* Table */}
      <Paper sx={{ borderRadius: 2, overflow: 'hidden', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05)', border: `1px solid ${COLORS.border}` }}>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: COLORS.background.tableHeader, '& .MuiTableCell-root': { borderBottom: 'none', color: COLORS.text.light, py: 1.5 } }}>
                {canDelete && <TableCell padding="checkbox" sx={{ width: 40 }}><Checkbox checked={contracts.length > 0 && selected.length === contracts.length} indeterminate={selected.length > 0 && selected.length < contracts.length} onChange={handleSelectAll} sx={{ color: COLORS.text.light, '&.Mui-checked': { color: COLORS.text.light } }} disabled={loading || contracts.length === 0} /></TableCell>}
                <TableCell sx={{ fontWeight: 600, fontSize: '0.7rem' }}>Agency Code</TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: '0.7rem' }}>Agency Name</TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: '0.7rem' }}>Contact Person</TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: '0.7rem' }}>Contact Phone</TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: '0.7rem' }}>Contact Email</TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: '0.7rem' }}>Address</TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: '0.7rem' }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: '0.7rem', width: 60 }} align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={canDelete ? 9 : 8} align="center" sx={{ py: 6 }}><CircularProgress size={32} sx={{ color: COLORS.primary }} /><Typography sx={{ fontSize: '0.75rem', mt: 1 }}>Loading agencies...</Typography></TableCell></TableRow>
              ) : contracts.length === 0 ? (
                <TableRow><TableCell colSpan={canDelete ? 9 : 8} align="center" sx={{ py: 6 }}><Typography variant="body1" sx={{ fontSize: '0.875rem', color: COLORS.text.secondary }}>{searchTerm ? 'No agencies found matching your search' : 'No agencies available'}</Typography></TableCell></TableRow>
              ) : (
                contracts.map((contract) => {
                  const isSelected = selected.includes(contract._id);
                  const isActionMenuOpen = Boolean(actionMenuAnchor) && selectedContractForAction?._id === contract._id;
                  return (
                    <TableRow key={contract._id} hover selected={isSelected} sx={{ '&:hover': { bgcolor: COLORS.background.hover }, '& .MuiTableCell-root': { py: 1.5, fontSize: '0.75rem', borderColor: COLORS.border } }}>
                      {canDelete && <TableCell padding="checkbox"><Checkbox checked={isSelected} onChange={() => handleSelect(contract._id)} sx={{ color: COLORS.primary, '&.Mui-checked': { color: COLORS.primary } }} /></TableCell>}
                      <TableCell><Typography sx={{ fontWeight: 600, color: COLORS.primary }}>{contract.agencyCode || '-'}</Typography></TableCell>
                      <TableCell><Typography sx={{ fontWeight: 500 }}>{contract.agencyName || '-'}</Typography></TableCell>
                      <TableCell>{contract.contactPerson || '-'}</TableCell>
                      <TableCell>{contract.contactPhone || '-'}</TableCell>
                      <TableCell>{contract.contactEmail || '-'}</TableCell>
                      <TableCell sx={{ maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{contract.address || '-'}</TableCell>
                      <TableCell>{getStatusChip(contract.status === 'Active')}</TableCell>
                      
                      <TableCell align="center">
                        <ActionMenu 
                          contract={contract} 
                          onView={openViewContractModal} 
                          onEdit={openEditContractModal} 
                          onDelete={openDeleteContractDialog} 
                          anchorEl={isActionMenuOpen ? actionMenuAnchor : null} 
                          onClose={handleActionMenuClose} 
                          onOpen={(e) => handleActionMenuOpen(e, contract)} 
                          permissions={userPermissions} 
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
          count={totalCount} 
          rowsPerPage={rowsPerPage} 
          page={page} 
          onPageChange={handleChangePage} 
          onRowsPerPageChange={handleChangeRowsPerPage} 
          sx={{ borderTop: `1px solid ${COLORS.border}`, '& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows': { fontSize: '0.7rem' } }} 
        />
      </Paper>

      {/* Modals */}
      <AddContract open={openAddModal} onClose={() => setOpenAddModal(false)} onAdd={handleAddContract} />
      <EditContract open={openEditModal} onClose={() => { setOpenEditModal(false); setSelectedContract(null); }} contract={selectedContract} onUpdate={handleUpdateContract} />
      <ViewContract open={openViewModal} onClose={() => { setOpenViewModal(false); setSelectedContract(null); }} contract={selectedContract} onEdit={(contract) => { setOpenViewModal(false); openEditContractModal(contract); }} />
      <DeleteContract open={openDeleteDialog} onClose={() => { setOpenDeleteDialog(false); setSelectedContract(null); }} contract={selectedContract} onDelete={handleDeleteContract} />

      {/* Snackbar */}
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
    </Box>
  );
};

export default ContractMaster;