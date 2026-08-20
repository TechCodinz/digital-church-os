import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
    const healthcheck: any = {
        uptime: process.uptime(),
        timestamp: Date.now(),
        status: 'healthy',
        services: {
            database: 'unknown',
            storage: 'unknown',
        },
    };

    try {
        // Check database
        await prisma.$queryRaw`SELECT 1`;
        healthcheck.services.database = 'healthy';
    } catch (error) {
        console.error('Database health check failed:', error);
        healthcheck.services.database = 'unhealthy';
        healthcheck.status = 'degraded';
    }

    return NextResponse.json(healthcheck, {
        status: healthcheck.status === 'healthy' ? 200 : 503,
    });
}
