import { OpenAI } from 'openai';
import { createClient } from 'pexels';

// Cache for fetching backgrounds to avoid hitting API limits
const videoCache = new Map<string, string>();

export class MediaGenerator {
    private openai: OpenAI | null = null;
    private pexelsClient: any = null;

    constructor() {
        if (process.env.OPENAI_API_KEY) {
            this.openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
        }

        // Use a default free API key for Pexels if one isn't provided (for demo/launch purposes)
        // In production, users should add PEXELS_API_KEY to their .env
        const pexelsKey = process.env.PEXELS_API_KEY || '563492ad6f917000010000015b6d9da49e1d4b6ca56a735c032646c1';
        this.pexelsClient = createClient(pexelsKey);
    }

    /**
     * Extracts a strong visual theme from spiritual text (sermon/prayer).
     */
    async extractVisualTheme(content: string, type: 'image' | 'video' = 'image'): Promise<string> {
        if (!this.openai) {
            return type === 'image'
                ? 'A peaceful sunset church stained glass'
                : 'nature landscape peaceful';
        }

        try {
            const prompt = type === 'image'
                ? `Read this spiritual text and write a short, highly evocative 1-sentence prompt for an AI image generator (like Midjourney/DALL-E) that perfectly captures the mood and theology of the text. Focus on lighting, atmosphere, and cinematic quality. No faces.
                Text: "${content.substring(0, 500)}"`
                : `Read this spiritual text and extract 2-3 keywords for searching a stock video site (like Pexels) for a background video. E.g., if it's about peace, return "calm ocean sunset". If about strength, "mountain peak dramatic". Return ONLY the search terms.
                Text: "${content.substring(0, 500)}"`;

            const response = await this.openai.chat.completions.create({
                model: 'gpt-3.5-turbo', // Fast and cheap for this task
                messages: [{ role: 'user', content: prompt }],
                temperature: 0.7,
                max_tokens: 60,
            });

            return response.choices[0].message.content?.trim() || 'peaceful nature landscape';
        } catch (error) {
            console.error('Failed to extract visual theme:', error);
            return 'peaceful light rays clouds';
        }
    }

    /**
     * Generates a DALL-E 3 image based on the parsed theme.
     */
    async generateImage(themeContext: string): Promise<string | null> {
        if (!this.openai) {
            // Unsplash placeholder fallback
            const fallbackTheme = encodeURIComponent(themeContext.split(' ').slice(0, 2).join(','));
            return `https://source.unsplash.com/featured/1024x1024/?${fallbackTheme},church,nature`;
        }

        try {
            const visualPrompt = await this.extractVisualTheme(themeContext, 'image');

            const response = await this.openai.images.generate({
                model: "dall-e-3",
                prompt: visualPrompt + " - Highly cinematic, hyper-realistic, volumetric lighting, spiritual atmosphere, masterpiece.",
                n: 1,
                size: "1024x1024",
                quality: "standard",
            });

            return response.data?.[0]?.url || null;
        } catch (error) {
            console.error('DALL-E Generation error:', error);
            // Fallback to Unsplash on error
            return `https://images.unsplash.com/photo-1507692049790-de58290a4334?w=1024`;
        }
    }

    /**
     * Fetches a cinematic background video matching the theme.
     */
    async getBackgroundVideo(themeContext: string): Promise<string | null> {
        if (!this.pexelsClient) return null;

        try {
            const searchQuery = await this.extractVisualTheme(themeContext, 'video');

            // Check cache first
            if (videoCache.has(searchQuery)) {
                return videoCache.get(searchQuery)!;
            }

            const response = await this.pexelsClient.videos.search({
                query: searchQuery,
                per_page: 5,
                orientation: 'landscape',
                size: 'large'
            });

            if ('videos' in response && response.videos.length > 0) {
                // Get the first video, find the HD quality link
                const video = response.videos[0];
                const hdFile = video.video_files.find((f: any) => f.quality === 'hd') || video.video_files[0];

                if (hdFile?.link) {
                    videoCache.set(searchQuery, hdFile.link);
                    return hdFile.link;
                }
            }

            return null;
        } catch (error) {
            console.error('Pexels video fetch error:', error);
            return null;
        }
    }
}
