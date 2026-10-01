// // WorkOrdersMaster.jsx - Updated with all separate components
// import React, { useState, useEffect, useCallback } from 'react';
// import {
//   Box, Paper, Table, TableBody, TableCell, TableContainer, TableHead,
//   TableRow, IconButton, Button, TextField, InputAdornment, Tooltip,
//   Typography, Snackbar, TablePagination, Checkbox, Stack, Chip,
//   Avatar, Menu, MenuItem, ListItemIcon, ListItemText, Divider,
//   Alert, CircularProgress, Dialog, DialogTitle, DialogContent,
//   DialogActions, Autocomplete, Switch, FormControlLabel,
//   Grid, Tabs, Tab, Card, CardContent
// } from '@mui/material';
// import {
//   Search as SearchIcon,
//   Add as AddIcon,
//   Delete as DeleteIcon,
//   Visibility as ViewIcon,
//   Edit as EditIcon,
//   MoreVert as MoreVertIcon,
//   Assignment as AssignmentIcon,
//   CheckCircle as CheckCircleIcon,
//   Cancel as CancelIcon,
//   PlayArrow as PlayArrowIcon,
//   RocketLaunch as RocketLaunchIcon,
//   Block as BlockIcon,
//   PlayCircleOutline as StartIcon,
//   TaskAlt as CompleteOpIcon,
//   FactCheck as CompleteWOIcon,
//   WorkHistory as LabourIcon,
//   Settings as SettingsIcon,
//   MonetizationOn as JobCostingIcon,
//   Receipt as JobCardIcon,
//   Timeline as TimelineIcon,
//   Assessment as WipReportIcon,
//   Queue as AssemblyQueueIcon,
//   Bolt as BoltIcon,
//   Science as ScienceIcon,
//   PauseCircleOutline as HoldIcon
// } from '@mui/icons-material';
// import axios from 'axios';
// import BASE_URL from '../../../config/Config';
// import AddWorkOrder from './AddWorkOrder';
// import EditWorkOrder from './EditWorkOrder';
// import ViewWorkOrder from './ViewWorkOrder';

// // Import all separate components
// import ActionMenu from './UpdatedActionMenu';
// import JobCostingPopup from './JobCoasting';
// import TimelinePopup from './Timeline';
// import WipReportPopup from './WipReport';
// import AssemblyQueuePopup from './AssemblyQueue';
// import AddOperationsPopup from './AddOperations';
// import CompleteOperationPopup from './CompleteOpreation';
// import LabourEntryPopup from './LabourEntry';
// import CompleteWorkOrderPopup from './CompleteWorkOrder';
// import HoldWorkOrderPopup from './HoldWorkOrder';
// import ResumeWorkOrderPopup from './ResumeWorkOrder';
// import CancelWorkOrderPopup from './CancelWorkOrder';

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
//   },
//   background: {
//     white: '#FFFFFF',
//     light: '#F8FFFC',
//     hover: '#F0FDF9',
//     tableHeader: '#063C3F'
//   },
//   border: '#E3E8EF',
// };

// // Status color mapping
// const STATUS_COLORS = {
//   'Planned': { bg: '#E0F2FE', color: '#0284C7', border: '#BAE6FD' },
//   'Released': { bg: '#E0E7FF', color: '#4338CA', border: '#C7D2FE' },
//   'Components Kitted': { bg: '#FEF3C7', color: '#D97706', border: '#FDE68A' },
//   'In Progress': { bg: '#E0F2FE', color: '#0284C7', border: '#BAE6FD' },
//   'Partially Completed': { bg: '#FEF3C7', color: '#D97706', border: '#FDE68A' },
//   'On Hold': { bg: '#FEE2E2', color: '#DC2626', border: '#FECACA' },
//   'Completed': { bg: '#D1FAE5', color: '#059669', border: '#A7F3D0' },
//   'Cancelled': { bg: '#F3F4F6', color: '#6B7280', border: '#E5E7EB' }
// };

// const PRIORITY_COLORS = {
//   'Critical': { bg: '#FEE2E2', color: '#DC2626' },
//   'High': { bg: '#FEF3C7', color: '#D97706' },
//   'Medium': { bg: '#E0F2FE', color: '#0284C7' },
//   'Low': { bg: '#D1FAE5', color: '#059669' }
// };

// // Main Component
// const WorkOrdersMaster = () => {
//   const [workOrders, setWorkOrders] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [searchInput, setSearchInput] = useState('');
//   const [searchTerm, setSearchTerm] = useState('');
//   const [page, setPage] = useState(0);
//   const [rowsPerPage, setRowsPerPage] = useState(10);
//   const [totalItems, setTotalItems] = useState(0);
//   const [selected, setSelected] = useState([]);
//   const [actionMenuAnchor, setActionMenuAnchor] = useState(null);
//   const [selectedWorkOrderForMenu, setSelectedWorkOrderForMenu] = useState(null);
//   const [selectedWorkOrder, setSelectedWorkOrder] = useState(null);
//   const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

//   // Modal states
//   const [openAdd, setOpenAdd] = useState(false);
//   const [openEdit, setOpenEdit] = useState(false);
//   const [openView, setOpenView] = useState(false);
//   const [openCancel, setOpenCancel] = useState(false);
//   const [openHold, setOpenHold] = useState(false);
//   const [openStart, setOpenStart] = useState(false);
//   const [openResume, setOpenResume] = useState(false);
//   const [openCompleteOp, setOpenCompleteOp] = useState(false);
//   const [openCompleteWO, setOpenCompleteWO] = useState(false);
//   const [openLabour, setOpenLabour] = useState(false);
//   const [openOperations, setOpenOperations] = useState(false);
//   const [openJobCosting, setOpenJobCosting] = useState(false);
//   const [openJobCardLoading, setOpenJobCardLoading] = useState(false);
//   const [openTimeline, setOpenTimeline] = useState(false);
//   const [openWipReport, setOpenWipReport] = useState(false);
//   const [openAssemblyQueue, setOpenAssemblyQueue] = useState(false);

//   useEffect(() => { 
//     const t = setTimeout(() => { setSearchTerm(searchInput); setPage(0); }, 500); 
//     return () => clearTimeout(t); 
//   }, [searchInput]);

//   const fetchWorkOrders = useCallback(async () => {
//     try {
//       setLoading(true);
//       const token = localStorage.getItem('token');
//       const params = new URLSearchParams({ page: page + 1, limit: rowsPerPage });
//       if (searchTerm) params.append('search', searchTerm);
//       const res = await axios.get(`${BASE_URL}/api/work-orders?${params}`, { headers: { Authorization: `Bearer ${token}` } });
//       if (res.data.success) { 
//         setWorkOrders(res.data.data || []); 
//         setTotalItems(res.data.pagination?.total || 0); 
//       } else { 
//         notify('Failed to load work orders', 'error'); 
//       }
//     } catch (err) { 
//       notify('Failed to load work orders', 'error'); 
//     } finally { 
//       setLoading(false); 
//     }
//   }, [page, rowsPerPage, searchTerm]);

//   useEffect(() => { fetchWorkOrders(); }, [fetchWorkOrders]);

//   const notify = (message, severity = 'success') => setSnackbar({ open: true, message, severity });
//   const openModal = (setter, workOrder = null) => { 
//     if (workOrder) setSelectedWorkOrder(workOrder); 
//     setter(true); 
//     setActionMenuAnchor(null); 
//     setSelectedWorkOrderForMenu(null); 
//   };
//   const closeModal = (setter) => { setter(false); setSelectedWorkOrder(null); };
//   const afterAction = (setter, message) => () => { closeModal(setter); fetchWorkOrders(); notify(message); };

//  const handleRelease = async (workOrder) => {
//   try {
//     // ❗ ADD THIS CHECK
//     if (!workOrder.operations || workOrder.operations.length === 0) {
//       notify('Please add operations before releasing the Work Order', 'error');
//       return;
//     }

//     const token = localStorage.getItem('token');
//     const response = await axios.post(
//       `${BASE_URL}/api/work-orders/${workOrder._id}/release`,
//       {},
//       { headers: { Authorization: `Bearer ${token}` } }
//     );

//     if (response.data.success) {
//       notify(`Work Order ${workOrder.wo_number} released successfully!`);
//       fetchWorkOrders();
//     } else {
//       notify(response.data.message || 'Failed to release work order', 'error');
//     }
//   } catch (err) {
//     notify(err.response?.data?.message || 'Failed to release work order', 'error');
//   }
// };

//   const handleStart = async (workOrder) => {
//     try {
//       setLoading(true);
//       const token = localStorage.getItem('token');
//       const response = await axios.post(`${BASE_URL}/api/work-orders/${workOrder._id}/start`, {}, { headers: { Authorization: `Bearer ${token}` } });
//       if (response.data.success) {
//         notify(`Work Order ${workOrder.wo_number} started successfully!`);
//         fetchWorkOrders();
//       } else {
//         notify(response.data.message || 'Failed to start work order', 'error');
//       }
//     } catch (err) {
//       notify(err.response?.data?.message || 'Failed to start work order', 'error');
//     } finally {
//       setLoading(false);
//       setActionMenuAnchor(null);
//       setSelectedWorkOrderForMenu(null);
//     }
//   };

//   const handleOpenOperations = (workOrder) => {
//     setSelectedWorkOrder(workOrder);
//     setOpenOperations(true);
//     setActionMenuAnchor(null);
//     setSelectedWorkOrderForMenu(null);
//   };

//   const handleOperationsAdded = (updatedWorkOrder) => {
//     notify(`Operations added to Work Order ${updatedWorkOrder.wo_number} successfully!`);
//     fetchWorkOrders();
//     setOpenOperations(false);
//     setSelectedWorkOrder(null);
//   };

//   const handleJobCosting = (workOrder) => {
//     setSelectedWorkOrder(workOrder);
//     setOpenJobCosting(true);
//     setActionMenuAnchor(null);
//     setSelectedWorkOrderForMenu(null);
//   };

//   const handleJobCard = async (workOrder) => {
//     try {
//       setOpenJobCardLoading(true);
//       const token = localStorage.getItem('token');
//       const response = await axios.get(`${BASE_URL}/api/work-orders/${workOrder._id}/job-card`, {
//         headers: { Authorization: `Bearer ${token}` },
//         responseType: 'blob'
//       });
//       const url = window.URL.createObjectURL(new Blob([response.data]));
//       const link = document.createElement('a');
//       link.href = url;
//       link.setAttribute('download', `JobCard_${workOrder.wo_number}.pdf`);
//       document.body.appendChild(link);
//       link.click();
//       link.remove();
//       window.URL.revokeObjectURL(url);
//       notify(`Job Card for ${workOrder.wo_number} downloaded successfully!`);
//     } catch (err) {
//       notify(err.response?.data?.message || 'Failed to download job card', 'error');
//     } finally {
//       setOpenJobCardLoading(false);
//       setActionMenuAnchor(null);
//       setSelectedWorkOrderForMenu(null);
//     }
//   };

//   const handleTimeline = (workOrder) => {
//     setSelectedWorkOrder(workOrder);
//     setOpenTimeline(true);
//     setActionMenuAnchor(null);
//     setSelectedWorkOrderForMenu(null);
//   };

//   const handleWipReport = () => setOpenWipReport(true);
//   const handleAssemblyQueue = () => setOpenAssemblyQueue(true);

//   const handleCancel = (workOrder) => { setSelectedWorkOrder(workOrder); setOpenCancel(true); };
//   const handleCancelSubmit = async (cancelledWorkOrder) => { 
//     notify(`Work Order ${cancelledWorkOrder.wo_number} cancelled successfully!`); 
//     fetchWorkOrders(); 
//     setOpenCancel(false); 
//     setSelectedWorkOrder(null); 
//   };

