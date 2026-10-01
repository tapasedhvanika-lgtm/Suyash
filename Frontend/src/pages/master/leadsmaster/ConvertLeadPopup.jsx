// import React, { useState, useEffect } from 'react';
// import {
//   Dialog,
//   DialogTitle,
//   DialogContent,
//   DialogActions,
//   Button,
//   TextField,
//   Typography,
//   Box,
//   Stack,
//   Alert,
//   IconButton,
//   Autocomplete,
//   Tooltip,
//   InputAdornment
// } from '@mui/material';
// import { 
//   Close as CloseIcon, 
//   PersonAdd as PersonAddIcon,
//   CheckCircle as CheckCircleIcon,
//   Search as SearchIcon
// } from '@mui/icons-material';
// import axios from 'axios';
// import BASE_URL from '../../../config/Config';
// import { COLORS } from './constants';
// import AddCustomerModal from './AddCustomerModal'; // We'll create this separate component

// const ConvertLeadPopup = ({ open, onClose, lead, onConvert }) => {
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState('');
//   const [customers, setCustomers] = useState([]);
//   const [loadingCustomers, setLoadingCustomers] = useState(false);
//   const [selectedCustomer, setSelectedCustomer] = useState(null);
  
//   // State for Add Customer dialog
//   const [addCustomerOpen, setAddCustomerOpen] = useState(false);

//   // Fetch customers for dropdown
//   useEffect(() => {
//     if (open) {
//       fetchCustomers();
//     }
//   }, [open]);

//   const fetchCustomers = async () => {
//     try {
//       setLoadingCustomers(true);
//       const token = localStorage.getItem('token');
//       const response = await axios.get(`${BASE_URL}/api/customers`, {
//         headers: { 'Authorization': `Bearer ${token}` }
//       });
      
//       if (response.data.success) {
//         setCustomers(response.data.data || []);
//       }
//     } catch (err) {
//       console.error('Error fetching customers:', err);
//       setError('Failed to load customers');
//     } finally {
//       setLoadingCustomers(false);
//     }
//   };

//   // Handle customer added from modal
//   const handleCustomerAdded = (newCustomer) => {
//     setCustomers(prev => [...prev, newCustomer]);
//     // Auto-select the newly added customer
//     setSelectedCustomer(newCustomer);
//   };

//   const handleSubmit = async () => {
//     setError('');
    
//     if (!selectedCustomer) {
//       setError('Please select a customer');
//       return;
//     }
    
//     setLoading(true);
    
//     try {
//       const token = localStorage.getItem('token');
//       const response = await axios.post(
//         `${BASE_URL}/api/leads/${lead._id}/convert`,
//         {
//           existing_customer_id: selectedCustomer._id
//         },
//         { headers: { 'Authorization': `Bearer ${token}` } }
//       );
      
//       if (response.data.success) {
//         onConvert(response.data.data);
//         handleClose();
//       } else {
//         setError(response.data.message || 'Failed to convert lead');
//       }
//     } catch (err) {
//       console.error('Error converting lead:', err);
//       setError(err.response?.data?.message || 'Failed to convert lead');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleClose = () => {
//     setSelectedCustomer(null);
//     setError('');
//     onClose();
//   };

//   if (!lead) return null;

//   return (
//     <>
//       <Dialog
//         open={open}
//         onClose={handleClose}
//         maxWidth="md"
//         fullWidth
//         PaperProps={{
//           sx: {
//             borderRadius: 5,
//             boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05)',
//             border: `1px solid ${COLORS.border}`,
//             overflow: 'hidden',
//             maxHeight: '90vh'
//           }
//         }}
//       >
//         <DialogTitle sx={{
//           borderBottom: `1px solid ${COLORS.border}`,
//           py: 1.5,
//           px: 2.5,
//           mb: 2,
//           bgcolor: COLORS.background.white,
//           display: 'flex',
//           justifyContent: 'space-between',
//           alignItems: 'center'
//         }}>
//           <Typography sx={{ fontSize: '1.2rem', fontWeight: 700, color: COLORS.text.primary }}>
//             Convert Lead to Customer
//           </Typography>
//           <IconButton onClick={handleClose} size="small">
//             <CloseIcon fontSize="small" />
//           </IconButton>
//         </DialogTitle>

