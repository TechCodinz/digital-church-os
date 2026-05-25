import { MinistryRoutePage } from '@/components/ministry/MinistryRoutePage';

export default function GiftsPage() {
  return (
    <MinistryRoutePage
      badge="Gift pools and receiving support"
      emoji="🎀"
      title="Let the church give, receive, sponsor, appreciate, and support with transparency."
      description="Gift pools allow leaders and sponsors to create practical support buckets for conferences, workers, transport, data, food, learning, and emergency needs while keeping awards auditable."
      primaryHref="/rewards"
      primaryLabel="Open rewards"
      secondaryHref="/conferences"
      secondaryLabel="Open conferences"
      features={[
        { title: 'Gift pools', description: 'Create pools for conference support, worker appreciation, transport, data, food, and learning.' },
        { title: 'Awards', description: 'Admins can award gifts to members, workers, volunteers, or conference attendees with a reason and status.' },
        { title: 'Balanced ecosystem', description: 'Members do not only give; they can also receive help, encouragement, gifts, and appreciation.' },
      ]}
      intelligence={[
        { title: 'Support visibility', description: 'Gift awards can later feed impact summaries and transparency reports.' },
        { title: 'Worker upliftment', description: 'Workers and volunteers can be recognized for real service and tasks.' },
        { title: 'Conference readiness', description: 'Gift pools can help fund practical attendance needs and event support.' },
      ]}
      safeguards={[
        'Admin-controlled awards',
        'Gift pool balances',
        'Audit-ready reasons',
        'Donation/reward separation',
      ]}
    />
  );
}
