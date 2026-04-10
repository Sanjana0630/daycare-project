import React, { useState, useEffect } from 'react';
import { 
    Star, 
    MessageSquare, 
    Send, 
    Loader2, 
    AlertCircle, 
    CheckCircle,
    Baby,
    ChevronDown,
    Calendar
} from 'lucide-react';
import { BASE_URL } from '../config';

const ParentFeedback = () => {
    const [child, setChild] = useState(null);
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [showSuccessModal, setShowSuccessModal] = useState(false);

    // Form State
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [category, setCategory] = useState('Overall Experience');
    const [message, setMessage] = useState('');

    const token = localStorage.getItem('token');

    useEffect(() => {
        fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
        setLoading(true);
        try {
            // 1. Fetch linked child
            const childRes = await fetch(`${BASE_URL}/api/parent/child`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const childData = await childRes.json();
            if (childData.success) {
                setChild(childData.data);
            }

            // 2. Fetch feedback history
            const historyRes = await fetch(`${BASE_URL}/api/parent/feedback`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const historyData = await historyRes.json();
            if (historyData.success) {
                setHistory(historyData.data);
            }
        } catch (err) {
            console.error('Error fetching data:', err);
            setError('Failed to load feedback data.');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (rating === 0) return setError('Please select a rating.');
        if (!message.trim()) return setError('Please enter a message.');
        if (!child) return setError('No child linked to your account.');

        setSubmitting(true);
        setError(null);

        try {
            const response = await fetch(`${BASE_URL}/api/parent/feedback`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    childId: child._id,
                    rating,
                    category,
                    message
                })
            });

            const data = await response.json();
            if (data.success) {
                setShowSuccessModal(true);
                setRating(0);
                setMessage('');
                setCategory('Overall Experience');
                // Refresh history
                fetchInitialData();
            } else {
                setError(data.message || 'Failed to submit feedback.');
            }
        } catch (err) {
            setError('Connection error. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    const categories = ['Overall Experience', 'Teacher', 'Activities', 'Facilities'];

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
                <Loader2 className="h-10 w-10 text-purple-500 animate-spin mb-4" />
                <p className="text-gray-500 font-medium">Loading feedback module...</p>
            </div>
        );
    }

    return (
        <div className="animate-in fade-in duration-700 max-w-4xl mx-auto space-y-12 pb-20">
            {/* Header */}
            <div>
                <h1 className="text-4xl font-black text-gray-900 tracking-tight mb-2">Give Your Feedback</h1>
                <p className="text-gray-500 font-medium text-lg">Share your experience with daycare</p>
            </div>

            {/* Main Form Card */}
            <div className="bg-white rounded-[2.5rem] p-10 shadow-2xl shadow-purple-900/5 border border-gray-100 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none transform translate-x-10 -translate-y-10">
                    <MessageSquare size={200} className="text-purple-600" />
                </div>

                <form onSubmit={handleSubmit} className="space-y-8 relative z-10">
                    {/* Select Child Info (Read-only if only one child) */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                            <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Selected Child</label>
                            <div className="flex items-center gap-3 p-4 bg-purple-50/50 rounded-2xl border border-purple-100">
                                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-purple-600 shadow-sm">
                                    <Baby size={20} />
                                </div>
                                <div>
                                    <p className="text-sm font-black text-gray-900">{child?.childName || 'No Child Found'}</p>
                                    <p className="text-[10px] text-purple-500 font-bold">Class: {child?.class || 'N/A'}</p>
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Category</label>
                            <div className="relative">
                                <select
                                    value={category}
                                    onChange={(e) => setCategory(e.target.value)}
                                    className="w-full pl-5 pr-12 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:bg-white focus:ring-4 focus:ring-purple-100 focus:border-purple-200 transition-all outline-none appearance-none font-bold text-gray-700 shadow-sm"
                                >
                                    {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                                </select>
                                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={20} />
                            </div>
                        </div>
                    </div>

                    {/* Star Rating */}
                    <div className="text-center py-6 bg-gray-50/30 rounded-[2rem] border border-dashed border-gray-200">
                        <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-4">Your Rating</label>
                        <div className="flex items-center justify-center gap-3">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    type="button"
                                    onClick={() => setRating(star)}
                                    onMouseEnter={() => setHoverRating(star)}
                                    onMouseLeave={() => setHoverRating(0)}
                                    className="transform hover:scale-125 transition-transform duration-200 focus:outline-none"
                                >
                                    <Star
                                        size={48}
                                        className={`${
                                            star <= (hoverRating || rating)
                                                ? 'fill-amber-400 text-amber-400 filter drop-shadow-[0_0_8px_rgba(251,191,36,0.4)]'
                                                : 'text-gray-200'
                                        } transition-all duration-300`}
                                    />
                                </button>
                            ))}
                        </div>
                        <p className="mt-4 text-sm font-black text-purple-600 uppercase tracking-widest">
                            {rating === 1 ? 'Poor' : rating === 2 ? 'Fair' : rating === 3 ? 'Good' : rating === 4 ? 'Great' : rating === 5 ? 'Excellent!' : 'Tap to rate'}
                        </p>
                    </div>

                    {/* Message Area */}
                    <div>
                        <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Your Message</label>
                        <textarea
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder="Write your feedback..."
                            rows="4"
                            className="w-full p-6 bg-gray-50 border border-gray-100 rounded-3xl focus:bg-white focus:ring-4 focus:ring-purple-100 focus:border-purple-200 transition-all outline-none font-medium text-gray-700 resize-none shadow-sm"
                        ></textarea>
                    </div>

                    {/* Status Messages */}
                    {error && (
                        <div className="flex items-center gap-3 p-4 bg-red-50 text-red-600 rounded-2xl border border-red-100 animate-in slide-in-from-top-2">
                            <AlertCircle size={20} />
                            <p className="text-sm font-bold">{error}</p>
                        </div>
                    )}

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={submitting}
                        className="w-full py-5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-black rounded-3xl hover:from-purple-700 hover:to-indigo-700 transition-all shadow-xl shadow-purple-200 flex items-center justify-center gap-3 active:scale-[0.98] disabled:opacity-70 group"
                    >
                        {submitting ? <Loader2 className="animate-spin" size={24} /> : <Send size={24} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />}
                        {submitting ? 'Submitting...' : 'Submit Feedback'}
                    </button>
                </form>
            </div>

            {/* Feedback History */}
            <div className="space-y-8 pt-6">
                <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-black text-gray-900 tracking-tight">My Feedback</h2>
                    <span className="px-4 py-1.5 bg-gray-100 text-gray-400 rounded-full text-[10px] font-black uppercase tracking-widest">
                        Total entries: {history.length}
                    </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {history.map((item) => (
                        <div key={item._id} className="bg-white rounded-[2rem] p-8 border border-gray-100 shadow-sm hover:shadow-xl hover:border-purple-100 transition-all duration-300 relative group overflow-hidden">
                            <div className="flex items-start justify-between mb-4 relative z-10">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-0.5">
                                        {[...Array(5)].map((_, i) => (
                                            <Star
                                                key={i}
                                                size={14}
                                                className={i < item.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-200'}
                                            />
                                        ))}
                                    </div>
                                    <span className="inline-block px-3 py-1 bg-purple-50 text-purple-600 rounded-lg text-[10px] font-black uppercase tracking-widest mt-2 border border-purple-100">
                                        {item.category}
                                    </span>
                                </div>
                                <div className="text-right">
                                    <div className="flex items-center gap-1.5 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                        <Calendar size={12} />
                                        {new Date(item.createdAt).toLocaleDateString()}
                                    </div>
                                </div>
                            </div>
                            <p className="text-gray-600 font-medium leading-relaxed relative z-10">"{item.message}"</p>
                            
                            {/* Subtle check icon for visibility */}
                            {!item.isHidden ? (
                                <div className="absolute -bottom-2 -right-2 p-6 opacity-[0.03] group-hover:opacity-10 transition-opacity">
                                    <CheckCircle size={80} className="text-green-600" />
                                </div>
                            ) : (
                                <div className="absolute top-2 right-2 px-3 py-1 bg-gray-100 text-gray-400 rounded-full text-[8px] font-black uppercase">
                                    Hidden by Admin
                                </div>
                            )}
                        </div>
                    ))}

                    {history.length === 0 && (
                        <div className="md:col-span-2 py-20 text-center bg-gray-50/50 rounded-[2.5rem] border-2 border-dashed border-gray-200 mt-4">
                            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-gray-200 mx-auto mb-4 shadow-sm border border-gray-100">
                                <MessageSquare size={32} />
                            </div>
                            <h3 className="text-gray-400 font-bold mb-1">No feedback history yet</h3>
                            <p className="text-gray-300 text-xs">Your submitted feedback will appear here.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Success Modal */}
            {showSuccessModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white rounded-[2.5rem] p-10 shadow-2xl shadow-purple-900/10 border border-gray-100 max-w-sm w-full text-center space-y-6 animate-in zoom-in-95 duration-300">
                        <div className="w-20 h-20 bg-green-50 rounded-3xl flex items-center justify-center mx-auto text-green-500 shadow-inner">
                            <CheckCircle size={48} strokeWidth={2.5} />
                        </div>
                        <div>
                            <h3 className="text-2xl font-black text-gray-900 mb-2">Success!</h3>
                            <p className="text-gray-500 font-medium leading-relaxed">
                                Your feedback has been submitted successfully to the administration.
                            </p>
                        </div>
                        <button
                            onClick={() => setShowSuccessModal(false)}
                            className="w-full py-4 bg-gray-900 text-white font-black rounded-2xl shadow-xl shadow-gray-200 hover:bg-purple-600 hover:shadow-purple-100 transition-all uppercase tracking-widest text-sm active:scale-95"
                        >
                            OK
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ParentFeedback;
