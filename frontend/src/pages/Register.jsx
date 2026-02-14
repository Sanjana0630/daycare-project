import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthLayout from '../components/AuthLayout';
import GoogleAuthButton from '../components/GoogleAuthButton';
import { Mail, Lock, User, Briefcase, Baby } from 'lucide-react';

const Register = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        password: '',
        role: 'parent' // Default role
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);

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
        setLoading(true);

        try {
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
            const response = await fetch(`${apiUrl}/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (response.ok) {
                setSuccess('Account created successfully!');
                // Wait for 2 seconds then navigate to login
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
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className={`w-full py-3 px-4 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-xl shadow-md transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 mt-2 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
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
