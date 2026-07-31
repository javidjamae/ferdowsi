import type { MetadataRoute } from 'next';
import { query } from '@/lib/db';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Fail soft: `next build` without a database (CI, first boot) still
  // succeeds; the real sitemap serves once the app runs with DATABASE_URL.
  let posts: Array<{ slug: string; published_at: string; updated_at: string | null }> = [];
  try {
    posts = await query(
      `SELECT slug, published_at, updated_at FROM blog_posts ORDER BY published_at DESC`
    );
  } catch {
    posts = [];
  }

  const base = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://example.com';

  return [
    { url: base, lastModified: new Date() },
    ...posts.map((p) => ({
      url: `${base}/${p.slug}`,
      lastModified: new Date(p.updated_at ?? p.published_at),
    })),
  ];
}
