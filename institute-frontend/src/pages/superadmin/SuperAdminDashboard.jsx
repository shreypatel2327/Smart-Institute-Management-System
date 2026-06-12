import React, { useEffect, useState } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import { api } from '../../context/AuthContext';
import { Bar, Pie } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

const SuperAdminDashboard = () => {
    const [feesData, setFeesData] = useState(null);
    const [batchesData, setBatchesData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadDashboard = async () => {
            try {
                const feesRes = await api.get('/api/superadmins/dashboard/fees');
                setFeesData(feesRes.data);

                const batchRes = await api.get('/api/superadmins/dashboard/batches');
                setBatchesData(batchRes.data);
            } catch (error) {
                console.error('Error fetching super admin dashboard', error);
            } finally {
                setLoading(false);
            }
        };

        loadDashboard();
    }, []);

    if (loading) {
        return (
            <DashboardLayout title="Super Admin Dashboard">
                <div className="flex h-64 items-center justify-center">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent"></div>
                </div>
            </DashboardLayout>
        );
    }

    // Chart.js: Financial Revenue Collected vs Outstanding pending balance (Pie Chart)
    const financialPieData = {
        labels: ['Fees Collected', 'Fees Outstanding (Pending)'],
        datasets: [
            {
                data: [feesData?.totalFeesCollected || 0, feesData?.totalPendingFees || 0],
                backgroundColor: ['rgba(34, 197, 94, 0.75)', 'rgba(239, 68, 68, 0.75)'],
                borderColor: ['rgba(34, 197, 94, 1)', 'rgba(239, 68, 68, 1)'],
                borderWidth: 1,
            },
        ],
    };

    // Chart.js: Student distribution per batch (Bar Chart)
    const batchBarData = {
        labels: batchesData?.batchLabels || [],
        datasets: [
            {
                label: 'Students Enrolled',
                data: batchesData?.batchStudentCounts || [],
                backgroundColor: 'rgba(20, 184, 166, 0.6)',
                borderColor: 'rgba(20, 184, 166, 1)',
                borderWidth: 1.5,
            },
        ],
    };

    return (
        <DashboardLayout title="Super Administrative Executive Dashboard">
            {/* Overview Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex items-center gap-4">
                    <div className="h-10 w-10 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-450 text-xl font-bold">
                        💰
                    </div>
                    <div className="text-left">
                        <span className="text-[10px] text-slate-500 font-semibold block uppercase">Total Collected</span>
                        <span className="text-lg font-bold text-white block mt-0.5">₹{feesData?.totalFeesCollected}</span>
                    </div>
                </div>

                <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex items-center gap-4">
                    <div className="h-10 w-10 rounded-lg bg-rose-500/10 flex items-center justify-center text-rose-455 text-xl font-bold">
                        💸
                    </div>
                    <div className="text-left">
                        <span className="text-[10px] text-slate-500 font-semibold block uppercase">Outstanding Dues</span>
                        <span className="text-lg font-bold text-white block mt-0.5">₹{feesData?.totalPendingFees}</span>
                    </div>
                </div>

                <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex items-center gap-4">
                    <div className="h-10 w-10 rounded-lg bg-teal-500/10 flex items-center justify-center text-teal-400 text-xl font-bold">
                        🏫
                    </div>
                    <div className="text-left">
                        <span className="text-[10px] text-slate-500 font-semibold block uppercase">Total Batches</span>
                        <span className="text-lg font-bold text-white block mt-0.5">{batchesData?.totalBatches} Batches</span>
                    </div>
                </div>

                <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex items-center gap-4">
                    <div className="h-10 w-10 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400 text-xl font-bold">
                        👥
                    </div>
                    <div className="text-left">
                        <span className="text-[10px] text-slate-500 font-semibold block uppercase">Total Students</span>
                        <span className="text-lg font-bold text-white block mt-0.5">{batchesData?.studentCount} Students</span>
                    </div>
                </div>
            </div>

            {/* Visual Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Batch Distribution Bar Chart */}
                <div className="lg:col-span-2 bg-slate-900 border border-slate-800 p-6 rounded-2xl text-left space-y-4">
                    <h3 className="font-bold text-white text-base">Students Batch Distribution</h3>
                    <p className="text-xs text-slate-500">Compare headcount sizing across different active courses</p>
                    <div className="h-64 flex items-center justify-center">
                        <Bar
                            data={batchBarData}
                            options={{
                                responsive: true,
                                maintainAspectRatio: false,
                                plugins: { legend: { display: false } },
                                scales: {
                                    y: { ticks: { color: '#64748b' }, grid: { color: 'rgba(51, 65, 85, 0.3)' } },
                                    x: { ticks: { color: '#64748b' }, grid: { display: false } }
                                }
                            }}
                        />
                    </div>
                </div>

                {/* Financial Pie Chart */}
                <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl text-left space-y-4 flex flex-col justify-between">
                    <div>
                        <h3 className="font-bold text-white text-base">Fees Revenue Status</h3>
                        <p className="text-xs text-slate-500">Collected amounts vs outstanding billing balances</p>
                    </div>
                    <div className="h-56 flex items-center justify-center relative">
                        <Pie
                            data={financialPieData}
                            options={{
                                responsive: true,
                                maintainAspectRatio: false,
                                plugins: {
                                    legend: { labels: { color: '#94a3b8' } }
                                }
                            }}
                        />
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default SuperAdminDashboard;
