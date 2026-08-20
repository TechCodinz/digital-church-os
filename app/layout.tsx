import './styles/globals.css';
import './styles/cinematic.css';
import { Inter } from 'next/font/google';
import { Navbar } from '@/components/layout/Navbar';
import { MobileBottomNav } from '@/components/layout/MobileBottomNav';
import { Footer } from '@/components/layout/Footer';
import { FloatingSanctuaryGuide } from '@/components/ministry/FloatingSanctuaryGuide';
import { Providers } from './providers';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
    title: {
        default: 'Digital Church OS — Living Sanctuary',
        template: '%s | Digital Church OS',
    },
    description: 'A living digital sanctuary for worship, prayer, Scripture, discipleship, pastoral care, community, and tenant-safe church ministry.',
    themeColor: '#06110f',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    const authConfigured = Boolean(process.env.NEXTAUTH_SECRET);

    return (
        <html lang="en" className="scroll-smooth" suppressHydrationWarning>
            <body className={`${inter.className} living-sanctuary-body antialiased`}>
                <Providers authConfigured={authConfigured}>
                    <a
                        href="#main-content"
                        className="fixed left-4 top-3 z-[100] -translate-y-24 rounded-full bg-amber-200 px-4 py-2 text-xs font-bold text-slate-950 shadow-xl transition-transform focus:translate-y-0"
                    >
                        Skip to main content
                    </a>
                    <div className="phase11-sanctuary-shell flex min-h-screen flex-col">
                        <div className="sanctuary-global-aurora" aria-hidden="true" />
                        <Navbar />
                        <main id="main-content" className="relative z-10 flex-grow" tabIndex={-1}>{children}</main>
                        <FloatingSanctuaryGuide />
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
