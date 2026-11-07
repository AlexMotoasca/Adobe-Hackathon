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
  created_at: Date; updated_at: Date; lease_token: string | null;
}

export function summary(row: AnalysisRow) {
  return { id: row.id, campaign: row.campaign, status: row.status, stage: row.stage,
    hasImage: !!row.image_type, creative: row.campaign.creative ?? { kind: 'image' }, imageUrl: row.image_type ? `/api/analyses/${row.id}/image` : null,
    reviewStats: row.review_stats, error: row.error, createdAt: row.created_at, updatedAt: row.updated_at,
    completedPersonas: Array.isArray(row.outputs?.personas) ? row.outputs.personas.length : 0 };
}
export async function getAnalysis(id: string): Promise<AnalysisRow> {
  const result = await db().query<AnalysisRow>('SELECT * FROM analyses WHERE id=$1', [id]);
  if (!result.rows[0]) throw new AppError('NOT_FOUND', 'Analysis not found.', 404);
  return result.rows[0];
}
export async function createAnalysis(campaign: Campaign) {
  const result = await db().query<AnalysisRow>('INSERT INTO analyses(id,campaign) VALUES($1,$2::jsonb) RETURNING *', [randomUUID(), JSON.stringify(campaign)]);
  return summary(result.rows[0]);
}
export async function listAnalyses(limit: number, offset: number) {
  const result = await db().query<AnalysisRow>(`SELECT id,campaign,status,stage,image_type,review_stats,error,created_at,updated_at,
    jsonb_build_object('personas', coalesce(outputs->'personas','[]'::jsonb)) AS outputs
    FROM analyses ORDER BY created_at DESC,id LIMIT $1 OFFSET $2`, [limit, offset]);
  return result.rows.map(summary);
}
export async function saveImage(id: string, data: Buffer, type: string, creative: Creative = { kind: 'image' }) {
  // Creative metadata lives beside the campaign so reruns copy it without a schema migration.
  const result = await db().query(`UPDATE analyses SET image=$2,image_type=$3,campaign=campaign || jsonb_build_object('creative',$4::jsonb),
    status='draft',stage='draft',outputs='{}',report=NULL,error=NULL,updated_at=now()
    WHERE id=$1 AND status IN ('draft','failed') RETURNING id`, [id, data, type, JSON.stringify(creative)]);
  if (!result.rowCount) { await getAnalysis(id); throw new AppError('CONFLICT', 'Uploads are allowed only for draft or failed analyses.', 409); }
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

export async function rerunAnalysis(id: string) {
  // Copy only inputs, preserving the original report and starting fresh research.
  const result = await db().query<AnalysisRow>(`INSERT INTO analyses
    (id,campaign,image,image_type,reviews,review_stats,status,stage)
    SELECT $2,campaign,image,image_type,reviews,review_stats,'queued','queued'
    FROM analyses WHERE id=$1 AND status IN ('completed','failed') AND image IS NOT NULL
    RETURNING *`, [id, randomUUID()]);
  if (!result.rows[0]) {
    await getAnalysis(id);
    throw new AppError('CONFLICT', 'Only completed or failed analyses with a saved creative can be rerun.', 409);
  }
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
