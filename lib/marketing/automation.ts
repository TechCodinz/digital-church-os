import { User } from '@prisma/client';

export class MarketingAutomation {
    async createJourney(user: User) {
        const journey = {
            onboarding: await this.createOnboardingFlow(user),
            engagement: await this.createEngagementFlow(user),
            retention: await this.createRetentionFlow(user),
            reengagement: await this.createReengagementFlow(user),
        };

        return journey;
    }

    private async createOnboardingFlow(user: User) {
        return [
            { day: 0, action: 'email', template: 'welcome', delay: 'immediate' },
            { day: 1, action: 'push', template: 'first-prayer', delay: '24h' },
            { day: 3, action: 'email', template: 'bible-study', delay: '72h' },
        ];
    }

    private async createEngagementFlow(user: User) {
        return {
            prayerReminder: {
                condition: 'daysSinceLastPrayer > 3',
                action: { type: 'push', template: 'prayer-reminder' },
            },
            sermonComplete: {
                condition: 'lastSermonCompleted === true',
                action: { type: 'email', template: 'sermon-followup' },
            }
        };
    }

    private async createRetentionFlow(user: User) {
        // Simulated churn risk prediction
        const risk = 0.8;

        if (risk > 0.7) {
            return {
                priority: 'high',
                interventions: [
                    { type: 'personal-email', template: 'we-miss-you' },
                    { type: 'sms', template: 'personal-check' },
                ],
            };
        }
        return { priority: 'normal', interventions: [] };
    }

    private async createReengagementFlow(user: User) {
        return {
            campaign: 'comeback-special',
            steps: [
                { day: 30, action: 'email', template: 'missing-you' },
                { day: 60, action: 'postcard', template: 'physical-mail' },
            ],
        };
    }
}
