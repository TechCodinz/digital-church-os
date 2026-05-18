import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    // Create Christianity religion
    const christianity = await prisma.religion.upsert({
        where: { name: 'Christianity' },
        update: {},
        create: {
            name: 'Christianity',
            description: 'Christian faith based on the life and teachings of Jesus Christ',
            primaryText: 'Bible',
            active: true,
        },
    });

    // Create AI Modules
    const teachingModule = await prisma.aIModule.create({
        data: {
            name: 'Christian Teaching Module',
            type: 'TEACHING',
            religionId: christianity.id,
            version: '1.0.0',
            config: {
                capabilities: ['sermon', 'scripture-explanation', 'conference-host'],
                guardrails: {
                    noProphecy: true,
                    noHealingPromises: true,
                    scriptureRequired: true,
                },
            },
        },
    });

    const worshipModule = await prisma.aIModule.create({
        data: {
            name: 'Christian Worship Module',
            type: 'WORSHIP',
            religionId: christianity.id,
            version: '1.0.0',
            config: {
                capabilities: ['lyrics', 'hymns', 'playlists'],
                styles: ['gospel', 'contemporary', 'hymn'],
            },
        },
    });

    const prayerModule = await prisma.aIModule.create({
        data: {
            name: 'Christian Prayer Module',
            type: 'PRAYER',
            religionId: christianity.id,
            version: '1.0.0',
            config: {
                capabilities: ['prayer-generation', 'tracking', 'reminders'],
                themes: ['healing', 'thanksgiving', 'guidance', 'comfort'],
            },
        },
    });

    const careModule = await prisma.aIModule.create({
        data: {
            name: 'Christian Care Module',
            type: 'CARE',
            religionId: christianity.id,
            version: '1.0.0',
            config: {
                capabilities: ['encouragement', 'counseling', 'journal-analysis'],
                crisisProtocol: true,
            },
        },
    });

    console.log('Seed completed:', {
        christianity,
        teachingModule,
        worshipModule,
        prayerModule,
        careModule,
    });
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
