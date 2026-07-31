import { query } from '@/lib/db';

// Snapshot-before-overwrite (guide: Move 4). Call this BEFORE any write that
// replaces a body. Nothing that overwrites content skips it.

export async function snapshotContent(
  entityType: 'idea' | 'post',
  entityId: number,
  cause: 'manual-edit' | 'ai-edit' | 'rewrite' | 'restore',
  actor: string
): Promise<void> {
  const table = entityType === 'idea' ? 'content_ideas' : 'blog_posts';
  const bodyCol = entityType === 'idea' ? 'body' : 'body_markdown';
  const [row] = await query<{ body: string | null; title: string }>(
    `SELECT ${bodyCol} AS body, title FROM ${table} WHERE id = $1`,
    [entityId]
  );
  if (!row || !(row.body || '').trim()) return; // nothing to protect yet
  await query(
    `INSERT INTO content_revisions (entity_type, entity_id, body, title, cause, actor)
     VALUES ($1, $2, $3, $4, $5, $6)`,
    [entityType, entityId, row.body, row.title, cause, actor]
  );
}

/** Guard against a "revision" that destroys most of the content (a truncated
 *  AI response, a fat-fingered save). Returns the shrink ratio to refuse on. */
export function shrinkRatio(oldBody: string, newBody: string): number {
  const before = oldBody.trim().length;
  if (!before) return 0;
  return 1 - newBody.trim().length / before;
}

export const MAX_SHRINK = 0.6;
