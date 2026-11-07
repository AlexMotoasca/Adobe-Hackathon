import { db } from './db';
import type { AnalysisRow } from './repository';
import { GroqModel, type Model } from './ai';
import { runPipeline } from './pipeline';
import { AppError } from './errors';
import { personaLanes } from './persona-routing';

export async function executeJob(job: AnalysisRow, model: Model) {
  let lostLease = false;
  const heartbeat = setInterval(() => {
    void db().query(`UPDATE analyses SET lease_until=now()+interval '2 minutes'
      WHERE id=$1 AND lease_token=$2 AND status='running'`, [job.id, job.lease_token])
      .then(r => { if (!r.rowCount) lostLease = true; }).catch(() => { lostLease = true; });
  }, 15000);
  try {
    const researchModel = new GroqModel();
    researchModel.textModel = process.env.GROQ_RESEARCH_MODEL || model.textModel;
    researchModel.maxOutputTokens = 2500;
    const lanes = personaLanes(model);
    const researchModels = lanes.length === 1 ? [researchModel] : ['GROQ_API_KEY', 'GROQ_TEAM_2_API_KEY', 'GROQ_TEAM_3_API_KEY'].map(key => {
      const assigned = new GroqModel(key);
      assigned.textModel = researchModel.textModel;
      assigned.maxOutputTokens = 2500;
      return assigned;
    });
    const report = await runPipeline({ campaign: job.campaign, image: job.image!, reviews: job.reviews }, model, async (stage, outputs) => {
      if (lostLease) throw new AppError('LEASE_LOST', 'Worker lease lost; another worker can resume.', 503);
      const result = await db().query(`UPDATE analyses SET stage=$3,outputs=$4::jsonb,updated_at=now()
        WHERE id=$1 AND lease_token=$2 AND status='running'`, [job.id, job.lease_token, stage, JSON.stringify(outputs)]);
      if (!result.rowCount) throw new AppError('LEASE_LOST', 'Worker lease lost.', 503);
    }, job.outputs, researchModel, lanes, researchModels);
    if (lostLease) throw new AppError('LEASE_LOST', 'Worker lease lost.', 503);
    const result = await db().query(`UPDATE analyses SET status='completed',stage='completed',report=$3::jsonb,
      lease_token=NULL,lease_until=NULL,updated_at=now() WHERE id=$1 AND lease_token=$2 AND status='running'`, [job.id, job.lease_token, JSON.stringify(report)]);
    return result.rowCount ? 'completed' : 'lease_lost';
  } catch (error) {
    const publicError = error instanceof AppError ? { code: error.code, message: error.message } : { code: 'PIPELINE_FAILED', message: 'Analysis failed unexpectedly. Check worker configuration and retry.' };
    if (publicError.code !== 'LEASE_LOST') await db().query(`UPDATE analyses SET status='failed',error=$3::jsonb,
      lease_token=NULL,lease_until=NULL,updated_at=now() WHERE id=$1 AND lease_token=$2 AND status='running'`, [job.id, job.lease_token, JSON.stringify(publicError)]);
    return publicError.code;
  } finally { clearInterval(heartbeat); }
}
