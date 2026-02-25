import React, { useState, useEffect } from 'react';
import { Search, CalendarCheck, Clock, CheckCircle2, XCircle, AlertCircle, Save, Calendar, User } from 'lucide-react';
import { BASE_URL } from '../config';

const StaffMarkAttendance = () => {
    const [children, setChildren] = useState([]);
    const [attendance, setAttendance] = useState({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(null); // ID of child being saved
    const [searchTerm, setSearchTerm] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
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
                    setChildren(childrenData.data);

                    // Initialize attendance state (could fetch existing attendance for date here if API exists)
                    const initialAttendance = {};
                    childrenData.data.forEach(child => {
                        initialAttendance[child._id] = {
                            status: 'Present',
                            checkIn: '09:00',
                            checkOut: '',
                            remarks: ''
                        };
                    });
                    setAttendance(initialAttendance);
                }
            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [date]);

    // Calculated Stats
    const stats = {
        total: children.length,
        present: Object.values(attendance).filter(a => a.status === 'Present').length,
        absent: Object.values(attendance).filter(a => a.status === 'Absent').length,
        unmarked: children.length - Object.keys(attendance).length
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
                            Live Class Status
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
                    { label: 'Total Class', value: stats.total, color: 'indigo', icon: CalendarCheck, bg: 'bg-indigo-50', text: 'text-indigo-600' }
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

            {/* Table Section */}
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
                                        </div>
                                    </td>
                                    <td className="px-10 py-8">
                                        <div className="flex items-center justify-center gap-3">
                                            <button
                                                onClick={() => handleStatusChange(child._id, 'Present')}
                                                className={`flex items-center gap-2 px-6 py-3 rounded-2xl text-xs font-black transition-all duration-300 ${attendance[child._id].status === 'Present'
                                                    ? 'bg-green-600 text-white shadow-lg shadow-green-100 scale-105'
                                                    : 'bg-gray-50 text-gray-400 border border-transparent hover:bg-gray-100'
                                                    }`}
                                            >
                                                <CheckCircle2 size={16} />
                                                PRESENT
                                            </button>
                                            <button
                                                onClick={() => handleStatusChange(child._id, 'Absent')}
                                                className={`flex items-center gap-2 px-6 py-3 rounded-2xl text-xs font-black transition-all duration-300 ${attendance[child._id].status === 'Absent'
                                                    ? 'bg-rose-600 text-white shadow-lg shadow-rose-100 scale-105'
                                                    : 'bg-gray-50 text-gray-400 border border-transparent hover:bg-gray-100'
                                                    }`}
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
                                                onChange={(e) => handleInputChange(child._id, 'checkIn', e.target.value)}
                                                className="bg-transparent border-none outline-none text-sm font-black text-gray-700"
                                            />
                                            <span className="text-gray-300 font-bold">—</span>
                                            <input
                                                type="time"
                                                value={attendance[child._id].checkOut}
                                                placeholder="Out"
                                                onChange={(e) => handleInputChange(child._id, 'checkOut', e.target.value)}
                                                className="bg-transparent border-none outline-none text-sm font-black text-gray-700"
                                            />
                                        </div>
                                    </td>
                                    <td className="px-10 py-8">
                                        <input
                                            type="text"
                                            value={attendance[child._id].remarks}
                                            placeholder="Note for parent/admin..."
                                            onChange={(e) => handleInputChange(child._id, 'remarks', e.target.value)}
                                            className="w-full px-5 py-4 bg-gray-50/50 border border-gray-100 rounded-2xl text-sm font-medium focus:bg-white focus:ring-4 focus:ring-purple-50 focus:border-purple-200 outline-none transition-all placeholder:text-gray-300 italic"
                                        />
                                    </td>
                                    <td className="px-10 py-8 text-right">
                                        <button
                                            onClick={() => handleSave(child._id)}
                                            disabled={saving === child._id}
                                            className="inline-flex items-center gap-2 px-8 py-4 bg-gray-900 text-white text-xs font-black rounded-2xl shadow-xl shadow-gray-200 hover:bg-purple-700 hover:shadow-purple-200 active:scale-95 transition-all disabled:opacity-50 disabled:scale-100 uppercase tracking-widest"
                                        >
                                            {saving === child._id ? (
                                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                            ) : (
                                                <Save size={18} />
                                            )}
                                            {saving === child._id ? 'Syncing' : 'Commit'}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default StaffMarkAttendance;
