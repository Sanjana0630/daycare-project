import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    ChevronRight,
    Menu,
    X,
    ShieldCheck,
    MessageSquare
} from 'lucide-react';

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
    ];

    return (
        <div className="min-h-screen bg-bg-secondary font-sans text-text-main">
            {/* Navbar */}
            <nav
                className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white shadow-md py-3' : 'bg-transparent py-5'
                    }`}
            >
                <div className="container mx-auto px-4 md:px-6 flex items-center justify-between">
                    <Link to="/" className="flex items-center space-x-2">
                        <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg">
                            <span className="text-white font-bold text-xl">T</span>
                        </div>
                        <span className="text-2xl font-bold tracking-tight text-primary">TinyTots</span>
                    </Link>

                    {/* Desktop Nav */}
                    <div className="hidden md:flex items-center space-x-8">
                        {navLinks.map((link) => (
                            <a
                                key={link.name}
                                href={link.href}
                                className="font-medium text-text-secondary hover:text-primary transition-colors"
                            >
                                {link.name}
                            </a>
                        ))}
                        <Link
                            to="/login"
                            className="bg-primary text-white px-6 py-2 rounded-lg font-semibold hover:bg-opacity-90 transition-all shadow-md active:scale-95"
                        >
                            Login
                        </Link>
                    </div>

                    {/* Mobile Menu Toggle */}
                    <button
                        className="md:hidden text-text-main p-2"
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                    >
                        {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
                    </button>
                </div>

                {/* Mobile menu */}
                <div
                    className={`fixed inset-0 bg-white z-40 flex flex-col items-center justify-center space-y-8 text-2xl font-bold transition-transform duration-500 md:hidden ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'
                        }`}
                >
                    {navLinks.map((link) => (
                        <a
                            key={link.name}
                            href={link.href}
                            className="text-text-secondary hover:text-primary"
                            onClick={() => setIsMenuOpen(false)}
                        >
                            {link.name}
                        </a>
                    ))}
                    <Link
                        to="/login"
                        className="bg-primary text-white px-10 py-3 rounded-xl shadow-lg"
                        onClick={() => setIsMenuOpen(false)}
                    >
                        Login
                    </Link>
                    <button
                        className="absolute top-6 right-6 text-text-secondary"
                        onClick={() => setIsMenuOpen(false)}
                    >
                        <X size={32} />
                    </button>
                </div>
            </nav>

            {/* Hero Section */}
            <section id="home" className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden bg-gradient-to-b from-accent-lavender via-bg-secondary to-bg-secondary">
                <div className="container mx-auto px-4 md:px-6 relative z-10">
                    <div className="max-w-4xl mx-auto text-center space-y-8 animate-fade-in">
                        <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-text-main leading-tight">
                            Safe. Smart. <span className="text-primary">Caring.</span><br />
                            Your Child’s Second Home.
                        </h1>
                        <p className="text-xl md:text-2xl text-text-secondary max-w-2xl mx-auto leading-relaxed">
                            An easy-to-use system for daycares. We help parents and teachers stay connected with safety and care for every child.
                        </p>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                            <Link
                                to="/register"
                                className="w-full sm:w-auto bg-primary text-white px-8 py-4 rounded-xl font-bold text-lg shadow-xl hover:bg-opacity-95 hover:-translate-y-1 transition-all flex items-center justify-center"
                            >
                                Get Started
                                <ChevronRight className="ml-2 w-5 h-5" />
                            </Link>
                            <Link
                                to="/login"
                                className="w-full sm:w-auto bg-white text-primary border-2 border-primary px-8 py-4 rounded-xl font-bold text-lg shadow-md hover:bg-primary hover:text-white transition-all flex items-center justify-center"
                            >
                                Login
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Abstract Shapes for design */}
                <div className="absolute top-20 left-10 w-64 h-64 bg-accent-peach rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
                <div className="absolute top-40 right-10 w-80 h-80 bg-accent-sky rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
                <div className="absolute -bottom-20 left-1/2 w-96 h-96 bg-accent-mint rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
            </section>

            {/* How it Works Section */}
            <section className="py-24 bg-bg-secondary overflow-hidden">
                <div className="container mx-auto px-4 md:px-6 relative">
                    <div className="text-center mb-16 space-y-4">
                        <h2 className="text-3xl md:text-5xl font-bold">Simple Steps</h2>
                        <p className="text-text-secondary text-lg max-w-2xl mx-auto">
                            Getting started is easy. Just follow these 3 steps.
                        </p>
                    </div>

                    <div className="flex flex-col md:flex-row justify-between items-start gap-12 relative">
                        {/* Connecting line (desktop only) */}
                        <div className="hidden md:block absolute top-24 left-1/2 -translate-x-1/2 w-4/5 h-1 border-t-2 border-dashed border-primary-light -z-0"></div>

                        {steps.map((step, idx) => (
                            <div key={idx} className="flex-1 text-center relative z-10 group">
                                <div className="w-20 h-20 bg-white rounded-2xl border-4 border-primary-light flex items-center justify-center mx-auto mb-8 shadow-lg group-hover:border-primary group-hover:scale-110 transition-all duration-300">
                                    <span className="text-primary font-black text-2xl">{step.number}</span>
                                </div>
                                <h3 className="text-2xl font-bold mb-4">{step.title}</h3>
                                <p className="text-text-secondary px-4">{step.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* About Section */}
            <section id="about" className="py-24 bg-white">
                <div className="container mx-auto px-4 md:px-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                        <div className="space-y-8 animate-fade-in-left">
                            <div className="inline-block px-4 py-2 bg-primary-light text-primary rounded-full font-bold text-sm tracking-wide uppercase">
                                About Us
                            </div>
                            <h2 className="text-3xl md:text-5xl font-bold leading-tight">
                                Helping Daycares with Modern Tools
                            </h2>
                            <div className="space-y-6 text-lg text-text-secondary">
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
                            <div className="pt-4">
                                <button className="bg-primary text-white px-8 py-3 rounded-xl font-bold shadow-lg hover:shadow-primary/25 transition-all">
                                    Learn More
                                </button>
                            </div>
                        </div>

                        <div className="relative animate-fade-in-right">
                            <div className="bg-accent-lavender rounded-[2rem] p-4 md:p-8 transform rotate-3 shadow-2xl">
                                <div className="bg-white rounded-2xl overflow-hidden shadow-inner aspect-video flex items-center justify-center p-8 text-center text-primary italic font-serif text-xl border-4 border-dashed border-primary-light">
                                    "We make daycare management easy and fun."
                                </div>
                            </div>
                            {/* Decorative elements */}
                            <div className="absolute -bottom-6 -left-6 w-24 h-24 bg-accent-peach rounded-full -z-10"></div>
                            <div className="absolute -top-6 right-10 w-16 h-16 bg-accent-sky rounded-2xl -z-10 transform -rotate-12"></div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-white pt-20 pb-10 border-t border-gray-100">
                <div className="container mx-auto px-4 md:px-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
                        <div className="col-span-1 md:col-span-1 space-y-6">
                            <Link to="/" className="flex items-center space-x-2">
                                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                                    <span className="text-white font-bold">T</span>
                                </div>
                                <span className="text-xl font-bold tracking-tight text-primary">TinyTots</span>
                            </Link>
                            <p className="text-text-secondary leading-relaxed">
                                Making daycare management smarter and safer.
                            </p>
                        </div>

                        <div>
                            <h4 className="font-bold text-lg mb-6">Links</h4>
                            <ul className="space-y-4">
                                {navLinks.map((link) => (
                                    <li key={link.name}>
                                        <a href={link.href} className="text-text-secondary hover:text-primary transition-colors">{link.name}</a>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div>
                            <h4 className="font-bold text-lg mb-6">Legal</h4>
                            <ul className="space-y-4 text-text-secondary">
                                <li><a href="#" className="hover:text-primary transition-colors">Privacy</a></li>
                                <li><a href="#" className="hover:text-primary transition-colors">Terms</a></li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="font-bold text-lg mb-6">Newsletter</h4>
                            <p className="text-text-secondary mb-4">Stay updated with us.</p>
                            <div className="flex space-x-2">
                                <input
                                    type="email"
                                    placeholder="Email"
                                    className="bg-bg-secondary px-4 py-2 rounded-lg outline-none w-full border border-transparent focus:border-primary-light"
                                />
                                <button className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-opacity-90 transition-all">
                                    Join
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="pt-8 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0 text-text-light text-sm">
                        <p>© {new Date().getFullYear()} TinyTots Daycare. All rights reserved.</p>
                        <div className="flex space-x-6">
                            <span className="flex items-center"><MessageSquare className="w-4 h-4 mr-2" /> Support</span>
                            <span className="flex items-center"><ShieldCheck className="w-4 h-4 mr-2" /> Secure</span>
                        </div>
                    </div>
                </div>
            </footer>

            <style dangerouslySetInnerHTML={{
                __html: `
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fade-in-left {
          from { opacity: 0; transform: translateX(-30px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes fade-in-right {
          from { opacity: 0; transform: translateX(30px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-fade-in { animation: fade-in 1s ease-out forwards; }
        .animate-fade-in-left { animation: fade-in-left 1s ease-out forwards; }
        .animate-fade-in-right { animation: fade-in-right 1s ease-out forwards; }
        .animate-blob { animation: blob 7s infinite; }
        .animation-delay-2000 { animation-delay: 2s; }
        .animation-delay-4000 { animation-delay: 4s; }
      `}} />
        </div>
    );
};

export default Home;
