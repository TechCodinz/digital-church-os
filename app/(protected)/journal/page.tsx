'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSession } from 'next-auth/react';
import { BookOpen, Plus, X, Loader2, Save, Heart, Search, Calendar, Edit3, Trash2, ChevronRight } from 'lucide-react';

const moods = ['Grateful', 'Peaceful', 'Hopeful', 'Challenged', 'Struggling', 'Joyful', 'Seeking', 'Blessed', 'Worshipful', 'Faithful'];

const moodColors: Record<string, string> = {
    Grateful: 'bg-amber-50 text-amber-700 border-amber-200',
    Peaceful: 'bg-blue-50 text-blue-700 border-blue-200',
    Hopeful: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    Challenged: 'bg-orange-50 text-orange-700 border-orange-200',
    Struggling: 'bg-rose-50 text-rose-700 border-rose-200',
    Joyful: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    Seeking: 'bg-purple-50 text-purple-700 border-purple-200',
    Blessed: 'bg-sage-50 text-sage-700 border-sage-200',
    Worshipful: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    Faithful: 'bg-stone-50 text-stone-700 border-stone-200',
};

interface JournalEntry {
    id: string;
    title: string;
    content: string;
    mood?: string;
    createdAt: string;
}

interface EntryForm {
    title: string;
    content: string;
    mood: string;
}

