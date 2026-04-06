import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, ChevronRight } from 'lucide-react';

const Navbar = ({ showLogin = true }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const location = useLocation();

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const isHomePage = location.pathname === '/';
    const showBackground = scrolled || isMenuOpen || !isHomePage;

    const navLinks = [
        { name: 'Home', path: '/' },
        { name: 'Features', path: '/features' },
        { name: 'About', path: '/about' },
        { name: 'Reviews', path: '/reviews' },
        { name: 'Contact', path: '/contact' },
    ];

    const isActive = (path) => {
        if (path === '/' && location.pathname === '/') return true;
        if (path !== '/' && location.pathname.startsWith(path)) return true;
        return false;
    };

    return (
        <nav
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
                showBackground ? 'bg-white/70 backdrop-blur-xl border-b border-gray-100 py-3' : 'bg-transparent py-8'
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
                    <div className="flex items-center space-x-8">
                        {navLinks.map((link) => (
                            <Link
                                key={link.name}
                                to={link.path}
                                className={`text-sm font-bold transition-all tracking-wide uppercase ${
                                    isActive(link.path) 
                                        ? 'text-purple-600 underline underline-offset-4 decoration-2' 
                                        : 'text-gray-400 hover:text-purple-600'
                                }`}
                            >
                                {link.name}
                            </Link>
                        ))}
                    </div>
                    
                    {showLogin && (
                        <Link
                            to="/login"
                            className="bg-gray-900 text-white px-8 py-3 rounded-2xl font-black text-sm hover:bg-purple-600 hover:shadow-2xl hover:shadow-purple-500/20 transition-all active:scale-95"
                        >
                            Login
                        </Link>
                    )}
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
                    <Link
                        key={link.name}
                        to={link.path}
                        className={`transition-colors ${isActive(link.path) ? 'text-purple-600' : 'text-gray-900 hover:text-purple-600'}`}
                        onClick={() => setIsMenuOpen(false)}
                    >
                        {link.name}
                    </Link>
                ))}
                
                {showLogin && (
                    <Link
                        to="/login"
                        className="bg-purple-600 text-white px-12 py-5 rounded-3xl"
                        onClick={() => setIsMenuOpen(false)}
                    >
                        Login
                    </Link>
                )}
                
                <button 
                    onClick={() => setIsMenuOpen(false)}
                    className="absolute top-8 right-8 p-4 text-gray-400 hover:text-gray-900 transition-colors"
                >
                    <X size={32} />
                </button>
            </div>
        </nav>
    );
};

export default Navbar;
