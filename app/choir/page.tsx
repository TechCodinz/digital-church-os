import { MinistryRoutePage } from '@/components/ministry/MinistryRoutePage';

export default function ChoirPage() {
  return (
    <MinistryRoutePage
      badge="Worship choir studio"
      emoji="🎶"
      title="Organize worship, lyrics, choir participation, and service atmosphere intelligently."
      description="The choir route gives the church a professional home for worship content, song preparation, voice participation, lyric generation, and live-service atmosphere planning."
      primaryHref="/live-service"
      primaryLabel="Join live service"
      secondaryHref="/sermons"
      secondaryLabel="Prepare sermon"
      features={[
        { title: 'Worship planning', description: 'Organize songs, hymns, themes, styles, scripture references, and usage count.' },
        { title: 'AI lyric support', description: 'Use guarded worship generation to draft songs while leaders review theology and tone.' },
        { title: 'Choir participation', description: 'Support future voice recording, practice flow, and virtual choir contribution.' },
      ]}
      intelligence={[
        { title: 'Theme-aware worship', description: 'Worship can align with sermon themes, conference topics, and prayer room concerns.' },
        { title: 'Service atmosphere', description: 'Audio and visuals can be suggested in ways that support reverence without distraction.' },
        { title: 'Review-first creation', description: 'Generated content remains a draft for human worship leaders, not an automatic authority.' },
      ]}
      safeguards={[
        'Human worship review',
        'Scripture-linked content',
        'No forced theology claims',
        'Service-ready organization',
      ]}
    />
  );
}
