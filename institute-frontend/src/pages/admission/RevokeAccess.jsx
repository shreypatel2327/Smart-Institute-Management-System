import React, { useEffect, useState } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import { api } from '../../context/AuthContext';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const RevokeAccess = () => {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadStudents();
    }, []);

    const loadStudents = async () => {
        setLoading(true);
        try {
            const res = await api.get('/api/admins/students'); // Admins and Admissions can query students
            setStudents(res.data);
        } catch (error) {
            console.error('Error fetching students list', error);
        } finally {
            setLoading(false);
        }
    };

    const handleToggleAccess = async (studentId) => {
        try {
            const res = await api.put(`/api/admissions/students/${studentId}/toggle-access`);
            const { accountStatus } = res.data;
            
            setStudents(students.map(s => {
                if (s.id === studentId) {
                    return {
                        ...s,
                        user: { ...s.user, status: accountStatus },
                        status: accountStatus === 'ACTIVE' ? 'ACTIVE' : 'INACTIVE'
                    };
                }
                return s;
            }));

            toast.success(`Student portal access status changed to ${accountStatus}`);
        } catch (error) {
            toast.error("Error toggling student access: " + (error.response?.data?.message || error.message));
        }
    };

    return (
        <DashboardLayout title="Student Access Control Desk">
            <ToastContainer theme="dark" />
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
                <div className="border-b border-slate-800 pb-4 mb-6 text-left">
                    <h3 className="text-base font-bold text-white">Revoke / Grant Access</h3>
                    <p className="text-xs text-slate-500 mt-1">Suspend portal logins or reactivate deactivated student accounts instantly</p>
                </div>

                {loading ? (
                    <div className="flex justify-center py-12">
                        <div className="h-6 w-6 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent"></div>
                    </div>
                ) : students.length === 0 ? (
                    <div className="text-center py-12 text-slate-500 text-sm">
                        No students enrolled in the system.
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-sm">
                            <thead>
                                <tr className="border-b border-slate-800 text-slate-400 text-xs font-semibold uppercase">
                                    <th className="py-3 px-4">Roll No</th>
                                    <th className="py-3 px-4">Student Name</th>
                                    <th className="py-3 px-4">Username / Email</th>
                                    <th className="py-3 px-4">Login Clearance</th>
                                    <th className="py-3 px-4 text-center">Toggle Access</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/60">
                                {students.map((item) => (
                                    <tr key={item.id} className="hover:bg-slate-800/30 transition-colors">
                                        <td className="py-3.5 px-4 font-mono font-bold text-emerald-400">{item.rollNumber}</td>
                                        <td className="py-3.5 px-4 text-white font-medium">{item.user.firstName} {item.user.lastName}</td>
                                        <td className="py-3.5 px-4 text-slate-400">
                                            <p className="text-xs">{item.user.username}</p>
                                            <span className="text-[10px] text-slate-500">{item.user.email}</span>
                                        </td>
                                        <td className="py-3.5 px-4">
                                            <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                                                item.user.status === 'ACTIVE'
                                                    ? 'bg-emerald-950/20 border-emerald-900 text-emerald-400'
                                                    : 'bg-rose-950/20 border-rose-900 text-rose-400'
                                            }`}>
                                                {item.user.status}
                                            </span>
                                        </td>
                                        <td className="py-3.5 px-4 text-center">
                                            <button
                                                onClick={() => handleToggleAccess(item.id)}
                                                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                                                    item.user.status === 'ACTIVE'
                                                        ? 'bg-rose-950/40 hover:bg-rose-900 border border-rose-900/60 text-rose-400'
                                                        : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950'
                                                }`}
                                            >
                                                {item.user.status === 'ACTIVE' ? '❌ Suspend Access' : '✅ Restore Access'}
                                            </button>
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

export default RevokeAccess;
