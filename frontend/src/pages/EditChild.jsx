import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
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
    X,
    Camera
} from 'lucide-react';
import { BASE_URL } from '../config';
import AlertModal from '../components/AlertModal';
import CropModal from '../components/CropModal';

const SectionTitle = ({ icon: Icon, title }) => (
    <div className="flex items-center gap-2 mb-6 pb-2 border-b border-gray-100">
        <div className="p-2 bg-purple-50 rounded-lg text-purple-600">
            <Icon size={18} />
        </div>
        <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
    </div>
);

const InputField = ({ label, name, type = "text", icon: Icon, placeholder, required = false, options = [], value, onChange, onBlur, max, readOnly }) => (
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
                        onBlur={onBlur}
                        className={`w-full ${Icon ? 'pl-10' : 'pl-4'} pr-10 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-100 focus:border-purple-400 transition-all outline-none appearance-none cursor-pointer`}
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
                    onBlur={onBlur}
                    max={max}
                    readOnly={readOnly}
                    className={`w-full ${Icon ? 'pl-10' : 'pl-4'} pr-4 py-2.5 ${readOnly ? 'bg-gray-50 cursor-not-allowed' : 'bg-white'} border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-100 focus:border-purple-400 transition-all outline-none`}
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

const EditChild = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [teachers, setTeachers] = useState([]);
    const [caretakers, setCaretakers] = useState([]);
    const [parents, setParents] = useState([]);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [age, setAge] = useState('');
    const [assignedClass, setAssignedClass] = useState('');
    const [alertModal, setAlertModal] = useState({ isOpen: false, message: '' });

    const [formData, setFormData] = useState({
        childName: '',
        dob: '',
        gender: '',
        bloodGroup: '',
        admissionDate: '',
        parentName: '',
        parentEmail: '',
        parentPhone: '',
        emergencyContactName: '',
        emergencyContactNumber: '',
        allergies: '',
        medicalConditions: '',
        assignedTeacher: '',
        assignedCaretaker: '',
        parent: '',
        photo: null,
    });
    const [existingPhoto, setExistingPhoto] = useState('');
    const [imageToCrop, setImageToCrop] = useState(null);
    const [isCropModalOpen, setIsCropModalOpen] = useState(false);

    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                const [staffRes, parentRes, childRes] = await Promise.all([
                    fetch(`${BASE_URL}/api/staff`),
                    fetch(`${BASE_URL}/api/auth/parents`),
                    fetch(`${BASE_URL}/api/children/${id}`)
                ]);

                const staffData = await staffRes.json();
                const parentData = await parentRes.json();
                const childData = await childRes.json();

                if (staffData.success) {
                    const staffList = staffData.data;
                    setTeachers(staffList.filter(s => s.role === 'Teacher'));
                    setCaretakers(staffList.filter(s => s.role === 'Caretaker'));
                }

                if (parentData.success) {
                    setParents(parentData.data);
                }

                if (childData.success) {
                    const child = childData.data;
                    setFormData({
                        ...child,
                        dob: child.dob ? new Date(child.dob).toISOString().split('T')[0] : '',
                        admissionDate: child.admissionDate ? new Date(child.admissionDate).toISOString().split('T')[0] : '',
                        assignedTeacher: child.assignedTeacher?._id || child.assignedTeacher || '',
                        assignedCaretaker: child.assignedCaretaker?._id || child.assignedCaretaker || '',
                        parent: child.parent?._id || child.parent || '',
                        photo: null // Reset file input to null
                    });
                    if (child.photo) {
                        setExistingPhoto(child.photo);
                    }
                    if (child.dob) calculateAge(child.dob);
                }
            } catch (error) {
                console.error('Error fetching data:', error);
                setError('Failed to load child data.');
            } finally {
                setLoading(false);
            }
        };

        fetchInitialData();
    }, [id]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });

        if (name === 'dob') {
            calculateAge(value);
            // Trigger validation automatically when full date (YYYY-MM-DD) is selected or typed
            if (value && value.length === 10 && new Date(value).getFullYear() >= 1900) {
                checkAgeValidation(value);
            }
        }
    };

    const handleFileChange = (e) => {
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
        setFormData({ ...formData, photo: croppedFile });
        setIsCropModalOpen(false);
        setImageToCrop(null);
    };

    const checkAgeValidation = (dobString) => {
        if (!dobString) return true;

        const birthDate = new Date(dobString);
        // Don't validate if year is obviously partial/invalid
        if (birthDate.getFullYear() < 1900) return true;

        const today = new Date();
        let ageInMonths = (today.getFullYear() - birthDate.getFullYear()) * 12 + (today.getMonth() - birthDate.getMonth());

        if (today.getDate() < birthDate.getDate()) {
            ageInMonths--;
        }

        if (ageInMonths < 1 || ageInMonths > 120) {
            setAlertModal({
                isOpen: true,
                message: "Child admission allowed only for ages between 1 month and 10 years."
            });
            return false;
        }
        return true;
    };

    const calculateAge = (dobString) => {
        if (!dobString) {
            setAge('');
            return;
        }
        const today = new Date();
        const birthDate = new Date(dobString);

        if (birthDate.getFullYear() < 1900) {
            setAge('');
            return;
        }

        let years = today.getFullYear() - birthDate.getFullYear();
        let months = today.getMonth() - birthDate.getMonth();

        if (today.getDate() < birthDate.getDate()) {
            months--;
        }

        if (months < 0) {
            years--;
            months += 12;
        }

        if (years >= 0) {
            if (years > 0) {
                setAge(`${years} year${years > 1 ? 's' : ''} ${months} month${months !== 1 ? 's' : ''}`);
            } else {
                setAge(`${months} month${months !== 1 ? 's' : ''}`);
            }

            if (years === 0 && months >= 1) setAssignedClass("Infant Care");
            else if (years >= 1 && years < 2) setAssignedClass("Toddler Group");
            else if (years >= 2 && years < 3) setAssignedClass("Play Group");
            else if (years >= 3 && years < 4) setAssignedClass("Nursery");
            else if (years >= 4 && years < 5) setAssignedClass("Junior KG");
            else if (years >= 5 && years < 6) setAssignedClass("Senior KG");
            else if (years >= 6 && years <= 10) setAssignedClass("After School Care");
            else setAssignedClass("Not Eligible");

        } else {
            setAge('');
            setAssignedClass('');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Required fields validation
        const requiredFields = [
            { key: 'childName', label: 'Child Name' },
            { key: 'dob', label: 'Date of Birth' },
            { key: 'gender', label: 'Gender' }
        ];

        for (const field of requiredFields) {
            if (!formData[field.key]) {
                setAlertModal({ isOpen: true, message: `${field.label} is required` });
                return;
            }
        }

        // Final Age validation check
        if (!checkAgeValidation(formData.dob)) return;

        setSaving(true);
        setError('');
        setSuccess('');

        try {
            // Clean optional relationship fields: convert "" to null
            const formDataToSubmit = new FormData();

            // Append all fields to FormData
            Object.keys(formData).forEach(key => {
                if (key === 'photo') {
                    if (formData[key]) {
                        formDataToSubmit.append('photo', formData[key]);
                    }
                } else {
                    const value = formData[key] === "" ? null : formData[key];
                    if (value !== null) {
                        formDataToSubmit.append(key, value);
                    }
                }
            });

            const response = await fetch(`${BASE_URL}/api/children/${id}`, {
                method: 'PUT',
                body: formDataToSubmit,
            });

            const data = await response.json();

            if (response.ok) {
                setSuccess('Child record updated successfully!');
                setTimeout(() => {
                    navigate('/children');
                }, 2000);
            } else {
                setError(data.message || 'Failed to update child.');
            }
        } catch (err) {
            setError('Connection failed. Please try again.');
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
        <div className="max-w-4xl mx-auto pb-12 animate-in fade-in duration-500">
            <AlertModal
                isOpen={alertModal.isOpen}
                onClose={() => setAlertModal({ ...alertModal, isOpen: false })}
                message={alertModal.message}
            />
            <CropModal
                isOpen={isCropModalOpen}
                image={imageToCrop}
                onCropComplete={handleCropComplete}
                onCancel={() => {
                    setIsCropModalOpen(false);
                    setImageToCrop(null);
                }}
            />

            {/* Header */}
            <div className="mb-6">
                <button
                    onClick={() => navigate('/children')}
                    className="flex items-center gap-2 text-gray-400 hover:text-purple-600 transition-all group text-sm font-medium"
                >
                    <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                    Back to Children List
                </button>
            </div>

            <div className="text-center mb-10 space-y-3">
                <div className="space-y-1">
                    <h2 className="text-3xl sm:text-4xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-purple-700 via-purple-600 to-indigo-600 text-center mx-auto">
                        Edit Child Record
                    </h2>
                    <p className="text-gray-500 text-sm sm:text-base max-w-md mx-auto">
                        Update information and records for {formData.childName}.
                    </p>
                </div>
                <div className="flex justify-center pt-2">
                    <div className="h-1 w-20 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full opacity-20"></div>
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
                                max={new Date().toISOString().split('T')[0]}
                            />
                            <div className="space-y-1.5 flex-1">
                                <label className="text-sm font-medium text-gray-700 block">Age & Class</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                        <Calendar size={18} />
                                    </div>
                                    <div className="w-full pl-10 pr-4 py-2.5 flex items-center justify-between bg-gray-50 border border-gray-200 rounded-xl text-gray-600 font-medium">
                                        <span>{age || 'Enter DOB'}</span>
                                        {assignedClass && assignedClass !== "Not Eligible" && (
                                            <span className="px-2 py-0.5 text-xs font-bold rounded-md bg-purple-100 text-purple-700">
                                                {assignedClass}
                                            </span>
                                        )}
                                        {assignedClass === "Not Eligible" && (
                                            <span className="px-2 py-0.5 text-xs font-bold rounded-md bg-red-100 text-red-700">
                                                Not Eligible
                                            </span>
                                        )}
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
                            readOnly
                            value={formData.admissionDate}
                        />
                        <div className="space-y-1.5 flex-1">
                            <label className="text-sm font-medium text-gray-700 block text-center">Child Photo</label>
                            <div className="flex flex-col items-center gap-4">
                                {existingPhoto && !formData.photo && (
                                    <div className="relative group">
                                        <img
                                            src={`${BASE_URL}${existingPhoto}`}
                                            alt="Child"
                                            className="w-24 h-24 rounded-2xl object-cover border-2 border-purple-100 shadow-sm"
                                        />
                                        <div className="absolute inset-0 bg-black/40 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                            <Camera size={20} className="text-white" />
                                        </div>
                                    </div>
                                )}
                                {formData.photo && (
                                    <div className="relative group">
                                        <img
                                            src={URL.createObjectURL(formData.photo)}
                                            alt="Preview"
                                            className="w-24 h-24 rounded-2xl object-cover border-2 border-purple-100 shadow-sm"
                                        />
                                        <div className="absolute inset-0 bg-black/40 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                            <Camera size={20} className="text-white" />
                                        </div>
                                    </div>
                                )}
                                {formData.photo && (
                                    <p className="text-[10px] font-bold text-purple-600 uppercase tracking-widest bg-purple-50 px-3 py-1 rounded-full border border-purple-100">
                                        Cropped Image Selected
                                    </p>
                                )}
                                <div className="relative w-full">
                                    <input
                                        type="file"
                                        name="photo"
                                        accept="image/png, image/jpeg, image/jpg"
                                        onChange={handleFileChange}
                                        className="w-full pl-4 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-100 focus:border-purple-400 transition-all outline-none"
                                    />
                                </div>
                            </div>
                        </div>
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
                            value={formData.parentName}
                            onChange={handleChange}
                        />
                        <InputField
                            label="Parent Email"
                            name="parentEmail"
                            type="email"
                            icon={Mail}
                            placeholder="parent@example.com"
                            value={formData.parentEmail}
                            onChange={handleChange}
                        />
                        <InputField
                            label="Parent Phone"
                            name="parentPhone"
                            icon={Phone}
                            placeholder="Enter phone number"
                            value={formData.parentPhone}
                            onChange={handleChange}
                        />
                        <InputField
                            label="Link to Parent Account (Optional)"
                            name="parent"
                            type="select"
                            icon={User}
                            options={parents.map(p => ({ label: `${p.fullName} (${p.email})`, value: p._id }))}
                            value={formData.parent}
                            onChange={handleChange}
                        />
                        <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-gray-50">
                            <InputField
                                label="Emergency Contact Name"
                                name="emergencyContactName"
                                icon={Users}
                                placeholder="Emergency contact person"
                                value={formData.emergencyContactName}
                                onChange={handleChange}
                            />
                            <InputField
                                label="Emergency Contact Number"
                                name="emergencyContactNumber"
                                icon={Phone}
                                placeholder="Emergency number"
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
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-gray-50">
                            <div className="space-y-1.5 flex-1">
                                <label className="text-sm font-medium text-gray-700 block">Assigned Teacher (Auto)</label>
                                <div className="w-full pl-4 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl flex flex-col justify-center min-h-[46px]">
                                    <div className="flex items-center gap-2">
                                        <User size={18} className="text-purple-500" />
                                        {assignedClass && assignedClass !== "Not Eligible" ? (() => {
                                            const teacherInfo = teachers.find(t => t.assignedClass === assignedClass);
                                            return teacherInfo
                                                ? <span className="font-semibold text-purple-700 text-sm">{teacherInfo.name || teacherInfo.fullName}</span>
                                                : <span className="text-red-500 text-sm font-medium italic">No teacher assigned for this class</span>;
                                        })() : <span className="text-gray-400 text-sm italic">Select valid DOB first</span>}
                                    </div>
                                </div>
                            </div>
                            <InputField
                                label="Assign Caretaker (Optional)"
                                name="assignedCaretaker"
                                type="select"
                                icon={Users}
                                options={caretakers.map(c => ({ label: c.name, value: c._id }))}
                                value={formData.assignedCaretaker}
                                onChange={handleChange}
                            />
                        </div>
                    </div>
                </div>

                {/* Form Actions */}
                <div className="flex items-center justify-end gap-3 pt-6">
                    <button
                        type="button"
                        onClick={() => navigate('/children')}
                        className="px-6 py-2.5 border border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-all"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={saving}
                        className="px-8 py-2.5 bg-purple-600 text-white font-semibold rounded-xl shadow-lg shadow-purple-200 hover:bg-purple-700 transition-all disabled:opacity-50 flex items-center gap-2"
                    >
                        {saving ? 'Updating...' : (
                            <>
                                <Save size={18} />
                                Update Child Record
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default EditChild;
