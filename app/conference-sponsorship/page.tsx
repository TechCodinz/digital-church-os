import { MinistryRoutePage } from '@/components/ministry/MinistryRoutePage';

export default function ConferenceSponsorshipPage() {
  return (
    <MinistryRoutePage
      badge="Conference gifts and sponsorship engine"
      emoji="🎟️"
      title="Turn conferences into worship, learning, support, sponsorship, certificates, and practical upliftment."
      description="Conference sponsorship supports registrations, tickets, transport support, food/data/accommodation requests, worker allowances, gift pools, check-ins, and certificate-ready attendance records."
      primaryHref="/conferences"
      primaryLabel="Open conferences"
      secondaryHref="/gifts"
      secondaryLabel="Open gift pools"
      features={[
        { title: 'Registration and tickets', description: 'Conference registrations and ticket structures are persisted for attendees, members, and guests.' },
        { title: 'Sponsorship requests', description: 'Members can request ticket, transport, food, data, accommodation, or worker allowance support.' },
        { title: 'Certificate readiness', description: 'Attendance records can feed certificates and post-conference follow-up plans.' },
      ]}
      intelligence={[
        { title: 'Practical conference support', description: 'The platform helps people attend, serve, learn, and receive support instead of only consuming content.' },
        { title: 'Sponsor visibility', description: 'Gift pools and sponsorships can later feed impact reports and sponsor summaries.' },
        { title: 'Worker appreciation', description: 'Conference workers can be connected to tasks, stipends, gifts, and proof of service.' },
      ]}
      safeguards={[
        'Admin review for requests',
        'Ticket and registration records',
        'Gift pool connection',
        'Certificate-ready attendance',
      ]}
    />
  );
}
