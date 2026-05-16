import type { Signal, SignalSource } from './types';

export const ahrefsSource: SignalSource = {
  name: 'ahrefs',
  enabled: Boolean(process.env.AHREFS_API_KEY),
  async fetch(): Promise<Signal[]> {
    // STUB: pulls content gap from Ahrefs API.
    // Returns [] until you add AHREFS_API_KEY and implement the API call.
    //
    // Implementation hint: hit Ahrefs' content-gap endpoint with your target
    // domain plus a list of competitor domains, then map each keyword row
    // to a Signal.
    return [];
  },
};
