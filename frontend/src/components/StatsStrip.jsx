import React from 'react';
import { Users, UserCheck, Calendar, Wallet } from 'lucide-react';

const StatCard = ({ icon: Icon, label, value, subtext, colorClass, iconColorClass }) => (
    <div className="flex items-center p-5 bg-white rounded-2xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-gray-50 hover:shadow-md transition-shadow duration-300 flex-1 min-w-[220px]">
        <div className={`w-14 h-14 rounded-xl flex items-center justify-center mr-5 ${colorClass}`}>
            <Icon size={26} className={iconColorClass} />
        </div>
        <div>
            <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-1">{label}</p>
            <div className="flex items-baseline gap-2">
                <h3 className="text-3xl font-bold text-gray-800">{value}</h3>
                {subtext && <span className="text-xs text-gray-400 font-medium">{subtext}</span>}
            </div>
        </div>
    </div>
);

const StatsStrip = () => {
    return (
        <div className="flex flex-wrap gap-5 mb-8">
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
