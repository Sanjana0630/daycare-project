import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    ChevronRight,
    Menu,
    X,
    ShieldCheck,
    MessageSquare,
    BarChart3,
    Calendar,
    Utensils,
    Bell,
    Users,
    Star,
    CheckCircle,
    Instagram,
    Twitter,
    Facebook,
    Mail,
    Phone,
    MapPin,
    ArrowRight
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


    const steps = [
        {
            number: "01",
            title: "Join Us",
            description: "Create your free account in just a few minutes."
        },
        {
            number: "02",
            title: "Add Child",
            description: "Enter health info and emergency contact details."
        },
        {
            number: "03",
            title: "Stay Updated",
            description: "Check your dashboard for daily photos and news."
        }
    ];

    const navLinks = [
        { name: 'About', href: '#about' },
        { name: 'Features', href: '#features' },
        { name: 'Trust', href: '#trust' },
        { name: 'Reviews', href: '#testimonials' },
    ];

    const features = [
        {
            icon: <BarChart3 className="w-8 h-8 text-purple-600" />,
            title: "Real-time Tracking",
            description: "Monitor your child's activities, meals, and naps as they happen throughout the day."
        },
        {
            icon: <Calendar className="w-8 h-8 text-blue-600" />,
            title: "Attendance Monitoring",
            description: "Seamless check-ins and check-outs with instant notifications for parents."
        },
        {
            icon: <Utensils className="w-8 h-8 text-pink-600" />,
            title: "Daily Activity Updates",
            description: "Get detailed reports on classroom activities, photos, and special moments."
        },
        {
            icon: <Bell className="w-8 h-8 text-orange-600" />,
            title: "Smart Notifications",
            description: "Stay informed about upcoming events, health alerts, and important announcements."
        }
    ];

    const stats = [
        { count: "100+", label: "Happy Children", icon: <Users className="w-6 h-6" /> },
        { count: "20+", label: "Verified Staff", icon: <ShieldCheck className="w-6 h-6" /> },
        { count: "500+", label: "Daily Activities", icon: <Star className="w-6 h-6" /> }
    ];

    const testimonials = [
        {
            name: "Sarah Johnson",
            role: "Parent",
            feedback: "The real-time updates give me such peace of mind. I love seeing what my little one is learning every day!",
            avatar: "https://i.pravatar.cc/150?u=sarah"
        },
        {
            name: "Michael Chen",
            role: "Parent",
            feedback: "TinyTots has transformed how we stay connected with our child's daycare. The interface is so friendly and easy to use.",
            avatar: "https://i.pravatar.cc/150?u=michael"
        },
        {
            name: "Emily Davis",
            role: "Parent",
            feedback: "The staff is amazing, and the app makes communication a breeze. Highly recommend to any parent!",
            avatar: "https://i.pravatar.cc/150?u=emily"
        }
    ];

    return (
        <div className="min-h-screen bg-bg-secondary font-sans text-text-main">
            {/* Navbar */}
            <nav
                className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled ? 'bg-white/80 backdrop-blur-md shadow-lg py-3' : 'bg-transparent py-6'
                    }`}
            >
                <div className="container mx-auto px-4 md:px-6 flex items-center justify-between">
                    <Link to="/" className="flex items-center space-x-3 group text-decoration-none">
                        <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/20 group-hover:scale-110 transition-transform duration-300">
                            <span className="text-white font-black text-2xl">T</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-2xl font-black tracking-tighter text-text-main leading-none">Tiny<span className="text-purple-600">Tots</span></span>
                            <span className="text-[10px] font-bold text-purple-400 uppercase tracking-widest leading-none mt-1">Daycare System</span>
                        </div>
                    </Link>

                    {/* Desktop Nav */}
                    <div className="hidden md:flex items-center space-x-10">
                        {navLinks.map((link) => (
                            <a
                                key={link.name}
                                href={link.href}
                                className="font-bold text-text-secondary hover:text-purple-600 transition-all relative group"
                            >
                                {link.name}
                                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-purple-600 transition-all group-hover:w-full"></span>
                            </a>
                        ))}
                        <Link
                            to="/login"
                            className="bg-purple-600 text-white px-8 py-3 rounded-2xl font-bold hover:bg-purple-700 hover:shadow-xl hover:shadow-purple-500/20 transition-all active:scale-95"
                        >
                            Login
                        </Link>
                    </div>

                    {/* Mobile Menu Toggle */}
                    <button
                        className="md:hidden text-text-main p-2 hover:bg-purple-50 rounded-xl transition-colors"
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                    >
                        {isMenuOpen ? <X size={32} /> : <Menu size={32} />}
                    </button>
                </div>

                {/* Mobile menu */}
                <div
                    className={`fixed inset-0 bg-white z-[60] flex flex-col items-center justify-center space-y-10 text-3xl font-black transition-all duration-500 md:hidden ${isMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'
                        }`}
                >
                    {navLinks.map((link) => (
                        <a
                            key={link.name}
                            href={link.href}
                            className="text-text-main hover:text-purple-600 translate-y-4 transition-all"
                            onClick={() => setIsMenuOpen(false)}
                        >
                            {link.name}
                        </a>
                    ))}
                    <Link
                        to="/login"
                        className="bg-gradient-to-r from-purple-600 to-pink-500 text-white px-12 py-5 rounded-[2rem] shadow-2xl"
                        onClick={() => setIsMenuOpen(false)}
                    >
                        Login
                    </Link>
                    <button
                        className="absolute top-8 right-8 text-text-secondary hover:rotate-90 transition-transform"
                        onClick={() => setIsMenuOpen(false)}
                    >
                        <X size={40} />
                    </button>
                </div>
            </nav>

            {/* Hero Section */}
            <section id="home" className="relative pt-32 pb-20 md:pt-40 md:pb-24 overflow-hidden bg-gradient-to-br from-purple-100 via-white to-blue-100">
                <div className="container mx-auto px-4 md:px-6 relative z-10">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                        <div className="space-y-8 animate-fade-in">
                            <div className="inline-block px-4 py-2 bg-purple-50 text-purple-600 rounded-full font-bold text-xs tracking-wider uppercase border border-purple-100">
                                🏠 Welcome to TinyTots Daycare
                            </div>
                            <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-text-main leading-[1.1]">
                                Safe. Smart. <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-500">Caring.</span><br />
                                Your Child’s Second Home.
                            </h1>
                            <p className="text-lg md:text-xl text-text-secondary max-w-xl leading-relaxed">
                                An easy-to-use system for modern daycares. We help parents and teachers stay connected with safety and care for every child.
                            </p>
                            <div className="flex flex-col sm:flex-row items-center gap-4 pt-2">
                                <Link
                                    to="/register"
                                    className="w-full sm:w-auto bg-gradient-to-r from-purple-600 to-pink-500 text-white px-8 py-4 rounded-2xl font-bold text-lg shadow-xl hover:shadow-purple-500/20 hover:scale-105 active:scale-95 transition-all flex items-center justify-center group"
                                >
                                    Get Started
                                    <ChevronRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </Link>
                                <Link
                                    to="/login"
                                    className="w-full sm:w-auto bg-white text-purple-600 border-2 border-purple-100 px-8 py-4 rounded-2xl font-bold text-lg shadow-sm hover:bg-purple-50 hover:border-purple-200 transition-all flex items-center justify-center"
                                >
                                    Login Now
                                </Link>
                            </div>
                        </div>
                        <div className="relative animate-fade-in-right">
                            <div className="relative z-10 rounded-[2.5rem] overflow-hidden shadow-2xl border-8 border-white animate-float">
                                <img
                                    src={HeroImage}
                                    alt="Kids playing in daycare"
                                    className="w-full h-full object-cover rounded-2xl"
                                />
                            </div>
                            {/* Decorative Blobs */}
                            <div className="absolute -top-10 -right-10 w-32 h-32 bg-pink-200 rounded-full mix-blend-multiply filter blur-2xl opacity-50 animate-blob"></div>
                            <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-blue-200 rounded-full mix-blend-multiply filter blur-2xl opacity-50 animate-blob animation-delay-2000"></div>
                        </div>
                    </div>
                </div>

                {/* Background Shapes */}
                <div className="absolute top-20 left-10 w-64 h-64 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
                <div className="absolute top-40 right-10 w-80 h-80 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
                <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-pink-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
            </section>

            {/* Features Section */}
            <section id="features" className="py-24 bg-white">
                <div className="container mx-auto px-4 md:px-6">
                    <div className="text-center mb-16 space-y-4 max-w-3xl mx-auto">
                        <h2 className="text-3xl md:text-5xl font-bold tracking-tight">Everything You Need</h2>
                        <p className="text-text-secondary text-lg leading-relaxed">
                            Our system is designed to make daycare management simple and effective for both staff and parents.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {features.map((feature, idx) => (
                            <div key={idx} className="p-8 bg-white border border-gray-100 rounded-[2rem] shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-300">
                                <div className="w-16 h-16 bg-purple-50 rounded-2xl flex items-center justify-center mb-6">
                                    {feature.icon}
                                </div>
                                <h3 className="text-xl font-bold mb-4">{feature.title}</h3>
                                <p className="text-text-secondary leading-relaxed">{feature.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="py-16 bg-purple-600 overflow-hidden relative">
                <div className="container mx-auto px-4 md:px-6 relative z-10">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-white items-center">
                        {stats.map((stat, idx) => (
                            <div key={idx} className="text-center space-y-2 group">
                                <div className="flex justify-center mb-2 text-purple-200 group-hover:scale-110 transition-transform">
                                    {stat.icon}
                                </div>
                                <div className="text-4xl md:text-5xl font-black">{stat.count}</div>
                                <div className="text-purple-100 font-medium uppercase tracking-wider text-sm">{stat.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-10 pointer-events-none">
                    <div className="absolute top-0 left-0 w-full h-full" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>
                </div>
            </section>

            {/* Trust Section */}
            <section id="trust" className="py-24 bg-bg-secondary">
                <div className="container mx-auto px-4 md:px-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                        <div className="relative order-2 lg:order-1">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-4">
                                    <div className="bg-white p-2 rounded-3xl shadow-lg transform translate-y-8">
                                        <img src="https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=400&q=80" alt="Trust 1" className="rounded-2xl" />
                                    </div>
                                    <div className="bg-white p-2 rounded-3xl shadow-lg">
                                        <img src="https://images.unsplash.com/photo-1595152248147-b175796d7404?auto=format&fit=crop&w=400&q=80" alt="Trust 2" className="rounded-2xl" />
                                    </div>
                                </div>
                                <div className="space-y-4 translate-y-[-20px]">
                                    <div className="bg-white p-2 rounded-3xl shadow-lg">
                                        <img src="https://images.unsplash.com/photo-1516627145497-ae6968895b74?auto=format&fit=crop&w=400&q=80" alt="Trust 3" className="rounded-2xl" />
                                    </div>
                                    <div className="bg-white p-2 rounded-3xl shadow-lg transform translate-y-8">
                                        <img src="https://images.unsplash.com/photo-1484981138541-3d074aa97716?auto=format&fit=crop&w=400&q=80" alt="Trust 4" className="rounded-2xl" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-8 order-1 lg:order-2">
                            <h2 className="text-3xl md:text-5xl font-bold leading-tight">Why Parents Trust Us</h2>
                            <p className="text-lg text-text-secondary leading-relaxed">
                                We prioritize safety, transparency, and child development above all else. Here's why families choose TinyTots.
                            </p>
                            <div className="space-y-6">
                                {[
                                    { title: "Safe & Secure Environment", desc: "Monitored facilities and strictly verified staff members." },
                                    { title: "Real-time Daily Updates", desc: "Never miss a moment with instant notifications and photos." },
                                    { title: "Certified Caregivers", desc: "All our staff are trained in early childhood development." }
                                ].map((item, idx) => (
                                    <div key={idx} className="flex items-start gap-4">
                                        <div className="mt-1 w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0 text-purple-600">
                                            <CheckCircle className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-xl">{item.title}</h4>
                                            <p className="text-text-secondary">{item.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Testimonials Section */}
            <section id="testimonials" className="py-24 bg-white overflow-hidden">
                <div className="container mx-auto px-4 md:px-6">
                    <div className="text-center mb-16 space-y-4">
                        <h2 className="text-3xl md:text-5xl font-bold tracking-tight">Loved by Parents</h2>
                        <p className="text-text-secondary text-lg">Don't just take our word for it—hear from our amazing community.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {testimonials.map((t, idx) => (
                            <div key={idx} className="p-8 bg-purple-50/50 rounded-[2.5rem] border border-purple-100 hover:bg-white hover:shadow-2xl transition-all duration-500">
                                <div className="flex gap-1 mb-6">
                                    {[...Array(5)].map((_, i) => <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />)}
                                </div>
                                <p className="text-lg italic text-text-secondary mb-8 leading-relaxed">"{t.feedback}"</p>
                                <div className="flex items-center gap-4">
                                    <img src={t.avatar} alt={t.name} className="w-14 h-14 rounded-2xl shadow-md" />
                                    <div>
                                        <div className="font-bold text-lg">{t.name}</div>
                                        <div className="text-purple-500 text-sm font-medium">{t.role}</div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* How it Works Section */}
            <section className="py-24 bg-white overflow-hidden">
                <div className="container mx-auto px-4 md:px-6 relative">
                    <div className="text-center mb-20 space-y-4">
                        <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight">Simple Steps to Start</h2>
                        <p className="text-text-secondary text-lg max-w-2xl mx-auto">
                            Getting your child enrolled and staying updated is easier than ever with TinyTots.
                        </p>
                    </div>

                    <div className="flex flex-col md:flex-row justify-between items-start gap-12 relative">
                        {/* Connecting line (desktop only) */}
                        <div className="hidden md:block absolute top-28 left-1/2 -translate-x-1/2 w-4/5 h-1 border-t-4 border-dashed border-purple-100 -z-0"></div>

                        {steps.map((step, idx) => (
                            <div key={idx} className="flex-1 text-center relative z-10 group">
                                <div className="w-24 h-24 bg-white rounded-[2rem] border-4 border-purple-50 flex items-center justify-center mx-auto mb-10 shadow-xl group-hover:border-purple-600 group-hover:scale-110 transition-all duration-500 group-hover:shadow-purple-200">
                                    <span className="text-purple-600 font-black text-3xl">{step.number}</span>
                                </div>
                                <h3 className="text-2xl font-black mb-4">{step.title}</h3>
                                <p className="text-text-secondary leading-relaxed px-6">{step.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* About Section */}
            <section id="about" className="py-24 bg-bg-secondary">
                <div className="container mx-auto px-4 md:px-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
                        <div className="space-y-10 animate-fade-in-left">
                            <div className="inline-block px-4 py-2 bg-purple-100 text-purple-700 rounded-full font-bold text-sm tracking-wide uppercase">
                                ✨ Our Mission
                            </div>
                            <h2 className="text-4xl md:text-6xl font-black leading-tight">
                                Helping Daycares with <span className="text-purple-600 underline decoration-purple-100">Modern Tools</span>
                            </h2>
                            <div className="space-y-6 text-lg text-text-secondary leading-relaxed">
                                <p>
                                    At TinyTots, we want to help teachers and caregivers. By doing the paperwork for you,
                                    we give you more time to spend with the children.
                                </p>
                                <p>
                                    Our system keeps families updated and children safe. We know it's hard to be away
                                    from your child, so we send you daily updates to help you feel close.
                                </p>
                                <p>
                                    From tracking meals to secure check-ins, TinyTots makes everything better for families and daycares.
                                </p>
                            </div>
                            <div className="pt-4 flex gap-4">
                                <button className="bg-purple-600 text-white px-10 py-4 rounded-2xl font-bold shadow-xl shadow-purple-500/20 hover:scale-105 transition-all">
                                    Learn More
                                </button>
                                <button className="bg-white text-purple-600 border-2 border-purple-50 px-10 py-4 rounded-2xl font-bold hover:bg-purple-50 transition-all">
                                    Our Story
                                </button>
                            </div>
                        </div>

                        <div className="relative animate-fade-in-right group">
                            <div className="bg-purple-100 rounded-[3rem] p-6 md:p-10 transform lg:rotate-6 shadow-2xl group-hover:rotate-0 transition-transform duration-700">
                                <div className="bg-white rounded-[2rem] overflow-hidden shadow-inner aspect-square flex flex-col items-center justify-center p-12 text-center border-4 border-dashed border-purple-200">
                                    <div className="w-20 h-20 bg-purple-50 rounded-2xl flex items-center justify-center mb-8">
                                        <ShieldCheck className="w-10 h-10 text-purple-600" />
                                    </div>
                                    <p className="primary italic font-serif text-2xl md:text-3xl text-purple-900 leading-relaxed mb-6">
                                        "We make daycare management easy, safe and fun for everyone."
                                    </p>
                                    <div className="font-bold text-purple-600">— The TinyTots Team</div>
                                </div>
                            </div>
                            {/* Decorative elements */}
                            <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-pink-100 rounded-full -z-10 animate-blob"></div>
                            <div className="absolute -top-10 right-20 w-20 h-20 bg-blue-100 rounded-[2rem] -z-10 transform -rotate-12 animate-blob animation-delay-2000"></div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-white pt-24 pb-12 border-t border-gray-100">
                <div className="container mx-auto px-4 md:px-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-20">
                        <div className="space-y-6">
                            <Link to="/" className="flex items-center space-x-3">
                                <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/20">
                                    <span className="text-white font-black text-2xl">T</span>
                                </div>
                                <span className="text-2xl font-black tracking-tighter text-text-main">Tiny<span className="text-purple-600">Tots</span></span>
                            </Link>
                            <p className="text-text-secondary leading-relaxed text-lg">
                                Making daycare management smarter, safer, and more connected for families everywhere.
                            </p>
                            <div className="flex gap-4">
                                {[Facebook, Twitter, Instagram].map((Icon, idx) => (
                                    <a key={idx} href="#" className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600 hover:bg-purple-600 hover:text-white transition-all shadow-sm">
                                        <Icon className="w-5 h-5" />
                                    </a>
                                ))}
                            </div>
                        </div>

                        <div>
                            <h4 className="font-bold text-xl mb-8">Navigation</h4>
                            <ul className="space-y-4">
                                {navLinks.map((link) => (
                                    <li key={link.name}>
                                        <a href={link.href} className="text-text-secondary hover:text-purple-600 transition-colors flex items-center group">
                                            <ArrowRight className="w-0 h-4 mr-0 group-hover:w-4 group-hover:mr-2 transition-all opacity-0 group-hover:opacity-100" />
                                            {link.name}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div>
                            <h4 className="font-bold text-xl mb-8">Contact Us</h4>
                            <ul className="space-y-4">
                                <li className="flex items-center gap-3 text-text-secondary">
                                    <Mail className="w-5 h-5 text-purple-500" />
                                    <span>hello@tinytots.com</span>
                                </li>
                                <li className="flex items-center gap-3 text-text-secondary">
                                    <Phone className="w-5 h-5 text-purple-500" />
                                    <span>+1 (555) 123-4567</span>
                                </li>
                                <li className="flex items-center gap-3 text-text-secondary">
                                    <MapPin className="w-5 h-5 text-purple-500" />
                                    <span>123 Care Street, Sunshine City</span>
                                </li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="font-bold text-xl mb-8">Newsletter</h4>
                            <p className="text-text-secondary mb-6">Stay updated with our latest news and features.</p>
                            <div className="relative">
                                <input
                                    type="email"
                                    placeholder="Enter your email"
                                    className="w-full bg-bg-secondary px-6 py-4 rounded-2xl outline-none border border-transparent focus:border-purple-200 transition-all shadow-inner"
                                />
                                <button className="absolute right-2 top-2 bottom-2 bg-purple-600 text-white px-6 rounded-xl font-bold hover:bg-purple-700 transition-all shadow-md active:scale-95">
                                    Join
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="pt-8 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center gap-6 text-text-light text-sm">
                        <p>© {new Date().getFullYear()} TinyTots Daycare. All rights reserved.</p>
                        <div className="flex gap-8">
                            <a href="#" className="hover:text-purple-600 transition-colors">Privacy Policy</a>
                            <a href="#" className="hover:text-purple-600 transition-colors">Terms of Service</a>
                            <span className="flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-green-500" /> SSL Secured</span>
                        </div>
                    </div>
                </div>
            </footer>

            <style dangerouslySetInnerHTML={{
                __html: `
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fade-in-left {
          from { opacity: 0; transform: translateX(-40px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes fade-in-right {
          from { opacity: 0; transform: translateX(40px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(40px, -60px) scale(1.1); }
          66% { transform: translate(-30px, 30px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-20px); }
        }
        .animate-fade-in { animation: fade-in 1.2s cubic-bezier(0.2, 0.8, 0.2, 1) forwards; }
        .animate-fade-in-left { animation: fade-in-left 1.2s cubic-bezier(0.2, 0.8, 0.2, 1) forwards; }
        .animate-fade-in-right { animation: fade-in-right 1.2s cubic-bezier(0.2, 0.8, 0.2, 1) forwards; }
        .animate-blob { animation: blob 10s infinite alternate; }
        .animate-float { animation: float 6s ease-in-out infinite; }
        .animation-delay-2000 { animation-delay: 2s; }
        .animation-delay-4000 { animation-delay: 4s; }
      `}} />
        </div>
    );
};

export default Home;
