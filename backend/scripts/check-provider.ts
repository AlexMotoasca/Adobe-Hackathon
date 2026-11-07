import { GroqModel } from '../src/ai';
import { personaLanes } from '../src/persona-routing';
import { z } from 'zod';
import sharp from 'sharp';

// Lists models per key (no tokens used). Key values are never printed.
async function availableModels(keyName: string): Promise<string[]> {
  const response = await fetch('https://api.groq.com/openai/v1/models', {
    headers: { Authorization: `Bearer ${process.env[keyName]}` }, signal: AbortSignal.timeout(20000),
  });
  if (!response.ok) throw new Error(`Groq model access failed for ${keyName}: HTTP ${response.status}`);
  return (await response.json()).data.map((m: { id: string }) => m.id);
}
const model = new GroqModel();
const available = await availableModels('GROQ_API_KEY');
console.log('Configured text model available:', available.includes(model.textModel));
console.log('Configured vision model available:', available.includes(model.visionModel));
if (process.env.GROQ_PERSONA_ROUTING === 'team') {
  personaLanes(model); // throws if a key is missing or duplicated
  const research = process.env.GROQ_RESEARCH_MODEL || model.textModel;
  for (const [index, keyName] of ['GROQ_API_KEY', 'GROQ_TEAM_2_API_KEY', 'GROQ_TEAM_3_API_KEY'].entries()) {
    const models = await availableModels(keyName);
    const text = process.env[`GROQ_TEAM_${index + 1}_MODEL`] || model.textModel;
    console.log(`Team key ${index + 1} (${keyName}): persona model ${models.includes(text) ? 'ok' : 'MISSING'}, research model ${models.includes(research) ? 'ok' : 'MISSING'}`);
  }
} else console.log('Persona routing: single key (set GROQ_PERSONA_ROUTING=team to use three keys).');
if (process.argv.includes('--models-only')) process.exit(0);
const schema = z.object({ description: z.string() });
await model.generate(schema, 'Describe the word hello in a short JSON description.', {});
console.log('Text JSON request passed.');
const image = await sharp({ create: { width: 64, height: 64, channels: 3, background: '#ff0000' } }).jpeg().toBuffer();
const result = await model.generate(schema, 'Describe the color of this test image in JSON.', {}, image);
console.log('Vision JSON request passed:', result.description);
