import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma, checkDbConnection } from '@/lib/prisma';
import { aiRateLimit, validateAIRequest } from '@/lib/ai-middleware';
import { MediaGenerator } from '@/lib/ai/visual/mediaGenerator';
import { AuditLogger } from '@/lib/audit/logger';

async function getOrCreatePastorModule() {
  const module = await prisma.aIModule.findFirst({
    where: { type: 'CARE', name: 'AI Pastor' },
  });
  if (module) return module;

  let religion = await prisma.religion.findFirst({ where: { name: 'Christianity' } });
  if (!religion) {
    religion = await prisma.religion.create({
      data: {
        name: 'Christianity',
        description: 'Christian faith community configuration.',
        primaryText: 'Bible',
        active: true,
      },
    });
  }

  return prisma.aIModule.create({
    data: {
      name: 'AI Pastor',
      type: 'CARE',
      religionId: religion.id,
      version: '1.1.0',
      config: {
        crisisAware: true,
        disclaimer: 'Spiritual support only; does not replace clergy, medical care, licensed counseling, or emergency services.',
      },
    },
  });
}

export async function POST(req: NextRequest) {
  const startTime = Date.now();

  try {
    const session = await getServerSession(authOptions);
    const isDbUp = await checkDbConnection();

    const rateLimitResponse = await aiRateLimit(req, session?.user?.id);
    if (rateLimitResponse) return rateLimitResponse;

    if (!session?.user && isDbUp) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { input } = await req.json();
    const inputError = validateAIRequest(input, 'message');
    if (inputError) return inputError;

    const { RealCounselor } = await import('@/lib/ai/christian/care/realCounselor');
    const counselor = new RealCounselor();
    const response: any = await counselor.processSession({
      userId: session?.user?.id || 'demo-user',
      concern: input,
    });

    const themeToSearch = response.content?.scriptures?.[0]?.reference || response.type || 'comforting christian guidance';
    const mediaGen = new MediaGenerator();
    const [imageUrl, videoUrl] = await Promise.all([
      mediaGen.generateImage(`Christian pastoral care: ${themeToSearch}`),
      mediaGen.getBackgroundVideo(themeToSearch),
    ]);

    response.visuals = { image: imageUrl, video: videoUrl };

    let interactionId: string | null = null;
    let timestamp: Date | string = new Date().toISOString();

    if (isDbUp && session?.user) {
      try {
        const module = await getOrCreatePastorModule();
        const interaction = await prisma.aIInteraction.create({
          data: {
            moduleId: module.id,
            userId: session.user.id,
            input: { message: input },
            output: response as any,
            duration: Date.now() - startTime,
            metadata: { type: response.type, route: '/api/ai/pastor' },
          },
        });
        interactionId = interaction.id;
        timestamp = interaction.createdAt;

        await AuditLogger.log({
          actorId: session.user.id,
          action: 'AI_PASTOR_INTERACTION',
          entityType: 'AIInteraction',
          entityId: interaction.id,
          metadata: { type: response.type, duration: Date.now() - startTime },
          aiInteractionId: interaction.id,
          req,
        });
      } catch (logError) {
        console.error('AI Pastor interaction logging failed:', logError);
      }
    }

    return NextResponse.json({
      response,
      interactionId: interactionId || 'unlogged-safe-mode',
      timestamp,
    });
  } catch (error) {
    console.error('AI Pastor Error:', error);
    return NextResponse.json({ error: 'Failed to process interaction' }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    status: 'active',
    module: 'AI Pastor',
    capabilities: ['scripture-aware guidance', 'spiritual counsel', 'prayer support', 'crisis-aware safe handoff'],
    safeMode: !process.env.OPENAI_API_KEY,
  });
}
