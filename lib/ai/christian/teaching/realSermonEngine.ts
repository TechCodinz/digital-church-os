import { OpenAI } from 'openai';
import { ScriptureLoader } from '@/lib/ai/scripture/loader';
import { TheologicalGuardrails } from '@/lib/ai/guardrails/theologicalGuardrails';
import { AILogger } from '@/lib/audit/aiLogger';

interface SermonParams {
  theme: string;
  scriptureRefs: string[];
  style: 'expository' | 'topical' | 'narrative';
  denomination?: 'general' | 'reformed' | 'baptist' | 'catholic';
  audience?: 'general' | 'youth' | 'scholars';
  userId: string;
}

interface SermonResponse {
  title: string;
  theme: string;
  scriptureRefs: string[];
  outline: {
    introduction: string;
    points: Array<{
      title: string;
      scripture: string;
      explanation: string;
      application: string;
    }>;
    conclusion: string;
  };
  fullSermon?: string;
  discussionQuestions?: string[];
  visuals?: {
    image?: string | null;
    video?: string | null;
  };
}

export class RealSermonEngine {
  private openai: OpenAI | null;
  private scriptureLoader: ScriptureLoader;
  private guardrails: TheologicalGuardrails;

  constructor() {
    this.openai = process.env.OPENAI_API_KEY ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) : null;
    this.scriptureLoader = new ScriptureLoader();
    this.guardrails = new TheologicalGuardrails();
  }

  async generateSermon(params: SermonParams): Promise<SermonResponse> {
    const startTime = Date.now();

    if (!this.openai) {
      return this.fallbackSermon(params);
    }

    try {
      const searchResults = await this.safeScriptureSearch(params.theme, 15);
      const theologicalContext = this.getTheologicalContext(params.denomination || 'general');
      const prompt = this.buildSermonPrompt(params, searchResults, theologicalContext);

      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are a theologically careful assistant helping church leaders draft sermons. Return valid JSON only. Never claim divine revelation. Never promise outcomes, healing, or prophecy. Use humble phrases like "According to scripture" and encourage consultation with church leaders.`,
          },
          { role: 'user', content: prompt },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.65,
      });

      const rawJson = completion.choices[0].message.content || '{}';
      const sermonData = JSON.parse(rawJson);
      const points = Array.isArray(sermonData.points) && sermonData.points.length ? sermonData.points : this.defaultPoints(params.theme);
      const references = points.map((p: any) => p.scripture).filter(Boolean);
      const verifiedVerses = await this.safeGetVerses(references);
      const safeSermon = await this.guardrails.apply(sermonData.fullSermon || this.composeFullSermon(params.theme, points));

      const finalSermon: SermonResponse = {
        title: sermonData.title || `${params.theme} Sermon`,
        theme: params.theme,
        scriptureRefs: verifiedVerses.length ? verifiedVerses.map((v: any) => v.reference) : references,
        outline: {
          introduction: sermonData.introduction || `Today we reflect on ${params.theme} through scripture, humility, and practical obedience.`,
          points: points.slice(0, 5).map((p: any, index: number) => ({
            title: p.title || `Point ${index + 1}`,
            scripture: verifiedVerses[index]?.reference || p.scripture || 'Matthew 11:28',
            explanation: p.explanation || 'According to scripture, this truth calls us to faith, patience, and wise action.',
            application: p.application || 'Apply this by praying honestly, serving someone nearby, and seeking wise counsel.',
          })),
          conclusion: sermonData.conclusion || 'May this message lead us toward love, humility, courage, and faithful action.',
        },
        fullSermon: safeSermon,
        discussionQuestions: Array.isArray(sermonData.discussionQuestions) ? sermonData.discussionQuestions.slice(0, 8) : this.defaultQuestions(params.theme),
      };

      await AILogger.logInteraction({
        userId: params.userId,
        module: 'sermon-engine',
        input: params,
        output: finalSermon,
        duration: Date.now() - startTime,
        model: 'gpt-4o-mini',
        tokens: completion.usage?.total_tokens,
      });

      return finalSermon;
    } catch (error) {
      console.error('Sermon generation error:', error);
      return this.fallbackSermon(params);
    }
  }

  private async safeScriptureSearch(theme: string, count: number) {
    try {
      return await this.scriptureLoader.semanticSearch(theme, count);
    } catch (error) {
      console.error('Sermon scripture search failed:', error);
      return [];
    }
  }

  private async safeGetVerses(refs: string[]) {
    try {
      return await this.scriptureLoader.getVerses(refs);
    } catch (error) {
      console.error('Sermon verse lookup failed:', error);
      return [];
    }
  }

  private fallbackSermon(params: SermonParams): SermonResponse {
    const points = this.defaultPoints(params.theme);
    return {
      title: `${params.theme} — A Scripture-Guided Message`,
      theme: params.theme,
      scriptureRefs: params.scriptureRefs?.length ? params.scriptureRefs : ['Matthew 11:28', 'Psalm 34:18', 'Micah 6:8'],
      outline: {
        introduction: `This message reflects on ${params.theme} with humility, care, and practical application.`,
        points,
        conclusion: 'Let this word lead us into prayer, service, and faithful action with love for God and neighbor.',
      },
      fullSermon: this.composeFullSermon(params.theme, points),
      discussionQuestions: this.defaultQuestions(params.theme),
    };
  }

  private defaultPoints(theme: string) {
    return [
      {
        title: 'Come honestly before God',
        scripture: 'Matthew 11:28',
        explanation: `According to scripture, ${theme} begins with honesty before God rather than performance.`,
        application: 'Invite the congregation to bring burdens into prayer and trusted community support.',
      },
      {
        title: 'Receive comfort without isolation',
        scripture: 'Psalm 34:18',
        explanation: 'Biblical teaching suggests God is near to the brokenhearted and calls people into compassionate care.',
        application: 'Encourage members to reach out to someone who needs comfort this week.',
      },
      {
        title: 'Practice faithful action',
        scripture: 'Micah 6:8',
        explanation: 'Faith matures through justice, mercy, and humble walking with God.',
        application: 'Give one practical action step for the congregation to live the message after service.',
      },
    ];
  }

  private defaultQuestions(theme: string) {
    return [
      `Where do you most need wisdom around ${theme}?`,
      'Which scripture from this message speaks most clearly to your current season?',
      'What is one practical act of mercy or obedience you can take this week?',
    ];
  }

  private composeFullSermon(theme: string, points: Array<{ title: string; scripture: string; explanation: string; application: string }>) {
    return [
      `Today we reflect on ${theme}. According to scripture, faithful living is not only belief but also surrender, wisdom, and loving action.`,
      ...points.map((point) => `${point.title} (${point.scripture}). ${point.explanation} ${point.application}`),
      'May this message form us into people of prayer, compassion, courage, and humble obedience.',
    ].join('\n\n');
  }

  private getTheologicalContext(denomination: string): string {
    const contexts: Record<string, string> = {
      general: 'Focus on core Christian doctrines accepted across denominations',
      reformed: 'Emphasize sovereignty of God, covenant theology, and grace with humility',
      baptist: "Include believer's baptism, local church autonomy, and priesthood of believers",
      catholic: 'Include sacramentality, church tradition, and pastoral sensitivity',
    };
    return contexts[denomination] || contexts.general;
  }

  private buildSermonPrompt(params: SermonParams, scriptures: any[], theologicalContext: string): string {
    const requestedRefs = params.scriptureRefs?.length ? params.scriptureRefs.join(', ') : 'Use the most relevant scriptures from context.';
    return `Generate a ${params.style} sermon on "${params.theme}".

Context:
- Denomination: ${params.denomination || 'general'}
- Audience: ${params.audience || 'general'}
- Requested references: ${requestedRefs}
- Theological guidelines: ${theologicalContext}

Relevant scripture context:
${scriptures.map((s) => `${s.reference}: "${s.text}"`).join('\n')}

Return JSON with title, introduction, points, conclusion, discussionQuestions, and fullSermon. Provide 3 main points.`;
  }
}
