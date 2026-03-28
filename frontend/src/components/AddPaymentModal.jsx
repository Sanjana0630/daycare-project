import React, { useState } from 'react';

const AddPaymentModal = ({ isOpen, onClose, child, onSubmit }) => {
    const [formData, setFormData] = useState({
        amount: child ? child.pendingAmount : '',
        date: new Date().toISOString().split('T')[0],
        mode: 'Cash'
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(formData);
    };

    if (!isOpen || !child) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all scale-100 opacity-100">
                <div className="bg-gradient-to-r from-emerald-500 to-teal-600 p-6 text-white flex justify-between items-center">
                    <div>
                        <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-emerald-100">
                            Record Payment
                        </h2>
                        <p className="text-emerald-100 text-sm mt-1 opacity-90">For {child.childName}</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-white hover:bg-white/20 p-2 rounded-full transition-colors flex items-center justify-center h-10 w-10"
                        title="Close"
                    >
                        <i className="fa-solid fa-times text-lg"></i>
                    </button>
                </div>

                <div className="bg-emerald-50 px-8 py-4 border-b border-emerald-100 flex justify-between items-center">
                    <span className="text-sm font-semibold text-emerald-800">Pending Amount:</span>
                    <span className="text-lg font-bold text-emerald-700">₹{child.pendingAmount}</span>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-5">
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                            <i className="fa-solid fa-indian-rupee-sign text-emerald-500 w-4"></i>
                            Amount Paid
                        </label>
                        <input
                            type="number"
                            name="amount"
                            value={formData.amount}
                            onChange={handleChange}
                            required
                            min="1"
                            max={child.pendingAmount > 0 ? child.pendingAmount : undefined}
                            placeholder="Amount in ₹"
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all text-sm font-medium text-emerald-700"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                            <i className="fa-solid fa-calendar text-blue-500 w-4"></i>
                            Payment Date
                        </label>
                        <input
                            type="date"
                            name="date"
                            value={formData.date}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all text-sm font-medium"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                            <i className="fa-solid fa-credit-card text-purple-500 w-4"></i>
                            Payment Mode
                        </label>
                        <select
                            name="mode"
                            value={formData.mode}
                            onChange={handleChange}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all text-sm font-medium appearance-none"
                        >
                            <option value="Cash">Cash</option>
                            <option value="UPI">UPI</option>
                            <option value="Card">Card</option>
                        </select>
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
                            className="flex-1 px-4 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold rounded-xl hover:shadow-lg hover:shadow-emerald-500/30 transform hover:-translate-y-0.5 transition-all text-sm flex items-center justify-center gap-2"
                        >
                            <i className="fa-solid fa-check"></i>
                            Confirm Payment
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddPaymentModal;
