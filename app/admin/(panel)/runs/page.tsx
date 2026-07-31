import { query } from '@/lib/db';

export const dynamic = 'force-dynamic';

export default async function RunsPage() {
  const runs = await query<any>(
    `SELECT id, job, status, detail, started_at, finished_at
     FROM pipeline_runs ORDER BY started_at DESC LIMIT 50`
  );

  return (
    <div className="space-y-6 max-w-4xl">
      <h1 className="text-2xl font-bold">Runs</h1>
      <table className="w-full text-sm bg-white border rounded-lg overflow-hidden">
        <thead className="bg-gray-50 text-left text-gray-500">
          <tr>
            <th className="px-3 py-2">#</th>
            <th className="px-3 py-2">Job</th>
            <th className="px-3 py-2">Status</th>
            <th className="px-3 py-2">Detail</th>
            <th className="px-3 py-2">Started</th>
          </tr>
        </thead>
        <tbody>
          {runs.map((r) => (
            <tr key={r.id} className="border-t align-top">
              <td className="px-3 py-2 text-gray-400">{r.id}</td>
              <td className="px-3 py-2">{r.job}</td>
              <td className="px-3 py-2">
                <span
                  className={
                    r.status === 'ok'
                      ? 'text-green-700'
                      : r.status === 'error'
                        ? 'text-red-700'
                        : 'text-gray-500'
                  }
                >
                  {r.status}
                </span>
              </td>
              <td className="px-3 py-2">
                <code className="text-xs text-gray-600 break-all">{JSON.stringify(r.detail)}</code>
              </td>
              <td className="px-3 py-2 whitespace-nowrap">
                {new Date(r.started_at).toLocaleString()}
              </td>
            </tr>
          ))}
          {!runs.length && (
            <tr>
              <td colSpan={5} className="px-3 py-6 text-gray-500">
                No runs yet. Every queue, draft, and publish job records a row here.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
