import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    Star,
    ChevronRight,
    Menu,
    X,
    Quote,
    User,
    CheckCircle,
    Loader2,
    MessageSquare
} from 'lucide-react';
import { BASE_URL } from '../config';

const Reviews = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isExpanded, setIsExpanded] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        fetchReviews();
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const fetchReviews = async () => {
        setLoading(true);
        try {
            const response = await fetch(`${BASE_URL}/api/feedback`);
            const data = await response.json();
            if (data.success) {
                // Filter and sort by latest first
                const processedReviews = data.data
                    .filter(item => item.rating && item.message && item.message.trim() !== '')
                    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                setReviews(processedReviews);
            }
        } catch (error) {
            console.error('Error fetching reviews:', error);
        } finally {
            setLoading(false);
        }
    };

    const navLinks = [
        { name: 'Home', path: '/' },
        { name: 'Features', path: '/features' },
        { name: 'About', path: '/about' },
        { name: 'Reviews', path: '/reviews' },
        { name: 'Contact', path: '/contact' },
    ];

    return (
        <div className="min-h-screen bg-white font-sans text-gray-900 selection:bg-purple-100 selection:text-purple-900 overflow-x-hidden">
            {/* Navbar */}
            <nav
                className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
                    scrolled ? 'bg-white/70 backdrop-blur-xl border-b border-gray-100 py-3' : 'bg-transparent py-8'
                }`}
            >
                <div className="container mx-auto px-6 md:px-12 flex items-center justify-between">
                    <Link to="/" className="flex items-center space-x-3 group">
                        <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/20 group-hover:rotate-12 transition-transform duration-500">
                            <span className="text-white font-black text-xl leading-none">C</span>
                        </div>
                        <span className="text-xl font-black tracking-tighter text-gray-900">Care<span className="text-purple-600">Connect</span></span>
                    </Link>

                    <div className="hidden md:flex items-center space-x-12">
                        {navLinks.map((link) => (
                            <Link
                                key={link.name}
                                to={link.path}
                                className={`text-sm font-bold transition-all tracking-wide uppercase ${
                                    link.path === '/reviews' ? 'text-purple-600 underline underline-offset-4 decoration-2' : 'text-gray-400 hover:text-purple-600'
                                }`}
                            >
                                {link.name}
                            </Link>
                        ))}
                        <Link
                            to="/login"
                            className="bg-gray-900 text-white px-8 py-3 rounded-2xl font-black text-sm hover:bg-purple-600 hover:shadow-2xl hover:shadow-purple-500/20 transition-all active:scale-95"
                        >
                            Login
                        </Link>
                    </div>

                    <button
                        className="md:hidden text-gray-900 p-2 hover:bg-purple-50 rounded-xl transition-colors"
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                    >
                        {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
                    </button>
                </div>

                {/* Mobile menu */}
                <div
                    className={`fixed inset-0 bg-white z-[60] flex flex-col items-center justify-center space-y-10 text-3xl font-black transition-all duration-500 md:hidden ${
                        isMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'
                    }`}
                >
                    {navLinks.map((link) => (
                        <Link
                            key={link.name}
                            to={link.path}
                            className="text-gray-900 hover:text-purple-600"
                            onClick={() => setIsMenuOpen(false)}
                        >
                            {link.name}
                        </Link>
                    ))}
                    <Link
                        to="/login"
                        className="bg-purple-600 text-white px-12 py-5 rounded-3xl"
                        onClick={() => setIsMenuOpen(false)}
                    >
                        Login
                    </Link>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative pt-48 pb-20 overflow-hidden bg-white">
                <div className="absolute top-0 left-0 w-full h-full -z-10 bg-[radial-gradient(circle_at_20%_30%,rgba(168,85,247,0.03),transparent_40%)]"></div>
                <div className="container mx-auto px-6 md:px-12 text-center space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-1000">
                    <div className="inline-flex items-center gap-2 px-4 py-1 bg-purple-50 text-purple-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-purple-100">
                        ⭐ Parent Feedback
                    </div>
                    <h1 className="text-6xl md:text-7xl font-black text-gray-900 tracking-tight leading-[0.95]">
                        Loved by Parents.<br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-pink-400 to-indigo-600 italic">Trusted by Families.</span>
                    </h1>
                    <p className="text-lg md:text-xl text-gray-500 font-medium leading-relaxed max-w-2xl mx-auto">
                        Don't just take our word for it. Hear what dozens of happy parents have to say about their experience with Care Connect.
                    </p>
                </div>
            </section>

            {/* Reviews Grid */}
            <section className="py-20 bg-gray-50/50 min-h-[400px]">
                <div className="container mx-auto px-6 md:px-12">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20">
                            <Loader2 className="h-12 w-12 text-purple-600 animate-spin mb-4" />
                            <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">Fetching Real Feedback...</p>
                        </div>
                    ) : reviews.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {reviews.slice(0, isExpanded ? 10 : 3).map((review, idx) => (
                                <div key={review._id || idx} className="bg-white p-10 rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-2xl hover:border-purple-100 hover:-translate-y-2 transition-all duration-500 group relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-24 h-24 bg-purple-50 rounded-full translate-x-12 -translate-y-12 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                    <div className="flex text-amber-400 mb-6 gap-1 relative z-10 transition-transform group-hover:scale-105">
                                        {[...Array(review.rating)].map((_, i) => (
                                            <Star key={i} size={18} fill="currentColor" />
                                        ))}
                                    </div>
                                    <Quote className="text-purple-100 absolute top-10 right-10" size={60} />
                                    <p className="text-lg font-medium text-gray-600 leading-relaxed mb-8 relative z-10 italic">
                                        "{review.message}"
                                    </p>
                                    <div className="flex items-center gap-4 relative z-10">
                                        <div className="w-12 h-12 bg-purple-100 rounded-2xl flex items-center justify-center text-purple-600 shadow-inner group-hover:rotate-6 transition-transform overflow-hidden">
                                            {review.parentPhoto ? (
                                                <img 
                                                    src={review.parentPhoto.startsWith('http') || review.parentPhoto.startsWith('data:') 
                                                        ? review.parentPhoto 
                                                        : `${BASE_URL}${review.parentPhoto}`} 
                                                    alt={review.parentName}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <span className="text-xl font-black uppercase">
                                                    {(review.parentName || "Parent").charAt(0)}
                                                </span>
                                            )}
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-gray-800 tracking-tight">{review.parentName || "Parent"}</h4>
                                            <p className="text-sm font-medium text-purple-500">Parent</p>
                                        </div>
                                    </div>
                                    <div className="mt-6 pt-6 border-t border-gray-50 flex items-center justify-between relative z-10">
                                        <span className="text-[10px] font-black text-purple-200 uppercase tracking-[0.2em]">
                                            {review.category || 'Feedback'}
                                        </span>
                                        <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">
                                            {new Date(review.createdAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-24 bg-white rounded-[3rem] border-2 border-dashed border-gray-100 max-w-2xl mx-auto shadow-inner">
                            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-200">
                                <MessageSquare size={40} />
                            </div>
                            <h3 className="text-2xl font-black text-gray-900 tracking-tight mb-2">No reviews available yet</h3>
                            <p className="text-gray-400 font-medium">Be the first parent to share your journey with us!</p>
                        </div>
                    )}
                </div>

                {/* Show All / Less Button */}
                {reviews.length > 3 && !loading && (
                    <div className="flex justify-center mt-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
                        <button
                            onClick={() => setIsExpanded(!isExpanded)}
                            className="group flex items-center gap-3 px-10 py-5 bg-white border-2 border-purple-100 rounded-[2rem] font-black text-sm text-purple-600 hover:bg-purple-600 hover:text-white hover:border-purple-600 hover:shadow-2xl hover:shadow-purple-500/30 transition-all active:scale-[0.98] shadow-sm transform transition-transform"
                        >
                            {isExpanded ? 'Show Less' : 'Show All Reviews'}
                            <div className={`p-1.5 rounded-full transition-all duration-500 ${isExpanded ? 'bg-purple-100 text-purple-600 rotate-180' : 'bg-purple-50 text-purple-600 group-hover:bg-white/20 group-hover:text-white group-hover:translate-x-1'}`}>
                                <ChevronRight size={16} />
                            </div>
                        </button>
                    </div>
                )}
            </section>

            {/* Single-line Minimal Trust Strip */}
            <section className="py-20 bg-white">
                <div className="container mx-auto px-6 md:px-12 flex flex-wrap justify-center items-center gap-10 grayscale opacity-40 hover:grayscale-0 hover:opacity-100 transition-all duration-1000">
                    <div className="flex items-center gap-2">
                        <CheckCircle size={24} className="text-green-500" />
                        <span className="font-black text-xs uppercase tracking-[0.2em]">Verified Reviews</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Star size={24} className="text-amber-500" />
                        <span className="font-black text-xs uppercase tracking-[0.2em]">Authentic Experiences</span>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20">
                <div className="container mx-auto px-6 md:px-12">
                    <div className="bg-gray-900 rounded-[4rem] p-12 md:p-20 text-center space-y-10 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-full h-full -z-10 bg-[radial-gradient(circle_at_80%_20%,rgba(168,85,247,0.15),transparent_40%)]"></div>
                        <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight leading-tight max-w-2xl mx-auto">
                            Experience Care Connect <br />
                            <span className="text-purple-400 italic font-medium">Difference Today.</span>
                        </h2>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-4">
                            <Link
                                to="/register"
                                className="w-full sm:w-auto bg-purple-600 text-white px-10 py-5 rounded-3xl font-black text-lg shadow-2xl shadow-purple-500/20 hover:bg-purple-500 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2"
                            >
                                Enroll Now
                                <ChevronRight size={20} />
                            </Link>
                            <Link
                                to="/contact"
                                className="w-full sm:w-auto bg-white/10 text-white px-10 py-5 rounded-3xl font-black text-lg hover:bg-white/20 transition-all border border-white/10 text-center"
                            >
                                Contact Us
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-12 border-t border-gray-100 text-center">
                <p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.4em]">
                    © {new Date().getFullYear()} Care Connect • Trusted Reviews
                </p>
            </footer>
        </div>
    );
};

export default Reviews;
