import React from 'react';
import { Layout } from 'lucide-react';

const ClassroomStatus = () => {
    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-full flex flex-col">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-gray-800">Classroom Status</h3>
            </div>

            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-gray-50/30 rounded-xl border border-gray-100">
                <div className="w-24 h-24 mb-4 rounded-full bg-blue-50 flex items-center justify-center overflow-hidden">
                    {/* Abstract/Icon representation or placeholder image */}
                    <img
                        src="https://images.unsplash.com/photo-1506157786151-b8491531f947?auto=format&fit=crop&q=80&w=200"
                        alt="Empty Classroom"
                        className="w-full h-full object-cover opacity-60"
                    />
                </div>
                <h4 className="text-gray-700 font-semibold mb-2">No classroom updates yet</h4>
                <p className="text-sm text-gray-400 max-w-[200px] leading-relaxed">
                    Live updates from classrooms and activities will appear here.
                </p>
            </div>
        </div>
    );
};

export default ClassroomStatus;
