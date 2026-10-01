// import React, { useState, useEffect, useCallback, useRef } from 'react';
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
//   Chip,
//   Avatar,
//   Menu,
//   MenuItem,
//   ListItemIcon,
//   ListItemText,
//   Divider,
//   Alert,
//   CircularProgress,
//   Dialog,
//   DialogTitle,
//   DialogContent,
//   DialogActions,
//   Grid,
//   FormControl,
//   InputLabel,
//   Select,
//   Autocomplete,
//   debounce
// } from '@mui/material';
// import {
//   Search as SearchIcon,
//   Add as AddIcon,
//   Delete as DeleteIcon,
//   Visibility as VisibilityIcon,
//   Edit as EditIcon,
//   MoreVert as MoreVertIcon,
//   Refresh as RefreshIcon,
//   LocalShipping as LocalShippingIcon,
//   PictureAsPdf as PdfIcon,
//   PendingActions as PendingActionsIcon,
//   QrCode as QrCodeIcon,
//   AssignmentTurnedIn as AssignmentTurnedInIcon,
//   Cancel as CancelIcon,
//   LocalActivity as LocalActivityIcon
// } from '@mui/icons-material';
// import axios from 'axios';
// import BASE_URL from '../../../config/Config';
// import { hasPermission, ACTIONS, MODULES, PAGES } from '../../../utils/modulePermissions';

// // Import modal components
// import AddDeliveryChallan from './AddDeliveryChallan';
// import ViewDeliveryChallan from './ViewDeliveryChallan';
// import DeleteDeliveryChallan from './DeleteDeliveryChallan';
// import PendingDispatchDialog from './PendingDispatchDialog';
// import GenerateEWBDialog from './GenerateEWBDialog';
// import PODDialog from './PODDialog';
// import RejectDeliveryDialog from './RejectDeliveryDialog';
// import PackingListDialog from './PackingListDialog';
// import EditPackingListDialog from './EditPackingListDialog';
// import DispatchDialog from './DispatchDialog';

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
//   status: {
//     Planned: { bg: '#E0F2FE', color: '#0369A1', border: '#BAE6FD' },
//     Packed: { bg: '#E0E7FF', color: '#3730A3', border: '#C7D2FE' },
//     'EWB Generated': { bg: '#EDE9FE', color: '#6D28D9', border: '#DDD6FE' },
//     Dispatched: { bg: '#FEF3C7', color: '#B45309', border: '#FDE68A' },
//     Delivered: { bg: '#D1FAE5', color: '#065F46', border: '#A7F3D0' },
//     'Rejected by Customer': { bg: '#FEE2E2', color: '#991B1B', border: '#FECACA' }
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
// const ActionMenu = ({ deliveryChallan, onView, onDelete, onPrint, onGenerateEWB, onPOD, onRejectDelivery, onPackingList, onEditPackingList, onDispatch, anchorEl, onClose, onOpen, permissions }) => {
//   const canView = hasPermission(permissions, MODULES.DELIVERY_CHALLAN, PAGES.DELIVERY_CHALLAN, ACTIONS.VIEW);
//   const canUpdate = hasPermission(permissions, MODULES.DELIVERY_CHALLAN, PAGES.DELIVERY_CHALLAN, ACTIONS.UPDATE);

//   const showGenerateEWB = deliveryChallan.status === 'Packed';
//   const showPackingList = deliveryChallan.status === 'Planned';
//   const showEditPackingList = deliveryChallan.status === 'Packed';
//   const showDispatch = deliveryChallan.status === 'EWB Generated';
//   const showPOD = deliveryChallan.status === 'Dispatched';
//   const showRejectDelivery = deliveryChallan.status === 'Dispatched';

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
//           <MenuItem 
//             onClick={() => {
//               onView(deliveryChallan);
//               onClose();
//             }}
//             sx={{ py: 1.5 }}
//           >
//             <ListItemIcon sx={{ color: COLORS.primary, minWidth: 36 }}>
//               <VisibilityIcon fontSize="small" />
//             </ListItemIcon>
//             <ListItemText>
//               <Typography variant="body2" fontWeight={500} sx={{ color: COLORS.text.primary, fontSize: '0.75rem' }}>
//                 View Details
//               </Typography>
//             </ListItemText>
//           </MenuItem>
//         )}

//         {showPackingList && (
//           <MenuItem 
//             onClick={() => {
//               onPackingList(deliveryChallan);
//               onClose();
//             }}
//             sx={{ py: 1.5 }}
//           >
//             <ListItemIcon sx={{ color: '#0D696C', minWidth: 36 }}>
//               <LocalShippingIcon fontSize="small" />
//             </ListItemIcon>
//             <ListItemText>
//               <Typography variant="body2" fontWeight={500} sx={{ color: '#0D696C', fontSize: '0.75rem' }}>
//                 Packing List
//               </Typography>
//             </ListItemText>
//           </MenuItem>
//         )}

//         {showEditPackingList && onEditPackingList && (
//           <MenuItem 
//             onClick={() => {
//               onEditPackingList(deliveryChallan);
//               onClose();
//             }}
//             sx={{ py: 1.5 }}
//           >
//             <ListItemIcon sx={{ color: '#0D696C', minWidth: 36 }}>
//               <EditIcon fontSize="small" />
//             </ListItemIcon>
//             <ListItemText>
//               <Typography variant="body2" fontWeight={500} sx={{ color: '#0D696C', fontSize: '0.75rem' }}>
//                 Edit Packing List
//               </Typography>
//             </ListItemText>
//           </MenuItem>
//         )}

//         {showGenerateEWB && canUpdate && (
//           <MenuItem 
//             onClick={() => {
//               onGenerateEWB(deliveryChallan);
//               onClose();
//             }}
//             sx={{ py: 1.5 }}
//           >
//             <ListItemIcon sx={{ color: '#8B5CF6', minWidth: 36 }}>
//               <QrCodeIcon fontSize="small" />
//             </ListItemIcon>
//             <ListItemText>
//               <Typography variant="body2" fontWeight={500} sx={{ color: '#8B5CF6', fontSize: '0.75rem' }}>
//                 Generate EWB
//               </Typography>
//             </ListItemText>
//           </MenuItem>
//         )}

//         {showDispatch && (
//           <MenuItem 
//             onClick={() => {
//               onDispatch(deliveryChallan);
//               onClose();
//             }}
//             sx={{ py: 1.5 }}
//           >
//             <ListItemIcon sx={{ color: '#0D696C', minWidth: 36 }}>
//               <LocalActivityIcon fontSize="small" />
//             </ListItemIcon>
//             <ListItemText>
//               <Typography variant="body2" fontWeight={500} sx={{ color: '#0D696C', fontSize: '0.75rem' }}>
//                 Dispatch
//               </Typography>
//             </ListItemText>
//           </MenuItem>
//         )}

//         {showPOD && (
//           <MenuItem 
//             onClick={() => {
//               onPOD(deliveryChallan);
//               onClose();
//             }}
//             sx={{ py: 1.5 }}
//           >
//             <ListItemIcon sx={{ color: '#10B981', minWidth: 36 }}>
//               <AssignmentTurnedInIcon fontSize="small" />
//             </ListItemIcon>
//             <ListItemText>
//               <Typography variant="body2" fontWeight={500} sx={{ color: '#10B981', fontSize: '0.75rem' }}>
//                 POD
//               </Typography>
//             </ListItemText>
//           </MenuItem>
//         )}

//         {showRejectDelivery && (
//           <MenuItem 
//             onClick={() => {
//               onRejectDelivery(deliveryChallan);
//               onClose();
//             }}
//             sx={{ py: 1.5 }}
//           >
//             <ListItemIcon sx={{ color: '#EF4444', minWidth: 36 }}>
//               <CancelIcon fontSize="small" />
//             </ListItemIcon>
//             <ListItemText>
//               <Typography variant="body2" fontWeight={500} sx={{ color: '#EF4444', fontSize: '0.75rem' }}>
//                 Reject Delivery
//               </Typography>
//             </ListItemText>
//           </MenuItem>
//         )}
//       </Menu>
//     </>
//   );
// };

// const DeliveryChallanMaster = () => {
//   // State for data
//   const [deliveryChallans, setDeliveryChallans] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [searchInput, setSearchInput] = useState('');
//   const [searchTerm, setSearchTerm] = useState('');
  
//   // Table state
//   const [page, setPage] = useState(0);
//   const [rowsPerPage, setRowsPerPage] = useState(5); // Changed from 10 to 5
//   const [selected, setSelected] = useState([]);
  
//   // Server-side pagination states
//   const [totalCount, setTotalCount] = useState(0);
//   const [currentPage, setCurrentPage] = useState(1);
  
//   // Menu state for action buttons
//   const [actionMenuAnchor, setActionMenuAnchor] = useState(null);
//   const [selectedDCForAction, setSelectedDCForAction] = useState(null);
  
//   // Modal state
//   const [openAddModal, setOpenAddModal] = useState(false);
//   const [openViewModal, setOpenViewModal] = useState(false);
//   const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
//   const [openPendingDispatchDialog, setOpenPendingDispatchDialog] = useState(false);
//   const [openGenerateEWBDialog, setOpenGenerateEWBDialog] = useState(false);
//   const [openPODDialog, setOpenPODDialog] = useState(false);
//   const [openRejectDialog, setOpenRejectDialog] = useState(false);
//   const [openPackingListDialog, setOpenPackingListDialog] = useState(false);
//   const [openEditPackingListDialog, setOpenEditPackingListDialog] = useState(false);
//   const [openDispatchDialog, setOpenDispatchDialog] = useState(false);
//   const [pendingDispatchDCs, setPendingDispatchDCs] = useState([]);
  
//   // Selected delivery challan
//   const [selectedDC, setSelectedDC] = useState(null);
  
//   // Notification state
//   const [snackbar, setSnackbar] = useState({
//     open: false,
//     message: '',
//     severity: 'success'
//   });

//   // User permissions state
//   const [userPermissions, setUserPermissions] = useState([]);
//   const [isSuperAdmin, setIsSuperAdmin] = useState(false);
//   const [permissionsLoaded, setPermissionsLoaded] = useState(false);

//   // Ref to track if we should skip loading state for UI update
//   const isSearchingRef = useRef(false);
//   const searchTimeoutRef = useRef(null);

//   // Fetch user permissions
//   useEffect(() => {
//     const fetchUserPermissions = async () => {
//       try {
//         const token = localStorage.getItem('token');
//         const response = await axios.get(`${BASE_URL}/api/auth/me`, {
//           headers: {
//             'Authorization': `Bearer ${token}`
//           }
//         });
        
//         if (response.data.success) {
//           const userData = response.data.data;
//           setIsSuperAdmin(userData.isSuperAdmin || false);
          
//           if (userData.permissions && Array.isArray(userData.permissions)) {
//             setUserPermissions(userData.permissions);
//           } else {
//             setUserPermissions([]);
//           }
//         }
//       } catch (err) {
//         console.error('Error fetching user permissions:', err);
//         setUserPermissions([]);
//       } finally {
//         setPermissionsLoaded(true);
//       }
//     };
    
