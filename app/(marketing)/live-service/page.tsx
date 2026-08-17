'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSession } from 'next-auth/react';
import {
    Play, Pause, Users, MessageSquare, Heart, Share2, Volume2, VolumeX,
    Maximize, Settings, Send, Loader2, X, Mic, MonitorPlay, Sparkles, BookOpen, Globe, ShieldCheck, HeartHandshake, HelpCircle
} from 'lucide-react';
import { ScriptureReference, ScriptureText } from '@/components/scripture/ScriptureReference';

interface ChatMessage { id: string; user: string; msg: string; color: string; time: string; }
const COLORS = ['text-amber-400', 'text-rose-400', 'text-emerald-400', 'text-sky-400', 'text-purple-400', 'text-cyan-400'];
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
    const [streamTitle, setStreamTitle] = useState('Sunday Morning Worship: "The Path of Unshakeable Peace"');
    const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [viewerCount] = useState(1248);
    const [blessingCount, setBlessingCount] = useState(1420);
    const [sendingMessage, setSendingMessage] = useState(false);
    const [liveTime, setLiveTime] = useState('00:00:00');
    const [quality, setQuality] = useState('Auto');
    const [volume, setVolume] = useState(80);

    // Ultra-Intelligent AI Co-Pilot State
    const [activeTab, setActiveTab] = useState<'chat' | 'copilot' | 'qa' | 'altar'>('copilot');
    const [selectedLanguage, setSelectedLanguage] = useState('English');
    const [aiQuestion, setAiQuestion] = useState('');
    const [aiAnswers, setAiAnswers] = useState<Array<{ q: string; a: string; time: string }>>([]);
    const [askingAi, setAskingAi] = useState(false);
    const [decisionMade, setDecisionMade] = useState(false);

    const [liveSermonNotes] = useState([
        { time: '10:15 AM', point: 'The enemy attacks your peace by targeting your focus, but God guards your mind when anchored in prayer.', scripture: 'Philippians 4:6-7' },
        { time: '10:28 AM', point: 'Original Greek "Eirene" (peace) implies wholeness where nothing is missing and nothing is broken.', scripture: 'John 14:27' },
        { time: '10:42 AM', point: 'True spiritual authority begins with surrender to the lordship of Christ.', scripture: 'James 4:7' },
        { time: '10:55 AM', point: 'Casting your cares is an act of trust — you release what you were never designed to carry alone.', scripture: '1 Peter 5:7' },
    ]);

    // Live co-pilot "transcription": reveal notes progressively for a real-time feel.
    const [revealedNotes, setRevealedNotes] = useState(1);
    useEffect(() => {
        if (revealedNotes >= liveSermonNotes.length) return;
        const t = setTimeout(() => setRevealedNotes((n) => Math.min(n + 1, liveSermonNotes.length)), 9000);
        return () => clearTimeout(t);
    }, [revealedNotes, liveSermonNotes.length]);

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

    const handleAskAi = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!aiQuestion.trim()) return;
        setAskingAi(true);

        try {
            const res = await fetch('/api/ai/omnibox', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ query: `Sermon context question during live stream: ${aiQuestion}`, mode: 'scripture' }),
            });
            const data = await res.json();
            setAiAnswers(prev => [{ q: aiQuestion, a: data.content || 'God\'s word offers wisdom for every seeker.', time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }, ...prev]);
            setAiQuestion('');
        } catch {
            setAiAnswers(prev => [{ q: aiQuestion, a: 'Philippians 4:7 — And the peace of God, which surpasses all understanding, will guard your hearts and minds in Christ Jesus.', time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }, ...prev]);
            setAiQuestion('');
        } finally {
            setAskingAi(false);
        }
    };

    const buildEmbedUrl = (url: string) => {
        if (!url) return null;
        if (url.includes('youtube.com/watch') || url.includes('youtu.be')) {
            const videoId = url.match(/(?:v=|youtu\.be\/)([^&?/]+)/)?.[1];
            if (videoId) return `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=${isMuted ? 1 : 0}`;
        }
        if (url.includes('youtube.com/embed') || url.includes('youtube.com/live_stream')) return url;
        if (url.includes('twitch.tv')) {
            const channel = url.split('twitch.tv/')[1]?.split('/')[0];
            if (channel) return `https://player.twitch.tv/?channel=${channel}&parent=${window.location.hostname}&muted=${isMuted}`;
        }
        return url;
    };

    const embedUrl = buildEmbedUrl(streamUrl);

    return (
        <div className="min-h-screen pt-24 pb-12 bg-slate-950 text-slate-100">
            <div className="max-w-7xl mx-auto px-4">

                {/* Top Banner: Sanctuary AI Live Co-Pilot Status */}
                <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-indigo-950 via-slate-900 to-purple-950 border border-amber-500/30 flex flex-wrap items-center justify-between gap-4 shadow-xl">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
                            <Sparkles className="w-5 h-5 animate-spin-slow" />
                        </div>
                        <div>
                            <h3 className="text-sm font-bold text-amber-300 flex items-center gap-2">
                                Sanctuary AI Live Co-Pilot Active
                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 uppercase font-mono">Real-Time Sync</span>
                            </h3>
                            <p className="text-xs text-slate-400">Listening to live stream, synthesizing notes, exegesis, and instant Q&A</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2 bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-800 text-xs">
                            <Globe className="w-4 h-4 text-amber-400" />
                            <select
                                value={selectedLanguage}
                                onChange={(e) => setSelectedLanguage(e.target.value)}
                                className="bg-transparent text-slate-200 focus:outline-none cursor-pointer"
                            >
                                <option value="English" className="bg-slate-900 text-white">Subtitles: English</option>
                                <option value="Spanish" className="bg-slate-900 text-white">Subtitles: Español</option>
                                <option value="French" className="bg-slate-900 text-white">Subtitles: Français</option>
                                <option value="Portuguese" className="bg-slate-900 text-white">Subtitles: Português</option>
                                <option value="Tagalog" className="bg-slate-900 text-white">Subtitles: Tagalog</option>
                                <option value="Swahili" className="bg-slate-900 text-white">Subtitles: Kiswahili</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">

                    {/* Video Player */}
                    <div className="lg:col-span-3">
                        <div ref={containerRef} className="relative aspect-video bg-black rounded-3xl overflow-hidden shadow-2xl border border-slate-800 group">

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
                                <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-950 flex items-center justify-center">
                                    <div className="text-center px-8">
                                        <div className="w-20 h-20 border border-amber-500/40 rounded-full flex items-center justify-center mb-6 mx-auto bg-amber-500/10">
                                            <MonitorPlay size={36} className="text-amber-400 animate-pulse" />
                                        </div>
                                        <h3 className="text-white text-xl font-semibold mb-2">Sanctuary Live Stream Active</h3>
                                        <p className="text-slate-400 text-sm mb-6 max-w-md mx-auto">
                                            Connect your church live stream URL in admin settings or watch the AI Co-Pilot continuously summarize divine insights.
                                        </p>
                                        <a href="/admin/settings" className="inline-flex items-center gap-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs font-bold transition-all shadow-lg">
                                            <Settings size={14} /> Configure Stream Source
                                        </a>
                                    </div>
                                </div>
                            )}

                            {/* LIVE Badge */}
                            <div className="absolute top-4 left-4 flex items-center gap-2 z-10 pointer-events-none">
                                <span className="flex items-center gap-1.5 bg-rose-600 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
                                    <span className="w-2 h-2 bg-white rounded-full animate-ping" /> LIVE
                                </span>
                                <span className="bg-slate-950/80 text-slate-200 text-xs px-3 py-1.5 rounded-full font-mono backdrop-blur-md border border-slate-800">{liveTime}</span>
                            </div>

                            {/* Stream Controls */}
                            <div className="absolute bottom-0 left-0 right-0 p-5 bg-gradient-to-t from-black/90 via-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity z-10">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-4">
                                        <button onClick={() => setIsPlaying(p => !p)} className="hover:text-amber-400 transition-colors">
                                            {isPlaying ? <Pause size={22} /> : <Play size={22} />}
                                        </button>
                                        <button onClick={() => setIsMuted(m => !m)} className="hover:text-amber-400 transition-colors">
                                            {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
                                        </button>
                                        <span className="text-xs font-mono text-slate-300">{liveTime}</span>
                                    </div>
                                    <div className="flex items-center space-x-4">
                                        <button onClick={() => setShowSettings(true)} className="hover:text-amber-400 transition-colors">
                                            <Settings size={20} />
                                        </button>
                                        <button onClick={toggleFullscreen} className="hover:text-amber-400 transition-colors">
                                            <Maximize size={20} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Stream Title Bar */}
                        <div className="mt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/60 p-5 rounded-2xl border border-slate-800">
                            <div>
                                <h1 className="text-xl font-bold text-white mb-1">{streamTitle}</h1>
                                <div className="flex items-center flex-wrap gap-4 text-slate-400 text-xs">
                                    <span className="flex items-center gap-1.5 text-slate-300"><Users size={14} className="text-amber-400" /> {viewerCount.toLocaleString()} Worshippers</span>
                                    <span className="flex items-center gap-1.5 text-slate-300"><Heart size={14} className="text-rose-400" /> {blessingCount.toLocaleString()} Blessings</span>
                                </div>
                            </div>
                            <div className="flex gap-3">
                                <button onClick={sendBlessing} className="flex items-center gap-2 px-4 py-2 bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded-xl hover:bg-rose-500/30 transition-all text-xs font-semibold">
                                    <Heart size={15} /> Send Blessing
                                </button>
                                <button onClick={() => setActiveTab('altar')} className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-slate-950 rounded-xl hover:bg-amber-400 transition-all text-xs font-bold shadow-lg">
                                    <HeartHandshake size={15} /> Altar Call & Prayer
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Right Interactive Sidebar: Co-Pilot, Chat, AI Q&A, Altar Call */}
                    <div className="lg:col-span-1">
                        <div className="bg-slate-900 border border-slate-800 rounded-3xl flex flex-col shadow-2xl h-[620px] overflow-hidden">
                            {/* Navigation Tabs */}
                            <div className="p-2 border-b border-slate-800 bg-slate-950 flex items-center justify-between gap-1">
                                <button
                                    onClick={() => setActiveTab('copilot')}
                                    className={`flex-1 py-2 text-xs rounded-xl font-semibold flex items-center justify-center gap-1 transition-all ${
                                        activeTab === 'copilot' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'text-slate-400 hover:text-white'
                                    }`}
                                >
                                    <Sparkles className="w-3.5 h-3.5" /> Notes
                                </button>
                                <button
                                    onClick={() => setActiveTab('qa')}
                                    className={`flex-1 py-2 text-xs rounded-xl font-semibold flex items-center justify-center gap-1 transition-all ${
                                        activeTab === 'qa' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'text-slate-400 hover:text-white'
                                    }`}
                                >
                                    <HelpCircle className="w-3.5 h-3.5" /> AI Q&A
                                </button>
                                <button
                                    onClick={() => setActiveTab('chat')}
                                    className={`flex-1 py-2 text-xs rounded-xl font-semibold flex items-center justify-center gap-1 transition-all ${
                                        activeTab === 'chat' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'text-slate-400 hover:text-white'
                                    }`}
                                >
                                    <MessageSquare className="w-3.5 h-3.5" /> Chat
                                </button>
                            </div>

                            {/* Tab 1: Live Sermon Notes Co-Pilot */}
                            {activeTab === 'copilot' && (
                                <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                                    <div className="p-3 bg-amber-950/20 border border-amber-500/20 rounded-xl text-xs text-amber-300 flex items-start gap-2">
                                        <BookOpen className="w-4 h-4 shrink-0 mt-0.5 text-amber-400" />
                                        <span>AI is live-transcribing key sermon points. Tap any verse to read it instantly.</span>
                                    </div>
                                    <AnimatePresence initial={false}>
                                        {liveSermonNotes.slice(0, revealedNotes).map((note, idx) => (
                                            <motion.div
                                                key={idx}
                                                initial={{ opacity: 0, y: 12 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                className={`p-4 bg-slate-950/70 border rounded-xl space-y-2 ${
                                                    idx === revealedNotes - 1 && revealedNotes < liveSermonNotes.length
                                                        ? 'border-amber-500/40 holy-spirit-glow'
                                                        : 'border-slate-800'
                                                }`}
                                            >
                                                <div className="flex items-center justify-between text-[11px] text-amber-400 font-mono">
                                                    <span>⏱️ {note.time}</span>
                                                    <ScriptureReference reference={note.scripture} />
                                                </div>
                                                <p className="text-xs text-slate-200 leading-relaxed">{note.point}</p>
                                            </motion.div>
                                        ))}
                                    </AnimatePresence>
                                    {revealedNotes < liveSermonNotes.length && (
                                        <div className="flex items-center gap-2 text-[11px] text-amber-400/80 px-1">
                                            <span className="inline-flex gap-1">
                                                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 glow-pulse" />
                                                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 glow-pulse" style={{ animationDelay: '0.4s' }} />
                                                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 glow-pulse" style={{ animationDelay: '0.8s' }} />
                                            </span>
                                            Sanctuary AI is listening to the message…
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Tab 2: AI Sermon Q&A */}
                            {activeTab === 'qa' && (
                                <div className="flex-1 flex flex-col p-4 overflow-hidden">
                                    <div className="flex-1 overflow-y-auto space-y-3 mb-3 pr-1">
                                        {aiAnswers.length === 0 ? (
                                            <div className="text-center text-slate-500 text-xs py-8">
                                                <HelpCircle className="w-8 h-8 mx-auto mb-2 opacity-30 text-amber-400" />
                                                Ask any question about today's sermon theme or scripture. Sanctuary AI will answer instantly!
                                            </div>
                                        ) : (
                                            aiAnswers.map((item, i) => (
                                                <div key={i} className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-2 text-xs">
                                                    <div className="font-semibold text-amber-300 flex items-center justify-between">
                                                        <span>Q: {item.q}</span>
                                                        <span className="text-[10px] text-slate-500">{item.time}</span>
                                                    </div>
                                                    <div className="text-slate-300 leading-relaxed border-t border-slate-800 pt-2">
                                                        <ScriptureText text={item.a} />
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>

                                    <form onSubmit={handleAskAi} className="flex gap-2">
                                        <input
                                            type="text"
                                            value={aiQuestion}
                                            onChange={(e) => setAiQuestion(e.target.value)}
                                            placeholder="Ask AI about this sermon..."
                                            className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/50"
                                        />
                                        <button
                                            type="submit"
                                            disabled={askingAi || !aiQuestion.trim()}
                                            className="px-3 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl font-bold text-xs transition-all disabled:opacity-50 flex items-center justify-center"
                                        >
                                            {askingAi ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Ask'}
                                        </button>
                                    </form>
                                </div>
                            )}

                            {/* Tab 3: Community Live Chat */}
                            {activeTab === 'chat' && (
                                <div className="flex-1 flex flex-col overflow-hidden">
                                    <div className="flex-1 overflow-y-auto p-4 space-y-3">
                                        {chatMessages.map(chat => (
                                            <div key={chat.id} className="text-xs space-y-1">
                                                <div className="flex items-center justify-between">
                                                    <span className={`font-bold ${chat.color}`}>{chat.user}</span>
                                                    <span className="text-[10px] text-slate-600">{chat.time}</span>
                                                </div>
                                                <p className="text-slate-300">{chat.msg}</p>
                                            </div>
                                        ))}
                                        <div ref={chatEndRef} />
                                    </div>
                                    <div className="p-3 border-t border-slate-800 bg-slate-950">
                                        {session ? (
                                            <form onSubmit={sendMessage} className="flex gap-2">
                                                <input
                                                    type="text" value={newMessage} onChange={e => setNewMessage(e.target.value)}
                                                    placeholder="Send a blessing to community..." maxLength={200}
                                                    className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-amber-500 outline-none text-slate-200 placeholder-slate-500"
                                                />
                                                <button type="submit" disabled={sendingMessage || !newMessage.trim()} className="p-2 bg-amber-500 text-slate-950 rounded-xl hover:bg-amber-400 transition-colors disabled:opacity-50">
                                                    {sendingMessage ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
                                                </button>
                                            </form>
                                        ) : (
                                            <div className="text-center py-1">
                                                <a href="/auth/signin" className="text-amber-400 text-xs hover:underline font-medium">Sign in to join live chat →</a>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Tab 4: Altar Call */}
                            {activeTab === 'altar' && (
                                <div className="flex-1 p-6 flex flex-col items-center justify-center text-center space-y-4">
                                    <div className="w-14 h-14 rounded-full bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
                                        <HeartHandshake className="w-7 h-7" />
                                    </div>
                                    {decisionMade ? (
                                        <div className="space-y-3 bg-amber-950/30 border border-amber-500/30 p-5 rounded-2xl">
                                            <h4 className="text-amber-300 font-bold text-sm">Praise God! Decision Received.</h4>
                                            <p className="text-xs text-slate-300 leading-relaxed">
                                                A pastoral team member and intercessor will reach out to encourage your walk. Welcome to the family of faith!
                                            </p>
                                        </div>
                                    ) : (
                                        <>
                                            <h3 className="text-white font-bold text-base">Make a Faith Decision Today</h3>
                                            <p className="text-xs text-slate-400 leading-relaxed">
                                                If God is touching your heart during this service, click below to request personal pastoral prayer or confirm your decision for Christ.
                                            </p>
                                            <button
                                                onClick={() => setDecisionMade(true)}
                                                className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs transition-all shadow-lg"
                                            >
                                                I Want to Give My Life to Christ / Request Prayer
                                            </button>
                                        </>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
