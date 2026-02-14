import React from 'react';
import { Bell } from 'lucide-react';

const Alerts = () => {
    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-gray-800">Alerts & Notifications</h3>
                <button className="text-sm text-purple-600 hover:text-purple-700 font-medium">View All</button>
            </div>

            <div className="flex flex-col items-center justify-center text-center p-8 bg-gray-50/30 rounded-xl border border-gray-100">
                <div className="w-16 h-16 bg-yellow-50 rounded-full flex items-center justify-center mb-3 text-yellow-500 shadow-sm">
                    <Bell size={28} />
                </div>
                <p className="text-gray-600 font-medium mb-1">No new alerts</p>
                <p className="text-sm text-gray-400">You're all caught up!</p>
            </div>
        </div>
    );
};

export default Alerts;
