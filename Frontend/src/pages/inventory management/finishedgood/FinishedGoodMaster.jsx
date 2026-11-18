
// // import React, { useState, useEffect, useCallback } from 'react';
// // import { useNavigate } from 'react-router-dom';
// // import axios from 'axios';
// // import {
// //   Menu,
// //   MenuItem,
// //   ListItemIcon,
// //   ListItemText,
// //   Divider,
// //   Typography,
// //   Tooltip,
// //   IconButton,
// //   Dialog,
// //   DialogTitle,
// //   DialogContent,
// //   DialogContentText,
// //   DialogActions,
// //   Button,
// //   Snackbar,
// //   Alert,
// //   TablePagination,
// //   CircularProgress
// // } from '@mui/material';
// // import {
// //   MoreVert as MoreVertIcon,
// //   Edit as EditIcon,
// //   Delete as DeleteIcon,
// //   Close as CloseIcon,
// //   Inventory2 as EmptyIcon
// // } from '@mui/icons-material';
// // import { Plus, Search, RefreshCw } from 'lucide-react';
// // import BASE_URL from '../../../config/Config';

// // const COLORS = {
// //   primary: '#063C3F',
// //   primaryDark: '#05292B',
// //   primaryLight: '#E8F0F1',
// //   text: '#151C26',
// //   secondary: '#4B5568',
// //   tertiary: '#94A3B8',
// //   border: '#E3E8EF',
// //   hover: '#F0FDF9',
// //   inputBg: '#F8FFFC'
// // };

// // const PAGE_FONT = '"Roboto","Helvetica","Arial",sans-serif';

// // const FinishedGoodMaster = () => {
// //   const navigate = useNavigate();

// //   const [data, setData] = useState([]);
// //   const [loading, setLoading] = useState(false);
// //   const [total, setTotal] = useState(0);
// //   const [page, setPage] = useState(0);
// //   const [rowsPerPage, setRowsPerPage] = useState(5);

// //   const [searchInput, setSearchInput] = useState('');
// //   const [search, setSearch] = useState('');

// //   const [menuAnchor, setMenuAnchor] = useState(null);
// //   const [menuItem, setMenuItem] = useState(null);
// //   const [deleteEntry, setDeleteEntry] = useState(null);
// //   const [deleting, setDeleting] = useState(false);

// //   const [snack, setSnack] = useState({
// //     open: false,
// //     message: '',
// //     severity: 'success'
// //   });

// //   const notify = (message, severity = 'success') => {
// //     setSnack({ open: true, message, severity });
// //   };

// //   useEffect(() => {
// //     const timer = setTimeout(() => {
// //       setSearch(searchInput.trim());
// //       setPage(0);
// //     }, 400);

// //     return () => clearTimeout(timer);
// //   }, [searchInput]);

// //   const fetchData = useCallback(async () => {
// //     setLoading(true);

// //     try {
// //       const token = localStorage.getItem('token');

// //       const res = await axios.get(`${BASE_URL}/api/finished-good`, {
// //         headers: {
// //           Authorization: `Bearer ${token}`
// //         },
// //         params: {
// //           page: page + 1,
// //           limit: rowsPerPage,
// //           search: search || undefined
// //         }
// //       });

// //       setData(Array.isArray(res.data.data) ? res.data.data : []);
// //       setTotal(res.data.pagination?.total || 0);
// //     } catch (error) {
// //       console.error('Error fetching finished goods:', error);
// //       notify(
// //         error.response?.data?.message || 'Failed to load finished goods',
// //         'error'
// //       );
// //     } finally {
// //       setLoading(false);
// //     }
// //   }, [page, rowsPerPage, search]);

// //   useEffect(() => {
// //     fetchData();
// //   }, [fetchData]);

// //   const openMenu = (event, item) => {
// //     setMenuAnchor(event.currentTarget);
// //     setMenuItem(item);
// //   };

// //   const closeMenu = () => {
// //     setMenuAnchor(null);
// //   };

// //   const confirmDelete = async () => {
// //     if (!deleteEntry) return;

// //     try {
// //       setDeleting(true);
// //       const token = localStorage.getItem('token');

// //       await axios.delete(
// //         `${BASE_URL}/api/finished-good/${deleteEntry._id}`,
// //         {
// //           headers: {
// //             Authorization: `Bearer ${token}`
// //           }
// //         }
// //       );

// //       notify(`${deleteEntry.ref_no} deleted successfully`);r 
// //       setDeleteEntry(null);

// //       if (data.length === 1 && page > 0) {
// //         setPage((prev) => prev - 1);
// //       } else {
// //         await fetchData();
// //       }
// //     } catch (error) {
// //       console.error('Delete finished good error:', error);
// //       notify(
// //         error.response?.data?.message || 'Failed to delete finished good',
// //         'error'
// //       );
// //     } finally {
// //       setDeleting(false);
// //     }
// //   };

// //   const th =
// //     'py-3 px-4 text-left text-[0.7rem] font-semibold tracking-[0.5px] whitespace-nowrap';

// //   const td = 'py-2 px-4 text-[0.75rem]';

// //   return (
// //     <div className="p-5" style={{ fontFamily: PAGE_FONT }}>
// //       <div className="mb-5">
// //         <h1 className="text-[1.25rem] font-bold text-[#151C26] mb-0.5">
// //           Finished Goods
// //         </h1>
// //         <p className="text-[0.75rem] text-[#4B5568]">
// //           Manage produced items and scrap records
// //         </p>
// //       </div>

// //       <div className="p-3 mb-5 rounded-lg bg-white border border-[#E3E8EF] shadow-[0_1px_3px_0_rgba(0,0,0,0.05)] flex flex-col sm:flex-row items-center justify-between gap-3">
// //         <div className="relative w-full sm:w-[450px]">
// //           <Search
// //             size={16}
// //             className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]"
// //           />

// //           <input
// //             type="text"
// //             autoComplete="off"
// //             placeholder="Search by Ref No, Name, Code..."
// //             value={searchInput}
// //             onChange={(e) => setSearchInput(e.target.value)}
// //             className="w-full h-9 pl-9 pr-8 rounded-md border border-[#C4C4C4] bg-[#F8FFFC] text-[0.75rem] text-[#151C26] placeholder:text-[#94A3B8] outline-none hover:border-[#063C3F] focus:border-[#063C3F] focus:ring-1 focus:ring-[#063C3F]"
// //           />

