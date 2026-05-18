'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Calendar,
    Clock,
    Plus,
    Trash2,
    Video,
    Users as UsersIcon,
    ChevronRight,
    Search,
    X,
    ArrowLeft,
    Sparkles
} from 'lucide-react';
import Link from 'next/link';
import { SermonGenerator } from '@/components/ai/SermonGenerator';

export default function AdminEventsPage() {
    const [events, setEvents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        theme: '',
        scriptureRefs: '',
        startDate: '',
        endDate: '',
        virtualRoomLink: '',
        maxAttendees: '1000'
    });
    const [isSermonGenOpen, setIsSermonGenOpen] = useState(false);
    const [selectedEventForSermon, setSelectedEventForSermon] = useState<any>(null);

    useEffect(() => {
        fetchEvents();
    }, []);

    const fetchEvents = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/conferences');
            const data = await res.json();
            setEvents(data);
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this event?')) return;
        try {
            const res = await fetch(`/api/conferences?id=${id}`, { method: 'DELETE' });
            if (res.ok) fetchEvents();
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch('/api/conferences', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    scriptureRefs: formData.scriptureRefs.split(',').map(s => s.trim()),
                    startDate: new Date(formData.startDate).toISOString(),
                    endDate: new Date(formData.endDate).toISOString(),
                    maxAttendees: parseInt(formData.maxAttendees)
                })
            });
            if (res.ok) {
                setShowCreateModal(false);
                fetchEvents();
                setFormData({
                    title: '', theme: '', scriptureRefs: '',
                    startDate: '', endDate: '', virtualRoomLink: '',
                    maxAttendees: '1000'
                });
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };

    return (
        <div className="min-h-screen pt-24 pb-12 bg-cream-50">
            <div className="max-w-7xl mx-auto px-4">
                <header className="mb-12 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <Link href="/admin" className="text-sm text-stone-400 hover:text-sage-600 flex items-center mb-2 transition-colors">
                            <ArrowLeft size={14} className="mr-1" /> Back to Dashboard
                        </Link>
                        <h1 className="text-4xl font-light text-stone-800 tracking-tight">Conference Management</h1>
                    </div>

                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="bg-sage-600 text-white px-8 py-4 rounded-2xl font-bold flex items-center gap-2 hover:bg-sage-700 transition-all shadow-lg shadow-sage-200"
                    >
                        <Plus size={20} /> Create Event
                    </button>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {loading ? (
                        <div className="col-span-full text-center py-20 text-stone-400 italic">Syncing with calendar...</div>
                    ) : events.length === 0 ? (
                        <div className="col-span-full sanctuary-card text-center py-20 text-stone-400 italic border border-dashed">
                            No scheduled conferences found.
                        </div>
                    ) : (
                        events.map((event) => (
                            <motion.div
                                key={event.id}
                                layout
                                className="sanctuary-card group flex flex-col justify-between"
                            >
                                <div>
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="w-12 h-12 bg-sage-50 rounded-2xl flex items-center justify-center text-sage-600">
                                            <Calendar size={24} />
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleDelete(event.id)}
                                                className="p-2 text-stone-300 hover:text-rose-600 transition-colors"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </div>
                                    <h3 className="text-xl font-medium text-stone-800 mb-2 truncate">{event.title}</h3>
                                    <p className="text-stone-500 text-sm mb-4 line-clamp-2">{event.theme}</p>

                                    <div className="space-y-3 pt-4 border-t border-stone-100">
                                        <div className="flex items-center text-xs text-stone-400">
                                            <Clock size={14} className="mr-2" />
                                            {new Date(event.startDate).toLocaleString()}
                                        </div>
                                        <div className="flex items-center text-xs text-stone-400">
                                            <Video size={14} className="mr-2" />
                                            {event.virtualRoomLink ? 'Virtual Room Shared' : 'Link not provided'}
                                        </div>
                                        <div className="flex items-center text-xs text-stone-400">
                                            <UsersIcon size={14} className="mr-2" />
                                            {event.attendees?.length || 0} Registered
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-6 flex gap-2">
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-sage-600 bg-sage-50 px-3 py-1 rounded-lg">
                                        {event.status}
                                    </span>
                                    <button
                                        onClick={() => {
                                            setSelectedEventForSermon(event);
                                            setIsSermonGenOpen(true);
                                        }}
                                        className="text-[10px] font-bold uppercase tracking-widest text-white bg-stone-800 px-3 py-1 rounded-lg flex items-center gap-1 hover:bg-stone-900 transition-colors"
                                    >
                                        <Sparkles size={10} /> Generate Sermon
                                    </button>
                                </div>
                            </motion.div>
                        ))
                    )}
                </div>
            </div>

            {/* Create Modal */}
            <AnimatePresence>
                {showCreateModal && (
                    <div className="fixed inset-0 z-[60] flex items-center justify-center px-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-stone-900/40 backdrop-blur-sm"
                            onClick={() => setShowCreateModal(false)}
                        />
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="relative bg-white w-full max-w-2xl rounded-[32px] shadow-2xl overflow-hidden"
                        >
                            <div className="p-8 border-b border-stone-100 flex justify-between items-center">
                                <h2 className="text-2xl font-light text-stone-800">New Virtual Conference</h2>
                                <button onClick={() => setShowCreateModal(false)} className="text-stone-400 hover:text-stone-600">
                                    <X size={24} />
                                </button>
                            </div>
                            <form onSubmit={handleCreate} className="p-8 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="md:col-span-2">
                                        <label className="block text-xs font-bold text-stone-400 uppercase tracking-widest mb-2">Event Title</label>
                                        <input
                                            required
                                            className="w-full bg-cream-50 border-none rounded-2xl px-6 py-4 outline-none focus:ring-2 focus:ring-sage-200 transition-all"
                                            value={formData.title}
                                            onChange={e => setFormData({ ...formData, title: e.target.value })}
                                        />
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-xs font-bold text-stone-400 uppercase tracking-widest mb-2">Theme / Description</label>
                                        <textarea
                                            required
                                            rows={3}
                                            className="w-full bg-cream-50 border-none rounded-2xl px-6 py-4 outline-none focus:ring-2 focus:ring-sage-200 transition-all resize-none"
                                            value={formData.theme}
                                            onChange={e => setFormData({ ...formData, theme: e.target.value })}
                                        />
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-xs font-bold text-stone-400 uppercase tracking-widest mb-2">Scripture References (comma separated)</label>
                                        <input
                                            className="w-full bg-cream-50 border-none rounded-2xl px-6 py-4 outline-none focus:ring-2 focus:ring-sage-200 transition-all"
                                            placeholder="John 3:16, Psalm 23"
                                            value={formData.scriptureRefs}
                                            onChange={e => setFormData({ ...formData, scriptureRefs: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-stone-400 uppercase tracking-widest mb-2">Start Date & Time</label>
                                        <input
                                            required
                                            type="datetime-local"
                                            className="w-full bg-cream-50 border-none rounded-2xl px-6 py-4 outline-none focus:ring-2 focus:ring-sage-200 transition-all"
                                            value={formData.startDate}
                                            onChange={e => setFormData({ ...formData, startDate: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-stone-400 uppercase tracking-widest mb-2">End Date & Time</label>
                                        <input
                                            required
                                            type="datetime-local"
                                            className="w-full bg-cream-50 border-none rounded-2xl px-6 py-4 outline-none focus:ring-2 focus:ring-sage-200 transition-all"
                                            value={formData.endDate}
                                            onChange={e => setFormData({ ...formData, endDate: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-stone-400 uppercase tracking-widest mb-2">Virtual Link (Optional)</label>
                                        <input
                                            type="url"
                                            className="w-full bg-cream-50 border-none rounded-2xl px-6 py-4 outline-none focus:ring-2 focus:ring-sage-200 transition-all"
                                            value={formData.virtualRoomLink}
                                            onChange={e => setFormData({ ...formData, virtualRoomLink: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-stone-400 uppercase tracking-widest mb-2">Capacity</label>
                                        <input
                                            type="number"
                                            className="w-full bg-cream-50 border-none rounded-2xl px-6 py-4 outline-none focus:ring-2 focus:ring-sage-200 transition-all"
                                            value={formData.maxAttendees}
                                            onChange={e => setFormData({ ...formData, maxAttendees: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <button
                                    type="submit"
                                    className="w-full bg-stone-800 text-white py-5 rounded-2xl font-bold hover:bg-stone-900 transition-all shadow-xl shadow-stone-200 mt-4"
                                >
                                    Schedule Conference
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <SermonGenerator
                isOpen={isSermonGenOpen}
                onClose={() => setIsSermonGenOpen(false)}
                onSermonGenerated={(sermon) => {
                    console.log('Sermon generated for event:', selectedEventForSermon?.title, sermon);
                }}
            />
        </div>
    );
}
