import React, { useEffect, useState } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import { api } from '../../context/AuthContext';
import { Bar } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const SuperAdminDashboard = () => {
    const [batchesData, setBatchesData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadDashboard = async () => {
            try {
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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

                <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex items-center gap-4">
                    <div className="h-10 w-10 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-450 text-xl font-bold">
                        🧑‍🏫
                    </div>
                    <div className="text-left">
                        <span className="text-[10px] text-slate-500 font-semibold block uppercase">Total Faculty</span>
                        <span className="text-lg font-bold text-white block mt-0.5">{batchesData?.facultyCount} Instructors</span>
                    </div>
                </div>
            </div>

            {/* Visual Charts Row */}
            <div className="mt-6">
                {/* Batch Distribution Bar Chart */}
                <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl text-left space-y-4">
                    <h3 className="font-bold text-white text-base">Students Batch Distribution</h3>
                    <p className="text-xs text-slate-500">Compare headcount sizing across different active courses</p>
                    <div className="h-80 flex items-center justify-center">
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
            </div>
        </DashboardLayout>
    );
};

export default SuperAdminDashboard;
