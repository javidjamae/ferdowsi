import Link from 'next/link';
import { query } from '@/lib/db';
import { publishApproved } from '../actions';
import { PromoSlot } from '@/components/PromoSlot';

export const dynamic = 'force-dynamic';

export default async function DraftsPage() {
  const drafts = await query<any>(
    `SELECT id, title, status, priority, updated_at,
            COALESCE(array_length(regexp_split_to_array(COALESCE(body, ''), '\\s+'), 1), 0) AS words
     FROM content_ideas
     WHERE status IN ('ready_for_review', 'approved')
     ORDER BY status DESC, priority ASC, updated_at ASC`
  );
  const approvedCount = drafts.filter((d) => d.status === 'approved').length;

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Drafts</h1>
        {approvedCount > 0 && (
          <form action={publishApproved}>
            <button className="text-sm bg-black text-white rounded px-3 py-2">
              Publish approved now ({approvedCount})
            </button>
          </form>
        )}
      </div>

      <table className="w-full text-sm bg-white border rounded-lg overflow-hidden">
        <thead className="bg-gray-50 text-left text-gray-500">
          <tr>
            <th className="px-3 py-2">Title</th>
            <th className="px-3 py-2">Status</th>
            <th className="px-3 py-2">Words</th>
            <th className="px-3 py-2">Updated</th>
          </tr>
        </thead>
        <tbody>
          {drafts.map((d) => (
            <tr key={d.id} className="border-t">
              <td className="px-3 py-2">
                <Link href={`/admin/drafts/${d.id}`} className="underline">
                  {d.title}
                </Link>
              </td>
              <td className="px-3 py-2">{d.status === 'ready_for_review' ? 'awaiting review' : d.status}</td>
              <td className="px-3 py-2">{d.words}</td>
              <td className="px-3 py-2">{new Date(d.updated_at).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {!drafts.length && (
        <div className="space-y-4">
          <div className="rounded-lg border bg-white p-6 text-sm text-gray-500">
            No drafts waiting. Run the draft job from Ideas, or wait for the cron. In the managed
            version this queue keeps itself topped up with days of publish-ready runway.
          </div>
          <PromoSlot placement="drafts-empty" />
        </div>
      )}
    </div>
  );
}
