import React, { useEffect, useState } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import { api } from '../../context/AuthContext';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const UploadMaterials = () => {
    const [batches, setBatches] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [uploadedMaterials, setUploadedMaterials] = useState([]);
    const [loading, setLoading] = useState(true);

    // Form states
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [selectedBatchId, setSelectedBatchId] = useState('');
    const [selectedSubjectId, setSelectedSubjectId] = useState('');
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);

    const loadPageData = async () => {
        try {
            const bts = await api.get('/api/faculties/batches');
            setBatches(bts.data);
            if (bts.data.length > 0) setSelectedBatchId(bts.data[0].id);

            const subs = await api.get('/api/faculties/subjects');
            setSubjects(subs.data);
            if (subs.data.length > 0) setSelectedSubjectId(subs.data[0].id);

            const mats = await api.get('/api/faculties/materials');
            setUploadedMaterials(mats.data);
        } catch (error) {
            console.error('Error loading page components', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadPageData();
    }, []);

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedBatchId || !selectedSubjectId || !file) {
            toast.error("Please verify all fields and select a file to upload.");
            return;
        }

        setUploading(true);
        const formData = new FormData();
        formData.append('title', title);
        formData.append('description', description);
        formData.append('batchId', selectedBatchId);
        formData.append('subjectId', selectedSubjectId);
        formData.append('file', file);

        try {
            await api.post('/api/faculties/materials', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            toast.success("Study material uploaded successfully!");
            // Reset
            setTitle('');
            setDescription('');
            setFile(null);
            document.getElementById('file-input').value = '';
            // Refresh list
            const mats = await api.get('/api/faculties/materials');
            setUploadedMaterials(mats.data);
        } catch (error) {
            toast.error("Error uploading material: " + (error.response?.data?.message || error.message));
        } finally {
            setUploading(false);
        }
    };

    return (
        <DashboardLayout title="Study Materials Upload Desk">
            <ToastContainer theme="dark" />

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                {/* Compose Form */}
                <div className="lg:col-span-2 bg-slate-900 border border-slate-800 p-6 rounded-2xl text-left h-fit">
                    <div className="border-b border-slate-800 pb-3 mb-5">
                        <h3 className="text-base font-bold text-white">Upload Class Sheets & Notes</h3>
                        <p className="text-xs text-slate-500 mt-1">Syllabus PDFs, reference guides, worksheets, and XLSX tables</p>
                    </div>

                    {loading ? (
                        <div className="flex justify-center py-12">
                            <div className="h-6 w-6 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent"></div>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Material Title *</label>
                                <input
                                    type="text"
                                    required
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500 text-white placeholder-slate-650 transition-all text-xs"
                                    placeholder="e.g. Session 4 Spring Data JPA Overview"
                                />
                            </div>

                            <div>
                                <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Description / Notes</label>
                                <textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    rows="3"
                                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500 text-white placeholder-slate-650 transition-all text-xs"
                                    placeholder="Describe what reference concepts are included in this sheet..."
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Target Batch *</label>
                                    <select
                                        required
                                        value={selectedBatchId}
                                        onChange={(e) => setSelectedBatchId(e.target.value)}
                                        className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500"
                                    >
                                        <option value="">Select Batch</option>
                                        {batches.map(b => (
                                            <option key={b.id} value={b.id}>{b.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Target Subject *</label>
                                    <select
                                        required
                                        value={selectedSubjectId}
                                        onChange={(e) => setSelectedSubjectId(e.target.value)}
                                        className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500"
                                    >
                                        <option value="">Select Subject</option>
                                        {subjects.map(s => (
                                            <option key={s.id} value={s.id}>{s.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Attach Document File *</label>
                                <input
                                    id="file-input"
                                    type="file"
                                    required
                                    onChange={handleFileChange}
                                    className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-slate-950 file:text-emerald-400 file:border-slate-800 hover:file:bg-slate-850 cursor-pointer"
                                />
                            </div>

                            <div className="pt-4 border-t border-slate-800/80">
                                <button
                                    type="submit"
                                    disabled={uploading}
                                    className="w-full py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
                                >
                                    {uploading ? (
                                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-950 border-t-transparent"></div>
                                    ) : (
                                        'Upload Study Sheet'
                                    )}
                                </button>
                            </div>
                        </form>
                    )}
                </div>

                {/* Uploaded Materials View */}
                <div className="lg:col-span-3 bg-slate-900 border border-slate-800 p-6 rounded-2xl text-left flex flex-col h-[600px]">
                    <div className="border-b border-slate-800 pb-3 mb-5">
                        <h3 className="font-bold text-white text-base">Previously Uploaded Materials</h3>
                        <p className="text-xs text-slate-500 mt-1">Review documents and files you have shared with batches</p>
                    </div>

                    {loading ? (
                        <div className="flex-1 flex items-center justify-center">
                            <div className="h-6 w-6 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent"></div>
                        </div>
                    ) : uploadedMaterials.length === 0 ? (
                        <div className="flex-1 flex items-center justify-center text-slate-500 py-16 text-xs text-center">
                            No materials uploaded yet.
                        </div>
                    ) : (
                        <div className="flex-1 overflow-y-auto space-y-4 pr-1">
                            {uploadedMaterials.map(mat => (
                                <div key={mat.id} className="p-4 bg-slate-950 border border-slate-850 rounded-xl space-y-2">
                                    <div className="flex items-center justify-between">
                                        <h4 className="font-bold text-white text-xs">{mat.title}</h4>
                                        <span className="text-[9px] text-slate-655 font-medium">
                                            {mat.createdAt ? new Date(mat.createdAt).toLocaleDateString() : ''}
                                        </span>
                                    </div>
                                    {mat.description && <p className="text-[11px] text-slate-400 leading-relaxed">{mat.description}</p>}
                                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                                        <span className="text-[9px] font-bold text-slate-400 bg-slate-900 border border-slate-800 px-2 py-0.5 rounded">
                                            Batch: {mat.batch?.name || 'All'}
                                        </span>
                                        <span className="text-[9px] font-bold text-slate-400 bg-slate-900 border border-slate-800 px-2 py-0.5 rounded">
                                            Subject: {mat.subject?.name || 'N/A'}
                                        </span>
                                    </div>
                                    {mat.filePath && (
                                        <div className="mt-2 pt-2 border-t border-slate-900">
                                            <a
                                                href={`http://localhost:9998/${mat.filePath}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-[10px] text-emerald-400 hover:text-emerald-350 hover:underline font-semibold inline-flex items-center gap-1"
                                            >
                                                📁 Download File
                                            </a>
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

export default UploadMaterials;
