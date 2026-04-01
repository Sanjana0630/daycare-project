import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FileText, Download, User, CalendarDays, TrendingUp, Clock, Activity, ArrowLeft } from 'lucide-react';

const ParentReportView = () => {
    const { reportId } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [reportResult, setReportResult] = useState(null);
    const [error, setError] = useState(null);
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5005';

    useEffect(() => {
        const fetchReport = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await fetch(`${apiUrl}/api/reports/${reportId}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const result = await res.json();
                if (result.success) {
                    setReportResult(result.data);
                } else {
                    setError(result.message || 'Failed to load report');
                }
            } catch (err) {
                console.error('Error fetching report:', err);
                setError('An error occurred while loading the report.');
            } finally {
                setLoading(false);
            }
        };

        if (reportId) {
            fetchReport();
        }
    }, [reportId, apiUrl]);

    const exportToPDF = () => {
        window.print();
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center p-20">
                <div className="w-10 h-10 border-4 border-purple-100 border-t-purple-600 rounded-full animate-spin"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-8 text-center bg-white rounded-[40px] border border-red-100 shadow-sm space-y-6">
                <div className="w-16 h-16 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto opacity-80">
                    <FileText size={32} />
                </div>
                <h3 className="text-xl font-black text-gray-900">{error}</h3>
                <button 
                    onClick={() => navigate('/parent/notifications')}
                    className="px-6 py-2 bg-gray-900 text-white rounded-xl font-bold hover:bg-black transition-all"
                >
                    Back to Notifications
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* Back Button and Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-2 print:hidden">
                <button 
                    onClick={() => navigate('/parent/notifications')}
                    className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-purple-600 transition-colors"
                >
                    <ArrowLeft size={16} />
                    Back to Notifications
                </button>
                <div className="flex gap-3">
                    <button onClick={exportToPDF} className="px-6 py-3 bg-gray-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-2 hover:bg-black transition-all active:scale-95 shadow-lg shadow-gray-200">
                        <Download size={14} /> Download PDF
                    </button>
                </div>
            </div>

            {/* Combined Report View */}
            <div className="bg-white rounded-[40px] border border-gray-100 shadow-sm overflow-hidden report-container print:border-none print:shadow-none">
                
                {/* Header Section */}
                <div className="p-8 border-b border-gray-100 flex items-center gap-4 bg-gray-50/50">
                    <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-2xl flex items-center justify-center">
                        <FileText size={24} />
                    </div>
                    <div>
                        <h2 className="text-2xl font-black text-gray-900 tracking-tight">Child Performance Report</h2>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Progress tracked through {reportResult.childInfo.className}</p>
                    </div>
                </div>

                <div className="p-8 space-y-10 print:p-0">
                    {/* Section 1: Child Info */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-black text-purple-600 uppercase tracking-widest border-b border-gray-100 pb-2 flex items-center gap-2">
                            <User size={16} /> Child Information
                        </h3>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-6 p-6 bg-purple-50/30 rounded-3xl border border-purple-100">
                            <div>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Name</p>
                                <p className="font-bold text-gray-900 text-lg">{reportResult.childInfo.name}</p>
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Class</p>
                                <p className="font-bold text-gray-900 text-lg">{reportResult.childInfo.className}</p>
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Report Period</p>
                                <div className="flex items-center gap-2">
                                    <CalendarDays size={18} className="text-purple-400" />
                                    <p className="font-bold text-gray-900 text-lg">Detailed Summary</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Section 2: Summary Metrics */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-black text-amber-600 uppercase tracking-widest border-b border-gray-100 pb-2 flex items-center gap-2">
                            <TrendingUp size={16} /> Performance Overview
                        </h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="p-6 bg-emerald-50 rounded-3xl border border-emerald-100 text-center">
                                <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-2">Days Present</p>
                                <p className="text-4xl font-black text-emerald-900">{reportResult.summary.presentDays}</p>
                            </div>
                            <div className="p-6 bg-rose-50 rounded-3xl border border-rose-100 text-center">
                                <p className="text-[10px] font-black text-rose-600 uppercase tracking-widest mb-2">Days Absent</p>
                                <p className="text-4xl font-black text-rose-900">{reportResult.summary.absentDays}</p>
                            </div>
                            <div className="p-6 bg-indigo-50 rounded-3xl border border-indigo-100 text-center">
                                <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-2">Activities Done</p>
                                <p className="text-4xl font-black text-indigo-900">{reportResult.summary.activitiesCompleted}</p>
                            </div>
                            <div className="p-6 bg-blue-50 rounded-3xl border border-blue-100 text-center">
                                <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-2">Avg Rating</p>
                                <div className="flex items-center justify-center gap-1.5">
                                    <p className="text-4xl font-black text-blue-900">{reportResult.summary.averageRating}</p>
                                    <span className="text-blue-400 text-2xl">★</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-4">
                        {/* Section 3: Attendance Details */}
                        <div className="space-y-4">
                            <h3 className="text-sm font-black text-emerald-600 uppercase tracking-widest border-b border-gray-100 pb-2 flex items-center gap-2">
                                <Clock size={16} /> Attendance Logs
                            </h3>
                            <div className="border border-gray-100 rounded-3xl overflow-hidden bg-gray-50/20">
                                <table className="w-full text-left">
                                    <thead className="bg-gray-100/50">
                                        <tr>
                                            <th className="px-5 py-4 text-[10px] font-black text-gray-500 uppercase tracking-widest">Date</th>
                                            <th className="px-5 py-4 text-[10px] font-black text-gray-500 uppercase tracking-widest">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {reportResult.attendance.map((row, i) => (
                                            <tr key={`att-${i}`} className="hover:bg-white transition-colors">
                                                <td className="px-5 py-4 text-sm text-gray-700 font-bold">{row.date}</td>
                                                <td className="px-5 py-4">
                                                    <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${row.status.toLowerCase() === 'present' ? 'bg-green-50 text-green-700 border-green-100' : 'bg-red-50 text-red-700 border-red-100'}`}>
                                                        {row.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Section 4: Activities Details */}
                        <div className="space-y-4">
                            <h3 className="text-sm font-black text-indigo-600 uppercase tracking-widest border-b border-gray-100 pb-2 flex items-center gap-2">
                                <Activity size={16} /> Key Activities
                            </h3>
                            <div className="border border-gray-100 rounded-3xl overflow-hidden bg-gray-50/20">
                                <table className="w-full text-left">
                                    <thead className="bg-gray-100/50">
                                        <tr>
                                            <th className="px-5 py-4 text-[10px] font-black text-gray-500 uppercase tracking-widest">Activity</th>
                                            <th className="px-5 py-4 text-[10px] font-black text-gray-500 uppercase tracking-widest text-right">Rating</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {reportResult.activities.slice(0, 10).map((row, i) => ( // limit to keep clean
                                            <tr key={`act-${i}`} className="hover:bg-white transition-colors">
                                                <td className="px-5 py-4 font-bold text-gray-900">
                                                    <p className="text-sm">{row.activity}</p>
                                                    <p className="text-[10px] text-gray-400 font-bold uppercase">{row.date}</p>
                                                </td>
                                                <td className="px-5 py-4 text-right">
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
    );
};

export default ParentReportView;
