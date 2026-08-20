/**
 * Offline Wisdom Engine
 * ----------------------
 * Provides high-quality, scripture-grounded content when no external AI provider
 * (OpenAI / Pinecone) is configured. This keeps every AI feature "brilliantly
 * performing" in local development, demos, and offline deployments — no feature
 * ever hard-fails just because a key is missing.
 *
 * It exposes:
 *  - hasOpenAI()          : whether a real LLM is available
 *  - LOCAL_VERSES         : a curated KJV verse library keyed by reference
 *  - THEME_VERSES         : theme -> reference[] index
 *  - extractThemes(text)  : lightweight keyword-based theme detection
 *  - findVersesForQuery() : deterministic "semantic-ish" verse retrieval
 *  - getLocalVerse(ref)   : direct verse lookup with graceful fallback
 */

export function hasOpenAI(): boolean {
    return !!process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'dummy-key';
}

/** Curated, widely-loved KJV verses keyed by canonical reference. */
export const LOCAL_VERSES: Record<string, string> = {
    'John 3:16': 'For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life.',
    'Philippians 4:6-7': 'Be careful for nothing; but in every thing by prayer and supplication with thanksgiving let your requests be made known unto God. And the peace of God, which passeth all understanding, shall keep your hearts and minds through Christ Jesus.',
    'Philippians 4:13': 'I can do all things through Christ which strengtheneth me.',
    'Philippians 4:19': 'But my God shall supply all your need according to his riches in glory by Christ Jesus.',
    'Psalm 23:1-4': 'The LORD is my shepherd; I shall not want. He maketh me to lie down in green pastures: he leadeth me beside the still waters. He restoreth my soul... Yea, though I walk through the valley of the shadow of death, I will fear no evil: for thou art with me.',
    'Psalm 34:18': 'The LORD is nigh unto them that are of a broken heart; and saveth such as be of a contrite spirit.',
    'Psalm 46:1': 'God is our refuge and strength, a very present help in trouble.',
    'Psalm 91:1-2': 'He that dwelleth in the secret place of the most High shall abide under the shadow of the Almighty. I will say of the LORD, He is my refuge and my fortress: my God; in him will I trust.',
    'Psalm 118:24': 'This is the day which the LORD hath made; we will rejoice and be glad in it.',
    'Psalm 119:105': 'Thy word is a lamp unto my feet, and a light unto my path.',
    'Psalm 121:1-2': 'I will lift up mine eyes unto the hills, from whence cometh my help. My help cometh from the LORD, which made heaven and earth.',
    'Proverbs 3:5-6': 'Trust in the LORD with all thine heart; and lean not unto thine own understanding. In all thy ways acknowledge him, and he shall direct thy paths.',
    'Isaiah 40:31': 'But they that wait upon the LORD shall renew their strength; they shall mount up with wings as eagles; they shall run, and not be weary; and they shall walk, and not faint.',
    'Isaiah 41:10': 'Fear thou not; for I am with thee: be not dismayed; for I am thy God: I will strengthen thee; yea, I will help thee; yea, I will uphold thee with the right hand of my righteousness.',
    'Isaiah 53:5': 'But he was wounded for our transgressions, he was bruised for our iniquities: the chastisement of our peace was upon him; and with his stripes we are healed.',
    'Jeremiah 29:11': 'For I know the thoughts that I think toward you, saith the LORD, thoughts of peace, and not of evil, to give you an expected end.',
    'Matthew 6:33': 'But seek ye first the kingdom of God, and his righteousness; and all these things shall be added unto you.',
    'Matthew 11:28': 'Come unto me, all ye that labour and are heavy laden, and I will give you rest.',
    'John 14:27': 'Peace I leave with you, my peace I give unto you: not as the world giveth, give I unto you. Let not your heart be troubled, neither let it be afraid.',
    'Romans 8:28': 'And we know that all things work together for good to them that love God, to them who are the called according to his purpose.',
    'Romans 8:38-39': 'For I am persuaded, that neither death, nor life... shall be able to separate us from the love of God, which is in Christ Jesus our Lord.',
    '1 Corinthians 13:4-7': 'Charity suffereth long, and is kind; charity envieth not... beareth all things, believeth all things, hopeth all things, endureth all things.',
    '2 Corinthians 12:9': 'And he said unto me, My grace is sufficient for thee: for my strength is made perfect in weakness.',
    'Galatians 5:22-23': 'But the fruit of the Spirit is love, joy, peace, longsuffering, gentleness, goodness, faith, meekness, temperance: against such there is no law.',
    'Ephesians 2:8-9': 'For by grace are ye saved through faith; and that not of yourselves: it is the gift of God: Not of works, lest any man should boast.',
    'Hebrews 11:1': 'Now faith is the substance of things hoped for, the evidence of things not seen.',
    'Hebrews 13:5': 'Let your conversation be without covetousness; and be content with such things as ye have: for he hath said, I will never leave thee, nor forsake thee.',
    'James 1:5': 'If any of you lack wisdom, let him ask of God, that giveth to all men liberally, and upbraideth not; and it shall be given him.',
    '1 Peter 5:7': 'Casting all your care upon him; for he careth for you.',
    '1 John 1:9': 'If we confess our sins, he is faithful and just to forgive us our sins, and to cleanse us from all unrighteousness.',
    '1 John 4:18': 'There is no fear in love; but perfect love casteth out fear: because fear hath torment. He that feareth is not made perfect in love.',
    'Joshua 1:9': 'Have not I commanded thee? Be strong and of a good courage; be not afraid, neither be thou dismayed: for the LORD thy God is with thee whithersoever thou goest.',
    'Lamentations 3:22-23': 'It is of the LORD\u2019s mercies that we are not consumed, because his compassions fail not. They are new every morning: great is thy faithfulness.',
    'Nehemiah 8:10': 'Neither be ye sorry; for the joy of the LORD is your strength.',
    'Zephaniah 3:17': 'The LORD thy God in the midst of thee is mighty; he will save, he will rejoice over thee with joy; he will rest in his love, he will joy over thee with singing.',
};

