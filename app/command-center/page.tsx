import { ChurchOperationsCommandDeck } from '@/components/ministry/ChurchOperationsCommandDeck';
import { ChurchWorkspaceSelector } from '@/components/ministry/ChurchWorkspaceSelector';
import { MinistryRoutePage } from '@/components/ministry/MinistryRoutePage';

export default function CommandCenterPage() {
  return (
    <main className="min-h-screen bg-cream-50 pb-16 pt-24">
      <section className="px-4 pb-10 pt-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <ChurchWorkspaceSelector
            allowedRoles={['OWNER', 'ADMIN', 'PASTOR', 'STAFF']}
            emptyMessage="No church workspace with operational write access is attached to this account yet."
          />
          <ChurchOperationsCommandDeck />
        </div>
      </section>

      <MinistryRoutePage
        badge="AI Church Operating Command Center"
        emoji="🧠"
        title="See what the church should do next across worship, people, care, formation, facilities, communication, mission, stories, events, giving, and ministry readiness."
        description="The command center connects weekly operating attention to real execution surfaces: service run sheets, volunteer coverage, pastoral appointments, response follow-up, aggregate attendance/assimilation, group capacity, facilities/assets, communications, testimony review, outreach CRM, event readiness, teaching, worship, and stewardship. Shared operational persistence is scoped to the active church workspace instead of a global admin account."
        primaryHref="/service-planner"
        primaryLabel="Open service planner"
        secondaryHref="/intelligence"
        secondaryLabel="Open Ministry Intelligence"
        features={[
          { title: 'Whole-church readiness', description: 'Review service, sermon, worship, care, formation, attendance, groups, workers, children/family, facilities, giving, rights, communications, testimonies, outreach, network, and events from one operating surface.' },
          { title: 'People do not disappear', description: 'Response pathways can continue through consent-aware human ownership, appointments, foundations, baptism conversations, belonging, groups, care, mission connection, and healthy serving opportunities.' },
          { title: 'Tenant-safe operations', description: 'When a leader manages more than one church, shared operational records require an explicit active church workspace before they can be stored.' },
        ]}
        intelligence={[
          { title: 'AI COO layer', description: 'The system can become an operating advisor while consequential ministry decisions remain accountable to human leaders.' },
          { title: 'Leadership resilience', description: 'If leaders are busy, the command center still exposes coverage gaps, overdue follow-up, readiness risks, capacity constraints, and next actions.' },
          { title: 'Privacy-aware insight', description: 'Aggregate signals can inform planning while pastoral, counseling, safeguarding, crisis, child, financial, and other sensitive details remain in dedicated workflows.' },
        ]}
        safeguards={[
          'Human-owned consequential decisions',
          'Church membership checked for shared records',
          'Viewer-only workspaces cannot become command-center write targets',
          'No sensitive pastoral case notes in general dashboards',
          'No attendance or service metrics used as spiritual-worth scores',
        ]}
      />
    </main>
  );
}
