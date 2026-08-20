import { MinistryRoutePage } from '@/components/ministry/MinistryRoutePage';

export default function MediaRightsPage() {
  return (
    <MinistryRoutePage
      badge="Media rights and licensed worship distribution"
      emoji="⚖️"
      title="Protect worship media distribution with upload terms, rights review, takedown workflows, and licensed provider controls."
      description="The media rights layer prevents unsafe public distribution of copyrighted songs or videos unless upload terms are accepted, rights are declared, review is approved, no takedown hold exists, and distribution clearance is granted."
      primaryHref="/worship-media"
      primaryLabel="Open worship media"
      secondaryHref="/release-readiness"
      secondaryLabel="Check release readiness"
      features={[
        { title: 'Upload terms acceptance', description: 'Users must accept active media upload terms before uploading or linking worship media.' },
        { title: 'Rights declaration', description: 'Media captures owner, contact, license proof, provider source, rights status, and distribution notes.' },
        { title: 'Takedown workflow', description: 'Rights-holder claims automatically place media on hold and disable distribution until review.' },
      ]}
      intelligence={[
        { title: 'Public distribution gate', description: 'Public/church media catalog only returns approved, rights-cleared, non-takedown media.' },
        { title: 'Licensed provider adapter', description: 'Admins can configure manual license registry, external links, or future licensed catalog providers.' },
        { title: 'Audit trail', description: 'License events and review decisions are recorded for accountability.' },
      ]}
      safeguards={[
        'Terms acceptance required',
        'Rights status required',
        'Distribution clearance gate',
        'Takedown hold automation',
      ]}
    />
  );
}
