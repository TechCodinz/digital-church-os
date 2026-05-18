import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const MultilingualPlanSchema = z.object({
  sourceLanguage: z.string().trim().min(2).max(40).default('English'),
  targetLanguages: z.array(z.string().trim().min(2).max(40)).max(12).default(['Spanish', 'French', 'Yoruba', 'Igbo', 'Hausa']),
  contentType: z.enum(['sermon', 'prayer', 'devotional', 'children_lesson', 'live_caption']).default('sermon'),
});

export async function POST(req: NextRequest) {
  const parsed = MultilingualPlanSchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: 'Invalid multilingual plan payload', details: parsed.error.flatten() }, { status: 400 });

  const { sourceLanguage, targetLanguages, contentType } = parsed.data;
  return NextResponse.json({
    sourceLanguage,
    targetLanguages,
    contentType,
    workflow: [
      'Extract scripture references and theological claims.',
      'Translate plain-language draft.',
      'Human review for theology and cultural context.',
      'Generate low-data text version.',
      'Publish with language selector and local care resources.',
    ],
    safeguards: ['Human review required', 'No unsupported prophecy claims', 'Local crisis resources by country', 'Avoid idioms that do not translate clearly'],
  });
}

export async function GET() {
  return NextResponse.json({ supportedRoadmap: ['Spanish', 'French', 'Portuguese', 'Yoruba', 'Igbo', 'Hausa', 'Arabic', 'Swahili'], status: 'translation-planning-mvp' });
}
