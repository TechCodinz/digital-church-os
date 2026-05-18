import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { aiRateLimit, validateAIRequest } from "@/lib/ai-middleware";

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const rateLimitResponse = await aiRateLimit(req, session.user.id);
        if (rateLimitResponse) return rateLimitResponse;

        const { concern, context } = await req.json();

        const inputError = validateAIRequest(concern, 'concern');
        if (inputError) return inputError;

        const { RealCounselor } = await import('@/lib/ai/christian/care/realCounselor');
        const counselor = new RealCounselor();
        const response = await counselor.processSession({ userId: session.user.id, concern });

        return NextResponse.json(response);
    } catch (error) {
        console.error('Counselor error:', error);
        return NextResponse.json({ error: 'Counseling session failed' }, { status: 500 });
    }
}