//         <DialogContent sx={{ p: 2.5, overflowY: 'auto' }}>
//           <Stack spacing={2.5}>
//             <Box>
//               <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
//                 <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color: COLORS.primary }}>
//                   Link to Customer
//                 </Typography>
//                 <Tooltip title="Add New Customer">
//                   <Button
//                     startIcon={<PersonAddIcon sx={{ fontSize: '0.9rem' }} />}
//                     onClick={() => setAddCustomerOpen(true)}
//                     sx={{
//                       height: 28,
//                       px: 1.5,
//                       borderRadius: 1.5,
//                       bgcolor: COLORS.primaryLight,
//                       color: COLORS.primary,
//                       fontSize: '0.7rem',
//                       fontWeight: 500,
//                       textTransform: 'none',
//                       '&:hover': {
//                         bgcolor: COLORS.primary,
//                         color: COLORS.text.light
//                       }
//                     }}
//                   >
//                     Add New Customer
//                   </Button>
//                 </Tooltip>
//               </Box>
              
//               <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//                 <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary, letterSpacing: '0.5px' }}>
//                   SELECT CUSTOMER <span style={{ color: '#EF4444' }}>*</span>
//                 </Typography>
//                 <Autocomplete
//                   fullWidth
//                   options={customers}
//                   getOptionLabel={(option) => `${option.customer_code} - ${option.customer_name}`}
//                   value={selectedCustomer}
//                   onChange={(event, newValue) => setSelectedCustomer(newValue)}
//                   loading={loadingCustomers}
//                   renderInput={(params) => (
//                     <TextField
//                       {...params}
//                       size="small"
//                       placeholder="Search customers..."
//                       sx={{
//                         '& .MuiOutlinedInput-root': {
//                           borderRadius: 1.5,
//                           fontSize: '0.75rem',
//                           '&:hover fieldset': { borderColor: COLORS.primary },
//                           '&.Mui-focused fieldset': { borderColor: COLORS.primary, borderWidth: 1 }
//                         },
//                         '& .MuiInputBase-input': {
//                           py: 1,
//                           px: 1.5,
//                           fontSize: '0.75rem'
//                         }
//                       }}
//                       InputProps={{
//                         ...params.InputProps,
//                         startAdornment: (
//                           <InputAdornment position="start">
//                             <SearchIcon sx={{ fontSize: '0.9rem', color: COLORS.text.tertiary }} />
//                           </InputAdornment>
//                         ),
//                       }}
//                     />
//                   )}
//                   renderOption={(props, option) => (
//                     <li {...props}>
//                       <Box>
//                         <Typography sx={{ fontSize: '0.75rem', fontWeight: 600 }}>{option.customer_name}</Typography>
//                         <Typography sx={{ fontSize: '0.65rem', color: COLORS.text.tertiary }}>
//                           Code: {option.customer_code} | Type: {option.customer_type}
//                         </Typography>
//                       </Box>
//                     </li>
//                   )}
//                 />
//               </Box>
//             </Box>

//             {error && (
//               <Alert 
//                 severity="error" 
//                 sx={{ 
//                   borderRadius: 1.5,
//                   '& .MuiAlert-icon': { fontSize: '1.25rem', alignItems: 'center' },
//                   fontSize: '0.75rem',
//                   py: 0.5
//                 }}
//               >
//                 {error}
//               </Alert>
//             )}
//           </Stack>
//         </DialogContent>

