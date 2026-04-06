import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import jsPDF from 'jspdf';
import SetFeeStructureModal from '../components/SetFeeStructureModal';
import AddPaymentModal from '../components/AddPaymentModal';
import FeeDetailsModal from '../components/FeeDetailsModal';
import ViewFeeStructureModal from '../components/ViewFeeStructureModal';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5005';
const API_URL = `${API_BASE_URL}/api`;

const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
];

const Fees = () => {
    const [summary, setSummary] = useState({
        totalCollected: 0,
        pendingFees: 0,
        paidThisMonth: 0,
        overdueCount: 0
    });
    const [children, setChildren] = useState([]);
    const [recentPayments, setRecentPayments] = useState([]);
    const [loading, setLoading] = useState(true);

    // Filters
    const currentDate = new Date();
    const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth() + 1);
    const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());
    const [statusFilter, setStatusFilter] = useState('All');

    // Modals
    const [isFeeStructureModalOpen, setFeeStructureModalOpen] = useState(false);
    const [isViewStructureModalOpen, setViewStructureModalOpen] = useState(false);
    const [isPaymentModalOpen, setPaymentModalOpen] = useState(false);
    const [isDetailsModalOpen, setDetailsModalOpen] = useState(false);
    const [selectedChild, setSelectedChild] = useState(null);

    const fetchFeesData = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const res = await axios.get(`${API_URL}/fees/dashboard`, {
                headers: { Authorization: `Bearer ${token}` },
                params: { month: selectedMonth, year: selectedYear }
            });

            if (res.data.success) {
                setSummary(res.data.summary);
                setChildren(res.data.children);
                setRecentPayments(res.data.recentPayments || []);
            }
        } catch (error) {
             toast.error(error.response?.data?.message || 'Failed to fetch fees data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFeesData();
    }, [selectedMonth, selectedYear]);

    const handleSetFeeStructure = async (formData) => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.post(`${API_URL}/fees/structure`, formData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.data.success) {
                toast.success('Fee structure updated successfully!');
                setFeeStructureModalOpen(false);
                fetchFeesData();
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to update fee structure');
        }
    };

    const handleRecordPayment = async (formData) => {
         try {
            const token = localStorage.getItem('token');
            const payload = {
                ...formData,
                childId: selectedChild._id,
                month: selectedMonth,
                year: selectedYear
            };
            const res = await axios.post(`${API_URL}/fees/payment`, payload, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.data.success) {
                toast.success('Payment recorded successfully!');
                setPaymentModalOpen(false);
                fetchFeesData();
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to record payment');
        }
    };

    const handleSendReminder = async (childId) => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.post(`${API_URL}/fees/remind`, {
                childId,
                month: selectedMonth,
                year: selectedYear
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.data.success) {
                toast.success('Reminder sent successfully!');
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to send reminder');
        }
    };

    const generateReceipt = (payment, action = 'download') => {
        const doc = new jsPDF();
        const pageWidth = doc.internal.pageSize.getWidth();
        const monthName = monthNames[payment.month - 1];

        // --- Header Section ---
        doc.setFillColor(124, 58, 237); // Purple theme (#7c3aec)
        doc.rect(0, 0, pageWidth, 40, 'F');
        
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(24);
        doc.setFont("helvetica", "bold");
        doc.text("TinyTots Daycare", pageWidth / 2, 20, { align: "center" });
        
        doc.setFontSize(12);
        doc.setFont("helvetica", "normal");
        doc.text("FEE PAYMENT RECEIPT", pageWidth / 2, 30, { align: "center" });

        // --- Receipt Info Row ---
        doc.setTextColor(50, 50, 50);
        doc.setFontSize(10);
        doc.text(`Receipt No: RCT-${payment._id.substring(0, 6).toUpperCase()}`, 20, 55);
        doc.text(`Date: ${new Date(payment.date).toLocaleDateString()}`, pageWidth - 20, 55, { align: "right" });
        
        doc.setDrawColor(200, 200, 200);
        doc.line(20, 60, pageWidth - 20, 60);

        // --- Section 1: Child Info ---
        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.text("CHILD INFORMATION", 20, 75);
        
        doc.setFont("helvetica", "normal");
        doc.setFontSize(11);
        doc.text(`Child Name: ${payment.child?.childName || 'N/A'}`, 25, 85);
        doc.text(`Parent Name: ${payment.child?.parentName || 'Authorized Parent'}`, 25, 93);
        doc.text(`Class: ${payment.child?.class || 'N/A'}`, 25, 101);

        // --- Section 2: Month Info ---
        doc.setFont("helvetica", "bold");
        doc.setFontSize(14);
        doc.text(`FEE FOR MONTH: ${monthName} ${payment.year}`, pageWidth / 2, 120, { align: "center" });

        // --- Section 3: Payment Details ---
        doc.setDrawColor(230, 230, 230);
        doc.roundedRect(20, 130, pageWidth - 40, 65, 3, 3, 'S'); // Card layout
        
        doc.setFontSize(12);
        doc.text("PAYMENT SUMMARY", 30, 145);
        
        doc.setFont("helvetica", "normal");
        doc.text("Amount Paid:", 35, 160);
        doc.setTextColor(34, 197, 94); // Emerald/Green
        doc.setFont("helvetica", "bold");
        doc.setFontSize(18);
        doc.text(`Rs. ${payment.amount}`, pageWidth - 35, 160, { align: "right" });
        
        doc.setTextColor(50, 50, 50);
        doc.setFontSize(11);
        doc.setFont("helvetica", "normal");
        doc.text("Payment Mode:", 35, 175);
        doc.text(payment.mode, pageWidth - 35, 175, { align: "right" });
        
        doc.text("Status:", 35, 187);
        doc.setTextColor(34, 197, 94);
        doc.setFont("helvetica", "bold");
        doc.text("PAID ✅", pageWidth - 35, 187, { align: "right" });

        // --- Footer ---
        doc.setTextColor(150, 150, 150);
        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        doc.line(20, 260, pageWidth - 20, 260);
        
        doc.setTextColor(124, 58, 237);
        doc.setFontSize(14);
        doc.text("Thank you for your payment 💜", pageWidth / 2, 275, { align: "center" });
        
        doc.setFontSize(9);
        doc.setTextColor(180, 180, 180);
        doc.text("This is a system-generated receipt and requires no signature.", pageWidth / 2, 285, { align: "center" });

        if (action === 'view') {
            window.open(doc.output('bloburl'), '_blank');
        } else {
            doc.save(`Receipt_${payment.child?.childName || 'Child'}_${monthName}_${payment.year}.pdf`);
        }
    };

    const processedChildren = children.map(child => {
        // 1. GET SELECTED MONTH & YEAR
        const month0Indexed = selectedMonth - 1;

        // 2. GET CURRENT DATE
        const today = new Date();
        const currentMonth = today.getMonth();
        const currentYear = today.getFullYear();

        // 3. CHECK FUTURE MONTH
        const isFutureMonth = selectedYear > currentYear || (selectedYear === currentYear && month0Indexed > currentMonth);

        if (isFutureMonth) {
            return {
                ...child,
                expectedFee: 0,
                paidAmount: 0,
                pendingAmount: 0,
                lateFee: 0,
                status: "UPCOMING",
                dueDate: null
            };
        }

        return child; // normal data
    });

    const filteredChildren = processedChildren.filter(child => {
        // 1. GET SELECTED MONTH & YEAR
        const month0Indexed = selectedMonth - 1;

        // 2. GET CHILD ADMISSION DATE
        const admissionDate = new Date(child.admissionDate);
        const admissionMonth = admissionDate.getMonth();
        const admissionYear = admissionDate.getFullYear();

        // 3. VALIDATION LOGIC (Allowing future months)
        const isAfterAdmission = (selectedYear > admissionYear) || (selectedYear === admissionYear && month0Indexed >= admissionMonth);

        // Show child ONLY if they were admitted on or before the selected month
        if (!isAfterAdmission) return false;

        // 4. APPLY STATUS FILTER (Existing logic)
        if (statusFilter === 'All') return true;
        return child.status === statusFilter;
    });

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
            {/* Header Section */}
             <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight">Fee Management</h1>
                    <p className="text-gray-500 font-medium mt-1">Track and manage student fee records</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setViewStructureModalOpen(true)}
                        className="px-5 py-2.5 bg-gray-200 text-black text-sm font-bold rounded-xl hover:bg-gray-300 transition-all flex items-center gap-2"
                    >
                        <i className="fa-solid fa-eye"></i>
                        View Fee Structure
                    </button>
                    <button
                        onClick={() => setFeeStructureModalOpen(true)}
                        className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-sm font-bold rounded-xl shadow-lg shadow-purple-200 hover:shadow-purple-300 transform hover:-translate-y-0.5 transition-all flex items-center gap-2"
                    >
                        <i className="fa-solid fa-gear"></i>
                        Set Monthly Fees
                    </button>
                </div>
            </div>

            {/* Top Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                 {/* Card 1: Total Collected */}
                 <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-50 rounded-full translate-x-8 -translate-y-8 transition-transform group-hover:scale-110"></div>
                    <div className="relative">
                        <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center text-xl mb-4 shadow-inner">
                            <i className="fa-solid fa-wallet"></i>
                        </div>
                        <p className="text-sm font-semibold text-gray-500 mb-1">Total Collected</p>
                        <h3 className="text-2xl font-black text-gray-900">₹{(selectedYear > currentDate.getFullYear() || (selectedYear === currentDate.getFullYear() && selectedMonth > currentDate.getMonth() + 1)) ? 0 : summary.totalCollected.toLocaleString()}</h3>
                    </div>
                 </div>

                 {/* Card 2: Pending Fees */}
                 <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-amber-50 rounded-full translate-x-8 -translate-y-8 transition-transform group-hover:scale-110"></div>
                    <div className="relative">
                        <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-xl flex items-center justify-center text-xl mb-4 shadow-inner">
                            <i className="fa-solid fa-clock"></i>
                        </div>
                        <p className="text-sm font-semibold text-gray-500 mb-1">Pending Fees</p>
                        <h3 className="text-2xl font-black text-gray-900">₹{(selectedYear > currentDate.getFullYear() || (selectedYear === currentDate.getFullYear() && selectedMonth > currentDate.getMonth() + 1)) ? 0 : summary.pendingFees.toLocaleString()}</h3>
                    </div>
                 </div>

                 {/* Card 3: Paid This Month */}
                 <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50 rounded-full translate-x-8 -translate-y-8 transition-transform group-hover:scale-110"></div>
                    <div className="relative">
                        <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center text-xl mb-4 shadow-inner">
                            <i className="fa-solid fa-calendar-check"></i>
                        </div>
                        <p className="text-sm font-semibold text-gray-500 mb-1">Paid This Month</p>
                        <h3 className="text-2xl font-black text-gray-900">₹{(selectedYear > currentDate.getFullYear() || (selectedYear === currentDate.getFullYear() && selectedMonth > currentDate.getMonth() + 1)) ? 0 : summary.paidThisMonth.toLocaleString()}</h3>
                    </div>
                 </div>

                 {/* Card 4: Overdue Count */}
                 <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-red-50 rounded-full translate-x-8 -translate-y-8 transition-transform group-hover:scale-110"></div>
                    <div className="relative">
                        <div className="w-12 h-12 bg-red-100 text-red-600 rounded-xl flex items-center justify-center text-xl mb-4 shadow-inner">
                            <i className="fa-solid fa-circle-exclamation"></i>
                        </div>
                        <p className="text-sm font-semibold text-gray-500 mb-1">Overdue Payments</p>
                        <h3 className="text-2xl font-black text-gray-900">{(selectedYear > currentDate.getFullYear() || (selectedYear === currentDate.getFullYear() && selectedMonth > currentDate.getMonth() + 1)) ? 0 : summary.overdueCount}</h3>
                    </div>
                 </div>
            </div>

            {/* Main Content Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Side: Child Fees List */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Filters Row */}
                    <div className="flex flex-col sm:flex-row justify-between items-center bg-white p-4 rounded-2xl shadow-sm border border-gray-100 gap-4">
                        <div className="flex items-center gap-3 w-full sm:w-auto">
                            <div className="relative flex-1 sm:w-40">
                                <i className="fa-solid fa-calendar-days text-gray-400 absolute left-4 top-1/2 -translate-y-1/2"></i>
                                <select 
                                    value={selectedMonth}
                                    onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 font-medium appearance-none"
                                >
                                    {Array.from({ length: 12 }, (_, i) => (
                                        <option key={i+1} value={i+1}>{new Date(0, i).toLocaleString('default', { month: 'long' })}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="relative flex-1 sm:w-32">
                                <select 
                                    value={selectedYear}
                                    onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 font-medium appearance-none"
                                >
                                    {[currentDate.getFullYear() - 1, currentDate.getFullYear(), currentDate.getFullYear() + 1].map(y => (
                                        <option key={y} value={y}>{y}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="flex gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0 hide-scrollbar">
                           <button onClick={() => setStatusFilter('All')} className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-colors ${statusFilter === 'All' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>All</button>
                           <button onClick={() => setStatusFilter('Paid')} className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-colors ${statusFilter === 'Paid' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>Paid</button>
                           <button onClick={() => setStatusFilter('Pending')} className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-colors ${statusFilter === 'Pending' ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>Pending</button>
                           <button onClick={() => setStatusFilter('Overdue')} className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-colors ${statusFilter === 'Overdue' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>Overdue</button>
                        </div>
                    </div>

                    {/* Children List */}
                    {loading ? (
                        <div className="space-y-4">
                            {[1,2,3].map(n => <div key={n} className="h-28 bg-gray-100 rounded-2xl animate-pulse"></div>)}
                        </div>
                    ) : filteredChildren.length === 0 ? (
                        <div className="bg-white rounded-3xl p-12 text-center border border-gray-100 shadow-sm flex flex-col items-center">
                            <div className="w-20 h-20 bg-purple-50 text-purple-300 rounded-full flex items-center justify-center text-3xl mb-4">
                                <i className="fa-solid fa-folder-open"></i>
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">No Fee Records Found</h3>
                            <p className="text-gray-500">Start by setting fee structure or selecting a different month.</p>
                            <button
                                onClick={() => setFeeStructureModalOpen(true)}
                                className="mt-6 px-6 py-2.5 bg-purple-600 text-white font-bold rounded-xl shadow-md hover:bg-purple-700 transition"
                            >
                                Set Monthly Fees
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {filteredChildren.map(child => (
                                <div key={child._id} className="flex items-center justify-between bg-white p-4 rounded-xl shadow-sm hover:shadow-md transition border border-gray-50">
                                    {/* LEFT: Profile, Name, Class/Parent */}
                                    <div className="flex items-center gap-3 min-w-[200px]">
                                        <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white shadow-sm flex-shrink-0 bg-gray-100">
                                            {child.photo ? (
                                                <img src={`${API_URL.replace('/api', '')}${child.photo}`} alt={child.childName} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-lg text-gray-400 font-bold bg-gradient-to-br from-gray-50 to-gray-200">
                                                    {child.childName.charAt(0)}
                                                </div>
                                            )}
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-800 leading-tight">{child.childName}</p>
                                            <p className="text-sm text-gray-500 font-medium">
                                                {child.class} <span className="text-gray-300 mx-1">•</span> {child.parentName}
                                            </p>
                                        </div>
                                    </div>

                                    {/* CENTER: Due Date */}
                                    <div className="hidden md:block text-center flex-1 text-gray-600">
                                        <p className="text-sm font-medium whitespace-nowrap">
                                            Due: <span className="font-bold text-gray-900 ml-1">
                                                {child.dueDate ? new Date(child.dueDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : (child.status === 'UPCOMING' ? 'Not Generated' : 'N/A')}
                                            </span>
                                        </p>
                                    </div>

                                    {/* RIGHT: Amount, Status, View Details */}
                                    <div className="flex items-center gap-6">
                                        <div className="text-right">
                                            <p className="text-lg font-black text-gray-900 leading-none">₹{child.expectedFee.toLocaleString()}</p>
                                        </div>

                                        <span className={`px-3 py-1 text-[10px] font-black rounded-full uppercase tracking-widest border
                                            ${child.status === 'Paid' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 
                                              child.status === 'Pending' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                                              child.status === 'UPCOMING' ? 'bg-gray-50 text-gray-400 border-gray-100' :
                                              'bg-red-50 text-red-600 border-red-100'}
                                        `}>
                                            {child.status}
                                        </span>

                                        <button 
                                            disabled={child.status === 'UPCOMING'}
                                            onClick={() => { setSelectedChild(child); setDetailsModalOpen(true); }}
                                            className={`px-4 py-1.5 text-xs font-bold rounded-lg border whitespace-nowrap transition-colors
                                                ${child.status === 'UPCOMING' 
                                                    ? 'bg-gray-50 text-gray-400 border-gray-200 cursor-not-allowed opacity-50' 
                                                    : 'bg-white border-purple-500 text-purple-600 hover:bg-purple-50'}`}
                                        >
                                            View Details
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Right Side: Recent Payments Details */}
                <div className="space-y-6">
                    <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
                        <h2 className="text-lg font-black text-gray-900 mb-4 flex items-center gap-2">
                            <i className="fa-solid fa-clock-rotate-left text-purple-500"></i>
                            Recent Payments
                        </h2>
                        
                        <div className="space-y-4">
                            {recentPayments.length === 0 ? (
                                <p className="text-sm text-gray-500 text-center py-4">No recent payments found.</p>
                            ) : (
                                recentPayments.map(payment => (
                                    <div key={payment._id} className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors group border border-transparent hover:border-gray-100">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                                                <i className="fa-solid fa-indian-rupee-sign"></i>
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-gray-900">{payment.child?.childName || 'Unknown Child'}</p>
                                                <p className="text-xs text-gray-500">{new Date(payment.date).toLocaleDateString()} • {payment.mode}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-black text-emerald-600">+₹{payment.amount}</p>
                                            <div className="flex items-center gap-2 justify-end opacity-0 group-hover:opacity-100 transition-opacity mt-1">
                                                <button 
                                                    onClick={() => generateReceipt(payment, 'view')}
                                                    className="text-[10px] font-bold text-purple-600 hover:text-purple-800 flex items-center gap-1"
                                                    title="View Receipt"
                                                >
                                                    <i className="fa-solid fa-eye"></i> View
                                                </button>
                                                <span className="text-gray-300 text-[10px]">|</span>
                                                <button 
                                                    onClick={() => generateReceipt(payment, 'download')}
                                                    className="text-[10px] font-bold text-blue-500 hover:text-blue-700 flex items-center gap-1"
                                                    title="Download Receipt"
                                                >
                                                    <i className="fa-solid fa-download"></i> Download
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Modals */}
            <SetFeeStructureModal
                isOpen={isFeeStructureModalOpen}
                onClose={() => setFeeStructureModalOpen(false)}
                onSubmit={handleSetFeeStructure}
            />

            <ViewFeeStructureModal
                isOpen={isViewStructureModalOpen}
                onClose={() => setViewStructureModalOpen(false)}
                month={selectedMonth}
                year={selectedYear}
            />
            
            <AddPaymentModal
                isOpen={isPaymentModalOpen}
                onClose={() => setPaymentModalOpen(false)}
                child={selectedChild}
                onSubmit={handleRecordPayment}
            />

            <FeeDetailsModal
                isOpen={isDetailsModalOpen}
                onClose={() => setDetailsModalOpen(false)}
                child={selectedChild}
            />
        </div>
    );
};

export default Fees;
