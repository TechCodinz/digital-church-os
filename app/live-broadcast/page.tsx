import { MinistryRoutePage } from '@/components/ministry/MinistryRoutePage';

export default function LiveBroadcastPage() {
  return (
    <MinistryRoutePage
      badge="Live Broadcast Gatherings"
      emoji="📡"
      title="Host or join public, private, and church-only live gatherings for devotion, prayer, worship, events, and follow-up."
      description="Live Broadcast adds personal devotion rooms, private gatherings, public events, watch tracking, comments, reactions, follow-up requests, and reward-aware participation so members can gather beyond formal services."
      primaryHref="/worship-media"
      primaryLabel="Open worship media"
      secondaryHref="/rewards"
      secondaryLabel="View rewards"
      features={[
        { title: 'Broadcast rooms', description: 'Users can create devotional, prayer, worship, Bible study, small-group, conference, private, or public gathering rooms.' },
        { title: 'Engagement tools', description: 'Participants can join, comment, like, react with Amen/Praise/Praying/Love, request follow-up, and track watch time.' },
        { title: 'Rewarded participation', description: 'Joining, watching, and meaningful interactions can feed the Kingdom Wallet without tying rewards to donations.' },
      ]}
      intelligence={[
        { title: 'Gathering beyond Sunday', description: 'Members can host spiritual moments any day, not only attend official church service.' },
        { title: 'Follow-up pipeline', description: 'Prayer, care, salvation, questions, and group follow-up requests can be captured from broadcasts.' },
        { title: 'Community energy', description: 'Live reactions and comments make gatherings feel alive while keeping admin review paths available.' },
      ]}
      safeguards={[
        'Private/public/church-only visibility',
        'Host controls',
        'Follow-up queue',
        'Reward ledger separation from giving',
      ]}
    />
  );
}
