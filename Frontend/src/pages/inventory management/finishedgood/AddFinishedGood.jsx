

// import React, { useState, useEffect, useRef } from 'react';
// import { useNavigate, useSearchParams } from 'react-router-dom';
// import axios from 'axios';
// import { ArrowLeft, Save, Search, ChevronDown, X } from 'lucide-react';

// const AddFinishedGood = () => {
//   const navigate = useNavigate();
//   const [searchParams] = useSearchParams();
//   const editId = searchParams.get('id'); 
  
//   const [loading, setLoading] = useState(false);
//   const [itemsList, setItemsList] = useState([]); 
  
//   const [isItemDropdownOpen, setIsItemDropdownOpen] = useState(false);
//   const [itemSearchTerm, setItemSearchTerm] = useState('');
//   const itemDropdownRef = useRef(null);

//   const [formData, setFormData] = useState({
//     fg_date: new Date().toISOString().split('T')[0],
//     product_type: 'New',
//     item_id: '',
//     name: '',
//     code: '',
//     quantity: '',
//     unit: 'Nos',
//     scrap_quantity: 0,
//     scrap_unit: 'Kg',
//     remarks: ''
//   });

//   useEffect(() => {
//     if (editId) fetchSingleData(editId);
//     fetchItems(); 

//     const handleClickOutside = (event) => {
//       if (itemDropdownRef.current && !itemDropdownRef.current.contains(event.target)) {
//         setIsItemDropdownOpen(false);
//       }
//     };
//     document.addEventListener('mousedown', handleClickOutside);
//     return () => document.removeEventListener('mousedown', handleClickOutside);
//   }, [editId]);

//   const fetchSingleData = async (id) => {
//     try {
//       const token = localStorage.getItem('token');
//       const res = await axios.get(`http://localhost:5009/api/finished-good/${id}`, {
//         headers: { Authorization: `Bearer ${token}` }
//       });
//       const data = res.data.data;
//       data.fg_date = new Date(data.fg_date).toISOString().split('T')[0];
//       setFormData(data);
//     } catch (error) {
//       alert("Error fetching details");
//     }
//   };

//   const fetchItems = async () => {
//     try {
//       const token = localStorage.getItem('token');
//       const res = await axios.get(`http://localhost:5009/api/items`, { 
//         headers: { Authorization: `Bearer ${token}` }
//       });
//       setItemsList(res.data.data || res.data); 
//     } catch (error) {
//       console.log("Items fetch error:", error);
//     }
//   };

//   const handleChange = (e) => {
//     setFormData({ ...formData, [e.target.name]: e.target.value });
//   };

//   const handleSelectItem = (item) => {
//     setFormData({
//       ...formData,
//       item_id: item._id,
//       name: item.part_name,
//       code: item.part_no,
//       unit: item.unit || 'Nos'
//     });
//     setIsItemDropdownOpen(false);
//     setItemSearchTerm('');
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);

//     // 👇 YAHAN FIX LAGAYA GAYA HAI 👇
//     const payload = { ...formData };
//     if (payload.product_type === 'New' || !payload.item_id) {
//       payload.item_id = null; // Khali string ki jagah null bhejenge
//     }

//     try {
//       const token = localStorage.getItem('token');
//       const config = { headers: { Authorization: `Bearer ${token}` } };
      
//       if (editId) {
//         await axios.put(`http://localhost:5009/api/finished-good/${editId}`, payload, config);
//       } else {
//         await axios.post(`http://localhost:5009/api/finished-good`, payload, config);
//       }
//       navigate('/inventorymanagement/finishedgood'); 
//     } catch (error) {
//       alert(error.response?.data?.message || "Something went wrong");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const filteredItems = itemsList.filter(item => 
//     item.part_name?.toLowerCase().includes(itemSearchTerm.toLowerCase()) || 
//     item.part_no?.toLowerCase().includes(itemSearchTerm.toLowerCase())
//   );

