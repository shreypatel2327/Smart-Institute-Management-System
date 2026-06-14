import React, { useEffect, useState } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import { api } from '../../context/AuthContext';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const UploadVideos = () => {
    const [batches, setBatches] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [uploadedVideos, setUploadedVideos] = useState([]);
    const [loading, setLoading] = useState(true);

    // Form states
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [selectedBatchId, setSelectedBatchId] = useState('');
    const [selectedSubjectId, setSelectedSubjectId] = useState('');
    const [videoUrl, setVideoUrl] = useState('');
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

            const vids = await api.get('/api/faculties/videos');
            setUploadedVideos(vids.data);
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
        if (!selectedBatchId || !selectedSubjectId || (!videoUrl && !file)) {
            toast.error("Please fill all fields and provide either a stream link or a video file.");
            return;
        }

        setUploading(true);
        const formData = new FormData();
        formData.append('title', title);
        formData.append('description', description);
        formData.append('batchId', selectedBatchId);
        formData.append('subjectId', selectedSubjectId);
        if (videoUrl) formData.append('videoUrl', videoUrl);
        if (file) formData.append('file', file);

        try {
            await api.post('/api/faculties/videos', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            toast.success("Video tutorial added successfully!");
            // Reset
            setTitle('');
            setDescription('');
            setVideoUrl('');
            setFile(null);
            const finp = document.getElementById('file-input');
            if (finp) finp.value = '';
            // Refresh list
            const vids = await api.get('/api/faculties/videos');
            setUploadedVideos(vids.data);
        } catch (error) {
            toast.error("Error uploading video: " + (error.response?.data?.message || error.message));
        } finally {
            setUploading(false);
        }
    };

    return (
        <DashboardLayout title="Video Tutorials Upload Desk">
            <ToastContainer theme="dark" />

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                {/* Compose Form */}
                <div className="lg:col-span-2 bg-slate-900 border border-slate-800 p-6 rounded-2xl text-left h-fit">
                    <div className="border-b border-slate-800 pb-3 mb-5">
                        <h3 className="text-base font-bold text-white">Upload Class Video Recordings</h3>
                        <p className="text-xs text-slate-500 mt-1">Host direct video files or link external platforms (YouTube, Vimeo, etc.)</p>
                    </div>

                    {loading ? (
                        <div className="flex justify-center py-12">
                            <div className="h-6 w-6 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent"></div>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Video Title *</label>
                                <input
                                    type="text"
                                    required
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500 text-white placeholder-slate-650 transition-all text-xs"
                                    placeholder="e.g. Session 4 Spring Data JPA Overview Video Guide"
                                />
                            </div>

                            <div>
                                <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Description / Notes</label>
                                <textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    rows="3"
                                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500 text-white placeholder-slate-650 transition-all text-xs"
                                    placeholder="Details about what topics are explained in this video..."
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
                                <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">External Video URL (e.g. YouTube Link)</label>
                                <input
                                    type="url"
                                    value={videoUrl}
                                    onChange={(e) => setVideoUrl(e.target.value)}
                                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500 text-white placeholder-slate-655 transition-all text-xs"
                                    placeholder="https://www.youtube.com/watch?v=..."
                                />
                            </div>

                            <div className="relative flex py-2 items-center">
                                <div className="flex-grow border-t border-slate-800"></div>
                                <span className="flex-shrink mx-4 text-slate-500 text-[10px] font-bold uppercase">Or physical upload</span>
                                <div className="flex-grow border-t border-slate-800"></div>
                            </div>

                            <div>
                                <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Attach MP4 Video File</label>
                                <input
                                    id="file-input"
                                    type="file"
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
                                        'Upload Video Tutorial'
                                    )}
                                </button>
                            </div>
                        </form>
                    )}
                </div>

                {/* Uploaded Videos View */}
                <div className="lg:col-span-3 bg-slate-900 border border-slate-800 p-6 rounded-2xl text-left flex flex-col h-[650px]">
                    <div className="border-b border-slate-800 pb-3 mb-5">
                        <h3 className="font-bold text-white text-base">Previously Uploaded Videos</h3>
                        <p className="text-xs text-slate-500 mt-1">Review lesson guides & screen recordings shared with batches</p>
                    </div>

                    {loading ? (
                        <div className="flex-1 flex items-center justify-center">
                            <div className="h-6 w-6 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent"></div>
                        </div>
                    ) : uploadedVideos.length === 0 ? (
                        <div className="flex-1 flex items-center justify-center text-slate-500 py-16 text-xs text-center">
                            No videos uploaded yet.
                        </div>
                    ) : (
                        <div className="flex-1 overflow-y-auto space-y-4 pr-1">
                            {uploadedVideos.map(vid => (
                                <div key={vid.id} className="p-4 bg-slate-950 border border-slate-850 rounded-xl space-y-2">
                                    <div className="flex items-center justify-between">
                                        <h4 className="font-bold text-white text-xs">{vid.title}</h4>
                                        <span className="text-[9px] text-slate-655 font-medium">
                                            {vid.createdAt ? new Date(vid.createdAt).toLocaleDateString() : ''}
                                        </span>
                                    </div>
                                    {vid.description && <p className="text-[11px] text-slate-400 leading-relaxed">{vid.description}</p>}
                                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                                        <span className="text-[9px] font-bold text-slate-400 bg-slate-900 border border-slate-800 px-2 py-0.5 rounded">
                                            Batch: {vid.batch?.name || 'All'}
                                        </span>
                                        <span className="text-[9px] font-bold text-slate-400 bg-slate-900 border border-slate-800 px-2 py-0.5 rounded">
                                            Subject: {vid.subject?.name || 'N/A'}
                                        </span>
                                    </div>
                                    {vid.videoUrl && (
                                        <div className="mt-2 pt-2 border-t border-slate-900/60">
                                            <a
                                                href={vid.videoUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-[10px] text-emerald-400 hover:text-emerald-350 hover:underline font-semibold inline-flex items-center gap-1"
                                            >
                                                🔗 Stream External Link
                                            </a>
                                        </div>
                                    )}
                                    {vid.videoPath && (
                                        <div className="mt-2 pt-2 border-t border-slate-900">
                                            <a
                                                href={`http://localhost:9998/${vid.videoPath}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-[10px] text-emerald-400 hover:text-emerald-350 hover:underline font-semibold inline-flex items-center gap-1"
                                            >
                                                📹 Download MP4 Recording
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

export default UploadVideos;
