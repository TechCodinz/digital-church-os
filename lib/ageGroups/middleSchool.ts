// lib/ageGroups/middleSchool.ts

export class MiddleSchoolMinistry {
    async createMiddleSchoolExperience(student: any) {
        return {
            identity: {
                whoAmI: {
                    lessons: ['Created in God\'s Image', 'My Unique Design', 'My Spiritual Gifts'],
                    activities: ['gifts-assessment', 'identity-journal'],
                },
                faithOwnership: {
                    lessons: ['Is Christianity True?', 'Does God Exist?', 'Why Does Suffering Happen?'],
                    discussions: ['doubts-are-ok', 'questions-welcome'],
                },
            },
            bibleStudy: {
                format: 'discussion-based',
                books: ['Gospels', 'Acts', 'Psalms', 'Proverbs'],
                topics: ['identity', 'purity', 'purpose', 'social-media', 'anxiety'],
            },
            prayer: {
                types: ['personal-prayer', 'group-prayer', 'prayer-walking'],
                challenges: ['30-days-of-prayer', 'pray-for-school'],
            },
            worship: { style: 'contemporary-youth', band: 'youth-worship-team' },
            smallGroups: { format: 'same-gender', size: '6-8', frequency: 'weekly' },
            leadership: { training: ['communication', 'public-speaking'], opportunities: ['worship-leader', 'small-group-leader'] },
            digital: { app: 'Youth-Bible-App', social: 'private-youth-group', streaming: 'youth-worship-nights' },
            events: ['weekend-retreats', 'summer-camp', 'service-days'],
        };
    }
}