//   const labelClass = "block text-[11px] font-bold text-gray-500 uppercase tracking-wide mb-1.5";
//   const inputClass = "w-full h-10 px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#0f4a4a] focus:border-[#0f4a4a] text-sm text-gray-800 transition-colors bg-white";

//   return (
//     <div className="flex justify-center p-6 md:p-8 bg-[#F8F9FA] min-h-screen font-sans">
      
//       <div className="w-full max-w-4xl bg-white rounded-xl shadow-[0_2px_10px_-3px_rgba(0,0,0,0.1)] border border-gray-200 overflow-visible">
        
//         {/* Header */}
//         <div className="px-8 py-5 border-b border-gray-200 bg-gray-50 rounded-t-xl">
//           <h1 className="text-xl font-bold text-gray-800">
//             {editId ? 'Edit Finished Good' : 'Add Finished Good'}
//           </h1>
//           <p className="text-sm text-gray-500 mt-1">Record final product and scrap details.</p>
//         </div>

//         <form onSubmit={handleSubmit} className="p-8 space-y-8">
          
//           {/* Section 1: Product Details */}
//           <div>
//             <h3 className="text-sm font-bold text-gray-800 mb-4 border-b pb-2">Product Details</h3>
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//               <div>
//                 <label className={labelClass}>Date <span className="text-red-500">*</span></label>
//                 <input type="date" name="fg_date" required value={formData.fg_date} onChange={handleChange} className={inputClass} />
//               </div>
//               <div>
//                 <label className={labelClass}>Product Type <span className="text-red-500">*</span></label>
//                 <select name="product_type" required value={formData.product_type} onChange={handleChange} className={`${inputClass} cursor-pointer`}>
//                   <option value="New">New </option>
//                   <option value="Existing">Existing </option>
//                 </select>
//               </div>
//             </div>

//             <div className="mt-6">
//               {formData.product_type === 'Existing' ? (
//                 <div className="relative" ref={itemDropdownRef}>
//                   <label className={labelClass}>Select Product <span className="text-red-500">*</span></label>
//                   <div 
//                     onClick={() => setIsItemDropdownOpen(!isItemDropdownOpen)}
//                     className="w-full h-10 px-3 border border-gray-300 rounded-md bg-white flex items-center justify-between cursor-pointer hover:border-[#0f4a4a] transition"
//                   >
//                     <span className="text-sm text-gray-700">
//                       {formData.item_id ? `${formData.name} (${formData.code})` : '-- Select Product from Master --'}
//                     </span>
//                     <ChevronDown size={16} className="text-gray-500" />
//                   </div>

//                   {isItemDropdownOpen && (
//                     <div className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-xl max-h-64 overflow-hidden flex flex-col">
//                       <div className="p-2 border-b border-gray-100 sticky top-0 bg-white">
//                         <div className="relative">
//                           <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
//                           <input
//                             type="text"
//                             placeholder="Search product..."
//                             value={itemSearchTerm}
//                             onChange={(e) => setItemSearchTerm(e.target.value)}
//                             className="w-full h-8 pl-8 pr-8 text-sm border border-gray-200 rounded bg-gray-50 focus:outline-none focus:ring-1 focus:ring-[#0f4a4a]"
//                             onClick={(e) => e.stopPropagation()}
//                           />
//                         </div>
//                       </div>
//                       <div className="overflow-y-auto flex-1">
//                         {filteredItems.length === 0 ? (
//                           <div className="p-4 text-center text-sm text-gray-500">No products found</div>
//                         ) : (
//                           filteredItems.map(item => (
//                             <div key={item._id} onClick={() => handleSelectItem(item)} className="px-4 py-2 hover:bg-[#F0FDF9] cursor-pointer border-b border-gray-50 last:border-0">
//                               <div className="text-sm font-semibold text-gray-800">{item.part_name}</div>
//                               <div className="text-xs text-gray-500">Code: {item.part_no} | Unit: {item.unit}</div>
//                             </div>
//                           ))
//                         )}
//                       </div>
//                     </div>
//                   )}
//                 </div>
//               ) : (
//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                   <div>
//                     <label className={labelClass}>Product Name <span className="text-red-500">*</span></label>
//                     <input type="text" name="name" required value={formData.name} onChange={handleChange} placeholder="e.g. Valve A" className={inputClass} />
//                   </div>
//                   <div>
//                     <label className={labelClass}>Product Code <span className="text-red-500">*</span></label>
//                     <input type="text" name="code" required value={formData.code} onChange={handleChange} placeholder="e.g. VLV-01" className={inputClass} />
//                   </div>
//                 </div>
//               )}
//             </div>
//           </div>

