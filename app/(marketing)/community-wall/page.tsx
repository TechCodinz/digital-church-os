'use client';

import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
    AlertCircle,
    BookOpen,
    Heart,
    MessageSquare,
    Search,
    Send,
    Shield,
    ShieldCheck,
    Sparkles,
    Users,
} from 'lucide-react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { ShareButton } from '@/components/sharing/ShareButton';
import { ScriptureText } from '@/components/scripture/ScriptureReference';
import { useSanctuaryTheme } from '@/components/theme/ThemeContext';

export default function CommunityWallPage() {
    const { data: session } = useSession();
    const { theme } = useSanctuaryTheme();
    const [mounted, setMounted] = useState(false);
    const [posts, setPosts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [query, setQuery] = useState('');
    const [composerOpen, setComposerOpen] = useState(false);
    const [newPost, setNewPost] = useState({ title: '', content: '', scriptureRef: '' });
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [likes, setLikes] = useState<Record<string, number>>({});
    const [liked, setLiked] = useState<Record<string, boolean>>({});

    useEffect(() => setMounted(true), []);

    const activeTheme = mounted ? theme : 'emerald';
    const isLight = activeTheme === 'light';

    const fetchPosts = async () => {
        try {
            const response = await fetch('/api/posts');
            if (!response.ok) throw new Error('Unable to load posts');
            const data = await response.json();
            setPosts(Array.isArray(data.posts) ? data.posts : []);
        } catch {
            setPosts([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPosts();
    }, []);

    const filteredPosts = useMemo(() => {
        const normalized = query.trim().toLowerCase();
        if (!normalized) return posts;
        return posts.filter((post) =>
            [post.title, post.content, post.scriptureRef, post.user?.name]
                .filter(Boolean)
                .some((value) => String(value).toLowerCase().includes(normalized))
        );
    }, [posts, query]);

    const handleLike = async (post: any) => {
        if (liked[post.id]) return;
        const previousCount = likes[post.id] ?? post.likes ?? 0;
        setLiked((previous) => ({ ...previous, [post.id]: true }));
        setLikes((previous) => ({ ...previous, [post.id]: previousCount + 1 }));

        try {
            const response = await fetch(`/api/posts/${post.id}/like`, { method: 'POST' });
            if (!response.ok) throw new Error('Like failed');
            const data = await response.json();
            if (typeof data.likes === 'number') setLikes((previous) => ({ ...previous, [post.id]: data.likes }));
        } catch {
            setLiked((previous) => ({ ...previous, [post.id]: false }));
            setLikes((previous) => ({ ...previous, [post.id]: previousCount }));
        }
    };

    const handlePostSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        if (!session) {
            setError('Sign in before sharing with the community.');
            return;
        }

        setSubmitting(true);
        setError(null);
        setSuccessMessage(null);

        try {
            const response = await fetch('/api/posts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newPost),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || 'Unable to submit post');

            setNewPost({ title: '', content: '', scriptureRef: '' });
            setSuccessMessage(
                data.post?.status === 'PENDING'
                    ? 'Your post is in moderation. It will appear after approval.'
                    : 'Your post has been shared with the community.'
            );
            setComposerOpen(false);
            await fetchPosts();
        } catch (submitError: any) {
            setError(submitError?.message || 'Something went wrong while sharing your post.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className={`sanctuary-page-shell min-h-screen pt-24 pb-24 ${isLight ? 'bg-[#f8f3eb]/92 text-stone-900' : 'bg-[#020807]/92 text-white'}`}>
            <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6">
                <section className="relative overflow-hidden rounded-[2rem] border border-white/8 bg-[#07110f] px-6 py-10 sm:px-10 sm:py-12 text-white shadow-2xl shadow-black/20">
                    <div className="absolute inset-0 sanctuary-radiance" aria-hidden="true" />
                    <div className="relative grid lg:grid-cols-[1.1fr_0.9fr] gap-10 items-end">
                        <div>
                            <div className="inline-flex items-center gap-2 rounded-full border border-amber-300/18 bg-amber-300/7 px-4 py-2 text-[10px] uppercase tracking-[0.22em] text-amber-200">
                                <Users className="h-3.5 w-3.5" /> Community fellowship
                            </div>
                            <h1 className="mt-6 text-4xl sm:text-5xl lg:text-6xl font-light tracking-tight leading-[1.03]">A wall built for testimony, encouragement, prayer, and thoughtful conversation.</h1>
                            <p className="mt-5 max-w-3xl text-sm sm:text-base leading-relaxed text-slate-400">Share what strengthens the community. Scripture references stay interactive, moderation remains visible, and sensitive pastoral matters have a safer path than a public feed.</p>
                            <div className="mt-7 flex flex-wrap gap-3">
                                {session ? (
                                    <button onClick={() => setComposerOpen(true)} className="sacred-primary-button"><MessageSquare className="h-4 w-4" /> Share something</button>
                                ) : (
                                    <Link href="/auth/signin" className="sacred-primary-button">Sign in to share</Link>
                                )}
                                <Link href="/prayer-room" className="sacred-secondary-button"><Heart className="h-4 w-4" /> Prayer Room</Link>
                            </div>
                        </div>

                        <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur-xl">
                            <ShieldCheck className="h-5 w-5 text-emerald-300" />
                            <h2 className="mt-4 text-lg font-semibold">Community with boundaries</h2>
                            <p className="mt-2 text-xs leading-relaxed text-slate-500">Moderation helps reduce harmful or inappropriate public content. Avoid diagnosing people, declaring prophecy over strangers, exposing private pastoral matters, or presenting personal interpretation as unquestionable divine instruction.</p>
                            <Link href="/pastoral/hub" className="mt-5 inline-flex items-center gap-2 text-xs font-bold text-amber-300">Sensitive concern? Use Pastoral Care →</Link>
                        </div>
                    </div>
                </section>

                <section className="mt-8 grid gap-4 lg:grid-cols-[minmax(0,1fr)_260px] lg:items-start">
                    <div>
                        <div className={`rounded-3xl border p-3 ${isLight ? 'border-stone-200 bg-white/80' : 'border-white/8 bg-white/[0.025]'}`}>
                            <div className="relative">
                                <Search className={`absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 ${isLight ? 'text-stone-400' : 'text-slate-600'}`} />
                                <input
                                    value={query}
                                    onChange={(event) => setQuery(event.target.value)}
                                    placeholder="Search testimony, Scripture reference, or person..."
                                    className={`w-full rounded-2xl border py-3 pl-11 pr-4 text-sm outline-none transition-all focus:ring-2 focus:ring-amber-300/15 ${isLight ? 'border-stone-100 bg-[#fbf8f3] text-stone-900 placeholder:text-stone-400' : 'border-white/7 bg-black/15 text-white placeholder:text-slate-700'}`}
                                />
                            </div>
                        </div>

                        {successMessage && <div className={`mt-4 rounded-2xl border p-4 text-xs ${isLight ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : 'border-emerald-300/15 bg-emerald-300/[0.045] text-emerald-300'}`}>{successMessage}</div>}

                        <div className="mt-6 flex items-end justify-between gap-4">
                            <div>
                                <p className={`sanctuary-section-label ${isLight ? 'text-sage-700' : 'text-emerald-300'}`}>Community feed</p>
                                <h2 className={`mt-2 text-3xl font-light ${isLight ? 'text-stone-900' : 'text-white'}`}>{query ? 'Search results' : 'Recent moments'}</h2>
                            </div>
                            <p className={`text-[10px] ${isLight ? 'text-stone-400' : 'text-slate-600'}`}>{filteredPosts.length} {filteredPosts.length === 1 ? 'post' : 'posts'}</p>
                        </div>

                        {loading ? (
                            <div className="py-24 text-center">
                                <Sparkles className={`mx-auto h-6 w-6 animate-pulse ${isLight ? 'text-sage-700' : 'text-amber-300'}`} />
                                <p className={`mt-4 text-xs ${isLight ? 'text-stone-400' : 'text-slate-600'}`}>Gathering community posts…</p>
                            </div>
                        ) : filteredPosts.length === 0 ? (
                            <div className={`mt-6 rounded-[2rem] border border-dashed p-10 text-center ${isLight ? 'border-stone-200 bg-white/60' : 'border-white/10 bg-white/[0.02]'}`}>
                                <MessageSquare className={`mx-auto h-6 w-6 ${isLight ? 'text-stone-300' : 'text-slate-700'}`} />
                                <p className={`mt-4 text-sm ${isLight ? 'text-stone-500' : 'text-slate-500'}`}>{query ? 'No posts match that search yet.' : 'The community wall is quiet right now.'}</p>
                            </div>
                        ) : (
                            <div className="mt-6 space-y-4">
                                <AnimatePresence initial={false}>
                                    {filteredPosts.map((post, index) => (
                                        <motion.article
                                            key={post.id}
                                            initial={{ opacity: 0, y: 14 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: Math.min(index * 0.035, 0.2) }}
                                            className={`rounded-[2rem] border p-6 sm:p-7 transition-all ${isLight ? 'border-stone-200 bg-white/85 hover:border-sage-300 hover:shadow-xl hover:shadow-stone-200/20' : 'border-white/8 bg-white/[0.03] hover:bg-white/[0.045] hover:border-emerald-300/14'}`}
                                        >
                                            <div className="flex items-start justify-between gap-4">
                                                <div className="flex items-center gap-3 min-w-0">
                                                    <div className={`flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-2xl border ${isLight ? 'border-stone-200 bg-sage-50 text-sage-700' : 'border-white/8 bg-white/[0.04] text-emerald-300'}`}>
                                                        {post.user?.avatar ? <img src={post.user.avatar} alt="" className="h-full w-full object-cover" /> : <span className="text-xs font-bold">{post.user?.name?.[0] || 'A'}</span>}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className={`truncate text-sm font-semibold ${isLight ? 'text-stone-800' : 'text-slate-200'}`}>{post.user?.name || 'Anonymous'}</p>
                                                        <p className={`mt-1 text-[10px] ${isLight ? 'text-stone-400' : 'text-slate-600'}`}>{post.createdAt ? new Date(post.createdAt).toLocaleDateString() : 'Community post'}</p>
                                                    </div>
                                                </div>
                                                {post.status === 'APPROVED' && <span title="Moderated"><Shield className={`h-4 w-4 ${isLight ? 'text-sage-600' : 'text-emerald-300'}`} /></span>}
                                            </div>

                                            <h3 className={`mt-6 text-xl sm:text-2xl font-medium ${isLight ? 'text-stone-900' : 'text-white'}`}>{post.title}</h3>
                                            <p className={`mt-3 whitespace-pre-wrap text-sm leading-7 ${isLight ? 'text-stone-600' : 'text-slate-400'}`}>{post.content}</p>

                                            {post.scriptureRef && (
                                                <div className={`mt-5 rounded-2xl border p-4 ${isLight ? 'border-sage-100 bg-sage-50/70' : 'border-emerald-300/10 bg-emerald-300/[0.035]'}`}>
                                                    <div className="flex items-start gap-3">
                                                        <BookOpen className={`mt-0.5 h-4 w-4 shrink-0 ${isLight ? 'text-sage-700' : 'text-emerald-300'}`} />
                                                        <div>
                                                            <p className={`text-[9px] uppercase tracking-[0.18em] font-bold ${isLight ? 'text-sage-700' : 'text-emerald-300'}`}>Scripture reference</p>
                                                            <div className={`mt-2 text-sm leading-relaxed ${isLight ? 'text-stone-700' : 'text-slate-300'}`}><ScriptureText text={post.scriptureRef} /></div>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            <div className={`mt-6 flex flex-wrap items-center gap-5 border-t pt-4 ${isLight ? 'border-stone-100' : 'border-white/7'}`}>
                                                <button onClick={() => handleLike(post)} className={`sacred-focus-ring inline-flex items-center gap-2 rounded-full text-xs font-semibold transition-colors ${liked[post.id] ? 'text-rose-500' : isLight ? 'text-stone-500 hover:text-rose-500' : 'text-slate-500 hover:text-rose-400'}`} aria-label="Encourage this post">
                                                    <Heart className={`h-4 w-4 ${liked[post.id] ? 'fill-current' : ''}`} /> {likes[post.id] ?? post.likes ?? 0}
                                                </button>
                                                <span className={`inline-flex items-center gap-2 text-xs ${isLight ? 'text-stone-400' : 'text-slate-600'}`}><MessageSquare className="h-4 w-4" /> {post._count?.comments || 0}</span>
                                                <ShareButton kind="verse" title={post.title} text={post.content} reference={post.scriptureRef} author={post.user?.name || 'A Member'} compact className={isLight ? 'text-stone-500 hover:text-sage-700' : 'text-slate-500 hover:text-amber-300'} />
                                            </div>
                                        </motion.article>
                                    ))}
                                </AnimatePresence>
                            </div>
                        )}
                    </div>

                    <aside className="space-y-4 lg:sticky lg:top-24">
                        <div className="sacred-panel-dark p-5 text-white">
                            <Sparkles className="h-4 w-4 text-amber-300" />
                            <h3 className="mt-4 text-sm font-semibold">Before you post</h3>
                            <p className="mt-2 text-[11px] leading-relaxed text-slate-500">Share testimony as your experience. When quoting or interpreting Scripture, make the reference clear. Leave room for humility where Christians may differ.</p>
                        </div>
                        <Link href="/prayer-room" className={`group block rounded-3xl border p-5 ${isLight ? 'border-stone-200 bg-white/80' : 'border-white/8 bg-white/[0.03]'}`}>
                            <Heart className={`h-4 w-4 ${isLight ? 'text-sage-700' : 'text-rose-300'}`} />
                            <h3 className={`mt-4 text-sm font-semibold ${isLight ? 'text-stone-800' : 'text-slate-200'}`}>Is this really a prayer request?</h3>
                            <p className={`mt-2 text-[11px] leading-relaxed ${isLight ? 'text-stone-500' : 'text-slate-600'}`}>The Prayer Room gives you better privacy and intercession controls.</p>
                        </Link>
                    </aside>
                </section>
            </div>

            <AnimatePresence>
                {composerOpen && (
                    <div className="fixed inset-0 z-[80] flex items-start justify-center overflow-y-auto bg-black/75 px-4 py-16 backdrop-blur-xl">
                        <motion.div initial={{ opacity: 0, y: 14, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10, scale: 0.98 }} className={`w-full max-w-2xl rounded-[2rem] border p-6 sm:p-8 shadow-2xl ${isLight ? 'border-stone-200 bg-[#fffdf9] text-stone-900' : 'border-white/10 bg-[#07110f] text-white'}`}>
                            <div className="flex items-start justify-between gap-5">
                                <div>
                                    <p className={`sanctuary-section-label ${isLight ? 'text-sage-700' : 'text-amber-300'}`}>Share with the community</p>
                                    <h2 className="mt-3 text-2xl font-light">Say what you mean, with room for grace.</h2>
                                </div>
                                <button onClick={() => setComposerOpen(false)} className={`sacred-focus-ring rounded-full px-3 py-2 text-xs ${isLight ? 'bg-stone-100 text-stone-600' : 'bg-white/[0.05] text-slate-400'}`}>Close</button>
                            </div>

                            <form onSubmit={handlePostSubmit} className="mt-7 space-y-4">
                                <div>
                                    <label htmlFor="community-title" className={`text-xs font-semibold ${isLight ? 'text-stone-700' : 'text-slate-300'}`}>Title</label>
                                    <input id="community-title" value={newPost.title} onChange={(event) => setNewPost((previous) => ({ ...previous, title: event.target.value }))} placeholder="A clear title for what you want to share" className={`mt-2 w-full rounded-2xl border px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-amber-300/15 ${isLight ? 'border-stone-200 bg-[#fbf8f3]' : 'border-white/8 bg-black/18'}`} required />
                                </div>
                                <div>
                                    <label htmlFor="community-content" className={`text-xs font-semibold ${isLight ? 'text-stone-700' : 'text-slate-300'}`}>Message</label>
                                    <textarea id="community-content" value={newPost.content} onChange={(event) => setNewPost((previous) => ({ ...previous, content: event.target.value }))} placeholder="Share testimony, encouragement, or a thoughtful reflection..." rows={6} className={`mt-2 w-full resize-none rounded-2xl border px-4 py-3 text-sm leading-relaxed outline-none focus:ring-2 focus:ring-amber-300/15 ${isLight ? 'border-stone-200 bg-[#fbf8f3]' : 'border-white/8 bg-black/18'}`} required />
                                </div>
                                <div>
                                    <label htmlFor="community-scripture" className={`text-xs font-semibold ${isLight ? 'text-stone-700' : 'text-slate-300'}`}>Scripture reference <span className="font-normal opacity-60">(optional)</span></label>
                                    <input id="community-scripture" value={newPost.scriptureRef} onChange={(event) => setNewPost((previous) => ({ ...previous, scriptureRef: event.target.value }))} placeholder="e.g. Romans 8:28" className={`mt-2 w-full rounded-2xl border px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-amber-300/15 ${isLight ? 'border-stone-200 bg-[#fbf8f3]' : 'border-white/8 bg-black/18'}`} />
                                </div>
                                {error && <p className="flex items-start gap-2 rounded-2xl border border-rose-400/18 bg-rose-400/[0.055] p-3 text-xs leading-relaxed text-rose-400"><AlertCircle className="mt-0.5 h-4 w-4 shrink-0" /> {error}</p>}
                                <button type="submit" disabled={submitting} className={`sacred-focus-ring inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl text-sm font-bold disabled:opacity-40 ${isLight ? 'bg-stone-900 text-white hover:bg-stone-800' : 'bg-amber-200 text-slate-950 hover:bg-amber-100'}`}>
                                    {submitting ? 'Checking and submitting…' : <><Send className="h-4 w-4" /> Share with community</>}
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
