import React, { useEffect, useState } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import { api } from '../../context/AuthContext';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const ManageFaculty = () => {
    const [faculties, setFaculties] = useState([]);
    const [loading, setLoading] = useState(true);

    // Modal controls
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [editingFaculty, setEditingFaculty] = useState(null);

    // Form states
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [email, setEmail] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [phone, setPhone] = useState('');
    const [specialization, setSpecialization] = useState('');
    const [qualification, setQualification] = useState('');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        loadFaculties();
    }, []);

    const loadFaculties = async () => {
        setLoading(true);
        try {
            const res = await api.get('/api/admins/faculties');
            setFaculties(res.data);
        } catch (error) {
            console.error('Error fetching faculty', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateFaculty = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const payload = {
                user: { username, password, email, firstName, lastName, phone },
                specialization,
                qualification
            };

            await api.post('/api/admins/faculties', payload);
            toast.success("Faculty member registered successfully!");
            setIsCreateOpen(false);
            resetForm();
            loadFaculties();
        } catch (error) {
            toast.error("Error creating faculty: " + (error.response?.data || error.message));
        } finally {
            setSubmitting(false);
        }
    };

    const handleOpenEdit = (fac) => {
        setEditingFaculty(fac);
        setUsername(fac.user.username);
        setEmail(fac.user.email);
        setFirstName(fac.user.firstName || '');
        setLastName(fac.user.lastName || '');
        setPhone(fac.user.phone || '');
        setSpecialization(fac.specialization || '');
        setQualification(fac.qualification || '');
    };

    const handleUpdateFaculty = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const payload = {
                user: { email, firstName, lastName, phone },
                specialization,
                qualification
            };

            await api.put(`/api/admins/faculties/${editingFaculty.id}`, payload);
            toast.success("Faculty details updated successfully!");
            setEditingFaculty(null);
            resetForm();
            loadFaculties();
        } catch (error) {
            toast.error("Error updating faculty: " + (error.response?.data || error.message));
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeleteFaculty = async (id) => {
        if (!window.confirm("Are you sure you want to delete this instructor?")) return;
        try {
            await api.delete(`/api/admins/faculties/${id}`);
            toast.success("Faculty record deleted.");
            loadFaculties();
        } catch (error) {
            toast.error("Error deleting faculty: " + (error.response?.data || error.message));
        }
    };

    const resetForm = () => {
        setUsername('');
        setPassword('');
        setEmail('');
        setFirstName('');
        setLastName('');
        setPhone('');
        setSpecialization('');
        setQualification('');
    };

    return (
        <DashboardLayout title="Faculty Members Administration Desk">
            <ToastContainer theme="dark" />
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-800 pb-4 mb-6 gap-4">
                    <div className="text-left">
                        <h3 className="text-base font-bold text-white">Faculty Directory</h3>
                        <p className="text-xs text-slate-500 mt-1">Recruit new teachers, edit profiles, and deactivate listings</p>
                    </div>
                    <button
                        onClick={() => { resetForm(); setIsCreateOpen(true); }}
                        className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg transition-colors flex items-center gap-1.5"
                    >
                        ➕ Register New Faculty
                    </button>
                </div>

                {loading ? (
                    <div className="flex justify-center py-12">
                        <div className="h-6 w-6 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent"></div>
                    </div>
                ) : faculties.length === 0 ? (
                    <div className="text-center py-12 text-slate-500 text-sm">
                        No faculty registered in the system yet.
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-sm">
                            <thead>
                                <tr className="border-b border-slate-800 text-slate-400 text-xs font-semibold uppercase">
                                    <th className="py-3 px-4">Employee ID</th>
                                    <th className="py-3 px-4">Name</th>
                                    <th className="py-3 px-4">Specialization</th>
                                    <th className="py-3 px-4">Qualification</th>
                                    <th className="py-3 px-4 text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/60">
                                {faculties.map((item) => (
                                    <tr key={item.id} className="hover:bg-slate-800/30 transition-colors">
                                        <td className="py-3.5 px-4 font-mono font-bold text-emerald-400">{item.employeeId}</td>
                                        <td className="py-3.5 px-4 text-white font-medium">
                                            {item.user.firstName} {item.user.lastName}
                                            <span className="block text-[10px] text-slate-500">{item.user.email}</span>
                                        </td>
                                        <td className="py-3.5 px-4 text-slate-300">{item.specialization}</td>
                                        <td className="py-3.5 px-4 text-slate-400 text-xs">{item.qualification}</td>
                                        <td className="py-3.5 px-4 text-center">
                                            <div className="inline-flex gap-2">
                                                <button
                                                    onClick={() => handleOpenEdit(item)}
                                                    className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteFaculty(item.id)}
                                                    className="px-3 py-1 bg-rose-950/40 hover:bg-rose-900 border border-rose-900/60 text-rose-400 text-xs font-semibold rounded"
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Create & Edit Modal Overlay */}
            {(isCreateOpen || editingFaculty) && (
                <div className="fixed inset-0 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-slate-900 border border-slate-800 max-w-lg w-full p-6 rounded-2xl space-y-4 text-left">
                        <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                            <h3 className="font-bold text-white text-base">
                                {isCreateOpen ? 'Register New Faculty' : 'Edit Faculty Qualifications'}
                            </h3>
                            <button
                                onClick={() => { setIsCreateOpen(false); setEditingFaculty(null); resetForm(); }}
                                className="text-slate-500 hover:text-white"
                            >
                                ✕
                            </button>
                        </div>

                        <form onSubmit={isCreateOpen ? handleCreateFaculty : handleUpdateFaculty} className="space-y-4">
                            {isCreateOpen && (
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Username *</label>
                                        <input
                                            type="text"
                                            required
                                            value={username}
                                            onChange={(e) => setUsername(e.target.value)}
                                            className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500 text-white text-xs"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Password *</label>
                                        <input
                                            type="password"
                                            required
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500 text-white text-xs"
                                        />
                                    </div>
                                </div>
                            )}

                            <div className="grid grid-cols-3 gap-4">
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
                                <div>
                                    <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Email *</label>
                                    <input
                                        type="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl focus:outline-none text-white text-xs"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Specialization *</label>
                                    <input
                                        type="text"
                                        required
                                        value={specialization}
                                        onChange={(e) => setSpecialization(e.target.value)}
                                        className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl focus:outline-none text-white text-xs"
                                        placeholder="e.g. Java, Databases"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Qualification *</label>
                                    <input
                                        type="text"
                                        required
                                        value={qualification}
                                        onChange={(e) => setQualification(e.target.value)}
                                        className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl focus:outline-none text-white text-xs"
                                        placeholder="e.g. PhD, MTech CS"
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 pt-4 border-t border-slate-800/80">
                                <button
                                    type="button"
                                    onClick={() => { setIsCreateOpen(false); setEditingFaculty(null); resetForm(); }}
                                    className="px-4 py-2 bg-slate-950 hover:bg-slate-850 text-slate-400 text-xs font-semibold rounded-lg border border-slate-800"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="px-5 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold rounded-lg transition-colors"
                                >
                                    {submitting ? 'Processing...' : 'Save Teacher Profile'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
};

export default ManageFaculty;
