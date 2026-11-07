import { GroqModel } from '../src/ai';
import { z } from 'zod';
import sharp from 'sharp';

const response = await fetch('https://api.groq.com/openai/v1/models', {
  headers: { Authorization: `Bearer ${process.env.GROQ_API_KEY}` }, signal: AbortSignal.timeout(20000),
});
if (!response.ok) throw new Error(`Groq model access failed: HTTP ${response.status}`);
const available = (await response.json()).data.map((m: { id: string }) => m.id);
const model = new GroqModel();
console.log('Configured text model available:', available.includes(model.textModel));
console.log('Configured vision model available:', available.includes(model.visionModel));
const schema = z.object({ description: z.string() });
await model.generate(schema, 'Describe the word hello in a short JSON description.', {});
console.log('Text JSON request passed.');
const image = await sharp({ create: { width: 64, height: 64, channels: 3, background: '#ff0000' } }).jpeg().toBuffer();
const result = await model.generate(schema, 'Describe the color of this test image in JSON.', {}, image);
console.log('Vision JSON request passed:', result.description);
