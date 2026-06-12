import React, { useEffect, useState } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import { api } from '../../context/AuthContext';
import { Link } from 'react-router-dom';

const StudentDashboard = () => {
    const [profile, setProfile] = useState(null);
    const [notifications, setNotifications] = useState([]);
    const [lectures, setLectures] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                // Fetch student profile
                const profRes = await api.get('/api/students/profile');
                setProfile(profRes.data);

                // Fetch student notifications
                const notifRes = await api.get('/api/students/notifications');
                setNotifications(notifRes.data.slice(0, 5)); // recent 5

                // Fetch student online classes
                const classRes = await api.get('/api/students/online-classes');
                setLectures(classRes.data);
            } catch (error) {
                console.error('Error fetching student dashboard info', error);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    if (loading) {
        return (
            <DashboardLayout title="Student Dashboard">
                <div className="flex h-64 items-center justify-center">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent"></div>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout title="Welcome back to your Study Desk">
            {/* Top overview cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex items-center gap-5">
                    <div className="h-12 w-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 text-2xl">
                        📚
                    </div>
                    <div>
                        <span className="text-xs text-slate-500 font-semibold block uppercase">Assigned Batch</span>
                        <span className="text-base font-bold text-white block">
                            {profile?.batch ? profile.batch.name : 'Not Assigned Yet'}
                        </span>
                        {profile?.batch && (
                            <span className="text-[10px] text-slate-400 font-medium block mt-0.5">
                                Code: {profile.batch.code} | Schedule: {profile.batch.timings}
                            </span>
                        )}
                    </div>
                </div>

                <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex items-center gap-5">
                    <div className="h-12 w-12 rounded-xl bg-teal-500/10 flex items-center justify-center text-teal-400 text-2xl">
                        🆔
                    </div>
                    <div>
                        <span className="text-xs text-slate-500 font-semibold block uppercase">Student ID / Roll No</span>
                        <span className="text-base font-bold text-white block">{profile?.rollNumber || 'STU-PENDING'}</span>
                        <span className="text-[10px] text-slate-500 font-medium block mt-0.5">City: {profile?.city || 'Not specified'}</span>
                    </div>
                </div>

                <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex items-center gap-5">
                    <div className="h-12 w-12 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 text-2xl">
                        🛡️
                    </div>
                    <div>
                        <span className="text-xs text-slate-500 font-semibold block uppercase">Account Status</span>
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-950/30 text-emerald-400 border border-emerald-900 mt-1">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400"></span>
                            {profile?.status || 'ACTIVE'}
                        </span>
                    </div>
                </div>
            </div>

            {/* Bottom layout panels split */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left col: classes list */}
                <div className="lg:col-span-2 space-y-6 bg-slate-900 border border-slate-800 p-6 rounded-2xl">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                        <h3 className="font-bold text-white text-base">Virtual Classes ({lectures.length})</h3>
                        <Link to="/student/online-class" className="text-xs font-bold text-emerald-400 hover:underline">
                            View All →
                        </Link>
                    </div>

                    {lectures.length === 0 ? (
                        <p className="text-slate-500 text-sm py-4">No online classes scheduled for your batch at this moment.</p>
                    ) : (
                        <div className="space-y-4">
                            {lectures.map((item) => (
                                <div key={item.id} className="flex items-center justify-between p-4 bg-slate-950 border border-slate-800/80 rounded-xl">
                                    <div>
                                        <h4 className="font-semibold text-white text-sm">{item.title}</h4>
                                        <p className="text-xs text-slate-400 mt-1">
                                            Subject: {item.subject.name} | Faculty: {item.faculty.user.firstName} {item.faculty.user.lastName}
                                        </p>
                                    </div>
                                    <a
                                        href={item.meetingLink}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold rounded-lg transition-colors shadow-lg shadow-emerald-500/10"
                                    >
                                        Join Meeting
                                    </a>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Right col: notifications list */}
                <div className="space-y-6 bg-slate-900 border border-slate-800 p-6 rounded-2xl">
                    <div className="border-b border-slate-800 pb-4">
                        <h3 className="font-bold text-white text-base">Notice Board</h3>
                    </div>

                    {notifications.length === 0 ? (
                        <p className="text-slate-500 text-sm py-4">No notifications posted yet.</p>
                    ) : (
                        <div className="space-y-4">
                            {notifications.map((notif) => (
                                <div key={notif.id} className="p-3.5 bg-slate-950/60 border border-slate-800/50 rounded-xl">
                                    <span className="text-[10px] text-slate-500 font-semibold block">
                                        Posted on: {new Date(notif.createdAt).toLocaleDateString()}
                                    </span>
                                    <h4 className="font-bold text-white text-xs mt-1 truncate">{notif.title}</h4>
                                    <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">{notif.message}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
};

export default StudentDashboard;
