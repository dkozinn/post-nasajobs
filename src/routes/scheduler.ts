import { Hono } from 'hono';
import type { TaskRequest, TaskResponse } from '@devvit/web/server';
import { context } from '@devvit/web/server';
import { runJobFlow } from '../services/run-job-flow.js';

export const schedulerRoutes = new Hono();

schedulerRoutes.post('/daily-job-fetch', async (c) => {
  const input = await c.req.json<TaskRequest>();
  console.log('Running scheduled task:', input.name);

  const subredditName = context.subredditName || 'nasajobs';
  const result = await runJobFlow(subredditName);

  return c.json<TaskResponse>({ status: result.success ? 'ok' : 'error' }, 200);
});
