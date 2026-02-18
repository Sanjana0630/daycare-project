import React, { useState, useEffect } from 'react';
import { Users, UserCheck, Calendar, AlertCircle } from 'lucide-react';

const StatsStrip = () => {
    const [childrenCount, setChildrenCount] = useState(0);

    useEffect(() => {
        const fetchChildrenCount = async () => {
            try {
                const apiUrl = import.meta.env.VITE_API_URL;
                const response = await fetch(`${apiUrl}/api/children`);
                const data = await response.json();
                if (data.success) {
                    setChildrenCount(data.count || data.data.length);
                }
            } catch (error) {
                console.error('Error fetching children count:', error);
            }
        };

        fetchChildrenCount();
    }, []);

    const stats = [
        {
            label: 'Children',
            value: childrenCount.toString(),
            change: '+3 this week', // Keeping static for now as per user request to not change too much
            icon: Users,
            color: 'bg-purple-50 text-purple-600',
            borderColor: 'border-purple-100'
        },
        {
            label: 'Staff',
            value: '12',
            change: 'All present',
            icon: UserCheck,
            color: 'bg-indigo-50 text-indigo-600',
            borderColor: 'border-indigo-100'
        },
        {
            label: 'Active Sessions',
            value: '8',
            change: 'Ongoing now',
            icon: Calendar,
            color: 'bg-emerald-50 text-emerald-600',
            borderColor: 'border-emerald-100'
        },
        {
            label: 'Alerts',
            value: '2',
            change: 'Requires action',
            icon: AlertCircle,
            color: 'bg-rose-50 text-rose-600',
            borderColor: 'border-rose-100'
        }
    ];

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat, index) => (
                <div
                    key={index}
                    className={`bg-white p-6 rounded-2xl shadow-sm border ${stat.borderColor} transition-all duration-300 hover:shadow-md active:scale-[0.98] group`}
                >
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-500 mb-1">{stat.label}</p>
                            <h3 className="text-2xl font-bold text-gray-800">{stat.value}</h3>
                            <p className="text-xs font-medium text-gray-400 mt-1">{stat.change}</p>
                        </div>
                        <div className={`p-3 rounded-xl ${stat.color} transition-colors duration-300 group-hover:bg-opacity-80`}>
                            <stat.icon size={20} />
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default StatsStrip;
