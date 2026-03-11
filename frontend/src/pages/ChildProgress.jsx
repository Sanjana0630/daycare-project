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
    Table as TableIcon,
    User,
    Phone,
    Trophy,
    Activity,
    Target,
    Zap,
    MapPin,
    Search,
    ArrowUpRight
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
    AreaChart,
    Area,
    Legend
} from 'recharts';
import { BASE_URL } from '../config';
import toast from 'react-hot-toast';

const ChildProgress = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    // UI States
    const [reportType, setReportType] = useState('monthly'); // 'daily' | 'monthly' | 'yearly'
    const [viewFormat, setViewFormat] = useState('graph'); // 'tabular' | 'graph'

    // Data States
    const [child, setChild] = useState(null);
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [hasGenerated, setHasGenerated] = useState(false);

    // Filter States
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

    // Premium Color Palette
    const COLORS = {
        primary: '#6366f1',    // Indigo
        secondary: '#ec4899',  // Pink
        success: '#10b981',    // Emerald
        warning: '#f59e0b',    // Amber
        danger: '#ef4444',     // Red
        info: '#3b82f6',       // Blue
        gradientStart: '#818cf8',
        gradientEnd: '#c084fc',
        bg: '#f8fafc',
        card: '#ffffff'
    };

    useEffect(() => {
        fetchChildDetails();
    }, [id]);

    const fetchChildDetails = async () => {
        try {
            const response = await fetch(`${BASE_URL}/api/children/${id}`);
            const result = await response.json();
            if (result.success) setChild(result.data);
        } catch (err) {
            toast.error("Failed to load child details");
        } finally {
            setLoading(false);
        }
    };

    const fetchStats = async () => {
        setLoading(true);
        setHasGenerated(true);
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

    // Advanced Data Aggregation
    const stats = useMemo(() => {
        if (!data.length) return null;

        let totalCompleted = 0;
        let totalActivities = 0;
        let totalRating = 0;
        let mainChartData = [];

        if (reportType === 'daily') {
            const log = data[0];
            if (log && log.activities) {
                mainChartData = log.activities.map(act => {
                    if (act.completed) totalCompleted++;
                    totalActivities++;
                    totalRating += act.rating;
                    return {
                        name: act.activityName,
                        rating: act.rating,
                        status: act.completed ? 'Completed' : 'Pending'
                    };
                });
            }
        } else if (reportType === 'monthly') {
            const sortedLogs = [...data].sort((a, b) => new Date(a.date) - new Date(b.date));
            mainChartData = sortedLogs.map(log => {
                let daySum = 0;
                log.activities.forEach(act => {
                    daySum += act.rating;
                    if (act.completed) totalCompleted++;
                    totalActivities++;
                    totalRating += act.rating;
                });
                return {
                    name: new Date(log.date).getDate(),
                    fullDate: new Date(log.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }),
                    rating: log.activities.length > 0 ? Number((daySum / log.activities.length).toFixed(1)) : 0
                };
            });
        } else if (reportType === 'yearly') {
            const monthlyStats = Array.from({ length: 12 }, (_, i) => ({ month: i, sum: 0, count: 0 }));
            data.forEach(log => {
                const month = new Date(log.date).getMonth();
                log.activities.forEach(act => {
                    monthlyStats[month].sum += act.rating;
                    monthlyStats[month].count++;
                    if (act.completed) totalCompleted++;
                    totalActivities++;
                    totalRating += act.rating;
                });
            });

            mainChartData = monthlyStats.map((item, idx) => ({
                name: new Date(0, idx).toLocaleString('default', { month: 'short' }),
                rating: item.count > 0 ? Number((item.sum / item.count).toFixed(1)) : 0
            }));
        }

        const avgRating = totalActivities > 0 ? (totalRating / totalActivities).toFixed(1) : 0;
        const completionRate = totalActivities > 0 ? ((totalCompleted / totalActivities) * 100).toFixed(0) : 0;

        return {
            mainChartData,
            totalActivities,
            totalCompleted,
            avgRating,
            completionRate
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
        link.href = URL.createObjectURL(blob);
        link.setAttribute("download", `${child?.childName}_${reportType}_Report.csv`);
        link.click();
        toast.success("CSV Exported");
    };

    if (loading && !child) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="flex flex-col items-center gap-4">
                    <div className="relative">
                        <div className="w-16 h-16 border-4 border-indigo-100 rounded-full animate-ping absolute"></div>
                        <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                    <p className="text-indigo-600 font-bold tracking-tight">Syncing Performance Data...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50/50 pb-20 px-4 md:px-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
            {/* Transparent Glass Sticky Header */}
            <div className="sticky top-0 z-50 py-4 bg-slate-50/80 backdrop-blur-xl border-b border-slate-200/50 -mx-4 md:-mx-8 px-4 md:px-8 mb-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-5">
                        <button
                            onClick={() => navigate(-1)}
                            className="p-3 bg-white border border-slate-200 rounded-2xl shadow-sm text-slate-500 hover:bg-slate-50 hover:text-indigo-600 transition-all active:scale-95 group"
                        >
                            <ChevronLeft size={22} className="group-hover:-translate-x-0.5 transition-transform" />
                        </button>
                        <div>
                            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Child Progress Stats</h1>
                            <div className="flex items-center gap-2 mt-0.5">
                                <span className="flex w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                                <p className="text-slate-500 text-sm font-semibold tracking-wide uppercase">Real-time Analytics</p>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={downloadCSV}
                            className="flex items-center gap-2.5 px-6 py-3 bg-white border border-slate-200 text-slate-700 font-bold rounded-2xl shadow-sm hover:border-indigo-200 hover:bg-indigo-50/30 transition-all active:scale-95"
                        >
                            <Download size={18} className="text-indigo-500" />
                            <span className="hidden sm:inline text-sm">Export CSV</span>
                        </button>
                        <button
                            onClick={() => window.print()}
                            className="flex items-center gap-2.5 px-6 py-3 bg-indigo-600 text-white font-bold rounded-2xl shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all active:scale-95"
                        >
                            <FileText size={18} />
                            <span className="hidden sm:inline text-sm">Print Report</span>
                        </button>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Side Section: Filters & Info */}
                <div className="lg:col-span-4 space-y-8">
                    {/* Child Profile Card */}
                    <div className="bg-white p-6 rounded-[32px] border border-slate-200 shadow-sm relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110 duration-500"></div>
                        <div className="relative z-10">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center text-white text-2xl font-black shadow-lg shadow-indigo-100">
                                    {child?.childName?.[0]}
                                </div>
                                <div>
                                    <h2 className="text-xl font-black text-slate-900 leading-tight">{child?.childName}</h2>
                                    <p className="text-indigo-600 text-sm font-bold uppercase tracking-widest">{child?.gender || 'N/A'}</p>
                                </div>
                            </div>
                            <div className="space-y-4 pt-4 border-t border-slate-50">
                                <div className="flex items-center gap-3 text-slate-600 font-medium">
                                    <div className="p-2 bg-slate-50 rounded-xl"><User size={16} /></div>
                                    <span className="text-sm">Parent: {child?.parentName}</span>
                                </div>
                                <div className="flex items-center gap-3 text-slate-600 font-medium">
                                    <div className="p-2 bg-slate-50 rounded-xl"><Phone size={16} /></div>
                                    <span className="text-sm">{child?.parentPhone}</span>
                                </div>
                                <div className="flex items-center gap-3 text-slate-600 font-medium">
                                    <div className="p-2 bg-slate-50 rounded-xl"><MapPin size={16} /></div>
                                    <span className="text-sm">Age: {child?.age} Years</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Filter Card */}
                    <div className="bg-white p-6 rounded-[32px] border border-slate-200 shadow-sm space-y-6">
                        <h3 className="text-sm font-black text-slate-400 uppercase tracking-[2px] mb-2 px-1">Report Configuration</h3>

                        <div className="space-y-4">
                            <label className="block text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Time Range</label>
                            <div className="flex p-1.5 bg-slate-50 rounded-2xl border border-slate-200/60">
                                {['daily', 'monthly', 'yearly'].map((type) => (
                                    <button
                                        key={type}
                                        onClick={() => setReportType(type)}
                                        className={`flex-1 py-3 text-[11px] font-black uppercase tracking-widest rounded-xl transition-all ${reportType === type
                                            ? 'bg-white text-indigo-600 shadow-sm border border-slate-100 scale-[1.02]'
                                            : 'text-slate-400 hover:text-slate-600'
                                            }`}
                                    >
                                        {type}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-4">
                            <label className="block text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Period Selection</label>
                            <div className="relative group">
                                {reportType === 'daily' && (
                                    <input
                                        type="date"
                                        value={selectedDate}
                                        onChange={(e) => setSelectedDate(e.target.value)}
                                        className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold focus:bg-white focus:ring-4 focus:ring-indigo-50 transition-all outline-none"
                                    />
                                )}
                                {reportType === 'monthly' && (
                                    <div className="grid grid-cols-2 gap-3">
                                        <select
                                            value={selectedMonth}
                                            onChange={(e) => setSelectedMonth(Number(e.target.value))}
                                            className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold focus:bg-white focus:ring-4 focus:ring-indigo-50 outline-none appearance-none"
                                        >
                                            {Array.from({ length: 12 }, (_, i) => (
                                                <option key={i + 1} value={i + 1}>{new Date(0, i).toLocaleString('default', { month: 'long' })}</option>
                                            ))}
                                        </select>
                                        <input
                                            type="number"
                                            value={selectedYear}
                                            onChange={(e) => setSelectedYear(Number(e.target.value))}
                                            className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold focus:bg-white focus:ring-4 focus:ring-indigo-50 outline-none"
                                        />
                                    </div>
                                )}
                                {reportType === 'yearly' && (
                                    <input
                                        type="number"
                                        value={selectedYear}
                                        onChange={(e) => setSelectedYear(Number(e.target.value))}
                                        className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold focus:bg-white focus:ring-4 focus:ring-indigo-50 outline-none"
                                    />
                                )}
                            </div>
                        </div>

                        <div className="space-y-4">
                            <label className="block text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Display Mode</label>
                            <div className="flex p-1.5 bg-slate-50 rounded-2xl border border-slate-200/60">
                                {[
                                    { id: 'graph', icon: BarChart2, label: 'Analytics' },
                                    { id: 'tabular', icon: TableIcon, label: 'Raw Data' }
                                ].map((format) => (
                                    <button
                                        key={format.id}
                                        onClick={() => setViewFormat(format.id)}
                                        className={`flex-1 py-3 flex items-center justify-center gap-2 text-[11px] font-black uppercase tracking-widest rounded-xl transition-all ${viewFormat === format.id
                                            ? 'bg-white text-indigo-600 shadow-sm border border-slate-100 scale-[1.02]'
                                            : 'text-slate-400 hover:text-slate-600'
                                            }`}
                                    >
                                        <format.icon size={14} />
                                        {format.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <button
                            onClick={fetchStats}
                            disabled={loading}
                            className="w-full mt-4 py-4 bg-slate-900 text-white rounded-[22px] font-black tracking-widest text-xs hover:bg-black transition-all flex items-center justify-center gap-3 active:scale-[0.98] shadow-xl shadow-slate-200 group"
                        >
                            {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : <TrendingUp size={18} className="group-hover:translate-y-[-2px] transition-transform" />}
                            GENERATE INSIGHTS
                        </button>
                    </div>
                </div>

                {/* Main Section: Summary & Content */}
                <div className="lg:col-span-8 space-y-8">
                    {!hasGenerated ? (
                        <div className="bg-white p-20 rounded-[40px] border border-slate-200 border-dashed shadow-sm flex flex-col items-center justify-center text-center">
                            <div className="w-24 h-24 bg-slate-50 text-slate-300 rounded-[30%] flex items-center justify-center mb-8">
                                <Search size={48} strokeWidth={1} />
                            </div>
                            <h3 className="text-2xl font-black text-slate-900 mb-3 tracking-tight">Ready to Analyze</h3>
                            <p className="text-slate-400 font-medium max-w-sm mx-auto leading-relaxed">
                                Select report options and click <span className="text-indigo-600 font-bold">Generate Insights</span> to view the report.
                            </p>
                        </div>
                    ) : loading ? (
                        <div className="bg-white p-20 rounded-[40px] border border-slate-200 shadow-sm flex flex-col items-center justify-center text-center">
                            <div className="relative mb-8">
                                <div className="w-16 h-16 border-4 border-indigo-100 rounded-full animate-ping absolute"></div>
                                <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                            </div>
                            <h3 className="text-xl font-black text-slate-900 mb-2 tracking-tight">Generating report...</h3>
                            <p className="text-slate-400 font-medium uppercase tracking-widest text-[10px]">Processing data from secure servers</p>
                        </div>
                    ) : (
                        <>
                            {/* Summary Scoreboard */}
                            {stats && (
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    {[
                                        { label: 'Total Tasks', value: stats.totalActivities, trend: 'Activities', icon: Activity, color: 'indigo' },
                                        { label: 'Performance', value: `${stats.avgRating}/5`, trend: 'Avg Rating', icon: Target, color: 'amber' },
                                        { label: 'Completion', value: `${stats.completionRate}%`, trend: 'Success Rate', icon: Zap, color: 'emerald' }
                                    ].map((item, idx) => (
                                        <div key={idx} className="bg-white p-6 rounded-[32px] border border-slate-200 shadow-sm group hover:shadow-md transition-all">
                                            <div className="flex items-center justify-between mb-4">
                                                <div className={`p-3 bg-${item.color}-50 text-${item.color}-600 rounded-2xl group-hover:scale-110 transition-transform`}>
                                                    <item.icon size={20} />
                                                </div>
                                                <ArrowUpRight size={18} className="text-slate-300" />
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-3xl font-black text-slate-900 tracking-tight mb-1">{item.value}</span>
                                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{item.label}</span>
                                            </div>
                                            <div className="mt-4 flex items-center gap-1.5">
                                                <div className={`w-1 h-4 bg-${item.color}-500 rounded-full`}></div>
                                                <span className="text-xs font-bold text-slate-500">{item.trend}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Content Area */}
                            {data.length > 0 ? (
                                <div className="space-y-8">
                                    {viewFormat === 'graph' ? (
                                        <div className="bg-white p-8 rounded-[40px] border border-slate-200 shadow-sm">
                                            <div className="flex items-center justify-between mb-10">
                                                <div>
                                                    <h3 className="text-xl font-black text-slate-900 tracking-tight capitalize flex items-center gap-3">
                                                        <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl"><Activity size={20} /></div>
                                                        {reportType === 'daily' ? 'Daily Activity Performance' :
                                                            reportType === 'monthly' ? 'Monthly Activity Progress' :
                                                                'Yearly Activity Summary'}
                                                    </h3>
                                                    <p className="text-slate-400 text-sm font-medium mt-1">
                                                        {reportType === 'daily' ? 'Performance tracking for today\'s scheduled tasks' :
                                                            reportType === 'monthly' ? 'Average performance trends across the current month' :
                                                                'Summary of monthly performance for the selected year'}
                                                    </p>
                                                </div>
                                                <div className="flex items-center gap-6">
                                                    {reportType === 'daily' ? (
                                                        <div className="flex items-center gap-4">
                                                            <div className="flex items-center gap-2">
                                                                <div className="w-3 h-3 rounded-full bg-emerald-500 shadow-sm shadow-emerald-100"></div>
                                                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Completed (Rating 4-5)</span>
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                <div className="w-3 h-3 rounded-full bg-indigo-500 shadow-sm shadow-indigo-100"></div>
                                                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Good (Rating 2.5-3.9)</span>
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                <div className="w-3 h-3 rounded-full bg-rose-500 shadow-sm shadow-rose-100"></div>
                                                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Low (Rating {'<'} 2.5)</span>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-3 h-3 rounded-full bg-indigo-500 shadow-sm shadow-indigo-100"></div>
                                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Avg Rating</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="h-[430px] w-full">
                                                <ResponsiveContainer width="100%" height="100%">
                                                    {reportType === 'monthly' ? (
                                                        <LineChart data={stats?.mainChartData} margin={{ top: 20, right: 30, left: 20, bottom: 40 }}>
                                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                                            <XAxis
                                                                dataKey="name"
                                                                axisLine={false}
                                                                tickLine={false}
                                                                tick={{ fontSize: 10, fontWeight: 800, fill: '#64748b' }}
                                                                dy={10}
                                                                label={{ value: 'Dates of the Month', position: 'insideBottom', offset: -20, fill: '#94a3b8', fontSize: 11, fontWeight: 'black', textAnchor: 'middle' }}
                                                            />
                                                            <YAxis
                                                                domain={[0, 5]}
                                                                axisLine={false}
                                                                tickLine={false}
                                                                tick={{ fontSize: 10, fontWeight: 800, fill: '#64748b' }}
                                                                dx={-10}
                                                                label={{ value: 'Avg Rating (1–5)', angle: -90, position: 'insideLeft', offset: 0, fill: '#94a3b8', fontSize: 11, fontWeight: 'black' }}
                                                            />
                                                            <Tooltip
                                                                contentStyle={{
                                                                    borderRadius: '20px',
                                                                    border: 'none',
                                                                    boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
                                                                    fontWeight: '900',
                                                                    background: '#fff'
                                                                }}
                                                            />
                                                            <Legend
                                                                verticalAlign="top"
                                                                align="right"
                                                                height={36}
                                                                content={({ payload }) => (
                                                                    <div className="flex justify-end gap-4 mb-4">
                                                                        <div className="flex items-center gap-2">
                                                                            <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
                                                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Daily Avg Rating</span>
                                                                        </div>
                                                                    </div>
                                                                )}
                                                            />
                                                            <Line
                                                                type="monotone"
                                                                dataKey="rating"
                                                                stroke={COLORS.info}
                                                                strokeWidth={4}
                                                                dot={{ r: 6, fill: COLORS.info, strokeWidth: 2, stroke: '#fff' }}
                                                                activeDot={{ r: 8, strokeWidth: 0 }}
                                                                animationDuration={1500}
                                                                label={{ position: 'top', fill: '#64748b', fontSize: 10, fontWeight: 'bold', offset: 10 }}
                                                            />
                                                        </LineChart>
                                                    ) : (
                                                        <BarChart data={stats?.mainChartData} margin={{ top: 20, right: 30, left: 20, bottom: 40 }}>
                                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                                            <XAxis
                                                                dataKey="name"
                                                                axisLine={false}
                                                                tickLine={false}
                                                                tick={{ fontSize: 9, fontWeight: 800, fill: '#64748b' }}
                                                                interval={0}
                                                                angle={reportType === 'daily' ? -15 : 0}
                                                                textAnchor={reportType === 'daily' ? "end" : "middle"}
                                                                dy={10}
                                                                label={{
                                                                    value: reportType === 'daily' ? 'Activities' : 'Months',
                                                                    position: 'insideBottom',
                                                                    offset: -20,
                                                                    fill: '#94a3b8',
                                                                    fontSize: 11,
                                                                    fontWeight: 'black'
                                                                }}
                                                            />
                                                            <YAxis
                                                                domain={[0, 5]}
                                                                axisLine={false}
                                                                tickLine={false}
                                                                tick={{ fontSize: 10, fontWeight: 800, fill: '#64748b' }}
                                                                dx={-10}
                                                                label={{
                                                                    value: reportType === 'daily' ? 'Activity Rating (1–5)' : 'Avg Rating (1–5)',
                                                                    angle: -90,
                                                                    position: 'insideLeft',
                                                                    offset: 0,
                                                                    fill: '#94a3b8',
                                                                    fontSize: 11,
                                                                    fontWeight: 'black'
                                                                }}
                                                            />
                                                            <Tooltip
                                                                cursor={{ fill: '#f8fafc', radius: 10 }}
                                                                contentStyle={{
                                                                    borderRadius: '20px',
                                                                    border: 'none',
                                                                    boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
                                                                    fontWeight: '900',
                                                                    background: '#fff'
                                                                }}
                                                            />
                                                            <Legend
                                                                verticalAlign="top"
                                                                align="right"
                                                                height={36}
                                                                content={() => (
                                                                    <div className="flex justify-end gap-4 mb-4">
                                                                        <div className="flex items-center gap-2">
                                                                            <div className="w-2 h-2 rounded-full bg-slate-400"></div>
                                                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                                                                {reportType === 'daily' ? 'Activity Performance' : 'Monthly Performance'}
                                                                            </span>
                                                                        </div>
                                                                    </div>
                                                                )}
                                                            />
                                                            <Bar
                                                                dataKey="rating"
                                                                fill={COLORS.primary}
                                                                radius={[10, 10, 2, 2]}
                                                                barSize={reportType === 'daily' ? 30 : 45}
                                                                animationDuration={1500}
                                                                label={{ position: 'top', fill: '#64748b', fontSize: 10, fontWeight: 'bold', offset: 5 }}
                                                            >
                                                                {stats?.mainChartData.map((entry, index) => (
                                                                    <Cell
                                                                        key={`cell-${index}`}
                                                                        fill={entry.rating >= 4 ? COLORS.success : entry.rating >= 2.5 ? COLORS.info : COLORS.danger}
                                                                    />
                                                                ))}
                                                            </Bar>
                                                        </BarChart>
                                                    )}
                                                </ResponsiveContainer>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="bg-white rounded-[40px] border border-slate-200 shadow-sm overflow-hidden">
                                            <div className="px-8 py-6 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
                                                <div>
                                                    <h4 className="text-lg font-black text-slate-900 tracking-tight">Records Feed</h4>
                                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Aggregated History</p>
                                                </div>
                                                <div className="p-3 bg-white border border-slate-200 rounded-2xl shadow-sm text-slate-400">
                                                    <Search size={18} />
                                                </div>
                                            </div>

                                            <div className="overflow-x-auto">
                                                <table className="w-full text-left border-collapse">
                                                    <thead>
                                                        <tr className="bg-slate-50/50">
                                                            <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Schedule</th>
                                                            <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Activity</th>
                                                            <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Status</th>
                                                            <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Performance</th>
                                                            <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Mentor</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-slate-100">
                                                        {data.flatMap(log =>
                                                            log.activities.map((act, idx) => (
                                                                <tr key={`${log._id}-${idx}`} className="group hover:bg-slate-50/80 transition-all cursor-default">
                                                                    <td className="px-8 py-6">
                                                                        <div className="flex flex-col">
                                                                            <span className="font-black text-slate-900 text-xs tracking-tight">
                                                                                {new Date(log.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
                                                                            </span>
                                                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Year {new Date(log.date).getFullYear()}</span>
                                                                        </div>
                                                                    </td>
                                                                    <td className="px-6 py-6">
                                                                        <div className="flex flex-col">
                                                                            <span className="font-bold text-slate-700 text-sm group-hover:text-indigo-600 transition-colors">{act.activityName}</span>
                                                                            <span className="text-[10px] text-slate-400 font-medium italic truncate max-w-[150px]">{act.notes || "No extra notes."}</span>
                                                                        </div>
                                                                    </td>
                                                                    <td className="px-6 py-6 text-center">
                                                                        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[9px] font-black border shadow-sm ${act.completed
                                                                            ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                                                                            : 'bg-rose-50 text-rose-600 border-rose-100'
                                                                            }`}>
                                                                            {act.completed ? <CheckCircle2 size={12} strokeWidth={3} /> : <XCircle size={12} strokeWidth={3} />}
                                                                            {act.completed ? 'DONE' : 'MISS'}
                                                                        </span>
                                                                    </td>
                                                                    <td className="px-6 py-6">
                                                                        <div className="flex items-center gap-0.5">
                                                                            {[1, 2, 3, 4, 5].map(s => (
                                                                                <Star
                                                                                    key={s}
                                                                                    size={13}
                                                                                    className={s <= act.rating ? "fill-amber-400 text-amber-400" : "text-slate-200"}
                                                                                    strokeWidth={s <= act.rating ? 0 : 2}
                                                                                />
                                                                            ))}
                                                                        </div>
                                                                    </td>
                                                                    <td className="px-8 py-6">
                                                                        <div className="flex items-center gap-3">
                                                                            <div className="w-8 h-8 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 font-black text-xs">
                                                                                {log.recordedBy?.name?.[0].toUpperCase()}
                                                                            </div>
                                                                            <span className="text-xs font-bold text-slate-600 group-hover:text-slate-900 transition-colors">{log.recordedBy?.name || 'Staff'}</span>
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
                                </div>
                            ) : (
                                <div className="bg-white p-20 rounded-[40px] border border-slate-200 shadow-sm flex flex-col items-center justify-center text-center">
                                    <div className="w-24 h-24 bg-indigo-50/50 text-indigo-300 rounded-[30%] flex items-center justify-center mb-8 rotate-12 group-hover:rotate-0 transition-transform duration-500">
                                        <Calendar size={48} strokeWidth={1} />
                                    </div>
                                    <h3 className="text-2xl font-black text-slate-900 mb-3 tracking-tight">No Insights Found</h3>
                                    <p className="text-slate-400 font-medium max-w-sm mx-auto leading-relaxed">
                                        We couldn't find any activity logs for the selected <span className="text-indigo-600 font-bold">{reportType}</span> period.
                                        Please try adjusting your filters or checking a different date.
                                    </p>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>

            {/* Print Only Section */}
            <div className="hidden print:block fixed inset-0 bg-white p-12 overflow-visible">
                <div className="flex justify-between items-center mb-10 pb-6 border-b-2 border-slate-100">
                    <div>
                        <h1 className="text-4xl font-black text-slate-900">Child Progress Report</h1>
                        <p className="text-slate-500 font-bold text-lg mt-1">{reportType.toUpperCase()} SUMMARY • {child?.childName}</p>
                    </div>
                    <div className="text-right">
                        <p className="text-slate-900 font-black text-2xl">Daycare Discovery</p>
                        <p className="text-slate-500 font-bold">Generated on {new Date().toLocaleDateString()}</p>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-10 mb-12">
                    <div className="bg-slate-50 p-6 rounded-3xl">
                        <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Child Information</h2>
                        <p className="text-xl font-black text-slate-900 mb-2">{child?.childName}</p>
                        <p className="text-slate-600 font-bold">Parent: {child?.parentName} ({child?.parentPhone})</p>
                    </div>
                    <div className="bg-slate-900 text-white p-6 rounded-3xl flex justify-between items-center">
                        <div>
                            <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Global Success Rate</h2>
                            <p className="text-4xl font-black">{stats?.completionRate || 0}%</p>
                        </div>
                        <div className="text-right">
                            <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Avg Rating</h2>
                            <p className="text-4xl font-black">{stats?.avgRating || 0}/5</p>
                        </div>
                    </div>
                </div>

                <div className="border-2 border-slate-100 rounded-[32px] overflow-hidden">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="px-6 py-4 font-black text-slate-900">Date</th>
                                <th className="px-6 py-4 font-black text-slate-900">Activity Name</th>
                                <th className="px-6 py-4 font-black text-slate-900">Status</th>
                                <th className="px-6 py-4 font-black text-slate-900">Rating</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {data.flatMap(log => log.activities.map((act, i) => (
                                <tr key={i}>
                                    <td className="px-6 py-4 text-slate-600 font-bold">{new Date(log.date).toLocaleDateString()}</td>
                                    <td className="px-6 py-4 text-slate-900 font-black">{act.activityName}</td>
                                    <td className="px-6 py-4 text-slate-600 font-bold">{act.completed ? 'Completed' : 'Pending'}</td>
                                    <td className="px-6 py-4 text-slate-900 font-black">{act.rating}/5</td>
                                </tr>
                            )))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default ChildProgress;
