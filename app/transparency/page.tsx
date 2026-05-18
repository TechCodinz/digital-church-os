import { MinistryRoutePage } from '@/components/ministry/MinistryRoutePage';

export default function TransparencyPage() {
  return (
    <MinistryRoutePage
      badge="Transparency and trust reporting"
      emoji="📊"
      title="Show how offerings, support, and community resources create real impact."
      description="Transparency reporting helps churches publish period-based totals, aid distribution, pending requests, approved requests, and category breakdowns with dignity and accountability."
      primaryHref="/offering"
      primaryLabel="Give with purpose"
      secondaryHref="/aid-request"
      secondaryLabel="Request support"
      features={[
        { title: 'Published periods', description: 'Reports can represent monthly, quarterly, or special-event periods for public review.' },
        { title: 'Category breakdowns', description: 'Offering and support distribution can be summarized by purpose without exposing private member details.' },
        { title: 'Admin accountability', description: 'Published reports connect to creator records and audit-ready governance.' },
      ]}
      intelligence={[
        { title: 'Impact storytelling', description: 'Leaders can show how giving becomes direct support, events, and platform care.' },
        { title: 'Privacy-preserving reporting', description: 'The route is designed to communicate outcomes without exposing sensitive aid request details.' },
        { title: 'Decision confidence', description: 'Members gain trust when giving, support, and ministry operations are clearly summarized.' },
      ]}
      safeguards={[
        'No private member exposure',
        'Admin-published reports',
        'Period-based summaries',
        'Audit-friendly governance',
      ]}
    />
  );
}