//   const handleHold = (workOrder) => { setSelectedWorkOrder(workOrder); setOpenHold(true); };
//   const handleHoldSubmit = async (heldWorkOrder) => { 
//     notify(`Work Order ${heldWorkOrder.wo_number} placed on hold successfully!`); 
//     fetchWorkOrders(); 
//     setOpenHold(false); 
//     setSelectedWorkOrder(null); 
//   };

//   const handleResume = (workOrder) => { setSelectedWorkOrder(workOrder); setOpenResume(true); };
//   const handleResumeSubmit = async (resumedWorkOrder) => { 
//     notify(`Work Order ${resumedWorkOrder.wo_number} resumed successfully!`); 
//     fetchWorkOrders(); 
//     setOpenResume(false); 
//     setSelectedWorkOrder(null); 
//   };

//   const handleCompleteOp = (workOrder) => { setSelectedWorkOrder(workOrder); setOpenCompleteOp(true); };
//   const handleCompleteOpSubmit = async (completedWorkOrder) => { 
//     notify(`Operation completed successfully!`); 
//     fetchWorkOrders(); 
//     setOpenCompleteOp(false); 
//     setSelectedWorkOrder(null); 
//   };

//   const handleCompleteWO = (workOrder) => { setSelectedWorkOrder(workOrder); setOpenCompleteWO(true); };
//   const handleCompleteWOSubmit = async (completedWorkOrder) => { 
//     notify(`Work Order ${completedWorkOrder.wo_number} completed successfully!`); 
//     fetchWorkOrders(); 
//     setOpenCompleteWO(false); 
//     setSelectedWorkOrder(null); 
//   };

//   const handleLabour = (workOrder) => { setSelectedWorkOrder(workOrder); setOpenLabour(true); };
//   const handleLabourSubmit = async (labourEntry) => { 
//     notify(`Labour entry added successfully!`); 
//     fetchWorkOrders(); 
//     setOpenLabour(false); 
//     setSelectedWorkOrder(null); 
//   };

//   const handleSelectAll = (e) => setSelected(e.target.checked ? workOrders.map(wo => wo._id) : []);
//   const handleSelect = (id) => setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
//   const handleChangePage = (_, newPage) => { setPage(newPage); setSelected([]); };
//   const handleChangeRows = (e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); setSelected([]); };
//   const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' }) : '—';
  
//   const getStatusIcon = (status) => {
//     switch (status) {
//       case 'Completed': return <CheckCircleIcon sx={{ fontSize: '0.875rem' }} />;
//       case 'Cancelled': return <CancelIcon sx={{ fontSize: '0.875rem' }} />;
//       case 'On Hold': return <HoldIcon sx={{ fontSize: '0.875rem' }} />;
//       case 'In Progress': return <StartIcon sx={{ fontSize: '0.875rem' }} />;
//       case 'Released': return <RocketLaunchIcon sx={{ fontSize: '0.875rem' }} />;
//       default: return <AssignmentIcon sx={{ fontSize: '0.875rem' }} />;
//     }
//   };
  
//   const getInitials = (wo) => wo.customer_name ? wo.customer_name.substring(0, 2).toUpperCase() : 'WO';
//   const getAvatarColor = (wo) => { 
//     const colors = [COLORS.primary, '#074346', '#0D696C', '#128C7E', '#1A9C8F']; 
//     return colors[(wo.customer_name?.charCodeAt(0) || 0) % colors.length]; 
//   };

//   return (
//     <Box sx={{ p: 2.5 }}>
//       <Box sx={{ mb: 2.5 }}>
//         <Typography variant="h5" sx={{ fontSize: '1.25rem', fontWeight: 700, color: COLORS.text.primary, mb: 0.5 }}>Work Orders Master</Typography>
//         <Typography variant="body2" sx={{ fontSize: '0.75rem', color: COLORS.text.secondary }}>Manage production work orders, track progress, and monitor completion status</Typography>
//       </Box>

//       <Paper sx={{ p: 1.5, mb: 2.5, borderRadius: 2, bgcolor: COLORS.background.white, border: `1px solid ${COLORS.border}` }}>
//         <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} alignItems="center" justifyContent="space-between">
//           <TextField 
//             placeholder="Search by WO number, SO number, customer, part number..." 
//             size="small" 
//             value={searchInput} 
//             onChange={(e) => setSearchInput(e.target.value)} 
//             disabled={loading} 
//             sx={{ width: { xs: '100%', sm: 450 }, '& .MuiOutlinedInput-root': { borderRadius: 1.5 } }} 
//             InputProps={{ 
//               startAdornment: <InputAdornment position="start"><SearchIcon sx={{ fontSize: '1rem', color: COLORS.text.tertiary }} /></InputAdornment>, 
//               sx: { height: 36, bgcolor: COLORS.background.light, '& input': { padding: '6px 12px', fontSize: '0.75rem' } } 
//             }} 
//           />
//           <Stack direction="row" spacing={1.5} alignItems="center">
//             {selected.length > 0 && (
//               <Button variant="outlined" color="error" startIcon={<DeleteIcon sx={{ fontSize: '1rem' }} />} sx={{ height: 36, borderRadius: 1.5, textTransform: 'none', fontSize: '0.75rem' }} disabled={loading}>
//                 Delete ({selected.length})
//               </Button>
//             )}
//             <Button variant="outlined" startIcon={<WipReportIcon sx={{ fontSize: '1rem' }} />} onClick={handleWipReport} sx={{ height: 36, borderRadius: 1.5, textTransform: 'none', fontSize: '0.75rem', borderColor: COLORS.primary, color: COLORS.primary, '&:hover': { borderColor: COLORS.primaryDark, bgcolor: `${COLORS.primary}10` } }}>
//               WIP Report
//             </Button>
//             <Button variant="outlined" startIcon={<AssemblyQueueIcon sx={{ fontSize: '1rem' }} />} onClick={handleAssemblyQueue} sx={{ height: 36, borderRadius: 1.5, textTransform: 'none', fontSize: '0.75rem', borderColor: COLORS.primary, color: COLORS.primary, '&:hover': { borderColor: COLORS.primaryDark, bgcolor: `${COLORS.primary}10` } }}>
//               Assembly Queue
//             </Button>
//             <Button variant="contained" startIcon={<AddIcon sx={{ fontSize: '1rem' }} />} onClick={() => setOpenAdd(true)} sx={{ height: 36, borderRadius: 1.5, bgcolor: COLORS.primary, fontSize: '0.75rem', textTransform: 'none', '&:hover': { bgcolor: COLORS.primaryDark } }} disabled={loading}>
//               Add Work Order
//             </Button>
//           </Stack>
//         </Stack>
//       </Paper>

//       <Paper sx={{ width: '100%', borderRadius: 2, overflow: 'hidden', border: `1px solid ${COLORS.border}` }}>
//         <TableContainer>
//           <Table size="small">
//             <TableHead>
//               <TableRow sx={{ bgcolor: COLORS.background.tableHeader, '& .MuiTableCell-root': { borderBottom: 'none', color: COLORS.text.light, py: 1.5 } }}>
//                 <TableCell padding="checkbox" sx={{ width: 40 }}>
//                   <Checkbox 
//                     indeterminate={selected.length > 0 && selected.length < workOrders.length} 
//                     checked={workOrders.length > 0 && selected.length === workOrders.length} 
//                     onChange={handleSelectAll} 
//                     disabled={loading || workOrders.length === 0} 
//                     sx={{ color: COLORS.text.light, '&.Mui-checked': { color: COLORS.text.light }, '& .MuiSvgIcon-root': { fontSize: '1.25rem' } }} 
//                   />
//                 </TableCell>
//                 {['WO / Customer', 'Item Details', 'Qty', 'Dates', 'Priority', 'Status', 'Actions'].map(h => (
//                   <TableCell key={h} align={h === 'Actions' ? 'center' : 'left'} sx={{ fontWeight: 600, fontSize: '0.7rem', letterSpacing: '0.5px' }}>{h}</TableCell>
//                 ))}
//               </TableRow>
//             </TableHead>
//             <TableBody>
//               {loading ? (
//                 <TableRow><TableCell colSpan={8} align="center" sx={{ py: 6 }}><CircularProgress size={32} sx={{ color: COLORS.primary }} /><Typography sx={{ fontSize: '0.75rem', color: COLORS.text.secondary, mt: 1 }}>Loading work orders...</Typography></TableCell></TableRow>
//               ) : workOrders.length === 0 ? (
//                 <TableRow><TableCell colSpan={8} align="center" sx={{ py: 6 }}><AssignmentIcon sx={{ fontSize: 48, color: COLORS.text.tertiary, mb: 1 }} /><Typography sx={{ fontSize: '0.875rem', color: COLORS.text.secondary, fontWeight: 500 }}>{searchTerm ? 'No work orders found' : 'No work orders available'}</Typography><Typography sx={{ fontSize: '0.75rem', color: COLORS.text.tertiary, mt: 0.5 }}>{searchTerm ? 'Try adjusting your search terms' : 'Add your first work order to get started'}</Typography></TableCell></TableRow>
//               ) : (
//                 workOrders.map((wo) => {
//                   const isSelected = selected.includes(wo._id);
//                   const menuOpen = Boolean(actionMenuAnchor) && selectedWorkOrderForMenu?._id === wo._id;
//                   const statusColors = STATUS_COLORS[wo.status] || { bg: '#F1F5F9', color: '#475569', border: '#E2E8F0' };
//                   const priorityColors = PRIORITY_COLORS[wo.priority] || { bg: '#F1F5F9', color: '#475569' };
//                   const completionPercent = wo.planned_qty > 0 ? (wo.completed_qty / wo.planned_qty) * 100 : 0;
                  
