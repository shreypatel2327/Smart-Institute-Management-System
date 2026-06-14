import React, { useEffect, useState } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import { api } from '../../context/AuthContext';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Link } from 'react-router-dom';

const ScheduleClass = () => {
    const [classes, setClasses] = useState([]);
    const [batches, setBatches] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [loading, setLoading] = useState(true);

    // Form inputs
    const [title, setTitle] = useState('');
    const [selectedBatchId, setSelectedBatchId] = useState('');
    const [selectedSubjectId, setSelectedSubjectId] = useState('');
    const [scheduledTime, setScheduledTime] = useState('');
    const [durationMinutes, setDurationMinutes] = useState(60);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        const loadPageData = async () => {
            try {
                const cls = await api.get('/api/faculties/online-classes');
                setClasses(cls.data);

                const bts = await api.get('/api/faculties/batches');
                setBatches(bts.data);

                const subs = await api.get('/api/faculties/subjects');
                setSubjects(subs.data);
            } catch (error) {
                console.error('Error loading online class resources', error);
            } finally {
                setLoading(false);
            }
        };

        loadPageData();
    }, []);

    const handleCreateClass = async (e) => {
        e.preventDefault();
        if (!selectedBatchId || !selectedSubjectId) {
            toast.error("Please pick a valid batch and subject.");
            return;
        }

        setSubmitting(true);
        try {
            const classPayload = {
                title,
                batch: { id: parseInt(selectedBatchId) },
                subject: { id: parseInt(selectedSubjectId) },
                scheduledTime,
                durationMinutes: parseInt(durationMinutes)
            };

            const response = await api.post('/api/faculties/online-classes', classPayload);
            setClasses([response.data, ...classes]);
            toast.success("Online Jitsi class room created!");
            // Reset
            setTitle('');
            setScheduledTime('');
        } catch (error) {
            toast.error("Error creating online class: " + (error.response?.data?.message || error.message));
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <DashboardLayout title="Faculty Live Classes Console">
            <ToastContainer theme="dark" />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Form */}
                <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl text-left h-fit">
                    <div className="border-b border-slate-800 pb-4 mb-6">
                        <h3 className="font-bold text-white text-base">Schedule Jitsi Class</h3>
                        <p className="text-xs text-slate-500 mt-1">Generate dynamic virtual meeting rooms for batches</p>
                    </div>

                    <form onSubmit={handleCreateClass} className="space-y-4">
                        <div>
                            <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Class Title *</label>
                            <input
                                type="text"
                                required
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500 text-white placeholder-slate-650 transition-all text-xs"
                                placeholder="e.g. Session 6 Live Doubt Solving"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Target Batch *</label>
                                <select
                                    required
                                    value={selectedBatchId}
                                    onChange={(e) => setSelectedBatchId(e.target.value)}
                                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500"
                                >
                                    <option value="">Select Batch</option>
                                    {batches.map(b => (
                                        <option key={b.id} value={b.id}>{b.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Subject Topic *</label>
                                <select
                                    required
                                    value={selectedSubjectId}
                                    onChange={(e) => setSelectedSubjectId(e.target.value)}
                                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500"
                                >
                                    <option value="">Select Subject</option>
                                    {subjects.map(s => (
                                        <option key={s.id} value={s.id}>{s.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Scheduled Date/Time *</label>
                                <input
                                    type="datetime-local"
                                    required
                                    value={scheduledTime}
                                    onChange={(e) => setScheduledTime(e.target.value)}
                                    className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Duration (mins) *</label>
                                <input
                                    type="number"
                                    required
                                    value={durationMinutes}
                                    onChange={(e) => setDurationMinutes(e.target.value)}
                                    className="w-full px-4 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs"
                                />
                            </div>
                        </div>

                        <div className="pt-4 border-t border-slate-800/80">
                            <button
                                type="submit"
                                disabled={submitting}
                                className="w-full py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg transition-all"
                            >
                                {submitting ? 'Generating room...' : 'Schedule live class'}
                            </button>
                        </div>
                    </form>
                </div>

                {/* Right Lists */}
                <div className="lg:col-span-2 bg-slate-900 border border-slate-800 p-6 rounded-2xl">
                    <div className="border-b border-slate-800 pb-4 mb-6 text-left">
                        <h3 className="font-bold text-white text-base">Your Live Lectures</h3>
                        <p className="text-xs text-slate-500 mt-1">Host or invite students to Jitsi meeting classrooms</p>
                    </div>

                    {loading ? (
                        <div className="flex justify-center py-12">
                            <div className="h-6 w-6 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent"></div>
                        </div>
                    ) : classes.length === 0 ? (
                        <div className="text-center py-12 text-slate-500 text-sm">
                            No virtual classes scheduled. Create one on the left panel.
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {classes.map((item) => (
                                <div key={item.id} className="p-4 bg-slate-950 border border-slate-800/80 rounded-xl flex flex-col sm:flex-row justify-between sm:items-center gap-4 text-left">
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-[10px] bg-slate-900 border border-slate-800 text-slate-400 px-2 py-0.5 rounded font-bold uppercase">
                                                {item.status || 'UPCOMING'}
                                            </span>
                                            <h4 className="font-bold text-white text-sm">{item.title}</h4>
                                        </div>
                                        <p className="text-xs text-slate-400 mt-1">
                                            Batch: {item.batch.name} | Subject: {item.subject.name}
                                        </p>
                                        <span className="text-[10px] text-slate-550">
                                            Starts: {new Date(item.scheduledTime).toLocaleString()} | Duration: {item.durationMinutes} mins
                                        </span>
                                    </div>

                                    <div>
                                        <Link
                                            to={`/shared/online-classroom?meetingId=${item.meetingId}&title=${encodeURIComponent(item.title)}`}
                                            className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 animate-pulse"
                                        >
                                            🚀 Start Classroom
                                        </Link>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
};

export default ScheduleClass;
