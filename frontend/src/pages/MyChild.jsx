import React, { useState, useEffect } from 'react';
import { Baby, Calendar, User, Phone, Droplet, Users, AlertCircle, PhoneCall } from 'lucide-react';

const MyChild = () => {
    const [childData, setChildData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');

    useEffect(() => {
        const fetchChild = async () => {
            try {
                const token = localStorage.getItem('token');
                const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5005';
                
                const response = await fetch(`${apiUrl}/api/parent/child`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                
                const result = await response.json();
                
                if (result.success && result.data) {
                    setChildData(result.data);
                } else {
                    setMessage(result.message || 'No child record linked to this parent account.');
                }
            } catch (error) {
                console.error("Error fetching child:", error);
                setMessage('Error fetching child details.');
            } finally {
                setLoading(false);
            }
        };

        fetchChild();
    }, []);

    const calculateAge = (dobString) => {
        const dob = new Date(dobString);
        const today = new Date();
        let years = today.getFullYear() - dob.getFullYear();
        let months = today.getMonth() - dob.getMonth();
        
        if (today.getDate() < dob.getDate()) {
            months--;
        }

        if (months < 0) {
            years--;
            months += 12;
        }
        
        return `${years} Year${years !== 1 ? 's' : ''} ${months} Month${months !== 1 ? 's' : ''}`;
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
                    <p className="text-gray-500 font-medium animate-pulse">Loading child details...</p>
                </div>
            </div>
        );
    }

    if (!childData) {
        return (
            <div className="flex items-center justify-center min-h-[60vh] animate-in fade-in duration-700">
                <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm text-center max-w-md">
                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <User className="text-gray-400" size={32} />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">No Child Linked</h3>
                    <p className="text-gray-500">{message}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-0 animate-in fade-in duration-700">
            {/* Top Profile Card */}
            <div className="bg-gradient-to-tr from-purple-700 to-indigo-700 rounded-3xl p-8 shadow-lg text-white mb-[30px] relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
                <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
                    <div className="shrink-0">
                        {childData.photo ? (
                            <img 
                                src={`${import.meta.env.VITE_API_URL || 'http://localhost:5005'}${childData.photo}`} 
                                alt={childData.childName} 
                                className="w-32 h-32 rounded-[2rem] object-cover border-4 border-white/20 shadow-xl"
                            />
                        ) : (
                            <div className="w-32 h-32 bg-white/20 backdrop-blur-md rounded-[2rem] flex items-center justify-center text-5xl font-black shadow-inner border border-white/20">
                                {childData.childName.charAt(0)}
                            </div>
                        )}
                    </div>
                    <div className="flex-1 text-center md:text-left">
                        <h2 className="text-3xl md:text-4xl font-black mb-5 tracking-tight">{childData.childName}</h2>
                        
                        <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mb-5 text-sm font-medium">
                            <span className="px-5 py-2 bg-white/10 backdrop-blur-sm rounded-xl border border-white/10 shadow-sm">
                                Age: {calculateAge(childData.dob)}
                            </span>
                            <span className="px-5 py-2 bg-white/10 backdrop-blur-sm rounded-xl border border-white/10 shadow-sm">
                                Gender: {childData.gender}
                            </span>
                            <span className="px-5 py-2 bg-white/10 backdrop-blur-sm rounded-xl border border-white/10 shadow-sm">
                                Blood Group: {childData.bloodGroup}
                            </span>
                            <span className="px-5 py-2 bg-purple-500/20 text-purple-100 font-bold backdrop-blur-sm rounded-xl border border-purple-400/30 shadow-sm">
                                Class: {childData.class || 'Pending'}
                            </span>
                        </div>
                        
                        <div className="inline-flex items-center gap-3 bg-white/10 px-5 py-2.5 rounded-xl backdrop-blur-sm border border-white/10 shadow-sm">
                            <User size={18} className="text-purple-200" />
                            <span className="text-purple-100">Assigned Teacher: </span>
                            <span className="font-bold">{childData.assignedTeacher?.name || 'Pending'}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Information Grid */}
            <div className="grid gap-[24px]" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
                
                {/* Child Profile */}
                <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm hover:-translate-y-1 hover:shadow-xl transition-all duration-300">
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <Baby className="text-purple-500" size={20} />
                        Child Profile
                    </h3>
                    <div className="h-px bg-gray-100 w-full mb-5"></div>
                    <div className="space-y-5">
                        <div className="flex flex-col">
                            <span className="text-sm font-bold text-gray-400 mb-1 flex items-center gap-1.5"><Baby size={14}/> Name</span>
                            <span className="font-bold text-gray-900 text-base">{childData.childName}</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-sm font-bold text-gray-400 mb-1 flex items-center gap-1.5"><Calendar size={14}/> Age</span>
                            <span className="font-bold text-gray-900 text-base">{calculateAge(childData.dob)}</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-sm font-bold text-gray-400 mb-1 flex items-center gap-1.5"><Users size={14}/> Gender</span>
                            <span className="font-bold text-gray-900 text-base">{childData.gender}</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-sm font-bold text-gray-400 mb-1 flex items-center gap-1.5"><Droplet size={14}/> Blood Group</span>
                            <span className="font-bold text-gray-900 text-base">{childData.bloodGroup}</span>
                        </div>
                    </div>
                </div>

                {/* Admission Details */}
                <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm hover:-translate-y-1 hover:shadow-xl transition-all duration-300">
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <Calendar className="text-green-500" size={20} />
                        Admission Details
                    </h3>
                    <div className="h-px bg-gray-100 w-full mb-5"></div>
                    <div className="space-y-5">
                        <div className="flex flex-col">
                            <span className="text-sm font-bold text-gray-400 mb-1 flex items-center gap-1.5"><Calendar size={14}/> Admission Date</span>
                            <span className="font-bold text-gray-900 text-base">
                                {new Date(childData.admissionDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                            </span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-sm font-bold text-gray-400 mb-1 flex items-center gap-1.5"><User size={14}/> Assigned Teacher</span>
                            <span className="font-bold text-gray-900 text-base">{childData.assignedTeacher?.name || 'Pending'}</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-sm font-bold text-gray-400 mb-1 flex items-center gap-1.5"><User size={14}/> Assigned Caretaker</span>
                            <span className="font-bold text-gray-900 text-base">{childData.assignedCaretaker?.name || 'Pending'}</span>
                        </div>
                    </div>
                </div>

                {/* Parent Information */}
                <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm hover:-translate-y-1 hover:shadow-xl transition-all duration-300">
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <User className="text-blue-500" size={20} />
                        Parent Information
                    </h3>
                    <div className="h-px bg-gray-100 w-full mb-5"></div>
                    <div className="space-y-5">
                        <div className="flex flex-col">
                            <span className="text-sm font-bold text-gray-400 mb-1 flex items-center gap-1.5"><User size={14}/> Parent Name</span>
                            <span className="font-bold text-gray-900 text-base">{childData.parentName}</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-sm font-bold text-gray-400 mb-1 flex items-center gap-1.5"><Phone size={14}/> Phone</span>
                            <span className="font-bold text-gray-900 text-base">{childData.parentPhone}</span>
                        </div>
                    </div>
                </div>

                {/* Emergency Contact */}
                <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm hover:-translate-y-1 hover:shadow-xl transition-all duration-300">
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <PhoneCall className="text-orange-500" size={20} />
                        Emergency Contact
                    </h3>
                    <div className="h-px bg-gray-100 w-full mb-5"></div>
                    <div className="space-y-5">
                        <div className="flex flex-col">
                            <span className="text-sm font-bold text-gray-400 mb-1 flex items-center gap-1.5"><User size={14}/> Contact Name</span>
                            <span className="font-bold text-gray-900 text-base">{childData.emergencyContactName}</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-sm font-bold text-gray-400 mb-1 flex items-center gap-1.5"><Phone size={14}/> Contact Number</span>
                            <span className="font-bold text-gray-900 text-base">{childData.emergencyContactNumber}</span>
                        </div>
                    </div>
                </div>
                
                {/* Medical Notes (Optional) */}
                {(childData.allergies || childData.medicalConditions) && (
                    <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm hover:-translate-y-1 hover:shadow-xl transition-all duration-300 md:col-span-2 lg:col-span-2">
                        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <AlertCircle className="text-rose-500" size={20} />
                            Medical Notes
                        </h3>
                        <div className="h-px bg-gray-100 w-full mb-5"></div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {childData.allergies && (
                                <div className="flex flex-col">
                                    <span className="text-sm font-bold text-gray-400 mb-2 flex items-center gap-1.5"><AlertCircle size={14}/> Allergies</span>
                                    <span className="font-bold text-gray-800 bg-amber-50 p-4 rounded-2xl border border-amber-100">{childData.allergies}</span>
                                </div>
                            )}
                            {childData.medicalConditions && (
                                <div className="flex flex-col">
                                    <span className="text-sm font-bold text-gray-400 mb-2 flex items-center gap-1.5"><AlertCircle size={14}/> Medical Conditions</span>
                                    <span className="font-bold text-gray-800 bg-rose-50 p-4 rounded-2xl border border-rose-100">{childData.medicalConditions}</span>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MyChild;
