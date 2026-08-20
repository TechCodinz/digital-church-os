import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    serviceFlow: [
      'Welcome and opening prayer',
      'Worship set',
      'Scripture reading',
      'Sermon message',
      'Prayer response and care escalation',
      'Offering and transparency reminder',
      'Announcements and next steps',
      'Post-service follow-up',
    ],
    interactiveModules: ['/prayer-room', '/sermons', '/choir', '/care', '/offering', '/community-wall'],
    followUpAutomation: ['Prayer requests', 'New believer response', 'Support requests', 'Giving receipts', 'Event registration', 'Small group invitation'],
    readinessChecklist: ['Sermon content pack generated', 'Worship set prepared', 'Care team assigned', 'Offering route tested', 'Live chat moderation ready', 'Replay/follow-up plan ready'],
  });
}