//         <DialogActions sx={{
//           px: 2.5,
//           py: 1.5,
//           borderTop: `1px solid ${COLORS.border}`,
//           bgcolor: COLORS.background.white,
//           display: 'flex',
//           justifyContent: 'flex-end',
//           gap: 1
//         }}>
//           <Button
//             onClick={handleClose}
//             disabled={loading}
//             sx={{
//               height: 32,
//               px: 2,
//               borderRadius: 1.5,
//               border: `1px solid ${COLORS.border}`,
//               color: COLORS.text.secondary,
//               fontSize: '0.7rem',
//               fontWeight: 500,
//               textTransform: 'none',
//               '&:hover': {
//                 borderColor: COLORS.primary,
//                 bgcolor: `${COLORS.primary}10`
//               }
//             }}
//           >
//             Cancel
//           </Button>
//           <Button
//             variant="contained"
//             onClick={handleSubmit}
//             disabled={loading}
//             startIcon={loading ? null : <CheckCircleIcon sx={{ fontSize: '1rem' }} />}
//             sx={{
//               height: 32,
//               px: 2,
//               borderRadius: 1.5,
//               bgcolor: COLORS.primary,
//               fontSize: '0.7rem',
//               fontWeight: 500,
//               textTransform: 'none',
//               '&:hover': {
//                 bgcolor: COLORS.primaryDark,
//               }
//             }}
//           >
//             {loading ? 'Converting...' : 'Convert to Customer'}
//           </Button>
//         </DialogActions>
//       </Dialog>

//       {/* Add Customer Modal - Separate Component */}
//       <AddCustomerModal
//         open={addCustomerOpen}
//         onClose={() => setAddCustomerOpen(false)}
//         onAdd={handleCustomerAdded}
//       />
//     </>
//   );
// };

// export default ConvertLeadPopup;


// import React, { useState, useEffect } from 'react';
// import {
//   Dialog,
//   DialogTitle,
//   DialogContent,
//   DialogActions,
//   Button,
//   TextField,
//   Typography,
//   Box,
//   Stack,
//   Alert,
//   IconButton,
//   Autocomplete,
//   Tooltip,
//   InputAdornment
// } from '@mui/material';
// import { 
//   Close as CloseIcon, 
//   PersonAdd as PersonAddIcon,
//   CheckCircle as CheckCircleIcon,
//   Search as SearchIcon
// } from '@mui/icons-material';
// import axios from 'axios';
// import BASE_URL from '../../../config/Config';
// import { COLORS } from './constants';

// const ConvertLeadPopup = ({ open, onClose, lead, onConvert }) => {
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState('');
//   const [leads, setLeads] = useState([]);
//   const [loadingLeads, setLoadingLeads] = useState(false);
//   const [selectedLead, setSelectedLead] = useState(null);
//   const [searchTerm, setSearchTerm] = useState('');

//   // Fetch leads when open and search term changes
//   useEffect(() => {
//     if (open) {
//       fetchLeads(searchTerm);
//     }
//   }, [open, searchTerm]);

//   const fetchLeads = async (search = '') => {
//     try {
//       setLoadingLeads(true);
//       const token = localStorage.getItem('token');
      
//       // Build query parameters
//       const params = new URLSearchParams({
//         status: 'Won', // Only fetch leads with "Won" status
//         is_converted: false // Only fetch non-converted leads
//       });
      
//       if (search && search.trim()) {
//         params.append('search', search.trim());
//       }

//       const response = await axios.get(`${BASE_URL}/api/leads?${params}`, {
//         headers: { 'Authorization': `Bearer ${token}` }
//       });
      
//       if (response.data.success) {
//         setLeads(response.data.data || []);
//       }
//     } catch (err) {
//       console.error('Error fetching leads:', err);
//       setError('Failed to load leads');
//     } finally {
//       setLoadingLeads(false);
//     }
//   };

//   const handleSubmit = async () => {
//     setError('');
    
//     if (!selectedLead) {
//       setError('Please select a lead');
//       return;
//     }
    
//     setLoading(true);
    
//     try {
//       const token = localStorage.getItem('token');
      
//       // Option 1: Send as separate fields
//       const requestData = {
//         customer_code: `CUST-${selectedLead.lead_id}`,
//         customer_name: selectedLead.company_name,
//         customer_type: selectedLead.customer_type || 'OEM',
//         contact_person: selectedLead.contact_name || '',
//         contact_number: selectedLead.contact_mobile || '',
//         email: selectedLead.email || '',
//         address: selectedLead.address || '',
//         gst_number: selectedLead.gst_number || '',
//         pan_number: selectedLead.pan_number || '',
//         lead_subject: selectedLead.subject || '',
//         lead_source: selectedLead.lead_source || '',
//         estimated_value: selectedLead.estimated_value || 0,
//         priority: selectedLead.priority || 'Medium'
//       };

