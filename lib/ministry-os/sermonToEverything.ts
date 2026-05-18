export type SermonContentPackInput = {
  theme: string;
  scriptureRefs?: string[];
  audience?: 'general' | 'children' | 'youth' | 'leaders';
};

export type SermonContentPack = {
  theme: string;
  scriptureRefs: string[];
  sermonOutline: string[];
  childrenLesson: string[];
  youthDiscussion: string[];
  worshipSet: string[];
  prayerPoints: string[];
  socialPosts: string[];
  newsletter: string;
  videoScript: string;
  bulletin: string[];
  devotionalPlan: Array<{ day: string; focus: string; action: string }>;
};

const fallbackRefs = ['Matthew 11:28', 'Psalm 34:18', 'Micah 6:8'];

export function generateSermonContentPack(input: SermonContentPackInput): SermonContentPack {
  const theme = input.theme.trim();
  const refs = input.scriptureRefs?.length ? input.scriptureRefs : fallbackRefs;

  return {
    theme,
    scriptureRefs: refs,
    sermonOutline: [
      `Opening: name the human need behind ${theme}.`,
      `Scripture foundation: read ${refs[0]} and connect it to the congregation's current season.`,
      `Main Point 1: God invites honesty, not performance.`,
      `Main Point 2: Faith grows through community, mercy, and wise action.`,
      `Main Point 3: The message must become a practical step this week.`,
      'Close with prayer, invitation, and care-team follow-up.',
    ],
    childrenLesson: [
      `Big idea: God cares about ${theme.toLowerCase()} in our everyday life.`,
      'Object lesson: use a backpack to show that we should not carry heavy things alone.',
      'Memory verse: Matthew 11:28.',
      'Activity: write or draw one thing to give to God in prayer.',
    ],
    youthDiscussion: [
      `Where do young people feel pressure around ${theme.toLowerCase()}?`,
      'How can faith become practical without becoming fake?',
      'Who is one trusted person you can talk to this week?',
      'What is one courageous decision you can make in private?',
    ],
    worshipSet: [
      `Opening song around ${theme}`,
      'Reflective worship moment after scripture reading',
      'Congregational response song after the sermon',
      'Soft instrumental prayer background for care-team ministry',
    ],
    prayerPoints: [
      `Pray for wisdom and peace around ${theme.toLowerCase()}.`,
      'Pray for families carrying hidden burdens.',
      'Pray for courage to ask for help before crisis grows.',
      'Pray that the church becomes a place of mercy and truth.',
    ],
    socialPosts: [
      `This week we are reflecting on ${theme}. You are not meant to carry your burdens alone.`,
      `According to scripture, rest is not weakness. Join us as we explore ${theme}.`,
      `One sermon. One family lesson. One youth discussion. One practical step. ${theme} continues all week.`,
    ],
    newsletter: `This week at Digital Church OS, our focus is ${theme}. We will connect the sermon, children's lesson, youth discussion, worship, and prayer room around ${refs.join(', ')}. Come ready to reflect, receive support, and take one practical step of faith.`,
    videoScript: `Opening shot: calm sanctuary light. Voiceover: "What does scripture teach us about ${theme}?" Cut to pastor invitation, worship moment, prayer room prompt, and closing action step: "Take one step toward faith, care, and community this week."`,
    bulletin: [
      `Theme: ${theme}`,
      `Scriptures: ${refs.join(', ')}`,
      'Service Flow: Welcome → Worship → Scripture → Sermon → Prayer → Giving → Follow-up',
      'Next Step: Visit the prayer room or care team after service.',
    ],
    devotionalPlan: [
      { day: 'Day 1', focus: `Name your burden around ${theme}`, action: 'Write one honest prayer.' },
      { day: 'Day 2', focus: `Read ${refs[0]}`, action: 'Underline one phrase that gives hope.' },
      { day: 'Day 3', focus: 'Community support', action: 'Message one trusted person.' },
      { day: 'Day 4', focus: 'Mercy in action', action: 'Serve one person quietly.' },
      { day: 'Day 5', focus: 'Review and surrender', action: 'Journal what changed this week.' },
    ],
  };
}
