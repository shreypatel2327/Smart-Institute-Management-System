import React, { useEffect, useState } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import { api } from '../../context/AuthContext';
import { Link } from 'react-router-dom';

const AdminDashboard = () => {
    const [stats, setStats] = useState({ students: 0, faculty: 0, batches: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadStats = async () => {
            try {
                const stdRes = await api.get('/api/admins/students');
                const facRes = await api.get('/api/admins/faculties');
                const batRes = await api.get('/api/admins/batches');
                setStats({
                    students: stdRes.data.length,
                    faculty: facRes.data.length,
                    batches: batRes.data.length
                });
            } catch (error) {
                console.error('Error fetching admin dashboard statistics', error);
            } finally {
                setLoading(false);
            }
        };

        loadStats();
    }, []);

    const statCards = [
        { label: 'Total Enrolled Students', count: stats.students, color: 'text-emerald-400', bg: 'bg-emerald-500/10', icon: '👥', link: '/admin/students' },
        { label: 'Active Faculty Members', count: stats.faculty, color: 'text-indigo-400', bg: 'bg-indigo-500/10', icon: '👨‍🏫', link: '/admin/faculty' },
        { label: 'Scheduled Batches', count: stats.batches, color: 'text-teal-400', bg: 'bg-teal-500/10', icon: '🏫', link: '/admin/batches' }
    ];

    return (
        <DashboardLayout title="System Administration Center">
            {/* Overview Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {statCards.map((card) => (
                    <div key={card.label} className="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex items-center justify-between">
                        <div className="flex items-center gap-5">
                            <div className={`h-12 w-12 rounded-xl ${card.bg} flex items-center justify-center ${card.color} text-2xl`}>
                                {card.icon}
                            </div>
                            <div>
                                <span className="text-xs text-slate-500 font-semibold block uppercase">{card.label}</span>
                                <span className="text-2xl font-bold text-white block mt-0.5">{card.count}</span>
                            </div>
                        </div>
                        <Link to={card.link} className="text-slate-600 hover:text-white transition-colors text-lg">
                            ➡️
                        </Link>
                    </div>
                ))}
            </div>

            {/* Quick Actions Panel */}
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl text-left space-y-6">
                <div className="border-b border-slate-800 pb-4">
                    <h3 className="font-bold text-white text-base">Administrative Quick Actions</h3>
                    <p className="text-xs text-slate-500 mt-1">Control system records, batch allocation mappings, and certificates dispatch</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Link
                        to="/admin/students"
                        className="p-4 bg-slate-950 border border-slate-800 hover:border-slate-700 rounded-xl transition-all duration-200 hover:bg-slate-800/10 block space-y-2"
                    >
                        <span className="text-2xl block">👥</span>
                        <h4 className="font-bold text-xs text-white">Enroll Student</h4>
                        <p className="text-[10px] text-slate-500">Create login credentials & profile</p>
                    </Link>

                    <Link
                        to="/admin/faculty"
                        className="p-4 bg-slate-950 border border-slate-800 hover:border-slate-700 rounded-xl transition-all duration-200 hover:bg-slate-800/10 block space-y-2"
                    >
                        <span className="text-2xl block">👨‍🏫</span>
                        <h4 className="font-bold text-xs text-white">Recruit Faculty</h4>
                        <p className="text-[10px] text-slate-500">Add instructors & qualifications</p>
                    </Link>

                    <Link
                        to="/admin/mapping"
                        className="p-4 bg-slate-950 border border-slate-800 hover:border-slate-700 rounded-xl transition-all duration-200 hover:bg-slate-800/10 block space-y-2"
                    >
                        <span className="text-2xl block">🔗</span>
                        <h4 className="font-bold text-xs text-white">Batch Mapping</h4>
                        <p className="text-[10px] text-slate-500">Assign students to classes</p>
                    </Link>

                    <Link
                        to="/admin/certificates"
                        className="p-4 bg-slate-950 border border-slate-800 hover:border-slate-700 rounded-xl transition-all duration-200 hover:bg-slate-800/10 block space-y-2"
                    >
                        <span className="text-2xl block">🎓</span>
                        <h4 className="font-bold text-xs text-white">Certificates</h4>
                        <p className="text-[10px] text-slate-500">Generate verified completion PDFs</p>
                    </Link>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default AdminDashboard;