//       console.log('Sending data to backend:', JSON.stringify(requestData, null, 2));

//       const response = await axios.post(
//         `${BASE_URL}/api/leads/${selectedLead._id}/convert`,
//         requestData,
//         { 
//           headers: { 
//             'Authorization': `Bearer ${token}`,
//             'Content-Type': 'application/json'
//           } 
//         }
//       );
      
//       if (response.data.success) {
//         onConvert(response.data.data);
//         handleClose();
//       } else {
//         setError(response.data.message || 'Failed to convert lead');
//       }
//     } catch (err) {
//       console.error('Error converting lead:', err);
//       console.error('Error response data:', err.response?.data);
//       console.error('Error response status:', err.response?.status);
      
//       // If first attempt fails, try alternative format
//       if (err.response?.status === 400 || err.response?.data?.message?.includes('customer_code')) {
//         try {
//           const token = localStorage.getItem('token');
          
//           // Option 2: Send as nested object with lead data
//           const alternativeData = {
//             leadId: selectedLead._id,
//             customerCode: `CUST-${selectedLead.lead_id}`,
//             customerName: selectedLead.company_name,
//             customerType: selectedLead.customer_type || 'OEM',
//             contactPerson: selectedLead.contact_name || '',
//             contactNumber: selectedLead.contact_mobile || '',
//             email: selectedLead.email || '',
//             address: selectedLead.address || '',
//             gstNumber: selectedLead.gst_number || '',
//             panNumber: selectedLead.pan_number || '',
//             leadSubject: selectedLead.subject || '',
//             leadSource: selectedLead.lead_source || '',
//             estimatedValue: selectedLead.estimated_value || 0,
//             priority: selectedLead.priority || 'Medium'
//           };

//           console.log('Trying alternative data format:', JSON.stringify(alternativeData, null, 2));

//           const retryResponse = await axios.post(
//             `${BASE_URL}/api/leads/${selectedLead._id}/convert`,
//             alternativeData,
//             { 
//               headers: { 
//                 'Authorization': `Bearer ${token}`,
//                 'Content-Type': 'application/json'
//               } 
//             }
//           );

//           if (retryResponse.data.success) {
//             onConvert(retryResponse.data.data);
//             handleClose();
//             return;
//           }
//         } catch (retryErr) {
//           console.error('Retry failed:', retryErr);
          
//           // Option 3: Try with just lead ID and let backend handle everything
//           try {
//             const token = localStorage.getItem('token');
//             const simpleData = {
//               lead_id: selectedLead._id,
//               customer_code: `CUST-${selectedLead.lead_id}`
//             };

//             console.log('Trying simple data format:', simpleData);

//             const finalResponse = await axios.post(
//               `${BASE_URL}/api/leads/${selectedLead._id}/convert`,
//               simpleData,
//               { 
//                 headers: { 
//                   'Authorization': `Bearer ${token}`,
//                   'Content-Type': 'application/json'
//                 } 
//               }
//             );

