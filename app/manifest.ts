import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: 'Digital Church OS — Living Sanctuary',
        short_name: 'Church OS',
        description: 'A living digital sanctuary for Scripture, prayer, worship, pastoral care, discipleship, and church ministry.',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        background_color: '#030b09',
        theme_color: '#06110f',
        categories: ['lifestyle', 'education', 'social'],
        orientation: 'any',
    };
}
