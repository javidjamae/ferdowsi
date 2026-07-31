import { query } from '@/lib/db';

export const revalidate = 3600;

// The GEO route (guide: Move 3): every post has a markdown twin for AI
// crawlers. The canonical Link header tells Google the HTML page is the
// original — do NOT remove it; it's what makes dual-publishing safe.
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const [post] = await query<{ title: string; body_markdown: string; published_at: string }>(
    `SELECT title, body_markdown, published_at FROM blog_posts WHERE slug = $1`,
    [slug]
  );

  if (!post) {
    return new Response('not found', { status: 404 });
  }

  const base = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://example.com';
  const body = `# ${post.title}\n\nPublished: ${post.published_at}\n\n${post.body_markdown}`;

  return new Response(body, {
    headers: {
      'Content-Type': 'text/markdown; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
      Link: `<${base}/${slug}>; rel="canonical"`,
    },
  });
}
