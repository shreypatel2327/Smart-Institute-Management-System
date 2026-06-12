import React, { useEffect, useState } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import { api } from '../../context/AuthContext';

const Timetable = () => {
    const [timetable, setTimetable] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('/api/students/timetable')
            .then(res => setTimetable(res.data))
            .catch(err => console.error('Error fetching timetable', err))
            .finally(() => setLoading(false));
    }, []);

    return (
        <DashboardLayout title="Weekly Lecture Schedule">
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
                <div className="border-b border-slate-800 pb-4 mb-6">
                    <h3 className="text-base font-bold text-white">Batch Lectures Outline</h3>
                    <p className="text-xs text-slate-500 mt-1">Review your subject timings and lecturer assignments</p>
                </div>

                {loading ? (
                    <div className="flex justify-center py-12">
                        <div className="h-6 w-6 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent"></div>
                    </div>
                ) : timetable.length === 0 ? (
                    <div className="text-center py-12 text-slate-500 text-sm">
                        No timetable slots mapped to your batch. Please check back later.
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-sm">
                            <thead>
                                <tr className="border-b border-slate-800 text-slate-400 text-xs font-semibold uppercase">
                                    <th className="py-3 px-4">Day</th>
                                    <th className="py-3 px-4">Timings</th>
                                    <th className="py-3 px-4">Subject</th>
                                    <th className="py-3 px-4">Faculty</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/60">
                                {timetable.map((item) => (
                                    <tr key={item.id} className="hover:bg-slate-800/30 transition-colors">
                                        <td className="py-3.5 px-4 font-semibold text-white">{item.dayOfWeek}</td>
                                        <td className="py-3.5 px-4 text-emerald-400 font-medium">{item.startTime} - {item.endTime}</td>
                                        <td className="py-3.5 px-4 text-slate-300">
                                            <span className="font-bold text-xs bg-slate-950 px-2 py-1 rounded text-slate-400 border border-slate-800/80 mr-2">
                                                {item.subject.code}
                                            </span>
                                            {item.subject.name}
                                        </td>
                                        <td className="py-3.5 px-4 text-slate-400">
                                            Prof. {item.faculty.user.firstName} {item.faculty.user.lastName}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
};

export default Timetable;
