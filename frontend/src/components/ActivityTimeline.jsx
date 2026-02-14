import React from 'react';
import { Clock } from 'lucide-react';

const ActivityTimeline = () => {
    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-full flex flex-col">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-gray-800">Today at Daycare</h3>
                <span className="text-xs font-medium text-purple-600 bg-purple-50 px-3 py-1 rounded-full border border-purple-100">
                    {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'short' })}
                </span>
            </div>

            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-gray-50/30 rounded-xl border border-gray-100">
                <div className="relative mb-6">
                    <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center text-purple-400">
                        <Clock size={36} />
                    </div>
                    <div className="absolute bottom-0 right-0 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-sm border border-gray-100">
                        <span className="block w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                    </div>
                </div>

                <h4 className="text-gray-700 font-semibold mb-2">No activities recorded today</h4>
                <p className="text-sm text-gray-400 max-w-xs leading-relaxed">
                    Check-ins, meals, naps, and playful moments will appear here as they happen.
                </p>
            </div>
        </div>
    );
};

export default ActivityTimeline;
