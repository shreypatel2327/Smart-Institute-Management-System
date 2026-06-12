import React, { useEffect, useState } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import { api } from '../../context/AuthContext';

const Certificates = () => {
    const [certificates, setCertificates] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('/api/students/certificates')
            .then(res => setCertificates(res.data))
            .catch(err => console.error('Error fetching certificates', err))
            .finally(() => setLoading(false));
    }, []);

    const handleDownload = (filePath) => {
        window.open(`http://localhost:9998/${filePath}`, '_blank');
    };

    return (
        <DashboardLayout title="My Graduation Certificates">
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
                <div className="border-b border-slate-800 pb-4 mb-6">
                    <h3 className="text-base font-bold text-white">Course Graduation Certificates</h3>
                    <p className="text-xs text-slate-500 mt-1">Download official verified completion documents</p>
                </div>

                {loading ? (
                    <div className="flex justify-center py-12">
                        <div className="h-6 w-6 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent"></div>
                    </div>
                ) : certificates.length === 0 ? (
                    <div className="text-center py-12 text-slate-500 text-sm">
                        No certificates have been issued to you yet. Complete your course criteria to request auto-generation.
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {certificates.map((cert) => (
                            <div key={cert.id} className="p-5 bg-slate-950 border border-slate-800/80 rounded-2xl flex flex-col justify-between hover:border-slate-700 transition-colors">
                                <div className="space-y-2 text-left">
                                    <span className="text-3xl">🎓</span>
                                    <h4 className="font-bold text-white text-base mt-2">{cert.certificateType} CERTIFICATE</h4>
                                    <p className="text-xs text-slate-400">Batch: {cert.batch.name}</p>
                                    <div className="text-[10px] text-slate-500">
                                        <p>Verification Code: {cert.certificateNumber}</p>
                                        <p>Issued on: {new Date(cert.issuedDate).toLocaleDateString()}</p>
                                    </div>
                                </div>
                                <div className="mt-6">
                                    <button
                                        onClick={() => handleDownload(cert.filePath)}
                                        className="w-full inline-flex items-center justify-center py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 text-xs font-bold rounded-xl shadow-lg shadow-emerald-500/10 transition-all"
                                    >
                                        Download PDF Certificate
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
};

export default Certificates;
