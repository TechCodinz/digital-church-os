import { MinistryRoutePage } from '@/components/ministry/MinistryRoutePage';

export default function WorkersPage() {
  return (
    <MinistryRoutePage
      badge="Church worker productivity"
      emoji="🛠️"
      title="Assign, track, reward, and appreciate church workers and volunteers professionally."
      description="Worker mode gives departments a way to assign tasks, collect completion proof, award points, track stipend eligibility, and organize church operations around service excellence."
      primaryHref="/admin"
      primaryLabel="Open admin CRM"
      secondaryHref="/rewards"
      secondaryLabel="Open rewards"
      features={[
        { title: 'Task assignment', description: 'Leaders can assign media, ushering, choir, children, prayer, outreach, and service tasks.' },
        { title: 'Proof and review', description: 'Workers can submit proof text or links, and leaders can review completion.' },
        { title: 'Stipends and appreciation', description: 'Tasks can include points and stipend eligibility for worker appreciation workflows.' },
      ]}
      intelligence={[
        { title: 'Volunteer gap awareness', description: 'Worker records can feed the command center to show gaps and no-shows.' },
        { title: 'Department productivity', description: 'Departments can measure work, completion, and contribution across services and events.' },
        { title: 'Faithful service recognition', description: 'The platform can honor unseen service with records, points, gifts, and reports.' },
      ]}
      safeguards={[
        'Admin assignment controls',
        'Completion proof',
        'Stipend review workflow',
        'Worker performance records',
      ]}
    />
  );
}
