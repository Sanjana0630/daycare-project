import React from 'react';
import { Users, UserCheck, Calendar, Wallet } from 'lucide-react';

const StatCard = ({ icon: Icon, label, value, subtext, colorClass, iconColorClass }) => (
    <div className="flex items-center p-4 sm:p-5 bg-white rounded-2xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-gray-50 hover:shadow-md transition-shadow duration-300 w-full">
        <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl flex items-center justify-center mr-4 sm:mr-5 shrink-0 ${colorClass}`}>
            <Icon size={24} className={iconColorClass} />
        </div>
        <div className="min-w-0">
            <p className="text-[10px] sm:text-xs text-gray-500 font-semibold uppercase tracking-wider mb-0.5 sm:mb-1 truncate">{label}</p>
            <div className="flex items-baseline gap-2">
                <h3 className="text-2xl sm:text-3xl font-bold text-gray-800">{value}</h3>
                {subtext && <span className="text-[10px] sm:text-xs text-gray-400 font-medium truncate">{subtext}</span>}
            </div>
        </div>
    </div>
);

const StatsStrip = () => {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 mb-8">
            <StatCard
                icon={Users}
                label="Total Children"
                value="0"
                colorClass="bg-orange-50"
                iconColorClass="text-orange-500"
            />
            <StatCard
                icon={UserCheck}
                label="Active Staff"
                value="0"
                colorClass="bg-teal-50"
                iconColorClass="text-teal-600"
            />
            <StatCard
                icon={Calendar}
                label="Today Attendance"
                value="0"
                subtext="/ 0"
                colorClass="bg-blue-50"
                iconColorClass="text-blue-500"
            />
            <StatCard
                icon={Wallet}
                label="Pending Fees"
                value="₹0"
                colorClass="bg-purple-50"
                iconColorClass="text-purple-600"
            />
        </div>
    );
};

export default StatsStrip;
