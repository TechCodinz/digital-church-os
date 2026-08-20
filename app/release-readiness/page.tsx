import { MinistryRoutePage } from '@/components/ministry/MinistryRoutePage';

export default function ReleaseReadinessPage() {
  return (
    <MinistryRoutePage
      badge="Release readiness and domination checklist"
      emoji="🚀"
      title="Know when Digital Church OS is truly ready for public launch."
      description="The release-readiness layer checks media-rights blockers, takedown holds, pending reviews, care queue, aid queue, translation reviews, offline sync, testimony review, command-center reports, and required manual provider checks before public launch."
      primaryHref="/command-center"
      primaryLabel="Open command center"
      secondaryHref="/media-rights"
      secondaryLabel="Open media rights"
      features={[
        { title: 'Release blockers', description: 'Flags takedown holds and uncleared public media as hard blockers before launch.' },
        { title: 'Operational warnings', description: 'Surfaces pending care, aid, translation, testimony, offline sync, and command-center checks.' },
        { title: 'Deployment commands', description: 'Lists the exact build, Prisma, lint, and migration commands required before merge/deploy.' },
      ]}
      intelligence={[
        { title: 'Launch discipline', description: 'Prevents shipping a powerful ecosystem with hidden safety, rights, or operational risks.' },
        { title: 'Admin clarity', description: 'Leaders can see whether the platform is ready for staging, final fixes, or public release.' },
        { title: 'Ecosystem resilience', description: 'The system becomes harder to break because critical queues and blockers are visible.' },
      ]}
      safeguards={[
        'Admin-only release checks',
        'Media-rights hard blockers',
        'Manual provider verification reminders',
        'Deployment command checklist',
      ]}
    />
  );
}
