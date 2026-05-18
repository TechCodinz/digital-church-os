import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { getClientKey, rateLimit, rateLimitHeaders } from '@/lib/security/rate-limit';
import { AuditLogger } from '@/lib/audit/logger';

const RegisterSchema = z.object({
  name: z.string().trim().min(2).max(80).optional(),
  email: z.string().trim().email().max(180).transform((email) => email.toLowerCase()),
  password: z.string().min(8).max(128).regex(/[A-Za-z]/, 'Password must contain a letter').regex(/[0-9]/, 'Password must contain a number'),
});

export async function POST(req: NextRequest) {
  const limit = rateLimit(`register:${getClientKey(req.headers)}`, { limit: 8, windowMs: 15 * 60 * 1000 });
  if (!limit.allowed) {
    return NextResponse.json({ message: 'Too many registration attempts. Please wait before trying again.' }, { status: 429, headers: rateLimitHeaders(limit) });
  }

  try {
    const payload = await req.json();
    const parsed = RegisterSchema.safeParse(payload);

    if (!parsed.success) {
      return NextResponse.json({ message: 'Invalid registration details', details: parsed.error.flatten() }, { status: 400, headers: rateLimitHeaders(limit) });
    }

    const { email, password, name } = parsed.data;
    const existingUser = await prisma.user.findUnique({ where: { email }, select: { id: true } });

    if (existingUser) {
      return NextResponse.json({ message: 'User with this email already exists' }, { status: 409, headers: rateLimitHeaders(limit) });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const newUser = await prisma.user.create({
      data: {
        email,
        name: name || email.split('@')[0],
        passwordHash,
        role: 'MEMBER',
        faithPreference: 'Christian',
      },
      select: { id: true, email: true },
    });

    await AuditLogger.log({
      actorId: newUser.id,
      action: 'USER_REGISTERED',
      entityType: 'User',
      entityId: newUser.id,
      metadata: { email: newUser.email },
      req,
    });

    return NextResponse.json({ message: 'User created successfully', userId: newUser.id }, { status: 201, headers: rateLimitHeaders(limit) });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500, headers: rateLimitHeaders(limit) });
  }
}
