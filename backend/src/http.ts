import { z } from 'zod';
import { campaignSchema } from './contracts';
import { AppError } from './errors';
import { db } from './db';
import { createAnalysis, listAnalyses, getAnalysis, summary, saveImage, saveReviews, enqueue } from './repository';
import { ingestImage, ingestReviews, MAX_IMAGE_BYTES, MAX_REVIEW_BYTES } from './ingestion';

export async function readBounded(request: Request, limit: number): Promise<Buffer> {
  if (Number(request.headers.get('content-length')) > limit) throw new AppError('PAYLOAD_TOO_LARGE', 'Request exceeds the upload limit.', 413);
  const reader = request.body?.getReader();
  if (!reader) return Buffer.alloc(0);
  const chunks: Uint8Array[] = [];
  let size = 0;
  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      size += value.length;
      if (size > limit) { await reader.cancel(); throw new AppError('PAYLOAD_TOO_LARGE', 'Request exceeds the upload limit.', 413); }
      chunks.push(value);
    }
  } finally { reader.releaseLock(); }
  return Buffer.concat(chunks);
}

async function upload(request: Request, limit: number) {
  if (!request.headers.get('content-type')?.startsWith('multipart/form-data')) throw new AppError('INVALID_UPLOAD', 'Use multipart/form-data with one file field.');
  const bytes = await readBounded(request, limit + 16 * 1024);
  let form: FormData;
  try { form = await new Response(new Uint8Array(bytes), { headers: { 'Content-Type': request.headers.get('content-type')! } }).formData(); }
  catch { throw new AppError('INVALID_UPLOAD', 'Malformed multipart body.'); }
  const file = form.get('file');
  if (!(file instanceof File) || [...form.keys()].length !== 1) throw new AppError('INVALID_UPLOAD', 'Supply exactly one file field.');
  if (file.size > limit) throw new AppError('PAYLOAD_TOO_LARGE', 'File exceeds upload limit.', 413);
  return { bytes: Buffer.from(await file.arrayBuffer()), name: file.name };
}

async function dispatch(request: Request, path: string[]) {
  const method = request.method;
  if (method === 'GET' && path.join('/') === 'health') {
    try { await db().query('SELECT id FROM analyses LIMIT 0'); }
    catch { throw new AppError('DATABASE_UNAVAILABLE', 'Database is unavailable or migrations are missing.', 503); }
    return Response.json({ status: 'ok', database: 'connected', providerConfigured: !!process.env.GROQ_API_KEY });
  }
  if (path[0] !== 'analyses') throw new AppError('NOT_FOUND', 'Endpoint not found.', 404);
  if (path.length === 1) {
    if (method === 'POST') {
      if (!request.headers.get('content-type')?.startsWith('application/json')) throw new AppError('INVALID_REQUEST', 'Use application/json.');
      let input: unknown;
      try { input = JSON.parse((await readBounded(request, 24000)).toString('utf8')); }
      catch (e) { if (e instanceof AppError) throw e; throw new AppError('INVALID_JSON', 'Malformed JSON request.'); }
      return Response.json(await createAnalysis(campaignSchema.parse(input)), { status: 201 });
    }
    if (method === 'GET') {
      const search = new URL(request.url).searchParams;
      const limit = z.coerce.number().int().min(1).max(100).parse(search.get('limit') ?? 20);
      const offset = z.coerce.number().int().min(0).max(100000).parse(search.get('offset') ?? 0);
      return Response.json({ items: await listAnalyses(limit, offset), limit, offset });
    }
  }
  const id = z.string().uuid().parse(path[1]);
  if (path.length === 2 && method === 'GET') return Response.json(summary(await getAnalysis(id)));
  if (path.length !== 3) throw new AppError('NOT_FOUND', 'Endpoint not found.', 404);
  if (path[2] === 'image' && method === 'POST') {
    const file = await upload(request, MAX_IMAGE_BYTES);
    const image = await ingestImage(file.bytes);
    await saveImage(id, image.data, image.type);
    return Response.json(summary(await getAnalysis(id)));
  }
  if (path[2] === 'reviews' && method === 'POST') {
    const file = await upload(request, MAX_REVIEW_BYTES);
    const { reviews, stats } = ingestReviews(file.bytes, file.name);
    await saveReviews(id, reviews, stats);
    return Response.json({ reviews, stats });
  }
  if (path[2] === 'start' && method === 'POST') {
    if (!process.env.GROQ_API_KEY) throw new AppError('PROVIDER_NOT_CONFIGURED', 'Set GROQ_API_KEY before starting analysis.', 503);
    await enqueue(id);
    return Response.json(summary(await getAnalysis(id)), { status: 202 });
  }
  if (method === 'GET') {
    const row = await getAnalysis(id);
    if (path[2] === 'image') {
      if (!row.image) throw new AppError('NOT_FOUND', 'No image uploaded.', 404);
      return new Response(new Uint8Array(row.image), { headers: { 'Content-Type': row.image_type!, 'X-Content-Type-Options': 'nosniff' } });
    }
    if (path[2] === 'reviews') return Response.json({ reviews: row.reviews, stats: row.review_stats });
    if (path[2] === 'report') {
      if (row.status !== 'completed') throw new AppError('REPORT_NOT_READY', 'The report is not complete. Poll the analysis status.', 409);
      return Response.json(row.report);
    }
  }
  throw new AppError('NOT_FOUND', 'Endpoint or method not supported.', 404);
}

export async function handle(request: Request, path: string[]) {
  const origin = request.headers.get('origin');
  const allowed = (process.env.CORS_ORIGINS || 'http://localhost:3000').split(',').map(v => v.trim());
  const headers = new Headers({ 'Cache-Control': 'no-store', Vary: 'Origin' });
  let response: Response;
  try {
    if (origin && !allowed.includes(origin) && origin !== new URL(request.url).origin) throw new AppError('ORIGIN_NOT_ALLOWED', 'Origin is not allowed.', 403);
    if (origin) headers.set('Access-Control-Allow-Origin', origin);
    headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    headers.set('Access-Control-Allow-Headers', 'Content-Type');
    response = request.method === 'OPTIONS' ? new Response(null, { status: 204 }) : await dispatch(request, path);
  } catch (error) {
    const known = error instanceof AppError;
    const validation = error instanceof z.ZodError;
    response = Response.json({ error: {
      code: known ? error.code : validation ? 'VALIDATION_ERROR' : 'INTERNAL_ERROR',
      message: known ? error.message : validation ? 'Invalid request fields.' : 'Unexpected server error. Check backend configuration.',
      ...(validation ? { fields: error.issues.map(i => ({ path: i.path.join('.'), message: i.message })) } : {}),
    } }, { status: known ? error.status : validation ? 400 : 500 });
  }
  headers.forEach((value, key) => response.headers.set(key, value));
  return response;
}
