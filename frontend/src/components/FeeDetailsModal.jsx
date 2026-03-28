import React from 'react';

const FeeDetailsModal = ({ isOpen, onClose, child }) => {
    if (!isOpen || !child) return null;

    const statusColors = {
        Paid: 'bg-emerald-100 text-emerald-700 border-emerald-200',
        Pending: 'bg-amber-100 text-amber-700 border-amber-200',
        Overdue: 'bg-red-100 text-red-700 border-red-200'
    };

    const statusColor = statusColors[child.status] || 'bg-gray-100 text-gray-700 border-gray-200';

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden transform transition-all scale-100 opacity-100">
                {/* Header */}
                <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-6 text-white flex justify-between items-center">
                    <div>
                        <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-purple-100">
                            Payment Details
                        </h2>
                        <p className="text-purple-100 text-sm mt-1 opacity-90">Comprehensive fee breakdown</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-white hover:bg-white/20 p-2 rounded-full transition-colors flex items-center justify-center h-10 w-10"
                        title="Close"
                    >
                        <i className="fa-solid fa-times text-lg"></i>
                    </button>
                </div>

                <div className="p-8 space-y-6">
                    {/* Header Strip */}
                    <div className="flex justify-between items-center border-b border-gray-100 pb-4">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center text-xl font-black shrink-0">
                                {child.childName.charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <h3 className="text-lg font-black text-gray-900">{child.childName}</h3>
                                <p className="text-sm font-semibold text-gray-500">Class: {child.class}</p>
                            </div>
                        </div>
                        <div className={`px-4 py-1.5 rounded-full text-sm font-bold border uppercase tracking-wide ${statusColor}`}>
                            {child.status}
                        </div>
                    </div>

                    {/* Section 1: Basic Info */}
                    <div className="space-y-3">
                        <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                            <i className="fa-solid fa-circle-info text-purple-400"></i> Basic Information
                        </h4>
                        <div className="bg-gray-50 p-4 rounded-2xl grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-xs text-gray-500 font-semibold mb-1">Admission Date</p>
                                <p className="text-sm font-bold text-gray-900">
                                    {child.admissionDate ? new Date(child.admissionDate).toLocaleDateString() : 'N/A'}
                                </p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 font-semibold mb-1">Monthly Base Fee</p>
                                <p className="text-sm font-bold text-gray-900">₹{child.baseFee}</p>
                            </div>
                        </div>
                    </div>

                    {/* Section 2: Dates */}
                    <div className="space-y-3">
                        <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                            <i className="fa-solid fa-calendar-days text-blue-400"></i> Important Dates
                        </h4>
                        <div className="bg-blue-50/50 p-4 rounded-2xl grid grid-cols-2 gap-4 border border-blue-50">
                            <div>
                                <p className="text-xs text-blue-500 font-semibold mb-1">Due Date</p>
                                <p className="text-sm font-bold text-gray-900">
                                    {child.dueDate ? new Date(child.dueDate).toLocaleDateString() : 'N/A'}
                                </p>
                            </div>
                            <div>
                                <p className="text-xs text-blue-500 font-semibold mb-1">Grace Period End</p>
                                <p className="text-sm font-bold text-gray-900">
                                    {child.graceEnd ? new Date(child.graceEnd).toLocaleDateString() : 'N/A'}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Section 3: Payment Info */}
                    <div className="space-y-3">
                        <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                            <i className="fa-solid fa-indian-rupee-sign text-emerald-400"></i> Payment Details
                        </h4>
                        <div className="bg-emerald-50/50 p-4 rounded-2xl border border-emerald-50 space-y-4">
                            {child.status === 'Paid' ? (
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-xs text-emerald-600 font-semibold mb-1">Payment Date</p>
                                        <p className="text-sm font-bold text-gray-900">
                                            {child.lastPaymentDate ? new Date(child.lastPaymentDate).toLocaleDateString() : 'N/A'}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-emerald-600 font-semibold mb-1">Amount Paid</p>
                                        <p className="text-sm font-bold text-emerald-600">₹{child.paidAmount}</p>
                                    </div>
                                </div>
                            ) : (
                                <div className="grid grid-cols-3 gap-4">
                                    <div>
                                        <p className="text-xs text-amber-600 font-semibold mb-1">Pending Amount</p>
                                        <p className="text-sm font-bold text-gray-900">₹{child.baseFee - child.paidAmount > 0 ? child.baseFee - child.paidAmount : child.baseFee}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-red-500 font-semibold mb-1">Late Fee (₹10/day)</p>
                                        <p className="text-sm font-bold text-red-600">₹{child.lateFee}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-purple-600 font-semibold mb-1">Total Payable</p>
                                        <p className="text-lg font-black text-purple-700">₹{child.expectedFee}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-6 py-2.5 bg-white text-gray-700 font-bold rounded-xl hover:bg-gray-100 border border-gray-200 transition-all shadow-sm"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default FeeDetailsModal;
