'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Heart, Users, User, HandHeart } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
    { name: 'Home', href: '/dashboard', icon: Home },
    { name: 'Pray', href: '/prayer-room', icon: Heart },
    { name: 'Give', href: '/offering', icon: HandHeart },
    { name: 'Community', href: '/community-wall', icon: Users },
    { name: 'Profile', href: '/profile', icon: User },
];

export const MobileBottomNav = () => {
    const pathname = usePathname();

    const isRouteActive = (href: string) => {
        if (href === '/dashboard' && pathname === '/') return true;
        return pathname === href || pathname.startsWith(`${href}/`);
    };

    return (
        <nav aria-label="Primary mobile ministry navigation" className="fixed bottom-0 left-0 right-0 z-50 border-t border-stone-200 bg-white/95 shadow-[0_-8px_30px_rgba(28,25,23,0.06)] backdrop-blur-xl md:hidden pb-safe">
            <div className="mx-auto grid h-16 max-w-xl grid-cols-5 px-1">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = isRouteActive(item.href);

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            aria-current={isActive ? 'page' : undefined}
                            className={cn(
                                'group relative flex min-w-0 flex-col items-center justify-center gap-1 rounded-xl px-1 text-[10px] font-medium tracking-tight transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-sage-500',
                                isActive ? 'text-sage-700' : 'text-stone-500 hover:bg-sage-50/60 hover:text-sage-700',
                            )}
                        >
                            <span className={cn(
                                'absolute top-0 h-0.5 w-8 rounded-full bg-transparent transition',
                                isActive && 'bg-sage-600',
                            )} />
                            <span className={cn(
                                'flex h-8 w-8 items-center justify-center rounded-xl transition',
                                isActive ? 'bg-sage-50 text-sage-700' : 'text-stone-500 group-hover:bg-white',
                            )}>
                                <Icon size={20} className={cn('transition-transform', isActive && 'scale-105')} />
                            </span>
                            <span className="max-w-full truncate">{item.name}</span>
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
};
