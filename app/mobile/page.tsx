import { MinistryRoutePage } from '@/components/ministry/MinistryRoutePage';

export default function MobilePage() {
  return (
    <MinistryRoutePage
      badge="Mobile and offline church mode"
      emoji="📱"
      title="Keep members connected even when internet, power, or time is limited."
      description="Mobile/offline mode prepares the platform for daily devotionals, prayer reminders, push notifications, low-data access, offline journaling, and lightweight sermon/prayer experiences."
      primaryHref="/journey"
      primaryLabel="Open journey"
      secondaryHref="/prayer-room"
      secondaryLabel="Open prayer room"
      features={[
        { title: 'Offline-first spiritual habits', description: 'Prayer, journaling, and devotionals can remain usable when connectivity is unstable.' },
        { title: 'Push notification roadmap', description: 'Prayer reminders, event reminders, care follow-ups, and devotional nudges can bring members back daily.' },
        { title: 'Low-data ministry', description: 'Text-first pages and compact flows help churches serve members in bandwidth-constrained regions.' },
      ]}
      intelligence={[
        { title: 'Daily retention engine', description: 'Journey, prayer, devotionals, and reminders make the app useful beyond Sunday service.' },
        { title: 'Family-ready access', description: 'Parents and children can keep spiritual habits visible and simple on mobile.' },
        { title: 'Global readiness', description: 'Offline and low-data design supports churches across regions with unstable infrastructure.' },
      ]}
      safeguards={[
        'Offline data privacy',
        'User-controlled reminders',
        'Low-data fallback views',
        'Consent-based notifications',
      ]}
    />
  );
}
