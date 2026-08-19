'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Heart, Shield, Search, Filter, Send, AlertCircle } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { ShareButton } from '@/components/sharing/ShareButton';
import { ScriptureText } from '@/components/scripture/ScriptureReference';

export default function CommunityWallPage() {
    const { data: session } = useSession();
    const [posts, setPosts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [newPost, setNewPost] = useState({ title: '', content: '', scriptureRef: '' });
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [likes, setLikes] = useState<Record<string, number>>({});
    const [liked, setLiked] = useState<Record<string, boolean>>({});

    const handleLike = async (post: any) => {
        if (liked[post.id]) return;
        setLiked((l) => ({ ...l, [post.id]: true }));
        setLikes((c) => ({ ...c, [post.id]: (c[post.id] ?? post.likes ?? 0) + 1 }));
        try {
            const res = await fetch(`/api/posts/${post.id}/like`, { method: 'POST' });
            const data = await res.json();
            if (typeof data.likes === 'number') setLikes((c) => ({ ...c, [post.id]: data.likes }));
        } catch (err) {
            console.error('Like failed:', err);
        }
    };

    useEffect(() => {
        fetchPosts();
    }, []);

    const fetchPosts = async () => {
        try {
            const res = await fetch('/api/posts');
            const data = await res.json();
            setPosts(data.posts || []);
        } catch (err) {
            console.error('Error fetching posts:', err);
        } finally {
            setLoading(false);
        }
    };

    const handlePostSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!session) {
            setError('Please sign in to post');
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
            if (res.ok) {
                if (data.post.status === 'APPROVED') {
                    setPosts([data.post, ...posts]);
                }
                setNewPost({ title: '', content: '', scriptureRef: '' });
                setSuccessMessage(
                    data.post.status === 'PENDING'
                        ? '✓ Post submitted for moderation. It will appear once approved.'
                        : '✓ Post published successfully!'
                );
                setTimeout(() => setSuccessMessage(null), 5000);
                fetchPosts();
            } else {
                setError(data.error || 'Failed to submit post');
            }
        } catch (err) {
            setError('An error occurred. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-cream-50">
                <div className="w-12 h-12 border-4 border-sage-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen pt-24 pb-12 bg-cream-50">
            <div className="max-w-4xl mx-auto px-4">
                {/* Header */}
                <header className="mb-12 text-center">
                    <motion.h1
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-4xl md:text-5xl font-light text-stone-800 mb-4"
                    >
                        Community Wall
                    </motion.h1>
                    <p className="text-stone-600 text-lg">Share testimonies, encouragement, and the word of God.</p>
                </header>

                {/* Create Post Section */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="sanctuary-card mb-12 border border-sage-100"
                >
                    <h2 className="text-xl font-light text-stone-800 mb-6 flex items-center">
                        <MessageSquare className="mr-2 text-sage-500" size={20} />
                        Share Something
                    </h2>
                    <form onSubmit={handlePostSubmit} className="space-y-4">
                        <input
                            type="text"
                            placeholder="Title of your testimony or thought"
                            value={newPost.title}
                            onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                            className="w-full px-4 py-3 bg-cream-100 border-transparent rounded-xl focus:ring-2 focus:ring-sage-200 outline-none transition-all"
                            required
                        />
                        <textarea
                            placeholder="What's on your heart?"
                            value={newPost.content}
                            onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                            rows={4}
                            className="w-full px-4 py-3 bg-cream-100 border-transparent rounded-xl focus:ring-2 focus:ring-sage-200 outline-none transition-all resize-none"
                            required
                        />
                        <div className="flex flex-col sm:flex-row gap-4 items-center">
                            <input
                                type="text"
                                placeholder="Scripture Reference (optional)"
                                value={newPost.scriptureRef}
                                onChange={(e) => setNewPost({ ...newPost, scriptureRef: e.target.value })}
                                className="w-full sm:flex-1 px-4 py-3 bg-cream-100 border-transparent rounded-xl focus:ring-2 focus:ring-sage-200 outline-none transition-all"
                            />
                            <button
                                type="submit"
                                disabled={submitting}
                                className="w-full sm:w-auto px-8 py-3 bg-sage-500 text-white rounded-xl hover:bg-sage-600 transition-all flex items-center justify-center disabled:opacity-50"
                            >
                                {submitting ? 'Moderating...' : (
                                    <>
                                        Post <Send size={18} className="ml-2" />
                                    </>
                                )}
                            </button>
                        </div>
                        {error && (
                            <p className="text-rose-500 text-sm flex items-center">
                                <AlertCircle size={14} className="mr-1" /> {error}
                            </p>
                        )}
                        {successMessage && (
                            <p className="text-emerald-600 text-sm flex items-center bg-emerald-50 px-4 py-3 rounded-xl">
                                <span className="mr-2">✓</span> {successMessage}
                            </p>
                        )}
                    </form>
                </motion.div>

                {/* Posts Feed */}
                <div className="space-y-8">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-2xl font-light text-stone-800">Recent Testimonies</h3>
                        <div className="flex items-center space-x-2 text-stone-500">
                            <Search size={18} />
                            <Filter size={18} />
                        </div>
                    </div>

                    <AnimatePresence>
                        {posts.map((post, index) => (
                            <motion.article
                                key={post.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="sanctuary-card hover:shadow-lg transition-shadow border-l-4 border-l-sage-400"
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center space-x-3">
                                        <img
                                            src={post.user?.avatar || '/default-avatar.png'}
                                            alt={post.user?.name || 'Anonymous'}
                                            className="w-10 h-10 rounded-full bg-sage-100"
                                        />
                                        <div>
                                            <p className="font-medium text-stone-800">{post.user?.name || 'Anonymous'}</p>
                                            <p className="text-xs text-stone-500">
                                                {new Date(post.createdAt).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                    {post.status === 'APPROVED' && (
                                        <Shield size={16} className="text-sage-400" />
                                    )}
                                </div>

                                <h4 className="text-xl font-medium text-stone-800 mb-3">{post.title}</h4>
                                <p className="text-stone-700 leading-relaxed mb-4 whitespace-pre-wrap">
                                    {post.content}
                                </p>

                                {post.scriptureRef && (
                                    <div className="bg-sage-50 p-4 rounded-xl border border-sage-100 mb-4 italic text-sage-800">
                                        "<ScriptureText text={post.scriptureRef} />"
                                    </div>
                                )}

                                <div className="flex items-center space-x-6 pt-4 border-t border-cream-100">
                                    <button
                                        onClick={() => handleLike(post)}
                                        className={`flex items-center space-x-2 transition-colors ${liked[post.id] ? 'text-rose-500' : 'text-stone-500 hover:text-rose-500'}`}
                                    >
                                        <Heart size={18} className={liked[post.id] ? 'fill-current' : ''} />
                                        <span>{likes[post.id] ?? post.likes ?? 0}</span>
                                    </button>
                                    <div className="flex items-center space-x-2 text-stone-500">
                                        <MessageSquare size={18} />
                                        <span>{post._count?.comments || 0}</span>
                                    </div>
                                    <ShareButton
                                        kind="verse"
                                        title={post.title}
                                        text={post.content}
                                        reference={post.scriptureRef}
                                        author={post.user?.name || 'A Member'}
                                        compact
                                        className="flex items-center space-x-2 text-stone-500 hover:text-blue-500 transition-colors"
                                    />
                                </div>
                            </motion.article>
                        ))}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}
