import React, { useState, useEffect } from 'react';
import { Bell, Eye, Calendar, Clock, CheckCircle2, IndianRupee, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ParentNotifications = () => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filter, setFilter] = useState('all');
    const navigate = useNavigate();
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5005';

    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await fetch(`${apiUrl}/api/notifications`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const result = await res.json();
                if (result.success) {
                    setNotifications(result.data);
                } else {
                    setError(result.message || 'Failed to fetch notifications');
                }
            } catch (err) {
                console.error('Error fetching notifications:', err);
                setError('An error occurred while fetching notifications.');
            } finally {
                setLoading(false);
            }
        };

        fetchNotifications();
    }, [apiUrl]);

    const handleViewReport = async (notificationId, reportId) => {
        try {
            const token = localStorage.getItem('token');
            // Mark as read
            await fetch(`${apiUrl}/api/notifications/${notificationId}/read`, {
                method: 'PATCH',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            // Update local state and header
            setNotifications(prev => prev.map(n => n._id === notificationId ? { ...n, isRead: true } : n));
            window.dispatchEvent(new Event('notificationUpdated'));
            
            // Navigate to report view
            if (reportId) {
                navigate(`/parent/report/${reportId}`);
            }
        } catch (err) {
            console.error('Error marking as read:', err);
            // Still navigate even if marking as read fails
            navigate(`/parent/report/${reportId}`);
        }
    };

    const handleDelete = async (notificationId) => {
        try {
            const token = localStorage.getItem('token');
            await fetch(`${apiUrl}/api/notifications/${notificationId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            setNotifications(prev => prev.filter(n => n._id !== notificationId));
            window.dispatchEvent(new Event('notificationUpdated'));
        } catch (err) {
            console.error('Error deleting notification:', err);
        }
    };

    const filteredNotifications = filter === 'unread' 
        ? notifications.filter(n => !n.isRead) 
        : notifications;

    if (loading) {
        return (
            <div className="flex items-center justify-center p-20">
                <div className="w-10 h-10 border-4 border-purple-100 border-t-purple-600 rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            <div className="flex items-center gap-4 mb-2 px-2">
                <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center">
                    <Bell size={24} />
                </div>
                <div>
                    <h3 className="text-xl font-black text-gray-900">Notifications</h3>
                    <p className="text-sm text-gray-400 font-bold uppercase tracking-widest">Stay updated with your child's progress</p>
                </div>
            </div>

            {/* Filter Controls */}
            <div className="flex items-center gap-3 px-2">
                <button
                    onClick={() => setFilter('all')}
                    className={`px-5 py-2 rounded-xl text-sm font-bold transition-all ${filter === 'all' ? 'bg-gray-900 text-white shadow-md' : 'bg-white text-gray-500 hover:bg-gray-50 border border-gray-200'}`}
                >
                    All
                </button>
                <button
                    onClick={() => setFilter('unread')}
                    className={`px-5 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${filter === 'unread' ? 'bg-purple-600 text-white shadow-md shadow-purple-200' : 'bg-white text-gray-500 hover:bg-gray-50 border border-gray-200'}`}
                >
                    Unread
                    {notifications.filter(n => !n.isRead).length > 0 && filter !== 'unread' && (
                        <span className="w-5 h-5 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-[10px]">
                            {notifications.filter(n => !n.isRead).length}
                        </span>
                    )}
                </button>
            </div>

            {error && (
                <div className="p-4 bg-red-50 text-red-600 border border-red-100 rounded-2xl font-bold">
                    {error}
                </div>
            )}

            {filteredNotifications.length === 0 ? (
                <div className="bg-white p-12 rounded-[40px] border border-gray-100 shadow-sm text-center space-y-4">
                    <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto text-gray-300">
                        <Bell size={32} />
                    </div>
                    <h3 className="text-xl font-black text-gray-900">No {filter === 'unread' ? 'Unread ' : 'New '}Notifications 🎉</h3>
                    <p className="text-gray-500 font-medium max-w-sm mx-auto">
                        You're all caught up!
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredNotifications.map((n) => (
                        <div 
                            key={n._id} 
                            className={`bg-white p-6 rounded-[32px] border transition-all duration-300 group hover:shadow-xl hover:shadow-purple-100/50 ${!n.isRead ? 'border-purple-200 bg-purple-50/20' : 'border-gray-100'}`}
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex items-center gap-3">
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${!n.isRead ? 'bg-purple-100 text-purple-600' : 'bg-gray-100 text-gray-400'}`}>
                                        <Bell size={20} />
                                    </div>
                                    {!n.isRead && (
                                        <span className="px-2 py-1 bg-purple-600 text-white text-[10px] font-black uppercase tracking-widest rounded-lg animate-pulse">
                                            New
                                        </span>
                                    )}
                                </div>
                                <button 
                                    onClick={() => handleDelete(n._id)}
                                    className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                                    title="Delete notification"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                            
                            <h4 className={`text-lg transition-colors mb-2 ${!n.isRead ? 'font-black text-gray-900 group-hover:text-purple-700' : 'font-bold text-gray-600'}`}>
                                {n.type === 'REPORT' ? 'New Activity Report' : n.type === 'FEE' ? 'Fee Payment Reminder' : 'Notification'}
                            </h4>
                            
                            <p className={`${!n.isRead ? 'text-gray-500' : 'text-gray-400'} text-sm font-medium mb-6 line-clamp-2`}>
                                {n.message}
                            </p>
                            
                            <div className="flex items-center gap-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-6">
                                <div className="flex items-center gap-1.5">
                                    <Calendar size={12} />
                                    {new Date(n.createdAt).toLocaleDateString()}
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <Clock size={12} />
                                    {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </div>
                            </div>
                            
                            {n.type === 'FEE' ? (
                                <button 
                                        onClick={async () => {
                                            if (!n.isRead) {
                                                const token = localStorage.getItem('token');
                                                await fetch(`${apiUrl}/api/notifications/${n._id}/read`, {
                                                    method: 'PATCH',
                                                    headers: { 'Authorization': `Bearer ${token}` }
                                                });
                                                setNotifications(prev => prev.map(notif => notif._id === n._id ? { ...notif, isRead: true } : notif));
                                                window.dispatchEvent(new Event('notificationUpdated'));
                                            }
                                            navigate('/parent/fees');
                                        }}
                                        className="w-full py-3 bg-amber-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-amber-700 transition-all active:scale-95 shadow-lg shadow-amber-200"
                                >
                                    <IndianRupee size={16} />
                                    Pay Now
                                </button>
                            ) : (
                                <button 
                                    onClick={() => handleViewReport(n._id, n.reportId)}
                                    className="w-full py-3 bg-gray-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-black transition-all active:scale-95 shadow-lg shadow-gray-200"
                                >
                                    <Eye size={16} />
                                    View Report
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ParentNotifications;
