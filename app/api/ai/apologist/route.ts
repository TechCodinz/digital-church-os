import { NextResponse } from 'next/server';
import { OpenAI } from 'openai';
import { buildApologeticTurn } from '@/lib/ai/shared/offlineTheology';

export const dynamic = 'force-dynamic';

/**
 * "Will" — the AI Apologist, with multi-turn debate memory.
 * Accepts { message, history?, lastTopic? } and carries the conversation forward,
 * advancing through deeper rebuttal layers rather than repeating itself.
 */
export async function POST(req: Request) {
    try {
        const { message = '', history = [], lastTopic } = await req.json();
        if (!message.trim()) {
            return NextResponse.json({ error: 'A message is required' }, { status: 400 });
        }

        // Depth = how many times Will has already replied in this thread.
        const priorAssistantTurns = Array.isArray(history)
            ? history.filter((m: any) => m.role === 'assistant').length
            : 0;

        if (process.env.OPENAI_API_KEY) {
            try {
                const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
                const messages = [
                    {
                        role: 'system' as const,
                        content:
                            'You are "Will", a world-class Christian apologist for viral faith conversations. ' +
                            'Engage the running debate with rigor and warmth: acknowledge the prior points, do not repeat yourself, ' +
                            'use logic, evidence, and Scripture, and end with a sharp but gracious turning question. Keep it under 160 words.',
                    },
                    ...(Array.isArray(history) ? history.slice(-6).map((m: any) => ({ role: m.role, content: String(m.content || '') })) : []),
                    { role: 'user' as const, content: message },
                ];
                const completion = await openai.chat.completions.create({
                    model: 'gpt-4o',
                    messages,
                    temperature: 0.6,
                    max_tokens: 400,
                });
                const content = completion.choices[0]?.message?.content || '';
                const turn = buildApologeticTurn(message, { turnIndex: priorAssistantTurns, lastTopic });
                return NextResponse.json({
                    success: true,
                    topic: turn.topic,
                    label: turn.label,
                    response: content || turn.response,
                    suggestedVerses: turn.scriptures,
                    turningQuestion: turn.turningQuestion,
                    turnIndex: turn.turnIndex,
                });
            } catch (err) {
                console.error('Apologist AI error, using offline reasoning:', err);
            }
        }

        // Offline, always-on reasoned apologetics with debate memory.
        const turn = buildApologeticTurn(message, { turnIndex: priorAssistantTurns, lastTopic });
        return NextResponse.json({
            success: true,
            topic: turn.topic,
            label: turn.label,
            response: `${turn.response}\n\n💬 To turn the conversation: ${turn.turningQuestion}`,
            suggestedVerses: turn.scriptures,
            turningQuestion: turn.turningQuestion,
            turnIndex: turn.turnIndex,
        });
    } catch (error) {
        console.error('Apologist route error:', error);
        return NextResponse.json({ error: 'Failed to respond' }, { status: 500 });
    }
}
