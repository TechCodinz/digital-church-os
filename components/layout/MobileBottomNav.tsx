'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Heart, Users, User, Hand } from 'lucide-react';
import { cn } from '@/lib/utils';

export const MobileBottomNav = () => {
    const pathname = usePathname();

    const navItems = [
        { name: 'Home', href: '/dashboard', icon: Home },
        { name: 'Pray', href: '/prayer-room', icon: Heart },
        { name: 'Give', href: '/offering', icon: Hand },
        { name: 'Community', href: '/community-wall', icon: Users },
        { name: 'Profile', href: '/profile', icon: User },
    ];

    return (
        <nav className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md border-t border-stone-200 md:hidden z-50 pb-safe">
            <div className="flex justify-around items-center h-16">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href;

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex flex-col items-center justify-center flex-1 h-full space-y-1 transition-colors",
                                isActive ? "text-sage-600" : "text-stone-400 hover:text-sage-500"
                            )}
                        >
                            <Icon size={20} className={cn("transition-transform", isActive && "scale-110")} />
                            <span className="text-[10px] font-medium tracking-tight">{item.name}</span>
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
};
