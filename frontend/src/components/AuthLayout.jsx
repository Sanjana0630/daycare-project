import React from 'react';

const AuthLayout = ({ children, title, subtitle }) => {
    return (
        <div className="flex flex-col lg:flex-row h-screen w-full bg-white overflow-hidden">
            {/* Left Side - Image (Static on Desktop) */}
            <div className="hidden lg:flex lg:w-1/2 h-full bg-purple-50 items-center justify-center relative overflow-hidden shrink-0">
                <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1587654780291-39c9404d746b?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80')" }}></div>
                <div className="absolute inset-0 bg-gradient-to-br from-purple-900/40 to-indigo-900/40 backdrop-blur-[2px]"></div>

                <div className="relative z-10 text-center p-12 max-w-lg">
                    <h1 className="text-4xl font-bold text-white mb-6 drop-shadow-md">Nurturing Tomorrow's Future</h1>
                    <p className="text-white/90 text-lg leading-relaxed drop-shadow-sm">
                        Manage your daycare efficiently. Safe, secure, and made with love for parents, staff, and admins.
                    </p>
                </div>
            </div>

            {/* Right Side - Form (Scrollable) */}
            <div className="w-full lg:w-1/2 h-full flex flex-col items-center justify-start p-6 sm:p-12 overflow-y-auto scrollbar-hide">
                <div className="w-full max-w-md space-y-6 sm:space-y-8 py-12 lg:py-16">
                    <div className="text-center lg:text-left">
                        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">{title}</h2>
                        {subtitle && <p className="mt-2 text-sm sm:text-base text-gray-500">{subtitle}</p>}
                    </div>
                    {children}
                </div>
            </div>
        </div>
    );
};

export default AuthLayout;
