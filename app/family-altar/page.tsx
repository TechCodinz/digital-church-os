import { AdvancedMinistryWorkspace } from '@/components/ministry/AdvancedMinistryWorkspace';
import { FamilyAltarPlanner } from '@/components/ministry/FamilyAltarPlanner';
import { JourneyContinuityComposer } from '@/components/journey/JourneyContinuityComposer';

export default function FamilyAltarPage() {
  return (
    <>
      <AdvancedMinistryWorkspace
        eyebrow="Family Altar"
        title="Turn household worship into a gentle, Scripture-centered rhythm the whole family can actually sustain."
        description="Plan age-aware family devotion, prayer, worship, gratitude, service, and conversation without turning spiritual formation into pressure or competition."
        emoji="🏠"
        focus={[
          { title: 'Household worship planner', description: 'Shape a short gathering around Scripture, prayer, worship, discussion, gratitude, and one practical act of love.' },
          { title: 'Age-aware participation', description: 'Give children, teens, adults, and elders appropriate prompts while keeping parents and guardians in control of child participation.' },
          { title: 'Family prayer memory', description: 'Keep shared prayer themes, answered-prayer reflections, and family gratitude organized without exposing private pastoral details.' },
        ]}
        intelligence={[
          { title: 'Build tonight’s altar', description: 'Use the family’s available time, Scripture focus, ages, and current needs to shape a calm worship flow rather than a generic devotional.' },
          { title: 'Adapt without losing the message', description: 'Generate child-friendly questions, teen discussion prompts, adult reflection, and simple worship transitions from one biblical theme.' },
          { title: 'Suggest one faithful next step', description: 'Close with a relational, service, reconciliation, gratitude, or prayer action that can be reviewed together later.' },
        ]}
        actions={[
          { label: 'Open Scripture study', href: '/scripture', description: 'Choose a passage, translation posture, notes, and observation-first study prompts.' },
          { label: 'Open Prayer Room', href: '/prayer-room', description: 'Carry family prayer themes into private or shared prayer with human-care pathways.' },
          { label: 'Daily Guide', href: '/daily-guide', description: 'Connect the household theme to personal morning, midday, and evening reflection.' },
          { label: 'Children’s Sanctuary', href: '/children', description: 'Use guardian-controlled, age-aware Bible learning for younger family members.' },
        ]}
        safeguards={[
          'Children’s participation remains parent or guardian guided; AI is never presented as a trusted adult replacement.',
          'Private family conflict, safeguarding concerns, or pastoral-care details should not be exposed on shared household surfaces.',
          'The workspace recommends rhythms and prompts, not spiritual scores, rankings, or claims about a family’s faithfulness.',
        ]}
      />
      <FamilyAltarPlanner />
      <div className="bg-cream-50 px-4 pb-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <JourneyContinuityComposer
            source="Family Altar"
            title="Carry one family worship moment forward"
            prompt="Save only the household insight you intentionally want to remember: a Scripture reference, gratitude, shared prayer theme, act of service, or one next step for the family."
            nextHref="/daily-guide"
            nextLabel="Continue in Daily Guide"
            privacyNote="Do not place child activity records, private family conflict, safeguarding concerns, counseling details, or sensitive pastoral information in this formation timeline. Those belong in appropriate guardian-led or human-care workflows."
          />
        </div>
      </div>
    </>
  );
}
