import { MinistryRoutePage } from '@/components/ministry/MinistryRoutePage';
import { VolunteerRotaCommandCenter } from '@/components/ministry/VolunteerRotaCommandCenter';

export default function WorkersPage() {
  return (
    <main className="min-h-screen bg-cream-50 pb-16 pt-24">
      <section className="px-4 pb-10 pt-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <VolunteerRotaCommandCenter />
        </div>
      </section>

      <MinistryRoutePage
        badge="Church worker productivity"
        emoji="🛠️"
        title="Assign, track, reward, appreciate, and schedule church workers and volunteers professionally."
        description="Worker mode now combines live rota coverage with task assignment, completion proof, appreciation, and department operations so leaders can see both who is serving and what still needs to be done."
        primaryHref="/service-planner"
        primaryLabel="Open service planner"
        secondaryHref="/rewards"
        secondaryLabel="Open rewards"
        features={[
          { title: 'Rota & backup coverage', description: 'Plan departments, roles, primaries, backups, call times, confirmation status, and critical coverage gaps.' },
          { title: 'Task assignment', description: 'Leaders can assign media, ushering, choir, children, prayer, outreach, and service tasks.' },
          { title: 'Proof and review', description: 'Workers can submit proof text or links, and leaders can review completion.' },
          { title: 'Stipends and appreciation', description: 'Tasks can include points and stipend eligibility for worker appreciation workflows.' },
        ]}
        intelligence={[
          { title: 'Volunteer gap awareness', description: 'The rota surfaces unassigned/unavailable critical roles and missing backups before service.' },
          { title: 'Department productivity', description: 'Departments can coordinate work, completion, and contribution across services and events.' },
          { title: 'Faithful service recognition', description: 'The platform can honor unseen service with records, points, gifts, and reports without turning ministry into competition.' },
        ]}
        safeguards={[
          'Human-owned rota decisions',
          'No spiritual-performance scoring',
          'No sensitive pastoral or disciplinary notes in the rota',
          'Stipend review workflow',
        ]}
      />
    </main>
  );
}
