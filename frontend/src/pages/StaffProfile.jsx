import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, MapPin, GraduationCap, Briefcase, Save, Calendar, UserCheck } from 'lucide-react';
import { BASE_URL } from '../config';

const StaffProfile = () => {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    const [formData, setFormData] = useState({
        name: localStorage.getItem('fullName') || '',
        email: localStorage.getItem('email') || '',
        phone: '',
        role: 'Teacher',
        dob: '',
        gender: 'Male',
        joiningDate: new Date().toISOString().split('T')[0],
        qualification: '',
        experience: '',
        address: ''
    });

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${BASE_URL}/api/staff/me`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const result = await response.json();
            if (result.success && result.data) {
                const data = result.data;
                setFormData({
                    ...data,
                    dob: data.dob ? new Date(data.dob).toISOString().split('T')[0] : '',
                    joiningDate: data.joiningDate ? new Date(data.joiningDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
                });
            }
        } catch (error) {
            console.error('Error fetching profile:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setMessage({ type: '', text: '' });

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${BASE_URL}/api/staff/me`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ ...formData, status: 'Active' })
            });

            const result = await response.json();
            if (result.success) {
                setMessage({ type: 'success', text: 'Profile updated successfully!' });
                setTimeout(() => window.location.href = '#/staff/dashboard', 2000);
            } else {
                setMessage({ type: 'error', text: result.message || 'Failed to update profile.' });
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Connection error. Please try again.' });
        } finally {
            setSaving(false);
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center min-h-[50vh]">
            <div className="w-10 h-10 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
        </div>
    );

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-700 pb-12">
            <div className="bg-white p-8 rounded-[3rem] border border-gray-100 shadow-sm relative overflow-hidden">
                <div className="relative z-10">
                    <h2 className="text-3xl font-black text-gray-900">Professional Profile</h2>
                    <p className="text-gray-500 font-medium">Please complete your staff details to finalize your setup.</p>
                </div>
                <div className="absolute right-0 top-0 w-32 h-full bg-gradient-to-l from-purple-50 to-transparent -z-0"></div>
            </div>

            {message.text && (
                <div className={`p-6 rounded-[2rem] border animate-in slide-in-from-top-4 ${message.type === 'success' ? 'bg-green-50 border-green-100 text-green-700' : 'bg-red-50 border-red-100 text-red-700'
                    } flex items-center gap-4`}>
                    {message.type === 'success' ? <UserCheck size={24} /> : <div className="p-1 px-3 bg-red-100 rounded-full">!</div>}
                    <p className="font-bold">{message.text}</p>
                </div>
            )}

            <form onSubmit={handleSubmit} className="bg-white p-10 rounded-[3.5rem] border border-gray-100 shadow-xl shadow-gray-100/50 space-y-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Basic Info */}
                    <div className="space-y-2">
                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Full Name</label>
                        <div className="relative">
                            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input type="text" name="name" value={formData.name} onChange={handleChange} required className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:ring-4 focus:ring-purple-100 focus:border-purple-200 transition-all outline-none font-bold text-gray-700" placeholder="John Doe" />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Email Address</label>
                        <div className="relative">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input type="email" name="email" value={formData.email} readOnly className="w-full pl-12 pr-4 py-4 bg-gray-100 border border-transparent rounded-2xl cursor-not-allowed font-bold text-gray-500" placeholder="email@example.com" />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Contact Phone</label>
                        <div className="relative">
                            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input type="text" name="phone" value={formData.phone} onChange={handleChange} required className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:ring-4 focus:ring-purple-100 focus:border-purple-200 transition-all outline-none font-bold text-gray-700" placeholder="+1 (555) 000-0000" />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Date of Birth</label>
                        <div className="relative">
                            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                type="date"
                                name="dob"
                                value={formData.dob}
                                onChange={handleChange}
                                required
                                max={new Date().toISOString().split('T')[0]}
                                className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:ring-4 focus:ring-purple-100 focus:border-purple-200 transition-all outline-none font-bold text-gray-700"
                            />
                        </div>
                    </div>

                    {/* Professional Details */}
                    <div className="space-y-2">
                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Designation / Role</label>
                        <div className="relative">
                            <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <select name="role" value={formData.role} onChange={handleChange} className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:ring-4 focus:ring-purple-100 focus:border-purple-200 transition-all outline-none font-bold text-gray-700 appearance-none">
                                <option value="Teacher">Teacher</option>
                                <option value="Caretaker">Caretaker</option>
                                <option value="Principal">Principal</option>
                            </select>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Gender</label>
                        <div className="relative">
                            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <select name="gender" value={formData.gender} onChange={handleChange} className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:ring-4 focus:ring-purple-100 focus:border-purple-200 transition-all outline-none font-bold text-gray-700 appearance-none">
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Highest Qualification</label>
                        <div className="relative">
                            <GraduationCap className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input type="text" name="qualification" value={formData.qualification} onChange={handleChange} required className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:ring-4 focus:ring-purple-100 focus:border-purple-200 transition-all outline-none font-bold text-gray-700" placeholder="e.g. Bachelor in Early Education" />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Years of Experience</label>
                        <div className="relative">
                            <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input type="text" name="experience" value={formData.experience} onChange={handleChange} required className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:ring-4 focus:ring-purple-100 focus:border-purple-200 transition-all outline-none font-bold text-gray-700" placeholder="e.g. 5+ years" />
                        </div>
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Home Address</label>
                    <div className="relative">
                        <MapPin className="absolute left-4 top-6 text-gray-400" size={18} />
                        <textarea name="address" value={formData.address} onChange={handleChange} rows="3" required className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:ring-4 focus:ring-purple-100 focus:border-purple-200 transition-all outline-none font-bold text-gray-700 resize-none" placeholder="Enter your full residential address"></textarea>
                    </div>
                </div>

                <div className="pt-6 border-t border-gray-50 flex justify-end">
                    <button type="submit" disabled={saving} className="px-10 py-4 bg-gray-900 text-white font-black rounded-2xl shadow-xl shadow-gray-200 hover:bg-purple-700 hover:shadow-purple-200 transition-all flex items-center gap-3 uppercase tracking-widest disabled:opacity-50">
                        {saving ? <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div> : <Save size={20} />}
                        {saving ? 'Saving...' : 'Save Profile'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default StaffProfile;
