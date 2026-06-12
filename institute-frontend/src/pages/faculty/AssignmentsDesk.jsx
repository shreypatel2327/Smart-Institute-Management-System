import React, { useEffect, useState } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import { api } from '../../context/AuthContext';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const AssignmentsDesk = () => {
    const [assignments, setAssignments] = useState([]);
    const [batches, setBatches] = useState([]);
    const [submissions, setSubmissions] = useState([]);
    const [selectedAssignment, setSelectedAssignment] = useState(null);
    const [gradingSubmission, setGradingSubmission] = useState(null);
    const [loading, setLoading] = useState(true);

    // Form inputs
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [deadline, setDeadline] = useState('');
    const [selectedBatchId, setSelectedBatchId] = useState('');
    const [file, setFile] = useState(null);
    const [creating, setCreating] = useState(false);

    // Grading inputs
    const [grade, setGrade] = useState('A+');
    const [feedback, setFeedback] = useState('');
    const [submittingGrade, setSubmittingGrade] = useState(false);

    useEffect(() => {
        const loadPageData = async () => {
            try {
                const asgs = await api.get('/api/faculties/assignments');
                setAssignments(asgs.data);

                const bts = await api.get('/api/faculties/batches');
                setBatches(bts.data);
            } catch (error) {
                console.error('Error loading assignments data', error);
            } finally {
                setLoading(false);
            }
        };

        loadPageData();
    }, []);

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleCreateAssignment = async (e) => {
        e.preventDefault();
        if (!selectedBatchId) {
            toast.error("Please pick a target batch.");
            return;
        }

        setCreating(true);
        const formData = new FormData();
        formData.append('title', title);
        formData.append('description', description);
        formData.append('deadline', deadline + ":00"); // ISO datetime compatibility
        formData.append('batchId', selectedBatchId);
        if (file) {
            formData.append('file', file);
        }

        try {
            const res = await api.post('/api/faculties/assignments', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setAssignments([res.data, ...assignments]);
            toast.success("Assignment published successfully!");
            // Reset
            setTitle('');
            setDescription('');
            setDeadline('');
            setFile(null);
        } catch (error) {
            toast.error("Error creating assignment: " + (error.response?.data?.message || error.message));
        } finally {
            setCreating(false);
        }
    };

    const handleViewSubmissions = async (asg) => {
        setSelectedAssignment(asg);
        setLoading(true);
        try {
            const res = await api.get(`/api/faculties/assignments/${asg.id}/submissions`);
            setSubmissions(res.data);
        } catch (error) {
            toast.error("Error loading submissions: " + (error.response?.data || error.message));
        } finally {
            setLoading(false);
        }
    };

    const handleSubmitGrade = async (e) => {
        e.preventDefault();
        setSubmittingGrade(true);
        try {
            const res = await api.put(`/api/faculties/submissions/${gradingSubmission.id}/grade?grade=${grade}&feedback=${feedback}`);
            setSubmissions(submissions.map(s => s.id === gradingSubmission.id ? res.data : s));
            toast.success("Submission graded successfully!");
            setGradingSubmission(null);
            setFeedback('');
        } catch (error) {
            toast.error("Error submitting grade: " + (error.response?.data || error.message));
        } finally {
            setSubmittingGrade(false);
        }
    };

    return (
        <DashboardLayout title="Faculty Assignments Control Desk">
            <ToastContainer theme="dark" />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left: Create Assignment Form */}
                <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl text-left h-fit">
                    <div className="border-b border-slate-800 pb-4 mb-6">
                        <h3 className="font-bold text-white text-base">Assign Homework</h3>
                        <p className="text-xs text-slate-500 mt-1">Distribute worksheets, timelines, and files to batches</p>
                    </div>

                    <form onSubmit={handleCreateAssignment} className="space-y-4">
                        <div>
                            <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Assignment Title *</label>
                            <input
                                type="text"
                                required
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500 text-white placeholder-slate-650 transition-all text-xs"
                                placeholder="e.g. Build REST endpoints using JPA"
                            />
                        </div>

                        <div>
                            <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Instructions / Tasks</label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                rows="3"
                                className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500 text-white placeholder-slate-650 transition-all text-xs"
                                placeholder="Describe expectations or code structure..."
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
                                <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Deadline Date *</label>
                                <input
                                    type="datetime-local"
                                    required
                                    value={deadline}
                                    onChange={(e) => setDeadline(e.target.value)}
                                    className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Attach Guide/Criteria File</label>
                            <input
                                type="file"
                                onChange={handleFileChange}
                                className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-slate-950 file:text-emerald-400 file:border-slate-800 hover:file:bg-slate-850 cursor-pointer"
                            />
                        </div>

                        <div className="pt-4 border-t border-slate-800/80">
                            <button
                                type="submit"
                                disabled={creating}
                                className="w-full py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg transition-all"
                            >
                                {creating ? 'Publishing homework...' : 'Publish Assignment'}
                            </button>
                        </div>
                    </form>
                </div>

                {/* Right: Assignments List & Submissions desk */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Upper pane: published list */}
                    <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl text-left">
                        <h3 className="font-bold text-white text-base mb-4">Published Assignments</h3>
                        {assignments.length === 0 ? (
                            <p className="text-slate-500 text-xs py-4">No assignments published yet.</p>
                        ) : (
                            <div className="space-y-3">
                                {assignments.map(asg => (
                                    <div
                                        key={asg.id}
                                        onClick={() => handleViewSubmissions(asg)}
                                        className={`p-4 border rounded-xl cursor-pointer transition-all flex items-center justify-between ${selectedAssignment?.id === asg.id
                                                ? 'bg-emerald-950/10 border-emerald-800'
                                                : 'bg-slate-950 hover:bg-slate-800/25 border-slate-800/60'
                                            }`}
                                    >
                                        <div>
                                            <h4 className="font-bold text-white text-sm">{asg.title}</h4>
                                            <p className="text-xs text-slate-400 mt-1">Batch: {asg.batch.name}</p>
                                            <span className="text-[10px] text-slate-500">
                                                Due: {new Date(asg.deadline).toLocaleString()}
                                            </span>
                                        </div>
                                        <span className="text-xs font-bold text-emerald-400">View submissions →</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Lower pane: submissions list */}
                    {selectedAssignment && (
                        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl text-left">
                            <h3 className="font-bold text-white text-base mb-4">
                                Student Submissions for: <span className="text-emerald-400">{selectedAssignment.title}</span>
                            </h3>

                            {submissions.length === 0 ? (
                                <p className="text-slate-500 text-xs py-4">No solutions submitted by students yet.</p>
                            ) : (
                                <div className="space-y-4">
                                    {submissions.map(sub => (
                                        <div key={sub.id} className="p-4 bg-slate-950 border border-slate-800/80 rounded-xl flex items-center justify-between gap-6">
                                            <div className="space-y-1">
                                                <h4 className="font-bold text-white text-xs">
                                                    {sub.student.user.firstName} {sub.student.user.lastName} ({sub.student.rollNumber})
                                                </h4>
                                                {sub.contentText && (
                                                    <p className="text-xs text-slate-400 font-mono bg-slate-900 p-2 rounded border border-slate-800/80 max-w-lg mt-1">
                                                        {sub.contentText}
                                                    </p>
                                                )}
                                                <div className="text-[10px] text-slate-500 flex items-center gap-3">
                                                    <span>Submitted: {new Date(sub.submissionDate).toLocaleString()}</span>
                                                    {sub.grade && (
                                                        <span className="bg-slate-900 px-2 py-0.5 border border-slate-800 text-emerald-400 font-bold rounded">
                                                            Grade: {sub.grade}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="flex gap-2">
                                                {sub.filePath && (
                                                    <a
                                                        href={`http://localhost:9998/${sub.filePath}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 text-xs font-semibold rounded-lg transition-colors"
                                                    >
                                                        Download Solution File
                                                    </a>
                                                )}
                                                <button
                                                    onClick={() => setGradingSubmission(sub)}
                                                    className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold rounded-lg transition-colors"
                                                >
                                                    Grade Task
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Grading Modal Overlay */}
            {gradingSubmission && (
                <div className="fixed inset-0 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
                    <div className="bg-slate-900 border border-slate-800 max-w-md w-full p-6 rounded-2xl space-y-4 text-left relative">
                        <button
                            onClick={() => setGradingSubmission(null)}
                            className="absolute top-4 right-4 text-slate-500 hover:text-white text-lg"
                        >
                            ✕
                        </button>
                        <div>
                            <h3 className="font-bold text-white text-base">Record Submission Grade</h3>
                            <p className="text-xs text-slate-400 mt-1">
                                Student: {gradingSubmission.student.user.firstName} {gradingSubmission.student.user.lastName}
                            </p>
                        </div>

                        <form onSubmit={handleSubmitGrade} className="space-y-4">
                            <div>
                                <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Select Grade Score *</label>
                                <select
                                    value={grade}
                                    onChange={(e) => setGrade(e.target.value)}
                                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs"
                                >
                                    <option value="A+">A+ (Outstanding)</option>
                                    <option value="A">A (Excellent)</option>
                                    <option value="B">B (Good)</option>
                                    <option value="C">C (Pass)</option>
                                    <option value="Fail">Fail (Unsatisfactory)</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Remarks / Feedback comments</label>
                                <textarea
                                    value={feedback}
                                    onChange={(e) => setFeedback(e.target.value)}
                                    rows="3"
                                    className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500 text-white placeholder-slate-650 text-xs"
                                    placeholder="Write details about what is good or needs improvement..."
                                />
                            </div>

                            <div className="flex justify-end gap-3 pt-4 border-t border-slate-800/80">
                                <button
                                    type="button"
                                    onClick={() => setGradingSubmission(null)}
                                    className="px-4 py-2 bg-slate-950 hover:bg-slate-850 text-slate-400 text-xs font-semibold rounded-lg border border-slate-800"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={submittingGrade}
                                    className="px-5 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold rounded-lg transition-colors flex items-center gap-2"
                                >
                                    {submittingGrade ? (
                                        <div className="h-3 w-3 animate-spin rounded-full border-2 border-slate-950 border-t-transparent"></div>
                                    ) : (
                                        'Save Grade Record'
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
};

export default AssignmentsDesk;
