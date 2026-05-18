import { prisma } from '@/lib/prisma';

interface AIInteractionLog {
    userId: string;
    module: string;
    input: any;
    output: any;
    duration?: number;
    model?: string;
    tokens?: number;
    cost?: number;
}

export class AILogger {
    static async logInteraction(data: AIInteractionLog) {
        try {
            // Store in database
            const interaction = await prisma.aIInteraction.create({
                data: {
                    userId: data.userId,
                    moduleId: data.module, // Map to existing schema field
                    input: data.input,
                    output: data.output,
                    metadata: {
                        duration: data.duration,
                        model: data.model,
                        tokens: data.tokens,
                        cost: data.cost,
                    },
                },
            });

            // If cost tracking enabled
            if (data.cost) {
                await prisma.aICost.create({
                    data: {
                        userId: data.userId,
                        module: data.module,
                        cost: data.cost,
                    },
                });
            }

            // Check for high risk to flag
            if (this.isHighRiskInteraction(data)) {
                await this.flagForReview(data);
            }

            return interaction;
        } catch (error) {
            console.error('Failed to log AI interaction:', error);
        }
    }

    static async logCounselingSession(data: {
        userId: string;
        concern: string;
        riskLevel: 'low' | 'medium' | 'high';
        responseType: string;
    }) {
        await prisma.counselingLog.create({
            data: {
                userId: data.userId,
                concern: data.concern,
                riskLevel: data.riskLevel,
                responseType: data.responseType,
            },
        });

        if (data.riskLevel === 'high') {
            console.warn('HIGH RISK COUNSELING LOGGED:', data);
        }
    }

    private static isHighRiskInteraction(data: AIInteractionLog): boolean {
        const inputStr = JSON.stringify(data.input).toLowerCase();
        return inputStr.includes('suicide') || inputStr.includes('self-harm') || inputStr.includes('kill myself');
    }

    private static async flagForReview(data: AIInteractionLog) {
        await prisma.flagForReview.create({
            data: {
                userId: data.userId,
                module: data.module,
                reason: 'High risk content detected',
            },
        });
    }
}
