import React, { useEffect, useState } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import { api } from '../../context/AuthContext';
import { Link } from 'react-router-dom';

const AdmissionDashboard = () => {
    const [reports, setReports] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('/api/admissions/reports')
            .then(res => setReports(res.data))
            .catch(err => console.error('Error fetching reports', err))
            .finally(() => setLoading(false));
    }, []);

    if (loading) {
        return (
            <DashboardLayout title="Admission Department Portal">
                <div className="flex h-64 items-center justify-center">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent"></div>
                </div>
            </DashboardLayout>
        );
    }

    const cards = [
        { label: 'Total Registered Leads', value: reports?.totalLeads, color: 'text-indigo-400', bg: 'bg-indigo-500/10', subtitle: 'All time inquiries count' },
        { label: 'Converted Admissions', value: reports?.admittedStudents, color: 'text-emerald-400', bg: 'bg-emerald-500/10', subtitle: 'Successful conversions' },
        { label: 'Conversion Performance', value: `${reports?.conversionRatePercentage?.toFixed(1)}%`, color: 'text-teal-400', bg: 'bg-teal-500/10', subtitle: 'Funnel efficiency rate' }
    ];

    return (
        <DashboardLayout title="Admissions & Inquiry Desk">
            {/* Overview Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {cards.map(card => (
                    <div key={card.label} className="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex items-center gap-5">
                        <div className={`h-12 w-12 rounded-xl ${card.bg} flex items-center justify-center ${card.color} text-2xl`}>
                            📈
                        </div>
                        <div>
                            <span className="text-xs text-slate-500 font-semibold block uppercase">{card.label}</span>
                            <span className="text-2xl font-bold text-white block mt-0.5">{card.value}</span>
                            <span className="text-[10px] text-slate-400 block mt-0.5">{card.subtitle}</span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Quick Actions Panel */}
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl text-left space-y-6">
                <div className="border-b border-slate-800 pb-4">
                    <h3 className="font-bold text-white text-base">Admission Team Actions</h3>
                    <p className="text-xs text-slate-500 mt-1">Directly access lead tracking pipelines and student account activation desks</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Link
                        to="/admission/pipeline"
                        className="p-4 bg-slate-950 border border-slate-800 hover:border-slate-700 rounded-xl transition-all duration-200 hover:bg-slate-800/10 block space-y-2"
                    >
                        <span className="text-2xl block">⚡</span>
                        <h4 className="font-bold text-xs text-white">Lead Funnel Pipeline</h4>
                        <p className="text-[10px] text-slate-500">Track and follow-up incoming inquiries</p>
                    </Link>

                    <Link
                        to="/admission/fees"
                        className="p-4 bg-slate-950 border border-slate-800 hover:border-slate-700 rounded-xl transition-all duration-200 hover:bg-slate-800/10 block space-y-2"
                    >
                        <span className="text-2xl block">💵</span>
                        <h4 className="font-bold text-xs text-white">Fees Manager</h4>
                        <p className="text-[10px] text-slate-500">Audit student payment receipts & invoices</p>
                    </Link>

                    <Link
                        to="/admin/students"
                        className="p-4 bg-slate-950 border border-slate-800 hover:border-slate-700 rounded-xl transition-all duration-200 hover:bg-slate-800/10 block space-y-2"
                    >
                        <span className="text-2xl block">🔓</span>
                        <h4 className="font-bold text-xs text-white">Revoke/Activate Student Access</h4>
                        <p className="text-[10px] text-slate-500">Control active portal permissions</p>
                    </Link>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default AdmissionDashboard;