// //           {searchInput && (
// //             <button
// //               type="button"
// //               onClick={() => setSearchInput('')}
// //               aria-label="Clear search"
// //               className="absolute right-2 top-1/2 -translate-y-1/2 text-[#4B5568]"
// //             >
// //               <CloseIcon sx={{ fontSize: '1rem' }} />
// //             </button>
// //           )}
// //         </div>

// //         <div className="flex items-center gap-3">
// //           <Tooltip title="Refresh">
// //             <span>
// //               <IconButton
// //                 size="small"
// //                 onClick={fetchData}
// //                 disabled={loading}
// //                 sx={{
// //                   color: COLORS.secondary,
// //                   '&:hover': { bgcolor: `${COLORS.primary}20` }
// //                 }}
// //               >
// //                 <RefreshCw
// //                   size={18}
// //                   className={loading ? 'animate-spin' : ''}
// //                 />
// //               </IconButton>
// //             </span>
// //           </Tooltip>

// //           <button
// //             type="button"
// //             onClick={() =>
// //               navigate('/inventorymanagement/finishedgood/add')
// //             }
// //             className="h-9 px-4 rounded-md bg-[#063C3F] hover:bg-[#05292B] text-white text-[0.75rem] font-medium shadow-[0_1px_3px_0_rgba(0,0,0,0.1)] flex items-center gap-2 transition"
// //           >
// //             <Plus size={16} /> Add FG
// //           </button>
// //         </div>
// //       </div>

// //       <div className="w-full rounded-lg overflow-hidden bg-white border border-[#E3E8EF] shadow-[0_1px_3px_0_rgba(0,0,0,0.05)]">
// //         <div className="overflow-x-auto">
// //           <table className="w-full border-collapse">
// //             <thead className="bg-[#063C3F] text-white">
// //               <tr>
// //                 <th className={th}>Ref No</th>
// //                 <th className={th}>MIS Ref</th>
// //                 <th className={th}>Date</th>
// //                 <th className={th}>Product Name / Code</th>
// //                 <th className={th}>FG Category</th>
// //                 <th className={th}>Qty Produced</th>
// //                 <th className={th}>Scrap</th>
// //                 <th className={`${th} text-center w-[60px]`}>Actions</th>
// //               </tr>
// //             </thead>

// //             <tbody>
// //               {loading ? (
// //                 <tr>
// //                   <td colSpan={8} className="py-12 text-center">
// //                     <CircularProgress
// //                       size={32}
// //                       sx={{ color: COLORS.primary }}
// //                     />
// //                     <div className="text-[0.75rem] mt-2">
// //                       Loading entries...
// //                     </div>
// //                   </td>
// //                 </tr>
// //               ) : data.length === 0 ? (
// //                 <tr>
// //                   <td colSpan={8} className="py-12 text-center">
// //                     <EmptyIcon
// //                       sx={{ fontSize: 48, color: COLORS.tertiary }}
// //                     />
// //                     <div className="text-[0.875rem] text-[#4B5568]">
// //                       {search
// //                         ? 'No entries found'
// //                         : 'No finished goods available'}
// //                     </div>
// //                   </td>
// //                 </tr>
// //               ) : (
// //                 data.map((item) => {
// //                   const category =
// //                     item.finished_good_category || 'Finished Good';

// //                   return (
// //                     <tr
// //                       key={item._id}
// //                       className="border-b border-[#E3E8EF] hover:bg-[#F0FDF9]"
// //                     >
// //                       <td className={`${td} font-semibold text-[#063C3F]`}>
// //                         {item.ref_no}
// //                       </td>

// //                       <td className={`${td} font-medium text-[#4B5568]`}>
// //                         {item.mis_ref_no || '-'}
// //                       </td>

// //                       <td className={td}>
// //                         {item.fg_date
// //                           ? new Date(item.fg_date).toLocaleDateString('en-GB')
// //                           : '-'}
// //                       </td>

// //                       <td className={td}>
// //                         <div className="font-semibold text-gray-800">
// //                           {item.name || '-'}
// //                         </div>
// //                         <div className="text-[0.65rem] text-[#94A3B8]">
// //                           Code: {item.code || '-'}
// //                         </div>
// //                       </td>

// //                       <td className={td}>
// //                         <span
// //                           className={`inline-flex px-2 py-1 rounded text-[0.7rem] font-medium ${
// //                             category === 'Semi Finished Good'
// //                               ? 'bg-amber-100 text-amber-800'
// //                               : 'bg-emerald-100 text-emerald-800'
// //                           }`}
// //                         >
// //                           {category}
// //                         </span>
// //                       </td>

// //                       <td className={`${td} font-medium`}>
// //                         {item.quantity ?? 0}{' '}
// //                         <span className="text-[#94A3B8]">
// //                           {item.unit || ''}
// //                         </span>
// //                       </td>

// //                       <td className={`${td} text-red-600 font-medium`}>
// //                         {item.scrap_quantity ?? 0}{' '}
// //                         <span className="text-[#94A3B8]">
// //                           {item.scrap_unit || ''}
// //                         </span>
// //                       </td>

// //                       <td className={`${td} text-center`}>
// //                         <Tooltip title="Actions">
// //                           <IconButton
// //                             size="small"
// //                             onClick={(e) => openMenu(e, item)}
// //                             sx={{
// //                               color: COLORS.secondary,
// //                               '&:hover': {
// //                                 bgcolor: `${COLORS.primary}20`
// //                               }
// //                             }}
// //                           >
// //                             <MoreVertIcon fontSize="small" />
// //                           </IconButton>
// //                         </Tooltip>
// //                       </td>
// //                     </tr>
// //                   );
// //                 })
// //               )}
// //             </tbody>
// //           </table>
// //         </div>

// //         <TablePagination
// //           rowsPerPageOptions={[5, 10, 25, 50]}
// //           component="div"
// //           count={total}
// //           rowsPerPage={rowsPerPage}
// //           page={page}
// //           onPageChange={(_, nextPage) => setPage(nextPage)}
// //           onRowsPerPageChange={(e) => {
// //             setRowsPerPage(parseInt(e.target.value, 10));
// //             setPage(0);
// //           }}
// //           sx={{
// //             borderTop: `1px solid ${COLORS.border}`,
// //             '& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows':
// //               {
// //                 fontSize: '0.7rem',
// //                 color: COLORS.secondary
// //               }
// //           }}
// //         />
// //       </div>

