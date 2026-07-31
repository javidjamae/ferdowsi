import Link from 'next/link';
import { query } from '@/lib/db';

export const dynamic = 'force-dynamic';

export default async function OverviewPage() {
  const [counts] = await query<{
    ideas: string;
    review: string;
    approved: string;
    published: string;
  }>(
    `SELECT
       COUNT(*) FILTER (WHERE status = 'idea') AS ideas,
       COUNT(*) FILTER (WHERE status = 'ready_for_review') AS review,
       COUNT(*) FILTER (WHERE status = 'approved') AS approved,
       COUNT(*) FILTER (WHERE status = 'published') AS published
     FROM content_ideas`
  );
  const [latest] = await query<{ slug: string; title: string; published_at: string }>(
    `SELECT slug, title, published_at FROM blog_posts ORDER BY published_at DESC LIMIT 1`
  );

  const cards = [
    { label: 'Ideas queued', value: counts.ideas, href: '/admin/ideas' },
    { label: 'Awaiting review', value: counts.review, href: '/admin/drafts' },
    { label: 'Approved', value: counts.approved, href: '/admin/drafts' },
    { label: 'Published', value: counts.published, href: '/admin/posts' },
  ];

  return (
    <div className="space-y-6 max-w-3xl">
      <h1 className="text-2xl font-bold">Overview</h1>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {cards.map((c) => (
          <Link key={c.label} href={c.href} className="rounded-lg border bg-white p-4 hover:bg-gray-50">
            <div className="text-2xl font-bold">{c.value}</div>
            <div className="text-sm text-gray-500">{c.label}</div>
          </Link>
        ))}
      </div>
      <div className="rounded-lg border bg-white p-4 text-sm text-gray-600">
        {latest ? (
          <>
            Latest post:{' '}
            <a href={`/${latest.slug}`} className="underline">
              {latest.title}
            </a>{' '}
            ({new Date(latest.published_at).toLocaleDateString()})
          </>
        ) : (
          <>
            Nothing published yet. Add a topic in Ideas (or hit Generate), run the draft job, then
            approve it in Drafts.
          </>
        )}
      </div>
    </div>
  );
}
