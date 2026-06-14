import React, { useEffect, useState } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import { api, useAuth } from '../../context/AuthContext';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const EnhancedBroadcaster = () => {
    const { user } = useAuth();
    const [batches, setBatches] = useState([]);
    const [targets, setTargets] = useState([]);
    const [pastNotifs, setPastNotifs] = useState([]);
    const [loading, setLoading] = useState(true);

    // Compose form states
    const [title, setTitle] = useState('');
    const [message, setMessage] = useState('');
    const [targetType, setTargetType] = useState('ALL'); // ALL, BATCH, ROLE, USERS
    const [roleStr, setRoleStr] = useState('student'); // student, faculty, admin
    const [batchId, setBatchId] = useState('');
    const [selectedUsers, setSelectedUsers] = useState([]); // List of user IDs
    const [file, setFile] = useState(null);
    const [attachmentTypeInput, setAttachmentTypeInput] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const fetchBatchesAndTargets = async () => {
        try {
            if (user?.role !== 'ROLE_STUDENT') {
                // Fetch batches
                const bRes = await api.get((user?.role === 'ROLE_ADMIN' || user?.role === 'ROLE_SUPER_ADMIN') ? '/api/admins/batches' : '/api/faculties/batches');
                setBatches(bRes.data);
                if (bRes.data.length > 0) setBatchId(bRes.data[0].id);
            }

            // Fetch target users list
            const tRes = await api.get('/api/complaints-leaves/targets');
            setTargets(tRes.data);
        } catch (err) {
            console.error('Error fetching list targets:', err);
        }
    };

    const fetchPastAnnouncements = async () => {
        try {
            const res = await api.get('/api/notifications/sent');
            setPastNotifs(res.data);
        } catch (err) {
            console.error('Error fetching sent notifications:', err);
        }
    };

    useEffect(() => {
        if (user) {
            if (user.role === 'ROLE_STUDENT') {
                setTargetType('USERS');
            } else if (user.role === 'ROLE_SUPER_ADMIN') {
                setTargetType('ALL');
            } else {
                setTargetType('BATCH');
            }
            Promise.all([
                fetchBatchesAndTargets(),
                fetchPastAnnouncements()
            ]).finally(() => setLoading(false));
        }
    }, [user]);

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleUserToggle = (id) => {
        setSelectedUsers(prev => {
            if (prev.includes(id)) {
                return prev.filter(uid => uid !== id);
            } else {
                return [...prev, id];
            }
        });
    };

    const handleBroadcastSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            const formData = new FormData();
            formData.append('title', title);
            formData.append('message', message);
            formData.append('targetType', targetType);
            
            if (targetType === 'BATCH') {
                formData.append('batchId', batchId);
            } else if (targetType === 'ROLE') {
                formData.append('roleStr', roleStr);
            } else if (targetType === 'USERS') {
                formData.append('userIds', selectedUsers.join(','));
            }

            if (file) {
                formData.append('file', file);
            }
            if (attachmentTypeInput) {
                formData.append('attachmentType', attachmentTypeInput);
            }

            await api.post('/api/notifications', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            toast.success('Notice broadcasted successfully!');
            setTitle('');
            setMessage('');
            setFile(null);
            setSelectedUsers([]);
            document.getElementById('broadcaster-file-input').value = '';
            
            fetchPastAnnouncements();
        } catch (err) {
            console.error('Error sending announcement:', err);
            toast.error(err.response?.data?.message || 'Failed to broadcast announcement.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <DashboardLayout title="Notice & Message Broadcaster">
            <ToastContainer theme="dark" />

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                {/* Compose Form */}
                <div className="lg:col-span-2 bg-slate-900 border border-slate-800 p-6 rounded-2xl text-left h-fit">
                    <h3 className="font-bold text-white text-base border-b border-slate-800 pb-3 mb-5">
                        Compose Announcement
                    </h3>

                    <form onSubmit={handleBroadcastSubmit} className="space-y-4">
                        <div>
                            <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Recipient Category *</label>
                             <select
                                value={targetType}
                                onChange={(e) => setTargetType(e.target.value)}
                                className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:outline-none"
                            >
                                {user?.role === 'ROLE_SUPER_ADMIN' && <option value="ALL">All Users (Global Notice)</option>}
                                {user?.role !== 'ROLE_STUDENT' && <option value="BATCH">Specific Student Batch</option>}
                                {user?.role !== 'ROLE_STUDENT' && <option value="ROLE">Specific Portal Role</option>}
                                <option value="USERS">Multiple Select Users</option>
                            </select>
                        </div>

                        {targetType === 'BATCH' && (
                            <div>
                                <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Target Student Batch</label>
                                <select
                                    value={batchId}
                                    onChange={(e) => setBatchId(e.target.value)}
                                    className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:outline-none"
                                >
                                    {batches.map(b => (
                                        <option key={b.id} value={b.id}>{b.name}</option>
                                    ))}
                                </select>
                            </div>
                        )}

                        {targetType === 'ROLE' && (
                            <div>
                                <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Target Role</label>
                                <select
                                    value={roleStr}
                                    onChange={(e) => setRoleStr(e.target.value)}
                                    className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:outline-none"
                                >
                                    <option value="student">STUDENTS</option>
                                    <option value="faculty">FACULTY</option>
                                    <option value="admin">ADMIN STAFF</option>
                                </select>
                            </div>
                        )}

                        {targetType === 'USERS' && (
                            <div>
                                <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Select Target Users *</label>
                                <div className="max-h-36 overflow-y-auto border border-slate-800 rounded-xl bg-slate-950 p-2 space-y-1">
                                    {targets
                                        .filter(t => user?.role !== 'ROLE_STUDENT' || ['ROLE_FACULTY', 'ROLE_ADMIN', 'ROLE_SUPER_ADMIN'].includes(t.role))
                                        .map(t => (
                                            <label key={t.id} className="flex items-center gap-2 px-2 py-1 hover:bg-slate-900 rounded-lg cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedUsers.includes(t.id)}
                                                    onChange={() => handleUserToggle(t.id)}
                                                    className="accent-emerald-500"
                                                />
                                                <span className="text-[11px] text-slate-350">{t.name}</span>
                                            </label>
                                        ))}
                                </div>
                            </div>
                        )}

                        <div>
                            <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Title / Subject *</label>
                            <input
                                type="text"
                                required
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500 text-white placeholder-slate-650 transition-all text-xs"
                                placeholder="Alert or Bulletin Subject Title..."
                            />
                        </div>

                        <div>
                            <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Bulletin Message *</label>
                            <textarea
                                required
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                rows="4"
                                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500 text-white placeholder-slate-650 transition-all text-xs"
                                placeholder="Compose details here..."
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Attachment File</label>
                                <input
                                    id="broadcaster-file-input"
                                    type="file"
                                    onChange={handleFileChange}
                                    className="w-full text-[10px] text-slate-400 file:mr-2 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-[10px] file:bg-slate-950 file:text-emerald-400 hover:file:bg-slate-800 cursor-pointer"
                                />
                            </div>

                            <div>
                                <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Attachment Type</label>
                                <select
                                    value={attachmentTypeInput}
                                    onChange={(e) => setAttachmentTypeInput(e.target.value)}
                                    className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-[11px] focus:outline-none"
                                >
                                    <option value="">Auto-Detect</option>
                                    <option value="IMAGE">IMAGE</option>
                                    <option value="AUDIO">AUDIO CLIP</option>
                                    <option value="VIDEO">VIDEO CLIP</option>
                                    <option value="PDF">PDF MANUAL</option>
                                    <option value="FILE">GENERIC FILE</option>
                                </select>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={submitting}
                            className="w-full py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg transition-all"
                        >
                            {submitting ? 'Broadcasting notice...' : 'Broadcast Announcement'}
                        </button>
                    </form>
                </div>

                {/* Sent history & feed */}
                <div className="lg:col-span-3 bg-slate-900 border border-slate-800 p-6 rounded-2xl text-left flex flex-col h-[650px]">
                    <div className="border-b border-slate-800 pb-3 mb-5">
                        <h3 className="font-bold text-white text-base">Broadcast Logs</h3>
                        <p className="text-xs text-slate-500 mt-1">Review and manage past announcements you composed</p>
                    </div>

                    {loading ? (
                        <div className="flex-1 flex items-center justify-center">
                            <div className="h-6 w-6 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent"></div>
                        </div>
                    ) : pastNotifs.length === 0 ? (
                        <div className="flex-1 flex items-center justify-center text-slate-500 py-16 text-xs text-center">
                            No notifications posted yet.
                        </div>
                    ) : (
                        <div className="flex-1 overflow-y-auto space-y-4 pr-1">
                            {pastNotifs.map(notif => (
                                <div key={notif.id} className="p-4 bg-slate-950 border border-slate-850 rounded-xl space-y-2">
                                    <div className="flex items-center justify-between">
                                        <h4 className="font-bold text-white text-xs">{notif.title}</h4>
                                        <span className="text-[9px] text-slate-650 font-medium">
                                            {new Date(notif.createdAt).toLocaleString()}
                                        </span>
                                    </div>
                                    <p className="text-[11px] text-slate-400 leading-relaxed whitespace-pre-wrap">{notif.message}</p>

                                    {/* Advanced Attachment Playback/Preview */}
                                    {notif.attachmentUrl && (
                                        <div className="mt-3 p-3 bg-slate-900/50 border border-slate-850 rounded-xl space-y-2">
                                            <div className="flex items-center gap-1.5">
                                                <span className="text-[9px] font-extrabold uppercase text-emerald-400 px-1.5 py-0.5 rounded bg-emerald-950/20 border border-emerald-900">
                                                    {notif.attachmentType || 'Attachment'}
                                                </span>
                                                <a
                                                    href={`http://localhost:9998/${notif.attachmentUrl}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-[10px] text-slate-400 hover:text-emerald-400 font-semibold truncate hover:underline"
                                                >
                                                    {notif.attachmentUrl.substring(notif.attachmentUrl.lastIndexOf('/') + 1)}
                                                </a>
                                            </div>

                                            {/* Media Previews */}
                                            {notif.attachmentType === 'IMAGE' && (
                                                <img
                                                    src={`http://localhost:9998/${notif.attachmentUrl}`}
                                                    alt="Notice Attachment"
                                                    className="max-h-40 rounded-lg border border-slate-850 object-cover mt-2"
                                                />
                                            )}

                                            {notif.attachmentType === 'AUDIO' && (
                                                <audio
                                                    controls
                                                    src={`http://localhost:9998/${notif.attachmentUrl}`}
                                                    className="w-full mt-2"
                                                />
                                            )}

                                            {notif.attachmentType === 'VIDEO' && (
                                                <video
                                                    controls
                                                    src={`http://localhost:9998/${notif.attachmentUrl}`}
                                                    className="max-h-48 rounded-lg border border-slate-850 w-full object-contain mt-2 bg-black"
                                                />
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

export default EnhancedBroadcaster;
