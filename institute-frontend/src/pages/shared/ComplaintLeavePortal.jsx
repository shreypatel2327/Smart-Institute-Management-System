import React, { useEffect, useState } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import { api, useAuth } from '../../context/AuthContext';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const ComplaintLeavePortal = () => {
    const { user } = useAuth();
    const [requests, setRequests] = useState([]);
    const [targets, setTargets] = useState([]);
    const [loading, setLoading] = useState(true);

    // Form states
    const [type, setType] = useState('COMPLAINT'); // COMPLAINT, LEAVE, RECORDING_REQUEST
    const [message, setMessage] = useState('');
    const [recipientUserId, setRecipientUserId] = useState('');
    const [targetUserId, setTargetUserId] = useState('');
    const [targetType, setTargetType] = useState('FACULTY'); // FACULTY, ADMIN, STUDENT
    const [file, setFile] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    // Filter tab state
    const [activeTab, setActiveTab] = useState('ALL'); // ALL, PENDING, APPROVED, REJECTED, RESOLVED

    const getRoleRank = (roleName) => {
        if (roleName === 'ROLE_STUDENT') return 1;
        if (roleName === 'ROLE_FACULTY') return 2;
        if (roleName === 'ROLE_ADMIN') return 3;
        if (roleName === 'ROLE_SUPER_ADMIN') return 4;
        return 0;
    };

    useEffect(() => {
        setRecipientUserId('');
    }, [type, targetUserId]);

    const fetchRequests = async () => {
        try {
            const res = await api.get('/api/complaints-leaves');
            setRequests(res.data);
        } catch (err) {
            console.error('Error fetching complaints/leaves:', err);
            toast.error('Failed to load complaints and leave requests.');
        }
    };

    const fetchTargets = async () => {
        try {
            const res = await api.get('/api/complaints-leaves/targets');
            setTargets(res.data);
            if (res.data.length > 0) {
                setTargetUserId(res.data[0].id);
            }
        } catch (err) {
            console.error('Error fetching targets:', err);
        }
    };

    useEffect(() => {
        if (user) {
            Promise.all([fetchRequests(), fetchTargets()]).finally(() => setLoading(false));
        }
    }, [user]);

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!recipientUserId) {
            toast.error('Error: Recipient user must be specified.');
            return;
        }
        setSubmitting(true);

        try {
            const formData = new FormData();
            formData.append('type', type);
            formData.append('message', message);
            formData.append('recipientUserId', recipientUserId);
            if (type === 'COMPLAINT') {
                if (targetUserId) formData.append('targetUserId', targetUserId);
                formData.append('targetType', targetType);
            }
            if (file) {
                formData.append('file', file);
            }

            await api.post('/api/complaints-leaves', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            toast.success('Your request/complaint has been submitted successfully.');
            setMessage('');
            setFile(null);
            // Reset file input element
            document.getElementById('complaint-file-input').value = '';
            fetchRequests();
        } catch (err) {
            console.error('Error submitting complaint/leave:', err);
            toast.error(err.response?.data || err.response?.data?.message || 'Failed to submit. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    const handleUpdateStatus = async (id, newStatus) => {
        try {
            await api.put(`/api/complaints-leaves/${id}/status?status=${newStatus}`);
            toast.success(`Request status updated to ${newStatus}.`);
            fetchRequests();
        } catch (err) {
            console.error('Error updating status:', err);
            toast.error('Failed to update request status.');
        }
    };

    const filteredRecipients = targets.filter(t => {
        if (type === 'RECORDING_REQUEST') {
            return t.role === 'ROLE_FACULTY';
        }

        const recipientRank = getRoleRank(t.role);
        const senderRank = getRoleRank(user?.role);
        if (recipientRank <= senderRank) return false;

        if (type === 'COMPLAINT' && targetUserId) {
            const targetUserObj = targets.find(x => x.id.toString() === targetUserId.toString());
            if (targetUserObj) {
                const targetRank = getRoleRank(targetUserObj.role);
                if (recipientRank <= targetRank) return false;
            }
        }
        return true;
    });

    const filteredRequests = requests.filter(req => {
        if (activeTab === 'ALL') return true;
        return req.status === activeTab;
    });

    const canManageRequest = (req) => {
        if (!user) return false;
        const isRecipient = req.recipient?.id === user.id;
        const isAdmin = user.role === 'ROLE_SUPER_ADMIN' || user.role === 'ROLE_ADMIN';
        return isRecipient || isAdmin;
    };

    return (
        <DashboardLayout title="Complaints & Leaves Portal">
            <ToastContainer theme="dark" />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Submit Form (Only if not Super Admin) */}
                {user?.role !== 'ROLE_SUPER_ADMIN' && (
                    <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl h-fit text-left">
                        <h3 className="font-bold text-white text-base border-b border-slate-800 pb-3 mb-5">
                            New Complaint / Leave Request
                        </h3>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Request Type *</label>
                                <div className="grid grid-cols-3 gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setType('COMPLAINT')}
                                        className={`py-2 text-[10px] font-bold rounded-xl border transition-all ${
                                            type === 'COMPLAINT'
                                                ? 'bg-red-500/10 border-red-500 text-red-400'
                                                : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                                        }`}
                                    >
                                        😠 Complaint
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setType('LEAVE')}
                                        className={`py-2 text-[10px] font-bold rounded-xl border transition-all ${
                                            type === 'LEAVE'
                                                ? 'bg-amber-500/10 border-amber-500 text-amber-400'
                                                : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                                        }`}
                                    >
                                        📅 Leave
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setType('RECORDING_REQUEST')}
                                        className={`py-2 text-[10px] font-bold rounded-xl border transition-all ${
                                            type === 'RECORDING_REQUEST'
                                                ? 'bg-blue-500/10 border-blue-500 text-blue-400'
                                                : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                                        }`}
                                    >
                                        📹 Recording
                                    </button>
                                </div>
                            </div>

                            {type === 'COMPLAINT' && (
                                <>
                                    <div>
                                        <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Target Type</label>
                                        <select
                                            value={targetType}
                                            onChange={(e) => setTargetType(e.target.value)}
                                            className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:outline-none"
                                        >
                                            {user?.role === 'ROLE_STUDENT' && (
                                                <>
                                                    <option value="FACULTY">FACULTY MEMBER</option>
                                                    <option value="ADMIN">ADMIN STAFF</option>
                                                </>
                                            )}
                                            {user?.role === 'ROLE_FACULTY' && (
                                                <>
                                                    <option value="STUDENT">STUDENT</option>
                                                    <option value="ADMIN">ADMIN STAFF</option>
                                                </>
                                            )}
                                            {user?.role === 'ROLE_ADMIN' && (
                                                <>
                                                    <option value="FACULTY">FACULTY MEMBER</option>
                                                    <option value="STUDENT">STUDENT</option>
                                                </>
                                            )}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Select Target User *</label>
                                        <select
                                            value={targetUserId}
                                            onChange={(e) => setTargetUserId(e.target.value)}
                                            className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:outline-none"
                                            required
                                        >
                                            <option value="">-- Select Target User --</option>
                                            {targets
                                                .filter(t => t.role === `ROLE_${targetType}`)
                                                .map(t => (
                                                    <option key={t.id} value={t.id}>{t.name}</option>
                                                ))}
                                        </select>
                                    </div>
                                </>
                            )}

                            <div>
                                <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Recipient Higher Authority *</label>
                                <select
                                    value={recipientUserId}
                                    onChange={(e) => setRecipientUserId(e.target.value)}
                                    className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:outline-none"
                                    required
                                >
                                    <option value="">-- Select Recipient --</option>
                                    {filteredRecipients.map(r => (
                                        <option key={r.id} value={r.id}>{r.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Message Description *</label>
                                <textarea
                                    required
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    rows="5"
                                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500 text-white placeholder-slate-650 transition-all text-xs"
                                    placeholder={type === 'COMPLAINT' ? "Describe your issue or grievance..." : type === 'RECORDING_REQUEST' ? "Identify the lecture date/subject to request recordings..." : "Provide explanation for your leave request..."}
                                />
                            </div>

                            <div>
                                <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Optional Attachment</label>
                                <input
                                    id="complaint-file-input"
                                    type="file"
                                    onChange={handleFileChange}
                                    className="w-full text-xs text-slate-400 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-slate-950 file:text-emerald-400 hover:file:bg-slate-800 cursor-pointer"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={submitting}
                                className="w-full py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
                            >
                                {submitting ? (
                                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-950 border-t-transparent"></div>
                                ) : (
                                    'Submit Request'
                                )}
                            </button>
                        </form>
                    </div>
                )}

                {/* List View */}
                <div className={`bg-slate-900 border border-slate-800 p-6 rounded-2xl text-left ${user?.role === 'ROLE_SUPER_ADMIN' ? 'lg:col-span-3' : 'lg:col-span-2'}`}>
                    <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-800 pb-4 mb-6 gap-4">
                        <div>
                            <h3 className="font-bold text-white text-base">History & Inbox Logs</h3>
                            <p className="text-xs text-slate-500 mt-1">Review status updates and decisions regarding complaints & leaves</p>
                        </div>
                        
                        {/* Tab Filter */}
                        <div className="flex flex-wrap gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
                            {['ALL', 'PENDING', 'APPROVED', 'REJECTED', 'RESOLVED'].map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase transition-all ${
                                        activeTab === tab 
                                            ? 'bg-emerald-500 text-slate-950' 
                                            : 'text-slate-400 hover:text-slate-200'
                                    }`}
                                >
                                    {tab}
                                </button>
                            ))}
                        </div>
                    </div>

                    {loading ? (
                        <div className="flex justify-center py-24">
                            <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent"></div>
                        </div>
                    ) : filteredRequests.length === 0 ? (
                        <p className="text-slate-500 text-center py-16 text-sm">No complaints or leave requests found in this tab.</p>
                    ) : (
                        <div className="space-y-4">
                            {filteredRequests.map((req) => (
                                <div key={req.id} className="p-4 bg-slate-950 border border-slate-800/80 rounded-2xl relative overflow-hidden flex flex-col md:flex-row md:items-start justify-between gap-4">
                                    <div className="space-y-2 text-left">
                                        <div className="flex items-center gap-2.5">
                                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase ${
                                                req.type === 'COMPLAINT' 
                                                    ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                                                req.type === 'LEAVE'
                                                    ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                                                    : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                                            }`}>
                                                {req.type ? req.type.replace('_', ' ') : ''}
                                            </span>
                                            
                                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase ${
                                                req.status === 'PENDING' ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20' :
                                                req.status === 'APPROVED' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                                                req.status === 'REJECTED' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                                                'bg-blue-500/10 text-blue-400 border border-blue-500/20' // RESOLVED
                                            }`}>
                                                {req.status}
                                            </span>

                                            <span className="text-[10px] text-slate-500 font-medium">
                                                By: {req.sender.firstName} {req.sender.lastName} ({req.sender.role.substring(5)})
                                            </span>

                                            {req.recipient && (
                                                <span className="text-[10px] text-slate-550 font-medium">
                                                    To: {req.recipient.firstName} {req.recipient.lastName} ({req.recipient.role.substring(5)})
                                                </span>
                                            )}
                                        </div>

                                        {req.type === 'COMPLAINT' && req.targetUser && (
                                            <div className="text-[11px] text-red-400 font-semibold">
                                                Grievance about: {req.targetUser.firstName} {req.targetUser.lastName} ({req.targetType})
                                            </div>
                                        )}

                                        <p className="text-xs text-slate-300 pr-4 mt-1 leading-relaxed">{req.message}</p>

                                        {req.attachmentUrl && (
                                            <div className="pt-2">
                                                <a
                                                    href={`http://localhost:9998/${req.attachmentUrl}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-900 border border-slate-800 rounded-lg text-[10px] font-bold text-emerald-400 hover:bg-slate-800 transition-all"
                                                >
                                                    📁 View Attachment
                                                </a>
                                            </div>
                                        )}

                                        <span className="text-[9px] text-slate-600 block pt-1">
                                            Submitted: {new Date(req.createdAt).toLocaleString()}
                                        </span>
                                    </div>

                                    {/* Recipient / Admin Management Controls */}
                                    {canManageRequest(req) && req.status === 'PENDING' && (
                                        <div className="flex flex-wrap md:flex-col gap-2 justify-end pt-2 md:pt-0">
                                            {req.type === 'LEAVE' ? (
                                                <>
                                                    <button
                                                        onClick={() => handleUpdateStatus(req.id, 'APPROVED')}
                                                        className="px-3 py-1.5 bg-emerald-500 text-slate-950 font-extrabold text-[10px] rounded-lg hover:bg-emerald-400 transition-colors"
                                                    >
                                                        Approve Leave
                                                    </button>
                                                    <button
                                                        onClick={() => handleUpdateStatus(req.id, 'REJECTED')}
                                                        className="px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/35 font-extrabold text-[10px] rounded-lg transition-colors"
                                                    >
                                                        Reject Leave
                                                    </button>
                                                </>
                                            ) : req.type === 'RECORDING_REQUEST' ? (
                                                <>
                                                    <button
                                                        onClick={() => handleUpdateStatus(req.id, 'APPROVED')}
                                                        className="px-3 py-1.5 bg-emerald-500 text-slate-950 font-extrabold text-[10px] rounded-lg hover:bg-emerald-400 transition-colors"
                                                    >
                                                        Approve Request
                                                    </button>
                                                    <button
                                                        onClick={() => handleUpdateStatus(req.id, 'REJECTED')}
                                                        className="px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/35 font-extrabold text-[10px] rounded-lg transition-colors"
                                                    >
                                                        Reject Request
                                                    </button>
                                                </>
                                            ) : (
                                                <>
                                                    <button
                                                        onClick={() => handleUpdateStatus(req.id, 'RESOLVED')}
                                                        className="px-3 py-1.5 bg-blue-500 text-white font-extrabold text-[10px] rounded-lg hover:bg-blue-400 transition-colors"
                                                    >
                                                        Mark Resolved
                                                    </button>
                                                    <button
                                                        onClick={() => handleUpdateStatus(req.id, 'REJECTED')}
                                                        className="px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/35 font-extrabold text-[10px] rounded-lg transition-colors"
                                                    >
                                                        Dismiss Grievance
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
};

export default ComplaintLeavePortal;