/** Map of spiritual themes to the most fitting references from LOCAL_VERSES. */
export const THEME_VERSES: Record<string, string[]> = {
    peace: ['Philippians 4:6-7', 'John 14:27', 'Isaiah 26:3', 'Psalm 46:1'],
    anxiety: ['Philippians 4:6-7', '1 Peter 5:7', 'Matthew 6:33', 'Psalm 34:18'],
    fear: ['Isaiah 41:10', '2 Timothy 1:7', '1 John 4:18', 'Joshua 1:9'],
    healing: ['Isaiah 53:5', 'Psalm 34:18', 'Jeremiah 30:17', 'James 5:14'],
    strength: ['Isaiah 40:31', 'Philippians 4:13', '2 Corinthians 12:9', 'Nehemiah 8:10'],
    guidance: ['Proverbs 3:5-6', 'Psalm 119:105', 'James 1:5', 'Psalm 32:8'],
    hope: ['Jeremiah 29:11', 'Romans 8:28', 'Hebrews 11:1', 'Lamentations 3:22-23'],
    comfort: ['Psalm 23:1-4', 'Matthew 11:28', 'Psalm 34:18', '2 Corinthians 1:3-4'],
    thanksgiving: ['Psalm 118:24', '1 Thessalonians 5:18', 'Philippians 4:6-7', 'Psalm 100:4'],
    love: ['John 3:16', '1 Corinthians 13:4-7', 'Romans 8:38-39', '1 John 4:18'],
    faith: ['Hebrews 11:1', 'Ephesians 2:8-9', 'Mark 11:24', 'Romans 10:17'],
    provision: ['Philippians 4:19', 'Matthew 6:33', 'Psalm 23:1-4', 'Hebrews 13:5'],
    forgiveness: ['1 John 1:9', 'Ephesians 4:32', 'Colossians 3:13', 'Psalm 103:12'],
    joy: ['Nehemiah 8:10', 'Psalm 118:24', 'Galatians 5:22-23', 'Zephaniah 3:17'],
    protection: ['Psalm 91:1-2', 'Psalm 121:1-2', 'Isaiah 41:10', '2 Thessalonians 3:3'],
    wisdom: ['James 1:5', 'Proverbs 3:5-6', 'Proverbs 2:6', 'Colossians 2:3'],
};

/** Extra verse texts referenced by THEME_VERSES but outside the core library. */
const SUPPLEMENTAL_VERSES: Record<string, string> = {
    'Isaiah 26:3': 'Thou wilt keep him in perfect peace, whose mind is stayed on thee: because he trusteth in thee.',
    '2 Timothy 1:7': 'For God hath not given us the spirit of fear; but of power, and of love, and of a sound mind.',
    'Jeremiah 30:17': 'For I will restore health unto thee, and I will heal thee of thy wounds, saith the LORD.',
    'James 5:14': 'Is any sick among you? let him call for the elders of the church; and let them pray over him.',
    'Psalm 32:8': 'I will instruct thee and teach thee in the way which thou shalt go: I will guide thee with mine eye.',
    '2 Corinthians 1:3-4': 'Blessed be God... who comforteth us in all our tribulation, that we may be able to comfort them which are in any trouble.',
    '1 Thessalonians 5:18': 'In every thing give thanks: for this is the will of God in Christ Jesus concerning you.',
    'Psalm 100:4': 'Enter into his gates with thanksgiving, and into his courts with praise: be thankful unto him, and bless his name.',
    'Mark 11:24': 'Therefore I say unto you, What things soever ye desire, when ye pray, believe that ye receive them, and ye shall have them.',
    'Romans 10:17': 'So then faith cometh by hearing, and hearing by the word of God.',
    'Ephesians 4:32': 'And be ye kind one to another, tenderhearted, forgiving one another, even as God for Christ\u2019s sake hath forgiven you.',
    'Colossians 3:13': 'Forbearing one another, and forgiving one another... even as Christ forgave you, so also do ye.',
    'Psalm 103:12': 'As far as the east is from the west, so far hath he removed our transgressions from us.',
    'Proverbs 2:6': 'For the LORD giveth wisdom: out of his mouth cometh knowledge and understanding.',
    'Colossians 2:3': 'In whom are hid all the treasures of wisdom and knowledge.',
    '2 Thessalonians 3:3': 'But the Lord is faithful, who shall stablish you, and keep you from evil.',
};

const ALL_VERSES: Record<string, string> = { ...SUPPLEMENTAL_VERSES, ...LOCAL_VERSES };

const THEME_KEYWORDS: Record<string, RegExp> = {
    healing: /\b(heal|sick|ill|pain|disease|recover|cancer|hurt|wound|suffer)/i,
    anxiety: /\b(anx|worry|worri|stress|overwhelm|panic|nervous|afraid of the future)/i,
    fear: /\b(fear|afraid|scared|terror|dread|frighten)/i,
    peace: /\b(peace|calm|rest|quiet|still|serenity)/i,
    strength: /\b(strength|strong|weak|tired|weary|exhaust|endure|persever)/i,
    guidance: /\b(guid|direction|decision|wisdom|choice|path|discern|which way|confus)/i,
    hope: /\b(hope|future|despair|hopeless|purpose|discourag)/i,
    comfort: /\b(comfort|grief|grieve|loss|mourn|lonely|alone|broken|sad|depress)/i,
    thanksgiving: /\b(thank|grateful|gratitude|blessing|bless|praise|rejoic)/i,
    love: /\b(love|relationship|marriage|family|friend|belong)/i,
    faith: /\b(faith|believe|doubt|trust|belief)/i,
    provision: /\b(provi|money|job|financ|bill|debt|need|work|career|hous)/i,
    forgiveness: /\b(forgiv|guilt|shame|sin|repent|mistake|regret)/i,
    joy: /\b(joy|happy|happiness|celebrate|delight)/i,
    protection: /\b(protect|safe|danger|deliver|attack|enemy)/i,
    wisdom: /\b(wisdom|understand|knowledge|learn|insight)/i,
};

/** Lightweight, deterministic theme detection from free text. */
export function extractThemes(text: string, max = 3): string[] {
    if (!text) return ['guidance'];
    const found: string[] = [];
    for (const [theme, re] of Object.entries(THEME_KEYWORDS)) {
        if (re.test(text)) found.push(theme);
        if (found.length >= max) break;
    }
    return found.length ? found : ['guidance', 'hope'];
}

export interface WisdomVerse {
    reference: string;
    text: string;
    score?: number;
}

/** Whether the exact reference exists in the curated local library. */
export function hasVerse(reference: string): boolean {
    return !!ALL_VERSES[reference];
}

/** Direct verse lookup; falls back to a thematically-appropriate verse. */
export function getLocalVerse(reference: string): WisdomVerse {
    const exact = ALL_VERSES[reference];
    if (exact) return { reference, text: exact };

    // Try a loose match on book+chapter
    const loose = Object.keys(ALL_VERSES).find(
        (r) => r.toLowerCase().startsWith(reference.toLowerCase().split(':')[0].trim())
    );
    if (loose) return { reference: loose, text: ALL_VERSES[loose] };

    return {
        reference: reference || 'Psalm 119:105',
        text: ALL_VERSES['Psalm 119:105'],
    };
}

/**
 * Deterministic "semantic-ish" retrieval: match themes in the query and return
 * their associated verses, de-duplicated and lightly scored by theme order.
 */
export function findVersesForQuery(query: string, count = 5): WisdomVerse[] {
    const themes = extractThemes(query, 4);
    const seen = new Set<string>();
    const results: WisdomVerse[] = [];

    themes.forEach((theme, ti) => {
        (THEME_VERSES[theme] || []).forEach((ref, ri) => {
            if (seen.has(ref)) return;
            const text = ALL_VERSES[ref];
            if (!text) return;
            seen.add(ref);
            results.push({ reference: ref, text, score: 1 - (ti * 0.15 + ri * 0.03) });
        });
    });

    // Top up with universally encouraging verses if we are short.
    const filler = ['John 3:16', 'Romans 8:28', 'Philippians 4:13', 'Psalm 23:1-4', 'Jeremiah 29:11'];
    for (const ref of filler) {
        if (results.length >= count) break;
        if (seen.has(ref)) continue;
        seen.add(ref);
        results.push({ reference: ref, text: ALL_VERSES[ref], score: 0.4 });
    }

    return results.slice(0, count);
}

/** Human-friendly label for a theme (e.g. "peace" -> "Peace & Trust"). */
export function themeLabel(theme: string): string {
    const labels: Record<string, string> = {
        peace: 'Peace & Trust',
        anxiety: 'Peace over Anxiety',
        fear: 'Courage over Fear',
        healing: 'Healing & Wholeness',
        strength: 'Strength & Endurance',
        guidance: 'Divine Guidance',
        hope: 'Hope & Purpose',
        comfort: 'Comfort in Sorrow',
        thanksgiving: 'Thanksgiving & Praise',
        love: 'The Love of God',
        faith: 'Faith & Trust',
        provision: 'God\u2019s Provision',
        forgiveness: 'Grace & Forgiveness',
        joy: 'Joy of the Lord',
        protection: 'Refuge & Protection',
        wisdom: 'Wisdom from Above',
    };
    return labels[theme] || 'Spiritual Growth';
}
