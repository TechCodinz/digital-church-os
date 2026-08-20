import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma, checkDbConnection } from '@/lib/prisma';
import { AuditLogger } from '@/lib/audit/logger';
import { validateAIInput, CHRISTIAN_GUARDRAILS, AI_DISCLAIMER } from '@/lib/ai/shared/guardrails';
import { SermonEngine } from '@/lib/ai/christian/teaching/sermonEngine';
import { MediaGenerator } from '@/lib/ai/visual/mediaGenerator';

export async function POST(req: NextRequest) {
    const startTime = Date.now();
    let interactionId: string | null = null;

    try {
        const session = await getServerSession(authOptions);
        const isDbUp = await checkDbConnection();

        if (!session?.user && isDbUp) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { theme, style, conferenceId } = body;
        // Default to an empty list so the route is robust when scriptureRefs is omitted.
        const scriptureRefs: string[] = Array.isArray(body.scriptureRefs) ? body.scriptureRefs : [];

        // Validate input
        const validation = validateAIInput(body, 'sermon');
        if (!validation.valid) {
            return NextResponse.json({ errors: validation.errors }, { status: 400 });
        }

        // Get or create AI module record
        let aiModule = null;
        if (isDbUp) {
            aiModule = await prisma.aIModule.findFirst({
                where: {
                    name: 'Christian Teaching Module',
                    type: 'TEACHING',
                    religion: {
                        name: 'Christianity',
                    },
                },
            });

            if (!aiModule) {
                const religion = await prisma.religion.findUnique({
                    where: { name: 'Christianity' },
                });

                if (religion) {
                    aiModule = await prisma.aIModule.create({
                        data: {
                            name: 'Christian Teaching Module',
                            type: 'TEACHING',
                            religionId: religion.id,
                            version: '1.0.0',
                            config: {
                                guardrails: CHRISTIAN_GUARDRAILS,
                                disclaimer: AI_DISCLAIMER,
                            },
                        },
                    });
                }
            }
        }

        // Log interaction start
        if (isDbUp && session?.user) {
            const interaction = await prisma.aIInteraction.create({
                data: {
                    moduleId: aiModule?.id || 'demo-module',
                    userId: session.user.id,
                    input: body,
                    metadata: {
                        model: 'gpt-4',
                        temperature: 0.7,
                    },
                },
            });
            interactionId = interaction.id;
        }

        // Generate sermon outline
        const { RealSermonEngine } = await import('@/lib/ai/christian/teaching/realSermonEngine');
        const sermonEngine = new RealSermonEngine();
        const sermon = await sermonEngine.generateSermon({
            theme,
            scriptureRefs,
            style: style || 'expository',
            userId: session?.user?.id || 'demo-user',
        });

        // Generate visuals alongside the sermon in parallel
        const mediaGen = new MediaGenerator();
        const [imageUrl, videoUrl] = await Promise.all([
            mediaGen.generateImage(theme + ' ' + (scriptureRefs[0] || '')),
            mediaGen.getBackgroundVideo(theme)
        ]);

        // Attach media to response
        sermon.visuals = { image: imageUrl, video: videoUrl };

        // If conference mode, store sermon
        if (conferenceId && isDbUp && session?.user) {
            await prisma.sermon.create({
                data: {
                    title: sermon.title,
                    outline: sermon.outline as any,
                    scriptureRefs: sermon.scriptureRefs,
                    theme: sermon.theme,
                    content: sermon.fullSermon || '',
                    religion: {
                        connect: { name: 'Christianity' },
                    },
                    creator: {
                        connect: { id: session.user.id },
                    },
                    conferenceId,
                },
            });
        }

        // Update interaction with output
        if (interactionId && isDbUp) {
            await prisma.aIInteraction.update({
                where: { id: interactionId },
                data: {
                    output: sermon as any,
                    duration: Date.now() - startTime,
                },
            });
        }

        // Audit log
        if (isDbUp) {
            await AuditLogger.log({
                actorId: session?.user?.id,
                action: 'AI_INTERACTION',
                entityType: 'AIInteraction',
                entityId: interactionId || undefined,
                metadata: {
                    module: 'sermon',
                    theme,
                    scriptureRefs,
                    duration: Date.now() - startTime,
                },
                aiInteractionId: interactionId || undefined,
                req,
            });
        }

        // Add disclaimer
        return NextResponse.json({
            ...sermon,
            disclaimer: AI_DISCLAIMER,
            interactionId,
        });
    } catch (error: any) {
        console.error('Error in sermon generation:', error);

        // Log error
        if (interactionId) {
            await prisma.aIInteraction.update({
                where: { id: interactionId },
                data: {
                    output: { error: error.message },
                    duration: Date.now() - startTime,
                },
            });
        }

        return NextResponse.json(
            { error: 'Failed to generate sermon' },
            { status: 500 }
        );
    }
}

export async function GET() {
    return NextResponse.json({
        module: 'Christian Teaching Module - Sermon Engine',
        version: '1.0.0',
        capabilities: [
            'Generate weekly sermon outlines',
            'Expository and topical sermons',
            'Conference sermon mode',
            'Scripture-based teaching',
        ],
        guardrails: CHRISTIAN_GUARDRAILS,
        disclaimer: AI_DISCLAIMER,
    });
}