//             if (finalResponse.data.success) {
//               onConvert(finalResponse.data.data);
//               handleClose();
//               return;
//             }
//           } catch (finalErr) {
//             console.error('Final attempt failed:', finalErr);
//             setError(finalErr.response?.data?.message || 'Failed to convert lead');
//           }
//         }
//       } else {
//         setError(err.response?.data?.message || 'Failed to convert lead to customer');
//       }
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleClose = () => {
//     setSelectedLead(null);
//     setSearchTerm('');
//     setError('');
//     onClose();
//   };

//   if (!lead) return null;

//   return (
//     <Dialog
//       open={open}
//       onClose={handleClose}
//       maxWidth="md"
//       fullWidth
//       PaperProps={{
//         sx: {
//           borderRadius: 5,
//           boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05)',
//           border: `1px solid ${COLORS.border}`,
//           overflow: 'hidden',
//           maxHeight: '90vh'
//         }
//       }}
//     >
//       <DialogTitle sx={{
//         borderBottom: `1px solid ${COLORS.border}`,
//         py: 1.5,
//         px: 2.5,
//         mb: 2,
//         bgcolor: COLORS.background.white,
//         display: 'flex',
//         justifyContent: 'space-between',
//         alignItems: 'center'
//       }}>
//         <Typography sx={{ fontSize: '1.2rem', fontWeight: 700, color: COLORS.text.primary }}>
//           Convert Lead to Customer
//         </Typography>
//         <IconButton onClick={handleClose} size="small">
//           <CloseIcon fontSize="small" />
//         </IconButton>
//       </DialogTitle>

//       <DialogContent sx={{ p: 2.5, overflowY: 'auto' }}>
//         <Stack spacing={2.5}>
//           <Box>
//             <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
//               <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color: COLORS.primary }}>
//                 Link to Lead
//               </Typography>
//             </Box>
            
//             <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//               <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary, letterSpacing: '0.5px' }}>
//                 SELECT LEAD <span style={{ color: '#EF4444' }}>*</span>
//               </Typography>
//               <Autocomplete
//                 fullWidth
//                 options={leads}
//                 getOptionLabel={(option) => `${option.company_name} - ${option.lead_id}`}
//                 value={selectedLead}
//                 onChange={(event, newValue) => setSelectedLead(newValue)}
//                 loading={loadingLeads}
//                 onInputChange={(event, newInputValue) => {
//                   setSearchTerm(newInputValue);
//                 }}
//                 renderInput={(params) => (
//                   <TextField
//                     {...params}
//                     size="small"
//                     placeholder="Search leads by company, contact, subject, lead ID..."
//                     sx={{
//                       '& .MuiOutlinedInput-root': {
//                         borderRadius: 1.5,
//                         fontSize: '0.75rem',
//                         '&:hover fieldset': { borderColor: COLORS.primary },
//                         '&.Mui-focused fieldset': { borderColor: COLORS.primary, borderWidth: 1 }
//                       },
//                       '& .MuiInputBase-input': {
//                         py: 1,
//                         px: 1.5,
//                         fontSize: '0.75rem'
//                       }
//                     }}
//                     InputProps={{
//                       ...params.InputProps,
//                       startAdornment: (
//                         <InputAdornment position="start">
//                           <SearchIcon sx={{ fontSize: '0.9rem', color: COLORS.text.tertiary }} />
//                         </InputAdornment>
//                       ),
//                     }}
//                   />
//                 )}
//                 renderOption={(props, option) => (
//                   <li {...props}>
//                     <Box>
//                       <Typography sx={{ fontSize: '0.75rem', fontWeight: 600 }}>{option.company_name}</Typography>
//                       <Typography sx={{ fontSize: '0.65rem', color: COLORS.text.tertiary }}>
//                         Lead ID: {option.lead_id} | Contact: {option.contact_name || 'N/A'} | Status: Won
//                       </Typography>
//                     </Box>
//                   </li>
//                 )}
//                 noOptionsText={
//                   loadingLeads 
//                     ? 'Loading leads...' 
//                     : searchTerm 
//                       ? 'No leads found with "Won" status' 
//                       : 'No leads available with "Won" status'
//                 }
//               />
//             </Box>
//           </Box>

//           {selectedLead && (
//             <Box sx={{ 
//               p: 2, 
//               bgcolor: '#F8FAFC', 
//               borderRadius: 1.5, 
//               border: `1px solid ${COLORS.border}`,
//               mt: 1
//             }}>
//               <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: COLORS.primary, mb: 1 }}>
//                 Selected Lead Details
//               </Typography>
//               <Stack spacing={0.5}>
//                 <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
//                   <Typography sx={{ fontSize: '0.7rem', color: COLORS.text.secondary }}>Company:</Typography>
//                   <Typography sx={{ fontSize: '0.7rem', fontWeight: 500 }}>{selectedLead.company_name}</Typography>
//                 </Box>
//                 <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
//                   <Typography sx={{ fontSize: '0.7rem', color: COLORS.text.secondary }}>Lead ID:</Typography>
//                   <Typography sx={{ fontSize: '0.7rem', fontWeight: 500 }}>{selectedLead.lead_id}</Typography>
//                 </Box>
//                 <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
//                   <Typography sx={{ fontSize: '0.7rem', color: COLORS.text.secondary }}>Subject:</Typography>
//                   <Typography sx={{ fontSize: '0.7rem', fontWeight: 500 }}>{selectedLead.subject || 'N/A'}</Typography>
//                 </Box>
//                 {selectedLead.contact_name && (
//                   <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
//                     <Typography sx={{ fontSize: '0.7rem', color: COLORS.text.secondary }}>Contact:</Typography>
//                     <Typography sx={{ fontSize: '0.7rem', fontWeight: 500 }}>
//                       {selectedLead.contact_name}{selectedLead.contact_mobile ? ` (${selectedLead.contact_mobile})` : ''}
//                     </Typography>
//                   </Box>
//                 )}
//                 <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
//                   <Typography sx={{ fontSize: '0.7rem', color: COLORS.text.secondary }}>Status:</Typography>
//                   <Typography sx={{ fontSize: '0.7rem', fontWeight: 500, color: '#166534' }}>
//                     {selectedLead.status}
//                   </Typography>
//                 </Box>
//               </Stack>
//             </Box>
//           )}

//           {error && (
//             <Alert 
//               severity="error" 
//               sx={{ 
//                 borderRadius: 1.5,
//                 '& .MuiAlert-icon': { fontSize: '1.25rem', alignItems: 'center' },
//                 fontSize: '0.75rem',
//                 py: 0.5
//               }}
//             >
//               {error}
//             </Alert>
//           )}
//         </Stack>
//       </DialogContent>

//       <DialogActions sx={{
//         px: 2.5,
//         py: 1.5,
//         borderTop: `1px solid ${COLORS.border}`,
//         bgcolor: COLORS.background.white,
//         display: 'flex',
//         justifyContent: 'flex-end',
//         gap: 1
//       }}>
//         <Button
//           onClick={handleClose}
//           disabled={loading}
//           sx={{
//             height: 32,
//             px: 2,
//             borderRadius: 1.5,
//             border: `1px solid ${COLORS.border}`,
//             color: COLORS.text.secondary,
//             fontSize: '0.7rem',
//             fontWeight: 500,
//             textTransform: 'none',
//             '&:hover': {
//               borderColor: COLORS.primary,
//               bgcolor: `${COLORS.primary}10`
//             }
//           }}
//         >
//           Cancel
//         </Button>
//         <Button
//           variant="contained"
//           onClick={handleSubmit}
//           disabled={loading}
//           startIcon={loading ? null : <CheckCircleIcon sx={{ fontSize: '1rem' }} />}
//           sx={{
//             height: 32,
//             px: 2,
//             borderRadius: 1.5,
//             bgcolor: COLORS.primary,
//             fontSize: '0.7rem',
//             fontWeight: 500,
//             textTransform: 'none',
//             '&:hover': {
//               bgcolor: COLORS.primaryDark,
//             }
//           }}
//         >
//           {loading ? 'Converting...' : 'Convert to Customer'}
//         </Button>
//       </DialogActions>
//     </Dialog>
//   );
// };

// export default ConvertLeadPopup;



import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  Box,
  Stack,
  Alert,
  IconButton,
  Autocomplete,
  Tooltip,
  InputAdornment
} from '@mui/material';
import { 
  Close as CloseIcon, 
  PersonAdd as PersonAddIcon,
  CheckCircle as CheckCircleIcon,
  Search as SearchIcon
} from '@mui/icons-material';
import axios from 'axios';
import BASE_URL from '../../../config/Config';
import { COLORS } from './constants';

