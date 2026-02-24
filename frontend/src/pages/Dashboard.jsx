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
