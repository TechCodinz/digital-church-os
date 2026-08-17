/**
 * Offline Theology Engine
 * -----------------------
 * The intellectual core that lets Sanctuary AI use Scripture with depth even
 * with no external model configured. Provides:
 *  - Original-language word studies (Hebrew / Greek) keyed by theme
 *  - Cross-reference chains that let verses illuminate one another
 *  - Emotional-tone detection (to adapt warmth / voice)
 *  - An apologetics knowledge base for reasoned, winsome faith conversations
 *
 * Scholarship here is intentionally conservative and well-established (Strong's
 * glosses and standard lexical meanings) — never speculative or sensational.
 */

import { extractThemes, findVersesForQuery, WisdomVerse } from '@/lib/ai/shared/offlineWisdom';

export interface WordStudy {
    term: string;
    language: 'Hebrew' | 'Greek';
    strongs: string;
    translit: string;
    gloss: string;
    insight: string;
    verse: string;
}

/** Theme -> original-language word study (the "deeper than the surface" layer). */
const WORD_STUDIES: Record<string, WordStudy[]> = {
    peace: [
        { term: 'שָׁלוֹם', language: 'Hebrew', strongs: 'H7965', translit: 'shalom', gloss: 'wholeness, completeness, welfare', insight: 'Biblical peace is not merely the absence of conflict but the presence of wholeness — nothing missing, nothing broken.', verse: 'Numbers 6:26' },
        { term: 'εἰρήνη', language: 'Greek', strongs: 'G1515', translit: 'eirēnē', gloss: 'to join, to set as one again', insight: 'The Greek pictures broken pieces being bound back together — God re-integrating what anxiety fragments.', verse: 'John 14:27' },
    ],
    anxiety: [
        { term: 'μεριμνάω', language: 'Greek', strongs: 'G3309', translit: 'merimnaō', gloss: 'to be pulled in different directions', insight: '"Be anxious for nothing" pictures a mind torn between competing cares; prayer re-centers the divided heart on one Father.', verse: 'Philippians 4:6-7' },
    ],
    love: [
        { term: 'חֶסֶד', language: 'Hebrew', strongs: 'H2617', translit: 'chesed', gloss: 'steadfast covenant love, loyal mercy', insight: 'Chesed is love bound by covenant, not conditioned by performance — a love that keeps its promises.', verse: 'Lamentations 3:22-23' },
        { term: 'ἀγάπη', language: 'Greek', strongs: 'G26', translit: 'agapē', gloss: 'self-giving, sacrificial love', insight: 'Agape is love defined by the cross — a decision of the will to seek another\u2019s good at cost to oneself.', verse: 'John 3:16' },
    ],
    faith: [
        { term: 'אֱמוּנָה', language: 'Hebrew', strongs: 'H530', translit: 'emunah', gloss: 'firmness, steadfastness, faithfulness', insight: 'Hebrew faith is less a feeling than a firmness — leaning your full weight on God\u2019s reliability.', verse: 'Habakkuk 2:4' },
        { term: 'πίστις', language: 'Greek', strongs: 'G4102', translit: 'pistis', gloss: 'trust, conviction, faithfulness', insight: 'Pistis holds both belief and allegiance — trusting Christ and being loyal to Him.', verse: 'Hebrews 11:1' },
    ],
    grace: [
        { term: 'χάρις', language: 'Greek', strongs: 'G5485', translit: 'charis', gloss: 'unmerited favor, a gift freely given', insight: 'Charis shares a root with "joy" — grace is favor that produces delight, never a debt to repay.', verse: 'Ephesians 2:8-9' },
    ],
    hope: [
        { term: 'ἐλπίς', language: 'Greek', strongs: 'G1680', translit: 'elpis', gloss: 'confident expectation', insight: 'Biblical hope is not wishful thinking but confident expectation anchored to God\u2019s character and promises.', verse: 'Romans 8:28' },
        { term: 'תִּקְוָה', language: 'Hebrew', strongs: 'H8615', translit: 'tiqvah', gloss: 'a cord, expectation', insight: 'Tiqvah literally means a cord — hope is the lifeline that ties the soul to a faithful God.', verse: 'Jeremiah 29:11' },
    ],
    comfort: [
        { term: 'παράκλητος', language: 'Greek', strongs: 'G3875', translit: 'paraklētos', gloss: 'one called alongside to help', insight: 'The Spirit is the Paraclete — not distant sympathy but God drawn near, standing beside you in the trouble.', verse: '2 Corinthians 1:3-4' },
    ],
    healing: [
        { term: 'רָפָא', language: 'Hebrew', strongs: 'H7495', translit: 'rapha', gloss: 'to heal, mend, restore', insight: 'From this root comes "Jehovah-Rapha" — the LORD who heals; His healing restores the whole person, not just the body.', verse: 'Isaiah 53:5' },
    ],
    strength: [
        { term: 'δύναμις', language: 'Greek', strongs: 'G1411', translit: 'dunamis', gloss: 'inherent power, ability', insight: 'God\u2019s dunamis is "made perfect in weakness" — His power is displayed precisely where ours runs out.', verse: '2 Corinthians 12:9' },
    ],
    forgiveness: [
        { term: 'ἀφίημι', language: 'Greek', strongs: 'G863', translit: 'aphiēmi', gloss: 'to send away, release, let go', insight: 'To forgive is to release a debt — God sends our sin away "as far as the east is from the west."', verse: 'Psalm 103:12' },
    ],
    wisdom: [
        { term: 'חָכְמָה', language: 'Hebrew', strongs: 'H2451', translit: 'chokmah', gloss: 'skill for living well', insight: 'Chokmah is not raw information but skill — the God-given art of living rightly in a complex world.', verse: 'James 1:5' },
    ],
    joy: [
        { term: 'χαρά', language: 'Greek', strongs: 'G5479', translit: 'chara', gloss: 'gladness rooted in grace', insight: 'Chara flows from charis (grace); joy is the settled gladness that grace produces, independent of circumstance.', verse: 'Nehemiah 8:10' },
    ],
    fear: [
        { term: 'אַל־תִּירָא', language: 'Hebrew', strongs: 'H3372', translit: 'al-tira', gloss: 'do not fear', insight: '"Fear not" is Scripture\u2019s most repeated command — always paired with a promise of God\u2019s presence, not a demand to be brave alone.', verse: 'Isaiah 41:10' },
    ],
    provision: [
        { term: 'יְהוָה יִרְאֶה', language: 'Hebrew', strongs: 'H3070', translit: 'Yahweh-Yireh', gloss: 'the LORD will see/provide', insight: 'On the mountain of testing, God provided the lamb — provision is God "seeing ahead" to meet the need He already knows.', verse: 'Philippians 4:19' },
    ],
    guidance: [
        { term: 'נָחָה', language: 'Hebrew', strongs: 'H5148', translit: 'nachah', gloss: 'to lead, guide by the hand', insight: 'God does not merely point the way; nachah pictures Him leading by the hand along the path.', verse: 'Psalm 32:8' },
    ],
    protection: [
        { term: 'מַחְסֶה', language: 'Hebrew', strongs: 'H4268', translit: 'machseh', gloss: 'refuge, shelter', insight: 'God is our machseh — a shelter to run into, not merely a fortress to admire from afar.', verse: 'Psalm 91:1-2' },
    ],
};

export interface TheologicalInsight {
    themes: string[];
    wordStudies: WordStudy[];
    crossReferences: WisdomVerse[];
    exegesis: string;
}

/** Build a layered theological insight for a free-text query. */
export function buildTheologicalInsight(query: string): TheologicalInsight {
    const themes = extractThemes(query, 3);
    const wordStudies: WordStudy[] = [];
    themes.forEach((t) => (WORD_STUDIES[t] || []).forEach((w) => wordStudies.push(w)));
    // Ensure at least one word study.
    if (wordStudies.length === 0) wordStudies.push(...WORD_STUDIES.peace);

    const crossReferences = findVersesForQuery(query, 4);
    const primary = wordStudies[0];
    const exegesis =
        `At the surface this speaks to ${themes[0]}, but the original language opens it wider: the ` +
        `${primary.language} word "${primary.translit}" (${primary.gloss}) reveals that ${primary.insight} ` +
        `Read together, ${crossReferences.slice(0, 3).map((v) => v.reference).join(', ')} form a single thread of promise — ` +
        `Scripture interpreting Scripture.`;

    return { themes, wordStudies, crossReferences, exegesis };
}

// ── Emotional-tone intuition ────────────────────────────────────────────────

export type EmotionTone = 'distress' | 'grief' | 'fear' | 'gratitude' | 'joy' | 'seeking' | 'anger' | 'neutral';

