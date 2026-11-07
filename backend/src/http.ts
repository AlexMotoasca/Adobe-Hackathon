import { z } from 'zod';
import { campaignSchema, creativeSchema } from './contracts';
import { AppError } from './errors';
import { db } from './db';
import { createAnalysis, listAnalyses, getAnalysis, summary, saveImage, saveReviews, saveTranscript, enqueue, rerunAnalysis } from './repository';
import { assertWav, transcribe, polishTranscript, MAX_AUDIO_BYTES } from './transcription';
import { GroqModel } from './ai';
import { translateUi, i18nRequestSchema } from './i18n';
import { startGoogleLogin, finishGoogleLogin, currentUser, requireUser, logout, userCount, googleConfigured } from './auth';
import { saveVideoStream, videoResponse, VIDEO_TYPES } from './media';
import { saveVideoMeta } from './repository';
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
  const route = path.join('/');
  // Public: sign-in flow and the landing page's user count.
  if (route === 'auth/google' && method === 'GET') return startGoogleLogin(request);
  if (route === 'auth/google/callback' && method === 'GET') return finishGoogleLogin(request);
  if (route === 'auth/logout' && method === 'POST') return logout(request);
  if (route === 'auth/me' && method === 'GET') {
    const user = await currentUser(request);
    if (!user) throw new AppError('UNAUTHENTICATED', 'Not signed in.', 401);
    return Response.json({ user });
  }
  if (route === 'stats' && method === 'GET') return Response.json({ users: await userCount(), googleConfigured: googleConfigured() });
  // Everything below requires a signed-in user.
  const user = await requireUser(request);
  if (path.join('/') === 'i18n' && method === 'POST') {
    // UI label translations for a report language (cached on disk after the first request).
    if (!request.headers.get('content-type')?.startsWith('application/json')) throw new AppError('INVALID_REQUEST', 'Use application/json.');
    let input: unknown;
    try { input = JSON.parse((await readBounded(request, 64000)).toString('utf8')); }
    catch (e) { if (e instanceof AppError) throw e; throw new AppError('INVALID_JSON', 'Malformed JSON request.'); }
    return Response.json(await translateUi(i18nRequestSchema.parse(input), new GroqModel()));
  }
  if (path[0] !== 'analyses') throw new AppError('NOT_FOUND', 'Endpoint not found.', 404);
  if (path.length === 1) {
    if (method === 'POST') {
      if (!request.headers.get('content-type')?.startsWith('application/json')) throw new AppError('INVALID_REQUEST', 'Use application/json.');
      let input: unknown;
      try { input = JSON.parse((await readBounded(request, 24000)).toString('utf8')); }
      catch (e) { if (e instanceof AppError) throw e; throw new AppError('INVALID_JSON', 'Malformed JSON request.'); }
      return Response.json(await createAnalysis(campaignSchema.parse(input), user.id), { status: 201 });
    }
    if (method === 'GET') {
      const search = new URL(request.url).searchParams;
      const limit = z.coerce.number().int().min(1).max(100).parse(search.get('limit') ?? 20);
      const offset = z.coerce.number().int().min(0).max(100000).parse(search.get('offset') ?? 0);
      return Response.json({ items: await listAnalyses(limit, offset, user.id), limit, offset });
    }
  }
  const id = z.string().uuid().parse(path[1]);
  await getAnalysis(id, user.id); // ownership check for every analysis route
  if (path.length === 2 && method === 'GET') return Response.json(summary(await getAnalysis(id)));
  if (path.length !== 3) throw new AppError('NOT_FOUND', 'Endpoint not found.', 404);
  if (path[2] === 'rerun' && method === 'POST') {
    if (!process.env.GROQ_API_KEY) throw new AppError('PROVIDER_NOT_CONFIGURED', 'Set GROQ_API_KEY before rerunning analysis.', 503);
    return Response.json(await rerunAnalysis(id, user.id), { status: 202 });
  }
  if (path[2] === 'image' && method === 'POST') {
    const file = await upload(request, MAX_IMAGE_BYTES);
    const image = await ingestImage(file.bytes);
    await saveImage(id, image.data, image.type);
    return Response.json(summary(await getAnalysis(id)));
  }
  if (path[2] === 'video' && method === 'POST') {
    // The browser samples frames into one labelled storyboard image; raw video never reaches the server.
    const search = new URL(request.url).searchParams;
    const creative = creativeSchema.parse({ kind: 'video', durationSeconds: Number(search.get('duration')),
      frameTimes: (search.get('frames') ?? '').split(',').filter(Boolean).map(Number) });
    if (!creative.frameTimes?.length) throw new AppError('INVALID_UPLOAD', 'Supply the sampled frame timestamps.');
    const file = await upload(request, MAX_IMAGE_BYTES);
    const image = await ingestImage(file.bytes);
    await saveImage(id, image.data, image.type, creative);
    return Response.json(summary(await getAnalysis(id)));
  }
  if (path[2] === 'media' && method === 'POST') {
    // Raw video body (not multipart) streamed to disk for the report's player.
    const type = (request.headers.get('content-type') ?? '').split(';')[0].trim().toLowerCase();
    if (!VIDEO_TYPES[type]) throw new AppError('INVALID_UPLOAD', 'Send an MP4, WebM or MOV video with a matching Content-Type.');
    const row = await getAnalysis(id);
    if (row.campaign.creative?.kind !== 'video' || !['draft', 'failed'].includes(row.status)) throw new AppError('CONFLICT', 'Upload the video storyboard first; the video file is accepted only for draft or failed video analyses.', 409);
    const size = await saveVideoStream(id, request.body, Number(request.headers.get('content-length')) || 0);
    await saveVideoMeta(id, { type, size });
    return Response.json(summary(await getAnalysis(id)));
  }
  if (path[2] === 'audio' && method === 'POST') {
    // 16 kHz mono WAV extracted in the browser; transcribed once and stored with the creative.
    const file = await upload(request, MAX_AUDIO_BYTES);
    assertWav(file.bytes);
    const row = await getAnalysis(id);
    if (row.campaign.creative?.kind !== 'video' || !['draft', 'failed'].includes(row.status)) throw new AppError('CONFLICT', 'Upload the video storyboard first; audio is accepted only for draft or failed video analyses.', 409);
    const raw = await transcribe(file.bytes);
    // Grammar/spelling pass on the main text model (same-key model fallback applies when its quota runs out);
    // segments that cannot be verified keep the raw transcript.
    const proofreader = new GroqModel();
    proofreader.maxOutputTokens = 3000;
    const transcript = await polishTranscript(raw, row.campaign, proofreader);
    if (transcript.text) await saveTranscript(id, 'transcribed', transcript); else await saveTranscript(id, 'no_speech');
    return Response.json({ ...summary(await getAnalysis(id)), transcript: transcript.text ? transcript : null });
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
    if (path[2] === 'media') {
      const video = row.campaign.creative?.video;
      if (!video) throw new AppError('NOT_FOUND', 'No video stored for this analysis.', 404);
      return videoResponse(id, video.type, request.headers.get('range'));
    }
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
  const headers = new Headers({ Vary: 'Origin' });
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
  if (!response.headers.has('Cache-Control')) response.headers.set('Cache-Control', 'no-store');
  return response;
}