//                   return (
//                     <TableRow key={wo._id} hover selected={isSelected} sx={{ bgcolor: COLORS.background.white, '&:hover': { bgcolor: COLORS.background.hover }, '&.Mui-selected': { bgcolor: `${COLORS.primary}10`, '&:hover': { bgcolor: `${COLORS.primary}20` } }, '& .MuiTableCell-root': { py: 1.5, fontSize: '0.75rem', borderColor: COLORS.border } }}>
//                       <TableCell padding="checkbox"><Checkbox checked={isSelected} onChange={() => handleSelect(wo._id)} sx={{ color: COLORS.primary, '&.Mui-checked': { color: COLORS.primary }, '& .MuiSvgIcon-root': { fontSize: '1.25rem' } }} /></TableCell>
//                       <TableCell>
//                         <Stack direction="row" spacing={1.5} alignItems="center">
//                           <Avatar sx={{ width: 32, height: 32, bgcolor: getAvatarColor(wo), fontSize: '0.7rem', fontWeight: 600 }}>{getInitials(wo)}</Avatar>
//                           <Box>
//                             <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: COLORS.text.primary }}>{wo.wo_number}</Typography>
//                             <Typography sx={{ fontSize: '0.65rem', color: COLORS.text.tertiary }}>{wo.customer_name}</Typography>
//                             <Typography sx={{ fontSize: '0.65rem', color: COLORS.text.tertiary }}>SO: {wo.so_number}</Typography>
//                           </Box>
//                         </Stack>
//                       </TableCell>
//                       <TableCell>
//                         <Typography sx={{ fontSize: '0.75rem', fontWeight: 500, color: COLORS.text.primary }}>{wo.part_no}</Typography>
//                         <Typography sx={{ fontSize: '0.65rem', color: COLORS.text.tertiary, maxWidth: 200 }}>{wo.part_name?.substring(0, 40)}{wo.part_name?.length > 40 ? '...' : ''}</Typography>
//                         {wo.drawing_no && <Chip label={`DRG: ${wo.drawing_no}${wo.drawing_revision ? ` Rev ${wo.drawing_revision}` : ''}`} size="small" sx={{ mt: 0.5, height: 18, fontSize: '0.55rem', bgcolor: COLORS.primaryLight, color: COLORS.primary }} />}
//                       </TableCell>
//                       <TableCell>
//                         <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: COLORS.text.primary }}>{wo.completed_qty.toLocaleString()} / {wo.planned_qty.toLocaleString()}</Typography>
//                         <Box sx={{ width: 100, mt: 0.5, bgcolor: '#E5E7EB', borderRadius: 1, overflow: 'hidden' }}>
//                           <Box sx={{ width: `${completionPercent}%`, bgcolor: completionPercent === 100 ? '#059669' : COLORS.primary, height: 3, borderRadius: 1 }} />
//                         </Box>
//                         <Typography sx={{ fontSize: '0.65rem', color: COLORS.text.tertiary, mt: 0.25 }}>{Math.round(completionPercent)}% complete</Typography>
//                       </TableCell>
//                       <TableCell>
//                         <Typography sx={{ fontSize: '0.7rem', color: COLORS.text.secondary }}>Planned: {formatDate(wo.planned_start)} - {formatDate(wo.planned_end)}</Typography>
//                         <Typography sx={{ fontSize: '0.65rem', color: COLORS.text.tertiary }}>Required: {formatDate(wo.required_by)}</Typography>
//                       </TableCell>
//                       <TableCell><Chip label={wo.priority || 'Medium'} size="small" sx={{ fontSize: '0.65rem', fontWeight: 500, height: 24, bgcolor: priorityColors.bg, color: priorityColors.color }} /></TableCell>
//                       <TableCell><Chip icon={getStatusIcon(wo.status)} label={wo.status || 'Planned'} size="small" sx={{ fontSize: '0.65rem', fontWeight: 500, height: 24, bgcolor: statusColors.bg, color: statusColors.color, border: `1px solid ${statusColors.border}` }} /></TableCell>
//                       <TableCell align="center">
//                         <ActionMenu 
//                           item={wo} 
//                           anchorEl={menuOpen ? actionMenuAnchor : null} 
//                           onOpen={(e) => { setActionMenuAnchor(e.currentTarget); setSelectedWorkOrderForMenu(wo); }} 
//                           onClose={() => { setActionMenuAnchor(null); setSelectedWorkOrderForMenu(null); }} 
//                           onView={(w) => openModal(setOpenView, w)} 
//                           onEdit={(w) => openModal(setOpenEdit, w)} 
//                           onRelease={(w) => handleRelease(w)} 
//                           onCancel={(w) => handleCancel(w)} 
//                           onHold={(w) => handleHold(w)} 
//                           onStart={(w) => handleStart(w)}
//                           onResume={(w) => handleResume(w)} 
//                           onCompleteOp={(w) => handleCompleteOp(w)} 
//                           onCompleteWO={(w) => handleCompleteWO(w)} 
//                           onLabour={(w) => handleLabour(w)}
//                           onOperations={(w) => handleOpenOperations(w)}
//                           onJobCosting={(w) => handleJobCosting(w)}
//                           onJobCard={(w) => handleJobCard(w)}
//                           onTimeline={(w) => handleTimeline(w)}
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
//           count={totalItems} 
//           rowsPerPage={rowsPerPage} 
//           page={page} 
//           onPageChange={handleChangePage} 
//           onRowsPerPageChange={handleChangeRows} 
//           sx={{ borderTop: `1px solid ${COLORS.border}`, '& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows': { fontSize: '0.7rem', color: COLORS.text.secondary }, '& .MuiTablePagination-select': { fontSize: '0.7rem' }, '& .MuiTablePagination-actions button': { color: COLORS.primary } }} 
//         />
//       </Paper>

//       {/* Modals */}
//       <AddWorkOrder open={openAdd} onClose={() => setOpenAdd(false)} onAdd={afterAction(setOpenAdd, 'Work order created successfully!')} />
//       {selectedWorkOrder && (
//         <>
//           <EditWorkOrder open={openEdit} onClose={() => closeModal(setOpenEdit)} workOrder={selectedWorkOrder} onUpdate={afterAction(setOpenEdit, 'Work order updated successfully!')} />
//           <ViewWorkOrder open={openView} onClose={() => closeModal(setOpenView)} workOrder={selectedWorkOrder} onEdit={() => { setOpenView(false); setOpenEdit(true); }} />
//           <CancelWorkOrderPopup open={openCancel} onClose={() => setOpenCancel(false)} workOrder={selectedWorkOrder} onCancel={handleCancelSubmit} />
//           <HoldWorkOrderPopup open={openHold} onClose={() => setOpenHold(false)} workOrder={selectedWorkOrder} onHold={handleHoldSubmit} />
//           <ResumeWorkOrderPopup open={openResume} onClose={() => setOpenResume(false)} workOrder={selectedWorkOrder} onResume={handleResumeSubmit} />
//           <CompleteOperationPopup open={openCompleteOp} onClose={() => setOpenCompleteOp(false)} workOrder={selectedWorkOrder} onComplete={handleCompleteOpSubmit} />
//           <CompleteWorkOrderPopup open={openCompleteWO} onClose={() => setOpenCompleteWO(false)} workOrder={selectedWorkOrder} onComplete={handleCompleteWOSubmit} />
//           <LabourEntryPopup open={openLabour} onClose={() => setOpenLabour(false)} workOrder={selectedWorkOrder} onLabour={handleLabourSubmit} />
//           <AddOperationsPopup open={openOperations} onClose={() => setOpenOperations(false)} workOrder={selectedWorkOrder} onOperationsAdded={handleOperationsAdded} />
//           <JobCostingPopup open={openJobCosting} onClose={() => setOpenJobCosting(false)} workOrder={selectedWorkOrder} />
//           <TimelinePopup open={openTimeline} onClose={() => setOpenTimeline(false)} workOrder={selectedWorkOrder} />
//         </>
//       )}
      
//       <WipReportPopup open={openWipReport} onClose={() => setOpenWipReport(false)} />
//       <AssemblyQueuePopup open={openAssemblyQueue} onClose={() => setOpenAssemblyQueue(false)} />
      
//       <Snackbar 
//         open={snackbar.open} 
//         autoHideDuration={3000} 
//         onClose={() => setSnackbar(s => ({ ...s, open: false }))} 
//         anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
//       >
//         <Alert onClose={() => setSnackbar(s => ({ ...s, open: false }))} severity={snackbar.severity} variant="filled" sx={{ width: '100%', borderRadius: 1.5, fontSize: '0.75rem' }}>
//           {snackbar.message}
//         </Alert>
//       </Snackbar>
//     </Box>
//   );
// };

// export default WorkOrdersMaster;




// // WorkOrdersMaster.jsx - Updated with focus-preserving search
// import React, { useState, useEffect, useCallback, useRef } from 'react';
// import {
//   Box, Paper, Table, TableBody, TableCell, TableContainer, TableHead,
//   TableRow, IconButton, Button, TextField, InputAdornment, Tooltip,
//   Typography, Snackbar, TablePagination, Checkbox, Stack, Chip,
//   Avatar, Menu, MenuItem, ListItemIcon, ListItemText, Divider,
//   Alert, CircularProgress, Dialog, DialogTitle, DialogContent,
//   DialogActions, Autocomplete, Switch, FormControlLabel,
//   Grid, Tabs, Tab, Card, CardContent
// } from '@mui/material';
// import {
//   Search as SearchIcon,
//   Add as AddIcon,
//   Delete as DeleteIcon,
//   Visibility as ViewIcon,
//   Edit as EditIcon,
//   MoreVert as MoreVertIcon,
//   Assignment as AssignmentIcon,
//   CheckCircle as CheckCircleIcon,
//   Cancel as CancelIcon,
//   PlayArrow as PlayArrowIcon,
//   RocketLaunch as RocketLaunchIcon,
//   Block as BlockIcon,
//   PlayCircleOutline as StartIcon,
//   TaskAlt as CompleteOpIcon,
//   FactCheck as CompleteWOIcon,
//   WorkHistory as LabourIcon,
//   Settings as SettingsIcon,
//   MonetizationOn as JobCostingIcon,
//   Receipt as JobCardIcon,
//   Timeline as TimelineIcon,
//   Assessment as WipReportIcon,
//   Queue as AssemblyQueueIcon,
//   Bolt as BoltIcon,
//   Science as ScienceIcon,
//   PauseCircleOutline as HoldIcon
// } from '@mui/icons-material';
// import axios from 'axios';
// import BASE_URL from '../../../config/Config';
// import AddWorkOrder from './AddWorkOrder';
// import EditWorkOrder from './EditWorkOrder';
// import ViewWorkOrder from './ViewWorkOrder';

// // Import all separate components
// import ActionMenu from './UpdatedActionMenu';
// import JobCostingPopup from './JobCoasting';
// import TimelinePopup from './Timeline';
// import WipReportPopup from './WipReport';
// import AssemblyQueuePopup from './AssemblyQueue';
// import AddOperationsPopup from './AddOperations';
// import CompleteOperationPopup from './CompleteOpreation';
// import LabourEntryPopup from './LabourEntry';
// import CompleteWorkOrderPopup from './CompleteWorkOrder';
// import HoldWorkOrderPopup from './HoldWorkOrder';
// import ResumeWorkOrderPopup from './ResumeWorkOrder';
// import CancelWorkOrderPopup from './CancelWorkOrder';

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
//   },
//   background: {
//     white: '#FFFFFF',
//     light: '#F8FFFC',
//     hover: '#F0FDF9',
//     tableHeader: '#063C3F'
//   },
//   border: '#E3E8EF',
// };

// // Status color mapping
// const STATUS_COLORS = {
//   'Planned': { bg: '#E0F2FE', color: '#0284C7', border: '#BAE6FD' },
//   'Released': { bg: '#E0E7FF', color: '#4338CA', border: '#C7D2FE' },
//   'Components Kitted': { bg: '#FEF3C7', color: '#D97706', border: '#FDE68A' },
//   'In Progress': { bg: '#E0F2FE', color: '#0284C7', border: '#BAE6FD' },
//   'Partially Completed': { bg: '#FEF3C7', color: '#D97706', border: '#FDE68A' },
//   'On Hold': { bg: '#FEE2E2', color: '#DC2626', border: '#FECACA' },
//   'Completed': { bg: '#D1FAE5', color: '#059669', border: '#A7F3D0' },
//   'Cancelled': { bg: '#F3F4F6', color: '#6B7280', border: '#E5E7EB' }
// };

// const PRIORITY_COLORS = {
//   'Critical': { bg: '#FEE2E2', color: '#DC2626' },
//   'High': { bg: '#FEF3C7', color: '#D97706' },
//   'Medium': { bg: '#E0F2FE', color: '#0284C7' },
//   'Low': { bg: '#D1FAE5', color: '#059669' }
// };

// // Main Component
// const WorkOrdersMaster = () => {
//   const [workOrders, setWorkOrders] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [searchInput, setSearchInput] = useState('');
//   const [searchTerm, setSearchTerm] = useState('');
//   const [page, setPage] = useState(0);
//   const [rowsPerPage, setRowsPerPage] = useState(10);
//   const [totalItems, setTotalItems] = useState(0);
//   const [selected, setSelected] = useState([]);
//   const [actionMenuAnchor, setActionMenuAnchor] = useState(null);
//   const [selectedWorkOrderForMenu, setSelectedWorkOrderForMenu] = useState(null);
//   const [selectedWorkOrder, setSelectedWorkOrder] = useState(null);
//   const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

