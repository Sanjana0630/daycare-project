import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthLayout from '../components/AuthLayout';
import GoogleAuthButton from '../components/GoogleAuthButton';
import { Mail, Lock, User, Baby, CheckCircle2, Circle } from 'lucide-react';

const Register = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: 'parent' // Default role
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);

    // Password validation state
    const passwordRequirements = {
        minLength: formData.password.length >= 8,
        hasUpper: /[A-Z]/.test(formData.password),
        hasLower: /[a-z]/.test(formData.password),
        hasNumber: /[0-9]/.test(formData.password),
        hasSpecial: /[!@#$%^&*(),.?":{}|<>]/.test(formData.password),
    };

    const isPasswordValid = Object.values(passwordRequirements).every(Boolean);
    const passwordsMatch = formData.password && formData.password === formData.confirmPassword;
    const canSubmit = isPasswordValid && passwordsMatch && formData.fullName && formData.email;

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleRoleChange = (role) => {
        setFormData({ ...formData, role });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (!isPasswordValid) {
            setError('Please satisfy all password requirements.');
            return;
        }

        if (!passwordsMatch) {
            setError('Passwords do not match.');
            return;
        }

        setLoading(true);

        try {
            const apiUrl = import.meta.env.VITE_API_URL;
            // Destructure to exclude confirmPassword from API request
            const { confirmPassword, ...registerData } = formData;

            const response = await fetch(`${apiUrl}/api/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(registerData),
            });

            const data = await response.json();

            if (response.ok) {
                setSuccess('Account created successfully!');
                setTimeout(() => {
                    navigate('/login');
                }, 2000);
            } else {
                setError(data.message || 'Registration failed. Please try again.');
            }
        } catch (err) {
            setError('Connection failed. Please try again later.');
            console.error('Registration error:', err);
        } finally {
            setLoading(false);
        }
    };

    const RequirementItem = ({ satisfied, text }) => (
        <div className={`flex items-center space-x-2 text-xs transition-colors duration-200 ${satisfied ? 'text-green-600' : 'text-red-500'}`}>
            {satisfied ? (
                <CheckCircle2 size={14} className="text-green-500" />
            ) : (
                <Circle size={14} className="text-red-300" />
            )}
            <span>{text}</span>
        </div>
    );

    return (
        <AuthLayout
            title="Create Account"
            subtitle="Join our daycare community"
        >
            <form className="space-y-5" onSubmit={handleSubmit}>
                {error && (
                    <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl animate-in fade-in slide-in-from-top-2">
                        {error}
                    </div>
                )}

                {success && (
                    <div className="p-3 text-sm text-green-600 bg-green-50 border border-green-100 rounded-xl animate-in fade-in slide-in-from-top-2">
                        {success} Redirecting to login...
                    </div>
                )}

                {/* Role Selection */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">I am a...</label>
                    <div className="grid grid-cols-2 gap-3">
                        <button
                            type="button"
                            onClick={() => handleRoleChange('staff')}
                            className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all ${formData.role === 'staff'
                                ? 'border-purple-500 bg-purple-50 text-purple-700 ring-2 ring-purple-200'
                                : 'border-gray-200 hover:bg-gray-50 text-gray-600'
                                }`}
                        >
                            <User size={20} className="mb-1" />
                            <span className="text-xs font-medium">Staff</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => handleRoleChange('parent')}
                            className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all ${formData.role === 'parent'
                                ? 'border-purple-500 bg-purple-50 text-purple-700 ring-2 ring-purple-200'
                                : 'border-gray-200 hover:bg-gray-50 text-gray-600'
                                }`}
                        >
                            <Baby size={20} className="mb-1" />
                            <span className="text-xs font-medium">Parent</span>
                        </button>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <User className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                            type="text"
                            name="fullName"
                            required
                            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-100 focus:border-purple-400 transition-all outline-none"
                            placeholder="John Doe"
                            value={formData.fullName}
                            onChange={handleChange}
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Mail className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                            type="email"
                            name="email"
                            required
                            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-100 focus:border-purple-400 transition-all outline-none"
                            placeholder="name@example.com"
                            value={formData.email}
                            onChange={handleChange}
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Lock className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                            type="password"
                            name="password"
                            required
                            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-100 focus:border-purple-400 transition-all outline-none"
                            placeholder="Create a password"
                            value={formData.password}
                            onChange={handleChange}
                        />
                    </div>
                    {/* Password Requirements UI */}
                    <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2 p-3 bg-gray-50 rounded-xl border border-gray-100">
                        <RequirementItem satisfied={passwordRequirements.minLength} text="Min 8 characters" />
                        <RequirementItem satisfied={passwordRequirements.hasUpper} text="One uppercase letter" />
                        <RequirementItem satisfied={passwordRequirements.hasLower} text="One lowercase letter" />
                        <RequirementItem satisfied={passwordRequirements.hasNumber} text="One number" />
                        <RequirementItem satisfied={passwordRequirements.hasSpecial} text="One special character" />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Confirm Password</label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Lock className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                            type="password"
                            name="confirmPassword"
                            required
                            className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 transition-all outline-none ${formData.confirmPassword === ''
                                ? 'border-gray-200 focus:ring-purple-100 focus:border-purple-400'
                                : passwordsMatch
                                    ? 'border-green-200 bg-green-50 focus:ring-green-100 focus:border-green-400'
                                    : 'border-red-200 bg-red-50 focus:ring-red-100 focus:border-red-400'
                                }`}
                            placeholder="Confirm your password"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                        />
                    </div>
                    {formData.confirmPassword && (
                        <p className={`mt-1.5 text-xs font-medium ${passwordsMatch ? 'text-green-600' : 'text-red-600'}`}>
                            {passwordsMatch ? '✓ Passwords match' : '✗ Passwords do not match'}
                        </p>
                    )}
                </div>

                <button
                    type="submit"
                    disabled={loading || !canSubmit}
                    className={`w-full py-3 px-4 text-white font-semibold rounded-xl shadow-md transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 mt-2 ${loading || !canSubmit
                        ? 'bg-gray-300 cursor-not-allowed'
                        : 'bg-purple-600 hover:bg-purple-700 focus:ring-purple-500'
                        }`}
                >
                    {loading ? 'Creating Account...' : 'Create Account'}
                </button>

                <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-200"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                        <span className="px-2 bg-white text-gray-500">or</span>
                    </div>
                </div>

                <GoogleAuthButton text="Sign up with Google" />

                <p className="mt-8 text-center text-sm text-gray-600">
                    Already have an account?{' '}
                    <Link to="/login" className="font-medium text-purple-600 hover:text-purple-500">
                        Login
                    </Link>
                </p>
            </form>
        </AuthLayout>
    );
};

export default Register;
