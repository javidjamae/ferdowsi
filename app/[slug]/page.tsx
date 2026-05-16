import { notFound } from 'next/navigation';
import { supabaseAdmin } from '@/lib/supabase';

export const revalidate = 3600;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { data: post } = await supabaseAdmin
    .from('blog_posts')
    .select('title, meta_description, hero_image_url')
    .eq('slug', slug)
    .single();

  if (!post) return {};

  return {
    title: post.title,
    description: post.meta_description,
    openGraph: {
      title: post.title,
      description: post.meta_description,
      images: post.hero_image_url ? [post.hero_image_url] : [],
    },
  };
}

export default async function PostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { data: post } = await supabaseAdmin
    .from('blog_posts')
    .select('*')
    .eq('slug', slug)
    .single();

  if (!post) notFound();

  return (
    <article className="mx-auto max-w-3xl px-4 py-12 prose">
      <h1>{post.title}</h1>
      {post.hero_image_url && (
        <img src={post.hero_image_url} alt={post.title} className="w-full rounded" />
      )}
      <div dangerouslySetInnerHTML={{ __html: post.body_html ?? post.body_markdown }} />
    </article>
  );
}
