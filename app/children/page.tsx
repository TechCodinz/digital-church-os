import { MinistryRoutePage } from '@/components/ministry/MinistryRoutePage';

export default function ChildrenPage() {
  return (
    <MinistryRoutePage
      badge="Children and family discipleship"
      emoji="👨‍👩‍👧‍👦"
      title="A protected children’s ecosystem for learning, milestones, permissions, and family growth."
      description="The children route organizes parent-linked child profiles, age-aware learning, milestone tracking, permission settings, and safe spiritual formation without exposing minors publicly."
      primaryHref="/dashboard"
      primaryLabel="Open family dashboard"
      secondaryHref="/prayer-room"
      secondaryLabel="Pray for a child"
      features={[
        { title: 'Parent-controlled profiles', description: 'Children profiles are connected to guardians with learning style, grade, interests, special needs, and allergies.' },
        { title: 'Milestone growth', description: 'Families can track growth moments, achievements, badges, and spiritual development over time.' },
        { title: 'Permission-first design', description: 'Public testimonies, photos, videos, and social usage can be governed by explicit parent approvals.' },
      ]}
      intelligence={[
        { title: 'Age-aware guidance', description: 'The schema supports personalized child learning paths instead of one-size-fits-all church content.' },
        { title: 'Family care awareness', description: 'Parent-child relationships help the platform serve the household, not just the individual member.' },
        { title: 'Safe engagement loops', description: 'Badges and milestones encourage growth while keeping children’s privacy and consent central.' },
      ]}
      safeguards={[
        'Guardian-owned records',
        'Explicit parent approvals',
        'Minor privacy by default',
        'No public child data exposure',
      ]}
    />
  );
}
