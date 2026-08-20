import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { TheologicalGuardrails } from '@/lib/ai/guardrails/theologicalGuardrails';
import { getClientKey, rateLimit, rateLimitHeaders } from '@/lib/security/rate-limit';

const PostSchema = z.object({
  title: z.string().trim().min(3).max(160),
  content: z.string().trim().min(10).max(5000),
  scriptureRef: z.string().trim().max(120).optional().transform((value) => value || undefined),
});

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Sign in is required to post.' }, { status: 401 });
  }

  const limit = rateLimit(`community-post:${session.user.id}:${getClientKey(req.headers)}`, {
    limit: 6,
    windowMs: 10 * 60 * 1000,
  });
  if (!limit.allowed) {
    return NextResponse.json(
      { error: 'Too many community posts in a short period. Please try again later.' },
      { status: 429, headers: rateLimitHeaders(limit) },
    );
  }

  try {
    const validation = PostSchema.safeParse(await req.json());
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Please review the post fields.', details: validation.error.flatten() },
        { status: 400, headers: rateLimitHeaders(limit) },
      );
    }

    const moderationResult = await moderateContent(validation.data.content);
    const post = await prisma.communityPost.create({
      data: {
        ...validation.data,
        userId: session.user.id,
        // Never silently rewrite someone's testimony or spiritual reflection.
        // If automated review wants to alter it, hold the original for human
        // moderation instead of auto-publishing transformed or unreviewed text.
        status: moderationResult.approved ? 'APPROVED' : 'PENDING',
      },
    });

    return NextResponse.json(
      {
        post,
        moderation: {
          approved: moderationResult.approved,
          reason: moderationResult.reason,
          humanReviewRequired: !moderationResult.approved,
        },
      },
      { status: 201, headers: rateLimitHeaders(limit) },
    );
  } catch (error) {
    console.error('Error creating post:', error);
    return NextResponse.json({ error: 'Failed to create post' }, { status: 500, headers: rateLimitHeaders(limit) });
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const parsedPage = Number.parseInt(searchParams.get('page') || '1', 10);
    const parsedLimit = Number.parseInt(searchParams.get('limit') || '20', 10);
    const page = Number.isFinite(parsedPage) ? Math.max(1, parsedPage) : 1;
    const limit = Number.isFinite(parsedLimit) ? Math.min(50, Math.max(1, parsedLimit)) : 20;
    const skip = (page - 1) * limit;

    const [posts, total] = await Promise.all([
      prisma.communityPost.findMany({
        where: { status: 'APPROVED' },
        include: {
          user: { select: { name: true, avatar: true } },
          comments: {
            include: { user: { select: { name: true, avatar: true } } },
            orderBy: { createdAt: 'desc' },
            take: 3,
          },
          _count: { select: { comments: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.communityPost.count({ where: { status: 'APPROVED' } }),
    ]);

    return NextResponse.json({
      posts,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error('Error fetching posts:', error);
    return NextResponse.json({ error: 'Failed to fetch posts' }, { status: 500 });
  }
}

async function moderateContent(content: string) {
  // Obvious spam markers stay in human review. This is intentionally not
  // presented as a comprehensive safety classifier.
  const obviousReviewMarkers = ['spam', 'scam'];
  if (obviousReviewMarkers.some((word) => content.toLowerCase().includes(word))) {
    return { approved: false, reason: 'Requires human moderation' };
  }

  // If provider-backed review is unavailable, fail closed to moderation rather
  // than publishing automatically.
  if (!process.env.OPENAI_API_KEY) {
    return { approved: false, reason: 'Automated review unavailable' };
  }

  try {
    const guardrails = new TheologicalGuardrails();
    const reviewedContent = await guardrails.apply(content);

    // The guardrail is allowed to identify a concern, but community speech is
    // never silently rewritten. Any attempted modification requires a person.
    if (reviewedContent !== content) {
      return { approved: false, reason: 'Automated review requested human moderation' };
    }

    return { approved: true, reason: null };
  } catch (error) {
    console.error('Community automated review failed:', error);
    return { approved: false, reason: 'Safety review unavailable' };
  }
}
