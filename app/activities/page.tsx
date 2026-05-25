import { MinistryRoutePage } from '@/components/ministry/MinistryRoutePage';

export default function ActivitiesPage() {
  return (
    <MinistryRoutePage
      badge="Sanctuary activity hub"
      emoji="⚡"
      title="Turn faith into daily action through prayer, reflection, service, memory, and outreach challenges."
      description="The activity hub stores active sanctuary activities, completion proof, review status, point awards, and reward-eligible participation so members stay engaged beyond Sunday."
      primaryHref="/rewards"
      primaryLabel="View rewards"
      secondaryHref="/journey"
      secondaryLabel="Open journey"
      features={[
        { title: 'Daily spiritual actions', description: 'Prayer reflections, sermon responses, scripture memory, kindness tasks, volunteer missions, and outreach challenges.' },
        { title: 'Proof and review', description: 'Members can submit proof text or URLs, while leaders can review reward eligibility.' },
        { title: 'Wallet connection', description: 'Approved activity completion can automatically award points into the Kingdom Wallet.' },
      ]}
      intelligence={[
        { title: 'Daily retention', description: 'Members come back through meaningful action instead of passive content consumption.' },
        { title: 'Journey growth', description: 'Activities feed the broader spiritual journey and productivity score.' },
        { title: 'Community impact', description: 'Activities can be designed around service, outreach, family discipleship, and care.' },
      ]}
      safeguards={[
        'Reward-eligible controls',
        'Proof tracking',
        'Admin-created tasks',
        'Ledger-backed points',
      ]}
    />
  );
}
