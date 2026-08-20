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
    text: 'Open this passage in your selected Bible translation.',
    application: 'You are not meant to carry pain alone; seek support and take the next safe step.',
  },
  {
    reference: 'Matthew 11:28',
    text: 'Open this passage in your selected Bible translation.',
    application: 'Spiritual rest can begin with honesty, prayer, and asking trusted people for help.',
  },
];

export class RealCounselor {
  private openai: OpenAI | null;
  private scriptureLoader: ScriptureLoader;
  private guardrails: TheologicalGuardrails;

  private crisisKeywords = [
    'suicide', 'kill myself', 'end my life', 'want to die',
    'self-harm', 'cut myself', 'hurt myself', 'immediate danger',
    'being abused', 'someone will hurt me',
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
        concern: '[sensitive concern intentionally not persisted]',
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
            content: `You provide gentle Christian spiritual encouragement. Return JSON only: { reflection, scriptureReferences: [string], practicalSteps: [string] }. Never claim divine revelation. Never diagnose. Never replace licensed counseling, medical care, safeguarding authorities, or emergency help. Do not fabricate Bible quotations; return Scripture references and generated reflection only unless exact passage text is present in the supplied context.`,
          },
          {
            role: 'user',
            content: `Concern: ${session.concern}\nContextual Scripture material from the configured Scripture source:\n${searchResults.map((s: any) => `${s.reference}: ${s.text}`).join('\n')}`,
          },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.55,
      });

      const responseData = JSON.parse(completion.choices[0]?.message?.content || '{}');
      const verifiedVerses = await this.safeGetVerses(responseData.scriptureReferences || []);
      const safeReflection = await this.guardrails.apply(responseData.reflection || this.defaultReflection());

      await AILogger.logCounselingSession({
        userId: session.userId,
        concern: '[sensitive concern intentionally not persisted]',
        riskLevel: 'low',
        responseType: 'counseling',
      });

      return {
        type: 'counseling',
        content: {
          reflection: safeReflection,
          scriptures: verifiedVerses.length
            ? verifiedVerses.map((v: any) => ({
                reference: v.reference,
                text: v.text || 'Open this passage in your selected Bible translation.',
                application: 'Pause with this passage, pray honestly, and consider one practical step with human support.',
              }))
            : DEFAULT_SCRIPTURES,
          practicalSteps: Array.isArray(responseData.practicalSteps) && responseData.practicalSteps.length
            ? responseData.practicalSteps.slice(0, 6)
            : this.defaultPracticalSteps(),
        },
        disclaimer: 'This AI provides spiritual support and does not replace clergy, emergency services, medical professionals, safeguarding authorities, or licensed counselors.',
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
    const normalized = text.toLowerCase();
    return this.crisisKeywords.some((kw) => normalized.includes(kw));
  }

  private fallbackCounsel(_session: CounselingSession): CounselingResponse {
    return {
      type: 'encouragement',
      content: {
        reflection: this.defaultReflection(),
        scriptures: DEFAULT_SCRIPTURES,
        practicalSteps: this.defaultPracticalSteps(),
      },
      disclaimer: 'AI generation is currently limited. This response is a safe spiritual fallback and does not replace clergy, emergency services, medical professionals, safeguarding authorities, or licensed counselors.',
    };
  }

  private defaultReflection() {
    return 'Thank you for sharing this. What you described deserves patience, prayer, and wise human support. Take one grounded step today: pause, pray honestly, and reach out to a trusted pastor, counselor, mentor, family member, or caring person who can walk with you.';
  }

  private defaultPracticalSteps() {
    return [
      'Pause and name what you are feeling without judging yourself.',
      'Pray simply and honestly for strength, wisdom, and peace.',
      'Speak with a trusted pastor, counselor, mentor, family member, or mature friend.',
      'Write down one small practical next step you can take today.',
      'If there is immediate danger or crisis, contact the appropriate local emergency or crisis service and a trusted person nearby.',
    ];
  }

  private handleCrisis(): CounselingResponse {
    return {
      type: 'crisis',
      content: {
        reflection: 'Your safety matters right now. This needs immediate human support rather than an AI-generated counseling conversation.',
        scriptures: [
          {
            reference: 'Psalm 34:18',
            text: 'Open this passage in your selected Bible translation.',
            application: 'You are not meant to face this alone; seek immediate human support.',
          },
        ],
        practicalSteps: [
          'Contact the appropriate local emergency or crisis service if there is immediate danger.',
          'Reach a trusted person who can stay with you or help you get to a safe place.',
          'Move away from immediate hazards when you can do so safely.',
          'Use the church care pathway for human pastoral follow-up when appropriate.',
        ],
        resources: {
          emergency: 'Use the appropriate local emergency or crisis service for the user’s location.',
          pastoralCare: '/care',
        },
      },
      disclaimer: 'CRISIS HANDOFF: Seek immediate professional or emergency help. This AI cannot provide emergency care.',
    };
  }
}
