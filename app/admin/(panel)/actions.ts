'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { query } from '@/lib/db';
import { runQueue } from '@/lib/pipeline/queue';
import { runDraft } from '@/lib/pipeline/draft';
import { runPublish } from '@/lib/pipeline/publish';
import { snapshotContent, shrinkRatio, MAX_SHRINK } from '@/lib/revisions';

// Dashboard actions call the SAME pipeline functions as the crons — one code
// path, two triggers. Auth is enforced by middleware.ts before any of these run.

export async function addTopic(formData: FormData) {
  const title = String(formData.get('title') || '').trim();
  if (!title) return;
  await query(
    `INSERT INTO content_ideas (title, description, status, priority, source)
     VALUES ($1, $2, 'idea', $3, 'manual')`,
    [
      title,
      String(formData.get('description') || '').trim() || null,
      Number(formData.get('priority') || 2),
    ]
  );
  revalidatePath('/admin/ideas');
}

export async function generateTopics() {
  await runQueue({ force: true });
  revalidatePath('/admin/ideas');
  revalidatePath('/admin/runs');
}

export async function draftNext() {
  await runDraft();
  revalidatePath('/admin/ideas');
  revalidatePath('/admin/drafts');
  revalidatePath('/admin/runs');
}

export async function approveDraft(formData: FormData) {
  const id = Number(formData.get('id'));
  await query(
    `UPDATE content_ideas SET status = 'approved', reviewed_at = now(), updated_at = now()
     WHERE id = $1 AND status = 'ready_for_review'`,
    [id]
  );
  revalidatePath('/admin/drafts');
  redirect('/admin/drafts');
}

export async function rejectDraft(formData: FormData) {
  const id = Number(formData.get('id'));
  const reason = String(formData.get('reason') || 'rejected in review');
  await query(
    `UPDATE content_ideas SET status = 'idea', notes = $2, updated_at = now()
     WHERE id = $1 AND status = 'ready_for_review'`,
    [id, reason]
  );
  revalidatePath('/admin/drafts');
  redirect('/admin/drafts');
}

export async function saveDraftBody(formData: FormData) {
  const id = Number(formData.get('id'));
  const body = String(formData.get('body') || '');
  const [current] = await query<{ body: string | null }>(
    `SELECT body FROM content_ideas WHERE id = $1`,
    [id]
  );
  // Truncation guard (guide: Move 4): refuse a save that destroys most of
  // the content instead of silently overwriting the only copy.
  if (current?.body && shrinkRatio(current.body, body) > MAX_SHRINK) {
    redirect(`/admin/drafts/${id}?error=shrink`);
  }
  await snapshotContent('idea', id, 'manual-edit', 'dashboard');
  await query(`UPDATE content_ideas SET body = $2, updated_at = now() WHERE id = $1`, [id, body]);
  revalidatePath(`/admin/drafts/${id}`);
  redirect(`/admin/drafts/${id}?saved=1`);
}

export async function publishApproved() {
  await runPublish();
  revalidatePath('/admin/posts');
  revalidatePath('/admin/runs');
  revalidatePath('/');
}

export async function unpublishPost(formData: FormData) {
  const id = Number(formData.get('id'));
  const [post] = await query<{ slug: string; content_idea_id: number | null }>(
    `SELECT slug, content_idea_id FROM blog_posts WHERE id = $1`,
    [id]
  );
  if (!post) return;
  await query(`DELETE FROM blog_posts WHERE id = $1`, [id]);
  if (post.content_idea_id) {
    // Back to review, NOT approved — otherwise the next publish cron would
    // immediately re-publish what you just took down.
    await query(
      `UPDATE content_ideas SET status = 'ready_for_review', published_url = NULL, updated_at = now() WHERE id = $1`,
      [post.content_idea_id]
    );
  }
  revalidatePath('/');
  revalidatePath(`/${post.slug}`);
  revalidatePath('/admin/posts');
}
