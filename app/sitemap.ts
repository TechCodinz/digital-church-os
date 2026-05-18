import { MetadataRoute } from 'next';
import { prisma } from '@/lib/prisma';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://digital-church-os.vercel.app';

    // Static routes
    const routes = [
        '',
        '/conferences',
        '/prayer-room',
        '/choir',
        '/offering',
        '/community-wall',
    ].map((route) => ({
        url: `${baseUrl}${route}`,
        lastModified: new Date(),
        changeFrequency: 'daily' as const,
        priority: route === '' ? 1 : 0.8,
    }));

    // Dynamic routes - conferences
    let conferenceRoutes: MetadataRoute.Sitemap = [];
    try {
        const conferences = await prisma.conference.findMany({
            where: { status: 'UPCOMING' },
            select: { id: true, updatedAt: true },
        });

        conferenceRoutes = conferences.map((conference) => ({
            url: `${baseUrl}/conferences/${conference.id}`,
            lastModified: conference.updatedAt,
            changeFrequency: 'weekly' as const,
            priority: 0.6,
        }));
    } catch (error) {
        console.warn('Sitemap: Database unreachable during build. Skipping conferences.');
    }

    return [...routes, ...conferenceRoutes];
}
