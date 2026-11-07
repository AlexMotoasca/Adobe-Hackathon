import { GroqModel, type Model } from './ai';
import { PERSONAS, type PersonaKey } from './contracts';
import { AppError } from './errors';

export type PersonaLane = { model: Model; personas: PersonaKey[] };

export function personaLanes(defaultModel: Model): PersonaLane[] {
  if (process.env.GROQ_PERSONA_ROUTING !== 'team') return [{ model: defaultModel, personas: Object.keys(PERSONAS) as PersonaKey[] }];
  const keys = ['GROQ_API_KEY', 'GROQ_TEAM_2_API_KEY', 'GROQ_TEAM_3_API_KEY'];
  const values = keys.map(key => process.env[key]?.trim());
  if (values.some(value => !value) || new Set(values).size !== 3) {
    throw new AppError('PROVIDER_NOT_CONFIGURED', 'Team routing requires three configured, distinct Groq keys. No fallback key rotation is performed.', 503);
  }
  const assignments: PersonaKey[][] = [['skeptic'], ['impulsive', 'bargain'], ['quality', 'rational']];
  return keys.map((key, index) => {
    const model = new GroqModel(key);
    model.textModel = process.env[`GROQ_TEAM_${index + 1}_MODEL`] || defaultModel.textModel;
    model.maxOutputTokens = 2500;
    return { model, personas: assignments[index] };
  });
}
