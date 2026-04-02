import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BASE_URL } from '../config';
import {
    Users,
    Search,
    User,
    Mail,
    Phone,
    ChevronRight,
    Loader2,
    Baby
} from 'lucide-react';

const Parents = () => {
    const navigate = useNavigate();
    const [parents, setParents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        fetchParents();
    }, []);

    const fetchParents = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${BASE_URL}/api/admin/parents`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (data.success) {
                setParents(data.data);
            } else {
                setError(data.message || 'Failed to fetch parents');
            }
        } catch (err) {
            console.error('Error fetching parents:', err);
            setError('Connection failed. Please check your backend.');
        } finally {
            setLoading(false);
        }
    };

    const filteredParents = parents.filter(parent => {
        const nameMatch = (parent.fullName || '').toLowerCase().includes(searchTerm.toLowerCase());
        const emailMatch = (parent.email || '').toLowerCase().includes(searchTerm.toLowerCase());
        return nameMatch || emailMatch;
    });

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px]">
                <Loader2 className="h-10 w-10 text-purple-500 animate-spin mb-4" />
                <p className="text-gray-500 font-medium">Loading parents list...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-black text-gray-900 tracking-tight">Parents Management</h2>
                    <p className="text-gray-500 font-medium">View and manage registered parents and their children.</p>
                </div>
            </div>

            {/* Filters & Stats */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                <div className="lg:col-span-3 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search by name or email..."
                            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-transparent rounded-xl focus:bg-white focus:ring-2 focus:ring-purple-100 focus:border-purple-200 outline-none transition-all font-medium text-sm"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
                <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-center gap-3">
                    <div className="w-10 h-10 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center">
                        <Users size={20} />
                    </div>
                    <div className="text-center">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Parents</p>
                        <p className="text-lg font-black text-gray-900">{parents.length}</p>
                    </div>
                </div>
            </div>

            {/* Grid List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredParents.map((parent) => (
                    <div 
                        key={parent._id}
                        onClick={() => navigate(`/admin/parents/${parent._id}`)}
                        className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm hover:shadow-xl hover:border-purple-100 transition-all cursor-pointer group relative overflow-hidden"
                    >
                        <div className="flex items-start justify-between mb-4">
                            <div className="w-14 h-14 bg-gradient-to-br from-purple-50 to-indigo-50 rounded-2xl flex items-center justify-center text-purple-600 shadow-inner group-hover:scale-110 transition-transform duration-500">
                                <User size={28} />
                            </div>
                            <div className="flex items-center gap-2">
                                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                                    parent.status === 'active' ? 'bg-green-50 text-green-600' : 'bg-amber-50 text-amber-600'
                                }`}>
                                    {parent.status}
                                </span>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <h3 className="text-lg font-black text-gray-900 tracking-tight group-hover:text-purple-700 transition-colors">
                                    {parent.fullName}
                                </h3>
                                <div className="flex items-center gap-2 text-gray-500 text-sm font-medium mt-1">
                                    <Mail size={14} className="text-gray-400" />
                                    {parent.email}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-50">
                                <div className="flex flex-col">
                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1.5">Children</span>
                                    <div className="flex items-center gap-2">
                                        <div className="w-6 h-6 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center">
                                            <Baby size={14} />
                                        </div>
                                        <span className="text-sm font-bold text-gray-700">{parent.childrenCount || 0}</span>
                                    </div>
                                </div>
                                <div className="flex flex-col items-end justify-center">
                                    <div className="w-8 h-8 rounded-full bg-gray-50 text-gray-400 flex items-center justify-center group-hover:bg-purple-600 group-hover:text-white transition-all">
                                        <ChevronRight size={18} />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Subtle background decoration */}
                        <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-purple-50 rounded-full opacity-50 blur-2xl group-hover:scale-150 transition-transform duration-1000"></div>
                    </div>
                ))}
            </div>

            {filteredParents.length === 0 && !loading && (
                <div className="bg-white rounded-[2rem] p-12 text-center border border-gray-100 shadow-sm">
                    <div className="w-20 h-20 bg-gray-50 text-gray-300 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Users size={40} />
                    </div>
                    <h3 className="text-xl font-black text-gray-900 mb-2">No parents found</h3>
                    <p className="text-gray-500 font-medium italic">
                        {searchTerm ? `No results for "${searchTerm}"` : "There are currently no registered parents."}
                    </p>
                </div>
            )}
        </div>
    );
};

export default Parents;
