import React, { useEffect, useState } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import { api } from '../../context/AuthContext';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Mapping = () => {
    const [students, setStudents] = useState([]);
    const [batches, setBatches] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const stdRes = await api.get('/api/admins/students');
            setStudents(stdRes.data);

            const batRes = await api.get('/api/admins/batches');
            setBatches(batRes.data);
        } catch (error) {
            console.error('Error loading data', error);
        } finally {
            setLoading(false);
        }
    };

    const handleMap = async (studentId, batchId) => {
        if (!batchId) {
            // Unmap
            try {
                await api.put(`/api/admins/students/${studentId}/unmap-batch`);
                toast.success("Student removed from batch.");
                loadData();
            } catch (error) {
                toast.error("Error: " + (error.response?.data || error.message));
            }
        } else {
            // Map
            try {
                await api.put(`/api/admins/students/${studentId}/map-batch/${batchId}`);
                toast.success("Student mapped to batch!");
                loadData();
            } catch (error) {
                toast.error("Error: " + (error.response?.data || error.message));
            }
        }
    };

    return (
        <DashboardLayout title="Student Batch Mapping Desk">
            <ToastContainer theme="dark" />
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
                <div className="border-b border-slate-800 pb-4 mb-6 text-left">
                    <h3 className="text-base font-bold text-white">Class Allocations</h3>
                    <p className="text-xs text-slate-500 mt-1">Directly assign or swap students to active lecture batches</p>
                </div>

                {loading ? (
                    <div className="flex justify-center py-12">
                        <div className="h-6 w-6 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent"></div>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-sm">
                            <thead>
                                <tr className="border-b border-slate-800 text-slate-400 text-xs font-semibold uppercase">
                                    <th className="py-3 px-4">Roll No</th>
                                    <th className="py-3 px-4">Student Name</th>
                                    <th className="py-3 px-4">Current Batch</th>
                                    <th className="py-3 px-4 text-center">Batch Assignment Select</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/60">
                                {students.map((item) => (
                                    <tr key={item.id} className="hover:bg-slate-800/30 transition-colors">
                                        <td className="py-3.5 px-4 font-mono font-bold text-emerald-400">{item.rollNumber}</td>
                                        <td className="py-3.5 px-4 text-white font-medium">
                                            {item.user.firstName} {item.user.lastName}
                                            <span className="block text-[10px] text-slate-500">{item.user.email}</span>
                                        </td>
                                        <td className="py-3.5 px-4">
                                            {item.batch ? (
                                                <span className="text-xs bg-slate-950 px-2.5 py-1 rounded text-slate-350 border border-slate-800 font-medium">
                                                    {item.batch.name}
                                                </span>
                                            ) : (
                                                <span className="text-xs text-slate-600 italic">Unassigned</span>
                                            )}
                                        </td>
                                        <td className="py-3.5 px-4 text-center">
                                            <select
                                                value={item.batch?.id || ''}
                                                onChange={(e) => handleMap(item.id, e.target.value)}
                                                className="bg-slate-950 border border-slate-800 text-slate-300 text-xs px-3 py-1.5 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 font-medium"
                                            >
                                                <option value="">-- Remove from Batch --</option>
                                                {batches.map(b => (
                                                    <option key={b.id} value={b.id}>{b.name}</option>
                                                ))}
                                            </select>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
};

export default Mapping;
