import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, CalendarCheck, Activity, TrendingUp, Clock, CheckCircle2, AlertCircle, Plus, Layout, Save, X, Trash2 } from 'lucide-react';

const StaffDashboard = () => {
    const navigate = useNavigate();
    const [stats, setStats] = useState({
        totalChildren: 0,
        pendingToday: 0,
        presentToday: 0,
        absentToday: 0,
        scheduleStats: { total: 0, completed: 0, pending: 0, missed: 0 }
    });
    const [schedule, setSchedule] = useState([]);
    const [loading, setLoading] = useState(true);
    const [profileMissing, setProfileMissing] = useState(false);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [newActivity, setNewActivity] = useState({
        name: '',
        startTime: '',
        endTime: '',
        description: ''
    });
    const status = localStorage.getItem('status');

    const fetchStats = async () => {
        try {
            const token = localStorage.getItem('token');
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5005';
            const response = await fetch(`${apiUrl}/api/staff/dashboard-stats`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.status === 404) {
                setProfileMissing(true);
                return;
            }

            const result = await response.json();
            if (result.success) {
                setStats(result.data);
            }
        } catch (error) {
            console.error('Error fetching dashboard stats:', error);
        }
    };

    const fetchSchedule = async () => {
        try {
            const token = localStorage.getItem('token');
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5005';
            const response = await fetch(`${apiUrl}/api/staff/schedule`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const result = await response.json();
            if (result.success) {
                setSchedule(result.data);
            }
        } catch (error) {
            console.error('Error fetching schedule:', error);
        }
    };

    useEffect(() => {
        if (status === 'pending') {
            setLoading(false);
            return;
        }

        const initializeData = async () => {
            setLoading(true);
            await Promise.all([fetchStats(), fetchSchedule()]);
            setLoading(false);
        };
        initializeData();

        // Auto-refresh every minute to update activity statuses automatically
        const interval = setInterval(() => {
            fetchStats();
            fetchSchedule();
        }, 60000);

        return () => clearInterval(interval);
    }, [status]);

    const handleMarkCompleted = async (activity) => {
        try {
            const token = localStorage.getItem('token');
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5005';

            const response = await fetch(`${apiUrl}/api/staff/schedule/mark`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    ...activity,
                    date: new Date().toISOString()
                })
            });

            const result = await response.json();
            if (result.success) {
                await Promise.all([fetchStats(), fetchSchedule()]);
            }
        } catch (error) {
            console.error('Error marking activity completed:', error);
        }
    };

    const handleAddCustomActivity = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5005';

            const response = await fetch(`${apiUrl}/api/staff/schedule/custom`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    ...newActivity,
                    date: new Date().toISOString()
                })
            });

            const result = await response.json();
            if (result.success) {
                setIsAddModalOpen(false);
                setNewActivity({ name: '', startTime: '', endTime: '', description: '' });
                await Promise.all([fetchStats(), fetchSchedule()]);
            }
        } catch (error) {
            console.error('Error adding custom activity:', error);
        }
    };

    const handleDeleteActivity = async (id) => {
        if (!window.confirm("Are you sure you want to delete this activity?")) return;

        try {
            const token = localStorage.getItem('token');
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5005';

            const response = await fetch(`${apiUrl}/api/staff/schedule/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const result = await response.json();
            if (result.success) {
                await Promise.all([fetchStats(), fetchSchedule()]);
            }
        } catch (error) {
            console.error('Error deleting activity:', error);
        }
    };

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

    const activeAttendanceCards = [
        { title: 'Assigned Students', value: stats.totalChildren || 0, icon: Users, color: 'text-purple-600', bg: 'bg-purple-50' },
        { title: 'Pending Attendance', value: stats.pendingToday || 0, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
        { title: 'Present', value: stats.presentToday || 0, icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-50' },
        { title: 'Absent', value: stats.absentToday || 0, icon: AlertCircle, color: 'text-rose-600', bg: 'bg-rose-50' }
    ];

    const cards = [
        { title: 'Today\'s Activities', value: stats.scheduleStats?.total || 0, icon: Layout, color: 'text-blue-600', bg: 'bg-blue-50' },
        { title: 'Completed', value: stats.scheduleStats?.completed || 0, icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-50' },
        { title: 'Pending Activities', value: stats.scheduleStats?.pending || 0, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
        { title: 'Missed', value: stats.scheduleStats?.missed || 0, icon: AlertCircle, color: 'text-rose-600', bg: 'bg-rose-50' }
    ];

    const isWithinTimeWindow = (start, end) => {
        const now = new Date();
        const currentTimeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
        return currentTimeStr >= start && currentTimeStr <= end;
    };

    const getStatusStyles = (status, start, end) => {
        if (status === 'Completed') return 'bg-green-50 text-green-600 border-green-100';
        if (status === 'Missed') return 'bg-rose-50 text-rose-600 border-rose-100';

        const now = new Date();
        const currentTimeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

        if (currentTimeStr < start) return 'bg-gray-50 text-gray-400 border-gray-100';
        if (currentTimeStr >= start && currentTimeStr <= end) return 'bg-blue-50 text-blue-600 border-blue-100 ring-4 ring-blue-50/50';
        return 'bg-rose-50 text-rose-600 border-rose-100';
    };

    const getStatusText = (status, start, end) => {
        if (status === 'Completed') return 'COMPLETED';
        if (status === 'Missed') return 'MISSED';

        const now = new Date();
        const currentTimeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

        if (currentTimeStr < start) return 'NOT STARTED';
        if (currentTimeStr >= start && currentTimeStr <= end) return 'IN PROGRESS';
        return 'MISSED';
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Welcome Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-8 rounded-3xl border border-gray-100 shadow-sm overflow-hidden relative">
                <div className="relative z-10">
                    <h1 className="text-3xl font-black text-gray-900 mb-2">Staff Dashboard</h1>
                    <p className="text-gray-500 font-medium flex items-center gap-2">
                        <Clock size={16} /> {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                    </p>
                    {stats.assignedClass && (
                        <div className="mt-4 inline-block px-4 py-2 bg-purple-50 border border-purple-100 rounded-xl text-purple-700 font-bold">
                            Assigned Class: <span className="text-purple-900">[ {stats.assignedClass} ]</span>
                        </div>
                    )}
                </div>
                <div className="absolute right-0 top-0 w-64 h-full bg-gradient-to-l from-blue-50/50 to-transparent -z-0"></div>
            </div>

            {/* Schedule Stats Grid */}
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

            {/* Schedule Section */}
            <div className="grid grid-cols-1 gap-8">
                <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="text-2xl font-black text-gray-900">Today's Schedule</h3>
                            <p className="text-gray-500 font-medium">Daily curriculum and custom activities</p>
                        </div>
                        <button
                            onClick={() => setIsAddModalOpen(true)}
                            className="p-3 bg-purple-600 text-white rounded-2xl shadow-lg shadow-purple-100 hover:bg-purple-700 transition-all active:scale-95 flex items-center gap-2 font-bold"
                        >
                            <Plus size={20} />
                            <span className="hidden sm:inline">Add Activity</span>
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {schedule.map((item, idx) => {
                            const statusStyle = getStatusStyles(item.status, item.startTime, item.endTime);
                            const statusText = getStatusText(item.status, item.startTime, item.endTime);
                            const canComplete = item.status === 'Pending' && isWithinTimeWindow(item.startTime, item.endTime);

                            return (
                                <div key={item._id || idx} className="p-6 rounded-3xl border border-gray-100 bg-gray-50/50 hover:bg-white hover:shadow-xl hover:shadow-gray-100 transition-all duration-300 group relative overflow-hidden">
                                    <div className="absolute top-0 right-0 p-3">
                                        {item.isDefault ? (
                                            <div className="text-[10px] font-black text-gray-300 uppercase tracking-widest px-2 py-1">Default</div>
                                        ) : (
                                            <button
                                                onClick={() => handleDeleteActivity(item._id)}
                                                className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                                                title="Delete Activity"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        )}
                                    </div>
                                    <div className="flex flex-col h-full space-y-4">
                                        <div className="flex items-start justify-between">
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2 text-gray-400 font-bold text-xs uppercase tracking-wider">
                                                    <Clock size={12} />
                                                    {item.startTime} – {item.endTime}
                                                </div>
                                                <h4 className="text-lg font-black text-gray-900 line-clamp-1">{item.name}</h4>
                                            </div>
                                            <span className={`px-3 py-1 rounded-full text-[10px] font-black border tracking-widest ${statusStyle}`}>
                                                {statusText}
                                            </span>
                                        </div>

                                        {item.description && (
                                            <p className="text-sm text-gray-500 font-medium line-clamp-2">{item.description}</p>
                                        )}

                                        <div className="mt-auto pt-4">
                                            {item.status === 'Completed' ? (
                                                <button
                                                    disabled
                                                    className="w-full py-3 rounded-2xl font-black text-sm uppercase tracking-widest transition-all bg-green-50 text-green-600 border border-green-200 flex items-center justify-center gap-2 cursor-default"
                                                >
                                                    <CheckCircle2 size={18} />
                                                    Completed
                                                </button>
                                            ) : (
                                                <button
                                                    disabled={!canComplete}
                                                    onClick={() => handleMarkCompleted(item)}
                                                    className={`w-full py-3 rounded-2xl font-black text-sm uppercase tracking-widest transition-all ${canComplete
                                                        ? 'bg-purple-600 text-white shadow-lg shadow-purple-100 hover:bg-purple-700 active:scale-95'
                                                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                                        }`}
                                                >
                                                    {statusText === 'NOT STARTED' ? 'Not Started' : 'Mark Completed'}
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Add Activity Modal */}
            {isAddModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white rounded-[2.5rem] w-full max-w-lg overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
                        <div className="px-8 py-6 bg-purple-600 text-white flex items-center justify-between">
                            <div>
                                <h3 className="text-xl font-black">Add New Activity</h3>
                                <p className="text-purple-100 text-sm font-medium">Create a custom schedule item</p>
                            </div>
                            <button onClick={() => setIsAddModalOpen(false)} className="p-2 hover:bg-white/10 rounded-xl transition-colors">
                                <X size={24} />
                            </button>
                        </div>
                        <form onSubmit={handleAddCustomActivity} className="p-8 space-y-6">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-400 uppercase tracking-wider ml-1">Activity Name</label>
                                <input
                                    required
                                    className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-purple-50 focus:border-purple-200 outline-none transition-all font-bold placeholder:text-gray-300"
                                    placeholder="e.g., Gardening Session"
                                    value={newActivity.name}
                                    onChange={(e) => setNewActivity({ ...newActivity, name: e.target.value })}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-gray-400 uppercase tracking-wider ml-1">Start Time</label>
                                    <input
                                        type="time"
                                        required
                                        className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-purple-50 focus:border-purple-200 outline-none transition-all font-bold"
                                        value={newActivity.startTime}
                                        onChange={(e) => setNewActivity({ ...newActivity, startTime: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-gray-400 uppercase tracking-wider ml-1">End Time</label>
                                    <input
                                        type="time"
                                        required
                                        className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-purple-50 focus:border-purple-200 outline-none transition-all font-bold"
                                        value={newActivity.endTime}
                                        onChange={(e) => setNewActivity({ ...newActivity, endTime: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-400 uppercase tracking-wider ml-1">Description (Optional)</label>
                                <textarea
                                    className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-purple-50 focus:border-purple-200 outline-none transition-all font-medium placeholder:text-gray-300 min-h-[100px]"
                                    placeholder="Add more details about this activity..."
                                    value={newActivity.description}
                                    onChange={(e) => setNewActivity({ ...newActivity, description: e.target.value })}
                                />
                            </div>
                            <div className="pt-4 flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setIsAddModalOpen(false)}
                                    className="flex-1 py-4 bg-gray-100 text-gray-600 font-black rounded-2xl uppercase tracking-widest hover:bg-gray-200 transition-all active:scale-95"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-2 py-4 px-10 bg-purple-600 text-white font-black rounded-2xl uppercase tracking-widest shadow-xl shadow-purple-100 hover:bg-purple-700 transition-all active:scale-95 flex items-center justify-center gap-2"
                                >
                                    <Save size={20} />
                                    Save Activity
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StaffDashboard;
