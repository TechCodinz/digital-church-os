import { MinistryRoutePage } from '@/components/ministry/MinistryRoutePage';

export default function EventsPage() {
  return (
    <MinistryRoutePage
      badge="Church events & gatherings"
      emoji="📅"
      title="Discover worship gatherings, conferences, classes, outreach, rehearsals, and community moments published by your church network."
      description="This member-facing pathway is separate from internal event planning. Churches manage staffing, safeguarding, production, capacity, and contingency behind leader access, then publish approved event information for members."
      primaryHref="/church-network"
      primaryLabel="Explore church network"
      secondaryHref="/activities"
      secondaryLabel="See ministry activities"
      features={[
        { title: 'Published gatherings', description: 'Approved church events can surface here once connected to a publishing source or church backend.' },
        { title: 'Clear participation', description: 'Members should see what the event is, when it happens, where or how to join, and any real registration requirements.' },
        { title: 'Ministry connection', description: 'Events can lead into worship, groups, formation, outreach, volunteering, or pastoral response.' },
      ]}
      intelligence={[
        { title: 'No fake inventory', description: 'The UI does not invent event availability, registration counts, or tickets when no publishing provider has supplied them.' },
        { title: 'Church-owned publishing', description: 'Leaders review event readiness before approved information is exposed to members.' },
        { title: 'Follow-up ready', description: 'Event responses can later hand into groups, care, formation, or outreach rather than ending at attendance.' },
      ]}
      safeguards={[
        'Leader-reviewed event publication',
        'No internal planning notes exposed',
        'No invented registration availability',
        'Safeguarding and accessibility handled in leader planning',
      ]}
    />
  );
}
