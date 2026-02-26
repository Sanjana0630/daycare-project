import React, { useState, useEffect } from 'react';
import { UserCheck, UserX, Mail, Calendar, CheckCircle, Clock } from 'lucide-react';
import { BASE_URL } from '../config';

const StaffApproval = () => {
    const [pendingStaff, setPendingStaff] = useState([]);
    const [activeStaff, setActiveStaff] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [actionLoading, setActionLoading] = useState(null);

    useEffect(() => {
        fetchStaff();
    }, []);

    const fetchStaff = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const headers = { 'Authorization': `Bearer ${token}` };

            const [pendingRes, activeRes] = await Promise.all([
                fetch(`${BASE_URL}/api/admin/staff/pending`, { headers }),
                fetch(`${BASE_URL}/api/admin/staff/active`, { headers })
            ]);

            const pendingData = await pendingRes.json();
            const activeData = await activeRes.json();

            if (pendingData.success) setPendingStaff(pendingData.data);
            if (activeData.success) setActiveStaff(activeData.data);
        } catch (err) {
            setError('Failed to fetch staff data');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (id, action) => {
        setActionLoading(id);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${BASE_URL}/api/admin/staff/${action}/${id}`, {
                method: 'PATCH',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            const data = await response.json();
            if (data.success) {
                fetchStaff(); // Refresh lists
            } else {
                alert(data.message || `Failed to ${action} staff`);
            }
        } catch (err) {
            alert(`Error: ${err.message}`);
        } finally {
            setActionLoading(null);
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
                <p className="text-gray-500 font-medium animate-pulse">Loading staff requests...</p>
            </div>
        </div>
    );

    return (
        <div className="space-y-10 animate-in fade-in duration-700">
            {/* Header */}
            <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm">
                <h2 className="text-3xl font-black text-gray-900">Staff Management</h2>
                <p className="text-gray-500 font-medium">Approve new registrations and manage active team members.</p>
            </div>

            {/* Pending Requests */}
            <div className="space-y-4">
                <div className="flex items-center gap-3 px-4">
                    <Clock className="text-amber-500" size={24} />
                    <h3 className="text-xl font-bold text-gray-800">Pending Staff Requests</h3>
                    <span className="px-2.5 py-0.5 bg-amber-50 text-amber-600 text-xs font-black rounded-full border border-amber-100">
                        {pendingStaff.length} NEW
                    </span>
                </div>

                <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-xl overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-gray-50/50 border-b border-gray-100">
                                    <th className="px-8 py-5 text-[11px] font-black text-gray-400 uppercase tracking-widest">Staff Info</th>
                                    <th className="px-8 py-5 text-[11px] font-black text-gray-400 uppercase tracking-widest">Registration Date</th>
                                    <th className="px-8 py-5 text-[11px] font-black text-gray-400 uppercase tracking-widest text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {pendingStaff.length === 0 ? (
                                    <tr>
                                        <td colSpan="3" className="px-8 py-10 text-center text-gray-400 font-medium italic">
                                            No pending requests at the moment.
                                        </td>
                                    </tr>
                                ) : (
                                    pendingStaff.map((staff) => (
                                        <tr key={staff._id} className="hover:bg-gray-50/50 transition-colors group">
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 bg-purple-100 rounded-2xl flex items-center justify-center text-purple-700 font-black text-lg">
                                                        {staff.fullName[0].toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <div className="font-black text-gray-900">{staff.fullName}</div>
                                                        <div className="text-xs font-bold text-gray-400 flex items-center gap-1">
                                                            <Mail size={12} /> {staff.email}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="inline-flex items-center gap-2 px-3 py-1 bg-gray-100 rounded-full text-xs font-bold text-gray-600">
                                                    <Calendar size={14} />
                                                    {new Date(staff.createdAt).toLocaleDateString()}
                                                </div>
                                            </td>
                                            <td className="px-8 py-6 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={() => handleAction(staff._id, 'approve')}
                                                        disabled={actionLoading === staff._id}
                                                        className="px-4 py-2 bg-green-600 text-white text-xs font-black rounded-xl hover:bg-green-700 transition-all flex items-center gap-2 shadow-lg shadow-green-100 disabled:opacity-50"
                                                    >
                                                        <UserCheck size={16} /> APPROVE
                                                    </button>
                                                    <button
                                                        onClick={() => handleAction(staff._id, 'reject')}
                                                        disabled={actionLoading === staff._id}
                                                        className="px-4 py-2 bg-rose-50 text-rose-600 border border-rose-100 text-xs font-black rounded-xl hover:bg-rose-100 transition-all flex items-center gap-2 disabled:opacity-50"
                                                    >
                                                        <UserX size={16} /> REJECT
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Active Staff */}
            <div className="space-y-4">
                <div className="flex items-center gap-3 px-4">
                    <CheckCircle className="text-green-500" size={24} />
                    <h3 className="text-xl font-bold text-gray-800">Approved Staff Members</h3>
                </div>

                <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-gray-50/50 border-b border-gray-100">
                                    <th className="px-8 py-5 text-[11px] font-black text-gray-400 uppercase tracking-widest">Name</th>
                                    <th className="px-8 py-5 text-[11px] font-black text-gray-400 uppercase tracking-widest">Email</th>
                                    <th className="px-8 py-5 text-[11px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                                    <th className="px-8 py-5 text-[11px] font-black text-gray-400 uppercase tracking-widest">Joining Date</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {activeStaff.length === 0 ? (
                                    <tr>
                                        <td colSpan="4" className="px-8 py-10 text-center text-gray-400 font-medium italic">
                                            No active staff members found.
                                        </td>
                                    </tr>
                                ) : (
                                    activeStaff.map((staff) => (
                                        <tr key={staff._id} className="hover:bg-gray-50/50 transition-colors">
                                            <td className="px-8 py-6">
                                                <div className="font-black text-gray-900">{staff.fullName}</div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="text-sm font-medium text-gray-600">{staff.email}</div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <span className="px-3 py-1 bg-green-50 text-green-600 text-[10px] font-black rounded-full border border-green-100 uppercase tracking-wider">
                                                    Active
                                                </span>
                                            </td>
                                            <td className="px-8 py-6 text-gray-500 text-sm font-medium">
                                                {new Date(staff.createdAt).toLocaleDateString()}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StaffApproval;