//   // Modal states
//   const [openAdd, setOpenAdd] = useState(false);
//   const [openEdit, setOpenEdit] = useState(false);
//   const [openView, setOpenView] = useState(false);
//   const [openCancel, setOpenCancel] = useState(false);
//   const [openHold, setOpenHold] = useState(false);
//   const [openStart, setOpenStart] = useState(false);
//   const [openResume, setOpenResume] = useState(false);
//   const [openCompleteOp, setOpenCompleteOp] = useState(false);
//   const [openCompleteWO, setOpenCompleteWO] = useState(false);
//   const [openLabour, setOpenLabour] = useState(false);
//   const [openOperations, setOpenOperations] = useState(false);
//   const [openJobCosting, setOpenJobCosting] = useState(false);
//   const [openJobCardLoading, setOpenJobCardLoading] = useState(false);
//   const [openTimeline, setOpenTimeline] = useState(false);
//   const [openWipReport, setOpenWipReport] = useState(false);
//   const [openAssemblyQueue, setOpenAssemblyQueue] = useState(false);

//   // Ref for search timeout - this prevents input focus loss
//   const searchTimeoutRef = useRef(null);

//   // Handle search input change with proper debounce - NO loading state change
//   const handleSearchChange = (e) => {
//     const value = e.target.value;
//     setSearchInput(value);
    
//     // Clear previous timeout
//     if (searchTimeoutRef.current) {
//       clearTimeout(searchTimeoutRef.current);
//     }
    
//     // Set new timeout for debounce - but don't set loading to true
//     searchTimeoutRef.current = setTimeout(() => {
//       setSearchTerm(value);
//       setPage(0); // Reset to first page when search changes
//       setSelected([]); // Clear selected items when search changes
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

//   const fetchWorkOrders = useCallback(async () => {
//     try {
//       setLoading(true);
//       const token = localStorage.getItem('token');
//       const params = new URLSearchParams({ page: page + 1, limit: rowsPerPage });
//       if (searchTerm) params.append('search', searchTerm);
//       const res = await axios.get(`${BASE_URL}/api/work-orders?${params}`, { headers: { Authorization: `Bearer ${token}` } });
//       if (res.data.success) { 
//         setWorkOrders(res.data.data || []); 
//         setTotalItems(res.data.pagination?.total || 0); 
//       } else { 
//         notify('Failed to load work orders', 'error'); 
//       }
//     } catch (err) { 
//       notify('Failed to load work orders', 'error'); 
//     } finally { 
//       setLoading(false); 
//     }
//   }, [page, rowsPerPage, searchTerm]);

//   useEffect(() => { 
//     fetchWorkOrders(); 
//   }, [fetchWorkOrders]);

//   const notify = (message, severity = 'success') => setSnackbar({ open: true, message, severity });
//   const openModal = (setter, workOrder = null) => { 
//     if (workOrder) setSelectedWorkOrder(workOrder); 
//     setter(true); 
//     setActionMenuAnchor(null); 
//     setSelectedWorkOrderForMenu(null); 
//   };
//   const closeModal = (setter) => { setter(false); setSelectedWorkOrder(null); };
//   const afterAction = (setter, message) => () => { closeModal(setter); fetchWorkOrders(); notify(message); };

//   const handleRelease = async (workOrder) => {
//     try {
//       if (!workOrder.operations || workOrder.operations.length === 0) {
//         notify('Please add operations before releasing the Work Order', 'error');
//         return;
//       }

//       const token = localStorage.getItem('token');
//       const response = await axios.post(
//         `${BASE_URL}/api/work-orders/${workOrder._id}/release`,
//         {},
//         { headers: { Authorization: `Bearer ${token}` } }
//       );

//       if (response.data.success) {
//         notify(`Work Order ${workOrder.wo_number} released successfully!`);
//         fetchWorkOrders();
//       } else {
//         notify(response.data.message || 'Failed to release work order', 'error');
//       }
//     } catch (err) {
//       notify(err.response?.data?.message || 'Failed to release work order', 'error');
//     }
//   };

//   const handleStart = async (workOrder) => {
//     try {
//       setLoading(true);
//       const token = localStorage.getItem('token');
//       const response = await axios.post(`${BASE_URL}/api/work-orders/${workOrder._id}/start`, {}, { headers: { Authorization: `Bearer ${token}` } });
//       if (response.data.success) {
//         notify(`Work Order ${workOrder.wo_number} started successfully!`);
//         fetchWorkOrders();
//       } else {
//         notify(response.data.message || 'Failed to start work order', 'error');
//       }
//     } catch (err) {
//       notify(err.response?.data?.message || 'Failed to start work order', 'error');
//     } finally {
//       setLoading(false);
//       setActionMenuAnchor(null);
//       setSelectedWorkOrderForMenu(null);
//     }
//   };

//   const handleOpenOperations = (workOrder) => {
//     setSelectedWorkOrder(workOrder);
//     setOpenOperations(true);
//     setActionMenuAnchor(null);
//     setSelectedWorkOrderForMenu(null);
//   };

//   const handleOperationsAdded = (updatedWorkOrder) => {
//     notify(`Operations added to Work Order ${updatedWorkOrder.wo_number} successfully!`);
//     fetchWorkOrders();
//     setOpenOperations(false);
//     setSelectedWorkOrder(null);
//   };

//   const handleJobCosting = (workOrder) => {
//     setSelectedWorkOrder(workOrder);
//     setOpenJobCosting(true);
//     setActionMenuAnchor(null);
//     setSelectedWorkOrderForMenu(null);
//   };

//   const handleJobCard = async (workOrder) => {
//     try {
//       setOpenJobCardLoading(true);
//       const token = localStorage.getItem('token');
//       const response = await axios.get(`${BASE_URL}/api/work-orders/${workOrder._id}/job-card`, {
//         headers: { Authorization: `Bearer ${token}` },
//         responseType: 'blob'
//       });
//       const url = window.URL.createObjectURL(new Blob([response.data]));
//       const link = document.createElement('a');
//       link.href = url;
//       link.setAttribute('download', `JobCard_${workOrder.wo_number}.pdf`);
//       document.body.appendChild(link);
//       link.click();
//       link.remove();
//       window.URL.revokeObjectURL(url);
//       notify(`Job Card for ${workOrder.wo_number} downloaded successfully!`);
//     } catch (err) {
//       notify(err.response?.data?.message || 'Failed to download job card', 'error');
//     } finally {
//       setOpenJobCardLoading(false);
//       setActionMenuAnchor(null);
//       setSelectedWorkOrderForMenu(null);
//     }
//   };

//   const handleTimeline = (workOrder) => {
//     setSelectedWorkOrder(workOrder);
//     setOpenTimeline(true);
//     setActionMenuAnchor(null);
//     setSelectedWorkOrderForMenu(null);
//   };

//   const handleWipReport = () => setOpenWipReport(true);
//   const handleAssemblyQueue = () => setOpenAssemblyQueue(true);

//   const handleCancel = (workOrder) => { setSelectedWorkOrder(workOrder); setOpenCancel(true); };
//   const handleCancelSubmit = async (cancelledWorkOrder) => { 
//     notify(`Work Order ${cancelledWorkOrder.wo_number} cancelled successfully!`); 
//     fetchWorkOrders(); 
//     setOpenCancel(false); 
//     setSelectedWorkOrder(null); 
//   };

//   const handleHold = (workOrder) => { setSelectedWorkOrder(workOrder); setOpenHold(true); };
//   const handleHoldSubmit = async (heldWorkOrder) => { 
//     notify(`Work Order ${heldWorkOrder.wo_number} placed on hold successfully!`); 
//     fetchWorkOrders(); 
//     setOpenHold(false); 
//     setSelectedWorkOrder(null); 
//   };

//   const handleResume = (workOrder) => { setSelectedWorkOrder(workOrder); setOpenResume(true); };
//   const handleResumeSubmit = async (resumedWorkOrder) => { 
//     notify(`Work Order ${resumedWorkOrder.wo_number} resumed successfully!`); 
//     fetchWorkOrders(); 
//     setOpenResume(false); 
//     setSelectedWorkOrder(null); 
//   };

//   const handleCompleteOp = (workOrder) => { setSelectedWorkOrder(workOrder); setOpenCompleteOp(true); };
//   const handleCompleteOpSubmit = async (completedWorkOrder) => { 
//     notify(`Operation completed successfully!`); 
//     fetchWorkOrders(); 
//     setOpenCompleteOp(false); 
//     setSelectedWorkOrder(null); 
//   };

//   const handleCompleteWO = (workOrder) => { setSelectedWorkOrder(workOrder); setOpenCompleteWO(true); };
//   const handleCompleteWOSubmit = async (completedWorkOrder) => { 
//     notify(`Work Order ${completedWorkOrder.wo_number} completed successfully!`); 
//     fetchWorkOrders(); 
//     setOpenCompleteWO(false); 
//     setSelectedWorkOrder(null); 
//   };

//   const handleLabour = (workOrder) => { setSelectedWorkOrder(workOrder); setOpenLabour(true); };
//   const handleLabourSubmit = async (labourEntry) => { 
//     notify(`Labour entry added successfully!`); 
//     fetchWorkOrders(); 
//     setOpenLabour(false); 
//     setSelectedWorkOrder(null); 
//   };

//   const handleSelectAll = (e) => setSelected(e.target.checked ? workOrders.map(wo => wo._id) : []);
//   const handleSelect = (id) => setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
//   const handleChangePage = (_, newPage) => { setPage(newPage); setSelected([]); };
//   const handleChangeRows = (e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); setSelected([]); };
//   const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' }) : '—';
  
//   const getStatusIcon = (status) => {
//     switch (status) {
//       case 'Completed': return <CheckCircleIcon sx={{ fontSize: '0.875rem' }} />;
//       case 'Cancelled': return <CancelIcon sx={{ fontSize: '0.875rem' }} />;
//       case 'On Hold': return <HoldIcon sx={{ fontSize: '0.875rem' }} />;
//       case 'In Progress': return <StartIcon sx={{ fontSize: '0.875rem' }} />;
//       case 'Released': return <RocketLaunchIcon sx={{ fontSize: '0.875rem' }} />;
//       default: return <AssignmentIcon sx={{ fontSize: '0.875rem' }} />;
//     }
//   };
  
//   const getInitials = (wo) => wo.customer_name ? wo.customer_name.substring(0, 2).toUpperCase() : 'WO';
//   const getAvatarColor = (wo) => { 
//     const colors = [COLORS.primary, '#074346', '#0D696C', '#128C7E', '#1A9C8F']; 
//     return colors[(wo.customer_name?.charCodeAt(0) || 0) % colors.length]; 
//   };

//   return (
//     <Box sx={{ p: 2.5 }}>
//       <Box sx={{ mb: 2.5 }}>
//         <Typography variant="h5" sx={{ fontSize: '1.25rem', fontWeight: 700, color: COLORS.text.primary, mb: 0.5 }}>Work Orders Master</Typography>
//         <Typography variant="body2" sx={{ fontSize: '0.75rem', color: COLORS.text.secondary }}>Manage production work orders, track progress, and monitor completion status</Typography>
//       </Box>

