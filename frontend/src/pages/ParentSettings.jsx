import React, { useState, useEffect } from 'react';
import { BASE_URL } from '../config';
import { 
    User, 
    Mail, 
    Phone, 
    MapPin, 
    Camera, 
    Save, 
    Loader2, 
    CheckCircle 
} from 'lucide-react';
import toast from 'react-hot-toast';

const ParentSettings = () => {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [profile, setProfile] = useState({
        fullName: '',
        email: '',
        phoneNumber: '',
        address: '',
        profileImage: ''
    });

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${BASE_URL}/api/parent/me`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (data.success) {
                setProfile({
                    fullName: data.data.fullName || '',
                    email: data.data.email || '',
                    phoneNumber: data.data.phoneNumber || '',
                    address: data.data.address || '',
                    profileImage: data.data.profileImage || ''
                });
            }
        } catch (error) {
            console.error('Error fetching profile:', error);
            toast.error('Failed to load profile data');
        } finally {
            setLoading(false);
        }
    };

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 2 * 1024 * 1024) {
                toast.error('Image size should be less than 2MB');
                return;
            }
            const reader = new FileReader();
            reader.onloadend = () => {
                setProfile(prev => ({ ...prev, profileImage: reader.result }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${BASE_URL}/api/parent/update`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    fullName: profile.fullName,
                    phoneNumber: profile.phoneNumber,
                    address: profile.address,
                    profileImage: profile.profileImage
                })
            });
            const data = await response.json();
            if (data.success) {
                toast.success('Profile updated successfully', {
                    icon: '👤',
                    style: {
                        borderRadius: '1rem',
                        background: '#111827',
                        color: '#fff',
                    },
                });
            } else {
                toast.error(data.message || 'Update failed');
            }
        } catch (error) {
            console.error('Error updating profile:', error);
            toast.error('Something went wrong. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px]">
                <Loader2 className="h-10 w-10 text-purple-500 animate-spin mb-4" />
                <p className="text-gray-500 font-medium tracking-tight">Loading your profile...</p>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-700">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight">Profile Settings</h1>
                    <p className="text-gray-500 font-medium">Manage your personal information and account details.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Profile Photo Card */}
                <div className="lg:col-span-1">
                    <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm p-8 text-center space-y-6 sticky top-8">
                        <div className="relative inline-block group">
                            <div className="w-32 h-32 rounded-[2rem] overflow-hidden border-4 border-purple-50 shadow-inner bg-gray-50 flex items-center justify-center transition-all duration-500 group-hover:scale-95 group-hover:rotate-2">
                                {profile.profileImage ? (
                                    <img 
                                        src={profile.profileImage} 
                                        alt="Profile" 
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <User size={48} className="text-purple-200" />
                                )}
                            </div>
                            <label className="absolute -bottom-2 -right-2 bg-purple-600 text-white p-3 rounded-2xl shadow-xl shadow-purple-200 cursor-pointer hover:bg-purple-700 hover:scale-110 active:scale-90 transition-all border-4 border-white">
                                <Camera size={18} />
                                <input 
                                    type="file" 
                                    className="hidden" 
                                    accept="image/*"
                                    onChange={handleImageUpload}
                                />
                            </label>
                        </div>
                        <div className="space-y-1">
                            <h3 className="text-xl font-black text-gray-900">{profile.fullName || 'Parent'}</h3>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Parent Account</p>
                        </div>
                        <p className="text-xs text-gray-400 px-4 leading-relaxed font-medium">
                            Upload a high-quality photo to help staff recognize you during pick-ups.
                        </p>
                    </div>
                </div>

                {/* Form Card */}
                <div className="lg:col-span-2">
                    <form onSubmit={handleUpdate} className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
                        <div className="p-8 border-b border-gray-50 bg-gray-50/30">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-white border border-gray-100 flex items-center justify-center text-purple-600 shadow-sm">
                                    <User size={20} />
                                </div>
                                <h3 className="text-lg font-black text-gray-900">Personal Information</h3>
                            </div>
                        </div>

                        <div className="p-8 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Full Name</label>
                                    <div className="relative group">
                                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                                            <User size={18} />
                                        </div>
                                        <input 
                                            type="text"
                                            value={profile.fullName}
                                            onChange={(e) => setProfile(prev => ({ ...prev, fullName: e.target.value }))}
                                            className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-purple-200 outline-none transition-all font-bold text-gray-700"
                                            placeholder="Enter your full name"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Email Address</label>
                                    <div className="relative opacity-60">
                                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                                            <Mail size={18} />
                                        </div>
                                        <input 
                                            type="email"
                                            value={profile.email}
                                            disabled
                                            className="w-full pl-12 pr-4 py-4 bg-gray-100 border border-transparent rounded-2xl cursor-not-allowed font-bold text-gray-500"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Phone Number</label>
                                    <div className="relative group">
                                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                                            <Phone size={18} />
                                        </div>
                                        <input 
                                            type="text"
                                            value={profile.phoneNumber}
                                            onChange={(e) => setProfile(prev => ({ ...prev, phoneNumber: e.target.value }))}
                                            className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-purple-200 outline-none transition-all font-bold text-gray-700"
                                            placeholder="Enter your phone number"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2 md:col-span-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Home Address</label>
                                    <div className="relative group">
                                        <div className="absolute left-4 top-6 text-gray-400">
                                            <MapPin size={18} />
                                        </div>
                                        <textarea 
                                            value={profile.address}
                                            onChange={(e) => setProfile(prev => ({ ...prev, address: e.target.value }))}
                                            rows="4"
                                            className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-purple-200 outline-none transition-all font-bold text-gray-700 resize-none"
                                            placeholder="Enter your complete residential address"
                                        ></textarea>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="p-8 bg-gray-50/50 border-t border-gray-50 flex items-center justify-end">
                            <button 
                                type="submit"
                                disabled={saving}
                                className="flex items-center gap-3 px-10 py-5 bg-purple-600 text-white rounded-[1.5rem] font-black text-sm shadow-xl shadow-purple-200 hover:bg-purple-700 hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:scale-100"
                            >
                                {saving ? (
                                    <>
                                        <Loader2 size={18} className="animate-spin" />
                                        Applying Changes...
                                    </>
                                ) : (
                                    <>
                                        <Save size={18} />
                                        Save Changes
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ParentSettings;
