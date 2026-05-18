import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createNotification } from '@/lib/notifications';

export async function GET(req: NextRequest) {
    try {
        const authHeader = req.headers.get('Authorization');
        if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Get all active prayer reminders
        const reminders = await prisma.prayerReminder.findMany({
            where: { active: true },
        });

        let sentCount = 0;
        const now = new Date();
        const currentHour = now.getHours();
        const currentMinute = now.getMinutes();

        for (const reminder of reminders) {
            // Basic time matching (reminder.time expected as "HH:mm")
            const [hours, minutes] = reminder.time.split(':').map(Number);

            if (hours === currentHour && Math.abs(minutes - currentMinute) <= 5) {
                await createNotification({
                    userId: reminder.userId,
                    type: 'PRAYER_REMINDER',
                    title: 'Daily Prayer Reminder',
                    message: reminder.title || 'Time for your daily prayer',
                    data: { reminderId: reminder.id },
                });
                sentCount++;
            }
        }

        return NextResponse.json({ success: true, sent: sentCount });
    } catch (error) {
        console.error('Cron job error:', error);
        return NextResponse.json({ error: 'Failed to send reminders' }, { status: 500 });
    }
}
