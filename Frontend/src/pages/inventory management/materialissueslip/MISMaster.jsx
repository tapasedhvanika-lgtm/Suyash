



// import React, { useState, useEffect, useCallback } from 'react';
// import axios from 'axios';
// import {
//   Menu, MenuItem, ListItemIcon, ListItemText, Divider, Typography, Tooltip, IconButton,
//   Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button, Snackbar, Alert,
//   TablePagination, CircularProgress, Checkbox 
// } from '@mui/material';
// import {
//   MoreVert as MoreVertIcon, Print as PrintIcon, Edit as EditIcon,
//   Close as CloseIcon, Inventory2 as EmptyIcon, Delete as DeleteIcon 
// } from '@mui/icons-material';
// import { Plus, Search, RefreshCw, Printer, X } from 'lucide-react';
// import BASE_URL from '../../../config/Config';
// import AddMIS from './AddMIS'; 

// const COLORS = {
//   primary: '#063C3F', primaryDark: '#05292B', primaryLight: '#E8F0F1',
//   text: '#151C26', secondary: '#4B5568', tertiary: '#94A3B8',
//   border: '#E3E8EF', hover: '#F0FDF9', inputBg: '#F8FFFC'
// };

// const PAGE_FONT = '"Roboto","Helvetica","Arial",sans-serif';

// const MISMaster = () => {
//   const [data, setData] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [total, setTotal] = useState(0);
//   const [page, setPage] = useState(0);
//   const [rowsPerPage, setRowsPerPage] = useState(5);
  
//   const [searchInput, setSearchInput] = useState('');
//   const [search, setSearch] = useState('');

//   const [menuAnchor, setMenuAnchor] = useState(null);
//   const [menuItem, setMenuItem] = useState(null);
//   const [printEntry, setPrintEntry] = useState(null); 
//   const [snack, setSnack] = useState({ open: false, message: '', severity: 'success' });

//   // 🔴 States for Modal, Delete & Bulk Selection
//   const [isAddModalOpen, setIsAddModalOpen] = useState(false);
//   const [editId, setEditId] = useState(null);
  
//   const [deleteEntry, setDeleteEntry] = useState(null); // Single Delete
//   const [deleting, setDeleting] = useState(false);
  
//   const [selected, setSelected] = useState([]); // Bulk Delete
//   const [isBulkDeleting, setIsBulkDeleting] = useState(false);

//   const notify = (message, severity = 'success') => setSnack({ open: true, message, severity });

//   useEffect(() => {
//     const t = setTimeout(() => { setSearch(searchInput.trim()); setPage(0); }, 400);
//     return () => clearTimeout(t);
//   }, [searchInput]);

//   const fetchData = useCallback(async () => {
//     setLoading(true);
//     try {
//       const token = localStorage.getItem('token');
//       const res = await axios.get(`${BASE_URL}/api/material-issue-slip`, {
//         headers: { Authorization: `Bearer ${token}` },
//         params: { page: page + 1, limit: rowsPerPage, search: search || undefined }
//       });
//       setData(res.data.data || []);
//       setTotal(res.data.pagination?.total || 0);
//       setSelected([]); 
//     } catch (error) {
//       console.error('Error fetching data:', error);
//       notify(error.response?.data?.message || 'Failed to load slips', 'error');
//     } finally {
//       setLoading(false);
//     }
//   }, [page, rowsPerPage, search]);

//   useEffect(() => { fetchData(); }, [fetchData]);

//   const openMenu = (e, item) => { setMenuAnchor(e.currentTarget); setMenuItem(item); };
//   const closeMenu = () => setMenuAnchor(null);

//   const handlePrintClick = () => {
//     window.print();
//   };

//   // 🔴 Checkbox Logic
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

//   // 🔴 Single Delete Logic
//   const confirmDelete = async () => {
//     try {
//       setDeleting(true);
//       await axios.delete(`${BASE_URL}/api/material-issue-slip/${deleteEntry._id}`, { 
//         headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } 
//       });
//       notify(`${deleteEntry.ref_no} deleted`);
//       setDeleteEntry(null);
//       if (data.length === 1 && page > 0) setPage(page - 1); else fetchData();
//     } catch (error) {
//       notify(error.response?.data?.message || 'Failed to delete', 'error');
//     } finally {
//       setDeleting(false);
//     }
//   };

