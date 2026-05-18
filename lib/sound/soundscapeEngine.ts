// lib/sound/soundscapeEngine.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

import OpenAI from 'openai';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

async function analyzeWithAI(params: any) {
    const prompt = `Analyze the spiritual soundscape request:
Moment: ${params.momentType}
Content: ${params.content || 'None'}
User Mood: ${params.currentMood || 'Neutral'}

Return a JSON object with:
{
  "primarySpiritualNeed": "string",
  "emotionalState": "string",
  "desiredOutcome": "string",
  "intensity": number (1-10),
  "spiritualJourney": "string (e.g. From X to Y)",
  "keyMoments": ["string"]
}`;

    const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [{ role: "system", content: "You are an expert spiritual soundscape architect. Respond ONLY in valid JSON matching the schema." }, { role: "user", content: prompt }],
        response_format: { type: "json_object" },
    });

    return JSON.parse(completion.choices[0].message.content || '{}');
}

export class DivineSoundscapeEngine {
    private soundLibraries = {
        worship: {
            contemporary: ['piano', 'acoustic-guitar', 'soft-drums'],
            traditional: ['organ', 'choir', 'harp'],
            gospel: ['piano', 'drums', 'bass', 'choir'],
            contemplative: ['cello', 'piano', 'ambient-pads'],
            celebratory: ['full-band', 'brass', 'drums'],
            intimate: ['acoustic-guitar', 'soft-piano', 'ambient'],
        },
        prayer: {
            intercession: ['soft-strings', 'ambient-pads', 'gentle-piano'],
            thanksgiving: ['harp', 'flute', 'light-percussion'],
            confession: ['cello', 'ambient-drone', 'soft-choir'],
            petition: ['piano', 'strings', 'hope-ambient'],
            warfare: ['drums', 'brass', 'powerful-choir'],
            meditation: ['singing-bowls', 'ambient', 'nature-sounds'],
        },
        teaching: {
            expository: ['subtle-pads', 'light-piano'],
            prophetic: ['building-strings', 'dramatic-pads'],
            encouragement: ['warm-strings', 'hope-piano'],
            challenge: ['intense-drums', 'powerful-brass'],
            wisdom: ['ancient-flute', 'cello', 'thoughtful-pads'],
        },
        bibleStudy: {
            oldTestament: ['ancient-harp', 'shofar', 'desert-winds'],
            newTestament: ['greek-lyre', 'roman-brass'],
            gospels: ['gentle-flute', 'soft-strings'],
            epistles: ['teaching-pads', 'thoughtful-piano'],
            prophecy: ['mysterious-pads', 'building-drums'],
        },
        conference: {
            opening: ['triumphant-fanfare', 'celebratory-choir'],
            worship: ['full-orchestra', 'mass-choir'],
            word: ['reverent-pads', 'holy-ambient'],
            altar: ['tender-strings', 'vulnerable-piano'],
            closing: ['blessing-strings', 'sending-choir'],
        }
    };

    async generateSoundscape(params: {
        momentType: 'worship' | 'prayer' | 'teaching' | 'bible-study' | 'conference';
        subType: string;
        emotionalGoal: 'peace' | 'joy' | 'reverence' | 'power' | 'intimacy' | 'awe';
        intensity: number;
        userMood?: string;
        spiritualNeed?: string;
        congregationSize?: 'intimate' | 'small' | 'medium' | 'large' | 'massive';
        culturalContext?: string;
        content?: string;
        userHistory?: any;
        prayerRequests?: any;
    }) {
        // Analyze what the spirit needs
        const spiritualAnalysis = await this.analyzeSpiritualNeed(params);

        // Select base soundscape
        const baseSounds = this.selectBaseSounds(params);

        // Layer with emotional intelligence
        const layeredSoundscape = await this.layerEmotionalIntelligence(
            baseSounds,
            spiritualAnalysis
        );

        // Add divine frequencies
        const withDivineFrequencies = this.addDivineFrequencies(layeredSoundscape);

        // Personalize for user
        const personalized = await this.personalizeSoundscape(
            withDivineFrequencies,
            params.userMood,
            params.spiritualNeed
        );

        return personalized;
    }

    private async analyzeSpiritualNeed(params: any) {
        const analysis = await analyzeWithAI({
            momentType: params.momentType,
            content: params.content,
            userHistory: params.userHistory,
            currentMood: params.userMood,
            prayerRequests: params.prayerRequests,
        });

        return {
            primaryNeed: analysis.primarySpiritualNeed,
            emotionalState: analysis.emotionalState,
            desiredOutcome: analysis.desiredOutcome,
            intensity: analysis.intensity,
            journey: analysis.spiritualJourney,
            keyMoments: analysis.keyMoments,
        };
    }

    private selectBaseSounds(params: any) {
        const library = (this.soundLibraries as any)[params.momentType];
        return library ? (library[params.subType] || library[Object.keys(library)[0]]) : [];
    }

    private async layerEmotionalIntelligence(baseSounds: string[], analysis: any) {
        return {
            base: baseSounds,
            emotionalOverlay: analysis.emotionalState,
            intensity: analysis.intensity,
            layers: {
                foundation: baseSounds[0] || 'ambient',
                emotional: 'strings',
                spiritual: 'choir',
                ambient: 'pads',
                accent: 'piano',
            }
        };
    }

    private addDivineFrequencies(soundscape: any) {
        return {
            ...soundscape,
            frequencies: [
                { hz: 528, purpose: 'Love & Healing', volume: 'subtle-background', timing: 'continuous' },
                { hz: 432, purpose: 'Peace & Calm', volume: 'ambient', timing: 'during-prayer' },
                { hz: 396, purpose: 'Liberation', volume: 'increasing', timing: 'during-warfare' },
            ],
            divineFrequencies: {
                healing: 528,
                transformation: 528,
                peace: 174,
                joy: 417,
                power: 396,
                love: 528,
                intuition: 852,
                connection: 963,
            }
        };
    }

    private async personalizeSoundscape(soundscape: any, mood?: string, need?: string) {
        return {
            ...soundscape,
            personalized: {
                moodAlignment: mood || 'neutral',
                spiritualSupport: need || 'general',
            }
        };
    }
}
