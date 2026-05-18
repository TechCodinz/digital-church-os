import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { aiRateLimit } from '@/lib/ai-middleware';
import { prisma } from '@/lib/prisma';

/**
 * POST /api/voice/tts
 *
 * Real Text-To-Speech route using ElevenLabs as primary,
 * OpenAI TTS as fallback, and browser Web Speech as last resort.
 *
 * Body: {
 *   text: string          — the text to speak
 *   context: 'sermon' | 'prayer' | 'scripture' | 'pastoral' | 'children'
 *   emotion?: string      — compassionate | celebratory | urgent | somber | tender | triumphant
 *   voiceId?: string      — override the ElevenLabs voice ID
 *   savePreference?: boolean — persist selected voice to user profile
 * }
 *
 * Returns: audio/mpeg stream OR JSON { fallback: true, text, ssml } if no API key
 */

// ── ElevenLabs Voice Profiles per context ──────────────────────────────────────
// These are real ElevenLabs voice IDs. Users can override via voiceId param.
const ELEVENLABS_VOICES = {
    sermon: process.env.ELEVENLABS_VOICE_SERMON || 'pNInz6obpgDQGcFmaJgB', // Adam — deep, authoritative
    prayer: process.env.ELEVENLABS_VOICE_PRAYER || 'EXAVITQu4vr4xnSDxMaL', // Bella — warm, compassionate
    scripture: process.env.ELEVENLABS_VOICE_SCRIPTURE || 'VR6AewLTigWG4xSOukaG', // Arnold — measured, clear
    pastoral: process.env.ELEVENLABS_VOICE_PASTORAL || 'pNInz6obpgDQGcFmaJgB', // Adam (default pastor)
    children: process.env.ELEVENLABS_VOICE_CHILDREN || 'MF3mGyEYCl7XYWbV9V6O', // Elli — friendly, clear
} as const;

// ── OpenAI TTS voices as fallback ──────────────────────────────────────────────
const OPENAI_TTS_VOICES: Record<string, string> = {
    sermon: 'onyx',   // deep, powerful
    prayer: 'nova',   // warm, gentle
    scripture: 'echo',  // clear, measured
    pastoral: 'alloy',  // balanced
    children: 'shimmer', // bright, friendly
};

