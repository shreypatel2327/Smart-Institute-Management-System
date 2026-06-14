import React, { useEffect, useState } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import { api } from '../../context/AuthContext';
import { Link } from 'react-router-dom';

const OnlineClass = () => {
    const [meetings, setMeetings] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('/api/students/online-classes')
            .then(res => setMeetings(res.data))
            .catch(err => console.error('Error fetching online classes', err))
            .finally(() => setLoading(false));
    }, []);

    return (
        <DashboardLayout title="Virtual Classroom - Jitsi Meet">
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
                <div className="border-b border-slate-800 pb-4 mb-6">
                    <h3 className="text-base font-bold text-white">Interactive Video Classes</h3>
                    <p className="text-xs text-slate-500 mt-1">Join scheduled live video rooms with screensharing and chat features</p>
                </div>

                {loading ? (
                    <div className="flex justify-center py-12">
                        <div className="h-6 w-6 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent"></div>
                    </div>
                ) : meetings.length === 0 ? (
                    <div className="text-center py-12 text-slate-500 text-sm">
                        No online lectures are active or upcoming for your batch.
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {meetings.map((item) => (
                            <div key={item.id} className="p-5 bg-slate-950 border border-slate-800/80 rounded-2xl flex flex-col justify-between hover:border-slate-700 transition-colors">
                                <div className="space-y-2 text-left">
                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-950/30 text-emerald-400 border border-emerald-900">
                                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400"></span>
                                        {item.status || 'SCHEDULED'}
                                    </span>
                                    <h4 className="font-bold text-white text-base mt-1">{item.title}</h4>
                                    <p className="text-xs text-slate-400">Subject: {item.subject.name}</p>
                                    <div className="text-[11px] text-slate-500 space-y-0.5">
                                        <p>Lecturer: Prof. {item.faculty.user.firstName} {item.faculty.user.lastName}</p>
                                        <p>Scheduled: {new Date(item.scheduledTime).toLocaleString()}</p>
                                        <p>Duration: {item.durationMinutes} minutes</p>
                                    </div>
                                </div>

                                <div className="mt-6">
                                    <Link
                                        to={`/shared/online-classroom?meetingId=${item.meetingId}&title=${encodeURIComponent(item.title)}`}
                                        className="w-full inline-flex items-center justify-center py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 text-xs font-bold rounded-xl shadow-lg shadow-emerald-500/10 transition-all"
                                    >
                                        Join Video Room
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
};

export default OnlineClass;
