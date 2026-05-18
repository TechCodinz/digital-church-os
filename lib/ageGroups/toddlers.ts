// lib/ageGroups/toddlers.ts

export class ToddlerMinistry {
    async createToddlerExperience(child: any) {
        return {
            bibleTime: {
                format: 'sensory-stories',
                elements: [
                    { story: "Noah's Ark", sensory: ['water-play', 'animal-sounds', 'rainbow-scarves'], duration: '5min', repetition: 'daily' },
                    { story: "David the Shepherd", sensory: ['soft-fur', 'sheep-sounds', 'grass-texture'], duration: '5min', repetition: 'daily' }
                ],
            },
            prayer: {
                format: 'simple-gratitude',
                prompts: [
                    { action: 'point to sun', prayer: 'Thank you God for sun' },
                    { action: 'hug self', prayer: 'Thank you for loving me' },
                ],
                songs: ['God is Love', 'Jesus Loves Me'],
                duration: '2-3min',
            },
            worship: {
                songs: [{ title: 'Jesus Loves Me', actions: 'point to self' }],
                instruments: ['shakers', 'bells', 'drums'],
                duration: '5-8min',
            },
            activities: {
                sensory: ['water-play', 'sand-box'],
                motor: ['stacking', 'puzzles'],
                art: ['finger-paint', 'stamping'],
            },
            parents: { devotional: 'Daily child-friendly devotional', activity: 'Sensory play guide' },
            safety: { ratio: '3:1', checkIn: 'secure' },
        };
    }
}

export class PreschoolMinistry {
    async createPreschoolExperience(child: any) {
        return {
            bibleTime: {
                format: 'interactive-storytelling',
                lessons: [
                    { title: "God Made Everything", scripture: "Genesis 1", activity: "Creation scavenger hunt", verse: "In the beginning..." },
                ],
            },
            prayer: {
                types: [{ name: 'Thank You', format: 'I thank God for...' }],
                journal: 'draw-your-prayers',
            },
            worship: { songs: ['This Little Light of Mine', 'Deep and Wide'], actions: true },
            memory: { method: 'action-verses', verses: [{ verse: 'God is love', action: 'heart-hands' }] },
            social: { sharing: 'learning-through-play', kindness: 'kindness-cards' },
        };
    }
}
