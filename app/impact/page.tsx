import { MinistryRoutePage } from '@/components/ministry/MinistryRoutePage';

export default function ImpactPage() {
  return (
    <MinistryRoutePage
      badge="Testimony and impact engine"
      emoji="🌟"
      title="Collect testimonies, publish impact stories, and show how the church is changing lives."
      description="The impact engine stores testimony submissions, review status, media links, anonymous options, and future impact summaries so the community can see meaningful spiritual and practical outcomes."
      primaryHref="/transparency"
      primaryLabel="View transparency"
      secondaryHref="/activities"
      secondaryLabel="Open activities"
      features={[
        { title: 'Testimonies', description: 'Members can submit text, audio, video, or image testimonies with anonymous privacy options.' },
        { title: 'Review workflow', description: 'Leaders can approve testimonies before public display to protect dignity and trust.' },
        { title: 'Impact summaries', description: 'Reports can connect giving, aid, prayer, activities, and testimonies into meaningful outcomes.' },
      ]}
      intelligence={[
        { title: 'Trust building', description: 'Impact stories help members understand what prayer, giving, support, and service produce.' },
        { title: 'Emotional connection', description: 'Members see evidence of care and transformation, not just announcements.' },
        { title: 'Public launch proof', description: 'Approved testimonies become powerful assets for outreach and growth.' },
      ]}
      safeguards={[
        'Admin review before publishing',
        'Anonymous testimony option',
        'Media URL support',
        'Privacy-safe impact reporting',
      ]}
    />
  );
}
