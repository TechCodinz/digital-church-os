import { AdvancedMinistryWorkspace } from '@/components/ministry/AdvancedMinistryWorkspace';

export default function DreamDiscernmentPage() {
  return (
    <AdvancedMinistryWorkspace
      eyebrow="Dream Discernment"
      title="Reflect on dreams carefully, prayerfully, and without turning AI into a source of revelation."
      description="Capture what you remember, separate observations from interpretations, compare themes with Scripture, notice emotional context, and decide whether a trusted pastor or counselor should be involved."
      emoji="🌙"
      focus={[
        { title: 'Private dream journal', description: 'Record people, places, sequence, emotions, recurring elements, waking context, and your own initial questions before any interpretation is suggested.' },
        { title: 'Observation-first reflection', description: 'Separate what happened in the dream from assumptions about what it means, reducing overconfident or fear-driven conclusions.' },
        { title: 'Scripture & pastoral handoff', description: 'Explore relevant biblical themes responsibly and move unresolved or weighty concerns to trusted human pastoral care.' },
      ]}
      intelligence={[
        { title: 'Pattern without prophecy', description: 'Help organize recurring symbols, emotions, stressors, memories, and themes while explicitly avoiding claims that AI knows a dream’s divine meaning.' },
        { title: 'Context-aware questions', description: 'Generate reflection questions about current life circumstances, relationships, worries, hopes, and Scripture rather than declaring supernatural certainty.' },
        { title: 'Discern the response, not a prediction', description: 'Suggest grounded next steps such as prayer, journaling, reconciliation, rest, Scripture study, or speaking with a trusted leader.' },
      ]}
      actions={[
        { label: 'Write in Journal', href: '/journal', description: 'Keep the full dream account private and continue reflecting over time.' },
        { label: 'Study Scripture', href: '/scripture', description: 'Explore biblical passages in context without fabricating translation quotations.' },
        { label: 'Prayer Room', href: '/prayer-room', description: 'Turn uncertainty, gratitude, fear, or discernment into Scripture-referenced prayer.' },
        { label: 'Pastoral Care', href: '/care', description: 'Bring significant concerns to a trusted human care pathway.' },
      ]}
      privacyNote="Dream reflection is private by default. AI can help organize observations and questions, but it cannot verify divine messages, predict the future, or replace mature pastoral discernment."
      safeguards={[
        'Never present generated interpretations as prophecy, revelation, a message from God, or certain supernatural knowledge.',
        'Do not make medical, legal, financial, relationship, or other high-stakes decisions solely from a dream or AI interpretation.',
        'Distressing, persistent, or safety-related experiences should be taken to appropriate trusted human support rather than intensified by the system.',
      ]}
    />
  );
}
