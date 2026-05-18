import { MinistryRoutePage } from '@/components/ministry/MinistryRoutePage';

export default function LiveServicePage() {
  return (
    <MinistryRoutePage
      badge="Live service operations"
      emoji="⛪"
      title="Run live worship, teaching, chat, prayer, and response from one organized route."
      description="The live service experience gives churches a focused command center for worship moments, sermon delivery, congregational chat, offerings, and post-service follow-up."
      primaryHref="/prayer-room"
      primaryLabel="Open prayer room"
      secondaryHref="/offering"
      secondaryLabel="Open giving"
      features={[
        { title: 'Service stage', description: 'Structure worship, teaching, announcements, prayer calls, and community response in a clean service flow.' },
        { title: 'Live interaction', description: 'Support blessing messages, prayer messages, announcements, and pastoral moderation through the live chat model.' },
        { title: 'Follow-up ready', description: 'After service, connect prayer requests, reflections, aid needs, and offerings to the wider sanctuary workflow.' },
      ]}
      intelligence={[
        { title: 'Contextual ministry handoff', description: 'A live service can feed prayer, aid, sermon, and counseling modules instead of leaving each feature isolated.' },
        { title: 'Moderated engagement', description: 'Chat and response workflows are designed for structured participation rather than noisy public comments.' },
        { title: 'Mobile-first worship', description: 'The route is optimized for members joining from phones, tablets, and desktop screens.' },
      ]}
      safeguards={[
        'Authenticated service participation',
        'Role-aware admin moderation',
        'Structured chat message types',
        'Post-service pastoral follow-up',
      ]}
    />
  );
}
