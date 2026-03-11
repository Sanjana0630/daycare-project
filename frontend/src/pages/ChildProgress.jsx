import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ChevronLeft,
    Download,
    Calendar,
    BarChart2,
    PieChart as PieChartIcon,
    TrendingUp,
    FileText,
    Star,
    CheckCircle2,
    XCircle,
    Layout,
    Table as TableIcon
} from 'lucide-react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    LineChart,
    Line,
    Legend
} from 'recharts';
import { BASE_URL } from '../config';
import toast from 'react-hot-toast';

const ChildProgress = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    // UI States
    const [reportType, setReportType] = useState('monthly'); // 'daily' | 'monthly' | 'yearly'
    const [viewFormat, setViewFormat] = useState('tabular'); // 'tabular' | 'graph'

    // Data States
    const [child, setChild] = useState(null);
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);

    // Filter States
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

    // Color Palette
    const CHART_COLORS = {
        rating: '#3b82f6',    // Blue for Ratings
        completed: '#10b981', // Green for Completed
        absent: '#ef4444',    // Red for Not Completed
        background: '#f9fafb'
    };

    useEffect(() => {
        fetchChildDetails();
    }, [id]);

    useEffect(() => {
        fetchStats();
    }, [id, reportType, selectedDate, selectedMonth, selectedYear]);

    const fetchChildDetails = async () => {
        try {
            const response = await fetch(`${BASE_URL}/api/children/${id}`);
            const result = await response.json();
            if (result.success) setChild(result.data);
        } catch (err) {
            toast.error("Failed to load child details");
        }
    };

    const fetchStats = async () => {
        setLoading(true);
        try {
            let url = '';
            if (reportType === 'daily') {
                url = `${BASE_URL}/api/admin/child-activity/${id}?date=${selectedDate}`;
            } else if (reportType === 'monthly') {
                url = `${BASE_URL}/api/admin/child-activity/monthly/${id}?month=${selectedMonth}&year=${selectedYear}`;
            } else {
                url = `${BASE_URL}/api/admin/child-activity/yearly/${id}?year=${selectedYear}`;
            }

            const response = await fetch(url, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            const result = await response.json();

            console.log("Activity Report Data:", result.data);

            if (result.success) {
                if (reportType === 'daily') {
                    setData(result.data ? [result.data] : []);
                } else {
                    setData(result.data || []);
                }
            }
        } catch (err) {
            console.error("Fetch error:", err);
            toast.error("Failed to load statistics");
        } finally {
            setLoading(false);
        }
    };

    // Advanced Data Aggregation for different report types
    const stats = useMemo(() => {
        if (!data.length) return null;

        let totalCompleted = 0;
        let totalActivities = 0;
        let mainChartData = [];

        if (reportType === 'daily') {
            // Daily View: Bar Chart of individual activities
            const log = data[0];
            if (log && log.activities) {
                mainChartData = log.activities.map(act => {
                    if (act.completed) totalCompleted++;
                    totalActivities++;
                    return {
                        name: act.activityName,
                        rating: act.rating
                    };
                });
            }
        } else if (reportType === 'monthly') {
            // Monthly View: Line Chart of avg daily rating
            // Sort data by date first
            const sortedLogs = [...data].sort((a, b) => new Date(a.date) - new Date(b.date));

            mainChartData = sortedLogs.map(log => {
                let daySum = 0;
                log.activities.forEach(act => {
                    daySum += act.rating;
                    if (act.completed) totalCompleted++;
                    totalActivities++;
                });
                return {
                    name: new Date(log.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }),
                    rating: log.activities.length > 0 ? Number((daySum / log.activities.length).toFixed(1)) : 0
                };
            });
        } else if (reportType === 'yearly') {
            // Yearly View: Bar Chart of monthly averages
            const monthlyStats = Array.from({ length: 12 }, (_, i) => ({ month: i, sum: 0, count: 0, totalAct: 0, compAct: 0 }));

            data.forEach(log => {
                const month = new Date(log.date).getMonth();
                log.activities.forEach(act => {
                    monthlyStats[month].sum += act.rating;
                    monthlyStats[month].count++;
                    if (act.completed) {
                        monthlyStats[month].compAct++;
                        totalCompleted++;
                    }
                    totalActivities++;
                    monthlyStats[month].totalAct++;
                });
            });

            mainChartData = monthlyStats.map((item, idx) => ({
                name: new Date(0, idx).toLocaleString('default', { month: 'short' }),
                rating: item.count > 0 ? Number((item.sum / item.count).toFixed(1)) : 0
            }));
        }

        console.log("Transformed Chart Data:", mainChartData);

        const pieData = [
            { name: 'Completed', value: totalCompleted },
            { name: 'Not Completed', value: totalActivities - totalCompleted }
        ];

        return {
            mainChartData,
            pieData,
            completionRate: totalActivities > 0 ? ((totalCompleted / totalActivities) * 100).toFixed(0) : 0
        };
    }, [data, reportType]);

    const downloadCSV = () => {
        if (!data.length) return toast.error("No data to export");

        let csvContent = "Date,Activity,Completed,Rating,Notes,Staff\n";
        data.forEach(log => {
            const dateStr = new Date(log.date).toLocaleDateString();
            log.activities.forEach(act => {
                csvContent += `${dateStr},"${act.activityName}",${act.completed ? 'Yes' : 'No'},${act.rating},"${act.notes || ''}","${log.recordedBy?.name || 'Unknown'}"\n`;
            });
        });

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", `${child?.childName}_Progress_${reportType}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success("CSV Exported successfully");
    };

    if (loading && !child) return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
                <p className="text-gray-500 font-medium animate-pulse">Analyzing activity trends...</p>
            </div>
        </div>
    );

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20 print:p-0">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 print:hidden">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate(-1)}
                        className="p-3 bg-white border border-gray-100 rounded-2xl shadow-sm text-gray-400 hover:text-purple-600 transition-all active:scale-95"
                    >
                        <ChevronLeft size={24} />
                    </button>
                    <div>
                        <h1 className="text-3xl font-black text-gray-900 mb-1">Child Progress Statistics</h1>
                        <p className="text-gray-500 font-medium">Performance analytics for <span className="text-purple-600 font-bold">{child?.childName}</span></p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={downloadCSV}
                        className="px-6 py-3 bg-white border border-gray-200 text-gray-700 font-bold rounded-2xl shadow-sm hover:bg-gray-50 transition-all flex items-center gap-2"
                    >
                        <Download size={18} />
                        CSV
                    </button>
                    <button
                        onClick={() => window.print()}
                        className="px-6 py-3 bg-purple-600 text-white font-bold rounded-2xl shadow-lg shadow-purple-200 hover:bg-purple-700 transition-all flex items-center gap-2"
                    >
                        <FileText size={18} />
                        Download PDF
                    </button>
                </div>
            </div>

            {/* Filter Section */}
            <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm space-y-8 print:hidden">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Report Type */}
                    <div className="space-y-3">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Report Type</label>
                        <div className="flex p-1 bg-gray-50 rounded-2xl border border-gray-100 mt-1">
                            {['daily', 'monthly', 'yearly'].map((type) => (
                                <button
                                    key={type}
                                    onClick={() => setReportType(type)}
                                    className={`flex-1 py-3 text-xs font-black uppercase tracking-widest rounded-xl transition-all ${reportType === type
                                        ? 'bg-white text-purple-600 shadow-sm border border-purple-100 scale-[1.02]'
                                        : 'text-gray-400 hover:text-gray-600'
                                        }`}
                                >
                                    {type}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Time Filters */}
                    <div className="space-y-3">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Select Period</label>
                        <div className="mt-1">
                            {reportType === 'daily' && (
                                <input
                                    type="date"
                                    value={selectedDate}
                                    onChange={(e) => setSelectedDate(e.target.value)}
                                    className="w-full p-4 bg-gray-50 border border-transparent rounded-2xl text-sm font-bold focus:bg-white focus:ring-4 focus:ring-purple-50 transition-all outline-none"
                                />
                            )}
                            {reportType === 'monthly' && (
                                <div className="grid grid-cols-2 gap-2">
                                    <select
                                        value={selectedMonth}
                                        onChange={(e) => setSelectedMonth(Number(e.target.value))}
                                        className="p-4 bg-gray-50 border border-transparent rounded-2xl text-sm font-bold focus:bg-white focus:ring-4 focus:ring-purple-50 outline-none"
                                    >
                                        {Array.from({ length: 12 }, (_, i) => (
                                            <option key={i + 1} value={i + 1}>{new Date(0, i).toLocaleString('default', { month: 'long' })}</option>
                                        ))}
                                    </select>
                                    <input
                                        type="number"
                                        value={selectedYear}
                                        onChange={(e) => setSelectedYear(Number(e.target.value))}
                                        className="p-4 bg-gray-50 border border-transparent rounded-2xl text-sm font-bold focus:bg-white focus:ring-4 focus:ring-purple-50 outline-none"
                                    />
                                </div>
                            )}
                            {reportType === 'yearly' && (
                                <input
                                    type="number"
                                    value={selectedYear}
                                    onChange={(e) => setSelectedYear(Number(e.target.value))}
                                    className="w-full p-4 bg-gray-50 border border-transparent rounded-2xl text-sm font-bold focus:bg-white focus:ring-4 focus:ring-purple-50 outline-none"
                                />
                            )}
                        </div>
                    </div>

                    {/* View Format */}
                    <div className="space-y-3">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">View Format</label>
                        <div className="flex p-1 bg-gray-50 rounded-2xl border border-gray-100 mt-1">
                            {[
                                { id: 'tabular', icon: TableIcon, label: 'Tabular' },
                                { id: 'graph', icon: BarChart2, label: 'Graph' }
                            ].map((format) => (
                                <button
                                    key={format.id}
                                    onClick={() => setViewFormat(format.id)}
                                    className={`flex-1 py-3 flex items-center justify-center gap-2 text-xs font-black uppercase tracking-widest rounded-xl transition-all ${viewFormat === format.id
                                        ? 'bg-white text-indigo-600 shadow-sm border border-indigo-100 scale-[1.02]'
                                        : 'text-gray-400 hover:text-gray-600'
                                        }`}
                                >
                                    <format.icon size={16} />
                                    {format.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="flex justify-center pt-2">
                    <button
                        onClick={fetchStats}
                        disabled={loading}
                        className="px-12 py-4 bg-gray-900 text-white rounded-2xl font-black text-sm hover:bg-black transition-all flex items-center gap-3 active:scale-95 shadow-xl shadow-gray-200"
                    >
                        {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : <TrendingUp size={20} />}
                        GENERATE INSIGHTS
                    </button>
                </div>
            </div>

            {/* Content Section */}
            {data.length > 0 ? (
                <>
                    {viewFormat === 'graph' ? (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            {/* Main Performance Chart (Bar or Line depending on timeframe) */}
                            <div className="lg:col-span-2 bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm space-y-6">
                                <h4 className="text-xl font-black text-gray-900 flex items-center gap-2 capitalize">
                                    <BarChart2 className="text-blue-600" size={24} />
                                    {reportType} Activity Progress
                                </h4>
                                <div className="h-[400px] w-full mt-4">
                                    <ResponsiveContainer width="100%" height="100%">
                                        {reportType === 'monthly' ? (
                                            <LineChart data={stats?.mainChartData}>
                                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                                                <XAxis
                                                    dataKey="name"
                                                    axisLine={false}
                                                    tickLine={false}
                                                    tick={{ fontSize: 10, fontWeight: 700, fill: '#9ca3af' }}
                                                    label={{ value: 'Date', position: 'insideBottom', offset: -10, fontSize: 12, fontWeight: 800 }}
                                                />
                                                <YAxis
                                                    domain={[0, 5]}
                                                    axisLine={false}
                                                    tickLine={false}
                                                    tick={{ fontSize: 10, fontWeight: 700, fill: '#9ca3af' }}
                                                    label={{ value: 'Avg Rating', angle: -90, position: 'insideLeft', fontSize: 12, fontWeight: 800 }}
                                                />
                                                <Tooltip
                                                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontWeight: 'bold' }}
                                                />
                                                <Legend verticalAlign="top" height={36} />
                                                <Line
                                                    name="Average Rating"
                                                    type="monotone"
                                                    dataKey="rating"
                                                    stroke={CHART_COLORS.rating}
                                                    strokeWidth={4}
                                                    dot={{ fill: CHART_COLORS.rating, strokeWidth: 2, r: 6, stroke: '#fff' }}
                                                    activeDot={{ r: 8 }}
                                                />
                                            </LineChart>
                                        ) : (
                                            <BarChart data={stats?.mainChartData}>
                                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                                                <XAxis
                                                    dataKey="name"
                                                    axisLine={false}
                                                    tickLine={false}
                                                    tick={{ fontSize: 9, fontWeight: 700, fill: '#9ca3af' }}
                                                    interval={0}
                                                    angle={reportType === 'daily' ? -15 : 0}
                                                    textAnchor={reportType === 'daily' ? "end" : "middle"}
                                                    label={{ value: reportType === 'daily' ? 'Activity' : 'Month', position: 'insideBottom', offset: -10, fontSize: 12, fontWeight: 800 }}
                                                />
                                                <YAxis
                                                    domain={[0, 5]}
                                                    axisLine={false}
                                                    tickLine={false}
                                                    tick={{ fontSize: 10, fontWeight: 700, fill: '#9ca3af' }}
                                                    label={{ value: 'Rating', angle: -90, position: 'insideLeft', fontSize: 12, fontWeight: 800 }}
                                                />
                                                <Tooltip
                                                    cursor={{ fill: '#f9fafb' }}
                                                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontWeight: 'bold' }}
                                                />
                                                <Legend verticalAlign="top" height={36} />
                                                <Bar
                                                    name="Rating"
                                                    dataKey="rating"
                                                    fill={CHART_COLORS.rating}
                                                    radius={[6, 6, 0, 0]}
                                                    barSize={reportType === 'daily' ? 32 : 40}
                                                />
                                            </BarChart>
                                        )}
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            {/* Side Completion Pie Chart */}
                            <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm space-y-6 flex flex-col justify-center">
                                <div className="text-center">
                                    <h4 className="text-xl font-black text-gray-900 flex items-center justify-center gap-2">
                                        <PieChartIcon className="text-emerald-500" size={24} />
                                        Activity Completion
                                    </h4>
                                    <div className="mt-4">
                                        <span className="text-5xl font-black text-emerald-600 block">{stats?.completionRate}%</span>
                                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Global Success Rate</span>
                                    </div>
                                </div>
                                <div className="h-[250px] w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={stats?.pieData}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={60}
                                                outerRadius={90}
                                                paddingAngle={8}
                                                dataKey="value"
                                            >
                                                <Cell key="completed" fill={CHART_COLORS.completed} stroke="none" />
                                                <Cell key="absent" fill={CHART_COLORS.absent} stroke="none" />
                                            </Pie>
                                            <Tooltip />
                                            <Legend verticalAlign="bottom" iconType="circle" />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                                <div className="space-y-3 pt-4 border-t border-gray-50">
                                    <div className="flex justify-between items-center text-xs font-bold text-gray-500">
                                        <span>Completed</span>
                                        <span className="text-emerald-600">{stats?.pieData[0].value}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-xs font-bold text-gray-500">
                                        <span>Not Completed</span>
                                        <span className="text-red-500">{stats?.pieData[1].value}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        /* Tabular View */
                        <div className="bg-white rounded-[40px] border border-gray-100 shadow-sm overflow-hidden">
                            <div className="px-10 py-8 border-b border-gray-50 flex items-center justify-between">
                                <div>
                                    <h4 className="text-xl font-black text-gray-900">Activity Data Feed</h4>
                                    <p className="text-sm font-medium text-gray-400">Showing {data.length} logs for the selected {reportType} period</p>
                                </div>
                                <div className="flex items-center gap-2 text-indigo-600 bg-indigo-50 px-4 py-2 rounded-2xl border border-indigo-100">
                                    <Layout size={16} />
                                    <span className="text-xs font-black uppercase tracking-widest">Tabular View</span>
                                </div>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-gray-50/50">
                                            <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Date</th>
                                            <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Activity</th>
                                            <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Completed</th>
                                            <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Rating</th>
                                            <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Notes</th>
                                            <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Staff</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {data.flatMap(log =>
                                            log.activities.map((act, idx) => (
                                                <tr key={`${log._id}-${idx}`} className="hover:bg-gray-50/50 transition-colors">
                                                    <td className="px-8 py-6">
                                                        <div className="font-black text-gray-900 text-xs">{new Date(log.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}</div>
                                                    </td>
                                                    <td className="px-6 py-6 font-bold text-gray-700">{act.activityName}</td>
                                                    <td className="px-6 py-6 text-center">
                                                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black border shadow-sm ${act.completed
                                                            ? 'bg-green-50 text-green-600 border-green-100'
                                                            : 'bg-red-50 text-red-600 border-red-100'
                                                            }`}>
                                                            {act.completed ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
                                                            {act.completed ? 'YES' : 'NO'}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-6">
                                                        <div className="flex items-center gap-0.5">
                                                            {[1, 2, 3, 4, 5].map(s => (
                                                                <Star
                                                                    key={s}
                                                                    size={14}
                                                                    className={s <= act.rating ? "fill-amber-400 text-amber-400" : "text-gray-200"}
                                                                />
                                                            ))}
                                                        </div>
                                                    </td>
                                                    <td className="px-8 py-6 max-w-xs">
                                                        <p className="text-xs font-medium text-gray-500 truncate italic">
                                                            {act.notes || "No observations recorded."}
                                                        </p>
                                                    </td>
                                                    <td className="px-8 py-6">
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-6 h-6 bg-indigo-100 text-indigo-600 rounded-lg flex items-center justify-center text-[10px] font-bold">
                                                                {log.recordedBy?.name?.[0].toUpperCase() || 'S'}
                                                            </div>
                                                            <span className="text-xs font-bold text-gray-600">{log.recordedBy?.name || 'Staff'}</span>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </>
            ) : (
                <div className="bg-white p-24 rounded-[40px] border border-gray-100 shadow-sm flex flex-col items-center justify-center text-center animate-in zoom-in-95 duration-500">
                    <div className="w-24 h-24 bg-purple-50 text-purple-200 rounded-full flex items-center justify-center mb-6">
                        <Calendar size={48} />
                    </div>
                    <h3 className="text-2xl font-black text-gray-900 mb-2">No data recorded</h3>
                    <p className="text-gray-400 font-medium max-w-xs">There are no activity logs found for the selected {reportType} period. Try selecting a different timeframe.</p>
                </div>
            )}
        </div>
    );
};

export default ChildProgress;