// ── Emotion → ElevenLabs voice_settings tuning ─────────────────────────────────
const EMOTION_SETTINGS: Record<string, { stability: number; similarity_boost: number; style: number; use_speaker_boost: boolean }> = {
    compassionate: { stability: 0.75, similarity_boost: 0.85, style: 0.3, use_speaker_boost: true },
    celebratory: { stability: 0.45, similarity_boost: 0.75, style: 0.7, use_speaker_boost: true },
    urgent: { stability: 0.40, similarity_boost: 0.80, style: 0.8, use_speaker_boost: true },
    somber: { stability: 0.85, similarity_boost: 0.90, style: 0.1, use_speaker_boost: false },
    tender: { stability: 0.90, similarity_boost: 0.95, style: 0.05, use_speaker_boost: false },
    triumphant: { stability: 0.35, similarity_boost: 0.70, style: 0.9, use_speaker_boost: true },
    default: { stability: 0.65, similarity_boost: 0.80, style: 0.4, use_speaker_boost: true },
};

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Rate limit: TTS is expensive — 10/min per user
        const limit = await aiRateLimit(req, session.user.id, { maxRequests: 10, windowMs: 60_000 });
        if (limit) return limit;

        const body = await req.json();
        const {
            text,
            context = 'pastoral',
            emotion = 'default',
            voiceId,
            savePreference = false,
        } = body;

        if (!text || typeof text !== 'string' || text.trim().length < 2) {
            return NextResponse.json({ error: 'Text is required' }, { status: 400 });
        }
        if (text.length > 5000) {
            return NextResponse.json({ error: 'Text too long (max 5000 characters)' }, { status: 400 });
        }

        const cleanText = text.trim();

        // ── Load user's saved voice preference ───────────────────────────────────────
        let preferredVoiceId = voiceId;
        try {
            const user = await prisma.user.findUnique({
                where: { id: session.user.id },
                select: { notificationPreferences: true },
            });
            const prefs = (user?.notificationPreferences as any) || {};
            if (!preferredVoiceId && prefs.voicePreference?.[context]) {
                preferredVoiceId = prefs.voicePreference[context];
            }
        } catch { /* DB unavailable — use defaults */ }

        const selectedVoiceId = preferredVoiceId || ELEVENLABS_VOICES[context as keyof typeof ELEVENLABS_VOICES] || ELEVENLABS_VOICES.pastoral;
        const voiceSettings = EMOTION_SETTINGS[emotion] || EMOTION_SETTINGS.default;

        // ── Persist voice preference if requested ────────────────────────────────────
        if (savePreference && voiceId) {
            try {
                await prisma.user.update({
                    where: { id: session.user.id },
                    data: {
                        notificationPreferences: {
                            voicePreference: { [context]: voiceId },
                        },
                    },
                });
            } catch { /* non-fatal */ }
        }

        // ════════════════════════════════════════════════════════════════════════════
        // PRIMARY: ElevenLabs TTS
        // ════════════════════════════════════════════════════════════════════════════
        const elevenLabsKey = process.env.ELEVENLABS_API_KEY;
        if (elevenLabsKey) {
            try {
                const elevenRes = await fetch(
                    `https://api.elevenlabs.io/v1/text-to-speech/${selectedVoiceId}/stream`,
                    {
                        method: 'POST',
                        headers: {
                            'xi-api-key': elevenLabsKey,
                            'Content-Type': 'application/json',
                            Accept: 'audio/mpeg',
                        },
                        body: JSON.stringify({
                            text: cleanText,
                            model_id: 'eleven_turbo_v2_5', // Fastest, lowest latency
                            voice_settings: voiceSettings,
                        }),
                    }
                );

                if (elevenRes.ok) {
                    const audioBuffer = await elevenRes.arrayBuffer();
                    return new NextResponse(audioBuffer, {
                        status: 200,
                        headers: {
                            'Content-Type': 'audio/mpeg',
                            'Content-Length': String(audioBuffer.byteLength),
                            'Cache-Control': 'no-store',
                            'X-Voice-Provider': 'elevenlabs',
                            'X-Voice-Id': selectedVoiceId,
                        },
                    });
                }

                console.warn('ElevenLabs TTS failed:', elevenRes.status, await elevenRes.text());
            } catch (e) {
                console.warn('ElevenLabs TTS error (falling back):', e);
            }
        }

        // ════════════════════════════════════════════════════════════════════════════
        // FALLBACK 1: OpenAI TTS
        // ════════════════════════════════════════════════════════════════════════════
        const openAiKey = process.env.OPENAI_API_KEY;
        if (openAiKey) {
            try {
                const { OpenAI } = await import('openai');
                const openai = new OpenAI({ apiKey: openAiKey });

                const openaiVoice = (OPENAI_TTS_VOICES[context] || 'alloy') as any;
                const mp3 = await openai.audio.speech.create({
                    model: 'tts-1-hd',  // High quality
                    voice: openaiVoice,
                    input: cleanText,
                    speed: emotion === 'urgent' ? 1.15 : emotion === 'somber' ? 0.85 : 1.0,
                });

                const audioBuffer = await mp3.arrayBuffer();
                return new NextResponse(audioBuffer, {
                    status: 200,
                    headers: {
                        'Content-Type': 'audio/mpeg',
                        'Content-Length': String(audioBuffer.byteLength),
                        'Cache-Control': 'no-store',
                        'X-Voice-Provider': 'openai-tts',
                        'X-Voice-Id': openaiVoice,
                    },
                });
            } catch (e) {
                console.warn('OpenAI TTS error (falling back to browser):', e);
            }
        }

        // ════════════════════════════════════════════════════════════════════════════
        // FALLBACK 2: Signal client to use Web Speech API
        // ════════════════════════════════════════════════════════════════════════════
        return NextResponse.json({
            fallback: true,
            provider: 'web-speech',
            text: cleanText,
            emotion,
            context,
            // SSML hint for browser Web Speech API
            speechConfig: {
                rate: emotion === 'urgent' ? 1.2 : emotion === 'somber' ? 0.75 : emotion === 'tender' ? 0.85 : 1.0,
                pitch: emotion === 'celebratory' ? 1.2 : emotion === 'somber' ? 0.8 : 1.0,
                volume: emotion === 'tender' ? 0.75 : 1.0,
            },
        });
    } catch (error) {
        console.error('TTS critical error:', error);
        return NextResponse.json({ error: 'Voice synthesis failed' }, { status: 500 });
    }
}

// ── GET: Return available voices list ───────────────────────────────────────────
export async function GET(req: NextRequest) {
    try {
        const elevenLabsKey = process.env.ELEVENLABS_API_KEY;

        // If ElevenLabs key available, return live voice list
        if (elevenLabsKey) {
            const res = await fetch('https://api.elevenlabs.io/v1/voices', {
                headers: { 'xi-api-key': elevenLabsKey },
            });
            if (res.ok) {
                const data = await res.json();
                return NextResponse.json({
                    provider: 'elevenlabs',
                    voices: data.voices?.map((v: any) => ({
                        id: v.voice_id,
                        name: v.name,
                        description: v.description,
                        category: v.category,
                        previewUrl: v.preview_url,
                    })) || [],
                    defaults: ELEVENLABS_VOICES,
                });
            }
        }

        // Fallback to OpenAI TTS + browser
        return NextResponse.json({
            provider: 'openai-tts',
            voices: Object.entries(OPENAI_TTS_VOICES).map(([ctx, voice]) => ({
                id: voice,
                name: voice.charAt(0).toUpperCase() + voice.slice(1),
                context: ctx,
            })),
            defaults: OPENAI_TTS_VOICES,
        });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch voices' }, { status: 500 });
    }
}
