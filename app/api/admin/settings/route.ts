import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session?.user || (session.user as any).role !== 'CHURCH_ADMIN') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    try {
        const config = await (prisma as any).siteConfig?.findUnique?.({ where: { key: 'admin_settings' } }).catch(() => null);
        if (config?.value) {
            const data = { ...(config.value as any) };
            ['openaiApiKey', 'elevenLabsApiKey', 'stripeSecretKey', 'stripeWebhookSecret',
                'paypalClientSecret', 'coinbaseCommerceApiKey', 'bitpayApiKey', 'resendApiKey'].forEach(f => {
                    if (data[f]) data[f] = '••••••••' + String(data[f]).slice(-4);
                });
            return NextResponse.json(data);
        }
        return NextResponse.json({});
    } catch { return NextResponse.json({}); }
}

export async function POST(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session?.user || (session.user as any).role !== 'CHURCH_ADMIN') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const body = await req.json();
    // Strip masked values — don't overwrite real keys with placeholder display
    Object.keys(body).forEach(k => { if (typeof body[k] === 'string' && body[k].startsWith('••••')) delete body[k]; });
    try {
        await (prisma as any).siteConfig?.upsert?.({
            where: { key: 'admin_settings' },
            update: { value: body, updatedAt: new Date() },
            create: { key: 'admin_settings', value: body },
        }).catch(async () => {
            await prisma.auditLog.create({ data: { actorId: session.user.id, action: 'SETTINGS_UPDATE', entityType: 'SiteConfig', metadata: body } });
        });
        return NextResponse.json({ success: true });
    } catch { return NextResponse.json({ error: 'Save failed' }, { status: 500 }); }
}
