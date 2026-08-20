'use client';

import { SessionProvider } from 'next-auth/react';
import { ThemeProvider } from 'next-themes';
import { createContext, useContext, useEffect } from 'react';
import { offlineStorage } from '@/lib/offline/storage';

type AuthRuntime = {
    configured: boolean;
};

const AuthRuntimeContext = createContext<AuthRuntime>({ configured: true });

export function useAuthRuntime() {
    return useContext(AuthRuntimeContext);
}

export function Providers({
    children,
    authConfigured,
}: {
    children: React.ReactNode;
    authConfigured: boolean;
}) {
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
        <AuthRuntimeContext.Provider value={{ configured: authConfigured }}>
            <SessionProvider
                session={authConfigured ? undefined : null}
                refetchOnWindowFocus={authConfigured}
                refetchWhenOffline={false}
            >
                <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
                    {children}
                </ThemeProvider>
            </SessionProvider>
        </AuthRuntimeContext.Provider>
    );
}
