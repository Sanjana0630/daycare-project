import React, { useState, useEffect } from 'react';
import { Search, User, Mail, Phone, Baby, Filter, MoreVertical, LayoutGrid, List } from 'lucide-react';

const MyChildren = () => {
    const [children, setChildren] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [viewMode, setViewMode] = useState('list'); // 'grid' or 'list'

    useEffect(() => {
        const fetchChildren = async () => {
            try {
                const token = localStorage.getItem('token');
                const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5005';
                const response = await fetch(`${apiUrl}/api/staff/assigned-children`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const result = await response.json();
                if (result.success) {
                    setChildren(result.data);
                }
            } catch (error) {
                console.error('Error fetching children:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchChildren();
    }, []);

    const filteredChildren = children.filter(child =>
        child.childName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        child.parentName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
                    <p className="text-gray-500 font-medium animate-pulse">Loading assigned children...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 mb-2">My Children</h1>
                    <p className="text-gray-500 font-medium">Managing {children.length} total assigned children</p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    <div className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-hover:text-purple-500 transition-colors" size={20} />
                        <input
                            type="text"
                            placeholder="Search child or parent..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-12 pr-6 py-3 bg-white border border-gray-100 rounded-2xl w-full md:w-80 shadow-sm focus:ring-4 focus:ring-purple-50 focus:border-purple-200 transition-all text-sm font-medium"
                        />
                    </div>
                    <div className="flex bg-white p-1 rounded-2xl border border-gray-100 shadow-sm">
                        <button
                            onClick={() => setViewMode('list')}
                            className={`p-2 rounded-xl transition-all ${viewMode === 'list' ? 'bg-purple-50 text-purple-600 shadow-inner' : 'text-gray-400 hover:text-gray-600'}`}
                        >
                            <List size={20} />
                        </button>
                        <button
                            onClick={() => setViewMode('grid')}
                            className={`p-2 rounded-xl transition-all ${viewMode === 'grid' ? 'bg-purple-50 text-purple-600 shadow-inner' : 'text-gray-400 hover:text-gray-600'}`}
                        >
                            <LayoutGrid size={20} />
                        </button>
                    </div>
                </div>
            </div>

            {viewMode === 'list' ? (
                <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50/50">
                                    <th className="px-8 py-5 text-[11px] font-black text-gray-400 uppercase tracking-[2px]">Child Details</th>
                                    <th className="px-8 py-5 text-[11px] font-black text-gray-400 uppercase tracking-[2px]">Parent Information</th>
                                    <th className="px-8 py-5 text-[11px] font-black text-gray-400 uppercase tracking-[2px]">Contact</th>
                                    <th className="px-8 py-5 text-[11px] font-black text-gray-400 uppercase tracking-[2px]">Medical</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {filteredChildren.map((child) => (
                                    <tr key={child._id} className="group hover:bg-gray-50/50 transition-all duration-300">
                                        <td className="px-8 py-5">
                                            <div className="flex items-center gap-4">
                                                <div className="w-14 h-14 bg-gradient-to-tr from-purple-100 to-indigo-100 rounded-2xl flex items-center justify-center text-purple-700 font-bold text-xl shadow-inner group-hover:scale-110 transition-transform">
                                                    {child.childName[0].toUpperCase()}
                                                </div>
                                                <div>
                                                    <div className="font-black text-gray-900 text-lg leading-tight">{child.childName}</div>
                                                    <div className="text-gray-400 text-xs font-bold mt-1 uppercase flex items-center gap-1">
                                                        <Baby size={12} /> {child.gender} • {new Date().getFullYear() - new Date(child.dob).getFullYear()} Years
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-gray-500">
                                                    <User size={14} />
                                                </div>
                                                <div className="font-bold text-gray-700">{child.parentName}</div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5">
                                            <div className="space-y-1.5">
                                                <div className="flex items-center gap-2 text-sm text-gray-500 font-medium">
                                                    <Mail size={14} className="text-purple-400" /> {child.parentEmail}
                                                </div>
                                                <div className="flex items-center gap-2 text-sm text-gray-500 font-medium">
                                                    <Phone size={14} className="text-indigo-400" /> {child.parentPhone}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5">
                                            {child.allergies || child.medicalConditions ? (
                                                <div className="flex flex-wrap gap-2">
                                                    {child.allergies && (
                                                        <span className="px-2.5 py-1 bg-amber-50 text-amber-600 text-[10px] font-black rounded-lg border border-amber-100 uppercase">
                                                            Allergies
                                                        </span>
                                                    )}
                                                    {child.medicalConditions && (
                                                        <span className="px-2.5 py-1 bg-rose-50 text-rose-600 text-[10px] font-black rounded-lg border border-rose-100 uppercase">
                                                            Medical
                                                        </span>
                                                    )}
                                                </div>
                                            ) : (
                                                <span className="text-gray-300 text-xs italic">No concerns</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredChildren.map((child) => (
                        <div key={child._id} className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-purple-50 -mr-8 -mt-8 rounded-full opacity-50 group-hover:scale-150 transition-transform"></div>

                            <div className="relative z-10 flex flex-col items-center text-center">
                                <div className="w-20 h-20 bg-gradient-to-tr from-purple-100 to-indigo-100 rounded-3xl flex items-center justify-center text-purple-700 font-black text-3xl shadow-md mb-4 group-hover:scale-110 transition-transform">
                                    {child.childName[0].toUpperCase()}
                                </div>
                                <h3 className="text-xl font-black text-gray-900 mb-1">{child.childName}</h3>
                                <p className="text-gray-400 text-xs font-black uppercase tracking-wider mb-6">{child.gender} • {new Date().getFullYear() - new Date(child.dob).getFullYear()} Years</p>

                                <div className="w-full space-y-3 pt-6 border-t border-gray-50">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-gray-400 font-bold">Parent</span>
                                        <span className="text-gray-900 font-black">{child.parentName}</span>
                                    </div>
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-gray-400 font-bold">Phone</span>
                                        <span className="text-gray-900 font-black">{child.parentPhone}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default MyChildren;
