import type { Signal, SignalSource } from './types';

const SUBREDDITS: string[] = [
  // Add target subreddits here, e.g. 'n8n', 'selfhosted'
];

export const redditSource: SignalSource = {
  name: 'reddit',
  enabled: Boolean(process.env.REDDIT_CLIENT_ID) && SUBREDDITS.length > 0,
  async fetch(): Promise<Signal[]> {
    // STUB: hits Reddit's search API for question-shaped posts in configured subreddits.
    // Returns [] until you configure SUBREDDITS and add REDDIT_CLIENT_ID + REDDIT_CLIENT_SECRET.
    //
    // Implementation hint: authenticate with Reddit OAuth, then for each subreddit
    // pull /new and filter to titles ending in '?' or starting with 'How', 'Why',
    // 'What'. Map each post title to a Signal.
    return [];
  },
};
