import type { MetadataRoute } from 'next';
import { supabaseAdmin } from '@/lib/supabase';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { data: posts } = await supabaseAdmin
    .from('blog_posts')
    .select('slug, published_at, updated_at')
    .order('published_at', { ascending: false });

  const base = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://example.com';

  return [
    { url: base, lastModified: new Date() },
    ...(posts ?? []).map((p) => ({
      url: `${base}/${p.slug}`,
      lastModified: p.updated_at ?? p.published_at,
    })),
  ];
}
