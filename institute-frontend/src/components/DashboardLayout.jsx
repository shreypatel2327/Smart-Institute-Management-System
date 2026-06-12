import React from 'react';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

const DashboardLayout = ({ title, children }) => {
    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 flex">
            {/* Left Sidebar */}
            <Sidebar />

            {/* Right main frame */}
            <div className="flex-1 ml-64 flex flex-col min-h-screen">
                {/* Header Navbar */}
                <Navbar title={title} />

                {/* Main page content container */}
                <main className="flex-1 p-8 bg-slate-950 overflow-y-auto">
                    <div className="max-w-7xl mx-auto space-y-8 animate-fade-in">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default DashboardLayout;
