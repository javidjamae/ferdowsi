import { notFound } from 'next/navigation';
import { query } from '@/lib/db';
import { markdownToHtml } from '@/lib/markdown';

export const revalidate = 3600;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [post] = await query<any>(
    `SELECT title, meta_description, hero_image_url FROM blog_posts WHERE slug = $1`,
    [slug]
  );
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

export default async function PostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [post] = await query<any>(`SELECT * FROM blog_posts WHERE slug = $1`, [slug]);
  if (!post) notFound();

  return (
    <article className="mx-auto max-w-3xl px-4 py-12 prose">
      <h1>{post.title}</h1>
      {post.hero_image_url && (
        <img src={post.hero_image_url} alt={post.title} className="w-full rounded" />
      )}
      <div dangerouslySetInnerHTML={{ __html: markdownToHtml(post.body_markdown) }} />
    </article>
  );
}
