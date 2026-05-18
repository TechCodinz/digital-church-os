import { Resend } from 'resend';

// Only create Resend client if key is set
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export const emailTemplates = {
  welcome: (name: string) => ({
    subject: 'Welcome to Digital Church OS',
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #789b64;">Welcome, ${name}!</h1>
        <p>We're so glad you've joined our digital spiritual community.</p>
        <p>Here's what you can do:</p>
        <ul>
          <li>Join live services and conferences</li>
          <li>Share prayer requests</li>
          <li>Connect with the community</li>
          <li>Track your spiritual journey</li>
        </ul>
        <a href="${process.env.NEXTAUTH_URL}/dashboard" style="display: inline-block; padding: 12px 24px; background: #789b64; color: white; text-decoration: none; border-radius: 8px; margin-top: 20px;">
          Go to Dashboard
        </a>
      </div>
    `,
  }),

  prayerReminder: (name: string, prayerTitle: string) => ({
    subject: 'Prayer Reminder',
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #789b64;">Prayer Reminder</h2>
        <p>Hello ${name},</p>
        <p>This is a reminder for your prayer request:</p>
        <div style="background: #f5f0ea; padding: 20px; border-radius: 12px; margin: 20px 0;">
          <strong>${prayerTitle}</strong>
        </div>
        <a href="${process.env.NEXTAUTH_URL}/prayer-room" style="color: #789b64;">Visit Prayer Room</a>
      </div>
    `,
  }),

  aidRequestUpdate: (name: string, status: string, requestId: string) => ({
    subject: 'Aid Request Update',
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #789b64;">Aid Request Update</h2>
        <p>Hello ${name},</p>
        <p>Your aid request #${requestId} has been <strong>${status}</strong>.</p>
        <a href="${process.env.NEXTAUTH_URL}/dashboard/aid" style="color: #789b64;">View Details</a>
      </div>
    `,
  }),

  conferenceReminder: (name: string, conference: any) => ({
    subject: `Reminder: ${conference.title} starts soon`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #789b64;">Conference Reminder</h2>
        <p>Hello ${name},</p>
        <p>Your conference "${conference.title}" starts at ${new Date(conference.startDate).toLocaleTimeString()}.</p>
        <a href="${conference.virtualRoomLink}" style="display: inline-block; padding: 12px 24px; background: #789b64; color: white; text-decoration: none; border-radius: 8px; margin-top: 20px;">
          Join Now
        </a>
      </div>
    `,
  }),

  offeringReceipt: (name: string, amount: number) => ({
    subject: 'Record of your Offering',
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #789b64;">Thank you for your generosity</h2>
        <p>Hello ${name},</p>
        <p>We've successfully received your offering of $${amount.toFixed(2)}.</p>
        <p>Your gift helps support our community and global mission.</p>
      </div>
    `,
  }),

  paymentFailed: (name: string) => ({
    subject: 'Payment Issue Detected',
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #d94e4e;">Payment Method Issue</h2>
        <p>Hello ${name},</p>
        <p>We were unable to process your recent offering. Please review your payment details.</p>
      </div>
    `,
  }),

  notificationGeneric: (name: string, message: string) => ({
    subject: 'Community Update',
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #789b64;">Spiritual Pulse Update</h2>
        <p>Hello ${name},</p>
        <p>${message}</p>
      </div>
    `,
  }),
};

export async function sendEmail(to: string, template: keyof typeof emailTemplates, data: any) {
  try {
    if (!resend) {
      console.warn('Resend API key missing, not sending email:', template);
      return { success: false, error: 'Missing API key' };
    }

    // @ts-ignore
    const { subject, html } = emailTemplates[template](...data);

    await resend.emails.send({
      from: process.env.EMAIL_FROM!,
      to: [to],
      subject,
      html,
    });

    return { success: true };
  } catch (error) {
    console.error('Email sending failed:', error);
    return { success: false, error };
  }
}