//   // 🔴 Bulk Delete Logic
//   const handleBulkDelete = async () => {
//     if (!window.confirm(`Are you sure you want to delete ${selected.length} selected MIS entries?`)) return;
    
//     try {
//       setIsBulkDeleting(true);
//       await Promise.all(selected.map(id => axios.delete(`${BASE_URL}/api/material-issue-slip/${id}`, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } })));
      
//       notify(`${selected.length} entries deleted successfully`);
//       setSelected([]);
//       fetchData();
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
//         <h1 className="text-[1.25rem] font-bold text-[#151C26] mb-0.5">Material Issue Slips</h1>
//         <p className="text-[0.75rem] text-[#4B5568]">Track materials issued to departments</p>
//       </div>

//       <div className="p-3 mb-5 rounded-lg bg-white border border-[#E3E8EF] shadow-[0_1px_3px_0_rgba(0,0,0,0.05)] flex flex-col sm:flex-row items-center justify-between gap-3">
//         <div className="relative w-full sm:w-[450px]">
//           <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
//           <input
//             type="text"
//             autoComplete="off"
//             placeholder="Search by Ref No, Department..."
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

//           {selected.length > 0 && (
//             <button
//               onClick={handleBulkDelete}
//               disabled={isBulkDeleting}
//               className="h-9 px-4 rounded-md border border-red-500 text-red-500 hover:bg-red-50 text-[0.75rem] font-medium flex items-center gap-2 transition"
//             >
//               <DeleteIcon fontSize="small" /> Delete ({selected.length})
//             </button>
//           )}
          
//           <button
//             onClick={() => { setEditId(null); setIsAddModalOpen(true); }}
//             className="h-9 px-4 rounded-md bg-[#063C3F] hover:bg-[#05292B] text-white text-[0.75rem] font-medium shadow-[0_1px_3px_0_rgba(0,0,0,0.1)] flex items-center gap-2 transition"
//           >
//             <Plus size={16} /> Create MIS
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
//                 <th className={th}>Ref No (MIS)</th>
//                 <th className={th}>Date</th>
//                 <th className={th}>RMP Ref</th>
//                 <th className={th}>Department</th>
//                 <th className={th}>Issued To</th>
//                 <th className={`${th} text-center w-[60px]`}>Actions</th>
//               </tr>
//             </thead>
//             <tbody>
//               {loading ? (
//                 <tr>
//                   <td colSpan={7} className="py-12 text-center">
//                     <CircularProgress size={32} sx={{ color: COLORS.primary }} />
//                     <div className="text-[0.75rem] mt-2">Loading slips...</div>
//                   </td>
//                 </tr>
//               ) : data.length === 0 ? (
//                 <tr>
//                   <td colSpan={7} className="py-12 text-center">
//                     <EmptyIcon sx={{ fontSize: 48, color: COLORS.tertiary }} />
//                     <div className="text-[0.875rem] text-[#4B5568]">
//                       {search ? 'No slips found' : 'No slips available'}
//                     </div>
//                   </td>
//                 </tr>
//               ) : (
//                 data.map((item) => {
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
//                       <td className={td}>{new Date(item.issue_date).toLocaleDateString('en-GB')}</td>
//                       <td className={td}>{item.purchase_ref || item.rmp_ref_no || '-'}</td>
//                       <td className={td}>{item.department}</td>
//                       <td className={td}>{item.issued_to}</td>
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
//           onPageChange={(_, p) => setPage(p)}
//           onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
//           sx={{
//             borderTop: `1px solid ${COLORS.border}`,
//             '& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows': {
//               fontSize: '0.7rem', color: COLORS.secondary
//             }
//           }}
//         />
//       </div>

//       {/* 🔴 Actions Menu (Print, Edit, Delete) */}
//       <Menu
//         anchorEl={menuAnchor}
//         open={Boolean(menuAnchor)}
//         onClose={closeMenu}
//         slotProps={{ paper: { elevation: 3, sx: { mt: 1, minWidth: 180, borderRadius: 2, border: `1px solid ${COLORS.border}` } } }}
//       >
//         <MenuItem onClick={() => { setPrintEntry(menuItem); closeMenu(); }} sx={{ py: 1.5 }}>
//           <ListItemIcon sx={{ color: COLORS.primary, minWidth: 36 }}><PrintIcon fontSize="small" /></ListItemIcon>
//           <ListItemText><Typography sx={{ fontSize: '0.75rem', fontWeight: 500, color: COLORS.text }}>Print Slip</Typography></ListItemText>
//         </MenuItem>
        
