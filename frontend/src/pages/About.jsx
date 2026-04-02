import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    Heart,
    CheckCircle,
    Star,
    ShieldCheck,
    Activity,
    CreditCard,
    Bell,
    MessageSquare,
    ChevronRight,
    Menu,
    X,
    Users
} from 'lucide-react';
import AboutImage1 from '../assets/about_daycare.png';
import AboutImage2 from '../assets/daycare_activities.png';

const About = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const navLinks = [
        { name: 'Home', path: '/' },
        { name: 'About', path: '/about' },
        { name: 'Features', path: '/features' },
        { name: 'Contact', path: '#' },
    ];

    const quickInfo = [
        { title: "Safe Environment", icon: <ShieldCheck className="text-green-500" size={20} /> },
        { title: "Smart Tracking", icon: <Activity className="text-purple-500" size={20} /> },
        { title: "Parent Connectivity", icon: <Heart className="text-pink-500" size={20} /> }
    ];

    const offerings = [
        {
            title: "Real-time Attendance",
            desc: "Instant check-in/out updates for parent peace of mind.",
            icon: <Activity className="text-purple-600" size={24} />
        },
        {
            title: "Fee Management",
            desc: "Automated billing and secure digital payment tracking.",
            icon: <CreditCard className="text-pink-600" size={24} />
        },
        {
            title: "Daily Activity Updates",
            desc: "Regular updates on meals, naps, and learning milestones.",
            icon: <Star className="text-amber-500" size={24} />
        },
        {
            title: "Parent-Teacher Chat",
            desc: "Direct communication channel for quick updates and queries.",
            icon: <MessageSquare className="text-blue-500" size={24} />
        }
    ];

    const whyUsGrid = [
        { title: "Easy to Use", icon: <CheckCircle className="text-purple-500" size={20} /> },
        { title: "Secure System", icon: <ShieldCheck className="text-indigo-500" size={20} /> },
        { title: "Real-Time Updates", icon: <Bell className="text-pink-500" size={20} /> },
        { title: "Modern Design", icon: <Star className="text-blue-500" size={20} /> }
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
                            <span className="text-white font-black text-xl leading-none">T</span>
                        </div>
                        <span className="text-xl font-black tracking-tighter text-gray-900">Tiny<span className="text-purple-600">Tots</span></span>
                    </Link>

                    <div className="hidden md:flex items-center space-x-12">
                        {navLinks.map((link) => (
                            <Link
                                key={link.name}
                                to={link.path}
                                className={`text-sm font-bold transition-all tracking-wide uppercase ${
                                    link.path === '/about' ? 'text-purple-600 underline underline-offset-4 decoration-2' : 'text-gray-400 hover:text-purple-600'
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

            {/* Hero Section - 2 Column Layout */}
            <section className="relative pt-32 pb-8 overflow-hidden bg-white">
                <div className="absolute top-0 left-0 w-full h-full -z-10 bg-[radial-gradient(circle_at_20%_30%,rgba(168,85,247,0.03),transparent_40%)]"></div>
                
                <div className="container mx-auto px-6 md:px-12 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center min-h-[500px]">
                    <div className="space-y-6 animate-in fade-in slide-in-from-left-8 duration-1000">
                        <div className="inline-flex items-center gap-2 px-4 py-1 bg-purple-50 text-purple-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-purple-100">
                            ✨ About TinyTots
                        </div>
                        <h1 className="text-6xl md:text-7xl font-black text-gray-900 tracking-tight leading-[0.95]">
                            Smart. Safe.<br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-pink-400 to-indigo-600 italic">Connected.</span>
                        </h1>
                        <p className="text-lg md:text-xl text-gray-500 font-medium leading-relaxed max-w-xl">
                            We help daycare centers and parents stay connected through technology, ensuring safety, transparency, and better care for every child.
                        </p>
                    </div>

                    <div className="relative flex justify-center lg:justify-end animate-in fade-in slide-in-from-right-8 duration-1000 delay-200">
                        {/* Main Image Box */}
                        <div className="absolute inset-x-0 bottom-0 top-1/2 bg-gradient-to-tr from-purple-100 to-pink-100 rounded-full blur-[120px] opacity-20 transform -rotate-12 scale-110"></div>
                        
                        <div className="relative z-10 w-full max-w-[420px] group transition-all duration-700">
                            {/* Primary Image */}
                            <div className="relative bg-white p-3 rounded-[3.5rem] shadow-2xl shadow-purple-900/10 -rotate-2 group-hover:rotate-0 transition-transform duration-700 border border-purple-50">
                                <div className="bg-gray-50 rounded-[3rem] overflow-hidden aspect-[4/5] relative group-hover:shadow-inner transition-all">
                                    <img 
                                        src={AboutImage1} 
                                        alt="Daycare Interior" 
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-purple-900/20 to-transparent"></div>
                                </div>
                            </div>
                            
                            {/* Secondary Image - Overlapping */}
                            <div className="absolute -bottom-16 -right-12 w-48 h-48 bg-white p-2.5 rounded-[2.5rem] shadow-2xl shadow-pink-900/10 rotate-6 group-hover:rotate-3 transition-transform duration-1000 border border-pink-50 animate-float">
                                <div className="bg-gray-50 rounded-[2rem] overflow-hidden w-full h-full">
                                    <img 
                                        src={AboutImage2} 
                                        alt="Daycare Activities" 
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                            </div>

                            {/* Floating Heart Icon Accent */}
                            <div className="absolute -top-6 -left-6 w-20 h-20 bg-white rounded-[2rem] shadow-2xl flex items-center justify-center text-pink-500 animate-pulse border border-pink-50">
                                <Heart size={36} fill="currentColor" />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Quick Info Strip - Fills Space Smartly */}
            <section className="pb-12 bg-white">
                <div className="container mx-auto px-6 md:px-12">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {quickInfo.map((info, idx) => (
                            <div key={idx} className="bg-white/50 backdrop-blur-sm p-5 rounded-[2rem] border border-gray-100 shadow-sm flex items-center gap-4 hover:shadow-md transition-all group active:scale-95">
                                <div className="w-10 h-10 bg-white rounded-2xl flex items-center justify-center shadow-inner group-hover:rotate-6 transition-transform">
                                    {info.icon}
                                </div>
                                <p className="text-sm font-black text-gray-900 tracking-tight uppercase">{info.title}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Mission Section - Compact */}
            <section className="py-12 bg-gray-50/30">
                <div className="container mx-auto px-6 md:px-12">
                    <div className="max-w-4xl mx-auto bg-white rounded-[2.5rem] p-10 md:p-14 shadow-2xl shadow-purple-900/5 text-center space-y-6 border border-white relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-purple-50 rounded-full -translate-y-16 translate-x-16 blur-2xl"></div>
                        <h2 className="text-3xl font-black text-gray-900 tracking-tight">Our Mission</h2>
                        <p className="text-xl md:text-2xl font-medium text-gray-600 leading-relaxed max-w-2xl mx-auto">
                            "To make daycare smarter, safer, and more connected for parents and staff everywhere."
                        </p>
                    </div>
                </div>
            </section>

            {/* What We Offer - Grid Audit */}
            <section className="py-16 bg-white">
                <div className="container mx-auto px-6 md:px-12">
                    <div className="text-center mb-12 space-y-3">
                        <h2 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight">Essential Services</h2>
                        <p className="text-gray-400 font-bold tracking-widest uppercase text-[10px]">What we do best</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {offerings.map((item, idx) => (
                            <div key={idx} className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-2xl hover:border-purple-100 transition-all duration-500 group">
                                <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-purple-50 transition-all shadow-inner">
                                    {item.icon}
                                </div>
                                <h3 className="text-lg font-black text-gray-900 tracking-tight mb-2">{item.title}</h3>
                                <p className="text-sm font-medium text-gray-500 leading-relaxed">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Why Us - Compact 2x2 Grid Overhaul */}
            <section className="py-16 bg-gray-900 text-white rounded-[3rem] mx-4 md:mx-12 overflow-hidden relative">
                <div className="absolute top-0 right-0 w-full h-full -z-10 bg-[radial-gradient(circle_at_80%_20%,rgba(168,85,247,0.15),transparent_40%)]"></div>
                
                <div className="container mx-auto px-6 md:px-12 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                    <div className="space-y-8">
                        <div className="space-y-4">
                            <h2 className="text-4xl md:text-5xl font-black tracking-tight leading-tight">
                                Why Choose <span className="text-purple-400/90 underline decoration-purple-600/30 decoration-8 underline-offset-8">Us?</span>
                            </h2>
                            <p className="text-gray-400 font-medium">Focusing on modern solutions for busy families.</p>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                            {whyUsGrid.map((item, idx) => (
                                <div key={idx} className="bg-white/5 p-6 rounded-[2rem] border border-white/5 hover:bg-white/10 transition-all space-y-4 group">
                                    <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center group-hover:scale-110 group-hover:bg-white/10 transition-all">
                                        {item.icon}
                                    </div>
                                    <p className="text-sm font-black text-gray-200 tracking-tight leading-none uppercase">{item.title}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                    
                    <div className="relative flex justify-center lg:justify-end">
                        <div className="w-48 h-48 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-[3rem] p-1 rotate-6 shadow-2xl relative z-10">
                            <div className="bg-gray-900 w-full h-full rounded-[2.8rem] flex flex-col items-center justify-center p-6 text-center space-y-2">
                                <ShieldCheck size={48} className="text-purple-400" />
                                <h4 className="font-black text-lg tracking-tight leading-none uppercase">SSL<br />Secure</h4>
                            </div>
                        </div>
                        <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-white/5 rounded-[2.5rem] border border-white/10 backdrop-blur-sm -rotate-12"></div>
                    </div>
                </div>
            </section>

            {/* Small Trust Section - Tighter Padding */}
            <section className="py-16">
                <div className="container mx-auto px-6 md:px-12 text-center space-y-8">
                    <p className="text-[10px] font-black text-gray-400 tracking-[0.4em] uppercase">Verified and Trusted Worldwide</p>
                    <div className="flex flex-wrap justify-center items-center gap-10 grayscale opacity-40 hover:grayscale-0 hover:opacity-100 transition-all duration-1000">
                        <ShieldCheck size={28} />
                        <Users size={28} />
                        <Star size={28} />
                    </div>
                </div>
            </section>

            {/* Minimal Footer */}
            <footer className="py-10 border-t border-gray-100 bg-gray-50/30 text-center">
                <p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.4em]">
                    © {new Date().getFullYear()} TinyTots • Smart. Safe. Connected.
                </p>
            </footer>

            <style dangerouslySetInnerHTML={{
                __html: `
                @keyframes float {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-10px); }
                }
                .animate-float { animation: float 5s ease-in-out infinite; }
            `}} />
        </div>
    );
};

export default About;
