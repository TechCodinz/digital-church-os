import { MinistryRoutePage } from '@/components/ministry/MinistryRoutePage';

export default function ActivitiesPage() {
  return (
    <MinistryRoutePage
      badge="Sanctuary activity hub"
      emoji="⚡"
      title="Turn faith into daily action through prayer, reflection, service, memory, and outreach challenges."
      description="The activity hub stores active sanctuary activities, completion proof, review status, point awards, and reward-eligible participation while the dedicated outreach CRM handles human follow-up and community connection."
      primaryHref="/outreach"
      primaryLabel="Open outreach CRM"
      secondaryHref="/rewards"
      secondaryLabel="View rewards"
      features={[
        { title: 'Daily spiritual actions', description: 'Prayer reflections, sermon responses, scripture memory, kindness tasks, volunteer missions, and outreach challenges.' },
        { title: 'Proof and review', description: 'Members can submit proof text or URLs, while leaders can review reward eligibility.' },
        { title: 'Outreach handoff', description: 'Community contacts and follow-up move into the dedicated outreach CRM instead of being buried in activity completion.' },
      ]}
      intelligence={[
        { title: 'Daily retention', description: 'Members come back through meaningful action instead of passive content consumption.' },
        { title: 'Journey growth', description: 'Activities feed the broader spiritual journey and private formation flow.' },
        { title: 'Community impact', description: 'Activities can be designed around service, outreach, family discipleship, and care, then handed to accountable human owners.' },
      ]}
      safeguards={[
        'Reward-eligible controls',
        'Proof tracking',
        'Admin-created tasks',
        'Consent-aware outreach handoff',
      ]}
    />
  );
}
