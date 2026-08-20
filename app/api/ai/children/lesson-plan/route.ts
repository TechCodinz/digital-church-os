import { NextResponse } from 'next/server';
import { OpenAI } from 'openai';
import { findVersesForQuery } from '@/lib/ai/shared/offlineWisdom';

const AGE_GROUPS = new Set(['toddlers', 'elementary', 'youth', 'adults']);
const DURATIONS = new Set(['30 mins', '45 mins', '60 mins', '90 mins (Full Workshop)']);

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const ageGroup = AGE_GROUPS.has(body?.ageGroup) ? body.ageGroup : 'elementary';
        const topic = typeof body?.topic === 'string' && body.topic.trim() ? body.topic.trim().slice(0, 500) : 'Courage and trust';
        const duration = DURATIONS.has(body?.duration) ? body.duration : '45 mins';

        let lessonPlan: any = null;
        let generatedBy: 'openai' | 'offline-template' = 'offline-template';

        if (process.env.OPENAI_API_KEY) {
            try {
                const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
                const response = await openai.chat.completions.create({
                    model: 'gpt-4o',
                    messages: [
                        {
                            role: 'system',
                            content: `You are an adult-facing Christian lesson-planning assistant for teachers and parents. You are NOT speaking directly to a child and must not ask children to keep secrets, disclose private information, contact the AI, or rely on the AI instead of trusted adults.

Create an age-appropriate church lesson draft for age group: ${ageGroup}.

Rules:
- This is a teacher draft requiring adult review before use.
- Use Scripture REFERENCES instead of silently inventing Bible quotations.
- Avoid frightening spiritual-warfare, demon, punishment, or graphic violence framing for children.
- Do not diagnose children or promise healing, protection, prosperity, or divine outcomes.
- Activities must be physically age-safe and avoid weapons, fire, sharp tools, choking hazards, or unsafe demonstrations. Flag ordinary craft supplies that need adult supervision.
- Do not imitate copyrighted curriculum or named creators.
- Include a safeguarding note for the adult leader.

Return JSON exactly:
{
  "title": "string",
  "targetAgeGroup": "string",
  "scriptureReference": "Book Chapter:Verse",
  "teacherPrepChecklist": ["string"],
  "objectLesson": {"materials": ["string"], "instructions": "string"},
  "storyScript": "teacher-facing narrative draft",
  "activityCraft": {"name": "string", "steps": ["string"]},
  "discussionQuestions": ["string"],
  "safeguardingNote": "string"
}`
                        },
                        { role: 'user', content: `Topic or Scripture direction: ${topic}. Duration: ${duration}.` }
                    ],
                    response_format: { type: 'json_object' },
                    temperature: 0.45,
                });

                lessonPlan = JSON.parse(response.choices[0]?.message?.content || '{}');
                if (lessonPlan?.title) generatedBy = 'openai';
            } catch (error) {
                console.error('Lesson plan AI error:', error);
            }
        }

        if (!lessonPlan?.title) {
            const scriptureReference = findVersesForQuery(topic, 1)[0]?.reference || 'Psalm 56:3';
            lessonPlan = {
                title: `Teacher Draft — ${topic.slice(0, 90)}`,
                targetAgeGroup: ageGroup.toUpperCase(),
                scriptureReference,
                teacherPrepChecklist: [
                    `Read ${scriptureReference} in the translation used by your church or family.`,
                    'Review the lesson for age, reading level, denominational fit, accessibility, and any child-specific needs.',
                    'Prepare paper, washable markers or crayons, and other age-appropriate supplies with adult supervision.'
                ],
                objectLesson: {
                    materials: ['Paper', 'Washable markers or crayons'],
                    instructions: 'Invite learners to draw or write one situation where courage or trust matters. The adult leader connects their examples back to the Scripture reference without pressuring anyone to disclose private experiences.'
                },
                storyScript: `Introduce the biblical topic in your own words after reading ${scriptureReference}. Ask what learners notice in the text, then connect courage or trust to ordinary age-appropriate choices without promising that faithful people will avoid hardship.`,
                activityCraft: {
                    name: 'Courage & Care Reminder Card',
                    steps: [
                        'Fold a sheet of paper into a small card.',
                        `Write ${scriptureReference} on the front as a reference to read together.`,
                        'Inside, write or draw one wise action and one trusted adult the learner can talk to when something feels difficult.'
                    ]
                },
                discussionQuestions: [
                    'What do you notice in the Scripture passage?',
                    'What can courage look like in an ordinary day?',
                    'Who are trusted adults you can ask for help when something feels unsafe or confusing?'
                ],
                safeguardingNote: 'Adult leaders should keep conversations age-appropriate, avoid pressuring disclosures, follow the church or organization safeguarding policy, and respond to safety concerns through the appropriate responsible adults and reporting channels.'
            };
        }

        return NextResponse.json({
            success: true,
            generatedBy,
            draftStatus: 'ADULT_REVIEW_REQUIRED',
            boundaryNote: 'This is an adult-facing lesson-planning draft, not direct child counseling, Scripture itself, prophecy, or a substitute for safeguarding procedures and responsible adult supervision.',
            ...lessonPlan,
        });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error?.message || 'Lesson plan failed' }, { status: 500 });
    }
}
