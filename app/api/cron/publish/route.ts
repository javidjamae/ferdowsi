import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(request: Request) {
  const auth = request.headers.get('authorization');
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const { data: approved, error } = await supabaseAdmin
    .from('content_ideas')
    .select('*')
    .eq('status', 'approved')
    .order('priority', { ascending: true })
    .limit(10);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const published: number[] = [];

  for (const row of approved ?? []) {
    const { error: insertError } = await supabaseAdmin.from('blog_posts').insert({
      content_idea_id: row.id,
      slug: row.slug,
      title: row.title,
      body_markdown: row.body,
      hero_image_url: row.image_url,
      tags: row.tags,
      related_slugs: row.related_posts,
    });

    if (insertError) continue;

    await supabaseAdmin
      .from('content_ideas')
      .update({
        status: 'published',
        published_url: `/${row.slug}`,
        updated_at: new Date().toISOString(),
      })
      .eq('id', row.id);

    revalidatePath(`/${row.slug}`);
    revalidatePath('/');
    published.push(row.id);
  }

  return NextResponse.json({ ok: true, published });
}
