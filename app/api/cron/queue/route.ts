import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { gatherAllSignals } from '@/lib/signals';
import { scoreSignal, priorityFromScore } from '@/lib/topic-scoring';

function normalizeTitle(t: string): string {
  return t.toLowerCase().replace(/[^\w\s]/g, '').replace(/\s+/g, ' ').trim();
}

export async function GET(request: Request) {
  const auth = request.headers.get('authorization');
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  // Queue-depth check: don't double-fill.
  const { count } = await supabaseAdmin
    .from('content_ideas')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'idea');

  if ((count ?? 0) >= 3) {
    return NextResponse.json({ ok: true, skipped: true, queue_depth: count });
  }

  const signals = await gatherAllSignals();
  const scored = signals.map(scoreSignal).filter((s) => s.score >= 5);

  // Dedupe by normalized title.
  const seen = new Set<string>();
  const deduped = scored.filter((s) => {
    const key = normalizeTitle(s.title);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  // Take the top N for today.
  const topN = deduped.sort((a, b) => b.score - a.score).slice(0, 3);

  const rows = topN.map((s) => ({
    title: s.title,
    description: JSON.stringify({
      breakdown: s.breakdown,
      total_score: s.score,
      metadata: s.metadata,
    }),
    status: 'idea',
    priority: priorityFromScore(s.score),
    source: s.source,
  }));

  if (rows.length === 0) {
    return NextResponse.json({ ok: true, inserted: 0, candidates: signals.length });
  }

  const { error } = await supabaseAdmin.from('content_ideas').insert(rows);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, inserted: rows.length });
}