//       <Paper sx={{ p: 1.5, mb: 2.5, borderRadius: 2, bgcolor: COLORS.background.white, border: `1px solid ${COLORS.border}` }}>
//         <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} alignItems="center" justifyContent="space-between">
//           <TextField 
//             placeholder="Search by WO number, SO number, customer, part number..." 
//             size="small" 
//             value={searchInput} 
//             onChange={handleSearchChange}
//             autoComplete="off"
//             sx={{ 
//               width: { xs: '100%', sm: 450 },
//               '& .MuiOutlinedInput-root': {
//                 borderRadius: 1.5,
//                 fontSize: '0.75rem',
//                 '&:hover fieldset': {
//                   borderColor: COLORS.primary,
//                 },
//               }
//             }} 
//             InputProps={{ 
//               startAdornment: <InputAdornment position="start"><SearchIcon sx={{ fontSize: '1rem', color: COLORS.text.tertiary }} /></InputAdornment>, 
//               sx: { 
//                 height: 36, 
//                 bgcolor: COLORS.background.light,
//                 '& input': {
//                   padding: '6px 12px',
//                   fontSize: '0.75rem',
//                   color: COLORS.text.primary,
//                   '&::placeholder': {
//                     color: COLORS.text.tertiary,
//                     fontSize: '0.75rem'
//                   }
//                 }
//               } 
//             }} 
//           />
//           <Stack direction="row" spacing={1.5} alignItems="center">
//             {selected.length > 0 && (
//               <Button variant="outlined" color="error" startIcon={<DeleteIcon sx={{ fontSize: '1rem' }} />} sx={{ height: 36, borderRadius: 1.5, textTransform: 'none', fontSize: '0.75rem' }} disabled={loading}>
//                 Delete ({selected.length})
//               </Button>
//             )}
//             <Button variant="outlined" startIcon={<WipReportIcon sx={{ fontSize: '1rem' }} />} onClick={handleWipReport} sx={{ height: 36, borderRadius: 1.5, textTransform: 'none', fontSize: '0.75rem', borderColor: COLORS.primary, color: COLORS.primary, '&:hover': { borderColor: COLORS.primaryDark, bgcolor: `${COLORS.primary}10` } }}>
//               WIP Report
//             </Button>
//             <Button variant="outlined" startIcon={<AssemblyQueueIcon sx={{ fontSize: '1rem' }} />} onClick={handleAssemblyQueue} sx={{ height: 36, borderRadius: 1.5, textTransform: 'none', fontSize: '0.75rem', borderColor: COLORS.primary, color: COLORS.primary, '&:hover': { borderColor: COLORS.primaryDark, bgcolor: `${COLORS.primary}10` } }}>
//               Assembly Queue
//             </Button>
//             <Button variant="contained" startIcon={<AddIcon sx={{ fontSize: '1rem' }} />} onClick={() => setOpenAdd(true)} sx={{ height: 36, borderRadius: 1.5, bgcolor: COLORS.primary, fontSize: '0.75rem', textTransform: 'none', '&:hover': { bgcolor: COLORS.primaryDark } }} disabled={loading}>
//               Add Work Order
//             </Button>
//           </Stack>
//         </Stack>
//       </Paper>

//       <Paper sx={{ width: '100%', borderRadius: 2, overflow: 'hidden', border: `1px solid ${COLORS.border}` }}>
//         <TableContainer>
//           <Table size="small">
//             <TableHead>
//               <TableRow sx={{ bgcolor: COLORS.background.tableHeader, '& .MuiTableCell-root': { borderBottom: 'none', color: COLORS.text.light, py: 1.5 } }}>
//                 <TableCell padding="checkbox" sx={{ width: 40 }}>
//                   <Checkbox 
//                     indeterminate={selected.length > 0 && selected.length < workOrders.length} 
//                     checked={workOrders.length > 0 && selected.length === workOrders.length} 
//                     onChange={handleSelectAll} 
//                     disabled={loading || workOrders.length === 0} 
//                     sx={{ color: COLORS.text.light, '&.Mui-checked': { color: COLORS.text.light }, '& .MuiSvgIcon-root': { fontSize: '1.25rem' } }} 
//                   />
//                 </TableCell>
//                 {['WO / Customer', 'Item Details', 'Qty', 'Dates', 'Priority', 'Status', 'Actions'].map(h => (
//                   <TableCell key={h} align={h === 'Actions' ? 'center' : 'left'} sx={{ fontWeight: 600, fontSize: '0.7rem', letterSpacing: '0.5px' }}>{h}</TableCell>
//                 ))}
//               </TableRow>
//             </TableHead>
//             <TableBody>
//               {loading ? (
//                 <TableRow><TableCell colSpan={8} align="center" sx={{ py: 6 }}><CircularProgress size={32} sx={{ color: COLORS.primary }} /><Typography sx={{ fontSize: '0.75rem', color: COLORS.text.secondary, mt: 1 }}>Loading work orders...</Typography></TableCell></TableRow>
//               ) : workOrders.length === 0 ? (
//                 <TableRow><TableCell colSpan={8} align="center" sx={{ py: 6 }}><AssignmentIcon sx={{ fontSize: 48, color: COLORS.text.tertiary, mb: 1 }} /><Typography sx={{ fontSize: '0.875rem', color: COLORS.text.secondary, fontWeight: 500 }}>{searchTerm ? 'No work orders found' : 'No work orders available'}</Typography><Typography sx={{ fontSize: '0.75rem', color: COLORS.text.tertiary, mt: 0.5 }}>{searchTerm ? 'Try adjusting your search terms' : 'Add your first work order to get started'}</Typography></TableCell></TableRow>
//               ) : (
//                 workOrders.map((wo) => {
//                   const isSelected = selected.includes(wo._id);
//                   const menuOpen = Boolean(actionMenuAnchor) && selectedWorkOrderForMenu?._id === wo._id;
//                   const statusColors = STATUS_COLORS[wo.status] || { bg: '#F1F5F9', color: '#475569', border: '#E2E8F0' };
//                   const priorityColors = PRIORITY_COLORS[wo.priority] || { bg: '#F1F5F9', color: '#475569' };
//                   const completionPercent = wo.planned_qty > 0 ? (wo.completed_qty / wo.planned_qty) * 100 : 0;
                  
//                   return (
//                     <TableRow key={wo._id} hover selected={isSelected} sx={{ bgcolor: COLORS.background.white, '&:hover': { bgcolor: COLORS.background.hover }, '&.Mui-selected': { bgcolor: `${COLORS.primary}10`, '&:hover': { bgcolor: `${COLORS.primary}20` } }, '& .MuiTableCell-root': { py: 1.5, fontSize: '0.75rem', borderColor: COLORS.border } }}>
//                       <TableCell padding="checkbox"><Checkbox checked={isSelected} onChange={() => handleSelect(wo._id)} sx={{ color: COLORS.primary, '&.Mui-checked': { color: COLORS.primary }, '& .MuiSvgIcon-root': { fontSize: '1.25rem' } }} /></TableCell>
//                       <TableCell>
//                         <Stack direction="row" spacing={1.5} alignItems="center">
//                           <Avatar sx={{ width: 32, height: 32, bgcolor: getAvatarColor(wo), fontSize: '0.7rem', fontWeight: 600 }}>{getInitials(wo)}</Avatar>
//                           <Box>
//                             <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: COLORS.text.primary }}>{wo.wo_number}</Typography>
//                             <Typography sx={{ fontSize: '0.65rem', color: COLORS.text.tertiary }}>{wo.customer_name}</Typography>
//                             <Typography sx={{ fontSize: '0.65rem', color: COLORS.text.tertiary }}>SO: {wo.so_number}</Typography>
//                           </Box>
//                         </Stack>
//                       </TableCell>
//                       <TableCell>
//                         <Typography sx={{ fontSize: '0.75rem', fontWeight: 500, color: COLORS.text.primary }}>{wo.part_no}</Typography>
//                         <Typography sx={{ fontSize: '0.65rem', color: COLORS.text.tertiary, maxWidth: 200 }}>{wo.part_name?.substring(0, 40)}{wo.part_name?.length > 40 ? '...' : ''}</Typography>
//                         {wo.drawing_no && <Chip label={`DRG: ${wo.drawing_no}${wo.drawing_revision ? ` Rev ${wo.drawing_revision}` : ''}`} size="small" sx={{ mt: 0.5, height: 18, fontSize: '0.55rem', bgcolor: COLORS.primaryLight, color: COLORS.primary }} />}
//                       </TableCell>
//                       <TableCell>
//                         <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: COLORS.text.primary }}>{wo.completed_qty.toLocaleString()} / {wo.planned_qty.toLocaleString()}</Typography>
//                         <Box sx={{ width: 100, mt: 0.5, bgcolor: '#E5E7EB', borderRadius: 1, overflow: 'hidden' }}>
//                           <Box sx={{ width: `${completionPercent}%`, bgcolor: completionPercent === 100 ? '#059669' : COLORS.primary, height: 3, borderRadius: 1 }} />
//                         </Box>
//                         <Typography sx={{ fontSize: '0.65rem', color: COLORS.text.tertiary, mt: 0.25 }}>{Math.round(completionPercent)}% complete</Typography>
//                       </TableCell>
//                       <TableCell>
//                         <Typography sx={{ fontSize: '0.7rem', color: COLORS.text.secondary }}>Planned: {formatDate(wo.planned_start)} - {formatDate(wo.planned_end)}</Typography>
//                         <Typography sx={{ fontSize: '0.65rem', color: COLORS.text.tertiary }}>Required: {formatDate(wo.required_by)}</Typography>
//                       </TableCell>
//                       <TableCell><Chip label={wo.priority || 'Medium'} size="small" sx={{ fontSize: '0.65rem', fontWeight: 500, height: 24, bgcolor: priorityColors.bg, color: priorityColors.color }} /></TableCell>
//                       <TableCell><Chip icon={getStatusIcon(wo.status)} label={wo.status || 'Planned'} size="small" sx={{ fontSize: '0.65rem', fontWeight: 500, height: 24, bgcolor: statusColors.bg, color: statusColors.color, border: `1px solid ${statusColors.border}` }} /></TableCell>
//                       <TableCell align="center">
//                         <ActionMenu 
//                           item={wo} 
//                           anchorEl={menuOpen ? actionMenuAnchor : null} 
//                           onOpen={(e) => { setActionMenuAnchor(e.currentTarget); setSelectedWorkOrderForMenu(wo); }} 
//                           onClose={() => { setActionMenuAnchor(null); setSelectedWorkOrderForMenu(null); }} 
//                           onView={(w) => openModal(setOpenView, w)} 
//                           onEdit={(w) => openModal(setOpenEdit, w)} 
//                           onRelease={(w) => handleRelease(w)} 
//                           onCancel={(w) => handleCancel(w)} 
//                           onHold={(w) => handleHold(w)} 
//                           onStart={(w) => handleStart(w)}
//                           onResume={(w) => handleResume(w)} 
//                           onCompleteOp={(w) => handleCompleteOp(w)} 
//                           onCompleteWO={(w) => handleCompleteWO(w)} 
//                           onLabour={(w) => handleLabour(w)}
//                           onOperations={(w) => handleOpenOperations(w)}
//                           onJobCosting={(w) => handleJobCosting(w)}
//                           onJobCard={(w) => handleJobCard(w)}
//                           onTimeline={(w) => handleTimeline(w)}
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
//           count={totalItems} 
//           rowsPerPage={rowsPerPage} 
//           page={page} 
//           onPageChange={handleChangePage} 
//           onRowsPerPageChange={handleChangeRows} 
//           sx={{ borderTop: `1px solid ${COLORS.border}`, '& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows': { fontSize: '0.7rem', color: COLORS.text.secondary }, '& .MuiTablePagination-select': { fontSize: '0.7rem' }, '& .MuiTablePagination-actions button': { color: COLORS.primary } }} 
//         />
//       </Paper>

