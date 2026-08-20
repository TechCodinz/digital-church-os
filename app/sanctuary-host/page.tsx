import { MinistryRoutePage } from '@/components/ministry/MinistryRoutePage';

export default function SanctuaryHostPage() {
  return (
    <MinistryRoutePage
      badge="AI Sanctuary Host"
      emoji="🕊️"
      title="A living AI guide that welcomes, reminds, directs, and uplifts members through the sanctuary."
      description="The sanctuary host stores personalized guidance messages, action prompts, route suggestions, service nudges, prayer reminders, rewards prompts, and care follow-up notices for members."
      primaryHref="/dashboard"
      primaryLabel="Open dashboard"
      secondaryHref="/journey"
      secondaryLabel="Open journey"
      features={[
        { title: 'Personal guidance', description: 'Members can receive private host messages connected to services, prayer, rewards, care, journey, and family discipleship.' },
        { title: 'Action prompts', description: 'Messages can include action labels and links that guide users to the next meaningful step.' },
        { title: 'Operational memory', description: 'Host messages are persisted so the experience feels alive instead of static.' },
      ]}
      intelligence={[
        { title: 'Daily encouragement', description: 'The host can welcome users, remind them of tasks, and suggest uplifting next steps.' },
        { title: 'Service companion', description: 'During live service, the host can guide users to notes, prayer, giving, and response flows.' },
        { title: 'Care-aware guidance', description: 'The host can nudge users toward care escalation or trusted support when appropriate.' },
      ]}
      safeguards={[
        'Private member messages',
        'Action-based guidance',
        'Care-safe routing',
        'Audit-ready host prompts',
      ]}
    />
  );
}
