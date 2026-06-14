import React, { useEffect, useState, useRef } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import { api, useAuth } from '../../context/AuthContext';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const MeetingSessionRoom = () => {
    const { user } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();

    // Parse meeting parameters from location state or query params
    const queryParams = new URLSearchParams(location.search);
    const meetingId = queryParams.get('meetingId') || 'room-' + Math.random().toString(36).substring(7);
    const title = queryParams.get('title') || 'Virtual ERP Lecture';

    const isHost = user?.role === 'ROLE_FACULTY' || user?.role === 'ROLE_SUPER_ADMIN';
    const [meetingStarted, setMeetingStarted] = useState(false);

    const jitsiContainerRef = useRef(null);
    const jitsiApiRef = useRef(null);

    // Track check-in & check-out logs automatically
    const logCheckIn = async () => {
        try {
            if (isHost) {
                await api.post(`/api/meetings/start?meetingId=${meetingId}`);
                toast.success('Meeting session started as Host.');
            } else {
                await api.post(`/api/meetings/join?meetingId=${meetingId}`);
                toast.success('Automatically checked into virtual attendance register.');
            }
            setMeetingStarted(true);
        } catch (err) {
            console.error('Error logging check-in:', err);
            toast.error('Failed to register check-in logs with the server.');
        }
    };

    const logCheckOut = async () => {
        try {
            if (isHost) {
                await api.post(`/api/meetings/end?meetingId=${meetingId}`);
            } else {
                await api.post(`/api/meetings/leave?meetingId=${meetingId}`);
            }
        } catch (err) {
            console.error('Error logging check-out:', err);
        }
    };

    useEffect(() => {
        logCheckIn();

        if (window.JitsiMeetExternalAPI && jitsiContainerRef.current) {
            const domain = 'meet.jit.si';
            const options = {
                roomName: meetingId,
                width: '100%',
                height: '100%',
                parentNode: jitsiContainerRef.current,
                userInfo: {
                    displayName: user ? `${user.firstName} ${user.lastName}` : 'Anonymous User',
                    email: user?.email || ''
                },
                configOverwrite: {
                    startWithAudioMuted: true,
                    startWithVideoMuted: true,
                    prejoinPageEnabled: false, // directly join
                    disableDeepLinking: true // disable Jitsi mobile app redirects inside iframe
                },
                interfaceConfigOverwrite: {
                    TOOLBAR_BUTTONS: [
                        'microphone', 'camera', 'closedcaptions', 'desktop', 'embedmeeting', 'fullscreen',
                        'fodeviceselection', 'hangup', 'profile', 'chat', 'recording',
                        'livestreaming', 'etherpad', 'sharedvideo', 'settings', 'raisehand',
                        'videoquality', 'filmstrip', 'invite', 'feedback', 'stats', 'shortcuts',
                        'tileview', 'videobackgroundblur', 'download', 'help', 'mute-everyone',
                        'security'
                    ]
                }
            };

            const apiInstance = new window.JitsiMeetExternalAPI(domain, options);
            jitsiApiRef.current = apiInstance;

            // Catch hang up event from inside Jitsi Meet iframe
            apiInstance.addEventListener('readyToClose', () => {
                navigate(-1);
            });
        } else {
            console.error("Jitsi Meet External API script not loaded.");
            toast.error("Unable to start video conference: Jitsi SDK not loaded.");
        }

        return () => {
            logCheckOut();
            if (jitsiApiRef.current) {
                jitsiApiRef.current.dispose();
            }
        };
    }, [meetingId]);

    const handleExitMeeting = () => {
        const text = isHost ? "Are you sure you want to end this class session for everyone?" : "Are you sure you want to leave this class session?";
        if (window.confirm(text)) {
            navigate(-1);
        }
    };

    return (
        <DashboardLayout title={`Online Class: ${title}`}>
            <ToastContainer theme="dark" />

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 text-left">
                {/* Meeting Feed */}
                <div className="lg:col-span-3">
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl relative">
                        {/* Real Jitsi Meet Iframe Container */}
                        <div ref={jitsiContainerRef} className="h-[550px] w-full bg-slate-950" />
                    </div>
                </div>

                {/* Sidebar: Details & Actions */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-5">
                        <h3 className="font-bold text-white text-base border-b border-slate-800 pb-3">
                            Classroom Details
                        </h3>

                        <div className="space-y-3.5 text-xs">
                            <div>
                                <span className="text-slate-500 block">Jitsi Room ID</span>
                                <span className="text-white font-semibold font-mono break-all">{meetingId}</span>
                            </div>
                            <div>
                                <span className="text-slate-500 block">Scheduled Title</span>
                                <span className="text-white font-semibold leading-relaxed">{title}</span>
                            </div>
                            <div>
                                <span className="text-slate-500 block">Your Session Role</span>
                                <span className="text-emerald-400 font-bold uppercase">{isHost ? 'Host / Instructor' : 'Student'}</span>
                            </div>
                        </div>

                        <div className="pt-4 border-t border-slate-800">
                            <button
                                onClick={handleExitMeeting}
                                className="w-full py-2.5 bg-red-500 hover:bg-red-400 text-white font-bold text-xs rounded-xl shadow-lg transition-colors flex items-center justify-center gap-2"
                            >
                                🚪 {isHost ? 'End Session' : 'Leave Session'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

        </DashboardLayout>
    );
};

export default MeetingSessionRoom;
