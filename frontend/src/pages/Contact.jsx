import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    ChevronRight,
    Menu,
    X,
    Mail,
    Phone,
    MapPin,
    Send,
    MessageSquare,
    Clock,
    CheckCircle2
} from 'lucide-react';
import ContactHero from '../assets/contact_hero.png';

const Contact = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [formStatus, setFormStatus] = useState('idle'); // idle, sending, success
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: ''
    });

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

    const contactInfo = [
        {
            title: "Email Us",
            value: "contact@tinytots.in",
            desc: "Response within 24 hours",
            icon: <Mail className="text-purple-600" size={24} />
        },
        {
            title: "Call Us",
            value: "+91 98765 43210",
            desc: "Mon - Fri, 9:00 AM - 6:00 PM",
            icon: <Phone className="text-pink-600" size={24} />
        },
        {
            title: "Visit Us",
            value: "TinyTots Daycare Center",
            desc: "Baner Road, Pune, Maharashtra – 411045",
            icon: <MapPin className="text-indigo-600" size={24} />
        }
    ];

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setFormStatus('sending');
        // Simulate API call
        setTimeout(() => {
            setFormStatus('success');
            setFormData({ name: '', email: '', subject: '', message: '' });
            setTimeout(() => setFormStatus('idle'), 5000);
        }, 1500);
    };

    return (
        <div className="min-h-screen bg-white font-sans text-gray-900 selection:bg-purple-100 selection:text-purple-900 overflow-x-hidden">
            {/* Navbar */}
            <nav
                className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled ? 'bg-white/70 backdrop-blur-xl border-b border-gray-100 py-3' : 'bg-transparent py-8'
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
                                className={`text-sm font-bold transition-all tracking-wide uppercase ${link.path === '/contact' ? 'text-purple-600 underline underline-offset-4 decoration-2' : 'text-gray-400 hover:text-purple-600'
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
                    className={`fixed inset-0 bg-white z-[60] flex flex-col items-center justify-center space-y-10 text-3xl font-black transition-all duration-500 md:hidden ${isMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'
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
            <section className="relative pt-48 pb-12 overflow-hidden bg-white">
                <div className="absolute top-0 left-0 w-full h-full -z-10 bg-[radial-gradient(circle_at_20%_30%,rgba(168,85,247,0.03),transparent_40%)]"></div>
                <div className="container mx-auto px-6 md:px-12 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                    <div className="space-y-8 animate-in fade-in slide-in-from-left-8 duration-1000">
                        <div className="inline-flex items-center gap-2 px-4 py-1 bg-purple-50 text-purple-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-purple-100">
                            👋 Say Hello
                        </div>
                        <h1 className="text-6xl md:text-7xl font-black text-gray-900 tracking-tight leading-[0.95]">
                            Let's Get in<br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-pink-400 to-indigo-600">Touch.</span>
                        </h1>
                        <p className="text-lg md:text-xl text-gray-500 font-medium leading-relaxed max-w-lg">
                            Have questions about our daycare programs? We're here to help and answer any questions you might have.
                        </p>

                        <div className="flex items-center gap-6 pt-4">
                            <div className="flex -space-x-3">
                                {[1, 2, 3, 4].map(i => (
                                    <div key={i} className="w-12 h-12 rounded-full border-4 border-white bg-gray-100 flex items-center justify-center overflow-hidden">
                                        <div className="w-full h-full bg-purple-100 flex items-center justify-center text-purple-600 font-bold">
                                            {String.fromCharCode(64 + i)}
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="text-sm">
                                <p className="font-black text-gray-900">4.9/5 stars</p>
                                <p className="text-gray-400 font-medium">from over 500+ happy parents</p>
                            </div>
                        </div>
                    </div>

                    <div className="relative flex justify-center lg:justify-end animate-in fade-in slide-in-from-right-8 duration-1000 delay-200">
                        <div className="absolute inset-0 bg-gradient-to-tr from-purple-100 to-pink-100 rounded-full blur-[100px] opacity-20 transform -rotate-12 scale-110"></div>
                        <div className="relative z-10 w-full max-w-[500px] bg-white p-3 rounded-[3.5rem] shadow-2xl shadow-purple-900/10 transition-transform hover:scale-[1.02] duration-700">
                            <div className="bg-gray-50 rounded-[3rem] overflow-hidden aspect-[4/3]">
                                <img
                                    src={ContactHero}
                                    alt="Contact Illustration"
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        </div>
                        {/* Floating Icon */}
                        <div className="absolute -top-6 -left-6 w-20 h-20 bg-white rounded-[2rem] shadow-2xl flex items-center justify-center text-purple-500 border border-purple-50 animate-bounce">
                            <MessageSquare size={36} />
                        </div>
                    </div>
                </div>
            </section>

            {/* Contact Form & Info */}
            <section className="py-24 bg-white relative">
                <div className="container mx-auto px-6 md:px-12">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
                        {/* Left: Contact Info */}
                        <div className="lg:col-span-5 space-y-12">
                            <div className="space-y-6">
                                <h2 className="text-4xl font-black text-gray-900 tracking-tight">Contact Information</h2>
                                <p className="text-gray-500 font-medium">Reach out via any of these channels or use the contact form. We aim to respond to all inquiries within one business day.</p>
                            </div>

                            <div className="space-y-8">
                                {contactInfo.map((info, idx) => (
                                    <div key={idx} className="flex gap-6 group">
                                        <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center shrink-0 group-hover:scale-110 group-hover:bg-purple-50 transition-all shadow-inner">
                                            {info.icon}
                                        </div>
                                        <div className="space-y-1">
                                            <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest">{info.title}</h3>
                                            <p className="text-xl font-bold text-gray-900">{info.value}</p>
                                            <p className="text-sm font-medium text-gray-500">{info.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="p-8 bg-gray-900 rounded-[2.5rem] text-white relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-purple-600/20 rounded-full translate-x-16 -translate-y-16 blur-2xl group-hover:bg-purple-600/30 transition-all"></div>
                                <div className="space-y-4 relative z-10">
                                    <div className="flex items-center gap-2 text-purple-400">
                                        <Clock size={16} />
                                        <span className="text-xs font-black uppercase tracking-widest">Business Hours</span>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-gray-400">Mon - Fri:</span>
                                            <span className="font-bold">9:00 AM - 6:00 PM</span>
                                        </div>
                                        <div className="flex justify-between items-center text-sm border-t border-white/5 pt-2">
                                            <span className="text-gray-400">Sat - Sun:</span>
                                            <span className="font-bold text-pink-400">Closed</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right: Contact Form */}
                        <div className="lg:col-span-7">
                            <div className="bg-white p-8 md:p-12 rounded-[3.5rem] border border-gray-100 shadow-2xl shadow-purple-900/5 relative">
                                {formStatus === 'success' ? (
                                    <div className="py-20 text-center space-y-6 animate-in fade-in zoom-in duration-500">
                                        <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto text-green-500">
                                            <CheckCircle2 size={48} />
                                        </div>
                                        <div className="space-y-2">
                                            <h2 className="text-3xl font-black text-gray-900 tracking-tight">Message Sent!</h2>
                                            <p className="text-gray-500 font-medium">Thank you for reaching out. We'll get back to you shortly.</p>
                                        </div>
                                        <button
                                            onClick={() => setFormStatus('idle')}
                                            className="text-purple-600 font-bold hover:underline"
                                        >
                                            Send another message
                                        </button>
                                    </div>
                                ) : (
                                    <form onSubmit={handleSubmit} className="space-y-8">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                            <div className="space-y-3">
                                                <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-4">Your Name</label>
                                                <input
                                                    type="text"
                                                    name="name"
                                                    value={formData.name}
                                                    onChange={handleInputChange}
                                                    required
                                                    placeholder="John Doe"
                                                    className="w-full px-6 py-4 rounded-2xl bg-gray-50 border-2 border-transparent focus:bg-white focus:border-purple-100 focus:ring-4 focus:ring-purple-50 transition-all outline-none font-medium"
                                                />
                                            </div>
                                            <div className="space-y-3">
                                                <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-4">Email Address</label>
                                                <input
                                                    type="email"
                                                    name="email"
                                                    value={formData.email}
                                                    onChange={handleInputChange}
                                                    required
                                                    placeholder="john@example.com"
                                                    className="w-full px-6 py-4 rounded-2xl bg-gray-50 border-2 border-transparent focus:bg-white focus:border-purple-100 focus:ring-4 focus:ring-purple-50 transition-all outline-none font-medium"
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-3">
                                            <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-4">Subject</label>
                                            <input
                                                type="text"
                                                name="subject"
                                                value={formData.subject}
                                                onChange={handleInputChange}
                                                required
                                                placeholder="Admission Inquiry"
                                                className="w-full px-6 py-4 rounded-2xl bg-gray-50 border-2 border-transparent focus:bg-white focus:border-purple-100 focus:ring-4 focus:ring-purple-50 transition-all outline-none font-medium"
                                            />
                                        </div>

                                        <div className="space-y-3">
                                            <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-4">Your Message</label>
                                            <textarea
                                                name="message"
                                                value={formData.message}
                                                onChange={handleInputChange}
                                                required
                                                rows="5"
                                                placeholder="Tell us how we can help..."
                                                className="w-full px-6 py-4 rounded-2xl bg-gray-50 border-2 border-transparent focus:bg-white focus:border-purple-100 focus:ring-4 focus:ring-purple-50 transition-all outline-none font-medium resize-none"
                                            ></textarea>
                                        </div>

                                        <button
                                            type="submit"
                                            disabled={formStatus === 'sending'}
                                            className="w-full bg-gray-900 text-white rounded-2xl py-5 font-black text-lg hover:bg-purple-600 shadow-xl shadow-gray-900/10 hover:shadow-purple-500/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {formStatus === 'sending' ? (
                                                <>
                                                    <div className="w-5 h-5 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
                                                    Sending...
                                                </>
                                            ) : (
                                                <>
                                                    Send Message
                                                    <Send size={20} />
                                                </>
                                            )}
                                        </button>
                                    </form>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-12 bg-white">
                <div className="container mx-auto px-6 md:px-12">
                    <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-[3rem] p-12 md:p-16 flex flex-col md:flex-row items-center justify-between gap-8 text-white relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full translate-x-32 -translate-y-32 blur-3xl"></div>
                        <div className="space-y-4 relative z-10">
                            <h2 className="text-3xl md:text-4xl font-black tracking-tight">Ready to join our family?</h2>
                            <p className="text-purple-100 font-medium">Start your child's journey with TinyTots today.</p>
                        </div>
                        <Link
                            to="/register"
                            className="bg-white text-gray-900 px-10 py-5 rounded-2xl font-black text-lg hover:bg-gray-50 transition-all flex items-center gap-2 group relative z-10"
                        >
                            Get Started
                            <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-12 border-t border-gray-100 text-center">
                <p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.4em]">
                    © {new Date().getFullYear()} TinyTots Daycare • Built with Care
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

export default Contact;
