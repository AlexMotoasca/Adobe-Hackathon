import { createReadStream, createWriteStream } from 'node:fs';
import { copyFile, mkdir, rename, rm, stat } from 'node:fs/promises';
import { join } from 'node:path';
import { Readable, Transform } from 'node:stream';
import { pipeline } from 'node:stream/promises';
import { AppError } from './errors';

// Original video files for playback in the report. Stored on local disk (not in PostgreSQL)
// so large files never pass through a single in-memory buffer.
export const MAX_VIDEO_BYTES = 200 * 1024 * 1024;
export const VIDEO_TYPES: Record<string, string> = { 'video/mp4': 'mp4', 'video/webm': 'webm', 'video/quicktime': 'mov' };
const mediaDir = () => process.env.MEDIA_DIR || join(process.cwd(), '.local', 'media');
const fileFor = (id: string) => join(mediaDir(), `${id}.video`);

// Container signatures: ISO-BMFF ("ftyp" box, MP4/MOV) or EBML (WebM).
export function looksLikeVideo(head: Buffer) {
  return (head.length >= 12 && head.toString('ascii', 4, 8) === 'ftyp') || (head.length >= 4 && head.readUInt32BE(0) === 0x1a45dfa3)
    || (head.length >= 8 && ['moov', 'mdat', 'wide', 'free'].includes(head.toString('ascii', 4, 8)));
}

export async function saveVideoStream(id: string, body: ReadableStream<Uint8Array> | null, declaredLength: number) {
  if (!body) throw new AppError('INVALID_UPLOAD', 'Send the video file as the request body.');
  if (declaredLength > MAX_VIDEO_BYTES) throw new AppError('PAYLOAD_TOO_LARGE', 'Videos for playback must be 200 MB or smaller.', 413);
  await mkdir(mediaDir(), { recursive: true });
  const temp = `${fileFor(id)}.${process.pid}.${Date.now()}.part`;
  let size = 0, checked = false, head = Buffer.alloc(0);
  const guard = new Transform({ transform(chunk: Buffer, _enc, done) {
    size += chunk.length;
    if (size > MAX_VIDEO_BYTES) return done(new AppError('PAYLOAD_TOO_LARGE', 'Videos for playback must be 200 MB or smaller.', 413));
    if (!checked) {
      head = Buffer.concat([head, chunk]);
      if (head.length >= 12) { checked = true; if (!looksLikeVideo(head)) return done(new AppError('INVALID_UPLOAD', 'The file is not an MP4, WebM or MOV video.')); }
    }
    done(null, chunk);
  } });
  try {
    await pipeline(Readable.fromWeb(body as never), guard, createWriteStream(temp));
    if (!checked || !size) throw new AppError('INVALID_UPLOAD', 'The video file is empty or truncated.');
    await rename(temp, fileFor(id));
    return size;
  } catch (error) {
    await rm(temp, { force: true });
    throw error;
  }
}

export async function copyVideo(fromId: string, toId: string) {
  try { await copyFile(fileFor(fromId), fileFor(toId)); return true; } catch { return false; }
}

// Serves the stored video with HTTP Range support so the player can seek.
export async function videoResponse(id: string, type: string, range: string | null): Promise<Response> {
  const path = fileFor(id);
  let size: number;
  try { size = (await stat(path)).size; } catch { throw new AppError('NOT_FOUND', 'No video stored for this analysis.', 404); }
  const headers = { 'Content-Type': type, 'Accept-Ranges': 'bytes', 'X-Content-Type-Options': 'nosniff', 'Cache-Control': 'private, max-age=3600' };
  const match = range?.match(/^bytes=(\d*)-(\d*)$/);
  if (match && (match[1] || match[2])) {
    let start = match[1] ? Number(match[1]) : Math.max(0, size - Number(match[2]));
    let end = match[1] && match[2] ? Math.min(Number(match[2]), size - 1) : size - 1;
    if (start >= size || start > end) return new Response(null, { status: 416, headers: { 'Content-Range': `bytes */${size}` } });
    end = Math.min(end, start + 8 * 1024 * 1024 - 1); // bounded chunks
    return new Response(Readable.toWeb(createReadStream(path, { start, end })) as ReadableStream, { status: 206,
      headers: { ...headers, 'Content-Range': `bytes ${start}-${end}/${size}`, 'Content-Length': String(end - start + 1) } });
  }
  return new Response(Readable.toWeb(createReadStream(path)) as ReadableStream, { headers: { ...headers, 'Content-Length': String(size) } });
}
