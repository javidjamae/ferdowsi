import type { SignalSource } from './types';
import { gscSource } from './gsc';
import { gaGapSource } from './ga-gap';
import { spyfuSource } from './spyfu';
import { ahrefsSource } from './ahrefs';
import { competitorScraperSource } from './competitor-scraper';
import { redditSource } from './reddit';
import { skoolSource } from './skool';

export const signalSources: SignalSource[] = [
  gscSource,
  gaGapSource,
  spyfuSource,
  ahrefsSource,
  competitorScraperSource,
  redditSource,
  skoolSource,
];

export async function gatherAllSignals() {
  const enabled = signalSources.filter((s) => s.enabled);
  const results = await Promise.all(enabled.map((s) => s.fetch()));
  return results.flat();
}
