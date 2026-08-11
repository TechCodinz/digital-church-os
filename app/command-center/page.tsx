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
        title="See what the church should do next across care, giving, workers, events, rewards, outreach, worship, teaching, children, media, and service readiness."
        description="The command center combines weekly operating attention with persistent reports, health metrics, priorities, opportunities, and risks so leaders can run ministry with intelligence and accountability without turning people into scores."
        primaryHref="/admin"
        primaryLabel="Open admin"
        secondaryHref="/intelligence"
        secondaryLabel="Open Ministry Intelligence"
        features={[
          { title: 'Weekly ministry readiness', description: 'Review service, sermon, worship, care, workers, children/family, giving, rights, outreach, church-network, and calendar readiness from one operating surface.' },
          { title: 'Priorities and risks', description: 'Leaders can surface what needs follow-up before trust is lost, people fall through gaps, or important operational work is missed.' },
          { title: 'Growth opportunities', description: 'Reports can suggest sermon packs, impact summaries, worker appreciation, outreach follow-up, and church-network collaboration.' },
        ]}
        intelligence={[
          { title: 'AI COO layer', description: 'The system becomes an operating advisor while consequential ministry decisions remain accountable to human leaders.' },
          { title: 'Leadership resilience', description: 'If leaders are busy, the command center still exposes queues, readiness gaps, risks, and next actions.' },
          { title: 'Meaningful productivity', description: 'Church activity becomes easier to coordinate while protecting pastoral privacy and keeping ministry mission-aligned.' },
        ]}
        safeguards={[
          'Admin-only persistent reports',
          'No sensitive pastoral case notes in general dashboards',
          'Metric-backed but human-led decisions',
          'Risk and opportunity tracking',
        ]}
      />
    </main>
  );
}
