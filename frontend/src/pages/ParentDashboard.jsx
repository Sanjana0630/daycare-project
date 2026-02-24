import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    User,
    Calendar,
    Clock,
    CreditCard,
    Bell,
    CheckCircle,
    XCircle,
    AlertCircle,
    ChevronRight,
    Loader2,
    Mail,
    Phone,
    MapPin,
    Utensils,
    Moon,
    Gamepad2,
    ExternalLink,
    ArrowRight
} from 'lucide-react';
import { BASE_URL } from '../config';

const ParentDashboard = () => {
    const [child, setChild] = useState(null);
    const [attendance, setAttendance] = useState([]);
    const [activities, setActivities] = useState([]);
    const [fees, setFees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fullName = localStorage.getItem('fullName') || 'Parent';
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    const navigate = useNavigate();

    useEffect(() => {
        if (!token || role !== 'parent') {
            navigate('/login');
            return;
        }

        const fetchParentData = async () => {
            try {
                setLoading(true);
                // 1. Fetch linked child
                const childRes = await fetch(`${BASE_URL}/api/parent/child`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const childData = await childRes.json();

                if (childData.success && childData.data) {
                    setChild(childData.data);
                    const childId = childData.data._id;

                    // 2. Fetch Attendance, Activities, Fees in parallel
                    const [attRes, actRes, feeRes] = await Promise.all([
                        fetch(`${BASE_URL}/api/parent/attendance/child/${childId}`, { headers: { 'Authorization': `Bearer ${token}` } }),
                        fetch(`${BASE_URL}/api/parent/activities/child/${childId}`, { headers: { 'Authorization': `Bearer ${token}` } }),
                        fetch(`${BASE_URL}/api/parent/fees/child/${childId}`, { headers: { 'Authorization': `Bearer ${token}` } })
                    ]);

                    const [attData, actData, feeData] = await Promise.all([attRes.json(), actRes.json(), feeRes.json()]);

                    if (attData.success) setAttendance(attData.data);
                    if (actData.success) setActivities(actData.data);
                    if (feeData.success) setFees(feeData.data);
                } else {
                    setChild(null);
                }
            } catch (err) {
                console.error('Error fetching dashboard data:', err);
                setError('Failed to load dashboard data. Please try again.');
            } finally {
                setLoading(false);
            }
        };

        if (token) {
            fetchParentData();
        }
    }, [token, role, navigate]);

    // Calculate age from DOB
    const calculateAge = (dobString) => {
        if (!dobString) return '';
        const dob = new Date(dobString);
        const diffMs = Date.now() - dob.getTime();
        const ageDate = new Date(diffMs);
        const years = Math.abs(ageDate.getUTCFullYear() - 1970);
        const months = ageDate.getUTCMonth();
        return `${years}y ${months}m`;
    };

    // Calculate attendance %
    const calculateAttendancePercentage = () => {
        if (attendance.length === 0) return 0;
        const presentCount = attendance.filter(a => a.status === 'Present').length;
        return Math.round((presentCount / attendance.length) * 100);
    };

    const getActivityIcon = (title) => {
        const t = title.toLowerCase();
        if (t.includes('meal') || t.includes('food') || t.includes('lunch') || t.includes('breakfast')) return <Utensils size={18} />;
        if (t.includes('nap') || t.includes('sleep') || t.includes('rest')) return <Moon size={18} />;
        if (t.includes('play') || t.includes('game') || t.includes('activity')) return <Gamepad2 size={18} />;
        return <CheckCircle size={18} />;
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
                <Loader2 className="h-10 w-10 text-purple-500 animate-spin mb-4" />
                <p className="text-gray-500 font-medium">Loading your dashboard...</p>
            </div>
        );
    }

    if (!child) {
        return (
            <div className="animate-in fade-in duration-700 max-w-4xl mx-auto py-8 px-4">
                {/* Welcome Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 pb-6 border-b border-gray-100">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 leading-tight">Welcome, {fullName} 👋</h1>
                        <p className="text-gray-500 font-medium mt-1">We're glad to have you back.</p>
                    </div>
                    <div className="mt-4 md:mt-0">
                        <span className="bg-purple-50 text-purple-600 px-4 py-1.5 rounded-full text-sm font-bold border border-purple-100 uppercase tracking-wider">
                            Parent Dashboard
                        </span>
                    </div>
                </div>

                <div className="flex flex-col items-center">
                    {/* Main Card */}
                    <div className="bg-white rounded-[2rem] p-10 md:p-14 text-center shadow-xl shadow-purple-900/5 border border-gray-100 w-full mb-10 ring-1 ring-gray-900/5">
                        <div className="w-28 h-28 bg-purple-50 text-purple-400 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner">
                            <User size={56} strokeWidth={1.5} />
                        </div>
                        <h2 className="text-3xl font-black text-gray-900 mb-4">No child assigned yet</h2>
                        <p className="text-gray-500 text-lg mb-10 max-w-md mx-auto leading-relaxed">
                            Your account is not linked to any child in our system. Once linked, you can track progress here.
                        </p>

                        {/* Action Box */}
                        <div className="bg-amber-50 rounded-3xl p-8 border border-amber-100/50 text-left mb-10">
                            <div className="flex items-center gap-3 text-amber-800 mb-3">
                                <AlertCircle size={24} />
                                <h3 className="text-xl font-bold">Action Required</h3>
                            </div>
                            <p className="text-amber-800/80 font-medium leading-relaxed">
                                Please contact the daycare administration to link your child to your account. You will need to provide your registered email address.
                            </p>
                        </div>

                        {/* Buttons */}
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <button className="w-full sm:w-auto px-10 py-4 bg-purple-600 text-white font-bold rounded-2xl hover:bg-purple-700 transition-all shadow-lg shadow-purple-600/20 flex items-center justify-center gap-2 group">
                                <Mail size={20} />
                                Contact Admin
                            </button>
                            <button
                                onClick={() => window.location.reload()}
                                className="w-full sm:w-auto px-10 py-4 bg-white text-gray-700 font-bold rounded-2xl hover:bg-gray-50 transition-all border border-gray-200 flex items-center justify-center gap-2"
                            >
                                <Clock size={20} />
                                Check Again
                            </button>
                        </div>
                    </div>

                    {/* Contact Section below */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full px-4">
                        <div className="bg-white p-6 rounded-2xl border border-gray-50 shadow-sm flex items-center gap-4">
                            <div className="w-12 h-12 bg-blue-50 text-blue-500 rounded-xl flex items-center justify-center">
                                <Mail size={24} />
                            </div>
                            <div>
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Email Us</p>
                                <p className="text-sm font-bold text-gray-700">admin@daycare.com</p>
                            </div>
                        </div>
                        <div className="bg-white p-6 rounded-2xl border border-gray-50 shadow-sm flex items-center gap-4">
                            <div className="w-12 h-12 bg-green-50 text-green-500 rounded-xl flex items-center justify-center">
                                <Phone size={24} />
                            </div>
                            <div>
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Call Us</p>
                                <p className="text-sm font-bold text-gray-700">+91 98765 43210</p>
                            </div>
                        </div>
                        <div className="bg-white p-6 rounded-2xl border border-gray-50 shadow-sm flex items-center gap-4">
                            <div className="w-12 h-12 bg-purple-50 text-purple-500 rounded-xl flex items-center justify-center">
                                <Clock size={24} />
                            </div>
                            <div>
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Hours</p>
                                <p className="text-sm font-bold text-gray-700">Mon-Fri: 8am - 6pm</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    const attendancePct = calculateAttendancePercentage();
    const todayAttendance = attendance.find(a => new Date(a.date).toDateString() === new Date().toDateString());

    return (
        <div className="animate-in fade-in duration-700 space-y-8 pb-12">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 py-2">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight">Welcome, {fullName.split(' ')[0]}! 👋</h1>
                    <p className="text-gray-500 font-medium mt-1">Here's a look at {child.childName}'s day.</p>
                </div>
                <div className="flex gap-3">
                    <div className="bg-white px-5 py-2.5 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${todayAttendance?.status === 'Present' ? 'bg-green-500 shadow-lg shadow-green-200' : 'bg-red-400 animate-pulse'}`}></div>
                        <span className="text-sm font-bold text-gray-700">
                            {todayAttendance ? `Status: ${todayAttendance.status}` : 'Not Checked In'}
                        </span>
                    </div>
                </div>
            </div>

            {/* Main Stats Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Child Overview Card */}
                <div className="lg:col-span-2 bg-gradient-to-br from-purple-600 to-indigo-700 rounded-[2.5rem] p-8 shadow-2xl shadow-purple-900/20 text-white relative overflow-hidden group min-h-[240px]">
                    <div className="absolute top-0 right-0 p-8 transform translate-x-12 -translate-y-12 opacity-10 group-hover:scale-110 group-hover:-translate-x-8 group-hover:-translate-y-8 transition-all duration-1000">
                        <User size={280} />
                    </div>

                    <div className="relative z-10 h-full flex flex-col justify-between">
                        <div className="flex items-start justify-between">
                            <div className="w-20 h-20 bg-white/20 backdrop-blur-xl rounded-[2rem] flex items-center justify-center border border-white/20 shadow-2xl">
                                <span className="text-4xl font-black">{child.childName.charAt(0)}</span>
                            </div>
                            <div className="bg-white/10 backdrop-blur-md px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest border border-white/10">
                                {child.assignedTeacher ? 'Teacher Assigned' : 'Class: Starters'}
                            </div>
                        </div>

                        <div className="mt-8">
                            <h2 className="text-3xl font-black mb-2 tracking-tight">{child.childName}</h2>
                            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-purple-100 font-bold text-sm">
                                <span className="px-3 py-1 bg-white/10 rounded-lg">{calculateAge(child.dob)}</span>
                                <span className="px-3 py-1 bg-white/10 rounded-lg">{child.gender}</span>
                                <span className="px-3 py-1 bg-white/10 rounded-lg">Staff: {child.assignedTeacher?.fullName || 'TBD'}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Attendance Summary */}
                <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center group hover:shadow-xl transition-all duration-500">
                    <h3 className="text-lg font-black text-gray-800 mb-8 w-full text-left flex items-center justify-between">
                        Attendance
                        <span className="text-xs font-bold text-purple-400">Monthly</span>
                    </h3>
                    <div className="relative w-40 h-40 mb-8">
                        <svg className="w-full h-full transform -rotate-90">
                            <circle
                                cx="80"
                                cy="80"
                                r="70"
                                stroke="currentColor"
                                strokeWidth="16"
                                fill="transparent"
                                className="text-gray-100"
                            />
                            <circle
                                cx="80"
                                cy="80"
                                r="70"
                                stroke="currentColor"
                                strokeWidth="16"
                                fill="transparent"
                                strokeDasharray={Math.PI * 2 * 70}
                                strokeDashoffset={(Math.PI * 2 * 70) * (1 - attendancePct / 100)}
                                className="text-purple-600 transition-all duration-1000 ease-out"
                                strokeLinecap="round"
                            />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-4xl font-black text-gray-900 tracking-tighter">{attendancePct}%</span>
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Present</span>
                        </div>
                    </div>
                    <div className="w-full flex justify-between items-center pt-2">
                        <div className="text-left font-bold">
                            <p className="text-xs text-gray-400 uppercase">Today</p>
                            <p className={`text-sm ${todayAttendance?.status === 'Present' ? 'text-green-600' : 'text-gray-600'}`}>
                                {todayAttendance?.status || 'No Data'}
                            </p>
                        </div>
                        <Calendar size={20} className="text-purple-200" />
                    </div>
                </div>

                {/* Fees Section */}
                <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-100 flex flex-col justify-between group hover:shadow-xl transition-all duration-500">
                    <div>
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-lg font-black text-gray-800">Fees Status</h3>
                            <div className="w-10 h-10 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center">
                                <CreditCard size={20} />
                            </div>
                        </div>

                        {fees.length > 0 ? (
                            <div className="space-y-6">
                                <div className="p-6 bg-gray-50 rounded-3xl border border-gray-100 relative overflow-hidden">
                                    <div className="relative z-10 text-center">
                                        <div className={`inline-block px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest mb-3 ${fees[0].status === 'Paid'
                                                ? 'bg-green-100 text-green-700'
                                                : 'bg-amber-100 text-amber-700'
                                            }`}>
                                            {fees[0].status}
                                        </div>
                                        <p className="text-3xl font-black text-gray-900 leading-none">₹{fees[0].amount.toLocaleString('en-IN')}</p>
                                    </div>
                                    <div className="absolute top-0 right-0 p-4 opacity-5 stroke-1">
                                        <CreditCard size={80} />
                                    </div>
                                </div>

                                <div className="px-2">
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Next Due Date</p>
                                    <p className="text-sm font-bold text-gray-700 flex items-center gap-2">
                                        <Calendar size={14} className="text-purple-400" />
                                        {new Date(fees[0].dueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long' })}
                                    </p>
                                </div>

                                <button className="w-full py-4 bg-gray-900 text-white font-black rounded-2xl hover:bg-gray-800 transition-all flex items-center justify-center gap-2 group/btn">
                                    Pay Now
                                    <ArrowRight size={18} className="group-hover/btn:translate-x-1 transition-transform" />
                                </button>
                            </div>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-center py-10">
                                <CheckCircle size={40} className="text-green-200 mb-4" />
                                <p className="text-gray-400 font-bold">All settled up!</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Bottom Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Recent Activities Timeline */}
                <div className="lg:col-span-2 bg-white rounded-[2.5rem] p-10 shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-10">
                        <h3 className="text-xl font-black text-gray-900 tracking-tight">Daily Highlights</h3>
                        <div className="flex items-center gap-4">
                            <div className="flex -space-x-2">
                                <div className="w-8 h-8 rounded-full bg-purple-50 flex items-center justify-center border-2 border-white text-purple-600">
                                    <Utensils size={14} />
                                </div>
                                <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center border-2 border-white text-blue-600">
                                    <Moon size={14} />
                                </div>
                                <div className="w-8 h-8 rounded-full bg-green-50 flex items-center justify-center border-2 border-white text-green-600">
                                    <Gamepad2 size={14} />
                                </div>
                            </div>
                            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Today</span>
                        </div>
                    </div>

                    {activities.length > 0 ? (
                        <div className="space-y-10 relative before:absolute before:inset-0 before:left-[1.35rem] before:w-0.5 before:bg-gray-100">
                            {activities.map((activity, idx) => (
                                <div key={idx} className="relative pl-14">
                                    <div className="absolute left-0 top-1 w-11 h-11 bg-white border-2 border-purple-600 rounded-2xl flex items-center justify-center z-10 shadow-lg shadow-purple-600/10 text-purple-600">
                                        {getActivityIcon(activity.title)}
                                    </div>
                                    <div>
                                        <div className="flex items-center justify-between mb-2">
                                            <h4 className="font-black text-lg text-gray-900 tracking-tight leading-none">{activity.title}</h4>
                                            <div className="flex items-center gap-1.5 text-xs font-black text-gray-400 uppercase tracking-widest">
                                                <Clock size={12} />
                                                {new Date(activity.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </div>
                                        </div>
                                        <div className="bg-gray-50/50 p-5 rounded-3xl border border-gray-100/50 ring-1 ring-gray-900/5">
                                            <p className="text-sm text-gray-600 font-medium leading-relaxed">{activity.description}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="py-20 flex flex-col items-center justify-center text-center bg-gray-50/50 rounded-[2rem] border-2 border-dashed border-gray-100">
                            <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center text-gray-200 mb-6 shadow-sm border border-gray-100">
                                <Gamepad2 size={36} />
                            </div>
                            <h4 className="text-gray-900 font-black text-xl mb-2 tracking-tight">No activities yet</h4>
                            <p className="text-sm text-gray-400 font-medium max-w-xs leading-relaxed">
                                We'll keep you posted with meal times, naps, and playful moments as they happen.
                            </p>
                        </div>
                    )}
                </div>

                {/* Notifications Panel */}
                <div className="bg-white rounded-[2.5rem] p-10 shadow-sm border border-gray-100 flex flex-col">
                    <div className="flex items-center justify-between mb-10">
                        <h3 className="text-xl font-black text-gray-900 tracking-tight">Alerts</h3>
                        <div className="relative">
                            <Bell className="text-purple-600" size={24} />
                            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
                        </div>
                    </div>

                    <div className="space-y-6 flex-1">
                        {[
                            { type: 'success', title: 'Daily check-in completed', time: '8:30 AM', desc: 'Arrived safely at the center.' },
                            { type: 'alert', title: 'Medical form update', time: 'Yesterday', desc: 'Please review and sign the latest form.' }
                        ].map((notif, idx) => (
                            <div key={idx} className="group cursor-pointer">
                                <div className="flex items-start gap-4 p-5 bg-gray-50/50 rounded-3xl border border-gray-100/50 group-hover:border-purple-200 group-hover:bg-purple-50/30 transition-all duration-300">
                                    <div className={`mt-1 w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${notif.type === 'success' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                                        }`}>
                                        {notif.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
                                    </div>
                                    <div>
                                        <div className="flex items-center justify-between mb-1">
                                            <p className="text-sm font-black text-gray-900 leading-tight">{notif.title}</p>
                                        </div>
                                        <p className="text-xs text-gray-500 font-medium leading-relaxed mb-2">{notif.desc}</p>
                                        <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest">{notif.time}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-8">
                        <button className="w-full py-4 bg-white border-2 border-gray-100 text-gray-700 font-black text-sm rounded-2xl hover:bg-gray-50 hover:border-gray-200 transition-all flex items-center justify-center gap-2">
                            View All History
                            <ExternalLink size={16} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ParentDashboard;
