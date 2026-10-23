// import React, { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import axios from 'axios';
// // 👇 Edit icon import kiya gaya hai
// import { Plus, Search, Printer, X, RefreshCw, Edit } from 'lucide-react';

// const MISMaster = () => {
//   const navigate = useNavigate();
//   const [data, setData] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [search, setSearch] = useState('');
//   const [printEntry, setPrintEntry] = useState(null);

//   const fetchData = async () => {
//     setLoading(true);
//     try {
//       const token = localStorage.getItem('token');
//       const res = await axios.get(`http://localhost:5009/api/material-issue-slip?search=${search}`, {
//         headers: { Authorization: `Bearer ${token}` }
//       });
//       setData(res.data.data);
//     } catch (error) {
//       console.error(error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => { fetchData(); }, [search]);

//   const handlePrint = () => {
//     window.print();
//   };

//   return (
//     <div className="p-6 bg-[#F8F9FA] min-h-screen font-sans">
      
//       <div className="mb-6">
//         <h1 className="text-2xl font-bold text-gray-800">Material Issue Slips</h1>
//         <p className="text-gray-500 text-sm mt-1">Track materials issued to departments</p>
//       </div>

//       <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-6 flex justify-between">
//         <div className="relative w-full max-w-sm">
//           <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
//           <input type="text" placeholder="Search by Ref No or Dept..." className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md text-sm" value={search} onChange={(e) => setSearch(e.target.value)} />
//         </div>
//         <div className="flex gap-2">
//            <button onClick={fetchData} className="p-2 border rounded-md hover:bg-gray-50"><RefreshCw size={18} className={loading ? "animate-spin" : ""} /></button>
//            <button onClick={() => navigate('/inventorymanagement/mis/add')} className="bg-[#0f4a4a] text-white px-4 py-2 rounded-md flex items-center gap-2 text-sm font-medium"><Plus size={18}/> Create MIS</button>
//         </div>
//       </div>

//       <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
//         <table className="w-full text-left border-collapse">
//           <thead className="bg-[#0f4a4a] text-white text-sm">
//             <tr>
//               <th className="p-3">Ref No (MIS)</th>
//               <th className="p-3">Date</th>
//               <th className="p-3">RMP Ref</th>
//               <th className="p-3">Department</th>
//               <th className="p-3">Issued To</th>
//               {/* Header change kiya hai taaki Actions clear rahe */}
//               <th className="p-3 text-center">Actions</th>
//             </tr>
//           </thead>
//           <tbody className="text-sm text-gray-700">
//             {data.length === 0 && !loading && (
//               <tr>
//                 <td colSpan="6" className="text-center p-8 text-gray-500">No data found.</td>
//               </tr>
//             )}
//             {data.map((item) => (
//               <tr key={item._id} className="border-b hover:bg-gray-50">
//                 <td className="p-3 font-semibold text-[#0f4a4a]">{item.ref_no}</td>
//                 <td className="p-3">{new Date(item.issue_date).toLocaleDateString('en-GB')}</td>
//                 <td className="p-3">{item.rmp_ref_no || '-'}</td>
//                 <td className="p-3">{item.department}</td>
//                 <td className="p-3">{item.issued_to}</td>
                
//                 {/* 👇 YAHAN EDIT AUR PRINT KE BUTTONS HAIN 👇 */}
//                 <td className="p-3 text-center flex justify-center gap-2">
//                   <button 
//                     onClick={() => navigate(`/inventorymanagement/mis/add?id=${item._id}`)} 
//                     className="p-2 text-blue-600 hover:bg-blue-50 rounded-md transition"
//                     title="Edit Slip"
//                   >
//                     <Edit size={18} />
//                   </button>

//                   <button 
//                     onClick={() => setPrintEntry(item)} 
//                     className="p-2 text-gray-600 hover:bg-gray-200 rounded-md transition"
//                     title="Print Slip"
//                   >
//                     <Printer size={18} />
//                   </button>
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>

//       {/* PRINT SLIP MODAL */}
//       {printEntry && (
//         <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 overflow-y-auto">
//           <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl overflow-hidden my-8">
            
