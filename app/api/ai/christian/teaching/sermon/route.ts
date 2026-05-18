import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { authOptions } from '@/lib/auth';
import { prisma, checkDbConnection } from '@/lib/prisma';
import { AuditLogger } from '@/lib/audit/logger';
import { CHRISTIAN_GUARDRAILS, AI_DISCLAIMER } from '@/lib/ai/shared/guardrails';
import { MediaGenerator } from '@/lib/ai/visual/mediaGenerator';
import { aiRateLimit } from '@/lib/ai-middleware';

const SermonRequestSchema = z.object({
  theme: z.string().trim().min(3).max(180),
  scriptureRefs: z.array(z.string().trim().min(2).max(80)).max(12).optional().default([]),
  style: z.enum(['expository', 'topical', 'narrative']).optional().default('expository'),
  conferenceId: z.string().trim().optional(),
});

async function getOrCreateTeachingModule() {
  let religion = await prisma.religion.findUnique({ where: { name: 'Christianity' } });
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

  const existing = await prisma.aIModule.findFirst({
    where: {
      name: 'Christian Teaching Module',
      type: 'TEACHING',
      religionId: religion.id,
    },
  });

  if (existing) return existing;

  return prisma.aIModule.create({
    data: {
      name: 'Christian Teaching Module',
      type: 'TEACHING',
      religionId: religion.id,
      version: '1.1.0',
      config: {
        guardrails: CHRISTIAN_GUARDRAILS,
        disclaimer: AI_DISCLAIMER,
      },
    },
  });
}

export async function POST(req: NextRequest) {
  const startTime = Date.now();
  let interactionId: string | null = null;

  try {
    const session = await getServerSession(authOptions);
    const isDbUp = await checkDbConnection();

    const limitResponse = await aiRateLimit(req, session?.user?.id, { maxRequests: session?.user ? 12 : 3, windowMs: 60_000 });
    if (limitResponse) return limitResponse;

    if (!session?.user && isDbUp) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const parsed = SermonRequestSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid sermon payload', details: parsed.error.flatten() }, { status: 400 });
    }

    const { theme, scriptureRefs, style, conferenceId } = parsed.data;
    let aiModuleId: string | null = null;

    if (isDbUp && session?.user) {
      try {
        const aiModule = await getOrCreateTeachingModule();
        aiModuleId = aiModule.id;
        const interaction = await prisma.aIInteraction.create({
          data: {
            moduleId: aiModule.id,
            userId: session.user.id,
            input: parsed.data,
            metadata: {
              model: process.env.OPENAI_API_KEY ? 'gpt-4o-mini' : 'safe-fallback',
              temperature: 0.65,
              route: '/api/ai/christian/teaching/sermon',
            },
          },
        });
        interactionId = interaction.id;
      } catch (interactionError) {
        console.error('Failed to create sermon interaction log:', interactionError);
      }
    }

    const { RealSermonEngine } = await import('@/lib/ai/christian/teaching/realSermonEngine');
    const sermonEngine = new RealSermonEngine();
    const sermon = await sermonEngine.generateSermon({
      theme,
      scriptureRefs,
      style,
      userId: session?.user?.id || 'demo-user',
    });

    const mediaGen = new MediaGenerator();
    const [imageUrl, videoUrl] = await Promise.all([
      mediaGen.generateImage(`${theme} ${scriptureRefs[0] || ''}`.trim()),
      mediaGen.getBackgroundVideo(theme),
    ]);

    sermon.visuals = { image: imageUrl, video: videoUrl };

    if (conferenceId && isDbUp && session?.user) {
      try {
        const religion = await prisma.religion.findUnique({ where: { name: 'Christianity' } });
        if (religion) {
          await prisma.sermon.create({
            data: {
              title: sermon.title,
              outline: sermon.outline as any,
              scriptureRefs: sermon.scriptureRefs,
              theme: sermon.theme,
              content: sermon.fullSermon || '',
              religionId: religion.id,
              createdBy: session.user.id,
              conferenceId,
            },
          });
        }
      } catch (storageError) {
        console.error('Failed to save conference sermon:', storageError);
      }
    }

    if (interactionId && isDbUp) {
      try {
        await prisma.aIInteraction.update({
          where: { id: interactionId },
          data: {
            output: sermon as any,
            duration: Date.now() - startTime,
          },
        });
      } catch (updateError) {
        console.error('Failed to update sermon interaction log:', updateError);
      }
    }

    if (isDbUp) {
      await AuditLogger.log({
        actorId: session?.user?.id,
        action: 'SERMON_GENERATION',
        entityType: 'AIInteraction',
        entityId: interactionId || undefined,
        metadata: {
          module: 'sermon',
          theme,
          scriptureRefs,
          duration: Date.now() - startTime,
          aiModuleId,
        },
        aiInteractionId: interactionId || undefined,
        req,
      });
    }

    return NextResponse.json({
      ...sermon,
      disclaimer: AI_DISCLAIMER,
      interactionId,
      safeMode: !process.env.OPENAI_API_KEY,
    });
  } catch (error: any) {
    console.error('Error in sermon generation:', error);

    if (interactionId) {
      try {
        await prisma.aIInteraction.update({
          where: { id: interactionId },
          data: {
            output: { error: error.message || 'Unknown sermon error' },
            duration: Date.now() - startTime,
          },
        });
      } catch (logError) {
        console.error('Failed to log sermon error:', logError);
      }
    }

    return NextResponse.json({ error: 'Failed to generate sermon' }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    module: 'Christian Teaching Module - Sermon Engine',
    version: '1.1.0',
    capabilities: [
      'Generate weekly sermon outlines',
      'Expository, topical, and narrative sermons',
      'Conference sermon mode',
      'Scripture-based teaching',
      'Safe fallback mode when AI keys are unavailable',
    ],
    safeMode: !process.env.OPENAI_API_KEY,
    guardrails: CHRISTIAN_GUARDRAILS,
    disclaimer: AI_DISCLAIMER,
  });
}
