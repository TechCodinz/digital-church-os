// lib/sound/prayerAtmospheres.ts
import { PrayerRequest, User } from '@prisma/client';

export class PrayerAtmosphereEngine {
    async createPrayerAtmosphere(prayer: PrayerRequest, user: User) {
        // Analyze prayer type
        const prayerType = await this.identifyPrayerType(prayer.content);

        const atmospheres: any = {
            healing: {
                base: ['soft-strings', 'healing-frequencies'],
                layers: [
                    { time: 0, sound: 'gentle-piano', volume: 0.3 },
                    { time: 30, sound: 'healing-choir', volume: 0.2 },
                    { time: 60, sound: 'angelic-voices', volume: 0.1 },
                ],
                frequencies: [528, 396],
                visualization: 'healing-light',
                progression: 'gentle-to-powerful',
            },
            breakthrough: {
                base: ['building-drums', 'powerful-brass'],
                layers: [
                    { time: 0, sound: 'anticipation-pads', volume: 0.4 },
                    { time: 30, sound: 'warfare-drums', volume: 0.5 },
                    { time: 60, sound: 'triumphant-fanfare', volume: 0.8 },
                ],
                frequencies: [417, 528],
                visualization: 'breakthrough-light',
                progression: 'building-to-climax',
            },
            peace: {
                base: ['ambient-pads', 'gentle-strings'],
                layers: [
                    { time: 0, sound: 'calming-waves', volume: 0.3 },
                    { time: 30, sound: 'soft-piano', volume: 0.2 },
                    { time: 60, sound: 'angelic-harp', volume: 0.15 },
                ],
                frequencies: [174, 285],
                visualization: 'peaceful-light',
                progression: 'sustaining',
            },
            intercession: {
                base: ['prayer-choir', 'strings'],
                layers: [
                    { time: 0, sound: 'intercession-pads', volume: 0.4 },
                    { time: 30, sound: 'prayer-voices', volume: 0.3 },
                    { time: 60, sound: 'heavenly-choir', volume: 0.5 },
                ],
                frequencies: [528, 852],
                visualization: 'intercession-light',
                progression: 'building',
            },
            thanksgiving: {
                base: ['joyful-harp', 'celebratory-strings'],
                layers: [
                    { time: 0, sound: 'grateful-piano', volume: 0.5 },
                    { time: 30, sound: 'thanksgiving-choir', volume: 0.6 },
                    { time: 60, sound: 'celebratory-fanfare', volume: 0.7 },
                ],
                frequencies: [417, 528],
                visualization: 'thanksgiving-light',
                progression: 'joyful',
            },
            confession: {
                base: ['cello', 'solemn-strings'],
                layers: [
                    { time: 0, sound: 'reflective-piano', volume: 0.3 },
                    { time: 30, sound: 'mercy-strings', volume: 0.2 },
                    { time: 60, sound: 'forgiveness-choir', volume: 0.1 },
                ],
                frequencies: [396, 528],
                visualization: 'mercy-light',
                progression: 'gentle-release',
            },
        };

        const atmosphere = atmospheres[prayerType] || atmospheres.peace;
        return this.renderAtmosphere(atmosphere, user);
    }

    private async identifyPrayerType(content: string): Promise<string> {
        const lowContent = content.toLowerCase();
        if (lowContent.includes('heal') || lowContent.includes('sick')) return 'healing';
        if (lowContent.includes('breakthrough') || lowContent.includes('victory') || lowContent.includes('wall')) return 'breakthrough';
        if (lowContent.includes('thanks') || lowContent.includes('grateful') || lowContent.includes('praise')) return 'thanksgiving';
        if (lowContent.includes('sorry') || lowContent.includes('forgive') || lowContent.includes('confess')) return 'confession';
        if (lowContent.includes('other') || lowContent.includes('intercede')) return 'intercession';
        return 'peace';
    }

    private renderAtmosphere(atmosphere: any, user: User) {
        return {
            ...atmosphere,
            userId: user.id,
            timestamp: new Date(),
        };
    }
}
