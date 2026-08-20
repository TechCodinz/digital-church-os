#!/usr/bin/env node

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();
const now = new Date();

async function tableExists(tableName) {
  const rows = await prisma.$queryRaw`
    SELECT EXISTS (
      SELECT FROM information_schema.tables
      WHERE table_schema = 'public' AND table_name = ${tableName}
    ) AS exists
  `;
  return Boolean(rows?.[0]?.exists);
}

async function seedCorePrismaModels() {
  const religion = await prisma.religion.upsert({
    where: { name: 'Christianity' },
    update: { active: true },
    create: {
      name: 'Christianity',
      description: 'Christian faith baseline for staging smoke validation.',
      primaryText: 'Bible',
      active: true,
    },
  });

  const passwordHash = await bcrypt.hash(process.env.STAGING_SEED_PASSWORD || 'ChangeMe123!', 10);

  const admin = await prisma.user.upsert({
    where: { email: process.env.STAGING_ADMIN_EMAIL || 'admin@digitalchurchos.test' },
    update: { role: 'CHURCH_ADMIN', religionId: religion.id, onboardingCompleted: true, passwordHash },
    create: {
      email: process.env.STAGING_ADMIN_EMAIL || 'admin@digitalchurchos.test',
      passwordHash,
      name: 'Staging Admin',
      role: 'CHURCH_ADMIN',
      religionId: religion.id,
      onboardingCompleted: true,
    },
  });

  const member = await prisma.user.upsert({
    where: { email: process.env.STAGING_MEMBER_EMAIL || 'member@digitalchurchos.test' },
    update: { role: 'MEMBER', religionId: religion.id, onboardingCompleted: true, passwordHash },
    create: {
      email: process.env.STAGING_MEMBER_EMAIL || 'member@digitalchurchos.test',
      passwordHash,
      name: 'Staging Member',
      role: 'MEMBER',
      religionId: religion.id,
      onboardingCompleted: true,
    },
  });

  const viewer = await prisma.user.upsert({
    where: { email: process.env.STAGING_VIEWER_EMAIL || 'viewer@digitalchurchos.test' },
    update: { role: 'MEMBER', religionId: religion.id, onboardingCompleted: true, passwordHash },
    create: {
      email: process.env.STAGING_VIEWER_EMAIL || 'viewer@digitalchurchos.test',
      passwordHash,
      name: 'Staging Viewer',
      role: 'MEMBER',
      religionId: religion.id,
      onboardingCompleted: true,
    },
  });

  const aiModule = await prisma.aIModule.upsert({
    where: { id: 'staging-ai-pastor' },
    update: { active: true, config: { model: 'staging-safe', source: 'seed' } },
    create: {
      id: 'staging-ai-pastor',
      name: 'Staging AI Pastor',
      type: 'TEACHING',
      religionId: religion.id,
      version: 'staging-1',
      active: true,
      config: { model: 'staging-safe', source: 'seed' },
    },
  });

  const sermon = await prisma.sermon.create({
    data: {
      title: 'Staging Sermon: Hope and Service',
      theme: 'Hope and Service',
      scriptureRefs: ['Matthew 11:28', 'Micah 6:8'],
      outline: { points: ['Come to Christ', 'Walk humbly', 'Serve others'] },
      content: 'A staging sermon used for smoke validation.',
      religionId: religion.id,
      createdBy: admin.id,
    },
  }).catch(async () => {
    const existing = await prisma.sermon.findFirst({ where: { title: 'Staging Sermon: Hope and Service' } });
    return existing;
  });

  const worship = await prisma.worshipContent.create({
    data: {
      title: 'Staging Worship Atmosphere',
      type: 'PLAYLIST',
      style: 'Worship',
      theme: 'Prayer',
      scriptureRefs: ['Psalm 34:18'],
      content: { tracks: ['Staging Prayer Atmosphere'] },
      religionId: religion.id,
      createdBy: admin.id,
    },
  }).catch(async () => {
    const existing = await prisma.worshipContent.findFirst({ where: { title: 'Staging Worship Atmosphere' } });
    return existing;
  });

  const conference = await prisma.conference.create({
    data: {
      title: 'Staging Live Gathering',
      theme: 'Prayer and Worship',
      scriptureRefs: ['Matthew 18:20'],
      startDate: now,
      endDate: new Date(now.getTime() + 60 * 60 * 1000),
      location: 'Online',
      virtualRoomLink: '/live-broadcast',
      status: 'UPCOMING',
      religionId: religion.id,
    },
  }).catch(async () => {
    const existing = await prisma.conference.findFirst({ where: { title: 'Staging Live Gathering' } });
    return existing;
  });

  console.log('Core seed complete:', {
    religion: religion.id,
    admin: admin.email,
    member: member.email,
    viewer: viewer.email,
    aiModule: aiModule.id,
    sermon: sermon?.id,
    worship: worship?.id,
    conference: conference?.id,
  });
  return { religion, admin, member, viewer, sermon, worship, conference };
}

