import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { z } from 'zod';
import { type Model } from './ai';

// Translates the frontend's fixed UI labels into a report language. Results are cached on disk per
// (language, string set), so each language costs one model call ever, until the labels change.
export const i18nRequestSchema = z.object({
  language: z.string().trim().min(2).max(40).regex(/^[\p{L}\p{M} ()\-]+$/u),
  strings: z.array(z.string().min(1).max(400)).min(1).max(300),
});
const cacheDir = () => join(process.env.MEDIA_DIR ? join(process.env.MEDIA_DIR, '..') : join(process.cwd(), '.local'), 'i18n');
const PROMPT_VERSION = 'p2:'; // bump when the translation prompt changes, so caches refresh
const placeholders = (s: string) => (s.match(/\{\w+\}/g) ?? []).sort().join(',');

export async function translateUi(input: z.infer<typeof i18nRequestSchema>, model: Model) {
  const { language, strings } = input;
  if (/^english$/i.test(language)) return { language, strings: Object.fromEntries(strings.map(s => [s, s])), cached: true };
  const key = createHash('sha256').update(PROMPT_VERSION + language.toLowerCase() + '\n' + JSON.stringify(strings)).digest('hex').slice(0, 32);
  const file = join(cacheDir(), `${key}.json`);
  try { return { ...JSON.parse(await readFile(file, 'utf8')), cached: true }; } catch { /* not cached yet */ }
  const out: Record<string, string> = {};
  let complete = true;
  // Small models sometimes return the wrong number of items: retry once, then split the batch.
  const translate = async (batch: string[], depth = 0): Promise<void> => {
    for (let attempt = 0; attempt < 2; attempt++) {
      try { await translateBatch(batch); return; } catch { /* retry, then split */ }
    }
    if (batch.length > 1 && depth < 3) {
      const half = Math.ceil(batch.length / 2);
      await translate(batch.slice(0, half), depth + 1);
      await translate(batch.slice(half), depth + 1);
      return;
    }
    complete = false;
    batch.forEach(s => { out[s] = s; });
  };
  const translateBatch = async (batch: string[]) => {
    {
      const result = await model.generate(z.object({ translations: z.array(z.string().max(600)) }),
        `Translate these user-interface labels of an advertising-feedback app from English into ${language}. Use natural, concise UI wording a marketer would expect. Keep placeholders like {n}, {category} or {date} exactly unchanged, keep emoji, symbols and punctuation such as "—", "·", "…", "↗" and trailing colons, and keep brand names. Text in [square brackets] is a fill-in placeholder: ALWAYS translate the words inside the brackets and keep the brackets (e.g. into Spanish "[Exact product model]" -> "[Modelo exacto del producto]"). Return exactly ${batch.length} translations in the same order.`,
        { strings: batch });
      if (result.translations.length !== batch.length) throw new Error('count');
      batch.forEach((s, i) => { const t = result.translations[i].trim(); out[s] = t && placeholders(t) === placeholders(s) ? t : s; });
    }
  };
  for (let offset = 0; offset < strings.length; offset += 40) await translate(strings.slice(offset, offset + 40));
  const response = { language, strings: out };
  if (complete) { await mkdir(cacheDir(), { recursive: true }); await writeFile(file, JSON.stringify(response)); }
  return { ...response, cached: false, complete };
}
