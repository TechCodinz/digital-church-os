import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import EmailProvider from 'next-auth/providers/email';
import CredentialsProvider from 'next-auth/providers/credentials';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import { NextAuthOptions } from 'next-auth';
import type { Adapter } from 'next-auth/adapters';
import { prisma } from '@/lib/prisma';

// ── Dynamic provider list — only include providers when env vars are set ──────
const providers: any[] = [];

// 1. Google OAuth — only if credentials are configured
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  providers.push(
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      profile(profile) {
        return {
          id: profile.sub,
          name: profile.name,
          email: profile.email,
          image: profile.picture,
          role: 'MEMBER',
          faithPreference: 'Christian',
        };
      },
    })
  );
}

// 2. Magic Link Email — only if Resend API key is configured
if (process.env.RESEND_API_KEY && process.env.EMAIL_FROM) {
  providers.push(
    EmailProvider({
      server: {
        host: process.env.EMAIL_SERVER || 'smtp.resend.com',
        port: Number(process.env.EMAIL_PORT || 465),
        auth: {
          user: process.env.EMAIL_USER || 'resend',
          pass: process.env.RESEND_API_KEY,
        },
      },
      from: process.env.EMAIL_FROM,
      async sendVerificationRequest({ identifier: email, url }) {
        try {
          const { Resend } = await import('resend');
          const resend = new Resend(process.env.RESEND_API_KEY);
          await resend.emails.send({
            from: process.env.EMAIL_FROM!,
            to: [email],
            subject: 'Sign in to Digital Church OS',
            html: `
                            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
                                <div style="text-align: center; margin-bottom: 32px;">
                                    <div style="width: 60px; height: 60px; background: #789b64; border-radius: 16px; display: inline-flex; align-items: center; justify-content: center;">
                                        <span style="color: white; font-size: 28px;">✝</span>
                                    </div>
                                    <h1 style="color: #789b64; font-weight: 300; margin-top: 16px;">Digital Church OS</h1>
                                </div>
                                <p style="color: #555; margin-bottom: 24px;">Click the link below to sign in securely:</p>
                                <a href="${url}" style="display: inline-block; padding: 14px 32px; background: #789b64; color: white; text-decoration: none; border-radius: 12px; font-weight: 500;">Sign In to Digital Church OS</a>
                                <p style="margin-top: 24px; color: #999; font-size: 12px;">This link expires in 24 hours. If you didn't request this, ignore this email.</p>
                            </div>
                        `,
          });
        } catch (err) {
          console.error('Email send error:', err);
          throw new Error('Failed to send verification email');
        }
      },
    })
  );
}

// 3. Credentials (Email + Password) — ALWAYS available as fallback
//    Works immediately without any external service setup.
//    Users register via /auth/register (bcrypt hashed passwords stored in DB)
providers.push(
  CredentialsProvider({
    name: 'Email & Password',
    credentials: {
      email: { label: 'Email', type: 'email' },
      password: { label: 'Password', type: 'password' },
    },
    async authorize(credentials) {
      if (!credentials?.email || !credentials?.password) return null;
      try {
        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
          select: { id: true, name: true, email: true, image: true, role: true, passwordHash: true, faithPreference: true },
        });
        if (!user || !user.passwordHash) return null;

        const { compare } = await import('bcryptjs');
        const valid = await compare(credentials.password, user.passwordHash);
        if (!valid) return null;

        return { id: user.id, name: user.name, email: user.email, image: user.image, role: user.role, faithPreference: user.faithPreference };
      } catch (err) {
        console.error('Credentials auth error:', err);
        return null;
      }
    },
  })
);

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as Adapter,
  providers,
  callbacks: {
    async session({ session, user, token }: any) {
      if (session.user) {
        // JWT strategy uses token, database strategy uses user
        const userId = user?.id || token?.sub;
        const role = user?.role || token?.role;
        session.user.id = userId;
        session.user.role = role || 'MEMBER';
        session.user.faithPreference = user?.faithPreference || token?.faithPreference || 'Christian';
      }
      return session;
    },
    async jwt({ token, user }: any) {
      // Only used for Credentials provider (JWT strategy)
      if (user) {
        token.role = user.role;
        token.faithPreference = user.faithPreference;
      }
      return token;
    },
    async signIn({ user }: any) {
      try {
        const existingUser = await prisma.user.findUnique({
          where: { email: user.email! },
          select: { id: true },
        });
        if (!existingUser) {
          try {
            const { sendEmail } = await import('@/lib/email/templates');
            await sendEmail(user.email!, 'welcome', [user.name || 'Friend']);
          } catch (emailErr) {
            console.warn('Welcome email failed (non-fatal):', emailErr);
          }
        }
      } catch (err) {
        console.error('signIn callback error (non-fatal):', err);
      }
      return true;
    },
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
    verifyRequest: '/auth/verify',
  },
  // Always use JWT strategy - database strategy breaks CredentialsProvider.
  // Google OAuth users will still have their accounts stored via PrismaAdapter,
  // but session tokens are JWT-based for consistency.
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60,
  },
  secret: process.env.NEXTAUTH_SECRET || 'digital-church-os-dev-secret-change-in-production',
};

const handler = NextAuth(authOptions as any);
export { handler as GET, handler as POST };
