import React from 'react';

const ParentDashboard = () => {
    const role = localStorage.getItem('role') || 'Parent';

    return (
        <div className="animate-in fade-in duration-500">
            <div className="mb-4 text-sm font-medium text-emerald-600 bg-emerald-50 inline-block px-3 py-1 rounded-full border border-emerald-100 uppercase tracking-wider">
                {role} Dashboard
            </div>

            <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-gray-100">
                <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Hello Parent!</h2>
                <p className="text-gray-500 max-w-md mx-auto">
                    Stay connected with your child's progress and daycare updates. Your personal dashboard is currently under development.
                </p>
                <div className="mt-8 flex justify-center gap-4">
                    <div className="h-2 w-24 bg-emerald-100 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500 w-1/2"></div>
                    </div>
                </div>
                <p className="text-xs text-gray-400 mt-2 font-medium">Coming Soon</p>
            </div>
        </div>
    );
};

export default ParentDashboard;
