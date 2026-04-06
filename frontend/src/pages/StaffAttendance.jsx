import React, { useState, useEffect } from 'react';
import { Calendar, Save, CheckCircle2, XCircle, Search, User, AlertCircle, History, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { BASE_URL } from '../config';

const StaffAttendanceHistoryModal = ({ isOpen, onClose, staffName, history, loading }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white rounded-[2.5rem] w-full max-w-3xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300 border border-gray-100">
                <div className="px-8 py-6 bg-purple-900 text-white flex items-center justify-between">
                    <div>
                        <h3 className="text-xl font-black uppercase tracking-tight">Staff Attendance History</h3>
                        <p className="text-purple-100 text-sm font-medium">Staff Name: {staffName}</p>
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
                                        <th className="pb-2 px-2 text-[10px] font-black uppercase tracking-widest text-center">Duty Status</th>
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
                                                    : new Date(record.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                            </td>
                                            <td className="py-4 px-2 text-center">
                                                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${record.status === 'present'
                                                    ? 'bg-green-50 text-green-700 border-green-100'
                                                    : record.status === 'absent'
                                                        ? 'bg-red-50 text-red-700 border-red-100'
                                                        : 'bg-amber-50 text-amber-700 border-amber-100'
                                                    }`}>
                                                    <span className={`w-1.5 h-1.5 rounded-full ${record.status === 'present' ? 'bg-green-500' : record.status === 'absent' ? 'bg-red-500' : 'bg-amber-500'}`}></span>
                                                    {record.status === 'present' ? 'ON DUTY' : record.status === 'absent' ? 'OFF DUTY' : record.status}
                                                </span>
                                            </td>
                                            <td className="py-4 px-2 text-sm text-gray-600 font-medium">
                                                {record.markedBy?.name || 'Admin'}
                                            </td>
                                            <td className="py-4 px-2 text-sm text-gray-400 font-bold uppercase tracking-tighter">
                                                {record.createdAt ? new Date(record.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}
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
                            <p className="text-gray-500 font-black uppercase tracking-widest text-xs">No attendance history available for this staff member.</p>
                        </div>
                    )}
                    <div className="mt-8 flex justify-end">
                        <button
                            onClick={onClose}
                            className="px-10 py-4 bg-gray-900 text-white font-black rounded-2xl uppercase tracking-widest hover:bg-gray-800 transition-all active:scale-95 shadow-xl shadow-gray-200"
                        >
                            Close Window
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const StaffAttendance = () => {
    const [staff, setStaff] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const getTodayString = () => {
        const d = new Date();
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    };

    const [selectedDate, setSelectedDate] = useState(getTodayString());
    const [savingId, setSavingId] = useState(null);
    const [currentTime, setCurrentTime] = useState(new Date());

    const [historyModal, setHistoryModal] = useState({ isOpen: false, staffName: '', staffId: '' });
    const [historyData, setHistoryData] = useState([]);
    const [historyLoading, setHistoryLoading] = useState(false);

    const isToday = selectedDate === getTodayString();
    const isFuture = selectedDate > getTodayString();
    const isPast = selectedDate < getTodayString();

    // Live Clock Effect
    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    // Calculated Stats
    const stats = {
        total: staff.length,
        present: staff.filter(m => m.status === 'present').length,
        absent: staff.filter(m => m.status === 'absent').length,
        unmarked: staff.filter(m => !m.status).length
    };

    // Filtered staff based on search term
    const filteredStaff = staff.filter(member =>
        member.fullName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    useEffect(() => {
        fetchStaffAndAttendance();
    }, [selectedDate]);

    const fetchStaffAndAttendance = async () => {
        setLoading(true);
        setError('');
        try {
            const token = localStorage.getItem('token');
            const headers = { 'Authorization': `Bearer ${token}` };

            // Fetch only active staff and pass date for backend filtering
            const staffRes = await fetch(`${BASE_URL}/api/admin/staff/active?date=${selectedDate}`, { headers });
            const staffData = await staffRes.json();

            // Fetch attendance for selected date
            const attendanceRes = await fetch(`${BASE_URL}/api/admin/staff-attendance?date=${selectedDate}`, { headers });
            const attendanceData = await attendanceRes.json();

            if (staffData.success) {
                const existingAttendance = attendanceData.success ? attendanceData.data : [];

                const parsedSelectedDate = new Date(selectedDate);
                parsedSelectedDate.setHours(0, 0, 0, 0);

                // Initialize attendance state for each staff member with frontend safety filter
                const staffWithAttendance = staffData.data
                    .filter(member => {
                        if (!member.joiningDate) return true;
                        const joiningDate = new Date(member.joiningDate);
                        joiningDate.setHours(0, 0, 0, 0);
                        return joiningDate <= parsedSelectedDate;
                    })
                    .map(member => {
                        const record = existingAttendance.find(a => a.staff === member._id);
                        return {
                            ...member,
                            status: record ? record.status : '', // Empty if not marked
                            remarks: record ? record.remarks : '',
                            isMarked: !!record
                        };
                    });
                setStaff(staffWithAttendance);
            } else {
                setError(staffData.message || 'Failed to fetch staff');
            }
        } catch (err) {
            setError('Connection failed. Please check your backend.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = (id, status) => {
        setStaff(staff.map(member =>
            member._id === id ? { ...member, status } : member
        ));
    };

    const handleRemarksChange = (id, remarks) => {
        setStaff(staff.map(member =>
            member._id === id ? { ...member, remarks } : member
        ));
    };

    const handleSave = async (member) => {
        setSavingId(member._id);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${BASE_URL}/api/admin/staff-attendance`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    staffId: member._id,
                    date: selectedDate,
                    status: member.status,
                    remarks: member.remarks
                }),
            });
            const data = await response.json();
            if (data.success) {
                toast.success('Staff attendance saved successfully');
            } else {
                toast.error(data.message || 'Failed to save attendance. Please try again.');
            }
        } catch (err) {
            toast.error('Failed to save attendance. Please try again.');
        } finally {
            setSavingId(null);
        }
    };

    const fetchHistory = async (staffId, staffName) => {
        setHistoryModal({ isOpen: true, staffName, staffId });
        setHistoryLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${BASE_URL}/api/admin/staff-attendance/history/${staffId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (data.success) {
                setHistoryData(data.data);
            }
        } catch (err) {
            console.error('Failed to fetch staff attendance history');
        } finally {
            setHistoryLoading(false);
        }
    };

    if (loading) return <div className="p-8 text-center text-gray-500">Loading staff member list...</div>;

    const formattedDate = new Intl.DateTimeFormat('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    }).format(currentTime);

    const formattedTime = currentTime.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
    });

    if (loading && staff.length === 0) return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
                <p className="text-gray-500 font-medium animate-pulse">Syncing staff ledger...</p>
            </div>
        </div>
    );

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Live Header & Clock Section */}
            <div className="relative overflow-hidden bg-gradient-to-br from-purple-900 to-indigo-900 rounded-[2.5rem] p-8 text-white shadow-2xl shadow-purple-200">
                <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-white/10 rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-60 h-60 bg-purple-500/20 rounded-full blur-3xl"></div>

                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="space-y-2">
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full border border-white/20 text-xs font-bold tracking-wider uppercase">
                            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                            Live System Active
                        </div>
                        <h2 className="text-5xl font-black tracking-tight font-mono">{formattedTime}</h2>
                        <p className="text-purple-100 font-medium opacity-80 text-lg">{formattedDate}</p>
                    </div>

                    <div className="flex flex-col items-end gap-3">
                        <div className="text-right">
                            <p className="text-xs font-bold text-purple-300 uppercase tracking-widest mb-2 px-2">Attendance Ledger Date</p>
                            <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md p-2 rounded-2xl border border-white/20 hover:bg-white/20 transition-all cursor-pointer group">
                                <Calendar size={18} className="ml-2 group-hover:scale-110 transition-transform" />
                                <input
                                    type="date"
                                    value={selectedDate}
                                    onChange={(e) => setSelectedDate(e.target.value)}
                                    className="bg-transparent border-none outline-none text-sm font-bold text-white cursor-pointer pr-2"
                                />
                            </div>
                            {isPast && (
                                <p className="text-[10px] font-bold text-amber-300 uppercase tracking-widest mt-2 flex items-center justify-end gap-1">
                                    <AlertCircle size={10} />
                                    Past Record (Read-only)
                                </p>
                            )}
                            {isFuture && (
                                <p className="text-[10px] font-bold text-rose-300 uppercase tracking-widest mt-2 flex items-center justify-end gap-1">
                                    <AlertCircle size={10} />
                                    Future Locked
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Daily Insight Strip */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: 'Total Roster', value: stats.total, color: 'purple', icon: User, bg: 'bg-purple-50', text: 'text-purple-600' },
                    { label: 'Present Today', value: stats.present, color: 'green', icon: CheckCircle2, bg: 'bg-green-50', text: 'text-green-600' },
                    { label: 'Absent Today', value: stats.absent, color: 'rose', icon: XCircle, bg: 'bg-rose-50', text: 'text-rose-600' },
                    { label: 'Pending', value: stats.unmarked, color: 'amber', icon: Search, bg: 'bg-amber-50', text: 'text-amber-600' }
                ].map((stat) => (
                    <div key={stat.label} className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
                        <div className="flex items-center gap-5">
                            <div className={`p-4 rounded-2xl ${stat.bg} ${stat.text} group-hover:scale-110 transition-transform`}>
                                <stat.icon size={28} />
                            </div>
                            <div>
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">{stat.label}</p>
                                <p className="text-3xl font-black text-gray-900 leading-none mt-1">{stat.value}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Search & Action Bar or Locked/Read-only Banner */}
            <div className="flex flex-col gap-6">
                {isPast && (
                    <div className="bg-amber-50 border-2 border-amber-100 rounded-3xl p-6 flex flex-col md:flex-row items-center justify-between gap-6 animate-in slide-in-from-top-4 duration-500 shadow-sm shadow-amber-50">
                        <div className="flex items-center gap-5">
                            <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-amber-500 shadow-sm border border-amber-50">
                                <AlertCircle size={28} />
                            </div>
                            <div>
                                <h4 className="text-xl font-black text-gray-900 leading-tight">Historical Record</h4>
                                <p className="text-gray-500 font-medium text-sm">You are viewing past attendance data. Editing is disabled for history integrity.</p>
                            </div>
                        </div>
                        <button
                            onClick={() => setSelectedDate(getTodayString())}
                            className="whitespace-nowrap px-8 py-4 bg-white text-amber-600 border border-amber-200 rounded-2xl font-black shadow-sm hover:bg-amber-50 transition-all active:scale-95 uppercase tracking-widest text-xs flex items-center gap-2"
                        >
                            <Calendar size={16} />
                            Back to Today
                        </button>
                    </div>
                )}

                {isFuture && (
                    <div className="bg-rose-50 border-2 border-rose-100 rounded-3xl p-6 flex flex-col md:flex-row items-center justify-between gap-6 animate-in slide-in-from-top-4 duration-500 shadow-sm shadow-rose-50">
                        <div className="flex items-center gap-5">
                            <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-rose-500 shadow-sm border border-rose-50">
                                <AlertCircle size={28} />
                            </div>
                            <div>
                                <h4 className="text-xl font-black text-gray-900 leading-tight">Future Locked</h4>
                                <p className="text-gray-500 font-medium text-sm">You can't mark future dates attendance. Please select today's date or a past date to view records.</p>
                            </div>
                        </div>
                        <button
                            onClick={() => setSelectedDate(getTodayString())}
                            className="whitespace-nowrap px-8 py-4 bg-white text-rose-600 border border-rose-200 rounded-2xl font-black shadow-sm hover:bg-rose-50 transition-all active:scale-95 uppercase tracking-widest text-xs flex items-center gap-2"
                        >
                            <Calendar size={16} />
                            Jump to Today
                        </button>
                    </div>
                )}

                <div className="flex flex-col md:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" size={22} />
                        <input
                            type="text"
                            placeholder="Search team by name or email..."
                            className="w-full pl-14 pr-8 py-5 bg-white border border-gray-100 rounded-[2.5rem] shadow-sm focus:ring-4 focus:ring-purple-100 focus:border-purple-300 outline-none transition-all text-gray-700 font-bold placeholder:text-gray-300 text-lg"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            {/* Table Section */}
            <div className="bg-white rounded-[3rem] border border-gray-100 shadow-2xl shadow-gray-200/50 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50/50 border-b border-gray-100">
                                <th className="px-10 py-6 text-[11px] font-black text-gray-400 uppercase tracking-[0.2em]">Member Details</th>
                                <th className="px-10 py-6 text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] text-center">Duty Status</th>
                                <th className="px-10 py-6 text-[11px] font-black text-gray-400 uppercase tracking-[0.2em]">Observations</th>
                                <th className="px-10 py-6 text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] text-right pr-4">History</th>
                                <th className="px-10 py-6 text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] text-right">Commit</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {filteredStaff.map((member, index) => (
                                <tr key={member._id} className="hover:bg-purple-50/20 transition-colors group animate-in fade-in slide-in-from-left-4 duration-500" style={{ animationDelay: `${index * 50}ms` }}>
                                    <td className="px-10 py-6">
                                        <div className="flex items-center gap-4">
                                            <div className="relative">
                                                <div className="w-14 h-14 bg-gradient-to-tr from-purple-100 to-indigo-100 rounded-2xl flex items-center justify-center text-purple-700 font-black text-xl shadow-inner group-hover:scale-105 transition-transform">
                                                    {member.fullName[0].toUpperCase()}
                                                </div>
                                                <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-4 border-white ${member.status === 'present' ? 'bg-green-500' : member.status === 'absent' ? 'bg-red-500' : 'bg-gray-300'}`}></div>
                                            </div>
                                            <div>
                                                <div className="font-black text-gray-900 text-lg leading-tight">{member.fullName}</div>
                                                <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">{member.role} • {member.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-10 py-6">
                                        <div className="flex items-center justify-center gap-3">
                                            <button
                                                onClick={() => isToday && handleStatusChange(member._id, 'present')}
                                                disabled={!isToday}
                                                className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-black transition-all duration-300 ${member.status === 'present'
                                                    ? 'bg-green-600 text-white shadow-lg shadow-green-100 scale-105'
                                                    : 'bg-gray-50 text-gray-400 border border-transparent hover:bg-gray-100'
                                                    } ${!isToday ? 'opacity-50 cursor-not-allowed' : ''}`}
                                            >
                                                <CheckCircle2 size={16} />
                                                ON DUTY
                                            </button>
                                            <button
                                                onClick={() => isToday && handleStatusChange(member._id, 'absent')}
                                                disabled={!isToday}
                                                className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-black transition-all duration-300 ${member.status === 'absent'
                                                    ? 'bg-rose-600 text-white shadow-lg shadow-rose-100 scale-105'
                                                    : 'bg-gray-50 text-gray-400 border border-transparent hover:bg-gray-100'
                                                    } ${!isToday ? 'opacity-50 cursor-not-allowed' : ''}`}
                                            >
                                                <XCircle size={16} />
                                                OFF DUTY
                                            </button>
                                        </div>
                                    </td>
                                    <td className="px-10 py-6">
                                        <div className="relative">
                                            <input
                                                type="text"
                                                placeholder={isToday ? "Add internal observations..." : "No remarks allowed"}
                                                readOnly={!isToday}
                                                className={`w-full px-5 py-3 bg-gray-50/50 border border-gray-100 rounded-2xl text-sm font-medium outline-none transition-all placeholder:text-gray-300 italic ${!isToday ? 'cursor-not-allowed opacity-70' : 'focus:bg-white focus:ring-4 focus:ring-purple-50 focus:border-purple-200'}`}
                                                value={member.remarks}
                                                onChange={(e) => handleRemarksChange(member._id, e.target.value)}
                                            />
                                        </div>
                                    </td>
                                    <td className="px-10 py-6 text-right pr-4">
                                        <button
                                            onClick={() => fetchHistory(member._id, member.fullName)}
                                            className="inline-flex items-center gap-2 px-4 py-2 bg-purple-50 text-purple-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-purple-100 transition-all active:scale-95 border border-purple-100"
                                        >
                                            <History size={14} />
                                            History
                                        </button>
                                    </td>
                                    <td className="px-10 py-6 text-right">
                                        <button
                                            onClick={() => isToday && handleSave(member)}
                                            disabled={savingId === member._id || !isToday}
                                            className={`inline-flex items-center gap-2 px-6 py-3.5 bg-gray-900 text-white text-xs font-black rounded-2xl shadow-xl shadow-gray-200 hover:bg-purple-700 hover:shadow-purple-200 active:scale-95 transition-all disabled:opacity-50 disabled:scale-100 uppercase tracking-widest ${!isToday ? 'opacity-50 cursor-not-allowed' : ''}`}
                                        >
                                            {savingId === member._id ? (
                                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                            ) : (
                                                <Save size={18} />
                                            )}
                                            {savingId === member._id ? 'Syncing' : isToday ? 'Commit' : 'Locked'}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            <StaffAttendanceHistoryModal
                isOpen={historyModal.isOpen}
                onClose={() => setHistoryModal({ ...historyModal, isOpen: false })}
                staffName={historyModal.staffName}
                history={historyData}
                loading={historyLoading}
            />
        </div>
    );
};

export default StaffAttendance;
