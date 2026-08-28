import { Hono } from 'hono';
import type { MenuItemRequest, UiResponse } from '@devvit/web/shared';
import { context } from '@devvit/web/server';
import { runJobFlow } from '../services/run-job-flow.js';

export const menu = new Hono();

menu.post('/fetch-jobs-now', async (c) => {
  await c.req.json<MenuItemRequest>();

  const subredditName = context.subredditName || 'nasajobs';
  const result = await runJobFlow(subredditName);

  return c.json<UiResponse>({
    showToast: result.message,
  });
});
