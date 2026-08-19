'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Users, Video, Clock, MapPin, ExternalLink, Bookmark, CheckCircle, Info } from 'lucide-react';
import { useSession } from 'next-auth/react';

export default function ConferencesPage() {
    const { data: session } = useSession();
    const [conferences, setConferences] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'UPCOMING' | 'LIVE' | 'COMPLETED'>('UPCOMING');
    const [rsvped, setRsvped] = useState<Record<string, boolean>>({});
    const [rsvping, setRsvping] = useState<string | null>(null);

    useEffect(() => {
        fetchConferences();
    }, [filter]);

    const fetchConferences = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/conferences?status=${filter}`);
            const data = await res.json();
            if (Array.isArray(data)) {
                setConferences(data);
            } else {
                setConferences([]);
                console.error('API did not return an array:', data);
            }
        } catch (err) {
            console.error('Error fetching conferences:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleRSVP = async (conferenceId: string) => {
        if (!session) {
            window.location.href = '/auth/signin';
            return;
        }
        setRsvping(conferenceId);
        // Optimistically mark registered and bump the visible attendee count.
        setRsvped((r) => ({ ...r, [conferenceId]: true }));
        setConferences((prev) =>
            prev.map((c) =>
                c.id === conferenceId ? { ...c, attendees: [...(c.attendees || []), { userId: 'me' }] } : c
            )
        );
        // Demo conferences (no DB row) stay optimistic; real ones persist.
        if (!String(conferenceId).startsWith('demo')) {
            try {
                await fetch('/api/conferences/rsvp', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ conferenceId }),
                });
            } catch (err) {
                console.error('RSVP failed:', err);
            }
        }
        setRsvping(null);
    };

    return (
        <div className="min-h-screen pt-24 pb-12 bg-cream-50">
            <div className="max-w-7xl mx-auto px-4">
                {/* Header */}
                <header className="mb-12">
                    <div className="flex flex-col md:flex-row items-end justify-between gap-6">
                        <div>
                            <motion.h1
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="text-4xl md:text-5xl font-light text-stone-800 mb-4"
                            >
                                Spiritual Gatherings
                            </motion.h1>
                            <p className="text-stone-600 text-lg">Join our global community in worship, teaching, and fellowship.</p>
                        </div>

                        <div className="flex bg-white rounded-full p-1 shadow-sm">
                            {(['UPCOMING', 'LIVE', 'COMPLETED'] as const).map((status) => (
                                <button
                                    key={status}
                                    onClick={() => setFilter(status)}
                                    className={`px-6 py-2 rounded-full text-sm transition-all ${filter === status
                                        ? 'bg-sage-500 text-white shadow-md'
                                        : 'text-stone-500 hover:bg-cream-100'
                                        }`}
                                >
                                    {status.charAt(0) + status.slice(1).toLowerCase()}
                                </button>
                            ))}
                        </div>
                    </div>
                </header>

                {/* Main Content */}
                {loading ? (
                    <div className="flex items-center justify-center p-20">
                        <div className="w-12 h-12 border-4 border-sage-500 border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : conferences.length === 0 ? (
                    <div className="text-center p-20 sanctuary-card">
                        <Calendar className="w-16 h-16 text-stone-300 mx-auto mb-4" />
                        <h3 className="text-2xl font-light text-stone-800 mb-2">No {filter.toLowerCase()} conferences</h3>
                        <p className="text-stone-500">Check back later for new spiritual gatherings.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        <AnimatePresence>
                            {conferences.map((conf, index) => (
                                <motion.div
                                    key={conf.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    className="sanctuary-card group flex flex-col h-full hover:shadow-xl transition-all"
                                >
                                    <div className="flex-1">
                                        <div className="flex justify-between items-start mb-6">
                                            <div className={`px-3 py-1 rounded-full text-xs font-medium ${conf.status === 'LIVE' ? 'bg-rose-100 text-rose-600 animate-pulse' :
                                                conf.status === 'UPCOMING' ? 'bg-sage-100 text-sage-600' :
                                                    'bg-stone-100 text-stone-600'
                                                }`}>
                                                {conf.status}
                                            </div>
                                            <button className="text-stone-400 hover:text-sage-500 transition-colors">
                                                <Bookmark size={20} />
                                            </button>
                                        </div>

                                        <h3 className="text-2xl font-light text-stone-800 mb-3 group-hover:text-sage-600 transition-colors">
                                            {conf.title}
                                        </h3>
                                        <p className="text-sage-600 font-medium text-sm mb-4">Theme: {conf.theme}</p>

                                        <div className="space-y-3 mb-6">
                                            <div className="flex items-center text-stone-500 text-sm">
                                                <Calendar size={16} className="mr-2" />
                                                {new Date(conf.startDate).toLocaleDateString(undefined, {
                                                    weekday: 'long',
                                                    month: 'long',
                                                    day: 'numeric'
                                                })}
                                            </div>
                                            <div className="flex items-center text-stone-500 text-sm">
                                                <Clock size={16} className="mr-2" />
                                                {new Date(conf.startDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} -
                                                {new Date(conf.endDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </div>
                                            <div className="flex items-center text-stone-500 text-sm">
                                                {conf.virtualRoomLink ? (
                                                    <><Video size={16} className="mr-2" /> Virtual Room Access</>
                                                ) : (
                                                    <><MapPin size={16} className="mr-2" /> {conf.location || 'Online Only'}</>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex items-center -space-x-2 mb-6">
                                            {conf.attendees?.slice(0, 5)?.map((att: any, i: number) => (
                                                <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-sage-200" />
                                            ))}
                                            {conf.attendees?.length > 5 && (
                                                <div className="w-8 h-8 rounded-full border-2 border-white bg-cream-200 flex items-center justify-center text-[10px] text-stone-600">
                                                    +{conf.attendees.length - 5}
                                                </div>
                                            )}
                                            <span className="ml-4 text-xs text-stone-400">
                                                {conf.attendees?.length || 0} Registered
                                            </span>
                                        </div>
                                    </div>

                                    <div className="pt-6 border-t border-cream-100 flex gap-4">
                                        {conf.status === 'LIVE' ? (
                                            <button
                                                onClick={() => window.open(conf.virtualRoomLink)}
                                                className="flex-1 bg-sage-500 text-white py-3 rounded-xl hover:bg-sage-600 transition-all flex items-center justify-center font-medium"
                                            >
                                                Join Now <ExternalLink size={18} className="ml-2" />
                                            </button>
                                        ) : conf.status === 'UPCOMING' ? (
                                            <button
                                                onClick={() => handleRSVP(conf.id)}
                                                disabled={rsvped[conf.id] || rsvping === conf.id}
                                                className={`flex-1 py-3 rounded-xl transition-all flex items-center justify-center font-medium ${
                                                    rsvped[conf.id]
                                                        ? 'bg-sage-500 text-white cursor-default'
                                                        : 'bg-cream-100 text-stone-700 hover:bg-sage-500 hover:text-white'
                                                }`}
                                            >
                                                {rsvped[conf.id] ? <>Registered <CheckCircle size={18} className="ml-2" /></> : <>Register <CheckCircle size={18} className="ml-2" /></>}
                                            </button>
                                        ) : (
                                            <button className="flex-1 bg-cream-50 text-stone-400 py-3 rounded-xl cursor-default flex items-center justify-center font-medium">
                                                Completed <Info size={18} className="ml-2" />
                                            </button>
                                        )}
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                )}
            </div>
        </div>
    );
}
