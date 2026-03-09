import React, { useState, useEffect } from 'react';
import { Calendar, Filter, User, Search, Edit2, X, AlertCircle, History } from 'lucide-react';
import { BASE_URL } from '../config';

const AttendanceHistoryModal = ({ isOpen, onClose, childName, history, loading }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white rounded-[2.5rem] w-full max-w-2xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
                <div className="px-8 py-6 bg-purple-600 text-white flex items-center justify-between">
                    <div>
                        <h3 className="text-xl font-black">Attendance History</h3>
                        <p className="text-purple-100 text-sm font-medium">{childName}</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-xl transition-colors">
                        <X size={24} />
                    </button>
                </div>
                <div className="p-8">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-12 gap-4">
                            <div className="w-10 h-10 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
                            <p className="text-gray-500 font-medium">Fetching history...</p>
                        </div>
                    ) : history.length > 0 ? (
                        <div className="max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-gray-100">
                                        <th className="pb-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Date</th>
                                        <th className="pb-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Status</th>
                                        <th className="pb-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Marked By</th>
                                        <th className="pb-4 text-xs font-bold text-gray-400 uppercase tracking-widest text-right">Time</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {history.map((record, idx) => (
                                        <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
                                            <td className="py-4 text-sm font-bold text-gray-900">
                                                {new Date(record.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                            </td>
                                            <td className="py-4">
                                                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${record.status === 'Present'
                                                    ? 'bg-green-50 text-green-700 border-green-100'
                                                    : 'bg-red-50 text-red-700 border-red-100'
                                                    }`}>
                                                    {record.status}
                                                </span>
                                            </td>
                                            <td className="py-4 text-sm text-gray-600 font-medium">
                                                {record.markedBy?.name || 'System'}
                                            </td>
                                            <td className="py-4 text-right text-sm text-gray-500">
                                                {record.markedAt ? new Date(record.markedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <p className="text-gray-500 font-medium">No previous attendance records found.</p>
                        </div>
                    )}
                    <div className="mt-8 flex justify-end">
                        <button
                            onClick={onClose}
                            className="px-8 py-3 bg-gray-100 text-gray-600 font-black rounded-2xl uppercase tracking-widest hover:bg-gray-200 transition-all active:scale-95"
                        >
                            Close History
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
                                                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 font-bold">
                                                    {child.childName[0].toUpperCase()}
                                                </div>
                                                <div>
                                                    <div className="font-bold text-gray-900">{child.childName}</div>
                                                    <div className="text-xs text-gray-400">Class: Preschool</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-gray-700 font-medium">{selectedDate}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {record ? (
                                                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border ${record.status === 'Present'
                                                    ? 'bg-green-50 text-green-700 border-green-100'
                                                    : 'bg-red-50 text-red-700 border-red-100'
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
                                                {record?.markedBy?.name || (record ? 'System' : '--')}
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
