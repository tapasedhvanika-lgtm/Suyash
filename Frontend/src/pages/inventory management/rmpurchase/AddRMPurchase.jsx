// import React, { useState, useEffect, useRef } from 'react';
// import { useNavigate, useSearchParams } from 'react-router-dom';
// import axios from 'axios';
// import { ArrowLeft, Save, Search, ChevronDown, X } from 'lucide-react';
// import BASE_URL from '../../../config/Config'; // 👈 Config madhun import kela

// const AddRMPurchase = () => {
//   const navigate = useNavigate();
//   const [searchParams] = useSearchParams();
//   const editId = searchParams.get('id'); 
  
//   const [loading, setLoading] = useState(false);
//   const [itemsList, setItemsList] = useState([]); 
  
//   // Dropdown States
//   const [isDropdownOpen, setIsDropdownOpen] = useState(false);
//   const [searchTerm, setSearchTerm] = useState('');
//   const dropdownRef = useRef(null);

//   const [formData, setFormData] = useState({
//     purchase_date: new Date().toISOString().split('T')[0],
//     rm_type: 'New',
//     item_id: '',
//     name: '',
//     code: '',
//     quantity: '',
//     unit: 'Kg',
//     party_name: '',
//     invoice_no: ''
//   });

//   useEffect(() => {
//     if (editId) fetchSingleData(editId);
//     fetchItems(); 

//     // Close dropdown on outside click
//     const handleClickOutside = (event) => {
//       if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
//         setIsDropdownOpen(false);
//       }
//     };
//     document.addEventListener('mousedown', handleClickOutside);
//     return () => document.removeEventListener('mousedown', handleClickOutside);
//   }, [editId]);

//   const fetchSingleData = async (id) => {
//     try {
//       const token = localStorage.getItem('token');
//       // 👇 BASE_URL lagaya
//       const res = await axios.get(`${BASE_URL}/api/rm-purchase/${id}`, {
//         headers: { Authorization: `Bearer ${token}` }
//       });
//       const data = res.data.data;
//       data.purchase_date = new Date(data.purchase_date).toISOString().split('T')[0];
//       setFormData(data);
//     } catch (error) {
//       console.error(error);
//       alert("Error fetching data");
//     }
//   };

//   const fetchItems = async () => {
//     try {
//       const token = localStorage.getItem('token');
//       // 👇 BASE_URL lagaya
//       const res = await axios.get(`${BASE_URL}/api/items`, { 
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

