import { prisma } from '@/lib/prisma';
import { sendEmail } from '@/lib/email/templates';

interface Notification {
    userId: string;
    type: 'PRAYER_ANSWERED' | 'POST_APPROVED' | 'AID_UPDATE' | 'CONFERENCE_REMINDER' | 'NEW_MESSAGE' | 'PRAYER_REMINDER';
    title: string;
    message: string;
    data?: any;
}

export async function createNotification(notification: Notification) {
    // Store in database for in-app notifications
    const dbNotification = await prisma.notification.create({
        data: {
            userId: notification.userId,
            type: notification.type,
            title: notification.title,
            message: notification.message,
            data: notification.data || {},
            read: false,
        },
    });

    // Get user preferences
    const user = await prisma.user.findUnique({
        where: { id: notification.userId },
        select: { email: true, name: true, notificationPreferences: true },
    });

    // Extract preferences safely
    const prefs = user?.notificationPreferences as any;
    const emailEnabled = prefs?.email !== false; // Default to true if not specified

    // Send email if enabled
    if (user?.email && emailEnabled) {
        // Map template if necessary, otherwise use generic
        const templateName = 'notificationGeneric';
        await sendEmail(user.email, templateName, [
            user.name || 'Community Member',
            notification.message,
        ]);
    }

    return dbNotification;
}

export async function getNotifications(userId: string, unreadOnly = false) {
    return prisma.notification.findMany({
        where: {
            userId,
            ...(unreadOnly && { read: false }),
        },
        orderBy: { createdAt: 'desc' },
        take: 50,
    });
}

export async function markAsRead(notificationId: string, userId: string) {
    return prisma.notification.update({
        where: {
            id: notificationId,
            userId,
        },
        data: { read: true },
    });
}

export async function markAllAsRead(userId: string) {
    return prisma.notification.updateMany({
        where: {
            userId,
            read: false,
        },
        data: { read: true },
    });
}