//     fetchUserPermissions();
//   }, []);

//   // Check permission helper
//   const checkPermission = (action) => {
//     if (isSuperAdmin) return true;
//     return hasPermission(
//       userPermissions,
//       MODULES.DELIVERY_CHALLAN,
//       PAGES.DELIVERY_CHALLAN,
//       action
//     );
//   };

//   // Permission checks
//   const canViewPage = checkPermission(ACTIONS.VIEW);
//   const canCreate = checkPermission(ACTIONS.CREATE);
//   const canDelete = checkPermission(ACTIONS.DELETE);
//   const canPrint = checkPermission(ACTIONS.PRINT);

//   // Handle search input change
//   const handleSearchChange = (e) => {
//     const value = e.target.value;
//     setSearchInput(value);
    
//     // Clear previous timeout
//     if (searchTimeoutRef.current) {
//       clearTimeout(searchTimeoutRef.current);
//     }
    
//     // Set new timeout for debounce
//     searchTimeoutRef.current = setTimeout(() => {
//       setSearchTerm(value);
//       setCurrentPage(1);
//       setPage(0);
//       isSearchingRef.current = false;
//     }, 500);
//   };

//   // Cleanup timeout on unmount
//   useEffect(() => {
//     return () => {
//       if (searchTimeoutRef.current) {
//         clearTimeout(searchTimeoutRef.current);
//       }
//     };
//   }, []);

//   // Clear search
//   const handleClearSearch = () => {
//     setSearchInput('');
//     setSearchTerm('');
//     setCurrentPage(1);
//     setPage(0);
//   };

//   // Fetch delivery challans from API
//   const fetchDeliveryChallans = useCallback(async () => {
//     // Don't show loading indicator while typing search
//     if (!isSearchingRef.current) {
//       setLoading(true);
//     }
    
//     try {
//       const token = localStorage.getItem('token');
//       const params = {
//         page: currentPage,
//         limit: rowsPerPage
//       };
      
//       if (searchTerm) {
//         params.search = searchTerm;
//       }
      
//       const response = await axios.get(`${BASE_URL}/api/delivery-challans`, {
//         headers: {
//           'Authorization': `Bearer ${token}`
//         },
//         params: params
//       });

//       if (response.data.success) {
//         setDeliveryChallans(response.data.data || []);
//         setTotalCount(response.data.pagination?.total || 0);
//       } else {
//         showNotification('Failed to load delivery challans', 'error');
//         setDeliveryChallans([]);
//         setTotalCount(0);
//       }
//     } catch (err) {
//       console.error('Error fetching delivery challans:', err);
//       showNotification(err.response?.data?.message || 'Failed to load delivery challans', 'error');
//       setDeliveryChallans([]);
//       setTotalCount(0);
//     } finally {
//       setLoading(false);
//     }
//   }, [currentPage, rowsPerPage, searchTerm]);

//   // Load data when dependencies change
//   useEffect(() => {
//     if (permissionsLoaded && (canViewPage || isSuperAdmin)) {
//       fetchDeliveryChallans();
//     }
//   }, [fetchDeliveryChallans, permissionsLoaded, canViewPage, isSuperAdmin]);

//   // Fetch pending dispatch delivery challans
//   const fetchPendingDispatchDCs = async () => {
//     try {
//       const token = localStorage.getItem('token');
//       const response = await axios.get(`${BASE_URL}/api/delivery-challans/pending-dispatch`, {
//         headers: {
//           'Authorization': `Bearer ${token}`
//         }
//       });

//       if (response.data.success) {
//         setPendingDispatchDCs(response.data.data || []);
//         setOpenPendingDispatchDialog(true);
//       } else {
//         showNotification('Failed to load pending dispatch DCs', 'error');
//       }
//     } catch (err) {
//       console.error('Error fetching pending dispatch DCs:', err);
//       showNotification('Failed to load pending dispatch DCs', 'error');
//     }
//   };
  
//   // Handle refresh
//   const handleRefresh = () => {
//     fetchDeliveryChallans();
//     showNotification('Data refreshed', 'success');
//   };
  
//   const handleSelectAll = (event) => {
//     if (!canDelete) return;
    
//     if (event.target.checked) {
//       setSelected(deliveryChallans.map(dc => dc._id));
//     } else {
//       setSelected([]);
//     }
//   };
  
//   const handleSelect = (id) => {
//     if (!canDelete) return;
    
//     const selectedIndex = selected.indexOf(id);
//     let newSelected = [];
    
//     if (selectedIndex === -1) {
//       newSelected = newSelected.concat(selected, id);
//     } else {
//       newSelected = selected.filter(item => item !== id);
//     }
    
//     setSelected(newSelected);
//   };
  
//   const handleChangePage = (event, newPage) => {
//     setPage(newPage);
//     setCurrentPage(newPage + 1);
//     setSelected([]);
//   };
  
//   const handleChangeRowsPerPage = (event) => {
//     const newRowsPerPage = parseInt(event.target.value, 10);
//     setRowsPerPage(newRowsPerPage);
//     setPage(0);
//     setCurrentPage(1);
//     setSelected([]);
//   };
  
//   const handleActionMenuOpen = (event, dc) => {
//     setActionMenuAnchor(event.currentTarget);
//     setSelectedDCForAction(dc);
//   };

//   const handleActionMenuClose = () => {
//     setActionMenuAnchor(null);
//     setSelectedDCForAction(null);
//   };
  
//   const openViewModalHandler = (dc) => {
//     setSelectedDC(dc);
//     setOpenViewModal(true);
//     handleActionMenuClose();
//   };
  
//   const openDeleteDialogHandler = (dc) => {
//     if (!canDelete) return;
//     setSelectedDC(dc);
//     setOpenDeleteDialog(true);
//     handleActionMenuClose();
//   };
  
//   const handlePendingDispatch = () => {
//     fetchPendingDispatchDCs();
//   };
  
//   const handleGenerateEWB = (dc) => {
//     setSelectedDC(dc);
//     setOpenGenerateEWBDialog(true);
//     handleActionMenuClose();
//   };
  
//   const handlePOD = (dc) => {
//     setSelectedDC(dc);
//     setOpenPODDialog(true);
//     handleActionMenuClose();
//   };

//   const handleRejectDelivery = (dc) => {
//     setSelectedDC(dc);
//     setOpenRejectDialog(true);
//     handleActionMenuClose();
//   };

//   const handlePackingList = (dc) => {
//     setSelectedDC(dc);
//     setOpenPackingListDialog(true);
//     handleActionMenuClose();
//   };

//   const handleEditPackingList = (dc) => {
//     setSelectedDC(dc);
//     setOpenEditPackingListDialog(true);
//     handleActionMenuClose();
//   };

//   const handleDispatch = (dc) => {
//     setSelectedDC(dc);
//     setOpenDispatchDialog(true);
//     handleActionMenuClose();
//   };
  
//   const handlePrint = (dc) => {
//     window.open(`${BASE_URL}/api/delivery-challans/${dc._id}/print`, '_blank');
//   };
  
//   const handleAddSuccess = () => {
//     setOpenAddModal(false);
//     fetchDeliveryChallans();
//     showNotification('Delivery Challan created successfully!', 'success');
//   };
  
//   const handleDeleteSuccess = () => {
//     setOpenDeleteDialog(false);
//     setSelectedDC(null);
//     fetchDeliveryChallans();
//     showNotification('Delivery Challan deleted successfully!', 'success');
//   };
  
//   const handleEWBSuccess = () => {
//     fetchDeliveryChallans();
//     showNotification('Operation completed successfully!', 'success');
//   };
  
//   const handleBulkDelete = async () => {
//     if (!canDelete || selected.length === 0) return;
    
//     setLoading(true);
//     try {
//       const token = localStorage.getItem('token');
//       await axios.post(`${BASE_URL}/api/delivery-challans/bulk-delete`, 
//         { ids: selected },
//         { headers: { 'Authorization': `Bearer ${token}` } }
//       );
      
//       setSelected([]);
      
//       if (deliveryChallans.length === selected.length && currentPage > 1) {
//         setCurrentPage(prev => prev - 1);
//         setPage(prev => prev - 1);
//       } else {
//         fetchDeliveryChallans();
//       }
      
//       showNotification(`${selected.length} delivery challan(s) deleted successfully!`, 'success');
//     } catch (err) {
//       console.error('Bulk delete error:', err);
//       showNotification('Failed to delete delivery challans', 'error');
//     } finally {
//       setLoading(false);
//     }
//   };
  
//   const showNotification = (message, severity) => {
//     setSnackbar({
//       open: true,
//       message,
//       severity
//     });
//   };
  
//   const formatDate = (dateString) => {
//     if (!dateString) return '-';
//     return new Date(dateString).toLocaleDateString('en-IN', {
//       year: 'numeric',
//       month: 'short',
//       day: 'numeric'
//     });
//   };
  
//   const getStatusChip = (status) => {
//     const colors = COLORS.status[status] || { bg: '#F1F5F9', color: '#475569', border: '#E2E8F0' };
//     return (
//       <Chip
//         label={status}
//         size="small"
//         sx={{
//           fontSize: '0.65rem',
//           fontWeight: 500,
//           height: 24,
//           bgcolor: colors.bg,
//           color: colors.color,
//           border: `1px solid ${colors.border}`
//         }}
//       />
//     );
//   };
  
//   const getCompanyInitials = (companyName) => {
//     if (!companyName) return 'C';
//     const words = companyName.split(' ');
//     if (words.length >= 2) {
//       return `${words[0].charAt(0)}${words[1].charAt(0)}`.toUpperCase();
//     }
//     return companyName.substring(0, 2).toUpperCase();
//   };
  
//   const getAvatarColor = (companyName) => {
//     if (!companyName) return COLORS.primary;
//     const colors = [COLORS.primary, COLORS.primaryDark, '#074346', '#0D696C', '#128C7E'];
//     const charCode = companyName.charCodeAt(0) || 0;
//     return colors[charCode % colors.length];
//   };

//   if (!permissionsLoaded) {
//     return <LoadingState />;
//   }

//   if (!canViewPage && !isSuperAdmin) {
//     return <AccessDenied />;
//   }

//   return (
//     <Box sx={{ p: 2.5 }}>
//       {/* Page Header */}
//       <Box sx={{ mb: 2.5 }}>
//         <Typography 
//           variant="h5" 
//           component="h1" 
//           sx={{ 
//             fontSize: '1.25rem',
//             fontWeight: 700,
//             color: COLORS.text.primary,
//             mb: 0.5
//           }}
//         >
//           Delivery Challan Master
//         </Typography>
//         <Typography variant="body2" sx={{ fontSize: '0.75rem', color: COLORS.text.secondary }}>
//           Manage delivery challans, track shipments, and monitor dispatch status
//         </Typography>
//       </Box>

