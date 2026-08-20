import { MinistryRoutePage } from '@/components/ministry/MinistryRoutePage';

export default function GroupsPage() {
  return (
    <MinistryRoutePage
      badge="Small groups & community"
      emoji="🤝"
      title="Find a healthy place to know people, grow in Scripture, pray, and serve beyond the main gathering."
      description="The member groups pathway helps people move toward relational community while internal capacity, leader assignments, backup leadership, and group-health planning remain restricted to church leaders."
      primaryHref="/church-network"
      primaryLabel="Explore church connections"
      secondaryHref="/events"
      secondaryLabel="See community events"
      features={[
        { title: 'Community connection', description: 'Move from a service response or new-believer pathway toward real relationships and local church belonging.' },
        { title: 'Group fit', description: 'Churches can eventually publish approved group options by life stage, location, language, study focus, or meeting rhythm.' },
        { title: 'Human welcome', description: 'Group connection should end with a real leader or host welcoming the person, not an automated assignment.' },
      ]}
      intelligence={[
        { title: 'Formation handoff', description: 'Foundations, membership, and discipleship flows can recommend community as a next step without forcing a specific group.' },
        { title: 'Capacity-aware routing', description: 'Leader systems can avoid routing people into groups that are already full or lack healthy leadership depth.' },
        { title: 'Privacy by separation', description: 'Members do not see internal leader notes, capacity concerns, or staffing decisions.' },
      ]}
      safeguards={[
        'Human-led group placement',
        'No internal group-health notes exposed',
        'No spiritual-worth scoring',
        'Respectful opt-out and privacy',
      ]}
    />
  );
}
