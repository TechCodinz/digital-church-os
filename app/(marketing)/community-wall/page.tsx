'use client';

import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Heart, Share2, Shield, Search, Send, AlertCircle, BookOpen, SlidersHorizontal, Flag, Sparkles } from 'lucide-react';
import { useSession } from 'next-auth/react';

type CommunityPost = {
    id: string;
    title: string;
    content: string;
    scriptureRef?: string | null;
    createdAt: string;
    status?: string;
    likes?: number;
    user?: { name?: string | null; avatar?: string | null };
    _count?: { comments?: number };
};

type FeedMode = 'all' | 'scripture' | 'recent';

export default function CommunityWallPage() {
    const { data: session } = useSession();
    const [posts, setPosts] = useState<CommunityPost[]>([]);
    const [loading, setLoading] = useState(true);
    const [newPost, setNewPost] = useState({ title: '', content: '', scriptureRef: '' });
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [query, setQuery] = useState('');
    const [feedMode, setFeedMode] = useState<FeedMode>('all');
    const [sharingId, setSharingId] = useState<string | null>(null);

    useEffect(() => {
        void fetchPosts();
    }, []);

    const fetchPosts = async () => {
        try {
            const res = await fetch('/api/posts');
            if (!res.ok) throw new Error('Community feed unavailable');
            const data = await res.json();
            setPosts(data.posts || []);
        } catch (err) {
            console.error('Error fetching posts:', err);
            setError('The community feed could not be refreshed right now.');
        } finally {
            setLoading(false);
        }
    };

    const filteredPosts = useMemo(() => {
        const normalizedQuery = query.trim().toLowerCase();
        const now = Date.now();
        return posts.filter((post) => {
            if (feedMode === 'scripture' && !post.scriptureRef) return false;
            if (feedMode === 'recent' && now - new Date(post.createdAt).getTime() > 7 * 24 * 60 * 60 * 1000) return false;
            if (!normalizedQuery) return true;
            return [post.title, post.content, post.scriptureRef || '', post.user?.name || '']
                .join(' ')
                .toLowerCase()
                .includes(normalizedQuery);
        });
    }, [feedMode, posts, query]);

    const handlePostSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!session) {
            setError('Please sign in to post.');
            return;
        }

        setSubmitting(true);
        setError(null);
        try {
            const res = await fetch('/api/posts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newPost),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to submit post');

            setNewPost({ title: '', content: '', scriptureRef: '' });
            setSuccessMessage(
                data.post?.status === 'PENDING'
                    ? 'Post submitted for moderation. It will appear after approval.'
                    : 'Post published successfully.',
            );
            window.setTimeout(() => setSuccessMessage(null), 5000);
            await fetchPosts();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    const sharePost = async (post: CommunityPost) => {
        setSharingId(post.id);
        const shareData = {
            title: post.title,
            text: post.scriptureRef ? `${post.title} — ${post.scriptureRef}` : post.title,
            url: `${window.location.origin}/community-wall#post-${post.id}`,
        };
        try {
            if (navigator.share) {
                await navigator.share(shareData);
            } else if (navigator.clipboard) {
                await navigator.clipboard.writeText(shareData.url);
                setSuccessMessage('Post link copied.');
                window.setTimeout(() => setSuccessMessage(null), 3000);
            }
        } catch {
            // Native share can be cancelled by the user; no error state is needed.
        } finally {
            setSharingId(null);
        }
    };

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-cream-50">
                <div className="h-12 w-12 animate-spin rounded-full border-4 border-sage-500 border-t-transparent" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-cream-50 pb-24 pt-24">
            <div className="mx-auto max-w-6xl px-4 sm:px-6">
                <header className="mb-10 grid gap-6 lg:grid-cols-[1fr_0.65fr] lg:items-end">
                    <div>
                        <div className="inline-flex items-center rounded-full border border-sage-200 bg-white px-4 py-2 text-sm font-semibold text-sage-700 shadow-sm">
                            <Sparkles className="mr-2 h-4 w-4" /> Moderated fellowship space
                        </div>
                        <motion.h1 initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} className="mt-5 text-4xl font-light tracking-tight text-stone-800 md:text-6xl">
                            Community Wall
                        </motion.h1>
                        <p className="mt-4 max-w-2xl text-base leading-7 text-stone-600 sm:text-lg">Share testimonies, encouragement, prayerful reflections, and Scripture references while keeping moderation, safety, and human discernment visible.</p>
                    </div>
                    <div className="grid grid-cols-3 gap-2 rounded-3xl border border-stone-200 bg-white p-3 shadow-sm">
                        <div className="rounded-2xl bg-sage-50 p-3 text-center"><p className="text-xl font-semibold text-sage-700">{posts.length}</p><p className="text-[10px] uppercase tracking-wide text-stone-500">Posts</p></div>
                        <div className="rounded-2xl bg-stone-50 p-3 text-center"><p className="text-xl font-semibold text-stone-800">{posts.filter((post) => post.scriptureRef).length}</p><p className="text-[10px] uppercase tracking-wide text-stone-500">Scripture</p></div>
                        <div className="rounded-2xl bg-stone-50 p-3 text-center"><Shield className="mx-auto h-5 w-5 text-sage-600" /><p className="mt-1 text-[10px] uppercase tracking-wide text-stone-500">Moderated</p></div>
                    </div>
                </header>

                <section className="mb-8 grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
                    <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="sanctuary-card border border-sage-100">
                        <div className="mb-5 flex items-start justify-between gap-4">
                            <div>
                                <p className="text-xs font-bold uppercase tracking-[0.22em] text-sage-600">Create</p>
                                <h2 className="mt-1 flex items-center text-xl font-light text-stone-800"><MessageSquare className="mr-2 text-sage-500" size={20} /> Share something meaningful</h2>
                            </div>
                            <Shield className="h-5 w-5 text-sage-500" />
                        </div>
                        <form onSubmit={handlePostSubmit} className="space-y-4">
                            <input type="text" placeholder="Title of your testimony or reflection" value={newPost.title} onChange={(e) => setNewPost({ ...newPost, title: e.target.value })} className="w-full rounded-xl border border-transparent bg-cream-100 px-4 py-3 outline-none transition-all focus:border-sage-200 focus:ring-2 focus:ring-sage-100" required maxLength={160} />
                            <textarea placeholder="What would you like to share with the community?" value={newPost.content} onChange={(e) => setNewPost({ ...newPost, content: e.target.value })} rows={5} className="w-full resize-none rounded-xl border border-transparent bg-cream-100 px-4 py-3 outline-none transition-all focus:border-sage-200 focus:ring-2 focus:ring-sage-100" required maxLength={5000} />
                            <div className="rounded-xl border border-stone-200 bg-white p-3">
                                <label className="mb-2 flex items-center text-xs font-semibold uppercase tracking-wide text-stone-500"><BookOpen className="mr-2 h-4 w-4" /> Scripture reference</label>
                                <input type="text" placeholder="e.g. Psalm 23:1-4 (optional)" value={newPost.scriptureRef} onChange={(e) => setNewPost({ ...newPost, scriptureRef: e.target.value })} className="w-full bg-transparent text-sm text-stone-700 outline-none" maxLength={120} />
                                <p className="mt-2 text-[11px] leading-4 text-stone-500">Enter a reference, not a fabricated translation quote. Readers can open Scripture study for translation-aware reading.</p>
                            </div>
                            <button type="submit" disabled={submitting} className="inline-flex min-h-12 w-full items-center justify-center rounded-xl bg-sage-600 px-8 py-3 font-semibold text-white transition hover:bg-sage-700 disabled:opacity-50">
                                {submitting ? 'Submitting…' : <>Submit post <Send size={18} className="ml-2" /></>}
                            </button>
                            <p className="text-xs leading-5 text-stone-500">Posts may be held for human moderation. Do not publish private pastoral cases, medical details, financial account data, or another person’s confidential information.</p>
                        </form>
                    </motion.div>

                    <div className="rounded-[2rem] border border-stone-200 bg-white p-5 shadow-sm sm:p-6">
                        <div className="flex items-center gap-3"><SlidersHorizontal className="h-5 w-5 text-sage-600" /><div><p className="text-xs font-bold uppercase tracking-[0.22em] text-sage-600">Discover</p><h2 className="text-xl font-light text-stone-800">Find the right conversation</h2></div></div>
                        <div className="mt-5 relative">
                            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
                            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search testimonies, people, topics, Scripture…" className="min-h-12 w-full rounded-2xl border border-stone-200 bg-stone-50 pl-11 pr-4 text-sm outline-none focus:border-sage-300 focus:ring-2 focus:ring-sage-100" />
                        </div>
                        <div className="mt-4 grid grid-cols-3 gap-2">
                            {([['all', 'All'], ['scripture', 'Scripture'], ['recent', 'This week']] as [FeedMode, string][]).map(([mode, label]) => (
                                <button key={mode} onClick={() => setFeedMode(mode)} className={`min-h-11 rounded-xl border px-3 text-xs font-semibold transition ${feedMode === mode ? 'border-sage-300 bg-sage-50 text-sage-800' : 'border-stone-200 bg-white text-stone-600 hover:border-sage-200'}`}>{label}</button>
                            ))}
                        </div>
                        <div className="mt-5 rounded-2xl bg-sage-50 p-4">
                            <p className="text-sm font-semibold text-sage-800">Community intelligence without pretending to be pastoral authority</p>
                            <p className="mt-2 text-xs leading-5 text-sage-800/80">Search and filters help people discover relevant posts. Moderation status remains explicit, and sensitive care needs should move to prayer or pastoral-care pathways instead of being handled publicly.</p>
                            <div className="mt-3 flex flex-wrap gap-2 text-xs font-semibold text-sage-700"><a href="/prayer-room" className="rounded-full bg-white px-3 py-1.5">Prayer Room</a><a href="/care" className="rounded-full bg-white px-3 py-1.5">Pastoral Care</a><a href="/scripture" className="rounded-full bg-white px-3 py-1.5">Scripture Study</a></div>
                        </div>
                    </div>
                </section>

                {error && <div className="mb-6 flex items-start rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700"><AlertCircle size={16} className="mr-2 mt-0.5 shrink-0" />{error}</div>}
                {successMessage && <div className="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">{successMessage}</div>}

                <section>
                    <div className="mb-5 flex items-end justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[0.22em] text-sage-600">Community feed</p><h3 className="mt-1 text-2xl font-light text-stone-800">{filteredPosts.length} visible {filteredPosts.length === 1 ? 'post' : 'posts'}</h3></div></div>
                    {filteredPosts.length === 0 ? (
                        <div className="rounded-[2rem] border border-dashed border-stone-300 bg-white/70 p-10 text-center"><MessageSquare className="mx-auto h-7 w-7 text-stone-400" /><p className="mt-3 font-medium text-stone-700">No posts match this view.</p><p className="mt-1 text-sm text-stone-500">Try another search or feed filter.</p></div>
                    ) : (
                        <div className="space-y-6">
                            <AnimatePresence>
                                {filteredPosts.map((post, index) => (
                                    <motion.article id={`post-${post.id}`} key={post.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(index * 0.04, 0.2) }} className="sanctuary-card border-l-4 border-l-sage-400 transition-shadow hover:shadow-lg">
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex min-w-0 items-center space-x-3">
                                                <img src={post.user?.avatar || '/default-avatar.png'} alt="" className="h-10 w-10 rounded-full bg-sage-100 object-cover" />
                                                <div className="min-w-0"><p className="truncate font-medium text-stone-800">{post.user?.name || 'Community member'}</p><p className="text-xs text-stone-500">{new Date(post.createdAt).toLocaleDateString()}</p></div>
                                            </div>
                                            {post.status === 'APPROVED' && <span className="inline-flex items-center rounded-full bg-sage-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-sage-700"><Shield size={12} className="mr-1" /> Approved</span>}
                                        </div>
                                        <h4 className="mt-5 text-xl font-medium text-stone-800">{post.title}</h4>
                                        <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-stone-700 sm:text-base">{post.content}</p>
                                        {post.scriptureRef && <a href={`/scripture?ref=${encodeURIComponent(post.scriptureRef)}`} className="mt-4 flex items-center rounded-xl border border-sage-100 bg-sage-50 p-4 text-sm font-semibold text-sage-800 transition hover:border-sage-200"><BookOpen className="mr-2 h-4 w-4" />{post.scriptureRef}</a>}
                                        <div className="mt-5 flex flex-wrap items-center gap-3 border-t border-cream-100 pt-4 text-xs text-stone-500">
                                            <span className="inline-flex items-center rounded-full bg-stone-50 px-3 py-1.5"><Heart size={14} className="mr-1.5" />{post.likes || 0} reactions</span>
                                            <span className="inline-flex items-center rounded-full bg-stone-50 px-3 py-1.5"><MessageSquare size={14} className="mr-1.5" />{post._count?.comments || 0} comments</span>
                                            <button onClick={() => void sharePost(post)} disabled={sharingId === post.id} className="inline-flex items-center rounded-full border border-stone-200 bg-white px-3 py-1.5 font-semibold text-stone-600 transition hover:border-sage-300 hover:text-sage-700 disabled:opacity-50"><Share2 size={14} className="mr-1.5" />Share</button>
                                            <span className="ml-auto inline-flex items-center text-[11px] text-stone-400"><Flag size={12} className="mr-1" /> Report/moderation controls belong to the governed community workflow</span>
                                        </div>
                                    </motion.article>
                                ))}
                            </AnimatePresence>
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
}