//       {/* Filter and Action Bar */}
//       <Paper sx={{ 
//         p: 1.5, 
//         mb: 2.5, 
//         borderRadius: 2,
//         bgcolor: COLORS.background.white,
//         boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05)',
//         border: `1px solid ${COLORS.border}`
//       }}>
//         <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} alignItems="center" justifyContent="space-between">
//           <Stack direction="row" spacing={1.5} alignItems="center" sx={{ flex: 1, flexWrap: 'wrap' }}>
//             <TextField
//               placeholder="Search by DC number, SO number, customer..."
//               size="small"
//               value={searchInput}
//               onChange={handleSearchChange}
//               autoComplete="off"
//               sx={{ 
//                 width: { xs: '100%', sm: 320 },
//                 '& .MuiOutlinedInput-root': {
//                   borderRadius: 1.5,
//                   fontSize: '0.75rem',
//                   '&:hover fieldset': {
//                     borderColor: COLORS.primary,
//                   },
//                 }
//               }}
//               InputProps={{
//                 startAdornment: (
//                   <InputAdornment position="start">
//                     <SearchIcon sx={{ fontSize: '1rem', color: COLORS.text.tertiary }} />
//                   </InputAdornment>
//                 ),
//                 sx: { 
//                   height: 36,
//                   bgcolor: COLORS.background.light,
//                   '& input': {
//                     padding: '6px 12px',
//                     fontSize: '0.75rem',
//                     color: COLORS.text.primary,
//                     '&::placeholder': {
//                       color: COLORS.text.tertiary,
//                       fontSize: '0.75rem'
//                     }
//                   }
//                 }
//               }}
//             />
//           </Stack>

//           <Stack direction="row" spacing={1.5} alignItems="center">
//             {canDelete && selected.length > 0 && (
//               <Button
//                 variant="outlined"
//                 color="error"
//                 startIcon={<DeleteIcon sx={{ fontSize: '1rem' }} />}
//                 onClick={handleBulkDelete}
//                 sx={{ 
//                   height: 36,
//                   borderRadius: 1.5,
//                   textTransform: 'none',
//                   fontSize: '0.75rem',
//                   fontWeight: 500,
//                   borderColor: '#fee2e2',
//                   color: '#991b1b',
//                   '&:hover': {
//                     borderColor: '#fecaca',
//                     bgcolor: '#fee2e2'
//                   }
//                 }}
//                 disabled={loading}
//               >
//                 Delete ({selected.length})
//               </Button>
//             )}
            
//             <Button
//               variant="outlined"
//               startIcon={<RefreshIcon sx={{ fontSize: '1rem' }} />}
//               onClick={handleRefresh}
//               disabled={loading}
//               sx={{ 
//                 height: 36,
//                 borderRadius: 1.5,
//                 textTransform: 'none',
//                 fontSize: '0.75rem',
//                 fontWeight: 500,
//                 borderColor: COLORS.border,
//                 color: COLORS.text.secondary,
//                 '&:hover': {
//                   borderColor: COLORS.primary,
//                   color: COLORS.primary,
//                   bgcolor: `${COLORS.primary}10`
//                 }
//               }}
//             >
//               Refresh
//             </Button>
            
//             {canCreate && (
//               <Button
//                 variant="contained"
//                 startIcon={<AddIcon sx={{ fontSize: '1rem' }} />}
//                 onClick={() => setOpenAddModal(true)}
//                 sx={{
//                   height: 36,
//                   borderRadius: 1.5,
//                   bgcolor: COLORS.primary,
//                   fontSize: '0.75rem',
//                   fontWeight: 500,
//                   textTransform: 'none',
//                   boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
//                   '&:hover': {
//                     bgcolor: COLORS.primaryDark,
//                   }
//                 }}
//                 disabled={loading}
//               >
//                 Create DC
//               </Button>
//             )}
//           </Stack>
//         </Stack>
//       </Paper>

//       {/* Delivery Challans Table */}
//       <Paper sx={{ 
//         width: '100%', 
//         borderRadius: 2, 
//         overflow: 'hidden',
//         boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05)',
//         border: `1px solid ${COLORS.border}`
//       }}>
//         <TableContainer>
//           <Table size="small">
//             <TableHead>
//               <TableRow sx={{ 
//                 bgcolor: COLORS.background.tableHeader,
//                 '& .MuiTableCell-root': {
//                   borderBottom: 'none',
//                   color: COLORS.text.light,
//                   py: 1.5
//                 }
//               }}>
//                 {canDelete && (
//                   <TableCell padding="checkbox" sx={{ width: 40 }}>
//                     <Checkbox
//                       indeterminate={selected.length > 0 && selected.length < deliveryChallans.length}
//                       checked={deliveryChallans.length > 0 && selected.length === deliveryChallans.length}
//                       onChange={handleSelectAll}
//                       sx={{
//                         color: COLORS.text.light,
//                         '&.Mui-checked': {
//                           color: COLORS.text.light,
//                         },
//                         '&.MuiCheckbox-indeterminate': {
//                           color: COLORS.text.light,
//                         },
//                         '& .MuiSvgIcon-root': {
//                           fontSize: '1.25rem'
//                         }
//                       }}
//                       disabled={loading || deliveryChallans.length === 0}
//                     />
//                   </TableCell>
//                 )}
//                 <TableCell sx={{ 
//                   fontWeight: 600, 
//                   fontSize: '0.7rem',
//                   letterSpacing: '0.5px',
//                   color: COLORS.text.light
//                 }}>
//                   DC Number
//                 </TableCell>
//                 <TableCell sx={{ 
//                   fontWeight: 600, 
//                   fontSize: '0.7rem',
//                   letterSpacing: '0.5px',
//                   color: COLORS.text.light
//                 }}>
//                   DC Date
//                 </TableCell>
//                 <TableCell sx={{ 
//                   fontWeight: 600, 
//                   fontSize: '0.7rem',
//                   letterSpacing: '0.5px',
//                   color: COLORS.text.light
//                 }}>
//                   SO Number
//                 </TableCell>
//                 <TableCell sx={{ 
//                   fontWeight: 600, 
//                   fontSize: '0.7rem',
//                   letterSpacing: '0.5px',
//                   color: COLORS.text.light
//                 }}>
//                   Customer
//                 </TableCell>
//                 <TableCell sx={{ 
//                   fontWeight: 600, 
//                   fontSize: '0.7rem',
//                   letterSpacing: '0.5px',
//                   color: COLORS.text.light
//                 }}>
//                   DC Type
//                 </TableCell>
//                 <TableCell sx={{ 
//                   fontWeight: 600, 
//                   fontSize: '0.7rem',
//                   letterSpacing: '0.5px',
//                   color: COLORS.text.light
//                 }}>
//                   Status
//                 </TableCell>
//                 <TableCell sx={{ 
//                   fontWeight: 600, 
//                   fontSize: '0.7rem',
//                   letterSpacing: '0.5px',
//                   color: COLORS.text.light
//                 }}>
//                   Items
//                 </TableCell>
//                 <TableCell sx={{ 
//                   fontWeight: 600, 
//                   fontSize: '0.7rem',
//                   letterSpacing: '0.5px',
//                   width: 60,
//                   color: COLORS.text.light
//                 }} align="center">
//                   Actions
//                 </TableCell>
//               </TableRow>
//             </TableHead>
//             <TableBody>
//               {loading ? (
//                 <TableRow>
//                   <TableCell colSpan={canDelete ? 9 : 8} align="center" sx={{ py: 6 }}>
//                     <CircularProgress size={32} sx={{ color: COLORS.primary }} />
//                     <Typography sx={{ fontSize: '0.75rem', color: COLORS.text.secondary, mt: 1 }}>
//                       Loading delivery challans...
//                     </Typography>
//                   </TableCell>
//                 </TableRow>
//               ) : deliveryChallans.length === 0 ? (
//                 <TableRow>
//                   <TableCell colSpan={canDelete ? 9 : 8} align="center" sx={{ py: 6 }}>
//                     <Box sx={{ textAlign: 'center' }}>
//                       <LocalShippingIcon sx={{ fontSize: 48, color: COLORS.text.tertiary, mb: 1 }} />
//                       <Typography variant="body1" sx={{ fontSize: '0.875rem', color: COLORS.text.secondary, fontWeight: 500 }}>
//                         {searchTerm ? 'No delivery challans found' : 'No delivery challans available'}
//                       </Typography>
//                       <Typography variant="body2" sx={{ fontSize: '0.75rem', color: COLORS.text.tertiary, mt: 0.5 }}>
//                         {searchTerm ? 'Try adjusting your search terms' : 'Create your first delivery challan'}
//                       </Typography>
//                     </Box>
//                   </TableCell>
//                 </TableRow>
//               ) : (
//                 deliveryChallans.map((dc, index) => {
//                   const isSelected = selected.includes(dc._id);
//                   const isActionMenuOpen = Boolean(actionMenuAnchor) && 
//                     selectedDCForAction?._id === dc._id;
//                   const avatarColor = getAvatarColor(dc.customer_name);

//                   return (
//                     <TableRow
//                       key={dc._id || index}
//                       hover
//                       selected={isSelected}
//                       sx={{ 
//                         bgcolor: COLORS.background.white,
//                         '&:hover': {
//                           bgcolor: COLORS.background.hover
//                         },
//                         '&.Mui-selected': {
//                           bgcolor: `${COLORS.primary}10`,
//                           '&:hover': {
//                             bgcolor: `${COLORS.primary}20`
//                           }
//                         },
//                         '& .MuiTableCell-root': {
//                           py: 1.5,
//                           fontSize: '0.75rem',
//                           borderColor: COLORS.border
//                         }
//                       }}
//                     >
//                       {canDelete && (
//                         <TableCell padding="checkbox" sx={{ width: 40 }}>
//                           <Checkbox
//                             checked={isSelected}
//                             onChange={() => handleSelect(dc._id)}
//                             sx={{
//                               color: COLORS.primary,
//                               '&.Mui-checked': {
//                                 color: COLORS.primary,
//                               },
//                               '& .MuiSvgIcon-root': {
//                                 fontSize: '1.25rem'
//                               }
//                             }}
//                           />
//                         </TableCell>
//                       )}
                      
//                       <TableCell>
//                         <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: COLORS.primary }}>
//                           {dc.dc_number}
//                         </Typography>
//                       </TableCell>
                      
//                       <TableCell>
//                         <Typography sx={{ fontSize: '0.75rem', color: COLORS.text.secondary }}>
//                           {formatDate(dc.dc_date)}
//                         </Typography>
//                       </TableCell>
                      
//                       <TableCell>
//                         <Typography sx={{ fontSize: '0.75rem', fontWeight: 500, color: COLORS.text.primary }}>
//                           {dc.so_number}
//                         </Typography>
//                       </TableCell>
                      
