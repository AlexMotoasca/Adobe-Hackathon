import { setTimeout as sleep } from 'node:timers/promises';
import { db } from './db';
import { claimJob } from './repository';
import { GroqModel } from './ai';
import { executeJob } from './jobs';

let stopping = false;
process.on('SIGINT', () => { stopping = true; });
process.on('SIGTERM', () => { stopping = true; });
if (!process.env.GROQ_API_KEY) throw new Error('GROQ_API_KEY is required for the worker');
console.log('MindMarket worker polling PostgreSQL.');
while (!stopping) {
  try {
    const job = await claimJob();
    if (!job) { await sleep(1000); continue; }
    console.log(`Analysis ${job.id}: ${await executeJob(job, new GroqModel())}`);
  } catch { console.error('Worker database operation failed; retrying in 5 seconds.'); await sleep(5000); }
}
await db().end();
