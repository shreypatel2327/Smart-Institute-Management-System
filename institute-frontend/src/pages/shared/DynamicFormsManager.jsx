import React, { useEffect, useState } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import { api, useAuth } from '../../context/AuthContext';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const DynamicFormsManager = () => {
    const { user } = useAuth();
    const [forms, setForms] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Student Form Filler
    const [activeForm, setActiveForm] = useState(null);
    const [formInputs, setFormInputs] = useState({});
    const [submitting, setSubmitting] = useState(false);

    // Admin Response Viewer
    const [viewingResponsesForm, setViewingResponsesForm] = useState(null);
    const [formResponses, setFormResponses] = useState([]);
    const [loadingResponses, setLoadingResponses] = useState(false);

    const isAdmin = user?.role === 'ROLE_SUPER_ADMIN' || user?.role === 'ROLE_ADMIN';

    const fetchForms = async () => {
        try {
            const endpoint = isAdmin ? '/api/forms/all' : '/api/forms';
            const res = await api.get(endpoint);
            setForms(res.data);
        } catch (err) {
            console.error('Error fetching dynamic forms:', err);
            toast.error('Failed to load event forms.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user) {
            fetchForms();
        }
    }, [user]);

    const handleFormSelect = (form) => {
        setActiveForm(form);
        const schema = JSON.parse(form.fieldsJson);
        const initialInputs = {};
        schema.forEach(field => {
            initialInputs[field.name] = field.type === 'select' ? (field.options?.[0] || '') : '';
        });
        setFormInputs(initialInputs);
    };

    const handleInputChange = (fieldName, value) => {
        setFormInputs(prev => ({
            ...prev,
            [fieldName]: value
        }));
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            await api.post(`/api/forms/${activeForm.id}/submit`, JSON.stringify(formInputs));
            toast.success('Your event response has been submitted successfully.');
            setActiveForm(null);
            fetchForms();
        } catch (err) {
            console.error('Error submitting response:', err);
            toast.error(err.response?.data?.message || 'Failed to submit event response.');
        } finally {
            setSubmitting(false);
        }
    };

    const handleTogglePublish = async (formId) => {
        try {
            await api.put(`/api/forms/${formId}/publish`);
            toast.success('Form status updated successfully.');
            fetchForms();
        } catch (err) {
            console.error('Error toggling publish status:', err);
            toast.error('Failed to change status.');
        }
    };

    const handleViewResponses = async (form) => {
        setViewingResponsesForm(form);
        setLoadingResponses(true);
        try {
            const res = await api.get(`/api/forms/${form.id}/responses`);
            setFormResponses(res.data);
        } catch (err) {
            console.error('Error loading responses:', err);
            toast.error('Failed to load submitted responses.');
        } finally {
            setLoadingResponses(false);
        }
    };

    return (
        <DashboardLayout title="Dynamic Event Forms Hub">
            <ToastContainer theme="dark" />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Forms Directory Panel */}
                <div className={`bg-slate-900 border border-slate-800 p-6 rounded-2xl text-left ${activeForm || viewingResponsesForm ? 'lg:col-span-1' : 'lg:col-span-3'}`}>
                    <div className="border-b border-slate-800 pb-3 mb-5">
                        <h3 className="font-bold text-white text-base">Active Event Bulletins</h3>
                        <p className="text-xs text-slate-500 mt-1">
                            {isAdmin ? 'Manage structure or review submitted participants' : 'Fill forms to register for events'}
                        </p>
                    </div>

                    {loading ? (
                        <div className="flex justify-center py-12">
                            <div className="h-6 w-6 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent"></div>
                        </div>
                    ) : forms.length === 0 ? (
                        <p className="text-slate-500 text-sm py-4">No event forms available at this time.</p>
                    ) : (
                        <div className="space-y-4">
                            {forms.map(form => (
                                <div key={form.id} className="p-4 bg-slate-950 border border-slate-800/80 rounded-xl flex flex-col justify-between gap-4">
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h4 className="font-bold text-white text-sm">{form.title}</h4>
                                            {isAdmin && (
                                                <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase ${
                                                    form.isPublished 
                                                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                                                        : 'bg-slate-800 text-slate-500'
                                                }`}>
                                                    {form.isPublished ? 'Published' : 'Draft'}
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-xs text-slate-400 mt-1">{form.description}</p>
                                    </div>

                                    <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-900">
                                        {!isAdmin ? (
                                            <button
                                                onClick={() => handleFormSelect(form)}
                                                className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-[10px] rounded-lg transition-colors"
                                            >
                                                📝 Fill Form
                                            </button>
                                        ) : (
                                            <>
                                                <button
                                                    onClick={() => handleTogglePublish(form.id)}
                                                    className={`px-3 py-1.5 font-bold text-[10px] rounded-lg transition-colors ${
                                                        form.isPublished 
                                                            ? 'bg-yellow-500/15 text-yellow-400 border border-yellow-500/30' 
                                                            : 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                                                    }`}
                                                >
                                                    {form.isPublished ? '⏸️ Unpublish' : '▶️ Publish'}
                                                </button>
                                                <button
                                                    onClick={() => handleViewResponses(form)}
                                                    className="px-3 py-1.5 bg-slate-900 border border-slate-800 text-slate-300 font-bold text-[10px] rounded-lg hover:bg-slate-850"
                                                >
                                                    👥 View Responses
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Form Filler Modal (Students) */}
                {activeForm && !isAdmin && (
                    <div className="lg:col-span-2 bg-slate-900 border border-slate-800 p-6 rounded-2xl text-left h-fit">
                        <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-5">
                            <div>
                                <h3 className="font-bold text-white text-base">{activeForm.title}</h3>
                                <p className="text-xs text-slate-500 mt-1">{activeForm.description}</p>
                            </div>
                            <button
                                onClick={() => setActiveForm(null)}
                                className="text-xs text-slate-400 hover:text-slate-200"
                            >
                                ❌ Close
                            </button>
                        </div>

                        <form onSubmit={handleFormSubmit} className="space-y-4">
                            {JSON.parse(activeForm.fieldsJson).map(field => (
                                <div key={field.name}>
                                    <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
                                        {field.label} {field.required && '*'}
                                    </label>

                                    {field.type === 'select' ? (
                                        <select
                                            required={field.required}
                                            value={formInputs[field.name]}
                                            onChange={(e) => handleInputChange(field.name, e.target.value)}
                                            className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:outline-none"
                                        >
                                            {field.options?.map((opt, oIdx) => (
                                                <option key={oIdx} value={opt}>{opt}</option>
                                            ))}
                                        </select>
                                    ) : field.type === 'textarea' ? (
                                        <textarea
                                            required={field.required}
                                            value={formInputs[field.name]}
                                            onChange={(e) => handleInputChange(field.name, e.target.value)}
                                            rows="4"
                                            className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:outline-none"
                                            placeholder={`Provide ${field.label.toLowerCase()}`}
                                        />
                                    ) : (
                                        <input
                                            type={field.type}
                                            required={field.required}
                                            value={formInputs[field.name]}
                                            onChange={(e) => handleInputChange(field.name, e.target.value)}
                                            className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:outline-none"
                                            placeholder={`Provide ${field.label.toLowerCase()}`}
                                        />
                                    )}
                                </div>
                            ))}

                            <div className="pt-4 flex gap-3 border-t border-slate-800">
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="flex-1 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg transition-all flex items-center justify-center"
                                >
                                    {submitting ? (
                                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-950 border-t-transparent"></div>
                                    ) : (
                                        'Submit Registration'
                                    )}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setActiveForm(null)}
                                    className="px-4 py-2.5 bg-slate-950 border border-slate-800 hover:bg-slate-850 text-slate-300 font-bold text-xs rounded-xl transition-all"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Submissions Responses Viewer (Admins) */}
                {viewingResponsesForm && isAdmin && (
                    <div className="lg:col-span-2 bg-slate-900 border border-slate-800 p-6 rounded-2xl text-left h-fit flex flex-col h-[550px]">
                        <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-5">
                            <div>
                                <h3 className="font-bold text-white text-base">Registrations: {viewingResponsesForm.title}</h3>
                                <p className="text-xs text-slate-500 mt-1">Review student dynamic JSON database entries</p>
                            </div>
                            <button
                                onClick={() => setViewingResponsesForm(null)}
                                className="text-xs text-slate-400 hover:text-slate-200"
                            >
                                ❌ Close
                            </button>
                        </div>

                        {loadingResponses ? (
                            <div className="flex-1 flex items-center justify-center">
                                <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent"></div>
                            </div>
                        ) : formResponses.length === 0 ? (
                            <div className="flex-1 flex items-center justify-center text-slate-500 py-16 text-xs text-center">
                                No participants have registered or submitted responses for this event yet.
                            </div>
                        ) : (
                            <div className="flex-1 overflow-auto">
                                <table className="w-full text-xs text-left">
                                    <thead>
                                        <tr className="border-b border-slate-850 text-slate-450 uppercase text-[9px] tracking-wider">
                                            <th className="py-2.5">Student</th>
                                            <th className="py-2.5">Roll No</th>
                                            <th className="py-2.5">Response JSON Schema Data</th>
                                            <th className="py-2.5 text-right">Date</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-850 text-slate-300">
                                        {formResponses.map(resp => (
                                            <tr key={resp.id}>
                                                <td className="py-3 font-semibold text-white">
                                                    {resp.submittedBy.user.firstName} {resp.submittedBy.user.lastName}
                                                </td>
                                                <td className="py-3">{resp.submittedBy.rollNumber}</td>
                                                <td className="py-3">
                                                    <div className="p-2 bg-slate-950 rounded-lg font-mono text-[10px] text-emerald-400/90 whitespace-pre-wrap max-w-xs truncate overflow-x-auto hover:text-emerald-400 transition-colors">
                                                        {resp.responsesJson}
                                                    </div>
                                                </td>
                                                <td className="py-3 text-right text-slate-500">
                                                    {new Date(resp.submittedAt).toLocaleDateString()}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
};

export default DynamicFormsManager;
