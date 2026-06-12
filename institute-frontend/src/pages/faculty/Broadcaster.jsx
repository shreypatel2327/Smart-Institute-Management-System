import React, { useEffect, useState } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import { api } from '../../context/AuthContext';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Broadcaster = () => {
    const [batches, setBatches] = useState([]);
    const [loading, setLoading] = useState(true);

    // Form inputs
    const [title, setTitle] = useState('');
    const [message, setMessage] = useState('');
    const [selectedBatchId, setSelectedBatchId] = useState('');
    const [broadcasting, setBroadcasting] = useState(false);

    useEffect(() => {
        api.get('/api/faculties/batches')
            .then(res => setBatches(res.data))
            .catch(err => console.error('Error fetching batches', err))
            .finally(() => setLoading(false));
    }, []);

    const handleBroadcast = async (e) => {
        e.preventDefault();
        setBroadcasting(true);
        try {
            const params = new URLSearchParams();
            params.append('title', title);
            params.append('message', message);
            if (selectedBatchId) {
                params.append('batchId', selectedBatchId);
            }

            await api.post('/api/faculties/notifications', params, {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            });
            toast.success("Announcement broadcasted successfully!");
            // Reset
            setTitle('');
            setMessage('');
            setSelectedBatchId('');
        } catch (error) {
            toast.error("Error sending announcement: " + (error.response?.data?.message || error.message));
        } finally {
            setBroadcasting(false);
        }
    };

    return (
        <DashboardLayout title="Notice Broadcaster Desk">
            <ToastContainer theme="dark" />
            <div className="max-w-xl mx-auto bg-slate-900 border border-slate-800 p-6 rounded-2xl">
                <div className="border-b border-slate-800 pb-4 mb-6 text-left">
                    <h3 className="text-base font-bold text-white">Broadcast Announcement</h3>
                    <p className="text-xs text-slate-500 mt-1">Post instant alerts or notice boards to students' dashboards</p>
                </div>

                {loading ? (
                    <div className="flex justify-center py-12">
                        <div className="h-6 w-6 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent"></div>
                    </div>
                ) : (
                    <form onSubmit={handleBroadcast} className="space-y-4 text-left">
                        <div>
                            <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Notice Title *</label>
                            <input
                                type="text"
                                required
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500 text-white placeholder-slate-650 transition-all text-xs"
                                placeholder="e.g. Schedule Change or Homework Alert"
                            />
                        </div>

                        <div>
                            <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Bulletin Message *</label>
                            <textarea
                                required
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                rows="5"
                                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500 text-white placeholder-slate-650 transition-all text-xs"
                                placeholder="Type notice content details..."
                            />
                        </div>

                        <div>
                            <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Target Recipient Group</label>
                            <select
                                value={selectedBatchId}
                                onChange={(e) => setSelectedBatchId(e.target.value)}
                                className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:outline-none"
                            >
                                <option value="">All Students (Generic Broadcast)</option>
                                {batches.map(b => (
                                    <option key={b.id} value={b.id}>Batch: {b.name}</option>
                                ))}
                            </select>
                        </div>

                        <div className="pt-4 border-t border-slate-800/80">
                            <button
                                type="submit"
                                disabled={broadcasting}
                                className="w-full py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
                            >
                                {broadcasting ? (
                                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-950 border-t-transparent"></div>
                                ) : (
                                    'Broadcast Alert Now'
                                )}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </DashboardLayout>
    );
};

export default Broadcaster;
