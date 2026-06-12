import React, { useEffect, useState } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import { api } from '../../context/AuthContext';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const ManageStudents = () => {
    const [students, setStudents] = useState([]);
    const [batches, setBatches] = useState([]);
    const [loading, setLoading] = useState(true);

    // Modal controls
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [editingStudent, setEditingStudent] = useState(null);

    // Form inputs
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [email, setEmail] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [phone, setPhone] = useState('');
    const [city, setCity] = useState('');
    const [mobileNumber, setMobileNumber] = useState('');
    const [fatherName, setFatherName] = useState('');
    const [fatherOccupation, setFatherOccupation] = useState('');
    const [fatherMobile, setFatherMobile] = useState('');
    const [motherOccupation, setMotherOccupation] = useState('');
    const [motherMobile, setMotherMobile] = useState('');
    const [referenceSource, setReferenceSource] = useState('Social Media Ads');
    const [otherReference, setOtherReference] = useState('');
    const [selectedBatchId, setSelectedBatchId] = useState('');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        loadPageData();
    }, []);

    const loadPageData = async () => {
        setLoading(true);
        try {
            const stdRes = await api.get('/api/admins/students');
            setStudents(stdRes.data);

            const batRes = await api.get('/api/admins/batches');
            setBatches(batRes.data);
        } catch (error) {
            console.error('Error loading students', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateStudent = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const payload = {
                user: { username, password, email, firstName, lastName, phone },
                city,
                mobileNumber,
                fatherName,
                fatherOccupation,
                fatherMobile,
                motherOccupation,
                motherMobile,
                referenceSource,
                otherReference,
                batch: selectedBatchId ? { id: parseInt(selectedBatchId) } : null
            };

            await api.post('/api/admins/students', payload);
            toast.success("Student account created successfully!");
            setIsCreateOpen(false);
            resetForm();
            loadPageData();
        } catch (error) {
            toast.error("Error creating student: " + (error.response?.data || error.message));
        } finally {
            setSubmitting(false);
        }
    };

    const handleOpenEdit = (student) => {
        setEditingStudent(student);
        setUsername(student.user.username);
        setEmail(student.user.email);
        setFirstName(student.user.firstName || '');
        setLastName(student.user.lastName || '');
        setPhone(student.user.phone || '');
        setCity(student.city || '');
        setMobileNumber(student.mobileNumber || '');
        setFatherName(student.fatherName || '');
        setFatherOccupation(student.fatherOccupation || '');
        setFatherMobile(student.fatherMobile || '');
        setMotherOccupation(student.motherOccupation || '');
        setMotherMobile(student.motherMobile || '');
        setReferenceSource(student.referenceSource || 'Social Media Ads');
        setOtherReference(student.otherReference || '');
        setSelectedBatchId(student.batch?.id || '');
    };

    const handleUpdateStudent = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const payload = {
                user: { email, firstName, lastName, phone, password: password || null },
                city,
                mobileNumber,
                fatherName,
                fatherOccupation,
                fatherMobile,
                motherOccupation,
                motherMobile,
                referenceSource,
                otherReference,
                batch: selectedBatchId ? { id: parseInt(selectedBatchId) } : null
            };

            await api.put(`/api/admins/students/${editingStudent.id}`, payload);
            toast.success("Student details updated successfully!");
            setEditingStudent(null);
            resetForm();
            loadPageData();
        } catch (error) {
            toast.error("Error updating student: " + (error.response?.data || error.message));
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeleteStudent = async (id) => {
        if (!window.confirm("Are you sure you want to delete this student? All user details will be deleted.")) return;
        try {
            await api.delete(`/api/admins/students/${id}`);
            toast.success("Student record deleted.");
            loadPageData();
        } catch (error) {
            toast.error("Error deleting student: " + (error.response?.data || error.message));
        }
    };

    const resetForm = () => {
        setUsername('');
        setPassword('');
        setEmail('');
        setFirstName('');
        setLastName('');
        setPhone('');
        setCity('');
        setMobileNumber('');
        setFatherName('');
        setFatherOccupation('');
        setFatherMobile('');
        setMotherOccupation('');
        setMotherMobile('');
        setReferenceSource('Social Media Ads');
        setOtherReference('');
        setSelectedBatchId('');
    };

    return (
        <DashboardLayout title="Students Management Center">
            <ToastContainer theme="dark" />
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-800 pb-4 mb-6 gap-4">
                    <div className="text-left">
                        <h3 className="text-base font-bold text-white">Student Directory</h3>
                        <p className="text-xs text-slate-500 mt-1">Audit active profiles, enroll new admissions, and delete profiles</p>
                    </div>
                    <button
                        onClick={() => { resetForm(); setIsCreateOpen(true); }}
                        className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg transition-colors flex items-center gap-1.5"
                    >
                        ➕ Enroll New Student
                    </button>
                </div>

                {loading ? (
                    <div className="flex justify-center py-12">
                        <div className="h-6 w-6 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent"></div>
                    </div>
                ) : students.length === 0 ? (
                    <div className="text-center py-12 text-slate-500 text-sm">
                        No students enrolled in the system yet.
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-sm">
                            <thead>
                                <tr className="border-b border-slate-800 text-slate-400 text-xs font-semibold uppercase">
                                    <th className="py-3 px-4">Roll No</th>
                                    <th className="py-3 px-4">Name</th>
                                    <th className="py-3 px-4">Email / Phone</th>
                                    <th className="py-3 px-4">Assigned Batch</th>
                                    <th className="py-3 px-4 text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/60">
                                {students.map((item) => (
                                    <tr key={item.id} className="hover:bg-slate-800/30 transition-colors">
                                        <td className="py-3.5 px-4 font-mono font-bold text-emerald-400">{item.rollNumber}</td>
                                        <td className="py-3.5 px-4 text-white font-medium">{item.user.firstName} {item.user.lastName}</td>
                                        <td className="py-3.5 px-4 text-slate-400">
                                            <p className="text-xs">{item.user.email}</p>
                                            <p className="text-[10px] text-slate-500">{item.mobileNumber || item.user.phone || 'N/A'}</p>
                                        </td>
                                        <td className="py-3.5 px-4 text-slate-300">
                                            {item.batch ? (
                                                <span className="text-xs bg-slate-950 px-2 py-1 rounded text-slate-400 border border-slate-800">
                                                    {item.batch.name}
                                                </span>
                                            ) : (
                                                <span className="text-xs text-slate-600 font-medium">Unassigned</span>
                                            )}
                                        </td>
                                        <td className="py-3.5 px-4 text-center">
                                            <div className="inline-flex gap-2">
                                                <button
                                                    onClick={() => handleOpenEdit(item)}
                                                    className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteStudent(item.id)}
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

            {/* Create & Edit Overlay Modal */}
            {(isCreateOpen || editingStudent) && (
                <div className="fixed inset-0 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-slate-900 border border-slate-800 max-w-2xl w-full p-6 rounded-2xl space-y-4 text-left overflow-y-auto max-h-[90vh]">
                        <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                            <h3 className="font-bold text-white text-base">
                                {isCreateOpen ? 'Enroll New Student' : 'Edit Student Details'}
                            </h3>
                            <button
                                onClick={() => { setIsCreateOpen(false); setEditingStudent(null); resetForm(); }}
                                className="text-slate-500 hover:text-white"
                            >
                                ✕
                            </button>
                        </div>

                        <form onSubmit={isCreateOpen ? handleCreateStudent : handleUpdateStudent} className="space-y-4">
                            {/* Credentials - Show only on Create */}
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
                                            className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500 text-white text-xs"
                                            placeholder="Password"
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Name and Email */}
                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">First Name *</label>
                                    <input
                                        type="text"
                                        required
                                        value={firstName}
                                        onChange={(e) => setFirstName(e.target.value)}
                                        className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500 text-white text-xs"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Last Name *</label>
                                    <input
                                        type="text"
                                        required
                                        value={lastName}
                                        onChange={(e) => setLastName(e.target.value)}
                                        className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500 text-white text-xs"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Email *</label>
                                    <input
                                        type="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500 text-white text-xs"
                                    />
                                </div>
                            </div>

                            {/* Contact, City and Batch */}
                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Contact Number</label>
                                    <input
                                        type="text"
                                        value={mobileNumber}
                                        onChange={(e) => setMobileNumber(e.target.value)}
                                        className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500 text-white text-xs"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">City</label>
                                    <input
                                        type="text"
                                        value={city}
                                        onChange={(e) => setCity(e.target.value)}
                                        className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500 text-white text-xs"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Assign Batch</label>
                                    <select
                                        value={selectedBatchId}
                                        onChange={(e) => setSelectedBatchId(e.target.value)}
                                        className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500"
                                    >
                                        <option value="">Unassigned</option>
                                        {batches.map(b => (
                                            <option key={b.id} value={b.id}>{b.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Parents Info */}
                            <div className="border-t border-slate-800/80 pt-4">
                                <h4 className="font-bold text-white text-xs mb-3">Parental Profiles</h4>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Father Name</label>
                                        <input
                                            type="text"
                                            value={fatherName}
                                            onChange={(e) => setFatherName(e.target.value)}
                                            className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Father Occupation</label>
                                        <input
                                            type="text"
                                            value={fatherOccupation}
                                            onChange={(e) => setFatherOccupation(e.target.value)}
                                            className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Mother Occupation</label>
                                        <input
                                            type="text"
                                            value={motherOccupation}
                                            onChange={(e) => setMotherOccupation(e.target.value)}
                                            className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Mother Contact</label>
                                        <input
                                            type="text"
                                            value={motherMobile}
                                            onChange={(e) => setMotherMobile(e.target.value)}
                                            className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Reference */}
                            <div className="border-t border-slate-800/80 pt-4 grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Reference Source</label>
                                    <select
                                        value={referenceSource}
                                        onChange={(e) => setReferenceSource(e.target.value)}
                                        className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs"
                                    >
                                        <option value="Newspaper">Newspaper</option>
                                        <option value="Social Media Ads">Social Media Ads</option>
                                        <option value="Friends/Relatives">Friends/Relatives</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>
                                {referenceSource === 'Other' && (
                                    <div>
                                        <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Specify Details</label>
                                        <input
                                            type="text"
                                            value={otherReference}
                                            onChange={(e) => setOtherReference(e.target.value)}
                                            className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs"
                                        />
                                    </div>
                                )}
                            </div>

                            <div className="flex justify-end gap-3 pt-4 border-t border-slate-800/80">
                                <button
                                    type="button"
                                    onClick={() => { setIsCreateOpen(false); setEditingStudent(null); resetForm(); }}
                                    className="px-4 py-2 bg-slate-950 hover:bg-slate-850 text-slate-400 text-xs font-semibold rounded-lg border border-slate-800"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="px-5 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold rounded-lg transition-colors"
                                >
                                    {submitting ? 'Processing...' : 'Save Changes'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
};

export default ManageStudents;
