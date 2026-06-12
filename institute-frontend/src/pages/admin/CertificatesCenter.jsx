import React, { useEffect, useState } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import { api } from '../../context/AuthContext';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const CertificatesCenter = () => {
    const [students, setStudents] = useState([]);
    const [batches, setBatches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [generatingId, setGeneratingId] = useState(null);

    useEffect(() => {
        loadPageData();
    }, []);

    const loadPageData = async () => {
        setLoading(true);
        try {
            const stdRes = await api.get('/api/admins/students');
            setStudents(stdRes.data);

            const batRes = await api.get('/api/admins/batches');
            setBatches(batRes.data);
        } catch (error) {
            console.error('Error fetching data', error);
        } finally {
            setLoading(false);
        }
    };

    const handleGenerateSingle = async (studentId, batchId) => {
        if (!batchId) {
            toast.error("Student must be assigned to a batch to generate completion certificates.");
            return;
        }

        setGeneratingId(studentId);
        try {
            await api.post(`/api/admins/certificates/generate/student/${studentId}?batchId=${batchId}`);
            toast.success("Certificate PDF generated successfully!");
            loadPageData();
        } catch (error) {
            toast.error("Error generating certificate: " + (error.response?.data?.message || error.message));
        } finally {
            setGeneratingId(null);
        }
    };

    const handleGenerateBatch = async (batchId) => {
        if (!batchId) return;
        if (!window.confirm("Generate certificates for all students in this batch? This may take a moment.")) return;

        setLoading(true);
        try {
            const res = await api.post(`/api/admins/certificates/generate/batch/${batchId}`);
            toast.success(`Generated ${res.data.length} certificates successfully!`);
            loadPageData();
        } catch (error) {
            toast.error("Error generating batch certificates: " + (error.response?.data || error.message));
        } finally {
            setLoading(false);
        }
    };

    return (
        <DashboardLayout title="Certificate Dispatch desk">
            <ToastContainer theme="dark" />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left: Batch Operations */}
                <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl text-left h-fit space-y-4">
                    <div className="border-b border-slate-800 pb-4">
                        <h3 className="font-bold text-white text-base">Bulk Operations</h3>
                        <p className="text-xs text-slate-500 mt-1">Generate dynamic PDF files for whole batch blocks</p>
                    </div>

                    <div className="space-y-3">
                        {batches.map(b => (
                            <div key={b.id} className="p-3 bg-slate-950 border border-slate-800/80 rounded-xl flex items-center justify-between gap-4">
                                <div className="truncate flex-1">
                                    <h4 className="font-bold text-white text-xs truncate">{b.name}</h4>
                                    <span className="text-[10px] text-slate-500 font-mono block">Code: {b.code}</span>
                                </div>
                                <button
                                    onClick={() => handleGenerateBatch(b.id)}
                                    className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-[10px] font-bold rounded-lg transition-colors flex items-center gap-1 shrink-0"
                                >
                                    🎓 Generate Batch
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right: Student Lists */}
                <div className="lg:col-span-2 bg-slate-900 border border-slate-800 p-6 rounded-2xl text-left">
                    <div className="border-b border-slate-800 pb-4 mb-6">
                        <h3 className="font-bold text-white text-base">Student List</h3>
                        <p className="text-xs text-slate-500 mt-1">Audit student course metrics and trigger single PDF printing</p>
                    </div>

                    {loading ? (
                        <div className="flex justify-center py-12">
                            <div className="h-6 w-6 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent"></div>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {students.map((item) => (
                                <div key={item.id} className="p-4 bg-slate-950 border border-slate-800/80 rounded-xl flex items-center justify-between gap-6">
                                    <div>
                                        <h4 className="font-bold text-white text-sm">{item.user.firstName} {item.user.lastName}</h4>
                                        <p className="text-xs text-slate-400 mt-0.5">Roll No: {item.rollNumber}</p>
                                        <p className="text-[10px] text-slate-500">
                                            Batch: {item.batch ? item.batch.name : 'Unassigned'}
                                        </p>
                                    </div>

                                    <div>
                                        <button
                                            onClick={() => handleGenerateSingle(item.id, item.batch?.id)}
                                            disabled={generatingId === item.id || !item.batch}
                                            className="px-4 py-2 bg-slate-900 hover:bg-slate-850 border border-slate-800 text-emerald-400 text-xs font-semibold rounded-lg transition-colors disabled:opacity-50"
                                        >
                                            {generatingId === item.id ? 'Processing...' : '🎓 Generate PDF'}
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
};

export default CertificatesCenter;
