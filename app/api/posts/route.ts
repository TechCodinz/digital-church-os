import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { TheologicalGuardrails } from '@/lib/ai/guardrails/theologicalGuardrails';

const PostSchema = z.object({
  title: z.string().min(3).max(100),
  content: z.string().min(10).max(5000),
  scriptureRef: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const validation = PostSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ errors: validation.error.errors }, { status: 400 });
    }

    // Auto-moderate content. Provider-dependent moderation is constructed only
    // during the request so missing deployment credentials cannot break builds.
    const moderationResult = await moderateContent(validation.data.content);

    const post = await prisma.communityPost.create({
      data: {
        ...validation.data,
        userId: session.user.id,
        status: moderationResult.approved ? 'APPROVED' : 'PENDING',
      },
    });

    // If auto-approved, send notification
    if (moderationResult.approved) {
      // Notify community
    }

    return NextResponse.json({
      post,
      moderation: moderationResult,
    });
  } catch (error) {
    console.error('Error creating post:', error);
    return NextResponse.json({ error: 'Failed to create post' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;

    const [posts, total] = await Promise.all([
      prisma.communityPost.findMany({
        where: { status: 'APPROVED' },
        include: {
          user: {
            select: {
              name: true,
              avatar: true,
            },
          },
          comments: {
            include: {
              user: {
                select: {
                  name: true,
                  avatar: true,
                },
              },
            },
            orderBy: { createdAt: 'desc' },
            take: 3,
          },
          _count: {
            select: { comments: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.communityPost.count({
        where: { status: 'APPROVED' },
      }),
    ]);

    return NextResponse.json({
      posts,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching posts:', error);
    return NextResponse.json({ error: 'Failed to fetch posts' }, { status: 500 });
  }
}

async function moderateContent(content: string) {
  // 1. Basic prohibited word check
  const prohibited = ['spam', 'scam', 'inappropriate', 'offensive'];
  const hasProhibited = prohibited.some(word => content.toLowerCase().includes(word));

  if (hasProhibited) {
    return {
      approved: false,
      reason: 'Contains prohibited content',
      safeContent: content,
    };
  }

  // 2. Provider-backed theological guardrails. If the deployment has no AI
  // credential, fail closed to manual review rather than failing the app build.
  if (!process.env.OPENAI_API_KEY) {
    return {
      approved: false,
      reason: 'Automated safety review unavailable',
      safeContent: content,
    };
  }

  try {
    const guardrails = new TheologicalGuardrails();
    const safeContent = await guardrails.apply(content);
    const isModified = safeContent !== content;

    return {
      approved: true,
      reason: isModified ? 'Theologically refined' : null,
      safeContent,
    };
  } catch (error) {
    console.error('Moderation AI error:', error);
    return {
      approved: false,
      reason: 'Safety check failed',
      safeContent: content,
    };
  }
}