const ConvertLeadPopup = ({ open, onClose, lead, onConvert }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [leads, setLeads] = useState([]);
  const [loadingLeads, setLoadingLeads] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch leads when open and search term changes
  useEffect(() => {
    if (open) {
      fetchLeads(searchTerm);
    }
  }, [open, searchTerm]);

  const fetchLeads = async (search = '') => {
    try {
      setLoadingLeads(true);
      const token = localStorage.getItem('token');
      
      // Build query parameters
      const params = new URLSearchParams({
        status: 'Won', // Only fetch leads with "Won" status
        is_converted: false // Only fetch non-converted leads
      });
      
      if (search && search.trim()) {
        params.append('search', search.trim());
      }

      const response = await axios.get(`${BASE_URL}/api/leads?${params}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.data.success) {
        setLeads(response.data.data || []);
      }
    } catch (err) {
      console.error('Error fetching leads:', err);
      setError('Failed to load leads');
    } finally {
      setLoadingLeads(false);
    }
  };

  const handleSubmit = async () => {
    setError('');
    
    if (!selectedLead) {
      setError('Please select a lead');
      return;
    }
    
    setLoading(true);
    
    try {
      const token = localStorage.getItem('token');
      
      // Option 1: Send as separate fields
     const requestData = {
  new_customer: {
    customer_code: `CUST-${selectedLead.lead_id}-${Date.now().toString().slice(-4)}`,
    gstin: selectedLead.gst_number || null,
    pan: selectedLead.pan_number || '',
    customer_type: selectedLead.customer_type || 'OEM',
    billing_address: {
      line1: selectedLead.address || 'N/A',
      city: selectedLead.city || 'N/A',
      state: selectedLead.state || 'N/A',
      state_code: selectedLead.state_code || 27,
      pincode: selectedLead.pincode || '000000',
    },
    contacts: [{
      name: selectedLead.contact_name || '',
      mobile: selectedLead.contact_mobile || '',
      email: selectedLead.email || '',
      is_primary: true,
    }],
  },
};
      console.log('Sending data to backend:', JSON.stringify(requestData, null, 2));

      const response = await axios.post(
        `${BASE_URL}/api/leads/${selectedLead._id}/convert`,
        requestData,
        { 
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          } 
        }
      );
      
      if (response.data.success) {
        onConvert(response.data.data);
        handleClose();
      } else {
        setError(response.data.message || 'Failed to convert lead');
      }
    } catch (err) {
      console.error('Error converting lead:', err);
      console.error('Error response data:', err.response?.data);
      if (err.response?.status === 409) {
        setError(`Conflict: ${err.response.data.message}. A customer with this code or GSTIN already exists.`);
      } else {
        setError(err.response?.data?.message || 'Failed to convert lead to customer');
      }
    } finally {
      setLoading(false);
    }
  }
  const handleClose = () => {
    setSelectedLead(null);
    setSearchTerm('');
    setError('');
    onClose();
  };

  if (!lead) return null;

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 5,
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05)',
          border: `1px solid ${COLORS.border}`,
          overflow: 'hidden',
          maxHeight: '90vh'
        }
      }}
    >
      <DialogTitle sx={{
        borderBottom: `1px solid ${COLORS.border}`,
        py: 1.5,
        px: 2.5,
        mb: 2,
        bgcolor: COLORS.background.white,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <Typography sx={{ fontSize: '1.2rem', fontWeight: 700, color: COLORS.text.primary }}>
          Convert Lead to Customer
        </Typography>
        <IconButton onClick={handleClose} size="small">
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 2.5, overflowY: 'auto' }}>
        <Stack spacing={2.5}>
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
              <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color: COLORS.primary }}>
                Link to Lead
              </Typography>
            </Box>
            
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
              <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.text.secondary, letterSpacing: '0.5px' }}>
                SELECT LEAD <span style={{ color: '#EF4444' }}>*</span>
              </Typography>
              <Autocomplete
                fullWidth
                options={leads}
                getOptionLabel={(option) => `${option.company_name} - ${option.lead_id}`}
                value={selectedLead}
                onChange={(event, newValue) => setSelectedLead(newValue)}
                loading={loadingLeads}
                onInputChange={(event, newInputValue) => {
                  setSearchTerm(newInputValue);
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    size="small"
                    placeholder="Search leads by company, contact, subject, lead ID..."
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 1.5,
                        fontSize: '0.75rem',
                        '&:hover fieldset': { borderColor: COLORS.primary },
                        '&.Mui-focused fieldset': { borderColor: COLORS.primary, borderWidth: 1 }
                      },
                      '& .MuiInputBase-input': {
                        py: 1,
                        px: 1.5,
                        fontSize: '0.75rem'
                      }
                    }}
                    InputProps={{
                      ...params.InputProps,
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon sx={{ fontSize: '0.9rem', color: COLORS.text.tertiary }} />
                        </InputAdornment>
                      ),
                    }}
                  />
                )}
                renderOption={(props, option) => (
                  <li {...props}>
                    <Box>
                      <Typography sx={{ fontSize: '0.75rem', fontWeight: 600 }}>{option.company_name}</Typography>
                      <Typography sx={{ fontSize: '0.65rem', color: COLORS.text.tertiary }}>
                        Lead ID: {option.lead_id} | Contact: {option.contact_name || 'N/A'} | Status: Won
                      </Typography>
                    </Box>
                  </li>
                )}
                noOptionsText={
                  loadingLeads 
                    ? 'Loading leads...' 
                    : searchTerm 
                      ? 'No leads found with "Won" status' 
                      : 'No leads available with "Won" status'
                }
              />
            </Box>
          </Box>

          {selectedLead && (
            <Box sx={{ 
              p: 2, 
              bgcolor: '#F8FAFC', 
              borderRadius: 1.5, 
              border: `1px solid ${COLORS.border}`,
              mt: 1
            }}>
              <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: COLORS.primary, mb: 1 }}>
                Selected Lead Details
              </Typography>
              <Stack spacing={0.5}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography sx={{ fontSize: '0.7rem', color: COLORS.text.secondary }}>Company:</Typography>
                  <Typography sx={{ fontSize: '0.7rem', fontWeight: 500 }}>{selectedLead.company_name}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography sx={{ fontSize: '0.7rem', color: COLORS.text.secondary }}>Lead ID:</Typography>
                  <Typography sx={{ fontSize: '0.7rem', fontWeight: 500 }}>{selectedLead.lead_id}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography sx={{ fontSize: '0.7rem', color: COLORS.text.secondary }}>Subject:</Typography>
                  <Typography sx={{ fontSize: '0.7rem', fontWeight: 500 }}>{selectedLead.subject || 'N/A'}</Typography>
                </Box>
                {selectedLead.contact_name && (
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography sx={{ fontSize: '0.7rem', color: COLORS.text.secondary }}>Contact:</Typography>
                    <Typography sx={{ fontSize: '0.7rem', fontWeight: 500 }}>
                      {selectedLead.contact_name}{selectedLead.contact_mobile ? ` (${selectedLead.contact_mobile})` : ''}
                    </Typography>
                  </Box>
                )}
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography sx={{ fontSize: '0.7rem', color: COLORS.text.secondary }}>Status:</Typography>
                  <Typography sx={{ fontSize: '0.7rem', fontWeight: 500, color: '#166534' }}>
                    {selectedLead.status}
                  </Typography>
                </Box>
              </Stack>
            </Box>
          )}

          {error && (
            <Alert 
              severity="error" 
              sx={{ 
                borderRadius: 1.5,
                '& .MuiAlert-icon': { fontSize: '1.25rem', alignItems: 'center' },
                fontSize: '0.75rem',
                py: 0.5
              }}
            >
              {error}
            </Alert>
          )}
        </Stack>
      </DialogContent>

      <DialogActions sx={{
        px: 2.5,
        py: 1.5,
        borderTop: `1px solid ${COLORS.border}`,
        bgcolor: COLORS.background.white,
        display: 'flex',
        justifyContent: 'flex-end',
        gap: 1
      }}>
        <Button
          onClick={handleClose}
          disabled={loading}
          sx={{
            height: 32,
            px: 2,
            borderRadius: 1.5,
            border: `1px solid ${COLORS.border}`,
            color: COLORS.text.secondary,
            fontSize: '0.7rem',
            fontWeight: 500,
            textTransform: 'none',
            '&:hover': {
              borderColor: COLORS.primary,
              bgcolor: `${COLORS.primary}10`
            }
          }}
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={loading}
          startIcon={loading ? null : <CheckCircleIcon sx={{ fontSize: '1rem' }} />}
          sx={{
            height: 32,
            px: 2,
            borderRadius: 1.5,
            bgcolor: COLORS.primary,
            fontSize: '0.7rem',
            fontWeight: 500,
            textTransform: 'none',
            '&:hover': {
              bgcolor: COLORS.primaryDark,
            }
          }}
        >
          {loading ? 'Converting...' : 'Convert to Customer'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ConvertLeadPopup;