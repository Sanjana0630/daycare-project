import React, { useState, useRef, useEffect } from 'react';
import { Search, Bell, ChevronDown, Menu as MenuIcon, User, Users, GraduationCap, Briefcase } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Header = ({ onMenuClick }) => {
    const navigate = useNavigate();
    const fullName = localStorage.getItem('fullName') || 'Administrator';
    const role = localStorage.getItem('role') || 'admin';
    const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const dropdownRef = useRef(null);
    const searchRef = useRef(null);

    // Search functionality state
    const [searchQuery, setSearchQuery] = useState("");
    const [isSearchFocused, setIsSearchFocused] = useState(false);
    const [allData, setAllData] = useState({ children: [], parents: [], staff: [] });
    const [filteredResults, setFilteredResults] = useState({ children: [], parents: [], staff: [] });

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
        const interval = setInterval(fetchUnreadCount, 30000); // every 30 seconds

        const handleNotificationUpdate = () => {
            fetchUnreadCount();
        };
        window.addEventListener('notificationUpdated', handleNotificationUpdate);

        return () => {
            clearInterval(interval);
            window.removeEventListener('notificationUpdated', handleNotificationUpdate);
        };
    }, [role, apiUrl]);

    // Fetch searchable data for Admin/Staff
    useEffect(() => {
        const fetchSearchData = async () => {
            if (role !== 'admin' && role !== 'staff') return;
            try {
                const token = localStorage.getItem('token');
                const config = { headers: { 'Authorization': `Bearer ${token}` } };
                
                if (role === 'admin') {
                    const [childrenRes, parentsRes, staffRes] = await Promise.all([
                        axios.get(`${apiUrl}/api/children`, config),
                        axios.get(`${apiUrl}/api/admin/parents`, config),
                        axios.get(`${apiUrl}/api/admin/staff/active`, config)
                    ]);

                    setAllData({
                        children: childrenRes.data.data || [],
                        parents: parentsRes.data.data || [],
                        staff: staffRes.data.data || []
                    });
                } else if (role === 'staff') {
                    const childrenRes = await axios.get(`${apiUrl}/api/staff/assigned-children`, config);

                    setAllData({
                        children: childrenRes.data.data || [],
                        parents: [],
                        staff: []
                    });
                }
            } catch (err) {
                console.error('Error fetching search data:', err);
            }
        };

        fetchSearchData();
    }, [role, apiUrl]);

    // Handle searching/filtering logic
    useEffect(() => {
        if (!searchQuery.trim()) {
            setFilteredResults({ children: [], parents: [], staff: [] });
            return;
        }

        const query = searchQuery.toLowerCase().trim();
        const results = {
            children: allData.children.filter(c => c.childName?.toLowerCase().includes(query)).slice(0, 5),
            parents: allData.parents.filter(p => p.fullName?.toLowerCase().includes(query)).slice(0, 5),
            staff: allData.staff.filter(s => s.fullName?.toLowerCase().includes(query)).slice(0, 5)
        };

        setFilteredResults(results);
    }, [searchQuery, allData]);

    const handleResultClick = (type, item) => {
        setSearchQuery("");
        setIsSearchFocused(false);
        
        if (role === 'admin') {
            switch (type) {
                case 'child':
                    navigate(`/children`);
                    break;
                case 'parent':
                    navigate(`/parents`);
                    break;
                case 'staff':
                    navigate(`/staff`);
                    break;
                default:
                    break;
            }
        } else if (role === 'staff') {
            switch (type) {
                case 'child':
                    navigate(`/staff/my-children`);
                    break;
                default:
                    break;
            }
        }
    };

    // Click outside search results to close
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (searchRef.current && !searchRef.current.contains(event.target)) {
                setIsSearchFocused(false);
            }
        };
        if (isSearchFocused) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isSearchFocused]);

    const avatarInitial = fullName.charAt(0).toUpperCase();

    const roleLabel = role === 'admin' ? 'Daycare Manager' : (role === 'staff' ? 'Daycare Staff' : 'Parent');

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

    const hasResults = filteredResults.children.length > 0 || 
                     filteredResults.parents.length > 0 || 
                     filteredResults.staff.length > 0;

    return (
        <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-4 sm:px-8 sticky top-0 z-40">
            <div className="flex items-center gap-4 flex-1">
                <button
                    onClick={onMenuClick}
                    className="p-2 -ml-2 text-gray-400 hover:text-gray-600 lg:hidden"
                >
                    <MenuIcon size={24} />
                </button>

                {/* Search Bar */}
                {(role === 'admin' || role === 'staff') && (
                    <div className="flex-1 max-w-xl hidden sm:block relative" ref={searchRef}>
                        <div className="relative">
                            <Search className={`absolute left-3 top-1/2 -translate-y-1/2 transition-colors ${isSearchFocused ? 'text-purple-500' : 'text-gray-400'}`} size={18} />
                            <input
                                type="text"
                                placeholder={role === 'admin' ? "Search children, parents, staff..." : "Search children..."}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onFocus={() => setIsSearchFocused(true)}
                                className="w-full pl-10 pr-4 py-2 rounded-full bg-gray-50 border-none focus:ring-2 focus:ring-purple-100 focus:bg-white transition-all duration-200 text-gray-700 placeholder-gray-400 outline-none"
                            />
                        </div>

                        {/* Search Results Dropdown */}
                        {isSearchFocused && searchQuery.trim() && (
                            <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-gray-100 py-2 max-h-[400px] overflow-y-auto animate-in fade-in slide-in-from-top-2 duration-200 z-50">
                                {!hasResults ? (
                                    <div className="p-8 text-center">
                                        <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3">
                                            <Search className="text-gray-300" size={20} />
                                        </div>
                                        <p className="text-sm font-medium text-gray-500">No results found for "{searchQuery}"</p>
                                    </div>
                                ) : (
                                    <div className="p-2 space-y-4">
                                        {/* Children Results */}
                                        {filteredResults.children.length > 0 && (
                                            <div>
                                                <p className="px-3 text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 flex items-center gap-2">
                                                    <GraduationCap size={12} /> Children
                                                </p>
                                                {filteredResults.children.map(child => (
                                                    <div 
                                                        key={child._id}
                                                        onClick={() => handleResultClick('child', child)}
                                                        className="flex items-center gap-3 px-3 py-2 hover:bg-purple-50 rounded-xl cursor-pointer group transition-colors"
                                                    >
                                                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                                                            {child.childName.charAt(0)}
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-bold text-gray-700 group-hover:text-purple-700">{child.childName}</p>
                                                            <p className="text-xs text-gray-400 font-medium">{child.class} • {child.parentName}</p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {/* Staff Results */}
                                        {filteredResults.staff.length > 0 && (
                                            <div>
                                                <p className="px-3 text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 flex items-center gap-2">
                                                    <Briefcase size={12} /> Staff
                                                </p>
                                                {filteredResults.staff.map(member => (
                                                    <div 
                                                        key={member._id}
                                                        onClick={() => handleResultClick('staff', member)}
                                                        className="flex items-center gap-3 px-3 py-2 hover:bg-purple-50 rounded-xl cursor-pointer group transition-colors"
                                                    >
                                                        <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                                                            {member.fullName.charAt(0)}
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-bold text-gray-700 group-hover:text-purple-700">{member.fullName}</p>
                                                            <p className="text-xs text-gray-400 font-medium capitalize">{member.role}</p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {/* Parent Results */}
                                        {filteredResults.parents.length > 0 && (
                                            <div>
                                                <p className="px-3 text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 flex items-center gap-2">
                                                    <Users size={12} /> Parents
                                                </p>
                                                {filteredResults.parents.map(parent => (
                                                    <div 
                                                        key={parent._id}
                                                        onClick={() => handleResultClick('parent', parent)}
                                                        className="flex items-center gap-3 px-3 py-2 hover:bg-purple-50 rounded-xl cursor-pointer group transition-colors"
                                                    >
                                                        <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-600">
                                                            {parent.fullName.charAt(0)}
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-bold text-gray-700 group-hover:text-purple-700">{parent.fullName}</p>
                                                            <p className="text-xs text-gray-400 font-medium">{parent.email}</p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}
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

