import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma, checkDbConnection } from '@/lib/prisma';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

const ConferenceSchema = z.object({
  title: z.string().min(3).max(180),
  theme: z.string().min(3).max(240),
  scriptureRefs: z.array(z.string().max(80)).max(20),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  virtualRoomLink: z.string().url().optional(),
  maxAttendees: z.number().int().positive().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== 'CHURCH_ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const validation = ConferenceSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ errors: validation.error.errors }, { status: 400 });
    }

    const startDate = new Date(validation.data.startDate);
    const endDate = new Date(validation.data.endDate);
    if (endDate <= startDate) {
      return NextResponse.json({ error: 'Conference end time must be after the start time.' }, { status: 400 });
    }

    const conference = await prisma.conference.create({
      data: {
        ...validation.data,
        startDate,
        endDate,
        status: 'UPCOMING',
      },
    });

    return NextResponse.json(conference, { status: 201 });
  } catch (error) {
    console.error('Error creating conference:', error);
    return NextResponse.json({ error: 'Failed to create conference' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status') as any;
    const upcoming = searchParams.get('upcoming') === 'true';

    const isDbUp = await checkDbConnection();
    if (!isDbUp) {
      return NextResponse.json([], {
        headers: {
          'Cache-Control': 'no-store, max-age=0',
          'X-Conference-Source': 'database-unavailable',
        },
      });
    }

    const where: any = {};
    if (status) where.status = status;
    if (upcoming) {
      where.startDate = { gte: new Date() };
      where.status = 'UPCOMING';
    }

    const conferences = await prisma.conference.findMany({
      where,
      include: {
        attendees: {
          select: { userId: true, attended: true },
        },
      },
      orderBy: { startDate: 'asc' },
    });

    return NextResponse.json(conferences, {
      headers: {
        'Cache-Control': 'no-store, max-age=0',
        'X-Conference-Source': 'database',
      },
    });
  } catch (error) {
    console.error('Error fetching conferences:', error);
    return NextResponse.json([], {
      headers: {
        'Cache-Control': 'no-store, max-age=0',
        'X-Conference-Source': 'error',
      },
    });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== 'CHURCH_ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Conference ID required' }, { status: 400 });
    }

    await prisma.conference.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting conference:', error);
    return NextResponse.json({ error: 'Failed to delete conference' }, { status: 500 });
  }
}
