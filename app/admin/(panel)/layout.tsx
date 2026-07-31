import Link from 'next/link';
import { query } from '@/lib/db';
import { PromoSlot } from '@/components/PromoSlot';

// The sidebar mirrors the managed product's dashboard one-to-one. Live tabs
// are implemented here; locked tabs are honest placeholders that show what
// that screen does in the managed version and what you'd build there yourself.

const NAV: Array<{ name: string; href: string; locked?: boolean }> = [
  { name: 'Overview', href: '/admin' },
  { name: 'Ideas', href: '/admin/ideas' },
  { name: 'Drafts', href: '/admin/drafts' },
  { name: 'Posts', href: '/admin/posts' },
  { name: 'Analytics', href: '/admin/analytics', locked: true },
  { name: 'Runs', href: '/admin/runs' },
  { name: 'Activity', href: '/admin/activity', locked: true },
  { name: 'Configuration', href: '/admin/configuration', locked: true },
  { name: 'Settings', href: '/admin/settings', locked: true },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  let reviewCount = 0;
  try {
    const [row] = await query<{ count: string }>(
      `SELECT COUNT(*) AS count FROM content_ideas WHERE status = 'ready_for_review'`
    );
    reviewCount = parseInt(row.count, 10);
  } catch {
    // no DB yet (first boot before migrations) — render the shell anyway
  }

  return (
    <div className="min-h-screen flex bg-gray-50">
      <aside className="w-56 shrink-0 border-r bg-white flex flex-col">
        <div className="px-4 py-4 border-b">
          <Link href="/admin" className="font-bold">
            Ferdowsi
          </Link>
          <div className="text-xs text-gray-500">automated blog</div>
        </div>
        <nav className="flex-1 py-2">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center justify-between px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              <span>
                {item.name}
                {item.name === 'Drafts' && reviewCount > 0 && (
                  <span className="ml-2 inline-block rounded-full bg-black text-white text-xs px-2">
                    {reviewCount}
                  </span>
                )}
              </span>
              {item.locked && <span aria-hidden className="text-gray-400">○</span>}
            </Link>
          ))}
        </nav>
        <div className="px-4 py-3 border-t text-xs text-gray-500">
          <Link href="/" className="hover:text-gray-900">
            View blog
          </Link>
        </div>
      </aside>
      <div className="flex-1 flex flex-col min-w-0">
        <main className="flex-1 p-6">{children}</main>
        <footer className="px-6 pb-4">
          <PromoSlot placement="global-footer" />
        </footer>
      </div>
    </div>
  );
}
