// import React, { useState, useEffect, useRef } from 'react';
// import { useNavigate } from 'react-router-dom';
// import axios from 'axios';
// import { ArrowLeft, Save, Search, ChevronDown, X } from 'lucide-react';
// import BASE_URL from '../../../config/Config'; 

// const AddMIS = () => {
//   const navigate = useNavigate();
  
//   const [loading, setLoading] = useState(false);
//   const [rmpList, setRmpList] = useState([]); 
//   const [employeesList, setEmployeesList] = useState([]); 
//   const [departmentsList, setDepartmentsList] = useState([]);
  
//   // Dropdown States for RMP
//   const [isRmpDropdownOpen, setIsRmpDropdownOpen] = useState(false);
//   const [rmpSearchTerm, setRmpSearchTerm] = useState('');
//   const rmpDropdownRef = useRef(null);

//   // Dropdown States for Employees
//   const [isEmpDropdownOpen, setIsEmpDropdownOpen] = useState(false);
//   const [empSearchTerm, setEmpSearchTerm] = useState('');
//   const empDropdownRef = useRef(null);

//   // 👇 Dropdown States for Departments 👇
//   const [isDeptDropdownOpen, setIsDeptDropdownOpen] = useState(false);
//   const [deptSearchTerm, setDeptSearchTerm] = useState('');
//   const deptDropdownRef = useRef(null);

//   const [formData, setFormData] = useState({
//     issue_date: new Date().toISOString().split('T')[0],
//     department: '',
//     issued_to: '',
//     rmp_id: '',
//     rmp_ref_no: '',
//     items: [{ name: '', code: '', quantity: '', unit: 'Kg' }]
//   });

//   useEffect(() => {
//     fetchRMP();
//     fetchEmployees();
//     fetchDepartments(); 

//     const handleClickOutside = (event) => {
//       if (rmpDropdownRef.current && !rmpDropdownRef.current.contains(event.target)) {
//         setIsRmpDropdownOpen(false);
//       }
//       if (empDropdownRef.current && !empDropdownRef.current.contains(event.target)) {
//         setIsEmpDropdownOpen(false);
//       }
//       if (deptDropdownRef.current && !deptDropdownRef.current.contains(event.target)) {
//         setIsDeptDropdownOpen(false);
//       }
//     };
//     document.addEventListener('mousedown', handleClickOutside);
//     return () => document.removeEventListener('mousedown', handleClickOutside);
//   }, []);

//   const fetchRMP = async () => {
//     try {
//       const token = localStorage.getItem('token');
//       // 👇 BASE_URL lagaya
//       const res = await axios.get(`${BASE_URL}/api/rm-purchase?limit=100`, {
//         headers: { Authorization: `Bearer ${token}` }
//       });
//       setRmpList(res.data.data);
//     } catch (error) {
//       console.log("Error fetching RMP", error);
//     }
//   };

//   const fetchEmployees = async () => {
//     try {
//       const token = localStorage.getItem('token');
//       // 👇 BASE_URL lagaya
//       const res = await axios.get(`${BASE_URL}/api/employees`, {
//         headers: { Authorization: `Bearer ${token}` }
//       });
//       setEmployeesList(res.data.data || res.data); 
//     } catch (error) {
//       console.log("Error fetching employees", error);
//     }
//   };

//   const fetchDepartments = async () => {
//     try {
//       const token = localStorage.getItem('token');
//       // 👇 BASE_URL lagaya
//       const res = await axios.get(`${BASE_URL}/api/departments`, {
//         headers: { Authorization: `Bearer ${token}` }
//       });
//       setDepartmentsList(res.data.data || res.data); 
//     } catch (error) {
//       console.log("Error fetching departments", error);
//     }
//   };

//   const handleChange = (e) => {
//     setFormData({ ...formData, [e.target.name]: e.target.value });
//   };

//   const handleSelectRmp = (selectedRmp) => {
//     setFormData({
//       ...formData,
//       rmp_id: selectedRmp._id,
//       rmp_ref_no: selectedRmp.ref_no,
//       issue_date: new Date(selectedRmp.purchase_date).toISOString().split('T')[0],
//       items: [{
//         rm_id: selectedRmp._id,
//         name: selectedRmp.name,
//         code: selectedRmp.code,
//         quantity: selectedRmp.quantity, 
//         unit: selectedRmp.unit
//       }]
//     });
//     setIsRmpDropdownOpen(false);
//     setRmpSearchTerm('');
//   };