//       {/* Modals */}
//       <AddWorkOrder open={openAdd} onClose={() => setOpenAdd(false)} onAdd={afterAction(setOpenAdd, 'Work order created successfully!')} />
//       {selectedWorkOrder && (
//         <>
//           <EditWorkOrder open={openEdit} onClose={() => closeModal(setOpenEdit)} workOrder={selectedWorkOrder} onUpdate={afterAction(setOpenEdit, 'Work order updated successfully!')} />
//           <ViewWorkOrder open={openView} onClose={() => closeModal(setOpenView)} workOrder={selectedWorkOrder} onEdit={() => { setOpenView(false); setOpenEdit(true); }} />
//           <CancelWorkOrderPopup open={openCancel} onClose={() => setOpenCancel(false)} workOrder={selectedWorkOrder} onCancel={handleCancelSubmit} />
//           <HoldWorkOrderPopup open={openHold} onClose={() => setOpenHold(false)} workOrder={selectedWorkOrder} onHold={handleHoldSubmit} />
//           <ResumeWorkOrderPopup open={openResume} onClose={() => setOpenResume(false)} workOrder={selectedWorkOrder} onResume={handleResumeSubmit} />
//           <CompleteOperationPopup open={openCompleteOp} onClose={() => setOpenCompleteOp(false)} workOrder={selectedWorkOrder} onComplete={handleCompleteOpSubmit} />
//           <CompleteWorkOrderPopup open={openCompleteWO} onClose={() => setOpenCompleteWO(false)} workOrder={selectedWorkOrder} onComplete={handleCompleteWOSubmit} />
//           <LabourEntryPopup open={openLabour} onClose={() => setOpenLabour(false)} workOrder={selectedWorkOrder} onLabour={handleLabourSubmit} />
//           <AddOperationsPopup open={openOperations} onClose={() => setOpenOperations(false)} workOrder={selectedWorkOrder} onOperationsAdded={handleOperationsAdded} />
//           <JobCostingPopup open={openJobCosting} onClose={() => setOpenJobCosting(false)} workOrder={selectedWorkOrder} />
//           <TimelinePopup open={openTimeline} onClose={() => setOpenTimeline(false)} workOrder={selectedWorkOrder} />
//         </>
//       )}
      
//       <WipReportPopup open={openWipReport} onClose={() => setOpenWipReport(false)} />
//       <AssemblyQueuePopup open={openAssemblyQueue} onClose={() => setOpenAssemblyQueue(false)} />
      
//       <Snackbar 
//         open={snackbar.open} 
//         autoHideDuration={3000} 
//         onClose={() => setSnackbar(s => ({ ...s, open: false }))} 
//         anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
//       >
//         <Alert onClose={() => setSnackbar(s => ({ ...s, open: false }))} severity={snackbar.severity} variant="filled" sx={{ width: '100%', borderRadius: 1.5, fontSize: '0.75rem' }}>
//           {snackbar.message}
//         </Alert>
//       </Snackbar>
//     </Box>
//   );
// };

// export default WorkOrdersMaster;


import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Box, Paper, Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, IconButton, Button, TextField, InputAdornment, Tooltip,
  Typography, Snackbar, TablePagination, Checkbox, Stack, Chip,
  Avatar, Menu, MenuItem, ListItemIcon, ListItemText, Divider,
  Alert, CircularProgress, Dialog, DialogTitle, DialogContent,
  DialogActions, Autocomplete, Switch, FormControlLabel,
  Grid, Tabs, Tab, Card, CardContent
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
  PlayArrow as PlayArrowIcon,
  RocketLaunch as RocketLaunchIcon,
  Block as BlockIcon,
  PlayCircleOutline as StartIcon,
  TaskAlt as CompleteOpIcon,
  FactCheck as CompleteWOIcon,
  WorkHistory as LabourIcon,
  Settings as SettingsIcon,
  MonetizationOn as JobCostingIcon,
  Receipt as JobCardIcon,
  Timeline as TimelineIcon,
  Assessment as WipReportIcon,
  Queue as AssemblyQueueIcon,
  Bolt as BoltIcon,
  Science as ScienceIcon,
  PauseCircleOutline as HoldIcon
} from '@mui/icons-material';
import axios from 'axios';
import BASE_URL from '../../../config/Config';
import AddWorkOrder from './AddWorkOrder';
import EditWorkOrder from './EditWorkOrder';
import ViewWorkOrder from './ViewWorkOrder';

// Import all separate components
import ActionMenu from './UpdatedActionMenu';
import JobCostingPopup from './JobCoasting';
import TimelinePopup from './Timeline';
import WipReportPopup from './WipReport';
import AssemblyQueuePopup from './AssemblyQueue';
import AddOperationsPopup from './AddOperations';
import CompleteOperationPopup from './CompleteOpreation';
import LabourEntryPopup from './LabourEntry';
import CompleteWorkOrderPopup from './CompleteWorkOrder';
import HoldWorkOrderPopup from './HoldWorkOrder';
import ResumeWorkOrderPopup from './ResumeWorkOrder';
import CancelWorkOrderPopup from './CancelWorkOrder';

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
  'Planned': { bg: '#E0F2FE', color: '#0284C7', border: '#BAE6FD' },
  'Released': { bg: '#E0E7FF', color: '#4338CA', border: '#C7D2FE' },
  'Components Kitted': { bg: '#FEF3C7', color: '#D97706', border: '#FDE68A' },
  'In Progress': { bg: '#E0F2FE', color: '#0284C7', border: '#BAE6FD' },
  'Partially Completed': { bg: '#FEF3C7', color: '#D97706', border: '#FDE68A' },
  'On Hold': { bg: '#FEE2E2', color: '#DC2626', border: '#FECACA' },
  'Completed': { bg: '#D1FAE5', color: '#059669', border: '#A7F3D0' },
  'Cancelled': { bg: '#F3F4F6', color: '#6B7280', border: '#E5E7EB' }
};

const PRIORITY_COLORS = {
  'Critical': { bg: '#FEE2E2', color: '#DC2626' },
  'High': { bg: '#FEF3C7', color: '#D97706' },
  'Medium': { bg: '#E0F2FE', color: '#0284C7' },
  'Low': { bg: '#D1FAE5', color: '#059669' }
};

