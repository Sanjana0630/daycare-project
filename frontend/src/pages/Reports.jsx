import React, { useState, useEffect } from 'react';
import { FileText, Download, Filter, X, Search, CalendarDays, User, BookOpen, Clock, Activity, Target, CheckCircle2, TrendingUp, Send } from 'lucide-react';

const Reports = () => {
    // Dropdown Data
    const [childrenList, setChildrenList] = useState([]);
    
    // Filter States
    const [selectedChildId, setSelectedChildId] = useState('all');
    const [timeRange, setTimeRange] = useState('daily');
    const [reportDate, setReportDate] = useState(getInitialDate('daily'));
    const [searchQuery, setSearchQuery] = useState('');
    const [showDropdown, setShowDropdown] = useState(false);

    // Result States
    const [loading, setLoading] = useState(false);
    const [reportResult, setReportResult] = useState(null); // Will hold { childInfo, attendance, activities, summary }
    const [error, setError] = useState(null);

    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5005';

    function getInitialDate(range) {
        const d = new Date();
        if (range === 'daily') {
            return d.toISOString().split('T')[0];
        } else if (range === 'weekly') {
            const startDate = new Date(d.getFullYear(), 0, 1);
            const days = Math.floor((d - startDate) / (24 * 60 * 60 * 1000));
            const weekNumber = Math.ceil(days / 7);
            return `${d.getFullYear()}-W${weekNumber.toString().padStart(2, '0')}`;
        } else if (range === 'monthly') {
            return `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}`;
        }
        return '';
    }

    // Update default date when range changes
    useEffect(() => {
        setReportDate(getInitialDate(timeRange));
    }, [timeRange]);

    // Clear report when filters change to force regeneration
    useEffect(() => {
        setReportResult(null);
    }, [selectedChildId, timeRange, reportDate]);

    useEffect(() => {
        const fetchChildren = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await fetch(`${apiUrl}/api/children`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const data = await res.json();
                if (data.success || Array.isArray(data)) {
                    const list = Array.isArray(data) ? data : data.data || [];
                    setChildrenList(list);
                }
            } catch (err) {
                console.error('Error fetching children:', err);
            }
        };

        fetchChildren();
    }, [apiUrl]);

    const handleGenerateReport = async () => {
        setLoading(true);
        setError(null);
        setReportResult(null);
        try {
            const token = localStorage.getItem('token');
            const queryParams = new URLSearchParams({
                childId: selectedChildId,
                range: timeRange,
                date: reportDate
            });

            const response = await fetch(`${apiUrl}/api/reports/full?${queryParams}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const result = await response.json();
            if (result.success) {
                setReportResult(result.data);
            } else {
                setError(result.message || 'Failed to generate report');
            }
        } catch (err) {
            console.error('Error generating report:', err);
            setError('An error occurred while generating the report.');
        } finally {
            setLoading(false);
        }
    };

    const handleSendReport = async () => {
        if (!reportResult) return;
        
        // Mock send functionality or future API hook
        alert(`Report successfully sent to parent: ${reportResult.childInfo.parentName} for ${reportResult.childInfo.name}!`);
    };

    const exportToPDF = () => {
        window.print();
    };

    const filteredChildren = childrenList.filter(child => 
        child.childName?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const getSelectedChildName = () => {
        if (selectedChildId === 'all') return 'All Children';
        const child = childrenList.find(c => c._id === selectedChildId);
        return child ? child.childName : 'Unknown Child';
    };

    const isResultEmpty = !reportResult || (reportResult.attendance.length === 0 && reportResult.activities.length === 0);

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* Filter Section */}
            <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm space-y-8 print:hidden">
                <div className="flex items-center gap-4 mb-2">
                    <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center">
                        <Filter size={24} />
                    </div>
                    <div>
                        <h3 className="text-xl font-black text-gray-900">Report Generator</h3>
                        <p className="text-sm text-gray-400 font-bold uppercase tracking-widest">Generate Comprehensive Reports</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
                    {/* Child Selection (Searchable Dropdown) */}
                    <div className="space-y-2 relative">
                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Select Child</label>
                        <div className="relative">
                            <div 
                                onClick={() => setShowDropdown(!showDropdown)}
                                className="w-full px-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold text-gray-700 cursor-pointer flex justify-between items-center"
                            >
                                <span>{getSelectedChildName()}</span>
                            </div>
                            
                            {showDropdown && (
                                <div className="absolute z-10 w-full mt-2 bg-white border border-gray-100 rounded-2xl shadow-xl max-h-60 overflow-y-auto">
                                    <div className="p-3">
                                        <div className="relative">
                                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                            <input 
                                                type="text" 
                                                placeholder="Search children..."
                                                value={searchQuery}
                                                onChange={(e) => setSearchQuery(e.target.value)}
                                                className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-100 rounded-xl text-sm font-medium outline-none"
                                            />
                                        </div>
                                    </div>
                                    <div 
                                        onClick={() => { setSelectedChildId('all'); setShowDropdown(false); }}
                                        className={`px-4 py-3 cursor-pointer hover:bg-purple-50 transition-colors font-bold ${selectedChildId === 'all' ? 'text-purple-600 bg-purple-50/50' : 'text-gray-700'}`}
                                    >
                                        All Children
                                    </div>
                                    {filteredChildren.map(child => (
                                        <div 
                                            key={child._id}
                                            onClick={() => { setSelectedChildId(child._id); setShowDropdown(false); }}
                                            className={`px-4 py-3 cursor-pointer hover:bg-purple-50 transition-colors font-bold ${selectedChildId === child._id ? 'text-purple-600 bg-purple-50/50' : 'text-gray-700'}`}
                                        >
                                            {child.childName}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Time Range */}
                    <div className="space-y-2">
                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Time Range</label>
                        <select
                            value={timeRange}
                            onChange={(e) => setTimeRange(e.target.value)}
                            className="w-full px-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold text-gray-700 focus:ring-2 focus:ring-purple-100 outline-none appearance-none cursor-pointer"
                        >
                            <option value="daily">Daily</option>
                            <option value="weekly">Weekly</option>
                            <option value="monthly">Monthly</option>
                        </select>
                    </div>

                    {/* Date Picker */}
                    <div className="space-y-2">
                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Select Period</label>
                        <input
                            type={timeRange === 'daily' ? 'date' : timeRange === 'weekly' ? 'week' : 'month'}
                            value={reportDate}
                            onChange={(e) => setReportDate(e.target.value)}
                            className="w-full px-4 py-[14px] bg-gray-50 border border-gray-100 rounded-2xl font-bold text-gray-700 outline-none"
                        />
                    </div>
                </div>

                <div className="flex justify-end pt-4 border-t border-gray-100">
                    <button
                        onClick={handleGenerateReport}
                        disabled={loading}
                        className="px-8 py-4 bg-gray-900 text-white font-black rounded-2xl uppercase tracking-widest hover:bg-black transition-all active:scale-95 disabled:opacity-50 flex items-center gap-2 shadow-xl shadow-gray-200"
                    >
                        {loading ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        ) : (
                            <FileText size={18} />
                        )}
                        Generate Full Report
                    </button>
                </div>
            </div>

            {/* ERROR DISPLAY */}
            {error && (
                <div className="p-4 bg-red-50 text-red-600 border border-red-100 rounded-2xl flex items-center justify-center font-bold mt-4">
                    {error}
                </div>
            )}

            {/* EMPTY STATE */}
            {reportResult && isResultEmpty && (
                <div className="bg-white p-12 rounded-[40px] border border-gray-100 shadow-sm text-center space-y-4 animate-in fade-in">
                    <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto text-gray-300">
                        <FileText size={32} />
                    </div>
                    <h3 className="text-xl font-black text-gray-900">No Records Found</h3>
                    <p className="text-gray-500 font-medium max-w-sm mx-auto">
                        We couldn't find any attendance or activity records for the selected child during this period.
                    </p>
                </div>
            )}

            {/* COMBINED FULL REPORT VIEW */}
            {reportResult && !isResultEmpty && (
                <div className="bg-white rounded-[40px] border border-gray-100 shadow-sm overflow-hidden animate-in slide-in-from-bottom-8 duration-700 report-container print:border-none print:shadow-none">
                    
                    {/* Header Controls (Hidden in Print) */}
                    <div className="p-8 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gray-50/50 print:hidden">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center">
                                <Target size={20} />
                            </div>
                            <div>
                                <h2 className="text-xl font-black text-gray-900 tracking-tight">Report Results</h2>
                                <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">{timeRange} Summary</p>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <button onClick={handleSendReport} className="px-6 py-3 bg-purple-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-2 hover:bg-purple-700 transition-all active:scale-95 shadow-lg shadow-purple-200">
                                <Send size={14} /> Send Report
                            </button>
                            <button onClick={exportToPDF} className="px-6 py-3 bg-gray-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-2 hover:bg-black transition-all active:scale-95 shadow-lg shadow-gray-200">
                                <FileText size={14} /> Print
                            </button>
                            <button onClick={() => setReportResult(null)} className="p-3 bg-white border border-gray-200 text-gray-400 rounded-2xl hover:text-red-500 hover:border-red-100 transition-all active:scale-95" title="Clear Report">
                                <X size={20} />
                            </button>
                        </div>
                    </div>

                    {/* Report Content */}
                    <div className="p-8 space-y-10 print:p-0">
                        {/* Section 1: Child Info */}
                        <div className="space-y-4">
                            <h3 className="text-sm font-black text-purple-600 uppercase tracking-widest border-b border-gray-100 pb-2 flex items-center gap-2">
                                <User size={16} /> SECTION 1: CHILD INFO
                            </h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6 bg-purple-50/30 rounded-3xl border border-purple-100">
                                <div>
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Child Name</p>
                                    <p className="font-bold text-gray-900 text-lg">{reportResult.childInfo.name}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Class</p>
                                    <p className="font-bold text-gray-900 text-lg">{reportResult.childInfo.className}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Parent Name</p>
                                    <p className="font-bold text-gray-900 text-lg">{reportResult.childInfo.parentName}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Selected Period</p>
                                    <p className="font-bold text-gray-900 text-lg flex items-center gap-2">
                                        <CalendarDays size={16} className="text-purple-400" />
                                        {reportDate}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Section 4: Summary Cards (Moved to top for visibility) */}
                        <div className="space-y-4">
                            <h3 className="text-sm font-black text-amber-600 uppercase tracking-widest border-b border-gray-100 pb-2 flex items-center gap-2">
                                <TrendingUp size={16} /> SECTION 2: HIGH-LEVEL SUMMARY
                            </h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="p-6 bg-emerald-50 rounded-3xl border border-emerald-100 text-center">
                                    <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-2">Total Present Days</p>
                                    <p className="text-4xl font-black text-emerald-900">{reportResult.summary.presentDays}</p>
                                </div>
                                <div className="p-6 bg-rose-50 rounded-3xl border border-rose-100 text-center">
                                    <p className="text-[10px] font-black text-rose-600 uppercase tracking-widest mb-2">Total Absent Days</p>
                                    <p className="text-4xl font-black text-rose-900">{reportResult.summary.absentDays}</p>
                                </div>
                                <div className="p-6 bg-indigo-50 rounded-3xl border border-indigo-100 text-center">
                                    <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-2">Activities Completed</p>
                                    <p className="text-4xl font-black text-indigo-900">{reportResult.summary.activitiesCompleted}</p>
                                </div>
                                <div className="p-6 bg-blue-50 rounded-3xl border border-blue-100 text-center">
                                    <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-2">Average Rating</p>
                                    <div className="flex items-center justify-center gap-2">
                                        <p className="text-4xl font-black text-blue-900">{reportResult.summary.averageRating}</p>
                                        <span className="text-blue-400 text-2xl">★</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-4">
                            {/* Section 2: Attendance Table */}
                            <div className="space-y-4">
                                <h3 className="text-sm font-black text-emerald-600 uppercase tracking-widest border-b border-gray-100 pb-2 flex items-center gap-2">
                                    <Clock size={16} /> SECTION 3: ATTENDANCE
                                </h3>
                                <div className="border border-gray-100 rounded-3xl overflow-hidden bg-gray-50/20">
                                    <div className="overflow-x-auto max-h-[400px]">
                                        <table className="w-full text-left relative">
                                            <thead className="bg-gray-100/50 sticky top-0 backdrop-blur z-10">
                                                <tr>
                                                    <th className="px-5 py-4 text-[10px] font-black text-gray-500 uppercase tracking-widest">Date</th>
                                                    {selectedChildId === 'all' && <th className="px-5 py-4 text-[10px] font-black text-gray-500 uppercase tracking-widest">Name</th>}
                                                    <th className="px-5 py-4 text-[10px] font-black text-gray-500 uppercase tracking-widest">Status</th>
                                                    <th className="px-5 py-4 text-[10px] font-black text-gray-500 uppercase tracking-widest text-right">Marked By</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-100">
                                                {reportResult.attendance.length === 0 ? (
                                                    <tr>
                                                        <td colSpan="4" className="px-5 py-8 text-center text-gray-400 font-medium text-sm">No attendance records found.</td>
                                                    </tr>
                                                ) : reportResult.attendance.map((row, i) => (
                                                    <tr key={`att-${i}`} className="hover:bg-white transition-colors">
                                                        <td className="px-5 py-3 text-sm text-gray-600 font-medium whitespace-nowrap">{row.date}</td>
                                                        {selectedChildId === 'all' && <td className="px-5 py-3 text-sm font-bold text-gray-900 whitespace-nowrap">{row.name}</td>}
                                                        <td className="px-5 py-3">
                                                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${row.status.toLowerCase() === 'present' ? 'bg-green-50 text-green-700 border-green-100' : 'bg-red-50 text-red-700 border-red-100'}`}>
                                                                {row.status}
                                                            </span>
                                                        </td>
                                                        <td className="px-5 py-3 text-sm text-gray-500 text-right whitespace-nowrap">{row.markedBy}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>

                            {/* Section 3: Activity Table */}
                            <div className="space-y-4">
                                <h3 className="text-sm font-black text-indigo-600 uppercase tracking-widest border-b border-gray-100 pb-2 flex items-center gap-2">
                                    <Activity size={16} /> SECTION 4: ACTIVITY
                                </h3>
                                <div className="border border-gray-100 rounded-3xl overflow-hidden bg-gray-50/20">
                                    <div className="overflow-x-auto max-h-[400px]">
                                        <table className="w-full text-left relative">
                                            <thead className="bg-gray-100/50 sticky top-0 backdrop-blur z-10">
                                                <tr>
                                                    <th className="px-5 py-4 text-[10px] font-black text-gray-500 uppercase tracking-widest">Date</th>
                                                    {selectedChildId === 'all' && <th className="px-5 py-4 text-[10px] font-black text-gray-500 uppercase tracking-widest">Name</th>}
                                                    <th className="px-5 py-4 text-[10px] font-black text-gray-500 uppercase tracking-widest">Activity</th>
                                                    <th className="px-5 py-4 text-[10px] font-black text-gray-500 uppercase tracking-widest">Status</th>
                                                    <th className="px-5 py-4 text-[10px] font-black text-gray-500 uppercase tracking-widest text-right">Rating</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-100">
                                                {reportResult.activities.length === 0 ? (
                                                    <tr>
                                                        <td colSpan="5" className="px-5 py-8 text-center text-gray-400 font-medium text-sm">No activity records found.</td>
                                                    </tr>
                                                ) : reportResult.activities.map((row, i) => (
                                                    <tr key={`act-${i}`} className="hover:bg-white transition-colors">
                                                        <td className="px-5 py-3 text-sm text-gray-600 font-medium whitespace-nowrap">{row.date}</td>
                                                        {selectedChildId === 'all' && <td className="px-5 py-3 text-sm font-bold text-gray-900 whitespace-nowrap">{row.name}</td>}
                                                        <td className="px-5 py-3 text-sm text-gray-700 font-medium">{row.activity}</td>
                                                        <td className="px-5 py-3">
                                                            <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${row.status.toLowerCase() === 'completed' ? 'bg-indigo-50 text-indigo-700 border-indigo-100' : 'bg-yellow-50 text-yellow-700 border-yellow-100'}`}>
                                                                {row.status}
                                                            </span>
                                                        </td>
                                                        <td className="px-5 py-3 text-right">
                                                            <div className="flex gap-0.5 justify-end">
                                                                {[...Array(5)].map((_, idx) => (
                                                                    <span key={idx} className={`text-xs ${idx < row.rating ? 'text-amber-400' : 'text-gray-200'}`}>★</span>
                                                                ))}
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            )}
        </div>
    );
};

export default Reports;