// //       <Menu
// //         anchorEl={menuAnchor}
// //         open={Boolean(menuAnchor)}
// //         onClose={closeMenu}
// //         slotProps={{
// //           paper: {
// //             elevation: 3,
// //             sx: {
// //               mt: 1,
// //               minWidth: 180,
// //               borderRadius: 2,
// //               border: `1px solid ${COLORS.border}`
// //             }
// //           }
// //         }}
// //       >
// //         <MenuItem
// //           disabled={!menuItem}
// //           onClick={() => {
// //             if (menuItem) {
// //               navigate(
// //                 `/inventorymanagement/finishedgood/add?id=${menuItem._id}`
// //               );
// //             }
// //             closeMenu();
// //           }}
// //           sx={{ py: 1.5 }}
// //         >
// //           <ListItemIcon sx={{ color: COLORS.primary, minWidth: 36 }}>
// //             <EditIcon fontSize="small" />
// //           </ListItemIcon>
// //           <ListItemText>
// //             <Typography
// //               sx={{
// //                 fontSize: '0.75rem',
// //                 fontWeight: 500,
// //                 color: COLORS.text
// //               }}
// //             >
// //               Edit
// //             </Typography>
// //           </ListItemText>
// //         </MenuItem>

// //         <Divider sx={{ my: 0.5 }} />

// //         <MenuItem
// //           disabled={!menuItem}
// //           onClick={() => {
// //             setDeleteEntry(menuItem);
// //             closeMenu();
// //           }}
// //           sx={{ py: 1.5 }}
// //         >
// //           <ListItemIcon sx={{ color: '#EF4444', minWidth: 36 }}>
// //             <DeleteIcon fontSize="small" />
// //           </ListItemIcon>
// //           <ListItemText>
// //             <Typography
// //               sx={{
// //                 fontSize: '0.75rem',
// //                 fontWeight: 500,
// //                 color: '#EF4444'
// //               }}
// //             >
// //               Delete
// //             </Typography>
// //           </ListItemText>
// //         </MenuItem>
// //       </Menu>

// //       <Dialog
// //         open={Boolean(deleteEntry)}
// //         onClose={() => !deleting && setDeleteEntry(null)}
// //       >
// //         <DialogTitle sx={{ fontSize: '1rem', fontWeight: 700 }}>
// //           Delete Finished Good?
// //         </DialogTitle>

// //         <DialogContent>
// //           <DialogContentText sx={{ fontSize: '0.8rem' }}>
// //             {deleteEntry
// //               ? `${deleteEntry.ref_no} (${deleteEntry.name}) will be permanently deleted.`
// //               : ''}
// //           </DialogContentText>
// //         </DialogContent>

// //         <DialogActions sx={{ px: 3, pb: 2 }}>
// //           <Button
// //             onClick={() => setDeleteEntry(null)}
// //             disabled={deleting}
// //             sx={{
// //               textTransform: 'none',
// //               color: COLORS.secondary
// //             }}
// //           >
// //             Cancel
// //           </Button>

// //           <Button
// //             onClick={confirmDelete}
// //             disabled={deleting}
// //             variant="contained"
// //             color="error"
// //             sx={{ textTransform: 'none' }}
// //           >
// //             {deleting ? 'Deleting...' : 'Delete'}
// //           </Button>
// //         </DialogActions>
// //       </Dialog>

// //       <Snackbar
// //         open={snack.open}
// //         autoHideDuration={4000}
// //         onClose={() =>
// //           setSnack((prev) => ({ ...prev, open: false }))
// //         }
// //         anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
// //       >
// //         <Alert
// //           severity={snack.severity}
// //           variant="filled"
// //           onClose={() =>
// //             setSnack((prev) => ({ ...prev, open: false }))
// //           }
// //         >
// //           {snack.message}
// //         </Alert>
// //       </Snackbar>
// //     </div>
// //   );
// // };

// // export default FinishedGoodMaster;


// import React, { useState, useEffect, useCallback } from 'react';
// import { useNavigate } from 'react-router-dom';
// import axios from 'axios';
// import {
//   Menu, MenuItem, ListItemIcon, ListItemText, Divider, Typography, Tooltip, IconButton,
//   Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button, Snackbar, Alert,
//   TablePagination, CircularProgress, Checkbox 
// } from '@mui/material';
// import {
//   MoreVert as MoreVertIcon, Visibility as ViewIcon, Edit as EditIcon, Delete as DeleteIcon,
//   Close as CloseIcon, Inventory2 as EmptyIcon
// } from '@mui/icons-material';
// import { Plus, Search, RefreshCw } from 'lucide-react';
// import BASE_URL from '../../../config/Config';

// const COLORS = {
//   primary: '#063C3F', primaryDark: '#05292B', primaryLight: '#E8F0F1',
//   text: '#151C26', secondary: '#4B5568', tertiary: '#94A3B8',
//   border: '#E3E8EF', hover: '#F0FDF9', inputBg: '#F8FFFC'
// };

// const PAGE_FONT = '"Roboto","Helvetica","Arial",sans-serif';
// const authHeaders = () => ({ Authorization: `Bearer ${localStorage.getItem('token')}` });
// const fmtDate = (d) => (d ? new Date(d).toLocaleDateString('en-GB') : '-');
// const initials = (name = '') =>
//   name.trim().split(/\s+/).slice(0, 2).map((w) => w[0]).join('').toUpperCase() || 'FG';

// const FinishedGoodMaster = () => {
//   const navigate = useNavigate();

//   const [data, setData] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [total, setTotal] = useState(0);
//   const [page, setPage] = useState(0);
//   const [rowsPerPage, setRowsPerPage] = useState(5);

//   const [searchInput, setSearchInput] = useState('');
//   const [search, setSearch] = useState('');

//   const [menuAnchor, setMenuAnchor] = useState(null);
//   const [menuItem, setMenuItem] = useState(null);
//   const [viewEntry, setViewEntry] = useState(null);
  
//   const [deleteEntry, setDeleteEntry] = useState(null);
//   const [deleting, setDeleting] = useState(false);
  
