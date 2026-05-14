import type { Signal, SignalSource } from './types';
import { supabaseAdmin } from '@/lib/supabase';

export const gaGapSource: SignalSource = {
  name: 'ga-gap',
  enabled: true,
  async fetch(): Promise<Signal[]> {
    const { data, error } = await supabaseAdmin
      .from('content_metrics')
      .select('landing_page, sessions, signups, avg_engagement_sec')
      .gt('sessions', 200)
      .order('sessions', { ascending: false })
      .limit(30);

    if (error) throw error;
    if (!data) return [];

    return data
      .filter((row) => {
        const conversionRate = row.signups / Math.max(row.sessions, 1);
        return conversionRate < 0.02;
      })
      .map((row) => ({
        title: `Rewrite candidate: ${row.landing_page}`,
        source: 'ga-gap',
        metadata: {
          landing_page: row.landing_page,
          sessions: row.sessions,
          signups: row.signups,
          avg_engagement_sec: row.avg_engagement_sec,
        },
      }));
  },
};
