import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { checkDbConnection } from "@/lib/prisma";

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        const isDbUp = await checkDbConnection();
        if (!session?.user && isDbUp) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { reference, theme } = await req.json();
        const { RealScriptureReader } = await import('@/lib/ai/christian/teaching/realScriptureReader');
        const reader = new RealScriptureReader();

        if (reference) {
            const reading = await reader.readScripture(reference);
            return NextResponse.json({ readings: [reading] });
        }

        if (theme) {
            const readings = await reader.getThemedVerses(theme);
            return NextResponse.json({ readings });
        }

        return NextResponse.json({ error: 'Missing reference or theme' }, { status: 400 });
    } catch (error) {
        return NextResponse.json({ error: 'Scripture reading failed' }, { status: 500 });
    }
}
