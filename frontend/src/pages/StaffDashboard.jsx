import React from 'react';

const StaffDashboard = () => {
    const role = localStorage.getItem('role') || 'Staff';

    return (
        <div className="animate-in fade-in duration-500">
            <div className="mb-4 text-sm font-medium text-blue-600 bg-blue-50 inline-block px-3 py-1 rounded-full border border-blue-100 uppercase tracking-wider">
                {role} Dashboard
            </div>

            <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-gray-100">
                <div className="w-20 h-20 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Welcome to your Staff Dashboard!</h2>
                <p className="text-gray-500 max-w-md mx-auto">
                    We're working hard to bring you the best tools to manage your daycare activities. This module will be available very soon.
                </p>
                <div className="mt-8 flex justify-center gap-4">
                    <div className="h-2 w-24 bg-blue-100 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-500 w-2/3"></div>
                    </div>
                </div>
                <p className="text-xs text-gray-400 mt-2 font-medium">Coming Soon</p>
            </div>
        </div>
    );
};

export default StaffDashboard;
