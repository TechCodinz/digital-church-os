import './styles/globals.css';
import './styles/cinematic.css';
import { Inter } from 'next/font/google';
import { Navbar } from '@/components/layout/Navbar';
import { MobileBottomNav } from '@/components/layout/MobileBottomNav';
import { Footer } from '@/components/layout/Footer';
import { Providers } from './providers';

import { SanctuaryOmnibox } from '@/components/ai/SanctuaryOmnibox';
import { AmbientBackground } from '@/components/experience/AmbientBackground';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
    title: {
        default: 'Digital Church OS — Living Sanctuary',
        template: '%s | Digital Church OS',
    },
    description: 'A living digital sanctuary for prayer, Scripture, worship, pastoral care, community, and church life.',
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en" className="scroll-smooth">
            <body className={`${inter.className} bg-cream-50 text-gray-800 antialiased`}>
                <Providers>
                    <AmbientBackground />
                    <a
                        href="#main-content"
                        className="fixed left-4 top-3 z-[100] -translate-y-24 rounded-full bg-amber-200 px-4 py-2 text-xs font-bold text-slate-950 shadow-xl transition-transform focus:translate-y-0"
                    >
                        Skip to main content
                    </a>
                    <div className="min-h-screen flex flex-col relative">
                        <Navbar />
                        <main id="main-content" className="flex-grow" tabIndex={-1}>{children}</main>
                        <SanctuaryOmnibox />
                        <MobileBottomNav />
                        <Footer />
                    </div>
                    <script
                        dangerouslySetInnerHTML={{
                            __html: `
                                if ('serviceWorker' in navigator) {
                                  window.addEventListener('load', function() {
                                    navigator.serviceWorker.register('/sw.js');
                                  });
                                }
                            `,
                        }}
                    />
                </Providers>
            </body>
        </html>
    );
}
