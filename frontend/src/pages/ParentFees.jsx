import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import jsPDF from 'jspdf';
import ParentPaymentModal from '../components/ParentPaymentModal';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5005';
const API_URL = `${API_BASE_URL}/api`;

const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
];

const ParentFees = () => {
    const today = new Date();
    const [feeData, setFeeData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isPaymentModalOpen, setPaymentModalOpen] = useState(false);
    
    const [selectedMonth, setSelectedMonth] = useState(today.getMonth() + 1);
    const [selectedYear, setSelectedYear] = useState(today.getFullYear());

    const fetchFeeStatus = async (month = selectedMonth, year = selectedYear) => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const res = await axios.get(`${API_URL}/parent/fees/status?month=${month}&year=${year}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (res.data.success) {
                setFeeData(res.data.data);
            }
        } catch (error) {
             toast.error(error.response?.data?.message || 'Failed to fetch fee data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFeeStatus(selectedMonth, selectedYear);
    }, [selectedMonth, selectedYear]);

    const handleRecordPayment = async ({ amount, mode }) => {
         try {
            const token = localStorage.getItem('token');
            const payload = { 
                amount, 
                mode,
                month: selectedMonth,
                year: selectedYear
            };
            const res = await axios.post(`${API_URL}/parent/fees/pay`, payload, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.data.success) {
                toast.success('Payment recorded successfully!');
                setPaymentModalOpen(false);
                fetchFeeStatus();
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to record payment');
        }
    };

    const generateReceipt = (payment) => {
        const doc = new jsPDF();
        
        doc.setFontSize(22);
        doc.text("Fee Receipt", 105, 20, null, null, "center");

        doc.setFontSize(14);
        doc.text("Daycare Management System", 105, 30, null, null, "center");
        
        doc.setFontSize(12);
        doc.text(`Receipt No: RCT-${payment._id.substring(0, 6).toUpperCase()}`, 20, 50);
        doc.text(`Date: ${new Date(payment.date).toLocaleDateString()}`, 150, 50);
        
        doc.line(20, 55, 190, 55);

        doc.text(`Child Name: ${feeData.childName}`, 20, 65);
        doc.text(`Amount Paid: Rs. ${payment.amount}`, 20, 75);
        doc.text(`Payment Mode: ${payment.mode}`, 20, 85);
        doc.text(`For Month: ${payment.month}/${payment.year}`, 20, 95);

        doc.line(20, 105, 190, 105);

        doc.setFontSize(10);
        doc.text("Thank you for your payment!", 105, 115, null, null, "center");

        doc.save(`Receipt_${feeData.childName}_${payment.month}_${payment.year}.pdf`);
    };

    const generateProgressBar = (paid, total) => {
        if (total === 0) return { bar: "[██████████] 100%", percentage: 100 };
        const percentage = Math.min(100, Math.round((paid / total) * 100));
        const filledBlocks = Math.round((percentage / 100) * 10);
        const emptyBlocks = 10 - filledBlocks;
        const bar = `[${'█'.repeat(filledBlocks)}${'░'.repeat(emptyBlocks)}] ${percentage}% Paid`;
        return { bar, percentage };
    };

    if (loading) {
         return (
            <div className="p-8 max-w-4xl mx-auto space-y-6">
                <div className="h-40 bg-gray-100 rounded-2xl animate-pulse"></div>
                <div className="h-64 bg-gray-100 rounded-2xl animate-pulse"></div>
            </div>
        );
    }

    if (!feeData) {
        return (
            <div className="p-8 max-w-4xl mx-auto text-center mt-20">
                <div className="w-20 h-20 bg-gray-50 text-gray-300 rounded-full flex items-center justify-center text-3xl mx-auto mb-4">
                    <i className="fa-solid fa-folder-open"></i>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">No Fee Records Found</h3>
                <p className="text-gray-500">There are currently no active fee records assigned to your child.</p>
            </div>
        );
    }

    const { childName, month, year, expectedFee, baseFee, lateFee, dueDate, paidAmount, pendingAmount, status, recentPayments } = feeData;
    const progress = generateProgressBar(paidAmount, expectedFee);
    const monthName = new Date(year, month - 1).toLocaleString('default', { month: 'long' });

    return (
        <div className="p-6 md:p-8 max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
            {/* Header Section */}
             <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight">Fee Portal</h1>
                    <p className="text-gray-500 font-medium mt-1">Manage and track your child's fees securely</p>
                </div>

                <div className="flex items-center gap-2 bg-gray-50 p-1.5 rounded-xl border border-gray-100 shadow-sm">
                    <select 
                        value={selectedMonth}
                        onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                        className="bg-white border-none text-sm font-bold text-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500/20 py-1.5 pl-3 pr-8 cursor-pointer"
                    >
                        {monthNames.map((name, index) => (
                            <option key={index + 1} value={index + 1}>{name}</option>
                        ))}
                    </select>
                    <select 
                        value={selectedYear}
                        onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                        className="bg-white border-none text-sm font-bold text-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500/20 py-1.5 pl-3 pr-8 cursor-pointer"
                    >
                        {[today.getFullYear() - 1, today.getFullYear(), today.getFullYear() + 1].map(y => (
                            <option key={y} value={y}>{y}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Main Current Fee Card */}
            <div className="bg-white rounded-2xl p-6 md:p-8 border border-purple-100 shadow-lg shadow-purple-500/5 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-purple-50 rounded-full translate-x-32 -translate-y-32 transition-transform group-hover:scale-110 pointer-events-none"></div>
                
                <div className="relative flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <h2 className="text-2xl font-black text-gray-900">{childName}'s Fee</h2>
                            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider
                                ${status === 'Paid' ? 'bg-emerald-100 text-emerald-700' : 
                                  status === 'Pending' ? 'bg-amber-100 text-amber-700' :
                                  'bg-red-100 text-red-700'}
                            `}>
                                {status}
                            </span>
                        </div>
                        <p className="text-sm font-semibold text-gray-500 mb-6 flex items-center gap-2">
                            <i className="fa-regular fa-calendar text-purple-400"></i>
                            {monthName} {year}
                        </p>

                        <div className="flex flex-wrap gap-8 mb-6">
                            <div>
                                <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Base Fee</p>
                                <p className="text-xl font-black text-gray-800">₹{baseFee}</p>
                            </div>
                            {lateFee > 0 && (
                                <div>
                                    <p className="text-xs text-red-400 font-bold uppercase tracking-wider mb-1">Late Fee</p>
                                    <p className="text-xl font-black text-red-600">₹{lateFee}</p>
                                </div>
                            )}
                            <div>
                                <p className="text-xs text-emerald-400 font-bold uppercase tracking-wider mb-1">Paid</p>
                                <p className="text-xl font-black text-emerald-600">₹{paidAmount}</p>
                            </div>
                            {pendingAmount > 0 && (
                                <div>
                                    <p className="text-xs text-amber-400 font-bold uppercase tracking-wider mb-1">Pending Total</p>
                                    <p className="text-xl font-black text-amber-600">₹{pendingAmount}</p>
                                </div>
                            )}
                        </div>

                         <div className="font-mono text-sm tracking-widest text-purple-600 bg-purple-50 px-4 py-2 rounded-xl inline-block border border-purple-100">
                             {progress.bar}
                        </div>
                    </div>

                    <div className="flex flex-col items-start md:items-end gap-3 w-full md:w-auto">
                        {status === 'Pending' || status === 'Overdue' ? (
                            <>
                                <button
                                    onClick={() => setPaymentModalOpen(true)}
                                    className="w-full md:w-auto px-8 py-3.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold rounded-xl shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 hover:-translate-y-0.5 transition-all text-sm flex items-center justify-center gap-2"
                                >
                                    <i className="fa-solid fa-bolt"></i>
                                    Pay Now
                                </button>
                                <div className="text-xs font-semibold text-amber-600 bg-amber-50 px-3 py-1.5 rounded-lg flex items-center gap-2 w-full md:w-auto justify-center md:justify-start">
                                    <i className="fa-solid fa-triangle-exclamation"></i>
                                    Due on {dueDate ? new Date(dueDate).toLocaleDateString() : 'the 5th'}
                                </div>
                                <p className="text-sm text-red-500 mt-2 font-medium animate-pulse">
                                    ⚠️ Your {monthNames[selectedMonth - 1]} fees is pending
                                </p>
                            </>
                        ) : (
                             <div className="flex flex-col items-center md:items-end gap-2">
                                <div className="flex items-center gap-2 text-emerald-600 font-bold bg-emerald-50 px-6 py-3 rounded-xl border border-emerald-100">
                                    <i className="fa-solid fa-circle-check text-xl"></i>
                                    Fully Paid
                                </div>
                                <p className="text-sm text-green-500 mt-1 font-medium">
                                    ✅ Your {monthNames[selectedMonth - 1]} fees is paid
                                </p>
                             </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Recent Payments Section */}
            <div className="bg-white rounded-2xl p-6 md:p-8 border border-gray-100 shadow-sm">
                <h3 className="text-lg font-black text-gray-900 mb-6 flex items-center gap-2">
                    <i className="fa-solid fa-clock-rotate-left text-purple-500"></i>
                    Recent Payments
                </h3>

                {recentPayments && recentPayments.length > 0 ? (
                    <div className="space-y-3">
                        {recentPayments.map((payment) => (
                            <div key={payment._id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors gap-4">
                                <div className="flex items-center gap-4">
                                     <div className="w-10 h-10 bg-white rounded-full shadow-sm flex items-center justify-center text-emerald-500 text-lg">
                                        <i className="fa-solid fa-check"></i>
                                     </div>
                                     <div>
                                         <p className="text-sm font-bold text-gray-900">₹{payment.amount} Paid via {payment.mode}</p>
                                         <p className="text-xs text-gray-500 font-medium">Recorded on {new Date(payment.date).toLocaleDateString()}</p>
                                     </div>
                                </div>
                                <button
                                    onClick={() => generateReceipt(payment)}
                                    className="w-full sm:w-auto px-4 py-2 bg-white text-gray-700 text-xs font-bold rounded-lg border border-gray-200 hover:border-purple-300 hover:text-purple-600 transition-colors shadow-sm flex items-center justify-center gap-2"
                                >
                                    <i className="fa-solid fa-download"></i> Receipt
                                </button>
                            </div>
                        ))}
                    </div>
                ) : (
                     <div className="text-center py-8">
                        <i className="fa-solid fa-receipt text-3xl text-gray-300 mb-3"></i>
                        <p className="text-sm font-medium text-gray-500">No recent payment history found.</p>
                     </div>
                )}
            </div>

            {/* Payment Modal */}
            <ParentPaymentModal
                isOpen={isPaymentModalOpen}
                onClose={() => setPaymentModalOpen(false)}
                pendingAmount={pendingAmount}
                onSubmit={handleRecordPayment}
            />

        </div>
    );
};

export default ParentFees;
