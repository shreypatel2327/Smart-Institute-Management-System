import React, { useEffect, useState } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import { api } from '../../context/AuthContext';

const Materials = () => {
    const [materials, setMaterials] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('/api/students/materials')
            .then(res => setMaterials(res.data))
            .catch(err => console.error('Error fetching materials', err))
            .finally(() => setLoading(false));
    }, []);

    const handleDownload = (filePath) => {
        // Exposes URL directly
        window.open(`http://localhost:9998/${filePath}`, '_blank');
    };

    return (
        <DashboardLayout title="Study Materials & Downloads">
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
                <div className="border-b border-slate-800 pb-4 mb-6">
                    <h3 className="text-base font-bold text-white">Materials & Worksheets</h3>
                    <p className="text-xs text-slate-500 mt-1">Syllabus trackers, study sheets, and reference notes</p>
                </div>

                {loading ? (
                    <div className="flex justify-center py-12">
                        <div className="h-6 w-6 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent"></div>
                    </div>
                ) : materials.length === 0 ? (
                    <div className="text-center py-12 text-slate-500 text-sm">
                        No study materials uploaded for your batch yet.
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {materials.map((mat) => (
                            <div key={mat.id} className="p-4 bg-slate-950 border border-slate-800/80 rounded-xl flex items-center justify-between hover:border-slate-700 transition-colors">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs bg-slate-900 border border-slate-800 text-slate-400 px-2 py-0.5 rounded font-bold">
                                            {mat.fileType || 'PDF'}
                                        </span>
                                        <h4 className="font-bold text-white text-sm">{mat.title}</h4>
                                    </div>
                                    <p className="text-xs text-slate-400 max-w-xs">{mat.description}</p>
                                    <span className="text-[10px] text-slate-500 block">
                                        Uploaded on: {new Date(mat.createdAt).toLocaleDateString()}
                                    </span>
                                </div>
                                <button
                                    onClick={() => handleDownload(mat.filePath)}
                                    className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-emerald-400 border border-slate-800 hover:border-slate-700 text-xs font-semibold rounded-lg transition-colors flex items-center gap-2"
                                >
                                    <span>📥</span> Download
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
};

export default Materials;
