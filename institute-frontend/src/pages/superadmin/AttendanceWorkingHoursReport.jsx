import React, { useEffect, useState } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import { api } from '../../context/AuthContext';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const AttendanceWorkingHoursReport = () => {
    const [reports, setReports] = useState({ studentReports: [], facultyReports: [] });
    const [loading, setLoading] = useState(true);
    const [minLectureDuration, setMinLectureDuration] = useState(5);
    const [reportTab, setReportTab] = useState('STUDENT'); // STUDENT, FACULTY
    const [expandedRow, setExpandedRow] = useState(null); // ID of expanded user row
    const [selectedImage, setSelectedImage] = useState(null); // Modal viewer image url

    const loadReports = async () => {
        setLoading(true);
        try {
            const res = await api.get(`/api/meetings/attendance-reports?minLectureDuration=${minLectureDuration}`);
            setReports(res.data);
        } catch (err) {
            console.error('Error fetching analytics:', err);
            toast.error('Failed to load attendance & working hours reports.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadReports();
    }, [minLectureDuration]);

    const toggleRow = (id) => {
        setExpandedRow(prev => prev === id ? null : id);
    };

    return (
        <DashboardLayout title="Attendance & Working Hours Analytics Center">
            <ToastContainer theme="dark" />

            <div className="space-y-6 text-left">
                {/* Control bar */}
                <div className="flex flex-col md:flex-row md:items-center justify-between bg-slate-900 border border-slate-800 p-5 rounded-2xl gap-4">
                    <div>
                        <h3 className="font-bold text-white text-base">ERP Analytics Reports</h3>
                        <p className="text-xs text-slate-500 mt-1">Review check-in/check-out logs, lecture durations, and screenshot proofs</p>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <span className="text-xs text-slate-400 font-semibold whitespace-nowrap">Min Duration (Mins):</span>
                            <input
                                type="number"
                                value={minLectureDuration}
                                onChange={(e) => setMinLectureDuration(Math.max(1, parseInt(e.target.value) || 1))}
                                className="w-16 px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs font-mono text-center"
                            />
                        </div>

                        <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800">
                            <button
                                onClick={() => { setReportTab('STUDENT'); setExpandedRow(null); }}
                                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                                    reportTab === 'STUDENT' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400 hover:text-slate-200'
                                }`}
                            >
                                Students
                            </button>
                            <button
                                onClick={() => { setReportTab('FACULTY'); setExpandedRow(null); }}
                                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                                    reportTab === 'FACULTY' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400 hover:text-slate-200'
                                }`}
                            >
                                Faculty
                            </button>
                        </div>
                    </div>
                </div>

                {/* Main Data Report */}
                {loading ? (
                    <div className="bg-slate-900 border border-slate-800 p-12 rounded-2xl flex justify-center">
                        <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent"></div>
                    </div>
                ) : (
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
                        {reportTab === 'STUDENT' ? (
                            /* STUDENT ATTENDANCE REPORT */
                            <div>
                                <table className="w-full text-xs text-left">
                                    <thead>
                                        <tr className="border-b border-slate-850 bg-slate-950/50 text-slate-400 uppercase text-[9px] tracking-wider">
                                            <th className="py-3.5 px-6">Roll No</th>
                                            <th className="py-3.5 px-4">Student Name</th>
                                            <th className="py-3.5 px-4">Batch</th>
                                            <th className="py-3.5 px-4 text-center">Classes Attended</th>
                                            <th className="py-3.5 px-4 text-center">Total Attendance Hours</th>
                                            <th className="py-3.5 px-6 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-850 text-slate-300">
                                        {reports.studentReports.map(stu => (
                                            <React.Fragment key={stu.studentId}>
                                                <tr className={`hover:bg-slate-950/30 transition-colors ${expandedRow === stu.studentId ? 'bg-slate-950/20' : ''}`}>
                                                    <td className="py-3.5 px-6 font-mono font-bold text-white">{stu.rollNumber}</td>
                                                    <td className="py-3.5 px-4 font-semibold">{stu.name}</td>
                                                    <td className="py-3.5 px-4 text-slate-400">{stu.batch}</td>
                                                    <td className="py-3.5 px-4 text-center font-bold">
                                                        <span className="text-emerald-400">{stu.presentCount} Present</span>
                                                        <span className="text-slate-600 px-1">|</span>
                                                        <span className="text-red-400">{stu.absentCount} Absent</span>
                                                    </td>
                                                    <td className="py-3.5 px-4 text-center font-mono font-bold text-emerald-400">{stu.totalHours} hrs</td>
                                                    <td className="py-3.5 px-6 text-right">
                                                        <button
                                                            onClick={() => toggleRow(stu.studentId)}
                                                            className="text-xs font-bold text-emerald-400 hover:underline"
                                                        >
                                                            {expandedRow === stu.studentId ? 'Hide Details' : 'View Session Logs'}
                                                        </button>
                                                    </td>
                                                </tr>

                                                {/* Expanded Details Row */}
                                                {expandedRow === stu.studentId && (
                                                    <tr>
                                                        <td colSpan={6} className="bg-slate-950/60 p-6 border-b border-slate-800">
                                                            <div className="space-y-4">
                                                                <h4 className="font-bold text-white text-xs border-b border-slate-800 pb-2">Virtual Class Enrollment logs</h4>
                                                                
                                                                {stu.classes.length === 0 ? (
                                                                    <p className="text-slate-550 text-xs py-2">No class check-in details logged for this week.</p>
                                                                ) : (
                                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                                        {stu.classes.map((c, cIdx) => (
                                                                            <div key={cIdx} className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-2 relative">
                                                                                <div className="flex items-center justify-between">
                                                                                    <h5 className="font-bold text-white text-xs">{c.title}</h5>
                                                                                    <span className="text-[10px] text-slate-500 font-bold">{c.date}</span>
                                                                                </div>
                                                                                
                                                                                <div className="flex flex-wrap gap-2 text-[10px] pt-1">
                                                                                    <span className="text-slate-400">Host: {c.host}</span>
                                                                                    <span className="text-slate-600">|</span>
                                                                                    <span className="text-slate-400">Duration: {c.minutes} mins</span>
                                                                                </div>

                                                                                <div className="flex items-center gap-2 pt-2">
                                                                                    <span className={`px-2 py-0.5 rounded text-[9px] font-extrabold uppercase ${
                                                                                        c.isPresent ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
                                                                                    }`}>
                                                                                        {c.isPresent ? 'PRESENT' : 'ABSENT'}
                                                                                    </span>
                                                                                </div>
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </td>
                                                    </tr>
                                                )}
                                            </React.Fragment>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            /* FACULTY WORKING HOURS REPORT */
                            <div>
                                <table className="w-full text-xs text-left">
                                    <thead>
                                        <tr className="border-b border-slate-850 bg-slate-950/50 text-slate-400 uppercase text-[9px] tracking-wider">
                                            <th className="py-3.5 px-6">Employee ID</th>
                                            <th className="py-3.5 px-4">Faculty Name</th>
                                            <th className="py-3.5 px-4">Specialization</th>
                                            <th className="py-3.5 px-4 text-center">Meetings Hosted</th>
                                            <th className="py-3.5 px-4 text-center">Total Working Hours</th>
                                            <th className="py-3.5 px-6 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-850 text-slate-300">
                                        {reports.facultyReports.map(fac => (
                                            <React.Fragment key={fac.facultyId}>
                                                <tr className={`hover:bg-slate-950/30 transition-colors ${expandedRow === fac.facultyId ? 'bg-slate-950/20' : ''}`}>
                                                    <td className="py-3.5 px-6 font-mono font-bold text-white">{fac.employeeId}</td>
                                                    <td className="py-3.5 px-4 font-semibold">{fac.name}</td>
                                                    <td className="py-3.5 px-4 text-slate-400">{fac.specialization}</td>
                                                    <td className="py-3.5 px-4 text-center font-bold text-white">{fac.meetings.length} classes</td>
                                                    <td className="py-3.5 px-4 text-center font-mono font-bold text-emerald-400">{fac.totalHours} hrs</td>
                                                    <td className="py-3.5 px-6 text-right">
                                                        <button
                                                            onClick={() => toggleRow(fac.facultyId)}
                                                            className="text-xs font-bold text-emerald-400 hover:underline"
                                                        >
                                                            {expandedRow === fac.facultyId ? 'Hide Details' : 'View Hosting Logs'}
                                                        </button>
                                                    </td>
                                                </tr>

                                                {/* Expanded Details Row */}
                                                {expandedRow === fac.facultyId && (
                                                    <tr>
                                                        <td colSpan={6} className="bg-slate-950/60 p-6 border-b border-slate-800">
                                                            <div className="space-y-4">
                                                                <h4 className="font-bold text-white text-xs border-b border-slate-800 pb-2">Virtual Class Host Session logs</h4>
                                                                
                                                                {fac.meetings.length === 0 ? (
                                                                    <p className="text-slate-550 text-xs py-2">No meeting host details logged for this week.</p>
                                                                ) : (
                                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                                        {fac.meetings.map((m, mIdx) => (
                                                                            <div key={mIdx} className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-2">
                                                                                <div className="flex items-center justify-between">
                                                                                    <h5 className="font-bold text-white text-xs">Jitsi ID: {m.meetingId}</h5>
                                                                                    <span className="text-[10px] text-slate-550 font-bold">{m.date}</span>
                                                                                </div>

                                                                                <div className="text-[10px] text-slate-400 space-y-1">
                                                                                    <div>Check-in: {new Date(m.startTime).toLocaleTimeString()}</div>
                                                                                    <div>Check-out: {m.endTime !== 'Ongoing' ? new Date(m.endTime).toLocaleTimeString() : 'Ongoing'}</div>
                                                                                    <div>Duration: {m.durationMinutes} minutes</div>
                                                                                </div>
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </td>
                                                    </tr>
                                                )}
                                            </React.Fragment>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* High-fidelity Lightbox viewer modal */}
            {selectedImage && (
                <div
                    className="fixed inset-0 bg-black/90 backdrop-blur z-50 flex items-center justify-center p-4 cursor-zoom-out"
                    onClick={() => setSelectedImage(null)}
                >
                    <div className="max-w-3xl max-h-[90vh] bg-slate-900 border border-slate-800 p-2 rounded-2xl relative">
                        <img
                            src={selectedImage}
                            alt="Attendance screenshot lightbox"
                            className="max-w-full max-h-[80vh] rounded-xl object-contain"
                        />
                        <div className="absolute top-4 right-4 h-8 w-8 bg-black/60 rounded-full flex items-center justify-center text-white text-sm font-bold cursor-pointer hover:bg-black">
                            ✕
                        </div>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
};

export default AttendanceWorkingHoursReport;
