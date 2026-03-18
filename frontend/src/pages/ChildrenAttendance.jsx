import React, { useState, useEffect } from 'react';
import { Calendar, Filter, User, Search, Edit2, X, AlertCircle, History } from 'lucide-react';
import { BASE_URL } from '../config';

const AttendanceHistoryModal = ({ isOpen, onClose, childName, history, loading }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white rounded-[2.5rem] w-full max-w-3xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
                <div className="px-8 py-6 bg-purple-600 text-white flex items-center justify-between">
                    <div>
                        <h3 className="text-xl font-black uppercase tracking-tight">Attendance History</h3>
                        <p className="text-purple-100 text-sm font-medium">Child Name: {childName}</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-xl transition-colors">
                        <X size={24} />
                    </button>
                </div>
                <div className="p-8">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-12 gap-4">
                            <div className="w-10 h-10 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
                            <p className="text-gray-500 font-medium">Fetching historical records...</p>
                        </div>
                    ) : history.length > 0 ? (
                        <div className="max-h-[450px] overflow-y-auto pr-2 custom-scrollbar">
                            <table className="w-full text-left border-separate border-spacing-y-2">
                                <thead>
                                    <tr className="text-gray-400">
                                        <th className="pb-2 px-2 text-[10px] font-black uppercase tracking-widest">Date</th>
                                        <th className="pb-2 px-2 text-[10px] font-black uppercase tracking-widest">Status</th>
                                        <th className="pb-2 px-2 text-[10px] font-black uppercase tracking-widest">Marked By</th>
                                        <th className="pb-2 px-2 text-[10px] font-black uppercase tracking-widest">Time</th>
                                        <th className="pb-2 px-2 text-[10px] font-black uppercase tracking-widest text-right">Remarks</th>
                                    </tr>
                                </thead>
                                <tbody className="space-y-2">
                                    {history.map((record, idx) => (
                                        <tr key={idx} className="bg-gray-50/50 hover:bg-white hover:shadow-sm transition-all group">
                                            <td className="py-4 px-4 rounded-l-2xl text-sm font-bold text-gray-900">
                                                {new Date(record.date).toDateString() === new Date().toDateString()
                                                    ? 'Today'
                                                    : new Date(record.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                            </td>
                                            <td className="py-4 px-2">
                                                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${record.status === 'Present'
                                                    ? 'bg-green-50 text-green-700 border-green-100'
                                                    : record.status === 'Absent'
                                                        ? 'bg-red-50 text-red-700 border-red-100'
                                                        : 'bg-gray-50 text-gray-500 border-gray-100'
                                                    }`}>
                                                    <span className={`w-1.5 h-1.5 rounded-full ${record.status === 'Present' ? 'bg-green-500' : record.status === 'Absent' ? 'bg-red-500' : 'bg-gray-400'}`}></span>
                                                    {record.status}
                                                </span>
                                            </td>
                                            <td className="py-4 px-2 text-sm text-gray-600 font-medium">
                                                {record.markedBy?.name || '-'}
                                            </td>
                                            <td className="py-4 px-2 text-sm text-gray-400 font-bold uppercase tracking-tighter">
                                                {record.markedAt ? new Date(record.markedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}
                                            </td>
                                            <td className="py-4 px-4 rounded-r-2xl text-right text-xs text-gray-500 font-medium italic">
                                                {record.remarks || '-'}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="text-center py-20 bg-gray-50 rounded-[2.5rem] border border-dashed border-gray-200">
                            <History size={48} className="mx-auto text-gray-300 mb-4 opacity-50" />
                            <p className="text-gray-500 font-black uppercase tracking-widest text-xs">No attendance history available for this child.</p>
                        </div>
                    )}
                    <div className="mt-8 flex justify-end">
                        <button
                            onClick={onClose}
                            className="px-10 py-4 bg-gray-900 text-white font-black rounded-2xl uppercase tracking-widest hover:bg-gray-800 transition-all active:scale-95 shadow-xl shadow-gray-200"
                        >
                            Close
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const ChildrenAttendance = () => {
    const [attendance, setAttendance] = useState([]);
    const [children, setChildren] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const getTodayString = () => {
        const d = new Date();
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    };

    const [selectedDate, setSelectedDate] = useState(getTodayString());
    const [historyModal, setHistoryModal] = useState({ isOpen: false, childName: '', childId: '' });
    const [historyData, setHistoryData] = useState([]);
    const [historyLoading, setHistoryLoading] = useState(false);

    const isToday = selectedDate === getTodayString();

    useEffect(() => {
        fetchChildren();
        fetchAttendance();
    }, [selectedDate]);

    const fetchChildren = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${BASE_URL}/api/children`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (data.success) {
                setChildren(data.data);
            }
        } catch (err) {
            console.error('Failed to fetch children');
        }
    };

    const fetchAttendance = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${BASE_URL}/api/admin/children-attendance?date=${selectedDate}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (data.success) {
                setAttendance(data.data);
            }
        } catch (err) {
            console.error('Failed to fetch attendance');
        } finally {
            setLoading(false);
        }
    };

    const fetchHistory = async (childId, childName) => {
        setHistoryModal({ isOpen: true, childName, childId });
        setHistoryLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${BASE_URL}/api/admin/attendance-history/${childId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (data.success) {
                setHistoryData(data.data);
            }
        } catch (err) {
            console.error('Failed to fetch attendance history');
        } finally {
            setHistoryLoading(false);
        }
    };

    const filteredDays = children.filter(child =>
        child.childName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return <div className="p-8 text-center text-gray-500">Loading attendance data...</div>;

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Children Attendance</h2>
                    <p className="text-gray-500">View and manage daily attendance records for children.</p>
                </div>
                <div className="flex flex-col items-end gap-1">
                    <div className="flex items-center gap-3 bg-white p-2 rounded-xl border border-gray-100 shadow-sm">
                        <Calendar size={20} className="text-gray-400" />
                        <input
                            type="date"
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            className="border-none outline-none text-sm font-medium text-gray-700"
                        />
                    </div>
                    {!isToday && (
                        <p className="text-[10px] font-bold text-rose-500 uppercase tracking-widest flex items-center gap-1 mt-1 pr-2">
                            <AlertCircle size={10} />
                            Read-Only Day
                        </p>
                    )}
                </div>
            </div>

            {/* Locked Warning Banner */}
            {!isToday && (
                <div className="bg-amber-50 border border-amber-100 rounded-3xl p-6 flex flex-col md:flex-row items-center justify-between gap-6 animate-in slide-in-from-top-4 duration-500 shadow-sm shadow-amber-50">
                    <div className="flex items-center gap-5">
                        <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-amber-500 shadow-sm border border-amber-50">
                            <AlertCircle size={28} />
                        </div>
                        <div>
                            <h4 className="text-xl font-black text-gray-900 leading-tight">Historical View</h4>
                            <p className="text-gray-500 font-medium">Attendance records for past or future dates are read-only. Editing is disabled.</p>
                        </div>
                    </div>
                    <button
                        onClick={() => setSelectedDate(getTodayString())}
                        className="whitespace-nowrap px-8 py-4 bg-white text-amber-700 border border-amber-200 rounded-2xl font-black shadow-sm hover:bg-amber-100/50 transition-all active:scale-95 uppercase tracking-widest text-xs flex items-center gap-2"
                    >
                        <Calendar size={16} />
                        Go to Today
                    </button>
                </div>
            )}

            {/* Filters */}
            <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search by child name..."
                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-100 focus:border-purple-400 outline-none transition-all"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 border border-gray-100 rounded-xl text-gray-600 font-medium">
                    <User size={18} />
                    <span>Total Students: {filteredDays.length}</span>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-100">
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Child</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Date</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Marked By</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Marked Time</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {filteredDays.map((child) => {
                                // Find attendance for this child
                                const record = attendance.find(a => a.child?._id === child._id || a.child === child._id);
                                return (
                                    <tr key={child._id} className="hover:bg-purple-50/30 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="relative group">
                                                    {child.photo ? (
                                                        <img
                                                            src={`${BASE_URL}${child.photo}`}
                                                            alt={child.childName}
                                                            className="w-12 h-12 rounded-full object-cover object-center border-2 border-white shadow-sm hover:scale-105 transition duration-300"
                                                            onError={(e) => {
                                                                e.target.onerror = null;
                                                                e.target.src = "";
                                                                e.target.parentElement.innerHTML = `<div class="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 text-white flex items-center justify-center font-semibold shadow-sm">${child.childName[0].toUpperCase()}</div>`;
                                                            }}
                                                        />
                                                    ) : (
                                                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 text-white flex items-center justify-center font-semibold shadow-sm hover:scale-105 transition duration-300">
                                                            {child.childName.charAt(0).toUpperCase()}
                                                        </div>
                                                    )}
                                                </div>
                                                <div>
                                                    <div className="font-bold text-gray-900">{child.childName}</div>
                                                    <div className="text-xs text-gray-400">Class: Preschool</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-gray-700 font-medium">{isToday ? 'Today' : selectedDate}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {record ? (
                                                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border ${record.status === 'Present'
                                                    ? 'bg-green-50 text-green-700 border-green-100'
                                                    : record.status === 'Absent'
                                                        ? 'bg-red-50 text-red-700 border-red-100'
                                                        : 'bg-gray-50 text-gray-500 border-gray-100'
                                                    }`}>
                                                    {record.status}
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-gray-50 text-gray-400 border border-gray-100">
                                                    Not Marked
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm text-gray-700">
                                                {record?.markedBy?.name || '-'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="text-sm text-gray-700 font-medium">
                                                {record?.markedAt ? new Date(record.markedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() => fetchHistory(child._id, child.childName)}
                                                className="inline-flex items-center gap-2 px-4 py-2 bg-purple-50 text-purple-600 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-purple-100 transition-all active:scale-95 border border-purple-100"
                                            >
                                                <History size={14} />
                                                View History
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            <AttendanceHistoryModal
                isOpen={historyModal.isOpen}
                onClose={() => setHistoryModal({ ...historyModal, isOpen: false })}
                childName={historyModal.childName}
                history={historyData}
                loading={historyLoading}
            />
        </div>
    );
};

export default ChildrenAttendance;
