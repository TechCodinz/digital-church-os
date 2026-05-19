import { MinistryRoutePage } from '@/components/ministry/MinistryRoutePage';

export default function ChurchNetworkPage() {
  return (
    <MinistryRoutePage
      badge="Church-to-church connection network"
      emoji="🌐"
      title="Connect churches, share resources, host joint events, and build a global ministry network."
      description="The church network module supports verified church profiles, partner requests, guest speaker relationships, resource sharing, regional directories, and joint conferences or outreach campaigns."
      primaryHref="/conferences"
      primaryLabel="Open conferences"
      secondaryHref="/marketplace"
      secondaryLabel="Share resources"
      features={[
        { title: 'Church profiles', description: 'Churches can create public profiles with denomination, location, visibility, and verification readiness.' },
        { title: 'Connections', description: 'Churches can request partnerships for guest speakers, resource sharing, conferences, and outreach.' },
        { title: 'Shared resources', description: 'Sermon packs, worship resources, outreach campaigns, and lessons can move across the network.' },
      ]}
      intelligence={[
        { title: 'Global prayer and support', description: 'Connected churches can coordinate global prayer, aid, and conference moments.' },
        { title: 'Regional discovery', description: 'Members and leaders can find churches by region, country, city, or ministry focus.' },
        { title: 'Ecosystem scale', description: 'Digital Church OS becomes a network, not just a single-church app.' },
      ]}
      safeguards={[
        'Church owner controls',
        'Connection approval workflow',
        'Verified church badge readiness',
        'Visibility controls',
      ]}
    />
  );
}
