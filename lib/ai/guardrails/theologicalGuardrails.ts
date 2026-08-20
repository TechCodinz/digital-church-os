import { OpenAI } from 'openai';

export class TheologicalGuardrails {
    private openai: OpenAI;

    // Prohibited patterns
    private prohibitedPatterns = [
        /\bGod told me\b/i,
        /\bThus says the Lord\b/i,
        /\bI prophecy\b/i,
        /\bI declare.*over you\b/i,
        /\bYou will (definitely|certainly)\b/i,
        /\bGod promised me.*for you\b/i,
        /\bYour healing is guaranteed\b/i,
        /\bI have a word from God\b/i,
        /\bThe Lord revealed to me\b/i,
    ];

    // Required qualifiers
    private requiredQualifiers = [
        'According to scripture',
        'Biblical teaching suggests',
        'Many Christians understand',
        'Traditionally, this passage means',
        'One interpretation is',
        'Scripture teaches that',
        'The Bible says',
        'In the Christian tradition',
    ];

    constructor() {
        this.openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY,
        });
    }

    async apply(text: string): Promise<string> {
        // 1. Remove prohibited content
        let safeText = this.removeProhibited(text);

        // 2. Add qualifiers where needed
        safeText = this.addQualifiers(safeText);

        // 3. Verify with AI for safety
        safeText = await this.verifyWithAI(safeText);

        return safeText;
    }

    private removeProhibited(text: string): string {
        let safeText = text;

        this.prohibitedPatterns.forEach(pattern => {
            safeText = safeText.replace(pattern, 'Scripture teaches that');
        });

        return safeText;
    }

    private addQualifiers(text: string): string {
        // Split into sentences
        const sentences = text.split(/[.!?]+/);

        const qualifiedSentences = sentences.map(sentence => {
            const trimmed = sentence.trim();
            if (!trimmed) return '';

            // If sentence makes a theological claim without qualifier
            if (this.makesTheologicalClaim(trimmed) && !this.hasQualifier(trimmed)) {
                return `According to scripture, ${trimmed.charAt(0).toLowerCase()}${trimmed.slice(1)}`;
            }

            return trimmed;
        });

        return qualifiedSentences.filter(s => s).join('. ') + (text.endsWith('.') ? '.' : '');
    }

    private makesTheologicalClaim(sentence: string): boolean {
        const theologicalTerms = [
            'God is', 'Jesus', 'Holy Spirit', 'salvation', 'sin',
            'grace', 'faith', 'redeem', 'saved', 'eternal',
        ];

        return theologicalTerms.some(term =>
            sentence.toLowerCase().includes(term.toLowerCase())
        );
    }

    private hasQualifier(sentence: string): boolean {
        return this.requiredQualifiers.some(qualifier =>
            sentence.toLowerCase().includes(qualifier.toLowerCase())
        );
    }

    private async verifyWithAI(text: string): Promise<string> {
        const completion = await this.openai.chat.completions.create({
            model: 'gpt-3.5-turbo',
            messages: [
                {
                    role: 'system',
                    content: `You are checking theological content for safety.
          
          Check for:
          1. Claims of divine revelation
          2. Guarantees or prophecies
          3. Medical advice
          4. Crisis situations
          
          If found, rewrite to be safe. If safe, return unchanged.`
                },
                { role: 'user', content: text }
            ],
            temperature: 0.3,
            max_tokens: Math.min(text.length + 500, 4000),
        });

        return completion.choices[0].message.content || text;
    }
}