// Main Component
const WorkOrdersMaster = () => {
  const [workOrders, setWorkOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [selected, setSelected] = useState([]);
  const [actionMenuAnchor, setActionMenuAnchor] = useState(null);
  const [selectedWorkOrderForMenu, setSelectedWorkOrderForMenu] = useState(null);
  const [selectedWorkOrder, setSelectedWorkOrder] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Modal states
  const [openAdd, setOpenAdd] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [openView, setOpenView] = useState(false);
  const [openCancel, setOpenCancel] = useState(false);
  const [openHold, setOpenHold] = useState(false);
  const [openStart, setOpenStart] = useState(false);
  const [openResume, setOpenResume] = useState(false);
  const [openCompleteOp, setOpenCompleteOp] = useState(false);
  const [openCompleteWO, setOpenCompleteWO] = useState(false);
  const [openLabour, setOpenLabour] = useState(false);
  const [openOperations, setOpenOperations] = useState(false);
  const [openJobCosting, setOpenJobCosting] = useState(false);
  const [openJobCardLoading, setOpenJobCardLoading] = useState(false);
  const [openTimeline, setOpenTimeline] = useState(false);
  const [openWipReport, setOpenWipReport] = useState(false);
  const [openAssemblyQueue, setOpenAssemblyQueue] = useState(false);

  // Ref for search timeout - this prevents input focus loss
  const searchTimeoutRef = useRef(null);

  // Handle search input change with proper debounce - NO loading state change
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchInput(value);
    
    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    // Set new timeout for debounce - but don't set loading to true
    searchTimeoutRef.current = setTimeout(() => {
      setSearchTerm(value);
      setPage(0); // Reset to first page when search changes
      setSelected([]); // Clear selected items when search changes
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

  const fetchWorkOrders = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const params = new URLSearchParams({ page: page + 1, limit: rowsPerPage });
      if (searchTerm) params.append('search', searchTerm);
      const res = await axios.get(`${BASE_URL}/api/work-orders?${params}`, { headers: { Authorization: `Bearer ${token}` } });
      if (res.data.success) { 
        setWorkOrders(res.data.data || []); 
        setTotalItems(res.data.pagination?.total || 0); 
      } else { 
        notify('Failed to load work orders', 'error'); 
      }
    } catch (err) { 
      notify('Failed to load work orders', 'error'); 
    } finally { 
      setLoading(false); 
    }
  }, [page, rowsPerPage, searchTerm]);

  useEffect(() => { 
    fetchWorkOrders(); 
  }, [fetchWorkOrders]);

  const notify = (message, severity = 'success') => setSnackbar({ open: true, message, severity });
  const openModal = (setter, workOrder = null) => { 
    if (workOrder) setSelectedWorkOrder(workOrder); 
    setter(true); 
    setActionMenuAnchor(null); 
    setSelectedWorkOrderForMenu(null); 
  };
  const closeModal = (setter) => { setter(false); setSelectedWorkOrder(null); };
  const afterAction = (setter, message) => () => { closeModal(setter); fetchWorkOrders(); notify(message); };

  const handleRelease = async (workOrder) => {
    try {
      if (!workOrder.operations || workOrder.operations.length === 0) {
        notify('Please add operations before releasing the Work Order', 'error');
        return;
      }

      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${BASE_URL}/api/work-orders/${workOrder._id}/release`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        notify(`Work Order ${workOrder.wo_number} released successfully!`);
        fetchWorkOrders();
      } else {
        notify(response.data.message || 'Failed to release work order', 'error');
      }
    } catch (err) {
      notify(err.response?.data?.message || 'Failed to release work order', 'error');
    }
  };

  const handleStart = async (workOrder) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.post(`${BASE_URL}/api/work-orders/${workOrder._id}/start`, {}, { headers: { Authorization: `Bearer ${token}` } });
      if (response.data.success) {
        notify(`Work Order ${workOrder.wo_number} started successfully!`);
        fetchWorkOrders();
      } else {
        notify(response.data.message || 'Failed to start work order', 'error');
      }
    } catch (err) {
      notify(err.response?.data?.message || 'Failed to start work order', 'error');
    } finally {
      setLoading(false);
      setActionMenuAnchor(null);
      setSelectedWorkOrderForMenu(null);
    }
  };

  const handleOpenOperations = (workOrder) => {
    setSelectedWorkOrder(workOrder);
    setOpenOperations(true);
    setActionMenuAnchor(null);
    setSelectedWorkOrderForMenu(null);
  };

  const handleOperationsAdded = (updatedWorkOrder) => {
    notify(`Operations added to Work Order ${updatedWorkOrder.wo_number} successfully!`);
    fetchWorkOrders();
    setOpenOperations(false);
    setSelectedWorkOrder(null);
  };

  const handleJobCosting = (workOrder) => {
    setSelectedWorkOrder(workOrder);
    setOpenJobCosting(true);
    setActionMenuAnchor(null);
    setSelectedWorkOrderForMenu(null);
  };

  // Small helpers to keep the job-card HTML free of "undefined"/"null"
  const safe = (val, fallback = '-') => (val === undefined || val === null || val === '' ? fallback : val);
  const escapeHtml = (val) => String(safe(val, ''))
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
  const formatNumberSafe = (num) => {
    if (num === undefined || num === null || num === '') return '-';
    const n = Number(num);
    return Number.isNaN(n) ? String(num) : n.toLocaleString();
  };

  // ---------------------------------------------------------------------
  // Job Card — generated client-side from the work order already loaded
  // in the table, styled to match the BOM Explosion costing-sheet report
  // ---------------------------------------------------------------------
  const handleJobCard = (workOrder) => {
    try {
      setOpenJobCardLoading(true);

      const ops = workOrder.operations || [];
      const generatedOn = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
      const statusColors = STATUS_COLORS[workOrder.status] || { bg: '#F1F5F9', color: '#475569' };

      const opsRowsHtml = ops.length
        ? ops.map((op, idx) => `
            <tr>
              <td class="c center">${idx + 1}</td>
              <td class="c">${escapeHtml(op.operation_name || op.name || op.op_name)}</td>
              <td class="c">${escapeHtml(op.work_center || op.machine || op.workstation)}</td>
              <td class="c center">${escapeHtml(op.standard_time || op.std_time)}</td>
              <td class="c center">${escapeHtml(op.status)}</td>
              <td class="c"></td>
            </tr>`).join('')
        : `<tr><td class="c" colspan="6" style="text-align:center;padding:14px;color:#888;font-style:italic;">No operations added to this work order</td></tr>`;

      const printWindow = window.open('', '_blank');
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8" />
            <title>Job Card - ${escapeHtml(workOrder.wo_number)}</title>
            <style>
              @page { size: A4; margin: 12mm; }
              * { box-sizing: border-box; }
              body { font-family: Calibri, Arial, sans-serif; color: #1a1a1a; font-size: 12px; margin: 0; }
              .sheet { max-width: 900px; margin: 0 auto; padding: 10px; }

              .title-row { text-align: center; font-size: 18px; font-weight: bold; padding: 6px 0 4px 0; letter-spacing: 0.4px; color: ${COLORS.primary}; }
              .sub-row { text-align: center; font-size: 12px; color: #555; margin-bottom: 14px; }

              .status-chip { display:inline-block; margin-top:4px; padding:3px 12px; border-radius:20px; font-size:10.5px; font-weight:bold; background:${statusColors.bg}; color:${statusColors.color}; }

              table.headinfo { width: 100%; border-collapse: collapse; margin-bottom: 16px; table-layout: fixed; }
              table.headinfo td { border: 1px solid #333; padding: 5px 8px; font-size: 11.5px; vertical-align: middle; }
              table.headinfo td.label { background: #F2F2F2; font-weight: bold; width: 22%; }
              table.headinfo td.value { width: 28%; }

              .section-title { font-size: 13px; font-weight: bold; color: ${COLORS.primary}; margin: 18px 0 8px 0; padding-bottom: 4px; border-bottom: 2px solid ${COLORS.primary}; }

              table.data { width: 100%; border-collapse: collapse; margin-bottom: 4px; }
              table.data th { border: 1px solid #333; background: ${COLORS.primary}; color: #fff; font-size: 10.5px; font-weight: bold; padding: 6px; text-align: center; }
              table.data td.c { border: 1px solid #333; padding: 6px; font-size: 11px; }
              table.data td.center { text-align: center; }
              table.data tbody tr:nth-child(odd) { background: #FAFAFA; }

              .signoff { margin-top: 26px; }
              .signoff-row { display: flex; justify-content: space-between; margin-bottom: 20px; }
              .signoff-field { width: 48%; font-size: 11.5px; }
              .signoff-field .line { display:inline-block; border-bottom: 1px solid #333; min-width: 200px; margin-left: 6px; }

              .footer-note { margin-top: 30px; font-size: 9.5px; color: #888; text-align: center; }

              @media print { .no-print { display: none !important; } }
              .no-print { text-align: right; margin-bottom: 10px; }
              .no-print button { background: ${COLORS.primary}; color: #fff; border: none; padding: 7px 16px; border-radius: 4px; font-size: 12px; font-weight: 600; cursor: pointer; }
            </style>
          </head>
          <body>
            <div class="sheet">
              <div class="no-print"><button onclick="window.print()">Print / Save as PDF</button></div>

              <div class="title-row">JOB CARD / MACHINING ORDER</div>
              <div class="sub-row">
                WO Number: <b>${escapeHtml(workOrder.wo_number)}</b>
                &nbsp;&nbsp;|&nbsp;&nbsp;
                <span class="status-chip">${escapeHtml(workOrder.status)}</span>
              </div>

              <table class="headinfo">
                <tr>
                  <td class="label">Part No</td>
                  <td class="value">${escapeHtml(workOrder.part_no)}</td>
                  <td class="label">Customer</td>
                  <td class="value">${escapeHtml(workOrder.customer_name)}</td>
                </tr>
                <tr>
                  <td class="label">Part Name</td>
                  <td class="value">${escapeHtml(workOrder.part_name)}</td>
                  <td class="label">SO Number</td>
                  <td class="value">${escapeHtml(workOrder.so_number)}</td>
                </tr>
                <tr>
                  <td class="label">Drawing No</td>
                  <td class="value">${escapeHtml(workOrder.drawing_no)}${workOrder.drawing_revision ? ` (Rev ${escapeHtml(workOrder.drawing_revision)})` : ''}</td>
                  <td class="label">WO Type</td>
                  <td class="value">${escapeHtml(workOrder.wo_type)}</td>
                </tr>
                <tr>
                  <td class="label">BOM Version</td>
                  <td class="value">${escapeHtml(workOrder.bom_version)}</td>
                  <td class="label">Priority</td>
                  <td class="value">${escapeHtml(workOrder.priority)}</td>
                </tr>
                <tr>
                  <td class="label">Planned Qty</td>
                  <td class="value">${formatNumberSafe(workOrder.planned_qty)}</td>
                  <td class="label">Completed Qty</td>
                  <td class="value">${formatNumberSafe(workOrder.completed_qty)}</td>
                </tr>
                <tr>
                  <td class="label">Planned Start</td>
                  <td class="value">${escapeHtml(formatDate(workOrder.planned_start))}</td>
                  <td class="label">Planned End</td>
                  <td class="value">${escapeHtml(formatDate(workOrder.planned_end))}</td>
                </tr>
              </table>

              <div class="section-title">Operations</div>
              <table class="data">
                <thead>
                  <tr>
                    <th style="width:8%;">Seq No.</th>
                    <th style="width:28%;">Operation</th>
                    <th style="width:24%;">Work Center / Machine</th>
                    <th style="width:14%;">Std. Time</th>
                    <th style="width:14%;">Status</th>
                    <th style="width:12%;">Remarks</th>
                  </tr>
                </thead>
                <tbody>
                  ${opsRowsHtml}
                </tbody>
              </table>

              <div class="section-title">Sign-Off</div>
              <div class="signoff">
                <div class="signoff-row">
                  <div class="signoff-field">Issued By:<span class="line">&nbsp;</span></div>
                  <div class="signoff-field">Date:<span class="line">&nbsp;</span></div>
                </div>
                <div class="signoff-row">
                  <div class="signoff-field">Operator:<span class="line">&nbsp;</span></div>
                  <div class="signoff-field">Date:<span class="line">&nbsp;</span></div>
                </div>
                <div class="signoff-row">
                  <div class="signoff-field">QC Passed By:<span class="line">&nbsp;</span></div>
                  <div class="signoff-field">Date:<span class="line">&nbsp;</span></div>
                </div>
              </div>

              <div class="footer-note">Generated automatically from the Work Orders module &middot; ${escapeHtml(workOrder.wo_number)} &middot; ${escapeHtml(generatedOn)}</div>
            </div>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.focus();

      notify(`Job Card for ${workOrder.wo_number} generated successfully!`);
    } catch (err) {
      notify('Failed to generate job card', 'error');
    } finally {
      setOpenJobCardLoading(false);
      setActionMenuAnchor(null);
      setSelectedWorkOrderForMenu(null);
    }
  };

  const handleTimeline = (workOrder) => {
    setSelectedWorkOrder(workOrder);
    setOpenTimeline(true);
    setActionMenuAnchor(null);
    setSelectedWorkOrderForMenu(null);
  };

  const handleWipReport = () => setOpenWipReport(true);
  const handleAssemblyQueue = () => setOpenAssemblyQueue(true);

  const handleCancel = (workOrder) => { setSelectedWorkOrder(workOrder); setOpenCancel(true); };
  const handleCancelSubmit = async (cancelledWorkOrder) => { 
    notify(`Work Order ${cancelledWorkOrder.wo_number} cancelled successfully!`); 
    fetchWorkOrders(); 
    setOpenCancel(false); 
    setSelectedWorkOrder(null); 
  };

  const handleHold = (workOrder) => { setSelectedWorkOrder(workOrder); setOpenHold(true); };
  const handleHoldSubmit = async (heldWorkOrder) => { 
    notify(`Work Order ${heldWorkOrder.wo_number} placed on hold successfully!`); 
    fetchWorkOrders(); 
    setOpenHold(false); 
    setSelectedWorkOrder(null); 
  };

  const handleResume = (workOrder) => { setSelectedWorkOrder(workOrder); setOpenResume(true); };
  const handleResumeSubmit = async (resumedWorkOrder) => { 
    notify(`Work Order ${resumedWorkOrder.wo_number} resumed successfully!`); 
    fetchWorkOrders(); 
    setOpenResume(false); 
    setSelectedWorkOrder(null); 
  };

  const handleCompleteOp = (workOrder) => { setSelectedWorkOrder(workOrder); setOpenCompleteOp(true); };
  const handleCompleteOpSubmit = async (completedWorkOrder) => { 
    notify(`Operation completed successfully!`); 
    fetchWorkOrders(); 
    setOpenCompleteOp(false); 
    setSelectedWorkOrder(null); 
  };

  const handleCompleteWO = (workOrder) => { setSelectedWorkOrder(workOrder); setOpenCompleteWO(true); };
  const handleCompleteWOSubmit = async (completedWorkOrder) => { 
    notify(`Work Order ${completedWorkOrder.wo_number} completed successfully!`); 
    fetchWorkOrders(); 
    setOpenCompleteWO(false); 
    setSelectedWorkOrder(null); 
  };

  const handleLabour = (workOrder) => { setSelectedWorkOrder(workOrder); setOpenLabour(true); };
  const handleLabourSubmit = async (labourEntry) => { 
    notify(`Labour entry added successfully!`); 
    fetchWorkOrders(); 
    setOpenLabour(false); 
    setSelectedWorkOrder(null); 
  };

  const handleSelectAll = (e) => setSelected(e.target.checked ? workOrders.map(wo => wo._id) : []);
  const handleSelect = (id) => setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  const handleChangePage = (_, newPage) => { setPage(newPage); setSelected([]); };
  const handleChangeRows = (e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); setSelected([]); };
  const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' }) : '—';
  
  const getStatusIcon = (status) => {
    switch (status) {
      case 'Completed': return <CheckCircleIcon sx={{ fontSize: '0.875rem' }} />;
      case 'Cancelled': return <CancelIcon sx={{ fontSize: '0.875rem' }} />;
      case 'On Hold': return <HoldIcon sx={{ fontSize: '0.875rem' }} />;
      case 'In Progress': return <StartIcon sx={{ fontSize: '0.875rem' }} />;
      case 'Released': return <RocketLaunchIcon sx={{ fontSize: '0.875rem' }} />;
      default: return <AssignmentIcon sx={{ fontSize: '0.875rem' }} />;
    }
  };
  
  const getInitials = (wo) => wo.customer_name ? wo.customer_name.substring(0, 2).toUpperCase() : 'WO';
  const getAvatarColor = (wo) => { 
    const colors = [COLORS.primary, '#074346', '#0D696C', '#128C7E', '#1A9C8F']; 
    return colors[(wo.customer_name?.charCodeAt(0) || 0) % colors.length]; 
  };

  return (
    <Box sx={{ p: 2.5 }}>
      <Box sx={{ mb: 2.5 }}>
        <Typography variant="h5" sx={{ fontSize: '1.25rem', fontWeight: 700, color: COLORS.text.primary, mb: 0.5 }}>Work Orders Master</Typography>
        <Typography variant="body2" sx={{ fontSize: '0.75rem', color: COLORS.text.secondary }}>Manage production work orders, track progress, and monitor completion status</Typography>
      </Box>

      <Paper sx={{ p: 1.5, mb: 2.5, borderRadius: 2, bgcolor: COLORS.background.white, border: `1px solid ${COLORS.border}` }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} alignItems="center" justifyContent="space-between">
          <TextField 
            placeholder="Search by WO number, SO number, customer, part number..." 
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
              <Button variant="outlined" color="error" startIcon={<DeleteIcon sx={{ fontSize: '1rem' }} />} sx={{ height: 36, borderRadius: 1.5, textTransform: 'none', fontSize: '0.75rem' }} disabled={loading}>
                Delete ({selected.length})
              </Button>
            )}
            <Button variant="outlined" startIcon={<WipReportIcon sx={{ fontSize: '1rem' }} />} onClick={handleWipReport} sx={{ height: 36, borderRadius: 1.5, textTransform: 'none', fontSize: '0.75rem', borderColor: COLORS.primary, color: COLORS.primary, '&:hover': { borderColor: COLORS.primaryDark, bgcolor: `${COLORS.primary}10` } }}>
              WIP Report
            </Button>
            <Button variant="outlined" startIcon={<AssemblyQueueIcon sx={{ fontSize: '1rem' }} />} onClick={handleAssemblyQueue} sx={{ height: 36, borderRadius: 1.5, textTransform: 'none', fontSize: '0.75rem', borderColor: COLORS.primary, color: COLORS.primary, '&:hover': { borderColor: COLORS.primaryDark, bgcolor: `${COLORS.primary}10` } }}>
              Assembly Queue
            </Button>
            <Button variant="contained" startIcon={<AddIcon sx={{ fontSize: '1rem' }} />} onClick={() => setOpenAdd(true)} sx={{ height: 36, borderRadius: 1.5, bgcolor: COLORS.primary, fontSize: '0.75rem', textTransform: 'none', '&:hover': { bgcolor: COLORS.primaryDark } }} disabled={loading}>
              Add Work Order
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
                    indeterminate={selected.length > 0 && selected.length < workOrders.length} 
                    checked={workOrders.length > 0 && selected.length === workOrders.length} 
                    onChange={handleSelectAll} 
                    disabled={loading || workOrders.length === 0} 
                    sx={{ color: COLORS.text.light, '&.Mui-checked': { color: COLORS.text.light }, '& .MuiSvgIcon-root': { fontSize: '1.25rem' } }} 
                  />
                </TableCell>
                {['WO / Customer', 'Item Details', 'Qty', 'Dates', 'Priority', 'Status', 'Actions'].map(h => (
                  <TableCell key={h} align={h === 'Actions' ? 'center' : 'left'} sx={{ fontWeight: 600, fontSize: '0.7rem', letterSpacing: '0.5px' }}>{h}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={8} align="center" sx={{ py: 6 }}><CircularProgress size={32} sx={{ color: COLORS.primary }} /><Typography sx={{ fontSize: '0.75rem', color: COLORS.text.secondary, mt: 1 }}>Loading work orders...</Typography></TableCell></TableRow>
              ) : workOrders.length === 0 ? (
                <TableRow><TableCell colSpan={8} align="center" sx={{ py: 6 }}><AssignmentIcon sx={{ fontSize: 48, color: COLORS.text.tertiary, mb: 1 }} /><Typography sx={{ fontSize: '0.875rem', color: COLORS.text.secondary, fontWeight: 500 }}>{searchTerm ? 'No work orders found' : 'No work orders available'}</Typography><Typography sx={{ fontSize: '0.75rem', color: COLORS.text.tertiary, mt: 0.5 }}>{searchTerm ? 'Try adjusting your search terms' : 'Add your first work order to get started'}</Typography></TableCell></TableRow>
              ) : (
                workOrders.map((wo) => {
                  const isSelected = selected.includes(wo._id);
                  const menuOpen = Boolean(actionMenuAnchor) && selectedWorkOrderForMenu?._id === wo._id;
                  const statusColors = STATUS_COLORS[wo.status] || { bg: '#F1F5F9', color: '#475569', border: '#E2E8F0' };
                  const priorityColors = PRIORITY_COLORS[wo.priority] || { bg: '#F1F5F9', color: '#475569' };
                  const completionPercent = wo.planned_qty > 0 ? (wo.completed_qty / wo.planned_qty) * 100 : 0;
                  
                  return (
                    <TableRow key={wo._id} hover selected={isSelected} sx={{ bgcolor: COLORS.background.white, '&:hover': { bgcolor: COLORS.background.hover }, '&.Mui-selected': { bgcolor: `${COLORS.primary}10`, '&:hover': { bgcolor: `${COLORS.primary}20` } }, '& .MuiTableCell-root': { py: 1.5, fontSize: '0.75rem', borderColor: COLORS.border } }}>
                      <TableCell padding="checkbox"><Checkbox checked={isSelected} onChange={() => handleSelect(wo._id)} sx={{ color: COLORS.primary, '&.Mui-checked': { color: COLORS.primary }, '& .MuiSvgIcon-root': { fontSize: '1.25rem' } }} /></TableCell>
                      <TableCell>
                        <Stack direction="row" spacing={1.5} alignItems="center">
                          <Avatar sx={{ width: 32, height: 32, bgcolor: getAvatarColor(wo), fontSize: '0.7rem', fontWeight: 600 }}>{getInitials(wo)}</Avatar>
                          <Box>
                            <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: COLORS.text.primary }}>{wo.wo_number}</Typography>
                            <Typography sx={{ fontSize: '0.65rem', color: COLORS.text.tertiary }}>{wo.customer_name}</Typography>
                            <Typography sx={{ fontSize: '0.65rem', color: COLORS.text.tertiary }}>SO: {wo.so_number}</Typography>
                          </Box>
                        </Stack>
                      </TableCell>
                      <TableCell>
                        <Typography sx={{ fontSize: '0.75rem', fontWeight: 500, color: COLORS.text.primary }}>{wo.part_no}</Typography>
                        <Typography sx={{ fontSize: '0.65rem', color: COLORS.text.tertiary, maxWidth: 200 }}>{wo.part_name?.substring(0, 40)}{wo.part_name?.length > 40 ? '...' : ''}</Typography>
                        {wo.drawing_no && <Chip label={`DRG: ${wo.drawing_no}${wo.drawing_revision ? ` Rev ${wo.drawing_revision}` : ''}`} size="small" sx={{ mt: 0.5, height: 18, fontSize: '0.55rem', bgcolor: COLORS.primaryLight, color: COLORS.primary }} />}
                      </TableCell>
                      <TableCell>
                        <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: COLORS.text.primary }}>{wo.completed_qty.toLocaleString()} / {wo.planned_qty.toLocaleString()}</Typography>
                        <Box sx={{ width: 100, mt: 0.5, bgcolor: '#E5E7EB', borderRadius: 1, overflow: 'hidden' }}>
                          <Box sx={{ width: `${completionPercent}%`, bgcolor: completionPercent === 100 ? '#059669' : COLORS.primary, height: 3, borderRadius: 1 }} />
                        </Box>
                        <Typography sx={{ fontSize: '0.65rem', color: COLORS.text.tertiary, mt: 0.25 }}>{Math.round(completionPercent)}% complete</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography sx={{ fontSize: '0.7rem', color: COLORS.text.secondary }}>Planned: {formatDate(wo.planned_start)} - {formatDate(wo.planned_end)}</Typography>
                        <Typography sx={{ fontSize: '0.65rem', color: COLORS.text.tertiary }}>Required: {formatDate(wo.required_by)}</Typography>
                      </TableCell>
                      <TableCell><Chip label={wo.priority || 'Medium'} size="small" sx={{ fontSize: '0.65rem', fontWeight: 500, height: 24, bgcolor: priorityColors.bg, color: priorityColors.color }} /></TableCell>
                      <TableCell><Chip icon={getStatusIcon(wo.status)} label={wo.status || 'Planned'} size="small" sx={{ fontSize: '0.65rem', fontWeight: 500, height: 24, bgcolor: statusColors.bg, color: statusColors.color, border: `1px solid ${statusColors.border}` }} /></TableCell>
                      <TableCell align="center">
                        <ActionMenu 
                          item={wo} 
                          anchorEl={menuOpen ? actionMenuAnchor : null} 
                          onOpen={(e) => { setActionMenuAnchor(e.currentTarget); setSelectedWorkOrderForMenu(wo); }} 
                          onClose={() => { setActionMenuAnchor(null); setSelectedWorkOrderForMenu(null); }} 
                          onView={(w) => openModal(setOpenView, w)} 
                          onEdit={(w) => openModal(setOpenEdit, w)} 
                          onRelease={(w) => handleRelease(w)} 
                          onCancel={(w) => handleCancel(w)} 
                          onHold={(w) => handleHold(w)} 
                          onStart={(w) => handleStart(w)}
                          onResume={(w) => handleResume(w)} 
                          onCompleteOp={(w) => handleCompleteOp(w)} 
                          onCompleteWO={(w) => handleCompleteWO(w)} 
                          onLabour={(w) => handleLabour(w)}
                          onOperations={(w) => handleOpenOperations(w)}
                          onJobCosting={(w) => handleJobCosting(w)}
                          onJobCard={(w) => handleJobCard(w)}
                          onTimeline={(w) => handleTimeline(w)}
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

      {/* Modals */}
      <AddWorkOrder open={openAdd} onClose={() => setOpenAdd(false)} onAdd={afterAction(setOpenAdd, 'Work order created successfully!')} />
      {selectedWorkOrder && (
        <>
          <EditWorkOrder open={openEdit} onClose={() => closeModal(setOpenEdit)} workOrder={selectedWorkOrder} onUpdate={afterAction(setOpenEdit, 'Work order updated successfully!')} />
          <ViewWorkOrder open={openView} onClose={() => closeModal(setOpenView)} workOrder={selectedWorkOrder} onEdit={() => { setOpenView(false); setOpenEdit(true); }} />
          <CancelWorkOrderPopup open={openCancel} onClose={() => setOpenCancel(false)} workOrder={selectedWorkOrder} onCancel={handleCancelSubmit} />
          <HoldWorkOrderPopup open={openHold} onClose={() => setOpenHold(false)} workOrder={selectedWorkOrder} onHold={handleHoldSubmit} />
          <ResumeWorkOrderPopup open={openResume} onClose={() => setOpenResume(false)} workOrder={selectedWorkOrder} onResume={handleResumeSubmit} />
          <CompleteOperationPopup open={openCompleteOp} onClose={() => setOpenCompleteOp(false)} workOrder={selectedWorkOrder} onComplete={handleCompleteOpSubmit} />
          <CompleteWorkOrderPopup open={openCompleteWO} onClose={() => setOpenCompleteWO(false)} workOrder={selectedWorkOrder} onComplete={handleCompleteWOSubmit} />
          <LabourEntryPopup open={openLabour} onClose={() => setOpenLabour(false)} workOrder={selectedWorkOrder} onLabour={handleLabourSubmit} />
          <AddOperationsPopup open={openOperations} onClose={() => setOpenOperations(false)} workOrder={selectedWorkOrder} onOperationsAdded={handleOperationsAdded} />
          <JobCostingPopup open={openJobCosting} onClose={() => setOpenJobCosting(false)} workOrder={selectedWorkOrder} />
          <TimelinePopup open={openTimeline} onClose={() => setOpenTimeline(false)} workOrder={selectedWorkOrder} />
        </>
      )}
      
      <WipReportPopup open={openWipReport} onClose={() => setOpenWipReport(false)} />
      <AssemblyQueuePopup open={openAssemblyQueue} onClose={() => setOpenAssemblyQueue(false)} />
      
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

export default WorkOrdersMaster;
