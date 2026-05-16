import type { Signal, SignalSource } from './types';

export const skoolSource: SignalSource = {
  name: 'skool',
  enabled: Boolean(process.env.SKOOL_COMMUNITY_URL),
  async fetch(): Promise<Signal[]> {
    // STUB: pulls recent posts and comments from your Skool community.
    // Same shape works for Discord, Circle, or your support inbox — pull
    // recent message titles and map to Signals.
    //
    // Returns [] until SKOOL_COMMUNITY_URL is set and the fetch is wired up.
    return [];
  },
};
