import React, { useState, useEffect } from 'react';
import { Calendar, User, History, AlertCircle, ChevronLeft, ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ParentAttendance = () => {
    const now = new Date();
    const [selectedMonth, setSelectedMonth] = useState(now.getMonth());
    const [selectedYear, setSelectedYear] = useState(now.getFullYear());
    
    const [child, setChild] = useState(null);
    const [attendance, setAttendance] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5005';

    useEffect(() => {
        fetchData();
    }, [selectedMonth, selectedYear]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            
            // 1. Fetch child details
            const childResponse = await fetch(`${apiUrl}/api/parent/child`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const childResult = await childResponse.json();
            
            if (!childResult.success || !childResult.data) {
                setError(childResult.message || 'No child record linked to this account.');
                setLoading(false);
                return;
            }
            
            const childData = childResult.data;
            setChild(childData);

            // 2. Fetch attendance for this child
            const attendanceResponse = await fetch(`${apiUrl}/api/parent/attendance/child/${childData._id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const attendanceResult = await attendanceResponse.json();
            
            if (attendanceResult.success) {
                // Process attendance data: Deduplicate by date and take latest markedAt
                const rawData = attendanceResult.data;
                const dailyAttendance = {};
                
                /** 
                 * @description Local-safe date key generation to avoid timezone mismatch.
                 */
                const getDateKey = (dateInput) => {
                    const d = new Date(dateInput);
                    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
                };

                rawData.forEach(record => {
                    const dateKey = getDateKey(record.date);
                    if (!dailyAttendance[dateKey] || new Date(record.markedAt) > new Date(dailyAttendance[dateKey].markedAt)) {
                        dailyAttendance[dateKey] = record;
                    }
                });

                // Generate records for the SELECTED month
                const processedHistory = [];
                
                // Determine loop boundaries for the selected month
                const lastDayItem = new Date(selectedYear, selectedMonth + 1, 0);
                const firstDayItem = new Date(selectedYear, selectedMonth, 1);
                
                // Start boundary: child admission date or 1st of month
                const admissionDateRaw = childData.admissionDate ? new Date(childData.admissionDate) : firstDayItem;
                const admissionMid = new Date(admissionDateRaw.getFullYear(), admissionDateRaw.getMonth(), admissionDateRaw.getDate());
                const loopStart = firstDayItem > admissionMid ? firstDayItem : admissionMid;

                // End boundary: last day of month or today (if current month)
                const todayMid = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                let loopEnd = lastDayItem;
                if (selectedYear === now.getFullYear() && selectedMonth === now.getMonth()) {
                    loopEnd = todayMid;
                } else if (new Date(selectedYear, selectedMonth) > now) {
                    // Future month selected
                    setAttendance([]);
                    setLoading(false);
                    return;
                }

                for (let d = new Date(loopEnd); d >= loopStart; d.setDate(d.getDate() - 1)) {
                    const dateKey = getDateKey(d);
                    if (dailyAttendance[dateKey]) {
                        processedHistory.push(dailyAttendance[dateKey]);
                    } else {
                        processedHistory.push({
                            date: new Date(d),
                            status: 'Not Marked',
                            isPlaceholder: true
                        });
                    }
                }

                setAttendance(processedHistory);
            } else {
                setError('Failed to fetch attendance history.');
            }
        } catch (err) {
            console.error('Error fetching parent attendance data:', err);
            setError('An error occurred while fetching data.');
        } finally {
            setLoading(false);
        }
    };

    const months = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    const years = [];
    const currentYear = now.getFullYear();
    const admissionYear = child?.admissionDate ? new Date(child.admissionDate).getFullYear() : currentYear - 1;
    for (let y = currentYear; y >= admissionYear; y--) {
        years.push(y);
    }

    if (loading && !child) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
                    <p className="text-gray-500 font-medium animate-pulse">Fetching attendance records...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm text-center max-w-md">
                    <div className="w-16 h-16 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-4 text-rose-500">
                        <AlertCircle size={32} />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Notice</h3>
                    <p className="text-gray-500 mb-6">{error}</p>
                    <button 
                        onClick={() => navigate('/parent/dashboard')}
                        className="px-6 py-2.5 bg-gray-900 text-white font-bold rounded-xl hover:bg-purple-700 transition-all shadow-lg"
                    >
                        Back to Dashboard
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-700">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <button 
                        onClick={() => navigate('/parent/dashboard')}
                        className="p-2 hover:bg-gray-100 rounded-xl transition-colors text-gray-400 hover:text-gray-900"
                    >
                        <ChevronLeft size={24} />
                    </button>
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">Attendance History</h2>
                        <p className="text-gray-500 text-sm">Reviewing logs for <strong>{child?.childName}</strong></p>
                    </div>
                </div>
                {/* Redesigned Month/Year Picker */}
                <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-2xl border border-gray-100 shadow-sm transition-all hover:border-purple-200">
                    <div className="hidden sm:flex p-2 bg-purple-50 text-purple-600 rounded-xl">
                        <Calendar size={18} />
                    </div>
                    
                    <div className="flex items-center gap-4">
                        {/* Month Selector */}
                        <div className="relative group">
                            <select 
                                value={selectedMonth}
                                onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                                className="appearance-none bg-transparent pr-8 py-1.5 pl-2 text-sm font-black text-gray-900 cursor-pointer outline-none transition-colors group-hover:text-purple-600"
                            >
                                {months.map((m, i) => (
                                    <option key={i} value={i} disabled={selectedYear === currentYear && i > now.getMonth()}>{m}</option>
                                ))}
                            </select>
                            <ChevronDown size={14} className="absolute right-1 top-1/2 -translate-y-1/2 text-gray-400 group-hover:text-purple-600 pointer-events-none transition-colors" />
                        </div>

                        <div className="w-[1px] h-4 bg-gray-100"></div>

                        {/* Year Selector */}
                        <div className="relative group">
                            <select 
                                value={selectedYear}
                                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                                className="appearance-none bg-transparent pr-8 py-1.5 pl-2 text-sm font-black text-gray-900 cursor-pointer outline-none transition-colors group-hover:text-purple-600"
                            >
                                {years.map(y => (
                                    <option key={y} value={y}>{y}</option>
                                ))}
                            </select>
                            <ChevronDown size={14} className="absolute right-1 top-1/2 -translate-y-1/2 text-gray-400 group-hover:text-purple-600 pointer-events-none transition-colors" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Attendance Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                    <div className="text-xs font-black uppercase tracking-widest text-gray-400 mb-1">Total Present</div>
                    <div className="text-3xl font-black text-green-600">
                        {attendance.filter(a => a.status === 'Present').length}
                    </div>
                </div>
                <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                    <div className="text-xs font-black uppercase tracking-widest text-gray-400 mb-1">Total Absent</div>
                    <div className="text-3xl font-black text-rose-600">
                        {attendance.filter(a => a.status === 'Absent').length}
                    </div>
                </div>
                <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                    <div className="text-xs font-black uppercase tracking-widest text-gray-400 mb-1">Attendance Rate</div>
                    <div className="text-3xl font-black text-purple-600">
                        {attendance.filter(a => !a.isPlaceholder).length > 0 
                            ? Math.round((attendance.filter(a => a.status === 'Present').length / attendance.filter(a => !a.isPlaceholder).length) * 100) 
                            : 0}%
                    </div>
                </div>
            </div>

            {/* Attendance Table */}
            <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden mb-8">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-100">
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-gray-400">Date</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-gray-400">Status</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-gray-400">Marked Time</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-gray-400">Notes</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {attendance.length > 0 ? (
                                attendance.map((record, idx) => (
                                    <tr key={idx} className="hover:bg-purple-50/30 transition-colors group">
                                        <td className="px-8 py-5">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-400 group-hover:bg-white group-hover:text-purple-600 transition-colors">
                                                    <Calendar size={18} />
                                                </div>
                                                <div className="font-black text-gray-900">
                                                    {new Date(record.date).toDateString() === new Date().toDateString()
                                                        ? 'Today'
                                                        : new Date(record.date).toLocaleDateString('en-US', { 
                                                            weekday: 'short',
                                                            month: 'short', 
                                                            day: 'numeric' 
                                                        })}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5">
                                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                                                record.status === 'Present'
                                                    ? 'bg-green-50 text-green-700 border-green-100'
                                                    : record.status === 'Absent'
                                                        ? 'bg-rose-50 text-rose-700 border-rose-100'
                                                        : 'bg-gray-50 text-gray-400 border-gray-100'
                                            }`}>
                                                <span className={`w-1.5 h-1.5 rounded-full ${
                                                    record.status === 'Present' 
                                                        ? 'bg-green-500' 
                                                        : record.status === 'Absent' 
                                                            ? 'bg-rose-500' 
                                                            : 'bg-gray-300'
                                                }`}></span>
                                                {record.status}
                                            </span>
                                        </td>
                                        <td className="px-8 py-5">
                                            <div className="text-sm font-bold text-gray-500 uppercase">
                                                {record.markedAt ? new Date(record.markedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}
                                            </div>
                                        </td>
                                        <td className="px-8 py-5">
                                            <div className="text-sm font-medium text-gray-400 italic">
                                                {record.remarks || (record.isPlaceholder ? 'Not marked yet' : 'No remarks')}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="4" className="px-8 py-20 text-center">
                                        <div className="flex flex-col items-center gap-4 opacity-40">
                                            <History size={48} className="text-gray-300" />
                                            <p className="text-sm font-black uppercase tracking-widest text-gray-400">No attendance records for this month yet.</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default ParentAttendance;
