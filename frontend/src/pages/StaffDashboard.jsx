import React, { useState, useEffect } from 'react';
import { Users, CalendarCheck, Activity, TrendingUp, Clock } from 'lucide-react';

const StaffDashboard = () => {
    const [stats, setStats] = useState({
        totalChildren: 0,
        presentToday: 0,
        absentToday: 0,
        activitiesToday: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const token = localStorage.getItem('token');
                const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5005';
                const response = await fetch(`${apiUrl}/api/staff/dashboard-stats`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
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
    }, []);

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