//   // Dropdown item select karne par
//   const handleSelectItem = (item) => {
//     setFormData({
//       ...formData,
//       item_id: item._id,
//       name: item.part_name,
//       code: item.part_no,
//       unit: item.unit || 'Nos'
//     });
//     setIsDropdownOpen(false);
//     setSearchTerm('');
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     try {
//       const token = localStorage.getItem('token');
//       const config = { headers: { Authorization: `Bearer ${token}` } };
      
//       if (editId) {
//         // 👇 BASE_URL lagaya
//         await axios.put(`${BASE_URL}/api/rm-purchase/${editId}`, formData, config);
//         navigate('/inventorymanagement/rmpurchase', { state: { toast: 'Entry updated successfully!' } });
//       } else {
//         // 👇 BASE_URL lagaya
//         await axios.post(`${BASE_URL}/api/rm-purchase`, formData, config);
//         navigate('/inventorymanagement/rmpurchase', { state: { toast: 'Purchase entry saved successfully!' } });
//       }
//     } catch (error) {
//       alert(error.response?.data?.message || "Something went wrong");
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Filter items based on search term
//   const filteredItems = itemsList.filter(item => 
//     item.part_name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
//     item.part_no?.toLowerCase().includes(searchTerm.toLowerCase())
//   );

//   const labelClass = "block text-[11px] font-bold text-gray-500 uppercase tracking-wide mb-1.5";
//   const inputClass = "w-full h-10 px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#0f4a4a] focus:border-[#0f4a4a] text-sm text-gray-800 transition-colors bg-white";

//   return (
//     <div className="flex justify-center p-6 md:p-8 bg-[#F8F9FA] min-h-screen font-sans">
      
//       <div className="w-full max-w-4xl bg-white rounded-xl shadow-[0_2px_10px_-3px_rgba(0,0,0,0.1)] border border-gray-200 overflow-hidden">
        
//         {/* Header */}
//         <div className="px-8 py-5 border-b border-gray-200 bg-gray-50">
//           <h1 className="text-xl font-bold text-gray-800">
//             {editId ? 'Edit Purchase Entry' : 'Add New Purchase'}
//           </h1>
//           <p className="text-sm text-gray-500 mt-1">Fill in the details to record a raw material purchase.</p>
//         </div>

//         {/* Form */}
//         <form onSubmit={handleSubmit} className="p-8 space-y-8">
          
//           {/* Section 1 */}
//           <div>
//             <h3 className="text-sm font-bold text-gray-800 mb-4 border-b pb-2">Purchase Information</h3>
//             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//               <div>
//                 <label className={labelClass}>Purchase Date <span className="text-red-500">*</span></label>
//                 <input type="date" name="purchase_date" required value={formData.purchase_date} onChange={handleChange} className={inputClass} />
//               </div>
//               <div>
//                 <label className={labelClass}>Ref No</label>
//                 <input type="text" value={editId ? formData.ref_no : "Auto generated on save"} disabled className="w-full h-10 px-3 border border-gray-200 rounded-md bg-gray-50 text-sm text-gray-400 cursor-not-allowed" />
//               </div>
//               <div>
//                 <label className={labelClass}>RM Type <span className="text-red-500">*</span></label>
//                 <select name="rm_type" required value={formData.rm_type} onChange={handleChange} className={`${inputClass} cursor-pointer`}>
//                   <option value="New">New </option>
//                   <option value="Existing">Existing </option>
//                 </select>
//               </div>
//             </div>
//           </div>

//           {/* Section 2 */}
//           <div>
//             <h3 className="text-sm font-bold text-gray-800 mb-4 border-b pb-2">Material Details</h3>
            
//             {formData.rm_type === 'Existing' ? (
//               <div className="relative" ref={dropdownRef}>
//                 <label className={labelClass}>Select Raw Material <span className="text-red-500">*</span></label>
                
//                 {/* Searchable Dropdown Trigger */}
//                 <div 
//                   onClick={() => setIsDropdownOpen(!isDropdownOpen)}
//                   className="w-full h-10 px-3 border border-gray-300 rounded-md bg-white flex items-center justify-between cursor-pointer hover:border-[#0f4a4a] transition"
//                 >
//                   <span className="text-sm text-gray-700">
//                     {formData.item_id ? `${formData.name} (${formData.code})` : '-- Select Item from Master --'}
//                   </span>
//                   <ChevronDown size={16} className="text-gray-500" />
//                 </div>

//                 {/* Dropdown Menu */}
//                 {isDropdownOpen && (
//                   <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-xl max-h-64 overflow-hidden flex flex-col">
//                     {/* Search Input inside dropdown */}
//                     <div className="p-2 border-b border-gray-100 sticky top-0 bg-white">
//                       <div className="relative">
//                         <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
//                         <input
//                           type="text"
//                           placeholder="Search by name or code..."
//                           value={searchTerm}
//                           onChange={(e) => setSearchTerm(e.target.value)}
//                           className="w-full h-8 pl-8 pr-8 text-sm border border-gray-200 rounded bg-gray-50 focus:outline-none focus:ring-1 focus:ring-[#0f4a4a]"
//                           onClick={(e) => e.stopPropagation()} // prevent closing
//                         />
//                         {searchTerm && (
//                           <button onClick={() => setSearchTerm('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400">
//                             <X size={14} />
//                           </button>
//                         )}
//                       </div>
//                     </div>
                    
//                     {/* List */}
//                     <div className="overflow-y-auto flex-1">
//                       {filteredItems.length === 0 ? (
//                         <div className="p-4 text-center text-sm text-gray-500">No items found</div>
//                       ) : (
//                         filteredItems.map(item => (
//                           <div 
//                             key={item._id}
//                             onClick={() => handleSelectItem(item)}
//                             className="px-4 py-2 hover:bg-[#F0FDF9] cursor-pointer border-b border-gray-50 last:border-0"
//                           >
//                             <div className="text-sm font-semibold text-gray-800">{item.part_name}</div>
//                             <div className="text-xs text-gray-500">Code: {item.part_no} | Unit: {item.unit}</div>
//                           </div>
//                         ))
//                       )}
//                     </div>
//                   </div>
//                 )}
//               </div>
//             ) : (
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                 <div>
//                   <label className={labelClass}>RM Name <span className="text-red-500">*</span></label>
//                   <input type="text" name="name" required value={formData.name} onChange={handleChange} placeholder="e.g. Brass Rod" className={inputClass} />
//                 </div>
//                 <div>
//                   <label className={labelClass}>RM Code <span className="text-red-500">*</span></label>
//                   <input type="text" name="code" required value={formData.code} onChange={handleChange} placeholder="e.g. BR-01" className={inputClass} />
//                 </div>
//               </div>
//             )}

//             <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
//               <div>
//                 <label className={labelClass}>Quantity <span className="text-red-500">*</span></label>
//                 <input type="number" name="quantity" required min="0.01" step="any" value={formData.quantity} onChange={handleChange} placeholder="0.00" className={inputClass} />
//               </div>
//               <div>
//                 <label className={labelClass}>Unit</label>
//                 <select name="unit" value={formData.unit} onChange={handleChange} className={`${inputClass} cursor-pointer`}>
//                   <option value="Kg">Kg</option>
//                   <option value="Nos">Nos</option>
//                   <option value="Meter">Meter</option>
//                   <option value="Set">Set</option>
//                   <option value="Piece">Piece</option>
//                   <option value="Sheet">Sheet</option>
//                   <option value="Roll">Roll</option>
//                 </select>
//               </div>
//             </div>
//           </div>

//           {/* Section 3 */}
//           <div>
//             <h3 className="text-sm font-bold text-gray-800 mb-4 border-b pb-2">Vendor Details</h3>
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//               <div>
//                 <label className={labelClass}>Party Name <span className="text-red-500">*</span></label>
//                 <input type="text" name="party_name" required value={formData.party_name} onChange={handleChange} placeholder="e.g. ABC Metals" className={inputClass} />
//               </div>
//               <div>
//                 <label className={labelClass}>Invoice No <span className="text-red-500">*</span></label>
//                 <input type="text" name="invoice_no" required value={formData.invoice_no} onChange={handleChange} placeholder="e.g. INV-101" className={inputClass} />
//               </div>
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
//                 <Save size={18} /> {loading ? 'Saving...' : (editId ? 'Update Purchase' : 'Add Purchase')}
//               </button>
//             </div>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// };

// export default AddRMPurchase;

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, Save, Search, ChevronDown, X, Plus, Trash2 } from 'lucide-react';
import BASE_URL from '../../../config/Config'; 

