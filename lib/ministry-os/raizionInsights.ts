export type MinistrySignal = {
  label: string;
  value: number;
  trend: 'up' | 'down' | 'stable';
  insight: string;
};

export type RaizionMinistryReport = {
  generatedAt: string;
  healthScore: number;
  urgentPriorities: string[];
  signals: MinistrySignal[];
  recommendedActions: string[];
  sermonSuggestions: string[];
  outreachIdeas: string[];
  careTeamFocus: string[];
};

export function generateRaizionMinistryReport(seed?: Partial<RaizionMinistryReport>): RaizionMinistryReport {
  return {
    generatedAt: new Date().toISOString(),
    healthScore: seed?.healthScore ?? 82,
    urgentPriorities: seed?.urgentPriorities ?? [
      'Review open care and support requests within 24 hours.',
      'Follow up with members who submitted crisis-sensitive prayers.',
      'Prepare next sermon content pack before the next live service.',
    ],
    signals: seed?.signals ?? [
      { label: 'Prayer activity', value: 74, trend: 'up', insight: 'Members are engaging spiritually; convert repeated themes into sermon and care topics.' },
      { label: 'Support requests', value: 41, trend: 'stable', insight: 'Aid workflows need clear reviewer ownership and transparent allocation.' },
      { label: 'Family discipleship', value: 56, trend: 'up', insight: 'Children and family features can become a retention engine.' },
      { label: 'Giving transparency', value: 62, trend: 'stable', insight: 'Publish impact summaries to strengthen trust and recurring giving.' },
    ],
    recommendedActions: seed?.recommendedActions ?? [
      'Assign one care leader to review urgent support requests daily.',
      'Turn next sermon into children, youth, newsletter, video, and devotional assets.',
      'Publish a monthly transparency report with privacy-safe impact stories.',
      'Invite members into a small group or prayer room after live service.',
    ],
    sermonSuggestions: seed?.sermonSuggestions ?? [
      'Faith under pressure',
      'Healing without isolation',
      'Mercy that becomes action',
      'Families growing in wisdom',
    ],
    outreachIdeas: seed?.outreachIdeas ?? [
      'Launch a 5-day devotional challenge connected to the next sermon.',
      'Create a public prayer wall campaign with anonymous privacy controls.',
      'Offer a community aid Sunday with transparent fund reporting.',
    ],
    careTeamFocus: seed?.careTeamFocus ?? [
      'Crisis flags and high-risk counseling logs',
      'Members with repeated private prayer requests',
      'New members who registered but have no activity yet',
      'Families with children profiles but no devotional plan started',
    ],
  };
}
