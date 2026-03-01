import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, CalendarCheck, Activity, TrendingUp, Clock } from 'lucide-react';

const StaffDashboard = () => {
    const navigate = useNavigate();
    const [stats, setStats] = useState({
        totalChildren: 0,
        presentToday: 0,
        absentToday: 0,
        activitiesToday: 0
    });
    const [loading, setLoading] = useState(true);
    const [profileMissing, setProfileMissing] = useState(false);
    const status = localStorage.getItem('status');

    useEffect(() => {
        if (status === 'pending') {
            setLoading(false);
            return;
        }

        const fetchStats = async () => {
            try {
                const token = localStorage.getItem('token');
                const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5005';
                const response = await fetch(`${apiUrl}/api/staff/dashboard-stats`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (response.status === 404) {
                    setProfileMissing(true);
                }

                const result = await response.json();
                if (result.success) {
                    setStats(result.data);
                }
            } catch (error) {
                console.error('Error fetching dashboard stats:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, [status]);

    if (loading) return (
        <div className="flex items-center justify-center min-h-[50vh]">
            <div className="w-10 h-10 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
        </div>
    );

    if (status === 'pending') {
        return (
            <div className="flex items-center justify-center min-h-[70vh] animate-in fade-in duration-700">
                <div className="max-w-md w-full bg-white p-12 rounded-[3rem] border border-gray-100 shadow-2xl shadow-purple-100 text-center space-y-8">
                    <div className="w-24 h-24 bg-amber-50 rounded-full flex items-center justify-center mx-auto ring-8 ring-amber-50/50">
                        <div className="w-12 h-12 border-4 border-amber-200 border-t-amber-600 rounded-full animate-spin"></div>
                    </div>
                    <div className="space-y-3">
                        <h2 className="text-3xl font-black text-gray-900">Account Pending</h2>
                        <p className="text-gray-500 font-medium leading-relaxed">
                            Your registration as <span className="text-purple-600 font-bold">Staff</span> is currently being reviewed by the administration.
                        </p>
                    </div>
                    <div className="p-6 bg-gray-50 rounded-[2rem] border border-gray-100">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Notice</p>
                        <p className="text-sm text-gray-600 font-medium">Please check back soon. You will have full access once your account is approved.</p>
                    </div>
                    <button
                        onClick={() => { localStorage.clear(); window.location.href = '/login'; }}
                        className="text-sm font-black text-purple-600 hover:text-purple-700 transition-colors uppercase tracking-widest"
                    >
                        Switch Account / Logout
                    </button>
                </div>
            </div>
        );
    }

    if (profileMissing) {
        return (
            <div className="flex items-center justify-center min-h-[70vh] animate-in fade-in duration-700">
                <div className="max-w-lg w-full bg-white p-12 rounded-[3.5rem] border border-gray-100 shadow-2xl shadow-indigo-100 text-center space-y-8">
                    <div className="w-24 h-24 bg-indigo-50 rounded-[2rem] flex items-center justify-center mx-auto rotate-12 transform hover:rotate-0 transition-transform duration-500">
                        <Users className="text-indigo-600" size={40} />
                    </div>
                    <div className="space-y-3">
                        <h2 className="text-3xl font-black text-gray-900">Welcome to the Team!</h2>
                        <p className="text-gray-500 font-medium leading-relaxed">
                            Your account has been <span className="text-green-600 font-bold">Approved</span>. Now, please complete your basic profile to start managing your classes.
                        </p>
                    </div>
                    <button
                        onClick={() => navigate('/staff/settings')}
                        className="w-full py-4 bg-indigo-600 text-white font-black rounded-2xl shadow-xl shadow-indigo-200 hover:bg-indigo-700 hover:-translate-y-1 transition-all uppercase tracking-widest"
                    >
                        Fill Basic Information
                    </button>
                </div>
            </div>
        );
    }

    const cards = [
        { title: 'My Children', value: stats.totalChildren, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
        { title: 'Present Today', value: stats.presentToday, icon: CalendarCheck, color: 'text-green-600', bg: 'bg-green-50' },
        { title: 'Absent Today', value: stats.absentToday, icon: TrendingUp, color: 'text-rose-600', bg: 'bg-rose-50' },
        { title: 'Daily Activities', value: stats.activitiesToday, icon: Activity, color: 'text-purple-600', bg: 'bg-purple-50' }
    ];

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Welcome Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-8 rounded-3xl border border-gray-100 shadow-sm overflow-hidden relative">
                <div className="relative z-10">
                    <h1 className="text-3xl font-black text-gray-900 mb-2">Staff Dashboard</h1>
                    <p className="text-gray-500 font-medium flex items-center gap-2">
                        <Clock size={16} /> {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                    </p>
                </div>
                <div className="absolute right-0 top-0 w-64 h-full bg-gradient-to-l from-blue-50/50 to-transparent -z-0"></div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {cards.map((card, idx) => (
                    <div key={idx} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 group">
                        <div className="flex items-center gap-4">
                            <div className={`p-4 rounded-2xl ${card.bg} ${card.color} group-hover:scale-110 transition-transform duration-300`}>
                                <card.icon size={24} />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-gray-400 uppercase tracking-wider">{card.title}</p>
                                <h3 className="text-2xl font-black text-gray-900">{loading ? '...' : card.value}</h3>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Recent Section Placeholder */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
                    <h3 className="text-xl font-black text-gray-900 mb-6">Today's Schedule</h3>
                    <div className="space-y-4">
                        <div className="flex items-center gap-4 p-4 rounded-2xl bg-gray-50 border border-gray-100 border-dashed">
                            <div className="w-2 h-12 bg-blue-500 rounded-full"></div>
                            <div>
                                <p className="font-bold text-gray-900">Morning Session</p>
                                <p className="text-sm text-gray-500">9:00 AM - 12:00 PM</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4 p-4 rounded-2xl bg-gray-50 border border-gray-100 border-dashed opacity-50">
                            <div className="w-2 h-12 bg-gray-300 rounded-full"></div>
                            <div>
                                <p className="font-bold text-gray-900">Nap Time</p>
                                <p className="text-sm text-gray-500">1:00 PM - 3:00 PM</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StaffDashboard;