//           {/* Section 2: Production & Scrap */}
//           <div>
//             <h3 className="text-sm font-bold text-gray-800 mb-4 border-b pb-2">Production & Scrap</h3>
//             <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
//               <div className="md:col-span-2">
//                 <label className={labelClass}>Quantity Produced <span className="text-red-500">*</span></label>
//                 <input type="number" name="quantity" required min="0.01" step="any" value={formData.quantity} onChange={handleChange} placeholder="0.00" className={inputClass} />
//               </div>
//               <div className="md:col-span-2">
//                 <label className={labelClass}>Unit</label>
//                 <select name="unit" value={formData.unit} onChange={handleChange} className={`${inputClass} cursor-pointer`}>
//                   <option value="Nos">Nos</option>
//                   <option value="Kg">Kg</option>
//                   <option value="Meter">Meter</option>
//                   <option value="Set">Set</option>
//                 </select>
//               </div>
//             </div>

//             <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-6 p-4 bg-red-50 border border-red-100 rounded-lg">
//               <div className="md:col-span-2">
//                 <label className="block text-[11px] font-bold text-red-700 uppercase tracking-wide mb-1.5">Scrap Quantity</label>
//                 <input type="number" name="scrap_quantity" min="0" step="any" value={formData.scrap_quantity} onChange={handleChange} placeholder="0.00" className="w-full h-10 px-3 border border-red-200 rounded-md focus:outline-none focus:ring-1 focus:ring-red-500 text-sm" />
//               </div>
//               <div className="md:col-span-2">
//                 <label className="block text-[11px] font-bold text-red-700 uppercase tracking-wide mb-1.5">Scrap Unit</label>
//                 <select name="scrap_unit" value={formData.scrap_unit} onChange={handleChange} className="w-full h-10 px-3 border border-red-200 rounded-md focus:outline-none focus:ring-1 focus:ring-red-500 text-sm cursor-pointer bg-white">
//                   <option value="Kg">Kg</option>
//                   <option value="Nos">Nos</option>
//                 </select>
//               </div>
//             </div>
//           </div>

//           {/* Section 3: Remarks */}
//           <div>
//             <h3 className="text-sm font-bold text-gray-800 mb-4 border-b pb-2">Remarks (Optional)</h3>
//             <input type="text" name="remarks" value={formData.remarks} onChange={handleChange} placeholder="Any additional notes..." className={inputClass} />
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
//                 <Save size={18} /> {loading ? 'Saving...' : (editId ? 'Update Entry' : 'Save Entry')}
//               </button>
//             </div>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// };

// export default AddFinishedGood;

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, Save, Search, ChevronDown, X } from 'lucide-react';

