import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma, checkDbConnection } from '@/lib/prisma';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

const ConferenceSchema = z.object({
  title: z.string().min(3),
  theme: z.string().min(3),
  scriptureRefs: z.array(z.string()),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  virtualRoomLink: z.string().url().optional(),
  maxAttendees: z.number().optional(),
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

    const conference = await prisma.conference.create({
      data: {
        ...validation.data,
        startDate: new Date(validation.data.startDate),
        endDate: new Date(validation.data.endDate),
        status: 'UPCOMING',
      },
    });

    return NextResponse.json(conference);
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
      // Demo Data Fallback
      const demoConferences = [
        {
          id: 'demo-1',
          title: 'The Awakening Conference 2026',
          theme: 'Revival in the Digital Age',
          startDate: new Date(Date.now() + 86400000).toISOString(),
          endDate: new Date(Date.now() + 172800000).toISOString(),
          status: 'UPCOMING',
          virtualRoomLink: 'https://zoom.us/demo',
          attendees: []
        },
        {
          id: 'demo-2',
          title: 'Gospel & Tech Summit',
          theme: 'Equipping the Next Generation',
          startDate: new Date(Date.now() + 604800000).toISOString(),
          endDate: new Date(Date.now() + 691200000).toISOString(),
          status: 'UPCOMING',
          virtualRoomLink: 'https://meet.google.com/demo',
          attendees: []
        }
      ];

      if (upcoming) {
        return NextResponse.json(demoConferences);
      }

      if (status) {
        return NextResponse.json(demoConferences.filter(c => c.status === status));
      }

      return NextResponse.json(demoConferences);
    }

    const where: any = {};

    if (status) {
      where.status = status;
    }

    if (upcoming) {
      where.startDate = { gte: new Date() };
      where.status = 'UPCOMING';
    }

    const conferences = await prisma.conference.findMany({
      where,
      include: {
        attendees: {
          select: {
            userId: true,
            attended: true,
          },
        },
      },
      orderBy: { startDate: 'asc' },
    });

    return NextResponse.json(conferences);
  } catch (error) {
    console.error('Error fetching conferences:', error);
    return NextResponse.json({ error: 'Failed to fetch conferences' }, { status: 500 });
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

    await prisma.conference.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting conference:', error);
    return NextResponse.json({ error: 'Failed to delete conference' }, { status: 500 });
  }
}

