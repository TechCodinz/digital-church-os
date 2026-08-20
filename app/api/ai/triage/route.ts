import { NextResponse } from 'next/server';
import { OpenAI } from 'openai';
import { buildApologetic, buildTheologicalInsight, detectTone, toneVoice } from '@/lib/ai/shared/offlineTheology';

type CompanionMode = 'pastor' | 'prayer_warrior' | 'counselor' | 'apologist';
type RiskLevel = 'normal' | 'sensitive' | 'urgent';

function detectRisk(prompt: string): RiskLevel {
    const text = prompt.toLowerCase();
    if (/\b(kill myself|end my life|suicide|suicidal|hurt myself|self[- ]harm|someone will kill me|immediate danger|being attacked)\b/i.test(text)) {
        return 'urgent';
    }
    if (/\b(abuse|abused|violence|violent|trauma|depress|grief|panic|anxiety|mental health|marriage crisis|domestic)\b/i.test(text)) {
        return 'sensitive';
    }
    return 'normal';
}

function sanitizePersona(value: unknown): CompanionMode | null {
    return value === 'pastor' || value === 'prayer_warrior' || value === 'counselor' || value === 'apologist'
        ? value
        : null;
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const prompt = typeof body?.prompt === 'string' ? body.prompt.trim().slice(0, 6000) : '';
        const requestedPersona = sanitizePersona(body?.requestedPersona);

        if (!prompt) {
            return NextResponse.json({ error: 'Prompt is required for triage' }, { status: 400 });
        }

        const riskLevel = detectRisk(prompt);
        const humanCareRecommended = riskLevel !== 'normal';

        if (requestedPersona === 'apologist') {
            const apol = buildApologetic(prompt);
            return NextResponse.json({
                success: true,
                recommendedPersona: 'apologist',
                topic: apol.topic,
                triageReason: 'Faith-question mode selected.',
                initialResponse: apol.response,
                suggestedVerses: apol.scriptures,
                riskLevel,
                humanCareRecommended,
                escalateToHumanPastor: humanCareRecommended,
                boundaryNote: 'This is study and reflection assistance, not pastoral office, prophecy, diagnosis, or emergency care.',
            });
        }

        let triageResult: any = null;

        if (process.env.OPENAI_API_KEY) {
            try {
                const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
                const response = await openai.chat.completions.create({
                    model: 'gpt-4o',
                    messages: [
                        {
                            role: 'system',
                            content: `You are a bounded Christian reflection and routing assistant inside Digital Church OS.

Your job is to choose one SUPPORT MODE, not impersonate a clergy role or clinician:
- "pastor": Scripture study and general spiritual reflection.
- "prayer_warrior": help the user put a concern into humble Scripture-grounded prayer. Do not promise healing, deliverance, miracles, prophecy, or spiritual certainty.
- "counselor": gentle non-clinical reflection for grief, relationships, emotional burdens, or difficult life situations. Do not diagnose or provide clinical treatment.

Rules:
- Never claim to be a pastor, counselor, prophet, healer, spiritual authority, or representative of God.
- Never claim God told you something specific about the user.
- Never promise physical healing, deliverance, financial outcomes, reconciliation, or other results.
- Keep Scripture distinct from your interpretation.
- For severe danger, self-harm, abuse, or crisis, recommend immediate human/local emergency support and accountable human pastoral care rather than continuing as the primary support channel.

Return JSON exactly:
{
  "recommendedPersona": "counselor" | "prayer_warrior" | "pastor",
  "triageReason": "short routing reason",
  "initialResponse": "careful initial response",
  "suggestedVerses": ["Book Chapter:Verse"]
}`
                        },
                        { role: 'user', content: prompt }
                    ],
                    response_format: { type: 'json_object' },
                    temperature: 0.35,
                });

                triageResult = JSON.parse(response.choices[0]?.message?.content || '{}');
            } catch (error) {
                console.error('Triage AI error:', error);
            }
        }

        if (!triageResult || !sanitizePersona(triageResult.recommendedPersona)) {
            const lower = prompt.toLowerCase();
            const apologeticsCue = /\b(prove|proof|debate|argument|objection|skeptic|atheis|contradict|no evidence|science|evolution|other religions|resurrection|problem of evil|refute|apolog)\b/i.test(prompt);

            if (apologeticsCue) {
                const apol = buildApologetic(prompt);
                triageResult = {
                    recommendedPersona: 'apologist',
                    topic: apol.topic,
                    triageReason: 'Detected a faith or apologetics question.',
                    initialResponse: apol.response,
                    suggestedVerses: apol.scriptures,
                };
            } else {
                let persona: CompanionMode = 'pastor';
                let reason = 'General spiritual reflection routed to Scripture study mode.';
                let responseText = 'I can help you slow this down, look at relevant Scripture, and identify a thoughtful next step.';
                let verses = ['Psalm 23:1', 'Proverbs 3:5-6'];

                if (/\b(anxious|anxiety|depress|sad|lonely|marriage|grief|trauma|panic|relationship)\b/i.test(lower)) {
                    persona = 'counselor';
                    reason = 'This sounds emotionally significant, so the reflection mode is prioritizing gentle listening and human-care options.';
                    responseText = 'There is real weight in what you described. We can reflect carefully, keep the conversation non-clinical, and make human support easy to reach.';
                    verses = ['Psalm 34:18', '1 Peter 5:7'];
                } else if (/\b(pray|prayer|sick|urgent|burden|intercede|healing)\b/i.test(lower)) {
                    persona = 'prayer_warrior';
                    reason = 'Your message sounds like a request for prayer support.';
                    responseText = 'I can help you put this concern into a humble, Scripture-grounded prayer without promising a particular outcome.';
                    verses = ['Philippians 4:6-7', 'James 5:13'];
                }

                const finalPersona = requestedPersona && requestedPersona !== 'apologist' ? requestedPersona : persona;
                if (finalPersona === 'pastor' && riskLevel === 'normal') {
                    const tone = detectTone(prompt);
                    const voice = toneVoice(tone);
                    const insight = buildTheologicalInsight(prompt);
                    responseText = `${voice.opener} ${insight.exegesis}`;
                    verses = insight.crossReferences.slice(0, 3).map((verse) => verse.reference);
                }

                triageResult = {
                    recommendedPersona: finalPersona,
                    triageReason: reason,
                    initialResponse: responseText,
                    suggestedVerses: verses,
                };
            }
        }

        if (riskLevel === 'urgent') {
            triageResult.initialResponse = 'What you described may require immediate human support. If there is immediate danger, contact local emergency services or a trusted person nearby now. This assistant can stay limited to simple grounding, prayer, and helping you move toward accountable human support.';
        }

        return NextResponse.json({
            success: true,
            ...triageResult,
            riskLevel,
            humanCareRecommended,
            escalateToHumanPastor: humanCareRecommended,
            boundaryNote: 'AI supports Scripture study, prayer wording, and reflection. It does not hold pastoral office, provide clinical care, deliver prophecy, or replace emergency services and accountable human support.',
        });
    } catch (error: any) {
        console.error('Triage route error:', error);
        return NextResponse.json({
            success: true,
            recommendedPersona: 'pastor',
            triageReason: 'Fallback Scripture reflection mode.',
            initialResponse: 'The intelligent guide is temporarily unavailable. You can still open Scripture, write a prayer, or request human pastoral follow-up.',
            suggestedVerses: ['John 14:27'],
            riskLevel: 'normal',
            humanCareRecommended: false,
            escalateToHumanPastor: false,
            boundaryNote: 'AI support is informational and reflective only.',
        });
    }
}