//         <MenuItem 
//           onClick={() => { 
//             setEditId(menuItem._id); 
//             setIsAddModalOpen(true); 
//             closeMenu(); 
//           }} 
//           sx={{ py: 1.5 }}
//         >
//           <ListItemIcon sx={{ color: COLORS.primary, minWidth: 36 }}><EditIcon fontSize="small" /></ListItemIcon>
//           <ListItemText><Typography sx={{ fontSize: '0.75rem', fontWeight: 500, color: COLORS.text }}>Edit</Typography></ListItemText>
//         </MenuItem>

//         <Divider sx={{ my: 0.5 }} />
        
//         {/* 🔴 Single Delete Menu Item */}
//         <MenuItem onClick={() => { setDeleteEntry(menuItem); closeMenu(); }} sx={{ py: 1.5 }}>
//           <ListItemIcon sx={{ color: '#EF4444', minWidth: 36 }}><DeleteIcon fontSize="small" /></ListItemIcon>
//           <ListItemText><Typography sx={{ fontSize: '0.75rem', fontWeight: 500, color: '#EF4444' }}>Delete</Typography></ListItemText>
//         </MenuItem>
//       </Menu>

//       {/* Print Modal */}
//       {printEntry && (
//         <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 overflow-y-auto">
//           <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl overflow-hidden my-8">
//             <div className="flex justify-between items-center bg-gray-50 p-4 border-b border-gray-200 print:hidden">
//               <h3 className="font-bold text-gray-800">Print Preview</h3>
//               <div className="flex gap-2">
//                 <button onClick={handlePrintClick} className="bg-[#0f4a4a] text-white px-4 py-2 rounded-md flex items-center gap-2 text-sm font-semibold hover:bg-[#0a3636] transition"><Printer size={16}/> Print</button>
//                 <button onClick={() => setPrintEntry(null)} className="p-2 border border-gray-300 rounded-md hover:bg-gray-100 text-gray-600"><X size={18}/></button>
//               </div>
//             </div>
//             <div className="p-10 print:p-0" id="print-area">
//               <div className="border-2 border-gray-800 p-8">
//                 <div className="text-center border-b-2 border-gray-800 pb-4 mb-6">
//                   <h1 className="text-3xl font-bold uppercase tracking-widest text-gray-900">Suyash Enterprises</h1>
//                   <p className="text-sm font-semibold mt-1 text-gray-600">MATERIAL ISSUE SLIP</p>
//                 </div>
//                 <div className="flex justify-between text-sm mb-8">
//                   <div className="space-y-1">
//                     <p><span className="text-gray-500 inline-block w-20">Slip No:</span> <strong>{printEntry.ref_no}</strong></p>
//                     <p><span className="text-gray-500 inline-block w-20">Date:</span> {new Date(printEntry.issue_date).toLocaleDateString('en-GB')}</p>
//                     <p><span className="text-gray-500 inline-block w-20">RMP Ref:</span> {printEntry.purchase_ref || printEntry.rmp_ref_no || 'N/A'}</p>
//                   </div>
//                   <div className="text-right space-y-1">
//                     <p><span className="text-gray-500">Department:</span> <strong>{printEntry.department}</strong></p>
//                     <p><span className="text-gray-500">Issued To:</span> {printEntry.issued_to}</p>
//                   </div>
//                 </div>
//                 <table className="w-full text-sm border-collapse border border-gray-800 mb-12">
//                   <thead className="bg-gray-100">
//                     <tr>
//                       <th className="border border-gray-800 p-2 text-left w-12">S.No</th>
//                       <th className="border border-gray-800 p-2 text-left">Material Name</th>
//                       <th className="border border-gray-800 p-2 text-left">Code</th>
//                       <th className="border border-gray-800 p-2 text-right">Qty</th>
//                       <th className="border border-gray-800 p-2 text-center">Unit</th>
//                     </tr>
//                   </thead>
//                   <tbody>
//                     <tr>
//                       <td className="border border-gray-800 p-2 text-center">1</td>
//                       <td className="border border-gray-800 p-2 font-medium">{printEntry.name}</td>
//                       <td className="border border-gray-800 p-2">{printEntry.code}</td>
//                       <td className="border border-gray-800 p-2 text-right">{printEntry.quantity}</td>
//                       <td className="border border-gray-800 p-2 text-center">{printEntry.unit}</td>
//                     </tr>
//                   </tbody>
//                 </table>
//                 <div className="flex justify-between mt-20 pt-8">
//                   <div className="text-center"><div className="border-t border-gray-800 w-48 pt-2 font-semibold text-sm">Issued By</div></div>
//                   <div className="text-center"><div className="border-t border-gray-800 w-48 pt-2 font-semibold text-sm">Received By</div></div>
//                   <div className="text-center"><div className="border-t border-gray-800 w-48 pt-2 font-semibold text-sm">Authorised By</div></div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* 🔴 Single Delete Confirmation Dialog */}
//       <Dialog open={Boolean(deleteEntry)} onClose={() => !deleting && setDeleteEntry(null)}>
//         <DialogTitle sx={{ fontSize: '1rem', fontWeight: 700 }}>Delete MIS entry?</DialogTitle>
//         <DialogContent>
//           <DialogContentText sx={{ fontSize: '0.8rem' }}>
//             {deleteEntry ? `${deleteEntry.ref_no} will be permanently deleted.` : ''}
//           </DialogContentText>
//         </DialogContent>
//         <DialogActions sx={{ px: 3, pb: 2 }}>
//           <Button onClick={() => setDeleteEntry(null)} disabled={deleting} sx={{ textTransform: 'none', color: COLORS.secondary }}>Cancel</Button>
//           <Button onClick={confirmDelete} disabled={deleting} variant="contained" color="error" sx={{ textTransform: 'none' }}>
//             {deleting ? 'Deleting...' : 'Delete'}
//           </Button>
//         </DialogActions>
//       </Dialog>