//   // 🔴 Bulk Delete Dialog State
//   const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
//   const [isBulkDeleting, setIsBulkDeleting] = useState(false);
  
//   const [selected, setSelected] = useState([]);
//   const [snack, setSnack] = useState({ open: false, message: '', severity: 'success' });

//   const notify = (message, severity = 'success') => setSnack({ open: true, message, severity });

//   useEffect(() => {
//     const t = setTimeout(() => { setSearch(searchInput.trim()); setPage(0); }, 400);
//     return () => clearTimeout(t);
//   }, [searchInput]);

//   const fetchData = useCallback(async () => {
//     setLoading(true);
//     try {
//       const res = await axios.get(`${BASE_URL}/api/finished-good`, {
//         headers: authHeaders(),
//         params: { page: page + 1, limit: rowsPerPage, search: search || undefined }
//       });
//       setData(Array.isArray(res.data.data) ? res.data.data : []);
//       setTotal(res.data.pagination?.total || 0);
//       setSelected([]);
//     } catch (error) {
//       console.error('Error fetching finished goods:', error);
//       notify(error.response?.data?.message || 'Failed to load finished goods', 'error');
//     } finally {
//       setLoading(false);
//     }
//   }, [page, rowsPerPage, search]);

//   useEffect(() => { fetchData(); }, [fetchData]);

//   const openMenu = (e, item) => { setMenuAnchor(e.currentTarget); setMenuItem(item); };
//   const closeMenu = () => setMenuAnchor(null);

//   const handleSelectAllClick = (event) => {
//     if (event.target.checked) {
//       setSelected(data.map((n) => n._id));
//       return;
//     }
//     setSelected([]);
//   };

//   const handleClick = (event, id) => {
//     const selectedIndex = selected.indexOf(id);
//     let newSelected = [];

//     if (selectedIndex === -1) {
//       newSelected = newSelected.concat(selected, id);
//     } else if (selectedIndex === 0) {
//       newSelected = newSelected.concat(selected.slice(1));
//     } else if (selectedIndex === selected.length - 1) {
//       newSelected = newSelected.concat(selected.slice(0, -1));
//     } else if (selectedIndex > 0) {
//       newSelected = newSelected.concat(
//         selected.slice(0, selectedIndex),
//         selected.slice(selectedIndex + 1),
//       );
//     }
//     setSelected(newSelected);
//   };

//   const confirmDelete = async () => {
//     if (!deleteEntry) return;
//     try {
//       setDeleting(true);
//       await axios.delete(`${BASE_URL}/api/finished-good/${deleteEntry._id}`, { headers: authHeaders() });
//       notify(`${deleteEntry.ref_no} deleted successfully`);
//       setDeleteEntry(null);
//       if (data.length === 1 && page > 0) setPage((prev) => prev - 1); else fetchData();
//     } catch (error) {
//       notify(error.response?.data?.message || 'Failed to delete', 'error');
//     } finally {
//       setDeleting(false);
//     }
//   };

  
//   const executeBulkDelete = async () => {
//     try {
//       setIsBulkDeleting(true);
//       await Promise.all(selected.map(id => axios.delete(`${BASE_URL}/api/finished-good/${id}`, { headers: authHeaders() })));
//       notify(`${selected.length} entries deleted successfully`);
//       setSelected([]);
//       fetchData();
//       setBulkDeleteOpen(false); // Delete ke baad popup band karein
//     } catch (error) {
//       notify('Failed to delete some entries', 'error');
//     } finally {
//       setIsBulkDeleting(false);
//     }
//   };

//   const th = 'py-3 px-4 text-left text-[0.7rem] font-semibold tracking-[0.5px] whitespace-nowrap';
//   const td = 'py-2 px-4 text-[0.75rem]';

//   return (
//     <div className="p-5" style={{ fontFamily: PAGE_FONT }}>
//       <div className="mb-5">
//         <h1 className="text-[1.25rem] font-bold text-[#151C26] mb-0.5">Finished Goods</h1>
//         <p className="text-[0.75rem] text-[#4B5568]">Manage produced items and scrap records</p>
//       </div>

//       <div className="p-3 mb-5 rounded-lg bg-white border border-[#E3E8EF] shadow-[0_1px_3px_0_rgba(0,0,0,0.05)] flex flex-col sm:flex-row items-center justify-between gap-3">
//         <div className="relative w-full sm:w-[450px]">
//           <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
//           <input
//             type="text"
//             autoComplete="off"
//             placeholder="Search by Ref No, Name, Code..."
//             value={searchInput}
//             onChange={(e) => setSearchInput(e.target.value)}
//             className="w-full h-9 pl-9 pr-8 rounded-md border border-[#C4C4C4] bg-[#F8FFFC] text-[0.75rem] text-[#151C26] placeholder:text-[#94A3B8] outline-none hover:border-[#063C3F] focus:border-[#063C3F] focus:ring-1 focus:ring-[#063C3F]"
//           />
//           {searchInput && (
//             <button onClick={() => setSearchInput('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-[#4B5568]">
//               <CloseIcon sx={{ fontSize: '1rem' }} />
//             </button>
//           )}
//         </div>

//         <div className="flex items-center gap-3">
//           <Tooltip title="Refresh">
//             <span>
//               <IconButton size="small" onClick={fetchData} disabled={loading}
//                 sx={{ color: COLORS.secondary, '&:hover': { bgcolor: `${COLORS.primary}20` } }}>
//                 <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
//               </IconButton>
//             </span>
//           </Tooltip>

//           {}
//           {selected.length > 0 && (
//             <button
//               onClick={() => setBulkDeleteOpen(true)}
//               disabled={isBulkDeleting}
//               className="h-9 px-4 rounded-md border border-red-500 text-red-500 hover:bg-red-50 text-[0.75rem] font-medium flex items-center gap-2 transition"
//             >
//               <DeleteIcon fontSize="small" /> Delete ({selected.length})
//             </button>
//           )}
          
//           <button
//             type="button"
//             onClick={() => navigate('/inventorymanagement/finishedgood/add')}
//             className="h-9 px-4 rounded-md bg-[#063C3F] hover:bg-[#05292B] text-white text-[0.75rem] font-medium shadow-[0_1px_3px_0_rgba(0,0,0,0.1)] flex items-center gap-2 transition"
//           >
//             <Plus size={16} /> Add FG
//           </button>
//         </div>
//       </div>

