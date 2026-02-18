import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    User,
    Calendar,
    Droplets,
    Mail,
    Phone,
    ShieldAlert,
    Stethoscope,
    Users,
    ArrowLeft,
    Save,
    X
} from 'lucide-react';

const SectionTitle = ({ icon: Icon, title }) => (
    <div className="flex items-center gap-2 mb-6 pb-2 border-b border-gray-100">
        <div className="p-2 bg-purple-50 rounded-lg text-purple-600">
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
                <div className="relative">
                    <select
                        name={name}
                        required={required}
                        value={value}
                        onChange={onChange}
                        className={`w-full ${Icon ? 'pl-10' : 'pl-4'} pr-10 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-100 focus:border-purple-400 transition-all outline-none appearance-none`}
                    >
                        <option value="">Select {label}</option>
                        {options.map((opt) => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                    </select>
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-gray-400">
                        <ArrowLeft size={16} className="-rotate-90" />
                    </div>
                </div>
            ) : (
                <input
                    type={type}
                    name={name}
                    required={required}
                    placeholder={placeholder}
                    value={value}
                    onChange={onChange}
                    className={`w-full ${Icon ? 'pl-10' : 'pl-4'} pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-100 focus:border-purple-400 transition-all outline-none`}
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
                value={value}
                onChange={onChange}
                rows="2"
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-100 focus:border-purple-400 transition-all outline-none resize-none"
            />
        </div>
    </div>
);

const AddChild = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [staff, setStaff] = useState([]);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [age, setAge] = useState('');

    const [formData, setFormData] = useState({
        childName: '',
        dob: '',
        gender: '',
        bloodGroup: '',
        admissionDate: new Date().toISOString().split('T')[0],
        parentName: '',
        parentEmail: '',
        parentPhone: '',
        emergencyContactName: '',
        emergencyContactNumber: '',
        allergies: '',
        medicalConditions: '',
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });

        if (name === 'dob') {
            calculateAge(value);
        }
    };

    const calculateAge = (dobString) => {
        if (!dobString) {
            setAge('');
            return;
        }
        const today = new Date();
        const birthDate = new Date(dobString);
        let years = today.getFullYear() - birthDate.getFullYear();
        let months = today.getMonth() - birthDate.getMonth();

        if (months < 0 || (months === 0 && today.getDate() < birthDate.getDate())) {
            years--;
            months += 12;
        }

        if (years > 0) {
            setAge(`${years} year${years > 1 ? 's' : ''} ${months} month${months !== 1 ? 's' : ''}`);
        } else {
            setAge(`${months} month${months !== 1 ? 's' : ''}`);
        }
    };

    const handleSubmit = async (e) => {
        if (e) e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            const apiUrl = import.meta.env.VITE_API_URL;
            const response = await fetch(`${apiUrl}/api/children`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (response.ok) {
                setSuccess('Child added successfully!');
                setTimeout(() => {
                    navigate('/children');
                }, 2000);
            } else {
                setError(data.message || 'Failed to add child.');
            }
        } catch (err) {
            setError('Connection failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto pb-12 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div>
                    <button
                        onClick={() => navigate('/children')}
                        className="flex items-center gap-2 text-gray-500 hover:text-purple-600 transition-colors mb-2 group"
                    >
                        <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                        Back to Children List
                    </button>
                    <h2 className="text-2xl font-bold text-gray-900">Add New Child</h2>
                    <p className="text-gray-500">Register a new child and their parent information.</p>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={() => navigate('/children')}
                        className="px-6 py-2.5 border border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-all flex items-center gap-2"
                    >
                        <X size={18} />
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="px-6 py-2.5 bg-purple-600 text-white font-semibold rounded-xl shadow-lg shadow-purple-200 hover:bg-purple-700 transition-all flex items-center gap-2 disabled:opacity-50"
                    >
                        {loading ? 'Saving...' : (
                            <>
                                <Save size={18} />
                                Save Child
                            </>
                        )}
                    </button>
                </div>
            </div>

            {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 flex items-center gap-3 animate-in slide-in-from-top-4">
                    <ShieldAlert size={20} />
                    <p className="font-medium">{error}</p>
                </div>
            )}

            {success && (
                <div className="mb-6 p-4 bg-green-50 border border-green-100 rounded-2xl text-green-600 flex items-center gap-3 animate-in slide-in-from-top-4">
                    <Save size={20} />
                    <p className="font-medium">{success}</p>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Child Information Section */}
                <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-gray-100">
                    <SectionTitle icon={User} title="Child Information" />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <InputField
                            label="Child Name"
                            name="childName"
                            icon={User}
                            placeholder="Enter child's full name"
                            required
                            value={formData.childName}
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
                            <div className="space-y-1.5 flex-1">
                                <label className="text-sm font-medium text-gray-700 block">Calculated Age</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                        <Calendar size={18} />
                                    </div>
                                    <div className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-600 font-medium">
                                        {age || 'Enter DOB'}
                                    </div>
                                </div>
                            </div>
                        </div>
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
                        <InputField
                            label="Blood Group"
                            name="bloodGroup"
                            type="select"
                            icon={Droplets}
                            required
                            options={[
                                { label: 'A+', value: 'A+' },
                                { label: 'A-', value: 'A-' },
                                { label: 'B+', value: 'B+' },
                                { label: 'B-', value: 'B-' },
                                { label: 'AB+', value: 'AB+' },
                                { label: 'AB-', value: 'AB-' },
                                { label: 'O+', value: 'O+' },
                                { label: 'O-', value: 'O-' },
                            ]}
                            value={formData.bloodGroup}
                            onChange={handleChange}
                        />
                        <InputField
                            label="Admission Date"
                            name="admissionDate"
                            type="date"
                            icon={Calendar}
                            required
                            value={formData.admissionDate}
                            onChange={handleChange}
                        />
                    </div>
                </div>

                {/* Parent Information Section */}
                <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-gray-100">
                    <SectionTitle icon={Users} title="Parent & Contact Details" />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <InputField
                            label="Parent Name"
                            name="parentName"
                            icon={User}
                            placeholder="Enter parent's full name"
                            required
                            value={formData.parentName}
                            onChange={handleChange}
                        />
                        <InputField
                            label="Parent Email"
                            name="parentEmail"
                            type="email"
                            icon={Mail}
                            placeholder="parent@example.com"
                            required
                            value={formData.parentEmail}
                            onChange={handleChange}
                        />
                        <InputField
                            label="Parent Phone"
                            name="parentPhone"
                            icon={Phone}
                            placeholder="Enter phone number"
                            required
                            value={formData.parentPhone}
                            onChange={handleChange}
                        />
                        <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-gray-50">
                            <InputField
                                label="Emergency Contact Name"
                                name="emergencyContactName"
                                icon={Users}
                                placeholder="Emergency contact person"
                                required
                                value={formData.emergencyContactName}
                                onChange={handleChange}
                            />
                            <InputField
                                label="Emergency Contact Number"
                                name="emergencyContactNumber"
                                icon={Phone}
                                placeholder="Emergency number"
                                required
                                value={formData.emergencyContactNumber}
                                onChange={handleChange}
                            />
                        </div>
                    </div>
                </div>

                {/* Medical & Assignment Section */}
                <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-gray-100">
                    <SectionTitle icon={Stethoscope} title="Medical & Caretaker Assignment" />
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <TextAreaField
                                label="Allergies"
                                name="allergies"
                                icon={ShieldAlert}
                                placeholder="List any allergies (optional)"
                                value={formData.allergies}
                                onChange={handleChange}
                            />
                            <TextAreaField
                                label="Medical Conditions"
                                name="medicalConditions"
                                icon={Stethoscope}
                                placeholder="Any chronic conditions (optional)"
                                value={formData.medicalConditions}
                                onChange={handleChange}
                            />
                        </div>
                    </div>
                </div>

                {/* Form Actions (Mobile Bottom Bar) */}
                <div className="flex md:hidden items-center gap-3 pt-6">
                    <button
                        type="button"
                        onClick={() => navigate('/children')}
                        className="flex-1 py-3 border border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-all"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="flex-1 py-3 bg-purple-600 text-white font-semibold rounded-xl shadow-lg shadow-purple-200 hover:bg-purple-700 transition-all disabled:opacity-50"
                    >
                        {loading ? 'Saving...' : 'Save Child'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AddChild;
