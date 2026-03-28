import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BASE_URL } from '../config';
import {
    Users,
    Search,
    Plus,
    Eye,
    Edit2,
    Trash2,
    X,
    User,
    Calendar,
    Phone,
    Mail,
    Briefcase,
    GraduationCap,
    MapPin,
    ShieldCheck,
    ShieldAlert
} from 'lucide-react';

const Staff = () => {
    const navigate = useNavigate();
    const [staff, setStaff] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [error, setError] = useState('');

    // UI States
    const [selectedMember, setSelectedMember] = useState(null);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isAssignClassModalOpen, setIsAssignClassModalOpen] = useState(false);
    const [selectedClass, setSelectedClass] = useState('');

    const role = localStorage.getItem('role') || '';
    const isAdmin = role.toLowerCase() === 'admin';
    const classOptions = ['Infant Care', 'Toddler', 'Nursery', 'Junior KG', 'Senior KG', 'After School Care'];

    useEffect(() => {
        fetchStaff();
    }, []);

    const fetchStaff = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            // Fetch from admin endpoint which now returns full Staff profiles
            const response = await fetch(`${BASE_URL}/api/admin/staff`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (data.success) {
                setStaff(data.data);
            } else {
                setError(data.message || 'Failed to fetch staff');
            }
        } catch (err) {
            console.error('--- FRONTEND: API error:', err);
            setError('Connection failed. Please check your backend.');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${BASE_URL}/api/admin/staff/${selectedMember._id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await response.json();
            if (data.success) {
                setStaff(staff.filter(s => s._id !== selectedMember._id));
                setIsDeleteModalOpen(false);
                setSelectedMember(null);
            } else {
                alert(data.message || 'Failed to delete');
            }
        } catch (err) {
            alert('Delete failed');
        }
    };

    const handleAssignClass = async () => {
        if (!selectedClass) return alert('Please select a class');
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${BASE_URL}/api/staff/${selectedMember._id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ assignedClass: selectedClass })
            });
            const data = await response.json();
            if (data.success) {
                setStaff(staff.map(s => s._id === selectedMember._id ? { ...s, assignedClass: selectedClass } : s));
                setIsAssignClassModalOpen(false);
                setSelectedMember(null);
                setSelectedClass('');
            } else {
                alert(data.message || 'Failed to assign class');
            }
        } catch (err) {
            alert('Assign class failed');
        }
    };

    const filteredStaff = staff.filter(member => {
        const nameMatch = (member.name || member.fullName || '').toLowerCase().includes(searchTerm.toLowerCase());
        const roleMatch = (member.role || '').toLowerCase().includes(searchTerm.toLowerCase());
        const emailMatch = (member.email || '').toLowerCase().includes(searchTerm.toLowerCase());
        return nameMatch || roleMatch || emailMatch;
    });


    if (loading) return <div className="p-8 text-center text-gray-500">Loading staff data...</div>;

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Staff Members</h2>
                    <p className="text-gray-500">View and manage your active educators and administrative team.</p>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search by name, role or email..."
                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-100 focus:border-purple-400 outline-none transition-all"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 border border-gray-100 rounded-xl text-gray-600 font-medium">
                    <Users size={18} />
                    <span>Total Staff: {filteredStaff.length}</span>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-100">
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Name</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Email</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Phone</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Role</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Class</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Experience</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {filteredStaff.map((member) => (
                                <tr key={member._id} className="hover:bg-purple-50/30 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 font-bold text-xs">
                                                {member.name ? member.name[0].toUpperCase() : (member.fullName ? member.fullName[0].toUpperCase() : 'S')}
                                            </div>
                                            <div>
                                                <div className="font-bold text-gray-900">{member.name || member.fullName || 'N/A'}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-700">
                                        {member.email}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-700">
                                        {member.phone || 'N/A'}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-700 capitalize">
                                        {member.role || 'N/A'}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-700 whitespace-nowrap">
                                        {member.assignedClass ? <span className="font-medium text-purple-700 bg-purple-50 border border-purple-100 px-3 py-1 rounded-full">{member.assignedClass}</span> : <span className="text-gray-400 italic">Unassigned</span>}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-700">
                                        {member.experience || '0'} Years
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center px-3 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${member.status?.toLowerCase() === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                            }`}>
                                            {member.status || 'Pending'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            {isAdmin && (
                                                <button
                                                    onClick={() => { setSelectedMember(member); setSelectedClass(member.assignedClass || ''); setIsAssignClassModalOpen(true); }}
                                                    className="px-3 py-1 text-xs font-medium bg-purple-50 text-purple-700 hover:bg-purple-100 rounded-lg transition-colors"
                                                >
                                                    Assign Class
                                                </button>
                                            )}
                                            <button
                                                onClick={() => { setSelectedMember(member); setIsViewModalOpen(true); }}
                                                className="p-2 text-gray-400 hover:text-purple-600 hover:bg-white rounded-lg transition-all"
                                                title="View/Edit"
                                            >
                                                <Eye size={18} />
                                            </button>
                                            <button
                                                onClick={() => { setSelectedMember(member); setIsDeleteModalOpen(true); }}
                                                className="p-2 text-gray-400 hover:text-red-600 hover:bg-white rounded-lg transition-all"
                                                title="Delete"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {filteredStaff.length === 0 && (
                                <tr>
                                    <td colSpan="7" className="px-6 py-12 text-center text-gray-400 italic">
                                        No staff members found matching your search.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* View Modal */}
            {isViewModalOpen && selectedMember && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm">
                    <div className="bg-white rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
                        <div className="px-6 py-4 bg-purple-600 text-white flex items-center justify-between">
                            <h3 className="text-lg font-bold">Staff Profile</h3>
                            <button onClick={() => setIsViewModalOpen(false)}><X size={20} /></button>
                        </div>
                        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-4">
                                <h4 className="text-primary font-bold border-b pb-2 flex items-center gap-2"><User size={18} /> Personal Info</h4>
                                <div className="space-y-2">
                                    <p><span className="text-gray-400 text-sm">Full Name:</span> <br /><span className="font-medium">{selectedMember.name || selectedMember.fullName || 'N/A'}</span></p>
                                    <p><span className="text-gray-400 text-sm">D.O.B:</span> <br /><span className="font-medium">{selectedMember.dob && !isNaN(new Date(selectedMember.dob)) ? new Date(selectedMember.dob).toLocaleDateString() : 'N/A'}</span></p>
                                    <p><span className="text-gray-400 text-sm">Gender:</span> <br /><span className="font-medium">{selectedMember.gender || 'N/A'}</span></p>
                                    <p><span className="text-gray-400 text-sm">Address:</span> <br /><span className="font-medium text-sm">{selectedMember.address || 'N/A'}</span></p>
                                </div>
                            </div>
                            <div className="space-y-4">
                                <h4 className="text-primary font-bold border-b pb-2 flex items-center gap-2"><Briefcase size={18} /> Professional Info</h4>
                                <div className="space-y-2">
                                    <p><span className="text-gray-400 text-sm">Role:</span> <br /><span className="font-medium capitalize">{selectedMember.role || 'N/A'}</span></p>
                                    <p><span className="text-gray-400 text-sm">Assigned Class:</span> <br /><span className="font-medium">{selectedMember.assignedClass || 'Unassigned'}</span></p>
                                    <p><span className="text-gray-400 text-sm">Qualification:</span> <br /><span className="font-medium">{selectedMember.qualification || 'N/A'}</span></p>
                                    <p><span className="text-gray-400 text-sm">Experience:</span> <br /><span className="font-medium">{selectedMember.experience || 'N/A'}</span></p>
                                    <p><span className="text-gray-400 text-sm">Joining Date:</span> <br /><span className="font-medium">{selectedMember.joiningDate && !isNaN(new Date(selectedMember.joiningDate)) ? new Date(selectedMember.joiningDate).toLocaleDateString() : 'N/A'}</span></p>
                                </div>
                            </div>
                            <div className="md:col-span-2 space-y-4 bg-purple-50 p-4 rounded-2xl border border-purple-100">
                                <h4 className="text-purple-600 font-bold flex items-center gap-2"><Phone size={18} /> Contact & Status</h4>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <p><span className="text-purple-400 text-sm">Email:</span> <br /><span className="font-medium text-purple-900">{selectedMember.email}</span></p>
                                    <p><span className="text-purple-400 text-sm">Phone:</span> <br /><span className="font-medium text-purple-900">{selectedMember.phone}</span></p>
                                    <p><span className="text-purple-400 text-sm">Status:</span> <br /><span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${selectedMember.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                        }`}>{selectedMember.status}</span></p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Modal */}
            {isDeleteModalOpen && selectedMember && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm">
                    <div className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200 text-center p-8">
                        <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Trash2 size={32} />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Remove Staff?</h3>
                        <p className="text-gray-500 mb-6">Are you sure you want to remove <span className="font-bold text-gray-900">{selectedMember.name || selectedMember.fullName}</span> from the system? This action cannot be undone.</p>
                        <div className="flex items-center gap-3">
                            <button onClick={() => setIsDeleteModalOpen(false)} className="flex-1 py-3 bg-gray-100 text-gray-600 font-bold rounded-xl active:scale-95 transition-all">Cancel</button>
                            <button onClick={handleDelete} className="flex-1 py-3 bg-red-600 text-white font-bold rounded-xl active:scale-95 transition-all shadow-lg shadow-red-100">Remove</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Assign Class Modal */}
            {isAssignClassModalOpen && selectedMember && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm">
                    <div className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200 p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-bold text-gray-900">Assign Class</h3>
                            <button onClick={() => setIsAssignClassModalOpen(false)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
                        </div>
                        <p className="text-sm text-gray-500 mb-4">Assign a class to <span className="font-bold text-gray-900">{selectedMember.name || selectedMember.fullName}</span></p>
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Select Class</label>
                            <select
                                value={selectedClass}
                                onChange={(e) => setSelectedClass(e.target.value)}
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-100 focus:border-purple-400 outline-none transition-all"
                            >
                                <option value="" disabled>Select a class...</option>
                                {classOptions.map(cls => (
                                    <option key={cls} value={cls}>{cls}</option>
                                ))}
                            </select>
                        </div>
                        <div className="flex items-center gap-3">
                            <button onClick={() => setIsAssignClassModalOpen(false)} className="flex-1 py-3 bg-gray-100 text-gray-600 font-bold rounded-xl active:scale-95 transition-all">Cancel</button>
                            <button onClick={handleAssignClass} className="flex-1 py-3 bg-purple-600 text-white font-bold rounded-xl active:scale-95 transition-all shadow-lg shadow-purple-200">Save</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Staff;
