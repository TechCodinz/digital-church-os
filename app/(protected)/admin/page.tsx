'use client';

import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Calendar, Users, DollarSign, MessageSquare } from 'lucide-react';
import { useState, useEffect } from 'react';
import { LeaderAttentionPanel } from '@/components/admin/LeaderAttentionPanel';

export default function AdminDashboard() {
    const { data: session, status } = useSession();
    const [stats, setStats] = useState({
        totalUsers: 0,
        pendingPosts: 0,
        totalOfferings: 0,
        upcomingEvents: 0,
    });
    const [recentActivity, setRecentActivity] = useState<{ icon: string; text: string; time: string }[]>([]);

    useEffect(() => {
        if (session?.user?.role !== 'CHURCH_ADMIN') {
            redirect('/');
        }

        const fetchStats = async () => {
            try {
                const response = await fetch('/api/admin/analytics');
                const data = await response.json();
                if (data.summary) {
                    setStats({
                        totalUsers: data.summary.totalUsers || 0,
                        pendingPosts: data.summary.pendingPosts || 0,
                        totalOfferings: data.summary.offeringAmount || 0,
                        upcomingEvents: data.trends?.upcomingEvents || 0,
                    });
                }
                if (data.recentActivity) {
                    setRecentActivity(data.recentActivity);
                }
            } catch (error) {
                console.error('Error fetching stats:', error);
            }
        };

        if (session?.user?.role === 'CHURCH_ADMIN') {
            fetchStats();
        }
    }, [session]);

    if (status === 'loading') {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-sage-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (!session || session.user?.role !== 'CHURCH_ADMIN') {
        return null;
    }

    return (
        <div className="min-h-screen pt-20 bg-cream-50">
            <div className="max-w-7xl mx-auto px-4 py-8">
                <div className="mb-8">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sage-700">Leadership command center</p>
                    <h1 className="mt-2 text-3xl font-light text-stone-800">Admin Dashboard</h1>
                    <p className="mt-2 max-w-2xl text-sm leading-6 text-stone-500">Care for people, keep ministry operations healthy, and move from insight to action without losing human oversight.</p>
                </div>

                <LeaderAttentionPanel />

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="sanctuary-card">
                        <Users className="w-8 h-8 text-sage-500 mb-2" />
                        <p className="text-2xl font-light text-stone-800">{stats.totalUsers}</p>
                        <p className="text-stone-500">Total Members</p>
                    </motion.div>

                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="sanctuary-card">
                        <MessageSquare className="w-8 h-8 text-amber-500 mb-2" />
                        <p className="text-2xl font-light text-stone-800">{stats.pendingPosts}</p>
                        <p className="text-stone-500">Pending Posts</p>
                    </motion.div>

                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="sanctuary-card">
                        <DollarSign className="w-8 h-8 text-emerald-500 mb-2" />
                        <p className="text-2xl font-light text-stone-800">${stats.totalOfferings?.toLocaleString() || 0}</p>
                        <p className="text-stone-500">Total Offerings</p>
                    </motion.div>

                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="sanctuary-card">
                        <Calendar className="w-8 h-8 text-blue-500 mb-2" />
                        <p className="text-2xl font-light text-stone-800">{stats.upcomingEvents}</p>
                        <p className="text-stone-500">Upcoming Events</p>
                    </motion.div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="sanctuary-card">
                        <h2 className="text-xl font-light text-stone-800 mb-4">Quick Actions</h2>
                        <div className="space-y-3">
                            <Link href="/admin/events" className="block w-full p-3 text-left bg-cream-100 rounded-xl hover:bg-cream-200 transition-colors">Create New Event</Link>
                            <Link href="/admin/posts" className="block w-full p-3 text-left bg-cream-100 rounded-xl hover:bg-cream-200 transition-colors">Review Pending Posts</Link>
                            <Link href="/admin/aid-requests" className="block w-full p-3 text-left bg-cream-100 rounded-xl hover:bg-cream-200 transition-colors">Allocate Funds</Link>
                            <Link href="/admin/analytics" className="block w-full p-3 text-left bg-cream-100 rounded-xl hover:bg-cream-200 transition-colors">View Analytics</Link>
                            <Link href="/release-readiness" className="block w-full p-3 text-left bg-stone-900 text-white rounded-xl hover:bg-stone-800 transition-colors">Run Release Readiness</Link>
                        </div>
                    </div>

                    <div className="sanctuary-card">
                        <h2 className="text-xl font-light text-stone-800 mb-4">Recent Activity</h2>
                        <div className="space-y-4">
                            {recentActivity.length > 0 ? recentActivity.map((item, i) => (
                                <div key={i} className="flex items-start space-x-3">
                                    <div className="w-5 h-5 mt-1 text-sage-500">
                                        {item.icon === 'user' ? <Users className="w-5 h-5 text-blue-500" /> : item.icon === 'post' ? <MessageSquare className="w-5 h-5 text-amber-500" /> : <DollarSign className="w-5 h-5 text-emerald-500" />}
                                    </div>
                                    <div>
                                        <p className="text-stone-800">{item.text}</p>
                                        <p className="text-sm text-stone-500">{item.time}</p>
                                    </div>
                                </div>
                            )) : (
                                <p className="text-stone-400 italic text-sm">No recent activity found.</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
