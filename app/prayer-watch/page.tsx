import { AdvancedMinistryWorkspace } from '@/components/ministry/AdvancedMinistryWorkspace';

export default function PrayerWatchPage() {
  return (
    <AdvancedMinistryWorkspace
      eyebrow="Prayer Watch"
      title="Coordinate sustained prayer with Scripture, trustworthy context, and clear human moderation."
      description="Build personal, church, city, and global prayer watches around approved prayer themes, time windows, Scripture references, intercessor handoffs, and private reflections without manufacturing urgency or unverified crisis claims."
      emoji="🕯️"
      focus={[
        { title: 'Prayer watch planner', description: 'Create time blocks, themes, Scripture references, participating teams, private intentions, and handoff notes for sustained prayer rhythms.' },
        { title: 'Intercession board', description: 'Organize church-approved prayer focuses by ministry, family, community, mission, leadership, healing support, thanksgiving, or global concern.' },
        { title: 'Watch handoff', description: 'Let one prayer period close with a concise summary, Scripture focus, and optional next-watch context without exposing confidential requests.' },
      ]}
      intelligence={[
        { title: 'Scripture-bounded prompts', description: 'Generate prayer prompts with explicit Bible references and avoid claiming revelation, guaranteed outcomes, or special spiritual authority.' },
        { title: 'Source-aware global prayer', description: 'Keep verified church requests separate from public-news context and never invent a current crisis, persecution event, or emergency to make the watch feel live.' },
        { title: 'Healthy rhythm guidance', description: 'Help teams distribute watch periods sustainably, include rest and accessibility needs, and avoid pressure-based participation metrics.' },
      ]}
      actions={[
        { label: 'Open Prayer Room', href: '/prayer-room', description: 'Move into private, public, or anonymous prayer with human-care pathways.' },
        { label: 'Prayer Practice', href: '/prayer-practice', description: 'Use a private Scripture, timer, reflection, recording, and answered-prayer rhythm.' },
        { label: 'Global Network', href: '/church-network', description: 'Connect approved intercession to real church communities and ministry relationships.' },
        { label: 'Daily Guide', href: '/daily-guide', description: 'Carry a prayer-watch theme into personal Scripture and reflection.' },
      ]}
      safeguards={[
        'Global or crisis-related prayer prompts must distinguish verified context from general themes and must not fabricate breaking events.',
        'Confidential prayer requests stay private or role-restricted according to the requester’s sharing choice.',
        'AI prayer assistance is advisory and Scripture-referenced; it does not claim prophecy, revelation, guaranteed healing, or supernatural certainty.',
      ]}
    />
  );
}
