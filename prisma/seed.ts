import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Idempotent seed.
 * - Seeds the world-faith traditions the platform supports (multi-faith at the
 *   data/architecture layer). Christianity is the primary configured tradition.
 * - Seeds the core Christian AI modules once.
 * Safe to run repeatedly.
 */

const RELIGIONS: Array<{ name: string; description: string; primaryText: string }> = [
    {
        name: 'Christianity',
        description: 'Christian faith based on the life and teachings of Jesus Christ',
        primaryText: 'Bible',
    },
    {
        name: 'Judaism',
        description: 'Abrahamic faith centered on the covenant between God and the people of Israel',
        primaryText: 'Torah',
    },
    {
        name: 'Islam',
        description: 'Abrahamic faith centered on submission to God (Allah) and the teachings of the Prophet Muhammad',
        primaryText: 'Quran',
    },
    {
        name: 'Hinduism',
        description: 'A family of Indian religious traditions with diverse practices and sacred texts',
        primaryText: 'Vedas',
    },
    {
        name: 'Buddhism',
        description: 'A tradition rooted in the teachings of the Buddha and the path to enlightenment',
        primaryText: 'Tripitaka',
    },
    {
        name: 'Sikhism',
        description: 'A monotheistic faith founded by Guru Nanak emphasizing devotion and service',
        primaryText: 'Guru Granth Sahib',
    },
];

async function main() {
    // Upsert every supported tradition (Religion.name is unique -> idempotent).
    const religions: Record<string, { id: string }> = {};
    for (const r of RELIGIONS) {
        religions[r.name] = await prisma.religion.upsert({
            where: { name: r.name },
            update: { description: r.description, primaryText: r.primaryText, active: true },
            create: { ...r, active: true },
        });
    }

    const christianity = religions['Christianity'];

    // Core Christian AI modules — create once (AIModule has no unique key on name).
    const modules = [
        {
            name: 'Christian Teaching Module',
            type: 'TEACHING' as const,
            config: {
                capabilities: ['sermon', 'scripture-explanation', 'conference-host'],
                guardrails: { noProphecy: true, noHealingPromises: true, scriptureRequired: true },
            },
        },
        {
            name: 'Christian Worship Module',
            type: 'WORSHIP' as const,
            config: { capabilities: ['lyrics', 'hymns', 'playlists'], styles: ['gospel', 'contemporary', 'hymn'] },
        },
        {
            name: 'Christian Prayer Module',
            type: 'PRAYER' as const,
            config: {
                capabilities: ['prayer-generation', 'tracking', 'reminders'],
                themes: ['healing', 'thanksgiving', 'guidance', 'comfort'],
            },
        },
        {
            name: 'Christian Care Module',
            type: 'CARE' as const,
            config: { capabilities: ['encouragement', 'counseling', 'journal-analysis'], crisisProtocol: true },
        },
    ];

    for (const m of modules) {
        const existing = await prisma.aIModule.findFirst({ where: { name: m.name } });
        if (!existing) {
            await prisma.aIModule.create({
                data: {
                    name: m.name,
                    type: m.type,
                    religionId: christianity.id,
                    version: '1.0.0',
                    config: m.config,
                },
            });
        }
    }

    const religionCount = await prisma.religion.count();
    const moduleCount = await prisma.aIModule.count();
    console.log(`Seed completed: ${religionCount} faith traditions, ${moduleCount} AI modules.`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