//       <div className="w-full rounded-lg overflow-hidden bg-white border border-[#E3E8EF] shadow-[0_1px_3px_0_rgba(0,0,0,0.05)]">
//         <div className="overflow-x-auto">
//           <table className="w-full border-collapse">
//             <thead className="bg-[#063C3F] text-white">
//               <tr>
//                 <th className="py-3 px-4 w-12 text-center">
//                   <Checkbox
//                     indeterminate={selected.length > 0 && selected.length < data.length}
//                     checked={data.length > 0 && selected.length === data.length}
//                     onChange={handleSelectAllClick}
//                     sx={{ color: 'white', '&.Mui-checked': { color: 'white' }, '&.MuiCheckbox-indeterminate': { color: 'white' } }}
//                   />
//                 </th>
//                 <th className={th}>Ref No</th>
//                 <th className={th}>MIS Ref</th>
//                 <th className={th}>Date</th>
//                 <th className={th}>Product Name / Code</th>
//                 <th className={th}>FG Category</th>
//                 <th className={th}>Qty Produced</th>
//                 <th className={th}>Scrap</th>
//                 <th className={`${th} text-center w-[60px]`}>Actions</th>
//               </tr>
//             </thead>
//             <tbody>
//               {loading ? (
//                 <tr>
//                   <td colSpan={9} className="py-12 text-center">
//                     <CircularProgress size={32} sx={{ color: COLORS.primary }} />
//                     <div className="text-[0.75rem] mt-2">Loading entries...</div>
//                   </td>
//                 </tr>
//               ) : data.length === 0 ? (
//                 <tr>
//                   <td colSpan={9} className="py-12 text-center">
//                     <EmptyIcon sx={{ fontSize: 48, color: COLORS.tertiary }} />
//                     <div className="text-[0.875rem] text-[#4B5568]">
//                       {search ? 'No entries found' : 'No finished goods available'}
//                     </div>
//                   </td>
//                 </tr>
//               ) : (
//                 data.map((item) => {
//                   const category = item.finished_good_category || 'Finished Good';
//                   const isItemSelected = selected.indexOf(item._id) !== -1;

//                   return (
//                     <tr key={item._id} className={`border-b border-[#E3E8EF] hover:bg-[#F0FDF9] ${isItemSelected ? 'bg-[#E8F0F1]' : ''}`}>
//                       <td className="py-2 px-4 text-center">
//                         <Checkbox
//                           checked={isItemSelected}
//                           onChange={(e) => handleClick(e, item._id)}
//                           sx={{ color: '#94A3B8', '&.Mui-checked': { color: '#063C3F' } }}
//                         />
//                       </td>
//                       <td className={`${td} font-semibold text-[#063C3F]`}>{item.ref_no}</td>
//                       <td className={`${td} font-medium text-[#4B5568]`}>{item.mis_ref_no || '-'}</td>
//                       <td className={td}>{fmtDate(item.fg_date)}</td>
//                       <td className={td}>
//                         <div className="font-semibold text-gray-800">{item.name || '-'}</div>
//                         <div className="text-[0.65rem] text-[#94A3B8]">Code: {item.code || '-'}</div>
//                       </td>
//                       <td className={td}>
//                         <span className={`inline-flex px-2 py-1 rounded text-[0.7rem] font-medium ${category === 'Semi Finished Good' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'}`}>
//                           {category}
//                         </span>
//                       </td>
//                       <td className={`${td} font-medium`}>{item.quantity ?? 0} <span className="text-[#94A3B8]">{item.unit || ''}</span></td>
//                       <td className={`${td} text-red-600 font-medium`}>{item.scrap_quantity ?? 0} <span className="text-[#94A3B8]">{item.scrap_unit || ''}</span></td>
//                       <td className={`${td} text-center`}>
//                         <Tooltip title="Actions">
//                           <IconButton size="small" onClick={(e) => openMenu(e, item)}
//                             sx={{ color: COLORS.secondary, '&:hover': { bgcolor: `${COLORS.primary}20` } }}>
//                             <MoreVertIcon fontSize="small" />
//                           </IconButton>
//                         </Tooltip>
//                       </td>
//                     </tr>
//                   );
//                 })
//               )}
//             </tbody>
//           </table>
//         </div>

//         <TablePagination
//           rowsPerPageOptions={[5, 10, 25, 50]}
//           component="div"
//           count={total}
//           rowsPerPage={rowsPerPage}
//           page={page}
//           onPageChange={(_, nextPage) => setPage(nextPage)}
//           onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
//           sx={{
//             borderTop: `1px solid ${COLORS.border}`,
//             '& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows': { fontSize: '0.7rem', color: COLORS.secondary }
//           }}
//         />
//       </div>

//       <Menu
//         anchorEl={menuAnchor}
//         open={Boolean(menuAnchor)}
//         onClose={closeMenu}
//         slotProps={{ paper: { elevation: 3, sx: { mt: 1, minWidth: 180, borderRadius: 2, border: `1px solid ${COLORS.border}` } } }}
//       >
//         <MenuItem onClick={() => { setViewEntry(menuItem); closeMenu(); }} sx={{ py: 1.5 }}>
//           <ListItemIcon sx={{ color: COLORS.primary, minWidth: 36 }}><ViewIcon fontSize="small" /></ListItemIcon>
//           <ListItemText><Typography sx={{ fontSize: '0.75rem', fontWeight: 500, color: COLORS.text }}>View Details</Typography></ListItemText>
//         </MenuItem>

//         <MenuItem onClick={() => { navigate(`/inventorymanagement/finishedgood/add?id=${menuItem._id}`); closeMenu(); }} sx={{ py: 1.5 }}>
//           <ListItemIcon sx={{ color: COLORS.primary, minWidth: 36 }}><EditIcon fontSize="small" /></ListItemIcon>
//           <ListItemText><Typography sx={{ fontSize: '0.75rem', fontWeight: 500, color: COLORS.text }}>Edit</Typography></ListItemText>
//         </MenuItem>

//         <Divider sx={{ my: 0.5 }} />
        
//         <MenuItem onClick={() => { setDeleteEntry(menuItem); closeMenu(); }} sx={{ py: 1.5 }}>
//           <ListItemIcon sx={{ color: '#EF4444', minWidth: 36 }}><DeleteIcon fontSize="small" /></ListItemIcon>
//           <ListItemText><Typography sx={{ fontSize: '0.75rem', fontWeight: 500, color: '#EF4444' }}>Delete</Typography></ListItemText>
//         </MenuItem>
//       </Menu>

