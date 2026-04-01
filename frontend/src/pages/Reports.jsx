import React, { useState, useEffect, useMemo } from 'react';
import { FileText, Download, Filter, X, Search, CalendarDays } from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend } from 'recharts';

const Reports = () => {
    // Dropdown Data
    const [childrenList, setChildrenList] = useState([]);
    
    // Filter States
    const [selectedChildId, setSelectedChildId] = useState('all');
    const [reportType, setReportType] = useState('attendance');
    const [timeRange, setTimeRange] = useState('daily');
    const [reportDate, setReportDate] = useState(getInitialDate('daily'));
    const [searchQuery, setSearchQuery] = useState('');
    const [showDropdown, setShowDropdown] = useState(false);

    // Result States
    const [loading, setLoading] = useState(false);
    const [reportResult, setReportResult] = useState(null);
    const [error, setError] = useState(null);

    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5005';

    function getInitialDate(range) {
        const d = new Date();
        if (range === 'daily') {
            return d.toISOString().split('T')[0];
        } else if (range === 'weekly') {
            // week string YYYY-Www
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

    useEffect(() => {
        const fetchChildren = async () => {
            try {
                const token = localStorage.getItem('token');
                // Use the children endpoint
                const res = await fetch(`${apiUrl}/api/children`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const data = await res.json();
                if (data.success || Array.isArray(data)) {
                    // API might return array directly or embedded in success response
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
                type: reportType,
                range: timeRange,
                date: reportDate
            });

            const response = await fetch(`${apiUrl}/api/reports/generate?${queryParams}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const result = await response.json();
            if (result.success) {
                setReportResult(result.data.records);
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

    const exportToCSV = () => {
        if (!reportResult || !reportResult.length) return;

        let headers = [];
        let csvRows = [];
        
        if (reportType === 'attendance') {
            headers = ['Name', 'Date', 'Status', 'Marked By'];
            csvRows = reportResult.map(row => 
                [row.name, row.date, row.status, row.markedBy].join(',')
            );
        } else {
            headers = ['Name', 'Date', 'Activity', 'Status', 'Rating'];
            csvRows = reportResult.map(row => 
                [row.name, row.date, row.activity, row.status, row.rating].join(',')
            );
        }

        const csvString = [headers.join(','), ...csvRows].join('\n');
        const blob = new Blob([csvString], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `report_${reportType}_${timeRange}.csv`;
        a.click();
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

    const getChartData = () => {
        if (!reportResult || !reportResult.length) return [];
        
        if (reportType === 'attendance') {
            const counts = reportResult.reduce((acc, curr) => {
                const status = (curr.status || '').toLowerCase();
                if (status === 'present') acc.present++;
                else if (status === 'absent') acc.absent++;
                return acc;
            }, { present: 0, absent: 0 });

            return [
                { name: 'Present', value: counts.present, color: '#10B981' },
                { name: 'Absent', value: counts.absent, color: '#F43F5E' }
            ];
        } else {
            // Activity report - group by activity and count completion status or average rating
            const activityStats = reportResult.reduce((acc, curr) => {
                if (!acc[curr.activity]) {
                    acc[curr.activity] = { name: curr.activity, completedCount: 0, total: 0 };
                }
                if (curr.status.toLowerCase() === 'completed') {
                    acc[curr.activity].completedCount++;
                }
                acc[curr.activity].total++;
                return acc;
            }, {});
            
            return Object.values(activityStats);
        }
    };

    const chartData = useMemo(() => getChartData(), [reportResult, reportType]);

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* Filter Section */}
            <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm space-y-8">
                <div className="flex items-center gap-4 mb-2">
                    <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center">
                        <Filter size={24} />
                    </div>
                    <div>
                        <h3 className="text-xl font-black text-gray-900">Dynamic Reports</h3>
                        <p className="text-sm text-gray-400 font-bold uppercase tracking-widest">Generate Custom Analytics</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative">
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

                    {/* Report Type */}
                    <div className="space-y-2">
                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Report Type</label>
                        <select
                            value={reportType}
                            onChange={(e) => setReportType(e.target.value)}
                            className="w-full px-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold text-gray-700 focus:ring-2 focus:ring-purple-100 outline-none appearance-none cursor-pointer"
                        >
                            <option value="attendance">Attendance Report</option>
                            <option value="activity">Activity Report</option>
                        </select>
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
                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Select Date</label>
                        <input
                            type={timeRange === 'daily' ? 'date' : timeRange === 'weekly' ? 'week' : 'month'}
                            value={reportDate}
                            onChange={(e) => setReportDate(e.target.value)}
                            className="w-full px-4 py-[14px] bg-gray-50 border border-gray-100 rounded-2xl font-bold text-gray-700 outline-none"
                        />
                    </div>
                </div>

                <div className="flex justify-end pt-4">
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
                        Generate Report
                    </button>
                </div>
            </div>

            {/* Generated Report View */}
            {reportResult && (
                <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm space-y-8 animate-in slide-in-from-bottom-8 duration-700">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="space-y-1">
                            <h2 className="text-2xl font-black text-gray-900 capitalize flex items-center gap-3">
                                {getSelectedChildName()} 
                                <span className="px-3 py-1 bg-purple-100 text-purple-700 text-[10px] font-black rounded-full uppercase tracking-tighter">
                                    {reportType}
                                </span>
                            </h2>
                            <p className="text-sm text-gray-500 font-bold flex items-center gap-2">
                                <CalendarDays size={16} />
                                {timeRange} Report ({reportDate})
                            </p>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={exportToCSV}
                                className="px-6 py-3 bg-white border border-gray-200 text-gray-600 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-2 hover:bg-gray-50 transition-all active:scale-95"
                            >
                                <Download size={14} />
                                CSV
                            </button>
                            <button
                                onClick={exportToPDF}
                                className="px-6 py-3 bg-gray-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-2 hover:bg-black transition-all active:scale-95 shadow-lg shadow-gray-200"
                            >
                                <FileText size={14} />
                                Print PDF
                            </button>
                            <button
                                onClick={() => setReportResult(null)}
                                className="p-3 bg-white border border-gray-200 text-gray-400 rounded-2xl hover:text-red-500 hover:border-red-100 transition-all active:scale-95"
                                title="Clear Report"
                            >
                                <X size={20} />
                            </button>
                        </div>
                    </div>

                    {reportResult.length === 0 ? (
                        <div className="py-20 flex flex-col items-center justify-center text-gray-400 font-medium space-y-4">
                            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center">
                                <FileText size={24} className="text-gray-300" />
                            </div>
                            <p>No data found for the selected criteria.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            {/* Visual Summary */}
                            <div className="lg:col-span-1 bg-gray-50/50 p-6 rounded-3xl border border-gray-100 flex flex-col justify-center items-center">
                                <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest mb-6 self-start w-full border-b border-gray-200 pb-2">
                                    {reportType} Summary
                                </h3>
                                
                                {reportType === 'attendance' ? (
                                    <div className="w-full">
                                        <div className="h-[200px] w-full">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <PieChart>
                                                    <Pie
                                                        data={chartData}
                                                        cx="50%"
                                                        cy="50%"
                                                        innerRadius={50}
                                                        outerRadius={80}
                                                        paddingAngle={5}
                                                        dataKey="value"
                                                    >
                                                        {chartData.map((entry, index) => (
                                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                                        ))}
                                                    </Pie>
                                                    <RechartsTooltip 
                                                        contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                                    />
                                                    <Legend />
                                                </PieChart>
                                            </ResponsiveContainer>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4 mt-6">
                                            <div className="p-4 bg-white rounded-2xl border border-emerald-100 shadow-sm text-center">
                                                <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-1">Present</p>
                                                <p className="text-2xl font-black text-emerald-900">{chartData[0]?.value || 0}</p>
                                            </div>
                                            <div className="p-4 bg-white rounded-2xl border border-rose-100 shadow-sm text-center">
                                                <p className="text-[10px] font-black text-rose-600 uppercase tracking-widest mb-1">Absent</p>
                                                <p className="text-2xl font-black text-rose-900">{chartData[1]?.value || 0}</p>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="w-full">
                                         <div className="h-[250px] w-full">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <BarChart data={chartData} layout="vertical" margin={{ top: 0, right: 0, left: 10, bottom: 0 }}>
                                                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E5E7EB" />
                                                    <XAxis type="number" hide />
                                                    <YAxis 
                                                        type="category" 
                                                        dataKey="name" 
                                                        axisLine={false} 
                                                        tickLine={false}
                                                        tick={{ fill: '#6B7280', fontSize: 10, fontWeight: 700 }}
                                                        width={90}
                                                    />
                                                    <RechartsTooltip 
                                                        cursor={{ fill: '#F3F4F6' }}
                                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                                    />
                                                    <Bar dataKey="completedCount" name="Completed" fill="#8B5CF6" radius={[0, 4, 4, 0]} barSize={20} />
                                                </BarChart>
                                            </ResponsiveContainer>
                                        </div>
                                        <div className="mt-4 p-4 bg-white rounded-2xl border border-purple-100 text-center shadow-sm">
                                            <p className="text-[10px] font-black text-purple-600 uppercase tracking-widest mb-1">Total Activities</p>
                                            <p className="text-2xl font-black text-purple-900">
                                                {chartData.reduce((acc, curr) => acc + curr.total, 0)}
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Tabular Data */}
                            <div className="lg:col-span-2 border border-gray-100 rounded-3xl overflow-hidden self-start">
                                <div className="overflow-x-auto max-h-[400px]">
                                    <table className="w-full text-left relative">
                                        <thead className="bg-gray-50/90 backdrop-blur sticky top-0 z-10">
                                            <tr>
                                                <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Date</th>
                                                {selectedChildId === 'all' && (
                                                    <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Child Name</th>
                                                )}
                                                {reportType === 'attendance' ? (
                                                    <>
                                                        <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                                                        <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Marked By</th>
                                                    </>
                                                ) : (
                                                    <>
                                                        <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Activity</th>
                                                        <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                                                        <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Rating</th>
                                                    </>
                                                )}
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-50">
                                        {reportResult.map((row, i) => (
                                            <tr key={i} className="hover:bg-purple-50/20 transition-colors">
                                                <td className="px-6 py-4 text-sm text-gray-500 font-medium">{row.date}</td>
                                                {selectedChildId === 'all' && (
                                                    <td className="px-6 py-4 font-bold text-gray-900">{row.name}</td>
                                                )}
                                                
                                                {reportType === 'attendance' ? (
                                                    <>
                                                        <td className="px-6 py-4">
                                                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${row.status.toLowerCase() === 'present' ? 'bg-green-50 text-green-700 border-green-100' : 'bg-red-50 text-red-700 border-red-100'}`}>
                                                                {row.status}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4 text-sm text-gray-600 font-medium">{row.markedBy}</td>
                                                    </>
                                                ) : (
                                                    <>
                                                        <td className="px-6 py-4 font-medium text-gray-700">{row.activity}</td>
                                                        <td className="px-6 py-4">
                                                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${row.status.toLowerCase() === 'completed' ? 'bg-green-50 text-green-700 border-green-100' : 'bg-yellow-50 text-yellow-700 border-yellow-100'}`}>
                                                                {row.status}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <div className="flex gap-1">
                                                                {[...Array(5)].map((_, idx) => (
                                                                    <span key={idx} className={`text-sm ${idx < row.rating ? 'text-amber-400' : 'text-gray-200'}`}>★</span>
                                                                ))}
                                                            </div>
                                                        </td>
                                                    </>
                                                )}
                                            </tr>
                                        ))}
                                    </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}
            
            {error && (
                <div className="p-4 bg-red-50 text-red-600 border border-red-100 rounded-2xl flex items-center justify-center font-bold mt-4">
                    {error}
                </div>
            )}
        </div>
    );
};

export default Reports;