//   const handleItemChange = (index, field, value) => {
//     const newItems = [...formData.items];
//     newItems[index][field] = value;
//     setFormData({ ...formData, items: newItems });
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     try {
//       const token = localStorage.getItem('token');
//       const config = { headers: { Authorization: `Bearer ${token}` } };
//       // 👇 BASE_URL lagaya
//       await axios.post(`${BASE_URL}/api/material-issue-slip`, formData, config);
//       navigate('/inventorymanagement/mis'); 
//     } catch (error) {
//       alert(error.response?.data?.message || "Kuch galat ho gaya");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const filteredRmp = rmpList.filter(rmp => 
//     rmp.ref_no?.toLowerCase().includes(rmpSearchTerm.toLowerCase()) || 
//     rmp.name?.toLowerCase().includes(rmpSearchTerm.toLowerCase())
//   );

//   const filteredEmployees = employeesList.filter(emp => {
//     const empName = emp.FirstName ? `${emp.FirstName} ${emp.LastName || ''}`.trim() : (emp.name || emp.EmployeeName || '');
//     const empId = emp.EmployeeID || '';
//     return empName.toLowerCase().includes(empSearchTerm.toLowerCase()) || 
//            empId.toLowerCase().includes(empSearchTerm.toLowerCase());
//   });

//   const filteredDepartments = departmentsList.filter(dept => {
//     const deptName = dept.DepartmentName || dept.department_name || dept.name || '';
//     return deptName.toLowerCase().includes(deptSearchTerm.toLowerCase());
//   });

//   const labelClass = "block text-[11px] font-bold text-gray-500 uppercase tracking-wide mb-1.5";
//   const inputClass = "w-full h-10 px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#0f4a4a] focus:border-[#0f4a4a] text-sm text-gray-800 transition-colors bg-white";

//   return (
//     <div className="flex justify-center p-6 md:p-8 bg-[#F8F9FA] min-h-screen font-sans">
      
//       <div className="w-full max-w-5xl bg-white rounded-xl shadow-[0_2px_10px_-3px_rgba(0,0,0,0.1)] border border-gray-200 overflow-visible">
        
//         {/* Header */}
//         <div className="px-8 py-5 border-b border-gray-200 bg-gray-50 rounded-t-xl">
//           <h1 className="text-xl font-bold text-gray-800">Create Material Issue Slip</h1>
//           <p className="text-sm text-gray-500 mt-1">Issue raw material to a department and generate a printable slip.</p>
//         </div>

//         <form onSubmit={handleSubmit} className="p-8 space-y-8">
          
//           {/* Section 1: Purchase Reference */}
//           <div>
//             <h3 className="text-sm font-bold text-gray-800 mb-4 border-b pb-2">Purchase Reference</h3>
//             <div className="relative" ref={rmpDropdownRef}>
//               <label className={labelClass}>Select Purchase Ref (RMP) <span className="text-red-500">*</span></label>
//               <div 
//                 onClick={() => setIsRmpDropdownOpen(!isRmpDropdownOpen)}
//                 className="w-full h-10 px-3 border border-gray-300 rounded-md bg-white flex items-center justify-between cursor-pointer hover:border-[#0f4a4a] transition"
//               >
//                 <span className={`text-sm ${formData.rmp_ref_no ? 'text-gray-800 font-semibold' : 'text-gray-400'}`}>
//                   {formData.rmp_ref_no ? `${formData.rmp_ref_no} - ${formData.items[0]?.name}` : '-- Search or Select RMP --'}
//                 </span>
//                 <ChevronDown size={16} className="text-gray-500" />
//               </div>

//               {isRmpDropdownOpen && (
//                 <div className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-xl max-h-64 overflow-hidden flex flex-col">
//                   <div className="p-2 border-b border-gray-100 sticky top-0 bg-white">
//                     <div className="relative">
//                       <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
//                       <input
//                         type="text"
//                         placeholder="Search RMP Ref or Material Name..."
//                         value={rmpSearchTerm}
//                         onChange={(e) => setRmpSearchTerm(e.target.value)}
//                         className="w-full h-8 pl-8 pr-8 text-sm border border-gray-200 rounded bg-gray-50 focus:outline-none focus:ring-1 focus:ring-[#0f4a4a]"
//                         onClick={(e) => e.stopPropagation()}
//                       />
//                       {rmpSearchTerm && (
//                         <button type="button" onClick={() => setRmpSearchTerm('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400">
//                           <X size={14} />
//                         </button>
//                       )}
//                     </div>
//                   </div>
//                   <div className="overflow-y-auto flex-1">
//                     {filteredRmp.length === 0 ? (
//                       <div className="p-4 text-center text-sm text-gray-500">No RMP found</div>
//                     ) : (
//                       filteredRmp.map(rmp => (
//                         <div key={rmp._id} onClick={() => handleSelectRmp(rmp)} className="px-4 py-2 hover:bg-[#F0FDF9] cursor-pointer border-b border-gray-50 last:border-0">
//                           <div className="text-sm font-semibold text-gray-800">{rmp.ref_no} - {rmp.name}</div>
//                           <div className="text-xs text-gray-500">Qty: {rmp.quantity} {rmp.unit} | Date: {new Date(rmp.purchase_date).toLocaleDateString()}</div>
//                         </div>
//                       ))
//                     )}
//                   </div>
//                 </div>
//               )}
//               <p className="text-xs text-gray-500 mt-2">Selecting an RMP will automatically fill the material details below.</p>
//             </div>
//           </div>

//           {/* Section 2: Issue Details */}
//           <div>
//             <h3 className="text-sm font-bold text-gray-800 mb-4 border-b pb-2">Issue Details</h3>
//             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//               <div>
//                 <label className={labelClass}>Issue Date <span className="text-red-500">*</span></label>
//                 <input type="date" name="issue_date" required value={formData.issue_date} onChange={handleChange} className={inputClass} />
//               </div>
              
//               {/* 👇 NAYA DEPARTMENT DROPDOWN 👇 */}
//               <div className="relative" ref={deptDropdownRef}>
//                 <label className={labelClass}>Department <span className="text-red-500">*</span></label>
//                 <div 
//                   onClick={() => setIsDeptDropdownOpen(!isDeptDropdownOpen)}
//                   className="w-full h-10 px-3 border border-gray-300 rounded-md bg-white flex items-center justify-between cursor-pointer hover:border-[#0f4a4a] transition"
//                 >
//                   <span className={`text-sm ${formData.department ? 'text-gray-800 font-semibold' : 'text-gray-400'}`}>
//                     {formData.department || '-- Select Department --'}
//                   </span>
//                   <ChevronDown size={16} className="text-gray-500" />
//                 </div>

//                 {isDeptDropdownOpen && (
//                   <div className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-xl max-h-64 overflow-hidden flex flex-col">
//                     <div className="p-2 border-b border-gray-100 sticky top-0 bg-white">
//                       <div className="relative">
//                         <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
//                         <input
//                           type="text"
//                           placeholder="Search Department..."
//                           value={deptSearchTerm}
//                           onChange={(e) => setDeptSearchTerm(e.target.value)}
//                           className="w-full h-8 pl-8 pr-8 text-sm border border-gray-200 rounded bg-gray-50 focus:outline-none focus:ring-1 focus:ring-[#0f4a4a]"
//                           onClick={(e) => e.stopPropagation()}
//                         />
//                         {deptSearchTerm && (
//                           <button type="button" onClick={() => setDeptSearchTerm('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400">
//                             <X size={14} />
//                           </button>
//                         )}
//                       </div>
//                     </div>
//                     <div className="overflow-y-auto flex-1">
//                       {filteredDepartments.length === 0 ? (
//                         <div className="p-4 text-center text-sm text-gray-500">No departments found</div>
//                       ) : (
//                         filteredDepartments.map(dept => {
//                            const deptName = dept.DepartmentName || dept.department_name || dept.name || 'Unknown';
//                            return (
//                             <div 
//                               key={dept._id} 
//                               onClick={() => {
//                                 setFormData({ ...formData, department: deptName });
//                                 setIsDeptDropdownOpen(false);
//                                 setDeptSearchTerm('');
//                               }} 
//                               className="px-4 py-2 hover:bg-[#F0FDF9] cursor-pointer border-b border-gray-50 last:border-0"
//                             >
//                               <div className="text-sm font-semibold text-gray-800">{deptName}</div>
//                             </div>
//                           )
//                         })
//                       )}
//                     </div>
//                   </div>
//                 )}
//               </div>
//               {/* 👆 DEPARTMENT DROPDOWN END 👆 */}

//               {/* 👇 EMPLOYEE DROPDOWN 👇 */}
//               <div className="relative" ref={empDropdownRef}>
//                 <label className={labelClass}>Issued To <span className="text-red-500">*</span></label>
//                 <div 
//                   onClick={() => setIsEmpDropdownOpen(!isEmpDropdownOpen)}
//                   className="w-full h-10 px-3 border border-gray-300 rounded-md bg-white flex items-center justify-between cursor-pointer hover:border-[#0f4a4a] transition"
//                 >
//                   <span className={`text-sm ${formData.issued_to ? 'text-gray-800 font-semibold' : 'text-gray-400'}`}>
//                     {formData.issued_to || '-- Select Employee --'}
//                   </span>
//                   <ChevronDown size={16} className="text-gray-500" />
//                 </div>

//                 {isEmpDropdownOpen && (
//                   <div className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-xl max-h-64 overflow-hidden flex flex-col">
//                     <div className="p-2 border-b border-gray-100 sticky top-0 bg-white">
//                       <div className="relative">
//                         <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
//                         <input
//                           type="text"
//                           placeholder="Search Employee..."
//                           value={empSearchTerm}
//                           onChange={(e) => setEmpSearchTerm(e.target.value)}
//                           className="w-full h-8 pl-8 pr-8 text-sm border border-gray-200 rounded bg-gray-50 focus:outline-none focus:ring-1 focus:ring-[#0f4a4a]"
//                           onClick={(e) => e.stopPropagation()}
//                         />
//                         {empSearchTerm && (
//                           <button type="button" onClick={() => setEmpSearchTerm('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400">
//                             <X size={14} />
//                           </button>
//                         )}
//                       </div>
//                     </div>
//                     <div className="overflow-y-auto flex-1">
//                       {filteredEmployees.length === 0 ? (
//                         <div className="p-4 text-center text-sm text-gray-500">No employees found</div>
//                       ) : (
//                         filteredEmployees.map(emp => {
//                            const empName = emp.FirstName ? `${emp.FirstName} ${emp.LastName || ''}`.trim() : (emp.name || emp.EmployeeName || 'Unknown');
//                            return (
//                             <div 
//                               key={emp._id} 
//                               onClick={() => {
//                                 setFormData({ ...formData, issued_to: empName });
//                                 setIsEmpDropdownOpen(false);
//                                 setEmpSearchTerm('');
//                               }} 
//                               className="px-4 py-2 hover:bg-[#F0FDF9] cursor-pointer border-b border-gray-50 last:border-0"
//                             >
//                               <div className="text-sm font-semibold text-gray-800">{empName}</div>
//                               <div className="text-xs text-gray-500">ID: {emp.EmployeeID || emp._id}</div>
//                             </div>
//                           )
//                         })
//                       )}
//                     </div>
//                   </div>
//                 )}
//               </div>
//               {/* 👆 EMPLOYEE DROPDOWN END 👆 */}
              
//             </div>
//           </div>

//           {/* Section 3: Issued Items Table */}
//           <div>
//             <h3 className="text-sm font-bold text-gray-800 mb-4 border-b pb-2">Issued Items</h3>
//             <div className="border border-gray-200 rounded-lg overflow-hidden bg-gray-50 p-2">
//               <table className="w-full text-left border-collapse">
//                 <thead className="bg-[#F8F9FA] text-[11px] font-bold text-gray-600 uppercase tracking-wider">
//                   <tr>
//                     <th className="px-3 py-2">RM Name</th>
//                     <th className="px-3 py-2 w-40">Code</th>
//                     <th className="px-3 py-2 w-28">Qty</th>
//                     <th className="px-3 py-2 w-28">Unit</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {formData.items.map((item, index) => (
//                     <tr key={index}>
//                       <td className="p-2">
//                         <input type="text" required value={item.name} onChange={(e) => handleItemChange(index, 'name', e.target.value)} placeholder="Auto-filled" className={inputClass} />
//                       </td>
//                       <td className="p-2">
//                         <input type="text" required value={item.code} onChange={(e) => handleItemChange(index, 'code', e.target.value)} placeholder="Auto-filled" className={inputClass} />
//                       </td>
//                       <td className="p-2">
//                         <input type="number" required min="0.01" step="any" value={item.quantity} onChange={(e) => handleItemChange(index, 'quantity', e.target.value)} placeholder="0.00" className={inputClass} />
//                       </td>
//                       <td className="p-2">
//                         <select value={item.unit} onChange={(e) => handleItemChange(index, 'unit', e.target.value)} className={`${inputClass} cursor-pointer`}>
//                           <option value="Kg">Kg</option>
//                           <option value="Nos">Nos</option>
//                           <option value="Meter">Meter</option>
//                           <option value="Piece">Piece</option>
//                         </select>
//                       </td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>
//           </div>

//           {/* Footer */}
//           <div className="flex justify-between items-center pt-6 border-t border-gray-200 mt-8">
//             <button type="button" onClick={() => navigate(-1)} className="px-5 py-2.5 text-sm font-semibold text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition flex items-center gap-2">
//               <ArrowLeft size={16} /> Back
//             </button>
//             <div className="flex gap-3">
//               <button type="button" onClick={() => navigate(-1)} className="px-6 py-2.5 text-sm font-bold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition">
//                 Cancel
//               </button>
//               <button type="submit" disabled={loading} className="px-6 py-2.5 text-sm font-bold text-white bg-[#0f4a4a] hover:bg-[#0a3636] rounded-lg shadow-sm flex items-center gap-2 transition disabled:opacity-50">
//                 <Save size={18} /> {loading ? 'Saving...' : 'Save & Generate Slip'}
//               </button>
//             </div>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// };

// // export default AddMIS;
// import React, { useState, useEffect, useRef } from 'react';
// import { useNavigate } from 'react-router-dom';
// import axios from 'axios';
// import { ArrowLeft, Save, Search, ChevronDown, X } from 'lucide-react';
// import BASE_URL from '../../../config/Config'; 

// const AddMIS = () => {
//   const navigate = useNavigate();
  
//   const [loading, setLoading] = useState(false);
//   const [rmpList, setRmpList] = useState([]); 
//   const [employeesList, setEmployeesList] = useState([]); 
//   const [departmentsList, setDepartmentsList] = useState([]);
  
//   // Dropdown States
//   const [isRmpDropdownOpen, setIsRmpDropdownOpen] = useState(false);
//   const [rmpSearchTerm, setRmpSearchTerm] = useState('');
//   const rmpDropdownRef = useRef(null);

//   const [isEmpDropdownOpen, setIsEmpDropdownOpen] = useState(false);
//   const [empSearchTerm, setEmpSearchTerm] = useState('');
//   const empDropdownRef = useRef(null);

//   const [isDeptDropdownOpen, setIsDeptDropdownOpen] = useState(false);
//   const [deptSearchTerm, setDeptSearchTerm] = useState('');
//   const deptDropdownRef = useRef(null);

//   const [formData, setFormData] = useState({
//     issue_date: new Date().toISOString().split('T')[0],
//     department: '',
//     issued_to: '',
//     rmp_id: '',
//     rmp_ref_no: '',
//     items: [{ name: '', code: '', quantity: '', unit: 'Kg' }]
//   });

//   useEffect(() => {
//     fetchRMP();
//     fetchEmployees();
//     fetchDepartments(); 

//     const handleClickOutside = (event) => {
//       if (rmpDropdownRef.current && !rmpDropdownRef.current.contains(event.target)) setIsRmpDropdownOpen(false);
//       if (empDropdownRef.current && !empDropdownRef.current.contains(event.target)) setIsEmpDropdownOpen(false);
//       if (deptDropdownRef.current && !deptDropdownRef.current.contains(event.target)) setIsDeptDropdownOpen(false);
//     };
//     document.addEventListener('mousedown', handleClickOutside);
//     return () => document.removeEventListener('mousedown', handleClickOutside);
//   }, []);

//   const fetchRMP = async () => {
//     try {
//       const token = localStorage.getItem('token');
//       const res = await axios.get(`${BASE_URL}/api/rm-purchase?limit=100`, {
//         headers: { Authorization: `Bearer ${token}` }
//       });
      
      
//       const availableRmp = (res.data.data || []).filter(p => {
//         const qty = Number(p.quantity || 0);
//         const used = Number(p.used_qty || 0);
//         let rem = p.remaining_qty;

//         if ((rem === undefined || rem === null) || (rem === 0 && used === 0)) {
//           rem = qty;
//         }
//         return rem > 0;
//       });
      
//       setRmpList(availableRmp);
//     } catch (error) {
//       console.log("Error fetching RMP", error);
//     }
//   };

//   const fetchEmployees = async () => {
//     try {
//       const token = localStorage.getItem('token');
//       const res = await axios.get(`${BASE_URL}/api/employees`, { headers: { Authorization: `Bearer ${token}` } });
//       setEmployeesList(res.data.data || res.data); 
//     } catch (error) { console.log("Error fetching employees", error); }
//   };

//   const fetchDepartments = async () => {
//     try {
//       const token = localStorage.getItem('token');
//       const res = await axios.get(`${BASE_URL}/api/departments`, { headers: { Authorization: `Bearer ${token}` } });
//       setDepartmentsList(res.data.data || res.data); 
//     } catch (error) { console.log("Error fetching departments", error); }
//   };

//   const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

//   const handleSelectRmp = (selectedRmp) => {
//     const availableQty = selectedRmp.remaining_qty || selectedRmp.quantity;
//     setFormData({
//       ...formData,
//       rmp_id: selectedRmp._id,
//       rmp_ref_no: selectedRmp.ref_no,
//       issue_date: new Date().toISOString().split('T')[0],
//       items: [{
//         rm_id: selectedRmp._id,
//         name: selectedRmp.name,
//         code: selectedRmp.code,
//         quantity: availableQty, 
//         unit: selectedRmp.unit
//       }]
//     });
//     setIsRmpDropdownOpen(false);
//     setRmpSearchTerm('');
//   };

//   const handleItemChange = (index, field, value) => {
//     const newItems = [...formData.items];
//     newItems[index][field] = value;
//     setFormData({ ...formData, items: newItems });
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     try {
//       const token = localStorage.getItem('token');
//       const config = { headers: { Authorization: `Bearer ${token}` } };
//       const firstItem = formData.items[0] || {};

//       const payload = {
//         ...formData,
//         material_name: firstItem.name,
//         material_code: firstItem.code,
//         quantity: firstItem.quantity,
//         unit: firstItem.unit,
//         purchase_id: formData.rmp_id,
//         raw_material: formData.rmp_id
//       };

//       await axios.post(`${BASE_URL}/api/material-issue-slip`, payload, config);
//       navigate('/inventorymanagement/mis'); 
//     } catch (error) {
//       alert(error.response?.data?.message || "Kuch galat ho gaya");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const filteredRmp = rmpList.filter(rmp => 
//     rmp.ref_no?.toLowerCase().includes(rmpSearchTerm.toLowerCase()) || 
//     rmp.name?.toLowerCase().includes(rmpSearchTerm.toLowerCase())
//   );

//   const filteredEmployees = employeesList.filter(emp => {
//     const empName = emp.FirstName ? `${emp.FirstName} ${emp.LastName || ''}`.trim() : (emp.name || emp.EmployeeName || '');
//     return empName.toLowerCase().includes(empSearchTerm.toLowerCase());
//   });

//   const filteredDepartments = departmentsList.filter(dept => {
//     const deptName = dept.DepartmentName || dept.department_name || dept.name || '';
//     return deptName.toLowerCase().includes(deptSearchTerm.toLowerCase());
//   });

//   const labelClass = "block text-[11px] font-bold text-gray-500 uppercase tracking-wide mb-1.5";
//   const inputClass = "w-full h-10 px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#0f4a4a] focus:border-[#0f4a4a] text-sm text-gray-800 transition-colors bg-white";

//   return (
//     <div className="flex justify-center p-6 md:p-8 bg-[#F8F9FA] min-h-screen font-sans">
//       <div className="w-full max-w-5xl bg-white rounded-xl shadow-[0_2px_10px_-3px_rgba(0,0,0,0.1)] border border-gray-200 overflow-visible">
        
//         <div className="px-8 py-5 border-b border-gray-200 bg-gray-50 rounded-t-xl">
//           <h1 className="text-xl font-bold text-gray-800">Create Material Issue Slip</h1>
//           <p className="text-sm text-gray-500 mt-1">Issue raw material to a department and generate a printable slip.</p>
//         </div>

//         <form onSubmit={handleSubmit} className="p-8 space-y-8">
          
//           <div>
//             <h3 className="text-sm font-bold text-gray-800 mb-4 border-b pb-2">Purchase Reference</h3>
//             <div className="relative" ref={rmpDropdownRef}>
//               <label className={labelClass}>Select Purchase Ref (RMP) <span className="text-red-500">*</span></label>
//               <div onClick={() => setIsRmpDropdownOpen(!isRmpDropdownOpen)} className="w-full h-10 px-3 border border-gray-300 rounded-md bg-white flex items-center justify-between cursor-pointer hover:border-[#0f4a4a] transition">
//                 <span className={`text-sm ${formData.rmp_ref_no ? 'text-gray-800 font-semibold' : 'text-gray-400'}`}>
//                   {formData.rmp_ref_no ? `${formData.rmp_ref_no} - ${formData.items[0]?.name}` : '-- Search or Select RMP --'}
//                 </span>
//                 <ChevronDown size={16} className="text-gray-500" />
//               </div>

//               {isRmpDropdownOpen && (
//                 <div className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-xl max-h-64 overflow-hidden flex flex-col">
//                   <div className="p-2 border-b border-gray-100 sticky top-0 bg-white">
//                     <div className="relative">
//                       <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
//                       <input type="text" placeholder="Search RMP Ref or Material Name..." value={rmpSearchTerm} onChange={(e) => setRmpSearchTerm(e.target.value)} className="w-full h-8 pl-8 pr-8 text-sm border border-gray-200 rounded bg-gray-50 focus:outline-none focus:ring-1 focus:ring-[#0f4a4a]" />
//                     </div>
//                   </div>
//                   <div className="overflow-y-auto flex-1">
//                     {filteredRmp.length === 0 ? (
//                       <div className="p-4 text-center text-sm text-gray-500">No RMP found</div>
//                     ) : (
//                       filteredRmp.map(rmp => (
//                         <div key={rmp._id} onClick={() => handleSelectRmp(rmp)} className="px-4 py-2 hover:bg-[#F0FDF9] cursor-pointer border-b border-gray-50 last:border-0">
//                           <div className="text-sm font-semibold text-gray-800">{rmp.ref_no} - {rmp.name}</div>
//                           <div className="text-xs text-gray-500">Remaining: {rmp.remaining_qty || rmp.quantity} {rmp.unit}</div>
//                         </div>
//                       ))
//                     )}
//                   </div>
//                 </div>
//               )}
//             </div>
//           </div>

//           <div>
//             <h3 className="text-sm font-bold text-gray-800 mb-4 border-b pb-2">Issue Details</h3>
//             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//               <div>
//                 <label className={labelClass}>Issue Date <span className="text-red-500">*</span></label>
//                 <input type="date" name="issue_date" required value={formData.issue_date} onChange={handleChange} className={inputClass} />
//               </div>
              
//               <div className="relative" ref={deptDropdownRef}>
//                 <label className={labelClass}>Department <span className="text-red-500">*</span></label>
//                 <div onClick={() => setIsDeptDropdownOpen(!isDeptDropdownOpen)} className="w-full h-10 px-3 border border-gray-300 rounded-md bg-white flex items-center justify-between cursor-pointer">
//                   <span className="text-sm text-gray-800 font-semibold">{formData.department || '-- Select --'}</span>
//                   <ChevronDown size={16} />
//                 </div>
//                 {isDeptDropdownOpen && (
//                   <div className="absolute z-20 w-full mt-1 bg-white border rounded-lg shadow-xl max-h-48 overflow-y-auto">
//                     {filteredDepartments.map(dept => (
//                       <div key={dept._id} onClick={() => { setFormData({ ...formData, department: dept.DepartmentName || dept.name }); setIsDeptDropdownOpen(false); }} className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm">
//                         {dept.DepartmentName || dept.name}
//                       </div>
//                     ))}
//                   </div>
//                 )}
//               </div>

//               <div className="relative" ref={empDropdownRef}>
//                 <label className={labelClass}>Issued To <span className="text-red-500">*</span></label>
//                 <div onClick={() => setIsEmpDropdownOpen(!isEmpDropdownOpen)} className="w-full h-10 px-3 border border-gray-300 rounded-md bg-white flex items-center justify-between cursor-pointer">
//                   <span className="text-sm text-gray-800 font-semibold">{formData.issued_to || '-- Select --'}</span>
//                   <ChevronDown size={16} />
//                 </div>
//                 {isEmpDropdownOpen && (
//                   <div className="absolute z-20 w-full mt-1 bg-white border rounded-lg shadow-xl max-h-48 overflow-y-auto">
//                     {filteredEmployees.map(emp => (
//                       <div key={emp._id} onClick={() => { setFormData({ ...formData, issued_to: emp.FirstName ? `${emp.FirstName} ${emp.LastName || ''}` : emp.name }); setIsEmpDropdownOpen(false); }} className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm">
//                         {emp.FirstName ? `${emp.FirstName} ${emp.LastName || ''}` : emp.name}
//                       </div>
//                     ))}
//                   </div>
//                 )}
//               </div>
//             </div>
//           </div>

//           <div>
//             <h3 className="text-sm font-bold text-gray-800 mb-4 border-b pb-2">Issued Items</h3>
//             <div className="border border-gray-200 rounded-lg overflow-hidden bg-gray-50 p-2">
//               <table className="w-full text-left border-collapse">
//                 <thead className="bg-[#F8F9FA] text-[11px] font-bold text-gray-600 uppercase tracking-wider">
//                   <tr>
//                     <th className="px-3 py-2">RM Name</th>
//                     <th className="px-3 py-2 w-40">Code</th>
//                     <th className="px-3 py-2 w-28">Qty</th>
//                     <th className="px-3 py-2 w-28">Unit</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {formData.items.map((item, index) => (
//                     <tr key={index}>
//                       <td className="p-2"><input type="text" required value={item.name} readOnly className={inputClass} /></td>
//                       <td className="p-2"><input type="text" required value={item.code} readOnly className={inputClass} /></td>
//                       <td className="p-2"><input type="number" required min="0.01" step="any" value={item.quantity} onChange={(e) => handleItemChange(index, 'quantity', e.target.value)} className={inputClass} /></td>
//                       <td className="p-2">
//                         <select value={item.unit} onChange={(e) => handleItemChange(index, 'unit', e.target.value)} className={`${inputClass} cursor-pointer`}>
//                           <option value="Kg">Kg</option>
//                           <option value="Nos">Nos</option>
//                           <option value="Meter">Meter</option>
//                           <option value="Set">Set</option>
//                           <option value="Piece">Piece</option>
//                           <option value="Sheet">Sheet</option>
//                           <option value="Roll">Roll</option>
//                         </select>
//                       </td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>
//           </div>

//           <div className="flex justify-between items-center pt-6 border-t border-gray-200 mt-8">
//             <button type="button" onClick={() => navigate(-1)} className="px-5 py-2.5 text-sm font-semibold text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition flex items-center gap-2">
//               <ArrowLeft size={16} /> Back
//             </button>
//             <button type="submit" disabled={loading} className="px-6 py-2.5 text-sm font-bold text-white bg-[#0f4a4a] hover:bg-[#0a3636] rounded-lg shadow-sm flex items-center gap-2 transition disabled:opacity-50">
//               <Save size={18} /> {loading ? 'Saving...' : 'Save & Generate Slip'}
//             </button>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// };

// export default AddMIS;


// import React, { useEffect, useMemo, useRef, useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import axios from 'axios';
// import {
//   ArrowLeft,
//   Save,
//   Search,
//   ChevronDown,
//   Plus,
//   X,
// } from 'lucide-react';
// import BASE_URL from '../../../config/Config';
// import {
//   Alert,
//   Autocomplete,
//   Box,
//   Button,
//   CircularProgress,
//   Grid,
//   MenuItem,
//   Paper,
//   Select,
//   Stack,
//   Step,
//   StepConnector,
//   StepLabel,
//   Stepper,
//   TextField,
//   Typography,
//   styled,
//   stepConnectorClasses,
// } from '@mui/material';
// import {
//   Add as AddIcon,
//   Edit as EditIcon,
//   NavigateBefore as NavigateBeforeIcon,
//   NavigateNext as NavigateNextIcon,
// } from '@mui/icons-material';

// const COLORS = {
//   primary: '#063C3F',
//   primaryLight: '#E8F0F1',
//   primaryDark: '#05292B',
//   text: { primary: '#151C26', secondary: '#4B5568', tertiary: '#94A3B8', light: '#FFFFFF' },
//   background: { white: '#FFFFFF', light: '#F8FFFC' },
//   border: '#E3E8EF',
// };
// const employeeSteps = ['Personal Info', 'Employment', 'Pay & Work', 'Bank & Emergency'];
// const ColorConnector = styled(StepConnector)(() => ({
//   [`&.${stepConnectorClasses.active} .${stepConnectorClasses.line}`]: {
//     backgroundImage: 'linear-gradient(135deg, #063C3F 0%, #00B4D8 50%, #05292B 100%)',
//   },
//   [`&.${stepConnectorClasses.completed} .${stepConnectorClasses.line}`]: {
//     backgroundImage: 'linear-gradient(135deg, #063C3F 0%, #00B4D8 50%, #05292B 100%)',
//   },
//   [`& .${stepConnectorClasses.line}`]: {
//     height: 3,
//     border: 0,
//     backgroundColor: '#eaeaf0',
//     borderRadius: 1,
//   },
// }));

// const InlineEmployeeForm = ({ 
//   onClose, 
//   onSave, 
//   onUpdate, 
//   initialData = null, 
//   isEdit = false,
//   departments = [],
//   designations = [],
//   loadingData = false
// }) => {
//   const [activeStep, setActiveStep] = useState(0);
//   const [loading, setLoading] = useState(false);
//   const [submitError, setSubmitError] = useState('');
//   const [localDepartments, setLocalDepartments] = useState(departments);
//   const [localDesignations, setLocalDesignations] = useState(designations);

//   const [formData, setFormData] = useState({
//     FirstName: '',
//     LastName: '',
//     Gender: 'M',
//     DateOfBirth: '',
//     Email: '',
//     Phone: '',
//     Address: '',
//     DepartmentID: '',
//     DesignationID: '',
//     DateOfJoining: '',
//     EmploymentType: 'Monthly',
//     ContractCompany: '',
//     PayStructureType: 'Fixed',
//     BasicSalary: '',
//     HourlyRate: '',
//     OvertimeRateMultiplier: '1.5',
//     SkillLevel: '',
//     WorkStation: '',
//     LineNumber: '',
//     PAN: '',
//     AadharNumber: '',
//     PFNumber: '',
//     UAN: '',
//     ESINumber: '',
//     BankAccountNumber: '',
//     BankAccountHolderName: '',
//     BankName: '',
//     BankBranch: '',
//     BankIfscCode: '',
//     BankAccountType: 'Savings',
//     EmergencyContactName: '',
//     EmergencyContactRelationship: '',
//     EmergencyContactPhone: '',
//     EmergencyContactAddress: '',
//     EmergencyContactPIN: ''
//   });

//   const [fieldErrors, setFieldErrors] = useState({});
//   const [touched, setTouched] = useState({});

//   // Pre‑fill form when initialData changes
//   useEffect(() => {
//     if (initialData) {
//       setFormData({
//         FirstName: initialData.FirstName || '',
//         LastName: initialData.LastName || '',
//         Gender: initialData.Gender || 'M',
//         DateOfBirth: initialData.DateOfBirth || '',
//         Email: initialData.Email || '',
//         Phone: initialData.Phone || '',
//         Address: initialData.Address || '',
//         DepartmentID: initialData.DepartmentID?._id || initialData.DepartmentID || '',
//         DesignationID: initialData.DesignationID?._id || initialData.DesignationID || '',
//         DateOfJoining: initialData.DateOfJoining || '',
//         EmploymentType: initialData.EmploymentType || 'Monthly',
//         ContractCompany: initialData.ContractCompany || '',
//         PayStructureType: initialData.PayStructureType || 'Fixed',
//         BasicSalary: initialData.BasicSalary || '',
//         HourlyRate: initialData.HourlyRate || '',
//         OvertimeRateMultiplier: initialData.OvertimeRateMultiplier || '1.5',
//         SkillLevel: initialData.SkillLevel || '',
//         WorkStation: initialData.WorkStation || '',
//         LineNumber: initialData.LineNumber || '',
//         PAN: initialData.PAN || '',
//         AadharNumber: initialData.AadharNumber || '',
//         PFNumber: initialData.PFNumber || '',
//         UAN: initialData.UAN || '',
//         ESINumber: initialData.ESINumber || '',
//         BankAccountNumber: initialData.BankDetails?.accountNumber || '',
//         BankAccountHolderName: initialData.BankDetails?.accountHolderName || '',
//         BankName: initialData.BankDetails?.bankName || '',
//         BankBranch: initialData.BankDetails?.branch || '',
//         BankIfscCode: initialData.BankDetails?.ifscCode || '',
//         BankAccountType: initialData.BankDetails?.accountType || 'Savings',
//         EmergencyContactName: initialData.EmergencyContact?.name || '',
//         EmergencyContactRelationship: initialData.EmergencyContact?.relationship || '',
//         EmergencyContactPhone: initialData.EmergencyContact?.phone || '',
//         EmergencyContactAddress: initialData.EmergencyContact?.address || '',
//         EmergencyContactPIN: initialData.EmergencyContact?.pinCode || ''
//       });
//       // Reset errors and touched
//       setFieldErrors({});
//       setTouched({});
//       setActiveStep(0);
//       setSubmitError('');
//     }
//   }, [initialData]);

//   // Options (same as AddEmployees)
//   const genderOptions = [
//     { value: 'M', label: 'Male' },
//     { value: 'F', label: 'Female' },
//     { value: 'O', label: 'Other' }
//   ];
//   const employmentTypeOptions = [
//     { value: 'Monthly', label: 'Monthly' },
//     { value: 'Hourly', label: 'Hourly' },
//     { value: 'PieceRate', label: 'Piece Rate' },
//     { value: 'contract-based', label: 'Contract-Based' }
//   ];
//   const contractCompanyOptions = [
//     { value: 'DISTIL', label: 'DISTIL' },
//     { value: 'AARADHYA', label: 'AARADHYA' },
//     { value: 'MAHI', label: 'MAHI' }
//   ];
//   const payStructureOptions = [
//     { value: 'Fixed', label: 'Fixed' },
//     { value: 'Variable', label: 'Variable' },
//     { value: 'Commission', label: 'Commission' },
//     { value: 'PieceRate', label: 'Piece Rate' }
//   ];
//   const skillLevelOptions = [
//     { value: 'Unskilled', label: 'Unskilled' },
//     { value: 'Semi-Skilled', label: 'Semi-Skilled' },
//     { value: 'Skilled', label: 'Skilled' },
//     { value: 'Highly Skilled', label: 'Highly Skilled' }
//   ];
//   const accountTypeOptions = [
//     { value: 'Savings', label: 'Savings' },
//     { value: 'Current', label: 'Current' },
//     { value: 'Salary', label: 'Salary' }
//   ];

//   // Validation functions (same as AddEmployees)
//   const validateEmail = (email) => /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email);
//   const validatePhone = (phone) => {
//     const clean = phone.replace(/\D/g, '');
//     return clean === '' || /^[6-9]\d{9}$/.test(clean);
//   };
//   const validateName = (name) => /^[A-Za-z\s.'-]+$/.test(name);
//   const validateAddress = (address) => /^[A-Za-z0-9\s,.#\-/]+$/.test(address);
//   const validatePAN = (pan) => /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(pan);
//   const validateAadhar = (aadhar) => /^\d{12}$/.test(aadhar);
//   const validatePF = (pf) => /^[A-Z]{2}\/\d{5}\/\d{7}$/.test(pf);
//   const validateUAN = (uan) => /^\d{12}$/.test(uan);
//   const validateESI = (esi) => /^\d{17}$/.test(esi);
//   const validateAccount = (acc) => /^\d{9,18}$/.test(acc);
//   const validateIFSC = (ifsc) => /^[A-Z]{4}0[A-Z0-9]{6}$/.test(ifsc);
//   const validatePIN = (pin) => /^\d{6}$/.test(pin);
//   const validateBankName = (bank) => /^[A-Za-z\s.'&-]+$/.test(bank);
//   const validateBranch = (branch) => /^[A-Za-z0-9\s.-]+$/.test(branch);
//   const validateRelation = (rel) => /^[A-Za-z\s]+$/.test(rel);
//   const validateWorkStation = (ws) => /^[A-Za-z0-9\s-]+$/.test(ws);

//   const validateField = (name, value) => {
//     switch (name) {
//       case 'FirstName':
//       case 'LastName':
//       case 'BankAccountHolderName':
//       case 'EmergencyContactName':
//         if (value && !validateName(value)) return 'Only letters, spaces, dots, hyphens';
//         break;
//       case 'Email':
//         if (value && !validateEmail(value)) return 'Invalid email';
//         break;
//       case 'Phone':
//       case 'EmergencyContactPhone':
//         if (value && !validatePhone(value)) return '10-digit number starting with 6-9';
//         break;
//       case 'Address':
//       case 'EmergencyContactAddress':
//         if (value && !validateAddress(value)) return 'Invalid characters';
//         break;
//       case 'PAN':
//         if (value && !validatePAN(value)) return 'Format: ABCDE1234F';
//         break;
//       case 'AadharNumber':
//         if (value && !validateAadhar(value)) return '12 digits';
//         break;
//       case 'PFNumber':
//         if (value && !validatePF(value)) return 'Format: XX/12345/1234567';
//         break;
//       case 'UAN':
//         if (value && !validateUAN(value)) return '12 digits';
//         break;
//       case 'ESINumber':
//         if (value && !validateESI(value)) return '17 digits';
//         break;
//       case 'BankAccountNumber':
//         if (value && !validateAccount(value)) return '9-18 digits';
//         break;
//       case 'BankName':
//         if (value && !validateBankName(value)) return 'Letters, spaces, dots, hyphens';
//         break;
//       case 'BankBranch':
//         if (value && !validateBranch(value)) return 'Letters, numbers, spaces, dots, hyphens';
//         break;
//       case 'BankIfscCode':
//         if (value && !validateIFSC(value)) return 'Format: ABCD0123456';
//         break;
//       case 'EmergencyContactRelationship':
//         if (value && !validateRelation(value)) return 'Letters and spaces only';
//         break;
//       case 'EmergencyContactPIN':
//         if (value && !validatePIN(value)) return '6 digits';
//         break;
//       case 'WorkStation':
//       case 'LineNumber':
//         if (value && !validateWorkStation(value)) return 'Letters, numbers, spaces, hyphens';
//         break;
//       case 'ContractCompany':
//         if (formData.EmploymentType === 'contract-based' && !value) return 'Required';
//         break;
//       default:
//         return '';
//     }
//     return '';
//   };

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData(prev => ({ ...prev, [name]: value }));
//     if (touched[name] || value) {
//       const error = validateField(name, value);
//       setFieldErrors(prev => ({ ...prev, [name]: error }));
//     }
//   };

//   const handleBlur = (e) => {
//     const { name, value } = e.target;
//     setTouched(prev => ({ ...prev, [name]: true }));
//     const error = validateField(name, value);
//     setFieldErrors(prev => ({ ...prev, [name]: error }));
//   };

//   const handleAutocompleteChange = (name, value) => {
//     setFormData(prev => ({ ...prev, [name]: value?._id || '' }));
//     setFieldErrors(prev => ({ ...prev, [name]: '' }));
//   };

//   const handleEmploymentTypeChange = (e) => {
//     const employmentType = e.target.value;
//     let payStructure = 'Fixed';
//     if (employmentType === 'PieceRate') payStructure = 'PieceRate';
//     setFormData(prev => ({
//       ...prev,
//       EmploymentType: employmentType,
//       PayStructureType: payStructure
//     }));
//   };

//   // Step‑wise validation
//   const validateStep = (step) => {
//     const errors = {};
//     let isValid = true;

//     switch (step) {
//       case 0: // Personal Info
//         if (!formData.FirstName.trim()) { errors.FirstName = 'Required'; isValid = false; }
//         else { const err = validateField('FirstName', formData.FirstName); if (err) { errors.FirstName = err; isValid = false; } }
//         if (!formData.LastName.trim()) { errors.LastName = 'Required'; isValid = false; }
//         else { const err = validateField('LastName', formData.LastName); if (err) { errors.LastName = err; isValid = false; } }
//         if (!formData.Email.trim()) { errors.Email = 'Required'; isValid = false; }
//         else { const err = validateField('Email', formData.Email); if (err) { errors.Email = err; isValid = false; } }
//         if (formData.Phone) { const err = validateField('Phone', formData.Phone); if (err) { errors.Phone = err; isValid = false; } }
//         if (formData.Address) { const err = validateField('Address', formData.Address); if (err) { errors.Address = err; isValid = false; } }
//         break;

//       case 1: // Employment
//         if (!formData.DepartmentID) { errors.DepartmentID = 'Required'; isValid = false; }
//         if (!formData.DesignationID) { errors.DesignationID = 'Required'; isValid = false; }
//         if (!formData.DateOfJoining) { errors.DateOfJoining = 'Required'; isValid = false; }
//         if (formData.EmploymentType === 'contract-based' && !formData.ContractCompany) {
//           errors.ContractCompany = 'Required';
//           isValid = false;
//         }
//         break;

//       case 2: // Pay & Work
//         if ((formData.EmploymentType === 'Monthly' || formData.EmploymentType === 'contract-based') && !formData.BasicSalary) {
//           errors.BasicSalary = 'Required';
//           isValid = false;
//         }
//         if (formData.EmploymentType === 'Hourly' && !formData.HourlyRate) {
//           errors.HourlyRate = 'Required';
//           isValid = false;
//         }
//         const taxFields = ['PAN', 'AadharNumber', 'PFNumber', 'UAN', 'ESINumber', 'WorkStation', 'LineNumber'];
//         taxFields.forEach(field => {
//           if (formData[field]) {
//             const err = validateField(field, formData[field]);
//             if (err) { errors[field] = err; isValid = false; }
//           }
//         });
//         break;

//       case 3: // Bank & Emergency
//         const bankFields = ['BankAccountNumber', 'BankAccountHolderName', 'BankName', 'BankBranch', 'BankIfscCode'];
//         const hasAnyBank = bankFields.some(f => formData[f]);
//         if (hasAnyBank) {
//           bankFields.forEach(field => {
//             if (!formData[field]) {
//               errors[field] = 'Required when providing bank details';
//               isValid = false;
//             } else {
//               const err = validateField(field, formData[field]);
//               if (err) { errors[field] = err; isValid = false; }
//             }
//           });
//         }
//         const emergencyFields = ['EmergencyContactName', 'EmergencyContactRelationship', 'EmergencyContactPhone', 'EmergencyContactAddress', 'EmergencyContactPIN'];
//         const hasAnyEmergency = emergencyFields.some(f => formData[f]);
//         if (hasAnyEmergency) {
//           emergencyFields.forEach(field => {
//             if (!formData[field]) {
//               errors[field] = 'Required when providing emergency contact';
//               isValid = false;
//             } else {
//               const err = validateField(field, formData[field]);
//               if (err) { errors[field] = err; isValid = false; }
//             }
//           });
//         }
//         break;

//       default:
//         return true;
//     }

//     setFieldErrors(errors);
//     if (!isValid) setSubmitError('Please fix the errors in this section');
//     return isValid;
//   };

//   const handleNext = () => {
//     if (validateStep(activeStep)) {
//       setSubmitError('');
//       setActiveStep(prev => prev + 1);
//     }
//   };

//   const handleBack = () => {
//     setSubmitError('');
//     setActiveStep(prev => prev - 1);
//   };

//   // Submit (Create or Update)
//   const handleSubmit = async () => {
//     if (!validateStep(3)) return;
//     setLoading(true);
//     setSubmitError('');
//     try {
//       const token = localStorage.getItem('token');
//       const payload = {
//         FirstName: formData.FirstName,
//         LastName: formData.LastName,
//         Gender: formData.Gender,
//         DateOfBirth: formData.DateOfBirth || undefined,
//         Email: formData.Email,
//         Phone: formData.Phone || undefined,
//         Address: formData.Address || undefined,
//         DepartmentID: formData.DepartmentID,
//         DesignationID: formData.DesignationID,
//         DateOfJoining: formData.DateOfJoining,
//         EmploymentType: formData.EmploymentType,
//         PayStructureType: formData.PayStructureType,
//         ContractCompany: formData.ContractCompany || undefined,
//         BasicSalary: (formData.EmploymentType === 'Monthly' || formData.EmploymentType === 'contract-based') ? Number(formData.BasicSalary || 0) : 0,
//         HourlyRate: formData.EmploymentType === 'Hourly' ? Number(formData.HourlyRate || 0) : 0,
//         OvertimeRateMultiplier: Number(formData.OvertimeRateMultiplier || 1.5),
//         SkillLevel: formData.SkillLevel || undefined,
//         WorkStation: formData.WorkStation || undefined,
//         LineNumber: formData.LineNumber || undefined,
//         PAN: formData.PAN || undefined,
//         AadharNumber: formData.AadharNumber || undefined,
//         PFNumber: formData.PFNumber || undefined,
//         UAN: formData.UAN || undefined,
//         ESINumber: formData.ESINumber || undefined,
//         EmploymentStatus: 'active'
//       };
//       const bankFields = ['BankAccountNumber', 'BankAccountHolderName', 'BankName', 'BankBranch', 'BankIfscCode'];
//       const hasAnyBank = bankFields.some(f => formData[f]);
//       if (hasAnyBank) {
//         payload.BankDetails = {
//           accountNumber: formData.BankAccountNumber,
//           accountHolderName: formData.BankAccountHolderName,
//           bankName: formData.BankName,
//           branch: formData.BankBranch,
//           ifscCode: formData.BankIfscCode,
//           accountType: formData.BankAccountType
//         };
//       }
//       const emergencyFields = ['EmergencyContactName', 'EmergencyContactRelationship', 'EmergencyContactPhone', 'EmergencyContactAddress', 'EmergencyContactPIN'];
//       const hasAnyEmergency = emergencyFields.some(f => formData[f]);
//       if (hasAnyEmergency) {
//         payload.EmergencyContact = {
//           name: formData.EmergencyContactName,
//           relationship: formData.EmergencyContactRelationship,
//           phone: formData.EmergencyContactPhone,
//           address: formData.EmergencyContactAddress,
//           pinCode: formData.EmergencyContactPIN
//         };
//       }
//       Object.keys(payload).forEach(key => payload[key] === undefined && delete payload[key]);

//       let response;
//       if (isEdit && initialData?._id) {
//         // Update existing employee
//         response = await axios.put(`${BASE_URL}/api/employees/${initialData._id}`, payload, {
//           headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
//         });
//       } else {
//         // Create new employee
//         response = await axios.post(`${BASE_URL}/api/employees`, payload, {
//           headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
//         });
//       }
//       if (response.data.success) {
//         if (isEdit && initialData?._id) {
//           if (onUpdate) onUpdate(response.data.data);
//         } else {
//           if (onSave) onSave(response.data.data);
//         }
//       } else {
//         setSubmitError(response.data.message || 'Operation failed');
//       }
//     } catch (err) {
//       console.error('Error saving employee:', err);
//       setSubmitError(err.response?.data?.message || 'An error occurred');
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Styles
//   const inputStyle = {
//     '& .MuiOutlinedInput-root': {
//       borderRadius: 1.5,
//       fontSize: '0.75rem',
//       '&:hover fieldset': { borderColor: COLORS.primary },
//       '&.Mui-focused fieldset': { borderColor: COLORS.primary, borderWidth: 1 }
//     },
//     '& .MuiInputBase-input': {
//       py: 1,
//       px: 1.5,
//       fontSize: '0.75rem',
//       color: COLORS.text.primary,
//       '&::placeholder': {
//         color: COLORS.text.tertiary,
//         fontSize: '0.75rem'
//       }
//     }
//   };
//   const labelStyle = {
//     fontSize: '0.7rem',
//     fontWeight: 600,
//     color: COLORS.text.secondary,
//     letterSpacing: '0.5px',
//     mb: 0.5
//   };

//   const renderStepContent = (step) => {
//     switch (step) {
//       case 0:
//         return (
//           <Stack spacing={2}>
//             <Paper sx={{ p: 2, bgcolor: '#f9fafb', borderRadius: 2, border: `1px solid ${COLORS.border}` }}>
//               <Typography sx={{ fontSize: '0.9rem', fontWeight: 600, color: COLORS.primary, mb: 1.5 }}>
//                 Personal Information
//               </Typography>
//               <Grid container spacing={1.5}>
//                 <Grid item xs={12} sm={6}>
//                   <Box><Typography sx={labelStyle}>FIRST NAME <span style={{ color: '#EF4444' }}>*</span></Typography>
//                     <TextField fullWidth size="small" name="FirstName" placeholder="e.g., John" value={formData.FirstName} onChange={handleChange} onBlur={handleBlur} error={!!fieldErrors.FirstName} helperText={fieldErrors.FirstName} sx={inputStyle} /></Box>
//                 </Grid>
//                 <Grid item xs={12} sm={6}>
//                   <Box><Typography sx={labelStyle}>LAST NAME <span style={{ color: '#EF4444' }}>*</span></Typography>
//                     <TextField fullWidth size="small" name="LastName" placeholder="e.g., Doe" value={formData.LastName} onChange={handleChange} onBlur={handleBlur} error={!!fieldErrors.LastName} helperText={fieldErrors.LastName} sx={inputStyle} /></Box>
//                 </Grid>
//                 <Grid item xs={12} sm={6}>
//                   <Box><Typography sx={labelStyle}>GENDER</Typography>
//                     <TextField select fullWidth size="small" name="Gender" value={formData.Gender} onChange={handleChange} sx={inputStyle}>
//                       {genderOptions.map(o => <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>)}
//                     </TextField></Box>
//                 </Grid>
//                 <Grid item xs={12} sm={6}>
//                   <Box><Typography sx={labelStyle}>DATE OF BIRTH</Typography>
//                     <TextField fullWidth size="small" name="DateOfBirth" type="date" value={formData.DateOfBirth} onChange={handleChange} InputLabelProps={{ shrink: true }} sx={inputStyle} /></Box>
//                 </Grid>
//                 <Grid item xs={12} sm={6}>
//                   <Box><Typography sx={labelStyle}>EMAIL <span style={{ color: '#EF4444' }}>*</span></Typography>
//                     <TextField fullWidth size="small" name="Email" placeholder="john.doe@company.com" value={formData.Email} onChange={handleChange} onBlur={handleBlur} error={!!fieldErrors.Email} helperText={fieldErrors.Email} sx={inputStyle} />
//                     <Typography sx={{ fontSize: '0.65rem', color: COLORS.text.tertiary }}>e.g., john.doe@company.com</Typography></Box>
//                 </Grid>
//                 <Grid item xs={12} sm={6}>
//                   <Box><Typography sx={labelStyle}>PHONE</Typography>
//                     <TextField fullWidth size="small" name="Phone" placeholder="9876543210" value={formData.Phone} onChange={handleChange} onBlur={handleBlur} error={!!fieldErrors.Phone} helperText={fieldErrors.Phone} inputProps={{ maxLength: 10 }} sx={inputStyle} />
//                     <Typography sx={{ fontSize: '0.65rem', color: COLORS.text.tertiary }}>10-digit number starting with 6-9</Typography></Box>
//                 </Grid>
//                 <Grid item xs={12}>
//                   <Box><Typography sx={labelStyle}>ADDRESS</Typography>
//                     <TextField fullWidth size="small" name="Address" multiline rows={2} placeholder="Enter complete address" value={formData.Address} onChange={handleChange} onBlur={handleBlur} error={!!fieldErrors.Address} helperText={fieldErrors.Address} sx={inputStyle} /></Box>
//                 </Grid>
//               </Grid>
//             </Paper>
//           </Stack>
//         );

//       case 1:
//         return (
//           <Stack spacing={2}>
//             <Paper sx={{ p: 2, bgcolor: '#f9fafb', borderRadius: 2, border: `1px solid ${COLORS.border}` }}>
//               <Typography sx={{ fontSize: '0.9rem', fontWeight: 600, color: COLORS.primary, mb: 1.5 }}>
//                 Employment Details
//               </Typography>
//               <Grid container spacing={1.5}>
//                 <Grid item xs={12} sm={6}>
//                   <Box><Typography sx={labelStyle}>DEPARTMENT <span style={{ color: '#EF4444' }}>*</span></Typography>
//                     <Autocomplete
//                       options={localDepartments}
//                       getOptionLabel={(opt) => opt?.DepartmentName || ''}
//                       value={localDepartments.find(d => d._id === formData.DepartmentID) || null}
//                       onChange={(e, v) => handleAutocompleteChange('DepartmentID', v)}
//                       loading={loadingData}
//                       renderInput={(params) => <TextField {...params} size="small" placeholder="Select department" error={!!fieldErrors.DepartmentID} helperText={fieldErrors.DepartmentID} sx={inputStyle} />}
//                     /></Box>
//                 </Grid>
//                 <Grid item xs={12} sm={6}>
//                   <Box><Typography sx={labelStyle}>DESIGNATION <span style={{ color: '#EF4444' }}>*</span></Typography>
//                     <Autocomplete
//                       options={localDesignations}
//                       getOptionLabel={(opt) => opt?.DesignationName || ''}
//                       value={localDesignations.find(d => d._id === formData.DesignationID) || null}
//                       onChange={(e, v) => handleAutocompleteChange('DesignationID', v)}
//                       loading={loadingData}
//                       renderInput={(params) => <TextField {...params} size="small" placeholder="Select designation" error={!!fieldErrors.DesignationID} helperText={fieldErrors.DesignationID} sx={inputStyle} />}
//                     /></Box>
//                 </Grid>
//                 <Grid item xs={12} sm={6}>
//                   <Box><Typography sx={labelStyle}>DATE OF JOINING <span style={{ color: '#EF4444' }}>*</span></Typography>
//                     <TextField fullWidth size="small" name="DateOfJoining" type="date" value={formData.DateOfJoining} onChange={handleChange} error={!!fieldErrors.DateOfJoining} helperText={fieldErrors.DateOfJoining} InputLabelProps={{ shrink: true }} sx={inputStyle} /></Box>
//                 </Grid>
//                 <Grid item xs={12} sm={6}>
//                   <Box><Typography sx={labelStyle}>EMPLOYMENT TYPE <span style={{ color: '#EF4444' }}>*</span></Typography>
//                     <TextField select fullWidth size="small" name="EmploymentType" value={formData.EmploymentType} onChange={handleEmploymentTypeChange} sx={inputStyle}>
//                       {employmentTypeOptions.map(o => <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>)}
//                     </TextField></Box>
//                 </Grid>
//                 {formData.EmploymentType === 'contract-based' && (
//                   <Grid item xs={12} sm={6}>
//                     <Box><Typography sx={labelStyle}>CONTRACT COMPANY <span style={{ color: '#EF4444' }}>*</span></Typography>
//                       <TextField select fullWidth size="small" name="ContractCompany" value={formData.ContractCompany} onChange={handleChange} error={!!fieldErrors.ContractCompany} helperText={fieldErrors.ContractCompany} sx={inputStyle}>
//                         <MenuItem value="">Select</MenuItem>
//                         {contractCompanyOptions.map(o => <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>)}
//                       </TextField></Box>
//                   </Grid>
//                 )}
//               </Grid>
//             </Paper>
//           </Stack>
//         );

//       case 2:
//         return (
//           <Stack spacing={2}>
//             <Paper sx={{ p: 2, bgcolor: '#f9fafb', borderRadius: 2, border: `1px solid ${COLORS.border}` }}>
//               <Typography sx={{ fontSize: '0.9rem', fontWeight: 600, color: COLORS.primary, mb: 1.5 }}>
//                 Pay & Work Details
//               </Typography>
//               <Grid container spacing={1.5}>
//                 <Grid item xs={12} sm={6}>
//                   <Box><Typography sx={labelStyle}>PAY STRUCTURE TYPE</Typography>
//                     <TextField select fullWidth size="small" name="PayStructureType" value={formData.PayStructureType} onChange={handleChange} sx={inputStyle}>
//                       {payStructureOptions.map(o => <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>)}
//                     </TextField></Box>
//                 </Grid>
//                 {(formData.EmploymentType === 'Monthly' || formData.EmploymentType === 'contract-based') && (
//                   <Grid item xs={12} sm={6}>
//                     <Box><Typography sx={labelStyle}>BASIC SALARY <span style={{ color: '#EF4444' }}>*</span></Typography>
//                       <TextField fullWidth size="small" name="BasicSalary" type="number" placeholder="e.g., 25000" value={formData.BasicSalary} onChange={handleChange} error={!!fieldErrors.BasicSalary} helperText={fieldErrors.BasicSalary} inputProps={{ min: 0 }} sx={inputStyle} /></Box>
//                   </Grid>
//                 )}
//                 {formData.EmploymentType === 'Hourly' && (
//                   <Grid item xs={12} sm={6}>
//                     <Box><Typography sx={labelStyle}>HOURLY RATE <span style={{ color: '#EF4444' }}>*</span></Typography>
//                       <TextField fullWidth size="small" name="HourlyRate" type="number" placeholder="e.g., 150" value={formData.HourlyRate} onChange={handleChange} error={!!fieldErrors.HourlyRate} helperText={fieldErrors.HourlyRate} inputProps={{ min: 0, step: 0.01 }} sx={inputStyle} /></Box>
//                   </Grid>
//                 )}
//                 {formData.EmploymentType !== 'PieceRate' && (
//                   <>
//                     <Grid item xs={12} sm={6}>
//                       <Box><Typography sx={labelStyle}>OVERTIME MULTIPLIER</Typography>
//                         <TextField fullWidth size="small" name="OvertimeRateMultiplier" type="number" value={formData.OvertimeRateMultiplier} onChange={handleChange} inputProps={{ step: 0.25, min: 1, max: 3 }} sx={inputStyle} /></Box>
//                     </Grid>
//                     <Grid item xs={12} sm={6}>
//                       <Box><Typography sx={labelStyle}>SKILL LEVEL</Typography>
//                         <TextField select fullWidth size="small" name="SkillLevel" value={formData.SkillLevel} onChange={handleChange} sx={inputStyle}>
//                           <MenuItem value="">None</MenuItem>
//                           {skillLevelOptions.map(o => <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>)}
//                         </TextField></Box>
//                     </Grid>
//                   </>
//                 )}
//                 <Grid item xs={12} sm={6}>
//                   <Box><Typography sx={labelStyle}>WORK STATION</Typography>
//                     <TextField fullWidth size="small" name="WorkStation" placeholder="e.g., Station A" value={formData.WorkStation} onChange={handleChange} onBlur={handleBlur} error={!!fieldErrors.WorkStation} helperText={fieldErrors.WorkStation} sx={inputStyle} />
//                     <Typography sx={{ fontSize: '0.65rem', color: COLORS.text.tertiary }}>Letters, numbers, spaces, hyphens</Typography></Box>
//                 </Grid>
//                 <Grid item xs={12} sm={6}>
//                   <Box><Typography sx={labelStyle}>LINE NUMBER</Typography>
//                     <TextField fullWidth size="small" name="LineNumber" placeholder="e.g., Line 1" value={formData.LineNumber} onChange={handleChange} onBlur={handleBlur} error={!!fieldErrors.LineNumber} helperText={fieldErrors.LineNumber} sx={inputStyle} />
//                     <Typography sx={{ fontSize: '0.65rem', color: COLORS.text.tertiary }}>Letters, numbers, spaces, hyphens</Typography></Box>
//                 </Grid>
//                 <Grid item xs={12}><Typography sx={{ fontWeight: 600, color: COLORS.primary, fontSize: '0.8rem', mt: 1 }}>Tax & Identification (Optional)</Typography></Grid>
//                 <Grid item xs={12} sm={6}>
//                   <Box><Typography sx={labelStyle}>PAN</Typography>
//                     <TextField fullWidth size="small" name="PAN" placeholder="ABCDE1234F" value={formData.PAN} onChange={handleChange} onBlur={handleBlur} error={!!fieldErrors.PAN} helperText={fieldErrors.PAN} inputProps={{ maxLength: 10 }} sx={inputStyle} />
//                     <Typography sx={{ fontSize: '0.65rem', color: COLORS.text.tertiary }}>5 letters + 4 numbers + 1 letter</Typography></Box>
//                 </Grid>
//                 <Grid item xs={12} sm={6}>
//                   <Box><Typography sx={labelStyle}>AADHAR NUMBER</Typography>
//                     <TextField fullWidth size="small" name="AadharNumber" placeholder="123456789012" value={formData.AadharNumber} onChange={handleChange} onBlur={handleBlur} error={!!fieldErrors.AadharNumber} helperText={fieldErrors.AadharNumber} inputProps={{ maxLength: 12 }} sx={inputStyle} />
//                     <Typography sx={{ fontSize: '0.65rem', color: COLORS.text.tertiary }}>12 digits</Typography></Box>
//                 </Grid>
//                 <Grid item xs={12} sm={6}>
//                   <Box><Typography sx={labelStyle}>PF NUMBER</Typography>
//                     <TextField fullWidth size="small" name="PFNumber" placeholder="AB/12345/1234567" value={formData.PFNumber} onChange={handleChange} onBlur={handleBlur} error={!!fieldErrors.PFNumber} helperText={fieldErrors.PFNumber} sx={inputStyle} />
//                     <Typography sx={{ fontSize: '0.65rem', color: COLORS.text.tertiary }}>Format: XX/12345/1234567</Typography></Box>
//                 </Grid>
//                 <Grid item xs={12} sm={6}>
//                   <Box><Typography sx={labelStyle}>UAN</Typography>
//                     <TextField fullWidth size="small" name="UAN" placeholder="123456789012" value={formData.UAN} onChange={handleChange} onBlur={handleBlur} error={!!fieldErrors.UAN} helperText={fieldErrors.UAN} inputProps={{ maxLength: 12 }} sx={inputStyle} />
//                     <Typography sx={{ fontSize: '0.65rem', color: COLORS.text.tertiary }}>12 digits</Typography></Box>
//                 </Grid>
//                 <Grid item xs={12} sm={6}>
//                   <Box><Typography sx={labelStyle}>ESI NUMBER</Typography>
//                     <TextField fullWidth size="small" name="ESINumber" placeholder="12345678901234567" value={formData.ESINumber} onChange={handleChange} onBlur={handleBlur} error={!!fieldErrors.ESINumber} helperText={fieldErrors.ESINumber} inputProps={{ maxLength: 17 }} sx={inputStyle} />
//                     <Typography sx={{ fontSize: '0.65rem', color: COLORS.text.tertiary }}>17 digits</Typography></Box>
//                 </Grid>
//               </Grid>
//             </Paper>
//           </Stack>
//         );

//       case 3:
//         return (
//           <Stack spacing={2}>
//             <Paper sx={{ p: 2, bgcolor: '#f9fafb', borderRadius: 2, border: `1px solid ${COLORS.border}` }}>
//               <Typography sx={{ fontSize: '0.9rem', fontWeight: 600, color: COLORS.primary, mb: 1.5 }}>
//                 Bank Details <span style={{ fontSize: '0.7rem', fontWeight: 'normal', color: COLORS.text.tertiary }}>(All or None)</span>
//               </Typography>
//               <Grid container spacing={1.5}>
//                 <Grid item xs={12} sm={6}>
//                   <Box><Typography sx={labelStyle}>ACCOUNT NUMBER</Typography>
//                     <TextField fullWidth size="small" name="BankAccountNumber" placeholder="123456789" value={formData.BankAccountNumber} onChange={handleChange} onBlur={handleBlur} error={!!fieldErrors.BankAccountNumber} helperText={fieldErrors.BankAccountNumber} inputProps={{ maxLength: 18 }} sx={inputStyle} />
//                     <Typography sx={{ fontSize: '0.65rem', color: COLORS.text.tertiary }}>9-18 digits</Typography></Box>
//                 </Grid>
//                 <Grid item xs={12} sm={6}>
//                   <Box><Typography sx={labelStyle}>ACCOUNT HOLDER NAME</Typography>
//                     <TextField fullWidth size="small" name="BankAccountHolderName" placeholder="John Doe" value={formData.BankAccountHolderName} onChange={handleChange} onBlur={handleBlur} error={!!fieldErrors.BankAccountHolderName} helperText={fieldErrors.BankAccountHolderName} sx={inputStyle} /></Box>
//                 </Grid>
//                 <Grid item xs={12} sm={6}>
//                   <Box><Typography sx={labelStyle}>BANK NAME</Typography>
//                     <TextField fullWidth size="small" name="BankName" placeholder="State Bank of India" value={formData.BankName} onChange={handleChange} onBlur={handleBlur} error={!!fieldErrors.BankName} helperText={fieldErrors.BankName} sx={inputStyle} /></Box>
//                 </Grid>
//                 <Grid item xs={12} sm={6}>
//                   <Box><Typography sx={labelStyle}>BRANCH</Typography>
//                     <TextField fullWidth size="small" name="BankBranch" placeholder="Main Branch" value={formData.BankBranch} onChange={handleChange} onBlur={handleBlur} error={!!fieldErrors.BankBranch} helperText={fieldErrors.BankBranch} sx={inputStyle} /></Box>
//                 </Grid>
//                 <Grid item xs={12} sm={6}>
//                   <Box><Typography sx={labelStyle}>IFSC CODE</Typography>
//                     <TextField fullWidth size="small" name="BankIfscCode" placeholder="SBIN0123456" value={formData.BankIfscCode} onChange={handleChange} onBlur={handleBlur} error={!!fieldErrors.BankIfscCode} helperText={fieldErrors.BankIfscCode} inputProps={{ maxLength: 11 }} sx={inputStyle} />
//                     <Typography sx={{ fontSize: '0.65rem', color: COLORS.text.tertiary }}>4 letters + 0 + 6 alphanumeric</Typography></Box>
//                 </Grid>
//                 <Grid item xs={12} sm={6}>
//                   <Box><Typography sx={labelStyle}>ACCOUNT TYPE</Typography>
//                     <TextField select fullWidth size="small" name="BankAccountType" value={formData.BankAccountType} onChange={handleChange} sx={inputStyle}>
//                       {accountTypeOptions.map(o => <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>)}
//                     </TextField></Box>
//                 </Grid>
//               </Grid>
//             </Paper>

//             <Paper sx={{ p: 2, bgcolor: '#f9fafb', borderRadius: 2, border: `1px solid ${COLORS.border}` }}>
//               <Typography sx={{ fontSize: '0.9rem', fontWeight: 600, color: COLORS.primary, mb: 1.5 }}>
//                 Emergency Contact <span style={{ fontSize: '0.7rem', fontWeight: 'normal', color: COLORS.text.tertiary }}>(All or None)</span>
//               </Typography>
//               <Grid container spacing={1.5}>
//                 <Grid item xs={12} sm={6}>
//                   <Box><Typography sx={labelStyle}>CONTACT NAME</Typography>
//                     <TextField fullWidth size="small" name="EmergencyContactName" placeholder="Jane Doe" value={formData.EmergencyContactName} onChange={handleChange} onBlur={handleBlur} error={!!fieldErrors.EmergencyContactName} helperText={fieldErrors.EmergencyContactName} sx={inputStyle} /></Box>
//                 </Grid>
//                 <Grid item xs={12} sm={6}>
//                   <Box><Typography sx={labelStyle}>RELATIONSHIP</Typography>
//                     <TextField fullWidth size="small" name="EmergencyContactRelationship" placeholder="Spouse" value={formData.EmergencyContactRelationship} onChange={handleChange} onBlur={handleBlur} error={!!fieldErrors.EmergencyContactRelationship} helperText={fieldErrors.EmergencyContactRelationship} sx={inputStyle} /></Box>
//                 </Grid>
//                 <Grid item xs={12} sm={6}>
//                   <Box><Typography sx={labelStyle}>PHONE</Typography>
//                     <TextField fullWidth size="small" name="EmergencyContactPhone" placeholder="9876543210" value={formData.EmergencyContactPhone} onChange={handleChange} onBlur={handleBlur} error={!!fieldErrors.EmergencyContactPhone} helperText={fieldErrors.EmergencyContactPhone} inputProps={{ maxLength: 10 }} sx={inputStyle} /></Box>
//                 </Grid>
//                 <Grid item xs={12} sm={6}>
//                   <Box><Typography sx={labelStyle}>PIN CODE</Typography>
//                     <TextField fullWidth size="small" name="EmergencyContactPIN" placeholder="400001" value={formData.EmergencyContactPIN} onChange={handleChange} onBlur={handleBlur} error={!!fieldErrors.EmergencyContactPIN} helperText={fieldErrors.EmergencyContactPIN} inputProps={{ maxLength: 6 }} sx={inputStyle} /></Box>
//                 </Grid>
//                 <Grid item xs={12}>
//                   <Box><Typography sx={labelStyle}>ADDRESS</Typography>
//                     <TextField fullWidth size="small" name="EmergencyContactAddress" multiline rows={2} placeholder="Enter complete address" value={formData.EmergencyContactAddress} onChange={handleChange} onBlur={handleBlur} error={!!fieldErrors.EmergencyContactAddress} helperText={fieldErrors.EmergencyContactAddress} sx={inputStyle} /></Box>
//                 </Grid>
//               </Grid>
//             </Paper>
//           </Stack>
//         );

//       default:
//         return null;
//     }
//   };

//   return (
//     <Paper sx={{ mt: 2, p: 2, bgcolor: '#ffffff', border: `1px solid ${COLORS.border}`, borderRadius: 2, width: '100%', boxSizing: 'border-box' }}>
//       <Typography sx={{ fontSize: '1rem', fontWeight: 700, color: COLORS.text.primary, mb: 2 }}>
//         {isEdit ? 'Edit Employee' : 'Add New Employee'}
//       </Typography>

//       <Stepper activeStep={activeStep} alternativeLabel connector={<ColorConnector />} sx={{ mb: 2 }}>
//         {employeeSteps.map((label) => (
//           <Step key={label}>
//             <StepLabel><Typography fontSize="0.75rem">{label}</Typography></StepLabel>
//           </Step>
//         ))}
//       </Stepper>

//       {submitError && (
//         <Alert severity="error" sx={{ mb: 2, borderRadius: 1.5 }} onClose={() => setSubmitError('')}>
//           {submitError}
//         </Alert>
//       )}

//       {renderStepContent(activeStep)}

//       <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
//         <Button
//           size="small"
//           onClick={onClose}
//           disabled={loading}
//           sx={{ fontSize: '0.7rem', textTransform: 'none' }}
//         >
//           Cancel
//         </Button>
//         <Box sx={{ display: 'flex', gap: 1 }}>
//           {activeStep > 0 && (
//             <Button
//               size="small"
//               onClick={handleBack}
//               disabled={loading}
//               startIcon={<NavigateBeforeIcon sx={{ fontSize: '1rem' }} />}
//               sx={{ fontSize: '0.7rem', textTransform: 'none' }}
//             >
//               Back
//             </Button>
//           )}
//           {activeStep === employeeSteps.length - 1 ? (
//             <Button
//               variant="contained"
//               size="small"
//               onClick={handleSubmit}
//               disabled={loading}
//               startIcon={loading ? null : (isEdit ? <EditIcon sx={{ fontSize: '1rem' }} /> : <AddIcon sx={{ fontSize: '1rem' }} />)}
//               sx={{
//                 fontSize: '0.7rem',
//                 textTransform: 'none',
//                 bgcolor: COLORS.primary,
//                 '&:hover': { bgcolor: COLORS.primaryDark }
//               }}
//             >
//               {loading ? <CircularProgress size={16} sx={{ color: COLORS.text.light }} /> : (isEdit ? 'Update Employee' : 'Add Employee')}
//             </Button>
//           ) : (
//             <Button
//               variant="contained"
//               size="small"
//               onClick={handleNext}
//               disabled={loading}
//               endIcon={<NavigateNextIcon sx={{ fontSize: '1rem' }} />}
//               sx={{
//                 fontSize: '0.7rem',
//                 textTransform: 'none',
//                 bgcolor: COLORS.primary,
//                 '&:hover': { bgcolor: COLORS.primaryDark }
//               }}
//             >
//               Next
//             </Button>
//           )}
//         </Box>
//       </Box>
//     </Paper>
//   );
// };

// const AddMIS = () => {
//   const navigate = useNavigate();

//   const [loading, setLoading] = useState(false);
//   const [savingNew, setSavingNew] = useState(false);
//   const [rmpList, setRmpList] = useState([]);
//   const [employeesList, setEmployeesList] = useState([]);
//   const [departmentsList, setDepartmentsList] = useState([]);
//   const [designationsList, setDesignationsList] = useState([]);

//   const [isRmpDropdownOpen, setIsRmpDropdownOpen] = useState(false);
//   const [rmpSearchTerm, setRmpSearchTerm] = useState('');
//   const rmpDropdownRef = useRef(null);

//   const [isEmpDropdownOpen, setIsEmpDropdownOpen] = useState(false);
//   const [empSearchTerm, setEmpSearchTerm] = useState('');
//   const empDropdownRef = useRef(null);

//   const [isDeptDropdownOpen, setIsDeptDropdownOpen] = useState(false);
//   const [deptSearchTerm, setDeptSearchTerm] = useState('');
//   const deptDropdownRef = useRef(null);

//   // Inline Add New panels, matching the existing AddMIV pattern.
//   const [showAddDepartment, setShowAddDepartment] = useState(false);
//   const [showAddEmployee, setShowAddEmployee] = useState(false);
//   const [modalError, setModalError] = useState('');
//   const [newDepartment, setNewDepartment] = useState({
//     DepartmentName: '',
//     Description: '',
//   });
//   const [formData, setFormData] = useState({
//     issue_date: new Date().toISOString().split('T')[0],
//     department: '',
//     issued_to: '',
//     rmp_id: '',
//     rmp_ref_no: '',
//     items: [{ name: '', code: '', quantity: '', unit: 'Kg' }],
//   });

//   const token = () => localStorage.getItem('token');
//   const authConfig = () => ({
//     headers: {
//       Authorization: `Bearer ${token()}`,
//       'Content-Type': 'application/json',
//     },
//   });

//   useEffect(() => {
//     fetchRMP();
//     fetchEmployees();
//     fetchDepartments();
//     fetchDesignations();

//     const handleClickOutside = (event) => {
//       if (rmpDropdownRef.current && !rmpDropdownRef.current.contains(event.target)) {
//         setIsRmpDropdownOpen(false);
//       }
//       if (empDropdownRef.current && !empDropdownRef.current.contains(event.target)) {
//         setIsEmpDropdownOpen(false);
//       }
//       if (deptDropdownRef.current && !deptDropdownRef.current.contains(event.target)) {
//         setIsDeptDropdownOpen(false);
//       }
//     };

//     document.addEventListener('mousedown', handleClickOutside);
//     return () => document.removeEventListener('mousedown', handleClickOutside);
//     // Load initial dropdown data once.
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, []);

//   const fetchRMP = async () => {
//     try {
//       const res = await axios.get(`${BASE_URL}/api/rm-purchase?limit=100`, authConfig());
//       const list = Array.isArray(res.data?.data) ? res.data.data : [];
//       const availableRmp = list.filter((purchase) => {
//         const quantity = Number(purchase.quantity || 0);
//         const used = Number(purchase.used_qty || 0);
//         let remaining = purchase.remaining_qty;
//         if (remaining === undefined || remaining === null || (Number(remaining) === 0 && used === 0)) {
//           remaining = quantity;
//         }
//         return Number(remaining) > 0;
//       });
//       setRmpList(availableRmp);
//     } catch (error) {
//       console.error('Error fetching RMP:', error);
//     }
//   };

//   // These are the same master APIs used by the Department and Employee master pages.
//   // Return the fetched records as well as updating state so a newly-created record can
//   // be selected immediately after the master API confirms it has been saved.
//   // API responses can be either an array or an object containing the array.
//   // Normalize both shapes so master records always reach the dropdown state.
//   const extractList = (responseData, possibleKeys = []) => {
//     if (Array.isArray(responseData)) return responseData;
//     if (!responseData || typeof responseData !== 'object') return [];
//     for (const key of possibleKeys) {
//       if (Array.isArray(responseData[key])) return responseData[key];
//     }
//     if (Array.isArray(responseData.data)) return responseData.data;
//     if (Array.isArray(responseData.results)) return responseData.results;
//     return [];
//   };

//   const fetchEmployees = async () => {
//     try {
//       const res = await axios.get(`${BASE_URL}/api/employees?limit=1000`, authConfig());
//       const list = extractList(res.data?.data ?? res.data, ['employees', 'data', 'results']);
//       setEmployeesList(list);
//       return list;
//     } catch (error) {
//       console.error('Error fetching employees:', error);
//       return [];
//     }
//   };

//   const fetchDepartments = async () => {
//     try {
//       // Department GET is paginated (the API may return only 5 records by default).
//       // Request a larger page first, then fetch any remaining pages if the backend
//       // still applies its default page size.
//       const firstResponse = await axios.get(
//         `${BASE_URL}/api/departments?page=1&limit=1000`,
//         authConfig()
//       );
//       const firstData = firstResponse.data || {};
//       const firstList = extractList(firstData?.data ?? firstData, [
//         'departments', 'departmentList', 'data', 'results'
//       ]);
//       const pagination = firstData.pagination || firstData.data?.pagination || {};
//       let allDepartments = [...firstList];
//       const totalPages = Number(pagination.totalPages || 1);

//       // If the server ignored limit=1000, collect every remaining page.
//       if (totalPages > 1 && allDepartments.length < Number(pagination.totalItems || Infinity)) {
//         const pageSize = Number(pagination.itemsPerPage || 5);
//         for (let page = 2; page <= totalPages; page += 1) {
//           const pageResponse = await axios.get(
//             `${BASE_URL}/api/departments?page=${page}&limit=${pageSize}`,
//             authConfig()
//           );
//           const pageData = pageResponse.data || {};
//           const pageList = extractList(pageData?.data ?? pageData, [
//             'departments', 'departmentList', 'data', 'results'
//           ]);
//           allDepartments = allDepartments.concat(pageList);
//         }
//       }

//       // Deduplicate by database ID, falling back to department name.
//       const uniqueDepartments = [];
//       const seenIds = new Set();
//       const seenNames = new Set();
//       allDepartments.forEach((department) => {
//         const id = department?._id || department?.id;
//         const name = getDepartmentName(department).trim().toLowerCase();
//         if ((id && seenIds.has(id)) || (!id && name && seenNames.has(name))) return;
//         if (id) seenIds.add(id);
//         if (name) seenNames.add(name);
//         uniqueDepartments.push(department);
//       });

//       setDepartmentsList(uniqueDepartments);
//       return uniqueDepartments;
//     } catch (error) {
//       console.error('Error fetching departments:', error);
//       return [];
//     }
//   };

//   const fetchDesignations = async () => {
//     try {
//       const res = await axios.get(`${BASE_URL}/api/designations`, authConfig());
//       const data = res.data?.data ?? res.data;
//       setDesignationsList(Array.isArray(data) ? data : []);
//     } catch (error) {
//       console.error('Error fetching designations:', error);
//     }
//   };

//   const getDepartmentName = (department) =>
//     department?.DepartmentName || department?.department_name || department?.name || '';

//   const getEmployeeName = (employee) => {
//     if (employee?.FirstName) {
//       return `${employee.FirstName} ${employee.LastName || ''}`.trim();
//     }
//     return employee?.name || employee?.EmployeeName || '';
//   };

//   const handleChange = (event) => {
//     const { name, value } = event.target;
//     setFormData((prev) => ({ ...prev, [name]: value }));
//   };

//   const handleSelectRmp = (selectedRmp) => {
//     const availableQty =
//       selectedRmp.remaining_qty !== undefined && selectedRmp.remaining_qty !== null
//         ? selectedRmp.remaining_qty
//         : selectedRmp.quantity;

//     setFormData((prev) => ({
//       ...prev,
//       rmp_id: selectedRmp._id,
//       rmp_ref_no: selectedRmp.ref_no || '',
//       issue_date: new Date().toISOString().split('T')[0],
//       items: [
//         {
//           rm_id: selectedRmp._id,
//           name: selectedRmp.name || '',
//           code: selectedRmp.code || '',
//           quantity: availableQty ?? '',
//           unit: selectedRmp.unit || 'Kg',
//         },
//       ],
//     }));
//     setIsRmpDropdownOpen(false);
//     setRmpSearchTerm('');
//   };

//   const handleItemChange = (index, field, value) => {
//     setFormData((prev) => ({
//       ...prev,
//       items: prev.items.map((item, itemIndex) =>
//         itemIndex === index ? { ...item, [field]: value } : item
//       ),
//     }));
//   };

//   const openAddDepartment = () => {
//     setModalError('');
//     setNewDepartment({ DepartmentName: '', Description: '' });
//     setShowAddDepartment((visible) => !visible);
//     setShowAddEmployee(false);
//     setIsDeptDropdownOpen(false);
//     setIsEmpDropdownOpen(false);
//   };

//   const openAddEmployee = () => {
//     setModalError('');
//     setShowAddEmployee(true);
//     setShowAddDepartment(false);
//     setIsDeptDropdownOpen(false);
//     setIsEmpDropdownOpen(false);
//   };

//   const handleEmployeeAdded = async (createdEmployee) => {
//     if (!createdEmployee) return;

//     // InlineEmployeeForm posts to the same /api/employees endpoint as Employee Master.
//     // Refresh from the master API so the dropdown uses the server-saved record, not
//     // only a temporary frontend item.
//     const refreshedEmployees = await fetchEmployees();
//     const employeeId = createdEmployee._id || createdEmployee.id;
//     const savedEmployee =
//       refreshedEmployees.find((employee) => employee._id === employeeId || employee.id === employeeId) ||
//       createdEmployee;
//     const savedEmployeeName = getEmployeeName(savedEmployee);

//     // Keep the saved record in the dropdown even if the GET response has a short delay.
//     setEmployeesList((previous) => {
//       const id = savedEmployee._id || savedEmployee.id;
//       const exists = previous.some((employee) => (employee._id || employee.id) === id);
//       return exists
//         ? previous.map((employee) => ((employee._id || employee.id) === id ? savedEmployee : employee))
//         : [...previous, savedEmployee];
//     });

//     const departmentId =
//       typeof savedEmployee.DepartmentID === 'object'
//         ? savedEmployee.DepartmentID?._id
//         : savedEmployee.DepartmentID;
//     const refreshedDepartments = await fetchDepartments();
//     const selectedDepartment = refreshedDepartments.find((department) => department._id === departmentId)
//       || departmentsList.find((department) => department._id === departmentId);

//     setFormData((previous) => ({
//       ...previous,
//       issued_to: savedEmployeeName,
//       department:
//         getDepartmentName(selectedDepartment) ||
//         (typeof savedEmployee.DepartmentID === 'object'
//           ? getDepartmentName(savedEmployee.DepartmentID)
//           : previous.department),
//     }));

//     setShowAddEmployee(false);
//     setModalError('');
//     setIsEmpDropdownOpen(false);
//     setEmpSearchTerm('');
//   };

//   const handleCreateDepartment = async (event) => {
//     event.preventDefault();
//     const name = newDepartment.DepartmentName.trim();

//     if (!name) {
//       setModalError('Department name is required.');
//       return;
//     }
//     if (name.length < 2) {
//       setModalError('Department name must be at least 2 characters.');
//       return;
//     }
//     if (departmentsList.some((department) => getDepartmentName(department).toLowerCase() === name.toLowerCase())) {
//       setModalError('This department already exists.');
//       return;
//     }

//     setSavingNew(true);
//     setModalError('');
//     try {
//       const payload = {
//         DepartmentName: name,
//         Description: newDepartment.Description || '',
//       };
//       const response = await axios.post(`${BASE_URL}/api/departments`, payload, authConfig());
//       if (response.data?.success === false) {
//         throw new Error(response.data?.message || 'Failed to add department.');
//       }

//       // Some versions of the API return { success, data: department }, while
//       // others wrap the record one level deeper. Do not depend on the response
//       // body alone: re-fetch the department master after a successful POST.
//       const body = response.data;
//       const candidate = body?.data?.department || body?.data?.data || body?.department || body?.data || body;
//       const refreshedDepartments = await fetchDepartments();
//       const candidateId = candidate?._id || candidate?.id;
//       const savedDepartment =
//         refreshedDepartments.find((department) =>
//           (candidateId && (department._id === candidateId || department.id === candidateId)) ||
//           getDepartmentName(department).trim().toLowerCase() === name.toLowerCase()
//         ) || {
//           ...(candidate && typeof candidate === 'object' ? candidate : {}),
//           DepartmentName: getDepartmentName(candidate) || name,
//           Description: candidate?.Description ?? payload.Description,
//         };

//       // Always merge the newly saved master record into the live dropdown list.
//       // This also handles APIs whose GET endpoint is briefly stale after POST.
//       setDepartmentsList((previous) => {
//         const id = savedDepartment._id || savedDepartment.id;
//         const existingIndex = previous.findIndex((department) =>
//           (id && (department._id || department.id) === id) ||
//           getDepartmentName(department).trim().toLowerCase() === name.toLowerCase()
//         );
//         if (existingIndex >= 0) {
//           return previous.map((department, index) => index === existingIndex ? { ...department, ...savedDepartment } : department);
//         }
//         return [...previous, savedDepartment];
//       });

//       setFormData((previous) => ({ ...previous, department: getDepartmentName(savedDepartment) || name }));
//       setShowAddDepartment(false);
//       setIsDeptDropdownOpen(false);
//       setDeptSearchTerm('');
//       setNewDepartment({ DepartmentName: '', Description: '' });
//       setModalError('');
//     } catch (error) {
//       console.error('Error creating department:', error);
//       setModalError(error.response?.data?.message || error.message || 'Could not add department. Please check the department API.');
//     } finally {
//       setSavingNew(false);
//     }
//   };

//   const handleSubmit = async (event) => {
//     event.preventDefault();

//     if (!formData.rmp_id) {
//       alert('Please select a Purchase Reference (RMP).');
//       return;
//     }
//     if (!formData.department || !formData.issued_to) {
//       alert('Please select a Department and Issued To employee.');
//       return;
//     }

//     setLoading(true);
//     try {
//       const firstItem = formData.items[0] || {};
//       const payload = {
//         ...formData,
//         material_name: firstItem.name,
//         material_code: firstItem.code,
//         quantity: firstItem.quantity,
//         unit: firstItem.unit,
//         purchase_id: formData.rmp_id,
//         raw_material: formData.rmp_id,
//       };

//       await axios.post(`${BASE_URL}/api/material-issue-slip`, payload, authConfig());
//       navigate('/inventorymanagement/mis');
//     } catch (error) {
//       alert(error.response?.data?.message || 'Could not save the Material Issue Slip.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const filteredRmp = useMemo(
//     () =>
//       rmpList.filter((rmp) =>
//         `${rmp.ref_no || ''} ${rmp.name || ''}`
//           .toLowerCase()
//           .includes(rmpSearchTerm.toLowerCase())
//       ),
//     [rmpList, rmpSearchTerm]
//   );

//   const filteredEmployees = useMemo(
//     () =>
//       employeesList.filter((employee) =>
//         getEmployeeName(employee).toLowerCase().includes(empSearchTerm.toLowerCase())
//       ),
//     [employeesList, empSearchTerm]
//   );

//   const filteredDepartments = useMemo(
//     () =>
//       departmentsList.filter((department) =>
//         getDepartmentName(department).toLowerCase().includes(deptSearchTerm.toLowerCase())
//       ),
//     [departmentsList, deptSearchTerm]
//   );

//   const labelClass = 'block text-[11px] font-bold text-gray-500 uppercase tracking-wide mb-1.5';
//   const inputClass =
//     'w-full h-10 px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#0f4a4a] focus:border-[#0f4a4a] text-sm text-gray-800 transition-colors bg-white';
//   const secondaryButtonClass =
//     'inline-flex h-10 shrink-0 items-center justify-center gap-1.5 rounded-md border border-gray-300 bg-white px-3 text-sm font-medium text-gray-600 transition hover:border-[#0f4a4a] hover:bg-gray-50 hover:text-[#0f4a4a] disabled:cursor-not-allowed disabled:opacity-60';

//   return (
//     <div className="flex min-h-screen justify-center bg-[#F8F9FA] p-4 font-sans md:p-8">
//       <div className="w-full max-w-5xl overflow-visible rounded-xl border border-gray-200 bg-white shadow-[0_2px_10px_-3px_rgba(0,0,0,0.1)]">
//         <div className="rounded-t-xl border-b border-gray-200 bg-gray-50 px-6 py-5 md:px-8">
//           <h1 className="text-xl font-bold text-gray-800">Create Material Issue Slip</h1>
//           <p className="mt-1 text-sm text-gray-500">
//             Issue raw material to a department and generate a printable slip.
//           </p>
//         </div>

//         <form onSubmit={handleSubmit} className="space-y-8 p-5 md:p-8">
//           <section>
//             <h3 className="mb-4 border-b pb-2 text-sm font-bold text-gray-800">
//               Purchase Reference
//             </h3>
//             <div className="relative" ref={rmpDropdownRef}>
//               <label className={labelClass}>
//                 Select Purchase Ref (RMP) <span className="text-red-500">*</span>
//               </label>
//               <button
//                 type="button"
//                 aria-expanded={isRmpDropdownOpen}
//                 onClick={() => setIsRmpDropdownOpen((open) => !open)}
//                 className="flex h-10 w-full items-center justify-between rounded-md border border-gray-300 bg-white px-3 text-left transition hover:border-[#0f4a4a]"
//               >
//                 <span
//                   className={`truncate text-sm ${
//                     formData.rmp_ref_no ? 'font-semibold text-gray-800' : 'text-gray-400'
//                   }`}
//                 >
//                   {formData.rmp_ref_no
//                     ? `${formData.rmp_ref_no} - ${formData.items[0]?.name || ''}`
//                     : '-- Search or Select RMP --'}
//                 </span>
//                 <ChevronDown size={16} className="ml-2 shrink-0 text-gray-500" />
//               </button>

//               {isRmpDropdownOpen && (
//                 <div className="absolute z-30 mt-1 flex max-h-64 w-full flex-col overflow-hidden rounded-lg border border-gray-200 bg-white shadow-xl">
//                   <div className="sticky top-0 border-b border-gray-100 bg-white p-2">
//                     <div className="relative">
//                       <Search
//                         size={14}
//                         className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
//                       />
//                       <input
//                         type="text"
//                         placeholder="Search RMP Ref or Material Name..."
//                         value={rmpSearchTerm}
//                         onChange={(event) => setRmpSearchTerm(event.target.value)}
//                         className="h-9 w-full rounded border border-gray-200 bg-gray-50 pl-8 pr-3 text-sm focus:outline-none focus:ring-1 focus:ring-[#0f4a4a]"
//                       />
//                     </div>
//                   </div>
//                   <div className="flex-1 overflow-y-auto">
//                     {filteredRmp.length === 0 ? (
//                       <div className="p-4 text-center text-sm text-gray-500">No RMP found</div>
//                     ) : (
//                       filteredRmp.map((rmp) => (
//                         <button
//                           type="button"
//                           key={rmp._id}
//                           onClick={() => handleSelectRmp(rmp)}
//                           className="w-full border-b border-gray-50 px-4 py-2 text-left last:border-0 hover:bg-[#F0FDF9]"
//                         >
//                           <div className="text-sm font-semibold text-gray-800">
//                             {rmp.ref_no} - {rmp.name}
//                           </div>
//                           <div className="text-xs text-gray-500">
//                             Remaining: {rmp.remaining_qty ?? rmp.quantity} {rmp.unit}
//                           </div>
//                         </button>
//                       ))
//                     )}
//                   </div>
//                 </div>
//               )}
//             </div>
//           </section>

//           <section>
//             <h3 className="mb-4 border-b pb-2 text-sm font-bold text-gray-800">Issue Details</h3>
//             <div className="grid grid-cols-1 gap-5 md:grid-cols-3 md:gap-6">
//               <div>
//                 <label className={labelClass}>
//                   Issue Date <span className="text-red-500">*</span>
//                 </label>
//                 <input
//                   type="date"
//                   name="issue_date"
//                   required
//                   value={formData.issue_date}
//                   onChange={handleChange}
//                   className={inputClass}
//                 />
//               </div>

//               <div className="min-w-0">
//                 <label className={labelClass}>
//                   Department <span className="text-red-500">*</span>
//                 </label>
//                 <div className="flex gap-2">
//                   <div className="relative min-w-0 flex-1" ref={deptDropdownRef}>
//                     <button
//                       type="button"
//                       aria-expanded={isDeptDropdownOpen}
//                       onClick={() => {
//                         setIsDeptDropdownOpen((open) => !open);
//                         setIsEmpDropdownOpen(false);
//                       }}
//                       className="flex h-10 w-full items-center justify-between rounded-md border border-gray-300 bg-white px-3 text-left hover:border-[#0f4a4a]"
//                     >
//                       <span
//                         className={`truncate text-sm ${
//                           formData.department ? 'font-semibold text-gray-800' : 'text-gray-500'
//                         }`}
//                       >
//                         {formData.department || '-- Select --'}
//                       </span>
//                       <ChevronDown size={16} className="ml-2 shrink-0 text-gray-500" />
//                     </button>
//                     {isDeptDropdownOpen && (
//                       <div className="absolute z-30 mt-1 max-h-56 w-full overflow-hidden rounded-lg border border-gray-200 bg-white shadow-xl">
//                         <div className="border-b border-gray-100 p-2">
//                           <input
//                             type="text"
//                             placeholder="Search department..."
//                             value={deptSearchTerm}
//                             onChange={(event) => setDeptSearchTerm(event.target.value)}
//                             className="h-9 w-full rounded border border-gray-200 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-[#0f4a4a]"
//                           />
//                         </div>
//                         <div className="max-h-44 overflow-y-auto">
//                           {filteredDepartments.length === 0 ? (
//                             <p className="p-3 text-sm text-gray-500">No departments found</p>
//                           ) : (
//                             filteredDepartments.map((department) => (
//                               <button
//                                 type="button"
//                                 key={department._id}
//                                 onClick={() => {
//                                   setFormData((prev) => ({
//                                     ...prev,
//                                     department: getDepartmentName(department),
//                                   }));
//                                   setIsDeptDropdownOpen(false);
//                                   setDeptSearchTerm('');
//                                 }}
//                                 className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100"
//                               >
//                                 {getDepartmentName(department)}
//                               </button>
//                             ))
//                           )}
//                         </div>
//                       </div>
//                     )}
//                   </div>
//                   <button
//                     type="button"
//                     onClick={openAddDepartment}
//                     className={secondaryButtonClass}
//                     title="Add new department"
//                   >
//                     {showAddDepartment ? <X size={15} /> : <Plus size={15} />}
//                     <span>{showAddDepartment ? 'Cancel' : 'Add New'}</span>
//                   </button>
//                 </div>
//               </div>

//               <div className="min-w-0">
//                 <label className={labelClass}>
//                   Issued To <span className="text-red-500">*</span>
//                 </label>
//                 <div className="flex gap-2">
//                   <div className="relative min-w-0 flex-1" ref={empDropdownRef}>
//                     <button
//                       type="button"
//                       aria-expanded={isEmpDropdownOpen}
//                       onClick={() => {
//                         setIsEmpDropdownOpen((open) => !open);
//                         setIsDeptDropdownOpen(false);
//                       }}
//                       className="flex h-10 w-full items-center justify-between rounded-md border border-gray-300 bg-white px-3 text-left hover:border-[#0f4a4a]"
//                     >
//                       <span
//                         className={`truncate text-sm ${
//                           formData.issued_to ? 'font-semibold text-gray-800' : 'text-gray-500'
//                         }`}
//                       >
//                         {formData.issued_to || '-- Select --'}
//                       </span>
//                       <ChevronDown size={16} className="ml-2 shrink-0 text-gray-500" />
//                     </button>
//                     {isEmpDropdownOpen && (
//                       <div className="absolute z-30 mt-1 max-h-56 w-full overflow-hidden rounded-lg border border-gray-200 bg-white shadow-xl">
//                         <div className="border-b border-gray-100 p-2">
//                           <input
//                             type="text"
//                             placeholder="Search employee..."
//                             value={empSearchTerm}
//                             onChange={(event) => setEmpSearchTerm(event.target.value)}
//                             className="h-9 w-full rounded border border-gray-200 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-[#0f4a4a]"
//                           />
//                         </div>
//                         <div className="max-h-44 overflow-y-auto">
//                           {filteredEmployees.length === 0 ? (
//                             <p className="p-3 text-sm text-gray-500">No employees found</p>
//                           ) : (
//                             filteredEmployees.map((employee) => (
//                               <button
//                                 type="button"
//                                 key={employee._id}
//                                 onClick={() => {
//                                   setFormData((prev) => ({
//                                     ...prev,
//                                     issued_to: getEmployeeName(employee),
//                                   }));
//                                   setIsEmpDropdownOpen(false);
//                                   setEmpSearchTerm('');
//                                 }}
//                                 className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100"
//                               >
//                                 {getEmployeeName(employee)}
//                               </button>
//                             ))
//                           )}
//                         </div>
//                       </div>
//                     )}
//                   </div>
//                   <button
//                     type="button"
//                     onClick={openAddEmployee}
//                     className={secondaryButtonClass}
//                     title="Add new employee"
//                   >
//                     {showAddEmployee ? <X size={15} /> : <Plus size={15} />}
//                     <span>{showAddEmployee ? 'Cancel' : 'Add New'}</span>
//                   </button>
//                 </div>
//               </div>
//             </div>

//             {/* Full employee form displayed inline, matching AddMRV (not a popup/modal). */}
//             {showAddEmployee && (
//               <div className="mt-4">
//                 <InlineEmployeeForm
//                   onClose={() => setShowAddEmployee(false)}
//                   onSave={handleEmployeeAdded}
//                   onUpdate={handleEmployeeAdded}
//                   departments={departmentsList}
//                   designations={designationsList}
//                   loadingData={false}
//                 />
//               </div>
//             )}

//             {/* Inline Department form, following the AddMIV interaction pattern */}
//             {showAddDepartment && (
//               <form onSubmit={handleCreateDepartment} className="mt-4 rounded-lg border border-gray-200 bg-gray-50 p-4">
//                 <h4 className="mb-3 text-sm font-semibold text-[#0f4a4a]">Add New Department</h4>
//                 <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
//                   <div>
//                     <label className={labelClass}>Department Name <span className="text-red-500">*</span></label>
//                     <input
//                       required
//                       value={newDepartment.DepartmentName}
//                       onChange={(event) => setNewDepartment((prev) => ({ ...prev, DepartmentName: event.target.value }))}
//                       className={inputClass}
//                       placeholder="Department name"
//                     />
//                   </div>
//                   <div>
//                     <label className={labelClass}>Description</label>
//                     <input
//                       value={newDepartment.Description}
//                       onChange={(event) => setNewDepartment((prev) => ({ ...prev, Description: event.target.value }))}
//                       className={inputClass}
//                       placeholder="Optional description"
//                     />
//                   </div>
//                 </div>
//                 {modalError && showAddDepartment && (
//                   <p role="alert" className="mt-3 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{modalError}</p>
//                 )}
//                 <div className="mt-3 flex justify-end gap-2">
//                   <button type="button" disabled={savingNew} onClick={() => { setShowAddDepartment(false); setModalError(''); }} className="h-9 rounded-md border border-gray-300 bg-white px-4 text-sm text-gray-600 hover:bg-gray-100">Cancel</button>
//                   <button type="submit" disabled={savingNew} className="h-9 rounded-md bg-[#0f4a4a] px-4 text-sm font-semibold text-white hover:bg-[#0a3636] disabled:opacity-60">{savingNew ? 'Saving...' : 'Add Department'}</button>
//                 </div>
//               </form>
//             )}


//           </section>

//           <section>
//             <h3 className="mb-4 border-b pb-2 text-sm font-bold text-gray-800">Issued Items</h3>
//             <div className="overflow-x-auto rounded-lg border border-gray-200 bg-gray-50 p-2">
//               <table className="w-full min-w-[600px] border-collapse text-left">
//                 <thead className="bg-[#F8F9FA] text-[11px] font-bold uppercase tracking-wider text-gray-600">
//                   <tr>
//                     <th className="px-3 py-2">RM Name</th>
//                     <th className="w-40 px-3 py-2">Code</th>
//                     <th className="w-28 px-3 py-2">Qty</th>
//                     <th className="w-28 px-3 py-2">Unit</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {formData.items.map((item, index) => (
//                     <tr key={index}>
//                       <td className="p-2">
//                         <input
//                           type="text"
//                           required
//                           value={item.name}
//                           readOnly
//                           className={`${inputClass} bg-gray-50`}
//                         />
//                       </td>
//                       <td className="p-2">
//                         <input
//                           type="text"
//                           required
//                           value={item.code}
//                           readOnly
//                           className={`${inputClass} bg-gray-50`}
//                         />
//                       </td>
//                       <td className="p-2">
//                         <input
//                           type="number"
//                           required
//                           min="0.01"
//                           step="any"
//                           value={item.quantity}
//                           onChange={(event) =>
//                             handleItemChange(index, 'quantity', event.target.value)
//                           }
//                           className={inputClass}
//                         />
//                       </td>
//                       <td className="p-2">
//                         <select
//                           value={item.unit}
//                           onChange={(event) => handleItemChange(index, 'unit', event.target.value)}
//                           className={`${inputClass} cursor-pointer`}
//                         >
//                           {['Kg', 'Nos', 'Meter', 'Set', 'Piece', 'Sheet', 'Roll'].map((unit) => (
//                             <option key={unit} value={unit}>
//                               {unit}
//                             </option>
//                           ))}
//                         </select>
//                       </td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>
//           </section>

//           <div className="mt-8 flex flex-col-reverse items-stretch justify-between gap-3 border-t border-gray-200 pt-6 sm:flex-row sm:items-center">
//             <button
//               type="button"
//               onClick={() => navigate(-1)}
//               className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-semibold text-gray-600 transition hover:bg-gray-50"
//             >
//               <ArrowLeft size={16} /> Back
//             </button>
//             <button
//               type="submit"
//               disabled={loading}
//               className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#0f4a4a] px-6 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-[#0a3636] disabled:cursor-not-allowed disabled:opacity-50"
//             >
//               <Save size={18} />
//               {loading ? 'Saving...' : 'Save & Generate Slip'}
//             </button>
//           </div>
//         </form>
//       </div>

//     </div>
//   );
// };

// export default AddMIS;


import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  ArrowLeft,
  Save,
  Search,
  ChevronDown,
  Plus,
  X,
} from 'lucide-react';
import BASE_URL from '../../../config/Config';
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  CircularProgress,
  Grid,
  MenuItem,
  Paper,
  Stack,
  Step,
  StepConnector,
  StepLabel,
  Stepper,
  TextField,
  Typography,
  styled,
  stepConnectorClasses,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  NavigateBefore as NavigateBeforeIcon,
  NavigateNext as NavigateNextIcon,
} from '@mui/icons-material';