async function seedTenantFixtures(ctx) {
  if (!(await tableExists('church_profiles'))) return;

  await prisma.$executeRaw`
    INSERT INTO church_profiles (id, owner_id, name, slug, denomination, country, city, description, verified, visibility, metadata)
    VALUES
      ('staging-church-public', ${ctx.admin.id}, 'Staging Public Church', 'staging-public-church', 'Christian', 'US', 'Test City', 'Public church fixture for Phase 11 runtime isolation tests.', true, 'PUBLIC', '{"seeded":true}'::jsonb),
      ('staging-church-private', ${ctx.admin.id}, 'Staging Private Church', 'staging-private-church', 'Christian', 'US', 'Test City', 'Private church fixture for Phase 11 runtime isolation tests.', true, 'PRIVATE', '{"seeded":true}'::jsonb)
    ON CONFLICT (id) DO UPDATE SET
      owner_id = EXCLUDED.owner_id,
      name = EXCLUDED.name,
      slug = EXCLUDED.slug,
      visibility = EXCLUDED.visibility,
      verified = EXCLUDED.verified,
      metadata = EXCLUDED.metadata
  `;

  if (await tableExists('church_profile_members')) {
    await prisma.$executeRaw`
      INSERT INTO church_profile_members (church_id, user_id, role, status, invited_by)
      VALUES
        ('staging-church-public', ${ctx.admin.id}, 'OWNER', 'ACTIVE', ${ctx.admin.id}),
        ('staging-church-private', ${ctx.admin.id}, 'OWNER', 'ACTIVE', ${ctx.admin.id}),
        ('staging-church-public', ${ctx.member.id}, 'STAFF', 'ACTIVE', ${ctx.admin.id}),
        ('staging-church-private', ${ctx.viewer.id}, 'VIEWER', 'ACTIVE', ${ctx.admin.id})
      ON CONFLICT (church_id, user_id) DO UPDATE SET
        role = EXCLUDED.role,
        status = 'ACTIVE',
        invited_by = EXCLUDED.invited_by,
        updated_at = now()
    `;
  }

  if (ctx.conference?.id) {
    await prisma.conference.update({
      where: { id: ctx.conference.id },
      data: { churchProfileId: 'staging-church-public' },
    });
  }

  const existingPrivateConference = await prisma.conference.findFirst({
    where: { title: 'Staging Private Gathering' },
  });
  if (!existingPrivateConference) {
    await prisma.conference.create({
      data: {
        churchProfileId: 'staging-church-private',
        title: 'Staging Private Gathering',
        theme: 'Private Church Formation',
        scriptureRefs: ['Hebrews 10:24-25'],
        startDate: new Date(now.getTime() + 2 * 60 * 60 * 1000),
        endDate: new Date(now.getTime() + 3 * 60 * 60 * 1000),
        location: 'Private staging room',
        status: 'UPCOMING',
        religionId: ctx.religion.id,
      },
    });
  }

  console.log('Phase 11 tenant fixtures seeded:', {
    publicChurch: 'staging-church-public',
    publicStaff: ctx.member.email,
    privateChurch: 'staging-church-private',
    privateViewer: ctx.viewer.email,
  });
}

