import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard,
    Users,
    UserSquare2,
    UserCircle2,
    CalendarCheck,
    CreditCard,
    BarChart3,
    Settings,
    LogOut,
    X,
    Baby
} from 'lucide-react';

const Sidebar = ({ isOpen, setIsOpen }) => {
    const navigate = useNavigate();
    const role = localStorage.getItem('role') || 'admin';

    const handleLogout = () => {
        localStorage.clear();
        navigate('/login');
    };

    const navItems = [
        { name: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
        { name: 'Children', icon: Users, path: '/children' },
        { name: 'Staff', icon: UserSquare2, path: '/staff' },
        { name: 'Parents', icon: UserCircle2, path: '/parents' },
        { name: 'Attendance', icon: CalendarCheck, path: '/attendance' },
        { name: 'Fees', icon: CreditCard, path: '/fees' },
        { name: 'Reports', icon: BarChart3, path: '/reports' },
        { name: 'Settings', icon: Settings, path: '/settings' },
    ];

    return (
        <aside
            className={`fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-gray-100 transition-transform duration-300 lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'
                }`}
        >
            {/* Sidebar Header */}
            <div className="h-16 flex items-center justify-between px-6 border-b border-gray-100">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-lg flex items-center justify-center text-white shadow-md">
                        <Baby size={18} />
                    </div>
                    <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-700 to-indigo-700">
                        Daycare
                    </span>
                </div>
                <button
                    onClick={() => setIsOpen(false)}
                    className="p-2 -mr-2 text-gray-400 hover:text-gray-600 lg:hidden"
                >
                    <X size={20} />
                </button>
            </div>

            {/* Navigation Links */}
            <nav className="flex-1 px-4 py-6 space-y-1">
                {navItems.map((item) => (
                    <NavLink
                        key={item.name}
                        to={item.path}
                        onClick={() => setIsOpen(false)}
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${isActive
                                ? 'bg-purple-50 text-purple-700 shadow-sm border border-purple-100'
                                : 'text-gray-500 hover:bg-gray-50 hover:text-purple-600 border border-transparent'
                            }`
                        }
                    >
                        <item.icon size={18} />
                        {item.name}
                    </NavLink>
                ))}
            </nav>

            {/* Logout Button */}
            <div className="p-4 border-t border-gray-100">
                <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 w-full px-3 py-2.5 text-sm font-medium text-rose-600 hover:bg-rose-50 rounded-xl transition-all duration-200"
                >
                    <LogOut size={18} />
                    Logout
                </button>
            </div>

            {/* Role Badge */}
            <div className="p-6">
                <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                    <p className="text-[10px] uppercase tracking-wider font-bold text-gray-400 mb-1">Current Role</p>
                    <p className="text-sm font-bold text-gray-700 capitalize">{role}</p>
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;