//       <Snackbar open={snack.open} autoHideDuration={4000}
//         onClose={() => setSnack((s) => ({ ...s, open: false }))}
//         anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
//         <Alert severity={snack.severity} variant="filled" onClose={() => setSnack((s) => ({ ...s, open: false }))}>
//           {snack.message}
//         </Alert>
//       </Snackbar>

//       <style>
//         {`
//           @media print {
//             body * { visibility: hidden; }
//             #print-area, #print-area * { visibility: visible; }
//             #print-area { position: absolute; left: 0; top: 0; width: 100%; }
//             .print\\:hidden { display: none !important; }
//           }
//         `}
//       </style>

//       {isAddModalOpen && (
//         <AddMIS 
//           editId={editId}
//           onClose={() => setIsAddModalOpen(false)} 
//           onRefresh={(msg) => {
//             setIsAddModalOpen(false);
//             fetchData(); 
//             notify(msg);
//           }} 
//         />
//       )}

//     </div>
//   );
// };

// export default MISMaster;


import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import {
  Menu, MenuItem, ListItemIcon, ListItemText, Divider, Typography, Tooltip, IconButton,
  Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button, Snackbar, Alert,
  TablePagination, CircularProgress, Checkbox 
} from '@mui/material';
import {
  MoreVert as MoreVertIcon, Print as PrintIcon, Edit as EditIcon,
  Close as CloseIcon, Inventory2 as EmptyIcon, Delete as DeleteIcon 
} from '@mui/icons-material';
import { Plus, Search, RefreshCw, Printer, X } from 'lucide-react';
import BASE_URL from '../../../config/Config';
import AddMIS from './AddMIS'; 

const COLORS = {
  primary: '#063C3F', primaryDark: '#05292B', primaryLight: '#E8F0F1',
  text: '#151C26', secondary: '#4B5568', tertiary: '#94A3B8',
  border: '#E3E8EF', hover: '#F0FDF9', inputBg: '#F8FFFC'
};

const PAGE_FONT = '"Roboto","Helvetica","Arial",sans-serif';

