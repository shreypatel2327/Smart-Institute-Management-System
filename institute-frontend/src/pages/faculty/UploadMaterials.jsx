import React, { useEffect, useState } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import { api } from '../../context/AuthContext';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const UploadMaterials = () => {
    const [batches, setBatches] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [loading, setLoading] = useState(true);

    // Form states
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [selectedBatchId, setSelectedBatchId] = useState('');
    const [selectedSubjectId, setSelectedSubjectId] = useState('');
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        const loadPageData = async () => {
            try {
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
        } catch (error) {
            toast.error("Error uploading material: " + (error.response?.data?.message || error.message));
        } finally {
            setUploading(false);
        }
    };

    return (
        <DashboardLayout title="Study Materials Upload Desk">
            <ToastContainer theme="dark" />
            <div className="max-w-xl mx-auto bg-slate-900 border border-slate-800 p-6 rounded-2xl">
                <div className="border-b border-slate-800 pb-4 mb-6 text-left">
                    <h3 className="text-base font-bold text-white">Upload Class Sheets & Notes</h3>
                    <p className="text-xs text-slate-500 mt-1">Syllabus PDFs, reference guides, worksheets, and XLSX tables</p>
                </div>

                {loading ? (
                    <div className="flex justify-center py-12">
                        <div className="h-6 w-6 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent"></div>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-4 text-left">
                        <div>
                            <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Material Title *</label>
                            <input
                                type="text"
                                required
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500 text-white placeholder-slate-650 transition-all text-xs"
                                placeholder="e.g. Session 4 Spring Data JPA Overview"
                            />
                        </div>

                        <div>
                            <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Description / Notes</label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                rows="3"
                                className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500 text-white placeholder-slate-650 transition-all text-xs"
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
                                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500"
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
        </DashboardLayout>
    );
};

export default UploadMaterials;
