import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(request: Request) {
  const auth = request.headers.get('authorization');
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  // STUB: Pull the last 90 days from GA4 Data API.
  // Implementation hint:
  //   import { BetaAnalyticsDataClient } from '@google-analytics/data';
  //   const analytics = new BetaAnalyticsDataClient({ credentials: {...} });
  //   const [response] = await analytics.runReport({
  //     property: `properties/${process.env.GA4_PROPERTY_ID}`,
  //     dimensions: [{ name: 'landingPage' }],
  //     metrics: [{ name: 'sessions' }, { name: 'conversions' }, { name: 'averageSessionDuration' }],
  //     dateRanges: [{ startDate: '90daysAgo', endDate: 'today' }],
  //   });
  const rows: Array<{
    landing_page: string;
    sessions: number;
    signups: number;
    avg_engagement_sec: number;
  }> = [];

  if (rows.length === 0) {
    return NextResponse.json({ ok: true, upserted: 0, note: 'stub — wire up GA4 API' });
  }

  const { error } = await supabaseAdmin.from('content_metrics').upsert(
    rows.map((r) => ({ ...r, pulled_at: new Date().toISOString() })),
    { onConflict: 'landing_page' }
  );

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, upserted: rows.length });
}
