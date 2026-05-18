// lib/ageGroups/classification.ts

export class AgeGroupEngine {
    private ageGroups: any = {
        toddlers: { range: [0, 3], stage: 'foundation' },
        preschoolers: { range: [4, 5], stage: 'discovery' },
        earlyElementary: { range: [6, 8], stage: 'exploration' },
        upperElementary: { range: [9, 11], stage: 'application' },
        middleSchool: { range: [12, 14], stage: 'identity' },
        highSchool: { range: [15, 17], stage: 'ownership' },
        youngAdults: { range: [18, 25], stage: 'launching' },
        adults: { range: [26, 40], stage: 'building' },
        midlife: { range: [41, 55], stage: 'legacy' },
        seniors: { range: [56, 100], stage: 'wisdom' },
    };

    async getAgeSpecificExperience(age: number) {
        const groupName = this.findAgeGroupName(age);
        const group = this.ageGroups[groupName];

        return {
            group: groupName,
            stage: group.stage,
            experience: await this.loadStageExperience(group.stage),
            learningStyle: this.getLearningStyle(group.stage),
            engagement: this.getEngagementStrategies(group.stage),
            contentDepth: this.getContentDepth(group.stage),
            communityLevel: this.getCommunityLevel(group.stage),
            involvement: this.getInvolvementLevel(group.stage),
            milestones: this.getAgeMilestones(groupName),
        };
    }

    private findAgeGroupName(age: number): string {
        for (const [name, data] of Object.entries(this.ageGroups)) {
            const g = data as any;
            if (age >= g.range[0] && age <= g.range[1]) return name;
        }
        return 'adults';
    }

    private async loadStageExperience(stage: string) {
        return { title: `${stage.charAt(0).toUpperCase() + stage.slice(1)} Stage Experience`, status: 'Active' };
    }

    private getLearningStyle(stage: string) {
        const styles: any = {
            foundation: { primary: 'sensory-play', secondary: 'repetition', duration: '5-10min', ratio: '5:1 adult-child' },
            discovery: { primary: 'interactive-story', secondary: 'hands-on', duration: '10-15min', ratio: '4:1' },
            exploration: { primary: 'question-based', secondary: 'group-activities', duration: '15-20min', ratio: '6:1' },
            application: { primary: 'project-based', secondary: 'peer-learning', duration: '20-30min', ratio: '8:1' },
            identity: { primary: 'discussion-based', secondary: 'mentorship', duration: '30-45min', ratio: '10:1' },
            ownership: { primary: 'leadership-based', secondary: 'service-learning', duration: '45-60min', ratio: '12:1' },
            launching: { primary: 'real-world-application', secondary: 'networking', duration: '60-90min', ratio: '15:1' },
            building: { primary: 'life-integration', secondary: 'peer-mentoring', duration: '45-60min', ratio: '20:1' },
            legacy: { primary: 'teaching-others', secondary: 'wisdom-sharing', duration: '60-90min', ratio: '30:1' },
            wisdom: { primary: 'story-sharing', secondary: 'mentoring', duration: '45-60min', ratio: '50:1' },
        };
        return styles[stage] || styles.building;
    }

    private getEngagementStrategies(stage: string) { return ['Visuals', 'Interaction', 'Application']; }
    private getContentDepth(stage: string) { return stage === 'foundation' ? 'Basic' : 'Deep'; }
    private getCommunityLevel(stage: string) { return 'High'; }
    private getInvolvementLevel(stage: string) { return 'Active'; }
    private getAgeMilestones(groupName: string) { return ['First Bible', 'First Prayer', 'Graduation']; }
}
