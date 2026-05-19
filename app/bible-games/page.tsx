import { MinistryRoutePage } from '@/components/ministry/MinistryRoutePage';

export default function BibleGamesPage() {
  return (
    <MinistryRoutePage
      badge="Children and youth Bible games"
      emoji="🎮"
      title="Make scripture learning active, fun, family-centered, and reward-connected."
      description="Bible games now support quiz creation, age groups, scripture-based questions, child or user attempts, scoring, and reward points for completed learning activities."
      primaryHref="/children"
      primaryLabel="Open children center"
      secondaryHref="/rewards"
      secondaryLabel="Open rewards"
      features={[
        { title: 'Bible quizzes', description: 'Leaders can create scripture quizzes for children, youth, families, or adults.' },
        { title: 'Attempts and scoring', description: 'Members and children can submit answers, receive scores, and earn points.' },
        { title: 'Family discipleship', description: 'Games can support memory verses, youth discussion, family devotional streaks, and children lessons.' },
      ]}
      intelligence={[
        { title: 'Learning retention', description: 'Scripture knowledge becomes active and enjoyable, not only lecture-based.' },
        { title: 'Parent-friendly engagement', description: 'Parents can guide children through approved lessons and quizzes.' },
        { title: 'Reward connection', description: 'Quiz completion can feed the Kingdom Wallet and growth journey.' },
      ]}
      safeguards={[
        'Age-group tagging',
        'Admin-created games',
        'Child profile support',
        'Reward ledger connection',
      ]}
    />
  );
}
