import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Users,
    Search,
    Plus,
    Eye,
    Edit2,
    Trash2,
    MoreVertical,
    ChevronLeft,
    ChevronRight,
    User,
    Calendar,
    Phone,
    Mail,
    ShieldAlert,
    X,
    Save,
    Link as LinkIcon
} from 'lucide-react';
import { BASE_URL } from '../config';

const Children = () => {
    const navigate = useNavigate();
    const [children, setChildren] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [error, setError] = useState('');

    // UI States
    const [selectedChild, setSelectedChild] = useState(null);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [parents, setParents] = useState([]);

    useEffect(() => {
        fetchChildren();
        fetchParents();
    }, []);

    const fetchParents = async () => {
        try {
            const response = await fetch(`${BASE_URL}/api/auth/parents`);
            const data = await response.json();
            if (data.success) {
                setParents(data.data);
            }
        } catch (err) {
            console.error('Failed to fetch parents');
        }
    };

    const fetchChildren = async () => {
        setLoading(true);
        try {
            const response = await fetch(`${BASE_URL}/api/children`);
            const data = await response.json();
            if (data.success) {
                setChildren(data.data);
            } else {
                setError(data.message || 'Failed to fetch children');
            }
        } catch (err) {
            setError('Connection failed. Please check your backend.');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        try {
            const response = await fetch(`${BASE_URL}/api/children/${selectedChild._id}`, {
                method: 'DELETE',
            });
            const data = await response.json();
            if (data.success) {
                setChildren(children.filter(c => c._id !== selectedChild._id));
                setIsDeleteModalOpen(false);
                setSelectedChild(null);
            } else {
                alert(data.message || 'Failed to delete');
            }
        } catch (err) {
            alert('Delete failed');
        }
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(`${BASE_URL}/api/children/${selectedChild._id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(selectedChild),
            });
            const data = await response.json();
            if (data.success) {
                setChildren(children.map(c => c._id === selectedChild._id ? data.data : c));
                setIsEditModalOpen(false);
                setSelectedChild(null);
            } else {
                alert(data.message || 'Update failed');
            }
        } catch (err) {
            alert('Update failed');
        }
    };

    const filteredChildren = children.filter(child =>
        child.childName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        child.parentName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const calculateAge = (dob) => {
        const birthDate = new Date(dob);
        const today = new Date();
        let years = today.getFullYear() - birthDate.getFullYear();
        let months = today.getMonth() - birthDate.getMonth();
        if (months < 0 || (months === 0 && today.getDate() < birthDate.getDate())) {
            years--;
            months += 12;
        }
        return years > 0 ? `${years}y ${months}m` : `${months}m`;
    };

    if (loading) return <div className="p-8 text-center text-gray-500">Loading children data...</div>;

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Children Management</h2>
                    <p className="text-gray-500">Manage student records and parent information.</p>
                </div>
                <button
                    onClick={() => navigate('/admin/children/add')}
                    className="bg-purple-600 text-white px-6 py-2.5 rounded-xl font-semibold shadow-lg shadow-purple-200 hover:bg-purple-700 transition-all flex items-center gap-2 active:scale-95"
                >
                    <Plus size={20} />
                    Add New Child
                </button>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search by child or parent name..."
                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-100 focus:border-purple-400 outline-none transition-all"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 border border-gray-100 rounded-xl text-gray-600 font-medium">
                    <Users size={18} />
                    <span>Total: {filteredChildren.length}</span>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-100">
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Child</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Age/Gender</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Parent Info</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Blood Group</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {filteredChildren.map((child) => (
                                <tr key={child._id} className="hover:bg-purple-50/30 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 font-bold">
                                                {child.childName[0].toUpperCase()}
                                            </div>
                                            <div>
                                                <div className="font-bold text-gray-900">{child.childName}</div>
                                                <div className="text-xs text-gray-400">ID: {child._id.slice(-6)}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-gray-700">{calculateAge(child.dob)}</div>
                                        <div className="text-xs text-gray-400">{child.gender}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-gray-700 font-medium">{child.parentName}</div>
                                        <div className="flex items-center gap-1 mt-0.5">
                                            {child.parent ? (
                                                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-green-50 text-green-600 text-[10px] font-bold rounded-md border border-green-100" title="Linked to parent account">
                                                    <LinkIcon size={10} />
                                                    Linked
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-amber-50 text-amber-600 text-[10px] font-bold rounded-md border border-amber-100" title="Not linked to account">
                                                    Unlinked
                                                </span>
                                            )}
                                            <span className="text-xs text-gray-400">{child.parentPhone}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="px-2 py-1 bg-red-50 text-red-600 text-xs font-bold rounded-lg border border-red-100">
                                            {child.bloodGroup}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                onClick={() => { setSelectedChild(child); setIsViewModalOpen(true); }}
                                                className="p-2 text-gray-400 hover:text-purple-600 hover:bg-white rounded-lg transition-all"
                                                title="View Details"
                                            >
                                                <Eye size={18} />
                                            </button>
                                            <button
                                                onClick={() => { setSelectedChild(child); setIsEditModalOpen(true); }}
                                                className="p-2 text-gray-400 hover:text-blue-600 hover:bg-white rounded-lg transition-all"
                                                title="Edit"
                                            >
                                                <Edit2 size={18} />
                                            </button>
                                            <button
                                                onClick={() => { setSelectedChild(child); setIsDeleteModalOpen(true); }}
                                                className="p-2 text-gray-400 hover:text-red-600 hover:bg-white rounded-lg transition-all"
                                                title="Delete"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {filteredChildren.length === 0 && (
                                <tr>
                                    <td colSpan="5" className="px-6 py-12 text-center text-gray-400 italic">
                                        No children found matching your search.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* View Modal */}
            {isViewModalOpen && selectedChild && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm">
                    <div className="bg-white rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
                        <div className="px-6 py-4 bg-purple-600 text-white flex items-center justify-between">
                            <h3 className="text-lg font-bold">Child Profile</h3>
                            <button onClick={() => setIsViewModalOpen(false)}><X size={20} /></button>
                        </div>
                        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-4">
                                <h4 className="text-primary font-bold border-b pb-2 flex items-center gap-2"><User size={18} /> Basic Info</h4>
                                <div className="space-y-2">
                                    <p><span className="text-gray-400">Full Name:</span> <span className="font-medium">{selectedChild.childName}</span></p>
                                    <p><span className="text-gray-400">D.O.B:</span> <span className="font-medium">{new Date(selectedChild.dob).toLocaleDateString()}</span></p>
                                    <p><span className="text-gray-400">Gender:</span> <span className="font-medium">{selectedChild.gender}</span></p>
                                    <p><span className="text-gray-400">Admission:</span> <span className="font-medium">{new Date(selectedChild.admissionDate).toLocaleDateString()}</span></p>
                                </div>
                            </div>
                            <div className="space-y-4">
                                <h4 className="text-primary font-bold border-b pb-2 flex items-center gap-2"><Phone size={18} /> Contact info</h4>
                                <div className="space-y-2">
                                    <p><span className="text-gray-400">Parent:</span> <span className="font-medium">{selectedChild.parentName}</span></p>
                                    <p><span className="text-gray-400">Phone:</span> <span className="font-medium">{selectedChild.parentPhone}</span></p>
                                    <p><span className="text-gray-400">Email:</span> <span className="font-medium">{selectedChild.parentEmail}</span></p>
                                    <p><span className="text-gray-400">Emergency:</span> <span className="font-medium">{selectedChild.emergencyContactName} ({selectedChild.emergencyContactNumber})</span></p>
                                </div>
                            </div>
                            <div className="md:col-span-2 space-y-4 bg-rose-50 p-4 rounded-2xl border border-rose-100">
                                <h4 className="text-rose-600 font-bold flex items-center gap-2"><ShieldAlert size={18} /> Medical Notes</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <p><span className="text-rose-400">Allergies:</span> <span className="font-medium text-rose-700">{selectedChild.allergies || 'None'}</span></p>
                                    <p><span className="text-rose-400">Conditions:</span> <span className="font-medium text-rose-700">{selectedChild.medicalConditions || 'None'}</span></p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Modal */}
            {isEditModalOpen && selectedChild && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm">
                    <form onSubmit={handleUpdate} className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
                        <div className="px-6 py-4 bg-blue-600 text-white flex items-center justify-between">
                            <h3 className="text-lg font-bold">Edit Child Record</h3>
                            <button type="button" onClick={() => setIsEditModalOpen(false)}><X size={20} /></button>
                        </div>
                        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                            <div className="space-y-1.5 text-left">
                                <label className="text-sm font-medium text-gray-700">Child Name</label>
                                <input
                                    className="w-full px-4 py-2 border border-gray-200 rounded-xl"
                                    value={selectedChild.childName}
                                    onChange={(e) => setSelectedChild({ ...selectedChild, childName: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5 text-left">
                                    <label className="text-sm font-medium text-gray-700">Gender</label>
                                    <select
                                        className="w-full px-4 py-2 border border-gray-200 rounded-xl"
                                        value={selectedChild.gender}
                                        onChange={(e) => setSelectedChild({ ...selectedChild, gender: e.target.value })}
                                    >
                                        <option value="Male">Male</option>
                                        <option value="Female">Female</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>
                                <div className="space-y-1.5 text-left">
                                    <label className="text-sm font-medium text-gray-700">Blood Group</label>
                                    <input
                                        className="w-full px-4 py-2 border border-gray-200 rounded-xl"
                                        value={selectedChild.bloodGroup}
                                        onChange={(e) => setSelectedChild({ ...selectedChild, bloodGroup: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="space-y-1.5 text-left">
                                <label className="text-sm font-medium text-gray-700">Parent Name</label>
                                <input
                                    className="w-full px-4 py-2 border border-gray-200 rounded-xl"
                                    value={selectedChild.parentName}
                                    onChange={(e) => setSelectedChild({ ...selectedChild, parentName: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="space-y-1.5 text-left">
                                <label className="text-sm font-medium text-gray-700">Parent Phone</label>
                                <input
                                    className="w-full px-4 py-2 border border-gray-200 rounded-xl"
                                    value={selectedChild.parentPhone}
                                    onChange={(e) => setSelectedChild({ ...selectedChild, parentPhone: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="space-y-1.5 text-left">
                                <label className="text-sm font-medium text-gray-700">Link to Parent Account</label>
                                <select
                                    className="w-full px-4 py-2 border border-gray-200 rounded-xl"
                                    value={selectedChild.parent || ''}
                                    onChange={(e) => setSelectedChild({ ...selectedChild, parent: e.target.value })}
                                >
                                    <option value="">Select Parent Account</option>
                                    {parents.map(p => (
                                        <option key={p._id} value={p._id}>{p.fullName} ({p.email})</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <div className="p-6 bg-gray-50 flex items-center justify-end gap-3">
                            <button type="button" onClick={() => setIsEditModalOpen(false)} className="px-4 py-2 text-gray-600 font-medium">Cancel</button>
                            <button type="submit" className="px-6 py-2 bg-blue-600 text-white font-bold rounded-xl flex items-center gap-2">
                                <Save size={18} />
                                Save Changes
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Delete Modal */}
            {isDeleteModalOpen && selectedChild && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm">
                    <div className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200 text-center p-8">
                        <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Trash2 size={32} />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Delete Record?</h3>
                        <p className="text-gray-500 mb-6">Are you sure you want to delete <span className="font-bold text-gray-900">{selectedChild.childName}</span>'s record? This action cannot be undone.</p>
                        <div className="flex items-center gap-3">
                            <button onClick={() => setIsDeleteModalOpen(false)} className="flex-1 py-3 bg-gray-100 text-gray-600 font-bold rounded-xl active:scale-95 transition-all">Cancel</button>
                            <button onClick={handleDelete} className="flex-1 py-3 bg-red-600 text-white font-bold rounded-xl active:scale-95 transition-all shadow-lg shadow-red-100">Delete</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Children;
