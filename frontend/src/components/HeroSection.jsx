import React from 'react';

const HeroSection = () => {
    return (
        <div className="relative rounded-3xl overflow-hidden shadow-lg bg-gradient-to-r from-purple-600 to-indigo-600 text-white mb-8 group">
            {/* Background Image */}
            <div
                className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                style={{
                    // High quality daycare/classroom image
                    backgroundImage: "url('https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80')"
                }}
            >
                {/* Overlay gradient for readability */}
                <div className="absolute inset-0 bg-gradient-to-r from-purple-900/80 to-indigo-900/40"></div>
            </div>

            <div className="relative p-6 sm:p-8 md:p-12 z-10 flex flex-col items-start justify-center min-h-[200px] sm:min-h-[220px]">
                <span className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-[10px] sm:text-xs font-medium mb-3 sm:mb-4 border border-white/30 tracking-tight">
                    Admin Dashboard
                </span>
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4 leading-tight">Welcome to Daycare<br />Admin Dashboard</h2>
                <p className="text-purple-100 text-sm sm:text-base md:text-lg max-w-xl leading-relaxed">
                    Manage your children, staff, and daily operations efficiently. All activities will appear here once data is added.
                </p>
                <button className="mt-4 sm:mt-6 px-5 py-2.5 sm:px-6 sm:py-3 bg-white text-purple-700 rounded-xl text-sm sm:text-base font-semibold hover:bg-purple-50 transition-all shadow-md active:scale-95">
                    Get Started
                </button>
            </div>
        </div>
    );
};

export default HeroSection;
