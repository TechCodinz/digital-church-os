import { MinistryRoutePage } from '@/components/ministry/MinistryRoutePage';

export default function CommunityWallPage() {
  return (
    <MinistryRoutePage
      badge="Community wall"
      emoji="🤝"
      title="A moderated place for testimonies, reflections, prayer updates, and spiritual encouragement."
      description="The community wall gives members a safe, organized space to share posts, comments, testimonies, scripture reflections, and approved updates without turning the church into a noisy social feed."
      primaryHref="/prayer-room"
      primaryLabel="Share a prayer"
      secondaryHref="/live-service"
      secondaryLabel="Join service"
      features={[
        { title: 'Moderated posts', description: 'Community posts can stay pending until approved, preserving dignity, safety, and pastoral quality.' },
        { title: 'Scripture reflections', description: 'Posts can include scripture references so encouragement stays anchored in shared faith context.' },
        { title: 'Comment care', description: 'Member comments can support follow-up, connection, and community accountability.' },
      ]}
      intelligence={[
        { title: 'Engagement memory', description: 'Activities, badges, points, and follow-ups can connect participation to healthy spiritual growth.' },
        { title: 'Care-team visibility', description: 'Patterns from public updates can help leaders know where encouragement, teaching, or support is needed.' },
        { title: 'Member-first experience', description: 'The wall supports community without exposing private prayers, aid details, or sensitive counseling logs.' },
      ]}
      safeguards={[
        'Post approval workflow',
        'Authenticated participation',
        'No sensitive aid exposure',
        'Community dignity controls',
      ]}
    />
  );
}
