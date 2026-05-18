import { prisma, checkDbConnection } from '@/lib/prisma';
import { nanoid } from 'nanoid';

export class ReferralManager {
    static async generateReferralLink(userId: string) {
        const isDbUp = await checkDbConnection();
        const code = nanoid(10);
        const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

        if (isDbUp) {
            try {
                await prisma.referralCode.create({
                    data: {
                        code,
                        userId,
                        expiresAt,
                    }
                });
            } catch (error) {
                console.error('Failed to create referral code in DB:', error);
            }
        }

        // Demo fallback/standard behavior
        return {
            code,
            link: `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/join?ref=${code}`,
            shareText: `Join me on Digital Church OS - a spiritual community where we grow together! ✝️`,
            benefits: {
                referrer: "30 days of AI features free",
                referee: "Welcome prayer package + 7 days free"
            }
        };
    }

    static async validateReferral(code: string) {
        const isDbUp = await checkDbConnection();
        if (!isDbUp) return { valid: true, demo: true };

        const referral = await prisma.referralCode.findUnique({
            where: { code },
            include: { user: true }
        });

        if (!referral || referral.uses >= referral.maxUses || referral.expiresAt < new Date()) {
            return { valid: false };
        }

        return { valid: true, userId: referral.userId };
    }
}
