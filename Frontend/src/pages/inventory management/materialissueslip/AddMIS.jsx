// import React, { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import axios from 'axios';
// import { ArrowLeft, Save } from 'lucide-react';

// const AddMIS = () => {
//   const navigate = useNavigate();
//   const [loading, setLoading] = useState(false);
//   const [rmpList, setRmpList] = useState([]); 
//   const [formData, setFormData] = useState({
//     issue_date: new Date().toISOString().split('T')[0],
//     department: '',
//     issued_to: '',
//     rmp_id: '',
//     rmp_ref_no: '',
//     items: [{ name: '', code: '', quantity: '', unit: 'Kg' }]
//   });

//   // Fetch RMP List for Dropdown
//   useEffect(() => {
//     const fetchRMP = async () => {
//       try {
//         const token = localStorage.getItem('token');
//         const res = await axios.get(`http://localhost:5009/api/rm-purchase?limit=100`, {
//           headers: { Authorization: `Bearer ${token}` }
//         });
//         setRmpList(res.data.data);
//       } catch (error) {
//         console.log("Error fetching RMP", error);
//       }
//     };
//     fetchRMP();
//   }, []);

//   const handleChange = (e) => {
//     setFormData({ ...formData, [e.target.name]: e.target.value });
//   };

//   // Jab user RMP select kare
//   const handleRmpSelect = (e) => {
//     const selectedId = e.target.value;
//     const selectedRmp = rmpList.find(r => r._id === selectedId);
    
//     if (selectedRmp) {
//       setFormData({
//         ...formData,
//         rmp_id: selectedRmp._id,
//         rmp_ref_no: selectedRmp.ref_no,
//         issue_date: new Date(selectedRmp.purchase_date).toISOString().split('T')[0], // Date Auto-fill
//         items: [{
//           rm_id: selectedRmp._id,
//           name: selectedRmp.name,
//           code: selectedRmp.code,
//           quantity: selectedRmp.quantity, 
//           unit: selectedRmp.unit
//         }]
//       });
//     } else {
//       setFormData({ ...formData, rmp_id: '', rmp_ref_no: '', items: [{ name: '', code: '', quantity: '', unit: 'Kg' }] });
//     }
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
//       await axios.post(`http://localhost:5009/api/material-issue-slip`, formData, config);
//       alert("Material Issue Slip created successfully!");
//       navigate('/inventorymanagement/mis'); 
//     } catch (error) {
//       alert(error.response?.data?.message || "Kuch galat ho gaya");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="p-6 bg-[#F8F9FA] min-h-screen font-sans">
//       <div className="flex items-center gap-4 mb-6">
//         <button onClick={() => navigate(-1)} className="p-2 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition">
//           <ArrowLeft size={18} className="text-gray-600" />
//         </button>
//         <div>
//           <h1 className="text-2xl font-bold text-gray-800">Create Material Issue Slip</h1>
//           <p className="text-gray-500 text-sm mt-1">Issue raw material to a department.</p>
//         </div>
//       </div>

//       <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 max-w-4xl">
//         <form onSubmit={handleSubmit} className="space-y-6">
          
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50 p-4 rounded border border-gray-200">
//             <div className="col-span-1 md:col-span-2">
//               <label className="block text-sm font-bold text-gray-800 mb-1.5">Select Purchase Ref (RMP)</label>
//               <select onChange={handleRmpSelect} value={formData.rmp_id} className="w-full p-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-[#0f4a4a] text-sm">
//                 <option value="">-- Select RMP to auto-fill details --</option>
//                 {rmpList.map(rmp => (
//                   <option key={rmp._id} value={rmp._id}>{rmp.ref_no} - {rmp.name}</option>
//                 ))}
//               </select>
//             </div>
//           </div>

//           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1.5">Issue Date *</label>
//               <input type="date" name="issue_date" required value={formData.issue_date} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-md text-sm" />
//             </div>
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1.5">Department *</label>
//               <input type="text" name="department" required value={formData.department} onChange={handleChange} placeholder="e.g. Production" className="w-full p-2 border border-gray-300 rounded-md text-sm" />
//             </div>
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1.5">Issued To *</label>
//               <input type="text" name="issued_to" required value={formData.issued_to} onChange={handleChange} placeholder="e.g. Ramesh" className="w-full p-2 border border-gray-300 rounded-md text-sm" />
//             </div>
//           </div>

//           <div className="border-t pt-4">
//             <h3 className="text-sm font-bold text-gray-800 mb-3">Issued Items</h3>
//             <table className="w-full text-sm text-left border">
//               <thead className="bg-gray-100 text-gray-700">
//                 <tr>
//                   <th className="p-2 border">RM Name</th>
//                   <th className="p-2 border">Code</th>
//                   <th className="p-2 border w-24">Qty</th>
//                   <th className="p-2 border w-24">Unit</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {formData.items.map((item, index) => (
//                   <tr key={index}>
//                     <td className="p-2 border"><input type="text" required value={item.name} onChange={(e) => handleItemChange(index, 'name', e.target.value)} className="w-full p-1 border rounded" /></td>
//                     <td className="p-2 border"><input type="text" required value={item.code} onChange={(e) => handleItemChange(index, 'code', e.target.value)} className="w-full p-1 border rounded" /></td>
//                     <td className="p-2 border"><input type="number" required value={item.quantity} onChange={(e) => handleItemChange(index, 'quantity', e.target.value)} className="w-full p-1 border rounded" /></td>
//                     <td className="p-2 border">
//                       <select value={item.unit} onChange={(e) => handleItemChange(index, 'unit', e.target.value)} className="w-full p-1 border rounded">
//                         <option value="Kg">Kg</option>
//                         <option value="Nos">Nos</option>
//                       </select>
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>

