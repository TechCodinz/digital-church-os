import { MinistryRoutePage } from '@/components/ministry/MinistryRoutePage';

export default function WorkersPage() {
  return (
    <MinistryRoutePage
      badge="Serve with your church"
      emoji="🛠️"
      title="See meaningful ways to serve, complete assigned ministry work, and receive appreciation without turning service into competition."
      description="The worker portal is the member-facing side of church service. Leader rota decisions, backup coverage, and department staffing stay in restricted church-admin operations."
      primaryHref="/activities"
      primaryLabel="Open service activities"
      secondaryHref="/rewards"
      secondaryLabel="View appreciation & rewards"
      features={[
        { title: 'Assigned service', description: 'Participate in appropriate ministry tasks and practical service opportunities.' },
        { title: 'Completion proof', description: 'Submit proof text or links when a church-created task requires review.' },
        { title: 'Appreciation', description: 'Approved service can connect to points, gifts, or other church-defined appreciation workflows.' },
      ]}
      intelligence={[
        { title: 'Clear next action', description: 'Members can focus on their own service responsibilities rather than seeing private rota planning.' },
        { title: 'Healthy contribution', description: 'Service remains voluntary, accountable, and connected to ministry purpose.' },
        { title: 'Leader separation', description: 'Staffing gaps, primaries, backups, and check-in coordination remain behind church-admin access.' },
      ]}
      safeguards={[
        'No spiritual-performance scoring',
        'No private leader rota exposed to members',
        'Human review for assignments and stipends',
        'No sensitive pastoral or disciplinary notes',
      ]}
    />
  );
}
