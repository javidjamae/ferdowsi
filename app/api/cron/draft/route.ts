import { NextResponse } from 'next/server';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import Anthropic from '@anthropic-ai/sdk';
import { supabaseAdmin } from '@/lib/supabase';
import { humanize } from '@/lib/humanizer';
import { generateImage } from '@/lib/image-gen';

function slugify(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 80);
}

async function loadContextFiles(): Promise<string> {
  const root = process.cwd();
  const strategy = await readFile(path.join(root, 'strategy/STRATEGY.md'), 'utf8').catch(() => '');
  const reader = await readFile(path.join(root, 'strategy/READER.md'), 'utf8').catch(() => '');
  const skill = await readFile(path.join(root, 'skills/write-blog-post/SKILL.md'), 'utf8');
  return [reader, strategy, skill].filter(Boolean).join('\n\n---\n\n');
}

export async function GET(request: Request) {
  const auth = request.headers.get('authorization');
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  // Claim the next idea row atomically.
  const { data: claimed, error: claimError } = await supabaseAdmin.rpc(
    'claim_next_idea'
  );

  if (claimError || !claimed || claimed.length === 0) {
    return NextResponse.json({ ok: true, claimed: false });
  }

  const row = claimed[0];

  try {
    const context = await loadContextFiles();
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

    const response = await client.messages.create({
      model: 'claude-opus-4-7',
      max_tokens: 4096,
      temperature: 0.7,
      messages: [
        {
          role: 'user',
          content: `${context}\n\n---\n\nTopic: ${row.title}\nContext: ${row.description ?? ''}\n\nWrite the post.`,
        },
      ],
    });

    const draft = response.content
      .filter((b) => b.type === 'text')
      .map((b) => (b as { type: 'text'; text: string }).text)
      .join('');

    const humanized = await humanize(draft, 'standard');
    const slug = slugify(row.title);

    let imageUrl: string | null = null;
    try {
      imageUrl = await generateImage({ prompt: row.title, slug });
    } catch (err) {
      // Image gen is non-fatal in the scaffold. Draft still parks for review.
      console.error('image-gen failed', err);
    }

    const { error: updateError } = await supabaseAdmin
      .from('content_ideas')
      .update({
        body: humanized,
        slug,
        image_url: imageUrl,
        status: 'ready_for_review',
        updated_at: new Date().toISOString(),
      })
      .eq('id', row.id);

    if (updateError) throw updateError;

    return NextResponse.json({ ok: true, id: row.id, slug });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    await supabaseAdmin
      .from('content_ideas')
      .update({ status: 'idea', notes: msg })
      .eq('id', row.id);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
