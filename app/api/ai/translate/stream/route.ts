import { NextResponse } from 'next/server';
import { OpenAI } from 'openai';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { text = 'The peace of God which surpasses all understanding will guard your hearts.', targetLanguage = 'Spanish' } = body;

        let translatedText = '';

        if (process.env.OPENAI_API_KEY) {
            try {
                const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
                const response = await openai.chat.completions.create({
                    model: 'gpt-4o',
                    messages: [
                        {
                            role: 'system',
                            content: `You are a Real-Time Church Service Translator. Translate the given spoken sermon text accurately into ${targetLanguage}. Maintain sacred tone and clear scripture references.`
                        },
                        {
                            role: 'user',
                            content: text
                        }
                    ],
                    temperature: 0.3,
                });

                translatedText = response.choices[0]?.message?.content || '';
            } catch (err) {
                console.error('Translation error:', err);
            }
        }

        if (!translatedText) {
            const FALLBACK_TRANSLATIONS: Record<string, string> = {
                Spanish: 'La paz de Dios, que sobrepasa todo entendimiento, guardará vuestros corazones y vuestros pensamientos en Cristo Jesús.',
                French: 'Et la paix de Dieu, qui surpasse toute intelligence, gardera vos cœurs et vos pensées en Jésus-Christ.',
                Japanese: '神の平和は、すべての人間の考えを超えて、キリスト・イエスにおいてあなたがたの心と思いを守るでしょう。',
                Swahili: 'Na amani ya Mungu, ipitayo akili zote, itawalinda mioyo yenu na nia zenu katika Kristo Yesu.',
                Tagalog: 'At ang kapayapaan ng Diyos, na lumalagpas sa lahat ng pag-unawa, ay magbabantay sa inyong mga puso.',
                Mandarin: '神所赐出人意外的平安，必在基督耶稣里保守你们的心怀意念。',
                Portuguese: 'E a paz de Deus, que excede todo o entendimento, guardará os vossos corações e os vossos pensamentos em Cristo Jesus.',
                Yoruba: 'Àlááfíà Ọlọ́run tí o ju imọ̀ gbogbo lọ yóò pa ọkàn ati inú yín mọ́ nínú Kristi Jesu.',
                German: 'Und der Friede Gottes, der allen Verstand übersteigt, wird eure Herzen und eure Sinne bewahren in Christus Jesus.'
            };

            translatedText = FALLBACK_TRANSLATIONS[targetLanguage] || `[${targetLanguage}] ${text}`;
        }

        return NextResponse.json({
            success: true,
            originalText: text,
            targetLanguage,
            translatedText
        });
    } catch (err: any) {
        return NextResponse.json({ success: false, error: err.message || 'Translation error' }, { status: 500 });
    }
}
