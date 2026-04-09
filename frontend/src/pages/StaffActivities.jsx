import React, { useState, useEffect } from 'react';
import { Baby, Utensils, Moon, Activity, Heart, Smile, Save, Search, PlusCircle, Star, CheckCircle2, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const DEFAULT_ACTIVITIES = [
    "Morning Prayer",
    "Learning Session",
    "Snack Time",
    "Play Time",
    "Story Time",
    "Lunch Time",
    "Nap Time"
];

const StarRating = ({ rating, onRate, disabled }) => {
    return (
        <div className={`flex items-center gap-1 ${disabled ? 'opacity-50' : ''}`}>
            {[1, 2, 3, 4, 5].map((star) => (
                <button
                    key={star}
                    type="button"
                    disabled={disabled}
                    onClick={() => onRate(star)}
                    className={`transition-all ${disabled ? 'cursor-not-allowed' : 'hover:scale-110 active:scale-95'}`}
                >
                    <Star
                        size={18}
                        className={`${star <= rating ? 'fill-amber-400 text-amber-400' : 'text-gray-200'}`}
                    />
                </button>
            ))}
        </div>
    );
};

const StaffActivities = () => {
    const [children, setChildren] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedChild, setSelectedChild] = useState(null);
    const [activities, setActivities] = useState(
        DEFAULT_ACTIVITIES.map(name => ({
            activityName: name,
            completed: false,
            rating: 0,
            notes: ""
        }))
    );

    const getTodayString = () => {
        const d = new Date();
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    };

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
                toast.error("Failed to load children list");
            } finally {
                setLoading(false);
            }
        };
        fetchChildren();
    }, []);

    useEffect(() => {
        if (selectedChild) {
            fetchDailyLog(selectedChild._id);
        } else {
            resetForm();
        }
    }, [selectedChild]);

    const fetchDailyLog = async (childId) => {
        try {
            const token = localStorage.getItem('token');
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5005';
            const date = getTodayString();
            const response = await fetch(`${apiUrl}/api/staff/activity-log/${childId}?date=${date}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const result = await response.json();

            if (result.success && result.data && result.data.activities) {
                // Backend now returns pre-merged activities with status from the dashboard schedule
                setActivities(result.data.activities);
            } else {
                resetForm();
            }
        } catch (error) {
            console.error('Error fetching daily log:', error);
            resetForm();
        }
    };

    const resetForm = () => {
        setActivities(DEFAULT_ACTIVITIES.map(name => ({
            activityName: name,
            completed: false,
            rating: 0,
            notes: "",
            status: "Pending"
        })));
    };

    const handleActivityChange = (index, field, value) => {
        const updated = [...activities];
        updated[index] = { ...updated[index], [field]: value };
        setActivities(updated);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedChild) return;

        setSaving(true);
        try {
            const token = localStorage.getItem('token');
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5005';
            const data = {
                childId: selectedChild._id,
                date: getTodayString(),
                activities: activities
            };

            const response = await fetch(`${apiUrl}/api/staff/log-activity`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(data)
            });

            const result = await response.json();
            if (result.success) {
                toast.success("Daily activity report saved successfully.");
            } else {
                toast.error(result.message || "Failed to save activity report");
            }
        } catch (error) {
            console.error('Error logging activity:', error);
            toast.error("Connection error. Please try again.");
        } finally {
            setSaving(false);
        }
    };

    const filteredChildren = children.filter(child =>
        child.childName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
                    <p className="text-gray-500 font-medium animate-pulse">Syncing student journals...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 mb-2">Daily Activities</h1>
                    <p className="text-gray-500 font-medium">Log participation, ratings, and notes for student activities</p>
                </div>
                <div className="bg-white px-6 py-3 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-3">
                    <Activity className="text-purple-600" size={20} />
                    <span className="text-sm font-black text-gray-900 uppercase tracking-widest">{getTodayString()}</span>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Children Selection List */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm space-y-4">
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                type="text"
                                placeholder="Search children..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-11 pr-4 py-3 bg-gray-50 border border-transparent rounded-2xl w-full text-sm font-medium focus:bg-white focus:ring-4 focus:ring-purple-50 focus:border-purple-200 transition-all outline-none"
                            />
                        </div>
                        <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                            {filteredChildren.map((child) => (
                                <button
                                    key={child._id}
                                    onClick={() => setSelectedChild(child)}
                                    className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all border-2 ${selectedChild?._id === child._id
                                        ? 'bg-purple-50 border-purple-200'
                                        : 'bg-transparent border-transparent hover:bg-gray-50'
                                        }`}
                                >
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm ${selectedChild?._id === child._id ? 'bg-purple-600 text-white' : 'bg-purple-100 text-purple-600'
                                        }`}>
                                        {child.childName[0].toUpperCase()}
                                    </div>
                                    <div className="text-left">
                                        <p className="font-black text-gray-900 text-sm leading-tight">{child.childName}</p>
                                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{child.gender} • {new Date().getFullYear() - new Date(child.dob).getFullYear()} Years</p>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Activity Entry Form */}
                <div className="lg:col-span-2">
                    {selectedChild ? (
                        <div className="bg-white p-8 md:p-10 rounded-[40px] border border-gray-100 shadow-sm space-y-8 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-40 h-40 bg-purple-50 -mr-16 -mt-16 rounded-full opacity-30"></div>

                            <div className="relative z-10 flex items-center justify-between">
                                <div>
                                    <span className="px-4 py-1.5 bg-purple-50 text-purple-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-purple-100">Daily Activity Report</span>
                                    <h2 className="text-3xl font-black text-gray-900 mt-3">{selectedChild.childName}</h2>
                                </div>
                                <div className="w-16 h-16 bg-gradient-to-tr from-purple-100 to-indigo-100 rounded-2xl flex items-center justify-center text-purple-700 font-black text-2xl shadow-inner">
                                    {selectedChild.childName[0].toUpperCase()}
                                </div>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="border-b border-gray-50">
                                            <th className="pb-4 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] pl-2">Activity</th>
                                            <th className="pb-4 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-center">Completed</th>
                                            <th className="pb-4 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Rating</th>
                                            <th className="pb-4 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Notes</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {activities.map((activity, index) => (
                                            <tr key={activity.activityName} className="group hover:bg-gray-50/50 transition-colors">
                                                <td className="py-5 font-bold text-gray-700 pl-2">
                                                    {activity.activityName}
                                                </td>
                                                <td className="py-5 text-center">
                                                    <button
                                                        disabled={activity.status !== 'Completed'}
                                                        onClick={() => {
                                                            const newCompleted = !activity.completed;
                                                            const updated = [...activities];
                                                            updated[index] = { 
                                                                ...updated[index], 
                                                                completed: newCompleted, 
                                                                rating: newCompleted ? updated[index].rating : 0 
                                                            };
                                                            setActivities(updated);
                                                        }}
                                                        className={`transition-all ${activity.status !== 'Completed' ? 'opacity-40 cursor-not-allowed' : 'hover:scale-110 active:scale-95'} ${activity.completed ? 'text-green-500 scale-110' : 'text-gray-200 hover:text-gray-300'}`}
                                                        title={activity.status !== 'Completed' ? "Complete activity first to mark child completion" : ""}
                                                    >
                                                        {activity.completed ? <CheckCircle2 size={24} /> : <XCircle size={24} />}
                                                    </button>
                                                </td>
                                                <td className="py-5">
                                                    <div 
                                                        className={activity.status !== 'Completed' ? "opacity-40 cursor-not-allowed" : ""}
                                                        title={activity.status !== 'Completed' ? "Complete activity first to give rating" : ""}
                                                    >
                                                        <StarRating
                                                            rating={activity.rating}
                                                            disabled={activity.status !== 'Completed'}
                                                            onRate={(val) => handleActivityChange(index, 'rating', val)}
                                                        />
                                                    </div>
                                                </td>
                                                <td className="py-5">
                                                    <input
                                                        type="text"
                                                        placeholder="Add observations..."
                                                        value={activity.notes}
                                                        onChange={(e) => handleActivityChange(index, 'notes', e.target.value)}
                                                        className="w-full bg-gray-50/50 border border-transparent rounded-xl px-3 py-2 text-xs font-medium focus:bg-white focus:ring-2 focus:ring-purple-100 focus:border-purple-200 transition-all outline-none italic placeholder:text-gray-300 shadow-inner"
                                                    />
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            <div className="flex justify-end pt-6 border-t border-gray-50">
                                <button
                                    onClick={handleSubmit}
                                    disabled={saving}
                                    className="px-10 py-5 bg-gradient-to-r from-purple-800 to-indigo-900 text-white rounded-2xl shadow-xl shadow-purple-100 font-black flex items-center gap-3 hover:scale-105 active:scale-95 transition-all disabled:opacity-50 uppercase tracking-widest text-sm"
                                >
                                    {saving ? (
                                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    ) : (
                                        <Save size={20} />
                                    )}
                                    Save Daily Activity Report
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-white p-20 rounded-[40px] border border-gray-100 shadow-sm flex flex-col items-center justify-center text-center animate-in zoom-in-95 duration-500">
                            <div className="w-24 h-24 bg-purple-50 text-purple-200 rounded-full flex items-center justify-center mb-6">
                                <PlusCircle size={48} />
                            </div>
                            <h3 className="text-2xl font-black text-gray-900 mb-2">Select a child</h3>
                            <p className="text-gray-400 font-medium max-w-xs">Pick a student from the left panel to begin logging their daily activities.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default StaffActivities;
