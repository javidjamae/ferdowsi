import type { Signal, SignalSource } from './types';
import { supabaseAdmin } from '@/lib/supabase';

export const gscSource: SignalSource = {
  name: 'gsc',
  enabled: true,
  async fetch(): Promise<Signal[]> {
    const { data, error } = await supabaseAdmin
      .from('analytics_search_console')
      .select('query, page, impressions, clicks, position')
      .gt('impressions', 100)
      .lt('clicks', 5)
      .order('impressions', { ascending: false })
      .limit(50);

    if (error) throw error;
    if (!data) return [];

    return data.map((row) => ({
      title: row.query,
      raw_query: row.query,
      source: 'gsc',
      metadata: {
        impressions: row.impressions,
        clicks: row.clicks,
        position: row.position,
        page: row.page,
      },
    }));
  },
};