const AddFinishedGood = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get('id'); 
  
  const [loading, setLoading] = useState(false);
  const [itemsList, setItemsList] = useState([]); 
  const [misList, setMisList] = useState([]); // 👈 MIS List ke liye state
  
  const [isItemDropdownOpen, setIsItemDropdownOpen] = useState(false);
  const [itemSearchTerm, setItemSearchTerm] = useState('');
  const itemDropdownRef = useRef(null);

  // 👇 MIS Dropdown States 👇
  const [isMisDropdownOpen, setIsMisDropdownOpen] = useState(false);
  const [misSearchTerm, setMisSearchTerm] = useState('');
  const misDropdownRef = useRef(null);

  const [formData, setFormData] = useState({
    fg_date: new Date().toISOString().split('T')[0],
    mis_id: '', // 👈 Naya Field
    mis_ref_no: '', // 👈 Naya Field
    product_type: 'New',
    item_id: '',
    name: '',
    code: '',
    quantity: '',
    unit: 'Nos',
    scrap_quantity: 0,
    scrap_unit: 'Kg',
    remarks: ''
  });

  useEffect(() => {
    if (editId) fetchSingleData(editId);
    fetchItems(); 
    fetchMIS(); // 👈 MIS fetch karein

    const handleClickOutside = (event) => {
      if (itemDropdownRef.current && !itemDropdownRef.current.contains(event.target)) {
        setIsItemDropdownOpen(false);
      }
      if (misDropdownRef.current && !misDropdownRef.current.contains(event.target)) {
        setIsMisDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [editId]);

  const fetchSingleData = async (id) => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`http://localhost:5009/api/finished-good/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = res.data.data;
      data.fg_date = new Date(data.fg_date).toISOString().split('T')[0];
      setFormData(data);
    } catch (error) {
      alert("Error fetching details");
    }
  };

  const fetchItems = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`http://localhost:5009/api/items`, { 
        headers: { Authorization: `Bearer ${token}` }
      });
      setItemsList(res.data.data || res.data); 
    } catch (error) {
      console.log("Items fetch error:", error);
    }
  };

  // 👇 NAYA FUNCTION: MIS Fetch Karne Ke Liye
  const fetchMIS = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`http://localhost:5009/api/material-issue-slip?limit=100`, { 
        headers: { Authorization: `Bearer ${token}` }
      });
      setMisList(res.data.data || []); 
    } catch (error) {
      console.log("MIS fetch error:", error);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSelectItem = (item) => {
    setFormData({
      ...formData,
      item_id: item._id,
      name: item.part_name,
      code: item.part_no,
      unit: item.unit || 'Nos'
    });
    setIsItemDropdownOpen(false);
    setItemSearchTerm('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // 👇 FIX: Agar New hai to item_id null karein
    const payload = { ...formData };
    if (payload.product_type === 'New' || !payload.item_id) {
      payload.item_id = null; 
    }

    try {
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      
      if (editId) {
        await axios.put(`http://localhost:5009/api/finished-good/${editId}`, payload, config);
      } else {
        await axios.post(`http://localhost:5009/api/finished-good`, payload, config);
      }
      navigate('/inventorymanagement/finishedgood'); 
    } catch (error) {
      alert(error.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const filteredItems = itemsList.filter(item => 
    item.part_name?.toLowerCase().includes(itemSearchTerm.toLowerCase()) || 
    item.part_no?.toLowerCase().includes(itemSearchTerm.toLowerCase())
  );

  // 👇 MIS Filter Logic 👇
  const filteredMIS = misList.filter(mis => 
    mis.ref_no?.toLowerCase().includes(misSearchTerm.toLowerCase()) || 
    mis.department?.toLowerCase().includes(misSearchTerm.toLowerCase())
  );

  const labelClass = "block text-[11px] font-bold text-gray-500 uppercase tracking-wide mb-1.5";
  const inputClass = "w-full h-10 px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#0f4a4a] focus:border-[#0f4a4a] text-sm text-gray-800 transition-colors bg-white";

  return (
    <div className="flex justify-center p-6 md:p-8 bg-[#F8F9FA] min-h-screen font-sans">
      
      <div className="w-full max-w-4xl bg-white rounded-xl shadow-[0_2px_10px_-3px_rgba(0,0,0,0.1)] border border-gray-200 overflow-visible">
        
        {/* Header */}
        <div className="px-8 py-5 border-b border-gray-200 bg-gray-50 rounded-t-xl">
          <h1 className="text-xl font-bold text-gray-800">
            {editId ? 'Edit Finished Good' : 'Add Finished Good'}
          </h1>
          <p className="text-sm text-gray-500 mt-1">Record final product and scrap details.</p>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-8">
          
          {/* Section 1: Product Details */}
          <div>
            <h3 className="text-sm font-bold text-gray-800 mb-4 border-b pb-2">Product Details</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className={labelClass}>Date <span className="text-red-500">*</span></label>
                <input type="date" name="fg_date" required value={formData.fg_date} onChange={handleChange} className={inputClass} />
              </div>
              
              {/* 👇 NAYA MIS DROPDOWN 👇 */}
              <div className="relative" ref={misDropdownRef}>
                <label className={labelClass}>Link MIS Ref (Optional)</label>
                <div 
                  onClick={() => setIsMisDropdownOpen(!isMisDropdownOpen)}
                  className="w-full h-10 px-3 border border-gray-300 rounded-md bg-white flex items-center justify-between cursor-pointer hover:border-[#0f4a4a] transition"
                >
                  <span className={`text-sm ${formData.mis_ref_no ? 'text-gray-800 font-semibold' : 'text-gray-400'}`}>
                    {formData.mis_ref_no ? formData.mis_ref_no : '-- Select Material Issue Slip --'}
                  </span>
                  <ChevronDown size={16} className="text-gray-500" />
                </div>

                {isMisDropdownOpen && (
                  <div className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-xl max-h-64 overflow-hidden flex flex-col">
                    <div className="p-2 border-b border-gray-100 sticky top-0 bg-white">
                      <div className="relative">
                        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                          type="text"
                          placeholder="Search MIS Ref or Dept..."
                          value={misSearchTerm}
                          onChange={(e) => setMisSearchTerm(e.target.value)}
                          className="w-full h-8 pl-8 pr-8 text-sm border border-gray-200 rounded bg-gray-50 focus:outline-none focus:ring-1 focus:ring-[#0f4a4a]"
                          onClick={(e) => e.stopPropagation()}
                        />
                        {misSearchTerm && (
                          <button type="button" onClick={() => setMisSearchTerm('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400">
                            <X size={14} />
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="overflow-y-auto flex-1">
                      {filteredMIS.length === 0 ? (
                        <div className="p-4 text-center text-sm text-gray-500">No MIS found</div>
                      ) : (
                        filteredMIS.map(mis => (
                          <div key={mis._id} onClick={() => {
                            setFormData({ ...formData, mis_id: mis._id, mis_ref_no: mis.ref_no });
                            setIsMisDropdownOpen(false);
                            setMisSearchTerm('');
                          }} className="px-4 py-2 hover:bg-[#F0FDF9] cursor-pointer border-b border-gray-50 last:border-0">
                            <div className="text-sm font-semibold text-gray-800">{mis.ref_no}</div>
                            <div className="text-xs text-gray-500">Dept: {mis.department} | To: {mis.issued_to}</div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
              {/* 👆 MIS DROPDOWN END 👆 */}

              <div>
                <label className={labelClass}>Product Type <span className="text-red-500">*</span></label>
                <select name="product_type" required value={formData.product_type} onChange={handleChange} className={`${inputClass} cursor-pointer`}>
                  <option value="New">New </option>
                  <option value="Existing">Existing </option>
                </select>
              </div>
            </div>

            <div className="mt-6">
              {formData.product_type === 'Existing' ? (
                <div className="relative" ref={itemDropdownRef}>
                  <label className={labelClass}>Select Product <span className="text-red-500">*</span></label>
                  <div 
                    onClick={() => setIsItemDropdownOpen(!isItemDropdownOpen)}
                    className="w-full h-10 px-3 border border-gray-300 rounded-md bg-white flex items-center justify-between cursor-pointer hover:border-[#0f4a4a] transition"
                  >
                    <span className="text-sm text-gray-700">
                      {formData.item_id ? `${formData.name} (${formData.code})` : '-- Select Product from Master --'}
                    </span>
                    <ChevronDown size={16} className="text-gray-500" />
                  </div>

                  {isItemDropdownOpen && (
                    <div className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-xl max-h-64 overflow-hidden flex flex-col">
                      <div className="p-2 border-b border-gray-100 sticky top-0 bg-white">
                        <div className="relative">
                          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                          <input
                            type="text"
                            placeholder="Search product..."
                            value={itemSearchTerm}
                            onChange={(e) => setItemSearchTerm(e.target.value)}
                            className="w-full h-8 pl-8 pr-8 text-sm border border-gray-200 rounded bg-gray-50 focus:outline-none focus:ring-1 focus:ring-[#0f4a4a]"
                            onClick={(e) => e.stopPropagation()}
                          />
                        </div>
                      </div>
                      <div className="overflow-y-auto flex-1">
                        {filteredItems.length === 0 ? (
                          <div className="p-4 text-center text-sm text-gray-500">No products found</div>
                        ) : (
                          filteredItems.map(item => (
                            <div key={item._id} onClick={() => handleSelectItem(item)} className="px-4 py-2 hover:bg-[#F0FDF9] cursor-pointer border-b border-gray-50 last:border-0">
                              <div className="text-sm font-semibold text-gray-800">{item.part_name}</div>
                              <div className="text-xs text-gray-500">Code: {item.part_no} | Unit: {item.unit}</div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className={labelClass}>Product Name <span className="text-red-500">*</span></label>
                    <input type="text" name="name" required value={formData.name} onChange={handleChange} placeholder="e.g. Valve A" className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>Product Code <span className="text-red-500">*</span></label>
                    <input type="text" name="code" required value={formData.code} onChange={handleChange} placeholder="e.g. VLV-01" className={inputClass} />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Section 2: Production & Scrap */}
          <div>
            <h3 className="text-sm font-bold text-gray-800 mb-4 border-b pb-2">Production & Scrap</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="md:col-span-2">
                <label className={labelClass}>Quantity Produced <span className="text-red-500">*</span></label>
                <input type="number" name="quantity" required min="0.01" step="any" value={formData.quantity} onChange={handleChange} placeholder="0.00" className={inputClass} />
              </div>
              <div className="md:col-span-2">
                <label className={labelClass}>Unit</label>
                <select name="unit" value={formData.unit} onChange={handleChange} className={`${inputClass} cursor-pointer`}>
                  <option value="Nos">Nos</option>
                  <option value="Kg">Kg</option>
                  <option value="Meter">Meter</option>
                  <option value="Set">Set</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-6 p-4 bg-red-50 border border-red-100 rounded-lg">
              <div className="md:col-span-2">
                <label className="block text-[11px] font-bold text-red-700 uppercase tracking-wide mb-1.5">Scrap Quantity</label>
                <input type="number" name="scrap_quantity" min="0" step="any" value={formData.scrap_quantity} onChange={handleChange} placeholder="0.00" className="w-full h-10 px-3 border border-red-200 rounded-md focus:outline-none focus:ring-1 focus:ring-red-500 text-sm" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-[11px] font-bold text-red-700 uppercase tracking-wide mb-1.5">Scrap Unit</label>
                <select name="scrap_unit" value={formData.scrap_unit} onChange={handleChange} className="w-full h-10 px-3 border border-red-200 rounded-md focus:outline-none focus:ring-1 focus:ring-red-500 text-sm cursor-pointer bg-white">
                  <option value="Kg">Kg</option>
                  <option value="Nos">Nos</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 3: Remarks */}
          <div>
            <h3 className="text-sm font-bold text-gray-800 mb-4 border-b pb-2">Remarks (Optional)</h3>
            <input type="text" name="remarks" value={formData.remarks} onChange={handleChange} placeholder="Any additional notes..." className={inputClass} />
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
                <Save size={18} /> {loading ? 'Saving...' : (editId ? 'Update Entry' : 'Save Entry')}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddFinishedGood;