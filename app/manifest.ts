import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: 'Digital Church OS',
        short_name: 'ChurchOS',
        description: 'A digital worship and spiritual community platform',
        start_url: '/',
        display: 'standalone',
        background_color: '#faf9f6',
        theme_color: '#789b64',
        icons: [
            {
                src: '/icon-192.png',
                sizes: '192x192',
                type: 'image/png',
            },
            {
                src: '/icon-512.png',
                sizes: '512x512',
                type: 'image/png',
            },
        ],
    };
}
