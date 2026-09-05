import { reddit, settings } from '@devvit/web/server';
import { fetchJobs } from './fetch-jobs.js';
import { notify } from './notify.js';

export async function runJobFlow(
  subredditName: string
): Promise<{ success: boolean; posted: boolean; message: string }> {
  const [jobsEmail, jobsKey, discordWebhook, postFlairID] = await Promise.all([
    settings.get<string>('jobsEmail'),
    settings.get<string>('jobsKey'),
    settings.get<string>('discordWebhook'),
    settings.get<string>('postFlairID'),
  ]);

  // console.log(await settings.getAll())

  function getLogTimestamp(): string {
    return new Date().toISOString().replace(/\.\d{3}Z$/, 'Z');
}

// Example: "2026-08-30T18:07:22Z"

  if (!jobsEmail || !jobsKey) {
    const errorMsg = 'App settings are not fully configured (jobsEmail or jobsKey is missing).';
    console.error(errorMsg);
    await notify(discordWebhook, errorMsg, 'nasajobsbot Configuration Error', 1);
    return { success: false, posted: false, message: errorMsg };
  }

  try {
    console.log('Fetching jobs from USAJobs...');
    const results = await fetchJobs(jobsEmail, jobsKey);

    if (results && results.trim().length > 0) {
      const today = new Date();
      const weekday = today.toLocaleDateString('en-US', { weekday: 'long' });
      const month = today.toLocaleDateString('en-US', { month: 'long' });
      const day = today.toLocaleDateString('en-US', { day: 'numeric' });
      const year = today.toLocaleDateString('en-US', { year: 'numeric' });
     
      const title = `New usajobs.gov NASA postings as of ${weekday} ${month} ${day}, ${year}`;

      console.log(`[${getLogTimestamp()}] Job flow started for r/${subredditName}`);
      console.log(`Submitting new post to r/${subredditName}: "${title}"`);
      await reddit.submitPost({
        subredditName,
        title,
        text: results,
        ...(postFlairID && { flairId: postFlairID, flairText: 'usajobs.gov' }),
        sendreplies: false,
        runAs: 'APP',
      });

      console.log('Successfully posted daily new jobs.');
      return { success: true, posted: true, message: 'Posted daily new jobs.' };
    } else {
      console.log('No jobs found today.');
      return { success: true, posted: false, message: 'No jobs found today.' };
    }
  } catch (error: unknown) {
    const errorStr = error instanceof Error ? error.message : String(error);
    console.error('Error running job flow:', error);
    await notify(discordWebhook, errorStr, 'nasajobsbot crashed', 1);
    return { success: false, posted: false, message: `Unexpected error: ${errorStr}` };
  }
}
