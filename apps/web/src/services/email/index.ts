import { env } from '@/lib/config/env';

type EmailPayload = {
  to: string;
  subject: string;
  html: string;
};

export async function sendEmail(payload: EmailPayload): Promise<void> {
  const { to, subject, html } = payload;

  const emailApiUrl = env.EMAIL_API_URL;

  if (!emailApiUrl) {
    if (process.env.NODE_ENV === 'development') {
      // eslint-disable-next-line no-console
      console.info(`[Email Service] Development mode — email not sent. To: ${to}, Subject: ${subject}`);
    }
    return;
  }

  const response = await fetch(emailApiUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ to, subject, html }),
  });

  if (!response.ok) {
    throw new Error(`Email send failed: ${response.statusText}`);
  }
}

export function buildTaskAssignmentEmail(taskTitle: string, projectName: string, assignedBy: string): string {
  const appUrl = env.NEXT_PUBLIC_APP_URL;
  return `
    <!DOCTYPE html>
    <html><head><meta charset="utf-8"></head>
    <body style="font-family:-apple-system,BlinkMacSystemFont,sans-serif;padding:24px;background:#f5f5f5;">
      <div style="max-width:560px;margin:0 auto;background:white;border-radius:12px;padding:32px;">
        <h2 style="margin:0 0 16px;color:#1a1a2e;">New Task Assignment</h2>
        <p style="color:#555;line-height:1.6;">You have been assigned a new task: <strong>${taskTitle}</strong></p>
        <table style="width:100%;margin:16px 0;">
          <tr><td style="padding:8px 0;color:#888;">Project</td><td style="padding:8px 0;font-weight:600;">${projectName}</td></tr>
          <tr><td style="padding:8px 0;color:#888;">Assigned by</td><td style="padding:8px 0;font-weight:600;">${assignedBy}</td></tr>
        </table>
        <a href="${appUrl}/tasks" style="display:inline-block;padding:12px 24px;background:#2563eb;color:white;text-decoration:none;border-radius:8px;font-weight:600;">View Task</a>
      </div>
    </body></html>
  `;
}

export function buildDueDateReminderEmail(taskTitle: string, dueDate: string): string {
  const appUrl = env.NEXT_PUBLIC_APP_URL;
  return `
    <!DOCTYPE html>
    <html><head><meta charset="utf-8"></head>
    <body style="font-family:-apple-system,BlinkMacSystemFont,sans-serif;padding:24px;background:#f5f5f5;">
      <div style="max-width:560px;margin:0 auto;background:white;border-radius:12px;padding:32px;">
        <h2 style="margin:0 0 16px;color:#d97706;">Task Due Date Reminder</h2>
        <p style="color:#555;line-height:1.6;">Task <strong>${taskTitle}</strong> is due on <strong>${dueDate}</strong>.</p>
        <a href="${appUrl}/tasks" style="display:inline-block;padding:12px 24px;background:#2563eb;color:white;text-decoration:none;border-radius:8px;font-weight:600;">View Task</a>
      </div>
    </body></html>
  `;
}

export function buildTaskCompletedEmail(taskTitle: string, completedBy: string): string {
  const appUrl = env.NEXT_PUBLIC_APP_URL;
  return `
    <!DOCTYPE html>
    <html><head><meta charset="utf-8"></head>
    <body style="font-family:-apple-system,BlinkMacSystemFont,sans-serif;padding:24px;background:#f5f5f5;">
      <div style="max-width:560px;margin:0 auto;background:white;border-radius:12px;padding:32px;">
        <h2 style="margin:0 0 16px;color:#16a34a;">Task Completed</h2>
        <p style="color:#555;line-height:1.6;">Task <strong>${taskTitle}</strong> has been completed by ${completedBy}.</p>
        <a href="${appUrl}/tasks" style="display:inline-block;padding:12px 24px;background:#2563eb;color:white;text-decoration:none;border-radius:8px;font-weight:600;">View Task</a>
      </div>
    </body></html>
  `;
}

export function buildPasswordResetEmail(resetUrl: string): string {
  return `
    <!DOCTYPE html>
    <html><head><meta charset="utf-8"></head>
    <body style="font-family:-apple-system,BlinkMacSystemFont,sans-serif;padding:24px;background:#f5f5f5;">
      <div style="max-width:560px;margin:0 auto;background:white;border-radius:12px;padding:32px;">
        <h2 style="margin:0 0 16px;color:#1a1a2e;">Password Reset</h2>
        <p style="color:#555;line-height:1.6;">Click the button below to reset your password. This link expires in 1 hour.</p>
        <a href="${resetUrl}" style="display:inline-block;padding:12px 24px;background:#2563eb;color:white;text-decoration:none;border-radius:8px;font-weight:600;">Reset Password</a>
      </div>
    </body></html>
  `;
}

export function buildEmailVerificationEmail(verifyUrl: string): string {
  return `
    <!DOCTYPE html>
    <html><head><meta charset="utf-8"></head>
    <body style="font-family:-apple-system,BlinkMacSystemFont,sans-serif;padding:24px;background:#f5f5f5;">
      <div style="max-width:560px;margin:0 auto;background:white;border-radius:12px;padding:32px;">
        <h2 style="margin:0 0 16px;color:#1a1a2e;">Verify Your Email</h2>
        <p style="color:#555;line-height:1.6;">Click the button below to verify your email address.</p>
        <a href="${verifyUrl}" style="display:inline-block;padding:12px 24px;background:#2563eb;color:white;text-decoration:none;border-radius:8px;font-weight:600;">Verify Email</a>
      </div>
    </body></html>
  `;
}

export function buildInvitationEmail(inviteUrl: string, organizationName: string): string {
  return `
    <!DOCTYPE html>
    <html><head><meta charset="utf-8"></head>
    <body style="font-family:-apple-system,BlinkMacSystemFont,sans-serif;padding:24px;background:#f5f5f5;">
      <div style="max-width:560px;margin:0 auto;background:white;border-radius:12px;padding:32px;">
        <h2 style="margin:0 0 16px;color:#1a1a2e;">You've Been Invited</h2>
        <p style="color:#555;line-height:1.6;">You have been invited to join <strong>${organizationName}</strong> on Professional Task Manager.</p>
        <a href="${inviteUrl}" style="display:inline-block;padding:12px 24px;background:#2563eb;color:white;text-decoration:none;border-radius:8px;font-weight:600;">Accept Invitation</a>
      </div>
    </body></html>
  `;
}
