'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSession } from 'next-auth/react';
import {
    Play, Pause, Users, MessageSquare, Heart, Share2, Volume2, VolumeX,
    Maximize, Settings, Send, Loader2, X, Mic, MonitorPlay, AlertCircle
} from 'lucide-react';

interface ChatMessage { id: string; user: string; msg: string; color: string; time: string; }
const COLORS = ['text-blue-400', 'text-rose-400', 'text-emerald-400', 'text-amber-400', 'text-purple-400', 'text-cyan-400'];
const colorMap = new Map<string, string>();
function getUserColor(name: string) {
    if (!colorMap.has(name)) colorMap.set(name, COLORS[colorMap.size % COLORS.length]);
    return colorMap.get(name)!;
}

export default function LiveServicePage() {
    const { data: session } = useSession();
    const containerRef = useRef<HTMLDivElement>(null);
    const chatEndRef = useRef<HTMLDivElement>(null);
    const startTime = useRef(Date.now());
    const lastMessageTime = useRef<string | null>(null);

    const [isPlaying, setIsPlaying] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const [streamUrl, setStreamUrl] = useState('');
    const [streamTitle, setStreamTitle] = useState('Sunday Morning Worship: "The Path of Peace"');
    const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [viewerCount] = useState(Math.floor(Math.random() * 800) + 400);
    const [blessingCount, setBlessingCount] = useState(856);
    const [sendingMessage, setSendingMessage] = useState(false);
    const [liveTime, setLiveTime] = useState('00:00:00');
    const [quality, setQuality] = useState('Auto');
    const [volume, setVolume] = useState(80);

    // Load stream URL from admin settings
    useEffect(() => {
        fetch('/api/admin/settings').then(r => r.json()).then(data => {
            if (data.streamUrl) setStreamUrl(data.streamUrl);
            if (data.streamTitle) setStreamTitle(data.streamTitle);
        }).catch(() => { });
    }, []);

    // Live timer
    useEffect(() => {
        const timer = setInterval(() => {
            const elapsed = Math.floor((Date.now() - startTime.current) / 1000);
            const h = Math.floor(elapsed / 3600).toString().padStart(2, '0');
            const m = Math.floor((elapsed % 3600) / 60).toString().padStart(2, '0');
            const s = (elapsed % 60).toString().padStart(2, '0');
            setLiveTime(`${h}:${m}:${s}`);
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    // Poll for live chat
    useEffect(() => {
        const fetchMessages = async (since?: string | null) => {
            try {
                const url = since ? `/api/live-chat?since=${encodeURIComponent(since)}&limit=20` : '/api/live-chat?limit=50';
                const res = await fetch(url);
                const data = await res.json();
                if (data.messages?.length > 0) {
                    const mapped: ChatMessage[] = data.messages.map((m: any) => ({
                        id: m.id,
                        user: m.user?.name?.split(' ')[0] || 'Worshipper',
                        msg: m.content,
                        color: getUserColor(m.user?.name || 'Worshipper'),
                        time: new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    }));
                    setChatMessages(prev => {
                        const existingIds = new Set(prev.map(m => m.id));
                        const newOnes = mapped.filter(m => !existingIds.has(m.id));
                        return newOnes.length > 0 ? [...prev, ...newOnes] : prev;
                    });
                    lastMessageTime.current = data.messages[data.messages.length - 1].createdAt;
                }
            } catch { /* silent */ }
        };
        fetchMessages(null);
        const poll = setInterval(() => fetchMessages(lastMessageTime.current), 5000);
        return () => clearInterval(poll);
    }, []);

    useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [chatMessages]);

    // ── Fullscreen toggle ────────────────────────────────────────────────────
    const toggleFullscreen = useCallback(async () => {
        if (!containerRef.current) return;
        if (!document.fullscreenElement) {
            try {
                await containerRef.current.requestFullscreen();
                setIsFullscreen(true);
            } catch (e) { console.error('Fullscreen error:', e); }
        } else {
            await document.exitFullscreen();
            setIsFullscreen(false);
        }
    }, []);

    useEffect(() => {
        const handler = () => setIsFullscreen(!!document.fullscreenElement);
        document.addEventListener('fullscreenchange', handler);
        return () => document.removeEventListener('fullscreenchange', handler);
    }, []);

    const sendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !session) return;
        setSendingMessage(true);
        const msgContent = newMessage.trim();
        setNewMessage('');
        const optimistic: ChatMessage = {
            id: `opt-${Date.now()}`,
            user: session.user?.name?.split(' ')[0] || 'You',
            msg: msgContent,
            color: getUserColor(session.user?.name || 'You'),
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setChatMessages(prev => [...prev, optimistic]);
        try {
            await fetch('/api/live-chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ content: msgContent }) });
        } catch { } finally { setSendingMessage(false); }
    };

    const sendBlessing = async () => {
        setBlessingCount(c => c + 1);
        const msg: ChatMessage = { id: `bless-${Date.now()}`, user: session?.user?.name?.split(' ')[0] || 'A Worshipper', msg: '🙏 Sent a blessing!', color: 'text-rose-400', time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
        setChatMessages(prev => [...prev, msg]);
        if (session) { try { await fetch('/api/live-chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ content: '🙏 Sent a blessing!', type: 'BLESSING' }) }); } catch { } }
    };

    // ── Stream player ────────────────────────────────────────────────────────
    const buildEmbedUrl = (url: string) => {
        if (!url) return null;
        // YouTube: convert to embed
        if (url.includes('youtube.com/watch') || url.includes('youtu.be')) {
            const videoId = url.match(/(?:v=|youtu\.be\/)([^&?/]+)/)?.[1];
            if (videoId) return `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=${isMuted ? 1 : 0}`;
        }
        if (url.includes('youtube.com/embed') || url.includes('youtube.com/live_stream')) return url;
        // Twitch
        if (url.includes('twitch.tv')) {
            const channel = url.split('twitch.tv/')[1]?.split('/')[0];
            if (channel) return `https://player.twitch.tv/?channel=${channel}&parent=${window.location.hostname}&muted=${isMuted}`;
        }
        // Vimeo
        if (url.includes('vimeo.com')) {
            const id = url.match(/vimeo\.com\/(?:event\/)?(\d+)/)?.[1];
            if (id) return `https://vimeo.com/event/${id}/embed`;
        }
        // Any other URL treated as HLS/custom iframe
        return url;
    };

    const embedUrl = buildEmbedUrl(streamUrl);

    return (
        <div className="min-h-screen pt-24 pb-12 bg-stone-900 text-stone-100">
            <div className="max-w-7xl mx-auto px-4">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">

                    {/* ── Video Player ──────────────────────────────────────── */}
                    <div className="lg:col-span-3">
                        <div ref={containerRef} className="relative aspect-video bg-black rounded-3xl overflow-hidden shadow-2xl group">

                            {/* Actual stream embed */}
                            {embedUrl ? (
                                <iframe
                                    src={embedUrl}
                                    className="absolute inset-0 w-full h-full"
                                    frameBorder="0"
                                    allow="autoplay; fullscreen; picture-in-picture"
                                    allowFullScreen
                                    title="Live Service Stream"
                                />
                            ) : (
                                /* Placeholder when no stream URL configured */
                                <div className="absolute inset-0 bg-gradient-to-br from-stone-800 to-stone-900 flex items-center justify-center">
                                    <div className="text-center px-8">
                                        <div className="w-24 h-24 border-4 border-sage-400/50 rounded-full flex items-center justify-center mb-6 mx-auto">
                                            <MonitorPlay size={40} className="text-sage-400" />
                                        </div>
                                        <p className="text-stone-300 text-lg font-light mb-2">Live stream begins at service time</p>
                                        <p className="text-stone-500 text-sm mb-5">No stream configured yet</p>
                                        <a href="/admin/settings" className="inline-flex items-center gap-2 px-5 py-2.5 bg-sage-600 hover:bg-sage-500 text-white rounded-full text-sm font-medium transition-colors">
                                            <Settings size={15} /> Configure Stream URL in Admin Settings
                                        </a>
                                    </div>
                                </div>
                            )}

                            {/* LIVE badge */}
                            <div className="absolute top-4 left-4 flex items-center gap-2 z-10 pointer-events-none">
                                <span className="flex items-center gap-1.5 bg-red-600 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow">
                                    <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" /> LIVE
                                </span>
                                <span className="bg-stone-900/80 text-stone-200 text-xs px-3 py-1.5 rounded-full font-mono backdrop-blur-sm">{liveTime}</span>
                            </div>

                            {/* Controls overlay */}
                            <div className="absolute bottom-0 left-0 right-0 p-5 bg-gradient-to-t from-black/90 via-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity z-10">
                                {/* Volume slider */}
                                <div className="flex items-center gap-3 mb-3">
                                    <input
                                        type="range" min={0} max={100} value={volume}
                                        onChange={e => setVolume(Number(e.target.value))}
                                        className="flex-1 h-1 accent-sage-400"
                                    />
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-4">
                                        <button onClick={() => setIsPlaying(p => !p)} className="hover:text-sage-400 transition-colors">
                                            {isPlaying ? <Pause size={22} /> : <Play size={22} />}
                                        </button>
                                        <button onClick={() => setIsMuted(m => !m)} className="hover:text-sage-400 transition-colors">
                                            {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
                                        </button>
                                        <span className="text-sm font-mono text-stone-300">{liveTime}</span>
                                    </div>
                                    <div className="flex items-center space-x-4">
                                        {/* ⚙️ Settings — fixed: now opens modal */}
                                        <button
                                            onClick={() => setShowSettings(true)}
                                            className="hover:text-sage-400 transition-colors"
                                            title="Stream Settings"
                                        >
                                            <Settings size={20} />
                                        </button>
                                        {/* ⛶ Fullscreen — fixed: now calls requestFullscreen */}
                                        <button
                                            onClick={toggleFullscreen}
                                            className="hover:text-sage-400 transition-colors"
                                            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
                                        >
                                            <Maximize size={20} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Stream info bar */}
                        <div className="mt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div>
                                <h1 className="text-2xl font-light mb-1">{streamTitle}</h1>
                                <div className="flex items-center flex-wrap gap-4 text-stone-400 text-sm">
                                    <span className="flex items-center gap-1.5"><Users size={15} className="text-sage-400" /> {viewerCount.toLocaleString()} Watching</span>
                                    <span className="flex items-center gap-1.5"><Heart size={15} className="text-rose-400" /> {blessingCount.toLocaleString()} Blessings</span>
                                </div>
                            </div>
                            <div className="flex gap-3">
                                <button onClick={sendBlessing} className="flex items-center gap-2 px-4 py-2 bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded-xl hover:bg-rose-500/30 transition-colors text-sm font-medium">
                                    <Heart size={16} /> Bless
                                </button>
                                <button onClick={() => navigator.share?.({ title: 'Join our Live Service', url: window.location.href })} className="flex items-center gap-2 px-4 py-2 bg-stone-800 border border-stone-700 rounded-xl hover:bg-stone-700 transition-colors text-sm font-medium">
                                    <Share2 size={16} /> Share
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* ── Live Chat Panel ────────────────────────────────────── */}
                    <div className="lg:col-span-1">
                        <div className="bg-stone-800 rounded-3xl flex flex-col border border-stone-700 shadow-xl" style={{ height: '600px' }}>
                            <div className="p-4 border-b border-stone-700 flex items-center justify-between">
                                <h3 className="font-medium flex items-center gap-2">
                                    <MessageSquare size={16} className="text-sage-400" /> Community Chat
                                </h3>
                                <div className="flex items-center gap-1.5 text-xs text-emerald-400">
                                    <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" /> Live
                                </div>
                            </div>
                            <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                                <AnimatePresence>
                                    {chatMessages.length === 0 && (
                                        <div className="text-center text-stone-600 text-sm pt-8">
                                            <MessageSquare size={28} className="mx-auto mb-2 opacity-30" />
                                            Be the first to say something!
                                        </div>
                                    )}
                                    {chatMessages.map(chat => (
                                        <motion.div key={chat.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="text-sm">
                                            <div className="flex items-center justify-between mb-0.5">
                                                <span className={`font-bold text-xs ${chat.color}`}>{chat.user}</span>
                                                <span className="text-stone-600 text-[10px]">{chat.time}</span>
                                            </div>
                                            <span className="text-stone-300">{chat.msg}</span>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                                <div ref={chatEndRef} />
                            </div>
                            <div className="p-4 border-t border-stone-700 bg-stone-900/50">
                                {session ? (
                                    <form onSubmit={sendMessage} className="flex gap-2">
                                        <input
                                            type="text" value={newMessage} onChange={e => setNewMessage(e.target.value)}
                                            placeholder="Send a blessing..." maxLength={200}
                                            className="flex-1 bg-stone-800 border border-stone-600 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-sage-500 outline-none text-stone-200 placeholder-stone-500"
                                        />
                                        <button type="submit" disabled={sendingMessage || !newMessage.trim()} className="p-2.5 bg-sage-500 text-white rounded-xl hover:bg-sage-600 transition-colors disabled:opacity-50">
                                            {sendingMessage ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                                        </button>
                                    </form>
                                ) : (
                                    <div className="text-center">
                                        <p className="text-stone-500 text-xs mb-2">Sign in to join the conversation</p>
                                        <a href="/auth/signin" className="text-sage-400 text-xs hover:underline">Sign In →</a>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Stream Settings Modal ─────────────────────────────────────── */}
            <AnimatePresence>
                {showSettings && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowSettings(false)} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative bg-stone-900 border border-stone-700 rounded-2xl shadow-2xl w-full max-w-sm p-6">
                            <div className="flex items-center justify-between mb-5">
                                <h3 className="text-lg font-semibold">Playback Settings</h3>
                                <button onClick={() => setShowSettings(false)} className="text-stone-500 hover:text-white"><X size={20} /></button>
                            </div>
                            <div className="space-y-5">
                                <div>
                                    <label className="block text-xs font-bold text-stone-400 uppercase tracking-wider mb-2">Quality</label>
                                    <div className="grid grid-cols-4 gap-2">
                                        {['Auto', '1080p', '720p', '480p'].map(q => (
                                            <button key={q} onClick={() => setQuality(q)} className={`py-2 rounded-lg text-sm font-medium ${quality === q ? 'bg-sage-600 text-white' : 'bg-stone-800 text-stone-400 hover:bg-stone-700'}`}>{q}</button>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-stone-400 uppercase tracking-wider mb-2">Volume: {volume}%</label>
                                    <input type="range" min={0} max={100} value={volume} onChange={e => setVolume(Number(e.target.value))} className="w-full accent-sage-500" />
                                </div>
                                <div className="border-t border-stone-800 pt-4">
                                    <p className="text-xs text-stone-500 mb-2">Stream not loading?</p>
                                    <a href="/admin/settings" className="text-sage-400 text-xs hover:underline flex items-center gap-1"><Settings size={12} /> Configure stream URL in Admin Settings</a>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