function NewEntryModal({ onClose, onCreated }: { onClose: () => void; onCreated: (entry: JournalEntry) => void }) {
    const [form, setForm] = useState<EntryForm>({ title: '', content: '', mood: 'Grateful' });
    const [saving, setSaving] = useState(false);

    const handleCreate = async () => {
        if (!form.title.trim() || !form.content.trim()) return;
        setSaving(true);
        try {
            const res = await fetch('/api/user/journal', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form),
            });
            if (res.ok) {
                const entry = await res.json();
                onCreated(entry);
                onClose();
            }
        } catch (e) { console.error(e); }
        finally { setSaving(false); }
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl p-8 relative max-h-[90vh] overflow-y-auto"
                onClick={e => e.stopPropagation()}
            >
                <button onClick={onClose} className="absolute top-6 right-6 text-stone-400 hover:text-stone-700"><X size={20} /></button>
                <h3 className="text-2xl font-light text-stone-800 mb-1">New Journal Entry</h3>
                <p className="text-stone-500 text-sm mb-6">Record your spiritual thoughts, prayers, and reflections.</p>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-stone-600 mb-1">Title *</label>
                        <input
                            value={form.title}
                            onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                            placeholder="E.g., What God spoke to me today..."
                            className="w-full px-4 py-3 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sage-200 text-sm"
                            autoFocus
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-stone-600 mb-2">How are you feeling spiritually?</label>
                        <div className="flex flex-wrap gap-2">
                            {moods.map(m => (
                                <button key={m} type="button" onClick={() => setForm(f => ({ ...f, mood: m }))}
                                    className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${form.mood === m ? 'bg-sage-500 text-white border-sage-500' : 'bg-stone-50 text-stone-600 border-stone-200 hover:border-sage-300'}`}>
                                    {m}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-stone-600 mb-1">Your Reflection *</label>
                        <textarea
                            value={form.content}
                            onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
                            rows={8}
                            placeholder="Write freely. This is your personal space with God..."
                            className="w-full px-4 py-3 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sage-200 text-sm resize-none"
                        />
                    </div>
                </div>
                <div className="flex gap-3 mt-6">
                    <button onClick={onClose} className="flex-1 py-3 bg-stone-100 text-stone-600 rounded-xl font-medium hover:bg-stone-200 transition-colors">Cancel</button>
                    <button onClick={handleCreate} disabled={saving || !form.title.trim() || !form.content.trim()}
                        className="flex-1 py-3 bg-sage-500 text-white rounded-xl font-medium hover:bg-sage-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        {saving ? 'Saving...' : 'Save Entry'}
                    </button>
                </div>
            </motion.div>
        </div>
    );
}

export default function JournalPage() {
    const { data: session } = useSession();
    const [entries, setEntries] = useState<JournalEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [showNewEntry, setShowNewEntry] = useState(false);
    const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null);
    const [search, setSearch] = useState('');

    const fetchEntries = useCallback(async () => {
        try {
            const res = await fetch('/api/user/journal');
            const data = await res.json();
            setEntries(Array.isArray(data) ? data : []);
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    }, []);

    useEffect(() => { fetchEntries(); }, [fetchEntries]);

    const deleteEntry = async (id: string) => {
        if (!confirm('Delete this journal entry?')) return;
        try {
            await fetch(`/api/user/journal/${id}`, { method: 'DELETE' });
            setEntries(prev => prev.filter(e => e.id !== id));
            if (selectedEntry?.id === id) setSelectedEntry(null);
        } catch (e) { console.error(e); }
    };

    const filtered = entries.filter(e =>
        e.title.toLowerCase().includes(search.toLowerCase()) ||
        e.content.toLowerCase().includes(search.toLowerCase())
    );

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-cream-50">
            <div className="w-12 h-12 border-4 border-sage-500 border-t-transparent rounded-full animate-spin" />
        </div>
    );

    return (
        <div className="min-h-screen pt-20 bg-cream-50">
            <AnimatePresence>
                {showNewEntry && <NewEntryModal onClose={() => setShowNewEntry(false)} onCreated={e => { setEntries(prev => [e, ...prev]); setSelectedEntry(e); }} />}
            </AnimatePresence>

            <div className="max-w-7xl mx-auto px-4 py-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-light text-stone-800">Spiritual Journal</h1>
                        <p className="text-stone-500 mt-1 italic text-sm">"Write the vision; make it plain on tablets." — Habakkuk 2:2</p>
                    </div>
                    <button onClick={() => setShowNewEntry(true)}
                        className="flex items-center gap-2 px-5 py-2.5 bg-sage-500 text-white rounded-xl hover:bg-sage-600 transition-colors font-medium text-sm shadow-sm">
                        <Plus className="w-4 h-4" /> New Entry
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left: Entry List */}
                    <div className="lg:col-span-1">
                        {/* Search */}
                        <div className="relative mb-4">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 w-4 h-4" />
                            <input
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                placeholder="Search entries..."
                                className="w-full pl-10 pr-4 py-2.5 bg-white border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sage-200 text-sm"
                            />
                        </div>

                        <div className="space-y-2 max-h-[calc(100vh-280px)] overflow-y-auto pr-1">
                            {filtered.length === 0 ? (
                                <div className="text-center py-12 text-stone-400">
                                    <BookOpen className="w-10 h-10 mx-auto mb-3 opacity-40" />
                                    <p className="text-sm">{search ? 'No entries match your search.' : 'Start your spiritual journal!'}</p>
                                    {!search && <button onClick={() => setShowNewEntry(true)} className="mt-3 text-sage-600 text-sm font-medium hover:underline">Write your first entry →</button>}
                                </div>
                            ) : filtered.map(entry => (
                                <motion.button
                                    key={entry.id}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    onClick={() => setSelectedEntry(entry)}
                                    className={`w-full text-left p-4 rounded-2xl border transition-all ${selectedEntry?.id === entry.id ? 'bg-sage-500 text-white border-sage-500' : 'bg-white text-stone-800 border-stone-100 hover:border-sage-200 hover:shadow-sm'}`}
                                >
                                    <div className="flex items-start justify-between gap-2">
                                        <p className="font-medium text-sm line-clamp-1">{entry.title}</p>
                                        {entry.mood && (
                                            <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border flex-shrink-0 ${selectedEntry?.id === entry.id ? 'bg-white/20 text-white border-white/30' : moodColors[entry.mood] || 'bg-stone-50 text-stone-500 border-stone-200'}`}>
                                                {entry.mood}
                                            </span>
                                        )}
                                    </div>
                                    <p className={`text-xs mt-1 line-clamp-2 ${selectedEntry?.id === entry.id ? 'text-white/70' : 'text-stone-400'}`}>{entry.content}</p>
                                    <div className={`flex items-center gap-1 mt-2 text-[10px] ${selectedEntry?.id === entry.id ? 'text-white/60' : 'text-stone-400'}`}>
                                        <Calendar className="w-3 h-3" />
                                        {new Date(entry.createdAt).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                                    </div>
                                </motion.button>
                            ))}
                        </div>
                    </div>

                    {/* Right: Entry Detail */}
                    <div className="lg:col-span-2">
                        <AnimatePresence mode="wait">
                            {selectedEntry ? (
                                <motion.div key={selectedEntry.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-3xl p-8 border border-stone-100 shadow-sm">
                                    <div className="flex items-start justify-between mb-6">
                                        <div className="flex-1 min-w-0">
                                            <h2 className="text-2xl font-light text-stone-800 mb-2">{selectedEntry.title}</h2>
                                            <div className="flex items-center gap-3">
                                                {selectedEntry.mood && (
                                                    <span className={`text-xs font-medium px-3 py-1 rounded-full border ${moodColors[selectedEntry.mood] || 'bg-stone-50 text-stone-500 border-stone-200'}`}>
                                                        {selectedEntry.mood}
                                                    </span>
                                                )}
                                                <span className="text-stone-400 text-sm flex items-center gap-1">
                                                    <Calendar className="w-3.5 h-3.5" />
                                                    {new Date(selectedEntry.createdAt).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex gap-2 ml-4">
                                            <button onClick={() => deleteEntry(selectedEntry.id)} className="p-2 text-stone-300 hover:text-red-400 transition-colors rounded-lg hover:bg-red-50">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                    <div className="prose prose-stone max-w-none">
                                        <p className="text-stone-700 leading-relaxed whitespace-pre-wrap text-base">{selectedEntry.content}</p>
                                    </div>
                                </motion.div>
                            ) : (
                                <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white rounded-3xl p-12 border border-stone-100 text-center h-full flex flex-col items-center justify-center min-h-[400px]">
                                    <BookOpen className="w-12 h-12 text-stone-200 mb-4" />
                                    <h3 className="text-xl font-light text-stone-500 mb-2">Your journal awaits</h3>
                                    <p className="text-stone-400 text-sm max-w-xs mb-6">Select an entry to read, or create a new one to begin capturing your spiritual journey.</p>
                                    <button onClick={() => setShowNewEntry(true)} className="flex items-center gap-2 px-5 py-2.5 bg-sage-500 text-white rounded-xl hover:bg-sage-600 transition-colors font-medium text-sm">
                                        <Edit3 className="w-4 h-4" /> Write First Entry
                                    </button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                {/* Stats Bar */}
                {entries.length > 0 && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-6 grid grid-cols-3 gap-4">
                        {[
                            { label: 'Total Entries', value: entries.length, icon: BookOpen },
                            { label: 'This Month', value: entries.filter(e => new Date(e.createdAt).getMonth() === new Date().getMonth()).length, icon: Calendar },
                            { label: 'Unique Moods', value: new Set(entries.map(e => e.mood).filter(Boolean)).size, icon: Heart },
                        ].map(stat => (
                            <div key={stat.label} className="bg-white rounded-2xl p-4 border border-stone-100 flex items-center gap-3">
                                <stat.icon className="w-5 h-5 text-sage-500" />
                                <div>
                                    <p className="text-xl font-light text-stone-800">{stat.value}</p>
                                    <p className="text-xs text-stone-500">{stat.label}</p>
                                </div>
                            </div>
                        ))}
                    </motion.div>
                )}
            </div>
        </div>
    );
}
