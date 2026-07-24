'use client';

import { SessionProvider } from 'next-auth/react';
import { ThemeProvider } from 'next-themes';
import { SanctuaryThemeProvider } from '@/components/theme/ThemeContext';
import { useEffect } from 'react';
import { offlineStorage } from '@/lib/offline/storage';

export function Providers({ children }: { children: React.ReactNode }) {
    useEffect(() => {
        offlineStorage.syncAll();
        const handleOnline = () => offlineStorage.syncAll();
        window.addEventListener('online', handleOnline);
        const interval = setInterval(() => offlineStorage.syncAll(), 5 * 60 * 1000);
        return () => {
            window.removeEventListener('online', handleOnline);
            clearInterval(interval);
        };
    }, []);

    return (
        <SessionProvider>
            <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
                <SanctuaryThemeProvider>
                    {children}
                </SanctuaryThemeProvider>
            </ThemeProvider>
        </SessionProvider>
    );
}
