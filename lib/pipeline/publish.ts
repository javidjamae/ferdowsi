import { revalidatePath } from 'next/cache';
import { query } from '@/lib/db';
import { withRun } from './runs';

// Publisher (guide: Move 4, "the publish path"). Picks approved drafts and
// promotes them to blog_posts. Sequential, so one failure doesn't block the
// rest. Only this job (or the dashboard's explicit publish action) makes
// content public.

function deriveDescription(body: string, max = 155): string {
  const text = body
    .replace(/^#.*$/gm, '')
    .replace(/```[\s\S]*?```/g, '')
    .replace(/[*_`>\[\]()#!]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  return text.length <= max ? text : `${text.slice(0, max - 1).trimEnd()}…`;
}

export async function runPublish() {
  return withRun('publish', async () => {
    const detail: Record<string, unknown> = {};
    const approved = await query<any>(
      `SELECT * FROM content_ideas WHERE status = 'approved' ORDER BY priority ASC, updated_at ASC LIMIT 10`
    );
    const published: number[] = [];
    const failed: Array<{ id: number; error: string }> = [];

    for (const row of approved) {
      try {
        if (!row.slug || !(row.body || '').trim()) {
          throw new Error('approved idea is missing a slug or body');
        }
        await query(
          `INSERT INTO blog_posts (content_idea_id, slug, title, body_markdown, hero_image_url, meta_description, tags, related_slugs)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
           ON CONFLICT (slug) DO UPDATE SET
             title = EXCLUDED.title, body_markdown = EXCLUDED.body_markdown,
             hero_image_url = EXCLUDED.hero_image_url, meta_description = EXCLUDED.meta_description,
             tags = EXCLUDED.tags, updated_at = now()`,
          [
            row.id,
            row.slug,
            row.title,
            row.body,
            row.image_url,
            deriveDescription(row.body),
            row.tags ?? [],
            row.related_posts ?? [],
          ]
        );
        await query(
          `UPDATE content_ideas SET status = 'published', published_url = $2, updated_at = now() WHERE id = $1`,
          [row.id, `/${row.slug}`]
        );
        revalidatePath(`/${row.slug}`);
        revalidatePath('/');
        published.push(row.id);
      } catch (err) {
        failed.push({ id: row.id, error: err instanceof Error ? err.message : String(err) });
      }
    }

    detail.published = published;
    if (failed.length) detail.failed = failed;
    return detail;
  });
}
