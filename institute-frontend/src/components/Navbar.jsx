import React from 'react';
import { useAuth } from '../context/AuthContext';

const Navbar = ({ title }) => {
    const { user } = useAuth();
    if (!user) return null;

    const today = new Date().toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });

    return (
        <header className="h-16 bg-slate-900 border-b border-slate-800 text-slate-300 flex items-center justify-between px-8 sticky top-0 z-40">
            {/* Page title */}
            <div>
                <h2 className="text-lg font-bold text-white tracking-tight">{title || 'Smart Institute Portal'}</h2>
            </div>

            {/* Right side controls */}
            <div className="flex items-center gap-6">
                {/* Date display */}
                <div className="hidden md:flex flex-col text-right">
                    <span className="text-xs text-slate-400 font-semibold">{today}</span>
                    <span className="text-[10px] text-slate-500 font-medium">Server Status: Online</span>
                </div>

                {/* Notifications Dot */}
                <div className="relative h-9 w-9 rounded-lg hover:bg-slate-800 flex items-center justify-center cursor-pointer border border-slate-800/80 transition-colors">
                    <span className="text-base">🔔</span>
                    <span className="absolute top-1.5 right-1.5 h-2 w-2 bg-emerald-500 rounded-full ring-2 ring-slate-900 animate-pulse"></span>
                </div>

                {/* Greeting badge */}
                <div className="flex items-center gap-3 border-l border-slate-800 pl-6">
                    <div className="text-right">
                        <span className="text-xs text-slate-400 block font-semibold">Welcome back,</span>
                        <span className="text-xs font-bold text-white block capitalize">{user.username}</span>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Navbar;
