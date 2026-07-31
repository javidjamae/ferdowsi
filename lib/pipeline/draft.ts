import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { query } from '@/lib/db';
import { runLLM } from '@/lib/llm';
import { humanize } from '@/lib/humanizer';
import { generateImage } from '@/lib/image-gen';
import { snapshotContent } from '@/lib/revisions';
import { withRun } from './runs';

// Draft writer (guide: Moves 2 + 4). Claims the top idea atomically, writes
// it with the writer skill + strategy context, humanizes, optionally images,
// and PARKS it for review. It never publishes; the publisher cron handles
// approved drafts, so the writing cadence and the publishing cadence stay
// independent.

function slugify(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 80);
}

async function loadContextFiles(): Promise<string> {
  const root = process.cwd();
  const strategy = await readFile(path.join(root, 'strategy/STRATEGY.md'), 'utf8').catch(() => '');
  const reader = await readFile(path.join(root, 'strategy/READER.md'), 'utf8').catch(() => '');
  const skill = await readFile(path.join(root, 'skills/write-blog-post/SKILL.md'), 'utf8');
  return [reader, strategy, skill].filter(Boolean).join('\n\n---\n\n');
}

export async function runDraft() {
  return withRun('draft', async () => {
    const detail: Record<string, unknown> = {};

    // Atomic claim: idea -> drafting in one statement, so a manual run racing
    // the cron can't write the same topic twice.
    const claimed = await query<{ id: number; title: string; description: string | null }>(
      `SELECT * FROM claim_next_idea()`
    );
    if (!claimed.length) {
      detail.skipped = 'no ideas in queue';
      return detail;
    }
    const row = claimed[0];
    detail.ideaId = row.id;
    detail.title = row.title;

    try {
      const context = await loadContextFiles();
      const draft = await runLLM(
        'write',
        `${context}\n\n---\n\nTopic: ${row.title}\nContext: ${row.description ?? ''}\n\nWrite the post.`,
        { maxTokens: 4096, temperature: 0.7 }
      );

      const humanized = await humanize(draft, 'standard');
      const slug = slugify(row.title);

      let imageUrl: string | null = null;
      try {
        imageUrl = await generateImage({ prompt: row.title, slug });
      } catch (err) {
        // Non-fatal: the draft still parks for review without a cover.
        detail.imageError = err instanceof Error ? err.message : String(err);
      }

      // Re-draft of an idea that already had a body? Snapshot first —
      // nothing that overwrites content skips the revision table.
      await snapshotContent('idea', row.id, 'rewrite', 'draft-cron');

      await query(
        `UPDATE content_ideas
         SET body = $2, slug = $3, image_url = $4, status = 'ready_for_review', updated_at = now()
         WHERE id = $1`,
        [row.id, humanized, slug, imageUrl]
      );
      detail.slug = slug;
      detail.words = humanized.split(/\s+/).filter(Boolean).length;
      detail.outcome = 'parked for review';
      return detail;
    } catch (err) {
      // Release the claim so a failed run doesn't strand the idea.
      const msg = err instanceof Error ? err.message : String(err);
      await query(
        `UPDATE content_ideas SET status = 'idea', notes = $2, updated_at = now() WHERE id = $1`,
        [row.id, msg]
      );
      throw err;
    }
  });
}
