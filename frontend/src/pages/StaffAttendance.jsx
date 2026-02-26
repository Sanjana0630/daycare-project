import React, { useState, useEffect } from 'react';
import { Calendar, Save, CheckCircle2, XCircle, Search, User } from 'lucide-react';
import { BASE_URL } from '../config';

const StaffAttendance = () => {
    const [staff, setStaff] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [savingId, setSavingId] = useState(null);
    const [currentTime, setCurrentTime] = useState(new Date());

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

            // Fetch only active staff
            const staffRes = await fetch(`${BASE_URL}/api/admin/staff/active`, { headers });
            const staffData = await staffRes.json();

            // Fetch attendance for selected date
            const attendanceRes = await fetch(`${BASE_URL}/api/admin/staff-attendance?date=${selectedDate}`, { headers });
            const attendanceData = await attendanceRes.json();

            if (staffData.success) {
                const existingAttendance = attendanceData.success ? attendanceData.data : [];

                // Initialize attendance state for each staff member
                const staffWithAttendance = staffData.data.map(member => {
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
                // Optional: Show success feedback
                console.log('Saved successfully');
            } else {
                alert(data.message || 'Failed to save attendance');
            }
        } catch (err) {
            alert('Save failed');
        } finally {
            setSavingId(null);
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

            {/* Search & Action Bar */}
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

            {/* Table Section */}
            <div className="bg-white rounded-[3rem] border border-gray-100 shadow-2xl shadow-gray-200/50 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50/50 border-b border-gray-100">
                                <th className="px-10 py-6 text-[11px] font-black text-gray-400 uppercase tracking-[0.2em]">Member Details</th>
                                <th className="px-10 py-6 text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] text-center">Duty Status</th>
                                <th className="px-10 py-6 text-[11px] font-black text-gray-400 uppercase tracking-[0.2em]">Observations</th>
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
                                                onClick={() => handleStatusChange(member._id, 'present')}
                                                className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-black transition-all duration-300 ${member.status === 'present'
                                                    ? 'bg-green-600 text-white shadow-lg shadow-green-100 scale-105'
                                                    : 'bg-gray-50 text-gray-400 border border-transparent hover:bg-gray-100'
                                                    }`}
                                            >
                                                <CheckCircle2 size={16} />
                                                ON DUTY
                                            </button>
                                            <button
                                                onClick={() => handleStatusChange(member._id, 'absent')}
                                                className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-black transition-all duration-300 ${member.status === 'absent'
                                                    ? 'bg-rose-600 text-white shadow-lg shadow-rose-100 scale-105'
                                                    : 'bg-gray-50 text-gray-400 border border-transparent hover:bg-gray-100'
                                                    }`}
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
                                                placeholder="Add internal observations..."
                                                className="w-full px-5 py-3 bg-gray-50/50 border border-gray-100 rounded-2xl text-sm font-medium focus:bg-white focus:ring-4 focus:ring-purple-50 focus:border-purple-200 outline-none transition-all placeholder:text-gray-300 italic"
                                                value={member.remarks}
                                                onChange={(e) => handleRemarksChange(member._id, e.target.value)}
                                            />
                                        </div>
                                    </td>
                                    <td className="px-10 py-6 text-right">
                                        <button
                                            onClick={() => handleSave(member)}
                                            disabled={savingId === member._id}
                                            className="inline-flex items-center gap-2 px-6 py-3.5 bg-gray-900 text-white text-xs font-black rounded-2xl shadow-xl shadow-gray-200 hover:bg-purple-700 hover:shadow-purple-200 active:scale-95 transition-all disabled:opacity-50 disabled:scale-100 uppercase tracking-widest"
                                        >
                                            {savingId === member._id ? (
                                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                            ) : (
                                                <Save size={18} />
                                            )}
                                            {savingId === member._id ? 'Syncing' : 'Commit'}
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

export default StaffAttendance;
