import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { Prisma } from '@prisma/client';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { AuditLogger } from '@/lib/audit/logger';

const SiteSchema = z.object({
  name: z.string().trim().min(3).max(120),
  slug: z.string().trim().min(3).max(80).regex(/^[a-z0-9-]+$/),
  customDomain: z.string().trim().max(180).optional(),
  theme: z.record(z.any()).optional().default({}),
  createDefaultPages: z.boolean().optional().default(true),
});

const defaultPages = [
  { title: 'Home', slug: 'home', type: 'HOME', content: { sections: ['Hero', 'Upcoming Service', 'Latest Sermon', 'Prayer CTA', 'Giving CTA'] } },
  { title: 'About', slug: 'about', type: 'ABOUT', content: { sections: ['Mission', 'Pastor', 'Beliefs', 'Team'] } },
  { title: 'Service Times', slug: 'service-times', type: 'SERVICES', content: { sections: ['Weekly Services', 'Location', 'Online Service'] } },
  { title: 'Sermons', slug: 'sermons', type: 'SERMONS', content: { integration: '/sermons' } },
  { title: 'Events', slug: 'events', type: 'EVENTS', content: { integration: '/conferences' } },
  { title: 'Giving', slug: 'giving', type: 'GIVING', content: { integration: '/offering' } },
  { title: 'Prayer Request', slug: 'prayer-request', type: 'PRAYER', content: { integration: '/prayer-room' } },
  { title: 'Contact', slug: 'contact', type: 'CONTACT', content: { sections: ['Contact Form', 'Map', 'Office Hours'] } },
];

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const parsed = SiteSchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: 'Invalid site payload', details: parsed.error.flatten() }, { status: 400 });

  try {
    const data = parsed.data;
    const siteRows = await prisma.$queryRaw<Array<Record<string, any>>>(Prisma.sql`
      INSERT INTO church_sites (owner_id, name, slug, custom_domain, theme, status)
      VALUES (${session.user.id}, ${data.name}, ${data.slug}, ${data.customDomain || null}, ${JSON.stringify(data.theme)}::jsonb, 'DRAFT')
      RETURNING id, owner_id, name, slug, custom_domain, theme, status, created_at, updated_at
    `);
    const site = siteRows[0];

    if (data.createDefaultPages) {
      for (const page of defaultPages) {
        await prisma.$executeRaw(Prisma.sql`
          INSERT INTO church_site_pages (site_id, title, slug, type, content, published)
          VALUES (${site.id}, ${page.title}, ${page.slug}, ${page.type}, ${JSON.stringify(page.content)}::jsonb, false)
          ON CONFLICT (site_id, slug) DO NOTHING
        `);
      }
    }

    const pages = await prisma.$queryRaw<Array<Record<string, any>>>(Prisma.sql`
      SELECT id, title, slug, type, content, published, updated_at
      FROM church_site_pages
      WHERE site_id = ${site.id}
      ORDER BY slug ASC
    `);

    await AuditLogger.log({ actorId: session.user.id, action: 'CHURCH_SITE_CREATED', entityType: 'church_sites', entityId: site.id, metadata: { slug: site.slug }, req });

    return NextResponse.json({ site, pages }, { status: 201 });
  } catch (error: any) {
    console.error('Website builder site creation failed:', error);
    const message = error?.message?.includes('unique') ? 'A site with that slug or custom domain already exists.' : 'Failed to create church site';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const siteId = searchParams.get('siteId');

  if (siteId) {
    const sites = await prisma.$queryRaw<Array<Record<string, any>>>(Prisma.sql`
      SELECT * FROM church_sites WHERE id = ${siteId} AND owner_id = ${session.user.id} LIMIT 1
    `);
    if (!sites[0]) return NextResponse.json({ error: 'Site not found' }, { status: 404 });
    const pages = await prisma.$queryRaw<Array<Record<string, any>>>(Prisma.sql`
      SELECT id, title, slug, type, content, published, updated_at FROM church_site_pages WHERE site_id = ${siteId} ORDER BY slug ASC
    `);
    return NextResponse.json({ site: sites[0], pages });
  }

  const sites = await prisma.$queryRaw<Array<Record<string, any>>>(Prisma.sql`
    SELECT id, name, slug, custom_domain, status, published_at, created_at, updated_at
    FROM church_sites
    WHERE owner_id = ${session.user.id}
    ORDER BY created_at DESC
    LIMIT 50
  `);

  return NextResponse.json({
    sites,
    blueprint: {
      pages: defaultPages.map((p) => p.title),
      sections: ['Hero', 'Upcoming Service', 'Latest Sermon', 'Prayer CTA', 'Giving CTA', 'Events', 'Children Ministry', 'Community Support', 'Footer'],
      integrations: ['/sermons', '/conferences', '/offering', '/prayer-room', '/aid-request', '/community-wall'],
      customDomainReady: true,
      publishingWorkflow: ['Draft', 'Admin Review', 'Publish', 'Monitor'],
    },
  });
}