//           <div className="flex justify-end pt-4 border-t border-gray-200 mt-6">
//             <button type="submit" disabled={loading} className="bg-[#0f4a4a] hover:bg-[#0a3636] text-white px-6 py-2 rounded-md flex items-center gap-2 text-sm font-medium">
//               <Save size={18} /> Save & Generate Slip
//             </button>
//           </div>

//         </form>
//       </div>
//     </div>
//   );
// };

// export default AddMIS;

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, Save, Search, ChevronDown, X } from 'lucide-react';

const AddMIS = () => {
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(false);
  const [rmpList, setRmpList] = useState([]); 
  
  // Dropdown States for RMP
  const [isRmpDropdownOpen, setIsRmpDropdownOpen] = useState(false);
  const [rmpSearchTerm, setRmpSearchTerm] = useState('');
  const rmpDropdownRef = useRef(null);

  const [formData, setFormData] = useState({
    issue_date: new Date().toISOString().split('T')[0],
    department: '',
    issued_to: '',
    rmp_id: '',
    rmp_ref_no: '',
    items: [{ name: '', code: '', quantity: '', unit: 'Kg' }]
  });

  useEffect(() => {
    fetchRMP();

    const handleClickOutside = (event) => {
      if (rmpDropdownRef.current && !rmpDropdownRef.current.contains(event.target)) {
        setIsRmpDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchRMP = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`http://localhost:5009/api/rm-purchase?limit=100`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRmpList(res.data.data);
    } catch (error) {
      console.log("Error fetching RMP", error);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Select RMP and auto-fill items
  const handleSelectRmp = (selectedRmp) => {
    setFormData({
      ...formData,
      rmp_id: selectedRmp._id,
      rmp_ref_no: selectedRmp.ref_no,
      issue_date: new Date(selectedRmp.purchase_date).toISOString().split('T')[0],
      items: [{
        rm_id: selectedRmp._id,
        name: selectedRmp.name,
        code: selectedRmp.code,
        quantity: selectedRmp.quantity, 
        unit: selectedRmp.unit
      }]
    });
    setIsRmpDropdownOpen(false);
    setRmpSearchTerm('');
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...formData.items];
    newItems[index][field] = value;
    setFormData({ ...formData, items: newItems });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      await axios.post(`http://localhost:5009/api/material-issue-slip`, formData, config);
      navigate('/inventorymanagement/mis'); 
    } catch (error) {
      alert(error.response?.data?.message || "Kuch galat ho gaya");
    } finally {
      setLoading(false);
    }
  };

  const filteredRmp = rmpList.filter(rmp => 
    rmp.ref_no?.toLowerCase().includes(rmpSearchTerm.toLowerCase()) || 
    rmp.name?.toLowerCase().includes(rmpSearchTerm.toLowerCase())
  );

  const labelClass = "block text-[11px] font-bold text-gray-500 uppercase tracking-wide mb-1.5";
  const inputClass = "w-full h-10 px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#0f4a4a] focus:border-[#0f4a4a] text-sm text-gray-800 transition-colors bg-white";

  return (
    <div className="flex justify-center p-6 md:p-8 bg-[#F8F9FA] min-h-screen font-sans">
      
      <div className="w-full max-w-5xl bg-white rounded-xl shadow-[0_2px_10px_-3px_rgba(0,0,0,0.1)] border border-gray-200 overflow-visible">
        
        {/* Header */}
        <div className="px-8 py-5 border-b border-gray-200 bg-gray-50 rounded-t-xl">
          <h1 className="text-xl font-bold text-gray-800">Create Material Issue Slip</h1>
          <p className="text-sm text-gray-500 mt-1">Issue raw material to a department and generate a printable slip.</p>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-8">
          
          {/* Section 1: Purchase Reference */}
          <div>
            <h3 className="text-sm font-bold text-gray-800 mb-4 border-b pb-2">Purchase Reference</h3>
            <div className="relative" ref={rmpDropdownRef}>
              <label className={labelClass}>Select Purchase Ref (RMP) <span className="text-red-500">*</span></label>
              <div 
                onClick={() => setIsRmpDropdownOpen(!isRmpDropdownOpen)}
                className="w-full h-10 px-3 border border-gray-300 rounded-md bg-white flex items-center justify-between cursor-pointer hover:border-[#0f4a4a] transition"
              >
                <span className={`text-sm ${formData.rmp_ref_no ? 'text-gray-800 font-semibold' : 'text-gray-400'}`}>
                  {formData.rmp_ref_no ? `${formData.rmp_ref_no} - ${formData.items[0]?.name}` : '-- Search or Select RMP --'}
                </span>
                <ChevronDown size={16} className="text-gray-500" />
              </div>

              {isRmpDropdownOpen && (
                <div className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-xl max-h-64 overflow-hidden flex flex-col">
                  <div className="p-2 border-b border-gray-100 sticky top-0 bg-white">
                    <div className="relative">
                      <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search RMP Ref or Material Name..."
                        value={rmpSearchTerm}
                        onChange={(e) => setRmpSearchTerm(e.target.value)}
                        className="w-full h-8 pl-8 pr-8 text-sm border border-gray-200 rounded bg-gray-50 focus:outline-none focus:ring-1 focus:ring-[#0f4a4a]"
                        onClick={(e) => e.stopPropagation()}
                      />
                      {rmpSearchTerm && (
                        <button onClick={() => setRmpSearchTerm('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400">
                          <X size={14} />
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="overflow-y-auto flex-1">
                    {filteredRmp.length === 0 ? (
                      <div className="p-4 text-center text-sm text-gray-500">No RMP found</div>
                    ) : (
                      filteredRmp.map(rmp => (
                        <div key={rmp._id} onClick={() => handleSelectRmp(rmp)} className="px-4 py-2 hover:bg-[#F0FDF9] cursor-pointer border-b border-gray-50 last:border-0">
                          <div className="text-sm font-semibold text-gray-800">{rmp.ref_no} - {rmp.name}</div>
                          <div className="text-xs text-gray-500">Qty: {rmp.quantity} {rmp.unit} | Date: {new Date(rmp.purchase_date).toLocaleDateString()}</div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
              <p className="text-xs text-gray-500 mt-2">Selecting an RMP will automatically fill the material details below.</p>
            </div>
          </div>

          {/* Section 2: Issue Details */}
          <div>
            <h3 className="text-sm font-bold text-gray-800 mb-4 border-b pb-2">Issue Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className={labelClass}>Issue Date <span className="text-red-500">*</span></label>
                <input type="date" name="issue_date" required value={formData.issue_date} onChange={handleChange} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Department <span className="text-red-500">*</span></label>
                <input type="text" name="department" required value={formData.department} onChange={handleChange} placeholder="e.g. Production" className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Issued To <span className="text-red-500">*</span></label>
                <input type="text" name="issued_to" required value={formData.issued_to} onChange={handleChange} placeholder="e.g. Ramesh" className={inputClass} />
              </div>
            </div>
          </div>

          {/* Section 3: Issued Items Table */}
          <div>
            <h3 className="text-sm font-bold text-gray-800 mb-4 border-b pb-2">Issued Items</h3>
            <div className="border border-gray-200 rounded-lg overflow-hidden bg-gray-50 p-2">
              <table className="w-full text-left border-collapse">
                <thead className="bg-[#F8F9FA] text-[11px] font-bold text-gray-600 uppercase tracking-wider">
                  <tr>
                    <th className="px-3 py-2">RM Name</th>
                    <th className="px-3 py-2 w-40">Code</th>
                    <th className="px-3 py-2 w-28">Qty</th>
                    <th className="px-3 py-2 w-28">Unit</th>
                  </tr>
                </thead>
                <tbody>
                  {formData.items.map((item, index) => (
                    <tr key={index}>
                      <td className="p-2">
                        <input type="text" required value={item.name} onChange={(e) => handleItemChange(index, 'name', e.target.value)} placeholder="Auto-filled" className={inputClass} />
                      </td>
                      <td className="p-2">
                        <input type="text" required value={item.code} onChange={(e) => handleItemChange(index, 'code', e.target.value)} placeholder="Auto-filled" className={inputClass} />
                      </td>
                      <td className="p-2">
                        <input type="number" required value={item.quantity} onChange={(e) => handleItemChange(index, 'quantity', e.target.value)} placeholder="0.00" className={inputClass} />
                      </td>
                      <td className="p-2">
                        <select value={item.unit} onChange={(e) => handleItemChange(index, 'unit', e.target.value)} className={`${inputClass} cursor-pointer`}>
                          <option value="Kg">Kg</option>
                          <option value="Nos">Nos</option>
                          <option value="Meter">Meter</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-between items-center pt-6 border-t border-gray-200 mt-8">
            <button type="button" onClick={() => navigate(-1)} className="px-5 py-2.5 text-sm font-semibold text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition flex items-center gap-2">
              <ArrowLeft size={16} /> Back
            </button>
            <div className="flex gap-3">
              <button type="button" onClick={() => navigate(-1)} className="px-6 py-2.5 text-sm font-bold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition">
                Cancel
              </button>
              <button type="submit" disabled={loading} className="px-6 py-2.5 text-sm font-bold text-white bg-[#0f4a4a] hover:bg-[#0a3636] rounded-lg shadow-sm flex items-center gap-2 transition disabled:opacity-50">
                <Save size={18} /> {loading ? 'Saving...' : ' Generate Slip'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddMIS;