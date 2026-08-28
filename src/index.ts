import { Hono } from 'hono';
import { serve } from '@hono/node-server';
import { createServer, getServerPort } from '@devvit/web/server';
import { menu } from './routes/menu.js';
import { schedulerRoutes } from './routes/scheduler.js';

const app = new Hono();

const internal = new Hono();


internal.route('/menu', menu);
internal.route('/scheduler', schedulerRoutes);

app.route('/internal', internal);

serve({
  fetch: app.fetch,
  createServer,
  port: getServerPort(),
});
