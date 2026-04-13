import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, MapPin, GraduationCap, Briefcase, Save, Calendar, UserCheck, ArrowLeft, Camera, Loader2, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { BASE_URL } from '../config';
import AlertModal from '../components/AlertModal';
import CropModal from '../components/CropModal';

const StaffProfile = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [alertModal, setAlertModal] = useState({ isOpen: false, message: '' });

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
        address: '',
        profileImage: ''
    });

    const [imageToCrop, setImageToCrop] = useState(null);
    const [isCropModalOpen, setIsCropModalOpen] = useState(false);

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

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = () => {
                setImageToCrop(reader.result);
                setIsCropModalOpen(true);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleCropComplete = (croppedFile) => {
        setFormData(prev => ({ ...prev, profileImage: croppedFile }));
        setIsCropModalOpen(false);
        setImageToCrop(null);
    };

    const handleRemovePhoto = () => {
        setFormData(prev => ({ ...prev, profileImage: '' }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Custom field validation for popup alerts
        if (!formData.name.trim()) {
            setAlertModal({ isOpen: true, message: "Full Name is required" });
            return;
        }
        if (!formData.phone.trim()) {
            setAlertModal({ isOpen: true, message: "Contact Phone is required" });
            return;
        }
        if (!formData.dob) {
            setAlertModal({ isOpen: true, message: "Date of Birth is required" });
            return;
        }
        if (!formData.qualification.trim()) {
            setAlertModal({ isOpen: true, message: "Highest Qualification is required" });
            return;
        }
        if (!formData.experience.trim()) {
            setAlertModal({ isOpen: true, message: "Years of Experience is required" });
            return;
        }
        if (!formData.address.trim()) {
            setAlertModal({ isOpen: true, message: "Home Address is required" });
            return;
        }

        setSaving(true);
        setMessage({ type: '', text: '' });

        try {
            const token = localStorage.getItem('token');
            const data = new FormData();
            
            // Append all form fields
            Object.keys(formData).forEach(key => {
                if (key === 'profileImage') {
                    if (formData[key] instanceof File) {
                        data.append('profileImage', formData[key]);
                    } else if (typeof formData[key] === 'string') {
                        data.append('profileImage', formData[key]);
                    }
                } else {
                    data.append(key, formData[key]);
                }
            });
            data.set('status', 'Active');

            const response = await fetch(`${BASE_URL}/api/staff/me`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: data
            });

            const result = await response.json();
            if (result.success) {
                setMessage({ type: 'success', text: 'Profile updated successfully!' });
                
                // Dispatch event to update Header
                window.dispatchEvent(new Event('profileUpdated'));

                // Update localStorage name if changed
                localStorage.setItem('fullName', formData.name);
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
            <AlertModal
                isOpen={alertModal.isOpen}
                onClose={() => setAlertModal({ ...alertModal, isOpen: false })}
                message={alertModal.message}
            />

            <div className="bg-white p-8 rounded-[3rem] border border-gray-100 shadow-sm relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="relative z-10">
                    <h2 className="text-3xl font-black text-gray-900">Professional Profile</h2>
                    <p className="text-gray-500 font-medium">Please complete your staff details to finalize your setup.</p>
                </div>
                <button
                    onClick={() => navigate('/staff/dashboard')}
                    className="relative z-10 flex items-center gap-2 px-6 py-3 bg-gray-50 text-gray-600 font-bold rounded-2xl hover:bg-purple-50 hover:text-purple-700 transition-all border border-transparent hover:border-purple-100"
                >
                    <ArrowLeft size={18} />
                    Back to Dashboard
                </button>
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
                {/* Profile Photo Section */}
                <div className="flex flex-col items-center justify-center space-y-4 pb-4 border-b border-gray-50">
                    <div className="relative group">
                        <div className="w-32 h-32 rounded-[2.5rem] overflow-hidden border-4 border-purple-50 shadow-inner bg-gray-50 flex items-center justify-center transition-all duration-500 group-hover:scale-95 group-hover:rotate-2 group-hover:shadow-purple-100/50">
                            {formData.profileImage ? (
                                <img 
                                    src={
                                        formData.profileImage instanceof File 
                                            ? URL.createObjectURL(formData.profileImage)
                                            : formData.profileImage.startsWith('data:') 
                                                ? formData.profileImage 
                                                : formData.profileImage.startsWith('/uploads')
                                                    ? `${BASE_URL}${formData.profileImage}`
                                                    : formData.profileImage
                                    } 
                                    alt="Profile" 
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="text-purple-300 font-black text-5xl uppercase">
                                    {formData.name ? formData.name[0] : 'S'}
                                </div>
                            )}
                            
                            {/* Hover Overlay */}
                            <label className="absolute inset-0 bg-purple-600/60 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 cursor-pointer text-white">
                                <Camera size={24} className="mb-1" />
                                <span className="text-[10px] font-black uppercase tracking-tighter">Change</span>
                                <input 
                                    type="file" 
                                    className="hidden" 
                                    accept="image/*"
                                    onChange={handleImageUpload}
                                />
                            </label>
                        </div>
                        
                        {/* Status Batch */}
                        <div className="absolute -top-2 -right-2 w-8 h-8 bg-white rounded-xl shadow-lg border border-gray-100 flex items-center justify-center text-purple-600 animate-bounce">
                            <UserCheck size={16} />
                        </div>
                    </div>

                    <div className="text-center space-y-2">
                        <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest">Profile Photo</h3>
                        <div className="flex items-center gap-3">
                            <label className="px-4 py-2 bg-purple-50 text-purple-700 text-xs font-black rounded-xl hover:bg-purple-100 transition-all cursor-pointer flex items-center gap-2">
                                <Camera size={14} />
                                Upload Photo
                                <input 
                                    type="file" 
                                    className="hidden" 
                                    accept="image/*"
                                    onChange={handleImageUpload}
                                />
                            </label>
                            {formData.profileImage && (
                                <button 
                                    type="button" 
                                    onClick={handleRemovePhoto}
                                    className="p-2 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-all"
                                    title="Remove Photo"
                                >
                                    <Trash2 size={14} />
                                </button>
                            )}
                        </div>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter mt-1 italic">
                            Help parents and staff recognize you.
                        </p>
                    </div>
                </div>

                <CropModal 
                    isOpen={isCropModalOpen}
                    image={imageToCrop}
                    onCropComplete={handleCropComplete}
                    onCancel={() => {
                        setIsCropModalOpen(false);
                        setImageToCrop(null);
                    }}
                />

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
                            <input type="email" name="email" value={formData.email} readOnly className="w-full pl-12 pr-4 py-4 bg-gray-100 border border-transparent rounded-2xl cursor-not-allowed font-bold text-gray-500" />
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
