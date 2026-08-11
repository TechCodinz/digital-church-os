import { AdvancedMinistryWorkspace } from '@/components/ministry/AdvancedMinistryWorkspace';
import { ChurchWorkspaceSelector } from '@/components/ministry/ChurchWorkspaceSelector';
import { PrayerWatchPlanner } from '@/components/ministry/PrayerWatchPlanner';
import { requireChurchWorkspace } from '@/lib/church-ops/server';

export default async function PrayerWatchPage() {
  await requireChurchWorkspace(['OWNER', 'ADMIN', 'PASTOR', 'STAFF']);

  return (
    <>
      <section className="bg-cream-50 px-4 pt-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl pt-6">
          <ChurchWorkspaceSelector
            allowedRoles={['OWNER', 'ADMIN', 'PASTOR', 'STAFF']}
            emptyMessage="No church workspace with prayer-watch coordination access is attached to this account."
          />
        </div>
      </section>

      <AdvancedMinistryWorkspace
        eyebrow="Prayer Watch"
        title="Coordinate sustained prayer with Scripture, trustworthy context, and clear human moderation."
        description="Build church prayer watches around approved prayer themes, time windows, Scripture references, intercessor handoffs, and non-confidential operational notes without manufacturing urgency or unverified crisis claims."
        emoji="🕯️"
        focus={[
          { title: 'Prayer watch planner', description: 'Create time blocks, themes, Scripture references, participating teams, and safe handoff notes for sustained prayer rhythms.' },
          { title: 'Intercession board', description: 'Organize church-approved prayer focuses by ministry, family, community, mission, leadership, thanksgiving, or global concern.' },
          { title: 'Watch handoff', description: 'Let one prayer period close with a concise summary, Scripture focus, and optional next-watch context without exposing confidential requests.' },
        ]}
        intelligence={[
          { title: 'Scripture-bounded prompts', description: 'Generate prayer prompts with explicit Bible references and avoid claiming revelation, guaranteed outcomes, or special spiritual authority.' },
          { title: 'Source-aware global prayer', description: 'Keep verified church requests separate from public-news context and never invent a current crisis, persecution event, or emergency to make the watch feel live.' },
          { title: 'Healthy rhythm guidance', description: 'Help teams distribute watch periods sustainably, include rest and accessibility needs, and avoid pressure-based participation metrics.' },
        ]}
        actions={[
          { label: 'Open Prayer Room', href: '/prayer-room', description: 'Move into private, public, or anonymous prayer with human-care pathways.' },
          { label: 'Prayer Practice', href: '/prayer-practice', description: 'Use a private Scripture, timer, reflection, recording, and answered-prayer rhythm.' },
          { label: 'Global Network', href: '/church-network', description: 'Connect approved intercession to real church communities and ministry relationships.' },
          { label: 'Daily Guide', href: '/daily-guide', description: 'Carry a prayer-watch theme into personal Scripture and reflection.' },
        ]}
        safeguards={[
          'This church-team route requires an active workspace with OWNER, ADMIN, PASTOR, or STAFF access.',
          'Confidential prayer requests, crises, medical details, abuse reports, and safeguarding cases stay out of this shared operational planner.',
          'AI prayer assistance is advisory and Scripture-referenced; it does not claim prophecy, revelation, guaranteed healing, or supernatural certainty.',
        ]}
      />
      <PrayerWatchPlanner />
    </>
  );
}
