import { AdvancedMinistryWorkspace } from '@/components/ministry/AdvancedMinistryWorkspace';
import { SundaySchoolLessonBuilder } from '@/components/ministry/SundaySchoolLessonBuilder';

export default function SundaySchoolPage() {
  return (
    <>
      <AdvancedMinistryWorkspace
        eyebrow="Sunday School"
        title="Build Scripture-rich lessons that teachers can adapt by age, setting, time, and learning need."
        description="Prepare lesson flow, biblical context, memory focus, discussion, activities, family takeaways, teacher notes, and follow-up from one age-aware ministry workspace."
        emoji="📚"
        focus={[
          { title: 'Lesson builder', description: 'Start with a Bible passage and teaching aim, then shape opening, observation, explanation, discussion, activity, prayer, and family takeaway.' },
          { title: 'Age-aware adaptation', description: 'Adapt vocabulary, questions, activities, timing, and participation for early childhood, children, teens, adults, or mixed-age classes.' },
          { title: 'Teacher preparation', description: 'Keep context checks, difficult-question prompts, materials, safeguarding reminders, accessibility considerations, and classroom handoffs together.' },
        ]}
        intelligence={[
          { title: 'Observation before application', description: 'Help teachers establish what the passage says in context before generating activities or personal application.' },
          { title: 'Inclusive learning prompts', description: 'Offer visual, verbal, movement, discussion, quiet-reflection, and simplified options so teachers can support different learners.' },
          { title: 'Family continuation', description: 'Create a short home conversation, prayer, memory focus, or service idea so formation can continue beyond the classroom.' },
        ]}
        actions={[
          { label: 'Study Scripture', href: '/scripture', description: 'Open translation-aware, observation-first Scripture study before building the lesson.' },
          { label: 'Children’s Sanctuary', href: '/children', description: 'Use guardian-aware children’s learning and participation tools.' },
          { label: 'Groups', href: '/groups', description: 'Connect adult or small-group lessons to ongoing community and discipleship.' },
          { label: 'Daily Guide', href: '/daily-guide', description: 'Carry the week’s Scripture theme into personal reflection and prayer.' },
        ]}
        safeguards={[
          'Child-facing experiences stay age-appropriate, guardian-aware, and subject to church safeguarding policies.',
          'AI-generated lesson material requires teacher review for biblical accuracy, context, age suitability, and local church teaching standards.',
          'Modern copyrighted Bible translations remain provider and license controlled; generated text must not fabricate named translation quotations.',
        ]}
      />
      <SundaySchoolLessonBuilder />
    </>
  );
}