const AddRMPurchase = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get('id'); 
  
  const [loading, setLoading] = useState(false);
  const [itemsList, setItemsList] = useState([]); 
  
  // Dropdown States
  const [activeDropdownIndex, setActiveDropdownIndex] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef(null);

  // Form State
  const [formData, setFormData] = useState({
    purchase_date: new Date().toISOString().split('T')[0],
    party_name: '',
    invoice_no: '',
    items: [
      { rm_type: 'New', item_id: '', name: '', code: '', quantity: '', unit: 'Kg' }
    ]
  });

  useEffect(() => {
    if (editId) fetchSingleData(editId);
    fetchItems(); 

    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setActiveDropdownIndex(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [editId]);

  const fetchSingleData = async (id) => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${BASE_URL}/api/rm-purchase/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = res.data.data;
      
      setFormData({
        purchase_date: new Date(data.purchase_date).toISOString().split('T')[0],
        party_name: data.party_name,
        invoice_no: data.invoice_no,
        items: [{
          rm_type: data.rm_type,
          item_id: data.item_id || '',
          name: data.name,
          code: data.code,
          quantity: data.quantity,
          unit: data.unit
        }]
      });
    } catch (error) {
      console.error(error);
      alert("Error fetching data");
    }
  };

  const fetchItems = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${BASE_URL}/api/items`, { 
        headers: { Authorization: `Bearer ${token}` }
      });
      setItemsList(res.data.data || res.data); 
    } catch (error) {
      console.log("Items fetch error:", error);
    }
  };

  const handleHeaderChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...formData.items];
    newItems[index][field] = value;
    setFormData({ ...formData, items: newItems });
  };

  const handleSelectItem = (index, item) => {
    const newItems = [...formData.items];
    newItems[index] = {
      ...newItems[index],
      item_id: item._id,
      name: item.part_name,
      code: item.part_no,
      unit: item.unit || 'Nos'
    };
    setFormData({ ...formData, items: newItems });
    setActiveDropdownIndex(null);
    setSearchTerm('');
  };

  const addNewItem = () => {
    setFormData({
      ...formData,
      items: [
        ...formData.items,
        { rm_type: 'New', item_id: '', name: '', code: '', quantity: '', unit: 'Kg' }
      ]
    });
  };

  const removeItem = (index) => {
    if (formData.items.length === 1) return;
    const newItems = formData.items.filter((_, i) => i !== index);
    setFormData({ ...formData, items: newItems });
    setActiveDropdownIndex(null); // Dropdown close kar do agar khula ho
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      
      const payload = {
        purchase_date: formData.purchase_date,
        party_name: formData.party_name,
        invoice_no: formData.invoice_no,
        items: formData.items
      };

      if (editId) {
        const singlePayload = { ...payload, ...payload.items[0] };
        await axios.put(`${BASE_URL}/api/rm-purchase/${editId}`, singlePayload, config);
        navigate('/inventorymanagement/rmpurchase', { state: { toast: 'Entry updated successfully!' } });
      } else {
        await axios.post(`${BASE_URL}/api/rm-purchase`, payload, config);
        navigate('/inventorymanagement/rmpurchase', { state: { toast: 'All items saved under one invoice!' } });
      }
    } catch (error) {
      alert(error.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const filteredItems = itemsList.filter(item => 
    item.part_name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    item.part_no?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const labelClass = "block text-[11px] font-bold text-gray-500 uppercase tracking-wide mb-1.5";
  const inputClass = "w-full h-10 px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#0f4a4a] focus:border-[#0f4a4a] text-sm text-gray-800 transition-colors bg-white";

  return (
    <div className="flex justify-center p-6 md:p-8 bg-[#F8F9FA] min-h-screen font-sans">
      <div className="w-full max-w-5xl bg-white rounded-xl shadow-[0_2px_10px_-3px_rgba(0,0,0,0.1)] border border-gray-200 overflow-visible">
        
        <div className="px-8 py-5 border-b border-gray-200 bg-gray-50 rounded-t-xl">
          <h1 className="text-xl font-bold text-gray-800">
            {editId ? 'Edit Purchase Entry' : 'Add New Purchase'}
          </h1>
          <p className="text-sm text-gray-500 mt-1">Fill in the details to record raw material purchases.</p>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-8">
          
          {/* Section 1: Common Details */}
          <div>
            <h3 className="text-sm font-bold text-gray-800 mb-4 border-b pb-2">Purchase & Vendor Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div>
                <label className={labelClass}>Purchase Date <span className="text-red-500">*</span></label>
                <input type="date" name="purchase_date" required value={formData.purchase_date} onChange={handleHeaderChange} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Ref No</label>
                <input type="text" value={editId ? "Editing existing" : "Auto generated"} disabled className="w-full h-10 px-3 border border-gray-200 rounded-md bg-gray-50 text-sm text-gray-400 cursor-not-allowed" />
              </div>
              <div>
                <label className={labelClass}>Party Name <span className="text-red-500">*</span></label>
                <input type="text" name="party_name" required value={formData.party_name} onChange={handleHeaderChange} placeholder="e.g. ABC Metals" className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Invoice No <span className="text-red-500">*</span></label>
                <input type="text" name="invoice_no" required value={formData.invoice_no} onChange={handleHeaderChange} placeholder="e.g. INV-101" className={inputClass} />
              </div>
            </div>
          </div>

          {/* Section 2: Dynamic Items */}
          <div>
            <div className="flex justify-between items-center mb-4 border-b pb-2">
              <h3 className="text-sm font-bold text-gray-800">Material Details</h3>
              <button type="button" onClick={addNewItem} className="px-3 py-1.5 bg-[#0f4a4a] text-white text-xs font-semibold rounded flex items-center gap-1 hover:bg-[#0a3636] transition">
                <Plus size={14} /> Add Another Item
              </button>
            </div>
            
            {formData.items.map((item, index) => (
              <div key={index} className="p-4 mb-4 border border-gray-200 rounded-lg bg-gray-50/50 relative">
                
                {}
                {formData.items.length > 1 && !editId && (
                  <button 
                    type="button" 
                    onClick={() => removeItem(index)} 
                    className="absolute top-4 right-4 z-10 cursor-pointer text-red-500 hover:text-red-700 bg-red-100 hover:bg-red-200 p-1.5 rounded-md transition-colors"
                    title="Remove Item"
                  >
                    <Trash2 size={16} />
                  </button>
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className={labelClass}>RM Type <span className="text-red-500">*</span></label>
                    <select 
                      value={item.rm_type} 
                      onChange={(e) => handleItemChange(index, 'rm_type', e.target.value)} 
                      className={`${inputClass} cursor-pointer`}
                    >
                      <option value="New">New</option>
                      <option value="Existing">Existing</option>
                    </select>
                  </div>

                  {item.rm_type === 'Existing' ? (
                    <div className="md:col-span-2 relative" ref={activeDropdownIndex === index ? dropdownRef : null}>
                      <label className={labelClass}>Select Material <span className="text-red-500">*</span></label>
                      <div 
                        onClick={() => setActiveDropdownIndex(activeDropdownIndex === index ? null : index)}
                        className="w-full h-10 px-3 border border-gray-300 rounded-md bg-white flex items-center justify-between cursor-pointer hover:border-[#0f4a4a] transition"
                      >
                        <span className="text-sm text-gray-700">
                          {item.item_id ? `${item.name} (${item.code})` : '-- Select Item from Master --'}
                        </span>
                        <ChevronDown size={16} className="text-gray-500" />
                      </div>

                      {activeDropdownIndex === index && (
                        <div className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-xl max-h-64 overflow-hidden flex flex-col">
                          <div className="p-2 border-b border-gray-100 sticky top-0 bg-white">
                            <div className="relative">
                              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                              <input
                                type="text"
                                placeholder="Search by name or code..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full h-8 pl-8 pr-8 text-sm border border-gray-200 rounded bg-gray-50 focus:outline-none focus:ring-1 focus:ring-[#0f4a4a]"
                                onClick={(e) => e.stopPropagation()}
                              />
                            </div>
                          </div>
                          <div className="overflow-y-auto flex-1">
                            {filteredItems.length === 0 ? (
                              <div className="p-4 text-center text-sm text-gray-500">No items found</div>
                            ) : (
                              filteredItems.map(masterItem => (
                                <div 
                                  key={masterItem._id}
                                  onClick={() => handleSelectItem(index, masterItem)}
                                  className="px-4 py-2 hover:bg-[#F0FDF9] cursor-pointer border-b border-gray-50 last:border-0"
                                >
                                  <div className="text-sm font-semibold text-gray-800">{masterItem.part_name}</div>
                                  <div className="text-xs text-gray-500">Code: {masterItem.part_no} | Unit: {masterItem.unit}</div>
                                </div>
                              ))
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <>
                      <div>
                        <label className={labelClass}>RM Name <span className="text-red-500">*</span></label>
                        <input type="text" value={item.name} onChange={(e) => handleItemChange(index, 'name', e.target.value)} placeholder="e.g. Brass Rod" className={inputClass} required />
                      </div>
                      <div>
                        <label className={labelClass}>RM Code <span className="text-red-500">*</span></label>
                        <input type="text" value={item.code} onChange={(e) => handleItemChange(index, 'code', e.target.value)} placeholder="e.g. BR-01" className={inputClass} required />
                      </div>
                    </>
                  )}

                  <div>
                    <label className={labelClass}>Quantity <span className="text-red-500">*</span></label>
                    <input type="number" value={item.quantity} onChange={(e) => handleItemChange(index, 'quantity', e.target.value)} required min="0.01" step="any" placeholder="0.00" className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>Unit</label>
                    <select value={item.unit} onChange={(e) => handleItemChange(index, 'unit', e.target.value)} className={`${inputClass} cursor-pointer`}>
                      <option value="Kg">Kg</option>
                      <option value="Nos">Nos</option>
                      <option value="Meter">Meter</option>
                      <option value="Set">Set</option>
                      <option value="Piece">Piece</option>
                      <option value="Sheet">Sheet</option>
                      <option value="Roll">Roll</option>
                    </select>
                  </div>
                </div>
              </div>
            ))}
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
                <Save size={18} /> {loading ? 'Saving...' : (editId ? 'Update Purchase' : 'Save All Items')}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddRMPurchase;