import { MinistryRoutePage } from '@/components/ministry/MinistryRoutePage';

export default function ChurchNetworkPage() {
  return (
    <MinistryRoutePage
      badge="Verified church-to-church ministry network"
      emoji="🌐"
      title="Connect churches, coordinate ministry, share resources, and build trusted global relationships."
      description="The church network workspace is designed for verified church discovery, partnership requests, regional collaboration, guest-minister coordination, resource sharing, prayer mobilization, conferences, outreach, and accountable cross-church ministry without collapsing local church governance."
      primaryHref="/conferences"
      primaryLabel="Coordinate a joint event"
      secondaryHref="/marketplace"
      secondaryLabel="Explore shared resources"
      features={[
        {
          title: 'Verified church profiles & discovery',
          description: 'Churches can maintain location, denomination or tradition, ministry focus, languages, contact posture, visibility, verification readiness, and public-facing information while keeping internal records private.',
        },
        {
          title: 'Partnership & event coordination',
          description: 'Support structured invitations for conferences, guest ministers, worship teams, outreach, training, relief work, prayer gatherings, and regional initiatives with explicit approval at each church.',
        },
        {
          title: 'Resource exchange with rights posture',
          description: 'Share approved sermon packs, lessons, worship resources, outreach material, training content, and ministry templates while preserving authorship, licensing, takedown, and local-review controls.',
        },
      ]}
      intelligence={[
        {
          title: 'Regional ministry matching',
          description: 'Use location, language, ministry focus, calendar context, and declared collaboration needs to surface potentially relevant churches without automatically creating relationships.',
        },
        {
          title: 'Prayer, care & crisis coordination',
          description: 'Connected churches can organize prayer watches, approved aid coordination, pastoral referrals, and regional support while keeping confidential member details outside public network surfaces.',
        },
        {
          title: 'Cross-church ministry memory',
          description: 'Keep collaboration context around past events, shared resources, follow-up actions, responsible contacts, and future opportunities so partnerships become durable rather than one-off messages.',
        },
      ]}
      safeguards={[
        'Every partnership remains opt-in and church-owner approved',
        'Verification status must never be fabricated or inferred by AI',
        'Private pastoral, safeguarding, financial, and member records stay outside the public network graph',
        'Shared media and teaching resources retain authorship, licensing, moderation, and takedown controls',
      ]}
    />
  );
}
