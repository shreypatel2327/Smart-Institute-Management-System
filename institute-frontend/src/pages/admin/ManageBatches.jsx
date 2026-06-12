import React, { useEffect, useState } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import { api } from '../../context/AuthContext';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const ManageBatches = () => {
    const [batches, setBatches] = useState([]);
    const [faculties, setFaculties] = useState([]);
    const [loading, setLoading] = useState(true);

    // Modal controls
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [editingBatch, setEditingBatch] = useState(null);

    // Form states
    const [name, setName] = useState('');
    const [code, setCode] = useState('');
    const [lectureDays, setLectureDays] = useState('Monday,Wednesday,Friday');
    const [timings, setTimings] = useState('');
    const [strength, setStrength] = useState(30);
    const [selectedFacultyId, setSelectedFacultyId] = useState('');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        loadPageData();
    }, []);

    const loadPageData = async () => {
        setLoading(true);
        try {
            const batRes = await api.get('/api/admins/batches');
            setBatches(batRes.data);

            const facRes = await api.get('/api/admins/faculties');
            setFaculties(facRes.data);
        } catch (error) {
            console.error('Error fetching batch page data', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateBatch = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const payload = {
                name,
                code,
                lectureDays,
                timings,
                strength: parseInt(strength),
                faculty: selectedFacultyId ? { id: parseInt(selectedFacultyId) } : null,
                status: "ACTIVE"
            };

            await api.post('/api/admins/batches', payload);
            toast.success("Batch created successfully!");
            setIsCreateOpen(false);
            resetForm();
            loadPageData();
        } catch (error) {
            toast.error("Error creating batch: " + (error.response?.data || error.message));
        } finally {
            setSubmitting(false);
        }
    };

    const handleOpenEdit = (batch) => {
        setEditingBatch(batch);
        setName(batch.name);
        setCode(batch.code);
        setLectureDays(batch.lectureDays || 'Monday,Wednesday,Friday');
        setTimings(batch.timings || '');
        setStrength(batch.strength || 30);
        setSelectedFacultyId(batch.faculty?.id || '');
    };

    const handleUpdateBatch = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const payload = {
                name,
                code,
                lectureDays,
                timings,
                strength: parseInt(strength),
                faculty: selectedFacultyId ? { id: parseInt(selectedFacultyId) } : null
            };

            await api.put(`/api/admins/batches/${editingBatch.id}`, payload);
            toast.success("Batch updated successfully!");
            setEditingBatch(null);
            resetForm();
            loadPageData();
        } catch (error) {
            toast.error("Error updating batch: " + (error.response?.data || error.message));
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeleteBatch = async (id) => {
        if (!window.confirm("Are you sure you want to delete this batch?")) return;
        try {
            await api.delete(`/api/admins/batches/${id}`);
            toast.success("Batch deleted.");
            loadPageData();
        } catch (error) {
            toast.error("Error deleting batch: " + (error.response?.data || error.message));
        }
    };

    const resetForm = () => {
        setName('');
        setCode('');
        setLectureDays('Monday,Wednesday,Friday');
        setTimings('');
        setStrength(30);
        setSelectedFacultyId('');
    };

    return (
        <DashboardLayout title="Batches Management Center">
            <ToastContainer theme="dark" />
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-800 pb-4 mb-6 gap-4">
                    <div className="text-left">
                        <h3 className="text-base font-bold text-white">Course Batches Directory</h3>
                        <p className="text-xs text-slate-500 mt-1">Configure timings, strength limits, and map instructors to class blocks</p>
                    </div>
                    <button
                        onClick={() => { resetForm(); setIsCreateOpen(true); }}
                        className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg transition-colors flex items-center gap-1.5"
                    >
                        ➕ Add New Batch
                    </button>
                </div>

                {loading ? (
                    <div className="flex justify-center py-12">
                        <div className="h-6 w-6 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent"></div>
                    </div>
                ) : batches.length === 0 ? (
                    <div className="text-center py-12 text-slate-500 text-sm">
                        No batches configured in the system yet.
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-sm">
                            <thead>
                                <tr className="border-b border-slate-800 text-slate-400 text-xs font-semibold uppercase">
                                    <th className="py-3 px-4">Batch Code</th>
                                    <th className="py-3 px-4">Name</th>
                                    <th className="py-3 px-4">Days / Timings</th>
                                    <th className="py-3 px-4">Instructor</th>
                                    <th className="py-3 px-4">Capacity</th>
                                    <th className="py-3 px-4 text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/60">
                                {batches.map((item) => (
                                    <tr key={item.id} className="hover:bg-slate-800/30 transition-colors">
                                        <td className="py-3.5 px-4 font-mono font-bold text-emerald-400">{item.code}</td>
                                        <td className="py-3.5 px-4 text-white font-medium">{item.name}</td>
                                        <td className="py-3.5 px-4 text-slate-400">
                                            <p className="text-xs">{item.lectureDays}</p>
                                            <p className="text-[10px] text-slate-500">{item.timings}</p>
                                        </td>
                                        <td className="py-3.5 px-4 text-slate-300">
                                            {item.faculty ? (
                                                `Prof. ${item.faculty.user.firstName} ${item.faculty.user.lastName}`
                                            ) : (
                                                <span className="text-xs text-slate-600">Unassigned</span>
                                            )}
                                        </td>
                                        <td className="py-3.5 px-4 text-slate-400 font-medium">{item.strength} students</td>
                                        <td className="py-3.5 px-4 text-center">
                                            <div className="inline-flex gap-2">
                                                <button
                                                    onClick={() => handleOpenEdit(item)}
                                                    className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteBatch(item.id)}
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

            {/* Create & Edit Modal */}
            {(isCreateOpen || editingBatch) && (
                <div className="fixed inset-0 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-slate-900 border border-slate-800 max-w-md w-full p-6 rounded-2xl space-y-4 text-left">
                        <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                            <h3 className="font-bold text-white text-base">
                                {isCreateOpen ? 'Create New Batch' : 'Edit Batch Configuration'}
                            </h3>
                            <button
                                onClick={() => { setIsCreateOpen(false); setEditingBatch(null); resetForm(); }}
                                className="text-slate-500 hover:text-white"
                            >
                                ✕
                            </button>
                        </div>

                        <form onSubmit={isCreateOpen ? handleCreateBatch : handleUpdateBatch} className="space-y-4">
                            <div>
                                <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Batch Name *</label>
                                <input
                                    type="text"
                                    required
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500"
                                    placeholder="e.g. Java Spring Monolithic"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Batch Code *</label>
                                    <input
                                        type="text"
                                        required
                                        value={code}
                                        onChange={(e) => setCode(e.target.value)}
                                        className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500"
                                        placeholder="e.g. CS-SB3A"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Capacity Strength *</label>
                                    <input
                                        type="number"
                                        required
                                        value={strength}
                                        onChange={(e) => setStrength(e.target.value)}
                                        className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Lecture Timings *</label>
                                <input
                                    type="text"
                                    required
                                    value={timings}
                                    onChange={(e) => setTimings(e.target.value)}
                                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs"
                                    placeholder="e.g. 09:00 AM - 11:00 AM"
                                />
                            </div>

                            <div>
                                <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Lecture Days *</label>
                                <input
                                    type="text"
                                    required
                                    value={lectureDays}
                                    onChange={(e) => setLectureDays(e.target.value)}
                                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs"
                                    placeholder="Monday,Wednesday,Friday"
                                />
                            </div>

                            <div>
                                <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Assign Instructor (Faculty)</label>
                                <select
                                    value={selectedFacultyId}
                                    onChange={(e) => setSelectedFacultyId(e.target.value)}
                                    className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:outline-none"
                                >
                                    <option value="">Select Faculty</option>
                                    {faculties.map(f => (
                                        <option key={f.id} value={f.id}>
                                            Prof. {f.user.firstName} {f.user.lastName} ({f.specialization})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="flex justify-end gap-3 pt-4 border-t border-slate-800/80">
                                <button
                                    type="button"
                                    onClick={() => { setIsCreateOpen(false); setEditingBatch(null); resetForm(); }}
                                    className="px-4 py-2 bg-slate-950 hover:bg-slate-850 text-slate-400 text-xs font-semibold rounded-lg border border-slate-800"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="px-5 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold rounded-lg transition-colors"
                                >
                                    {submitting ? 'Saving...' : 'Save Batch'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
};

export default ManageBatches;