//             <div className="flex justify-between items-center bg-gray-100 p-4 border-b print:hidden">
//               <h3 className="font-bold text-gray-800">Print Preview</h3>
//               <div className="flex gap-2">
//                 <button onClick={handlePrint} className="bg-[#0f4a4a] text-white px-4 py-2 rounded-md flex items-center gap-2 text-sm"><Printer size={16}/> Print Slip</button>
//                 <button onClick={() => setPrintEntry(null)} className="p-2 border rounded-md hover:bg-gray-200"><X size={18}/></button>
//               </div>
//             </div>

//             <div className="p-10 print:p-0" id="print-area">
//               <div className="border-2 border-gray-800 p-6">
//                 <div className="text-center border-b-2 border-gray-800 pb-4 mb-4">
//                   <h1 className="text-3xl font-bold uppercase tracking-widest">Suyash Enterprises</h1>
//                   <p className="text-sm font-semibold mt-1">MATERIAL ISSUE SLIP</p>
//                 </div>
//                 <div className="flex justify-between text-sm mb-6">
//                   <div>
//                     <p><strong>Slip No:</strong> {printEntry.ref_no}</p>
//                     <p><strong>Date:</strong> {new Date(printEntry.issue_date).toLocaleDateString('en-GB')}</p>
//                     <p><strong>RMP Ref:</strong> {printEntry.rmp_ref_no || 'N/A'}</p>
//                   </div>
//                   <div className="text-right">
//                     <p><strong>Department:</strong> {printEntry.department}</p>
//                     <p><strong>Issued To:</strong> {printEntry.issued_to}</p>
//                   </div>
//                 </div>
//                 <table className="w-full text-sm border-collapse border border-gray-800 mb-10">
//                   <thead className="bg-gray-200">
//                     <tr>
//                       <th className="border border-gray-800 p-2">S.No</th>
//                       <th className="border border-gray-800 p-2">Material Name</th>
//                       <th className="border border-gray-800 p-2">Code</th>
//                       <th className="border border-gray-800 p-2">Qty</th>
//                       <th className="border border-gray-800 p-2">Unit</th>
//                     </tr>
//                   </thead>
//                   <tbody>
//                     {printEntry.items.map((item, idx) => (
//                       <tr key={idx}>
//                         <td className="border border-gray-800 p-2 text-center">{idx + 1}</td>
//                         <td className="border border-gray-800 p-2">{item.name}</td>
//                         <td className="border border-gray-800 p-2">{item.code}</td>
//                         <td className="border border-gray-800 p-2 text-right">{item.quantity}</td>
//                         <td className="border border-gray-800 p-2 text-center">{item.unit}</td>
//                       </tr>
//                     ))}
//                   </tbody>
//                 </table>
//                 <div className="flex justify-between mt-16 pt-8">
//                   <div className="text-center"><div className="border-t border-gray-800 w-40 pt-1 font-semibold text-sm">Issued By</div></div>
//                   <div className="text-center"><div className="border-t border-gray-800 w-40 pt-1 font-semibold text-sm">Received By</div></div>
//                   <div className="text-center"><div className="border-t border-gray-800 w-40 pt-1 font-semibold text-sm">Authorised By</div></div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}

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

//     </div>
//   );
// };

// export default MISMaster;


import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Menu, MenuItem, ListItemIcon, ListItemText, Divider, Typography, Tooltip, IconButton,
  Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button, Snackbar, Alert,
  TablePagination, CircularProgress
} from '@mui/material';
import {
  MoreVert as MoreVertIcon, Print as PrintIcon, Edit as EditIcon,
  Close as CloseIcon, Inventory2 as EmptyIcon
} from '@mui/icons-material';
import { Plus, Search, RefreshCw, Printer, X } from 'lucide-react';

// Same colors as RMP
const COLORS = {
  primary: '#063C3F', primaryDark: '#05292B', primaryLight: '#E8F0F1',
  text: '#151C26', secondary: '#4B5568', tertiary: '#94A3B8',
  border: '#E3E8EF', hover: '#F0FDF9', inputBg: '#F8FFFC'
};