const MISMaster = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');

  const [menuAnchor, setMenuAnchor] = useState(null);
  const [menuItem, setMenuItem] = useState(null);
  const [printEntry, setPrintEntry] = useState(null); 
  const [snack, setSnack] = useState({ open: false, message: '', severity: 'success' });

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  
  const [deleteEntry, setDeleteEntry] = useState(null);
  const [deleting, setDeleting] = useState(false);
  
  const [selected, setSelected] = useState([]);
  
  // 🔴 Bulk Delete Dialog States
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);

  const notify = (message, severity = 'success') => setSnack({ open: true, message, severity });

  useEffect(() => {
    const t = setTimeout(() => { setSearch(searchInput.trim()); setPage(0); }, 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${BASE_URL}/api/material-issue-slip`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { page: page + 1, limit: rowsPerPage, search: search || undefined }
      });
      setData(res.data.data || []);
      setTotal(res.data.pagination?.total || 0);
      setSelected([]); 
    } catch (error) {
      console.error('Error fetching data:', error);
      notify(error.response?.data?.message || 'Failed to load slips', 'error');
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, search]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const openMenu = (e, item) => { setMenuAnchor(e.currentTarget); setMenuItem(item); };
  const closeMenu = () => setMenuAnchor(null);

  const handlePrintClick = () => {
    window.print();
  };

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
    try {
      setDeleting(true);
      await axios.delete(`${BASE_URL}/api/material-issue-slip/${deleteEntry._id}`, { 
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } 
      });
      notify(`${deleteEntry.ref_no} deleted`);
      setDeleteEntry(null);
      if (data.length === 1 && page > 0) setPage(page - 1); else fetchData();
    } catch (error) {
      notify(error.response?.data?.message || 'Failed to delete', 'error');
    } finally {
      setDeleting(false);
    }
  };

  // 🔴 Bulk Delete Execution (No window.confirm)
  const executeBulkDelete = async () => {
    try {
      setIsBulkDeleting(true);
      await Promise.all(selected.map(id => axios.delete(`${BASE_URL}/api/material-issue-slip/${id}`, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } })));
      
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
        <h1 className="text-[1.25rem] font-bold text-[#151C26] mb-0.5">Material Issue Slips</h1>
        <p className="text-[0.75rem] text-[#4B5568]">Track materials issued to departments</p>
      </div>

      <div className="p-3 mb-5 rounded-lg bg-white border border-[#E3E8EF] shadow-[0_1px_3px_0_rgba(0,0,0,0.05)] flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-[450px]">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
          <input
            type="text"
            autoComplete="off"
            placeholder="Search by Ref No, Department..."
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
          
          <button
            onClick={() => { setEditId(null); setIsAddModalOpen(true); }}
            className="h-9 px-4 rounded-md bg-[#063C3F] hover:bg-[#05292B] text-white text-[0.75rem] font-medium shadow-[0_1px_3px_0_rgba(0,0,0,0.1)] flex items-center gap-2 transition"
          >
            <Plus size={16} /> Create MIS
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
                <th className={th}>Ref No (MIS)</th>               
                <th className={th}>Date</th>
                <th className={th}>RMP Ref</th>
                <th className={th}>Department</th>
                <th className={th}>Issued To</th>
                <th className={`${th} text-center w-[60px]`}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center">
                    <CircularProgress size={32} sx={{ color: COLORS.primary }} />
                    <div className="text-[0.75rem] mt-2">Loading slips...</div>
                  </td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center">
                    <EmptyIcon sx={{ fontSize: 48, color: COLORS.tertiary }} />
                    <div className="text-[0.875rem] text-[#4B5568]">
                      {search ? 'No slips found' : 'No slips available'}
                    </div>
                  </td>
                </tr>
              ) : (
                data.map((item) => {
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
                      <td className={td}>{new Date(item.issue_date).toLocaleDateString('en-GB')}</td>
                      <td className={td}>{item.purchase_ref || item.rmp_ref_no || '-'}</td>
                      <td className={td}>{item.department}</td>
                      <td className={td}>{item.issued_to}</td>
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

      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={closeMenu}
        slotProps={{ paper: { elevation: 3, sx: { mt: 1, minWidth: 180, borderRadius: 2, border: `1px solid ${COLORS.border}` } } }}
      >
        <MenuItem onClick={() => { setPrintEntry(menuItem); closeMenu(); }} sx={{ py: 1.5 }}>
          <ListItemIcon sx={{ color: COLORS.primary, minWidth: 36 }}><PrintIcon fontSize="small" /></ListItemIcon>
          <ListItemText><Typography sx={{ fontSize: '0.75rem', fontWeight: 500, color: COLORS.text }}>Print Slip</Typography></ListItemText>
        </MenuItem>
        
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

      {printEntry && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl overflow-hidden my-8">
            <div className="flex justify-between items-center bg-gray-50 p-4 border-b border-gray-200 print:hidden">
              <h3 className="font-bold text-gray-800">Print Preview</h3>
              <div className="flex gap-2">
                <button onClick={handlePrintClick} className="bg-[#0f4a4a] text-white px-4 py-2 rounded-md flex items-center gap-2 text-sm font-semibold hover:bg-[#0a3636] transition"><Printer size={16}/> Print</button>
                <button onClick={() => setPrintEntry(null)} className="p-2 border border-gray-300 rounded-md hover:bg-gray-100 text-gray-600"><X size={18}/></button>
              </div>
            </div>
            <div className="p-10 print:p-0" id="print-area">
              <div className="border-2 border-gray-800 p-8">
                <div className="text-center border-b-2 border-gray-800 pb-4 mb-6">
                  <h1 className="text-3xl font-bold uppercase tracking-widest text-gray-900">Suyash Enterprises</h1>
                  <p className="text-sm font-semibold mt-1 text-gray-600">MATERIAL ISSUE SLIP</p>
                </div>
                <div className="flex justify-between text-sm mb-8">
                  <div className="space-y-1">
                    <p><span className="text-gray-500 inline-block w-20">Slip No:</span> <strong>{printEntry.ref_no}</strong></p>
                    <p><span className="text-gray-500 inline-block w-20">Date:</span> {new Date(printEntry.issue_date).toLocaleDateString('en-GB')}</p>
                    <p><span className="text-gray-500 inline-block w-20">RMP Ref:</span> {printEntry.purchase_ref || printEntry.rmp_ref_no || 'N/A'}</p>
                  </div>
                  <div className="text-right space-y-1">
                    <p><span className="text-gray-500">Department:</span> <strong>{printEntry.department}</strong></p>
                    <p><span className="text-gray-500">Issued To:</span> {printEntry.issued_to}</p>
                  </div>
                </div>
                <table className="w-full text-sm border-collapse border border-gray-800 mb-12">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="border border-gray-800 p-2 text-left w-12">S.No</th>
                      <th className="border border-gray-800 p-2 text-left">Material Name</th>
                      <th className="border border-gray-800 p-2 text-left">Code</th>
                      <th className="border border-gray-800 p-2 text-right">Qty</th>
                      <th className="border border-gray-800 p-2 text-center">Unit</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border border-gray-800 p-2 text-center">1</td>
                      <td className="border border-gray-800 p-2 font-medium">{printEntry.name}</td>
                      <td className="border border-gray-800 p-2">{printEntry.code}</td>
                      <td className="border border-gray-800 p-2 text-right">{printEntry.quantity}</td>
                      <td className="border border-gray-800 p-2 text-center">{printEntry.unit}</td>
                    </tr>
                  </tbody>
                </table>
                <div className="flex justify-between mt-20 pt-8">
                  <div className="text-center"><div className="border-t border-gray-800 w-48 pt-2 font-semibold text-sm">Issued By</div></div>
                  <div className="text-center"><div className="border-t border-gray-800 w-48 pt-2 font-semibold text-sm">Received By</div></div>
                  <div className="text-center"><div className="border-t border-gray-800 w-48 pt-2 font-semibold text-sm">Authorised By</div></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <Dialog open={Boolean(deleteEntry)} onClose={() => !deleting && setDeleteEntry(null)}>
        <DialogTitle sx={{ fontSize: '1rem', fontWeight: 700 }}>Delete MIS entry?</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ fontSize: '0.8rem' }}>
            {deleteEntry ? `${deleteEntry.ref_no} will be permanently deleted.` : ''}
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDeleteEntry(null)} disabled={deleting} sx={{ textTransform: 'none', color: COLORS.secondary }}>Cancel</Button>
          <Button onClick={confirmDelete} disabled={deleting} variant="contained" color="error" sx={{ textTransform: 'none' }}>
            {deleting ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>

      {}
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

      <Snackbar open={snack.open} autoHideDuration={4000}
        onClose={() => setSnack((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert severity={snack.severity} variant="filled" onClose={() => setSnack((s) => ({ ...s, open: false }))}>
          {snack.message}
        </Alert>
      </Snackbar>

      <style>
        {`
          @media print {
            body * { visibility: hidden; }
            #print-area, #print-area * { visibility: visible; }
            #print-area { position: absolute; left: 0; top: 0; width: 100%; }
            .print\\:hidden { display: none !important; }
          }
        `}
      </style>

      {isAddModalOpen && (
        <AddMIS 
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

export default MISMaster;