//                       <TableCell>
//                         <Stack direction="row" spacing={1.5} alignItems="center">
//                           <Avatar 
//                             sx={{ 
//                               width: 32, 
//                               height: 32, 
//                               bgcolor: avatarColor,
//                               fontSize: '0.7rem',
//                               fontWeight: 600
//                             }}
//                           >
//                             {getCompanyInitials(dc.customer_name)}
//                           </Avatar>
//                           <Box>
//                             <Typography sx={{ fontSize: '0.75rem', fontWeight: 500, color: COLORS.text.primary }}>
//                               {dc.customer_name}
//                             </Typography>
//                             <Typography sx={{ fontSize: '0.65rem', color: COLORS.text.tertiary }}>
//                               GST: {dc.customer_gstin || 'NA'}
//                             </Typography>
//                           </Box>
//                         </Stack>
//                       </TableCell>
                      
//                       <TableCell>
//                         <Chip
//                           label={dc.dc_type}
//                           size="small"
//                           sx={{
//                             fontSize: '0.65rem',
//                             fontWeight: 500,
//                             height: 24,
//                             bgcolor: COLORS.primaryLight,
//                             color: COLORS.primary
//                           }}
//                         />
//                       </TableCell>
                      
//                       <TableCell>
//                         {getStatusChip(dc.status)}
//                       </TableCell>
                      
//                       <TableCell>
//                         <Typography sx={{ fontSize: '0.75rem', color: COLORS.text.primary }}>
//                           {dc.items?.length || 0} item(s)
//                         </Typography>
//                       </TableCell>
                      
//                       <TableCell align="center" sx={{ width: 60 }}>
//                         <ActionMenu 
//                           deliveryChallan={dc}
//                           onView={openViewModalHandler}
//                           onDelete={openDeleteDialogHandler}
//                           onPrint={handlePrint}
//                           onGenerateEWB={handleGenerateEWB}
//                           onPOD={handlePOD}
//                           onRejectDelivery={handleRejectDelivery}
//                           onPackingList={handlePackingList}
//                           onEditPackingList={handleEditPackingList}
//                           onDispatch={handleDispatch}
//                           anchorEl={isActionMenuOpen ? actionMenuAnchor : null}
//                           onClose={handleActionMenuClose}
//                           onOpen={(e) => handleActionMenuOpen(e, dc)}
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

//         {/* Pagination */}
//         <TablePagination
//           rowsPerPageOptions={[5, 10, 25, 50]}
//           component="div"
//           count={totalCount}
//           rowsPerPage={rowsPerPage}
//           page={page}
//           onPageChange={handleChangePage}
//           onRowsPerPageChange={handleChangeRowsPerPage}
//           sx={{
//             borderTop: `1px solid ${COLORS.border}`,
//             '& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows': {
//               fontSize: '0.7rem',
//               color: COLORS.text.secondary
//             },
//             '& .MuiTablePagination-select': {
//               fontSize: '0.7rem'
//             },
//             '& .MuiTablePagination-actions button': {
//               color: COLORS.primary,
//             }
//           }}
//         />
//       </Paper>

//       {/* Modal Components */}
//       {canCreate && (
//         <AddDeliveryChallan 
//           open={openAddModal}
//           onClose={() => setOpenAddModal(false)}
//           onSuccess={handleAddSuccess}
//         />
//       )}

//       {selectedDC && canViewPage && (
//         <ViewDeliveryChallan 
//           open={openViewModal}
//           onClose={() => {
//             setOpenViewModal(false);
//             setSelectedDC(null);
//           }}
//           deliveryChallan={selectedDC}
//         />
//       )}

//       {selectedDC && canDelete && (
//         <DeleteDeliveryChallan 
//           open={openDeleteDialog}
//           onClose={() => {
//             setOpenDeleteDialog(false);
//             setSelectedDC(null);
//           }}
//           deliveryChallan={selectedDC}
//           onDelete={handleDeleteSuccess}
//         />
//       )}

//       <PendingDispatchDialog
//         open={openPendingDispatchDialog}
//         onClose={() => setOpenPendingDispatchDialog(false)}
//         pendingDCs={pendingDispatchDCs}
//       />

//       <GenerateEWBDialog
//         open={openGenerateEWBDialog}
//         onClose={() => {
//           setOpenGenerateEWBDialog(false);
//           setSelectedDC(null);
//         }}
//         deliveryChallan={selectedDC}
//         onSuccess={handleEWBSuccess}
//       />

//       <PODDialog
//         open={openPODDialog}
//         onClose={() => {
//           setOpenPODDialog(false);
//           setSelectedDC(null);
//         }}
//         deliveryChallan={selectedDC}
//         onSuccess={handleEWBSuccess}
//       />

//       <RejectDeliveryDialog
//         open={openRejectDialog}
//         onClose={() => {
//           setOpenRejectDialog(false);
//           setSelectedDC(null);
//         }}
//         deliveryChallan={selectedDC}
//         onSuccess={handleEWBSuccess}
//       />

//       <PackingListDialog
//         open={openPackingListDialog}
//         onClose={() => {
//           setOpenPackingListDialog(false);
//           setSelectedDC(null);
//         }}
//         deliveryChallan={selectedDC}
//         onSuccess={handleEWBSuccess}
//       />

//       <EditPackingListDialog
//         open={openEditPackingListDialog}
//         onClose={() => {
//           setOpenEditPackingListDialog(false);
//           setSelectedDC(null);
//         }}
//         deliveryChallan={selectedDC}
//         onSuccess={handleEWBSuccess}
//       />

//       <DispatchDialog
//         open={openDispatchDialog}
//         onClose={() => {
//           setOpenDispatchDialog(false);
//           setSelectedDC(null);
//         }}
//         deliveryChallan={selectedDC}
//         onSuccess={handleEWBSuccess}
//       />

//       <Snackbar
//         open={snackbar.open}
//         autoHideDuration={3000}
//         onClose={() => setSnackbar({...snackbar, open: false})}
//         anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
//       >
//         <Alert 
//           onClose={() => setSnackbar({...snackbar, open: false})} 
//           severity={snackbar.severity}
//           variant="filled"
//           sx={{ 
//             width: '100%',
//             borderRadius: 1.5,
//             fontSize: '0.75rem',
//             boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
//             '& .MuiAlert-icon': {
//               fontSize: '1.25rem'
//             }
//           }}
//         >
//           {snackbar.message}
//         </Alert>
//       </Snackbar>
//     </Box>
//   );
// };

// export default DeliveryChallanMaster;


import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Box, Paper, Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, IconButton, Button, TextField, InputAdornment, Tooltip,
  Typography, Snackbar, TablePagination, Checkbox, Stack, Chip, Avatar,
  Menu, MenuItem, ListItemIcon, ListItemText, Divider, Alert,
  CircularProgress, Dialog, DialogTitle, DialogContent, DialogActions,
  Grid, FormControl, InputLabel, Select, Autocomplete, debounce, Tabs, Tab,
  Link
} from '@mui/material';
import {
  Search as SearchIcon, Add as AddIcon, Delete as DeleteIcon,
  Visibility as VisibilityIcon, Edit as EditIcon, MoreVert as MoreVertIcon,
  Refresh as RefreshIcon, LocalShipping as LocalShippingIcon,
  PictureAsPdf as PdfIcon, PendingActions as PendingActionsIcon,
  QrCode as QrCodeIcon, AssignmentTurnedIn as AssignmentTurnedInIcon,
  Cancel as CancelIcon, LocalActivity as LocalActivityIcon,
  Close as CloseIcon, Print as PrintIcon, 
  ArrowDownward as ArrowDownwardIcon, Receipt as ReceiptIcon,
  Inventory as InventoryIcon, OpenInNew as OpenInNewIcon
} from '@mui/icons-material';
import axios from 'axios';
import BASE_URL from '../../../config/Config';
import { hasPermission, ACTIONS, MODULES, PAGES } from '../../../utils/modulePermissions';

// Import modal components
import AddDeliveryChallan from './AddDeliveryChallan';
import ViewDeliveryChallan from './ViewDeliveryChallan';
import DeleteDeliveryChallan from './DeleteDeliveryChallan';
import PendingDispatchDialog from './PendingDispatchDialog';
import GenerateEWBDialog from './GenerateEWBDialog';
import PODDialog from './PODDialog';
import RejectDeliveryDialog from './RejectDeliveryDialog';
import PackingListDialog from './PackingListDialog';
import EditPackingListDialog from './EditPackingListDialog';
import DispatchDialog from './DispatchDialog';
import PrePrintChallanDialog from './PrePrintChallanDialog';
import InwardReceiptDialog from './InwardReceiptDialog';
import ViewInwardReceipt from './ViewInwardReceipt';

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
    lightMuted: 'rgba(255, 255, 255, 0.9)'
  },
  background: {
    white: '#FFFFFF',
    light: '#F8FFFC',
    hover: '#F0FDF9',
    tableHeader: '#063C3F'
  },
  border: '#E3E8EF',
  status: {
    Planned: { bg: '#E0F2FE', color: '#0369A1', border: '#BAE6FD' },
    Packed: { bg: '#E0E7FF', color: '#3730A3', border: '#C7D2FE' },
    'EWB Generated': { bg: '#EDE9FE', color: '#6D28D9', border: '#DDD6FE' },
    Dispatched: { bg: '#FEF3C7', color: '#B45309', border: '#FDE68A' },
    Delivered: { bg: '#D1FAE5', color: '#065F46', border: '#A7F3D0' },
    'Rejected by Customer': { bg: '#FEE2E2', color: '#991B1B', border: '#FECACA' },
    'Partially Received': { bg: '#FEF3C7', color: '#B45309', border: '#FDE68A' },
    Received: { bg: '#D1FAE5', color: '#065F46', border: '#A7F3D0' },
    'Not Received': { bg: '#F1F5F9', color: '#475569', border: '#E2E8F0' }
  }
};

const LoadingState = () => (
  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
    <CircularProgress size={40} sx={{ color: COLORS.primary }} />
  </Box>
);

const AccessDenied = () => (
  <Box sx={{ p: 4, textAlign: 'center' }}>
    <Typography variant="h6" color="error" sx={{ mb: 2 }}>Access Denied</Typography>
    <Typography variant="body2" color="text.secondary">
      You don't have permission to view this page. Please contact your administrator.
    </Typography>
  </Box>
);

// Action Menu Component
const ActionMenu = ({
  deliveryChallan, onView, onDelete, onPrint, onGenerateEWB, onPOD,
  onRejectDelivery, onPackingList, onEditPackingList, onDispatch,
  onPrintChallan, onInward, anchorEl, onClose, onOpen, permissions, isSuperAdmin
}) => {
  const canView   = isSuperAdmin || hasPermission(permissions, MODULES.DISPATCH_MASTER, PAGES.DELIVERY_CHALLAN, ACTIONS.VIEW);
  const canCreate = isSuperAdmin || hasPermission(permissions, MODULES.DISPATCH_MASTER, PAGES.DELIVERY_CHALLAN, ACTIONS.CREATE);
  const canUpdate = isSuperAdmin || hasPermission(permissions, MODULES.DISPATCH_MASTER, PAGES.DELIVERY_CHALLAN, ACTIONS.UPDATE);
  const canDelete = isSuperAdmin || hasPermission(permissions, MODULES.DISPATCH_MASTER, PAGES.DELIVERY_CHALLAN, ACTIONS.DELETE);
  const canReject = isSuperAdmin || hasPermission(permissions, MODULES.DISPATCH_MASTER, PAGES.DELIVERY_CHALLAN, ACTIONS.REJECT);

  const showGenerateEWB     = deliveryChallan.status === 'Packed';
  const showPackingList     = deliveryChallan.status === 'Planned';
  const showEditPackingList = deliveryChallan.status === 'Packed';
  const showDispatch        = deliveryChallan.status === 'EWB Generated';
  const showPOD             = deliveryChallan.status === 'Dispatched';
  const showRejectDelivery  = deliveryChallan.status === 'Dispatched';
  const showPrintChallan    = ['Delivered', 'Packed'].includes(deliveryChallan.status);
  const showInward          = ['Packed','Dispatched', 'Delivered', 'Partially Received'].includes(deliveryChallan.status);

  return (
    <>
      <Tooltip title="Actions">
        <IconButton
          size="small"
          onClick={onOpen}
          sx={{ color: COLORS.text.secondary, '&:hover': { bgcolor: `${COLORS.primary}20` } }}
        >
          <MoreVertIcon fontSize="small" />
        </IconButton>
      </Tooltip>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={onClose}
        PaperProps={{
          elevation: 3,
          sx: { mt: 1, minWidth: 180, borderRadius: 2, border: `1px solid ${COLORS.border}`, boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }
        }}
      >
        {canView && (
          <MenuItem onClick={() => { onView(deliveryChallan); onClose(); }} sx={{ py: 1.5 }}>
            <ListItemIcon sx={{ color: COLORS.primary, minWidth: 36 }}><VisibilityIcon fontSize="small" /></ListItemIcon>
            <ListItemText><Typography variant="body2" fontWeight={500} sx={{ color: COLORS.text.primary, fontSize: '0.75rem' }}>View Details</Typography></ListItemText>
          </MenuItem>
        )}

        {/* Print Challan — opens pre-print dialog */}
        {showPrintChallan && canView && (
          <MenuItem onClick={() => { onPrintChallan(deliveryChallan); onClose(); }} sx={{ py: 1.5 }}>
            <ListItemIcon sx={{ color: '#0D696C', minWidth: 36 }}><PrintIcon fontSize="small" /></ListItemIcon>
            <ListItemText><Typography variant="body2" fontWeight={500} sx={{ color: '#0D696C', fontSize: '0.75rem' }}>Print Challan</Typography></ListItemText>
          </MenuItem>
        )}

        {showPackingList && canCreate && (
          <MenuItem onClick={() => { onPackingList(deliveryChallan); onClose(); }} sx={{ py: 1.5 }}>
            <ListItemIcon sx={{ color: '#0D696C', minWidth: 36 }}><LocalShippingIcon fontSize="small" /></ListItemIcon>
            <ListItemText><Typography variant="body2" fontWeight={500} sx={{ color: '#0D696C', fontSize: '0.75rem' }}>Packing List</Typography></ListItemText>
          </MenuItem>
        )}

        {showEditPackingList && canUpdate && onEditPackingList && (
          <MenuItem onClick={() => { onEditPackingList(deliveryChallan); onClose(); }} sx={{ py: 1.5 }}>
            <ListItemIcon sx={{ color: '#0D696C', minWidth: 36 }}><EditIcon fontSize="small" /></ListItemIcon>
            <ListItemText><Typography variant="body2" fontWeight={500} sx={{ color: '#0D696C', fontSize: '0.75rem' }}>Edit Packing List</Typography></ListItemText>
          </MenuItem>
        )}

        {showGenerateEWB && canCreate && (
          <MenuItem onClick={() => { onGenerateEWB(deliveryChallan); onClose(); }} sx={{ py: 1.5 }}>
            <ListItemIcon sx={{ color: '#8B5CF6', minWidth: 36 }}><QrCodeIcon fontSize="small" /></ListItemIcon>
            <ListItemText><Typography variant="body2" fontWeight={500} sx={{ color: '#8B5CF6', fontSize: '0.75rem' }}>Generate EWB</Typography></ListItemText>
          </MenuItem>
        )}

        {showDispatch && canCreate && (
          <MenuItem onClick={() => { onDispatch(deliveryChallan); onClose(); }} sx={{ py: 1.5 }}>
            <ListItemIcon sx={{ color: '#0D696C', minWidth: 36 }}><LocalActivityIcon fontSize="small" /></ListItemIcon>
            <ListItemText><Typography variant="body2" fontWeight={500} sx={{ color: '#0D696C', fontSize: '0.75rem' }}>Dispatch</Typography></ListItemText>
          </MenuItem>
        )}

        {showPOD && canCreate && (
          <MenuItem onClick={() => { onPOD(deliveryChallan); onClose(); }} sx={{ py: 1.5 }}>
            <ListItemIcon sx={{ color: '#10B981', minWidth: 36 }}><AssignmentTurnedInIcon fontSize="small" /></ListItemIcon>
            <ListItemText><Typography variant="body2" fontWeight={500} sx={{ color: '#10B981', fontSize: '0.75rem' }}>POD</Typography></ListItemText>
          </MenuItem>
        )}

        {showRejectDelivery && canReject && (
          <MenuItem onClick={() => { onRejectDelivery(deliveryChallan); onClose(); }} sx={{ py: 1.5 }}>
            <ListItemIcon sx={{ color: '#EF4444', minWidth: 36 }}><CancelIcon fontSize="small" /></ListItemIcon>
            <ListItemText><Typography variant="body2" fontWeight={500} sx={{ color: '#EF4444', fontSize: '0.75rem' }}>Reject Delivery</Typography></ListItemText>
          </MenuItem>
        )}

        {showInward && canCreate && (
          <MenuItem onClick={() => { onInward(deliveryChallan); onClose(); }} sx={{ py: 1.5 }}>
            <ListItemIcon sx={{ color: '#0D696C', minWidth: 36 }}><ArrowDownwardIcon fontSize="small" /></ListItemIcon>
            <ListItemText><Typography variant="body2" fontWeight={500} sx={{ color: '#0D696C', fontSize: '0.75rem' }}>Inward Receipt</Typography></ListItemText>
          </MenuItem>
        )}
      </Menu>
    </>
  );
};

