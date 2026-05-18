'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import {
    Home, Heart, Calendar, Users, DollarSign, Music, Play,
    MessageSquare, BookOpen, Target, User, Shield, ChevronRight,
    Star, Baby, Zap
} from 'lucide-react';
import { motion } from 'framer-motion';

const navGroups = [
    {
        label: 'Home',
        items: [
            { href: '/dashboard', icon: Home, label: 'Dashboard' },
            { href: '/profile', icon: User, label: 'My Profile' },
        ],
    },
    {
        label: 'Worship',
        items: [
            { href: '/live-service', icon: Play, label: 'Live Service' },
            { href: '/choir', icon: Music, label: 'Worship Choir' },
            { href: '/conferences', icon: Calendar, label: 'Conferences' },
        ],
    },
    {
        label: 'Spirit',
        items: [
            { href: '/prayer-room', icon: Heart, label: 'Prayer Room' },
            { href: '/spiritual', icon: Star, label: 'Supernatural Centers' },
            { href: '/children', icon: Baby, label: "Children's Center" },
        ],
    },
    {
        label: 'Community',
        items: [
            { href: '/community-wall', icon: MessageSquare, label: 'Community Wall' },
            { href: '/journal', icon: BookOpen, label: 'My Journal' },
        ],
    },
    {
        label: 'Giving',
        items: [
            { href: '/offering', icon: DollarSign, label: 'Give Offering' },
            { href: '/aid-request', icon: Heart, label: 'Request Aid' },
            { href: '/transparency', icon: Shield, label: 'Transparency' },
        ],
    },
];

export function Sidebar() {
    const pathname = usePathname();
    const { data: session } = useSession();

    if (!session) return null;

    return (
        <aside className="hidden lg:flex flex-col w-64 min-h-screen bg-white border-r border-stone-100 pt-20 pb-8 fixed left-0 top-0 z-30">
            {/* User Info */}
            <div className="px-6 mb-8">
                <div className="flex items-center gap-3 p-3 bg-cream-50 rounded-2xl">
                    <img
                        src={session.user?.image || '/default-avatar.png'}
                        alt={session.user?.name || ''}
                        className="w-10 h-10 rounded-full border-2 border-sage-200 object-cover"
                    />
                    <div className="min-w-0">
                        <p className="font-medium text-stone-800 text-sm truncate">{session.user?.name}</p>
                        <p className="text-xs text-stone-400 truncate">{session.user?.email}</p>
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 overflow-y-auto">
                {navGroups.map((group) => (
                    <div key={group.label} className="mb-6">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-stone-400 px-3 mb-2">
                            {group.label}
                        </p>
                        <div className="space-y-1">
                            {group.items.map((item) => {
                                const active = pathname === item.href;
                                return (
                                    <Link key={item.href} href={item.href}>
                                        <motion.div
                                            whileHover={{ x: 2 }}
                                            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all ${active
                                                ? 'bg-sage-500 text-white font-medium shadow-sm'
                                                : 'text-stone-600 hover:bg-stone-50 hover:text-stone-800'
                                                }`}
                                        >
                                            <item.icon className="w-4 h-4 flex-shrink-0" />
                                            <span className="flex-1">{item.label}</span>
                                            {active && <ChevronRight className="w-3 h-3 opacity-70" />}
                                        </motion.div>
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                ))}

                {/* Admin link only for church admins */}
                {session.user?.role === 'CHURCH_ADMIN' && (
                    <div className="mb-6">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-stone-400 px-3 mb-2">Admin</p>
                        <Link href="/admin">
                            <motion.div whileHover={{ x: 2 }} className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all ${pathname.startsWith('/admin') ? 'bg-sage-500 text-white font-medium' : 'text-stone-600 hover:bg-stone-50'}`}>
                                <Shield className="w-4 h-4" />
                                <span>Admin Panel</span>
                            </motion.div>
                        </Link>
                    </div>
                )}
            </nav>

            {/* Bottom Quick Give */}
            <div className="px-4 mt-4">
                <Link href="/offering">
                    <div className="flex items-center gap-2 p-3 bg-emerald-500 text-white rounded-xl text-sm font-medium hover:bg-emerald-600 transition-colors">
                        <Zap className="w-4 h-4" />
                        Quick Giving
                    </div>
                </Link>
            </div>
        </aside>
    );
}
export default Sidebar;
