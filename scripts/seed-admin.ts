import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    const email = 'admin@church.com';
    const password = 'Admin1234!';
    const passwordHash = await bcrypt.hash(password, 10);

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
        console.log(`Admin user '${email}' already exists. Updating password...`);
        await prisma.user.update({
            where: { email },
            data: { passwordHash, role: 'CHURCH_ADMIN' },
        });
    } else {
        await prisma.user.create({
            data: {
                email,
                name: 'Church Admin',
                passwordHash,
                role: 'CHURCH_ADMIN',
            },
        });
        console.log(`✅ Admin user created: ${email} / ${password}`);
    }

    console.log('🎉 Seed complete. Login with:');
    console.log(`   Email: ${email}`);
    console.log(`   Password: ${password}`);
}

main()
    .catch((e) => {
        console.error('Seed error:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
