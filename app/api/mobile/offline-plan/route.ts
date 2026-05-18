import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    offlineCapabilities: [
      'Prayer drafts saved locally',
      'Journal drafts saved locally',
      'Cached devotional plan',
      'Low-data sermon notes',
      'Queued sync when connection returns',
    ],
    notificationRoadmap: [
      'Prayer reminder',
      'Event reminder',
      'Care follow-up reminder',
      'Daily devotional nudge',
      'Giving receipt notification',
    ],
    lowDataMode: true,
    nativeAppRoadmap: ['Push notifications', 'Audio sermon downloads', 'Voice prayer notes', 'Family devotional reminders', 'Local language packs'],
  });
}
