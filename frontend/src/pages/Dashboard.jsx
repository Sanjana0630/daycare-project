import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import HeroSection from '../components/HeroSection';
import StatsStrip from '../components/StatsStrip';
import QuickActions from '../components/QuickActions';
import ActivityTimeline from '../components/ActivityTimeline';
import ClassroomStatus from '../components/ClassroomStatus';
import Alerts from '../components/Alerts';

const Dashboard = () => {
    const role = localStorage.getItem('role') || 'Guest';
    const status = localStorage.getItem('status');

    if (role === 'staff' && status === 'pending') {
        return (
            <div className="flex items-center justify-center min-h-[70vh] animate-in fade-in duration-700">
                <div className="max-w-md w-full bg-white p-12 rounded-[3rem] border border-gray-100 shadow-2xl shadow-purple-100 text-center space-y-8">
                    <div className="w-24 h-24 bg-amber-50 rounded-full flex items-center justify-center mx-auto ring-8 ring-amber-50/50">
                        <div className="w-12 h-12 border-4 border-amber-200 border-t-amber-600 rounded-full animate-spin"></div>
                    </div>
                    <div className="space-y-3">
                        <h2 className="text-3xl font-black text-gray-900">Account Pending</h2>
                        <p className="text-gray-500 font-medium leading-relaxed">
                            Your registration as <span className="text-purple-600 font-bold">Staff</span> is currently being reviewed by the administration.
                        </p>
                    </div>
                    <div className="p-6 bg-gray-50 rounded-[2rem] border border-gray-100">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Notice</p>
                        <p className="text-sm text-gray-600 font-medium">Please check back soon. You will have full access once your account is approved.</p>
                    </div>
                    <button
                        onClick={() => { localStorage.clear(); window.location.href = '/login'; }}
                        className="text-sm font-black text-purple-600 hover:text-purple-700 transition-colors uppercase tracking-widest"
                    >
                        Switch Account / Logout
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="animate-in fade-in duration-500">
            <div className="mb-4 text-sm font-medium text-purple-600 bg-purple-50 inline-block px-3 py-1 rounded-full border border-purple-100 uppercase tracking-wider">
                {role} Dashboard
            </div>
            <HeroSection />

            <StatsStrip />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                <div className="lg:col-span-2">
                    <QuickActions />
                    <div className="mt-8">
                        <Alerts />
                    </div>
                </div>
                <div className="lg:col-span-1 h-full">
                    <ActivityTimeline />
                </div>
            </div>

            <div className="grid grid-cols-1 mb-8">
                <ClassroomStatus />
            </div>
        </div>
    );
};

export default Dashboard;
