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

    const baseMonthlyData = processedChildren.filter(child => {
        const month0Indexed = selectedMonth - 1;
        const admissionDate = new Date(child.admissionDate);
        const admissionMonth = admissionDate.getMonth();
        const admissionYear = admissionDate.getFullYear();
        return (selectedYear > admissionYear) || (selectedYear === admissionYear && month0Indexed >= admissionMonth);
    });

    const derivedSummary = {
        totalCollected: baseMonthlyData.reduce((sum, c) => sum + (c.paidAmount || 0), 0),
        pendingFees: baseMonthlyData.reduce((sum, c) => sum + (c.pendingAmount || 0), 0),
        paidThisMonth: baseMonthlyData.reduce((sum, c) => sum + (c.paidAmount || 0), 0),
        overdueCount: baseMonthlyData.filter(c => c.status === 'Overdue').length
    };

    const filteredChildren = baseMonthlyData.filter(child => {
        if (statusFilter === 'All') return true;
        return child.status === statusFilter;
    });

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
            {/* Header Section */}
             <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 className="text-4xl font-black text-gray-900 tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-gray-900 via-gray-800 to-gray-600">
                        Fee Management
                    </h1>
                    <p className="text-gray-500 font-medium mt-2 flex items-center gap-2">
                        <span className="w-8 h-px bg-purple-200"></span>
                        Track and manage student fee records
                    </p>
                </div>
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => setViewStructureModalOpen(true)}
                        className="px-6 py-3 bg-white text-gray-700 text-sm font-bold rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:bg-gray-50 transition-all flex items-center gap-3 group"
                    >
                        <i className="fa-solid fa-eye text-purple-500 group-hover:scale-110 transition-transform"></i>
                        View Fee Structure
                    </button>
                    <button
                        onClick={() => setFeeStructureModalOpen(true)}
                        className="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-sm font-bold rounded-2xl shadow-xl shadow-purple-200 hover:shadow-purple-300 hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-3"
                    >
                        <i className="fa-solid fa-gear animate-spin-slow"></i>
                        Set Monthly Fees
                    </button>
                </div>
            </div>

            {/* Top Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                 {/* Card 1: Total Collected */}
                 <div className="bg-white rounded-[2rem] p-7 border border-gray-100 shadow-sm relative overflow-hidden group hover:shadow-xl hover:shadow-purple-500/5 transition-all duration-500">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50/50 rounded-full translate-x-12 -translate-y-12 transition-transform duration-700 group-hover:scale-125"></div>
                    <div className="relative">
                        <div className="w-14 h-14 bg-gradient-to-br from-emerald-50 to-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center text-2xl mb-5 shadow-sm group-hover:rotate-12 transition-transform">
                            <i className="fa-solid fa-wallet"></i>
                        </div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Total Collected</p>
                        <h3 className="text-3xl font-black text-gray-900">₹{derivedSummary.totalCollected.toLocaleString()}</h3>
                        <div className="mt-4 flex items-center gap-2">
                            <span className="flex h-2 w-2 rounded-full bg-emerald-500"></span>
                            <span className="text-[10px] font-bold text-emerald-600 uppercase">Live Update</span>
                        </div>
                    </div>
                 </div>

                 {/* Card 2: Pending Fees */}
                 <div className="bg-white rounded-[2rem] p-7 border border-gray-100 shadow-sm relative overflow-hidden group hover:shadow-xl hover:shadow-amber-500/5 transition-all duration-500">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-amber-50/50 rounded-full translate-x-12 -translate-y-12 transition-transform duration-700 group-hover:scale-125"></div>
                    <div className="relative">
                        <div className="w-14 h-14 bg-gradient-to-br from-amber-50 to-amber-100 text-amber-600 rounded-2xl flex items-center justify-center text-2xl mb-5 shadow-sm group-hover:-rotate-12 transition-transform">
                            <i className="fa-solid fa-clock-rotate-left"></i>
                        </div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Pending Fees</p>
                        <h3 className="text-3xl font-black text-gray-900">₹{derivedSummary.pendingFees.toLocaleString()}</h3>
                        <div className="mt-4 flex items-center gap-2">
                            <span className="flex h-2 w-2 rounded-full bg-amber-500 animate-pulse"></span>
                            <span className="text-[10px] font-bold text-amber-600 uppercase">Action Required</span>
                        </div>
                    </div>
                 </div>

                 {/* Card 3: Paid This Month */}
                 <div className="bg-white rounded-[2rem] p-7 border border-gray-100 shadow-sm relative overflow-hidden group hover:shadow-xl hover:shadow-blue-500/5 transition-all duration-500">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50/50 rounded-full translate-x-12 -translate-y-12 transition-transform duration-700 group-hover:scale-125"></div>
                    <div className="relative">
                        <div className="w-14 h-14 bg-gradient-to-br from-blue-50 to-blue-100 text-blue-600 rounded-2xl flex items-center justify-center text-2xl mb-5 shadow-sm group-hover:scale-110 transition-transform">
                            <i className="fa-solid fa-calendar-check"></i>
                        </div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Paid This Month</p>
                        <h3 className="text-3xl font-black text-gray-900">₹{derivedSummary.paidThisMonth.toLocaleString()}</h3>
                        <div className="mt-4 flex items-center gap-2">
                            <span className="flex h-2 w-2 rounded-full bg-blue-500"></span>
                            <span className="text-[10px] font-bold text-blue-600 uppercase">Current Month</span>
                        </div>
                    </div>
                 </div>

                 {/* Card 4: Overdue Count */}
                 <div className="bg-white rounded-[2rem] p-7 border border-gray-100 shadow-sm relative overflow-hidden group hover:shadow-xl hover:shadow-red-500/5 transition-all duration-500">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-red-50/50 rounded-full translate-x-12 -translate-y-12 transition-transform duration-700 group-hover:scale-125"></div>
                    <div className="relative">
                        <div className="w-14 h-14 bg-gradient-to-br from-red-50 to-red-100 text-red-600 rounded-2xl flex items-center justify-center text-2xl mb-5 shadow-sm group-hover:animate-bounce transition-transform">
                            <i className="fa-solid fa-triangle-exclamation"></i>
                        </div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Overdue Payments</p>
                        <h3 className="text-3xl font-black text-gray-900">{derivedSummary.overdueCount}</h3>
                        <div className="mt-4 flex items-center gap-2">
                            <span className="flex h-2 w-2 rounded-full bg-red-500 animate-ping"></span>
                            <span className="text-[10px] font-bold text-red-600 uppercase">Urgent</span>
                        </div>
                    </div>
                 </div>
            </div>

            {/* Main Content Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Side: Child Fees List */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Filters Row */}
                    <div className="flex flex-col sm:flex-row justify-between items-center bg-white p-5 rounded-[1.5rem] shadow-sm border border-gray-100 gap-6">
                        <div className="flex items-center gap-4 w-full sm:w-auto">
                            <div className="relative flex-1 sm:w-48">
                                <i className="fa-solid fa-calendar-alt text-purple-400 absolute left-4 top-1/2 -translate-y-1/2 text-sm"></i>
                                <select 
                                    value={selectedMonth}
                                    onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                                    className="w-full pl-11 pr-4 py-3 bg-gray-50/50 border border-gray-100 text-gray-700 text-sm font-bold rounded-2xl focus:ring-4 focus:ring-purple-500/10 focus:border-purple-300 transition-all appearance-none cursor-pointer hover:bg-gray-50"
                                >
                                    {Array.from({ length: 12 }, (_, i) => (
                                        <option key={i+1} value={i+1}>{new Date(0, i).toLocaleString('default', { month: 'long' })}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="relative flex-1 sm:w-36">
                                <select 
                                    value={selectedYear}
                                    onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                                    className="w-full px-4 py-3 bg-gray-50/50 border border-gray-100 text-gray-700 text-sm font-bold rounded-2xl focus:ring-4 focus:ring-purple-500/10 focus:border-purple-300 transition-all appearance-none cursor-pointer hover:bg-gray-50"
                                >
                                    {[currentDate.getFullYear() - 1, currentDate.getFullYear(), currentDate.getFullYear() + 1].map(y => (
                                        <option key={y} value={y}>{y}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="flex gap-2 p-1.5 bg-gray-50 rounded-2xl w-full sm:w-auto overflow-x-auto hide-scrollbar">
                           {[
                               { id: 'All', label: 'All', icon: 'fa-list' },
                               { id: 'Paid', label: 'Paid', icon: 'fa-check-circle', color: 'text-emerald-600', bg: 'bg-emerald-500' },
                               { id: 'Pending', label: 'Pending', icon: 'fa-clock', color: 'text-amber-600', bg: 'bg-amber-500' },
                               { id: 'Overdue', label: 'Overdue', icon: 'fa-exclamation-triangle', color: 'text-red-600', bg: 'bg-red-500' }
                           ].map((btn) => (
                               <button 
                                   key={btn.id}
                                   onClick={() => setStatusFilter(btn.id)} 
                                   className={`px-5 py-2.5 rounded-xl text-xs font-black whitespace-nowrap transition-all flex items-center gap-2 ${
                                       statusFilter === btn.id 
                                       ? 'bg-white text-gray-900 shadow-sm scale-105' 
                                       : 'text-gray-400 hover:text-gray-600'
                                   }`}
                               >
                                   {statusFilter === btn.id && <span className={`w-2 h-2 rounded-full ${btn.bg || 'bg-gray-900'}`}></span>}
                                   {btn.label}
                               </button>
                           ))}
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
                                <div key={child._id} className="grid grid-cols-1 md:grid-cols-12 items-center bg-white p-5 rounded-[1.5rem] shadow-sm hover:shadow-xl hover:shadow-purple-500/5 transition-all duration-300 border border-gray-50 group">
                                    {/* LEFT: Profile, Name, Class/Parent (Col 1-5) */}
                                    <div className="md:col-span-5 flex items-center gap-4">
                                        <div className="w-14 h-14 rounded-2xl overflow-hidden border-2 border-gray-50 shadow-sm flex-shrink-0 bg-gray-100 group-hover:scale-105 transition-transform">
                                            {child.photo ? (
                                                <img src={`${API_URL.replace('/api', '')}${child.photo}`} alt={child.childName} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-xl text-gray-400 font-black bg-gradient-to-br from-gray-50 to-gray-200">
                                                    {child.childName.charAt(0)}
                                                </div>
                                            )}
                                        </div>
                                        <div className="min-w-0">
                                            <p className="font-extrabold text-gray-900 leading-tight truncate">{child.childName}</p>
                                            <p className="text-xs text-gray-400 font-bold mt-1 uppercase tracking-wider flex items-center gap-2">
                                                <span className="text-purple-500">{child.class}</span>
                                                <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                                                <span className="truncate">{child.parentName}</span>
                                            </p>
                                        </div>
                                    </div>

                                    {/* CENTER: Due Date (Col 6-8) */}
                                    <div className="hidden md:flex md:col-span-3 flex-col items-center justify-center border-l border-r border-gray-50 px-4">
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Due Date</p>
                                        <p className="text-sm font-bold text-gray-800">
                                            {child.dueDate ? (
                                                <span className="flex items-center gap-2">
                                                    <i className="fa-regular fa-calendar text-gray-400 text-xs"></i>
                                                    {new Date(child.dueDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                                                </span>
                                            ) : (child.status === 'UPCOMING' ? 'Not Generated' : 'N/A')}
                                        </p>
                                    </div>

                                    {/* RIGHT: Amount, Status, View Details (Col 9-12) */}
                                    <div className="md:col-span-4 flex items-center justify-end gap-5 mt-4 md:mt-0">
                                        <div className="text-right">
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Amount</p>
                                            <p className="text-xl font-black text-gray-900">₹{child.expectedFee.toLocaleString()}</p>
                                        </div>

                                        <div className="flex flex-col items-end gap-2">
                                            <span className={`px-4 py-1.5 text-[10px] font-black rounded-xl uppercase tracking-widest border shadow-sm
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
                                                className={`px-5 py-2 text-[11px] font-black rounded-xl border-2 uppercase tracking-tighter transition-all
                                                    ${child.status === 'UPCOMING' 
                                                        ? 'bg-gray-50 text-gray-300 border-gray-100 cursor-not-allowed' 
                                                        : 'bg-white border-purple-100 text-purple-600 hover:border-purple-600 hover:bg-purple-600 hover:text-white shadow-sm hover:shadow-purple-200'}`}
                                            >
                                                Details
                                            </button>
                                        </div>
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
                        
                        <div className="space-y-3">
                            {recentPayments.length === 0 ? (
                                <div className="text-center py-8">
                                    <div className="w-12 h-12 bg-gray-50 text-gray-200 rounded-full flex items-center justify-center mx-auto mb-3">
                                        <i className="fa-solid fa-receipt text-xl"></i>
                                    </div>
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">No recent payments</p>
                                </div>
                            ) : (
                                recentPayments
                                    .filter(payment => {
                                        const date = new Date(payment.date);
                                        return (date.getMonth() + 1 === selectedMonth && date.getFullYear() === selectedYear);
                                    })
                                    .slice(0, 5)
                                    .map(payment => (
                                        <div key={payment._id} className="p-4 rounded-[1.25rem] bg-gray-50/50 border border-transparent hover:border-purple-100 hover:bg-white hover:shadow-lg hover:shadow-purple-500/5 transition-all duration-300 group">
                                            <div className="flex items-center justify-between mb-3">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-xl bg-emerald-100/50 text-emerald-600 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                                                        <i className="fa-solid fa-indian-rupee-sign text-sm"></i>
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="text-sm font-black text-gray-900 truncate">{payment.child?.childName || 'Unknown'}</p>
                                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">
                                                            {new Date(payment.date).toLocaleDateString(undefined, { day: '2-digit', month: 'short' })} • {payment.mode}
                                                        </p>
                                                    </div>
                                                </div>
                                                <p className="text-sm font-black text-emerald-600">+₹{payment.amount}</p>
                                            </div>
                                            
                                            <div className="flex items-center gap-2 pt-3 border-t border-gray-100/50 opacity-0 group-hover:opacity-100 transition-all transform translate-y-1 group-hover:translate-y-0">
                                                <button 
                                                    onClick={() => generateReceipt(payment, 'view')}
                                                    className="flex-1 py-1.5 text-[9px] font-black uppercase tracking-widest text-purple-600 bg-purple-50 rounded-lg hover:bg-purple-600 hover:text-white transition-colors flex items-center justify-center gap-2"
                                                >
                                                    <i className="fa-solid fa-eye"></i> View
                                                </button>
                                                <button 
                                                    onClick={() => generateReceipt(payment, 'download')}
                                                    className="flex-1 py-1.5 text-[9px] font-black uppercase tracking-widest text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-600 hover:text-white transition-colors flex items-center justify-center gap-2"
                                                >
                                                    <i className="fa-solid fa-download"></i> Get PDF
                                                </button>
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
