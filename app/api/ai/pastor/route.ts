import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma, checkDbConnection } from '@/lib/prisma';
import { aiRateLimit, validateAIRequest } from '@/lib/ai-middleware';
import { MediaGenerator } from '@/lib/ai/visual/mediaGenerator';

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        const isDbUp = await checkDbConnection();

        // Rate limit: 20/min per user, 5/min anonymous
        const rateLimitResponse = await aiRateLimit(req, session?.user?.id);
        if (rateLimitResponse) return rateLimitResponse;

        if (!session?.user && isDbUp) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { input } = await req.json();

        // Validate input before calling OpenAI
        const inputError = validateAIRequest(input, 'message');
        if (inputError) return inputError;

        // Ensure an AI Module for 'PASTOR' exists
        let module = null;
        if (isDbUp) {
            module = await prisma.aIModule.findFirst({
                where: { type: 'ADMIN', name: 'AI Pastor' }
            });

            if (!module) {
                const religion = await prisma.religion.findFirst();
                if (religion) {
                    module = await prisma.aIModule.create({
                        data: {
                            name: 'AI Pastor',
                            type: 'ADMIN',
                            religionId: religion.id,
                            version: '1.0.0',
                            config: {},
                        }
                    });
                }
            }
        }

        const { RealCounselor } = await import('@/lib/ai/christian/care/realCounselor');
        const counselor = new RealCounselor();
        const response: any = await counselor.processSession({
            userId: session?.user?.id || 'demo-user',
            concern: input
        });

        // Generate counseling visuals in parallel
        const themeToSearch = response.themes?.[0] || 'comforting christian guidance';
        const mediaGen = new MediaGenerator();
        const [imageUrl, videoUrl] = await Promise.all([
            mediaGen.generateImage(`Christian counseling, conveying: ${themeToSearch}`),
            mediaGen.getBackgroundVideo(themeToSearch)
        ]);

        response.visuals = { image: imageUrl, video: videoUrl };

        if (isDbUp && session?.user) {
            const interaction = await prisma.aIInteraction.create({
                data: {
                    moduleId: module?.id || 'demo-pastor',
                    userId: session.user.id,
                    input: { message: input },
                    output: response as any,
                    metadata: { type: response.type }
                }
            });

            // Return the live response (with visuals) not the serialized DB object
            return NextResponse.json({
                response,
                interactionId: interaction.id,
                timestamp: interaction.createdAt
            });
        }

        return NextResponse.json({
            response,
            interactionId: 'demo-mode',
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('AI Pastor Error:', error);
        return NextResponse.json({ error: 'Failed to process interaction' }, { status: 500 });
    }
}

export async function GET() {
    return NextResponse.json({
        status: 'active',
        capabilities: ['scripture guidance', 'spiritual counsel', 'prayer support']
    });
}
