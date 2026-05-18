'use client';

import { SessionProvider } from 'next-auth/react';
import { ThemeProvider } from 'next-themes';
import { useEffect } from 'react';
import { offlineStorage } from '@/lib/offline/storage';

export function Providers({ children }: { children: React.ReactNode }) {
    useEffect(() => {
        // Initial sync on load
        offlineStorage.syncAll();

        // Sync when coming back online
        const handleOnline = () => offlineStorage.syncAll();
        window.addEventListener('online', handleOnline);

        // Periodic sync every 5 minutes
        const interval = setInterval(() => offlineStorage.syncAll(), 5 * 60 * 1000);

        return () => {
            window.removeEventListener('online', handleOnline);
            clearInterval(interval);
        };
    }, []);

    return (
        <SessionProvider>
            <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
                {children}
            </ThemeProvider>
        </SessionProvider>
    );
}
