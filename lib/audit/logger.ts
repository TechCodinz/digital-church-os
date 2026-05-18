import { prisma } from '@/lib/prisma';
import { NextRequest } from 'next/server';

export class AuditLogger {
    static async log(params: {
        actorId?: string;
        action: string;
        entityType: string;
        entityId?: string;
        changes?: any;
        metadata?: any;
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
                    changes: changes ? JSON.parse(JSON.stringify(changes)) : undefined,
                    metadata: metadata ? JSON.parse(JSON.stringify(metadata)) : undefined,
                    aiInteractionId,
                    ipAddress: req?.ip || req?.headers.get('x-forwarded-for'),

                },
            });
        } catch (error) {
            console.error('Failed to create audit log:', error);
            // Don't throw - logging should not break the main flow
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
