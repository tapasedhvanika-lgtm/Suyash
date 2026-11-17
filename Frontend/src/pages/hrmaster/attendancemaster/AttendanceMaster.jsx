import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { 
    FiDownload, FiEdit, FiTrash2, FiEye, FiSearch, 
    FiX, FiMoreVertical, FiLogIn, FiLogOut, FiClock
} from 'react-icons/fi';

const API_BASE_URL = 'http://localhost:5009/api'; 

const AttendanceMaster = () => {
    const [employees, setEmployees] = useState([]);
    const [attendanceData, setAttendanceData] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    
    // Modals State
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    
    // Check In / Check Out Modal State
    const [isActionModalOpen, setIsActionModalOpen] = useState(false);
    const [actionType, setActionType] = useState(''); 
    const [actionTime, setActionTime] = useState('');
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [selectedAttendance, setSelectedAttendance] = useState(null);

    // Menu State
    const [openMenuId, setOpenMenuId] = useState(null);
    const menuRef = useRef(null);

    // Edit Form State
    const [formData, setFormData] = useState({ 
        _id: '', EmployeeID: '', Date: '', CheckInTime: '', CheckOutTime: '', Status: 'Present' 
    });

    const getEmployeeName = (emp) => {
        if (!emp) return 'Unknown';
        const fName = emp.FirstName || emp.firstName || '';
        const lName = emp.LastName || emp.lastName || '';
        return `${fName} ${lName}`.trim() || emp.name || emp.EmployeeName || 'Unknown Employee';
    };

    const fetchData = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const headers = token ? { Authorization: `Bearer ${token}` } : {};

            const [empRes, attRes] = await Promise.all([
                axios.get(`${API_BASE_URL}/employees`, { headers }),
                axios.get(`${API_BASE_URL}/daily-attendance`, { headers })
            ]);

            const empData = empRes.data.data || empRes.data || [];
            const attData = attRes.data.data || [];

            setEmployees(empData);
            setAttendanceData(attData);
        } catch (error) {
            console.error("Error fetching data:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) setOpenMenuId(null);
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Action Handlers (Check In/Out, View, Edit, Delete)
    const handleCheckInClick = (emp, att) => {
        setOpenMenuId(null);
        if (att && att.CheckInTime) {
            alert("This employee has already checked in.");
            return;
        }
        openActionModal(emp, 'checkin', att);
    };

    const handleCheckOutClick = (emp, att) => {
        setOpenMenuId(null);
        if (!att || !att.CheckInTime) {
            alert("Please check in first.");
            return;
        }
        if (att.CheckOutTime) {
            alert("This employee has already checked out.");
            return;
        }
        openActionModal(emp, 'checkout', att);
    };

    const handleViewClick = (att) => {
        setOpenMenuId(null);
        if (!att) return alert("No attendance record found.");
        setSelectedAttendance(att);
        setIsViewModalOpen(true);
    };

    const handleEditClick = (att) => {
        setOpenMenuId(null);
        if (!att) return alert("No attendance record found.");
        const formatDateTime = (dateStr) => dateStr ? new Date(dateStr).toISOString().slice(0, 16) : '';
        setFormData({
            _id: att._id,
            EmployeeID: att.EmployeeID?._id || att.EmployeeID,
            Date: att.Date ? att.Date.split('T')[0] : '',
            CheckInTime: formatDateTime(att.CheckInTime),
            CheckOutTime: formatDateTime(att.CheckOutTime),
            Status: att.Status
        });
        setIsEditModalOpen(true);
    };

    const handleDeleteClick = (att) => {
        setOpenMenuId(null);
        if (!att) return alert("No attendance record found.");
        if (window.confirm("Are you sure you want to delete this attendance record?")) {
            deleteAttendance(att._id);
        }
    };

    // Open Modal
    const openActionModal = (emp, type, existingAtt = null) => {
        setSelectedEmployee(emp);
        setSelectedAttendance(existingAtt);
        setActionType(type);
        
        const now = new Date();
        const tzOffset = now.getTimezoneOffset() * 60000;
        const localISOTime = (new Date(now - tzOffset)).toISOString().slice(0, 16);
        setActionTime(localISOTime);
        
        setIsActionModalOpen(true);
    };

    // Submit Check-In/Out
    const handleActionSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            const headers = token ? { Authorization: `Bearer ${token}` } : {};
            
            if (actionType === 'checkin') {
                if (selectedAttendance) {
                    let updateData = { ...selectedAttendance, CheckInTime: actionTime, Date: actionTime };
                    await axios.put(`${API_BASE_URL}/daily-attendance/update/${selectedAttendance._id}`, updateData, { headers });
                } else {
                    let newData = { 
                        EmployeeID: selectedEmployee._id, 
                        Date: actionTime, 
                        CheckInTime: actionTime, 
                        CheckOutTime: null, 
                        Status: 'Present' 
                    };
                    await axios.post(`${API_BASE_URL}/daily-attendance/add`, newData, { headers });
                }
            } else {
                let updateData = { ...selectedAttendance, CheckOutTime: actionTime };
                await axios.put(`${API_BASE_URL}/daily-attendance/update/${selectedAttendance._id}`, updateData, { headers });
            }
            
            setIsActionModalOpen(false);
            fetchData();
        } catch (error) {
            alert("Error updating time");
        }
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            const headers = token ? { Authorization: `Bearer ${token}` } : {};
            await axios.put(`${API_BASE_URL}/daily-attendance/update/${formData._id}`, formData, { headers });
            setIsEditModalOpen(false);
            fetchData();
        } catch (error) { alert(error.response?.data?.message || "Error saving record"); }
    };

    const deleteAttendance = async (id) => {
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`${API_BASE_URL}/daily-attendance/delete/${id}`, { headers: token ? { Authorization: `Bearer ${token}` } : {} });
            fetchData();
        } catch (error) { alert("Error deleting record"); }
    };

    const handleExportExcel = () => window.open(`${API_BASE_URL}/daily-attendance/export`, '_blank');

    // Merge Employee and Attendance Data
    const mergedData = employees.map(emp => {
        const empAttendance = attendanceData.find(att => (att.EmployeeID?._id === emp._id || att.EmployeeID === emp._id));
        return { 
            employee: emp, 
            attendance: empAttendance || null 
        };
    });

    const filteredData = mergedData.filter(({ employee }) => 
        getEmployeeName(employee).toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="p-6 bg-[#f8fafc] min-h-screen font-sans relative">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Attendance Master</h1>
                <p className="text-sm text-gray-500 mt-1">Manage employee daily check-in and check-out records</p>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                <div className="p-4 flex flex-col md:flex-row justify-between items-center gap-4 border-b border-gray-100">
                    <div className="relative w-full md:w-80">
                        <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input type="text" placeholder="Search by employee name..." className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0f766e]" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                    </div>
                    <div className="flex gap-3 w-full md:w-auto">
                        <button onClick={handleExportExcel} className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50"><FiDownload /> Export Excel</button>
                    </div>
                </div>

                <div className="overflow-x-auto min-h-[300px]">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-[#115e59] text-white">
                            <tr>
                                <th className="p-4 font-medium">Employee</th>
                                <th className="p-4 font-medium">Date</th>
                                <th className="p-4 font-medium">In Time</th>
                                <th className="p-4 font-medium">Out Time</th>
                                <th className="p-4 font-medium">Status</th>
                                <th className="p-4 font-medium text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                <tr><td colSpan="6" className="p-8 text-center text-gray-500">Loading employees...</td></tr>
                            ) : filteredData.length > 0 ? (
                                filteredData.map(({ employee, attendance }) => (
                                    <tr key={employee._id} className="hover:bg-gray-50 transition-colors relative">
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center font-bold text-xs uppercase">
                                                    {getEmployeeName(employee).charAt(0)}
                                                </div>
                                                <span className="font-medium text-gray-800">{getEmployeeName(employee)}</span>
                                            </div>
                                        </td>
                                        <td className="p-4 text-gray-600">
                                            {attendance ? new Date(attendance.Date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '-'}
                                        </td>
                                        <td className="p-4 text-gray-600">
                                            {attendance && attendance.CheckInTime ? new Date(attendance.CheckInTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '-'}
                                        </td>
                                        <td className="p-4 text-gray-600">
                                            {attendance && attendance.CheckOutTime ? new Date(attendance.CheckOutTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '-'}
                                        </td>
                                        <td className="p-4">
                                            {attendance ? (
                                                <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${attendance.Status === 'Present' ? 'bg-green-100 text-green-700' : attendance.Status === 'Absent' ? 'bg-red-100 text-red-700' : attendance.Status === 'Late' ? 'bg-yellow-100 text-yellow-700' : 'bg-blue-100 text-blue-700'}`}>
                                                    {attendance.Status}
                                                </span>
                                            ) : (
                                                <span className="text-gray-400 text-xs italic">Not Marked</span>
                                            )}
                                        </td>
                                        
                                        {/* Actions Column (3 Dots) */}
                                        <td className="p-4 text-center relative">
                                            <div className="flex items-center justify-center">
                                                <button 
                                                    onClick={() => setOpenMenuId(openMenuId === employee._id ? null : employee._id)} 
                                                    className="p-1 rounded-full text-gray-500 hover:bg-gray-200"
                                                >
                                                    <FiMoreVertical size={20} />
                                                </button>
                                                
                                                {/* Dropdown Menu - 5 Options */}
                                                {openMenuId === employee._id && (
                                                    <div ref={menuRef} className="absolute right-12 top-10 w-44 bg-white border border-gray-200 rounded-lg shadow-lg z-50 overflow-hidden text-left">
                                                        
                                                        <button onClick={() => handleCheckInClick(employee, attendance)} className="w-full px-4 py-2.5 text-sm text-green-600 hover:bg-green-50 flex items-center gap-2 font-medium">
                                                            <FiLogIn size={16} /> Check In
                                                        </button>

                                                        <button onClick={() => handleCheckOutClick(employee, attendance)} className="w-full px-4 py-2.5 text-sm text-orange-600 hover:bg-orange-50 flex items-center gap-2 font-medium">
                                                            <FiLogOut size={16} /> Check Out
                                                        </button>

                                                        <button onClick={() => handleViewClick(attendance)} className="w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                                                            <FiEye size={16} /> View
                                                        </button>
                                                        
                                                        <button onClick={() => handleEditClick(attendance)} className="w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                                                            <FiEdit size={16} /> Edit
                                                        </button>
                                                        
                                                        <button onClick={() => handleDeleteClick(attendance)} className="w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2">
                                                            <FiTrash2 size={16} /> Delete
                                                        </button>
                                                        
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr><td colSpan="6" className="p-8 text-center text-gray-500">No employees found.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* CHECK IN / CHECK OUT ACTION MODAL */}
            {isActionModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-transparent pointer-events-none p-4">
                    <div className="bg-white w-full max-w-sm rounded-xl shadow-2xl overflow-hidden pointer-events-auto border border-gray-200">
                        <div className="flex justify-between items-center p-4 border-b border-gray-100 bg-gray-50">
                            <h2 className="text-md font-bold text-gray-800 flex items-center gap-2">
                                <FiClock className="text-[#0f766e]"/> 
                                Mark {actionType === 'checkin' ? 'Check In' : 'Check Out'}
                            </h2>
                            <button onClick={() => setIsActionModalOpen(false)} className="text-gray-400 hover:text-red-500"><FiX size={18} /></button>
                        </div>
                        <form onSubmit={handleActionSubmit} className="p-5">
                            <p className="text-sm text-gray-600 mb-4">
                                Select date and time for <strong>{getEmployeeName(selectedEmployee)}</strong>
                            </p>
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-2">Date & Time</label>
                                <input 
                                    type="datetime-local" 
                                    value={actionTime} 
                                    onChange={(e) => setActionTime(e.target.value)} 
                                    className="w-full border border-gray-300 p-3 rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#0f766e]" 
                                    required 
                                />
                            </div>
                            <div className="flex justify-end gap-3 mt-6">
                                <button type="button" onClick={() => setIsActionModalOpen(false)} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200">Cancel</button>
                                <button type="submit" className={`px-4 py-2 text-white rounded-lg text-sm font-medium ${actionType === 'checkin' ? 'bg-green-600 hover:bg-green-700' : 'bg-orange-600 hover:bg-orange-700'}`}>Confirm</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* EDIT MODAL */}
            {isEditModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-transparent pointer-events-none p-4">
                    <div className="bg-white w-full max-w-lg rounded-xl shadow-2xl overflow-hidden pointer-events-auto border border-gray-200">
                        <div className="flex justify-between items-center p-5 border-b border-gray-100">
                            <h2 className="text-lg font-bold text-gray-800">Edit Attendance</h2>
                            <button onClick={() => setIsEditModalOpen(false)} className="text-gray-400 hover:text-red-500"><FiX size={20} /></button>
                        </div>
                        <form onSubmit={handleEditSubmit} className="p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Check-In</label>
                                    <input type="datetime-local" value={formData.CheckInTime} onChange={(e) => setFormData({...formData, CheckInTime: e.target.value})} className="w-full border border-gray-300 p-3 rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#0f766e]" />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Check-Out</label>
                                    <input type="datetime-local" value={formData.CheckOutTime} onChange={(e) => setFormData({...formData, CheckOutTime: e.target.value})} className="w-full border border-gray-300 p-3 rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#0f766e]" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Status</label>
                                <select value={formData.Status} onChange={(e) => setFormData({...formData, Status: e.target.value})} className="w-full border border-gray-300 p-3 rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#0f766e]">
                                    <option value="Present">Present</option>
                                    <option value="Absent">Absent</option>
                                    <option value="Late">Late</option>
                                    <option value="Half-Day">Half-Day</option>
                                    <option value="Work-From-Home">Work-From-Home</option>
                                </select>
                            </div>
                            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                                <button type="button" onClick={() => setIsEditModalOpen(false)} className="px-5 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50">Cancel</button>
                                <button type="submit" className="px-5 py-2.5 bg-[#0f766e] text-white rounded-lg text-sm font-medium hover:bg-[#0d655e]">Update</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* VIEW MODAL */}
            {isViewModalOpen && selectedAttendance && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-transparent pointer-events-none p-4">
                    <div className="bg-white w-full max-w-lg rounded-xl shadow-2xl overflow-hidden pointer-events-auto border border-gray-200">
                        <div className="flex justify-between items-center p-5 border-b border-gray-100">
                            <h2 className="text-lg font-bold text-gray-800">Attendance Details</h2>
                            <button onClick={() => setIsViewModalOpen(false)} className="text-gray-400 hover:text-red-500"><FiX size={20} /></button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="flex items-center gap-4 border-b pb-4">
                                <div className="w-12 h-12 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center font-bold text-lg uppercase">
                                    {getEmployeeName(selectedAttendance.EmployeeID).charAt(0)}
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-800 text-lg">{getEmployeeName(selectedAttendance.EmployeeID)}</h3>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-6 text-sm">
                                <div>
                                    <p className="text-gray-500 mb-1">Date</p>
                                    <p className="font-medium text-gray-800">{new Date(selectedAttendance.Date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                                </div>
                                <div>
                                    <p className="text-gray-500 mb-1">Status</p>
                                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${selectedAttendance.Status === 'Present' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>{selectedAttendance.Status}</span>
                                </div>
                                <div>
                                    <p className="text-gray-500 mb-1">Check-In Time</p>
                                    <p className="font-medium text-gray-800">{selectedAttendance.CheckInTime ? new Date(selectedAttendance.CheckInTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '-'}</p>
                                </div>
                                <div>
                                    <p className="text-gray-500 mb-1">Check-Out Time</p>
                                    <p className="font-medium text-gray-800">{selectedAttendance.CheckOutTime ? new Date(selectedAttendance.CheckOutTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '-'}</p>
                                </div>
                            </div>
                        </div>
                        <div className="p-4 bg-gray-50 border-t flex justify-end">
                            <button onClick={() => setIsViewModalOpen(false)} className="px-5 py-2.5 bg-[#0f766e] text-white rounded-lg text-sm font-medium hover:bg-[#0d655e]">Close</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AttendanceMaster;
// import React, { useState, useEffect, useRef } from 'react';
// import axios from 'axios';
// import { 
//     FiPlus, 
//     FiDownload, 
//     FiEdit, 
//     FiTrash2, 
//     FiEye, 
//     FiSearch, 
//     FiChevronLeft, 
//     FiChevronRight,
//     FiX,
//     FiMoreVertical
// } from 'react-icons/fi';

// const API_BASE_URL = 'http://localhost:5009/api'; // तुमचा बॅकएंड पोर्ट

// const AttendanceMaster = () => {
//     const [attendanceData, setAttendanceData] = useState([]);
//     const [employees, setEmployees] = useState([]);
//     const [searchTerm, setSearchTerm] = useState('');
//     const [loading, setLoading] = useState(true);
    
//     // Modals state
//     const [isModalOpen, setIsModalOpen] = useState(false); // Add/Edit
//     const [isViewModalOpen, setIsViewModalOpen] = useState(false); // View
//     const [isEditing, setIsEditing] = useState(false);
    
//     // Dropdown state
//     const [openMenuId, setOpenMenuId] = useState(null);
//     const menuRef = useRef(null);

//     // फॉर्म स्टेट
//     const [formData, setFormData] = useState({ 
//         EmployeeID: '', Date: '', CheckInTime: '', CheckOutTime: '', Status: 'Present' 
//     });
    
//     // View साठी स्टेट
//     const [viewRecord, setViewRecord] = useState(null);

//     // Employee चे नाव काढण्यासाठी रोबस्ट फंक्शन (FirstName, name, सर्व चेक करेल)
//     const getEmployeeName = (emp) => {
//         if (!emp) return 'Unknown Employee';
//         if (typeof emp === 'string') return emp; // जर फक्त ID असेल तर
        
//         const fName = emp.FirstName || emp.firstName || '';
//         const lName = emp.LastName || emp.lastName || '';
//         const fullName = `${fName} ${lName}`.trim();
        
//         return fullName || emp.name || emp.EmployeeName || emp.EmployeeID || 'Unknown Employee';
//     };

//     // १. डेटा फेच करणे
//     const fetchData = async () => {
//         setLoading(true);
//         try {
//             const token = localStorage.getItem('token');
//             const headers = token ? { Authorization: `Bearer ${token}` } : {};

//             const attRes = await axios.get(`${API_BASE_URL}/daily-attendance`, { headers });
//             setAttendanceData(attRes.data.data || []);

//             try {
//                 const empRes = await axios.get(`${API_BASE_URL}/employees`, { headers });
//                 const empData = empRes.data.data || empRes.data;
//                 setEmployees(empData || []);
//             } catch (err) {
//                 console.error("Employee list fetch failed:", err);
//             }
//         } catch (error) {
//             console.error("Error fetching data:", error);
//         } finally {
//             setLoading(false);
//         }
//     };

//     useEffect(() => {
//         fetchData();
//         // क्लिक आउटसाइड ड्रॉपडाऊन बंद करण्यासाठी
//         const handleClickOutside = (event) => {
//             if (menuRef.current && !menuRef.current.contains(event.target)) {
//                 setOpenMenuId(null);
//             }
//         };
//         document.addEventListener("mousedown", handleClickOutside);
//         return () => document.removeEventListener("mousedown", handleClickOutside);
//     }, []);

//     // २. Add / Edit सबमिट
//     const handleSubmit = async (e) => {
//         e.preventDefault();
//         if (!formData.EmployeeID) return alert("Please select an employee.");

//         try {
//             const token = localStorage.getItem('token');
//             const headers = token ? { Authorization: `Bearer ${token}` } : {};

//             if (isEditing) {
//                 await axios.put(`${API_BASE_URL}/daily-attendance/update/${formData._id}`, formData, { headers });
//             } else {
//                 await axios.post(`${API_BASE_URL}/daily-attendance/add`, formData, { headers });
//             }
//             setIsModalOpen(false);
//             fetchData();
//         } catch (error) {
//             alert(error.response?.data?.message || "Error saving record");
//         }
//     };

//     // ३. Delete
//     const handleDelete = async (id) => {
//         setOpenMenuId(null); // ड्रॉपडाऊन बंद करा
//         if (window.confirm("Are you sure you want to delete this record?")) {
//             try {
//                 const token = localStorage.getItem('token');
//                 const headers = token ? { Authorization: `Bearer ${token}` } : {};
//                 await axios.delete(`${API_BASE_URL}/daily-attendance/delete/${id}`, { headers });
//                 fetchData();
//             } catch (error) {
//                 alert("Error deleting record");
//             }
//         }
//     };

//     // ४. Excel Download
//     const handleExportExcel = () => {
//         window.open(`${API_BASE_URL}/daily-attendance/export`, '_blank');
//     };

//     // ५. Edit बटण
//     const handleEditClick = (record) => {
//         setOpenMenuId(null);
//         const formatDateTime = (dateStr) => {
//             if (!dateStr) return '';
//             const d = new Date(dateStr);
//             return d.toISOString().slice(0, 16);
//         };

//         setFormData({
//             _id: record._id,
//             EmployeeID: record.EmployeeID?._id || record.EmployeeID,
//             Date: record.Date ? record.Date.split('T')[0] : '',
//             CheckInTime: formatDateTime(record.CheckInTime),
//             CheckOutTime: formatDateTime(record.CheckOutTime),
//             Status: record.Status
//         });
//         setIsEditing(true);
//         setIsModalOpen(true);
//     };

//     // ६. View Details बटण
//     const handleViewClick = (record) => {
//         setOpenMenuId(null);
//         setViewRecord(record);
//         setIsViewModalOpen(true);
//     };

//     // ७. Add नवीन
//     const handleAddClick = () => {
//         setFormData({ 
//             EmployeeID: '', Date: new Date().toISOString().split('T')[0], 
//             CheckInTime: '', CheckOutTime: '', Status: 'Present' 
//         });
//         setIsEditing(false);
//         setIsModalOpen(true);
//     };

//     const filteredData = attendanceData.filter((record) => {
//         const empName = getEmployeeName(record.EmployeeID);
//         return empName.toLowerCase().includes(searchTerm.toLowerCase());
//     });

//     return (
//         <div className="p-6 bg-[#f8fafc] min-h-screen font-sans">
//             {/* हेडर */}
//             <div className="mb-6">
//                 <h1 className="text-2xl font-bold text-gray-800">Attendance Master</h1>
//                 <p className="text-sm text-gray-500 mt-1">Manage employee daily check-in and check-out records</p>
//             </div>

//             <div className="bg-white rounded-xl shadow-sm border border-gray-200">
//                 {/* टूलबार */}
//                 <div className="p-4 flex flex-col md:flex-row justify-between items-center gap-4 border-b border-gray-100">
//                     <div className="relative w-full md:w-80">
//                         <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
//                         <input 
//                             type="text" placeholder="Search by employee name..." 
//                             className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0f766e]"
//                             value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
//                         />
//                     </div>
//                     <div className="flex gap-3 w-full md:w-auto">
//                         <button onClick={handleExportExcel} className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition">
//                             <FiDownload /> Export Excel
//                         </button>
//                         <button onClick={handleAddClick} className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-[#0f766e] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#0d655e] transition">
//                             <FiPlus /> Add Attendance
//                         </button>
//                     </div>
//                 </div>

//                 {/* टेबल */}
//                 <div className="overflow-x-auto min-h-[300px]">
//                     <table className="w-full text-sm text-left">
//                         <thead className="bg-[#115e59] text-white">
//                             <tr>
//                                 <th className="p-4 font-medium">Employee</th>
//                                 <th className="p-4 font-medium">Date</th>
//                                 <th className="p-4 font-medium">In Time</th>
//                                 <th className="p-4 font-medium">Out Time</th>
//                                 <th className="p-4 font-medium">Status</th>
//                                 <th className="p-4 font-medium text-center">Actions</th>
//                             </tr>
//                         </thead>
//                         <tbody className="divide-y divide-gray-100">
//                             {loading ? (
//                                 <tr><td colSpan="6" className="p-8 text-center text-gray-500">Loading records...</td></tr>
//                             ) : filteredData.length > 0 ? (
//                                 filteredData.map((record) => (
//                                     <tr key={record._id} className="hover:bg-gray-50 transition-colors relative">
//                                         <td className="p-4">
//                                             <div className="flex items-center gap-3">
//                                                 <div className="w-8 h-8 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center font-bold text-xs uppercase">
//                                                     {getEmployeeName(record.EmployeeID).charAt(0)}
//                                                 </div>
//                                                 <span className="font-medium text-gray-800">
//                                                     {getEmployeeName(record.EmployeeID)}
//                                                 </span>
//                                             </div>
//                                         </td>
//                                         <td className="p-4 text-gray-600">
//                                             {new Date(record.Date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
//                                         </td>
//                                         <td className="p-4 text-gray-600">
//                                             {record.CheckInTime ? new Date(record.CheckInTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '-'}
//                                         </td>
//                                         <td className="p-4 text-gray-600">
//                                             {record.CheckOutTime ? new Date(record.CheckOutTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '-'}
//                                         </td>
//                                         <td className="p-4">
//                                             <span className={`px-2.5 py-1 rounded-full text-xs font-semibold
//                                                 ${record.Status === 'Present' ? 'bg-green-100 text-green-700' : ''}
//                                                 ${record.Status === 'Absent' ? 'bg-red-100 text-red-700' : ''}
//                                                 ${record.Status === 'Late' ? 'bg-yellow-100 text-yellow-700' : ''}
//                                                 ${record.Status === 'Half-Day' ? 'bg-orange-100 text-orange-700' : ''}
//                                                 ${record.Status === 'Work-From-Home' ? 'bg-blue-100 text-blue-700' : ''}
//                                             `}>
//                                                 {record.Status}
//                                             </span>
//                                         </td>
                                        
//                                         {/* Actions Column (3 Dots) */}
//                                         <td className="p-4 text-center relative">
//                                             <button 
//                                                 onClick={() => setOpenMenuId(openMenuId === record._id ? null : record._id)}
//                                                 className="p-1 rounded-full text-gray-500 hover:bg-gray-200 transition"
//                                             >
//                                                 <FiMoreVertical size={20} />
//                                             </button>

//                                             {/* Dropdown Menu */}
//                                             {openMenuId === record._id && (
//                                                 <div 
//                                                     ref={menuRef}
//                                                     className="absolute right-12 top-10 w-40 bg-white border border-gray-200 rounded-lg shadow-lg z-50 overflow-hidden"
//                                                 >
//                                                     <button 
//                                                         onClick={() => handleViewClick(record)} 
//                                                         className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
//                                                     >
//                                                         <FiEye size={16} className="text-gray-500" /> View Details
//                                                     </button>
//                                                     <button 
//                                                         onClick={() => handleEditClick(record)} 
//                                                         className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
//                                                     >
//                                                         <FiEdit size={16} className="text-gray-500" /> Edit
//                                                     </button>
//                                                     <button 
//                                                         onClick={() => handleDelete(record._id)} 
//                                                         className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
//                                                     >
//                                                         <FiTrash2 size={16} className="text-red-500" /> Delete
//                                                     </button>
//                                                 </div>
//                                             )}
//                                         </td>
//                                     </tr>
//                                 ))
//                             ) : (
//                                 <tr><td colSpan="6" className="p-8 text-center text-gray-500">No attendance records found.</td></tr>
//                             )}
//                         </tbody>
//                     </table>
//                 </div>
                
//                 {/* पॅजिनेशन */}
//                 <div className="p-4 border-t border-gray-100 flex items-center justify-between text-sm text-gray-500">
//                     <span>Rows per page: 5</span>
//                     <span>1–{filteredData.length} of {filteredData.length}</span>
//                 </div>
//             </div>

//             {/* ========================================= */}
//             {/* 1. ADD / EDIT MODAL */}
//             {/* ========================================= */}
//             {isModalOpen && (
//                 <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 backdrop-blur-sm">
//                     <div className="bg-white w-full max-w-md rounded-xl shadow-2xl overflow-hidden">
//                         <div className="flex justify-between items-center p-5 border-b border-gray-100 bg-gray-50">
//                             <h2 className="text-lg font-bold text-gray-800">{isEditing ? 'Edit Attendance' : 'Mark New Attendance'}</h2>
//                             <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-red-500"><FiX size={20} /></button>
//                         </div>
//                         <form onSubmit={handleSubmit} className="p-5 space-y-4">
//                             <div>
//                                 <label className="block text-xs font-medium text-gray-600 mb-1">Employee</label>
//                                 <select 
//                                     value={formData.EmployeeID} onChange={(e) => setFormData({...formData, EmployeeID: e.target.value})} 
//                                     className="w-full border border-gray-300 p-2.5 rounded-lg text-sm focus:ring-2 focus:ring-[#0f766e] outline-none" required
//                                 >
//                                     <option value="">Select Employee</option>
//                                     {employees.map(emp => (
//                                         <option key={emp._id} value={emp._id}>{getEmployeeName(emp)} ({emp.EmployeeID || 'N/A'})</option>
//                                     ))}
//                                 </select>
//                             </div>
//                             <div>
//                                 <label className="block text-xs font-medium text-gray-600 mb-1">Date</label>
//                                 <input type="date" value={formData.Date} onChange={(e) => setFormData({...formData, Date: e.target.value})} className="w-full border border-gray-300 p-2.5 rounded-lg text-sm outline-none" required />
//                             </div>
//                             <div className="grid grid-cols-2 gap-4">
//                                 <div>
//                                     <label className="block text-xs font-medium text-gray-600 mb-1">Check-In</label>
//                                     <input type="datetime-local" value={formData.CheckInTime} onChange={(e) => setFormData({...formData, CheckInTime: e.target.value})} className="w-full border border-gray-300 p-2.5 rounded-lg text-sm outline-none" required />
//                                 </div>
//                                 <div>
//                                     <label className="block text-xs font-medium text-gray-600 mb-1">Check-Out</label>
//                                     <input type="datetime-local" value={formData.CheckOutTime} onChange={(e) => setFormData({...formData, CheckOutTime: e.target.value})} className="w-full border border-gray-300 p-2.5 rounded-lg text-sm outline-none" required />
//                                 </div>
//                             </div>
//                             <div>
//                                 <label className="block text-xs font-medium text-gray-600 mb-1">Status</label>
//                                 <select value={formData.Status} onChange={(e) => setFormData({...formData, Status: e.target.value})} className="w-full border border-gray-300 p-2.5 rounded-lg text-sm outline-none">
//                                     <option value="Present">Present</option>
//                                     <option value="Absent">Absent</option>
//                                     <option value="Late">Late</option>
//                                     <option value="Half-Day">Half-Day</option>
//                                     <option value="Work-From-Home">Work-From-Home</option>
//                                 </select>
//                             </div>
//                             <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-100">
//                                 <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200">Cancel</button>
//                                 <button type="submit" className="px-4 py-2 bg-[#0f766e] text-white rounded-lg text-sm font-medium hover:bg-[#0d655e]">Save</button>
//                             </div>
//                         </form>
//                     </div>
//                 </div>
//             )}

//             {/* ========================================= */}
//             {/* 2. VIEW DETAILS MODAL */}
//             {/* ========================================= */}
//             {isViewModalOpen && viewRecord && (
//                 <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 backdrop-blur-sm">
//                     <div className="bg-white w-full max-w-md rounded-xl shadow-2xl overflow-hidden">
//                         <div className="flex justify-between items-center p-5 border-b border-gray-100 bg-gray-50">
//                             <h2 className="text-lg font-bold text-gray-800">Attendance Details</h2>
//                             <button onClick={() => setIsViewModalOpen(false)} className="text-gray-400 hover:text-red-500"><FiX size={20} /></button>
//                         </div>
//                         <div className="p-5 space-y-4">
//                             <div className="flex items-center gap-4 border-b pb-4">
//                                 <div className="w-12 h-12 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center font-bold text-lg uppercase">
//                                     {getEmployeeName(viewRecord.EmployeeID).charAt(0)}
//                                 </div>
//                                 <div>
//                                     <h3 className="font-bold text-gray-800 text-lg">{getEmployeeName(viewRecord.EmployeeID)}</h3>
//                                     <p className="text-sm text-gray-500">ID: {viewRecord.EmployeeID?.EmployeeID || 'N/A'}</p>
//                                 </div>
//                             </div>
//                             <div className="grid grid-cols-2 gap-4 text-sm">
//                                 <div>
//                                     <p className="text-gray-500 mb-1">Date</p>
//                                     <p className="font-medium text-gray-800">{new Date(viewRecord.Date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
//                                 </div>
//                                 <div>
//                                     <p className="text-gray-500 mb-1">Status</p>
//                                     <span className={`px-2 py-1 rounded-full text-xs font-semibold ${viewRecord.Status === 'Present' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
//                                         {viewRecord.Status}
//                                     </span>
//                                 </div>
//                                 <div>
//                                     <p className="text-gray-500 mb-1">Check-In Time</p>
//                                     <p className="font-medium text-gray-800">{viewRecord.CheckInTime ? new Date(viewRecord.CheckInTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '-'}</p>
//                                 </div>
//                                 <div>
//                                     <p className="text-gray-500 mb-1">Check-Out Time</p>
//                                     <p className="font-medium text-gray-800">{viewRecord.CheckOutTime ? new Date(viewRecord.CheckOutTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '-'}</p>
//                                 </div>
//                             </div>
//                         </div>
//                         <div className="p-4 bg-gray-50 border-t flex justify-end">
//                             <button onClick={() => setIsViewModalOpen(false)} className="px-4 py-2 bg-[#0f766e] text-white rounded-lg text-sm font-medium hover:bg-[#0d655e]">Close</button>
//                         </div>
//                     </div>
//                 </div>
//             )}

//         </div>
//     );
// };

// export default AttendanceMaster;