import type { Signal, SignalSource } from './types';

export const spyfuSource: SignalSource = {
  name: 'spyfu',
  enabled: Boolean(process.env.SPYFU_API_KEY),
  async fetch(): Promise<Signal[]> {
    // STUB: pulls competitor keyword gap from SpyFu's API.
    // Returns [] until you add SPYFU_API_KEY and implement the API call.
    //
    // Implementation hint:
    //   const res = await fetch('https://api.spyfu.com/...', {
    //     headers: { Authorization: `Bearer ${process.env.SPYFU_API_KEY}` },
    //   });
    //   const json = await res.json();
    //   return json.results.map((r) => ({ title: r.keyword, source: 'spyfu', metadata: r }));
    return [];
  },
};
