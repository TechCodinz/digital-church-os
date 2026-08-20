import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma, checkDbConnection } from '@/lib/prisma';

const onboardingFlows = {
    seeker: {
        steps: [
            { id: 'welcome', title: 'Welcome Home', content: "We're glad you're here to explore faith and community." },
            { id: 'prayer', title: 'Start with Prayer', content: "What is one thing on your heart today?" },
            { id: 'scripture', title: 'Ancient Wisdom', content: "Explore verses tailored to your unique journey." },
            { id: 'community', title: 'Say Hello', content: "Introduce yourself to our loving community." },
        ],
        rewards: {
            complete: 'Free 7-day AI prayer guide'
        }
    },
    believer: {
        steps: [
            { id: 'welcome', title: 'Welcome Back', content: "Ready to deepen your walk? Let's get started." },
            { id: 'journal', title: 'Spiritual Goals', content: "What are your spiritual intentions for this season?" },
            { id: 'conference', title: 'Upcoming Events', content: "Join our next global gathering." },
            { id: 'group', title: 'Find Your Tribe', content: "Connect with a specialized community group." },
        ],
        rewards: {
            complete: 'Access to exclusive sanctuary sessions'
        }
    },
    leader: {
        steps: [
            { id: 'identity', title: 'Define Your Ministry', content: 'Confirm your church identity, leadership role, location, service rhythm, and core ministry focus.' },
            { id: 'team', title: 'Invite Your Team', content: 'Prepare pastors, admins, care leaders, media teams, youth workers, and volunteers for role-based access.' },
            { id: 'service', title: 'Prepare Your First Service', content: 'Set service times, live stream links, sermon preparation, prayer flow, presentation, and follow-up actions.' },
            { id: 'care', title: 'Configure Human Care', content: 'Assign care ownership, escalation routing, trusted contacts, and human review before opening sensitive ministry workflows.' },
            { id: 'launch', title: 'Review Launch Readiness', content: 'Check ministry operations, media rights, feature flags, safety queues, and deployment readiness before public rollout.' },
        ],
        rewards: {
            complete: 'Unlocked: Ministry Command Center and leader operating workflow'
        }
    }
};

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const requestedType = searchParams.get('type') || 'seeker';
    const type = requestedType in onboardingFlows ? requestedType as keyof typeof onboardingFlows : 'seeker';

    return NextResponse.json(onboardingFlows[type]);
}

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        const { step, type } = await req.json();

        if (!session?.user?.id) {
            return NextResponse.json({ success: true, demo: true });
        }

        const isDbUp = await checkDbConnection();
        if (isDbUp) {
            await prisma.user.update({
                where: { id: session.user.id },
                data: {
                    onboardingStep: `${type || 'member'}:${step}`,
                    onboardingCompleted: step === 'complete'
                }
            });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Onboarding Update Error:', error);
        return NextResponse.json({ error: 'Failed to update onboarding' }, { status: 500 });
    }
}
