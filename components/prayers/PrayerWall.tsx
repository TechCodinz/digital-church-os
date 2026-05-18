"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, MessageCircle, Share2, Info, User } from "lucide-react";

export function PrayerWall() {
    const [prayers, setPrayers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch("/api/prayers")
            .then(res => res.json())
            .then(data => {
                setPrayers(data);
                setLoading(false);
            })
            .catch(err => console.error(err));
    }, []);

    if (loading) return <div className="text-center p-12 text-stone-400">Pouring over requests...</div>;

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <AnimatePresence>
                {prayers.map((prayer, index) => (
                    <motion.div
                        key={prayer.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="sanctuary-card hover:shadow-xl transition-all relative group overflow-hidden border border-sage-50"
                    >
                        <div className="absolute top-0 right-0 p-4 opacity-50">
                            <Heart size={40} className="text-rose-100 group-hover:text-rose-200 transition-colors" />
                        </div>

                        <div className="flex items-center space-x-3 mb-6">
                            <div className="w-10 h-10 bg-sage-100 rounded-full flex items-center justify-center text-sage-600">
                                {prayer.visibility === 'ANONYMOUS' ? <Info size={20} /> : <User size={20} />}
                            </div>
                            <div>
                                <p className="font-medium text-stone-800">
                                    {prayer.visibility === 'ANONYMOUS' ? 'Humble Servant' : (prayer.user?.name || 'A Member')}
                                </p>
                                <p className="text-xs text-stone-400">
                                    {new Date(prayer.createdAt).toLocaleDateString()}
                                </p>
                            </div>
                        </div>

                        <h4 className="text-xl font-medium text-stone-800 mb-3">{prayer.title}</h4>
                        <p className="text-stone-600 line-clamp-4 leading-relaxed italic mb-6">
                            "{prayer.content}"
                        </p>

                        <div className="flex items-center justify-between pt-6 border-t border-cream-100">
                            <button className="flex items-center space-x-2 text-stone-400 hover:text-rose-500 transition-colors">
                                <Heart size={18} />
                                <span className="text-xs">Intercede</span>
                            </button>
                            <div className="flex space-x-4">
                                <button className="text-stone-300 hover:text-sage-500 transition-colors">
                                    <MessageCircle size={18} />
                                </button>
                                <button className="text-stone-300 hover:text-blue-500 transition-colors">
                                    <Share2 size={18} />
                                </button>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </AnimatePresence>
            {prayers.length === 0 && (
                <div className="col-span-full text-center py-20 bg-white rounded-3xl border border-cream-100">
                    <Heart className="w-16 h-16 text-stone-200 mx-auto mb-4" />
                    <p className="text-stone-500">The wall is empty. Be the first to share a prayer.</p>
                </div>
            )}
        </div>
    );
}