//       <Dialog open={Boolean(viewEntry)} onClose={() => setViewEntry(null)} fullWidth maxWidth="xs" slotProps={{ paper: { sx: { borderRadius: 2 } } }}>
//         <DialogTitle sx={{ bgcolor: COLORS.primary, color: '#fff', fontSize: '1rem', fontWeight: 700, py: 1.5 }}>Finished Good Details</DialogTitle>
//         <DialogContent sx={{ pt: 2, fontFamily: PAGE_FONT }}>
//           {viewEntry && [
//             ['Ref No', viewEntry.ref_no],
//             ['Date', fmtDate(viewEntry.fg_date)],
//             ['MIS Ref', viewEntry.mis_ref_no || '-'],
//             ['Product Name', viewEntry.name],
//             ['Product Code', viewEntry.code],
//             ['Category', viewEntry.finished_good_category],
//             ['Quantity', `${viewEntry.quantity} ${viewEntry.unit}`],
//             ['Scrap Qty', `${viewEntry.scrap_quantity || 0} ${viewEntry.scrap_unit || 'Kg'}`],
//             ['Remarks', viewEntry.remarks || '-']
//           ].map(([label, value]) => (
//             <div key={label} className="flex justify-between py-2 border-b border-[#E3E8EF] text-[0.75rem]">
//               <span className="text-[#4B5568]">{label}</span>
//               <span className="font-semibold text-[#151C26] text-right max-w-[60%]">{value}</span>
//             </div>

//           ))}
//         </DialogContent>
//         <DialogActions sx={{ px: 3, pb: 2 }}>
//           <Button onClick={() => setViewEntry(null)} sx={{ textTransform: 'none', color: COLORS.secondary }}>Close</Button>
//         </DialogActions>
//       </Dialog>

//       <Dialog open={Boolean(deleteEntry)} onClose={() => !deleting && setDeleteEntry(null)}>
//         <DialogTitle sx={{ fontSize: '1rem', fontWeight: 700 }}>Delete Finished Good?</DialogTitle>
//         <DialogContent>
//           <DialogContentText sx={{ fontSize: '0.8rem' }}>
//             {deleteEntry ? `${deleteEntry.ref_no} (${deleteEntry.name}) will be permanently deleted.` : ''}
//           </DialogContentText>
//         </DialogContent>
//         <DialogActions sx={{ px: 3, pb: 2 }}>
//           <Button onClick={() => setDeleteEntry(null)} disabled={deleting} sx={{ textTransform: 'none', color: COLORS.secondary }}>Cancel</Button>
//           <Button onClick={confirmDelete} disabled={deleting} variant="contained" color="error" sx={{ textTransform: 'none' }}>
//             {deleting ? 'Deleting...' : 'Delete'}
//           </Button>
//         </DialogActions>
//       </Dialog>
      
//       {}
//       <Dialog open={bulkDeleteOpen} onClose={() => !isBulkDeleting && setBulkDeleteOpen(false)}>
//         <DialogTitle sx={{ fontSize: '1rem', fontWeight: 700 }}>Delete {selected.length} entries?</DialogTitle>
//         <DialogContent>
//           <DialogContentText sx={{ fontSize: '0.8rem' }}>
//             Are you sure you want to permanently delete <strong>{selected.length}</strong> selected entries? This action cannot be undone.
//           </DialogContentText>
//         </DialogContent>
//         <DialogActions sx={{ px: 3, pb: 2 }}>
//           <Button onClick={() => setBulkDeleteOpen(false)} disabled={isBulkDeleting} sx={{ textTransform: 'none', color: COLORS.secondary }}>Cancel</Button>
//           <Button onClick={executeBulkDelete} disabled={isBulkDeleting} variant="contained" color="error" sx={{ textTransform: 'none' }}>
//             {isBulkDeleting ? 'Deleting...' : 'Delete'}
//           </Button>
//         </DialogActions>
//       </Dialog>

//       <Snackbar open={snack.open} autoHideDuration={4000} onClose={() => setSnack((prev) => ({ ...prev, open: false }))} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
//         <Alert severity={snack.severity} variant="filled" onClose={() => setSnack((prev) => ({ ...prev, open: false }))}>
//           {snack.message}
//         </Alert>
//       </Snackbar>
//     </div>
//   );
// };

// export default FinishedGoodMaster;


import React, { useState, useEffect, useCallback } from 'react';
// import { useNavigate } from 'react-router-dom'; // 🔴 Navigate ki zaroorat nahi hai ab
import axios from 'axios';
import {
  Menu, MenuItem, ListItemIcon, ListItemText, Divider, Typography, Tooltip, IconButton,
  Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button, Snackbar, Alert,
  TablePagination, CircularProgress, Checkbox 
} from '@mui/material';
import {
  MoreVert as MoreVertIcon, Visibility as ViewIcon, Edit as EditIcon, Delete as DeleteIcon,
  Close as CloseIcon, Inventory2 as EmptyIcon
} from '@mui/icons-material';
import { Plus, Search, RefreshCw } from 'lucide-react';
import BASE_URL from '../../../config/Config';
import AddFinishedGood from './AddFinishedGood'; // 🔴 Import AddFinishedGood

const COLORS = {
  primary: '#063C3F', primaryDark: '#05292B', primaryLight: '#E8F0F1',
  text: '#151C26', secondary: '#4B5568', tertiary: '#94A3B8',
  border: '#E3E8EF', hover: '#F0FDF9', inputBg: '#F8FFFC'
};

const PAGE_FONT = '"Roboto","Helvetica","Arial",sans-serif';
const authHeaders = () => ({ Authorization: `Bearer ${localStorage.getItem('token')}` });
const fmtDate = (d) => (d ? new Date(d).toLocaleDateString('en-GB') : '-');
const initials = (name = '') =>
  name.trim().split(/\s+/).slice(0, 2).map((w) => w[0]).join('').toUpperCase() || 'FG';

