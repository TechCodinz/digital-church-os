import { AdvancedMinistryWorkspace } from '@/components/ministry/AdvancedMinistryWorkspace';
import { GrowthDnaReflection } from '@/components/ministry/GrowthDnaReflection';

export default function GrowthDnaPage() {
  return (
    <>
      <AdvancedMinistryWorkspace
        eyebrow="Growth DNA"
        title="See your formation rhythm clearly without reducing spiritual growth to a score."
        description="Review Scripture, prayer, worship, community, service, rest, relationships, and reflection as a private formation picture, then choose one faithful next step for the week."
        emoji="🌱"
        focus={[
          { title: 'Formation map', description: 'Bring together existing journey signals as a descriptive map of practices and needs instead of a leaderboard or spiritual grade.' },
          { title: 'Weekly examen', description: 'Reflect on where you noticed grace, resistance, growth, fatigue, relationships, service opportunities, and questions worth carrying forward.' },
          { title: 'Next-step pathway', description: 'Connect reflection to Scripture, prayer, community, service, care, or learning with one calm next action at a time.' },
        ]}
        intelligence={[
          { title: 'Notice patterns', description: 'Summarize private activity into gentle patterns such as consistency, neglected rhythms, or areas the member has explicitly chosen to strengthen.' },
          { title: 'Respect seasons', description: 'Account for grief, illness, caregiving, travel, workload, disability, and other life seasons rather than treating reduced activity as spiritual failure.' },
          { title: 'Recommend, never rank', description: 'Offer an advisory next step grounded in the member’s own goals and existing Church OS activity without comparing them with other people.' },
        ]}
        actions={[
          { label: 'Open Journey', href: '/journey', description: 'Review the private spiritual journey timeline and formation context already in Church OS.' },
          { label: 'Formation Pathway', href: '/formation', description: 'Move into structured discipleship and formation planning.' },
          { label: 'Daily Guide', href: '/daily-guide', description: 'Turn the weekly focus into Scripture, prayer, service, and evening reflection.' },
          { label: 'Find Community', href: '/groups', description: 'Connect formation to healthy Christian community and accountable relationships.' },
        ]}
        safeguards={[
          'No spiritual ranking, holiness score, public comparison, or shame-based streak mechanics.',
          'Recommendations use member-provided or existing in-app context and remain advisory rather than declarations about spiritual condition.',
          'Sensitive care information stays out of generalized formation summaries unless the member deliberately brings it into that context.',
        ]}
      />
      <GrowthDnaReflection />
    </>
  );
}
