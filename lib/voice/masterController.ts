import { EmotionalVoiceEngine } from './emotionalIntelligence';
import { CinematicVoiceTechniques } from './techniques';
import { DynamicToneTuning } from './toneTuning';
import { VocalMicroExpressions } from './microExpressions';
import { AcousticSpaceModeling } from './acoustics';
import { CulturalVoiceAdaptation } from './culturalAdaptation';
import { AudienceResponseIntegration } from './audienceResponse';
import { VoiceSignature } from './signature';

/**
 * MasterVoiceController
 *
 * Orchestrates the full voice pipeline:
 * 1. Analyses content with GPT-4o to determine emotion arc + delivery cues
 * 2. Calls the real /api/voice/tts endpoint (ElevenLabs → OpenAI TTS → browser)
 * 3. Returns audio buffer OR fallback config for browser Web Speech API
 *
 * This is the server-side orchestrator used by the Sermon Engine and
 * other AI-driven content delivery systems.
 */
export class MasterVoiceController {
    private emotionalEngine = new EmotionalVoiceEngine();
    private techniques = new CinematicVoiceTechniques();
    private tuning = new DynamicToneTuning();
    private microExpressions = new VocalMicroExpressions();
    private acoustics = new AcousticSpaceModeling();
    private culture = new CulturalVoiceAdaptation();
    private audience = new AudienceResponseIntegration();
    private signature = new VoiceSignature();

    /**
     * Generate a real voice delivery for a sermon segment.
     * Returns { audioBuffer, contentType } if TTS succeeds,
     * or { fallback: true, speechConfig } for browser speech fallback.
     */
    async generateCinematicSermonVoice(sermon: {
        content: string;
        section?: string;
        personality?: string[];
        emotionalJourney?: any[];
        userId?: string;
    }, context: {
        audienceSize?: string;
        acoustics?: string;
        culture?: string;
    } = {}) {
        // ── Step 1: Analyse emotion arc from content ──────────────────────────
        let emotion = 'compassionate';
        let toneMetadata: any = {};

        try {
            const emotionalVoice = await this.emotionalEngine.generateDynamicVoice({
                scriptureContent: sermon.content,
                sermonSection: (sermon.section as any) || 'exposition',
                emotionalJourney: sermon.emotionalJourney || [],
                audienceSize: (context.audienceSize as any) || 'medium',
                acoustics: (context.acoustics as any) || 'hall',
            });

            // Extract dominant emotion from tone mapping
            const topSegment = emotionalVoice.toneMapping?.[0];
            if (topSegment?.emotion) emotion = topSegment.emotion;
            toneMetadata = emotionalVoice;
        } catch (e) {
            console.warn('Emotion analysis failed (using default):', e);
        }

        // ── Step 2: Apply cinematic tuning adjustments ────────────────────────
        let volumeAdjustment = 0;
        try {
            const tuning = await this.tuning.tuneVoiceRealTime({
                baseVoice: {},
                engagementLevel: 70,
                holyMoment: sermon.content.toLowerCase().includes('holy'),
                scripturePower: this.countScriptureReferences(sermon.content),
            });
            volumeAdjustment = tuning.volumeChange;
        } catch { /* non-fatal */ }

        // ── Step 3: Determine voice context ──────────────────────────────────
        const voiceContext = sermon.section === 'altar-call' ? 'pastoral' : 'sermon';

        // ── Step 4: Call the real TTS API ─────────────────────────────────────
        try {
            const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
            const ttsRes = await fetch(`${baseUrl}/api/voice/tts`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    // Server-side call — pass internal secret for auth bypass
                    'X-Internal-Secret': process.env.INTERNAL_API_SECRET || '',
                },
                body: JSON.stringify({
                    text: sermon.content,
                    context: voiceContext,
                    emotion,
                }),
            });

            const contentType = ttsRes.headers.get('Content-Type') || '';

            if (ttsRes.ok && contentType.includes('audio')) {
                const audioBuffer = await ttsRes.arrayBuffer();
                return {
                    audioBuffer,
                    contentType: 'audio/mpeg',
                    provider: ttsRes.headers.get('X-Voice-Provider') || 'ai',
                    emotion,
                    metadata: {
                        ...toneMetadata,
                        voiceContext,
                        volumeAdjustment,
                        timeline: this.createTimeline(emotion),
                    },
                };
            }

            // Fallback JSON
            const fallbackData = await ttsRes.json();
            return {
                fallback: true,
                provider: 'web-speech',
                speechConfig: fallbackData.speechConfig,
                text: sermon.content,
                emotion,
                metadata: toneMetadata,
            };
        } catch (e) {
            console.error('MasterVoiceController TTS call failed:', e);
            return {
                fallback: true,
                provider: 'web-speech',
                speechConfig: { rate: 0.9, pitch: 1.0, volume: 1.0 },
                text: sermon.content,
                emotion,
                metadata: toneMetadata,
            };
        }
    }

    /**
     * Generate voice directly for prayer content
     */
    async generatePrayerVoice(prayerText: string, emotion: string = 'tender') {
        return this.generateCinematicSermonVoice(
            { content: prayerText, section: 'altar-call', emotionalJourney: [] },
            {}
        );
    }

    /**
     * Generate voice for scripture reading
     */
    async generateScriptureVoice(scriptureText: string, reference: string) {
        return this.generateCinematicSermonVoice(
            { content: `${reference}: ${scriptureText}`, section: 'exposition', emotionalJourney: [] },
            {}
        );
    }

    private countScriptureReferences(text: string): number {
        const booksPattern = /(john|psalm|romans|genesis|matthew|luke|mark|acts|revelation|isaiah|philippians)/gi;
        const matches = text.match(booksPattern);
        return Math.min(matches?.length || 0, 10);
    }

    private createTimeline(emotion: string) {
        const timelines: Record<string, any> = {
            compassionate: { phases: ['Gentle Opening', 'Heart Connection', 'Hope Release'], cues: ['Pause(3s)', 'Warmth', 'Breath'] },
            triumphant: { phases: ['Build', 'Breakthrough', 'Celebration'], cues: ['Crescendo', 'Pause(2s)', 'Power'] },
            somber: { phases: ['Quiet Entry', 'Deep Truth', 'Comfort'], cues: ['Silence(4s)', 'Weighted', 'Soften'] },
            urgent: { phases: ['Alarm', 'Call', 'Decision'], cues: ['Rapid', 'Staccato', 'Pause(1s)'] },
            default: { phases: ['Introduction', 'Development', 'Conclusion'], cues: ['Moderate', 'Vary', 'Land'] },
        };
        return timelines[emotion] || timelines.default;
    }
}

