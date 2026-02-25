import React, { useState, useEffect } from 'react';
import { Baby, Utensils, Moon, Activity, Heart, Smile, Save, Search, PlusCircle } from 'lucide-react';

const StaffActivities = () => {
    const [children, setChildren] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedChild, setSelectedChild] = useState(null);
    const [form, setForm] = useState({
        meals: '',
        napTime: '',
        activityDescription: '',
        healthNotes: '',
        behaviorNotes: '',
        title: 'Daily Activity'
    });

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

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedChild) return;

        setSaving(selectedChild._id);
        try {
            const token = localStorage.getItem('token');
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5005';
            const data = {
                child: selectedChild._id,
                ...form,
                description: form.activityDescription // Mapping to model field
            };

            const response = await fetch(`${apiUrl}/api/staff/add-activity`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(data)
            });

            const result = await response.json();
            if (result.success) {
                alert(`Activity logged for ${selectedChild.childName}!`);
                setForm({
                    meals: '',
                    napTime: '',
                    activityDescription: '',
                    healthNotes: '',
                    behaviorNotes: '',
                    title: 'Daily Activity'
                });
                setSelectedChild(null);
            }
        } catch (error) {
            console.error('Error logging activity:', error);
        } finally {
            setSaving(null);
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
                    <p className="text-gray-500 font-medium">Log meals, naps, and behavior for your assigned children</p>
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
                                className="pl-11 pr-4 py-3 bg-gray-50 border border-transparent rounded-2xl w-full text-sm font-medium focus:bg-white focus:ring-4 focus:ring-purple-50 focus:border-purple-200 transition-all"
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
                        <form onSubmit={handleSubmit} className="bg-white p-10 rounded-[40px] border border-gray-100 shadow-sm space-y-8 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-40 h-40 bg-purple-50 -mr-16 -mt-16 rounded-full opacity-30"></div>

                            <div className="relative z-10">
                                <span className="px-4 py-1.5 bg-purple-50 text-purple-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-purple-100">Logging Entry For</span>
                                <h2 className="text-3xl font-black text-gray-900 mt-3">{selectedChild.childName}</h2>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-3">
                                    <label className="flex items-center gap-2 text-xs font-black text-gray-400 uppercase tracking-widest pl-1">
                                        <Utensils size={14} className="text-amber-500" /> Meals & Nutrition
                                    </label>
                                    <textarea
                                        name="meals"
                                        value={form.meals}
                                        onChange={handleInputChange}
                                        placeholder="What did they eat today?"
                                        className="w-full p-4 bg-gray-50 border border-transparent rounded-2xl text-sm font-medium focus:bg-white focus:ring-4 focus:ring-purple-50 focus:border-purple-200 transition-all min-h-[100px] outline-none"
                                    ></textarea>
                                </div>

                                <div className="space-y-3">
                                    <label className="flex items-center gap-2 text-xs font-black text-gray-400 uppercase tracking-widest pl-1">
                                        <Moon size={14} className="text-indigo-500" /> Nap & Rest Time
                                    </label>
                                    <input
                                        type="text"
                                        name="napTime"
                                        value={form.napTime}
                                        onChange={handleInputChange}
                                        placeholder="Duration (e.g., 1h 30m)"
                                        className="w-full p-4 bg-gray-50 border border-transparent rounded-2xl text-sm font-medium focus:bg-white focus:ring-4 focus:ring-purple-50 focus:border-purple-200 transition-all outline-none"
                                    />
                                </div>

                                <div className="space-y-3 md:col-span-2">
                                    <label className="flex items-center gap-2 text-xs font-black text-gray-400 uppercase tracking-widest pl-1">
                                        <Activity size={14} className="text-emerald-500" /> Activity Description
                                    </label>
                                    <textarea
                                        name="activityDescription"
                                        value={form.activityDescription}
                                        onChange={handleInputChange}
                                        placeholder="What fun things did they do?"
                                        className="w-full p-4 bg-gray-50 border border-transparent rounded-2xl text-sm font-medium focus:bg-white focus:ring-4 focus:ring-purple-50 focus:border-purple-200 transition-all min-h-[100px] outline-none"
                                    ></textarea>
                                </div>

                                <div className="space-y-3">
                                    <label className="flex items-center gap-2 text-xs font-black text-gray-400 uppercase tracking-widest pl-1">
                                        <Heart size={14} className="text-rose-500" /> Health Notes
                                    </label>
                                    <input
                                        type="text"
                                        name="healthNotes"
                                        value={form.healthNotes}
                                        onChange={handleInputChange}
                                        placeholder="Any medications, bruises, etc."
                                        className="w-full p-4 bg-gray-50 border border-transparent rounded-2xl text-sm font-medium focus:bg-white focus:ring-4 focus:ring-purple-50 focus:border-purple-200 transition-all outline-none"
                                    />
                                </div>

                                <div className="space-y-3">
                                    <label className="flex items-center gap-2 text-xs font-black text-gray-400 uppercase tracking-widest pl-1">
                                        <Smile size={14} className="text-purple-500" /> Behavior
                                    </label>
                                    <input
                                        type="text"
                                        name="behaviorNotes"
                                        value={form.behaviorNotes}
                                        onChange={handleInputChange}
                                        placeholder="Mood, social interaction..."
                                        className="w-full p-4 bg-gray-50 border border-transparent rounded-2xl text-sm font-medium focus:bg-white focus:ring-4 focus:ring-purple-50 focus:border-purple-200 transition-all outline-none"
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end pt-6 border-t border-gray-50">
                                <button
                                    type="submit"
                                    disabled={saving === selectedChild._id}
                                    className="px-10 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-2xl shadow-xl shadow-purple-100 font-black flex items-center gap-3 hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
                                >
                                    {saving === selectedChild._id ? (
                                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    ) : (
                                        <Save size={20} />
                                    )}
                                    SUBMIT DAILY JOURNAL
                                </button>
                            </div>
                        </form>
                    ) : (
                        <div className="bg-white p-20 rounded-[40px] border border-gray-100 shadow-sm flex flex-col items-center justify-center text-center">
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
