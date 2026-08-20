import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { authOptions } from '@/lib/auth';
import { ACTIVE_CHURCH_COOKIE, resolveChurchWorkspaceAccess } from '@/lib/church-ops/access';

const ActiveChurchSchema = z.object({
  churchId: z.string().trim().min(3),
});

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Request body must be valid JSON.' }, { status: 400 });
  }

  const parsed = ActiveChurchSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: 'A valid church workspace is required.' }, { status: 400 });

  try {
    const resolved = await resolveChurchWorkspaceAccess(session.user.id, parsed.data.churchId);
    if (!resolved.access) {
      return NextResponse.json({ error: 'You do not have access to that church workspace.' }, { status: 403 });
    }

    const response = NextResponse.json({ success: true, church: resolved.access });
    response.cookies.set({
      name: ACTIVE_CHURCH_COOKIE,
      value: resolved.access.id,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 30 * 24 * 60 * 60,
    });
    return response;
  } catch (error: any) {
    console.error('Active church workspace selection failed:', error?.message || error);
    return NextResponse.json({ error: 'Church workspace selection is unavailable.' }, { status: 503 });
  }
}

export async function DELETE() {
  const response = NextResponse.json({ success: true, cleared: true });
  response.cookies.set({
    name: ACTIVE_CHURCH_COOKIE,
    value: '',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });
  return response;
}
