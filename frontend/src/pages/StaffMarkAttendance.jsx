import React, { useState, useEffect } from 'react';
import { Search, CalendarCheck, Clock, CheckCircle2, XCircle, AlertCircle, Save, Calendar, User } from 'lucide-react';
import { BASE_URL } from '../config';

const StaffMarkAttendance = () => {
    const [children, setChildren] = useState([]);
    const [attendance, setAttendance] = useState({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(null); // ID of child being saved
    const [searchTerm, setSearchTerm] = useState('');
    const getTodayString = () => {
        const d = new Date();
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    };

    const [date, setDate] = useState(getTodayString());
    const [currentTime, setCurrentTime] = useState(new Date());

    // Live Clock Effect
    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem('token');

                // Fetch assigned children
                const childrenRes = await fetch(`${BASE_URL}/api/staff/assigned-children`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const childrenData = await childrenRes.json();

                if (childrenData.success) {
                    // Fetch existing attendance for the date
                    const attendanceRes = await fetch(`${BASE_URL}/api/staff/children-attendance?date=${date}`, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    const attendanceData = await attendanceRes.json();

                    const existingAttendance = attendanceData.success ? attendanceData.data : [];

                    // Initialize attendance state taking existing DB records into account
                    const initialAttendance = {};
                    childrenData.data.forEach(child => {
                        const record = existingAttendance.find(a => a.child === child._id);
                        if (record) {
                            initialAttendance[child._id] = {
                                status: record.status, // "Pending", "Present", "Absent"
                                checkIn: record.checkIn || '',
                                checkOut: record.checkOut || '',
                                remarks: record.remarks || ''
                            };
                        } else {
                            initialAttendance[child._id] = {
                                status: 'Pending',
                                checkIn: '09:00',
                                checkOut: '',
                                remarks: ''
                            };
                        }
                    });
                    setAttendance(initialAttendance);
                    setChildren(childrenData.data);
                }
            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [date]);

    // History state
    const [history, setHistory] = useState([]);
    const [historyLoading, setHistoryLoading] = useState(false);

    useEffect(() => {
        const fetchHistory = async () => {
            setHistoryLoading(true);
            try {
                const token = localStorage.getItem('token');
                const response = await fetch(`${BASE_URL}/api/staff/attendance-history`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const data = await response.json();
                if (data.success) {
                    setHistory(data.data);
                }
            } catch (error) {
                console.error("Error fetching history:", error);
            } finally {
                setHistoryLoading(false);
            }
        };
        fetchHistory();
    }, []);

    // Calculated Stats
    const stats = {
        total: children.length,
        present: Object.values(attendance).filter(a => a.status === 'Present').length,
        absent: Object.values(attendance).filter(a => a.status === 'Absent').length,
        unmarked: Object.values(attendance).filter(a => a.status === 'Pending').length
    };

    const handleStatusChange = (childId, status) => {
        setAttendance(prev => ({
            ...prev,
            [childId]: { ...prev[childId], status }
        }));
    };

    const handleInputChange = (childId, field, value) => {
        setAttendance(prev => ({
            ...prev,
            [childId]: { ...prev[childId], [field]: value }
        }));
    };

    const handleSave = async (childId) => {
        setSaving(childId);
        try {
            const token = localStorage.getItem('token');
            const data = {
                childId,
                date,
                ...attendance[childId]
            };

            const response = await fetch(`${BASE_URL}/api/staff/mark-attendance`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(data)
            });

            const result = await response.json();
            if (result.success) {
                console.log('Attendance saved successfully');
                // Opt: refreshing history upon save
                const historyResponse = await fetch(`${BASE_URL}/api/staff/attendance-history`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const historyData = await historyResponse.json();
                if (historyData.success) {
                    setHistory(historyData.data);
                }
            }
        } catch (error) {
            console.error('Error saving attendance:', error);
        } finally {
            setSaving(null);
        }
    };

    const filteredChildren = children.filter(child =>
        child.childName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const formattedDate = new Intl.DateTimeFormat('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    }).format(currentTime);

    const isToday = date === getTodayString();
    const isFuture = date > getTodayString();
    const isPast = date < getTodayString();

    const formattedTime = currentTime.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
    });

    if (loading && children.length === 0) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
                    <p className="text-gray-500 font-medium animate-pulse">Syncing class ledger...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Live Header & Clock Section */}
            <div className="relative overflow-hidden bg-gradient-to-br from-indigo-900 via-purple-900 to-fuchsia-900 rounded-[2.5rem] p-8 text-white shadow-2xl shadow-purple-200">
                <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-white/10 rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-60 h-60 bg-purple-500/20 rounded-full blur-3xl"></div>

                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="space-y-2">
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full border border-white/20 text-xs font-bold tracking-wider uppercase">
                            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                            My Class Attendance
                        </div>
                        <h2 className="text-5xl font-black tracking-tight font-mono">{formattedTime}</h2>
                        <p className="text-purple-100 font-medium opacity-80 text-lg">{formattedDate}</p>
                    </div>

                    <div className="flex flex-col items-end gap-3">
                        <div className="text-right">
                            <p className="text-xs font-bold text-purple-300 uppercase tracking-widest mb-2 px-2">Attendance Date</p>
                            <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md p-2 rounded-2xl border border-white/20 hover:bg-white/20 transition-all cursor-pointer group">
                                <Calendar size={18} className="ml-2 group-hover:scale-110 transition-transform" />
                                <input
                                    type="date"
                                    value={date}
                                    onChange={(e) => setDate(e.target.value)}
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
                    { label: 'Assigned Students', value: stats.total, color: 'purple', icon: User, bg: 'bg-purple-50', text: 'text-purple-600' },
                    { label: 'Present Now', value: stats.present, color: 'green', icon: CheckCircle2, bg: 'bg-green-50', text: 'text-green-600' },
                    { label: 'Absent Now', value: stats.absent, color: 'rose', icon: XCircle, bg: 'bg-rose-50', text: 'text-rose-600' },
                    { label: 'Pending', value: stats.unmarked, color: 'amber', icon: AlertCircle, bg: 'bg-amber-50', text: 'text-amber-600' }
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

            {/* Premium Search Bar */}
            <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400" size={24} />
                    <input
                        type="text"
                        placeholder="Search assigned students..."
                        className="w-full pl-16 pr-8 py-6 bg-white border border-gray-100 rounded-[2.5rem] shadow-sm focus:ring-4 focus:ring-purple-100 focus:border-purple-300 outline-none transition-all text-gray-700 font-bold placeholder:text-gray-300 text-xl"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* Table Section or Locked Message */}
            {!isFuture ? (
                <div className="bg-white rounded-[3rem] border border-gray-100 shadow-2xl shadow-gray-200/50 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50/50 border-b border-gray-100">
                                    <th className="px-10 py-8 text-[11px] font-black text-gray-400 uppercase tracking-[0.2em]">Student Name</th>
                                    <th className="px-10 py-8 text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] text-center">Status</th>
                                    <th className="px-10 py-8 text-[11px] font-black text-gray-400 uppercase tracking-[0.2em]">Time Log</th>
                                    <th className="px-10 py-8 text-[11px] font-black text-gray-400 uppercase tracking-[0.2em]">Internal Remarks</th>
                                    <th className="px-10 py-8 text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] text-right">Commit</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {filteredChildren.map((child, index) => (
                                    <tr key={child._id} className="hover:bg-purple-50/20 transition-colors group animate-in fade-in slide-in-from-left-4 duration-500" style={{ animationDelay: `${index * 50}ms` }}>
                                        <td className="px-10 py-8">
                                            <div className="flex items-center gap-4">
                                                <div className="w-16 h-16 bg-gradient-to-tr from-purple-100 to-indigo-100 rounded-2xl flex items-center justify-center text-purple-700 font-black text-2xl shadow-inner group-hover:scale-105 transition-transform">
                                                    {child.childName[0].toUpperCase()}
                                                </div>
                                                <div>
                                                    <div className="font-black text-gray-900 text-xl leading-tight">{child.childName}</div>
                                                    <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Student ID: {child._id.slice(-6)}</div>
                                                </div>
                                                {attendance[child._id].status === 'Pending' && (
                                                    <div className="ml-2 px-3 py-1 bg-amber-100 text-amber-700 text-[10px] font-black uppercase tracking-widest rounded-full border border-amber-200">
                                                        Pending
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-10 py-8">
                                            <div className="flex items-center justify-center gap-3">
                                                <button
                                                    onClick={() => isToday && handleStatusChange(child._id, 'Present')}
                                                    disabled={!isToday}
                                                    className={`flex items-center gap-2 px-6 py-3 rounded-2xl text-xs font-black transition-all duration-300 ${attendance[child._id].status === 'Present'
                                                        ? 'bg-green-600 text-white shadow-lg shadow-green-100 scale-105'
                                                        : 'bg-gray-50 text-gray-400 border border-transparent hover:bg-gray-100'
                                                        } ${!isToday ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                >
                                                    <CheckCircle2 size={16} />
                                                    PRESENT
                                                </button>
                                                <button
                                                    onClick={() => isToday && handleStatusChange(child._id, 'Absent')}
                                                    disabled={!isToday}
                                                    className={`flex items-center gap-2 px-6 py-3 rounded-2xl text-xs font-black transition-all duration-300 ${attendance[child._id].status === 'Absent'
                                                        ? 'bg-rose-600 text-white shadow-lg shadow-rose-100 scale-105'
                                                        : 'bg-gray-50 text-gray-400 border border-transparent hover:bg-gray-100'
                                                        } ${!isToday ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                >
                                                    <XCircle size={16} />
                                                    ABSENT
                                                </button>
                                            </div>
                                        </td>
                                        <td className="px-10 py-8">
                                            <div className="flex items-center gap-3 bg-gray-50/50 p-3 rounded-2xl border border-gray-100">
                                                <input
                                                    type="time"
                                                    value={attendance[child._id].checkIn}
                                                    readOnly={!isToday}
                                                    onChange={(e) => handleInputChange(child._id, 'checkIn', e.target.value)}
                                                    className={`bg-transparent border-none outline-none text-sm font-black text-gray-700 ${!isToday ? 'cursor-not-allowed' : ''}`}
                                                />
                                                <span className="text-gray-300 font-bold">—</span>
                                                <input
                                                    type="time"
                                                    value={attendance[child._id].checkOut}
                                                    placeholder="Out"
                                                    readOnly={!isToday}
                                                    onChange={(e) => handleInputChange(child._id, 'checkOut', e.target.value)}
                                                    className={`bg-transparent border-none outline-none text-sm font-black text-gray-700 ${!isToday ? 'cursor-not-allowed' : ''}`}
                                                />
                                            </div>
                                        </td>
                                        <td className="px-10 py-8">
                                            <input
                                                type="text"
                                                value={attendance[child._id].remarks}
                                                placeholder={isToday ? "Note for parent/admin..." : "No remarks allowed"}
                                                readOnly={!isToday}
                                                onChange={(e) => handleInputChange(child._id, 'remarks', e.target.value)}
                                                className={`w-full px-5 py-4 bg-gray-50/50 border border-gray-100 rounded-2xl text-sm font-medium outline-none transition-all placeholder:text-gray-300 italic ${!isToday ? 'cursor-not-allowed opacity-70' : 'focus:bg-white focus:ring-4 focus:ring-purple-50 focus:border-purple-200'}`}
                                            />
                                        </td>
                                        <td className="px-10 py-8 text-right">
                                            <button
                                                onClick={() => isToday && handleSave(child._id)}
                                                disabled={saving === child._id || !isToday}
                                                className={`inline-flex items-center gap-2 px-8 py-4 bg-gray-900 text-white text-xs font-black rounded-2xl shadow-xl shadow-gray-200 hover:bg-purple-700 hover:shadow-purple-200 active:scale-95 transition-all disabled:opacity-50 disabled:scale-100 uppercase tracking-widest ${!isToday ? 'opacity-50 cursor-not-allowed' : ''}`}
                                            >
                                                {saving === child._id ? (
                                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                                ) : (
                                                    <Save size={18} />
                                                )}
                                                {saving === child._id ? 'Syncing' : isToday ? 'Commit' : 'Locked'}
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : (
                <div className="bg-white rounded-[3rem] p-16 border border-gray-100 shadow-2xl shadow-gray-200/50 flex flex-col items-center text-center space-y-8 animate-in zoom-in-95 duration-500">
                    <div className="w-32 h-32 bg-rose-50 rounded-[2.5rem] flex items-center justify-center text-rose-500 animate-bounce">
                        <AlertCircle size={64} />
                    </div>
                    <div className="space-y-3 max-w-md">
                        <h3 className="text-4xl font-black text-gray-900 leading-tight">Future Locked</h3>
                        <p className="text-gray-500 font-medium text-lg">
                            You can't mark future dates attendance. Please select today's date or a past date to view records.
                        </p>
                    </div>
                    <button
                        onClick={() => setDate(getTodayString())}
                        className="flex items-center gap-3 px-10 py-5 bg-purple-600 text-white rounded-2xl font-black shadow-xl shadow-purple-100 hover:bg-purple-700 hover:-translate-y-1 transition-all active:scale-95 uppercase tracking-widest text-sm"
                    >
                        <Calendar size={20} />
                        Jump to Today
                    </button>
                </div>
            )}

            {/* Attendance History */}
            <div className="bg-white rounded-[3rem] border border-gray-100 shadow-2xl shadow-gray-200/50 p-8">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h3 className="text-2xl font-black text-gray-900">Attendance History</h3>
                        <p className="text-gray-500 font-medium">Recent attendance logs for your assigned students</p>
                    </div>
                    <div className="p-3 bg-purple-50 text-purple-600 rounded-2xl">
                        <Clock size={24} />
                    </div>
                </div>

                {historyLoading ? (
                    <div className="py-12 flex justify-center">
                        <div className="w-8 h-8 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
                    </div>
                ) : history.length === 0 ? (
                    <div className="py-12 text-center text-gray-500 font-medium bg-gray-50 rounded-2xl border border-gray-100 border-dashed">
                        No recent history records found.
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50/50 border-b border-gray-100">
                                    <th className="px-6 py-4 text-[11px] font-black text-gray-400 uppercase tracking-[0.2em]">Child Name</th>
                                    <th className="px-6 py-4 text-[11px] font-black text-gray-400 uppercase tracking-[0.2em]">Date</th>
                                    <th className="px-6 py-4 text-[11px] font-black text-gray-400 uppercase tracking-[0.2em]">Status</th>
                                    <th className="px-6 py-4 text-[11px] font-black text-gray-400 uppercase tracking-[0.2em]">Marked By</th>
                                    <th className="px-6 py-4 text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] text-right">Marked Time</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {history.map((record, idx) => {
                                    const formattedRecordDate = new Intl.DateTimeFormat('en-US', { month: 'long', day: 'numeric' }).format(new Date(record.date));
                                    const formattedMarkedTime = record.markedAt ? new Date(record.markedAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : '--:--';

                                    return (
                                        <tr key={record._id || idx} className="hover:bg-purple-50/20 transition-colors">
                                            <td className="px-6 py-4 font-black text-gray-900">{record.child?.childName || 'Unknown'}</td>
                                            <td className="px-6 py-4 font-bold text-gray-600">{formattedRecordDate}</td>
                                            <td className="px-6 py-4">
                                                <span className={`px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-full border ${record.status === 'Present' ? 'bg-green-50 text-green-700 border-green-200' : record.status === 'Absent' ? 'bg-rose-50 text-rose-700 border-rose-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>
                                                    {record.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 font-bold text-gray-600">{record.markedBy?.name || 'System'}</td>
                                            <td className="px-6 py-4 text-right font-medium text-gray-500">{formattedMarkedTime}</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default StaffMarkAttendance;
