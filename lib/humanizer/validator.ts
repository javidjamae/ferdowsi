import Anthropic from '@anthropic-ai/sdk';

const VALIDATOR_PROMPT = `Read this draft. For each of the following criteria, return PASS or FAIL.

1. Zero em dashes in the final text
2. Opening paragraph doesn't use AI clichés like "in the world of" or "let's dive in"
3. Sentences vary in length — not all medium-length balanced sentences
4. No corporate hedging like "it's worth noting" or "essentially"
5. Sounds like a person who knows the topic, not a Wikipedia entry

If any criterion fails, rewrite only the failing sections. Return the full revised draft. If everything passes, return the draft unchanged with a leading line "PASS — no changes needed" followed by the draft.

Draft:
---
`;

const MAX_ITERATIONS = 3;

export async function validateAndRewrite(draft: string): Promise<string> {
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  let current = draft;

  for (let i = 0; i < MAX_ITERATIONS; i++) {
    const response = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 6000,
      temperature: 0.2,
      messages: [{ role: 'user', content: VALIDATOR_PROMPT + current }],
    });

    const text = response.content
      .filter((b) => b.type === 'text')
      .map((b) => (b as { type: 'text'; text: string }).text)
      .join('');

    if (text.startsWith('PASS')) {
      return current;
    }

    if (text.trim() === current.trim()) {
      return current;
    }

    current = text;
  }

  return current;
}
