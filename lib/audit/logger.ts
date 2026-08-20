import { prisma } from '@/lib/prisma';
import { NextRequest } from 'next/server';

function getClientIp(req?: NextRequest) {
  if (!req) return undefined;

  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0]?.trim();

  return (
    req.headers.get('x-real-ip') ||
    req.headers.get('cf-connecting-ip') ||
    req.headers.get('fly-client-ip') ||
    undefined
  );
}

function serializeForJson(value: unknown) {
  if (value === undefined) return undefined;
  return JSON.parse(JSON.stringify(value));
}

export class AuditLogger {
  static async log(params: {
    actorId?: string;
    action: string;
    entityType: string;
    entityId?: string;
    changes?: unknown;
    metadata?: unknown;
    aiInteractionId?: string;
    req?: NextRequest;
  }) {
    try {
      const {
        actorId,
        action,
        entityType,
        entityId,
        changes,
        metadata,
        aiInteractionId,
        req,
      } = params;

      await prisma.auditLog.create({
        data: {
          actorId,
          action,
          entityType,
          entityId,
          changes: serializeForJson(changes),
          metadata: serializeForJson(metadata),
          aiInteractionId,
          ipAddress: getClientIp(req),
        },
      });
    } catch (error) {
      console.error('Failed to create audit log:', error);
    }
  }

  static async getInteractionTrace(interactionId: string) {
    return prisma.aIInteraction.findUnique({
      where: { id: interactionId },
      include: {
        module: true,
        user: {
          select: { id: true, email: true, name: true },
        },
        auditLogs: true,
      },
    });
  }

  static async getUserInteractions(userId: string, days: number = 30) {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);

    return prisma.aIInteraction.findMany({
      where: {
        userId,
        createdAt: { gte: cutoff },
      },
      include: {
        module: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }
}
