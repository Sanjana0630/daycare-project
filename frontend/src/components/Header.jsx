import React, { useState, useRef, useEffect } from 'react';
import { Search, Bell, ChevronDown, Menu as MenuIcon, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Header = ({ onMenuClick }) => {
    const navigate = useNavigate();
    const fullName = localStorage.getItem('fullName') || 'Administrator';
    const role = localStorage.getItem('role') || 'admin';
    const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const dropdownRef = useRef(null);

    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5005';

    // Fetch unread notifications count if parent
    useEffect(() => {
        const fetchUnreadCount = async () => {
            if (role !== 'parent') return;
            try {
                const token = localStorage.getItem('token');
                const res = await fetch(`${apiUrl}/api/notifications/unread-count`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const data = await res.json();
                if (data.success) {
                    setUnreadCount(data.count);
                }
            } catch (err) {
                console.error('Error fetching unread count:', err);
            }
        };

        fetchUnreadCount();
        // Optional: set an interval to check for new notifications
        const interval = setInterval(fetchUnreadCount, 30000); // every 30 seconds

        // Custom event listener for instant updates
        const handleNotificationUpdate = () => {
            fetchUnreadCount();
        };
        window.addEventListener('notificationUpdated', handleNotificationUpdate);

        return () => {
            clearInterval(interval);
            window.removeEventListener('notificationUpdated', handleNotificationUpdate);
        };
    }, [role, apiUrl]);

    // Get first letter for avatar
    const avatarInitial = fullName.charAt(0).toUpperCase();

    // Map role to display label
    const roleLabel = role === 'admin' ? 'Daycare Manager' : (role === 'staff' ? 'Daycare Staff' : 'Parent');

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsProfileMenuOpen(false);
            }
        };

        if (isProfileMenuOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isProfileMenuOpen]);

    const handleProfileClick = () => {
        setIsProfileMenuOpen(false);
        const profilePath = role === 'admin' ? '/admin/profile' :
            role === 'staff' ? '/staff/profile' :
                '/parent/profile';
        navigate(profilePath);
    };

    const handleNotificationClick = () => {
        if (role === 'parent') {
            navigate('/parent/notifications');
        } else if (role === 'staff') {
            navigate('/staff/notifications');
        }
    };

    return (
        <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-4 sm:px-8 sticky top-0 z-10">
            <div className="flex items-center gap-4 flex-1">
                {/* Hamburger Menu - Only on small screens */}
                <button
                    onClick={onMenuClick}
                    className="p-2 -ml-2 text-gray-400 hover:text-gray-600 lg:hidden"
                >
                    <MenuIcon size={24} />
                </button>

                {/* Search Bar */}
                <div className="flex-1 max-w-xl hidden sm:block">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search children, staff..."
                            className="w-full pl-10 pr-4 py-2 rounded-full bg-gray-50 border-none focus:ring-2 focus:ring-purple-100 focus:bg-white transition-all duration-200 text-gray-700 placeholder-gray-400 outline-none"
                        />
                    </div>
                </div>
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-4 sm:gap-6">
                <button 
                    onClick={handleNotificationClick}
                    className="relative p-2 rounded-full hover:bg-gray-50 transition-colors text-gray-500 hover:text-gray-700"
                >
                    <Bell size={20} />
                    {unreadCount > 0 && (
                        <span className="absolute top-0.5 right-0.5 min-w-[20px] h-5 px-1 bg-red-500 text-white text-[10px] font-bold rounded-full border-2 border-white flex items-center justify-center">
                            {unreadCount}
                        </span>
                    )}
                </button>

                <div className="relative" ref={dropdownRef}>
                    <div
                        onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                        className="flex items-center gap-2 sm:gap-3 pl-4 sm:pl-6 border-l border-gray-100 cursor-pointer group"
                    >
                        <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-purple-100 flex items-center justify-center text-purple-700 font-semibold border-2 border-white shadow-sm shrink-0">
                            {avatarInitial}
                        </div>
                        <div className="hidden md:block">
                            <p className="text-sm font-semibold text-gray-700 group-hover:text-purple-700 transition-colors capitalize truncate max-w-[100px]">{fullName}</p>
                            <p className="text-xs text-gray-400">{roleLabel}</p>
                        </div>
                        <ChevronDown size={14} className={`text-gray-400 group-hover:text-gray-600 transition-transform duration-200 ${isProfileMenuOpen ? 'rotate-180' : ''}`} />
                    </div>

                    {/* Dropdown Menu */}
                    {isProfileMenuOpen && (
                        <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                            <div className="px-4 py-3 border-b border-gray-50 bg-gray-50/50 rounded-t-xl">
                                <p className="text-sm font-bold text-gray-900 capitalize truncate">{fullName}</p>
                                <p className="text-[10px] font-bold text-purple-600 uppercase tracking-wider">{roleLabel}</p>
                            </div>
                            <div className="p-1">
                                <button
                                    onClick={handleProfileClick}
                                    className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-600 hover:bg-purple-50 hover:text-purple-700 rounded-lg transition-colors text-left font-medium"
                                >
                                    <User size={16} />
                                    Profile
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Header;
