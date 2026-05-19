import { MinistryRoutePage } from '@/components/ministry/MinistryRoutePage';

export default function CommandCenterPage() {
  return (
    <MinistryRoutePage
      badge="AI Church Operating Command Center"
      emoji="🧠"
      title="See what the church should do next across care, giving, workers, events, rewards, and outreach."
      description="The command center stores weekly operating reports with health score, metrics, priorities, opportunities, and risks so leaders can run the church with intelligence and accountability."
      primaryHref="/admin"
      primaryLabel="Open admin"
      secondaryHref="/intelligence"
      secondaryLabel="Open Raizion Intelligence"
      features={[
        { title: 'Weekly reports', description: 'Generate persistent reports across care, aid, translations, workers, testimonies, registrations, marketplace, sites, and offline sync.' },
        { title: 'Priorities and risks', description: 'Leaders can see what needs follow-up before trust is lost or opportunities are missed.' },
        { title: 'Growth opportunities', description: 'Reports suggest sermon packs, impact summaries, worker appreciation, and church-network collaboration.' },
      ]}
      intelligence={[
        { title: 'AI COO layer', description: 'The system becomes an operating advisor, not just a collection of pages.' },
        { title: 'Leadership resilience', description: 'If leaders are busy, the command center still shows queues, risks, and next actions.' },
        { title: 'Meaningful productivity', description: 'Church activity becomes measurable, supportive, and mission-aligned.' },
      ]}
      safeguards={[
        'Admin-only reports',
        'Metric-backed decisions',
        'Persistent report history',
        'Risk and opportunity tracking',
      ]}
    />
  );
}
