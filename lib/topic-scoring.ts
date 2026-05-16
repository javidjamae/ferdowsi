import type { Signal } from './signals/types';

export interface ScoredSignal extends Signal {
  score: number;
  breakdown: {
    gsc_evidence: number;
    conversion_intent: number;
    competition_gap: number;
  };
}

// Three-axis scoring rubric. Tune the weights and thresholds for your business.
// See course Section 03 for the rationale.
export function scoreSignal(signal: Signal): ScoredSignal {
  const breakdown = {
    gsc_evidence: scoreGscEvidence(signal),
    conversion_intent: scoreConversionIntent(signal),
    competition_gap: scoreCompetitionGap(signal),
  };

  const score =
    breakdown.gsc_evidence +
    breakdown.conversion_intent +
    breakdown.competition_gap;

  return { ...signal, score, breakdown };
}

function scoreGscEvidence(signal: Signal): number {
  // 0-4 points based on whether we have GSC impressions for this topic.
  if (signal.source === 'gsc') return 4;
  if (signal.source === 'ga-gap') return 3;
  if (signal.source === 'spyfu' || signal.source === 'ahrefs') return 2;
  if (signal.source === 'reddit' || signal.source === 'skool') return 1;
  return 0;
}

function scoreConversionIntent(_signal: Signal): number {
  // 0-3 points. Cross-check against STRATEGY.md Problem statements.
  // The scaffold returns a default 1. Override this with your own logic
  // once you've calibrated against attributed signups.
  return 1;
}

function scoreCompetitionGap(_signal: Signal): number {
  // 0-3 points. Cross-check against SERP for the target query.
  // The scaffold returns a default 1.
  return 1;
}

export function priorityFromScore(score: number): number {
  if (score >= 8) return 1;
  if (score >= 6) return 2;
  return 3;
}
