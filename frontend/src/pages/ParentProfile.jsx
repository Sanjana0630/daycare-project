import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { BASE_URL } from '../config';
import {
    User,
    Mail,
    Phone,
    Calendar,
    Baby,
    Star,
    Trash2,
    Eye,
    EyeOff,
    Filter,
    ArrowLeft,
    Loader2,
    AlertCircle,
    CheckCircle,
    ChevronRight,
    MessageSquare
} from 'lucide-react';

const ParentProfile = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [parent, setParent] = useState(null);
    const [feedback, setFeedback] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('All');

    useEffect(() => {
        fetchParentData();
    }, [id]);

    const fetchParentData = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            // Fetch parent list first to get this specific parent's details
            // In a real app, you'd have a GET /api/admin/parents/:id endpoint
            const parentRes = await fetch(`${BASE_URL}/api/admin/parents`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const parentData = await parentRes.json();
            
            if (parentData.success) {
                const foundParent = parentData.data.find(p => p._id === id);
                if (foundParent) {
                    setParent(foundParent);
                    // Now fetch feedback
                    const feedbackRes = await fetch(`${BASE_URL}/api/admin/parents/${id}/feedback`, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    const feedbackData = await feedbackRes.json();
                    if (feedbackData.success) {
                        setFeedback(feedbackData.data);
                    }
                } else {
                    setError('Parent not found');
                }
            }
        } catch (err) {
            console.error('Error fetching parent data:', err);
            setError('Failed to load parent details');
        } finally {
            setLoading(false);
        }
    };

    const handleToggleHide = async (feedbackId) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${BASE_URL}/api/admin/feedback/${feedbackId}/toggle-visibility`, {
                method: 'PATCH',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (data.success) {
                setFeedback(feedback.map(f => f._id === feedbackId ? { ...f, isHidden: data.data.isHidden } : f));
            }
        } catch (err) {
            alert('Failed to toggle visibility');
        }
    };

    const handleDeleteFeedback = async (feedbackId) => {
        if (!window.confirm('Are you sure you want to delete this feedback?')) return;
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${BASE_URL}/api/admin/feedback/${feedbackId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (data.success) {
                setFeedback(feedback.filter(f => f._id !== feedbackId));
            }
        } catch (err) {
            alert('Failed to delete feedback');
        }
    };

    const calculateAverageRating = () => {
        if (feedback.length === 0) return 0;
        const sum = feedback.reduce((acc, curr) => acc + curr.rating, 0);
        return (sum / feedback.length).toFixed(1);
    };

    const filteredFeedback = feedback.filter(f => 
        categoryFilter === 'All' || f.category === categoryFilter
    );

    const categories = ['All', 'Service', 'Facility', 'Staff', 'Food', 'Activities', 'Other'];

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px]">
                <Loader2 className="h-10 w-10 text-purple-500 animate-spin mb-4" />
                <p className="text-gray-500 font-medium">Loading parent profile...</p>
            </div>
        );
    }

    if (error || !parent) {
        return (
            <div className="bg-red-50 p-8 rounded-3xl text-center border border-red-100 animate-in fade-in duration-500">
                <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-red-900">{error || 'Something went wrong'}</h3>
                <button 
                    onClick={() => navigate('/parents')}
                    className="mt-6 px-6 py-2 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition-all"
                >
                    Back to Parents
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-12">
            {/* Navigation & Actions */}
            <div className="flex items-center justify-between">
                <button 
                    onClick={() => navigate('/parents')}
                    className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl border border-gray-100 text-gray-600 font-bold hover:bg-gray-50 transition-all shadow-sm"
                >
                    <ArrowLeft size={18} />
                    Back to List
                </button>
            </div>

            {/* Parent Header Card */}
            <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-full bg-gradient-to-l from-purple-50 to-transparent -z-0"></div>
                <div className="relative z-10 flex flex-col md:flex-row gap-8 items-start md:items-center">
                    <div className="w-24 h-24 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-3xl flex items-center justify-center text-white text-4xl font-black shadow-xl shadow-purple-200">
                        {parent.fullName.charAt(0)}
                    </div>
                    <div className="flex-1 space-y-4">
                        <div>
                            <div className="flex items-center gap-4 flex-wrap">
                                <h1 className="text-3xl font-black text-gray-900 tracking-tight">{parent.fullName}</h1>
                                <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                                    parent.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                                }`}>
                                    {parent.status}
                                </span>
                            </div>
                            <p className="text-gray-500 font-medium text-lg mt-1 italic">Parent Account</p>
                        </div>
                        <div className="flex flex-wrap gap-6 text-sm">
                            <div className="flex items-center gap-2 font-bold text-gray-600">
                                <Mail size={16} className="text-purple-400" />
                                {parent.email}
                            </div>
                            <div className="flex items-center gap-2 font-bold text-gray-600">
                                <Calendar size={16} className="text-purple-400" />
                                Registered: {new Date(parent.createdAt).toLocaleDateString()}
                            </div>
                        </div>
                    </div>
                    <div className="bg-purple-600 text-white rounded-3xl p-6 text-center min-w-[140px] shadow-lg shadow-purple-100">
                        <p className="text-[10px] font-black uppercase tracking-widest mb-1 opacity-70">Average Rating</p>
                        <p className="text-4xl font-black">{calculateAverageRating()}</p>
                        <div className="flex justify-center mt-2">
                            {[...Array(5)].map((_, i) => (
                                <Star 
                                    key={i} 
                                    size={12} 
                                    className={i < Math.round(calculateAverageRating()) ? 'fill-amber-400 text-amber-400' : 'text-purple-400'} 
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <div className="space-y-6">
                <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
                        {/* Feedback Filters & Actions */}
                        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                            <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 w-full md:w-auto">
                                <Filter size={18} className="text-gray-400 mr-2 shrink-0" />
                                {categories.map(cat => (
                                    <button
                                        key={cat}
                                        onClick={() => setCategoryFilter(cat)}
                                        className={`px-4 py-2 rounded-xl text-xs font-black transition-all whitespace-nowrap border ${
                                            categoryFilter === cat 
                                            ? 'bg-purple-600 text-white border-purple-600 shadow-md shadow-purple-100' 
                                            : 'bg-white text-gray-500 border-gray-100 hover:border-purple-200'
                                        }`}
                                    >
                                        {cat}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Feedback Grid */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {filteredFeedback.map((f) => (
                                <div 
                                    key={f._id}
                                    className={`bg-white rounded-[2rem] p-8 border hover:shadow-xl transition-all duration-300 relative group overflow-hidden ${
                                        f.isHidden ? 'border-gray-200 opacity-75 grayscale-[50%]' : 'border-gray-100'
                                    } ${f.rating <= 2 ? 'ring-2 ring-red-50' : ''}`}
                                >
                                    {f.isHidden && (
                                        <div className="absolute top-4 right-4 z-20 bg-gray-900/80 text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2 backdrop-blur-sm">
                                            <EyeOff size={12} />
                                            Hidden from View
                                        </div>
                                    )}

                                    <div className="flex items-start justify-between mb-6 relative z-10">
                                        <div className="space-y-3">
                                            <div className="flex items-center gap-1.5">
                                                {[...Array(5)].map((_, i) => (
                                                    <Star 
                                                        key={i} 
                                                        size={20} 
                                                        className={`transition-all duration-300 ${
                                                            i < f.rating 
                                                            ? (f.rating <= 2 ? 'fill-red-500 text-red-500' : 'fill-amber-400 text-amber-400') 
                                                            : 'text-gray-200'
                                                        }`} 
                                                    />
                                                ))}
                                                <span className={`ml-2 text-xl font-black ${f.rating <= 2 ? 'text-red-600' : 'text-gray-900'}`}>
                                                    {f.rating}/5
                                                </span>
                                            </div>
                                            <div className="flex flex-wrap gap-2">
                                                <span className="bg-purple-50 text-purple-700 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-purple-100">
                                                    {f.category}
                                                </span>
                                                <span className="bg-blue-50 text-blue-700 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-blue-100 flex items-center gap-1.5">
                                                    <Baby size={12} />
                                                    {f.child?.childName || 'Child'}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Submitted On</p>
                                            <p className="text-xs font-bold text-gray-700">{new Date(f.createdAt).toLocaleDateString('en-IN', {
                                                day: 'numeric',
                                                month: 'long',
                                                year: 'numeric'
                                            })}</p>
                                        </div>
                                    </div>

                                    <div className={`p-6 rounded-3xl mb-6 relative z-10 ${f.rating <= 2 ? 'bg-red-50/50 border border-red-100' : 'bg-gray-50/50 border border-gray-100'}`}>
                                        <p className="text-gray-700 font-medium leading-relaxed italic">
                                            "{f.message}"
                                        </p>
                                    </div>

                                    <div className="flex items-center justify-between pt-4 border-t border-gray-50 relative z-10">
                                        <div className="flex gap-2">
                                            <button 
                                                onClick={() => handleToggleHide(f._id)}
                                                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all ${
                                                    f.isHidden 
                                                    ? 'bg-green-50 text-green-700 hover:bg-green-100' 
                                                    : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                                                }`}
                                            >
                                                {f.isHidden ? <Eye size={14} /> : <EyeOff size={14} />}
                                                {f.isHidden ? 'Show Feedback' : 'Hide Feedback'}
                                            </button>
                                        </div>
                                        <button 
                                            onClick={() => handleDeleteFeedback(f._id)}
                                            className="p-2 text-gray-300 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                                            title="Delete permanently"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>

                                    {/* Subtle rating highlight in background */}
                                    <div className={`absolute -right-10 -bottom-10 w-40 h-40 rounded-full blur-[80px] opacity-20 pointer-events-none ${
                                        f.rating <= 2 ? 'bg-red-400' : 'bg-purple-400'
                                    }`}></div>
                                </div>
                            ))}
                        </div>

                        {filteredFeedback.length === 0 && (
                            <div className="bg-white rounded-[2rem] p-12 text-center border border-gray-100 shadow-sm animate-in zoom-in-95 duration-500">
                                <div className="w-20 h-20 bg-gray-50 text-gray-300 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                                    <MessageSquare size={40} />
                                </div>
                                <h3 className="text-xl font-black text-gray-900 mb-2 tracking-tight">No feedback found</h3>
                                <p className="text-gray-500 font-medium italic">
                                    {categoryFilter !== 'All' 
                                        ? `There is no feedback in the "${categoryFilter}" category.` 
                                        : "This parent has not submitted any feedback yet."}
                                </p>
                            </div>
                        )}
                    </div>
            </div>
        </div>
    );
};

export default ParentProfile;
