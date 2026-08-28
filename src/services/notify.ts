export async function notify(
  webhookUrl: string | undefined,
  body: string,
  title: string,
  priority: number = 1
): Promise<boolean> {
  console.error(`[Notification] ${title}: ${body}`);
  if (!webhookUrl) {
    console.warn('Notification skipped: discordWebhook is not set.');
    return false;
  }

  const payload = {
    username: 'nasajobsbot',
    content: priority > 0 ? '@here' : '',
    embeds: [
      {
        title: title,
        description: body.substring(0, 2048),
        color: priority > 0 ? 0xff0000 : 0x00ff00,
      },
    ],
  };

  try {
    const resp = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return resp.ok;
  } catch (err) {
    console.error('Failed to send notification to Discord:', err);
    return false;
  }
}
