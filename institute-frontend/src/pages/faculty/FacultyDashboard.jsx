import React, { useEffect, useState } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import { api } from '../../context/AuthContext';
import { Link } from 'react-router-dom';

const FacultyDashboard = () => {
    const [profile, setProfile] = useState(null);
    const [batches, setBatches] = useState([]);
    const [lectures, setLectures] = useState([]);
    const [myStudents, setMyStudents] = useState([]);
    const [pendingRecordingsCount, setPendingRecordingsCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [leftTab, setLeftTab] = useState('LECTURES'); // LECTURES, STUDENTS

    useEffect(() => {
        const fetchFacultyData = async () => {
            try {
                const profRes = await api.get('/api/faculties/profile');
                setProfile(profRes.data);

                const batchRes = await api.get('/api/faculties/batches');
                setBatches(batchRes.data);

                const lectRes = await api.get('/api/faculties/lectures');
                setLectures(lectRes.data.slice(0, 5)); // recent 5

                const studentsRes = await api.get('/api/faculties/my-students');
                setMyStudents(studentsRes.data);

                const reqsRes = await api.get('/api/complaints-leaves');
                const pendingReqs = reqsRes.data.filter(r => r.type === 'RECORDING_REQUEST' && r.status === 'PENDING');
                setPendingRecordingsCount(pendingReqs.length);
            } catch (error) {
                console.error('Error loading faculty dashboard', error);
            } finally {
                setLoading(false);
            }
        };

        fetchFacultyData();
    }, []);

    if (loading) {
        return (
            <DashboardLayout title="Faculty Portal">
                <div className="flex h-64 items-center justify-center">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent"></div>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout title={`Instructor Console: Prof. ${profile?.user?.firstName || ''} ${profile?.user?.lastName || ''}`}>
            {/* Warning Banner Reminder */}
            {pendingRecordingsCount > 0 && (
                <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 mb-6 text-left flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <span className="text-2xl">⚠️</span>
                        <div>
                            <h4 className="font-bold text-amber-400 text-sm">Pending Recording Requests</h4>
                            <p className="text-xs text-amber-200/70 mt-0.5">
                                You have {pendingRecordingsCount} pending lecture recording request(s) awaiting your review.
                            </p>
                        </div>
                    </div>
                    <Link
                        to="/shared/complaints-leaves"
                        className="px-4 py-1.5 bg-amber-500 text-slate-950 font-extrabold text-xs rounded-xl hover:bg-amber-400 transition-colors text-center w-full sm:w-auto"
                    >
                        Review Requests
                    </Link>
                </div>
            )}

            {/* Overview cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex items-center gap-5">
                    <div className="h-12 w-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 text-2xl">
                        🏫
                    </div>
                    <div>
                        <span className="text-xs text-slate-500 font-semibold block uppercase">Active Batches</span>
                        <span className="text-xl font-bold text-white block">{batches.length} Batches</span>
                        <span className="text-[10px] text-slate-400 block mt-0.5">Assigned to you</span>
                    </div>
                </div>

                <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex items-center gap-5">
                    <div className="h-12 w-12 rounded-xl bg-teal-500/10 flex items-center justify-center text-teal-400 text-2xl">
                        🆔
                    </div>
                    <div>
                        <span className="text-xs text-slate-500 font-semibold block uppercase">Employee ID</span>
                        <span className="text-xl font-bold text-white block">{profile?.employeeId}</span>
                        <span className="text-[10px] text-slate-400 block mt-0.5">Specialization: {profile?.specialization}</span>
                    </div>
                </div>

                <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex items-center gap-5">
                    <div className="h-12 w-12 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 text-2xl">
                        💼
                    </div>
                    <div>
                        <span className="text-xs text-slate-500 font-semibold block uppercase">Qualification</span>
                        <span className="text-base font-bold text-white block truncate">{profile?.qualification}</span>
                        <span className="text-[10px] text-slate-550 block mt-0.5">Verified Instructor Account</span>
                    </div>
                </div>
            </div>

            {/* Split layout panels */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-6">
                {/* Left: Lectures list / Students List */}
                <div className="lg:col-span-2 space-y-6 bg-slate-900 border border-slate-800 p-6 rounded-2xl">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => setLeftTab('LECTURES')}
                                className={`text-base font-bold transition-all ${leftTab === 'LECTURES' ? 'text-white border-b-2 border-emerald-500 pb-1' : 'text-slate-500 hover:text-slate-300'}`}
                            >
                                Lectures ({lectures.length})
                            </button>
                            <button
                                onClick={() => setLeftTab('STUDENTS')}
                                className={`text-base font-bold transition-all ${leftTab === 'STUDENTS' ? 'text-white border-b-2 border-emerald-500 pb-1' : 'text-slate-500 hover:text-slate-300'}`}
                            >
                                Student Directory ({myStudents.length})
                            </button>
                        </div>
                        {leftTab === 'LECTURES' && (
                            <Link to="/faculty/lectures" className="text-xs font-bold text-emerald-400 hover:underline">
                                Manage All →
                            </Link>
                        )}
                    </div>

                    {leftTab === 'LECTURES' ? (
                        lectures.length === 0 ? (
                            <p className="text-slate-500 text-sm py-4">You have not scheduled any lectures yet.</p>
                        ) : (
                            <div className="space-y-4">
                                {lectures.map((item) => (
                                    <div key={item.id} className="flex items-center justify-between p-4 bg-slate-950 border border-slate-800/80 rounded-xl">
                                        <div className="text-left">
                                            <span className="text-[10px] bg-slate-900 border border-slate-800 text-slate-400 px-2 py-0.5 rounded font-bold">
                                                {item.status}
                                            </span>
                                            <h4 className="font-bold text-white text-sm mt-1">{item.title}</h4>
                                            <p className="text-xs text-slate-400">
                                                Batch: {item.batch.name} | Date: {item.date} ({item.startTime} - {item.endTime})
                                            </p>
                                        </div>
                                        <span className="text-2xl">🏫</span>
                                    </div>
                                ))}
                            </div>
                        )
                    ) : (
                        myStudents.length === 0 ? (
                            <p className="text-slate-500 text-sm py-4">No students enrolled in your assigned batches.</p>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-xs text-slate-300">
                                    <thead>
                                        <tr className="border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                                            <th className="py-2">Roll No</th>
                                            <th className="py-2">Name</th>
                                            <th className="py-2">Batch</th>
                                            <th className="py-2">Contact</th>
                                            <th className="py-2">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {myStudents.map((st) => (
                                            <tr key={st.id} className="border-b border-slate-850 hover:bg-slate-950/40">
                                                <td className="py-3 font-semibold text-emerald-400">{st.rollNumber}</td>
                                                <td className="py-3 font-medium text-white">{st.user?.firstName} {st.user?.lastName}</td>
                                                <td className="py-3 text-slate-400">{st.batch?.name || 'Unassigned'}</td>
                                                <td className="py-3 text-slate-500">{st.mobileNumber || st.user?.phone || 'N/A'}</td>
                                                <td className="py-3">
                                                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase ${st.status === 'ACTIVE' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                                                        {st.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )
                    )}
                </div>

                {/* Right: Quick actions menu panel */}
                <div className="space-y-6 bg-slate-900 border border-slate-800 p-6 rounded-2xl">
                    <div className="border-b border-slate-800 pb-4">
                        <h3 className="font-bold text-white text-base">Quick Instructor Actions</h3>
                    </div>

                    <div className="grid grid-cols-1 gap-3">
                        <Link
                            to="/faculty/lectures"
                            className="p-3 bg-slate-950 border border-slate-800/60 rounded-xl hover:bg-slate-800/20 text-left transition-colors flex items-center gap-3 text-slate-300 hover:text-white"
                        >
                            <span>📅</span>
                            <div>
                                <h4 className="font-bold text-xs">Schedule a Lecture</h4>
                                <p className="text-[10px] text-slate-500">Plan and assign time slots</p>
                            </div>
                        </Link>

                        <Link
                            to="/faculty/materials"
                            className="p-3 bg-slate-950 border border-slate-800/60 rounded-xl hover:bg-slate-800/20 text-left transition-colors flex items-center gap-3 text-slate-300 hover:text-white"
                        >
                            <span>📤</span>
                            <div>
                                <h4 className="font-bold text-xs">Upload Material</h4>
                                <p className="text-[10px] text-slate-500">Share study sheets & documentation</p>
                            </div>
                        </Link>

                        <Link
                            to="/faculty/assignments"
                            className="p-3 bg-slate-950 border border-slate-800/60 rounded-xl hover:bg-slate-800/20 text-left transition-colors flex items-center gap-3 text-slate-300 hover:text-white"
                        >
                            <span>📝</span>
                            <div>
                                <h4 className="font-bold text-xs">Assignments Desk</h4>
                                <p className="text-[10px] text-slate-500">Grade submissions & allocate homework</p>
                            </div>
                        </Link>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default FacultyDashboard;
