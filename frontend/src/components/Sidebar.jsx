import React from 'react';
import { useNavigate, NavLink } from 'react-router-dom';
import {
    LayoutDashboard,
    Users,
    UserCheck,
    Baby,
    CalendarCheck,
    Banknote,
    FileText,
    Settings,
    LogOut
} from 'lucide-react';

const Sidebar = () => {
    const navigate = useNavigate();
    const role = localStorage.getItem('role') || 'guest';

    const getDashboardPath = () => {
        if (role === 'admin') return '/admin/dashboard';
        if (role === 'staff') return '/staff/dashboard';
        if (role === 'parent') return '/parent/dashboard';
        return '/';
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        navigate('/login');
    };

    const navItems = [
        { icon: LayoutDashboard, label: 'Dashboard', path: getDashboardPath() },
        { icon: Baby, label: 'Children', path: '/children' },
        { icon: UserCheck, label: 'Staff', path: '/staff' },
        { icon: Users, label: 'Parents', path: '/parents' },
        { icon: CalendarCheck, label: 'Attendance', path: '/attendance' },
        { icon: Banknote, label: 'Fees', path: '/fees' },
        { icon: FileText, label: 'Reports', path: '/reports' },
        { icon: Settings, label: 'Settings', path: '/settings' },
    ];

    return (
        <aside className="w-64 bg-white border-r border-gray-100 h-screen fixed left-0 top-0 flex flex-col shadow-sm z-20">
            <div className="p-6 flex items-center gap-3 border-b border-gray-50">
                <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center text-purple-600 font-bold">
                    D
                </div>
                <h1 className="font-bold text-xl text-gray-800 tracking-tight">Daycare<span className="text-purple-600 capitalize">{role === 'guest' ? '' : role}</span></h1>
            </div>

            <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-1">
                {navItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${isActive
                                ? 'bg-purple-50 text-purple-700 font-medium'
                                : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                            }`
                        }
                    >
                        {({ isActive }) => (
                            <>
                                <item.icon
                                    size={20}
                                    className={isActive ? 'text-purple-600' : 'text-gray-400 group-hover:text-gray-600'}
                                />
                                {item.label}
                            </>
                        )}
                    </NavLink>
                ))}
            </nav>

            <div className="p-4 border-t border-gray-50">
                <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 px-4 py-3 w-full text-left text-red-500 hover:bg-red-50 rounded-xl transition-colors duration-200"
                >
                    <LogOut size={20} />
                    <span className="font-medium">Logout</span>
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
