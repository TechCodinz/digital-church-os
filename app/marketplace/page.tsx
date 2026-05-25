import { MinistryRoutePage } from '@/components/ministry/MinistryRoutePage';

export default function MarketplacePage() {
  return (
    <MinistryRoutePage
      badge="Ministry template marketplace"
      emoji="🛍️"
      title="A creator economy for sermons, lessons, prayers, worship sets, and church resources."
      description="The marketplace module positions Digital Church OS for recurring revenue by allowing vetted creators and ministry leaders to publish templates, packs, courses, devotionals, sermon series, children lessons, and worship resources."
      primaryHref="/sermons"
      primaryLabel="Create content pack"
      secondaryHref="/website-builder"
      secondaryLabel="Build church site"
      features={[
        { title: 'Template products', description: 'Sermon packs, children lessons, youth guides, worship sets, devotionals, and conference kits.' },
        { title: 'Creator revenue', description: 'Future creator accounts can earn from approved products while the platform takes a commission.' },
        { title: 'Church-ready assets', description: 'Resources can be bundled for service flow, newsletters, social media, and small groups.' },
      ]}
      intelligence={[
        { title: 'Sermon-to-store pipeline', description: 'Approved sermon packs can later become paid or free marketplace templates.' },
        { title: 'Quality controls', description: 'Theological review, ratings, and admin approval protect the platform from poor content.' },
        { title: 'Revenue expansion', description: 'Churches, pastors, teachers, and worship leaders become both users and creators.' },
      ]}
      safeguards={[
        'Admin approval before publishing',
        'Theology and copyright review',
        'Creator payout controls',
        'Ratings and report flow',
      ]}
    />
  );
}
