import { OpenAI } from 'openai';
import { ScriptureLoader } from '@/lib/ai/scripture/loader';
import { AILogger } from '@/lib/audit/aiLogger';
import { TheologicalGuardrails } from '@/lib/ai/guardrails/theologicalGuardrails';

interface CounselingSession {
  userId: string;
  concern: string;
}

interface CounselingResponse {
  type: 'crisis' | 'counseling' | 'encouragement';
  content: {
    reflection: string;
    scriptures: Array<{
      reference: string;
      text: string;
      application: string;
    }>;
    practicalSteps: string[];
    resources?: Record<string, string>;
  };
  disclaimer: string;
}

const DEFAULT_SCRIPTURES = [
  {
    reference: 'Psalm 34:18',
    text: 'The LORD is close to the brokenhearted and saves those who are crushed in spirit.',
    application: 'You are not abandoned in pain; seek support and take the next safe step.',
  },
  {
    reference: 'Matthew 11:28',
    text: 'Come to me, all you who are weary and burdened, and I will give you rest.',
    application: 'Spiritual rest can begin with honesty, prayer, and asking trusted people for help.',
  },
];

export class RealCounselor {
  private openai: OpenAI | null;
  private scriptureLoader: ScriptureLoader;
  private guardrails: TheologicalGuardrails;

  private crisisKeywords = [
    'suicide', 'kill myself', 'end my life', 'want to die',
    'self-harm', 'cut myself', 'hurt myself', 'emergency',
  ];

  constructor() {
    this.openai = process.env.OPENAI_API_KEY ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) : null;
    this.scriptureLoader = new ScriptureLoader();
    this.guardrails = new TheologicalGuardrails();
  }

  async processSession(session: CounselingSession): Promise<CounselingResponse> {
    const isCrisis = this.detectCrisis(session.concern);

    if (isCrisis) {
      await AILogger.logCounselingSession({
        userId: session.userId,
        concern: session.concern,
        riskLevel: 'high',
        responseType: 'crisis',
      });
      return this.handleCrisis();
    }

    if (!this.openai) {
      return this.fallbackCounsel(session);
    }

    try {
      const searchResults = await this.safeScriptureSearch(session.concern, 8);
      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You provide gentle Christian spiritual encouragement. Return JSON only: { reflection, scriptureReferences: [string], practicalSteps: [string] }. Never claim divine revelation. Never replace licensed counseling or emergency help.`,
          },
          {
            role: 'user',
            content: `Concern: ${session.concern}\nContextual Scriptures:\n${searchResults.map((s: any) => `${s.reference}: ${s.text}`).join('\n')}`,
          },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.6,
      });

      const responseData = JSON.parse(completion.choices[0].message.content || '{}');
      const verifiedVerses = await this.safeGetVerses(responseData.scriptureReferences || []);
      const safeReflection = await this.guardrails.apply(responseData.reflection || this.defaultReflection(session.concern));

      await AILogger.logCounselingSession({
        userId: session.userId,
        concern: session.concern,
        riskLevel: 'low',
        responseType: 'counseling',
      });

      return {
        type: 'counseling',
        content: {
          reflection: safeReflection,
          scriptures: verifiedVerses.length ? verifiedVerses.map((v: any) => ({
            reference: v.reference,
            text: v.text,
            application: 'One way to apply this passage is to pause, pray, and take a practical step with support.',
          })) : DEFAULT_SCRIPTURES,
          practicalSteps: Array.isArray(responseData.practicalSteps) && responseData.practicalSteps.length
            ? responseData.practicalSteps.slice(0, 6)
            : this.defaultPracticalSteps(),
        },
        disclaimer: 'This AI provides spiritual support and does not replace clergy, emergency services, medical professionals, or licensed counselors.',
      };
    } catch (error) {
      console.error('Counseling generation error:', error);
      return this.fallbackCounsel(session);
    }
  }

  private async safeScriptureSearch(text: string, count: number) {
    try {
      return await this.scriptureLoader.semanticSearch(text, count);
    } catch (error) {
      console.error('Scripture search failed:', error);
      return [];
    }
  }

  private async safeGetVerses(refs: string[]) {
    try {
      return await this.scriptureLoader.getVerses(refs);
    } catch (error) {
      console.error('Verse lookup failed:', error);
      return [];
    }
  }

  private detectCrisis(text: string): boolean {
    return this.crisisKeywords.some((kw) => text.toLowerCase().includes(kw));
  }

  private fallbackCounsel(session: CounselingSession): CounselingResponse {
    return {
      type: 'encouragement',
      content: {
        reflection: this.defaultReflection(session.concern),
        scriptures: DEFAULT_SCRIPTURES,
        practicalSteps: this.defaultPracticalSteps(),
      },
      disclaimer: 'AI generation is currently limited. This response is a safe pastoral fallback and does not replace clergy, emergency services, medical professionals, or licensed counselors.',
    };
  }

  private defaultReflection(concern: string) {
    return `Thank you for sharing this. What you described matters, and it deserves patience, prayer, and wise support. According to scripture, burdens are not meant to be carried alone. Take one grounded step today: breathe, pray honestly, and reach out to a trusted spiritual leader or caring person who can walk with you.`;
  }

  private defaultPracticalSteps() {
    return [
      'Pause and name what you are feeling without judging yourself.',
      'Pray simply and honestly for strength, wisdom, and peace.',
      'Speak with a trusted pastor, counselor, mentor, or mature friend.',
      'Write down one small next step you can take today.',
      'If there is danger or crisis, contact local emergency services immediately.',
    ];
  }

  private handleCrisis(): CounselingResponse {
    return {
      type: 'crisis',
      content: {
        reflection: "I’m sorry you’re carrying this. Your safety matters right now. Please contact emergency help immediately or reach out to someone physically near you who can stay with you.",
        scriptures: [{ reference: 'Psalm 34:18', text: 'The LORD is close to the brokenhearted...', application: 'You are not meant to face this alone.' }],
        practicalSteps: ['Call local emergency services now if you are in immediate danger.', 'If you are in the U.S., call or text 988.', 'Move away from anything you could use to hurt yourself.', 'Contact a trusted person and ask them to stay with you.'],
        resources: { unitedStates: '988 Suicide & Crisis Lifeline', emergency: 'Local emergency services' },
      },
      disclaimer: 'CRISIS RESPONSE: Seek immediate professional or emergency help. This AI cannot provide emergency care.',
    };
  }
}
