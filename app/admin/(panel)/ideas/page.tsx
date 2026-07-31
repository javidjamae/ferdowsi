import { query } from '@/lib/db';
import { addTopic, generateTopics, draftNext } from '../actions';

export const dynamic = 'force-dynamic';

export default async function IdeasPage() {
  const ideas = await query<any>(
    `SELECT id, title, status, priority, source, notes, created_at
     FROM content_ideas
     WHERE status IN ('idea', 'drafting')
     ORDER BY priority ASC, created_at ASC`
  );

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Ideas</h1>
        <div className="flex gap-2">
          <form action={generateTopics}>
            <button className="text-sm border rounded px-3 py-2 bg-white hover:bg-gray-50">
              Generate topics
            </button>
          </form>
          <form action={draftNext}>
            <button className="text-sm bg-black text-white rounded px-3 py-2">
              Draft next idea
            </button>
          </form>
        </div>
      </div>

      <form action={addTopic} className="rounded-lg border bg-white p-4 flex gap-2 items-end">
        <div className="flex-1">
          <label className="text-xs text-gray-500">Add a topic</label>
          <input name="title" placeholder="Post title" className="w-full border rounded px-3 py-2" />
        </div>
        <div className="w-64">
          <label className="text-xs text-gray-500">Notes (optional)</label>
          <input name="description" className="w-full border rounded px-3 py-2" />
        </div>
        <select name="priority" defaultValue="2" className="border rounded px-2 py-2">
          <option value="1">P1</option>
          <option value="2">P2</option>
          <option value="3">P3</option>
        </select>
        <button className="bg-black text-white rounded px-3 py-2">Add</button>
      </form>

      <table className="w-full text-sm bg-white border rounded-lg overflow-hidden">
        <thead className="bg-gray-50 text-left text-gray-500">
          <tr>
            <th className="px-3 py-2">Title</th>
            <th className="px-3 py-2">Status</th>
            <th className="px-3 py-2">Priority</th>
            <th className="px-3 py-2">Source</th>
            <th className="px-3 py-2">Added</th>
          </tr>
        </thead>
        <tbody>
          {ideas.map((i) => (
            <tr key={i.id} className="border-t align-top">
              <td className="px-3 py-2">
                {i.title}
                {i.notes && <div className="text-xs text-gray-400">{i.notes}</div>}
              </td>
              <td className="px-3 py-2">{i.status}</td>
              <td className="px-3 py-2">P{i.priority}</td>
              <td className="px-3 py-2">{i.source}</td>
              <td className="px-3 py-2">{new Date(i.created_at).toLocaleDateString()}</td>
            </tr>
          ))}
          {!ideas.length && (
            <tr>
              <td colSpan={5} className="px-3 py-6 text-gray-500">
                Queue is empty. Add a topic above, list seeds in strategy/SEED-TOPICS.md, or hit
                Generate topics.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