const COLORS = {
  primary: '#063C3F',
  primaryLight: '#E8F0F1',
  primaryDark: '#05292B',
  text: { primary: '#151C26', secondary: '#4B5568', tertiary: '#94A3B8', light: '#FFFFFF' },
  background: { white: '#FFFFFF', light: '#F8FFFC' },
  border: '#E3E8EF',
};
const employeeSteps = ['Personal Info', 'Employment', 'Pay & Work', 'Bank & Emergency'];
const ColorConnector = styled(StepConnector)(() => ({
  [`&.${stepConnectorClasses.active} .${stepConnectorClasses.line}`]: {
    backgroundImage: 'linear-gradient(135deg, #063C3F 0%, #00B4D8 50%, #05292B 100%)',
  },
  [`&.${stepConnectorClasses.completed} .${stepConnectorClasses.line}`]: {
    backgroundImage: 'linear-gradient(135deg, #063C3F 0%, #00B4D8 50%, #05292B 100%)',
  },
  [`& .${stepConnectorClasses.line}`]: {
    height: 3,
    border: 0,
    backgroundColor: '#eaeaf0',
    borderRadius: 1,
  },
}));

const InlineEmployeeForm = ({
  onClose,
  onSave,
  onUpdate,
  initialData = null,
  isEdit = false,
  departments = [],
  designations = [],
  loadingData = false
}) => {
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const [formData, setFormData] = useState({
    FirstName: '',
    LastName: '',
    Gender: 'M',
    DateOfBirth: '',
    Email: '',
    Phone: '',
    Address: '',
    DepartmentID: '',
    DesignationID: '',
    DateOfJoining: '',
    EmploymentType: 'Monthly',
    ContractCompany: '',
    PayStructureType: 'Fixed',
    BasicSalary: '',
    HourlyRate: '',
    OvertimeRateMultiplier: '1.5',
    SkillLevel: '',
    WorkStation: '',
    LineNumber: '',
    PAN: '',
    AadharNumber: '',
    PFNumber: '',
    UAN: '',
    ESINumber: '',
    BankAccountNumber: '',
    BankAccountHolderName: '',
    BankName: '',
    BankBranch: '',
    BankIfscCode: '',
    BankAccountType: 'Savings',
    EmergencyContactName: '',
    EmergencyContactRelationship: '',
    EmergencyContactPhone: '',
    EmergencyContactAddress: '',
    EmergencyContactPIN: ''
  });

  const [fieldErrors, setFieldErrors] = useState({});
  const [touched, setTouched] = useState({});

  // Pre‑fill form when initialData changes
  useEffect(() => {
    if (initialData) {
      setFormData({
        FirstName: initialData.FirstName || '',
        LastName: initialData.LastName || '',
        Gender: initialData.Gender || 'M',
        DateOfBirth: initialData.DateOfBirth || '',
        Email: initialData.Email || '',
        Phone: initialData.Phone || '',
        Address: initialData.Address || '',
        DepartmentID: initialData.DepartmentID?._id || initialData.DepartmentID || '',
        DesignationID: initialData.DesignationID?._id || initialData.DesignationID || '',
        DateOfJoining: initialData.DateOfJoining || '',
        EmploymentType: initialData.EmploymentType || 'Monthly',
        ContractCompany: initialData.ContractCompany || '',
        PayStructureType: initialData.PayStructureType || 'Fixed',
        BasicSalary: initialData.BasicSalary || '',
        HourlyRate: initialData.HourlyRate || '',
        OvertimeRateMultiplier: initialData.OvertimeRateMultiplier || '1.5',
        SkillLevel: initialData.SkillLevel || '',
        WorkStation: initialData.WorkStation || '',
        LineNumber: initialData.LineNumber || '',
        PAN: initialData.PAN || '',
        AadharNumber: initialData.AadharNumber || '',
        PFNumber: initialData.PFNumber || '',
        UAN: initialData.UAN || '',
        ESINumber: initialData.ESINumber || '',
        BankAccountNumber: initialData.BankDetails?.accountNumber || '',
        BankAccountHolderName: initialData.BankDetails?.accountHolderName || '',
        BankName: initialData.BankDetails?.bankName || '',
        BankBranch: initialData.BankDetails?.branch || '',
        BankIfscCode: initialData.BankDetails?.ifscCode || '',
        BankAccountType: initialData.BankDetails?.accountType || 'Savings',
        EmergencyContactName: initialData.EmergencyContact?.name || '',
        EmergencyContactRelationship: initialData.EmergencyContact?.relationship || '',
        EmergencyContactPhone: initialData.EmergencyContact?.phone || '',
        EmergencyContactAddress: initialData.EmergencyContact?.address || '',
        EmergencyContactPIN: initialData.EmergencyContact?.pinCode || ''
      });
      // Reset errors and touched
      setFieldErrors({});
      setTouched({});
      setActiveStep(0);
      setSubmitError('');
    }
  }, [initialData]);

  // Options (same as AddEmployees)
  const genderOptions = [
    { value: 'M', label: 'Male' },
    { value: 'F', label: 'Female' },
    { value: 'O', label: 'Other' }
  ];
  const employmentTypeOptions = [
    { value: 'Monthly', label: 'Monthly' },
    { value: 'Hourly', label: 'Hourly' },
    { value: 'PieceRate', label: 'Piece Rate' },
    { value: 'contract-based', label: 'Contract-Based' }
  ];
  const contractCompanyOptions = [
    { value: 'DISTIL', label: 'DISTIL' },
    { value: 'AARADHYA', label: 'AARADHYA' },
    { value: 'MAHI', label: 'MAHI' }
  ];
  const payStructureOptions = [
    { value: 'Fixed', label: 'Fixed' },
    { value: 'Variable', label: 'Variable' },
    { value: 'Commission', label: 'Commission' },
    { value: 'PieceRate', label: 'Piece Rate' }
  ];
  const skillLevelOptions = [
    { value: 'Unskilled', label: 'Unskilled' },
    { value: 'Semi-Skilled', label: 'Semi-Skilled' },
    { value: 'Skilled', label: 'Skilled' },
    { value: 'Highly Skilled', label: 'Highly Skilled' }
  ];
  const accountTypeOptions = [
    { value: 'Savings', label: 'Savings' },
    { value: 'Current', label: 'Current' },
    { value: 'Salary', label: 'Salary' }
  ];

  // Validation functions (same as AddEmployees)
  const validateEmail = (email) => /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email);
  const validatePhone = (phone) => {
    const clean = phone.replace(/\D/g, '');
    return clean === '' || /^[6-9]\d{9}$/.test(clean);
  };
  const validateName = (name) => /^[A-Za-z\s.'-]+$/.test(name);
  const validateAddress = (address) => /^[A-Za-z0-9\s,.#\-/]+$/.test(address);
  const validatePAN = (pan) => /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(pan);
  const validateAadhar = (aadhar) => /^\d{12}$/.test(aadhar);
  const validatePF = (pf) => /^[A-Z]{2}\/\d{5}\/\d{7}$/.test(pf);
  const validateUAN = (uan) => /^\d{12}$/.test(uan);
  const validateESI = (esi) => /^\d{17}$/.test(esi);
  const validateAccount = (acc) => /^\d{9,18}$/.test(acc);
  const validateIFSC = (ifsc) => /^[A-Z]{4}0[A-Z0-9]{6}$/.test(ifsc);
  const validatePIN = (pin) => /^\d{6}$/.test(pin);
  const validateBankName = (bank) => /^[A-Za-z\s.'&-]+$/.test(bank);
  const validateBranch = (branch) => /^[A-Za-z0-9\s.-]+$/.test(branch);
  const validateRelation = (rel) => /^[A-Za-z\s]+$/.test(rel);
  const validateWorkStation = (ws) => /^[A-Za-z0-9\s-]+$/.test(ws);

  const validateField = (name, value) => {
    switch (name) {
      case 'FirstName':
      case 'LastName':
      case 'BankAccountHolderName':
      case 'EmergencyContactName':
        if (value && !validateName(value)) return 'Only letters, spaces, dots, hyphens';
        break;
      case 'Email':
        if (value && !validateEmail(value)) return 'Invalid email';
        break;
      case 'Phone':
      case 'EmergencyContactPhone':
        if (value && !validatePhone(value)) return '10-digit number starting with 6-9';
        break;
      case 'Address':
      case 'EmergencyContactAddress':
        if (value && !validateAddress(value)) return 'Invalid characters';
        break;
      case 'PAN':
        if (value && !validatePAN(value)) return 'Format: ABCDE1234F';
        break;
      case 'AadharNumber':
        if (value && !validateAadhar(value)) return '12 digits';
        break;
      case 'PFNumber':
        if (value && !validatePF(value)) return 'Format: XX/12345/1234567';
        break;
      case 'UAN':
        if (value && !validateUAN(value)) return '12 digits';
        break;
      case 'ESINumber':
        if (value && !validateESI(value)) return '17 digits';
        break;
      case 'BankAccountNumber':
        if (value && !validateAccount(value)) return '9-18 digits';
        break;
      case 'BankName':
        if (value && !validateBankName(value)) return 'Letters, spaces, dots, hyphens';
        break;
      case 'BankBranch':
        if (value && !validateBranch(value)) return 'Letters, numbers, spaces, dots, hyphens';
        break;
      case 'BankIfscCode':
        if (value && !validateIFSC(value)) return 'Format: ABCD0123456';
        break;
      case 'EmergencyContactRelationship':
        if (value && !validateRelation(value)) return 'Letters and spaces only';
        break;
      case 'EmergencyContactPIN':
        if (value && !validatePIN(value)) return '6 digits';
        break;
      case 'WorkStation':
      case 'LineNumber':
        if (value && !validateWorkStation(value)) return 'Letters, numbers, spaces, hyphens';
        break;
      case 'ContractCompany':
        if (formData.EmploymentType === 'contract-based' && !value) return 'Required';
        break;
      default:
        return '';
    }
    return '';
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (touched[name] || value) {
      const error = validateField(name, value);
      setFieldErrors(prev => ({ ...prev, [name]: error }));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    const error = validateField(name, value);
    setFieldErrors(prev => ({ ...prev, [name]: error }));
  };

  const handleAutocompleteChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value?._id || '' }));
    setFieldErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleEmploymentTypeChange = (e) => {
    const employmentType = e.target.value;
    let payStructure = 'Fixed';
    if (employmentType === 'PieceRate') payStructure = 'PieceRate';
    setFormData(prev => ({
      ...prev,
      EmploymentType: employmentType,
      PayStructureType: payStructure
    }));
  };

  // Step‑wise validation
  const validateStep = (step) => {
    const errors = {};
    let isValid = true;

    switch (step) {
      case 0: // Personal Info
        if (!formData.FirstName.trim()) { errors.FirstName = 'Required'; isValid = false; }
        else { const err = validateField('FirstName', formData.FirstName); if (err) { errors.FirstName = err; isValid = false; } }
        if (!formData.LastName.trim()) { errors.LastName = 'Required'; isValid = false; }
        else { const err = validateField('LastName', formData.LastName); if (err) { errors.LastName = err; isValid = false; } }
        if (!formData.Email.trim()) { errors.Email = 'Required'; isValid = false; }
        else { const err = validateField('Email', formData.Email); if (err) { errors.Email = err; isValid = false; } }
        if (formData.Phone) { const err = validateField('Phone', formData.Phone); if (err) { errors.Phone = err; isValid = false; } }
        if (formData.Address) { const err = validateField('Address', formData.Address); if (err) { errors.Address = err; isValid = false; } }
        break;

      case 1: // Employment
        if (!formData.DepartmentID) { errors.DepartmentID = 'Required'; isValid = false; }
        if (!formData.DesignationID) { errors.DesignationID = 'Required'; isValid = false; }
        if (!formData.DateOfJoining) { errors.DateOfJoining = 'Required'; isValid = false; }
        if (formData.EmploymentType === 'contract-based' && !formData.ContractCompany) {
          errors.ContractCompany = 'Required';
          isValid = false;
        }
        break;

      case 2: // Pay & Work
        if ((formData.EmploymentType === 'Monthly' || formData.EmploymentType === 'contract-based') && !formData.BasicSalary) {
          errors.BasicSalary = 'Required';
          isValid = false;
        }
        if (formData.EmploymentType === 'Hourly' && !formData.HourlyRate) {
          errors.HourlyRate = 'Required';
          isValid = false;
        }
        const taxFields = ['PAN', 'AadharNumber', 'PFNumber', 'UAN', 'ESINumber', 'WorkStation', 'LineNumber'];
        taxFields.forEach(field => {
          if (formData[field]) {
            const err = validateField(field, formData[field]);
            if (err) { errors[field] = err; isValid = false; }
          }
        });
        break;

      case 3: // Bank & Emergency
        const bankFields = ['BankAccountNumber', 'BankAccountHolderName', 'BankName', 'BankBranch', 'BankIfscCode'];
        const hasAnyBank = bankFields.some(f => formData[f]);
        if (hasAnyBank) {
          bankFields.forEach(field => {
            if (!formData[field]) {
              errors[field] = 'Required when providing bank details';
              isValid = false;
            } else {
              const err = validateField(field, formData[field]);
              if (err) { errors[field] = err; isValid = false; }
            }
          });
        }
        const emergencyFields = ['EmergencyContactName', 'EmergencyContactRelationship', 'EmergencyContactPhone', 'EmergencyContactAddress', 'EmergencyContactPIN'];
        const hasAnyEmergency = emergencyFields.some(f => formData[f]);
        if (hasAnyEmergency) {
          emergencyFields.forEach(field => {
            if (!formData[field]) {
              errors[field] = 'Required when providing emergency contact';
              isValid = false;
            } else {
              const err = validateField(field, formData[field]);
              if (err) { errors[field] = err; isValid = false; }
            }
          });
        }
        break;

      default:
        return true;
    }

    setFieldErrors(errors);
    if (!isValid) setSubmitError('Please fix the errors in this section');
    return isValid;
  };

  const handleNext = () => {
    if (validateStep(activeStep)) {
      setSubmitError('');
      setActiveStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    setSubmitError('');
    setActiveStep(prev => prev - 1);
  };

  // Submit (Create or Update)
  const handleSubmit = async () => {
    if (loading) return; // prevent duplicate submissions
    if (!validateStep(3)) return;
    setLoading(true);
    setSubmitError('');
    try {
      const token = localStorage.getItem('token');
      const payload = {
        FirstName: formData.FirstName,
        LastName: formData.LastName,
        Gender: formData.Gender,
        DateOfBirth: formData.DateOfBirth || undefined,
        Email: formData.Email,
        Phone: formData.Phone || undefined,
        Address: formData.Address || undefined,
        DepartmentID: formData.DepartmentID,
        DesignationID: formData.DesignationID,
        DateOfJoining: formData.DateOfJoining,
        EmploymentType: formData.EmploymentType,
        PayStructureType: formData.PayStructureType,
        ContractCompany: formData.ContractCompany || undefined,
        BasicSalary: (formData.EmploymentType === 'Monthly' || formData.EmploymentType === 'contract-based') ? Number(formData.BasicSalary || 0) : 0,
        HourlyRate: formData.EmploymentType === 'Hourly' ? Number(formData.HourlyRate || 0) : 0,
        OvertimeRateMultiplier: Number(formData.OvertimeRateMultiplier || 1.5),
        SkillLevel: formData.SkillLevel || undefined,
        WorkStation: formData.WorkStation || undefined,
        LineNumber: formData.LineNumber || undefined,
        PAN: formData.PAN || undefined,
        AadharNumber: formData.AadharNumber || undefined,
        PFNumber: formData.PFNumber || undefined,
        UAN: formData.UAN || undefined,
        ESINumber: formData.ESINumber || undefined,
        EmploymentStatus: 'active'
      };
      const bankFields = ['BankAccountNumber', 'BankAccountHolderName', 'BankName', 'BankBranch', 'BankIfscCode'];
      const hasAnyBank = bankFields.some(f => formData[f]);
      if (hasAnyBank) {
        payload.BankDetails = {
          accountNumber: formData.BankAccountNumber,
          accountHolderName: formData.BankAccountHolderName,
          bankName: formData.BankName,
          branch: formData.BankBranch,
          ifscCode: formData.BankIfscCode,
          accountType: formData.BankAccountType
        };
      }
      const emergencyFields = ['EmergencyContactName', 'EmergencyContactRelationship', 'EmergencyContactPhone', 'EmergencyContactAddress', 'EmergencyContactPIN'];
      const hasAnyEmergency = emergencyFields.some(f => formData[f]);
      if (hasAnyEmergency) {
        payload.EmergencyContact = {
          name: formData.EmergencyContactName,
          relationship: formData.EmergencyContactRelationship,
          phone: formData.EmergencyContactPhone,
          address: formData.EmergencyContactAddress,
          pinCode: formData.EmergencyContactPIN
        };
      }
      Object.keys(payload).forEach(key => payload[key] === undefined && delete payload[key]);

      let response;
      if (isEdit && initialData?._id) {
        // Update existing employee
        response = await axios.put(`${BASE_URL}/api/employees/${initialData._id}`, payload, {
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
        });
      } else {
        // Create new employee
        response = await axios.post(`${BASE_URL}/api/employees`, payload, {
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
        });
      }
      if (response.data.success) {
        if (isEdit && initialData?._id) {
          if (onUpdate) await onUpdate(response.data.data);
        } else {
          if (onSave) await onSave(response.data.data);
        }
      } else {
        setSubmitError(response.data.message || 'Operation failed');
      }
    } catch (err) {
      console.error('Error saving employee:', err);
      setSubmitError(err.response?.data?.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Styles
  const inputStyle = {
    '& .MuiOutlinedInput-root': {
      borderRadius: 1.5,
      fontSize: '0.75rem',
      '&:hover fieldset': { borderColor: COLORS.primary },
      '&.Mui-focused fieldset': { borderColor: COLORS.primary, borderWidth: 1 }
    },
    '& .MuiInputBase-input': {
      py: 1,
      px: 1.5,
      fontSize: '0.75rem',
      color: COLORS.text.primary,
      '&::placeholder': {
        color: COLORS.text.tertiary,
        fontSize: '0.75rem'
      }
    }
  };
  const labelStyle = {
    fontSize: '0.7rem',
    fontWeight: 600,
    color: COLORS.text.secondary,
    letterSpacing: '0.5px',
    mb: 0.5
  };

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Stack spacing={2}>
            <Paper sx={{ p: 2, bgcolor: '#f9fafb', borderRadius: 2, border: `1px solid ${COLORS.border}` }}>
              <Typography sx={{ fontSize: '0.9rem', fontWeight: 600, color: COLORS.primary, mb: 1.5 }}>
                Personal Information
              </Typography>
              <Grid container spacing={1.5}>
                <Grid item xs={12} sm={6}>
                  <Box><Typography sx={labelStyle}>FIRST NAME <span style={{ color: '#EF4444' }}>*</span></Typography>
                    <TextField fullWidth size="small" name="FirstName" placeholder="e.g., John" value={formData.FirstName} onChange={handleChange} onBlur={handleBlur} error={!!fieldErrors.FirstName} helperText={fieldErrors.FirstName} sx={inputStyle} /></Box>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Box><Typography sx={labelStyle}>LAST NAME <span style={{ color: '#EF4444' }}>*</span></Typography>
                    <TextField fullWidth size="small" name="LastName" placeholder="e.g., Doe" value={formData.LastName} onChange={handleChange} onBlur={handleBlur} error={!!fieldErrors.LastName} helperText={fieldErrors.LastName} sx={inputStyle} /></Box>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Box><Typography sx={labelStyle}>GENDER</Typography>
                    <TextField select fullWidth size="small" name="Gender" value={formData.Gender} onChange={handleChange} sx={inputStyle}>
                      {genderOptions.map(o => <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>)}
                    </TextField></Box>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Box><Typography sx={labelStyle}>DATE OF BIRTH</Typography>
                    <TextField fullWidth size="small" name="DateOfBirth" type="date" value={formData.DateOfBirth} onChange={handleChange} InputLabelProps={{ shrink: true }} sx={inputStyle} /></Box>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Box><Typography sx={labelStyle}>EMAIL <span style={{ color: '#EF4444' }}>*</span></Typography>
                    <TextField fullWidth size="small" name="Email" placeholder="john.doe@company.com" value={formData.Email} onChange={handleChange} onBlur={handleBlur} error={!!fieldErrors.Email} helperText={fieldErrors.Email} sx={inputStyle} />
                    <Typography sx={{ fontSize: '0.65rem', color: COLORS.text.tertiary }}>e.g., john.doe@company.com</Typography></Box>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Box><Typography sx={labelStyle}>PHONE</Typography>
                    <TextField fullWidth size="small" name="Phone" placeholder="9876543210" value={formData.Phone} onChange={handleChange} onBlur={handleBlur} error={!!fieldErrors.Phone} helperText={fieldErrors.Phone} inputProps={{ maxLength: 10 }} sx={inputStyle} />
                    <Typography sx={{ fontSize: '0.65rem', color: COLORS.text.tertiary }}>10-digit number starting with 6-9</Typography></Box>
                </Grid>
                <Grid item xs={12}>
                  <Box><Typography sx={labelStyle}>ADDRESS</Typography>
                    <TextField fullWidth size="small" name="Address" multiline rows={2} placeholder="Enter complete address" value={formData.Address} onChange={handleChange} onBlur={handleBlur} error={!!fieldErrors.Address} helperText={fieldErrors.Address} sx={inputStyle} /></Box>
                </Grid>
              </Grid>
            </Paper>
          </Stack>
        );

      case 1:
        return (
          <Stack spacing={2}>
            <Paper sx={{ p: 2, bgcolor: '#f9fafb', borderRadius: 2, border: `1px solid ${COLORS.border}` }}>
              <Typography sx={{ fontSize: '0.9rem', fontWeight: 600, color: COLORS.primary, mb: 1.5 }}>
                Employment Details
              </Typography>
              <Grid container spacing={1.5}>
                <Grid item xs={12} sm={6}>
                  <Box><Typography sx={labelStyle}>DEPARTMENT <span style={{ color: '#EF4444' }}>*</span></Typography>
                    <Autocomplete
                      options={departments}
                      getOptionLabel={(opt) => opt?.DepartmentName || ''}
                      isOptionEqualToValue={(opt, val) => opt?._id === val?._id}
                      value={departments.find(d => d._id === formData.DepartmentID) || null}
                      onChange={(e, v) => handleAutocompleteChange('DepartmentID', v)}
                      loading={loadingData}
                      renderInput={(params) => <TextField {...params} size="small" placeholder="Select department" error={!!fieldErrors.DepartmentID} helperText={fieldErrors.DepartmentID} sx={inputStyle} />}
                    /></Box>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Box><Typography sx={labelStyle}>DESIGNATION <span style={{ color: '#EF4444' }}>*</span></Typography>
                    <Autocomplete
                      options={designations}
                      getOptionLabel={(opt) => opt?.DesignationName || ''}
                      isOptionEqualToValue={(opt, val) => opt?._id === val?._id}
                      value={designations.find(d => d._id === formData.DesignationID) || null}
                      onChange={(e, v) => handleAutocompleteChange('DesignationID', v)}
                      loading={loadingData}
                      renderInput={(params) => <TextField {...params} size="small" placeholder="Select designation" error={!!fieldErrors.DesignationID} helperText={fieldErrors.DesignationID} sx={inputStyle} />}
                    /></Box>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Box><Typography sx={labelStyle}>DATE OF JOINING <span style={{ color: '#EF4444' }}>*</span></Typography>
                    <TextField fullWidth size="small" name="DateOfJoining" type="date" value={formData.DateOfJoining} onChange={handleChange} error={!!fieldErrors.DateOfJoining} helperText={fieldErrors.DateOfJoining} InputLabelProps={{ shrink: true }} sx={inputStyle} /></Box>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Box><Typography sx={labelStyle}>EMPLOYMENT TYPE <span style={{ color: '#EF4444' }}>*</span></Typography>
                    <TextField select fullWidth size="small" name="EmploymentType" value={formData.EmploymentType} onChange={handleEmploymentTypeChange} sx={inputStyle}>
                      {employmentTypeOptions.map(o => <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>)}
                    </TextField></Box>
                </Grid>
                {formData.EmploymentType === 'contract-based' && (
                  <Grid item xs={12} sm={6}>
                    <Box><Typography sx={labelStyle}>CONTRACT COMPANY <span style={{ color: '#EF4444' }}>*</span></Typography>
                      <TextField select fullWidth size="small" name="ContractCompany" value={formData.ContractCompany} onChange={handleChange} error={!!fieldErrors.ContractCompany} helperText={fieldErrors.ContractCompany} sx={inputStyle}>
                        <MenuItem value="">Select</MenuItem>
                        {contractCompanyOptions.map(o => <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>)}
                      </TextField></Box>
                  </Grid>
                )}
              </Grid>
            </Paper>
          </Stack>
        );

      case 2:
        return (
          <Stack spacing={2}>
            <Paper sx={{ p: 2, bgcolor: '#f9fafb', borderRadius: 2, border: `1px solid ${COLORS.border}` }}>
              <Typography sx={{ fontSize: '0.9rem', fontWeight: 600, color: COLORS.primary, mb: 1.5 }}>
                Pay & Work Details
              </Typography>
              <Grid container spacing={1.5}>
                <Grid item xs={12} sm={6}>
                  <Box><Typography sx={labelStyle}>PAY STRUCTURE TYPE</Typography>
                    <TextField select fullWidth size="small" name="PayStructureType" value={formData.PayStructureType} onChange={handleChange} sx={inputStyle}>
                      {payStructureOptions.map(o => <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>)}
                    </TextField></Box>
                </Grid>
                {(formData.EmploymentType === 'Monthly' || formData.EmploymentType === 'contract-based') && (
                  <Grid item xs={12} sm={6}>
                    <Box><Typography sx={labelStyle}>BASIC SALARY <span style={{ color: '#EF4444' }}>*</span></Typography>
                      <TextField fullWidth size="small" name="BasicSalary" type="number" placeholder="e.g., 25000" value={formData.BasicSalary} onChange={handleChange} error={!!fieldErrors.BasicSalary} helperText={fieldErrors.BasicSalary} inputProps={{ min: 0 }} sx={inputStyle} /></Box>
                  </Grid>
                )}
                {formData.EmploymentType === 'Hourly' && (
                  <Grid item xs={12} sm={6}>
                    <Box><Typography sx={labelStyle}>HOURLY RATE <span style={{ color: '#EF4444' }}>*</span></Typography>
                      <TextField fullWidth size="small" name="HourlyRate" type="number" placeholder="e.g., 150" value={formData.HourlyRate} onChange={handleChange} error={!!fieldErrors.HourlyRate} helperText={fieldErrors.HourlyRate} inputProps={{ min: 0, step: 0.01 }} sx={inputStyle} /></Box>
                  </Grid>
                )}
                {formData.EmploymentType !== 'PieceRate' && (
                  <>
                    <Grid item xs={12} sm={6}>
                      <Box><Typography sx={labelStyle}>OVERTIME MULTIPLIER</Typography>
                        <TextField fullWidth size="small" name="OvertimeRateMultiplier" type="number" value={formData.OvertimeRateMultiplier} onChange={handleChange} inputProps={{ step: 0.25, min: 1, max: 3 }} sx={inputStyle} /></Box>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Box><Typography sx={labelStyle}>SKILL LEVEL</Typography>
                        <TextField select fullWidth size="small" name="SkillLevel" value={formData.SkillLevel} onChange={handleChange} sx={inputStyle}>
                          <MenuItem value="">None</MenuItem>
                          {skillLevelOptions.map(o => <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>)}
                        </TextField></Box>
                    </Grid>
                  </>
                )}
                <Grid item xs={12} sm={6}>
                  <Box><Typography sx={labelStyle}>WORK STATION</Typography>
                    <TextField fullWidth size="small" name="WorkStation" placeholder="e.g., Station A" value={formData.WorkStation} onChange={handleChange} onBlur={handleBlur} error={!!fieldErrors.WorkStation} helperText={fieldErrors.WorkStation} sx={inputStyle} />
                    <Typography sx={{ fontSize: '0.65rem', color: COLORS.text.tertiary }}>Letters, numbers, spaces, hyphens</Typography></Box>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Box><Typography sx={labelStyle}>LINE NUMBER</Typography>
                    <TextField fullWidth size="small" name="LineNumber" placeholder="e.g., Line 1" value={formData.LineNumber} onChange={handleChange} onBlur={handleBlur} error={!!fieldErrors.LineNumber} helperText={fieldErrors.LineNumber} sx={inputStyle} />
                    <Typography sx={{ fontSize: '0.65rem', color: COLORS.text.tertiary }}>Letters, numbers, spaces, hyphens</Typography></Box>
                </Grid>
                <Grid item xs={12}><Typography sx={{ fontWeight: 600, color: COLORS.primary, fontSize: '0.8rem', mt: 1 }}>Tax & Identification (Optional)</Typography></Grid>
                <Grid item xs={12} sm={6}>
                  <Box><Typography sx={labelStyle}>PAN</Typography>
                    <TextField fullWidth size="small" name="PAN" placeholder="ABCDE1234F" value={formData.PAN} onChange={handleChange} onBlur={handleBlur} error={!!fieldErrors.PAN} helperText={fieldErrors.PAN} inputProps={{ maxLength: 10 }} sx={inputStyle} />
                    <Typography sx={{ fontSize: '0.65rem', color: COLORS.text.tertiary }}>5 letters + 4 numbers + 1 letter</Typography></Box>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Box><Typography sx={labelStyle}>AADHAR NUMBER</Typography>
                    <TextField fullWidth size="small" name="AadharNumber" placeholder="123456789012" value={formData.AadharNumber} onChange={handleChange} onBlur={handleBlur} error={!!fieldErrors.AadharNumber} helperText={fieldErrors.AadharNumber} inputProps={{ maxLength: 12 }} sx={inputStyle} />
                    <Typography sx={{ fontSize: '0.65rem', color: COLORS.text.tertiary }}>12 digits</Typography></Box>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Box><Typography sx={labelStyle}>PF NUMBER</Typography>
                    <TextField fullWidth size="small" name="PFNumber" placeholder="AB/12345/1234567" value={formData.PFNumber} onChange={handleChange} onBlur={handleBlur} error={!!fieldErrors.PFNumber} helperText={fieldErrors.PFNumber} sx={inputStyle} />
                    <Typography sx={{ fontSize: '0.65rem', color: COLORS.text.tertiary }}>Format: XX/12345/1234567</Typography></Box>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Box><Typography sx={labelStyle}>UAN</Typography>
                    <TextField fullWidth size="small" name="UAN" placeholder="123456789012" value={formData.UAN} onChange={handleChange} onBlur={handleBlur} error={!!fieldErrors.UAN} helperText={fieldErrors.UAN} inputProps={{ maxLength: 12 }} sx={inputStyle} />
                    <Typography sx={{ fontSize: '0.65rem', color: COLORS.text.tertiary }}>12 digits</Typography></Box>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Box><Typography sx={labelStyle}>ESI NUMBER</Typography>
                    <TextField fullWidth size="small" name="ESINumber" placeholder="12345678901234567" value={formData.ESINumber} onChange={handleChange} onBlur={handleBlur} error={!!fieldErrors.ESINumber} helperText={fieldErrors.ESINumber} inputProps={{ maxLength: 17 }} sx={inputStyle} />
                    <Typography sx={{ fontSize: '0.65rem', color: COLORS.text.tertiary }}>17 digits</Typography></Box>
                </Grid>
              </Grid>
            </Paper>
          </Stack>
        );

      case 3:
        return (
          <Stack spacing={2}>
            <Paper sx={{ p: 2, bgcolor: '#f9fafb', borderRadius: 2, border: `1px solid ${COLORS.border}` }}>
              <Typography sx={{ fontSize: '0.9rem', fontWeight: 600, color: COLORS.primary, mb: 1.5 }}>
                Bank Details <span style={{ fontSize: '0.7rem', fontWeight: 'normal', color: COLORS.text.tertiary }}>(All or None)</span>
              </Typography>
              <Grid container spacing={1.5}>
                <Grid item xs={12} sm={6}>
                  <Box><Typography sx={labelStyle}>ACCOUNT NUMBER</Typography>
                    <TextField fullWidth size="small" name="BankAccountNumber" placeholder="123456789" value={formData.BankAccountNumber} onChange={handleChange} onBlur={handleBlur} error={!!fieldErrors.BankAccountNumber} helperText={fieldErrors.BankAccountNumber} inputProps={{ maxLength: 18 }} sx={inputStyle} />
                    <Typography sx={{ fontSize: '0.65rem', color: COLORS.text.tertiary }}>9-18 digits</Typography></Box>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Box><Typography sx={labelStyle}>ACCOUNT HOLDER NAME</Typography>
                    <TextField fullWidth size="small" name="BankAccountHolderName" placeholder="John Doe" value={formData.BankAccountHolderName} onChange={handleChange} onBlur={handleBlur} error={!!fieldErrors.BankAccountHolderName} helperText={fieldErrors.BankAccountHolderName} sx={inputStyle} /></Box>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Box><Typography sx={labelStyle}>BANK NAME</Typography>
                    <TextField fullWidth size="small" name="BankName" placeholder="State Bank of India" value={formData.BankName} onChange={handleChange} onBlur={handleBlur} error={!!fieldErrors.BankName} helperText={fieldErrors.BankName} sx={inputStyle} /></Box>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Box><Typography sx={labelStyle}>BRANCH</Typography>
                    <TextField fullWidth size="small" name="BankBranch" placeholder="Main Branch" value={formData.BankBranch} onChange={handleChange} onBlur={handleBlur} error={!!fieldErrors.BankBranch} helperText={fieldErrors.BankBranch} sx={inputStyle} /></Box>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Box><Typography sx={labelStyle}>IFSC CODE</Typography>
                    <TextField fullWidth size="small" name="BankIfscCode" placeholder="SBIN0123456" value={formData.BankIfscCode} onChange={handleChange} onBlur={handleBlur} error={!!fieldErrors.BankIfscCode} helperText={fieldErrors.BankIfscCode} inputProps={{ maxLength: 11 }} sx={inputStyle} />
                    <Typography sx={{ fontSize: '0.65rem', color: COLORS.text.tertiary }}>4 letters + 0 + 6 alphanumeric</Typography></Box>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Box><Typography sx={labelStyle}>ACCOUNT TYPE</Typography>
                    <TextField select fullWidth size="small" name="BankAccountType" value={formData.BankAccountType} onChange={handleChange} sx={inputStyle}>
                      {accountTypeOptions.map(o => <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>)}
                    </TextField></Box>
                </Grid>
              </Grid>
            </Paper>

            <Paper sx={{ p: 2, bgcolor: '#f9fafb', borderRadius: 2, border: `1px solid ${COLORS.border}` }}>
              <Typography sx={{ fontSize: '0.9rem', fontWeight: 600, color: COLORS.primary, mb: 1.5 }}>
                Emergency Contact <span style={{ fontSize: '0.7rem', fontWeight: 'normal', color: COLORS.text.tertiary }}>(All or None)</span>
              </Typography>
              <Grid container spacing={1.5}>
                <Grid item xs={12} sm={6}>
                  <Box><Typography sx={labelStyle}>CONTACT NAME</Typography>
                    <TextField fullWidth size="small" name="EmergencyContactName" placeholder="Jane Doe" value={formData.EmergencyContactName} onChange={handleChange} onBlur={handleBlur} error={!!fieldErrors.EmergencyContactName} helperText={fieldErrors.EmergencyContactName} sx={inputStyle} /></Box>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Box><Typography sx={labelStyle}>RELATIONSHIP</Typography>
                    <TextField fullWidth size="small" name="EmergencyContactRelationship" placeholder="Spouse" value={formData.EmergencyContactRelationship} onChange={handleChange} onBlur={handleBlur} error={!!fieldErrors.EmergencyContactRelationship} helperText={fieldErrors.EmergencyContactRelationship} sx={inputStyle} /></Box>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Box><Typography sx={labelStyle}>PHONE</Typography>
                    <TextField fullWidth size="small" name="EmergencyContactPhone" placeholder="9876543210" value={formData.EmergencyContactPhone} onChange={handleChange} onBlur={handleBlur} error={!!fieldErrors.EmergencyContactPhone} helperText={fieldErrors.EmergencyContactPhone} inputProps={{ maxLength: 10 }} sx={inputStyle} /></Box>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Box><Typography sx={labelStyle}>PIN CODE</Typography>
                    <TextField fullWidth size="small" name="EmergencyContactPIN" placeholder="400001" value={formData.EmergencyContactPIN} onChange={handleChange} onBlur={handleBlur} error={!!fieldErrors.EmergencyContactPIN} helperText={fieldErrors.EmergencyContactPIN} inputProps={{ maxLength: 6 }} sx={inputStyle} /></Box>
                </Grid>
                <Grid item xs={12}>
                  <Box><Typography sx={labelStyle}>ADDRESS</Typography>
                    <TextField fullWidth size="small" name="EmergencyContactAddress" multiline rows={2} placeholder="Enter complete address" value={formData.EmergencyContactAddress} onChange={handleChange} onBlur={handleBlur} error={!!fieldErrors.EmergencyContactAddress} helperText={fieldErrors.EmergencyContactAddress} sx={inputStyle} /></Box>
                </Grid>
              </Grid>
            </Paper>
          </Stack>
        );

      default:
        return null;
    }
  };

  return (
    <Paper sx={{ mt: 2, p: 2, bgcolor: '#ffffff', border: `1px solid ${COLORS.border}`, borderRadius: 2, width: '100%', boxSizing: 'border-box' }}>
      <Typography sx={{ fontSize: '1rem', fontWeight: 700, color: COLORS.text.primary, mb: 2 }}>
        {isEdit ? 'Edit Employee' : 'Add New Employee'}
      </Typography>

      <Stepper activeStep={activeStep} alternativeLabel connector={<ColorConnector />} sx={{ mb: 2 }}>
        {employeeSteps.map((label) => (
          <Step key={label}>
            <StepLabel><Typography fontSize="0.75rem">{label}</Typography></StepLabel>
          </Step>
        ))}
      </Stepper>

      {submitError && (
        <Alert severity="error" sx={{ mb: 2, borderRadius: 1.5 }} onClose={() => setSubmitError('')}>
          {submitError}
        </Alert>
      )}

      {renderStepContent(activeStep)}

      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
        <Button
          size="small"
          onClick={onClose}
          disabled={loading}
          sx={{ fontSize: '0.7rem', textTransform: 'none' }}
        >
          Cancel
        </Button>
        <Box sx={{ display: 'flex', gap: 1 }}>
          {activeStep > 0 && (
            <Button
              size="small"
              onClick={handleBack}
              disabled={loading}
              startIcon={<NavigateBeforeIcon sx={{ fontSize: '1rem' }} />}
              sx={{ fontSize: '0.7rem', textTransform: 'none' }}
            >
              Back
            </Button>
          )}
          {activeStep === employeeSteps.length - 1 ? (
            <Button
              variant="contained"
              size="small"
              onClick={handleSubmit}
              disabled={loading}
              startIcon={loading ? null : (isEdit ? <EditIcon sx={{ fontSize: '1rem' }} /> : <AddIcon sx={{ fontSize: '1rem' }} />)}
              sx={{
                fontSize: '0.7rem',
                textTransform: 'none',
                bgcolor: COLORS.primary,
                '&:hover': { bgcolor: COLORS.primaryDark }
              }}
            >
              {loading ? <CircularProgress size={16} sx={{ color: COLORS.text.light }} /> : (isEdit ? 'Update Employee' : 'Add Employee')}
            </Button>
          ) : (
            <Button
              variant="contained"
              size="small"
              onClick={handleNext}
              disabled={loading}
              endIcon={<NavigateNextIcon sx={{ fontSize: '1rem' }} />}
              sx={{
                fontSize: '0.7rem',
                textTransform: 'none',
                bgcolor: COLORS.primary,
                '&:hover': { bgcolor: COLORS.primaryDark }
              }}
            >
              Next
            </Button>
          )}
        </Box>
      </Box>
    </Paper>
  );
};

const AddMIS = () => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [savingNew, setSavingNew] = useState(false);
  const savingDeptRef = useRef(false); // synchronous guard against double clicks / double Enter
  const [rmpList, setRmpList] = useState([]);
  const [employeesList, setEmployeesList] = useState([]);
  const [departmentsList, setDepartmentsList] = useState([]);
  const [designationsList, setDesignationsList] = useState([]);

  const [isRmpDropdownOpen, setIsRmpDropdownOpen] = useState(false);
  const [rmpSearchTerm, setRmpSearchTerm] = useState('');
  const rmpDropdownRef = useRef(null);

  const [isEmpDropdownOpen, setIsEmpDropdownOpen] = useState(false);
  const [empSearchTerm, setEmpSearchTerm] = useState('');
  const empDropdownRef = useRef(null);

  const [isDeptDropdownOpen, setIsDeptDropdownOpen] = useState(false);
  const [deptSearchTerm, setDeptSearchTerm] = useState('');
  const deptDropdownRef = useRef(null);

  // Inline Add New panels, matching the existing AddMIV pattern.
  const [showAddDepartment, setShowAddDepartment] = useState(false);
  const [showAddEmployee, setShowAddEmployee] = useState(false);
  const [modalError, setModalError] = useState('');
  const [newDepartment, setNewDepartment] = useState({
    DepartmentName: '',
    Description: '',
  });
  const [formData, setFormData] = useState({
    issue_date: new Date().toISOString().split('T')[0],
    department: '',
    issued_to: '',
    rmp_id: '',
    rmp_ref_no: '',
    items: [{ name: '', code: '', quantity: '', unit: 'Kg' }],
  });

  const token = () => localStorage.getItem('token');
  const authConfig = () => ({
    headers: {
      Authorization: `Bearer ${token()}`,
      'Content-Type': 'application/json',
    },
  });

  useEffect(() => {
    fetchRMP();
    fetchEmployees();
    fetchDepartments();
    fetchDesignations();

    const handleClickOutside = (event) => {
      if (rmpDropdownRef.current && !rmpDropdownRef.current.contains(event.target)) {
        setIsRmpDropdownOpen(false);
      }
      if (empDropdownRef.current && !empDropdownRef.current.contains(event.target)) {
        setIsEmpDropdownOpen(false);
      }
      if (deptDropdownRef.current && !deptDropdownRef.current.contains(event.target)) {
        setIsDeptDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
    // Load initial dropdown data once.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchRMP = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/api/rm-purchase?limit=100`, authConfig());
      const list = Array.isArray(res.data?.data) ? res.data.data : [];
      const availableRmp = list.filter((purchase) => {
        const quantity = Number(purchase.quantity || 0);
        const used = Number(purchase.used_qty || 0);
        let remaining = purchase.remaining_qty;
        if (remaining === undefined || remaining === null || (Number(remaining) === 0 && used === 0)) {
          remaining = quantity;
        }
        return Number(remaining) > 0;
      });
      setRmpList(availableRmp);
    } catch (error) {
      console.error('Error fetching RMP:', error);
    }
  };

  // API responses can be an array or an object ({ success, data: [...], pagination }).
  // Normalize both shapes so master records always reach the dropdown state.
  const extractList = (responseData, possibleKeys = []) => {
    if (Array.isArray(responseData)) return responseData;
    if (!responseData || typeof responseData !== 'object') return [];
    for (const key of possibleKeys) {
      if (Array.isArray(responseData[key])) return responseData[key];
    }
    if (Array.isArray(responseData.results)) return responseData.results;
    // e.g. { data: { departments: [...], pagination } }
    if (responseData.data && typeof responseData.data === 'object') {
      return extractList(responseData.data, possibleKeys);
    }
    return [];
  };

  // Merge lists without duplicates (by database id, falling back to a name key).
  const dedupeById = (list, nameKeyFn = () => '') => {
    const seenIds = new Set();
    const seenNames = new Set();
    const unique = [];
    list.forEach((item) => {
      const id = item?._id || item?.id;
      const name = String(nameKeyFn(item) || '').trim().toLowerCase();
      if (id) {
        if (seenIds.has(id)) return;
        seenIds.add(id);
      } else if (name) {
        if (seenNames.has(name)) return;
        seenNames.add(name);
      }
      unique.push(item);
    });
    return unique;
  };

  // Work out how many pages the API says exist. The Department API returns
  // { currentPage, totalPages, totalItems, itemsPerPage }; the Employee Master code
  // reads `pagination.total`, so accept the other common spellings too.
  const getTotalPages = (pagination) => {
    if (!pagination || typeof pagination !== 'object') return 1;
    const direct = Number(pagination.totalPages ?? pagination.pages ?? pagination.total_pages);
    if (Number.isFinite(direct) && direct > 0) return direct;
    const totalItems = Number(pagination.totalItems ?? pagination.total ?? pagination.count);
    const perPage = Number(pagination.itemsPerPage ?? pagination.limit ?? pagination.pageSize);
    if (Number.isFinite(totalItems) && Number.isFinite(perPage) && perPage > 0) {
      return Math.max(1, Math.ceil(totalItems / perPage));
    }
    return 1;
  };

  // Reads EVERY page of a paginated master API using the pagination object the
  // backend returns. `pageSize` is only a hint to reduce the number of requests
  // (Department/Employee Master already send limit=5/10/25/50); correctness does
  // not depend on the server honouring it, because the loop follows the server's
  // own totalPages.
  const fetchAllPages = async (path, possibleKeys = [], pageSize = null) => {
    const getPage = (page) => {
      const params = { page };
      if (pageSize) params.limit = pageSize;
      return axios.get(`${BASE_URL}${path}`, { ...authConfig(), params });
    };

    const firstResponse = await getPage(1);
    const firstBody = firstResponse.data || {};
    let all = extractList(firstBody, possibleKeys);
    const pagination = firstBody.pagination || firstBody.data?.pagination || null;
    const totalPages = Math.min(getTotalPages(pagination), 500); // safety cap

    for (let page = 2; page <= totalPages; page += 1) {
      const pageResponse = await getPage(page);
      all = all.concat(extractList(pageResponse.data || {}, possibleKeys));
    }
    return all;
  };

  const getDepartmentName = (department) =>
    department?.DepartmentName || department?.department_name || department?.name || '';

  const getEmployeeName = (employee) => {
    if (employee?.FirstName) {
      return `${employee.FirstName} ${employee.LastName || ''}`.trim();
    }
    return employee?.name || employee?.EmployeeName || '';
  };

  // Returns the full, de-duplicated list on success, or null if the request failed
  // (so a failed refresh never wipes the dropdown that is already loaded).
  const fetchEmployees = async () => {
    try {
      const list = dedupeById(
        await fetchAllPages('/api/employees', ['employees', 'data', 'results'], 50),
        getEmployeeName
      );
      setEmployeesList(list);
      return list;
    } catch (error) {
      console.error('Error fetching employees:', error);
      return null;
    }
  };

  const fetchDepartments = async () => {
    try {
      const list = dedupeById(
        await fetchAllPages('/api/departments', ['departments', 'departmentList', 'data', 'results'], 50),
        getDepartmentName
      );
      setDepartmentsList(list);
      return list;
    } catch (error) {
      console.error('Error fetching departments:', error);
      return null;
    }
  };

  // Designations are read the same way Employee Master / AddMRV read them
  // (plain GET, no filter); extra pages are followed only if the API reports them.
  const fetchDesignations = async () => {
    try {
      const list = dedupeById(
        await fetchAllPages('/api/designations', ['designations', 'data', 'results'])
      );
      setDesignationsList(list);
    } catch (error) {
      console.error('Error fetching designations:', error);
    }
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectRmp = (selectedRmp) => {
    const availableQty =
      selectedRmp.remaining_qty !== undefined && selectedRmp.remaining_qty !== null
        ? selectedRmp.remaining_qty
        : selectedRmp.quantity;

    setFormData((prev) => ({
      ...prev,
      rmp_id: selectedRmp._id,
      rmp_ref_no: selectedRmp.ref_no || '',
      issue_date: new Date().toISOString().split('T')[0],
      items: [
        {
          rm_id: selectedRmp._id,
          name: selectedRmp.name || '',
          code: selectedRmp.code || '',
          quantity: availableQty ?? '',
          unit: selectedRmp.unit || 'Kg',
        },
      ],
    }));
    setIsRmpDropdownOpen(false);
    setRmpSearchTerm('');
  };

  const handleItemChange = (index, field, value) => {
    setFormData((prev) => ({
      ...prev,
      items: prev.items.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [field]: value } : item
      ),
    }));
  };

  const openAddDepartment = () => {
    setModalError('');
    setNewDepartment({ DepartmentName: '', Description: '' });
    setShowAddDepartment((visible) => !visible);
    setShowAddEmployee(false);
    setIsDeptDropdownOpen(false);
    setIsEmpDropdownOpen(false);
  };

  const openAddEmployee = () => {
    setModalError('');
    setShowAddEmployee((visible) => !visible);
    setShowAddDepartment(false);
    setIsDeptDropdownOpen(false);
    setIsEmpDropdownOpen(false);
  };

  // Called by InlineEmployeeForm after POST /api/employees reports success.
  const handleEmployeeAdded = async (createdEmployee) => {
    if (!createdEmployee) return;

    // Refresh from the master API (all pages) so the dropdown uses server-saved data.
    const refreshedEmployees = await fetchEmployees();
    const employeeId = createdEmployee._id || createdEmployee.id;
    const savedEmployee =
      (refreshedEmployees || []).find(
        (employee) => (employee._id || employee.id) === employeeId
      ) || createdEmployee;

    // If the GET did not include the record (failed or stale), keep it in the list.
    setEmployeesList((previous) => {
      const id = savedEmployee._id || savedEmployee.id;
      const exists = previous.some((employee) => (employee._id || employee.id) === id);
      return exists
        ? previous.map((employee) => ((employee._id || employee.id) === id ? savedEmployee : employee))
        : [...previous, savedEmployee];
    });

    // Resolve the employee's department name for the Department dropdown.
    const departmentId =
      typeof savedEmployee.DepartmentID === 'object'
        ? savedEmployee.DepartmentID?._id
        : savedEmployee.DepartmentID;
    const matchedDepartment = departmentsList.find((department) => department._id === departmentId);
    const departmentName =
      getDepartmentName(matchedDepartment) ||
      (typeof savedEmployee.DepartmentID === 'object'
        ? getDepartmentName(savedEmployee.DepartmentID)
        : '');

    setFormData((previous) => ({
      ...previous,
      issued_to: getEmployeeName(savedEmployee),
      department: departmentName || previous.department,
    }));

    setShowAddEmployee(false);
    setModalError('');
    setIsEmpDropdownOpen(false);
    setEmpSearchTerm('');
  };

  // POST /api/departments with { DepartmentName, Description } -- the same endpoint
  // and payload used by AddDepartments.jsx (Department Master).
  const handleCreateDepartment = async (event) => {
    if (event && event.preventDefault) event.preventDefault();
    if (savingDeptRef.current) return; // prevent duplicate submissions

    const name = newDepartment.DepartmentName.trim();

    if (!name) {
      setModalError('Department name is required.');
      return;
    }
    if (name.length < 2) {
      setModalError('Department name must be at least 2 characters.');
      return;
    }
    if (departmentsList.some((department) => getDepartmentName(department).trim().toLowerCase() === name.toLowerCase())) {
      setModalError('This department already exists.');
      return;
    }

    savingDeptRef.current = true;
    setSavingNew(true);
    setModalError('');
    try {
      const payload = {
        DepartmentName: name,
        Description: newDepartment.Description.trim(),
      };
      const response = await axios.post(`${BASE_URL}/api/departments`, payload, authConfig());

      // Only treat the save as successful when the backend explicitly confirms it.
      if (response.data?.success !== true) {
        throw new Error(response.data?.message || 'Failed to add department.');
      }

      const created = response.data?.data;
      const createdId = created?._id || created?.id;

      // Re-fetch the master list (all pages) so the dropdown reflects the database.
      const refreshed = await fetchDepartments();

      const savedDepartment =
        (refreshed || []).find(
          (department) => createdId && (department._id === createdId || department.id === createdId)
        ) ||
        (created && typeof created === 'object'
          ? { ...created, DepartmentName: getDepartmentName(created) || name }
          : null);

      if (!savedDepartment) {
        throw new Error('The server did not return the created department.');
      }

      // If the refreshed GET did not contain the new record (failed refresh or
      // stale read), merge the backend-confirmed record without creating duplicates.
      setDepartmentsList((previous) =>
        dedupeById([...previous, savedDepartment], getDepartmentName)
      );

      setFormData((previous) => ({
        ...previous,
        department: getDepartmentName(savedDepartment) || name,
      }));
      setShowAddDepartment(false);
      setIsDeptDropdownOpen(false);
      setDeptSearchTerm('');
      setNewDepartment({ DepartmentName: '', Description: '' });
      setModalError('');
    } catch (error) {
      console.error('Error creating department:', error);
      // Keep the form open and show the real error.
      setModalError(
        error.response?.data?.message ||
          error.message ||
          'Could not add department.'
      );
    } finally {
      savingDeptRef.current = false;
      setSavingNew(false);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!formData.rmp_id) {
      alert('Please select a Purchase Reference (RMP).');
      return;
    }
    if (!formData.department || !formData.issued_to) {
      alert('Please select a Department and Issued To employee.');
      return;
    }

    setLoading(true);
    try {
      const firstItem = formData.items[0] || {};
      const payload = {
        ...formData,
        material_name: firstItem.name,
        material_code: firstItem.code,
        quantity: firstItem.quantity,
        unit: firstItem.unit,
        purchase_id: formData.rmp_id,
        raw_material: formData.rmp_id,
      };

      await axios.post(`${BASE_URL}/api/material-issue-slip`, payload, authConfig());
      navigate('/inventorymanagement/mis');
    } catch (error) {
      alert(error.response?.data?.message || 'Could not save the Material Issue Slip.');
    } finally {
      setLoading(false);
    }
  };

  const filteredRmp = useMemo(
    () =>
      rmpList.filter((rmp) =>
        `${rmp.ref_no || ''} ${rmp.name || ''}`
          .toLowerCase()
          .includes(rmpSearchTerm.toLowerCase())
      ),
    [rmpList, rmpSearchTerm]
  );

  const filteredEmployees = useMemo(
    () =>
      employeesList.filter((employee) =>
        getEmployeeName(employee).toLowerCase().includes(empSearchTerm.toLowerCase())
      ),
    [employeesList, empSearchTerm]
  );

  const filteredDepartments = useMemo(
    () =>
      departmentsList.filter((department) =>
        getDepartmentName(department).toLowerCase().includes(deptSearchTerm.toLowerCase())
      ),
    [departmentsList, deptSearchTerm]
  );

  const labelClass = 'block text-[11px] font-bold text-gray-500 uppercase tracking-wide mb-1.5';
  const inputClass =
    'w-full h-10 px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#0f4a4a] focus:border-[#0f4a4a] text-sm text-gray-800 transition-colors bg-white';
  const secondaryButtonClass =
    'inline-flex h-10 shrink-0 items-center justify-center gap-1.5 rounded-md border border-gray-300 bg-white px-3 text-sm font-medium text-gray-600 transition hover:border-[#0f4a4a] hover:bg-gray-50 hover:text-[#0f4a4a] disabled:cursor-not-allowed disabled:opacity-60';

  // Enter inside the department inputs saves the department (not the whole MIS form).
  const handleDeptKeyDown = (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      handleCreateDepartment(event);
    }
  };

  // The inline employee form lives inside the MIS <form>. Pressing Enter in one of its
  // single-line inputs would otherwise "implicitly submit" the MIS form and trigger
  // Save & Generate Slip, so swallow that default (multiline textareas are unaffected).
  const blockEnterSubmit = (event) => {
    if (event.key === 'Enter' && event.target?.tagName === 'INPUT') {
      event.preventDefault();
    }
  };

  return (
    <div className="flex min-h-screen justify-center bg-[#F8F9FA] p-4 font-sans md:p-8">
      <div className="w-full max-w-5xl overflow-visible rounded-xl border border-gray-200 bg-white shadow-[0_2px_10px_-3px_rgba(0,0,0,0.1)]">
        <div className="rounded-t-xl border-b border-gray-200 bg-gray-50 px-6 py-5 md:px-8">
          <h1 className="text-xl font-bold text-gray-800">Create Material Issue Slip</h1>
          <p className="mt-1 text-sm text-gray-500">
            Issue raw material to a department and generate a printable slip.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8 p-5 md:p-8">
          <section>
            <h3 className="mb-4 border-b pb-2 text-sm font-bold text-gray-800">
              Purchase Reference
            </h3>
            <div className="relative" ref={rmpDropdownRef}>
              <label className={labelClass}>
                Select Purchase Ref (RMP) <span className="text-red-500">*</span>
              </label>
              <button
                type="button"
                aria-expanded={isRmpDropdownOpen}
                onClick={() => setIsRmpDropdownOpen((open) => !open)}
                className="flex h-10 w-full items-center justify-between rounded-md border border-gray-300 bg-white px-3 text-left transition hover:border-[#0f4a4a]"
              >
                <span
                  className={`truncate text-sm ${
                    formData.rmp_ref_no ? 'font-semibold text-gray-800' : 'text-gray-400'
                  }`}
                >
                  {formData.rmp_ref_no
                    ? `${formData.rmp_ref_no} - ${formData.items[0]?.name || ''}`
                    : '-- Search or Select RMP --'}
                </span>
                <ChevronDown size={16} className="ml-2 shrink-0 text-gray-500" />
              </button>

              {isRmpDropdownOpen && (
                <div className="absolute z-30 mt-1 flex max-h-64 w-full flex-col overflow-hidden rounded-lg border border-gray-200 bg-white shadow-xl">
                  <div className="sticky top-0 border-b border-gray-100 bg-white p-2">
                    <div className="relative">
                      <Search
                        size={14}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                      />
                      <input
                        type="text"
                        placeholder="Search RMP Ref or Material Name..."
                        value={rmpSearchTerm}
                        onChange={(event) => setRmpSearchTerm(event.target.value)}
                        className="h-9 w-full rounded border border-gray-200 bg-gray-50 pl-8 pr-3 text-sm focus:outline-none focus:ring-1 focus:ring-[#0f4a4a]"
                      />
                    </div>
                  </div>
                  <div className="flex-1 overflow-y-auto">
                    {filteredRmp.length === 0 ? (
                      <div className="p-4 text-center text-sm text-gray-500">No RMP found</div>
                    ) : (
                      filteredRmp.map((rmp) => (
                        <button
                          type="button"
                          key={rmp._id}
                          onClick={() => handleSelectRmp(rmp)}
                          className="w-full border-b border-gray-50 px-4 py-2 text-left last:border-0 hover:bg-[#F0FDF9]"
                        >
                          <div className="text-sm font-semibold text-gray-800">
                            {rmp.ref_no} - {rmp.name}
                          </div>
                          <div className="text-xs text-gray-500">
                            Remaining: {rmp.remaining_qty ?? rmp.quantity} {rmp.unit}
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          </section>

          <section>
            <h3 className="mb-4 border-b pb-2 text-sm font-bold text-gray-800">Issue Details</h3>
            <div className="grid grid-cols-1 gap-5 md:grid-cols-3 md:gap-6">
              <div>
                <label className={labelClass}>
                  Issue Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="issue_date"
                  required
                  value={formData.issue_date}
                  onChange={handleChange}
                  className={inputClass}
                />
              </div>

              <div className="min-w-0">
                <label className={labelClass}>
                  Department <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-2">
                  <div className="relative min-w-0 flex-1" ref={deptDropdownRef}>
                    <button
                      type="button"
                      aria-expanded={isDeptDropdownOpen}
                      onClick={() => {
                        setIsDeptDropdownOpen((open) => !open);
                        setIsEmpDropdownOpen(false);
                      }}
                      className="flex h-10 w-full items-center justify-between rounded-md border border-gray-300 bg-white px-3 text-left hover:border-[#0f4a4a]"
                    >
                      <span
                        className={`truncate text-sm ${
                          formData.department ? 'font-semibold text-gray-800' : 'text-gray-500'
                        }`}
                      >
                        {formData.department || '-- Select --'}
                      </span>
                      <ChevronDown size={16} className="ml-2 shrink-0 text-gray-500" />
                    </button>
                    {isDeptDropdownOpen && (
                      <div className="absolute z-30 mt-1 max-h-56 w-full overflow-hidden rounded-lg border border-gray-200 bg-white shadow-xl">
                        <div className="border-b border-gray-100 p-2">
                          <input
                            type="text"
                            placeholder="Search department..."
                            value={deptSearchTerm}
                            onChange={(event) => setDeptSearchTerm(event.target.value)}
                            className="h-9 w-full rounded border border-gray-200 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-[#0f4a4a]"
                          />
                        </div>
                        <div className="max-h-44 overflow-y-auto">
                          {filteredDepartments.length === 0 ? (
                            <p className="p-3 text-sm text-gray-500">No departments found</p>
                          ) : (
                            filteredDepartments.map((department) => (
                              <button
                                type="button"
                                key={department._id}
                                onClick={() => {
                                  setFormData((prev) => ({
                                    ...prev,
                                    department: getDepartmentName(department),
                                  }));
                                  setIsDeptDropdownOpen(false);
                                  setDeptSearchTerm('');
                                }}
                                className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100"
                              >
                                {getDepartmentName(department)}
                              </button>
                            ))
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={openAddDepartment}
                    className={secondaryButtonClass}
                    title="Add new department"
                  >
                    {showAddDepartment ? <X size={15} /> : <Plus size={15} />}
                    <span>{showAddDepartment ? 'Cancel' : 'Add New'}</span>
                  </button>
                </div>
              </div>

              <div className="min-w-0">
                <label className={labelClass}>
                  Issued To <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-2">
                  <div className="relative min-w-0 flex-1" ref={empDropdownRef}>
                    <button
                      type="button"
                      aria-expanded={isEmpDropdownOpen}
                      onClick={() => {
                        setIsEmpDropdownOpen((open) => !open);
                        setIsDeptDropdownOpen(false);
                      }}
                      className="flex h-10 w-full items-center justify-between rounded-md border border-gray-300 bg-white px-3 text-left hover:border-[#0f4a4a]"
                    >
                      <span
                        className={`truncate text-sm ${
                          formData.issued_to ? 'font-semibold text-gray-800' : 'text-gray-500'
                        }`}
                      >
                        {formData.issued_to || '-- Select --'}
                      </span>
                      <ChevronDown size={16} className="ml-2 shrink-0 text-gray-500" />
                    </button>
                    {isEmpDropdownOpen && (
                      <div className="absolute z-30 mt-1 max-h-56 w-full overflow-hidden rounded-lg border border-gray-200 bg-white shadow-xl">
                        <div className="border-b border-gray-100 p-2">
                          <input
                            type="text"
                            placeholder="Search employee..."
                            value={empSearchTerm}
                            onChange={(event) => setEmpSearchTerm(event.target.value)}
                            className="h-9 w-full rounded border border-gray-200 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-[#0f4a4a]"
                          />
                        </div>
                        <div className="max-h-44 overflow-y-auto">
                          {filteredEmployees.length === 0 ? (
                            <p className="p-3 text-sm text-gray-500">No employees found</p>
                          ) : (
                            filteredEmployees.map((employee) => (
                              <button
                                type="button"
                                key={employee._id}
                                onClick={() => {
                                  setFormData((prev) => ({
                                    ...prev,
                                    issued_to: getEmployeeName(employee),
                                  }));
                                  setIsEmpDropdownOpen(false);
                                  setEmpSearchTerm('');
                                }}
                                className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100"
                              >
                                {getEmployeeName(employee)}
                              </button>
                            ))
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={openAddEmployee}
                    className={secondaryButtonClass}
                    title="Add new employee"
                  >
                    {showAddEmployee ? <X size={15} /> : <Plus size={15} />}
                    <span>{showAddEmployee ? 'Cancel' : 'Add New'}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Full employee form displayed inline, matching AddMRV (not a popup/modal). */}
            {showAddEmployee && (
              <div className="mt-4" onKeyDown={blockEnterSubmit}>
                <InlineEmployeeForm
                  onClose={() => setShowAddEmployee(false)}
                  onSave={handleEmployeeAdded}
                  onUpdate={handleEmployeeAdded}
                  departments={departmentsList}
                  designations={designationsList}
                  loadingData={false}
                />
              </div>
            )}

            {/* Inline Department form. This is a <div>, NOT a nested <form>: a nested
                form's submit event bubbles to the outer MIS form and triggers the
                "Save & Generate Slip" handler. */}
            {showAddDepartment && (
              <div className="mt-4 rounded-lg border border-gray-200 bg-gray-50 p-4">
                <h4 className="mb-3 text-sm font-semibold text-[#0f4a4a]">Add New Department</h4>
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  <div>
                    <label className={labelClass}>Department Name <span className="text-red-500">*</span></label>
                    <input
                      value={newDepartment.DepartmentName}
                      onChange={(event) => setNewDepartment((prev) => ({ ...prev, DepartmentName: event.target.value }))}
                      onKeyDown={handleDeptKeyDown}
                      disabled={savingNew}
                      className={inputClass}
                      placeholder="Department name"
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Description</label>
                    <input
                      value={newDepartment.Description}
                      onChange={(event) => setNewDepartment((prev) => ({ ...prev, Description: event.target.value }))}
                      onKeyDown={handleDeptKeyDown}
                      disabled={savingNew}
                      className={inputClass}
                      placeholder="Optional description"
                    />
                  </div>
                </div>
                {modalError && showAddDepartment && (
                  <p role="alert" className="mt-3 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{modalError}</p>
                )}
                <div className="mt-3 flex justify-end gap-2">
                  <button
                    type="button"
                    disabled={savingNew}
                    onClick={() => { setShowAddDepartment(false); setModalError(''); }}
                    className="h-9 rounded-md border border-gray-300 bg-white px-4 text-sm text-gray-600 hover:bg-gray-100 disabled:opacity-60"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    disabled={savingNew}
                    onClick={handleCreateDepartment}
                    className="h-9 rounded-md bg-[#0f4a4a] px-4 text-sm font-semibold text-white hover:bg-[#0a3636] disabled:opacity-60"
                  >
                    {savingNew ? 'Saving...' : 'Add Department'}
                  </button>
                </div>
              </div>
            )}
          </section>

          <section>
            <h3 className="mb-4 border-b pb-2 text-sm font-bold text-gray-800">Issued Items</h3>
            <div className="overflow-x-auto rounded-lg border border-gray-200 bg-gray-50 p-2">
              <table className="w-full min-w-[600px] border-collapse text-left">
                <thead className="bg-[#F8F9FA] text-[11px] font-bold uppercase tracking-wider text-gray-600">
                  <tr>
                    <th className="px-3 py-2">RM Name</th>
                    <th className="w-40 px-3 py-2">Code</th>
                    <th className="w-28 px-3 py-2">Qty</th>
                    <th className="w-28 px-3 py-2">Unit</th>
                  </tr>
                </thead>
                <tbody>
                  {formData.items.map((item, index) => (
                    <tr key={index}>
                      <td className="p-2">
                        <input
                          type="text"
                          required
                          value={item.name}
                          readOnly
                          className={`${inputClass} bg-gray-50`}
                        />
                      </td>
                      <td className="p-2">
                        <input
                          type="text"
                          required
                          value={item.code}
                          readOnly
                          className={`${inputClass} bg-gray-50`}
                        />
                      </td>
                      <td className="p-2">
                        <input
                          type="number"
                          required
                          min="0.01"
                          step="any"
                          value={item.quantity}
                          onChange={(event) =>
                            handleItemChange(index, 'quantity', event.target.value)
                          }
                          className={inputClass}
                        />
                      </td>
                      <td className="p-2">
                        <select
                          value={item.unit}
                          onChange={(event) => handleItemChange(index, 'unit', event.target.value)}
                          className={`${inputClass} cursor-pointer`}
                        >
                          {['Kg', 'Nos', 'Meter', 'Set', 'Piece', 'Sheet', 'Roll'].map((unit) => (
                            <option key={unit} value={unit}>
                              {unit}
                            </option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <div className="mt-8 flex flex-col-reverse items-stretch justify-between gap-3 border-t border-gray-200 pt-6 sm:flex-row sm:items-center">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-semibold text-gray-600 transition hover:bg-gray-50"
            >
              <ArrowLeft size={16} /> Back
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#0f4a4a] px-6 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-[#0a3636] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Save size={18} />
              {loading ? 'Saving...' : 'Save & Generate Slip'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddMIS;