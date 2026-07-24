import { NextResponse } from 'next/server';
import { OpenAI } from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { ageGroup = 'elementary', topic = 'Courage & Trusting God (David and Goliath)', duration = '45 mins' } = body;

        let lessonPlan: any = null;

        if (process.env.OPENAI_API_KEY) {
            try {
                const response = await openai.chat.completions.create({
                    model: 'gpt-4o',
                    messages: [
                        {
                            role: 'system',
                            content: `You are an Anointed Sunday School Curriculum Author & Pedagogy Specialist.
                            Generate a Sunday School Lesson Plan tailored specifically for age group: "${ageGroup}".
                            Return JSON:
                            {
                                "title": "string",
                                "targetAgeGroup": "string",
                                "memoryVerse": "string",
                                "teacherPrepChecklist": ["string"],
                                "objectLesson": {
                                    "materials": ["string"],
                                    "instructions": "string"
                                },
                                "storyScript": "string (narrative script for teacher)",
                                "activityCraft": {
                                    "name": "string",
                                    "steps": ["string"]
                                },
                                "discussionQuestions": ["string"]
                            }`
                        },
                        {
                            role: 'user',
                            content: `Topic: ${topic}, Duration: ${duration}`
                        }
                    ],
                    response_format: { type: 'json_object' },
                    temperature: 0.6,
                });

                lessonPlan = JSON.parse(response.choices[0]?.message?.content || '{}');
            } catch (err) {
                console.error('Lesson plan AI error:', err);
            }
        }

        if (!lessonPlan || !lessonPlan.title) {
            lessonPlan = {
                title: `Sunday School Masterclass: ${topic}`,
                targetAgeGroup: ageGroup.toUpperCase(),
                memoryVerse: '1 Samuel 17:47 — The battle is the LORD’s.',
                teacherPrepChecklist: [
                    'Print out memory verse coloring sheets',
                    'Gather 5 smooth river stones and a sling demonstration rope',
                    'Set up audio player for praise songs'
                ],
                objectLesson: {
                    materials: ['5 smooth river stones', '1 heavy bag or backpack'],
                    instructions: 'Fill a backpack with rocks representing fears (spiders, dark, failure). Show how trusting God removes the heavy burden.'
                },
                storyScript: 'Long ago in ancient Israel, a young shepherd boy named David trusted God when everyone else was afraid. While the army trembled before Goliath, David knew God was bigger than any giant!',
                activityCraft: {
                    name: 'Paper Armor of God & David’s Pouch',
                    steps: [
                        'Fold brown paper into a pouch shape and staple edges.',
                        'Write 5 stones of faith on paper rocks (Trust, Prayer, Scripture, Worship, Love).',
                        'Place faith rocks inside the pouch.'
                    ]
                },
                discussionQuestions: [
                    'What is a "giant" or fear you faced this week?',
                    'How did David show courage even when others doubted him?',
                    'How can we pray for each other when we feel afraid?'
                ]
            };
        }

        return NextResponse.json({
            success: true,
            ...lessonPlan
        });
    } catch (err: any) {
        return NextResponse.json({ success: false, error: err.message || 'Lesson plan failed' }, { status: 500 });
    }
}
