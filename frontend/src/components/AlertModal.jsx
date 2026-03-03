import React from 'react';
import { X, AlertCircle } from 'lucide-react';

const AlertModal = ({ isOpen, onClose, message, title = "Verification Required" }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-in fade-in duration-300">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-white/40 backdrop-blur-md transition-opacity"
                onClick={onClose}
            ></div>

            {/* Modal */}
            <div className="relative bg-white w-full max-w-sm rounded-[2.5rem] shadow-2xl shadow-purple-100 border border-purple-50 overflow-hidden transform animate-in zoom-in-95 duration-300">
                {/* Decorative top bar */}
                <div className="h-2 bg-gradient-to-r from-accent-peach via-primary-light to-accent-sky"></div>

                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-6 right-6 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-full transition-all"
                >
                    <X size={20} />
                </button>

                <div className="p-8 pt-10 flex flex-col items-center text-center">
                    {/* Icon Container */}
                    <div className="w-16 h-16 bg-accent-peach/30 rounded-3xl flex items-center justify-center mb-6 text-danger shadow-inner">
                        <AlertCircle size={32} strokeWidth={2.5} />
                    </div>

                    {/* Content */}
                    <h3 className="text-xl font-black text-gray-900 mb-2 uppercase tracking-tight">
                        {title}
                    </h3>
                    <p className="text-gray-500 font-bold mb-8 px-2 leading-relaxed">
                        {message}
                    </p>

                    {/* OK Button */}
                    <button
                        onClick={onClose}
                        className="w-full py-4 bg-gray-900 text-white font-black rounded-2xl shadow-xl shadow-gray-200 hover:bg-primary hover:shadow-primary-light transition-all uppercase tracking-widest text-sm"
                    >
                        Understood
                    </button>
                </div>

                {/* Bottom decorative element */}
                <div className="h-1 bg-gray-50"></div>
            </div>
        </div>
    );
};

export default AlertModal;
