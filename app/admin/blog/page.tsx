import { supabaseAdmin } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export default async function AdminBlogPage() {
  const { data: drafts } = await supabaseAdmin
    .from('content_ideas')
    .select('*')
    .eq('status', 'ready_for_review')
    .order('priority', { ascending: true });

  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Review queue</h1>
      {(drafts ?? []).length === 0 && (
        <p className="text-gray-500">No drafts waiting.</p>
      )}
      <ul className="space-y-6">
        {(drafts ?? []).map((d) => (
          <li key={d.id} className="border rounded p-4">
            <h2 className="text-lg font-semibold">{d.title}</h2>
            <div className="text-sm text-gray-500 mb-2">
              source: {d.source} · priority: {d.priority}
            </div>
            <pre className="whitespace-pre-wrap text-sm bg-gray-50 p-3 rounded max-h-96 overflow-auto">
              {d.body}
            </pre>
            <form
              action={`/api/admin/publish`}
              method="POST"
              className="mt-3"
            >
              <input type="hidden" name="id" value={d.id} />
              <button
                type="submit"
                className="bg-black text-white px-4 py-2 rounded"
              >
                Approve
              </button>
            </form>
          </li>
        ))}
      </ul>
    </main>
  );
}
