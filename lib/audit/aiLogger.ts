import { prisma } from '@/lib/prisma';

interface AIInteractionLog {
  userId: string;
  module: string;
  input: unknown;
  output: unknown;
  duration?: number;
  model?: string;
  tokens?: number;
  cost?: number;
}

const REDACTED_COUNSELING_CONCERN = '[REDACTED: sensitive counseling content is not stored in the generic audit log]';

export class AILogger {
  static async logInteraction(data: AIInteractionLog) {
    try {
      const interaction = await prisma.aIInteraction.create({
        data: {
          userId: data.userId,
          moduleId: data.module,
          input: JSON.parse(JSON.stringify(data.input)),
          output: JSON.parse(JSON.stringify(data.output)),
          metadata: {
            duration: data.duration,
            model: data.model,
            tokens: data.tokens,
            cost: data.cost,
          },
        },
      });

      if (data.cost) {
        await prisma.aICost.create({
          data: {
            userId: data.userId,
            module: data.module,
            cost: data.cost,
          },
        });
      }

      if (this.isHighRiskInteraction(data)) {
        await this.flagForReview(data);
      }

      return interaction;
    } catch (error) {
      console.error('Failed to log AI interaction:', error);
      return null;
    }
  }

  static async logCounselingSession(data: {
    userId: string;
    concern: string;
    riskLevel: 'low' | 'medium' | 'high';
    responseType: string;
  }) {
    try {
      // CounselingLog.concern is currently required by the legacy schema. Store a
      // deliberate redaction marker rather than duplicating sensitive user text
      // into a general-purpose audit table. A future restricted care-record model
      // can handle explicit-consent case notes with dedicated retention controls.
      await prisma.counselingLog.create({
        data: {
          userId: data.userId,
          concern: REDACTED_COUNSELING_CONCERN,
          riskLevel: data.riskLevel,
          responseType: data.responseType,
        },
      });

      if (data.riskLevel === 'high') {
        await prisma.flagForReview.create({
          data: {
            userId: data.userId,
            module: 'AI Pastor',
            reason: 'High-risk care interaction detected; sensitive content was not copied into the review flag.',
          },
        });
      }
    } catch (error) {
      console.error('Failed to log counseling session:', error);
    }
  }

  private static isHighRiskInteraction(data: AIInteractionLog): boolean {
    const inputStr = JSON.stringify(data.input).toLowerCase();
    return inputStr.includes('suicide') || inputStr.includes('self-harm') || inputStr.includes('kill myself');
  }

  private static async flagForReview(data: AIInteractionLog) {
    try {
      await prisma.flagForReview.create({
        data: {
          userId: data.userId,
          module: data.module,
          reason: 'High risk content detected',
        },
      });
    } catch (error) {
      console.error('Failed to flag AI interaction for review:', error);
    }
  }
}
