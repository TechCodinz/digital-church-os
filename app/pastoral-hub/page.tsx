import { AdvancedMinistryWorkspace } from '@/components/ministry/AdvancedMinistryWorkspace';
import { ChurchWorkspaceSelector } from '@/components/ministry/ChurchWorkspaceSelector';
import { PastoralCareCoordinationBoard } from '@/components/ministry/PastoralCareCoordinationBoard';
import { requireChurchWorkspace } from '@/lib/church-ops/server';

export default async function PastoralHubPage() {
  await requireChurchWorkspace(['OWNER', 'ADMIN', 'PASTOR', 'STAFF']);

  return (
    <>
      <section className="bg-cream-50 px-4 pt-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl pt-6">
          <ChurchWorkspaceSelector
            allowedRoles={['OWNER', 'ADMIN', 'PASTOR', 'STAFF']}
            emptyMessage="No church workspace with pastoral-coordination access is attached to this account."
          />
        </div>
      </section>

      <AdvancedMinistryWorkspace
        eyebrow="Pastoral Hub"
        title="Keep pastoral care compassionate, confidential, organized, and unmistakably human-led."
        description="Bring appointments, follow-up, prayer, care requests, referrals, and ministry context into a protected pastoral workspace without exposing sensitive cases to general church operations."
        emoji="🤝"
        focus={[
          { title: 'Confidential care queue', description: 'Organize member-requested pastoral conversations, follow-up status, urgency, assigned leaders, and consent-aware notes.' },
          { title: 'Care pathway coordination', description: 'Connect prayer, appointments, benevolence, groups, discipleship, and appropriate professional referrals while preserving boundaries.' },
          { title: 'Follow-up continuity', description: 'Give authorized leaders a clear next-contact view so care does not disappear after the first conversation or service response.' },
        ]}
        intelligence={[
          { title: 'Triage support, not autonomous diagnosis', description: 'Help summarize submitted concerns and surface potential urgency signals while leaving assessment and decisions to qualified humans.' },
          { title: 'Consent-aware context', description: 'Keep only the context appropriate to the care workflow and avoid spreading confidential details across unrelated ministry tools.' },
          { title: 'Human escalation', description: 'Make pastor, safeguarding, emergency, medical, counseling, or other professional handoff visible when the situation requires it.' },
        ]}
        actions={[
          { label: 'Pastoral Care', href: '/care', description: 'Open the member-facing pastoral care and appointment pathway.' },
          { label: 'Care Management', href: '/care/manage', description: 'Review authorized pastoral care workflows and appointments.' },
          { label: 'Follow-up Board', href: '/follow-up/manage', description: 'Coordinate accountable member follow-up across ministry leaders.' },
          { label: 'Prayer Room', href: '/prayer-room', description: 'Connect pastoral care with private prayer and human-care escalation.' },
        ]}
        privacyNote="Pastoral care data should be treated as sensitive. AI assistance can organize or summarize authorized context, but confidential notes, safeguarding decisions, diagnosis, and crisis response remain human responsibilities."
        safeguards={[
          'This route requires an active church workspace with OWNER, ADMIN, PASTOR, or STAFF access.',
          'Confidential case details are restricted to authorized care roles and should not appear in general dashboards or team feeds.',
          'AI does not diagnose mental or physical conditions, provide emergency response, or replace pastors, counselors, clinicians, safeguarding leads, or emergency services.',
          'Members should retain clear pathways to request human care, correct context, and understand how sensitive information is being used.',
        ]}
      />
      <PastoralCareCoordinationBoard />
    </>
  );
}
