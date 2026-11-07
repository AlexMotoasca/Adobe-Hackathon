import { randomUUID } from 'node:crypto';
import { db } from './db';
import { AppError } from './errors';
import type { Campaign, Creative, Review, AnalysisStatus, AnalysisReport } from './contracts';

export interface AnalysisRow {
  id: string; campaign: Campaign & { creative?: Creative }; status: AnalysisStatus; stage: string;
  image: Buffer | null; image_type: string | null; reviews: Review[];
  review_stats: { received: number; accepted: number; duplicates: number };
  outputs: Record<string, unknown>; report: AnalysisReport | null;
  error: { code: string; message: string } | null;
  created_at: Date; updated_at: Date; lease_token: string | null; user_id?: string | null;
}

export function summary(row: AnalysisRow) {
  return { id: row.id, campaign: row.campaign, status: row.status, stage: row.stage,
    hasImage: !!row.image_type, creative: row.campaign.creative ?? { kind: 'image' }, imageUrl: row.image_type ? `/api/analyses/${row.id}/image` : null,
    reviewStats: row.review_stats, error: row.error, createdAt: row.created_at, updatedAt: row.updated_at,
    completedPersonas: Array.isArray(row.outputs?.personas) ? row.outputs.personas.length : 0, shared: row.user_id === null };
}
// With userId, only the owner's analyses (or legacy analyses created before sign-in) are visible;
// anything else is reported as not found so ids of other users' work are not disclosed.
export async function getAnalysis(id: string, userId?: string): Promise<AnalysisRow> {
  const result = await db().query<AnalysisRow>('SELECT * FROM analyses WHERE id=$1', [id]);
  const row = result.rows[0];
  if (!row || (userId && row.user_id && row.user_id !== userId)) throw new AppError('NOT_FOUND', 'Analysis not found.', 404);
  return row;
}
export async function createAnalysis(campaign: Campaign, userId?: string) {
  const result = await db().query<AnalysisRow>('INSERT INTO analyses(id,campaign,user_id) VALUES($1,$2::jsonb,$3) RETURNING *', [randomUUID(), JSON.stringify(campaign), userId ?? null]);
  return summary(result.rows[0]);
}
export async function listAnalyses(limit: number, offset: number, userId?: string) {
  const result = await db().query<AnalysisRow>(`SELECT id,campaign,status,stage,image_type,review_stats,error,created_at,updated_at,user_id,
    jsonb_build_object('personas', coalesce(outputs->'personas','[]'::jsonb)) AS outputs
    FROM analyses WHERE ($3::uuid IS NULL OR user_id=$3 OR user_id IS NULL) ORDER BY created_at DESC,id LIMIT $1 OFFSET $2`, [limit, offset, userId ?? null]);
  return result.rows.map(summary);
}
export async function saveImage(id: string, data: Buffer, type: string, creative: Creative = { kind: 'image' }) {
  // Creative metadata lives beside the campaign so reruns copy it without a schema migration.
  const result = await db().query(`UPDATE analyses SET image=$2,image_type=$3,campaign=campaign || jsonb_build_object('creative',$4::jsonb),
    status='draft',stage='draft',outputs='{}',report=NULL,error=NULL,updated_at=now()
    WHERE id=$1 AND status IN ('draft','failed') RETURNING id`, [id, data, type, JSON.stringify(creative)]);
  if (!result.rowCount) { await getAnalysis(id); throw new AppError('CONFLICT', 'Uploads are allowed only for draft or failed analyses.', 409); }
}
export async function saveTranscript(id: string, audio: 'transcribed' | 'no_speech' | 'unavailable', transcript?: object) {
  const creative = transcript ? { audio, transcript } : { audio };
  const result = await db().query(`UPDATE analyses SET campaign=jsonb_set(campaign,'{creative}',(campaign->'creative') - 'transcript' || $2::jsonb),
    outputs='{}',report=NULL,error=NULL,updated_at=now()
    WHERE id=$1 AND status IN ('draft','failed') AND campaign->'creative'->>'kind'='video' RETURNING id`, [id, JSON.stringify(creative)]);
  if (!result.rowCount) { await getAnalysis(id); throw new AppError('CONFLICT', 'Upload the video storyboard first; audio is accepted only for draft or failed video analyses.', 409); }
}
export async function saveVideoMeta(id: string, video: { type: string; size: number }) {
  const result = await db().query(`UPDATE analyses SET campaign=jsonb_set(campaign,'{creative,video}',$2::jsonb),updated_at=now()
    WHERE id=$1 AND status IN ('draft','failed') AND campaign->'creative'->>'kind'='video' RETURNING id`, [id, JSON.stringify(video)]);
  if (!result.rowCount) { await getAnalysis(id); throw new AppError('CONFLICT', 'Upload the video storyboard first; the video file is accepted only for draft or failed video analyses.', 409); }
}
export async function saveReviews(id: string, reviews: Review[], stats: object) {
  const result = await db().query(`UPDATE analyses SET reviews=$2::jsonb,review_stats=$3::jsonb,status='draft',stage='draft',
    outputs='{}',report=NULL,error=NULL,updated_at=now() WHERE id=$1 AND status IN ('draft','failed') RETURNING id`, [id, JSON.stringify(reviews), JSON.stringify(stats)]);
  if (!result.rowCount) { await getAnalysis(id); throw new AppError('CONFLICT', 'Uploads are allowed only for draft or failed analyses.', 409); }
}
export async function enqueue(id: string) {
  const result = await db().query(`UPDATE analyses SET status='queued',stage='queued',report=NULL,error=NULL,
    updated_at=now() WHERE id=$1 AND status IN ('draft','failed') AND image IS NOT NULL RETURNING id`, [id]);
  if (!result.rowCount) {
    const row = await getAnalysis(id);
    if (row.status === 'queued' || row.status === 'running') return;
    throw new AppError('CONFLICT', row.image ? 'Analysis is already completed; create a new analysis.' : 'Upload an ad image first.', 409);
  }
}

export async function rerunAnalysis(id: string, userId?: string) {
  const { copyVideo } = await import('./media');
  // Copy only inputs, preserving the original report and starting fresh research.
  const result = await db().query<AnalysisRow>(`INSERT INTO analyses
    (id,campaign,image,image_type,reviews,review_stats,status,stage,user_id)
    SELECT $2,campaign,image,image_type,reviews,review_stats,'queued','queued',$3
    FROM analyses WHERE id=$1 AND status IN ('completed','failed') AND image IS NOT NULL
      AND ($3::uuid IS NULL OR user_id=$3 OR user_id IS NULL)
    RETURNING *`, [id, randomUUID(), userId ?? null]);
  if (!result.rows[0]) {
    await getAnalysis(id);
    throw new AppError('CONFLICT', 'Only completed or failed analyses with a saved creative can be rerun.', 409);
  }
  if (result.rows[0].campaign.creative?.video) await copyVideo(id, result.rows[0].id);
  return summary(result.rows[0]);
}

export async function claimJob(): Promise<AnalysisRow | undefined> {
  // Expired workers cannot save outputs after another worker claims their job (token fencing).
  const result = await db().query<AnalysisRow>(`UPDATE analyses SET status='running',stage='ad_interpretation',
    lease_token=$1,lease_until=now()+interval '2 minutes',updated_at=now(),error=NULL
    WHERE id=(SELECT id FROM analyses WHERE status='queued' OR (status='running' AND lease_until<now())
      ORDER BY created_at FOR UPDATE SKIP LOCKED LIMIT 1) RETURNING *`, [randomUUID()]);
  return result.rows[0];
}
