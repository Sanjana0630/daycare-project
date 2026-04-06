import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5005';
const API_URL = `${API_BASE_URL}/api`;

const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
];

const ViewFeeStructureModal = ({ isOpen, onClose, month, year }) => {
    const [structures, setStructures] = useState([]);
    const [loading, setLoading] = useState(false);

    const fetchStructures = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const res = await axios.get(`${API_URL}/fees/structure`, {
                headers: { Authorization: `Bearer ${token}` },
                params: { month, year }
            });
            // The response is an array of { className, amount } as per our backend update
            setStructures(res.data);
        } catch (error) {
            toast.error('Failed to fetch fee structure');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isOpen) {
            fetchStructures();
        }
    }, [isOpen, month, year]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden transform transition-all scale-100 opacity-100">
                {/* Header */}
                <div className="bg-gradient-to-r from-gray-800 to-gray-900 p-6 text-white flex justify-between items-center">
                    <div>
                        <h2 className="text-xl font-bold">
                            Fee Structure ({monthNames[month - 1]} {year})
                        </h2>
                        <p className="text-gray-400 text-sm mt-1">Monthly base fees for all classes</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-white hover:bg-white/20 p-2 rounded-full transition-colors flex items-center justify-center h-10 w-10"
                    >
                        <i className="fa-solid fa-times text-lg"></i>
                    </button>
                </div>

                {/* Content */}
                <div className="p-8">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-12">
                            <div className="w-12 h-12 border-4 border-gray-200 border-t-purple-600 rounded-full animate-spin mb-4"></div>
                            <p className="text-gray-500 font-medium">Loading fee structure...</p>
                        </div>
                    ) : (
                        <div className="overflow-hidden border border-gray-100 rounded-2xl">
                            <table className="w-full text-left">
                                <thead className="bg-gray-50 border-b border-gray-100">
                                    <tr>
                                        <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Class</th>
                                        <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Monthly Fee</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {structures.length > 0 ? (
                                        structures.map((s, index) => (
                                            <tr key={index} className="hover:bg-gray-50/50 transition-colors">
                                                <td className="px-6 py-4 text-sm font-semibold text-gray-700">{s.className}</td>
                                                <td className="px-6 py-4 text-sm font-bold text-gray-900 text-right">₹{s.amount.toLocaleString()}</td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="2" className="px-6 py-12 text-center text-gray-400 italic">
                                                No fee structure records found for this period.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}

                    <div className="mt-8 flex justify-end">
                        <button
                            onClick={onClose}
                            className="px-8 py-2.5 bg-gray-900 text-white font-bold rounded-xl hover:bg-gray-800 transition-all shadow-lg shadow-gray-200"
                        >
                            Close
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ViewFeeStructureModal;