const TONE_PATTERNS: Array<{ tone: EmotionTone; re: RegExp }> = [
    { tone: 'distress', re: /\b(overwhelm|can'?t cope|breaking|desperate|hopeless|exhausted|drowning|too much|falling apart)\b/i },
    { tone: 'grief', re: /\b(loss|lost|died|death|grief|grieving|mourn|passed away|miss(ing)? (him|her|them))\b/i },
    { tone: 'fear', re: /\b(afraid|scared|terrified|fear|anxious|anxiety|worried|panic|dread)\b/i },
    { tone: 'anger', re: /\b(angry|furious|hate|resent|bitter|unfair|betrayed|rage)\b/i },
    { tone: 'gratitude', re: /\b(thank|grateful|blessed|answered|testimony|praise report)\b/i },
    { tone: 'joy', re: /\b(joy|happy|celebrate|excited|rejoice|good news)\b/i },
    { tone: 'seeking', re: /\b(how do i|what does|why does|explain|understand|question|wondering|curious|meaning of)\b/i },
];

const TONE_VOICE: Record<EmotionTone, { emotion: string; opener: string }> = {
    distress: { emotion: 'tender', opener: 'I can hear how heavy this is, and I\u2019m so glad you brought it here.' },
    grief: { emotion: 'somber', opener: 'I\u2019m grieving alongside you; this kind of loss is real and it matters.' },
    fear: { emotion: 'tender', opener: 'Take a breath — you\u2019re not facing this alone, and fear does not get the final word.' },
    anger: { emotion: 'compassionate', opener: 'It\u2019s okay to bring even your anger honestly before God; He can hold all of it.' },
    gratitude: { emotion: 'celebratory', opener: 'What a gift — let\u2019s give thanks together for what God has done.' },
    joy: { emotion: 'triumphant', opener: 'This is worth celebrating; joy shared is joy multiplied.' },
    seeking: { emotion: 'default', opener: 'That\u2019s a good and honest question — let\u2019s reason through it together from Scripture.' },
    neutral: { emotion: 'compassionate', opener: 'Thank you for sharing what\u2019s on your heart.' },
};

export function detectTone(text: string): EmotionTone {
    for (const { tone, re } of TONE_PATTERNS) if (re.test(text)) return tone;
    return 'neutral';
}

export function toneVoice(tone: EmotionTone) {
    return TONE_VOICE[tone] || TONE_VOICE.neutral;
}

// ── Apologetics knowledge base ("Will", the AI Apologist) ───────────────────

export interface Apologetic {
    topic: string;
    label: string;
    response: string;
    scriptures: string[];
    turningQuestion: string;
}

const APOLOGETICS: Array<{ match: RegExp; data: Apologetic }> = [
    {
        match: /\b(prove god|god.{0,12}(real|exist)|exist.{0,6}god|no (proof|evidence).{0,12}god|atheis|there is no god)\b/i,
        data: {
            topic: 'existence',
            label: 'Does God exist?',
            response:
                'The question deserves reason, not just feeling. Everything that begins to exist has a cause, and the universe itself began to exist — so it points beyond itself to a cause that is timeless, spaceless, and immensely powerful. Add the fine-tuning of physical constants, the grounding of objective moral values, and the reality of consciousness, and the theistic explanation is not a retreat from evidence but the best account of it. Faith here is not a leap in the dark; it is a step into the light of the best explanation.',
            scriptures: ['Romans 1:20', 'Psalm 19:1', 'Hebrews 11:1'],
            turningQuestion: 'If the universe had a beginning, what kind of cause could bring space, time, and matter into being?',
        },
    },
    {
        match: /(problem of evil|(evil|suffering|pain)[^.]{0,30}(god|allow|permit)|god[^.]{0,30}(allow|permit)[^.]{0,20}(evil|suffering|pain)|if god (is|were) good|why do bad things)/i,
        data: {
            topic: 'evil',
            label: 'Why does a good God allow suffering?',
            response:
                'Notice that calling something "evil" assumes a real standard of good — which itself points to God. Christianity doesn\u2019t offer a glib answer; it offers a suffering God. Love requires freedom, and freedom can be misused, but the cross means God did not stay distant from our pain — He entered it, bore it, and promises to redeem it. The resurrection is the pledge that suffering is neither meaningless nor the end of the story.',
            scriptures: ['Romans 8:28', 'John 16:33', 'Revelation 21:4'],
            turningQuestion: 'If there were no God, on what basis would we call anything genuinely "evil" rather than merely unpleasant?',
        },
    },
    {
        match: /\b(bible (is )?(full of )?(contradiction|myth|fake|unreliable|made up)|can'?t trust the bible|bible was changed)\b/i,
        data: {
            topic: 'bible',
            label: 'Can we trust the Bible?',
            response:
                'The New Testament is the best-attested work of antiquity — thousands of early manuscripts, far closer to the events than any comparable ancient text, with the variants being minor and transparent rather than doctrine-altering. It contains embarrassing details, named eyewitnesses, and early creeds that predate the books themselves. Apparent contradictions usually dissolve with context and genre. This is a library written across centuries yet telling one coherent story of redemption.',
            scriptures: ['2 Timothy 3:16', '2 Peter 1:16', 'Luke 1:1-4'],
            turningQuestion: 'Would you hold other ancient histories to the same evidential standard you\u2019re applying to the Gospels?',
        },
    },
    {
        match: /\b(science (vs|versus|disproves|contradicts) (faith|religion|god)|evolution|big bang disproves)\b/i,
        data: {
            topic: 'science',
            label: 'Does science disprove faith?',
            response:
                'Science studies how the physical world works; it cannot, by method, rule on why anything exists at all. Many founders of modern science — Newton, Kepler, Faraday, Mendel — were believers who expected an orderly universe precisely because a rational Creator made it. Far from conflict, the intelligibility of nature and the fine-tuning that makes science possible fit beautifully with a Mind behind the cosmos.',
            scriptures: ['Colossians 1:16-17', 'Psalm 19:1', 'Genesis 1:1'],
            turningQuestion: 'Can the scientific method itself explain why the universe is so consistently rational and knowable?',
        },
    },
    {
        match: /\b(all religions|why (only |just )?(jesus|christ|christianity)|one true (religion|way)|exclusiv|other religions)\b/i,
        data: {
            topic: 'exclusivity',
            label: 'Why Jesus and not other paths?',
            response:
                'Every worldview makes exclusive truth-claims — even "all religions are the same" is itself an exclusive claim. The real question is which claim is true. Jesus is unique: not a teacher pointing to a way, but the One who said "I am the way," and then validated it by rising from the dead. Christianity is less about humans climbing up to God and more about God coming down to us in grace.',
            scriptures: ['John 14:6', 'Acts 4:12', '1 Timothy 2:5'],
            turningQuestion: 'If someone actually rose from the dead, wouldn\u2019t that set their claims apart from every other teacher?',
        },
    },
    {
        match: /\b(church(es)? (are|is) (full of )?hypocrit|christians are (fake|judgmental)|church hurt|religion is toxic)\b/i,
        data: {
            topic: 'hypocrisy',
            label: 'Aren\u2019t Christians hypocrites?',
            response:
                'Sometimes, yes — and Jesus rebuked religious hypocrisy more sharply than anyone. But hypocrisy is people failing to live up to the standard, not evidence the standard is false; counterfeit money exists precisely because real money is valuable. The church is not a museum for the perfect but a hospital for the honest. Judge Christianity by Christ, not merely by His flawed followers.',
            scriptures: ['Matthew 7:3-5', 'Romans 3:23', 'Romans 5:8'],
            turningQuestion: 'Is it fair to reject a medicine because some patients take it poorly?',
        },
    },
    {
        match: /(resurrection[^.]{0,20}(didn'?t|never|not)[^.]{0,12}happen|jesus[^.]{0,12}(didn'?t|never|not)[^.]{0,8}ris|dead[^.]{0,14}stay dead|stole the body|resurrection.{0,10}(myth|fake|hoax))/i,
        data: {
            topic: 'resurrection',
            label: 'Did the resurrection really happen?',
            response:
                'Consider the minimal facts most historians grant: Jesus died by crucifixion, the tomb was found empty, and diverse people were convinced they saw Him alive — including skeptics like James and enemies like Paul. The disciples were transformed from frightened deserters into martyrs who would not recant. Legends don\u2019t produce that kind of costly conviction within the lifetimes of eyewitnesses. The resurrection remains the best explanation of the data.',
            scriptures: ['1 Corinthians 15:3-8', 'Luke 24:6', 'Acts 2:32'],
            turningQuestion: 'What better explanation accounts for the empty tomb, the appearances, and the disciples\u2019 willingness to die?',
        },
    },
];

const DEFAULT_APOLOGETIC: Apologetic = {
    topic: 'general',
    label: 'A reason for the hope within',
    response:
        'Faith and reason are friends, not enemies. Christianity invites honest questions because it stakes its claims on real events in history — supremely the death and resurrection of Jesus. Wherever your doubt lies, there is a thoughtful, humble answer worth exploring, offered "with gentleness and respect."',
    scriptures: ['1 Peter 3:15', 'Isaiah 1:18', 'Acts 17:11'],
    turningQuestion: 'What is the one honest question that, if answered well, would most move you toward faith?',
};

/** Match a viral/faith objection to a reasoned, winsome apologetic response. */
export function buildApologetic(query: string): Apologetic {
    for (const { match, data } of APOLOGETICS) if (match.test(query)) return data;
    // Fall back to a theme-relevant default enriched with fitting scriptures.
    const verses = findVersesForQuery(query, 2).map((v) => v.reference);
    return {
        ...DEFAULT_APOLOGETIC,
        scriptures: verses.length ? Array.from(new Set([...DEFAULT_APOLOGETIC.scriptures, ...verses])).slice(0, 3) : DEFAULT_APOLOGETIC.scriptures,
    };
}
