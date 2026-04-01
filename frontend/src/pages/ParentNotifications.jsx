import React, { useState, useEffect } from 'react';
import { Bell, Eye, Calendar, Clock, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ParentNotifications = () => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
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
            
            // Navigate to report view
            navigate(`/parent/report/${reportId}`);
        } catch (err) {
            console.error('Error marking as read:', err);
            // Still navigate even if marking as read fails
            navigate(`/parent/report/${reportId}`);
        }
    };

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

            {error && (
                <div className="p-4 bg-red-50 text-red-600 border border-red-100 rounded-2xl font-bold">
                    {error}
                </div>
            )}

            {notifications.length === 0 ? (
                <div className="bg-white p-12 rounded-[40px] border border-gray-100 shadow-sm text-center space-y-4">
                    <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto text-gray-300">
                        <Bell size={32} />
                    </div>
                    <h3 className="text-xl font-black text-gray-900">No Notifications Yet</h3>
                    <p className="text-gray-500 font-medium max-w-sm mx-auto">
                        We'll notify you here when there are new reports or updates regarding your child.
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {notifications.map((n) => (
                        <div 
                            key={n._id} 
                            className={`bg-white p-6 rounded-[32px] border transition-all duration-300 group hover:shadow-xl hover:shadow-purple-100/50 ${!n.isRead ? 'border-purple-200 bg-purple-50/20' : 'border-gray-100'}`}
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${!n.isRead ? 'bg-purple-100 text-purple-600' : 'bg-gray-100 text-gray-400'}`}>
                                    <Bell size={20} />
                                </div>
                                {!n.isRead && (
                                    <span className="px-2 py-1 bg-purple-600 text-white text-[10px] font-black uppercase tracking-widest rounded-lg animate-pulse">
                                        New
                                    </span>
                                )}
                            </div>
                            
                            <h4 className="text-lg font-black text-gray-900 mb-2 group-hover:text-purple-700 transition-colors">
                                {n.type === 'REPORT' ? 'New Activity Report' : 'Notification'}
                            </h4>
                            
                            <p className="text-gray-500 text-sm font-medium mb-6 line-clamp-2">
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
                            
                            <button 
                                onClick={() => handleViewReport(n._id, n.reportId)}
                                className="w-full py-3 bg-gray-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-black transition-all active:scale-95 shadow-lg shadow-gray-200"
                            >
                                <Eye size={16} />
                                View Report
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ParentNotifications;
