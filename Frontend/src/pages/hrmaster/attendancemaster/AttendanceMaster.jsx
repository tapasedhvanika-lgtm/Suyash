import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { 
    FiDownload, FiEdit, FiTrash2, FiEye, FiSearch, 
    FiX, FiMoreVertical, FiLogIn, FiLogOut, FiClock,
    FiChevronLeft, FiChevronRight
} from 'react-icons/fi';

import BASE_URL from "../../../config/Config";

const AttendanceMaster = () => {
    const [tableData, setTableData] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalRecords, setTotalRecords] = useState(0);
    const itemsPerPage = 10;

    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    
    const [isActionModalOpen, setIsActionModalOpen] = useState(false);
    const [actionType, setActionType] = useState(''); 
    const [actionTime, setActionTime] = useState('');
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [selectedAttendance, setSelectedAttendance] = useState(null);

    const [openMenuId, setOpenMenuId] = useState(null);
    const menuRef = useRef(null);

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

            const response = await axios.get(`${BASE_URL}/api/daily-attendance`, { 
                headers,
                params: {
                    page: currentPage,
                    limit: itemsPerPage,
                    search: searchTerm
                }
            });

            setTableData(response.data.data || []);
            setTotalPages(response.data.pagination?.totalPages || 1);
            setTotalRecords(response.data.pagination?.totalRecords || 0);

        } catch (error) {
            console.error("Error fetching data:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            fetchData();
        }, 500); 
        return () => clearTimeout(delayDebounceFn);
    }, [currentPage, searchTerm]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) setOpenMenuId(null);
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

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
        if (!att || !att._id) return alert("No attendance record found. Please Check In first.");
        setSelectedAttendance(att);
        setIsViewModalOpen(true);
    };

    const handleEditClick = (att) => {
        setOpenMenuId(null);
        if (!att || !att._id) return alert("No attendance record found. Please Check In first.");
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
        if (!att || !att._id) return alert("No attendance record found to delete.");
        if (window.confirm("Are you sure you want to delete this attendance record?")) {
            deleteAttendance(att._id);
        }
    };

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

    const handleActionSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            const headers = token ? { Authorization: `Bearer ${token}` } : {};
            
            if (actionType === 'checkin') {
                if (selectedAttendance && selectedAttendance._id) {
                    let updateData = { ...selectedAttendance, CheckInTime: actionTime, Date: actionTime };
                    await axios.put(`${BASE_URL}/api/daily-attendance/update/${selectedAttendance._id}`, updateData, { headers });
                } else {
                    let newData = { 
                        EmployeeID: selectedEmployee._id, 
                        Date: actionTime, 
                        CheckInTime: actionTime, 
                        CheckOutTime: null, 
                        Status: 'Present' 
                    };
                    await axios.post(`${BASE_URL}/api/daily-attendance/add`, newData, { headers });
                }
            } else {
                let updateData = { ...selectedAttendance, CheckOutTime: actionTime };
                await axios.put(`${BASE_URL}/api/daily-attendance/update/${selectedAttendance._id}`, updateData, { headers });
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
            await axios.put(`${BASE_URL}/api/daily-attendance/update/${formData._id}`, formData, { headers });
            setIsEditModalOpen(false);
            fetchData();
        } catch (error) { alert(error.response?.data?.message || "Error saving record"); }
    };

    const deleteAttendance = async (id) => {
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`${BASE_URL}/api/daily-attendance/delete/${id}`, { headers: token ? { Authorization: `Bearer ${token}` } : {} });
            fetchData();
        } catch (error) { alert("Error deleting record"); }
    };

    const handleExportExcel = () => {
        window.open(`${BASE_URL}/api/daily-attendance/export?search=${searchTerm}`, '_blank');
    };

    const handlePageChange = (pageNumber) => setCurrentPage(pageNumber);
    const handleNextPage = () => setCurrentPage((prev) => Math.min(prev + 1, totalPages));
    const handlePrevPage = () => setCurrentPage((prev) => Math.max(prev - 1, 1));

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
                        <input 
                            type="text" 
                            placeholder="Search by employee name..." 
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0f766e]" 
                            value={searchTerm} 
                            onChange={(e) => {
                                setSearchTerm(e.target.value);
                                setCurrentPage(1); 
                            }} 
                        />
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
                                <tr><td colSpan="6" className="p-8 text-center text-gray-500">Loading records...</td></tr>
                            ) : tableData.length > 0 ? (
                                tableData.map((row) => {
                                    const employee = row.EmployeeID || {};
                                    // जर AttendanceId असेल तरच ॲटेंडन्स ऑब्जेक्ट तयार करा
                                    const attendance = row.AttendanceId ? {
                                        _id: row.AttendanceId,
                                        EmployeeID: employee,
                                        Date: row.Date,
                                        CheckInTime: row.CheckInTime,
                                        CheckOutTime: row.CheckOutTime,
                                        Status: row.Status
                                    } : null;
                                    
                                    return (
                                        <tr key={row._id} className="hover:bg-gray-50 transition-colors relative">
                                            <td className="p-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center font-bold text-xs uppercase">
                                                        {getEmployeeName(employee).charAt(0)}
                                                    </div>
                                                    <span className="font-medium text-gray-800">{getEmployeeName(employee)}</span>
                                                </div>
                                            </td>
                                            <td className="p-4 text-gray-600">
                                                {attendance && attendance.Date ? new Date(attendance.Date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '-'}
                                            </td>
                                            <td className="p-4 text-gray-600">
                                                {attendance && attendance.CheckInTime ? new Date(attendance.CheckInTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '-'}
                                            </td>
                                            <td className="p-4 text-gray-600">
                                                {attendance && attendance.CheckOutTime ? new Date(attendance.CheckOutTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '-'}
                                            </td>
                                            <td className="p-4">
                                                {attendance && attendance.Status ? (
                                                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${attendance.Status === 'Present' ? 'bg-green-100 text-green-700' : attendance.Status === 'Absent' ? 'bg-red-100 text-red-700' : attendance.Status === 'Late' ? 'bg-yellow-100 text-yellow-700' : 'bg-blue-100 text-blue-700'}`}>
                                                        {attendance.Status}
                                                    </span>
                                                ) : (
                                                    <span className="text-gray-400 text-xs italic">Not Marked</span>
                                                )}
                                            </td>
                                            
                                            <td className="p-4 text-center relative">
                                                <div className="flex items-center justify-center">
                                                    <button 
                                                        onClick={() => setOpenMenuId(openMenuId === employee._id ? null : employee._id)} 
                                                        className="p-1 rounded-full text-gray-500 hover:bg-gray-200"
                                                    >
                                                        <FiMoreVertical size={20} />
                                                    </button>
                                                    
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
                                    );
                                })
                            ) : (
                                <tr><td colSpan="6" className="p-8 text-center text-gray-500">No employees found.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* PAGINATION UI */}
                {!loading && totalRecords > 0 && (
                    <div className="flex flex-col sm:flex-row items-center justify-between px-6 py-4 border-t border-gray-200 bg-white rounded-b-xl">
                        <div className="text-sm text-gray-600 mb-4 sm:mb-0">
                            Showing <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> to <span className="font-medium">{Math.min(currentPage * itemsPerPage, totalRecords)}</span> of <span className="font-medium">{totalRecords}</span> entries
                        </div>
                        
                        <div className="flex items-center space-x-1">
                            <button
                                onClick={handlePrevPage}
                                disabled={currentPage === 1}
                                className={`flex items-center justify-center w-8 h-8 rounded-md border text-sm font-medium ${currentPage === 1 ? 'border-gray-200 text-gray-400 cursor-not-allowed bg-gray-50' : 'border-gray-300 text-gray-700 hover:bg-gray-50 bg-white'}`}
                            >
                                <FiChevronLeft size={16} />
                            </button>

                            {Array.from({ length: totalPages }, (_, index) => index + 1).map((pageNumber) => (
                                <button
                                    key={pageNumber}
                                    onClick={() => handlePageChange(pageNumber)}
                                    className={`flex items-center justify-center w-8 h-8 rounded-md border text-sm font-medium ${currentPage === pageNumber ? 'border-[#0f766e] bg-[#0f766e] text-white' : 'border-gray-300 text-gray-700 hover:bg-gray-50 bg-white'}`}
                                >
                                    {pageNumber}
                                </button>
                            ))}

                            <button
                                onClick={handleNextPage}
                                disabled={currentPage === totalPages}
                                className={`flex items-center justify-center w-8 h-8 rounded-md border text-sm font-medium ${currentPage === totalPages ? 'border-gray-200 text-gray-400 cursor-not-allowed bg-gray-50' : 'border-gray-300 text-gray-700 hover:bg-gray-50 bg-white'}`}
                            >
                                <FiChevronRight size={16} />
                            </button>
                        </div>
                    </div>
                )}
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
//     FiDownload, FiEdit, FiTrash2, FiEye, FiSearch, 
//     FiX, FiMoreVertical, FiLogIn, FiLogOut, FiClock,
//     FiChevronLeft, FiChevronRight
// } from 'react-icons/fi';

// // 🔥 तुमच्या कॉन्फिग फाईलमधून BASE_URL इम्पोर्ट केले आहे 🔥
// import BASE_URL from "../../../config/Config";

// const AttendanceMaster = () => {
//     const [employees, setEmployees] = useState([]);
//     const [attendanceData, setAttendanceData] = useState([]);
//     const [searchTerm, setSearchTerm] = useState('');
//     const [loading, setLoading] = useState(true);
    
//     // Pagination State
//     const [currentPage, setCurrentPage] = useState(1);
//     const itemsPerPage = 10; // तुम्हाला हवे असल्यास हा नंबर बदला (उदा. 5, 10, 20)

//     // Modals State
//     const [isViewModalOpen, setIsViewModalOpen] = useState(false);
//     const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    
//     // Check In / Check Out Modal State
//     const [isActionModalOpen, setIsActionModalOpen] = useState(false);
//     const [actionType, setActionType] = useState(''); 
//     const [actionTime, setActionTime] = useState('');
//     const [selectedEmployee, setSelectedEmployee] = useState(null);
//     const [selectedAttendance, setSelectedAttendance] = useState(null);

//     // Menu State
//     const [openMenuId, setOpenMenuId] = useState(null);
//     const menuRef = useRef(null);

//     // Edit Form State
//     const [formData, setFormData] = useState({ 
//         _id: '', EmployeeID: '', Date: '', CheckInTime: '', CheckOutTime: '', Status: 'Present' 
//     });

//     const getEmployeeName = (emp) => {
//         if (!emp) return 'Unknown';
//         const fName = emp.FirstName || emp.firstName || '';
//         const lName = emp.LastName || emp.lastName || '';
//         return `${fName} ${lName}`.trim() || emp.name || emp.EmployeeName || 'Unknown Employee';
//     };

//     const fetchData = async () => {
//         setLoading(true);
//         try {
//             const token = localStorage.getItem('token');
//             const headers = token ? { Authorization: `Bearer ${token}` } : {};

//             // BASE_URL सोबत /api चा वापर केला आहे
//             const [empRes, attRes] = await Promise.all([
//                 axios.get(`${BASE_URL}/api/employees`, { headers }),
//                 axios.get(`${BASE_URL}/api/daily-attendance`, { headers })
//             ]);

//             const empData = empRes.data.data || empRes.data || [];
//             const attData = attRes.data.data || [];

//             setEmployees(empData);
//             setAttendanceData(attData);
//         } catch (error) {
//             console.error("Error fetching data:", error);
//         } finally {
//             setLoading(false);
//         }
//     };

//     useEffect(() => {
//         fetchData();
//         const handleClickOutside = (event) => {
//             if (menuRef.current && !menuRef.current.contains(event.target)) setOpenMenuId(null);
//         };
//         document.addEventListener("mousedown", handleClickOutside);
//         return () => document.removeEventListener("mousedown", handleClickOutside);
//     }, []);

//     // Action Handlers (Check In/Out, View, Edit, Delete)
//     const handleCheckInClick = (emp, att) => {
//         setOpenMenuId(null);
//         if (att && att.CheckInTime) {
//             alert("This employee has already checked in.");
//             return;
//         }
//         openActionModal(emp, 'checkin', att);
//     };

//     const handleCheckOutClick = (emp, att) => {
//         setOpenMenuId(null);
//         if (!att || !att.CheckInTime) {
//             alert("Please check in first.");
//             return;
//         }
//         if (att.CheckOutTime) {
//             alert("This employee has already checked out.");
//             return;
//         }
//         openActionModal(emp, 'checkout', att);
//     };

//     const handleViewClick = (att) => {
//         setOpenMenuId(null);
//         if (!att) return alert("No attendance record found.");
//         setSelectedAttendance(att);
//         setIsViewModalOpen(true);
//     };

//     const handleEditClick = (att) => {
//         setOpenMenuId(null);
//         if (!att) return alert("No attendance record found.");
//         const formatDateTime = (dateStr) => dateStr ? new Date(dateStr).toISOString().slice(0, 16) : '';
//         setFormData({
//             _id: att._id,
//             EmployeeID: att.EmployeeID?._id || att.EmployeeID,
//             Date: att.Date ? att.Date.split('T')[0] : '',
//             CheckInTime: formatDateTime(att.CheckInTime),
//             CheckOutTime: formatDateTime(att.CheckOutTime),
//             Status: att.Status
//         });
//         setIsEditModalOpen(true);
//     };

//     const handleDeleteClick = (att) => {
//         setOpenMenuId(null);
//         if (!att) return alert("No attendance record found.");
//         if (window.confirm("Are you sure you want to delete this attendance record?")) {
//             deleteAttendance(att._id);
//         }
//     };

//     // Open Modal
//     const openActionModal = (emp, type, existingAtt = null) => {
//         setSelectedEmployee(emp);
//         setSelectedAttendance(existingAtt);
//         setActionType(type);
        
//         const now = new Date();
//         const tzOffset = now.getTimezoneOffset() * 60000;
//         const localISOTime = (new Date(now - tzOffset)).toISOString().slice(0, 16);
//         setActionTime(localISOTime);
        
//         setIsActionModalOpen(true);
//     };

//     // Submit Check-In/Out
//     const handleActionSubmit = async (e) => {
//         e.preventDefault();
//         try {
//             const token = localStorage.getItem('token');
//             const headers = token ? { Authorization: `Bearer ${token}` } : {};
            
//             if (actionType === 'checkin') {
//                 if (selectedAttendance) {
//                     let updateData = { ...selectedAttendance, CheckInTime: actionTime, Date: actionTime };
//                     await axios.put(`${BASE_URL}/api/daily-attendance/update/${selectedAttendance._id}`, updateData, { headers });
//                 } else {
//                     let newData = { 
//                         EmployeeID: selectedEmployee._id, 
//                         Date: actionTime, 
//                         CheckInTime: actionTime, 
//                         CheckOutTime: null, 
//                         Status: 'Present' 
//                     };
//                     await axios.post(`${BASE_URL}/api/daily-attendance/add`, newData, { headers });
//                 }
//             } else {
//                 let updateData = { ...selectedAttendance, CheckOutTime: actionTime };
//                 await axios.put(`${BASE_URL}/api/daily-attendance/update/${selectedAttendance._id}`, updateData, { headers });
//             }
            
//             setIsActionModalOpen(false);
//             fetchData();
//         } catch (error) {
//             alert("Error updating time");
//         }
//     };

//     const handleEditSubmit = async (e) => {
//         e.preventDefault();
//         try {
//             const token = localStorage.getItem('token');
//             const headers = token ? { Authorization: `Bearer ${token}` } : {};
//             await axios.put(`${BASE_URL}/api/daily-attendance/update/${formData._id}`, formData, { headers });
//             setIsEditModalOpen(false);
//             fetchData();
//         } catch (error) { alert(error.response?.data?.message || "Error saving record"); }
//     };

//     const deleteAttendance = async (id) => {
//         try {
//             const token = localStorage.getItem('token');
//             await axios.delete(`${BASE_URL}/api/daily-attendance/delete/${id}`, { headers: token ? { Authorization: `Bearer ${token}` } : {} });
//             fetchData();
//         } catch (error) { alert("Error deleting record"); }
//     };

//     // Export Excel साठी सुद्धा BASE_URL वापरला आहे
//     const handleExportExcel = () => window.open(`${BASE_URL}/api/daily-attendance/export`, '_blank');

//     // Merge Employee and Attendance Data
//     const mergedData = employees.map(emp => {
//         const empAttendance = attendanceData.find(att => (att.EmployeeID?._id === emp._id || att.EmployeeID === emp._id));
//         return { 
//             employee: emp, 
//             attendance: empAttendance || null 
//         };
//     });

//     const filteredData = mergedData.filter(({ employee }) => 
//         getEmployeeName(employee).toLowerCase().includes(searchTerm.toLowerCase())
//     );

//     // 🔥 PAGINATION CALCULATIONS 🔥
//     const indexOfLastItem = currentPage * itemsPerPage;
//     const indexOfFirstItem = indexOfLastItem - itemsPerPage;
//     const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);
//     const totalPages = Math.ceil(filteredData.length / itemsPerPage);

//     // पेज बदलण्यासाठी फंक्शन्स
//     const handlePageChange = (pageNumber) => setCurrentPage(pageNumber);
//     const handleNextPage = () => setCurrentPage((prev) => Math.min(prev + 1, totalPages));
//     const handlePrevPage = () => setCurrentPage((prev) => Math.max(prev - 1, 1));

//     return (
//         <div className="p-6 bg-[#f8fafc] min-h-screen font-sans relative">
//             <div className="mb-6">
//                 <h1 className="text-2xl font-bold text-gray-800">Attendance Master</h1>
//                 <p className="text-sm text-gray-500 mt-1">Manage employee daily check-in and check-out records</p>
//             </div>

//             <div className="bg-white rounded-xl shadow-sm border border-gray-200">
//                 <div className="p-4 flex flex-col md:flex-row justify-between items-center gap-4 border-b border-gray-100">
//                     <div className="relative w-full md:w-80">
//                         <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
//                         <input 
//                             type="text" 
//                             placeholder="Search by employee name..." 
//                             className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0f766e]" 
//                             value={searchTerm} 
//                             onChange={(e) => {
//                                 setSearchTerm(e.target.value);
//                                 setCurrentPage(1); // सर्च करताना पेज 1 वर रिसेट होईल
//                             }} 
//                         />
//                     </div>
//                     <div className="flex gap-3 w-full md:w-auto">
//                         <button onClick={handleExportExcel} className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50"><FiDownload /> Export Excel</button>
//                     </div>
//                 </div>

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
//                                 <tr><td colSpan="6" className="p-8 text-center text-gray-500">Loading employees...</td></tr>
//                             ) : filteredData.length > 0 ? (
//                                 // 🔥 इथे currentItems मॅप केले आहे (filteredData ऐवजी) 🔥
//                                 currentItems.map(({ employee, attendance }) => (
//                                     <tr key={employee._id} className="hover:bg-gray-50 transition-colors relative">
//                                         <td className="p-4">
//                                             <div className="flex items-center gap-3">
//                                                 <div className="w-8 h-8 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center font-bold text-xs uppercase">
//                                                     {getEmployeeName(employee).charAt(0)}
//                                                 </div>
//                                                 <span className="font-medium text-gray-800">{getEmployeeName(employee)}</span>
//                                             </div>
//                                         </td>
//                                         <td className="p-4 text-gray-600">
//                                             {attendance ? new Date(attendance.Date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '-'}
//                                         </td>
//                                         <td className="p-4 text-gray-600">
//                                             {attendance && attendance.CheckInTime ? new Date(attendance.CheckInTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '-'}
//                                         </td>
//                                         <td className="p-4 text-gray-600">
//                                             {attendance && attendance.CheckOutTime ? new Date(attendance.CheckOutTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '-'}
//                                         </td>
//                                         <td className="p-4">
//                                             {attendance ? (
//                                                 <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${attendance.Status === 'Present' ? 'bg-green-100 text-green-700' : attendance.Status === 'Absent' ? 'bg-red-100 text-red-700' : attendance.Status === 'Late' ? 'bg-yellow-100 text-yellow-700' : 'bg-blue-100 text-blue-700'}`}>
//                                                     {attendance.Status}
//                                                 </span>
//                                             ) : (
//                                                 <span className="text-gray-400 text-xs italic">Not Marked</span>
//                                             )}
//                                         </td>
                                        
//                                         {/* Actions Column (3 Dots) */}
//                                         <td className="p-4 text-center relative">
//                                             <div className="flex items-center justify-center">
//                                                 <button 
//                                                     onClick={() => setOpenMenuId(openMenuId === employee._id ? null : employee._id)} 
//                                                     className="p-1 rounded-full text-gray-500 hover:bg-gray-200"
//                                                 >
//                                                     <FiMoreVertical size={20} />
//                                                 </button>
                                                
//                                                 {/* Dropdown Menu - 5 Options */}
//                                                 {openMenuId === employee._id && (
//                                                     <div ref={menuRef} className="absolute right-12 top-10 w-44 bg-white border border-gray-200 rounded-lg shadow-lg z-50 overflow-hidden text-left">
                                                        
//                                                         <button onClick={() => handleCheckInClick(employee, attendance)} className="w-full px-4 py-2.5 text-sm text-green-600 hover:bg-green-50 flex items-center gap-2 font-medium">
//                                                             <FiLogIn size={16} /> Check In
//                                                         </button>

//                                                         <button onClick={() => handleCheckOutClick(employee, attendance)} className="w-full px-4 py-2.5 text-sm text-orange-600 hover:bg-orange-50 flex items-center gap-2 font-medium">
//                                                             <FiLogOut size={16} /> Check Out
//                                                         </button>

//                                                         <button onClick={() => handleViewClick(attendance)} className="w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2">
//                                                             <FiEye size={16} /> View
//                                                         </button>
                                                        
//                                                         <button onClick={() => handleEditClick(attendance)} className="w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2">
//                                                             <FiEdit size={16} /> Edit
//                                                         </button>
                                                        
//                                                         <button onClick={() => handleDeleteClick(attendance)} className="w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2">
//                                                             <FiTrash2 size={16} /> Delete
//                                                         </button>
                                                        
//                                                     </div>
//                                                 )}
//                                             </div>
//                                         </td>
//                                     </tr>
//                                 ))
//                             ) : (
//                                 <tr><td colSpan="6" className="p-8 text-center text-gray-500">No employees found.</td></tr>
//                             )}
//                         </tbody>
//                     </table>
//                 </div>

//                 {/* 🔥 PAGINATION UI 🔥 */}
//                 {!loading && filteredData.length > 0 && (
//                     <div className="flex flex-col sm:flex-row items-center justify-between px-6 py-4 border-t border-gray-200 bg-white rounded-b-xl">
//                         <div className="text-sm text-gray-600 mb-4 sm:mb-0">
//                             Showing <span className="font-medium">{indexOfFirstItem + 1}</span> to <span className="font-medium">{Math.min(indexOfLastItem, filteredData.length)}</span> of <span className="font-medium">{filteredData.length}</span> entries
//                         </div>
                        
//                         <div className="flex items-center space-x-1">
//                             {/* Previous Button */}
//                             <button
//                                 onClick={handlePrevPage}
//                                 disabled={currentPage === 1}
//                                 className={`flex items-center justify-center w-8 h-8 rounded-md border text-sm font-medium ${currentPage === 1 ? 'border-gray-200 text-gray-400 cursor-not-allowed bg-gray-50' : 'border-gray-300 text-gray-700 hover:bg-gray-50 bg-white'}`}
//                             >
//                                 <FiChevronLeft size={16} />
//                             </button>

//                             {/* Page Numbers */}
//                             {Array.from({ length: totalPages }, (_, index) => index + 1).map((pageNumber) => (
//                                 <button
//                                     key={pageNumber}
//                                     onClick={() => handlePageChange(pageNumber)}
//                                     className={`flex items-center justify-center w-8 h-8 rounded-md border text-sm font-medium ${currentPage === pageNumber ? 'border-[#0f766e] bg-[#0f766e] text-white' : 'border-gray-300 text-gray-700 hover:bg-gray-50 bg-white'}`}
//                                 >
//                                     {pageNumber}
//                                 </button>
//                             ))}

//                             {/* Next Button */}
//                             <button
//                                 onClick={handleNextPage}
//                                 disabled={currentPage === totalPages}
//                                 className={`flex items-center justify-center w-8 h-8 rounded-md border text-sm font-medium ${currentPage === totalPages ? 'border-gray-200 text-gray-400 cursor-not-allowed bg-gray-50' : 'border-gray-300 text-gray-700 hover:bg-gray-50 bg-white'}`}
//                             >
//                                 <FiChevronRight size={16} />
//                             </button>
//                         </div>
//                     </div>
//                 )}
//             </div>

//             {/* CHECK IN / CHECK OUT ACTION MODAL */}
//             {isActionModalOpen && (
//                 <div className="fixed inset-0 z-50 flex items-center justify-center bg-transparent pointer-events-none p-4">
//                     <div className="bg-white w-full max-w-sm rounded-xl shadow-2xl overflow-hidden pointer-events-auto border border-gray-200">
//                         <div className="flex justify-between items-center p-4 border-b border-gray-100 bg-gray-50">
//                             <h2 className="text-md font-bold text-gray-800 flex items-center gap-2">
//                                 <FiClock className="text-[#0f766e]"/> 
//                                 Mark {actionType === 'checkin' ? 'Check In' : 'Check Out'}
//                             </h2>
//                             <button onClick={() => setIsActionModalOpen(false)} className="text-gray-400 hover:text-red-500"><FiX size={18} /></button>
//                         </div>
//                         <form onSubmit={handleActionSubmit} className="p-5">
//                             <p className="text-sm text-gray-600 mb-4">
//                                 Select date and time for <strong>{getEmployeeName(selectedEmployee)}</strong>
//                             </p>
//                             <div>
//                                 <label className="block text-xs font-semibold text-gray-700 mb-2">Date & Time</label>
//                                 <input 
//                                     type="datetime-local" 
//                                     value={actionTime} 
//                                     onChange={(e) => setActionTime(e.target.value)} 
//                                     className="w-full border border-gray-300 p-3 rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#0f766e]" 
//                                     required 
//                                 />
//                             </div>
//                             <div className="flex justify-end gap-3 mt-6">
//                                 <button type="button" onClick={() => setIsActionModalOpen(false)} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200">Cancel</button>
//                                 <button type="submit" className={`px-4 py-2 text-white rounded-lg text-sm font-medium ${actionType === 'checkin' ? 'bg-green-600 hover:bg-green-700' : 'bg-orange-600 hover:bg-orange-700'}`}>Confirm</button>
//                             </div>
//                         </form>
//                     </div>
//                 </div>
//             )}

//             {/* EDIT MODAL */}
//             {isEditModalOpen && (
//                 <div className="fixed inset-0 z-50 flex items-center justify-center bg-transparent pointer-events-none p-4">
//                     <div className="bg-white w-full max-w-lg rounded-xl shadow-2xl overflow-hidden pointer-events-auto border border-gray-200">
//                         <div className="flex justify-between items-center p-5 border-b border-gray-100">
//                             <h2 className="text-lg font-bold text-gray-800">Edit Attendance</h2>
//                             <button onClick={() => setIsEditModalOpen(false)} className="text-gray-400 hover:text-red-500"><FiX size={20} /></button>
//                         </div>
//                         <form onSubmit={handleEditSubmit} className="p-6 space-y-4">
//                             <div className="grid grid-cols-2 gap-4">
//                                 <div>
//                                     <label className="block text-sm font-semibold text-gray-700 mb-1">Check-In</label>
//                                     <input type="datetime-local" value={formData.CheckInTime} onChange={(e) => setFormData({...formData, CheckInTime: e.target.value})} className="w-full border border-gray-300 p-3 rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#0f766e]" />
//                                 </div>
//                                 <div>
//                                     <label className="block text-sm font-semibold text-gray-700 mb-1">Check-Out</label>
//                                     <input type="datetime-local" value={formData.CheckOutTime} onChange={(e) => setFormData({...formData, CheckOutTime: e.target.value})} className="w-full border border-gray-300 p-3 rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#0f766e]" />
//                                 </div>
//                             </div>
//                             <div>
//                                 <label className="block text-sm font-semibold text-gray-700 mb-1">Status</label>
//                                 <select value={formData.Status} onChange={(e) => setFormData({...formData, Status: e.target.value})} className="w-full border border-gray-300 p-3 rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#0f766e]">
//                                     <option value="Present">Present</option>
//                                     <option value="Absent">Absent</option>
//                                     <option value="Late">Late</option>
//                                     <option value="Half-Day">Half-Day</option>
//                                     <option value="Work-From-Home">Work-From-Home</option>
//                                 </select>
//                             </div>
//                             <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
//                                 <button type="button" onClick={() => setIsEditModalOpen(false)} className="px-5 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50">Cancel</button>
//                                 <button type="submit" className="px-5 py-2.5 bg-[#0f766e] text-white rounded-lg text-sm font-medium hover:bg-[#0d655e]">Update</button>
//                             </div>
//                         </form>
//                     </div>
//                 </div>
//             )}

//             {/* VIEW MODAL */}
//             {isViewModalOpen && selectedAttendance && (
//                 <div className="fixed inset-0 z-50 flex items-center justify-center bg-transparent pointer-events-none p-4">
//                     <div className="bg-white w-full max-w-lg rounded-xl shadow-2xl overflow-hidden pointer-events-auto border border-gray-200">
//                         <div className="flex justify-between items-center p-5 border-b border-gray-100">
//                             <h2 className="text-lg font-bold text-gray-800">Attendance Details</h2>
//                             <button onClick={() => setIsViewModalOpen(false)} className="text-gray-400 hover:text-red-500"><FiX size={20} /></button>
//                         </div>
//                         <div className="p-6 space-y-4">
//                             <div className="flex items-center gap-4 border-b pb-4">
//                                 <div className="w-12 h-12 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center font-bold text-lg uppercase">
//                                     {getEmployeeName(selectedAttendance.EmployeeID).charAt(0)}
//                                 </div>
//                                 <div>
//                                     <h3 className="font-bold text-gray-800 text-lg">{getEmployeeName(selectedAttendance.EmployeeID)}</h3>
//                                 </div>
//                             </div>
//                             <div className="grid grid-cols-2 gap-6 text-sm">
//                                 <div>
//                                     <p className="text-gray-500 mb-1">Date</p>
//                                     <p className="font-medium text-gray-800">{new Date(selectedAttendance.Date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
//                                 </div>
//                                 <div>
//                                     <p className="text-gray-500 mb-1">Status</p>
//                                     <span className={`px-2 py-1 rounded-full text-xs font-semibold ${selectedAttendance.Status === 'Present' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>{selectedAttendance.Status}</span>
//                                 </div>
//                                 <div>
//                                     <p className="text-gray-500 mb-1">Check-In Time</p>
//                                     <p className="font-medium text-gray-800">{selectedAttendance.CheckInTime ? new Date(selectedAttendance.CheckInTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '-'}</p>
//                                 </div>
//                                 <div>
//                                     <p className="text-gray-500 mb-1">Check-Out Time</p>
//                                     <p className="font-medium text-gray-800">{selectedAttendance.CheckOutTime ? new Date(selectedAttendance.CheckOutTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '-'}</p>
//                                 </div>
//                             </div>
//                         </div>
//                         <div className="p-4 bg-gray-50 border-t flex justify-end">
//                             <button onClick={() => setIsViewModalOpen(false)} className="px-5 py-2.5 bg-[#0f766e] text-white rounded-lg text-sm font-medium hover:bg-[#0d655e]">Close</button>
//                         </div>
//                     </div>
//                 </div>
//             )}
//         </div>
//     );
// };

// export default AttendanceMaster;



