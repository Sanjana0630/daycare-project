import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    User,
    Calendar,
    Mail,
    Phone,
    Briefcase,
    GraduationCap,
    MapPin,
    ArrowLeft,
    Save,
    X,
    ShieldCheck
} from 'lucide-react';

const SectionTitle = ({ icon: Icon, title }) => (
    <div className="flex items-center gap-2 mb-6 pb-2 border-b border-gray-100">
        <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
            <Icon size={18} />
        </div>
        <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
    </div>
);

const InputField = ({ label, name, type = "text", icon: Icon, placeholder, required = false, options = [], value, onChange }) => (
    <div className="space-y-1.5 flex-1">
        <label className="text-sm font-medium text-gray-700 block">{label} {required && <span className="text-red-500">*</span>}</label>
        <div className="relative">
            {Icon && (
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                    <Icon size={18} />
                </div>
            )}
            {type === 'select' ? (
                <select
                    name={name}
                    required={required}
                    value={value}
                    onChange={onChange}
                    className={`w-full ${Icon ? 'pl-10' : 'pl-4'} pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all outline-none appearance-none`}
                >
                    <option value="">Select {label}</option>
                    {options.map((opt) => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                </select>
            ) : (
                <input
                    type={type}
                    name={name}
                    required={required}
                    placeholder={placeholder}
                    value={value || ''}
                    onChange={onChange}
                    className={`w-full ${Icon ? 'pl-10' : 'pl-4'} pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all outline-none`}
                />
            )}
        </div>
    </div>
);

const TextAreaField = ({ label, name, icon: Icon, placeholder, value, onChange }) => (
    <div className="space-y-1.5 flex-1">
        <label className="text-sm font-medium text-gray-700 block">{label}</label>
        <div className="relative">
            <div className="absolute top-3 left-3 text-gray-400">
                <Icon size={18} />
            </div>
            <textarea
                name={name}
                placeholder={placeholder}
                value={value || ''}
                onChange={onChange}
                rows="3"
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all outline-none resize-none"
            />
        </div>
    </div>
);

const EditStaff = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        role: '',
        dob: '',
        gender: '',
        joiningDate: '',
        qualification: '',
        experience: '',
        address: '',
        status: 'Active',
    });

    useEffect(() => {
        const fetchStaffMember = async () => {
            try {
                const apiUrl = import.meta.env.VITE_API_URL;
                const response = await fetch(`${apiUrl}/api/staff/${id}`);
                const data = await response.json();
                if (data.success) {
                    // Format dates for input fields
                    const member = data.data;
                    setFormData({
                        ...member,
                        dob: member.dob ? new Date(member.dob).toISOString().split('T')[0] : '',
                        joiningDate: member.joiningDate ? new Date(member.joiningDate).toISOString().split('T')[0] : '',
                    });
                } else {
                    setError('Staff member not found');
                }
            } catch (err) {
                setError('Failed to fetch staff details');
            } finally {
                setLoading(false);
            }
        };

        fetchStaffMember();
    }, [id]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e) => {
        if (e) e.preventDefault();
        setSaving(true);
        setError('');
        setSuccess('');

        try {
            const apiUrl = import.meta.env.VITE_API_URL;
            const response = await fetch(`${apiUrl}/api/staff/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (response.ok) {
                setSuccess('Staff profile updated successfully!');
                setTimeout(() => {
                    navigate('/admin/staff');
                }, 2000);
            } else {
                setError(data.message || 'Failed to update staff member.');
            }
        } catch (err) {
            setError('Connection failed. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="p-8 text-center text-gray-500">Loading staff details...</div>;

    return (
        <div className="max-w-4xl mx-auto pb-12 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div>
                    <button
                        onClick={() => navigate('/admin/staff')}
                        className="flex items-center gap-2 text-gray-500 hover:text-blue-600 transition-colors mb-2 group"
                    >
                        <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                        Back to Staff List
                    </button>
                    <h2 className="text-2xl font-bold text-gray-900">Edit Staff Profile</h2>
                    <p className="text-gray-500">Update information for {formData.name}</p>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={() => navigate('/admin/staff')}
                        className="px-6 py-2.5 border border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-all flex items-center gap-2"
                    >
                        <X size={18} />
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={saving}
                        className="px-6 py-2.5 bg-blue-600 text-white font-semibold rounded-xl shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all flex items-center gap-2 disabled:opacity-50"
                    >
                        {saving ? 'Updating...' : (
                            <>
                                <Save size={18} />
                                Update Profile
                            </>
                        )}
                    </button>
                </div>
            </div>

            {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 flex items-center gap-3 animate-in slide-in-from-top-4">
                    <X size={20} className="bg-red-100 rounded-full p-0.5" />
                    <p className="font-medium">{error}</p>
                </div>
            )}

            {success && (
                <div className="mb-6 p-4 bg-green-50 border border-green-100 rounded-2xl text-green-600 flex items-center gap-3 animate-in slide-in-from-top-4">
                    <ShieldCheck size={20} />
                    <p className="font-medium">{success}</p>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Personal Information */}
                <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-gray-100">
                    <SectionTitle icon={User} title="Personal Information" />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <InputField
                            label="Full Name"
                            name="name"
                            icon={User}
                            placeholder="Enter full name"
                            required
                            value={formData.name}
                            onChange={handleChange}
                        />
                        <InputField
                            label="Email Address"
                            name="email"
                            type="email"
                            icon={Mail}
                            placeholder="email@example.com"
                            required
                            value={formData.email}
                            onChange={handleChange}
                        />
                        <InputField
                            label="Phone Number"
                            name="phone"
                            icon={Phone}
                            placeholder="Enter phone number"
                            required
                            value={formData.phone}
                            onChange={handleChange}
                        />
                        <div className="grid grid-cols-2 gap-4">
                            <InputField
                                label="Date of Birth"
                                name="dob"
                                type="date"
                                icon={Calendar}
                                required
                                value={formData.dob}
                                onChange={handleChange}
                            />
                            <InputField
                                label="Gender"
                                name="gender"
                                type="select"
                                icon={User}
                                required
                                options={[
                                    { label: 'Male', value: 'Male' },
                                    { label: 'Female', value: 'Female' },
                                    { label: 'Other', value: 'Other' },
                                ]}
                                value={formData.gender}
                                onChange={handleChange}
                            />
                        </div>
                    </div>
                </div>

                {/* Professional Information */}
                <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-gray-100">
                    <SectionTitle icon={Briefcase} title="Professional Details" />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <InputField
                            label="Designation / Role"
                            name="role"
                            type="select"
                            icon={Briefcase}
                            required
                            options={[
                                { label: 'Teacher', value: 'Teacher' },
                                { label: 'Caretaker', value: 'Caretaker' },
                                { label: 'Principal', value: 'Principal' },
                                { label: 'Admin', value: 'Admin' },
                            ]}
                            value={formData.role}
                            onChange={handleChange}
                        />
                        <InputField
                            label="Joining Date"
                            name="joiningDate"
                            type="date"
                            icon={Calendar}
                            required
                            value={formData.joiningDate}
                            onChange={handleChange}
                        />
                        <InputField
                            label="Qualification"
                            name="qualification"
                            icon={GraduationCap}
                            placeholder="e.g. B.Ed, Diploma in Childcare"
                            required
                            value={formData.qualification}
                            onChange={handleChange}
                        />
                        <InputField
                            label="Work Experience"
                            name="experience"
                            icon={Briefcase}
                            placeholder="e.g. 5 Years"
                            required
                            value={formData.experience}
                            onChange={handleChange}
                        />
                    </div>
                </div>

                {/* Additional Information */}
                <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-gray-100">
                    <SectionTitle icon={MapPin} title="Address & Status" />
                    <div className="space-y-6">
                        <TextAreaField
                            label="Permanent Address"
                            name="address"
                            icon={MapPin}
                            placeholder="Enter full residential address"
                            value={formData.address}
                            onChange={handleChange}
                        />
                        <div className="w-1/2">
                            <InputField
                                label="Employment Status"
                                name="status"
                                type="select"
                                icon={ShieldCheck}
                                required
                                options={[
                                    { label: 'Active', value: 'Active' },
                                    { label: 'Inactive', value: 'Inactive' },
                                ]}
                                value={formData.status}
                                onChange={handleChange}
                            />
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default EditStaff;
