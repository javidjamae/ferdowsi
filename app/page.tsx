import { supabaseAdmin } from '@/lib/supabase';

export const revalidate = 3600;

export default async function HomePage() {
  const { data: posts } = await supabaseAdmin
    .from('blog_posts')
    .select('slug, title, published_at')
    .order('published_at', { ascending: false })
    .limit(20);

  return (
    <main className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-3xl font-bold mb-8">Blog</h1>
      <ul className="space-y-4">
        {(posts ?? []).map((p) => (
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
