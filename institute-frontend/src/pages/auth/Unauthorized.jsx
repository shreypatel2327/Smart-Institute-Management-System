import React from 'react';
import { useNavigate } from 'react-router-dom';

const Unauthorized = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-300 p-4">
            <div className="text-6xl mb-6">🔒</div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">Access Denied</h1>
            <p className="mt-2 text-slate-500 text-sm max-w-xs text-center">
                You do not have the required permissions to view this dashboard page.
            </p>
            <button
                onClick={() => navigate('/login')}
                className="mt-8 px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-sm font-semibold transition-colors border border-slate-700"
            >
                Back to Sign In
            </button>
        </div>
    );
};

export default Unauthorized;
