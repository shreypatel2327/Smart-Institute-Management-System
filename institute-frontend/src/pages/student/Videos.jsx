import React, { useEffect, useState } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import { api } from '../../context/AuthContext';

const Videos = () => {
    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeVideo, setActiveVideo] = useState(null);

    useEffect(() => {
        api.get('/api/students/videos')
            .then(res => setVideos(res.data))
            .catch(err => console.error('Error fetching videos', err))
            .finally(() => setLoading(false));
    }, []);

    return (
        <DashboardLayout title="Video Lectures & Tutorials">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left col: active player if selected */}
                <div className="lg:col-span-2 space-y-6">
                    {activeVideo ? (
                        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4">
                            <div className="aspect-video w-full bg-black rounded-xl overflow-hidden border border-slate-800">
                                {activeVideo.videoPath ? (
                                    <video
                                        src={`http://localhost:9998/${activeVideo.videoPath}`}
                                        controls
                                        className="h-full w-full object-contain"
                                    />
                                ) : (
                                    <iframe
                                        src={activeVideo.videoUrl.replace("watch?v=", "embed/")}
                                        title={activeVideo.title}
                                        className="h-full w-full"
                                        allowFullScreen
                                    ></iframe>
                                )}
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-white">{activeVideo.title}</h3>
                                <p className="text-sm text-slate-400 mt-2">{activeVideo.description}</p>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-slate-900/40 border border-slate-800/80 aspect-video rounded-2xl flex flex-col items-center justify-center text-slate-500">
                            <span className="text-5xl mb-4">📺</span>
                            <p className="text-sm font-semibold">Select a lecture tutorial from the list to begin streaming</p>
                        </div>
                    )}
                </div>

                {/* Right col: video playlist */}
                <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl h-[500px] flex flex-col">
                    <div className="border-b border-slate-800 pb-4 mb-4">
                        <h3 className="font-bold text-white text-base">Tutorial Playlist</h3>
                        <p className="text-xs text-slate-500 mt-1">Select a video to stream</p>
                    </div>

                    {loading ? (
                        <div className="flex-1 flex items-center justify-center">
                            <div className="h-6 w-6 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent"></div>
                        </div>
                    ) : videos.length === 0 ? (
                        <div className="flex-1 flex items-center justify-center text-slate-500 text-xs">
                            No videos uploaded for your batch yet.
                        </div>
                    ) : (
                        <div className="flex-1 overflow-y-auto space-y-3 pr-1 scrollbar-thin">
                            {videos.map((vid) => (
                                <div
                                    key={vid.id}
                                    onClick={() => setActiveVideo(vid)}
                                    className={`p-3 border rounded-xl cursor-pointer transition-all duration-200 text-left flex items-start gap-3 ${activeVideo?.id === vid.id
                                            ? 'bg-emerald-950/20 border-emerald-800'
                                            : 'bg-slate-950 hover:bg-slate-800/40 border-slate-800/60'
                                        }`}
                                >
                                    <span className="text-2xl mt-0.5">▶️</span>
                                    <div>
                                        <h4 className="font-bold text-white text-xs leading-snug">{vid.title}</h4>
                                        <p className="text-[10px] text-slate-400 line-clamp-2 mt-1">{vid.description}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
};

export default Videos;
