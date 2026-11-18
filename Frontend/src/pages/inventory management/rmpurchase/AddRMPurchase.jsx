

import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Save, Search, ChevronDown, X, Plus, Trash2 } from 'lucide-react'; 
import BASE_URL from '../../../config/Config'; 

const AddRMPurchase = ({ onClose, onRefresh, editId }) => {
  
  const [loading, setLoading] = useState(false);
  const [itemsList, setItemsList] = useState([]); 
  
  const [activeDropdownIndex, setActiveDropdownIndex] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef(null);

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
    setActiveDropdownIndex(null); 
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
        onRefresh('Entry updated successfully!');
      } else {
        await axios.post(`${BASE_URL}/api/rm-purchase`, payload, config);
        onRefresh('All items saved under one invoice!');
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
  const inputClass = "w-full h-10 px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#063C3F] focus:border-[#063C3F] text-sm text-gray-800 transition-colors bg-white";

  return (
    
    <div 
      className="fixed inset-0 z-[100] flex justify-center items-start pt-10 pb-10 overflow-y-auto p-4 font-sans" 
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.6)' }}
    >
      
      {}
      <div className="w-full max-w-5xl bg-white rounded-xl shadow-2xl flex flex-col max-h-[85vh] overflow-hidden">
        
        {/* HEADER */}
        <div className="px-6 py-4 bg-gradient-to-r from-[#0f4a4a] to-[#063C3F] flex justify-between items-center shrink-0">
          <div>
            <h1 className="text-xl font-bold text-white">
              {editId ? 'Edit Purchase Entry' : 'Add New Purchase'}
            </h1>
            <p className="text-sm text-teal-100 mt-1">Fill in the details to record raw material purchases.</p>
          </div>
          <button 
            type="button" 
            onClick={onClose} 
            className="text-white hover:bg-white/20 p-2 rounded-full transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          
          {/* SCROLLABLE BODY */}
          <div className="p-6 md:p-8 space-y-8 overflow-y-auto">
            
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

            {}
            <div>
              <div className="flex justify-between items-center mb-4 border-b pb-2">
                <h3 className="text-sm font-bold text-gray-800">Material Details</h3>
                <button type="button" onClick={addNewItem} className="px-3 py-1.5 bg-[#063C3F] text-white text-xs font-semibold rounded flex items-center gap-1 hover:bg-[#05292B] transition cursor-pointer">
                  <Plus size={14} /> Add Another Item
                </button>
              </div>
              
              {formData.items.map((item, index) => (
                <div key={index} className="p-4 mb-4 border border-gray-200 rounded-lg bg-gray-50/50 relative">
                  
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
                        <option value="Existing">Existing</option>aryant
                      </select>
                    </div>

                    {item.rm_type === 'Existing' ? (
                      <div className="md:col-span-2 relative" ref={activeDropdownIndex === index ? dropdownRef : null}>
                        <label className={labelClass}>Select Material <span className="text-red-500">*</span></label>
                        <div 
                          onClick={() => setActiveDropdownIndex(activeDropdownIndex === index ? null : index)}
                          className="w-full h-10 px-3 border border-gray-300 rounded-md bg-white flex items-center justify-between cursor-pointer hover:border-[#063C3F] transition"
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
                                  className="w-full h-8 pl-8 pr-8 text-sm border border-gray-200 rounded bg-gray-50 focus:outline-none focus:ring-1 focus:ring-[#063C3F]"
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
          </div>

          {/* FOOTER */}
          <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-end gap-3 shrink-0">
            <button 
              type="button" 
              onClick={onClose} 
              className="px-5 py-2 text-sm font-semibold text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition cursor-pointer"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={loading} 
              className="px-6 py-2 text-sm font-bold text-white bg-[#063C3F] hover:bg-[#05292B] rounded-lg shadow-sm flex items-center gap-2 transition disabled:opacity-50 cursor-pointer"
            >
              <Save size={18} /> {loading ? 'Saving...' : (editId ? 'Update Purchase' : 'Save All Items')}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default AddRMPurchase;