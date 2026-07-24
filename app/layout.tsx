import './styles/globals.css';
import { Inter } from 'next/font/google';
import { Navbar } from '@/components/layout/Navbar';
import { MobileBottomNav } from '@/components/layout/MobileBottomNav';
import { Footer } from '@/components/layout/Footer';
import { Providers } from './providers';

import { SanctuaryOmnibox } from '@/components/ai/SanctuaryOmnibox';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
    title: 'Digital Church OS',
    description: 'A digital worship and spiritual community platform',
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en" className="scroll-smooth">
            <body className={`${inter.className} bg-cream-50 text-gray-800`}>
                <Providers>
                    <div className="min-h-screen flex flex-col">
                        <Navbar />
                        <main className="flex-grow">{children}</main>
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
