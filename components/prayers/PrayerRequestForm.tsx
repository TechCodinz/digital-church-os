"use client";

import { useState } from "react";
import { Send, Heart, Shield, Globe, Lock, CheckCircle, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function PrayerRequestForm({ onSubmitted }: { onSubmitted?: () => void }) {
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [visibility, setVisibility] = useState<'PUBLIC' | 'PRIVATE' | 'ANONYMOUS'>("PUBLIC");
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        setError(null);
        try {
            const res = await fetch("/api/prayers", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ title, content, visibility }),
            });
            const data = await res.json();
            if (res.ok) {
                setSuccess(true);
                setTitle("");
                setContent("");
                setVisibility("PUBLIC");
                onSubmitted?.();
                // Auto-dismiss success after 4s
                setTimeout(() => setSuccess(false), 4000);
            } else {
                setError(data.error || "Failed to submit prayer. Please try again.");
            }
        } catch (err) {
            setError("Network error. Please check your connection and try again.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="sanctuary-card border border-sage-100 max-w-2xl mx-auto shadow-xl"
        >
            <h3 className="text-2xl font-light mb-6 text-stone-800 flex items-center">
                <Heart className="mr-2 text-rose-400" size={24} />
                Share a Prayer Request
            </h3>

            <AnimatePresence>
                {success && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 mb-6 flex items-center gap-3 text-emerald-700"
                    >
                        <CheckCircle size={20} className="flex-shrink-0" />
                        <div>
                            <p className="font-medium">Prayer submitted!</p>
                            <p className="text-sm opacity-80">
                                {visibility === 'PRIVATE'
                                    ? 'Your private prayer has been received.'
                                    : 'Your prayer has been added to the prayer wall.'}
                            </p>
                        </div>
                    </motion.div>
                )}
                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-6 flex items-center gap-3 text-red-700"
                    >
                        <AlertCircle size={20} className="flex-shrink-0" />
                        {error}
                    </motion.div>
                )}
            </AnimatePresence>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label className="block text-sm font-medium text-stone-600 mb-2">Title of your request</label>
                    <input
                        type="text"
                        className="w-full px-4 py-3 bg-cream-50 border-transparent rounded-xl focus:ring-2 focus:ring-sage-200 outline-none transition-all"
                        placeholder="e.g. For my family's strength"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-stone-600 mb-2">How can we pray for you?</label>
                    <textarea
                        rows={4}
                        className="w-full px-4 py-3 bg-cream-50 border-transparent rounded-xl focus:ring-2 focus:ring-sage-200 outline-none transition-all resize-none"
                        placeholder="Explain your heart's desire..."
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        required
                    />
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-white p-4 rounded-2xl border border-cream-100">
                    <div className="flex bg-cream-50 p-1 rounded-xl">
                        {[
                            { id: 'PUBLIC', icon: Globe, label: 'Public' },
                            { id: 'PRIVATE', icon: Lock, label: 'Private' },
                            { id: 'ANONYMOUS', icon: Shield, label: 'Anonymous' }
                        ].map((opt) => (
                            <button
                                key={opt.id}
                                type="button"
                                onClick={() => setVisibility(opt.id as any)}
                                className={`flex items-center px-4 py-2 rounded-lg text-sm transition-all ${visibility === opt.id
                                    ? 'bg-sage-500 text-white shadow-md'
                                    : 'text-stone-500 hover:bg-cream-100'
                                    }`}
                            >
                                <opt.icon size={16} className="mr-2" />
                                {opt.label}
                            </button>
                        ))}
                    </div>

                    <button
                        type="submit"
                        disabled={submitting || !title.trim() || !content.trim()}
                        className="px-10 py-3 bg-sage-500 text-white rounded-xl hover:bg-sage-600 transition-all font-medium flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {submitting ? 'Submitting...' : (
                            <>Submit Request <Send size={18} className="ml-2" /></>
                        )}
                    </button>
                </div>
            </form>
        </motion.div>
    );
}
