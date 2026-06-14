import React, { useEffect, useState } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import { api } from '../../context/AuthContext';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const StaffManagement = () => {
    const [staff, setStaff] = useState([]);
    const [loading, setLoading] = useState(true);

    // Modal controls
    const [isCreateOpen, setIsCreateOpen] = useState(false);

    // Form inputs
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [email, setEmail] = useState('');
    const [role, setRole] = useState('ROLE_ADMIN');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [phone, setPhone] = useState('');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        loadStaff();
    }, []);

    const loadStaff = async () => {
        setLoading(true);
        try {
            const res = await api.get('/api/superadmins/staff');
            setStaff(res.data);
        } catch (error) {
            console.error('Error fetching staff list', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateStaff = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const payload = {
                username,
                password,
                email,
                role,
                firstName,
                lastName,
                phone
            };

            await api.post('/api/superadmins/staff', payload);
            toast.success("Staff member registered successfully!");
            setIsCreateOpen(false);
            resetForm();
            loadStaff();
        } catch (error) {
            toast.error("Error creating staff: " + (error.response?.data || error.message));
        } finally {
            setSubmitting(false);
        }
    };

    const handleToggleStatus = async (id) => {
        try {
            const res = await api.put(`/api/superadmins/staff/${id}/toggle-status`);
            setStaff(staff.map(s => s.id === id ? res.data : s));
            toast.success(`Access status toggled to ${res.data.status}!`);
        } catch (error) {
            toast.error("Error toggling status: " + (error.response?.data || error.message));
        }
    };

    const resetForm = () => {
        setUsername('');
        setPassword('');
        setEmail('');
        setRole('ROLE_ADMIN');
        setFirstName('');
        setLastName('');
        setPhone('');
    };

    return (
        <DashboardLayout title="Administrative Staff Directory">
            <ToastContainer theme="dark" />
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-800 pb-4 mb-6 gap-4">
                    <div className="text-left">
                        <h3 className="text-base font-bold text-white">Staff Management Console</h3>
                        <p className="text-xs text-slate-500 mt-1">Enroll Admin officers and control portal statuses</p>
                    </div>
                    <button
                        onClick={() => { resetForm(); setIsCreateOpen(true); }}
                        className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg transition-colors flex items-center gap-1.5"
                    >
                        ➕ Enroll New Staff
                    </button>
                </div>

                {loading ? (
                    <div className="flex justify-center py-12">
                        <div className="h-6 w-6 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent"></div>
                    </div>
                ) : staff.length === 0 ? (
                    <div className="text-center py-12 text-slate-500 text-sm">
                        No custom staff accounts enrolled in the system.
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-sm">
                            <thead>
                                <tr className="border-b border-slate-800 text-slate-400 text-xs font-semibold uppercase">
                                    <th className="py-3 px-4">User Details</th>
                                    <th className="py-3 px-4">Email Address</th>
                                    <th className="py-3 px-4">System Role</th>
                                    <th className="py-3 px-4">Clearance Status</th>
                                    <th className="py-3 px-4 text-center">Toggle Access</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/60">
                                {staff.map((item) => (
                                    <tr key={item.id} className="hover:bg-slate-800/30 transition-colors">
                                        <td className="py-3.5 px-4">
                                            <p className="font-semibold text-white">{item.firstName} {item.lastName}</p>
                                            <span className="text-[10px] text-slate-500 font-mono">Username: {item.username}</span>
                                        </td>
                                        <td className="py-3.5 px-4 text-slate-400">{item.email}</td>
                                        <td className="py-3.5 px-4">
                                            <span className="text-[10px] bg-slate-950 px-2 py-0.5 border border-slate-800 text-slate-400 font-bold rounded">
                                                {item.role.replace('ROLE_', '')}
                                            </span>
                                        </td>
                                        <td className="py-3.5 px-4">
                                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                                                item.status === 'ACTIVE'
                                                    ? 'bg-emerald-950/20 border-emerald-900 text-emerald-400'
                                                    : 'bg-rose-950/20 border-rose-900 text-rose-400'
                                            }`}>
                                                {item.status}
                                            </span>
                                        </td>
                                        <td className="py-3.5 px-4 text-center">
                                            <button
                                                onClick={() => handleToggleStatus(item.id)}
                                                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                                                    item.status === 'ACTIVE'
                                                        ? 'bg-rose-950/40 hover:bg-rose-900 border border-rose-900/60 text-rose-400'
                                                        : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950'
                                                }`}
                                            >
                                                {item.status === 'ACTIVE' ? '❌ Suspend Staff' : '✅ Restore Staff'}
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Create Staff Account Overlay Modal */}
            {isCreateOpen && (
                <div className="fixed inset-0 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-slate-900 border border-slate-800 max-w-md w-full p-6 rounded-2xl space-y-4 text-left">
                        <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                            <h3 className="font-bold text-white text-base">Enroll New Staff Login</h3>
                            <button
                                onClick={() => { setIsCreateOpen(false); resetForm(); }}
                                className="text-slate-500 hover:text-white"
                            >
                                ✕
                            </button>
                        </div>

                        <form onSubmit={handleCreateStaff} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Username *</label>
                                    <input
                                        type="text"
                                        required
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl focus:outline-none text-white text-xs"
                                        placeholder="Username"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Password *</label>
                                    <input
                                        type="password"
                                        required
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl focus:outline-none text-white text-xs"
                                        placeholder="Password"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">First Name *</label>
                                    <input
                                        type="text"
                                        required
                                        value={firstName}
                                        onChange={(e) => setFirstName(e.target.value)}
                                        className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl focus:outline-none text-white text-xs"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Last Name *</label>
                                    <input
                                        type="text"
                                        required
                                        value={lastName}
                                        onChange={(e) => setLastName(e.target.value)}
                                        className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl focus:outline-none text-white text-xs"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Email Address *</label>
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl focus:outline-none text-white text-xs"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Contact Number</label>
                                    <input
                                        type="text"
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                        className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl focus:outline-none text-white text-xs"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Clearance Role *</label>
                                    <input
                                        type="text"
                                        readOnly
                                        value="ADMIN OFFICER"
                                        className="w-full px-3 py-2 bg-slate-950/60 border border-slate-800 rounded-xl text-slate-500 text-xs focus:outline-none cursor-not-allowed"
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 pt-4 border-t border-slate-800/80">
                                <button
                                    type="button"
                                    onClick={() => { setIsCreateOpen(false); resetForm(); }}
                                    className="px-4 py-2 bg-slate-950 hover:bg-slate-850 text-slate-400 text-xs font-semibold rounded-lg border border-slate-800"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="px-5 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold rounded-lg transition-colors"
                                >
                                    {submitting ? 'Creating...' : 'Create Account'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
};

export default StaffManagement;
