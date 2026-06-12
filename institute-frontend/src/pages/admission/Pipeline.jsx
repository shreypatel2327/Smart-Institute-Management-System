import React, { useEffect, useState } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import { api } from '../../context/AuthContext';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Pipeline = () => {
    const [inquiries, setInquiries] = useState([]);
    const [loading, setLoading] = useState(true);

    // Modal controls for notes
    const [activeLead, setActiveLead] = useState(null);
    const [notes, setNotes] = useState('');
    const [existingNotes, setExistingNotes] = useState('');
    const [submittingNotes, setSubmittingNotes] = useState(false);

    useEffect(() => {
        loadInquiries();
    }, []);

    const loadInquiries = async () => {
        setLoading(true);
        try {
            const res = await api.get('/api/inquiries');
            setInquiries(res.data);
        } catch (error) {
            console.error('Error fetching inquiries', error);
        } finally {
            setLoading(false);
        }
    };

    const handleMoveStage = async (id, stage) => {
        try {
            await api.put(`/api/inquiries/${id}/stage?stage=${stage}`);
            toast.success(`Lead stage updated to ${stage}!`);
            loadInquiries();
        } catch (error) {
            toast.error("Error shifting lead stage: " + (error.response?.data || error.message));
        }
    };

    const handleOpenNotes = async (lead) => {
        setActiveLead(lead);
        setNotes('');
        setExistingNotes('Loading follow-up history...');
        try {
            const res = await api.get(`/api/admissions/tracking/${lead.id}`);
            setExistingNotes(res.data.notes || 'No comments logged for this lead yet.');
        } catch (error) {
            setExistingNotes('No prior notes recorded.');
        }
    };

    const handleSaveNotes = async (e) => {
        e.preventDefault();
        setSubmittingNotes(true);
        try {
            const params = new URLSearchParams();
            params.append('notes', notes);
            await api.post(`/api/admissions/tracking/${activeLead.id}`, params, {
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
            });
            toast.success("Follow-up note logged successfully!");
            setActiveLead(null);
            setNotes('');
        } catch (error) {
            toast.error("Error saving note: " + (error.response?.data || error.message));
        } finally {
            setSubmittingNotes(false);
        }
    };

    const pipelineStages = [
        'LEAD', 'INQUIRY', 'SEMINAR', 'BOOTCAMP', 'COUNSELLING', 
        'FOLLOW_UP_1', 'FOLLOW_UP_2', 'FOLLOW_UP_3', 'FOLLOW_UP_4', 'FOLLOW_UP_5', 'ADMISSION'
    ];

    return (
        <DashboardLayout title="Leads Conversion Pipeline Desk">
            <ToastContainer theme="dark" />
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
                <div className="border-b border-slate-800 pb-4 mb-6 text-left">
                    <h3 className="text-base font-bold text-white">Admissions Funnel Kanban</h3>
                    <p className="text-xs text-slate-500 mt-1">Audit prospective leads, logging call notes and transition stages</p>
                </div>

                {loading ? (
                    <div className="flex justify-center py-12">
                        <div className="h-6 w-6 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent"></div>
                    </div>
                ) : inquiries.length === 0 ? (
                    <div className="text-center py-12 text-slate-500 text-sm">
                        No inquiries submitted yet. Open the inquiry form to seed leads.
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {inquiries.map((lead) => (
                            <div key={lead.id} className="p-5 bg-slate-950 border border-slate-800/80 rounded-2xl text-left space-y-3 flex flex-col justify-between hover:border-slate-700 transition-colors">
                                <div className="space-y-1">
                                    <div className="flex justify-between items-start gap-2">
                                        <h4 className="font-bold text-white text-sm truncate">{lead.firstName} {lead.lastName}</h4>
                                        <span className="text-[9px] font-bold px-2 py-0.5 bg-slate-900 border border-slate-800 text-emerald-400 rounded-full font-mono shrink-0">
                                            {lead.stage}
                                        </span>
                                    </div>
                                    <p className="text-xs text-slate-400">Email: {lead.email}</p>
                                    <p className="text-xs text-slate-400">Mobile: {lead.mobileNumber}</p>
                                    <div className="text-[10px] text-slate-500 space-y-0.5 mt-2">
                                        <p>City: {lead.city || 'N/A'}</p>
                                        <p>Reference: {lead.referenceSource} {lead.otherReference && `(${lead.otherReference})`}</p>
                                    </div>
                                </div>

                                <div className="pt-4 border-t border-slate-800/80 flex flex-col gap-2">
                                    {/* Action shift stage selector */}
                                    <div>
                                        <label className="block text-[9px] font-bold text-slate-500 uppercase mb-1">Shift Stage</label>
                                        <select
                                            value={lead.stage}
                                            onChange={(e) => handleMoveStage(lead.id, e.target.value)}
                                            className="w-full bg-slate-900 border border-slate-800 text-slate-300 text-xs px-2 py-1.5 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
                                        >
                                            {pipelineStages.map(st => (
                                                <option key={st} value={st}>{st}</option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Open notes button */}
                                    <button
                                        onClick={() => handleOpenNotes(lead)}
                                        className="w-full py-1.5 bg-slate-900 hover:bg-slate-850 border border-slate-850 text-slate-400 hover:text-white text-[10px] font-bold rounded-lg transition-colors flex items-center justify-center gap-1"
                                    >
                                        📝 View/Add Notes
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* View/Add Notes Modal Overlay */}
            {activeLead && (
                <div className="fixed inset-0 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-slate-900 border border-slate-800 max-w-md w-full p-6 rounded-2xl space-y-4 text-left relative">
                        <button
                            onClick={() => setActiveLead(null)}
                            className="absolute top-4 right-4 text-slate-500 hover:text-white text-lg"
                        >
                            ✕
                        </button>
                        
                        <div>
                            <h3 className="font-bold text-white text-base">Follow-up Call Notes</h3>
                            <p className="text-xs text-slate-450 mt-1">Lead: {activeLead.firstName} {activeLead.lastName}</p>
                        </div>

                        {/* Display existing comments */}
                        <div className="p-3 bg-slate-950 border border-slate-850 rounded-xl max-h-40 overflow-y-auto">
                            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block mb-1">Previous comments log</span>
                            <p className="text-xs font-mono text-slate-400 whitespace-pre-wrap">{existingNotes}</p>
                        </div>

                        <form onSubmit={handleSaveNotes} className="space-y-4">
                            <div>
                                <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">New Follow-up Notes</label>
                                <textarea
                                    required
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    rows="3"
                                    placeholder="Enter details about call discussion or counseling next steps..."
                                    className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500 text-white placeholder-slate-650 text-xs"
                                />
                            </div>

                            <div className="flex justify-end gap-3 pt-3 border-t border-slate-800/80">
                                <button
                                    type="button"
                                    onClick={() => setActiveLead(null)}
                                    className="px-4 py-2 bg-slate-950 hover:bg-slate-850 text-slate-400 text-xs font-semibold rounded-lg border border-slate-800"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={submittingNotes}
                                    className="px-5 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold rounded-lg transition-colors flex items-center gap-2"
                                >
                                    {submittingNotes ? (
                                        <div className="h-3 w-3 animate-spin rounded-full border-2 border-slate-950 border-t-transparent"></div>
                                    ) : (
                                        'Save Log'
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

export default Pipeline;
