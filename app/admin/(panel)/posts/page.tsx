import { query } from '@/lib/db';
import { unpublishPost } from '../actions';

export const dynamic = 'force-dynamic';

export default async function PostsPage() {
  const posts = await query<any>(
    `SELECT id, slug, title, published_at, updated_at FROM blog_posts ORDER BY published_at DESC`
  );

  return (
    <div className="space-y-6 max-w-4xl">
      <h1 className="text-2xl font-bold">Posts</h1>
      <table className="w-full text-sm bg-white border rounded-lg overflow-hidden">
        <thead className="bg-gray-50 text-left text-gray-500">
          <tr>
            <th className="px-3 py-2">Title</th>
            <th className="px-3 py-2">Published</th>
            <th className="px-3 py-2">Links</th>
            <th className="px-3 py-2"></th>
          </tr>
        </thead>
        <tbody>
          {posts.map((p) => (
            <tr key={p.id} className="border-t">
              <td className="px-3 py-2">{p.title}</td>
              <td className="px-3 py-2">{new Date(p.published_at).toLocaleDateString()}</td>
              <td className="px-3 py-2 space-x-2">
                <a href={`/${p.slug}`} className="underline">
                  view
                </a>
                <a href={`/${p.slug}/index.md`} className="underline">
                  .md
                </a>
              </td>
              <td className="px-3 py-2 text-right">
                <form action={unpublishPost}>
                  <input type="hidden" name="id" value={p.id} />
                  <button className="text-xs border rounded px-2 py-1 bg-white hover:bg-gray-50">
                    Unpublish
                  </button>
                </form>
              </td>
            </tr>
          ))}
          {!posts.length && (
            <tr>
              <td colSpan={4} className="px-3 py-6 text-gray-500">
                Nothing live yet. Approve a draft, then publish from the Drafts tab (or let the
                publish cron pick it up).
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
