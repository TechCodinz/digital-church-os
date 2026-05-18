'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    CheckCircle,
    XCircle,
    Clock,
    MessageSquare,
    User,
    Trash2,
    Shield,
    Search,
    Filter,
    ArrowLeft
} from 'lucide-react';
import Link from 'next/link';

export default function AdminPostsPage() {
    const [posts, setPosts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('PENDING');
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchPosts();
    }, [statusFilter]);

    const fetchPosts = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/admin/posts?status=${statusFilter}`);
            const data = await res.json();
            setPosts(data);
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (postId: string, newStatus: string) => {
        try {
            const res = await fetch('/api/admin/posts', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ postId, status: newStatus })
            });
            if (res.ok) {
                setPosts(posts.filter(p => p.id !== postId));
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const handleDelete = async (postId: string) => {
        if (!confirm('Are you sure you want to permanently delete this post?')) return;
        try {
            const res = await fetch(`/api/admin/posts?postId=${postId}`, {
                method: 'DELETE'
            });
            if (res.ok) {
                setPosts(posts.filter(p => p.id !== postId));
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const filteredPosts = posts.filter(post =>
        post.content?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.user?.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="min-h-screen pt-24 pb-12 bg-cream-50">
            <div className="max-w-7xl mx-auto px-4">
                <header className="mb-12 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <Link href="/admin" className="text-sm text-stone-400 hover:text-sage-600 flex items-center mb-2 transition-colors">
                            <ArrowLeft size={14} className="mr-1" /> Back to Dashboard
                        </Link>
                        <h1 className="text-4xl font-light text-stone-800 tracking-tight">Community Moderation</h1>
                    </div>

                    <div className="flex bg-white p-1 rounded-2xl shadow-sm border border-stone-100">
                        {['PENDING', 'APPROVED', 'ALL'].map((status) => (
                            <button
                                key={status}
                                onClick={() => setStatusFilter(status)}
                                className={`px-6 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${statusFilter === status
                                        ? 'bg-amber-500 text-white shadow-md'
                                        : 'text-stone-400 hover:text-stone-600'
                                    }`}
                            >
                                {status}
                            </button>
                        ))}
                    </div>
                </header>

                <div className="relative mb-8">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-stone-400" size={20} />
                    <input
                        type="text"
                        placeholder="Search posts or authors..."
                        className="w-full bg-white border-none rounded-2xl pl-16 pr-6 py-5 shadow-sm focus:ring-2 focus:ring-sage-200 outline-none transition-all"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="space-y-6">
                    {loading ? (
                        <div className="text-center py-20 text-stone-400 italic">Reviewing records...</div>
                    ) : filteredPosts.length === 0 ? (
                        <div className="text-center py-20 bg-white rounded-3xl border border-stone-100 italic text-stone-400">
                            No posts found matching your criteria.
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-6">
                            {filteredPosts.map((post) => (
                                <motion.div
                                    key={post.id}
                                    layout
                                    className="sanctuary-card flex flex-col md:flex-row gap-8 items-start hover:shadow-xl transition-shadow"
                                >
                                    <div className="flex-grow">
                                        <div className="flex items-center space-x-4 mb-4">
                                            <div className="w-10 h-10 bg-cream-50 rounded-full flex items-center justify-center border border-stone-100 overflow-hidden">
                                                {post.user?.image ? (
                                                    <img src={post.user.image} alt="" className="w-full h-full object-cover" />
                                                ) : (
                                                    <User size={20} className="text-stone-300" />
                                                )}
                                            </div>
                                            <div>
                                                <p className="font-medium text-stone-800">{post.user?.name || 'Anonymous'}</p>
                                                <p className="text-xs text-stone-400 flex items-center">
                                                    <Clock size={12} className="mr-1" />
                                                    {new Date(post.createdAt).toLocaleString()}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="bg-cream-50/50 p-6 rounded-2xl border border-stone-100">
                                            <p className="text-stone-700 leading-relaxed italic">"{post.content}"</p>
                                            {post.scriptureRef && (
                                                <p className="mt-4 text-xs font-bold text-sage-600 uppercase tracking-widest flex items-center">
                                                    <Shield size={12} className="mr-1" /> {post.scriptureRef}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex md:flex-col gap-3 w-full md:w-auto md:min-w-[160px]">
                                        {post.status === 'PENDING' && (
                                            <button
                                                onClick={() => handleStatusUpdate(post.id, 'APPROVED')}
                                                className="flex-1 bg-emerald-600 text-white py-3 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-100 flex items-center justify-center gap-2"
                                            >
                                                <CheckCircle size={14} /> Approve
                                            </button>
                                        )}
                                        <button
                                            onClick={() => handleDelete(post.id)}
                                            className="flex-1 bg-white text-stone-500 py-3 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-rose-50 hover:text-rose-600 border border-stone-100 hover:border-rose-200 transition-all flex items-center justify-center gap-2"
                                        >
                                            <Trash2 size={14} /> Delete
                                        </button>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
