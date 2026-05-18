import { MinistryRoutePage } from '@/components/ministry/MinistryRoutePage';

export default function ConferencesPage() {
  return (
    <MinistryRoutePage
      badge="Conference and event command"
      emoji="🎤"
      title="Plan, host, and follow up on spiritual conferences with structure."
      description="A professional conference route for service planning, registration, sermon preparation, replay organization, prayer requests, and post-event reflections."
      primaryHref="/live-service"
      primaryLabel="Open live service"
      secondaryHref="/prayer-room"
      secondaryLabel="Prepare prayer room"
      features={[
        { title: 'Event flow', description: 'Organize upcoming, live, and completed gatherings with themes, dates, location, virtual links, and attendance capacity.' },
        { title: 'Sermon support', description: 'Connect conference themes to the sermon engine so leaders can prepare teaching outlines and discussion questions.' },
        { title: 'Reflection loop', description: 'Capture attendee reflections after each event so the church can learn, follow up, and serve people better.' },
      ]}
      intelligence={[
        { title: 'Theme-aware ministry', description: 'Conference data can guide sermons, worship sets, prayer rooms, and community announcements.' },
        { title: 'Replay-ready structure', description: 'Completed services can be connected to replay links and summary notes for members who missed the event.' },
        { title: 'Attendance intelligence', description: 'Registration and attendance records support planning, capacity, and pastoral follow-up.' },
      ]}
      safeguards={[
        'Authenticated participation routes',
        'Admin-managed conference data',
        'Prayer and reflection privacy',
        'Audit-ready ministry operations',
      ]}
    />
  );
}
