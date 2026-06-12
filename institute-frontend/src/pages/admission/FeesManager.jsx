import React, { useEffect, useState } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import { api } from '../../context/AuthContext';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const FeesManager = () => {
    const [feesList, setFeesList] = useState([]);
    const [loading, setLoading] = useState(true);

    // Modal controls for recording payment
    const [activeFee, setActiveFee] = useState(null);
    const [paymentAmount, setPaymentAmount] = useState('');
    const [submittingPayment, setSubmittingPayment] = useState(false);

    useEffect(() => {
        loadFees();
    }, []);

    const loadFees = async () => {
        setLoading(true);
        try {
            const res = await api.get('/api/admissions/fees');
            setFeesList(res.data);
        } catch (error) {
            console.error('Error fetching fees', error);
        } finally {
            setLoading(false);
        }
    };

    const handleRecordPayment = async (e) => {
        e.preventDefault();
        const amt = parseFloat(paymentAmount);
        if (isNaN(amt) || amt <= 0) {
            toast.error("Please enter a valid positive payment amount.");
            return;
        }

        setSubmittingPayment(true);
        try {
            await api.put(`/api/admissions/fees/${activeFee.id}?paidAmount=${amt}`);
            toast.success("Payment recorded successfully!");
            setActiveFee(null);
            setPaymentAmount('');
            loadFees();
        } catch (error) {
            toast.error("Error updating fees: " + (error.response?.data?.message || error.message));
        } finally {
            setSubmittingPayment(false);
        }
    };

    return (
        <DashboardLayout title="Fees Ledger & Payments Center">
            <ToastContainer theme="dark" />
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
                <div className="border-b border-slate-800 pb-4 mb-6 text-left">
                    <h3 className="text-base font-bold text-white">Student Fees Receipts</h3>
                    <p className="text-xs text-slate-500 mt-1">Audit billing items, balance dues, and record cash installments</p>
                </div>

                {loading ? (
                    <div className="flex justify-center py-12">
                        <div className="h-6 w-6 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent"></div>
                    </div>
                ) : feesList.length === 0 ? (
                    <div className="text-center py-12 text-slate-500 text-sm">
                        No billing items logged in the system yet.
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-sm">
                            <thead>
                                <tr className="border-b border-slate-800 text-slate-400 text-xs font-semibold uppercase">
                                    <th className="py-3 px-4">Student</th>
                                    <th className="py-3 px-4">Total Amount</th>
                                    <th className="py-3 px-4">Paid Amount</th>
                                    <th className="py-3 px-4">Balance Dues</th>
                                    <th className="py-3 px-4">Status</th>
                                    <th className="py-3 px-4 text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/60">
                                {feesList.map((item) => (
                                    <tr key={item.id} className="hover:bg-slate-800/30 transition-colors">
                                        <td className="py-3.5 px-4 font-semibold text-white">
                                            {item.student.user.firstName} {item.student.user.lastName}
                                            <span className="block text-[10px] text-slate-500 font-mono">Roll: {item.student.rollNumber}</span>
                                        </td>
                                        <td className="py-3.5 px-4 text-slate-300">₹{item.totalAmount}</td>
                                        <td className="py-3.5 px-4 text-emerald-400 font-semibold">₹{item.paidAmount}</td>
                                        <td className="py-3.5 px-4 text-rose-450 font-bold">₹{item.pendingAmount}</td>
                                        <td className="py-3.5 px-4">
                                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                                                item.paymentStatus === 'PAID'
                                                    ? 'bg-emerald-950/20 border-emerald-900 text-emerald-400'
                                                    : 'bg-rose-950/20 border-rose-900 text-rose-400'
                                            }`}>
                                                {item.paymentStatus}
                                            </span>
                                        </td>
                                        <td className="py-3.5 px-4 text-center">
                                            {item.paymentStatus !== 'PAID' ? (
                                                <button
                                                    onClick={() => setActiveFee(item)}
                                                    className="px-3 py-1 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold rounded"
                                                >
                                                    Pay Installment
                                                </button>
                                            ) : (
                                                <span className="text-xs text-slate-600 font-semibold">Fully Cleared</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Pay Installment Modal */}
            {activeFee && (
                <div className="fixed inset-0 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-slate-900 border border-slate-800 max-w-md w-full p-6 rounded-2xl space-y-4 text-left relative">
                        <button
                            onClick={() => setActiveFee(null)}
                            className="absolute top-4 right-4 text-slate-500 hover:text-white text-lg"
                        >
                            ✕
                        </button>
                        
                        <div>
                            <h3 className="font-bold text-white text-base">Record Payment Receipt</h3>
                            <p className="text-xs text-slate-400 mt-1">
                                Student: {activeFee.student.user.firstName} {activeFee.student.user.lastName}
                            </p>
                            <p className="text-[10px] text-slate-500 font-mono mt-0.5">Outstanding Balance: ₹{activeFee.pendingAmount}</p>
                        </div>

                        <form onSubmit={handleRecordPayment} className="space-y-4">
                            <div>
                                <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Payment Amount (INR) *</label>
                                <input
                                    type="number"
                                    required
                                    value={paymentAmount}
                                    onChange={(e) => setPaymentAmount(e.target.value)}
                                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500 text-white placeholder-slate-650 text-xs"
                                    placeholder="Enter cash/check amount"
                                />
                            </div>

                            <div className="flex justify-end gap-3 pt-3 border-t border-slate-800/80">
                                <button
                                    type="button"
                                    onClick={() => setActiveFee(null)}
                                    className="px-4 py-2 bg-slate-950 hover:bg-slate-850 text-slate-400 text-xs font-semibold rounded-lg border border-slate-800"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={submittingPayment}
                                    className="px-5 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold rounded-lg transition-colors flex items-center gap-2"
                                >
                                    {submittingPayment ? (
                                        <div className="h-3 w-3 animate-spin rounded-full border-2 border-slate-950 border-t-transparent"></div>
                                    ) : (
                                        'Record Payment'
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
};

export default FeesManager;
