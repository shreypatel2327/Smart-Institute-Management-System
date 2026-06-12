import React, { useEffect, useState } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import { api } from '../../context/AuthContext';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const ManageLectures = () => {
    const [lectures, setLectures] = useState([]);
    const [batches, setBatches] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [loading, setLoading] = useState(true);

    // Form inputs
    const [title, setTitle] = useState('');
    const [date, setDate] = useState('');
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');
    const [selectedBatchId, setSelectedBatchId] = useState('');
    const [selectedSubjectId, setSelectedSubjectId] = useState('');
    const [scheduling, setScheduling] = useState(false);

    useEffect(() => {
        const loadPageData = async () => {
            try {
                const lects = await api.get('/api/faculties/lectures');
                setLectures(lects.data);

                const bts = await api.get('/api/faculties/batches');
                setBatches(bts.data);

                const subs = await api.get('/api/faculties/subjects');
                setSubjects(subs.data);
            } catch (error) {
                console.error('Error loading page components', error);
            } finally {
                setLoading(false);
            }
        };

        loadPageData();
    }, []);

    const handleCreateLecture = async (e) => {
        e.preventDefault();
        if (!selectedBatchId || !selectedSubjectId) {
            toast.error("Please pick a valid batch and subject.");
            return;
        }

        setScheduling(true);
        try {
            const lecturePayload = {
                title,
                date,
                startTime: startTime + ":00", // Ensure HH:mm:ss format for Java LocalTime parser
                endTime: endTime + ":00",
                batch: { id: parseInt(selectedBatchId) },
                subject: { id: parseInt(selectedSubjectId) }
            };

            const response = await api.post('/api/faculties/lectures', lecturePayload);
            setLectures([response.data, ...lectures]);
            toast.success("Lecture scheduled successfully!");
            // Reset
            setTitle('');
            setDate('');
            setStartTime('');
            setEndTime('');
        } catch (error) {
            toast.error("Error scheduling lecture: " + (error.response?.data?.message || error.message));
        } finally {
            setScheduling(false);
        }
    };

    const updateStatus = async (id, newStatus) => {
        try {
            const res = await api.put(`/api/faculties/lectures/${id}?status=${newStatus}`);
            setLectures(lectures.map(l => l.id === id ? res.data : l));
            toast.success(`Lecture marked as ${newStatus}`);
        } catch (error) {
            toast.error("Error updating status: " + (error.response?.data || error.message));
        }
    };

    return (
        <DashboardLayout title="Faculty Lecture Planner">
            <ToastContainer theme="dark" />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left: Schedule Form */}
                <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl text-left h-fit">
                    <div className="border-b border-slate-800 pb-4 mb-6">
                        <h3 className="font-bold text-white text-base">Schedule New Class</h3>
                        <p className="text-xs text-slate-500 mt-1">Assign date, timings, and topics to batches</p>
                    </div>

                    <form onSubmit={handleCreateLecture} className="space-y-4">
                        <div>
                            <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Lecture Title *</label>
                            <input
                                type="text"
                                required
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500 text-white placeholder-slate-600 transition-all text-xs"
                                placeholder="e.g. Intro to JPA Mapping"
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
                                <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Course Subject *</label>
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

                        <div>
                            <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Lecture Date *</label>
                            <input
                                type="date"
                                required
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500 text-white text-xs"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Start Time *</label>
                                <input
                                    type="time"
                                    required
                                    value={startTime}
                                    onChange={(e) => setStartTime(e.target.value)}
                                    className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500 text-white text-xs"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">End Time *</label>
                                <input
                                    type="time"
                                    required
                                    value={endTime}
                                    onChange={(e) => setEndTime(e.target.value)}
                                    className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500 text-white text-xs"
                                />
                            </div>
                        </div>

                        <div className="pt-4">
                            <button
                                type="submit"
                                disabled={scheduling}
                                className="w-full py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg transition-all"
                            >
                                {scheduling ? 'Scheduling class...' : 'Save Lecture Schedule'}
                            </button>
                        </div>
                    </form>
                </div>

                {/* Right: Lectures List & Control */}
                <div className="lg:col-span-2 bg-slate-900 border border-slate-800 p-6 rounded-2xl">
                    <div className="border-b border-slate-800 pb-4 mb-6 text-left">
                        <h3 className="font-bold text-white text-base">Your Schedules</h3>
                        <p className="text-xs text-slate-500 mt-1">Start, end, or edit lecture logs</p>
                    </div>

                    {loading ? (
                        <div className="flex justify-center py-12">
                            <div className="h-6 w-6 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent"></div>
                        </div>
                    ) : lectures.length === 0 ? (
                        <div className="text-center py-12 text-slate-500 text-sm">
                            No lecture sessions planned. Create one on the left pane.
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {lectures.map((item) => (
                                <div key={item.id} className="p-4 bg-slate-950 border border-slate-800/80 rounded-xl flex flex-col sm:flex-row justify-between sm:items-center gap-4 text-left">
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className={`text-[9px] font-bold px-2 py-0.5 rounded border ${
                                                item.status === 'COMPLETED'
                                                    ? 'bg-slate-900 border-slate-800 text-slate-400'
                                                    : item.status === 'ACTIVE'
                                                    ? 'bg-emerald-950/20 border-emerald-900 text-emerald-400'
                                                    : 'bg-slate-900 border-slate-800 text-amber-400'
                                            }`}>
                                                {item.status}
                                            </span>
                                            <h4 className="font-semibold text-white text-sm">{item.title}</h4>
                                        </div>
                                        <p className="text-xs text-slate-400 mt-1">
                                            Batch: {item.batch.name} | Subject: {item.subject.name}
                                        </p>
                                        <span className="text-[10px] text-slate-500">
                                            Schedule: {item.date} ({item.startTime} - {item.endTime})
                                        </span>
                                    </div>

                                    {item.status !== 'COMPLETED' && (
                                        <div className="flex gap-2">
                                            {item.status === 'SCHEDULED' && (
                                                <button
                                                    onClick={() => updateStatus(item.id, 'ACTIVE')}
                                                    className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold rounded-lg transition-colors"
                                                >
                                                    Start Class
                                                </button>
                                            )}
                                            {item.status === 'ACTIVE' && (
                                                <button
                                                    onClick={() => updateStatus(item.id, 'COMPLETED')}
                                                    className="px-3 py-1.5 bg-indigo-500 hover:bg-indigo-400 text-white text-xs font-semibold rounded-lg transition-colors"
                                                >
                                                    End Class
                                                </button>
                                            )}
                                            <button
                                                onClick={() => updateStatus(item.id, 'CANCELLED')}
                                                className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-rose-400 text-xs font-semibold rounded-lg transition-colors"
                                            >
                                                Cancel
                                            </button>
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

export default ManageLectures;
