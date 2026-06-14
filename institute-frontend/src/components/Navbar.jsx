import React, { useEffect, useState, useRef } from 'react';
import { api, useAuth } from '../context/AuthContext';

const Navbar = ({ title }) => {
    const { user } = useAuth();
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    const loadNotifications = async () => {
        if (!user) return;
        try {
            const res = await api.get('/api/notifications/my-inbox');
            setNotifications(res.data);
            setUnreadCount(res.data.length);
        } catch (err) {
            console.error('Error fetching notifications in Navbar:', err);
        }
    };

    useEffect(() => {
        loadNotifications();
        const interval = setInterval(loadNotifications, 30000);
        return () => clearInterval(interval);
    }, [user]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

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

                {/* Notifications Dot & Dropdown */}
                <div className="relative" ref={dropdownRef}>
                    <button
                        onClick={() => setDropdownOpen(!dropdownOpen)}
                        className="relative h-9 w-9 rounded-lg hover:bg-slate-800 flex items-center justify-center cursor-pointer border border-slate-800/80 transition-colors focus:outline-none"
                    >
                        <span className="text-base">🔔</span>
                        {unreadCount > 0 && (
                            <span className="absolute top-1.5 right-1.5 h-2.5 w-2.5 bg-emerald-500 rounded-full ring-2 ring-slate-900 animate-pulse"></span>
                        )}
                    </button>

                    {dropdownOpen && (
                        <div className="absolute right-0 mt-3 w-80 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl z-50 text-left overflow-hidden">
                            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
                                <h3 className="font-bold text-white text-xs uppercase tracking-wider">Notice Board ({unreadCount})</h3>
                                <button onClick={() => setDropdownOpen(false)} className="text-[10px] text-slate-500 hover:text-slate-350">Close</button>
                            </div>
                            <div className="max-h-80 overflow-y-auto divide-y divide-slate-850 scrollbar-thin">
                                {notifications.length === 0 ? (
                                    <div className="p-6 text-center text-xs text-slate-500">
                                        No notices or messages received.
                                    </div>
                                ) : (
                                    notifications.map((notif) => (
                                        <div key={notif.id} className="p-4 hover:bg-slate-950/40 transition-colors space-y-1">
                                            <div className="flex justify-between items-start gap-2">
                                                <h4 className="font-bold text-white text-[11px] truncate">{notif.title}</h4>
                                                <span className="text-[9px] text-slate-600 font-mono whitespace-nowrap">
                                                    {new Date(notif.createdAt).toLocaleDateString()}
                                                </span>
                                            </div>
                                            <p className="text-[10px] text-slate-400 leading-normal">{notif.message}</p>
                                            
                                            {notif.attachmentUrl && (
                                                <div className="pt-1.5">
                                                    <a
                                                        href={`http://localhost:9998/${notif.attachmentUrl}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="inline-flex items-center gap-1 text-[9px] font-bold text-emerald-400 hover:underline"
                                                    >
                                                        📎 Attachment File
                                                    </a>
                                                </div>
                                            )}
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    )}
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
