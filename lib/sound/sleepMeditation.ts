// lib/sound/sleepMeditation.ts
import { User } from '@prisma/client';

export class SleepAndMeditationSounds {
    async createSleepSoundscape(user: User) {
        return {
            windDown: {
                duration: '30min',
                sounds: ['gentle-rain', 'soft-piano', 'ambient-pads'],
                frequencies: [174, 285],
                progression: 'gradually-slowing',
            },
            deepSleep: {
                duration: '6hours',
                sounds: ['delta-waves', 'soft-drone', 'distant-ocean'],
                frequencies: [1, 4], // Delta waves
                pattern: 'continuous',
            },
            wakeUp: {
                duration: '15min',
                sounds: ['birds', 'gentle-strings', 'morning-light'],
                frequencies: [8, 12], // Alpha waves
                progression: 'gradually-brightening',
            },
            adaptive: {
                lightSleep: 'soft-rain-layer',
                deepSleep: 'delta-drone-layer',
                remSleep: 'vivid-dream-pad',
                awake: 'morning-sun-swell',
            },
        };
    }

    async createMeditationSoundscape(type: 'mindfulness' | 'contemplative' | 'focused' | 'lovingKindness') {
        const meditations: any = {
            mindfulness: {
                sounds: ['singing-bowls', 'nature', 'gentle-bells'],
                frequencies: [4, 8], // Theta waves
                guidance: 'breath-awareness',
            },
            contemplative: {
                sounds: ['ambient-drone', 'soft-strings'],
                frequencies: [1, 4], // Delta waves
                guidance: 'silence-between-thoughts',
            },
            focused: {
                sounds: ['binaural-beats', 'gentle-rhythm'],
                frequencies: [12, 30], // Beta waves
                guidance: 'concentration',
            },
            lovingKindness: {
                sounds: ['warm-strings', 'gentle-choir'],
                frequencies: [4, 8], // Theta waves
                guidance: 'compassion-meditation',
            },
        };

        return meditations[type] || meditations.mindfulness;
    }
}