async function seedRawSqlTables(ctx) {
  await seedTenantFixtures(ctx);

  if (await tableExists('platform_feature_flags')) {
    await prisma.$executeRaw`
      INSERT INTO platform_feature_flags (flag_key, title, description, enabled, rollout_percent, config)
      VALUES
        ('public_live_broadcasts', 'Public Live Broadcasts', 'Staged rollout for public broadcasts.', false, 0, '{"seeded":true}'::jsonb),
        ('public_worship_media', 'Public Worship Media Catalog', 'Staged rollout for public worship media.', false, 0, '{"seeded":true}'::jsonb),
        ('marketplace_public_sales', 'Public Marketplace Sales', 'Staged rollout for marketplace purchases.', false, 0, '{"seeded":true}'::jsonb),
        ('rewards_public_redemption', 'Public Rewards Redemption', 'Staged rollout for reward redemption.', false, 0, '{"seeded":true}'::jsonb)
      ON CONFLICT (flag_key) DO UPDATE SET updated_at = now()
    `;
  }

  if (await tableExists('media_terms_versions')) {
    await prisma.$executeRaw`
      INSERT INTO media_terms_versions (version, title, body, active)
      VALUES ('staging-terms-1', 'Staging Media Upload Terms', 'Staging upload terms for smoke validation. Public distribution requires rights clearance.', true)
      ON CONFLICT (version) DO UPDATE SET active = true
    `;
  }

  if (await tableExists('media_provider_configs')) {
    await prisma.$executeRaw`
      INSERT INTO media_provider_configs (provider_key, provider_name, provider_type, enabled, requires_api_key, license_summary, allowed_usage)
      VALUES ('staging-manual-license', 'Staging Manual License Registry', 'MANUAL_REVIEW', true, false, 'Staging manual rights registry.', ARRAY['PRIVATE_USE','CHURCH_STREAM'])
      ON CONFLICT (provider_key) DO UPDATE SET enabled = true, updated_at = now()
    `;
  }

  if (await tableExists('scripture_passages')) {
    await prisma.$executeRaw`
      INSERT INTO scripture_passages (version_code, book, chapter, verse_start, reference, text, topics, emotions)
      VALUES
        ('KJV', 'Psalms', 34, 18, 'Psalm 34:18', 'The LORD is nigh unto them that are of a broken heart; and saveth such as be of a contrite spirit.', ARRAY['comfort','care'], ARRAY['hope']),
        ('WEB', 'Matthew', 11, 28, 'Matthew 11:28', 'Come to me, all you who labor and are heavily burdened, and I will give you rest.', ARRAY['rest','hope'], ARRAY['peace'])
      ON CONFLICT (version_code, reference) DO NOTHING
    `;
  }

  if (await tableExists('care_escalations')) {
    await prisma.$executeRaw`
      INSERT INTO care_escalations (user_id, source, urgency, status, title, description, country, emergency_disclaimer, notify_pastor, metadata)
      VALUES (${ctx.member.id}, 'staging_seed', 'LOW', 'OPEN', 'Staging care follow-up', 'Seeded care escalation for staging smoke validation.', 'US', 'If this is an emergency, contact local emergency services immediately.', true, '{"seeded":true}'::jsonb)
    `;
  }

  if (await tableExists('live_broadcast_rooms')) {
    await prisma.$executeRaw`
      INSERT INTO live_broadcast_rooms (host_id, title, description, gathering_type, visibility, status, starts_at, stream_provider, allow_comments, allow_reactions, allow_guest_join, follow_up_enabled, reward_enabled, metadata)
      VALUES (${ctx.admin.id}, 'Staging Devotion Broadcast', 'Seeded private broadcast for staging validation.', 'DEVOTION', 'PRIVATE', 'SCHEDULED', now(), 'internal', true, true, false, true, true, '{"seeded":true}'::jsonb)
    `;
  }

  if (await tableExists('worship_media_items')) {
    await prisma.$executeRaw`
      INSERT INTO worship_media_items (uploaded_by, title, artist, media_type, category, source_url, duration_seconds, language, scripture_refs, mood_tags, license_type, visibility, status, reward_enabled, rights_status, distribution_allowed, rights_owner_name, rights_owner_contact, takedown_status, public_distribution_notes)
      VALUES (${ctx.admin.id}, 'Staging Worship Track', 'Digital Church OS', 'AUDIO', 'WORSHIP', 'https://example.com/staging-worship.mp3', 180, 'English', ARRAY['Psalm 34:18'], ARRAY['peace','prayer'], 'OWNED', 'PRIVATE', 'APPROVED', true, 'PRIVATE_ONLY', false, 'Digital Church OS', 'admin@digitalchurchos.test', 'CLEAR', 'Private staging media only.')
    `;
  }

  console.log('Raw SQL seed complete for Phase 4-11 tables where available.');
}

try {
  const ctx = await seedCorePrismaModels();
  await seedRawSqlTables(ctx);
  console.log('Staging seed completed successfully. Feature flags default to disabled for public rollout.');
} catch (error) {
  console.error('Staging seed failed:', error);
  process.exitCode = 1;
} finally {
  await prisma.$disconnect();
}
