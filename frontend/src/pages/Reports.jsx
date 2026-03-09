import React, { useState, useEffect } from 'react';
import {
    PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend,
    BarChart, Bar, XAxis, YAxis, CartesianGrid
} from 'recharts';
import { BarChart3, PieChart as PieChartIcon, TrendingUp, Users, CheckCircle2, AlertCircle } from 'lucide-react';

const Reports = () => {
    const [attendanceData, setAttendanceData] = useState([]);
    const [activityData, setActivityData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5005';

    useEffect(() => {
        const fetchReports = async () => {
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
                console.error('Error fetching reports:', err);
                setError('Failed to load reports. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        fetchReports();
    }, [apiUrl]);

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
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 mb-2">Reports & Analytics</h1>
                    <p className="text-gray-500 font-medium flex items-center gap-2">
                        <TrendingUp size={18} className="text-purple-600" />
                        Visual breakdown of daycare performance and staff productivity
                    </p>
                </div>
            </div>

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
    );
};

export default Reports;
