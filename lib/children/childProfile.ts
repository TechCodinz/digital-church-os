// lib/children/childProfile.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Dummy AI for simulation
const ai = {
    createAvatar: async (child: any) => `https://api.dicebear.com/7.x/adventurer/svg?seed=${child.childName}`,
    assignPet: async (child: any) => ({ name: 'Faithful', type: 'Lamb', traits: ['Kind', 'Gentle'] }),
};

export class ChildrenDepartment {
    async createChildProfile(params: {
        parentId: string;
        childName: string;
        age: number;
        birthDate: Date;
        grade: string;
        interests: string[];
        learningStyle: 'visual' | 'auditory' | 'kinesthetic' | 'reading';
        specialNeeds?: string[];
        allergies?: string[];
        permissions: {
            photos: boolean;
            videos: boolean;
            socialMedia: boolean;
            publicTestimonies: boolean;
        };
    }) {

        // In a real app, we'd use prisma.child.create here.
        const child = {
            id: 'child_' + Date.now(),
            ...params,
            spiritualMilestones: [],
            badges: [],
            points: 0,
            level: this.calculateInitialLevel(params.age),
        };

        return {
            profile: child,

            // Age-appropriate dashboard
            dashboard: {
                theme: this.getThemeForAge(params.age),
                avatar: await ai.createAvatar(child),
                pet: await ai.assignPet(child),

                // Main sections
                sections: [
                    { name: 'My Bible Adventures', icon: '📖', color: 'blue' },
                    { name: 'Prayer Garden', icon: '🌸', color: 'pink' },
                    { name: 'Worship Jungle', icon: '🦁', color: 'orange' },
                    { name: 'Friendship Forest', icon: '🌳', color: 'green' },
                    { name: 'Memory Mountain', icon: '⛰️', color: 'purple' },
                    { name: 'Craft Cave', icon: '🎨', color: 'yellow' },
                ],

                // Parent dashboard
                parentAccess: {
                    viewProgress: true,
                    approveActivities: true,
                    setLimits: true,
                    receiveReports: 'weekly',
                    communication: 'direct',
                },
            },
        };
    }

    private calculateInitialLevel(age: number) {
        return Math.floor(age / 2) + 1;
    }

    private getThemeForAge(age: number) {
        if (age <= 3) return 'gentle-animals';
        if (age <= 5) return 'colorful-play';
        if (age <= 8) return 'adventure-quest';
        if (age <= 11) return 'hero-journey';
        return 'youth-explorer';
    }
}
