import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [errorMsg, setErrorMsg] = useState('');
    const [loggingIn, setLoggingIn] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMsg('');
        setLoggingIn(true);

        const result = await login(username, password);
        setLoggingIn(false);

        if (result.success) {
            // Retrieve user from storage to route correctly
            const storedUser = localStorage.getItem('user');
            if (storedUser) {
                const userObj = JSON.parse(storedUser);
                switch (userObj.role) {
                    case 'ROLE_STUDENT':
                        navigate('/student');
                        break;
                    case 'ROLE_FACULTY':
                        navigate('/faculty');
                        break;
                    case 'ROLE_ADMIN':
                        navigate('/admin');
                        break;
                    case 'ROLE_ADMISSION':
                        navigate('/admission');
                        break;
                    case 'ROLE_SUPER_ADMIN':
                        navigate('/superadmin');
                        break;
                    default:
                        navigate('/');
                }
            }
        } else {
            setErrorMsg(result.message);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4 py-12 relative overflow-hidden">
            {/* Design accents */}
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl animate-pulse-slow"></div>
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl animate-pulse-slow"></div>

            <div className="max-w-md w-full space-y-8 bg-slate-900/60 backdrop-blur-xl border border-slate-800 p-8 rounded-2xl shadow-2xl relative z-10">
                <div className="text-center">
                    <div className="inline-flex h-12 w-12 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 items-center justify-center text-white font-bold text-2xl mb-4 shadow-lg shadow-emerald-500/20">
                        S
                    </div>
                    <h2 className="text-3xl font-extrabold text-white tracking-tight">Smart Institute ERP</h2>
                    <p className="mt-2 text-sm text-slate-400">Sign in to access your portal</p>
                </div>

                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    {errorMsg && (
                        <div className="bg-rose-950/30 border border-rose-900 text-rose-400 px-4 py-3 rounded-lg text-sm flex items-center gap-2">
                            <span>⚠️</span>
                            <span>{errorMsg}</span>
                        </div>
                    )}

                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Username</label>
                            <input
                                type="text"
                                required
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-white placeholder-slate-600 transition-all text-sm"
                                placeholder="Enter your username"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Password</label>
                            <input
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-white placeholder-slate-600 transition-all text-sm"
                                placeholder="Enter your password"
                            />
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={loggingIn}
                            className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white rounded-xl text-sm font-bold shadow-lg shadow-emerald-500/15 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            {loggingIn ? (
                                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                            ) : (
                                'Sign In'
                            )}
                        </button>
                    </div>
                </form>

                {/* Info Credentials help drawer for Freshers testing */}
                <div className="pt-6 border-t border-slate-800 text-slate-500 text-xs">
                    <p className="font-semibold text-slate-400 mb-2">Demo Credentials:</p>
                    <div className="grid grid-cols-2 gap-2 text-[10px]">
                        <div>Student: <code className="bg-slate-950 px-1 py-0.5 text-slate-300">student / student123</code></div>
                        <div>Faculty: <code className="bg-slate-950 px-1 py-0.5 text-slate-300">faculty / faculty123</code></div>
                        <div>Admin: <code className="bg-slate-950 px-1 py-0.5 text-slate-300">admin / admin123</code></div>
                        <div>Admission: <code className="bg-slate-950 px-1 py-0.5 text-slate-300">admission / admission123</code></div>
                        <div className="col-span-2">SuperAdmin: <code className="bg-slate-950 px-1 py-0.5 text-slate-300">superadmin / superadmin</code></div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