const PAGE_FONT = '"Roboto","Helvetica","Arial",sans-serif';

const MISMaster = () => {
  const navigate = useNavigate();
  
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

  const notify = (message, severity = 'success') => setSnack({ open: true, message, severity });

  // Search Debounce
  useEffect(() => {
    const t = setTimeout(() => { setSearch(searchInput.trim()); setPage(0); }, 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`http://localhost:5009/api/material-issue-slip`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { page: page + 1, limit: rowsPerPage, search: search || undefined }
      });
      setData(res.data.data || []);
      setTotal(res.data.pagination?.total || 0);
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

  const th = 'py-3 px-4 text-left text-[0.7rem] font-semibold tracking-[0.5px] whitespace-nowrap';
  const td = 'py-2 px-4 text-[0.75rem]';

  return (
    <div className="p-5" style={{ fontFamily: PAGE_FONT }}>
      {/* Page Header */}
      <div className="mb-5">
        <h1 className="text-[1.25rem] font-bold text-[#151C26] mb-0.5">Material Issue Slips</h1>
        <p className="text-[0.75rem] text-[#4B5568]">Track materials issued to departments</p>
      </div>

      {/* Action Bar */}
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
          <button
            onClick={() => navigate('/inventorymanagement/mis/add')}
            className="h-9 px-4 rounded-md bg-[#063C3F] hover:bg-[#05292B] text-white text-[0.75rem] font-medium shadow-[0_1px_3px_0_rgba(0,0,0,0.1)] flex items-center gap-2 transition"
          >
            <Plus size={16} /> Create MIS
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="w-full rounded-lg overflow-hidden bg-white border border-[#E3E8EF] shadow-[0_1px_3px_0_rgba(0,0,0,0.05)]">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead className="bg-[#063C3F] text-white">
              <tr>
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
                  <td colSpan={6} className="py-12 text-center">
                    <CircularProgress size={32} sx={{ color: COLORS.primary }} />
                    <div className="text-[0.75rem] mt-2">Loading slips...</div>
                  </td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center">
                    <EmptyIcon sx={{ fontSize: 48, color: COLORS.tertiary }} />
                    <div className="text-[0.875rem] text-[#4B5568]">
                      {search ? 'No slips found' : 'No slips available'}
                    </div>
                  </td>
                </tr>
              ) : (
                data.map((item) => (
                  <tr key={item._id} className="border-b border-[#E3E8EF] hover:bg-[#F0FDF9]">
                    <td className={`${td} font-semibold text-[#063C3F]`}>{item.ref_no}</td>
                    <td className={td}>{new Date(item.issue_date).toLocaleDateString('en-GB')}</td>
                    <td className={td}>{item.rmp_ref_no || '-'}</td>
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
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* MUI Pagination */}
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

      {/* Action Menu (3-Dots) */}
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
        <MenuItem onClick={() => { navigate(`/inventorymanagement/mis/add?id=${menuItem._id}`); closeMenu(); }} sx={{ py: 1.5 }}>
          <ListItemIcon sx={{ color: COLORS.primary, minWidth: 36 }}><EditIcon fontSize="small" /></ListItemIcon>
          <ListItemText><Typography sx={{ fontSize: '0.75rem', fontWeight: 500, color: COLORS.text }}>Edit</Typography></ListItemText>
        </MenuItem>
      </Menu>

      {/* Print Modal (Same as before) */}
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
                    <p><span className="text-gray-500 inline-block w-20">RMP Ref:</span> {printEntry.rmp_ref_no || 'N/A'}</p>
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
                    {printEntry.items.map((item, idx) => (
                      <tr key={idx}>
                        <td className="border border-gray-800 p-2 text-center">{idx + 1}</td>
                        <td className="border border-gray-800 p-2 font-medium">{item.name}</td>
                        <td className="border border-gray-800 p-2">{item.code}</td>
                        <td className="border border-gray-800 p-2 text-right">{item.quantity}</td>
                        <td className="border border-gray-800 p-2 text-center">{item.unit}</td>
                      </tr>
                    ))}
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
    </div>
  );
};

export default MISMaster;