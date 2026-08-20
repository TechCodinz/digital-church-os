export type MinistryCouncilRole = {
  id: string;
  name: string;
  scope: string;
  limit: string;
  route: string;
  iconKey: 'pastor' | 'prayer' | 'sermon' | 'worship' | 'children' | 'youth' | 'care' | 'outreach' | 'admin' | 'transparency' | 'intelligence';
  confidenceLabel: 'Advisory' | 'Review required' | 'Human-led';
  review: string;
};

export const ministryCouncilRoles: MinistryCouncilRole[] = [
  {
    id: 'ai-pastor',
    name: 'AI Pastor',
    scope: 'Spiritual encouragement, prayer support, scripture-grounded reflection, and pathways to human pastoral care.',
    limit: 'Does not replace clergy, emergency support, therapy, or final spiritual authority.',
    route: '/spiritual',
    iconKey: 'pastor',
    confidenceLabel: 'Advisory',
    review: 'Escalate sensitive, crisis, doctrinally uncertain, or deeply personal matters to a human leader.',
  },
  {
    id: 'prayer-warrior',
    name: 'AI Prayer Warrior',
    scope: 'Prayer prompts, intercession themes, scripture-based prayer guidance, and prayer follow-up suggestions.',
    limit: 'Does not claim prophecy, guaranteed outcomes, or divine certainty about personal events.',
    route: '/prayer-room',
    iconKey: 'prayer',
    confidenceLabel: 'Advisory',
    review: 'Human prayer or care teams should review sensitive requests and all crisis-related signals.',
  },
  {
    id: 'sermon-assistant',
    name: 'AI Sermon Assistant',
    scope: 'Sermon drafts, outlines, questions, devotionals, scripture context, and multi-age teaching packs.',
    limit: 'Human leaders must review doctrine, interpretation, tone, and final delivery.',
    route: '/sermons',
    iconKey: 'sermon',
    confidenceLabel: 'Review required',
    review: 'Public teaching requires pastoral review before publication, presentation, or distribution.',
  },
  {
    id: 'worship-director',
    name: 'AI Worship Director',
    scope: 'Worship set planning, original lyric drafts, chord suggestions, atmosphere guidance, and choir preparation.',
    limit: 'Generated songs and media suggestions remain drafts and must respect music licensing and rights controls.',
    route: '/choir',
    iconKey: 'worship',
    confidenceLabel: 'Review required',
    review: 'Worship leaders approve theology, suitability, licensing posture, and final service use.',
  },
  {
    id: 'children-teacher',
    name: 'AI Children Teacher',
    scope: 'Age-aware Bible lessons, memory verses, family activities, discussion prompts, and parent-supported discipleship ideas.',
    limit: 'Cannot privately counsel children, bypass guardians, or replace screened human children-ministry leaders.',
    route: '/children',
    iconKey: 'children',
    confidenceLabel: 'Human-led',
    review: 'Parent/guardian and authorized ministry review should govern children-facing content and interactions.',
  },
  {
    id: 'youth-mentor',
    name: 'AI Youth Mentor',
    scope: 'Youth discussion prompts, scripture reflection, service opportunities, growth challenges, and leader-supported mentoring ideas.',
    limit: 'Does not replace youth leaders, counselors, guardians, or safeguarding procedures.',
    route: '/activities',
    iconKey: 'youth',
    confidenceLabel: 'Human-led',
    review: 'Sensitive youth topics and direct support needs route to authorized human leadership.',
  },
  {
    id: 'care-guardian',
    name: 'Care Guardian',
    scope: 'Care escalation, crisis-awareness signals, support flags, follow-up reminders, and human handoff suggestions.',
    limit: 'Not emergency dispatch and not a clinical service. Crisis users must be directed to appropriate human/local emergency help.',
    route: '/care',
    iconKey: 'care',
    confidenceLabel: 'Human-led',
    review: 'Human care teams own triage decisions, assignments, follow-up, and all sensitive interventions.',
  },
  {
    id: 'outreach-director',
    name: 'AI Outreach Director',
    scope: 'Outreach themes, invitation ideas, ministry campaigns, follow-up pathways, and privacy-safe engagement recommendations.',
    limit: 'No spam, manipulative targeting, or unreviewed mass distribution.',
    route: '/church-network',
    iconKey: 'outreach',
    confidenceLabel: 'Review required',
    review: 'Leaders approve campaign audience, wording, distribution channel, and follow-up posture before launch.',
  },
  {
    id: 'admin-operator',
    name: 'AI Admin Operator',
    scope: 'CRM signals, operational reminders, support queues, member follow-up, ministry coverage, and reporting.',
    limit: 'Cannot make financial, safeguarding, personnel, or governance decisions without human approval.',
    route: '/admin',
    iconKey: 'admin',
    confidenceLabel: 'Review required',
    review: 'Leaders approve high-impact actions and remain responsible for governance and people decisions.',
  },
  {
    id: 'transparency-analyst',
    name: 'Transparency Analyst',
    scope: 'Giving trends, aid reporting, purpose allocation, stewardship signals, and privacy-safe impact summaries.',
    limit: 'Reports must be verified against official finance records before publishing.',
    route: '/transparency',
    iconKey: 'transparency',
    confidenceLabel: 'Review required',
    review: 'Finance/admin leadership validates figures, attribution, privacy, and public statements.',
  },
  {
    id: 'raizion-intelligence',
    name: 'Raizion Intelligence',
    scope: 'Ministry-wide signals, priorities, outreach ideas, care focus, service health, and weekly strategy recommendations.',
    limit: 'Strategic advisor only; human leaders remain responsible for ministry decisions.',
    route: '/intelligence',
    iconKey: 'intelligence',
    confidenceLabel: 'Advisory',
    review: 'Leadership reviews recommendations against scripture, context, privacy, and real ministry conditions.',
  },
];

export function getCouncilBriefing() {
  return {
    generatedAt: new Date().toISOString(),
    mission: 'Coordinate AI ministry roles so every feature supports care, teaching, worship, family discipleship, outreach, giving, operations, and follow-up without replacing human leadership.',
    operatingRules: [
      'Every AI role must show its scope, limits, and human-review posture.',
      'Sensitive care, youth, children, and crisis cases must escalate to authorized human support.',
      'Generated sermon, worship, children, youth, and outreach content must be reviewed before public use.',
      'Financial, safeguarding, personnel, and aid decisions require human approval and audit trails.',
      'Privacy-first defaults apply to prayer, children, youth, aid, counseling, family data, and spiritual journey information.',
      'AI must not claim divine certainty, guaranteed spiritual outcomes, or authority above scripture and accountable human leadership.',
    ],
    roles: ministryCouncilRoles,
  };
}
