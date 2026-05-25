import { OpenAI } from 'openai';
import { createClient } from 'pexels';

const videoCache = new Map<string, string>();

export class MediaGenerator {
  private openai: OpenAI | null = null;
  private pexelsClient: ReturnType<typeof createClient> | null = null;

  constructor() {
    if (process.env.OPENAI_API_KEY) {
      this.openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    }

    if (process.env.PEXELS_API_KEY) {
      this.pexelsClient = createClient(process.env.PEXELS_API_KEY);
    }
  }

  async extractVisualTheme(content: string, type: 'image' | 'video' = 'image'): Promise<string> {
    if (!this.openai) {
      return type === 'image' ? 'peaceful sanctuary light' : 'peaceful church nature';
    }

    try {
      const prompt = type === 'image'
        ? `Read this spiritual text and write one short, safe, symbolic image prompt. Avoid depicting real people or identifiable faces. Text: "${content.substring(0, 500)}"`
        : `Read this spiritual text and return 2-3 calm stock-video search keywords only. Text: "${content.substring(0, 500)}"`;

      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.4,
        max_tokens: 60,
      });

      return response.choices[0].message.content?.trim() || 'peaceful sanctuary light';
    } catch (error) {
      console.error('Failed to extract visual theme:', error);
      return 'peaceful sanctuary light';
    }
  }

  async generateImage(themeContext: string): Promise<string | null> {
    if (!this.openai) {
      return null;
    }

    try {
      const visualPrompt = await this.extractVisualTheme(themeContext, 'image');
      const response = await this.openai.images.generate({
        model: 'dall-e-3',
        prompt: `${visualPrompt}. Cinematic, reverent, symbolic, warm light, no identifiable faces.`,
        n: 1,
        size: '1024x1024',
        quality: 'standard',
      });

      return response.data?.[0]?.url || null;
    } catch (error) {
      console.error('Image generation error:', error);
      return null;
    }
  }

  async getBackgroundVideo(themeContext: string): Promise<string | null> {
    if (!this.pexelsClient) return null;

    try {
      const searchQuery = await this.extractVisualTheme(themeContext, 'video');
      if (videoCache.has(searchQuery)) return videoCache.get(searchQuery)!;

      const response = await this.pexelsClient.videos.search({
        query: searchQuery,
        per_page: 5,
        orientation: 'landscape',
        size: 'large',
      });

      if ('videos' in response && response.videos.length > 0) {
        const video = response.videos[0];
        const hdFile = video.video_files.find((file: any) => file.quality === 'hd') || video.video_files[0];
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
