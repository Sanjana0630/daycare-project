import React from 'react';
import { useNavigate } from 'react-router-dom';
import { UserPlus, UserCheck, CalendarPlus, CreditCard } from 'lucide-react';

const ActionButton = ({ icon: Icon, label, color, onClick }) => (
    <button
        onClick={onClick}
        className="flex flex-col items-center justify-center p-4 rounded-xl border border-gray-100 bg-white shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-200 group w-full"
    >
        <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 ${color} group-hover:scale-110 transition-transform`}>
            <Icon size={24} className="text-gray-700" />
        </div>
        <span className="text-sm font-medium text-gray-700">{label}</span>
    </button>
);

const QuickActions = () => {
    const navigate = useNavigate();

    return (
        <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="text-base sm:text-lg font-bold text-gray-800 mb-4 sm:mb-6">Quick Actions</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
                <ActionButton
                    icon={UserPlus}
                    label="Add Child"
                    color="bg-[var(--color-accent-peach)]"
                    onClick={() => navigate('/admin/children/add')}
                />
                <ActionButton
                    icon={UserCheck}
                    label="Add Staff"
                    color="bg-[var(--color-accent-mint)]"
                    onClick={() => navigate('/admin/staff/add')}
                />
                <ActionButton
                    icon={CalendarPlus}
                    label="Mark Staff Attendance"
                    color="bg-[var(--color-accent-sky)]"
                    onClick={() => navigate('/admin/attendance/staff')}
                />
                <ActionButton
                    icon={CreditCard}
                    label="Update Fees"
                    color="bg-[var(--color-accent-lavender)]"
                />
            </div>
        </div>
    );
};

export default QuickActions;
