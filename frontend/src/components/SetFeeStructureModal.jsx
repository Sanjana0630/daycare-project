import React, { useState } from 'react';

const SetFeeStructureModal = ({ isOpen, onClose, onSubmit }) => {
    const [formData, setFormData] = useState({
        class: '',
        monthlyFee: '',
        extraCharges: ''
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(formData);
        setFormData({ class: '', monthlyFee: '', extraCharges: '' });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all scale-100 opacity-100">
                <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-6 text-white flex justify-between items-center">
                    <div>
                        <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-purple-100">
                            Set Monthly Fees
                        </h2>
                        <p className="text-purple-100 text-sm mt-1 opacity-90">Manage fee structure for classes</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-white hover:bg-white/20 p-2 rounded-full transition-colors flex items-center justify-center h-10 w-10"
                        title="Close"
                    >
                        <i className="fa-solid fa-times text-lg"></i>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-5">
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                            <i className="fa-solid fa-chalkboard-user text-purple-500 w-4"></i>
                            Class / Age Group
                        </label>
                        <input
                            type="text"
                            name="class"
                            value={formData.class}
                            onChange={handleChange}
                            required
                            placeholder="e.g. Toddler, LKG, Nursery"
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all text-sm font-medium"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                            <i className="fa-solid fa-indian-rupee-sign text-emerald-500 w-4"></i>
                            Monthly Fee Amount
                        </label>
                        <input
                            type="number"
                            name="monthlyFee"
                            value={formData.monthlyFee}
                            onChange={handleChange}
                            required
                            min="0"
                            placeholder="Amount in ₹"
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all text-sm font-medium"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                            <i className="fa-solid fa-plus text-amber-500 w-4"></i>
                            Extra Charges (Optional)
                        </label>
                        <input
                            type="number"
                            name="extraCharges"
                            value={formData.extraCharges}
                            onChange={handleChange}
                            min="0"
                            placeholder="Amount in ₹"
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all text-sm font-medium"
                        />
                    </div>

                    <div className="pt-6 flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-3 bg-gray-50 text-gray-700 font-semibold rounded-xl hover:bg-gray-100 border border-gray-200 transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold rounded-xl hover:shadow-lg hover:shadow-purple-500/30 transform hover:-translate-y-0.5 transition-all text-sm"
                        >
                            Save Structure
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default SetFeeStructureModal;
