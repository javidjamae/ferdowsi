import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(request: Request) {
  const auth = request.headers.get('authorization');
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  // STUB: Pull the last 90 days from Google Search Console.
  // Implementation hint:
  //   import { google } from 'googleapis';
  //   const sc = google.searchconsole({ version: 'v1', auth: jwt });
  //   const res = await sc.searchanalytics.query({
  //     siteUrl: process.env.GSC_SITE_URL,
  //     requestBody: {
  //       startDate, endDate, dimensions: ['query', 'page'], rowLimit: 25000,
  //     },
  //   });
  //   const rows = res.data.rows ?? [];
  const rows: Array<{
    query: string;
    page: string;
    impressions: number;
    clicks: number;
    ctr: number;
    position: number;
  }> = [];

  if (rows.length === 0) {
    return NextResponse.json({ ok: true, upserted: 0, note: 'stub — wire up GSC API' });
  }

  const { error } = await supabaseAdmin.from('analytics_search_console').upsert(
    rows.map((r) => ({ ...r, pulled_at: new Date().toISOString() })),
    { onConflict: 'query' }
  );

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, upserted: rows.length });
}
