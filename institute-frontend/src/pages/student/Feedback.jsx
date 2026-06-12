import React, { useEffect, useState } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import { api } from '../../context/AuthContext';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Feedback = () => {
    const [profile, setProfile] = useState(null);
    const [topicExplanation, setTopicExplanation] = useState(5);
    const [subjectKnowledge, setSubjectKnowledge] = useState(5);
    const [communicationSkills, setCommunicationSkills] = useState(5);
    const [practicalKnowledge, setPracticalKnowledge] = useState(5);
    const [doubtSolving, setDoubtSolving] = useState(5);
    const [comments, setComments] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('/api/students/profile')
            .then(res => setProfile(res.data))
            .catch(err => console.error('Error loading profile', err))
            .finally(() => setLoading(false));
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!profile?.batch?.faculty) {
            toast.error("You don't have an assigned faculty to submit feedback for.");
            return;
        }

        setSubmitting(true);
        try {
            await api.post('/api/students/feedback', {
                faculty: profile.batch.faculty,
                topicExplanation,
                subjectKnowledge,
                communicationSkills,
                practicalKnowledge,
                doubtSolving,
                comments
            });
            toast.success("Thank you! Your weekly feedback was recorded.");
            // Reset
            setComments('');
        } catch (error) {
            toast.error("Error submitting feedback: " + (error.response?.data || error.message));
        } finally {
            setSubmitting(false);
        }
    };

    const ratingMetrics = [
        { label: 'Topic Explanation', value: topicExplanation, setter: setTopicExplanation },
        { label: 'Subject Knowledge', value: subjectKnowledge, setter: setSubjectKnowledge },
        { label: 'Communication Skills', value: communicationSkills, setter: setCommunicationSkills },
        { label: 'Practical Knowledge', value: practicalKnowledge, setter: setPracticalKnowledge },
        { label: 'Doubt Solving', value: doubtSolving, setter: setDoubtSolving }
    ];

    return (
        <DashboardLayout title="Weekly Faculty Feedback Form">
            <ToastContainer theme="dark" />
            <div className="max-w-2xl mx-auto bg-slate-900 border border-slate-800 p-6 rounded-2xl">
                <div className="border-b border-slate-800 pb-4 mb-6">
                    <h3 className="text-base font-bold text-white">Faculty Performance Evaluation</h3>
                    <p className="text-xs text-slate-500 mt-1">Submit your honest rating for this week's classes</p>
                </div>

                {loading ? (
                    <div className="flex justify-center py-12">
                        <div className="h-6 w-6 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent"></div>
                    </div>
                ) : !profile?.batch?.faculty ? (
                    <div className="text-center py-12 text-slate-500 text-sm">
                        You have not been assigned to a Batch/Faculty yet. Feedback submission is disabled.
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-6 text-left">
                        {/* Target Lecturer badge */}
                        <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl">
                            <span className="text-[10px] text-slate-500 font-bold block uppercase">Faculty Target</span>
                            <span className="text-sm font-bold text-white block mt-0.5">
                                Prof. {profile.batch.faculty.user.firstName} {profile.batch.faculty.user.lastName}
                            </span>
                            <span className="text-xs text-slate-400 block mt-0.5">
                                Specialization: {profile.batch.faculty.specialization} | Course: {profile.batch.name}
                            </span>
                        </div>

                        {/* Metric sliders */}
                        <div className="space-y-4">
                            {ratingMetrics.map((metric) => (
                                <div key={metric.label} className="p-3 bg-slate-950/40 border border-slate-800/60 rounded-xl flex items-center justify-between gap-6">
                                    <div className="flex-1">
                                        <div className="flex justify-between items-center mb-1">
                                            <span className="text-xs font-semibold text-slate-300">{metric.label}</span>
                                            <span className="text-xs font-bold text-emerald-400">{metric.value} / 5</span>
                                        </div>
                                        <input
                                            type="range"
                                            min="1"
                                            max="5"
                                            value={metric.value}
                                            onChange={(e) => metric.setter(parseInt(e.target.value))}
                                            className="w-full accent-emerald-500 bg-slate-800 h-1.5 rounded-lg appearance-none cursor-pointer"
                                        />
                                    </div>
                                    <div className="text-xl">
                                        {['⭐', '⭐⭐', '⭐⭐⭐', '⭐⭐⭐⭐', '⭐⭐⭐⭐⭐'][metric.value - 1]}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Comments */}
                        <div>
                            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Additional Remarks / Comments</label>
                            <textarea
                                value={comments}
                                onChange={(e) => setComments(e.target.value)}
                                rows="3"
                                placeholder="Enter any extra details or suggestions here..."
                                className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-white placeholder-slate-600 transition-all text-sm"
                            />
                        </div>

                        <div>
                            <button
                                type="submit"
                                disabled={submitting}
                                className="px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-emerald-500/10 flex items-center gap-2 transition-colors disabled:opacity-50"
                            >
                                {submitting ? (
                                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-950 border-t-transparent"></div>
                                ) : (
                                    'Submit Weekly Feedback'
                                )}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </DashboardLayout>
    );
};

export default Feedback;
