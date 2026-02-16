import { Search, Bell, ChevronDown, Menu as MenuIcon } from 'lucide-react';

const Header = ({ onMenuClick }) => {
    const fullName = localStorage.getItem('fullName') || 'Administrator';
    const role = localStorage.getItem('role') || 'admin';

    // Get first letter for avatar
    const avatarInitial = fullName.charAt(0).toUpperCase();

    // Map role to display label
    const roleLabel = role === 'admin' ? 'Daycare Manager' : (role === 'staff' ? 'Daycare Staff' : 'Parent');

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
                <button className="relative p-2 rounded-full hover:bg-gray-50 transition-colors text-gray-500 hover:text-gray-700">
                    <Bell size={20} />
                    <span className="absolute top-1.5 right-2 w-2 h-2 bg-red-400 rounded-full border-2 border-white"></span>
                </button>

                <div className="flex items-center gap-2 sm:gap-3 pl-4 sm:pl-6 border-l border-gray-100 cursor-pointer group">
                    <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-purple-100 flex items-center justify-center text-purple-700 font-semibold border-2 border-white shadow-sm shrink-0">
                        {avatarInitial}
                    </div>
                    <div className="hidden md:block">
                        <p className="text-sm font-semibold text-gray-700 group-hover:text-purple-700 transition-colors capitalize truncate max-w-[100px]">{fullName}</p>
                        <p className="text-xs text-gray-400">{roleLabel}</p>
                    </div>
                    <ChevronDown size={14} className="text-gray-400 group-hover:text-gray-600 transition-colors" />
                </div>
            </div>
        </header>
    );
};

export default Header;
