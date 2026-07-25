import { prisma } from '@/lib/database';

interface OrgSettings {
  slackWebhookUrl?: string;
  [key: string]: unknown;
}

export async function getSlackWebhookUrl(organizationId: string): Promise<string | null> {
  const org = await prisma.organization.findUnique({
    where: { id: organizationId },
    select: { settings: true },
  });
  const settings = (org?.settings ?? {}) as OrgSettings;
  return settings.slackWebhookUrl || null;
}

/**
 * Posts a message to the organization's configured Slack incoming webhook, if any.
 * Silently no-ops when Slack isn't configured, and swallows delivery failures so a
 * broken webhook never blocks the task/notification flow that triggered it.
 */
export async function sendSlackNotification(organizationId: string, message: string): Promise<void> {
  const webhookUrl = await getSlackWebhookUrl(organizationId);
  if (!webhookUrl) return;

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: message }),
    });
    if (!response.ok) {
      console.error(`Slack webhook responded with ${response.status}`);
    }
  } catch (error) {
    console.error('Slack notification failed:', error);
  }
}
