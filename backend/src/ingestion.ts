import { randomUUID } from 'node:crypto';
import { parse } from 'csv-parse/sync';
import sharp from 'sharp';
import { reviewSchema, type Review } from './contracts';
import { AppError } from './errors';

export const MAX_IMAGE_BYTES = 4 * 1024 * 1024;
export const MAX_REVIEW_BYTES = 1024 * 1024;
export const MAX_REVIEWS = 100;

export async function ingestImage(bytes: Buffer) {
  if (!bytes.length || bytes.length > MAX_IMAGE_BYTES) throw new AppError('INVALID_IMAGE', 'Image must be between 1 byte and 4 MiB.');
  try {
    const image = sharp(bytes, { limitInputPixels: 20_000_000, failOn: 'warning' });
    const metadata = await image.metadata();
    if (!['jpeg', 'png', 'webp'].includes(metadata.format ?? '') || (metadata.pages ?? 1) !== 1) throw new Error('format');
    const data = await image.rotate().resize({ width: 1600, height: 1600, fit: 'inside', withoutEnlargement: true }).jpeg({ quality: 90 }).toBuffer();
    return { data, type: 'image/jpeg' };
  } catch {
    throw new AppError('INVALID_IMAGE', 'Upload a valid, non-animated PNG, JPEG or WebP with at most 20 megapixels.');
  }
}

export function ingestReviews(bytes: Buffer, filename: string) {
  if (!bytes.length || bytes.length > MAX_REVIEW_BYTES) throw new AppError('INVALID_REVIEWS', 'Reviews must be between 1 byte and 1 MiB.');
  let rows: unknown;
  try {
    const content = new TextDecoder('utf-8', { fatal: true }).decode(bytes);
    if (filename.toLowerCase().endsWith('.json')) rows = JSON.parse(content.replace(/^\uFEFF/, ''));
    else if (filename.toLowerCase().endsWith('.csv')) rows = parse(content, {
      columns: (headers: string[]) => {
        const names = headers.map(h => h.trim());
        if (new Set(names).size !== names.length || !names.includes('text')) throw new Error('headers');
        return names;
      }, bom: true, skip_empty_lines: true, max_record_size: 16000,
    });
    else throw new Error('extension');
  } catch { throw new AppError('INVALID_REVIEWS', 'Expected valid UTF-8 CSV (with text header) or a JSON array.'); }
  if (!Array.isArray(rows) || rows.length === 0 || rows.length > MAX_REVIEWS) throw new AppError('INVALID_REVIEWS', 'Supply 1–100 review rows.');
  const reviews: Review[] = [];
  const seen = new Set<string>();
  for (const [index, row] of rows.entries()) {
    if (!row || typeof row !== 'object' || Array.isArray(row)) throw new AppError('INVALID_REVIEWS', `Invalid row ${index + 1}.`);
    const clean = Object.fromEntries(Object.entries(row).filter(([, v]) => v !== '' && v != null));
    if (typeof clean.rating === 'string') clean.rating = Number(clean.rating);
    if (clean.verifiedPurchase === 'true') clean.verifiedPurchase = true;
    if (clean.verifiedPurchase === 'false') clean.verifiedPurchase = false;
    const parsed = reviewSchema.safeParse({ ...clean, id: randomUUID(), source: clean.source ?? 'user_upload', relevance: clean.relevance ?? 'unknown' });
    if (!parsed.success) throw new AppError('INVALID_REVIEWS', `Invalid review row ${index + 1}: ${parsed.error.issues.map(i => i.path.join('.')).join(', ')}.`);
    const key = parsed.data.text.toLowerCase().replace(/\s+/g, ' ').trim();
    if (seen.has(key)) continue;
    seen.add(key);
    reviews.push(parsed.data);
  }
  return { reviews, stats: { received: rows.length, accepted: reviews.length, duplicates: rows.length - reviews.length } };
}
