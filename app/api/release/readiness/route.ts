import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { Prisma } from '@prisma/client';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

function statusFromBlockers(blockers: string[]) {
  if (blockers.length === 0) return 'READY_FOR_STAGING_RELEASE';
  if (blockers.length <= 3) return 'NEEDS_FINAL_FIXES';
  return 'NOT_READY_FOR_PUBLIC_RELEASE';
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== 'CHURCH_ADMIN') return NextResponse.json({ error: 'Admin access required' }, { status: 403 });

  try {
    const [
      pendingMedia,
      takedownHolds,
      publicUnclearedMedia,
      pendingCare,
      pendingAid,
      pendingTranslations,
      queuedOffline,
      pendingTestimonies,
      commandReports,
      providerConfigs,
      openReports,
      highPriorityReports,
      publicBroadcastFlag,
      publicWorshipFlag,
      marketplaceFlag,
      rewardsFlag,
    ] = await Promise.all([
      prisma.$queryRaw<Array<{ count: number }>>(Prisma.sql`SELECT COUNT(*)::int AS count FROM worship_media_items WHERE status = 'PENDING_REVIEW' OR rights_status = 'PENDING_REVIEW'`),
      prisma.$queryRaw<Array<{ count: number }>>(Prisma.sql`SELECT COUNT(*)::int AS count FROM worship_media_items WHERE takedown_status <> 'CLEAR'`),
      prisma.$queryRaw<Array<{ count: number }>>(Prisma.sql`SELECT COUNT(*)::int AS count FROM worship_media_items WHERE visibility IN ('PUBLIC','CHURCH_ONLY') AND (distribution_allowed = false OR rights_status <> 'APPROVED' OR status <> 'APPROVED')`),
      prisma.$queryRaw<Array<{ count: number }>>(Prisma.sql`SELECT COUNT(*)::int AS count FROM care_escalations WHERE status IN ('OPEN','IN_PROGRESS')`),
      prisma.aidRequest.count({ where: { status: { in: ['PENDING', 'UNDER_REVIEW'] } } }),
      prisma.$queryRaw<Array<{ count: number }>>(Prisma.sql`SELECT COUNT(*)::int AS count FROM translation_jobs WHERE status = 'PENDING_REVIEW'`),
      prisma.$queryRaw<Array<{ count: number }>>(Prisma.sql`SELECT COUNT(*)::int AS count FROM offline_sync_items WHERE status = 'QUEUED'`),
      prisma.$queryRaw<Array<{ count: number }>>(Prisma.sql`SELECT COUNT(*)::int AS count FROM testimonies WHERE status = 'PENDING_REVIEW'`),
      prisma.$queryRaw<Array<{ count: number }>>(Prisma.sql`SELECT COUNT(*)::int AS count FROM command_center_reports`),
      prisma.$queryRaw<Array<{ count: number }>>(Prisma.sql`SELECT COUNT(*)::int AS count FROM media_provider_configs WHERE enabled = true`),
      prisma.$queryRaw<Array<{ count: number }>>(Prisma.sql`SELECT COUNT(*)::int AS count FROM content_reports WHERE status IN ('OPEN','IN_REVIEW')`),
      prisma.$queryRaw<Array<{ count: number }>>(Prisma.sql`SELECT COUNT(*)::int AS count FROM content_reports WHERE status IN ('OPEN','IN_REVIEW') AND priority = 'HIGH'`),
      prisma.$queryRaw<Array<{ enabled: boolean; rollout_percent: number }>>(Prisma.sql`SELECT enabled, rollout_percent FROM platform_feature_flags WHERE flag_key = 'public_live_broadcasts' LIMIT 1`),
      prisma.$queryRaw<Array<{ enabled: boolean; rollout_percent: number }>>(Prisma.sql`SELECT enabled, rollout_percent FROM platform_feature_flags WHERE flag_key = 'public_worship_media' LIMIT 1`),
      prisma.$queryRaw<Array<{ enabled: boolean; rollout_percent: number }>>(Prisma.sql`SELECT enabled, rollout_percent FROM platform_feature_flags WHERE flag_key = 'marketplace_public_sales' LIMIT 1`),
      prisma.$queryRaw<Array<{ enabled: boolean; rollout_percent: number }>>(Prisma.sql`SELECT enabled, rollout_percent FROM platform_feature_flags WHERE flag_key = 'rewards_public_redemption' LIMIT 1`),
    ]);

    const metrics = {
      pendingMediaReview: pendingMedia[0]?.count || 0,
      takedownHolds: takedownHolds[0]?.count || 0,
      publicUnclearedMedia: publicUnclearedMedia[0]?.count || 0,
      pendingCare: pendingCare[0]?.count || 0,
      pendingAid,
      pendingTranslations: pendingTranslations[0]?.count || 0,
      queuedOffline: queuedOffline[0]?.count || 0,
      pendingTestimonies: pendingTestimonies[0]?.count || 0,
      commandReports: commandReports[0]?.count || 0,
      enabledMediaProviders: providerConfigs[0]?.count || 0,
      openReports: openReports[0]?.count || 0,
      highPriorityReports: highPriorityReports[0]?.count || 0,
      featureFlags: {
        publicLiveBroadcasts: publicBroadcastFlag[0] || { enabled: false, rollout_percent: 0 },
        publicWorshipMedia: publicWorshipFlag[0] || { enabled: false, rollout_percent: 0 },
        marketplacePublicSales: marketplaceFlag[0] || { enabled: false, rollout_percent: 0 },
        rewardsPublicRedemption: rewardsFlag[0] || { enabled: false, rollout_percent: 0 },
      },
    };

    const blockers: string[] = [];
    const warnings: string[] = [];

    if (metrics.takedownHolds > 0) blockers.push(`${metrics.takedownHolds} media item(s) are under takedown hold.`);
    if (metrics.publicUnclearedMedia > 0) blockers.push(`${metrics.publicUnclearedMedia} public/church media item(s) are not rights-cleared.`);
    if (metrics.highPriorityReports > 0) blockers.push(`${metrics.highPriorityReports} high-priority content report(s) are still open.`);
    if (metrics.openReports > 0) warnings.push(`${metrics.openReports} content report(s) need review.`);
    if (metrics.pendingMediaReview > 0) warnings.push(`${metrics.pendingMediaReview} media item(s) still need review.`);
    if (metrics.pendingCare > 0) warnings.push(`${metrics.pendingCare} care escalation(s) need ownership before public launch.`);
    if (metrics.pendingAid > 0) warnings.push(`${metrics.pendingAid} aid request(s) are pending review.`);
    if (metrics.pendingTranslations > 0) warnings.push(`${metrics.pendingTranslations} translation job(s) need human review.`);
    if (metrics.queuedOffline > 50) warnings.push(`Offline sync queue is high: ${metrics.queuedOffline}.`);
    if (metrics.pendingTestimonies > 0) warnings.push(`${metrics.pendingTestimonies} testimony item(s) need review.`);
    if (metrics.commandReports === 0) warnings.push('No command-center report has been generated yet.');
    if (metrics.enabledMediaProviders === 0) warnings.push('No media provider is enabled; only uploaded/manual media flows are available.');
    if (!metrics.featureFlags.publicLiveBroadcasts.enabled) warnings.push('Public live broadcasts are behind a disabled feature flag. Enable only after staging tests.');
    if (!metrics.featureFlags.publicWorshipMedia.enabled) warnings.push('Public worship media is behind a disabled feature flag. Enable only after media-rights clearance is stable.');

    const checklist = [
      { key: 'auth', label: 'Auth and session roles configured', status: 'VERIFY_MANUALLY' },
      { key: 'database', label: 'Prisma migrations deployed', status: 'VERIFY_MANUALLY' },
      { key: 'mediaRights', label: 'Media rights workflow has no hard blockers', status: metrics.takedownHolds === 0 && metrics.publicUnclearedMedia === 0 ? 'PASS' : 'BLOCKED' },
      { key: 'contentReports', label: 'High-priority reports cleared', status: metrics.highPriorityReports === 0 ? 'PASS' : 'BLOCKED' },
      { key: 'featureFlags', label: 'Public launch feature flags reviewed', status: 'VERIFY_MANUALLY' },
      { key: 'care', label: 'Care queue reviewed', status: metrics.pendingCare === 0 ? 'PASS' : 'WARNING' },
      { key: 'payments', label: 'Giving/payment providers configured', status: 'VERIFY_MANUALLY' },
      { key: 'email', label: 'Email/SMS/push providers configured', status: 'VERIFY_MANUALLY' },
      { key: 'streaming', label: 'Streaming/media storage provider configured', status: 'VERIFY_MANUALLY' },
      { key: 'commandCenter', label: 'Admin command-center report generated', status: metrics.commandReports > 0 ? 'PASS' : 'WARNING' },
    ];

    return NextResponse.json({
      status: statusFromBlockers(blockers),
      metrics,
      blockers,
      warnings,
      checklist,
      requiredCommands: ['npm ci', 'npx prisma generate', 'npx prisma validate', 'npx prisma migrate deploy', 'npm run lint', 'npm run build'],
    });
  } catch (error) {
    console.error('Release readiness check failed:', error);
    return NextResponse.json({ error: 'Failed to run release readiness check' }, { status: 500 });
  }
}
