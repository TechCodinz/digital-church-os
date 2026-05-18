import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma, checkDbConnection } from '@/lib/prisma';
import { AuditLogger } from '@/lib/audit/logger';

const CRISIS_DISCLAIMER = `
IMPORTANT: This AI provides spiritual encouragement and scripture - based reflection.
It is NOT a substitute for professional mental health care.

If you're experiencing:
    - Thoughts of self - harm: Call 988(Suicide & Crisis Lifeline)
        - Mental health crisis: Contact a licensed therapist
            - Abuse or danger: Call 911 immediately

Resources:
- National Suicide Prevention Lifeline: 988
    - Crisis Text Line: Text HOME to 741741
        - SAMHSA National Helpline: 1 - 800 - 662 - 4357
            `;

export async function POST(req: NextRequest) {
    const startTime = Date.now();
    let interactionId: string | null = null;

    try {
        const session = await getServerSession(authOptions);
        const isDbUp = await checkDbConnection();

        // Allow unauthenticated access if DB is down (demo mode)
        if (!session?.user && isDbUp) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { concern, context } = body;

        // Check for crisis keywords
        const crisisKeywords = [
            'suicide', 'kill myself', 'end my life', 'want to die',
            'self-harm', 'hurt myself', 'emergency', 'crisis'
        ];

        const isCrisis = crisisKeywords.some(keyword =>
            concern.toLowerCase().includes(keyword)
        );

        if (isCrisis) {
            return NextResponse.json({
                crisis: true,
                message: "I hear that you're going through a difficult time. Your wellbeing is important.",
                resources: {
                    emergency: "911",
                    suicidePrevention: "988",
                    crisisTextLine: "Text HOME to 741741",
                },
                disclaimer: CRISIS_DISCLAIMER,
                encouragement: "Please reach out to these professional resources immediately. They are trained to help.",
            });
        }

        const { RealCounselor } = await import('@/lib/ai/christian/care/realCounselor');
        const counselor = new RealCounselor();

        // 1. Detect Crisis (already done above, but keeping the structure for consistency with instruction)
        // const crisis = await counselor.detectCrisis(concern); // Assuming detectCrisis takes concern

        // 2. Log interaction start
        if (isDbUp && session?.user) {
            const aiModule = await prisma.aIModule.findFirst({
                where: { type: 'CARE' }
            });

            const interaction = await prisma.aIInteraction.create({
                data: {
                    moduleId: aiModule?.id || 'demo-care',
                    userId: session.user.id,
                    input: { message: concern, context },
                    metadata: { crisis: isCrisis }
                }
            });
            interactionId = interaction.id;
        }

        const response = await counselor.processSession({ userId: session?.user?.id || 'demo-user', concern });

        // 4. Update interaction
        if (interactionId && isDbUp) {
            await prisma.aIInteraction.update({
                where: { id: interactionId },
                data: {
                    output: response as any,
                    duration: Date.now() - startTime
                }
            });
        }

        await AuditLogger.log({
            actorId: session?.user?.id || 'demo-user',
            action: 'COUNSELING_SESSION',
            entityType: 'Counselor',
            metadata: { concern, context, riskLevel: response.type === 'crisis' ? 'high' : 'low' },
            req,
        });

        return NextResponse.json({
            ...response,
            disclaimer: CRISIS_DISCLAIMER,
        });
    } catch (error) {
        console.error('Error in counselor:', error);
        return NextResponse.json(
            { error: 'Failed to process request' },
            { status: 500 }
        );
    }
}
