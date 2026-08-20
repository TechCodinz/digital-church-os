import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma, checkDbConnection } from '@/lib/prisma';
import { AuditLogger } from '@/lib/audit/logger';
import { aiRateLimit, validateAIRequest } from '@/lib/ai-middleware';

const CARE_DISCLAIMER = `This AI provides spiritual encouragement and reflection only. It does not replace a pastor, licensed counselor, medical professional, emergency service, or safeguarding authority. If there is immediate danger, self-harm risk, abuse, or another urgent crisis, contact the appropriate local emergency/crisis service and a trusted person who can stay with you.`;

const crisisKeywords = [
  'suicide',
  'kill myself',
  'end my life',
  'want to die',
  'self-harm',
  'hurt myself',
  'immediate danger',
  'being abused',
  'someone will hurt me',
];

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const startTime = Date.now();
  let interactionId: string | null = null;

  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const limit = await aiRateLimit(req, session.user.id, { maxRequests: 8, windowMs: 60_000 });
    if (limit) return limit;

    const body = await req.json();
    const concern = typeof body?.concern === 'string' ? body.concern.trim() : '';
    const context = typeof body?.context === 'string' ? body.context.trim() : '';

    const inputError = validateAIRequest(concern, 'concern');
    if (inputError) return inputError;

    const lowerConcern = concern.toLowerCase();
    const isCrisis = crisisKeywords.some((keyword) => lowerConcern.includes(keyword));

    // Do not send an obvious crisis statement through a generative counseling flow.
    // The product should use a locale-aware crisis-resource layer at the UI edge.
    if (isCrisis) {
      await AuditLogger.log({
        actorId: session.user.id,
        action: 'CARE_CRISIS_HANDOFF',
        entityType: 'Counselor',
        metadata: {
          riskLevel: 'urgent',
          contentStored: false,
          route: '/api/ai/christian/care/counselor',
        },
        req,
      });

      return NextResponse.json({
        crisis: true,
        generatedCounselingSkipped: true,
        message: 'This sounds like something that needs immediate human support rather than an AI counseling response.',
        nextSteps: [
          'Contact the appropriate local emergency or crisis service for your location if there is immediate danger.',
          'Reach a trusted person who can stay with you or help you get to a safe place.',
          'Use the church care pathway for human pastoral follow-up when it is safe and appropriate.',
        ],
        carePath: '/care',
        disclaimer: CARE_DISCLAIMER,
      });
    }

    const isDbUp = await checkDbConnection();
    const { RealCounselor } = await import('@/lib/ai/christian/care/realCounselor');
    const counselor = new RealCounselor();

    if (isDbUp) {
      const aiModule = await prisma.aIModule.findFirst({ where: { type: 'CARE' } });
      if (aiModule) {
        const interaction = await prisma.aIInteraction.create({
          data: {
            moduleId: aiModule.id,
            userId: session.user.id,
            // Counseling content is intentionally not duplicated into the generic
            // AI interaction audit store. Purpose-built restricted records should
            // handle sensitive case content when the church enables them.
            input: {
              category: 'pastoral-care-reflection',
              contentStored: false,
              contextProvided: Boolean(context),
            },
            metadata: {
              privacyMode: 'sensitive-care',
              contentStored: false,
            },
          },
        });
        interactionId = interaction.id;
      }
    }

    const response = await counselor.processSession({
      userId: session.user.id,
      concern,
    });

    if (interactionId && isDbUp) {
      await prisma.aIInteraction.update({
        where: { id: interactionId },
        data: {
          output: {
            type: response.type || 'care-reflection',
            contentStored: false,
          },
          duration: Date.now() - startTime,
        },
      });
    }

    await AuditLogger.log({
      actorId: session.user.id,
      action: 'COUNSELING_SESSION',
      entityType: 'Counselor',
      entityId: interactionId || undefined,
      metadata: {
        riskLevel: response.type === 'crisis' ? 'high' : 'non-urgent',
        contentStored: false,
        duration: Date.now() - startTime,
      },
      req,
    });

    return NextResponse.json({
      ...response,
      advisoryOnly: true,
      sensitiveAuditContentStored: false,
      humanCareAvailable: true,
      disclaimer: CARE_DISCLAIMER,
    });
  } catch (error) {
    console.error('Counselor route error:', error);
    return NextResponse.json(
      {
        error: 'Failed to process care request',
        humanCareAvailable: true,
        carePath: '/care',
      },
      { status: 500 }
    );
  }
}
