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

import Navbar from '../components/Navbar';

const Home = () => {
    return (
        <div className="min-h-screen bg-white font-sans text-gray-900 selection:bg-purple-100 selection:text-purple-900 overflow-x-hidden">
            <Navbar />

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
                            Welcome to Care Connect
                        </div>

                        <div className="space-y-4">
                            <h1 className="text-6xl md:text-8xl font-black text-gray-900 tracking-tight leading-[0.9]">
                                Safe. Smart.<br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-500">Caring.</span>
                            </h1>
                            <p className="text-xl md:text-2xl text-gray-400 font-medium tracking-tight">
                                All-in-one Care Connect management system.
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
                                    alt="Care Connect children"
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
                        © {new Date().getFullYear()} Care Connect • Modern Management System
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
