import { query } from '@/lib/db';

export const revalidate = 3600;

export default async function HomePage() {
  // Fail soft so `next build` works without a database; served pages re-run
  // this with DATABASE_URL present.
  let posts: Array<{ slug: string; title: string; published_at: string }> = [];
  try {
    posts = await query(
      `SELECT slug, title, published_at FROM blog_posts ORDER BY published_at DESC LIMIT 20`
    );
  } catch {
    posts = [];
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-3xl font-bold mb-8">Blog</h1>
      <ul className="space-y-4">
        {posts.map((p) => (
          <li key={p.slug}>
            <a href={`/${p.slug}`} className="text-lg hover:underline">
              {p.title}
            </a>
            <div className="text-sm text-gray-500">
              {new Date(p.published_at).toLocaleDateString()}
            </div>
          </li>
        ))}
      </ul>
    </main>
  );
}
