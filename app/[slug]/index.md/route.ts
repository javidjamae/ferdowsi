import { supabaseAdmin } from '@/lib/supabase';

export const revalidate = 3600;

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const { data: post } = await supabaseAdmin
    .from('blog_posts')
    .select('title, body_markdown, published_at')
    .eq('slug', slug)
    .single();

  if (!post) {
    return new Response('not found', { status: 404 });
  }

  const body = `# ${post.title}\n\nPublished: ${post.published_at}\n\n${post.body_markdown}`;

  return new Response(body, {
    headers: {
      'Content-Type': 'text/markdown; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
