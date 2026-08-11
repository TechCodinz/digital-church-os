import { ChurchOperationsCommandDeck } from '@/components/ministry/ChurchOperationsCommandDeck';
import { MinistryRoutePage } from '@/components/ministry/MinistryRoutePage';

export default function CommandCenterPage() {
  return (
    <main className="min-h-screen bg-cream-50 pb-16 pt-24">
      <section className="px-4 pb-10 pt-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <ChurchOperationsCommandDeck />
        </div>
      </section>

      <MinistryRoutePage
        badge="AI Church Operating Command Center"
        emoji="🧠"
        title="See what the church should do next across services, people, care, discipleship, groups, events, giving, outreach, worship, teaching, children, media, and ministry readiness."
        description="The command center connects weekly operating attention to real execution surfaces: service run sheets, volunteer coverage, response follow-up, aggregate attendance/assimilation, group capacity, event readiness, care, teaching, worship, outreach, and stewardship. Leaders get intelligence without turning people into scores."
        primaryHref="/service-planner"
        primaryLabel="Open service planner"
        secondaryHref="/intelligence"
        secondaryLabel="Open Ministry Intelligence"
        features={[
          { title: 'Whole-church readiness', description: 'Review service, sermon, worship, care, discipleship follow-up, attendance, groups, workers, children/family, giving, rights, outreach, church-network, and event readiness from one operating surface.' },
          { title: 'People do not disappear', description: 'Response pathways can continue through consent-aware human ownership, foundations, baptism conversations, belonging, groups, care, and healthy serving opportunities.' },
          { title: 'Execution before metrics', description: 'Run sheets, rotas, event tasks, group capacity, care handoffs, and operational due dates come before dashboards and reports.' },
        ]}
        intelligence={[
          { title: 'AI COO layer', description: 'The system can become an operating advisor while consequential ministry decisions remain accountable to human leaders.' },
          { title: 'Leadership resilience', description: 'If leaders are busy, the command center still exposes coverage gaps, overdue follow-up, readiness risks, capacity constraints, and next actions.' },
          { title: 'Privacy-aware insight', description: 'Aggregate attendance can inform planning while individual pastoral, counseling, safeguarding, and crisis details remain in dedicated protected workflows.' },
        ]}
        safeguards={[
          'Human-owned consequential decisions',
          'Consent-aware follow-up',
          'No sensitive pastoral case notes in general dashboards',
          'No attendance or service metrics used as spiritual-worth scores',
        ]}
      />
    </main>
  );
}
