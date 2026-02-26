import React from 'react';
import { User, Mail, Phone, MapPin, GraduationCap, Briefcase, Save } from 'lucide-react';

const StaffProfile = () => {
    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-700">
            <div className="bg-white p-8 rounded-[3rem] border border-gray-100 shadow-sm">
                <h2 className="text-3xl font-black text-gray-900">Basic Information</h2>
                <p className="text-gray-500 font-medium">Please complete your profile to finalize your registration.</p>
            </div>

            <div className="bg-white p-10 rounded-[3.5rem] border border-gray-100 shadow-xl shadow-gray-100/50 space-y-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Contact Phone</label>
                        <div className="relative">
                            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input type="text" className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:ring-4 focus:ring-purple-100 focus:border-purple-200 transition-all outline-none font-bold text-gray-700" placeholder="+1 (555) 000-0000" />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Home Address</label>
                        <div className="relative">
                            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input type="text" className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:ring-4 focus:ring-purple-100 focus:border-purple-200 transition-all outline-none font-bold text-gray-700" placeholder="123 Daycare St, City" />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Highest Qualification</label>
                        <div className="relative">
                            <GraduationCap className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input type="text" className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:ring-4 focus:ring-purple-100 focus:border-purple-200 transition-all outline-none font-bold text-gray-700" placeholder="e.g. Bachelor in Early Education" />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Years of Experience</label>
                        <div className="relative">
                            <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input type="text" className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:ring-4 focus:ring-purple-100 focus:border-purple-200 transition-all outline-none font-bold text-gray-700" placeholder="e.g. 5+ years" />
                        </div>
                    </div>
                </div>

                <div className="pt-6 border-t border-gray-50 flex justify-end">
                    <button className="px-10 py-4 bg-gray-900 text-white font-black rounded-2xl shadow-xl shadow-gray-200 hover:bg-purple-700 hover:shadow-purple-200 transition-all flex items-center gap-3 uppercase tracking-widest">
                        <Save size={20} /> Save Profile
                    </button>
                </div>
            </div>
        </div>
    );
};

export default StaffProfile;
