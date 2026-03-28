import React, { useState } from 'react';

const ParentPaymentModal = ({ isOpen, onClose, pendingAmount, onSubmit }) => {
    const [mode, setMode] = useState('UPI');

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit({ amount: pendingAmount, mode });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all scale-100 opacity-100">
                <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-6 text-white flex justify-between items-center">
                    <div>
                        <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-purple-100">
                            Complete Payment
                        </h2>
                        <p className="text-purple-100 text-sm mt-1 opacity-90">Securely pay your child's fee</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-white hover:bg-white/20 p-2 rounded-full transition-colors flex items-center justify-center h-10 w-10"
                        title="Close"
                    >
                        <i className="fa-solid fa-times text-lg"></i>
                    </button>
                </div>

                <div className="bg-purple-50 px-8 py-5 border-b border-purple-100 flex flex-col items-center justify-center">
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">To Pay</span>
                    <span className="text-3xl font-black text-gray-900">₹{pendingAmount}</span>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                    <div className="space-y-3">
                        <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                            <i className="fa-solid fa-credit-card text-purple-500 w-4"></i>
                            Select Payment Method
                        </label>
                        <div className="grid grid-cols-3 gap-3">
                            {['UPI', 'Card', 'Cash'].map(opt => (
                                <button
                                    key={opt}
                                    type="button"
                                    onClick={() => setMode(opt)}
                                    className={`py-3 rounded-xl border flex flex-col items-center gap-2 transition-all font-semibold text-sm
                                        ${mode === opt 
                                            ? 'border-purple-500 bg-purple-50 text-purple-700 shadow-sm' 
                                            : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'}`}
                                >
                                    {opt === 'UPI' && <i className="fa-solid fa-mobile-screen-button text-lg"></i>}
                                    {opt === 'Card' && <i className="fa-regular fa-credit-card text-lg"></i>}
                                    {opt === 'Cash' && <i className="fa-solid fa-money-bill-1-wave text-lg"></i>}
                                    {opt}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="pt-4 flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-3 bg-gray-50 text-gray-700 font-semibold rounded-xl hover:bg-gray-100 border border-gray-200 transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold rounded-xl hover:shadow-lg hover:shadow-purple-500/30 transform hover:-translate-y-0.5 transition-all text-sm flex items-center justify-center gap-2"
                        >
                            <i className="fa-solid fa-lock text-white/70"></i>
                            Pay ₹{pendingAmount}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ParentPaymentModal;
