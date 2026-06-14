import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Sidebar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    if (!user) return null;

    const roleName = user.role.replace('ROLE_', '').replace('_', ' ');

    // Define navigation links for each role
    const linksByRole = {
        ROLE_STUDENT: [
            { path: '/student', label: 'Dashboard', icon: '📊' },
            { path: '/student/timetable', label: 'My Timetable', icon: '📅' },
            { path: '/student/materials', label: 'Study Materials', icon: '📚' },
            { path: '/student/videos', label: 'Video Tutorials', icon: '🎥' },
            { path: '/student/ide', label: 'Monaco IDE', icon: '💻' },
            { path: '/student/online-class', label: 'Join Online Class', icon: '🌐' },
            { path: '/student/feedback', label: 'Faculty Feedback', icon: '✍️' },
            { path: '/student/assignments', label: 'My Assignments', icon: '📝' },
            { path: '/student/certificates', label: 'My Certificates', icon: '🎓' },
            { path: '/shared/dynamic-forms', label: 'Dynamic Forms', icon: '📋' },
            { path: '/shared/quizzes', label: 'Online Quizzes', icon: '📝' },
            { path: '/shared/complaints-leaves', label: 'Complaints & Leaves', icon: '😠' },
            { path: '/shared/broadcaster', label: 'Message Desk', icon: '📢' }
        ],
        ROLE_FACULTY: [
            { path: '/faculty', label: 'Dashboard', icon: '📊' },
            { path: '/faculty/lectures', label: 'Manage Lectures', icon: '🏫' },
            { path: '/faculty/materials', label: 'Upload Materials', icon: '📤' },
            { path: '/faculty/videos', label: 'Video Uploads', icon: '📹' },
            { path: '/faculty/assignments', label: 'Assignments Desk', icon: '📝' },
            { path: '/faculty/online-classes', label: 'Schedule Jitsi Meeting', icon: '🌐' },
            { path: '/shared/broadcaster', label: 'Broadcaster Desk', icon: '📢' },
            { path: '/shared/ai-assistant', label: 'AI Assistant Content', icon: '🔮' },
            { path: '/shared/quizzes', label: 'Quizzes Desk', icon: '📝' },
            { path: '/shared/complaints-leaves', label: 'Complaints & Leaves', icon: '😠' }
        ],
        ROLE_ADMIN: [
            { path: '/admin', label: 'Dashboard', icon: '📊' },
            { path: '/admin/students', label: 'Manage Students', icon: '👥' },
            { path: '/admin/faculty', label: 'Manage Faculty', icon: '👨‍🏫' },
            { path: '/admin/batches', label: 'Manage Batches', icon: '🏫' },
            { path: '/admin/mapping', label: 'Batch Mapping', icon: '🔗' },
            { path: '/admin/certificates', label: 'Certificates Center', icon: '🎓' },
            { path: '/shared/broadcaster', label: 'Broadcast Center', icon: '📢' },
            { path: '/shared/ai-assistant', label: 'AI Generator', icon: '🔮' },
            { path: '/shared/dynamic-forms', label: 'Dynamic Forms', icon: '📋' },
            { path: '/shared/quizzes', label: 'Quizzes Desk', icon: '📝' },
            { path: '/shared/complaints-leaves', label: 'Complaints & Leaves', icon: '😠' }
        ],
        ROLE_SUPER_ADMIN: [
            { path: '/superadmin', label: 'Dashboard', icon: '📊' },
            { path: '/superadmin/staff', label: 'Manage Admin/Staff', icon: '👥' },
            { path: '/admin/students', label: 'Institute Students', icon: '👥' },
            { path: '/superadmin/batch-chart', label: 'Batch Distribution', icon: '📈' },
            { path: '/superadmin/attendance-reports', label: 'Attendance & Analytics', icon: '📈' },
            { path: '/shared/broadcaster', label: 'Broadcast Center', icon: '📢' },
            { path: '/shared/ai-assistant', label: 'AI Form Generator', icon: '🔮' },
            { path: '/shared/complaints-leaves', label: 'Complaints & Leaves', icon: '😠' }
        ]
    };

    const links = linksByRole[user.role] || [];

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <aside className="w-64 bg-slate-900 border-r border-slate-800 text-slate-300 flex flex-col h-screen fixed left-0 top-0">
            {/* Header logo */}
            <div className="p-6 border-b border-slate-800 flex items-center gap-3">
                <div className="h-8 w-8 rounded bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-white font-bold text-lg">
                    S
                </div>
                <div>
                    <h1 className="font-semibold text-white tracking-wide text-sm">SMART ERP</h1>
                    <span className="text-xs text-slate-500 font-medium capitalize">{roleName}</span>
                </div>
            </div>

            {/* Nav Links */}
            <nav className="flex-1 px-4 py-6 overflow-y-auto space-y-1 scrollbar-thin">
                {links.map((link) => {
                    const isActive = location.pathname === link.path;
                    return (
                        <Link
                            key={link.path}
                            to={link.path}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group ${
                                isActive
                                    ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-950/20'
                                    : 'hover:bg-slate-800 hover:text-white'
                            }`}
                        >
                            <span className="text-base group-hover:scale-110 transition-transform">{link.icon}</span>
                            <span>{link.label}</span>
                        </Link>
                    );
                })}
            </nav>

            {/* Profile footer section */}
            <div className="p-4 border-t border-slate-800 bg-slate-950/40 flex flex-col gap-3">
                <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-full bg-slate-800 flex items-center justify-center font-semibold text-emerald-400 border border-slate-700">
                        {user.username.charAt(0).toUpperCase()}
                    </div>
                    <div className="overflow-hidden">
                        <p className="text-xs font-semibold text-white truncate">{user.username}</p>
                        <p className="text-[10px] text-slate-500 truncate">{user.email}</p>
                    </div>
                </div>
                <button
                    onClick={handleLogout}
                    className="w-full py-2 bg-slate-800/80 hover:bg-rose-950/40 hover:text-rose-400 text-xs font-semibold text-slate-400 border border-slate-700/60 rounded-md transition-all flex items-center justify-center gap-2"
                >
                    <span>🚪</span> Sign Out
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
