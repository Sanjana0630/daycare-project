import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    ChevronRight,
    Menu,
    X,
    Users,
    Activity,
    CreditCard,
    BarChart3,
    ShieldCheck,
    Bell,
    CheckSquare,
    Star,
    LayoutDashboard
} from 'lucide-react';
import FeaturesHero from '../assets/features_hero.png';

const Features = () => {
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
        { name: 'Features', path: '/features' },
        { name: 'About', path: '/about' },
        { name: 'Reviews', path: '/reviews' },
        { name: 'Contact', path: '/contact' },
    ];

    const featureList = [
        {
            title: "Child Management",
            desc: "Easily manage child profiles, classes, and records.",
            icon: <Users className="text-purple-600" size={24} />
        },
        {
            title: "Attendance Tracking",
            desc: "Mark and track daily attendance with detailed reports.",
            icon: <Activity className="text-pink-600" size={24} />
        },
        {
            title: "Fee Management",
            desc: "Automated fee tracking with due dates and late fees.",
            icon: <CreditCard className="text-indigo-600" size={24} />
        },
        {
            title: "Reports & Analytics",
            desc: "Generate attendance and activity reports instantly.",
            icon: <BarChart3 className="text-purple-600" size={24} />
        },
        {
            title: "Staff Management",
            desc: "Assign teachers and manage staff efficiently.",
            icon: <ShieldCheck className="text-pink-600" size={24} />
        },
        {
            title: "Real-time Notifications",
            desc: "Instant alerts for parents and staff members.",
            icon: <Bell className="text-indigo-600" size={24} />
        },
        {
            title: "Activity Tracking",
            desc: "Monitor daily activities and child progress.",
            icon: <CheckSquare className="text-purple-600" size={24} />
        },
        {
            title: "Feedback System",
            desc: "Parents can give ratings and feedback easily.",
            icon: <Star className="text-amber-500" size={24} />
        }
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
                                    link.path === '/features' ? 'text-purple-600 underline underline-offset-4 decoration-2' : 'text-gray-400 hover:text-purple-600'
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
                <div className="container mx-auto px-6 md:px-12 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                    <div className="space-y-8 animate-in fade-in slide-in-from-left-8 duration-1000">
                        <div className="inline-flex items-center gap-2 px-4 py-1 bg-purple-50 text-purple-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-purple-100">
                            🚀 Advanced Capabilities
                        </div>
                        <h1 className="text-6xl md:text-7xl font-black text-gray-900 tracking-tight leading-[0.95]">
                            Powerful Features for<br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-pink-400 to-indigo-600">Smart Care Connect.</span>
                        </h1>
                        <p className="text-lg md:text-xl text-gray-500 font-medium leading-relaxed max-w-xl">
                            Everything you need to manage Care Connect efficiently and keep parents connected in one seamless platform.
                        </p>
                    </div>

                    <div className="relative flex justify-center lg:justify-end animate-in fade-in slide-in-from-right-8 duration-1000 delay-200">
                        <div className="absolute inset-0 bg-gradient-to-tr from-purple-100 to-pink-100 rounded-full blur-[100px] opacity-20 transform -rotate-12 scale-110"></div>
                        <div className="relative z-10 w-full max-w-[500px] bg-white p-3 rounded-[3.5rem] shadow-2xl shadow-purple-900/10 active:scale-[0.98] transition-transform">
                            <div className="bg-gray-50 rounded-[3rem] overflow-hidden aspect-[4/3]">
                                <img
                                    src={FeaturesHero}
                                    alt="Features Dashboard"
                                    className="w-full h-full object-cover grayscale-[10%] hover:grayscale-0 transition-all duration-700"
                                />
                            </div>
                        </div>
                        {/* Floating Dashboard Icon */}
                        <div className="absolute -top-6 -left-6 w-20 h-20 bg-white rounded-[2rem] shadow-2xl flex items-center justify-center text-purple-500 border border-purple-50 animate-bounce">
                            <LayoutDashboard size={36} />
                        </div>
                    </div>
                </div>
            </section>

            {/* Feature Grid */}
            <section className="py-24 bg-gray-50/50">
                <div className="container mx-auto px-6 md:px-12">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                        {featureList.map((feature, idx) => (
                            <div key={idx} className="bg-white p-10 rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-2xl hover:border-purple-100 hover:-translate-y-2 transition-all duration-500 group relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-24 h-24 bg-purple-50 rounded-full translate-x-12 -translate-y-12 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 group-hover:bg-purple-50 transition-all shadow-inner relative z-10">
                                    {feature.icon}
                                </div>
                                <h3 className="text-xl font-black text-gray-900 tracking-tight mb-4 relative z-10">{feature.title}</h3>
                                <p className="text-sm font-medium text-gray-500 leading-relaxed relative z-10 line-clamp-2">{feature.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-24">
                <div className="container mx-auto px-6 md:px-12">
                    <div className="bg-gray-900 rounded-[4rem] p-12 md:p-24 text-center space-y-10 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-full h-full -z-10 bg-[radial-gradient(circle_at_80%_20%,rgba(168,85,247,0.15),transparent_40%)]"></div>
                        <h2 className="text-4xl md:text-6xl font-black text-white tracking-tight leading-tight max-w-3xl mx-auto">
                            Ready to simplify your <br />
                            <span className="text-purple-400 italic">Care Connect?</span>
                        </h2>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-4">
                            <Link
                                to="/register"
                                className="w-full sm:w-auto bg-purple-600 text-white px-10 py-5 rounded-3xl font-black text-lg shadow-2xl shadow-purple-500/20 hover:bg-purple-500 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2"
                            >
                                Get Started
                                <ChevronRight size={20} />
                            </Link>
                            <Link
                                to="/login"
                                className="w-full sm:w-auto bg-white/10 text-white px-10 py-5 rounded-3xl font-black text-lg hover:bg-white/20 transition-all border border-white/10 text-center"
                            >
                                Login
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-12 border-t border-gray-100 text-center">
                <p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.4em]">
                    © {new Date().getFullYear()} Care Connect • Efficient Management
                </p>
            </footer>
        </div>
    );
};

export default Features;
