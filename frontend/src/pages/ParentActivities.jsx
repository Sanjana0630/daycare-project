import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Loader2,
    Calendar,
    Clock,
    Star,
    Gamepad2,
    CheckCircle,
    Info,
    ArrowLeft
} from 'lucide-react';
import { BASE_URL } from '../config';

const ParentActivities = () => {
    const [child, setChild] = useState(null);
    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('today');
    const navigate = useNavigate();

    const token = localStorage.getItem('token');

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                // 1. Fetch child
                const childRes = await fetch(`${BASE_URL}/api/parent/child`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const childData = await childRes.json();
                if (childData.success) {
                    setChild(childData.data);
                }

                // 2. Fetch activities
                const actRes = await fetch(`${BASE_URL}/api/parent/activities/parent?filter=${filter}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const actData = await actRes.json();
                if (actData.success) {
                    setActivities(actData.activities || []);
                }
            } catch (err) {
                console.error("Error fetching activities:", err);
            } finally {
                setLoading(false);
            }
        };

        if (token) fetchData();
    }, [token, filter]);

    const calculateAge = (dobString) => {
        if (!dobString) return '';
        const dob = new Date(dobString);
        const diffMs = Date.now() - dob.getTime();
        const ageDate = new Date(diffMs);
        return `${Math.abs(ageDate.getUTCFullYear() - 1970)}y ${ageDate.getUTCMonth()}m`;
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
                <Loader2 className="h-10 w-10 text-purple-600 animate-spin mb-4" />
                <p className="text-gray-500 font-medium">Loading activities...</p>
            </div>
        );
    }

    if (!child) {
        return (
            <div className="p-8 text-center bg-white rounded-[2rem] border border-gray-100 shadow-sm max-w-2xl mx-auto mt-10">
                <div className="w-20 h-20 bg-amber-50 text-amber-500 rounded-3xl flex items-center justify-center mx-auto mb-6">
                    <Info size={40} />
                </div>
                <h2 className="text-2xl font-black text-gray-900 mb-2">No child linked</h2>
                <p className="text-gray-500 mb-8">Your account is not linked to any child. Please contact administration to view activity records.</p>
                <button onClick={() => navigate('/parent/dashboard')} className="px-8 py-3 bg-gray-900 text-white font-bold rounded-2xl hover:bg-black transition-all">
                    Return to Dashboard
                </button>
            </div>
        );
    }

    const completedCount = activities.filter(a => a.status === 'Completed').length;
    const progress = activities.length > 0 ? Math.round((completedCount / activities.length) * 100) : 0;

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 space-y-8 pb-12">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <button 
                        onClick={() => navigate('/parent/dashboard')}
                        className="flex items-center gap-2 text-gray-400 hover:text-purple-600 font-bold text-sm mb-2 transition-colors group"
                    >
                        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                        Back to Dashboard
                    </button>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight">Child Progress</h1>
                    <p className="text-gray-500 font-medium">Daily highlights and developmental milestones.</p>
                </div>
                <div className="flex bg-white p-1.5 rounded-2xl border border-gray-100 shadow-sm self-start md:self-center">
                    <button
                        onClick={() => setFilter('today')}
                        className={`px-6 py-2 rounded-xl text-sm font-black transition-all ${filter === 'today' ? 'bg-purple-600 text-white shadow-lg shadow-purple-200' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        Today
                    </button>
                    <button
                        onClick={() => setFilter('week')}
                        className={`px-6 py-2 rounded-xl text-sm font-black transition-all ${filter === 'week' ? 'bg-purple-600 text-white shadow-lg shadow-purple-200' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        This Week
                    </button>
                </div>
            </div>

            {/* Child Header Card */}
            <div className="bg-gradient-to-br from-purple-600 to-indigo-700 rounded-[2.5rem] p-8 text-white shadow-2xl shadow-purple-900/20 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-8 transform translate-x-12 -translate-y-12 opacity-10 group-hover:scale-110 transition-transform duration-1000">
                    <Gamepad2 size={240} />
                </div>
                <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
                    <div className="w-24 h-24 bg-white/20 backdrop-blur-xl rounded-[2.5rem] flex items-center justify-center text-4xl font-black border border-white/20 shadow-2xl overflow-hidden">
                        {child.photo ? (
                            <img 
                                src={`${BASE_URL}${child.photo}`} 
                                alt={child.childName} 
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.style.display = 'none';
                                    e.target.parentElement.innerHTML = `<span class="text-4xl font-black">${child.childName.charAt(0)}</span>`;
                                }}
                            />
                        ) : (
                            child.childName.charAt(0)
                        )}
                    </div>
                    <div className="text-center md:text-left">
                        <h2 className="text-4xl font-black mb-2 tracking-tight">{child.childName}</h2>
                        <div className="flex flex-wrap justify-center md:justify-start gap-3 mt-4">
                            <span className="px-5 py-2 bg-white/10 backdrop-blur-sm rounded-xl border border-white/10 font-bold text-sm">Age: {calculateAge(child.dob)}</span>
                            <span className="px-5 py-2 bg-white/10 backdrop-blur-sm rounded-xl border border-white/10 font-bold text-sm capitalize">{child.gender}</span>
                            <span className="px-5 py-2 bg-white/10 backdrop-blur-sm rounded-xl border border-white/10 font-bold text-sm">Class: {child.class || 'Starters'}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Progress Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 bg-white rounded-[2.5rem] p-10 shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-8">
                        <h3 className="text-xl font-black text-gray-900 tracking-tight">Activities Summary</h3>
                        <span className="text-xs font-black text-gray-400 uppercase tracking-widest">{filter === 'today' ? 'Today' : 'Last 7 Days'}</span>
                    </div>

                    <div className="grid grid-cols-3 gap-6 mb-10">
                        <div className="bg-gray-50/50 rounded-3xl p-6 border border-gray-100 text-center">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Total</p>
                            <p className="text-3xl font-black text-gray-900">{activities.length}</p>
                        </div>
                        <div className="bg-green-50/50 rounded-3xl p-6 border border-green-100 text-center">
                            <p className="text-[10px] font-black text-green-400 uppercase tracking-widest mb-1">Done</p>
                            <p className="text-3xl font-black text-green-600">{completedCount}</p>
                        </div>
                        <div className="bg-amber-50/50 rounded-3xl p-6 border border-amber-100 text-center">
                            <p className="text-[10px] font-black text-amber-400 uppercase tracking-widest mb-1">Pending</p>
                            <p className="text-3xl font-black text-amber-600">{activities.length - completedCount}</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-bold text-gray-700">Completion Status</span>
                            <span className="text-2xl font-black text-purple-600">{progress}%</span>
                        </div>
                        <div className="w-full h-4 bg-gray-100 rounded-full overflow-hidden border border-gray-50 shadow-inner">
                            <div 
                                className="h-full bg-gradient-to-r from-purple-500 to-indigo-600 transition-all duration-1000 ease-out rounded-full"
                                style={{ width: `${progress}%` }}
                            ></div>
                        </div>
                        <p className="text-xs text-gray-400 font-medium">Keep it up! Your child is engaging well with the daily program.</p>
                    </div>
                </div>

                <div className="bg-gray-900 rounded-[2.5rem] p-10 text-white flex flex-col justify-center relative overflow-hidden">
                    <div className="relative z-10">
                        <h3 className="text-2xl font-black mb-4">Staff Update</h3>
                        <p className="text-gray-400 font-medium mb-8 leading-relaxed">
                            " {child.childName} is showing great curiosity today. Participating actively in all group games and showing kindness to classmates. "
                        </p>
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-purple-400 font-black">
                                <CheckCircle size={24} />
                            </div>
                            <div>
                                <p className="font-bold text-white">Daily Review</p>
                                <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">Teacher Approved</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Activities Grid */}
            <div className="space-y-6">
                <h3 className="text-2xl font-black text-gray-900 tracking-tight">Recorded Sessions</h3>
                {activities.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {activities.map((activity, idx) => (
                            <div key={idx} className="bg-white rounded-[2rem] p-8 border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group duration-300">
                                <div className="flex flex-col h-full">
                                    <div className="flex items-start justify-between mb-6">
                                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-colors ${
                                            activity.status === 'Completed' ? 'bg-green-50 text-green-600' : 'bg-amber-50 text-amber-600'
                                        }`}>
                                            {activity.status === 'Completed' ? <CheckCircle size={28} /> : <Clock size={28} />}
                                        </div>
                                        <div className="flex items-center gap-0.5">
                                            {[...Array(5)].map((_, i) => (
                                                <Star
                                                    key={i}
                                                    size={14}
                                                    className={i < activity.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-200'}
                                                />
                                            ))}
                                        </div>
                                    </div>

                                    <h4 className="text-xl font-black text-gray-900 mb-3 tracking-tight">{activity.name}</h4>
                                    
                                    <div className={`inline-block px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest mb-4 w-fit border ${
                                        activity.status === 'Completed' 
                                        ? 'bg-green-100 text-green-700 border-green-200' 
                                        : 'bg-amber-100 text-amber-700 border-amber-200'
                                    }`}>
                                        {activity.status}
                                    </div>

                                    <div className="bg-gray-50 rounded-2xl p-4 mb-6 ring-1 ring-gray-900/5 min-h-[80px]">
                                        <p className="text-sm text-gray-500 font-medium leading-relaxed italic">
                                            {activity.notes || "No detailed notes recorded for this session."}
                                        </p>
                                    </div>

                                    <div className="mt-auto pt-6 border-t border-gray-50 flex items-center justify-between">
                                        <div className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                            <Calendar size={14} className="text-purple-300" />
                                            {new Date(activity.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                                        </div>
                                        <div className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                            <Clock size={14} className="text-indigo-300" />
                                            {activity.status === 'Completed' ? 'Logged' : 'Pending'}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="bg-white rounded-[3rem] p-20 text-center border border-dashed border-gray-200">
                        <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-200">
                            <Gamepad2 size={48} />
                        </div>
                        <h4 className="text-xl font-black text-gray-900 mb-2">No activities recorded</h4>
                        <p className="text-gray-500 max-w-sm mx-auto">We'll update this section as soon as your child begins their daily program.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ParentActivities;
