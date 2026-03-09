import React, { useState, useEffect } from 'react';
import {
    PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend,
    BarChart, Bar, XAxis, YAxis, CartesianGrid
} from 'recharts';
import { BarChart3, PieChart as PieChartIcon, TrendingUp, Users, CheckCircle2, AlertCircle, FileText, Download, Calendar, ArrowRight, Filter, X } from 'lucide-react';

const Reports = () => {
    const [attendanceData, setAttendanceData] = useState([]);
    const [activityData, setActivityData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Filter States
    const [reportType, setReportType] = useState('child');
    const [timeRange, setTimeRange] = useState('daily');
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

    // Result States
    const [reportLoading, setReportLoading] = useState(false);
    const [reportResult, setReportResult] = useState(null);

    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5005';

    useEffect(() => {
        const fetchDashboardSummary = async () => {
            try {
                const token = localStorage.getItem('token');
                const [attendanceRes, activityRes] = await Promise.all([
                    fetch(`${apiUrl}/api/reports/child-attendance`, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    }),
                    fetch(`${apiUrl}/api/reports/staff-activity`, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    })
                ]);

                const attendanceResult = await attendanceRes.json();
                const activityResult = await activityRes.json();

                if (attendanceResult.success) {
                    const { present, absent } = attendanceResult.data;
                    setAttendanceData([
                        { name: 'Present', value: present, color: '#10B981' },
                        { name: 'Absent', value: absent, color: '#F43F5E' }
                    ]);
                }

                if (activityResult.success) {
                    setActivityData(activityResult.data);
                }
            } catch (err) {
                console.error('Error fetching summaries:', err);
                setError('Failed to load dashboard summaries.');
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardSummary();
    }, [apiUrl]);

    const handleGenerateReport = async () => {
        setReportLoading(true);
        setReportResult(null);
        try {
            const token = localStorage.getItem('token');
            const queryParams = new URLSearchParams({
                type: reportType,
                range: timeRange,
                date: selectedDate,
                month: selectedMonth,
                year: selectedYear
            });

            const response = await fetch(`${apiUrl}/api/reports/attendance?${queryParams}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const result = await response.json();
            if (result.success) {
                setReportResult(result.data);
            } else {
                alert(result.message || 'Failed to generate report');
            }
        } catch (err) {
            console.error('Error generating report:', err);
            alert('An error occurred while generating the report.');
        } finally {
            setReportLoading(false);
        }
    };

    const exportToCSV = () => {
        if (!reportResult || !reportResult.records.length) return;

        const headers = ['Name', 'Date', 'Status', 'Marked By', 'Time', 'Remarks'];
        const csvRows = [
            headers.join(','),
            ...reportResult.records.map(row =>
                [row.name, row.date, row.status, row.markedBy, row.time, `"${row.remarks}"`].join(',')
            )
        ].join('\n');

        const blob = new Blob([csvRows], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `attendance_report_${reportType}_${timeRange}.csv`;
        a.click();
    };

    const exportToPDF = () => {
        window.print(); // Simple PDF generation for now
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
                    <p className="text-gray-500 font-medium animate-pulse">Generating analytical reports...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="text-center space-y-4">
                    <div className="w-16 h-16 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center mx-auto">
                        <AlertCircle size={32} />
                    </div>
                    <p className="text-gray-600 font-medium">{error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* Filters Section */}
            <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm space-y-8">
                <div className="flex items-center gap-4 mb-2">
                    <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center">
                        <Filter size={24} />
                    </div>
                    <div>
                        <h3 className="text-xl font-black text-gray-900">Advanced Filters</h3>
                        <p className="text-sm text-gray-400 font-bold uppercase tracking-widest">Generate Custom Reports</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="space-y-2">
                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Report Type</label>
                        <select
                            value={reportType}
                            onChange={(e) => setReportType(e.target.value)}
                            className="w-full px-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold text-gray-700 focus:ring-2 focus:ring-purple-100 outline-none appearance-none cursor-pointer"
                        >
                            <option value="child">Child Attendance</option>
                            <option value="staff">Staff Attendance</option>
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Time Range</label>
                        <select
                            value={timeRange}
                            onChange={(e) => setTimeRange(e.target.value)}
                            className="w-full px-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold text-gray-700 focus:ring-2 focus:ring-purple-100 outline-none appearance-none cursor-pointer"
                        >
                            <option value="daily">Daily</option>
                            <option value="monthly">Monthly</option>
                            <option value="yearly">Yearly</option>
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Select Period</label>
                        {timeRange === 'daily' && (
                            <input
                                type="date"
                                value={selectedDate}
                                onChange={(e) => setSelectedDate(e.target.value)}
                                className="w-full px-4 py-[14px] bg-gray-50 border border-gray-100 rounded-2xl font-bold text-gray-700 outline-none"
                            />
                        )}
                        {timeRange === 'monthly' && (
                            <div className="flex gap-2">
                                <select
                                    value={selectedMonth}
                                    onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                                    className="flex-1 px-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold text-gray-700 outline-none appearance-none"
                                >
                                    {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map((m, i) => (
                                        <option key={m} value={i}>{m}</option>
                                    ))}
                                </select>
                                <input
                                    type="number"
                                    value={selectedYear}
                                    onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                                    className="w-24 px-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold text-gray-700 outline-none"
                                />
                            </div>
                        )}
                        {timeRange === 'yearly' && (
                            <input
                                type="number"
                                value={selectedYear}
                                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                                className="w-full px-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold text-gray-700 outline-none"
                            />
                        )}
                    </div>

                    <div className="flex items-end">
                        <button
                            onClick={handleGenerateReport}
                            disabled={reportLoading}
                            className="w-full py-4 bg-gray-900 text-white font-black rounded-2xl uppercase tracking-widest hover:bg-black transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 shadow-xl shadow-gray-200"
                        >
                            {reportLoading ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            ) : (
                                <FileText size={18} />
                            )}
                            Generate Report
                        </button>
                    </div>
                </div>
            </div>

            {/* Generated Report Results */}
            {reportResult && (
                <div className="space-y-8 animate-in slide-in-from-bottom-8 duration-700">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <h2 className="text-2xl font-black text-gray-900 capitalize">
                                {reportType} Attendance: {timeRange} Report
                            </h2>
                            <div className="px-3 py-1 bg-purple-100 text-purple-700 text-[10px] font-black rounded-full uppercase tracking-tighter">
                                {reportResult.records.length} Records
                            </div>
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
                                PDF
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

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* summary Graph */}
                        <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm space-y-6">
                            <h3 className="text-lg font-black text-gray-900 uppercase tracking-tight">Summary Chart</h3>
                            <div className="h-[200px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={[
                                                { name: 'Present', value: reportResult.summary.present, color: '#10B981' },
                                                { name: 'Absent', value: reportResult.summary.absent, color: '#F43F5E' }
                                            ]}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={50}
                                            outerRadius={80}
                                            paddingAngle={5}
                                            dataKey="value"
                                        >
                                            <Cell fill="#10B981" />
                                            <Cell fill="#F43F5E" />
                                        </Pie>
                                        <Tooltip />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="text-center p-4 bg-emerald-50 rounded-2xl">
                                    <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Present</p>
                                    <p className="text-xl font-black text-emerald-900">{reportResult.summary.present}</p>
                                </div>
                                <div className="text-center p-4 bg-rose-50 rounded-2xl">
                                    <p className="text-[10px] font-black text-rose-600 uppercase tracking-widest">Absent</p>
                                    <p className="text-xl font-black text-rose-900">{reportResult.summary.absent}</p>
                                </div>
                            </div>
                        </div>

                        {/* results Table */}
                        <div className="lg:col-span-2 bg-white rounded-[40px] border border-gray-100 shadow-sm overflow-hidden flex flex-col">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="bg-gray-50/50">
                                        <tr>
                                            <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Name</th>
                                            <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Date</th>
                                            <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                                            <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Marked By</th>
                                            <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Time</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {reportResult.records.map((row, i) => (
                                            <tr key={i} className="hover:bg-purple-50/20 transition-colors">
                                                <td className="px-8 py-4 font-bold text-gray-900">{row.name}</td>
                                                <td className="px-8 py-4 text-sm text-gray-500">{row.date}</td>
                                                <td className="px-8 py-4">
                                                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${row.status.toLowerCase() === 'present' ? 'bg-green-50 text-green-700 border-green-100' : 'bg-red-50 text-red-700 border-red-100'}`}>
                                                        {row.status}
                                                    </span>
                                                </td>
                                                <td className="px-8 py-4 text-sm text-gray-600 font-medium">{row.markedBy}</td>
                                                <td className="px-8 py-4 text-right text-sm text-gray-400 font-bold tabular-nums">{row.time}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            {reportResult.records.length === 0 && (
                                <div className="flex-1 flex items-center justify-center p-12 text-gray-400 font-medium italic">
                                    No records found for the selected period.
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {!reportResult && (
                <div className="pt-8 border-t border-gray-100">
                    <h2 className="text-xl font-black text-gray-900 mb-6 flex items-center gap-3">
                        <TrendingUp className="text-purple-600" />
                        Dashboard Overview
                    </h2>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Child Attendance Chart */}
                        <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm space-y-6">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center">
                                    <PieChartIcon size={24} />
                                </div>
                                <div>
                                    <h3 className="text-xl font-black text-gray-900">Child Attendance</h3>
                                    <p className="text-sm text-gray-400 font-bold uppercase tracking-widest">Total Distribution</p>
                                </div>
                            </div>

                            <div className="h-[300px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={attendanceData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={100}
                                            paddingAngle={5}
                                            dataKey="value"
                                        >
                                            {attendanceData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <Tooltip
                                            contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                        />
                                        <Legend verticalAlign="bottom" height={36} />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>

                            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-50">
                                <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                                    <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-1">Present</p>
                                    <p className="text-2xl font-black text-emerald-900">{attendanceData.find(d => d.name === 'Present')?.value || 0}</p>
                                </div>
                                <div className="p-4 bg-rose-50 rounded-2xl border border-rose-100">
                                    <p className="text-[10px] font-black text-rose-600 uppercase tracking-widest mb-1">Absent</p>
                                    <p className="text-2xl font-black text-rose-900">{attendanceData.find(d => d.name === 'Absent')?.value || 0}</p>
                                </div>
                            </div>
                        </div>

                        {/* Staff Activity Chart */}
                        <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm space-y-6">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center">
                                    <BarChart3 size={24} />
                                </div>
                                <div>
                                    <h3 className="text-xl font-black text-gray-900">Staff Productivity</h3>
                                    <p className="text-sm text-gray-400 font-bold uppercase tracking-widest">Completed Activities</p>
                                </div>
                            </div>

                            <div className="h-[300px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={activityData}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                                        <XAxis
                                            dataKey="name"
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fill: '#9CA3AF', fontSize: 12, fontWeight: 600 }}
                                        />
                                        <YAxis
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fill: '#9CA3AF', fontSize: 12, fontWeight: 600 }}
                                        />
                                        <Tooltip
                                            cursor={{ fill: '#F9FAFB' }}
                                            contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                        />
                                        <Bar dataKey="completedCount" fill="#6366F1" radius={[8, 8, 0, 0]} barSize={40} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>

                            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center text-indigo-600">
                                        <CheckCircle2 size={20} />
                                    </div>
                                    <span className="text-sm font-bold text-gray-600">Total Activities Logged</span>
                                </div>
                                <span className="text-xl font-black text-gray-900">
                                    {activityData.reduce((acc, curr) => acc + curr.completedCount, 0)}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Reports;
