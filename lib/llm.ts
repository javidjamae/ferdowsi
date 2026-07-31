import Anthropic from '@anthropic-ai/sdk';

// One LLM seam. BYO Anthropic key; models are env-tunable so you can trade
// cost for quality per stage without touching code.
//
//   MODEL_RESEARCH  topic research        (default claude-sonnet-5)
//   MODEL_WRITE     drafting              (default claude-opus-4-8)
//   MODEL_VALIDATE  humanizer validator   (default claude-sonnet-5)

const DEFAULTS = {
  research: 'claude-sonnet-5',
  write: 'claude-opus-4-8',
  validate: 'claude-sonnet-5',
} as const;

export type Stage = keyof typeof DEFAULTS;

export function modelFor(stage: Stage): string {
  const env = { research: 'MODEL_RESEARCH', write: 'MODEL_WRITE', validate: 'MODEL_VALIDATE' }[stage];
  return process.env[env] || DEFAULTS[stage];
}

let client: Anthropic | null = null;

export function anthropic(): Anthropic {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error('ANTHROPIC_API_KEY is not set. See .env.example.');
  }
  if (!client) client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  return client;
}

export async function runLLM(
  stage: Stage,
  prompt: string,
  opts: { maxTokens?: number; temperature?: number } = {}
): Promise<string> {
  const response = await anthropic().messages.create({
    model: modelFor(stage),
    max_tokens: opts.maxTokens ?? 4096,
    temperature: opts.temperature ?? 0.7,
    messages: [{ role: 'user', content: prompt }],
  });
  return response.content
    .filter((b) => b.type === 'text')
    .map((b) => (b as { type: 'text'; text: string }).text)
    .join('');
}

/** Pull the first JSON array/object out of an LLM response that may wrap it
 *  in prose or a code fence. Returns null when nothing parses. */
export function extractJSON<T>(text: string): T | null {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  const candidates = [fenced?.[1], text];
  for (const c of candidates) {
    if (!c) continue;
    const start = Math.min(
      ...['[', '{'].map((ch) => (c.indexOf(ch) === -1 ? Infinity : c.indexOf(ch)))
    );
    if (!isFinite(start)) continue;
    const end = Math.max(c.lastIndexOf(']'), c.lastIndexOf('}'));
    if (end <= start) continue;
    try {
      return JSON.parse(c.slice(start, end + 1)) as T;
    } catch {
      continue;
    }
  }
  return null;
}
