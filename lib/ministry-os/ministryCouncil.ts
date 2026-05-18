import { BookOpenText, Brain, HeartHandshake, Mic2, ShieldAlert, Users, WalletCards } from 'lucide-react';

export const ministryCouncilRoles = [
  {
    id: 'ai-pastor',
    name: 'AI Pastor',
    scope: 'Spiritual encouragement, prayer support, and safe pastoral reflection.',
    limit: 'Does not replace clergy, emergency support, therapy, or final spiritual authority.',
    route: '/spiritual',
    icon: HeartHandshake,
  },
  {
    id: 'sermon-assistant',
    name: 'AI Sermon Assistant',
    scope: 'Sermon drafts, outlines, questions, devotionals, and multi-age teaching packs.',
    limit: 'Human leaders must review doctrine, tone, and final delivery.',
    route: '/sermons',
    icon: BookOpenText,
  },
  {
    id: 'worship-director',
    name: 'AI Worship Director',
    scope: 'Worship lyrics, chord suggestions, service atmosphere, and choir preparation.',
    limit: 'Generated songs are drafts for worship-leader review.',
    route: '/choir',
    icon: Mic2,
  },
  {
    id: 'care-guardian',
    name: 'Care Guardian',
    scope: 'Care escalation, crisis awareness, support flags, and human handoff suggestions.',
    limit: 'Not emergency dispatch. Always directs crisis users to local emergency help.',
    route: '/care',
    icon: ShieldAlert,
  },
  {
    id: 'admin-operator',
    name: 'AI Admin Operator',
    scope: 'CRM signals, operational reminders, support queues, member follow-up, and reporting.',
    limit: 'Cannot make financial or governance decisions without human approval.',
    route: '/admin',
    icon: Users,
  },
  {
    id: 'transparency-analyst',
    name: 'Transparency Analyst',
    scope: 'Giving trends, aid reporting, purpose allocation, and privacy-safe impact summaries.',
    limit: 'Reports must be verified against official finance records before publishing.',
    route: '/transparency',
    icon: WalletCards,
  },
  {
    id: 'raizion-intelligence',
    name: 'Raizion Intelligence',
    scope: 'Ministry-wide signals, priorities, outreach ideas, care focus, and weekly strategy.',
    limit: 'Strategic advisor only; human leaders remain responsible for decisions.',
    route: '/intelligence',
    icon: Brain,
  },
];

export function getCouncilBriefing() {
  return {
    generatedAt: new Date().toISOString(),
    mission: 'Coordinate AI ministry roles so every feature supports care, teaching, worship, giving, operations, and follow-up without replacing human leadership.',
    operatingRules: [
      'Every AI role must show its scope and limitations.',
      'Sensitive care and crisis cases must escalate to human support.',
      'Generated sermon, worship, and children content must be reviewed before public use.',
      'Financial and aid decisions require human approval and audit trails.',
      'Privacy-first defaults apply to prayer, children, aid, counseling, and family data.',
    ],
    roles: ministryCouncilRoles.map(({ icon, ...role }) => role),
  };
}
