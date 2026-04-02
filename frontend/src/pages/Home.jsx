import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    ChevronRight,
    Menu,
    X,
    CheckCircle,
    Star,
    CreditCard,
    Bell,
    Heart
} from 'lucide-react';
import HeroImage from '../assets/hero_kids.png';

const Home = () => {
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
        { name: 'Home', href: '#home' },
        { name: 'About', href: '#' },
        { name: 'Features', href: '#' },
        { name: 'Contact', href: '#' },
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

                    {/* Desktop Nav */}
                    <div className="hidden md:flex items-center space-x-12">
                        {navLinks.map((link) => (
                            <a
                                key={link.name}
                                href={link.href}
                                className="text-sm font-bold text-gray-400 hover:text-purple-600 transition-all tracking-wide uppercase"
                            >
                                {link.name}
                            </a>
                        ))}
                        <Link
                            to="/login"
                            className="bg-gray-900 text-white px-8 py-3 rounded-2xl font-black text-sm hover:bg-purple-600 hover:shadow-2xl hover:shadow-purple-500/20 transition-all active:scale-95"
                        >
                            Login
                        </Link>
                    </div>

                    {/* Mobile Menu Toggle */}
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
                        <a
                            key={link.name}
                            href={link.href}
                            className="text-gray-900 hover:text-purple-600"
                            onClick={() => setIsMenuOpen(false)}
                        >
                            {link.name}
                        </a>
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
            <main id="home" className="relative min-h-screen flex items-center pt-20 overflow-hidden">
                {/* Minimal Background Effects */}
                <div className="absolute top-0 left-0 w-full h-full -z-10 bg-[radial-gradient(circle_at_20%_30%,rgba(168,85,247,0.08),transparent_40%)]"></div>
                <div className="absolute bottom-0 right-0 w-full h-full -z-10 bg-[radial-gradient(circle_at_80%_70%,rgba(236,72,153,0.05),transparent_40%)]"></div>

                <div className="container mx-auto px-6 md:px-12 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                    {/* Content Left */}
                    <div className="space-y-10 max-w-2xl animate-in fade-in slide-in-from-left-8 duration-1000">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-purple-50 text-purple-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-purple-100">
                            <span className="flex h-2 w-2 rounded-full bg-purple-500"></span>
                            Welcome to TinyTots
                        </div>

                        <div className="space-y-4">
                            <h1 className="text-6xl md:text-8xl font-black text-gray-900 tracking-tight leading-[0.9]">
                                Safe. Smart.<br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-500">Caring.</span>
                            </h1>
                            <p className="text-xl md:text-2xl text-gray-400 font-medium tracking-tight">
                                All-in-one daycare management system.
                            </p>
                        </div>

                        <div className="flex flex-col sm:flex-row items-center gap-6 pt-2">
                            <Link
                                to="/register"
                                className="w-full sm:w-auto bg-gray-900 text-white px-10 py-5 rounded-3xl font-black text-lg shadow-2xl shadow-gray-900/10 hover:bg-purple-600 hover:shadow-purple-500/30 hover:scale-105 transition-all flex items-center justify-center gap-2"
                            >
                                Get Started
                                <ChevronRight size={20} />
                            </Link>
                            <Link
                                to="/login"
                                className="w-full sm:w-auto px-10 py-5 rounded-3xl font-black text-lg text-gray-400 hover:text-purple-600 hover:bg-purple-50 transition-all border-2 border-transparent hover:border-purple-100 text-center"
                            >
                                Login
                            </Link>
                        </div>

                        {/* Minimal Feature Strip */}
                        <div className="flex flex-wrap items-center gap-x-10 gap-y-6 pt-12 border-t border-gray-100">
                            <div className="flex items-center gap-2 group cursor-default">
                                <CheckCircle size={18} className="text-green-500 group-hover:scale-110 transition-transform" />
                                <span className="text-xs font-black text-gray-400 uppercase tracking-widest">Attendance tracking</span>
                            </div>
                            <div className="flex items-center gap-2 group cursor-default">
                                <CreditCard size={18} className="text-purple-500 group-hover:scale-110 transition-transform" />
                                <span className="text-xs font-black text-gray-400 uppercase tracking-widest">Fee management</span>
                            </div>
                            <div className="flex items-center gap-2 group cursor-default">
                                <Bell size={18} className="text-pink-500 group-hover:scale-110 transition-transform" />
                                <span className="text-xs font-black text-gray-400 uppercase tracking-widest">Daily updates</span>
                            </div>
                        </div>
                    </div>

                    {/* Image Right */}
                    <div className="relative lg:h-[600px] flex items-center justify-center animate-in fade-in zoom-in duration-1000 delay-300">
                        {/* Background Glow Behind Image */}
                        <div className="absolute inset-0 bg-gradient-to-tr from-purple-200 to-pink-200 rounded-[5rem] blur-[100px] opacity-20 transform -rotate-6"></div>
                        
                        <div className="relative group">
                            <div className="absolute -inset-1 bg-gradient-to-tr from-purple-600 to-pink-500 rounded-[3rem] blur-xl opacity-20 group-hover:opacity-40 transition-opacity duration-500"></div>
                            <div className="relative bg-white p-3 rounded-[3rem] shadow-2xl shadow-purple-900/5 rotate-2 group-hover:rotate-0 transition-transform duration-700 active:scale-[0.98]">
                                <img
                                    src={HeroImage}
                                    alt="Daycare children"
                                    className="w-full max-w-[500px] h-auto rounded-[2.5rem] object-cover"
                                />
                            </div>
                            
                            {/* Floating Heart Icon */}
                            <div className="absolute -top-6 -right-6 w-20 h-20 bg-white rounded-[2rem] shadow-2xl flex items-center justify-center text-pink-500 animate-bounce cursor-default border border-pink-50">
                                <Heart size={36} fill="currentColor" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Single-line Minimal Footer */}
                <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-full text-center">
                    <p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.4em]">
                        © {new Date().getFullYear()} TinyTots Daycare • Modern Management System
                    </p>
                </div>
            </main>

            <style dangerouslySetInnerHTML={{
                __html: `
                @keyframes float {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-15px); }
                }
                .animate-float { animation: float 6s ease-in-out infinite; }
            `}} />
        </div>
    );
};

export default Home;