const FinishedGoodMaster = () => {
  // const navigate = useNavigate(); // 🔴 Hata diya

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');

  const [menuAnchor, setMenuAnchor] = useState(null);
  const [menuItem, setMenuItem] = useState(null);
  const [viewEntry, setViewEntry] = useState(null);
  
  const [deleteEntry, setDeleteEntry] = useState(null);
  const [deleting, setDeleting] = useState(false);
  
  // 🔴 Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editId, setEditId] = useState(null);

  // Bulk Delete Dialog State
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);
  
  const [selected, setSelected] = useState([]);
  const [snack, setSnack] = useState({ open: false, message: '', severity: 'success' });

  const notify = (message, severity = 'success') => setSnack({ open: true, message, severity });

  useEffect(() => {
    const t = setTimeout(() => { setSearch(searchInput.trim()); setPage(0); }, 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${BASE_URL}/api/finished-good`, {
        headers: authHeaders(),
        params: { page: page + 1, limit: rowsPerPage, search: search || undefined }
      });
      setData(Array.isArray(res.data.data) ? res.data.data : []);
      setTotal(res.data.pagination?.total || 0);
      setSelected([]);
    } catch (error) {
      console.error('Error fetching finished goods:', error);
      notify(error.response?.data?.message || 'Failed to load finished goods', 'error');
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, search]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const openMenu = (e, item) => { setMenuAnchor(e.currentTarget); setMenuItem(item); };
  const closeMenu = () => setMenuAnchor(null);

  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      setSelected(data.map((n) => n._id));
      return;
    }
    setSelected([]);
  };

  const handleClick = (event, id) => {
    const selectedIndex = selected.indexOf(id);
    let newSelected = [];

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, id);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1));
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selected.slice(0, selectedIndex),
        selected.slice(selectedIndex + 1),
      );
    }
    setSelected(newSelected);
  };

  const confirmDelete = async () => {
    if (!deleteEntry) return;
    try {
      setDeleting(true);
      await axios.delete(`${BASE_URL}/api/finished-good/${deleteEntry._id}`, { headers: authHeaders() });
      notify(`${deleteEntry.ref_no} deleted successfully`);
      setDeleteEntry(null);
      if (data.length === 1 && page > 0) setPage((prev) => prev - 1); else fetchData();
    } catch (error) {
      notify(error.response?.data?.message || 'Failed to delete', 'error');
    } finally {
      setDeleting(false);
    }
  };

  const executeBulkDelete = async () => {
    try {
      setIsBulkDeleting(true);
      await Promise.all(selected.map(id => axios.delete(`${BASE_URL}/api/finished-good/${id}`, { headers: authHeaders() })));
      notify(`${selected.length} entries deleted successfully`);
      setSelected([]);
      fetchData();
      setBulkDeleteOpen(false); 
    } catch (error) {
      notify('Failed to delete some entries', 'error');
    } finally {
      setIsBulkDeleting(false);
    }
  };

  const th = 'py-3 px-4 text-left text-[0.7rem] font-semibold tracking-[0.5px] whitespace-nowrap';
  const td = 'py-2 px-4 text-[0.75rem]';

  return (
    <div className="p-5" style={{ fontFamily: PAGE_FONT }}>
      <div className="mb-5">
        <h1 className="text-[1.25rem] font-bold text-[#151C26] mb-0.5">Finished Goods</h1>
        <p className="text-[0.75rem] text-[#4B5568]">Manage produced items and scrap records</p>
      </div>

      <div className="p-3 mb-5 rounded-lg bg-white border border-[#E3E8EF] shadow-[0_1px_3px_0_rgba(0,0,0,0.05)] flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-[450px]">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
          <input
            type="text"
            autoComplete="off"
            placeholder="Search by Ref No, Name, Code..."
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

          {selected.length > 0 && (
            <button
              onClick={() => setBulkDeleteOpen(true)}
              disabled={isBulkDeleting}
              className="h-9 px-4 rounded-md border border-red-500 text-red-500 hover:bg-red-50 text-[0.75rem] font-medium flex items-center gap-2 transition"
            >
              <DeleteIcon fontSize="small" /> Delete ({selected.length})
            </button>
          )}
          
          {/* 🔴 Button ab Modal open karega */}
          <button
            type="button"
            onClick={() => { setEditId(null); setIsAddModalOpen(true); }}
            className="h-9 px-4 rounded-md bg-[#063C3F] hover:bg-[#05292B] text-white text-[0.75rem] font-medium shadow-[0_1px_3px_0_rgba(0,0,0,0.1)] flex items-center gap-2 transition"
          >
            <Plus size={16} /> Add FG
          </button>
        </div>
      </div>

      <div className="w-full rounded-lg overflow-hidden bg-white border border-[#E3E8EF] shadow-[0_1px_3px_0_rgba(0,0,0,0.05)]">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead className="bg-[#063C3F] text-white">
              <tr>
                <th className="py-3 px-4 w-12 text-center">
                  <Checkbox
                    indeterminate={selected.length > 0 && selected.length < data.length}
                    checked={data.length > 0 && selected.length === data.length}
                    onChange={handleSelectAllClick}
                    sx={{ color: 'white', '&.Mui-checked': { color: 'white' }, '&.MuiCheckbox-indeterminate': { color: 'white' } }}
                  />
                </th>
                <th className={th}>Ref No</th>
                <th className={th}>MIS Ref</th>
                <th className={th}>Date</th>
                <th className={th}>Product Name / Code</th>
                <th className={th}>FG Category</th>
                <th className={th}>Qty Produced</th>
                <th className={th}>Scrap</th>
                <th className={`${th} text-center w-[60px]`}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center">
                    <CircularProgress size={32} sx={{ color: COLORS.primary }} />
                    <div className="text-[0.75rem] mt-2">Loading entries...</div>
                  </td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center">
                    <EmptyIcon sx={{ fontSize: 48, color: COLORS.tertiary }} />
                    <div className="text-[0.875rem] text-[#4B5568]">
                      {search ? 'No entries found' : 'No finished goods available'}
                    </div>
                  </td>
                </tr>
              ) : (
                data.map((item) => {
                  const category = item.finished_good_category || 'Finished Good';
                  const isItemSelected = selected.indexOf(item._id) !== -1;

                  return (
                    <tr key={item._id} className={`border-b border-[#E3E8EF] hover:bg-[#F0FDF9] ${isItemSelected ? 'bg-[#E8F0F1]' : ''}`}>
                      <td className="py-2 px-4 text-center">
                        <Checkbox
                          checked={isItemSelected}
                          onChange={(e) => handleClick(e, item._id)}
                          sx={{ color: '#94A3B8', '&.Mui-checked': { color: '#063C3F' } }}
                        />
                      </td>
                      <td className={`${td} font-semibold text-[#063C3F]`}>{item.ref_no}</td>
                      <td className={`${td} font-medium text-[#4B5568]`}>{item.mis_ref_no || '-'}</td>
                      <td className={td}>{fmtDate(item.fg_date)}</td>
                      <td className={td}>
                        <div className="font-semibold text-gray-800">{item.name || '-'}</div>
                        <div className="text-[0.65rem] text-[#94A3B8]">Code: {item.code || '-'}</div>
                      </td>
                      <td className={td}>
                        <span className={`inline-flex px-2 py-1 rounded text-[0.7rem] font-medium ${category === 'Semi Finished Good' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'}`}>
                          {category}
                        </span>
                      </td>
                      <td className={`${td} font-medium`}>{item.quantity ?? 0} <span className="text-[#94A3B8]">{item.unit || ''}</span></td>
                      <td className={`${td} text-red-600 font-medium`}>{item.scrap_quantity ?? 0} <span className="text-[#94A3B8]">{item.scrap_unit || ''}</span></td>
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
          onPageChange={(_, nextPage) => setPage(nextPage)}
          onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
          sx={{
            borderTop: `1px solid ${COLORS.border}`,
            '& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows': { fontSize: '0.7rem', color: COLORS.secondary }
          }}
        />
      </div>

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

        {/* 🔴 Edit Button ab Modal open karega */}
        <MenuItem 
          onClick={() => { 
            setEditId(menuItem._id); 
            setIsAddModalOpen(true); 
            closeMenu(); 
          }} 
          sx={{ py: 1.5 }}
        >
          <ListItemIcon sx={{ color: COLORS.primary, minWidth: 36 }}><EditIcon fontSize="small" /></ListItemIcon>
          <ListItemText><Typography sx={{ fontSize: '0.75rem', fontWeight: 500, color: COLORS.text }}>Edit</Typography></ListItemText>
        </MenuItem>

        <Divider sx={{ my: 0.5 }} />
        
        <MenuItem onClick={() => { setDeleteEntry(menuItem); closeMenu(); }} sx={{ py: 1.5 }}>
          <ListItemIcon sx={{ color: '#EF4444', minWidth: 36 }}><DeleteIcon fontSize="small" /></ListItemIcon>
          <ListItemText><Typography sx={{ fontSize: '0.75rem', fontWeight: 500, color: '#EF4444' }}>Delete</Typography></ListItemText>
        </MenuItem>
      </Menu>

      <Dialog open={Boolean(viewEntry)} onClose={() => setViewEntry(null)} fullWidth maxWidth="xs" slotProps={{ paper: { sx: { borderRadius: 2 } } }}>
        <DialogTitle sx={{ bgcolor: COLORS.primary, color: '#fff', fontSize: '1rem', fontWeight: 700, py: 1.5 }}>Finished Good Details</DialogTitle>
        <DialogContent sx={{ pt: 2, fontFamily: PAGE_FONT }}>
          {viewEntry && [
            ['Ref No', viewEntry.ref_no],
            ['Date', fmtDate(viewEntry.fg_date)],
            ['MIS Ref', viewEntry.mis_ref_no || '-'],
            ['Product Name', viewEntry.name],
            ['Product Code', viewEntry.code],
            ['Category', viewEntry.finished_good_category],
            ['Quantity', `${viewEntry.quantity} ${viewEntry.unit}`],
            ['Scrap Qty', `${viewEntry.scrap_quantity || 0} ${viewEntry.scrap_unit || 'Kg'}`],
            ['Remarks', viewEntry.remarks || '-']
          ].map(([label, value]) => (
            <div key={label} className="flex justify-between py-2 border-b border-[#E3E8EF] text-[0.75rem]">
              <span className="text-[#4B5568]">{label}</span>
              <span className="font-semibold text-[#151C26] text-right max-w-[60%]">{value}</span>
            </div>
          ))}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setViewEntry(null)} sx={{ textTransform: 'none', color: COLORS.secondary }}>Close</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={Boolean(deleteEntry)} onClose={() => !deleting && setDeleteEntry(null)}>
        <DialogTitle sx={{ fontSize: '1rem', fontWeight: 700 }}>Delete Finished Good?</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ fontSize: '0.8rem' }}>
            {deleteEntry ? `${deleteEntry.ref_no} (${deleteEntry.name}) will be permanently deleted.` : ''}
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDeleteEntry(null)} disabled={deleting} sx={{ textTransform: 'none', color: COLORS.secondary }}>Cancel</Button>
          <Button onClick={confirmDelete} disabled={deleting} variant="contained" color="error" sx={{ textTransform: 'none' }}>
            {deleting ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
      
      <Dialog open={bulkDeleteOpen} onClose={() => !isBulkDeleting && setBulkDeleteOpen(false)}>
        <DialogTitle sx={{ fontSize: '1rem', fontWeight: 700 }}>Delete {selected.length} entries?</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ fontSize: '0.8rem' }}>
            Are you sure you want to permanently delete <strong>{selected.length}</strong> selected entries? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setBulkDeleteOpen(false)} disabled={isBulkDeleting} sx={{ textTransform: 'none', color: COLORS.secondary }}>Cancel</Button>
          <Button onClick={executeBulkDelete} disabled={isBulkDeleting} variant="contained" color="error" sx={{ textTransform: 'none' }}>
            {isBulkDeleting ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snack.open} autoHideDuration={4000} onClose={() => setSnack((prev) => ({ ...prev, open: false }))} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert severity={snack.severity} variant="filled" onClose={() => setSnack((prev) => ({ ...prev, open: false }))}>
          {snack.message}
        </Alert>
      </Snackbar>

      {/* 🔴 Yahan AddFinishedGood Modal render ho raha hai */}
      {isAddModalOpen && (
        <AddFinishedGood 
          editId={editId}
          onClose={() => setIsAddModalOpen(false)} 
          onRefresh={(msg) => {
            setIsAddModalOpen(false);
            fetchData(); 
            notify(msg);
          }} 
        />
      )}

    </div>
  );
};

export default FinishedGoodMaster;