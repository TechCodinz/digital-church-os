'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  AlertCircle,
  BookOpen,
  Flag,
  Heart,
  HeartHandshake,
  MessageSquare,
  Search,
  Send,
  Share2,
  Shield,
  Sparkles,
  Users,
} from 'lucide-react';
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

  const fetchPosts = async () => {
    try {
      const response = await fetch('/api/posts', { cache: 'no-store' });
      if (!response.ok) throw new Error('Community feed unavailable');
      const data = await response.json();
      setPosts(Array.isArray(data.posts) ? data.posts : []);
    } catch (fetchError) {
      console.error('Error fetching posts:', fetchError);
      setError('The community feed could not be refreshed right now.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchPosts();
  }, []);

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

  const handlePostSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!session?.user) {
      setError('Please sign in to post.');
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
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || 'Failed to submit post');

      setNewPost({ title: '', content: '', scriptureRef: '' });
      setSuccessMessage(
        data.post?.status === 'PENDING'
          ? 'Your post is recorded for human moderation. It will appear only after approval.'
          : 'Your post is now visible in the community.',
      );
      window.setTimeout(() => setSuccessMessage(null), 5000);
      await fetchPosts();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'An error occurred. Please try again.');
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
      // Native sharing can be cancelled without turning it into an application error.
    } finally {
      setSharingId(null);
    }
  };

  return (
    <div className="sanctuary-page-shell min-h-screen bg-[#06110f] pb-20 pt-20 text-white sm:pt-24">
      <section className="sanctuary-cinematic-hero relative overflow-hidden px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
        <div className="sanctuary-light-column" />
        <div className="sanctuary-nave" />
        <div className="sanctuary-vignette" />
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-10 lg:grid-cols-[1fr_0.7fr] lg:items-end">
            <div className="relative z-10 max-w-4xl">
              <div className="inline-flex items-center rounded-full border border-emerald-200/20 bg-white/5 px-4 py-2 text-sm font-medium text-emerald-100 backdrop-blur-xl">
                <Users className="mr-2 h-4 w-4" /> Moderated fellowship
              </div>
              <h1 className="mt-6 text-4xl font-light leading-[1.04] text-white md:text-7xl">A community wall that feels like fellowship, not a noisy social feed.</h1>
              <p className="mt-6 max-w-3xl text-base leading-8 text-white/58 sm:text-lg">Share testimony, encouragement, reflection, and Scripture references. Discovery can be intelligent; spiritual authority and moderation still belong to people.</p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link href="/prayer-room" className="sacred-primary-button"><HeartHandshake className="h-4 w-4" /> Enter Prayer Room</Link>
                <Link href="/care" className="sacred-secondary-button"><Heart className="h-4 w-4" /> Private human care</Link>
              </div>
            </div>

            <div className="sacred-panel-dark relative z-10 p-6">
              <p className="sanctuary-section-label text-amber-100/60">Community truth</p>
              <div className="mt-5 grid grid-cols-3 gap-3">
                <div className="rounded-2xl border border-white/8 bg-white/[0.035] p-4 text-center"><p className="text-2xl font-semibold text-white">{posts.length}</p><p className="mt-1 text-[10px] uppercase tracking-wide text-white/35">Loaded posts</p></div>
                <div className="rounded-2xl border border-white/8 bg-white/[0.035] p-4 text-center"><p className="text-2xl font-semibold text-amber-100">{posts.filter((post) => post.scriptureRef).length}</p><p className="mt-1 text-[10px] uppercase tracking-wide text-white/35">With Scripture</p></div>
                <div className="rounded-2xl border border-white/8 bg-white/[0.035] p-4 text-center"><Shield className="mx-auto h-5 w-5 text-emerald-200" /><p className="mt-2 text-[10px] uppercase tracking-wide text-white/35">Approved feed</p></div>
              </div>
              <p className="mt-5 text-xs leading-6 text-white/45">If automated review is unavailable or wants to change someone’s words, the post is held for human moderation rather than silently rewritten or auto-published.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#f7f5ef] px-4 py-14 text-stone-900 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-7 lg:grid-cols-[0.9fr_1.1fr]">
            <div className="rounded-[2rem] border border-stone-200 bg-white p-6 shadow-xl sm:p-8">
              <p className="sanctuary-section-label text-emerald-700">Share with the community</p>
              <h2 className="mt-2 text-3xl font-light text-stone-800">Say what is yours to share</h2>
              <p className="mt-3 text-sm leading-7 text-stone-600">Do not publish another person’s private pastoral situation, medical details, account information, or confidential family information.</p>

              {session?.user ? (
                <form onSubmit={handlePostSubmit} className="mt-6 space-y-4">
                  <div>
                    <label className="mb-2 block text-xs font-bold uppercase tracking-[0.15em] text-stone-500">Title</label>
                    <input type="text" placeholder="A testimony, reflection, or encouragement" value={newPost.title} onChange={(event) => setNewPost({ ...newPost, title: event.target.value })} className="soft-input" required maxLength={160} />
                    <p className="mt-1 text-right text-[10px] text-stone-400">{newPost.title.length}/160</p>
                  </div>
                  <div>
                    <label className="mb-2 block text-xs font-bold uppercase tracking-[0.15em] text-stone-500">Your words</label>
                    <textarea placeholder="What would you like the community to receive from you?" value={newPost.content} onChange={(event) => setNewPost({ ...newPost, content: event.target.value })} rows={6} className="soft-input resize-none" required maxLength={5000} />
                    <p className="mt-1 text-right text-[10px] text-stone-400">{newPost.content.length}/5000</p>
                  </div>
                  <div className="rounded-2xl border border-stone-200 bg-stone-50 p-4">
                    <label className="flex items-center text-xs font-bold uppercase tracking-[0.15em] text-stone-500"><BookOpen className="mr-2 h-4 w-4" /> Scripture reference <span className="ml-2 font-normal normal-case tracking-normal">optional</span></label>
                    <input type="text" placeholder="e.g. Psalm 23:1-4" value={newPost.scriptureRef} onChange={(event) => setNewPost({ ...newPost, scriptureRef: event.target.value })} className="mt-3 w-full bg-transparent text-sm text-stone-700 outline-none" maxLength={120} />
                    <p className="mt-2 text-[11px] leading-5 text-stone-500">Use a reference rather than pasting an uncertain translation. Readers can open it in Scripture study.</p>
                  </div>
                  <button type="submit" disabled={submitting || newPost.title.trim().length < 3 || newPost.content.trim().length < 10} className="inline-flex min-h-13 w-full items-center justify-center rounded-2xl bg-stone-900 px-5 py-4 text-sm font-bold text-white transition hover:bg-stone-800 disabled:opacity-50">
                    {submitting ? 'Submitting for review…' : <>Share with community <Send className="ml-2 h-4 w-4" /></>}
                  </button>
                </form>
              ) : (
                <div className="mt-6 rounded-2xl border border-stone-200 bg-stone-50 p-6 text-center">
                  <Shield className="mx-auto h-6 w-6 text-stone-400" />
                  <p className="mt-3 text-sm font-semibold text-stone-800">Sign in before sharing</p>
                  <p className="mt-2 text-xs leading-5 text-stone-500">Reading approved community posts is public; publishing is attached to an authenticated member account.</p>
                  <Link href="/auth/signin" className="mt-4 inline-flex rounded-full bg-stone-900 px-5 py-2.5 text-xs font-semibold text-white">Sign in</Link>
                </div>
              )}
            </div>

            <div className="rounded-[2rem] border border-stone-200 bg-white p-6 shadow-sm sm:p-8">
              <p className="sanctuary-section-label text-emerald-700">Discover fellowship</p>
              <h2 className="mt-2 text-3xl font-light text-stone-800">Find a conversation worth entering</h2>
              <div className="relative mt-6">
                <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
                <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search people, testimonies, topics, Scripture…" className="min-h-12 w-full rounded-2xl border border-stone-200 bg-stone-50 pl-11 pr-4 text-sm outline-none focus:border-emerald-300 focus:ring-2 focus:ring-emerald-100" />
              </div>
              <div className="mt-4 grid grid-cols-3 gap-2">
                {([['all', 'All'], ['scripture', 'Scripture'], ['recent', 'This week']] as [FeedMode, string][]).map(([mode, label]) => (
                  <button key={mode} type="button" onClick={() => setFeedMode(mode)} className={`min-h-11 rounded-xl border px-3 text-xs font-semibold transition ${feedMode === mode ? 'border-emerald-300 bg-emerald-50 text-emerald-800' : 'border-stone-200 bg-white text-stone-600 hover:border-emerald-200'}`}>{label}</button>
                ))}
              </div>

              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                <Link href="/prayer-room" className="rounded-2xl border border-stone-200 bg-stone-50 p-4 text-sm font-semibold text-stone-700 hover:border-emerald-200"><HeartHandshake className="h-4 w-4 text-emerald-600" /><span className="mt-3 block">Prayer Room</span></Link>
                <Link href="/care" className="rounded-2xl border border-stone-200 bg-stone-50 p-4 text-sm font-semibold text-stone-700 hover:border-emerald-200"><Heart className="h-4 w-4 text-rose-500" /><span className="mt-3 block">Private Care</span></Link>
                <Link href="/scripture" className="rounded-2xl border border-stone-200 bg-stone-50 p-4 text-sm font-semibold text-stone-700 hover:border-emerald-200"><BookOpen className="h-4 w-4 text-amber-600" /><span className="mt-3 block">Scripture</span></Link>
              </div>

              <div className="mt-6 rounded-2xl bg-emerald-50 p-5">
                <p className="flex items-center text-sm font-semibold text-emerald-900"><Sparkles className="mr-2 h-4 w-4" /> Quiet intelligence, visible governance</p>
                <p className="mt-2 text-xs leading-6 text-emerald-900/75">Search and filters help discovery. Automated review never gives AI pastoral authority, and it cannot silently rewrite a member’s testimony.</p>
              </div>
            </div>
          </div>

          {error && <div className="mt-6 flex items-start rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700"><AlertCircle className="mr-2 mt-0.5 h-4 w-4 shrink-0" />{error}</div>}
          {successMessage && <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">{successMessage}</div>}

          <section className="mt-12">
            <div className="mb-6 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
              <div>
                <p className="sanctuary-section-label text-emerald-700">Approved community feed</p>
                <h2 className="mt-2 text-3xl font-light text-stone-800">{loading ? 'Gathering conversations…' : `${filteredPosts.length} visible ${filteredPosts.length === 1 ? 'post' : 'posts'}`}</h2>
              </div>
              <p className="max-w-xl text-xs leading-5 text-stone-500">Only posts returned by the approved-post API appear here. Counts are drawn from the loaded feed, not invented activity.</p>
            </div>

            {loading ? (
              <div className="rounded-[2rem] border border-stone-200 bg-white p-12 text-center"><div className="mx-auto h-9 w-9 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent" /><p className="mt-4 text-sm text-stone-500">Loading approved community posts…</p></div>
            ) : filteredPosts.length === 0 ? (
              <div className="rounded-[2rem] border border-dashed border-stone-300 bg-white/75 p-12 text-center"><MessageSquare className="mx-auto h-7 w-7 text-stone-400" /><p className="mt-3 font-medium text-stone-700">No posts match this view.</p><p className="mt-1 text-sm text-stone-500">Try another search or feed filter.</p></div>
            ) : (
              <div className="grid gap-5 lg:grid-cols-2">
                <AnimatePresence>
                  {filteredPosts.map((post, index) => (
                    <motion.article id={`post-${post.id}`} key={post.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(index * 0.035, 0.2) }} className="rounded-[2rem] border border-stone-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg sm:p-7">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex min-w-0 items-center gap-3">
                          <img src={post.user?.avatar || '/default-avatar.png'} alt="" className="h-10 w-10 rounded-full bg-emerald-50 object-cover" />
                          <div className="min-w-0"><p className="truncate font-medium text-stone-800">{post.user?.name || 'Community member'}</p><p className="text-xs text-stone-500">{new Date(post.createdAt).toLocaleDateString()}</p></div>
                        </div>
                        <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-emerald-700"><Shield className="mr-1 h-3 w-3" /> Approved</span>
                      </div>

                      <h3 className="mt-5 text-xl font-semibold text-stone-800">{post.title}</h3>
                      <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-stone-700">{post.content}</p>
                      {post.scriptureRef && <Link href={`/scripture?ref=${encodeURIComponent(post.scriptureRef)}`} className="mt-5 flex items-center rounded-2xl border border-emerald-100 bg-emerald-50 p-4 text-sm font-semibold text-emerald-800 transition hover:border-emerald-200"><BookOpen className="mr-2 h-4 w-4" />{post.scriptureRef}</Link>}

                      <div className="mt-6 flex flex-wrap items-center gap-2 border-t border-stone-100 pt-4 text-xs text-stone-500">
                        <span className="inline-flex items-center rounded-full bg-stone-50 px-3 py-1.5"><Heart className="mr-1.5 h-3.5 w-3.5" />{post.likes || 0} reactions</span>
                        <span className="inline-flex items-center rounded-full bg-stone-50 px-3 py-1.5"><MessageSquare className="mr-1.5 h-3.5 w-3.5" />{post._count?.comments || 0} comments</span>
                        <button type="button" onClick={() => void sharePost(post)} disabled={sharingId === post.id} className="inline-flex items-center rounded-full border border-stone-200 bg-white px-3 py-1.5 font-semibold text-stone-600 transition hover:border-emerald-300 hover:text-emerald-700 disabled:opacity-50"><Share2 className="mr-1.5 h-3.5 w-3.5" />Share</button>
                        <span className="ml-auto inline-flex items-center text-[10px] text-stone-400"><Flag className="mr-1 h-3 w-3" /> Governed moderation</span>
                      </div>
                    </motion.article>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </section>
        </div>
      </section>
    </div>
  );
}
