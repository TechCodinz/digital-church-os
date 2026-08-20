import { MinistryRoutePage } from '@/components/ministry/MinistryRoutePage';

export default function RewardsPage() {
  return (
    <MinistryRoutePage
      badge="Kingdom rewards and gift economy"
      emoji="🎁"
      title="Balance giving with receiving through service rewards, activity points, gifts, and appreciation."
      description="Rewards mode lets members earn points for meaningful activity, while leaders can manage gift pools and awards for conferences, workers, support, transport, data, food, learning, and appreciation."
      primaryHref="/activities"
      primaryLabel="Open activities"
      secondaryHref="/gifts"
      secondaryLabel="Open gift pools"
      features={[
        { title: 'Kingdom Wallet', description: 'Members have a points and gift-credit ledger tied to approved activity, service, quizzes, and appreciation.' },
        { title: 'Gift pools', description: 'Churches can create transparent gift pools for conferences, workers, transport, food, data, and learning support.' },
        { title: 'Safe reward structure', description: 'Rewards are separated from donations so giving remains giving, while service and participation can be recognized.' },
      ]}
      intelligence={[
        { title: 'Engagement with dignity', description: 'Members can be uplifted through service, learning, and support rather than passive attendance alone.' },
        { title: 'Worker appreciation', description: 'Church workers can receive points, stipends, or gifts based on approved tasks and service.' },
        { title: 'Conference activation', description: 'Gift pools can connect to services and conferences to support practical needs.' },
      ]}
      safeguards={[
        'Donation/reward separation',
        'Ledger-backed balances',
        'Admin-controlled awards',
        'Activity proof and review',
      ]}
    />
  );
}
