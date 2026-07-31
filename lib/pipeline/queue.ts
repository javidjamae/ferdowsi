import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { query } from '@/lib/db';
import { runLLM, extractJSON } from '@/lib/llm';
import { totalScore, priorityFromScore, SCORE_FLOOR, type ScoreBreakdown } from '@/lib/topic-scoring';
import { withRun } from './runs';

// Queue filler (guide: Move 1). Two sources, no external integrations:
//   1. strategy/SEED-TOPICS.md — your own cold-start list, one "- title" per line
//   2. LLM research — the model reads STRATEGY.md + READER.md + the research
//      skill + everything already queued/published, and proposes scored topics
// Move 5 (your own GSC/GA data as a topic source) is yours to add once the
// analytics tables have data; the guide gives the mechanics.

interface ResearchedTopic {
  title: string;
  description: string;
  breakdown: ScoreBreakdown;
}

function normalizeTitle(t: string): string {
  return t.toLowerCase().replace(/[^\w\s]/g, '').replace(/\s+/g, ' ').trim();
}

async function readStrategyFile(name: string): Promise<string> {
  return readFile(path.join(process.cwd(), 'strategy', name), 'utf8').catch(() => '');
}

export async function runQueue(opts: { force?: boolean } = {}) {
  return withRun('queue', async () => {
    const detail: Record<string, unknown> = {};

    // 1. Seed topics not yet present (cold start needs no LLM at all).
    const seedsFile = await readStrategyFile('SEED-TOPICS.md');
    const seeds = seedsFile
      .split('\n')
      .map((l) => l.match(/^\s*-\s+(.+)$/)?.[1]?.trim())
      .filter((t): t is string => !!t);
    let seeded = 0;
    for (const title of seeds) {
      const [exists] = await query(`SELECT id FROM content_ideas WHERE lower(title) = lower($1)`, [title]);
      if (exists) continue;
      await query(
        `INSERT INTO content_ideas (title, status, priority, source) VALUES ($1, 'idea', 2, 'seed')`,
        [title]
      );
      seeded++;
    }
    detail.seeded = seeded;

    // 2. Queue-depth gate: don't over-fill (force = the dashboard button).
    const [{ count }] = await query<{ count: string }>(
      `SELECT COUNT(*) AS count FROM content_ideas WHERE status = 'idea'`
    );
    const depth = parseInt(count, 10);
    detail.queueDepth = depth;
    if (!opts.force && depth >= 3) {
      detail.skipped = 'queue healthy';
      return detail;
    }

    // 3. LLM research, deduped against everything queued or published.
    // No key = seeds-only mode, not an error: the scaffold should do
    // something useful before the operator has wired their Anthropic key.
    if (!process.env.ANTHROPIC_API_KEY) {
      detail.research = 'skipped (no ANTHROPIC_API_KEY; seeds only)';
      return detail;
    }
    const strategy = await readStrategyFile('STRATEGY.md');
    const reader = await readStrategyFile('READER.md');
    const skill = await readFile(
      path.join(process.cwd(), 'skills/blog-topic-research/SKILL.md'),
      'utf8'
    );
    const existing = await query<{ title: string }>(
      `SELECT title FROM content_ideas WHERE status IN ('idea','drafting','ready_for_review','approved','published')
       UNION SELECT title FROM blog_posts`
    );
    const existingTitles = existing.map((r) => r.title);

    const prompt = [
      skill,
      '---',
      '# STRATEGY.md',
      strategy || '(missing — score conversion intent conservatively)',
      '# READER.md',
      reader || '(missing)',
      '---',
      'Topics already queued or published (NEVER propose these or near-duplicates):',
      existingTitles.length ? existingTitles.map((t) => `- ${t}`).join('\n') : '(none yet)',
      '---',
      'Propose up to 5 new topics. Respond with ONLY a JSON array:',
      '[{"title": "...", "description": "target query, audience, angle, evidence", "breakdown": {"evidence": 0-4, "intent": 0-3, "gap": 0-3}}]',
    ].join('\n\n');

    const raw = await runLLM('research', prompt, { maxTokens: 3000, temperature: 0.7 });
    const topics = extractJSON<ResearchedTopic[]>(raw) ?? [];
    detail.researched = topics.length;

    const seen = new Set(existingTitles.map(normalizeTitle));
    let inserted = 0;
    let skippedLow = 0;
    for (const t of topics) {
      if (!t?.title || !t.breakdown) continue;
      const key = normalizeTitle(t.title);
      if (seen.has(key)) continue;
      seen.add(key);
      const score = totalScore(t.breakdown);
      if (score < SCORE_FLOOR) {
        skippedLow++;
        continue;
      }
      await query(
        `INSERT INTO content_ideas (title, description, status, priority, source)
         VALUES ($1, $2, 'idea', $3, 'llm-research')`,
        [t.title, JSON.stringify({ ...t.breakdown, total: score, notes: t.description }), priorityFromScore(score)]
      );
      inserted++;
    }
    detail.inserted = inserted;
    if (skippedLow) detail.skippedBelowFloor = skippedLow;
    return detail;
  });
}