const DeliveryChallanMaster = () => {
  // Tab state
  const [activeTab, setActiveTab] = useState(0);
  
  // Delivery Challan states
  const [deliveryChallans, setDeliveryChallans] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [selected, setSelected] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [receiptStatusMap, setReceiptStatusMap] = useState({});
  const [loadingReceiptStatus, setLoadingReceiptStatus] = useState({});
  
  // Inward Receipt states
  const [inwardReceipts, setInwardReceipts] = useState([]);
  const [inwardLoading, setInwardLoading] = useState(false);
  const [inwardSearchInput, setInwardSearchInput] = useState('');
  const [inwardSearchTerm, setInwardSearchTerm] = useState('');
  const [inwardPage, setInwardPage] = useState(0);
  const [inwardRowsPerPage, setInwardRowsPerPage] = useState(5);
  const [inwardTotalCount, setInwardTotalCount] = useState(0);
  const [inwardCurrentPage, setInwardCurrentPage] = useState(1);
  
  const [actionMenuAnchor, setActionMenuAnchor] = useState(null);
  const [selectedDCForAction, setSelectedDCForAction] = useState(null);
  const [openAddModal, setOpenAddModal] = useState(false);
  const [openViewModal, setOpenViewModal] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [openPendingDispatchDialog, setOpenPendingDispatchDialog] = useState(false);
  const [openGenerateEWBDialog, setOpenGenerateEWBDialog] = useState(false);
  const [openPODDialog, setOpenPODDialog] = useState(false);
  const [openRejectDialog, setOpenRejectDialog] = useState(false);
  const [openPackingListDialog, setOpenPackingListDialog] = useState(false);
  const [openEditPackingListDialog, setOpenEditPackingListDialog] = useState(false);
  const [openDispatchDialog, setOpenDispatchDialog] = useState(false);
  const [openPrePrintDialog, setOpenPrePrintDialog] = useState(false);
  const [openInwardDialog, setOpenInwardDialog] = useState(false);
  const [openViewInwardModal, setOpenViewInwardModal] = useState(false);
  const [selectedInwardReceiptId, setSelectedInwardReceiptId] = useState(null);

  const [pendingDispatchDCs, setPendingDispatchDCs] = useState([]);
  const [selectedDC, setSelectedDC] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [userPermissions, setUserPermissions] = useState([]);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [permissionsLoaded, setPermissionsLoaded] = useState(false);
  const isSearchingRef = useRef(false);
  const searchTimeoutRef = useRef(null);
  const inwardSearchTimeoutRef = useRef(null);

  useEffect(() => {
    const fetchUserPermissions = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${BASE_URL}/api/auth/me`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.data.success) {
          const userData = response.data.data;
          setIsSuperAdmin(userData.isSuperAdmin || false);
          setUserPermissions(Array.isArray(userData.permissions) ? userData.permissions : []);
        }
      } catch (err) {
        console.error('Error fetching user permissions:', err);
        setUserPermissions([]);
      } finally {
        setPermissionsLoaded(true);
      }
    };
    fetchUserPermissions();
  }, []);

  const checkPermission = (action) => {
    if (isSuperAdmin) return true;
    return hasPermission(userPermissions, MODULES.DISPATCH_MASTER, PAGES.DELIVERY_CHALLAN, action);
  };

  const canViewPage = checkPermission(ACTIONS.VIEW);
  const canCreate   = checkPermission(ACTIONS.CREATE);
  const canUpdate   = checkPermission(ACTIONS.UPDATE);
  const canDelete   = checkPermission(ACTIONS.DELETE);
  const canReject   = checkPermission(ACTIONS.REJECT);

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    if (newValue === 1) {
      fetchInwardReceipts();
    }
  };

  // Fetch receipt status for a DC
  const fetchReceiptStatus = useCallback(async (dcId) => {
    if (receiptStatusMap[dcId] || loadingReceiptStatus[dcId]) return;
    
    setLoadingReceiptStatus(prev => ({ ...prev, [dcId]: true }));
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${BASE_URL}/api/inward-receipts/receipt-status/${dcId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.data.success) {
        setReceiptStatusMap(prev => ({ ...prev, [dcId]: response.data.data }));
      }
    } catch (err) {
      console.error(`Error fetching receipt status for DC ${dcId}:`, err);
    } finally {
      setLoadingReceiptStatus(prev => ({ ...prev, [dcId]: false }));
    }
  }, [receiptStatusMap, loadingReceiptStatus]);

  // Fetch receipt status for all DCs when they load
  useEffect(() => {
    if (deliveryChallans.length > 0) {
      deliveryChallans.forEach(dc => {
        // Only fetch for DCs that are Packed, Dispatched, Delivered, or Partially Received
        if (['Packed', 'Dispatched', 'Delivered', 'Partially Received'].includes(dc.status)) {
          fetchReceiptStatus(dc._id);
        }
      });
    }
  }, [deliveryChallans, fetchReceiptStatus]);

  // Delivery Challan search handlers
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchInput(value);
    isSearchingRef.current = true;
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    searchTimeoutRef.current = setTimeout(() => {
      setSearchTerm(value);
      setCurrentPage(1);
      setPage(0);
      isSearchingRef.current = false;
    }, 500);
  };

  const handleClearSearch = () => {
    setSearchInput('');
    setSearchTerm('');
    setCurrentPage(1);
    setPage(0);
    isSearchingRef.current = false;
  };

  // Inward Receipt search handlers
  const handleInwardSearchChange = (e) => {
    const value = e.target.value;
    setInwardSearchInput(value);
    if (inwardSearchTimeoutRef.current) clearTimeout(inwardSearchTimeoutRef.current);
    inwardSearchTimeoutRef.current = setTimeout(() => {
      setInwardSearchTerm(value);
      setInwardCurrentPage(1);
      setInwardPage(0);
    }, 500);
  };

  const handleInwardClearSearch = () => {
    setInwardSearchInput('');
    setInwardSearchTerm('');
    setInwardCurrentPage(1);
    setInwardPage(0);
  };

  useEffect(() => {
    return () => { 
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
      if (inwardSearchTimeoutRef.current) clearTimeout(inwardSearchTimeoutRef.current);
    };
  }, []);

  // Fetch Delivery Challans
  const fetchDeliveryChallans = useCallback(async () => {
    if (!canViewPage && !isSuperAdmin) return;
    if (!isSearchingRef.current) setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const params = { page: currentPage, limit: rowsPerPage };
      if (searchTerm) params.search = searchTerm;
      const response = await axios.get(`${BASE_URL}/api/delivery-challans`, {
        headers: { 'Authorization': `Bearer ${token}` },
        params
      });
      if (response.data.success) {
        setDeliveryChallans(response.data.data || []);
        setTotalCount(response.data.pagination?.total || 0);
      } else {
        showNotification('Failed to load delivery challans', 'error');
        setDeliveryChallans([]);
        setTotalCount(0);
      }
    } catch (err) {
      console.error('Error fetching delivery challans:', err);
      showNotification(err.response?.data?.message || 'Failed to load delivery challans', 'error');
      setDeliveryChallans([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  }, [currentPage, rowsPerPage, searchTerm, canViewPage, isSuperAdmin]);

  // Fetch Inward Receipts
  const fetchInwardReceipts = useCallback(async () => {
    setInwardLoading(true);
    try {
      const token = localStorage.getItem('token');
      const params = { page: inwardCurrentPage, limit: inwardRowsPerPage };
      if (inwardSearchTerm) params.search = inwardSearchTerm;
      const response = await axios.get(`${BASE_URL}/api/inward-receipts`, {
        headers: { 'Authorization': `Bearer ${token}` },
        params
      });
      if (response.data.success) {
        setInwardReceipts(response.data.data || []);
        setInwardTotalCount(response.data.pagination?.total || 0);
      } else {
        showNotification('Failed to load inward receipts', 'error');
        setInwardReceipts([]);
        setInwardTotalCount(0);
      }
    } catch (err) {
      console.error('Error fetching inward receipts:', err);
      showNotification(err.response?.data?.message || 'Failed to load inward receipts', 'error');
      setInwardReceipts([]);
      setInwardTotalCount(0);
    } finally {
      setInwardLoading(false);
    }
  }, [inwardCurrentPage, inwardRowsPerPage, inwardSearchTerm]);

  useEffect(() => {
    if (permissionsLoaded && (canViewPage || isSuperAdmin)) {
      fetchDeliveryChallans();
      if (activeTab === 1) {
        fetchInwardReceipts();
      }
    }
  }, [fetchDeliveryChallans, fetchInwardReceipts, permissionsLoaded, canViewPage, isSuperAdmin, activeTab]);

  const fetchPendingDispatchDCs = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${BASE_URL}/api/delivery-challans/pending-dispatch`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.data.success) {
        setPendingDispatchDCs(response.data.data || []);
        setOpenPendingDispatchDialog(true);
      } else {
        showNotification('Failed to load pending dispatch DCs', 'error');
      }
    } catch (err) {
      console.error('Error fetching pending dispatch DCs:', err);
      showNotification('Failed to load pending dispatch DCs', 'error');
    }
  };

  const handleRefresh = () => { 
    fetchDeliveryChallans(); 
    if (activeTab === 1) fetchInwardReceipts();
    showNotification('Data refreshed', 'success'); 
  };

  const handleSelectAll = (event) => {
    if (!canDelete) return;
    setSelected(event.target.checked ? deliveryChallans.map(dc => dc._id) : []);
  };

  const handleSelect = (id) => {
    if (!canDelete) return;
    setSelected(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
    setCurrentPage(newPage + 1);
    setSelected([]);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
    setCurrentPage(1);
    setSelected([]);
  };

  const handleInwardChangePage = (event, newPage) => {
    setInwardPage(newPage);
    setInwardCurrentPage(newPage + 1);
  };

  const handleInwardChangeRowsPerPage = (event) => {
    setInwardRowsPerPage(parseInt(event.target.value, 10));
    setInwardPage(0);
    setInwardCurrentPage(1);
  };

  const handleActionMenuOpen = (event, dc) => {
    setActionMenuAnchor(event.currentTarget);
    setSelectedDCForAction(dc);
  };

  const handleActionMenuClose = () => {
    setActionMenuAnchor(null);
    setSelectedDCForAction(null);
  };

  const openViewModalHandler = (dc) => {
    if (!canViewPage) { showNotification("You don't have permission to view delivery challan details", 'error'); return; }
    setSelectedDC(dc);
    setOpenViewModal(true);
    handleActionMenuClose();
  };

  const openDeleteDialogHandler = (dc) => {
    if (!canDelete) { showNotification("You don't have permission to delete delivery challans", 'error'); return; }
    setSelectedDC(dc);
    setOpenDeleteDialog(true);
    handleActionMenuClose();
  };

  const handleGenerateEWB = (dc) => {
    if (!canCreate) { showNotification("You don't have permission to generate EWB", 'error'); return; }
    setSelectedDC(dc);
    setOpenGenerateEWBDialog(true);
    handleActionMenuClose();
  };

  const handlePOD = (dc) => {
    if (!canCreate) { showNotification("You don't have permission to update POD", 'error'); return; }
    setSelectedDC(dc);
    setOpenPODDialog(true);
    handleActionMenuClose();
  };

  const handleRejectDelivery = (dc) => {
    if (!canReject) { showNotification("You don't have permission to reject delivery", 'error'); return; }
    setSelectedDC(dc);
    setOpenRejectDialog(true);
    handleActionMenuClose();
  };

  const handlePackingList = (dc) => {
    if (!canCreate) { showNotification("You don't have permission to generate packing list", 'error'); return; }
    setSelectedDC(dc);
    setOpenPackingListDialog(true);
    handleActionMenuClose();
  };

  const handleEditPackingList = (dc) => {
    if (!canUpdate) { showNotification("You don't have permission to edit packing list", 'error'); return; }
    setSelectedDC(dc);
    setOpenEditPackingListDialog(true);
    handleActionMenuClose();
  };

  const handleDispatch = (dc) => {
    if (!canCreate) { showNotification("You don't have permission to dispatch", 'error'); return; }
    setSelectedDC(dc);
    setOpenDispatchDialog(true);
    handleActionMenuClose();
  };

  const handlePrint = (dc) => {
    if (!canViewPage) { showNotification("You don't have permission to print", 'error'); return; }
    window.open(`${BASE_URL}/api/delivery-challans/${dc._id}/print`, '_blank');
  };

  const handlePrintChallan = (dc) => {
    if (!canViewPage) { showNotification("You don't have permission to print delivery challan", 'error'); return; }
    setSelectedDC(dc);
    setOpenPrePrintDialog(true);
    handleActionMenuClose();
  };

  const handleInward = (dc) => {
    if (!canCreate) {
      showNotification("You don't have permission to create inward receipt", 'error');
      return;
    }
    setSelectedDC(dc);
    setOpenInwardDialog(true);
    handleActionMenuClose();
  };

  const handleViewInwardReceipt = (receiptId) => {
    setSelectedInwardReceiptId(receiptId);
    setOpenViewInwardModal(true);
  };

  const handleAddSuccess = () => {
    setOpenAddModal(false);
    fetchDeliveryChallans();
    showNotification('Delivery Challan created successfully!', 'success');
  };

  const handleDeleteSuccess = () => {
    setOpenDeleteDialog(false);
    setSelectedDC(null);
    fetchDeliveryChallans();
    showNotification('Delivery Challan deleted successfully!', 'success');
  };

  const handleEWBSuccess = () => {
    fetchDeliveryChallans();
    showNotification('Operation completed successfully!', 'success');
  };

  const handleInwardSuccess = () => {
    setOpenInwardDialog(false);
    setSelectedDC(null);
    fetchDeliveryChallans();
    fetchInwardReceipts();
    showNotification('Inward receipt created successfully!', 'success');
  };

  const handleBulkDelete = async () => {
    if (!canDelete || selected.length === 0) return;
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${BASE_URL}/api/delivery-challans/bulk-delete`,
        { ids: selected },
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      setSelected([]);
      if (deliveryChallans.length === selected.length && currentPage > 1) {
        setCurrentPage(prev => prev - 1);
        setPage(prev => prev - 1);
      } else {
        fetchDeliveryChallans();
      }
      showNotification(`${selected.length} delivery challan(s) deleted successfully!`, 'success');
    } catch (err) {
      console.error('Bulk delete error:', err);
      showNotification('Failed to delete delivery challans', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (message, severity) => setSnackbar({ open: true, message, severity });

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const getStatusChip = (status) => {
    const colors = COLORS.status[status] || { bg: '#F1F5F9', color: '#475569', border: '#E2E8F0' };
    return (
      <Chip label={status} size="small" sx={{
        fontSize: '0.65rem', fontWeight: 500, height: 24,
        bgcolor: colors.bg, color: colors.color, border: `1px solid ${colors.border}`
      }} />
    );
  };

  const getCompanyInitials = (companyName) => {
    if (!companyName) return 'C';
    const words = companyName.split(' ');
    return words.length >= 2
      ? `${words[0].charAt(0)}${words[1].charAt(0)}`.toUpperCase()
      : companyName.substring(0, 2).toUpperCase();
  };

  const getAvatarColor = (companyName) => {
    if (!companyName) return COLORS.primary;
    const colors = [COLORS.primary, COLORS.primaryDark, '#074346', '#0D696C', '#128C7E'];
    return colors[(companyName.charCodeAt(0) || 0) % colors.length];
  };

  const handleOpenDocument = (filePath) => {
    if (filePath) {
      // Clean up the file path - replace backslashes with forward slashes
      const cleanPath = filePath.replace(/\\/g, '/');
      window.open(`${BASE_URL}/${cleanPath}`, '_blank');
    }
  };

  // Render Delivery Challan Table
  const renderDeliveryChallanTable = () => (
    <Paper sx={{ width: '100%', borderRadius: 2, overflow: 'hidden', boxShadow: '0 1px 3px 0 rgba(0,0,0,0.05)', border: `1px solid ${COLORS.border}` }}>
      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow sx={{ bgcolor: COLORS.background.tableHeader, '& .MuiTableCell-root': { borderBottom: 'none', color: COLORS.text.light, py: 1.5 } }}>
              {canDelete && (
                <TableCell padding="checkbox" sx={{ width: 40 }}>
                  <Checkbox
                    indeterminate={selected.length > 0 && selected.length < deliveryChallans.length}
                    checked={deliveryChallans.length > 0 && selected.length === deliveryChallans.length}
                    onChange={handleSelectAll}
                    sx={{ color: COLORS.text.light, '&.Mui-checked': { color: COLORS.text.light }, '&.MuiCheckbox-indeterminate': { color: COLORS.text.light }, '& .MuiSvgIcon-root': { fontSize: '1.25rem' } }}
                    disabled={loading || deliveryChallans.length === 0}
                  />
                </TableCell>
              )}
              {['DC Number','DC Date','Customer','Nature of Processing','Status','Inward Status','Items'].map(h => (
                <TableCell key={h} sx={{ fontWeight: 600, fontSize: '0.7rem', letterSpacing: '0.5px', color: COLORS.text.light }}>{h}</TableCell>
              ))}
              <TableCell sx={{ fontWeight: 600, fontSize: '0.7rem', letterSpacing: '0.5px', width: 60, color: COLORS.text.light }} align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={canDelete ? 9 : 8} align="center" sx={{ py: 6 }}>
                  <CircularProgress size={32} sx={{ color: COLORS.primary }} />
                  <Typography sx={{ fontSize: '0.75rem', color: COLORS.text.secondary, mt: 1 }}>Loading delivery challans...</Typography>
                </TableCell>
              </TableRow>
            ) : deliveryChallans.length === 0 ? (
              <TableRow>
                <TableCell colSpan={canDelete ? 9 : 8} align="center" sx={{ py: 6 }}>
                  <Box sx={{ textAlign: 'center' }}>
                    <LocalShippingIcon sx={{ fontSize: 48, color: COLORS.text.tertiary, mb: 1 }} />
                    <Typography variant="body1" sx={{ fontSize: '0.875rem', color: COLORS.text.secondary, fontWeight: 500 }}>
                      {searchTerm ? 'No delivery challans found' : 'No delivery challans available'}
                    </Typography>
                    <Typography variant="body2" sx={{ fontSize: '0.75rem', color: COLORS.text.tertiary, mt: 0.5 }}>
                      {searchTerm ? 'Try adjusting your search terms' : 'Create your first delivery challan'}
                    </Typography>
                  </Box>
                </TableCell>
              </TableRow>
            ) : (
              deliveryChallans.map((dc, index) => {
                const isSelected = selected.includes(dc._id);
                const isActionMenuOpen = Boolean(actionMenuAnchor) && selectedDCForAction?._id === dc._id;
                const avatarColor = getAvatarColor(dc.customer_name);
                const receiptStatus = receiptStatusMap[dc._id];
                const isLoadingReceiptStatus = loadingReceiptStatus[dc._id];
                
                // Get nature of processing from either top-level or job_work object
                const natureOfProcessing = dc.nature_of_processing || dc.job_work?.nature_of_processing || '-';
                
                return (
                  <TableRow
                    key={dc._id || index} hover selected={isSelected}
                    sx={{
                      bgcolor: COLORS.background.white,
                      '&:hover': { bgcolor: COLORS.background.hover },
                      '&.Mui-selected': { bgcolor: `${COLORS.primary}10`, '&:hover': { bgcolor: `${COLORS.primary}20` } },
                      '& .MuiTableCell-root': { py: 1.5, fontSize: '0.75rem', borderColor: COLORS.border }
                    }}
                  >
                    {canDelete && (
                      <TableCell padding="checkbox" sx={{ width: 40 }}>
                        <Checkbox checked={isSelected} onChange={() => handleSelect(dc._id)}
                          sx={{ color: COLORS.primary, '&.Mui-checked': { color: COLORS.primary }, '& .MuiSvgIcon-root': { fontSize: '1.25rem' } }} />
                      </TableCell>
                    )}
                    <TableCell><Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: COLORS.primary }}>{dc.dc_number}</Typography></TableCell>
                    <TableCell><Typography sx={{ fontSize: '0.75rem', color: COLORS.text.secondary }}>{formatDate(dc.dc_date)}</Typography></TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={1.5} alignItems="center">
                        <Avatar sx={{ width: 32, height: 32, bgcolor: avatarColor, fontSize: '0.7rem', fontWeight: 600 }}>
                          {getCompanyInitials(dc.customer_name)}
                        </Avatar>
                        <Box>
                          <Typography sx={{ fontSize: '0.75rem', fontWeight: 500, color: COLORS.text.primary }}>{dc.customer_name}</Typography>
                          <Typography sx={{ fontSize: '0.65rem', color: COLORS.text.tertiary }}>GST: {dc.customer_gstin || 'NA'}</Typography>
                        </Box>
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={natureOfProcessing} 
                        size="small" 
                        sx={{ 
                          fontSize: '0.65rem', 
                          fontWeight: 500, 
                          height: 24, 
                          bgcolor: COLORS.primaryLight, 
                          color: COLORS.primary 
                        }} 
                      />
                    </TableCell>
                    <TableCell>{getStatusChip(dc.status)}</TableCell>
                    <TableCell>
                      {isLoadingReceiptStatus ? (
                        <CircularProgress size={16} sx={{ color: COLORS.primary }} />
                      ) : receiptStatus ? (
                        <Stack spacing={0.5}>
                          {getStatusChip(receiptStatus.receipt_status || 'Not Received')}
                          {receiptStatus.is_fully_received && (
                            <Typography sx={{ fontSize: '0.6rem', color: COLORS.text.tertiary }}>
                              Fully Received
                            </Typography>
                          )}
                          {receiptStatus.total_received_qty !== undefined && (
                            <Typography sx={{ fontSize: '0.6rem', color: COLORS.text.tertiary }}>
                              {receiptStatus.total_received_qty}/{receiptStatus.total_dispatch_qty} received
                            </Typography>
                          )}
                        </Stack>
                      ) : (
                        <Typography sx={{ fontSize: '0.7rem', color: COLORS.text.tertiary }}>
                          Not Available
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell><Typography sx={{ fontSize: '0.75rem', color: COLORS.text.primary }}>{dc.items?.length || 0} item(s)</Typography></TableCell>
                    <TableCell align="center" sx={{ width: 60 }}>
                      <ActionMenu
                        deliveryChallan={dc}
                        onView={openViewModalHandler}
                        onDelete={openDeleteDialogHandler}
                        onPrint={handlePrint}
                        onGenerateEWB={handleGenerateEWB}
                        onPOD={handlePOD}
                        onRejectDelivery={handleRejectDelivery}
                        onPackingList={handlePackingList}
                        onEditPackingList={handleEditPackingList}
                        onDispatch={handleDispatch}
                        onPrintChallan={handlePrintChallan}
                        onInward={handleInward}
                        anchorEl={isActionMenuOpen ? actionMenuAnchor : null}
                        onClose={handleActionMenuClose}
                        onOpen={(e) => handleActionMenuOpen(e, dc)}
                        permissions={userPermissions}
                        isSuperAdmin={isSuperAdmin}
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
        sx={{
          borderTop: `1px solid ${COLORS.border}`,
          '& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows': { fontSize: '0.7rem', color: COLORS.text.secondary },
          '& .MuiTablePagination-select': { fontSize: '0.7rem' },
          '& .MuiTablePagination-actions button': { color: COLORS.primary }
        }}
      />
    </Paper>
  );

  // Render Inward Receipt Table
  const renderInwardReceiptTable = () => (
    <Paper sx={{ width: '100%', borderRadius: 2, overflow: 'hidden', boxShadow: '0 1px 3px 0 rgba(0,0,0,0.05)', border: `1px solid ${COLORS.border}` }}>
      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow sx={{ bgcolor: COLORS.background.tableHeader, '& .MuiTableCell-root': { borderBottom: 'none', color: COLORS.text.light, py: 1.5 } }}>
              {['Receipt ID', 'DC Number', 'Customer', 'Receipt Type', 'Status', 'Items', 'Total Qty', 'Documents'].map(h => (
                <TableCell key={h} sx={{ fontWeight: 600, fontSize: '0.7rem', letterSpacing: '0.5px', color: COLORS.text.light }}>{h}</TableCell>
              ))}
              <TableCell sx={{ fontWeight: 600, fontSize: '0.7rem', letterSpacing: '0.5px', color: COLORS.text.light }} align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {inwardLoading ? (
              <TableRow>
                <TableCell colSpan={9} align="center" sx={{ py: 6 }}>
                  <CircularProgress size={32} sx={{ color: COLORS.primary }} />
                  <Typography sx={{ fontSize: '0.75rem', color: COLORS.text.secondary, mt: 1 }}>Loading inward receipts...</Typography>
                </TableCell>
              </TableRow>
            ) : inwardReceipts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} align="center" sx={{ py: 6 }}>
                  <Box sx={{ textAlign: 'center' }}>
                    <ReceiptIcon sx={{ fontSize: 48, color: COLORS.text.tertiary, mb: 1 }} />
                    <Typography variant="body1" sx={{ fontSize: '0.875rem', color: COLORS.text.secondary, fontWeight: 500 }}>
                      {inwardSearchTerm ? 'No inward receipts found' : 'No inward receipts available'}
                    </Typography>
                    <Typography variant="body2" sx={{ fontSize: '0.75rem', color: COLORS.text.tertiary, mt: 0.5 }}>
                      {inwardSearchTerm ? 'Try adjusting your search terms' : 'Create your first inward receipt from a delivery challan'}
                    </Typography>
                  </Box>
                </TableCell>
              </TableRow>
            ) : (
              inwardReceipts.map((receipt, index) => (
                <TableRow
                  key={receipt._id || index}
                  hover
                  sx={{
                    bgcolor: COLORS.background.white,
                    '&:hover': { bgcolor: COLORS.background.hover },
                    '& .MuiTableCell-root': { py: 1.5, fontSize: '0.75rem', borderColor: COLORS.border }
                  }}
                >
                  <TableCell>
                    <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: COLORS.primary }}>
                      {receipt.receipt_id || receipt._id?.slice(-6)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography sx={{ fontSize: '0.75rem', fontWeight: 500, color: COLORS.text.primary }}>
                      {receipt.dc_number || '-'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography sx={{ fontSize: '0.75rem', fontWeight: 500, color: COLORS.text.primary }}>
                      {receipt.customer_name || '-'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={receipt.receipt_type} 
                      size="small" 
                      sx={{ 
                        fontSize: '0.65rem', 
                        fontWeight: 500, 
                        height: 24, 
                        bgcolor: COLORS.primaryLight, 
                        color: COLORS.primary 
                      }} 
                    />
                  </TableCell>
                  <TableCell>{getStatusChip(receipt.status)}</TableCell>
                  <TableCell>
                    <Typography sx={{ fontSize: '0.75rem', color: COLORS.text.primary }}>
                      {receipt.total_items_received || receipt.items?.length || 0} item(s)
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: COLORS.primary }}>
                      {receipt.total_received_qty || 0}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    {receipt.documents && receipt.documents.length > 0 ? (
                      <Stack direction="row" spacing={0.5}>
                        {receipt.documents.map((doc, docIndex) => (
                          <Tooltip key={docIndex} title={`View ${doc.file_name}`}>
                            <IconButton
                              size="small"
                              onClick={() => handleOpenDocument(doc.file_path)}
                              sx={{ 
                                color: COLORS.primary,
                                '&:hover': { bgcolor: `${COLORS.primary}20` }
                              }}
                            >
                              <PdfIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        ))}
                      </Stack>
                    ) : (
                      <Typography sx={{ fontSize: '0.7rem', color: COLORS.text.tertiary }}>
                        No documents
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell align="center">
                    <Tooltip title="View Details">
                      <IconButton
                        size="small"
                        onClick={() => handleViewInwardReceipt(receipt._id)}
                        sx={{ color: COLORS.primary, '&:hover': { bgcolor: `${COLORS.primary}20` } }}
                      >
                        <VisibilityIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        rowsPerPageOptions={[5, 10, 25, 50]}
        component="div"
        count={inwardTotalCount}
        rowsPerPage={inwardRowsPerPage}
        page={inwardPage}
        onPageChange={handleInwardChangePage}
        onRowsPerPageChange={handleInwardChangeRowsPerPage}
        sx={{
          borderTop: `1px solid ${COLORS.border}`,
          '& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows': { fontSize: '0.7rem', color: COLORS.text.secondary },
          '& .MuiTablePagination-select': { fontSize: '0.7rem' },
          '& .MuiTablePagination-actions button': { color: COLORS.primary }
        }}
      />
    </Paper>
  );

  if (!permissionsLoaded) return <LoadingState />;
  if (!canViewPage && !isSuperAdmin) return <AccessDenied />;

  return (
    <Box sx={{ p: 2.5 }}>
      {/* Page Header */}
      <Box sx={{ mb: 2.5 }}>
        <Typography variant="h5" component="h1" sx={{ fontSize: '1.25rem', fontWeight: 700, color: COLORS.text.primary, mb: 0.5 }}>
          Dispatch Management
        </Typography>
        <Typography variant="body2" sx={{ fontSize: '0.75rem', color: COLORS.text.secondary }}>
          Manage delivery challans and inward receipts
        </Typography>
      </Box>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2.5 }}>
        <Tabs value={activeTab} onChange={handleTabChange} sx={{ '& .MuiTab-root': { textTransform: 'none', fontSize: '0.8rem', fontWeight: 500 } }}>
          <Tab 
            icon={<LocalShippingIcon sx={{ fontSize: '1rem' }} />} 
            iconPosition="start" 
            label="Delivery Challans" 
          />
          <Tab 
            icon={<ReceiptIcon sx={{ fontSize: '1rem' }} />} 
            iconPosition="start" 
            label="Inward Receipts" 
          />
        </Tabs>
      </Box>

      {/* Filter and Action Bar */}
      <Paper sx={{ p: 1.5, mb: 2.5, borderRadius: 2, bgcolor: COLORS.background.white, boxShadow: '0 1px 3px 0 rgba(0,0,0,0.05)', border: `1px solid ${COLORS.border}` }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} alignItems="center" justifyContent="space-between">
          <Stack direction="row" spacing={1.5} alignItems="center" sx={{ flex: 1, flexWrap: 'wrap' }}>
            {activeTab === 0 ? (
              <TextField
                placeholder="Search by DC number, customer..."
                size="small"
                value={searchInput}
                onChange={handleSearchChange}
                autoComplete="off"
                sx={{
                  width: { xs: '100%', sm: 320 },
                  '& .MuiOutlinedInput-root': { borderRadius: 1.5, fontSize: '0.75rem', '&:hover fieldset': { borderColor: COLORS.primary } }
                }}
                InputProps={{
                  startAdornment: <InputAdornment position="start"><SearchIcon sx={{ fontSize: '1rem', color: COLORS.text.tertiary }} /></InputAdornment>,
                  endAdornment: searchInput && (
                    <InputAdornment position="end">
                      <IconButton size="small" onClick={handleClearSearch}><CloseIcon fontSize="small" /></IconButton>
                    </InputAdornment>
                  ),
                  sx: {
                    height: 36, bgcolor: COLORS.background.light,
                    '& input': { padding: '6px 12px', fontSize: '0.75rem', color: COLORS.text.primary, '&::placeholder': { color: COLORS.text.tertiary, fontSize: '0.75rem' } }
                  }
                }}
              />
            ) : (
              <TextField
                placeholder="Search by Receipt ID, DC number, customer..."
                size="small"
                value={inwardSearchInput}
                onChange={handleInwardSearchChange}
                autoComplete="off"
                sx={{
                  width: { xs: '100%', sm: 320 },
                  '& .MuiOutlinedInput-root': { borderRadius: 1.5, fontSize: '0.75rem', '&:hover fieldset': { borderColor: COLORS.primary } }
                }}
                InputProps={{
                  startAdornment: <InputAdornment position="start"><SearchIcon sx={{ fontSize: '1rem', color: COLORS.text.tertiary }} /></InputAdornment>,
                  endAdornment: inwardSearchInput && (
                    <InputAdornment position="end">
                      <IconButton size="small" onClick={handleInwardClearSearch}><CloseIcon fontSize="small" /></IconButton>
                    </InputAdornment>
                  ),
                  sx: {
                    height: 36, bgcolor: COLORS.background.light,
                    '& input': { padding: '6px 12px', fontSize: '0.75rem', color: COLORS.text.primary, '&::placeholder': { color: COLORS.text.tertiary, fontSize: '0.75rem' } }
                  }
                }}
              />
            )}
          </Stack>

          <Stack direction="row" spacing={1.5} alignItems="center">
            {activeTab === 0 && canDelete && selected.length > 0 && (
              <Button
                variant="outlined" color="error"
                startIcon={<DeleteIcon sx={{ fontSize: '1rem' }} />}
                onClick={handleBulkDelete}
                sx={{ height: 36, borderRadius: 1.5, textTransform: 'none', fontSize: '0.75rem', fontWeight: 500, borderColor: '#fee2e2', color: '#991b1b', '&:hover': { borderColor: '#fecaca', bgcolor: '#fee2e2' } }}
                disabled={loading}
              >
                Delete ({selected.length})
              </Button>
            )}
            <Button
              variant="outlined"
              startIcon={<RefreshIcon sx={{ fontSize: '1rem' }} />}
              onClick={handleRefresh} disabled={loading || inwardLoading}
              sx={{ height: 36, borderRadius: 1.5, textTransform: 'none', fontSize: '0.75rem', fontWeight: 500, borderColor: COLORS.border, color: COLORS.text.secondary, '&:hover': { borderColor: COLORS.primary, color: COLORS.primary, bgcolor: `${COLORS.primary}10` } }}
            >
              Refresh
            </Button>
            {activeTab === 0 && canCreate && (
              <Button
                variant="contained"
                startIcon={<AddIcon sx={{ fontSize: '1rem' }} />}
                onClick={() => setOpenAddModal(true)}
                sx={{ height: 36, borderRadius: 1.5, bgcolor: COLORS.primary, fontSize: '0.75rem', fontWeight: 500, textTransform: 'none', boxShadow: '0 1px 3px 0 rgba(0,0,0,0.1)', '&:hover': { bgcolor: COLORS.primaryDark } }}
                disabled={loading}
              >
                Create DC
              </Button>
            )}
          </Stack>
        </Stack>
      </Paper>

      {/* Table based on active tab */}
      {activeTab === 0 ? renderDeliveryChallanTable() : renderInwardReceiptTable()}

      {/* Modals */}
      {canCreate && <AddDeliveryChallan open={openAddModal} onClose={() => setOpenAddModal(false)} onSuccess={handleAddSuccess} />}

      {selectedDC && canViewPage && (
        <ViewDeliveryChallan open={openViewModal} onClose={() => { setOpenViewModal(false); setSelectedDC(null); }} deliveryChallan={selectedDC} />
      )}

      <PendingDispatchDialog open={openPendingDispatchDialog} onClose={() => setOpenPendingDispatchDialog(false)} pendingDCs={pendingDispatchDCs} />

      {canCreate && (
        <GenerateEWBDialog open={openGenerateEWBDialog} onClose={() => { setOpenGenerateEWBDialog(false); setSelectedDC(null); }} deliveryChallan={selectedDC} onSuccess={handleEWBSuccess} />
      )}

      {canCreate && (
        <PODDialog open={openPODDialog} onClose={() => { setOpenPODDialog(false); setSelectedDC(null); }} deliveryChallan={selectedDC} onSuccess={handleEWBSuccess} />
      )}

      {canReject && (
        <RejectDeliveryDialog open={openRejectDialog} onClose={() => { setOpenRejectDialog(false); setSelectedDC(null); }} deliveryChallan={selectedDC} onSuccess={handleEWBSuccess} />
      )}

      {canCreate && (
        <PackingListDialog open={openPackingListDialog} onClose={() => { setOpenPackingListDialog(false); setSelectedDC(null); }} deliveryChallan={selectedDC} onSuccess={handleEWBSuccess} />
      )}

      {canUpdate && (
        <EditPackingListDialog open={openEditPackingListDialog} onClose={() => { setOpenEditPackingListDialog(false); setSelectedDC(null); }} deliveryChallan={selectedDC} onSuccess={handleEWBSuccess} />
      )}

      {canCreate && (
        <DispatchDialog open={openDispatchDialog} onClose={() => { setOpenDispatchDialog(false); setSelectedDC(null); }} deliveryChallan={selectedDC} onSuccess={handleEWBSuccess} />
      )}

      {/* Pre-Print Dialog */}
      {selectedDC && canViewPage && (
        <PrePrintChallanDialog
          open={openPrePrintDialog}
          onClose={() => { setOpenPrePrintDialog(false); setSelectedDC(null); }}
          deliveryChallan={selectedDC}
        />
      )}

      {/* Inward Receipt Dialog */}
      {canCreate && (
        <InwardReceiptDialog
          open={openInwardDialog}
          onClose={() => { setOpenInwardDialog(false); setSelectedDC(null); }}
          deliveryChallan={selectedDC}
          onSuccess={handleInwardSuccess}
        />
      )}

      {/* View Inward Receipt Dialog */}
      <ViewInwardReceipt
        open={openViewInwardModal}
        onClose={() => { 
          setOpenViewInwardModal(false); 
          setSelectedInwardReceiptId(null); 
        }}
        receiptId={selectedInwardReceiptId}
      />

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: '100%', borderRadius: 1.5, fontSize: '0.75rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', '& .MuiAlert-icon': { fontSize: '1.25rem' } }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default DeliveryChallanMaster;