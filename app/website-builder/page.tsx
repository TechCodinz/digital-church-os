import { MinistryRoutePage } from '@/components/ministry/MinistryRoutePage';

export default function WebsiteBuilderPage() {
  return (
    <MinistryRoutePage
      badge="Church website builder"
      emoji="🌐"
      title="Launch a professional church website connected to the whole sanctuary OS."
      description="The website builder module gives churches a public presence with service times, sermons, giving, events, prayer requests, team pages, and custom-domain readiness."
      primaryHref="/offering"
      primaryLabel="Connect giving"
      secondaryHref="/conferences"
      secondaryLabel="Add events"
      features={[
        { title: 'Public church site', description: 'Homepage, about, service times, pastor/team, events, sermons, giving, and contact sections.' },
        { title: 'Custom domains', description: 'Churches can later connect their own domain for a professional branded presence.' },
        { title: 'Integrated forms', description: 'Prayer request, giving, contact, event registration, and membership forms can connect to existing OS workflows.' },
      ]}
      intelligence={[
        { title: 'Content reuse', description: 'Sermon packs and announcements can automatically feed the website and newsletter.' },
        { title: 'Visitor conversion', description: 'New visitor forms can connect into follow-up workflows and admin CRM.' },
        { title: 'Revenue tier', description: 'Website builder can become a paid feature for churches that need hosting and branding.' },
      ]}
      safeguards={[
        'Admin-managed publishing',
        'Custom domain readiness',
        'Privacy-safe forms',
        'Connected church CRM',
      ]}
    />
  );
}
