"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSession } from "next-auth/react";
import { Heart, MessageCircle, Share2, Info, User, HandHeart, Users, Sparkles, Loader2 } from "lucide-react";

interface Prayer {
    id: string;
    title: string;
    content: string;
    visibility: string;
    createdAt: string;
    user?: { name?: string | null };
    themes?: string[];
    themeLabels?: string[];
    intercessorCount?: number;
}

export function PrayerWall() {
    const { data: session } = useSession();
    const [prayers, setPrayers] = useState<Prayer[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTheme, setActiveTheme] = useState<string | null>(null);
    const [counts, setCounts] = useState<Record<string, number>>({});
    const [joined, setJoined] = useState<Record<string, boolean>>({});
    const [joining, setJoining] = useState<string | null>(null);

    useEffect(() => {
        fetch("/api/prayers")
            .then((res) => res.json())
            .then((data: Prayer[]) => {
                setPrayers(Array.isArray(data) ? data : []);
                const c: Record<string, number> = {};
                (data || []).forEach((p) => (c[p.id] = p.intercessorCount || 0));
                setCounts(c);
                setLoading(false);
            })
            .catch((err) => {
                console.error(err);
                setLoading(false);
            });
    }, []);

    // Build the "connect by need" filter from themes present on the wall.
    const needFilters = useMemo(() => {
        const map = new Map<string, { label: string; count: number }>();
        prayers.forEach((p) => {
            (p.themes || []).forEach((t, i) => {
                const label = p.themeLabels?.[i] || t;
                const cur = map.get(t) || { label, count: 0 };
                cur.count += 1;
                map.set(t, cur);
            });
        });
        return Array.from(map.entries())
            .map(([theme, v]) => ({ theme, ...v }))
            .sort((a, b) => b.count - a.count);
    }, [prayers]);

    const visible = activeTheme ? prayers.filter((p) => (p.themes || []).includes(activeTheme)) : prayers;
    const totalInterceding = Object.values(counts).reduce((a, b) => a + b, 0);

    const joinInPrayer = async (id: string) => {
        if (!session) {
            window.location.href = "/auth/signin";
            return;
        }
        setJoining(id);
        // Optimistic update
        setCounts((c) => ({ ...c, [id]: (c[id] || 0) + (joined[id] ? 0 : 1) }));
        setJoined((j) => ({ ...j, [id]: true }));
        try {
            const res = await fetch("/api/prayers/intercede", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ prayerRequestId: id }),
            });
            const data = await res.json();
            if (typeof data.count === "number") setCounts((c) => ({ ...c, [id]: data.count }));
        } catch (err) {
            console.error("Join in prayer failed:", err);
        } finally {
            setJoining(null);
        }
    };

    if (loading) return <div className="text-center p-12 text-stone-400">Pouring over requests...</div>;

    return (
        <div className="space-y-8">
            {/* Connection banner */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-sage-50 border border-sage-100">
                <div className="flex items-center gap-2 text-sm text-sage-700">
                    <Users className="w-4 h-4" />
                    <span className="font-semibold">{totalInterceding.toLocaleString()}</span> intercessions offered — connect with others carrying the same need.
                </div>
            </div>

            {/* Connect-by-need filter */}
            {needFilters.length > 0 && (
                <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-stone-400 flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5 text-sage-500" /> Pray by need:
                    </span>
                    <button
                        onClick={() => setActiveTheme(null)}
                        className={`text-xs px-3 py-1 rounded-full border transition-all ${
                            activeTheme === null
                                ? "bg-sage-500 text-white border-sage-500"
                                : "bg-white text-stone-600 border-stone-200 hover:border-sage-300"
                        }`}
                    >
                        All ({prayers.length})
                    </button>
                    {needFilters.map((f) => (
                        <button
                            key={f.theme}
                            onClick={() => setActiveTheme(f.theme)}
                            className={`text-xs px-3 py-1 rounded-full border transition-all ${
                                activeTheme === f.theme
                                    ? "bg-sage-500 text-white border-sage-500"
                                    : "bg-white text-stone-600 border-stone-200 hover:border-sage-300"
                            }`}
                        >
                            {f.label} ({f.count})
                        </button>
                    ))}
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <AnimatePresence mode="popLayout">
                    {visible.map((prayer, index) => (
                        <motion.div
                            key={prayer.id}
                            layout
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ delay: Math.min(index * 0.06, 0.4) }}
                            className="sanctuary-card hover:shadow-xl transition-all relative group overflow-hidden border border-sage-50 flex flex-col"
                        >
                            <div className="absolute top-0 right-0 p-4 opacity-50">
                                <Heart size={40} className="text-rose-100 group-hover:text-rose-200 transition-colors" />
                            </div>

                            <div className="flex items-center space-x-3 mb-4">
                                <div className="w-10 h-10 bg-sage-100 rounded-full flex items-center justify-center text-sage-600">
                                    {prayer.visibility === "ANONYMOUS" ? <Info size={20} /> : <User size={20} />}
                                </div>
                                <div>
                                    <p className="font-medium text-stone-800">
                                        {prayer.visibility === "ANONYMOUS" ? "Humble Servant" : prayer.user?.name || "A Member"}
                                    </p>
                                    <p className="text-xs text-stone-400">{new Date(prayer.createdAt).toLocaleDateString()}</p>
                                </div>
                            </div>

                            <h4 className="text-xl font-medium text-stone-800 mb-2">{prayer.title}</h4>

                            {/* Need tags */}
                            {prayer.themeLabels && prayer.themeLabels.length > 0 && (
                                <div className="flex flex-wrap gap-1.5 mb-3">
                                    {prayer.themeLabels.slice(0, 3).map((label) => (
                                        <span
                                            key={label}
                                            className="text-[10px] px-2 py-0.5 rounded-full bg-sage-50 text-sage-700 border border-sage-100 font-semibold"
                                        >
                                            {label}
                                        </span>
                                    ))}
                                </div>
                            )}

                            <p className="text-stone-600 line-clamp-4 leading-relaxed italic mb-6 flex-1">"{prayer.content}"</p>

                            <div className="flex items-center justify-between pt-4 border-t border-cream-100">
                                <button
                                    onClick={() => joinInPrayer(prayer.id)}
                                    disabled={joining === prayer.id}
                                    className={`flex items-center gap-2 text-xs font-semibold px-3 py-2 rounded-full transition-all ${
                                        joined[prayer.id]
                                            ? "bg-rose-500 text-white"
                                            : "bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-100"
                                    }`}
                                >
                                    {joining === prayer.id ? (
                                        <Loader2 size={14} className="animate-spin" />
                                    ) : (
                                        <HandHeart size={14} />
                                    )}
                                    <span>{joined[prayer.id] ? "Praying with you" : "Join in prayer"}</span>
                                    <span className="ml-1 px-1.5 py-0.5 rounded-full bg-white/30 text-[10px]">
                                        {counts[prayer.id] || 0}
                                    </span>
                                </button>
                                <div className="flex space-x-3 text-stone-300">
                                    <button className="hover:text-sage-500 transition-colors">
                                        <MessageCircle size={18} />
                                    </button>
                                    <button className="hover:text-blue-500 transition-colors">
                                        <Share2 size={18} />
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>

                {visible.length === 0 && (
                    <div className="col-span-full text-center py-20 bg-white rounded-3xl border border-cream-100">
                        <Heart className="w-16 h-16 text-stone-200 mx-auto mb-4" />
                        <p className="text-stone-500">
                            {activeTheme ? "No prayers for this need yet — be the first to share one." : "The wall is empty. Be the first to share a prayer."}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
