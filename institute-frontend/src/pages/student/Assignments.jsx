import React, { useEffect, useState } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import { api } from '../../context/AuthContext';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Assignments = () => {
    const [assignments, setAssignments] = useState([]);
    const [loading, setLoading] = useState(true);

    // Modal controls
    const [activeAssignment, setActiveAssignment] = useState(null);
    const [file, setFile] = useState(null);
    const [contentText, setContentText] = useState('');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        api.get('/api/students/assignments')
            .then(res => setAssignments(res.data))
            .catch(err => console.error('Error fetching assignments', err))
            .finally(() => setLoading(false));
    }, []);

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleSubmitSolution = async (e) => {
        e.preventDefault();
        if (!file && !contentText.trim()) {
            toast.error("Please provide either a solution file or a text response.");
            return;
        }

        setSubmitting(true);
        const formData = new FormData();
        if (file) {
            formData.append('file', file);
        }
        if (contentText) {
            formData.append('contentText', contentText);
        }

        try {
            await api.post(`/api/students/assignments/${activeAssignment.id}/submit`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            toast.success("Assignment submitted successfully!");
            // Reset
            setActiveAssignment(null);
            setFile(null);
            setContentText('');
        } catch (error) {
            toast.error("Error submitting solution: " + (error.response?.data || error.message));
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <DashboardLayout title="My Assignments & Term Projects">
            <ToastContainer theme="dark" />
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
                <div className="border-b border-slate-800 pb-4 mb-6">
                    <h3 className="text-base font-bold text-white">Course Homework Projects</h3>
                    <p className="text-xs text-slate-500 mt-1">Submit files or code snippets before the deadlines</p>
                </div>

                {loading ? (
                    <div className="flex justify-center py-12">
                        <div className="h-6 w-6 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent"></div>
                    </div>
                ) : assignments.length === 0 ? (
                    <div className="text-center py-12 text-slate-500 text-sm">
                        No assignments active for your batch.
                    </div>
                ) : (
                    <div className="space-y-4">
                        {assignments.map((item) => {
                            const isOverdue = new Date(item.deadline) < new Date();
                            return (
                                <div key={item.id} className="p-5 bg-slate-950 border border-slate-800/80 rounded-xl flex flex-col md:flex-row justify-between gap-6 hover:border-slate-850 transition-colors">
                                    <div className="space-y-1.5 text-left flex-1">
                                        <div className="flex items-center gap-3">
                                            <h4 className="font-bold text-white text-sm">{item.title}</h4>
                                            {item.filePath && (
                                                <a
                                                    href={`http://localhost:9998/${item.filePath}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-[10px] text-emerald-400 bg-emerald-950/20 px-2 py-0.5 border border-emerald-900/50 rounded font-semibold"
                                                >
                                                    📄 Attached File
                                                </a>
                                            )}
                                        </div>
                                        <p className="text-xs text-slate-400">{item.description}</p>
                                        <div className="text-[10px] space-y-0.5">
                                            <p className="text-slate-500">Scheduled by Prof. {item.faculty.user.firstName}</p>
                                            <p className={`${isOverdue ? 'text-rose-400 font-semibold' : 'text-slate-500'}`}>
                                                Deadline: {new Date(item.deadline).toLocaleString()} {isOverdue && '(Overdue)'}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center">
                                        <button
                                            onClick={() => setActiveAssignment(item)}
                                            disabled={isOverdue}
                                            className="w-full md:w-auto px-5 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-emerald-400 text-xs font-semibold rounded-lg transition-colors disabled:opacity-50"
                                        >
                                            Submit Solution
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Submit Solution Overlay Modal */}
            {activeAssignment && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-slate-900 border border-slate-800 max-w-lg w-full p-6 rounded-2xl space-y-5 text-left relative">
                        <button
                            onClick={() => setActiveAssignment(null)}
                            className="absolute top-4 right-4 text-slate-500 hover:text-white text-lg"
                        >
                            ✕
                        </button>

                        <div>
                            <h3 className="font-bold text-white text-base">Submit Solution</h3>
                            <p className="text-xs text-slate-400 mt-1">Assignment: {activeAssignment.title}</p>
                        </div>

                        <form onSubmit={handleSubmitSolution} className="space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Text Response / Notes</label>
                                <textarea
                                    value={contentText}
                                    onChange={(e) => setContentText(e.target.value)}
                                    rows="4"
                                    placeholder="Enter your answers or comments here..."
                                    className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-white placeholder-slate-600 transition-all text-sm"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Attach File Solution</label>
                                <input
                                    type="file"
                                    onChange={handleFileChange}
                                    className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-slate-950 file:text-emerald-400 file:border-slate-800 hover:file:bg-slate-850 cursor-pointer"
                                />
                            </div>

                            <div className="flex gap-3 justify-end pt-4 border-t border-slate-800/80">
                                <button
                                    type="button"
                                    onClick={() => setActiveAssignment(null)}
                                    className="px-4 py-2 bg-slate-950 hover:bg-slate-850 text-slate-400 text-xs font-semibold rounded-lg border border-slate-800"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="px-5 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold rounded-lg transition-colors flex items-center gap-2"
                                >
                                    {submitting ? (
                                        <div className="h-3 w-3 animate-spin rounded-full border-2 border-slate-950 border-t-transparent"></div>
                                    ) : (
                                        'Submit Solution'
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

export default Assignments;
