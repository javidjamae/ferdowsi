import { notFound } from 'next/navigation';
import { query } from '@/lib/db';
import { markdownToHtml } from '@/lib/markdown';
import { approveDraft, rejectDraft, saveDraftBody } from '../../actions';

export const dynamic = 'force-dynamic';

// Side-by-side review (guide: Move 4): rendered preview on the left, raw
// markdown editor on the right. Twenty seconds: scan, fix if needed, approve.
export default async function DraftReviewPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string; saved?: string }>;
}) {
  const { id } = await params;
  const { error, saved } = await searchParams;
  const [draft] = await query<any>(`SELECT * FROM content_ideas WHERE id = $1`, [id]);
  if (!draft) notFound();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">{draft.title}</h1>
          <div className="text-sm text-gray-500">
            /{draft.slug} · {draft.status} · P{draft.priority}
          </div>
        </div>
        {draft.status === 'ready_for_review' && (
          <div className="flex gap-2">
            <form action={rejectDraft}>
              <input type="hidden" name="id" value={draft.id} />
              <button className="text-sm border rounded px-3 py-2 bg-white hover:bg-gray-50">
                Reject to queue
              </button>
            </form>
            <form action={approveDraft}>
              <input type="hidden" name="id" value={draft.id} />
              <button className="text-sm bg-black text-white rounded px-3 py-2">Approve</button>
            </form>
          </div>
        )}
      </div>

      {error === 'shrink' && (
        <div className="rounded border border-red-300 bg-red-50 text-red-700 text-sm px-3 py-2">
          Save refused: the new body is over 60% shorter than the current one. That usually means a
          truncated paste. Your previous content is untouched.
        </div>
      )}
      {saved && (
        <div className="rounded border border-green-300 bg-green-50 text-green-700 text-sm px-3 py-2">
          Saved. The previous version is snapshotted in content_revisions.
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <article
          className="prose prose-sm max-w-none bg-white border rounded-lg p-4 overflow-auto max-h-[70vh]"
          dangerouslySetInnerHTML={{ __html: markdownToHtml(draft.body || '(no body yet)') }}
        />
        <form action={saveDraftBody} className="flex flex-col gap-2">
          <input type="hidden" name="id" value={draft.id} />
          <textarea
            name="body"
            defaultValue={draft.body || ''}
            className="flex-1 min-h-[60vh] border rounded-lg p-3 font-mono text-xs"
          />
          <button className="self-start text-sm border rounded px-3 py-2 bg-white hover:bg-gray-50">
            Save edits (snapshots first)
          </button>
        </form>
      </div>
    </div>
  );
}
